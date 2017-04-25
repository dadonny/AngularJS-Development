angular.module('potbot').directive('filterStrains', ['lodash','$rootScope', function(_,$rootScope) {
  return {
    restrict: 'E',

    templateUrl: 'js/directives/filter-strains.tmpl.html',
    link: function (scope, element) {
      scope.selectFilterItem = function(param, ppid){

        if(param.type=='star') {
          if (ppid == '0') {
            //if (!_.isEqual(param.selected, ['0'])) {
              param.selected = ['0'];
            //} else {
            //  param.selected = [];
            //}
          } else {
            console.log('checking includes', ppid, param.selected, _.includes(param.selected, ppid))
            param.selected = _.reject(param.selected, function (item) {
              return item == '0';
            })
            if (_.includes(param.selected, ppid)) {
              param.selected = _.reject(param.selected, function (item) {
                return item == ppid;
              })
            } else {
              param.selected.push(ppid);
            }
            if (param.selected.length <= 0) {
              param.selected = ['0'];
            }
          }
        }else if(param.type=='radio'){

          if(param.selected == ppid){
              param.isDesc = !param.isDesc;
          }else{
            param.selected = ppid;
            param.isDesc = false;
          }
        }else{
          if(param.selected == ppid){
            param.selected = "";
          }else{
            param.selected = ppid;
          }
        }

        //scope.renderFilterText();
        //scope.getParams()
      };


      scope.clear = function(){
        _.each(scope.filterParams,function(item){
          if(item.type=='star'){
            item.selected = ['0'];
          }else{
            item.selected = 'alph';
            item.isDesc = false;
          }

        });
        //scope.renderFilterText();
      };

      scope.$parent.$on('modal.hidden', function() {

        scope.$parent.applyFilters();
      });
      scope.checkIfSelected = function(param, opt){
        if(param.type=='star'){
          //return {selected:_.includes(param.selected,opt.id)}
          return _.includes(param.selected,opt.id);
        } else{
          return param.selected == opt.id;
        }
      }

      scope.apply = function(){
        //if(scope.$parent.viewToggle){
        //  console.log('filter: map');
        //}else{
        //  console.log('filter: list');
        //  scope.listDataParams.offset = 0;
          //scope.$parent.$parent.$broadcast('scroll.infiniteScrollComplete');
          //scope.$parent.clearList();
          scope.$parent.applyFilters();
          scope.filterModal.hide();
        //}
      };
    }
  };
}]);
