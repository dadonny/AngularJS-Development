angular.module('potbot').directive('resultsMenu',['$rootScope', 'lodash', '$state','sounds', function($rootScope,_, $state, sounds) {
  return {
    restrict: 'E',
    templateUrl: 'js/directives/results-menu.tmpl.html',
    link: function (scope, element) {
      scope.selected;
      scope.items = [
        {id: 'overview', label: 'Cannabinoid Overview', index:0},
        {id: 'strains', label: 'Compatible Strains', index:1},
        {id: 'methods', label: 'Consumption Methods', index:2},
        {id: 'products', label: 'Products', index:3},
        {id: 'dispensaries', label: 'Dispensaries', index:4},
        {id: 'doctor', label: 'Find a Doctor', index:5}
      ];


      scope.gotoResultPart = function(item){
        sounds.play('chop3');
        $state.go('results.'+item.id);
      };

      setCurrentState($state.current);
      $rootScope.$on('$stateChangeStart',
        function(event, toState, toParams, fromState, fromParams){
          setCurrentState(toState);

      });

      function setCurrentState(state){
        if(state.name){
          var nn = state.name.split('.');
          if(nn[0]=='results'){
            _.each(scope.items,function(item){
              if(item.id === nn[1]){
                item.selected = true;
                scope.selected = item;
              }else{
                item.selected = false;
              }

            })
          }
        }
      }

    }
  }
}]);
