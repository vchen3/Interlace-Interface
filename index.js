var express = require('express');
var expressApp = express();
//var socket = require(__dirname + '/socket.js');
var http = require('http').Server(expressApp);
var io = require('socket.io')(http);
var path = require('path');

expressApp.get('/', function(req, res){
  res.sendFile(__dirname + '/index.html');
});

expressApp.get('/a1', function(req, res){
  res.send("steaksauce");
});

//Connect running mongoDB instance running on localhost port 27017 to test database
expressApp.get('/list', function(req, res){
    MongoClient.connect(url, function(err, db) {
    console.log("Connected correctly to server.");
    assert.equal(null, err);
    db.collection('AroundTheWorld').find().toArray(function(err, result) {
      if (err){
        throw err;
      }
      res.json(result);
      });
   });
});

expressApp.use(express.static(path.join(__dirname, '/public'))); //Add CSS
expressApp.use('/js', express.static(path.join(__dirname,'/js'))); //Add controller, data
expressApp.use('/lib', express.static(path.join(__dirname,'/lib'))); //Add Angular and socket?

//Connect with socket.io
io.on('connection', function(socket){
	socket.on('like', function(ideaName){
		io.emit('like', ideaName);
	});
});

//Connect with mongoDB
var MongoClient = require('mongodb').MongoClient;
var assert = require('assert');
var ObjectId = require('mongodb').ObjectID;
var url = 'mongodb://localhost:27017/InterfaceDatabase';

http.listen(3000, function(){
  console.log('listening on *:3000');
});
