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
      respond("EndyBot automates the process of creating and locating EOD threads for teams. 'Contributors' are prompted with neat forms to fill out at a specified time which will populate a thread in a specified channel. It also DMs 'Subscribers' with a link to the thread at the end of the day for easy reference.\n\nAll current working commands: \n\ncreate:\n------\nusage: /endyBot create\ndescription: Prompts the user with a form to fill out to create a group. Allows the user to specify the group name, contributors, subscribers, time of day contributors will recieve their EOD form, and the channel the thread will live in.\n\ndelete:\n------\nusage: /endyBot delete <group_name>\ndescription: Removes a group from the process and stops all scheduled messages from endyBot to submit EODs.\n\nlist:\n----\nusage: /endyBot list\ndescription: Provides all the groups currently added to endyBot and their corresponding number of contributors. It also identifies which groups the user who called the function is subscribed to.\n\nsubscribe:\n---------\nusage: /endyBot subscribe <group_name>\ndescription: subscribes the user who performs the command to the specified group. This acts as an opt-in to receive messages about the group.\n\nunsubscribe:\n-----------\nusage: /endyBot unsubscribe <group_name>\ndescription: unsubscribes the user who performs the command from the specified group.")
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
  schedule.scheduleCronJob(groupID, app)
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
