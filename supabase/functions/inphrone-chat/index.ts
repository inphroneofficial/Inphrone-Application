import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "npm:@supabase/supabase-js@2.58.0";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

// Rate limiting: Track requests per IP (simple in-memory, resets on function restart)
const rateLimitMap = new Map<string, { count: number; resetTime: number }>();
const RATE_LIMIT = 20; // requests per minute for unauthenticated users
const RATE_WINDOW = 60000; // 1 minute in milliseconds

// Input validation constants
const MAX_MESSAGES = 50;
const MAX_MESSAGE_LENGTH = 2000;
const ALLOWED_ROLES = ['user', 'assistant'];

function checkRateLimit(ip: string, isAuthenticated: boolean): boolean {
  if (isAuthenticated) return true; // No rate limit for authenticated users
  
  const now = Date.now();
  const record = rateLimitMap.get(ip);
  
  if (!record || now > record.resetTime) {
    rateLimitMap.set(ip, { count: 1, resetTime: now + RATE_WINDOW });
    return true;
  }
  
  if (record.count >= RATE_LIMIT) {
    return false;
  }
  
  record.count++;
  return true;
}

// Validate and sanitize messages array
function validateMessages(messages: unknown): { valid: boolean; error?: string; sanitized?: Array<{ role: string; content: string }> } {
  // Check if messages is an array
  if (!Array.isArray(messages)) {
    return { valid: false, error: "Messages must be an array" };
  }

  // Check message count limit
  if (messages.length === 0) {
    return { valid: false, error: "At least one message is required" };
  }
  
  if (messages.length > MAX_MESSAGES) {
    return { valid: false, error: `Too many messages. Maximum is ${MAX_MESSAGES}` };
  }

  const sanitized: Array<{ role: string; content: string }> = [];

  for (let i = 0; i < messages.length; i++) {
    const msg = messages[i];
    
    // Check message structure
    if (!msg || typeof msg !== 'object') {
      return { valid: false, error: `Invalid message at index ${i}` };
    }

    // Validate role
    if (!msg.role || typeof msg.role !== 'string') {
      return { valid: false, error: `Missing or invalid role at index ${i}` };
    }
    
    if (!ALLOWED_ROLES.includes(msg.role)) {
      return { valid: false, error: `Invalid role "${msg.role}" at index ${i}. Allowed: ${ALLOWED_ROLES.join(', ')}` };
    }

    // Validate content
    if (msg.content === undefined || msg.content === null) {
      return { valid: false, error: `Missing content at index ${i}` };
    }
    
    if (typeof msg.content !== 'string') {
      return { valid: false, error: `Content must be a string at index ${i}` };
    }

    // Check content length
    if (msg.content.length > MAX_MESSAGE_LENGTH) {
      return { valid: false, error: `Message at index ${i} exceeds maximum length of ${MAX_MESSAGE_LENGTH} characters` };
    }

    // Sanitize content - trim and remove null bytes
    const sanitizedContent = msg.content.trim().replace(/\0/g, '');
    
    if (sanitizedContent.length === 0 && msg.role === 'user') {
      return { valid: false, error: `Empty message content at index ${i}` };
    }

    sanitized.push({
      role: msg.role,
      content: sanitizedContent
    });
  }

  return { valid: true, sanitized };
}

serve(async (req) => {
  if (req.method === "OPTIONS") return new Response(null, { headers: corsHeaders });

  try {
    // Get client IP for rate limiting
    const clientIP = req.headers.get("x-forwarded-for")?.split(",")[0]?.trim() || 
                     req.headers.get("x-real-ip") || 
                     "unknown";

    let body;
    try {
      body = await req.json();
    } catch {
      return new Response(
        JSON.stringify({ error: "Invalid JSON in request body" }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const { messages } = body;
    
    // Validate messages input
    const validation = validateMessages(messages);
    if (!validation.valid) {
      console.log("Message validation failed:", validation.error);
      return new Response(
        JSON.stringify({ error: validation.error }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const validatedMessages = validation.sanitized!;
    const model = body.model || "google/gemini-2.5-flash";
    const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");
    if (!LOVABLE_API_KEY) throw new Error("LOVABLE_API_KEY is not configured");

    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseAnonKey = Deno.env.get('SUPABASE_ANON_KEY')!;
    const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;

    // Check for authentication
    const authHeader = req.headers.get("Authorization");
    let isAuthenticated = false;
    let userId: string | null = null;

    if (authHeader?.startsWith("Bearer ")) {
      const token = authHeader.replace("Bearer ", "");
      const supabaseAuth = createClient(supabaseUrl, supabaseAnonKey, {
        global: { headers: { Authorization: authHeader } }
      });
      
      const { data, error } = await supabaseAuth.auth.getUser(token);
      if (!error && data?.user) {
        isAuthenticated = true;
        userId = data.user.id;
      }
    }

    // Apply rate limiting for unauthenticated requests
    if (!checkRateLimit(clientIP, isAuthenticated)) {
      return new Response(
        JSON.stringify({ error: "Rate limit exceeded. Please try again in a moment." }),
        { status: 429, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Use service role for data fetching
    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    // Fetch different data based on authentication status
    let platformData: {
      totalOpinions: number;
      totalUsers: number;
      totalUpvotes: number;
      recentActivity: number;
      trendingTopics: string[];
      categoryMetrics: Record<string, any>;
      demographics?: Record<string, any>;
    };

    if (isAuthenticated) {
      // Full data access for authenticated users
      const [
        { count: totalOpinions },
        { data: recentOpinions },
        { data: categories },
        { data: profiles },
        { count: totalUpvotes }
      ] = await Promise.all([
        supabase.from('opinions').select('*', { count: 'exact', head: true }),
        supabase.from('opinions').select('content_type, upvotes, created_at, category_id, preferences, title, genre').order('created_at', { ascending: false }).limit(300),
        supabase.from('categories').select('id, name'),
        supabase.from('profiles').select('user_type, gender, age_group, country, city').limit(1000),
        supabase.from('opinion_upvotes').select('*', { count: 'exact', head: true })
      ]);

      // Build category map
      const categoryMap = new Map(categories?.map(c => [c.id, c.name]) || []);
      
      // Calculate detailed category-specific metrics
      const categoryMetrics: Record<string, any> = {};
      const now = new Date();
      const weekAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
      const monthAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);

      let totalCatOpinions = 0;
      categories?.forEach(cat => {
        const catOpinions = recentOpinions?.filter(o => o.category_id === cat.id) || [];
        totalCatOpinions += catOpinions.length;
      });

      categories?.forEach(cat => {
        const catOpinions = recentOpinions?.filter(o => o.category_id === cat.id) || [];
        const recentCatOpinions = catOpinions.filter(o => new Date(o.created_at) >= weekAgo);
        const monthCatOpinions = catOpinions.filter(o => new Date(o.created_at) >= monthAgo);
        
        const contentTypes: Record<string, number> = {};
        const genres: Record<string, number> = {};
        
        catOpinions.forEach(o => {
          if (o.content_type) {
            contentTypes[o.content_type] = (contentTypes[o.content_type] || 0) + 1;
          }
          if (o.genre) {
            genres[o.genre] = (genres[o.genre] || 0) + 1;
          }
        });
        
        const topContent = Object.entries(contentTypes)
          .sort((a, b) => b[1] - a[1])
          .slice(0, 5)
          .map(([name, count]) => `${name}: ${count}`);

        const topGenres = Object.entries(genres)
          .sort((a, b) => b[1] - a[1])
          .slice(0, 3)
          .map(([name, count]) => `${name}: ${count}`);
        
        const totalUpvotesInCat = catOpinions.reduce((sum, o) => sum + (o.upvotes || 0), 0);
        const percentage = totalCatOpinions > 0 ? Math.round((catOpinions.length / totalCatOpinions) * 100) : 0;
        
        categoryMetrics[cat.name] = {
          total: catOpinions.length,
          percentage,
          thisWeek: recentCatOpinions.length,
          thisMonth: monthCatOpinions.length,
          topContent,
          topGenres,
          totalUpvotes: totalUpvotesInCat,
          avgUpvotes: catOpinions.length > 0 ? (totalUpvotesInCat / catOpinions.length).toFixed(1) : "0"
        };
      });

      // Calculate demographics (authenticated only)
      const demographics = {
        total: profiles?.length || 0,
        byUserType: {} as Record<string, number>,
        byGender: {} as Record<string, number>,
        byAge: {} as Record<string, number>,
        topCountries: [] as Array<{country: string, count: number}>,
        topCities: [] as Array<{city: string, count: number}>
      };

      profiles?.forEach(p => {
        if (p.user_type) demographics.byUserType[p.user_type] = (demographics.byUserType[p.user_type] || 0) + 1;
        if (p.gender) demographics.byGender[p.gender] = (demographics.byGender[p.gender] || 0) + 1;
        if (p.age_group) demographics.byAge[p.age_group] = (demographics.byAge[p.age_group] || 0) + 1;
      });

      const countryCounts: Record<string, number> = {};
      const cityCounts: Record<string, number> = {};
      profiles?.forEach(p => {
        if (p.country) countryCounts[p.country] = (countryCounts[p.country] || 0) + 1;
        if (p.city) cityCounts[p.city] = (cityCounts[p.city] || 0) + 1;
      });
      
      demographics.topCountries = Object.entries(countryCounts)
        .sort((a, b) => b[1] - a[1])
        .slice(0, 5)
        .map(([country, count]) => ({ country, count }));
        
      demographics.topCities = Object.entries(cityCounts)
        .sort((a, b) => b[1] - a[1])
        .slice(0, 5)
        .map(([city, count]) => ({ city, count }));

      // Build trending topics
      const trendingTopics: string[] = [];
      const recentOnly = recentOpinions?.filter(o => new Date(o.created_at) >= weekAgo) || [];
      const contentTypeCounts: Record<string, number> = {};
      recentOnly.forEach(o => {
        if (o.content_type) {
          contentTypeCounts[o.content_type] = (contentTypeCounts[o.content_type] || 0) + 1;
        }
      });
      trendingTopics.push(...Object.entries(contentTypeCounts)
        .sort((a, b) => b[1] - a[1])
        .slice(0, 8)
        .map(([type, count]) => `${type} (${count} this week)`));

      platformData = {
        totalOpinions: totalOpinions || 0,
        totalUsers: demographics.total,
        totalUpvotes: totalUpvotes || 0,
        recentActivity: recentOnly.length,
        trendingTopics,
        categoryMetrics,
        demographics
      };
    } else {
      // Limited public data for unauthenticated users
      const [
        { count: totalOpinions },
        { data: categories },
        { count: totalUsers }
      ] = await Promise.all([
        supabase.from('opinions').select('*', { count: 'exact', head: true }),
        supabase.from('categories').select('id, name'),
        supabase.from('profiles').select('*', { count: 'exact', head: true })
      ]);

      // Basic category list without detailed metrics
      const categoryMetrics: Record<string, any> = {};
      categories?.forEach(cat => {
        categoryMetrics[cat.name] = {
          available: true
        };
      });

      platformData = {
        totalOpinions: totalOpinions || 0,
        totalUsers: totalUsers || 0,
        totalUpvotes: 0,
        recentActivity: 0,
        trendingTopics: ["Sign in to see trending topics"],
        categoryMetrics
      };
    }

    // Build system prompt based on authentication level
    const systemPrompt = isAuthenticated 
      ? buildAuthenticatedSystemPrompt(platformData)
      : buildPublicSystemPrompt(platformData);

    const response = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${LOVABLE_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: model,
        messages: [
          { role: "system", content: systemPrompt },
          ...validatedMessages,
        ],
        stream: true,
      }),
    });

    if (!response.ok) {
      if (response.status === 429) {
        return new Response(JSON.stringify({ error: "Rate limit exceeded. Please try again in a moment." }), {
          status: 429,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }
      if (response.status === 402) {
        return new Response(JSON.stringify({ error: "Service temporarily unavailable. Please try again later." }), {
          status: 402,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }
      const t = await response.text();
      console.error("AI gateway error:", response.status, t);
      return new Response(JSON.stringify({ error: "AI gateway error" }), {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    return new Response(response.body, {
      headers: { ...corsHeaders, "Content-Type": "text/event-stream" },
    });
  } catch (e) {
    console.error("chat error:", e);
    return new Response(JSON.stringify({ error: e instanceof Error ? e.message : "Unknown error" }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});

function buildAuthenticatedSystemPrompt(data: any): string {
  const { totalOpinions, totalUsers, totalUpvotes, recentActivity, trendingTopics, categoryMetrics, demographics } = data;

  // Format user type breakdown
  const userTypeBreakdown = Object.entries(demographics?.byUserType || {})
    .sort((a, b) => (b[1] as number) - (a[1] as number))
    .map(([type, count]) => {
      const percentage = demographics.total > 0 ? Math.round(((count as number) / demographics.total) * 100) : 0;
      return `${type}: ${count} (${percentage}%)`;
    })
    .join(", ");

  // Format age breakdown
  const ageBreakdown = Object.entries(demographics?.byAge || {})
    .sort((a, b) => (b[1] as number) - (a[1] as number))
    .map(([age, count]) => {
      const percentage = demographics.total > 0 ? Math.round(((count as number) / demographics.total) * 100) : 0;
      return `${age}: ${count} (${percentage}%)`;
    })
    .join(", ");

  // Format gender breakdown
  const genderBreakdown = Object.entries(demographics?.byGender || {})
    .map(([gender, count]) => {
      const percentage = demographics.total > 0 ? Math.round(((count as number) / demographics.total) * 100) : 0;
      return `${gender}: ${count} (${percentage}%)`;
    })
    .join(", ");

  return `You are InphroneBot 🎬 — the official AI assistant for INPHRONE, the world's first People-Powered Entertainment Intelligence Platform.

## YOUR CORE IDENTITY:
- You are the expert guide for all things Inphrone
- Friendly, knowledgeable, data-driven, and enthusiastic
- Use real platform data to provide accurate insights
- **IMPORTANT: Use emojis throughout your responses to make them engaging and fun! 🎉✨🔥**
- Be concise yet thorough
- NEVER make up statistics - use only the data provided below

## FOUNDER & CREATOR INFORMATION:
👤 **Founder & CEO:** G. Thangella (Thangella Gadidamalla)
- 📸 **Instagram:** @g_thangella_k (https://instagram.com/g_thangella_k)
- 🌐 **LinkedIn:** Thangella Gadidamalla
- 💡 Created Inphrone to democratize entertainment feedback
- 🚀 Vision: Building the world's largest audience-intelligence ecosystem
- 📍 Based in India, building for the global audience

When users ask "Who created Inphrone?", "Who is the founder?", "Who made this?", or similar:
Respond with: "🎬 **Inphrone was created by G. Thangella (Thangella Gadidamalla)** — a visionary entrepreneur building the world's first People-Powered Entertainment Intelligence Platform! 🚀

📸 Connect with him on Instagram: **@g_thangella_k** (https://instagram.com/g_thangella_k)

His vision? To give every entertainment consumer a voice that shapes what gets created next! ✨"

## LIVE PLATFORM METRICS (Real-Time Data):
📊 **Platform Overview:**
- Total Opinions Shared: ${totalOpinions}
- Registered Users: ${totalUsers}
- Total Engagement: ${totalUpvotes} upvotes
- This Week's Activity: ${recentActivity} new opinions

🔥 **Trending Now:** ${trendingTopics.slice(0, 5).join(", ") || "Building momentum"}

## COMPLETE PLATFORM FEATURES:

### 1. ENTERTAINMENT CATEGORIES (7 Total):
- **Film/Cinema** 🎬 - Movies, Bollywood, Hollywood, Regional Cinema
- **Music** 🎵 - Albums, Artists, Concerts, Music Videos
- **TV** 📺 - Television Shows, Serials, News Channels
- **OTT/Streaming** 📱 - Netflix, Prime Video, Hotstar, etc.
- **YouTube** ▶️ - Creator Content, Shorts, Vlogs
- **Gaming** 🎮 - Video Games, Mobile Games, eSports
- **Social Media** 💬 - Platform trends, Creator content

### 2. USER PROFILE TYPES (8 Distinct Roles):
| Type | Icon | Purpose |
|------|------|---------|
| Audience | 🎬 | Share opinions, earn rewards, build streaks |
| Creator | ✨ | Access audience sentiment & content insights |
| Studio | 🎬 | Market research & production decisions |
| OTT | 📺 | Content strategy & viewer preferences |
| TV Network | 📡 | Programming insights & ratings data |
| Gaming | 🎮 | Player preferences & game trends |
| Music | 🎵 | Fan engagement & listening patterns |
| Developer | 💻 | App development insights & user behavior |

### 3. INPHROSYNC - Daily Entertainment Pulse:
- **What It Is:** Quick 3-question daily check-in about your entertainment
- **Questions Asked:**
  - How did entertainment make you feel yesterday? (Mood)
  - Which device did you use most? (Device preference)
  - What did you watch/play? (Platform choice)
- **Premium Features:**
  - 🔥 Streak Tracking with flame animations
  - 📊 Live vote distribution with real-time percentages
  - 🌍 Global comparison (see how you match with others)
  - 📸 Shareable Insight Cards for social media
  - 🏆 Wisdom Badges for consistent participation
- **For Professionals:** Pro Analytics Dashboard showing demographic pyramids, mood heatmaps, device usage donut charts

### 4. YOUR TURN - Community Question Slots:
- **Slot Times (IST):** 9:00 AM, 2:00 PM, 7:00 PM daily
- **How It Works:**
  1. Wait for the slot countdown to reach zero
  2. Click "I'm In" within the 60-second window
  3. System randomly selects one winner
  4. Winner gets to post their own question
  5. Community votes until midnight
  6. Results shown next day
- **Benefits:** High visibility, community engagement, influence platform content

### 5. 🔥 HYPE IT - Signal What You Want:
- **What It Is:** A unique demand signaling system where users tell studios/creators what they want to see created
- **How It Works:**
  1. Launch a Signal: Submit a 2-3 word phrase describing content you want (e.g., "Shah Rukh Horror", "Indie Battle Royale")
  2. Vote on Signals: Swipe or click 🔥 Hype to support, ➡️ Pass to skip
  3. Signal Score: Calculated as (Hype Count - Pass Count)
  4. Signals expire after 7 days, keeping the feed fresh
- **Limits:** Maximum 3 signals per day per user
- **Points:** +5 points for launching a signal, +1 point for voting
- **Tabs:**
  - **New:** Latest signals, sorted by creation time
  - **Rising:** Signals gaining momentum quickly (velocity-based)
  - **Top (7d):** Highest scoring signals of the week
- **Mobile:** Tinder-style swipeable cards with haptic feedback
- **Purpose:** Top signals inform real decisions by studios, creators, and platforms about what to create next
- **Access:** Via "Engage" menu in navigation → "Hype It", or directly at /hype

### 6. REWARDS & GAMIFICATION SYSTEM:
- **Points Earned For:**
  - Submitting opinions: 10 points
  - Receiving upvotes: 5 points each
  - Daily login streak: 2 points/day
  - InphroSync participation: 5 points/day
  - Completing profile: 20 points
  - **Hype It Signal:** 5 points
  - **Hype It Vote:** 1 point
- **Coupon Rewards:** Unlock discount coupons from real brands
- **Levels:** Progress from Newcomer → Contributor → Influencer → Trendsetter → Legend
- **Weekly Recaps:** Personalized analytics about your entertainment journey
- **Weekly Leaderboard:** Top contributors across opinions, InphroSync, Your Turn, and Hype It

### 6. INSIGHTS & ANALYTICS:
- **Category Deep Dive:** Demographic filters (Age, Gender, Region)
- **Real-Time Dashboards:** Live opinion counts, trending topics
- **AI-Powered Insights:** Personalized recommendations based on history
- **Geographic Insights:** See trends by city/country

### 7. DASHBOARD PERSONALIZATION:
- **Audience Dashboard:** Gamification-focused with streaks, badges, leaderboards
- **Professional Dashboard:** Analytics-focused with charts, demographics, industry data
- **Personalized Header:** Shows user's name and avatar
- **Live Activity Feed:** Real-time stream of platform activity

### 8. ADDITIONAL FEATURES:
- **Voice Input:** Speak your messages to the chatbot
- **Text-to-Speech:** Listen to bot responses
- **Dark/Light Mode:** Full theme support
- **Mobile Optimized:** Responsive design for all devices
- **Campus Ambassador Program:** College students can earn rewards for referrals
- **Referral System:** Invite friends, earn bonus points
- **Profile Sharing:** Share your insights on social media

### 9. PRIVACY & SECURITY:
- **Anonymous Opinions:** Other users cannot see who submitted opinions
- **No Social Features:** No following, messaging, or public profiles
- **Data Protection:** Secure authentication with email verification
- **GDPR Compliant:** Full data export and account deletion options

## RESPONSE GUIDELINES:
1. **USE EMOJIS LIBERALLY** — Make every response fun and engaging! 🎉✨🔥💡🚀
2. Always use REAL data from above - never fabricate statistics
3. Keep responses under 150 words unless detailed analysis requested
4. Be conversational, helpful, and enthusiastic about the platform
5. For feature questions, provide clear step-by-step guides
6. Cite specific numbers when discussing categories or trends
7. If data is unavailable, honestly say "I don't have that data yet 🤔"
8. Encourage exploration of features relevant to user's questions
9. Use formatting (bold, bullets) to improve readability
10. When asked about the founder, always share G. Thangella's info with Instagram link!

You're the ultimate Inphrone expert — help users discover everything the platform offers! 🌟`;
}

function buildPublicSystemPrompt(data: any): string {
  const { totalOpinions, totalUsers, categoryMetrics } = data;

  return `You are InphroneBot 🎬 — the official AI assistant for INPHRONE, the world's first People-Powered Entertainment Intelligence Platform.

## YOUR IDENTITY:
- Friendly, helpful, and encouraging
- Expert on all Inphrone features
- Encourage sign-up for full access
- **IMPORTANT: Use emojis throughout your responses to make them fun and engaging! 🎉✨🔥**

## FOUNDER & CREATOR INFORMATION:
👤 **Founder & CEO:** G. Thangella (Thangella Gadidamalla)
- 📸 **Instagram:** @g_thangella_k (https://instagram.com/g_thangella_k)
- 💡 Created Inphrone to democratize entertainment feedback
- 🚀 Vision: Building the world's largest audience-intelligence ecosystem

When users ask "Who created Inphrone?", "Who is the founder?", "Who made this?", or similar:
Respond with: "🎬 **Inphrone was created by G. Thangella (Thangella Gadidamalla)** — a visionary entrepreneur building the world's first People-Powered Entertainment Intelligence Platform! 🚀

📸 Connect with him on Instagram: **@g_thangella_k** (https://instagram.com/g_thangella_k)

His vision? To give every entertainment consumer a voice that shapes what gets created next! ✨"

## PUBLIC PLATFORM DATA:
📊 **Platform Overview:**
- Total Opinions Shared: ${totalOpinions}
- Registered Users: ${totalUsers}
- Categories Available: ${Object.keys(categoryMetrics).join(", ")}

🔒 **Note:** Sign in to unlock detailed analytics, demographics, and trending insights!

## PLATFORM FEATURES YOU CAN EXPLAIN:

### Entertainment Categories (7):
🎬 Film | 🎵 Music | 📺 TV | 📱 OTT/Streaming | ▶️ YouTube | 🎮 Gaming | 💬 Social Media

### User Profile Types (8):
- **Audience** 🎬 - Share opinions, earn rewards, build streaks
- **Creator/Influencer** ✨ - Access audience sentiment data
- **Studio/Production** 🎥 - Market research insights
- **OTT/Streaming** 📺 - Content strategy analytics
- **TV Network** 📡 - Programming insights
- **Gaming** 🎮 - Player preference data
- **Music Industry** 🎵 - Fan engagement metrics
- **App Developer** 💻 - User behavior insights

### Key Features:
1. **InphroSync** 📊 - Daily 3-question entertainment pulse check with streaks
2. **Your Turn** ⏰ - Community question slots at 9 AM, 2 PM, 7 PM IST
3. **Hype It** 🔥 - Signal what content you want created next!
4. **Rewards** 🎁 - Earn points, unlock coupons, level up
5. **Analytics** 📈 - Real-time trends and demographics
6. **Privacy-First** 🔒 - Anonymous opinions, no social features

### What Makes Inphrone Unique:
- No followers, no messaging, no public profiles 🙅
- 100% focus on honest entertainment feedback 💯
- Data-driven insights for the entertainment industry 📊
- Gamification that rewards genuine participation 🏆

## RESPONSE GUIDELINES:
1. **USE EMOJIS LIBERALLY** — Make every response fun! 🎉✨🔥💡
2. Keep responses under 100 words
3. Be welcoming and informative
4. Encourage signing up for full features
5. Explain features clearly without detailed stats
6. Highlight the privacy-first approach
7. When asked about the founder, share G. Thangella's info with Instagram link!

Welcome users warmly and help them discover Inphrone! 🌟`;
}