import { useState, useEffect, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Zap, Users, Trophy, Sparkles, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import confetti from "canvas-confetti";

interface YourTurnSlotTimerProps {
  slotTime: string;
  slotLabel: string;
  userId: string | null;
  onAttempt: () => Promise<{ success: boolean; isWinner: boolean }>;
  slotInfo?: {
    id: string;
    winner_id: string | null;
    attempt_count: number;
    status: string;
  } | null;
}

export const YourTurnSlotTimer = ({
  slotTime,
  slotLabel,
  userId,
  onAttempt,
  slotInfo
}: YourTurnSlotTimerProps) => {
  const [timeLeft, setTimeLeft] = useState(20);
  const [isAttempting, setIsAttempting] = useState(false);
  const [hasAttempted, setHasAttempted] = useState(false);
  const [isWinner, setIsWinner] = useState(false);
  const [showResult, setShowResult] = useState(false);
  const [attemptCount, setAttemptCount] = useState(slotInfo?.attempt_count || 0);

  // Calculate time left based on current second
  useEffect(() => {
    const now = new Date();
    const seconds = now.getSeconds();
    const remaining = Math.max(0, 20 - seconds);
    setTimeLeft(remaining);

    const interval = setInterval(() => {
      setTimeLeft(prev => Math.max(0, prev - 1));
    }, 1000);

    return () => clearInterval(interval);
  }, []);

  // Update attempt count from props
  useEffect(() => {
    if (slotInfo?.attempt_count) {
      setAttemptCount(slotInfo.attempt_count);
    }
  }, [slotInfo?.attempt_count]);

  // Check if slot already has winner
  useEffect(() => {
    if (slotInfo?.winner_id) {
      setShowResult(true);
      if (slotInfo.winner_id === userId) {
        setIsWinner(true);
      }
    }
  }, [slotInfo?.winner_id, userId]);

  const handleAttempt = async () => {
    if (!userId || hasAttempted || isAttempting || timeLeft === 0) return;

    setIsAttempting(true);
    const result = await onAttempt();
    setHasAttempted(true);
    setIsAttempting(false);
    setShowResult(true);

    if (result.isWinner) {
      setIsWinner(true);
      // Celebrate with confetti
      confetti({
        particleCount: 100,
        spread: 70,
        origin: { y: 0.6 }
      });
    }
  };

  const progress = ((20 - timeLeft) / 20) * 100;
  const circumference = 2 * Math.PI * 45;
  const strokeDashoffset = circumference - (progress / 100) * circumference;

  // Slot ended
  if (timeLeft === 0 && !showResult) {
    return (
      <motion.div
        className="p-6 bg-gradient-to-br from-muted/50 to-muted/30 rounded-2xl border border-border"
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
      >
        <div className="text-center">
          <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-muted flex items-center justify-center">
            <Users className="w-8 h-8 text-muted-foreground" />
          </div>
          <h4 className="font-bold text-lg mb-2">Slot Ended</h4>
          <p className="text-sm text-muted-foreground">
            {attemptCount} people tried to get their turn!
          </p>
        </div>
      </motion.div>
    );
  }

  // Show result (winner/loser)
  if (showResult) {
    return (
      <motion.div
        className={`p-6 rounded-2xl border-2 ${
          isWinner 
            ? 'bg-gradient-to-br from-amber-500/20 to-orange-500/20 border-amber-500/50' 
            : 'bg-gradient-to-br from-muted/50 to-muted/30 border-border'
        }`}
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
      >
        <div className="text-center">
          {isWinner ? (
            <>
              <motion.div
                className="w-20 h-20 mx-auto mb-4 rounded-full bg-gradient-to-br from-amber-400 to-orange-500 flex items-center justify-center shadow-glow"
                animate={{ scale: [1, 1.1, 1], rotate: [0, 5, -5, 0] }}
                transition={{ duration: 2, repeat: Infinity }}
              >
                <Trophy className="w-10 h-10 text-white" />
              </motion.div>
              <h4 className="text-2xl font-bold mb-2 bg-gradient-to-r from-amber-400 to-orange-500 bg-clip-text text-transparent">
                🎉 You Won!
              </h4>
              <p className="text-sm text-muted-foreground mb-4">
                You're the {slotLabel} slot winner! Now submit your question.
              </p>
              <div className="flex items-center justify-center gap-2 text-xs text-muted-foreground">
                <Users className="w-3.5 h-3.5" />
                <span>{attemptCount} people tried this slot</span>
              </div>
            </>
          ) : (
            <>
              <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-muted flex items-center justify-center">
                <Sparkles className="w-8 h-8 text-muted-foreground" />
              </div>
              <h4 className="font-bold text-lg mb-2">Better Luck Next Time!</h4>
              <p className="text-sm text-muted-foreground mb-4">
                Someone was faster this time. Try again at the next slot!
              </p>
              <div className="flex items-center justify-center gap-2 text-xs text-muted-foreground">
                <Users className="w-3.5 h-3.5" />
                <span>{attemptCount} people tried this slot</span>
              </div>
            </>
          )}
        </div>
      </motion.div>
    );
  }

  return (
    <motion.div
      className="p-6 bg-gradient-to-br from-primary/10 to-accent/10 rounded-2xl border-2 border-primary/30"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
    >
      <div className="flex flex-col sm:flex-row items-center gap-6">
        {/* Circular Timer */}
        <div className="relative">
          <svg className="w-28 h-28 -rotate-90" viewBox="0 0 100 100">
            {/* Background circle */}
            <circle
              cx="50"
              cy="50"
              r="45"
              fill="none"
              stroke="currentColor"
              strokeWidth="6"
              className="text-muted/30"
            />
            {/* Progress circle */}
            <motion.circle
              cx="50"
              cy="50"
              r="45"
              fill="none"
              stroke="url(#timerGradient)"
              strokeWidth="6"
              strokeLinecap="round"
              strokeDasharray={circumference}
              strokeDashoffset={strokeDashoffset}
              initial={{ strokeDashoffset: circumference }}
              animate={{ strokeDashoffset }}
              transition={{ duration: 0.5 }}
            />
            <defs>
              <linearGradient id="timerGradient" x1="0%" y1="0%" x2="100%" y2="100%">
                <stop offset="0%" stopColor="hsl(var(--primary))" />
                <stop offset="100%" stopColor="hsl(var(--accent))" />
              </linearGradient>
            </defs>
          </svg>
          
          {/* Timer text */}
          <div className="absolute inset-0 flex flex-col items-center justify-center">
            <motion.span
              key={timeLeft}
              initial={{ scale: 1.2, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              className="text-3xl font-bold bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent"
            >
              {timeLeft}
            </motion.span>
            <span className="text-xs text-muted-foreground">seconds</span>
          </div>
        </div>

        {/* Content */}
        <div className="flex-1 text-center sm:text-left">
          <div className="flex items-center justify-center sm:justify-start gap-2 mb-2">
            <motion.div
              animate={{ scale: [1, 1.2, 1] }}
              transition={{ duration: 1, repeat: Infinity }}
            >
              <Zap className="w-5 h-5 text-amber-500" />
            </motion.div>
            <h4 className="text-xl font-bold">{slotLabel} Slot is LIVE!</h4>
          </div>
          
          <p className="text-sm text-muted-foreground mb-4">
            Be the first to click and win the chance to ask your question!
          </p>

          {/* I'm In Button */}
          <motion.div
            animate={!hasAttempted ? { scale: [1, 1.02, 1] } : {}}
            transition={{ duration: 0.8, repeat: Infinity }}
          >
            <Button
              onClick={handleAttempt}
              disabled={!userId || hasAttempted || isAttempting || timeLeft === 0}
              className={`w-full sm:w-auto h-14 px-8 text-lg font-bold rounded-2xl shadow-glow transition-all ${
                hasAttempted
                  ? 'bg-muted text-muted-foreground'
                  : 'bg-gradient-to-r from-primary via-accent to-primary bg-[length:200%_100%] animate-shimmer text-white hover:shadow-xl hover:-translate-y-1'
              }`}
            >
              {isAttempting ? (
                <>
                  <Loader2 className="w-5 h-5 mr-2 animate-spin" />
                  Trying...
                </>
              ) : hasAttempted ? (
                "Attempted ✓"
              ) : (
                <>
                  <Zap className="w-5 h-5 mr-2" />
                  I'M IN!
                </>
              )}
            </Button>
          </motion.div>

          {/* Attempt count */}
          {attemptCount > 0 && (
            <motion.div
              className="mt-3 flex items-center justify-center sm:justify-start gap-2 text-xs text-muted-foreground"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
            >
              <Users className="w-3.5 h-3.5" />
              <span>{attemptCount} people trying...</span>
            </motion.div>
          )}
        </div>
      </div>
    </motion.div>
  );
};
