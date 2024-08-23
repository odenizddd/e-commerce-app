document.addEventListener('DOMContentLoaded', () => {

    const productList = document.getElementById('product-list');
    const cartButton = document.getElementById('cartButton');
    const modal = document.getElementById('cartModal');
    const closeBtn = document.querySelector('.close');

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
                    <button class="add-to-cart-button" data-product-id="${product.id}">Add to cart</button>
                `;
                productList.appendChild(productDiv);
            });

            document.querySelectorAll('.add-to-cart-button').forEach(button => {
                button.addEventListener('click', addToCart);
            });
        })
        .catch(error => {
            console.error('There was a problem with the fetch operation:', error);
            productList.innerHTML = '<p>Error loading products. Please try again later.</p>';
        });

    // Open the modal when the cart button is clicked
    cartButton.onclick = function() {
        fetchCart();
        modal.style.display = 'flex';
    }

    // Close the modal when the user clicks the 'x'
    closeBtn.onclick = function() {
        modal.style.display = 'none';
    }

    // Close the modal when the user clicks anywhere outside of the modal
    window.onclick = function(event) {
        if (event.target === modal) {
            modal.style.display = 'none';
        }
    }

    async function addToCart(event) {
        const productId = event.target.getAttribute('data-product-id');
        const userId = 1; // Replace with actual user ID

        try {
            console.log({ userId: userId, productId: parseInt(productId), quantity: 1 })
            const token = localStorage.getItem('token')
            const response = await fetch('http://localhost:3000/cart/add', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify({ userId: userId, productId: productId, quantity: 1 })
            });

            if (!response.ok) {
                throw new Error('Failed to add product to cart');
            }

            const result = await response.json();
            console.log('Product added to cart:', result);
        } catch (error) {
            console.error('Error adding product to cart:', error);
        }
    }

    async function fetchCart() {
        try {
            const userId = 1 // Replace with actual user ID
            const token = localStorage.getItem("token")
            const response = await fetch(`http://localhost:3000/cart?userId=${userId}`, {
                headers: {
                    'Authorization': `Bearer ${token}`
                }
            });
            const cartItems = await response.json();

            displayCart(cartItems.cartItems);
        } catch (error) {
            console.error('Error fetching cart data:', error);
            document.getElementById('cart').innerHTML = '<p>Error loading cart. Please try again later.</p>';
        }
    }

    function displayCart(items) {
        const cartContainer = document.getElementById('cart');
        cartContainer.innerHTML = ''; // Clear previous contents

        items.forEach(item => {
            const cartItem = document.createElement('div');
            cartItem.className = 'cart-item';

            cartItem.innerHTML = `
                <img src="${item.image_url}" alt="${item.name}">
                <div>${item.name}</div>
                <div>${item.quantity} x $${item.price}</div>
                <div>Total: $${(item.quantity * item.price).toFixed(2)}</div>
            `;

            cartContainer.appendChild(cartItem);
        });
    }
});
