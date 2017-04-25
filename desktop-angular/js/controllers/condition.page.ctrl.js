angular.module('potbot').controller('ConditionCtrl',['$scope', '$state', 'dataLayer', 'pagemanager','ailmentsList', 'pbUser','pbModals', 'sounds','$rootScope','lodash', function($scope, $state, dataLayer, pagemanager, ailmentsList, pbUser,pbModals,sounds, $rootScope, _) {

  $scope.isTouch = !!window.cordova;
  $scope.user = pbUser.getData();
  var pageTurn = pagemanager.init($scope);



  $scope.ailmentSelected = function(e,item){
    sounds.play('chop1');

    // For multi items just remove this thing and do find or reduce

    _.each($scope.ailmentsList,function(a){

      if(item.id  == a.id){
        a.selected = !a.selected;
        //if(!a.selected){
          //$scope.user.ailment.id = null;
          //$scope.user.ailment.name = null;
        //}else{
          //$scope.user.ailment = _.clone(a);
        //}
      }
      $scope.user.ailments = _.filter($scope.ailmentsList,{selected:true})
    })

  };


  pbModals.addModal($scope, 'templates/modal/error-modal.html', function(modal){
    $scope.errorModal = modal;
  });

  pbModals.addModal($scope, 'templates/modal/guest-motivate-modal.html', function(modal){
    $scope.guestMotivateModal= modal;

    $scope.guestMotivateModal.goToSave = function() {
      $state.go('createprofile');
      $scope.guestMotivateModal.hide();
    }
    $scope.guestMotivateModal.skip = function() {
      $scope.guestMotivateModal.hide();
      gotoBackToApp();
    }
  });

  pageTurn.next(function(next){
   if(_.isEmpty($scope.user.ailments)){
      $scope.errorModal.message="Please Select Your Condition"
      $scope.errorModal.show();
      return;
    }
    if($scope.user.hasMedicalCannabisCard == null){pbUser.setUserOptions({hasMedicalCannabisCard:false});}
      next();
  });

  $scope.ailmentsList = _.clone(ailmentsList.data,true);
  //$scope.ailmentSelected(null,{id:$scope.user.ailment});
  //select all user ailments
  console.log('Q!',$scope.ailmentsList,$scope.user.ailments)
  _.each(_.intersectionBy($scope.ailmentsList,$scope.user.ailments,'id'),function(item){
    console.log('Q+',item);
    item.selected = true;
  });


  //create copy of user object to compare in future
  var nextState;
  var skipSomeAsync = true;
  if($scope.user.authed){
    pbModals.addModal($scope, 'templates/modal/save-user-dialog-modal.html', function(modal){
      $scope.saveUserDialogModal = modal;
    });
    pbUser.createACopy();
    skipSomeAsync = false;

    var off = $rootScope.$on('$stateChangeStart', function(event, toState, toParams, fromState, fromParams) {

      if(fromState.name!='condition'){
        off();
        return;
      }
      if (skipSomeAsync || pbUser.isGuest()) {
        off();
        return;
      }
      event.preventDefault();
      nextState = toState;

      if(pbUser.isChanged() && !toParams.isHard){
        $scope.showSaveDialog(continueNavigation);
      }else{
        continueNavigation();
      }

      skipSomeAsync = false;
      function continueNavigation () {
        var params = angular.copy(toParams);
        skipSomeAsync = true;
        off();
        $state.go(toState.name, params);

      }

    });
  }else{

  }



  $scope.showSaveDialog = function(done){
    $scope.saveUserDialogModal.show();
    $scope.saveUserDialogModal.done = done;
  };

  $scope.restoreUser = function(){
    pbUser.restoreUser();
    if($scope.saveUserDialogModal.done){$scope.saveUserDialogModal.done();}
    if($scope.saveUserDialogModal.isShown()){$scope.saveUserDialogModal.hide();}
  };



  //$scope.cancel = function(){
  //  saveUserDialogModal.hide()
  //}


  $scope.saveUser = function(){
    if(pbUser.isChanged()) {

      if (pbUser.isGuest()) {
        $scope.guestMotivateModal.show();
      }
      dataLayer.httpPut('/user/profile', $scope.user).then(function (res) {
        console.log('saved ', res);
        if ($scope.saveUserDialogModal.done) {
          $scope.saveUserDialogModal.done();
        }
        if ($scope.saveUserDialogModal.isShown()) {
          $scope.saveUserDialogModal.hide();
        }
        gotoBackToApp();
      }, function (err) {
        console.error(err);
      })
    }else{
      gotoBackToApp();
    }
  };

  function gotoBackToApp(){
    skipSomeAsync = true;
    pagemanager.go('results.overview');
  }
}]);
