'use strict'

pendingQueueInteceptor.$inject = ['$q', 'bmPendingQueueService']
function pendingQueueInteceptor ($q, bmPendingQueueService) {
  const isPOSTorPUT = (method) => ['POST', 'PUT'].indexOf(method) > -1
  const isFormData = (contentType) => contentType.toLowerCase().indexOf('application/x-www-form-urlencoded') > -1
  const isJSONData = (contentType) => contentType.toLowerCase().indexOf('json') > -1

  const isForm = (config) => isPOSTorPUT(config.method.toUpperCase())
                              && (isFormData(config.headers['Content-Type']) || isJSONData(config.headers['Content-Type']))

  return {
    request: function (config) {
      // need to verify that we are dealing with a form, oitherwise we will try and store any http request
      if (isForm(config)) {
        return bmPendingQueueService.save(config)
          .then(() => config)
      }

      return config
    },

    response: function (response) {
      if (isForm(response.config)) {
        return bmPendingQueueService.remove(response.config.data._uuid)
          .then(() => response)
      }

      return response
    },

    responseError: function (rejection) {
      if (isForm(rejection.config)) {
        const cleanedResponse = {
          data: rejection.data,
          status: rejection.status,
          statusText: rejection.statusText
        }

        return bmPendingQueueService.setResponse(rejection.config.data._uuid, cleanedResponse)
          .then(() => $q.reject(rejection))
      }

      return $q.reject(rejection)
    }
  }
}

module.exports = pendingQueueInteceptor
