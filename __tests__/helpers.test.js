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
