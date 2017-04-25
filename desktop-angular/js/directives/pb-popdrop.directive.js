angular.module('potbot').directive('pbPopdrop', ['sounds','lodash','$document', function( sounds,_,$document) {
  return {
    restrict: 'E',
    scope: {
      label: '@',
      comparier: '@',
      items: '=',
      ngModel:'=',
      direction:'@',
      placeholder:'='
    },
    templateUrl: 'js/directives/pb-popdrop.tmpl.html',
    link: function (scope, element) {
      scope.isOpen = false;
      scope.openToggle = function(e){
        scope.isOpen = !scope.isOpen;
        sounds.play('chop1');
        if(scope.isOpen){
          e.preventDefault();
          e.stopPropagation();
          $document.on('click',function(){
            scope.isOpen = false;
            scope.$apply();
            $document.off('click');
          })
        }
      }
      scope.openState = function(state){

        scope.isOpen = state;
      }

      scope.selectItem = function(item){
        sounds.play('chop3');
        scope.ngModel = _.clone(item);
        scope.openState(false)
      }

    }
  }
}]);
