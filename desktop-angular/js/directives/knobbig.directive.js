angular.module('potbot').directive('pbKnobBig', ['lodash','$timeout', 'rollovermodal','sounds','dataLayer','pbConst', function(_, $timeout, rollovermodal, sounds,dataLayer,pbConst) {
  return {
    restrict: 'E',
    scope:{
      matter:'=',
      index:'=',
      animated:'@'
    },
    //templateUrl: !window.cordova?'js/directives/knobbig-anim.tmpl.html':'js/directives/knobbig.tmpl.html',
    templateUrl: 'js/directives/knobbig.tmpl.html',
    link: function (scope, element) {

      scope.baseUrl = dataLayer.baseUrl();
      scope.showDetails = function (){

        sounds.play('chop3');
        rollovermodal.show('templates/modal/strain.rollover.tmpl.html', scope.matter);
      };

      scope.show = false;

      scope.radius = 55;

      scope.showToggle = function(){
        scope.show = !scope.show;
      };

      var animationCallback = null;
      var colors = pbConst.takeFromMatters('color');
      var partsLabel = pbConst.takeFromMatters('name');
      var partsLimits = pbConst.takeFromMatters('limit');

      var parts_setup={
        qty:colors.length,
        startAngle:0,
        endAngle:110
      };

      scope.parts = [];
      var step = (360)/parts_setup.qty;

      var stepsLengths = _.map(partsLabel,function(item){
        //console.log('EE ',item,scope.matter[String(item).toLowerCase()+'To'],_.findLast(pbConst.matters,{name:item}));
        return +scope.matter[String(item).toLowerCase()+'To']/ _.findLast(pbConst.matters,{name:item}).limit
      });
      //scope.parts.push({
      //  startAngle:-parts_setup.startAngle,
      //  //endAngle:parts_setup.startAngle+360,
      //  endAngle:-parts_setup.endAngle,
      //  swap:1,
      //  id:0,
      //  label: partsLabel[0],
      //  show:false,
      //  containsValue:getValue(partsLabel[0]),
      //  bgColor:'#eee',
      //  color:colors[0]
      //});


      for(var ii=0;ii<parts_setup.qty;ii++){

        scope.parts.push({
          startAngle:-(parts_setup.startAngle+step*(ii)),
          endAngle:-(parts_setup.startAngle+step*(ii+1)),
          filledBy:-(parts_setup.startAngle+step*(ii+Math.min(1,stepsLengths[ii]))),
          id:ii,
          label: partsLabel[ii],
          containsValue:getValue(partsLabel[ii]),
          show:false,
          bgColor:ii%2==0?'#eee':'#222',
          color:colors[ii]
        })

      }

      scope.centerImage = true;
      scope.selectMatter = function(){
        scope.centerImage = true;
        if(partAnimationTimeoutId){$timeout.cancel(partAnimationTimeoutId)}
        _.each(scope.parts,function(p){
            p.selected = false;
            p.show=false;
        });
        scope.matter.selected = true;
        animationCallback = function(){
          startPartsAnimation();
        };
        scope.startAnimation(true);
      }

      scope.selectPart = function(part){

        scope.centerImage = false;
        _.each(scope.parts,function(p){
          if(p.id==part.id){
            p.selected = true;
            p.show=true;
          }else{
            p.selected = false;
            p.show=false;
          }
        })
      };


      scope.hoverStrain = function(state){
        scope.matter.hover=state;
      };
      scope.hoverMatter = function(part,state){

        scope.centerImage = !state;
        _.each(scope.parts,function(p){
          if(p.id==part.id){
            p.selected = state;
            //p.show=state;
          }else{
            p.selected = false;
            //p.show=false;
          }
        })
      };

      var delay = 150;
      var pause = 500;
      var i = 0;



      //scope.startAnimation = function(direction){
      //  if(direction){
      //    i=0;
      //    playForward();
	  //
      //  }else{
      //    playBackward();
      //  }
      //};
      //function playForward(offOneByOne){
      //  $timeout(function(){
      //    if(i<scope.parts.length){
      //      scope.parts[i].show=true;
      //      playForward();
      //      i++;
      //    }else{
      //      i--;
      //      $timeout(function(){
      //        scope.startAnimation(false)
      //      },pause)
      //    }
      //  },delay);
      //}
      //function playBackward(){
      //  $timeout(function(){
      //    if(i>=0){
      //      if(i!=scope.matter.id){
      //        scope.parts[i].show=false;
      //      }
      //      playBackward();
      //      i--;
      //    }else{
      //      if(animationCallback){
      //        animationCallback();
      //      }
      //    }
      //  },delay);
      //}
	  //
      //if(scope.index==0){
      //  animationCallback = function(){
      //    startPartsAnimation();
      //  };
      //}
	  //
      ////scope.startAnimation(true);
      //if(scope.index==0) {
      //  startPartsAnimation();
      //}
	  //
      //var partAnimationTimeoutId;
      //function startPartsAnimation(){
      //  var currentPart = 0;
      //  function partAnimation(){
      //    partAnimationTimeoutId = $timeout(function(){
      //      if(scope.parts[currentPart]){
      //        scope.selectPart(scope.parts[currentPart]);
      //        currentPart++;
      //        partAnimation();
      //      }else{
      //        _.each(scope.parts,function(p){
      //            p.selected = false;
      //            p.show=false;
      //            scope.centerImage = true;
      //        });
      //      }
      //    },700);
      //  }
      //  partAnimation();
      //}


      function getValue(pid){
        return scope.matter[pid.toLowerCase()+'From'];
      }
    }
  };
}]);
