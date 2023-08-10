const { App } = require('@slack/bolt')
const mongoose = require('mongoose')
// const { Schema, model } = mongoose
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

/* Below is an example of how to interact with the database using Mongoose

// creating a model
const BModel = mongoose.model('BModel', { name: String })

// creating an entry for the model and saving it
const kitty = new BModel({name: 'Zildjian'})
kitty.save().then(() => console.log('meow'))

// creating another entry and saving it
const another = new BModel({name: 'Hello!'})
another.save().then(() => console.log('another added'))

// querying the database
const returned = BModel.find({name: 'Hello!'})
returned.then(() => console.log(returned)) */

/**
 * dm group creation
 * needs: our client token, users
 */

// const createDmGroup = (/* we need to pass our users in here */) => {
//   const users = [] // this will hold the users passed into the func
//   app.client.conversations.open({ // this is the api call to create a group dm

//   })
// }

module.exports = { app }
