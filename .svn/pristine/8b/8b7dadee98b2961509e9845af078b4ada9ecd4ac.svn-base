'use strict';

angular.module('myApp.version', ['ngRoute'])

  .config(['$routeProvider', function($routeProvider) {
    $routeProvider.when('/version', {
      templateUrl: 'views/version/version.html',
      controller: 'VersionCtrl'
    });
  }])

  .controller('VersionCtrl', ['$scope', '$http', 'HOST', function($scope, $http, host) {
    $scope.versionData = {};
    //默认查询未关闭版本
    $scope.status = false;

    // bind toggle event
    $('#version-container').on('click', 'thead', function() {
      $(this).next('tbody').toggle();
      $(this).find('.glyphicon').toggleClass('glyphicon-triangle-bottom').toggleClass('glyphicon-triangle-top')
    });


    // 初始化时间控件
    $( "#relax-date" ).datepicker({
      changeMonth: true,
      changeYear: true,
      showOn: "button",
      buttonImage: "images/calendar.gif",
      buttonImageOnly: true,
      buttonText: "Select date",
      onSelect: function (date) {
        $scope.$apply(function () {
          $scope.versionData.relaxed_arr.push(date);
          $scope.versionData.relaxed_arr.sort();
        });
      }
    });

    $scope.$watch('status', function (newVal, oldVal) {
      if (newVal != undefined) {
        getVersionList();
      }
    });

    // 查询项目列表
    $http.get(host + 'projects?offset=0&size=100')
      .success(function (result) {
        $scope.projectList = result.rows;
      });

    // 新增版本
    $scope.addVersion = function () {
      var currentDate = new Date();

      $scope.action = '1';
      $scope.versionData = {
        start_time: currentDate,
        end_time: currentDate,
        relaxed_arr: []
      };
      $('#version-form').modal({backdrop: 'static'});
    };

    // 修改版本
    $scope.editVersion = function (id) {
      $scope.action = '2';
      $scope.versionData = getVersionData(id);
      $scope.versionData.start_time = new Date($scope.versionData.start_time * 1000);
      $scope.versionData.end_time = new Date($scope.versionData.end_time * 1000);
      $('#version-form').modal({backdrop: 'static'});
    };

    // 删除版本
    $scope.deleteVersion = function (id) {
      if (confirm('确定删除？')) {
        $http.delete(host + 'versions/' + id)
          .success(function () {
            getVersionList();
          });
      }
    };

    // 关闭版本
    $scope.closeVersion = function (id) {
      $http.put(host + 'versions/' + id + '/toggle?status=1', {})
        .success(function () {
          getVersionList();
        });
    };

    // 开启版本
    $scope.openVersion = function (id) {
      $http.put(host + 'versions/' + id + '/toggle?status=0', {})
        .success(function () {
          getVersionList();
        });
    };

    // 删除休息日
    $scope.deleteDate = function (index) {
      $scope.versionData.relaxed_arr.splice(index, 1);
    };

    $scope.save = function() {
      var saveData;
      var method = '';
      var url = '';

      if ($scope.action == '1') {
        method = 'POST';
        url = host + 'versions';
      } else {
        method = "PUT";
        url = host + 'versions/' + $scope.versionData.id;
      }

      saveData = {
        name: $scope.versionData.name,
        project_id: $scope.versionData.project_id,
        start_time: $scope.versionData.start_time.getTime() / 1000 | 0,
        end_time: $scope.versionData.end_time.getTime() / 1000 | 0,
        relaxed: $scope.versionData.relaxed_arr.join(',')
      };

      $http({
        method: method,
        url: url,
        data: saveData
      }).success(function () {
        getVersionList();
        $('#version-form').modal('hide');
      });
    };

    function getVersionList() {
      // 查询版本列表
/*      $http.get(host + 'versions?offset=0&size=100&status=' + ($scope.status ? '1' : '0'))
        .success(function (result) {
          // 处理休息日显示
          $.each(result.rows, function (i, n) {
            if (n.relaxed) {
              n.relaxed_arr = n.relaxed.split(',');
            } else {
              n.relaxed_arr = [];
            }
          });
          $scope.versionList = result.rows;
        });*/

      $http.get(host + 'projects/list?offset=0&size=100&status=' + ($scope.status ? '1' : '0'))
        .success(function (result) {
          $scope.versionList = result;
          processVersionData();
        });
    }

    function processVersionData() {
      $scope.processedVersion = [];

      $scope.versionList.forEach(function (project) {
        project.versions.forEach(function (version) {
          // 处理休息日显示
          if (version.relaxed) {
            version.relaxed_arr = version.relaxed.split(',');
          } else {
            version.relaxed_arr = [];
          }

          $scope.processedVersion.push($.extend(true, {}, version));
        });
      });
    }

    function getVersionData(versionId) {
      var versionData = {};

      $.each($scope.processedVersion, function (i, n) {
        if (n.id == versionId) {
          versionData = n;
          return false;
        }
      });

      return versionData;
    }
  }]);