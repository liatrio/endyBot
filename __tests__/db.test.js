/* eslint-env jest */
// Add the above comment to all jest files so they don't fail linting due to no-undef

const mockingoose = require('mockingoose')
const Group = require('../db/group')
const User = require('../db/user')
const Post = require('../db/post')

describe('user.js testing suite', () => {
  test('Create a user', () => {
    const _usr = {
      _id: '64d673690981ecaae72f0733',
      slackId: '12345',
      fullName: 'John Doe',
      displayName: 'john'
    }

    mockingoose(User).toReturn(_usr, 'findOne')

    return User.findById({ _id: '64d673690981ecaae72f0733' }).then(usr => {
      expect(JSON.parse(JSON.stringify(usr))).toMatchObject(_usr)
    })
  })
})

describe('group.js testing suite', () => {
  test('Create a group', () => {
    const _group = {
      _id: '64d6761729773eb8f3852e74',
      name: 'Test Group',
      contributors: [
        '64d673690981ecaae72f0733'
      ],
      subscribers: [
        '64d673690981ecaae72f0733'
      ]
    }

    mockingoose(Group).toReturn(_group, 'findOne')

    return Group.findById({ _id: '64d6761729773eb8f3852e74' }).then(group => {
      expect(JSON.parse(JSON.stringify(group))).toMatchObject(_group)
    })
  })
})

describe('post.js testing suite', () => {
  test('Create a post', () => {
    const _post = {
      _id: '64d69c815bcb0bf619d482a3',
      date: '2023-08-11T08:00:00.000Z',
      message: 'This is my EOD post.',
      poster: '64d673690981ecaae72f0733',
      group: '64d6761729773eb8f3852e74'
    }

    mockingoose(Post).toReturn(_post, 'findOne')

    return Post.findById({ _id: '64d69c815bcb0bf619d482a3' }).then(post => {
      expect(JSON.parse(JSON.stringify(post))).toMatchObject(_post)
    })
  })
})
