#!/bin/bash

# 🚀 Curry Crave - Backend Setup Script
# This script helps you set up and start the backend server

echo "🍛 Curry Crave - Backend Setup Assistant"
echo "========================================="
echo ""

# Colors
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Functions
print_success() {
    echo -e "${GREEN}✅ $1${NC}"
}

print_warning() {
    echo -e "${YELLOW}⚠️  $1${NC}"
}

print_error() {
    echo -e "${RED}❌ $1${NC}"
}

print_info() {
    echo -e "${BLUE}ℹ️  $1${NC}"
}

# Step 1: Check Node.js
echo "Step 1: Checking Node.js installation..."
if command -v node &> /dev/null; then
    NODE_VERSION=$(node --version)
    print_success "Node.js is installed: $NODE_VERSION"
else
    print_error "Node.js is NOT installed!"
    echo ""
    echo "📥 To install Node.js:"
    echo "   1. Visit: https://nodejs.org/"
    echo "   2. Download the LTS version"
    echo "   3. Run the installer"
    echo "   4. Run this script again"
    echo ""
    exit 1
fi

# Step 2: Check npm
echo ""
echo "Step 2: Checking npm..."
if command -v npm &> /dev/null; then
    NPM_VERSION=$(npm --version)
    print_success "npm is installed: v$NPM_VERSION"
else
    print_error "npm is NOT installed!"
    exit 1
fi

# Step 3: Navigate to backend directory
echo ""
echo "Step 3: Navigating to backend directory..."
BACKEND_DIR="../Backend/curry-crave-backend"
if [ -d "$BACKEND_DIR" ]; then
    cd "$BACKEND_DIR"
    print_success "Found backend directory"
else
    print_error "Backend directory not found!"
    echo "Looking for: $BACKEND_DIR"
    exit 1
fi

# Step 4: Check if node_modules exists
echo ""
echo "Step 4: Checking dependencies..."
if [ -d "node_modules" ]; then
    print_success "Dependencies already installed"
else
    print_warning "Dependencies not installed"
    echo ""
    read -p "Do you want to install dependencies now? (y/n): " INSTALL_DEPS
    
    if [ "$INSTALL_DEPS" == "y" ]; then
        echo ""
        echo "📦 Installing dependencies... (this may take a few minutes)"
        npm install
        
        if [ $? -eq 0 ]; then
            print_success "Dependencies installed successfully!"
        else
            print_error "Failed to install dependencies"
            exit 1
        fi
    else
        print_warning "Skipping dependency installation"
        echo "You can install them later with: npm install"
        exit 0
    fi
fi

# Step 5: Check .env file
echo ""
echo "Step 5: Checking environment configuration..."
if [ -f ".env" ]; then
    print_success "Environment file found"
    
    # Show current settings (without sensitive data)
    echo ""
    echo "Current configuration:"
    echo "---------------------"
    PORT=$(grep "^PORT=" .env | cut -d '=' -f2)
    NODE_ENV=$(grep "^NODE_ENV=" .env | cut -d '=' -f2)
    echo "PORT: ${PORT:-5000}"
    echo "NODE_ENV: ${NODE_ENV:-development}"
    echo ""
else
    print_warning "No .env file found"
    echo ""
    read -p "Do you want to create a default .env file? (y/n): " CREATE_ENV
    
    if [ "$CREATE_ENV" == "y" ]; then
        cat > .env << 'EOF'
PORT=5000
FRONTEND_URL=http://localhost:8000
NODE_ENV=development
MONGODB_URI=mongodb://localhost:27017/currycrave
JWT_SECRET=your_jwt_secret_key_change_in_production
RAZORPAY_KEY_ID=your_razorpay_key
RAZORPAY_KEY_SECRET=your_razorpay_secret
EMAIL_HOST=smtp.gmail.com
EMAIL_PORT=587
EMAIL_USER=your_email@gmail.com
EMAIL_PASS=your_email_password
EOF
        print_success "Default .env file created"
        print_warning "Remember to update MongoDB URI and other sensitive values!"
    fi
fi

# Step 6: Check MongoDB
echo ""
echo "Step 6: Checking MongoDB connection..."
print_info "Make sure MongoDB is running before starting the server"
echo ""
echo "Options:"
echo "  A. Use MongoDB Atlas (Cloud - FREE)"
echo "     Visit: https://www.mongodb.com/cloud/atlas"
echo ""
echo "  B. Use Local MongoDB"
echo "     Install: brew install mongodb-community"
echo "     Start:   brew services start mongodb-community"
echo ""

# Step 7: Start server
echo ""
echo "Step 7: Starting backend server..."
echo ""
read -p "Do you want to start the backend server now? (y/n): " START_SERVER

if [ "$START_SERVER" == "y" ]; then
    echo ""
    print_info "Starting server in development mode..."
    print_info "Press Ctrl+C to stop the server"
    echo ""
    echo "========================================="
    echo ""
    
    npm run dev
else
    echo ""
    print_info "To start the server manually, run:"
    echo "   cd $BACKEND_DIR"
    echo "   npm run dev"
    echo ""
    print_success "Setup complete!"
fi

echo ""
print_success "Backend setup completed successfully!"
echo ""
echo "📋 Next steps:"
echo "   1. Make sure MongoDB is running"
echo "   2. Start the backend: npm run dev"
echo "   3. Start the frontend: python3 -m http.server 8000"
echo "   4. Open http://localhost:8000 in your browser"
echo ""
echo "🔗 API will be available at: http://localhost:5000"
echo ""
