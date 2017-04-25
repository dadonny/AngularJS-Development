angular.module('potbot').controller('CreateProfileCtrl',['$scope', 'lodash', '$state', 'dataLayer', 'pagemanager', 'pbUser','pbModals', 'sounds','$rootScope', function($scope,_, $state, dataLayer, pagemanager, pbUser,pbModals,sounds, $rootScope) {

  $scope.user = pbUser.getData();
  var pageTurn = pagemanager.init($scope);

  var emailregex = /(?:[a-z0-9!#$%&'*+/=?^_`{|}~-]+(?:\.[a-z0-9!#$%&'*+/=?^_`{|}~-]+)*|"(?:[\x01-\x08\x0b\x0c\x0e-\x1f\x21\x23-\x5b\x5d-\x7f]|\\[\x01-\x09\x0b\x0c\x0e-\x7f])*")@(?:(?:[a-z0-9](?:[a-z0-9-]*[a-z0-9])?\.)+[a-z0-9](?:[a-z0-9-]*[a-z0-9])?|\[(?:(?:25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)\.){3}(?:25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?|[a-z0-9-]*[a-z0-9]:(?:[\x01-\x08\x0b\x0c\x0e-\x1f\x21-\x5a\x53-\x7f]|\\[\x01-\x09\x0b\x0c\x0e-\x7f])+)\])/i;
  var passregex = /^.{3,114}$/i;

  $scope.pobject = {
    firstName:(!pbUser.isGuest() && $scope.user.name && $scope.user.name.first)?$scope.user.name.first:'',
    lastName:(!pbUser.isGuest() && $scope.user.name && $scope.user.name.last)?$scope.user.name.last:'',
    email:(!pbUser.isGuest() && $scope.user.email)?$scope.user.email : '',
    password:'',
    matchingPassword:'',
    guest: true
  };

  pageTurn.next(function(next){
    console.log('pageturn');
    $scope.pobject.profile = _.clone($scope.user,true);

    if ($scope.pobject.guest == false) {
      $scope.user.name = {first: $scope.pobject.firstName, last:$scope.pobject.lastName};
      $scope.user.email = $scope.pobject.email;
    } else {
      //pbUser.setUserOptions({authed:'guest'});
      //pbUser.setUserOptions({dataPutOnServer:true});
      //pbUser.setUserOptions({currentAilment:pbUser.getData().ailments[0]});
      //console.log('guest user saved');
      //next();
    }

    var pobj_data = _.clone($scope.pobject);
    if ($scope.pobject.guest == true) {
      //pobj_data.email = makeid() + '@potbotics.com';
      //pobj_data.password = pobj_data.email;
      //pobj_data.matchingPassword = pobj_data.email;
    }

    dataLayer.httpPost('/user/registration', false, pobj_data).then(function(data){

      //var headers = {authorization : "Basic "
      //+ btoa(pobj_data.email + ":" + pobj_data.password)
      //};

      var headers;

      if ($scope.pobject.guest == true) {
        headers = {authorization : "Basic "
        + btoa(data.data.email + ":" + data.data.password)
        };

      } else {
        headers = {authorization : "Basic "
        + btoa($scope.pobject.email + ":" + $scope.pobject.password)
        };

      }

      pbUser.setUserOptions({authed:headers});
      pbUser.setUserOptions({dataPutOnServer:true});
      pbUser.setUserOptions({currentAilment:pbUser.getData().ailments[0]});
      next();

      //dataLayer.httpPut('/user/profile',pbUser.getData()).then(function(){
      //  pbUser.setUserOptions({dataPutOnServer:true});
      //  pbUser.setUserOptions({currentAilment:pbUser.getData().ailments[0]});
      //  console.log('user saved');
      //  next();
      //},function(err){
      //  console.error(err)
      //});
    },function(err){
      console.error(err);
    })
  });

  $scope.errorObj = {};

  $scope.createProfile = function(){
    if(checkFields()){
      $scope.pobject.guest = false;
      pbUser.setUserOptions({guest:false});
      $scope.gotoNext()
    }else{
      console.log('err',$scope.errorObj)
      //do nothing
    }
  };

  $scope.guest = function(){
    $scope.gotoNext()
  };

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

      if(fromState.name!='createprofile'){
        off();
        return;
      }
      if (skipSomeAsync || pbUser.isGuest()) {
        off();
        return;
      }
      event.preventDefault();
      nextState = toState;

      if(!compare($scope.pobject,$scope.user) && !toParams.isHard){
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


  function compare(a,b){
    console.log(a,b);
    return (a.firstName == b.name.first) && (a.lastName == b.name.last) && (a.email == b.email);
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
    $scope.errorObj.email = false;
    if(!$scope.pobject.email || !emailregex.test($scope.pobject.email)){
      $scope.errorObj.email = true;
      return
    }

    if (pbUser.isGuest()) {
      if(checkFields()){
        $scope.pobject.profile = _.clone($scope.user,true);

        $scope.pobject.guest = false;
        $scope.user.name = {first: $scope.pobject.firstName, last:$scope.pobject.lastName};
        $scope.user.email = $scope.pobject.email;

        var guestFavStrains = [];
        var ailmentId, strainId;

        _.forEach($scope.user.favoriteStrains, function(s, key) {
          var guestFavStrain = {};
          guestFavStrain = {ailmentId: key, strainIds: []};

          var _strainIds = [];

          _.forEach(s, function (_strain) {
            _strainIds.push(_strain.id);
          });

          guestFavStrain['strainIds'] = _strainIds;

          guestFavStrains.push(guestFavStrain);
        });

        if (!_.isEmpty(guestFavStrains)) {
          $scope.pobject['guestFavoriteStrains'] = guestFavStrains;
        }

        dataLayer.httpPost('/user/registration', false,$scope.pobject).then(function(data){

          var headers = {authorization : "Basic "
          + btoa($scope.pobject.email + ":" + $scope.pobject.password)
          };
          pbUser.setUserOptions({authed: headers});
          pbUser.setUserOptions({guest: false});
          pbUser.setUserOptions({dataPutOnServer:true});
          pbUser.setUserOptions({currentAilment:pbUser.getData().ailments[0]});
          pbUser.setUserOptions({name:{first:$scope.pobject.firstName,last:$scope.pobject.lastName},email:$scope.pobject.email});

          if ($scope.saveUserDialogModal.done) {
            $scope.saveUserDialogModal.done();
          }else{
            skipSomeAsync = true;
            gotoBackToApp();
          }
          if ($scope.saveUserDialogModal.isShown()) {
            $scope.saveUserDialogModal.hide();
          }

        },function(err){
          console.error(err);
        })

      }else{
        console.log('err',$scope.errorObj)
        //do nothing
      }


    } else {
      dataLayer.httpPut('/user/account',$scope.pobject).then(function() {
        //var headers = {authorization : "Basic "
        //+ btoa($scope.pobject.email + ":" + $scope.pobject.password)
        //};
        //pbUser.setUserOptions({authed:headers});
        console.log('>>',$scope.pobject.firstName,$scope.pobject.lastName)
        pbUser.setUserOptions({name:{first:$scope.pobject.firstName,last:$scope.pobject.lastName},email:$scope.pobject.email});

        if ($scope.saveUserDialogModal.done) {
          $scope.saveUserDialogModal.done();
        }else{
          skipSomeAsync = true;
          gotoBackToApp();
        }
        if ($scope.saveUserDialogModal.isShown()) {
          $scope.saveUserDialogModal.hide();
        }

      },function(err){
        console.error(err);
      });

    }
  };

  function gotoBackToApp(){
    pagemanager.go('results.overview');
  }
  function checkFields(){
    $scope.errorObj = {};


    //if(!$scope.pobject.firstName){
    //  $scope.errorObj.firstname = true;
    //}
    //
    //if(!$scope.pobject.lastName){
    //  $scope.errorObj.lastname = true;
    //}

    if(!$scope.pobject.email || !emailregex.test($scope.pobject.email)){
      $scope.errorObj.email = true;
    }


    if(!$scope.pobject.password || !passregex.test($scope.pobject.password)){
      $scope.errorObj.pass = true;
    }else if($scope.pobject.password != $scope.pobject.matchingPassword){
      $scope.errorObj.pass2 = true;
    }

    return _.isEmpty($scope.errorObj);

  }

  function makeid()
  {
    var text = "";
    var possible = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";

    for( var i=0; i < 15; i++ )
      text += possible.charAt(Math.floor(Math.random() * possible.length));

    return text;
  }



}]);
