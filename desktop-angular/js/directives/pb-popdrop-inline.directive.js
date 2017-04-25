angular.module('potbot').directive('pbPopdropInline', ['sounds','lodash','$document', function( sounds,_,$document) {
  return {
    restrict: 'E',
    scope: {
      label: '@',
      comparier: '@',
      items: '=',
      ngModel:'=',
      direction:'@',
      placeholder:'=',
      onChange:'&'
    },
    replace:true,
    templateUrl: 'js/directives/pb-popdrop-inline.tmpl.html',
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
        console.log('W',item);
        //scope.ngModel = _.clone(item);
        scope.openState(false)
        scope.onChange({$ailment:_.clone(item)});
      }

      //scope.$watch('ngModel',function(nv,ov){
      //  if(nv && ov && nv!=ov){
      //    scope.onChange();
      //  }
      //})
    }
  }
}]);
