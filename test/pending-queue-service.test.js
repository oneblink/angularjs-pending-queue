'use strict'

const triggerDigests = function($rootScope) {
  return setInterval(function() {
    $rootScope.$apply();
  }, 10)
}
const stopDigests = function(interval) {
  window.clearInterval(interval);
}

describe('pending queue service', () => {
  let bmPendingQueueService
  let $rootScope
  let $q

  beforeEach(() => {
    module('bmPendingQueue', 'LocalForageModule')
    inject((_bmPendingQueueService_, _$localForage_, _$rootScope_, _$q_) => {
      bmPendingQueueService = _bmPendingQueueService_
      $rootScope = _$rootScope_
      $q = _$q_
    })
  })

  it('should exist', () => {
    expect(bmPendingQueueService).not.toBe(null)
  })

  it('should save the request with a uuid', (done) => {
    let uuid
    const interval = triggerDigests($rootScope)

    bmPendingQueueService.save({data: {}}).then((result) => {
      uuid = result.request.data._uuid
      expect(uuid).not.toBe(undefined)
      expect(/[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}/.test(uuid)).toBe(true)

      return bmPendingQueueService.clear()
    }).then(() => {
      stopDigests(interval)
      done()
    }).catch((e) => {
      stopDigests(interval)
      done.fail(e)
    })
  })

  describe('a pending queue with items in it', () => {
    let uuids

    beforeEach(function (done) {
      uuids = []
      const interval = triggerDigests($rootScope)
      const save = (memo, val) => {
        return memo.then(() => bmPendingQueueService.save({data: {id: val}})
                                .then((data) => uuids.push(data.request.data._uuid)))
      }

      [1, 2, 3, 4, 5].reduce(save, $q.resolve())
        .then(() => {
          stopDigests(interval)
          done()
        }).catch((e) => {
          stopDigests(interval)
          done.fail(e)
        })
    })

    afterEach(function (done) {
      const interval = triggerDigests($rootScope)
      bmPendingQueueService.clear()
        .then(() => {
          stopDigests(interval)
          done()
        }).catch((e) => {
          stopDigests(interval)
          done.fail(e)
        })
    })

    it('should have 5 uuids', () => {
      expect(uuids.length).toBe(5)
    })

    // it appears that the "earliest" entry is sometimes
    // not the first one submitted to local forage due
    // (i think) to $q being tied to the digest cycle.
    // this may or may not be because we're in a unit test and
    // are manually running the digest cycle
    it('should get the earliest entry', (done) => {
      const interval = triggerDigests($rootScope)
      bmPendingQueueService.getEarliest().then((result) => {
        expect(result).not.toBe(undefined)
        expect(result.request.data.id).toBe(1)

      }).then(() => {
        stopDigests(interval)
        done()
      }).catch((e) => {
        stopDigests(interval)
        done.fail(e)
      })
    })

    it('should return the correct entry', (done) => {
      const interval = triggerDigests($rootScope)
      const expectedUUID = uuids[0]
      const expectedId = 1
      bmPendingQueueService.get(expectedUUID)
        .then((result) => {
          expect(result).not.toBe(undefined)
          expect(result.request.data._uuid).toBe(expectedUUID)
          expect(result.request.data.id).toBe(expectedId)
          stopDigests(interval)
          done()
        }).catch((e) => {
        stopDigests(interval)
        done.fail(e)
      })
    })

    it('should return `null` if entry is not in the pending queue', (done) => {
      const interval = triggerDigests($rootScope)
      bmPendingQueueService.get('doesnt exist')
        .then((result) => {
          expect(result).toBeNull()
          stopDigests(interval)
          done()
        }).catch((e) => {
          stopDigests(interval)
          done.fail(e)
        })
    })

    it('should remove the item from the pending queue', (done) => {
      const interval = triggerDigests($rootScope)
      const expectedUUID = uuids[0]
      const expectedId = 1
      bmPendingQueueService.remove(expectedUUID)
        .then((result) => {
          expect(result).not.toBe(undefined)
          expect(result.request.data._uuid).toBe(expectedUUID)
          expect(result.request.data.id).toBe(expectedId)
        }).then(() => bmPendingQueueService.get(expectedUUID))
        .then((result) => {
          expect(result).toBeNull()
        })
        .then(() => {
          stopDigests(interval)
          done()
        })
        .catch((e) => {
        stopDigests(interval)
        done.fail(e)
      })
    })

    it('should return null when removing a uuid that doesnt exist', (done) => {
      const interval = triggerDigests($rootScope)
      bmPendingQueueService.remove('doesnt exist')
        .then((result) => {
          expect(result).toBeNull()
          stopDigests(interval)
          done()
        }).catch((e) => {
          stopDigests(interval)
          done.fail(e)
        })
    })

    it('should update the response part of an entry', (done) => {
      const interval = triggerDigests($rootScope)
      const expectedUUID = uuids[0]
      const expectedId = 1
      const expectedResponse = 'new response'
      bmPendingQueueService.get(expectedUUID)
        .then((result) => {
          expect(result).not.toBe(undefined)
          expect(result.request.data._uuid).toBe(expectedUUID)
          expect(result.request.data.id).toBe(expectedId)

          return bmPendingQueueService.setResponse(expectedUUID, expectedResponse)
        }).then((result) => {
          expect(result).not.toBeNull()
          expect(result.response).toBe(expectedResponse)
        }).then(() => {
          stopDigests(interval)
          done()
        }).catch((e) => {
          stopDigests(interval)
          done.fail(e)
        })
    })
  })
})
