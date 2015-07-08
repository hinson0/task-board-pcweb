'use strict';

angular.module('myApp.project', ['ngRoute'])

.config(['$routeProvider', function($routeProvider) {
  $routeProvider.when('/project', {
    templateUrl: 'views/project/project.html',
    controller: 'ProjectCtrl'
  });
}])

.controller('ProjectCtrl', ['$scope', '$http', 'HOST', function($scope, $http, host) {
  $scope.projectData = {};

  var getProjectList = function () {
    // 查询项目列表
    $http.get(host + 'projects?offset=0&size=100')
      .success(function (result) {
        $scope.projectList = result.rows;
      });
  };

  // 查询用户信息
  $http.get(host + 'user/list?offset=0&size=100')
    .success(function (result) {
      $scope.userList = result;
      getProjectList();
    });

  $scope.getUserName = function (id) {
    var name = id;

    $.each($scope.userList, function(index, user) {
      if (user.id == id) {
        name = user.name;
        return false;
      }
    });

    return name;
  };

  $scope.addProject = function () {
    $scope.action = '1';
    $scope.projectData = {};
    $('#project-form').modal({backdrop: 'static'});
  };

  $scope.editProject = function (id, index) {
    $scope.action = '2';
    $scope.projectData = $.extend({}, $scope.projectList[index]);
    $('#project-form').modal({backdrop: 'static'});
  };

  $scope.deleteProject = function (id) {
    if (confirm('确定删除？')) {
      $http.delete(host + 'projects/' + id)
        .success(function () {
          getProjectList();
        });
    }
  };

  $scope.save = function() {
    $http({
      method: $scope.action == '1' ? 'POST' : 'PUT',
      url: host + 'projects' + ($scope.action == '1' ? '' : '/' + $scope.projectData.id),
      data: $scope.projectData
    }).success(function () {
      getProjectList();
      $('#project-form').modal('hide');
    });
  }
}]);