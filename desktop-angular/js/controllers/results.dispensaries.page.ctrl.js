angular.module('potbot').controller('ResultsDispensariesCtrl', [
  '$scope',
  '$state',
  'lodash',
  'dataLayer',
  'pagemanager',
  'maps',
  'markers',
  '$templateCache',
  'pbModals',
  'pbUser',
  'sounds',
  'rollovermodal',
  'uiGmapGoogleMapApi',
  '$ionicLoading',
   '$timeout',
    '$cordovaInAppBrowser',
    'externalMaps',
  function(
    $scope,
    $state,
    _,
    dataLayer,
    pagemanager,
    maps,
    markers,
    $templateCache,
    pbModals,
    pbUser,
    sounds,
    rollovermodal,
    uiGmapGoogleMapApi,
    $ionicLoading,
    $timeout,
    $cordovaInAppBrowser,
      externalMaps
  ) {


    pagemanager.init($scope);


  var visibleMarker = 'img/marker1.svg';
  var invisibleMarker = 'img/empty_marker.svg';
  $scope.viewToggle = true;
  $scope.listData = [];
  $scope.sortTypes = [
    {id:'distance', label:'Distance'},
    {id:'reviews', label:'Rating'},
    {id:'rating', label:'Most Viewed'},
    {id:'discount', label:'Offering a deal'}
  ];

  $scope.typeTypes = [
    {id:'medical', label:'Medical'},
    {id:'recreational', label:'Recreational'},
    {id:'all', label:'All'},
  ];

    $scope.$watch('viewToggle', function() {
      $timeout(function(){
        ionic.trigger('resize');
      },1);
    });

  $scope.map = {
    center: { latitude: 38.43, longitude: -75.71 },
    zoom: 5,
    options:{
      mapTypeControl: false,
      zoomControl: true,
      zoomControlOptions: {
        position: google.maps.ControlPosition.RIGHT_TOP
      },
      scaleControl: false,
      streetViewControl: false
      //boxStyle: { "background-color":"red"}
    },
    events:{
      tilesloaded: function (map) {
        $scope.$apply(function () {
          google.maps.event.trigger(map, "resize");
          $scope.mapInstance = map;
          //if($scope.directionsDisplay){
          //  $scope.directionsDisplay.setMap($scope.mapInstance);
          //}
        });
      },
      click:function(){
        //$scope.markerWindow.show = false;
        //$scope.directionsShown = false;
        $timeout(function(){
          $scope.markerWindow.show = false;
          if($scope.directionsShown){
            $scope.directionsShown = false;
            $scope.directionsDisplay.setMap(null);
          }
        },5);
        //$scope.$apply(function () {
        //  $scope.markerWindow.show = false;
        //  $scope.directionsShown = false;
        //});
      }
    }
  };

    uiGmapGoogleMapApi.then(function(maps) {
      if( typeof _.contains === 'undefined' ) {
        _.contains = _.includes;
        _.prototype.contains = _.includes;
      }
      if( typeof _.object === 'undefined' ) {
        _.object = _.zipObject;
      }
      $scope.DirectionsService = new maps.DirectionsService();
      $scope.directionsDisplay = new maps.DirectionsRenderer();
      $scope.directionsDisplay.setPanel(document.getElementById("directionsPanel_disps"));
      if($scope.mapInstance){
        //$scope.directionsDisplay.setMap($scope.mapInstance);
      }
    });

  $scope.getCurrentLocation = function(dest){
    //if (navigator.geolocation) {
    //  navigator.geolocation.getCurrentPosition(showPosition);
    //} else {
    //  console.error("Geolocation unsupported");
      $ionicLoading.show();
      //done("Geolocation unsupported")
    //}

    pbUser.getCoords(showPosition,false);
    function showPosition(position) {
      $scope.userGeoPosition = new google.maps.LatLng(position.latitude, position.longitude);
      //$scope.userGeoPosition = new google.maps.LatLng(39.739758, -104.9799645);
      $scope.getDirections($scope.userGeoPosition, dest)
    }
  };




    $scope.getDirections = function(start, dest){
      console.log(' $scope.getDirections',start,dest);
      $scope.viewToggle = true;
      if(!start){
        return $scope.getCurrentLocation(dest);
      }
      if(externalMaps.shouldOpen()){
        $ionicLoading.hide();
        return externalMaps.open(start, dest);
      }
      var selectedMode = 'DRIVING';
      var request = {
        origin: start,
        destination: dest,
        travelMode: google.maps.TravelMode[selectedMode]
      };
      $scope.directionsDisplay.setMap($scope.mapInstance);
      $scope.DirectionsService.route(request, function(response, status) {
        $ionicLoading.hide();
        console.log('answer',response,status)
        if (status == google.maps.DirectionsStatus.OK) {
          $scope.markerWindow.show = false;
          $scope.directionsDisplay.setDirections(response);
          $scope.directionsShown=true;
        }
      });
    };

    $scope.getDirectionsToMarker = function(item){
      $ionicLoading.show({template:'Loading...'});
      console.log('*',item);
      if(!item.coordLat || !item.coordLng){
        return;
      }
      var dest = new google.maps.LatLng(item.coordLat, item.coordLng);
      $scope.getDirections($scope.userGeoPosition, dest);
    }

  $scope.markerWindow = {
    show: false,
    currentMarker: null,
    disableAutoPan: false,
    isIconVisibleOnClick: false,
    coords: [],
    templateUrl:'templates/markerwindow.tmpl.html',//parhaps needs ../
    templateParameter: {

    },
    closeClick:function(){
      //$scope.markerWindow.currentMarker.model.icon = visibleMarker;
      $scope.markerWindow.show=false
    },
    options:{
      isIconVisibleOnClick: false
    },
    control:{}
  };

  $scope.markers = _.map(markers.data, function(item){
    return {
      icon:visibleMarker,
      latitude:item.coordLat,
      longitude:item.coordLng,
      id:item.id,
      showWindow:true,
      options: {
      }
    };
  });

  $scope.openMarkerWindow = function(m){
    console.log('open');
    sounds.play('chop3');
    //if($scope.markerWindow.currentMarker){
    //  $scope.markerWindow.currentMarker.model.icon = visibleMarker;
    //}
    $scope.markerWindow.templateParameter = {}
    //m.model.icon = invisibleMarker;
    $scope.markerWindow.currentMarker = m;
    $scope.markerWindow.show=true;
    $scope.markerWindow.coords = [m.position.lng(),m.position.lat() ];

    $scope.getDetails(m.model.id,function(err,data){
      if(!err){
        //console.log('details ',data,$scope.markerWindow.templateParameter);
        $scope.markerWindow.templateParameter = data;
        $scope.markerWindow.templateParameter.showSumbitReviewModal = $scope.showSumbitReviewModal;
        $scope.markerWindow.templateParameter.showDetails = $scope.showDetails;
        $scope.markerWindow.templateParameter.getDirectionsToMarker = $scope.getDirectionsToMarker;


      }else{

      }
    });
  }

  $scope.onClick = function(marker, eventName, model) {
    console.log("Clicked!",marker);
    //console.log("Clicked!eventName",eventName);
    $scope.openMarkerWindow(marker);
    model.show = !model.show;
  };


  $scope.getDetails =function(id,cb){
    dataLayer.httpGet('/dispensaries/'+id,true).then(function(res){
      cb(null, res.data);
    }).then(function(err){
      if(err){cb(err);}
    });
  };


  $scope.changeViewValue = function(){
    $scope.viewToggle = !$scope.viewToggle;
  };

  $scope.changeListSort = function(sortType){

    if($scope.listDataParams.sort == sortType.id){
      $scope.listDataParams.reverse = !$scope.listDataParams.reverse;
    }else{
      $scope.listDataParams.reverse = false;
    }

    $scope.listDataParams.sort = sortType.id;
    $scope.listDataParams.offset = 0;
    $scope.listData = [];
    $scope.$broadcast('scroll.infiniteScrollComplete');
  };

  $scope.changeListType = function(typeType){
    if(typeType.id=='all'){
      $scope.listDataParams.type = null;
    }else{
      $scope.listDataParams.type = typeType.id;
    }

    $scope.listDataParams.offset = 0;
    $scope.listData = [];
    $scope.$broadcast('scroll.infiniteScrollComplete');
  };

  $scope.loadMoreListData = function(a){
    console.log('loadMoreListData')
    getListData();
    $scope.listDataParams.offset += $scope.listDataParams.limit;
  };

  $scope.listDataParams = {
    lat:$scope.map.center.latitude,
    lng:$scope.map.center.latitude,
    sort:$scope.sortTypes[0].id,
    type:$scope.typeTypes[0].id,
    reverse:false,
    limit:12,
    offset:0
  };

  function getListData(){

    dataLayer.httpGet('/potFinder/dispensaries',true,$scope.listDataParams).then(function(res){
      console.log('dispensaries!',res.data);
      Array.prototype.push.apply($scope.listData,res.data);
      $scope.$broadcast('scroll.infiniteScrollComplete');
    });
  }


  $scope.windowOptions = {
    boxClass: "infobox",
    disableAutoPan: false,
    maxWidth: 0,
    pixelOffset: new google.maps.Size(-130, -240),
    zIndex: null,
    closeBoxMargin: "10px",
    closeBoxURL: " ",
    infoBoxClearance: new google.maps.Size(1, 1),
    isHidden: false,
    pane: "floatPane",
    enableEventPropagation: false
  };

  pbModals.addModal($scope, 'templates/modal/submit-review-modal.html', function(modal){
    $scope.submitReviewModal = modal;

    $scope.submitReviewModal.submit = function(){
      var d_id = $scope.submitReviewModal.data.id;
      var dataToSend = _.pick($scope.submitReviewModal.data,['reviewText','rating']);
      console.log(' > sending ', '/dispensaries/'+d_id+'/reviews',false,dataToSend);
      dataLayer.httpPost('/dispensaries/'+d_id+'/reviews',false,dataToSend)
        .then(function(){
          console.log('review submited');
          $scope.submitReviewModal.hide();
        });

    }
  });

  $scope.showDetails = function(item,event){
    if(event){event.preventDefault();}
console.log('s o ',item.id);
    dataLayer.httpGet('/dispensaries/'+item.id+'/acceptedReviews', true, {limit:20,offset:0}).then(function(res) {
      if(!item.reviews){item.reviews=[]};
      item.reviews = _.union(res.data,item.reviews);
      item.getDirectionsToMarker = function(item){
        $scope.getDirectionsToMarker(item);
        rollovermodal.hide();
      }
      item.showSumbitReviewModal = $scope.showSumbitReviewModal;
      item.openWebsite = $scope.openWebsite;
      item.openEmail = $scope.openEmail;
      rollovermodal.show('templates/modal/disp-details.rollover.tmpl.html', item);
    });
  };

  $scope.openWebsite = function(link){
    var options = {
      location: 'yes',
      clearcache: 'yes',
      toolbar: 'yes'
    };
    $cordovaInAppBrowser.open(link, '_system', options);
  };

  $scope.openEmail = function(link){
    var options = {
      location: 'no',
      clearcache: 'yes',
      toolbar: 'no'
    };
    $cordovaInAppBrowser.open('mailto:'+link, '_system', options);
  };

  $scope.showSumbitReviewModal = function(item){
   // console.log('showSumbitReviewModal',item)
    var user = pbUser.getData();

    $scope.submitReviewModal.data = {
      reviewText:'',
      rating:0,
      rewiewer: user.name,
      gender: Boolean(user.sex),
      id:item.id
    };
    $scope.submitReviewModal.show();
  };

    $scope.selectListItem = function(item){
      //dataLayer.httpGet('/dispensaries/'+item.id+'/acceptedReviews', true, {limit:1}).then(function(res) {

        if(!item.reviews){item.reviews=[]};
      if(item.latestReview) {
        item.reviews = _.union(item.latestReview, item.reviews);
      }
      //});

      _.each($scope.listData,function(a){
        if(a.id === item.id){
          a.selected = !a.selected;
        }else{
          a.selected = false;
        }
      });

    };
    $scope.isArray = function(item){
      return _.isArray(item) || _.isObject(item);
    }


    //if($scope.mapInstance){
    //  console.log('RE F RE  SH')
    //  google.maps.event.trigger($scope.mapInstance, "resize");
    //}
}]);
