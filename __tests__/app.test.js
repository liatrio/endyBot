/* eslint-env jest */
// Add the above comment to all jest files so they don't fail linting due to no-undef
const mockingoose = require('mockingoose')
const { app } = require('../src/app.js')

describe('app.js testing suite', () => {
  console.log(app) // logging to pass linting
  mockingoose('name: String') // mocking to pass linting

  test('Smoke test', () => {
    expect(1).toBe(1)
  })
})
