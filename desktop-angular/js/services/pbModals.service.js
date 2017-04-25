angular.module('potbot').factory('pbModals', ['$ionicModal',function($ionicModal) {
    // Might use a resource here that returns a JSON array

    return {
      addModal:function($scope, templateURL, cb){
        if(!$scope || !templateURL || !cb){
          console.error('wrong modal arguments')
          return false;
        }
        function initDestroyer(){
          $scope.$on('$destroy', function() {
            _.each($scope.__modals_system_list,function(modal){
              modal.remove();
            });
          });
        }

        if(!$scope.__modals_system_list){
          $scope.__modals_system_list = [];
          initDestroyer();
        };

        var mid = new Date().getTime()+":"+Math.floor(Math.random()*999999999);


        $ionicModal.fromTemplateUrl(templateURL, {
          scope: $scope,
          animation: 'slide-in-down'
        }).then(function(modal) {
            $scope.__modals_system_list[mid] = modal;
            cb(modal)
        });
      }
    };
}]);
