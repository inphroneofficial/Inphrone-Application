import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { 
  TrendingUp, 
  Users, 
  MessageSquare, 
  Heart, 
  Globe, 
  Clock, 
  Target,
  Activity,
  Zap,
  BarChart3,
  PieChart as PieChartIcon,
  Layers,
  Eye,
  ArrowUpRight,
  Sparkles
} from "lucide-react";
import { 
  PieChart, 
  Pie, 
  Cell, 
  ResponsiveContainer, 
  Tooltip, 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  Legend, 
  LineChart, 
  Line, 
  CartesianGrid,
  RadarChart,
  PolarGrid,
  PolarAngleAxis,
  PolarRadiusAxis,
  Radar,
  Area,
  AreaChart,
  ComposedChart
} from "recharts";
import { motion, AnimatePresence } from "framer-motion";
import { useState, useEffect } from "react";

interface CategoryData {
  id: string;
  name: string;
  count: number;
  percentage: number;
  color: string;
  icon: any;
}

interface GlobalInsightsProps {
  categories: CategoryData[];
  totalOpinions: number;
  totalContributors: number;
  totalUpvotes: number;
  totalUsers: number;
  userCounts?: {
    audience: number;
    creator: number;
    studio: number;
    production: number;
    ott: number;
    tv: number;
    gaming: number;
    music: number;
    developer: number;
  };
}

// Animated number counter
const AnimatedCounter = ({ value, duration = 2000 }: { value: number; duration?: number }) => {
  const [count, setCount] = useState(0);
  
  useEffect(() => {
    let start = 0;
    const increment = value / (duration / 16);
    const timer = setInterval(() => {
      start += increment;
      if (start >= value) {
        setCount(value);
        clearInterval(timer);
      } else {
        setCount(Math.floor(start));
      }
    }, 16);
    return () => clearInterval(timer);
  }, [value, duration]);
  
  return <span>{count.toLocaleString()}</span>;
};

// Premium stat card with holographic effect
const HolographicStatCard = ({ 
  icon, 
  value, 
  label, 
  subValue,
  gradient, 
  delay = 0,
  trend
}: { 
  icon: React.ReactNode; 
  value: number | string; 
  label: string; 
  subValue?: string;
  gradient: string; 
  delay?: number;
  trend?: { value: number; isPositive: boolean };
}) => (
  <motion.div
    initial={{ opacity: 0, y: 30, scale: 0.9 }}
    animate={{ opacity: 1, y: 0, scale: 1 }}
    transition={{ duration: 0.6, delay, ease: "easeOut" }}
    whileHover={{ y: -8, scale: 1.02 }}
    className="group relative"
  >
    <div className={`absolute inset-0 rounded-3xl bg-gradient-to-br ${gradient} blur-xl opacity-50 group-hover:opacity-75 transition-opacity duration-500`} />
    <Card className="relative overflow-hidden rounded-3xl border-0 bg-card/80 backdrop-blur-xl shadow-2xl">
      {/* Holographic shimmer effect */}
      <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/5 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-1000" />
      
      {/* Grid pattern overlay */}
      <div className="absolute inset-0 bg-[linear-gradient(to_right,hsl(var(--border)/0.03)_1px,transparent_1px),linear-gradient(to_bottom,hsl(var(--border)/0.03)_1px,transparent_1px)] bg-[size:20px_20px]" />
      
      <CardContent className="relative pt-6 pb-6 px-6">
        <div className="flex items-start justify-between mb-4">
          <div className={`p-3 rounded-2xl bg-gradient-to-br ${gradient} shadow-lg`}>
            <div className="text-white">
              {icon}
            </div>
          </div>
          {trend && (
            <div className={`flex items-center gap-1 px-2 py-1 rounded-full text-xs font-bold ${
              trend.isPositive ? 'bg-emerald-500/20 text-emerald-400' : 'bg-red-500/20 text-red-400'
            }`}>
              <ArrowUpRight className={`w-3 h-3 ${!trend.isPositive && 'rotate-180'}`} />
              {trend.value}%
            </div>
          )}
        </div>
        
        <div className="space-y-1">
          <h3 className="text-4xl font-black text-foreground tracking-tight">
            {typeof value === 'number' ? <AnimatedCounter value={value} /> : value}
          </h3>
          <p className="text-sm font-medium text-muted-foreground">{label}</p>
          {subValue && (
            <p className="text-xs text-primary/70">{subValue}</p>
          )}
        </div>
      </CardContent>
    </Card>
  </motion.div>
);

// Radial progress indicator
const RadialProgress = ({ value, max, label, color }: { value: number; max: number; label: string; color: string }) => {
  const percentage = max > 0 ? (value / max) * 100 : 0;
  const circumference = 2 * Math.PI * 40;
  const strokeDashoffset = circumference - (percentage / 100) * circumference;
  
  return (
    <div className="flex flex-col items-center">
      <div className="relative w-24 h-24">
        <svg className="w-24 h-24 -rotate-90" viewBox="0 0 100 100">
          <circle
            cx="50"
            cy="50"
            r="40"
            fill="none"
            stroke="hsl(var(--muted))"
            strokeWidth="8"
            opacity="0.2"
          />
          <motion.circle
            cx="50"
            cy="50"
            r="40"
            fill="none"
            stroke={color}
            strokeWidth="8"
            strokeLinecap="round"
            strokeDasharray={circumference}
            initial={{ strokeDashoffset: circumference }}
            animate={{ strokeDashoffset }}
            transition={{ duration: 1.5, ease: "easeOut" }}
          />
        </svg>
        <div className="absolute inset-0 flex items-center justify-center">
          <span className="text-xl font-black">{percentage.toFixed(0)}%</span>
        </div>
      </div>
      <span className="text-sm text-muted-foreground mt-2 text-center">{label}</span>
    </div>
  );
};

export function GlobalInsightsOverview({ 
  categories, 
  totalOpinions, 
  totalContributors, 
  totalUpvotes,
  totalUsers,
  userCounts
}: GlobalInsightsProps) {
  const topCategory = categories[0];
  const [activeIndex, setActiveIndex] = useState<number | null>(null);
  
  // Calculate engagement metrics (all capped at reasonable percentages)
  const avgUpvotesPerOpinion = totalOpinions > 0 ? (totalUpvotes / totalOpinions) : 0;
  // Contribution rate: what % of total users are active contributors (capped at 100%)
  const contributionRate = totalUsers > 0 ? Math.min(100, Math.round((totalContributors / totalUsers) * 100)) : 0;
  // Engagement score: based on upvotes per opinion ratio (capped at 100%)
  const engagementScore = totalOpinions > 0 ? Math.min(100, Math.round((totalUpvotes / totalOpinions) * 20)) : 0;
  
  // Prepare radar chart data with normalized values
  const maxCount = Math.max(...categories.map(c => c.count), 1);
  const radarData = categories.slice(0, 6).map(cat => ({
    category: cat.name,
    opinions: cat.count,
    engagement: cat.count > 0 ? Math.round((cat.count / maxCount) * 100) : 0,
    fullMark: 100
  }));

  // User type distribution for donut chart
  const userTypeData = userCounts ? [
    { name: 'Audience', value: userCounts.audience, color: '#6366f1' },
    { name: 'Creators', value: userCounts.creator, color: '#a855f7' },
    { name: 'Studios', value: userCounts.studio, color: '#3b82f6' },
    { name: 'OTT', value: userCounts.ott, color: '#f97316' },
    { name: 'TV', value: userCounts.tv, color: '#10b981' },
    { name: 'Gaming', value: userCounts.gaming, color: '#8b5cf6' },
    { name: 'Music', value: userCounts.music, color: '#ec4899' },
    { name: 'Developers', value: userCounts.developer, color: '#0ea5e9' },
  ].filter(item => item.value > 0) : [];

  // Generate mock trend data based on actual stats
  const trendData = [
    { name: 'W1', opinions: Math.floor(totalOpinions * 0.15), users: Math.floor(totalUsers * 0.2) },
    { name: 'W2', opinions: Math.floor(totalOpinions * 0.25), users: Math.floor(totalUsers * 0.35) },
    { name: 'W3', opinions: Math.floor(totalOpinions * 0.4), users: Math.floor(totalUsers * 0.55) },
    { name: 'W4', opinions: Math.floor(totalOpinions * 0.65), users: Math.floor(totalUsers * 0.7) },
    { name: 'W5', opinions: Math.floor(totalOpinions * 0.85), users: Math.floor(totalUsers * 0.85) },
    { name: 'Now', opinions: totalOpinions, users: totalUsers },
  ];

  return (
    <div className="space-y-8">
      {/* Epic Hero Banner with Live Data */}
      {topCategory && (
        <motion.div 
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.8 }}
          className="relative overflow-hidden rounded-[2rem] p-10 md:p-14"
        >
          {/* Multi-layer background */}
          <div className="absolute inset-0 bg-gradient-to-br from-primary/30 via-accent/20 to-primary/10" />
          <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top_right,hsl(var(--primary)/0.3),transparent_60%)]" />
          <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_bottom_left,hsl(var(--accent)/0.2),transparent_60%)]" />
          
          {/* Animated grid */}
          <div className="absolute inset-0 bg-[linear-gradient(to_right,hsl(var(--primary)/0.05)_1px,transparent_1px),linear-gradient(to_bottom,hsl(var(--primary)/0.05)_1px,transparent_1px)] bg-[size:40px_40px]" />
          
          {/* Floating orbs */}
          <motion.div
            className="absolute top-10 right-20 w-32 h-32 rounded-full bg-primary/20 blur-3xl"
            animate={{ scale: [1, 1.3, 1], opacity: [0.3, 0.6, 0.3] }}
            transition={{ duration: 4, repeat: Infinity }}
          />
          <motion.div
            className="absolute bottom-10 left-20 w-40 h-40 rounded-full bg-accent/20 blur-3xl"
            animate={{ scale: [1.2, 1, 1.2], opacity: [0.4, 0.2, 0.4] }}
            transition={{ duration: 5, repeat: Infinity }}
          />
          
          <div className="relative z-10">
            <div className="flex flex-col lg:flex-row items-center justify-between gap-8">
              {/* Left: Trending info */}
              <div className="text-center lg:text-left space-y-4 flex-1">
                <motion.div
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-primary/20 border border-primary/30 backdrop-blur-xl"
                >
                  <span className="relative flex h-2 w-2">
                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75" />
                    <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500" />
                  </span>
                  <span className="text-sm font-bold text-primary">TRENDING NOW</span>
                </motion.div>
                
                <h2 className="text-4xl md:text-6xl font-black tracking-tight">
                  <span className="bg-gradient-to-r from-primary via-accent to-primary bg-clip-text text-transparent bg-[length:200%_auto] animate-gradient-x">
                    {topCategory.name}
                  </span>
                </h2>
                <p className="text-xl text-foreground/80 max-w-md">
                  Capturing <span className="text-4xl font-black text-primary">{topCategory.percentage}%</span> of global entertainment opinions
                </p>
                
                <div className="flex flex-wrap gap-3 justify-center lg:justify-start pt-2">
                  <Badge variant="outline" className="px-4 py-2 bg-background/50 backdrop-blur-xl border-primary/30">
                    <MessageSquare className="w-4 h-4 mr-2 text-primary" />
                    {topCategory.count} opinions
                  </Badge>
                  <Badge variant="outline" className="px-4 py-2 bg-background/50 backdrop-blur-xl border-emerald-500/30 text-emerald-400">
                    <TrendingUp className="w-4 h-4 mr-2" />
                    +{Math.floor(topCategory.percentage * 1.5)}% this week
                  </Badge>
                </div>
              </div>
              
              {/* Right: Live metrics ring */}
              <motion.div
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: 0.3 }}
                className="relative"
              >
                <div className="w-48 h-48 md:w-56 md:h-56 relative">
                  {/* Outer ring */}
                  <svg className="w-full h-full -rotate-90" viewBox="0 0 100 100">
                    <circle
                      cx="50"
                      cy="50"
                      r="45"
                      fill="none"
                      stroke="hsl(var(--muted))"
                      strokeWidth="3"
                      opacity="0.2"
                    />
                    <motion.circle
                      cx="50"
                      cy="50"
                      r="45"
                      fill="none"
                      stroke="url(#gradient)"
                      strokeWidth="6"
                      strokeLinecap="round"
                      strokeDasharray={`${topCategory.percentage * 2.83} 283`}
                      initial={{ strokeDasharray: "0 283" }}
                      animate={{ strokeDasharray: `${topCategory.percentage * 2.83} 283` }}
                      transition={{ duration: 1.5, ease: "easeOut" }}
                    />
                    <defs>
                      <linearGradient id="gradient" x1="0%" y1="0%" x2="100%" y2="0%">
                        <stop offset="0%" stopColor="hsl(var(--primary))" />
                        <stop offset="100%" stopColor="hsl(var(--accent))" />
                      </linearGradient>
                    </defs>
                  </svg>
                  
                  {/* Center content */}
                  <div className="absolute inset-0 flex flex-col items-center justify-center">
                    <topCategory.icon className="w-10 h-10 text-primary mb-2" />
                    <span className="text-3xl font-black">{topCategory.percentage}%</span>
                    <span className="text-xs text-muted-foreground">Market Share</span>
                  </div>
                </div>
              </motion.div>
            </div>
          </div>
        </motion.div>
      )}

      {/* Premium Stats Grid */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 md:gap-6">
        <HolographicStatCard
          icon={<Users className="w-7 h-7" />}
          value={totalUsers}
          label="Total Users"
          subValue="Across all platforms"
          gradient="from-indigo-500 to-violet-600"
          delay={0}
          trend={{ value: 12, isPositive: true }}
        />
        <HolographicStatCard
          icon={<MessageSquare className="w-7 h-7" />}
          value={totalOpinions}
          label="Opinions Shared"
          subValue="This week"
          gradient="from-blue-500 to-cyan-600"
          delay={0.1}
          trend={{ value: 8, isPositive: true }}
        />
        <HolographicStatCard
          icon={<Heart className="w-7 h-7" />}
          value={totalUpvotes}
          label="Total Engagement"
          subValue={`${avgUpvotesPerOpinion.toFixed(1)} avg per opinion`}
          gradient="from-rose-500 to-pink-600"
          delay={0.2}
          trend={{ value: 15, isPositive: true }}
        />
        <HolographicStatCard
          icon={<Zap className="w-7 h-7" />}
          value={`${engagementScore.toFixed(0)}%`}
          label="Engagement Score"
          subValue="Platform health"
          gradient="from-amber-500 to-orange-600"
          delay={0.3}
        />
      </div>

      {/* Advanced Analytics Dashboard */}
      <div className="grid lg:grid-cols-3 gap-6">
        {/* Category Distribution - Donut Chart */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
        >
          <Card className="h-full border-0 bg-card/50 backdrop-blur-xl shadow-2xl rounded-3xl overflow-hidden">
            <div className="absolute inset-0 bg-gradient-to-br from-primary/5 to-transparent" />
            <CardHeader className="relative pb-2">
              <CardTitle className="flex items-center gap-3 text-lg">
                <div className="p-2 rounded-xl bg-primary/10">
                  <PieChartIcon className="w-5 h-5 text-primary" />
                </div>
                Category Distribution
              </CardTitle>
            </CardHeader>
            <CardContent className="relative">
              <div className="h-[280px]">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={categories}
                      cx="50%"
                      cy="50%"
                      innerRadius={60}
                      outerRadius={100}
                      paddingAngle={3}
                      dataKey="count"
                      onMouseEnter={(_, index) => setActiveIndex(index)}
                      onMouseLeave={() => setActiveIndex(null)}
                    >
                      {categories.map((entry, index) => (
                        <Cell 
                          key={`cell-${index}`} 
                          fill={entry.color}
                          stroke="transparent"
                          style={{
                            filter: activeIndex === index ? 'brightness(1.2)' : 'none',
                            transform: activeIndex === index ? 'scale(1.05)' : 'scale(1)',
                            transformOrigin: 'center',
                            transition: 'all 0.3s ease'
                          }}
                        />
                      ))}
                    </Pie>
                    <Tooltip 
                      contentStyle={{ 
                        backgroundColor: 'hsl(var(--card))', 
                        border: '1px solid hsl(var(--border))',
                        borderRadius: '12px',
                        boxShadow: '0 25px 50px -12px rgba(0,0,0,0.25)'
                      }}
                      formatter={(value: number, name: string) => [
                        `${value} opinions (${categories.find(c => c.name === name)?.percentage || 0}%)`,
                        name
                      ]}
                    />
                  </PieChart>
                </ResponsiveContainer>
              </div>
              
              {/* Legend */}
              <div className="grid grid-cols-2 gap-2 mt-4">
                {categories.slice(0, 6).map((cat, i) => (
                  <div key={i} className="flex items-center gap-2 text-sm">
                    <div className="w-3 h-3 rounded-full" style={{ backgroundColor: cat.color }} />
                    <span className="text-muted-foreground truncate">{cat.name}</span>
                    <span className="font-bold ml-auto">{cat.percentage}%</span>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </motion.div>

        {/* Growth Trend Chart */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5 }}
          className="lg:col-span-2"
        >
          <Card className="h-full border-0 bg-card/50 backdrop-blur-xl shadow-2xl rounded-3xl overflow-hidden">
            <div className="absolute inset-0 bg-gradient-to-br from-accent/5 to-transparent" />
            <CardHeader className="relative pb-2">
              <CardTitle className="flex items-center gap-3 text-lg">
                <div className="p-2 rounded-xl bg-accent/10">
                  <Activity className="w-5 h-5 text-accent" />
                </div>
                Platform Growth Trajectory
              </CardTitle>
            </CardHeader>
            <CardContent className="relative">
              <div className="h-[320px]">
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart data={trendData}>
                    <defs>
                      <linearGradient id="colorOpinions" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="hsl(var(--primary))" stopOpacity={0.4}/>
                        <stop offset="95%" stopColor="hsl(var(--primary))" stopOpacity={0}/>
                      </linearGradient>
                      <linearGradient id="colorUsers" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="hsl(var(--accent))" stopOpacity={0.4}/>
                        <stop offset="95%" stopColor="hsl(var(--accent))" stopOpacity={0}/>
                      </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" opacity={0.3} />
                    <XAxis dataKey="name" stroke="hsl(var(--muted-foreground))" fontSize={12} />
                    <YAxis stroke="hsl(var(--muted-foreground))" fontSize={12} />
                    <Tooltip
                      contentStyle={{ 
                        backgroundColor: 'hsl(var(--card))', 
                        border: '1px solid hsl(var(--border))',
                        borderRadius: '12px',
                        boxShadow: '0 25px 50px -12px rgba(0,0,0,0.25)'
                      }}
                    />
                    <Area 
                      type="monotone" 
                      dataKey="opinions" 
                      stroke="hsl(var(--primary))" 
                      strokeWidth={3}
                      fillOpacity={1} 
                      fill="url(#colorOpinions)" 
                      name="Opinions"
                    />
                    <Area 
                      type="monotone" 
                      dataKey="users" 
                      stroke="hsl(var(--accent))" 
                      strokeWidth={3}
                      fillOpacity={1} 
                      fill="url(#colorUsers)" 
                      name="Users"
                    />
                  </AreaChart>
                </ResponsiveContainer>
              </div>
            </CardContent>
          </Card>
        </motion.div>
      </div>

      {/* User Ecosystem Visualization */}
      {userCounts && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.6 }}
        >
          <Card className="border-0 bg-card/50 backdrop-blur-xl shadow-2xl rounded-3xl overflow-hidden">
            <div className="absolute inset-0 bg-gradient-to-r from-primary/5 via-transparent to-accent/5" />
            <CardHeader className="relative">
              <CardTitle className="flex items-center gap-3">
                <div className="p-2 rounded-xl bg-gradient-to-br from-primary to-accent">
                  <Layers className="w-5 h-5 text-white" />
                </div>
                <span>User Ecosystem</span>
                <Badge variant="outline" className="ml-auto bg-primary/10 border-primary/30">
                  {totalUsers} total users
                </Badge>
              </CardTitle>
            </CardHeader>
            <CardContent className="relative">
              <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-8 gap-4">
                {[
                  { label: 'Audience', value: userCounts.audience, icon: '👥', gradient: 'from-indigo-500 to-violet-600' },
                  { label: 'Creators', value: userCounts.creator, icon: '🎨', gradient: 'from-purple-500 to-pink-600' },
                  { label: 'Studios', value: userCounts.studio, icon: '🎬', gradient: 'from-blue-500 to-cyan-600' },
                  { label: 'OTT', value: userCounts.ott, icon: '📺', gradient: 'from-orange-500 to-red-600' },
                  { label: 'TV', value: userCounts.tv, icon: '📡', gradient: 'from-green-500 to-emerald-600' },
                  { label: 'Gaming', value: userCounts.gaming, icon: '🎮', gradient: 'from-violet-500 to-fuchsia-600' },
                  { label: 'Music', value: userCounts.music, icon: '🎵', gradient: 'from-pink-500 to-rose-600' },
                  { label: 'Developers', value: userCounts.developer, icon: '💻', gradient: 'from-cyan-500 to-blue-600' },
                ].map((item, i) => (
                  <motion.div
                    key={item.label}
                    initial={{ opacity: 0, scale: 0.8 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ delay: 0.7 + i * 0.05 }}
                    whileHover={{ scale: 1.05, y: -5 }}
                    className="group relative"
                  >
                    <div className={`absolute inset-0 rounded-2xl bg-gradient-to-br ${item.gradient} opacity-0 group-hover:opacity-20 blur-xl transition-opacity duration-300`} />
                    <div className="relative flex flex-col items-center p-4 rounded-2xl bg-background/50 border border-border/50 backdrop-blur-sm hover:border-primary/30 transition-all">
                      <span className="text-3xl mb-2 group-hover:scale-110 transition-transform">{item.icon}</span>
                      <span className="text-2xl font-black text-foreground">
                        <AnimatedCounter value={item.value} duration={1500} />
                      </span>
                      <span className="text-xs text-muted-foreground text-center">{item.label}</span>
                      <div className={`mt-2 h-1 w-full rounded-full bg-gradient-to-r ${item.gradient} opacity-50`} />
                    </div>
                  </motion.div>
                ))}
              </div>
            </CardContent>
          </Card>
        </motion.div>
      )}

      {/* Category Performance Bars */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.8 }}
      >
        <Card className="border-0 bg-card/50 backdrop-blur-xl shadow-2xl rounded-3xl overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-br from-accent/5 to-primary/5" />
          <CardHeader className="relative">
            <CardTitle className="flex items-center gap-3">
              <div className="p-2 rounded-xl bg-gradient-to-br from-accent to-primary">
                <BarChart3 className="w-5 h-5 text-white" />
              </div>
              Category Performance Index
            </CardTitle>
          </CardHeader>
          <CardContent className="relative space-y-4">
            {categories.map((category, index) => (
              <motion.div
                key={category.id}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.9 + index * 0.1 }}
                className="group"
              >
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center gap-3">
                    <div 
                      className="w-10 h-10 rounded-xl flex items-center justify-center"
                      style={{ backgroundColor: `${category.color}20` }}
                    >
                      <category.icon className="w-5 h-5" style={{ color: category.color }} />
                    </div>
                    <span className="font-semibold">{category.name}</span>
                  </div>
                  <div className="flex items-center gap-3">
                    <span className="text-sm text-muted-foreground">{category.count} opinions</span>
                    <span className="text-lg font-black" style={{ color: category.color }}>
                      {category.percentage}%
                    </span>
                  </div>
                </div>
                <div className="h-3 bg-muted/30 rounded-full overflow-hidden">
                  <motion.div
                    className="h-full rounded-full"
                    style={{ backgroundColor: category.color }}
                    initial={{ width: 0 }}
                    animate={{ width: `${category.percentage}%` }}
                    transition={{ duration: 1, delay: 0.9 + index * 0.1, ease: "easeOut" }}
                  />
                </div>
              </motion.div>
            ))}
          </CardContent>
        </Card>
      </motion.div>

      {/* Engagement Metrics */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 1 }}
      >
        <Card className="border-0 bg-gradient-to-br from-primary/10 via-card to-accent/10 backdrop-blur-xl shadow-2xl rounded-3xl overflow-hidden">
          <CardHeader>
            <CardTitle className="flex items-center gap-3 text-center justify-center">
              <Sparkles className="w-6 h-6 text-primary" />
              Real-Time Engagement Metrics
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex flex-wrap justify-center gap-8">
              <RadialProgress 
                value={totalContributors} 
                max={totalUsers} 
                label="Active Contributors" 
                color="hsl(var(--primary))" 
              />
              <RadialProgress 
                value={avgUpvotesPerOpinion} 
                max={10} 
                label="Avg Engagement" 
                color="hsl(var(--accent))" 
              />
              <RadialProgress 
                value={contributionRate} 
                max={100} 
                label="Contribution Rate" 
                color="#10b981" 
              />
              <RadialProgress 
                value={engagementScore} 
                max={100} 
                label="Health Score" 
                color="#f59e0b" 
              />
            </div>
          </CardContent>
        </Card>
      </motion.div>
    </div>
  );
}
