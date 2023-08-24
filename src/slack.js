// Put all functions using the slack API here
const views = require('./modal-views')
require('dotenv').config() // stores our organization link for slack

/**
 * creates a post in a specified channel
 * @param {*} app
 * @param {*} group
 * @returns returns the timestamp of the post on success and null on failure
*/
async function createPost (app, group) {
  console.log(group)
  try {
    const cID = group.channel
    const groupname = group.name
    const res = await app.client.chat.postMessage({
      channel: cID,
      text: `${groupname} EOD :thread:`
    })
    return res.ts
  } catch (error) {
    console.error(`something happened while making the thread\n group: ${group.name}\n channel: ${group.channel}\n error: `, error)
    return null
  }
}

/**
 * sends a message to each contributor in our db for a respective group
 * @param {*} app
 * @param {*} group
 * @returns 0 on success and -1 if there are no contributors
 */
async function dmUsers (app, group) {
  if (!group.contributors.length) {
    console.log('no contributors in the group!')
    return -1
  }
  for (const user of group.contributors) {
    try {
      app.client.chat.postMessage({
        channel: user,
        blocks: [
          {
            type: 'section',
            text: {
              type: 'mrkdwn',
              text: `It's time to write your EOD posts for *${group.name}!*`
            }
          },
          {
            type: 'divider'
          },
          {
            type: 'actions',
            elements: [
              {
                type: 'button',
                text: {
                  type: 'plain_text',
                  text: 'Begin EOD Post',
                  emoji: true
                },
                action_id: 'write_eod'
              }
            ]
          }
        ]
      })
      console.log('message sent')
    } catch (error) {
      console.error('something happened while sending dm: ', error)
      continue
    }
  }
  return 0
}

/**
 * checks that our input is not malformed or non existent
 * @param {*} group
 * @param {*} threadID
 * @returns 0-3 0 being ok and 1-3 being different errors
 */
async function validateInput (group, threadID) {
  if (!group.subscribers.length) {
    console.log('group length is 0')
    return 1
  }
  if (!group.channel) {
    console.log('group channel is a null object')
    return 2
  }
  if (!threadID) {
    console.log('thread id is null')
    return 3
  }
  return 0
}

/**
 * sends a message of EOD link to subscribers stored in our db
 * @param {*} app
 * @param {*} group
 * @param {*} threadID
 * @returns variable check which should be 0 on success and 1,2, or 3 depending on the error
 */
async function dmSubs (app, group, threadID) {
  const check = validateInput(group, threadID)
  // unsure how to make this more dynamic simply unless we intend to distribute this amongst multiple organization workspaces
  const link = `${process.env.ORG}${group.channel}/p${threadID}`

  for (const sub of group.subscribers) {
    try {
      app.client.chat.postMessage({
        channel: sub,
        blocks: [
          {
            type: 'section',
            text: {
              type: 'mrkdwn',
              text: `Hey there, here's ${group.name}'s EOD thread`
            }
          },
          {
            type: 'divider'
          },
          {
            type: 'section',
            text: {
              type: 'mrkdwn',
              text: `*${link}*`
            }
          }]
      })
    } catch (error) {
      console.log('')
      console.error(`something went wrong trying to send the message: \n \
      sub: ${group.sub}\n \
      group: ${group.name}\n \
      error: `, error)
      continue
    }
  }
  return check
}

async function sendCreateModal (app, triggerId) {
  const res = await app.client.views.open({
    trigger_id: triggerId,
    view: views.groupCreate
  })

  if (res.ok != true) {
    console.log(`Error opening modal: ${res.error}`)
    return -1
  }
  return 0
}

function parseCreateModal (view) {
  try {
    const rawTime = view.state.values.create_time.group_create_time.selected_time
    const time = Number(rawTime.substring(0, 2))
    const newGroup = {
      name: view.state.values.group_name.group_create_name.value,
      contributors: view.state.values.contributors.group_create_contributors.selected_users,
      subscribers: view.state.values.subscribers.group_create_subscribers.selected_users,
      postTime: time,
      channel: view.state.values.channel.group_create_channel.selected_channel
    }

    return newGroup
  } catch (err) {
    console.log(`Unable to parse view. Please double-check the input. Error: ${err}`)
    return null
  }
}

async function sendEODModal (app, triggerId, groupName) {
  const modal = views.eodDefault
  modal.private_metadata = groupName
  const res = await app.client.views.open({
    trigger_id: triggerId,
    view: modal
  })

  if (res.ok != true) {
    console.log(`Error opening modal: ${res.error}`)
    return -1
  }
  return 0
}

function updateEODModal (app, body, toAdd) {
  let targetView = 1 // represents default modal
  const viewMap = {
    1: views.eodDefault,
    3: views.eodBlockers,
    5: views.eodNotes,
    7: views.eodBoth
  }
  // check which element we're adding
  switch (toAdd) {
    case 'blockers':
      targetView += 2
      break
    case 'notes':
      targetView += 4
      break
    default:
      console.log('Attempting to add invalid block')
      return -1
  }

  // check which elements are in the view already
  if (body.view.blocks.length > 3) {
    // default view only has 3 elements, not default. Set opposite bit so we have  both
    switch (toAdd) {
      case 'blockers':
        targetView += 4
        break
      case 'notes':
        targetView += 2
        break
    }
  }

  // add metadata to target modal
  const modal = viewMap[targetView]
  modal.private_metadata = body.view.private_metadata

  // update view
  app.client.views.update({
    view: modal,
    view_id: body.view.id
  })

  return targetView
}

async function updateEodReminder (app, body) {
  try {
    const convo = await app.client.conversations.history({
      channel: `${body.user.id}`,
      oldest: `${body.message.ts}`,
      inclusive: true,
      count: 1
    })

    if (!convo.messages.length) {
      console.log('empty message')
      return convo.messages
    }

    const message = convo.messages[2].blocks
    const removed = message.filter(block => block.type !== 'actions')
    const res = await app.client.chat.update({
      channel: body.user.id,
      timestamp: body.message.ts,
      message: removed
    })

    if (res.ok) {
      return res
    }
  } catch (error) {
    console.error(error)
  }
}

module.exports = { sendCreateModal, parseCreateModal, sendEODModal, updateEODModal, dmUsers, createPost, dmSubs, updateEodReminder }
