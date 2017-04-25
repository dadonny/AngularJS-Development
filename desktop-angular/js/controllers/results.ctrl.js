angular.module('potbot').controller('ResultsCtrl', ['$scope', '$state','$rootScope','ailments','pbUser','lodash',
	function($scope, $state,$rootScope, ailments,pbUser,_) {

		//$scope.user = pbUser.getData();
		//console.log('FF ER   ',$scope.user.ailment.id,$scope.ailments);

		//$scope.currentAilment = _.findLast($scope.ailments,{id:$scope.user.ailment.id});
		//$scope.ailments = _.sortBy(ailments.data,'name');
		//$scope.currentAilment = $scope.user.currentAilment?$scope.user.currentAilment:$scope.ailments[0];
		//pbUser.setUserOptions({currentAilment:$scope.currentAilment});
		//$scope.currentAilment.selected = true;
		//
		//$scope.$watch('currentAilment',function(nv,ov){
		//	if(nv && nv.id != ov.id){
		//		pbUser.setUserOptions({currentAilment:$scope.currentAilment});
		//		$rootScope.$broadcast('currentAilmentChanged', nv);
		//	}
		//},true);
		//$scope.currentAilment

		//$scope.pageTitle = pageTitles[$state.current.name];
		//
		//
		//
		//$rootScope.$on('$stateChangeStart', function(event, toState, toParams, fromState, fromParams) {
		//	$scope.pageTitle = pageTitles[toState.name];
		//
		//
		//});
	}]);
