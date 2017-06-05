'use strict'

describe('Protractor tests', () => {
  beforeEach(() => browser.get('http://localhost:8000/test/e2e/index.html'))

  it('should have an input box', () => {
    element(by.model('$ctrl.model.text')).sendKeys('abcd')
    element(by.model('$ctrl.model.invalid')).click()
    element(by.id('submit')).click()

    element(by.model('$ctrl.model.text')).sendKeys('defg')
    element(by.id('submit')).click()
  })
})
