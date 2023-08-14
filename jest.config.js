module.exports = {
  testEnvironment: 'node', // or 'jsdom' for front-end projects
  // Add any other Jest configuration options here as needed

  collectCoverage: true,
  coverageThreshold: {
    global: {
      lines: 80
    }
  }
}
