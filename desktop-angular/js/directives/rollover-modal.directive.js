angular.module('potbot').directive('rolloverModal', ['lodash','$timeout', 'rollovermodal','sounds','dataLayer','pictureViewerService', function(_, $timeout, rollovermodal, sounds,dataLayer,pictureViewerService) {
  return {
    restrict: 'E',
    replace:true,
    templateUrl: 'js/directives/rollover-modal.tmpl.html',
    link: function (scope, element) {
      scope.state  = rollovermodal.state;
      scope.baseUrl = dataLayer.baseUrl();

      scope.showPicture = function(url){
        console.log(' >> ',url)
        pictureViewerService.show(url);
      };

      scope.$on('$includeContentLoaded',function(){
        if(scope.state.callbacks && scope.state.callbacks.ngLoadCallback){
          scope.state.callbacks.ngLoadCallback()
        }
      });

      scope.close = function(){
        sounds.play('chop3');
        if(scope.state.callbacks && scope.state.callbacks.onHide){
          scope.state.callbacks.onHide()
        }
        var video = element.find('#video');
        if(video){
          angular.element(video).attr('src','about:blank');
        }
        rollovermodal.hide();
      }
    }
  }
}]);
