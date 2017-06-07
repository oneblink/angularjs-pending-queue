'use strict'

pendingQueueInteceptor.$inject = ['$window', '$q', 'bmPendingQueueService']
function pendingQueueInteceptor($window, $q, bmPendingQueueService) {
  const isPOSTorPUT = method => ['POST', 'PUT'].indexOf(method) > -1
  const isFormData = (contentType) => contentType.toLowerCase().indexOf('application/x-www-form-urlencoded') > -1
  const isJSONData = (contentType) => contentType.toLowerCase().indexOf('json') > -1

  const isForm = (config) => isPOSTorPUT(config.method.toUpperCase()) &&
                             (isFormData(config.headers['Content-Type']) || isJSONData(config.headers['Content-Type']))

  return {
    // request errors are thrown when the server name cant be resolved or if you are offline
    // as well as when another interceptor rejects the request
    requestError: function PendingQueueRequestError(rejection) {
      if (rejection.config && isForm(rejection.config)) {
        const cleanedResponse = {
          data: rejection.data,
          status: rejection.status,
          statusText: rejection.statusText || (!$window.navigator.onLine ? 'offline' : 'unknown')
        }

        return bmPendingQueueService
          .save(rejection.config)
          .then(() => bmPendingQueueService.setResponse(rejection.config.data._uuid, cleanedResponse))
          .then(() => $q.reject(rejection))
      }

      return $q.reject(rejection)
    },

    response: function PendingQueueResponse (response) {
      if (!response.config || !isForm(response.config) || !response.config.data._uuid) {
        return response
      }

      return bmPendingQueueService.remove(response.config.data._uuid).then(() => response)
    },

    responseError: function PendingQueueResponseError(rejection) {
      if (rejection.config && isForm(rejection.config)) {
        const cleanedResponse = {
          data: rejection.data,
          status: rejection.status,
          statusText: rejection.statusText
        }

        return bmPendingQueueService
          .save(rejection.config)
          .then(() => bmPendingQueueService.setResponse(rejection.config.data._uuid, cleanedResponse))
          .then(() => $q.reject(rejection))
      }

      return $q.reject(rejection)
    }
  }
}

module.exports = pendingQueueInteceptor
