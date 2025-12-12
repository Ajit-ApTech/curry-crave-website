#!/bin/bash

# 🚀 Curry Crave - GitHub Push Script
# This script automates the process of pushing your project to GitHub

echo "🍛 Curry Crave - GitHub Setup Script"
echo "======================================"
echo ""

# Colors for output
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m' # No Color

# Function to print colored messages
print_success() {
    echo -e "${GREEN}✅ $1${NC}"
}

print_warning() {
    echo -e "${YELLOW}⚠️  $1${NC}"
}

print_error() {
    echo -e "${RED}❌ $1${NC}"
}

# Check if Git is installed
echo "Checking if Git is installed..."
if ! command -v git &> /dev/null; then
    print_error "Git is not installed!"
    echo ""
    echo "Please install Git first:"
    echo "  Run: xcode-select --install"
    echo ""
    echo "After installation, run this script again."
    exit 1
fi

print_success "Git is installed!"
GIT_VERSION=$(git --version)
echo "   $GIT_VERSION"
echo ""

# Check if Git is configured
echo "Checking Git configuration..."
GIT_NAME=$(git config --global user.name)
GIT_EMAIL=$(git config --global user.email)

if [ -z "$GIT_NAME" ] || [ -z "$GIT_EMAIL" ]; then
    print_warning "Git is not configured yet."
    echo ""
    echo "Please configure Git with your information:"
    read -p "Enter your name: " USER_NAME
    read -p "Enter your email: " USER_EMAIL
    
    git config --global user.name "$USER_NAME"
    git config --global user.email "$USER_EMAIL"
    
    print_success "Git configured successfully!"
else
    print_success "Git is already configured."
    echo "   Name: $GIT_NAME"
    echo "   Email: $GIT_EMAIL"
fi
echo ""

# Check if already a Git repository
if [ -d ".git" ]; then
    print_warning "This is already a Git repository."
    read -p "Do you want to continue anyway? (y/n): " CONTINUE
    if [ "$CONTINUE" != "y" ]; then
        echo "Exiting..."
        exit 0
    fi
else
    echo "Initializing Git repository..."
    git init
    print_success "Git repository initialized!"
fi
echo ""

# Ask for GitHub repository URL
echo "📝 GitHub Repository Setup"
echo "--------------------------"
echo "Please create a new repository on GitHub if you haven't already:"
echo "   https://github.com/new"
echo ""
echo "Repository settings:"
echo "   - Name: curry-crave-website"
echo "   - Description: Premium food delivery website"
echo "   - Public or Private: Your choice"
echo "   - DO NOT initialize with README, .gitignore, or license"
echo ""
read -p "Enter your GitHub repository URL (e.g., https://github.com/username/curry-crave-website.git): " REPO_URL

if [ -z "$REPO_URL" ]; then
    print_error "Repository URL cannot be empty!"
    exit 1
fi

# Check if remote already exists
if git remote | grep -q "origin"; then
    print_warning "Remote 'origin' already exists. Removing it..."
    git remote remove origin
fi

echo "Adding remote repository..."
git remote add origin "$REPO_URL"
print_success "Remote repository added!"
echo ""

# Add all files
echo "📦 Adding files to Git..."
git add .
ADDED_FILES=$(git diff --cached --numstat | wc -l | tr -d ' ')
print_success "Added $ADDED_FILES files to staging area"
echo ""

# Show status
echo "📊 Git Status:"
git status --short
echo ""

# Commit
read -p "Enter commit message (or press Enter for default): " COMMIT_MSG
if [ -z "$COMMIT_MSG" ]; then
    COMMIT_MSG="Initial commit: Complete Curry Crave website with all images and documentation"
fi

echo "Creating commit..."
git commit -m "$COMMIT_MSG"
print_success "Commit created successfully!"
echo ""

# Set main branch
echo "Setting up main branch..."
git branch -M main
print_success "Branch set to 'main'"
echo ""

# Push to GitHub
echo "🚀 Pushing to GitHub..."
echo ""
print_warning "You may be prompted for GitHub credentials."
echo "   Username: Your GitHub username"
echo "   Password: Use a Personal Access Token (NOT your password!)"
echo ""
echo "To create a Personal Access Token:"
echo "   1. Go to: https://github.com/settings/tokens"
echo "   2. Click 'Generate new token (classic)'"
echo "   3. Select 'repo' scope"
echo "   4. Copy the token and use it as your password"
echo ""
read -p "Press Enter to continue with push..."

if git push -u origin main; then
    echo ""
    print_success "🎉 Successfully pushed to GitHub!"
    echo ""
    echo "Your repository is now live at:"
    echo "   $REPO_URL"
    echo ""
    echo "Next steps:"
    echo "   1. Visit your repository on GitHub"
    echo "   2. Add topics: food, delivery, website, indian-food"
    echo "   3. (Optional) Deploy to GitHub Pages or Netlify"
    echo ""
    print_success "All done! Happy coding! 🚀"
else
    echo ""
    print_error "Failed to push to GitHub."
    echo ""
    echo "Common issues:"
    echo "   1. Authentication failed - Make sure you're using a Personal Access Token"
    echo "   2. Repository doesn't exist - Create it on GitHub first"
    echo "   3. No internet connection - Check your network"
    echo ""
    echo "After fixing the issue, you can push manually:"
    echo "   git push -u origin main"
    exit 1
fi
