angular.module('potbot').controller('EnterCtrl', ['$scope', '$state', 'pagemanager','$timeout','$interval','pbUser','pbModals','dataLayer','$rootScope', function($scope, $state, pagemanager,$timeout, $interval, pbUser,pbModals, dataLayer, $rootScope) {
  //$scope.prevNext, $scope.gotoNext, $scope.gotoPrev
  pagemanager.init($scope);

  $scope.progressbar={loaded:0}

  $scope.loginData = {};
  $scope.signupData = {};
  var animatedElements = []

  $rootScope.alreadyLoaded = false;

  $scope.dosome = function(){
    showHi();
  };

$scope.openForgotPassword = function(){
  window.open(dataLayer.getFrontendHost()+'/email.html', '_system', 'location=yes');
};

  $scope.login = function(){
    dataLayer.login($scope.loginData,function(err,res){
      if(err){
        console.error(err);
        return;
      }
      var user = pbUser.getData();
      console.log(user,pbUser.isAuthed(), pbUser.isFilled());
      if(pbUser.isAuthed() && pbUser.isFilled()){
        console.log('over');
        pagemanager.go('results.overview');
      }else{
        console.log('pers');
        pagemanager.go('personaldata');
      }
      console.log('done done',res);
    })
  };

  $scope.signup = function(){
      pagemanager.go('disclaimer');
  };

  pbModals.addModal($scope, 'templates/modal/signup-modal.html', function(modal){
    $scope.signupModal = modal;
  });

  $scope.showSignupModal = function(){
    $scope.signupModal.show()
  };


  function startSlideoutAnimation(){

    var logo_a = $('#logo_b_base');
    animatedElements.push(logo_a);
    logo_a.velocity({
      properties: { width: [550,0], marginLeft:[-275,0] },
      options: { duration: 1500, delay:0,complete:showButtons }
    });


    var brace_l = $('#logo_b_brace_l');
    animatedElements.push(brace_l);
    brace_l.velocity({
      properties: { left: [-80,250]},
      options: { duration: 1500 }
    });



    var brace_r = $('#logo_b_brace_r');
    animatedElements.push(brace_r);
    brace_r.velocity({
      properties: { right: [-70,250] },
      options: { duration: 1500 }
    });

    var logo_holder = $('#lobo_b_holder');
    animatedElements.push(logo_holder);
    logo_holder.velocity({
      properties: {opacity: [1,0]},
      options: {duration: 300}
    });

  }

  function showHi(){
    var logo_holder = $('#logo-hi-holder');
    animatedElements.push(logo_holder);
    logo_holder.velocity({
      properties: {opacity: [1,0],scale:[1,2]},
      options: {duration: 1300,complete:switchHiToLogo , easing:'easeOutExpo'}//
    });

  }

  function switchHiToLogo(){
    hideHi();
    startSlideoutAnimation()
  }

  function hideHi(){
    var lhml = $('#logo-hi-mask-l');
    animatedElements.push(lhml);
    lhml.velocity({
      properties: { width: [0, 89] },
      options: { duration: 500, delay:0 }
    });

    var lhmr = $('#logo-hi-mask-r');
    animatedElements.push(lhmr);
    lhmr.velocity({
      properties: { width: [0, 89],marginLeft:[89,0] },
      options: { duration: 500, delay:0 }
    });

    var lhmrb = $('#logo-hi-r');
    animatedElements.push(lhmrb);
    lhmrb.velocity({
      properties: { marginLeft:[-178,-89] },
      options: { duration: 500, delay:0 }
    });
  }


  function startFirstAnimation(){

    var logo_gif = $('#logo_gif');
    animatedElements.push(logo_gif);
    logo_gif.velocity({
      properties: { top: [550,20],  opacity:[0,1]},
      options: { duration: 1000, delay:100, complete:showHi,easing:'easeInExpo' }
    });

    var bottom_logo = $('#bottom-logo');
    animatedElements.push(bottom_logo);
    bottom_logo.velocity({
      properties: { bottom: [0,-170]},
      options: { duration: 600, delay:500 }
    });

    var progressbar = $('#progressbar-holder');
    animatedElements.push(progressbar);
    progressbar.velocity({
      properties: { bottom: [-20,100],  opacity:[0,1]},
      options: { duration: 1000, easing:'easeInExpo' }
    });
  }

  function showButtons(){
    var but = $('#start-button');
    animatedElements.push(but);
    but.velocity({
      properties: { marginTop: [0,100], opacity:[1,0]},
      options: { duration: 600 }
    });

  }

var bp_interval;
  function startProgressbar(){
    var trg=10;
    function choke(){
      trg+=Math.round(Math.random()*20+5);
    };
    var bp_interval = $interval(function(){
      $scope.progressbar.loaded += (trg - $scope.progressbar.loaded)/8;
      if($scope.progressbar.loaded>=100){
        $scope.progressbar.loaded=100;
        $interval.cancel(bp_interval);
        startDependingContent()
        return;
      }
      if(Math.abs($scope.progressbar.loaded-trg)<0.1){
        choke();
      }
    },1000/60)
  }

  function startDependingContent(){
    console.log('startDependingContent')
    var user = pbUser.getData();
    if(user.authed && _.isEmpty(user.ailments) && user.weight){
      console.log('startDependingContent - ')
      pagemanager.go('results.overview');
    }else{
      console.log('startDependingContent + ')
      $timeout(startFirstAnimation,500);
    }
  }



  // -- start animation depends on first time on page or not
  if($rootScope.alreadyLoaded){
    //$timeout(startDependingContent,500);
    startDependingContent()
  }else{
    $rootScope.alreadyLoaded = true;
    startProgressbar();
  }


  $scope.$on('$destroy',function(){
    if(bp_interval){$interval.cancel(bp_interval);}
    _.each(animatedElements, function(el){
      el.velocity("stop");
    })
  })


}]);

