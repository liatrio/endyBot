/* eslint-env jest */
// Add the above comment to all jest files so they don't fail linting due to no-undef

const mockingoose = require('mockingoose')
const Group = require('../db-schemas/group')
const schedule = require('../src/schedule')

describe('schedule.js testing suite', () => {
  test('Schedule cron job from valid group', async () => {
    const group = {
      name: 'Group 1',
      contributors: ['UID123', 'UID456'],
      subscribers: ['UIS789'],
      postTime: 16,
      channel: 'CID123'
    }

    mockingoose(Group).toReturn(group, 'findOne')

    const result = await schedule.scheduleCronJob('GID123')

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

    const result = await schedule.scheduleCronJob('GID123')

    expect(result).toBeNull()
  })

  test('Skip adding a nonexistent group to schedule', async () => {
    // let group = null

    mockingoose(Group).toReturn(null, 'findOne')

    const result = await schedule.scheduleCronJob('GID123')

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
