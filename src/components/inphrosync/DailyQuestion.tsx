import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { toast } from "sonner";
import { motion, AnimatePresence } from "framer-motion";
import { Check, TrendingUp, Users, MapPin, Calendar, Sparkles } from "lucide-react";
import confetti from "canvas-confetti";

interface Question {
  id: string;
  question_type: string;
  question_text: string;
  options: Array<{ id: string; label: string }>;
}

interface DailyQuestionProps {
  question: Question;
  isAudience: boolean;
}

interface OptionCount {
  option_id: string;
  count: number;
  age_groups?: Record<string, number>;
  genders?: Record<string, number>;
  locations?: Record<string, number>;
}

export function DailyQuestion({ question, isAudience }: DailyQuestionProps) {
  const [selectedOption, setSelectedOption] = useState<string | null>(null);
  const [hasAnswered, setHasAnswered] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [optionCounts, setOptionCounts] = useState<OptionCount[]>([]);
  const [ageFilter, setAgeFilter] = useState<string>("all");
  const [genderFilter, setGenderFilter] = useState<string>("all");
  const [locationFilter, setLocationFilter] = useState<string>("all");
  const [showCelebration, setShowCelebration] = useState(false);
  const [locations, setLocations] = useState<string[]>([]);

  useEffect(() => {
    checkIfAnswered();
    fetchCounts();
    setupRealtimeSubscription();
  }, [question.id]);

  useEffect(() => {
    fetchCounts();
  }, [ageFilter, genderFilter, locationFilter]);

  const checkIfAnswered = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      // Check if user has answered TODAY (responses are stored with today's date)
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
      }
    } catch (error) {
      console.error("Error checking answer:", error);
    }
  };

  const fetchCounts = async () => {
    try {
      // Fetch TODAY's responses (users answering today about yesterday's experience)
      const today = new Date();
      const todayStr = today.toISOString().split('T')[0];

      const { data: responses, error } = await supabase
        .from("inphrosync_responses")
        .select("selected_option, user_id")
        .eq("question_type", question.question_type)
        .eq("response_date", todayStr);

      if (error) throw error;

      if (!responses || responses.length === 0) {
        setOptionCounts(
          question.options.map((opt) => ({
            option_id: opt.id,
            count: 0,
          }))
        );
        return;
      }

      const userIds = responses.map((r) => r.user_id);
      const { data: profiles, error: profileError } = await supabase
        .from("profiles")
        .select("id, age_group, gender, city, country")
        .in("id", userIds);

      if (profileError) throw profileError;

      const profileMap = new Map(profiles?.map((p) => [p.id, p]) || []);

      const uniqueLocations = new Set<string>();
      profiles?.forEach((p) => {
        if (p.city && p.country) {
          uniqueLocations.add(`${p.city}, ${p.country}`);
        } else if (p.country) {
          uniqueLocations.add(p.country);
        }
      });
      setLocations(Array.from(uniqueLocations).sort());

      const countsByOption: Record<string, OptionCount> = {};

      question.options.forEach((opt) => {
        countsByOption[opt.id] = {
          option_id: opt.id,
          count: 0,
          age_groups: {},
          genders: {},
          locations: {},
        };
      });

      responses.forEach((response) => {
        const profile = profileMap.get(response.user_id);
        if (!profile) return;

        if (ageFilter !== "all" && profile.age_group !== ageFilter) return;
        if (genderFilter !== "all" && profile.gender !== genderFilter) return;
        
        const userLocation = profile.city && profile.country
          ? `${profile.city}, ${profile.country}`
          : profile.country || "";
        if (locationFilter !== "all" && userLocation !== locationFilter) return;

        const optionData = countsByOption[response.selected_option];
        if (optionData) {
          optionData.count++;
          
          if (profile.age_group) {
            optionData.age_groups![profile.age_group] = 
              (optionData.age_groups![profile.age_group] || 0) + 1;
          }
          if (profile.gender) {
            optionData.genders![profile.gender] = 
              (optionData.genders![profile.gender] || 0) + 1;
          }
          if (userLocation) {
            optionData.locations![userLocation] = 
              (optionData.locations![userLocation] || 0) + 1;
          }
        }
      });

      setOptionCounts(Object.values(countsByOption));
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

      // Store response with TODAY's date (when user is submitting)
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
      setShowCelebration(true);

      confetti({
        particleCount: 100,
        spread: 70,
        origin: { y: 0.6 },
        colors: ["#19E3EC", "#C07CFF", "#6366f1"],
      });

      toast.success("✨ Response recorded! Come back tomorrow!", {
        duration: 4000,
      });

      fetchCounts();

      setTimeout(() => setShowCelebration(false), 3000);
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

  const getOptionIcon = (optionLabel: string) => {
    if (optionLabel.includes("Cinematic") || optionLabel.includes("Adventure")) return "🎬";
    if (optionLabel.includes("Fun") || optionLabel.includes("Comedy")) return "😄";
    if (optionLabel.includes("Emotional") || optionLabel.includes("Drama")) return "😢";
    if (optionLabel.includes("Dark") || optionLabel.includes("Intense")) return "🌑";
    if (optionLabel.includes("Chill") || optionLabel.includes("Relax")) return "😌";
    if (optionLabel.includes("Thriller") || optionLabel.includes("Excitement")) return "😱";
    if (optionLabel.includes("Sci-Fi") || optionLabel.includes("Curiosity")) return "🚀";
    if (optionLabel.includes("Mobile")) return "📱";
    if (optionLabel.includes("TV")) return "📺";
    if (optionLabel.includes("Laptop")) return "💻";
    if (optionLabel.includes("Tablet")) return "📱";
    if (optionLabel.includes("Smart Speaker")) return "🔊";
    if (optionLabel.includes("Netflix")) return "🎬";
    if (optionLabel.includes("Prime") || optionLabel.includes("Amazon")) return "📦";
    if (optionLabel.includes("YouTube")) return "▶️";
    if (optionLabel.includes("Instagram")) return "📷";
    if (optionLabel.includes("Hotstar")) return "⭐";
    if (optionLabel.includes("Spotify")) return "🎵";
    if (optionLabel.includes("JioCinema")) return "🎥";
    if (optionLabel.includes("Zee5")) return "📺";
    if (optionLabel.includes("Facebook")) return "👥";
    return "✨";
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
    >
      <Card className="relative overflow-hidden border-2 border-border/50 bg-gradient-to-br from-background via-background to-muted/10 shadow-xl">
        <div className="absolute inset-0 bg-gradient-to-br from-primary/5 via-transparent to-accent/5 pointer-events-none" />
        
        <div className="relative p-6 pb-4 border-b border-border/50">
          <div className="flex items-start gap-3">
            <motion.div
              className="w-12 h-12 rounded-xl bg-gradient-to-br from-primary to-accent flex items-center justify-center flex-shrink-0"
              animate={{ rotate: [0, 5, -5, 0] }}
              transition={{ duration: 2, repeat: Infinity, repeatDelay: 3 }}
            >
              <Sparkles className="w-6 h-6 text-white" />
            </motion.div>
            <div className="flex-1">
              <h3 className="text-xl font-bold mb-2">{question.question_text}</h3>
              <div className="flex items-center gap-4 text-sm text-muted-foreground">
                <div className="flex items-center gap-1">
                  <Calendar className="w-4 h-4" />
                  <span>Based on Yesterday</span>
                </div>
                <div className="flex items-center gap-1">
                  <Users className="w-4 h-4" />
                  <motion.span
                    key={getTotalCount()}
                    initial={{ scale: 1.3, color: "hsl(var(--primary))" }}
                    animate={{ scale: 1, color: "hsl(var(--muted-foreground))" }}
                    transition={{ duration: 0.3 }}
                  >
                    {getTotalCount()} responses
                  </motion.span>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="p-6 space-y-6">
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3">
            {question.options.map((option, index) => {
              const isSelected = selectedOption === option.id;
              const optionCount = optionCounts.find((c) => c.option_id === option.id)?.count || 0;
              
              return (
                <motion.div
                  key={option.id}
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ delay: index * 0.05 }}
                >
                  <Button
                    variant={isSelected ? "default" : "outline"}
                    className={`
                      w-full h-auto p-4 flex flex-col items-center gap-2 relative overflow-hidden
                      transition-all duration-300
                      ${isSelected 
                        ? "bg-gradient-to-br from-primary to-accent text-white border-0 shadow-lg scale-105" 
                        : "hover:border-primary/50 hover:bg-primary/5 hover:scale-105"
                      }
                      ${hasAnswered && !isAudience ? "opacity-50 cursor-not-allowed" : ""}
                      ${hasAnswered && isSelected ? "animate-pulse" : ""}
                    `}
                    onClick={() => handleSubmit(option.id)}
                    disabled={!isAudience || hasAnswered || submitting}
                  >
                    <AnimatePresence>
                      {isSelected && (
                        <motion.div
                          className="absolute top-2 right-2 w-6 h-6 rounded-full bg-white flex items-center justify-center"
                          initial={{ scale: 0, rotate: -180 }}
                          animate={{ scale: 1, rotate: 0 }}
                          exit={{ scale: 0, rotate: 180 }}
                          transition={{ type: "spring", stiffness: 300 }}
                        >
                          <Check className="w-4 h-4 text-primary" />
                        </motion.div>
                      )}
                    </AnimatePresence>

                    <div className="text-3xl mb-1">
                      {getOptionIcon(option.label)}
                    </div>

                    <span className="text-sm font-medium text-center leading-tight">
                      {option.label}
                    </span>

                    {hasAnswered && (
                      <motion.div
                        className={`
                          absolute bottom-2 left-1/2 -translate-x-1/2 px-2 py-0.5 rounded-full text-xs font-bold
                          ${isSelected ? "bg-white/20 text-white" : "bg-primary/10 text-primary"}
                        `}
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.2 }}
                      >
                        {optionCount}
                      </motion.div>
                    )}
                  </Button>
                </motion.div>
              );
            })}
          </div>

          <AnimatePresence>
            {showCelebration && (
              <motion.div
                className="p-4 bg-gradient-to-r from-primary/10 to-accent/10 rounded-xl border-2 border-primary/30 text-center"
                initial={{ opacity: 0, scale: 0.9, y: 20 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.9, y: -20 }}
                transition={{ type: "spring" }}
              >
                <p className="text-lg font-bold bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">
                  ✨ Amazing! Your voice matters! ✨
                </p>
                <p className="text-sm text-muted-foreground mt-1">
                  Come back tomorrow to continue your streak!
                </p>
              </motion.div>
            )}
          </AnimatePresence>

          {hasAnswered && (
            <motion.div
              className="space-y-4"
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: "auto" }}
              transition={{ delay: 0.3 }}
            >
              <div className="flex items-center gap-2 mb-3">
                <TrendingUp className="w-4 h-4 text-primary" />
                <h4 className="font-semibold">Live Stats & Filters</h4>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <Select value={ageFilter} onValueChange={setAgeFilter}>
                  <SelectTrigger className="bg-background/50">
                    <SelectValue placeholder="Filter by Age" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Ages</SelectItem>
                    <SelectItem value="13-17">13-17</SelectItem>
                    <SelectItem value="18-24">18-24</SelectItem>
                    <SelectItem value="25-34">25-34</SelectItem>
                    <SelectItem value="35-44">35-44</SelectItem>
                    <SelectItem value="45+">45+</SelectItem>
                  </SelectContent>
                </Select>

                <Select value={genderFilter} onValueChange={setGenderFilter}>
                  <SelectTrigger className="bg-background/50">
                    <SelectValue placeholder="Filter by Gender" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Genders</SelectItem>
                    <SelectItem value="male">Male</SelectItem>
                    <SelectItem value="female">Female</SelectItem>
                    <SelectItem value="non-binary">Non-Binary</SelectItem>
                    <SelectItem value="prefer-not-to-say">Prefer Not to Say</SelectItem>
                  </SelectContent>
                </Select>

                <Select value={locationFilter} onValueChange={setLocationFilter}>
                  <SelectTrigger className="bg-background/50">
                    <SelectValue placeholder="Filter by Location" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Locations</SelectItem>
                    {locations.map((loc) => (
                      <SelectItem key={loc} value={loc}>
                        {loc}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-3 mt-6">
                {question.options.map((option, index) => {
                  const optionCount = optionCounts.find((c) => c.option_id === option.id)?.count || 0;
                  const maxCount = getMaxCount();
                  const percentage = maxCount > 0 ? (optionCount / maxCount) * 100 : 0;
                  const isSelected = selectedOption === option.id;

                  return (
                    <motion.div
                      key={option.id}
                      className="space-y-2"
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: 0.4 + index * 0.05 }}
                    >
                      <div className="flex items-center justify-between text-sm">
                        <div className="flex items-center gap-2">
                          <span className="text-xl">{getOptionIcon(option.label)}</span>
                          <span className={`font-medium ${isSelected ? "text-primary" : ""}`}>
                            {option.label}
                          </span>
                        </div>
                        <motion.span
                          className="font-bold text-primary"
                          key={optionCount}
                          initial={{ scale: 1.5 }}
                          animate={{ scale: 1 }}
                          transition={{ type: "spring", stiffness: 300 }}
                        >
                          {optionCount}
                        </motion.span>
                      </div>
                      <div className="relative h-3 bg-muted/50 rounded-full overflow-hidden">
                        <motion.div
                          className={`absolute inset-y-0 left-0 rounded-full ${
                            isSelected
                              ? "bg-gradient-to-r from-primary to-accent"
                              : "bg-gradient-to-r from-primary/70 to-accent/70"
                          }`}
                          initial={{ width: 0 }}
                          animate={{ width: `${percentage}%` }}
                          transition={{ duration: 0.8, ease: "easeOut" }}
                        />
                        {isSelected && (
                          <motion.div
                            className="absolute inset-0 bg-white/20"
                            animate={{ opacity: [0.5, 0, 0.5] }}
                            transition={{ duration: 2, repeat: Infinity }}
                          />
                        )}
                      </div>
                    </motion.div>
                  );
                })}
              </div>

              {(ageFilter !== "all" || genderFilter !== "all" || locationFilter !== "all") && (
                <motion.div
                  className="flex items-center gap-2 p-3 bg-primary/5 rounded-lg border border-primary/20"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                >
                  <MapPin className="w-4 h-4 text-primary" />
                  <span className="text-sm text-muted-foreground">
                    Showing filtered results for{" "}
                    {ageFilter !== "all" && <strong>{ageFilter}</strong>}
                    {genderFilter !== "all" && (
                      <>
                        {ageFilter !== "all" && ", "}
                        <strong>{genderFilter}</strong>
                      </>
                    )}
                    {locationFilter !== "all" && (
                      <>
                        {(ageFilter !== "all" || genderFilter !== "all") && ", "}
                        <strong>{locationFilter}</strong>
                      </>
                    )}
                  </span>
                </motion.div>
              )}
            </motion.div>
          )}

          {!hasAnswered && isAudience && (
            <motion.div
              className="p-4 bg-gradient-to-r from-accent/10 to-primary/10 rounded-xl border border-accent/20 text-center"
              animate={{ scale: [1, 1.02, 1] }}
              transition={{ duration: 2, repeat: Infinity }}
            >
              <p className="text-sm font-medium">
                👆 Select your choice above to see live community insights
              </p>
            </motion.div>
          )}
        </div>
      </Card>
    </motion.div>
  );
}
