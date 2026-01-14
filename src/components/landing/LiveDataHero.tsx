import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Button } from "@/components/ui/button";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import {
  TrendingUp,
  Users,
  Film,
  Music,
  Tv,
  Gamepad2,
  Youtube,
  Lightbulb,
  Sparkles,
  ArrowRight,
  BarChart3,
  Activity,
  Globe,
  Zap,
  Target,
  Eye,
  MessageSquare,
  Play,
  ThumbsUp,
  Layers,
  Clock,
  Heart,
} from "lucide-react";

interface PlatformStats {
  totalUsers: number;
  totalOpinions: number;
  totalCategories: number;
  totalUpvotes: number;
  totalViews: number;
  countriesCount: number;
}

interface CategoryData {
  category_name: string;
  opinion_count: number;
}

interface DailyData {
  date: string;
  count: number;
}

// Animated counter hook
const useAnimatedCounter = (end: number, duration: number = 2000, delay: number = 0) => {
  const [count, setCount] = useState(0);
  
  useEffect(() => {
    const timeout = setTimeout(() => {
      let start = 0;
      const increment = end / (duration / 16);
      const timer = setInterval(() => {
        start += increment;
        if (start >= end) {
          setCount(end);
          clearInterval(timer);
        } else {
          setCount(Math.floor(start));
        }
      }, 16);
      return () => clearInterval(timer);
    }, delay);
    return () => clearTimeout(timeout);
  }, [end, duration, delay]);
  
  return count;
};

// Live pulse indicator
const LivePulse = () => (
  <span className="relative flex h-2.5 w-2.5">
    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75" />
    <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-emerald-500" />
  </span>
);

// Advanced data card with real data - shows exact numbers on all devices
const AdvancedDataCard = ({ 
  title, 
  value, 
  suffix, 
  trend, 
  icon: Icon, 
  gradient,
  delay = 0,
  subtext
}: { 
  title: string; 
  value: number; 
  suffix?: string; 
  trend?: string; 
  icon: any; 
  gradient: string;
  delay?: number;
  subtext?: string;
}) => {
  const animatedValue = useAnimatedCounter(value, 2000, delay);
  
  return (
    <motion.div
      initial={{ opacity: 0, y: 20, scale: 0.95 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      transition={{ delay: delay / 1000, duration: 0.5 }}
      className="relative group"
    >
      <div className={`absolute -inset-1 bg-gradient-to-r ${gradient} rounded-2xl blur-xl opacity-0 group-hover:opacity-40 transition-all duration-500`} />
      <div className="relative p-4 rounded-xl bg-card/90 backdrop-blur-xl border border-border/40 hover:border-primary/30 transition-all shadow-lg hover:shadow-xl">
        <div className="flex items-center justify-between mb-3">
          <div className={`w-10 h-10 rounded-xl bg-gradient-to-br ${gradient} flex items-center justify-center shadow-lg`}>
            <Icon className="w-5 h-5 text-white" />
          </div>
          {trend && (
            <motion.div 
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: (delay + 500) / 1000 }}
              className="flex items-center gap-1 px-2 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/20"
            >
              <TrendingUp className="w-3 h-3 text-emerald-500" />
              <span className="text-xs font-semibold text-emerald-500">{trend}</span>
            </motion.div>
          )}
        </div>
        <p className="text-2xl md:text-3xl font-black font-display text-foreground tracking-tight">
          {animatedValue.toLocaleString()}{suffix}
        </p>
        <p className="text-xs font-medium text-muted-foreground mt-1">{title}</p>
        {subtext && (
          <p className="text-[10px] text-muted-foreground/70 mt-0.5">{subtext}</p>
        )}
      </div>
    </motion.div>
  );
};

// Category bar with real data
const CategoryBar = ({ 
  name, 
  count, 
  maxCount, 
  color, 
  delay,
  icon: Icon
}: { 
  name: string; 
  count: number; 
  maxCount: number; 
  color: string;
  delay: number;
  icon: any;
}) => {
  const percentage = maxCount > 0 ? (count / maxCount) * 100 : 0;
  
  return (
    <motion.div
      initial={{ opacity: 0, x: -20 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ delay }}
      className="flex items-center gap-3 group"
    >
      <div className={`w-6 h-6 rounded-lg bg-gradient-to-br ${color} flex items-center justify-center flex-shrink-0`}>
        <Icon className="w-3 h-3 text-white" />
      </div>
      <div className="flex-1 min-w-0">
        <div className="flex items-center justify-between mb-1">
          <span className="text-xs font-medium text-foreground truncate">{name}</span>
          <span className="text-xs font-bold text-foreground ml-2">{count}</span>
        </div>
        <div className="h-2 bg-muted/50 rounded-full overflow-hidden">
          <motion.div
            className={`h-full bg-gradient-to-r ${color} rounded-full`}
            initial={{ width: 0 }}
            animate={{ width: `${percentage}%` }}
            transition={{ delay: delay + 0.2, duration: 0.8, ease: "easeOut" }}
          />
        </div>
      </div>
    </motion.div>
  );
};

// Animated donut chart with real proportions
const LiveDonutChart = ({ data }: { data: CategoryData[] }) => {
  const total = data.reduce((sum, item) => sum + item.opinion_count, 0);
  const colors = ["#ef4444", "#8b5cf6", "#3b82f6", "#10b981", "#f59e0b", "#ec4899"];
  
  let offset = 0;
  
  return (
    <div className="relative w-24 h-24 mx-auto">
      <svg className="w-full h-full -rotate-90" viewBox="0 0 36 36">
        <circle
          cx="18"
          cy="18"
          r="15.9"
          fill="transparent"
          stroke="hsl(var(--muted))"
          strokeWidth="2"
          opacity="0.3"
        />
        {data.slice(0, 6).map((item, i) => {
          const percentage = total > 0 ? (item.opinion_count / total) * 100 : 0;
          const dashArray = percentage;
          const dashOffset = 100 - offset;
          offset += percentage;
          
          return (
            <motion.circle
              key={i}
              cx="18"
              cy="18"
              r="15.9"
              fill="transparent"
              stroke={colors[i]}
              strokeWidth="3"
              strokeLinecap="round"
              strokeDasharray={`${dashArray} ${100 - dashArray}`}
              strokeDashoffset={dashOffset}
              initial={{ opacity: 0, pathLength: 0 }}
              animate={{ opacity: 1, pathLength: 1 }}
              transition={{ delay: 0.5 + i * 0.1, duration: 0.6 }}
            />
          );
        })}
      </svg>
      <div className="absolute inset-0 flex flex-col items-center justify-center">
        <span className="text-lg font-black text-foreground">{total}</span>
        <span className="text-[8px] text-muted-foreground">TOTAL</span>
      </div>
    </div>
  );
};

// Weekly trend sparkline with real data
const WeeklySparkline = ({ data }: { data: DailyData[] }) => {
  const counts = data.map(d => d.count);
  const max = Math.max(...counts, 1);
  const min = Math.min(...counts, 0);
  const range = max - min || 1;
  
  // Pad to 7 days
  const paddedData = [...Array(7)].map((_, i) => {
    const dayData = data.find((_, idx) => idx === i);
    return dayData?.count || 0;
  });
  
  return (
    <div className="flex items-end gap-1 h-12 w-full">
      {paddedData.map((value, i) => (
        <motion.div
          key={i}
          className="flex-1 bg-gradient-to-t from-primary to-primary/60 rounded-t-sm relative group cursor-pointer"
          initial={{ height: 0 }}
          animate={{ height: `${Math.max(((value - min) / range) * 100, 8)}%` }}
          transition={{ delay: 0.3 + i * 0.08, duration: 0.5 }}
          whileHover={{ scale: 1.1 }}
        >
          <div className="absolute -top-6 left-1/2 -translate-x-1/2 opacity-0 group-hover:opacity-100 transition-opacity">
            <span className="text-[10px] font-bold text-foreground bg-card/90 px-1.5 py-0.5 rounded border border-border/50 whitespace-nowrap">
              {value}
            </span>
          </div>
        </motion.div>
      ))}
    </div>
  );
};

interface RealActivity {
  id: string;
  type: "opinion" | "upvote" | "view" | "user_joined";
  user_type: string;
  category?: string;
  action: string;
  time: Date;
  icon: any;
}

// Live activity feed with REAL database activities (anonymous + privacy-safe)
const LiveActivityFeed = () => {
  const [activities, setActivities] = useState<RealActivity[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const categoryIcons: Record<string, any> = {
    Film,
    Music,
    OTT: Tv,
    TV: Tv,
    YouTube: Youtube,
    Gaming: Gamepad2,
    "Social Media": Lightbulb,
    "App Development": Sparkles,
  };

  const roleLabels: Record<string, string> = {
    audience: "Audience member",
    creator: "Creator",
    studio: "Studio member",
    production: "Production member",
    ott: "OTT member",
    tv: "TV member",
    gaming: "Gaming member",
    music: "Music member",
    developer: "Developer",
  };

  const getRoleLabel = (userType?: string | null) => {
    const key = (userType || "").toLowerCase();
    return roleLabels[key] ?? "Community member";
  };

  const getTimeAgo = (date: Date) => {
    const seconds = Math.floor((new Date().getTime() - date.getTime()) / 1000);
    if (seconds < 60) return "just now";
    if (seconds < 3600) return `${Math.floor(seconds / 60)}m ago`;
    if (seconds < 86400) return `${Math.floor(seconds / 3600)}h ago`;
    return `${Math.floor(seconds / 86400)}d ago`;
  };

  const fetchRealActivities = async () => {
    try {
      // Recent opinions (no names; only role + category)
      const { data: recentOpinions } = await supabase
        .from("opinions")
        .select(
          `
          id, created_at,
          profiles:user_id(user_type),
          categories:category_id(name)
        `
        )
        .order("created_at", { ascending: false })
        .limit(5);

      // Recent upvotes (user_type is already stored on the upvote row)
      const { data: recentUpvotes } = await supabase
        .from("opinion_upvotes")
        .select(
          `
          id, created_at, user_type,
          opinions:opinion_id(categories:category_id(name))
        `
        )
        .order("created_at", { ascending: false })
        .limit(5);

      // Recent profile creations (new users) — anonymous
      const { data: recentUsers } = await supabase
        .from("profiles")
        .select("id, user_type, created_at")
        .order("created_at", { ascending: false })
        .limit(3);

      const allActivities: RealActivity[] = [];

      recentOpinions?.forEach((op: any) => {
        const categoryName = op.categories?.name || "Entertainment";
        allActivities.push({
          id: `opinion-${op.id}`,
          type: "opinion",
          user_type: op.profiles?.user_type || "audience",
          category: categoryName,
          action: "shared an opinion",
          time: new Date(op.created_at),
          icon: categoryIcons[categoryName] || MessageSquare,
        });
      });

      recentUpvotes?.forEach((up: any) => {
        const categoryName = up.opinions?.categories?.name || "Entertainment";
        allActivities.push({
          id: `upvote-${up.id}`,
          type: "upvote",
          user_type: up.user_type || "audience",
          category: categoryName,
          action: "liked an opinion",
          time: new Date(up.created_at),
          icon: ThumbsUp,
        });
      });

      recentUsers?.forEach((user: any) => {
        allActivities.push({
          id: `user-${user.id}`,
          type: "user_joined",
          user_type: user.user_type || "audience",
          action: "joined",
          time: new Date(user.created_at),
          icon: Users,
        });
      });

      allActivities.sort((a, b) => b.time.getTime() - a.time.getTime());
      setActivities(allActivities.slice(0, 4));
      setIsLoading(false);
    } catch (error) {
      console.error("Error fetching activities:", error);
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchRealActivities();

    // Realtime subscription for new activities
    const activityChannel = supabase
      .channel("realtime-activity")
      .on("postgres_changes", { event: "INSERT", schema: "public", table: "opinions" }, () => {
        fetchRealActivities();
      })
      .on(
        "postgres_changes",
        { event: "INSERT", schema: "public", table: "opinion_upvotes" },
        () => {
          fetchRealActivities();
        }
      )
      .on("postgres_changes", { event: "INSERT", schema: "public", table: "profiles" }, () => {
        fetchRealActivities();
      })
      .subscribe();

    // Refresh every 15 seconds
    const interval = setInterval(fetchRealActivities, 15000);

    return () => {
      supabase.removeChannel(activityChannel);
      clearInterval(interval);
    };
  }, []);

  if (isLoading) {
    return (
      <div className="space-y-2">
        {[1, 2, 3].map((i) => (
          <div key={i} className="h-12 rounded-xl bg-muted/30 animate-pulse" />
        ))}
      </div>
    );
  }

  if (activities.length === 0) {
    return (
      <div className="text-center py-4 text-xs text-muted-foreground">Be the first to share an opinion!</div>
    );
  }

  return (
    <div className="space-y-2">
      <AnimatePresence mode="popLayout">
        {activities.map((activity) => (
          <motion.div
            key={activity.id}
            initial={{ opacity: 0, x: -20, height: 0 }}
            animate={{ opacity: 1, x: 0, height: "auto" }}
            exit={{ opacity: 0, x: 20, height: 0 }}
            transition={{ duration: 0.3 }}
            className="flex items-center gap-3 p-2.5 rounded-xl bg-muted/30 border border-border/30 hover:border-primary/20 transition-all group"
          >
            <div
              className={`w-7 h-7 rounded-lg flex items-center justify-center group-hover:scale-110 transition-transform ${
                activity.type === "opinion"
                  ? "bg-violet-500/10"
                  : activity.type === "upvote"
                    ? "bg-amber-500/10"
                    : "bg-emerald-500/10"
              }`}
            >
              <activity.icon
                className={`w-3.5 h-3.5 ${
                  activity.type === "opinion"
                    ? "text-violet-500"
                    : activity.type === "upvote"
                      ? "text-amber-500"
                      : "text-emerald-500"
                }`}
              />
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-xs font-medium text-foreground truncate">
                <span className="font-bold">{getRoleLabel(activity.user_type)}</span> {activity.action}
              </p>
              <p className="text-[10px] text-muted-foreground">
                {activity.category && `${activity.category} • `}
                {getTimeAgo(activity.time)}
              </p>
            </div>
            <LivePulse />
          </motion.div>
        ))}
      </AnimatePresence>
    </div>
  );
};

export const LiveDataHero = () => {
  const navigate = useNavigate();
  const [currentTime, setCurrentTime] = useState(new Date());
  const [stats, setStats] = useState<PlatformStats>({
    totalUsers: 0,
    totalOpinions: 0,
    totalCategories: 8,
    totalUpvotes: 0,
    totalViews: 0,
    countriesCount: 0,
  });
  const [categoryData, setCategoryData] = useState<CategoryData[]>([]);
  const [weeklyData, setWeeklyData] = useState<DailyData[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  
  // Fetch real data from Supabase
  useEffect(() => {
    const fetchData = async () => {
      try {
        // Fetch main stats
        const [
          { count: opinionsCount },
          { count: categoriesCount },
          opinionsWithUpvotes,
          { count: viewsCount },
          countsRes,
        ] = await Promise.all([
          supabase.from('opinions').select('*', { count: 'exact', head: true }),
          supabase.from('categories').select('*', { count: 'exact', head: true }),
          supabase.from('opinions').select('upvotes'),
          supabase.from('opinion_views').select('*', { count: 'exact', head: true }),
          supabase.functions.invoke('public-platform-counts', { body: {} }),
        ]);

        if (countsRes.error) throw countsRes.error;

        const totalUsers = countsRes.data?.totalUsers ?? 0;
        const countriesCount = countsRes.data?.countriesCount ?? 0;

        const totalUpvotes = opinionsWithUpvotes.data?.reduce((sum, o) => sum + (o.upvotes || 0), 0) || 0;

        setStats({
          totalUsers,
          totalOpinions: opinionsCount || 0,
          totalCategories: categoriesCount || 8,
          totalUpvotes,
          totalViews: viewsCount || 0,
          countriesCount,
        });
        
        // Fetch category breakdown
        const { data: catData } = await supabase
          .from('categories')
          .select(`
            name,
            opinions:opinions(count)
          `);
        
        if (catData) {
          const formatted = catData.map(c => ({
            category_name: c.name,
            opinion_count: (c.opinions as any)?.[0]?.count || 0,
          })).sort((a, b) => b.opinion_count - a.opinion_count);
          setCategoryData(formatted);
        }
        
        // Fetch weekly data (last 7 days)
        const sevenDaysAgo = new Date();
        sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);
        
        const { data: weeklyOpinions } = await supabase
          .from('opinions')
          .select('created_at')
          .gte('created_at', sevenDaysAgo.toISOString());
        
        if (weeklyOpinions) {
          const dailyCounts: Record<string, number> = {};
          weeklyOpinions.forEach(o => {
            const date = new Date(o.created_at).toISOString().split('T')[0];
            dailyCounts[date] = (dailyCounts[date] || 0) + 1;
          });
          
          const sortedDays = Object.entries(dailyCounts)
            .map(([date, count]) => ({ date, count }))
            .sort((a, b) => a.date.localeCompare(b.date));
          
          setWeeklyData(sortedDays);
        }
        
        setIsLoading(false);
      } catch (error) {
        console.error('Error fetching stats:', error);
        setIsLoading(false);
      }
    };
    
    fetchData();
    
    // Update key totals immediately when profiles (new users / country changes) change
    const statsChannel = supabase
      .channel('realtime-platform-stats')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'profiles' }, () => {
        fetchData();
      })
      .subscribe();
    
    // Refresh data every 30 seconds
    const refreshInterval = setInterval(fetchData, 30000);
    return () => {
      supabase.removeChannel(statsChannel);
      clearInterval(refreshInterval);
    };
  }, []);
  
  // Update current time
  useEffect(() => {
    const timer = setInterval(() => setCurrentTime(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);
  
  const categoryIcons: Record<string, any> = {
    "Film": Film,
    "Music": Music,
    "OTT": Tv,
    "TV": Tv,
    "YouTube": Youtube,
    "Gaming": Gamepad2,
    "Social Media": Lightbulb,
    "App Development": Sparkles,
  };
  
  const categoryColors: Record<string, string> = {
    "Film": "from-rose-500 to-pink-600",
    "Music": "from-violet-500 to-purple-600",
    "OTT": "from-blue-500 to-cyan-600",
    "TV": "from-indigo-500 to-blue-600",
    "YouTube": "from-red-500 to-orange-600",
    "Gaming": "from-emerald-500 to-teal-600",
    "Social Media": "from-cyan-500 to-blue-600",
    "App Development": "from-purple-500 to-pink-600",
  };
  
  const categories = [
    { icon: Film, label: "Film", color: "from-rose-500 to-pink-600" },
    { icon: Music, label: "Music", color: "from-violet-500 to-purple-600" },
    { icon: Tv, label: "OTT", color: "from-blue-500 to-cyan-600" },
    { icon: Tv, label: "TV", color: "from-indigo-500 to-blue-600" },
    { icon: Youtube, label: "YouTube", color: "from-red-500 to-orange-600" },
    { icon: Gamepad2, label: "Gaming", color: "from-emerald-500 to-teal-600" },
    { icon: Lightbulb, label: "Social", color: "from-cyan-500 to-blue-600" },
    { icon: Sparkles, label: "App Dev", color: "from-purple-500 to-pink-600" },
  ];
  
  const maxCategoryCount = Math.max(...categoryData.map(c => c.opinion_count), 1);
  
  return (
    <section className="relative min-h-[100vh] flex items-center justify-center overflow-hidden pt-4 pb-16">
      {/* Premium animated background */}
      <div className="absolute inset-0">
        {/* Subtle grid */}
        <div className="absolute inset-0 bg-[linear-gradient(to_right,hsl(var(--border)/0.1)_1px,transparent_1px),linear-gradient(to_bottom,hsl(var(--border)/0.1)_1px,transparent_1px)] bg-[size:4rem_4rem]" />
        
        {/* Gradient orbs */}
        <motion.div
          className="absolute top-[10%] left-[5%] w-96 h-96 rounded-full bg-primary/10 blur-[100px]"
          animate={{ 
            y: [0, -50, 0], 
            x: [0, 30, 0],
            scale: [1, 1.2, 1] 
          }}
          transition={{ duration: 15, repeat: Infinity, ease: "easeInOut" }}
        />
        <motion.div
          className="absolute bottom-[10%] right-[5%] w-[500px] h-[500px] rounded-full bg-accent/10 blur-[120px]"
          animate={{ 
            y: [0, 50, 0], 
            x: [0, -40, 0],
            scale: [1.2, 1, 1.2] 
          }}
          transition={{ duration: 20, repeat: Infinity, ease: "easeInOut" }}
        />
        
        {/* Floating particles */}
        {[...Array(15)].map((_, i) => (
          <motion.div
            key={i}
            className="absolute w-1 h-1 rounded-full bg-primary/40"
            style={{
              left: `${10 + Math.random() * 80}%`,
              top: `${10 + Math.random() * 80}%`,
            }}
            animate={{
              y: [-20, 20, -20],
              opacity: [0.2, 0.6, 0.2],
              scale: [1, 1.5, 1],
            }}
            transition={{
              duration: 3 + Math.random() * 4,
              repeat: Infinity,
              delay: Math.random() * 3,
            }}
          />
        ))}
      </div>
      
      <div className="container mx-auto px-4 relative z-10">
        <div className="grid lg:grid-cols-12 gap-10 items-center">
          {/* Left: Main Content */}
          <div className="lg:col-span-6 space-y-8">
            {/* Live status badge */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}
            >
              <div className="inline-flex items-center gap-4 px-5 py-2.5 rounded-full bg-card/80 border border-border/50 backdrop-blur-xl shadow-xl">
                <div className="flex items-center gap-2">
                  <LivePulse />
                  <span className="text-sm font-bold text-emerald-500 tracking-wide">
                    LIVE PLATFORM
                  </span>
                </div>
                <div className="w-px h-4 bg-border" />
                <span className="text-sm font-mono text-muted-foreground">
                  {currentTime.toLocaleTimeString()}
                </span>
              </div>
            </motion.div>
            
            {/* Main heading */}
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
              className="space-y-6"
            >
              <h1 className="text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-display font-black tracking-tight leading-[0.9]">
                <span className="block text-foreground">Real-Time</span>
                <motion.span 
                  className="block text-transparent bg-clip-text bg-gradient-to-r from-primary via-primary to-accent"
                  animate={{ backgroundPosition: ["0%", "100%", "0%"] }}
                  transition={{ duration: 5, repeat: Infinity }}
                  style={{ backgroundSize: "200%" }}
                >
                  Entertainment
                </motion.span>
                <span className="block text-foreground">Intelligence</span>
              </h1>
              <p className="text-lg md:text-xl text-muted-foreground max-w-xl leading-relaxed">
                The world's first <span className="text-foreground font-semibold">Audience-Intelligence Platform</span>. 
                Live data from authentic opinions shaping what gets created next.
              </p>
            </motion.div>
            
            {/* Live stats row */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 }}
              className="flex flex-wrap gap-6"
            >
              <div className="flex items-center gap-2">
                <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center">
                  <Users className="w-5 h-5 text-primary" />
                </div>
                <div>
                  <p className="text-2xl font-black text-foreground">{stats.totalUsers.toLocaleString()}</p>
                  <p className="text-xs text-muted-foreground">Users</p>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-10 h-10 rounded-xl bg-violet-500/10 flex items-center justify-center">
                  <MessageSquare className="w-5 h-5 text-violet-500" />
                </div>
                <div>
                  <p className="text-2xl font-black text-foreground">{stats.totalOpinions}+</p>
                  <p className="text-xs text-muted-foreground">Opinions</p>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-10 h-10 rounded-xl bg-emerald-500/10 flex items-center justify-center">
                  <Globe className="w-5 h-5 text-emerald-500" />
                </div>
                <div>
                  <p className="text-2xl font-black text-foreground">{stats.countriesCount.toLocaleString()}</p>
                  <p className="text-xs text-muted-foreground">Countries</p>
                </div>
              </div>
            </motion.div>
            
            {/* CTA buttons */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.4 }}
              className="flex flex-wrap gap-4"
            >
              <motion.div whileHover={{ scale: 1.03, y: -3 }} whileTap={{ scale: 0.98 }}>
                <Button
                  size="lg"
                  className="text-base px-8 py-6 rounded-xl font-bold bg-gradient-to-r from-primary to-primary/80 hover:from-primary/90 hover:to-primary shadow-xl shadow-primary/25 border-0"
                  onClick={() => navigate("/auth")}
                >
                  Start Sharing Opinions
                  <ArrowRight className="w-4 h-4 ml-2" />
                </Button>
              </motion.div>
              <motion.div whileHover={{ scale: 1.03, y: -3 }} whileTap={{ scale: 0.98 }}>
                <Button
                  size="lg"
                  variant="outline"
                  className="text-base px-8 py-6 rounded-xl font-semibold border-2 bg-card/50 backdrop-blur-sm hover:bg-card/80"
                  onClick={() => navigate("/auth")}
                >
                  <Play className="w-4 h-4 mr-2" />
                  I'm a Creator
                </Button>
              </motion.div>
            </motion.div>
            
            {/* Category pills */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.5 }}
              className="flex flex-wrap gap-2"
            >
              {categories.map((cat, i) => (
                <motion.div
                  key={cat.label}
                  initial={{ opacity: 0, scale: 0.8 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ delay: 0.6 + i * 0.04 }}
                  whileHover={{ scale: 1.08, y: -3 }}
                  className="flex items-center gap-2 px-3 py-1.5 rounded-xl bg-card/60 border border-border/40 cursor-pointer hover:border-primary/30 hover:shadow-lg transition-all"
                >
                  <div className={`w-5 h-5 rounded-md bg-gradient-to-br ${cat.color} flex items-center justify-center shadow-sm`}>
                    <cat.icon className="w-3 h-3 text-white" />
                  </div>
                  <span className="text-xs font-medium text-foreground">{cat.label}</span>
                </motion.div>
              ))}
            </motion.div>
          </div>
          
          {/* Right: Advanced Data Dashboard */}
          <div className="lg:col-span-6">
            <motion.div
              initial={{ opacity: 0, x: 50, rotateY: -5 }}
              animate={{ opacity: 1, x: 0, rotateY: 0 }}
              transition={{ delay: 0.3, duration: 0.7 }}
              className="relative"
            >
              {/* Multi-layer glow effect */}
              <div className="absolute -inset-4 bg-gradient-to-r from-primary/30 via-accent/20 to-primary/30 rounded-[2rem] blur-3xl opacity-40" />
              <div className="absolute -inset-2 bg-gradient-to-br from-primary/10 to-accent/10 rounded-[1.5rem] blur-xl" />
              
              {/* Dashboard container */}
              <div className="relative bg-card/95 backdrop-blur-2xl border border-border/50 rounded-2xl shadow-2xl overflow-hidden">
                {/* Header */}
                <div className="flex items-center justify-between p-5 border-b border-border/50 bg-muted/20">
                  <div className="flex items-center gap-3">
                    <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-primary to-accent flex items-center justify-center shadow-lg">
                      <Activity className="w-4 h-4 text-white" />
                    </div>
                    <div>
                      <span className="text-sm font-bold text-foreground">Live Dashboard</span>
                      <p className="text-[10px] text-muted-foreground">Powered by real audience data</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-emerald-500/10 border border-emerald-500/20">
                    <LivePulse />
                    <span className="text-xs font-semibold text-emerald-500">Real-time</span>
                  </div>
                </div>
                
                {/* Main content */}
                <div className="p-5 space-y-5">
                  {/* Top stats row */}
                  <div className="grid grid-cols-2 gap-3">
                    <AdvancedDataCard
                      title="Total Users"
                      value={stats.totalUsers}
                      icon={Users}
                      gradient="from-primary to-primary/70"
                      trend="+12%"
                      delay={300}
                      subtext="Active community members"
                    />
                    <AdvancedDataCard
                      title="Total Opinions"
                      value={stats.totalOpinions}
                      icon={MessageSquare}
                      gradient="from-violet-500 to-purple-600"
                      trend="+8%"
                      delay={450}
                      subtext="Authentic insights shared"
                    />
                  </div>
                  
                  {/* Second stats row */}
                  <div className="grid grid-cols-3 gap-3">
                    <AdvancedDataCard
                      title="Categories"
                      value={stats.totalCategories}
                      icon={Layers}
                      gradient="from-blue-500 to-cyan-500"
                      delay={600}
                    />
                    <AdvancedDataCard
                      title="Upvotes"
                      value={stats.totalUpvotes}
                      icon={ThumbsUp}
                      gradient="from-amber-500 to-orange-500"
                      delay={750}
                    />
                    <AdvancedDataCard
                      title="Views"
                      value={stats.totalViews}
                      icon={Eye}
                      gradient="from-emerald-500 to-teal-500"
                      delay={900}
                    />
                  </div>
                  
                  {/* Charts section */}
                  <div className="grid grid-cols-2 gap-4">
                    {/* Category breakdown */}
                    <div className="p-4 rounded-xl bg-muted/20 border border-border/30">
                      <div className="flex items-center justify-between mb-4">
                        <span className="text-xs font-bold text-foreground">Category Analysis</span>
                        <BarChart3 className="w-3.5 h-3.5 text-muted-foreground" />
                      </div>
                      <div className="space-y-3">
                        {categoryData.slice(0, 5).map((cat, i) => (
                          <CategoryBar
                            key={cat.category_name}
                            name={cat.category_name}
                            count={cat.opinion_count}
                            maxCount={maxCategoryCount}
                            color={categoryColors[cat.category_name] || "from-gray-500 to-gray-600"}
                            icon={categoryIcons[cat.category_name] || Sparkles}
                            delay={0.5 + i * 0.08}
                          />
                        ))}
                      </div>
                    </div>
                    
                    {/* Donut + trend */}
                    <div className="space-y-4">
                      {/* Donut chart */}
                      <div className="p-4 rounded-xl bg-muted/20 border border-border/30">
                        <div className="flex items-center justify-between mb-3">
                          <span className="text-xs font-bold text-foreground">Distribution</span>
                          <Target className="w-3.5 h-3.5 text-muted-foreground" />
                        </div>
                        <LiveDonutChart data={categoryData} />
                      </div>
                      
                      {/* Weekly trend */}
                      <div className="p-4 rounded-xl bg-muted/20 border border-border/30">
                        <div className="flex items-center justify-between mb-3">
                          <span className="text-xs font-bold text-foreground">7-Day Trend</span>
                          <TrendingUp className="w-3.5 h-3.5 text-emerald-500" />
                        </div>
                        <WeeklySparkline data={weeklyData} />
                      </div>
                    </div>
                  </div>
                  
                  {/* Live activity feed */}
                  <div className="p-4 rounded-xl bg-muted/20 border border-border/30">
                    <div className="flex items-center justify-between mb-3">
                      <span className="text-xs font-bold text-foreground">Live Activity</span>
                      <div className="flex items-center gap-1.5">
                        <Zap className="w-3.5 h-3.5 text-amber-500" />
                        <span className="text-[10px] text-muted-foreground">Real-time</span>
                      </div>
                    </div>
                    <LiveActivityFeed />
                  </div>
                </div>
                
                {/* Footer */}
                <div className="px-5 py-3 border-t border-border/30 bg-muted/10 flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Clock className="w-3.5 h-3.5 text-muted-foreground" />
                    <span className="text-[10px] text-muted-foreground">
                      Last updated: {currentTime.toLocaleTimeString()}
                    </span>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <span className="text-[10px] font-medium text-primary">Auto-refresh: 30s</span>
                  </div>
                </div>
              </div>
            </motion.div>
          </div>
        </div>
      </div>
    </section>
  );
};
