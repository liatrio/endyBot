const { app } = require('../app')

describe("app.js testing suite", () => {
    test('Smoke test', () => {
        console.log(app)
        expect(1).toBe(1)
    })
})