/* Node App 
 * Functions below are organized by what "level" they deal with:
  General functions, and then functions that deal with sessions, prompts, and then ideas
 */



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

  expressApp.get('/addIdeaPage', function(req, res){
    res.sendFile(__dirname + '/addIdeaPage.html');
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

//Functions for editing sessions
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

  //Save incoming JSON object as document in database
  expressApp.post('/addNewSession', function(req, res){
      if (!('promptTitle' in req.body)){
        console.log('Please include a prompt title.');
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

  //Set current session to use
  expressApp.post('/setSession', function(req, res){
    var sessionID = req.body._id;
    currentSession = sessionID;
    console.log("Now using session " + currentSession);
  });

  expressApp.get('/searchForSession/:id', function(req,res){
    console.log('received request to search for session');
    var input = req.params.id;
    MongoClient.connect(url, function(err, db) {
      assert.equal(null, err);
      db.collection(currentCollection).find({"promptTitle":input}).toArray(function(err,result){
        if (err){
          throw err;
        }
        res.json(result);
      });
    });
  });

// Functions for editing prompts

  expressApp.get('/searchForPrompt/:id', function(req,res){
    console.log('received request to search for prompt');
    var input = req.params.id;
    var objectSession = ObjectId(input);
    MongoClient.connect(url, function(err, db) {
      assert.equal(null, err);
      db.collection(currentCollection).find({_id:objectSession}).toArray(function(err,result){
        if (err){
          throw err;
        }
        res.json(result[0].prompts);
      });
    });
  });

  //Save incoming JSON object as prompt in document database
  expressApp.post('/addNewPrompt', function(req, res){
      //console.log(req.body);
      if (!('text' in req.body)){
        res.send('Please include a prompt.');
        return;
      };
      if (!('promptID' in req.body)){
        res.send('Please include a promptID.');
        return;
      };
      if (!('ideas' in req.body)){
        req.body['ideas'] = [];
        //console.log(req.body);
      };


      MongoClient.connect(url, function(err, db) {
      assert.equal(null, err);
      var objectSession = ObjectId(currentSession);
      function safelyAddPrompt (addition){
        db.collection(currentCollection).update({_id:objectSession},{$push : {prompts:addition}});
        db.collection(currentCollection).find({_id:objectSession}).toArray(function(err,result){
          if (err){
            throw err;
          }
          res.json(result[0].prompts.slice(-1)[0]);
        })
      };

      //Check that the prompt is not already inserted
      db.collection(currentCollection).find({_id:objectSession}).toArray(function(err,result){
        if (err){
          throw err;
        }
        var promptsArray = result[0].prompts;
        for (var i = 0; i<promptsArray.length; i++){
          if (promptsArray[i].text == req.body.text){
            //console.log(promptsArray[i].text);
            //console.log("This prompt is already part of the session: " + req.body.text);
            var errorMessage = "!ERROR!";
            res.send(errorMessage);
            return;
          };
        }
        console.log('new prompt!');
        safelyAddPrompt(req.body);
      });

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

  //Request for promptID by title
  expressApp.post('/getPromptID', function(req,res){
    var requestedPrompt = req.body.qText;
    MongoClient.connect(url, function(err, db) {
      assert.equal(null, err);
      var action = {};
      var variable = "text";
      var trueVar = String(variable);
      action[trueVar] = req.body.qText;

      //Result = all sessions with this prompt
      db.collection(currentCollection).find({"prompts": {$elemMatch: action}}).toArray(function(err,result){
        if (err){
          throw err;
        }
        else{
          console.log("Total results : " + result.length);
          for (var i = 0; i<result.length; i++){
              console.log(result[i]);
          }

          /*if (result.length = 1){
            //console.log(result[0].prompts)
            for (var i = 0; i<result[0].prompts.length; i++){
              var currentPrompt = result[0].prompts[i];
              //console.log(currentPrompt);
              //console.log(requestedPrompt);
              if (currentPrompt.text === requestedPrompt){
                res.json(currentPrompt.promptID);
                return;
              }
            };
          }
         //If there are multiple prompts with this title
          //else{
            //for (var i = 0; i<result.length; i++){
              //console.log(result[i]);
            //}
            //console.log("multiple results");
          //}*/
      }
      });
    })
  });

//Functions for editing ideas 

  //Add new idea to database in relevant document
  expressApp.post('/addSafeIdea', function(req, res){
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
      //db.collection(currentCollection).update({_id:objectSession},{$inc:{'prompts.promptIndex.ideas.ideaIndex.likes':1}});

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


//A functional way to move many ideas into the database at once

expressApp.get('/moveIdeas', function(req,res){
  console.log('moving ideas');
  MongoClient.connect(url, function(err, db) {
    assert.equal(null, err);
    var objectSession = ObjectId("578fcdfee86fbe0cd2d34ea7");
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
      "ideaID" : 1,
      "name" : "Paul",
      "time" : 1469124975236,
      "contentType" : "text",
      "content" : "Saturn is not solid like Earth, but is instead a giant gas planet.",
      "likes" : 0
    },
    {
      "ideaID" : 2,
      "name" : "Annie",
      "time" : 1469125017873,
      "contentType" : "image",
      "content" : "http://www.seasky.org/solar-system/assets/animations/solar_system_menu.jpg",
      "likes" : 0
    },
    {
      "ideaID" : 3,
      "name" : "Fay",
      "time" : 1469194124925,
      "contentType" : "text",
      "content" : "Mercury is closest to the sun",
      "likes" : 0
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

