angular.module('potbot').directive('productItem', ['lodash','$timeout', 'rollovermodal','sounds','dataLayer', function(_, $timeout, rollovermodal, sounds, dataLayer) {
  return {
    restrict: 'E',
    scope: {
      method: '='
    },
    templateUrl: 'js/directives/product-item.tmpl.html',
    link: function (scope, element) {

      scope.baseUrl = dataLayer.baseUrl();
      scope.showDetails = function (){
        sounds.play('chop3');
        rollovermodal.show('templates/modal/product.rollover.tmpl.html', scope.method);
      };
      scope.showMore = function(){

      }
    }
  }
}]);
