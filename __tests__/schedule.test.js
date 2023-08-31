/* eslint-env jest */
// Add the above comment to all jest files so they don't fail linting due to no-undef

const mockingoose = require('mockingoose')
const Group = require('../db-schemas/group')
const schedule = require('../src/schedule')
const { App } = require('@slack/bolt')

// including slack with a name so I can override default mocks
const slack = require('../src/slack')

// mocking out slack.js and db.js since they're used in schedule.js
jest.mock('../src/slack')
jest.mock('../src/db')

describe('schedule.js testing suite', () => {
  const app = new App({})

  describe('removeTasks function with empty list', () => {
    const groupName = 'test_group2'
    test('removing something from the task list', () => {
      const list = []
      schedule.removeAllTasks(list, groupName)
      expect(list.length).toEqual(0)
    })

    test('removeTasks function valid', () => {
      const list = [
        {
          group: 'test_group1',
          threadTask: {
            stop: jest.fn()
          },
          contribTasks: [
            {
              task: {
                stop: jest.fn()
              }
            }
          ],
          subTasks: [
            {
              task: {
                stop: jest.fn()
              }
            }
          ]
        },
        {
          group: 'test_group2',
          threadTask: {
            stop: jest.fn()
          },
          contribTasks: [
            {
              task: {
                stop: jest.fn()
              }
            }
          ],
          subTasks: [
            {
              task: {
                stop: jest.fn()
              }
            }
          ]
        },
        {
          group: 'test_group3',
          threadTask: {
            stop: jest.fn()
          },
          contribTasks: [
            {
              task: {
                stop: jest.fn()
              }
            }
          ],
          subTasks: [
            {
              task: {
                stop: jest.fn()
              }
            }
          ]
        }
      ]
      schedule.removeAllTasks(list, groupName)
      expect(list.length).toBe(2)
    })
  })

  describe('startCronJobs tests', () => {
    test('Handle cron job setup from single group in DB', async () => {
      const groups = [{
        name: 'Group 1',
        contributors: ['UID123', 'UID456'],
        subscribers: ['UIS789'],
        postTime: 16,
        channel: 'CID123'
      }]

      mockingoose(Group).toReturn(groups, 'find')

      const result = await schedule.startCronJobs([], app)

      expect(result).toBe(0)
    })

    test('Handle cron job setup from multiple groups in DB', async () => {
      const groups = [{
        name: 'Group 1',
        contributors: ['UID123', 'UID456'],
        subscribers: ['UIS789'],
        postTime: 16,
        channel: 'CID123'
      },
      {
        name: 'Group 2',
        contributors: ['UID123', 'UID456'],
        subscribers: ['UIS789'],
        postTime: 16,
        channel: 'CID123'
      }]

      mockingoose(Group).toReturn(groups, 'find')

      const result = await schedule.startCronJobs([], app)

      expect(result).toBe(0)
    })

    test('Handle cron job setup from zero groups in DB', async () => {
      const groups = []

      mockingoose(Group).toReturn(groups, 'find')

      const result = await schedule.startCronJobs([], app)

      expect(result).toBeNull()
    })
  })

  describe('scheduleCronJob tests', () => {
    test('Schedule valid group, first group', async () => {
      // mock group
      const group = {
        name: 'Group 1',
        contributors: ['UID123', 'UID456'],
        subscribers: ['UID789'],
        postTime: 16,
        channel: 'CID123'
      }

      // mock return values on all called functions
      slack.getUserList.mockResolvedValue([
        {
          id: 'UID123',
          tz: 'Timezone'
        },
        {
          id: 'UID456',
          tz: 'Timezone'
        },
        {
          id: 'UID789',
          tz: 'Timezone'
        }
      ])

      // mock allTasks
      const allTasks = []

      await schedule.scheduleCronJob([], allTasks, group, app)

      expect(allTasks.length).toEqual(1)
      expect(allTasks[0].contribTasks.length).toEqual(2)
      expect(allTasks[0].subTasks.length).toEqual(1)
    })

    test('Schedule valid group, not first group', async () => {
      // mock group
      const group = {
        name: 'Group 1',
        contributors: ['UID123', 'UID456'],
        subscribers: ['UIS789'],
        postTime: 16,
        channel: 'CID123'
      }

      // mock return values on all called functions
      slack.getUserList.mockResolvedValue(['usr1', 'usr2'])

      // mock allTasks
      const allTasks = [{}, {}]

      await schedule.scheduleCronJob([], allTasks, group, app)

      expect(allTasks.length).toEqual(3)
    })

    test('Skip adding a group with invalid time to schedule', async () => {
      const group = {
        name: 'Group 2',
        contributors: ['UID123'],
        subscribers: ['UIS789'],
        postTime: 25,
        channel: 'CID123'
      }

      mockingoose(Group).toReturn(group, 'findOne')

      const result = await schedule.scheduleCronJob([], group, app)

      expect(result).toBeNull()
    })

    test('Skip adding a nonexistent group to schedule', async () => {
      mockingoose(Group).toReturn(null, 'findOne')

      const result = await schedule.scheduleCronJob([], null, app)

      expect(result).toBeNull()
    })

    test('Attempt to add contributor that does not exist', async () => {
      // mock group
      const group = {
        name: 'Group 1',
        contributors: ['UID123', 'UID456'],
        subscribers: ['UIS789'],
        postTime: 16,
        channel: 'CID123'
      }

      // mock return values on all called functions
      slack.getUserList.mockResolvedValue([
        {
          id: 'UID123',
          tz: 'Timezone'
        }
      ])

      // mock allTasks
      const allTasks = []

      await schedule.scheduleCronJob([], allTasks, group, app)

      expect(allTasks[0].contribTasks.length).toEqual(1)
    })
  })

  describe('convertPostTimeToCron tests', () => {
    test('Pass double digit time to convertPostTimeToCron', async () => {
      const result = schedule.convertPostTimeToCron(15)
      expect(result).toBe('0 15 * * 1-5')
    })

    test('Pass single digit time to convertPostTimeToCron', async () => {
      const result = schedule.convertPostTimeToCron(5)
      expect(result).toBe('0 5 * * 1-5')
    })

    test('Pass invalid time to convertPostTimeToCron', async () => {
      const result = schedule.convertPostTimeToCron(25)
      expect(result).toBeNull()
    })
  })

  describe('removeSubscriberTask tests', () => {
    const list = [
      {
        group: 'test_group1',
        threadTask: {
          stop: jest.fn()
        },
        contribTasks: [
          {
            task: {
              stop: jest.fn()
            }
          }
        ],
        subTasks: [
          {
            name: 'alice',
            task: {
              stop: jest.fn()
            }
          }
        ]
      },
      {
        group: 'test_group2',
        threadTask: {
          stop: jest.fn()
        },
        contribTasks: [
          {
            task: {
              stop: jest.fn()
            }
          }
        ],
        subTasks: [
          {
            name: 'endy',
            task: {
              stop: jest.fn()
            }
          }
        ]
      },
      {
        group: 'test_group3',
        threadTask: {
          stop: jest.fn()
        },
        contribTasks: [
          {
            task: {
              stop: jest.fn()
            }
          }
        ],
        subTasks: [
          {
            name: 'robert',
            task: {
              stop: jest.fn()
            }
          },
          {
            name: 'bobby',
            task: {
              stop: jest.fn()
            }
          },
          {
            name: 'bob',
            task: {
              stop: jest.fn()
            }
          }
        ]
      }
    ]

    test('removeSubscriberTask', () => {
      schedule.removeSubscriberTask(list, 'test_group3', 'bob')
      expect(list[2].subTasks.length).toEqual(2)
    })
  })
})
