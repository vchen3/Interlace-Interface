var express = require('express');
var expressApp = express();
//var socket = require(__dirname + '/socket.js');
var http = require('http').Server(expressApp);
var io = require('socket.io')(http);
var path = require('path');
var bodyParser = require("body-parser");

expressApp.get('/', function(req, res){
  res.sendFile(__dirname + '/index.html');
});

expressApp.post('/sentContent', function(req, res){
  res.send("done");
  console.log('received sent content');
});

//Connect running mongoDB instance running on localhost port 27017 to test database
expressApp.get('/list', function(req, res){
    MongoClient.connect(url, function(err, db) {
    //console.log("Attempting list");
    assert.equal(null, err);
    db.collection('AroundTheWorld').find().toArray(function(err, result) {
      if (err){
        throw err;
      }
      res.json(result);
    });
   });
});

expressApp.get('/like', function(req, res){
  MongoClient.connect(url, function(err, db) {
    console.log("Attempting likeAll");
    assert.equal(null, err);
    db.collection('AroundTheWorld').updateMany({}, {$inc:{likes:1}})
    db.collection('AroundTheWorld').find().toArray(function(err, result) {
      if (err){
        throw err;
      }
      res.json(result);
    });
  });
});

expressApp.get('/resetLikes', function(req, res){
  MongoClient.connect(url, function(err, db) {
    //console.log("Attempting resetLikes");
    assert.equal(null, err);
    db.collection('AroundTheWorld').updateMany({}, {$set:{likes:0}})
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
