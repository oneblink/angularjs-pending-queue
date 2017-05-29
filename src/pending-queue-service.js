'use strict'

pendingQueueService.$inject = ['$localForage', 'uuidService']
function pendingQueueService ($localForage, uuidService) {
  this.save = function saveToPendingQueue (requestConfig) {
    const uuid = requestConfig.data._uuid || uuidService()
    requestConfig.data._uuid = uuid // make sure that the _uuid prop exists
    const data = {
      request: requestConfig,
      dateCreated: (new Date())
    }

    return $localForage.setItem(uuid, data)
  }

  this.get = function getFromPendingQueue (uuid) {
    return $localForage.getItem(uuid)
  }

  this.getNext = function () {
    return $localForage.key(0)
    // return $localForage.length().then((l) => $localForage.key(l - 1))
  }

  this.remove = function removeFromPendingQueue (uuid) {
    return $localForage.pull(uuid)
  }

  this.setResponse = function setResponseOnItem (uuid, response) {
    return this.get(uuid).then((data) => {
      data.response = response
      return data
    })
  }
}

module.exports = pendingQueueService
