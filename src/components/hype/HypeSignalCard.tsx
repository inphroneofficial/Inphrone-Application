import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Flame, ArrowRight, Clock, TrendingUp } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import { formatDistanceToNow, differenceInDays } from "date-fns";
import confetti from "canvas-confetti";

interface HypeSignalCardProps {
  id: string;
  phrase: string;
  categoryName: string;
  categoryColor: string;
  hypeCount: number;
  passCount: number;
  signalScore: number;
  createdAt: string;
  expiresAt: string;
  userVote?: 'hype' | 'pass' | null;
  onVote: (signalId: string, voteType: 'hype' | 'pass') => Promise<boolean>;
  showRank?: number;
}

export function HypeSignalCard({
  id,
  phrase,
  categoryName,
  categoryColor,
  hypeCount,
  passCount,
  signalScore,
  createdAt,
  expiresAt,
  userVote,
  onVote,
  showRank,
}: HypeSignalCardProps) {
  const [isVoting, setIsVoting] = useState(false);
  const [localHypeCount, setLocalHypeCount] = useState(hypeCount);
  const [localPassCount, setLocalPassCount] = useState(passCount);
  const [localVote, setLocalVote] = useState(userVote);

  const daysLeft = differenceInDays(new Date(expiresAt), new Date());
  const timeAgo = formatDistanceToNow(new Date(createdAt), { addSuffix: true });

  const handleVote = async (voteType: 'hype' | 'pass') => {
    if (isVoting) return;
    
    setIsVoting(true);
    
    // Optimistic update
    const wasVoted = localVote === voteType;
    const wasOpposite = localVote && localVote !== voteType;
    
    if (wasVoted) {
      // Removing vote
      if (voteType === 'hype') setLocalHypeCount(prev => prev - 1);
      else setLocalPassCount(prev => prev - 1);
      setLocalVote(null);
    } else if (wasOpposite) {
      // Changing vote
      if (voteType === 'hype') {
        setLocalHypeCount(prev => prev + 1);
        setLocalPassCount(prev => prev - 1);
      } else {
        setLocalHypeCount(prev => prev - 1);
        setLocalPassCount(prev => prev + 1);
      }
      setLocalVote(voteType);
    } else {
      // New vote
      if (voteType === 'hype') {
        setLocalHypeCount(prev => prev + 1);
        // Fire confetti on hype!
        confetti({
          particleCount: 30,
          spread: 60,
          origin: { y: 0.7 },
          colors: ['#ff6b35', '#ff8c42', '#ffd700'],
        });
      } else {
        setLocalPassCount(prev => prev + 1);
      }
      setLocalVote(voteType);
    }

    const success = await onVote(id, voteType);
    
    if (!success) {
      // Revert on failure
      setLocalHypeCount(hypeCount);
      setLocalPassCount(passCount);
      setLocalVote(userVote);
    }
    
    setIsVoting(false);
  };

  const localScore = localHypeCount - localPassCount;

  return (
    <motion.div
      layout
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
      className={cn(
        "relative p-4 rounded-xl border transition-all duration-300",
        "bg-card/50 backdrop-blur-sm hover:bg-card/80",
        "border-l-4",
        localVote === 'hype' && "ring-2 ring-orange-500/30"
      )}
      style={{ borderLeftColor: categoryColor }}
    >
      {/* Rank Badge */}
      {showRank && (
        <div className="absolute -top-2 -left-2 w-8 h-8 rounded-full bg-primary flex items-center justify-center text-primary-foreground font-bold text-sm shadow-lg">
          #{showRank}
        </div>
      )}

      {/* Category & Time */}
      <div className="flex items-center justify-between mb-3">
        <Badge 
          variant="secondary" 
          className="text-xs"
          style={{ backgroundColor: `${categoryColor}20`, color: categoryColor }}
        >
          {categoryName}
        </Badge>
        <div className="flex items-center gap-2 text-xs text-muted-foreground">
          <Clock className="w-3 h-3" />
          <span>{daysLeft} days left</span>
        </div>
      </div>

      {/* Phrase */}
      <h3 className="text-lg md:text-xl font-bold text-foreground mb-4 leading-tight">
        "{phrase}"
      </h3>

      {/* Signal Score */}
      <div className="flex items-center gap-2 mb-4">
        <div className={cn(
          "flex items-center gap-1 px-3 py-1 rounded-full text-sm font-semibold",
          localScore > 0 ? "bg-orange-500/20 text-orange-500" : 
          localScore < 0 ? "bg-muted text-muted-foreground" : 
          "bg-muted text-muted-foreground"
        )}>
          <TrendingUp className="w-4 h-4" />
          <AnimatePresence mode="wait">
            <motion.span
              key={localScore}
              initial={{ y: -10, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              exit={{ y: 10, opacity: 0 }}
            >
              {localScore > 0 ? `+${localScore}` : localScore}
            </motion.span>
          </AnimatePresence>
        </div>
        <span className="text-xs text-muted-foreground">
          {timeAgo}
        </span>
      </div>

      {/* Action Buttons */}
      <div className="flex gap-2">
        <Button
          variant={localVote === 'hype' ? 'default' : 'outline'}
          className={cn(
            "flex-1 gap-2 transition-all duration-300",
            localVote === 'hype' 
              ? "bg-gradient-to-r from-orange-500 to-red-500 text-white border-0 shadow-lg shadow-orange-500/30" 
              : "hover:bg-orange-500/10 hover:border-orange-500/50 hover:text-orange-500"
          )}
          onClick={() => handleVote('hype')}
          disabled={isVoting}
        >
          <Flame className={cn(
            "w-4 h-4",
            localVote === 'hype' && "animate-pulse"
          )} />
          <span>Hype It</span>
          <Badge variant="secondary" className="ml-1 text-xs bg-background/20">
            {localHypeCount}
          </Badge>
        </Button>

        <Button
          variant={localVote === 'pass' ? 'secondary' : 'ghost'}
          className={cn(
            "flex-1 gap-2 transition-all",
            localVote === 'pass' && "bg-muted"
          )}
          onClick={() => handleVote('pass')}
          disabled={isVoting}
        >
          <ArrowRight className="w-4 h-4" />
          <span>Pass</span>
          <Badge variant="outline" className="ml-1 text-xs">
            {localPassCount}
          </Badge>
        </Button>
      </div>
    </motion.div>
  );
}
