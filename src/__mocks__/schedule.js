/* eslint-env jest */

module.exports = {
  startCronJobs: jest.fn(() => Promise.resolve()),
  scheduleCronJob: jest.fn(() => Promise.resolve()),
  convertPostTimeToCron: jest.fn(),
  removeAllTasks: jest.fn()
}
