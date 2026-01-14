import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { toast } from "sonner";
import { motion, AnimatePresence } from "framer-motion";
import { Check, TrendingUp, Users, Award, Sparkles, ChevronRight, Filter, X } from "lucide-react";
import confetti from "canvas-confetti";
import { SwipeableQuestion } from "./SwipeableQuestion";

interface Question {
  id: string;
  question_type: string;
  question_text: string;
  options: Array<{ id: string; label: string }>;
}

interface DailyQuestionNewProps {
  question: Question;
  isAudience: boolean;
  questionNumber: number;
  totalQuestions: number;
}

interface OptionCount {
  option_id: string;
  count: number;
}

interface UserProfile {
  age_group: string;
  gender: string;
  country: string;
}

export function DailyQuestionNew({ 
  question, 
  isAudience,
  questionNumber,
  totalQuestions
}: DailyQuestionNewProps) {
  const [selectedOption, setSelectedOption] = useState<string | null>(null);
  const [hasAnswered, setHasAnswered] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [showResults, setShowResults] = useState(false);
  const [optionCounts, setOptionCounts] = useState<OptionCount[]>([]);
  const [showFilters, setShowFilters] = useState(false);
  const [filterAge, setFilterAge] = useState<string | null>(null);
  const [filterGender, setFilterGender] = useState<string | null>(null);
  const [filterCountry, setFilterCountry] = useState<string | null>(null);
  const [availableCountries, setAvailableCountries] = useState<string[]>([]);
  const [availableAgeGroups, setAvailableAgeGroups] = useState<string[]>([]);
  const [availableGenders, setAvailableGenders] = useState<string[]>([]);

  useEffect(() => {
    checkIfAnswered();
    fetchCounts();
    setupRealtimeSubscription();
  }, [question.id]);

  useEffect(() => {
    // Refetch counts when filters change
    if (showResults) {
      fetchCounts();
    }
  }, [filterAge, filterGender, filterCountry]);

  const checkIfAnswered = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      // Check if user answered TODAY (stored with today's date)
      const today = new Date();
      const todayStr = today.toISOString().split('T')[0];

      const { data, error } = await supabase
        .from("inphrosync_responses")
        .select("selected_option")
        .eq("user_id", user.id)
        .eq("question_type", question.question_type)
        .eq("response_date", todayStr)
        .maybeSingle();

      if (error && error.code !== 'PGRST116') throw error;

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
      // Fetch TODAY's responses
      const today = new Date();
      const todayStr = today.toISOString().split('T')[0];

      // Fetch all responses for today
      const { data: responses, error } = await supabase
        .from("inphrosync_responses")
        .select("selected_option, user_id")
        .eq("question_type", question.question_type)
        .eq("response_date", todayStr);

      if (error) throw error;

      const userIds = [...new Set(responses?.map(r => r.user_id) || [])];
      
      // Fetch all profiles first to get available filter options
      const { data: allProfiles } = await supabase
        .from("profiles")
        .select("id, age_group, gender, country")
        .in("id", userIds);

      // Build available filter options from actual data (normalize gender to lowercase and trim)
      const ages = new Set<string>();
      const genders = new Set<string>();
      const countries = new Set<string>();
      
      allProfiles?.forEach(p => {
        if (p.age_group) ages.add(p.age_group);
        if (p.gender) {
          // Normalize to lowercase and trim whitespace
          const normalizedGender = p.gender.toLowerCase().trim();
          if (normalizedGender) genders.add(normalizedGender);
        }
        if (p.country && p.country !== 'Unknown') countries.add(p.country);
      });

      setAvailableAgeGroups(Array.from(ages).sort());
      setAvailableGenders(Array.from(genders).sort());
      setAvailableCountries(Array.from(countries).sort());

      // Now apply filters if any are active (use ilike for case-insensitive gender filtering)
      let profileQuery = supabase
        .from("profiles")
        .select("id, age_group, gender, country")
        .in("id", userIds);

      if (filterAge) profileQuery = profileQuery.eq("age_group", filterAge);
      if (filterGender) profileQuery = profileQuery.ilike("gender", filterGender); // Case-insensitive match
      if (filterCountry) profileQuery = profileQuery.eq("country", filterCountry);

      const { data: profiles } = await profileQuery;

      // Build filtered user IDs set
      const filteredUserIds = new Set(profiles?.map(p => p.id) || []);

      // Count options based on filtered users
      const countsByOption: Record<string, number> = {};
      question.options.forEach((opt) => {
        countsByOption[opt.id] = 0;
      });

      responses?.forEach((response) => {
        if (filteredUserIds.has(response.user_id) && countsByOption[response.selected_option] !== undefined) {
          countsByOption[response.selected_option]++;
        }
      });

      setOptionCounts(
        Object.entries(countsByOption).map(([option_id, count]) => ({
          option_id,
          count,
        }))
      );
    } catch (error) {
      console.error("Error fetching counts:", error);
    }
  };

  const setupRealtimeSubscription = () => {
    const channel = supabase
      .channel(`inphrosync_${question.question_type}`)
      .on(
        "postgres_changes",
        {
          event: "*",
          schema: "public",
          table: "inphrosync_responses",
          filter: `question_type=eq.${question.question_type}`,
        },
        () => {
          fetchCounts();
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  };

  const handleSubmit = async (optionId: string) => {
    if (!isAudience || hasAnswered || submitting) return;

    setSubmitting(true);
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error("Not authenticated");

      // Store with TODAY's date
      const today = new Date();
      const todayStr = today.toISOString().split('T')[0];

      const { error } = await supabase.from("inphrosync_responses").insert({
        user_id: user.id,
        question_type: question.question_type,
        selected_option: optionId,
        response_date: todayStr,
      });

      if (error) throw error;

      setSelectedOption(optionId);
      setHasAnswered(true);
      
      confetti({
        particleCount: 150,
        spread: 100,
        origin: { y: 0.6 },
        colors: ["#19E3EC", "#C07CFF", "#6366f1", "#fbbf24"],
      });

      toast.success("✨ Amazing! Your voice matters!", {
        description: "Come back tomorrow to continue your streak!",
        duration: 5000,
      });

      setTimeout(() => {
        setShowResults(true);
        fetchCounts();
      }, 1500);
    } catch (error: any) {
      console.error("Error submitting:", error);
      toast.error(error.message || "Failed to record response");
    } finally {
      setSubmitting(false);
    }
  };

  const getTotalCount = () => {
    return optionCounts.reduce((sum, opt) => sum + opt.count, 0);
  };

  const getMaxCount = () => {
    return Math.max(...optionCounts.map((opt) => opt.count), 1);
  };

  const getOptionIcon = (label: string) => {
    if (label.includes("Cinematic") || label.includes("Adventure")) return "🎬";
    if (label.includes("Fun") || label.includes("Comedy")) return "😄";
    if (label.includes("Emotional") || label.includes("Drama")) return "😢";
    if (label.includes("Dark") || label.includes("Intense")) return "🌑";
    if (label.includes("Chill") || label.includes("Relax")) return "😌";
    if (label.includes("Thriller") || label.includes("Excitement")) return "😱";
    if (label.includes("Sci-Fi") || label.includes("Curiosity")) return "🚀";
    if (label.includes("Mobile")) return "📱";
    if (label.includes("TV")) return "📺";
    if (label.includes("Laptop")) return "💻";
    if (label.includes("Tablet")) return "📱";
    if (label.includes("Smart Speaker")) return "🔊";
    if (label.includes("Netflix")) return "🎬";
    if (label.includes("Prime") || label.includes("Amazon")) return "📦";
    if (label.includes("YouTube")) return "▶️";
    if (label.includes("Instagram")) return "📷";
    if (label.includes("Hotstar")) return "⭐";
    if (label.includes("Spotify")) return "🎵";
    if (label.includes("JioCinema")) return "🎥";
    if (label.includes("Zee5")) return "📺";
    if (label.includes("Facebook")) return "👥";
    return "✨";
  };

  const clearFilters = () => {
    setFilterAge(null);
    setFilterGender(null);
    setFilterCountry(null);
  };

  const hasActiveFilters = filterAge || filterGender || filterCountry;

  if (!showResults) {
    return (
      <motion.div
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        exit={{ opacity: 0, scale: 0.9 }}
        transition={{ type: "spring", stiffness: 200 }}
        className="w-full"
      >
        <SwipeableQuestion
          questionText={question.question_text}
          options={question.options}
          questionNumber={questionNumber}
          totalQuestions={totalQuestions}
          onSelect={handleSubmit}
          disabled={!isAudience || hasAnswered}
          selectedOption={selectedOption}
        />
      </motion.div>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="w-full max-w-2xl mx-auto space-y-6"
    >
      {/* Results Header */}
      <Card className="p-6 bg-gradient-to-br from-primary/10 via-background to-accent/10 border-2 border-primary/20">
        <div className="flex items-center gap-4 mb-4">
          <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-primary to-accent flex items-center justify-center flex-shrink-0">
            <Check className="w-6 h-6 text-white" />
          </div>
          <div className="flex-1">
            <h3 className="text-lg font-bold">Your Response Recorded!</h3>
            <p className="text-sm text-muted-foreground">
              Question {questionNumber} of {totalQuestions}
            </p>
          </div>
          <motion.div
            animate={{ scale: [1, 1.2, 1] }}
            transition={{ duration: 2, repeat: Infinity }}
          >
            <Award className="w-8 h-8 text-yellow-500" />
          </motion.div>
        </div>
        
        <div className="flex items-center justify-between pt-4 border-t border-border">
          <div className="flex items-center gap-2 text-sm">
            <Users className="w-4 h-4 text-muted-foreground" />
            <span className="text-muted-foreground">
              <motion.span
                key={getTotalCount()}
                initial={{ scale: 1.5, color: "hsl(var(--primary))" }}
                animate={{ scale: 1, color: "hsl(var(--muted-foreground))" }}
                className="font-bold"
              >
                {getTotalCount()}
              </motion.span>
              {" "}people responded
            </span>
          </div>
          <Button
            size="sm"
            variant="ghost"
            onClick={() => setShowResults(false)}
            className="gap-2"
          >
            <span>View Options</span>
            <ChevronRight className="w-4 h-4" />
          </Button>
        </div>
      </Card>

      {/* Live Results */}
      <Card className="p-6 border-2 border-border">
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-2">
            <TrendingUp className="w-5 h-5 text-primary" />
            <h4 className="font-bold text-lg">Live Audience Results</h4>
          </div>
          <Button
            size="sm"
            variant={showFilters ? "default" : "outline"}
            onClick={() => setShowFilters(!showFilters)}
            className="gap-2"
          >
            <Filter className="w-4 h-4" />
            {showFilters ? "Hide" : "Show"} Filters
          </Button>
        </div>

        {/* Filters Section */}
        <AnimatePresence>
          {showFilters && (
            <motion.div
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: "auto", opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              className="mb-6 overflow-hidden"
            >
              <div className="p-4 bg-muted/30 rounded-xl space-y-4">
                <div className="flex items-center justify-between">
                  <h5 className="text-sm font-semibold">Filter by Demographics</h5>
                  {hasActiveFilters && (
                    <Button
                      size="sm"
                      variant="ghost"
                      onClick={clearFilters}
                      className="gap-2 h-8"
                    >
                      <X className="w-3 h-3" />
                      Clear
                    </Button>
                  )}
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  {/* Age Filter */}
                  <div className="space-y-2">
                    <label className="text-xs text-muted-foreground uppercase">Age Group</label>
                    <div className="flex flex-wrap gap-2">
                      {availableAgeGroups.length > 0 ? (
                        availableAgeGroups.map((age) => (
                          <Badge
                            key={age}
                            variant={filterAge === age ? "default" : "outline"}
                            className="cursor-pointer"
                            onClick={() => setFilterAge(filterAge === age ? null : age)}
                          >
                            {age}
                          </Badge>
                        ))
                      ) : (
                        <p className="text-xs text-muted-foreground">No age data available</p>
                      )}
                    </div>
                  </div>

                  {/* Gender Filter */}
                  <div className="space-y-2">
                    <label className="text-xs text-muted-foreground uppercase">Gender</label>
                    <div className="flex flex-wrap gap-2">
                      {availableGenders.length > 0 ? (
                        availableGenders.map((gender) => (
                          <Badge
                            key={gender}
                            variant={filterGender === gender ? "default" : "outline"}
                            className="cursor-pointer capitalize"
                            onClick={() => setFilterGender(filterGender === gender ? null : gender)}
                          >
                            {gender}
                          </Badge>
                        ))
                      ) : (
                        <p className="text-xs text-muted-foreground">No gender data available</p>
                      )}
                    </div>
                  </div>

                  {/* Country Filter - Only show available countries */}
                  <div className="space-y-2">
                    <label className="text-xs text-muted-foreground uppercase">Location</label>
                    <div className="flex flex-wrap gap-2">
                      {availableCountries.length > 0 ? (
                        availableCountries.map((country) => (
                          <Badge
                            key={country}
                            variant={filterCountry === country ? "default" : "outline"}
                            className="cursor-pointer"
                            onClick={() => setFilterCountry(filterCountry === country ? null : country)}
                          >
                            {country}
                          </Badge>
                        ))
                      ) : (
                        <p className="text-xs text-muted-foreground">No location data available</p>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        <div className="space-y-4">
          {question.options.map((option) => {
            const optionData = optionCounts.find(c => c.option_id === option.id);
            const optionCount = optionData?.count || 0;
            const isSelected = selectedOption === option.id;
            const barWidth = getTotalCount() > 0 ? (optionCount / getMaxCount()) * 100 : 0;

            return (
              <motion.div
                key={option.id}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                className={`
                  relative p-4 rounded-xl border-2 transition-all
                  ${isSelected 
                    ? "border-primary bg-primary/5" 
                    : "border-border bg-background"
                  }
                `}
              >
                {/* Progress bar background */}
                <motion.div
                  className={`absolute inset-0 rounded-xl ${
                    isSelected ? "bg-primary/10" : "bg-muted/30"
                  }`}
                  initial={{ width: 0 }}
                  animate={{ width: `${barWidth}%` }}
                  transition={{ duration: 1, ease: "easeOut" }}
                />

                {/* Content */}
                <div className="relative flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <span className="text-3xl">{getOptionIcon(option.label)}</span>
                    <div>
                      <p className="font-semibold flex items-center gap-2">
                        {option.label}
                        {isSelected && (
                          <span className="px-2 py-0.5 bg-primary text-primary-foreground text-xs rounded-full">
                            Your choice
                          </span>
                        )}
                      </p>
                      <p className="text-xs text-muted-foreground">
                        {optionCount} {optionCount === 1 ? "person" : "people"}
                      </p>
                    </div>
                  </div>
                  
                  <motion.div
                    className="text-2xl font-bold text-primary"
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    transition={{ type: "spring", delay: 0.3 }}
                  >
                    {optionCount}
                  </motion.div>
                </div>
              </motion.div>
            );
          })}
        </div>
      </Card>
    </motion.div>
  );
}