/* eslint-env jest */
// Add the above comment to all jest files so they don't fail linting due to no-undef

const mockingoose = require('mockingoose')
const Group = require('../db-schemas/group')
const Post = require('../db-schemas/post')
const { addToDB } = require('../src/db')

// i added this to ensure that our tests dont interfere with eachother
// it resets the DB after each test
afterEach(() => {
  mockingoose.resetAll()
})
const { listGroups } = require('../src/db')

describe('group.js testing suite', () => {
  test('Create a group', () => {
    const _group = {
      _id: '64dbee9baf23d8dc32bcbad3',
      name: 'Test Group',
      contributors: ['UID12345'],
      subscribers: ['UID56789'],
      postTime: 0,
      channel: '#test-channel'
    }

    mockingoose(Group).toReturn(_group, 'findOne')
    return Group.findById({ _id: '64dbee9baf23d8dc32bcbad3' }).then(group => {
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
        channel: '#ex-channel'
      },
      {
        name: 'Group 2',
        contributors: ['UID123'],
        subscribers: ['UIS789'],
        postTime: 0,
        channel: '#ex-channel'
      },
      {
        name: 'Group 3',
        contributors: ['UID123', 'UID456', 'UID789'],
        subscribers: ['UIS789'],
        postTime: 0,
        channel: '#ex-channel'
      }
    ]

    mockingoose(Group).toReturn(groups, 'find')

    const result = await listGroups()

    expect(result).toBe('Group 1 --- Num Members: 2\nGroup 2 --- Num Members: 1\nGroup 3 --- Num Members: 3\n')
  })

  test('No groups returned from DB', async () => {
    const groups = []
    mockingoose(Group).toReturn(groups, 'find')
    const result = await listGroups()
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
      channel: 'fake-channel'
    }
    let id
    // Mock the create operation to return a mock group with the provided ID
    mockingoose(Group).toReturn({ _id: id }, 'create')

    const result = await addToDB(fakeGroup)
    expect(result).not.toBeNull()
  })
})
