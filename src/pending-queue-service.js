'use strict'

pendingQueueService.$inject = ['$localForage', 'uuidService']
function pendingQueueService ($localForage, uuidService) {
  this.save = function saveToPendingQueue (requestConfig) {
    const uuid = requestConfig.data._uuid || uuidService()
    requestConfig.data._uuid = uuid // make sure that the _uuid prop exists
    const data = {
      request: requestConfig,
      dateCreated: (new Date()).getTime()
    }

    return $localForage.setItem(uuid, data)
  }

  this.get = function getFromPendingQueue (uuid) {
    return $localForage.getItem(uuid)
  }

  this.getEarliest = function () {
    let currDate = (new Date()).getTime()
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

  this.remove = function removeFromPendingQueue (uuid) {
    return $localForage.pull(uuid)
  }

  this.clear = function clearPendingQueue () {
    return $localForage.clear()
  }

  this.setResponse = function setResponseOnItem (uuid, response) {
    return this.get(uuid).then((data) => {
      data.response = response
      return data
    })
  }
}

module.exports = pendingQueueService
