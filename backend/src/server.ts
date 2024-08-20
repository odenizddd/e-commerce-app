import express from "express";
import { queryProducts } from "./databaseOperations"

const app = express();
const port = 3000;

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

app.listen(port, () => {
    console.log(`Server is running at http://localhost:${port}`);
});
