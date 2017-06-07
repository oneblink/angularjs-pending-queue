# pendingQueueList

`pendingQueueList` is a component that uses `bmPendingQueueService` to display an unordered list of items in the pending queue. It is not styled and you will need to specify the callback for when an item is clicked.

# Usage

First make sure that you have followed the [README](../README.md) and have the AngularJS Pending Queue as a dependency of your module.

Once that is done, in your HTML, use the element syntax to place the list where you need it:

```html
<div class="my-popup-container">
  <pending-queue-list on-select-item="$ctrl.pendingQueueItemClick(item)" display-key="idFieldName"></pending-queue-list>
</div>
```

# Bindings

| Binding Name | Usage | Required |
|--------------|-------|----------|
|`display-key` | the property name on the data stored in the pending queue to use as a label | Yes |
|`on-select-item`| callback that gets passed the `item` when the user clicks the item name. | No |
|`on-remove-item` | callback that gets passed the `item` when the user clicks remove. Defaults to an alert box. Your callback must return a promise that resolves if the user wants to remove the item or rejects if they don't | No |
|`display-remove` | text or HTML to display as the remove button. Defaults to &#x2718; | No |

# Customising the look

We use the [BEM](http://getbem.com/) Naming conventions

| class selector | Intent |
|----------------|--------|
|.bm-pending-queue | The "block" wrapping the pending queue list |
|.bm-pending-queue__list | The list "element" . Placed on a `UL` element |
|.bm-pending-queue__list-item | The list item "element". Placed on a `LI` element |
|.bm-pending-queue__select-item | The selection "element". Clicking this triggers the callback `on-select-item`. Placed on an `A` element |
|.bm-pending-queue__remove-item.bm-button__icon | The remove "element". Clicking this triggers the callback `on-remove-item`, then removes the item from the pending queue |
