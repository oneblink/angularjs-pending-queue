'use strict'

describe('$HTTP DECORATOR', () => {
  let $http
  let $httpBackend
  let bmPendingQueueService
  let $rootScope
  let $q
  let interval

  beforeEach(() => {
    module('bmPendingQueue', 'LocalForageModule')
    inject((_$http_, _$httpBackend_, _$timeout_, _bmPendingQueueService_, _$localForage_, _$rootScope_, _$q_ ) => {
      $rootScope = _$rootScope_
      $q = _$q_
      $http = _$http_
      $httpBackend = _$httpBackend_
      bmPendingQueueService = _bmPendingQueueService_
    })
    interval = triggerDigests($rootScope)
  })

  afterEach(() => {
    stopDigests(interval)
  })

  it('should exist', () => {
    expect($http).not.toBeFalsy()
  })

  it('should be a function', () => {
    expect(angular.isFunction($http)).toBe(true)
  })

  it('should have all the properties of the originial $http', () => {
    const origHttp = $http.$delegate
    expect(origHttp).not.toBeFalsy()
    for (let prop in origHttp) {
      expect($http[prop]).not.toBeFalsy()
    }
  })

  describe('when there are no items in the pending queue', () => {
    let listeners

    beforeEach(done => {
      bmPendingQueueService.clear().then(done).catch(done.fail)
    })

    afterEach(() => {
      listeners.forEach(f => f())
      $httpBackend.verifyNoOutstandingExpectation(false)
      $httpBackend.resetExpectations()
    })

    xit('should not broadcast either event', done => {
      listeners = [
        $rootScope.$on('bmPendingQueueSuccess', () =>
          fail('bmPendingQueueSuccess should not of been broadcast')
        ),
        $rootScope.$on('bmPendingQueueFail', () =>
          fail('bmPendingQueueSuccess should not of been broadcast')
        )
      ]
      $httpBackend.expectGET('test/').respond(200, {}, {}, '200 OK')
      $http({ method: 'GET', url: 'test/' }).then(done).catch(done.fail)
    })
  })

  describe('when there are items in the pending queue', () => {
    let listeners
    let uuids

    beforeEach(done => {
      uuids = []
      const save = (memo, val) => {
        return memo.then(() =>
          bmPendingQueueService
            .save({ data: { id: val }, url: '/test', method: 'POST' })
            .then(data => uuids.push(data.request.data._uuid))
        )
      }

      [1, 2, 3, 4, 5].reduce(save, $q.resolve()).then(done).catch(done.fail)
    })

    afterEach(() => {
      listeners.forEach(f => f())
      $httpBackend.verifyNoOutstandingExpectation(false)
      $httpBackend.resetExpectations()
    })

    xit('should send the queued items', done => {
      let l = uuids.length
      const d = () => (l ? (l = --l) : done())
      listeners = [
        $rootScope.$on('bmPendingQueueSuccess', () => d()),
        $rootScope.$on('bmPendingQueueFail', () =>
          fail('bmPendingQueueSuccess should not of been broadcast')
        )
      ]
      $httpBackend.expectPOST('test/').respond((method, url, data, headers) => {
        return [200, data, headers, '200 OK']
      })
      $http({method: 'POST', url: 'test/'})
    })
  })
})
