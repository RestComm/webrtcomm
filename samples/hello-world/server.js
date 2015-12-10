var static = require('node-static');
var http = require('https');
var fs = require('fs');

var options = {
  key: fs.readFileSync('key.pem'),
  cert: fs.readFileSync('cert.pem')
};

var file = new(static.Server)();
var app = http.createServer(options, function (req, res) {
  file.serve(req, res);
}).listen(2013);
