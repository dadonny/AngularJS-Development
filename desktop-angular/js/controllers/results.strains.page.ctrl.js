angular.module('potbot').controller('ResultsStrainsCtrl', ['$scope', '$state', 'lodash', 'dataLayer', 'pagemanager', 'strains', 'strainTypes', 'rollovermodal','pbUser','pbConst','$timeout','$rootScope','pbModals','ailments',
  function($scope, $state, _, dataLayer, pagemanager, strains, strainTypes, rollovermodal, pbUser,pbConst,$timeout,$rootScope,pbModals,ailments) {

  $scope.user = pbUser.getData();
    var lastRawStrains = strains.data;
  var strainsLoadQty = 3;
  $scope.strainsLimit = strainsLoadQty*2;
  var colors = pbConst.typeColors;




    //$scope.strainTypes = _.map(strainTypes.data.effectiveStrainTypes, function(type, key){
    //  var id = _.reduce(type.split('_'),function(total, n){
    //    return total+ n.split('')[0];
    //  },'');
    //  return {
    //    label: strainTypes.data.effectiveStrainTypesNames[key],
    //    key:key,
    //    color:colors[id],
    //    id:id
    //  }
    //});


    function processStrains(data,filters){
      $scope.strainsToShow = [];
      var filterObj='type_id';
      var sortObj = 'name';
      if(filters){
        sortObj = function(item){
          var filterType = filters[0].id;
          if(filterType=='alph') {
            return item.name;
          }else{
            return _.findLast(item.matters,{name:String(filterType).toUpperCase()}).to;
          }
        };

        filterObj = (filters[1]!='0')?function(item){
          return _.some(filters[1],function(ti){return ti == item.type_id})
        }:'type_id';
      }
      //$scope.strainTypesCurrent = _.clone($scope.strainTypes);

      var favStrains;

      if (pbUser.isGuest()) favStrains = $scope.user.favoriteStrains[$scope.user.currentAilment.id];

      $scope.strains = _.chain(data).map(function(s, key){

        var id = _.reduce(s.type.split('_'),function(total, n){
          return total+ n.split('')[0];
        },'');

        s.type_id = id;
        s.type_color = colors[id];
        var i =0 ;
        s.matters = _.map(['thc','cbd','cbn','cbc','thcv','cbg'],function(item){
          //s[item]=s[item+'From'];
          return {
            name:item.toUpperCase(),
            from:s[item+'From'],
            to:s[item+'To'],
            color: _.findLast(pbConst.matters,{name:String(item).toUpperCase()}).color,
            id:i++
          };
        });

        if (pbUser.isGuest()) {

          s.isFavorite = !_.isEmpty(_.filter(favStrains, {id: s.id}));
        }

        return s;
      }).tap(function(a){
          //$scope.strainTypesCurrent = _.filter($scope.strainTypes, function(item){
          //  return _.some(a,{type_id:item.id});
          //});
        console.log(' >>>>>>>> ',$scope.strainTypes)
        }).filter(filterObj).sortBy(sortObj).tap(function(a){
        //console.log()
        if(filters && filters[0] && filters[0].isDesc){
          return a.reverse();
        }else{
          return a;
        }
      }).value();


      if($scope.strains[0]){$scope.strains[0].animated = true;}
      if($scope.strains[1]){$scope.strains[1].animated = true;}
        if($scope.strains[1]){$scope.strains[2].animated = true;}




      //console.log('AA+ ',$scope.strains.length,"L:L",$scope.strains);
      //$scope.strainsToShow =_.concat($scope.strainsToShow,_.slice($scope.strains,0,$scope.strainsLimit));
      if($scope.swiper && $scope.swiper.update){
        $timeout(function(){
          $scope.swiper.update();
        },1)
      }
    }


    function processStrainTypes(){
      $scope.strainTypesCurrent = _.map(strainTypes.data.effectiveStrainTypes, function(type, key){
        var id = _.reduce(type.split('_'),function(total, n){
          return total+ n.split('')[0];
        },'');
        return {
          label: strainTypes.data.effectiveStrainTypesNames[key],
          key:key,
          color:colors[id],
          id:id
        }
      });
    }

    function reloadStrainTypes(){
      dataLayer.httpGet('/ailments/'+pbUser.getData().currentAilment.id,true).then(function(_strainTypes){
        strainTypes = _strainTypes
        processStrainTypes()
      })
    }

    $scope.applyFilters = function(){
      var filters = _.mapValues($scope.filterParams,'selected');
      filters[0] = {id:filters[0],isDesc:$scope.filterParams[0].isDesc}
      processStrains(lastRawStrains,filters);
    }

    function reloadStrains(){
      var data = {};
      data.limit = 50;
      data.offset = 0;
      data.ailment =  pbUser.getData().currentAilment.id;
      if (pbUser.isGuest()) {
        data.cannabisExperience = pbUser.getData().cannabisExperience;
      }
      dataLayer.httpGet('/user/getRecommendation',false, data).then(function(strains){
        processStrains(strains.data);
        lastRawStrains = strains.data;
      })
    }

    processStrains(strains.data);
    processStrainTypes();
      //$scope.strains.slice(0,$scope.strainsLimit);
    $scope.switchLikeStrain = function(strain){
      if(strain.isFavorite){
        $scope.unlikeStrain(strain);
      }else{
        $scope.likeStrain(strain);
      }
    };

    $scope.likeStrain = function(strain){
      var user = pbUser.getData();
      strain.isFavorite = true;
      if (pbUser.isGuest()) {
        var favStrainsAll = user.favoriteStrains;
        var emptyFavStrains = _.isEmpty(favStrainsAll);
        var favStrains = favStrainsAll[user.currentAilment.id];

        var isNew = !favStrains;

        if (isNew) {
          favStrains = new Array();
          favStrainsAll[user.currentAilment.id] = favStrains;
        }

        favStrains.push(strain);

        if (emptyFavStrains) {
          $scope.guestMotivateModal.show();
        }
      }

      dataLayer.httpPost('/user/ailments/'+user.currentAilment.id+'/favoriteStrains?strain='+strain.id,false,{});
    };
    $scope.unlikeStrain = function(strain){
      var user = pbUser.getData();
      strain.isFavorite = false;

      if (pbUser.isGuest()) {
        var favStrainsAll = user.favoriteStrains;
        var favStrains = favStrainsAll[user.currentAilment.id];

        var isNew = !favStrains;

        if (!isNew) {
          _.remove(favStrains, {id: strain.id});
        }

        if (_.isEmpty(favStrains))
          delete favStrainsAll[user.currentAilment.id];
      }

      dataLayer.httpDelete('/user/ailments/' + user.currentAilment.id + '/favoriteStrains/' + strain.id, false, {});
    };


    $scope.filterParams = [
      {id:'sort', type:'radio', isDesc:false, label:'SORT BY CANNABINOID %', selected:'alph', params:[

        {id:'alph', value:'alph', label:'Alphabetical', upLabel:'A - Z', downLabel:'Z - A'},
        {id:'thc', value:'thc', label:'THC', upLabel:'High - Low', downLabel:'Low - High'},
        {id:'cbd', value:'cbd', label:'CBD',upLabel:'High - Low', downLabel:'Low - High'},
        {id:'cbn', value:'cbn', label:'CBN',upLabel:'High - Low', downLabel:'Low - High'},
        {id:'cbc', value:'cbc', label:'CBC',upLabel:'High - Low', downLabel:'Low - High'},
        {id:'thcv', value:'thcv', label:'THCV',upLabel:'High - Low', downLabel:'Low - High'},
        {id:'cbg', value:'cbg', label:'CBG',upLabel:'High - Low', downLabel:'Low - High'}
      ]},
      {id:'filter', type:'star', label:'FILTER BY STRAIN TYPE', selected:['0'], params:[
        {id:'0', label:'All'},
        {id:'I', label:'Indica', subLabel:'(I)', subLabelColor:pbConst.typeColors['I']},
        {id:'ID', label:'Indica Dominant', subLabel:'(ID)', subLabelColor:pbConst.typeColors['ID']},
        {id:'H', label:'Hybrid', subLabel:'(H)', subLabelColor:pbConst.typeColors['H']},
        {id:'SD', label:'Sativa Dominant', subLabel:'(SD)', subLabelColor:pbConst.typeColors['SD']},
        {id:'S', label:'Sativa', subLabel:'(S)', subLabelColor:pbConst.typeColors['S']}
      ]}
    ];

    pbModals.addModal($scope, 'templates/modal/filter-strains-modal.tmpl.html', function(modal){
      $scope.filterModal = modal;
    });

    $scope.showFilter = function(){
      $scope.filterModal.show()
    };

    pbModals.addModal($scope, 'templates/modal/guest-motivate-modal.html', function(modal){
      $scope.guestMotivateModal = modal;

      $scope.guestMotivateModal.goToSave = function() {
        $state.go('createprofile');
        $scope.guestMotivateModal.hide();
      }
    });





    $scope.showDetails = function(s){
    //console.log('SDD');
    rollovermodal.show('templates/modal/strain.rollover.tmpl.html', s);
  };

  $scope.swiper = {};

  $scope.onReadySwiper = function (swiper) {
    $scope.swiper = swiper;
    //swiper.on('slideChangeStart', function () {
    //  console.log('slide start',$scope.strainsToShow.length);
	//
    //  $scope.strainsToShow = _.concat($scope.strainsToShow,_.slice($scope.strains,$scope.strainsLimit,$scope.strainsLimit+strainsLoadQty));
    //  $scope.strainsLimit+=strainsLoadQty;
    //});
	//
    //swiper.on('onSlideChangeEnd', function () {
    //  console.log('slide end');
    //  $scope.swiper.update();
    //  $timeout(function() {
    //    $scope.swiper.update();
    //    console.log('update');
    //  },500);
    //});
  };


    $scope.ailments = _.sortBy(ailments,'name');
    $scope.currentAilment = $scope.user.currentAilment?$scope.user.currentAilment:$scope.ailments[0];
    pbUser.setUserOptions({currentAilment:$scope.currentAilment});
    //$scope.currentAilment.selected = true;

    $scope.ailmentsChanged = function(ailment){
      console.log('>>!! ',ailment);
      $scope.currentAilment = ailment;
        pbUser.setUserOptions({currentAilment:$scope.currentAilment});
        reloadStrains();
        reloadStrainTypes()
    };



  pagemanager.init($scope);

}]);
