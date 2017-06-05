'use strict'

const app = angular.module('app', ['bmPendingQueue'])

app.controller('testCtrl', ['$http', '$scope', 'bmPendingQueueService', function ($http, $scope, bmPendingQueueService) {
  this.model = {}

  $scope.$on('bmPendingQueueFail', (evt, data) => console.log('i got a fail: ' + evt, data))
  $scope.$on('bmPendingQueueSuccess', (evt, forms) => console.log('great success!', forms))
  this.submit = function (form) {
    form._uuid = null
    if (form.timeout) {
      return $http.post('/test-timeout', form, {headers: {'Content-Type': 'application/json'}, timeout: 1})
        .catch((err) => console.log(err))
    }
    $http.post('/test', form, {headers: {'Content-Type': 'application/json'}})
      .catch((err) => console.log(err))
  }

  $scope.pendingQueueItemClick = function (item) {
    bmPendingQueueService.remove(item._uuid)
  }
}])
