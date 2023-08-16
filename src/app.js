const { App } = require('@slack/bolt')
const { mongoose } = require('mongoose')

require('dotenv').config()
const database = require('./db.js')

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
        console.log("great success")
        break
      } else { 
        console.log("great failure") 
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
