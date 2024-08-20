document.addEventListener('DOMContentLoaded', () => {
    const productList = document.getElementById('product-list');

    // Fetch products from the /products endpoint
    fetch('http://localhost:3000/products')
        .then(response => {
            if (!response.ok) {
                throw new Error('Network response was not ok');
            }
            return response.json();
        })
        .then(products => {
            // Clear existing content
            productList.innerHTML = '';

            // Display products
            products.forEach(product => {
                const productDiv = document.createElement('div');
                productDiv.className = 'product';
                productDiv.innerHTML = `
                    <img src="${product.image_url}" alt="${product.name}" />
                    <h2>${product.name}</h2>
                    <p>Price: $${product.price}</p>
                `;
                productList.appendChild(productDiv);
            });
        })
        .catch(error => {
            console.error('There was a problem with the fetch operation:', error);
            productList.innerHTML = '<p>Error loading products. Please try again later.</p>';
        });
});
