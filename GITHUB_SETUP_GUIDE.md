# 🚀 GitHub Setup Guide - Curry Crave

Complete step-by-step guide to push your Curry Crave project to GitHub.

---

## 📋 Prerequisites Check

### ✅ What You Have Ready:
- ✅ Complete Curry Crave website project
- ✅ All files organized and working
- ✅ 17 professional food images
- ✅ Documentation (README.md)

### ❌ What Needs to be Installed:
- ❌ Git (Command Line Tools)
- ❌ GitHub account (if you don't have one)

---

## 🔧 Step 1: Install Git on macOS

Git requires Xcode Command Line Tools. Here are two methods:

### Method A: Install via Terminal (Easiest)

1. **Open Terminal** (already open if you're reading this)

2. **Run this command:**
   ```bash
   xcode-select --install
   ```

3. **A popup will appear** - Click "Install"

4. **Wait for installation** (5-10 minutes depending on internet speed)

5. **Verify installation:**
   ```bash
   git --version
   ```
   
   You should see something like: `git version 2.39.0`

### Method B: Install via Homebrew (Alternative)

If you have Homebrew installed:
```bash
brew install git
```

---

## 👤 Step 2: Set Up Git Configuration

After Git is installed, configure your identity:

```bash
git config --global user.name "Your Name"
git config --global user.email "your.email@example.com"
```

**Replace with your actual name and email!**

To verify:
```bash
git config --global --list
```

---

## 🌐 Step 3: Create GitHub Repository

### Option A: Via GitHub Website (Recommended for beginners)

1. **Go to GitHub**: https://github.com
   
2. **Sign in** (or create an account if you don't have one)

3. **Click the "+" icon** (top right) → "New repository"

4. **Fill in repository details:**
   - Repository name: `curry-crave-website`
   - Description: `Premium food delivery website for Curry Crave`
   - Visibility: Choose Public or Private
   - ⚠️ **DO NOT** check "Initialize this repository with a README"
   - ⚠️ **DO NOT** add .gitignore or license yet

5. **Click "Create repository"**

6. **Copy the repository URL** (you'll need this in Step 5)
   - It will look like: `https://github.com/YOUR_USERNAME/curry-crave-website.git`

---

## 📁 Step 4: Initialize Git Repository Locally

**Navigate to your project folder:**
```bash
cd "/Users/ajitprajapati/Documents/don't know copy/curry-crave-website"
```

**Initialize Git:**
```bash
git init
```

You should see: `Initialized empty Git repository`

---

## 📝 Step 5: Create .gitignore File

A `.gitignore` file is already prepared for you! Just run:

```bash
cat > .gitignore << 'EOF'
# macOS
.DS_Store
.AppleDouble
.LSOverride
._*

# Thumbnails
Thumbs.db

# IDE
.vscode/
.idea/
*.swp
*.swo
*~

# Logs
*.log
npm-debug.log*

# Environment variables
.env
.env.local

# Node modules (if you add npm later)
node_modules/
package-lock.json

# Build outputs
dist/
build/

# Temporary files
*.tmp
*.cache
EOF
```

---

## ➕ Step 6: Add Files to Git

**Add all files:**
```bash
git add .
```

**Check what will be committed:**
```bash
git status
```

You should see all your files in green (staged for commit).

---

## 💾 Step 7: Make Your First Commit

```bash
git commit -m "Initial commit: Complete Curry Crave website with all images and documentation"
```

You should see a message showing files were committed.

---

## 🔗 Step 8: Connect to GitHub Repository

**Add your GitHub repository as remote:**

⚠️ **Replace `YOUR_USERNAME` with your actual GitHub username!**

```bash
git remote add origin https://github.com/YOUR_USERNAME/curry-crave-website.git
```

**Verify the remote:**
```bash
git remote -v
```

---

## 📤 Step 9: Push to GitHub

**Push your code:**
```bash
git branch -M main
git push -u origin main
```

**You may be prompted for GitHub credentials:**
- **Username**: Your GitHub username
- **Password**: Use a **Personal Access Token** (not your regular password)

### 🔑 How to Create Personal Access Token:

If you don't have a token:

1. Go to GitHub → Settings → Developer settings
2. Click "Personal access tokens" → "Tokens (classic)"
3. Click "Generate new token" → "Generate new token (classic)"
4. Give it a name: "Curry Crave Project"
5. Set expiration (recommend: 90 days or no expiration)
6. Check these permissions:
   - ✅ `repo` (all sub-permissions)
7. Click "Generate token"
8. **COPY THE TOKEN** (you won't see it again!)
9. Use this token as your password when pushing

---

## ✅ Step 10: Verify on GitHub

1. Go to your GitHub repository in the browser
2. Refresh the page
3. You should see all your files!

---

## 🎯 Quick Reference Commands

Once everything is set up, use these for future updates:

### Check status:
```bash
git status
```

### Add new/modified files:
```bash
git add .
```

### Commit changes:
```bash
git commit -m "Description of changes"
```

### Push to GitHub:
```bash
git push
```

### Pull latest changes (if working from multiple computers):
```bash
git pull
```

---

## 🚀 Complete Setup Script

**After Git is installed**, you can run this entire script at once:

```bash
# Navigate to project
cd "/Users/ajitprajapati/Documents/don't know copy/curry-crave-website"

# Initialize Git
git init

# Create .gitignore
cat > .gitignore << 'EOF'
.DS_Store
.AppleDouble
.LSOverride
._*
Thumbs.db
.vscode/
.idea/
*.swp
*.swo
*~
*.log
npm-debug.log*
.env
.env.local
node_modules/
package-lock.json
dist/
build/
*.tmp
*.cache
EOF

# Add all files
git add .

# Make initial commit
git commit -m "Initial commit: Complete Curry Crave website with all images and documentation"

# Add remote (REPLACE YOUR_USERNAME!)
git remote add origin https://github.com/YOUR_USERNAME/curry-crave-website.git

# Push to GitHub
git branch -M main
git push -u origin main
```

---

## 🐛 Troubleshooting

### Issue: "git: command not found"
**Solution**: Install Xcode Command Line Tools (Step 1)

### Issue: "Authentication failed"
**Solution**: Use a Personal Access Token instead of password

### Issue: "remote origin already exists"
**Solution**: Remove and re-add remote:
```bash
git remote remove origin
git remote add origin https://github.com/YOUR_USERNAME/curry-crave-website.git
```

### Issue: "Permission denied"
**Solution**: Check your GitHub username and token are correct

### Issue: "Nothing to commit"
**Solution**: You've already committed everything! Just push:
```bash
git push
```

---

## 📊 What Will Be Uploaded

Your GitHub repository will contain:

```
curry-crave-website/
├── assets/
│   └── images/              (All 17 food images + originals)
├── css/
│   └── styles.css
├── js/
│   ├── main.js
│   └── cart.js
├── index.html
├── README.md
├── FIXES_SUMMARY.md
├── GITHUB_SETUP_GUIDE.md (this file)
└── .gitignore
```

**Total files**: ~40 files  
**Total size**: ~25 MB (approximately)

---

## 🎨 Make Your Repository Look Professional

After pushing, add these to make it look great:

### 1. Repository Description
- Go to your repo on GitHub
- Click "⚙️" next to "About"
- Add description: "Premium food delivery website for Curry Crave - Built with vanilla HTML, CSS, and JavaScript"
- Add website URL (if hosted)
- Add topics: `food`, `delivery`, `website`, `indian-food`, `responsive-design`

### 2. Add Repository Image
- Your repo will show the README.md automatically
- The README already has nice formatting!

---

## 🌟 Next Steps (Optional)

### Deploy Your Website (Free Hosting):

1. **GitHub Pages** (Free, easiest)
   - Go to repo Settings → Pages
   - Source: Deploy from branch
   - Branch: main
   - Folder: / (root)
   - Save
   - Your site will be at: `https://YOUR_USERNAME.github.io/curry-crave-website/`

2. **Netlify** (Free, more features)
   - Go to netlify.com
   - "New site from Git"
   - Connect GitHub
   - Select curry-crave-website
   - Deploy!

3. **Vercel** (Free, fastest)
   - Go to vercel.com
   - "Import Project"
   - Connect GitHub
   - Select curry-crave-website
   - Deploy!

---

## 📧 Need Help?

If you get stuck:
1. Check the Troubleshooting section above
2. Read error messages carefully
3. Search the error on Google or GitHub Discussions
4. Ask on Stack Overflow

---

## ✅ Summary Checklist

- [ ] Install Git (Xcode Command Line Tools)
- [ ] Configure Git with name and email
- [ ] Create GitHub repository
- [ ] Initialize local Git repository
- [ ] Create .gitignore file
- [ ] Add all files (`git add .`)
- [ ] Make first commit
- [ ] Connect to GitHub remote
- [ ] Create Personal Access Token (if needed)
- [ ] Push to GitHub (`git push`)
- [ ] Verify files on GitHub website
- [ ] Add repository description and topics
- [ ] (Optional) Deploy to GitHub Pages or Netlify

---

**🎉 Once complete, your Curry Crave project will be safely stored on GitHub and accessible from anywhere!**

**Repository URL will be:**
`https://github.com/YOUR_USERNAME/curry-crave-website`
