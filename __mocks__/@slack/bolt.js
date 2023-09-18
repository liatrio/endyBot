/* eslint-env jest */
// Mocking the slack app

// As we use different types of Slack API calls, we MAY need to add more fields to this--
// If you're expecting more fields than what is listed below in the code, add it here
module.exports = {
  App: jest.fn(() => ({
    start: jest.fn(() => Promise.resolve()),
    command: jest.fn(() => Promise.resolve()),
    client: {
      views: {
        open: jest.fn(() => Promise.resolve()),
        update: jest.fn(() => Promise.resolve()),
        publish: jest.fn(() => Promise.resolve())
      },
      chat: {
        postMessage: jest.fn(() => Promise.resolve())
      },
      users: {
        list: jest.fn(() => Promise.resolve())
      }
    }
  }))
}
