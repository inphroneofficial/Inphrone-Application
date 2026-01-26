import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { 
  Flame, TrendingUp, BarChart3, Users, Target, 
  Zap, ArrowUp, ArrowDown, Clock, Sparkles
} from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { 
  AreaChart, Area, XAxis, YAxis, Tooltip, ResponsiveContainer,
  PieChart, Pie, Cell
} from "recharts";
import { format, subDays } from "date-fns";

interface CategoryStats {
  name: string;
  color: string;
  signalCount: number;
  totalHype: number;
  avgScore: number;
}

interface DailyActivity {
  date: string;
  signals: number;
  votes: number;
}

export function HypeAnalyticsDashboard() {
  const [categoryStats, setCategoryStats] = useState<CategoryStats[]>([]);
  const [dailyActivity, setDailyActivity] = useState<DailyActivity[]>([]);
  const [topSignals, setTopSignals] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState({
    totalSignals: 0,
    totalVotes: 0,
    avgScore: 0,
    activeUsers: 0,
    weeklyGrowth: 0,
  });

  useEffect(() => {
    fetchAnalytics();
  }, []);

  const fetchAnalytics = async () => {
    setLoading(true);
    try {
      // Fetch category statistics
      const { data: signals } = await supabase
        .from("hype_signals")
        .select(`
          *,
          categories:category_id (name, color)
        `)
        .eq("is_archived", false);

      if (signals) {
        // Aggregate by category
        const catStats: Record<string, CategoryStats> = {};
        signals.forEach((s: any) => {
          const catId = s.category_id;
          if (!catStats[catId]) {
            catStats[catId] = {
              name: s.categories?.name || "Unknown",
              color: s.categories?.color || "#666",
              signalCount: 0,
              totalHype: 0,
              avgScore: 0,
            };
          }
          catStats[catId].signalCount++;
          catStats[catId].totalHype += s.hype_count || 0;
        });

        // Calculate averages
        Object.values(catStats).forEach(cat => {
          cat.avgScore = cat.signalCount > 0 ? Math.round(cat.totalHype / cat.signalCount) : 0;
        });

        setCategoryStats(Object.values(catStats).sort((a, b) => b.totalHype - a.totalHype));
      }

      // Fetch top signals
      const { data: topSignalsData } = await supabase
        .from("hype_signals")
        .select(`
          *,
          categories:category_id (name, color)
        `)
        .eq("is_archived", false)
        .gt("expires_at", new Date().toISOString())
        .order("signal_score", { ascending: false })
        .limit(5);

      if (topSignalsData) {
        setTopSignals(topSignalsData.map((s: any) => ({
          ...s,
          category_name: s.categories?.name,
          category_color: s.categories?.color,
        })));
      }

      // Fetch daily activity for the last 7 days
      const dailyData: DailyActivity[] = [];
      for (let i = 6; i >= 0; i--) {
        const date = subDays(new Date(), i);
        const startOfDay = new Date(date);
        startOfDay.setHours(0, 0, 0, 0);
        const endOfDay = new Date(date);
        endOfDay.setHours(23, 59, 59, 999);

        const { count: signalCount } = await supabase
          .from("hype_signals")
          .select("*", { count: "exact", head: true })
          .gte("created_at", startOfDay.toISOString())
          .lte("created_at", endOfDay.toISOString());

        const { count: voteCount } = await supabase
          .from("hype_votes")
          .select("*", { count: "exact", head: true })
          .gte("created_at", startOfDay.toISOString())
          .lte("created_at", endOfDay.toISOString());

        dailyData.push({
          date: format(date, "EEE"),
          signals: signalCount || 0,
          votes: voteCount || 0,
        });
      }
      setDailyActivity(dailyData);

      // Calculate overall stats
      const { count: totalSignals } = await supabase
        .from("hype_signals")
        .select("*", { count: "exact", head: true });

      const { count: totalVotes } = await supabase
        .from("hype_votes")
        .select("*", { count: "exact", head: true });

      const { data: uniqueUsers } = await supabase
        .from("hype_signals")
        .select("created_by")
        .eq("is_archived", false);

      const activeUsers = new Set(uniqueUsers?.map(u => u.created_by)).size;

      // Weekly growth calculation
      const weekAgo = subDays(new Date(), 7);
      const { count: lastWeekSignals } = await supabase
        .from("hype_signals")
        .select("*", { count: "exact", head: true })
        .lt("created_at", weekAgo.toISOString());

      const weeklyGrowth = lastWeekSignals && lastWeekSignals > 0
        ? Math.round(((totalSignals || 0) - lastWeekSignals) / lastWeekSignals * 100)
        : 100;

      setStats({
        totalSignals: totalSignals || 0,
        totalVotes: totalVotes || 0,
        avgScore: signals?.length ? Math.round(signals.reduce((sum, s) => sum + (s.signal_score || 0), 0) / signals.length) : 0,
        activeUsers,
        weeklyGrowth,
      });

    } catch (error) {
      console.error("Error fetching analytics:", error);
    } finally {
      setLoading(false);
    }
  };

  const COLORS = ['#f97316', '#ef4444', '#8b5cf6', '#3b82f6', '#10b981', '#f59e0b'];

  if (loading) {
    return (
      <div className="space-y-4">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {[1, 2, 3, 4].map(i => (
            <Card key={i} className="animate-pulse">
              <CardContent className="p-4 h-24 bg-muted/50" />
            </Card>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Key Metrics */}
      <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
          <Card className="bg-gradient-to-br from-orange-500/10 to-red-500/10 border-orange-500/20">
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-xs text-muted-foreground">Total Signals</p>
                  <p className="text-2xl font-bold">{stats.totalSignals}</p>
                </div>
                <Flame className="w-8 h-8 text-orange-500 opacity-50" />
              </div>
            </CardContent>
          </Card>
        </motion.div>

        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}>
          <Card className="bg-gradient-to-br from-blue-500/10 to-indigo-500/10 border-blue-500/20">
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-xs text-muted-foreground">Total Votes</p>
                  <p className="text-2xl font-bold">{stats.totalVotes}</p>
                </div>
                <Users className="w-8 h-8 text-blue-500 opacity-50" />
              </div>
            </CardContent>
          </Card>
        </motion.div>

        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }}>
          <Card className="bg-gradient-to-br from-purple-500/10 to-pink-500/10 border-purple-500/20">
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-xs text-muted-foreground">Avg Score</p>
                  <p className="text-2xl font-bold">{stats.avgScore}</p>
                </div>
                <Target className="w-8 h-8 text-purple-500 opacity-50" />
              </div>
            </CardContent>
          </Card>
        </motion.div>

        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }}>
          <Card className="bg-gradient-to-br from-green-500/10 to-emerald-500/10 border-green-500/20">
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-xs text-muted-foreground">Active Users</p>
                  <p className="text-2xl font-bold">{stats.activeUsers}</p>
                </div>
                <Zap className="w-8 h-8 text-green-500 opacity-50" />
              </div>
            </CardContent>
          </Card>
        </motion.div>

        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.4 }}>
          <Card className="bg-gradient-to-br from-amber-500/10 to-yellow-500/10 border-amber-500/20">
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-xs text-muted-foreground">Weekly Growth</p>
                  <p className="text-2xl font-bold flex items-center gap-1">
                    {stats.weeklyGrowth > 0 ? (
                      <ArrowUp className="w-4 h-4 text-green-500" />
                    ) : (
                      <ArrowDown className="w-4 h-4 text-red-500" />
                    )}
                    {Math.abs(stats.weeklyGrowth)}%
                  </p>
                </div>
                <TrendingUp className="w-8 h-8 text-amber-500 opacity-50" />
              </div>
            </CardContent>
          </Card>
        </motion.div>
      </div>

      <div className="grid md:grid-cols-2 gap-6">
        {/* Activity Chart */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-lg">
              <BarChart3 className="w-5 h-5 text-primary" />
              7-Day Activity
            </CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={200}>
              <AreaChart data={dailyActivity}>
                <defs>
                  <linearGradient id="signalGradient" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#f97316" stopOpacity={0.3} />
                    <stop offset="95%" stopColor="#f97316" stopOpacity={0} />
                  </linearGradient>
                  <linearGradient id="voteGradient" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.3} />
                    <stop offset="95%" stopColor="#3b82f6" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <XAxis dataKey="date" axisLine={false} tickLine={false} className="text-xs" />
                <YAxis axisLine={false} tickLine={false} className="text-xs" />
                <Tooltip 
                  contentStyle={{ 
                    backgroundColor: 'hsl(var(--card))', 
                    border: '1px solid hsl(var(--border))',
                    borderRadius: '8px'
                  }}
                />
                <Area type="monotone" dataKey="signals" stroke="#f97316" fill="url(#signalGradient)" strokeWidth={2} name="Signals" />
                <Area type="monotone" dataKey="votes" stroke="#3b82f6" fill="url(#voteGradient)" strokeWidth={2} name="Votes" />
              </AreaChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        {/* Category Distribution */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-lg">
              <Sparkles className="w-5 h-5 text-primary" />
              Category Distribution
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {categoryStats.slice(0, 5).map((cat, index) => (
                <div key={cat.name} className="space-y-1">
                  <div className="flex items-center justify-between text-sm">
                    <div className="flex items-center gap-2">
                      <div 
                        className="w-3 h-3 rounded-full"
                        style={{ backgroundColor: cat.color }}
                      />
                      <span className="font-medium">{cat.name}</span>
                    </div>
                    <span className="text-muted-foreground">{cat.signalCount} signals</span>
                  </div>
                  <Progress 
                    value={(cat.signalCount / stats.totalSignals) * 100} 
                    className="h-2"
                    style={{ 
                      '--progress-color': cat.color 
                    } as React.CSSProperties}
                  />
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Top Signals */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-lg">
            <Flame className="w-5 h-5 text-orange-500" />
            Top Performing Signals
          </CardTitle>
          <CardDescription>Signals with the highest engagement this week</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {topSignals.map((signal, index) => (
              <motion.div
                key={signal.id}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: index * 0.1 }}
                className="flex items-center gap-4 p-3 rounded-lg bg-muted/50"
              >
                <div className="flex items-center justify-center w-8 h-8 rounded-full bg-gradient-to-br from-orange-500 to-red-500 text-white font-bold text-sm">
                  #{index + 1}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <Badge 
                      variant="outline" 
                      style={{ 
                        borderColor: signal.category_color,
                        color: signal.category_color 
                      }}
                      className="text-xs"
                    >
                      {signal.category_name}
                    </Badge>
                    <span className="font-semibold truncate">{signal.phrase}</span>
                  </div>
                </div>
                <div className="flex items-center gap-4 text-sm">
                  <span className="text-orange-500">🔥 {signal.hype_count}</span>
                  <span className="text-muted-foreground">➡️ {signal.pass_count}</span>
                  <Badge variant="secondary">
                    Score: {signal.signal_score}
                  </Badge>
                </div>
              </motion.div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
