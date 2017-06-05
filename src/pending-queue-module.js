'use strict'

const uuidService = require('./uuid-service.js')
const pendingQueueService = require('./pending-queue-service.js')
const pendingQueueInterceptor = require('./pending-queue-interceptor.js')
const $httpDecorator = require('./http-decorator.js')
const queueListComponent = require('./queue-list-component/pending-queue-list-controller.js')

angular.module('bmPendingQueue', ['LocalForageModule'])
  .constant('dbName', 'bmOfflineStorage')
  .constant('pendingQueueTable', 'pendingQueue')
  .config(['$httpProvider', '$localForageProvider', 'dbName', 'pendingQueueTable',
    function ($httpProvider, $localForageProvider, dbName, pendingQueueTable) {
      $localForageProvider.config({
        name: dbName,
        storeName: pendingQueueTable,
        description: 'Blink Mobile Technologies Forms Pending Queue'
      })

      $httpProvider.interceptors.push('bmPendingQueueInterceptor')
    }])
  .decorator('$http', $httpDecorator)
  .factory('bmPendingQueueInterceptor', pendingQueueInterceptor)
  .service('uuidService', uuidService)
  .service('bmPendingQueueService', pendingQueueService)
  .component('pendingQueueList', queueListComponent)
