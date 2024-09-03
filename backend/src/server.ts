import express, { Request, Response, NextFunction } from "express";
import jwt, { JwtPayload } from "jsonwebtoken"
import { addProductToCard, getCartContentsForUser, getCartIdForUser, getClient, getProduct, getRatings, getReviews, getUserIdForUsername, insertUsers, queryProducts, queryUser, updateLastLogin, updateProductQuantityInCard } from "./databaseOperations"

const app = express();

const jwtSecret = "my_secret"

app.use(express.json())
// For preflight responses
app.options('*', (req, res) => {
    res.header('Access-Control-Allow-Origin', '*');
    res.header('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
    res.header('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content-Type, Accept, Authorization');
    res.sendStatus(200);
});

// Login endpoint
app.post('/login', async (req, res) => {
    res.header('Access-Control-Allow-Origin', '*'); // Allow all origins, adjust as needed
    res.header('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS'); // Allow specific methods
    res.header('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content-Type, Accept, Authorization');

    try {
        const user = await queryUser(req.body.username)

        if (!user) {
            return res.status(400).send({ error: "User not found."})
        }

        if (user.password !== req.body.password) {
            return res.status(401).json({ error: "Wrong password." })
        }

        // TODO: Update last login time
        // There is weird thing going on. iat is before last login
        await updateLastLogin(user.username)

        const token = jwt.sign({ username: user.username, iat: Math.floor(Date.now() / 1000) + 10 }, jwtSecret)
        res.status(200).json({ token, username: user.username })
    } catch (err) {
        return res.status(400).json({ error: "Database error." })
    }
})

interface CustomRequest<Params={}, ResBody=any, ReqBody=any> extends Request<Params, ResBody, ReqBody> {
    user?: string | JwtPayloadWithUserData
}

export interface JwtPayloadWithUserData extends JwtPayload {
    username: string
}

const authMiddleware = async (req: CustomRequest, res: Response, next: NextFunction) => {
    const token = req.header('Authorization')?.split(' ')[1]
    if (!token) {
        return res.status(401).json({ error: "No token provided." })
    }

    try {
        const decoded = jwt.verify(token, jwtSecret) as JwtPayloadWithUserData
        if (!decoded.iat) throw new Error()
        const timestamp = new Date((decoded.iat - 10800) * 1000)

        const user = await queryUser(decoded.username)
        if (!timestamp || user === null || !user.last_login || !user.last_logout) {
            throw new Error('Error')
        }
        
        // TODO: There is a mismatch in timezones
        const last_login = new Date(user.last_login)
        const last_logout = new Date(user.last_logout)

        console.log('Timestamp', timestamp)
        console.log('Last login', last_login)
        console.log('Last logout', last_logout)
        if (timestamp < last_login || timestamp < last_logout) throw new Error('Expired token.')

        req.user = { username: decoded.username }
        next()
    } catch (err) {
        if (err instanceof Error) console.log('Error:', err.message)
        else console.log('Error:', err)
        return res.status(401).json({ error: "Invalid token." })
    }
}

// Define the /products endpoint
app.get('/products', async (req, res) => {
    res.header('Access-Control-Allow-Origin', '*'); // Allow all origins, adjust as needed
    res.header('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS'); // Allow specific methods
    res.header('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content-Type, Accept, Authorization');
    try {
        const products = await queryProducts();
        res.json(products);
    } catch (err) {
        console.error('Error fetching products:', err);
        res.status(500).json({ error: 'Failed to fetch products' });
    }
});

app.get('/products/:productId', async (req: Request<{ productId: number }>, res: Response) => {
    res.header('Access-Control-Allow-Origin', '*'); // Allow all origins, adjust as needed
    res.header('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS'); // Allow specific methods
    res.header('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content-Type, Accept, Authorization');
    
    const productId = req.params.productId

    try {
        const productDetails = await getProduct(productId)
        res.status(200).json({ productDetails: productDetails })
    } catch (err) {
        console.log('Error', err)
        res.status(500).json({ error: 'Failed to fetch product details.' })
    }
})

app.post('/cart/add', authMiddleware, async (req: CustomRequest, res) => {
    res.header('Access-Control-Allow-Origin', '*'); // Allow all origins, adjust as needed
    res.header('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS'); // Allow specific methods
    res.header('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content-Type, Accept, Authorization');

    if (typeof req.user !== 'object' || req.user === null) {
        return res.status(400).json({ error: "User not found." })
    }

    const username = req.user.username

    // const userId = req.body.userId
    const productId = req.body.productId
    const quantity = req.body.quantity

    try {
        const userId = await getUserIdForUsername(username)
        await addProductToCard(await getCartIdForUser(userId), productId, quantity)
        res.status(200).json({status: "success"})
    } catch (err) {
        console.log("Error", err)
        res.status(500).json({error: "Failed to fetch cart items."})
    }
})

app.get('/cart', authMiddleware, async (req: CustomRequest, res) => {

    if (typeof req.user !== 'object' || req.user === null) {
        return res.status(400).json({ error: "User not found." })
    }

    const username = req.user.username

    res.header('Access-Control-Allow-Origin', '*'); // Allow all origins, adjust as needed
    res.header('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS'); // Allow specific methods
    res.header('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content-Type, Accept, Authorization');
    try {
        const userId = await getUserIdForUsername(username)
        const cartItems = await getCartContentsForUser(userId);
        res.status(200).json({cartItems: cartItems.rows})
    } catch (err) {
        console.log("Error", err)
        res.status(500).json({error: "Failed to fetch cart items."})
    }
})

app.get('/ratings', async (req: Request<{}, {}, {}, {userId?: number, productId?: number}>, res: Response) => {
    res.header('Access-Control-Allow-Origin', '*'); // Allow all origins, adjust as needed
    res.header('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS'); // Allow specific methods
    res.header('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content-Type, Accept, Authorization');

    const client = getClient()
    try {
        await client.connect()

        const { userId, productId } = req.query
        return res.status(200).json({ratings: await getRatings(userId, productId)})

    } catch (err) {
        console.log('Error', err)
        return res.status(500).json({error: 'Failed to fetch ratings.'})
    }
})

app.get('/reviews', async (req: Request<{}, {}, {}, {userId?: number, productId?: number}>, res: Response) => {
    res.header('Access-Control-Allow-Origin', '*'); // Allow all origins, adjust as needed
    res.header('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS'); // Allow specific methods
    res.header('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content-Type, Accept, Authorization');

    const client = getClient()
    try {
        await client.connect()

        const { userId, productId } = req.query
        return res.status(200).json({ratings: await getReviews(userId, productId)})

    } catch (err) {
        console.log('Error', err)
        return res.status(500).json({error: 'Failed to fetch reviews.'})
    }
})

app.post('/cart/:productId', authMiddleware, async (req: CustomRequest<{productId: number}, {}, {quantity: number}>, res: Response) => {
    res.header('Access-Control-Allow-Origin', '*'); // Allow all origins, adjust as needed
    res.header('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS'); // Allow specific methods
    res.header('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content-Type, Accept, Authorization');

    if (typeof req.user !== 'object' || req.user === null) {
        return res.status(400).json({ error: "User not found." })
    }

    const username = req.user.username
    const productId = req.params.productId
    const quantity = req.body.quantity

    try {
        const userId = await getUserIdForUsername(username)
        await updateProductQuantityInCard(userId, productId, quantity)
        res.status(200).json({ status: "success" })
    } catch (err) {
        if (err instanceof Error)
            console.log('Error', err.stack)
        else
            console.log('Error', err)
        res.status(500).json({ error: "Failed to update shopping cart." })
    }
    
})

app.post('/logout', authMiddleware, async (req: CustomRequest, res: Response) => {
    if (typeof req.user !== 'object' || req.user === null) {
        return res.status(400).json({ error: "User not found." })
    }

    const username = req.user.username

    const client = getClient()
    try {
        await client.connect()

        await client.query(`UPDATE users SET last_logout=CURRENT_TIMESTAMP WHERE username='${username}';`)
        return res.status(200).json({ status: 'success' })
    } catch (err) {
        if (err instanceof Error)
            console.log('Error', err.stack)
        else
            console.log('Error', err)
        return res.status(500).json({ error: 'Failed to logout.' })
    } finally {
        await client.end()
    }
})

app.post('/register', async (req: CustomRequest<{}, {}, { username: string, password: string, email: string }>, res: Response) => {
    const { username, password, email } = req.body

    try {
        await insertUsers([{ username, password, email }])
        const token = jwt.sign({ username: username, iat: Math.floor(Date.now() / 1000) + 10 }, jwtSecret)
        res.status(200).json({ username, token })
    } catch (err) {
        if (err instanceof Error) console.log('Error', err.stack)
        else console.log('Error', err)
        res.status(500).json({ error: 'Failed to create user.' })
    }
})

module.exports = app
