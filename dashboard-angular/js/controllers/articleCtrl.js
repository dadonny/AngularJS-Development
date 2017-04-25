'use strict';
/** 
  * controller for Messages
*/
app.controller('ArticlesCtrl', ["$scope", "$state", "$http", "API", "$aside", "SweetAlert", "ngTableParams", "$location", function ($scope, $state, $http, api, $aside, SweetAlert, ngTableParams, $location) {

    $scope.imageHost = api.imageHost;

    $scope.getLogo = function (id) {

        var url = api.host + api.articles.url
            + '/'
            + id
            + '/logo';
        return url;
    }
 
    $scope.updateData = function ($defer, params) {
        var url = api.host + api.articles.url;
 
        if ($defer) {
            $scope.$defer = $defer;
        }

        if (params) {
            $scope.params = params;
        }

        if (!$defer) {
            $defer = $scope.$defer;
        }

        if (!$defer) {
            $scope.$apply(); 
            return;
        }

        if (!params) {
            params = $scope.params;
        }
         
        $.ajax({
            success: function (response, textStatus, request) {
                //$scope.totalItems = request.getResponseHeader('X-Total-Count');
                
                $.each(response, function (index, article) {
                    article.logoWidthMin = article.logoWidth;
                    article.logoHeightMin = article.logoHeight;

                    if (article.logoWidthMin > 150) {
                        article.logoWidthMin = 150;

                        article.logoHeightMin = (article.logoWidthMin * 1.0 / article.logoWidth) * article.logoHeight;
                    }

                    if (article.logoHeightMin > 100) {
                        article.logoHeightMin = 100;

                        article.logoWidthMin = (article.logoHeightMin * 1.0 / article.logoHeight) * article.logoWidth;
                    }

                });

                $scope.articles = response;
                $scope.totalItems = $scope.articles.length;
                params.total($scope.articles.length);
                $scope.tableParams.total($scope.articles.length);
                //$defer.resolve(response);
                $scope.$apply();
                
            },
            type: 'get',
            url: api.host + api.articles.url ,
        });
    };

    $scope.tableParams = new ngTableParams(
        {}, {
            total: $scope.totalItems, // length of data
            getData: function ($defer, params) {
                //$location.search(params.url());
                $scope.updateData($defer, params);
            }
        });

    $scope.showGrade = function () {
        var selected = $filter('filter')($scope.grades, { value: $scope.grade });
        return ($scope.grade && selected.length) ? selected[0].text : 'Not set';
    };

    $scope.getNewArticle = function () {
        return {
            "sourceUrl": "",
            "summary": "",
            "keyTakeaways": [

            ],
            "logo": "",
            "ailments": [

            ],
            "id": 0,
            "title": "",
            "publicationDate": null
        }
    };


    $scope.edit = function ($event, article) {
        $scope.openAside(article);
    };

    $scope.addArticle = function ($event) {
        var newArticle = $scope.getNewArticle();
        $scope.openAside(newArticle)
    }

    $scope.openAside = function (article) {
        var _$scope = $scope;
        $aside.open({
            templateUrl: 'asideContent.html',
            placement: 'right',
            size: 'md',
            backdrop: true,
            controller: function ($scope, $modalInstance) {
                var __$scope = _$scope;

                $scope.imageHost = _$scope.imageHost; 
                $.get(api.host + api.ailments.url)
                    .done(function (data, status, headers, config) {
                        $scope.ailments = data;

                        $scope.ailment = {
                            id: data[0].id,
                            name: data[0].name
                        }

                        $scope.$apply();
                    });
 
                $scope.removeImage = function () {
                    $scope.noImage = true;
                    $scope.article.image = '';
                };

                $scope.fa = function (e) {
                    var fileReader = new FileReader();
                    fileReader.onload = function (event) {
                        var uri = event.target.result;
                        var base64 = uri.slice(uri.indexOf('base64,') + 7);
                        $scope.article.image = base64;
                    };
                    if (e[0].file.size > 600 * 1024) {
                        sweetAlert("Oops...", "File is too large");
                        return false;
                    }
                    else {
                        fileReader.readAsDataURL(e[0].file);
                    }

                }

                $scope.add = function (e) {
                    var data = article;
                    for (var key in $scope.articleform.$data) {
                        data[key] = $scope.articleform.$data[key];
                    };


                    var req = {
                        url: ''
                            + api.host
                            + api.articles.url ,
                        method: 'POST',
                        data: JSON.stringify(data)
                    };
                   
                    $.ajax(req).success(function () {

                        __$scope.updateData();
                     
                    }); 
                   
                    $modalInstance.close();
                    e.stopPropagation();
                };

                $scope.refresh = function (e) {
                    var data = $scope.article;
                    for (var key in $scope.articleform.$data) {
                        data[key] = $scope.articleform.$data[key];
                    };

                    var req = {
                        url: ''
                            + api.host
                            + api.articles.url
                            + '/'
                            + data.id,
                        method: 'PUT',
                        data: JSON.stringify(data)
                    };

                    $.ajax(req).success(function () {
                        __$scope.updateData();
                    });
                    $modalInstance.close();
                    e.stopPropagation();
                };

                $scope.save = function (e) {
                    $scope.isNew = false;
                    //alert(__$scope.refreshCount);
                    if (!$scope.article.sourceUrl || 
                        !$scope.article.title ||
                        !$scope.article.publicationDate) {
                        return;
                    }
                     
                    if ($scope.croppedImage && $scope.croppedImage.length > 600 * 1024) {
                        sweetAlert("Oops...", "File is too large");
                        return;
                    }

                    //$scope.article.logo = $scope.croppedImage.slice($scope.croppedImage.indexOf('base64,') + 7);
  
                    $scope.article.keyTakeaways = []; 

                    for(var i = 0; i < $scope.selectedKeyTakeaways.length; i++) {
                            
                        $scope.article.keyTakeaways.push($scope.selectedKeyTakeaways[i].label);
                    } 

                    if (!$scope.article.id) {
                        $scope.add(e);
                    } else {
                        $scope.refresh(e);
                    }
                };
                $scope.cancel = function (e) {
                    $modalInstance.dismiss();
                    e.stopPropagation();
                };
 
                $scope.article = article;

                if (article.id) {
                    $.ajax({
                        success: function (response) {

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

                            $scope.article = response;
                            $scope.noImage = false;

                            $scope.croppedImage = 'data:image/png;base64,' + $scope.article.logo;
                            
                            $scope.selectedKeyTakeaways = [];

                            for(var i = 0; i < $scope.article.keyTakeaways.length; i++) {
                            
                                $scope.selectedKeyTakeaways.push({ label : $scope.article.keyTakeaways[i] });
                            } 

                            $scope.$apply();
                        },
                        type: 'get',
                        url: api.host + api.articles.url + '/' + article.id
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

                            $scope.$apply();
                        };
                        angular.element(document.querySelector('#fileInput')).on('change', handleFileSelect);
                    }, 400);
                }


                $scope.saveCrop = function () {

                    $scope.article.logoWidth = $scope.myCroppedImageW;
                    $scope.article.logoHeight = $scope.myCroppedImageH;

                    $scope.article.logo = $scope.croppedImage.slice($scope.croppedImage.indexOf('base64,') + 7);
                    $scope.showCrop = false;
                }

                $scope.selectedAilmets = [];

                $scope.addAilment = function (ailment) {

                    var arr = jQuery.grep($scope.article.ailments, function (element, index) {
                        return element.id == ailment.id;
                    });

                    if (arr.length > 0) {
                        return;
                    }

                    $scope.article.ailments.push({ id: ailment.id, name: ailment.name });
                }

                $scope.removeAilment = function (ailment) {

                    $scope.article.ailments.splice($scope.article.ailments.indexOf(ailment), 1);
                }

                $scope.selectedKeyTakeaways = [];

                $scope.addKey = function (key) {

                    if (!key) {
                        return;
                    }

                    var arr = jQuery.grep($scope.selectedKeyTakeaways, function (element, index) {
                        return element == key;
                    });

                    if (arr.length > 0) {
                        return;
                    }

                    $scope.selectedKeyTakeaways.push({ label: $scope.keyTakeaway });
                    $scope.keyTakeaway = "";
                }

                $scope.removeKey = function (key) {

                    $scope.selectedKeyTakeaways.splice($scope.selectedKeyTakeaways.indexOf(key), 1);
                }


                // Model to JSON for demo purpose
                $scope.$watch('models', function (model) {
                    $scope.modelAsJson = angular.toJson(model, true);
                }, true);



                $scope.sourceImage = '';
                $scope.croppedImage = '';

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
                                + api.articles.url
                                + '/'
                                + article.id;
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

                $scope.today = function () {
                    $scope.article.publicationDate = new Date();
                };

                $scope.clear = function () {
                    $scope.article.publicationDate = null;
                };


                $scope.open = function ($event) {
                    $event.preventDefault();
                    $event.stopPropagation();

                    $scope.opened = !$scope.opened;
                };

                $scope.format = {
                    format : 'MM/dd/yyyy',
                    popupMode: 'day',
                    options: {  minMode: 'day' }
                };


                
            }
        });
    };



}]);