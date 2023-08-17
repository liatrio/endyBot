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

  describe('parseCreateModal tests', () => {
    test('Empty input', () => {
      const res = slack.parseCreateModal()

      expect(res).toEqual(null)
    })

    test('Incomplete input', () => {
      const incompleteView = {
        state: {
          values: {
            group_name: { group_create_name: { value: 'Test Group' } },
            contributors: { group_create_contributors: { } }
          }
        }
      }

      const res = slack.parseCreateModal(incompleteView)
      expect(res).toEqual(null)
    })

    test('Complete input', () => {
      const completeView = {
        state: {
          values: {
            group_name: { group_create_name: { value: 'Test Group' } },
            contributors: { group_create_contributors: { selected_users: ['UID123', 'UID456'] } },
            subscribers: { group_create_subscribers: { selected_users: ['UID789', 'UID1110'] } },
            create_time: { group_create_time: { selected_time: '01:00' } },
            channel: { group_create_channel: { selected_channel: 'CHID123' } }
          }
        }
      }

      const expected = {
        name: 'Test Group',
        contributors: ['UID123', 'UID456'],
        subscribers: ['UID789', 'UID1110'],
        postTime: 1,
        channel: 'CHID123'
      }

      const res = slack.parseCreateModal(completeView)

      expect(res).toStrictEqual(expected)
    })
  })
})
