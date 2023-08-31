const { App } = require('@slack/bolt')
const slack = require('./slack')
const database = require('./db')
const schedule = require('./schedule')
const helpers = require('./helpers')
const appHelper = require('./app-helper')
require('dotenv').config()

// setting up app
const app = new App({
  token: JSON.parse(process.env.SLACK_CREDS).SLACK_BOT_TOKEN,
  appToken: JSON.parse(process.env.SLACK_CREDS).SLACK_APP_TOKEN,
  socketMode: true
})

// Take care of any fatal exceptions and ensure the app doesn't crash
process.on('unhandledRejection', (reason, p) => {
  console.error('Unhandled Rejection at:', p, 'reason:', reason)
})

process.on('uncaughtException', (error) => {
  console.error(`Caught exception: ${error}\n` + `Exception origin: ${error.stack}`)
})

// Define some global variables so they can be recognized by all try/catch blocks
let slashcommand

// list of all cron tasks. This will be needed to stop tasks upon group deletion
const allTasks = []
const eodSent = []

// starting app
try {
  app.start(process.env.PORT || 3000).then(console.log('⚡️ Bolt app is currently running!'))

  // determine slash command from dev value
  slashcommand = '/endybot'
  if (process.env.DEV == 1) {
    slashcommand = '/endybot-dev'
  }

  // upon startup, setup a cron job for all groups in the database
  schedule.startCronJobs(allTasks, app)
} catch (error) {
  console.log(`Error starting app: ${error.message}`)
}

try {
  // listen for user commands
  app.command(slashcommand, async ({ command, ack, respond }) => {
    await ack()

    // declare command object to be populated in commandParse
    const commandObj = appHelper.commandParse(command.text)

    switch (commandObj.cmd) {
      case 'create':{
        // open group create modal
        try {
          await slack.sendCreateModal(app, command.trigger_id)
        } catch (error) {
          respond('Whoops! Looks like we bit off a bit more than we can chew. Please re-attempt to create the group in a few moments.')
        }
        break
      }
      case 'subscribe': {
        const res = await database.addSubscriber(commandObj.groupName, command.user_id)
        respond(res)
        break
      }
      case 'unsubscribe': {
        const res = await database.removeSubscriber(commandObj.groupName, command.user_id)
        schedule.removeSubscriberTask(allTasks, commandObj.groupName, command.user_id)
        respond(res)
        break
      }
      case 'delete':{
        const res = await appHelper.handleGroupDelete(app, allTasks, commandObj.groupName, command.user_id)
        respond(res)
        break
      }
      case 'list': {
        const data = await database.listGroups(command.user_id)
        respond(data)
        break
      }
      case 'describe': {
        const data = await database.describeGroup(commandObj.groupName)
        respond(data)
        break
      }
      case 'help': {
        respond("*EndyBot* automates the process of creating and locating EOD threads for teams. 'Contributors' are prompted with neat forms to fill out at a specified time which will populate a thread in a specified channel. It also DMs 'Subscribers' with a link to the thread at the end of the day for easy reference.\n\nAll current working commands: \n\n* *create* *\n   -------\nusage: */endyBot create*\ndescription: Prompts the user with a form to fill out to create a group. Allows the user to specify the group name, contributors, subscribers, time of day contributors will recieve their EOD form, and the channel the thread will live in. The times indicated in the part of the form is EST. \n\n\n* *delete* *\n   -------\nusage: */endyBot delete <group_name>*\ndescription: Removes a group from the process and stops all scheduled messages from endyBot to submit EODs.\n\n\n* *list* *\n  ----\nusage: */endyBot list*\ndescription: Provides all the groups currently added to endyBot and their corresponding number of contributors. It also identifies which groups the user who called the function is subscribed to.\n\n\n* *describe* *\n  -----------\nusage: */endyBot describe <group name>*\ndescription: describes all the attributes of a group. Group attributes include contributors, subscribers, channel the thread will be posted in, time the thread will be posted (EST)\n\n\n* *subscribe* *\n  ------------\nusage: */endyBot subscribe <group_name>*\ndescription: subscribes the user who performs the command to the specified group. This acts as an opt-in to receive messages about the group.\n\n\n* *unsubscribe* *\n  ---------------\nusage: */endyBot unsubscribe <group_name>*\ndescription: unsubscribes the user who performs the command from the specified group.")
        break
      }
      // This triggers if a command that needs a group to be specified (ie describe, delete, etc.) is called without a group name. The parsing function overrides the command as 'noGroup'
      case 'noGroup': {
        respond('Oops! That command requires a group name to be specified.\nFor reference, use: *\'/endyBot help\'*')
        break
      }
      default:
        respond(`Sorry, *${commandObj.cmd}* is not a valid command.\nFor reference, use: *'/endyBot help'*`)
        break
    }
  })
} catch (error) {
  console.log(`Error in app.command function: ${error.message}`)
}

try {
  // listen for response from create-group-view modal
  app.view('create-group-view', async ({ view, ack }) => {
    await ack()

    // Parsing the response from the modal into a JSON to send to db
    const newGroup = slack.parseCreateModal(view)

    // Send new group info to db
    const groupID = await database.addToDB(newGroup)

    // Add the new group to the cron scheduler
    const group = await database.getGroup(undefined, groupID)
    schedule.scheduleCronJob(allTasks, group, app)
  })

  // listen for response from EOD-response modal
  app.view('EOD-response', async ({ body, ack }) => {
    await ack()
    appHelper.iterateEodSent(app, eodSent, body)

    // handle response from EOD modal here
    slack.postEODResponse(app, body.view, body.user.id)
  })
} catch (error) {
  console.log(`Error in app.view: ${error.message}`)
}

try {
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
} catch (error) {
  console.log(`Error in app.action: ${error.message}`)
}

module.exports = { app }
