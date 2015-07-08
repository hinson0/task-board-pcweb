'use strict';

angular.module('myApp.task', ['ngRoute'])

  .config(['$routeProvider', function($routeProvider) {
    $routeProvider.when('/task', {
      templateUrl: 'views/task/task.html',
      controller: 'TaskCtrl'
    });
  }])

  .controller('TaskCtrl', ['$scope', '$http', 'HOST', '$timeout', '$filter', function($scope, $http, host, $timeout, $filter) {
    $scope.taskData = {};

    // 默认显示所有任务
    $scope.tabindex = 1;

    // 初始化关键字
    $timeout(function () {
      if (localStorage.getItem(storageTag + 'KEYWORD')) {
        $scope.keyword = localStorage.getItem(storageTag + 'KEYWORD');
      } else {
        $scope.keyword = '';
      }
    });

    var storageTag = 'PAGE_TASK_';
    var taskStatusList = [];

    // 初始化时间控件
    $( "#deadline" ).datepicker({
      changeMonth: true,
      changeYear: true,
      onSelect: function (date) {
        $scope.$apply(function () {
          $scope.taskData.deadline = date;
        });
      }
    });

    // 查询用户信息
    $http.get(host + 'user/list?offset=0&size=100')
      .success(function (result) {
        $scope.userList = result;
      });

    // 查询任务状态列表
    $http.get(host + 'task_statuses')
      .success(function (result) {
        taskStatusList = result;
        // 查询版本列表
        $http.get(host + 'versions?offset=0&size=100')
          .success(function (result) {

            $scope.versionList = result.rows;
            if ($scope.versionList.length) {
              var lastVersionId = localStorage.getItem(storageTag + 'VERSION_ID');

              if (lastVersionId && isValidVersionId(lastVersionId)) {
                $timeout(function () {
                  $scope.versionId = lastVersionId;
                });
              } else {
                $timeout(function () {
                  $scope.versionId = $scope.versionList[0].id;
                });
              }

            }
          });
      });

    $scope.$watch('versionId', function (newVal, oldVal) {
      if (newVal) {
        resetPrevTaskView();
        getIterationList($scope.versionId);
        getStoryList($scope.versionId);
      }
    });

    $scope.$watch('iterationId', function (newVal, oldVal) {
      if (newVal) {
        resetPrevTaskView();
        getTaskList($scope.iterationId);
      }
    });

    $scope.tabSwitch = function (self) {
      getTaskList($scope.iterationId);
    };

    // 选中故事时，自动填充优先级
    $scope.selectStory = function () {
      var storyData = getStoryData($scope.taskData.story_id);

      if (storyData.priority) {
        $scope.taskData.priority = storyData.priority;
      }
    };

    $scope.changeVersionId = function () {
      localStorage.setItem(storageTag + 'VERSION_ID', $scope.versionId);
      localStorage.removeItem(storageTag + 'ITERATION_ID');
      localStorage.removeItem(storageTag + 'STORY_ID');
    };

    $scope.changeIterationId = function () {
      localStorage.setItem(storageTag + 'ITERATION_ID', $scope.iterationId);
    };

    $scope.changeStoryId = function () {
      localStorage.setItem(storageTag + 'STORY_ID', $scope.storyId);
      renderTaskList(filterByKeyword());
    };

    // 显示前置任务
    $scope.showPrevTask = function (selfId, prevIds) {
      if (!$scope.selfId) {
        $scope.prevIds = prevIds.split(',');
        $scope.selfId = selfId;
      } else {
        resetPrevTaskView();
      }

      renderTaskList(filterByKeyword());
    };

    $scope.addTask = function () {
      $scope.action = '1';
      $scope.taskData = {
        user_id: localStorage['userId'],
        iteration_id: $scope.iterationId,
        estimated_time: 1,
        task_follows: []
      };
      $('#task-form').modal({backdrop: 'static'});
    };

    $scope.editTask = function (id) {
      $scope.action = '2';
      $scope.taskData = getTaskData(id);
      $scope.taskData.task_follows.forEach(function (item) {
        item.desc = getTaskData(item.prev_task_id).desc || '该前置任务已被删除';
      });
      if ($scope.taskData.deadline == 0) {
        $scope.taskData.deadline = '';
      } else {
        $scope.taskData.deadline = $filter('date')(new Date($scope.taskData.deadline * 1000), 'yyyy-MM-dd');
      }
      $('#task-form').modal({backdrop: 'static'});
    };

    $scope.addRemark = function (id) {
      $scope.action = '2';
      $scope.taskData = getTaskData(id);
      $('#remark-form').modal({backdrop: 'static'});
    };

    $scope.copyTask = function (id) {
      $scope.action = '1';
      $scope.taskData = getTaskData(id);
      $scope.taskData.task_follows.forEach(function (item) {
        item.desc = getTaskData(item.prev_task_id).desc || '该前置任务已被删除';
      });
      if ($scope.taskData.deadline == 0) {
        $scope.taskData.deadline = '';
      }
      $('#task-form').modal({backdrop: 'static'});
    };

    $scope.deleteTask = function (id) {
      if (confirm('确定删除？')) {
        $http.delete(host + 'tasks/' + id)
          .success(function () {
            getTaskList($scope.iterationId);
          });
      }
    };

    $scope.watchTask = function (id, isConcerned) {
      var url;

      if (!isConcerned) {
        url = host + 'tasks/' + id + '/concerned';
      } else {
        url = host + 'tasks/' + id + '/unconcerned';
      }

      $http.post(url, {user_id: localStorage['userId']})
        .success(function () {
          getTaskList($scope.iterationId);
        });
    };

    $scope.selectPrevTask = function (id, desc) {
      var isIn = false;

      $.each($scope.taskData.task_follows, function (i, n) {
        if (n.prev_task_id == id) {
          isIn = true;
          return false;
        }
      });

      if (!isIn) {
        $scope.taskData.task_follows.push({prev_task_id: id, desc: desc});
      }

      $scope.showTaskSelector = 0;
    };

    $scope.deletePrevTask = function (index) {
      $scope.taskData.task_follows.splice(index, 1);
    };

    $scope.taskSelectorBlur = function (e) {
      if (e.relatedTarget && e.relatedTarget.className.indexOf('list-group-item') > -1) {
      } else {
        $scope.showTaskSelector = 0;
      }
    };

    $scope.importFile = function () {
      $scope.importResult = '';
      $('#import-form').modal({backdrop: 'static'});
    };

    // 导入弹窗关闭后刷新
    $('#import-form').on('hidden.bs.modal', function (e) {
      getTaskList($scope.iterationId);
    });

    // 导入
    $('#upfile').on('change', function () {
      var fileObj = this.files[0];

      if (fileObj) {
        var xhr = new XMLHttpRequest();
        var form = new FormData();

        $scope.importResult = '';

        form.append("csv", fileObj);

        xhr.open("post", host + 'tasks/upload', true);

        xhr.onload = function(evt) {
          if (evt.srcElement.status == 200) {
            var importResult = JSON.parse(evt.srcElement.responseText);

            humane.success('正在导入......');

            if (importResult.id) {
              $http.get(host + 'tasks/upload/show/' + importResult.id)
                .success(function (result) {
                  $scope.importResult = result;
                  humane.success('导入成功');
                });
            }
          }

          $('#upfile').val('');
        };

        xhr.send(form);
      }
    });

    $scope.keywordChange = function() {
      localStorage.setItem(storageTag + 'KEYWORD', $scope.keyword);
      renderTaskList(filterByKeyword());
    };

    $scope.taskKeywordChange = function () {
      $scope.taskListSelector = $scope.rawTaskList.filter(function(task) {
        return $scope.taskKeyword == '' || task.desc.indexOf($scope.taskKeyword) > -1;
      });
      $scope.taskListSelector.sort(sortBy('story_id'));
    };

    $scope.saveAndAdd = function() {
      $scope.newFlag = true;

      $scope.save();
    };

    $scope.saveAndCopy = function() {
      $scope.copyFlag = true;

      $scope.save();
    };

    $scope.save = function() {
      var saveData;
      var method = '';
      var url = '';

      if ($scope.action == '1') {
        method = 'POST';
        url = host + 'tasks';
      } else {
        method = "PUT";
        url = host + 'tasks/' + $scope.taskData.id;
      }

      saveData = {
        user_id: $scope.taskData.user_id,
        estimated_time: $scope.taskData.estimated_time,
        story_id: $scope.taskData.story_id,
        desc: $scope.taskData.desc,
        is_new: $scope.taskData.is_new ? 1 : 0,
        is_challenging: $scope.taskData.is_challenging ? 1 : 0,
        priority: $scope.taskData.priority,
        task_status_id: $scope.action == '1' ? 10 : $scope.taskData.task_status_id,
        iteration_id: $scope.taskData.iteration_id,
        remark: $scope.taskData.remark,
        deadline: $scope.taskData.deadline ? (new Date($scope.taskData.deadline) / 1000 | 0) : 0
      };

      var prev_task_ids = [];

      $scope.taskData.task_follows.forEach(function (item) {
        prev_task_ids.push(item.prev_task_id);
      });

      if (prev_task_ids.length) {
        saveData['prev_task_ids'] = prev_task_ids;
      }

      $http({
        method: method,
        url: url,
        data: saveData
      }).success(function () {
        getTaskList($scope.iterationId);

        if ($scope.newFlag) {
          $scope.action = '1';
          $scope.taskData = {
            user_id: localStorage['userId'],
            iteration_id: $scope.iterationId,
            estimated_time: 1,
            task_follows: []
          };
          $scope.newFlag = false;
        } else if ($scope.copyFlag) {
          $scope.action = '1';
          $scope.copyFlag = false;
        } else {
          $('#task-form').modal('hide');
          $('#remark-form').modal('hide');
        }

        humane.success('保存成功')
      });
    };

    function taskDataPreprocess(data) {
      $.each(data, function (i, task) {
        // 判断是否为当前用户的任务
        var currentUserId = localStorage['userId'];
        if (currentUserId == task.user_id) {
          task.is_mine = 1;
        } else {
          task.is_mine = 0;
        }

        // 处理prev_task_id
        var ids = [];

        $.each(task.task_follows, function (i, item) {
          ids.push(item.prev_task_id);
        });
        task.prev_task_ids = ids.join(',');

        // 处理复选框
        task.is_challenging = !!task.is_challenging;
        task.is_new = !!task.is_new;

        // 处理任务描述换行
        task.desc_html = translateNewLine(task.desc);
        if (task.deadline) {
          task.desc_html = '<span class="deadline-display">[' + $filter('date')(new Date(task.deadline * 1000), 'yyyy-MM-dd') + ']</span> ' + task.desc_html;
        }
        task.desc_html = '<span class="task-id-display">[' + task.id + ']</span> ' + task.desc_html;

        // 处理任务是否被当前用户关注
        task.is_concerned = false;
        $.each(task.task_concerneds, function(i, item) {
          if (item.user_id == currentUserId) {
            task.is_concerned = true;
            return false;
          }
        });
      });

      return data;
    }

    function taskDataTransform(data) {
      var status_id = '';
      var statusObj = {};
      var transformed = [];
      var result = [];

      $.each(data, function(i, task) {
        if (task.status_id != status_id) {
          if (i != 0) {
            transformed.push(statusObj);
          }
          statusObj = {
            status_id: task.status_id,
            status_name: task.task_status.name,
            total_time: 0,
            tasks: []
          };
          status_id = task.status_id;
        }

        statusObj.tasks.push($.extend(true, {}, task));
        statusObj.total_time += task.estimated_time;

        if (i == data.length - 1) {
          transformed.push(statusObj);
        }
      });

      var existedIndex = 0;
      $.each(taskStatusList, function(i, status) {
        if (!transformed[existedIndex] || status.id != transformed[existedIndex].status_id) {
          result.push({
            status_id: status.id,
            status_name: status.name,
            total_time: 0,
            tasks: []
          });
        } else {
          result.push(transformed[existedIndex]);
          existedIndex++;
        }
      });

      return result;
    }

    function sortBy(name, minor) {
      return function (o, p) {
        var a, b;
        if (typeof o === 'object' && typeof p === 'object' && o && p) {
          a = o[name];
          b = p[name];

          if (a === b) {
            return typeof minor === 'function' ? minor(o, p) : 0;
          } else {
            return b - a;
          }
        } else {
          throw {
            name: 'sortError',
            message: 'Expected an object when sorting by ' + name
          }
        }
      }
    }

    function initSortPlugin() {
      $( ".task-item-wrapper" ).sortable({
        connectWith: ".task-item-wrapper",
        placeholder: "task-item-placeholder",
        distance: 5,
        receive: function( event, ui ) {
          var fromStatus = $(ui.sender).closest('.task-status-item').data('task-status-id');
          var toStatus = $(event.target).closest('.task-status-item').data('task-status-id');
          var statusObj = {
            task_status_id: toStatus
          };

          /*if (fromStatus == '10' && toStatus == '20') {
            statusObj.start = 1;
          }*/

          // 改变任务状态
          $http.put(host + 'tasks/' + $(ui.item).data('task-id') + '/status', statusObj)
            .success(function() {
              getTaskList($scope.iterationId);
            });
        },
        start: function (event, ui) {
          $(ui.item).addClass('task-item-sorting');
        },
        stop: function (event, ui) {
          $(ui.item).removeClass('task-item-sorting');
        }
      }).disableSelection();
    }

    function renderTaskList(data) {
      $scope.taskList = taskDataTransform(data);

      $.each($scope.taskList, function (i, item) {
        item.tasks.sort(sortBy('is_mine', sortBy('priority', sortBy('id'))));
      });

      $timeout(function () {
        initSortPlugin();
      });
    }

    function getTaskList(id) {
      var url = host + 'tasks?offset=0&size=1000';

      if ($scope.tabindex == 1) {
        url += '&iteration_id=' + id;
      } else if ($scope.tabindex == 2) {
        url += '&user_id=' + localStorage['userId'];
      }

      // 查询任务列表
      $http.get(url)
        .success(function (result) {
          var taskData;
          $scope.rawTaskList = taskDataPreprocess(result);

          // 前置任务下拉列表按故事排序，便于选择
          $scope.taskListSelector = $scope.rawTaskList.concat();
          $scope.taskListSelector.sort(sortBy('story_id'));

          taskData = $scope.rawTaskList;

          // 所有任务tab才过滤
          if ($scope.tabindex == 1) {
            taskData = filterByKeyword();
          }

          renderTaskList(taskData);
        });
    }

    function getStoryList(versionId) {
      // 查询故事列表
      $http.get(host + 'stories?version_id=' + versionId + '&offset=0&size=100')
        .success(function (result) {
          $scope.storyList = result;

          var lastStoryId = localStorage.getItem(storageTag + 'STORY_ID');

          if (lastStoryId && isValidStoryId(lastStoryId)) {
            $timeout(function () {
              $scope.storyId = lastStoryId;
            })
          } else {
            $timeout(function () {
              $scope.storyId = 'all';
            });
          }
        });
    }

    function getIterationList(id) {
      // 查询迭代列表
      $http.get(host + 'iterations?version_id=' + id + '&offset=0&size=100')
        .success(function (result) {
          $scope.iterationList = result.rows;

          if ($scope.iterationList.length) {
            var lastIterationId = localStorage.getItem(storageTag + 'ITERATION_ID');

            if (lastIterationId && isValidIterationId(lastIterationId)) {
              $timeout(function () {
                $scope.iterationId = lastIterationId;
              });
            } else {
              $timeout(function () {
                $scope.iterationId = $scope.iterationList[0].id;
              });
            }

          }
        });
    }

    function filterByKeyword() {
      if ($scope.selfId) {
        var filterIds = $scope.prevIds.concat($scope.selfId.toString());console.log(filterIds);
        return $scope.rawTaskList.filter(function (task) {
          return filterIds.indexOf(task.id.toString()) > -1;
        });
      } else {
        return $scope.rawTaskList.filter(function (task) {
          var ifMatchKeyword = $scope.keyword == '' || (task.story.title.indexOf($scope.keyword) > -1 || task.desc.indexOf($scope.keyword) > -1 || task.user.name.indexOf($scope.keyword) > -1);
          var ifMatchStoryId = $scope.storyId == 'all' || task.story_id == $scope.storyId;

          if (ifMatchKeyword && ifMatchStoryId) {
            return true;
          }
        });
      }

    }

    function getTaskData(id) {
      var taskData = {};

      $.each($scope.rawTaskList, function (i, task) {
        if (task.id == id) {
          taskData = $.extend(true, {}, task);
          return false
        }
      });

      return taskData;
    }

    function getStoryData(id) {
      var storyData = {};

      $.each($scope.storyList, function (i, story) {
        if (story.id == id) {
          storyData = $.extend(true, {}, story);
          return false;
        }
      });

      return storyData;
    }

    function isValidVersionId(versionId) {
      var valid = false;

      $.each($scope.versionList, function (i, n) {
        if (n.id == versionId) {
          valid = true;
          return false;
        }
      });

      return valid;
    }

    function isValidIterationId(iterationId) {
      var valid = false;

      $.each($scope.iterationList, function (i, n) {
        if (n.id == iterationId) {
          valid = true;
          return false;
        }
      });

      return valid;
    }

    function isValidStoryId(storyId) {
      var valid = false;

      $.each($scope.storyList, function (i, n) {
        if (n.id == storyId) {
          valid = true;
          return false;
        }
      });

      return valid;
    }

    function translateNewLine (data) {
      return data.replace(/\n/g, '<br>');
    }

    function resetPrevTaskView() {
      $scope.selfId = '';
      $scope.preIds = [];
    }
  }]);