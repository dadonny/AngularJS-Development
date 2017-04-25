angular.module('potbot').controller('DashboardIndexCtrl', ['$scope', '$state', 'lodash', 'dataLayer', 'pagemanager', 'sounds','pbModals','rollovermodal','pbUser','$rootScope','$timeout','pbConst',
  function($scope, $state, _, dataLayer, pagemanager,  sounds,pbModals,rollovermodal, pbUser, $rootScope, $timeout,pbConst) {
    $scope.swiper = {};
    $scope.gotoPage = function(page){
      sounds.play('chop3');
      pagemanager.go(page);
    };

    $scope.venuesMenu = [
      {id:'dispensaries', label:'Nearby Dispensaries', selected:true},
      {id:'doctors', label:'Nearby Clinics', selected:false}
    ];

    $scope.venues = $scope.dispensaries;

    $scope.selectVenueMenu = function(item){
      if(!$scope.dispensariesLoaded){return;}
      _.each($scope.venuesMenu,function(a){
        if(a.id==item.id){
          a.selected = true;
          $scope.venues = $scope[a.id];
        }else{
          a.selected = false;
        }
      });
    }

    $scope.viewProfile = function(item){
      var type = $scope.venuesMenu[0].selected?'dispensaries':'doctors';

        dataLayer.httpGet('/'+type+'/'+item.id+'/acceptedReviews', true, {limit:20}).then(function(res) {

          item.reviews = res.data;
          //item.getDirectionsToMarker = function(item){
          //  $scope.getDirectionsToMarker(item);
          //  rollovermodal.hide();
          //}
          item.showSumbitReviewModal = $scope.showSumbitReviewModal;
          if(type=='doctors'){
            rollovermodal.show('templates/modal/doctor-details.rollover.tmpl.html', item);
          }else{
            rollovermodal.show('templates/modal/disp-details.rollover.tmpl.html', item);
          }
        });
    };

    pbModals.addModal($scope, 'templates/modal/submit-review-modal.html', function(modal){
      $scope.submitReviewDoctorsModal = modal;
      $scope.submitReviewDoctorsModal.submit = function(){
        var doctor_id = $scope.submitReviewDoctorsModal.data.id;
        var dataToSend = _.pick($scope.submitReviewDoctorsModal.data,['reviewText','rating','rewiewer','gender']);
        console.log(' > sending ','/doctors/'+doctor_id+'/reviews',false,dataToSend);
        dataLayer.httpPost('/doctors/'+doctor_id+'/reviews',false,dataToSend)
          .then(function(){
            console.log('review submited');
            $scope.submitReviewDoctorsModal.hide();
          });
      }
    });

    pbModals.addModal($scope, 'templates/modal/submit-review-modal.html', function(modal){
      $scope.submitReviewDispencariesModal = modal;
      $scope.submitReviewDispencariesModal.submit = function(){
        var doctor_id = $scope.submitReviewDispencariesModal.data.id;
        var dataToSend = _.pick($scope.submitReviewDispencariesModal.data,['reviewText','rating','rewiewer','gender']);
        console.log(' > sending ','/doctors/'+doctor_id+'/reviews',false,dataToSend);
        dataLayer.httpPost('/doctors/'+doctor_id+'/reviews',false,dataToSend)
          .then(function(){
            console.log('review submited');
            $scope.submitReviewDispencariesModal.hide();
          });
      }
    });

    $scope.showSumbitReviewModal = function(item){
      var type = $scope.venuesMenu[0].selected?'dispensaries':'doctors';
      var user = pbUser.getData();

      var m;
      if(type=='doctors'){
        m = $scope.submitReviewDoctorsModal;
      }else{
        m = $scope.submitReviewDispencariesModal
      }

      m.data = {
        reviewText:'',
        rating:0,
        rewiewer: user.name,
        gender: Boolean(user.sex),
        id:item.id
      };
      m.show();
    };


    $scope.currentAilment = pbUser.getData().currentAilment;

    $rootScope.$on('currentAilmentChanged', function(event, ca) {
      $scope.currentAilment = ca;
      $scope.getAllData();
    });

    $scope.getAllData = function(){
      getStrains();
      getArticles();
    };

    getDispensaries();
    getDoctors();

    $scope.openResearchArticleLink = function(artice){
      dataLayer.httpPost('/user/researchArticles/'+artice.id+'/openLinkAction',false).then(function(resp){
        console.log('log open research articles posted');
      });
      $scope.openLink(artice.sourceUrl);
    };

    $scope.openLink = function(link){
      var result;
      var startingUrl = "http://";
      var httpsStartingUrl = "https://";
      if(link.startWith(startingUrl)||link.startWith(httpsStartingUrl)){
        result = link;
      } else {
        result = startingUrl + link;
      }
      window.open(result, '_system', 'location=yes');
    };

    function getStrains(){
      $scope.strains = null;
      $scope.strainsLoaded = false;

      if (pbUser.isGuest()) {
        var favStrains = pbUser.getData().favoriteStrains[$scope.currentAilment.id];
        $scope.strains = _.isEmpty(favStrains)?null:processStrains(favStrains);
        $scope.strainsLoaded = true;
        $timeout(function(){
          $scope.swiper.update();

        },1);
      } else {
        dataLayer.httpGet('/user/ailments/'+$scope.currentAilment.id+'/favoriteStrains',false, {}).then(function(data){

          $scope.strains = _.isEmpty(data.data)?null:processStrains(data.data);
          $scope.strainsLoaded = true;
          $timeout(function(){
            $scope.swiper.update();

          },1);

        })

      }

    };

    $scope.onReadySwiper = function(sw){
      $scope.swiper = sw;
      $scope.getAllData();
    };
    $scope.onReadyArticleSwiper = function(sw){
      $scope.article_swiper = sw;
      console.log('! article_swiper',sw)

    };
    //var getStrainTypes = function(){
    //   dataLayer.httpGet('/ailments/'+pbUser.getData().ailment.id,true).then(function(data){
    //
    //   })
    //}

    //function getAilments(){
    //  $scope.ailments = null;
    //  $scope.ailmentsLoaded = false;
    //  dataLayer.httpGet('/user/ailments',true).then(function(data){
    //    $scope.ailments = data.data
    //    $scope.ailmentsLoaded = true;
    //  })
    //};
    function getArticles(){
      console.log('$scope.currentAilment',$scope.currentAilment)
      $scope.articles = null;
      $scope.articlesLoaded = false;
      dataLayer.httpGet('/ailments/'+$scope.currentAilment.id+'/researchArticles',false).then(function(data){
        $scope.articles = data.data;
        $scope.articlesLoaded = true;
        if($scope.article_swiper){
          $timeout(function() {
            $scope.article_swiper.update();
          },1);
        }

      })
    };
    function getDispensaries(){
      $scope.dispensaries = null;
      $scope.dispensariesLoaded = false;
        pbUser.getCoords(function (location) {
          console.log('**',location);
          var listDataParams = {
            lat: location.latitude,
            lng: location.longitude,
            sort: 'distance',
            reverse: false,
            limit: 9,
            offset: 0
          };
          dataLayer.httpGet('/potFinder/dispensaries', true, listDataParams).then(function (dat) {
            console.log(' << ',dat.data);
            $scope.dispensaries = dat.data;
            $scope.dispensariesLoaded = true;

            $scope.selectVenueMenu({id:'dispensaries'});
          },function(err){
            console.error(err);
          });
        });

    };

    function getDoctors() {
      $scope.doctors = null;
        pbUser.getCoords(function (location) {
          console.log('*',location);
          var listDataParams = {
            lat: location.latitude,
            lng: location.longitude,
            limit: 9,
            offset: 0
          };
          dataLayer.httpGet('/doctorFinder/doctors', true, listDataParams).then(function (dat) {
            $scope.doctors = dat.data;
            //console.log(' << ',dat.data)
          }, function (err) {
            console.error(err)
          });
        })
    };

    $scope.showDetails = function(s){
      rollovermodal.show('templates/modal/strain.rollover.tmpl.html', s);
    };

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
