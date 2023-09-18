/* eslint-env jest */

module.exports = {
  addToDB: jest.fn(() => Promise.resolve()),
  listGroups: jest.fn(() => Promise.resolve()),
  getGroup: jest.fn(() => Promise.resolve()),
  deleteGroup: jest.fn(() => Promise.resolve()),
  describeGroup: jest.fn(() => Promise.resolve()),
  addSubscriber: jest.fn(() => Promise.resolve()),
  removeSubscriber: jest.fn(() => Promise.resolve()),
  getUserGroups: jest.fn(() => Promise.resolve()),
  checkUserPosted: jest.fn(() => Promise.resolve()),
  updateUserPosted: jest.fn(() => Promise.resolve()),
  updateGroupPosted: jest.fn(() => Promise.resolve())
}
