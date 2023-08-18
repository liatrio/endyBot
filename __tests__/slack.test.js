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

  describe('createPost test', () => {
    let mockApp

    beforeEach(() => {
      mockApp = new App({})
    })

    test('test that a post is created and an id is returned', async () => {
      const mockGroup = {
        channel: 'C1234',
        name: 'test group'
      }

      mockApp.client.chat.postMessage = jest.fn().mockResolvedValue({ ts: '1234' })
      const res = await slack.createPost(mockApp, mockGroup)
      expect(res).toBe('1234')
    })

    test('handle error', async () => {
      const mockGroup = {}

      const res = await slack.createPost(mockApp, mockGroup)
      expect(res).toBe(null)
    })
  })

  describe('dmUsers  tests', () => {
    let mockApp

    beforeEach(() => {
      mockApp = new App({})
    })

    test('Successfully sent conributor a DM', async () => {
      const group = {
        contributors: ['UID123', 'UID456']
      }
      const result = await slack.dmUsers(mockApp, group)
      expect(result).toBe(0)
    })

    test('No contributors in group error', async () => {
      const group = {
        contributors: []
      }
      const result = await slack.dmUsers(mockApp, group)
      expect(result).toBe(-1)
    })
  })

  describe('sendEODModal tests', () => {
    test('Modal send successfully', async () => {
      function success () {
        const res = {
          ok: true
        }
        return res
      }

      const app = new App({})
      app.client.views.open.mockImplementation(success)
      const res = await slack.sendEODModal(app, '12345')

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
      const res = await slack.sendEODModal(app, '12345')

      expect(res).toEqual(-1)
    })
  })

  describe('updateEODModal tests', () => {
    const defBody = {
      view: {
        id: '12345',
        blocks: ['block1', 'block2', 'block3']
      }
    }
    const notDefBody = {
      view: {
        id: '12345',
        blocks: ['block1', 'block2', 'block3', 'block4']
      }
    }
    const app = new App({})

    test('Update with blockers from default', () => {
      const res = slack.updateEODModal(app, defBody, 'blockers')
      expect(res).toEqual(3)
    })

    test('Update with notes from default', () => {
      const res = slack.updateEODModal(app, defBody, 'notes')
      expect(res).toEqual(5)
    })

    test('Update with blockers from notes', () => {
      const res = slack.updateEODModal(app, notDefBody, 'blockers')
      expect(res).toEqual(7)
    })

    test('Update with notes from blockers', () => {
      const res = slack.updateEODModal(app, notDefBody, 'notes')
      expect(res).toEqual(7)
    })

    test('Invalid add block arg', () => {
      const res = slack.updateEODModal(app, {}, '')
      expect(res).toEqual(-1)
    })
  })
})
