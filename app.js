const { App } = require('@slack/bolt')
const mongoose = require('mongoose')
const { EodModel } = require('./db/schema')
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
mongoose.connect(`mongodb://${db}:27017/test`).then(
  () => {
    console.log('Successfully connected to db')
  },
  err => {
    console.log('Could not connect to db. Error: ' + err)
  }
)

/* Below is an example of how to interact with the database using Mongoose */

// creating a model and an entry for the model and saving it
const eodModel = new EodModel({
  group: [{
    groupName: 'testGroup',
    post: [{
      date: Date(),
      contributor: {
        name: 'testUser',
        content: 'today I set up fake schemas',
        OOO: false, // out of office
        posted: false, // whether or not the contributor posted
        sent: false // whether or not a reminder was sent to the contributor
      }
    }]
  }],
  subscribers: [{
    name: 'testBoss',
    sent: false
  }]
})

eodModel.save().then(() => console.log('wowzers!'))

// const BModel = mongoose.model('BModel', { name: String })

// const testEnt = new BModel({ name: 'Deployment working' })
// testEnt.save().then(() => console.log('meow'))

// creating another entry and saving it
/* const another = new BModel({name: 'Hello!'})
another.save().then(() => console.log('another added'))

// querying the database
const returned = BModel.find({name: 'Hello!'})
returned.then(() => console.log(returned)) */

module.exports = { app }
