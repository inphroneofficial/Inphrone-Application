import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { User, Clock, Check, TrendingUp, MessageSquare } from "lucide-react";
import { Button } from "@/components/ui/button";

interface YourTurnVotingProps {
  question: {
    id: string;
    question_text: string;
    options: Array<{ id: string; label: string; votes: number }>;
    total_votes: number;
    winner_name?: string;
    slot_time?: string;
    created_at: string;
  };
  userVote?: string;
  onVote: (optionId: string) => Promise<boolean>;
  isAudience: boolean;
}

export const YourTurnVoting = ({ 
  question, 
  userVote, 
  onVote, 
  isAudience 
}: YourTurnVotingProps) => {
  const [isVoting, setIsVoting] = useState<string | null>(null);
  const hasVoted = !!userVote;
  
  const getSlotLabel = (time?: string) => {
    if (time === '09:00') return '9 AM';
    if (time === '14:00') return '2 PM';
    if (time === '19:00') return '7 PM';
    return time;
  };

  const handleVote = async (optionId: string) => {
    if (!isAudience || hasVoted || isVoting) return;
    
    setIsVoting(optionId);
    await onVote(optionId);
    setIsVoting(null);
  };

  const getPercentage = (votes: number) => {
    if (question.total_votes === 0) return 0;
    return Math.round((votes / question.total_votes) * 100);
  };

  const maxVotes = Math.max(...question.options.map(o => o.votes));

  return (
    <motion.div
      className="p-5 bg-gradient-to-br from-card/80 to-card/40 rounded-2xl border border-border/50 backdrop-blur-sm"
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      whileHover={{ scale: 1.01 }}
      transition={{ duration: 0.2 }}
    >
      {/* Header */}
      <div className="flex items-start justify-between mb-4">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-full bg-gradient-to-br from-primary/20 to-accent/20 flex items-center justify-center">
            <User className="w-5 h-5 text-primary" />
          </div>
          <div>
            <p className="text-sm font-medium text-foreground">
              {question.winner_name}
            </p>
            <div className="flex items-center gap-2 text-xs text-muted-foreground">
              <Clock className="w-3 h-3" />
              <span>{getSlotLabel(question.slot_time)} Winner</span>
            </div>
          </div>
        </div>
        
        <div className="flex items-center gap-1.5 px-3 py-1 bg-primary/10 rounded-full">
          <TrendingUp className="w-3 h-3 text-primary" />
          <span className="text-xs font-medium text-primary">
            {question.total_votes} vote{question.total_votes !== 1 ? 's' : ''}
          </span>
        </div>
      </div>

      {/* Question */}
      <div className="mb-4">
        <div className="flex items-start gap-2">
          <MessageSquare className="w-4 h-4 text-accent mt-0.5 flex-shrink-0" />
          <h4 className="font-semibold text-foreground leading-relaxed">
            {question.question_text}
          </h4>
        </div>
      </div>

      {/* Options */}
      <div className="space-y-2">
        {question.options.map((option, index) => {
          const isSelected = userVote === option.id;
          const isWinning = option.votes === maxVotes && option.votes > 0;
          const percentage = getPercentage(option.votes);
          const isLoadingThis = isVoting === option.id;

          return (
            <motion.button
              key={option.id}
              onClick={() => handleVote(option.id)}
              disabled={!isAudience || hasVoted || !!isVoting}
              className={`relative w-full p-4 rounded-xl text-left transition-all overflow-hidden ${
                isSelected
                  ? 'bg-primary/20 border-2 border-primary'
                  : hasVoted
                  ? 'bg-muted/30 border border-border/50'
                  : 'bg-muted/50 border border-border/50 hover:border-primary/50 hover:bg-muted/70'
              } ${!isAudience && 'cursor-default'}`}
              whileHover={!hasVoted && isAudience ? { scale: 1.02 } : {}}
              whileTap={!hasVoted && isAudience ? { scale: 0.98 } : {}}
            >
              {/* Progress bar background (only show after voting) */}
              {hasVoted && (
                <motion.div
                  className={`absolute inset-0 ${
                    isSelected 
                      ? 'bg-gradient-to-r from-primary/30 to-primary/10'
                      : isWinning
                      ? 'bg-gradient-to-r from-accent/20 to-accent/5'
                      : 'bg-muted/50'
                  }`}
                  initial={{ width: 0 }}
                  animate={{ width: `${percentage}%` }}
                  transition={{ duration: 0.5, ease: "easeOut" }}
                />
              )}

              <div className="relative flex items-center justify-between">
                <div className="flex items-center gap-3">
                  {/* Letter indicator */}
                  <span className={`w-7 h-7 rounded-lg flex items-center justify-center text-xs font-bold ${
                    isSelected
                      ? 'bg-primary text-primary-foreground'
                      : 'bg-muted text-muted-foreground'
                  }`}>
                    {String.fromCharCode(65 + index)}
                  </span>
                  
                  <span className={`font-medium ${isSelected ? 'text-primary' : 'text-foreground'}`}>
                    {option.label}
                  </span>
                </div>

                <div className="flex items-center gap-2">
                  {/* Loading spinner */}
                  {isLoadingThis && (
                    <div className="w-4 h-4 border-2 border-primary border-t-transparent rounded-full animate-spin" />
                  )}
                  
                  {/* Check mark for selected */}
                  {isSelected && !isLoadingThis && (
                    <motion.div
                      initial={{ scale: 0 }}
                      animate={{ scale: 1 }}
                      className="w-5 h-5 rounded-full bg-primary flex items-center justify-center"
                    >
                      <Check className="w-3 h-3 text-white" />
                    </motion.div>
                  )}
                  
                  {/* Vote count and percentage (only show after voting) */}
                  {hasVoted && (
                    <motion.div
                      initial={{ opacity: 0, x: 10 }}
                      animate={{ opacity: 1, x: 0 }}
                      className="flex items-center gap-2"
                    >
                      <span className={`text-sm font-bold ${
                        isWinning ? 'text-accent' : 'text-muted-foreground'
                      }`}>
                        {percentage}%
                      </span>
                      <span className="text-xs text-muted-foreground">
                        ({option.votes})
                      </span>
                    </motion.div>
                  )}
                </div>
              </div>
            </motion.button>
          );
        })}
      </div>

      {/* Footer */}
      {!isAudience && (
        <p className="mt-3 text-xs text-muted-foreground text-center">
          Only audience members can vote
        </p>
      )}
      
      {hasVoted && (
        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="mt-3 text-xs text-primary text-center font-medium"
        >
          ✓ Your vote has been recorded
        </motion.p>
      )}
    </motion.div>
  );
};
