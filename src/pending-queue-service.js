'use strict'

pendingQueueService.$inject = ['$rootScope', '$q', '$localForage', 'uuidService']
function pendingQueueService($rootScope, $q, $localForage, uuidService) {
  this.setItem = function saveToPendingQueue({url, data, headers, params, method}) {
    const uuid = data._uuid || uuidService()
    data._uuid = uuid // make sure that the _uuid prop exists

    return $localForage
      .setItem(uuid, {
        request: {url, data, headers, params, method},
        dateCreated: new Date().getTime()
      })
      .then((item) => {
        $rootScope.$broadcast('bmPendingQueueAdd', item)
        return item
      })
  }

  this.getItem = function getFromPendingQueue(uuid) {
    return $localForage.getItem(uuid)
  }

  this.getEarliest = function getEarliest() {
    let currDate = new Date().getTime()
    let oldestForm

    return $localForage.length().then((count) => {
      return $localForage.iterate((form, key, loopCount) => {
        if (form.dateCreated < currDate) {
          currDate = form.dateCreated
          oldestForm = form
        }

        if (loopCount >= count) {
          return oldestForm
        }
      })
    })
  }

  this.removeItem = function removeFromPendingQueue(uuid) {
    return $localForage.pull(uuid).then(result => {
      $rootScope.$broadcast('bmPendingQueueRemove', result)
      return result
    })
  }

  this.clear = function clearPendingQueue() {
    return $localForage.clear().then(result => {
      $rootScope.$broadcast('bmPendingQueueRemove', result)
      return result
    })
  }

  this.setResponse = function setResponseOnItem(uuid, response) {
    return this.getItem(uuid)
      .then((data) => {
        data.response = response
        $rootScope.$broadcast('bmPendingQueueItemUpdate', data)
        return data
      })
      .then((data) => $localForage.setItem(uuid, data))
  }

  this.iterate = function iterate(iter) {
    return $localForage.iterate(iter)
  }

  this.length = function length() {
    return $localForage.length()
  }
}

module.exports = pendingQueueService
