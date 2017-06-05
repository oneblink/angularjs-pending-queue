'use strict'

PendingQueueListController.$inject = ['$rootScope', '$q', 'bmPendingQueueService']
function PendingQueueListController ($rootScope, $q, bmPendingQueueService) {
  const $ctrl = this
  $ctrl.gettingPending = false
  $ctrl.pendingQueue = []

  $ctrl.selectItem = function (item) {
    $ctrl.onClick && $ctrl.onClick({item})
  }

  $ctrl.removeItem = function (item) {
    return bmPendingQueueService.remove(item).then($ctrl.queue)
  }

  $ctrl.queue = function () {
    if ($ctrl.gettingPending) {
      return $q.resolve()
    }

    $ctrl.pendingQueue.length = 0
    $ctrl.gettingPending = true
    return bmPendingQueueService.iterate((item) => {
      $ctrl.pendingQueue.push(item.request.data)
    }).then(() => $ctrl.gettingPending = false)
  }

  $rootScope.$on('bmPendingQueueRemove', $ctrl.queue)
  $rootScope.$on('bmPendingQueueAdd', $ctrl.queue)

  $ctrl.queue()
}

module.exports = {
  controller: PendingQueueListController,
  controllerAs: 'PendingQueueListCtrl',
  template: `<div class="bm-row">
  <ul>
    <li ng-repeat="item in PendingQueueListCtrl.pendingQueue">
      <a href="" ng-click="PendingQueueListCtrl.selectItem(item)">{{item.text}}</a> <a class="bm-button__icon" href="" ng-click="PendingQueueListCtrl.removeItem(item._uuid)">Remove</a>
    </li>
  </ul>
</div>
`,
  bindings: {
    onSelectItem: '&?'
  }
}
