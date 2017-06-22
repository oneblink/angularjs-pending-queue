'use strict'

describe('PENDING QUEUE INTERCEPTOR,', () => {
  let bmPendingQueueInterceptor
  let bmPendingQueueService
  let $rootScope
  let $q
  let interval

  const methods = ['POST', 'PUT']

  beforeEach(() => {
    module('bmPendingQueue', 'LocalForageModule')
    inject((_bmPendingQueueInterceptor_, _bmPendingQueueService_, _$localForage_, _$rootScope_, _$q_ ) => {
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

  describe('when a request fails, ', () => {
    describe('is not a form submission,', () => {
      beforeEach(() => {
        spyOn(bmPendingQueueService, 'setItem')
      })

      afterEach(() => {
        bmPendingQueueService.setItem.calls.reset()
      })

      it('should not save GET requests to the pending queue', (done) => {
        const httpConfig = { config: { method: 'GET', headers: {} } }

        bmPendingQueueInterceptor.requestError(httpConfig)
          .then(done.fail)
          .catch((result) => {
            expect(bmPendingQueueService.setItem).not.toHaveBeenCalled()
            expect(result).toBe(httpConfig)
          })
          .then(done)
      })

      methods.forEach((method) => {
        it(`should not save ${method}s that are not json or form encoded requests to the pending queue`, (done) => {
          const httpConfig = {
              config: {
              method,
              headers: { 'Content-Type': 'text/html' }
            }
          }

          bmPendingQueueInterceptor.requestError(httpConfig)
            .then(done.fail)
            .catch((result) => {
              expect(bmPendingQueueService.setItem).not.toHaveBeenCalled()
              expect(result).toBe(httpConfig)
            })
            .then(done)
        })
      })
    })

    describe('is a form submission,', () => {
      beforeEach(() => {
        spyOn(bmPendingQueueService, 'setItem').and.returnValue($q.resolve())
        spyOn(bmPendingQueueService, 'setResponse').and.returnValue($q.resolve())
      })

      afterEach(() => {
        bmPendingQueueService.setItem.calls.reset()
        bmPendingQueueService.setResponse.calls.reset()
      })

      methods.forEach((method) => {
        describe(`for ${method} requests,`, () => {
          it('should save form data', (done) => {
            const httpConfig = {
              config: {
                method: method,
                headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
                data: {
                  _uuid: 'abcd'
                }
              }
            }

            bmPendingQueueInterceptor.requestError(httpConfig)
              .then(done.fail)
              .catch((result) => {
                expect(bmPendingQueueService.setItem).toHaveBeenCalled()
                expect(result).toBe(httpConfig)
              })
              .then(done)
          })

          it('should save JSON', (done) => {
            const httpConfig = {
              config: {
                method: method,
                headers: { 'Content-Type': 'application/json' },
                data: {
                  _uuid: 'abcd'
                }
              }
            }

            bmPendingQueueInterceptor.requestError(httpConfig)
              .then(done.fail)
              .catch((result) => {
                expect(bmPendingQueueService.setItem).toHaveBeenCalled()
                expect(result).toBe(httpConfig)
              })
              .then(done)
          })
        })
      })
    })
  })

  describe('when a response', () => {
    describe('is a form submission,', () => {
      describe('and was successfully submitted', () => {
        beforeEach(() => {
          spyOn(bmPendingQueueService, 'setItem').and.returnValue($q.resolve())
          spyOn(bmPendingQueueService, 'removeItem').and.returnValue($q.resolve())
        })

        afterEach(() => {
          bmPendingQueueService.removeItem.calls.reset()
          bmPendingQueueService.setItem.calls.reset()
        })

        it('should remove the item from the pending queue', (done) => {
          const response = {
            status: 200,
            statusText: '200 OK',
            config: {
              data: { _uuid: 'uuid' },
              method: 'POST',
              headers: { 'Content-Type': 'application/json' }
            },
            data: 'data returned from server'
          }

          bmPendingQueueInterceptor.response(response)
            .then(() => expect(bmPendingQueueService.removeItem).toHaveBeenCalledWith('uuid'))
            .then(done)
            .catch(done.fail)
        })
      })

      describe('and has a status code not between 200 and 299', () => {
        const response = {
          status: 400,
          statusText: '400 DERP!',
          config: {
            data: { _uuid: 'uuid' },
            method: 'POST',
            headers: { 'Content-Type': 'application/json' }
          },
          data: 'data returned from server'
        }

        beforeEach(() => {
          spyOn(bmPendingQueueService, 'removeItem')
          spyOn(bmPendingQueueService, 'setResponse').and.returnValue($q.resolve(response))
        })

        afterEach(() => {
          bmPendingQueueService.removeItem.calls.reset()
          bmPendingQueueService.setResponse.calls.reset()
        })

        it('should append the response to the item in the pending queue', done => {
          const expectedUpdateData = {
            data: response.data,
            status: response.status,
            statusText: response.statusText
          }

          bmPendingQueueInterceptor.responseError(response)
            .then((result) => {
              expect(bmPendingQueueService.removeItem).not.toHaveBeenCalled()
              expect(bmPendingQueueService.setResponse).toHaveBeenCalledWith(response.config.data._uuid, expectedUpdateData)
              expect(result).toBe(response)
            })
            .then(done.fail)
            .catch(done)
        })
      })
    })
  })
})
