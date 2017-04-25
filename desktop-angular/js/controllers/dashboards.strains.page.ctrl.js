angular.module('potbot').controller('DashboardStrainsCtrl', ['$scope', '$state', 'lodash', 'dataLayer', 'pagemanager', 'sounds','pbUser','rollovermodal','$rootScope','pbConst',
  function($scope, $state, _, dataLayer, pagemanager,  sounds,pbUser, rollovermodal,$rootScope,pbConst) {

    $scope.editMode = false;
    $scope.toDelete = [];

    $scope.gotoPage = function(page){
      sounds.play('chop3');
      pagemanager.go(page);
    };



    function turnOffSelected(){
      _.each($scope.strains, function(item){
        item.selected=false;
      });
      $scope.toDelete = [];
    }

    function refreshData(){
      return dataLayer.httpGet('/user/ailments/' + $scope.currentAilment.id + '/favoriteStrains', false, {}).then(function(data){
        $scope.strains=processStrains(data.data);

      })
    }

    $scope.turnEditMode = function(isOn){
      turnOffSelected();
      $scope.editMode = isOn;
    };

    $scope.bulkDelete = function(){
      var user = pbUser.getData();
      var dt = _.reduce($scope.toDelete, function(total, item){
        return total+item.id+','
      },'');
      dt = _.trimRight(dt,',');
      dataLayer.httpDelete('/user/ailments/'+$scope.currentAilment.id+'/favoriteStrains?itemIds='+dt).then(function(){
        refreshData();
        $scope.turnEditMode(false);
      });
      turnOffSelected();
    };

    $scope.selectStrain = function(s){
      if(!$scope.editMode){
        rollovermodal.show('templates/modal/strain.rollover.tmpl.html', s);
        return;
      }
      s.selected = !s.selected
      $scope.toDelete = _.filter($scope.strains, {selected:true});
    };



    $scope.currentAilment = pbUser.getData().currentAilment;

    $rootScope.$on('currentAilmentChanged', function(event, ca) {
      $scope.currentAilment = ca;
      $scope.getStrains();
    });

    $scope.getStrains  = function(){
      $scope.strains = null;
      $scope.strainsLoaded = false;
      var user = pbUser.getData();



      if (pbUser.isGuest()) {
        $scope.strains = user.favoriteStrains[$scope.currentAilment.id];
        $scope.strainsLoaded = true;

      } else {
        dataLayer.httpGet('/user/ailments/'+$scope.currentAilment.id+'/favoriteStrains',false, {}).then(function(data){
          $scope.strains = _.isEmpty(data.data)?null:processStrains(data.data);
          $scope.strainsLoaded = true;
        })

      }
    };
    $scope.getStrains();




    function processStrains(strains){
      return _.map(strains,function(s, key){

        var id = _.reduce(s.type.split('_'),function(total, n){
          return total+ n.split('')[0];
        },'');
        s.type_id = id;
        s.type_color = pbConst.typeColors[id];
        var i =0 ;
        s.matters = _.map(['thc','cbd','cbn','cbc','thcv','cbg'],function(item){
          return {
            name:item.toUpperCase(),
            from:s[item+'From'],
            to:s[item+'To'],
            color: '#4FB1A4',
            id:i++
          };
        });
        return s;
      });
    }
  }]);
