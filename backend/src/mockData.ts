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
