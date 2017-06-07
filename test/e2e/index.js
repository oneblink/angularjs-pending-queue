'use strict'

const app = angular.module('app', ['bmPendingQueue'])

app.controller('testCtrl', ['$http', '$scope', '$timeout', '$log', 'bmPendingQueueService',
  function($http, $scope, $timeout, $log, bmPendingQueueService) {
    const $ctrl = this
    $ctrl.model = {}

    $ctrl.submit = function(form) {
      if (form.offline) {
        return $http.post('http://offline', form, {
          headers: { 'Content-Type': 'application/json' }
        })
      }
      $http.post('/test', form, {headers: { 'Content-Type': 'application/json' }})
        .catch(err => $log.log(err))

      $ctrl.model = {}
    }

    $ctrl.pendingQueueItemClick = function(item) {
      $ctrl.model = item
    }

    $ctrl.clearPendingQueue = function() {
      return bmPendingQueueService.clear()
    }
  }
])
