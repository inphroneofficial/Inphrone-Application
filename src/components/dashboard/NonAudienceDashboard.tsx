import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { 
  TrendingUp, 
  Users, 
  BarChart3, 
  PieChart, 
  Eye, 
  Activity,
  Globe,
  Sparkles,
  ArrowRight,
  Calendar,
  Target,
  Zap
} from "lucide-react";
import { motion } from "framer-motion";
import { 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer,
  PieChart as RechartsPie,
  Pie,
  Cell,
  AreaChart,
  Area
} from "recharts";

interface NonAudienceDashboardProps {
  userType: string;
  userId: string;
}

interface AnalyticsData {
  totalOpinions: number;
  totalContributors: number;
  weeklyGrowth: number;
  topCategories: Array<{ name: string; count: number }>;
  demographicBreakdown: {
    ageGroups: Record<string, number>;
    genderDistribution: Record<string, number>;
    topCountries: Array<{ name: string; count: number }>;
  };
  weeklyTrend: Array<{ day: string; opinions: number }>;
}

const CHART_COLORS = ['hsl(var(--primary))', 'hsl(var(--accent))', '#10B981', '#F59E0B', '#EF4444', '#8B5CF6'];

export function NonAudienceDashboard({ userType, userId }: NonAudienceDashboardProps) {
  const navigate = useNavigate();
  const [analytics, setAnalytics] = useState<AnalyticsData | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchAnalytics();
  }, [userId]);

  const fetchAnalytics = async () => {
    try {
      // Fetch all opinions for analytics
      const { data: opinions } = await supabase
        .from("opinions")
        .select("*, category_id")
        .order("created_at", { ascending: false });

      // Fetch categories
      const { data: categories } = await supabase
        .from("categories")
        .select("*");

      // Fetch profiles for demographic data
      const { data: profiles } = await supabase
        .from("profiles")
        .select("id, age_group, gender, country, user_type")
        .eq("user_type", "audience");

      // Get unique contributor IDs from opinions
      const contributorIds = [...new Set(opinions?.map(o => o.user_id) || [])];
      
      // Calculate category counts
      const categoryMap = new Map(categories?.map(c => [c.id, c.name]) || []);
      const categoryCounts: Record<string, number> = {};
      opinions?.forEach(o => {
        const catName = categoryMap.get(o.category_id) || "Other";
        categoryCounts[catName] = (categoryCounts[catName] || 0) + 1;
      });

      const topCategories = Object.entries(categoryCounts)
        .sort((a, b) => b[1] - a[1])
        .slice(0, 5)
        .map(([name, count]) => ({ name, count }));

      // Calculate demographics
      const ageGroups: Record<string, number> = {};
      const genderDistribution: Record<string, number> = {};
      const countryCounts: Record<string, number> = {};

      profiles?.forEach(p => {
        if (p.age_group) ageGroups[p.age_group] = (ageGroups[p.age_group] || 0) + 1;
        if (p.gender) genderDistribution[p.gender] = (genderDistribution[p.gender] || 0) + 1;
        if (p.country) countryCounts[p.country] = (countryCounts[p.country] || 0) + 1;
      });

      const topCountries = Object.entries(countryCounts)
        .sort((a, b) => b[1] - a[1])
        .slice(0, 5)
        .map(([name, count]) => ({ name, count }));

      // Calculate weekly trend (last 7 days)
      const now = new Date();
      const weeklyTrend = [];
      for (let i = 6; i >= 0; i--) {
        const date = new Date(now);
        date.setDate(date.getDate() - i);
        const dayStr = date.toLocaleDateString('en-US', { weekday: 'short' });
        const dayStart = new Date(date.setHours(0, 0, 0, 0));
        const dayEnd = new Date(date.setHours(23, 59, 59, 999));
        
        const count = opinions?.filter(o => {
          const created = new Date(o.created_at);
          return created >= dayStart && created <= dayEnd;
        }).length || 0;
        
        weeklyTrend.push({ day: dayStr, opinions: count });
      }

      // Calculate weekly growth
      const thisWeekTotal = weeklyTrend.slice(-3).reduce((sum, d) => sum + d.opinions, 0);
      const lastWeekTotal = weeklyTrend.slice(0, 4).reduce((sum, d) => sum + d.opinions, 0);
      const weeklyGrowth = lastWeekTotal > 0 ? Math.round(((thisWeekTotal - lastWeekTotal) / lastWeekTotal) * 100) : 0;

      setAnalytics({
        totalOpinions: opinions?.length || 0,
        totalContributors: contributorIds.length,
        weeklyGrowth,
        topCategories,
        demographicBreakdown: {
          ageGroups,
          genderDistribution,
          topCountries
        },
        weeklyTrend
      });
      
      setLoading(false);
    } catch (error) {
      console.error("Error fetching analytics:", error);
      setLoading(false);
    }
  };

  const getUserTypeLabel = () => {
    switch (userType) {
      case 'creator': return 'Creator';
      case 'studio': return 'Studio';
      case 'ott': return 'OTT Platform';
      case 'tv': return 'TV Network';
      case 'gaming': return 'Game Developer';
      case 'music': return 'Music Industry';
      case 'developer': return 'App Developer';
      default: return 'Professional';
    }
  };

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          {[1, 2, 3, 4].map(i => (
            <Card key={i} className="h-32 animate-pulse bg-muted/50" />
          ))}
        </div>
      </div>
    );
  }

  if (!analytics) return null;

  // Prepare chart data
  const genderData = Object.entries(analytics.demographicBreakdown.genderDistribution)
    .filter(([name]) => name.toLowerCase() !== 'not specified')
    .map(([name, value]) => ({ name, value }));

  const ageData = Object.entries(analytics.demographicBreakdown.ageGroups)
    .filter(([name]) => name.toLowerCase() !== 'not specified')
    .map(([name, value]) => ({ name, value }));

  return (
    <div className="space-y-8">
      {/* Analytics Overview Header */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="relative overflow-hidden rounded-2xl p-6 md:p-8 bg-gradient-to-br from-primary/15 via-accent/10 to-primary/5 border-2 border-primary/20"
      >
        <div className="absolute inset-0 bg-grid-white/[0.02] bg-[size:40px_40px]" />
        <div className="absolute top-0 right-0 w-64 h-64 bg-primary/20 rounded-full blur-3xl animate-pulse-glow" />
        
        <div className="relative z-10 flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
          <div>
            <Badge className="mb-3 bg-gradient-to-r from-primary to-accent text-white border-0">
              <BarChart3 className="w-3 h-3 mr-1" />
              {getUserTypeLabel()} Analytics
            </Badge>
            <h2 className="text-2xl md:text-3xl font-bold">
              Real-Time Audience Intelligence
            </h2>
            <p className="text-muted-foreground mt-1">
              Insights from {analytics.totalContributors.toLocaleString()} active contributors
            </p>
          </div>
          <Button 
            onClick={() => navigate("/insights")}
            className="gradient-primary text-white border-0 gap-2"
          >
            <Eye className="w-4 h-4" />
            Deep Dive Insights
            <ArrowRight className="w-4 h-4" />
          </Button>
        </div>
      </motion.div>

      {/* Key Metrics */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
        >
          <Card className="relative overflow-hidden bg-gradient-to-br from-blue-500/10 to-blue-500/5 border-2 border-blue-500/20 p-5 hover:shadow-lg transition-all">
            <div className="flex items-center justify-between mb-3">
              <span className="text-sm font-medium text-muted-foreground">Total Opinions</span>
              <Activity className="w-5 h-5 text-blue-500" />
            </div>
            <p className="text-3xl font-bold bg-gradient-to-r from-blue-500 to-cyan-500 bg-clip-text text-transparent">
              {analytics.totalOpinions.toLocaleString()}
            </p>
            <p className="text-xs text-muted-foreground mt-1">Platform-wide data</p>
          </Card>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.15 }}
        >
          <Card className="relative overflow-hidden bg-gradient-to-br from-emerald-500/10 to-emerald-500/5 border-2 border-emerald-500/20 p-5 hover:shadow-lg transition-all">
            <div className="flex items-center justify-between mb-3">
              <span className="text-sm font-medium text-muted-foreground">Contributors</span>
              <Users className="w-5 h-5 text-emerald-500" />
            </div>
            <p className="text-3xl font-bold bg-gradient-to-r from-emerald-500 to-teal-500 bg-clip-text text-transparent">
              {analytics.totalContributors.toLocaleString()}
            </p>
            <p className="text-xs text-muted-foreground mt-1">Active audience members</p>
          </Card>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
        >
          <Card className="relative overflow-hidden bg-gradient-to-br from-violet-500/10 to-violet-500/5 border-2 border-violet-500/20 p-5 hover:shadow-lg transition-all">
            <div className="flex items-center justify-between mb-3">
              <span className="text-sm font-medium text-muted-foreground">Weekly Growth</span>
              <TrendingUp className="w-5 h-5 text-violet-500" />
            </div>
            <p className="text-3xl font-bold bg-gradient-to-r from-violet-500 to-purple-500 bg-clip-text text-transparent">
              {analytics.weeklyGrowth > 0 ? '+' : ''}{analytics.weeklyGrowth}%
            </p>
            <p className="text-xs text-muted-foreground mt-1">vs last week</p>
          </Card>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.25 }}
        >
          <Card className="relative overflow-hidden bg-gradient-to-br from-amber-500/10 to-amber-500/5 border-2 border-amber-500/20 p-5 hover:shadow-lg transition-all">
            <div className="flex items-center justify-between mb-3">
              <span className="text-sm font-medium text-muted-foreground">Top Regions</span>
              <Globe className="w-5 h-5 text-amber-500" />
            </div>
            <p className="text-3xl font-bold bg-gradient-to-r from-amber-500 to-orange-500 bg-clip-text text-transparent">
              {analytics.demographicBreakdown.topCountries.length}
            </p>
            <p className="text-xs text-muted-foreground mt-1">Countries represented</p>
          </Card>
        </motion.div>
      </div>

      {/* Charts Row */}
      <div className="grid md:grid-cols-2 gap-6">
        {/* Weekly Trend */}
        <motion.div
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.3 }}
        >
          <Card className="glass-card border-2">
            <CardHeader className="pb-2">
              <CardTitle className="flex items-center gap-2 text-lg">
                <Calendar className="w-5 h-5 text-primary" />
                Weekly Activity Trend
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="h-[200px]">
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart data={analytics.weeklyTrend}>
                    <defs>
                      <linearGradient id="opinionGradient" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="hsl(var(--primary))" stopOpacity={0.3}/>
                        <stop offset="95%" stopColor="hsl(var(--primary))" stopOpacity={0}/>
                      </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
                    <XAxis dataKey="day" className="text-xs" />
                    <YAxis className="text-xs" />
                    <Tooltip 
                      contentStyle={{ 
                        backgroundColor: 'hsl(var(--card))', 
                        border: '1px solid hsl(var(--border))',
                        borderRadius: '8px'
                      }} 
                    />
                    <Area 
                      type="monotone" 
                      dataKey="opinions" 
                      stroke="hsl(var(--primary))" 
                      fill="url(#opinionGradient)"
                      strokeWidth={2}
                    />
                  </AreaChart>
                </ResponsiveContainer>
              </div>
            </CardContent>
          </Card>
        </motion.div>

        {/* Top Categories */}
        <motion.div
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.35 }}
        >
          <Card className="glass-card border-2">
            <CardHeader className="pb-2">
              <CardTitle className="flex items-center gap-2 text-lg">
                <Target className="w-5 h-5 text-primary" />
                Top Categories
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="h-[200px]">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={analytics.topCategories} layout="vertical">
                    <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
                    <XAxis type="number" className="text-xs" />
                    <YAxis dataKey="name" type="category" width={80} className="text-xs" />
                    <Tooltip 
                      contentStyle={{ 
                        backgroundColor: 'hsl(var(--card))', 
                        border: '1px solid hsl(var(--border))',
                        borderRadius: '8px'
                      }} 
                    />
                    <Bar 
                      dataKey="count" 
                      fill="hsl(var(--primary))" 
                      radius={[0, 4, 4, 0]}
                    />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </CardContent>
          </Card>
        </motion.div>
      </div>

      {/* Demographics Row */}
      <div className="grid md:grid-cols-3 gap-6">
        {/* Gender Distribution */}
        {genderData.length > 0 && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 }}
          >
            <Card className="glass-card border-2">
              <CardHeader className="pb-2">
                <CardTitle className="flex items-center gap-2 text-lg">
                  <PieChart className="w-5 h-5 text-primary" />
                  Gender Distribution
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="h-[180px]">
                  <ResponsiveContainer width="100%" height="100%">
                    <RechartsPie>
                      <Pie
                        data={genderData}
                        cx="50%"
                        cy="50%"
                        innerRadius={40}
                        outerRadius={70}
                        paddingAngle={5}
                        dataKey="value"
                      >
                        {genderData.map((_, index) => (
                          <Cell key={`cell-${index}`} fill={CHART_COLORS[index % CHART_COLORS.length]} />
                        ))}
                      </Pie>
                      <Tooltip />
                    </RechartsPie>
                  </ResponsiveContainer>
                </div>
                <div className="flex flex-wrap justify-center gap-3 mt-2">
                  {genderData.map((item, index) => (
                    <div key={item.name} className="flex items-center gap-1.5 text-xs">
                      <div 
                        className="w-2.5 h-2.5 rounded-full" 
                        style={{ backgroundColor: CHART_COLORS[index % CHART_COLORS.length] }}
                      />
                      <span className="capitalize">{item.name}</span>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </motion.div>
        )}

        {/* Age Distribution */}
        {ageData.length > 0 && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.45 }}
          >
            <Card className="glass-card border-2">
              <CardHeader className="pb-2">
                <CardTitle className="flex items-center gap-2 text-lg">
                  <Users className="w-5 h-5 text-primary" />
                  Age Groups
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {ageData.slice(0, 5).map((age, index) => {
                    const total = ageData.reduce((sum, a) => sum + a.value, 0);
                    const percentage = Math.round((age.value / total) * 100);
                    return (
                      <div key={age.name} className="space-y-1">
                        <div className="flex items-center justify-between text-sm">
                          <span>{age.name}</span>
                          <span className="font-medium">{percentage}%</span>
                        </div>
                        <div className="h-2 bg-muted rounded-full overflow-hidden">
                          <motion.div
                            initial={{ width: 0 }}
                            animate={{ width: `${percentage}%` }}
                            transition={{ delay: 0.5 + index * 0.1, duration: 0.5 }}
                            className="h-full rounded-full"
                            style={{ backgroundColor: CHART_COLORS[index % CHART_COLORS.length] }}
                          />
                        </div>
                      </div>
                    );
                  })}
                </div>
              </CardContent>
            </Card>
          </motion.div>
        )}

        {/* Top Countries */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5 }}
        >
          <Card className="glass-card border-2">
            <CardHeader className="pb-2">
              <CardTitle className="flex items-center gap-2 text-lg">
                <Globe className="w-5 h-5 text-primary" />
                Top Regions
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {analytics.demographicBreakdown.topCountries.slice(0, 5).map((country, index) => (
                  <div key={country.name} className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <span className="text-lg">🌍</span>
                      <span className="font-medium">{country.name}</span>
                    </div>
                    <Badge variant="secondary">
                      {country.count} users
                    </Badge>
                  </div>
                ))}
                {analytics.demographicBreakdown.topCountries.length === 0 && (
                  <p className="text-sm text-muted-foreground text-center py-4">
                    No regional data available yet
                  </p>
                )}
              </div>
            </CardContent>
          </Card>
        </motion.div>
      </div>

      {/* Quick Actions for Non-Audience */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.55 }}
      >
        <Card className="relative overflow-hidden bg-gradient-to-br from-primary/10 via-accent/5 to-transparent border-2 border-primary/20">
          <CardContent className="p-6">
            <div className="flex flex-col md:flex-row items-center justify-between gap-4">
              <div className="flex items-center gap-4">
                <div className="p-3 rounded-xl bg-gradient-to-br from-primary to-accent">
                  <Zap className="w-6 h-6 text-white" />
                </div>
                <div>
                  <h3 className="font-semibold text-lg">Explore Deep Insights</h3>
                  <p className="text-sm text-muted-foreground">
                    Access category-specific analytics and audience preferences
                  </p>
                </div>
              </div>
              <div className="flex gap-3">
                <Button 
                  variant="outline" 
                  onClick={() => navigate("/inphrosync")}
                  className="gap-2"
                >
                  <Activity className="w-4 h-4" />
                  InphroSync Data
                </Button>
                <Button 
                  onClick={() => navigate("/insights")}
                  className="gradient-primary text-white border-0 gap-2"
                >
                  <Sparkles className="w-4 h-4" />
                  Full Analytics
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      </motion.div>
    </div>
  );
}
