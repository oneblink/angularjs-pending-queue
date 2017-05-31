'use strict'

const app = angular.module('app', ['bmPendingQueue'])

app.controller('testCtrl', ['$http', function ($http) {
  this.model = {}

  this.submit = function (form) {
    $http.post('/test', form)
  }
}])
