'use strict'

function triggerDigests ($rootScope) { // eslint-disable-line no-unused-vars
  return setInterval(function() {
    $rootScope.$apply();
  }, 10)
}

function stopDigests (interval) { // eslint-disable-line no-unused-vars
  window.clearInterval(interval);
}
