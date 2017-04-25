angular.module('potbot').directive('news', ['newsService',function(newsService) {
	return {
		restrict: 'E',
		scope: {},
		templateUrl: 'js/directives/news.tmpl.html',
		link: function (scope, element) {

		}
	}
}]);
