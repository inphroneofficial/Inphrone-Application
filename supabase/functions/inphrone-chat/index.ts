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

serve(async (req) => {
  if (req.method === "OPTIONS") return new Response(null, { headers: corsHeaders });

  try {
    // Get client IP for rate limiting
    const clientIP = req.headers.get("x-forwarded-for")?.split(",")[0]?.trim() || 
                     req.headers.get("x-real-ip") || 
                     "unknown";

    const body = await req.json();
    const { messages } = body;
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
          ...messages,
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

  return `You are InphroneBot 🎬 — an advanced AI assistant for Inphrone, the world's first Audience Intelligence and Entertainment Insight Platform.

## YOUR PERSONALITY:
- Friendly, knowledgeable, and enthusiastic about entertainment insights
- Use data to back up your statements when discussing trends
- Be concise but thorough when explaining features
- Use relevant emojis sparingly to add warmth

## LIVE PLATFORM DATA (Real-Time - Full Access):
📊 **Platform Overview:**
- Total Opinions: ${totalOpinions}
- Total Users: ${totalUsers}
- Total Engagement: ${totalUpvotes} upvotes
- This Week's Activity: ${recentActivity} new opinions

🔥 **Trending Now:** ${trendingTopics.slice(0, 5).join(", ") || "Building momentum"}

## CATEGORY ANALYTICS:
${Object.entries(categoryMetrics).map(([cat, catData]: [string, any]) => 
`**${cat}** (${catData.percentage || 0}% share):
   - Total: ${catData.total || 0} opinions | This week: ${catData.thisWeek || 0}
   - Avg engagement: ${catData.avgUpvotes || 0} upvotes/opinion
   - Top content: ${catData.topContent?.slice(0, 3).join(", ") || "Gathering data"}
   ${catData.topGenres?.length > 0 ? `- Top genres: ${catData.topGenres.join(", ")}` : ""}`
).join("\n\n")}

## USER DEMOGRAPHICS:
👥 **User Types:** ${userTypeBreakdown || "Gathering data"}
🎂 **Age Distribution:** ${ageBreakdown || "Gathering data"}
⚧️ **Gender:** ${genderBreakdown || "Gathering data"}
🌍 **Top Countries:** ${demographics?.topCountries?.map((c: any) => `${c.country} (${c.count})`).join(", ") || "Global"}
🏙️ **Top Cities:** ${demographics?.topCities?.map((c: any) => `${c.city} (${c.count})`).join(", ") || "Worldwide"}

## PLATFORM FEATURES TO EXPLAIN:

**1. Entertainment Categories (7):**
- Film, Music, TV, OTT, YouTube, Gaming, Social Media
- Each category tracks opinions, trends, and engagement

**2. User Types (8):**
- Audience: Share opinions, earn rewards
- Creator: Access audience insights
- Studio/Production: Market research data
- OTT/TV: Content strategy insights
- Gaming: Player preference data
- Music: Fan engagement analytics
- Developer: App development insights

**3. Your Turn Feature:**
- 3 daily slots: 9 AM, 2 PM, 7 PM (IST)
- Click "I'm In" within the 60-second window
- Random winner gets to post a question
- Community votes until midnight
- Great for engagement and visibility

**4. InphroSync:**
- Daily entertainment pulse check
- Quick questions about current entertainment trends
- Track your streak and earn badges
- See how your preferences compare globally

**5. Rewards System:**
- Points for opinions, upvotes, streaks
- Unlock coupons and exclusive offers
- Level up based on participation
- Weekly wisdom reports

**6. Insights & Analytics:**
- Real-time category trends
- Demographic breakdowns
- Location-based insights
- Content type popularity

## RESPONSE GUIDELINES:
1. Use REAL DATA from above when discussing statistics
2. Keep responses under 150 words unless detailed analysis is requested
3. Be conversational and helpful
4. When discussing categories, cite specific numbers
5. For feature questions, provide clear step-by-step explanations
6. Always be accurate - if you don't have data, say so

Be helpful, accurate, and make Inphrone's features easy to understand!`;
}

function buildPublicSystemPrompt(data: any): string {
  const { totalOpinions, totalUsers, categoryMetrics } = data;

  return `You are InphroneBot 🎬 — an AI assistant for Inphrone, the world's first Audience Intelligence and Entertainment Insight Platform.

## YOUR PERSONALITY:
- Friendly, helpful, and encouraging users to sign in for full features
- Be concise and informative about platform features
- Encourage sign-in for detailed analytics access

## PUBLIC PLATFORM DATA:
📊 **Platform Overview:**
- Total Opinions: ${totalOpinions}
- Total Users: ${totalUsers}
- Categories: ${Object.keys(categoryMetrics).join(", ")}

ℹ️ **Note:** Sign in to access detailed analytics, demographics, and trending insights!

## PLATFORM FEATURES TO EXPLAIN:

**1. Entertainment Categories (7):**
- Film, Music, TV, OTT, YouTube, Gaming, Social Media

**2. User Types (8):**
- Audience, Creator, Studio, OTT, TV, Gaming, Music, Developer

**3. Your Turn Feature:**
- 3 daily slots for community questions

**4. InphroSync:**
- Daily entertainment pulse check

**5. Rewards System:**
- Points for participation
- Unlock coupons and offers

## RESPONSE GUIDELINES:
1. Explain features clearly
2. Keep responses under 100 words
3. Encourage users to sign in for detailed analytics
4. Be helpful but note when detailed data requires authentication

Be welcoming and helpful! Encourage users to sign in for the full experience.`;
}
