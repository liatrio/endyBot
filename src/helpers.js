const db = require('./db')
// put any helpers here that don't have any other good spot to go
/**
 *
 * @param {String} message - Should be in the form 'It's time to write your EOD post for \*[GROUP NAME]!\*"
 * @returns The group name from the message above. Will return -1 on error.
 */
function groupNameFromMessage (body) {
  // getting group name from different places depending on button source
  if (body.container.type == 'message') {
    // parsing group name
    const splitMessage = body.message.text.split('*')
    if (splitMessage.length != 3) {
      // Group name was not surrounded by *
      return -1
    }
    const groupName = splitMessage[1]
    if (groupName.length < 2) {
      // group name was empty
      return -1
    }
    return groupName.substring(0, groupName.length - 1)
  } else if (body.container.type == 'view') {
    const splitMessage = body.actions[0].text.text.split(' ')
    if (splitMessage.length != 4) {
      // Message was not in form "write groupname eod post"
      return -1
    }

    return splitMessage[1]
  }
}

/**
 * Take an EOD modal response view and return a generated block object
 * @param {JSON} view The view returned from the modal response
 * @returns A block object
 */
function formatEODResponse (responseObj, uid) {
  const block = [
    {
      type: 'section',
      text: {
        type: 'mrkdwn',
        text: `*<@${uid}>'s EOD Response*`
      }
    }
  ]

  const headingMap = {
    what_did: [
      {
        type: 'divider'
      },
      {
        type: 'section',
        text: {
          type: 'mrkdwn',
          text: '*What did you do today?*'
        }
      },
      {
        type: 'section',
        text: {
          type: 'mrkdwn'
        }
      }
    ],
    blockers: [
      {
        type: 'divider'
      },
      {
        type: 'section',
        text: {
          type: 'mrkdwn',
          text: '*Blockers*'
        }
      },
      {
        type: 'section',
        text: {
          type: 'mrkdwn'
        }
      }
    ],
    additional_notes: [
      {
        type: 'divider'
      },
      {
        type: 'section',
        text: {
          type: 'mrkdwn',
          text: '*Additional Notes*'
        }
      },
      {
        type: 'section',
        text: {
          type: 'mrkdwn'
        }
      }
    ]
  }

  // looping through the values and adding blocks for each textbox the user filled out
  Object.keys(responseObj).forEach(function (key) {
    // getting the text the user entered
    // Slack returns an object with the form { block_id: { block_id: { value: 'user response' } } },
    // so grabbing the actual text looks a little gross
    const usrResponse = responseObj[key][key].value

    // getting the associated header and adding user text
    let responseBlock
    if (key in headingMap) {
      responseBlock = headingMap[key]
      responseBlock[2].text.text = usrResponse
    } else {
      responseBlock = [
        {
          type: 'divider'
        },
        {
          type: 'section',
          text: {
            type: 'mrkdwn',
            text: '*Other user responses*'
          }
        },
        {
          type: 'section',
          text: {
            type: 'mrkdwn',
            text: usrResponse
          }
        }
      ]
    }

    // adding each new block to the block list
    block.push(...responseBlock)
  })

  return block
}

/**
 * Creates the home view for a user when they open the home page
 * @param {String} user - The Slack UID of target user
 * @returns The view to send to the app homepage for that user
 */
async function constructHomeView (user) {
  const userGroups = await db.getUserGroups(user)

  const view = {
    type: 'home',
    blocks: [
      {
        type: 'header',
        text: {
          type: 'plain_text',
          text: 'Your EOD Groups',
          emoji: true
        }
      },
      {
        type: 'divider'
      }
    ]
  }

  if (userGroups.length == 0) {
    view.blocks.push(
      {
        type: 'section',
        text: {
          type: 'mrkdwn',
          text: 'Looks like you\'re not a contributor in any groups!'
        }
      }
    )
  }

  for (const group in userGroups) {
    view.blocks.push(
      {
        type: 'section',
        text: {
          type: 'mrkdwn',
          text: `${userGroups[group].name}`
        },
        accessory: {
          type: 'button',
          text: {
            type: 'plain_text',
            text: `Write ${userGroups[group].name} EOD Post`,
            emoji: true
          },
          action_id: 'write_eod'
        }
      }
    )
  }

  return view
}

module.exports = { groupNameFromMessage, formatEODResponse, constructHomeView }
