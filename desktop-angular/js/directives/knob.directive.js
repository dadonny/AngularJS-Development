angular.module('potbot').directive('pbKnob', ['lodash','$timeout','pbConst', function(_, $timeout,pbConst) {
  return {
    restrict: 'E',
    scope:{
      matter:'=',
      preventAnimation:'=',
      fromZero:'@'
    },
    templateUrl: 'js/directives/knob.tmpl.html',
    link: function (scope, element) {
      scope.show = false;

      scope.radius = 95;

      scope.showToggle = function(){
        scope.show = !scope.show;
      };


      scope.$watch(function(){
        return scope.matter.from+"_"+scope.matter.to;
      },function(nv,ov){
        if(nv && ov && nv!=ov){
          processProcents()
        }
      })
      //var parts_setup={
      //  qty:colors.length-1,
      //  startAngle:110,
      //  endAngle:250
      //};

      function processProcents(){
        scope.matter.from = Number(scope.matter.from).toFixed(3);
        scope.matter.to = scope.matter.to?Number(scope.matter.to).toFixed(3):scope.matter.to;
        var offset = 0.001;

        scope.part= {
          startAngle: scope.fromZero?0:-Math.min(360,(scope.matter.from/limits[scope.matter.id]*360)),
          endAngle: -Math.min(360,(scope.matter.to/limits[scope.matter.id]*360))+offset,
          id: scope.matter.id,
          show: false,
          swap:false,
          color: colors[scope.matter.id]
        };
        console.log('...',scope.part)
        //function processLastPart(number){
        //  var pp = number - Math.abs(number);
        //  if(String(pp).length<2)
        //  return
        //}
      }
      var colors = pbConst.takeFromMatters('color');
      var partsLabel = pbConst.takeFromMatters('name');
      var limits = pbConst.takeFromMatters('limit');
      processProcents();

      //var colors = [
      //  '#4FB1A4',
      //  '#74B65F',
      //  '#80CC28',
      //  '#C3D651',
      //  '#4FB1A4',
      //  '#6CA9E0'
      //];
	  //
      //var limits = [
      //  22.117,
      //  9,
      //  0.373,
      //  0.4,
      //  0.398,
      //  0.03
      //];


      //scope.parts = [];


      console.log('>',scope.matter.name,': ',scope.matter.to,limits[scope.matter.id], '[',Math.min(100,Math.round((scope.matter.to/limits[scope.matter.id]*100))),'%]',scope.part);
      //scope.parts.push({
      //  startAngle:parts_setup.endAngle,
      //  endAngle:parts_setup.startAngle+360,
      //  swap:1,
      //  id:0,
      //  show:false,
      //  color:colors[0]
      //})
      //for(var i=1;i<=parts_setup.qty;i++){
	  //
      //  scope.parts.push({
      //    startAngle:parts_setup.startAngle+step*(i-1),
      //    endAngle:parts_setup.startAngle+step*(i),
      //    id:i,
      //    show:false,
      //    bgColor:i%2==0?'#eee':'#222',
      //    color:colors[i]
      //  })
      //}

	//
    //var delay = 300;
    //var pause = 500;
    //var i = 0;

      //scope.startAnimation = function(direction){
      //  if(direction){
      //    playForward();
	  //
      //  }else{
      //    playBackward();
      //  }
      //};
      //function playForward(){
      //  $timeout(function(){
      //    //if(i<scope.parts.length){
      //    //  if(i==scope.matter.id) {
      //    //    scope.parts[i].show=true;
      //    //  }
		//  //
      //    //  playForward();
      //    //  i++;
      //    //}else{
      //    //  //i--;
      //    //  //  $timeout(function(){
      //    //  //    scope.startAnimation(false)
      //    //  //  },pause)
      //    //}
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
	  //
      //    }
      //  },delay);
      //}
      //if(scope.preventAnimation){
      //  _.each(scope.parts,function(p){
      //      p.show=(p.id==scope.matter.id);
      //  });
	  //
      //}else {
      //  scope.startAnimation(true);
      //}
    }
  };
}]);
