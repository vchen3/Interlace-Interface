var app = angular.module("myApp", []);

console.log("starting angular app");

app.controller("InterfaceController", ['$scope','$http', function($scope,$http)
		{    
			$http.get('js/data.json').success(function(data){
			$scope.pageData = data;
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

