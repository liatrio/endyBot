// Put all functions using the slack API here

async function sendCreateModal (app, triggerId) {
  const res = await app.client.views.open({
    trigger_id: triggerId,
    view: {
      type: 'modal',
      callback_id: 'create-group-view',
      title: {
        type: 'plain_text',
        text: 'endyBot',
        emoji: true
      },
      submit: {
        type: 'plain_text',
        text: 'Submit',
        emoji: true
      },
      close: {
        type: 'plain_text',
        text: 'Cancel',
        emoji: true
      },
      blocks: [
        {
          type: 'section',
          text: {
            type: 'mrkdwn',
            text: 'Please enter the following information to create a *new EOD group*'
          }
        },
        {
          type: 'divider'
        },
        {
          type: 'input',
          element: {
            type: 'plain_text_input',
            action_id: 'group-create-name'
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
            action_id: 'group-create-contributors'
          },
          label: {
            type: 'plain_text',
            text: 'Contributors',
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
            action_id: 'group-create-subscribers'
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
            initial_time: '16:00',
            placeholder: {
              type: 'plain_text',
              text: 'Select time',
              emoji: true
            },
            action_id: 'group-create-time'
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
            action_id: 'group-create-channel'
          },
          label: {
            type: 'plain_text',
            text: 'Channel of EOD thread',
            emoji: true
          }
        }
      ]
    }
  })

  if (res.ok != true) {
    console.log(`Error opening modal: ${res.error}`)
    return -1
  }
  return 0
}

module.exports = { sendCreateModal }
