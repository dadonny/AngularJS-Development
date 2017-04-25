angular.module('potbot').factory('dataLayer', ['pbConst', 'lodash', 'pbLoading','$http','$q','pbUser','pbModals','$rootScope', function(pbConst,_, pbLoading, $http, $q, pbUser,pbModals, $rootScope) {
//  var host =  'http://potbot-ui.elasticbeanstalk.com:80';
  var host =  'https://www.potbot-beta.com';
  //var host =  'http://localhost:8080';
//  var host = (window.location.hostname=='dev.potbot.io' || window.location.hostname=='localhost') ? 'https://www.potbotics-service.co.uk':'https://www.potbot-beta.com';
  var baseUrl = host+'/api';
  var cache = {};

  var user = pbUser.getData();
  pbUser.onLogout(function(){
    cache = {};
  })
  //function saveCache(url,res){
  //}

  var modal_scope = $rootScope.$new();
  pbModals.addModal(modal_scope, 'templates/modal/error-modal.html', function(modal){
    modal_scope.errorModal = modal;
  });
  function showError(msg){
    modal_scope.errorModal.message=msg;
    modal_scope.errorModal.show();
  }

  function errorHandler(err){
    pbLoading.hide();
      if(err.data && err.data.message){
        showError(err.data.message);
      }
  }

  return {
    getFrontendHost:function(){
      return (window.location.hostname=='dev.potbot.io' || window.location.hostname=='localhost') ? 'https://dev.potbot.io/PotBot/www/':'http://www.potbot.io/PotBot/www/';
    },
    getHost:function(){
      return host;
    },
    baseUrl:function(){
      return baseUrl;
    },
    httpGet:function(url, shouldCached,data){

      if(!data){data = {}};
      var hash = url+':'+JSON.stringify(data)+':'+JSON.stringify(_.pick(user,['age','weight','sex','usState','ailment','currentAilment','cannabisExperience','hasMedicalCannabisCard']));



      if(shouldCached && cache[hash]){
        return  $q(function(resolve, reject) {resolve(cache[hash])});
      }else{

        pbLoading.show();
        console.log(user.authed,url,data);
        var p  = $http(
          {
          method: 'GET',
          url: baseUrl+url,
          headers:user.authed?user.authed:{},
          params:data
          }
        );
        p.then(function(result){
          console.log('http [%s] result',url,result);
          pbLoading.hide();
          if(shouldCached){
            cache[hash] = result;
          }
        },errorHandler);
        return p;
      }
    },



    httpPost:function(url, shouldCached,data){

      if(!data){data = {}};
      var hash = url+':'+JSON.stringify(data)+':'+JSON.stringify(_.pick(user,['age','weight','sex','usState','ailment','currentAilment','cannabisExperience','hasMedicalCannabisCard']));;

      if(shouldCached && cache[hash]){
        return  $q(function(resolve, reject) {resolve(cache[hash])});
      }else{
        pbLoading.show({template:'Loading...'});
        console.log(user.authed,url,data);
        var p  = $http(
          {
            method: 'POST',
            url: baseUrl+url,
            headers:user.authed?user.authed:{},
            data:data
          }
        );
        p.then(function(result){
          console.log('http [%s] result',url,result);
          pbLoading.hide();
          if(shouldCached){
            cache[hash] = result;
          }
        },errorHandler);
        return p;
      }
    },

    httpPut:function(url,data){

      if(!data){data = {}};

      pbLoading.show({template:'Loading...'});
      console.log(data);
      var p  = $http(
        {
          method: 'PUT',
          url: baseUrl+url,
          headers:pbUser.getData().authed?pbUser.getData().authed:{},
          data:data
        }
      );
      p.then(function(result){
        console.log('http [%s] result',url,result);
        pbLoading.hide();
      },errorHandler);
      return p;

    },

    httpDelete:function(url,data){

      if(!data){data = {}};

      pbLoading.show();
      console.log(data);
      var p  = $http(
        {
          method: 'DELETE',
          url: baseUrl+url,
          headers:pbUser.getData().authed?pbUser.getData().authed:{},
          data:data
        }
      );
      p.then(function(result){
        console.log('http [%s] result',url,result);
        pbLoading.hide();
      },errorHandler);
      return p;

    },

    login:function(data, done){
      var headers = data ? {authorization : "Basic "
      + btoa(data.username + ":" + data.password)
      } : {};
      pbLoading.show();
      $http.get(baseUrl+'/user', {headers : headers}).then(function(data) {

        if(data.data.authenticated){
          $http.get(baseUrl+'/user/profile', {headers : headers}).then(function(profile) {
            pbUser.setUserOptions({name:{first: data.data.principal.firstName, last:data.data.principal.lastName},email:data.data.principal.email,username:data.data.principal.username });
            pbUser.setUserOptions(profile.data);
            pbUser.setUserOptions({authed:headers});

            var selectedPoint = _.findLastIndex(pbConst.cannabisExperienceLabels,function(item){
              return item.val<=profile.data.cannabisExperience;
            }) || 0;
            selectedPoint = selectedPoint>=0?selectedPoint:0;
            pbUser.setUserOptions({cannabisExperienceLabel:pbConst.cannabisExperienceLabels[selectedPoint].label});
            pbUser.setUserOptions({currentAilment:profile.data.ailments[0]});
            pbLoading.hide();
            done(null,data.data);
          },function(err){
            pbLoading.hide();
            console.error(err);
            done(err);
          });
        }else{
          pbLoading.hide();
          done('Unauth');
        }

      },function(err){
        pbLoading.hide();
        showError('Wrong username or password');
        console.error(err);
        done(err);
      });
    },

    signup:function(data,done){
      pbLoading.show();
      this.httpPost('/user/registration',false,data).then(function(res){
        if(res.status==201){
          console.log('signup done ',res);
          pbLoading.hide();
          done(null,res);
        }else{
          pbLoading.hide();
          done(res.status);
        }

      });
    }
  };

}]);
