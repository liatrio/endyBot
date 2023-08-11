const { App } = require('@slack/bolt')
const { mongoose } = require('mongoose')
// const User = require('./db/user')
// const Post = require('./db/post')
// const Group = require('./db/group')
require('dotenv').config()

// setting up app
const app = new App({
  token: JSON.parse(process.env.SLACK_CREDS).SLACK_BOT_TOKEN,
  appToken: JSON.parse(process.env.SLACK_CREDS).SLACK_APP_TOKEN,
  socketMode: true
})

// starting app
app.start(process.env.PORT || 3000).then(console.log('⚡️ Bolt app is currently running!'))

// connect to database
const db = process.env.DEV == 1 ? 'db' : '127.0.0.1'
mongoose.connect(`mongodb://${db}:27017/endybot`).then(
  () => {
    console.log('Successfully connected to db')
  },
  err => {
    console.log('Could not connect to db. Error: ' + err)
  }
)

/* Code below populates some test data into the db

const user1 = new User({
  slackId: '12345',
  fullName: 'John Doe',
  displayName: 'johnd'
})

const user2 = new User({
  slackId: '678',
  fullName: 'John Noe',
  displayName: 'johnn'
})

const user3 = new User({
  slackId: '91011',
  fullName: 'John Soe',
  displayName: 'johns'
})

const user4 = new User({
  slackId: '121314',
  fullName: 'John Moe',
  displayName: 'johnm'
})

user1.save()
user2.save()
user3.save()
user4.save()

const group = new Group({
  name: 'The best group',
  contributors: [user1, user2],
  subscribers: [user3, user4]
})

group.save()

const post = new Post({
  date: Date.now(),
  message: "I was so productive today it was craaaazy",
  poster: user2,
  group: group
})

post.save()
*/

module.exports = { app }
