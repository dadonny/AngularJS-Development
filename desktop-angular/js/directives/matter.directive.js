angular.module('potbot').directive('matter',['rollovermodal', '$document','sounds', function(rollovermodal, $document,sounds) {
  return {
    restrict: 'E',
    scope:{matter:'='},
    templateUrl: 'js/directives/matter.tmpl.html',
    link: function (scope, element) {
      var c = element.find('.molecule');
      var m = $('<div/>').appendTo(c);
      scope.matter.onShown = function(){
        console.log('on shown',scope.matter.name);
        remove_molecule();
        m.empty();
        add_molecule_canvas(m, '', '', './mole/'+scope.matter.name+'.mol','',0);
      };

      scope.matter.onHide = function(){
        console.log('on hide',scope.matter);
        m.empty();
        remove_molecule();
      };

      scope.showMore = function (){
        sounds.play('chop3');

        remove_molecule();
        m.empty();
        rollovermodal.show('templates/modal/matter.rollover.tmpl.html', scope.matter,{
          ngLoadCallback:function(){
                          var _c = $document.find('modmolecule');
                          var _m = $('<div/>').appendTo(_c);
                          add_molecule_canvas(_m, '', '', './mole/'+scope.matter.name+'.mol','',0);
          },
          onHide:function(){
            var _c = $document.find('modmolecule');
            //var _m = $('<div/>').appendTo(_c);
            _c.empty();
            remove_molecule();
            scope.matter.onShown();
          }
        });

        //remove_molecule();

      };

      scope.$on('$destroy',function(){
        scope.matter.onHide();
      })
    }
  };
}]);
