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
    } else if (token && user) {
        // User is logged in but not an admin
        showToast('Access Denied: Admin privileges required', 'error');
        setTimeout(() => {
            window.location.href = 'index.html';
        }, 2000);
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
        showToast('Connection error. Please try again.', 'error');
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
    loadDashboardData();
    setupMenuManagement();
    setupOrdersPage();
    setupUsersPage();
    setupAnalyticsPage();
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
    }
}

// ===== SIDEBAR =====
function setupSidebar() {
    const sidebarToggle = document.getElementById('sidebarToggle');
    const mobileMenuToggle = document.getElementById('mobileMenuToggle');
    const sidebar = document.getElementById('sidebar');

    sidebarToggle?.addEventListener('click', function () {
        sidebar.classList.toggle('collapsed');
    });

    mobileMenuToggle?.addEventListener('click', function () {
        sidebar.classList.toggle('active');
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
        }

        // Fetch top items
        await loadTopItems();

    } catch (error) {
        console.error('Error loading dashboard data:', error);
        showToast('Failed to load dashboard data', 'error');
    }
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
    const topItems = [
        { rank: 1, name: 'Butter Chicken Curry', count: '234 orders', revenue: '₹69,666' },
        { rank: 2, name: 'Biryani Bowl', count: '198 orders', revenue: '₹69,102' },
        { rank: 3, name: 'Garlic Naan', count: '456 orders', revenue: '₹22,344' },
        { rank: 4, name: 'Paneer Tikka Masala', count: '167 orders', revenue: '₹41,583' },
        { rank: 5, name: 'Gulab Jamun', count: '189 orders', revenue: '₹16,821' }
    ];

    const container = document.getElementById('topItemsList');
    if (!container) return;

    container.innerHTML = topItems.map(item => `
        <div class="top-item">
            <div class="top-item-rank">${item.rank}</div>
            <div class="top-item-info">
                <div class="top-item-name">${item.name}</div>
                <div class="top-item-count">${item.count}</div>
            </div>
            <div class="top-item-revenue">${item.revenue}</div>
        </div>
    `).join('');
}

function loadRecentOrders() {
    const orders = [
        { id: 'CC1001', customer: 'Rahul Kumar', items: 'Butter Chicken, Naan', amount: '₹348', status: 'confirmed', date: '2025-12-12' },
        { id: 'CC1002', customer: 'Priya Sharma', items: 'Biryani Bowl', amount: '₹349', status: 'preparing', date: '2025-12-12' },
        { id: 'CC1003', customer: 'Amit Patel', items: 'Paneer Tikka, Rice', amount: '₹448', status: 'pending', date: '2025-12-12' },
        { id: 'CC1004', customer: 'Neha Singh', items: 'Dal Makhani, Garlic Naan', amount: '₹248', status: 'delivered', date: '2025-12-11' },
        { id: 'CC1005', customer: 'Vikas Gupta', items: 'Veg Pulao, Raita', amount: '₹219', status: 'cancelled', date: '2025-12-11' }
    ];

    const tbody = document.getElementById('recentOrdersBody');
    if (!tbody) return;

    tbody.innerHTML = orders.map(order => `
        <tr>
            <td><strong>${order.id}</strong></td>
            <td>${order.customer}</td>
            <td>${order.items}</td>
            <td><strong>${order.amount}</strong></td>
            <td><span class="status-badge status-${order.orderStatus}">${order.orderStatus}</span></td>
            <td>${order.date}</td>
            <td><button class="action-btn" onclick="viewOrder('${order.id}')">View</button></td>
        </tr>
    `).join('');
}

// ===== ORDERS PAGE =====
function setupOrdersPage() {
    // Filter functionality can be added here
}

// Orders page state
let currentOrdersPage = 1;
let currentOrdersStatus = 'all';
const ordersPerPage = 20;

async function loadOrdersData() {
    const container = document.getElementById('ordersGrid');
    if (!container) return;

    try {
        // Show loading state
        container.innerHTML = '<div style="grid-column: 1 / -1; text-align: center; padding: 40px; color: var(--light-gold);"><i class="fas fa-spinner fa-spin" style="font-size: 32px;"></i><p style="margin-top: 15px;">Loading orders...</p></div>';

        // Fetch orders from API
        const response = await fetch(`${API_URL}/admin/orders?page=${currentOrdersPage}&limit=${ordersPerPage}&status=${currentOrdersStatus}`, {
            headers: {
                'Authorization': `Bearer ${getAuthToken()}`
            }
        });

        const result = await response.json();

        if (!result.success) {
            throw new Error(result.message || 'Failed to load orders');
        }

        const orders = result.data;
        const pagination = result.pagination;

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

            // Get customer name
            const customerName = order.user?.name || 'Unknown Customer';

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

        // Update pagination info and controls
        updateOrdersPagination(pagination);

    } catch (error) {
        console.error('Error loading orders:', error);
        container.innerHTML = `
            <div style="grid-column: 1 / -1; text-align: center; padding: 60px;">
                <i class="fas fa-exclamation-circle" style="font-size: 64px; color: #e74c3c;"></i>
                <h3 style="color: var(--cream); margin-top: 20px;">Failed to load orders</h3>
                <p style="color: var(--light-gold); margin-top: 10px;">${error.message}</p>
                <button class="view-btn" onclick="loadOrdersData()" style="margin-top: 20px;">
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

function generateSampleOrders(count) {
    const customers = ['Rahul Kumar', 'Priya Sharma', 'Amit Patel', 'Neha Singh', 'Vikas Gupta', 'Anjali Reddy', 'Rohit Verma', 'Sneha Jain'];
    const items = ['Butter Chicken, Naan', 'Biryani Bowl', 'Paneer Tikka, Rice', 'Dal Makhani, Garlic Naan', 'Veg Pulao, Raita'];
    const statuses = ['pending', 'confirmed', 'preparing', 'delivered', 'cancelled'];

    return Array.from({ length: count }, (_, i) => ({
        id: `CC${1001 + i}`,
        customer: customers[Math.floor(Math.random() * customers.length)],
        items: items[Math.floor(Math.random() * items.length)],
        amount: `₹${Math.floor(Math.random() * 400) + 150}`,
        orderStatus: statuses[Math.floor(Math.random() * statuses.length)],
        date: new Date(2025, 11, Math.floor(Math.random() * 12) + 1).toISOString().split('T')[0]
    }));
}

function viewOrder(orderId) {
    showToast(`Viewing order ${orderId}`);
    // Add order details modal here
}

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
        container.innerHTML = `<div style="grid-column: 1 / -1; text-align: center; padding: 40px; color: var(--vibrant-red);">Error: ${error.message}</div>`;
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
            document.getElementById('itemAvailability').checked = item.isAvailable !== false;
        }
    } else {
        editingItemId = null;
        modalTitle.textContent = 'Add New Menu Item';
        document.getElementById('itemAvailability').checked = true;
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
        category: document.getElementById('itemCategory').value,
        price: parseInt(document.getElementById('itemPrice').value),
        description: document.getElementById('itemDescription').value,
        image: document.getElementById('itemImage').value || 'assets/images/placeholder.jpg',
        badge: document.getElementById('itemBadge').value || null,
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
        const pagination = result.pagination;

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

        // Update pagination info and controls
        updateUsersPagination(pagination);

    } catch (error) {
        console.error('Error loading users:', error);
        tbody.innerHTML = `<tr><td colspan="8" style="text-align: center; padding: 40px; color: #e74c3c;"><i class="fas fa-exclamation-circle" style="font-size: 32px;"></i><p style="margin-top: 15px;">${error.message}</p><button class="view-btn" onclick="loadUsersData()" style="margin-top: 10px;">Retry</button></td></tr>`;
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



function viewUser(userId) {
    showToast(`Viewing user ${userId}`);
    // Add user details modal here
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
