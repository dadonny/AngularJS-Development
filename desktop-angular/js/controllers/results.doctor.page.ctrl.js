angular.module('potbot').controller('ResultsDoctorCtrl', ['$scope', '$state', 'lodash', 'dataLayer', 'pagemanager', 'maps','$templateCache', 'pbModals', 'pbUser', 'sounds','rollovermodal','uiGmapGoogleMapApi', '$ionicLoading','$timeout','$cordovaInAppBrowser','externalMaps',
  function($scope, $state, _, dataLayer, pagemanager, maps, $templateCache, pbModals, pbUser, sounds, rollovermodal, uiGmapGoogleMapApi, $ionicLoading, $timeout,$cordovaInAppBrowser,externalMaps) {
    pagemanager.init($scope);

  var visibleMarker = './img/marker1.svg';
  var invisibleMarker = './img/empty_marker.svg';
  $scope.noMoreData = false;
  $scope.markers = [];

  $scope.filterParams = [
    {id:'distance', label:'Distance', selected:'', params:[
      {id:'0', value:'', label:'Any'},
      {id:'1', value:'nearest', label:'Nearest First'}
    ]},
    {id:'rating', type:'star', label:'Rating', selected:[], params:[
      {id:'0', label:'All'},
      {id:'1', label:'1 star'},
      {id:'2', label:'2 star'},
      {id:'3', label:'3 star'},
      {id:'4', label:'4 star'},
      {id:'5', label:'5 star'}
    ]},
    {id:'reviewed', label:'Reviews', selected:'', params:[
      {id:'0', value:'', label:'All'},
      {id:'1', value:'most', label:'Most reviewed'},
      {id:'2', value:'least', label:'Least reviewed'}
    ]},
    {id:'walkIns', label:'Walk-ins', selected:'', params:[
      {id:'0', value:true, label:'Yes'},
      {id:'1', value:false, label:'No'}
    ]}
  ];
  $scope.filterText = ':';

    $scope.$watch('viewToggle', function() {
      $timeout(function(){
        ionic.trigger('resize');
      },1);
    });
//$scope.mapHack  =  function(){
//
//
//};

  $scope.renderFilterText = function(){
    var stag = '<strong style="padding-right: 20px;">';
    var etag = '</strong>';
    $scope.filterText = _.reduce($scope.filterParams,function(total, item){

      if(_.isEmpty(item.selected)){
        return total+'';
      }
      if(item.type == 'star'){

        return total+' '+item.label+': '+stag+ _.map(item.selected,function(ss){
              return item.params[ss].label+'';
          })+etag;
      }else{
        return total+'    '+item.label+':'+stag+item.params[item.selected].label+etag
      }
    },'');
  };
  $scope.renderFilterText();

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
    {id:'all', label:'All'}
  ];
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
      streetViewControl: false,
      boxStyle: { "background-color":"red"}
    },
    events:{
      tilesloaded: function (map) {
        $scope.$apply(function () {
          $scope.mapInstance = map;
          //if($scope.directionsDisplay){
            //$scope.directionsDisplay.setMap($scope.mapInstance);
          //}
        });
      },
      click:function(){
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
      $scope.directionsDisplay.setPanel(document.getElementById("directionsPanel_docs"));
      if($scope.mapInstance){

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
      console.log(item);
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
    templateUrl:'templates/markerdoctor.tmpl.html',//PERHAPS NEEDS ../
    templateParameter: {
      op:'bob'
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
        console.log('details ',data,$scope.markerWindow.templateParameter);
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
    $scope.openMarkerWindow(marker);
    model.show = !model.show;
  };


  $scope.getDetails =function(id,cb){
    dataLayer.httpGet('/doctors/'+id,true).then(function(res){
      cb(null, res.data);
    }).then(function(err){
      if(err){cb(err);}
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

  $scope.getMarkers = function(){
    dataLayer.httpGet('/doctorFinder/doctors/geomarkers',true).then(function(data){
      $scope.markers = _.map(data.data, function(item){
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
      //$scope.markers = ;
    })
  } ;

    $scope.getMarkers();

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

  $scope.loadMoreListData = function(){
    console.log('loadMoreListData',$scope.listDataParams.offset)
    $scope.getListData(true);
    $scope.listDataParams.offset += $scope.listDataParams.limit;
  };

  $scope.moreDataCanBeLoaded = function(){
    return !$scope.noMoreData;
  }
  $scope.listDataParams = {
    lat:$scope.map.center.latitude,
    lng:$scope.map.center.longitude,
    rating:[],
    walkIns:false,
    reviewed:'',
    distance:'',
    limit:12,
    offset:0
  };

  function getParams(){
    $scope.listDataParams = _.pick($scope.listDataParams,['limit','offset','lat','lng']);
    _.each(_.reject($scope.filterParams,function(param){
      return _.isEmpty(param.selected);
    }), function(param){
      if(param.type=='star'){
        if(_.isEqual(param.selected,["0"])){
          $scope.listDataParams[param.id] = "";
        }else{
          $scope.listDataParams[param.id] = param.selected.join(',');
        }
      }else{
        $scope.listDataParams[param.id] = param.params[param.selected].value;
      }

    });

    var res = _.transform($scope.listDataParams,  function(result, value, key) {
      if(value==''){}else{result[key]=value};
    });
  console.log('getParams',$scope.listDataParams,":",res)
    return res;
  }
  $scope.getParams=getParams;

  $scope.clearList = function(){
    $scope.listData = [];
  };

  $scope.getListData = function(isMore){
    $scope.listDataParams.lat = $scope.map.center.latitude;
    $scope.listDataParams.lng = $scope.map.center.longitude;
    dataLayer.httpGet('/doctorFinder/doctors',false,getParams()).then(function(res){
      console.log('doctors!',res.data);
      Array.prototype.push.apply($scope.listData,res.data);
      //$scope.listData.push({id:Math.random()})
      if(res.data && res.data.length==$scope.listDataParams.limit ){
        $scope.noMoreData = false;
      }else{
        $scope.noMoreData = true;
      }
      $scope.$broadcast('scroll.infiniteScrollComplete');
    });
  };


  $scope.selectListItem = function(item){
    //dataLayer.httpGet('/doctors/'+item.id+'/acceptedReviews', true, {limit:1}).then(function(res) {

      if(!item.reviews){item.reviews=[]};
    if(item.latestReview){
      item.reviews = _.union(item.latestReview,item.reviews);
    }


    _.each($scope.listData,function(a){
      if(a.id === item.id){
        a.selected = !a.selected;
      }else{
        a.selected = false;
      }
    });

  };

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

  pbModals.addModal($scope, 'templates/modal/filter-doctor-modal.html', function(modal){
    $scope.filterModal = modal;
  });

  pbModals.addModal($scope, 'templates/modal/submit-review-modal.html', function(modal){
    $scope.submitReviewModal = modal;

    $scope.submitReviewModal.submit = function(){
      var doctor_id = $scope.submitReviewModal.data.id;
      var dataToSend = _.pick($scope.submitReviewModal.data,['reviewText','rating']);
      console.log(' > sending ','/doctors/'+doctor_id+'/reviews',false,dataToSend);
      dataLayer.httpPost('/doctors/'+doctor_id+'/reviews',false,dataToSend)
        .then(function(){
          console.log('review submited');
          $scope.submitReviewModal.hide();
        });

    }
  });

  pbModals.addModal($scope, 'templates/modal/book-appointment-modal.html', function(modal){
    $scope.bookAppointment = modal;
  });

  $scope.showFilter = function(){
    $scope.filterModal.show()
  };

  $scope.showSumbitReviewModal = function(doctor){
    var user = pbUser.getData();

    $scope.submitReviewModal.data = {
      reviewText:'',
      rating:0,
      rewiewer: user.name,
      gender: Boolean(user.sex),
      id:doctor.id
    };
    $scope.submitReviewModal.show();
  };

  $scope.showBookAppointmentModal = function(){
    $scope.bookAppointment.show()
  }

    $scope.showDetails = function(item,event){
      if(event){event.preventDefault();}

      dataLayer.httpGet('/doctors/'+item.id+'/acceptedReviews', true, {limit:20}).then(function(res) {
        if(!item.reviews){item.reviews=[]};
        item.reviews = _.union(res.data,item.reviews);
        item.getDirectionsToMarker = function(item){
          $scope.getDirectionsToMarker(item);
          rollovermodal.hide();
        }
        item.openWebsite = $scope.openWebsite;
        item.openEmail = $scope.openEmail;
        item.showSumbitReviewModal = $scope.showSumbitReviewModal;
        rollovermodal.show('templates/modal/doctor-details.rollover.tmpl.html', item);
      });

    }
  $scope.isArray = function(item){
    return _.isArray(item) || _.isObject(item);
  }

    $scope.gotoDashboard = function(){
      $state.go('dashboard.index');
    }
}]);
