'use strict';

angular.module('myApp.user', ['ngRoute'])

  .config(['$routeProvider', function ($routeProvider) {
    $routeProvider.when('/user', {
      templateUrl: 'views/user/user.html',
      controller: 'UserCtrl'
    });
  }])

  .controller('UserCtrl', ['$scope', '$http', 'HOST', function ($scope, $http, host) {
    $scope.userData = {};

    var getUserList = function () {
      // 查询用户列表
      $http.get(host + 'user/list?offset=0&size=100')
        .success(function (result) {
          $scope.userList = result;
        });
    };

    getUserList();

    $scope.addUser = function () {
      $scope.action = '1';
      $scope.userData = {};
      $('#user-form').modal({backdrop: 'static'});
    };

    $scope.editUser = function (id, index) {
      $scope.action = '2';
      $scope.userData = $.extend({}, $scope.userList[index]);
      $('#user-form').modal({backdrop: 'static'});
    };

    $scope.deleteUser = function (id) {
      if (confirm('确定删除？')) {
        $http.delete(host + 'users/' + id)
          .success(function () {
            getUserList();
          });
      }
    };

    $scope.save = function() {
      $http({
        method: 'PUT',
        url: host + 'user/modi/' + $scope.userData.id,
        data: $scope.userData
      }).success(function () {
        getUserList();
        $('#user-form').modal('hide');
      });
    }
  }]);