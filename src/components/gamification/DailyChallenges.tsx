import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Target, Gift, Zap, CheckCircle2, Clock, Star, Trophy } from "lucide-react";
import { toast } from "sonner";
import { motion, AnimatePresence } from "framer-motion";
import confetti from "canvas-confetti";

interface Challenge {
  id: string;
  title: string;
  description: string;
  type: "daily" | "weekly" | "special";
  target: number;
  current: number;
  reward_points: number;
  reward_badge?: string;
  expires_at: string;
  completed: boolean;
}

interface DailyChallengesProps {
  userId: string;
}

export const DailyChallenges = ({ userId }: DailyChallengesProps) => {
  const [challenges, setChallenges] = useState<Challenge[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    generateChallenges();
  }, [userId]);

  const generateChallenges = async () => {
    try {
      // Get user's activity data
      const { data: todayOpinions } = await supabase
        .from("opinions")
        .select("id")
        .eq("user_id", userId)
        .gte("created_at", new Date().toISOString().split('T')[0]);

      const { data: todayUpvotes } = await supabase
        .from("opinion_upvotes")
        .select("id")
        .eq("user_id", userId)
        .gte("created_at", new Date().toISOString().split('T')[0]);

      const { data: inphrosyncToday } = await supabase
        .from("inphrosync_responses")
        .select("id")
        .eq("user_id", userId)
        .eq("response_date", new Date().toISOString().split('T')[0]);

      // Check completed challenges from local storage
      const completedKey = `challenges_${userId}_${new Date().toISOString().split('T')[0]}`;
      let completedChallenges: string[] = [];
      try {
        const stored = localStorage.getItem(completedKey);
        const parsed = stored ? JSON.parse(stored) : [];
        completedChallenges = Array.isArray(parsed) ? parsed : [];
      } catch (error) {
        console.error("Error parsing completed challenges:", error);
        localStorage.removeItem(completedKey);
      }

      const now = new Date();
      const endOfDay = new Date(now);
      endOfDay.setHours(23, 59, 59, 999);

      const dailyChallenges: Challenge[] = [
        {
          id: "share_opinion",
          title: "Voice Your Opinion",
          description: "Share 1 opinion today",
          type: "daily",
          target: 1,
          current: todayOpinions?.length || 0,
          reward_points: 10,
          expires_at: endOfDay.toISOString(),
          completed: completedChallenges.includes("share_opinion") || (todayOpinions?.length || 0) >= 1
        },
        {
          id: "engage_community",
          title: "Community Supporter",
          description: "Like 3 opinions from others",
          type: "daily",
          target: 3,
          current: Math.min(todayUpvotes?.length || 0, 3),
          reward_points: 5,
          expires_at: endOfDay.toISOString(),
          completed: completedChallenges.includes("engage_community") || (todayUpvotes?.length || 0) >= 3
        },
        {
          id: "inphrosync_daily",
          title: "Daily Sync",
          description: "Answer today's InphroSync question",
          type: "daily",
          target: 1,
          current: inphrosyncToday?.length || 0,
          reward_points: 15,
          reward_badge: "Synced Soul",
          expires_at: endOfDay.toISOString(),
          completed: completedChallenges.includes("inphrosync_daily") || (inphrosyncToday?.length || 0) >= 1
        },
        {
          id: "explore_categories",
          title: "Explorer",
          description: "View 2 different category insights",
          type: "daily",
          target: 2,
          current: 0, // Would need view tracking
          reward_points: 8,
          expires_at: endOfDay.toISOString(),
          completed: completedChallenges.includes("explore_categories")
        }
      ];

      setChallenges(dailyChallenges);
    } catch (error) {
      console.error("Error generating challenges:", error);
    } finally {
      setLoading(false);
    }
  };

  const claimReward = async (challenge: Challenge) => {
    if (!challenge.completed || challenge.current < challenge.target) return;

    // Check if already claimed
    const completedKey = `challenges_${userId}_${new Date().toISOString().split('T')[0]}`;
    let completedChallenges: string[] = [];
    try {
      const stored = localStorage.getItem(completedKey);
      const parsed = stored ? JSON.parse(stored) : [];
      completedChallenges = Array.isArray(parsed) ? parsed : [];
    } catch (error) {
      console.error("Error parsing completed challenges:", error);
    }
    
    if (completedChallenges.includes(challenge.id)) {
      toast.info("Reward already claimed!");
      return;
    }

    // Award points
    const { data: currentRewards } = await supabase
      .from("rewards")
      .select("points")
      .eq("user_id", userId)
      .single();

    if (currentRewards) {
      await supabase
        .from("rewards")
        .update({ points: (currentRewards.points || 0) + challenge.reward_points })
        .eq("user_id", userId);
    }

    // Mark as claimed
    completedChallenges.push(challenge.id);
    localStorage.setItem(completedKey, JSON.stringify(completedChallenges));

    // Celebration
    confetti({
      particleCount: 100,
      spread: 70,
      origin: { y: 0.6 }
    });

    toast.success(`+${challenge.reward_points} points earned!`, {
      description: challenge.reward_badge ? `Badge unlocked: ${challenge.reward_badge}` : undefined
    });

    generateChallenges();
  };

  const getTimeRemaining = (expiresAt: string) => {
    const diff = new Date(expiresAt).getTime() - Date.now();
    const hours = Math.floor(diff / (1000 * 60 * 60));
    const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
    return `${hours}h ${minutes}m`;
  };

  if (loading) {
    return (
      <Card className="p-6">
        <div className="flex items-center gap-2 mb-4">
          <Target className="w-5 h-5 text-primary animate-pulse" />
          <h3 className="font-semibold">Daily Challenges</h3>
        </div>
        <div className="space-y-3">
          {[1, 2, 3].map(i => (
            <div key={i} className="h-20 bg-muted/50 rounded-lg animate-pulse" />
          ))}
        </div>
      </Card>
    );
  }

  const completedCount = challenges.filter(c => c.completed).length;

  return (
    <Card className="p-6">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <Target className="w-5 h-5 text-primary" />
          <h3 className="font-semibold">Daily Challenges</h3>
        </div>
        <Badge variant="secondary" className="flex items-center gap-1">
          <Trophy className="w-3 h-3" />
          {completedCount}/{challenges.length}
        </Badge>
      </div>

      <div className="space-y-3">
        <AnimatePresence>
          {challenges.map((challenge, index) => {
            const progress = Math.min((challenge.current / challenge.target) * 100, 100);
            const isComplete = challenge.current >= challenge.target;
            const isClaimed = challenge.completed && isComplete;

            return (
              <motion.div
                key={challenge.id}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1 }}
                className={`p-4 rounded-lg border transition-colors ${
                  isClaimed 
                    ? "bg-success/10 border-success/30" 
                    : isComplete 
                      ? "bg-primary/10 border-primary/30" 
                      : "bg-muted/30 border-border"
                }`}
              >
                <div className="flex items-start justify-between gap-3">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-1">
                      {isClaimed ? (
                        <CheckCircle2 className="w-4 h-4 text-success" />
                      ) : isComplete ? (
                        <Zap className="w-4 h-4 text-primary animate-pulse" />
                      ) : (
                        <Target className="w-4 h-4 text-muted-foreground" />
                      )}
                      <h4 className="font-medium text-sm">{challenge.title}</h4>
                      {challenge.reward_badge && (
                        <Badge variant="outline" className="text-xs">
                          <Star className="w-3 h-3 mr-1" />
                          {challenge.reward_badge}
                        </Badge>
                      )}
                    </div>
                    <p className="text-xs text-muted-foreground mb-2">
                      {challenge.description}
                    </p>
                    <div className="flex items-center gap-3">
                      <Progress value={progress} className="flex-1 h-2" />
                      <span className="text-xs font-medium">
                        {challenge.current}/{challenge.target}
                      </span>
                    </div>
                  </div>
                  <div className="text-right">
                    <Badge variant="secondary" className="text-xs mb-2">
                      <Gift className="w-3 h-3 mr-1" />
                      +{challenge.reward_points}
                    </Badge>
                    {!isClaimed && (
                      <div className="flex items-center gap-1 text-xs text-muted-foreground">
                        <Clock className="w-3 h-3" />
                        {getTimeRemaining(challenge.expires_at)}
                      </div>
                    )}
                    {isComplete && !isClaimed && (
                      <Button
                        size="sm"
                        className="mt-2 h-7 text-xs"
                        onClick={() => claimReward(challenge)}
                      >
                        Claim
                      </Button>
                    )}
                  </div>
                </div>
              </motion.div>
            );
          })}
        </AnimatePresence>
      </div>
    </Card>
  );
};
