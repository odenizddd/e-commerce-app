const { Client } = require('pg')
import { devNull } from "os";
import { User, Product } from "./mockData";

export async function queryUsers(): Promise<void> {
    const client = new Client({
        user: "postgres", // Default superuser
        host: "localhost", // Since database is hosted on the same machine
        database: "testdb", // See init.sql
        password: "postgres123", // See init.sql
        port: 5432
    })

    try {
        await client.connect();
        console.log('Connected to the database.');

        const res = await client.query("SELECT * FROM users;")
        console.log("Users: ", res.rows)
    } catch(err) {
        if (err instanceof Error)
            console.log("Connection error: ", err.stack)
        else
            console.log("Unexpected error", err)
    } finally {
        await client.end()
        console.log('Connection closed');
    }
}

export async function queryUser(username: string): Promise<User|null> {
    const client = new Client({
        user: "postgres", // Default superuser
        host: "localhost", // Since database is hosted on the same machine
        database: "testdb", // See init.sql
        password: "postgres123", // See init.sql
        port: 5432
    })

    try {
        await client.connect();
        console.log('Connected to the database.');

        const res = await client.query("SELECT * FROM users WHERE username=$1;", [username])
        if (res.rows.length === 0) return null
        else {
            const user = res.rows[0]
            return { username: user.username, email: user.email, password: user.password }
        }
    } catch(err) {
        if (err instanceof Error)
            console.log("Connection error: ", err.stack)
        else
            console.log("Unexpected error", err)
        throw err
    } finally {
        await client.end()
        console.log('Connection closed');
    }
}

export async function insertUsers(users: User[]) {
    const client = new Client({
        user: "postgres", // Default superuser
        host: "localhost", // Since database is hosted on the same machine
        database: "testdb", // See init.sql
        password: "postgres123", // See init.sql
        port: 5432
    })

    try {
        await client.connect();
        console.log('Connected to the database.');

        await client.query('BEGIN')

        for (const user of users) {
            const {username, email, password} = user;
            await client.query(
                "INSERT INTO users (username, email, password)\
                VALUES ($1, $2, $3);", [username, email, password])
        }

        await client.query('COMMIT')
    } catch(err) {
        await client.query('ROLLBACK')
        if (err instanceof Error)
            console.log("Connection error: ", err.stack)
        else
            console.log("Unexpected error", err)
    } finally {
        await client.end()
        console.log('Connection closed');
    }
}

export async function queryProducts(): Promise<Product[]> {
    const client = new Client({
        user: "postgres", // Default superuser
        host: "localhost", // Since database is hosted on the same machine
        database: "testdb", // See init.sql
        password: "postgres123", // See init.sql
        port: 5432
    })

    try {
        await client.connect();
        console.log('Connected to the database.');

        const res = await client.query("SELECT * FROM products;")
        return res.rows
    } catch(err) {
        if (err instanceof Error)
            console.log("Connection error: ", err.stack)
        else
            console.log("Unexpected error", err)
        throw err
    } finally {
        await client.end()
        console.log('Connection closed');
    }
}

export async function insertProducts(products: Product[]) {
    const client = new Client({
        user: "postgres", // Default superuser
        host: "localhost", // Since database is hosted on the same machine
        database: "testdb", // See init.sql
        password: "postgres123", // See init.sql
        port: 5432
    })

    try {
        await client.connect();
        console.log('Connected to the database.');

        await client.query('BEGIN')

        for (const product of products) {
            const { name, price, stock_quantity, brand, image_url } = product;
            await client.query(
                "INSERT INTO products (name, price, stock_quantity, brand, image_url)\
                VALUES ($1, $2, $3, $4, $5);", [name, price, stock_quantity, brand, image_url])
        }

        await client.query('COMMIT')
    } catch(err) {
        await client.query('ROLLBACK')
        if (err instanceof Error)
            console.log("Connection error: ", err.stack)
        else
            console.log("Unexpected error", err)
    } finally {
        await client.end()
        console.log('Connection closed');
    }
}

export async function getCartIdForUser(userId: number) {
    const client = new Client({
        user: "postgres", // Default superuser
        host: "localhost", // Since database is hosted on the same machine
        database: "testdb", // See init.sql
        password: "postgres123", // See init.sql
        port: 5432
    })

    try {
        await client.connect();
        console.log('Connected to the database.');

        let cart = await client.query('SELECT id FROM carts WHERE user_id=$1;', [userId])

        if (cart.rows.length === 0) {
            cart = await client.query('INSERT INTO carts (user_id) VALUES ($1) RETURNING id;', [userId])
        }

        const cartId = cart.rows[0].id
        return cartId

    } catch(err) {
        if (err instanceof Error)
            console.log("Connection error: ", err.stack)
        else
            console.log("Unexpected error", err)
        throw err
    } finally {
        await client.end()
        console.log('Connection closed');
    }
}

export async function addProductToCard(cartId: number, productId: number, quantity: number) {
    const client = new Client({
        user: "postgres", // Default superuser
        host: "localhost", // Since database is hosted on the same machine
        database: "testdb", // See init.sql
        password: "postgres123", // See init.sql
        port: 5432
    })

    try {
        await client.connect();
        console.log('Connected to the database.');

        await client.query('BEGIN')

        await client.query('INSERT INTO cartItems (cart_id, product_id, quantity) VALUES ($1, $2, $3)\
            ON CONFLICT (cart_id, product_id)\
            DO UPDATE SET quantity=cartItems.quantity+$3;', [cartId, productId, quantity])

        await client.query('COMMIT')
    } catch(err) {
        await client.query('ROLLBACK')
        if (err instanceof Error)
            console.log("Connection error: ", err.stack)
        else
            console.log("Unexpected error", err)
    } finally {
        await client.end()
        console.log('Connection closed');
    }
}

export async function getCartContentsForUser(userId: number) {
    const client = new Client({
        user: "postgres", // Default superuser
        host: "localhost", // Since database is hosted on the same machine
        database: "testdb", // See init.sql
        password: "postgres123", // See init.sql
        port: 5432
    })

    try {
        await client.connect();
        console.log('Connected to the database.');

        const cartId = await getCartIdForUser(userId)

        const cartItems = await client.query(`
            SELECT products.*, cartItems.quantity
            FROM cartItems
            JOIN products ON cartItems.product_id=products.id
            WHERE cartItems.cart_id=$1;
            `, [cartId])

        return cartItems

    } catch(err) {
        if (err instanceof Error)
            console.log("Connection error: ", err.stack)
        else
            console.log("Unexpected error", err)
        throw err
    } finally {
        await client.end()
        console.log('Connection closed');
    }
}
