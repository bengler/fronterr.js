# Fronterr.js

The JavaScript companion to the [fronterr](https://github.com/bengler/fronterr) pebble

## Usage:

```js
var FrontErr = require("fronterr");
var pebbles = require("pebbles");
var services = new pebbles.service.ServiceSet({host: 'my.pebbles.host.org'}).use({
  fronterr: 1
});

var fronterr = new FrontErr({
  app: {
    name: 'my-app',
    version: '0.0.1'
  },
  airbrakeAPI: '2.3',
  environment: process.env.NODE_ENV,
  service: services.fronterr
});

fronterr.start();
```
