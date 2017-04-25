'use strict';
/** 
  * controller for Messages
*/
app.directive('bootstrapSwitch', [
        function () {
            return {
                restrict: 'A',
                require: '?ngModel',
                link: function (scope, element, attrs, ngModel) {
                    element.bootstrapSwitch();

                    element.on('switchChange.bootstrapSwitch', function (event, state) {
                        if (ngModel) {
                            scope.$apply(function () {
                                ngModel.$setViewValue(state);
                            });
                        }
                    });

                    scope.$watch(attrs.ngModel, function (newValue, oldValue) {
                        if (newValue) {
                            element.bootstrapSwitch('state', true, true);
                        } else {
                            element.bootstrapSwitch('state', false, true);
                        }
                    });
                }
            };
        }
]).controller('DispensariesCtrl', ["$scope", "$state", "$http", "API", "$aside", "SweetAlert", "ngTableParams", "$location", function ($scope, $state, $http, api, $aside, SweetAlert, ngTableParams, $location) {

    $scope.getImage = function (id) {
        var url = api.host + api.dispensaries.url
            + '/'
            + id
            + '/image';
        return url
    };

    $scope.loadReviews = function (offset, limit) {

        if (!dispensary.id)
            return;

        if (!offset) {
            offset = 0;
        }

        if (!limit) {
            limit = $scope.currentReviewLimit;
        }

        $.ajax({
            success: function (response) {

                $scope.reviews = response;
                
                $scope.$apply();
            },
            type: 'get',
            url: api.host + api.dispensaries.url + '/' + dispensary.id + '/reviews' + '?limit=' + limit + '&offset=' + offset
        });
    };

    $scope.getData = function ($defer, params) {

        $location.search(params.url());
        var url = api.host + api.dispensaries.url;

        if ($defer) {
            $scope.$defer = $defer;
        }

        if (params) {
            $scope.params = params;
        }

        var filter = "";

        if ($scope.commonFilter) {
            filter = "&commonFilter=" + $scope.commonFilter;
        }
        $scope.params = params;
        var offset = params.url().page - 1;
        offset = offset * params.url().count;
        $.ajax({
            success: function (response, textStatus, request) {
                $scope.totalItems = parseInt(request.getResponseHeader('X-Total-Count'));
                $scope.params.total($scope.totalItems);
                $scope.dispensaries = response;
                $defer.resolve(response);
                $scope.$apply();
            },
            xhrFields: {withCredentials: true},
            type: 'get',
            url: api.host + api.dispensaries.url + '?limit=' + params.url().count + '&offset=' + offset + filter,
        });
    };
     
    $scope.initTable = function () {

        $scope.tableParams = new ngTableParams(
    angular.extend({
        page: 1, // show first page
        count: 10 // count per page
    }, $location.search()), {
        total: $scope.totalItems, // length of data
        getData: function ($defer, params) {
            $scope.getData($defer, params);
        }
    });
    };

    $scope.initTable();

    $scope.grades = [
        { value: "A", text: "A" },
        { value: "B", text: "B" },
        { value: "C", text: "C" },
        { value: "D", text: "D" }
    ];

    $scope.grade = "A";

    $scope.showGrade = function () {
        var selected = $filter('filter')($scope.grades, { value: $scope.grade });
        return ($scope.grade && selected.length) ? selected[0].text : 'Not set';
    };


    $scope.getNewDispensary = function () {
        return {
            "name": "",
            "type": "Medical",
            "addressLine1": "",
            "addressLine2": "",
            "usState": { "code": "CA" },
            "postcode": "",
            "phones": "",
            "coordLat": 30.0,
            "coordLng": 70.0,
            "couponMainText": "",
            "couponExtText": ""
        }
    };

    $scope.edit = function ($event, dispensary) {
        $scope.openAside(dispensary, false, false, $scope.usStates);
    };

    $scope.addDispensary = function ($event) {
        var newDispensary = $scope.getNewDispensary();
        if (!$scope.usStates) {
            $.ajax({
                success: function (response) {
                    $scope.usStates = response;
                    $scope.$apply();
                    $scope.openAside(newDispensary, true, true, $scope.usStates)
                },
                type: 'get',
                url: api.host + api.usStates.url,
            })
        }
        else
            $scope.openAside(newDispensary, true, true, $scope.usStates)
    }

    $scope.openReviewsAside = function (dispensary) {
        var _$scope = $scope;

        $aside.open({
            templateUrl: 'reviewsAsideContent.html',
            placement: 'right',
            size: 'md',
            backdrop: true,
            controller: function ($scope, $modalInstance) {
                var __$scope = _$scope;
              
                $scope.REVIEW_LIMIT = 10;

                if (!dispensary.reviewsCount) {
                    $scope.loadingStop = true;
                }

                $scope.isRequestLoading = false;

                $scope.lineInView = function () {

                    if ($scope.isRequestLoading)
                        return;

                    $scope.isRequestLoading = true;

                    if ($scope.loadingStop) {
                        return;
                    }

                    if (!$scope.offset) {
                        $scope.offset = 0;
                        $scope.reviews = [];
                    }

                    $.ajax({
                        success: function (response) {

                            $("body").find("*").scroll(function () {
                                
                                if ($scope.isElementInViewport($('#loading-label'))) {
                                    $scope.lineInView();
                                }
                            });

                            if (response.length < $scope.REVIEW_LIMIT) {
                                $scope.loadingStop = true;
                            }

                            //if ($scope.reviews.length > $scope.offset) {
                            //    return;
                            //}

                            $scope.reviews = $scope.reviews.concat(response);

                            $scope.offset += $scope.REVIEW_LIMIT;

                            $scope.$apply();

                            $scope.isRequestLoading = false

                            if ($scope.isElementInViewport($('#loading-label'))) {
                                $scope.lineInView();
                            }

                            $scope.updateChecks();
                        },
                        type: 'get',
                        url: api.host + api.dispensaries.url + '/' + dispensary.id + '/reviews' + '?limit=' + $scope.REVIEW_LIMIT + '&offset=' + $scope.offset
                    });
                };

                $scope.removeReview = function (review) {
                    $.ajax({
                        success: function (response) {
                            $scope.reviews.splice($scope.reviews.indexOf(review), 1);
                            $scope.$apply();
                        },
                        type: 'DELETE',
                        url: api.host + api.dispensaries.url + '/' + dispensary.id + '/reviews/' + review.id
                    });

                    dispensary.reviewsCount--;
                }

                $scope.isElementInViewport = function(el) {

                    //special bonus for those using jQuery
                    if (typeof jQuery === "function" && el instanceof jQuery) {
                        el = el[0];
                    }

                    if (!el) {
                        return;
                    }

                    var rect = el.getBoundingClientRect();

                    return (
                        rect.top >= 0 &&
                        rect.left >= 0 &&
                        rect.bottom <= (window.innerHeight || document.documentElement.clientHeight) && /*or $(window).height() */
                        rect.right <= (window.innerWidth || document.documentElement.clientWidth) /*or $(window).width() */
                    );
                }

                $scope.close = function (e) {
                    $modalInstance.dismiss();
                    e.stopPropagation();
                };

                $('.modal-dialog').on('DOMContentLoaded load resize scroll', function () {
                    console.log('visibility ' + $scope.isElementInViewport($('#loading-label')));
                });
 
                $scope.updateChecks = function () {

                    $('.button-checkbox').each(function () {

                        // Settings
                        var $widget = $(this),
                            $button = $widget.find('button'),
                            $checkbox = $widget.find('input:checkbox'),
                            color = $button.data('color'),
                            settings = {
                                on: {
                                    icon: 'glyphicon glyphicon-check'
                                },
                                off: {
                                    icon: 'glyphicon glyphicon-unchecked'
                                }
                            };

                        $button.unbind("click");

                        // Event Handlers
                        $button.on('click', function () {

                            var reviewId = $(this).data('id');
                            var review = $.grep($scope.reviews, function (e) { return e.id == reviewId; })[0];

                            review.accepted = !review.accepted;
                            $scope.$apply();

                            $checkbox.triggerHandler('change');
                            updateDisplay();
                        });

                        $checkbox.unbind("change");

                        $checkbox.on('change', function () {

                            var reviewId = $(this).data('id');

                            var review = $.grep($scope.reviews, function (e) { return e.id == reviewId; })[0];

                            $scope.$apply();

                            $.ajax({
                                success: function (response) {
                                    updateDisplay();
                                },
                                data: JSON.stringify(review),
                                type: 'PUT',
                                url: api.host + api.dispensaries.url + '/' + dispensary.id + '/reviews/' + reviewId
                            });

                        });

                        // Actions
                        function updateDisplay() {
                            var isChecked = $checkbox.is(':checked');

                            // Set the button's state
                            $button.data('state', (isChecked) ? "on" : "off");

                            // Set the button's icon
                            $button.find('.state-icon')
                                .removeClass()
                                .addClass('state-icon ' + settings[$button.data('state')].icon);

                            // Update the button's color
                            if (isChecked) {
                                $button.html('Accepted');
                                $button
                                    .removeClass('btn-default')
                                    .addClass('btn-' + color + ' active');
                            }
                            else {
                                $button.html('Unaccepted');
                                $button
                                    .removeClass('btn-' + color + ' active')
                                    .addClass('btn-default');
                            }

                            $button.prepend('<i class="state-icon ' + settings[$button.data('state')].icon + '"></i> ');
                        }

                        // Initialization
                        function init() {

                            updateDisplay();

                            // Inject the icon if applicable
                            if ($button.find('.state-icon').length == 0) {
                                $button.prepend('<i class="state-icon ' + settings[$button.data('state')].icon + '"></i> ');
                            }
                        }
                        init();
                    });
                }

                $scope.lineInView();
            }

        });
    };

    $scope.openAside = function (dispensary, editing, adding, usStates) {
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
                $scope.usStates = usStates;
                $scope.edit = function (e) {
                    $scope.editing = true;
                    setTimeout(function () {
                        $scope.dispensaryform.$show()
                    }, 300);
                };
 
                $scope.currentReviewPage = 1;
                $scope.currentReviewLimit = 10;

                $scope.isNotValidData = false;

                $scope.map = {
                    center: {
                        latitude: dispensary.coordLat | 45,
                        longitude: dispensary.coordLng | 73
                    },
                    zoom: 11,
                    markers: [
                        {
                            id: Date.now(),
                            coords: {
                                latitude: dispensary.coordLat,
                                longitude: dispensary.coordLng
                            }
                        }
                    ],
                    events: {
                        click: function (map, eventName, originalEventArgs) {
                            var e = originalEventArgs[0];
                            var lat = e.latLng.lat(), lon = e.latLng.lng();

                            $scope.dispensary.coordLat = lat;
                            $scope.dispensary.coordLng = lon;

                            var marker = {
                                id: Date.now(),
                                coords: {
                                    latitude: lat,
                                    longitude: lon
                                }
                            };
                            $scope.map.markers = [];
                            $scope.map.markers.push(marker);
                            $scope.$apply();
                        }
                    }
                };

                $scope.add = function (e) {
                    var data = {};

                    for (var key in $scope.dispensary) {
                        data[key] = $scope.dispensary[key];
                    };

                    for (var key in $scope.dispensaryform.$data) {
                        data[key] = $scope.dispensaryform.$data[key];
                    };

                    for (var i = 0; i < data.phones.length; i++) {
                        data.phones[i] = data.phones[i].text;
                    }

                    for (var i = 0; i < data.hours.length; i++) {
                        data.hours[i] = data.hours[i].text;
                    }

                    if (!data.hasDiscount) {
                        data.hasDiscount = false;
                    }

                    var url = ''
                        + api.host
                        + api.dispensaries.url;

                    $.post(url, JSON.stringify(data))
                        .success(function () {
                            $modalInstance.close();
                            e.stopPropagation();
                            $scope.editing = false;
                        })
                        .error(function (err) {
                            $scope.isNotValidData = true;
                            $scope.$apply();
                            console.log('error');
                        });

                };

                $scope.refresh = function (e) {
                    var data = {};

                    for (var key in $scope.dispensary) {
                        data[key] = $scope.dispensary[key];
                    };

                    for (var key in $scope.dispensaryform.$data) {
                        data[key] = $scope.dispensaryform.$data[key];
                    };

                    for (var i = 0; i < data.phones.length; i++) {
                        data.phones[i] = data.phones[i].text;
                    }

                    for (var i = 0; i < data.hours.length; i++) {
                        data.hours[i] = data.hours[i].text;
                    }

                    var req = {
                        url: ''
                            + api.host
                            + api.dispensaries.url
                            + '/'
                            + data.id,
                        method: 'PUT',
                        data: JSON.stringify(data),
                        success: function () {
                            for (var key in data) {
                                dispensary[key] = data[key];
                            };

                            $modalInstance.close();
                            e.stopPropagation();
                            $scope.editing = false;
                        },
                        error: function () {
                            $scope.isNotValidData = true;
                        }
                    };

                    $.ajax(req);

                };

                $scope.save = function (e) {

                    $scope.isNew = false;

                    if (!$scope.dispensary.name ||
                        !$scope.dispensary.postcode ||
                        !$scope.dispensary.hours ||
                        $scope.dispensary.hours.length <= 0 ||
                        !$scope.dispensary.phones ||
                         $scope.dispensary.phones.length <= 0 ||
                        !$scope.dispensary.addressLine1) {
                        return;
                    }

                    if ($scope.dispensary.hasDiscount &&
                        (!$scope.dispensary.couponExtText ||
                        !$scope.dispensary.couponMainText)) {
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

                if (dispensary.id)
                {
                    $.ajax({
                        success: function (response) {
                            $scope.dispensary = response;
                            
                            $scope.$apply();
                        },
                        type: 'get',
                        url: api.host + api.dispensaries.url + '/' + dispensary.id
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
                                + api.dispensaries.url
                                + '/'
                                + dispensary.id;
                            $.ajax({ url: url, type: 'DELETE' })
                                .done(function () {
                                    __$scope.tableParams.reload();
                                    SweetAlert.swal({
                                        title: "Deleted!",
                                        text: "Record has been deleted.",
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