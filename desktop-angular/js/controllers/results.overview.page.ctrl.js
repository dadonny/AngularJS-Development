angular.module('potbot').controller('ResultsOverviewCtrl',
  ['$scope', '$state', 'dataLayer', 'pagemanager', 'lodash', '$ionicSlideBoxDelegate', 'ratios','$timeout', 'rollovermodal', 'pbUser','sounds','pbConst','$rootScope','ailments',
    function($scope, $state, dataLayer, pagemanager,_,$ionicSlideBoxDelegate,ratios, $timeout, rollovermodal, pbUser, sounds, pbConst,$rootScope,ailments) {

  pagemanager.init($scope);

  $scope.sounds = sounds;
  $scope.user = pbUser.getData();

  $scope.showVideo = function (){
    sounds.play('chop3');
    rollovermodal.show('templates/modal/video.rollover.tmpl.html', {});
  };

      //$rootScope.$on('currentAilmentChanged', function(event, ca) {
      //
      //});

    var off = $rootScope.$on('$stateChangeStart', function(event, toState, toParams, fromState, fromParams) {
      if (fromState.name != 'results.overview') {
        return;
      }
      $scope.matters = [];
          off();
    });

  var selected = null;
  $scope.$on('$destroy',function(){
    console.log('on d ')
    if($scope.matters[selected]){
      $scope.matters[selected].onHide();
    }
  });
  $scope.selectMatter = function(matter, dontAffectOnSlider){

    if(matter.id == selected){
      return;
    }else if(selected>=0){
      if($scope.matters[selected]){$scope.matters[selected].onHide()};
    }

    selected = matter.id;
    _.each($scope.matters, function(item){

      if(item.id===matter.id){
        item.selected = true;
        $scope.content = item;
        if(!dontAffectOnSlider){$ionicSlideBoxDelegate.slide(_.indexOf($scope.matters,item));}
        if(item.onShown){item.onShown()}
      }else{
        item.selected = false;
      }
    })
  };


  $scope.nextMetter = function(){
    var selectedIndex = _.indexOf($scope.matters,_.find($scope.matters, {selected:true}));
    var nextIndex = (selectedIndex >= ($scope.matters.length-1))?0:selectedIndex+1;
    $scope.selectMatter($scope.matters[nextIndex]);

  };

  $scope.prevMetter = function(){
    var selectedIndex = _.indexOf($scope.matters,_.find($scope.matters, {selected:true}));
    var nextIndex = (selectedIndex <= 0)?($scope.matters.length-1):selectedIndex-1;
    $scope.selectMatter($scope.matters[nextIndex]);

  };

  $scope.nextSlide = function() {
    $ionicSlideBoxDelegate.next();
  };

  $scope.previousSlide = function() {
    $ionicSlideBoxDelegate.previous();
  };

  $scope.onSlideChanged = function(index){
    sounds.play('chop1');
    $scope.selectMatter($scope.matters[index],true);
  };

  $scope.matters = _.clone(pbConst.matters,true);

  function processRatios(rat){
    //$scope.matters = _.clone(pbConst.matters,true);
    _.each($scope.matters,function(item){
      item.from = rat.data[item.name.toLowerCase()+'From'];
      item.to = rat.data[item.name.toLowerCase()+'To'];
      item.show=false;

    });
  }
  processRatios(ratios);
  function loadRatios(){
    dataLayer.httpGet('/ailments/'+$scope.currentAilment.id+'/recommendedRatio',false, {cannabisExperience:$scope.user.cannabisExperience}).then(function(rat) {
      processRatios(rat);
    });
  };

      //$rootScope.$on('currentAilmentChanged', function(event, ca) {
      //
      //});

  function waitForEachSlideReady(){
    var isReady = _.every($scope.matters, function(matter){
      return matter.onShown && matter.onHide;
    });

    if(isReady){
      $scope.selectMatter($scope.matters[0]);
    }else{
      $timeout(waitForEachSlideReady,100)
    }
  }
      $timeout(function () {
        //DOM has finished rendering
        waitForEachSlideReady();
      },1);

      $scope.ailments = _.sortBy(ailments,'name');
      $scope.currentAilment = $scope.user.currentAilment?$scope.user.currentAilment:$scope.ailments[0];
      pbUser.setUserOptions({currentAilment:$scope.currentAilment});
      //$scope.currentAilment.selected = true;

      $scope.ailmentsChanged = function(ailment){
        console.log('>>!! ',ailment);
        $scope.currentAilment = ailment;
        pbUser.setUserOptions({currentAilment:$scope.currentAilment});
        //reloadStrains();
        $scope.user = pbUser.getData();
        loadRatios();
        console.log('CAC',$scope.user);
      };


}]);
