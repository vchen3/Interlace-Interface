var express = require('express');
var expressApp = express();
//var socket = require(__dirname + '/socket.js');
var http = require('http').Server(expressApp);
var io = require('socket.io')(http);
var path = require('path');
var bodyParser = require('body-parser');
var util = require('util');

expressApp.use(bodyParser.json());
expressApp.use(bodyParser.urlencoded({
  extended: true
}));

//expressApp.use(express.json());       // to support JSON-encoded bodies
//expressApp.use(express.urlencoded()); // to support URL-encoded bodies

expressApp.get('/', function(req, res){
  res.sendFile(__dirname + '/index.html');
});

expressApp.get('/a1', function(req, res){
  res.sendFile(__dirname + '/steaksauce.html');
});

expressApp.post('/sentContent', function(req, res){
  res.send("received sentContent");
});

expressApp.get('/allData', function(req, res){
    MongoClient.connect(url, function(err, db) {
    //console.log("Attempting to send allData");
    assert.equal(null, err);
    db.collection('AroundTheWorld').find().toArray(function(err, result) {
      if (err){
        throw err;
      }
      res.json(result);
    });
   });
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

expressApp.get('/like/:id', function(req,res){
  //console.log('Liking idea ' + req.params.id);
  MongoClient.connect(url, function(err, db) {
    console.log("Attempting to send allData");
    assert.equal(null, err);
    var idNumber = Number(req.params.id);
    //var objectIDNumber = 'ObjectID(' + req.params.id + ')';
   // console.log(objectIDNumber);
    db.collection('AroundTheWorld').update({ideaID: idNumber}, {$inc:{likes:1}})
    db.collection('AroundTheWorld').find().toArray(function(err, result) {
      if (err){
        throw err;
      }
      res.json(result);
    });
   });
});

/*
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
});*/

expressApp.post('/addNewIdea', function(req, res){
    //console.log(req.body);
    MongoClient.connect(url, function(err, db) {
    assert.equal(null, err);
    //console.log(db.collection('AroundTheWorld').count());
    db.collection('AroundTheWorld').save(req.body);
    //console.log(db.collection('AroundTheWorld').count());
    db.collection('AroundTheWorld').find().toArray(function(err, result) {
      if (err){
        throw err;
      }
      res.send("Received");
      //res.json(result);
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
  //console.log("HELLO " + socket)
  //console.log('#connected clients\n');
  //console.log(util.inspect(io.sockets.connected));
  //console.log(io.sockets.connected);

  //console.log('#connected clients ' + io.sockets.server.eio.clientsCount);
	socket.on('newLike', function(ideaName){
    console.log('socket on newLike '+ideaName);
		//io.emit('like', ideaName);
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

