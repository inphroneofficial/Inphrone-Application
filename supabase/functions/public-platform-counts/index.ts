import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "npm:@supabase/supabase-js@2.58.0";
import { corsHeaders } from "../_shared/cors.ts";

// Rate limiting for public endpoint
const rateLimitMap = new Map<string, { count: number; resetTime: number }>();
const RATE_LIMIT = 30; // requests per minute
const RATE_WINDOW = 60000; // 1 minute in milliseconds

function checkRateLimit(ip: string): boolean {
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

// Calculate growth percentage between two periods
function calculateGrowth(current: number, previous: number): number {
  if (previous === 0) return current > 0 ? 100 : 0;
  return Math.round(((current - previous) / previous) * 100);
}

serve(async (req) => {
  if (req.method === "OPTIONS") return new Response(null, { headers: corsHeaders });

  try {
    if (req.method !== "POST") {
      return new Response(JSON.stringify({ error: "Method not allowed" }), {
        status: 405,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // Get client IP for rate limiting
    const clientIP = req.headers.get("x-forwarded-for")?.split(",")[0]?.trim() || 
                     req.headers.get("x-real-ip") || 
                     "unknown";

    // Apply rate limiting
    if (!checkRateLimit(clientIP)) {
      return new Response(
        JSON.stringify({ error: "Rate limit exceeded. Please try again later." }),
        { status: 429, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const SUPABASE_URL = Deno.env.get("SUPABASE_URL") ?? "";
    const SUPABASE_ANON_KEY = Deno.env.get("SUPABASE_ANON_KEY") ?? "";
    const SERVICE_ROLE_KEY = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? "";

    if (!SUPABASE_URL || !SERVICE_ROLE_KEY) {
      return new Response(JSON.stringify({ error: "Server not configured" }), {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // Check for authentication
    const authHeader = req.headers.get("Authorization");
    let isAuthenticated = false;

    if (authHeader?.startsWith("Bearer ") && SUPABASE_ANON_KEY) {
      const token = authHeader.replace("Bearer ", "");
      const supabaseAuth = createClient(SUPABASE_URL, SUPABASE_ANON_KEY, {
        global: { headers: { Authorization: authHeader } }
      });
      
      const { data, error } = await supabaseAuth.auth.getUser(token);
      if (!error && data?.user) {
        isAuthenticated = true;
      }
    }

    const service = createClient(SUPABASE_URL, SERVICE_ROLE_KEY, {
      auth: { persistSession: false },
    });

    // Get current date calculations
    const now = new Date();
    const weekAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
    const twoWeeksAgo = new Date(now.getTime() - 14 * 24 * 60 * 60 * 1000);
    const dayAgo = new Date(now.getTime() - 24 * 60 * 60 * 1000);

    // Fetch comprehensive stats in parallel
    const [
      { count: totalUsers, error: usersErr },
      { count: thisWeekUsers, error: thisWeekErr },
      { count: lastWeekUsers, error: lastWeekErr },
      { count: activeToday, error: activeTodayErr },
      { data: countriesRows, error: countriesErr },
      { count: totalOpinions, error: opinionsErr },
      { count: thisWeekOpinions, error: thisWeekOpinionsErr },
      { count: totalUpvotes, error: upvotesErr },
      { count: inphrosyncResponses, error: syncErr },
      { count: yourturnVotes, error: ytErr },
      { data: userTypeBreakdown, error: typeErr },
    ] = await Promise.all([
      service.from("profiles").select("*", { count: "exact", head: true }),
      service.from("profiles").select("*", { count: "exact", head: true }).gte("created_at", weekAgo.toISOString()),
      service.from("profiles").select("*", { count: "exact", head: true }).gte("created_at", twoWeeksAgo.toISOString()).lt("created_at", weekAgo.toISOString()),
      service.from("user_activity_logs").select("*", { count: "exact", head: true }).gte("session_start", dayAgo.toISOString()),
      service.from("profiles").select("country"),
      service.from("opinions").select("*", { count: "exact", head: true }),
      service.from("opinions").select("*", { count: "exact", head: true }).gte("created_at", weekAgo.toISOString()),
      service.from("opinion_upvotes").select("*", { count: "exact", head: true }),
      service.from("inphrosync_responses").select("*", { count: "exact", head: true }),
      service.from("your_turn_votes").select("*", { count: "exact", head: true }),
      service.from("profiles").select("user_type"),
    ]);

    if (usersErr) throw usersErr;
    if (countriesErr) throw countriesErr;

    // Count unique countries
    const countriesCount = new Set(
      (countriesRows ?? [])
        .map((r: any) => (typeof r?.country === "string" ? r.country.trim() : ""))
        .filter(Boolean)
    ).size;

    // Count user types
    const userTypeCounts: Record<string, number> = {};
    (userTypeBreakdown ?? []).forEach((row: any) => {
      const type = row.user_type || "unknown";
      userTypeCounts[type] = (userTypeCounts[type] || 0) + 1;
    });

    // Calculate growth metrics
    const userGrowth = calculateGrowth(thisWeekUsers ?? 0, lastWeekUsers ?? 0);

    // Calculate engagement score (weighted metric)
    const engagementScore = Math.round(
      ((totalOpinions ?? 0) * 10 + 
       (totalUpvotes ?? 0) * 3 + 
       (inphrosyncResponses ?? 0) * 2 + 
       (yourturnVotes ?? 0) * 5) / 
      Math.max(totalUsers ?? 1, 1)
    );

    const payload = {
      // Core counts - always numbers for proper display
      totalUsers: totalUsers ?? 0,
      countriesCount,
      totalOpinions: totalOpinions ?? 0,
      totalUpvotes: totalUpvotes ?? 0,
      
      // Engagement metrics
      activeToday: activeToday ?? 0,
      inphrosyncResponses: inphrosyncResponses ?? 0,
      yourturnVotes: yourturnVotes ?? 0,
      engagementScore,
      
      // Growth metrics
      userGrowth,
      thisWeekUsers: thisWeekUsers ?? 0,
      thisWeekOpinions: thisWeekOpinions ?? 0,
      
      // User type breakdown
      userTypeCounts,
      
      // Calculated metrics
      avgOpinionsPerUser: totalUsers ? Math.round((totalOpinions ?? 0) / totalUsers * 10) / 10 : 0,
      avgUpvotesPerOpinion: totalOpinions ? Math.round((totalUpvotes ?? 0) / totalOpinions * 10) / 10 : 0,
    };

    console.log(`Platform counts request from ${clientIP}, authenticated: ${isAuthenticated}`);

    return new Response(JSON.stringify(payload), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (e) {
    console.error("public-platform-counts error", e);
    return new Response(JSON.stringify({ error: "Internal error" }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
