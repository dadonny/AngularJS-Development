'use strict';

app.controller('ConsumptionmethodsCtrl', ["$scope", "flowFactory", "$state", "$http", "API", "$aside", "SweetAlert", function ($scope, flowFactory, $state, $http, api, $aside, SweetAlert) {

    $scope.imageHost = api.imageHost;

    $scope.consumptionmethods = [];

    $scope.getNewConsumptionmethod = function () {
        return {
            "name": "",
            "description": "",
            "image": ""
        }
    };

    $scope.fetch = function ($scope) {
        var req = {
            url: api.host + api.consumptionmethods.url,
            type: 'GET'
        };
        $.ajax(req)
            .done(function (data, status, headers, config) {
                $scope.consumptionmethods = data;
                $scope.$apply();
            });
    };

    $scope.fetch($scope);

    $scope.edit = function ($event, consumptionmethod) {
        $scope.openAside(consumptionmethod);
    };

    $scope.addConsumptionmethod = function () {
        var newConsumptionmethod = $scope.getNewConsumptionmethod();
        $scope.consumptionmethods.push(newConsumptionmethod);
        $scope.openAside(newConsumptionmethod, true, true)
    }

    $scope.openAside = function (consumptionmethod, editing, adding) {
        var _$scope = $scope;
        $aside.open({
            templateUrl: 'asideContent.html',
            placement: 'right',
            size: 'md',
            backdrop: true,
            controller: function ($scope, $modalInstance) {
                var __$scope = _$scope;

                $scope.imageHost = _$scope.imageHost;

                $scope.editing = editing ? true : false;
                $scope.adding = adding ? true : false;
                $scope.edit = function (e) {
                    $scope.editing = true;
                    setTimeout(function () {
                        $scope.consumptionmethodform.$show()
                    }, 300);
                }

                $scope.add = function (e) {
                    var data = $scope.consumptionmethod;
                    for (var key in $scope.consumptionmethodform.$data) {
                        data[key] = $scope.consumptionmethodform.$data[key];
                    };
                    
                    var url = ''
                        + api.host
                        + api.consumptionmethods.url;

                    var req = {
                        url: url,
                        method: 'POST',
                        data: JSON.stringify(data),
                        success: function () { console.log('success'); }
                    };


                    $.ajax(req)
                        .done(function () {
                            $scope.$apply();
                            __$scope.fetch(__$scope);
                            __$scope.$apply();
                        })

                    $modalInstance.close();
                    e.stopPropagation();
                    $scope.editing = false;
                };

                $scope.refresh = function (e) {
                    var data = $scope.consumptionmethod;
                    for (var key in $scope.consumptionmethodform.$data) {
                        data[key] = $scope.consumptionmethodform.$data[key];
                    };
 
                    var url = ''
                        + api.host
                        + api.consumptionmethods.url
                        + '/'
                        + data.id;

                    var req = {
                        url: url,
                        method: 'PUT',
                        data: JSON.stringify(data),
                        success: function () { console.log('success'); }
                    };


                    $.ajax(req)
                        .done(function () {
                            $scope.$apply();
                            __$scope.fetch(__$scope);
                            __$scope.$apply();
                        })
                        .error(function () {
                            console.log('error');
                        });

                    $modalInstance.close();
                    e.stopPropagation();
                    $scope.editing = false;
                };

                $scope.save = function (e) {

                    $scope.isNew = false;

                    if (!$scope.consumptionmethod.name) {
                        return;
                    }

                    $scope.consumptionmethod.image = $scope.croppedImage.slice($scope.croppedImage.indexOf('base64,') + 7);

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
                $scope.consumptionmethod = consumptionmethod;

                if ($scope.consumptionmethod.id) {
                    $.get(api.host + '/api/consumptionMethods/' + $scope.consumptionmethod.id)
                        .done(function (response) {

                            var handleFileSelect = function (evt) {
                                var file = evt.currentTarget.files[0];
                                var reader = new FileReader();
                                reader.onload = function (evt) {
                                    $scope.$apply(function ($scope) {
                                        $scope.sourceImage = evt.target.result;
                                        $scope.showCrop = true;
                                    });
                                };
                                reader.readAsDataURL(file);
                            };
                            angular.element(document.querySelector('#fileInput')).on('change', handleFileSelect);

                            $scope.noImage = false;
                            $scope.consumptionmethod = response;

                            $scope.convertImgToBase64URL($scope.imageHost + '/api/consumptionMethods/' + consumptionmethod.id + '/image', function (base64Img) {
                                if (base64Img) {
                                    $scope.consumptionmethod.image = base64Img.slice(base64Img.indexOf('base64,') + 7);;
                                    $scope.croppedImage = base64Img;
                                }
                                else {
                                    $scope.croppedImage = '';
                                }

                                $scope.$apply();
                            });
                        })
                        .error(function (e) {
                            if (e.status == '200') {
                                $scope.noImage = false;
                            } else {
                                $scope.noImage = true;
                            }
                        })
                }
                else {
                    $scope.isNew = true;

                    setTimeout(function () {
                        var handleFileSelect = function (evt) {
                            var file = evt.currentTarget.files[0];
                            var reader = new FileReader();
                            reader.onload = function (evt) {
                                $scope.$apply(function ($scope) {
                                    $scope.sourceImage = evt.target.result;
                                    $scope.showCrop = true;
                                });
                            };
                            reader.readAsDataURL(file);
                        };
                        angular.element(document.querySelector('#fileInput')).on('change', handleFileSelect);
                    }, 400);
                }

                $scope.removeImage = function () {
                    $scope.noImage = true;
                    $scope.consumptionmethod.image = '';
                };

                $scope.sourceImage = '';
                $scope.croppedImage = '';

                $scope.convertImgToBase64URL = function (url, callback, outputFormat) {
                    var img = new Image();
                    img.crossOrigin = 'Anonymous';
                    img.onload = function(){
                        var canvas = document.createElement('CANVAS'),
                        ctx = canvas.getContext('2d'), dataURL;
                        canvas.height = this.height;
                        canvas.width = this.width;
                        ctx.drawImage(this, 0, 0);
                        dataURL = canvas.toDataURL(outputFormat);
                        callback(dataURL);
                        canvas = null; 
                    };
                    img.src = url;
                }

                $scope.obj = new Flow();
                $scope.fa = function (e) {
                    var fileReader = new FileReader();
                    fileReader.onload = function (event) {
                        var uri = event.target.result;
                        var base64 = uri.slice(uri.indexOf('base64,') + 7);
                        $scope.consumptionmethod.image = base64;
                    };
                    if (e[0].file.size > 600 * 1024) {
                        sweetAlert("Oops...", "File is too large");
                        return false;
                    }
                    else {
                        fileReader.readAsDataURL(e[0].file);
                    }
                    
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
                                + api.consumptionmethods.url
                                + '/'
                                + consumptionmethod.id;
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
