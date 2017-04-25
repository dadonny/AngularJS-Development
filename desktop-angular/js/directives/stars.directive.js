angular.module('potbot').directive('stars', function() {
  return {
    restrict: 'E',
    scope:{
      max:'@',
      rating:'=',
      isInteractive:'=',
      onChange:'&'
    },
    templateUrl: 'js/directives/stars.tmpl.html',
    link: function (scope, element) {

      function setStars(){
        scope.stars = _.map(new Array(+scope.max),function(item,index){
          var active = 'star'+(index+1)+'.svg';
          var passive = 'star0.svg';
          return {id:index, active:active, passive:passive,actual:(index<scope.rating)?active:passive};
        });
      }
      setStars();

      scope.setRate = function(star){
        if(!scope.isInteractive){return;}
        scope.rating = star.id+1;
        setStars();
        scope.onChange({$stars:scope.rating})
      }

    }
  };
});
