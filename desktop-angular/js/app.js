
angular.module('potbot', ['ionic','ngLodash','ksSwiper','uiGmapgoogle-maps','ngCordova','ngCookies'])
.run(function($rootScope, $ionicPlatform, $cordovaStatusbar, pbUser, $state,$ionicLoading,sounds) {

  $ionicPlatform.ready(function() {
    $cordovaStatusbar.hide();
    sounds.deviceReady();
    screen.lockOrientation('landscape');
    // Hide the accessory bar by default (remove this to show the accessory bar above the keyboard
    // for form inputs)
    if (window.cordova && window.cordova.plugins && window.cordova.plugins.Keyboard) {
      cordova.plugins.Keyboard.hideKeyboardAccessoryBar(true);
      cordova.plugins.Keyboard.disableScroll(true);
    }
    if (window.StatusBar) {
      StatusBar.styleDefault();
    }
  });

    $rootScope.$on('$stateChangeSuccess', function () {
      //$ionicLoading.hide();
    });

    $rootScope.$on('$stateChangeStart', function(event, toState, toParams, fromState, fromParams) {

      var user = pbUser.getData();
      //$ionicLoading.show();
      console.log('user check', toState, toState.unAuthOnly, pbUser.isAuthed(), pbUser.isFilled());
        if(toState.authOnly && !pbUser.isAuthed()) {
          console.log('redirect to enter. (no authed)');
          event.preventDefault();
          return $state.go('enter');

        }else if(toState.authOnly && !pbUser.isFilled()) {
          console.log('redirect to profile. (no filled)');
          event.preventDefault();
          return $state.go('personaldata');

        }else if(toState.unAuthOnly && pbUser.isAuthed() && pbUser.isFilled()) {
          console.log('redirect to results. (no authed allowed )');
          event.preventDefault();
          return $state.go('results.overview');
        }else{

        }
      });


})

.config(function($stateProvider, $urlRouterProvider,uiGmapGoogleMapApiProvider,$cordovaAppRateProvider) {


  document.addEventListener("deviceready", function () {

    function appRateonButtonClicked(a,b,c){
      console.log('appRateonButtonClicked',a,b,"::",c);
    };
    var prefs = {
      language: 'en',
      appName: 'Potbot',
      iosURL: '1054510025',
      promptAgainForEachNewVersion:true,
      usesUntilPrompt:1,
      openStoreInApp:false,
      callbacks:{onButtonClicked:appRateonButtonClicked}
    };

    $cordovaAppRateProvider.setPreferences(prefs)

  }, false);

    uiGmapGoogleMapApiProvider.configure({
      //    key: 'your api key',
      v: '3.20', //defaults to latest 3.X anyhow
      libraries: 'geometry,visualization'
    });

  // Ionic uses AngularUI Router which uses the concept of states
  // Learn more here: https://github.com/angular-ui/ui-router
  // Set up the various states which the app can be in.
  // Each state's controller can be found in controllers.js
  $stateProvider
  // setup an abstract state for the tabs directive
    .state('enter', {
    url: '/enter',
    unAuthOnly:true,
    params:{isHard:false},
    controller: 'EnterCtrl',
    templateUrl: 'templates/enter.html'
  })
    .state('disclaimer', {
      unAuthOnly:true,
      cache:false,
      url: '/disclaimer',
      controller: 'DisclaimerCtrl',
      templateUrl: 'templates/disclaimer.html'
    })
    .state('personaldata', {
      //unAuthOnly:true,
      cache:false,
      url: '/personaldata',
      controller: 'PersonaldataCtrl',
      templateUrl: 'templates/personaldata.html'
    })


    .state('condition', {
      cache:false,
      url: '/condition',
      controller: 'ConditionCtrl',
      templateUrl: 'templates/condition.html',
      resolve:{
        ailmentsList:  function(dataLayer,pbUser){
          //console.log('DB AILMENTS',pbUser.getData().ailments,pbUser.getData())
          //return pbUser.getData().ailments;
          return dataLayer.httpGet('/ailments',true)
        }
      }
    })
    .state('createprofile', {
      //unAuthOnly:true,
      cache:false,
      url: '/createprofile',
      controller: 'CreateProfileCtrl',
      templateUrl: 'templates/createprofile.html'
    })
    .state('dashboard', {
      templateUrl: 'templates/dashboard.html',
      controller: 'DashboardCtrl',
      cache:false,
      resolve:{
        pageTitles: function(){
          return {
            'dashboard.index':'DASHBOARD',
            'dashboard.strains':'FAVORITE STRAINS',
            'dashboard.ailment':'AILMENT RESEARCH',
            'dashboard.disp':'DIRECTORY'
          };
        },
        ailments: function(dataLayer,pbUser){
          console.log('DB AILMENTS',pbUser.getData().ailments,pbUser.getData())
          return pbUser.getData().ailments;
          //dataLayer.httpGet('/user/ailments',false);
        }
      }
    })
    .state('dashboard.index', {
      authOnly:true,
      cache:false,
      url: '/dashboard/index',
      controller: 'DashboardIndexCtrl',
      templateUrl: 'templates/dashboard.index.html'
    })
    .state('dashboard.strains', {
      authOnly:true,
      cache:false,
      url: '/dashboard/strains',
      controller: 'DashboardStrainsCtrl',
      templateUrl: 'templates/dashboard.strains.html'

    })
    .state('dashboard.disp', {
      authOnly:true,
      cache:false,
      url: '/dashboard/dispensaries',
      controller: 'DashboardDispCtrl',
      templateUrl: 'templates/dashboard.disp.html',
      resolve:{
        pageTitle: function(){return 'DIRECTORY'},
        dispensaries:function(dataLayer, pbUser, $q){
          return $q(function (resolve, reject) {
            pbUser.getCoords(function (location) {
              var listDataParams = {
                lat: location.latitude,
                lng: location.longitude,
                sort: 'distance',
                reverse: false,
                limit: 9,
                offset: 0
              };
              dataLayer.httpGet('/potFinder/dispensaries', true, listDataParams).then(function (dat) {
                resolve(dat)
              }, function (err) {
                reject(err);
              });
            })
          })
        },

        doctors:function(dataLayer, pbUser, $q) {
          return $q(function (resolve, reject) {
            pbUser.getCoords(function (location) {
              console.log('l_oc',location)
              var listDataParams = {
                lat: location.latitude,
                lng: location.longitude,
                limit: 9,
                offset: 0
              };
               dataLayer.httpGet('/doctorFinder/doctors', true, listDataParams).then(function (dat) {
                 resolve(dat)
               }, function (err) {
                 reject(err);
               });
            })
          })
        }
      }
    })
    .state('dashboard.ailment', {
      authOnly:true,
      cache:false,
      url: '/dashboard/ailment',
      controller: 'DashboardAilmentCtrl',
      templateUrl: 'templates/dashboard.ailment.html'
    })

    .state('results', {
      templateUrl: 'templates/results.html',
      controller: 'ResultsCtrl',
      resolve:{
        ailments: function(dataLayer,pbUser){
          console.log('DB AILMENTS',pbUser.getData().ailments,pbUser.getData())
          return pbUser.getData().ailments;
          //return dataLayer.httpGet('/user/ailments',false);
        }
      }
    })
    .state('results.overview', {
      url: '/results/overview',
      authOnly:true,
      cache:false,
      controller: 'ResultsOverviewCtrl',
      templateUrl: 'templates/results.overview.html',
      resolve:{
        ratios: function(dataLayer, pbUser){
          var user = pbUser.getData();
          console.log('+++',user.currentAilment)
          return dataLayer.httpGet('/ailments/'+user.currentAilment.id+'/recommendedRatio',true, {cannabisExperience:user.cannabisExperience})
        }
      }
    })
    .state('results.strains', {
      url: '/results/strains',
      authOnly:true,
      cache:false,
      controller: 'ResultsStrainsCtrl',
      templateUrl: 'templates/results.strains.html',
      resolve:{
        strains:  function(dataLayer, pbUser, lodash){
          var user = pbUser.getData();
          var data = {};
          data.limit = 50;
          data.offset = 0;
          data.ailment = user.currentAilment?user.currentAilment.id:user.ailments[0];
          if (pbUser.isGuest()) {
            data.cannabisExperience = user.cannabisExperience;
          }
          return dataLayer.httpGet('/user/getRecommendation',false, data)
        },
        strainTypes: function(dataLayer, pbUser){
          return dataLayer.httpGet('/ailments/'+pbUser.getData().currentAilment.id,true)
        }

      }
    })
    .state('results.methods', {
      url: '/results/methods',
      cache:false,
      authOnly:true,
      controller: 'ResultsMethodsCtrl',
      templateUrl: 'templates/results.methods.html',
      resolve:{
        methods:function(dataLayer){
          return dataLayer.httpGet('/consumptionMethods',false)
        },
        ailment:function(dataLayer, pbUser){
          return dataLayer.httpGet('/ailments/' + pbUser.getData().currentAilment.id, false);

        }
      }
    })
    .state('results.products', {
      url: '/results/products',
      cache:false,
      authOnly:true,
      controller: 'ResultsProductsCtrl',
      templateUrl: 'templates/results.products.html',
      resolve:{
        products:function(dataLayer){
          return dataLayer.httpGet('/products/featured',false, {featured: true})
          //return dataLayer.httpGet('/products',false, {commonFilter: 'vaporizers'})
        }
      }
    })
    .state('results.dispensaries', {
      url: '/results/dispensaries',
      authOnly:true,
      cache:false,
      controller: 'ResultsDispensariesCtrl',
      templateUrl: 'templates/results.dispensaries.html',
      resolve:{
        maps:function(uiGmapGoogleMapApi){
          return uiGmapGoogleMapApi;
        },
        markers:function(dataLayer){
          return dataLayer.httpGet('/potFinder/dispensaries/geomarkers',false)
        }
      }
    })
    .state('results.doctor', {
      url: '/results/doctor',
      authOnly:true,
      cache:false,
      controller: 'ResultsDoctorCtrl',
      templateUrl: 'templates/results.doctor.html',
      resolve:{
        maps:function(uiGmapGoogleMapApi){
          return uiGmapGoogleMapApi;
        }
      }
    });


  // if none of the above states are matched, use this as the fallback
  //  $urlRouterProvider.otherwise('/enter');
  $urlRouterProvider.otherwise( function($injector, $location) {
    var $state = $injector.get("$state");
    $state.go('enter');
  });

})

.filter("urlFilter", function () {
    return function (link) {
      var result;
      var startingUrl = "http://";
      var httpsStartingUrl = "https://";
      if(link.startWith(startingUrl)||link.startWith(httpsStartingUrl)){
        result = link;
      }
      else {
        result = startingUrl + link;
      }
      return result;
    }
  });


String.prototype.startWith = function (str) {
  return this.indexOf(str) == 0;
};
