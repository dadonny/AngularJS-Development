angular.module('potbot').controller('DashboardDispCtrl', ['$scope', '$state', 'lodash', 'dataLayer', 'pagemanager', 'sounds', 'dispensaries', 'doctors', 'rollovermodal',
  function($scope, $state, _, dataLayer, pagemanager,  sounds, dispensaries, doctors, rollovermodal) {
    $scope.dispensaries = dispensaries.data;
    $scope.doctors = doctors.data;

    $scope.venuesMenu = [
      {id:'dispensaries', label:'Nearby Dispensaries', selected:true},
      {id:'doctors', label:'Nearby Clinics', selected:false}
    ];

    $scope.venues = $scope.dispensaries;

    $scope.viewProfile = function(item){
      var type = $scope.venuesMenu[0].selected?'dispensaries':'doctors';

      dataLayer.httpGet('/'+type+'/'+item.id+'/acceptedReviews', true, {limit:20}).then(function(res) {

        item.reviews = res.data;

        item.showSumbitReviewModal = $scope.showSumbitReviewModal;
        if(type=='doctors'){
          rollovermodal.show('templates/modal/doctor-details.rollover.tmpl.html', item);
        }else{
          rollovermodal.show('templates/modal/disp-details.rollover.tmpl.html', item);
        }
      });
    };

    $scope.selectVenueMenu = function(item){
      _.each($scope.venuesMenu,function(a){
        if(a.id==item.id){
          a.selected = true;
          $scope.venues = $scope[a.id];
        }else{
          a.selected = false;
        }
      });
    }


  }]);
