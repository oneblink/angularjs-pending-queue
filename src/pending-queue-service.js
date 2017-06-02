'use strict'

pendingQueueService.$inject = ['$q', '$localForage', 'uuidService']
function pendingQueueService ($q, $localForage, uuidService) {
  this.save = function saveToPendingQueue ({url, data, headers, params, method }) {
    const uuid = data._uuid || uuidService()
    data._uuid = uuid // make sure that the _uuid prop exists

    return $localForage.setItem(uuid, {
      request: {url, data, headers, params, method},
      dateCreated: (new Date()).getTime()
    })
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
    }).then((data) => $localForage.setItem(uuid, data))
  }

  this.iterate = function iterate (iter) {
    return $localForage.iterate(iter)
  }

  this.length = function () {
    return $localForage.length()
  }
}

module.exports = pendingQueueService
