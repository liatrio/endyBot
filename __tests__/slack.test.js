/* eslint-env jest */
const slack = require('../src/slack')
const { App } = require('@slack/bolt')

describe('slack.js testing suite', () => {
  describe('sendForm test', () => {
    let app = {}
    beforeEach(() => {
      app = new App({})
    })
    test('Open channel successful', async () => {
      function channelOpen () {
        const retObj = {
          ok: true,
          channel: { id: 'CH12345' }
        }

        return retObj
      }

      app.client.conversations.open.mockImplementation(channelOpen)
      expect(await slack.sendCreateForm(app, '')).toEqual(0)
    })
  })
})
