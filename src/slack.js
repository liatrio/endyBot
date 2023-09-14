// Put all functions using the slack API here
const views = require('./modal-views')
const db = require('./db')
const helpers = require('./helpers')
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
      text: `*${groupname}* EOD :thread:`
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
async function dmUsers (app, group, user) {
  if (!user) {
    console.log('null user')
    return user
  }
  let message
  try {
    const res = await app.client.chat.postMessage({
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
    message = { channel: res.channel, ts: res.ts, uid: user }
    return message
  } catch (error) {
    console.error('something happened while sending dm: ', error)
    return null
  }
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
async function dmSubs (app, group, sub, threadID) {
  const check = validateInput(group, threadID)
  // unsure how to make this more dynamic simply unless we intend to distribute this amongst multiple organization workspaces
  const link = `${process.env.ORG}${group.channel}/p${threadID}`

  try {
    app.client.chat.postMessage({
      channel: sub,
      blocks: [
        {
          type: 'section',
          text: {
            type: 'mrkdwn',
            text: `Hey there, here's *${group.name}*'s EOD thread`
          }
        },
        {
          type: 'divider'
        },
        {
          type: 'section',
          text: {
            type: 'mrkdwn',
            text: `${link}`
          }
        },
        {
          type: 'divider'
        },
        {
          type: 'section',
          text: {
            type: 'mrkdwn',
            text: 'You can unsubscribe from the group at any time to stop receiving these messages'
          }
        },
        {
          type: 'divider'
        }
      ],
      // If the client doesn't support blocks, this text field will trigger and send the message
      // This avoid's bolt throwing a warning each time a message is sent
      text: `You can view *${group.name}*'s EOD thread by clicking this link: *${link}`
    })
  } catch (error) {
    console.error(`something went wrong trying to send the message: \n \
      sub: ${group.sub}\n \
      group: ${group.name}\n \
      error: `, error)
  }
  return check
}

async function sendCreateModal (app, triggerId) {
  try {
    const res = await app.client.views.open({
      trigger_id: triggerId,
      view: views.groupCreate
    })

    if (res.ok != true) {
      console.log(`Error opening modal: ${res.error}`)
      return -1
    }
    return 0
  } catch (error) {
    console.log(`Exception thrown while sending modal: ${error.message}`)
    // throw error to be caught in app.js and print a message to the user
    throw error
  }
}

function parseCreateModal (view) {
  try {
    const rawTime = view.state.values.create_time.group_create_time.selected_time
    const time = Number(rawTime.substring(0, 2))

    // creating contributor objects
    const contribs = []

    for (let i = 0; i < view.state.values.contributors.group_create_contributors.selected_users.length; i++) {
      const thisObj = {
        name: '',
        posted: false
      }

      thisObj.name = view.state.values.contributors.group_create_contributors.selected_users[i]
      contribs.push(thisObj)
    }

    const newGroup = {
      name: view.state.values.group_name.group_create_name.value,
      contributors: contribs,
      subscribers: view.state.values.subscribers.group_create_subscribers.selected_users,
      postTime: time,
      channel: view.state.values.channel.group_create_channel.selected_channel,
      ts: ''
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

async function postEODResponse (app, view, uid) {
  // get information about what thread to post the response in
  const groupName = view.private_metadata
  const group = await db.getGroup(groupName)
  if (group == null) {
    // indicates group was not found
    const errorMsg = `Group ${groupName} not found.`
    console.log(`Error positng EOD response: ${errorMsg}`)
    return Error(errorMsg)
  }

  // construct the response block
  const respBlock = helpers.formatEODResponse(view.state.values, uid)

  // send message to thread
  const res = await app.client.chat.postMessage({
    channel: group.channel,
    thread_ts: group.ts, // this is what makes this message a thread reply rather than a whole new message
    blocks: respBlock,
    text: 'EOD Response'
  })

  if (res.ok != true) {
    console.log(`Error posting EOD response: ${res.error}`)
    return res.error
  }

  return res.message.blocks
}

/**
 * sends a message to each subscriber of a group when it is deleted
 * @param {*} app
 * @param {*} group
 * @param {String} userID
 * @returns 0 on success and null if there are no subscribers
 */
async function notifySubsAboutGroupDeletion (app, group, userID) {
  // The passed in group has already been verified by handleGroupDeletion in app-helper
  if (group.subscribers.length == 0) {
    console.log('No subscribers in the group')
    return 1
  }
  // Send a message to each subscriber notifying them what group was deleted, and which user deleted it
  for (const user of group.subscribers) {
    try {
      app.client.chat.postMessage({
        channel: user,
        blocks: [
          {
            type: 'section',
            text: {
              type: 'mrkdwn',
              text: `Group *${group.name}* was deleted by <@${userID}>. You're receiving this notification because you were a subscriber of the group.\n\nYou will no longer receive EOD thread links for the group.`
            }
          }
        ]
      })
    } catch (error) {
      console.error(`something happened while notifying subscriber ${user} about ${group.name} deletion: `, error)
      continue
    }
  }
  return 0
}

/**
 * Uses the Slack API to get a list of all users in the workspace, as well as information about them.
 *
 * @param {JSON} app
 * @returns The list of all users in the current slack workspace.
 * check slack docs for object description
 */
async function getUserList (app) {
  const usrList = await app.client.users.list()

  if (usrList.ok != true) {
    // error in API call
    console.log(`Unable to get user list: ${usrList.error}`)
    return usrList.error
  }

  return usrList.members
}

/**
 * deletes a direct message for a user
 * @param {*} app
 * @param {*} user
 * @param {*} ts
 * @returns json response from slack api on success and null on failure
 */
async function eodDmUpdateDelete (app, user, ts) {
  try {
    const res = await app.client.chat.delete({
      channel: user,
      ts
    })

    if (res.ok) {
      return res
    } else {
      return null
    }
  } catch (error) {
    console.error('something went wrong while deleting the message: ', error)
  }
}

/**
 * resends a message to the user
 * @param {*} app
 * @param {*} user
 * @returns json response on success and null on failure
 */
async function eodDmUpdatePost (app, user) {
  try {
    const message = await app.client.chat.postMessage({
      channel: user,
      blocks: [
        {
          type: 'section',
          text: {
            type: 'mrkdwn',
            text: '*thank you for writing your EOD!*'
          }
        }
      ]
    })
    if (!message.ok) {
      return null
    }
    return message
  } catch (error) {
    console.error(error)
  }
}

function sendMessage (app, user, message) {
  try {
    app.client.chat.postMessage({
      channel: user,
      text: message
    })
  } catch (error) {
    console.error(`Unable to send message to ${user}: ${error}`)
    return -1
  }
}
module.exports = { sendCreateModal, parseCreateModal, sendEODModal, updateEODModal, dmUsers, createPost, postEODResponse, dmSubs, notifySubsAboutGroupDeletion, eodDmUpdateDelete, eodDmUpdatePost, getUserList, sendMessage }
