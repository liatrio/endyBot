const { App, LogLevel } = require('@slack/bolt')
const mongoose = require('mongoose')
const { WebClient } = require('@slack/web-api')
const cron = require('node-cron')
require('dotenv').config()

// setting up app
const app = new App({
  token: JSON.parse(process.env.SLACK_CREDS).SLACK_BOT_TOKEN,
  appToken: JSON.parse(process.env.SLACK_CREDS).SLACK_APP_TOKEN,
  signingSecret: JSON.parse(process.env.SLACK_CREDS).SLACK_SIGNING_SECRET,
  socketMode: true,
  LogLevel: LogLevel.DEBUG
})

// initializing api client
const web = new WebClient(JSON.parse(process.env.SLACK_CREDS).SLACK_BOT_TOKEN)

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

// function to fetch usergroup id
async function getUserGroupId (groupName) {
  try {
    // list all the user groups available
    const result = await app.client.usergroups.list({
      token: JSON.parse(process.env.SLACK_CREDS).SLACK_BOT_TOKEN
    })
    if (result.ok) {
      // if we get an appropriate res we will find the group with the same handle as the one we pass into the function
      const userGroup = result.usergroups.find(group => group.handle === groupName)
      if (userGroup) {
        // if the handles match we return the group id
        return userGroup.id
      } else { console.log(`${groupName} not found`) }
    } else { console.log('unable to fetch user groups') }
  } catch (err) { console.log('error: ', err) }
  return null
}

// cron.schedule allows for a function to occur according to a specified sched
// Schedule the message to be sent every weekday at 5:00 PM Pacific Time
cron.schedule('0 17 * * 1-5', async () => {
  try {
    // eventually this should be a bit more dynamic
    const userGroupId = await getUserGroupId('Immortal Hedgehogs')

    // Fetch the members of the user group
    const userGroupResponse = await web.usergroups.users.list({
      usergroup: userGroupId
    })

    const memberIds = userGroupResponse.users

    // Send a direct message to each member
    for (const memberId of memberIds) {
      await app.client.chat.postMessage({
        token: app._token,
        channel: memberId,
        text: 'Daily reminder to make your EOD post'
      })
    }

    console.log('Scheduled direct messages sent successfully.')
  } catch (error) {
    console.error('Error sending scheduled direct messages:', error)
  }
});

(async () => {
  await app.start(process.env.PORT || 3000)
  console.log('⚡️ Bolt app is running!')
})()

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
