var static = require('node-static');
var http = require('http');
var fs = require('fs');

var file = new(static.Server)();
var app = http.createServer(function (req, res) {
  file.serve(req, res);
}).listen(2013, "0.0.0.0");
