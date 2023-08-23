// put any helpers here that don't have any other good spot to go
/**
 *
 * @param {*} message - Should be in the form 'It's time to write your EOD post for \*[GROUP NAME]!\*"
 * @returns The group name from the message above. Will return -1 on error.
 */
function groupNameFromMessage (message) {
  const splitMessage = message.split('*')
  if (splitMessage.length != 3) {
    // message was not 'It's time to write your EOD post for *[GROUPNAME]!*
    return -1
  }
  const groupName = splitMessage[1]
  if (groupName.length < 2) {
    // group name was empty
    return -1
  }
  return groupName.substring(0, groupName.length - 1)
}

/**
 * Take an EOD modal response view and return a generated block object
 * @param {*} view The view returned from the modal response
 * @returns A block object
 */
function formatEODResponse (values, userDisplayName) {
  const block = [
    {
      type: 'section',
      text: {
        type: 'mrkdwn',
        text: `*@${userDisplayName}'s EOD Response*`
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
  Object.keys(values).forEach(function (key) {
    // getting the text the user entered
    const usrResponse = values[key][key].value

    // getting the associated header and adding user text
    const responseBlock = headingMap[key]
    responseBlock[2].text.text = usrResponse

    // adding each new block to the block list
    for (let i = 0; i < responseBlock.length; i++) {
      block.push(responseBlock[i])
    }
  })

  return block
}

module.exports = { groupNameFromMessage, formatEODResponse }
