import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Button } from "@/components/ui/button";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import {
  Users, Film, Music, Tv, Gamepad2, Youtube, Sparkles, ArrowRight,
  Activity, Globe, Zap, Target, Eye, MessageSquare, ThumbsUp,
  Brain, Layers, TrendingUp, BarChart3, Lock, Cpu, Radar,
  Play, Signal, Gauge
} from "lucide-react";
import { 
  HexGridBackground, 
  NeuralNetworkViz, 
  DataStreamViz, 
  GlowingStat,
  HolographicCard,
  CircularProgress,
  WaveformViz,
} from "./FuturisticAnalytics";

const categoryIcons: Record<string, any> = {
  Film, Music, OTT: Tv, TV: Tv, YouTube: Youtube, Gaming: Gamepad2, 
  "Social Media": MessageSquare, "App Development": Sparkles,
};

const categoryColors: Record<string, string> = {
  Film: "hsl(var(--destructive))", 
  Music: "hsl(280 70% 50%)", 
  OTT: "hsl(210 90% 50%)", 
  TV: "hsl(210 90% 50%)",
  YouTube: "hsl(25 90% 50%)", 
  Gaming: "hsl(160 70% 40%)", 
  "Social Media": "hsl(330 80% 55%)", 
  "App Development": "hsl(240 60% 60%)",
};

interface DashboardStats {
  totalUsers: number;
  totalOpinions: number;
  totalUpvotes: number;
  activeToday: number;
  countriesCount: number;
  engagementScore: number;
}

interface CategoryData {
  name: string;
  count: number;
  trend: number;
}

// Live pulse indicator
const LivePulse = ({ size = "md" }: { size?: "sm" | "md" | "lg" }) => {
  const sizes = { sm: "h-1.5 w-1.5", md: "h-2.5 w-2.5", lg: "h-3.5 w-3.5" };
  return (
    <span className="relative flex">
      <span className={`animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75 ${sizes[size]}`} />
      <span className={`relative inline-flex rounded-full bg-emerald-500 ${sizes[size]}`} />
    </span>
  );
};

// Advanced metric card with holographic effect
const MetricCard = ({ 
  label, 
  value, 
  icon: Icon, 
  gradient,
  suffix = "",
  trend,
  isBlurred = false,
}: { 
  label: string;
  value: number;
  icon: any;
  gradient: string;
  suffix?: string;
  trend?: number;
  isBlurred?: boolean;
}) => {
  const [displayValue, setDisplayValue] = useState(0);

  useEffect(() => {
    if (isBlurred) return;
    const duration = 2000;
    const increment = value / (duration / 16);
    let current = 0;
    
    const timer = setInterval(() => {
      current += increment;
      if (current >= value) {
        setDisplayValue(value);
        clearInterval(timer);
      } else {
        setDisplayValue(Math.floor(current));
      }
    }, 16);
    
    return () => clearInterval(timer);
  }, [value, isBlurred]);

  return (
    <HolographicCard className="p-4">
      <div className="flex items-start justify-between mb-3">
        <div className={`w-10 h-10 rounded-xl bg-gradient-to-br ${gradient} flex items-center justify-center shadow-lg`}>
          <Icon className="w-5 h-5 text-white" />
        </div>
        {trend !== undefined && !isBlurred && (
          <div className="flex items-center gap-1 px-2 py-0.5 rounded-full bg-emerald-500/10 border border-emerald-500/20">
            <TrendingUp className="w-3 h-3 text-emerald-500" />
            <span className="text-[10px] font-bold text-emerald-500">+{trend}%</span>
          </div>
        )}
      </div>
      
      <div className={isBlurred ? "blur-md select-none" : ""}>
        <p className="text-3xl font-black tracking-tight">
          {displayValue.toLocaleString()}{suffix}
        </p>
      </div>
      <p className="text-xs text-muted-foreground mt-1">{label}</p>
    </HolographicCard>
  );
};

// Real-time activity ticker
const ActivityTicker = ({ isBlurred = false }: { isBlurred?: boolean }) => {
  const [activities, setActivities] = useState<Array<{
    id: string;
    type: string;
    category?: string;
    time: Date;
  }>>([]);

  useEffect(() => {
    const fetchActivities = async () => {
      const { data } = await supabase
        .from("opinions")
        .select("id, created_at, categories:category_id(name)")
        .order("created_at", { ascending: false })
        .limit(5);

      if (data) {
        setActivities(data.map((op: any) => ({
          id: op.id,
          type: "opinion",
          category: op.categories?.name,
          time: new Date(op.created_at),
        })));
      }
    };

    fetchActivities();
    
    if (!isBlurred) {
      const channel = supabase
        .channel("activity-ticker")
        .on("postgres_changes", { event: "INSERT", schema: "public", table: "opinions" }, fetchActivities)
        .subscribe();

      return () => { supabase.removeChannel(channel); };
    }
  }, [isBlurred]);

  const getTimeAgo = (date: Date) => {
    const seconds = Math.floor((new Date().getTime() - date.getTime()) / 1000);
    if (seconds < 60) return "just now";
    if (seconds < 3600) return `${Math.floor(seconds / 60)}m ago`;
    return `${Math.floor(seconds / 3600)}h ago`;
  };

  return (
    <div className={`space-y-2 ${isBlurred ? "blur-sm" : ""}`}>
      <div className="flex items-center gap-2 mb-3">
        <LivePulse size="sm" />
        <span className="text-xs font-semibold text-muted-foreground">LIVE ACTIVITY</span>
      </div>
      
      <AnimatePresence mode="popLayout">
        {activities.slice(0, 3).map((activity) => (
          <motion.div
            key={activity.id}
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: 20 }}
            className="flex items-center gap-3 p-2 rounded-lg bg-muted/30 border border-border/30"
          >
            <div className="w-6 h-6 rounded-lg bg-primary/10 flex items-center justify-center">
              <MessageSquare className="w-3 h-3 text-primary" />
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-xs font-medium truncate">
                New opinion in {activity.category || "Entertainment"}
              </p>
              <p className="text-[10px] text-muted-foreground">{getTimeAgo(activity.time)}</p>
            </div>
          </motion.div>
        ))}
      </AnimatePresence>
    </div>
  );
};

// Category distribution radar
const CategoryRadar = ({ data, isBlurred = false }: { data: CategoryData[]; isBlurred?: boolean }) => {
  const maxCount = Math.max(...data.map(d => d.count), 1);

  return (
    <div className={`space-y-2 ${isBlurred ? "blur-sm" : ""}`}>
      {data.slice(0, 6).map((cat, i) => {
        const Icon = categoryIcons[cat.name] || Film;
        const percentage = (cat.count / maxCount) * 100;
        const color = categoryColors[cat.name] || "#6366f1";

        return (
          <motion.div
            key={cat.name}
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: i * 0.1 }}
            className="flex items-center gap-3"
          >
            <div 
              className="w-7 h-7 rounded-lg flex items-center justify-center flex-shrink-0"
              style={{ backgroundColor: `${color}20` }}
            >
              <Icon className="w-3.5 h-3.5" style={{ color }} />
            </div>
            <div className="flex-1">
              <div className="flex justify-between text-xs mb-1">
                <span className="font-medium">{cat.name}</span>
                <span className="font-bold">{cat.count}</span>
              </div>
              <div className="h-1.5 bg-muted/50 rounded-full overflow-hidden">
                <motion.div
                  className="h-full rounded-full"
                  style={{ backgroundColor: color }}
                  initial={{ width: 0 }}
                  animate={{ width: `${percentage}%` }}
                  transition={{ delay: 0.5 + i * 0.1, duration: 0.8 }}
                />
              </div>
            </div>
          </motion.div>
        );
      })}
    </div>
  );
};

// Sign-in overlay
const SignInOverlay = ({ onSignIn }: { onSignIn: () => void }) => (
  <motion.div
    initial={{ opacity: 0 }}
    animate={{ opacity: 1 }}
    className="absolute inset-0 z-30 flex items-center justify-center bg-background/90 backdrop-blur-lg rounded-2xl"
  >
    <div className="text-center p-8 max-w-sm">
      <motion.div
        animate={{ 
          boxShadow: [
            "0 0 20px hsl(var(--primary) / 0.3)",
            "0 0 40px hsl(var(--primary) / 0.5)",
            "0 0 20px hsl(var(--primary) / 0.3)",
          ],
        }}
        transition={{ duration: 2, repeat: Infinity }}
        className="w-20 h-20 rounded-2xl bg-gradient-to-br from-primary to-accent flex items-center justify-center mx-auto mb-6"
      >
        <Lock className="w-10 h-10 text-white" />
      </motion.div>
      <h3 className="text-xl font-bold mb-2">Unlock Full Intelligence</h3>
      <p className="text-sm text-muted-foreground mb-6">
        Sign in to access real-time analytics, trending insights, and detailed demographic data.
      </p>
      <Button 
        onClick={onSignIn} 
        size="lg"
        className="w-full bg-gradient-to-r from-primary to-accent hover:opacity-90"
      >
        Get Started
        <ArrowRight className="w-4 h-4 ml-2" />
      </Button>
    </div>
  </motion.div>
);

export const AdvancedDashboardSection = () => {
  const navigate = useNavigate();
  const [isAuthenticated, setIsAuthenticated] = useState<boolean | null>(null);
  const [showSignIn, setShowSignIn] = useState(false);
  const [stats, setStats] = useState<DashboardStats>({
    totalUsers: 0,
    totalOpinions: 0,
    totalUpvotes: 0,
    activeToday: 0,
    countriesCount: 0,
    engagementScore: 0,
  });
  const [categoryData, setCategoryData] = useState<CategoryData[]>([]);
  const [weeklyData, setWeeklyData] = useState<number[]>([]);

  // Check auth
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

  // Show sign-in after delay
  useEffect(() => {
    if (isAuthenticated === false) {
      const timer = setTimeout(() => setShowSignIn(true), 10000);
      return () => clearTimeout(timer);
    }
  }, [isAuthenticated]);

  // Fetch data
  useEffect(() => {
    const fetchData = async () => {
      try {
        const [countsRes, opinionsRes] = await Promise.all([
          supabase.functions.invoke("public-platform-counts", { body: {} }),
          supabase.from("opinions").select("upvotes, category_id, created_at, categories:category_id(name)"),
        ]);

        if (countsRes.data) {
          const d = countsRes.data;
          setStats({
            totalUsers: d.totalUsers || 0,
            totalOpinions: d.totalOpinions || 0,
            totalUpvotes: d.totalUpvotes || 0,
            activeToday: d.activeToday || 0,
            countriesCount: d.countriesCount || 0,
            engagementScore: d.engagementScore || 0,
          });
        }

        if (opinionsRes.data) {
          // Category breakdown
          const catCounts: Record<string, number> = {};
          opinionsRes.data.forEach((op: any) => {
            const name = op.categories?.name || "Other";
            catCounts[name] = (catCounts[name] || 0) + 1;
          });
          setCategoryData(
            Object.entries(catCounts)
              .map(([name, count]) => ({ name, count, trend: 0 }))
              .sort((a, b) => b.count - a.count)
          );

          // Weekly data
          const last7Days: number[] = Array(7).fill(0);
          const now = new Date();
          opinionsRes.data.forEach((op: any) => {
            const created = new Date(op.created_at);
            const dayDiff = Math.floor((now.getTime() - created.getTime()) / (1000 * 60 * 60 * 24));
            if (dayDiff < 7) {
              last7Days[6 - dayDiff]++;
            }
          });
          setWeeklyData(last7Days);
        }
      } catch (err) {
        console.error("Dashboard fetch error:", err);
      }
    };

    fetchData();

    // Real-time updates
    const channel = supabase
      .channel("dashboard-realtime")
      .on("postgres_changes", { event: "*", schema: "public", table: "opinions" }, fetchData)
      .on("postgres_changes", { event: "*", schema: "public", table: "profiles" }, fetchData)
      .subscribe();

    return () => { supabase.removeChannel(channel); };
  }, []);

  const isBlurred = isAuthenticated === false;

  return (
    <section className="relative py-16 overflow-hidden">
      {/* Background effects */}
      <HexGridBackground className="opacity-30" />
      
      <div className="container relative z-10">
        {/* Section header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-center mb-12"
        >
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-primary/10 border border-primary/20 mb-4">
            <LivePulse size="sm" />
            <span className="text-sm font-semibold text-primary">Real-Time Intelligence</span>
          </div>
          <h2 className="text-3xl md:text-4xl font-black tracking-tight mb-4">
            Live Analytics Dashboard
          </h2>
          <p className="text-muted-foreground max-w-2xl mx-auto">
            Watch entertainment preferences unfold in real-time as our community shapes what gets created next.
          </p>
        </motion.div>

        {/* Dashboard grid */}
        <div className="relative">
          {showSignIn && <SignInOverlay onSignIn={() => navigate("/auth")} />}
          
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Left column - Stats */}
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <MetricCard
                  label="Total Users"
                  value={stats.totalUsers}
                  icon={Users}
                  gradient="from-blue-500 to-cyan-500"
                  trend={12}
                  isBlurred={isBlurred}
                />
                <MetricCard
                  label="Opinions"
                  value={stats.totalOpinions}
                  icon={MessageSquare}
                  gradient="from-purple-500 to-pink-500"
                  trend={28}
                  isBlurred={isBlurred}
                />
              </div>
              <MetricCard
                label="Community Engagement"
                value={stats.totalUpvotes}
                icon={ThumbsUp}
                gradient="from-amber-500 to-orange-500"
                suffix=" reactions"
                isBlurred={isBlurred}
              />
              
              {/* Neural network viz */}
              <HolographicCard className="p-4">
                <div className="flex items-center gap-2 mb-3">
                  <Brain className="w-4 h-4 text-primary" />
                  <span className="text-xs font-semibold">AI Processing Pipeline</span>
                </div>
                <NeuralNetworkViz />
              </HolographicCard>
            </div>

            {/* Center column - Main viz */}
            <div className="lg:col-span-1 space-y-4">
              <HolographicCard className="p-6">
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center gap-2">
                    <BarChart3 className="w-4 h-4 text-primary" />
                    <span className="text-sm font-semibold">Category Distribution</span>
                  </div>
                  <LivePulse size="sm" />
                </div>
                <CategoryRadar data={categoryData} isBlurred={isBlurred} />
              </HolographicCard>

              <HolographicCard className="p-4">
                <div className="flex items-center gap-2 mb-3">
                  <Activity className="w-4 h-4 text-primary" />
                  <span className="text-xs font-semibold">7-Day Trend</span>
                </div>
                <div className={isBlurred ? "blur-sm" : ""}>
                  <WaveformViz data={weeklyData.length ? weeklyData : [1, 2, 3, 2, 4, 3, 5]} />
                </div>
              </HolographicCard>

              <DataStreamViz intensity={stats.engagementScore || 5} />
            </div>

            {/* Right column - Activity */}
            <div className="space-y-4">
              <HolographicCard className="p-4">
                <ActivityTicker isBlurred={isBlurred} />
              </HolographicCard>

              <div className="grid grid-cols-2 gap-4">
                <MetricCard
                  label="Active Today"
                  value={stats.activeToday}
                  icon={Zap}
                  gradient="from-emerald-500 to-teal-500"
                  isBlurred={isBlurred}
                />
                <MetricCard
                  label="Countries"
                  value={stats.countriesCount}
                  icon={Globe}
                  gradient="from-indigo-500 to-violet-500"
                  isBlurred={isBlurred}
                />
              </div>

              <HolographicCard className="p-4">
                <div className="flex items-center gap-2 mb-4">
                  <Radar className="w-4 h-4 text-primary" />
                  <span className="text-xs font-semibold">Engagement Score</span>
                </div>
                <div className="flex items-center justify-center">
                  <CircularProgress
                    segments={categoryData.slice(0, 4).map((cat, i) => ({
                      value: cat.count,
                      color: categoryColors[cat.name] || "#6366f1",
                      label: cat.name,
                    }))}
                    size={100}
                  />
                </div>
              </HolographicCard>
            </div>
          </div>
        </div>

        {/* CTA */}
        {!isAuthenticated && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center mt-12"
          >
            <Button
              size="lg"
              onClick={() => navigate("/auth")}
              className="bg-gradient-to-r from-primary via-accent to-primary bg-[length:200%_100%] animate-[shimmer_2s_linear_infinite] text-white"
            >
              Start Shaping Entertainment
              <ArrowRight className="w-4 h-4 ml-2" />
            </Button>
          </motion.div>
        )}
      </div>
    </section>
  );
};
