/* eslint-env jest */
// Add the above comment to all jest files so they don't fail linting due to no-undef

const mockingoose = require('mockingoose')
const Group = require('../db-schemas/group')
const db = require('../src/db')

// i added this to ensure that our tests dont interfere with eachother
// it resets the DB after each test
afterEach(() => {
  mockingoose.resetAll()
})

describe('group.js testing suite', () => {
  test('Create a group', () => {
    const _group = {
      _id: '64dbee9baf23d8dc32bcbad3',
      name: 'Test Group',
      contributors: [{ name: 'UID12345' }],
      subscribers: ['UID56789'],
      postTime: 0,
      channel: '#test-channel',
      ts: '123456.78'
    }

    mockingoose(Group).toReturn(_group, 'findOne')
    return Group.findById({ _id: '64dbee9baf23d8dc32bcbad3' }).then(group => {
      console.log(group)
      expect(JSON.parse(JSON.stringify(group))).toMatchObject(_group)
    })
  })
})

describe('addToDB function', () => {
  test('should add a group to the database and return its ID', async () => {
    const fakeGroup = {
      name: 'test-group',
      contributors: [{ name: 'keoni' }, { name: 'mikayla' }, { name: 'carson' }],
      subscribers: ['josh'],
      postTime: 5,
      channel: 'fake-channel',
      ts: '123456.78'
    }
    let id
    // Mock the create operation to return a mock group with the provided ID
    mockingoose(Group).toReturn({ _id: id }, 'create')

    const result = await db.addToDB(fakeGroup)
    expect(result).not.toBeNull()
  })
})

describe('getGroup function', () => {
  test('No arguments supplied', async () => {
    const res = await db.getGroup()
    expect(res).toEqual(-1)
  })

  test('Group Name supplied, found', async () => {
    const group = {
      _id: '64e3e720f3e3e106543a0fbf',
      name: 'Test Group'
    }

    mockingoose(Group).toReturn(group, 'findOne')

    const res = await db.getGroup('Test Group')
    expect(JSON.stringify(res._id)).toBe(JSON.stringify(group._id))
  })

  test('Group ID supplied, found', async () => {
    const group = {
      _id: '64e3e720f3e3e106543a0fbf',
      name: 'Test Group'
    }

    mockingoose(Group).toReturn(group, 'findOne')

    const res = await db.getGroup(undefined, '64e3e720f3e3e106543a0fbf')
    expect(JSON.stringify(res.name)).toBe(JSON.stringify(group.name))
  })

  test('Group name and Group ID supplied, found', async () => {
    const _group = {
      _id: '64e3e720f3e3e106543a0fbf',
      name: 'Test Group',
      contributors: [{ name: 'UID1234' }]
    }

    mockingoose(Group).toReturn(_group, 'findOne')

    const res = await db.getGroup('Test Group', '64e3e720f3e3e106543a0fbf')
    expect(res.contributors).toEqual(_group.contributors)
  })
})

// Testing the return values of the list function is pretty much the best option for it since all it does it print
// different messages based on internal logic. I would've preferred to test the sizes of the arrays within the function that
// dictate what gets printed, but that would require me to return those arrays and change the functionality of the function
describe('listGroups testing suite', () => {
  test('List groups while subbed and unsubbed', async () => {
    const groups = [
      {
        name: 'Group 1',
        contributors: [{ name: 'UID123' }, { name: 'UID456' }],
        subscribers: ['SID123']
      },
      {
        name: 'Group 2',
        contributors: [{ name: 'UID123' }],
        subscribers: ['SID123']
      },
      {
        name: 'Group 3',
        contributors: [{ name: 'UID123' }, { name: 'UID456' }, { name: 'UID789' }],
        subscribers: ['SID789']
      }
    ]

    mockingoose(Group).toReturn(groups, 'find')

    const result = await db.listGroups('SID123')

    expect(result).toBe('*Groups you are subscribed to*\n*-----------------------------------*\n*Group 1* --- Contributors: 2\n*Group 2* --- Contributors: 1\n\n\n*Groups you are not subscribed to*\n*---------------------------------------*\n*Group 3* --- Contributors: 3\n')
  })

  test('List groups while subbed only', async () => {
    const groups = [
      {
        name: 'Group 1',
        contributors: [{ name: 'UID123' }, { name: 'UID456' }],
        subscribers: ['SID123']
      }
    ]

    mockingoose(Group).toReturn(groups, 'find')

    const result = await db.listGroups('SID123')

    expect(result).toBe('*Groups you are subscribed to*\n*-----------------------------------*\n*Group 1* --- Contributors: 2\n\n\nYou\'re subscribed to every group. Way to be a team player!')
  })

  test('List groups while unsubbed only', async () => {
    const groups = [
      {
        name: 'Group 1',
        contributors: [{ name: 'UID123' }, { name: 'UID456' }],
        subscribers: ['SID123']
      }
    ]

    mockingoose(Group).toReturn(groups, 'find')

    const result = await db.listGroups('SID456')

    expect(result).toBe('You aren\'t subscribed to any groups\n\n\n*Groups you are not subscribed to*\n*---------------------------------------*\n*Group 1* --- Contributors: 2\n')
  })

  test('List groups when none exist', async () => {
    const groups = []

    mockingoose(Group).toReturn(groups, 'find')

    const result = await db.listGroups('SID456')

    expect(result).toBe('No groups to be listed')
  })
})

// I tried to test the size changes of the subscribers array in these tests instead of only analyzing the return value,
// but due to using a mock group, 'group' is not a database entry, and therefore when group.save() is called within the function the change
// is not reflected here. I'd like to hopefully figure out how to do this eventually without returning the group from the function, but for now this will have to do.
describe('addSubscriber testing suite', () => {
  test('Successfully subscribe to a group', async () => {
    const group = {
      name: 'Group',
      subscribers: ['SID123']
    }

    mockingoose(Group).toReturn(group, 'findOne')

    const result = await db.addSubscriber('Group', 'SID456')

    expect(result).toBe('You are now subscribed to *Group*!')
  })

  test('Attempt to subscribe while already subscribed', async () => {
    const group = {
      name: 'Group',
      subscribers: ['SID123']
    }

    mockingoose(Group).toReturn(group, 'findOne')

    const result = await db.addSubscriber('Group', 'SID123')

    expect(result).toBe('You are already subscribed to *Group*')
  })

  test('Attempt to subscribe to nonexistent group', async () => {
    mockingoose(Group).toReturn(null, 'findOne')

    const result = await db.addSubscriber('Group', 'SID123')

    expect(result).toBe('No group exists with name *Group*')
  })
})

// Same note goes here that was said in the addSubscriber testing suite
describe('removeSubscriber testing suite', () => {
  test('Successfully unsubscribe from a group', async () => {
    const group = {
      name: 'Group',
      subscribers: ['SID123']
    }

    mockingoose(Group).toReturn(group, 'findOne')

    const result = await db.removeSubscriber('Group', 'SID123')

    expect(result).toBe('You have unsubscribed from *Group*, and will no longer receive messages about the group. Come back any time!')
  })

  test('Attempt to unsubscribe while already unsubscribed', async () => {
    const group = {
      name: 'Group',
      subscribers: ['SID123']
    }

    mockingoose(Group).toReturn(group, 'findOne')

    const result = await db.removeSubscriber('Group', 'SID456')

    expect(result).toBe('You were already unsubscribed from *Group*')
  })

  test('Attempt to unsubscribe from nonexistent group', async () => {
    mockingoose(Group).toReturn(null, 'findOne')

    const result = await db.removeSubscriber('Group', 'SID123')

    expect(result).toBe('No group exists with name *Group*')
  })
})

describe('deleteGroup function', () => {
  test('error catching', async () => {
    mockingoose(Group).toReturn(console.error('error'), 'deleteOne')
    const res = await db.deleteGroup('error')
    expect(res).toEqual("Error while deleting error: Cannot read properties of undefined (reading 'deletedCount')")
  })

  test('testing valid group names', async () => {
    mockingoose(Group).toReturn({ deletedCount: 1 }, 'deleteOne')
    const res = await db.deleteGroup('testGroup')
    expect(res).toEqual('*testGroup* was removed successfully')
  })

  test('testing valid group names', async () => {
    mockingoose(Group).toReturn({ deletedCount: 0 }, 'deleteOne')
    const res = await db.deleteGroup('testGroup')
    expect(res).toEqual('*testGroup* was not deleted')
  })
})

// This function only returns a concatenated string, like the listGroup command, so the only option is to test the returned string
describe('describeGroup testing suite', () => {
  test('Describe existing group', async () => {
    const group = {
      name: 'Group 1',
      contributors: [{ name: 'UID123' }],
      subscribers: ['SID123'],
      postTime: 14,
      channel: 'test-channel'
    }
    mockingoose(Group).toReturn(group, 'findOne')
    const result = await db.describeGroup('Group 1')
    expect(result).toBe('Here\'s all the information for *Group 1*\n\n*Contributors*: <@UID123>  \n\n*Subscribers*: <@SID123>  \n\n*Channel*: <#test-channel>\n\n*EOD Time*: 14:00 EST\n')
  })

  test('Describe nonexistent group', async () => {
    // If the group doesn't exist, getGroup will return null
    mockingoose(Group).toReturn(null, 'findOne')

    const result = await db.describeGroup('bad group name')
    expect(result).toBe('No group exists with name *bad group name*')
  })
})

describe('updatePosted testing suite', () => {
  test('No ts', async () => {
    const group = {
      posted: true,
      ts: '1234',
      save: jest.fn(() => Promise.resolve(group))
    }

    const expected = {
      posted: false,
      ts: '1234',
      save: jest.fn(() => Promise.resolve())
    }

    const res = await db.updatePosted(group)
    expect(JSON.stringify(res)).toStrictEqual(JSON.stringify(expected))
  })

  test('With ts', async () => {
    const group = {
      posted: false,
      ts: '1234',
      save: jest.fn(() => Promise.resolve(group))
    }

    const expected = {
      posted: true,
      ts: '5678',
      save: jest.fn(() => Promise.resolve())
    }

    const res = await db.updatePosted(group, '5678')
    expect(JSON.stringify(res)).toStrictEqual(JSON.stringify(expected))
  })

  test('Error', async () => {
    const group = {
      posted: false,
      ts: '1234',
      save: jest.fn(() => Promise.reject(new Error('Test error')))
    }

    const res = await db.updatePosted(group)
    expect(res).toBeNull()
  })
})
