/* eslint-env jest */
const helpers = require('../src/helpers')

describe('groupNameFromMessage tests', () => {
  test('Normal usage', () => {
    const message = 'It\'s time to write your EOD posts for *:immortal-hedgehogs:!* Begin EOD Post button'
    const res = helpers.groupNameFromMessage(message)
    expect(res).toEqual(':immortal-hedgehogs:')
  })

  test('Empty group name', () => {
    const message = 'It\'s time to write your EOD posts for *!* Begin EOD Post button'
    const res = helpers.groupNameFromMessage(message)
    expect(res).toEqual(-1)
  })

  test('Invalid message format', () => {
    const message = 'It\'s time to write your EOD posts for *'
    const res = helpers.groupNameFromMessage(message)
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
