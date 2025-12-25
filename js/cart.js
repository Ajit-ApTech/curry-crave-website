/*
 * Curry Crave - Cart Management
 * Handles shopping cart functionality
 */

// Cart state
let cart = [];
const CART_STORAGE_KEY = 'curryCraveCart';

// Initialize cart on page load
document.addEventListener('DOMContentLoaded', function () {
    loadCartFromStorage();
    setupCartListeners();
    updateCartUI();
});

// ===== CART LISTENERS =====
function setupCartListeners() {
    const cartBtn = document.querySelector('.cart-btn');
    const cartSidebar = document.getElementById('cartSidebar');
    const closeCart = document.getElementById('closeCart');
    const checkoutBtn = document.getElementById('checkoutBtn');

    // Open cart sidebar
    cartBtn?.addEventListener('click', function (e) {
        e.preventDefault();
        cartSidebar?.classList.add('active');
        updateCartDisplay();
    });

    // Close cart sidebar
    closeCart?.addEventListener('click', function () {
        cartSidebar?.classList.remove('active');
    });

    // Checkout button
    checkoutBtn?.addEventListener('click', function () {
        handleCheckout();
    });
}

// ===== ADD ITEM TO CART =====
function addItemToCart(item) {
    const existingItem = cart.find(cartItem => cartItem.id === item.id);

    if (existingItem) {
        existingItem.quantity += 1;
    } else {
        cart.push({
            ...item,
            quantity: 1
        });
    }

    saveCartToStorage();
    updateCartUI();
    updateCartDisplay();
}

// ===== UPDATE QUANTITY =====
function updateQuantity(itemId, change) {
    const item = cart.find(cartItem => cartItem.id === itemId);

    if (item) {
        item.quantity += change;

        if (item.quantity <= 0) {
            removeFromCart(itemId);
        } else {
            saveCartToStorage();
            updateCartUI();
            updateCartDisplay();
        }
    }
}

// ===== REMOVE FROM CART =====
function removeFromCart(itemId) {
    cart = cart.filter(item => item.id !== itemId);
    saveCartToStorage();
    updateCartUI();
    updateCartDisplay();

    if (typeof window.showToast === 'function') {
        window.showToast('Item removed from cart');
    }
}

// ===== UPDATE CART UI =====
function updateCartUI() {
    const cartCount = document.getElementById('cartCount');
    const totalItems = cart.reduce((sum, item) => sum + item.quantity, 0);

    if (cartCount) {
        cartCount.textContent = totalItems;
        cartCount.style.display = totalItems > 0 ? 'flex' : 'none';
    }
}

// ===== UPDATE CART DISPLAY =====
function updateCartDisplay() {
    const cartItems = document.getElementById('cartItems');
    const totalAmount = document.getElementById('totalAmount');

    if (!cartItems || !totalAmount) return;

    if (cart.length === 0) {
        cartItems.innerHTML = `
            <div style="text-align: center; padding: 40px 20px; color: var(--light-gold); opacity: 0.7;">
                <i class="fas fa-shopping-cart" style="font-size: 48px; margin-bottom: 16px; opacity: 0.5;"></i>
                <p style="font-size: 16px;">Your cart is empty</p>
                <p style="font-size: 14px; margin-top: 8px;">Add some delicious items!</p>
            </div>
        `;
        totalAmount.textContent = '₹0';
        return;
    }

    // Display cart items
    cartItems.innerHTML = cart.map(item => `
        <div class="cart-item">
            <div class="cart-item-image">
                <img src="${item.image}" alt="${item.name}" onerror="this.src='assets/images/placeholder.jpg'">
            </div>
            <div class="cart-item-info">
                <h4 class="cart-item-name">${item.name}</h4>
                <p class="cart-item-price">₹${item.price} × ${item.quantity}</p>
                <div class="cart-item-actions">
                    <button class="quantity-btn" onclick="updateQuantity(${item.id}, -1)">
                        <i class="fas fa-minus"></i>
                    </button>
                    <span style="color: var(--primary-gold); font-weight: 600; min-width: 30px; text-align: center;">${item.quantity}</span>
                    <button class="quantity-btn" onclick="updateQuantity(${item.id}, 1)">
                        <i class="fas fa-plus"></i>
                    </button>
                    <button class="quantity-btn" onclick="removeFromCart(${item.id})" style="margin-left: auto; border-color: var(--vibrant-red);">
                        <i class="fas fa-trash"></i>
                    </button>
                </div>
            </div>
        </div>
    `).join('');

    // Calculate and display total
    const total = cart.reduce((sum, item) => sum + (item.price * item.quantity), 0);
    totalAmount.textContent = `₹${total}`;
}

// ===== CHECKOUT =====
function handleCheckout() {
    if (cart.length === 0) {
        if (typeof window.showToast === 'function') {
            window.showToast('Your cart is empty!');
        }
        return;
    }

    const isLoggedIn = localStorage.getItem('userLoggedIn') === 'true';

    if (!isLoggedIn) {
        if (typeof window.showToast === 'function') {
            window.showToast('Please login to proceed with checkout');
        }

        // Close cart and open login modal
        document.getElementById('cartSidebar')?.classList.remove('active');
        document.getElementById('loginModal')?.classList.add('active');
        return;
    }

    // Calculate order details
    const total = cart.reduce((sum, item) => sum + (item.price * item.quantity), 0);
    const itemCount = cart.reduce((sum, item) => sum + item.quantity, 0);

    // Create order summary
    const orderSummary = cart.map(item =>
        `${item.name} (x${item.quantity}) - ₹${item.price * item.quantity}`
    ).join('\n');

    // Simulate order placement
    const orderId = 'CC' + Date.now();

    if (confirm(`Order Summary:\n\n${orderSummary}\n\nTotal: ₹${total}\n\nProceed with order?`)) {
        // Create order object
        const newOrder = {
            _id: orderId,
            orderId: orderId,
            user: {
                name: localStorage.getItem('userName') || 'Demo User',
                email: localStorage.getItem('userEmail') || 'user@example.com'
            },
            items: cart.map(item => ({
                name: item.name,
                quantity: item.quantity,
                price: item.price
            })),
            totalAmount: total,
            orderStatus: 'pending',
            createdAt: new Date().toISOString()
        };

        // Save to mock orders in localStorage
        try {
            const currentOrders = JSON.parse(localStorage.getItem('mockOrders') || '[]');
            currentOrders.unshift(newOrder); // Add to beginning
            localStorage.setItem('mockOrders', JSON.stringify(currentOrders));
        } catch (e) {
            console.error('Error saving mock order:', e);
        }

        // Clear cart
        cart = [];
        saveCartToStorage();
        updateCartUI();
        updateCartDisplay();

        // Close cart sidebar
        document.getElementById('cartSidebar')?.classList.remove('active');

        // Show success message
        if (typeof window.showToast === 'function') {
            window.showToast(`Order placed successfully! Order ID: ${orderId}`);
        }

        // In real application, this would send order to backend
        console.log('Order placed:', newOrder);
    }
}

// ===== LOCAL STORAGE =====
function saveCartToStorage() {
    try {
        localStorage.setItem(CART_STORAGE_KEY, JSON.stringify(cart));
    } catch (error) {
        console.error('Error saving cart to storage:', error);
    }
}

function loadCartFromStorage() {
    try {
        const savedCart = localStorage.getItem(CART_STORAGE_KEY);
        if (savedCart) {
            cart = JSON.parse(savedCart);
        }
    } catch (error) {
        console.error('Error loading cart from storage:', error);
        cart = [];
    }
}

// ===== CLEAR CART =====
function clearCart() {
    if (confirm('Are you sure you want to clear your cart?')) {
        cart = [];
        saveCartToStorage();
        updateCartUI();
        updateCartDisplay();

        if (typeof window.showToast === 'function') {
            window.showToast('Cart cleared');
        }
    }
}

// Make functions globally accessible
window.addItemToCart = addItemToCart;
window.updateQuantity = updateQuantity;
window.removeFromCart = removeFromCart;
window.clearCart = clearCart;
