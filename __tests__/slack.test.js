/* eslint-env jest */
const slack = require('../src/slack')
const { App } = require('@slack/bolt')

// calling this require so I can access the mocked out
// functions and modify them for individual tests
const db = require('../src/db')

// this will grab the  require above and replace it
// with the file in the src/__mocks__  folder
jest.mock('../src/db')

// This will just override any calls to helpers with
// the file in the src/__mocks__ folder
jest.mock('../src/helpers')

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

      mockApp.client.chat.postMessage = jest.fn().mockResolvedValue({ ts: '1234.5678' })
      const res = await slack.createPost(mockApp, mockGroup)
      expect(res).toBe('1234.5678')
    })

    test('handle error', async () => {
      const mockGroup = { }

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

  describe('dmSubs tests', () => {
    let mockApp

    beforeEach(() => {
      mockApp = new App({})
    })

    test('Successfully sent subscriber a dm ', async () => {
      const group = {
        subscribers: ['UID123', 'UID456'],
        channel: '45678'
      }
      const ts = '1234.5678'
      const result = await slack.dmSubs(mockApp, group, ts)
      expect(result).toBe(0)
    })

    test('No subscribers in group error', async () => {
      const group = {
        subscribers: []
      }
      const ts = '1234.5678'
      const result = await slack.dmSubs(mockApp, group, ts)
      expect(result).toBe(1)
    })

    test('no channel in the group object or undefined', async () => {
      const group = {
        subscribers: ['UID123', 'UID456']
      }
      const ts = '123456.65432'
      const res = await slack.dmSubs(mockApp, group, ts)
      expect(res).toBe(2)
    })

    test('no timestamp', async () => {
      const group = {
        subscribers: ['UID123', 'UID456'],
        channel: '45678'
      }
      const result = await slack.dmSubs(mockApp, group)
      expect(result).toBe(3)
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

    test('Modal send failure', async () => {
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

  describe('postEODResponse test', () => {
    const mockApp = new App({})

    // mocking view
    const view = {
      private_metadata: 'groupName',
      state: {
        values: 'Sample value'
      }
    }

    // mocking called functions
    db.getGroup.mockResolvedValue({
      channel: '1234',
      ts: '1234'
    })

    test('Message sent succeffully', async () => {
      // mocking a successful api call
      mockApp.client.chat.postMessage.mockResolvedValue({
        ok: true,
        message: { blocks: 'Sample value' }
      })

      // defining expected result and calling function
      const expectedRes = 'Sample value'

      const res = await slack.postEODResponse(mockApp, view, '1234')

      expect(res).toEqual(expectedRes)
    })

    test('Message not sent successfully', async () => {
      // mocking an unsuccessful api call
      mockApp.client.chat.postMessage.mockResolvedValue({
        ok: false,
        error: Error('Error sending message')
      })

      // defining expected result and calling function
      const expectedRes = Error('Error sending message')

      const res = await slack.postEODResponse(mockApp, view, '1234')

      expect(res).toEqual(expectedRes)
    })

    test('Unexpected value in private_metadata', async () => {
      // overriding mocks from above
      db.getGroup.mockResolvedValue(null)
      // mocking view
      const view = {
        private_metadata: 'groupName hello',
        state: {
          values: 'Sample value'
        }
      }

      // defining expected result and calling function
      const expectedRes = Error('Group groupName hello not found.')

      const res = await slack.postEODResponse(mockApp, view, '1234')

      expect(res).toEqual(expectedRes)
    })
  })
})

describe('notifySubsAboutGroupDeletion testing suite', () => {
  let mockApp

  beforeEach(() => {
    mockApp = new App({})
  })

  test('Successfully sent subscribers a DM', async () => {
    const group = {
      subscribers: ['UID123', 'UID456']
    }
    const result = await slack.notifySubsAboutGroupDeletion(mockApp, group, 'UID123')
    expect(result).toBe(0)
  })

  test('No subscribers in group error', async () => {
    const group = {
      subscribers: []
    }
    const result = await slack.notifySubsAboutGroupDeletion(mockApp, group, 'UID123')
    expect(result).toBe(1)
  })
})
