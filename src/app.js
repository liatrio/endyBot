const { App } = require('@slack/bolt')
require('dotenv').config()
const database = require('./db.js')
const slack = require('./slack')
const cron = require('node-cron')

// setting up app
const app = new App({
  token: JSON.parse(process.env.SLACK_CREDS).SLACK_BOT_TOKEN,
  appToken: JSON.parse(process.env.SLACK_CREDS).SLACK_APP_TOKEN,
  socketMode: true
})

// starting app
app.start(process.env.PORT || 3000).then(console.log('⚡️ Bolt app is currently running!'))

app.command('/endybot-dev', async ({ command, ack, respond }) => {
  await ack()

  switch (command.text) {
    case 'create':{
      // send user the form (return filled out form)
      // parse form (filled out form -> function -> json object {groupName, contributor list, subscriber list, postTime, channel})
      // use form input to create group in db (json object from above -> function -> json obj {groupName, contributors list, subscribers list, channel, success})

      const groupID = await database.addToDB()

      if (groupID) {
        console.log('great success')
        break
      } else {
        console.log('great failure')
        break
      }
    }
    case 'list': {
      const data = await database.listGroups()
      respond(`${data}`)
      break
    }
    case 'help': {
      respond('hello there! theres not much to see here yet')
      break
    }
    default:
      respond(`Command ${command.text} not found`)
      break
  }
})

/**
 * scheduler posts at 5pm pst
 * getchannel returns the channel id from the db
 * create post posts a message to the channel from the id passed in
 */
cron.schedule('0 17 * * 1-5', () => {
  const cId = database.getChannel()
  slack.createPost(cId)
})

module.exports = { app }
