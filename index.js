var express = require('express');
var app = express();
var path = require('path');

app.get('/', function(req, res){
	//res.send('Hello World!');
	console.log('Starting node app');
  	res.sendFile(__dirname + '/index.html');
});

app.use(express.static(path.join(__dirname, '/public')));
app.use('/public', express.static(path.join(__dirname,'/js')));
app.use('/js', express.static(path.join(__dirname,'/js')));
app.use('/lib', express.static(path.join(__dirname,'/lib')));
//app.use(express.static(path.join(__dirname, 'public/img')));
//app.use(express.static(path.join(__dirname, 'lib')));
//app.use(express.static(path.join(__dirname, 'js')));


//app.use('/js', express.static(path.join(__dirname,'js')));
//app.use(express.static('/js'));
//app.use(express.static(__dirname + '/js'));
//app.use('/static',express.static('js'));
//app.use('/js');
//app.get(express.static('js');

//io.on('connection', function(socket){
//  socket.on('chat message', function(msg){
//    io.emit('chat message', msg);
//  });
//});

app.listen(3000, function(){
  console.log('listening on *:3000');
});
