var express = require('express');
var expressApp = express();
//var socket = require(__dirname + '/socket.js');
var http = require('http').Server(expressApp);
var io = require('socket.io')(http);
var path = require('path');
var bodyParser = require('body-parser');
var util = require('util');

var currentSession = "578e3ed70e9540ef03359b6d";

expressApp.use(bodyParser.json());
expressApp.use(bodyParser.urlencoded({
  extended: true
}));

//Load default HTML 
expressApp.get('/', function(req, res){
  res.sendFile(__dirname + '/allSessions.html');
});

expressApp.get('/index', function(req, res){
  res.sendFile(__dirname + '/index.html');
});

//Load HTML with data of all mongoDB documents
expressApp.get('/allSessions', function(req, res){
  res.sendFile(__dirname + '/allSessions.html');  
});

//Set current session to use
expressApp.post('/setSession', function(req, res){
  //console.log(req.body);
  var sessionID = req.body._id;
  //console.log(sessionID);
  currentSession = sessionID;
  //console.log('switched to session ID: '+currentSession)
  //console.log(currentSession);
});

//Returns all documents in collection
expressApp.get('/getAllSessionData', function(req, res){
  MongoClient.connect(url, function(err, db) {
    assert.equal(null, err);
    db.collection(currentCollection).find().toArray(function(err,result){
      if (err){
        throw err;
      }
      //console.log(result);
      res.json(result);
    });
  });
});

//List information about current session
expressApp.get('/list', function(req, res){
    MongoClient.connect(url, function(err, db) {
    //console.log("Attempting list");
    assert.equal(null, err);
    db.collection(currentCollection).find().toArray(function(err, result) {
      if (err){
        throw err;
      }
      for (var i = 0; i<result.length; i++){
        if (result[i]._id == currentSession){
          res.json(result[i]);
        }
      }
    });
   });
});

//Receives the ideaID of liked idea (string integer)
expressApp.get('/like/:id', function(req,res){
  var idNumber = Number(req.params.id);
  MongoClient.connect(url, function(err, db) {
    var objectSession = ObjectId(currentSession);
    assert.equal(null, err);
    db.collection(currentCollection).find().toArray(function(err, result) {
      if (err){
        throw err;
      }
      //Iterate through all documents
      for (var i = 0; i<result.length; i++){
        if (result[i]._id == currentSession){
          //console.log('found sesh');
          var setLike = 'ideas.'+String(idNumber)+'.likes';
          var trueLike = String(setLike)

          var variable = 'ideas.' + String(idNumber - 1) + '.likes';
          var trueVar = String(variable)
          //console.log(trueVar);

          var action = {};
          action[trueVar] = 1;

          db.collection(currentCollection).update({_id:objectSession}, {$inc : action});

          /*//Reset all likes
          db.collection(currentCollection).update({_id:objectSession},{$set:{'ideas.0.likes':0}});
          db.collection(currentCollection).update({_id:objectSession},{$set:{'ideas.1.likes':0}});
          db.collection(currentCollection).update({_id:objectSession},{$set:{'ideas.2.likes':0}});
          db.collection(currentCollection).update({_id:objectSession},{$set:{'ideas.3.likes':0}});*/

          db.collection(currentCollection).find({_id:objectSession},{}).toArray(function(err,result){
            if (err) {
              throw err;
            }
            res.json(result[0].ideas[idNumber-1].likes);
          })
        }
      }
    })
  })
});
    


expressApp.get('/updateLike/:id', function(req,res){
  //console.log('updating like idea ' + req.params.id);
  MongoClient.connect(url, function(err, db) {
    assert.equal(null, err);
    var idNumber = Number(req.params.id);
    var objectSession = ObjectId(currentSession);
    //db.collection(currentCollection).find({},{ideas:{$elemMatch:{ideaID:idNumber}}}).toArray(function(err,result){
    db.collection(currentCollection).find({_id:objectSession},{ideas:{$elemMatch:{ideaID:idNumber}}}).toArray(function(err,result){
      if (err){
        throw err;
      }
      res.json(result[0].ideas[0].likes);
      //console.log(result[0].ideas[0].likes);
      //Send back updated number of likes
      //res.json(result[0].ideas[0].likes);
    })
   });
});

//Add new idea to database in relevant document
expressApp.post('/addNewIdea', function(req, res){
    MongoClient.connect(url, function(err, db) {
    assert.equal(null, err);
    var objectSession = ObjectId(currentSession);
    db.collection(currentCollection).update({_id:objectSession},{$push:{"ideas":req.body}});
    //var idNumber = Number(req.body.ideaID);
    db.collection(currentCollection).find({_id:objectSession}).toArray(function(err,result){
      if (err){
        throw err;
      }
      //Result holds an array with the one relevant document
      //Send back the new idea
      res.json(result[0].ideas.slice(-1)[0]);
    })
   });
});

expressApp.get('/updateIdeas', function(req,res){
  //var objectSession = ObjectId(currentSession);
  MongoClient.connect(url, function(err, db) {
    assert.equal(null, err);
    var objectSession = ObjectId(currentSession);
    //Send back all ideas
    db.collection(currentCollection).find({_id:objectSession}).toArray(function(err, result) {
      if (err){
        throw err;
      }
      //Result holds an array with the one relevant document
      //Send back the ideas array
      res.json(result[0].ideas);
    });
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
      res.json(result.slice(-1)[0]);
      //res.json(result);
    })
   });
});

expressApp.post('/removeSession', function(req, res){
    //Incoming entire session document
    MongoClient.connect(url, function(err, db) {
      assert.equal(null, err);
      var objectSession = ObjectId(req.body._id);
      //console.log(objectSession);
      db.collection(currentCollection).update({_id:objectSession},{$set:{"visible":false}})
      db.collection(currentCollection).find().toArray(function(err,result){
        if (err){
          throw err;
        }
        res.json(result);
        //res.json(result.slice(-1)[0]);
        //console.log(result);
      })
   });
});

expressApp.post('/restoreSession', function(req, res){
    //Incoming entire session document
    MongoClient.connect(url, function(err, db) {
      assert.equal(null, err);
      var objectSession = ObjectId(req.body._id);
      //console.log(objectSession);
      db.collection(currentCollection).update({_id:objectSession},{$set:{"visible":true}})
      db.collection(currentCollection).find().toArray(function(err,result){
        if (err){
          throw err;
        }
        res.json(result);
        //res.json(result.slice(-1)[0]);
        //console.log(result);
      })
   });
});


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
  socket.on('updateIdeas', function(ideaID){
    io.emit('updateIdeas', ideaID);
  });
  socket.on('updateSessions', function(ideaID){
  io.emit('updateSessions', ideaID);
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

