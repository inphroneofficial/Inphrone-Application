import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Sparkles, Clock, Users, Trophy, Zap, ChevronDown, ChevronUp, Film, Gamepad2, Music, Tv, Code, Smartphone, Radio, Video } from "lucide-react";
import { useYourTurn } from "@/hooks/useYourTurn";
import { YourTurnSlotTimer } from "./YourTurnSlotTimer";
import { YourTurnQuestionForm } from "./YourTurnQuestionForm";
import { YourTurnVoting } from "./YourTurnVoting";
import { YourTurnResults } from "./YourTurnResults";
import { Button } from "@/components/ui/button";
import { supabase } from "@/integrations/supabase/client";

interface YourTurnSectionProps {
  userId: string | null;
  isAudience: boolean;
  userType?: string;
}

// Category definitions for non-audience profiles
const categoryOptions = [
  { id: 'audience', label: 'General Entertainment', icon: Film, description: 'Movies, OTT, TV & more' },
  { id: 'gaming', label: 'Gaming', icon: Gamepad2, description: 'Video games & esports' },
  { id: 'music', label: 'Music', icon: Music, description: 'Music & audio content' },
  { id: 'tv', label: 'Television', icon: Tv, description: 'TV shows & channels' },
  { id: 'developer', label: 'App Development', icon: Code, description: 'Apps & software' },
  { id: 'creator', label: 'Content Creation', icon: Video, description: 'YouTube & social media' },
  { id: 'ott', label: 'OTT/Streaming', icon: Smartphone, description: 'Streaming platforms' },
  { id: 'studio', label: 'Film Studio', icon: Radio, description: 'Film production' },
];

export const YourTurnSection = ({ userId, isAudience, userType }: YourTurnSectionProps) => {
  const [isExpanded, setIsExpanded] = useState(true);
  const [currentTime, setCurrentTime] = useState(new Date());
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const [showCategorySelector, setShowCategorySelector] = useState(false);
  
  const {
    slots,
    questions,
    userAttempts,
    userVotes,
    loading,
    isWinner,
    wonSlotId,
    hasSubmittedQuestion,
    SLOT_TIMES,
    SLOT_DURATION_SECONDS,
    getCurrentSlotTime,
    getNextSlotTime,
    isWithinSlotWindow,
    attemptJoin,
    submitQuestion,
    voteOnQuestion,
    ensureSlotExists,
    refetch
  } = useYourTurn(userId);

  // Update current time every second
  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentTime(new Date());
    }, 1000);
    return () => clearInterval(interval);
  }, []);

  // Auto-select category based on user type for non-audience users
  useEffect(() => {
    if (!isAudience && userType && !selectedCategory) {
      const mappedCategory = categoryOptions.find(c => c.id === userType)?.id || 'audience';
      setSelectedCategory(mappedCategory);
    }
  }, [isAudience, userType, selectedCategory]);

  const currentSlotTime = getCurrentSlotTime();
  const nextSlot = getNextSlotTime();
  const todayQuestions = questions.filter(q => !q.is_deleted);

  // Get slot info for display
  const getSlotLabel = (time: string) => {
    if (time === '09:00') return '9:00 AM';
    if (time === '14:00') return '2:00 PM';
    if (time === '19:00') return '7:00 PM';
    return time;
  };

  const getSlotInfo = (slotTime: string) => {
    const slot = slots.find(s => s.slot_time === slotTime);
    return slot;
  };

  // Determine if user can participate in voting
  const canVote = isAudience || selectedCategory !== null;

  if (loading) {
    return (
      <motion.div
        className="p-6 bg-gradient-to-br from-primary/5 to-accent/5 rounded-3xl border border-primary/20"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
      >
        <div className="flex items-center justify-center gap-3">
          <div className="w-8 h-8 border-2 border-primary border-t-transparent rounded-full animate-spin" />
          <span className="text-muted-foreground">Loading Your Turn...</span>
        </div>
      </motion.div>
    );
  }

  return (
    <motion.div
      className="relative overflow-hidden"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
    >
      {/* Main Container */}
      <div className="bg-gradient-to-br from-primary/10 via-background to-accent/10 rounded-3xl border-2 border-primary/30 backdrop-blur-xl overflow-hidden">
        {/* Animated Background */}
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          <motion.div
            className="absolute -top-20 -right-20 w-60 h-60 rounded-full bg-primary/10 blur-3xl"
            animate={{ scale: [1, 1.2, 1], opacity: [0.3, 0.5, 0.3] }}
            transition={{ duration: 5, repeat: Infinity }}
          />
          <motion.div
            className="absolute -bottom-20 -left-20 w-60 h-60 rounded-full bg-accent/10 blur-3xl"
            animate={{ scale: [1, 1.3, 1], opacity: [0.3, 0.4, 0.3] }}
            transition={{ duration: 6, repeat: Infinity, delay: 1 }}
          />
        </div>

        {/* Header */}
        <div 
          className="relative p-6 cursor-pointer"
          onClick={() => setIsExpanded(!isExpanded)}
        >
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <motion.div
                className="w-14 h-14 rounded-2xl bg-gradient-to-br from-primary to-accent flex items-center justify-center shadow-glow"
                animate={{ rotate: [0, 5, -5, 0] }}
                transition={{ duration: 4, repeat: Infinity }}
              >
                <Trophy className="w-7 h-7 text-white" />
              </motion.div>
              <div>
                <h2 className="text-2xl font-bold bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent flex items-center gap-2">
                  Your Turn
                  <Sparkles className="w-5 h-5 text-amber-400" />
                </h2>
                <p className="text-sm text-muted-foreground">
                  Win your slot • Ask the community
                </p>
              </div>
            </div>
            
            <div className="flex items-center gap-4">
              {/* Next Slot Indicator */}
              {!currentSlotTime && (
                <div className="hidden sm:flex items-center gap-2 px-4 py-2 bg-muted/50 rounded-full border border-border">
                  <Clock className="w-4 h-4 text-primary" />
                  <span className="text-sm font-medium">Next: {nextSlot.label}</span>
                </div>
              )}
              
              <Button
                variant="ghost"
                size="icon"
                className="rounded-full"
              >
                {isExpanded ? <ChevronUp /> : <ChevronDown />}
              </Button>
            </div>
          </div>

          {/* Quick Stats */}
          <div className="flex flex-wrap gap-3 mt-4">
            <div className="flex items-center gap-2 px-3 py-1.5 bg-background/50 rounded-full border border-border/50 text-xs">
              <Zap className="w-3.5 h-3.5 text-amber-500" />
              <span>3 Slots Daily</span>
            </div>
            <div className="flex items-center gap-2 px-3 py-1.5 bg-background/50 rounded-full border border-border/50 text-xs">
              <Clock className="w-3.5 h-3.5 text-primary" />
              <span>9 AM • 2 PM • 7 PM</span>
            </div>
            <div className="flex items-center gap-2 px-3 py-1.5 bg-background/50 rounded-full border border-border/50 text-xs">
              <Users className="w-3.5 h-3.5 text-accent" />
              <span>First Click Wins</span>
            </div>
          </div>
        </div>

        {/* Expandable Content */}
        <AnimatePresence>
          {isExpanded && (
            <motion.div
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: "auto", opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              transition={{ duration: 0.3 }}
              className="relative"
            >
              <div className="px-6 pb-6 space-y-6">
                {/* Category Selector for Non-Audience Users */}
                {!isAudience && (
                  <motion.div
                    className="p-4 bg-gradient-to-br from-violet-500/10 to-purple-500/10 rounded-2xl border border-violet-500/30"
                    initial={{ opacity: 0, y: -10 }}
                    animate={{ opacity: 1, y: 0 }}
                  >
                    <div className="flex items-center justify-between mb-3">
                      <div className="flex items-center gap-2">
                        <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-violet-500 to-purple-500 flex items-center justify-center">
                          <Sparkles className="w-4 h-4 text-white" />
                        </div>
                        <div>
                          <h4 className="font-semibold text-sm">Your Perspective</h4>
                          <p className="text-xs text-muted-foreground">Vote as your role or general audience</p>
                        </div>
                      </div>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => setShowCategorySelector(!showCategorySelector)}
                        className="text-xs"
                      >
                        {showCategorySelector ? 'Hide Options' : 'Change Category'}
                      </Button>
                    </div>
                    
                    {/* Current Selection */}
                    {selectedCategory && !showCategorySelector && (
                      <div className="flex items-center gap-2 px-3 py-2 bg-background/50 rounded-lg border border-border/50">
                        {(() => {
                          const cat = categoryOptions.find(c => c.id === selectedCategory);
                          if (!cat) return null;
                          const Icon = cat.icon;
                          return (
                            <>
                              <Icon className="w-4 h-4 text-primary" />
                              <span className="text-sm font-medium">{cat.label}</span>
                              <span className="text-xs text-muted-foreground">- {cat.description}</span>
                            </>
                          );
                        })()}
                      </div>
                    )}
                    
                    {/* Category Options */}
                    <AnimatePresence>
                      {showCategorySelector && (
                        <motion.div
                          initial={{ height: 0, opacity: 0 }}
                          animate={{ height: 'auto', opacity: 1 }}
                          exit={{ height: 0, opacity: 0 }}
                          className="grid grid-cols-2 sm:grid-cols-4 gap-2 mt-3"
                        >
                          {categoryOptions.map((cat) => {
                            const Icon = cat.icon;
                            const isSelected = selectedCategory === cat.id;
                            return (
                              <motion.button
                                key={cat.id}
                                onClick={() => {
                                  setSelectedCategory(cat.id);
                                  setShowCategorySelector(false);
                                }}
                                className={`p-3 rounded-xl border text-left transition-all ${
                                  isSelected 
                                    ? 'bg-primary/20 border-primary/50' 
                                    : 'bg-background/50 border-border/50 hover:border-primary/30'
                                }`}
                                whileHover={{ scale: 1.02 }}
                                whileTap={{ scale: 0.98 }}
                              >
                                <Icon className={`w-5 h-5 mb-1 ${isSelected ? 'text-primary' : 'text-muted-foreground'}`} />
                                <p className="text-xs font-medium">{cat.label}</p>
                              </motion.button>
                            );
                          })}
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </motion.div>
                )}

                {/* Active Slot Timer (if within slot window) - Only for audience */}
                {currentSlotTime && isAudience && (
                  <YourTurnSlotTimer
                    slotTime={currentSlotTime}
                    slotLabel={getSlotLabel(currentSlotTime)}
                    userId={userId}
                    onAttempt={async () => {
                      const slot = await ensureSlotExists(currentSlotTime);
                      if (slot) {
                        return attemptJoin(slot.id);
                      }
                      return { success: false, isWinner: false };
                    }}
                    slotInfo={getSlotInfo(currentSlotTime)}
                  />
                )}

                {/* Winner Question Form */}
                {isWinner && !hasSubmittedQuestion && wonSlotId && (
                  <YourTurnQuestionForm
                    slotId={wonSlotId}
                    onSubmit={submitQuestion}
                  />
                )}

                {/* Today's Questions for Voting */}
                {todayQuestions.length > 0 && canVote && (
                  <div className="space-y-4">
                    <div className="flex items-center gap-2">
                      <div className="w-1 h-6 bg-gradient-to-b from-primary to-accent rounded-full" />
                      <h3 className="font-bold text-lg">Today's Questions</h3>
                      <span className="text-xs text-muted-foreground">
                        ({todayQuestions.length} question{todayQuestions.length > 1 ? 's' : ''})
                      </span>
                    </div>
                    
                    <div className="space-y-4">
                      {todayQuestions.map((question) => (
                        <YourTurnVoting
                          key={question.id}
                          question={question}
                          userVote={userVotes[question.id]}
                          onVote={(optionId) => voteOnQuestion(question.id, optionId)}
                          isAudience={isAudience}
                        />
                      ))}
                    </div>
                  </div>
                )}

                {/* No Questions Yet */}
                {todayQuestions.length === 0 && !currentSlotTime && (
                  <div className="text-center py-8">
                    <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-muted/50 flex items-center justify-center">
                      <Clock className="w-8 h-8 text-muted-foreground" />
                    </div>
                    <h4 className="font-semibold text-foreground mb-2">No Questions Yet Today</h4>
                    <p className="text-sm text-muted-foreground max-w-md mx-auto">
                      Questions appear after each slot winner submits their question.
                      Next opportunity: <span className="text-primary font-medium">{nextSlot.label}</span>
                    </p>
                  </div>
                )}

                {/* Slot Results Summary */}
                <YourTurnResults 
                  slots={slots} 
                  questions={questions}
                  getSlotLabel={getSlotLabel}
                />

                {/* Rules/Guidelines */}
                <div className="p-4 bg-muted/30 rounded-xl border border-border/50">
                  <h4 className="font-semibold text-sm mb-3 flex items-center gap-2">
                    <span className="text-lg">📋</span> Content Guidelines
                  </h4>
                  <div className="grid sm:grid-cols-2 gap-3 text-xs">
                    <div>
                      <p className="text-green-500 font-medium mb-1">✅ Allowed</p>
                      <ul className="text-muted-foreground space-y-0.5">
                        <li>• Movies, OTT, TV Shows</li>
                        <li>• Music, Gaming, Celebrities</li>
                        <li>• Entertainment opinions</li>
                      </ul>
                    </div>
                    <div>
                      <p className="text-red-500 font-medium mb-1">❌ Not Allowed</p>
                      <ul className="text-muted-foreground space-y-0.5">
                        <li>• Personal questions</li>
                        <li>• Spam or irrelevant topics</li>
                        <li>• Offensive content</li>
                      </ul>
                    </div>
                  </div>
                  <p className="text-[10px] text-muted-foreground mt-3 pt-2 border-t border-border/50">
                    ⚠️ Inappropriate questions will be removed by admins
                  </p>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </motion.div>
  );
};
