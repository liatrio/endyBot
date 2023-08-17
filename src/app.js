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

  switch (command.text) {
    case 'create':{
      // open group create modal
      slack.sendCreateModal(app, command.trigger_id)
      break
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

app.view('create-group-view', async ({ view, ack }) => {
  await ack()

  // Parsing the response from the modal into a JSON to send to db
  const newGroup = slack.parseCreateModal(view)

  // Send new group info to db
  const groupID = await database.addToDB(newGroup)
  console.log(groupID)
})

module.exports = { app }
