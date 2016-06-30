var app = require('express')();
var http = require('http').Server(app);
var io = require('socket.io')(http);

app.get('/', function(req, res){
  res.sendFile(__dirname + '/index.html');
});

//app.use('/js', express.static(path.join(__dirname,'js')));
//app.use(express.static('/js'));
//app.use(express.static(__dirname + '/js'));
//app.use('/static',express.static('js'));
app.use('/js');
//app.get(express.static('js');

io.on('connection', function(socket){
  socket.on('chat message', function(msg){
    io.emit('chat message', msg);
  });
});

http.listen(3000, function(){
  console.log('listening on *:3000');
});