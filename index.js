var express = require('express');
var http = require('http');
var app = express();
//var http = require('http').Server(app);
//var io = require('socket.io').listen(http);
var path = require('path');

var server = http.createServer(app);
var io = require('socket.io').listen(server);

app.get('/', function(req, res){
	console.log("Starting node app");
  	res.sendFile(__dirname + '/index.html');
});

app.use(express.static(path.join(__dirname, '/public'))); //Add CSS
app.use('/js', express.static(path.join(__dirname,'/js'))); //Add controller, data
app.use('/lib', express.static(path.join(__dirname,'/lib'))); //Add Angular and socket?
//app.use('/node_modules', express.static(path.join(__dirname,'/node_modules'))); //Add socket?

io.on('connection', function(socket){
	console.log("io connected");
});
//	console.log("io server connected");
//	socket.on('chat message', function(msg){
//		io.emit('chat message', msg);
//   		console.log(ms)g;
//  });
//});

app.listen(3000, function(){
  console.log('listening on *:3000');
});
