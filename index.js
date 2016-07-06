var express = require('express');
var app = express();
//var socket = require(__dirname + '/socket.js');
var http = require('http').Server(app);
var io = require('socket.io')(http);
var path = require('path');


app.get('/', function(req, res){
  res.sendFile(__dirname + '/index.html');
});

app.use(express.static(path.join(__dirname, '/public'))); //Add CSS
app.use('/js', express.static(path.join(__dirname,'/js'))); //Add controller, data
app.use('/lib', express.static(path.join(__dirname,'/lib'))); //Add Angular and socket?

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
var url = 'mongodb://localhost:27017/test';

var insertDocument = function(db, callback) {

	db.collection('Sessions').insertOne(
	{"promptTitle":"Around the World in Eighty Minutes",
	"promptText":"World Geography",
	"teacherName":"David Laxague",
	"date":"June 22 2016",
	"ideas":[

		{
		"name":"Chris", 
		"time":974638800,
		"contentType":"text",
		"content":"Greenland is the largest island in the world.",
		"likes":0
		},
		{
		"name":"David",
		"time":840877200,
		"contentType":"text",
		"content":"Angel Falls, meaning 'waterfall of the deepest place' is a waterfall in Venezuela. It is the world's highest uninterrupted waterfall, with a height of 979 metres (3,212 ft) and a plunge of 807 metres (2,648 ft). ",
		"likes":0
		},
		{
		"name":"Albus PercivalWulfricBrianDumbledore",
		"time":920314800,
		"contentType":"text",
		"content":"Saturn is not solid like Earth, but is instead a giant gas planet. It is made up of 94% hydrogen, 6% helium and small amounts of methane and ammonia. Hydrogen and helium are what most stars are made of. It is thought that there might be a molten, rocky core about the size of Earth deep within Saturn.",
		"likes":0
		},
		{
		"name":"Ethan",
		"time":1466582755,
		"contentType":"image",
		"content":"img/mountain.jpg",
		"likes":0
		},
		{
		"name":"Ben",
		"time":1467036606,
		"contentType":"image",
		"content":"img/grandcanyon.jpg",
		"likes":0
		}
	]}, function(err, result){
		assert.equal(err,null);
		console.log("Inserted document into Sessions collection");
		callback();
	});
};

var findSessions = function(db, callback) {
   var cursor =db.collection('Sessions').find();
   cursor.each(function(err, doc) {
      assert.equal(err, null);
      if (doc != null) {
      	var ideasArray = doc.ideas;
      	for (i = 0; i < ideasArray.length; i++){
      		var contentType = (doc.ideas[i].contentType);
      		var comparison = contentType.localeCompare('image')
      		//console.log(comparison);
      		//var response =db.collection('Sessions').find({"doc.ideas[i]}.contentType" : "image"});
      		//console.log(response);
      	}
      } else {
         callback();
      }
   });
};

//Connect running mongoDB instance running on localhost port 27017 to test database
MongoClient.connect(url, function(err,db){
	assert.equal(null, err);
	//console.log("Connected correctly to server.");
	insertDocument(db, function(){
		console.log("inserting data:");
		db.close();
	});
	findSessions(db, function(){
		db.close();
	});
}); 


http.listen(3000, function(){
  console.log('listening on *:3000');
});
