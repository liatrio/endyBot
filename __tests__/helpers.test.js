/* eslint-env jest */
const helpers = require('../src/helpers')
const db = require('../src/db')
jest.mock('../src/db')

describe('groupNameFromMessage tests', () => {
  test('Normal usage - message', () => {
    const body = {
      container: {
        type: 'message'
      },
      message: {
        text: 'It\'s time to write your EOD posts for *:immortal-hedgehogs:!* Begin EOD Post button'
      }
    }
    const res = helpers.groupNameFromMessage(body)
    expect(res).toEqual(':immortal-hedgehogs:')
  })

  test('Empty group name - message', () => {
    const body = {
      container: {
        type: 'message'
      },
      message: {
        text: 'It\'s time to write your EOD posts for ** Begin EOD Post button'
      }
    }
    const res = helpers.groupNameFromMessage(body)
    expect(res).toEqual(-1)
  })

  test('Invalid message format - message', () => {
    const body = {
      container: {
        type: 'message'
      },
      message: {
        text: 'It\'s time to write your EOD posts for *'
      }
    }
    const res = helpers.groupNameFromMessage(body)
    expect(res).toEqual(-1)
  })

  test('Normal usage - view', () => {
    const body = {
      container: {
        type: 'view'
      },
      actions: [
        {
          text: {
            text: 'write :immortal-hedgehogs: eod post'
          }
        }
      ]
    }
    const res = helpers.groupNameFromMessage(body)
    expect(res).toEqual(':immortal-hedgehogs:')
  })

  test('Empty group name - view', () => {
    const body = {
      container: {
        type: 'view'
      },
      actions: [
        {
          text: {
            text: 'write eod post'
          }
        }
      ]
    }
    const res = helpers.groupNameFromMessage(body)
    expect(res).toEqual(-1)
  })

  test('Invalid message format - view', () => {
    const body = {
      container: {
        type: 'view'
      },
      actions: [
        {
          text: {
            text: 'write post'
          }
        }
      ]
    }
    const res = helpers.groupNameFromMessage(body)
    expect(res).toEqual(-1)
  })
})

describe('formatEODResponse', () => {
  // mock uid
  const uid = 12345
  test('Empty values', () => {
    // mock values
    const values = {}

    // expected response
    const expectedBlock = [
      {
        type: 'section',
        text: {
          type: 'mrkdwn',
          text: '*<@12345>\'s EOD Response*'
        }
      }
    ]

    const res = helpers.formatEODResponse(values, uid)

    expect(res).toStrictEqual(expectedBlock)
  })

  test('Default EOD response form', () => {
    // mock values
    const values = { what_did: { what_did: { value: 'Sample\n EOD' } } }

    // expected response
    const expectedBlock = [
      {
        type: 'section',
        text: {
          type: 'mrkdwn',
          text: '*<@12345>\'s EOD Response*'
        }
      },
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
          type: 'mrkdwn',
          text: 'Sample\n EOD'
        }
      }
    ]

    const res = helpers.formatEODResponse(values, uid)

    expect(res).toStrictEqual(expectedBlock)
  })

  test('Default + Blockers EOD response form', () => {
    // mock values
    const values = {
      what_did: { what_did: { value: 'Sample\n EOD' } },
      blockers: { blockers: { value: 'Sample blockers' } }
    }

    // expected response
    const expectedBlock = [
      {
        type: 'section',
        text: {
          type: 'mrkdwn',
          text: '*<@12345>\'s EOD Response*'
        }
      },
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
          type: 'mrkdwn',
          text: 'Sample\n EOD'
        }
      },
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
          type: 'mrkdwn',
          text: 'Sample blockers'
        }
      }
    ]

    const res = helpers.formatEODResponse(values, uid)

    expect(res).toStrictEqual(expectedBlock)
  })

  test('Default + Additional notes EOD response form', () => {
    // mock values
    const values = {
      what_did: { what_did: { value: 'Sample\n EOD' } },
      additional_notes: { additional_notes: { value: 'Sample notes' } }
    }

    // expected response
    const expectedBlock = [
      {
        type: 'section',
        text: {
          type: 'mrkdwn',
          text: '*<@12345>\'s EOD Response*'
        }
      },
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
          type: 'mrkdwn',
          text: 'Sample\n EOD'
        }
      },
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
          type: 'mrkdwn',
          text: 'Sample notes'
        }
      }
    ]

    const res = helpers.formatEODResponse(values, uid)

    expect(res).toStrictEqual(expectedBlock)
  })

  test('Default + Additional notes EOD response form', () => {
    // mock values
    const values = {
      what_did: { what_did: { value: 'Sample\n EOD' } },
      blockers: { blockers: { value: 'Sample blockers' } },
      additional_notes: { additional_notes: { value: 'Sample notes' } }
    }

    // expected response
    const expectedBlock = [
      {
        type: 'section',
        text: {
          type: 'mrkdwn',
          text: '*<@12345>\'s EOD Response*'
        }
      },
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
          type: 'mrkdwn',
          text: 'Sample\n EOD'
        }
      },
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
          type: 'mrkdwn',
          text: 'Sample blockers'
        }
      },
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
          type: 'mrkdwn',
          text: 'Sample notes'
        }
      }
    ]

    const res = helpers.formatEODResponse(values, uid)

    expect(res).toStrictEqual(expectedBlock)
  })

  test('Unexpected field', () => {
    // mock values
    const values = {
      diff_val: { diff_val: { value: 'Sample\n EOD' } }
    }

    // expected response
    const expectedBlock = [
      {
        type: 'section',
        text: {
          type: 'mrkdwn',
          text: '*<@12345>\'s EOD Response*'
        }
      },
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
          text: 'Sample\n EOD'
        }
      }
    ]

    const res = helpers.formatEODResponse(values, uid)

    expect(res).toStrictEqual(expectedBlock)
  })
})

describe('constructHomeView', () => {
  test('User in one group', async () => {
    const expected = {
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
        },
        {
          type: 'section',
          text: {
            type: 'mrkdwn',
            text: 'group1'
          },
          accessory: {
            type: 'button',
            text: {
              type: 'plain_text',
              text: 'Write group1 EOD Post',
              emoji: true
            },
            action_id: 'write_eod'
          }
        }
      ]
    }

    db.getUserGroups.mockResolvedValue([
      {
        name: 'group1'
      }
    ])

    const res = await helpers.constructHomeView('')
    expect(res).toStrictEqual(expected)
  })

  test('User in several groups', async () => {
    const expected = {
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
        },
        {
          type: 'section',
          text: {
            type: 'mrkdwn',
            text: 'group1'
          },
          accessory: {
            type: 'button',
            text: {
              type: 'plain_text',
              text: 'Write group1 EOD Post',
              emoji: true
            },
            action_id: 'write_eod'
          }
        },
        {
          type: 'section',
          text: {
            type: 'mrkdwn',
            text: 'group2'
          },
          accessory: {
            type: 'button',
            text: {
              type: 'plain_text',
              text: 'Write group2 EOD Post',
              emoji: true
            },
            action_id: 'write_eod'
          }
        }
      ]
    }

    db.getUserGroups.mockResolvedValue([
      {
        name: 'group1'
      },
      {
        name: 'group2'
      }
    ])

    const res = await helpers.constructHomeView('')
    expect(res).toStrictEqual(expected)
  })

  test('User in no groups', async () => {
    const expected = {
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
        },
        {
          type: 'section',
          text: {
            type: 'mrkdwn',
            text: 'Looks like you\'re not a contributor in any groups!'
          }
        }
      ]
    }

    db.getUserGroups.mockResolvedValue([])

    const res = await helpers.constructHomeView('')
    expect(res).toStrictEqual(expected)
  })
})
