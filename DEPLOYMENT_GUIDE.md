# SMART JEWELLERY INVENTORY OS - Setup & Deployment Guide

## Quick Start for Non-Technical Users

This guide will walk you through setting up the SMART JEWELLERY INVENTORY OS on Vercel and Supabase.

### Prerequisites

You'll need:
- A GitHub account (free)
- A Vercel account (free)
- A Supabase account (free)
- An OpenRouter API key (for AI features)

---

## Step 1: Set Up Database (Supabase)

### 1.1 Create Supabase Account

1. Go to [supabase.com](https://supabase.com)
2. Click "Sign Up" and create a free account
3. Create a new project:
   - Project name: `smart-jewellery-inventory`
   - Password: Create a strong password (save it!)
   - Region: Choose nearest to you
   - Click "Create new project"

### 1.2 Create Database Tables

1. In Supabase dashboard, go to "SQL Editor"
2. Copy and paste the SQL schema from `database/schema.sql`
3. Click "Run" to create all tables

### 1.3 Get Your Credentials

1. Go to "Settings" > "API"
2. Copy your:
   - **Project URL** (looks like `https://xxxxx.supabase.co`)
   - **Anon Key** (public key)
   - **Service Role Key** (keep this secret!)

Save these for Step 3.

---

## Step 2: Set Up OpenRouter API (for AI Features)

### 2.1 Create OpenRouter Account

1. Go to [openrouter.ai](https://openrouter.ai)
2. Sign up with email or GitHub
3. Go to "Keys" section
4. Create a new API key

Save your API key for Step 3.

---

## Step 3: Deploy to Vercel

### 3.1 Push Code to GitHub

1. Create a GitHub account if you don't have one
2. Go to [github.com/new](https://github.com/new)
3. Create a new repository:
   - Name: `smart-jewellery-inventory-os`
   - Description: "Luxury AI-assisted Jewellery Inventory OS"
   - Make it public
   - Click "Create repository"

4. On your computer, in the project folder, run:
   ```
   git init
   git add .
   git commit -m "Initial commit: SMART JEWELLERY INVENTORY OS"
   git branch -M main
   git remote add origin https://github.com/YOUR_USERNAME/smart-jewellery-inventory-os.git
   git push -u origin main
   ```

### 3.2 Deploy on Vercel

1. Go to [vercel.com](https://vercel.com)
2. Sign up with GitHub
3. Click "Import Project"
4. Paste your GitHub repository URL
5. Click "Import"
6. In "Environment Variables", add:

   ```
   NEXT_PUBLIC_SUPABASE_URL=<Your Supabase URL from Step 1.3>
   NEXT_PUBLIC_SUPABASE_ANON_KEY=<Your Supabase Anon Key from Step 1.3>
   OPENROUTER_API_KEY=<Your OpenRouter API Key from Step 2.1>
   ```

7. Click "Deploy"

**Your app will be live in 2-3 minutes!** 🎉

---

## Step 4: Set Up Authentication (Supabase Auth)

### 4.1 Enable Email Authentication

1. In Supabase dashboard, go to "Authentication" > "Providers"
2. Enable "Email"
3. Go to "Email Templates" and keep defaults

### 4.2 Create Your First User

1. Go to "Authentication" > "Users"
2. Click "Add user"
3. Email: your email
4. Password: create a strong password
5. Click "Create user"

### 4.3 Log In to Your App

1. Go to your Vercel deployment URL
2. Click "Login"
3. Use the credentials you just created
4. You're in! 🎊

---

## File Structure

```
smart-jewellery-inventory-os/
├── app/                      # Next.js app directory
│   ├── (auth)/              # Authentication pages
│   ├── (dashboard)/         # Dashboard pages
│   └── api/                 # API routes
├── components/              # Reusable React components
├── lib/                     # Utility functions
├── store/                   # Zustand state management
├── types/                   # TypeScript types
└── database/                # Database schema
```

---

## Environment Variables

Create a `.env.local` file in your project root:

```
NEXT_PUBLIC_SUPABASE_URL=https://xxxxx.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=xxxxx
OPENROUTER_API_KEY=sk-or-xxxxx
```

**NEVER commit `.env.local` to GitHub!** (It's in `.gitignore`)

---

## Updating Your Deployment

After making changes to the code:

```bash
git add .
git commit -m "Your message"
git push origin main
```

Vercel will automatically redeploy! ✨

---

## Troubleshooting

### "Can't connect to database"
- Check your Supabase URL and keys in Vercel environment variables
- Make sure Supabase project is active

### "Deployment failed"
- Check build logs in Vercel dashboard
- Make sure all files are properly committed to GitHub

### "Login not working"
- Verify users exist in Supabase Authentication > Users
- Check browser console for errors (F12)

---

## Support & Resources

- **Supabase Docs**: https://supabase.com/docs
- **Next.js Docs**: https://nextjs.org/docs
- **Vercel Docs**: https://vercel.com/docs

---

## Next Steps

1. ✅ Database is set up
2. ✅ App is deployed
3. ✅ Authentication works
4. 🎯 Start adding inventory items!

Happy managing! 🎉