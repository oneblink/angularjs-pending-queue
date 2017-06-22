'use strict'

describe('PENDING QUEUE SERVICE', () => {
  let bmPendingQueueService
  let $rootScope
  let $q
  let interval

  beforeEach(() => {
    module('bmPendingQueue', 'LocalForageModule')
    inject((_bmPendingQueueService_, _$localForage_, _$rootScope_, _$q_) => {
      bmPendingQueueService = _bmPendingQueueService_
      $rootScope = _$rootScope_
      $q = _$q_
    })
    interval = triggerDigests($rootScope)
  })

  afterEach(() => {
    stopDigests(interval)
  })

  it('should exist', () => {
    expect(bmPendingQueueService).not.toBe(null)
  })

  it('should save the request with a uuid', done => {
    let uuid

    bmPendingQueueService
      .setItem({ data: {} })
      .then(result => {
        uuid = result.request.data._uuid
        expect(uuid).not.toBe(undefined)
        expect(
          /[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}/.test(
            uuid
          )
        ).toBe(true)

        return bmPendingQueueService.clear()
      })
      .then(done)
      .catch(done.fail)
  })

  describe('a pending queue with items in it', () => {
    let uuids

    beforeEach(function(done) {
      uuids = []
      const save = (memo, val) => {
        return memo.then(() =>
          bmPendingQueueService
            .setItem({ data: { id: val } })
            .then(data => uuids.push(data.request.data._uuid))
        )
      }

      [1, 2, 3, 4, 5].reduce(save, $q.resolve()).then(done).catch(done.fail)
    })

    afterEach(function(done) {
      bmPendingQueueService.clear().then(done).catch(done.fail)
    })

    it('should have 5 uuids', () => {
      expect(uuids.length).toBe(5)
    })

    // it appears that the "earliest" entry is sometimes
    // not the first one submitted to local forage due
    // (i think) to $q being tied to the digest cycle.
    // this may or may not be because we're in a unit test and
    // are manually running the digest cycle
    it('should get the earliest entry', done => {
      bmPendingQueueService
        .getEarliest()
        .then(result => {
          expect(result).not.toBe(undefined)
          expect(result.request.data.id).toBe(1)
        })
        .then(done)
        .catch(done.fail)
    })

    it('should return the correct entry', done => {
      const expectedUUID = uuids[0]
      const expectedId = 1
      bmPendingQueueService
        .getItem(expectedUUID)
        .then(result => {
          expect(result).not.toBe(undefined)
          expect(result.request.data._uuid).toBe(expectedUUID)
          expect(result.request.data.id).toBe(expectedId)
        })
        .then(done)
        .catch(done.fail)
    })

    it('should return `null` if entry is not in the pending queue', done => {
      bmPendingQueueService
        .getItem('doesnt exist')
        .then((result) => expect(result).toBeNull())
        .then(done)
        .catch(done.fail)
    })

    it('should remove the item from the pending queue', done => {
      const expectedUUID = uuids[0]
      const expectedId = 1
      bmPendingQueueService
        .removeItem(expectedUUID)
        .then((result) => {
          expect(result).not.toBe(undefined)
          expect(result.request.data._uuid).toBe(expectedUUID)
          expect(result.request.data.id).toBe(expectedId)
        })
        .then(() => bmPendingQueueService.getItem(expectedUUID))
        .then(result => expect(result).toBeNull())
        .then(done)
        .catch(done.fail)
    })

    it('should return null when removing a uuid that doesnt exist', done => {
      bmPendingQueueService
        .removeItem('doesnt exist')
        .then((result) => expect(result).toBeNull())
        .then(done)
        .catch(done.fail)
    })

    it('should update the response part of an entry', done => {
      const expectedUUID = uuids[0]
      const expectedId = 1
      const expectedResponse = 'new response'
      bmPendingQueueService
        .getItem(expectedUUID)
        .then((result) => {
          expect(result).not.toBe(undefined)
          expect(result.request.data._uuid).toBe(expectedUUID)
          expect(result.request.data.id).toBe(expectedId)

          return bmPendingQueueService.setResponse(expectedUUID, expectedResponse)
        })
        .then(() => bmPendingQueueService.getItem(expectedUUID))
        .then((result) => {
          expect(result).not.toBeNull()
          expect(result.response).toBe(expectedResponse)
        })
        .then(done)
        .catch(done.fail)
    })

    it('should update an entry if the same uuid is used', done => {
      const uuid = uuids[0]
      const config = { data: { foo: 'bar', _uuid: uuid } }

      bmPendingQueueService
        .setItem(config)
        .then((savedItem) => {
          expect(savedItem.request.data).toEqual(config.data)
        })
        .then(done)
        .catch(done.fail)
    })
  })
})
