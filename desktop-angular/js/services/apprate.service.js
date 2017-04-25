angular.module('potbot').factory('pbAppRate', ['lodash','$rootScope','$cordovaAppRate','pbModals','pbConst', function(_, $rootScope,$cordovaAppRate,pbModals,pbConst) {

	localStorage.getItem(pbConst.cookieName);
	var test = {runs:localStorage.getItem('runs') ,votes:localStorage.getItem('voted') };




	var $scope = $rootScope.$new();
	$scope.openLink = function(link){
		var result;
		var startingUrl = "http://";
		var httpsStartingUrl = "https://";
		if(link.startWith(startingUrl)||link.startWith(httpsStartingUrl)){
			result = link;
		} else {
			result = startingUrl + link;
		}
		window.open(result, '_system', 'location=yes');
	};

	pbModals.addModal($scope, 'templates/modal/rate-modal.html', function(modal){
		$scope.rateModal = modal;
		//$scope.rateModal.show();
		runUpCheck();
	});

	$scope.answer = function(stars){
		//console.log('sTARTS',stars);
		var appId = '1054510025';
		localStorage.setItem('voted','done');
		if(stars>=4){
				window.open('http://itunes.apple.com/WebObjects/MZStore.woa/wa/viewContentsUserReviews?id='+appId+'&pageNumber=0&sortOrdering=2&type=Purple+Software&mt=8', '_system', 'location=yes');
				//window.open('itms-apps://itunes.apple.com/app/id'+appId, '_system', 'location=yes');
		}else{
			$rootScope.$broadcast('potbot:openFeedback');
		}
		$scope.rateModal.hide();
	}

	function runUpCheck(){
		if(!window.cordova){return;}
		var runs = localStorage.getItem('runs') || 0;

		runs++;

		if(runs==3){
			runs=0;
			if(localStorage.getItem('voted')=='done'){
				//localStorage.removeItem('voted')
			}else{
				$scope.rateModal.show();
			}
		}
		localStorage.setItem('runs',runs);
	}

	return {
		openAppRate:function(openerId){
			if(!window.cordova){return;}
			if(localStorage.getItem(openerId)=='done'){
				//do nothing, its already done
			}else{
				localStorage.setItem(openerId,'done');
				$scope.rateModal.show();
			}

		},
		test:function(){
			return test;
		}
	};
}]);