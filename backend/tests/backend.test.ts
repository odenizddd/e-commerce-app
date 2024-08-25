const request = require('supertest')
const test_app = require('../src/server')

describe('Login endpoint', () => {

    beforeEach(() => {
        jest.spyOn(console, 'log').mockImplementation(() => {})
    })

    afterEach(() => {
        jest.restoreAllMocks()
    })

    it('should return a token upon successful login', async () => {
        const response = await request(test_app).post('/login').send({ username: "Arlie_Lang19", password: "VjYRgalsfQxxs6W" })

        expect(response.status).toBe(200)
        expect(response.body.token).toBeTruthy()
    })

    it('should return error message when user is not found', async () => {
        const response = await request(test_app).post('/login').send({ username: "non_existent_user", password: "random_password" })

        expect(response.status).toBe(400)
        expect(response.body.error).toBe("User not found.")
    })

    it('should deny access when incorrect password is provided', async () => {
        const response = await request(test_app).post('/login').send({ username: "Arlie_Lang19", password: "random_password" })

        expect(response.status).toBe(401)
        expect(response.body.error).toBe("Wrong password.")
    })
})
