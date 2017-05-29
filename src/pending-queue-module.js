'use strict'

const uuidService = require('./uuid-service.js')
const pendingQueueService = require('./pending-queue-service.js')

angular.module('bmPendingQueue', ['LocalForageModule'])
  .constant('dbName', 'bmOfflineStorage')
  .constant('pendingQueueTable', 'pendingQueue')
  .config(['$localForageProvider', 'dbName', 'pendingQueueTable',
    function ($localForageProvider, dbName, pendingQueueTable) {
      $localForageProvider.config({
        name: dbName,
        storeName: pendingQueueTable,
        description: 'Blink Mobile Technologies Forms Pending Queue'
      })
    }])
  .service('uuidService', uuidService)
  .service('bmPendingQueueService', pendingQueueService)
