angular.module('potbot').directive('feedbackButton', function() {
  return {
    restrict: 'E',
    templateUrl: 'js/directives/feedback-button.tmpl.html',
    link: function (scope, element) {
      scope.feedbackOpen = function(){

      }
    }
  };
});
