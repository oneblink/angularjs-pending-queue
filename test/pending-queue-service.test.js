describe('pending queue service', () => {
  beforeEach(module('bmPendingQueue', 'LocalForageModule'))

  let bmPendingQueueService
  let $rootscope

  beforeEach(inject((_bmPendingQueueService_, _$localForage_, _$rootScope_) => {
    bmPendingQueueService = _bmPendingQueueService_
    $rootscope = _$rootScope_
  }))

  it('should exist', () => {
    expect(bmPendingQueueService).not.toBe(null)
  })

  it('should save the request with a uuid', () => {
    let uuid
    bmPendingQueueService.save({data: {}}).then((result) => {
      console.log(result)
      uuid = result.request.data.uuid
    })

    $rootscope.$apply()
    expect(uuid).not.toBe(undefined)
  })
})
