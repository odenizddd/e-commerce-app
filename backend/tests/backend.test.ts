const request = require('supertest')
const test_app = require('../src/server')

const { Client } = require('pg')
import jwt, { JwtPayload } from "jsonwebtoken"
import { JwtPayloadWithUserData } from "./server"
import { getCartContentsForUser, getCartIdForUser, getUserIdForUsername } from "../src/databaseOperations"

describe('POST /login', () => {

    beforeAll(() => {
        jest.spyOn(console, 'log').mockImplementation(() => {})
    })
    
    afterAll(() => {
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

describe('GET /products', () => {

    beforeEach(() => {
        jest.spyOn(console, 'log').mockImplementation(() => {})
    })
    
    afterEach(() => {
        jest.restoreAllMocks()
    })
    
    it('should return a list of products', async () => {
        const response = await  request(test_app).get('/products')
                                            .expect('Content-Type', /json/)
                                            .expect(200)
        
        expect(Array.isArray(response.body)).toBe(true)

        if (response.body.length > 0) {
            expect(response.body[0]).toHaveProperty('id')
            expect(response.body[0]).toHaveProperty('name')
            expect(response.body[0]).toHaveProperty('price')
            expect(response.body[0]).toHaveProperty('stock_quantity')
            expect(response.body[0]).toHaveProperty('brand')
            expect(response.body[0]).toHaveProperty('image_url')
            expect(response.body[0]).toHaveProperty('created_at')
        }
    })
})

const testProtectedEndpoint = async (endpoint: string, method = 'get', token: string | null = null, expectedStatus = 200, expectedResponse: {[key: string]: any} = {}) => {
    const response = await request(test_app)[method](endpoint)
                            .set('Authorization', token ? `Bearer ${token}` : '')
                            expect(expectedStatus)

    Object.keys(expectedResponse).forEach(key => {
        const field = expectedResponse[key]
        if (!Array.isArray(field))
            expect(response.body).toHaveProperty(key, field)
    })
}

describe('GET /cart', () => {

    beforeEach(() => {
        jest.spyOn(console, 'log').mockImplementation(() => {})
    })
    
    afterEach(() => {
        jest.restoreAllMocks()
    })

    let token: string

    beforeAll(async () => {
        jest.spyOn(console, 'log').mockImplementation(() => {})

        const loginResponse = await request(test_app).post('/login').send({ username: "Arlie_Lang19", password: "VjYRgalsfQxxs6W" })

        expect(loginResponse.status).toBe(200)
        expect(loginResponse.body.token).toBeTruthy()

        token = loginResponse.body.token

        jest.restoreAllMocks()
    })

    it('should return protected data when provided with a valid token', async () => {
        const response = await request(test_app).get('/cart')
                                                .set('Authorization', `Bearer ${token}`)
                                                .expect(200)

        expect(response.body).toHaveProperty('cartItems')
        expect(Array.isArray(response.body.cartItems)).toBe(true)
    })

    it('should return 401 when no token is provided', async () => {
        const response = await request(test_app).get('/cart').expect(401)

        expect(response.body.error).toBe('No token provided.')
    })

    it('should return 401 for an invalid token', async () => {
        const response =  await request(test_app).get('/cart')
                    .set('Authorization', `Bearer ${"invalid_token"}`)
                    .expect(401)

        expect(response.body.error).toBe("Invalid token.")
    })
})

describe('GET /cart alternative', () => {

    beforeEach(() => {
        jest.spyOn(console, 'log').mockImplementation(() => {})
    })
    
    afterEach(() => {
        jest.restoreAllMocks()
    })

    let token: string

    beforeAll(async () => {
        jest.spyOn(console, 'log').mockImplementation(() => {})

        const loginResponse = await request(test_app).post('/login').send({ username: "Arlie_Lang19", password: "VjYRgalsfQxxs6W" })

        expect(loginResponse.status).toBe(200)
        expect(loginResponse.body.token).toBeTruthy()

        token = loginResponse.body.token

        jest.restoreAllMocks()
    })

    it('should return protected data when provided with a valid token', async () => {
        await testProtectedEndpoint('/cart', 'get', token, 200, {cartItems: []})
    })

    it('should return 401 when no token is provided', async () => {
        await testProtectedEndpoint('/cart', 'get', null, 401, { error: 'No token provided.'})
    })

    it('should return 401 for an invalid token', async () => {
        await testProtectedEndpoint('/cart', 'get', "invalid token", 401, { error: 'Invalid token.'})
    })
})

describe('POST /cart/add', () => {

    beforeEach(() => {
        jest.spyOn(console, 'log').mockImplementation(() => {})
    })
    
    afterEach(() => {
        jest.restoreAllMocks()
    })

    let token: string

    beforeAll(async () => {
        jest.spyOn(console, 'log').mockImplementation(() => {})

        const loginResponse = await request(test_app).post('/login').send({ username: "Arlie_Lang19", password: "VjYRgalsfQxxs6W" })

        expect(loginResponse.status).toBe(200)
        expect(loginResponse.body.token).toBeTruthy()

        token = loginResponse.body.token

        jest.restoreAllMocks()
    })

    it('should return 401 when no token is provided', async () => {
        await testProtectedEndpoint('/cart/add', 'post', null, 401, { error: 'No token provided.'})
    })

    it('should return 401 for an invalid token', async () => {
        await testProtectedEndpoint('/cart/add', 'post', "invalid token", 401, { error: 'Invalid token.'})
    })

    it('should return success when a valid token and body is provided', async () => {
        const response = await request(test_app).post('/cart/add')
                                .set('Authorization', `Bearer ${token}`)
                                .send({ productId: 1, quantity: 1})
                                .expect(200)
        
        expect(response.body.status).toBe('success')
    })
    
    /*
        1. Read the initial quantity of a givem product in a user's shopping cart (directly from db)
        2. Hit the endpoint with a certain amount.
        3. Fetch the quantity for that product from db again and 
           make sure it is incremented by the correct amount.
    */
    it('should add the specified amount of items to the shopping cart for a given user', async () => {
        const client = new Client({
            user: "postgres", // Default superuser
            host: "localhost", // Since database is hosted on the same machine
            database: "testdb", // See init.sql
            password: "postgres123", // See init.sql
            port: 5432
        })
    
        try {
            await client.connect();

            const decoded = jwt.verify(token, 'my_secret') as JwtPayloadWithUserData
            const username = decoded.username

            const productId = 1
            const test_quantity = 5

            const userId = await getUserIdForUsername(username)
            let cardItems = await getCartContentsForUser(userId)
            cardItems = cardItems.rows
            let item = cardItems.find((elem: { id: number, quantity: number }) => elem.id === productId)
            let initialQuantity = 0
            if (item) {
                initialQuantity = item.quantity
            }

            const response = await request(test_app).post('/cart/add')
                                .set('Authorization', `Bearer ${token}`)
                                .send({ productId: productId, quantity: test_quantity})
                                .expect(200)
        
            expect(response.body.status).toBe('success')

            cardItems = await getCartContentsForUser(userId)
            cardItems = cardItems.rows
            item = cardItems.find((elem: { id: number, quantity: number }) => elem.id === productId)
            let finalQuantity = 0
            if (item) {
                finalQuantity = item.quantity
            }

            expect(finalQuantity).toBe(initialQuantity + test_quantity)
    
        } catch(err) {
            throw err
        } finally {
            await client.end()
        }
    })
})

it.todo('Write unit tests for database operations.')
