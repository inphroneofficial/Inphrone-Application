import { useState, useEffect, useMemo, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Button } from "@/components/ui/button";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import {
  Users, Film, Music, Tv, Gamepad2, Youtube, Sparkles, ArrowRight,
  Activity, Globe, Zap, MessageSquare, ThumbsUp, Brain, Layers,
  TrendingUp, BarChart3, ChevronRight, Radio, Wifi, Eye,
} from "lucide-react";
import {
  CircuitBackground,
  HolographicOrbs,
  HolographicCardPremium,
  MetricDisplayAdvanced,
  NeuralNetworkAdvanced,
  LivePulseAdvanced,
  LiveActivityStream,
  ActiveUsersDisplay,
  CategoryRadarAdvanced,
  SignInOverlayPremium,
} from "./UltraPremiumAnalytics";

// Category configuration
const categoryConfig: Record<string, { icon: any; color: string }> = {
  Film: { icon: Film, color: "#ef4444" },
  Music: { icon: Music, color: "#8b5cf6" },
  OTT: { icon: Tv, color: "#3b82f6" },
  TV: { icon: Tv, color: "#6366f1" },
  YouTube: { icon: Youtube, color: "#f97316" },
  Gaming: { icon: Gamepad2, color: "#10b981" },
  "Social Media": { icon: MessageSquare, color: "#ec4899" },
  "App Development": { icon: Sparkles, color: "#8b5cf6" },
};

interface DashboardStats {
  totalUsers: number;
  totalOpinions: number;
  totalUpvotes: number;
  activeToday: number;
  countriesCount: number;
  engagementScore: number;
  userGrowth: number;
}

interface CategoryData {
  name: string;
  count: number;
  icon: any;
  color: string;
}

interface ActivityItem {
  id: string;
  type: string;
  category?: string;
  userType: string;
  time: Date;
}

export const UnifiedLiveDashboard = () => {
  const navigate = useNavigate();
  const [isAuthenticated, setIsAuthenticated] = useState<boolean | null>(null);
  const [showSignIn, setShowSignIn] = useState(false);
  const [activeUsers, setActiveUsers] = useState(0);
  const [stats, setStats] = useState<DashboardStats>({
    totalUsers: 0,
    totalOpinions: 0,
    totalUpvotes: 0,
    activeToday: 0,
    countriesCount: 0,
    engagementScore: 0,
    userGrowth: 0,
  });
  const [categoryData, setCategoryData] = useState<CategoryData[]>([]);
  const [activities, setActivities] = useState<ActivityItem[]>([]);
  const [weeklyTrend, setWeeklyTrend] = useState<number[]>([]);

  // Check authentication
  useEffect(() => {
    const checkAuth = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      setIsAuthenticated(!!session);
    };
    checkAuth();

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setIsAuthenticated(!!session);
    });

    return () => subscription.unsubscribe();
  }, []);

  // Show sign-in overlay after delay for non-authenticated users
  useEffect(() => {
    if (isAuthenticated === false) {
      const timer = setTimeout(() => setShowSignIn(true), 10000);
      return () => clearTimeout(timer);
    }
  }, [isAuthenticated]);

  // Track active users using Supabase Presence
  useEffect(() => {
    const presenceChannel = supabase.channel("landing-presence", {
      config: { presence: { key: `visitor-${Math.random().toString(36).substr(2, 9)}` } },
    });

    presenceChannel
      .on("presence", { event: "sync" }, () => {
        const state = presenceChannel.presenceState();
        const count = Object.keys(state).length;
        setActiveUsers(count);
      })
      .on("presence", { event: "join" }, ({ key, newPresences }) => {
        setActiveUsers(prev => prev + newPresences.length);
      })
      .on("presence", { event: "leave" }, ({ key, leftPresences }) => {
        setActiveUsers(prev => Math.max(0, prev - leftPresences.length));
      })
      .subscribe(async (status) => {
        if (status === "SUBSCRIBED") {
          await presenceChannel.track({
            online_at: new Date().toISOString(),
            page: "landing",
          });
        }
      });

    return () => {
      supabase.removeChannel(presenceChannel);
    };
  }, []);

  // Fetch platform stats
  const fetchStats = useCallback(async () => {
    try {
      const { data, error } = await supabase.functions.invoke("public-platform-counts", { body: {} });
      
      if (error) throw error;
      
      if (data) {
        setStats({
          totalUsers: data.totalUsers || 0,
          totalOpinions: data.totalOpinions || 0,
          totalUpvotes: data.totalUpvotes || 0,
          activeToday: data.activeToday || 0,
          countriesCount: data.countriesCount || 0,
          engagementScore: data.engagementScore || 0,
          userGrowth: data.userGrowth || 0,
        });
      }
    } catch (err) {
      console.error("Stats fetch error:", err);
    }
  }, []);

  // Fetch category breakdown
  const fetchCategories = useCallback(async () => {
    try {
      const { data } = await supabase
        .from("opinions")
        .select("categories:category_id(name)");

      if (data) {
        const counts: Record<string, number> = {};
        data.forEach((op: any) => {
          const name = op.categories?.name || "Other";
          counts[name] = (counts[name] || 0) + 1;
        });

        const sortedCategories = Object.entries(counts)
          .map(([name, count]) => ({
            name,
            count,
            icon: categoryConfig[name]?.icon || MessageSquare,
            color: categoryConfig[name]?.color || "#6366f1",
          }))
          .sort((a, b) => b.count - a.count);

        setCategoryData(sortedCategories);
      }
    } catch (err) {
      console.error("Categories fetch error:", err);
    }
  }, []);

  // Fetch recent activities
  const fetchActivities = useCallback(async () => {
    try {
      const [opinionsRes, upvotesRes] = await Promise.all([
        supabase
          .from("opinions")
          .select("id, created_at, profiles:user_id(user_type), categories:category_id(name)")
          .order("created_at", { ascending: false })
          .limit(5),
        supabase
          .from("opinion_upvotes")
          .select("id, created_at, user_type, opinions:opinion_id(categories:category_id(name))")
          .order("created_at", { ascending: false })
          .limit(5),
      ]);

      const allActivities: ActivityItem[] = [];

      opinionsRes.data?.forEach((op: any) => {
        allActivities.push({
          id: `opinion-${op.id}`,
          type: "opinion",
          category: op.categories?.name,
          userType: op.profiles?.user_type || "Audience",
          time: new Date(op.created_at),
        });
      });

      upvotesRes.data?.forEach((up: any) => {
        allActivities.push({
          id: `upvote-${up.id}`,
          type: "upvote",
          category: up.opinions?.categories?.name,
          userType: up.user_type || "Audience",
          time: new Date(up.created_at),
        });
      });

      // Sort by time and take most recent
      allActivities.sort((a, b) => b.time.getTime() - a.time.getTime());
      setActivities(allActivities.slice(0, 6));
    } catch (err) {
      console.error("Activities fetch error:", err);
    }
  }, []);

  // Fetch weekly trend data
  const fetchWeeklyTrend = useCallback(async () => {
    try {
      const { data } = await supabase
        .from("opinions")
        .select("created_at")
        .gte("created_at", new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString());

      if (data) {
        const dailyCounts = Array(7).fill(0);
        const now = new Date();
        
        data.forEach((op: any) => {
          const created = new Date(op.created_at);
          const dayDiff = Math.floor((now.getTime() - created.getTime()) / (1000 * 60 * 60 * 24));
          if (dayDiff < 7) {
            dailyCounts[6 - dayDiff]++;
          }
        });

        setWeeklyTrend(dailyCounts);
      }
    } catch (err) {
      console.error("Weekly trend fetch error:", err);
    }
  }, []);

  // Initial data fetch
  useEffect(() => {
    fetchStats();
    fetchCategories();
    fetchActivities();
    fetchWeeklyTrend();
  }, [fetchStats, fetchCategories, fetchActivities, fetchWeeklyTrend]);

  // Real-time updates
  useEffect(() => {
    const channel = supabase
      .channel("dashboard-realtime-unified")
      .on("postgres_changes", { event: "*", schema: "public", table: "opinions" }, () => {
        fetchStats();
        fetchCategories();
        fetchActivities();
        fetchWeeklyTrend();
      })
      .on("postgres_changes", { event: "*", schema: "public", table: "opinion_upvotes" }, () => {
        fetchStats();
        fetchActivities();
      })
      .on("postgres_changes", { event: "*", schema: "public", table: "profiles" }, () => {
        fetchStats();
      })
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [fetchStats, fetchCategories, fetchActivities, fetchWeeklyTrend]);

  const isBlurred = isAuthenticated === false;
  const maxTrend = Math.max(...weeklyTrend, 1);

  return (
    <section className="relative py-20 md:py-28 overflow-hidden">
      {/* Premium background effects */}
      <CircuitBackground className="opacity-40" />
      <HolographicOrbs className="opacity-60" />
      
      {/* Gradient overlays */}
      <div className="absolute inset-0 bg-gradient-to-b from-transparent via-background/50 to-background pointer-events-none" />

      <div className="container relative z-10">
        {/* Section header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-center mb-14"
        >
          <motion.div
            initial={{ scale: 0.9, opacity: 0 }}
            whileInView={{ scale: 1, opacity: 1 }}
            viewport={{ once: true }}
            className="inline-flex items-center gap-3 px-5 py-2.5 rounded-full bg-primary/10 border border-primary/20 mb-6"
          >
            <LivePulseAdvanced label="LIVE" count={activeUsers > 0 ? activeUsers : undefined} />
            <span className="text-sm font-bold text-primary">Real-Time Intelligence</span>
          </motion.div>
          
          <h2 className="text-4xl md:text-5xl lg:text-6xl font-black tracking-tight mb-5">
            Live Analytics{" "}
            <span className="text-gradient">Dashboard</span>
          </h2>
          
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            Watch entertainment preferences unfold in real-time as our global community shapes what gets created next.
          </p>
        </motion.div>

        {/* Main dashboard grid */}
        <div className="relative">
          {showSignIn && <SignInOverlayPremium onSignIn={() => navigate("/auth")} />}
          
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
            {/* Left column - Core stats */}
            <div className="lg:col-span-4 space-y-6">
              <MetricDisplayAdvanced
                label="Total Community Members"
                value={stats.totalUsers}
                icon={Users}
                gradient="from-blue-500 to-cyan-500"
                trend={stats.userGrowth > 0 ? stats.userGrowth : undefined}
                isBlurred={isBlurred}
              />
              
              <MetricDisplayAdvanced
                label="Opinions Shared"
                value={stats.totalOpinions}
                icon={MessageSquare}
                gradient="from-violet-500 to-purple-500"
                isBlurred={isBlurred}
              />
              
              <MetricDisplayAdvanced
                label="Community Engagement"
                value={stats.totalUpvotes}
                icon={ThumbsUp}
                gradient="from-amber-500 to-orange-500"
                suffix=" reactions"
                isBlurred={isBlurred}
              />
              
              {/* AI Processing visualization */}
              <HolographicCardPremium className="p-5">
                <div className="flex items-center gap-2 mb-4">
                  <Brain className="w-5 h-5 text-primary" />
                  <span className="text-sm font-semibold">AI Processing Pipeline</span>
                  <div className="ml-auto">
                    <LivePulseAdvanced label="" />
                  </div>
                </div>
                <NeuralNetworkAdvanced />
              </HolographicCardPremium>
            </div>

            {/* Center column - Category distribution & trends */}
            <div className="lg:col-span-4 space-y-6">
              {/* Category breakdown */}
              <HolographicCardPremium className="p-6">
                <div className="flex items-center justify-between mb-5">
                  <div className="flex items-center gap-2">
                    <BarChart3 className="w-5 h-5 text-primary" />
                    <span className="text-sm font-semibold">Category Distribution</span>
                  </div>
                  <LivePulseAdvanced label="LIVE" />
                </div>
                <CategoryRadarAdvanced data={categoryData} isBlurred={isBlurred} />
              </HolographicCardPremium>

              {/* Weekly trend chart */}
              <HolographicCardPremium className="p-5">
                <div className="flex items-center gap-2 mb-4">
                  <TrendingUp className="w-5 h-5 text-primary" />
                  <span className="text-sm font-semibold">7-Day Activity Trend</span>
                </div>
                <div className={cn("flex items-end gap-1 h-20", isBlurred && "blur-sm")}>
                  {weeklyTrend.map((value, i) => (
                    <motion.div
                      key={i}
                      className="flex-1 rounded-t-sm relative overflow-hidden"
                      style={{
                        background: "linear-gradient(to top, hsl(var(--primary)), hsl(var(--primary) / 0.5))",
                      }}
                      initial={{ height: 0 }}
                      animate={{ height: `${Math.max((value / maxTrend) * 100, 8)}%` }}
                      transition={{ delay: 0.3 + i * 0.08, duration: 0.6, ease: "easeOut" }}
                    >
                      {/* Shimmer effect */}
                      <motion.div
                        className="absolute inset-0 bg-gradient-to-t from-transparent via-white/20 to-transparent"
                        animate={{ y: ["100%", "-100%"] }}
                        transition={{ duration: 2, repeat: Infinity, repeatDelay: 3 + i * 0.5 }}
                      />
                    </motion.div>
                  ))}
                </div>
                <div className="flex justify-between mt-2 text-[10px] text-muted-foreground">
                  <span>7 days ago</span>
                  <span>Today</span>
                </div>
              </HolographicCardPremium>

              {/* Data flow visualization */}
              <HolographicCardPremium className="p-4">
                <div className="flex items-center gap-2 mb-3">
                  <Radio className="w-4 h-4 text-primary" />
                  <span className="text-xs font-semibold">Live Data Stream</span>
                  <div className="ml-auto flex items-center gap-1">
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                    <span className="text-[10px] text-emerald-500 font-mono">STREAMING</span>
                  </div>
                </div>
                <div className="relative h-16 overflow-hidden rounded-lg bg-muted/20">
                  {Array.from({ length: 15 }).map((_, i) => (
                    <motion.div
                      key={i}
                      className="absolute rounded-full bg-primary"
                      style={{
                        width: 3 + Math.random() * 4,
                        height: 3 + Math.random() * 4,
                        top: `${15 + (i % 4) * 20}%`,
                        filter: "blur(0.5px)",
                      }}
                      animate={{
                        left: ["-5%", "105%"],
                        opacity: [0, 1, 1, 0],
                      }}
                      transition={{
                        duration: 2 + Math.random(),
                        delay: i * 0.2,
                        repeat: Infinity,
                        ease: "linear",
                      }}
                    />
                  ))}
                </div>
              </HolographicCardPremium>
            </div>

            {/* Right column - Live activity & presence */}
            <div className="lg:col-span-4 space-y-6">
              {/* Active users with real presence */}
              <ActiveUsersDisplay count={activeUsers} isBlurred={isBlurred} />
              
              {/* Stats row */}
              <div className="grid grid-cols-2 gap-4">
                <MetricDisplayAdvanced
                  label="Countries"
                  value={stats.countriesCount}
                  icon={Globe}
                  gradient="from-indigo-500 to-violet-500"
                  isBlurred={isBlurred}
                />
                <MetricDisplayAdvanced
                  label="Engagement"
                  value={stats.engagementScore}
                  icon={Zap}
                  gradient="from-emerald-500 to-teal-500"
                  isLive
                  isBlurred={isBlurred}
                />
              </div>

              {/* Live activity feed */}
              <HolographicCardPremium className="p-5">
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center gap-2">
                    <Activity className="w-5 h-5 text-primary" />
                    <span className="text-sm font-semibold">Live Activity</span>
                  </div>
                  <LivePulseAdvanced label="LIVE" />
                </div>
                <LiveActivityStream activities={activities} isBlurred={isBlurred} />
              </HolographicCardPremium>
            </div>
          </div>
        </div>

        {/* CTA for non-authenticated users */}
        {!isAuthenticated && !showSignIn && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center mt-14"
          >
            <Button
              size="lg"
              onClick={() => navigate("/auth")}
              className="text-lg px-10 py-7 rounded-xl font-bold relative overflow-hidden group"
              style={{
                background: "linear-gradient(135deg, hsl(var(--primary)), hsl(var(--accent)))",
              }}
            >
              <span className="relative z-10 flex items-center gap-2">
                Start Shaping Entertainment
                <ChevronRight className="w-5 h-5" />
              </span>
              <motion.div
                className="absolute inset-0 bg-white/20"
                initial={{ x: "-100%" }}
                whileHover={{ x: "100%" }}
                transition={{ duration: 0.5 }}
              />
            </Button>
          </motion.div>
        )}
      </div>
    </section>
  );
};

// Helper function
function cn(...classes: (string | boolean | undefined)[]) {
  return classes.filter(Boolean).join(" ");
}
