import express, { Request, Response, NextFunction } from "express";
import jwt, { JwtPayload } from "jsonwebtoken"
import { addProductToCard, getCartContentsForUser, getCartIdForUser, getUserIdForUsername, queryProducts, queryUser } from "./databaseOperations"

const app = express();
const port = 3000;

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

        const token = jwt.sign({ username: user.username }, jwtSecret)
        res.status(200).json({ token, username: user.username })
    } catch (err) {
        return res.status(400).json({ error: "Database error." })
    }
})

interface CustomRequest extends Request {
    user?: string | JwtPayloadWithUserData
}

interface JwtPayloadWithUserData extends JwtPayload {
    username: string
}

const authMiddleware = (req: CustomRequest, res: Response, next: NextFunction) => {
    const token = req.header('Authorization')?.split(' ')[1]
    if (!token) {
        return res.status(400).json({ error: "No token provided." })
    }

    try {
        const decoded = jwt.verify(token, jwtSecret) as JwtPayloadWithUserData
        req.user = decoded
        next()
    } catch (err) {
        res.status(401).json({ error: "Invalid token." })
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
        console.log(userId)
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

app.listen(port, () => {
    console.log(`Server is running at http://localhost:${port}`);
});
