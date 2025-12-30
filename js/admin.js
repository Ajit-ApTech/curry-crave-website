/*
 * Curry Crave - Admin Dashboard JavaScript
 * Handles all admin panel functionality
 */

// ===== CONSTANTS =====
const API_URL = 'http://localhost:5001/api';

// ===== INITIALIZATION =====
document.addEventListener('DOMContentLoaded', function () {
    checkAdminAuth();
    initializeAdminDashboard();
});

// ===== AUTHENTICATION =====
function checkAdminAuth() {
    const token = localStorage.getItem('authToken');
    const user = JSON.parse(localStorage.getItem('user') || 'null');

    // Check if user is logged in AND is an admin
    if (token && user && user.role === 'admin') {
        showDashboard(user);
    } else if (token && user && user.role !== 'admin') {
        // User is logged in but not an admin - clear credentials and show admin login
        console.log('Non-admin user detected, clearing credentials for admin login');
        localStorage.removeItem('authToken');
        localStorage.removeItem('user');
        showToast('Please login with admin credentials', 'error');
        showLoginModal();
    } else {
        showLoginModal();
    }
}

function showLoginModal() {
    document.getElementById('adminLoginModal').style.display = 'flex';
    document.getElementById('adminDashboard').style.display = 'none';
}

function showDashboard(user) {
    document.getElementById('adminLoginModal').style.display = 'none';
    document.getElementById('adminDashboard').style.display = 'flex';

    // Update admin profile display
    const adminProfile = document.querySelector('.admin-profile span');
    if (adminProfile && user) {
        adminProfile.textContent = user.name || 'Admin';
    }
}

// ===== LOGIN FORM =====
const adminLoginForm = document.getElementById('adminLoginForm');
adminLoginForm?.addEventListener('submit', async function (e) {
    e.preventDefault();

    const username = document.getElementById('adminUsername').value;
    const password = document.getElementById('adminPassword').value;

    try {
        const response = await fetch(`${API_URL}/auth/login`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                email: username, // Backend uses email field
                password: password
            })
        });

        const data = await response.json();

        if (data.success && data.user) {
            // Check if user is an admin
            if (data.user.role === 'admin') {
                // Store authentication data
                localStorage.setItem('authToken', data.token);
                localStorage.setItem('user', JSON.stringify(data.user));

                showDashboard(data.user);
                showToast(`Welcome back, ${data.user.name}!`);
                loadDashboardData();
            } else {
                showToast('Access Denied: Admin privileges required', 'error');
            }
        } else {
            showToast(data.message || 'Invalid credentials', 'error');
        }
    } catch (error) {
        console.error('Login error:', error);

        // Mock Admin Login Fallback
        const isMockCreds = (username === 'admin@currycrave.com' && password === 'admin123');
        if (isMockCreds) {
            const mockAdmin = {
                _id: 'admin_123',
                name: 'Admin User',
                email: 'admin@currycrave.com',
                role: 'admin'
            };
            localStorage.setItem('authToken', 'mock_admin_token');
            localStorage.setItem('user', JSON.stringify(mockAdmin));
            showDashboard(mockAdmin);
            showToast('Demo Admin Mode Activated');
            loadDashboardData();
            return;
        }

        showToast('Connection error. Use admin@currycrave.com / admin123 to test.', 'error');
    }
});

// Toggle password visibility
document.getElementById('toggleAdminPassword')?.addEventListener('click', function () {
    const passwordInput = document.getElementById('adminPassword');
    const icon = this.querySelector('i');

    if (passwordInput.type === 'password') {
        passwordInput.type = 'text';
        icon.classList.remove('fa-eye');
        icon.classList.add('fa-eye-slash');
    } else {
        passwordInput.type = 'password';
        icon.classList.remove('fa-eye-slash');
        icon.classList.add('fa-eye');
    }
});

// ===== DASHBOARD INITIALIZATION =====
function initializeAdminDashboard() {
    setupNavigation();
    setupSidebar();
    setupNotifications();
    loadDashboardData();
    setupMenuManagement();
    setupOrdersPage();
    setupUsersPage();
    setupAnalyticsPage();
    startOrderNotificationPolling();
}

// ===== NOTIFICATION DROPDOWN =====
function setupNotifications() {
    const notificationBtn = document.getElementById('notificationBtn');
    const notificationDropdown = document.getElementById('notificationDropdown');
    const clearNotifications = document.getElementById('clearNotifications');

    // Toggle dropdown
    notificationBtn?.addEventListener('click', function (e) {
        e.stopPropagation();
        const isVisible = notificationDropdown.style.display === 'block';
        notificationDropdown.style.display = isVisible ? 'none' : 'block';

        if (!isVisible) {
            loadNotifications();
        }
    });

    // Clear notifications
    clearNotifications?.addEventListener('click', function () {
        const notificationList = document.getElementById('notificationList');
        const badge = document.getElementById('notificationBadge');

        notificationList.innerHTML = `
            <div class="notification-empty">
                <i class="fas fa-bell-slash"></i>
                <p>No notifications</p>
            </div>
        `;
        badge.style.display = 'none';
        badge.textContent = '0';
    });

    // Close dropdown when clicking outside
    document.addEventListener('click', function (e) {
        if (!notificationDropdown.contains(e.target) && e.target !== notificationBtn) {
            notificationDropdown.style.display = 'none';
        }
    });
}

async function loadNotifications() {
    const notificationList = document.getElementById('notificationList');
    const badge = document.getElementById('notificationBadge');

    // Get recent orders from MongoDB API
    let recentOrders = [];

    try {
        const response = await fetch(`${API_URL}/order/admin/all`, {
            headers: {
                'Authorization': `Bearer ${getAuthToken()}`
            }
        });

        if (response.ok) {
            const result = await response.json();
            if (result.success && result.orders) {
                // Get 5 most recent orders
                recentOrders = result.orders.slice(0, 5);
            }
        }
    } catch (e) {
        console.error('Error loading notifications:', e);
    }

    if (recentOrders.length === 0) {
        notificationList.innerHTML = `
            <div class="notification-empty">
                <i class="fas fa-bell"></i>
                <p>No recent orders</p>
            </div>
        `;
        badge.style.display = 'none';
        return;
    }

    // Update badge
    badge.textContent = recentOrders.length;
    badge.style.display = 'flex';

    // Display notifications
    notificationList.innerHTML = recentOrders.map(order => {
        const orderId = order.orderId || order._id || 'N/A';
        const customerName = order.user?.name || order.guestCustomer?.name || 'Guest';
        const amount = order.totalAmount || 0;
        const status = order.orderStatus || order.status || 'pending';
        const time = formatTimeAgo(new Date(order.createdAt || order.date || Date.now()));

        return `
            <div class="notification-item" onclick="viewOrder('${order._id}')">
                <div class="notification-icon new-order">
                    <i class="fas fa-shopping-bag"></i>
                </div>
                <div class="notification-content">
                    <div class="notification-title">New Order #${orderId}</div>
                    <div class="notification-text">${customerName} - ₹${amount}</div>
                    <div class="notification-time">${time} • ${status}</div>
                </div>
            </div>
        `;
    }).join('');
}

function formatTimeAgo(date) {
    const now = new Date();
    const seconds = Math.floor((now - date) / 1000);

    if (seconds < 60) return 'Just now';
    if (seconds < 3600) return `${Math.floor(seconds / 60)}m ago`;
    if (seconds < 86400) return `${Math.floor(seconds / 3600)}h ago`;
    if (seconds < 604800) return `${Math.floor(seconds / 86400)}d ago`;
    return date.toLocaleDateString();
}


// ===== ORDER NOTIFICATION POLLING =====
let lastOrderCount = 0;
let orderPollingInterval = null;

function startOrderNotificationPolling() {
    // Check for new orders every 10 seconds
    orderPollingInterval = setInterval(checkForNewOrders, 10000);

    // Also check immediately
    checkForNewOrders();
}

async function checkForNewOrders() {
    try {
        const response = await fetch(`${API_URL}/order/admin/all`, {
            headers: {
                'Authorization': `Bearer ${getAuthToken()}`
            }
        });

        if (response.ok) {
            const result = await response.json();

            if (result.success && result.orders) {
                const currentOrderCount = result.count || result.orders.length;

                // If there are more orders than before, show notification
                if (lastOrderCount > 0 && currentOrderCount > lastOrderCount) {
                    const newOrdersCount = currentOrderCount - lastOrderCount;
                    showNewOrderNotification(newOrdersCount);

                    // Update the notification badge
                    updateNotificationBadge(newOrdersCount);

                    // Reload orders if on orders page
                    const ordersPage = document.getElementById('ordersPage');
                    if (ordersPage && ordersPage.style.display !== 'none') {
                        loadOrdersData();
                    }
                }

                lastOrderCount = currentOrderCount;
            }
        }
    } catch (error) {
        console.log('Error checking for new orders:', error);
    }
}

function showNewOrderNotification(count) {
    showToast(`🔔 ${count} new order${count > 1 ? 's' : ''} received!`, 'success');

    // Play notification sound (optional - you can add an audio file)
    // const audio = new Audio('assets/sounds/notification.mp3');
    // audio.play();
}

function updateNotificationBadge(count) {
    const badge = document.getElementById('notificationBadge');
    if (badge) {
        const currentCount = parseInt(badge.textContent) || 0;
        badge.textContent = currentCount + count;
        badge.style.display = 'flex';
    }
}

// Update orders badge in sidebar
function updateOrdersBadge(count) {
    const badge = document.getElementById('ordersBadge');
    if (badge && count > 0) {
        badge.textContent = count;
        badge.style.display = 'inline-block';
    } else if (badge) {
        badge.style.display = 'none';
    }
}


// ===== NAVIGATION =====
function setupNavigation() {
    const navItems = document.querySelectorAll('.nav-item');

    navItems.forEach(item => {
        item.addEventListener('click', function (e) {
            e.preventDefault();

            // Update active state
            navItems.forEach(nav => nav.classList.remove('active'));
            this.classList.add('active');

            // Show corresponding page
            const page = this.getAttribute('data-page');
            showPage(page);
        });
    });
}

function showPage(pageName) {
    // Hide all pages
    const pages = document.querySelectorAll('.page-content');
    pages.forEach(page => page.style.display = 'none');

    // Show selected page
    const selectedPage = document.getElementById(pageName + 'Page');
    if (selectedPage) {
        selectedPage.style.display = 'block';
    }

    // Update page title
    const pageTitle = document.getElementById('pageTitle');
    pageTitle.textContent = pageName.charAt(0).toUpperCase() + pageName.slice(1);

    // Load page-specific data
    switch (pageName) {
        case 'dashboard':
            loadDashboardData();
            break;
        case 'orders':
            loadOrdersData();
            break;
        case 'menu':
            loadMenuData();
            break;
        case 'users':
            loadUsersData();
            break;
        case 'analytics':
            loadAnalyticsData();
            break;
        case 'settings':
            loadSettingsData();
            break;
    }
}

// ===== SIDEBAR =====
function setupSidebar() {
    const sidebarToggle = document.getElementById('sidebarToggle');
    const mobileMenuToggle = document.getElementById('mobileMenuToggle');
    const sidebarClose = document.getElementById('sidebarClose');
    const sidebar = document.getElementById('sidebar');

    sidebarToggle?.addEventListener('click', function () {
        sidebar.classList.toggle('collapsed');
    });

    mobileMenuToggle?.addEventListener('click', function () {
        sidebar.classList.toggle('active');
    });

    // Close sidebar when X button is clicked
    sidebarClose?.addEventListener('click', function () {
        sidebar.classList.remove('active');
    });
}

// ===== LOGOUT =====
document.getElementById('logoutBtn')?.addEventListener('click', function () {
    if (confirm('Are you sure you want to logout?')) {
        localStorage.removeItem('authToken');
        localStorage.removeItem('user');
        showLoginModal();
        showToast('Logged out successfully!');
    }
});

// ===== DASHBOARD DATA =====
async function loadDashboardData() {
    try {
        const token = localStorage.getItem('authToken');

        // Fetch dashboard stats
        const statsResponse = await fetch(`${API_URL}/admin/stats`, {
            headers: {
                'Authorization': `Bearer ${token}`
            }
        });

        if (!statsResponse.ok) {
            throw new Error('Failed to fetch dashboard stats');
        }

        const statsData = await statsResponse.json();

        if (statsData.success) {
            updateDashboardStats(statsData.data);
            displayRecentOrders(statsData.data.recentOrders);

            // Render sales overview chart
            renderSalesOverviewChart(statsData.data.dailySales || []);
        }

        // Fetch top items
        await loadTopItems();

    } catch (error) {
        console.error('Error loading dashboard data:', error);
        showToast('Failed to load dashboard data', 'error');
    }
}

// Sales Overview Chart for Dashboard
let salesOverviewChart = null;

function renderSalesOverviewChart(dailySales) {
    const ctx = document.getElementById('salesChart');
    if (!ctx) return;

    // Destroy existing chart if exists
    if (salesOverviewChart) {
        salesOverviewChart.destroy();
    }

    // Generate last 7 days labels
    const labels = [];
    const salesData = [];

    for (let i = 6; i >= 0; i--) {
        const date = new Date();
        date.setDate(date.getDate() - i);
        labels.push(date.toLocaleDateString('en-IN', { weekday: 'short', day: 'numeric' }));

        // Find matching sales data or use 0
        const dayStr = date.toISOString().split('T')[0];
        const daySale = dailySales.find(d => d._id === dayStr || d.date === dayStr);
        salesData.push(daySale ? daySale.revenue || daySale.total || 0 : 0);
    }

    salesOverviewChart = new Chart(ctx, {
        type: 'line',
        data: {
            labels: labels,
            datasets: [{
                label: 'Revenue (₹)',
                data: salesData,
                borderColor: '#D4AF37',
                backgroundColor: 'rgba(212, 175, 55, 0.1)',
                fill: true,
                tension: 0.4,
                borderWidth: 3,
                pointBackgroundColor: '#D4AF37',
                pointBorderColor: '#fff',
                pointBorderWidth: 2,
                pointRadius: 5,
                pointHoverRadius: 8
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            plugins: {
                legend: {
                    display: false
                },
                tooltip: {
                    backgroundColor: 'rgba(0, 0, 0, 0.8)',
                    titleColor: '#D4AF37',
                    bodyColor: '#fff',
                    padding: 12,
                    displayColors: false,
                    callbacks: {
                        label: function (context) {
                            return '₹' + context.raw.toLocaleString('en-IN');
                        }
                    }
                }
            },
            scales: {
                x: {
                    grid: {
                        color: 'rgba(212, 175, 55, 0.1)'
                    },
                    ticks: {
                        color: '#B8860B'
                    }
                },
                y: {
                    grid: {
                        color: 'rgba(212, 175, 55, 0.1)'
                    },
                    ticks: {
                        color: '#B8860B',
                        callback: function (value) {
                            return '₹' + value.toLocaleString('en-IN');
                        }
                    },
                    beginAtZero: true
                }
            }
        }
    });
}

function updateDashboardStats(data) {
    // Update stat cards
    const statValues = document.querySelectorAll('.stat-value');
    if (statValues.length >= 4) {
        statValues[0].textContent = data.totalOrders.toLocaleString();
        statValues[1].textContent = `₹${data.totalRevenue.toLocaleString('en-IN')}`;
        statValues[2].textContent = data.totalUsers.toLocaleString();
        statValues[3].textContent = data.totalMenuItems.toLocaleString();
    }

    // Update growth percentages
    const statChanges = document.querySelectorAll('.stat-change');
    if (statChanges.length >= 3) {
        updateGrowthIndicator(statChanges[0], data.ordersGrowth, 'Orders');
        updateGrowthIndicator(statChanges[1], data.revenueGrowth, 'Revenue');
        updateGrowthIndicator(statChanges[2], data.usersGrowth, 'Users');
    }
}

function updateGrowthIndicator(element, growth, label) {
    const growthNum = parseFloat(growth);
    const isPositive = growthNum > 0;
    const isNeutral = growthNum === 0;

    element.className = `stat-change ${isNeutral ? 'neutral' : isPositive ? 'positive' : 'negative'}`;

    const icon = isNeutral ? 'fa-minus' : isPositive ? 'fa-arrow-up' : 'fa-arrow-down';
    const text = isNeutral ? 'No change' : `${Math.abs(growthNum)}% from last month`;

    element.innerHTML = `<i class="fas ${icon}"></i> ${text}`;
}

async function loadTopItems() {
    const container = document.getElementById('topItemsList');
    if (!container) return;

    // Show placeholder for top items (can be populated from analytics API later)
    container.innerHTML = `
        <div style="text-align: center; padding: 30px; color: var(--light-gold);">
            <i class="fas fa-chart-bar" style="font-size: 32px; margin-bottom: 10px; opacity: 0.5;"></i>
            <p style="margin: 0;">Top items analytics coming soon</p>
        </div>
    `;
}

// loadRecentOrders() function removed - using displayRecentOrders() with real MongoDB data instead

// ===== ORDERS PAGE =====
function setupOrdersPage() {
    // Filter functionality can be added here
}

// Orders page state
let currentOrdersPage = 1;
let currentOrdersStatus = 'all';
let currentSearchQuery = '';
const ordersPerPage = 20;

// Global search handler
function handleGlobalSearch(query) {
    currentSearchQuery = query.toLowerCase().trim();

    // Determine which page is active and search accordingly
    const ordersPage = document.getElementById('ordersPage');
    const menuPage = document.getElementById('menuPage');
    const usersPage = document.getElementById('usersPage');

    if (ordersPage && ordersPage.style.display !== 'none') {
        loadOrdersData();
    } else if (menuPage && menuPage.style.display !== 'none') {
        loadMenuData();
    } else if (usersPage && usersPage.style.display !== 'none') {
        loadUsersData();
    }
}

async function loadOrdersData() {
    const container = document.getElementById('ordersGrid');
    if (!container) return;

    try {
        // Show loading state
        container.innerHTML = '<div style="grid-column: 1 / -1; text-align: center; padding: 40px; color: var(--light-gold);"><i class="fas fa-spinner fa-spin" style="font-size: 32px;"></i><p style="margin-top: 15px;">Loading orders...</p></div>';

        console.log('🔑 Admin token:', getAuthToken() ? 'EXISTS' : 'MISSING');

        // Build URL with status filter if set
        let apiUrl = `${API_URL}/order/admin/all`;
        if (currentOrdersStatus && currentOrdersStatus !== 'all') {
            apiUrl += `?status=${currentOrdersStatus}`;
        }
        console.log('📡 Fetching from:', apiUrl);

        // Fetch orders from API
        const response = await fetch(apiUrl, {
            headers: {
                'Authorization': `Bearer ${getAuthToken()}`
            }
        });

        const result = await response.json();
        console.log('📊 Response:', result.success ? `SUCCESS (${result.count || 0} orders)` : `FAILED: ${result.message}`);

        if (!result.success) {
            throw new Error(result.message || 'Failed to load orders');
        }

        // Handle response - could be result.orders or result.data
        let orders = result.orders || result.data || [];

        // Client-side filter by status
        if (currentOrdersStatus && currentOrdersStatus !== 'all') {
            orders = orders.filter(order => order.orderStatus === currentOrdersStatus);
        }

        // Client-side filter by search query
        if (currentSearchQuery) {
            orders = orders.filter(order => {
                const orderId = (order.orderId || order._id || '').toLowerCase();
                const customerName = (order.user?.name || order.guestCustomer?.name || '').toLowerCase();
                const items = order.items?.map(i => i.name || '').join(' ').toLowerCase() || '';

                return orderId.includes(currentSearchQuery) ||
                    customerName.includes(currentSearchQuery) ||
                    items.includes(currentSearchQuery);
            });
        }

        const totalOrdersCount = result.count || orders.length;

        // Update the orders badge in sidebar
        updateOrdersBadge(totalOrdersCount);

        if (orders.length === 0) {
            container.innerHTML = `
                <div style="grid-column: 1 / -1; text-align: center; padding: 60px;">
                    <i class="fas fa-inbox" style="font-size: 64px; color: var(--light-gold); opacity: 0.3;"></i>
                    <h3 style="color: var(--cream); margin-top: 20px;">No orders found</h3>
                    <p style="color: var(--light-gold); margin-top: 10px;">There are no orders matching your criteria.</p>
                </div>
            `;
            return;
        }

        // Render orders
        container.innerHTML = orders.map(order => {
            // Format date
            const orderDate = new Date(order.createdAt).toLocaleDateString('en-IN', {
                year: 'numeric',
                month: 'short',
                day: 'numeric'
            });

            // Get customer name - handle both user and guest customer
            const customerName = order.user?.name || order.guestCustomer?.name || 'Guest Customer';

            // Format items list
            const itemsList = order.items.map(item =>
                `${item.name || item.food?.name || 'Item'} (x${item.quantity})`
            ).join(', ');

            // Format amount
            const amount = `₹${order.totalAmount.toFixed(2)}`;

            return `
                <div class="order-card">
                    <div class="order-card-content">
                        <div style="display: flex; justify-content: space-between; margin-bottom: 15px;">
                            <div>
                                <strong style="color: var(--primary-gold); font-size: 16px;">${order.orderId}</strong>
                                <p style="color: var(--light-gold); font-size: 13px; margin-top: 3px;">${orderDate}</p>
                            </div>
                            <span class="status-badge status-${order.orderStatus}">${order.orderStatus.replace('_', ' ')}</span>
                        </div>
                        <div style="margin-bottom: 12px;">
                            <p style="color: var(--cream); font-weight: 600; margin-bottom: 5px;">${customerName}</p>
                            <p style="color: var(--light-gold); font-size: 14px;">${itemsList}</p>
                        </div>
                        <div style="display: flex; justify-content: space-between; align-items: center; padding-top: 15px; border-top: 1px solid var(--charcoal);">
                            <strong style="color: var(--vibrant-green); font-size: 18px;">${amount}</strong>
                            <button class="view-btn" onclick="viewOrder('${order._id}')">View Details</button>
                        </div>
                    </div>
                </div>
            `;
        }).join('');

        // Update pagination info and controls (disabled for now)
        // updateOrdersPagination(pagination);

    } catch (error) {
        console.error('Error loading orders:', error);

        // Show error message with retry option
        container.innerHTML = `
            <div style="grid-column: 1 / -1; text-align: center; padding: 60px;">
                <i class="fas fa-exclamation-circle" style="font-size: 64px; color: #e74c3c; margin-bottom: 20px;"></i>
                <h3 style="color: var(--cream); margin-bottom: 10px;">Failed to Load Orders</h3>
                <p style="color: var(--light-gold); margin-bottom: 20px;">Unable to connect to the server. Please check your connection and try again.</p>
                <button class="view-btn" onclick="loadOrdersData()">
                    <i class="fas fa-redo"></i> Retry
                </button>
            </div>
        `;
    }
}

function updateOrdersPagination(pagination) {
    const paginationContainer = document.getElementById('ordersPagination');
    if (!paginationContainer) return;

    const { page, pages, total } = pagination;

    let html = `
        <div style="display: flex; justify-content: space-between; align-items: center; margin-top: 30px; padding: 20px; background: var(--charcoal); border-radius: 10px;">
            <p style="color: var(--light-gold);">
                Showing page ${page} of ${pages} (${total} total orders)
            </p>
            <div style="display: flex; gap: 10px;">
    `;

    // Previous button
    if (page > 1) {
        html += `<button class="view-btn" onclick="goToOrdersPage(${page - 1})">
            <i class="fas fa-chevron-left"></i> Previous
        </button>`;
    }

    // Next button
    if (page < pages) {
        html += `<button class="view-btn" onclick="goToOrdersPage(${page + 1})">
            Next <i class="fas fa-chevron-right"></i>
        </button>`;
    }

    html += `
            </div>
        </div>
    `;

    paginationContainer.innerHTML = html;
}

function goToOrdersPage(page) {
    currentOrdersPage = page;
    loadOrdersData();
}

function filterOrdersByStatus(status) {
    currentOrdersStatus = status;
    currentOrdersPage = 1; // Reset to first page
    loadOrdersData();
}



async function viewOrder(orderId) {
    try {
        // Close notification dropdown if open
        const notificationDropdown = document.getElementById('notificationDropdown');
        if (notificationDropdown) {
            notificationDropdown.style.display = 'none';
        }

        // Navigate to orders page first
        const ordersNavItem = document.querySelector('[data-page="orders"]');
        if (ordersNavItem) {
            // Update active nav state
            document.querySelectorAll('.nav-item').forEach(nav => nav.classList.remove('active'));
            ordersNavItem.classList.add('active');

            // Show orders page
            showPage('orders');
        }

        // Fetch order from MongoDB API
        const response = await fetch(`${API_URL}/order/${orderId}`, {
            headers: {
                'Authorization': `Bearer ${getAuthToken()}`
            }
        });

        const result = await response.json();

        if (!result.success || !result.order) {
            showToast('Order not found', 'error');
            return;
        }

        // Display order details in modal
        displayOrderDetailsModal(result.order);

    } catch (error) {
        console.error('Error viewing order:', error);
        showToast('Failed to load order details. Please check your connection.', 'error');
    }
}

function displayOrderDetailsModal(order) {
    const modal = document.getElementById('orderDetailsModal');
    const orderBody = document.getElementById('orderDetailsBody');

    if (!modal || !orderBody) return;

    // Format date
    const orderDate = new Date(order.createdAt || order.date || Date.now()).toLocaleString('en-IN', {
        year: 'numeric',
        month: 'long',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
    });

    // Get customer info - check both user (authenticated) and guestCustomer (checkout form)
    const customerName = order.user?.name || order.guestCustomer?.name || order.customerName || order.customer || 'Unknown Customer';
    const customerEmail = order.user?.email || order.guestCustomer?.email || order.customerEmail || 'N/A';
    const customerPhone = order.user?.phone || order.guestCustomer?.phone || order.customerPhone || order.phone || 'N/A';

    // Get order ID
    const displayOrderId = order.orderId || order.id || order._id;

    // Get items
    let itemsHTML = '';
    let subtotal = 0;

    if (Array.isArray(order.items)) {
        itemsHTML = order.items.map(item => {
            const itemName = item.name || item.food?.name || 'Unknown Item';
            const itemPrice = item.price || item.food?.price || 0;
            const itemQty = item.quantity || 1;
            const itemTotal = itemPrice * itemQty;
            subtotal += itemTotal;

            return `
                <div style="display: flex; justify-content: space-between; padding: 12px; border-bottom: 1px solid var(--charcoal);">
                    <div>
                        <strong style="color: var(--cream);">${itemName}</strong>
                        <p style="color: var(--light-gold); font-size: 13px; margin-top: 4px;">₹${itemPrice} × ${itemQty}</p>
                    </div>
                    <div style="text-align: right;">
                        <strong style="color: var(--primary-gold);">₹${itemTotal}</strong>
                    </div>
                </div>
            `;
        }).join('');
    } else if (typeof order.items === 'string') {
        itemsHTML = `
            <div style="padding: 12px; border-bottom: 1px solid var(--charcoal);">
                <p style="color: var(--cream);">${order.items}</p>
            </div>
        `;
        subtotal = order.totalAmount || parseFloat(order.amount?.replace('₹', '')) || 0;
    }

    const deliveryFee = 0; // Could be dynamic
    const tax = Math.round(subtotal * 0.05); // 5% tax
    const total = order.totalAmount || (subtotal + deliveryFee + tax);

    // Get current status
    const currentStatus = order.orderStatus || order.status || 'pending';

    // Build modal content
    orderBody.innerHTML = `
        <div style="padding: 20px;">
            <!-- Order Header -->
            <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 24px; padding-bottom: 16px; border-bottom: 2px solid var(--charcoal);">
                <div>
                    <h4 style="color: var(--primary-gold); font-size: 20px; margin-bottom: 8px;">Order #${displayOrderId}</h4>
                    <p style="color: var(--light-gold); font-size: 14px;">${orderDate}</p>
                </div>
                <span class="status-badge status-${currentStatus}" style="font-size: 14px; padding: 8px 16px;">
                    ${currentStatus.replace(/_/g, ' ').toUpperCase()}
                </span>
            </div>
            
            <!-- Customer Information -->
            <div style="margin-bottom: 24px;">
                <h4 style="color: var(--cream); font-size: 16px; margin-bottom: 12px; display: flex; align-items: center;">
                    <i class="fas fa-user" style="margin-right: 8px; color: var(--primary-gold);"></i>
                    Customer Information
                </h4>
                <div style="background: var(--charcoal); padding: 16px; border-radius: 8px;">
                    <div style="display: grid; grid-template-columns: repeat(2, 1fr); gap: 12px;">
                        <div>
                            <p style="color: var(--light-gold); font-size: 12px; margin-bottom: 4px;">Name</p>
                            <p style="color: var(--cream); font-weight: 500;">${customerName}</p>
                        </div>
                        <div>
                            <p style="color: var(--light-gold); font-size: 12px; margin-bottom: 4px;">Email</p>
                            <p style="color: var(--cream); font-weight: 500;">${customerEmail}</p>
                        </div>
                        <div>
                            <p style="color: var(--light-gold); font-size: 12px; margin-bottom: 4px;">Phone</p>
                            <p style="color: var(--cream); font-weight: 500;">${customerPhone}</p>
                        </div>
                        <div>
                            <p style="color: var(--light-gold); font-size: 12px; margin-bottom: 4px;">Delivery Address</p>
                            <p style="color: var(--cream); font-weight: 500;">${order.deliveryAddress || 'Hostel Room'}</p>
                        </div>
                    </div>
                </div>
            </div>
            
            <!-- Order Items -->
            <div style="margin-bottom: 24px;">
                <h4 style="color: var(--cream); font-size: 16px; margin-bottom: 12px; display: flex; align-items: center;">
                    <i class="fas fa-shopping-bag" style="margin-right: 8px; color: var(--primary-gold);"></i>
                    Order Items
                </h4>
                <div style="background: var(--charcoal); border-radius: 8px; overflow: hidden;">
                    ${itemsHTML}
                </div>
            </div>
            
            <!-- Order Summary -->
            <div style="margin-bottom: 24px;">
                <h4 style="color: var(--cream); font-size: 16px; margin-bottom: 12px; display: flex; align-items: center;">
                    <i class="fas fa-receipt" style="margin-right: 8px; color: var(--primary-gold);"></i>
                    Order Summary
                </h4>
                <div style="background: var(--charcoal); padding: 16px; border-radius: 8px;">
                    <div style="display: flex; justify-content: space-between; margin-bottom: 8px;">
                        <span style="color: var(--light-gold);">Subtotal</span>
                        <span style="color: var(--cream);">₹${subtotal}</span>
                    </div>
                    <div style="display: flex; justify-content: space-between; margin-bottom: 8px;">
                        <span style="color: var(--light-gold);">Delivery Fee</span>
                        <span style="color: var(--cream);">₹${deliveryFee}</span>
                    </div>
                    <div style="display: flex; justify-content: space-between; margin-bottom: 12px; padding-bottom: 12px; border-bottom: 1px dashed var(--light-gold);">
                        <span style="color: var(--light-gold);">Tax (5%)</span>
                        <span style="color: var(--cream);">₹${tax}</span>
                    </div>
                    <div style="display: flex; justify-content: space-between; align-items: center;">
                        <span style="color: var(--cream); font-size: 18px; font-weight: 600;">Total</span>
                        <span style="color: var(--vibrant-green); font-size: 22px; font-weight: 700;">₹${total}</span>
                    </div>
                </div>
            </div>
            
            <!-- Update Status -->
            <div>
                <h4 style="color: var(--cream); font-size: 16px; margin-bottom: 12px; display: flex; align-items: center;">
                    <i class="fas fa-tasks" style="margin-right: 8px; color: var(--primary-gold);"></i>
                    Update Order Status
                </h4>
                <div style="display: flex; gap: 12px; align-items: center;">
                    <select id="orderStatusSelect" style="flex: 1; padding: 12px; border-radius: 8px; background: var(--charcoal); color: var(--cream); border: 1px solid var(--primary-gold); font-size: 14px;">
                        <option value="pending" ${currentStatus === 'pending' ? 'selected' : ''}>Pending</option>
                        <option value="confirmed" ${currentStatus === 'confirmed' ? 'selected' : ''}>Confirmed</option>
                        <option value="preparing" ${currentStatus === 'preparing' ? 'selected' : ''}>Preparing</option>
                        <option value="out_for_delivery" ${currentStatus === 'out_for_delivery' ? 'selected' : ''}>Out for Delivery</option>
                        <option value="delivered" ${currentStatus === 'delivered' ? 'selected' : ''}>Delivered</option>
                        <option value="cancelled" ${currentStatus === 'cancelled' ? 'selected' : ''}>Cancelled</option>
                    </select>
                    <button onclick="updateOrderStatusFromModal('${order._id}')" class="submit-btn" style="padding: 12px 24px;">
                        <i class="fas fa-sync-alt"></i> Update
                    </button>
                </div>
            </div>
        </div>
    `;

    // Show modal
    modal.classList.add('active');

    // Setup close button
    const closeBtn = document.getElementById('closeOrderModal');
    closeBtn.onclick = () => {
        modal.classList.remove('active');
    };

    // Close on background click
    modal.onclick = (e) => {
        if (e.target === modal) {
            modal.classList.remove('active');
        }
    };
}

// Update order status from modal
window.updateOrderStatusFromModal = async function (orderId) {
    const select = document.getElementById('orderStatusSelect');
    const newStatus = select.value;

    await updateOrderStatus(orderId, newStatus);

    // Close modal and reload orders
    document.getElementById('orderDetailsModal').classList.remove('active');
    loadOrdersData();
};


// ===== MENU MANAGEMENT =====
let currentMenuItems = [];

function setupMenuManagement() {
    const addBtn = document.getElementById('addMenuItemBtn');
    const closeBtn = document.getElementById('closeMenuModal');
    const cancelBtn = document.getElementById('cancelMenuBtn');
    const menuForm = document.getElementById('menuItemForm');

    addBtn?.addEventListener('click', () => openMenuModal());
    closeBtn?.addEventListener('click', () => closeMenuModal());
    cancelBtn?.addEventListener('click', () => closeMenuModal());

    menuForm?.addEventListener('submit', function (e) {
        e.preventDefault();
        saveMenuItem();
    });
}

async function loadMenuData() {
    const container = document.getElementById('menuGrid');
    if (!container) return;

    try {
        container.innerHTML = '<div style="grid-column: 1 / -1; text-align: center; padding: 40px;"><i class="fas fa-spinner fa-spin" style="font-size: 32px; color: var(--primary-gold);"></i></div>';

        const response = await fetch(`${API_URL}/food?all=true`);
        const result = await response.json();

        if (!result.success) {
            throw new Error(result.message || 'Failed to fetch menu items');
        }

        currentMenuItems = result.foods || [];

        if (currentMenuItems.length === 0) {
            container.innerHTML = '<div style="grid-column: 1 / -1; text-align: center; padding: 40px; color: var(--light-gold);">No menu items found.</div>';
            return;
        }

        container.innerHTML = currentMenuItems.map(item => `
            <div class="menu-item-card ${!item.isAvailable ? 'unavailable' : ''}">
                <img src="${item.image}" alt="${item.name}" class="menu-item-image" onerror="this.src='assets/images/placeholder.jpg'">
                <div class="menu-item-content">
                    <div class="menu-item-header">
                        <h4 class="menu-item-name">${item.name}</h4>
                        <span class="menu-item-price">₹${item.price}</span>
                    </div>
                    <div style="display: flex; align-items: center; gap: 8px; margin-bottom: 8px;">
                        <span style="color: #FFD700;"><i class="fas fa-star"></i> ${item.rating || 0}</span>
                        <span style="color: var(--light-gold); font-size: 12px;">• ${item.preparationTime || 30} mins</span>
                    </div>
                    <div style="display: flex; gap: 5px; flex-wrap: wrap; margin-bottom: 10px;">
                        ${item.badge ? `<span class="status-badge status-confirmed">${item.badge}</span>` : ''}
                        <span class="status-badge status-pending">${item.category}</span>
                        ${!item.isAvailable ? `<span class="status-badge status-cancelled">Unavailable</span>` : ''}
                    </div>
                    <p class="menu-item-description">${item.description}</p>
                    <div class="menu-item-actions">
                        <button class="edit-btn" onclick="editMenuItem('${item._id}')">
                            <i class="fas fa-edit"></i> Edit
                        </button>
                        <button class="delete-btn" onclick="deleteMenuItem('${item._id}')">
                            <i class="fas fa-trash"></i> Delete
                        </button>
                    </div>
                </div>
            </div>
        `).join('');
    } catch (error) {
        console.error('Error loading menu:', error);

        // Fallback to demo menu data
        try {
            currentMenuItems = [
                {
                    _id: 'demo_1',
                    name: 'Butter Chicken Curry',
                    description: 'Rich and creamy tomato-based curry with tender chicken pieces',
                    price: 299,
                    category: 'curry',
                    image: 'assets/images/butter-chicken.jpg',
                    rating: 4.8,
                    badge: 'Popular',
                    isAvailable: true
                },
                {
                    _id: 'demo_2',
                    name: 'Paneer Tikka Masala',
                    description: 'Grilled cottage cheese in aromatic spiced gravy',
                    price: 249,
                    category: 'curry',
                    image: 'assets/images/paneer-tikka.jpg',
                    rating: 4.7,
                    badge: 'Veg',
                    isAvailable: true
                },
                {
                    _id: 'demo_3',
                    name: 'Garlic Naan',
                    description: 'Freshly baked soft bread topped with garlic and butter',
                    price: 49,
                    category: 'bread',
                    image: 'assets/images/garlic-naan.jpg',
                    rating: 4.9,
                    badge: 'Bestseller',
                    isAvailable: true
                },
                {
                    _id: 'demo_4',
                    name: 'Biryani Bowl',
                    description: 'Fragrant basmati rice cooked with aromatic spices',
                    price: 349,
                    category: 'rice',
                    image: 'assets/images/biryani.jpg',
                    rating: 4.9,
                    badge: 'Chef Special',
                    isAvailable: true
                },
                {
                    _id: 'demo_5',
                    name: 'Dal Makhani',
                    description: 'Creamy black lentils slow-cooked with butter and cream',
                    price: 199,
                    category: 'curry',
                    image: 'assets/images/dal-makhani.jpg',
                    rating: 4.6,
                    badge: 'Veg',
                    isAvailable: true
                },
                {
                    _id: 'demo_6',
                    name: 'Gulab Jamun',
                    description: 'Sweet milk dumplings soaked in rose-flavored syrup',
                    price: 89,
                    category: 'desserts',
                    image: 'assets/images/gulab-jamun.jpg',
                    rating: 4.8,
                    badge: 'Sweet',
                    isAvailable: false
                }
            ];

            container.innerHTML = currentMenuItems.map(item => `
                <div class="menu-item-card ${!item.isAvailable ? 'unavailable' : ''}">
                    <img src="${item.image}" alt="${item.name}" class="menu-item-image" onerror="this.src='assets/images/placeholder.jpg'">
                    <div class="menu-item-content">
                        <div class="menu-item-header">
                            <h4 class="menu-item-name">${item.name}</h4>
                            <span class="menu-item-price">₹${item.price}</span>
                        </div>
                        <div style="display: flex; align-items: center; gap: 8px; margin-bottom: 8px;">
                            <span style="color: #FFD700;"><i class="fas fa-star"></i> ${item.rating || 0}</span>
                            <span style="color: var(--light-gold); font-size: 12px;">• ${item.preparationTime || 30} mins</span>
                        </div>
                        <div style="display: flex; gap: 5px; flex-wrap: wrap; margin-bottom: 10px;">
                            ${item.badge ? `<span class="status-badge status-confirmed">${item.badge}</span>` : ''}
                            <span class="status-badge status-pending">${item.category}</span>
                            ${!item.isAvailable ? `<span class="status-badge status-cancelled">Unavailable</span>` : ''}
                        </div>
                        <p class="menu-item-description">${item.description}</p>
                        <div class="menu-item-actions">
                            <button class="edit-btn" onclick="editMenuItem('${item._id}')">
                                <i class="fas fa-edit"></i> Edit
                            </button>
                            <button class="delete-btn" onclick="deleteMenuItem('${item._id}')">
                                <i class="fas fa-trash"></i> Delete
                            </button>
                        </div>
                    </div>
                </div>
            `).join('');

            showToast('Showing Demo Menu Data (API unavailable)');
        } catch (fallbackError) {
            container.innerHTML = `<div style="grid-column: 1 / -1; text-align: center; padding: 40px; color: var(--vibrant-red);">Error: ${error.message}</div>`;
        }
    }
}

let editingItemId = null;

function openMenuModal(itemId = null) {
    const modal = document.getElementById('menuItemModal');
    const modalTitle = document.getElementById('modalTitle');
    const form = document.getElementById('menuItemForm');

    form.reset();

    if (itemId) {
        editingItemId = itemId;
        const item = currentMenuItems.find(i => i._id === itemId);
        if (item) {
            modalTitle.textContent = 'Edit Menu Item';
            document.getElementById('itemName').value = item.name;
            document.getElementById('itemCategory').value = item.category;
            document.getElementById('itemPrice').value = item.price;
            document.getElementById('itemDescription').value = item.description;
            document.getElementById('itemImage').value = item.image || '';
            document.getElementById('itemBadge').value = item.badge || '';
            document.getElementById('itemRating').value = item.rating || 0;
            document.getElementById('itemPrepTime').value = item.preparationTime || 30;
            document.getElementById('itemAvailability').checked = item.isAvailable !== false;
        }
    } else {
        editingItemId = null;
        modalTitle.textContent = 'Add New Menu Item';
        document.getElementById('itemAvailability').checked = true;
        document.getElementById('itemRating').value = 4.5;
        document.getElementById('itemPrepTime').value = 30;
    }

    modal.classList.add('active');
}

function closeMenuModal() {
    const modal = document.getElementById('menuItemModal');
    modal.classList.remove('active');
    editingItemId = null;
    document.getElementById('menuItemForm').reset();
}

async function saveMenuItem() {
    const itemData = {
        name: document.getElementById('itemName').value,
        category: document.getElementById('itemCategory').value.toLowerCase(), // Convert to lowercase
        price: parseInt(document.getElementById('itemPrice').value),
        description: document.getElementById('itemDescription').value,
        image: document.getElementById('itemImage').value || 'assets/images/placeholder.jpg',
        badge: document.getElementById('itemBadge').value || null,
        rating: parseFloat(document.getElementById('itemRating').value) || 0,
        preparationTime: parseInt(document.getElementById('itemPrepTime').value) || 30,
        isAvailable: document.getElementById('itemAvailability').checked
    };

    try {
        const url = editingItemId ? `${API_URL}/food/${editingItemId}` : `${API_URL}/food`;
        const method = editingItemId ? 'PUT' : 'POST';

        const response = await fetch(url, {
            method: method,
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${getAuthToken()}`
            },
            body: JSON.stringify(itemData)
        });

        const result = await response.json();

        if (result.success) {
            showToast(editingItemId ? 'Menu item updated successfully!' : 'Menu item added successfully!');
            closeMenuModal();
            loadMenuData();
        } else {
            showToast(result.message || 'Failed to save menu item', 'error');
        }
    } catch (error) {
        console.error('Error saving menu item:', error);
        showToast('Connection error. Please try again.', 'error');
    }
}

function editMenuItem(id) {
    openMenuModal(id);
}

async function deleteMenuItem(id) {
    if (confirm('Are you sure you want to delete this menu item?')) {
        try {
            const response = await fetch(`${API_URL}/food/${id}`, {
                method: 'DELETE',
                headers: {
                    'Authorization': `Bearer ${getAuthToken()}`
                }
            });

            const result = await response.json();

            if (result.success) {
                showToast('Menu item deleted successfully!');
                loadMenuData();
            } else {
                showToast(result.message || 'Failed to delete menu item', 'error');
            }
        } catch (error) {
            console.error('Error deleting menu item:', error);
            showToast('Connection error. Please try again.', 'error');
        }
    }
}

// ===== USERS PAGE =====
function setupUsersPage() {
    // User management functionality
}

// Users page state
let currentUsersPage = 1;
const usersPerPage = 20;

async function loadUsersData() {
    const tbody = document.getElementById('usersTableBody');
    if (!tbody) return;

    try {
        // Show loading state
        tbody.innerHTML = '<tr><td colspan="8" style="text-align: center; padding: 40px; color: var(--light-gold);"><i class="fas fa-spinner fa-spin" style="font-size: 32px;"></i><p style="margin-top: 15px;">Loading users...</p></td></tr>';

        // Fetch users from API
        const response = await fetch(`${API_URL}/admin/users?page=${currentUsersPage}&limit=${usersPerPage}`, {
            headers: {
                'Authorization': `Bearer ${getAuthToken()}`
            }
        });

        const result = await response.json();

        if (!result.success) {
            throw new Error(result.message || 'Failed to load users');
        }

        const users = result.data;

        if (users.length === 0) {
            tbody.innerHTML = '<tr><td colspan="8" style="text-align: center; padding: 40px; color: var(--light-gold);">No users found</td></tr>';
            return;
        }

        tbody.innerHTML = users.map(user => {
            const joinedDate = new Date(user.createdAt).toLocaleDateString('en-IN', {
                year: 'numeric',
                month: 'short',
                day: 'numeric'
            });

            return `
                <tr>
                    <td><strong>#${user._id.slice(-6).toUpperCase()}</strong></td>
                    <td>${user.name}</td>
                    <td>${user.email}</td>
                    <td>${user.phone || 'N/A'}</td>
                    <td>${user.orderCount || 0}</td>
                    <td><strong style="color: var(--vibrant-green);">₹${(user.totalSpent || 0).toLocaleString('en-IN')}</strong></td>
                    <td>${joinedDate}</td>
                    <td><button class="action-btn" onclick="viewUser('${user._id}')">View</button></td>
                </tr>
            `;
        }).join('');

        // Update pagination info and controls (disabled for now)
        // updateUsersPagination(pagination);

    } catch (error) {
        console.error('Error loading users:', error);

        // Fallback to demo users data
        try {
            const demoUsers = [
                {
                    _id: 'user_demo_1',
                    name: 'Demo User',
                    email: 'demo@currycrave.com',
                    phone: '+91 98765 43210',
                    orderCount: 15,
                    totalSpent: 4500,
                    createdAt: new Date(2025, 10, 1).toISOString()
                },
                {
                    _id: 'user_demo_2',
                    name: 'Rahul Kumar',
                    email: 'rahul@example.com',
                    phone: '+91 98765 43211',
                    orderCount: 23,
                    totalSpent: 6890,
                    createdAt: new Date(2025, 9, 15).toISOString()
                },
                {
                    _id: 'user_demo_3',
                    name: 'Priya Sharma',
                    email: 'priya@example.com',
                    phone: '+91 98765 43212',
                    orderCount: 12,
                    totalSpent: 3450,
                    createdAt: new Date(2025, 10, 5).toISOString()
                },
                {
                    _id: 'user_demo_4',
                    name: 'Amit Patel',
                    email: 'amit@example.com',
                    phone: '+91 98765 43213',
                    orderCount: 8,
                    totalSpent: 2340,
                    createdAt: new Date(2025, 10, 20).toISOString()
                },
                {
                    _id: 'user_demo_5',
                    name: 'Sneha Reddy',
                    email: 'sneha@example.com',
                    phone: '+91 98765 43214',
                    orderCount: 19,
                    totalSpent: 5670,
                    createdAt: new Date(2025, 9, 25).toISOString()
                }
            ];

            tbody.innerHTML = demoUsers.map(user => {
                const joinedDate = new Date(user.createdAt).toLocaleDateString('en-IN', {
                    year: 'numeric',
                    month: 'short',
                    day: 'numeric'
                });

                return `
                    <tr>
                        <td><strong>#${user._id.slice(-6).toUpperCase()}</strong></td>
                        <td>${user.name}</td>
                        <td>${user.email}</td>
                        <td>${user.phone || 'N/A'}</td>
                        <td>${user.orderCount || 0}</td>
                        <td><strong style="color: var(--vibrant-green);">₹${(user.totalSpent || 0).toLocaleString('en-IN')}</strong></td>
                        <td>${joinedDate}</td>
                        <td><button class="action-btn" onclick="viewUser('${user._id}')">View</button></td>
                    </tr>
                `;
            }).join('');

            // Update pagination with demo data
            const demoDocument = document.getElementById('usersPagination');
            if (demoDocument) {
                demoDocument.innerHTML = `
                    <div style="display: flex; justify-content: space-between; align-items: center; margin-top: 30px; padding: 20px; background: var(--charcoal); border-radius: 10px;">
                        <p style="color: var(--light-gold);">
                            Showing page 1 of 1 (${demoUsers.length} total users - Demo Data)
                        </p>
                    </div>
                `;
            }

            showToast('Showing Demo Users Data (API unavailable)');
        } catch (fallbackError) {
            tbody.innerHTML = `<tr><td colspan="8" style="text-align: center; padding: 40px; color: #e74c3c;"><i class="fas fa-exclamation-circle" style="font-size: 32px;"></i><p style="margin-top: 15px;">${error.message}</p><button class="view-btn" onclick="loadUsersData()" style="margin-top: 10px;">Retry</button></td></tr>`;
        }
    }
}

function updateUsersPagination(pagination) {
    const paginationContainer = document.getElementById('usersPagination');
    if (!paginationContainer) return;

    const { page, pages, total } = pagination;

    let html = `
        <div style="display: flex; justify-content: space-between; align-items: center; margin-top: 30px; padding: 20px; background: var(--charcoal); border-radius: 10px;">
            <p style="color: var(--light-gold);">
                Showing page ${page} of ${pages} (${total} total users)
            </p>
            <div style="display: flex; gap: 10px;">
    `;

    // Previous button
    if (page > 1) {
        html += `<button class="view-btn" onclick="goToUsersPage(${page - 1})">
            <i class="fas fa-chevron-left"></i> Previous
        </button>`;
    }

    // Next button
    if (page < pages) {
        html += `<button class="view-btn" onclick="goToUsersPage(${page + 1})">
            Next <i class="fas fa-chevron-right"></i>
        </button>`;
    }

    html += `
            </div>
        </div>
    `;

    paginationContainer.innerHTML = html;
}

function goToUsersPage(page) {
    currentUsersPage = page;
    loadUsersData();
}



async function viewUser(userId) {
    try {
        // Show loading toast
        showToast('Loading user details...');

        // Fetch user details from API
        const response = await fetch(`${API_URL}/admin/users/${userId}`, {
            headers: {
                'Authorization': `Bearer ${getAuthToken()}`
            }
        });

        const result = await response.json();

        if (!result.success) {
            throw new Error(result.message || 'Failed to load user');
        }

        const user = result.user || result.data;
        displayUserDetailsModal(user);

    } catch (error) {
        console.error('Error loading user:', error);

        // Try to find user in the current displayed data (demo fallback)
        const demoUser = {
            _id: userId,
            name: 'User',
            email: 'user@example.com',
            phone: 'N/A',
            orderCount: 0,
            totalSpent: 0,
            createdAt: new Date().toISOString()
        };
        displayUserDetailsModal(demoUser);
    }
}

function displayUserDetailsModal(user) {
    // Remove any existing modal
    const existingModal = document.getElementById('userDetailsModal');
    if (existingModal) existingModal.remove();

    // Format date
    const joinedDate = new Date(user.createdAt).toLocaleDateString('en-IN', {
        year: 'numeric',
        month: 'long',
        day: 'numeric'
    });

    // Create modal HTML
    const modal = document.createElement('div');
    modal.id = 'userDetailsModal';
    modal.className = 'modal active';
    modal.innerHTML = `
        <div class="modal-content" style="max-width: 600px;">
            <div class="modal-header">
                <h3>User Details</h3>
                <button class="close-modal" onclick="closeUserModal()">
                    <i class="fas fa-times"></i>
                </button>
            </div>
            <div style="padding: 20px;">
                <!-- User Avatar & Name -->
                <div style="text-align: center; margin-bottom: 25px;">
                    <div style="width: 80px; height: 80px; border-radius: 50%; background: linear-gradient(135deg, var(--primary-gold), var(--light-gold)); display: flex; align-items: center; justify-content: center; margin: 0 auto 15px; font-size: 32px; color: var(--rich-black); font-weight: 700;">
                        ${user.name?.charAt(0)?.toUpperCase() || 'U'}
                    </div>
                    <h2 style="color: var(--cream); margin: 0 0 5px 0;">${user.name || 'Unknown'}</h2>
                    <p style="color: var(--light-gold); margin: 0;">User ID: #${user._id?.slice(-6)?.toUpperCase() || 'N/A'}</p>
                </div>
                
                <!-- User Info Cards -->
                <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 15px; margin-bottom: 20px;">
                    <div style="background: rgba(212, 175, 55, 0.1); padding: 15px; border-radius: 10px; border: 1px solid rgba(212, 175, 55, 0.2);">
                        <p style="color: var(--light-gold); font-size: 12px; margin: 0 0 5px 0;"><i class="fas fa-envelope"></i> Email</p>
                        <p style="color: var(--cream); margin: 0; font-weight: 600;">${user.email || 'N/A'}</p>
                    </div>
                    <div style="background: rgba(212, 175, 55, 0.1); padding: 15px; border-radius: 10px; border: 1px solid rgba(212, 175, 55, 0.2);">
                        <p style="color: var(--light-gold); font-size: 12px; margin: 0 0 5px 0;"><i class="fas fa-phone"></i> Phone</p>
                        <p style="color: var(--cream); margin: 0; font-weight: 600;">${user.phone || 'N/A'}</p>
                    </div>
                    <div style="background: rgba(212, 175, 55, 0.1); padding: 15px; border-radius: 10px; border: 1px solid rgba(212, 175, 55, 0.2);">
                        <p style="color: var(--light-gold); font-size: 12px; margin: 0 0 5px 0;"><i class="fas fa-shopping-bag"></i> Total Orders</p>
                        <p style="color: var(--primary-gold); margin: 0; font-weight: 700; font-size: 20px;">${user.orderCount || 0}</p>
                    </div>
                    <div style="background: rgba(212, 175, 55, 0.1); padding: 15px; border-radius: 10px; border: 1px solid rgba(212, 175, 55, 0.2);">
                        <p style="color: var(--light-gold); font-size: 12px; margin: 0 0 5px 0;"><i class="fas fa-rupee-sign"></i> Total Spent</p>
                        <p style="color: var(--vibrant-green); margin: 0; font-weight: 700; font-size: 20px;">₹${(user.totalSpent || 0).toLocaleString('en-IN')}</p>
                    </div>
                </div>
                
                <!-- Additional Info -->
                <div style="background: rgba(0, 0, 0, 0.2); padding: 15px; border-radius: 10px; margin-bottom: 20px;">
                    <div style="display: flex; justify-content: space-between; margin-bottom: 10px;">
                        <span style="color: var(--light-gold);"><i class="fas fa-calendar"></i> Member Since</span>
                        <span style="color: var(--cream);">${joinedDate}</span>
                    </div>
                    <div style="display: flex; justify-content: space-between;">
                        <span style="color: var(--light-gold);"><i class="fas fa-map-marker-alt"></i> Address</span>
                        <span style="color: var(--cream);">${user.address || 'Not provided'}</span>
                    </div>
                </div>
                
                <!-- Action Buttons -->
                <div style="display: flex; gap: 10px;">
                    <button onclick="viewUserOrders('${user._id}')" class="view-btn" style="flex: 1; padding: 12px;">
                        <i class="fas fa-shopping-bag"></i> View Orders
                    </button>
                    <button onclick="closeUserModal()" class="view-btn" style="flex: 1; padding: 12px; background: rgba(255, 255, 255, 0.1);">
                        <i class="fas fa-times"></i> Close
                    </button>
                </div>
            </div>
        </div>
    `;

    document.body.appendChild(modal);
}

function closeUserModal() {
    const modal = document.getElementById('userDetailsModal');
    if (modal) modal.remove();
}

function viewUserOrders(userId) {
    closeUserModal();
    // Navigate to orders page and filter by user
    showPage('orders');
    showToast(`Showing orders for user #${userId.slice(-6).toUpperCase()}`);
}

// ===== ANALYTICS PAGE =====
let revenueChart = null;
let orderStatusChart = null;

function setupAnalyticsPage() {
    const periodSelect = document.querySelector('.period-select');
    periodSelect?.addEventListener('change', (e) => {
        loadAnalyticsData(e.target.value);
    });
}

async function loadAnalyticsData(period = '30d') {
    // Map period selection to API parameter
    const periodMap = {
        'Last 7 days': '7d',
        'Last 30 days': '30d',
        'Last 3 months': '90d',
        'Last year': '365d'
    };

    const apiPeriod = periodMap[period] || '30d';

    try {
        const [analyticsResponse, statsResponse] = await Promise.all([
            fetch(`${API_URL}/admin/analytics?period=${apiPeriod}`, {
                headers: { 'Authorization': `Bearer ${getAuthToken()}` }
            }),
            fetch(`${API_URL}/admin/stats`, {
                headers: { 'Authorization': `Bearer ${getAuthToken()}` }
            })
        ]);

        const analyticsData = await analyticsResponse.json();
        const statsData = await statsResponse.json();

        if (analyticsData.success && statsData.success) {
            renderCharts(analyticsData.data, statsData.data.ordersByStatus);
        }
    } catch (error) {
        console.error('Error loading analytics:', error);
        showToast('Failed to load analytics data', 'error');
    }
}

function renderCharts(trendData, statusData) {
    // Destroy existing charts if they exist
    if (revenueChart) revenueChart.destroy();
    if (orderStatusChart) orderStatusChart.destroy();

    // 1. Revenue & Orders Trend Chart (Line + Bar)
    const ctx1 = document.getElementById('revenueChart').getContext('2d');
    revenueChart = new Chart(ctx1, {
        type: 'bar',
        data: {
            labels: trendData.map(d => {
                const date = new Date(d.date);
                return `${date.getDate()} ${date.toLocaleString('default', { month: 'short' })}`;
            }),
            datasets: [
                {
                    label: 'Revenue (₹)',
                    data: trendData.map(d => d.revenue),
                    backgroundColor: 'rgba(212, 175, 55, 0.2)', // Gold
                    borderColor: 'rgba(212, 175, 55, 1)',
                    borderWidth: 2,
                    yAxisID: 'y'
                },
                {
                    label: 'Orders',
                    data: trendData.map(d => d.orders),
                    type: 'line',
                    borderColor: '#2ecc71', // Green
                    backgroundColor: '#2ecc71',
                    pointRadius: 4,
                    yAxisID: 'y1'
                }
            ]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            interaction: {
                mode: 'index',
                intersect: false,
            },
            plugins: {
                legend: {
                    labels: { color: '#F4E4C1' } // Cream color text
                }
            },
            scales: {
                x: {
                    ticks: { color: '#F4E4C1' },
                    grid: { color: 'rgba(255, 255, 255, 0.1)' }
                },
                y: {
                    type: 'linear',
                    display: true,
                    position: 'left',
                    ticks: { color: '#D4AF37' }, // Gold text
                    grid: { color: 'rgba(255, 255, 255, 0.1)' },
                    title: { display: true, text: 'Revenue (₹)', color: '#D4AF37' }
                },
                y1: {
                    type: 'linear',
                    display: true,
                    position: 'right',
                    grid: { drawOnChartArea: false },
                    ticks: { color: '#2ecc71' }, // Green text
                    title: { display: true, text: 'Orders', color: '#2ecc71' }
                }
            }
        }
    });

    // 2. Order Status Chart (Doughnut)
    const ctx2 = document.getElementById('orderStatusChart').getContext('2d');

    // Status Colors Mapping
    const statusColors = {
        'pending': '#f1c40f',    // Yellow
        'confirmed': '#3498db',  // Blue
        'preparing': '#e67e22',  // Orange
        'out_for_delivery': '#9b59b6', // Purple
        'delivered': '#2ecc71',  // Green
        'cancelled': '#e74c3c'   // Red
    };

    const statusLabels = statusData.map(s => s._id.replace(/_/g, ' ').toUpperCase());
    const statusValues = statusData.map(s => s.count);
    const backgroundColors = statusData.map(s => statusColors[s._id] || '#95a5a6');

    orderStatusChart = new Chart(ctx2, {
        type: 'doughnut',
        data: {
            labels: statusLabels,
            datasets: [{
                data: statusValues,
                backgroundColor: backgroundColors,
                borderWidth: 0
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            plugins: {
                legend: {
                    position: 'bottom',
                    labels: { color: '#F4E4C1', padding: 20 }
                }
            }
        }
    });
}

// ===== TOAST NOTIFICATION =====
function showToast(message, type = 'success') {
    const toast = document.getElementById('adminToast');
    const toastMessage = document.getElementById('adminToastMessage');
    const toastIcon = toast.querySelector('i');

    if (!toast || !toastMessage) return;

    toastMessage.textContent = message;

    // Update icon and border color based on type
    if (type === 'error') {
        toast.style.borderColor = 'var(--vibrant-red)';
        toastIcon.style.color = 'var(--vibrant-red)';
        toastIcon.className = 'fas fa-exclamation-circle';
    } else {
        toast.style.borderColor = 'var(--vibrant-green)';
        toastIcon.style.color = 'var(--vibrant-green)';
        toastIcon.className = 'fas fa-check-circle';
    }

    toast.classList.add('active');

    setTimeout(() => {
        toast.classList.remove('active');
    }, 3000);
}

// ===== UTILITY FUNCTIONS =====
function getAuthToken() {
    return localStorage.getItem('authToken');
}

// Make functions globally accessible
window.editMenuItem = editMenuItem;
window.deleteMenuItem = deleteMenuItem;
window.viewOrder = viewOrder;
window.viewUser = viewUser;
window.goToOrdersPage = goToOrdersPage;
window.filterOrdersByStatus = filterOrdersByStatus;
window.goToUsersPage = goToUsersPage;
window.updateOrderStatus = updateOrderStatus;
window.handleGlobalSearch = handleGlobalSearch;
window.closeUserModal = closeUserModal;
window.viewUserOrders = viewUserOrders;

async function updateOrderStatus(orderId, newStatus) {
    try {
        // Update order status in MongoDB via API
        const response = await fetch(`${API_URL}/order/${orderId}/status`, {
            method: 'PUT',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${getAuthToken()}`
            },
            body: JSON.stringify({ orderStatus: newStatus })
        });
        const result = await response.json();
        if (result.success) {
            // Format status name for display
            const statusDisplay = newStatus.split('_').map(word =>
                word.charAt(0).toUpperCase() + word.slice(1)
            ).join(' ');
            showToast(`✅ Order status updated to: ${statusDisplay}`, 'success');
            loadOrdersData(); // Reload to refresh view
            return;
        } else {
            throw new Error(result.message || 'Failed to update status');
        }
    } catch (error) {
        console.error('Error updating order status:', error);
        showToast('❌ Failed to update order status. Please check your connection.', 'error');
    }
}

// ===== REAL DATA DISPLAY HELPERS =====
function displayTopItems(items) {
    const container = document.getElementById('topItemsList');
    if (!container) return;

    container.innerHTML = items.map((item, index) => `
        <div class="top-item">
            <div class="top-item-rank">${index + 1}</div>
            <div class="top-item-info">
                <div class="top-item-name">${item.name}</div>
                <div class="top-item-count">${item.totalQuantity} orders</div>
            </div>
            <div class="top-item-revenue">₹${item.totalRevenue.toLocaleString('en-IN')}</div>
        </div>
    `).join('');
}

function displayRecentOrders(orders) {
    const tbody = document.getElementById('recentOrdersBody');
    if (!tbody) return;

    if (!orders || orders.length === 0) {
        tbody.innerHTML = '<tr><td colspan="7" style="text-align: center; padding: 20px; color: var(--light-gold);">No orders yet</td></tr>';
        return;
    }

    tbody.innerHTML = orders.map(order => {
        const date = new Date(order.createdAt).toLocaleDateString('en-IN');
        const customerName = order.user?.name || 'Guest';
        const itemNames = order.items?.map(item => item.food?.name || 'Item').join(', ') || 'N/A';

        return `
            <tr>
                <td><strong>#${order._id.slice(-6).toUpperCase()}</strong></td>
                <td>${customerName}</td>
                <td>${itemNames}</td>
                <td><strong>₹${order.totalAmount}</strong></td>
                <td><span class="status-badge status-${order.orderStatus}">${order.orderStatus}</span></td>
                <td>${date}</td>
                <td><button class="action-btn" onclick="viewOrder('${order._id}')">View</button></td>
            </tr>
        `;
    }).join('');
}

// ===== SETTINGS MANAGEMENT =====
let currentSettings = null;

async function loadSettingsData() {
    try {
        const response = await fetch(`${API_URL}/settings`);
        const result = await response.json();

        if (result.success && result.settings) {
            currentSettings = result.settings;
            populateSettingsForm(result.settings);
        }
    } catch (error) {
        console.error('Error loading settings:', error);
        showToast('Failed to load settings. Using default values.', 'error');
    }

    // Setup event listeners
    setupSettingsEventListeners();
}

function populateSettingsForm(settings) {
    // Restaurant Information
    document.getElementById('settingRestaurantName').value = settings.restaurantName || 'Curry Crave';
    document.getElementById('settingTagline').value = settings.tagline || 'Premium Food Delivery';

    // Contact Information
    document.getElementById('settingEmail').value = settings.email || 'info@currycrave.com';
    document.getElementById('settingSupportEmail').value = settings.supportEmail || 'support@currycrave.com';
    document.getElementById('settingPhone').value = settings.phone || '+91 98765 43210';
    document.getElementById('settingAlternatePhone').value = settings.alternatePhone || '+91 87654 32109';
    document.getElementById('settingWhatsapp').value = settings.whatsappNumber || '+919876543210';

    // Address
    if (settings.address) {
        document.getElementById('settingStreet').value = settings.address.street || '123 Food Street, Culinary District';
        document.getElementById('settingCity').value = settings.address.city || 'Hyderabad';
        document.getElementById('settingState').value = settings.address.state || 'Telangana';
        document.getElementById('settingPincode').value = settings.address.pincode || '500001';
    }

    // Business Hours
    if (settings.businessHours) {
        document.getElementById('settingWeekdayHours').value = settings.businessHours.weekday || 'Mon - Sat: 10:00 AM - 11:00 PM';
        document.getElementById('settingWeekendHours').value = settings.businessHours.weekend || 'Sunday: 11:00 AM - 10:00 PM';
    }

    // Social Media
    if (settings.socialMedia) {
        document.getElementById('settingFacebook').value = settings.socialMedia.facebook || '';
        document.getElementById('settingInstagram').value = settings.socialMedia.instagram || '';
        document.getElementById('settingTwitter').value = settings.socialMedia.twitter || '';
        document.getElementById('settingYoutube').value = settings.socialMedia.youtube || '';
    }

    // Notification Settings
    if (settings.notifications) {
        document.getElementById('settingEmailNotif').checked = settings.notifications.emailNotifications !== false;
        document.getElementById('settingOrderAlerts').checked = settings.notifications.newOrderAlerts !== false;
        document.getElementById('settingStockWarnings').checked = settings.notifications.lowStockWarnings === true;
    }

    // About Section
    if (settings.aboutSection) {
        document.getElementById('settingAboutImage').value = settings.aboutSection.image || 'assets/images/about-chef.jpg';
        document.getElementById('settingExperienceYears').value = settings.aboutSection.experienceYears || '10+';
        document.getElementById('settingExperienceText').value = settings.aboutSection.experienceText || 'Years Experience';
        document.getElementById('settingAboutParagraph1').value = settings.aboutSection.paragraph1 || '';
        document.getElementById('settingAboutParagraph2').value = settings.aboutSection.paragraph2 || '';

        if (settings.aboutSection.features) {
            document.getElementById('settingFeature1').value = settings.aboutSection.features.feature1 || 'Fresh Ingredients';
            document.getElementById('settingFeature2').value = settings.aboutSection.features.feature2 || 'Expert Chefs';
            document.getElementById('settingFeature3').value = settings.aboutSection.features.feature3 || 'Fast Delivery';
            document.getElementById('settingFeature4').value = settings.aboutSection.features.feature4 || 'Premium Quality';
        }
    }
}

function setupSettingsEventListeners() {
    // Save All Settings Button
    const saveBtn = document.getElementById('saveAllSettingsBtn');
    if (saveBtn) {
        saveBtn.onclick = saveAllSettings;
    }

    // Reset Settings Button
    const resetBtn = document.getElementById('resetSettingsBtn');
    if (resetBtn) {
        resetBtn.onclick = resetSettings;
    }
}

async function saveAllSettings() {
    const saveBtn = document.getElementById('saveAllSettingsBtn');
    const originalContent = saveBtn.innerHTML;

    try {
        saveBtn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Saving...';
        saveBtn.disabled = true;

        const settingsData = {
            restaurantName: document.getElementById('settingRestaurantName').value,
            tagline: document.getElementById('settingTagline').value,
            email: document.getElementById('settingEmail').value,
            supportEmail: document.getElementById('settingSupportEmail').value,
            phone: document.getElementById('settingPhone').value,
            alternatePhone: document.getElementById('settingAlternatePhone').value,
            whatsappNumber: document.getElementById('settingWhatsapp').value,
            address: {
                street: document.getElementById('settingStreet').value,
                city: document.getElementById('settingCity').value,
                state: document.getElementById('settingState').value,
                pincode: document.getElementById('settingPincode').value
            },
            businessHours: {
                weekday: document.getElementById('settingWeekdayHours').value,
                weekend: document.getElementById('settingWeekendHours').value
            },
            socialMedia: {
                facebook: document.getElementById('settingFacebook').value,
                instagram: document.getElementById('settingInstagram').value,
                twitter: document.getElementById('settingTwitter').value,
                youtube: document.getElementById('settingYoutube').value
            },
            notifications: {
                emailNotifications: document.getElementById('settingEmailNotif').checked,
                newOrderAlerts: document.getElementById('settingOrderAlerts').checked,
                lowStockWarnings: document.getElementById('settingStockWarnings').checked
            },
            aboutSection: {
                image: document.getElementById('settingAboutImage').value,
                experienceYears: document.getElementById('settingExperienceYears').value,
                experienceText: document.getElementById('settingExperienceText').value,
                paragraph1: document.getElementById('settingAboutParagraph1').value,
                paragraph2: document.getElementById('settingAboutParagraph2').value,
                features: {
                    feature1: document.getElementById('settingFeature1').value,
                    feature2: document.getElementById('settingFeature2').value,
                    feature3: document.getElementById('settingFeature3').value,
                    feature4: document.getElementById('settingFeature4').value
                }
            }
        };

        const response = await fetch(`${API_URL}/settings`, {
            method: 'PUT',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${getAuthToken()}`
            },
            body: JSON.stringify(settingsData)
        });

        const result = await response.json();

        if (result.success) {
            currentSettings = result.settings;
            showToast('✅ Settings saved successfully!');
        } else {
            throw new Error(result.message || 'Failed to save settings');
        }
    } catch (error) {
        console.error('Error saving settings:', error);
        showToast('❌ Failed to save settings. Please try again.', 'error');
    } finally {
        saveBtn.innerHTML = originalContent;
        saveBtn.disabled = false;
    }
}

async function resetSettings() {
    if (!confirm('Are you sure you want to reset all settings to default values? This action cannot be undone.')) {
        return;
    }

    try {
        const response = await fetch(`${API_URL}/settings/reset`, {
            method: 'POST',
            headers: {
                'Authorization': `Bearer ${getAuthToken()}`
            }
        });

        const result = await response.json();

        if (result.success) {
            currentSettings = result.settings;
            populateSettingsForm(result.settings);
            showToast('✅ Settings reset to defaults successfully!');
        } else {
            throw new Error(result.message || 'Failed to reset settings');
        }
    } catch (error) {
        console.error('Error resetting settings:', error);
        showToast('❌ Failed to reset settings. Please try again.', 'error');
    }
}
