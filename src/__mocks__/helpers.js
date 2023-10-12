/* eslint-env jest */

module.exports = {
  groupNameFromMessage: jest.fn(),
  formatEODResponse: jest.fn(),
  constructHomeView: jest.fn(() => Promise.resolve())
}
