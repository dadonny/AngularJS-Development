angular.module('potbot').directive('arc', ['$interval','$timeout', function($interval, $timeout) {
  return {
    restrict: 'E',
    templateNamespace: 'svg',
    replace: true,
    scope:{
      x:'@',
      y:'@',
      radius:'@',
      startAngle:'@',
      endAngle:'@',
      color:'@',
      width:'@',
      swap:'@',
      show:'=',
      preventAnimation:'='
    },

    template: '<path fill="none" stroke-width="{{::width}}" stroke="{{::color}}" ng-attr-d="{{d}}" opacity="{{opacity}}"  sss="{{startAngle}}"></path>',
    link: function (scope, element) {


      var animEnd = Number(scope.show);

      var refreshInterval = 30;
      var perormanceModeInterval = 60;
      var animationSpeed = 8;
      var stop;
      var isIOS = ionic.Platform.isIOS();
      var isAndroid = ionic.Platform.isAndroid();
      var isWindowsPhone = ionic.Platform.isWindowsPhone();
      var performanceMode = isIOS || isAndroid || isWindowsPhone;

      scope.opacity =1;// Number(scope.show);
      var i=0;

      //render();

      function start(){
        animEnd = Number(scope.show);

      }

      scope.$watch(function(){
        return scope.startAngle+"_"+scope.endAngle;
      },function(ov,nv){
        start();
        //render();
        showAnimation();
      });

      //function ann(){
      //  $timeout(function(){
      //    scope.startAngle = Math.sin(i/100)*360;
      //    scope.endAngle = Math.sin(i/400)*360;
      //    render();
      //    ann();
      //    i++;
      //  },10);
      //}
      //ann();
      //scope.$watch('show',function(ov,nv){
      //  if(nv==ov){return}
	  //
      //  if(nv){
      //    hideAnimation()
      //  }else{
      //    showAnimation()
      //  }
      //});
      // start();
      //render();
      //showAnimation();

      function showAnimation(){
        scope.opacity = 1;
        if(scope.preventAnimation==true){
          $interval.cancel(stop);
          animEnd=1;
          render();
          return;
        }
        if(!performanceMode){
          $interval.cancel(stop);
          stop = $interval(function(){
            animEnd+=(1-animEnd)/animationSpeed;
            render();
            if(animEnd > 0.999){
              animEnd = 1;
              $interval.cancel(stop);
            }
          },refreshInterval)
        }else{
          stop = $timeout(function(){
            animEnd=1;
            render();
          },perormanceModeInterval);
        }

      }

      function hideAnimation(){
        if(scope.preventAnimation==true){
          $interval.cancel(stop);
          animEnd=0;
          scope.opacity = 0;
          return;
        }
        if(!performanceMode) {
          $interval.cancel(stop);
          stop = $interval(function () {
            animEnd += (0 - animEnd) / animationSpeed;
            render();
            if (animEnd < 0.001) {
              animEnd = 0;
              scope.opacity = 0;
              $interval.cancel(stop);
            }
          }, refreshInterval)
        }else{
          stop = $timeout(function(){
            animEnd=0;
            render();
            scope.opacity = 0;
          },perormanceModeInterval);
        }
      }

      function polarToCartesian(centerX, centerY, radius, angleInDegrees) {
        //console.log('polarToCartesian',centerX, centerY, radius, angleInDegrees);
        var angleInRadians = (angleInDegrees-90) * Math.PI / 180.0;
        //console.log('polarToCartesian+',angleInRadians);
        return {
          x: centerX + (radius * Math.cos(angleInRadians)),
          y: centerY + (radius * Math.sin(angleInRadians))
        };
      }

      function render(){
        var sa = scope.startAngle?-scope.startAngle:0 ;
        var ea = scope.endAngle?(+scope.endAngle-scope.startAngle)*(animEnd):0 ;//

        //var angleDelta = (scope.startAngle > scope.endAngle)? (scope.startAngle - scope.endAngle):(scope.endAngle - scope.startAngle);
        var angleDelta = (sa - ea);


        var rad = +scope.radius-scope.width/2;
        //var a_end = +(angleDelta*(1-animEnd));
        var a_end = angleDelta;
        var a_start = sa;
        //console.log('---',sa,ea,angleDelta,animEnd);
        var start = polarToCartesian(+scope.x, +scope.y, rad, a_end);
        var end = polarToCartesian(+scope.x, +scope.y, rad, a_start);


        var arcSweep2 = (a_end - a_start) <= 180 ? "0" : "1";
        var arcSweep = (a_end > a_start) ? "0" : "1";
        scope.d = [
          "M", start.x, start.y,
          "A", rad, rad, 0, arcSweep2, arcSweep, end.x, end.y
        ].join(" ");
      }

      scope.$on('$destroy', function() {
        // Make sure that the interval is destroyed too
        if(!performanceMode) {
          $interval.cancel(stop);
        }else{
          $timeout.cancel(stop);
        }

        stop = null;
      });
     }
  };
}]);



