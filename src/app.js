const { App } = require('@slack/bolt')
const { mongoose } = require('mongoose')
const slack = require('./slack')
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

app.command('/endybot-dev', async ({ command, ack, respond }) => {
  await ack()

  switch (command.text) {
    case 'create':
      // send user the form (return filled out form)
      slack.sendCreateForm(app, command.user_id)
      // parse form (filled out form -> function -> json object {groupName, contributor list, subscriber list, postTime, channel})
      // use form input to create group in db (json object from above -> function -> json obj {groupName, contributors list, subscribers list, channel, success})
      // respond to user ("added group x with users a, b, c to channel y" or "failed to create group x")
      break
    default:
      respond(`Command ${command} not found`)
      break
  }
})

module.exports = { app }
