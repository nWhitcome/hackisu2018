var express = require('express');
var app = express();

app.use(express.static(__dirname + '/public'));
app.get('/', function(request, response) {
    response.sendFile(__dirname + '/index.html');
});
app.listen(8080);
console.log('listening on port 8080')