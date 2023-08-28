/* eslint-env jest */

module.exports = {
  startCronJobs: jest.fn(() => Promise.resolve()),
  scheduleCronJob: jest.fn(() => Promise.resolve()),
  convertPostTimeToCron: jest.fn(),
  removeTasks: jest.fn()
}
