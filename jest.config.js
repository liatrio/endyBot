module.exports = {
  testEnvironment: 'node', // or 'jsdom' for front-end projects
  // Add any other Jest configuration options here as needed

  collectCoverage: true,
  coverageReporters: ['lcov', 'text-summary'],
  coverageThreshold: {
    global: {
      lines: 75
    }
  }
}
