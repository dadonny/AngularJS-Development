angular.module('potbot').factory('sounds', ['lodash','$rootScope','$cordovaNativeAudio', function(_, $rootScope,$cordovaNativeAudio) {
  var sounds = {
    chop1:{
      urls:['audio/chop1.mp3','audio/chop1.wav'],
      volume:0.3
    },
    chop3:{
      urls:['audio/chop3.mp3','audio/chop3.wav'],
      volume:0.7
    }

  };
function deviceReady(){

  _.each(sounds,function(item,key){

    if( window.plugins && window.plugins.NativeAudio ) {

      $cordovaNativeAudio.preloadSimple(key, item.urls[0]);
    }else{

      item.howl = new Howl({
        urls: item.urls,
        autoplay: false,
        loop: false,
        volume: item.volume
      });
    }

  });
}
  deviceReady();

  return {
    play:_.throttle(function(snd_id){
          if( window.plugins && window.plugins.NativeAudio ) {
            $cordovaNativeAudio.play(snd_id);
          }else{
            console.log('snd', snd_id,sounds[snd_id])
            sounds[snd_id].howl.play();
          }

    },50),
    deviceReady:deviceReady
  };
  //,{leading:false,trailing:true}

}]);
