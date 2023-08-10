const { app } = require('../app.js')
const mockingoose = require('mockingoose')
/* eslint-env jest */
// Add the above comment to all jest files so they don't fail linting due to no-undef

const EodSchema = require('../db/schema.js')

// Using mockingoose? look here: https://www.npmjs.com/package/mockingoose

describe('app.js testing suite', () => {
  console.log(app)
  mockingoose(EodSchema)

  test('Smoke test', () => {
    expect(1).toBe(1)
  })
})
