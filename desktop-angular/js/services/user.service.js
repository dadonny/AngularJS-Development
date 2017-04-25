angular.module('potbot').factory('pbUser', ['lodash','$rootScope','$cordovaGeolocation','pbConst', function(_, $rootScope, $cordovaGeolocation, pbConst) {
  // Might use a resource here that returns a JSON array

  var cookieName = pbConst.cookieName;

  var defaultUser = {
    authed:false,
    name:false,
    email:null,
    age:18,
    weight:60,
    sex:null,
    //medicalCard:false,
    usState: {
      code:null,
      name:null,
      location:{}
    },
    zipCode: '',
    ailments:[],
    favoriteStrains:{},
    coords:null,
    currentAilment:null,
    ailmentLabel:null,
    cannabisExperience:null,
    cannabisExperienceLabel:null,
    hasMedicalCannabisCard:null,
    guest:true
  };



//Retrieve
  var user;
  var copiedUser;
  var onLogoutCallbacks = [];
  var pbSavedUser = localStorage.getItem(cookieName);
  if(pbSavedUser){
    try{
      user=JSON.parse(pbSavedUser);
      if(!_.isArray(user.ailments)){
        user.ailments = [user.ailments]
      }
      if(user.currentAilment == null){
        user.currentAilment = user.ailments[0];
      }
    }catch(e){
      console.error('saved user parsing error ');
      user = _.clone(defaultUser);
    }
  }else{
    user = _.clone(defaultUser);
  }


  $rootScope.$watch(function(){
    return user;
  },function(nv, ov){
    user.displayName = user.name? (_.capitalize(user.name.first) + ' '+user.name.last.split('')[0].toUpperCase()+'.'):'';
    localStorage.setItem(cookieName, JSON.stringify(nv));
  },true);


  function getStateCoords(){
    console.log('get state coords',user.usState)
    return {longitude:user.usState.coordLng,latitude:user.usState.coordLat}
  }

  function getCurrentCoords(done){
    var posOptions = {timeout: 10000, enableHighAccuracy: false};
    $cordovaGeolocation
        .getCurrentPosition(posOptions)
        .then(function (position) {
          console.log('cordova pos',position)
          //var lat  = position.coords.latitude
          //var long = position.coords.longitude
          user.coords = position.coords;
          done(position.coords);
        }, function(err) {
          // error
          user.coords = getStateCoords();
          done(getStateCoords());
        });


    //if (navigator.geolocation) {
    //  navigator.geolocation.getCurrentPosition(function(data){
    //    if(data.coords){
    //      user.coords = {longitude:data.coords.longitude,latitude:data.coords.latitude};
    //      done(data.coords);
    //    }else{
    //      user.coords = getStateCoords();
    //      done(getStateCoords());
    //    }
    //  },function(){
    //    console.log('get coords state, blocked');
    //    user.coords = getStateCoords();
    //    done(getStateCoords());
    //  });
    //} else {
    //  console.log('get coords state');
    //  user.coords = getStateCoords();
      done(getStateCoords());
    //}
  }


  return {
    setUserOptions:function(options){
      if(options){
        _.assign(user,options)
      }
    },
    getData:function(){
      return user;
    },
    resetUser:function(){
      console.log('reset!')
      user = _.clone(defaultUser);
    },
    logout:function(){
      console.log('logout user');
      //user.authed = false;
      _.each(user,function(item,key){
        if(_.isObject(item)){
          user[key] = _.clone(defaultUser[key]);
        }else{
          user[key] = defaultUser[key];
        }
      });
      _.each(onLogoutCallbacks,function(item){
        item();
      });
      onLogoutCallbacks=[];
      //localStorage.setItem("pbSavedUser", JSON.stringify(user));
    },
    onLogout:function(cb){
      onLogoutCallbacks.push(cb);
    },
    isAuthed:function(){
      return user.authed &&  !_.isEmpty(user.authed);
    },
    isGuest:function(){
      return user.guest;
    },
    isFilled:function(){
      return !_.chain(user).pick(['age','weight','sex','usState','ailments']).some(function(item){
        return (_.isObject(item) && _.isNull(item.name)) || _.isNull(item);
      }).value()
    },

    getCoords:function(done, useStates){
      console.log('get coords');
      if(useStates){
        console.log('get coords use states');
        done(getStateCoords());
      }else if(user.coords && !_.isEmpty(user.coords)){
        console.log('get coords use user');
        done(user.coords);
      }else{
        console.log('get coords use current');
        getCurrentCoords(done)
      }
    },
    createACopy:function(){
      copiedUser = _.cloneDeep(user,true);
    },
    restoreUser:function(){
      user = _.clone(copiedUser,true);
      copiedUser = null;
    },
    isChanged:function(field){
      if(!field){
        return !_.isEqual(user,copiedUser);
      }else{
        return !_.isEqual(user[field],copiedUser[field]);
      }

    }
  };
}]);
