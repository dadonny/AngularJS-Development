angular.module('potbot').controller('DisclaimerCtrl', ['$scope', '$state', 'dataLayer', 'pagemanager','pbModals', function($scope, $state, dataLayer, pagemanager,pbModals) {
  //$scope.prevNext, $scope.gotoNext, $scope.gotoPrev
  var pageTurn = pagemanager.init($scope);

  pbModals.addModal($scope, 'templates/modal/disclamer-modal.html', function(modal){
    $scope.errorModal = modal;
  });



  pageTurn.prev(function(next){
    console.log('PREV disc')
      $scope.errorModal.message="You're about to  <span class='text-highlighted'> navigate away </span> from this page"
      $scope.errorModal.buttonCallback = next;
      $scope.errorModal.show();
      return;
  });

  //$scope.$on('modal.hidden', function() {
    //$scope.errorModal.buttonCallback();
  //});

  $scope.okbutton = function(){
    $scope.errorModal.hide();
    $scope.errorModal.buttonCallback();
  };

  $scope.disclaimerTextUrl = 'templates/disclaimer-text.html'
}]);
