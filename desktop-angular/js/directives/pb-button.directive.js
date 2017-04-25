angular.module('potbot').directive('pbButton', ['sounds',function(sounds) {
  return {
    restrict: 'E',
    scope: {label:'@',size:'@',icon:'@',iconside:'@',overwriteWidth:'@'},
    templateUrl: 'js/directives/pb-button.tmpl.html',
    link: function (scope, element) {

      scope.icon = {
        rightArrow: true
      };
      scope.sizeClass = getSizeClass(scope.size)
      scope.onClick=function(){
        sounds.play('chop3');
      }
    }
  };
  function getSizeClass(size){
    if(size === 'L' || size === 'l'){
      return 'size-l'
    }else if(size === 'S' || size === 's'){
      return 'size-s'
    }else if(size === 'XSS' || size === 'xss'){
      return 'size-xss'
    }else{
      return 'size-m';
    }
  }
}]);
