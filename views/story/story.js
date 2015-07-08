'use strict';

angular.module('myApp.story', ['ngRoute'])

.config(['$routeProvider', function($routeProvider) {
  $routeProvider.when('/story', {
    templateUrl: 'views/story/story.html',
    controller: 'StoryCtrl'
  });
}])

.controller('StoryCtrl', ['$scope', '$http', 'HOST', function($scope, $http, host) {
  $scope.storyData = {};

  function getStoryList(id) {
    // 查询故事列表
    $http.get(host + 'stories?version_id=' + id + '&offset=0&size=100')
      .success(function (result) {
        $scope.storyList = result;
      });
  }

  // 查询版本列表
  $http.get(host + 'versions?offset=0&size=100&status=0')
    .success(function (result) {
      $scope.versionList = result.rows;

      if ($scope.versionList.length) {
        $scope.versionId = $scope.versionList[0].id;
      }
    });

  // 查询用户信息
  $http.get(host + 'user/list?offset=0&size=100')
    .success(function (result) {
      $scope.userList = result;
    });

  $scope.$watch("versionId", function (newVal, oldVal) {
    if (newVal) {
      getStoryList($scope.versionId);
    }
  });

  $scope.addStory = function () {
    $scope.action = '1';
    $scope.storyData = {
      leader: localStorage['userId']
    };
    $('#story-form').modal({backdrop: 'static'});
  };

  $scope.editStory = function (id, index) {
    $scope.action = '2';
    $scope.storyData = $.extend({}, $scope.storyList[index]);
    $('#story-form').modal({backdrop: 'static'});
  };

  $scope.deleteStory = function (id) {
    if (confirm('确定删除？')) {
      $http.delete(host + 'stories/' + id)
        .success(function () {
          getStoryList($scope.versionId);
        });
    }
  };

  $scope.save = function() {
    var saveData;
    var method = '';
    var url = '';

    if ($scope.action == '1') {
      method = 'POST';
      url = host + 'stories';
    } else {
      method = "PUT";
      url = host + 'stories/' + $scope.storyData.id;
    }

    saveData = {
      title: $scope.storyData.title,
      leader: $scope.storyData.leader,
      version_id: $scope.versionId,
      priority: $scope.storyData.priority
    };

    $http({
      method: method,
      url: url,
      data: saveData
    }).success(function () {
      getStoryList($scope.versionId);
      $('#story-form').modal('hide');
    });
  }
}]);