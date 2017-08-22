[![Build Status](https://travis-ci.org/perspectivus1/udprpc.svg?branch=master)](https://travis-ci.org/perspectivus1/udprpc)

# UdpRpc #
This is a UDP-based JSON-RPC 2.0 library for peer-to-peer communications with support for ES6 promises.

This library is (nearly) compliant with the JSON-RPC 2.0 Specification http://www.jsonrpc.org/specification.

Missing: Support JSON-RPC batch requests and reponses.

## Installation ##
```
npm install @gobark/udprpc
```

## Usage ##
UdpRpc instance listens to the same port from which it executes requests.

### Server ###
```
const url = require("url");
// import UdpRpc
const UdpRpc = require("@gobark/udprpc").UdpRpc;
// create a new instance of UdpRpc
let udpRpcServer = new UdpRpc(3000);
// start listening
udpRpcServer.start();
// handle incoming requests
udpRpcServer.register((method, params, url, resolve, reject) => {
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
```
// import UdpRpc
const UdpRpc = require("UdpRpc");
// create a new instance of UdpRpc
let udpRpcClient = new UdpRpc(3001);
// start listening
udpRpcClient.start();
return udpRpcClient.send("sum", [ 1, 2 ], url.parse(`http://127.0.0.1:3000`)).then((response) => {
    console.log(response); // response === 3
}).catch((err) => {
    console.error(err);
}).then(() => {
    // stop client
    udpRpcClient.stop();
});
```

## Contribution guidelines ##
[See CONTRIBUTING.md](./CONTRIBUTING.md)

## Who do I talk to? ##
* perspectivus@gmail.com
* lutraki@gmail.com
