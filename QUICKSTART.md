# QUICKSTART GUIDE - SMART JEWELLERY INVENTORY OS

> **For Non-Technical Users** - Complete step-by-step setup in 5 minutes

---

## 📋 What You'll Need

1. **Gmail or Email address** - For creating accounts
2. **GitHub account** - Free at github.com (takes 2 minutes)
3. **Credit card** - For Vercel (you won't be charged for free tier)
4. **Your phone** - For camera-based inventory capture

---

## ⏱️ 5-Minute Setup

### Step 1: Create a Supabase Account (2 minutes)

1. Go to **[supabase.com](https://supabase.com)**
2. Click **"Sign Up"** (top right)
3. Sign up with your email
4. Check your email for confirmation link
5. Click the confirmation link
6. Done! ✅

### Step 2: Create Your First Project (2 minutes)

1. Back on Supabase, click **"New Project"**
2. Fill in:
   - **Project Name**: `smart-jewellery`
   - **Password**: Create a strong one (save it!)
   - **Region**: Select your country
3. Click **"Create new project"**
4. Wait 2-3 minutes while it sets up
5. Done! ✅

### Step 3: Set Up Database

1. In Supabase, go to **"SQL Editor"** (left menu)
2. Click **"New Query"**
3. Go to file: `database/schema.sql` in your project
4. Copy all the SQL code
5. Paste it in the Supabase SQL editor
6. Click **"Run"** (or Ctrl+Enter)
7. Wait for completion
8. Done! ✅

### Step 4: Get Your Keys (1 minute)

1. In Supabase, go to **"Settings"** > **"API"** (left menu)
2. You'll see:
   - **Project URL** (starts with `https://`)
   - **Anon Key** (long text)
3. **Copy both** and save to a text file
4. Done! ✅

### Step 5: Get OpenRouter API Key (1 minute)

1. Go to **[openrouter.ai](https://openrouter.ai)**
2. Click **"Sign Up"** (or login)
3. Go to **"Keys"** section
4. Click **"Create Key"**
5. Copy your API key
6. Save to your text file
7. Done! ✅

---

## 🚀 Deploy to Vercel

### Step 1: Push Code to GitHub (1 minute)

1. Create GitHub account at **[github.com](https://github.com)**
2. Create new repo:
   - Name: `smart-jewellery-inventory-os`
   - Make it **public**
   - Click **"Create"**
3. Copy the code (from your project folder)
4. Upload to GitHub:
   - Download **GitHub Desktop** from github.com/apps/desktop
   - Open GitHub Desktop
   - Drag your project folder into it
   - Write commit message: `"Initial commit"`
   - Click **"Commit"** then **"Push"**
5. Done! ✅

### Step 2: Deploy on Vercel (2 minutes)

1. Go to **[vercel.com](https://vercel.com)**
2. Sign up with GitHub
3. Click **"New Project"**
4. Find your `smart-jewellery-inventory-os` repo
5. Click **"Import"**
6. In **"Environment Variables"**, add:

   ```
   NEXT_PUBLIC_SUPABASE_URL = <Your Supabase URL>
   NEXT_PUBLIC_SUPABASE_ANON_KEY = <Your Supabase Anon Key>
   OPENROUTER_API_KEY = <Your OpenRouter Key>
   ```

   (Copy from your text file!)

7. Click **"Deploy"**
8. Wait 2-3 minutes
9. Click the link to your live app! 🎉

---

## 👤 Create Your First User

1. Go to Supabase > **"Authentication"** > **"Users"**
2. Click **"Add User"**
3. Email: your@email.com
4. Password: something strong
5. Click **"Create User"**
6. Go to your Vercel app URL
7. Click **"Login"**
8. Use your email and password
9. **You're In!** 🎊

---

## 📸 Using the App

### Add Inventory (Under 15 seconds!)

1. Click **"Add Inventory"**
2. Click **"📷 Open Camera"**
3. Take a photo of your jewellery
4. AI analyzes it (1-2 seconds)
5. Click **"Apply Suggestions"**
6. Edit details if needed
7. Click **"Save Inventory"**
8. ✅ Done!

### View Inventory

1. Click **"Inventory"** in sidebar
2. See all your items
3. Toggle between grid/list view
4. Search by name or category

### Run Audit

1. Click **"Audit"** in sidebar
2. Count your physical inventory
3. Enter the numbers
4. Click **"Compare Inventory"**
5. Review mismatches
6. Click **"Approve Adjustments"**

---

## 🆘 Troubleshooting

### "Can't login"

- Verify user exists in Supabase > Authentication > Users
- Check password is correct
- Clear browser cookies and try again

### "Database not connecting"

- Check Supabase project is running (green indicator)
- Verify keys are correct in Vercel settings
- Redeploy in Vercel

### "Camera not working"

- Allow camera permission when browser asks
- Only works on HTTPS (Vercel provides this)
- Mobile browsers support it natively

### "Images not uploading"

- Check file size (under 5MB)
- Try JPG instead of PNG
- Check internet connection

---

## 🎯 Next Steps

1. ✅ Set up complete
2. 📸 Add your first inventory items
3. 🔐 Invite staff (Settings page)
4. 📊 Run your first audit
5. 🚀 Scale your business!

---

## 📞 Need Help?

- **Email**: support@smartjewellery.os
- **Docs**: See README.md in project
- **FAQ**: See DEPLOYMENT_GUIDE.md

---

## 🎓 Learning Resources

- **YouTube**: Next.js Crash Course
- **Docs**: supabase.com/docs (very beginner-friendly)
- **Forum**: Community.supabase.com

---

**Congratulations! You've successfully deployed SMART JEWELLERY INVENTORY OS! 🎉**

Start adding inventory items and watch your business transform! ✨