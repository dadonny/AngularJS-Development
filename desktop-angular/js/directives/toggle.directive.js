angular.module('potbot').directive('toggle',['sounds', function(sounds) {
  return {
    restrict: 'E',
    replace:true,
    scope:{
     ngModel:'=',
     labelLeft:'@',
     labelRight:'@',
      width:'@'
    },
    templateUrl: 'js/directives/toggle.tmpl.html',
    link: function (scope, element) {

      scope.size = 30;
      scope.bordersize = 6;
      var shifted = scope.width-scope.size;
      var unshifted = 0;
      scope.marginLeft = scope.ngModel?shifted:unshifted;

      scope.toggle = function(){
        scope.ngModel = !scope.ngModel;
        scope.marginLeft = scope.ngModel?shifted:unshifted;
        sounds.play('chop1');
      }

      scope.mover = function(){
        scope.hovered=true;
      }

      scope.mout = function(){
        scope.hovered=false;
      }
    }
  };
}]);
