/* eslint-env jest */

module.exports = {
  createPost: jest.fn(() => Promise.resolve()),
  dmUsers: jest.fn(() => Promise.resolve()),
  validateInput: jest.fn(() => Promise.resolve()),
  dmSubs: jest.fn(() => Promise.resolve()),
  sendCreateModal: jest.fn(() => Promise.resolve()),
  parseCreateModal: jest.fn(),
  sendEODModal: jest.fn(() => Promise.resolve()),
  updateEODModal: jest.fn()
}