# Deploying Inphrone to Vercel

This guide explains how to deploy your Inphrone application to Vercel and how it connects to Lovable Cloud (Supabase backend) for database, authentication, and other backend services.

---

## 🌐 What is Vercel?

Vercel is a cloud platform for deploying and hosting web applications. It provides:

- **Fast global deployment** - Your app is served from edge locations worldwide
- **Automatic deployments** - Every Git push triggers a new deployment
- **Preview deployments** - Every pull request gets its own preview URL
- **Custom domains** - Connect your own domain name
- **Zero configuration** - Works out of the box with React/Vite projects

---

## 🔗 How Vercel Deployment Connects to Backend

### Architecture Overview

```
Vercel Deployment (Frontend)
    ↓
Static React Application
    ↓
Supabase JavaScript Client
    ↓
Lovable Cloud (Supabase Backend)
    ↓
Database, Auth, Storage, Edge Functions
```

### Key Points

1. **Frontend on Vercel**: Your React application (HTML, CSS, JavaScript) is hosted on Vercel's CDN
2. **Backend on Lovable Cloud**: Your database, authentication, and edge functions remain on Lovable Cloud (Supabase)
3. **Connection via API**: The frontend connects to backend using Supabase client library with environment variables
4. **Same Backend**: Whether deployed on Lovable, Vercel, or locally, the app uses the SAME backend

---

## 🚀 Deployment Methods

There are two ways to deploy to Vercel:

### Method 1: GitHub Integration (Recommended)
- Automatic deployments on every push
- Preview deployments for pull requests
- Easy rollback to previous versions

### Method 2: Vercel CLI
- Manual deployment from your computer
- Good for testing
- Requires running commands each time

We'll cover both methods below.

---

## 📋 Prerequisites

1. **Vercel Account** - Sign up at https://vercel.com (free tier available)
2. **GitHub Account** - Sign up at https://github.com (free)
3. **Git Installed** - Download from https://git-scm.com/
4. **Node.js Installed** - Download from https://nodejs.org/ (version 16+)

---

## 🔧 Method 1: Deploy via GitHub (Recommended)

### Step 1: Export Project to GitHub

If you haven't already:

1. In your Lovable project, click the **GitHub icon** (top right)
2. Click **"Export to GitHub"**
3. Authorize Lovable to access GitHub
4. Create a new repository (e.g., `inphrone`)
5. Wait for export to complete

### Step 2: Clone Repository (Optional - for local changes)

If you want to make changes locally:

```bash
# Clone your repository
git clone https://github.com/your-username/inphrone.git
cd inphrone

# Install dependencies
npm install
```

### Step 3: Create Vercel Account

1. Go to https://vercel.com
2. Click **"Sign Up"**
3. Choose **"Continue with GitHub"**
4. Authorize Vercel to access your GitHub account

### Step 4: Import Project to Vercel

1. Click **"Add New Project"** (or "New Project")
2. Find your `inphrone` repository in the list
3. Click **"Import"**

### Step 5: Configure Project Settings

Vercel will auto-detect your settings. Verify/update:

**Framework Preset:** `Vite`

**Build Command:** `npm run build`

**Output Directory:** `dist`

**Install Command:** `npm install`

### Step 6: Add Environment Variables

This is **CRITICAL** - your app needs these to connect to the backend:

1. Click **"Environment Variables"** section
2. Add these variables one by one:

```
Name: VITE_SUPABASE_URL
Value: https://kwkfmwgqwpaynawgtghf.supabase.co

Name: VITE_SUPABASE_PUBLISHABLE_KEY
Value: eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imt3a2Ztd2dxd3BheW5hd2d0Z2hmIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTk0MTc5NDUsImV4cCI6MjA3NDk5Mzk0NX0.cHEniHrQWvjUkCr8PT_WA4BxWDqTguqmw62_-XyhNR0

Name: VITE_SUPABASE_PROJECT_ID  
Value: kwkfmwgqwpaynawgtghf
```

**Important:**
- These values are from your Lovable Cloud project
- They connect your Vercel deployment to the same backend
- Without these, your app won't work

**Where to find these values:**
- In your Lovable project, they're in the `.env` file
- Or in Backend → Settings → API Keys in Lovable

### Step 7: Deploy

1. Click **"Deploy"**
2. Wait 1-3 minutes for deployment to complete
3. You'll see a success message with your deployment URL

**Your app is now live!** 🎉

The URL will look like: `https://inphrone-abc123.vercel.app`

---

## 🔄 Automatic Deployments

With GitHub integration, deployments are automatic:

### Production Deployments

Every push to your main branch automatically deploys to production:

```bash
git add .
git commit -m "Update homepage design"
git push origin main
```

Vercel detects the push and deploys automatically (1-3 minutes).

### Preview Deployments

Every pull request gets its own preview URL:

1. Create a new branch: `git checkout -b feature/new-design`
2. Make changes and push: `git push origin feature/new-design`
3. Create pull request on GitHub
4. Vercel comments on PR with preview URL
5. Test the preview
6. Merge to main to deploy to production

---

## 🖥️ Method 2: Deploy via Vercel CLI

For manual deployments from your computer:

### Step 1: Clone Project

```bash
git clone https://github.com/your-username/inphrone.git
cd inphrone
npm install
```

### Step 2: Install Vercel CLI

```bash
npm install -g vercel
```

### Step 3: Login to Vercel

```bash
vercel login
```

Follow prompts to authenticate.

### Step 4: Create `.env` File

Create a `.env` file in your project root:

```env
VITE_SUPABASE_URL=https://kwkfmwgqwpaynawgtghf.supabase.co
VITE_SUPABASE_PUBLISHABLE_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imt3a2Ztd2dxd3BheW5hd2d0Z2hmIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTk0MTc5NDUsImV4cCI6MjA3NDk5Mzk0NX0.cHEniHrQWvjUkCr8PT_WA4BxWDqTguqmw62_-XyhNR0
VITE_SUPABASE_PROJECT_ID=kwkfmwgqwpaynawgtghf
```

**IMPORTANT:** Add `.env` to your `.gitignore` file:

```bash
echo ".env" >> .gitignore
```

Never commit secrets to Git!

### Step 5: Deploy

```bash
vercel
```

Follow the prompts:
- **Set up and deploy?** Yes
- **Link to existing project?** No (first time) or Yes (subsequent)
- **Project name?** inphrone (or press Enter)
- **Directory?** Press Enter (current directory)

The CLI will:
1. Build your app
2. Upload files to Vercel
3. Provide a deployment URL

### Step 6: Add Environment Variables

After first deployment:

```bash
vercel env add VITE_SUPABASE_URL
vercel env add VITE_SUPABASE_PUBLISHABLE_KEY
vercel env add VITE_SUPABASE_PROJECT_ID
```

Paste the values when prompted.

### Step 7: Redeploy with Environment Variables

```bash
vercel --prod
```

Your app is now live with proper environment variables!

---

## 🔐 How Backend Connection Works

### Database Connection

```typescript
// In your code (src/integrations/supabase/client.ts)
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseKey = import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY;

export const supabase = createClient(supabaseUrl, supabaseKey);
```

**What happens:**
1. Vercel builds your app and injects environment variables
2. The Supabase client is created with your Lovable Cloud credentials
3. All database queries go directly to your Lovable Cloud database
4. Row Level Security (RLS) policies apply as normal

### Authentication

User authentication works identically to Lovable:

```typescript
// Login
const { data, error } = await supabase.auth.signInWithPassword({
  email: 'user@example.com',
  password: 'password123'
});

// Session is stored in browser
// All authenticated requests include session token
```

**Important:**
- User sessions are stored in browser localStorage
- Authentication tokens are validated by Lovable Cloud
- RLS policies check `auth.uid()` as normal

### Edge Functions

Edge functions remain on Lovable Cloud:

```typescript
// Call edge function
const { data, error } = await supabase.functions.invoke('send-feedback', {
  body: { message: 'Great app!' }
});
```

**What happens:**
1. Frontend on Vercel makes request
2. Request goes to Lovable Cloud edge function
3. Edge function processes request
4. Response returns to Vercel frontend

### Real-time Subscriptions

Real-time features work the same:

```typescript
// Subscribe to changes
const subscription = supabase
  .channel('opinions')
  .on('postgres_changes', {
    event: '*',
    schema: 'public',
    table: 'opinions'
  }, (payload) => {
    console.log('Change received!', payload);
  })
  .subscribe();
```

WebSocket connection is established between Vercel frontend and Lovable Cloud.

---

## 🌐 Custom Domain Setup

### Add Custom Domain

1. Go to your project on Vercel dashboard
2. Click **"Settings"** → **"Domains"**
3. Enter your domain (e.g., `inphrone.com`)
4. Click **"Add"**

### Configure DNS

Vercel will show you DNS records to add:

**For root domain (inphrone.com):**
```
Type: A
Name: @
Value: 76.76.21.21
```

**For subdomain (www.inphrone.com):**
```
Type: CNAME
Name: www
Value: cname.vercel-dns.com
```

**Where to add DNS records:**
- Go to your domain registrar (GoDaddy, Namecheap, Cloudflare, etc.)
- Find DNS settings
- Add the records shown by Vercel
- Wait 24-48 hours for DNS propagation

### SSL Certificate

Vercel automatically provisions SSL certificates:
- Free SSL via Let's Encrypt
- Automatic renewal
- HTTPS enabled by default

---

## 🔄 Making Changes After Deployment

### Via Lovable (Easiest)

1. Make changes in Lovable editor
2. Click **"Publish"** button (this updates GitHub)
3. Vercel detects GitHub update
4. Automatic deployment happens (1-3 minutes)

### Via Local Development

1. Clone repository (if not already): `git clone https://github.com/your-username/inphrone.git`
2. Make changes in your code editor
3. Test locally: `npm run dev`
4. Commit changes: `git commit -am "Your message"`
5. Push to GitHub: `git push origin main`
6. Vercel automatically deploys

### Via Vercel CLI

1. Make changes locally
2. Run `vercel --prod`
3. Changes deploy immediately

---

## 📊 Monitoring Your Deployment

### Vercel Dashboard

Access at https://vercel.com/dashboard

**Features:**
- View deployment history
- Check build logs
- Monitor analytics (page views, performance)
- Manage environment variables
- View domain settings

### Build Logs

If deployment fails:
1. Go to Vercel dashboard
2. Click on failed deployment
3. Click **"View Build Logs"**
4. Read error messages
5. Fix issues in code
6. Redeploy

### Analytics

Vercel provides basic analytics:
- Page views
- Top pages
- Countries
- Devices

For more detailed analytics, consider:
- Google Analytics
- Mixpanel  
- PostHog

---

## ⚠️ Important Considerations

### Environment Variables Security

**DO:**
- ✅ Use environment variables for all secrets
- ✅ Add `.env` to `.gitignore`
- ✅ Use different keys for development/production (if possible)
- ✅ Rotate keys if exposed

**DON'T:**
- ❌ Commit `.env` file to Git
- ❌ Share environment variables publicly
- ❌ Use production keys in development

### Database Security

Your database security is managed by Lovable Cloud:

- **Row Level Security (RLS)** must be enabled on all tables
- **Authentication** is required for sensitive data
- **API keys** in environment variables are public (safe for client-side)
- **Service role key** is SECRET - never expose in frontend

### Performance Optimization

1. **Images**: Use optimized formats (WebP, AVIF)
2. **Bundle Size**: Run `npm run build` and check `dist` folder size
3. **Lazy Loading**: Use React lazy loading for large components
4. **Caching**: Vercel automatically caches static assets

---

## 🐛 Troubleshooting

### "Build Failed" on Vercel

**Check build logs:**
- Go to deployment on Vercel dashboard
- Click "View Build Logs"
- Look for error messages

**Common causes:**
- TypeScript errors
- Missing dependencies
- Failed tests
- Build command incorrect

**Fix:**
- Fix errors shown in logs
- Commit and push again
- Or redeploy via CLI

### "Application Error" in Browser

**Check browser console:**
- Open DevTools (F12)
- Look for error messages

**Common causes:**
- Missing environment variables
- Incorrect Supabase URL/key
- CORS issues
- Database RLS policy blocking requests

**Fix:**
- Verify environment variables in Vercel settings
- Check they match your Lovable Cloud project
- Redeploy after adding/updating variables

### Database Not Connecting

**Symptoms:**
- Blank pages
- "Failed to fetch" errors
- Authentication doesn't work

**Solution:**
1. Go to Vercel dashboard → Project → Settings → Environment Variables
2. Verify these exist and are correct:
   - `VITE_SUPABASE_URL`
   - `VITE_SUPABASE_PUBLISHABLE_KEY`
   - `VITE_SUPABASE_PROJECT_ID`
3. If missing or incorrect, add/update them
4. Redeploy the project

### Custom Domain Not Working

**Check DNS propagation:**
- Use https://dnschecker.org
- Enter your domain
- Verify DNS records have propagated

**Verify SSL certificate:**
- Wait 24 hours after adding domain
- Vercel auto-provisions SSL
- Check in Vercel dashboard → Domains

### Changes Not Showing

**Clear cache:**
- Hard refresh browser (Ctrl+Shift+R or Cmd+Shift+R)
- Clear browser cache
- Try incognito/private window

**Check deployment:**
- Go to Vercel dashboard
- Verify latest deployment is successful
- Check "Last Commit" matches your changes

---

## 📈 Best Practices

### Version Control

- Commit frequently with clear messages
- Use branches for new features
- Create pull requests for review
- Keep main branch deployable

### Environment Management

- Use preview deployments for testing
- Test thoroughly before merging to main
- Keep production environment variables secure

### Monitoring

- Check Vercel analytics regularly
- Monitor error logs
- Set up error tracking (Sentry, LogRocket)

### Backups

Your data is safe because:
- Database is on Lovable Cloud (automatically backed up)
- Code is on GitHub (version controlled)
- Vercel keeps deployment history

---

## 🆘 Getting Help

### Resources

- **Vercel Documentation**: https://vercel.com/docs
- **Vercel Support**: https://vercel.com/support
- **Supabase Docs**: https://supabase.com/docs
- **GitHub Docs**: https://docs.github.com

### Community

- **Vercel Discord**: https://vercel.com/discord
- **Supabase Discord**: https://discord.supabase.com
- **Stack Overflow**: Tag with `vercel`, `supabase`, `react`

---

## 🎯 Summary

### Deployment Flow

```
Code Change
    ↓
Push to GitHub
    ↓
Vercel Detects Change
    ↓
Build & Deploy (1-3 min)
    ↓
Live on Internet
    ↓
Connects to Lovable Cloud Backend
    ↓
Everything Works! 🎉
```

### Key Points

✅ **Frontend on Vercel**: React app hosted globally  
✅ **Backend on Lovable Cloud**: Database, auth, edge functions  
✅ **Environment Variables**: Connect frontend to backend  
✅ **Automatic Deployments**: Every push deploys  
✅ **Same Backend**: Whether on Lovable, Vercel, or mobile  
✅ **Custom Domain**: Add your own domain easily  
✅ **Free Tier Available**: Vercel and Lovable Cloud both have free tiers

---

## 🎉 Congratulations!

You now understand how to:
- Deploy your Inphrone app to Vercel
- Connect Vercel deployment to Lovable Cloud backend  
- Manage environment variables
- Set up automatic deployments
- Add custom domains
- Troubleshoot common issues

Your app is now accessible worldwide with the same backend as your Lovable project!

**Questions?** Open an issue on GitHub or contact support.
