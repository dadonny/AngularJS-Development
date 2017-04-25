angular.module('potbot').controller('IndexCtrl', ['$scope', '$state','rollovermodal','$rootScope', function($scope, $state, rollovermodal, $rootScope) {

  $scope.showFeedback = function(){
    rollovermodal.show('templates/modal/feedback.rollover.tmpl.html', {});
  };
  $scope.$on('potbot:openFeedback',function(){
    rollovermodal.show('templates/modal/feedback.rollover.tmpl.html', {});
  });
  //$rootScope.$broadcast('potbot:openFeedback');
  $rootScope.$on('leftMenuStateCahnged',function(event,state){
    $scope.isMenuOpened = state;
    console.log('OP N',state);
  });
  //$scope.user = pbUser.getData();
}]);
