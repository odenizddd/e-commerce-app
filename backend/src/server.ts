import express from "express";
import { addProductToCard, getCartContentsForUser, getCartIdForUser, queryProducts } from "./databaseOperations"

const app = express();
const port = 3000;

app.use(express.json())
// For preflight responses
app.options('*', (req, res) => {
    res.header('Access-Control-Allow-Origin', '*');
    res.header('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
    res.header('Access-Control-Allow-Headers', 'Content-Type');
    res.sendStatus(200);
});

// Define the /products endpoint
app.get('/products', async (req, res) => {
    res.header('Access-Control-Allow-Origin', '*'); // Allow all origins, adjust as needed
    res.header('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS'); // Allow specific methods
    res.header('Access-Control-Allow-Headers', 'Content-Type'); // Allow specific headers
    try {
        const products = await queryProducts();
        res.json(products);
    } catch (err) {
        console.error('Error fetching products:', err);
        res.status(500).json({ error: 'Failed to fetch products' });
    }
});

app.post('/cart/add', async (req, res) => {
    const userId = req.body.userId
    const productId = req.body.productId
    const quantity = req.body.quantity

    res.header('Access-Control-Allow-Origin', '*'); // Allow all origins, adjust as needed
    res.header('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS'); // Allow specific methods
    res.header('Access-Control-Allow-Headers', 'Content-Type'); // Allow specific headers
    try {
        await addProductToCard(await getCartIdForUser(userId), productId, quantity)
        res.status(200).json({status: "success"})
    } catch (err) {
        console.log("Error", err)
        res.status(500).json({error: "Failed to fetch cart items."})
    }
})

app.get('/cart', async (req, res) => {

    const userIdParam = req.query.userId;

    // Convert userId to a number
    const userId = userIdParam ? parseInt(userIdParam as string, 10) : undefined;

    if (userId === undefined || isNaN(userId)) {
        return res.status(400).json({ error: 'Invalid or missing userId' });
    }

    res.header('Access-Control-Allow-Origin', '*'); // Allow all origins, adjust as needed
    res.header('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS'); // Allow specific methods
    res.header('Access-Control-Allow-Headers', 'Content-Type'); // Allow specific headers
    try {
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
