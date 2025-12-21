# 🎛️ Admin Dashboard - Curry Crave

Complete admin panel for managing the Curry Crave food delivery website.

---

## 🚀 Quick Start

### Access the Admin Dashboard

**URL:** `admin.html`

**Demo Credentials:**
- **Username:** `admin`
- **Password:** `admin123`

---

## ✨ Features

### 📊 Dashboard Overview
- Real-time statistics (Orders, Revenue, Users, Menu Items)
- Sales charts and graphs
- Top selling items
- Recent orders table
- Performance indicators

### 📦 Order Management
- View all orders
- Filter by status (Pending, Confirmed, Preparing, Delivered, Cancelled)
- Update order status
- View order details
- Export orders data

### 🍽️ Menu Management
- Add new menu items
- Edit existing items
- Delete items
- Upload images
- Set categories and prices
- Add badges (Popular, Bestseller, New, etc.)

### 👥 User Management
- View all registered users
- User statistics (orders, total spent)
- User activity tracking
- Export user data

### 📈 Analytics
- Sales analytics
- Popular items
- Revenue tracking
- User growth metrics

### ⚙️ Settings
- Restaurant information
- Notification preferences
- System configuration

---

## 🎨 Design Features

- **Premium Dark Theme** - Matches main website aesthetics
- **Gold & Black Color Scheme** - Consistent branding
- **Responsive Design** - Works on all devices
- **Modern UI/UX** - Clean and intuitive interface
- **Smooth Animations** - Professional transitions
- **Interactive Charts** - Visual data representation

---

## 📱 Pages

1. **Dashboard** - Overview and statistics
2. **Orders** - Order management
3. **Menu** - Food item management
4. **Users** - Customer management
5. **Analytics** - Reports and insights
6. **Settings** - Configuration

---

## 🔐 Authentication

Currently uses **demo authentication** with localStorage:
- Username: `admin`
- Password: `admin123`

**For production:**
- Integrate with backend API
- Implement JWT tokens
- Add role-based access control
- Enable 2FA for security

---

## 💾 Data Management

**Current:** Demo data stored in JavaScript

**For production:**
- Connect to backend API
- Real-time database sync
- CRUD operations via API
- Data validation

---

## 🎯 Key Functions

### Menu Management
```javascript
// Add new item
addMenuItem(itemData)

// Edit existing item
editMenuItem(itemId)

// Delete item
deleteMenuItem(itemId)
```

### Order Management
```javascript
// View order details
viewOrder(orderId)

// Update order status
updateOrderStatus(orderId, newStatus)
```

### User Management
```javascript
// View user profile
viewUser(userId)

// Export user data
exportUsers()
```

---

## 🔧 Customization

### Adding New Pages

1. **Create HTML section:**
```html
<div class="page-content" id="newPage" style="display: none;">
    <!-- Your content -->
</div>
```

2. **Add navigation item:**
```html
<a href="#" class="nav-item" data-page="newpage">
    <i class="fas fa-icon"></i>
    <span>New Page</span>
</a>
```

3. **Add JavaScript handler:**
```javascript
case 'newpage':
    loadNewPageData();
    break;
```

### Changing Colors

Edit CSS variables in `css/admin.css`:
```css
:root {
    --primary-gold: #D4AF37;
    --vibrant-green: #2ECC71;
    /* ... */
}
```

---

## 🌐 Backend Integration

To connect to your backend:

1. **Update API endpoints** in `js/admin.js`:
```javascript
const API_URL = 'http://localhost:5000/api';
```

2. **Replace demo data** with API calls:
```javascript
async function loadMenuData() {
    const response = await fetch(`${API_URL}/menu`);
    const data = await response.json();
    // ... render data
}
```

3. **Add authentication headers**:
```javascript
const token = localStorage.getItem('adminToken');
headers: {
    'Authorization': `Bearer ${token}`
}
```

---

## 📊 Sample Data Structure

### Menu Item
```javascript
{
    id: 1,
    name: "Butter Chicken Curry",
    category: "curry",
    price: 299,
    description: "Rich and creamy...",
    image: "assets/images/butter-chicken.jpg",
    badge: "Popular"
}
```

### Order
```javascript
{
    id: "CC1001",
    customer: "Rahul Kumar",
    items: "Butter Chicken, Naan",
    amount: "₹348",
    status: "confirmed",
    date: "2025-12-12"
}
```

### User
```javascript
{
    id: "U1001",
    name: "Rahul Kumar",
    email: "rahul@email.com",
    phone: "+91 9876543210",
    orders: 23,
    spent: "5,670",
    joined: "2024-06-15"
}
```

---

## 🎨 Screenshots & UI

### Dashboard Overview
- 4 stat cards (Orders, Revenue, Users, Menu Items)
- Sales chart
- Top selling items
- Recent orders table

### Menu Management
- Grid layout of menu items
- Add/Edit modal with form
- Image upload capability
- Category based organization

### Order Management
- Card-based order display
- Status badges (color-coded)
- Filter and search options
- Quick actions

---

## 🔒 Security Features

**Current (Demo):**
- LocalStorage authentication
- Client-side validation

**Recommended (Production):**
- Server-side authentication
- JWT tokens
- HTTPS only
- Rate limiting
- Input sanitization
- SQL injection prevention
- XSS protection

---

## 📱 Responsive Breakpoints

- **Desktop:** > 992px
- **Tablet:** 768px - 992px
- **Mobile:** < 768px

Sidebar collapses on mobile devices.

---

## 🚀 Deployment

1. **Test locally** with a web server
2. **Build for production** (if using build tools)
3. **Upload to server:**
   - admin.html
   - css/admin.css
   - js/admin.js
   - All required assets

4. **Configure authentication**
5. **Connect to backend API**
6. **Enable HTTPS**

---

## 🎓 For Developers

### File Structure
```
admin.html          - Main admin dashboard HTML
css/admin.css       - Admin dashboard styles
js/admin.js         - Admin dashboard functionality
```

### Technologies Used
- HTML5
- CSS3 (Custom Properties, Grid, Flexbox)
- Vanilla JavaScript (ES6+)
- Font Awesome Icons
- Google Fonts (Playfair Display, Poppins)

### Browser Compatibility
- Chrome (latest)
- Firefox (latest)
- Safari (latest)
- Edge (latest)

---

## ⚡ Performance Tips

1. Lazy load images
2. Implement pagination for large datasets
3. Cache API responses
4. Minimize DOM manipulations
5. Use debouncing for search inputs

---

## 🐛 Troubleshooting

**Issue: Can't login**
- Ensure you're using correct credentials: `admin` / `admin123`
- Check browser console for errors
- Clear localStorage and try again

**Issue: Data not loading**
- Check if demo data is present in `admin.js`
- Verify page is loaded (check network tab)

**Issue: Responsive issues**
- Clear cache and hard refresh
- Check viewport meta tag
- Test in different browsers

---

## 📈 Future Enhancements

- [ ] Real-time order notifications
- [ ] Push notifications
- [ ] Advanced analytics with Chart.js
- [ ] Export to PDF/Excel
- [ ] Bulk operations  
- [ ] Advanced search and filters
- [ ] Image upload functionality
- [ ] Multi-language support
- [ ] Dark/Light theme toggle
- [ ] Customer chat support

---

## 📝 Notes

- This is a **demo admin dashboard** with sample data
- For production use, integrate with your backend API
- Implement proper authentication and authorization
- Add data validation and error handling
- Enable HTTPS in production

---

## 🎉 Enjoy!

Your Curry Crave Admin Dashboard is ready to use!

**Access:** Open `admin.html` in your browser  
**Login:** admin / admin123

---

**Need help?** Check the main README.md or contact support.
