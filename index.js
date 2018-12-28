var express = require('express');
var app = express();
var port_number = process.env.PORT || 8080;

app.use(express.static(__dirname + '/public'));
app.get('/', function(request, response) {
    response.sendFile(__dirname + '/index.html');
});
app.listen(port_number);
console.log('listening on port ' + port_number)