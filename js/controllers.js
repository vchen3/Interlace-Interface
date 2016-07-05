var app = angular.module("myApp", []);

console.log("starting angular app!!");

app.controller("InterfaceController", ['$scope','$http', 'socket', function($scope,$http, socket)
			{    
			$http.get('js/data.json').success(function(data){
				$scope.pageData = data;
			}); 
			socket.on('init', function(){
				console.log('socket on init');
			});
		$scope.plusOne = function(ideaName) { 
			var ideasArray = $scope.pageData.ideas;
			for (var i = 0; i<ideasArray.length; i++)
				//console.log(ideasArray[i]);
			{
				var idea = ideasArray[i];
				var trimmedName = idea.name.trim();
				//console.log(trimmedName);
				var sameName =((trimmedName).localeCompare(ideaName))
				if (sameName == 0){
					console.log(trimmedName);
					ideasArray[i].likes += 1; 
					console.log(ideasArray[i].likes);
				}
			}
		};
	}]
);

'use strict';

// Demonstrate how to register services
// In this case it is a simple value service.
app.factory('socket', function ($rootScope) {
  console.log('in app factory');
  var socket = io.connect();
  console.log(socket.connected);
  return {
    on: function (eventName, callback) {
      console.log('general function called');
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

