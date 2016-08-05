/* Angular App 
 * Holds all scope variables and functions for Angular/client-side

 * Scope Variables *
	$scope.allData 			JSON of current document/session
	$scope.allSessions 		ARRAY of all documents in collection
	$scope.visibleSessions 	ARRAY of all documents in collection with attribute visible set to "true"
	
	$scope.currentPrompt	INT promptID of current prompt
	$scope.currentSession	JSON of current session

 * Functions below are organized by what "level" they deal with:
 	General functions, and then functions that deal with sessions, prompts, and then ideas
 */


var angularApp = angular.module("myApp", ['ngRoute']);

console.log("starting angular app");

//Angular controller with scope variables defined
angularApp.controller("InterfaceController", 
	['$scope','$http', 'socket', '$route', '$routeParams', '$location', '$window',
	function($scope,$http, socket, $route, $routeParams, $location, $window)
{    

//Setting scope variables, general set-up
	var vm = this;

	$scope.$route = $route;
	$scope.$location = $location;
    $scope.$routeParams = $routeParams;

	$http.get('/list').then(function(response){
		//Current document's information
		$scope.allData = response.data;

	});

	$http.get('/getAllSessionData').then(function(response){
		//All mongoDB documents' information
		$scope.allSessions = response.data;

		var visibleSessionsArray = [];
		for (var i = 0; i<response.data.length; i++){
			if (response.data[i].visible){
				visibleSessionsArray.push(response.data[i]);
			}
		} 
		$scope.visibleSessions = visibleSessionsArray;
	});


//Functions for editing sessions
	$scope.archiveSession = function(inputtedSession){
		$http.post('/removeSession',inputtedSession).then(function(response){
			($scope.allSessions) = (response.data);

			//Update all clients
			socket.emit('updateSessions');
		});
	};

	$scope.restoreSession = function(inputtedSession){
		$http.post('/restoreSession',inputtedSession).then(function(response){
			//Receiving new session and pushing to sessions array
			($scope.allSessions) = (response.data);

			//Update all clients
			socket.emit('updateSessions');
		});
	};

	//Get input from form and create new JSON object for session
	//Post JSON object to insert it as a document into database
	//Append JSON object to allSessions array and call socket emit to update in real time
	$scope.addSession = function(inputtedSession){
		var newSession = angular.copy(inputtedSession);

		if (!(newSession.hasOwnProperty('promptTitle')) || newSession.promptTitle == ""){
			$scope.showAddNewSession = true;
			$scope.addNewSessionResponse = "Please include a session title."
			return;
		}

		if (!(newSession.hasOwnProperty('teacherName')) || newSession.teacherName == ""){
			$scope.showAddNewSession = true;
			$scope.addNewSessionResponse = "Please include the teacher's name."
			return;
		}

		if (!(newSession.hasOwnProperty('date')) || newSession.date == ""){
			$scope.showAddNewSession = true;
			$scope.addNewSessionResponse = "Please include the date."
			return;
		}

		$("#newSession_frm")[0].reset();
		//var savedContent = $scope.allData;
		var fullNewSession = {
			//"ideaID":9,
			"promptTitle":newSession.promptTitle,
			"teacherName":newSession.teacherName,
			"date":newSession.date,
			"prompts":[],
			"visible":true
		};

		$http.post('/addNewSession',fullNewSession).then(function(response){
			//console.log(response.data);
			console.log("********");
			//Receiving new session and pushing to sessions array
			($scope.allSessions).push(response.data);

			//Update all clients
			socket.emit('updateSessions');

			$scope.showAddNewSession = true;
			$scope.addNewSessionResponse = "Your session has been submitted."
		});
	};
	//socket.emit and socket.on must be declared in separate functions
	socket.on('updateSessions', function(){
		$http.get('/getAllSessionData/').then(function(response){
			//console.log(response.data);
			$scope.allSessions = response.data;
		});
	});

	//Set current session
	$scope.useSession = function(inputtedSession){
		$http.post('/setSession',inputtedSession).then(function(response){
		});
	};


	$scope.searchForSession = function(input){
		console.log('input :' + input);
		$http.get('/searchForSession/'+input).then(function(response){
			$scope.sessionResults = (response.data);
		});
	};

	$scope.addToFoundSession = function(input){
		var newInput = input._id;
		console.log(typeof(newInput));
		$scope.currentSession = input;
		console.log("currentSession***")
		console.log($scope.currentSession);
		$http.post('/setSession',input).then(function(response){
		});
		$http.get('/searchForPrompt/'+newInput).then(function(response){
			$scope.promptResults = (response.data);
		});
	};

//Functions for editing prompts

	//Get input from form and create new JSON object for session
	//Post JSON object to insert it as a document into database
	//Append JSON object to allSessions array and call socket emit to update in real time
	$scope.addPrompt = function(inputtedPrompt){
		$("#newPrompt_frm")[0].reset();
		var newPrompt = angular.copy(inputtedPrompt);
		//var savedContent = $scope.allData;
		var fullNewPrompt = {
			"promptID": $scope.allData.prompts.length + 1,
			"text":newPrompt.text,
			"ideas":[],
		};

		$http.post('/addNewPrompt',fullNewPrompt).then(function(response){
			//console.log(typeof(response.data));
			//console.log($scope.allData.prompts);
			//Receiving new session and pushing to sessions array
			//console.log('response: ' + response.data);
			if (response.data == "!ERROR!"){
				//console.log('was  already in');
				$scope.showErrorAddNewPrompt = true;
				$scope.errorAddNewPromptResponse = "This prompt is already part of the session.  Please add a new prompt."
			}
			else{
				$scope.showErrorAddNewPrompt = false;
				($scope.allData.prompts).push(response.data);
			//console.log($scope.allData.prompts);

			//Update all clients
			socket.emit('updatePrompts');
		}
		});
	};
	//socket.emit and socket.on must be declared in separate functions
	socket.on('updatePrompts', function(){
		$http.get('/updatePrompts/').then(function(response){
			//console.log(response.data);
			$scope.allData.prompts = response.data;
		})
	});


	$scope.getPrompt = function(query){
		$("#getPrompt_frm")[0].reset();
		var qPromptText = angular.copy(query);
		console.log(qPromptText);
		console.log(typeof(qPromptText));

		$http.post('/getPromptID', qPromptText).then(function(response){
			$scope.getPromptIDResponse = response.data;
			$scope.showGetPromptIDResponse = true;
			//Receiving new idea and pushing to ideas array of current prompt
			//$scope.promptResults = (response.data);
			//cPrompt.ideas.push(response.data);

			//Update all clients
			//socket.emit('updateIdeas', cPrompt.promptID);
		});
	};

	$scope.addToFoundPrompt = function(destinationPromptID){
		$scope.currentPrompt = destinationPromptID;
		$scope.readyToAddIdea = true;
	};


//Functions for editing ideas

	$scope.addRemoteIdea = function(InputtedIdea){
		var newIdea = angular.copy(InputtedIdea);

		if (!(newIdea.hasOwnProperty('name')) || newIdea.name == ""){
			$scope.showAddRemoteIdea = true;
			$scope.addRemoteIdeaResponse = "Please include the author's name."
			return;
		}

		if (!(newIdea.hasOwnProperty('contentType')) || newIdea.contentType == ""){
			$scope.showAddRemoteIdea = true;
			$scope.addRemoteIdeaResponse = "Please include the idea's content type."
			return;
		}

		if (!(newIdea.hasOwnProperty('content')) || newIdea.content == ""){
			$scope.showAddRemoteIdea = true;
			$scope.addRemoteIdeaResponse = "Please include idea content."
			return;
		}
		$("#newRemoteIdea_frm")[0].reset();
	
		var cPrompt = $scope.allData.prompts[$scope.currentPrompt - 1];

		var ideaID = cPrompt.ideas.length + 1;
		var fullNewIdea = {
			"ID": $scope.currentPrompt + "." + ideaID,
			"name": newIdea.name,
			"time": Date.now(),
			"contentType": newIdea.contentType,
			"content": newIdea.content,
			"likes":0,
		};

		console.log(fullNewIdea);

		$http.post('/addSafeIdea', fullNewIdea).then(function(response){
			//Receiving new idea and pushing to ideas array of current prompt
			//console.log(response.data);
			cPrompt.ideas.push(response.data);

			//Update all clients
			socket.emit('updateIdeas', cPrompt.promptID);

			$scope.showAddRemoteIdea = true;
			$scope.addRemoteIdeaResponse = "Your idea has been submitted."
		});

		$scope.showAddRemoteIdea = true;
		$scope.addRemoteIdeaResponse = "fell thru."
	};
	//socket.emit and socket.on must be declared in separate functions
	socket.on('updateIdeas', function(incomingPrompt){
		//console.log(incomingPrompt);
			$http.get('/updateIdeas/'+incomingPrompt).then(function(response){
				//console.log(response.data);
				//console.log('**');
				//console.log($scope.allData.prompts[incomingPrompt-1]);
				($scope.allData.prompts[incomingPrompt-1].ideas) = response.data;
				//($scope.allData.ideas) = response.data;
			})
	});

	//Get input from form and create new JSON object for idea
	//Post JSON object to append to the "ideas" array in the relevant document
	//Append JSON object to allSessions's ideas array and call socket emit to update in real time
	$scope.addIdea = function(InputtedIdea){
		var newIdea = angular.copy(InputtedIdea);
		console.log(newIdea);
		if (!(newIdea.hasOwnProperty('name')) || newIdea.name == ""){
			$scope.showAddNewIdea = true;
			$scope.addNewIdeaResponse = "Please include the author's name."
			return;
		}

		if (!(newIdea.hasOwnProperty('contentType')) || newIdea.contentType == ""){
			$scope.showAddNewIdea = true;
			$scope.addNewIdeaResponse = "Please include the idea's content type."
			return;
		}

		if (!(newIdea.hasOwnProperty('content')) || newIdea.content == ""){
			$scope.showAddNewIdea = true;
			$scope.addNewIdeaResponse = "Please include idea content."
			return;
		}

		$("#newIdea_frm")[0].reset();

		var promptID = newIdea.ID;
		var cPrompt = $scope.allData.prompts[promptID - 1];

		var ideaID = cPrompt.ideas.length + 1;
		var fullNewIdea = {
			"ID": promptID + "." + ideaID,
			"name": newIdea.name,
			"time": Date.now(),
			"contentType": newIdea.contentType,
			"content": newIdea.content,
			"likes":0,
		};

		//console.log(fullNewIdea);

		$http.post('/addSafeIdea', fullNewIdea).then(function(response){
			//Receiving new idea and pushing to ideas array of current prompt
			//console.log(response.data);
			cPrompt.ideas.push(response.data);

			//Update all clients
			socket.emit('updateIdeas', cPrompt.promptID);

			$scope.showAddRemoteIdea = true;
			$scope.addRemoteIdeaResponse = "Your idea has been submitted."
		});
	};
	//socket.emit and socket.on must be declared in separate functions
	socket.on('updateIdeas', function(incomingPrompt){
		//console.log(incomingPrompt);
			$http.get('/updateIdeas/'+incomingPrompt).then(function(response){
				//console.log(response.data);
				//console.log('**');
				//console.log($scope.allData.prompts[incomingPrompt-1]);
				($scope.allData.prompts[incomingPrompt-1].ideas) = response.data;
				//($scope.allData.ideas) = response.data;
			})
	});

	//Like idea based on ideaID
	//Iterate through all ideas and change the value of $scope.allData.ideas[i].likes 
	//to display the new value without refreshing the page
	//Call socket emit to update in real time
	$scope.newLike = function(incomingID) { 
		//console.log("CLIENT LIKING IDEA: " + incomingID);
	
		var stringID = String(incomingID);
		
		var promptID = stringID.split(".")[0];
		var ideaID = stringID.split(".")[1];
		var promptIndex = promptID - 1
		var ideaIndex = ideaID - 1;

		$http.get('/like/'+incomingID).then(function(response){
			
			var cIdea = $scope.allData.prompts[promptIndex].ideas[ideaIndex];
			cIdea.likes = response.data;

			socket.emit('updateLike', incomingID);
		});
	};

	//Show real-time updates of likes by updating the scope value of all other windows
	//Update scope value to current value stored in database 
	socket.on('updateLike', function(receivedIdea){
		var stringID = String(receivedIdea);
		
		var promptID = stringID.split(".")[0];
		var ideaID = stringID.split(".")[1];
		var promptIndex = promptID - 1
		var ideaIndex = ideaID - 1;

			$http.get('/updateLike/'+receivedIdea).then(function(response){
				var cIdea = $scope.allData.prompts[promptIndex].ideas[ideaIndex];
				cIdea.likes = response.data;
				/*var ideasArray = $scope.allData.ideas;
				for (var i = 0; i<ideasArray.length; i++){
					var currentID = ideasArray[i].ideaID;
					if (currentID===receivedIdea){
						$scope.allData.ideas[i].likes = response.data;
					}
	 
	      		}*/
			})
	});

	socket.on('error', function (err) {
    	console.log("!error! " + err);
	});


}]);

'use strict';

// Factory to use socket.io service
angularApp.factory('socket', function ($rootScope) {
  var socket = io.connect();
  //Print whether the sockets are connected every 5 seconds (true or false)
  setInterval(function(){ console.log(socket.connected); }, 10000);
  return {
    on: function (eventName, callback) {
      //console.log('general function called');
      socket.on(eventName, function () {  
        var args = arguments;
        $rootScope.$apply(function () {
          callback.apply(socket, args);
        });
      });
    },
    emit: function (eventName, data, callback) {
      socket.emit(eventName, data, function () {
        var args = arguments;
        $rootScope.$apply(function () {
          if (callback) {
            callback.apply(socket, args);
          }
        });
      })
    }
  };
});


socket.on('init', function(){
	//console.log('socket on init');
});


