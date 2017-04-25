angular.module('potbot').directive('favStrainItem', ['lodash','rollovermodal','dataLayer', function(_,rollovermodal,dataLayer) {
  return {
    restrict: 'E',
    scope:{
      data:'=',
      onClick:'&',
      editMode:"="
    },
    templateUrl: 'js/directives/fav-strain-item.tmpl.html',
    link: function (scope, element) {
      scope.baseUrl = dataLayer.baseUrl();
      var colors = {
        'SD':'#60b84f',
        'ID':'#a646b9',
        'H':'#4659b9',
        'S':'#60b84f',
        'I':'#a646b9'
      };

      var grads = {
        'SD':['#328e52','#71b56e'],
        'ID':['#44245a','#84529c'],
        'H':['#34328c','#4568af'],
        'S':['#328e52','#71b56e'],
        'I':['#44245a','#84529c']
      };

      scope.data.typeShort = _.reduce(scope.data.type.split('_'),function(total,item){
        return total+item[0];
      },'');
      scope.data.color = colors[scope.data.typeShort];
      scope.data.grads = grads[scope.data.typeShort];


      scope.mouseover = function(){
        if(scope.editMode){return;}
        scope.mover = true;
      };

      scope.mouseout = function(){
        scope.mover = false;
      }

      scope.showDetails = function(s){
        rollovermodal.show('templates/modal/strain.rollover.tmpl.html', s);
      };
    }
  };
}]);
