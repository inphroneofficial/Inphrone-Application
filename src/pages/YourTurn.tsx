import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Loader2, Sparkles, Users, Zap, Trophy, Clock, Target, Crown } from "lucide-react";
import { NavigationControls } from "@/components/NavigationControls";
import { toast } from "sonner";
import { ScrollToTop } from "@/components/ScrollToTop";
import { motion } from "framer-motion";
import { YourTurnSection } from "@/components/yourturn";

export default function YourTurn() {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [userType, setUserType] = useState<string | null>(null);
  const [isAudience, setIsAudience] = useState(false);
  const [showInfo, setShowInfo] = useState(false);
  const [userId, setUserId] = useState<string | null>(null);

  useEffect(() => {
    checkAuth();
  }, []);

  const checkAuth = async () => {
    try {
      const { data: { session } } = await supabase.auth.getSession();
      
      if (!session) {
        navigate("/auth");
        return;
      }

      setUserId(session.user.id);

      const { data: profile, error: profileError } = await supabase
        .from("profiles")
        .select("user_type")
        .eq("id", session.user.id)
        .single();

      if (profileError) throw profileError;
      
      const audience = profile.user_type === "audience";
      setUserType(profile.user_type);
      setIsAudience(audience);
    } catch (error) {
      console.error("Error checking auth:", error);
      toast.error("Failed to load Your Turn");
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="flex flex-col items-center gap-4">
          <Loader2 className="w-10 h-10 animate-spin text-primary" />
          <p className="text-muted-foreground animate-pulse">Loading Your Turn...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-background to-accent/5 pt-16">
      {/* Animated Background Elements */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <motion.div
          className="absolute top-20 left-10 w-96 h-96 rounded-full blur-3xl opacity-10"
          style={{ background: "hsl(var(--accent))" }}
          animate={{
            scale: [1, 1.2, 1],
            opacity: [0.1, 0.15, 0.1],
          }}
          transition={{
            duration: 8,
            repeat: Infinity,
            ease: "easeInOut",
          }}
        />
        <motion.div
          className="absolute bottom-20 right-10 w-96 h-96 rounded-full blur-3xl opacity-10"
          style={{ background: "hsl(var(--primary))" }}
          animate={{
            scale: [1, 1.3, 1],
            opacity: [0.1, 0.12, 0.1],
          }}
          transition={{
            duration: 10,
            repeat: Infinity,
            ease: "easeInOut",
            delay: 1,
          }}
        />
        {/* Crown floating animation */}
        <motion.div
          className="absolute top-40 right-20 opacity-5"
          animate={{
            y: [0, -20, 0],
            rotate: [0, 10, 0],
          }}
          transition={{
            duration: 6,
            repeat: Infinity,
            ease: "easeInOut",
          }}
        >
          <Crown className="w-32 h-32 text-accent" />
        </motion.div>
      </div>

      <div className="relative z-10 container max-w-6xl mx-auto px-4 py-8">
        {/* Navigation Controls */}
        <div className="mb-6">
          <NavigationControls showHome={true} showBack={true} />
        </div>

        {/* Header */}
        <motion.div
          className="text-center mb-12"
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
        >
          <motion.div
            className="inline-flex items-center gap-3 mb-4"
            animate={{ scale: [1, 1.02, 1] }}
            transition={{ duration: 3, repeat: Infinity, ease: "easeInOut" }}
          >
            <Trophy className="w-8 h-8 text-accent" />
            <h1 className="text-5xl font-bold bg-gradient-to-r from-accent to-primary bg-clip-text text-transparent">
              Your Turn
            </h1>
            <Crown className="w-8 h-8 text-primary" />
          </motion.div>
          
          <p className="text-lg text-muted-foreground mb-4">
            Win the Slot. Ask the Question. Shape Entertainment Trends.
          </p>
          
          {/* Feature badges */}
          <motion.div
            className="flex flex-wrap items-center justify-center gap-3 mt-6"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.3 }}
          >
            <div className="px-4 py-2 bg-accent/10 border border-accent/20 rounded-full backdrop-blur-sm flex items-center gap-2">
              <Clock className="w-4 h-4 text-accent" />
              <span className="text-sm font-medium text-accent">
                3 Daily Slots
              </span>
            </div>
            <div className="px-4 py-2 bg-primary/10 border border-primary/20 rounded-full backdrop-blur-sm flex items-center gap-2">
              <Zap className="w-4 h-4 text-primary" />
              <span className="text-sm font-medium text-primary">
                20 Seconds
              </span>
            </div>
            <div className="px-4 py-2 bg-green-500/10 border border-green-500/20 rounded-full backdrop-blur-sm flex items-center gap-2">
              <Target className="w-4 h-4 text-green-500" />
              <span className="text-sm font-medium text-green-500">
                First Click Wins
              </span>
            </div>
            <motion.button
              className="px-4 py-2 bg-muted/50 border border-border rounded-full text-sm font-medium text-muted-foreground hover:bg-muted transition-all backdrop-blur-sm"
              onClick={() => setShowInfo(!showInfo)}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              ℹ️ {showInfo ? "Hide" : "How It Works"}
            </motion.button>
          </motion.div>
        </motion.div>

        {/* Info Section */}
        {showInfo && (
          <motion.div
            className="mb-8 p-8 bg-gradient-to-br from-accent/10 to-primary/10 border border-accent/20 rounded-3xl backdrop-blur-sm"
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            transition={{ duration: 0.5 }}
          >
            <div className="space-y-6">
              <div className="text-center">
                <h3 className="text-2xl font-bold mb-3 bg-gradient-to-r from-accent to-primary bg-clip-text text-transparent">
                  Welcome to Your Turn!
                </h3>
                <p className="text-muted-foreground leading-relaxed max-w-2xl mx-auto">
                  Your Turn is your chance to shape entertainment conversations across all 8 categories. Three times daily (9 AM, 2 PM, 7 PM IST), 
                  compete for the chance to ask YOUR entertainment question to the entire Inphrone community! The fastest click within the 20-second window wins.
                  Winners submit questions with up to 4 voting options, and the community votes until midnight.
                </p>
              </div>
              
              <div className="grid md:grid-cols-4 gap-4">
                <div className="p-5 bg-background/50 rounded-xl border border-border/50 text-center">
                  <div className="w-14 h-14 mx-auto mb-3 rounded-2xl bg-gradient-to-br from-accent/20 to-accent/10 flex items-center justify-center">
                    <Clock className="w-7 h-7 text-accent" />
                  </div>
                  <h4 className="font-semibold mb-2">3 Daily Slots</h4>
                  <p className="text-sm text-muted-foreground">
                    9 AM, 2 PM, and 7 PM IST
                  </p>
                </div>
                
                <div className="p-5 bg-background/50 rounded-xl border border-border/50 text-center">
                  <div className="w-14 h-14 mx-auto mb-3 rounded-2xl bg-gradient-to-br from-primary/20 to-primary/10 flex items-center justify-center">
                    <Zap className="w-7 h-7 text-primary" />
                  </div>
                  <h4 className="font-semibold mb-2">20 Second Window</h4>
                  <p className="text-sm text-muted-foreground">
                    Click "I'M IN!" within the countdown
                  </p>
                </div>
                
                <div className="p-5 bg-background/50 rounded-xl border border-border/50 text-center">
                  <div className="w-14 h-14 mx-auto mb-3 rounded-2xl bg-gradient-to-br from-green-500/20 to-green-500/10 flex items-center justify-center">
                    <Trophy className="w-7 h-7 text-green-500" />
                  </div>
                  <h4 className="font-semibold mb-2">First Click Wins</h4>
                  <p className="text-sm text-muted-foreground">
                    Fastest click claims the slot
                  </p>
                </div>
                
                <div className="p-5 bg-background/50 rounded-xl border border-border/50 text-center">
                  <div className="w-14 h-14 mx-auto mb-3 rounded-2xl bg-gradient-to-br from-purple-500/20 to-purple-500/10 flex items-center justify-center">
                    <Crown className="w-7 h-7 text-purple-500" />
                  </div>
                  <h4 className="font-semibold mb-2">Ask Your Question</h4>
                  <p className="text-sm text-muted-foreground">
                    Winners submit entertainment questions
                  </p>
                </div>
              </div>
              
              <div className="p-5 bg-gradient-to-r from-accent/5 to-primary/5 rounded-xl border border-accent/10">
                <div className="flex items-center justify-center gap-2 mb-3">
                  <Users className="w-5 h-5 text-accent" />
                  <h4 className="font-semibold text-foreground">Open to All Audience Members</h4>
                </div>
                <p className="text-sm text-muted-foreground text-center max-w-xl mx-auto">
                  Every audience member can participate! Win the slot to ask entertainment-related questions 
                  that everyone can vote on. Your questions shape what we discuss!
                </p>
              </div>
            </div>
          </motion.div>
        )}

        {/* Non-Audience Access Notice */}
        {!isAudience && (
          <motion.div
            className="mb-8 p-6 bg-muted/50 border border-border rounded-2xl backdrop-blur-sm"
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.5, delay: 0.2 }}
          >
            <div className="flex items-center gap-3">
              <Trophy className="w-5 h-5 text-accent flex-shrink-0" />
              <div>
                <p className="font-semibold text-foreground">
                  Analytics View Mode
                </p>
                <p className="text-sm text-muted-foreground mt-1">
                  As a {userType} professional, you can view Your Turn questions and voting trends but cannot claim slots or submit questions.
                </p>
              </div>
            </div>
          </motion.div>
        )}

        {/* Main Your Turn Content */}
        <motion.div
          className="mt-8"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.6, delay: 0.4 }}
        >
          {userId && <YourTurnSection userId={userId} isAudience={isAudience} userType={userType || undefined} />}
        </motion.div>
      </div>
      
      <ScrollToTop />
    </div>
  );
}
