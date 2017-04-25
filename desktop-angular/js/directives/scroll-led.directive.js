angular.module('potbot').directive('scrollLed', function() {
	return {
		restrict: 'A',
		//scope:{
		//	scrollLed:'@'
		//},
		transclude: true,
		template: '<div><b ng-show="scshow" style="position: absolute;right: 20px;" ng-style="{top:topshift}">SCROLL DOWN</b><sobject style="display: block;" ng-transclude></sobject></div>',
		link: function (scope, element, attrs) {
			//attrs.scrollLed
			var s = element.find('sobject');
			scope.$watch(function(){
				return element.height();
			},recalc);
			scope.$watch(function(){
				return s.height();
			},recalc);
			recalc()
			function recalc(){
				var s = element.find('sobject');
				scope.topshift = (element.height()-20)+'px';
				scope.scshow = (s.height()-attrs.scrollLed)>=element.height();
				//console.log('ASD FFF ',s.height()>=element.height(),element.height(), s.height());
			}
		}
	};
});
