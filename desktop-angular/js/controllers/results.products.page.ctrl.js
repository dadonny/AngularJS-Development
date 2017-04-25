angular.module('potbot').controller('ResultsProductsCtrl', ['$scope', '$state', 'dataLayer', 'pagemanager', 'products', 'lodash', '$rootScope','$timeout','pbUser', function($scope, $state, dataLayer, pagemanager, products,_,$rootScope, $timeout,pbUser) {
  //var learnMoreHtml =" <span class=\"text-highlighted clickable\" ng-click=\"showMore()\">Learn more</span>";

    var baseUrl = dataLayer.baseUrl();
    var rawProducts;

  //$rootScope.$on('currentAilmentChanged', function(event, ca) {
  //  recommended = _.map(ailment.data.products, 'id');
  //  getNewRecommended();
  //  processProducts(rawProducts);
  //});
  $scope.swiper = {};
  $scope.onReadySwiper = function (swiper) {
    $scope.swiper = swiper;
  };

  $scope.user = pbUser.getData();
  $scope.category = 'featured';
  $scope.category_labels = {
    'vaporizers': 'VAPORIZERS',
    'featured': 'FEATURED PRODUCTS',
    'parts': 'PARTS',
    'accessories': 'ACCESSORIES',
    'grinders': 'GRINDERS'
  }
  //$scope.ailments = _.sortBy(ailments,'name');
  //$scope.currentAilment = $scope.user.currentAilment?$scope.user.currentAilment:$scope.ailments[0];
  //$scope.ailmentsChanged = function(ailment){
  //  $scope.currentAilment = ailment;
  //  pbUser.setUserOptions({currentAilment:$scope.currentAilment});
  //  dataLayer.httpGet('/ailments/' + $scope.currentAilment.id, false).then(function(ailment){
  //    processProducts(rawProducts);
  //  })
  //};

  $scope.filterCategory = function(category) {
    $scope.category = category;
    if (category != 'featured') {
      dataLayer.httpGet('/products',false, {commonFilter: category}).then(function(data){
        rawProducts = data.data;
        processProducts(data.data);
      })
    } else {
      dataLayer.httpGet('/products/featured',false, {featured: true}).then(function(data){
        rawProducts = data.data;
        processProducts(data.data);
      })
    }
  }

  function processProducts(data){
    console.log('processProducts',data);
    _.each(_.clone(data),function(item){
      item.imageUrl = baseUrl+'/products/'+item.id+'/image';
      item.textDesc = item.description;
      item.company = item.company;
      item.features = item.features;
      //item.textDesc = $($.parseHTML(item.description)).html();
      //item.fullDescription = 'templates/content/products.'+item.code+'.html';

      //item.positionWeight = 100-(item.isRecommended?100:0) + (item.isLast?50:0);
    });

    $scope.products = data;
    //$scope.products = _.sortBy(data,'positionWeight');
    if($scope.swiper && $scope.swiper.update){
      $timeout(function(){
        $scope.swiper.update();
      },1)
    }

  }
  rawProducts = products.data;
  processProducts(products.data);
  pagemanager.init($scope);

}]);
