angular.module('potbot').directive('countPath',['sounds', function(sounds) {
  return {
    restrict: 'E',
    replace:true,
    scope:{
      currentPosition:'='
    },
    templateUrl: 'js/directives/count-path.tmpl.html',
    link: function (scope, element) {
      if(scope.currentPosition>=0){

      }else{
        scope.currentPosition = 0;
      }

      scope.positions = [
        'TELL ME ABOUT YOURSELF',
        'PLEASE SELECT YOUR CONDITION',
        'CREATE PROFILE'
      ];

    }
  };
}]);
