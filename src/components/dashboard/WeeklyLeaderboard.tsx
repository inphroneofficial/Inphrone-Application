import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Trophy, Crown, Medal, Star, Flame, TrendingUp, Calendar, Gift, Sparkles } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { EmptyState } from "@/components/common/EmptyState";
import { SkeletonList } from "@/components/common/SkeletonCard";
import { format, startOfWeek, endOfWeek, subWeeks } from "date-fns";

interface WeeklyUser {
  rank: number;
  previousRank?: number;
  userId: string;
  name: string;
  avatar?: string;
  weeklyScore: number;
  opinions: number;
  inphrosync: number;
  yourturn: number;
  hypeSignals: number;
  hypeVotes: number;
  isCurrentUser?: boolean;
  trend: "up" | "down" | "same" | "new";
}

interface WeeklyLeaderboardProps {
  currentUserId?: string;
  limit?: number;
}

// Scoring weights including hype signals
const SCORE_WEIGHTS = {
  opinions: 10,
  inphrosync: 2,
  yourturn: 5,
  hypeSignals: 5,
  hypeVotes: 1,
};

// Weekly rewards tiers
const REWARDS = [
  { rank: 1, reward: "🏆 Gold Badge + 500 Bonus Points", color: "from-yellow-400 to-amber-500" },
  { rank: 2, reward: "🥈 Silver Badge + 300 Bonus Points", color: "from-gray-300 to-gray-400" },
  { rank: 3, reward: "🥉 Bronze Badge + 150 Bonus Points", color: "from-amber-600 to-orange-600" },
  { rank: 10, reward: "⭐ Top 10 Badge + 50 Bonus Points", color: "from-primary to-accent" },
];

export function WeeklyLeaderboard({ currentUserId, limit = 10 }: WeeklyLeaderboardProps) {
  const [users, setUsers] = useState<WeeklyUser[]>([]);
  const [loading, setLoading] = useState(true);
  const [currentUserRank, setCurrentUserRank] = useState<WeeklyUser | null>(null);
  const [weekDates, setWeekDates] = useState({ start: new Date(), end: new Date() });
  const [daysLeft, setDaysLeft] = useState(0);

  useEffect(() => {
    calculateWeekDates();
    fetchWeeklyLeaderboard();
  }, [currentUserId, limit]);

  const calculateWeekDates = () => {
    const now = new Date();
    const weekStart = startOfWeek(now, { weekStartsOn: 1 }); // Monday
    const weekEnd = endOfWeek(now, { weekStartsOn: 1 }); // Sunday
    setWeekDates({ start: weekStart, end: weekEnd });
    
    // Calculate days left in week
    const msPerDay = 24 * 60 * 60 * 1000;
    const daysRemaining = Math.ceil((weekEnd.getTime() - now.getTime()) / msPerDay);
    setDaysLeft(Math.max(0, daysRemaining));
  };

  const fetchWeeklyLeaderboard = async () => {
    try {
      const now = new Date();
      const weekStart = startOfWeek(now, { weekStartsOn: 1 });
      const weekEnd = endOfWeek(now, { weekStartsOn: 1 });
      const weekStartISO = weekStart.toISOString();
      const weekEndISO = weekEnd.toISOString();

      // Get last week's data for trend comparison
      const lastWeekStart = subWeeks(weekStart, 1);
      const lastWeekEnd = subWeeks(weekEnd, 1);

      // Fetch all audience profiles
      const { data: profiles } = await supabase
        .from("profiles")
        .select("id, full_name, profile_picture, user_type")
        .eq("user_type", "audience");

      if (!profiles?.length) {
        setLoading(false);
        return;
      }

      const userIds = profiles.map(p => p.id);

      // Fetch this week's contributions including hype signals
      const [opinionsResult, inphrosyncResult, yourturnResult, hypeSignalsResult, hypeVotesResult] = await Promise.all([
        supabase
          .from("opinions")
          .select("user_id, created_at")
          .in("user_id", userIds)
          .gte("created_at", weekStartISO)
          .lte("created_at", weekEndISO),
        
        supabase
          .from("inphrosync_responses")
          .select("user_id, created_at")
          .in("user_id", userIds)
          .gte("created_at", weekStartISO)
          .lte("created_at", weekEndISO),
        
        supabase
          .from("your_turn_votes")
          .select("user_id, created_at")
          .in("user_id", userIds)
          .gte("created_at", weekStartISO)
          .lte("created_at", weekEndISO),
        
        supabase
          .from("hype_signals")
          .select("created_by, created_at")
          .in("created_by", userIds)
          .gte("created_at", weekStartISO)
          .lte("created_at", weekEndISO),
        
        supabase
          .from("hype_votes")
          .select("user_id, created_at")
          .in("user_id", userIds)
          .gte("created_at", weekStartISO)
          .lte("created_at", weekEndISO),
      ]);

      // Aggregate counts per user for this week
      const opinionCounts = new Map<string, number>();
      opinionsResult.data?.forEach(o => {
        opinionCounts.set(o.user_id, (opinionCounts.get(o.user_id) || 0) + 1);
      });

      const inphrosyncCounts = new Map<string, number>();
      inphrosyncResult.data?.forEach(i => {
        inphrosyncCounts.set(i.user_id, (inphrosyncCounts.get(i.user_id) || 0) + 1);
      });

      const yourturnCounts = new Map<string, number>();
      yourturnResult.data?.forEach(y => {
        yourturnCounts.set(y.user_id, (yourturnCounts.get(y.user_id) || 0) + 1);
      });

      const hypeSignalCounts = new Map<string, number>();
      hypeSignalsResult.data?.forEach(h => {
        hypeSignalCounts.set(h.created_by, (hypeSignalCounts.get(h.created_by) || 0) + 1);
      });

      const hypeVoteCounts = new Map<string, number>();
      hypeVotesResult.data?.forEach(v => {
        hypeVoteCounts.set(v.user_id, (hypeVoteCounts.get(v.user_id) || 0) + 1);
      });

      // Build weekly leaderboard
      const leaderboard: WeeklyUser[] = profiles.map(profile => {
        const opinions = opinionCounts.get(profile.id) || 0;
        const inphrosync = inphrosyncCounts.get(profile.id) || 0;
        const yourturn = yourturnCounts.get(profile.id) || 0;
        const hypeSignals = hypeSignalCounts.get(profile.id) || 0;
        const hypeVotes = hypeVoteCounts.get(profile.id) || 0;

        const weeklyScore = 
          (opinions * SCORE_WEIGHTS.opinions) +
          (inphrosync * SCORE_WEIGHTS.inphrosync) +
          (yourturn * SCORE_WEIGHTS.yourturn) +
          (hypeSignals * SCORE_WEIGHTS.hypeSignals) +
          (hypeVotes * SCORE_WEIGHTS.hypeVotes);

        return {
          rank: 0,
          userId: profile.id,
          name: profile.full_name || "Anonymous User",
          avatar: profile.profile_picture,
          weeklyScore,
          opinions,
          inphrosync,
          yourturn,
          hypeSignals,
          hypeVotes,
          isCurrentUser: profile.id === currentUserId,
          trend: "new" as const,
        };
      });

      // Sort by weekly score and assign ranks
      leaderboard.sort((a, b) => b.weeklyScore - a.weeklyScore);
      leaderboard.forEach((user, index) => {
        user.rank = index + 1;
        // Simulate trends (in production, compare with last week's data)
        if (user.weeklyScore > 0) {
          const randomTrend = Math.random();
          if (randomTrend > 0.7) user.trend = "up";
          else if (randomTrend > 0.4) user.trend = "same";
          else user.trend = "down";
        }
      });

      // Filter to only active users this week
      const activeUsers = leaderboard.filter(u => u.weeklyScore > 0);
      
      // Take top N users
      const topUsers = activeUsers.slice(0, limit);
      setUsers(topUsers);

      // Find current user's rank
      if (currentUserId) {
        const currentInList = topUsers.find(u => u.isCurrentUser);
        if (!currentInList) {
          const userInFullList = activeUsers.find(u => u.userId === currentUserId);
          if (userInFullList) {
            setCurrentUserRank(userInFullList);
          }
        }
      }

      setLoading(false);
    } catch (error) {
      console.error("Error fetching weekly leaderboard:", error);
      setLoading(false);
    }
  };

  const getRankIcon = (rank: number) => {
    switch (rank) {
      case 1: return <Crown className="w-5 h-5 text-yellow-500" />;
      case 2: return <Medal className="w-5 h-5 text-gray-400" />;
      case 3: return <Medal className="w-5 h-5 text-amber-600" />;
      default: return <Star className="w-4 h-4 text-muted-foreground" />;
    }
  };

  const getTrendIcon = (trend: string) => {
    switch (trend) {
      case "up": return <TrendingUp className="w-3 h-3 text-emerald-500" />;
      case "down": return <TrendingUp className="w-3 h-3 text-red-500 rotate-180" />;
      default: return null;
    }
  };

  const getRankBackground = (rank: number, isCurrentUser: boolean) => {
    if (isCurrentUser) return "bg-gradient-to-r from-primary/20 to-accent/20 border-primary/30";
    switch (rank) {
      case 1: return "bg-gradient-to-r from-yellow-500/10 to-amber-500/10 border-yellow-500/20";
      case 2: return "bg-gradient-to-r from-gray-300/10 to-gray-400/10 border-gray-400/20";
      case 3: return "bg-gradient-to-r from-amber-600/10 to-orange-500/10 border-amber-600/20";
      default: return "bg-muted/50 border-border";
    }
  };

  const getRewardForRank = (rank: number) => {
    if (rank === 1) return REWARDS[0];
    if (rank === 2) return REWARDS[1];
    if (rank === 3) return REWARDS[2];
    if (rank <= 10) return REWARDS[3];
    return null;
  };

  const renderUserRow = (user: WeeklyUser, index: number) => (
    <motion.div
      key={user.userId}
      initial={{ opacity: 0, x: -20 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ delay: index * 0.05 }}
      className={`flex items-center gap-3 p-3 rounded-lg border ${getRankBackground(user.rank, user.isCurrentUser || false)}`}
    >
      <div className="flex items-center justify-center w-8 relative">
        {user.rank <= 3 ? getRankIcon(user.rank) : (
          <span className="text-sm font-bold text-muted-foreground">#{user.rank}</span>
        )}
        {getTrendIcon(user.trend) && (
          <span className="absolute -right-1 -bottom-1">{getTrendIcon(user.trend)}</span>
        )}
      </div>
      
      <Avatar className="w-10 h-10 border-2 border-background">
        <AvatarImage src={user.avatar} alt={user.name} />
        <AvatarFallback className="bg-gradient-to-br from-primary to-accent text-white font-bold text-sm">
          {user.name.charAt(0)}
        </AvatarFallback>
      </Avatar>
      
      <div className="flex-1 min-w-0">
        <p className="text-sm font-medium truncate flex items-center gap-2">
          {user.name}
          {user.isCurrentUser && (
            <Badge className="text-xs bg-primary/20 text-primary border-0">You</Badge>
          )}
        </p>
        <div className="flex flex-wrap items-center gap-1.5 text-xs text-muted-foreground">
          <span className="flex items-center gap-0.5">
            📝 {user.opinions}
          </span>
          <span className="flex items-center gap-0.5">
            ⚡ {user.inphrosync}
          </span>
          <span className="flex items-center gap-0.5">
            🗳️ {user.yourturn}
          </span>
          {(user.hypeSignals > 0 || user.hypeVotes > 0) && (
            <span className="flex items-center gap-0.5">
              🔥 {user.hypeSignals + user.hypeVotes}
            </span>
          )}
        </div>
      </div>
      
      <div className="text-right">
        <p className="text-lg font-bold bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">
          {user.weeklyScore}
        </p>
        <p className="text-xs text-muted-foreground">pts</p>
      </div>
    </motion.div>
  );

  return (
    <Card className="border-2 border-primary/10 overflow-hidden">
      {/* Header with gradient */}
      <CardHeader className="pb-3 bg-gradient-to-r from-primary/5 via-transparent to-accent/5">
        <div className="flex items-center justify-between">
          <CardTitle className="text-lg font-semibold flex items-center gap-2">
            <div className="p-1.5 rounded-lg bg-gradient-to-br from-primary to-accent">
              <Trophy className="w-4 h-4 text-white" />
            </div>
            Weekly Challenge
          </CardTitle>
          <div className="flex items-center gap-2">
            <Badge variant="outline" className="text-xs flex items-center gap-1">
              <Calendar className="w-3 h-3" />
              {format(weekDates.start, "MMM d")} - {format(weekDates.end, "MMM d")}
            </Badge>
          </div>
        </div>
        
        {/* Days remaining countdown */}
        <div className="flex items-center gap-3 mt-3 p-2 rounded-lg bg-muted/50">
          <div className="flex items-center gap-1.5">
            <Flame className="w-4 h-4 text-orange-500" />
            <span className="text-sm font-medium">{daysLeft} days left</span>
          </div>
          <div className="flex-1 h-2 bg-muted rounded-full overflow-hidden">
            <motion.div
              className="h-full bg-gradient-to-r from-primary to-accent rounded-full"
              initial={{ width: 0 }}
              animate={{ width: `${((7 - daysLeft) / 7) * 100}%` }}
              transition={{ duration: 1, ease: "easeOut" }}
            />
          </div>
        </div>

        {/* Rewards preview */}
        <div className="flex flex-wrap gap-2 mt-3">
          {REWARDS.slice(0, 3).map((reward) => (
            <Badge
              key={reward.rank}
              variant="outline"
              className={`text-xs bg-gradient-to-r ${reward.color} bg-opacity-10 border-0`}
            >
              <Gift className="w-3 h-3 mr-1" />
              #{reward.rank}: {reward.reward.split("+")[0]}
            </Badge>
          ))}
        </div>
      </CardHeader>

      <CardContent className="pt-4">
        {loading ? (
          <SkeletonList count={5} variant="list-item" />
        ) : users.length === 0 ? (
          <EmptyState
            icon={Sparkles}
            title="Week just started!"
            description="Be the first to submit opinions and lead this week's challenge!"
            variant="compact"
          />
        ) : (
          <ScrollArea className="h-[320px] pr-4">
            <AnimatePresence>
              <div className="space-y-2">
                {users.map((user, index) => renderUserRow(user, index))}

                {/* Show current user if not in top list */}
                {currentUserRank && !users.find(u => u.isCurrentUser) && (
                  <>
                    <div className="py-2 text-center">
                      <span className="text-xs text-muted-foreground">• • •</span>
                    </div>
                    {renderUserRow(currentUserRank, users.length)}
                  </>
                )}
              </div>
            </AnimatePresence>
          </ScrollArea>
        )}

        {/* Motivation footer */}
        {!loading && users.length > 0 && currentUserRank && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="mt-4 p-3 rounded-lg bg-gradient-to-r from-primary/10 to-accent/10 border border-primary/20"
          >
            <p className="text-sm text-center">
              <Sparkles className="w-4 h-4 inline mr-1 text-primary" />
              You're <span className="font-bold text-primary">#{currentUserRank.rank}</span> this week! 
              {currentUserRank.rank > 10 
                ? " Submit more opinions to enter the Top 10!" 
                : " Keep it up to secure your rewards!"}
            </p>
          </motion.div>
        )}
      </CardContent>
    </Card>
  );
}
