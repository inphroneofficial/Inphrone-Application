import { useState, useEffect, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Button } from "@/components/ui/button";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { cn } from "@/lib/utils";
import {
  Users, Film, Music, Tv, Gamepad2, Youtube, Sparkles, ArrowRight,
  Activity, Globe, Zap, MessageSquare, ThumbsUp, Brain, 
  TrendingUp, BarChart3, Radio, Lock, Play, Crown, 
  ChevronDown, ChevronUp, MapPin, ArrowUpRight, ArrowDownRight,
} from "lucide-react";

// ============================================================================
// HAPTIC FEEDBACK UTILITY
// ============================================================================
const triggerHaptic = (type: 'light' | 'medium' | 'heavy' = 'light') => {
  if ('vibrate' in navigator) {
    const patterns = { light: [10], medium: [20], heavy: [30, 10, 30] };
    navigator.vibrate(patterns[type]);
  }
};

// ============================================================================
// PREMIUM VISUAL COMPONENTS
// ============================================================================

// Animated Hexagonal Grid Background
const HexGridBackground = () => (
  <div className="absolute inset-0 overflow-hidden pointer-events-none opacity-[0.03]">
    <svg className="absolute inset-0 w-full h-full" viewBox="0 0 100 100" preserveAspectRatio="xMidYMid slice">
      <pattern id="hex-pattern" x="0" y="0" width="20" height="17.32" patternUnits="userSpaceOnUse">
        <path d="M10,0 L20,5.77 L20,17.32 L10,23.09 L0,17.32 L0,5.77 Z" fill="none" stroke="hsl(var(--primary))" strokeWidth="0.3" transform="translate(0,-5.77)" />
      </pattern>
      <rect width="100%" height="100%" fill="url(#hex-pattern)" />
    </svg>
  </div>
);

// Energy Pulse Lines
const EnergyLines = () => (
  <div className="absolute inset-0 overflow-hidden pointer-events-none">
    {Array.from({ length: 4 }).map((_, i) => (
      <motion.div
        key={i}
        className="absolute h-px bg-gradient-to-r from-transparent via-primary/40 to-transparent"
        style={{ top: `${25 + i * 20}%`, width: "100%" }}
        initial={{ x: "-100%", opacity: 0 }}
        animate={{ x: "100%", opacity: [0, 1, 1, 0] }}
        transition={{ duration: 3, delay: i * 0.8, repeat: Infinity, repeatDelay: 2 }}
      />
    ))}
  </div>
);

// Premium Interactive Card with Haptic
const PremiumCard = ({ 
  children, 
  className, 
  delay = 0,
  glowColor = "primary"
}: { 
  children: React.ReactNode; 
  className?: string; 
  delay?: number;
  glowColor?: string;
}) => (
  <motion.div
    initial={{ opacity: 0, y: 20 }}
    animate={{ opacity: 1, y: 0 }}
    transition={{ delay, type: "spring", stiffness: 100 }}
    whileHover={{ 
      scale: 1.02, 
      y: -5,
      transition: { duration: 0.2 }
    }}
    whileTap={{ scale: 0.98 }}
    onHoverStart={() => triggerHaptic('light')}
    onClick={() => triggerHaptic('medium')}
    className={cn(
      "relative group cursor-pointer overflow-hidden",
      "rounded-2xl bg-card/80 backdrop-blur-xl border border-border/50",
      "hover:border-primary/40 transition-all duration-300",
      "hover:shadow-xl hover:shadow-primary/10",
      className
    )}
  >
    {/* Animated glow on hover */}
    <motion.div
      className={cn(
        "absolute -inset-1 rounded-2xl opacity-0 group-hover:opacity-100 blur-xl transition-opacity duration-500",
        `bg-gradient-to-r from-${glowColor}/20 to-accent/20`
      )}
    />
    {/* Shimmer effect */}
    <motion.div
      className="absolute inset-0 opacity-0 group-hover:opacity-100"
      initial={false}
      animate={{
        background: [
          "linear-gradient(90deg, transparent 0%, transparent 40%, hsl(var(--primary) / 0.1) 50%, transparent 60%, transparent 100%)",
        ],
        backgroundPosition: ["-200% 0%", "200% 0%"],
      }}
      transition={{ duration: 1.5, repeat: Infinity, repeatDelay: 0.5 }}
    />
    <div className="relative z-10">{children}</div>
  </motion.div>
);

// Compact Metric Display
const CompactMetric = ({ 
  label, 
  value, 
  icon: Icon, 
  color,
  trend,
  isBlurred = false 
}: { 
  label: string; 
  value: number; 
  icon: any; 
  color: string;
  trend?: number;
  isBlurred?: boolean;
}) => (
  <div className={cn("flex items-center gap-3", isBlurred && "blur-md")}>
    <div className={cn("w-10 h-10 rounded-xl flex items-center justify-center shadow-lg", `bg-gradient-to-br ${color}`)}>
      <Icon className="w-5 h-5 text-white" />
    </div>
    <div className="flex-1">
      <div className="flex items-center gap-2">
        <motion.span 
          className="text-xl font-black"
          animate={{ opacity: [0.9, 1, 0.9] }}
          transition={{ duration: 2, repeat: Infinity }}
        >
          {value.toLocaleString()}
        </motion.span>
        {trend !== undefined && (
          <span className={cn(
            "flex items-center gap-0.5 text-xs font-bold px-1.5 py-0.5 rounded-full",
            trend >= 0 ? "bg-emerald-500/10 text-emerald-500" : "bg-rose-500/10 text-rose-500"
          )}>
            {trend >= 0 ? <ArrowUpRight className="w-3 h-3" /> : <ArrowDownRight className="w-3 h-3" />}
            {Math.abs(trend)}%
          </span>
        )}
      </div>
      <p className="text-xs text-muted-foreground">{label}</p>
    </div>
  </div>
);

// Global Visitor Map Component
const GlobalVisitorMap = ({ visitors, isBlurred }: { visitors: { country: string; count: number; lat: number; lng: number }[]; isBlurred: boolean }) => {
  return (
    <div className={cn("relative", isBlurred && "blur-md")}>
      {/* Simple world map representation */}
      <div className="relative h-40 rounded-xl bg-gradient-to-b from-muted/20 to-muted/5 border border-border/30 overflow-hidden">
        {/* Grid lines */}
        <svg className="absolute inset-0 w-full h-full opacity-20">
          <defs>
            <pattern id="map-grid" width="20" height="20" patternUnits="userSpaceOnUse">
              <path d="M 20 0 L 0 0 0 20" fill="none" stroke="hsl(var(--primary))" strokeWidth="0.3" />
            </pattern>
          </defs>
          <rect width="100%" height="100%" fill="url(#map-grid)" />
        </svg>
        
        {/* Visitor points */}
        {visitors.slice(0, 8).map((visitor, i) => (
          <motion.div
            key={visitor.country}
            className="absolute"
            style={{
              left: `${15 + (visitor.lng + 180) / 360 * 70}%`,
              top: `${10 + (90 - visitor.lat) / 180 * 80}%`,
            }}
            initial={{ scale: 0, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ delay: i * 0.1 }}
          >
            <motion.div
              className="relative"
              animate={{ y: [0, -3, 0] }}
              transition={{ duration: 2, repeat: Infinity, delay: i * 0.2 }}
            >
              {/* Ping animation */}
              <span className="absolute inset-0 animate-ping rounded-full bg-primary/30 w-4 h-4 -translate-x-1/2 -translate-y-1/2" />
              {/* Core dot */}
              <div 
                className="w-3 h-3 rounded-full bg-gradient-to-br from-primary to-accent shadow-lg shadow-primary/50 -translate-x-1/2 -translate-y-1/2"
                style={{ transform: `scale(${0.5 + Math.min(visitor.count / 20, 1)})` }}
              />
              {/* Tooltip */}
              <div className="absolute left-4 top-0 opacity-0 group-hover:opacity-100 transition-opacity bg-background/90 backdrop-blur-sm px-2 py-1 rounded text-[10px] font-medium whitespace-nowrap border border-border/50">
                {visitor.country}: {visitor.count}
              </div>
            </motion.div>
          </motion.div>
        ))}
        
        {/* Map label */}
        <div className="absolute bottom-2 left-3 flex items-center gap-2">
          <MapPin className="w-3 h-3 text-primary" />
          <span className="text-[10px] font-medium text-muted-foreground">{visitors.length} Active Regions</span>
        </div>
      </div>
      
      {/* Country list */}
      <div className="mt-3 grid grid-cols-2 gap-2">
        {visitors.slice(0, 4).map((v, i) => (
          <motion.div
            key={v.country}
            initial={{ opacity: 0, x: -10 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.3 + i * 0.1 }}
            className="flex items-center gap-2 text-xs"
          >
            <span className="w-2 h-2 rounded-full bg-primary" />
            <span className="text-muted-foreground truncate">{v.country}</span>
            <span className="font-bold text-foreground ml-auto">{v.count}</span>
          </motion.div>
        ))}
      </div>
    </div>
  );
};

// Week Over Week Comparison
const WeekComparison = ({ 
  thisWeek, 
  lastWeek, 
  isBlurred 
}: { 
  thisWeek: number; 
  lastWeek: number; 
  isBlurred: boolean;
}) => {
  const change = lastWeek > 0 ? Math.round(((thisWeek - lastWeek) / lastWeek) * 100) : 0;
  const isPositive = change >= 0;
  
  return (
    <div className={cn("space-y-3", isBlurred && "blur-md")}>
      <div className="flex items-center justify-between">
        <span className="text-xs font-medium text-muted-foreground">Week over Week</span>
        <span className={cn(
          "flex items-center gap-1 text-sm font-bold px-2 py-1 rounded-full",
          isPositive ? "bg-emerald-500/10 text-emerald-500" : "bg-rose-500/10 text-rose-500"
        )}>
          {isPositive ? <ArrowUpRight className="w-4 h-4" /> : <ArrowDownRight className="w-4 h-4" />}
          {isPositive ? "+" : ""}{change}%
        </span>
      </div>
      
      <div className="grid grid-cols-2 gap-4">
        {/* This Week */}
        <div className="relative p-3 rounded-xl bg-primary/10 border border-primary/20">
          <div className="text-[10px] font-medium text-primary mb-1">This Week</div>
          <div className="text-2xl font-black">{thisWeek}</div>
          <motion.div
            className="absolute bottom-0 left-0 h-1 bg-primary rounded-b-xl"
            initial={{ width: 0 }}
            animate={{ width: "100%" }}
            transition={{ duration: 1 }}
          />
        </div>
        
        {/* Last Week */}
        <div className="relative p-3 rounded-xl bg-muted/30 border border-border/50">
          <div className="text-[10px] font-medium text-muted-foreground mb-1">Last Week</div>
          <div className="text-2xl font-black text-muted-foreground">{lastWeek}</div>
        </div>
      </div>
      
      {/* Visual comparison bar */}
      <div className="relative h-3 bg-muted/30 rounded-full overflow-hidden">
        <motion.div
          className="absolute left-0 top-0 h-full bg-gradient-to-r from-primary to-accent rounded-full"
          initial={{ width: 0 }}
          animate={{ width: `${Math.min((thisWeek / Math.max(thisWeek, lastWeek)) * 100, 100)}%` }}
          transition={{ delay: 0.5, duration: 0.8 }}
        />
        <div 
          className="absolute top-0 h-full w-0.5 bg-muted-foreground/50"
          style={{ left: `${Math.min((lastWeek / Math.max(thisWeek, lastWeek)) * 100, 100)}%` }}
        />
      </div>
    </div>
  );
};

// Premium AI Processing Visualization
const AIProcessingViz = () => {
  const nodes = [
    { x: 15, y: 20, delay: 0 },
    { x: 15, y: 50, delay: 0.2 },
    { x: 15, y: 80, delay: 0.4 },
    { x: 40, y: 35, delay: 0.6 },
    { x: 40, y: 65, delay: 0.8 },
    { x: 65, y: 50, delay: 1.0 },
    { x: 85, y: 50, delay: 1.2 },
  ];

  const connections = [
    { from: 0, to: 3 }, { from: 0, to: 4 },
    { from: 1, to: 3 }, { from: 1, to: 4 },
    { from: 2, to: 3 }, { from: 2, to: 4 },
    { from: 3, to: 5 }, { from: 4, to: 5 },
    { from: 5, to: 6 },
  ];

  return (
    <div className="relative h-20 rounded-xl bg-gradient-to-br from-primary/5 via-background to-accent/5 overflow-hidden border border-primary/10">
      {/* Animated gradient background */}
      <motion.div
        className="absolute inset-0 opacity-30"
        style={{
          background: "linear-gradient(90deg, transparent, hsl(var(--primary) / 0.1), transparent)",
        }}
        animate={{ x: ["-100%", "100%"] }}
        transition={{ duration: 3, repeat: Infinity, ease: "linear" }}
      />

      {/* Neural network SVG */}
      <svg className="w-full h-full relative z-10" viewBox="0 0 100 100" preserveAspectRatio="xMidYMid meet">
        {/* Animated connections */}
        {connections.map((conn, i) => {
          const from = nodes[conn.from];
          const to = nodes[conn.to];
          // Safety check to prevent undefined values
          if (!from || !to || from.x === undefined || to.x === undefined) return null;
          return (
            <motion.line
              key={`conn-${i}`}
              x1={from.x}
              y1={from.y}
              x2={to.x}
              y2={to.y}
              stroke="url(#lineGradient)"
              strokeWidth="0.8"
              initial={{ opacity: 0.2, pathLength: 0 }}
              animate={{ 
                opacity: [0.2, 0.8, 0.2],
                pathLength: [0, 1, 1]
              }}
              transition={{ 
                duration: 2,
                delay: i * 0.15,
                repeat: Infinity,
                ease: "easeInOut"
              }}
            />
          );
        })}

        {/* Data pulse along connections */}
        {connections.map((conn, i) => {
          const from = nodes[conn.from];
          const to = nodes[conn.to];
          // Safety check to prevent undefined cx/cy values
          if (!from || !to || from.x === undefined || to.x === undefined) return null;
          return (
            <motion.circle
              key={`pulse-${i}`}
              r="1.5"
              fill="hsl(var(--primary))"
              filter="url(#glow)"
              initial={{ opacity: 0, cx: from.x, cy: from.y }}
              animate={{
                cx: [from.x, to.x],
                cy: [from.y, to.y],
                opacity: [0, 1, 0],
              }}
              transition={{
                duration: 1.5,
                delay: i * 0.2 + 0.5,
                repeat: Infinity,
                ease: "easeInOut"
              }}
            />
          );
        })}

        {/* Nodes */}
        {nodes.map((node, i) => {
          // Safety check to prevent undefined cx/cy
          if (!node || node.x === undefined || node.y === undefined) return null;
          return (
            <g key={`node-${i}`}>
              {/* Outer glow ring */}
              <motion.circle
                cx={node.x}
                cy={node.y}
                r="6"
                fill="none"
                stroke="hsl(var(--primary) / 0.3)"
                strokeWidth="0.5"
                initial={{ scale: 0.8, opacity: 0 }}
                animate={{ 
                  scale: [0.8, 1.2, 0.8],
                  opacity: [0.3, 0.6, 0.3]
                }}
                transition={{ 
                  duration: 2,
                  delay: node.delay || 0,
                  repeat: Infinity,
                  ease: "easeInOut"
                }}
              />
              {/* Inner node */}
              <motion.circle
                cx={node.x}
                cy={node.y}
                r="3"
                fill={i === nodes.length - 1 ? "hsl(var(--accent))" : "hsl(var(--primary))"}
                filter="url(#glow)"
                initial={{ scale: 0.5 }}
                animate={{ 
                  scale: [1, 1.2, 1],
                }}
                transition={{ 
                  duration: 1.5,
                  delay: node.delay || 0,
                  repeat: Infinity,
                  ease: "easeInOut"
                }}
              />
            </g>
          );
        })}

        {/* SVG Defs */}
        <defs>
          <linearGradient id="lineGradient" x1="0%" y1="0%" x2="100%" y2="0%">
            <stop offset="0%" stopColor="hsl(var(--primary) / 0.3)" />
            <stop offset="50%" stopColor="hsl(var(--primary))" />
            <stop offset="100%" stopColor="hsl(var(--accent) / 0.3)" />
          </linearGradient>
          <filter id="glow" x="-50%" y="-50%" width="200%" height="200%">
            <feGaussianBlur stdDeviation="1" result="coloredBlur"/>
            <feMerge>
              <feMergeNode in="coloredBlur"/>
              <feMergeNode in="SourceGraphic"/>
            </feMerge>
          </filter>
        </defs>
      </svg>

      {/* Labels */}
      <div className="absolute bottom-1.5 left-3 flex items-center gap-2">
        <motion.div
          className="flex items-center gap-1.5"
          animate={{ opacity: [0.7, 1, 0.7] }}
          transition={{ duration: 2, repeat: Infinity }}
        >
          <div className="w-1.5 h-1.5 rounded-full bg-primary" />
          <span className="text-[9px] font-bold text-primary tracking-wider">AI PROCESSING</span>
        </motion.div>
      </div>
      <div className="absolute bottom-1.5 right-3 flex items-center gap-1.5">
        <motion.span 
          className="w-2 h-2 rounded-full bg-emerald-500"
          animate={{ scale: [1, 1.3, 1], opacity: [1, 0.5, 1] }}
          transition={{ duration: 1.5, repeat: Infinity }}
        />
        <span className="text-[9px] font-bold text-emerald-500 tracking-wider">LIVE</span>
      </div>
      
      {/* Processing percentage */}
      <div className="absolute top-1.5 right-3">
        <motion.span
          className="text-[10px] font-mono font-bold text-primary"
          animate={{ opacity: [0.5, 1, 0.5] }}
          transition={{ duration: 1.5, repeat: Infinity }}
        >
          <motion.span
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.5 }}
          >
            98.7%
          </motion.span>
        </motion.span>
      </div>
    </div>
  );
};

// Category Pills Compact
const CategoryPillsCompact = ({ data, isBlurred }: { data: { name: string; count: number; color: string }[]; isBlurred: boolean }) => {
  const icons: Record<string, any> = {
    Film, Music, OTT: Tv, TV: Tv, YouTube: Youtube, Gaming: Gamepad2,
    "Social Media": MessageSquare, "App Development": Sparkles,
  };
  
  return (
    <div className={cn("flex flex-wrap gap-2", isBlurred && "blur-md")}>
      {data.slice(0, 6).map((cat, i) => {
        const Icon = icons[cat.name] || MessageSquare;
        return (
          <motion.div
            key={cat.name}
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: i * 0.05 }}
            whileHover={{ scale: 1.1, y: -2 }}
            onHoverStart={() => triggerHaptic('light')}
            className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-full border border-border/50 bg-muted/30 hover:border-primary/30 transition-all cursor-pointer"
          >
            <Icon className="w-3 h-3" style={{ color: cat.color }} />
            <span className="text-xs font-medium">{cat.name}</span>
            <span className="text-[10px] font-bold text-primary">{cat.count}</span>
          </motion.div>
        );
      })}
    </div>
  );
};

// ============================================================================
// MAIN COMPONENT
// ============================================================================

export const UltimateLiveDashboard = () => {
  const navigate = useNavigate();
  const [isAuthenticated, setIsAuthenticated] = useState<boolean | null>(null);
  const [showBlur, setShowBlur] = useState(false);
  const [showSignIn, setShowSignIn] = useState(false);
  const [activeUsers, setActiveUsers] = useState(1);
  const [currentTime, setCurrentTime] = useState(new Date());
  const [isExpanded, setIsExpanded] = useState(false);
  const [stats, setStats] = useState({
    totalUsers: 0, totalOpinions: 0, totalUpvotes: 0,
    countriesCount: 0, engagementScore: 0, userGrowth: 0,
  });
  const [categoryData, setCategoryData] = useState<{ name: string; count: number; color: string }[]>([]);
  const [activities, setActivities] = useState<any[]>([]);
  const [weeklyStats, setWeeklyStats] = useState({ thisWeek: 0, lastWeek: 0 });
  const [visitors, setVisitors] = useState<{ country: string; count: number; lat: number; lng: number }[]>([]);

  const categoryConfig: Record<string, string> = {
    Film: "#ef4444", Music: "#8b5cf6", OTT: "#3b82f6", TV: "#6366f1",
    YouTube: "#f97316", Gaming: "#10b981", "Social Media": "#ec4899", "App Development": "#a855f7",
  };

  // Country coordinates (simplified)
  const countryCoords: Record<string, { lat: number; lng: number }> = {
    "India": { lat: 20, lng: 78 }, "USA": { lat: 38, lng: -97 }, "UK": { lat: 55, lng: -3 },
    "Germany": { lat: 51, lng: 10 }, "Australia": { lat: -25, lng: 135 }, "Canada": { lat: 56, lng: -106 },
    "Brazil": { lat: -14, lng: -51 }, "Japan": { lat: 36, lng: 138 }, "France": { lat: 46, lng: 2 },
    "Indonesia": { lat: -5, lng: 120 },
  };

  // Live clock
  useEffect(() => {
    const timer = setInterval(() => setCurrentTime(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);

  // Auth check
  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => setIsAuthenticated(!!session));
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_, session) => setIsAuthenticated(!!session));
    return () => subscription.unsubscribe();
  }, []);

  // Show data for 5 seconds, then blur, then 2 seconds later show sign-in overlay
  useEffect(() => {
    if (isAuthenticated === false) {
      // After 5 seconds, blur the data
      const blurTimer = setTimeout(() => setShowBlur(true), 5000);
      // After 7 seconds (5s visible + 2s blur), show sign-in overlay
      const overlayTimer = setTimeout(() => setShowSignIn(true), 7000);
      return () => {
        clearTimeout(blurTimer);
        clearTimeout(overlayTimer);
      };
    }
  }, [isAuthenticated]);

  // Presence tracking
  useEffect(() => {
    const channel = supabase.channel("ultimate-presence", {
      config: { presence: { key: `visitor-${Math.random().toString(36).substr(2, 9)}` } },
    });

    channel
      .on("presence", { event: "sync" }, () => {
        setActiveUsers(Math.max(Object.keys(channel.presenceState()).length, 1));
      })
      .subscribe(async (status) => {
        if (status === "SUBSCRIBED") {
          await channel.track({ online_at: new Date().toISOString() });
        }
      });

    return () => { supabase.removeChannel(channel); };
  }, []);

  // Fetch all data
  const fetchData = useCallback(async () => {
    try {
      // Stats
      const { data: statsData } = await supabase.functions.invoke("public-platform-counts", { body: {} });
      if (statsData) setStats(statsData);

      // Categories & Visitors
      const { data: opinions } = await supabase
        .from("opinions")
        .select("categories:category_id(name), country, created_at");
      
      if (opinions) {
        // Category counts
        const catCounts: Record<string, number> = {};
        const countryCounts: Record<string, number> = {};
        const now = new Date();
        const thisWeekStart = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
        const lastWeekStart = new Date(now.getTime() - 14 * 24 * 60 * 60 * 1000);
        let thisWeekCount = 0;
        let lastWeekCount = 0;

        opinions.forEach((op: any) => {
          const name = op.categories?.name || "Other";
          catCounts[name] = (catCounts[name] || 0) + 1;
          
          if (op.country) {
            countryCounts[op.country] = (countryCounts[op.country] || 0) + 1;
          }
          
          const createdAt = new Date(op.created_at);
          if (createdAt >= thisWeekStart) thisWeekCount++;
          else if (createdAt >= lastWeekStart) lastWeekCount++;
        });

        setCategoryData(
          Object.entries(catCounts)
            .map(([name, count]) => ({ name, count, color: categoryConfig[name] || "#6366f1" }))
            .sort((a, b) => b.count - a.count)
        );

        setVisitors(
          Object.entries(countryCounts)
            .map(([country, count]) => ({
              country,
              count,
              lat: countryCoords[country]?.lat || 0,
              lng: countryCoords[country]?.lng || 0,
            }))
            .sort((a, b) => b.count - a.count)
            .slice(0, 10)
        );

        setWeeklyStats({ thisWeek: thisWeekCount, lastWeek: lastWeekCount });
      }

      // Activities - simplified query without problematic joins
      const [opinionsRes, upvotesRes] = await Promise.all([
        supabase.from("opinions")
          .select("id, created_at, user_id, categories:category_id(name)")
          .order("created_at", { ascending: false }).limit(5),
        supabase.from("opinion_upvotes")
          .select("id, created_at, user_type")
          .order("created_at", { ascending: false }).limit(5),
      ]);

      const allActivities: any[] = [];
      opinionsRes.data?.forEach((op: any) => {
        allActivities.push({
          id: `o-${op.id}`, type: "opinion",
          category: op.categories?.name || "Entertainment",
          userType: "Audience", // Default since we can't reliably fetch from profiles
          time: new Date(op.created_at),
        });
      });
      upvotesRes.data?.forEach((up: any) => {
        allActivities.push({
          id: `u-${up.id}`, type: "upvote",
          category: "Entertainment",
          userType: up.user_type || "Audience",
          time: new Date(up.created_at),
        });
      });
      setActivities(allActivities.sort((a, b) => b.time.getTime() - a.time.getTime()).slice(0, 5));
    } catch (err) {
      console.error("Data fetch error:", err);
    }
  }, []);

  useEffect(() => { fetchData(); }, [fetchData]);

  // Real-time updates
  useEffect(() => {
    const channel = supabase
      .channel("dashboard-realtime")
      .on("postgres_changes", { event: "*", schema: "public", table: "opinions" }, fetchData)
      .on("postgres_changes", { event: "*", schema: "public", table: "opinion_upvotes" }, fetchData)
      .subscribe();
    return () => { supabase.removeChannel(channel); };
  }, [fetchData]);

  const isBlurred = showBlur && isAuthenticated === false;

  const getTimeAgo = (date: Date) => {
    const seconds = Math.floor((Date.now() - date.getTime()) / 1000);
    if (seconds < 60) return "just now";
    if (seconds < 3600) return `${Math.floor(seconds / 60)}m ago`;
    return `${Math.floor(seconds / 3600)}h ago`;
  };

  return (
    <section className="relative py-16 md:py-24 overflow-hidden">
      <HexGridBackground />
      <EnergyLines />
      
      {/* Gradient orbs */}
      <motion.div
        className="absolute top-20 left-1/4 w-80 h-80 rounded-full bg-primary/10 blur-[100px]"
        animate={{ opacity: [0.3, 0.5, 0.3], scale: [1, 1.1, 1] }}
        transition={{ duration: 8, repeat: Infinity }}
      />
      <motion.div
        className="absolute bottom-20 right-1/4 w-60 h-60 rounded-full bg-accent/10 blur-[80px]"
        animate={{ opacity: [0.2, 0.4, 0.2] }}
        transition={{ duration: 10, repeat: Infinity, delay: 2 }}
      />

      <div className="container relative z-10">
        {/* Side by Side Layout */}
        <div className="grid lg:grid-cols-2 gap-8 lg:gap-12 items-center">
          {/* Left: Hero Content */}
          <motion.div
            initial={{ opacity: 0, x: -30 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.8 }}
            className="space-y-6"
          >
            {/* Live Badge */}
            <motion.div
              className="inline-flex items-center gap-3 px-5 py-2.5 rounded-full bg-gradient-to-r from-primary/10 via-accent/10 to-primary/10 border border-primary/30"
              animate={{ 
                boxShadow: ["0 0 20px hsl(var(--primary) / 0.2)", "0 0 40px hsl(var(--primary) / 0.4)", "0 0 20px hsl(var(--primary) / 0.2)"],
              }}
              transition={{ duration: 3, repeat: Infinity }}
            >
              <span className="relative flex h-2.5 w-2.5">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75" />
                <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-emerald-500" />
              </span>
              <span className="text-sm font-bold tracking-wider text-primary uppercase">Live Platform</span>
            </motion.div>
            
            {/* Time */}
            <motion.div
              className="text-2xl md:text-3xl font-mono font-bold text-primary/80"
              animate={{ opacity: [0.7, 1, 0.7] }}
              transition={{ duration: 2, repeat: Infinity }}
            >
              {currentTime.toLocaleTimeString()}
            </motion.div>
            
            {/* Headline */}
            <h1 className="text-3xl md:text-4xl lg:text-5xl xl:text-6xl font-black tracking-tight leading-tight">
              <span className="text-gradient">Real-Time</span>{" "}
              Entertainment Intelligence
            </h1>
            
            {/* Subtitle */}
            <p className="text-base md:text-lg text-muted-foreground max-w-lg">
              The world's first Audience-Intelligence Platform. Live data from authentic opinions shaping what gets created next.
            </p>
            
            {/* CTA Buttons */}
            <div className="flex flex-wrap items-center gap-4 pt-2">
              <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.98 }}>
                <Button
                  size="lg"
                  onClick={() => { triggerHaptic('medium'); navigate("/auth"); }}
                  className="bg-gradient-to-r from-primary to-accent hover:opacity-90 shadow-xl shadow-primary/20 px-6 py-5 text-base font-bold"
                >
                  <Play className="w-4 h-4 mr-2" />
                  Start Sharing Opinions
                </Button>
              </motion.div>
              <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.98 }}>
                <Button
                  size="lg"
                  variant="outline"
                  onClick={() => { triggerHaptic('light'); navigate("/auth"); }}
                  className="border-2 border-primary/50 hover:bg-primary/10 px-6 py-5 text-base font-bold"
                >
                  <Crown className="w-4 h-4 mr-2 text-amber-500" />
                  I'm a Creator
                </Button>
              </motion.div>
            </div>
            
            {/* Category Pills - Transparent with colored icons */}
            <div className="flex flex-wrap items-center gap-2 pt-4">
              {[
                { icon: Film, label: "Film", iconColor: "#ef4444" },
                { icon: Music, label: "Music", iconColor: "#8b5cf6" },
                { icon: Tv, label: "OTT", iconColor: "#3b82f6" },
                { icon: Tv, label: "TV", iconColor: "#6366f1" },
                { icon: Youtube, label: "YouTube", iconColor: "#f97316" },
                { icon: Gamepad2, label: "Gaming", iconColor: "#10b981" },
                { icon: MessageSquare, label: "Social", iconColor: "#06b6d4" },
                { icon: Sparkles, label: "App Dev", iconColor: "#a855f7" },
              ].map((cat, i) => (
                <motion.div
                  key={cat.label}
                  initial={{ opacity: 0, scale: 0.8 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ delay: 0.05 * i }}
                  whileHover={{ scale: 1.1, y: -2 }}
                  onHoverStart={() => triggerHaptic('light')}
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-transparent border border-border/50 hover:border-primary/30 font-medium text-xs cursor-pointer transition-all"
                >
                  <cat.icon className="w-3.5 h-3.5" style={{ color: cat.iconColor }} />
                  <span className="text-foreground/80">{cat.label}</span>
                </motion.div>
              ))}
            </div>
          </motion.div>

          {/* Right: Compact Dashboard */}
          <motion.div
            initial={{ opacity: 0, x: 30 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.8, delay: 0.2 }}
          >
            <PremiumCard className="p-5">
              {/* Dashboard Header */}
              <div className="flex items-center justify-between mb-5">
                <div className="flex items-center gap-3">
                  <div className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-primary/10 border border-primary/20">
                    <span className="relative flex h-2 w-2">
                      <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75" />
                      <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500" />
                    </span>
                    <span className="text-xs font-bold text-primary">{activeUsers} Online</span>
                  </div>
                </div>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => { triggerHaptic('light'); setIsExpanded(!isExpanded); }}
                  className="text-xs gap-1"
                >
                  {isExpanded ? "Collapse" : "Expand"}
                  {isExpanded ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
                </Button>
              </div>

              {/* Metrics Grid */}
              <div className="grid grid-cols-2 gap-4 mb-5">
                <CompactMetric
                  label="Community"
                  value={stats.totalUsers}
                  icon={Users}
                  color="from-blue-500 to-cyan-500"
                  trend={stats.userGrowth}
                  isBlurred={isBlurred}
                />
                <CompactMetric
                  label="Opinions"
                  value={stats.totalOpinions}
                  icon={MessageSquare}
                  color="from-violet-500 to-purple-500"
                  isBlurred={isBlurred}
                />
                <CompactMetric
                  label="Reactions"
                  value={stats.totalUpvotes}
                  icon={ThumbsUp}
                  color="from-amber-500 to-orange-500"
                  isBlurred={isBlurred}
                />
                <CompactMetric
                  label="Countries"
                  value={stats.countriesCount}
                  icon={Globe}
                  color="from-emerald-500 to-teal-500"
                  isBlurred={isBlurred}
                />
              </div>

              {/* Category Distribution */}
              <div className="mb-4">
                <div className="flex items-center gap-2 mb-3">
                  <BarChart3 className="w-4 h-4 text-primary" />
                  <span className="text-xs font-bold">Categories</span>
                </div>
                <CategoryPillsCompact data={categoryData} isBlurred={isBlurred} />
              </div>

              {/* AI Processing */}
              <AIProcessingViz />

              {/* Sign in overlay */}
              {showSignIn && (
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  className="absolute inset-0 z-30 flex items-center justify-center bg-background/95 backdrop-blur-xl rounded-2xl"
                >
                  <div className="text-center p-6">
                    <motion.div
                      className="w-14 h-14 rounded-xl bg-gradient-to-br from-primary to-accent flex items-center justify-center mx-auto mb-4 shadow-xl"
                      animate={{ rotate: [0, 5, -5, 0] }}
                      transition={{ duration: 4, repeat: Infinity }}
                    >
                      <Lock className="w-7 h-7 text-white" />
                    </motion.div>
                    <h3 className="text-lg font-black mb-2">Unlock Full Dashboard</h3>
                    <p className="text-sm text-muted-foreground mb-4">Sign in to access all analytics</p>
                    <Button
                      onClick={() => { triggerHaptic('heavy'); navigate("/auth"); }}
                      className="w-full bg-gradient-to-r from-primary to-accent"
                    >
                      Sign In <ArrowRight className="w-4 h-4 ml-2" />
                    </Button>
                  </div>
                </motion.div>
              )}
            </PremiumCard>
          </motion.div>
        </div>

        {/* Expandable Full Dashboard */}
        <AnimatePresence>
          {isExpanded && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: "auto" }}
              exit={{ opacity: 0, height: 0 }}
              transition={{ duration: 0.4, ease: "easeInOut" }}
              className="overflow-hidden"
            >
              <div className="pt-10">
                {/* Section Header */}
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="text-center mb-8"
                >
                  <h2 className="text-2xl md:text-3xl font-black">
                    Full Intelligence <span className="text-gradient">Dashboard</span>
                  </h2>
                </motion.div>

                {/* Extended Dashboard Grid */}
                <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {/* Global Visitor Map */}
                  <PremiumCard className="p-5" delay={0.1}>
                    <div className="flex items-center gap-2 mb-4">
                      <Globe className="w-5 h-5 text-primary" />
                      <span className="text-sm font-bold">Global Visitors</span>
                      <span className="ml-auto text-xs text-emerald-500 font-mono">LIVE</span>
                    </div>
                    <GlobalVisitorMap visitors={visitors} isBlurred={isBlurred} />
                  </PremiumCard>

                  {/* Week over Week Comparison */}
                  <PremiumCard className="p-5" delay={0.2}>
                    <div className="flex items-center gap-2 mb-4">
                      <TrendingUp className="w-5 h-5 text-primary" />
                      <span className="text-sm font-bold">Performance</span>
                    </div>
                    <WeekComparison 
                      thisWeek={weeklyStats.thisWeek} 
                      lastWeek={weeklyStats.lastWeek} 
                      isBlurred={isBlurred} 
                    />
                  </PremiumCard>

                  {/* Live Activity Stream */}
                  <PremiumCard className="p-5" delay={0.3}>
                    <div className="flex items-center gap-2 mb-4">
                      <Activity className="w-5 h-5 text-primary" />
                      <span className="text-sm font-bold">Live Activity</span>
                      <span className="ml-auto relative flex h-2 w-2">
                        <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-primary opacity-75" />
                        <span className="relative inline-flex rounded-full h-2 w-2 bg-primary" />
                      </span>
                    </div>
                    <div className={cn("space-y-2", isBlurred && "blur-md")}>
                      {activities.map((activity, i) => (
                        <motion.div
                          key={activity.id}
                          initial={{ opacity: 0, x: 10 }}
                          animate={{ opacity: 1, x: 0 }}
                          transition={{ delay: i * 0.1 }}
                          whileHover={{ x: 5, backgroundColor: "hsl(var(--muted) / 0.5)" }}
                          onHoverStart={() => triggerHaptic('light')}
                          className="flex items-center gap-2 p-2 rounded-lg transition-colors cursor-pointer"
                        >
                          <div className={cn(
                            "w-7 h-7 rounded-lg flex items-center justify-center",
                            activity.type === "opinion" ? "bg-violet-500/20 text-violet-500" : "bg-amber-500/20 text-amber-500"
                          )}>
                            {activity.type === "opinion" ? <MessageSquare className="w-3.5 h-3.5" /> : <ThumbsUp className="w-3.5 h-3.5" />}
                          </div>
                          <div className="flex-1 min-w-0">
                            <p className="text-xs font-medium truncate">
                              {activity.userType} in {activity.category}
                            </p>
                            <p className="text-[10px] text-muted-foreground">{getTimeAgo(activity.time)}</p>
                          </div>
                        </motion.div>
                      ))}
                    </div>
                  </PremiumCard>

                  {/* Advanced Stats */}
                  <PremiumCard className="p-5" delay={0.4}>
                    <div className="flex items-center gap-2 mb-4">
                      <Brain className="w-5 h-5 text-primary" />
                      <span className="text-sm font-bold">AI Insights</span>
                    </div>
                    <div className={cn("space-y-4", isBlurred && "blur-md")}>
                      <div className="flex items-center justify-between">
                        <span className="text-xs text-muted-foreground">Engagement Score</span>
                        <span className="text-lg font-black text-primary">{stats.engagementScore}%</span>
                      </div>
                      <div className="h-2 bg-muted/30 rounded-full overflow-hidden">
                        <motion.div
                          className="h-full bg-gradient-to-r from-primary to-accent"
                          initial={{ width: 0 }}
                          animate={{ width: `${stats.engagementScore}%` }}
                          transition={{ delay: 0.5, duration: 1 }}
                        />
                      </div>
                      <div className="grid grid-cols-2 gap-3 pt-2">
                        <div className="p-3 rounded-lg bg-muted/20">
                          <div className="text-lg font-black">{stats.totalOpinions}</div>
                          <div className="text-[10px] text-muted-foreground">Total Opinions</div>
                        </div>
                        <div className="p-3 rounded-lg bg-muted/20">
                          <div className="text-lg font-black">{categoryData.length}</div>
                          <div className="text-[10px] text-muted-foreground">Categories</div>
                        </div>
                      </div>
                    </div>
                  </PremiumCard>

                  {/* Data Stream Visualization */}
                  <PremiumCard className="p-5 md:col-span-2" delay={0.5}>
                    <div className="flex items-center gap-2 mb-4">
                      <Radio className="w-5 h-5 text-primary" />
                      <span className="text-sm font-bold">Real-Time Data Stream</span>
                      <div className="ml-auto flex items-center gap-1">
                        <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                        <span className="text-[10px] text-emerald-500 font-mono">STREAMING</span>
                      </div>
                    </div>
                    <div className="relative h-20 bg-muted/10 rounded-xl overflow-hidden">
                      {/* Grid */}
                      <svg className="absolute inset-0 w-full h-full opacity-10">
                        <defs>
                          <pattern id="stream-grid" width="20" height="20" patternUnits="userSpaceOnUse">
                            <path d="M 20 0 L 0 0 0 20" fill="none" stroke="hsl(var(--primary))" strokeWidth="0.5" />
                          </pattern>
                        </defs>
                        <rect width="100%" height="100%" fill="url(#stream-grid)" />
                      </svg>
                      
                      {/* Particles */}
                      {Array.from({ length: 15 }).map((_, i) => (
                        <motion.div
                          key={i}
                          className="absolute rounded-full bg-primary"
                          style={{
                            width: 3 + Math.random() * 4,
                            height: 3 + Math.random() * 4,
                            top: `${15 + (i % 4) * 20}%`,
                          }}
                          animate={{ left: ["-5%", "105%"], opacity: [0, 1, 1, 0] }}
                          transition={{ duration: 2 + Math.random(), delay: i * 0.12, repeat: Infinity, ease: "linear" }}
                        />
                      ))}
                      
                      {/* Wave line */}
                      <svg className="absolute inset-0 w-full h-full" preserveAspectRatio="none">
                        <motion.path
                          d="M0,50 Q25,30 50,50 T100,50"
                          stroke="hsl(var(--primary) / 0.5)"
                          strokeWidth="2"
                          fill="none"
                          initial={{ pathLength: 0 }}
                          animate={{ pathLength: 1 }}
                          transition={{ duration: 2, repeat: Infinity }}
                        />
                      </svg>
                    </div>
                  </PremiumCard>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </section>
  );
};

export default UltimateLiveDashboard;
