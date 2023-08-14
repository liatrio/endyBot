const { App, LogLevel } = require('@slack/bolt')
const mongoose = require('mongoose')
require('dotenv').config()

// setting up app
const app = new App({
  token: JSON.parse(process.env.SLACK_CREDS).SLACK_BOT_TOKEN,
  appToken: JSON.parse(process.env.SLACK_CREDS).SLACK_APP_TOKEN,
  socketMode: true,
  LogLevel: LogLevel.DEBUG
})

// starting app
app.start(process.env.PORT || 3000).then(console.log('⚡️ Bolt app is currently running!'))

// connect to database
const db = process.env.DEV == 1 ? 'db' : '127.0.0.1'
mongoose.connect(`mongodb://${db}:27017/test`).then(
  () => {
    console.log('Successfully connected to db')
  },
  err => {
    console.log('Could not connect to db. Error: ' + err)
  }
)

/**
 * slash command stuff
 * eventually i think we should have an array of commands that will be passed in to determine what func to call
 * for now im just making it for the group creation
 * i think this should work but im not too sure how were testing our actual slack app
 */

app.command('/createGroup', async ({ command, ack, respond }) => {
  await ack()

  // parsing our command via white space
  const userIDs = command.text.split(' ')

  // we store the response sent to us from the request to create a convo group
  const groupRes = await app.client.conversations.create({
    token: JSON.parse(process.env.SLACK_CREDS).SLACK_BOT_TOKEN,
    name: 'endybot-test-group'
  })

  // mapping our
  const invites = userIDs.map(userId =>
    app.client.conversations.invite({
      token: JSON.parse(process.env.SLACK_CREDS).SLACK_BOT_TOKEN,
      channel: groupRes.channel.id,
      users: userId
    })
  )
  await Promise.all(invites)

  await respond(`User group created with ${userIDs.length} members!`)
})

/**
 * creating user group
 */

// const createGroup = () => {
//   app.client.usergroups.create(token, 'test group')
// }

/* Below is an example of how to interact with the database using Mongoose

// creating a model
const BModel = mongoose.model('BModel', { name: String })

// creating an entry for the model and saving it
const testEnt = new BModel({ name: 'Deployment working' })
testEnt.save().then(() => console.log('meow'))

// creating another entry and saving it
const another = new BModel({name: 'Hello!'})
another.save().then(() => console.log('another added'))

// querying the database
const returned = BModel.find({name: 'Hello!'})
returned.then(() => console.log(returned)) */

module.exports = { app }
