angular.module('potbot').factory('externalMaps', ['lodash','$rootScope', function(_, $rootScope) {


	return {
		shouldOpen:function(){
			//if ios
			return !!window.cordova;
		},
		open:function(start,dest){
			var saddr = start.lat() +','+start.lng();
			var daddr = dest.lat() +','+dest.lng();
			window.open('//maps.apple.com/?saddr='+saddr+'&daddr='+daddr+'&dirflg=d');
		}
	}
}]);


