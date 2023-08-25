const { App } = require('@slack/bolt')
const slack = require('./slack')
const database = require('./db')
const schedule = require('./schedule')
const helpers = require('./helpers')
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

// list of all cron tasks. This will be needed to stop tasks upon group deletion
const allTasks = []

// upon startup, setup a cron job for all groups in the database
schedule.startCronJobs(allTasks, app)

// listen for user commands
app.command(slashcommand, async ({ command, ack, respond }) => {
  await ack()

  const cmd = command.text.split(' ')
  const request = cmd[0]
  const groupname = cmd[1]
  switch (request) {
    case 'create': {
      // open group create modal
      slack.sendCreateModal(app, command.trigger_id)
      break
    }
    case 'subscribe': {
      const res = await database.addSubscriber(groupname, command.user_id)
      respond(res)
      break
    }
    case 'unsubscribe': {
      const res = await database.removeSubscriber(groupname, command.user_id)
      respond(res)
      break
    }
    case 'list': {
      const data = await database.listGroups(command.user_id)
      respond(data)
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

  // Add the new group to the cron scheduler
  const group = await database.getGroup(undefined, groupID)
  schedule.scheduleCronJob(allTasks, group, app)
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

  // parse the group name from the message
  const groupName = helpers.groupNameFromMessage(body.message.text)

  // open the EOD modal
  slack.sendEODModal(app, body.trigger_id, groupName)
})

module.exports = { app }
