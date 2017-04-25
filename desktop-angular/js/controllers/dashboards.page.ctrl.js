angular.module('potbot').controller('DashboardCtrl', ['$scope', 'pageTitles', '$state','$rootScope','ailments','pbUser','lodash',
  function($scope, pageTitles, $state,$rootScope, ailments,pbUser,_) {
    $scope.ailments = _.clone(ailments,true);
    //console.log('ailments',ailments)
    $scope.user = pbUser.getData();


    //$scope.currentAilment = _.findLast($scope.ailments,{id:$scope.user.ailment.id});
    $scope.currentAilment = $scope.user.currentAilment?$scope.user.currentAilment:$scope.ailments[0];
    pbUser.setUserOptions({currentAilment:$scope.currentAilment});
    $scope.currentAilment.selected = true;

    //console.log(' A O PPP ',$scope.user.ailment.id,$scope.ailments,$scope.currentAilment)

    $scope.$watch('currentAilment',function(nv,ov){
      if(nv && nv.id != ov.id){
        pbUser.setUserOptions({currentAilment:$scope.currentAilment});
        $rootScope.$broadcast('currentAilmentChanged', nv);
      }
    },true);
    //$scope.currentAilment

    $scope.pageTitle = pageTitles[$state.current.name];



    $rootScope.$on('$stateChangeStart', function(event, toState, toParams, fromState, fromParams) {
      $scope.pageTitle = pageTitles[toState.name];
    });
  }]);
