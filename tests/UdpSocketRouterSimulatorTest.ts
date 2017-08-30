import * as dgram from "dgram";
import "mocha";
import "unit.js";
import * as assert from "assert";
import {UdpSocket, UdpSocketNative, UdpSocketFactory} from "../code/UdpSocket";
import {UdpSocketRouterSimulator} from "./UdpSocketRouterSimulator";

describe("Udp Socket Router Simulator Test:", () => {
  before(() => {
    
  });

  /**
   * This test has 2 steps:
   *   1. a node socket sends a message to a server socket. The message is received because
   *      the server has no router (native). This part of the test asserts that the origin port 
   *      is the node's router's port (and not the node's port).
   *   2. the server socket sends a message to the node socket through its router. The message is received
   *      because the node's router punched a hole during the first phase of the test.
   */
  it("Test router simulation with registry and one node", (done) => {
    // create node that simulates the registry as a native UdpRpc
    let port: number = 3001;
    let registrySocket: UdpSocket = UdpSocketFactory.createSocket(UdpSocketNative);
    registrySocket.bind(3000);
    registrySocket.on("message", (msg: Buffer, rinfo: dgram.AddressInfo) => {
      assert(rinfo.port !== port);
      registrySocket.send("message2", rinfo.port, `127.0.0.1`, (error: Error, bytes: number) => {

      });
    });

    let node1Socket: UdpSocket = UdpSocketFactory.createSocket(UdpSocketRouterSimulator);
    node1Socket.bind(port);
    node1Socket.send("message1", 3000, `127.0.0.1`, () => {});
    node1Socket.on("message", (msg: Buffer, rinfo: dgram.AddressInfo) => {
      assert(true);
      done();      
    });
  });

  it("testing dependency injection map", () => {
    let dummyClazz: {new(): UdpSocket} = UdpSocketRouterSimulator;
    let aDummy = new dummyClazz();
    assert(aDummy instanceof UdpSocketRouterSimulator);
  });

  after(() => {

  });
});
