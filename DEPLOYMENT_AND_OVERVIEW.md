# InPhrone - Entertainment Insights Platform

## 📋 Project Overview

**InPhrone** is a comprehensive entertainment insights and opinion-sharing platform that connects audiences with content creators, studios, OTT platforms, and entertainment industry professionals. The application enables users to share opinions about entertainment content, earn rewards, and access valuable industry insights.

### Core Value Proposition
- **For Audiences**: Share opinions on entertainment content, earn reward coupons, and connect with like-minded users
- **For Creators**: Access real-time audience insights, understand content preferences, and make data-driven decisions
- **For Studios/OTT**: Gather authentic audience feedback, identify trends, and optimize content strategies

## 🎯 Key Features

### 1. **Multi-User Type System**
- **Audience Members**: Share opinions, earn rewards, view insights
- **Content Creators**: Access analytics, view demographic data
- **Studios/Production Houses**: Industry-level insights, trend analysis
- **OTT Platforms**: Content performance metrics
- **Music Labels**: Genre preferences, artist insights
- **Gaming Companies**: Gaming content feedback
- **TV Networks**: Broadcasting insights

### 2. **Opinion Submission & Tracking**
- Category-based opinion forms (Film, TV, OTT, Music, Gaming, Social Media, YouTube)
- Rich opinion data collection (title, description, genre, budget estimates, target audience)
- Opinion upvoting system (non-audience users can upvote)
- View tracking and viewer analytics
- Weekly opinion statistics

### 3. **Reward System**
- **Location-Aware Coupons**: Coupons display in user's local currency based on their country
- **Multiple Coupon Categories**: Entertainment, Electronics, Food, Fashion, Travel
- **Coupon Management**: Track active, used, and expired coupons
- **Detailed Coupon Information**:
  - Merchant name and website link
  - Coupon code for easy copying
  - Usage instructions for each coupon
  - Currency-specific pricing (USD, INR, GBP, EUR, AUD, CAD)
  - Expiration tracking with "expiring soon" alerts
- **Coupon Sharing**: Share coupons with friends via email
- **Analytics Tracking**: Monitor coupon usage, copies, and shares

### 4. **Gamification System**
- **Streak Tracking**: Weekly contribution streaks with tier progression
- **Badge System**: Earn badges for various achievements
- **Creative Soul Avatar**: Personalized avatar that evolves with contributions
- **Cultural Energy Map**: Visualize opinion trends by location
- **Wisdom Badges**: Recognition for expertise in different categories

### 5. **Insights & Analytics**
- Global insights overview with trend analysis
- Category-specific insights dashboards
- Demographic analytics (age, gender, location breakdowns)
- Weekly content type analytics
- Opinion upvote breakdown by user type
- Time-spent tracking on different pages

### 6. **InphroSync - Daily Entertainment Pulse** 🌟 NEW!
The flagship feature designed for maximum daily engagement:
- **Interactive Swipeable Cards**: Tinder-style interface for answering 3 daily questions
- **Real-time Community Insights**: Live stats with demographic filtering (age, gender, location)
- **Gamified Experience**: 
  - Confetti celebrations on selection
  - Progress indicators and dots
  - Smooth animations and transitions
  - Visual feedback for every interaction
- **Streak Building**: Encourages daily return with achievement system
- **Premium UI/UX**: Cinematic design with glass morphism and gradients
- **Mobile-First**: Touch-optimized swipe gestures
- **Results View**: Beautiful bar charts showing community preferences
- **Admin Controls**: Manage questions and options from admin panel

**How it works:**
1. Users answer 3 questions about yesterday's entertainment
2. Each question shows options in a swipeable card format
3. Swipe right to select, left to skip
4. Tap to select for quick responses
5. Instant celebration feedback with confetti
6. View live community results with filtering
7. Build daily streaks for rewards

### 7. **Social Features**
- Share opinions and profile publicly
- View other users' opinions
- Notification system for upvotes and interactions
- Weekly digest emails
- Profile activity analysis

### 8. **Authentication & Profile Management**
- Email/password authentication
- Google sign-in integration
- Comprehensive user profiles with location data
- Account deletion with 7-day grace period
- Profile restoration capability

## 🏗️ Technical Architecture

### Frontend Stack
- **React 18** with TypeScript
- **Vite** for build tooling
- **React Router** for navigation
- **TanStack Query** for data fetching and caching
- **Framer Motion** for animations
- **Tailwind CSS** with custom design system
- **Shadcn/ui** component library
- **Recharts** for data visualization

### Backend (Lovable Cloud / Supabase)
- **PostgreSQL Database** with RLS (Row Level Security)
- **Authentication**: Email/password + Google OAuth
- **Edge Functions**: Serverless functions for business logic
- **Real-time Subscriptions** for live updates
- **Storage**: File uploads and management

### Database Schema Highlights
- **profiles**: User information with location data
- **opinions**: User-submitted content opinions
- **coupons**: Reward coupons with detailed merchant information
- **coupon_analytics**: Tracking coupon interactions
- **coupon_wishlist**: User wishlist for specific coupons
- **rewards**: Gamification points and levels
- **user_badges**: Achievement tracking
- **user_streaks**: Weekly contribution tracking
- **notifications**: In-app notification system
- **opinion_upvotes**: Voting system
- **opinion_views**: View tracking
- **weekly_stats**: Aggregated weekly data
- **cultural_energy_map**: Location-based trend data

### Edge Functions
1. **fetch-cuelinks-coupons**: 
   - Fetches location-specific coupons
   - Handles currency conversion
   - Provides fallback coupons when API unavailable
2. **send-weekly-digest**: Email digest functionality
3. **inphrone-chat**: AI chatbot integration
4. **soft-delete-account**: Account deletion with grace period
5. **delete-account**: Permanent account deletion

## 🎨 Design System

The application uses a comprehensive design system with:
- **Semantic color tokens** (primary, secondary, accent, muted)
- **Dark/Light mode support**
- **Responsive breakpoints** for all screen sizes
- **Custom animations** and transitions
- **Accessible components** following WCAG guidelines

## 📊 My Opinion on This Application

### ✅ Strengths

1. **Comprehensive Feature Set**: The application covers a wide range of functionality from opinion sharing to rewards, gamification, and analytics.

2. **Well-Structured Codebase**: 
   - Clear component organization
   - Proper separation of concerns
   - Reusable UI components
   - Type-safe with TypeScript

3. **Robust Database Design**: 
   - Proper RLS policies for security
   - Well-normalized schema
   - Good use of foreign keys and relationships

4. **User Experience**:
   - Smooth animations and transitions
   - Responsive design
   - Clear information hierarchy
   - Helpful feedback (toasts, loading states)

5. **Location-Aware Coupon System**:
   - Currency localization
   - Detailed usage instructions
   - Merchant links for easy redemption
   - Comprehensive tracking

### ⚠️ Areas for Improvement

1. **API Integration**: The Cuelinks API integration has connectivity issues. Consider:
   - Implementing retry logic with exponential backoff
   - Caching successful API responses
   - Better error handling and user communication
   - Alternative coupon providers as backup

2. **Performance Optimization**:
   - Implement virtual scrolling for long lists
   - Code splitting for faster initial load
   - Image optimization and lazy loading
   - Reduce bundle size with tree-shaking

3. **Analytics Enhancement**:
   - Add more detailed user journey tracking
   - Implement conversion funnels
   - A/B testing framework
   - Better insight visualization

4. **Mobile Experience**:
   - Consider a progressive web app (PWA) approach
   - Optimize touch interactions
   - Improve mobile navigation
   - Add offline functionality

5. **Security Enhancements**:
   - Implement rate limiting on edge functions
   - Add CAPTCHA for sensitive operations
   - Enhance password requirements (currently showing a warning)
   - Add two-factor authentication option

6. **Testing**:
   - Add unit tests for critical functions
   - Integration tests for user flows
   - E2E tests for key scenarios
   - Performance testing

### 🚀 Recommended Next Steps

1. **Short-term (1-2 weeks)**:
   - Fix password strength requirements (warning from linter)
   - Improve error messages for better UX
   - Add loading skeletons for better perceived performance
   - Implement retry logic for API failures

2. **Medium-term (1-2 months)**:
   - Build comprehensive admin dashboard
   - Add email verification flow
   - Implement push notifications
   - Create mobile app with React Native
   - Add social media sharing with Open Graph tags

3. **Long-term (3-6 months)**:
   - Machine learning for personalized recommendations
   - Advanced analytics with predictive insights
   - Partnership integrations with actual brands
   - Monetization strategy (premium features, affiliate commissions)
   - Multi-language support

## 🚀 Deploying to Vercel

### Prerequisites
1. A Vercel account (free tier available)
2. Git repository with your code
3. Node.js 18+ installed locally

### Step-by-Step Deployment

#### Option 1: Deploy via Vercel Dashboard (Recommended)

1. **Push Code to GitHub**
   ```bash
   git init
   git add .
   git commit -m "Initial commit"
   git remote add origin YOUR_GITHUB_REPO_URL
   git push -u origin main
   ```

2. **Import to Vercel**
   - Go to [vercel.com](https://vercel.com)
   - Click "Add New Project"
   - Import your GitHub repository
   - Vercel will auto-detect it's a Vite project

3. **Configure Environment Variables**
   Add these from your `.env` file:
   ```
   VITE_SUPABASE_URL=https://kwkfmwgqwpaynawgtghf.supabase.co
   VITE_SUPABASE_PUBLISHABLE_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
   VITE_SUPABASE_PROJECT_ID=kwkfmwgqwpaynawgtghf
   ```

4. **Deploy**
   - Click "Deploy"
   - Wait for build to complete (2-3 minutes)
   - Your app will be live at `your-project.vercel.app`

#### Option 2: Deploy via Vercel CLI

1. **Install Vercel CLI**
   ```bash
   npm install -g vercel
   ```

2. **Login to Vercel**
   ```bash
   vercel login
   ```

3. **Deploy**
   ```bash
   vercel
   ```
   - Follow the prompts
   - Add environment variables when asked

### 🔗 Connecting to Lovable Cloud Backend

**Important**: The Lovable Cloud (Supabase) backend is **already configured** and will work automatically once you deploy with the correct environment variables.

#### What Happens Automatically

1. **Database Connection**: The frontend connects to the Supabase database using the credentials in your environment variables
2. **Authentication**: User auth works out of the box
3. **Edge Functions**: All serverless functions are already deployed and accessible
4. **Storage**: File storage is connected and working

#### Post-Deployment Configuration

1. **Update Supabase Auth Redirect URLs**
   - In the Lovable project, go to your Supabase settings
   - Add your Vercel deployment URL to the allowed redirect URLs:
     ```
     https://your-project.vercel.app
     https://your-project.vercel.app/**
     ```

2. **Test the Connection**
   - Visit your deployed app
   - Try signing up/logging in
   - Submit an opinion to test database writes
   - Check if coupons load correctly

### 🔒 Important Security Notes

1. **Environment Variables**: 
   - NEVER commit `.env` file to Git
   - Only use `VITE_SUPABASE_PUBLISHABLE_KEY` (anon key) in frontend
   - Keep service role key secret (only use in edge functions)

2. **CORS Configuration**:
   - Already configured in edge functions
   - Vercel domain automatically allowed

3. **RLS Policies**:
   - All database tables have Row Level Security enabled
   - Users can only access their own data
   - Public data has appropriate read policies

### 📦 Build Configuration

The application is already configured for Vercel:
- Build command: `npm run build` (or `bun run build`)
- Output directory: `dist`
- Install command: Auto-detected
- Framework: Vite

### 🌍 Custom Domain Setup

1. **Add Domain in Vercel**
   - Go to your project settings
   - Click "Domains"
   - Add your custom domain
   - Follow DNS configuration instructions

2. **Update Supabase**
   - Add custom domain to Supabase auth redirect URLs

### 🐛 Troubleshooting

**Issue**: "Failed to load coupons"
- **Solution**: Check edge function logs in Lovable Cloud dashboard

**Issue**: "Authentication not working"
- **Solution**: Verify redirect URLs in Supabase settings match your Vercel domain

**Issue**: "Database connection failed"
- **Solution**: Verify environment variables are correctly set in Vercel

**Issue**: "Build failed"
- **Solution**: Check build logs, ensure all dependencies are in `package.json`

### 📊 Monitoring

After deployment:
- Use Vercel Analytics for frontend performance
- Check Lovable Cloud dashboard for backend metrics
- Monitor edge function logs for errors
- Set up error tracking (consider Sentry integration)

### 🔄 Continuous Deployment

Vercel automatically deploys:
- **Production**: Every push to `main` branch
- **Preview**: Every pull request gets a preview URL

To customize:
1. Go to project settings in Vercel
2. Configure branch settings
3. Set up deployment protection if needed

### 💰 Cost Considerations

- **Vercel**: Free tier includes:
  - Unlimited deployments
  - 100 GB bandwidth/month
  - Automatic SSL

- **Lovable Cloud**: Included with Lovable subscription
  - Database hosting
  - Edge functions
  - Authentication
  - Storage

### 🎯 Performance Optimization

1. **Enable Vercel Analytics** (free)
2. **Configure caching headers** in `vercel.json`:
   ```json
   {
     "headers": [
       {
         "source": "/assets/(.*)",
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

3. **Enable compression** (automatic in Vercel)
4. **Use CDN** (automatic with Vercel)

## 📝 Development Workflow

```bash
# Clone from GitHub
git clone YOUR_REPO_URL
cd inphrone

# Install dependencies
npm install
# or
bun install

# Copy environment variables
cp .env.example .env
# Fill in your Supabase credentials

# Run development server
npm run dev
# or
bun dev

# Build for production
npm run build
# or
bun build

# Preview production build
npm run preview
```

## 🤝 Support

- **Frontend Issues**: Check browser console and network tab
- **Backend Issues**: Check Lovable Cloud dashboard logs
- **Deployment Issues**: Check Vercel deployment logs

## 📚 Additional Resources

- [Vercel Documentation](https://vercel.com/docs)
- [Lovable Documentation](https://docs.lovable.dev)
- [Supabase Documentation](https://supabase.com/docs)
- [React Documentation](https://react.dev)
- [Tailwind CSS](https://tailwindcss.com)

---

**Note**: This is a living document. As the application evolves, this README should be updated to reflect new features, improvements, and deployment procedures.
