/*
 * Curry Crave - Main JavaScript
 * Handles navigation, modals, animations, and general functionality
 */

// ===== INITIALIZATION =====
document.addEventListener('DOMContentLoaded', function() {
    initializeApp();
});

function initializeApp() {
    setupNavigation();
    setupModals();
    setupHeroSearch();
    setupMenuFilters();
    loadMenuItems();
    loadSpecialItems();
    setupContactForm();
    setupScrollEffects();
    setupWhatsApp();
}

// ===== NAVIGATION =====
function setupNavigation() {
    const navbar = document.getElementById('navbar');
    const mobileMenuToggle = document.getElementById('mobileMenuToggle');
    const mobileNav = document.getElementById('mobileNav');
    const navLinks = document.querySelectorAll('.nav-link, .mobile-nav-link');
    
    // Navbar scroll effect
    window.addEventListener('scroll', function() {
        if (window.scrollY > 100) {
            navbar.classList.add('scrolled');
        } else {
            navbar.classList.remove('scrolled');
        }
    });
    
    // Mobile menu toggle
    mobileMenuToggle?.addEventListener('click', function() {
        this.classList.toggle('active');
        mobileNav.classList.toggle('active');
    });
    
    // Navigation link active state
    navLinks.forEach(link => {
        link.addEventListener('click', function(e) {
            const href = this.getAttribute('href');
            
            if (href.startsWith('#')) {
                e.preventDefault();
                const targetId = href.substring(1);
                const targetElement = document.getElementById(targetId);
                
                if (targetElement) {
                    const offsetTop = targetElement.offsetTop - 80;
                    window.scrollTo({
                        top: offsetTop,
                        behavior: 'smooth'
                    });
                }
                
                // Update active state
                navLinks.forEach(l => l.classList.remove('active'));
                this.classList.add('active');
                
                // Close mobile menu
                mobileMenuToggle?.classList.remove('active');
                mobileNav.classList.remove('active');
            }
        });
    });
    
    // Update active link on scroll
    window.addEventListener('scroll', updateActiveNavLink);
}

function updateActiveNavLink() {
    const sections = document.querySelectorAll('section[id]');
    const scrollPosition = window.scrollY + 150;
    
    sections.forEach(section => {
        const sectionTop = section.offsetTop;
        const sectionHeight = section.clientHeight;
        const sectionId = section.getAttribute('id');
        
        if (scrollPosition >= sectionTop && scrollPosition < sectionTop + sectionHeight) {
            document.querySelectorAll('.nav-link, .mobile-nav-link').forEach(link => {
                link.classList.remove('active');
                if (link.getAttribute('href') === `#${sectionId}`) {
                    link.classList.add('active');
                }
            });
        }
    });
}

// ===== MODALS =====
function setupModals() {
    // Video Modal
    const watchVideoBtn = document.getElementById('watchVideoBtn');
    const videoModal = document.getElementById('videoModal');
    const closeVideo = document.getElementById('closeVideo');
    const videoFrame = document.getElementById('videoFrame');
    
    watchVideoBtn?.addEventListener('click', function() {
        videoModal.classList.add('active');
        // Replace with your actual video URL
        videoFrame.src = 'https://www.youtube.com/embed/dQw4w9WgXcQ';
    });
    
    closeVideo?.addEventListener('click', function() {
        videoModal.classList.remove('active');
        videoFrame.src = '';
    });
    
    // Login Modal
    const authBtn = document.getElementById('authBtn');
    const loginModal = document.getElementById('loginModal');
    const closeLogin = document.getElementById('closeLogin');
    const modalOverlay = document.getElementById('modalOverlay');
    const loginForm = document.getElementById('loginForm');
    const togglePassword = document.querySelector('.toggle-password');
    
    authBtn?.addEventListener('click', function() {
        const isLoggedIn = localStorage.getItem('userLoggedIn') === 'true';
        
        if (isLoggedIn) {
            // Log out
            localStorage.removeItem('userLoggedIn');
            localStorage.removeItem('userName');
            authBtn.innerHTML = '<i class="fas fa-user"></i><span>Login</span>';
            showToast('Logged out successfully!');
        } else {
            // Show login modal
            loginModal.classList.add('active');
        }
    });
    
    closeLogin?.addEventListener('click', function() {
        loginModal.classList.remove('active');
    });
    
    modalOverlay?.addEventListener('click', function() {
        loginModal.classList.remove('active');
    });
    
    // Toggle password visibility
    togglePassword?.addEventListener('click', function() {
        const passwordInput = document.getElementById('loginPassword');
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
    
    // Login form submission
    loginForm?.addEventListener('submit', function(e) {
        e.preventDefault();
        
        const email = document.getElementById('loginEmail').value;
        const rememberMe = document.getElementById('rememberMe').checked;
        
        if (email) {
            localStorage.setItem('userLoggedIn', 'true');
            localStorage.setItem('userName', email.split('@')[0]);
            
            if (rememberMe) {
                localStorage.setItem('rememberUser', 'true');
            }
            
            authBtn.innerHTML = '<i class="fas fa-user-check"></i><span>Logout</span>';
            loginModal.classList.remove('active');
            showToast('Login successful! Welcome to Curry Crave');
        }
    });
    
    // Check if user is already logged in
    const isLoggedIn = localStorage.getItem('userLoggedIn') === 'true';
    if (isLoggedIn && authBtn) {
        authBtn.innerHTML = '<i class="fas fa-user-check"></i><span>Logout</span>';
    }
}

// ===== HERO SEARCH =====
function setupHeroSearch() {
    const heroSearchForm = document.getElementById('heroSearchForm');
    const searchInput = document.getElementById('searchInput');
    
    heroSearchForm?.addEventListener('submit', function(e) {
        e.preventDefault();
        const searchQuery = searchInput.value.trim();
        
        if (searchQuery) {
            // Scroll to menu section
            const menuSection = document.getElementById('menu');
            menuSection.scrollIntoView({ behavior: 'smooth' });
            
            // Filter menu items
            filterMenuBySearch(searchQuery);
            showToast(`Searching for "${searchQuery}"...`);
        }
    });
}

function filterMenuBySearch(query) {
    const menuCards = document.querySelectorAll('.menu-card');
    const lowerQuery = query.toLowerCase();
    
    menuCards.forEach(card => {
        const name = card.querySelector('.menu-name')?.textContent.toLowerCase() || '';
        const description = card.querySelector('.menu-description')?.textContent.toLowerCase() || '';
        
        if (name.includes(lowerQuery) || description.includes(lowerQuery)) {
            card.style.display = 'block';
            card.classList.add('fade-in');
        } else {
            card.style.display = 'none';
        }
    });
}

// ===== MENU FILTERS =====
function setupMenuFilters() {
    const categoryButtons = document.querySelectorAll('.category-btn');
    
    categoryButtons.forEach(button => {
        button.addEventListener('click', function() {
            // Update active button
            categoryButtons.forEach(btn => btn.classList.remove('active'));
            this.classList.add('active');
            
            // Filter menu items
            const category = this.getAttribute('data-category');
            filterMenuByCategory(category);
        });
    });
}

function filterMenuByCategory(category) {
    const menuCards = document.querySelectorAll('.menu-card');
    
    menuCards.forEach(card => {
        const cardCategory = card.getAttribute('data-category');
        
        if (category === 'all' || cardCategory === category) {
            card.style.display = 'block';
            card.classList.add('fade-in');
        } else {
            card.style.display = 'none';
        }
    });
}

// ===== MENU ITEMS DATA =====
const menuItems = [
    {
        id: 1,
        name: 'Butter Chicken Curry',
        description: 'Rich and creamy tomato-based curry with tender chicken pieces',
        price: 299,
        category: 'curry',
        image: 'assets/images/butter-chicken.jpg',
        rating: 4.8,
        badge: 'Popular'
    },
    {
        id: 2,
        name: 'Paneer Tikka Masala',
        description: 'Grilled cottage cheese in aromatic spiced gravy',
        price: 249,
        category: 'curry',
        image: 'assets/images/paneer-tikka.jpg',
        rating: 4.7,
        badge: 'Veg'
    },
    {
        id: 3,
        name: 'Garlic Naan',
        description: 'Freshly baked soft bread topped with garlic and butter',
        price: 49,
        category: 'bread',
        image: 'assets/images/garlic-naan.jpg',
        rating: 4.9,
        badge: 'Bestseller'
    },
    {
        id: 4,
        name: 'Butter Naan',
        description: 'Classic Indian flatbread brushed with butter',
        price: 39,
        category: 'bread',
        image: 'assets/images/butter-naan.jpg',
        rating: 4.8,
        badge: null
    },
    {
        id: 5,
        name: 'Biryani Bowl',
        description: 'Fragrant basmati rice cooked with aromatic spices and meat',
        price: 349,
        category: 'rice',
        image: 'assets/images/biryani.jpg',
        rating: 4.9,
        badge: 'Chef Special'
    },
    {
        id: 6,
        name: 'Veg Pulao',
        description: 'Mixed vegetable rice with mild spices and herbs',
        price: 199,
        category: 'rice',
        image: 'assets/images/veg-pulao.jpg',
        rating: 4.5,
        badge: 'Veg'
    },
    {
        id: 7,
        name: 'Mango Lassi',
        description: 'Refreshing yogurt drink blended with sweet mango',
        price: 79,
        category: 'drinks',
        image: 'assets/images/mango-lassi.jpg',
        rating: 4.7,
        badge: null
    },
    {
        id: 8,
        name: 'Masala Chai',
        description: 'Traditional Indian spiced tea with aromatic flavors',
        price: 39,
        category: 'drinks',
        image: 'assets/images/masala-chai.jpg',
        rating: 4.6,
        badge: null
    },
    {
        id: 9,
        name: 'Gulab Jamun',
        description: 'Sweet milk dumplings soaked in rose-flavored syrup',
        price: 89,
        category: 'desserts',
        image: 'assets/images/gulab-jamun.jpg',
        rating: 4.8,
        badge: 'Sweet'
    },
    {
        id: 10,
        name: 'Rasmalai',
        description: 'Soft paneer balls in creamy sweetened milk',
        price: 99,
        category: 'desserts',
        image: 'assets/images/rasmalai.jpg',
        rating: 4.7,
        badge: 'Sweet'
    },
    {
        id: 11,
        name: 'Chicken Tikka Curry',
        description: 'Marinated grilled chicken in spicy tomato gravy',
        price: 279,
        category: 'curry',
        image: 'assets/images/chicken-tikka-curry.jpg',
        rating: 4.7,
        badge: 'Spicy'
    },
    {
        id: 12,
        name: 'Dal Makhani',
        description: 'Creamy black lentils slow-cooked with butter and cream',
        price: 199,
        category: 'curry',
        image: 'assets/images/dal-makhani.jpg',
        rating: 4.6,
        badge: 'Veg'
    }
];

// Continue in next message...
// ===== LOAD MENU ITEMS =====
function loadMenuItems() {
    const menuGrid = document.getElementById('menuGrid');
    
    if (!menuGrid) return;
    
    menuGrid.innerHTML = menuItems.map(item => `
        <div class="menu-card" data-category="${item.category}">
            <div class="menu-image">
                <img src="${item.image}" alt="${item.name}" onerror="this.src='assets/images/placeholder.jpg'">
                ${item.badge ? `<span class="menu-badge">${item.badge}</span>` : ''}
            </div>
            <div class="menu-info">
                <div class="menu-header">
                    <h3 class="menu-name">${item.name}</h3>
                    <div class="menu-rating">
                        <i class="fas fa-star"></i>
                        <span>${item.rating}</span>
                    </div>
                </div>
                <p class="menu-description">${item.description}</p>
                <div class="menu-footer">
                    <span class="menu-price">₹${item.price}</span>
                    <button class="order-btn" onclick="addToCart(${item.id})">
                        <i class="fas fa-plus"></i> Add
                    </button>
                </div>
            </div>
        </div>
    `).join('');
}

// ===== SPECIAL ITEMS =====
function loadSpecialItems() {
    const specialItems = menuItems.filter(item => item.badge && 
        (item.badge === 'Popular' || item.badge === 'Chef Special' || item.badge === 'Bestseller')
    ).slice(0, 3);
    
    const specialItemsContainer = document.getElementById('specialItems');
    
    if (!specialItemsContainer) return;
    
    specialItemsContainer.innerHTML = specialItems.map(item => `
        <div class="special-card">
            <div class="special-image">
                <img src="${item.image}" alt="${item.name}" onerror="this.src='assets/images/placeholder.jpg'">
            </div>
            <div class="special-info">
                <h3 class="special-name">${item.name}</h3>
                <p class="special-description">${item.description}</p>
                <div class="special-footer">
                    <span class="special-price">₹${item.price}</span>
                    <button class="add-to-cart-btn" onclick="addToCart(${item.id})">
                        <i class="fas fa-shopping-cart"></i> Add to Cart
                    </button>
                </div>
            </div>
        </div>
    `).join('');
}

// ===== ADD TO CART =====
function addToCart(itemId) {
    const item = menuItems.find(i => i.id === itemId);
    
    if (!item) return;
    
    // Add to cart using cart.js function
    if (typeof window.addItemToCart === 'function') {
        window.addItemToCart(item);
    }
    
    showToast(`${item.name} added to cart!`);
}

// ===== CONTACT FORM =====
function setupContactForm() {
    const contactForm = document.getElementById('contactForm');
    
    contactForm?.addEventListener('submit', function(e) {
        e.preventDefault();
        
        const name = document.getElementById('name').value;
        const email = document.getElementById('email').value;
        const phone = document.getElementById('phone').value;
        const message = document.getElementById('message').value;
        
        // Simulate form submission
        showToast('Message sent successfully! We will get back to you soon.');
        
        // Reset form
        contactForm.reset();
        
        // In a real application, you would send this data to a server
        console.log('Contact form submitted:', { name, email, phone, message });
    });
}

// ===== WHATSAPP =====
function setupWhatsApp() {
    const whatsappBtn = document.getElementById('whatsappBtn');
    
    whatsappBtn?.addEventListener('click', function() {
        const name = document.getElementById('name')?.value || '';
        const phone = document.getElementById('phone')?.value || '';
        const message = document.getElementById('message')?.value || 'Hello, I would like to know more about Curry Crave.';
        
        const whatsappMessage = encodeURIComponent(`Name: ${name}\nPhone: ${phone}\nMessage: ${message}`);
        const whatsappNumber = '919876543210'; // Replace with your actual WhatsApp number
        const whatsappUrl = `https://wa.me/${whatsappNumber}?text=${whatsappMessage}`;
        
        window.open(whatsappUrl, '_blank');
    });
}

// ===== SCROLL EFFECTS =====
function setupScrollEffects() {
    const observerOptions = {
        threshold: 0.1,
        rootMargin: '0px 0px -100px 0px'
    };
    
    const observer = new IntersectionObserver(function(entries) {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.classList.add('fade-in');
                observer.unobserve(entry.target);
            }
        });
    }, observerOptions);
    
    // Observe elements
    const elements = document.querySelectorAll('.menu-card, .service-card, .special-card, .about-content, .contact-content');
    elements.forEach(el => observer.observe(el));
}

// ===== TOAST NOTIFICATION =====
function showToast(message) {
    const toast = document.getElementById('toast');
    const toastMessage = document.getElementById('toastMessage');
    
    if (!toast || !toastMessage) return;
    
    toastMessage.textContent = message;
    toast.classList.add('active');
    
    setTimeout(() => {
        toast.classList.remove('active');
    }, 3000);
}

// Make addToCart globally accessible
window.addToCart = addToCart;
window.showToast = showToast;

// Connection to backend

// API Base URL
const API_URL = 'http://localhost:5000/api';

// Example: Login function
async function loginUser(email, password) {
    try {
        const response = await fetch(`${API_URL}/auth/login`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ email, password })
        });
        
        const data = await response.json();
        
        if (data.success) {
            // Store token
            localStorage.setItem('token', data.token);
            localStorage.setItem('user', JSON.stringify(data.user));
            return data;
        }
    } catch (error) {
        console.error('Login error:', error);
    }
}

// Example: Get menu items
async function getMenuItems() {
    try {
        const response = await fetch(`${API_URL}/food`);
        const data = await response.json();
        return data.data;
    } catch (error) {
        console.error('Error fetching menu:', error);
    }
}
