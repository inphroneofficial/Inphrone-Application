import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { Activity, Clock } from "lucide-react";

interface LiveIntelligencePulseProps {
  className?: string;
}

export function LiveIntelligencePulse({ className = "" }: LiveIntelligencePulseProps) {
  const [timestamp, setTimestamp] = useState(new Date());

  useEffect(() => {
    const interval = setInterval(() => {
      setTimestamp(new Date());
    }, 60000); // Update every minute

    return () => clearInterval(interval);
  }, []);

  const formatTime = (date: Date) => {
    return date.toLocaleString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
      timeZoneName: 'short'
    });
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: -10 }}
      animate={{ opacity: 1, y: 0 }}
      className={`flex items-center gap-2 text-xs text-muted-foreground bg-muted/30 px-3 py-1.5 rounded-full border border-border/50 ${className}`}
    >
      <div className="relative">
        <Activity className="w-3.5 h-3.5 text-green-500" />
        <motion.div
          className="absolute inset-0 rounded-full bg-green-500/30"
          animate={{ scale: [1, 1.5, 1], opacity: [0.5, 0, 0.5] }}
          transition={{ duration: 2, repeat: Infinity }}
        />
      </div>
      <span className="font-medium">Live Intelligence Pulse</span>
      <span className="text-muted-foreground/70">•</span>
      <Clock className="w-3 h-3" />
      <span>{formatTime(timestamp)}</span>
    </motion.div>
  );
}
