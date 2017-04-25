angular.module('potbot').directive('leftMenu', ['rollovermodal','sounds', '$ionicSlideBoxDelegate','$state','pbUser','pbModals','pagemanager','$rootScope', '$document','lodash','$cordovaInAppBrowser', '$timeout','pbAppRate', function(rollovermodal, sounds, $ionicSlideBoxDelegate,$state, pbUser, pbModals,pagemanager,$rootScope,$document,_,$cordovaInAppBrowser, $timeout, pbAppRate) {
  return {
    restrict: 'E',
    scope:{
      isOpen:'='
    },
    templateUrl: 'js/directives/left-menu.tmpl.html',
    link: function (scope, element) {
      if(!scope.isOpen){scope.isOpen = false;}


      scope.userMenuShown = false;

      scope.leftmenuitems = {
        top:[
          {icon:'home', label:'Home', state:'dashboard.index'},
          {icon:'potbot', label:'PotBot', state:'results.overview'},
          {icon:'fav', label:'Favorite Strains', state:'dashboard.strains'},
          {icon:'ailment',label:'Ailment Research',  state:'dashboard.ailment'},
          {icon:'disp',label:'Nearby Dispensaries', state:'dashboard.disp'}

        ],
         bottom:[
          {icon:'info', label:'About PotBot', action:openInfoModal},
          {icon:'mail', label:'Contact Us', action:sendEmail}
        ]
      };

      scope.test = pbAppRate.test();
      scope.onLogoClicked = function(){
        pbAppRate.openAppRate('toplogo');
        scope.gotoPage('dashboard.index');
      }

      scope.gotoPage = function(state){
        //sounds.play('chop3');
        console.log('state',state);
        //pagemanager.go(state);
        $state.go(state);
      };


      scope.showTooltip = function(item) {
        item.hover = 1;
        $timeout(function() {
          item.hover = 0;
        }, 1000);
      }


      scope.switchMenuState = function(){
        scope.isOpen = !scope.isOpen;
        $rootScope.$broadcast('leftMenuStateCahnged',scope.isOpen);
      };
      scope.user = pbUser.getData();



      scope.logout = function(){
        pbUser.logout();
        scope.logoutModal.hide();
        pagemanager.go('enter',true);
      };


      pbModals.addModal(scope, 'templates/modal/logout-modal.html', function(modal){
        scope.logoutModal = modal;
        scope.logoutModal.logout = scope.logout;
      });


      scope.showUserMenu = function(e){
        if(scope.userMenuShown){return;}
        scope.userMenuShown = true;
        e.preventDefault();
        e.stopPropagation();
        $document.on('click',function(){
          scope.userMenuShown = false;
          scope.$apply();
          $document.off('click');
        })
      };

      scope.showLogoutModal = function(){
        scope.logoutModal.show();
        sounds.play('chop3');
      };


      $rootScope.$on('$stateChangeSuccess', function(event, toState, toParams, fromState, fromParams) {
        //console.log('** ',toState,toState.name.split('.')[0],toState.name.split('.')[0]=='dashboard');
        scope.isDashboard  = toState.name.split('.')[0]=='dashboard';
      });



      scope.launchPotBot = function(){
        sounds.play('chop3');
        pagemanager.go('results.overview');
      };

      function gotoHome(){
        sounds.play('chop3');
        pbUser.resetUser();
        pagemanager.go('enter');
      }

      function openInfoModal(){
        sounds.play('chop3');
        rollovermodal.show('templates/modal/info.rollover.tmpl.html', {
          gotoWebsite:gotoWebsite,
          //gotoSocial:gotoSocial,
          news:[
            {img:'img/about/about-1.png', link:'http://www.potbotics.com/medical-marijuanas-journey-from-nutraceutical-to-pharmaceutical'},
            {img:'img/about/about-2.png', link:'http://www.potbotics.com/internet-of-things-meets-marijuana'},
            {img:'img/about/about-3.png', link:'http://www.potbotics.com/an-introduction-to-the-major-cannabinoid-families'},
            {img:'img/about/4.png', link:'http://www.potbotics.com/the-future-of-medical-marijuana-is-hipaa-compliant'},
            {img:'img/about/5.png', link:'http://www.potbotics.com/top-5-digital-health-trends-in-medical-marijuana'},
            {img:'img/about/6.png', link:'http://www.potbotics.com/the-need-for-self-regulatory-bodies-in-medical-marijuana'}
          ],
          prevSlide:prevSlide,
          nextSlide:nextSlide


        });

      }

      function prevSlide(){
        $ionicSlideBoxDelegate.previous();
      }
      function nextSlide(){
        $ionicSlideBoxDelegate.next();
      }

      function gotoWebsite(link){
        var options = {
          location: 'yes',
          clearcache: 'yes',
          toolbar: 'yes'
        };
        $cordovaInAppBrowser.open(link, '_system', options);
        //window.open(link, '_system', 'location=yes');
      }


      function sendEmail(){
        var options = {
          location: 'yes',
          clearcache: 'yes',
          toolbar: 'no'
        };
        $cordovaInAppBrowser.open('mailto:info@potbot.com?Subject=Feedback', '_system', options);
        //window.open('mailto:info@potbot.com?Subject=Feedback', '_system', 'location=yes');
      }
    }
  };
}]);
