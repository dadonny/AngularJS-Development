angular.module('potbot').controller('ResultsMethodsCtrl', ['$scope', '$state', 'dataLayer', 'pagemanager', 'methods', 'ailment', 'lodash', '$rootScope','$timeout','ailments','pbUser', function($scope, $state, dataLayer, pagemanager, methods,ailment, _,$rootScope, $timeout,ailments,pbUser) {
  //var learnMoreHtml =" <span class=\"text-highlighted clickable\" ng-click=\"showMore()\">Learn more</span>";
    $scope.recommendedMethodsLabels = _.map(ailment.data.consumptionMethods,'name').join(', ');
    var recommended = _.map(ailment.data.consumptionMethods, 'id');

    var baseUrl = dataLayer.baseUrl();
    var rawMethods;

  //$rootScope.$on('currentAilmentChanged', function(event, ca) {
  //  recommended = _.map(ailment.data.consumptionMethods, 'id');
  //  getNewRecommended();
  //  processMethods(rawMethods);
  //});
  $scope.swiper = {};
  $scope.onReadySwiper = function (swiper) {
    $scope.swiper = swiper;
  };

  $scope.user = pbUser.getData();
  $scope.ailments = _.sortBy(ailments,'name');
  $scope.currentAilment = $scope.user.currentAilment?$scope.user.currentAilment:$scope.ailments[0];
  $scope.ailmentsChanged = function(ailment){
    $scope.currentAilment = ailment;
    pbUser.setUserOptions({currentAilment:$scope.currentAilment});
    dataLayer.httpGet('/ailments/' + $scope.currentAilment.id, false).then(function(ailment){
      recommended = _.map(ailment.data.consumptionMethods, 'id');
      $scope.recommendedMethodsLabels = _.map(ailment.data.consumptionMethods,'name').join(', ');
      processMethods(rawMethods);
    })
  };

    function loadMethods(){
    $scope.methods =[];
    console.log('loadMethods');
    dataLayer.httpGet('/consumptionMethods',false).then(function(data){
      rawMethods = data.data;
      processMethods(data.data);

    })
  }

  function processMethods(data){
    console.log('processMethods',data);
    _.each(_.clone(data),function(item){
      item.imageUrl = baseUrl+'/consumptionMethods/'+item.id+'/image';
      item.textDesc = $($.parseHTML(item.htmlReviewDesc)).html();
      item.isRecommended = _.includes(recommended,item.id);
      item.fullDescription = 'templates/content/methods.'+item.code+'.html';

      item.positionWeight = 100-(item.isRecommended?100:0) + (item.isLast?50:0);
    });

    $scope.methods = _.sortBy(data,'positionWeight');
    if($scope.swiper && $scope.swiper.update){
      $timeout(function(){
        $scope.swiper.update();
      },1)
    }

  }
  rawMethods = methods.data;
  processMethods(methods.data);
  pagemanager.init($scope);

}]);
