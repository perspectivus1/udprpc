import * as dgram from "dgram";

export interface UdpSocket {
    send(msg: Buffer | String | any[], port: number, address: string, callback?: (error: Error, bytes: number) => void): void;
    bind(port?: number, address?: string, callback?: () => void): void;
    close(callback?: any): void;
    on(event: "message", listener: (msg: Buffer, rinfo: dgram.AddressInfo) => void): this;
}

// this class is the default native implementation
export class UdpSocketNative implements UdpSocket {
    private _socket: dgram.Socket;

    public constructor() {
        this._socket = dgram.createSocket("udp4");
    }

    send(msg: Buffer | String | any[], port: number, address: string, callback?: (error: Error, bytes: number) => void): void {
        this._socket.send(msg, port, address, callback);
    }

    bind(port?: number, address?: string, callback?: () => void): void {
        this._socket.bind(port, address, callback);
    }

    close(callback?: any): void {
        this._socket.close(callback);
    }

    on(event: "message", listener: (msg: Buffer, rinfo: dgram.AddressInfo) => void): this {
        this._socket.on(event, listener);
        return this;
    }
}

export class UdpSocketFactory {
    static createSocket(UdpSocketClass: { new(): UdpSocket }): UdpSocket {
        return new UdpSocketClass();
    }
}
