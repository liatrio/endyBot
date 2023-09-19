module.exports = {
  testEnvironment: 'node', // or 'jsdom' for front-end projects
  // Add any other Jest configuration options here as needed

  collectCoverage: true,
  // coverageReporters: ['lcov', 'text-summary'],
  coverageReporters: ['text', 'cobertura'],
  testPathIgnorePatterns: ['./src/app.js'],
  coverageThreshold: {
    global: {
      lines: 90
    }
  }
}
