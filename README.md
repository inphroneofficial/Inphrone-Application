# Inphrone - People-Powered Entertainment Intelligence

## 📱 What is Inphrone?

**Inphrone** is a revolutionary entertainment insights platform that bridges the gap between audiences and content creators across Film, Music, TV/OTT, Gaming, and Social Media. The name combines "IN" (Insights) + "PHRONE" (Phronesis - practical wisdom in Greek), representing wisdom guided by real human insight.

### Core Mission
Democratize entertainment intelligence by giving audiences a voice while providing creators with authentic, actionable insights.

## 🎯 Project Info

**URL**: https://lovable.dev/projects/8e949255-418c-439e-adf7-07937b6dc022

## ✨ Key Features

### 1. **InphroSync - Daily Entertainment Pulse** 🌟
Our flagship feature that drives daily engagement:
- **3 Daily Questions** about yesterday's entertainment consumption
- **Interactive Swipeable Cards** - Tinder-style interface for engaging interaction
- **Real-time Community Insights** with live stats and demographic filters
- **Streak Tracking** - Build daily habits and earn rewards
- **Gamified Experience** - Confetti celebrations, progress indicators, and visual feedback
- **Demographic Filtering** - View results by age, gender, and location
- **Mobile-First Design** - Premium UI optimized for all devices

### 2. **Opinion Sharing & Insights**
- Submit detailed opinions across 7 entertainment categories
- Rich opinion data: title, genre, budget estimates, target audience
- Upvoting system for non-audience users
- View tracking and analytics
- Weekly opinion statistics

### 3. **Location-Aware Reward System** 🎁
- Coupons display in user's local currency (USD, INR, GBP, EUR, AUD, CAD)
- Multiple categories: Entertainment, Electronics, Food, Fashion, Travel
- Track active, used, and expired coupons
- Share coupons with friends via email
- Detailed merchant information and usage instructions
- Real-time expiration tracking

### 4. **Advanced Gamification** 🏆
- **Streak Tracker**: Weekly contribution streaks with tier progression
- **Badge System**: Earn achievements across different activities
- **Creative Soul Avatar**: Personalized avatar that evolves with contributions
- **Cultural Energy Map**: Visualize trends by location
- **Wisdom Badges**: Recognition for category expertise

### 5. **Multi-User Type System**
- **Audience**: Share opinions, earn rewards, view insights
- **Creators**: Access analytics and demographic data
- **Studios/Production**: Industry-level insights and trend analysis
- **OTT Platforms**: Content performance metrics
- **Music Labels**: Genre preferences and artist insights
- **Gaming Companies**: Gaming content feedback
- **TV Networks**: Broadcasting insights

### 6. **Real-Time Analytics**
- Global insights overview with trend analysis
- Category-specific dashboards
- Demographic analytics (age, gender, location)
- Weekly content type analytics
- Opinion upvote breakdown by user type
- Time-spent tracking

## 🏗️ Technical Stack

### Frontend
- **React 18** + **TypeScript** for type-safe development
- **Vite** for lightning-fast builds
- **Tailwind CSS** with custom design system
- **Framer Motion** for premium animations
- **shadcn/ui** component library
- **TanStack Query** for data management
- **Recharts** for data visualization

### Backend (Lovable Cloud)
- **PostgreSQL** with Row Level Security (RLS)
- **Real-time subscriptions** via Supabase
- **Edge Functions** for serverless logic
- **Authentication**: Email/password + Google OAuth
- **File Storage** for uploads

### Key Libraries
- `canvas-confetti` - Celebration effects
- `framer-motion` - Smooth animations
- `react-hook-form` - Form management
- `zod` - Schema validation
- `date-fns` - Date utilities

## 🚀 Getting Started

### Prerequisites
- Node.js 18+ ([install with nvm](https://github.com/nvm-sh/nvm#installing-and-updating))
- npm or bun package manager

### Installation

```bash
# Clone the repository
git clone <YOUR_GIT_URL>

# Navigate to project directory
cd inphrone

# Install dependencies
npm install
# or
bun install

# Start development server
npm run dev
# or
bun dev
```

### Environment Variables
Create a `.env` file (already configured in Lovable projects):
```env
VITE_SUPABASE_URL=your_supabase_url
VITE_SUPABASE_PUBLISHABLE_KEY=your_anon_key
VITE_SUPABASE_PROJECT_ID=your_project_id
```

## 📝 Development Workflow

### Using Lovable (Recommended)
1. Visit the [Lovable Project](https://lovable.dev/projects/8e949255-418c-439e-adf7-07937b6dc022)
2. Start prompting to make changes
3. Changes are automatically committed to the repo
4. Live preview updates instantly

### Using Your IDE
1. Clone the repository
2. Make changes locally
3. Push to trigger Lovable sync
4. Test in the live preview

### Using GitHub Directly
1. Navigate to files in GitHub
2. Click "Edit" button (pencil icon)
3. Make changes and commit
4. Lovable will sync automatically

### Using GitHub Codespaces
1. Click "Code" → "Codespaces" → "New codespace"
2. Edit in browser-based VS Code
3. Commit and push when done

## 🎨 Design Philosophy

Inphrone follows a **cinematic premium design** approach:
- **Dark mode first** with light mode support
- **Semantic color tokens** for consistent theming
- **Micro-animations** for delightful interactions
- **Glass morphism** and gradient effects
- **Mobile-first responsive** design
- **Accessibility** built-in (WCAG compliant)

## 🚢 Deployment

### Quick Deploy
Simply open [Lovable](https://lovable.dev/projects/8e949255-418c-439e-adf7-07937b6dc022) and click **Share → Publish**

### Custom Domain
1. Navigate to Project > Settings > Domains
2. Click "Connect Domain"
3. Follow DNS configuration instructions
4. [Learn more about custom domains](https://docs.lovable.dev/features/custom-domain#custom-domain)

### Deployment Platforms
- **Vercel** (recommended) - See `VERCEL_DEPLOYMENT_README.md`
- **Netlify** - Works out of the box
- **Cloudflare Pages** - Fast global CDN

## 📚 Documentation

- `DEPLOYMENT_AND_OVERVIEW.md` - Comprehensive feature overview
- `VERCEL_DEPLOYMENT_README.md` - Detailed Vercel deployment guide
- `README_FUTURE_IMPROVEMENTS.md` - Planned enhancements
- `BETA_LAUNCH_CHECKLIST.md` - Pre-launch checklist

## 🔐 Security Features

- **Row Level Security (RLS)** on all database tables
- **User-specific data access** - Users can only access their own data
- **Secure authentication** with email verification
- **7-day grace period** for account deletion
- **Account restoration** capability

## 🎯 What Makes Inphrone Unique?

1. **Daily Habit Formation**: InphroSync creates a daily ritual for users
2. **Swipeable Interface**: Premium, engaging UI that users love
3. **Real-time Insights**: See community trends as they happen
4. **Location-Aware**: Currency and content localized to user's region
5. **Gamification Done Right**: Rewards feel earned, not forced
6. **Multi-Stakeholder Platform**: Serves both audiences and industry professionals

## 🤝 Contributing

We welcome contributions! Please follow these steps:
1. Fork the repository
2. Create a feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit your changes (`git commit -m 'Add AmazingFeature'`)
4. Push to the branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

## 📞 Support

- **Issues**: Use GitHub Issues for bug reports
- **Discussions**: Use GitHub Discussions for questions
- **Email**: Contact through the app's feedback form

## 📈 Analytics & Monitoring

- **User Analytics**: Track engagement and usage patterns
- **Performance Monitoring**: Vercel Analytics integration
- **Error Tracking**: Console logs and error boundaries
- **Database Insights**: Lovable Cloud dashboard

## 🔮 Future Roadmap

See `README_FUTURE_IMPROVEMENTS.md` for detailed plans including:
- Mobile app (React Native)
- AI-powered recommendations
- Advanced analytics dashboard
- Multi-language support
- Partnership integrations

## 📄 License

This project is private and proprietary. All rights reserved.

## 🌟 Technologies We Love

This project is built with:
- ⚛️ **React** - UI library
- 📘 **TypeScript** - Type safety
- ⚡ **Vite** - Build tool
- 🎨 **Tailwind CSS** - Styling
- 🎭 **Framer Motion** - Animations
- 🗄️ **Supabase** - Backend
- ☁️ **Lovable Cloud** - Deployment

---

**Built with ❤️ using [Lovable](https://lovable.dev)**
