/* eslint-env jest */

module.exports = {
  sendCreateModal: jest.fn(() => Promise.resolve()),
  parseCreateModal: jest.fn(),
  sendEODModal: jest.fn(() => Promise.resolve()),
  updateEODModal: jest.fn(),
  dmUsers: jest.fn(() => Promise.resolve()),
  createPost: jest.fn(() => Promise.resolve()),
  postEODResponse: jest.fn(() => Promise.resolve()),
  dmSubs: jest.fn(() => Promise.resolve()),
  notifySubsAboutGroupDeletion: jest.fn(() => Promise.resolve()),
  eodDmUpdateDelete: jest.fn(() => Promise.resolve()),
  eodDmUpdatePost: jest.fn(() => Promise.resolve()),
  getUserList: jest.fn(() => Promise.resolve()),
  sendMessage: jest.fn(() => Promise.resolve()),
  sendHomeView: jest.fn(() => Promise.resolve())
}
