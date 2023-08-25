/* eslint-env jest */
// Add the above comment to all jest files so they don't fail linting due to no-undef

const mockingoose = require('mockingoose')
const Group = require('../db-schemas/group')
const schedule = require('../src/schedule')
const { App } = require('@slack/bolt')

// mocking out slack.js and db.js since they're used in schedule.js
jest.mock('../src/slack')
jest.mock('../src/db')

describe('schedule.js testing suite', () => {
  const app = new App({})

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

  test('Schedule cron job from valid group', async () => {
    const group = {
      name: 'Group 1',
      contributors: ['UID123', 'UID456'],
      subscribers: ['UIS789'],
      postTime: 16,
      channel: 'CID123'
    }

    mockingoose(Group).toReturn(group, 'findOne')

    const result = await schedule.scheduleCronJob([], group, app)

    expect(result).toBe(0)
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
