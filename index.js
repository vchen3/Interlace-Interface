var express = require('express');
var expressApp = express();
//var socket = require(__dirname + '/socket.js');
var http = require('http').Server(expressApp);
var io = require('socket.io')(http);
var path = require('path');
var bodyParser = require('body-parser');
var util = require('util');

//var currentSession;

expressApp.use(bodyParser.json());
expressApp.use(bodyParser.urlencoded({
  extended: true
}));

//expressApp.use(express.json());       // to support JSON-encoded bodies
//expressApp.use(express.urlencoded()); // to support URL-encoded bodies

expressApp.get('/', function(req, res){
  res.sendFile(__dirname + '/index.html');
});

expressApp.get('/getSessionData', function(req, res){
  MongoClient.connect(url, function(err, db) {
    assert.equal(null, err);
    db.collection(currentCollection).find().toArray(function(err,result){
      if (err){
        throw err;
      }
      res.json(result);
    });
  });
});

expressApp.get('/allSessions', function(req, res){
  res.sendFile(__dirname + '/allSessions.html');  
});

expressApp.post('/setCurrentSession', function(req, res){
  //console.log(req.params.id);
  //console.log(req.body);
  //currentSession = req.body 
});

//Connect running mongoDB instance running on localhost port 27017 to test database
expressApp.get('/list', function(req, res){
    MongoClient.connect(url, function(err, db) {
    //console.log("Attempting list");
    assert.equal(null, err);
    db.collection(currentCollection).find().toArray(function(err, result) {
      if (err){
        throw err;
      }
      //console.log(result[0]);
      res.json(result[0]);
    });
   });
});

expressApp.get('/like/:id', function(req,res){
  //console.log('Liking idea ' + req.params.id);
  MongoClient.connect(url, function(err, db) {
    //console.log("Attempting to send allData");
    assert.equal(null, err);
    var idNumber = Number(req.params.id);
    db.collection(currentCollection).update({"ideas.ideaID":idNumber},{$inc:{"ideas.$.likes":1}});
    db.collection(currentCollection).find({},{ideas:{$elemMatch:{ideaID:idNumber}}}).toArray(function(err,result){
      if (err){
        throw err;
      }
      console.log(result);
      //console.log(result[0].ideas[0].likes);
      //res.json(result[0].ideas[0].likes);
    })
   });
});

expressApp.get('/updateLike/:id', function(req,res){
 // console.log('updating like idea ' + req.params.id);
  MongoClient.connect(url, function(err, db) {
    assert.equal(null, err);
    var idNumber = Number(req.params.id);
    db.collection(currentCollection).find({},{ideas:{$elemMatch:{ideaID:idNumber}}}).toArray(function(err,result){
      if (err){
        throw err;
      }
      //console.log(result[0].ideas[0]);
      //console.log(result[0].ideas[0].likes);
      //Send back updated number of likes
      res.json(result[0].ideas[0].likes);
    })
   });
});

expressApp.get('/updateNewIdea/:id', function(req,res){
  //var newID = (req.params.id);
  //console.log(newID);
  MongoClient.connect(url, function(err, db) {
    assert.equal(null, err);
    var idNumber = Number(req.params.id);

    //Send back all ideas
    db.collection(currentCollection).find().toArray(function(err, result) {
      if (err){
        throw err;
      }
      //console.log(result[0]);
      res.json(result[0].ideas);
    });
    /*db.collection(currentCollection).find({},{ideas:{$elemMatch:{ideaID:idNumber}}}).toArray(function(err,result){
      if (err){
        throw err;
      }
      //Send back newest idea
      res.json(result[0].ideas[0]);
    })*/
   });
});

expressApp.post('/addNewIdea', function(req, res){
    MongoClient.connect(url, function(err, db) {

    assert.equal(null, err);
    db.collection(currentCollection).update({},{$push:{"ideas":req.body}});
    var idNumber = Number(req.body.ideaID);
    db.collection(currentCollection).find({},{ideas:{$elemMatch:{ideaID:idNumber}}}).toArray(function(err,result){
      if (err){
        throw err;
      }
      res.json(result[0].ideas[0]);
    })
   });
});

expressApp.post('/addNewSession', function(req, res){
  //console.log(req.body);
    MongoClient.connect(url, function(err, db) {
    assert.equal(null, err);
    db.collection(currentCollection).save(req.body);
    db.collection(currentCollection).find().toArray(function(err,result){
      if (err){
        throw err;
      }
      res.json();
    })
   });
});

/*expressApp.get('/resetLikes', function(req, res){
  MongoClient.connect(url, function(err, db) {
    //console.log("Attempting resetLikes");
    assert.equal(null, err);
    //mongoDB shell command: 
    //db.collection(currentCollection)update({},{$set:{'ideas.1.likes':0}})
    db.collection(currentCollection).find().toArray(function(err, result) {
      if (err){
        throw err;
      }
      var fullDocument = result;
      console.log(fullDocument);
      var ideasArray = fullDocument.ideas;

    //Need to get number of likes to iterate through
    //var ideaSize = db.collection(currentCollection)
    /*for (var i = 0; i<ideasArray.length; i++){
      var likedIdea = 'ideas['+i+'].likes';
      console.log(likedIdea);
      db.collection(currentCollection).update({},{$set:{'likedIdea':0}})
      //console.log(result[i].s.name);
      //collectionArray.push(result[i].s.name)
      }

    });*/



    //db.collection(currentCollection).updateMany({}, {$set:{likes:0}})
    //db.collection(currentCollection).updateMany({"ideas.ideaID":""},{$set:{"ideas.$.likes":0}});
    

expressApp.use(express.static(path.join(__dirname, '/public'))); //Add CSS
expressApp.use('/js', express.static(path.join(__dirname,'/js'))); //Add controller, data
expressApp.use('/lib', express.static(path.join(__dirname,'/lib'))); //Add Angular and socket?

//Connect with socket.io
io.on('connection', function(socket){
  socket.on('updateAll', function(ideaObject){
    io.emit('updateAll', ideaObject);
  });
	socket.on('updateLike', function(ideaID){
		io.emit('updateLike', ideaID);
	});
  socket.on('updateNewIdea', function(ideaID){
    io.emit('updateNewIdea', ideaID);
  });
});

//Connect with mongoDB
var MongoClient = require('mongodb').MongoClient;
var assert = require('assert');
var ObjectId = require('mongodb').ObjectID;
var url = 'mongodb://localhost:27017/InterfaceDatabase';
var currentCollection = 'Geography';

http.listen(3000, function(){
  console.log('listening on *:3000');
});

