# Deploying INPHRONE to Vercel with Lovable Cloud

This guide explains how to deploy your INPHRONE application to Vercel while maintaining connectivity to your Lovable Cloud (Supabase) backend.

## Understanding the Architecture

Your INPHRONE project has two main components:

1. **Frontend Application (React + Vite)**
   - User interface built with React
   - Runs in the browser
   - Can be deployed anywhere (Vercel, Netlify, etc.)

2. **Backend (Lovable Cloud / Supabase)**
   - Database, authentication, storage, and edge functions
   - Managed by Lovable
   - Remains on Lovable's infrastructure

## How Cloud Connection Works

The connection between your deployed frontend and Lovable Cloud backend works through **environment variables**:

- `VITE_SUPABASE_URL`: The URL of your Supabase project
- `VITE_SUPABASE_PUBLISHABLE_KEY`: Public API key for client-side authentication

These are already configured in your `.env` file and are automatically available in your Lovable project.

## Step-by-Step Deployment to Vercel

### 1. Download Your Project

Click "Export" in Lovable to download your project as a ZIP file, or use Git to clone your repository.

### 2. Extract and Prepare

```bash
# Extract the ZIP file
unzip inphrone-project.zip
cd inphrone-project

# Install dependencies (if not already installed)
npm install
```

### 3. Connect to Vercel

**Option A: Using Vercel CLI**

```bash
# Install Vercel CLI globally
npm install -g vercel

# Login to Vercel
vercel login

# Deploy to Vercel
vercel

# Follow the prompts:
# - Select your account
# - Link to existing project or create new
# - Accept default settings
```

**Option B: Using Vercel Dashboard**

1. Go to [vercel.com](https://vercel.com) and sign in
2. Click "Add New" → "Project"
3. Import your Git repository (GitHub, GitLab, Bitbucket)
4. Vercel will auto-detect the framework (Vite)

### 4. Configure Environment Variables in Vercel

**CRITICAL STEP:** You must add your Supabase credentials as environment variables in Vercel.

**In Vercel Dashboard:**

1. Go to your project settings
2. Navigate to "Environment Variables"
3. Add the following variables:

```
VITE_SUPABASE_URL = https://kwkfmwgqwpaynawgtghf.supabase.co
VITE_SUPABASE_PUBLISHABLE_KEY = eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imt3a2Ztd2dxd3BheW5hd2d0Z2hmIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTk0MTc5NDUsImV4cCI6MjA3NDk5Mzk0NX0.cHEniHrQWvjUkCr8PT_WA4BxWDqTguqmw62_-XyhNR0
VITE_SUPABASE_PROJECT_ID = kwkfmwgqwpaynawgtghf
```

**Important:** 
- Ensure these are marked for "Production", "Preview", and "Development" environments
- Click "Save" after adding each variable

**In Vercel CLI:**

```bash
vercel env add VITE_SUPABASE_URL
# Paste the URL when prompted

vercel env add VITE_SUPABASE_PUBLISHABLE_KEY
# Paste the key when prompted

vercel env add VITE_SUPABASE_PROJECT_ID
# Paste the project ID when prompted
```

### 5. Configure Build Settings

Vercel should auto-detect these, but verify:

```
Framework Preset: Vite
Build Command: npm run build
Output Directory: dist
Install Command: npm install
```

### 6. Deploy

Click "Deploy" in Vercel dashboard, or run:

```bash
vercel --prod
```

### 7. Configure Supabase Auth Redirect URLs

After deployment, you need to add your Vercel URL to Supabase's allowed redirect URLs:

1. Open your Lovable project
2. Go to Backend (click "View Backend" in settings)
3. Navigate to Authentication → URL Configuration
4. Add your Vercel URLs to "Redirect URLs":
   ```
   https://your-project.vercel.app/**
   https://your-project-*.vercel.app/**
   ```

## Making Changes After Deployment

### Option 1: Edit in Lovable, Deploy to Vercel

1. Make changes in Lovable
2. Export/download the updated project
3. Push changes to your Git repository
4. Vercel automatically redeploys

### Option 2: Edit Locally, Deploy to Vercel

1. Clone/download your project
2. Make changes locally
3. Test with `npm run dev`
4. Commit and push to Git
5. Vercel automatically redeploys

**Note:** Both options connect to the same Lovable Cloud backend, so your database, auth, and edge functions remain consistent.

## Custom Domain Setup

### In Vercel:

1. Go to your project → Settings → Domains
2. Add your custom domain (e.g., `inphrone.com`)
3. Follow DNS configuration instructions
4. Vercel handles SSL certificates automatically

### In Supabase:

After adding a custom domain, update Supabase redirect URLs:

1. Go to Backend → Authentication → URL Configuration
2. Add your custom domain to redirect URLs:
   ```
   https://inphrone.com/**
   https://www.inphrone.com/**
   ```

## Understanding Database & Backend Persistence

### Your Backend is ALWAYS on Lovable Cloud

- **Database**: All tables, data, RLS policies remain on Supabase
- **Authentication**: User accounts, sessions managed by Supabase Auth
- **Storage**: Files stored in Supabase Storage buckets
- **Edge Functions**: Backend logic runs on Supabase Edge Functions

### What Happens When You Deploy to Vercel?

- **Only the frontend code** is deployed to Vercel
- Your React app makes API calls to Lovable Cloud (Supabase)
- Database connection is established through environment variables
- No data is duplicated or moved

### Example Flow:

```
User Browser → Vercel (Frontend) → Lovable Cloud (Backend/Database)
```

1. User visits `your-app.vercel.app`
2. Frontend loads from Vercel servers
3. User signs in → Request goes to Supabase Auth
4. User submits opinion → Saved to Supabase Database
5. All data persists in Lovable Cloud

## Continuous Deployment Workflow

### Recommended Git Workflow:

1. **Main Branch** → Production (auto-deploys to Vercel)
2. **Development Branch** → Preview deployments
3. **Feature Branches** → Individual feature previews

```bash
# Create feature branch
git checkout -b feature/new-feature

# Make changes and commit
git add .
git commit -m "Add new feature"

# Push to create preview deployment
git push origin feature/new-feature

# Merge to main for production deployment
git checkout main
git merge feature/new-feature
git push origin main
```

## Troubleshooting

### Frontend Shows but Data Doesn't Load

**Problem:** Environment variables not set correctly

**Solution:**
1. Check Vercel Environment Variables
2. Ensure variables start with `VITE_`
3. Redeploy after adding variables

### Authentication Errors

**Problem:** Redirect URL mismatch

**Solution:**
1. Check Supabase Auth → URL Configuration
2. Add all Vercel URLs (including preview deployments)
3. Clear browser cache and try again

### Build Fails on Vercel

**Problem:** Missing dependencies or build errors

**Solution:**
1. Check build logs in Vercel dashboard
2. Test build locally: `npm run build`
3. Ensure all dependencies in `package.json`

### Database Connection Issues

**Problem:** API calls fail with CORS or authentication errors

**Solution:**
1. Verify `VITE_SUPABASE_URL` and `VITE_SUPABASE_PUBLISHABLE_KEY`
2. Check browser console for specific error messages
3. Ensure RLS policies allow access from authenticated users

## Security Considerations

### Environment Variables

- **NEVER** commit `.env` files to Git
- Always use Vercel's environment variable system
- Rotate keys if accidentally exposed

### API Keys

- The `VITE_SUPABASE_PUBLISHABLE_KEY` is safe to expose (public)
- **NEVER** expose `SUPABASE_SERVICE_ROLE_KEY` in frontend code
- Service role key should only be in edge functions (server-side)

## Performance Optimization

### Edge Network Benefits

- Vercel CDN caches static assets globally
- Fast page loads worldwide
- Supabase provides global database access

### Recommended Settings

```json
// vercel.json
{
  "headers": [
    {
      "source": "/(.*)",
      "headers": [
        {
          "key": "Cache-Control",
          "value": "public, max-age=31536000, immutable"
        }
      ]
    }
  ]
}
```

## Monitoring & Analytics

### Vercel Analytics

Enable in project settings for:
- Page load metrics
- User analytics
- Performance insights

### Supabase Monitoring

Access in Lovable Backend:
- Database queries and performance
- Auth events and user activity
- Edge function logs

## Cost Considerations

### Vercel Pricing

- **Free Tier**: 
  - 100GB bandwidth/month
  - Unlimited preview deployments
  - Custom domains
- **Pro**: $20/month for more bandwidth

### Lovable Cloud (Supabase)

- Included with Lovable subscription
- No separate Supabase account needed
- Managed automatically

## Getting Help

### Vercel Support

- [Vercel Documentation](https://vercel.com/docs)
- [Community Discord](https://discord.gg/vercel)

### Lovable Support

- In-app chat support
- [Lovable Documentation](https://docs.lovable.dev)

### Supabase Resources

- [Supabase Docs](https://supabase.com/docs)
- Focus on client library usage, not project setup

---

## Quick Reference

```bash
# Deploy to Vercel
vercel

# Deploy to production
vercel --prod

# View deployment logs
vercel logs

# Set environment variable
vercel env add VARIABLE_NAME

# Pull latest deployment
vercel pull
```

**Remember:** Your backend (database, auth, edge functions) always runs on Lovable Cloud. Only your frontend is deployed to Vercel. This separation provides flexibility, scalability, and ease of management.
