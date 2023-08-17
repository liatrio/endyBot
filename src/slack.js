// Put all functions using the slack API here
const app = require('./app')

async function createPost (group) {
  try {
    const cID = group.channel
    const groupname = group.name
    const threadId = await app.client.chat.postMessage({
      token: app.token,
      channel: cID,
      text: `${groupname} is a test message :thread:`
    })
    console.log('thread created')
    return threadId
  } catch (error) {
    console.error('something happened while making the thread: ', error)
    return null
  }
}

async function dmUsers (users) {
  for (const user of users) {
    if (users.length() != 0) {
      try {
        app.client.chat.postMessage({
          channel: user,
          text: 'this is a test !'
        })
        console.log('message sent')
      } catch (error) {
        console.error('something happened while sending dm: ', error)
      }
    } else {
      console.log('no users in group ?')
    }
  }
}

module.exports = { createPost, dmUsers }
