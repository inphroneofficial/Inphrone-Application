import { useEffect } from "react";
import { toast } from "sonner";
import confetti from "canvas-confetti";
import { Trophy, Star, Flame, Crown, Sparkles, Heart } from "lucide-react";

interface Milestone {
  type: "opinions" | "likes" | "streak" | "level" | "badge";
  value: number;
  message: string;
}

const milestoneConfigs: Record<string, { icon: any; color: string; confettiColors: string[] }> = {
  opinions: {
    icon: "📝",
    color: "#3b82f6",
    confettiColors: ["#3b82f6", "#60a5fa", "#93c5fd"]
  },
  likes: {
    icon: "❤️",
    color: "#ef4444",
    confettiColors: ["#ef4444", "#f87171", "#fca5a5"]
  },
  streak: {
    icon: "🔥",
    color: "#f97316",
    confettiColors: ["#f97316", "#fb923c", "#fdba74"]
  },
  level: {
    icon: "⬆️",
    color: "#8b5cf6",
    confettiColors: ["#8b5cf6", "#a78bfa", "#c4b5fd"]
  },
  badge: {
    icon: "🏆",
    color: "#eab308",
    confettiColors: ["#eab308", "#facc15", "#fde047"]
  }
};

export const triggerMilestoneToast = (milestone: Milestone) => {
  const config = milestoneConfigs[milestone.type];

  // Trigger confetti
  confetti({
    particleCount: 100,
    spread: 70,
    origin: { y: 0.6 },
    colors: config.confettiColors
  });

  // Show toast
  toast.custom(() => (
    <div className="flex items-center gap-3 bg-card border border-border rounded-lg p-4 shadow-lg animate-in slide-in-from-top-5">
      <div className="text-3xl">{config.icon}</div>
      <div>
        <p className="font-semibold text-foreground">Milestone Reached!</p>
        <p className="text-sm text-muted-foreground">{milestone.message}</p>
      </div>
      <Sparkles className="w-5 h-5 text-amber-500 animate-pulse" />
    </div>
  ), {
    duration: 5000,
    position: "top-center"
  });
};

// Hook to track milestones
export const useMilestoneTracker = (userId: string | null, stats: {
  opinions: number;
  totalLikes: number;
  level: number;
  streak?: number;
}) => {
  useEffect(() => {
    if (!userId) return;

    // Check for opinion milestones
    const opinionMilestones = [1, 5, 10, 25, 50, 100, 250, 500, 1000];
    const lastOpinionMilestone = parseInt(localStorage.getItem(`milestone_opinions_${userId}`) || "0");
    
    for (const milestone of opinionMilestones) {
      if (stats.opinions >= milestone && lastOpinionMilestone < milestone) {
        triggerMilestoneToast({
          type: "opinions",
          value: milestone,
          message: `You've shared ${milestone} opinion${milestone > 1 ? 's' : ''}! 🎉`
        });
        localStorage.setItem(`milestone_opinions_${userId}`, milestone.toString());
        break;
      }
    }

    // Check for like milestones
    const likeMilestones = [1, 10, 25, 50, 100, 250, 500];
    const lastLikeMilestone = parseInt(localStorage.getItem(`milestone_likes_${userId}`) || "0");
    
    for (const milestone of likeMilestones) {
      if (stats.totalLikes >= milestone && lastLikeMilestone < milestone) {
        triggerMilestoneToast({
          type: "likes",
          value: milestone,
          message: `Your opinions received ${milestone} likes! ❤️`
        });
        localStorage.setItem(`milestone_likes_${userId}`, milestone.toString());
        break;
      }
    }

    // Check for level milestones
    const levelMilestones = [2, 5, 10, 15, 20, 25, 50];
    const lastLevelMilestone = parseInt(localStorage.getItem(`milestone_level_${userId}`) || "1");
    
    for (const milestone of levelMilestones) {
      if (stats.level >= milestone && lastLevelMilestone < milestone) {
        triggerMilestoneToast({
          type: "level",
          value: milestone,
          message: `You've reached Level ${milestone}! Keep going! 🚀`
        });
        localStorage.setItem(`milestone_level_${userId}`, milestone.toString());
        break;
      }
    }
  }, [userId, stats.opinions, stats.totalLikes, stats.level]);
};
