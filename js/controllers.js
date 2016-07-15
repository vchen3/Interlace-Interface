var angularApp = angular.module("myApp", ['ngRoute']);

console.log("starting angular app");

angularApp.config([
	'$routeProvider', '$locationProvider', 
	function($routeProvider, $locationProvider) {
  $routeProvider.
  	otherwise({
		redirectTo: '/'
	});
	$locationProvider.html5Mode(true);
}]);


angularApp.controller("InterfaceController", 
	['$scope','$http', 'socket', '$route', '$routeParams', '$location', '$window',
	function($scope,$http, socket, $route, $routeParams, $location, $window)
{    
	var vm = this;
	$scope.$route = $route;
	$scope.$location = $location;
    $scope.$routeParams = $routeParams;

	$http.get('/allData').then(function(response){
		$scope.allData = response.data;
	});

	$scope.likeAll = function(){
		$http.get('/like').then(function(response){
			console.log('sent like');
		});
	};

	$scope.getUpdates = function(){
		console.log("Should be updating");
		$http.get('/allData').then(function(response){
			$scope.allData = response.data;
			$route.reload();
		});
	};


	/*$scope.updateForm = function(InputtedIdea){
		console.log("****");
		$scope.newIdea = angular.copy(InputtedIdea);
		console.log($scope.newIdea);
	};*/

	$scope.addIdea = function(InputtedIdea){
		$scope.newIdea = angular.copy(InputtedIdea);
		var savedContent = $scope.allData;
		var fullNewIdea = {
			//"ideaID":9,
			"promptTitle":savedContent[0].promptTitle,
			"promptText":savedContent[0].promptText,
			"teacherName":savedContent[0].teacherName,
			//"date":
			"name": $scope.newIdea.name,
			"time": Date.now(),
			"contentType": $scope.newIdea.contentType,
			"content": $scope.newIdea.content,
			"likes":0
		};
		console.log("****");
		console.log(fullNewIdea);
		$http.post('/addNewIdea',fullNewIdea).then(function(response){
			console.log('Added ' + response);
		});
		
	};

	$scope.newLike = function(ideaID) { 
		console.log("CLIENT LIKING IDEA: " + ideaID);
		$http.get('/like/'+ideaID).then(function(response){
			//console.log(response);
			$scope.allData = response.data;
			$route.reload();
			socket.emit('newLike',ideaID);
			$route.reload();
		});
	};

	socket.on('newLike', function(receivedIdeaID){
		console.log(receivedIdeaID);
		//$scope.allData = $scope.allData;
		$route.reload();
		/*var ideasArray = $scope.allData;
		for (var i = 0; i<ideasArray.length; i++){
			if ((ideasArray[i].name) == (receivedIdea.name)){
				ideasArray[i].likes += 1; 
			}
		}*/

	});
}]);

'use strict';

// Demonstrate how to register services
// In this case it is a simple value service.
angularApp.factory('socket', function ($rootScope) {
  //console.log('in app factory');
  var socket = io.connect();
  setInterval(function(){ console.log(socket.connected); }, 5000);
  //Every five seconds, print status of socket connection
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
