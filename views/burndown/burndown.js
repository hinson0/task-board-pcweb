'use strict';

angular.module('myApp.burndown', ['ngRoute'])

  .config(['$routeProvider', function($routeProvider) {
    $routeProvider.when('/burndown', {
      templateUrl: 'views/burndown/burndown.html',
      controller: 'BurndownCtrl'
    });
  }])

  .controller('BurndownCtrl', ['$scope', '$http', 'HOST', '$timeout', function($scope, $http, host, $timeout) {
    $scope.versionTag = '$version$';
    var myChart;
    var echarts;
    var option = {
      title : {
        text: '迭代燃尽图',
        subtext: '剩余任务时数'
      },
      tooltip : {
        trigger: 'axis'
      },
      legend: {
        data:['标准燃尽速率','实际燃尽速率']
      },
      xAxis : [
        {
          axisLabel: {
            rotate: -60
          },
          type : 'category',
          boundaryGap : false,
          data : ['d0','d1','d2','d3','d4','d5','d6']
        }
      ],
      yAxis : [
        {
          type : 'value'
        }
      ],
      series : [
        {
          name:'标准燃尽速率',
          type:'line',
          data:[300, 250, 200, 150, 100, 50, 0]
        },
        {
          name:'实际燃尽速率',
          type:'line',
          data:[300, 230, 210, 160, 120, 80, 0]
        }
      ]
    };

    // 使用
    require(
      [
        'echarts',
        'echarts/chart/line'
      ],
      function (ec) {
        echarts = ec;

        // 查询版本列表
        $http.get(host + 'versions?offset=0&size=100')
          .success(function (result) {
            $scope.versionList = result.rows;
            if ($scope.versionList.length) {
              $timeout(function () {
                $scope.versionId = $scope.versionList[0].id;
              });
            }
          });

      }
    );

    $scope.$watch('versionId', function (newVal, oldVal) {
      if (newVal) {
        getIterationList($scope.versionId);
      }
    });

    $scope.$watch('iterationId', function (newVal, oldVal) {
      if (newVal) {
        getBurndownStats($scope.iterationId);
      }
    });

    function getIterationList (id) {
      // 查询迭代列表
      $http.get(host + 'iterations?version_id=' + id + '&offset=0&size=100')
        .success(function (result) {
          $scope.iterationList = result.rows;
          $scope.iterationId = undefined;
          $timeout(function () {
            $scope.iterationId = $scope.versionTag;
          });
        });
    }

    function getBurndownStats() {
      var url = host + 'statisticses/bdc?version_id=' + $scope.versionId;

      if ($scope.iterationId != $scope.versionTag) {
        url += '&iteration_id=' + $scope.iterationId;
      }

      $http.get(url)
        .success(function (result) {
          option.xAxis[0].data = getBurndownDate(result);
          option.series[0].data = calcStandardLine(result);
          option.series[1].data = calcActualLine(result);

          if (myChart && myChart.dispose) {
            myChart.dispose();
          }

          myChart = echarts.init(document.getElementById('main'));

          myChart.setOption(option);
        });
    }

    function getBurndownDate(data) {
      var dates = [];

      dates = Object.keys(data.details);
      dates.unshift('');

      return dates;
    }

    function calcStandardLine(data) {
      var dates = Object.keys(data.details);
      var hours = [];

      if (!dates.length) return hours;

      var step = data.total / dates.length;

      for (var i = 0; i < dates.length; i++) {
        if (i == dates.length - 1) {
          hours.push(0);
        } else {
          hours.push(data.total - step * (i + 1));
        }
      }

      hours.unshift(data.total);

      return hours;
    }

    function calcActualLine(data) {
      var dates = Object.keys(data.details);
      var hours = [];

      if (!dates.length) return hours;

      for (var i = 0; i < dates.length; i++) {
        if (i == 0) {
          hours.push(correctFloatPrecision(data.total - data.details[dates[0]]));
        } else {
          hours.push(correctFloatPrecision(hours[i-1] - data.details[dates[i]]));
        }
      }

      hours.unshift(data.total);

      return hours;
    }

    function correctFloatPrecision(float) {
      return parseFloat(float.toFixed(10));
    }
  }]);