angular.module('potbot').directive('circularSlider', ['dataLayer', 'sounds','lodash','$document','$window','$ionicPosition', '$interval', '$ionicGesture', function(dataLayer,sounds, _,$document,$window, $ionicPosition, $interval, $ionicGesture) {
  return {
    restrict: 'E',
    scope:{
      ngModel:'=',
      max:'=',
      min:'=',
      radius:'=',
      step:'=',
      gradsAmount:'=',
      gradMargin:'=',
      socketMargin:'=',
      label:'@'
    },
    templateUrl: 'js/directives/circular-slider.tmpl.html',
    link: function (scope, element) {

      var eventElement = element.find('circholder');

      var gestutreTouchEnd,gestureTouchMove;
      scope.radius = scope.radius?+scope.radius:100;

      scope.max = scope.max?scope.max:100;
      scope.min = scope.min?scope.min:0;
      scope.ngModel = scope.ngModel?scope.ngModel:scope.min;
      scope.ngModel = Math.max(scope.min,scope.ngModel);
      scope.ngModel = Math.min(scope.max,scope.ngModel);
      scope.displayValue = scope.ngModel;
      scope.value = (scope.ngModel- scope.min)/( scope.max - scope.min);
      scope.step = scope.step?scope.step:1/(scope.max-scope.min);
      scope.gradsAmount = scope.gradsAmount?scope.gradsAmount:24;
      scope.gradMargin = scope.gradMargin?scope.gradMargin:10;
      scope.socketMargin = (scope.socketMargin?scope.socketMargin:20)+22;


      scope.socketStyle = getRotation(90)
      var dif = scope.max-scope.min;

      scope.grads = _.map(new Array(scope.gradsAmount),function(v,i){
        var val  = (1/scope.gradsAmount)*i;
        var deg =  val*360-90;
        return {id:i,
          val:val,
          grad:'linear-gradient('+Math.round(deg*-1)+'deg, white, #CECDCE)',
          bgShift:Math.round((1-val)*520)+'px',
          style:getRotation(deg)
        }
      });



      function onMouseMove(e){
        calculation(e);
        e.preventDefault();
        e.stopPropagation();
        _.defer(function(){scope.$apply();});
      }

      function onMouseUp(e){
        scope.$broadcast('circleSlider::mouseup');
        $document.unbind('mouseup');
        $document.unbind('mousemove');
        $ionicGesture.off(gestutreTouchEnd,'touchend');
        $ionicGesture.off(gestureTouchMove,'touchmove');
      }



      $ionicGesture.on('touch', function(e){
        scope.$apply(function() {
          console.log('Tap',e);
          scope.startDrag(e);
        })
      }, eventElement);

      scope.startDrag = function(e){
          e.preventDefault();
          calculation(e,true);

        $document.on('mousemove', onMouseMove);
        $document.on('mouseup', onMouseUp);
        gestutreTouchEnd = $ionicGesture.on('touchmove', onMouseMove, eventElement);
        gestureTouchMove = $ionicGesture.on('touchend', onMouseUp, eventElement);
      };


      function calculation(e,isHard){

        if(animationInteval){stopAnimation();}
        var iop = $ionicPosition.offset(element);

        var pageX, pageY;
        if(e.gesture) {
          pageX = e.gesture.center.pageX;
          pageY = e.gesture.center.pageY;
        }else if(e.changedTouches){
          pageX = e.changedTouches[0].pageX;
          pageY = e.changedTouches[0].pageY;
        }else{
          pageX = e.pageX;
          pageY = e.pageY;
        }
        var x = (pageX - iop.left - element[0].clientWidth/2) ;//
        var y = (pageY - iop.top - element[0].clientHeight/2) - 40 ;// ;

        var obj={ x:x, y:y};
        var angle = Math.atan2(obj.x, obj.y);
        var newValue = 1-(angle+Math.PI)/Math.PI/2;
        newValue = Math.round(newValue/scope.step)*scope.step;
        if(isHard || !_.isNumber(scope.value) || Math.abs(newValue - scope.value)<0.55){
          scope.value = newValue;
        }else if(Math.abs(newValue - scope.value)>=0.55){
          if(newValue>scope.value){
            scope.value=0;
          }else{
            scope.value=1;
          }
        }
        setValues()
      }

      function setValues(isfake){
        if(!isfake){

          var nv = Math.round(scope.min+scope.value*dif);
          if(nv!=scope.ngModel){sounds.play('chop1');}
          scope.ngModel = nv;

        }
        scope.displayValue= Math.round(scope.min+scope.value*dif);
        scope.socketHolderStyle = getRotation(scope.value*360+90);
        scope.socketStyle = _.assign(getRotation(scope.value*-360+0),{marginLeft:-scope.radius+scope.socketMargin});
      }
      //setValues();
      function getRotation(deg){
        return {
          webkitTransform : 'rotate('+deg+'deg)',
          mozTransform    : 'rotate('+deg+'deg)',
          msTransform     : 'rotate('+deg+'deg)',
          oTransform      : 'rotate('+deg+'deg)',
          transform       : 'rotate('+deg+'deg)'
        }
      }

      var animationInteval;
      function runAnimation(){
        var target = scope.value;
        scope.value = 0;
        animationInteval =  $interval(function(){
          scope.value += (target-scope.value)/12;
          setValues(true);
          if(Math.abs(target-scope.value)<0.001){
            stopAnimation();
          }
        })
      }

      function stopAnimation(){
        if(animationInteval){$interval.cancel(animationInteval);}
        animationInteval=null;
      }
      runAnimation()

    }
  };
}]);
