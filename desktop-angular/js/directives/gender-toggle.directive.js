angular.module('potbot').directive('genderToggle',['sounds',function(sounds) {
  return {
    restrict: 'E',
    scope:{
      ngModel:'='
    },
    templateUrl: 'js/directives/gender-toggle.tmpl.html',
    link: function (scope, element) {

        scope.toggle=function(event){
          sounds.play('chop1');

          if(_.isNull(scope.ngModel) || scope.ngModel<0){

            if(event.offsetY>=100){
              scope.ngModel = 1;
            }else{
              scope.ngModel = 0;
            }
          }else{
            scope.ngModel = 1-scope.ngModel;
          }
        }
    }
  };
}]);
