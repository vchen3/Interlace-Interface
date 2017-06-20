var mongoose = require('mongoose');
var Schema = mongoose.Schema

var post_response_schema = new Schema({
	post_id: String,
	user_id: Number,
	valid_request: Boolean,
	selected_request: String,
	edited_request: String
});

var response1_schema = new Schema({
	name: String,
	details: String
});

post_response_schema.methods.get_selected = function(){
	return this.selected_request;
}

var post_response = mongoose.model('Post-Response', post_response_schema)
var response1 = mongoose.model('response1', response1_schema)

module.exports = post_response
module.exports = response1

//Get the default connection
var db = mongoose.connection;

//Bind connection to error event (to get notification of connection errors)
db.on('error', console.error.bind(console, 'connection error: '));
db.once('open', function(){
	console.log("Conncting with mongoose")
});


var local_database_name = 'local';
var local_database_uri  = 'mongodb://localhost/' + local_database_name
mongoose.connect(local_database_uri)