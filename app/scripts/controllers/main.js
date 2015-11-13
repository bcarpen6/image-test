'use strict';

/**
 * @ngdoc function
 * @name imageTestApp.controller:MainCtrl
 * @description
 * # MainCtrl
 * Controller of the imageTestApp
 */
angular.module('imageTestApp')
  .controller('MainCtrl', function ($scope) {
    $scope.awesomeThings = [
      'HTML5 Boilerplate',
      'AngularJS',
      'Karma'
    ];
  });
