angular.module('potbot').controller('DispDetailsCtrl',['$scope', 'dataLayer', 'sounds', function($scope, dataLayer, sounds) {
  $scope.noMoreData = false;
  $scope.listData = [];
  var optsObj = {limit:20,offset:0};
  $scope.loadMore =  function(){

    dataLayer.httpGet('/dispensaries/'+$scope.$parent.state.data.id+'/acceptedReviews', true, optsObj).then(function(res) {
      $scope.listData = _.union($scope.listData,res.data);
      optsObj.offset+=optsObj.limit;
      $scope.$broadcast('scroll.infiniteScrollComplete');
      if(!res.data || !res.data.length || res.data.length<optsObj.limit){
        $scope.noMoreData = true;
      }
    });
  }

}]);
