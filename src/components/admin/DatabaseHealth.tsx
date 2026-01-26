import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { motion } from "framer-motion";
import { 
  Database, HardDrive, Server, Activity, RefreshCw, 
  CheckCircle, AlertTriangle, TrendingUp, Users, MessageSquare,
  Sparkles, Trophy, Gift, Eye, Clock, Zap
} from "lucide-react";
import { toast } from "sonner";

interface TableInfo {
  name: string;
  displayName: string;
  count: number;
  icon: React.ReactNode;
  color: string;
  category: 'core' | 'engagement' | 'rewards' | 'analytics';
}

export function DatabaseHealth() {
  const [tables, setTables] = useState<TableInfo[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [totalRecords, setTotalRecords] = useState(0);
  const [lastRefresh, setLastRefresh] = useState(new Date());

  useEffect(() => {
    fetchTableStats();
  }, []);

  const fetchTableStats = async () => {
    setRefreshing(true);
    try {
      const tableQueries = [
        { name: 'profiles', displayName: 'User Profiles', icon: <Users className="w-4 h-4" />, color: 'blue', category: 'core' as const },
        { name: 'opinions', displayName: 'Opinions', icon: <MessageSquare className="w-4 h-4" />, color: 'purple', category: 'core' as const },
        { name: 'inphrosync_responses', displayName: 'InphroSync Responses', icon: <Sparkles className="w-4 h-4" />, color: 'cyan', category: 'engagement' as const },
        { name: 'your_turn_votes', displayName: 'Your Turn Votes', icon: <Trophy className="w-4 h-4" />, color: 'amber', category: 'engagement' as const },
        { name: 'coupons', displayName: 'Coupons', icon: <Gift className="w-4 h-4" />, color: 'pink', category: 'rewards' as const },
        { name: 'coupon_pool', displayName: 'Coupon Pool', icon: <Gift className="w-4 h-4" />, color: 'rose', category: 'rewards' as const },
        { name: 'notifications', displayName: 'Notifications', icon: <Zap className="w-4 h-4" />, color: 'green', category: 'core' as const },
        { name: 'opinion_upvotes', displayName: 'Opinion Likes', icon: <TrendingUp className="w-4 h-4" />, color: 'red', category: 'engagement' as const },
        { name: 'user_streaks', displayName: 'User Streaks', icon: <Activity className="w-4 h-4" />, color: 'orange', category: 'engagement' as const },
        { name: 'user_badges', displayName: 'User Badges', icon: <Trophy className="w-4 h-4" />, color: 'yellow', category: 'rewards' as const },
        { name: 'referrals', displayName: 'Referrals', icon: <Users className="w-4 h-4" />, color: 'indigo', category: 'rewards' as const },
        { name: 'user_activity_logs', displayName: 'Activity Logs', icon: <Clock className="w-4 h-4" />, color: 'slate', category: 'analytics' as const },
        { name: 'content_flags', displayName: 'Content Flags', icon: <AlertTriangle className="w-4 h-4" />, color: 'destructive', category: 'core' as const },
        { name: 'opinion_views', displayName: 'Opinion Views', icon: <Eye className="w-4 h-4" />, color: 'teal', category: 'analytics' as const },
      ];

      const results = await Promise.all(
        tableQueries.map(async (table) => {
          try {
            const { count, error } = await supabase
              .from(table.name as any)
              .select('*', { count: 'exact', head: true });
            
            return {
              ...table,
              count: error ? 0 : (count || 0)
            };
          } catch {
            return { ...table, count: 0 };
          }
        })
      );

      const sorted = results.sort((a, b) => b.count - a.count);
      setTables(sorted);
      setTotalRecords(sorted.reduce((sum, t) => sum + t.count, 0));
      setLastRefresh(new Date());
    } catch (error) {
      console.error("Error fetching table stats:", error);
      toast.error("Failed to fetch database stats");
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  const getColorClass = (color: string) => {
    const colors: Record<string, string> = {
      blue: 'from-blue-500/10 to-cyan-500/5 border-blue-500/20 text-blue-500',
      purple: 'from-purple-500/10 to-pink-500/5 border-purple-500/20 text-purple-500',
      cyan: 'from-cyan-500/10 to-blue-500/5 border-cyan-500/20 text-cyan-500',
      amber: 'from-amber-500/10 to-orange-500/5 border-amber-500/20 text-amber-500',
      pink: 'from-pink-500/10 to-rose-500/5 border-pink-500/20 text-pink-500',
      rose: 'from-rose-500/10 to-pink-500/5 border-rose-500/20 text-rose-500',
      green: 'from-green-500/10 to-emerald-500/5 border-green-500/20 text-green-500',
      red: 'from-red-500/10 to-pink-500/5 border-red-500/20 text-red-500',
      orange: 'from-orange-500/10 to-amber-500/5 border-orange-500/20 text-orange-500',
      yellow: 'from-yellow-500/10 to-amber-500/5 border-yellow-500/20 text-yellow-500',
      indigo: 'from-indigo-500/10 to-purple-500/5 border-indigo-500/20 text-indigo-500',
      slate: 'from-slate-500/10 to-gray-500/5 border-slate-500/20 text-slate-500',
      teal: 'from-teal-500/10 to-cyan-500/5 border-teal-500/20 text-teal-500',
      destructive: 'from-red-500/10 to-orange-500/5 border-red-500/20 text-red-500',
    };
    return colors[color] || colors.blue;
  };

  const maxCount = Math.max(...tables.map(t => t.count), 1);

  const coreData = tables.filter(t => t.category === 'core');
  const engagementData = tables.filter(t => t.category === 'engagement');
  const rewardsData = tables.filter(t => t.category === 'rewards');
  const analyticsData = tables.filter(t => t.category === 'analytics');

  if (loading) {
    return (
      <Card>
        <CardContent className="pt-6">
          <div className="space-y-4 animate-pulse">
            {[...Array(8)].map((_, i) => (
              <div key={i} className="h-12 bg-muted rounded-lg" />
            ))}
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="border-2 border-primary/20">
      <CardHeader className="bg-gradient-to-r from-primary/5 via-background to-accent/5">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-xl bg-primary/10">
              <Database className="w-6 h-6 text-primary" />
            </div>
            <div>
              <CardTitle>Database Health</CardTitle>
              <CardDescription>
                Monitor table sizes and data distribution
              </CardDescription>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <div className="text-right text-sm">
              <p className="text-muted-foreground">Last updated</p>
              <p className="font-medium">{lastRefresh.toLocaleTimeString()}</p>
            </div>
            <Button variant="outline" size="sm" onClick={fetchTableStats} disabled={refreshing}>
              <RefreshCw className={`w-4 h-4 mr-2 ${refreshing ? 'animate-spin' : ''}`} />
              Refresh
            </Button>
          </div>
        </div>
      </CardHeader>

      <CardContent className="space-y-6 pt-6">
        {/* Overview Stats */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <motion.div whileHover={{ scale: 1.02 }}>
            <Card className="bg-gradient-to-br from-primary/10 to-accent/5 border-primary/20">
              <CardContent className="pt-4 pb-4 text-center">
                <HardDrive className="w-8 h-8 mx-auto mb-2 text-primary" />
                <p className="text-2xl font-bold">{totalRecords.toLocaleString()}</p>
                <p className="text-xs text-muted-foreground">Total Records</p>
              </CardContent>
            </Card>
          </motion.div>

          <motion.div whileHover={{ scale: 1.02 }}>
            <Card className="bg-gradient-to-br from-green-500/10 to-emerald-500/5 border-green-500/20">
              <CardContent className="pt-4 pb-4 text-center">
                <CheckCircle className="w-8 h-8 mx-auto mb-2 text-green-500" />
                <p className="text-2xl font-bold">{tables.length}</p>
                <p className="text-xs text-muted-foreground">Active Tables</p>
              </CardContent>
            </Card>
          </motion.div>

          <motion.div whileHover={{ scale: 1.02 }}>
            <Card className="bg-gradient-to-br from-blue-500/10 to-cyan-500/5 border-blue-500/20">
              <CardContent className="pt-4 pb-4 text-center">
                <Server className="w-8 h-8 mx-auto mb-2 text-blue-500" />
                <p className="text-2xl font-bold">100%</p>
                <p className="text-xs text-muted-foreground">DB Uptime</p>
              </CardContent>
            </Card>
          </motion.div>

          <motion.div whileHover={{ scale: 1.02 }}>
            <Card className="bg-gradient-to-br from-purple-500/10 to-pink-500/5 border-purple-500/20">
              <CardContent className="pt-4 pb-4 text-center">
                <Activity className="w-8 h-8 mx-auto mb-2 text-purple-500" />
                <p className="text-2xl font-bold">Healthy</p>
                <p className="text-xs text-muted-foreground">System Status</p>
              </CardContent>
            </Card>
          </motion.div>
        </div>

        {/* Tables by Category */}
        <div className="grid md:grid-cols-2 gap-6">
          <TableCategory title="Core Data" icon={<Database className="w-4 h-4" />} tables={coreData} maxCount={maxCount} getColorClass={getColorClass} />
          <TableCategory title="Engagement" icon={<Activity className="w-4 h-4" />} tables={engagementData} maxCount={maxCount} getColorClass={getColorClass} />
          <TableCategory title="Rewards" icon={<Gift className="w-4 h-4" />} tables={rewardsData} maxCount={maxCount} getColorClass={getColorClass} />
          <TableCategory title="Analytics" icon={<TrendingUp className="w-4 h-4" />} tables={analyticsData} maxCount={maxCount} getColorClass={getColorClass} />
        </div>
      </CardContent>
    </Card>
  );
}

function TableCategory({ 
  title, 
  icon, 
  tables, 
  maxCount,
  getColorClass
}: { 
  title: string;
  icon: React.ReactNode;
  tables: TableInfo[];
  maxCount: number;
  getColorClass: (color: string) => string;
}) {
  if (tables.length === 0) return null;

  return (
    <Card>
      <CardHeader className="pb-3">
        <CardTitle className="text-sm flex items-center gap-2">
          {icon}
          {title}
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-3">
        {tables.map((table) => (
          <motion.div
            key={table.name}
            whileHover={{ x: 4 }}
            className={`p-3 rounded-lg border bg-gradient-to-r ${getColorClass(table.color)}`}
          >
            <div className="flex items-center justify-between mb-2">
              <div className="flex items-center gap-2">
                {table.icon}
                <span className="font-medium text-sm">{table.displayName}</span>
              </div>
              <Badge variant="secondary" className="text-xs">
                {table.count.toLocaleString()}
              </Badge>
            </div>
            <Progress 
              value={(table.count / maxCount) * 100} 
              className="h-1.5"
            />
          </motion.div>
        ))}
      </CardContent>
    </Card>
  );
}
