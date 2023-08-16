/* eslint-env jest */
const slack = require('../src/slack')
const { App } = require('@slack/bolt')

describe('slack.js testing suite', () => {
  describe('sendCreateModal tests', () => {
    test('Modal send successfully', async () => {
      function success () {
        const res = {
          ok: true
        }
        return res
      }

      const app = new App({})
      app.client.views.open.mockImplementation(success)
      const res = await slack.sendCreateModal(app, '12345')

      expect(res).toEqual(0)
    })

    test('Modal send successfully', async () => {
      function failure () {
        const res = {
          ok: false,
          error: 'Sample error'
        }
        return res
      }

      const app = new App({})
      app.client.views.open.mockImplementation(failure)
      const res = await slack.sendCreateModal(app, '12345')

      expect(res).toEqual(-1)
    })
  })
})
