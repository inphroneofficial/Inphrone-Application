import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { motion, AnimatePresence } from "framer-motion";
import { Flame, Trophy, Zap, Star, TrendingUp, Target, Award } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { triggerHaptic } from "./InphroSyncPremium";
import { useIsMobile } from "@/hooks/use-mobile";

interface StreakData {
  current_streak_weeks: number;
  longest_streak_weeks: number;
  streak_tier: string;
  total_weekly_contributions: number;
}

const TIER_CONFIG = {
  none: { 
    color: "text-muted-foreground", 
    bg: "from-muted/30 to-muted/10",
    glow: "shadow-none",
    icon: "🔥",
    label: "Starter",
    particleColor: "bg-muted-foreground"
  },
  silver: { 
    color: "text-muted-foreground", 
    bg: "from-muted/20 to-muted/10",
    glow: "shadow-lg shadow-muted/20",
    icon: "🥈",
    label: "Silver",
    particleColor: "bg-muted-foreground"
  },
  gold: { 
    color: "text-primary", 
    bg: "from-primary/20 to-accent/10",
    glow: "shadow-lg shadow-primary/30",
    icon: "🥇",
    label: "Gold",
    particleColor: "bg-primary"
  },
  diamond: { 
    color: "text-accent", 
    bg: "from-accent/20 to-primary/10",
    glow: "shadow-xl shadow-accent/40",
    icon: "💎",
    label: "Diamond",
    particleColor: "bg-accent"
  },
};

const MILESTONES = [
  { weeks: 4, tier: "silver", reward: "Silver Badge" },
  { weeks: 8, tier: "gold", reward: "Gold Badge" },
  { weeks: 12, tier: "diamond", reward: "Diamond Badge" },
];

export function InphroSyncStreakGamification() {
  const [streak, setStreak] = useState<StreakData | null>(null);
  const [loading, setLoading] = useState(true);
  const [todayAnswered, setTodayAnswered] = useState(0);
  const [totalQuestions, setTotalQuestions] = useState(3);
  const isMobile = useIsMobile();

  useEffect(() => {
    fetchStreakData();
    checkTodayProgress();
    
    const channel = supabase
      .channel('inphrosync-streak')
      .on('postgres_changes', {
        event: '*',
        schema: 'public',
        table: 'user_streaks',
      }, () => fetchStreakData())
      .on('postgres_changes', {
        event: '*',
        schema: 'public',
        table: 'inphrosync_responses',
      }, () => checkTodayProgress())
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, []);

  const fetchStreakData = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      const { data } = await supabase
        .from("user_streaks")
        .select("*")
        .eq("user_id", user.id)
        .maybeSingle();

      setStreak(data || {
        current_streak_weeks: 0,
        longest_streak_weeks: 0,
        streak_tier: 'none',
        total_weekly_contributions: 0
      });
    } catch (error) {
      console.error("Error fetching streak:", error);
    } finally {
      setLoading(false);
    }
  };

  const checkTodayProgress = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      const today = new Date().toISOString().split('T')[0];
      
      const { count: answeredCount } = await supabase
        .from("inphrosync_responses")
        .select("*", { count: 'exact', head: true })
        .eq("user_id", user.id)
        .eq("response_date", today);

      const { count: questionsCount } = await supabase
        .from("inphrosync_questions")
        .select("*", { count: 'exact', head: true })
        .eq("is_active", true);

      setTodayAnswered(answeredCount || 0);
      setTotalQuestions(questionsCount || 3);
    } catch (error) {
      console.error("Error checking today progress:", error);
    }
  };

  if (loading) {
    return (
      <div className="glass-card p-6 rounded-2xl animate-pulse">
        <div className="flex items-center gap-4">
          <div className="w-16 h-16 rounded-2xl bg-muted/50" />
          <div className="flex-1 space-y-2">
            <div className="h-4 w-24 bg-muted/50 rounded" />
            <div className="h-6 w-32 bg-muted/50 rounded" />
          </div>
        </div>
      </div>
    );
  }

  const displayStreak = streak || {
    current_streak_weeks: 0,
    longest_streak_weeks: 0,
    streak_tier: 'none',
    total_weekly_contributions: 0
  };

  const tierConfig = TIER_CONFIG[displayStreak.streak_tier as keyof typeof TIER_CONFIG] || TIER_CONFIG.none;
  const currentWeeks = displayStreak.current_streak_weeks;
  const nextMilestone = MILESTONES.find(m => m.weeks > currentWeeks) || MILESTONES[MILESTONES.length - 1];
  const progressToNext = Math.min((currentWeeks / nextMilestone.weeks) * 100, 100);
  const dailyProgress = (todayAnswered / totalQuestions) * 100;

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className={`relative overflow-hidden rounded-3xl border border-border/50 ${tierConfig.glow}`}
    >
      {/* Premium gradient background */}
      <div className={`absolute inset-0 bg-gradient-to-br ${tierConfig.bg}`} />
      <div className="absolute inset-0 bg-gradient-to-t from-background/80 via-transparent to-transparent" />
      
      {/* Animated particles for high tiers */}
      {!isMobile && displayStreak.streak_tier !== 'none' && (
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          {[...Array(8)].map((_, i) => (
            <motion.div
              key={i}
              className={`absolute w-1 h-1 rounded-full ${tierConfig.particleColor}`}
              style={{
                left: `${Math.random() * 100}%`,
                top: `${Math.random() * 100}%`,
              }}
              animate={{
                y: [0, -20, 0],
                opacity: [0.3, 0.8, 0.3],
                scale: [1, 1.5, 1],
              }}
              transition={{
                duration: 2 + Math.random() * 2,
                repeat: Infinity,
                delay: Math.random() * 2,
              }}
            />
          ))}
        </div>
      )}

      <div className="relative z-10 p-6 space-y-6">
        {/* Header with streak fire */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <motion.div
              className={`relative w-16 h-16 rounded-2xl bg-gradient-to-br ${tierConfig.bg} border border-border/30 flex items-center justify-center`}
              animate={!isMobile ? {
                scale: [1, 1.05, 1],
              } : undefined}
              transition={{ duration: 2, repeat: Infinity }}
            >
              <span className="text-3xl">{tierConfig.icon}</span>
              {currentWeeks > 0 && (
                <motion.div
                  className="absolute -top-2 -right-2 w-6 h-6 rounded-full bg-primary flex items-center justify-center text-[10px] font-bold text-primary-foreground"
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  transition={{ type: "spring", stiffness: 400 }}
                >
                  {currentWeeks}
                </motion.div>
              )}
            </motion.div>
            
            <div>
              <p className="text-sm text-muted-foreground font-medium">Current Streak</p>
              <div className="flex items-baseline gap-2">
                <span className={`text-3xl font-bold ${tierConfig.color}`}>
                  {currentWeeks}
                </span>
                <span className="text-sm text-muted-foreground">
                  week{currentWeeks !== 1 ? 's' : ''}
                </span>
              </div>
            </div>
          </div>

          <Badge className={`${tierConfig.color} bg-background/30 border-current`}>
            {tierConfig.label}
          </Badge>
        </div>

        {/* Today's Progress */}
        <div className="space-y-3">
          <div className="flex items-center justify-between text-sm">
            <div className="flex items-center gap-2">
              <Target className="w-4 h-4 text-primary" />
              <span className="font-medium">Today's Progress</span>
            </div>
            <span className="text-muted-foreground">
              {todayAnswered}/{totalQuestions} questions
            </span>
          </div>
          
          <div className="relative h-3 bg-muted/30 rounded-full overflow-hidden">
            <motion.div
              className="absolute inset-y-0 left-0 bg-gradient-to-r from-primary to-accent rounded-full"
              initial={{ width: 0 }}
              animate={{ width: `${dailyProgress}%` }}
              transition={{ duration: 0.8, ease: "easeOut" }}
            />
            {dailyProgress >= 100 && (
              <motion.div
                className="absolute inset-0 bg-gradient-to-r from-transparent via-white/30 to-transparent"
                animate={{ x: ["-100%", "200%"] }}
                transition={{ duration: 1.5, repeat: Infinity }}
              />
            )}
          </div>

          {dailyProgress >= 100 && (
            <motion.div
              className="flex items-center gap-2 text-sm text-green-500"
              initial={{ opacity: 0, y: 5 }}
              animate={{ opacity: 1, y: 0 }}
            >
              <Zap className="w-4 h-4" />
              <span className="font-medium">All questions answered today! 🎉</span>
            </motion.div>
          )}
        </div>

        {/* Next Milestone Progress */}
        {currentWeeks < 12 && (
          <div className="space-y-3">
            <div className="flex items-center justify-between text-sm">
              <div className="flex items-center gap-2">
                <Award className="w-4 h-4 text-accent" />
                <span className="font-medium">Next Milestone</span>
              </div>
              <span className="text-muted-foreground">
                {nextMilestone.weeks - currentWeeks} weeks to {nextMilestone.reward}
              </span>
            </div>
            
            <div className="relative h-2 bg-muted/30 rounded-full overflow-hidden">
              <motion.div
                className="absolute inset-y-0 left-0 bg-gradient-to-r from-accent/80 to-primary/80 rounded-full"
                initial={{ width: 0 }}
                animate={{ width: `${progressToNext}%` }}
                transition={{ duration: 1, delay: 0.3, ease: "easeOut" }}
              />
            </div>
          </div>
        )}

        {/* Milestone Badges */}
        <div className="flex items-center justify-center gap-4 pt-2">
          {MILESTONES.map((milestone, idx) => {
            const isAchieved = currentWeeks >= milestone.weeks;
            const milestoneTierConfig = TIER_CONFIG[milestone.tier as keyof typeof TIER_CONFIG];
            
            return (
              <motion.div
                key={milestone.tier}
                className={`relative flex flex-col items-center gap-1 ${isAchieved ? '' : 'opacity-40'}`}
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => isAchieved && triggerHaptic('light')}
              >
                <div className={`w-10 h-10 rounded-xl flex items-center justify-center transition-all ${
                  isAchieved 
                    ? `bg-gradient-to-br ${milestoneTierConfig.bg} border border-border/50 ${milestoneTierConfig.glow}` 
                    : 'bg-muted/30 border border-dashed border-border/30'
                }`}>
                  <span className="text-lg">{milestoneTierConfig.icon}</span>
                </div>
                <span className="text-[10px] text-muted-foreground">{milestone.weeks}w</span>
                
                {isAchieved && !isMobile && (
                  <motion.div
                    className="absolute -top-1 -right-1"
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    transition={{ type: "spring", delay: 0.2 + idx * 0.1 }}
                  >
                    <div className="w-3 h-3 rounded-full bg-primary flex items-center justify-center">
                      <span className="text-[8px] text-primary-foreground">✓</span>
                    </div>
                  </motion.div>
                )}
              </motion.div>
            );
          })}
        </div>

        {/* Stats Row */}
        <div className="grid grid-cols-2 gap-4 pt-4 border-t border-border/30">
          <div className="text-center">
            <div className="flex items-center justify-center gap-1.5 mb-1">
              <Trophy className="w-4 h-4 text-primary" />
              <span className="text-xl font-bold">{displayStreak.longest_streak_weeks}</span>
            </div>
            <p className="text-xs text-muted-foreground">Best Streak</p>
          </div>
          <div className="text-center">
            <div className="flex items-center justify-center gap-1.5 mb-1">
              <TrendingUp className="w-4 h-4 text-accent" />
              <span className="text-xl font-bold">{displayStreak.total_weekly_contributions}</span>
            </div>
            <p className="text-xs text-muted-foreground">Total Weeks</p>
          </div>
        </div>
      </div>
    </motion.div>
  );
}
