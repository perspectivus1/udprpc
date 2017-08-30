[![Build Status](https://travis-ci.org/perspectivus1/udprpc.svg?branch=master)](https://travis-ci.org/perspectivus1/udprpc)

# UdpRpc #
This is a UDP-based JSON-RPC 2.0 library with support for ES6 promises. One common use-case would be for for peer-to-peer communications.

This library is (nearly) compliant with the JSON-RPC 2.0 Specification at [http://www.jsonrpc.org/specification](http://www.jsonrpc.org/specification).

Missing: Support JSON-RPC batch requests and reponses (see [Contribution](#contribution) section below).

## Installation ##
```bash
npm install @gobark/udprpc
```

## Usage ##
UdpRpc leverages UDP to enable each peer listen to and send requests on the same port.

Even through all peers can send and receive requests -- for the sake of simplicity -- **in the example** below the "cient" sends requests and the "server" receives them.

Also note that different peers can reside on different hosts. In the example below, we assume that both peers are on localhost.

### Server ###
```javascript
// import UdpRpc
const UdpRpc = require("@gobark/udprpc").UdpRpc;
// create a new instance of UdpRpc
let udpRpcServer = new UdpRpc(3000); // can be any port
// start listening
udpRpcServer.start();
// handle incoming requests
udpRpcServer.register((method, params, address, port, resolve, reject) => {
    switch (method) {
        case "sum": {
            if (isNaN(params[0]) || isNaN(params[1])) {
                reject("Parameters must be numbers");
            } else {
                resolve(Number(params[0]) + Number(params[1]));
            }
            break;
        }
        case "concat": {
            resolve(`${params[0]}${params[1]}`);
            break;
        }
    }

    // stop server when needed
    // udpRpcServer.stop();
});
```
### Client ###
```javascript
// import UdpRpc
const UdpRpc = require("@gobark/udprpc").UdpRpc;
// create a new instance of UdpRpc
let udpRpcClient = new UdpRpc(3001);
// start listening
udpRpcClient.start();
return udpRpcClient.send("sum", [ 1, 2 ], "127.0.0.1", 3000).then((response) => {
    // the server can be any address and port as long as their accessible to the client
    console.log(response); // response === 3
}).catch((err) => {
    console.error(err);
}).then(() => {
    // stop client
    udpRpcClient.stop();
});
```

## Contribution ##
### Feature requests ###
* Support JSON-RPC [batch](http://www.jsonrpc.org/specification#batch) requests and reponses
* Implement secure UDP communications ([DTLS](https://en.wikipedia.org/wiki/Datagram_Transport_Layer_Security))
* Support IPv6
### Modifying this package ###

[See CONTRIBUTING.md](./CONTRIBUTING.md)

## Who do I talk to? ##
* perspectivus@gmail.com
* lutraki@gmail.com
