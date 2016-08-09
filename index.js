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
var currentSession = "57a8a1ca7909460733f208b2";

//Load default HTML 
  expressApp.get('/', function(req, res){
    res.sendFile(__dirname + '/allSessions.html');
  });

  expressApp.get('/index', function(req, res){
    res.sendFile(__dirname + '/index.html');
  });

  expressApp.get('/addIdea', function(req, res){
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
      if (!('sessionID' in req.body)){
         MongoClient.connect(url, function(err, db) {
          console.log('adding sessionID');
          db.collection(currentCollection).find().toArray(function(err,result){
            var arrayLength = result.length;
            req.body['sessionID'] = arrayLength + 1;
          });
         });
      }
      if (!('promptTitle' in req.body)){
        res.json('Please include a prompt title.');
        return;
      }
      if (!('teacherName' in req.body)){
        res.json("Please include a teacher's name.");
        return;
      }
      if (!('date' in req.body)){
        res.json("Please include the date.");
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
      function safelyAddSession (addition){
        console.log('safely adding ');
        console.log(addition);
        db.collection(currentCollection).save(addition);
        db.collection(currentCollection).find().toArray(function(err,result){
          if (err){
            throw err;
          }
          res.json(result.slice(-1)[0]);
        });
      };

      //Check that the prompt is not already inserted
      
      db.collection(currentCollection).find().toArray(function(err,result){
        if (err){
          throw err;
        }
        var sessionsArray = result;
        //console.log('sessions array: ');
        //console.log(sessionsArray);
        for (var i = 0; i<sessionsArray.length; i++){
          if (sessionsArray[i].promptTitle == req.body.promptTitle){
            //console.log(sessionsArray[i].promptTitle);
            //console.log("This session already exists: " + req.body);
            var errorMessage = "!ERROR!";
            res.send(errorMessage);
            return;
          };
        }
        console.log('new session!');
        safelyAddSession(req.body);
      });
    })
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

  //Request for sessionID by title
  expressApp.post('/getSessionID', function(req,res){
    console.log('getting session ID');
    console.log(req.body);
    var requestedSessionTitle = req.body.title;
    //console.log('body ' + req.body);
    console.log('getting sID of session ' + requestedSessionTitle);
    MongoClient.connect(url, function(err, db) {
      assert.equal(null, err);

      //Result = all sessions with this prompt
      db.collection(currentCollection).find({"promptTitle": requestedSessionTitle}).toArray(function(err,result){
        if (err){
          throw err;
        }
        else{
          if (result.length == 0){
            console.log('no results!');
            var errorMessage = "!ERROR!";
            res.send(errorMessage);
            return;
          }
          //console.log("Total results : " + result.length);
          var resultSessionID = (result[0].sessionID);
          res.json(resultSessionID);
      }
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

  //Request for promptID by title and sessionID, receive promptID
  expressApp.post('/getPromptID', function(req,res){
    var requestedPrompt = req.body;
    console.log("requested prompt's sessionID : " + requestedPrompt.qSessionID);
    var numberSession = Number(requestedPrompt.qSessionID);
    MongoClient.connect(url, function(err, db) {
      assert.equal(null, err);

      //Result = an array with the single queried session
      db.collection(currentCollection).find({"sessionID": numberSession}).toArray(function(err,result){
        if (err){
          throw err;
        }
        else{
          //console.log("Total results : " + result.length);
          //console.log(result);
          //console.log('attempting to return session ID');
          var promptsArray = result[0].prompts;
          for (var i = 0; i<promptsArray.length; i++){
            if (promptsArray[i].text == requestedPrompt.qText){
              res.json(promptsArray[i].promptID);
              return;
            }
          }
          var errorMessage = "!ERROR!";
          res.send(errorMessage);
          return;
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
      
      var IDArray = String(req.body.ID).split('.');
      //console.log('ID Array: ' + IDArray);
      var mySessionID = IDArray[0];
      var promptID = IDArray[1]; 
      var promptIndex = promptID - 1;

      //console.log("PROMPT INDEX: " + promptIndex);

      //Necessary for being able to increment value of dynamic variable
      var variable = 'prompts.' + promptIndex + '.ideas';
      var trueVar = String(variable)
      var action = {};
      action[trueVar] = req.body;
      //console.log(action);
      db.collection(currentCollection).update({sessionID:Number(mySessionID)}, {$push : action});
    
      //Equivalent of this call, but promptIndex cannot be called in this format:
      //db.collection(currentCollection).update({_id:objectSession},{$push:{'prompts.promptIndex.ideas':req.body}});

      /*console.log("searching for session ID " + mySessionID);
      console.log("searching for promptID " + promptID);
      console.log("searching for promptIndex " + promptIndex);*/
      db.collection(currentCollection).find({sessionID:Number(mySessionID)}).toArray(function(err, result) {
        if (err){
          throw err;
        }
        //Result holds an array with the one relevant document
        res.json(result[0].prompts[promptIndex].ideas.slice(-1)[0]);
        //res.json(result[0].ideas.slice(-1)[0]);
      })
     });
  });

  //Update like value by returning all ideas in ideas array stored in database
  expressApp.get('/updateIdeas/:id', function(req,res){
    var IDArray = req.params.id.split(".");
    var mySessionID = Number(IDArray[0]);
    var promptID = Number(IDArray[1]);
    console.log('promptID: ' + promptID);
    var promptIndex = Number(promptID - 1);
    console.log('promptIndex: ' + promptIndex);


    //var promptIndex = req.params.id - 1;
    //console.log(promptIndex);
    MongoClient.connect(url, function(err, db) {
      assert.equal(null, err);
      //var objectSession = ObjectId(currentSession);
      //Send back all ideas
      db.collection(currentCollection).find({sessionID:mySessionID}).toArray(function(err, result) {
        if (err){
          throw err;
        }
        //Result holds an array with the one relevant document
        //Send back the ideas array
        res.json(result[0].prompts[promptIndex].ideas);
      });
     });
  });

  //Function to like idea
  //Receives the ideaID of liked idea (string integer)
  //Returns idea's updated number of likes
  expressApp.get('/like/:id', function(req,res){
    var incoming = req.params.id;
    //console.log(incoming);
    
    var IDArray = String(incoming).split(".");
    var mySessionID = Number(IDArray[0]);
    var promptID = Number(IDArray[1]);
    var ideaID = Number(IDArray[2]);
    /*console.log('session ID: ' + mySessionID);
    console.log('promptID: ' + promptID);
    console.log('ideaID: ' + ideaID);*/
    
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

      db.collection(currentCollection).update({'sessionID':mySessionID}, {$inc : action});
      
      //Equivalent of this call, but idNumber cannot be called in this format:
      //db.collection(currentCollection).update({_id:objectSession},{$inc:{'prompts.promptIndex.ideas.ideaIndex.likes':1}});

      db.collection(currentCollection).find({'sessionID':mySessionID},{}).toArray(function(err,result){
        if (err) {
          throw err;
        }
          //console.log(result[0].prompts[promptIndex].ideas[ideaIndex].likes);
          res.json(result[0].prompts[promptIndex].ideas[ideaIndex].likes);
          //res.json(result[0].ideas[idNumber-1].likes);
        })
    })
  });
      

  //Update like value by returning the current number of likes stored in database
  expressApp.get('/updateLike/:id', function(req,res){
    var incoming = req.params.id;
    //console.log(incoming);
    var IDArray = String(incoming).split(".");
    var mySessionID = Number(IDArray[0]);
    var promptID = Number(IDArray[1]);
    var ideaID = Number(IDArray[2]);
    /*console.log('session ID: ' + mySessionID);
    console.log('promptID: ' + promptID);
    console.log('ideaID: ' + ideaID);*/

    var promptIndex = promptID - 1;
    var ideaIndex = ideaID - 1;

    MongoClient.connect(url, function(err, db) {
      assert.equal(null, err);
      
      db.collection(currentCollection).find({'sessionID': mySessionID},{}).toArray(function(err,result){
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
      var promptsArray = [ { "promptID" : 1.1, "text" : "Share a fact or an image about the world.", "ideas" : [ { "ID" : "1.1.1", "name" : "Chris", "time" : 1469199370000, "contentType" : "text", "content" : "Greenland is the largest island in the world.", "likes" : 17 }, { "ID" : "1.1.2", "name" : "Albus PercivalWulfricBrianDumbledore", "time" : 1469199370000, "contentType" : "text", "content" : "Vatican City is the smallest country in the world.", "likes" : 10 }, { "ID" : "1.1.3", "name" : "Ethan", "time" : 1467199370000, "contentType" : "image", "content" : "img/mountain.jpg", "likes" : 3 }, { "ID" : "1.1.4", "name" : "Ben", "time" : 1465199370000, "contentType" : "image", "content" : "img/grandcanyon.jpg", "likes" : 2 } ] }, { "promptID" : 1.2, "text" : "How do forces act on us?", "ideas" : [ { "ID" : "1.2.1", "name" : "Allen", "time" : 1469124849197, "contentType" : "text", "content" : "Friction is the force exerted by a surface as an object moves across it.", "likes" : 4 }, { "ID" : "1.2.2", "name" : "Anna", "time" : 1469124894977, "contentType" : "image", "content" : "http://cdn.funkidslive.com/wp-content/uploads/carforces-physics-245x170-custom.jpg", "likes" : 10 } ] } ];

        //SET TO PROMPTS!!
        //db.collection.currentCollection.save(newSession);
      db.collection(currentCollection).update({_id:objectSession}, {$set:{'prompts':promptsArray}}); 
      //db.collection(currentCollection).update({_id:objectSession},{$inc:{'ideas.idNumber.likes':1}});
    });
   });

});


http.listen(3000, function(){
  console.log('listening on *:3000');
});


/***API Commands***/
//Save incoming JSON object as document in database
  expressApp.post('/APIaddNewSession', function(req, res){
      if (!('sessionID' in req.body)){
         MongoClient.connect(url, function(err, db) {
          console.log('adding sessionID');
          db.collection(currentCollection).find().toArray(function(err,result){
            var arrayLength = result.length;
            req.body['sessionID'] = arrayLength + 1;
          });
         });
      }
      if (!('promptTitle' in req.body)){
        res.json('Please include a prompt title.');
        return;
      }
      if (!('teacherName' in req.body)){
        res.json("Please include a teacher's name.");
        return;
      }
      if (!('date' in req.body)){
        res.json("Please include the date.");
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
      function safelyAddSession (addition){
        console.log('safely adding ');
        console.log(addition);
        db.collection(currentCollection).save(addition);
        db.collection(currentCollection).find().toArray(function(err,result){
          if (err){
            throw err;
          }
          res.json(result.slice(-1)[0]);
        });
      };

      //Check that the prompt is not already inserted
      
      db.collection(currentCollection).find().toArray(function(err,result){
        if (err){
          throw err;
        }
        var sessionsArray = result;
        //console.log('sessions array: ');
        //console.log(sessionsArray);
        for (var i = 0; i<sessionsArray.length; i++){
          if (sessionsArray[i].promptTitle == req.body.promptTitle){
            //console.log(sessionsArray[i].promptTitle);
            //console.log("This session already exists: " + req.body);
            var errorMessage = "!ERROR!";
            res.send(errorMessage);
            return;
          };
        }
        console.log('new session!');
        safelyAddSession(req.body);
      });
    })
  });


//Request for sessionID by title
  expressApp.post('/APIgetSessionID', function(req,res){
    console.log('getting session ID');
    console.log(req.body);
    var requestedSessionTitle = req.body.title;
    //console.log('body ' + req.body);
    console.log('getting sID of session ' + requestedSessionTitle);
    MongoClient.connect(url, function(err, db) {
      assert.equal(null, err);

      //Result = all sessions with this prompt
      db.collection(currentCollection).find({"promptTitle": requestedSessionTitle}).toArray(function(err,result){
        if (err){
          throw err;
        }
        else{
          if (result.length == 0){
            console.log('no results!');
            var errorMessage = "!ERROR!";
            res.send(errorMessage);
            return;
          }
          //console.log("Total results : " + result.length);
          var resultSessionID = (result[0].sessionID);
          res.json(resultSessionID);
      }
      });
    });
  });

  //Save incoming JSON object as prompt in document database
  expressApp.post('/APIaddNewPrompt', function(req, res){
      if (!('text' in req.body)){
        res.send('Please include a prompt.');
        return;
      };
      if (!('sessionID' in req.body)){
        res.send('Please include the sessionID.');
        return;
      };
      console.log(req.body);

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
            console.log('prompt already within');
            //console.log(promptsArray[i].text);
            //console.log("This prompt is already part of the session: " + req.body.text);
            var errorMessage = "!ERROR!";
            res.send(errorMessage);
            return;
          };
        }

        var promptID = promptsArray.length + 1;
        var newPromptID = req.body.sessionID + "." + promptID;
        //req.body['promptID'] = newPromptID;
        var officialPrompt = {};
        officialPrompt['text'] = req.body.text;
        officialPrompt['promptID'] = newPromptID;
        officialPrompt['ideas'] = [];

        console.log('NOW saving new prompt!');
        console.log(officialPrompt);
        safelyAddPrompt(officialPrompt);
      });

    });
    });

//Request for promptID by title and sessionID, receive promptID
  expressApp.post('/APIgetPromptID', function(req,res){
    var requestedPrompt = req.body;
    console.log("requested prompt's sessionID : " + requestedPrompt.sessionID);
    var numberSession = Number(requestedPrompt.sessionID);
    MongoClient.connect(url, function(err, db) {
      assert.equal(null, err);

      //Result = an array with the single queried session
      db.collection(currentCollection).find({"sessionID": numberSession}).toArray(function(err,result){
        if (err){
          throw err;
        }
        else{
          console.log("Total results : " + result.length);
          
          //console.log('attempting to return session ID');
          var promptsArray = result[0].prompts;
          console.log(promptsArray);
          for (var i = 0; i<promptsArray.length; i++){
            if (promptsArray[i].text == requestedPrompt.text){
              console.log('sending back ' + promptsArray[i].promptID);
              res.json(promptsArray[i].promptID);
              return;
            }
          }
          console.log('not found');
          var errorMessage = "!ERROR!";
          res.send(errorMessage);
          return;
        }
      });
    })
  });

//Add new idea to database in relevant document
  expressApp.post('/APIaddSafeIdea', function(req, res){

    //console.log('adding new idea');
      if (!('promptID' in req.body)){
        res.send("Please include the promptID.");
        return;
      }
      if (!('name' in req.body)){
        res.send("Please include the author's name.");
        return;
      }
      if (!('contentType' in req.body)){
        res.send("Please specify what type of content you'd like to share.");
        return;
      }
      if (!('content' in req.body)){
        res.send("Please include your idea's content.");
        return;
      }


      MongoClient.connect(url, function(err, db) {
      assert.equal(null, err);
      
      var IDArray = String(req.body.promptID).split(".");
      var mySessionID = Number(IDArray[0]);
      var promptID = Number(IDArray[1]);
      var promptIndex = promptID - 1;

      function safelyAddIdea (addition){
        //Necessary for being able to increment value of dynamic variable
        var variable = 'prompts.' + promptIndex + '.ideas';
        var trueVar = String(variable)
        var action = {};
        action[trueVar] = addition;
        //console.log(action);
        db.collection(currentCollection).update({sessionID: mySessionID}, {$push : action});
      };

        db.collection(currentCollection).find({sessionID: mySessionID}).toArray(function(err,result){
          if (err){
            throw err;
          }
          var ideaID = (result[0].prompts[promptIndex].ideas).length + 1;
          console.log('ideaID: ' + ideaID);
          officialIdea = {};
          officialIdea['ID'] = req.body.promptID + "." + ideaID;
          officialIdea['name'] = req.body.name;
          officialIdea['time'] = Date.now();
          officialIdea['contentType'] = req.body.contentType;
          officialIdea['content'] = req.body.content;
          officialIdea['likes'] = 0;

          //console.log(officialIdea);
          safelyAddIdea(officialIdea);
        })
      });

    MongoClient.connect(url, function(err, db) {
      var IDArray = String(req.body.promptID).split(".");
      var mySessionID = Number(IDArray[0]);
      var promptID = Number(IDArray[1]);
      var promptIndex = promptID - 1;

      assert.equal(null, err);
        db.collection(currentCollection).find({sessionID: mySessionID}).toArray(function(err,result){
          console.log('SENDING OFFICIAL RESULT');
          res.json(result[0].prompts[promptIndex].ideas.slice(-1)[0]);
          //res.json(result[0].prompts[promptIndex].ideas.slice(-1)[0]);
        });
      });
  });


