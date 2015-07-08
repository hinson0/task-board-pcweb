'use strict';

angular.module('myApp.progress', ['ngRoute'])

  .config(['$routeProvider', function($routeProvider) {
    $routeProvider.when('/progress', {
      templateUrl: 'views/progress/progress.html',
      controller: 'ProgressCtrl'
    });
  }])

  .controller('ProgressCtrl', ['$scope', '$http', 'HOST', '$timeout', function($scope, $http, host, $timeout) {
    // bind story toggle event
    $('#story-progress').on('click', 'thead', function() {
      $(this).next('tbody').toggle();
      $(this).find('.glyphicon').toggleClass('glyphicon-triangle-bottom').toggleClass('glyphicon-triangle-top')
    });

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

    $scope.$watch('versionId', function (newVal, oldVal) {
      if (newVal) {
        getProgressList($scope.versionId);
      }
    });

    function preprocess(data) {
      var newList = [];

      $.each(data, function(i, story) {
        var versionObj = getVersionObj(story.version_id);
        var todo = 0;
        var doing = 0;
        var done = 0;
        var total = story.tasks.length;

        story.project_name = versionObj.project.name;
        story.version_name = versionObj.name;

        $.each(story.tasks, function(j, task) {
          // 处理prev_task 要后台返回相关字段
          task.prev_tasks_id = '';
          task.prev_tasks_desc = '';
          task.prev_tasks_status = '';

          task.status_name = {10: '待开发', 20: '开发中', 50: '已完成'}[task.status_id];

          if (task.status_id == 10) todo++;
          if (task.status_id == 20) doing++;
          if (task.status_id == 50) done++;
        });

        if (todo == total) {
          story.status_id = 10;
          story.status_name = '待开发';
        } else if (done == total) {
          story.status_id = 50;
          story.status_name = '已完成';
        } else {
          story.status_id = 20;
          story.status_name = '开发中';
        }

        newList.push(story);
      });

      newList.sort(sortBy('status_id'));

      return newList;
    }

    function sortBy(name) {
      return function (o, p) {
        var a, b;
        if (typeof o === 'object' && typeof p === 'object' && o && p) {
          a = o[name];
          b = p[name];

          return a - b;
        } else {
          throw {
            name: 'sortError',
            message: 'Expected an object when sorting by ' + name
          }
        }
      }
    }

    function getProgressList(id) {
      $http.get(host + 'statisticses/story?version_id=' + id)
        .success(function (result) {
          $scope.originProgressList = preprocess(result);
          $scope.progressList = $scope.originProgressList;
        });
    }

    function getVersionObj(id) {
      var versionObj = {};

      $.each($scope.versionList, function(index, version) {
        if (version.id == id) {
          versionObj = version;
          return false;
        }
      });

      return versionObj;
    }
  }]);