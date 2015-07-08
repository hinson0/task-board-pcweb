'use strict';

angular.module('myApp.iteration', ['ngRoute'])

  .config(['$routeProvider', function($routeProvider) {
    $routeProvider.when('/iteration', {
      templateUrl: 'views/iteration/iteration.html',
      controller: 'IterationCtrl'
    });
  }])

  .controller('IterationCtrl', ['$scope', '$http', 'HOST', function($scope, $http, host) {
    $scope.iterationData = {};
    //默认查询未关闭迭代
    $scope.status = false;


    // bind toggle event
    $('#iteration-container').on('click', 'thead', function() {
      $(this).next('tbody').toggle();
      $(this).find('.glyphicon').toggleClass('glyphicon-triangle-bottom').toggleClass('glyphicon-triangle-top')
    });

    $scope.$watch('status', function (newVal, oldVal) {
      if (newVal != undefined) {
        getIterationList();
      }
    });

    // 查询版本列表
    $http.get(host + 'versions?offset=0&size=100')
      .success(function (result) {
        $scope.versionList = result.rows;
      });

    // 新增迭代
    $scope.addIteration = function () {
      var currentDate = new Date();

      $scope.action = '1';
      $scope.iterationData = {
        start_time: currentDate,
        end_time: currentDate
      };
      $('#iteration-form').modal({backdrop: 'static'});
    };

    // 编辑迭代
    $scope.editIteration = function (id) {
      $scope.action = '2';
      $scope.iterationData = getIterationData(id);
      $scope.iterationData.start_time = new Date($scope.iterationData.start_time * 1000);
      $scope.iterationData.end_time = new Date($scope.iterationData.end_time * 1000);
      $('#iteration-form').modal({backdrop: 'static'});
    };

    // 删除迭代
    $scope.deleteIteration = function (id) {
      if (confirm('确定删除？')) {
        $http.delete(host + 'iterations/' + id)
          .success(function () {
            getIterationList();
          });
      }
    };

    // 关闭迭代
    $scope.closeIteration = function (id) {
      $http.put(host + 'iterations/' + id + '/toggle?status=1', {})
        .success(function () {
          getIterationList();
        });
    };

    // 开启版本
    $scope.openIteration = function (id) {
      $http.put(host + 'iterations/' + id + '/toggle?status=0', {})
        .success(function () {
          getIterationList();
        });
    };

    $scope.save = function() {
      var saveData;
      var method = '';
      var url = '';

      if ($scope.action == '1') {
        method = 'POST';
        url = host + 'iterations';
      } else {
        method = "PUT";
        url = host + 'iterations/' + $scope.iterationData.id;
      }

      saveData = {
        name: $scope.iterationData.name,
        version_id: $scope.iterationData.version_id,
        start_time: $scope.iterationData.start_time.getTime() / 1000 | 0,
        end_time: $scope.iterationData.end_time.getTime() / 1000 | 0
      };

      $http({
        method: method,
        url: url,
        data: saveData
      }).success(function () {
        getIterationList();
        $('#iteration-form').modal('hide');
      });
    };

    function getIterationList() {
      // 查询迭代列表
      /* $http.get(host + 'iterations?offset=0&size=100&status=' + ($scope.status ? '1' : '0'))
       .success(function (result) {
       $scope.iterationList = result.rows;
       });*/

      $http.get(host + 'projects/list?offset=0&size=100&status=' + ($scope.status ? '1' : '0'))
        .success(function (result) {
          $scope.iterationList = result;

          processIterationList();
        });
    }

    function processIterationList() {
      $scope.processedIteration = [];

      $scope.iterationList.forEach(function (project) {
        project.versions.forEach(function(version) {
          version.iterations.forEach(function (iteration) {
            $scope.processedIteration.push($.extend({}, iteration));
          });
        });
      });
    }

    function getIterationData(iterationId) {
      var iterationData = {};

      $.each($scope.processedIteration, function (i, n) {
        if (n.id == iterationId) {
          iterationData = n;
          return false;
        }
      });

      return iterationData;
    }
  }]);