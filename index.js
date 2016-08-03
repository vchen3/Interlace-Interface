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

expressApp.use(express.static(path.join(__dirname, '/public'))); //Add CSS
expressApp.use('/js', express.static(path.join(__dirname,'/js'))); //Add controller, data
expressApp.use('/lib', express.static(path.join(__dirname,'/lib'))); //Add Angular and socket

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
  socket.on('updatePrompts', function(ideaID){
  io.emit('updatePrompts', ideaID);
  });
});

//Connect with mongoDB and set currentCollection
var MongoClient = require('mongodb').MongoClient;
var assert = require('assert');
var ObjectId = require('mongodb').ObjectID;
var url = 'mongodb://localhost:27017/InterfaceDatabase';
var currentCollection = 'Geography';

//Set default currentSession to be "World Geography" document on start
var currentSession = "578e3ed70e9540ef03359b6d";

//Load default HTML 
expressApp.get('/', function(req, res){
  res.sendFile(__dirname + '/allSessions.html');
});

expressApp.get('/index', function(req, res){
  res.sendFile(__dirname + '/index.html');
});


//Set current session to use
expressApp.post('/setSession', function(req, res){
  var sessionID = req.body._id;
  currentSession = sessionID;
  console.log("Now using session " + currentSession);
});

//Returns all documents in collection
expressApp.get('/getAllSessionData', function(req, res){
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

//Function to like idea
//Receives the ideaID of liked idea (string integer)
//Returns idea's updated number of likes
expressApp.get('/like/:id', function(req,res){
  var incoming = req.params.id;
  //console.log(incoming);
  var promptID = incoming.split(".")[0];
  var ideaID = incoming.split(".")[1];
  var promptIndex = promptID - 1;
  var ideaIndex = ideaID - 1;

  MongoClient.connect(url, function(err, db) {
    var objectSession = ObjectId(currentSession);
    assert.equal(null, err);
    
    //Necessary for being able to increment value of dynamic variable
    var action = {};
    var variable = 'prompts.' + promptIndex +'.ideas.' + String(ideaIndex) + '.likes';
    var trueVar = String(variable)
    action[trueVar] = 1;

    //console.log(action);

    db.collection(currentCollection).update({_id:objectSession}, {$inc : action});
    
    //Equivalent of this call, but idNumber cannot be called in this format:
    //db.collection(currentCollection).update({_id:objectSession},{$inc:{'ideas.ideaIndex.likes':1}});
    //db.collection(currentCollection).update({_id:objectSession},{$inc:{'prompts.promptIndex.ideas.ideaIndex.likes':1}});

    /*//Reset all likes
    db.collection(currentCollection).update({_id:objectSession},{$set:{'ideas.0.likes':0}});
    db.collection(currentCollection).update({_id:objectSession},{$set:{'ideas.1.likes':0}});
    db.collection(currentCollection).update({_id:objectSession},{$set:{'ideas.2.likes':0}});
    db.collection(currentCollection).update({_id:objectSession},{$set:{'ideas.3.likes':0}});*/

    db.collection(currentCollection).find({_id:objectSession},{}).toArray(function(err,result){
      if (err) {
        throw err;
      }
        res.json(result[0].prompts[promptIndex].ideas[ideaIndex].likes);
        //res.json(result[0].ideas[idNumber-1].likes);
      })
  })
});
    

//Update like value by returning the current number of likes stored in database
expressApp.get('/updateLike/:id', function(req,res){
  var incoming = req.params.id;
  //console.log(incoming);
  var promptID = incoming.split(".")[0];
  var ideaID = incoming.split(".")[1];
  var promptIndex = promptID - 1;
  var ideaIndex = ideaID - 1;

  MongoClient.connect(url, function(err, db) {
    assert.equal(null, err);
    var objectSession = ObjectId(currentSession);
    
    db.collection(currentCollection).find({_id:objectSession},{}).toArray(function(err,result){
      if (err) {
        throw err;
      }
        res.json(result[0].prompts[promptIndex].ideas[ideaIndex].likes);
        //res.json(result[0].ideas[idNumber-1].likes);
    })
   });
});

//Add new idea to database in relevant document
expressApp.post('/addNewIdea', function(req, res){
  //console.log('adding new idea');
    if (!('ID' in req.body)){
      //Add this dynamically somehow, find the value
      console.log('missing ID');
      return;
    }
    if (!('name' in req.body)){
      res.send("Please include the author's name.");
      return;
    }
    if (!('time' in req.body)){
      req.body['time'] = Date.now();
      console.log(req.body);
    }
    if (!('contentType' in req.body)){
      res.send("Please specify what type of content you'd like to share.");
      return;
    }
    if (!('content' in req.body)){
      res.send("Please include your idea's content.");
      return;
    }
    if (!('likes' in req.body)){
      req.body['likes'] = 0;
      console.log(req.body);
    }

    MongoClient.connect(url, function(err, db) {
    assert.equal(null, err);
    var objectSession = ObjectId(currentSession);
    var ideaID = req.body.ID;
    var promptID = ideaID.split(".")[0];
    var promptIndex = promptID - 1;
    //console.log("PROMPT INDEX: " + promptIndex);

    //Necessary for being able to increment value of dynamic variable
    var variable = 'prompts.' + promptIndex + '.ideas';
    var trueVar = String(variable)
    var action = {};
    action[trueVar] = req.body;
    //console.log(action);
    db.collection(currentCollection).update({_id:objectSession}, {$push : action});
    
    //Equivalent of this call, but promptIndex cannot be called in this format:
    //db.collection(currentCollection).update({_id:objectSession},{$push:{'prompts.promptIndex.ideas':req.body}});

    db.collection(currentCollection).find({_id:objectSession}).toArray(function(err,result){
      if (err){
        throw err;
      }
      //Result holds an array with the one relevant document
      //Send back the new idea
      //console.log('\n');
      //console.log(result[0].prompts[promptIndex]);
      res.json(result[0].prompts[promptIndex].ideas.slice(-1)[0]);
      //res.json(result[0].ideas.slice(-1)[0]);
    })
   });
});

//Update like value by returning all ideas in ideas array stored in database
expressApp.get('/updateIdeas/:id', function(req,res){
  //console.log('updating ideas');
  //var objectSession = ObjectId(currentSession);
  //console.log('promptIndex: ' + promptIndex);
  //console.log(req.params.id);
  //var promptIndex = req.params.id.promptID - 1;
  var promptIndex = req.params.id - 1;
  console.log(promptIndex);
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
      //console.log("*********");
      //console.log(result[0].prompts[promptIndex].ideas);
      res.json(result[0].prompts[promptIndex].ideas);
      //res.json(result[0].prompts[promptIndex].ideas);
      //res.json(result[0].ideas);
    });
   });
});

//Save incoming JSON object as prompt in document database
expressApp.post('/addNewPrompt', function(req, res){
    //console.log(req.body);
    if (!('text' in req.body)){
      res.send('Please include a prompt.');
      return;
    }
    if (!('ideas' in req.body)){
      req.body['prompts'] = [];
      console.log(req.body);
    }

    MongoClient.connect(url, function(err, db) {
    assert.equal(null, err);
    var objectSession = ObjectId(currentSession);
    //db.collection(currentCollection).save(req.body);
    db.collection(currentCollection).update({_id:objectSession},{$push : {prompts:req.body}});
    db.collection(currentCollection).find({_id:objectSession}).toArray(function(err,result){
      if (err){
        throw err;
      }
      res.json(result[0].prompts.slice(-1)[0]);
    })
   });
});

expressApp.get('/updatePrompts', function(req, res){
  MongoClient.connect(url, function(err, db) {
    assert.equal(null, err);
    var objectSession = ObjectId(currentSession);
    db.collection(currentCollection).find({_id:objectSession}).toArray(function(err,result){
      if (err){
        throw err;
      }
      res.json(result[0].prompts);
    });
  });
});

//Save incoming JSON object as document in database
expressApp.post('/addNewSession', function(req, res){
    if (!('promptTitle' in req.body)){
      res.send('Please include a prompt title.');
      return;
    }
    if (!('teacherName' in req.body)){
      console.log("Please include a teacher's name.");
      return;
    }
    if (!('teacherName' in req.body)){
      console.log("Please include a teacher's name.");
      return;
    }
    if (!('date' in req.body)){
      console.log("Please include the date.");
      return;
    }
    if (!('visible' in req.body)){
      req.body['visible'] = true;
    }
    if (!('prompts' in req.body)){
      req.body['prompts'] = [];
      console.log(req.body);
    }

    MongoClient.connect(url, function(err, db) {
    assert.equal(null, err);
    db.collection(currentCollection).save(req.body);
    db.collection(currentCollection).find().toArray(function(err,result){
      if (err){
        throw err;
      }
      res.json(result.slice(-1)[0]);
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
      })
   });
});

expressApp.get('/moveIdeas', function(req,res){
  console.log('moving ideas');
  MongoClient.connect(url, function(err, db) {
    assert.equal(null, err);
    var objectSession = ObjectId("578e3ed70e9540ef03359b6d");
    var newInput = {
      "promptID": 2,
      "text": "How do forces act on us?"
    }; 
    //db.collection(currentCollection).update({_id:objectSession}, {$push:{prompts:newInput}});
    
    db.collection(currentCollection).find({_id:objectSession}).toArray(function(err, result) {
      if (err){
        throw err;
      }
      //Result holds an array with the one relevant document
      //Send back the ideas array
      var ideasArray = [
        {
          "ID" : 1.1,
          "name" : "Chris",
          "time" : 1469199370000,
          "contentType" : "text",
          "content" : "Greenland is the largest island in the world.",
          "likes" : 3
        },
        {
          "ID" : 1.2,
          "name" : "Albus PercivalWulfricBrianDumbledore",
          "time" : 1469199370000,
          "contentType" : "text",
          "content" : "Vatican City is the smallest country in the world.",
          "likes" : 1
        },
        {
          "ID" : 1.3,
          "name" : "Ethan",
          "time" : 1467199370000,
          "contentType" : "image",
          "content" : "img/mountain.jpg",
          "likes" : 0
        },
        {
          "ID" : 1.4,
          "name" : "Ben",
          "time" : 1465199370000,
          "contentType" : "image",
          "content" : "img/grandcanyon.jpg",
          "likes" : 2
        }
      ];

    //db.collection(currentCollection).update({_id:objectSession}, {$set:{'prompts.0.ideas':ideasArray}}); 
      //db.collection(currentCollection).update({_id:objectSession},{$inc:{'ideas.idNumber.likes':1}});
    });
   });
});


http.listen(3000, function(){
  console.log('listening on *:3000');
});

