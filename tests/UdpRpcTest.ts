import * as url from "url";
import "mocha";
import "unit.js";
import * as assert from "assert";
import { UdpRpc, UdpRpcRegistration } from "../code/UdpRpc";
let _udpRpcServer: UdpRpc;

describe("Udp Rpc Test:", () => {
  before(() => {
    _udpRpcServer = new UdpRpc(3000);
    _udpRpcServer.start();
    // list of exposed methods
    _udpRpcServer.register((method: string, params: Array<any>, url: url.Url, resolve, reject) => {
      switch (method) {
        case "method1": {
          resolve(params[0].key1);
          break;
        }
        case "method2": {
          reject("error message");
          break;
        }
      }
    });
  });

  after(() => {
    return _udpRpcServer.stop();
  });

  it("Basic UdpRpc Test", () => {
    let _udpRpcClient: UdpRpc = new UdpRpc(3001);
    _udpRpcClient.start();
    return _udpRpcClient.send("method1", [{key1: "value1"}], url.parse(`http://127.0.0.1:3000`)).catch((err) => {
      return _udpRpcClient.stop();
    }).then((response: any) => {
      assert.ok(response === "value1");
      return _udpRpcClient.stop();
    });
  });

  it("UdpRpc Exception Test", () => {
    let _udpRpcClient: UdpRpc = new UdpRpc(3001);
    _udpRpcClient.start();
    return _udpRpcClient.send("method2", [{key1: "value1"}], url.parse(`http://127.0.0.1:3000`)).catch((err) => {
      assert.ok(true);
      return _udpRpcClient.stop();
    }).then(() => {
      return _udpRpcClient.stop();     
    });
  });
});
