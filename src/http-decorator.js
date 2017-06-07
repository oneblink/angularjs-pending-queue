'use strict'

httpDecorator.$inject = ['$delegate', '$q', '$timeout', '$rootScope', 'bmPendingQueueService']
function httpDecorator($delegate, $q, $timeout, $rootScope, bmPendingQueueService) {
  const sendNextPending = response => {
    // we dont want to make the user wait for all the pending
    // queue items to be sent and processed
    $rootScope.$evalAsync(() => {
      let deferred = []
      bmPendingQueueService
        .iterate(item => {
          deferred.push($delegate(item.request))
        })
        .then(() => {
          if (!deferred.length) {
            return
          }

          $q.all(deferred)
            .then((result) => $rootScope.$broadcast('bmPendingQueueSuccess', result))
            .catch((result) => $rootScope.$broadcast('bmPendingQueueFail', result))
        })
    })

    return response
  }

  function pendingQueueHTTP(...args) {
    return $delegate.apply($delegate, args).then(sendNextPending)
  }

  // make our decorator delegate to the $http methods
  // and properties
  for (let prop in $delegate) {
    if ($delegate.hasOwnProperty(prop)) {
      if (angular.isFunction($delegate[prop])) {
        pendingQueueHTTP[prop] = (...args) => $delegate[prop].apply($delegate, args).then(sendNextPending)
      } else {
        Object.defineProperty(pendingQueueHTTP, prop, {
          get: () => $delegate[prop],
          set: val => ($delegate[prop] = val)
        })
      }
    }
  }

  // access to the original $http
  pendingQueueHTTP.$delegate = $delegate

  return pendingQueueHTTP
}

module.exports = httpDecorator
