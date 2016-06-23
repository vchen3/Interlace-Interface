var app = angular.module("myApp", []);

console.log("starting up");

app.controller("InterfaceController", ['$scope','$http', function($scope,$http)
		{    
			$http.get('js/data.json').success(function(data){
			$scope.pageData = data;
		}); 
		$scope.plusOne = function(ideaName) { 
			var ideasArray = $scope.pageData.ideas;
			for (var i = 0; i<ideasArray.length; i++)
				console.log(ideasArray[i]);
			{
				var trimmedName = ideasArray[i].name.trim();
				//console.log(trimmedName);
				var sameName =((trimmedName).localeCompare(ideaName))
				//console.log(sameName);
				if (sameName == 0){
					//console.log(ideasArray[i]);
					ideasArray[i].likes += 1; 
					console.log(ideasArray[i].likes);
				}
			}
		};
	}]
);

