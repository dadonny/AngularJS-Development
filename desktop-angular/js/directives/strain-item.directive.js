angular.module('potbot').directive('strainItem', ['lodash','dataLayer',function(_, dataLayer) {
  return {
    restrict: 'E',
    scope:{
      data:'=',
      onClick:'&'
    },
    templateUrl: 'js/directives/strain-item.tmpl.html',
    link: function (scope, element) {
      scope.baseUrl = dataLayer.baseUrl();
      var colors = {
        'SD':'#60b84f',
        'ID':'#a646b9',
        'H':'#4659b9',
        'S':'#60b84f',
        'I':'#a646b9'
      };

      scope.data.typeShort = _.reduce(scope.data.type.split('_'),function(total,item){
        return total+item[0];
      },'');
      scope.data.color = colors[scope.data.typeShort];


    }
  };
}]);
