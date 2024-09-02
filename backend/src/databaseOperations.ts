const { Client } = require('pg')
import { User, Product, Rating, Review } from "./mockData";

export function getClient() {
    const client = new Client({
        user: "postgres", // Default superuser
        host: "localhost", // Since database is hosted on the same machine
        database: "testdb", // See init.sql
        password: "postgres123", // See init.sql
        port: 5432
    })

    return client
}

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

export async function getUserIdForUsername(username: string) {
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

        const usernameSearch = await client.query('SELECT id FROM users WHERE username=$1', [username])

        if (usernameSearch.rows.length === 0) {
            throw Error('User not found.')
        }

        return usernameSearch.rows[0].id

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

export async function createOrderForUser(username: string): Promise<void> {
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

        const userId = await getUserIdForUsername(username)
        const cartId = await getCartIdForUser(userId)
        
        const cartContentSearch = await getCartContentsForUser(userId)
        const cartItems = cartContentSearch.rows
        
        if (cartItems.length !== 0) {
            const insertOrderQuery = await client.query('INSERT INTO orders (user_id) VALUES ($1) RETURNING id;', [userId])
            const orderId = insertOrderQuery.rows[0].id
    
            for (const cartItem of cartItems) {
                const {id, quantity} = cartItem
                await client.query('INSERT INTO orderItems (order_id, product_id, quantity) VALUES ($1, $2, $3);', [orderId, id, quantity])
            }
    
            await client.query('DELETE FROM cartItems WHERE cart_id=$1;', [cartId])
        }

        await client.query('COMMIT')
    } catch(err) {
        await client.query('ROLLBACK')
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

export async function getOrdersForUser(username: string) {
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

        const userId = await getUserIdForUsername(username)
        const orderQuery = await client.query('SELECT * FROM orders WHERE user_id=$1', [userId])
        const orders = orderQuery.rows

        return orders
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

export async function getOrderContentsForOrder(orderId: number): Promise<void> {
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

        const orderItemsQuery = await client.query('SELECT products.*, orderItems.quantity FROM orderItems JOIN products ON orderItems.product_id=products.id WHERE order_id=$1', [orderId])
        const orderItems = orderItemsQuery.rows

        return orderItems

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

export async function insertRatings(ratings: Rating[]): Promise<void> {
    const client = getClient()
    try {
        await client.connect()
        await client.query('BEGIN')

        await client.query(`INSERT INTO ratings (rating, user_id, product_id) VALUES ${ratings.map((ratingObj: Rating): string => {return `(${ratingObj.rating}, ${ratingObj.userId}, ${ratingObj.productId})`}).join(',')};`)

        await client.query('COMMIT')
    } catch (err) {
        await client.query('ROLLBACK')
        if (err instanceof Error) 
            console.log('Error', err.stack)
        else
            console.log('Error', err)
    } finally {
        client.end()
    }
}

export async function insertReviews(reviews: Review[]): Promise<void> {
    const client = getClient()
    try {
        await client.connect()
        await client.query('BEGIN')

        await client.query(`INSERT INTO reviews (review_text, user_id, product_id) VALUES ${reviews.map((reviewObj: Review): string => {return `('${reviewObj.text}', ${reviewObj.userId}, ${reviewObj.productId})`}).join(',')};`)

        await client.query('COMMIT')
    } catch (err) {
        await client.query('ROLLBACK')
        if (err instanceof Error) 
            console.log('Error', err.stack)
        else
            console.log('Error', err)
    } finally {
        client.end()
    }
}

export async function getRatings(userId?: number | undefined, productId?: number | undefined) {
    const client = getClient()
    try {
        await client.connect()

        let queryString = `SELECT * FROM ratings \
        ${(userId || productId) ? 'WHERE TRUE' : ''}\
        ${userId ? 'AND user_id=' + userId.toString() : ''}\
        ${productId ? 'AND product_id=' + productId.toString() : ''};`

        const getRatingsQuery = await client.query(queryString)
        return getRatingsQuery.rows
    } catch(err) {
        if (err instanceof Error)
            console.log('Error', err.stack)
        else
            console.log('Error', err)
    } finally {
        client.end()
    }
}

export async function getReviews(userId?: number | undefined, productId?: number | undefined) {
    const client = getClient()
    try {
        await client.connect()

        let queryString = `SELECT * FROM reviews \
        ${(userId || productId) ? 'WHERE TRUE' : ''}\
        ${userId ? 'AND user_id=' + userId.toString() : ''}\
        ${productId ? 'AND product_id=' + productId.toString() : ''};`

        const getReviewsQuery = await client.query(queryString)
        return getReviewsQuery.rows
    } catch(err) {
        if (err instanceof Error)
            console.log('Error', err.stack)
        else
            console.log('Error', err)
    } finally {
        client.end()
    }
}

export async function updateProductQuantityInCard(userId: number, productId: number, quantity: number) {
    const client = getClient()
    try {
        await client.connect()

        await client.query('BEGIN')

        // Get the cart id for the user, if there isn't a cart, create it.
        const cartIdRows = (await client.query('SELECT * FROM carts WHERE user_id=$1;', [userId])).rows
        let cartId;
        if (cartIdRows.length === 0) {
            cartId = (await client.query('INSERT INTO carts (user_id) VALUES ($1) RETURNING id;', [userId])).rows[0].id
        } else {
            cartId = cartIdRows[0].id
        }

        if (quantity <= 0) {
            // Delete item from the shopping cart
            await client.query('DELETE FROM cartItems WHERE cart_id=$1 AND product_id=$2', [cartId, productId])
        } else {
            const cartItemIdRows = (await client.query('SELECT * FROM cartItems WHERE cart_id=$1 AND product_id=$2;', [cartId, productId])).rows
            if (cartItemIdRows.length === 0) {
                // Create new item
                await client.query('INSERT INTO cartItems (cart_id, product_id, quantity) VALUES ($1, $2, $3);', [cartId, productId, quantity])
            } else {
                // Update existing item
                await client.query('UPDATE cartItems SET quantity=$1 WHERE cart_id=$2 AND product_id=$3;', [quantity, cartId, productId])
            }
        }

        await client.query('COMMIT')
    } catch (err) {
        await client.query('ROLLBACK')
        if (err instanceof Error)
            console.log('Error', err.stack)
        else
            console.log('Error', err)
    } finally {
        client.end()
    }
}
