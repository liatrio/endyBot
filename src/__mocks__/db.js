/* eslint-env jest */

module.exports = {
  addToDB: jest.fn(() => Promise.resolve()),
  listGroups: jest.fn(() => Promise.resolve()),
  getGroup: jest.fn(() => Promise.resolve())
}
