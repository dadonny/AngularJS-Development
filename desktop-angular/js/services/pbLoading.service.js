angular.module('potbot').factory('pbLoading', ['lodash','$rootScope','$ionicLoading','$timeout', function(_, $rootScope,$ionicLoading, $timeout) {

	var stack = 0;
	var cancel;
	return {
		show:function(){
			console.log('__show',stack);
			if(cancel){$timeout.cancel(cancel);}
			stack++;
			$ionicLoading.show({delay:300,template:'<ion-spinner class="spinner-balanced" icon="crescent"></ion-spinner>'});
			cancel = $timeout(function(){
				stack=0;
				$ionicLoading.hide();
			},10000)
		},
		hide:function(){
			console.log('__hide',stack);
			stack--;
			if(stack<=0){
				stack=0;
				if(cancel){$timeout.cancel(cancel);}
				$ionicLoading.hide();
			}
		}
	};
	//,{leading:false,trailing:true}

}]);
