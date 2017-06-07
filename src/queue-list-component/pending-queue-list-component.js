'use strict'

PendingQueueListController.$inject = ['$scope', '$q', '$sce', 'bmPendingQueueService']
function PendingQueueListController($scope, $q, $sce, bmPendingQueueService) {
  const $ctrl = this
  const watchers = []
  let fetching = false

  $ctrl.$onInit = function () {
    fetching = false
    $ctrl.pendingQueue = []
    if (!$ctrl.displayRemove) {
      $ctrl.displayRemove = '&#x2718;'
    }
    $ctrl.displayRemove = $sce.trustAsHtml($ctrl.displayRemove)
    watchers.push($scope.$on('bmPendingQueueRemove', $ctrl.getQueue))
    watchers.push($scope.$on('bmPendingQueueAdd', $ctrl.getQueue))
    $ctrl.getQueue()
  }

  $ctrl.$onDestroy = function () {
    watchers.forEach((w) => w())
  }

  $ctrl.selectItem = function(item) {
    $ctrl.onSelectItem && $ctrl.onSelectItem({ item })
  }

  $ctrl.removeItem = function(uuid) {
    return bmPendingQueueService.remove(uuid).then($ctrl.getQueue)
  }

  $ctrl.getQueue = function() {
    if (fetching) {
      return
    }
    fetching = true
    $ctrl.pendingQueue.length = 0
    return bmPendingQueueService.iterate((item) => {
      $ctrl.pendingQueue.push(item.request.data)
    }).then(() => fetching = false)
  }
}

module.exports = {
  controller: PendingQueueListController,
  controllerAs: 'PendingQueueListCtrl',
  template: `<div class="<bm-pending-queue">
  <ul class="bm-pending-queue__list">
    <li class="bm-pending-queue__list-item" ng-repeat="item in PendingQueueListCtrl.pendingQueue">
      <a  class="bm-pending-queue__select-item"
          title="Select item"
          href=""
          ng-click="PendingQueueListCtrl.selectItem(item)">{{item[PendingQueueListCtrl.displayKey]}}</a>
      <a class="bm-pending-queue__remove-item bm-button__icon"
         href=""
         title="Remove Item"
         ng-click="PendingQueueListCtrl.removeItem(item._uuid)"
         ng-bind-html="PendingQueueListCtrl.displayRemove"></a>
    </li>
  </ul>
</div>
`,
  bindings: {
    displayKey: '@',
    displayRemove: '@?',
    onSelectItem: '&?'
  }
}
