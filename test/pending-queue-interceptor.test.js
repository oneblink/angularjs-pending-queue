'use strict'

describe('pending queue interceptor,', () => {
  let bmPendingQueueInterceptor
  let bmPendingQueueService
  let $rootScope
  let $q
  let interval

  beforeEach(() => {
    module('bmPendingQueue', 'LocalForageModule')
    inject((_bmPendingQueueInterceptor_, _bmPendingQueueService_, _$localForage_, _$rootScope_, _$q_) => {
      bmPendingQueueInterceptor = _bmPendingQueueInterceptor_
      $rootScope = _$rootScope_
      $q = _$q_
      bmPendingQueueService = _bmPendingQueueService_
    })
    interval = triggerDigests($rootScope)
  })

  afterEach(() => {
    stopDigests(interval)
  })

  it('should exist', () => {
    expect(bmPendingQueueInterceptor).not.toBeFalsy()
  })

  describe('when a request', () => {
    describe('is not a form submission,', () => {
      beforeEach(() => {
        spyOn(bmPendingQueueService, 'save')
      })

      afterEach(() => {
        bmPendingQueueService.save.calls.reset()
      })

      it('should not save GET requests to the pending queue', () => {
        const httpConfig = {method: 'GET', headers: {}}

        const result = bmPendingQueueInterceptor.request(httpConfig)
        expect(bmPendingQueueService.save).not.toHaveBeenCalled()
        expect(result).toBe(httpConfig)
      })

      ;['POST', 'PUT'].forEach((method) => {
        it(`should not save ${method}s that are not json or form encoded requests to the pending queue`, () => {
          const httpConfig = {method, headers: {'Content-Type': 'text/html'}}

          const result = bmPendingQueueInterceptor.request(httpConfig)
          expect(bmPendingQueueService.save).not.toHaveBeenCalled()
          expect(result).toBe(httpConfig)
        })
      })
    })

    describe('is a form submission,', () => {
      beforeEach(() => {
        spyOn(bmPendingQueueService, 'save').and.returnValue($q.resolve())
      })

      afterEach(() => {
        bmPendingQueueService.save.calls.reset()
      })

      ;['POST', 'PUT'].forEach((method) => {
        describe(`for ${method} requests,`, () => {
          it('should save form data', (done) => {
            const httpConfig = {method: method, headers: {'Content-Type': 'application/x-www-form-urlencoded'}}

            const result = bmPendingQueueInterceptor.request(httpConfig)
            expect(bmPendingQueueService.save).toHaveBeenCalled()
            result.then((result) => expect(result).toBe(httpConfig))
              .then(done)
              .catch(done.fail)
          })

          it('should save JSON', (done) => {
            const httpConfig = {method: method, headers: {'Content-Type': 'application/json'}}

            const result = bmPendingQueueInterceptor.request(httpConfig)
            expect(bmPendingQueueService.save).toHaveBeenCalled()
            result.then((result) => expect(result).toBe(httpConfig))
              .then(done)
              .catch(done.fail)
          })
        })
      })
    })
  })

  describe('when a response', () => {
    describe('is not a form submission,', () => {
      beforeEach(() => {
        spyOn(bmPendingQueueService, 'remove')
        spyOn(bmPendingQueueService, 'setResponse')
      })

      afterEach(() => {
        bmPendingQueueService.remove.calls.reset()
        bmPendingQueueService.setResponse.calls.reset()
      })

      it('should not try and remove it from the pending queue', () => {
        const response = {
          config: {method: 'GET', headers: {}},
          status: 200
        }
        const result = bmPendingQueueInterceptor.response(response)
        expect(bmPendingQueueService.remove).not.toHaveBeenCalled()
        expect(bmPendingQueueService.setResponse).not.toHaveBeenCalled()
        expect(result).toBe(response)
      })
    })

    describe('is a form submission,', () => {
      describe('and has a status code between 200 and 299', () => {
        const response = {
          status: 200,
          statusText: '200 OK',
          config: {
            data: {_uuid: 'uuid'},
            method: 'POST',
            headers: {'Content-Type': 'application/json'}
          }
        }

        beforeEach(() => {
          spyOn(bmPendingQueueService, 'remove').and.returnValue($q.resolve(response))
          spyOn(bmPendingQueueService, 'setResponse')
        })

        afterEach(() => {
          bmPendingQueueService.remove.calls.reset()
          bmPendingQueueService.setResponse.calls.reset()
        })

        it('should remove a successful submit', (done) => {
          const result = bmPendingQueueInterceptor.response(response)
          expect(bmPendingQueueService.remove).toHaveBeenCalled()
          expect(bmPendingQueueService.setResponse).not.toHaveBeenCalled()
          result.then((result) => expect(result).toBe(response))
            .then(done)
            .catch(done.fail)
        })
      })

      describe('and has a status code not between 200 and 299', () => {
        const response = {
          status: 400,
          statusText: '400 DERP!',
          config: {
            data: {_uuid: 'uuid'},
            method: 'POST',
            headers: {'Content-Type': 'application/json'}
          },
          data: 'data returned from server'
        }

        beforeEach(() => {
          spyOn(bmPendingQueueService, 'remove')
          spyOn(bmPendingQueueService, 'setResponse').and.returnValue($q.resolve(response))
        })

        afterEach(() => {
          bmPendingQueueService.remove.calls.reset()
          bmPendingQueueService.setResponse.calls.reset()
        })

        it('should append the response to the item in the pending queue', (done) => {
          const expectedUpdateData = {
            data: response.data,
            status: response.status,
            statusText: response.statusText
          }
          const result = bmPendingQueueInterceptor.response(response)
          expect(bmPendingQueueService.remove).not.toHaveBeenCalled()
          expect(bmPendingQueueService.setResponse).toHaveBeenCalledWith(response.config.data._uuid, expectedUpdateData)
          result.then((result) => expect(result).toBe(response))
            .then(done)
            .catch(done.fail)
        })
      })
    })
  })
})
