'use strict';
/** 
  * controller for Messages
*/
app.directive('datepickerPopup', function (dateFilter, datepickerPopupConfig) {
    return {
        restrict: 'A',
        priority: 1,
        require: 'ngModel',
        link: function (scope, element, attr, ngModel) {
            var dateFormat = attr.datepickerPopup || datepickerPopupConfig.datepickerPopup;
            ngModel.$formatters.push(function (value) {
                return dateFilter(value, dateFormat);
            });
        }
    };
}).directive('bootstrapSwitch', [
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
]).controller('StatisticsCtrl', ["$scope", "$state", "$http", "API", "$aside", "SweetAlert", "ngTableParams", "$location", function ($scope, $state, $http, api, $aside, SweetAlert, ngTableParams, $location) {

    $scope.getDateByDefaultFormat = function (date, defaultInView) {

        var month = date.getMonth() + 1 + '';

        if (month.length < 2) {
            month = '0' + '' + month;
        }

        var day = date.getDate() + '';

        if (day.length < 2) {
            day = '0' + '' + day;
        }

        if (!defaultInView) {
            return month + '' + day + '' + date.getFullYear();
        }
        else {
            return month + '/' + day + '/' + date.getFullYear();
        }
    }

    $scope.status = {};
    $scope.status.opened = false;
    $scope.status.open2 = true;
    $scope.chartsListVisible=false;
    $scope.tableDataSet = [];
    $scope.tableParams = new ngTableParams({
        // initial sort order
        count:10,
        sorting: { name: "asc" }
    }, {
        counts:[],
        getData: function($defer, params){
            var sortBy = _.keys(params.sorting())[0];
            var desc = _.values(params.sorting())[0]=='desc';
            var sorted = _.sortBy($scope.tableDataSet, function(o) {
                return o[sortBy];
            });
            var data = desc?sorted.reverse():sorted;
            var count= params.count();
            params.total(data.length);
            var start = (params.page()-1)*count;
            var end = params.page()*count;
            var trimed = data.slice(start,end)
            $defer.resolve(trimed);
        }
    });

    $scope.filterObjDefault = {
        ageFrom:0,
        ageTo:120,
        weightFrom:0,
        weightTo:300,
        cannabisExperience:'',
        usStates:'',
        ailments:'',
        gender:''
    };

    $scope.stReviewSideEffectPercent = true;


    $scope.dataChanged = function(){
        console.log('>',$scope.filterObj.toDate);
        console.log('>',$scope.filterObj.fromDate);


        if($scope.filterObj.toDate && $scope.filterObj.toDate.length!=10){
            $scope.filterObj.toDate = convertDate($scope.filterObj.toDate).join('/');
        }
        if($scope.filterObj.fromDate && $scope.filterObj.fromDate.length!=10){
            $scope.filterObj.fromDate = convertDate($scope.filterObj.fromDate).join('/');
        }
        getChartData();
    };
    $scope.setCurrentDates = function(days,shouldrefresh){
        var to  = getCurrentDate(1);
        var from  = getCurrentDate(1+days);
        $scope.filterObj.toDate = to.join('/');
        $scope.filterObj.fromDate = from.join('/');
        if(shouldrefresh){getChartData()}
    };


    function renderFilterDisplay(){
        _.each($scope.filters,function(filter){
            var notChanged = _.every(filter.fields,function(item){
                return ($scope.filterObj[item]===$scope.filterObjDefault[item]) || (_.isArray($scope.filterObj[item])&&$scope.filterObj[item].length<=0);
            });
            console.log(filter.id,notChanged);
            if(notChanged){
                filter.display = 'None';
            }else{
                filter.display = _.reduce(filter.fields,function(total, item){
                    if(filter.list){
                        var label;
                        console.log('typeof $scope.filterObj[item]',typeof $scope.filterObj[item], item)
                        if(_.isArray($scope.filterObj[item])){
                            if(filter.id=='usstates'){
                                label = _.map($scope.filterObj[item],function(code){
                                   return  _.find(filter.list,{code:code}).name;
                                });
                            }else if(filter.id=='sideEffect'){
                                label = _.map($scope.filterObj[item],function(id){
                                    return  _.find(filter.list,{name:id}).name;
                                });
                            }else{
                                label = _.map($scope.filterObj[item],function(id){
                                    return  _.find(filter.list,{id:id}).name;
                                });
                            }
                        }else{
                            label = _.find(filter.list,{id:$scope.filterObj[item]}).name;
                        }

                        return (total==='')?label:(total+'-'+label);
                    }else{
                        console.log('not list')
                        return (total==='')?$scope.filterObj[item]:(total+'-'+$scope.filterObj[item]);
                    }

                },'')

            }
        });
    }

    function convertDate(now){
        var day = String(now.getDate());
        if(day.length<=1){day = '0'+day}

        var mon = String(+now.getMonth()+1);
        if(mon.length<=1){mon = '0'+mon}

        var year = String(now.getFullYear());

        return [mon,day,year];
    }
    function getCurrentDate(days){
        var now = new Date(new Date().getTime()-days*24*60*60*1000);
        return convertDate(now)
    }

    $scope.resetFilter = function(shouldrefresh){
        $scope.filterObj = _.cloneDeep($scope.filterObjDefault);
        $scope.setCurrentDates(7,shouldrefresh);
    };


    $scope.resetFields = function(filter){
        _.each(filter.fields,function(item){
            $scope.filterObj[item] = $scope.filterObjDefault[item];
        });
        if(filter.list){
            _.each(filter.list,function(item){
                item.selected = false;
            })
        }
        renderFilterDisplay();
    };

    $scope.selectChart = function(chart){
        $('#statChartCont').empty();
        $scope.tableDataSet = [];
        $scope.tableParams.page(1);
        $scope.tableParams.sorting({ name: "asc" });
        $scope.currentChart=chart;
        $scope.chartsListVisible=false;
        getChartData();
    };

    $scope.togglePopdrop =  function(){
        console.log('toggle pop drop');
        $scope.chartsListVisible=!$scope.chartsListVisible
    };

    $scope.addFilter = function(filter){
        console.log(filter);
        filter.selected = !filter.selected;
    };

    $scope.openFiltersPad = function(){
        $scope.filtersPadOpened = !$scope.filtersPadOpened;
    };


    $scope.openFilter = function(filter){
        var newScope = $scope.$new();
        newScope.filter=filter;
        newScope.resetFields = $scope.resetFields;
        newScope.filterObj = $scope.filterObj;
        newScope.onClose = function(){
            getChartData();
        };
        $aside.open({
            scope:newScope,
            templateUrl: 'assets/views/filter_aside.html',
            placement: 'right',
            size: 'md',
            backdrop: true,
            controller: 'FilterAsideCtrl'
        });
    };
    $scope.clearAllFilters = function(){
        _.each($scope.filters,function(filter){
            $scope.resetFields(filter);
            if(filter.list){
                _.each(filter.list,function(item){
                    item.selected = false;
                })
            };
        });
        renderFilterDisplay();
        getChartData();
    };

    function getChartData(){

        renderFilterDisplay();
        var obj = _.cloneDeep($scope.filterObj);
        console.log('obj.toDate',obj.toDate)
        console.log('obj.fromDate',obj.fromDate)


        if(obj.toDate) obj.toDate      = obj.toDate.split('/').join('');
        if(obj.fromDate) obj.fromDate    = obj.fromDate.split('/').join('');
        _.map(obj,function(item, key){
            if(_.isArray(item)){
                obj[key] = item.join(',')
            }else{
                //return item;
            }
        });
        $.ajax({
            url: 'http://90f3e7f1.ngrok.io/api/analytics/profiles',
            //url: 'http://localhost:8080/api/analytics/profiles',
            //url: 'https://dev.potbot-beta.com/api/analytics/profiles',
            //url: 'https://www.potbot-beta.com/api/analytics/profiles',
            //url: 'http://potbot-api.elasticbeanstalk.com:80/api/analytics/profiles',
            type: 'GET',
            data: _.extend({type:$scope.currentChart.id},obj)
        }).done(function (response) {
            console.log('CHART DATA',response);
            renderChart(response,$scope.currentChart.type);
        });
    }


    function renderChart(data,chart_id){
        $scope.chartData = data;
        $('#statChartCont').empty();

        switch(chart_id){
            case 'pie':
		        renderPie(data);
                break;
            case 'scatter':
                renderScatter(data);
                break;
            case 'map':
                renderMap(data);
                break;
            case 'table':
                renderTable(data);
                break;
            case 'bar':
                renderBar(data);
                break;
            case 'table_streview':
                renderTableStReview(data, 'beforeAfter');
                break;
            case 'table_streview_sideeffect':
                renderTableStReview(data, 'sideEffect');
                break;
            case 'table_streview_rating':
                renderTableStReview(data, 'rating');
                break;
            default:
                console.error('Wrong chart type', chart_id);
                break;
        }
    }



    var now = new Date();
    var charts = ['age', 'ailments', 'requestsPerDays', 'sex', 'weight'];
    $scope.charts = [
        {label:'Cannabis Experience',           id:'1',         type:'pie'},
        {label:'Gender',                        id:'2',         type:'pie'},
        {label:'Strain Type',                   id:'3',         type:'pie'},
        {label:'Individual Ages',               id:'4',         type:'scatter'},
        {label:'Individual Weight',             id:'5',         type:'scatter'},
        {label:'US States (table)',             id:'6',         type:'table'},
        {label:'US States (map)',               id:'6',         type:'map'},
        {label:'Ailments (table)',              id:'7',         type:'table'},
        {label:'Ailments (bars)',               id:'7',         type:'bar'},
        {label:'Favorited Strains (bars)',      id:'8',         type:'bar'},
        {label:'Favorited Strains (table)',     id:'8',         type:'table'},
        {label:'Research Articles',             id:'9',         type:'table'},
        {label:'Strain Review (Change in Relief)',                 id:'11',         type:'table_streview'},
        {label:'Strain Review (Side Effect)',                 id:'12',         type:'table_streview_sideeffect'},
        {label:'Strain Review (Rating)',                 id:'13',         type:'table_streview_rating'}
        ];
    $scope.filters = [
        {label:'Age', id:'age',fields:['ageFrom','ageTo']},
        {label:'Gender', id:'gender',fields:['gender'], list:[{id:0,name:'Only female'},{id:1,name:'Only male'}]},
        {label:'Weight', id:'weight',fields:['weightFrom','weightTo']},
        {label:'Ailments', id:'ailments',fields:['ailments']},
        {label:'Cannabis Exp', id:'cannabisExperience',fields:['cannabisExperience'],list:[{id:1,name:'Never'},{id:21,name:'Rarely'},{id:41,name:'Moderate'},{id:61,name:'Often'},{id:81,name:'Daily'}]},
        {label:'US States', id:'usstates',fields:['usStates']},
        {label:'Strain Type', id:'strainType',fields:['strainTypes'], list:[{id:'SATIVA',name:'Sativa'},{id:'INDICA',name:'Indica'},{id:'SATIVA_DOMINANT',name:'Sativa Dominant'},{id:'INDICA_DOMINANT',name:'Indica Dominant'},{id:'HYBRID',name:'Hybrid'}]},
        {label:'Side Effect', id:'sideEffect',fields:['sideEffects'], list:[{id:1,name:'Focused'},{id:2,name:'Distracted'},{id:3,name:'Reflective'},{id:4,name:'Creative'},{id:5,name:'Peaceful'},{id:6,name:'Talkative'},{id:7,name:'Forgetful'},{id:8,name:'Dreamy'},{id:9,name:'Anxious'},{id:10,name:'Paranoid'},{id:11,name:'Energetic'},{id:12,name:'Hungry'},{id:13,name:'Suppressed appetite'},{id:14,name:'Couch-locked'},{id:15,name:'Dizzy'},{id:16,name:'Dry eyes'},{id:17,name:'Dry mouth'},{id:18,name:'Racing Heart'},{id:19,name:'Unstable walking'}]},
    ];
    //SELECT FIRST CHART

    $scope.$watch('status.open1', function (isOpen) {
        if (isOpen) {
            $scope.initChart('requestsPerDays', 'Requests');
        }
    });





    $scope.initChart = function (name) {
        if (!name)
            name = 'requestsPerDays';


        if (!$scope[name].fromDate || !$scope[name].toDate)
            return;

        var data = {
            fromDate: $scope.getDateByDefaultFormat($scope[name].fromDate),
            toDate: $scope.getDateByDefaultFormat($scope[name].toDate)
        };

        var url = api.host + api.statistics[name];

        var type = 'column';

        if (name == 'requestsPerDays') {
            type = 'datetime';
        }

        $.ajax({
            url: url,
            type: 'GET',
            data: data
        }).done(function (response) {
            var chartData = [];
            $.each(response, function (index, value) {
                chartData.push([Date.parse(value.axe), value.count]);
            });

            $('#chart' + name).highcharts({
                chart: {
                    zoomType: 'x'
                },
                title: {
                    text: ''
                },
                xAxis: {
                    type: 'datetime'
                },
                yAxis: {
                    title: {
                        text: 'Requests'
                    }
                },
                legend: {
                    enabled: false
                },
                plotOptions: {
                    area: {
                        fillColor: {
                            linearGradient: {
                                x1: 0,
                                y1: 0,
                                x2: 0,
                                y2: 1
                            },
                            stops: [
                                [0, Highcharts.getOptions().colors[0]],
                                [1, Highcharts.Color(Highcharts.getOptions().colors[0]).setOpacity(0).get('rgba')]
                            ]
                        },
                        marker: {
                            radius: 2
                        },
                        lineWidth: 1,
                        states: {
                            hover: {
                                lineWidth: 1
                            }
                        },
                        threshold: null
                    }
                },

                series: [{
                    type: 'area',
                    name: 'Requests',
                    data: chartData
                }]
            });
        });
    }


    $scope.today = function () {
        $scope.dt = new Date();
    };
    $scope.today();

    $scope.clear = function () {
        $scope.dt = null;
    };

    $scope.dateToChange = function () {
        alert();
    }

    // Disable weekend selection
    $scope.disabled = function (date, mode) {
        return (mode === 'day' && (date.getDay() === 0 || date.getDay() === 6));
    };

    $scope.toggleMin = function () {
        $scope.minDate = $scope.minDate ? null : new Date();
    };
    $scope.toggleMin();

    $scope.open = function ($event, chart, type) {
        $scope[chart][type] = true;
        $event.stopPropagation();
    };

    $scope.dateOptions = {
        formatYear: 'yy',
        startingDay: 1
    };

    $scope.formats = ['dd-MMMM-yyyy', 'yyyy/MM/dd', 'dd.MM.yyyy', 'shortDate'];
    $scope.format = $scope.formats[0];

    var tomorrow = new Date();
    tomorrow.setDate(tomorrow.getDate() + 1);
    var afterTomorrow = new Date();
    afterTomorrow.setDate(tomorrow.getDate() + 2);
    $scope.events =
      [
        {
            date: tomorrow,
            status: 'full'
        },
        {
            date: afterTomorrow,
            status: 'partially'
        }
      ];

    $scope.getDayClass = function (date, mode) {
        if (mode === 'day') {
            var dayToCheck = new Date(date).setHours(0, 0, 0, 0);

            for (var i = 0; i < $scope.events.length; i++) {
                var currentDay = new Date($scope.events[i].date).setHours(0, 0, 0, 0);

                if (dayToCheck === currentDay) {
                    return $scope.events[i].status;
                }
            }
        }

        return '';
    };




    function getAilmentList(){
        $.ajax({
            url: 'http://90f3e7f1.ngrok.io/api/ailments',
            //url: 'http://localhost:8080/api/ailments',
            //url: 'https://dev.potbot-beta.com/api/ailments',
            //url: 'https://www.potbot-beta.com/api/ailments',
            //url: 'http://potbot-api.elasticbeanstalk.com:80/api/ailments',
            type: 'GET'
        }).done(function (response) {
            var f = _.find($scope.filters,{id:'ailments'});
            console.log('F F A',f)
            f.list = _.map(response,function(item){
                return {name:item.name,id:item.id}
            });

            _.map(response,function(item){
                var _col = {title: item.name, id:item.id, field: item.name, visible: true};
                $scope.streviewCols.push(_col);
            });
            $scope.$apply();
        });
    }


    function getStateList(){
        $.ajax({
            url: 'http://90f3e7f1.ngrok.io/api/usStates',
            //url: 'http://localhost:8080/api/usStates',
            //url: 'https://dev.potbot-beta.com/api/usStates',
            //url: 'https://www.potbot-beta.com/api/usStates',
            //url: 'http://potbot-api.elasticbeanstalk.com:80/api/usStates',
            type: 'GET'
        }).done(function (response) {
            var f = _.find($scope.filters,{id:'usstates'});
            console.log('F F ',f);
            f.list = _.map(response,function(item){
                return {name:item.name,code:item.code}
            });
            $scope.$apply();
        });
    }
    getAilmentList();
    getStateList();

    $scope.resetFilter(false);
    $scope.selectChart($scope.charts[1]);


    $.each(charts, function (index, value) {
        $scope[value] = {};
        $scope[value].fromDate = new Date();
        $scope[value].fromDate.setMonth($scope[value].fromDate.getMonth() - 1);

        $scope[value].toDate = new Date();
    });


    //
    //
    //
    //
    //
    //


    function renderPie(data){
        data= _.map(data,function(item, key){
            item.name = key;
            return {name:key,y:+item.value,percent:+item.percent};
        });
        $('#statChartCont').highcharts({
            chart: {
                plotBackgroundColor: null,
                plotBorderWidth: null,
                plotShadow: false,
                type: 'pie'
            },
            title: {
                text: ''
            },
            tooltip: {
                pointFormat: 'Value: <b>{point.y}</b><br>Share: <b>{point.percent:.1f}%</b>'
            },
            plotOptions: {
                pie: {
                    allowPointSelect: true,
                    cursor: 'pointer',
                    dataLabels: {
                        enabled: true,
                        format: '<b>{point.name}</b>: {point.y:.1f} ',
                        style: {
                            color: (Highcharts.theme && Highcharts.theme.contrastTextColor) || 'black'
                        }
                    }
                }
            },
            series: [{
                colorByPoint: true,
                data: data
            }]
        });
    }



    //
    //
    //
    function renderScatter(data){
        data= _.map(data,function(item, key){
            item.name = key;
            return {name:key,x:+key,y:+item.value,percent:+item.percent};
        });
        $('#statChartCont').highcharts({
            chart: {
                type: 'scatter',
                zoomType: 'xy'
            },
            title: {
                text: ''
            },
            subtitle: {
                text: ''
            },
            xAxis: {
                title: {
                    enabled: true,
                    text: ''
                },
                startOnTick: true,
                endOnTick: true,
                showLastLabel: true
            },
            yAxis: {
                title: {
                    text: ''
                },
                tickInterval: 1,
                minRange: 1
            },
            legend: {
                layout: 'vertical',
                align: 'left',
                verticalAlign: 'top',
                x: 100,
                y: 70,
                floating: true,
                backgroundColor: (Highcharts.theme && Highcharts.theme.legendBackgroundColor) || '#FFFFFF',
                borderWidth: 1
            },
            plotOptions: {
                scatter: {
                    marker: {
                        radius: 5,
                        states: {
                            hover: {
                                enabled: true,
                                lineColor: 'rgb(100,100,100)'
                            }
                        }
                    },
                    states: {
                        hover: {
                            marker: {
                                enabled: false
                            }
                        }
                    },
                    tooltip: {
                        headerFormat: '<b>{point.name}</b>',
                        pointFormat: '{point.x} y.o:  {point.y}'
                    }
                }
            },
            series: [{
                showInLegend: false,
                color: 'rgba(223, 83, 83, .5)',
                data: data
            }]
        });
    }

    ///
    //
    ///

    function renderMap(data){
        data= _.map(data,function(item, key){
            item.name = key;
            return {code:key,value:+item.value,percent:+item.percent};
        });
        $('#statChartCont').highcharts('Map', {

            chart : {
                borderWidth : 1
            },

            title : {
                text : ''
            },

            legend: {
                layout: 'horizontal',
                borderWidth: 0,
                backgroundColor: 'rgba(255,255,255,0.85)',
                floating: true,
                verticalAlign: 'top',
                y: 25
            },

            mapNavigation: {
                enabled: true
            },

            colorAxis: {
                min: 1,
                type: 'logarithmic',
                minColor: '#EEEEFF',
                maxColor: '#000022',
                stops: [
                    [0, '#EFEFFF'],
                    [0.67, '#4444FF'],
                    [1, '#000022']
                ]
            },

            series : [{
                showInLegend: false,
                animation: {
                    duration: 1000
                },
                data : data,
                mapData: Highcharts.maps['countries/us/us-all'],
                joinBy: ['postal-code', 'code'],
                dataLabels: {
                    enabled: true,
                    color: '#FFFFFF',
                    format: '{point.code}'
                },
                name: '',
                tooltip: {
                    pointFormat: '{point.code}: {point.value}'
                }
            }]
        });
    }


    ///
    ///
    //
    //
    ///

    function renderBar(data){
        data= _.map(data,function(item, key){
            item.name = key;
            return {name:key,y:+item.value,z:+item.percent};
        });
        $('#statChartCont').highcharts({
            chart: {
                type: 'column'
            },
            title: {
                text: ''
            },
            subtitle: {
                text: ''
            },
            xAxis: {
                type: 'category',
                labels: {
                    rotation: -45,
                    style: {
                        fontSize: '13px',
                        fontFamily: 'Verdana, sans-serif'
                    }
                }
            },
            yAxis: {
                min: 0,
                title: {
                    text: ''
                }
            },
            legend: {
                enabled: false
            },
            tooltip: {
                pointFormat: ' <b>{point.y:.1f}</b>,[{point.z}%]'
            },
            series: [{
                name: 'Population',
                data: data,
                dataLabels: {
                    enabled: true,
                    rotation: -90,
                    color: '#FFFFFF',
                    align: 'right',
                    format: '{point.y:.1f}', // one decimal
                    y: 10, // 10 pixels down from the top
                    style: {
                        fontSize: '13px',
                        fontFamily: 'Verdana, sans-serif'
                    }
                }
            }]
        });
    }


    //
    //
    //
    //
    //

    function renderTable(data) {
        var i = 0;
        data = _.map(data, function (item, key) {
            item.name = key;
            return {id: i++, name: key, value: +item.value, percent: +item.percent};
        });
        $scope.tableDataSet = data;
        $scope.tableParams.reload();
    }

    $scope.streviewColsSideEffect = [
        { title: 'Strain', field: 'strain', visible: true, filter: { 'name': 'text' } },
        { title: 'Focused', field: 'Focused', visible: true },
        { title: 'Distracted', field: 'Distracted', visible: true, filter: { 'name': 'text' } },
        { title: 'Reflective', field: 'Reflective', visible: false, filter: { 'name': 'text' } },
        { title: 'Creative', field: 'Creative', visible: true },
        { title: "Peaceful", field: "Peaceful", visible: true },
        { title: 'Talkative', field: 'Talkative', visible: true },
        { title: 'Forgetful', field: 'Forgetful', visible: true },
        { title: 'Dreamy', field: 'Dreamy', visible: true },
        { title: 'Anxious', field: 'Anxious', visible: true },
        { title: 'Paranoid', field: 'Paranoid', visible: true },
        { title: 'Energetic', field: 'Energetic', visible: true },
        { title: 'Hungry', field: 'Hungry', visible: true },
        { title: 'Suppressed appetite', field: 'Suppressed appetite', visible: true },
        { title: 'Couch-locked', field: 'Couch-locked', visible: true },
        { title: 'Dizzy', field: 'Dizzy', visible: true },
        { title: 'Dry eyes', field: 'Dry eyes', visible: true },
        { title: 'Dry mouth', field: 'Dry mouth', visible: true },
        { title: 'Racing Heart', field: 'Racing Heart', visible: true },
        { title: 'Unstable walking', field: 'Unstable walking', visible: true },
    ];

    $scope.streviewCols = [
        { title: 'Strain', id:0, field: 'strain', visible: true, filter: { 'name': 'text' } },
        ];

    //$scope.streviewCols = [
    //    { title: 'Strain', field: 'strain', visible: true, filter: { 'name': 'text' } },
    //    { title: 'Pain', field: 'Pain', visible: true },
    //    { title: 'ADHD', field: 'ADHD', visible: true, filter: { 'name': 'text' } },
    //    { title: 'Arthritis', field: 'Arthritis', visible: false, filter: { 'name': 'text' } },
    //    { title: 'Anxiety', field: 'Anxiety', visible: true },
    //    { title: "Crohn's Disease", field: "Crohn's Disease", visible: true },
    //    { title: 'Depression', field: 'Depression', visible: true },
    //    { title: 'Digestive Cramps', field: 'Digestive Cramps', visible: true },
    //    { title: 'Seizures', field: 'Seizures', visible: true },
    //    { title: 'Fatigue', field: 'Fatigue', visible: true },
    //    { title: 'Fibromyalgia', field: 'Fibromyalgia', visible: true },
    //    { title: 'Glaucoma', field: 'Glaucoma', visible: true },
    //    { title: 'Headaches', field: 'Headaches', visible: true },
    //    { title: 'Hepatitis C', field: 'Hepatitis C', visible: true },
    //    { title: 'Insomnia', field: 'Insomnia', visible: true },
    //    { title: 'Lupus', field: 'Lupus', visible: true },
    //    { title: 'Migraines', field: 'Migraines', visible: true },
    //    { title: 'Mood Swings', field: 'Mood Swings', visible: true },
    //    { title: 'Multiple Sclerosis (MS)', field: 'Multiple Sclerosis (MS)', visible: true },
    //    { title: 'Muscle Spasms', field: 'Muscle Spasms', visible: true },
    //    { title: 'Obsessive Compulsive Disorder (OCD)', field: 'Obsessive Compulsive Disorder (OCD)', visible: true },
    //    { title: 'Nausea', field: 'Nausea', visible: true },
    //    { title: 'Post Traumatic Stress Disorder (PTSD)', field: 'Post Traumatic Stress Disorder (PTSD)', visible: true },
    //    { title: 'Social Anxiety Disorder (SAD)', field: 'Social Anxiety Disorder (SAD)', visible: true },
    //    { title: 'Wasting Syndrome', field: 'Wasting Syndrome', visible: true },
    //    { title: "Parkinson's Disease", field: "Parkinson's Disease", visible: true },
    //    { title: 'Irritable Bowel Syndrome (IBS)', field: 'Irritable Bowel Syndrome (IBS)', visible: true },
    //    { title: 'Ulcerative Colitis', field: 'Ulcerative Colitis', visible: true },
    //    { title: 'ADD', field: 'ADD', visible: true },
    //    { title: 'Stress', field: 'Stress', visible: true },
    //    { title: 'Inflammation', field: 'Inflammation', visible: true },
    //    { title: 'Bipolar Disorder', field: 'Bipolar Disorder', visible: true },
    //    { title: 'Schizophrenia', field: 'Schizophrenia', visible: true },
    //    { title: 'Tourette Syndrome', field: 'Tourette Syndrome', visible: true },
    //    { title: 'Epilepsy', field: 'Epilepsy', visible: true },
    //    { title: 'Dravet Syndrome', field: 'Dravet Syndrome', visible: true },
    //    { title: 'Status Epilepticus', field: 'Status Epilepticus', visible: true },
    //    { title: 'Cachexia', field: 'Cachexia', visible: true }
    //];

    $scope.checkStReviewSideEffectPercent = function() {
        $scope.stReviewSideEffectPercent = !$scope.stReviewSideEffectPercent;
        renderTableStReview($scope.chartData, 'sideEffect');
    }

    function renderTableStReview(data, type) {
        var selectedAilments = $scope.filterObj.ailments;
        if (!selectedAilments || selectedAilments.length == 0) {
            _.map($scope.streviewCols, function (item, key) {
                item.visible = true;
            })
        } else {
            _.map($scope.streviewCols, function (item, key) {
                if (item.title != 'Strain') {
                    item.visible = false;

                }
            })
            for (var i in selectedAilments) {
                var filterItem = _.find($scope.streviewCols, function(obj) { return obj.id == selectedAilments[i] })

                if (filterItem) filterItem.visible = true;
            }
        }

        var finalData = [];
        if (type == 'beforeAfter') {
            _.map(data, function (item, key) {
                var strainCondition = key.split(':');
                if (strainCondition.length == 2) {
                    var strain = strainCondition[0];
                    var cond = strainCondition[1];
                    var strainRow = _.find(finalData, function(obj) { return obj.strain == strain })

                    if (!strainRow) {
                        strainRow = {};
                        strainRow.strain = strain;
                        strainRow[cond] = item.afterValue - item.beforeValue;

                        finalData.push(strainRow);

                    } else {
                        strainRow[cond] = item.afterValue - item.beforeValue;
                    }
                }


                //return {id: i++, name: key, before: +item.before, after: +item.after};
            });
        } else if (type=='sideEffect') {
            var selectedSideEffects = $scope.filterObj.sideEffects;
            if (!selectedSideEffects || selectedSideEffects.length == 0) {
                _.map($scope.streviewColsSideEffect, function (item, key) {
                  item.visible = true;
                })
            } else {
                _.map($scope.streviewColsSideEffect, function (item, key) {
                    if (item.title != 'Strain') {
                        item.visible = false;

                    }
                })
                for (var i in selectedSideEffects) {
                    var filterItem = _.find($scope.streviewColsSideEffect, function(obj) { return obj.title == selectedSideEffects[i] })

                    if (filterItem) filterItem.visible = true;
                }
            }

            _.map(data, function (item, key) {
                var strainCondition = key.split(':');
                if (strainCondition.length == 2) {
                    var strain = strainCondition[0];
                    var cond = strainCondition[1];
                    var strainRow = _.find(finalData, function(obj) { return obj.strainOnly == strain })
                    var reviewCount = 0;

                    if (!strainRow) {
                        strainRow = {};
                        reviewCount = Math.round(item.value * 100 / item.percent);
                        strainRow.strain = strain + " (" + reviewCount + " reviews)";
                        strainRow.strainOnly = strain;
                        if ($scope.stReviewSideEffectPercent) {
                            strainRow[cond] = item.percent;

                        }else {
                            strainRow[cond] = item.value;

                        }

                        finalData.push(strainRow);

                    } else {
                        strainRow[cond] = item.percent;
                    }
                }


                //return {id: i++, name: key, before: +item.before, after: +item.after};
            });

        } else if (type=='rating') {
            var i = 0;
            finalData = _.map(data, function (item, key) {
                return {id: i++, strain: key, percent: item.percent, value: item.value};
            });

        }
        //$scope.streviewCols = ['strain', 'Pain', 'ADHD', 'Anxiety', 'Arthritis'];

        $scope.tableDataSet = finalData;
        $scope.tableParams.reload();
    }
}]);


app.controller('FilterAsideCtrl', ["$scope","$modalInstance",function($scope,$modalInstance){

    $scope.apply = function(e){
        $scope.onClose();
        $modalInstance.dismiss();
        e.stopPropagation();
    };
    $scope.cancel = function (e) {
        $modalInstance.dismiss();
        e.stopPropagation();
    };


    $scope.reset=function(e){
        $scope.resetFields($scope.filter);
        if($scope.filter.list){
            _.each($scope[$scope.filter.list],function(item){
              item.selected = false;
            })
        };
        e.stopPropagation();
    };

    $scope.selectCanab = function(canab,e){
        canab.selected = !canab.selected;
        if(canab.selected){
            $scope.filterObj.cannabisExperience = _.union($scope.filterObj.cannabisExperience,[canab.id])
        }else{
            $scope.filterObj.cannabisExperience = _.difference($scope.filterObj.cannabisExperience,[canab.id])
        }
    };

    $scope.selectGender = function(genderId,e){
      if($scope.filterObj.gender===''){
          if(genderId===0){
              $scope.filterObj.gender = 1;
          }else{
              $scope.filterObj.gender = 0;
          }
      }else if($scope.filterObj.gender===0){
          if(genderId===0){
              $scope.filterObj.gender = '';
          }else{
              $scope.filterObj.gender = '';
          }
      }else{
          if(genderId===0){
              $scope.filterObj.gender = '';
          }else{
              $scope.filterObj.gender = '';
          }
      }
    };

    $scope.selectState = function(state){
        state.selected = !state.selected;
        if(state.selected){
            $scope.filterObj.usStates = _.union($scope.filterObj.usStates,[state.code])
        }else{
            $scope.filterObj.usStates = _.difference($scope.filterObj.usStates,[state.code])
        }

    };

    $scope.selectAilment = function(a){
        a.selected = !a.selected;
        if(a.selected){
            $scope.filterObj.ailments = _.union($scope.filterObj.ailments,[a.id])
        }else{
            $scope.filterObj.ailments = _.difference($scope.filterObj.ailments,[a.id])
        }

    };

    $scope.selectStrainType = function(a){
        a.selected = !a.selected;
        if(a.selected){
            $scope.filterObj.strainTypes = _.union($scope.filterObj.strainTypes,[a.id])
        }else{
            $scope.filterObj.strainTypes = _.difference($scope.filterObj.strainTypes,[a.id])
        }

    };

    $scope.selectSideEffect = function(a){
        a.selected = !a.selected;
        if(a.selected){
            $scope.filterObj.sideEffects = _.union($scope.filterObj.sideEffects,[a.name])
        }else{
            $scope.filterObj.sideEffects = _.difference($scope.filterObj.sideEffects,[a.name])
        }

    };





}]);
//app.directive('datepickerPopup', function (){
//    return {
//        restrict: 'EAC',
//        require: 'ngModel',
//        link: function(scope, element, attr, controller) {
//            //remove the default formatter from the input directive to prevent conflict
//            controller.$formatters.shift();
//        }
//    }
//})
