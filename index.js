var myApp = angular.module('demoApp', ['frSlidescroll']);

myApp.controller('DemoAppController', ['$scope', function($scope) {

    $scope.goToSlideIndex = 0;

    $scope.previous = function() {
        $scope.$broadcast('TransitionEvent', -1);
    };

    $scope.next = function() {
        $scope.$broadcast('TransitionEvent', 1);
    };

    $scope.top = function() {
        $scope.$broadcast('TransitionToEvent', 0);
    };

    $scope.last = function() {
        $scope.$broadcast('TransitionToEvent', -1);
    };
    
    $scope.scrollTo = function(slideIndex) {
        $scope.$broadcast('TransitionToEvent', slideIndex);
    };

}]);