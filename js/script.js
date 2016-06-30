/*(function(angular) {
  'use strict';
angular.module('switchExample', ['ngAnimate'])
  .controller('ExampleController', ['$scope', function($scope) {
    $scope.items = ['settings', 'home', 'other'];
    $scope.selection = $scope.items[0];
  }]);
})(window.angular);

/*
Copyright 2016 Google Inc. All Rights Reserved.
Use of this source code is governed by an MIT-style license that
can be found in the LICENSE file at http://angular.io/license
*/