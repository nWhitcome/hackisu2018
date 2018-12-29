var port = process.env.PORT || 3000;
var http = require('http');
var express = require('express');
var app = express();

app.use(express.static(__dirname + '/public'));
app.get('/', function(request, response) {
    response.sendFile(__dirname + '/index.html');
});

var httpServer = http.createServer(app);
httpServer.listen(port);
console.log('listening on port ' + port)