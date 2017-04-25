angular.module('potbot').directive('methodItem', ['lodash','$timeout', 'rollovermodal','sounds','dataLayer', function(_, $timeout, rollovermodal, sounds, dataLayer) {
  return {
    restrict: 'E',
    scope: {
      method: '='
    },
    templateUrl: 'js/directives/method-item.tmpl.html',
    link: function (scope, element) {

      scope.baseUrl = dataLayer.baseUrl();
      scope.showDetails = function (){
        sounds.play('chop3');
        rollovermodal.show('templates/modal/method.rollover.tmpl.html', scope.method);
      };
      scope.showMore = function(){

      }
    }
  }
}]);
