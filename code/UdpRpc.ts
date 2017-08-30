import * as dgram from "dgram";
import {UdpSocketFactory, UdpSocket, UdpSocketNative} from "./UdpSocket";

/**
 * This is a UDP-based JSON-RPC 2.0 library for peer-to-peer
 * communications with support for ES6 promises
 * 
 * This library is compliant with the JSON-RPC 2.0 Specification http://www.jsonrpc.org/specification
 */

// TODO: Support batch requests and responses

// this is a JSON-RPC 2.0 compliant request
type UdpRpcRequest = { jsonrpc: string, method: string, params: Array<any>, id?: number };
// this is a JSON-RPC 2.0 compliant response
type UdpRpcResponse = { jsonrpc: string, error?: UdpRpcError, result: any, id: number };
// this is a JSON-RPC 2.0 compliant error object
type UdpRpcError = { code: number, message: string, data?: any };

type UdpRpcMessage = { message_type: string, body: UdpRpcRequest | UdpRpcResponse };
export type UdpRpcRegistration = (method: string, params: Array<any>, address: string, port: number, resolve, reject) => void;

const _REQUEST: string = "request";
const _RESPONSE: string = "response";
const _JSONRPC_VERSION: string = "2.0";

export const _JSONRPC_ERR_PARSE: number = -32700;
export const _JSONRPC_ERR_INVALID_REQUEST: number = -32600;
export const _JSONRPC_ERR_METHOD_NOT_FOUND: number = -32601;
export const _JSONRPC_ERR_INVALID_PARAMS: number = -32602;
export const _JSONRPC_ERR_INTERNAL: number = -32603;
export const _INTERNAL_ERR_TIMEOUT_CODE: number = 3;
export const _INTERNAL_ERR_RETRIES_TIMEOUT_CODE: number = 4;

export class UdpRpc {
    private static _lastId: number = 0;
    private _udpSocket: UdpSocket;
    private _port: number;
    private _registration: UdpRpcRegistration;
    private _resolveRejectMap: Map<number, any>;
    private _udpRpcRetriesTimeout: number = 150;
    private _udpRpcTimeout: number = 40;

    // TODO: do not get the port here, get it when calling bind
    public constructor(port: number, udpSocketClass?: { new(): UdpSocket }) {
        if (process.env.udpRpcRetriesTimeout) {
            this._udpRpcRetriesTimeout = Number(process.env.udpRpcRetriesTimeout);
        }

        if (process.env.udpRpcTimeout) {
            this._udpRpcTimeout = Number(process.env.udpRpcTimeout);
        }

        this._port = port;
        // currently supports IPv4
        // TODO: support IPv6
        if (!udpSocketClass) {
            // default is native
            udpSocketClass = UdpSocketNative;
        }
        this._udpSocket = UdpSocketFactory.createSocket(udpSocketClass);
        
        this._resolveRejectMap = new Map();

        this._udpSocket.on("message", (msg: Buffer, rinfo: dgram.AddressInfo) => {
            let internalResponseReceived: UdpRpcMessage = JSON.parse(msg.toString());
            switch (internalResponseReceived.message_type) {
                case _RESPONSE: {
                    let response: UdpRpcResponse = internalResponseReceived.body as UdpRpcResponse;
                    let resolveReject: any = this._resolveRejectMap.get(response.id);
                    if (resolveReject) {
                        if (response.error) {
                            resolveReject.reject(response.result);
                        } else {
                            resolveReject.resolve(response.result);
                        }
                        this._resolveRejectMap.delete(response.id);
                    } else {
                        console.error(`UdpRpc error: Received a response, but found no matching task id ${response.id}`);
                    }
                    break;
                }
                case _REQUEST: {
                    let request: UdpRpcRequest = internalResponseReceived.body as UdpRpcRequest;
                    let id: number = request.id;
                    if (id === undefined) { // this is a JSON-RPC 2.0 notification -- no response is expected
                        this._registration(request.method, request.params, rinfo.address, rinfo.port, () => {}, () => {});
                    } else { // this is a JSON-RPC 2.0 request
                        new Promise((resolve, reject) => {
                            this._registration(request.method, request.params, rinfo.address, rinfo.port, resolve, reject);
                        }).then((response: any) => {
                            let responseInternal: UdpRpcResponse = {
                                jsonrpc: _JSONRPC_VERSION,
                                result: response,
                                id: id
                            };
                            let internalMessage: UdpRpcMessage = {
                                message_type: _RESPONSE,
                                body: responseInternal
                            };
                            this._udpSocket.send(JSON.stringify(internalMessage), rinfo.port, rinfo.address);
                        }).catch((err) => {
                            let responseInternal: UdpRpcResponse = {
                                jsonrpc: _JSONRPC_VERSION,
                                error: { code: _JSONRPC_ERR_INTERNAL, message: err.message },
                                result: err,
                                id: id
                            };
                            let internalMessage: UdpRpcMessage = {
                                message_type: _RESPONSE,
                                body: responseInternal
                            };
                            this._udpSocket.send(JSON.stringify(internalMessage), rinfo.port, rinfo.address);
                        });
                    }
                    break;
                }
            }
        });
    }

    private static getId(): number {
        return this._lastId++;
    }

    public start(): void {
        // the "bind" declares that the node listens to this port and also
        // sends its requests using this port. 
        this._udpSocket.bind(this._port);
    }

    public stop(): Promise<any> {
        return  new Promise((resolve, reject) => {
            try {
                this._udpSocket.close();
            } catch (err) {
                if (err.message === "Not running") {
                    resolve();
                    return;
                } else {
                    reject(err);
                    return;
                }
            } 
            resolve();
        });
    }

    public send(method: string, params: Array<any>, address: string, port: number): Promise<any> {
        // TODO: Add more tries without returning the promise, up to a certain point
        let promise: Promise<any> = this._doSend(method, params, address, port).then((response: any) => {
            return response;
        }).catch((err: UdpRpcError) => {
            if (err.code === _INTERNAL_ERR_TIMEOUT_CODE) {
                return this.send(method, params, address, port);
            } else {
                throw err;
            }
        });

        let timeout = new Promise((resolve, reject) => {
            let id = setTimeout(() => {
                clearTimeout(id);
                reject({ code: _INTERNAL_ERR_RETRIES_TIMEOUT_CODE, message: `Promises timed out in ${this._udpRpcRetriesTimeout} ms.`, data: null });
            }, this._udpRpcRetriesTimeout);
        });

        // Returns a race between our timeout and the passed in promise
        return Promise.race([
            promise,
            timeout
        ]);
    }

    // Here the method to handle all requests is provided
    public register(registration: UdpRpcRegistration): void {
        this._registration = registration;
    }

    private _doSend(method: string, params: Array<any>, address: string, port: number): Promise<any> {
        let promise: Promise<any> = new Promise((resolve, reject) => {
            let id: number = UdpRpc.getId();
            let internalMessage: UdpRpcMessage = { message_type: _REQUEST, body: { jsonrpc: _JSONRPC_VERSION, method: method, params: params, id: id }};
            return new Promise((resolve2, reject2) => {
                // this request will be resolved in the "onMessage" method
                this._udpSocket.send(JSON.stringify(internalMessage), port, address, (err) => {
                    if (err) {
                        reject2(err);
                    } else {
                        this._resolveRejectMap.set(id, { resolve: resolve, reject: reject });
                        resolve2();
                    }
                });
            });
        });

        let timeout = new Promise((resolve, reject) => {
            let id = setTimeout(() => {
                clearTimeout(id);
                reject({ code: _INTERNAL_ERR_TIMEOUT_CODE, message: `Promise timed out in ${this._udpRpcTimeout} ms.`, data: null });
            }, this._udpRpcTimeout);
        });

        // Returns a race between our timeout and the passed in promise
        return Promise.race([
            promise,
            timeout
        ]);
    }
}
