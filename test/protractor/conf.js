let SpecReporter = require('jasmine-spec-reporter').SpecReporter;

exports.config = {
  framework: 'jasmine',
  specs: ['spec.js'],
  multiCapabilities: [
    {
      browserName: 'firefox'
    },
    {
      browserName: 'chrome'
    }
  ],

  jasmineNodeOpts: {
    print: function() {}
  },

  onPrepare: function() {
    jasmine.getEnv().addReporter(
      new SpecReporter({
        spec: {
          displayStacktrace: true
        }
      })
    );
  }
};
