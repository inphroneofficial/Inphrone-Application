import { useState, useEffect, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { 
  Sparkles, 
  MessageSquare, 
  Gift, 
  BarChart3, 
  Users, 
  Zap,
  ChevronRight,
  ChevronLeft,
  X,
  Star,
  Home,
  Settings,
  Bell,
  User,
  TrendingUp,
  Target,
  Award,
  Heart,
  Share2,
  Calendar,
  Lightbulb,
  Gamepad2,
  Film,
  Music,
  Tv
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { supabase } from "@/integrations/supabase/client";
import { useNavigate } from "react-router-dom";

interface TourStep {
  id: string;
  title: string;
  description: string;
  icon: React.ReactNode;
  gradient: string;
  tip: string;
  features?: string[];
  action?: string;
}

const tourSteps: TourStep[] = [
  {
    id: "welcome",
    title: "Welcome to INPHRONE",
    description: "Your voice shapes the future of entertainment. Let's take a quick tour of all the amazing features waiting for you!",
    icon: <Sparkles className="w-8 h-8" />,
    gradient: "from-primary via-accent to-primary",
    tip: "Your opinions matter here!",
    features: ["Shape entertainment trends", "Earn exclusive rewards", "Join global community"]
  },
  {
    id: "user-types",
    title: "Multiple User Roles",
    description: "INPHRONE supports various user types, each with tailored experiences and insights.",
    icon: <Users className="w-8 h-8" />,
    gradient: "from-violet-500 via-purple-500 to-fuchsia-500",
    tip: "Choose your role wisely!",
    features: ["🎬 Audience - Share opinions & earn rewards", "✨ Creator - Access audience insights", "🎬 Studio/OTT/TV - Industry analytics", "🎮 Gaming & 💻 App Developer - Gaming & App insights", "🎵 Music - Music industry trends"]
  },
  {
    id: "dashboard",
    title: "Your Dashboard",
    description: "This is your home base. View your stats, track progress, and access all features from here.",
    icon: <Home className="w-8 h-8" />,
    gradient: "from-blue-500 via-cyan-500 to-teal-500",
    tip: "Everything starts here!",
    features: ["📊 Track your opinions", "🏆 View your level & rewards", "⏰ Weekly submission timer"],
    action: "Navigate to Dashboard"
  },
  {
    id: "categories",
    title: "Entertainment Categories",
    description: "Choose from 8 exciting categories to share your opinions on content you love.",
    icon: <Film className="w-8 h-8" />,
    gradient: "from-emerald-500 via-teal-500 to-cyan-500",
    tip: "One opinion per category weekly",
    features: ["🎬 Movies & Films", "📺 TV Shows & OTT", "🎵 Music", "🎮 Gaming", "📱 Social Media", "▶️ YouTube", "💻 App Development"]
  },
  {
    id: "opinions",
    title: "Share Your Voice",
    description: "Express what entertainment content you want to see. Your opinion reaches industry creators and studios!",
    icon: <MessageSquare className="w-8 h-8" />,
    gradient: "from-violet-500 via-purple-500 to-fuchsia-500",
    tip: "Be specific & creative!",
    features: ["📝 Describe your dream content", "🎯 Choose genre & target audience", "💡 Explain why you're excited"]
  },
  {
    id: "rewards",
    title: "Earn Exclusive Rewards",
    description: "Every opinion earns you points! Reach milestones to unlock exclusive coupons and discounts.",
    icon: <Gift className="w-8 h-8" />,
    gradient: "from-amber-500 via-orange-500 to-rose-500",
    tip: "More opinions = More rewards",
    features: ["🎁 Exclusive discount coupons", "⭐ Level up system", "🏅 Achievement badges"]
  },
  {
    id: "likes",
    title: "Engage with Community",
    description: "Like opinions you agree with! When others like yours, both of you earn extra points.",
    icon: <Heart className="w-8 h-8" />,
    gradient: "from-rose-500 via-pink-500 to-red-500",
    tip: "Likes boost both users!",
    features: ["❤️ Like opinions you love", "📈 Earn points from likes", "🤝 Connect with like-minded fans"]
  },
  {
    id: "inphrosync",
    title: "Daily InphroSync",
    description: "Answer quick daily questions to sync with entertainment trends. Build streaks for bonus rewards!",
    icon: <Zap className="w-8 h-8" />,
    gradient: "from-yellow-500 via-amber-500 to-orange-500",
    tip: "Don't break your streak!",
    features: ["⚡ Quick daily questions", "🔥 Build streaks", "🎯 Earn streak badges"],
    action: "Try InphroSync"
  },
  {
    id: "yourturn",
    title: "Your Turn - Win the Spotlight!",
    description: "Three daily chances (9 AM, 2 PM, 7 PM) to win and ask your own entertainment question to the entire community!",
    icon: <Target className="w-8 h-8" />,
    gradient: "from-rose-500 via-pink-500 to-fuchsia-500",
    tip: "Be the fastest to click!",
    features: ["🎯 3 slots daily at 9 AM, 2 PM, 7 PM", "⚡ 20-second countdown - first click wins!", "📊 Real-time votes on your question", "🏆 See how many tried for your slot"],
    action: "Try InphroSync"
  },
  {
    id: "insights",
    title: "Discover Trends",
    description: "See real-time analytics and trending topics. Discover what the community is excited about!",
    icon: <BarChart3 className="w-8 h-8" />,
    gradient: "from-indigo-500 via-blue-500 to-cyan-500",
    tip: "Stay ahead of trends!",
    features: ["📊 Real-time analytics", "🌍 Global trends", "🔥 Hot topics"],
    action: "View Insights"
  },
  {
    id: "profile",
    title: "Your Profile",
    description: "View your complete activity history, badges earned, and share your profile with others.",
    icon: <User className="w-8 h-8" />,
    gradient: "from-teal-500 via-emerald-500 to-green-500",
    tip: "Showcase your achievements!",
    features: ["🏆 View all badges", "📈 Activity analytics", "🔗 Share your profile"]
  },
  {
    id: "notifications",
    title: "Stay Updated",
    description: "Never miss a like or milestone! Get notified when someone appreciates your opinions.",
    icon: <Bell className="w-8 h-8" />,
    gradient: "from-purple-500 via-violet-500 to-indigo-500",
    tip: "Enable notifications!",
    features: ["🔔 Like notifications", "🎉 Milestone alerts", "📧 Weekly digests"]
  },
  {
    id: "settings",
    title: "Customize Experience",
    description: "Choose your theme, language, and notification preferences in Settings.",
    icon: <Settings className="w-8 h-8" />,
    gradient: "from-slate-500 via-gray-500 to-zinc-500",
    tip: "Make it yours!",
    features: ["🌙 Dark/Light theme", "🌐 Multiple languages", "🔧 Notification controls"]
  },
  {
    id: "complete",
    title: "You're All Set!",
    description: "Start exploring and sharing your opinions. The entertainment industry is waiting to hear from you!",
    icon: <Award className="w-8 h-8" />,
    gradient: "from-primary via-accent to-primary",
    tip: "Your journey begins now!",
    features: ["✨ Share your first opinion", "🎯 Complete daily InphroSync", "🏆 Earn your first badge"]
  }
];

interface GuidedTourProps {
  onComplete: () => void;
}

const GuidedTour = ({ onComplete }: GuidedTourProps) => {
  const [currentStep, setCurrentStep] = useState(0);
  const [isExiting, setIsExiting] = useState(false);
  const navigate = useNavigate();

  const handleNext = () => {
    if (currentStep < tourSteps.length - 1) {
      setCurrentStep(prev => prev + 1);
    } else {
      handleComplete();
    }
  };

  const handlePrev = () => {
    if (currentStep > 0) {
      setCurrentStep(prev => prev - 1);
    }
  };

  const handleComplete = async () => {
    setIsExiting(true);
    
    // Clean up body styles immediately
    document.body.style.overflow = '';
    document.body.style.pointerEvents = '';
    
    // Mark tour as completed in user settings
    const { data: { user } } = await supabase.auth.getUser();
    if (user) {
      // Get existing settings first
      const { data: profile } = await supabase
        .from("profiles")
        .select("settings")
        .eq("id", user.id)
        .single();
      
      const existingSettings = (profile?.settings as Record<string, any>) || {};
      
      await supabase
        .from("profiles")
        .update({ 
          settings: { 
            ...existingSettings,
            tour_completed: true,
            tour_completed_at: new Date().toISOString()
          } 
        })
        .eq("id", user.id);
    }
    
    // Navigate to dashboard after completing the tour
    setTimeout(() => {
      // Final cleanup
      document.body.style.overflow = '';
      document.body.style.pointerEvents = '';
      onComplete();
      navigate("/dashboard");
    }, 300);
  };

  const handleSkip = () => {
    handleComplete();
  };

  const handleAction = (action?: string) => {
    if (action === "Navigate to Dashboard") {
      navigate("/dashboard");
    } else if (action === "Try InphroSync") {
      navigate("/inphrosync");
    } else if (action === "View Insights") {
      navigate("/insights");
    }
    handleNext();
  };

  const step = tourSteps[currentStep];
  const progress = ((currentStep + 1) / tourSteps.length) * 100;

  // Handle keyboard navigation
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'ArrowRight' || e.key === 'Enter') {
        handleNext();
      } else if (e.key === 'ArrowLeft') {
        handlePrev();
      } else if (e.key === 'Escape') {
        handleSkip();
      }
    };
    
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [currentStep]);

  return (
    <AnimatePresence>
      {!isExiting && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-[100] flex items-center justify-center p-2 sm:p-4 overflow-y-auto"
        >
          {/* Backdrop with blur */}
          <motion.div 
            className="fixed inset-0 bg-background/90 backdrop-blur-xl"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
          />

          {/* Animated background gradient */}
          <motion.div 
            className={`fixed inset-0 bg-gradient-to-br ${step.gradient} opacity-5`}
            key={step.id}
            initial={{ opacity: 0 }}
            animate={{ opacity: 0.05 }}
            exit={{ opacity: 0 }}
          />

          {/* Floating particles */}
          <div className="fixed inset-0 overflow-hidden pointer-events-none">
            {[...Array(15)].map((_, i) => (
              <motion.div
                key={`${step.id}-${i}`}
                className={`absolute w-1 h-1 sm:w-2 sm:h-2 rounded-full bg-gradient-to-r ${step.gradient}`}
                style={{
                  left: `${Math.random() * 100}%`,
                  top: `${Math.random() * 100}%`,
                }}
                animate={{ 
                  y: [0, -50, 0],
                  opacity: [0, 0.6, 0],
                  scale: [0, 1, 0]
                }}
                transition={{
                  duration: 3 + Math.random() * 2,
                  repeat: Infinity,
                  delay: Math.random() * 2
                }}
              />
            ))}
          </div>

          {/* Main card - responsive sizing */}
          <motion.div
            key={step.id}
            initial={{ opacity: 0, scale: 0.9, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.9, y: -20 }}
            transition={{ type: "spring", damping: 25, stiffness: 300 }}
            className="relative w-full max-w-xs sm:max-w-md md:max-w-lg lg:max-w-xl mx-auto my-auto"
          >
            {/* Glass card */}
            <div className="relative overflow-hidden rounded-2xl sm:rounded-3xl border border-white/20 bg-card/60 backdrop-blur-2xl shadow-2xl">
              {/* Gradient border glow */}
              <div className={`absolute inset-0 bg-gradient-to-br ${step.gradient} opacity-10`} />
              
              {/* Skip button */}
              <motion.button
                onClick={handleSkip}
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.9 }}
                className="absolute top-3 right-3 sm:top-4 sm:right-4 p-1.5 sm:p-2 rounded-full bg-muted/50 hover:bg-muted transition-colors z-10"
              >
                <X className="w-3 h-3 sm:w-4 sm:h-4 text-muted-foreground" />
              </motion.button>

              {/* Content */}
              <div className="relative p-4 sm:p-6 md:p-8 pt-10 sm:pt-12">
                {/* Icon with animated glow */}
                <motion.div 
                  className="relative mx-auto w-16 h-16 sm:w-20 sm:h-20 md:w-24 md:h-24 mb-4 sm:mb-6"
                  initial={{ scale: 0, rotate: -180 }}
                  animate={{ scale: 1, rotate: 0 }}
                  transition={{ type: "spring", damping: 15, delay: 0.1 }}
                >
                  {/* Glow rings */}
                  <motion.div 
                    className={`absolute inset-0 rounded-full bg-gradient-to-r ${step.gradient} opacity-20 blur-xl`}
                    animate={{ scale: [1, 1.3, 1] }}
                    transition={{ duration: 2, repeat: Infinity }}
                  />
                  <motion.div 
                    className={`absolute inset-2 rounded-full bg-gradient-to-r ${step.gradient} opacity-30 blur-lg`}
                    animate={{ scale: [1, 1.2, 1] }}
                    transition={{ duration: 2, repeat: Infinity, delay: 0.5 }}
                  />
                  
                  {/* Icon container */}
                  <div className={`relative w-full h-full rounded-full bg-gradient-to-br ${step.gradient} flex items-center justify-center text-white shadow-lg`}>
                    <motion.div
                      animate={{ rotate: [0, 5, -5, 0] }}
                      transition={{ duration: 3, repeat: Infinity }}
                    >
                      {step.icon}
                    </motion.div>
                  </div>
                </motion.div>

                {/* Step indicator dots */}
                <motion.div 
                  className="flex justify-center gap-1 mb-3 sm:mb-4 flex-wrap"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: 0.2 }}
                >
                  {tourSteps.map((_, idx) => (
                    <motion.button
                      key={idx}
                      onClick={() => setCurrentStep(idx)}
                      className={`h-1.5 sm:h-2 rounded-full transition-all duration-300 ${
                        idx === currentStep 
                          ? `w-4 sm:w-6 bg-gradient-to-r ${step.gradient}` 
                          : idx < currentStep 
                            ? 'w-1.5 sm:w-2 bg-primary/50 hover:bg-primary/70' 
                            : 'w-1.5 sm:w-2 bg-muted hover:bg-muted-foreground/30'
                      }`}
                    />
                  ))}
                </motion.div>

                {/* Title */}
                <motion.h2 
                  className="text-xl sm:text-2xl md:text-3xl font-bold text-center mb-2 sm:mb-3"
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.15 }}
                >
                  <span className={`bg-gradient-to-r ${step.gradient} bg-clip-text text-transparent`}>
                    {step.title}
                  </span>
                </motion.h2>

                {/* Description */}
                <motion.p 
                  className="text-sm sm:text-base text-muted-foreground text-center mb-4 sm:mb-6 leading-relaxed px-2"
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.2 }}
                >
                  {step.description}
                </motion.p>

                {/* Features list */}
                {step.features && (
                  <motion.div
                    className="mb-4 sm:mb-6 space-y-1.5 sm:space-y-2"
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.25 }}
                  >
                    {step.features.map((feature, idx) => (
                      <motion.div
                        key={idx}
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: 0.3 + idx * 0.1 }}
                        className="flex items-center gap-2 justify-center text-xs sm:text-sm text-foreground/80"
                      >
                        <span>{feature}</span>
                      </motion.div>
                    ))}
                  </motion.div>
                )}

                {/* Tip badge */}
                <motion.div
                  className="flex justify-center mb-4 sm:mb-6"
                  initial={{ opacity: 0, scale: 0.8 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ delay: 0.35 }}
                >
                  <div className={`inline-flex items-center gap-1.5 sm:gap-2 px-3 sm:px-4 py-1.5 sm:py-2 rounded-full bg-gradient-to-r ${step.gradient} bg-opacity-10 border border-white/10`}>
                    <Star className="w-3 h-3 sm:w-4 sm:h-4 text-amber-400" />
                    <span className="text-xs sm:text-sm font-medium">{step.tip}</span>
                  </div>
                </motion.div>

                {/* Progress bar */}
                <div className="mb-4 sm:mb-6">
                  <div className="h-1 bg-muted rounded-full overflow-hidden">
                    <motion.div 
                      className={`h-full bg-gradient-to-r ${step.gradient}`}
                      initial={{ width: 0 }}
                      animate={{ width: `${progress}%` }}
                      transition={{ duration: 0.5 }}
                    />
                  </div>
                  <p className="text-[10px] sm:text-xs text-muted-foreground text-center mt-1.5 sm:mt-2">
                    Step {currentStep + 1} of {tourSteps.length}
                  </p>
                </div>

                {/* Navigation buttons */}
                <div className="flex gap-2 sm:gap-3">
                  <Button
                    variant="outline"
                    onClick={handlePrev}
                    disabled={currentStep === 0}
                    className="flex-1 h-10 sm:h-12 rounded-xl border-white/20 bg-muted/30 hover:bg-muted/50 disabled:opacity-30 text-xs sm:text-sm"
                  >
                    <ChevronLeft className="w-3 h-3 sm:w-4 sm:h-4 mr-1 sm:mr-2" />
                    Back
                  </Button>
                  
                  {step.action ? (
                    <Button
                      onClick={() => handleAction(step.action)}
                      className={`flex-1 h-10 sm:h-12 rounded-xl bg-gradient-to-r ${step.gradient} text-white border-0 shadow-lg hover:shadow-xl transition-all text-xs sm:text-sm`}
                    >
                      {step.action}
                      <ChevronRight className="w-3 h-3 sm:w-4 sm:h-4 ml-1 sm:ml-2" />
                    </Button>
                  ) : (
                    <Button
                      onClick={handleNext}
                      className={`flex-1 h-10 sm:h-12 rounded-xl bg-gradient-to-r ${step.gradient} text-white border-0 shadow-lg hover:shadow-xl transition-all text-xs sm:text-sm`}
                    >
                      {currentStep === tourSteps.length - 1 ? (
                        <>
                          Get Started
                          <Sparkles className="w-3 h-3 sm:w-4 sm:h-4 ml-1 sm:ml-2" />
                        </>
                      ) : (
                        <>
                          Next
                          <ChevronRight className="w-3 h-3 sm:w-4 sm:h-4 ml-1 sm:ml-2" />
                        </>
                      )}
                    </Button>
                  )}
                </div>

                {/* Keyboard hint */}
                <motion.p
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: 0.5 }}
                  className="text-[10px] sm:text-xs text-muted-foreground text-center mt-3 sm:mt-4 hidden sm:block"
                >
                  Use ← → arrow keys or Esc to skip
                </motion.p>
              </div>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export default GuidedTour;
