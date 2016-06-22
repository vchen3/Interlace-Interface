var nameSpace = angular.module("GuitarApp", []);

nameSpace.controller("GuitarFunction", ['$scope','$http', function($scope,$http)
		{    
			$http.get('js/data.json').success(function(data){
			$scope.guitarVariable = data;
		}); 

		}]
);