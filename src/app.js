const { App } = require('@slack/bolt')
const slack = require('./slack')
const database = require('./db.js')
require('dotenv').config()

// setting up app
const app = new App({
  token: JSON.parse(process.env.SLACK_CREDS).SLACK_BOT_TOKEN,
  appToken: JSON.parse(process.env.SLACK_CREDS).SLACK_APP_TOKEN,
  socketMode: true
})

// starting app
app.start(process.env.PORT || 3000).then(console.log('⚡️ Bolt app is currently running!'))

// determine slash command from dev value
let slashcommand = '/endybot'
if (process.env.DEV == 1) {
  slashcommand = '/endybot-dev'
}

app.command(slashcommand, async ({ command, ack, respond }) => {
  await ack()

  console.log(command)

  switch (command.text) {
    case 'create':{
      // send user the form (return filled out form)
      slack.sendCreateModal(app, command.trigger_id)
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

    default:
      respond(`Command ${command.text} not found`)
      break
  }
})

module.exports = { app }
