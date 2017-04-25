angular.module('potbot').directive('feedback', ['dataLayer', 'lodash', function(dataLayer, _) {
  return {
    restrict: 'E',
    scope:{
      hide:'&'
    },
    templateUrl: 'js/directives/feedback.tmpl.html',
    link: function (scope, element) {
      scope.feedback={
        answer1: "",
        answer2: "",
        answer3: "",
        common: "",
        experienceRate: 0,
        ratingReason: "",
        wantToRecommend: false
      };

      scope.submit = function(){
        console.log('> ',scope.feedback);
        console.log('hide',scope.hide);

        dataLayer.httpPost('/feedbacks',false,scope.feedback).then(function(resp){
          console.log('resp', resp);
          scope.hide();
        });
      }
    }
  };
}]);
