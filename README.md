[![Build Status](https://travis-ci.org/perspectivus1/udprpc.svg?branch=master)](https://travis-ci.org/perspectivus1/udprpc)

# README #

# UdpRpc #
This is a UDP-based JSON-RPC 2.0 library for peer-to-peer communications with support for ES6 promises.

This library is (nearly) compliant with the JSON-RPC 2.0 Specification http://www.jsonrpc.org/specification.

Missing: Support JSON-RPC batch requests and reponses.

## Prerequisites
Install dependencies:
```
npm install
```
## Development Environment
The code, including tests, is written in TypeScript. The source files are located in the ```code``` folder. The tests and related files are located in the ```tests``` folder.

The transpiled JavaScript code retains the above structure but resides in the ```dist``` folder.

We use npm and Grunt to build the code and run tests. Mocha is our test framework.
### Build Process
* Linting the code
* Transpiling code from TypeScript to JavaScript.

Run this command to start the build process:
```npm run build```
### Test Process
* Running tests
* Checking code coverage

Run these commands to execute the tests and coverage respectively: ```npm test``` and ```npm run coverage```

This runs all the tests that reside in the ```dist/tests``` folder.
### Contribution guidelines ###
Never lower the code coverage thresholds specified in the Gruntfile.

### Who do I talk to? ###
* perspectivus@gmail.com
* lutraki@gmail.com
