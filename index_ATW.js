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

expressApp.post('/jsonFile', function(req, res){
  console.log(req);
  /*var sentFile = (__dirname + '/js/data.json');
  console.log(sentFile);
  MongoClient.connect(url, function(err, db) {
    assert.equal(null, err);
    db.collection('Geography').save(sentFile);
    db.collection('Geography').find().toArray(function(err, result) {
      if (err){
        throw err;
      }
      res.json(result);
    });
  })*/
});

expressApp.get('/getSessions', function(req, res){
  MongoClient.connect(url, function(err, db) {
    //console.log("Attempting list");
    assert.equal(null, err);
    db.collections(function(err, result) {
      if (err){
        throw err;
      }
      var collectionArray = result;
      for (var i = 0; i<collectionArray.length; i++){
        console.log(collectionArray[i].s.name);
      }
      
    });
   });
});

expressApp.get('/allSessions', function(req, res){
  res.sendFile(__dirname + '/allSessions.html');
});

/*expressApp.post('/sentContent', function(req, res){
  res.send("received sentContent");
});

*/
//Connect running mongoDB instance running on localhost port 27017 to test database
expressApp.get('/list', function(req, res){
    MongoClient.connect(url, function(err, db) {
    //console.log("Attempting list");
    assert.equal(null, err);
    db.collection(currentCollection).find().toArray(function(err, result) {
      if (err){
        throw err;
      }
      //console.log(result);
      res.json(result);
    });
   });
});

expressApp.get('/like/:id', function(req,res){
  //console.log('Liking idea ' + req.params.id);
  MongoClient.connect(url, function(err, db) {
    //console.log("Attempting to send allData");
    assert.equal(null, err);
    //var idNumber = Number(req.params.id);
    var idNumber = req.params.id;
    //var objectIDNumber = "ObjectId(" + req.params.id + ")";
    var objectIDNumber = new ObjectId(req.params.id);
    db.collection(currentCollection).update({"_id" : objectIDNumber}, {$inc:{likes:1}})
    db.collection(currentCollection).find().toArray(function(err, result) {
      if (err){
        throw err;
      }
      res.json(result);
    });
   });
});


expressApp.post('/addNewIdea', function(req, res){
    //console.log(req.body);
    MongoClient.connect(url, function(err, db) {
    assert.equal(null, err);
    //console.log(db.collection('AroundTheWorld').count());
    db.collection(currentCollection).save(req.body);
    //console.log(db.collection('AroundTheWorld').count());
    db.collection(currentCollection).find().toArray(function(err, result) {
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
    db.collection(currentCollection).updateMany({}, {$set:{likes:0}});
    //res.sendFile(__dirname + '/index.html');
    db.collection(currentCollection).find().toArray(function(err, result) {
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
	socket.on('like', function(ideaID){
    //console.log('socket on newLike '+ideaName);
		io.emit('like', ideaID);
	});
  socket.on('addNewIdea', function(ideaObject){
    //console.log('socket on newLike '+ideaName);
    io.emit('addNewIdea', ideaObject);
  });
});

//Connect with mongoDB
var MongoClient = require('mongodb').MongoClient;
var assert = require('assert');
var ObjectId = require('mongodb').ObjectID;
var url = 'mongodb://localhost:27017/InterfaceDatabase';
var currentCollection = 'AroundTheWorld';

http.listen(3000, function(){
  console.log('listening on *:3000');
});

