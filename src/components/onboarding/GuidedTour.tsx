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
  Lightbulb
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
    features: ["🎬 Audience - Share opinions & earn rewards", "✨ Creator - Access audience insights", "🎬 Studio/OTT/TV - Industry analytics", "🎮 Gaming & 💻 App Developer - Insights", "🎵 Music - Music industry trends"]
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
    icon: <BarChart3 className="w-8 h-8" />,
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
    action: "Try YourTurn"
  },
  {
    id: "insights",
    title: "Discover Trends",
    description: "See real-time analytics and trending topics. Discover what the community is excited about!",
    icon: <TrendingUp className="w-8 h-8" />,
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
      
      const existingSettings = (profile?.settings as Record<string, unknown>) || {};
      
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
    
    // Navigate to home after completing the tour
    setTimeout(() => {
      // Final cleanup
      document.body.style.overflow = '';
      document.body.style.pointerEvents = '';
      onComplete();
      navigate("/");
    }, 300);
  };

  // Skip goes to home directly without saving completion
  const handleSkip = async () => {
    setIsExiting(true);
    document.body.style.overflow = '';
    document.body.style.pointerEvents = '';
    
    setTimeout(() => {
      onComplete();
      navigate("/");
    }, 300);
  };

  // Cancel (X button) - mark as completed and go to home
  const handleCancel = () => {
    handleComplete();
  };

  const handleAction = (action?: string) => {
    if (action === "Navigate to Dashboard") {
      navigate("/dashboard");
    } else if (action === "Try InphroSync") {
      navigate("/inphrosync");
    } else if (action === "Try YourTurn") {
      navigate("/yourturn");
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
        handleCancel(); // Escape cancels and goes to home
      }
    };
    
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [currentStep]);

  // Lock body scroll when tour is active
  useEffect(() => {
    document.body.style.overflow = 'hidden';
    return () => {
      document.body.style.overflow = '';
    };
  }, []);

  return (
    <AnimatePresence mode="wait">
      {!isExiting && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-[9999] flex items-center justify-center p-2 sm:p-4"
        >
          {/* Backdrop with lighter blur for transparency */}
          <div className="absolute inset-0 bg-black/70 backdrop-blur-sm" />

          {/* Animated background gradient */}
          <motion.div 
            className={`absolute inset-0 bg-gradient-to-br ${step.gradient} opacity-15`}
            animate={{ 
              backgroundPosition: ['0% 0%', '100% 100%'],
            }}
            transition={{ 
              duration: 8, 
              repeat: Infinity, 
              repeatType: 'reverse' 
            }}
          />

          {/* Floating particles - reduced for performance */}
          <div className="absolute inset-0 overflow-hidden pointer-events-none">
            {[...Array(8)].map((_, i) => (
              <motion.div
                key={i}
                className={`absolute w-1.5 h-1.5 rounded-full bg-gradient-to-r ${step.gradient} opacity-30`}
                initial={{ 
                  x: Math.random() * (typeof window !== 'undefined' ? window.innerWidth : 1000), 
                  y: Math.random() * (typeof window !== 'undefined' ? window.innerHeight : 800),
                  scale: Math.random() * 0.5 + 0.5
                }}
                animate={{ 
                  y: [null, Math.random() * -200 - 100],
                  opacity: [0.3, 0],
                  scale: [null, 0]
                }}
                transition={{ 
                  duration: Math.random() * 3 + 2,
                  repeat: Infinity,
                  delay: Math.random() * 2
                }}
              />
            ))}
          </div>

          {/* Main card - COMPACT sizing for all screens */}
          <motion.div
            key={currentStep}
            initial={{ opacity: 0, y: 20, scale: 0.98 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -20, scale: 0.98 }}
            transition={{ duration: 0.3, ease: [0.23, 1, 0.32, 1] }}
            className="relative w-full max-w-lg sm:max-w-xl md:max-w-2xl lg:max-w-3xl z-10"
          >
            {/* Glass card - more compact */}
            <div className="relative bg-card/90 backdrop-blur-lg rounded-2xl border border-border/40 shadow-xl overflow-hidden max-h-[85vh] overflow-y-auto">
              {/* Gradient border glow - subtle */}
              <div className={`absolute inset-0 bg-gradient-to-br ${step.gradient} opacity-5 blur-lg`} />
              
              {/* Cancel button (X) - marks as completed and goes home */}
              <Button
                variant="ghost"
                size="icon"
                onClick={handleCancel}
                className="absolute top-2 right-2 z-20 w-7 h-7 rounded-full bg-muted/60 hover:bg-destructive/20 hover:text-destructive transition-all"
                title="Cancel tour"
              >
                <X className="w-3.5 h-3.5" />
              </Button>

              {/* Content - COMPACT spacing */}
              <div className="relative p-4 sm:p-5 space-y-3">
                {/* Icon with minimal glow */}
                <div className="flex justify-center">
                  {/* Single glow ring */}
                  <motion.div 
                    className={`absolute w-12 h-12 rounded-full bg-gradient-to-br ${step.gradient} opacity-20 blur-xl`}
                    animate={{ scale: [1, 1.1, 1] }}
                    transition={{ duration: 3, repeat: Infinity }}
                  />
                  {/* Icon container - smaller */}
                  <motion.div 
                    className={`relative w-12 h-12 sm:w-14 sm:h-14 rounded-xl bg-gradient-to-br ${step.gradient} flex items-center justify-center shadow-md`}
                    whileHover={{ scale: 1.05 }}
                  >
                    <div className="text-white [&>svg]:w-5 [&>svg]:h-5 sm:[&>svg]:w-6 sm:[&>svg]:h-6">
                      {step.icon}
                    </div>
                  </motion.div>
                </div>

                {/* Step indicator dots - compact */}
                <div className="flex items-center justify-center gap-1">
                  {tourSteps.map((_, idx) => (
                    <button
                      key={idx}
                      onClick={() => setCurrentStep(idx)}
                      className={`h-1 rounded-full transition-all duration-300 ${
                        idx === currentStep 
                          ? `w-3 bg-gradient-to-r ${step.gradient}` 
                          : idx < currentStep 
                            ? 'w-1 bg-primary/50' 
                            : 'w-1 bg-muted'
                      }`}
                    />
                  ))}
                </div>

                {/* Title - smaller */}
                <h2 className="text-base sm:text-lg font-bold text-center">
                  {step.title}
                </h2>

                {/* Description - compact */}
                <p className="text-xs sm:text-sm text-muted-foreground text-center leading-relaxed">
                  {step.description}
                </p>

                {/* Features list - compact tags */}
                {step.features && (
                  <div className="flex flex-wrap justify-center gap-1">
                    {step.features.slice(0, 4).map((feature, idx) => (
                      <span
                        key={idx}
                        className="px-2 py-0.5 rounded-full text-[10px] sm:text-xs bg-muted/60 text-foreground/80 border border-border/30"
                      >
                        {feature}
                      </span>
                    ))}
                    {step.features.length > 4 && (
                      <span className="px-2 py-0.5 rounded-full text-[10px] sm:text-xs bg-muted/60 text-muted-foreground">
                        +{step.features.length - 4} more
                      </span>
                    )}
                  </div>
                )}

                {/* Tip badge - compact */}
                <div className="flex justify-center">
                  <div className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-gradient-to-r ${step.gradient} bg-opacity-10 border border-primary/20`}>
                    <Lightbulb className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-primary" />
                    <span className="text-xs sm:text-sm font-medium text-foreground/90">{step.tip}</span>
                  </div>
                </div>

                {/* Progress bar */}
                <div className="space-y-2">
                  <div className="w-full h-1.5 sm:h-2 rounded-full bg-muted/50 overflow-hidden">
                    <motion.div
                      className={`h-full bg-gradient-to-r ${step.gradient}`}
                      initial={{ width: 0 }}
                      animate={{ width: `${progress}%` }}
                      transition={{ duration: 0.5 }}
                    />
                  </div>
                  <p className="text-xs text-center text-muted-foreground">
                    Step {currentStep + 1} of {tourSteps.length}
                  </p>
                </div>

                {/* Navigation buttons */}
                <div className="flex items-center gap-2 sm:gap-3">
                  <Button
                    variant="outline"
                    onClick={handlePrev}
                    disabled={currentStep === 0}
                    className="flex-1 h-10 sm:h-12 rounded-xl disabled:opacity-30 text-xs sm:text-sm"
                  >
                    <ChevronLeft className="w-4 h-4 mr-1" />
                    Back
                  </Button>
                  
                  {step.action ? (
                    <Button
                      onClick={() => handleAction(step.action)}
                      className={`flex-1 h-10 sm:h-12 rounded-xl bg-gradient-to-r ${step.gradient} text-white border-0 shadow-lg hover:shadow-xl transition-all text-xs sm:text-sm`}
                    >
                      {step.action}
                      <ChevronRight className="w-4 h-4 ml-1" />
                    </Button>
                  ) : (
                    <Button
                      onClick={handleNext}
                      className={`flex-1 h-10 sm:h-12 rounded-xl bg-gradient-to-r ${step.gradient} text-white border-0 shadow-lg hover:shadow-xl transition-all text-xs sm:text-sm`}
                    >
                      {currentStep === tourSteps.length - 1 ? (
                        <>
                          Get Started
                          <Star className="w-4 h-4 ml-1" />
                        </>
                      ) : (
                        <>
                          Next
                          <ChevronRight className="w-4 h-4 ml-1" />
                        </>
                      )}
                    </Button>
                  )}
                </div>

                {/* Skip Tour button */}
                <div className="flex justify-center">
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={handleSkip}
                    className="text-xs text-muted-foreground hover:text-foreground"
                  >
                    Skip Tour →
                  </Button>
                </div>

                {/* Keyboard hint */}
                <p className="text-xs text-center text-muted-foreground/60">
                  Use ← → arrow keys • Esc to cancel
                </p>
              </div>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export default GuidedTour;
