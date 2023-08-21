// Put all functions using the slack API here
const views = require('./modal-views')

async function createPost (app, group) {
  console.log(group)
  try {
    const cID = group.channel
    const groupname = group.name
    const threadId = await app.client.chat.postMessage({
      channel: cID,
      text: `${groupname} EOD :thread:`
    })
    console.log('thread created')
    return threadId.ts
  } catch (error) {
    console.error('something happened while making the thread: ', error)
    return null
  }
}

async function dmUsers (app, group) {
  if (group.contributors.length != 0) {
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
  } else {
    console.log('Error: no contributors in group')
    return -1
  }
  return 0
}

async function dmSubs (app, group, threadID) {
  if (group.subscribers.length != 0) {
    const link = `https://liatrio.slack.com/archives/${group.channel}/p${threadID}`
    for (const sub of group.subscribers) {
      try {
        app.client.chat.postMessage({
          channel: sub,
          // text: `test message for sending to subscribers \n \
          // ${link}`
          blocks: [
            {
              type: 'section',
              text: {
                type: 'mrkdwn',
                text: `Hey there ${group.sub}, here's *${group.name}!* EOD thread`
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
            }]
        })
        console.log('message sent')
        return 0
      } catch (error) {
        console.error('something went wrong trying to send the message: ', error)
        continue
      }
    }
  } else {
    console.log("there aren't any subscribers")
    return -1
  }
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

module.exports = { sendCreateModal, parseCreateModal, sendEODModal, updateEODModal, dmUsers, createPost, dmSubs }
