/* eslint-env jest */
const { App } = require('@slack/bolt')

const appHelper = require('../src/app-helper')
const app = new App({})

// calling this require so I can access the mocked out
// functions and modify them for individual tests
const schedule = require('../src/schedule')
const db = require('../src/db')
const slack = require('../src/slack')

// this will grab the  require above and replace it
// with the file in the src/__mocks__  folder
jest.mock('../src/schedule')
jest.mock('../src/db')
jest.mock('../src/slack')

describe('handleGroupDelete testing suite', () => {
  test('Pass invalid group name in', async () => {
    const allTasks = []
    db.getGroup.mockResolvedValue(null)
    const res = await appHelper.handleGroupDelete(app, allTasks, 'bad name', 'UID123')
    expect(res).toBe('No group exists with name *bad name*')
  })

  test('Pass valid group name in', async () => {
    const allTasks = []
    db.getGroup.mockResolvedValue({})
    schedule.removeTasks.mockResolvedValue(0)
    db.deleteGroup.mockResolvedValue('*group* was removed successfully')
    slack.notifySubsAboutGroupDeletion.mockResolvedValue(0)
    const res = await appHelper.handleGroupDelete(app, allTasks, 'group', 'UID123')
    expect(res).toBe('*group* was removed successfully')
  })
})
