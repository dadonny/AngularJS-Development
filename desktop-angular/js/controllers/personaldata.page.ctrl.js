angular.module('potbot').controller('PersonaldataCtrl', ['$scope', '$state', 'dataLayer', 'pagemanager','pbUser','pbModals','sounds','$rootScope', "$http",
  function($scope, $state, dataLayer, pagemanager, pbUser, pbModals, sounds, $rootScope, $http) {

  $scope.cl = function(){
    sounds.play('chop1')
  };

  dataLayer.httpGet('/usStates',true).then(function(states){
    $scope.states = states.data;
    console.log('states',states.data);
  },function(err){
    console.error(err);
  });

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

  $scope.stateSelected = function(state){
    console.log('state selected ', state);
  }

  $scope.usageChanged = function(a,b){
    $scope.user.cannabisExperienceLabel = b.label;
  };

  var pageTurn = pagemanager.init($scope);
  pageTurn.next(function(next){
    if($scope.user.age<18){
      $scope.errorModal.message="You must be at least 18 years old to use PotBot's recommendation engine."
      $scope.errorModal.show();
      return;
    }else if(!$scope.user.weight || ($scope.user.sex == null) || !$scope.user.usState.code || $scope.user.usState.code==''){
      $scope.errorModal.message="Please select all fields and input valid values before advancing."
      $scope.errorModal.show();
      return;
    }
      next();
  });

    $scope.zipCode = '';
    $scope.getStateFromZipCode = function() {
      var zip = $scope.user.zipCode;

      if (zip && zip.length == 5) {
        var lat;
        var lng;
        var geocoder = new google.maps.Geocoder();

        var state;

        geocoder.geocode({ 'address': zip }, function (results, status) {
          if (status == google.maps.GeocoderStatus.OK) {
            geocoder.geocode({'latLng': results[0].geometry.location}, function(results, status) {
              if (status == google.maps.GeocoderStatus.OK) {
                if (results[1]) {
                  state = getCityState(results);

                  var usState = _.filter($scope.states, {name: state});

                  if (usState && !_.isEmpty(usState))
                    $scope.user.usState = usState[0];
                  else
                    $scope.user.usState = {};

                  $scope.$apply();

                }
              }
            });
          }
        });

        function getCityState(results)
        {
          var a = results[0].address_components;
          var city, state;
          for(i = 0; i <  a.length; ++i)
          {
            var t = a[i].types;
            if(compIsType(t, 'administrative_area_level_1'))
              state = a[i].long_name; //store the state
          }
          return (state)
        }

        function compIsType(t, s) {
          for(z = 0; z < t.length; ++z)
            if(t[z] == s)
              return true;
          return false;
        }

      } else {
        $scope.user.usState = {};
      }
    }



  $scope.user = pbUser.getData();

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

        if(fromState.name!='personaldata'){
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

        function continueNavigation () {
          off();
          var params = angular.copy(toParams);
          skipSomeAsync = true;
          $state.go(toState.name, params);
        }
        skipSomeAsync = false;
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

  $scope.saveUser = function(){
    if(pbUser.isChanged()) {
      if (pbUser.isGuest()) {
        $scope.guestMotivateModal.show();
      } else {

        if(!$scope.user.usState.code || $scope.user.usState.code==''){
          $scope.errorModal.message="Please input a valid ZIP Code."
          $scope.errorModal.show();
          return;
        }
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


    //$scope.$on('$destroy',function(){
    //  $rootScope.$off('$stateChangeStart');
    //})

    function gotoBackToApp(){
      skipSomeAsync = true;
      pagemanager.go('results.overview');
    }

}]);
