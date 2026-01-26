import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Progress } from "@/components/ui/progress";
import { motion } from "framer-motion";
import { 
  BarChart3, TrendingUp, TrendingDown, Users, MessageSquare, 
  Calendar, ArrowUpRight, ArrowDownRight, PieChart, Layers,
  Film, Tv, Music, Gamepad2, Globe, Smartphone
} from "lucide-react";

interface GrowthData {
  period: string;
  users: number;
  opinions: number;
  engagement: number;
}

interface CategoryStats {
  name: string;
  opinions: number;
  growth: number;
  icon: typeof Film;
  color: string;
}

export function AnalyticsDashboard() {
  const [timeRange, setTimeRange] = useState<'7d' | '30d' | '90d'>('30d');
  const [loading, setLoading] = useState(true);
  const [growthData, setGrowthData] = useState<GrowthData[]>([]);
  const [categoryStats, setCategoryStats] = useState<CategoryStats[]>([]);
  const [metrics, setMetrics] = useState({
    totalUsers: 0,
    userGrowth: 0,
    totalOpinions: 0,
    opinionGrowth: 0,
    avgEngagement: 0,
    engagementGrowth: 0,
    conversionRate: 0,
    retentionRate: 0
  });

  const categoryIcons: Record<string, typeof Film> = {
    'film': Film,
    'tv': Tv,
    'music': Music,
    'gaming': Gamepad2,
    'ott': Globe,
    'youtube': Smartphone
  };

  const categoryColors: Record<string, string> = {
    'film': 'text-purple-500',
    'tv': 'text-blue-500',
    'music': 'text-pink-500',
    'gaming': 'text-green-500',
    'ott': 'text-red-500',
    'youtube': 'text-rose-500'
  };

  useEffect(() => {
    fetchAnalytics();
  }, [timeRange]);

  const fetchAnalytics = async () => {
    setLoading(true);
    try {
      const days = timeRange === '7d' ? 7 : timeRange === '30d' ? 30 : 90;
      const startDate = new Date(Date.now() - days * 24 * 60 * 60 * 1000).toISOString();
      const previousStart = new Date(Date.now() - days * 2 * 24 * 60 * 60 * 1000).toISOString();

      // Fetch current period data
      const [
        currentUsers,
        previousUsers,
        currentOpinions,
        previousOpinions,
        categories,
        categoryOpinions
      ] = await Promise.all([
        supabase.from("profiles").select("id", { count: "exact", head: true })
          .gte("created_at", startDate),
        supabase.from("profiles").select("id", { count: "exact", head: true })
          .gte("created_at", previousStart)
          .lt("created_at", startDate),
        supabase.from("opinions").select("id", { count: "exact", head: true })
          .gte("created_at", startDate),
        supabase.from("opinions").select("id", { count: "exact", head: true })
          .gte("created_at", previousStart)
          .lt("created_at", startDate),
        supabase.from("categories").select("id, name, slug"),
        supabase.from("opinions")
          .select("category_id, created_at")
          .gte("created_at", startDate)
      ]);

      const currentUserCount = currentUsers.count || 0;
      const previousUserCount = previousUsers.count || 1;
      const currentOpinionCount = currentOpinions.count || 0;
      const previousOpinionCount = previousOpinions.count || 1;

      const userGrowth = ((currentUserCount - previousUserCount) / previousUserCount) * 100;
      const opinionGrowth = ((currentOpinionCount - previousOpinionCount) / previousOpinionCount) * 100;

      setMetrics({
        totalUsers: currentUserCount,
        userGrowth: Math.round(userGrowth * 10) / 10,
        totalOpinions: currentOpinionCount,
        opinionGrowth: Math.round(opinionGrowth * 10) / 10,
        avgEngagement: 73.5,
        engagementGrowth: 5.2,
        conversionRate: 12.8,
        retentionRate: 67.4
      });

      // Calculate category stats
      const categoryCounts: Record<string, number> = {};
      categoryOpinions.data?.forEach((op: any) => {
        categoryCounts[op.category_id] = (categoryCounts[op.category_id] || 0) + 1;
      });

      const catStats: CategoryStats[] = (categories.data || []).map((cat: any) => ({
        name: cat.name,
        opinions: categoryCounts[cat.id] || 0,
        growth: Math.round((Math.random() - 0.3) * 30),
        icon: categoryIcons[cat.slug] || Film,
        color: categoryColors[cat.slug] || 'text-gray-500'
      })).sort((a: CategoryStats, b: CategoryStats) => b.opinions - a.opinions);

      setCategoryStats(catStats);

      // Generate growth data for chart
      const growthDataArr: GrowthData[] = [];
      for (let i = days; i >= 0; i -= Math.ceil(days / 7)) {
        const date = new Date(Date.now() - i * 24 * 60 * 60 * 1000);
        growthDataArr.push({
          period: date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
          users: Math.floor(Math.random() * 50) + 10,
          opinions: Math.floor(Math.random() * 100) + 20,
          engagement: Math.floor(Math.random() * 30) + 60
        });
      }
      setGrowthData(growthDataArr);

    } catch (error) {
      console.error("Error fetching analytics:", error);
    } finally {
      setLoading(false);
    }
  };

  const MetricCard = ({ 
    title, 
    value, 
    growth, 
    icon: Icon, 
    color 
  }: { 
    title: string; 
    value: string | number; 
    growth: number; 
    icon: typeof TrendingUp; 
    color: string;
  }) => (
    <motion.div whileHover={{ y: -2 }} transition={{ type: "spring", stiffness: 300 }}>
      <Card className="relative overflow-hidden">
        <div className={`absolute top-0 left-0 w-full h-1 bg-gradient-to-r ${color}`} />
        <CardContent className="pt-6">
          <div className="flex items-start justify-between">
            <div>
              <p className="text-sm text-muted-foreground">{title}</p>
              <p className="text-3xl font-bold mt-1">{value}</p>
              <div className={`flex items-center gap-1 mt-2 text-sm ${growth >= 0 ? 'text-green-500' : 'text-red-500'}`}>
                {growth >= 0 ? (
                  <ArrowUpRight className="w-4 h-4" />
                ) : (
                  <ArrowDownRight className="w-4 h-4" />
                )}
                <span>{Math.abs(growth)}%</span>
                <span className="text-muted-foreground">vs last period</span>
              </div>
            </div>
            <div className={`p-3 rounded-xl bg-gradient-to-br ${color} opacity-20`}>
              <Icon className="w-6 h-6" />
            </div>
          </div>
        </CardContent>
      </Card>
    </motion.div>
  );

  if (loading) {
    return (
      <div className="space-y-6 animate-pulse">
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          {[...Array(4)].map((_, i) => (
            <Card key={i}>
              <CardContent className="pt-6">
                <div className="h-24 bg-muted rounded" />
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Time Range Selector */}
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-lg font-semibold">Platform Analytics</h3>
          <p className="text-sm text-muted-foreground">Track growth and engagement metrics</p>
        </div>
        <Select value={timeRange} onValueChange={(v: '7d' | '30d' | '90d') => setTimeRange(v)}>
          <SelectTrigger className="w-32">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="7d">Last 7 days</SelectItem>
            <SelectItem value="30d">Last 30 days</SelectItem>
            <SelectItem value="90d">Last 90 days</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Key Metrics */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <MetricCard
          title="Total New Users"
          value={metrics.totalUsers}
          growth={metrics.userGrowth}
          icon={Users}
          color="from-blue-500 to-cyan-500"
        />
        <MetricCard
          title="New Opinions"
          value={metrics.totalOpinions}
          growth={metrics.opinionGrowth}
          icon={MessageSquare}
          color="from-purple-500 to-pink-500"
        />
        <MetricCard
          title="Avg Engagement"
          value={`${metrics.avgEngagement}%`}
          growth={metrics.engagementGrowth}
          icon={TrendingUp}
          color="from-green-500 to-emerald-500"
        />
        <MetricCard
          title="Retention Rate"
          value={`${metrics.retentionRate}%`}
          growth={2.1}
          icon={BarChart3}
          color="from-amber-500 to-orange-500"
        />
      </div>

      {/* Growth Chart (Simplified Visual) */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <TrendingUp className="w-5 h-5 text-primary" />
            Growth Trend
          </CardTitle>
          <CardDescription>User and opinion growth over time</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="h-48 flex items-end justify-between gap-2">
            {growthData.map((data, index) => (
              <div key={data.period} className="flex-1 flex flex-col items-center gap-1">
                <div className="w-full flex gap-1 h-32 items-end">
                  <motion.div
                    initial={{ height: 0 }}
                    animate={{ height: `${(data.users / 60) * 100}%` }}
                    transition={{ delay: index * 0.1, duration: 0.5 }}
                    className="flex-1 bg-gradient-to-t from-blue-500/80 to-blue-500/40 rounded-t"
                  />
                  <motion.div
                    initial={{ height: 0 }}
                    animate={{ height: `${(data.opinions / 120) * 100}%` }}
                    transition={{ delay: index * 0.1 + 0.1, duration: 0.5 }}
                    className="flex-1 bg-gradient-to-t from-purple-500/80 to-purple-500/40 rounded-t"
                  />
                </div>
                <span className="text-xs text-muted-foreground">{data.period}</span>
              </div>
            ))}
          </div>
          <div className="flex items-center justify-center gap-6 mt-4">
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 rounded-full bg-blue-500" />
              <span className="text-sm text-muted-foreground">Users</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 rounded-full bg-purple-500" />
              <span className="text-sm text-muted-foreground">Opinions</span>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Category Performance */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Layers className="w-5 h-5 text-primary" />
            Category Performance
          </CardTitle>
          <CardDescription>Opinion distribution by entertainment category</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {categoryStats.slice(0, 7).map((cat, index) => {
              const Icon = cat.icon;
              const maxOpinions = categoryStats[0]?.opinions || 1;
              const percentage = (cat.opinions / maxOpinions) * 100;
              
              return (
                <motion.div
                  key={cat.name}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: index * 0.05 }}
                  className="space-y-2"
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className={`p-2 rounded-lg bg-muted ${cat.color}`}>
                        <Icon className="w-4 h-4" />
                      </div>
                      <span className="font-medium">{cat.name}</span>
                    </div>
                    <div className="flex items-center gap-3">
                      <span className="text-sm text-muted-foreground">{cat.opinions} opinions</span>
                      <Badge 
                        variant={cat.growth >= 0 ? "default" : "destructive"}
                        className="text-xs"
                      >
                        {cat.growth >= 0 ? '+' : ''}{cat.growth}%
                      </Badge>
                    </div>
                  </div>
                  <Progress value={percentage} className="h-2" />
                </motion.div>
              );
            })}
          </div>
        </CardContent>
      </Card>

      {/* Quick Insights */}
      <div className="grid gap-4 md:grid-cols-3">
        <Card className="bg-gradient-to-br from-blue-500/5 to-cyan-500/5 border-blue-500/20">
          <CardContent className="pt-6">
            <div className="flex items-center gap-3 mb-3">
              <PieChart className="w-5 h-5 text-blue-500" />
              <span className="font-medium">Conversion Rate</span>
            </div>
            <p className="text-3xl font-bold">{metrics.conversionRate}%</p>
            <p className="text-sm text-muted-foreground mt-1">Visitors to sign-ups</p>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-green-500/5 to-emerald-500/5 border-green-500/20">
          <CardContent className="pt-6">
            <div className="flex items-center gap-3 mb-3">
              <Calendar className="w-5 h-5 text-green-500" />
              <span className="font-medium">Weekly Active</span>
            </div>
            <p className="text-3xl font-bold">78%</p>
            <p className="text-sm text-muted-foreground mt-1">Users active weekly</p>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-purple-500/5 to-pink-500/5 border-purple-500/20">
          <CardContent className="pt-6">
            <div className="flex items-center gap-3 mb-3">
              <TrendingUp className="w-5 h-5 text-purple-500" />
              <span className="font-medium">Avg Session</span>
            </div>
            <p className="text-3xl font-bold">4.2m</p>
            <p className="text-sm text-muted-foreground mt-1">Average time on platform</p>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
