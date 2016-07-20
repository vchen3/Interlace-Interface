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

angularApp.controller("InterfaceController", 
	['$scope','$http', 'socket', '$route', '$routeParams', '$location', '$window',
	function($scope,$http, socket, $route, $routeParams, $location, $window)
{    
	var vm = this;

	$scope.$route = $route;
	$scope.$location = $location;
    $scope.$routeParams = $routeParams;

	$http.get('/list').then(function(response){
		$scope.allData = response.data;
		//console.log("*******");
		//console.log($scope.allData);
	});

	$http.get('/getSessionData').then(function(response){
		$scope.allSessions = response.data;
		//console.log($scope.allSessions);
		//console.log(response.data);
	});


	socket.on('init', function(){
		console.log('socket on init');
	});

	/*$scope.likeAll = function(){
		$http.get('/like').then(function(response){
			console.log('sent like');
		});
	};*/

	$scope.addSession = function(inputtedSession){
		$scope.newSession = angular.copy(inputtedSession);
		//var savedContent = $scope.allData;
		var fullNewSession = {
			//"ideaID":9,
			"promptTitle":$scope.newSession.promptTitle,
			"promptText":$scope.newSession.promptText,
			"teacherName":$scope.newSession.teacherName,
			"date":$scope.newSession.date,
			"ideas":[]
		};

		$http.post('/addNewSession',fullNewSession).then(function(response){
			//Receiving new idea and pushing to sessions array
			//($scope.allSessions).push(response.data);

		});
	};

	$scope.useSession = function(inputtedSession){
		console.log(String(inputtedSession));
		$http.post('/setCurrentSession',inputtedSession).then(function(response){
		//$http.post('/setCurrentSession',String(inputtedSession)).then(function(response){
		//	console.log('hey');
		//});
		//$http.post('/currentSession',inputtedSession).then(function(response){
			//
		//});
		});
	};

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
			socket.emit('updateNewIdea', fullNewIdea);
			//console.log('Added ' + response);
		});
	};


	$scope.newLike = function(incomingID) { 
		//console.log("CLIENT LIKING IDEA: " + incomingID);
		$http.get('/like/'+incomingID).then(function(response){
			var ideasArray = $scope.allData.ideas;
			for (var i = 0; i<ideasArray.length; i++){
				var currentID = ideasArray[i].ideaID;
				if (currentID===incomingID){
					$scope.allData.ideas[i].likes = response.data;
				}
 
      		}
			socket.emit('updateLike',incomingID);
			//$scope.allData = response.data;
			//$scope.allData.ideas[i].likes = response.data;
		});
	};

	socket.on('updateAll', function(receivedIdea){
		$http.get('/list').then(function(response){
			$scope.allData = response.data;
		})
	});


	socket.on('updateNewIdea', function(receivedIdea){
		var rIdeaID = (receivedIdea.ideaID);
		$http.get('/updateNewIdea/'+rIdeaID).then(function(response){
			//console.log("RESPONSE DATA");
			console.log(response.data);
			($scope.allData.ideas) = response.data;
		})
	});

	socket.on('updateLike', function(receivedIdea){
		//console.log('updating like of idea '+receivedIdea);
		$http.get('/updateLike/'+receivedIdea).then(function(response){
			//console.log("RESPONSE DATA");
			//console.log(response.data);
			var ideasArray = $scope.allData.ideas;
			for (var i = 0; i<ideasArray.length; i++){
				var currentID = ideasArray[i].ideaID;
				if (currentID===receivedIdea){
					$scope.allData.ideas[i].likes = response.data;
				}
 
      		}
		})
	});

	socket.on('')

	socket.on('error', function (err) {
    	console.log("!error! " + err);
	});

}]);

'use strict';

// Demonstrate how to register services
// In this case it is a simple value service .
angularApp.factory('socket', function ($rootScope) {
  //console.log('in app factory');
  var socket = io.connect();
  //console.log(socket.connected);
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


