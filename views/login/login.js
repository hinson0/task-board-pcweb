'use strict';

angular.module('myApp.login', ['ngRoute'])

  .config(['$routeProvider', function ($routeProvider) {
    $routeProvider.when('/login', {
      templateUrl: 'views/login/login.html',
      controller: 'LoginCtrl'
    });
  }])

  .controller('LoginCtrl', ['$scope', '$location', '$http', 'authSrv', 'HOST', function ($scope, $location, $http, auth, host) {
    setTimeout(function() {
      $('#login-form').modal({backdrop: 'static'});
    }, 0);

    $scope.userData = {};

    $scope.signin = function () {
      auth.signin({
        name: $scope.account,
        password: $scope.password,
      }).then(function(userInfo) {
        // 完善用户资料
        $http.get(host + 'user/show/' + userInfo.id + '?sid=' + userInfo.sid)
          .success(function (result) {
            $scope.userData = result;

            if (result.name) {
              $location.path('/task');
            } else {
              $('#user-form').modal({backdrop: 'static'});
            }
          });
      }, function(error) {
        alert('登录失败');
      });
    };

    $scope.save = function() {
      $http({
        method: 'PUT',
        url: host + 'user/modi/' + $scope.userData.id,
        data: $scope.userData
      }).success(function () {
        $location.path('/task');
      });
    }
  }]);
