import { useState, useEffect, useCallback, memo } from "react";
import { supabase } from "@/integrations/supabase/client";
import { motion, AnimatePresence } from "framer-motion";
import { Check, Users, TrendingUp, Sparkles, Filter, X, ChevronRight, Globe, Zap } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import confetti from "canvas-confetti";
import { triggerHaptic } from "./InphroSyncPremium";
import { useIsMobile } from "@/hooks/use-mobile";

interface Option {
  id: string;
  label: string;
}

interface Question {
  id: string;
  question_type: string;
  question_text: string;
  options: Option[];
}

interface PremiumQuestionCardProps {
  question: Question;
  questionNumber: number;
  totalQuestions: number;
  isAudience: boolean;
  onAnswered?: () => void;
}

interface OptionCount {
  option_id: string;
  count: number;
}

// Emoji mapping helper
const getOptionEmoji = (label: string): string => {
  const mappings: Record<string, string> = {
    "Cinematic": "🎬", "Adventure": "🎬", "Fun": "😄", "Comedy": "😄",
    "Emotional": "😢", "Drama": "😢", "Dark": "🌑", "Intense": "🌑",
    "Chill": "😌", "Relax": "😌", "Thriller": "😱", "Excitement": "😱",
    "Sci-Fi": "🚀", "Curiosity": "🚀", "Mobile": "📱", "TV": "📺",
    "Laptop": "💻", "Tablet": "📱", "Smart Speaker": "🔊",
    "Netflix": "🎬", "Prime": "📦", "Amazon": "📦", "YouTube": "▶️",
    "Instagram": "📷", "Hotstar": "⭐", "Spotify": "🎵",
    "JioCinema": "🎥", "Zee5": "📺", "Facebook": "👥",
  };
  
  for (const [key, emoji] of Object.entries(mappings)) {
    if (label.includes(key)) return emoji;
  }
  return "✨";
};

function PremiumQuestionCardComponent({
  question,
  questionNumber,
  totalQuestions,
  isAudience,
  onAnswered,
}: PremiumQuestionCardProps) {
  const [selectedOption, setSelectedOption] = useState<string | null>(null);
  const [hasAnswered, setHasAnswered] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [showResults, setShowResults] = useState(false);
  const [optionCounts, setOptionCounts] = useState<OptionCount[]>([]);
  const [showFilters, setShowFilters] = useState(false);
  const [filterAge, setFilterAge] = useState<string | null>(null);
  const [filterGender, setFilterGender] = useState<string | null>(null);
  const [availableFilters, setAvailableFilters] = useState<{
    ages: string[];
    genders: string[];
  }>({ ages: [], genders: [] });
  const isMobile = useIsMobile();

  useEffect(() => {
    checkIfAnswered();
    fetchCounts();
    const cleanup = setupRealtimeSubscription();
    
    const interval = setInterval(fetchCounts, 3000);
    
    return () => {
      cleanup();
      clearInterval(interval);
    };
  }, [question.id]);

  useEffect(() => {
    if (showResults) fetchCounts();
  }, [filterAge, filterGender]);

  const checkIfAnswered = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      const today = new Date().toISOString().split('T')[0];
      const { data } = await supabase
        .from("inphrosync_responses")
        .select("selected_option")
        .eq("user_id", user.id)
        .eq("question_type", question.question_type)
        .eq("response_date", today)
        .maybeSingle();

      if (data) {
        setSelectedOption(data.selected_option);
        setHasAnswered(true);
        setShowResults(true);
      }
    } catch (error) {
      console.error("Error checking answer:", error);
    }
  };

  const fetchCounts = async () => {
    try {
      const today = new Date().toISOString().split('T')[0];
      const { data: responses } = await supabase
        .from("inphrosync_responses")
        .select("selected_option, user_id")
        .eq("question_type", question.question_type)
        .eq("response_date", today);

      const userIds = [...new Set(responses?.map(r => r.user_id) || [])];
      
      const { data: allProfiles } = await supabase
        .from("profiles")
        .select("id, age_group, gender")
        .in("id", userIds);

      // Build available filters
      const ages = new Set<string>();
      const genders = new Set<string>();
      allProfiles?.forEach(p => {
        if (p.age_group) ages.add(p.age_group);
        if (p.gender) genders.add(p.gender.toLowerCase().trim());
      });
      setAvailableFilters({
        ages: Array.from(ages).sort(),
        genders: Array.from(genders).sort(),
      });

      // Apply filters
      let profileQuery = supabase
        .from("profiles")
        .select("id")
        .in("id", userIds);

      if (filterAge) profileQuery = profileQuery.eq("age_group", filterAge);
      if (filterGender) profileQuery = profileQuery.ilike("gender", filterGender);

      const { data: filteredProfiles } = await profileQuery;
      const filteredUserIds = new Set(filteredProfiles?.map(p => p.id) || []);

      // Count options
      const counts: Record<string, number> = {};
      question.options.forEach(opt => { counts[opt.id] = 0; });
      
      responses?.forEach(r => {
        if (filteredUserIds.has(r.user_id) && counts[r.selected_option] !== undefined) {
          counts[r.selected_option]++;
        }
      });

      setOptionCounts(Object.entries(counts).map(([option_id, count]) => ({ option_id, count })));
    } catch (error) {
      console.error("Error fetching counts:", error);
    }
  };

  const setupRealtimeSubscription = () => {
    const channel = supabase
      .channel(`premium_question_${question.question_type}`)
      .on('postgres_changes', {
        event: '*',
        schema: 'public',
        table: 'inphrosync_responses',
        filter: `question_type=eq.${question.question_type}`,
      }, fetchCounts)
      .subscribe();

    return () => { supabase.removeChannel(channel); };
  };

  const handleOptionSelect = useCallback(async (optionId: string) => {
    if (!isAudience || hasAnswered || submitting) return;

    setSubmitting(true);
    triggerHaptic('medium');
    
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error("Not authenticated");

      const today = new Date().toISOString().split('T')[0];
      const { error } = await supabase.from("inphrosync_responses").insert({
        user_id: user.id,
        question_type: question.question_type,
        selected_option: optionId,
        response_date: today,
      });

      if (error) throw error;

      setSelectedOption(optionId);
      setHasAnswered(true);

      // Premium confetti burst
      confetti({
        particleCount: 80,
        spread: 70,
        origin: { y: 0.6, x: 0.5 },
        colors: ['#19E3EC', '#C07CFF', '#6366f1', '#fbbf24'],
        disableForReducedMotion: true,
      });

      toast.success("✨ Your voice has been heard!", {
        description: "See how you compare with others",
        duration: 4000,
      });

      setTimeout(() => {
        setShowResults(true);
        fetchCounts();
        onAnswered?.();
      }, 1000);
    } catch (error: any) {
      toast.error(error.message || "Failed to submit");
    } finally {
      setSubmitting(false);
    }
  }, [isAudience, hasAnswered, submitting, question, onAnswered]);

  const totalCount = optionCounts.reduce((sum, o) => sum + o.count, 0);
  const maxCount = Math.max(...optionCounts.map(o => o.count), 1);
  const hasFilters = filterAge || filterGender;

  // Question Selection View
  if (!showResults) {
    return (
      <motion.div
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: -30 }}
        className="relative"
      >
        <div className="glass-card rounded-3xl p-6 md:p-8 border border-border/50 overflow-hidden">
          {/* Animated gradient background */}
          <div className="absolute inset-0 bg-gradient-to-br from-primary/5 via-transparent to-accent/5 pointer-events-none" />
          
          {/* Question Header */}
          <div className="relative z-10 mb-8">
            <div className="flex items-center justify-between mb-4">
              <Badge className="bg-primary/10 text-primary border-primary/20">
                Question {questionNumber} of {totalQuestions}
              </Badge>
              <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
                <motion.div
                  className="w-2 h-2 rounded-full bg-green-500"
                  animate={{ scale: [1, 1.2, 1], opacity: [1, 0.7, 1] }}
                  transition={{ duration: 1.5, repeat: Infinity }}
                />
                <span>{totalCount} live</span>
              </div>
            </div>
            
            <h3 className="text-xl md:text-2xl font-bold leading-tight">
              {question.question_text}
            </h3>
          </div>

          {/* Options Grid - Premium Card Style */}
          <div className="relative z-10 grid grid-cols-2 md:grid-cols-3 gap-3 md:gap-4">
            {question.options.map((option, idx) => {
              const optionCount = optionCounts.find(c => c.option_id === option.id)?.count || 0;
              const percentage = totalCount > 0 ? Math.round((optionCount / totalCount) * 100) : 0;
              
              return (
                <motion.button
                  key={option.id}
                  onClick={() => handleOptionSelect(option.id)}
                  disabled={!isAudience || hasAnswered || submitting}
                  className={`
                    relative overflow-hidden rounded-2xl p-4 md:p-5 text-left transition-all
                    border-2 group
                    ${!isAudience || hasAnswered 
                      ? 'opacity-60 cursor-not-allowed border-border/30' 
                      : 'cursor-pointer border-border/50 hover:border-primary/50 hover:bg-primary/5 active:scale-[0.98]'
                    }
                  `}
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ delay: idx * 0.05 }}
                  whileHover={isAudience && !hasAnswered ? { y: -2 } : undefined}
                >
                  {/* Background gradient on hover */}
                  <div className="absolute inset-0 bg-gradient-to-br from-primary/0 to-accent/0 group-hover:from-primary/5 group-hover:to-accent/5 transition-all" />
                  
                  {/* Live count preview (subtle) */}
                  {totalCount > 0 && (
                    <div 
                      className="absolute bottom-0 left-0 right-0 h-1 bg-primary/10 overflow-hidden"
                    >
                      <motion.div
                        className="h-full bg-primary/30"
                        initial={{ width: 0 }}
                        animate={{ width: `${percentage}%` }}
                        transition={{ duration: 0.5, delay: 0.2 + idx * 0.05 }}
                      />
                    </div>
                  )}
                  
                  <div className="relative z-10">
                    <span className="text-3xl md:text-4xl block mb-2">
                      {getOptionEmoji(option.label)}
                    </span>
                    <span className="text-sm md:text-base font-medium block leading-tight">
                      {option.label}
                    </span>
                    
                    {/* Subtle live count */}
                    {totalCount > 0 && (
                      <span className="text-[10px] text-muted-foreground mt-1 block opacity-60">
                        {optionCount} votes
                      </span>
                    )}
                  </div>
                </motion.button>
              );
            })}
          </div>

          {/* Not audience notice */}
          {!isAudience && (
            <motion.div
              className="relative z-10 mt-6 p-4 rounded-xl bg-accent/5 border border-accent/20 text-center"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.3 }}
            >
              <p className="text-sm text-muted-foreground">
                Switch to an <span className="text-accent font-medium">Audience profile</span> to participate
              </p>
            </motion.div>
          )}
        </div>
      </motion.div>
    );
  }

  // Results View - Premium Stats Display
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="glass-card rounded-3xl border border-border/50 overflow-hidden"
    >
      {/* Header with success state */}
      <div className="p-6 border-b border-border/30 bg-gradient-to-r from-primary/5 to-accent/5">
        <div className="flex items-center gap-4">
          <motion.div
            className="w-14 h-14 rounded-2xl bg-gradient-to-br from-green-500 to-emerald-600 flex items-center justify-center shadow-lg"
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ type: "spring", delay: 0.1 }}
          >
            <Check className="w-7 h-7 text-white" />
          </motion.div>
          <div className="flex-1">
            <h3 className="font-bold text-lg">Response Recorded!</h3>
            <p className="text-sm text-muted-foreground">
              Q{questionNumber}: {question.question_text}
            </p>
          </div>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setShowResults(false)}
            className="gap-1"
          >
            <span className="text-xs">Options</span>
            <ChevronRight className="w-3 h-3" />
          </Button>
        </div>
      </div>

      {/* Live Stats Section */}
      <div className="p-6 space-y-6">
        {/* Stats Header */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Globe className="w-5 h-5 text-primary" />
            <h4 className="font-semibold">Live Audience Results</h4>
            <motion.div
              className="flex items-center gap-1 px-2 py-0.5 rounded-full bg-green-500/10 text-green-500 text-xs"
              animate={{ opacity: [1, 0.6, 1] }}
              transition={{ duration: 2, repeat: Infinity }}
            >
              <span className="w-1.5 h-1.5 rounded-full bg-green-500" />
              <span>{totalCount} live</span>
            </motion.div>
          </div>
          
          <Button
            variant={showFilters ? "default" : "outline"}
            size="sm"
            onClick={() => setShowFilters(!showFilters)}
            className="gap-1.5"
          >
            <Filter className="w-3.5 h-3.5" />
            {showFilters ? "Hide" : "Filter"}
          </Button>
        </div>

        {/* Filters Panel */}
        <AnimatePresence>
          {showFilters && (
            <motion.div
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: "auto", opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              className="overflow-hidden"
            >
              <div className="p-4 rounded-xl bg-muted/20 border border-border/30 space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium">Filter Results</span>
                  {hasFilters && (
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => { setFilterAge(null); setFilterGender(null); }}
                      className="h-7 px-2 text-xs"
                    >
                      <X className="w-3 h-3 mr-1" />
                      Clear
                    </Button>
                  )}
                </div>
                
                <div className="flex flex-wrap gap-2">
                  {availableFilters.ages.map(age => (
                    <Badge
                      key={age}
                      variant={filterAge === age ? "default" : "outline"}
                      className="cursor-pointer"
                      onClick={() => setFilterAge(filterAge === age ? null : age)}
                    >
                      {age}
                    </Badge>
                  ))}
                  {availableFilters.genders.map(gender => (
                    <Badge
                      key={gender}
                      variant={filterGender === gender ? "default" : "outline"}
                      className="cursor-pointer capitalize"
                      onClick={() => setFilterGender(filterGender === gender ? null : gender)}
                    >
                      {gender}
                    </Badge>
                  ))}
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Results Bars - Premium Style */}
        <div className="space-y-4">
          {question.options.map((option, idx) => {
            const optionCount = optionCounts.find(c => c.option_id === option.id)?.count || 0;
            const percentage = totalCount > 0 ? Math.round((optionCount / totalCount) * 100) : 0;
            const isUserChoice = selectedOption === option.id;
            const isLeading = optionCount === maxCount && optionCount > 0;
            
            return (
              <motion.div
                key={option.id}
                className={`relative rounded-xl overflow-hidden ${isUserChoice ? 'ring-2 ring-primary/50' : ''}`}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: idx * 0.1 }}
              >
                {/* Background track */}
                <div className="relative bg-muted/30 rounded-xl p-4">
                  {/* Progress fill */}
                  <motion.div
                    className={`absolute inset-y-0 left-0 rounded-xl ${
                      isUserChoice 
                        ? 'bg-gradient-to-r from-primary/30 to-accent/30' 
                        : 'bg-muted/50'
                    }`}
                    initial={{ width: 0 }}
                    animate={{ width: `${percentage}%` }}
                    transition={{ duration: 0.8, delay: 0.2 + idx * 0.1, ease: "easeOut" }}
                  />
                  
                  {/* Content */}
                  <div className="relative z-10 flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <span className="text-2xl">{getOptionEmoji(option.label)}</span>
                      <div>
                        <span className="font-medium">{option.label}</span>
                        {isUserChoice && (
                          <Badge className="ml-2 bg-primary/20 text-primary border-primary/30 text-[10px]">
                            Your choice
                          </Badge>
                        )}
                      </div>
                    </div>
                    
                    <div className="flex items-center gap-3">
                      <div className="text-right">
                        <motion.span
                          className="text-lg font-bold"
                          key={optionCount}
                          initial={{ scale: 1.3, color: "hsl(var(--primary))" }}
                          animate={{ scale: 1, color: "hsl(var(--foreground))" }}
                        >
                          {percentage}%
                        </motion.span>
                        <p className="text-xs text-muted-foreground">{optionCount} votes</p>
                      </div>
                      {isLeading && (
                        <motion.div
                          initial={{ scale: 0 }}
                          animate={{ scale: 1 }}
                          transition={{ type: "spring", delay: 0.5 }}
                        >
                          <TrendingUp className="w-5 h-5 text-green-500" />
                        </motion.div>
                      )}
                    </div>
                  </div>
                </div>
              </motion.div>
            );
          })}
        </div>

        {/* Footer note */}
        <div className="flex items-center justify-center gap-2 pt-4 text-xs text-muted-foreground">
          <Zap className="w-3 h-3" />
          <span>Results update in real-time</span>
        </div>
      </div>
    </motion.div>
  );
}

export const PremiumQuestionCard = memo(PremiumQuestionCardComponent);
