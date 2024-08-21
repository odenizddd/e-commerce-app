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
    try {
        const userId = req.body.userId
        const cartItems = await getCartContentsForUser(userId)
        res.status(200).json({cartItems: cartItems.rows})
    } catch (err) {
        console.log("Error", err)
    }
})

app.listen(port, () => {
    console.log(`Server is running at http://localhost:${port}`);
});
