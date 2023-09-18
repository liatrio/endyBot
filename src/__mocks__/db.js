/* eslint-env jest */

module.exports = {
  addToDB: jest.fn(() => Promise.resolve()),
  listGroups: jest.fn(() => Promise.resolve()),
  getGroup: jest.fn(() => Promise.resolve()),
  deleteGroup: jest.fn(() => Promise.resolve()),
  updatePosted: jest.fn(() => Promise.resolve())
}
