import * as dgram from "dgram";
import {UdpSocket, UdpSocketFactory} from "../code/UdpSocket";
import {Utils} from "./Utils";

export class UdpSocketRouterSimulator implements UdpSocket {
    private _socket: dgram.Socket;
    private _originalPort: number;
    // holds all ports that were contacted
    private _punchMap: Map<number, boolean>; // key is target port number; value is whether port was
        // punched and will accept incoming requests
    private _listener: (msg: Buffer, rinfo: dgram.AddressInfo) => void;

    public constructor() {
        this._socket = dgram.createSocket("udp4");
        this._socket.on("message", (msg: Buffer, rinfo: dgram.AddressInfo) => {
            if (this._punchMap.has(rinfo.port)) {
                this._listener(msg, rinfo);
            } else {
                // do not respond. this will simulate a router's response to a UDP request
                // when no hole had been punched
                // TODO: remove
                //this._listener(new Buffer("error!!!"), rinfo);
            }
        });
        this._punchMap = new Map();
    }

    send(msg: Buffer | String | any[], port: number, address: string, callback?: (error: Error, bytes: number) => void): void {
        this._socket.send(msg, port, address, (error: Error, bytes: number) => {
            // we get here if the request was indeed sent
            if (!error) {
                // punch the hole: mark that a request was sent to allow incoming traffic on this port
                this._punchMap.set(port, true);
                console.log(`a hole was punched from port ${port} to router port ${this._socket.address().port} (original port ${this._originalPort})`);
            }

            if (callback) {
                callback(error, bytes);
            }
        });
    }

    bind(port?: number, address?: string, callback?: () => void): void {
        this._originalPort = port;
        let routerPort = Utils.generateRandomPort(34000, 35999);
        console.log(`router simulator: was requested to bind node port ${port} but bound router port ${routerPort} instead`);
        this._socket.bind(routerPort, address, callback);
    }

    close(callback?: any): void {
        this._socket.close(callback);
    }

    on(event: "message", listener: (msg: Buffer, rinfo: dgram.AddressInfo) => void): this {
        this._listener = listener;
        return this;
    }
}
