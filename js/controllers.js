var angularApp = angular.module("myApp", []);

console.log("starting angular app!!");

angularApp.controller("InterfaceController", ['$scope','$http', 'socket', function($scope,$http, socket)
{    
	var vm = this;
	$http.get('js/data.json').success(function(data){
		$scope.pageData = data;
	}); 

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
  console.log('in app factory');
  var socket = io.connect();
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

