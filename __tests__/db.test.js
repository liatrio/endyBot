/* eslint-env jest */
// Add the above comment to all jest files so they don't fail linting due to no-undef

const mockingoose = require('mockingoose')
const Group = require('../db-schemas/group')
const Post = require('../db-schemas/post')

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
