angular.module('potbot').factory('rollovermodal', ['lodash','$timeout', function(_, $timeout) {
  // Might use a resource here that returns a JSON array
  var state = {
    hidden:true,
    template:'templates/modal/empty.rollover.tmpl.html',
    data:{testvar:'ttv'},
    onIncludeLoaded:onIncludeLoaded
  };
  var closeTimeout;

  function onIncludeLoaded(){
    state.hidden = false;
  }

  return {
    show:function(tmpl, data, callbacks){
      state.data = data;
      state.callbacks = callbacks;
      state.template = tmpl+'?r='+Math.round(Math.random()*77779999);
      //state.onLoad = function(){
      //  console.log('onload');
      //
      //};
      state.hidden = false;

    },
    hide:function(){
      state.data = {};
      state.callbacks = {};
      state.template = '';
      state.hidden = true;
    },
    state:state
  };
}]);
