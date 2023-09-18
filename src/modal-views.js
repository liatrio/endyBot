const groupCreate = {
  type: 'modal',
  callback_id: 'create-group-view',
  title: {
    type: 'plain_text',
    text: 'Create EOD Group',
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
        text: 'Time of day at which users will get a reminder to make their EOD post (In their Timezone)',
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

const eodDefault = {
  type: 'modal',
  callback_id: 'EOD-response',
  title: {
    type: 'plain_text',
    text: 'EOD Post',
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
      type: 'input',
      element: {
        type: 'plain_text_input',
        multiline: true,
        action_id: 'what_did'
      },
      label: {
        type: 'plain_text',
        text: 'What did you do today?',
        emoji: true
      },
      block_id: 'what_did'
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
            text: 'Any Blockers?',
            emoji: true
          },
          action_id: 'add_blockers'
        },
        {
          type: 'button',
          text: {
            type: 'plain_text',
            text: 'Any Additional Notes?',
            emoji: true
          },
          action_id: 'add_notes'
        }
      ],
      block_id: 'EOD_buttons'
    }
  ]
}

const eodBlockers = {
  type: 'modal',
  callback_id: 'EOD-response',
  title: {
    type: 'plain_text',
    text: 'EOD Post',
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
      type: 'input',
      element: {
        type: 'plain_text_input',
        multiline: true,
        action_id: 'what_did'
      },
      label: {
        type: 'plain_text',
        text: 'What did you do today?',
        emoji: true
      },
      block_id: 'what_did'
    },
    {
      type: 'divider'
    },
    {
      type: 'input',
      element: {
        type: 'plain_text_input',
        multiline: true,
        action_id: 'blockers'
      },
      label: {
        type: 'plain_text',
        text: 'Blockers',
        emoji: true
      },
      block_id: 'blockers'
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
            text: 'Any Additional Notes?',
            emoji: true
          },
          action_id: 'add_notes'
        }
      ],
      block_id: 'EOD_buttons'
    }
  ]
}

const eodNotes = {
  type: 'modal',
  callback_id: 'EOD-response',
  title: {
    type: 'plain_text',
    text: 'EOD Post',
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
      type: 'input',
      element: {
        type: 'plain_text_input',
        multiline: true,
        action_id: 'what_did'
      },
      label: {
        type: 'plain_text',
        text: 'What did you do today?',
        emoji: true
      },
      block_id: 'what_did'
    },
    {
      type: 'divider'
    },
    {
      type: 'input',
      element: {
        type: 'plain_text_input',
        multiline: true,
        action_id: 'additional_notes'
      },
      label: {
        type: 'plain_text',
        text: 'Additional Notes',
        emoji: true
      },
      block_id: 'additional_notes'
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
            text: 'Any Blockers?',
            emoji: true
          },
          action_id: 'add_blockers'
        }
      ],
      block_id: 'EOD_buttons'
    }
  ]
}

const eodBoth = {
  type: 'modal',
  callback_id: 'EOD-response',
  title: {
    type: 'plain_text',
    text: 'EOD Post',
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
      type: 'input',
      element: {
        type: 'plain_text_input',
        multiline: true,
        action_id: 'what_did'
      },
      label: {
        type: 'plain_text',
        text: 'What did you do today?',
        emoji: true
      },
      block_id: 'what_did'
    },
    {
      type: 'divider'
    },
    {
      type: 'input',
      element: {
        type: 'plain_text_input',
        multiline: true,
        action_id: 'blockers'
      },
      label: {
        type: 'plain_text',
        text: 'Blockers',
        emoji: true
      },
      block_id: 'blockers'
    },
    {
      type: 'divider'
    },
    {
      type: 'input',
      element: {
        type: 'plain_text_input',
        multiline: true,
        action_id: 'additional_notes'
      },
      label: {
        type: 'plain_text',
        text: 'Additional Notes',
        emoji: true
      },
      block_id: 'additional_notes'
    }
  ]
}

module.exports = { groupCreate, eodDefault, eodBlockers, eodNotes, eodBoth }
