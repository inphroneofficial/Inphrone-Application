import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { motion, AnimatePresence } from "framer-motion";
import { Trophy, Star, Sparkles, X } from "lucide-react";
import confetti from "canvas-confetti";

interface Achievement {
  id: string;
  title: string;
  description: string;
  icon: string;
  rarity: "common" | "rare" | "epic" | "legendary";
}

interface AchievementUnlockProps {
  achievement: Achievement | null;
  onClose: () => void;
}

const rarityColors = {
  common: "from-gray-400 to-gray-600",
  rare: "from-blue-400 to-blue-600",
  epic: "from-purple-400 to-purple-600",
  legendary: "from-amber-400 to-orange-600"
};

const rarityGlow = {
  common: "shadow-gray-500/50",
  rare: "shadow-blue-500/50",
  epic: "shadow-purple-500/50",
  legendary: "shadow-amber-500/50"
};

export const AchievementUnlock = ({ achievement, onClose }: AchievementUnlockProps) => {
  useEffect(() => {
    if (achievement) {
      // Trigger confetti
      const duration = 3000;
      const animationEnd = Date.now() + duration;

      const randomInRange = (min: number, max: number) => 
        Math.random() * (max - min) + min;

      const interval = setInterval(() => {
        const timeLeft = animationEnd - Date.now();
        if (timeLeft <= 0) {
          clearInterval(interval);
          return;
        }

        confetti({
          particleCount: 3,
          angle: randomInRange(55, 125),
          spread: randomInRange(50, 70),
          origin: { x: randomInRange(0.1, 0.3), y: Math.random() - 0.2 },
          colors: ['#FFD700', '#FFA500', '#FF6347']
        });
        confetti({
          particleCount: 3,
          angle: randomInRange(55, 125),
          spread: randomInRange(50, 70),
          origin: { x: randomInRange(0.7, 0.9), y: Math.random() - 0.2 },
          colors: ['#FFD700', '#FFA500', '#FF6347']
        });
      }, 150);

      return () => clearInterval(interval);
    }
  }, [achievement]);

  if (!achievement) return null;

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm"
        onClick={onClose}
      >
        <motion.div
          initial={{ scale: 0, rotate: -180 }}
          animate={{ scale: 1, rotate: 0 }}
          exit={{ scale: 0, rotate: 180 }}
          transition={{ type: "spring", damping: 15, stiffness: 150 }}
          className="relative p-8 bg-card rounded-2xl max-w-sm mx-4"
          onClick={e => e.stopPropagation()}
        >
          {/* Close button */}
          <button
            onClick={onClose}
            className="absolute top-4 right-4 p-1 rounded-full hover:bg-muted transition-colors"
          >
            <X className="w-5 h-5" />
          </button>

          {/* Achievement Icon */}
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ delay: 0.2, type: "spring" }}
            className={`mx-auto w-24 h-24 rounded-full bg-gradient-to-br ${rarityColors[achievement.rarity]} flex items-center justify-center shadow-2xl ${rarityGlow[achievement.rarity]}`}
          >
            <span className="text-4xl">{achievement.icon}</span>
          </motion.div>

          {/* Sparkles */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.4 }}
            className="absolute top-20 left-1/2 -translate-x-1/2"
          >
            <Sparkles className="w-8 h-8 text-yellow-400 animate-pulse" />
          </motion.div>

          {/* Title */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="text-center mt-6"
          >
            <p className="text-sm text-muted-foreground uppercase tracking-widest mb-2">
              Achievement Unlocked
            </p>
            <h2 className="text-2xl font-bold bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">
              {achievement.title}
            </h2>
            <p className="text-sm text-muted-foreground mt-2">
              {achievement.description}
            </p>
          </motion.div>

          {/* Rarity Badge */}
          <motion.div
            initial={{ opacity: 0, scale: 0 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.5 }}
            className="flex justify-center mt-4"
          >
            <span className={`px-4 py-1 rounded-full text-xs font-semibold uppercase bg-gradient-to-r ${rarityColors[achievement.rarity]} text-white`}>
              {achievement.rarity}
            </span>
          </motion.div>

          {/* Continue Button */}
          <motion.button
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.6 }}
            onClick={onClose}
            className="w-full mt-6 py-3 rounded-lg bg-primary text-primary-foreground font-semibold hover:bg-primary/90 transition-colors"
          >
            Awesome!
          </motion.button>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
};

// Hook to check and trigger achievements
export const useAchievementCheck = (userId: string | null) => {
  const [pendingAchievement, setPendingAchievement] = useState<Achievement | null>(null);

  const checkAchievements = async () => {
    if (!userId) return;

    try {
      // Get user's stats
      const { data: opinions } = await supabase
        .from("opinions")
        .select("id")
        .eq("user_id", userId);

      const { data: upvotes } = await supabase
        .from("opinion_upvotes")
        .select("id")
        .eq("user_id", userId);

      const { data: existingBadges } = await supabase
        .from("user_badges")
        .select("badge_type")
        .eq("user_id", userId);

      const earnedBadges = new Set(existingBadges?.map(b => b.badge_type) || []);
      const opinionCount = opinions?.length || 0;
      const upvoteCount = upvotes?.length || 0;

      // Define achievements
      const achievementChecks = [
        {
          id: "first_opinion",
          condition: opinionCount >= 1,
          title: "First Voice",
          description: "Shared your first opinion with the community",
          icon: "🎤",
          rarity: "common" as const
        },
        {
          id: "five_opinions",
          condition: opinionCount >= 5,
          title: "Regular Contributor",
          description: "Shared 5 opinions",
          icon: "📝",
          rarity: "common" as const
        },
        {
          id: "ten_opinions",
          condition: opinionCount >= 10,
          title: "Vocal Advocate",
          description: "Shared 10 opinions",
          icon: "🗣️",
          rarity: "rare" as const
        },
        {
          id: "first_like",
          condition: upvoteCount >= 1,
          title: "Community Spirit",
          description: "Gave your first like",
          icon: "👍",
          rarity: "common" as const
        },
        {
          id: "ten_likes",
          condition: upvoteCount >= 10,
          title: "Supportive Soul",
          description: "Gave 10 likes to others",
          icon: "💖",
          rarity: "rare" as const
        },
        {
          id: "fifty_opinions",
          condition: opinionCount >= 50,
          title: "Opinion Leader",
          description: "Shared 50 opinions",
          icon: "👑",
          rarity: "epic" as const
        },
        {
          id: "hundred_opinions",
          condition: opinionCount >= 100,
          title: "Legendary Voice",
          description: "Shared 100 opinions",
          icon: "🏆",
          rarity: "legendary" as const
        }
      ];

      // Find first unearned achievement that's now earned
      for (const check of achievementChecks) {
        if (check.condition && !earnedBadges.has(check.id)) {
          // Award the badge
          await supabase.from("user_badges").insert({
            user_id: userId,
            badge_type: check.id,
            badge_name: check.title,
            badge_description: check.description
          });

          setPendingAchievement({
            id: check.id,
            title: check.title,
            description: check.description,
            icon: check.icon,
            rarity: check.rarity
          });
          break;
        }
      }
    } catch (error) {
      console.error("Error checking achievements:", error);
    }
  };

  const dismissAchievement = () => {
    setPendingAchievement(null);
  };

  return { pendingAchievement, checkAchievements, dismissAchievement };
};
