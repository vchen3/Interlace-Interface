/*Angular App 
 * Holds all scope variables and functions for Angular/client-side
 */


var angularApp = angular.module("myApp", ['ngRoute']);

console.log("starting angular app");

/*angularApp.config([
	'$routeProvider', '$locationProvider', 
	function($routeProvider, $locationProvider) {
  $routeProvider.
  	/*otherwise({
		redirectTo: '/'
	});
	$locationProvider.html5Mode(true);
}]);
*/

//Angular controller with scope variables defined
angularApp.controller("InterfaceController", 
	['$scope','$http', 'socket', '$route', '$routeParams', '$location', '$window',
	function($scope,$http, socket, $route, $routeParams, $location, $window)
{    

	//Setting scope variables
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
	$scope.removeSession = function(inputtedSession){
		$http.post('/removeSession',inputtedSession).then(function(response){
			($scope.allSessions) = (response.data);

			//Update all clients
			//socket.emit('updateSessions');
		});
	};

	$scope.restoreSession = function(inputtedSession){
		//console.log(inputtedSession);
		//console.log(typeof(inputtedSession));
		$http.post('/restoreSession',inputtedSession).then(function(response){
			//Receiving new session and pushing to sessions array
			($scope.allSessions) = (response.data);

			//Update all clients
			//socket.emit('updateSessions');
		});
	};

	//Get input from form and create new JSON object for session
	//Post JSON object to insert it as a document into database
	//Append JSON object to allSessions array and call socket emit to update in real time
	$scope.addSession = function(inputtedSession){
		$("#newSession_frm")[0].reset();
		$scope.newSession = angular.copy(inputtedSession);
		//var savedContent = $scope.allData;
		var fullNewSession = {
			//"ideaID":9,
			"promptTitle":$scope.newSession.promptTitle,
			"promptText":$scope.newSession.promptText,
			"teacherName":$scope.newSession.teacherName,
			"date":$scope.newSession.date,
			"ideas":[],
			"visible":true
		};

		$http.post('/addNewSession',fullNewSession).then(function(response){
			//Receiving new session and pushing to sessions array
			($scope.allSessions).push(response.data);

			//Update all clients
			socket.emit('updateSessions');
		});
	};
	//socket.emit and socket.on must be declared in separate functions
	socket.on('updateSessions', function(){
		$http.get('/getAllSessionData/').then(function(response){
			//console.log(response.data);
			$scope.allSessions = response.data;
		})
	});

	//Set current session
	$scope.useSession = function(inputtedSession){
		$http.post('/setSession',inputtedSession).then(function(response){
		})
	};

	//Get input from form and create new JSON object for idea
	//Post JSON object to append to the "ideas" array in the relevant document
	//Append JSON object to allSessions's ideas array and call socket emit to update in real time
	$scope.addIdea = function(InputtedIdea){
		$("#newIdea_frm")[0].reset();
		$scope.newIdea = angular.copy(InputtedIdea);
		var savedContent = $scope.allData;
		var fullNewIdea = {
			"ideaID": savedContent.ideas.length + 1,
			"name": $scope.newIdea.name,
			"time": Date.now(),
			"contentType": $scope.newIdea.contentType,
			"content": $scope.newIdea.content,
			"likes":0
		};
		$http.post('/addNewIdea',fullNewIdea).then(function(response){
			//Receiving new idea and pushing to ideas array
			($scope.allData.ideas).push(response.data);

			//Update all clients
			socket.emit('updateIdeas');
		});
	};
	//socket.emit and socket.on must be declared in separate functions
	socket.on('updateIdeas', function(){
			$http.get('/updateIdeas/').then(function(response){
				($scope.allData.ideas) = response.data;
			})
	});

	//Like idea based on ideaID
	//Iterate through all ideas and change the value of $scope.allData.ideas[i].likes 
	//to display the new value without refreshing the page
	//Call socket emit to update in real time
	$scope.newLike = function(incomingID) { 
		//console.log("CLIENT LIKING IDEA: " + incomingID);
		$http.get('/like/'+incomingID).then(function(response){
			//console.log(response.data);
			var ideasArray = $scope.allData.ideas;
			for (var i = 0; i<ideasArray.length; i++){
				var currentID = ideasArray[i].ideaID;
				if (currentID===incomingID){
					$scope.allData.ideas[i].likes = response.data;
					socket.emit('updateLike',incomingID);
				}
			}
		});
	};

	//Show real-time updates of likes by updating the scope value of all other windows
	socket.on('updateLike', function(receivedIdea){
			$http.get('/updateLike/'+receivedIdea).then(function(response){
				var ideasArray = $scope.allData.ideas;
				for (var i = 0; i<ideasArray.length; i++){
					var currentID = ideasArray[i].ideaID;
					if (currentID===receivedIdea){
						$scope.allData.ideas[i].likes = response.data;
					}
	 
	      		}
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
  setInterval(function(){ console.log(socket.connected); }, 5000);
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


