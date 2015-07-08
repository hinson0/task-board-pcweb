'use strict';

angular.module('myApp.statistic', ['ngRoute'])

  .config(['$routeProvider', function($routeProvider) {
    $routeProvider.when('/statistic', {
      templateUrl: 'views/statistic/statistic.html',
      controller: 'StatisticCtrl'
    });
  }])

  .controller('StatisticCtrl', ['$scope', '$http', 'HOST', '$timeout', function($scope, $http, host, $timeout) {
    $scope.allTag = '$all$';

    // 查询版本列表
    $http.get(host + 'versions?offset=0&size=100')
      .success(function (result) {
        $scope.versionList = result.rows;
        if ($scope.versionList.length) {
          $timeout(function () {
            $scope.versionId = $scope.allTag;
          });
        }
      });

    $scope.$watch('versionId', function (newVal, oldVal) {
      if (newVal) {
        getIterationList($scope.versionId);
        getStatistic($scope.versionId);
        $scope.showTime = false;
      }
    });

    $scope.iterationChange = function () {console.log('iterationChange');
      $scope.statistics = transform(filterStatistic($scope.iterationId));
    };

    $scope.searchByTime = function () {
      var currentDate = new Date();

      $scope.start_time = currentDate;
      $scope.end_time = currentDate;
      $('#search-form').modal({backdrop: 'static'});
    };

    $scope.search = function () {
      $('#search-form').modal('hide');
      $scope.showTime = true;
      getStatistic('$byTime$');
    };

    function getIterationList(id) {
      if (id == $scope.allTag) {
        $scope.iterationList = [];
        $scope.iterationId = undefined;
        $timeout(function () {
          $scope.iterationId = $scope.allTag;
        });
      } else {
        // 查询迭代列表
        $http.get(host + 'iterations?version_id=' + id + '&offset=0&size=100')
          .success(function (result) {
            $scope.iterationList = result.rows;
            $scope.iterationId = undefined;
            $timeout(function () {
              $scope.iterationId = $scope.allTag;
            });
          });
      }
    }

    function getStatistic(id) {
      var url = host + 'statisticses/hours';

      if (id == '$byTime$') {
        url += '?start_time=' + ($scope.start_time.getTime() / 1000 | 0) +
          '&end_time=' + ($scope.end_time.getTime() / 1000 | 0);
      } else if (id == $scope.allTag) {
      } else {
        url += '?version_id=' + id;
      }

      $http.get(url)
        .success(function (result) {
          $scope.originStatistics = result;
          $scope.statistics = transform($scope.originStatistics);
        });
    }

    function filterStatistic(iterationId) {
      return $scope.originStatistics.filter(function(stat) {
        if (iterationId == $scope.allTag || stat.iteration_id == iterationId) {
          return true;
        }
      });
    }

    function transform(data) {
      var user_id = '';
      var user_name = '';
      var total_estimated_time = 0;
      var total_done_time = 0;
      var summary_estimated_time = 0;
      var summary_done_time = 0;
      var transformed = [];

      $.each(data, function (i, task) {
        if (task.user_id != user_id) {
          if (i != 0) {
            transformed.push({
              name: user_name,
              total: total_estimated_time,
              done: total_done_time
            })
          }

          total_estimated_time = 0;
          total_done_time = 0;
          user_id = task.user_id;
          user_name = task.user.name;
        }

        total_estimated_time += task.estimated_time;
        if (task.status_id == 50) {
          total_done_time += task.estimated_time;
        }

        if (i == data.length - 1) {
          transformed.push({
            name: user_name,
            total: total_estimated_time,
            done: total_done_time
          });
        }
      });

      if (transformed.length) {
        $.each(transformed, function(i, item) {
          summary_estimated_time += item.total;
          summary_done_time += item.done;
        });

        transformed.push({
          name: '合计',
          total: summary_estimated_time,
          done: summary_done_time
        });
      }

      return transformed;
    }

  }]);