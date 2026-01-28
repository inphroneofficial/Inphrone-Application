import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { Flame, TrendingUp, Users, Clock, Zap, BarChart3 } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { supabase } from "@/integrations/supabase/client";
import { cn } from "@/lib/utils";

interface HypeStats {
  totalSignals: number;
  activeSignals: number;
  totalVotes: number;
  totalHype: number;
  avgScore: number;
  topCategories: { name: string; count: number; color: string }[];
}

interface HypeStatsOverviewProps {
  className?: string;
  compact?: boolean;
}

export function HypeStatsOverview({ className, compact = false }: HypeStatsOverviewProps) {
  const [stats, setStats] = useState<HypeStats>({
    totalSignals: 0,
    activeSignals: 0,
    totalVotes: 0,
    totalHype: 0,
    avgScore: 0,
    topCategories: [],
  });
  const [loading, setLoading] = useState(true);

  const fetchStats = async () => {
    try {
      // Fetch active signals with category info
      const { data: signals } = await supabase
        .from("hype_signals")
        .select(`
          *,
          categories:category_id (name, color)
        `)
        .eq("is_archived", false)
        .gt("expires_at", new Date().toISOString());

      // Fetch total votes
      const { count: totalVotes } = await supabase
        .from("hype_votes")
        .select("*", { count: "exact", head: true });

      // Fetch all signals for total count
      const { count: totalSignals } = await supabase
        .from("hype_signals")
        .select("*", { count: "exact", head: true });

      if (signals) {
        // Calculate category distribution
        const categoryCount: Record<string, { count: number; color: string }> = {};
        let totalHype = 0;
        let totalScore = 0;

        signals.forEach((s: any) => {
          const catName = s.categories?.name || "Unknown";
          const catColor = s.categories?.color || "#666";
          if (!categoryCount[catName]) {
            categoryCount[catName] = { count: 0, color: catColor };
          }
          categoryCount[catName].count++;
          totalHype += s.hype_count || 0;
          totalScore += s.signal_score || 0;
        });

        const topCategories = Object.entries(categoryCount)
          .map(([name, data]) => ({ name, ...data }))
          .sort((a, b) => b.count - a.count)
          .slice(0, 5);

        setStats({
          totalSignals: totalSignals || 0,
          activeSignals: signals.length,
          totalVotes: totalVotes || 0,
          totalHype,
          avgScore: signals.length > 0 ? Math.round(totalScore / signals.length) : 0,
          topCategories,
        });
      }
    } catch (error) {
      console.error("Error fetching hype stats:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchStats();

    // Set up realtime subscription for live updates
    const channel = supabase
      .channel('hype-stats-realtime')
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'hype_signals' },
        () => {
          fetchStats();
        }
      )
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'hype_votes' },
        () => {
          fetchStats();
        }
      )
      .subscribe();

    // Also poll every 5 seconds as a fallback
    const interval = setInterval(fetchStats, 5000);

    return () => {
      supabase.removeChannel(channel);
      clearInterval(interval);
    };
  }, []);

  const statCards = [
    {
      icon: Flame,
      label: "Active Signals",
      value: stats.activeSignals,
      color: "text-orange-500",
      bgColor: "from-orange-500/10 to-red-500/10",
      borderColor: "border-orange-500/20",
    },
    {
      icon: TrendingUp,
      label: "Total Hype",
      value: stats.totalHype,
      color: "text-primary",
      bgColor: "from-primary/10 to-accent/10",
      borderColor: "border-primary/20",
    },
    {
      icon: Users,
      label: "Total Votes",
      value: stats.totalVotes,
      color: "text-blue-500",
      bgColor: "from-blue-500/10 to-cyan-500/10",
      borderColor: "border-blue-500/20",
    },
    {
      icon: Zap,
      label: "Avg Score",
      value: stats.avgScore,
      color: "text-yellow-500",
      bgColor: "from-yellow-500/10 to-orange-500/10",
      borderColor: "border-yellow-500/20",
    },
  ];

  if (loading) {
    return (
      <div className={cn("grid gap-4", compact ? "grid-cols-2" : "grid-cols-2 md:grid-cols-4", className)}>
        {[1, 2, 3, 4].map((i) => (
          <Card key={i} className="animate-pulse">
            <CardContent className="p-4">
              <div className="h-16 bg-muted rounded" />
            </CardContent>
          </Card>
        ))}
      </div>
    );
  }

  return (
    <div className={cn("space-y-4", className)}>
      {/* Stat Cards */}
      <div className={cn("grid gap-4", compact ? "grid-cols-2" : "grid-cols-2 md:grid-cols-4")}>
        {statCards.map((stat, index) => (
          <motion.div
            key={stat.label}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.1 }}
          >
            <Card className={cn(
              "border transition-all hover:shadow-lg",
              stat.borderColor,
              `bg-gradient-to-br ${stat.bgColor}`
            )}>
              <CardContent className="p-4">
                <div className="flex items-center gap-3">
                  <div className={cn("p-2 rounded-full bg-background/50", stat.color)}>
                    <stat.icon className="w-5 h-5" />
                  </div>
                  <div>
                    <motion.p
                      initial={{ scale: 0.5 }}
                      animate={{ scale: 1 }}
                      transition={{ delay: index * 0.1 + 0.2, type: "spring" }}
                      className="text-2xl font-bold text-foreground"
                    >
                      {stat.value.toLocaleString()}
                    </motion.p>
                    <p className="text-xs text-muted-foreground">{stat.label}</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        ))}
      </div>

      {/* Category Distribution */}
      {!compact && stats.topCategories.length > 0 && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
        >
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center gap-2 mb-4">
                <BarChart3 className="w-5 h-5 text-muted-foreground" />
                <h3 className="font-semibold">Category Distribution</h3>
              </div>
              <div className="space-y-3">
                {stats.topCategories.map((cat, index) => {
                  const percentage = stats.activeSignals > 0 
                    ? Math.round((cat.count / stats.activeSignals) * 100) 
                    : 0;
                  
                  return (
                    <motion.div
                      key={cat.name}
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: 0.5 + index * 0.1 }}
                      className="space-y-1"
                    >
                      <div className="flex items-center justify-between text-sm">
                        <div className="flex items-center gap-2">
                          <div
                            className="w-3 h-3 rounded-full"
                            style={{ backgroundColor: cat.color }}
                          />
                          <span>{cat.name}</span>
                        </div>
                        <span className="text-muted-foreground">
                          {cat.count} signals ({percentage}%)
                        </span>
                      </div>
                      <Progress 
                        value={percentage} 
                        className="h-2"
                        style={{ 
                          background: `${cat.color}20`,
                        }}
                      />
                    </motion.div>
                  );
                })}
              </div>
            </CardContent>
          </Card>
        </motion.div>
      )}
    </div>
  );
}
