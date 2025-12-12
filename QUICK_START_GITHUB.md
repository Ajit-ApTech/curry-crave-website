# 🚀 Quick Start - Push to GitHub

## Option 1: Automated Script (Easiest) ⚡

**After installing Git**, simply run:

```bash
cd "/Users/ajitprajapati/Documents/don't know copy/curry-crave-website"
./push-to-github.sh
```

The script will guide you through everything!

---

## Option 2: Manual Steps (If you prefer) 📝

### 1. Install Git
```bash
xcode-select --install
```
Wait for installation to complete (~5-10 minutes)

### 2. Configure Git
```bash
git config --global user.name "Your Name"
git config --global user.email "your.email@example.com"
```

### 3. Create GitHub Repository
1. Go to https://github.com/new
2. Name: `curry-crave-website`
3. Don't check any boxes
4. Click "Create repository"
5. Copy the repository URL

### 4. Push Your Code
```bash
cd "/Users/ajitprajapati/Documents/don't know copy/curry-crave-website"
git init
git add .
git commit -m "Initial commit: Curry Crave website"
git branch -M main
git remote add origin https://github.com/YOUR_USERNAME/curry-crave-website.git
git push -u origin main
```

Replace `YOUR_USERNAME` with your GitHub username!

---

## 🔑 GitHub Authentication

When pushing, use:
- **Username**: Your GitHub username
- **Password**: Personal Access Token (create at https://github.com/settings/tokens)

⚠️ **Don't use your regular GitHub password!**

---

## 📚 Detailed Guide

For complete instructions, see: **GITHUB_SETUP_GUIDE.md**

---

## ✅ What Happens Next?

1. ✅ All your files will be uploaded to GitHub
2. ✅ You'll have a backup of your project
3. ✅ You can access it from anywhere
4. ✅ You can deploy it to the web (GitHub Pages, Netlify, etc.)

---

## 🎯 Current Status

- ✅ .gitignore file created
- ✅ Automated script ready
- ✅ All files prepared
- ⏳ Waiting for Git installation and GitHub push

---

**Total Time**: ~15 minutes (including Git installation)
