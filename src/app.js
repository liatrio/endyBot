const { App } = require('@slack/bolt')
const slack = require('./slack')
const database = require('./db')
const schedule = require('./schedule')
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
    case 'help': {
      respond('hello there! theres not much to see here yet')
      break
    }
    default:
      respond(`Command ${command.text} not found`)
      break
  }
})

// listen for response from create-group-view modal
app.view('create-group-view', async ({ view, ack }) => {
  await ack()

  // Parsing the response from the modal into a JSON to send to db
  const newGroup = slack.parseCreateModal(view)

  // Send new group info to db
  const groupID = await database.addToDB(newGroup)
  console.log(groupID)

  // Restart the cron scheduler to account for the new group
  schedule.scheduleCronJob(groupID)
})

// listen for response from EOD-response modal
app.view('EOD-response', async ({ view, ack }) => {
  await ack()

  // handle response from EOD modal here
})

// listen for 'additional notes' button from EOD-reponse modal
app.action('add_notes', async ({ ack, body }) => {
  await ack()

  slack.updateEODModal(app, body, 'notes')
})

// lisen for 'add blockers' button from EOD-response modal
app.action('add_blockers', async ({ ack, body }) => {
  await ack()

  slack.updateEODModal(app, body, 'blockers')
})

// lisen for 'write eod' button from dm
app.action('write_eod', async ({ ack, body }) => {
  await ack()

  slack.sendEODModal(app, body.trigger_id)
})

module.exports = { app }
