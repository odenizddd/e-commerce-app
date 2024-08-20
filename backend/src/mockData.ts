const { faker } = require('@faker-js/faker')

export interface User {
    username: string,
    email: string,
    password: string
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
