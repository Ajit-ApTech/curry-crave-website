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
    const existingItem = cart.find(cartItem => String(cartItem.id) === String(item.id) || String(cartItem._id) === String(item._id || item.id));

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
    const item = cart.find(cartItem => String(cartItem.id) === String(itemId) || String(cartItem._id) === String(itemId));

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
    cart = cart.filter(item => String(item.id) !== String(itemId) && String(item._id || item.id) !== String(itemId));
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
                    <button class="quantity-btn" onclick="updateQuantity('${item._id || item.id}', -1)">
                        <i class="fas fa-minus"></i>
                    </button>
                    <span style="color: var(--primary-gold); font-weight: 600; min-width: 30px; text-align: center;">${item.quantity}</span>
                    <button class="quantity-btn" onclick="updateQuantity('${item._id || item.id}', 1)">
                        <i class="fas fa-plus"></i>
                    </button>
                    <button class="quantity-btn" onclick="removeFromCart('${item._id || item.id}')" style="margin-left: auto; border-color: var(--vibrant-red);">
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

    // Show checkout modal to collect customer details
    showCheckoutModal();
}

// ===== SHOW CHECKOUT MODAL =====
function showCheckoutModal() {
    // Calculate total
    const total = cart.reduce((sum, item) => sum + (item.price * item.quantity), 0);
    const itemCount = cart.reduce((sum, item) => sum + item.quantity, 0);

    // Create checkout modal
    const modal = document.createElement('div');
    modal.id = 'checkoutModal';
    modal.className = 'login-modal active';
    modal.innerHTML = `
        <div class="modal-overlay"></div>
        <div class="modal-content" style="max-width: 500px;">
            <button class="close-modal" onclick="closeCheckoutModal()">
                <i class="fas fa-times"></i>
            </button>
            <h2 class="modal-title">Complete Your Order</h2>
            <p style="text-align: center; color: var(--light-gold); margin-bottom: 20px;">
                ${itemCount} item(s) • Total: ₹${total}
            </p>
            <form class="login-form" id="checkoutForm" onsubmit="submitOrder(event)">
                <div class="form-group">
                    <label>
                        <i class="fas fa-user"></i>
                        Full Name
                    </label>
                    <input type="text" id="customerName" required placeholder="Enter your name">
                </div>
                <div class="form-group">
                    <label>
                        <i class="fas fa-envelope"></i>
                        Email
                    </label>
                    <input type="email" id="customerEmail" required placeholder="Enter your email">
                </div>
                <div class="form-group">
                    <label>
                        <i class="fas fa-phone"></i>
                        Phone Number
                    </label>
                    <input type="tel" id="customerPhone" required placeholder="Enter your phone number" pattern="[0-9]{10}">
                </div>
                <div class="form-group">
                    <label>
                        <i class="fas fa-map-marker-alt"></i>
                        Delivery Address
                    </label>
                    <textarea id="customerAddress" required placeholder="Enter your complete address" rows="3" style="width: 100%; padding: 12px; background: rgba(255, 255, 255, 0.05); border: 1px solid rgba(212, 175, 55, 0.3); border-radius: 8px; color: var(--cream-white); font-family: 'Poppins', sans-serif; resize: vertical;"></textarea>
                </div>
                <button type="submit" class="submit-btn" id="placeOrderBtn">
                    <i class="fas fa-check-circle"></i>
                    <span>Place Order - ₹${total}</span>
                </button>
            </form>
        </div>
    `;

    document.body.appendChild(modal);

    // Pre-fill if user data exists
    const userName = localStorage.getItem('userName');
    const userEmail = localStorage.getItem('userEmail');
    if (userName) document.getElementById('customerName').value = userName;
    if (userEmail) document.getElementById('customerEmail').value = userEmail;
}

// ===== CLOSE CHECKOUT MODAL =====
function closeCheckoutModal() {
    const modal = document.getElementById('checkoutModal');
    if (modal) {
        modal.remove();
    }
}

// ===== SUBMIT ORDER =====
async function submitOrder(event) {
    event.preventDefault();

    const customerName = document.getElementById('customerName').value;
    const customerEmail = document.getElementById('customerEmail').value;
    const customerPhone = document.getElementById('customerPhone').value;
    const customerAddress = document.getElementById('customerAddress').value;

    // Calculate total
    const total = cart.reduce((sum, item) => sum + (item.price * item.quantity), 0);

    // Store customer data temporarily
    const orderData = {
        user: {
            name: customerName,
            email: customerEmail,
            phone: customerPhone,
            address: customerAddress
        },
        items: cart.map(item => ({
            menuItemId: item.id,
            name: item.name,
            quantity: item.quantity,
            price: item.price
        })),
        totalAmount: total,
        orderStatus: 'pending'
    };

    // Close checkout modal and show QR payment modal
    closeCheckoutModal();
    showQRPaymentModal(orderData);
}

// ===== SHOW QR PAYMENT MODAL =====
function showQRPaymentModal(orderData) {
    const modal = document.createElement('div');
    modal.id = 'qrPaymentModal';
    modal.className = 'login-modal active';
    modal.innerHTML = `
        <div class="modal-overlay"></div>
        <div class="modal-content" style="max-width: 500px; text-align: center;">
            <h2 class="modal-title">Scan QR Code to Pay</h2>
            <p style="color: var(--light-gold); margin-bottom: 20px;">
                Amount: ₹${orderData.totalAmount}
            </p>
            <div style="background: white; padding: 20px; border-radius: 12px; display: inline-block; margin: 20px auto;">
                <img src="assets/images/payment-qr.png" alt="Payment QR Code" style="width: 250px; height: 250px; display: block;">
            </div>
            <p style="color: var(--cream-white); margin-top: 20px; font-size: 14px;">
                <i class="fas fa-info-circle"></i> Scan this QR code using any UPI app
            </p>
            <div style="margin-top: 30px; padding: 15px; background: rgba(212, 175, 55, 0.1); border-radius: 8px; border: 1px solid rgba(212, 175, 55, 0.3);">
                <p style="color: var(--primary-gold); font-size: 16px; margin-bottom: 10px;">
                    <i class="fas fa-clock"></i> Waiting for payment...
                </p>
                <div style="font-size: 24px; color: var(--cream-white); font-weight: 600;" id="paymentTimer">60</div>
                <p style="color: var(--light-gold); font-size: 12px; margin-top: 5px;">seconds remaining</p>
            </div>
            <div style="margin-top: 20px; display: flex; gap: 10px; justify-content: center;">
                <button onclick="cancelPayment()" class="submit-btn" style="background: rgba(255, 50, 50, 0.2); border-color: var(--vibrant-red); flex: 1;">
                    <i class="fas fa-times"></i>
                    <span>Cancel</span>
                </button>
            </div>
        </div>
    `;

    document.body.appendChild(modal);

    // Start 60-second timer
    startPaymentTimer(orderData);
}

// ===== START PAYMENT TIMER =====
function startPaymentTimer(orderData) {
    let timeRemaining = 60;
    const timerElement = document.getElementById('paymentTimer');

    const timerInterval = setInterval(() => {
        timeRemaining--;
        if (timerElement) {
            timerElement.textContent = timeRemaining;
        }

        if (timeRemaining <= 0) {
            clearInterval(timerInterval);
            // Process the order after 60 seconds
            processPaymentAndOrder(orderData);
        }
    }, 1000);

    // Store interval ID for cleanup if needed
    window.currentPaymentTimer = timerInterval;
}

// ===== PROCESS PAYMENT AND ORDER =====
async function processPaymentAndOrder(orderData) {
    let orderId;
    let orderSavedToBackend = false;
    const authToken = localStorage.getItem('authToken') || localStorage.getItem('token');
    const isAuthenticated = authToken && authToken !== 'null' && !authToken.startsWith('demo-token-');

    try {
        let response;

        if (isAuthenticated) {
            // Create authenticated order (will appear in order tracking)
            response = await fetch(`${window.API.config.BASE_URL}/order`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${authToken}`
                },
                body: JSON.stringify({
                    deliveryAddress: orderData.user.address,
                    paymentMethod: 'cash_on_delivery',
                    items: orderData.items,
                    totalAmount: orderData.totalAmount,
                    guestCustomer: {
                        name: orderData.user.name,
                        email: orderData.user.email,
                        phone: orderData.user.phone
                    }
                })
            });
        } else {
            // Create guest order (won't appear in tracking unless user logs in later)
            response = await fetch(`${window.API.config.BASE_URL}/order/orders`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(orderData)
            });
        }

        if (response.ok) {
            const result = await response.json();
            // Handle both response structures
            orderId = result.order?.orderId || result.data?.orderId || ('ORD' + Date.now());
            orderSavedToBackend = true;

            if (typeof window.showToast === 'function') {
                window.showToast(`✅ Order ${orderId} created successfully!`);
            }
        } else {
            const errorResult = await response.json();
            throw new Error(errorResult.message || 'Failed to create order');
        }
    } catch (error) {
        console.error('Backend error creating order:', error);
        // Generate a local order ID if backend fails
        orderId = 'ORD' + Date.now();
        orderSavedToBackend = false;

        if (typeof window.showToast === 'function') {
            window.showToast('⚠️ Order created offline - ' + orderId);
        }
    }

    // Save customer info for next time
    localStorage.setItem('userName', orderData.user.name);
    localStorage.setItem('userEmail', orderData.user.email);

    // Clear cart
    cart = [];
    saveCartToStorage();
    updateCartUI();
    updateCartDisplay();

    // Close payment modal
    closePaymentModal();
    document.getElementById('cartSidebar')?.classList.remove('active');

    // Show order confirmation with payment waiting message
    showOrderConfirmationWithTracking(orderId, orderData, orderSavedToBackend, isAuthenticated);
}

// ===== SHOW ORDER CONFIRMATION WITH TRACKING =====
function showOrderConfirmationWithTracking(orderId, orderData, orderSavedToBackend, isAuthenticated) {
    const modal = document.createElement('div');
    modal.id = 'orderConfirmationModal';
    modal.className = 'login-modal active';

    // Different button and message based on authentication status
    const actionButton = isAuthenticated ? `
        <p style="color: var(--vibrant-green); font-size: 16px; margin-bottom: 20px;">
            <i class="fas fa-shipping-fast"></i> Redirecting to order tracking...
        </p>
        
        <button onclick="redirectToOrderTracking()" class="submit-btn" style="width: 100%;">
            <i class="fas fa-map-marker-alt"></i>
            <span>Track Order Now</span>
        </button>
    ` : `
        <p style="color: var(--light-gold); font-size: 14px; margin-bottom: 20px;">
            <i class="fas fa-info-circle"></i> Login to track your order status
        </p>
        
        <button onclick="closeOrderConfirmation()" class="submit-btn" style="width: 100%;">
            <i class="fas fa-utensils"></i>
            <span>Back to Menu</span>
        </button>
    `;

    modal.innerHTML = `
        <div class="modal-overlay"></div>
        <div class="modal-content" style="max-width: 500px; text-align: center;">
            <div style="margin-bottom: 20px;">
                <div style="width: 80px; height: 80px; background: linear-gradient(135deg, #4CAF50, #45a049); border-radius: 50%; display: flex; align-items: center; justify-content: center; margin: 0 auto; box-shadow: 0 4px 20px rgba(76, 175, 80, 0.3); animation: scaleIn 0.3s ease-out;">
                    <i class="fas fa-check" style="font-size: 40px; color: white;"></i>
                </div>
            </div>
            <h2 class="modal-title" style="color: #4CAF50; margin-bottom: 10px;">Order Confirmed!</h2>
            <p style="color: var(--cream-white); font-size: 18px; margin-bottom: 20px;">
                Your order has been successfully placed
            </p>
            <div style="background: rgba(212, 175, 55, 0.1); padding: 20px; border-radius: 12px; margin-bottom: 20px; border: 2px solid rgba(212, 175, 55, 0.3);">
                <p style="color: var(--light-gold); font-size: 14px; margin-bottom: 5px;">Order ID</p>
                <p style="color: var(--primary-gold); font-size: 24px; font-weight: 700; font-family: 'Courier New', monospace;">${orderId}</p>
            </div>
            
            <div style="background: rgba(255, 165, 0, 0.1); padding: 15px; border-radius: 8px; margin-bottom: 20px; border: 1px solid rgba(255, 165, 0, 0.3);">
                <p style="color: #FFA500; font-size: 16px; margin: 0;">
                    <i class="fas fa-clock"></i> ${orderSavedToBackend ? 'Order Confirmed' : 'Order Created'}
                </p>
                <p style="color: var(--light-gold); font-size: 14px; margin-top: 8px;">
                    ${orderSavedToBackend ? 'Your order is being prepared!' : 'Order saved locally'}
                </p>
            </div>

            <div style="text-align: left; background: rgba(0, 0, 0, 0.2); padding: 15px; border-radius: 8px; margin-bottom: 20px;">
                <p style="color: var(--light-gold); margin-bottom: 10px;"><i class="fas fa-user"></i> ${orderData.user.name}</p>
                <p style="color: var(--light-gold); margin-bottom: 10px;"><i class="fas fa-envelope"></i> ${orderData.user.email}</p>
                <p style="color: var(--light-gold); margin-bottom: 10px;"><i class="fas fa-phone"></i> ${orderData.user.phone}</p>
                <p style="color: var(--light-gold);"><i class="fas fa-map-marker-alt"></i> ${orderData.user.address}</p>
            </div>
            
            ${actionButton}
        </div>
    `;

    document.body.appendChild(modal);

    // Show success toast
    if (typeof window.showToast === 'function') {
        window.showToast(`🎉 Order confirmed! Order ID: ${orderId}`);
    }

    // Auto-redirect to tracking after 3 seconds (only for authenticated users)
    if (isAuthenticated) {
        setTimeout(() => {
            redirectToOrderTracking();
        }, 3000);
    }
}

// ===== REDIRECT TO ORDER TRACKING =====
function redirectToOrderTracking() {
    // Close the confirmation modal
    closeOrderConfirmation();

    // Open order tracking modal
    if (typeof window.openOrderTracking === 'function') {
        window.openOrderTracking();
    } else {
        // Fallback: try to click the track order button
        document.getElementById('trackOrderBtn')?.click();
    }
}

// ===== SHOW ORDER CONFIRMATION (Legacy function - kept for compatibility) =====
function showOrderConfirmation(orderId, orderData) {
    const modal = document.createElement('div');
    modal.id = 'orderConfirmationModal';
    modal.className = 'login-modal active';
    modal.innerHTML = `
        <div class="modal-overlay"></div>
        <div class="modal-content" style="max-width: 500px; text-align: center;">
            <div style="margin-bottom: 20px;">
                <div style="width: 80px; height: 80px; background: linear-gradient(135deg, #4CAF50, #45a049); border-radius: 50%; display: flex; align-items: center; justify-content: center; margin: 0 auto; box-shadow: 0 4px 20px rgba(76, 175, 80, 0.3); animation: scaleIn 0.3s ease-out;">
                    <i class="fas fa-check" style="font-size: 40px; color: white;"></i>
                </div>
            </div>
            <h2 class="modal-title" style="color: #4CAF50; margin-bottom: 10px;">Order Confirmed!</h2>
            <p style="color: var(--cream-white); font-size: 18px; margin-bottom: 30px;">
                Your order has been successfully placed
            </p>
            <div style="background: rgba(212, 175, 55, 0.1); padding: 20px; border-radius: 12px; margin-bottom: 20px; border: 2px solid rgba(212, 175, 55, 0.3);">
                <p style="color: var(--light-gold); font-size: 14px; margin-bottom: 5px;">Order ID</p>
                <p style="color: var(--primary-gold); font-size: 24px; font-weight: 700; font-family: 'Courier New', monospace;">${orderId}</p>
            </div>
            <div style="text-align: left; background: rgba(0, 0, 0, 0.2); padding: 15px; border-radius: 8px; margin-bottom: 20px;">
                <p style="color: var(--light-gold); margin-bottom: 10px;"><i class="fas fa-user"></i> ${orderData.user.name}</p>
                <p style="color: var(--light-gold); margin-bottom: 10px;"><i class="fas fa-envelope"></i> ${orderData.user.email}</p>
                <p style="color: var(--light-gold); margin-bottom: 10px;"><i class="fas fa-phone"></i> ${orderData.user.phone}</p>
                <p style="color: var(--light-gold);"><i class="fas fa-map-marker-alt"></i> ${orderData.user.address}</p>
            </div>
            <p style="color: var(--cream-white); font-size: 16px; margin-bottom: 20px;">
                <i class="fas fa-motorcycle"></i> Your delicious food will be delivered soon!
            </p>
            <p style="color: var(--light-gold); font-size: 14px; margin-bottom: 30px;">
                We'll send updates to ${orderData.user.email}
            </p>
            <button onclick="closeOrderConfirmation()" class="submit-btn" style="width: 100%;">
                <i class="fas fa-home"></i>
                <span>Back to Home</span>
            </button>
        </div>
    `;

    document.body.appendChild(modal);

    // Show success toast
    if (typeof window.showToast === 'function') {
        window.showToast(`🎉 Order placed successfully! Order ID: ${orderId}`);
    }
}

// ===== CANCEL PAYMENT =====
function cancelPayment() {
    if (window.currentPaymentTimer) {
        clearInterval(window.currentPaymentTimer);
    }
    closePaymentModal();

    if (typeof window.showToast === 'function') {
        window.showToast('Payment cancelled');
    }
}

// ===== CLOSE PAYMENT MODAL =====
function closePaymentModal() {
    if (window.currentPaymentTimer) {
        clearInterval(window.currentPaymentTimer);
    }
    const modal = document.getElementById('qrPaymentModal');
    if (modal) {
        modal.remove();
    }
}

// ===== CLOSE ORDER CONFIRMATION =====
function closeOrderConfirmation() {
    const modal = document.getElementById('orderConfirmationModal');
    if (modal) {
        modal.remove();
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
window.closeCheckoutModal = closeCheckoutModal;
window.submitOrder = submitOrder;
window.cancelPayment = cancelPayment;
window.closeOrderConfirmation = closeOrderConfirmation;
window.redirectToOrderTracking = redirectToOrderTracking;
