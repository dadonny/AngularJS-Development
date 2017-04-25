angular.module('potbot').directive('pbSlider',['pbConst', '$document', 'lodash', '$ionicPosition', 'sounds','$ionicGesture', function(pbConst, $document,_, $ionicPosition,sounds,$ionicGesture) {
  return {
    restrict: 'E',
    replace:true,
    scope: {
      width:'=',
      label:'@',
      ngModel:'=',
      onChange:"="
    },
    templateUrl: 'js/directives/pb-slider.tmpl.html',
    link: function (scope, element) {

      if(!scope.width){
        scope.width = element.width();
      }

      scope.points=pbConst.cannabisExperienceLabels;


      scope.points = _.map(scope.points,function(item){
        item.bgShift = 550-item.val*540;
        return item;
      });

      var mouseOffsetX = 0;
      scope.selectedPoint = 0;
      var pointStep = 1/scope.points.length;
      var gestutreTouchEnd, gestureTouchMove;
      var eventElement = element.find('clickable-element');
      //scope.answerLabel = 'RARE';
      scope.headPosition = 0;
      scope.value=0;
      if(!scope.ngModel){scope.ngModel = 0;}

      function onMouseMove(e){
        e.preventDefault();
        e.stopPropagation();
        calculation(e);
        _.defer(function(){scope.$apply();});
      }

      function onMouseUp(e){
        scope.$broadcast('circleSlider::mouseup');
        $document.unbind('mouseup');
        $document.unbind('mousemove');
        $ionicGesture.off(gestutreTouchEnd,'touchend');
        $ionicGesture.off(gestureTouchMove,'touchmove');
        scope.onChange(scope.ngModel, scope.points[scope.selectedPoint]);
      };

      $ionicGesture.on('touch', function(e){
        scope.$apply(function() {
          console.log('Tap',e);
          scope.startDrag(e);
        })
      }, eventElement);

      scope.startDrag = function(e){
        mouseOffsetX = e.offsetX;
        e.preventDefault();
        calculation(e,true);
        $document.on('mousemove', onMouseMove);
        $document.on('mouseup', onMouseUp);
        gestutreTouchEnd = $ionicGesture.on('touchmove', onMouseMove, eventElement);
        gestureTouchMove = $ionicGesture.on('touchend', onMouseUp, eventElement);
      };

      function calculation(e){
        var iop = $ionicPosition.offset(element);
        var pageX;
        if(e.gesture) {
          pageX = e.gesture.center.pageX;
        }else if(e.changedTouches){
          pageX = e.changedTouches[0].pageX;
        }else {
          pageX = e.pageX;
        }

        scope.value =(pageX-iop.left )/scope.width;
        scope.value = Math.max(scope.value,0);
        scope.value = Math.min(scope.value,1);
        scope.value = Math.floor(scope.value*100)/100;
        var oldSelectedPoint = scope.selectedPoint;
        scope.selectedPoint = _.findLastIndex(scope.points,function(item){
          return item.val<=scope.value;
        }) || 0;


        scope.selectedPoint = scope.selectedPoint>=0?scope.selectedPoint:0;
        if(oldSelectedPoint != scope.selectedPoint){
          sounds.play('chop1');
        }
          scope.ngModel = Math.floor(scope.value*100);


        scope.headPosition = scope.value*(scope.width-8);
      }

      function firstPositioning(){
        scope.value = scope.ngModel/100;
        scope.selectedPoint = _.findLastIndex(scope.points,function(item){
          return item.val<scope.value;
        }) || 0;
        scope.selectedPoint = scope.selectedPoint>=0?scope.selectedPoint:0
        scope.headPosition = scope.value*(scope.width-8);
        scope.onChange(null,scope.points[scope.selectedPoint]);
      }
      firstPositioning();
    }
  };
}]);
