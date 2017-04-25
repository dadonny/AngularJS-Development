angular.module('potbot').controller('DashboardAilmentCtrl', ['$scope', '$state', 'lodash', 'dataLayer', 'pagemanager', 'sounds', 'pbUser','$rootScope',
  function($scope, $state, _, dataLayer, pagemanager,  sounds, pbUser,$rootScope) {
      $scope.user = pbUser.getData();
      //$scope.articles = articles.data;
      $scope.toggleOpen = function(a){
        a.opened = !a.opened;
      };


    $scope.currentAilment = pbUser.getData().currentAilment;

    $rootScope.$on('currentAilmentChanged', function(event, ca) {
      $scope.currentAilment = ca;
      $scope.getArticles();
    });

    $scope.openResearchArticleLink = function(artice){
      dataLayer.httpPost('/user/researchArticles/'+artice.id+'/openLinkAction',false).then(function(resp){
        console.log('log open research articles posted');
      });
    };

    $scope.getArticles  = function(){
      //$scope.strains = null;
      //$scope.strainsLoaded = false;
      //dataLayer.httpGet('/user/ailments/'+$scope.currentAilment.id+'/favoriteStrains',false, {}).then(function(data){
      //  $scope.strains = _.isEmpty(data.data)?null:data.data;
      //  $scope.strainsLoaded = true;
      //})
      //resolve:{
      //  articles: function(dataLayer, pbUser){

          return dataLayer.httpGet('/ailments/'+$scope.currentAilment.id+'/researchArticles',false).then(function(data){
            $scope.articles = data.data;
          });
        //}
      //}
    };
    $scope.getArticles();
  }]);
