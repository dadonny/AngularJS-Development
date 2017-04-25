angular.module('potbot').directive('pictureViewer',['$rootScope', 'pictureViewerService', '$state','sounds', function($rootScope,pictureViewerService, $state, sounds) {
	return {
		restrict: 'E',
		scope:{},
		templateUrl: 'js/directives/picture-viewer.tmpl.html',
		link: function (scope, element) {
			scope.state = pictureViewerService.state;
			scope.hide = function(){
				pictureViewerService.hide();
			}
		}
	}
}]);
