'use strict';

// Declare app level module which depends on views, and components
angular.module('myApp', [
  'ngRoute',
  'ngSanitize',
  'myApp.login',
  'myApp.task',
  'myApp.user',
  'myApp.project',
  'myApp.version',
  'myApp.iteration',
  'myApp.story',
  'myApp.burndown',
  'myApp.progress',
  'myApp.statistic',
  'myApp.authentication',
  'myApp.config'
]).
config(['$routeProvider', '$httpProvider', function($routeProvider, $httpProvider) {
  $routeProvider.otherwise({redirectTo: '/task'});

  $httpProvider.interceptors.push(['$q', '$location', function($q, $location) {
    return {
      /*'request': function (config) {
        config.headers = config.headers || {};
        if ($localStorage.token) {
          config.headers.Authorization = 'Bearer ' + $localStorage.token;
        }
        return config;
      },
      'response': function (response) {
        console.log(response);

        if (response.status === 401) {
          // handle the case where the user is not authenticated
          $location.path('/signin');
        }

        return response || $q.when(response);
      },
      'responseError': function (response) {
        console.log(response);
        if (response.status === 401 || response.status === 403) {
          $location.path('/signin');
        }
        return $q.reject(response);
      }*/
      responseError: function (response) {
        alert(response.data && response.data.msg || '接口请求错误\n' + response.config.method + ' ' + response.config.url);

        return $q.reject(response);
      }
    };
  }]);
}])
.controller('TitleCtrl', ['$http', '$scope', '$location', 'authSrv', 'HOST', function($http, $scope, $location, auth, host) {
    $scope.$on('username.change', function(event, data) {
      $scope.username = data;
    });

    $scope.logout = function () {
      auth.logout();
    };

    if (!auth.isLogin()) {
      $location.path('/login');
      return;
    } else {
      // 显示登录用户名
      auth.showUserName();

      // 查询消息列表
      $http.get(host + 'msgs?offset=0&size=100&user_id=' + localStorage['userId'])
        .success(function (result) {
          $scope.messageList = result;
        });
    }

    $scope.toggleMessageCenter = function (e) {
      $('#message-center').toggle();

      e.stopPropagation();
    };

    $(document).on('click', function() {
        $('#message-center').hide();
    });
  }]);

// 配置humane提示组件
humane.success = humane.spawn({ addnCls: 'humane-flatty-success', timeout: 1500 });
humane.error = humane.spawn({ addnCls: 'humane-flatty-error', timeout: 1500 });
