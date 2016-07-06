var express = require('express');
var app = express();
//var socket = require(__dirname + '/socket.js');
var http = require('http').Server(app);
var io = require('socket.io')(http);
var path = require('path');

app.get('/', function(req, res){
  res.sendFile(__dirname + '/index.html');
});

app.use(express.static(path.join(__dirname, '/public'))); //Add CSS
app.use('/js', express.static(path.join(__dirname,'/js'))); //Add controller, data
app.use('/lib', express.static(path.join(__dirname,'/lib'))); //Add Angular and socket?

//Conect with socket.io
io.on('connection', function(socket){
	socket.on('chatmessage', function(msg){
		io.emit('chatmessage', msg);
	});
	socket.on('like', function(ideaName){
		io.emit('like', ideaName);
	});
});

//Connect with mongoDB
var MongoClient = require('mongodb').MongoClient;
var assert = require ('assert');
var url = 'mongodb://localhost:27017/test';


var insertDocument = function(db, callback) {
	$.getJSON("/public/data.json", function(data){
   	console.log(data);
   })
};

//Connect running mongoDB instance running on localhost port 27017 to test database
MongoClient.connect(url, function(err,db){
	assert.equal(null, err);
	console.log("Connected correctly to server.");
	insertDocument(db, function(){
		console.log("inserting data:");
		db.close();
	});
	//db.close();
}); 

http.listen(3000, function(){
  console.log('listening on *:3000');
});
