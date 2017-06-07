# AngularJS Pending Queue [![npm](https://img.shields.io/npm/v/@blinkmobile/angular-pending-queue.svg?maxAge=2592000)](https://www.npmjs.com/package/@blinkmobile/angular-pending-queue)

[![Greenkeeper badge](https://badges.greenkeeper.io/blinkmobile/angularjs-pending-queue.svg)](https://greenkeeper.io/)

AngularJS 1.5+ module to save form data to the browser or device storage when there is no connectivity or a server error

# Installation

```
npm i @blinkmobile/angularjs-pending-queue
```

# Setup

- Include `dist/bm-angularjs-pending-queue.js` or `dist/bm-angularjs-pending-queue.min.js` in your HTML or in your build step
- Add `bmPendingQueue` as a dependency to your AngularJS web app
```
require('path/to/dist/bm-angularjs-pending-queue.min.js')
angular.module('myModule', ['bmPendingQueue'])
```

# Injectables

- `pendingQueueList` - Component that displays the items saved in the pending queue
- `bmPendingQueueService` - Service that wraps LocalForage to save data to the device in a specific format. Broadcasts events on `$rootScope`
- `dbName` - Constant. The name of the device storage db being used
- `pendingQueueTable` - Constant. The name of the table in the db


# How it works

AngularJS Pending Queue works by injecting a [HTTP Interceptor](src/pending-queue-interceptor.js) into the interceptors array. If a `POST` or `PUT` request with a Content Type header of `application/x-www-form-urlencoded` or `application/json` errors, the request and response data is saved to the device storage using [LocalForage](https://github.com/localForage/localForage). If a previously saved item is successfully sent, the corresponding entry in device storage is removed.

There is a decorator for the `$http` service, to automate resending of items in the pending queue. Any successful HTTP request will trigger resending of any items in the pending queue.

See the [docs folder](docs/) for more details
