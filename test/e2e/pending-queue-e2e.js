'use strict'

const pendingQueueDev = angular.module('pendingQueueDev', ['app', 'ngMockE2E'])

pendingQueueDev.run(($httpBackend, $q) => {
  $httpBackend.whenPOST('/test').respond((m, u, d) => {
    const data = angular.fromJson(d)
    if (data.invalid) {
      return [400, data, {}, 'DERP!']
    }

    return [200, data, {}]
  })

  $httpBackend.whenPOST('/test-timeout').respond(function () {
    const p = $q.defer()
    setTimeout(() => {
      p.resolve([499, null, {}])
    }, 1000)

    return p.promise
  })
})
