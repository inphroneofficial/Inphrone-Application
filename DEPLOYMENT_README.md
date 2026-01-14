# Inphrone - Beta Launch Documentation

## 🎯 Application Overview

**Inphrone** is a platform that connects audience preferences with content creators, studios, and entertainment industry professionals. It provides real-time insights into what audiences want to watch, helping creators make data-driven decisions.

### Key Features
- **Opinion Sharing**: Audience members share opinions on content they'd like to see
- **Professional Insights**: Creators/Studios/OTT access demographic analytics and trends
- **View Tracking**: Opinions track who viewed them with detailed breakdowns
- **Gamification**: Badges, streaks, and rewards encourage engagement
- **Reviews & Feedback**: Users can review the platform and provide feedback

---

## 🔧 Technical Stack

### Frontend
- **Framework**: React 18.3 with TypeScript
- **Build Tool**: Vite
- **Styling**: Tailwind CSS with custom design system
- **UI Components**: Shadcn/ui (Radix UI primitives)
- **State Management**: React hooks + TanStack Query
- **Routing**: React Router v6
- **Animations**: Custom CSS animations + Framer Motion

### Backend (Lovable Cloud)
- **Database**: PostgreSQL (Supabase)
- **Authentication**: Supabase Auth (Email/Password, OAuth)
- **Realtime**: Supabase Realtime subscriptions
- **Edge Functions**: Deno-based serverless functions
- **Storage**: Supabase Storage (if needed)

### Email
- **Provider**: Resend.com
- **Purpose**: Feedback notifications to inphrone@gmail.com

---

## 📁 Project Structure

```
inphrone/
├── public/              # Static assets
│   ├── pwa-192x192.png
│   ├── pwa-512x512.png
│   └── robots.txt
├── src/
│   ├── assets/          # Images, icons
│   ├── components/      # Reusable UI components
│   │   ├── ui/          # Shadcn components
│   │   ├── opinions/    # Opinion-related components
│   │   ├── profile/     # Profile components
│   │   ├── gamification/# Badges, avatars, streaks
│   │   └── rewards/     # Reward dialogs
│   ├── hooks/           # Custom React hooks
│   ├── integrations/    # Supabase client & types
│   ├── lib/             # Utility functions
│   ├── pages/           # Route pages
│   ├── App.tsx          # Root component with routes
│   ├── main.tsx         # Application entry point
│   └── index.css        # Global styles + design system
├── supabase/
│   ├── functions/       # Edge functions
│   │   ├── delete-account/
│   │   ├── send-feedback/
│   │   └── send-weekly-digest/
│   ├── migrations/      # Database migrations
│   └── config.toml      # Supabase configuration
└── Documentation files
```

---

## 🗄️ Database Schema

### Core Tables
- **profiles**: User profiles (linked to auth.users)
- **opinions**: User-submitted opinions on content
- **opinion_views**: Tracks who viewed which opinions
- **opinion_upvotes**: Likes on opinions with user type
- **reviews**: Platform reviews from users
- **notifications**: In-app notifications

### User Type Tables
- **audience_profiles**: Extended data for audience users
- **creator_profiles**: Extended data for creators
- **studio_profiles**: Extended data for studios/production
- **ott_profiles**: Extended data for OTT platforms
- **tv_profiles**: Extended data for TV networks
- **music_profiles**: Extended data for music industry
- **gaming_profiles**: Extended data for game developers

### Gamification Tables
- **rewards**: Points and levels
- **user_badges**: Achievement badges
- **user_streaks**: Weekly participation streaks
- **coupons**: Reward coupons for users

### Analytics Tables
- **weekly_stats**: Aggregated weekly statistics
- **user_activity_logs**: Time tracking per page
- **cultural_energy_map**: Geographic trends

---

## 🔐 Environment Variables

The following environment variables are auto-configured by Lovable Cloud:

```bash
VITE_SUPABASE_URL=https://kwkfmwgqwpaynawgtghf.supabase.co
VITE_SUPABASE_PUBLISHABLE_KEY=eyJhbGci...
VITE_SUPABASE_PROJECT_ID=kwkfmwgqwpaynawgtghf
```

### Required Secrets (Backend)
Configure these in Backend → Secrets:

- **RESEND_API_KEY**: Required for sending feedback emails
  - Get from: https://resend.com/api-keys
  - Used by: `send-feedback` edge function

---

## 🚀 Deployment Process

### 1. Pre-Deployment Checklist
- [ ] Complete BETA_LAUNCH_CHECKLIST.md
- [ ] Configure RESEND_API_KEY in Backend → Secrets
- [ ] Enable Leaked Password Protection in Auth settings
- [ ] Test all critical user flows
- [ ] Verify RLS policies are correct
- [ ] Check all routes work properly

### 2. Frontend Deployment
1. Click "Publish" button (top-right on desktop)
2. Review changes in publish dialog
3. Click "Update" to deploy frontend changes
4. Wait for deployment to complete (~2-3 minutes)

**Note**: Backend changes (migrations, edge functions) deploy automatically!

### 3. Custom Domain (Optional)
1. Go to Settings → Domains
2. Add your custom domain
3. Configure DNS records as shown
4. Wait for SSL certificate provisioning

### 4. Post-Deployment
- [ ] Test on production URL
- [ ] Verify email sending works
- [ ] Check analytics are tracking
- [ ] Monitor error logs for first hour

---

## 🔍 Monitoring & Analytics

### Built-in Analytics
Access via Backend → Analytics:
- User signups and activity
- Opinion submissions
- Page views and engagement
- Error rates

### Application Metrics
- View counts on opinions
- Upvote statistics by user type
- Weekly participation trends
- Demographic breakdowns

---

## 🛠️ Maintenance

### Database Migrations
- All schema changes use migration tool
- Migrations are version controlled
- Never edit types.ts manually (auto-generated)

### Edge Functions
- Written in TypeScript/Deno
- Deploy automatically on save
- Access logs via Backend → Functions → [Function Name]

### Updating Dependencies
- Use package manager to update
- Test thoroughly before deployment
- Check compatibility with Vite/React

---

## 🐛 Troubleshooting

### Common Issues

**"Your opinion was viewed" but count shows 0**
- Fixed with RLS policy update
- Users can now see all view records for counting

**Feedback submission fails**
- Check RESEND_API_KEY is configured
- Verify email domain is verified on Resend
- Check edge function logs for errors

**Demographics not showing for creators**
- Ensure user has non-audience user_type
- Check CategoryDetail.tsx renders DemographicAnalytics
- Verify opinions have user demographic data

**Profile pages not loading**
- Check onboarding_completed flag
- Verify user_type matches expected values
- Check specific profile tables have data

---

## 📞 Support

- **Email**: inphrone@gmail.com
- **Feedback**: Available in-app at /feedback
- **Help Center**: /help-center

---

## 📄 Important Files

### Configuration
- `supabase/config.toml`: Supabase project configuration
- `vite.config.ts`: Vite build configuration
- `tailwind.config.ts`: Tailwind CSS configuration
- `tsconfig.json`: TypeScript configuration

### Styles
- `src/index.css`: Global styles and design system
  - All colors defined as HSL
  - Custom animations
  - Utility classes

### Types
- `src/integrations/supabase/types.ts`: Auto-generated database types (DO NOT EDIT)
- `src/vite-env.d.ts`: Vite type definitions

### Core Pages
- `src/pages/Landing.tsx`: Homepage
- `src/pages/Auth.tsx`: Login/Signup
- `src/pages/Dashboard.tsx`: Main dashboard
- `src/pages/Profile.tsx`: User profile
- `src/pages/CategoryDetail.tsx`: Category insights
- `src/pages/Reviews.tsx`: Platform reviews
- `src/pages/Feedback.tsx`: User feedback

---

## 🎨 Design System

### Colors (HSL)
- **Primary**: hsl(345 42% 25%) - Deep burgundy
- **Accent**: hsl(345 42% 25%) - Matches primary
- **Background**: hsl(20 33% 98%) - Light warm
- **Foreground**: hsl(0 0% 0%) - Black text

### Gradients
- `gradient-primary`: Primary color gradient
- `gradient-accent`: Accent color gradient
- `gradient-hero`: Hero section gradient

### Shadows
- `shadow-elegant`: Elegant deep shadow
- `shadow-card`: Subtle card shadow
- `shadow-glow`: Glowing effect

### Animations
- `animate-float`: Floating effect
- `animate-pulse-glow`: Pulsing glow
- `animate-slide-up`: Slide up on enter
- `animate-scale-in`: Scale in on enter
- `animate-fade-in-up`: Fade and slide up
- `animate-bounce-in`: Bouncy entrance
- `hover-lift`: Lift on hover
- `hover-glow`: Glow on hover

---

## 📋 User Types

### Audience
- Submit opinions on content
- View their own opinions and analytics
- Earn rewards and badges
- Share profile

### Creator
- View audience opinions
- Access demographic analytics
- See content trends
- Track engagement

### Studio / OTT / TV / Gaming / Music
- View all audience opinions in categories
- Advanced analytics and insights
- Demographic breakdowns
- Weekly trends

---

## 🎯 Beta Success Metrics

Track these KPIs:
- User signups (target: ___)
- Daily active users (target: ___)
- Opinions submitted per week (target: ___)
- Creator/Studio engagement rate (target: __%)
- Average session duration (target: ___ mins)
- Review ratings (target: 4.5+/5)

---

**Last Updated**: 2025-11-15
**Version**: Beta v1.0
**Lovable Project ID**: kwkfmwgqwpaynawgtghf
