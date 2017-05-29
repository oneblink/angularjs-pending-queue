'use strict'

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
      }

      return config
    },

    response: function (response) {
      if (isForm(response.config)) {
        if (status >= 200 && status < 300) {
          return bmPendingQueueService.remove(response.config.data._uuid).then(() => response)
        }
        const cleanedResponse = {
          data: response.data,
          status: response.status,
          statusText: response.statusText
        }

        return bmPendingQueueService.setResponseOnItem(response.config.data._uuid, cleanedResponse)
          .then(() => response)
      }

      return response
    }
  }
}

module.exports = pendingQueueInteceptor
