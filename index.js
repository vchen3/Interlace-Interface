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
   		
/*	
	], function(err, result) {
    assert.equal(err, null);
    //console.log("Inserted a document into the Sessions collection.");
    console.log(result);
    //console.log(result.ops[0].promptTitle);
    callback();
  });
};*/

//Connect running mongoDB instance running on localhost port 27017 to test database

MongoClient.connect(url, function(err, db) {
	console.log("Connected correctly to server.");
	assert.equal(null, err);
	db.collection('AroundTheWorld').find().toArray(function(err, result) {
  	if (err){
  		throw err;
  	}
  	console.log(result);
  });
  //insertDocument(db, function() {
  //    db.close();
  //});
});

expressApp.get('/list', function(req, res){
	//res.send("list of all documents");
      db.collection('AroundTheWorld').find(), function(err, items) {
          if(err) {
              return console.log('Error finding all documents:', err);
          }
          else {
            gres.send("potentially returning items")
            //res.json(items);
          }
      };
});


http.listen(3000, function(){
  console.log('listening on *:3000');
});
