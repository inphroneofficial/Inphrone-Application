import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Users, MessageSquare, Gift, TrendingUp, Activity, Sparkles, Trophy, Clock } from "lucide-react";
import { motion } from "framer-motion";

interface Stats {
  totalUsers: number;
  totalOpinions: number;
  totalCoupons: number;
  activeCoupons: number;
  opinionsThisWeek: number;
  newUsersThisWeek: number;
  totalUpvotes: number;
  inphrosyncResponses: number;
  yourTurnQuestions: number;
  userBreakdown: {
    audience: number;
    creator: number;
    studio: number;
    ott: number;
    tv: number;
    gaming: number;
    music: number;
    developer: number;
  };
}

export function SystemStats() {
  const [stats, setStats] = useState<Stats>({
    totalUsers: 0,
    totalOpinions: 0,
    totalCoupons: 0,
    activeCoupons: 0,
    opinionsThisWeek: 0,
    newUsersThisWeek: 0,
    totalUpvotes: 0,
    inphrosyncResponses: 0,
    yourTurnQuestions: 0,
    userBreakdown: {
      audience: 0,
      creator: 0,
      studio: 0,
      ott: 0,
      tv: 0,
      gaming: 0,
      music: 0,
      developer: 0
    }
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchStats();
  }, []);

  const fetchStats = async () => {
    try {
      const weekAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString();

      const [
        users, 
        opinions, 
        coupons, 
        activeCoupons, 
        opinionsWeek, 
        newUsers, 
        upvotes, 
        inphrosync, 
        yourTurn,
        userCounts
      ] = await Promise.all([
        supabase.from("profiles").select("id", { count: "exact", head: true }),
        supabase.from("opinions").select("id", { count: "exact", head: true }),
        supabase.from("coupons").select("id", { count: "exact", head: true }),
        supabase.from("coupons").select("id", { count: "exact", head: true }).eq("status", "active"),
        supabase.from("opinions").select("id", { count: "exact", head: true }).gte("created_at", weekAgo),
        supabase.from("profiles").select("id", { count: "exact", head: true }).gte("created_at", weekAgo),
        supabase.from("opinion_upvotes").select("id", { count: "exact", head: true }),
        supabase.from("inphrosync_responses").select("id", { count: "exact", head: true }),
        supabase.from("your_turn_questions").select("id", { count: "exact", head: true }),
        supabase.rpc('get_user_counts')
      ]);

      const counts = (userCounts.data?.[0] || {}) as Record<string, number>;

      setStats({
        totalUsers: users.count || 0,
        totalOpinions: opinions.count || 0,
        totalCoupons: coupons.count || 0,
        activeCoupons: activeCoupons.count || 0,
        opinionsThisWeek: opinionsWeek.count || 0,
        newUsersThisWeek: newUsers.count || 0,
        totalUpvotes: upvotes.count || 0,
        inphrosyncResponses: inphrosync.count || 0,
        yourTurnQuestions: yourTurn.count || 0,
        userBreakdown: {
          audience: counts.audience || 0,
          creator: counts.creator || 0,
          studio: counts.studio || 0,
          ott: counts.ott || 0,
          tv: counts.tv || 0,
          gaming: counts.gaming || 0,
          music: counts.music || 0,
          developer: counts.developer || 0
        }
      });
    } catch (error) {
      console.error("Error fetching stats:", error);
    } finally {
      setLoading(false);
    }
  };

  const statCards = [
    {
      title: "Total Users",
      value: stats.totalUsers,
      icon: Users,
      description: `+${stats.newUsersThisWeek} this week`,
      color: "text-blue-500",
      gradient: "from-blue-500/10 to-cyan-500/10"
    },
    {
      title: "Total Opinions",
      value: stats.totalOpinions,
      icon: MessageSquare,
      description: `+${stats.opinionsThisWeek} this week`,
      color: "text-purple-500",
      gradient: "from-purple-500/10 to-pink-500/10"
    },
    {
      title: "Total Upvotes",
      value: stats.totalUpvotes,
      icon: TrendingUp,
      description: "Community engagement",
      color: "text-green-500",
      gradient: "from-green-500/10 to-emerald-500/10"
    },
    {
      title: "Active Coupons",
      value: stats.activeCoupons,
      icon: Gift,
      description: `${stats.totalCoupons} total coupons`,
      color: "text-amber-500",
      gradient: "from-amber-500/10 to-orange-500/10"
    },
    {
      title: "InphroSync Responses",
      value: stats.inphrosyncResponses,
      icon: Sparkles,
      description: "Daily engagement",
      color: "text-cyan-500",
      gradient: "from-cyan-500/10 to-blue-500/10"
    },
    {
      title: "Your Turn Questions",
      value: stats.yourTurnQuestions,
      icon: Trophy,
      description: "Community questions",
      color: "text-yellow-500",
      gradient: "from-yellow-500/10 to-amber-500/10"
    }
  ];

  const userTypes = [
    { label: "Audience", value: stats.userBreakdown.audience, emoji: "👥", color: "from-blue-500/20 to-indigo-500/20" },
    { label: "Creator", value: stats.userBreakdown.creator, emoji: "🎨", color: "from-purple-500/20 to-pink-500/20" },
    { label: "Studio", value: stats.userBreakdown.studio, emoji: "🎬", color: "from-green-500/20 to-emerald-500/20" },
    { label: "OTT", value: stats.userBreakdown.ott, emoji: "📺", color: "from-red-500/20 to-orange-500/20" },
    { label: "TV", value: stats.userBreakdown.tv, emoji: "📡", color: "from-cyan-500/20 to-blue-500/20" },
    { label: "Gaming", value: stats.userBreakdown.gaming, emoji: "🎮", color: "from-violet-500/20 to-fuchsia-500/20" },
    { label: "Music", value: stats.userBreakdown.music, emoji: "🎵", color: "from-pink-500/20 to-rose-500/20" },
    { label: "Developer", value: stats.userBreakdown.developer, emoji: "💻", color: "from-indigo-500/20 to-blue-500/20" }
  ];

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {[1, 2, 3, 4, 5, 6].map((i) => (
            <Card key={i}>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Loading...</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="h-8 bg-muted animate-pulse rounded" />
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      {/* Main Stats */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {statCards.map((stat, index) => {
          const Icon = stat.icon;
          return (
            <motion.div
              key={stat.title}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1 }}
            >
              <Card className={`bg-gradient-to-br ${stat.gradient} border-2 hover:scale-105 transition-transform`}>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">{stat.title}</CardTitle>
                  <Icon className={`w-5 h-5 ${stat.color}`} />
                </CardHeader>
                <CardContent>
                  <div className="text-3xl font-bold">{stat.value.toLocaleString()}</div>
                  <p className="text-xs text-muted-foreground mt-1">{stat.description}</p>
                </CardContent>
              </Card>
            </motion.div>
          );
        })}
      </div>

      {/* User Breakdown */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Users className="w-5 h-5 text-primary" />
            User Breakdown by Type
          </CardTitle>
          <CardDescription>Distribution of users across all 8 user types</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {userTypes.map((type, index) => (
              <motion.div
                key={type.label}
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: index * 0.05 }}
                className={`flex flex-col items-center p-4 rounded-xl bg-gradient-to-br ${type.color} border border-border/50 hover:scale-105 transition-transform`}
              >
                <span className="text-3xl mb-2">{type.emoji}</span>
                <span className="text-2xl font-bold text-primary">{type.value}</span>
                <span className="text-sm text-muted-foreground text-center">{type.label}</span>
              </motion.div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Weekly Activity Summary */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Activity className="w-5 h-5 text-primary" />
            Weekly Activity Summary
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="text-center p-4 rounded-lg bg-muted/50">
              <p className="text-3xl font-bold text-primary">{stats.newUsersThisWeek}</p>
              <p className="text-sm text-muted-foreground">New Users</p>
            </div>
            <div className="text-center p-4 rounded-lg bg-muted/50">
              <p className="text-3xl font-bold text-green-500">{stats.opinionsThisWeek}</p>
              <p className="text-sm text-muted-foreground">New Opinions</p>
            </div>
            <div className="text-center p-4 rounded-lg bg-muted/50">
              <p className="text-3xl font-bold text-purple-500">{stats.totalUpvotes}</p>
              <p className="text-sm text-muted-foreground">Total Upvotes</p>
            </div>
            <div className="text-center p-4 rounded-lg bg-muted/50">
              <p className="text-3xl font-bold text-cyan-500">{stats.inphrosyncResponses}</p>
              <p className="text-sm text-muted-foreground">Sync Responses</p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}