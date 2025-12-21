/*
 * Curry Crave - Admin Dashboard JavaScript
 * Handles all admin panel functionality
 */

// ===== INITIALIZATION =====
document.addEventListener('DOMContentLoaded', function() {
    checkAdminAuth();
    initializeAdminDashboard();
});

// ===== AUTHENTICATION =====
function checkAdminAuth() {
    const isAdminLoggedIn = localStorage.getItem('adminLoggedIn') === 'true';
    
    if (isAdminLoggedIn) {
        showDashboard();
    } else {
        showLoginModal();
    }
}

function showLoginModal() {
    document.getElementById('adminLoginModal').style.display = 'flex';
    document.getElementById('adminDashboard').style.display = 'none';
}

function showDashboard() {
    document.getElementById('adminLoginModal').style.display = 'none';
    document.getElementById('adminDashboard').style.display = 'flex';
}

// ===== LOGIN FORM =====
const adminLoginForm = document.getElementById('adminLoginForm');
adminLoginForm?.addEventListener('submit', function(e) {
    e.preventDefault();
    
    const username = document.getElementById('adminUsername').value;
    const password = document.getElementById('adminPassword').value;
    
    // Demo authentication
    if (username === 'admin' && password === 'admin123') {
        localStorage.setItem('adminLoggedIn', 'true');
        localStorage.setItem('adminUsername', username);
        showDashboard();
        showToast('Welcome to Admin Dashboard!');
        loadDashboardData();
    } else {
        showToast('Invalid credentials! Use admin/admin123', 'error');
    }
});

// Toggle password visibility
document.getElementById('toggleAdminPassword')?.addEventListener('click', function() {
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
}

// ===== NAVIGATION =====
function setupNavigation() {
    const navItems = document.querySelectorAll('.nav-item');
    
    navItems.forEach(item => {
        item.addEventListener('click', function(e) {
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
    switch(pageName) {
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
    }
}

// ===== SIDEBAR =====
function setupSidebar() {
    const sidebarToggle = document.getElementById('sidebarToggle');
    const mobileMenuToggle = document.getElementById('mobileMenuToggle');
    const sidebar = document.getElementById('sidebar');
    
    sidebarToggle?.addEventListener('click', function() {
        sidebar.classList.toggle('collapsed');
    });
    
    mobileMenuToggle?.addEventListener('click', function() {
        sidebar.classList.toggle('active');
    });
}

// ===== LOGOUT =====
document.getElementById('logoutBtn')?.addEventListener('click', function() {
    if (confirm('Are you sure you want to logout?')) {
        localStorage.removeItem('adminLoggedIn');
        localStorage.removeItem('adminUsername');
        showLoginModal();
        showToast('Logged out successfully!');
    }
});

// ===== DASHBOARD DATA =====
function loadDashboardData() {
    loadTopItems();
    loadRecentOrders();
}

function loadTopItems() {
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
            <td><span class="status-badge status-${order.status}">${order.status}</span></td>
            <td>${order.date}</td>
            <td><button class="action-btn" onclick="viewOrder('${order.id}')">View</button></td>
        </tr>
    `).join('');
}

// ===== ORDERS PAGE =====
function setupOrdersPage() {
    // Filter functionality can be added here
}

function loadOrdersData() {
    const orders = generateSampleOrders(15);
    const container = document.getElementById('ordersGrid');
    if (!container) return;
    
    container.innerHTML = orders.map(order => `
        <div class="order-card">
            <div class="order-card-content">
                <div style="display: flex; justify-content: space-between; margin-bottom: 15px;">
                    <div>
                        <strong style="color: var(--primary-gold); font-size: 16px;">${order.id}</strong>
                        <p style="color: var(--light-gold); font-size: 13px; margin-top: 3px;">${order.date}</p>
                    </div>
                    <span class="status-badge status-${order.status}">${order.status}</span>
                </div>
                <div style="margin-bottom: 12px;">
                    <p style="color: var(--cream); font-weight: 600; margin-bottom: 5px;">${order.customer}</p>
                    <p style="color: var(--light-gold); font-size: 14px;">${order.items}</p>
                </div>
                <div style="display: flex; justify-content: space-between; align-items: center; padding-top: 15px; border-top: 1px solid var(--charcoal);">
                    <strong style="color: var(--vibrant-green); font-size: 18px;">${order.amount}</strong>
                    <button class="view-btn" onclick="viewOrder('${order.id}')">View Details</button>
                </div>
            </div>
        </div>
    `).join('');
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
        status: statuses[Math.floor(Math.random() * statuses.length)],
        date: new Date(2025, 11, Math.floor(Math.random() * 12) + 1).toISOString().split('T')[0]
    }));
}

function viewOrder(orderId) {
    showToast(`Viewing order ${orderId}`);
    // Add order details modal here
}

// ===== MENU MANAGEMENT =====
let menuItems = [
    { id: 1, name: 'Butter Chicken Curry', category: 'curry', price: 299, description: 'Rich and creamy tomato-based curry with tender chicken pieces', image: 'assets/images/butter-chicken.jpg', badge: 'Popular' },
    { id: 2, name: 'Paneer Tikka Masala', category: 'curry', price: 249, description: 'Grilled cottage cheese in aromatic spiced gravy', image: 'assets/images/paneer-tikka.jpg', badge: 'Veg' },
    { id: 3, name: 'Garlic Naan', category: 'bread', price: 49, description: 'Freshly baked soft bread topped with garlic and butter', image: 'assets/images/garlic-naan.jpg', badge: 'Bestseller' },
    { id: 4, name: 'Butter Naan', category: 'bread', price: 39, description: 'Classic Indian flatbread brushed with butter', image: 'assets/images/butter-naan.jpg', badge: null },
    { id: 5, name: 'Biryani Bowl', category: 'rice', price: 349, description: 'Fragrant basmati rice cooked with aromatic spices and meat', image: 'assets/images/biryani.jpg', badge: 'Chef Special' },
    { id: 6, name: 'Veg Pulao', category: 'rice', price: 199, description: 'Mixed vegetable rice with mild spices and herbs', image: 'assets/images/veg-pulao.jpg', badge: 'Veg' },
    { id: 7, name: 'Mango Lassi', category: 'drinks', price: 79, description: 'Refreshing yogurt drink blended with sweet mango', image: 'assets/images/mango-lassi.jpg', badge: null },
    { id: 8, name: 'Masala Chai', category: 'drinks', price: 39, description: 'Traditional Indian spiced tea with aromatic flavors', image: 'assets/images/masala-chai.jpg', badge: null },
    { id: 9, name: 'Gulab Jamun', category: 'desserts', price: 89, description: 'Sweet milk dumplings soaked in rose-flavored syrup', image: 'assets/images/gulab-jamun.jpg', badge: 'Sweet' },
    { id: 10, name: 'Rasmalai', category: 'desserts', price: 99, description: 'Soft paneer balls in creamy sweetened milk', image: 'assets/images/rasmalai.jpg', badge: 'Sweet' },
    { id: 11, name: 'Chicken Tikka Curry', category: 'curry', price: 279, description: 'Marinated grilled chicken in spicy tomato gravy', image: 'assets/images/chicken-tikka-curry.jpg', badge: 'Spicy' },
    { id: 12, name: 'Dal Makhani', category: 'curry', price: 199, description: 'Creamy black lentils slow-cooked with butter and cream', image: 'assets/images/dal-makhani.jpg', badge: 'Veg' }
];

function setupMenuManagement() {
    const addBtn = document.getElementById('addMenuItemBtn');
    const closeBtn = document.getElementById('closeMenuModal');
    const cancelBtn = document.getElementById('cancelMenuBtn');
    const menuForm = document.getElementById('menuItemForm');
    
    addBtn?.addEventListener('click', () => openMenuModal());
    closeBtn?.addEventListener('click', () => closeMenuModal());
    cancelBtn?.addEventListener('click', () => closeMenuModal());
    
    menuForm?.addEventListener('submit', function(e) {
        e.preventDefault();
        saveMenuItem();
    });
}

function loadMenuData() {
    const container = document.getElementById('menuGrid');
    if (!container) return;
    
    container.innerHTML = menuItems.map(item => `
        <div class="menu-item-card">
            <img src="${item.image}" alt="${item.name}" class="menu-item-image" onerror="this.src='assets/images/placeholder.jpg'">
            <div class="menu-item-content">
                <div class="menu-item-header">
                    <h4 class="menu-item-name">${item.name}</h4>
                    <span class="menu-item-price">₹${item.price}</span>
                </div>
                ${item.badge ? `<span class="status-badge status-confirmed" style="display: inline-block; margin-bottom: 10px;">${item.badge}</span>` : ''}
                <p class="menu-item-description">${item.description}</p>
                <div style="margin-bottom: 10px;">
                    <span class="status-badge status-pending">${item.category}</span>
                </div>
                <div class="menu-item-actions">
                    <button class="edit-btn" onclick="editMenuItem(${item.id})">
                        <i class="fas fa-edit"></i> Edit
                    </button>
                    <button class="delete-btn" onclick="deleteMenuItem(${item.id})">
                        <i class="fas fa-trash"></i> Delete
                    </button>
                </div>
            </div>
        </div>
    `).join('');
}

let editingItemId = null;

function openMenuModal(itemId = null) {
    const modal = document.getElementById('menuItemModal');
    const modalTitle = document.getElementById('modalTitle');
    
    if (itemId) {
        editingItemId = itemId;
        const item = menuItems.find(i => i.id === itemId);
        if (item) {
            modalTitle.textContent = 'Edit Menu Item';
            document.getElementById('itemName').value = item.name;
            document.getElementById('itemCategory').value = item.category;
            document.getElementById('itemPrice').value = item.price;
            document.getElementById('itemDescription').value = item.description;
            document.getElementById('itemImage').value = item.image;
            document.getElementById('itemBadge').value = item.badge || '';
        }
    } else {
        editingItemId = null;
        modalTitle.textContent = 'Add New Menu Item';
        document.getElementById('menuItemForm').reset();
    }
    
    modal.classList.add('active');
}

function closeMenuModal() {
    const modal = document.getElementById('menuItemModal');
    modal.classList.remove('active');
    editingItemId = null;
    document.getElementById('menuItemForm').reset();
}

function saveMenuItem() {
    const itemData = {
        name: document.getElementById('itemName').value,
        category: document.getElementById('itemCategory').value,
        price: parseInt(document.getElementById('itemPrice').value),
        description: document.getElementById('itemDescription').value,
        image: document.getElementById('itemImage').value || 'assets/images/placeholder.jpg',
        badge: document.getElementById('itemBadge').value || null
    };
    
    if (editingItemId) {
        // Update existing item
        const index = menuItems.findIndex(i => i.id === editingItemId);
        if (index !== -1) {
            menuItems[index] = { ...menuItems[index], ...itemData };
            showToast('Menu item updated successfully!');
        }
    } else {
        // Add new item
        const newItem = {
            id: menuItems.length + 1,
            ...itemData
        };
        menuItems.push(newItem);
        showToast('Menu item added successfully!');
    }
    
    closeMenuModal();
    loadMenuData();
}

function editMenuItem(id) {
    openMenuModal(id);
}

function deleteMenuItem(id) {
    if (confirm('Are you sure you want to delete this menu item?')) {
        menuItems = menuItems.filter(item => item.id !== id);
        loadMenuData();
        showToast('Menu item deleted successfully!', 'success');
    }
}

// ===== USERS PAGE =====
function setupUsersPage() {
    // User management functionality
}

function loadUsersData() {
    const users = generateSampleUsers(20);
    const tbody = document.getElementById('usersTableBody');
    if (!tbody) return;
    
    tbody.innerHTML = users.map(user => `
        <tr>
           <td><strong>${user.id}</strong></td>
            <td>${user.name}</td>
            <td>${user.email}</td>
            <td>${user.phone}</td>
            <td>${user.orders}</td>
            <td><strong style="color: var(--vibrant-green);">₹${user.spent}</strong></td>
            <td>${user.joined}</td>
            <td><button class="action-btn" onclick="viewUser('${user.id}')">View</button></td>
        </tr>
    `).join('');
}

function generateSampleUsers(count) {
    const names = ['Rahul Kumar', 'Priya Sharma', 'Amit Patel', 'Neha Singh', 'Vikas Gupta', 'Anjali Reddy', 'Rohit Verma', 'Sneha Jain', 'Karan Mehta', 'Pooja Desai'];
    
    return Array.from({ length: count }, (_, i) => ({
        id: `U${1001 + i}`,
        name: names[i % names.length],
        email: `${names[i % names.length].toLowerCase().replace(' ', '.')}@email.com`,
        phone: `+91 ${Math.floor(Math.random() * 9000000000) + 1000000000}`,
        orders: Math.floor(Math.random() * 50) + 1,
        spent: (Math.floor(Math.random() * 10000) + 500).toLocaleString('en-IN'),
        joined: new Date(2024, Math.floor(Math.random() * 12), Math.floor(Math.random() * 28) + 1).toISOString().split('T')[0]
    }));
}

function viewUser(userId) {
    showToast(`Viewing user ${userId}`);
    // Add user details modal here
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

// Make functions globally accessible
window.editMenuItem = editMenuItem;
window.deleteMenuItem = deleteMenuItem;
window.viewOrder = viewOrder;
window.viewUser = viewUser;
