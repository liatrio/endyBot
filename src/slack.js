// Put all functions using the slack API here
async function sendCreateForm (app, callingUser) {
  // open dm with calling party and get channel id
  const channelInfo = await app.client.conversations.open({ users: callingUser })
  if (channelInfo.ok != true) {
    // error opening channel
    console.log(`Error opening DM with user ${callingUser}: ${channelInfo.error}`)
    return null
  }
  const channelId = channelInfo.channel.id
  // send message w interactive componets
  app.client.chat.postMessage({
    channel: channelId,
    text: 'Please enter the following information.',
    blocks:
            [
              {
                type: 'section',
                text: {
                  type: 'mrkdwn',
                  text: 'Please enter the following information to create a new EOD group'
                }
              },
              {
                type: 'divider'
              },
              {
                type: 'input',
                element: {
                  type: 'plain_text_input',
                  action_id: 'plain_text_input-action'
                },
                label: {
                  type: 'plain_text',
                  text: 'Group Name',
                  emoji: true
                }
              },
              {
                type: 'input',
                element: {
                  type: 'multi_users_select',
                  placeholder: {
                    type: 'plain_text',
                    text: 'Select contributors',
                    emoji: true
                  },
                  action_id: 'multi_users_select-action'
                },
                label: {
                  type: 'plain_text',
                  text: 'Group Contributors',
                  emoji: true
                }
              },
              {
                type: 'input',
                element: {
                  type: 'multi_users_select',
                  placeholder: {
                    type: 'plain_text',
                    text: 'Select users',
                    emoji: true
                  },
                  action_id: 'multi_users_select-action'
                },
                label: {
                  type: 'plain_text',
                  text: 'Subscribers',
                  emoji: true
                }
              },
              {
                type: 'input',
                element: {
                  type: 'timepicker',
                  initial_time: '13:37',
                  placeholder: {
                    type: 'plain_text',
                    text: 'Select time',
                    emoji: true
                  },
                  action_id: 'timepicker-action'
                },
                label: {
                  type: 'plain_text',
                  text: 'Time of day to remind contributors to make EOD post (their time)',
                  emoji: true
                }
              },
              {
                type: 'input',
                element: {
                  type: 'channels_select',
                  placeholder: {
                    type: 'plain_text',
                    text: 'Select channel',
                    emoji: true
                  },
                  action_id: 'channel_select-action'
                },
                label: {
                  type: 'plain_text',
                  text: 'Channel of EOD thread',
                  emoji: true
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
                      text: 'Submit',
                      emoji: true
                    },
                    value: 'click_me_123',
                    action_id: 'actionId-0'
                  }
                ]
              }
            ]
  }
  )
  // handle response from interactive components
  return 0
}

module.exports = { sendCreateForm }
