var angularApp = angular.module("myApp", ['ngRoute']);

console.log("starting angular app");

/*angularApp.config([
	'$routeProvider', '$locationProvider', 
	function($routeProvider, $locationProvider) {
  $routeProvider.
  	otherwise({
		redirectTo: '/'
	});
	$locationProvider.html5Mode(true);
}]);*/


angularApp.controller("InterfaceController", 
	['$scope','$http', 'socket', '$route', '$routeParams', '$location', '$window',
	function($scope,$http, socket, $route, $routeParams, $location, $window)
{    
	var vm = this;

	//$scope.$route = $route;
	//$scope.$location = $location;
    //$scope.$routeParams = $routeParams;

	$http.get('/list').then(function(response){
		$scope.allData = response.data;
		console.log($scope.allData);
	});

	/*$http.get('js/data.json').success(function(data){
		$scope.pageData = data;
	}); */

	socket.on('init', function(){
		console.log('socket on init');
	});

	/*$scope.likeAll = function(){
		$http.get('/like').then(function(response){
			console.log('sent like');
		});
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
		socket.emit('addNewIdea', fullNewIdea);
	};


	$scope.newLike = function(ideaID) { 
		console.log("CLIENT LIKING IDEA: " + ideaID);
		var ideasArray = $scope.allData;
		$http.get('/like/'+ideaID).then(function(response){
			$scope.allData = response.data;
			console.log('U THERE? ' + socket.connected);
			socket.emit('like',ideaID);
		});
	};

	socket.on('like', function(receivedIdea){
		console.log('HELLO I AM HERE');
		$http.get('/list').then(function(response){
			$scope.allData = response.data;
		})
	});

	socket.on('addNewIdea', function(receivedIdea){
		$http.get('/list').then(function(response){
			$scope.allData = response.data;
		});
	})


	socket.on('error', function (err) {
    	console.log("!ERROR! " + err);
	});

}]);

'use strict';

// Demonstrate how to register services
// In this case it is a simple value service .
angularApp.factory('socket', function ($rootScope) {
  console.log('in app factory');
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


