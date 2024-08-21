import express from "express";
import { getCartContentsForUser, queryProducts } from "./databaseOperations"

const app = express();
const port = 3000;

app.use(express.json())

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
