import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Flame, Trophy, Loader2 } from "lucide-react";
import { motion } from "framer-motion";
import { Skeleton } from "@/components/ui/skeleton";

interface StreakData {
  current_streak_weeks: number;
  longest_streak_weeks: number;
  streak_tier: string;
  total_weekly_contributions: number;
}

const TIER_COLORS: Record<string, string> = {
  none: "text-muted-foreground",
  silver: "text-slate-400",
  gold: "text-yellow-500",
  diamond: "text-cyan-400",
};

const TIER_GRADIENTS: Record<string, string> = {
  none: "from-muted/50 to-muted/30",
  silver: "from-slate-300/30 to-slate-400/30",
  gold: "from-yellow-400/30 to-yellow-600/30",
  diamond: "from-cyan-400/30 to-blue-600/30",
};

export function StreakTracker() {
  const [streak, setStreak] = useState<StreakData | null>(null);
  const [loading, setLoading] = useState(true);
  const [userType, setUserType] = useState<string | null>(null);

  useEffect(() => {
    fetchStreak();
    
    // Set up realtime subscription
    const channel = supabase
      .channel('streak-changes')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'user_streaks',
        },
        (payload) => {
          if (payload.new && typeof payload.new === 'object') {
            const newData = payload.new as Record<string, any>;
            supabase.auth.getUser().then(({ data: { user } }) => {
              if (user && 'user_id' in newData && newData.user_id === user.id) {
                setStreak(newData as StreakData);
              }
            });
          }
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, []);

  const fetchStreak = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      // Check user type first
      const { data: profile } = await supabase
        .from("profiles")
        .select("user_type")
        .eq("id", user.id)
        .single();

      setUserType(profile?.user_type || null);

      // Only fetch streak for audience users
      if (profile?.user_type !== 'audience') {
        setLoading(false);
        return;
      }

      const { data, error } = await supabase
        .from("user_streaks")
        .select("*")
        .eq("user_id", user.id)
        .maybeSingle();

      if (error && error.code !== 'PGRST116') {
        console.error("Error fetching streak:", error);
      }
      
      // Set streak data or default values if no data exists
      if (data) {
        setStreak(data);
      } else {
        // Initialize with default values for audience users without streak data
        setStreak({
          current_streak_weeks: 0,
          longest_streak_weeks: 0,
          streak_tier: 'none',
          total_weekly_contributions: 0
        });
      }
    } catch (error) {
      console.error("Streak fetch error:", error);
    } finally {
      setLoading(false);
    }
  };

  // Don't show for non-audience users
  if (userType !== 'audience' && !loading) return null;
  
  // Show loading skeleton
  if (loading) {
    return (
      <Card className="shadow-elegant">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Flame className="w-5 h-5 text-muted-foreground" />
            Wisdom Streak
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="p-6 rounded-lg bg-muted/30 border border-border">
            <div className="text-center space-y-4">
              <Skeleton className="w-16 h-16 rounded-full mx-auto" />
              <Skeleton className="h-8 w-24 mx-auto" />
              <Skeleton className="h-4 w-32 mx-auto" />
              <div className="grid grid-cols-2 gap-4 pt-4 border-t border-border/50">
                <Skeleton className="h-16 rounded-lg" />
                <Skeleton className="h-16 rounded-lg" />
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    );
  }
  
  // Show with default values if no streak data
  const displayStreak = streak || {
    current_streak_weeks: 0,
    longest_streak_weeks: 0,
    streak_tier: 'none',
    total_weekly_contributions: 0
  };

  const tierColor = TIER_COLORS[displayStreak.streak_tier] || TIER_COLORS.none;
  const tierGradient = TIER_GRADIENTS[displayStreak.streak_tier] || TIER_GRADIENTS.none;

  return (
    <Card className="shadow-elegant">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Flame className={`w-5 h-5 ${tierColor}`} />
          Wisdom Streak
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className={`p-6 rounded-lg bg-gradient-to-br ${tierGradient} border border-border`}>
          <div className="text-center space-y-4">
            <motion.div
              animate={{
                scale: [1, 1.1, 1],
              }}
              transition={{
                duration: 2,
                repeat: Infinity,
                ease: "easeInOut",
              }}
              className="relative inline-block"
            >
              <Flame className={`w-16 h-16 ${tierColor} mx-auto`} />
              {displayStreak.current_streak_weeks > 0 && (
                <Badge className="absolute -top-2 -right-2 bg-primary text-white">
                  {displayStreak.current_streak_weeks}
                </Badge>
              )}
            </motion.div>

            <div>
              <p className="text-3xl font-bold mb-1">
                {displayStreak.current_streak_weeks} Week{displayStreak.current_streak_weeks !== 1 ? 's' : ''}
              </p>
              <p className="text-sm text-muted-foreground">Current Streak</p>
            </div>

            {displayStreak.streak_tier !== 'none' && (
              <Badge className={`${tierColor} bg-background/50 border-2`}>
                {displayStreak.streak_tier.toUpperCase()} TIER
              </Badge>
            )}

            <div className="grid grid-cols-2 gap-4 pt-4 border-t border-border/50">
              <div className="text-center">
                <div className="flex items-center justify-center gap-1 mb-1">
                  <Trophy className="w-4 h-4 text-muted-foreground" />
                  <span className="text-xl font-bold">{displayStreak.longest_streak_weeks}</span>
                </div>
                <p className="text-xs text-muted-foreground">Best Streak</p>
              </div>
              <div className="text-center">
                <p className="text-xl font-bold mb-1">{displayStreak.total_weekly_contributions}</p>
                <p className="text-xs text-muted-foreground">Total Weeks</p>
              </div>
            </div>
          </div>
        </div>

        <div className="mt-4 space-y-2">
          <p className="text-xs text-muted-foreground text-center">
            Streak Progression
          </p>
          <div className="flex gap-2 justify-center">
            <div className={`w-8 h-8 rounded-full flex items-center justify-center ${displayStreak.current_streak_weeks >= 4 ? 'bg-gray-400 text-white' : 'bg-muted'}`}>
              🥈
            </div>
            <div className={`w-8 h-8 rounded-full flex items-center justify-center ${displayStreak.current_streak_weeks >= 8 ? 'bg-yellow-500 text-white' : 'bg-muted'}`}>
              🥇
            </div>
            <div className={`w-8 h-8 rounded-full flex items-center justify-center ${displayStreak.current_streak_weeks >= 12 ? 'bg-cyan-400 text-white' : 'bg-muted'}`}>
              💎
            </div>
          </div>
          <p className="text-xs text-center text-muted-foreground">
            4 weeks • 8 weeks • 12 weeks
          </p>
        </div>
      </CardContent>
    </Card>
  );
}