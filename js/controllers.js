var nameSpace = angular.module("myApp", []);


nameSpace.filter('orderObjectBy', function(){
 return function(input, attribute) {
    if (!angular.isObject(input)) return input;

    var array = [];
    for(var objectKey in input) {
        array.push(input[objectKey]);
    }

    array.sort(function(a, b){
        a = parseInt(a.attribute);
        b = parseInt(b.attribute);
        return a - b;
    });
    return array;
 }
});

nameSpace.controller("InterfaceController", ['$scope','$http', function($scope,$http)
		{    
			$http.get('js/data.json').success(function(data){
			$scope.pageData = data;
		}); 
		$scope.plusOne = function(index) { 
  		$scope.pageData.ideas[index].likes += 1; 
		};
		}]
);