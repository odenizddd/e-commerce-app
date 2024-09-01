import { getClient } from "./databaseOperations"

const { faker } = require('@faker-js/faker')
export interface User {
    username: string,
    email: string,
    password: string
}
export interface Product {
    name: string,
    price: number,
    stock_quantity: number,
    brand: string,
    image_url: string,
}

export interface Rating {
    rating: number,
    userId: number,
    productId: number
}
export interface Review {
    text: string,
    userId: number,
    productId: number
}


export function generateMockUserData(count: number): User[] {
    const users: User[] = []
    for (let i = 0; i < count; i++) {
        const user: User = {
            username: faker.internet.userName(),
            email: faker.internet.email(),
            password: faker.internet.password()
        }
        users.push(user)
    }
    return users
}

export function generateMockProductData(count: number): Product[] {
    const products: Product[] = []
    for (let i = 0; i < count; i++) {
        const product: Product = {
            name: faker.commerce.productName(),
            price: faker.number.float({ min: 0.1, max: 100.0, multipleOf: 0.1 }),
            stock_quantity: faker.number.int({ min: 0, max: 100 }),
            brand: faker.company.name(),
            image_url: faker.image.url()
        }
        products.push(product)
    }
    return products
}

export async function generateMockRatings(userCount: number, productCount: number): Promise<Rating[]> {
    const ratings: Rating[] = []
    const client = getClient()

    try {
        await client.connect()
        const getUsersQuery = await client.query('SELECT * FROM users LIMIT $1;', [userCount])
        const getProductsQuery = await client.query('SELECT * FROM products LIMIT $1;', [productCount])
        const users = getUsersQuery.rows
        const products = getProductsQuery.rows

        // Every users leaves a rating and review for every product
        for (let u = 0; u < users.length; u++) {
            for (let p = 0; p < products.length; p++) {
                const rating = faker.number.int({ min: 1, max: 5 })
                ratings.push({
                    rating: rating,
                    userId: users[u].id,
                    productId: products[p].id
                })
            }
        }

    } catch (err) {
        if (err instanceof Error)
            console.log('Error', err.stack)
        else
            console.log('Error', err)
    } finally {
        await client.end()
    }

    return ratings
}

export async function generateMockReviews(userCount: number, productCount: number): Promise<Review[]> {
    const reviews: Review[] = []
    const client = getClient()

    try {
        await client.connect()
        const getUsersQuery = await client.query('SELECT * FROM users LIMIT $1;', [userCount])
        const getProductsQuery = await client.query('SELECT * FROM products LIMIT $1;', [productCount])
        const users = getUsersQuery.rows
        const products = getProductsQuery.rows

        // Every users leaves a rating and review for every product
        for (let u = 0; u < users.length; u++) {
            for (let p = 0; p < products.length; p++) {
                const review = faker.lorem.sentences()
                reviews.push({
                    text: review,
                    userId: users[u].id,
                    productId: products[p].id
                })
            }
        }

    } catch (err) {
        if (err instanceof Error)
            console.log('Error', err.stack)
        else
            console.log('Error', err)
    } finally {
        await client.end()
    }

    return reviews
}
