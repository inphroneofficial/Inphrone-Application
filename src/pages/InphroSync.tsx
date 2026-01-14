import { useEffect, useState, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Radio, TrendingUp, Sparkles, Users, Zap, Heart, Star, ChevronDown, Activity, Waves } from "lucide-react";
import { DailyQuestionNew } from "@/components/inphrosync/DailyQuestionNew";
import { YesterdayInsights } from "@/components/inphrosync/YesterdayInsights";
import { NavigationControls } from "@/components/NavigationControls";
import { toast } from "sonner";
import { ScrollToTop } from "@/components/ScrollToTop";
import { motion, AnimatePresence } from "framer-motion";
import { Badge } from "@/components/ui/badge";
import { useIsMobile } from "@/hooks/use-mobile";

interface Question {
  id: string;
  question_type: string;
  question_text: string;
  options: Array<{ id: string; label: string }>;
}

export default function InphroSync() {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [questions, setQuestions] = useState<Question[]>([]);
  const [userType, setUserType] = useState<string | null>(null);
  const [isAudience, setIsAudience] = useState(false);
  const [showInfo, setShowInfo] = useState(false);
  const isMobile = useIsMobile();
  
  // Reduce animations on mobile for better performance
  const shouldReduceMotion = isMobile;

  useEffect(() => {
    checkAuth();
    
    const handleQuestionsUpdate = () => {
      console.log('InphroSync questions updated, refetching...');
      fetchQuestions();
      toast.success("Questions updated!");
    };
    
    window.addEventListener('inphrosync-questions-updated', handleQuestionsUpdate);
    
    const questionsChannel = supabase
      .channel('inphrosync-questions-realtime')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'inphrosync_questions'
        },
        () => {
          console.log('InphroSync questions changed in database, refetching...');
          fetchQuestions();
        }
      )
      .subscribe();
    
    return () => {
      window.removeEventListener('inphrosync-questions-updated', handleQuestionsUpdate);
      supabase.removeChannel(questionsChannel);
    };
  }, []);

  const checkAuth = async () => {
    try {
      const { data: { session } } = await supabase.auth.getSession();
      
      if (!session) {
        navigate("/auth");
        return;
      }

      const { data: profile, error: profileError } = await supabase
        .from("profiles")
        .select("user_type")
        .eq("id", session.user.id)
        .single();

      if (profileError) throw profileError;
      
      const audience = profile.user_type === "audience";
      setUserType(profile.user_type);
      setIsAudience(audience);

      await fetchQuestions();
    } catch (error) {
      console.error("Error checking auth:", error);
      toast.error("Failed to load InphroSync");
    } finally {
      setLoading(false);
    }
  };

  const fetchQuestions = async () => {
    const { data: questionsData, error: questionsError } = await supabase
      .from("inphrosync_questions")
      .select("*")
      .eq("is_active", true)
      .order("question_type");

    if (questionsError) throw questionsError;

    const parsedQuestions = (questionsData || []).map((q) => ({
      id: q.id,
      question_type: q.question_type,
      question_text: q.question_text,
      options: q.options as Array<{ id: string; label: string }>,
    }));

    setQuestions(parsedQuestions);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-background via-muted/30 to-background flex items-center justify-center relative overflow-hidden">
        {/* Animated background orbs */}
        <div className="absolute inset-0 overflow-hidden">
          <motion.div
            className="absolute top-1/4 left-1/4 w-96 h-96 rounded-full blur-[120px]"
            style={{ background: "hsl(var(--primary) / 0.15)" }}
            animate={{
              scale: [1, 1.3, 1],
              opacity: [0.3, 0.5, 0.3],
            }}
            transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
          />
          <motion.div
            className="absolute bottom-1/4 right-1/4 w-80 h-80 rounded-full blur-[100px]"
            style={{ background: "hsl(var(--accent) / 0.2)" }}
            animate={{
              scale: [1, 1.2, 1],
              opacity: [0.3, 0.5, 0.3],
            }}
            transition={{ duration: 5, repeat: Infinity, ease: "easeInOut", delay: 1 }}
          />
        </div>
        
        <motion.div 
          className="relative z-10 flex flex-col items-center gap-6"
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.5 }}
        >
          <motion.div
            className="relative"
            animate={{ rotate: 360 }}
            transition={{ duration: 3, repeat: Infinity, ease: "linear" }}
          >
            <div className="w-20 h-20 rounded-full bg-gradient-to-br from-primary to-accent flex items-center justify-center shadow-glow">
              <Radio className="w-10 h-10 text-primary-foreground" />
            </div>
            <motion.div
              className="absolute inset-0 rounded-full border-2 border-primary/30"
              animate={{ scale: [1, 1.5], opacity: [0.5, 0] }}
              transition={{ duration: 1.5, repeat: Infinity }}
            />
          </motion.div>
          <div className="text-center space-y-2">
            <p className="text-lg font-medium text-foreground">Syncing your pulse...</p>
            <p className="text-sm text-muted-foreground">Loading your entertainment insights</p>
          </div>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="min-h-screen relative overflow-hidden pt-16">
      {/* Premium gradient background */}
      <div className="fixed inset-0 bg-gradient-to-br from-background via-muted/20 to-background" />
      <div className="fixed inset-0 bg-dot-pattern opacity-30 pointer-events-none" />
      
      {/* Static background orbs on mobile, animated on desktop */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        {shouldReduceMotion ? (
          <>
            <div
              className="absolute -top-32 -left-32 w-[300px] h-[300px] md:w-[500px] md:h-[500px] rounded-full blur-[100px] md:blur-[150px]"
              style={{ background: "hsl(var(--primary) / 0.1)" }}
            />
            <div
              className="absolute top-1/3 -right-32 w-[250px] h-[250px] md:w-[400px] md:h-[400px] rounded-full blur-[80px] md:blur-[120px]"
              style={{ background: "hsl(var(--accent) / 0.15)" }}
            />
          </>
        ) : (
          <>
            <motion.div
              className="absolute -top-32 -left-32 w-[500px] h-[500px] rounded-full blur-[150px]"
              style={{ background: "hsl(var(--primary) / 0.1)", willChange: "transform" }}
              animate={{
                scale: [1, 1.2, 1],
                x: [0, 50, 0],
                y: [0, 30, 0],
              }}
              transition={{ duration: 15, repeat: Infinity, ease: "easeInOut" }}
            />
            <motion.div
              className="absolute top-1/3 -right-32 w-[400px] h-[400px] rounded-full blur-[120px]"
              style={{ background: "hsl(var(--accent) / 0.15)", willChange: "transform" }}
              animate={{
                scale: [1, 1.3, 1],
                x: [0, -40, 0],
              }}
              transition={{ duration: 12, repeat: Infinity, ease: "easeInOut", delay: 2 }}
            />
            <motion.div
              className="absolute bottom-0 left-1/3 w-[350px] h-[350px] rounded-full blur-[100px]"
              style={{ background: "hsl(var(--primary) / 0.08)", willChange: "transform" }}
              animate={{
                scale: [1, 1.15, 1],
                y: [0, -50, 0],
              }}
              transition={{ duration: 10, repeat: Infinity, ease: "easeInOut", delay: 4 }}
            />
          </>
        )}
      </div>

      <div className="relative z-10 container max-w-6xl mx-auto px-4 py-8">
        {/* Navigation */}
        <motion.div 
          className="mb-8"
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          <NavigationControls showHome={true} showBack={true} />
        </motion.div>

        {/* Premium Header */}
        <motion.header
          className="text-center mb-16"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7, delay: 0.1 }}
        >
          {/* Live badge */}
          <motion.div
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.2 }}
            className="inline-block mb-6"
          >
            <Badge className="px-4 py-2 bg-primary/10 border-primary/20 text-primary gap-2">
              {shouldReduceMotion ? (
                <span className="w-2 h-2 rounded-full bg-primary animate-pulse" />
              ) : (
                <motion.span
                  className="w-2 h-2 rounded-full bg-primary"
                  animate={{ scale: [1, 1.3, 1], opacity: [1, 0.5, 1] }}
                  transition={{ duration: 1.5, repeat: Infinity }}
                />
              )}
              Live Entertainment Pulse
            </Badge>
          </motion.div>

          {/* Title with animated icons */}
          <div className="flex items-center justify-center gap-4 mb-6">
            {!shouldReduceMotion && (
              <motion.div
                animate={{ rotate: [0, 10, -10, 0] }}
                transition={{ duration: 3, repeat: Infinity, ease: "easeInOut" }}
              >
                <Waves className="w-8 h-8 text-primary hidden sm:block" />
              </motion.div>
            )}
            <h1 className="text-4xl md:text-7xl font-display font-bold">
              <span className="text-gradient">Inphro</span>
              <span className="text-foreground">Sync</span>
            </h1>
            {!shouldReduceMotion && (
              <motion.div
                animate={{ rotate: [0, -10, 10, 0] }}
                transition={{ duration: 3, repeat: Infinity, ease: "easeInOut", delay: 0.5 }}
              >
                <Activity className="w-8 h-8 text-accent hidden sm:block" />
              </motion.div>
            )}
          </div>

          <motion.p
            className="text-xl text-muted-foreground mb-8 max-w-2xl mx-auto"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.4 }}
          >
            Track your daily entertainment journey & discover how you sync with audiences worldwide
          </motion.p>

          {/* Status pills */}
          <motion.div
            className="flex flex-wrap items-center justify-center gap-3"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.5 }}
          >
            <div className="glass-card px-5 py-2.5 rounded-full flex items-center gap-2">
              <Users className="w-4 h-4 text-primary" />
              <span className="text-sm font-medium">All Audience Members</span>
            </div>
            <div className="glass-card px-5 py-2.5 rounded-full flex items-center gap-2">
              <Zap className="w-4 h-4 text-accent" />
              <span className="text-sm font-medium">Daily Engagement</span>
            </div>
            <motion.button
              className="glass-card px-5 py-2.5 rounded-full flex items-center gap-2 cursor-pointer hover:border-primary/30 transition-all"
              onClick={() => setShowInfo(!showInfo)}
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
            >
              <Sparkles className="w-4 h-4 text-primary" />
              <span className="text-sm font-medium">{showInfo ? "Hide Guide" : "How It Works"}</span>
              <motion.div
                animate={{ rotate: showInfo ? 180 : 0 }}
                transition={{ duration: 0.3 }}
              >
                <ChevronDown className="w-4 h-4" />
              </motion.div>
            </motion.button>
          </motion.div>
        </motion.header>

        {/* Collapsible Info Section */}
        <AnimatePresence>
          {showInfo && (
            <motion.div
              initial={{ opacity: 0, height: 0, marginBottom: 0 }}
              animate={{ opacity: 1, height: "auto", marginBottom: 32 }}
              exit={{ opacity: 0, height: 0, marginBottom: 0 }}
              transition={{ duration: 0.4, ease: "easeInOut" }}
              className="overflow-hidden"
            >
              <div className="glass-card p-8 rounded-3xl border border-primary/10">
                <div className="text-center mb-8">
                  <h3 className="text-2xl font-bold mb-3">
                    Welcome to <span className="text-gradient">InphroSync</span>!
                  </h3>
                  <p className="text-muted-foreground max-w-2xl mx-auto leading-relaxed">
                    Your personal entertainment diary and the community's daily pulse. Every day, reflect on yesterday's 
                    entertainment experience and see how your choices compare globally!
                  </p>
                </div>

                <div className="grid md:grid-cols-3 gap-6">
                  {[
                    { icon: Heart, title: "Share Your Mood", desc: "How did entertainment make you feel yesterday?", gradient: "from-primary to-primary/60" },
                    { icon: Zap, title: "Track Your Habits", desc: "Which device and platform did you use?", gradient: "from-accent to-accent/60" },
                    { icon: Star, title: "Earn Rewards", desc: "Build streaks and unlock wisdom badges.", gradient: "from-amber-500 to-orange-500" },
                  ].map((item, idx) => (
                    <motion.div
                      key={item.title}
                      className="premium-card p-6 text-center"
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: 0.1 * idx }}
                    >
                      <div className={`w-16 h-16 mx-auto mb-4 rounded-2xl bg-gradient-to-br ${item.gradient} flex items-center justify-center shadow-lg`}>
                        <item.icon className="w-8 h-8 text-primary-foreground" />
                      </div>
                      <h4 className="font-semibold mb-2">{item.title}</h4>
                      <p className="text-sm text-muted-foreground">{item.desc}</p>
                    </motion.div>
                  ))}
                </div>

                <motion.div 
                  className="mt-8 p-5 bg-gradient-to-r from-primary/5 to-accent/5 rounded-2xl border border-primary/10 text-center"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: 0.4 }}
                >
                  <div className="flex items-center justify-center gap-2 mb-2">
                    <Users className="w-5 h-5 text-primary" />
                    <span className="font-semibold">Open to All Audience Members</span>
                  </div>
                  <p className="text-sm text-muted-foreground">
                    Your anonymous responses help shape entertainment trends and provide valuable insights worldwide.
                  </p>
                </motion.div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Non-Audience Notice */}
        {!isAudience && (
          <motion.div
            className="mb-10 glass-card p-6 rounded-2xl border-l-4 border-l-accent"
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.5, delay: 0.3 }}
          >
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 rounded-xl bg-accent/10 flex items-center justify-center flex-shrink-0">
                <TrendingUp className="w-6 h-6 text-accent" />
              </div>
              <div>
                <p className="font-semibold text-foreground">Analytics View Mode</p>
                <p className="text-sm text-muted-foreground">
                  As a <span className="font-medium text-accent">{userType}</span> professional, you can view audience insights but cannot submit responses.
                </p>
              </div>
            </div>
          </motion.div>
        )}

        {/* Yesterday Insights */}
        <motion.section
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.4 }}
        >
          <YesterdayInsights />
        </motion.section>

        {/* Audience: Interactive Questions */}
        {isAudience && (
          <motion.section
            className="mt-16"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.6, delay: 0.5 }}
          >
            <div className="flex items-center gap-4 mb-8">
              <div className="w-1.5 h-10 rounded-full bg-gradient-to-b from-primary to-accent" />
              <div>
                <h2 className="text-2xl font-bold">Today's Questions</h2>
                <p className="text-sm text-muted-foreground">Based on yesterday's entertainment</p>
              </div>
            </div>

            <div className="space-y-6">
              {questions.map((question, index) => (
                <motion.div
                  key={question.id}
                  initial={{ opacity: 0, y: 30 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.5, delay: 0.6 + index * 0.1 }}
                >
                  <DailyQuestionNew
                    question={question}
                    isAudience={isAudience}
                    questionNumber={index + 1}
                    totalQuestions={questions.length}
                  />
                </motion.div>
              ))}
            </div>
          </motion.section>
        )}

        {/* Non-Audience: Analytics Dashboard */}
        {!isAudience && (
          <motion.section
            className="mt-16"
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.5 }}
          >
            <div className="premium-card p-10 md:p-14 rounded-3xl overflow-hidden relative">
              {/* Decorative elements */}
              <div className="absolute -top-20 -right-20 w-60 h-60 rounded-full bg-gradient-to-br from-primary/20 to-transparent blur-3xl" />
              <div className="absolute -bottom-20 -left-20 w-60 h-60 rounded-full bg-gradient-to-br from-accent/20 to-transparent blur-3xl" />
              
              <div className="relative z-10 max-w-3xl mx-auto text-center">
                <motion.div
                  className="w-20 h-20 mx-auto mb-6 rounded-2xl bg-gradient-to-br from-primary to-accent flex items-center justify-center shadow-glow"
                  animate={{ rotate: [0, 5, -5, 0] }}
                  transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
                >
                  <TrendingUp className="w-10 h-10 text-primary-foreground" />
                </motion.div>

                <h3 className="text-2xl md:text-3xl font-bold mb-3">
                  <span className="text-gradient">Audience Analytics</span>
                </h3>
                <p className="text-muted-foreground mb-8">
                  Real-time entertainment insights from daily audience engagement
                </p>

                <div className="grid sm:grid-cols-3 gap-4 mb-8">
                  {[
                    { emoji: "📊", title: "Live Trends", desc: "Real-time preferences" },
                    { emoji: "🎯", title: "Demographics", desc: "Age, gender, location" },
                    { emoji: "📈", title: "Patterns", desc: "Device & platform data" },
                  ].map((item, idx) => (
                    <motion.div
                      key={item.title}
                      className="glass-card p-5 rounded-xl"
                      whileHover={{ scale: 1.02, y: -2 }}
                    >
                      <div className="text-3xl mb-3">{item.emoji}</div>
                      <h4 className="font-semibold text-sm mb-1">{item.title}</h4>
                      <p className="text-xs text-muted-foreground">{item.desc}</p>
                    </motion.div>
                  ))}
                </div>

                <div className="glass-card p-6 rounded-xl border border-accent/20">
                  <div className="flex items-center justify-center gap-2 mb-2">
                    <Sparkles className="w-5 h-5 text-accent" />
                    <span className="font-semibold">Want to Participate?</span>
                  </div>
                  <p className="text-sm text-muted-foreground">
                    Create an <span className="font-medium text-accent">Audience account</span> to submit daily choices and earn rewards
                  </p>
                </div>
              </div>
            </div>
          </motion.section>
        )}
      </div>

      <ScrollToTop />
    </div>
  );
}
