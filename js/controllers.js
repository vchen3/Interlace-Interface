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
	
	/*$http.get('js/data.json').success(function(data){
		//console.log("something better");
		$scope.pageData = data;
	}); */

	$http.get('/allData').then(function(response){
		$scope.allData = response.data;
	});

	$scope.likeAll = function(){
		$http.get('/like').then(function(response){
			console.log('sent like');
		});
	};

	$scope.addIdea=function(name,contentType,content){
		//Get promptTitle, promptText, teacherName
		//Generate timestamp
		//Set "likes" to 0
		//Create new document with this content, insert into MongoDB		
	}

	$scope.likeIdea = function(ideaName) { 
		var ideasArray = $scope.pageData.ideas;
		for (var i = 0; i<ideasArray.length; i++){
			var idea = ideasArray[i];
			var trimmedName = idea.name.trim();
			//console.log(trimmedName);
			var sameName =((trimmedName).localeCompare(ideaName))
			if (sameName == 0){
				socket.emit('like', idea);
			}
		}
	};

	socket.on('like', function(receivedIdea){
		var ideasArray = $scope.pageData.ideas;
		for (var i = 0; i<ideasArray.length; i++){
			if ((ideasArray[i].ID) == (receivedIdea.ID)){
				ideasArray[i].likes += 1; 
			}
		}

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


/*$scope.go = function(url, data){
		//console.log($scope.new);
		$http.post(url, $scope.new).success(function (response){
			console.log(response);
			//console.log(data);
		}).error(function(error){
			console.log("ERROR!" + error);
		});
	};*/
		//console.log(path);
		//$window.location.replace(path);
	  	/*var req = {
			method: 'POST',
			url: '/sentContent',
			data: "Angular is sending POST request to /sentContent"
			//data: {test: path}	  		
	  	}*/
	  	//$http(req).then(console.log(req.data));
	  	/*$http.post(url, data)
	  		.success(function(data){
	  			console.log(data)
	  		})
	  		.error(function(data){
	  			console.log("url: " + url);
	  			console.log("data: " + data);
	  			console.log("Error!");
	  		});*/
	  	//$location.url(path);
	  	//window.location('www.google.com');
	  	//$window.location.href('www.google.com');
	  	//replace();
	  	//$scope.$apply();
