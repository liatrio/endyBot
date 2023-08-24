/* eslint-env jest */
// Add the above comment to all jest files so they don't fail linting due to no-undef

const mockingoose = require('mockingoose')
const Group = require('../db-schemas/group')
const Post = require('../db-schemas/post')
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
      contributors: ['UID12345'],
      subscribers: ['UID56789'],
      postTime: 0,
      channel: '#test-channel',
      ts: '123456.78',
      cronTask: { attribute: 1 }
    }

    mockingoose(Group).toReturn(_group, 'findOne')
    return Group.findById({ _id: '64dbee9baf23d8dc32bcbad3' }).then(group => {
      console.log(group)
      expect(JSON.parse(JSON.stringify(group))).toMatchObject(_group)
    })
  })

  test('List groups from DB', async () => {
    const groups = [
      {
        name: 'Group 1',
        contributors: ['UID123', 'UID456'],
        subscribers: ['UIS789'],
        postTime: 0,
        channel: '#ex-channel',
        ts: '1234455.12',
        cronTask: { attribute: 1 }
      },
      {
        name: 'Group 2',
        contributors: ['UID123'],
        subscribers: ['UIS789'],
        postTime: 0,
        channel: '#ex-channel',
        ts: '1234456.12',
        cronTask: { attribute: 1 }
      },
      {
        name: 'Group 3',
        contributors: ['UID123', 'UID456', 'UID789'],
        subscribers: ['UIS789'],
        postTime: 0,
        channel: '#ex-channel',
        ts: '1234457.12',
        cronTask: { attribute: 1 }
      }
    ]

    mockingoose(Group).toReturn(groups, 'find')

    const result = await db.listGroups()

    expect(result).toBe('Group 1 --- Num Members: 2\nGroup 2 --- Num Members: 1\nGroup 3 --- Num Members: 3\n')
  })

  test('No groups returned from DB', async () => {
    const groups = []
    mockingoose(Group).toReturn(groups, 'find')
    const result = await db.listGroups()
    expect(result).toBe('No groups to be listed')
  })
})

describe('post.js testing suite', () => {
  test('Create a post', () => {
    const _post = {
      _id: '64dbef208a2f7500247b374b',
      content: ['This is my EOD post!'],
      threadID: 'THRDID12345',
      group: '64dbee9baf23d8dc32bcbad3',
      author: 'UID12345'
    }

    mockingoose(Post).toReturn(_post, 'findOne')

    return Post.findById({ _id: '64dbef208a2f7500247b374b' }).then(post => {
      expect(JSON.parse(JSON.stringify(post))).toMatchObject(_post)
    })
  })
})

describe('addToDB function', () => {
  test('should add a group to the database and return its ID', async () => {
    const fakeGroup = {
      name: 'test-group',
      contributors: ['keoni', 'mikayla', 'carson'],
      subscribers: ['josh'],
      postTime: 5,
      channel: 'fake-channel',
      ts: '123456.78',
      cronTask: { attribute: 1 }
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
      contributors: ['UID1234']
    }

    mockingoose(Group).toReturn(_group, 'findOne')

    const res = await db.getGroup('Test Group', '64e3e720f3e3e106543a0fbf')
    expect(res.contributors).toEqual(_group.contributors)
  })
})

describe('deleteGroup function', () => {
  test('testing invalid group names', async () => {
    mockingoose(Group).toReturn(null, 'findOne')
    const res = await db.deleteGroup('Test Group')
    expect(res).toEqual('Test Group is not a valid group')
  })

  test('error catching', async () => {
    const testGroup = 'testGroup'
    mockingoose(Group).toReturn({ name: testGroup }, 'findOne')
    mockingoose(Group).toReturn(console.error('error'), 'deleteOne')
    const res = await db.deleteGroup('error')
    expect(res).toEqual("Error while deleting error: Cannot read properties of undefined (reading 'deletedCount')")
  })

  test('testing valid group names', async () => {
    const testGroup = 'testGroup'
    mockingoose(Group).toReturn({ name: testGroup }, 'findOne')
    mockingoose(Group).toReturn({ deletedCount: 1 }, 'deleteOne')
    const res = await db.deleteGroup('testGroup')
    expect(res).toEqual('testGroup was removed successfully')
  })

  test('testing valid group names', async () => {
    const testGroup = 'testGroup'
    mockingoose(Group).toReturn({ name: testGroup }, 'findOne')
    mockingoose(Group).toReturn({ deletedCount: 0 }, 'deleteOne')
    const res = await db.deleteGroup('testGroup')
    expect(res).toEqual('testGroup was not found')
  })
})
