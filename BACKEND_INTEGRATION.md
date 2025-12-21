# 🔗 Backend Integration Guide - Curry Crave

Complete guide to integrate your frontend with the backend API.

---

## 📋 Prerequisites

### Step 1: Install Node.js

**Download Node.js:** https://nodejs.org/

- Choose **LTS version** (recommended)
- Install it on your Mac
- Verify installation:
  ```bash
  node --version
  npm --version
  ```

---

## 🚀 Quick Setup (After Node.js is installed)

### 1. Install Backend Dependencies

```bash
cd "/Users/ajitprajapati/Documents/don't know copy/Backend/curry-crave-backend"
npm install
```

This will install all required packages:
- express
- mongoose
- cors
- dotenv
- bcryptjs
- jsonwebtoken
- And more...

### 2. Configure Environment

The `.env` file should already exist. Verify it has:

```env
PORT=5000
FRONTEND_URL=http://localhost:8000
NODE_ENV=development
MONGODB_URI=your_mongodb_connection_string
JWT_SECRET=your_jwt_secret_key
```

### 3. Start the Backend Server

```bash
npm run dev
```

Server will start at: **http://localhost:5000**

You should see:
```
🚀 Server running on port 5000 in development mode
```

### 4. Test the API

Open browser and go to: **http://localhost:5000**

You should see:
```json
{
  "success": true,
  "message": "Curry Crave API is running!",
  "version": "1.0.0"
}
```

---

## 🔌 Frontend Integration

I've created updated JavaScript files that connect to your backend!

### Files Updated:
1. `js/api.js` - API service layer (NEW)
2. `js/main-integrated.js` - Frontend with backend (NEW) 
3. `js/admin-integrated.js` - Admin with backend (NEW)

---

## 📡 API Endpoints Available

### Authentication
- `POST /api/auth/register` - Register new user
- `POST /api/auth/login` - Login user
- `GET /api/auth/profile` - Get user profile

### Food Items
- `GET /api/food` - Get all food items
- `GET /api/food/:id` - Get single item
- `POST /api/food` - Create new item (admin)
- `PUT /api/food/:id` - Update item (admin)
- `DELETE /api/food/:id` - Delete item (admin)

### Cart
- `GET /api/cart` - Get user's cart
- `POST /api/cart` - Add item to cart
- `PUT /api/cart/:id` - Update cart item
- `DELETE /api/cart/:id` - Remove from cart

### Orders
- `GET /api/order` - Get all orders
- `GET /api/order/:id` - Get single order
- `POST /api/order` - Create new order
- `PUT /api/order/:id` - Update order status (admin)

### Payment
- `POST /api/payment/create-order` - Create Razorpay order
- `POST /api/payment/verify` - Verify payment

---

## 🎯 Integration Steps

### Option 1: Using New Integrated Files (Recommended)

1. **Rename old files (backup):**
   ```bash
   mv js/main.js js/main-old.js
   mv js/admin.js js/admin-old.js
   ```

2. **Rename new integrated files:**
   ```bash
   mv js/main-integrated.js js/main.js
   mv js/admin-integrated.js js/admin.js
   ```

3. **Start your frontend:**
   ```bash
   python3 -m http.server 8000
   ```

4. **Open in browser:**
   - Frontend: http://localhost:8000
   - Admin: http://localhost:8000/admin.html

### Option 2: Manual Integration

Update the API_URL in your JavaScript files:

**In `js/main.js` and `js/admin.js`:**
```javascript
const API_URL = 'http://localhost:5000/api';
```

---

## 🔐 MongoDB Setup

### Option A: MongoDB Atlas (Cloud - FREE)

1. **Go to:** https://www.mongodb.com/cloud/atlas
2. **Sign up** for free account
3. **Create a cluster** (free tier)
4. **Get connection string:**
   - Click "Connect"
   - Choose "Connect your application"
   - Copy the connection string
   - Replace `<password>` with your database password

5. **Update `.env`:**
   ```env
   MONGODB_URI=mongodb+srv://username:password@cluster.mongodb.net/currycrave?retryWrites=true&w=majority
   ```

### Option B: Local MongoDB

1. **Install MongoDB:**
   ```bash
   brew install mongodb-community
   ```

2. **Start MongoDB:**
   ```bash
   brew services start mongodb-community
   ```

3. **Update `.env`:**
   ```env
   MONGODB_URI=mongodb://localhost:27017/currycrave
   ```

---

## 🧪 Testing the Integration

### 1. Test Authentication

**Register a user:**
```javascript
// In browser console or using Postman
fetch('http://localhost:5000/api/auth/register', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    name: 'Test User',
    email: 'test@example.com',
    password: 'password123'
  })
})
.then(res => res.json())
.then(data => console.log(data));
```

**Login:**
```javascript
fetch('http://localhost:5000/api/auth/login', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    email: 'test@example.com',
    password: 'password123'
  })
})
.then(res => res.json())
.then(data => {
  console.log(data);
  localStorage.setItem('token', data.token);
});
```

### 2. Test Menu Items

**Get all items:**
```javascript
fetch('http://localhost:5000/api/food')
  .then(res => res.json())
  .then(data => console.log(data));
```

### 3. Test Adding to Cart

```javascript
const token = localStorage.getItem('token');

fetch('http://localhost:5000/api/cart', {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
    'Authorization': `Bearer ${token}`
  },
  body: JSON.stringify({
    foodItemId: 'item_id_here',
    quantity: 1
  })
})
.then(res => res.json())
.then(data => console.log(data));
```

---

## 🔧 Troubleshooting

### Issue: CORS Error

**Solution:** Backend already has CORS enabled. Make sure backend is running.

### Issue: Connection Refused

**Solutions:**
1. Check if backend is running: `npm run dev`
2. Verify PORT in `.env` is 5000
3. Check firewall settings

### Issue: MongoDB Connection Error

**Solutions:**
1. Verify MongoDB is running
2. Check connection string in `.env`
3. Ensure MongoDB Atlas cluster is active
4. Check network access in MongoDB Atlas

### Issue: Authentication Token Invalid

**Solutions:**
1. Check JWT_SECRET in `.env`
2. Re-login to get new token
3. Clear localStorage and login again

---

## 📱 Complete Workflow

### For Customers (Frontend):

1. **Browse Menu** → Fetches from `/api/food`
2. **Add to Cart** → POST to `/api/cart`
3. **Login/Register** → `/api/auth/login` or `/register`
4. **Checkout** → POST to `/api/order`
5. **Payment** → POST to `/api/payment/create-order`
6. **Order Tracking** → GET `/api/order/:id`

### For Admin (Dashboard):

1. **Admin Login** → `/api/auth/login` (with admin role)
2. **View Orders** → GET `/api/order`
3. **Manage Menu** → CRUD operations on `/api/food`
4. **Update Order Status** → PUT `/api/order/:id`
5. **View Users** → GET `/api/auth/users` (admin only)

---

## 🎨 Current vs Integrated

### Current (Without Backend):
- ✅ Static demo data
- ✅ LocalStorage for cart
- ✅ Client-side only
- ❌ No real database
- ❌ No user accounts
- ❌ No order persistence

### With Backend Integration:
- ✅ Real database (MongoDB)
- ✅ User authentication (JWT)
- ✅ Persistent cart
- ✅ Order history
- ✅ Admin controls
- ✅ Payment processing
- ✅ Email notifications (with Nodemailer)

---

## 🚀 Next Steps

1. **Install Node.js** (if not already)
2. **Install backend dependencies** (`npm install`)
3. **Set up MongoDB** (Atlas or local)
4. **Configure `.env` file**
5. **Start backend server** (`npm run dev`)
6. **Test API endpoints**
7. **Switch to integrated frontend files**
8. **Test complete flow**

---

## 📚 Additional Resources

- **Node.js:** https://nodejs.org/
- **MongoDB Atlas:** https://www.mongodb.com/cloud/atlas
- **Express.js:** https://expressjs.com/
- **JWT:** https://jwt.io/
- **Postman:** https://www.postman.com/ (for API testing)

---

## 🎯 Quick Commands Reference

```bash
# Install dependencies
npm install

# Start development server
npm run dev

# Start production server
npm start

# Test frontend
python3 -m http.server 8000

# Check if backend is running
curl http://localhost:5000
```

---

## ✅ Checklist

Before going live, ensure:

- [ ] Node.js installed
- [ ] Backend dependencies installed
- [ ] MongoDB set up and running
- [ ] Environment variables configured
- [ ] Backend server starts without errors
- [ ] All API endpoints tested
- [ ] Frontend connects to backend
- [ ] Admin dashboard connected
- [ ] Authentication working
- [ ] Cart functionality tested
- [ ] Order creation tested
- [ ] Payment integration tested (if using Razorpay)

---

**Your backend is ready to go! Just install Node.js and follow the steps above!** 🚀

**Need help with any specific step? Let me know!**
