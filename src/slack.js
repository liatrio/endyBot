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
            action_id: 'group_create_name'
          },
          label: {
            type: 'plain_text',
            text: 'Group Name',
            emoji: true
          },
          block_id: 'group_name'
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
            action_id: 'group_create_contributors'
          },
          label: {
            type: 'plain_text',
            text: 'Contributors',
            emoji: true
          },
          block_id: 'contributors'
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
            action_id: 'group_create_subscribers'
          },
          label: {
            type: 'plain_text',
            text: 'Subscribers',
            emoji: true
          },
          block_id: 'subscribers'
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
            action_id: 'group_create_time'
          },
          label: {
            type: 'plain_text',
            text: 'Time of day to remind contributors to make EOD post (their time)',
            emoji: true
          },
          block_id: 'create_time'
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
            action_id: 'group_create_channel'
          },
          label: {
            type: 'plain_text',
            text: 'Channel of EOD thread',
            emoji: true
          },
          block_id: 'channel'
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

module.exports = { sendCreateModal, parseCreateModal }
