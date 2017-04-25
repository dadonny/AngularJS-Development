'use strict';
/** 
  * controller for Messages
*/
app.controller('StrainsCtrl', ["$scope", "flowFactory", "$state", "$http", "API", "$aside", "SweetAlert", "ngTableParams", "$location", function ($scope, flowFactory,$state, $http, api, $aside, SweetAlert, ngTableParams, $location) {

    $scope.getImage = function (id) {
        var url = api.host + api.strains.url
            + '/'
            + id
            + '/image';
        return url
    };

    $scope.imageHost = api.imageHost;

    $scope.updateData = function ($defer, params) {
        var url = api.host + api.strains.url;

        if ($defer) {
            $scope.$defer = $defer;
        }

        if (params) {
            $scope.params = params;
        }

        if (!$defer) {
            $defer = $scope.$defer;
        }

        if (!params) {
            params = $scope.params;
        }

        var filter = "";

        if ($scope.commonFilter) {
            filter = "&commonFilter=" + $scope.commonFilter;
        }

        var offset = params.url().page - 1;
        offset = offset * params.url().count;
        $.ajax({
            success: function (response, textStatus, request) {
                $scope.totalItems = request.getResponseHeader('X-Total-Count');
                params.total($scope.totalItems);
                $scope.strains = response;
                $defer.resolve(response);
                $scope.$apply();
            },
            type: 'get',
            url: api.host + api.strains.url + '?limit=' + params.url().count + '&offset=' + offset + filter,
        });
    };

    $scope.tableParams = new ngTableParams(
        angular.extend({
            page: 1, // show first page
            count: 10 // count per page
        }, $location.search()), {
            total: $scope.totalItems, // length of data
            getData: function ($defer, params) {
                $location.search(params.url());
                $scope.updateData($defer, params);
            }
        });

    $scope.showGrade = function () {
        var selected = $filter('filter')($scope.grades, { value: $scope.grade });
        return ($scope.grade && selected.length) ? selected[0].text : 'Not set';
    };

    $scope.getNewStrain = function () {
        return {
            "potency": "",
            "taste": "",
            "cbdFrom": 0,
            "cbnFrom": 0,
            "flowering": "",
            "medicalAttributes": "",
            "type": "",
            "smell": "",
            "thcvFrom": 0,
            "thcvTo": 0,
            "origins": "",
            "thcTo": 0,
            "cbcTo": 0,
            "image": "",
            "cbdTo": 0,
            "new": false,
            "harvest": "",
            "cbgFrom": 0,
            "cbgTo": 0,
            "thcFrom": 0,
            "cbnTo": 0,
            "look": "",
            "effects": "",
            "background": "",
            "cbcFrom": 0,
            "grade": "",
            "name": ""
        }
    };


    $scope.edit = function ($event, strain) {
        $scope.openAside(strain);
    };

    $scope.addStrain = function () {
        var newStrain = $scope.getNewStrain();
        $scope.openAside(newStrain, true, true)
    }

    $scope.openAside = function (strain, editing, adding) {
        var _$scope = $scope;
        $aside.open({
            templateUrl: 'asideContent.html',
            placement: 'right',
            size: 'md',
            backdrop: true,
            controller: function ($scope, $modalInstance) {
                var __$scope = _$scope;

                $scope.getImage = __$scope.getImage;
                $scope.imageHost = _$scope.imageHost;
                $scope.editing = editing ? true : false;
                $scope.adding = adding ? true : false;

                $scope.edit = function (e) {
                    $scope.editing = true;
                    setTimeout(function () {
                        $scope.strainform.$show()
                    }, 300);
                }
                $scope.add = function (e) {
                    var data = strain;
                    for (var key in $scope.strainform.$data) {
                        data[key] = $scope.strainform.$data[key];
                    };

                    data.thcTo = data.thcFrom;
                    data.cbdTo = data.cbdFrom;
                    data.cbnTo = data.cbnFrom;
                    data.cbcTo = data.cbcFrom;
                    data.thcvTo = data.thcvFrom;
                    data.cbgTo = data.cbgFrom;
                    data.thcTo = data.thcFrom;
                    data.thcTo = data.thcFrom;



                    var url = ''
                        + api.host
                        + api.strains.url;

                    $.post(url, JSON.stringify(data))
                        .success(function () {
                            console.log('success');
                        })
                        .error(function () {
                            console.log('error');
                        });

                    $modalInstance.close();
                    if(e){e.stopPropagation();}
                    $scope.editing = false;
                };

                $scope.removeImage = function () {
                    $scope.noImage = true;
                    $scope.strain.image = '';
                };

                $scope.fa = function (e) {
                    var fileReader = new FileReader();
                    fileReader.onload = function (event) {
                        var uri = event.target.result;
                        var base64 = uri.slice(uri.indexOf('base64,') + 7);
                        $scope.strain.image = base64;
                    };
                    if (e[0].file.size > 600 * 1024) {
                        sweetAlert("Oops...", "File is too large");
                        return false;
                    }
                    else {
                        fileReader.readAsDataURL(e[0].file);
                    }

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
                        url: api.host + api.strains.url + "/" + $scope.strain.id + "/compatibleAilments?cannabisExperience=" + $scope.cannabisExperience.id,
                    })
                }

                $scope.refresh = function (e) {
                    var data = $scope.strain;

                    data.thcTo = data.thcFrom;
                    data.cbdTo = data.cbdFrom;
                    data.cbnTo = data.cbnFrom;
                    data.cbcTo = data.cbcFrom;
                    data.thcvTo = data.thcvFrom;
                    data.cbgTo = data.cbgFrom;
                    data.thcTo = data.thcFrom;
                    data.thcTo = data.thcFrom;


                    var req = {
                        url: ''
                            + api.host
                            + api.strains.url
                            + '/'
                            + data.id,
                        method: 'PUT',
                        data: JSON.stringify(data)
                    };

                    $.ajax(req).success(function () {
                        __$scope.updateData();
                    });
                    $modalInstance.close();
                    if(e){e.stopPropagation();}
                    $scope.editing = false;
                };

                $scope.save = function (e) {
                    $scope.isNew = false;

                    if (!$scope.strain.name) {
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

                $scope.obj = new Flow();

                $scope.convertImgToBase64URL = function (url, callback, outputFormat) {
                    var img = new Image();
                    img.crossOrigin = 'Anonymous';
                    img.src = url;
                    img.onload = function () {
                        var canvas = document.createElement('CANVAS'),
                        ctx = canvas.getContext('2d'), dataURL;
                        canvas.height = this.height;
                        canvas.width = this.width;
                        ctx.drawImage(this, 0, 0);
                        dataURL = canvas.toDataURL(outputFormat);
                        callback(dataURL);
                        canvas = null;
                    }; 
                }

                $scope.strain = strain;

                $scope.saveImage = function(){


                    //if ($scope.image) {
                    //    console.log('saving low res')
                    //    $scope.strain.image = $scope.image.slice($scope.image.indexOf('base64,') + 7);
                    //    //$scope.strain.originalImage = $scope.sourceImage.slice($scope.sourceImage.indexOf('base64,') + 7);
					//
                    //}
                    //if($scope.new_hires){
                    //    console.log('saving new hires');
                    //    $scope.strain.originalImage = $scope.new_hires.slice($scope.new_hires.indexOf('base64,') + 7);
                    //}
                    //else if ($scope.image_hires) {
                    //    console.log('saving old hires');
                    //    $scope.strain.originalImage = $scope.image_hires.slice($scope.image_hires.indexOf('base64,') + 7);
                    //}

                    $scope.strain.image = $scope.image.slice($scope.image.indexOf('base64,') + 7);
                    if( !$scope.isNew) {
                        var data = $scope.strain.image;
                        var req = {
                            url: ''
                            + api.host
                            + api.strains.url
                            + '/'
                            + $scope.strain.id
                            + '/image',
                            method: 'PUT',
                            data: data
                        };

                        $.ajax(req)
                            .success(function () {
                                console.log('success');
                                __$scope.updateData();
                            })
                            .error(function () {
                                console.log('error');
                            });
                    }
                };

                $scope.saveHiResImage = function(){
                    $scope.strain.originalImage = $scope.new_hires.slice($scope.new_hires.indexOf('base64,') + 7);

                    if( !$scope.isNew) {
                        var data = $scope.strain.originalImage;
                        var req = {
                            url: ''
                            + api.host
                            + api.strains.url
                            + '/'
                            + $scope.strain.id
                            + '/originalImage',
                            method: 'PUT',
                            data: data
                        };

                        $.ajax(req)
                            .success(function () {
                                console.log('success');
                                //__$scope.updateData();
                            })
                            .error(function () {
                                console.log('error');
                            });
                    }

                }

                $scope.sourceImage = '';
                $scope.croppedImage = '';
                $scope.sourceImage_hires = '';
                $scope.croppedImage_hires = '';

                $scope.showCrop = false;
                if (strain.id) {
                    $.ajax({
                        success: function (response) {

                            var handleFileSelect = function (evt) {
                                var file = evt.currentTarget.files[0];
                                var reader = new FileReader();
                                reader.onload = function (evt) {
                                    $scope.sourceImage = evt.target.result;
                                    $scope.showCrop = true;

                                    $scope.$apply();
                                };
                                reader.readAsDataURL(file);
                            };
                            var handleFileSelect_hires = function (evt) {
                                console.log('!!! hi res file ',evt);
                                var file = evt.currentTarget.files[0];
                                var reader = new FileReader();
                                reader.onload = function (evt) {
                                    console.log('!!! onload ',evt);
                                    //$scope.sourceImage_hires = evt.target.result;
                                    $scope.new_hires = evt.target.result;
                                    //$scope.showCrop_hires = true;

                                    $scope.$apply();
                                };
                                reader.readAsDataURL(file);
                            };
                            angular.element(document.querySelector('#fileInput')).on('change', handleFileSelect);
                            angular.element(document.querySelector('#fileInput_hires')).on('change', handleFileSelect_hires);

                            $scope.noImage = false;
                            $scope.strain = response;

                            $scope.convertImgToBase64URL($scope.imageHost + '/api/strains/' + strain.id + '/image', function (base64Img) {
                                if (base64Img) {
                                    $scope.strain.image = base64Img.slice(base64Img.indexOf('base64,') + 7);
                                    $scope.image = base64Img;
                                    //$scope.croppedImage = $scope.croppedImage2;
                                }
                                else {
                                    $scope.croppedImage = '';
                                }

                                $scope.$apply();
                            });
                            $scope.convertImgToBase64URL($scope.imageHost + '/api/strains/' + strain.id + '/originalImage', function (base64Img) {
                                if (base64Img) {
                                    $scope.strain.originalImage = base64Img.slice(base64Img.indexOf('base64,') + 7);
                                    $scope.image_hires = base64Img;
                                    //$scope.croppedImage = $scope.croppedImage2;
                                }
                                else {
                                    $scope.croppedImage_hires = '';
                                }

                                $scope.$apply();
                            });
                            $scope.$apply();
                        },
                        type: 'get',
                        url: api.host + api.strains.url + '/' + strain.id
                    });
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
                        var handleFileSelect_hires = function (evt) {
                            var file = evt.currentTarget.files[0];
                            var reader = new FileReader();
                            reader.onload = function (evt) {
                                $scope.$apply(function ($scope) {
                                    $scope.new_hires = evt.target.result;
                                });
                            };
                            reader.readAsDataURL(file);
                        };
                        angular.element(document.querySelector('#fileInput')).on('change', handleFileSelect);
                        angular.element(document.querySelector('#fileInput_hires')).on('change', handleFileSelect_hires);
                    }, 400);
                }

                $scope.applyCrop = function () {
                    console.log('apply lowres');
                    var image = $("#croppedImage").attr("src"); 
                    $scope.image = image;
                    $scope.showCrop = false;

                    $scope.saveImage()


                }

                $scope.applyCrop_hires = function () {
                    console.log('apply hires');
                    //var image = $("#croppedImage_hires").attr("src");
                    $scope.image_hires = $scope.new_hires;

                    $scope.saveHiResImage();
                    $scope.new_hires = null;


                }

                $scope.clearHiRes = function(){
                    $scope.new_hires=null;
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
                                + api.strains.url
                                + '/'
                                + strain.id;
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

                $scope.types = [{ name: "Indica", value: "INDICA" },
                    { name: "Indica Dominant", value: "INDICA_DOMINANT" },
                    { name: "Sativa", value: "SATIVA" },
                    { name: "Sativa Dominant", value: "SATIVA_DOMINANT" },
                    { name: "Hybrid", value: "HYBRID" }];
            }
        });
    };
}]);