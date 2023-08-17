// Put all functions using the slack API here
const app = require('./app')

async function createPost (cID) {
  try {
    app.client.chat.postMessage({
      token: app.token,
      channel: cID,
      text: 'this is a test message'
    })
    console.log('thread created')
  } catch (error) {
    console.error('something happened while making the thread: ', error)
  }
}

module.exports = { createPost }
