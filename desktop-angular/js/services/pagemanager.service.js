angular.module('potbot').factory('pagemanager',  ['$state', 'lodash','$ionicViewSwitcher','$ionicHistory', function($state, _,$ionicViewSwitcher,$ionicHistory) {
  // Might use a resource here that returns a JSON array
  var pages = [
    {id:'enter'},
    {id:'disclaimer'},
    {id:'personaldata'},
    {id:'condition'},
    {id:'createprofile'},
    {id:'results.overview'},
    {id:'results.strains'},
    {id:'results.methods'},
    {id:'results.dispensaries'},
    {id:'results.doctor'}
  ];



  function PrevNext(name, customPrev, customNext){
    var i = _.indexOf(pages,_.find(pages,{id:name}));
    this.name = name;
    this.callbacks = {}
    this.next = customNext || pages[i+1] || null;
    this.prev = customPrev || pages[i-1] || null;
    this.clearCallbacks();
  }

  PrevNext.prototype.gotoNext = function(){
    if(this.next){
      this.clearCallbacks();
      $ionicViewSwitcher.nextDirection('forward');
      go(this.next.id);
    }
  };
  PrevNext.prototype.gotoPrev = function(){
    if(this.prev){
      this.clearCallbacks();
      $ionicViewSwitcher.nextDirection('back');
      go(this.prev.id);
    }
  };
  PrevNext.prototype.clearCallbacks = function(){
    this.callbacks = {
      next:function(next){next();},
      prev:function(next){next()}
    };
  }


  function go(state,isHard){

    var currentState = $state.current.name;

    if(isStatePage(state) && isStatePage(currentState)){
      $ionicViewSwitcher.nextDirection(backOrForward(currentState,state));
    }else if(isStatePage(state) && !isStatePage(currentState)){
      $ionicViewSwitcher.nextDirection('exit');
    }else if(!isStatePage(state) && isStatePage(currentState)){
      $ionicViewSwitcher.nextDirection('enter');
    }else{
      $ionicViewSwitcher.nextDirection('swap');
    }
    $ionicHistory.nextViewOptions({historyRoot: true});
    console.log('to state',state, isHard);
    $state.go(state,{isHard:isHard},{someSpec:'asd'});
  }

  function isStatePage(state){
    return _.some(pages,{'id':state})
  }

  function backOrForward(current, next){
    return  _.indexOf(pages, _.find(pages,{id:current})) < _.indexOf(pages, _.find(pages,{id:next})) ? 'forward' : 'back'
  }

  return {

    init:function($scope, nextChecker){//, customPrev, customNext
      //var pm = new PrevNext($state.current.name, customPrev, customNext);
      var pm = new PrevNext($state.current.name);
      $scope.prevNext = pm;
      $scope.gotoNext = function(){

        if(!nextChecker || nextChecker()){
          pm.callbacks.next(function(){
            pm.gotoNext();
          });
        }
      };

      $scope.gotoPrev = function(){
        pm.callbacks.prev(function(){
          pm.gotoPrev();
        })
      };

      return {
        next:function(cb){
          pm.callbacks.next = cb;
        },
        prev:function(cb){
          pm.callbacks.prev = cb;
        }
      }
    },

    go:function(state,isHard){
      go(state,isHard);
    }
  };
}]);
