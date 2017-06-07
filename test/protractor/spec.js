'use strict'

describe('Protractor tests', () => {
  let textbox
  let invalidCheckbox
  let submitButton
  let pendingQueueList
  let clearButton

  beforeEach(() => {
    browser.get('http://localhost:8000/test/e2e/index.html')

    textbox = element(by.model('$ctrl.model.text'))
    invalidCheckbox = element(by.model('$ctrl.model.invalid'))
    pendingQueueList = element(by.tagName('pending-queue-list'))
    submitButton = element(by.id('submit'))
    clearButton = element(by.id('clear-queue'))
  })

  it('should have the required setup', () => {
    expect(textbox.isPresent()).toBe(true)
    expect(invalidCheckbox.isPresent()).toBe(true)
    expect(pendingQueueList.isPresent()).toBe(true)
  })

  describe('with an empty pending queue', () => {
    beforeEach((done) => {
      element(by.id('clear-queue')).click()

      browser.waitForAngular().then(done).catch(done.fail)
    })

    afterEach((done) => browser.waitForAngular().then(done).catch(done.fail))

    describe('the list component', () => {
      it('should not have any items in it', () => {
        pendingQueueList
          .all(by.tagName('li'))
          .then(result => expect(result.length).toBe(0))
      })
    })

    it('should not add a successful send to the queue', done => {
      textbox.sendKeys('should not be saved')
      submitButton.click()

      browser
        .waitForAngular()
        .then(() =>
          element.all(by.repeater('item in PendingQueueListCtrl.pendingQueue'))
        )
        .then(items => expect(items.length).toBe(0))
        .then(done)
        .catch(done.fail)
    })

    it('should add an unsuccessful send to the queue', done => {
      textbox.sendKeys('I was unsuccessful')
      invalidCheckbox.click()
      submitButton.click()
      browser
        .waitForAngular()
        .then(() =>
          element.all(by.repeater('item in PendingQueueListCtrl.pendingQueue'))
        )
        .then(items => expect(items.length).toBe(1))
        .then(done)
        .catch(done.fail)
    })

    it('should add multiple unsuccessful sends to the queue', done => {
      [0, 1].forEach((index) => {
        textbox.sendKeys(`should be saved ${index}`)
        invalidCheckbox.click()
        submitButton.click()
      })

      browser.waitForAngular().then(() => {
        pendingQueueList.all(by.tagName('li'))
          .then((items) => {
            expect(items.length).toBe(2)
            // it appears different browsers return the items in different orders,
            // so just check for the base text
            items.forEach((item) => protractor.ExpectedConditions.textToBePresentInElement(item, 'should be saved'))
          })
          .then(done)
          .catch(done.fail)
      })
    })
  })

  describe('when the pending queue has items in it', () => {
    beforeAll((done) => {
      clearButton.click()

      browser.waitForAngular().then(done).catch(done.fail)
    })

    beforeEach((done) => {
      [0, 1].forEach(index => {
        textbox.sendKeys(`should be saved ${index}`)
        invalidCheckbox.click()
        submitButton.click()
      })

      browser.waitForAngular().then(done).catch(done.fail)
    })

    afterEach((done) => {
      clearButton.click()

      browser.waitForAngular().then(done).catch(done.fail)
    })

    it('should display the items in the queue', () => {
      pendingQueueList.all(by.tagName('li')).then(items => {
        expect(items.length).toBe(2)
        items.forEach((item) =>
          protractor.ExpectedConditions.textToBePresentInElement(item, 'should be saved')
        )
      })
    })

    it('should remove a successfully resubmitted form', (done) => {
      pendingQueueList
        .all(by.className('bm-pending-queue__select-item'))
        .first()
        .click()

      browser
        .waitForAngular()
        .then(() => {
          invalidCheckbox.click()
          submitButton.click()

          return browser.waitForAngular()
        })
        .then(() => {
          pendingQueueList
            .all(by.tagName('li'))
            .count()
            .then((size) => expect(size).toBe(1))
            .then(() => protractor.ExpectedConditions.textToBePresentInElement(pendingQueueList, 'should be saved 1'))
        })
        .then(done)
        .catch(done.fail)
    })

    it('should not remove an item if the user clicks no', (done) => {
      pendingQueueList
        .all(by.className('bm-pending-queue__remove-item'))
        .first()
        .click()

      browser.switchTo().alert().dismiss()
      .then(() => browser.waitForAngular())
        .then(() => {
          pendingQueueList
            .all(by.tagName('li'))
            .count()
            .then((size) => expect(size).toBe(2))
        })
        .then(done)
        .catch(done.fail)
    })

    it('should remove an item if the user clicks no', (done) => {
      pendingQueueList
        .all(by.className('bm-pending-queue__remove-item'))
        .first()
        .click()

      browser.switchTo().alert().accept()
        .then(() => browser.waitForAngular())
        .then(() => {
          pendingQueueList
            .all(by.tagName('li'))
            .count()
            .then((size) => expect(size).toBe(1))
        })
        .then(done)
        .catch(done.fail)
    })
  })
})
