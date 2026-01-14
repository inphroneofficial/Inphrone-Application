import { useState, useEffect } from "react";
import { Badge } from "@/components/ui/badge";
import { Eye, Users, Zap } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

interface LiveViewerCountProps {
  opinionId: string;
  initialCount?: number;
}

export const LiveViewerCount = ({ opinionId, initialCount = 0 }: LiveViewerCountProps) => {
  const [viewerCount, setViewerCount] = useState(initialCount);
  const [isActive, setIsActive] = useState(false);

  useEffect(() => {
    // Simulate live viewer count (in real app, this would use realtime subscription)
    const storedViewers = localStorage.getItem(`viewers_${opinionId}`);
    const baseCount = storedViewers ? parseInt(storedViewers) : Math.floor(Math.random() * 5);
    setViewerCount(baseCount);

    // Register this viewer
    const newCount = baseCount + 1;
    localStorage.setItem(`viewers_${opinionId}`, newCount.toString());
    setViewerCount(newCount);
    setIsActive(true);

    // Cleanup on unmount
    return () => {
      const current = parseInt(localStorage.getItem(`viewers_${opinionId}`) || "1");
      localStorage.setItem(`viewers_${opinionId}`, Math.max(0, current - 1).toString());
    };
  }, [opinionId]);

  if (viewerCount <= 0) return null;

  return (
    <Badge 
      variant="secondary" 
      className="text-xs flex items-center gap-1 bg-green-500/10 text-green-600 dark:text-green-400"
    >
      <motion.div
        animate={{ scale: [1, 1.2, 1] }}
        transition={{ repeat: Infinity, duration: 2 }}
      >
        <Eye className="w-3 h-3" />
      </motion.div>
      {viewerCount} viewing
    </Badge>
  );
};

interface LiveActivityIndicatorProps {
  isLive?: boolean;
  label?: string;
}

export const LiveActivityIndicator = ({ isLive = true, label = "Live" }: LiveActivityIndicatorProps) => {
  if (!isLive) return null;

  return (
    <Badge 
      variant="secondary" 
      className="text-xs flex items-center gap-1.5 bg-red-500/10 text-red-600 dark:text-red-400"
    >
      <motion.div
        className="w-2 h-2 bg-red-500 rounded-full"
        animate={{ scale: [1, 1.3, 1], opacity: [1, 0.7, 1] }}
        transition={{ repeat: Infinity, duration: 1.5 }}
      />
      {label}
    </Badge>
  );
};

interface TrendingNowIndicatorProps {
  rank?: number;
}

export const TrendingNowIndicator = ({ rank }: TrendingNowIndicatorProps) => {
  return (
    <Badge 
      variant="secondary" 
      className="text-xs flex items-center gap-1 bg-orange-500/10 text-orange-600 dark:text-orange-400"
    >
      <Zap className="w-3 h-3" />
      {rank ? `#${rank} Trending` : "Trending"}
    </Badge>
  );
};

interface ActiveUsersIndicatorProps {
  count: number;
  label?: string;
}

export const ActiveUsersIndicator = ({ count, label = "active now" }: ActiveUsersIndicatorProps) => {
  const [displayCount, setDisplayCount] = useState(count);

  useEffect(() => {
    // Animate count changes
    const timer = setInterval(() => {
      setDisplayCount(prev => {
        const diff = count - prev;
        if (Math.abs(diff) <= 1) return count;
        return prev + Math.sign(diff);
      });
    }, 50);

    return () => clearInterval(timer);
  }, [count]);

  return (
    <div className="flex items-center gap-2 text-sm text-muted-foreground">
      <div className="flex -space-x-1">
        {[...Array(Math.min(3, displayCount))].map((_, i) => (
          <motion.div
            key={i}
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            className="w-6 h-6 rounded-full bg-gradient-to-br from-primary to-accent flex items-center justify-center text-[10px] text-white font-medium border-2 border-background"
          >
            {String.fromCharCode(65 + i)}
          </motion.div>
        ))}
      </div>
      <AnimatePresence mode="wait">
        <motion.span
          key={displayCount}
          initial={{ y: -10, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          exit={{ y: 10, opacity: 0 }}
          transition={{ duration: 0.2 }}
        >
          <span className="font-semibold text-foreground">{displayCount}</span> {label}
        </motion.span>
      </AnimatePresence>
    </div>
  );
};
