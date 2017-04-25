'use strict';
/** 
  * controller for Messages
*/
app.controller('CannabinoidsCtrl', ["$scope", "$state", "$http", "API", "$aside", "SweetAlert", function ($scope, $state, $http, api, $aside, SweetAlert) {

    $scope.getNewCannabinoid = function () {
        return {
            "code": "",
            "molecularMass": 0,
            "name": "",
            "description": "",
            "formula": "",
            "title": "",
            "boilingPoint": 0
        }
    };

    $scope.cannabinoids = [{
        description: ''
    }];

    $scope.fetch = function ($scope) {
        var req = {
            url: api.host + api.cannabinoids.GET_ALL_CANNABINOIDS.url,
            type: 'GET'
        };
        $.ajax(req)
            .done(function (data, status, headers, config) {
                $scope.cannabinoids = data;
                //$scope.splitCannabinoids(); 
                $scope.$apply();
            });
    };

    $scope.fetch($scope);

    $scope.edit = function ($event, cannabinoid) {
        $scope.openAside(cannabinoid);
    };

    $scope.addCanabinoid = function () {
        var newCannabinoid = $scope.getNewCannabinoid();
        $scope.cannabinoids.push(newCannabinoid);
        $scope.splitCannabinoids();
        $scope.openAside(newCannabinoid, true, true)
    }

    $scope.openAside = function (cannabinoid, editing, adding) {
        var _$scope = $scope;
        $aside.open({
            templateUrl: 'asideContent.html',
            placement: 'right',
            size: 'md',
            backdrop: true,
            controller: function ($scope, $modalInstance) {
                var __$scope = _$scope;
                $scope.editing = editing ? true : false;
                $scope.adding = adding ? true : false;
                $scope.edit = function (e) {
                    $scope.editing = true;
                    setTimeout(function () {
                        $scope.cannabinoidform.$show()
                    }, 300);
                }
                $scope.add = function (e) {
                    var data = cannabinoid;
                    for (var key in $scope.cannabinoidform.$data) {
                        data[key] = $scope.cannabinoidform.$data[key];
                    };
                    if (!$scope.cannabinoidform.$data.name) {
                        $scope.cannabinoidform.$setError('name', 'Name is required');
                        e.preventDefault();
                        e.stopPropagation();
                        return false;
                    }
                    data.molecularMass = Number(data.molecularMass);
                    data.boilingPoint = Number(data.boilingPoint);
                    if (isNaN(data.molecularMass) || isNaN(data.boilingPoint)) {
                        $scope.cannabinoidform.$setError('molecularMass', 'Must be a number');
                        $scope.cannabinoidform.$setError('boilingPoint', 'Must be a number');
                        e.preventDefault();
                        e.stopPropagation();
                        return false;
                    }

                    data.code = data.title.toLowerCase();

                    var url = ''
                        + api.host
                        + api.cannabinoids.CREATE_NEW_CANNABINOID.url;

                    var req = {
                        url: url,
                        method: api.cannabinoids.CREATE_NEW_CANNABINOID.type,
                        data: JSON.stringify(data),
                        success: function () { console.log('success'); }
                    };
                    console.log(req);


                    $.ajax(req)
                        .done(function () {
                            console.log('success');
                            $scope.$apply();
                            __$scope.$apply();
                        })
                        .error(function () {
                            // $scope.cannabinoidform.$setError('name', 'Unknown error!');
                            console.log('error');
                        });

                    $modalInstance.close();
                    e.stopPropagation();
                    $scope.editing = false;
                };

                $scope.refresh = function (e) {
                    var data = $scope.cannabinoid;
                    for (var key in $scope.cannabinoidform.$data) {
                        data[key] = $scope.cannabinoidform.$data[key];
                    };

                    if (!data.name || !data.title || !data.formula || !data.molecularMass || !data.boilingPoint) {
                        return;
                    }

                    data.molecularMass = Number(data.molecularMass);
                    data.boilingPoint = Number(data.boilingPoint);
                    if (isNaN(data.molecularMass) || isNaN(data.boilingPoint)) {
                        $scope.isNotValidData = true;
                        e.preventDefault();
                        e.stopPropagation();
                        return false;
                    }

                    var req = {
                        url: ''
                            + api.host
                            + api.cannabinoids.UPDATE_ONE_CANNABINOID.url
                            + cannabinoid.code,
                        method: api.cannabinoids.UPDATE_ONE_CANNABINOID.type,
                        data: JSON.stringify(data)
                    };

                    $.ajax(req).success(function () { $scope.$apply(); __$scope.fetch(__$scope); __$scope.$apply(); })
                        .error(function () { $scope.isNotValidData = true; $scope.$apply(); __$scope.$apply(); });
                    $modalInstance.close();
                    e.stopPropagation();
                    $scope.editing = false;
                };

                $scope.save = function (e) {
                    if ($scope.adding) {
                        $scope.add(e);
                    } else {
                        $scope.refresh(e);
                    }
                };
                $scope.cancel = function (e) {
                    $modalInstance.dismiss();
                    e.stopPropagation();
                };

                if (cannabinoid.code) {
                    $.ajax({
                        url: api.host + api.cannabinoids.GET_ONE_CANNABINOID.url + cannabinoid.code,
                        type: 'GET'
                    })
                        .done(function (response) {
                            $scope.cannabinoid = response;
                            $scope.$apply();
                            __$scope.$apply();
                        })
                        .error(function () {
                            console.log('error');
                        });
                }

                $scope.remove = function (e) {
                    SweetAlert.swal({
                        title: "Are you sure?",
                        text: "Your will not be able to recover this record!",
                        type: "warning",
                        showCancelButton: true,
                        confirmButtonColor: "#DD6B55",
                        confirmButtonText: "Yes, delete it!",
                        cancelButtonText: "Cancel",
                        closeOnConfirm: false,
                        closeOnCancel: true
                    }, function (isConfirm) {
                        if (isConfirm) {
                            var url = ''
                                + api.host
                                + api.cannabinoids.DELETE_ONE_CANNABINOID.url
                                + cannabinoid.code;
                            $.ajax({ url: url, type: 'DELETE' })
                                .done(function () {
                                    __$scope.fetch(__$scope);
                                    SweetAlert.swal({
                                        title: "Deleted!",
                                        text: "Your imaginary file has been deleted.",
                                        type: "success",
                                        confirmButtonColor: "#007AFF"
                                    }, function () {
                                        $modalInstance.close();
                                    });
                                })
                        }
                    });
                };
                if ($scope.editing) {
                    $scope.edit();
                }
            }
        });
    };
}]);
// app.controller('ViewMessageCrtl', ['$scope', '$stateParams',
// function ($scope, $stateParams) {
//     function getById(arr, id) {
//         for (var d = 0, len = arr.length; d < len; d += 1) {
//             if (arr[d].id == id) {

//                 return arr[d];
//             }
//         }
//     }

//     $scope.message = getById($scope.messages, $stateParams.inboxID);

// }]);