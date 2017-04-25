'use strict';
/** 
  * controller for Messages
*/
app.controller('AilmentsCtrl', ["$scope", "$aside", "$state", "$http", "API", "SweetAlert", "$filter", function ($scope, $aside, $state, $http, api, SweetAlert, $filter) {

    $scope.ailments = [];
    $scope.consumptionmethods = [];

    $scope.step = .2;

    $scope.emptyAilment = function () {
        return {
            "cbdTo": 5,
            "new": false,
            "cbgFrom": 0,
            "cbgTo": 1.5,
            "thcFrom": 0,
            "cbdFrom": 0,
            "cbnFrom": 0,
            "cbnTo": 2,
            "sourceUrl": "",
            "thcvFrom": 0,
            "cbcFrom": 0,
            "name": "",
            "thcvTo": 2,
            "thcTo": 60,
            "id": 0,
            "cbcTo": 1
        }
    };

    $scope.addAilment = function () {
        var newAilment = new $scope.emptyAilment;
        $scope.ailments.push(newAilment);
        $scope.openAside(newAilment, true, true);
    };

    $scope.updateList = function () {
        $.get(api.host + api.ailments.url)
        .done(function (data, status, headers, config) {
            $scope.ailments = data;
            $scope.$apply();
        });
    }

    $scope.updateList();

    $.get(api.host + api.consumptionmethods.url)
        .done(function (data, status, headers, config) {
            $scope.consumptionmethods = data;
            $scope.$apply();
        });


    $scope.openAside = function (ailment, editing, adding) {
        var _$scope = $scope;
        $aside.open({
            templateUrl: 'asideContent.html',
            placement: 'right',
            size: 'md',
            backdrop: true,
            controller: function ($scope, $modalInstance) {
                var __$scope = _$scope;
                $scope.allConsumptionmethods = _$scope.consumptionmethods;
                $scope.editing = editing ? true : false;
                $scope.adding = adding ? true : false;
                $scope.checkedConsumptionmethods = {
                    methods: []
                };


                $scope.showStatus = function () {
                    var selected = [];
                    angular.forEach($scope.allConsumptionmethods, function (s) {
                        if ($scope.checkedConsumptionmethods.methods.indexOf(s.id) >= 0) {
                            selected.push(s.name);
                        }
                    });
                    return selected.length ? selected.join(', ') : 'Not set';
                };

                $scope.edit = function (e) {
                    $scope.editing = true;
                    setTimeout(function () {
                        $scope.ailmentform.$show()
                    }, 300);
                }

                $scope.cannabisExperiences = [
                    {
                        id: 1,
                        name: "Never"
                    },
                    {
                        id: 21,
                        name: "Rarely"
                    },
                    {
                        id: 41,
                        name: "Moderate"
                    },
                    {
                        id: 61,
                        name: "Often"
                    },
                    {
                        id: 81,
                        name: "Daily"
                    }
                ];

                $scope.cannabisExperience = {
                    id: 1,
                    name: "Never"
                };

                $scope.getRecommendedStrains = function (e) {
                    $.ajax({
                        success: function (response) {
                            $scope.recommendedStrains = response;
                            $scope.$apply();
                        },
                        type: 'get',
                        url: api.host + api.ailments.url + "/" + $scope.ailment.id + "/recommendedStrains?cannabisExperience=" + $scope.cannabisExperience.id,
                    })
                }

                $scope.add = function (e) {
                    var data = ailment;
                    for (var key in $scope.ailmentform.$data) {
                        data[key] = $scope.ailmentform.$data[key];
                    };
                    data.consumptionMethods = [];
                    var checked = $scope.ailmentform.$editables.filter(function (s) { if (s.directiveName === "editableChecklist") { return true } })[0].scope.$data;
                    checked = checked ? checked : [];
                    angular.forEach(checked, function (c) {
                        data.consumptionMethods.push({ id: c });
                    })

                    data.effectiveStrainTypes = [];

                    $.each($scope.types, function (index, element) {
                        if (element.checked) {
                            data.effectiveStrainTypes.push(element.value);
                        }
                    });

                    var url = ''
                        + api.host
                        + api.ailments.url;

                    var req = {
                        url: url,
                        method: 'POST',
                        data: JSON.stringify(data),
                        success: function () { console.log('success'); }
                    };


                    $.ajax(req)
                        .success(function () {
                            console.log('success');
                            $scope.$apply();
                            __$scope.updateList();
                            __$scope.$apply();
                        })
                        .error(function () {
                            console.log('error');
                        });

                    $modalInstance.close();
                    e.stopPropagation();
                    $scope.editing = false;
                };

                $scope.refresh = function (e) {
                    var data = ailment;
                    for (var key in $scope.ailmentform.$data) {
                        data[key] = $scope.ailmentform.$data[key];
                    };
                    data.consumptionMethods = [];
                    var checked = $scope.ailmentform.$editables.filter(function (s) { if (s.directiveName === "editableChecklist") { return true } })[0].scope.$data;
                    checked = checked ? checked : [];
                    angular.forEach(checked, function (c) {
                        data.consumptionMethods.push({ id: c });
                    })

                    data.effectiveStrainTypes = [];

                    $.each($scope.types, function (index, element) {
                        if (element.checked) {
                            data.effectiveStrainTypes.push(element.value);
                        }
                    });

                    var req = {
                        url: ''
                            + api.host
                            + api.ailments.url
                            + '/'
                            + ailment.id,
                        method: 'PUT',
                        data: JSON.stringify(data)
                    };

                    $.ajax(req).done(function () {
                        $scope.$apply();
                        __$scope.updateList();
                        __$scope.$apply();
                    });
                    $modalInstance.close();
                    e.stopPropagation();
                    $scope.editing = false;
                };

                $scope.save = function (e) {
                    $scope.isNew = false;

                    if (!$scope.ailment.name) {
                        return;
                    }

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
                $scope.ailment = ailment;


                $scope.types = [{ name: "Indica", value: "INDICA", checked: false },
                    { name: "Indica Dominant", value: "INDICA_DOMINANT", checked: false },
                    { name: "Sativa", value: "SATIVA", checked: false },
                    { name: "Sativa Dominant", value: "SATIVA_DOMINANT", checked: false },
                    { name: "Hybrid", value: "HYBRID", checked: false }];

                if ($scope.ailment.id) {
                    $.get(api.host + api.ailments.url + '/' + ailment.id)
                        .done(function (data, status, headers, config) {
                            ailment = $scope.ailment = data;
                            if (ailment.consumptionMethods) {
                                $scope.checkedConsumptionmethods.methods = ailment.consumptionMethods.map(function (m) { return m.id });
                            } else {
                                $scope.checkedConsumptionmethods.methods = [];
                            }

                            if (ailment.effectiveStrainTypes && ailment.effectiveStrainTypes.length) {
                                ailment.effectiveStrainTypes.forEach(function (item) {
                                    $.each($scope.types, function (index, element) {
                                        if (element.value == item) {
                                            element.checked = true;
                                        }
                                    });
                                });
                            }

                            $scope.$apply();
                        });
                }
                else {
                    $scope.isNew = true;
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
                                + api.ailments.url
                                + '/'
                                + ailment.id;
                            $.ajax({ url: url, type: 'DELETE' })
                                .done(function () {
                                    __$scope.updateList();

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


