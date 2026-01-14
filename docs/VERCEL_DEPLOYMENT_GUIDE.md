# Vercel Deployment Guide - Connecting Inphrone to Lovable Cloud

## Overview

This guide explains how to deploy the Inphrone frontend to Vercel while keeping the Lovable Cloud backend fully functional. Your backend (database, authentication, edge functions, storage) stays on Lovable Cloud - only the frontend is deployed to Vercel.

---

## Architecture

```
┌─────────────────────────────────────────────────────────────┐
│                    YOUR DEPLOYMENT                          │
├─────────────────────────────────────────────────────────────┤
│                                                             │
│   ┌─────────────┐         ┌─────────────────────────┐      │
│   │   VERCEL    │ ──────► │    LOVABLE CLOUD        │      │
│   │  (Frontend) │   API   │      (Backend)          │      │
│   │             │  Calls  │                         │      │
│   │  - React    │         │  - PostgreSQL Database  │      │
│   │  - Vite     │         │  - Authentication       │      │
│   │  - Static   │         │  - Edge Functions       │      │
│   │    Assets   │         │  - File Storage         │      │
│   └─────────────┘         └─────────────────────────┘      │
│                                                             │
│   Your Domain ──► Vercel ──► Lovable Cloud Backend         │
│                                                             │
└─────────────────────────────────────────────────────────────┘
```

---

## Prerequisites

1. **GitHub Account** - Your code repository
2. **Vercel Account** - Free at [vercel.com](https://vercel.com)
3. **Lovable Project** - With Cloud enabled (already done ✅)
4. **VS Code** - For local development

---

## Step 1: Get Your Lovable Cloud Credentials

Before deploying, you need these environment variables from your Lovable project:

### Required Environment Variables

| Variable | Value | Description |
|----------|-------|-------------|
| `VITE_SUPABASE_URL` | `https://kwkfmwgqwpaynawgtghf.supabase.co` | Your Lovable Cloud API URL |
| `VITE_SUPABASE_PUBLISHABLE_KEY` | `eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...` | Your anon/public key |
| `VITE_SUPABASE_PROJECT_ID` | `kwkfmwgqwpaynawgtghf` | Your project ID |

> **Note**: These are your actual Lovable Cloud credentials. The publishable key is safe to use in frontend code.

---

## Step 2: Local Development Setup

### Clone Your Repository

```bash
# Clone from GitHub
git clone https://github.com/YOUR_USERNAME/inphrone.git
cd inphrone

# Install dependencies
npm install
```

### Create Local Environment File

Create a `.env.local` file in your project root:

```env
# Lovable Cloud Connection
VITE_SUPABASE_URL=https://kwkfmwgqwpaynawgtghf.supabase.co
VITE_SUPABASE_PUBLISHABLE_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imt3a2Ztd2dxd3BheW5hd2d0Z2hmIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTk0MTc5NDUsImV4cCI6MjA3NDk5Mzk0NX0.cHEniHrQWvjUkCr8PT_WA4BxWDqTguqmw62_-XyhNR0
VITE_SUPABASE_PROJECT_ID=kwkfmwgqwpaynawgtghf
```

### Test Locally

```bash
# Start development server
npm run dev

# Build for production (test before deploying)
npm run build
```

---

## Step 3: Push Code to GitHub

```bash
# Stage all changes
git add .

# Commit your changes
git commit -m "Ready for Vercel deployment"

# Push to GitHub
git push origin main
```

---

## Step 4: Deploy to Vercel

### Option A: Vercel Dashboard (Recommended for First Time)

1. **Go to Vercel**: [vercel.com/new](https://vercel.com/new)

2. **Import Git Repository**:
   - Click "Import Git Repository"
   - Select your GitHub account
   - Choose your `inphrone` repository

3. **Configure Project**:
   - **Framework Preset**: Vite
   - **Build Command**: `npm run build`
   - **Output Directory**: `dist`
   - **Install Command**: `npm install`

4. **Add Environment Variables**:
   
   Click "Environment Variables" and add:
   
   | Name | Value |
   |------|-------|
   | `VITE_SUPABASE_URL` | `https://kwkfmwgqwpaynawgtghf.supabase.co` |
   | `VITE_SUPABASE_PUBLISHABLE_KEY` | `eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imt3a2Ztd2dxd3BheW5hd2d0Z2hmIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTk0MTc5NDUsImV4cCI6MjA3NDk5Mzk0NX0.cHEniHrQWvjUkCr8PT_WA4BxWDqTguqmw62_-XyhNR0` |
   | `VITE_SUPABASE_PROJECT_ID` | `kwkfmwgqwpaynawgtghf` |

5. **Deploy**: Click "Deploy"

### Option B: Vercel CLI

```bash
# Install Vercel CLI globally
npm install -g vercel

# Login to Vercel
vercel login

# Deploy (first time - will prompt for settings)
vercel

# For production deployment
vercel --prod
```

---

## Step 5: Configure Authentication Redirects

**CRITICAL**: Update your Lovable Cloud auth settings to include your Vercel URLs.

### Add Redirect URLs

In your Lovable project, add these redirect URLs to authentication settings:

```
https://your-project.vercel.app
https://your-project.vercel.app/**
https://your-custom-domain.com
https://your-custom-domain.com/**
```

### How to Add in Lovable:
1. Open your project in Lovable
2. Go to Cloud settings
3. Navigate to Authentication
4. Add the above URLs to "Redirect URLs"

---

## Step 6: Connect Custom Domain

### In Vercel Dashboard:

1. Go to your project → Settings → Domains
2. Click "Add Domain"
3. Enter your domain: `inphrone.com` or `app.inphrone.com`
4. Follow DNS configuration instructions

### DNS Configuration:

Add these records at your domain registrar:

**For Root Domain (inphrone.com):**
```
Type: A
Name: @
Value: 76.76.19.19
```

**For Subdomain (app.inphrone.com):**
```
Type: CNAME
Name: app
Value: cname.vercel-dns.com
```

### Update Auth Redirects:

After adding custom domain, update Lovable Cloud auth redirects:
```
https://inphrone.com
https://inphrone.com/**
https://app.inphrone.com
https://app.inphrone.com/**
```

---

## Step 7: Verify Deployment

### Checklist

- [ ] Website loads without errors
- [ ] User registration works
- [ ] User login works
- [ ] Opinion submission works
- [ ] Data persists after refresh
- [ ] Coupons load correctly
- [ ] Profile page loads
- [ ] Insights page shows data

### Test Commands

```bash
# Check build locally before pushing
npm run build

# Preview production build locally
npm run preview
```

---

## Continuous Deployment Workflow

After initial setup, your workflow becomes:

```
┌──────────────────────────────────────────────────────────┐
│                   DEVELOPMENT WORKFLOW                    │
├──────────────────────────────────────────────────────────┤
│                                                          │
│   1. Edit Code in VS Code                                │
│         │                                                │
│         ▼                                                │
│   2. Test Locally (npm run dev)                          │
│         │                                                │
│         ▼                                                │
│   3. Commit & Push to GitHub                             │
│         │                                                │
│         ▼                                                │
│   4. Vercel Auto-Deploys (triggered by push)             │
│         │                                                │
│         ▼                                                │
│   5. Live on Your Domain! 🚀                             │
│                                                          │
└──────────────────────────────────────────────────────────┘
```

### Git Commands for Updates

```bash
# Make changes in VS Code, then:
git add .
git commit -m "Your change description"
git push origin main

# Vercel automatically deploys!
```

---

## Troubleshooting

### Issue: "Failed to fetch" or API errors

**Solution**: Check environment variables in Vercel
```bash
# Verify env vars are set
vercel env ls
```

### Issue: Authentication not working

**Solution**: Ensure redirect URLs are configured
- Add your Vercel URL to Lovable Cloud auth settings
- Include both with and without trailing slash

### Issue: Build fails on Vercel

**Solution**: Check build logs
```bash
# Test build locally first
npm run build

# Check for TypeScript errors
npm run typecheck
```

### Issue: Data not loading

**Solution**: Verify Supabase URL and key
- Check VITE_SUPABASE_URL is correct
- Check VITE_SUPABASE_PUBLISHABLE_KEY is complete
- Ensure no trailing spaces in env vars

### Issue: Edge Functions not working

**Note**: Edge functions are deployed on Lovable Cloud, not Vercel. They work automatically as long as your environment variables are correct.

---

## Important Notes

### What Stays on Lovable Cloud (Backend)
- ✅ PostgreSQL Database
- ✅ User Authentication
- ✅ Edge Functions (API endpoints)
- ✅ File Storage (avatars, uploads)
- ✅ Real-time subscriptions
- ✅ RLS Policies & Security

### What Goes to Vercel (Frontend)
- ✅ React Application
- ✅ Static Assets (images, fonts)
- ✅ Client-side JavaScript
- ✅ CSS/Styling
- ✅ HTML

### Security Reminders
- ⚠️ Never commit `.env` files to GitHub
- ⚠️ Use `.env.local` for local development
- ⚠️ Set environment variables in Vercel dashboard
- ⚠️ The publishable key is safe for frontend (it's public by design)

---

## Quick Reference

### Your Lovable Cloud Credentials

```env
VITE_SUPABASE_URL=https://kwkfmwgqwpaynawgtghf.supabase.co
VITE_SUPABASE_PUBLISHABLE_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imt3a2Ztd2dxd3BheW5hd2d0Z2hmIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTk0MTc5NDUsImV4cCI6MjA3NDk5Mzk0NX0.cHEniHrQWvjUkCr8PT_WA4BxWDqTguqmw62_-XyhNR0
VITE_SUPABASE_PROJECT_ID=kwkfmwgqwpaynawgtghf
```

### Vercel CLI Commands

```bash
vercel              # Deploy to preview
vercel --prod       # Deploy to production
vercel env ls       # List environment variables
vercel logs         # View deployment logs
```

### Git Commands

```bash
git add .
git commit -m "message"
git push origin main
```

---

## Support

- **Lovable Docs**: [docs.lovable.dev](https://docs.lovable.dev)
- **Vercel Docs**: [vercel.com/docs](https://vercel.com/docs)
- **Inphrone Support**: support@inphrone.com

---

*Last Updated: January 2026*
*Version: 1.0*
