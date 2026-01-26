import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { supabase } from "@/integrations/supabase/client";
import Navbar from "@/components/Navbar";
import { Footer } from "@/components/Footer";
import { ScrollToTop } from "@/components/ScrollToTop";
import { HypeItSection } from "@/components/hype/HypeItSection";
import { HypeInfoDropdown } from "@/components/hype/HypeInfoDropdown";
import { HypeStatsOverview } from "@/components/hype/HypeStatsOverview";
import { HypeAnalyticsDashboard } from "@/components/hype/HypeAnalyticsDashboard";
import { SwipeableHypeCard } from "@/components/hype/SwipeableHypeCard";
import { SEOHead } from "@/components/common/SEOHead";
import { useHypeSignals } from "@/hooks/useHypeSignals";
import { Flame, BarChart3, Smartphone } from "lucide-react";

export default function HypeIt() {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [activeView, setActiveView] = useState<'feed' | 'swipe' | 'analytics'>('feed');
  const { signals, userVotes, vote, currentUserId } = useHypeSignals();

  useEffect(() => {
    const checkAuth = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      
      if (!session) {
        navigate("/auth");
        return;
      }

      // Check if user completed onboarding
      const { data: profile } = await supabase
        .from("profiles")
        .select("onboarding_completed, user_type")
        .eq("id", session.user.id)
        .single();

      if (!profile?.onboarding_completed) {
        navigate("/onboarding");
        return;
      }

      setLoading(false);
    };

    checkAuth();
  }, [navigate]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="text-center"
        >
          <div className="w-12 h-12 border-4 border-primary border-t-transparent rounded-full animate-spin mx-auto" />
          <p className="mt-4 text-muted-foreground">Loading...</p>
        </motion.div>
      </div>
    );
  }

  // Filter signals user hasn't voted on for swipe mode
  const unvotedSignals = signals.filter(s => !userVotes[s.id]);

  return (
    <>
      <SEOHead
        title="Hype It - Signal What You Want | Inphrone"
        description="Tell the entertainment industry what you want to see created next. Launch signals, vote on ideas, and shape the future of content."
      />
      
      <div className="min-h-screen bg-background">
        <Navbar />
        
        <main className="container mx-auto px-4 py-8 pt-24">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="max-w-5xl mx-auto space-y-6"
          >
            {/* Hero Section */}
            <div className="text-center mb-8">
              <motion.h1
                initial={{ opacity: 0, y: -20 }}
                animate={{ opacity: 1, y: 0 }}
                className="text-4xl md:text-5xl font-bold mb-4"
              >
                <span className="bg-gradient-to-r from-orange-500 via-red-500 to-pink-500 bg-clip-text text-transparent">
                  Hype It
                </span>
              </motion.h1>
              <motion.p
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.2 }}
                className="text-xl text-muted-foreground max-w-2xl mx-auto"
              >
                Your voice, amplified. Tell studios, creators, and platforms exactly what you want to see next.
              </motion.p>
            </div>

            {/* Collapsible Info Section */}
            <HypeInfoDropdown />

            {/* Stats Overview */}
            <HypeStatsOverview />

            {/* View Tabs */}
            <Tabs value={activeView} onValueChange={(v) => setActiveView(v as any)} className="w-full">
              <TabsList className="grid w-full grid-cols-3">
                <TabsTrigger value="feed" className="gap-2">
                  <Flame className="w-4 h-4" />
                  <span className="hidden sm:inline">Feed</span>
                </TabsTrigger>
                <TabsTrigger value="swipe" className="gap-2">
                  <Smartphone className="w-4 h-4" />
                  <span className="hidden sm:inline">Swipe</span>
                </TabsTrigger>
                <TabsTrigger value="analytics" className="gap-2">
                  <BarChart3 className="w-4 h-4" />
                  <span className="hidden sm:inline">Analytics</span>
                </TabsTrigger>
              </TabsList>

              <TabsContent value="feed" className="mt-6">
                <HypeItSection showHeader={false} />
              </TabsContent>

              <TabsContent value="swipe" className="mt-6">
                <div className="max-w-md mx-auto">
                  {unvotedSignals.length > 0 ? (
                    <SwipeableHypeCard
                      signals={unvotedSignals}
                      onVote={vote}
                      currentUserId={currentUserId}
                    />
                  ) : (
                    <motion.div
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      className="text-center py-12"
                    >
                      <Flame className="w-16 h-16 mx-auto text-muted-foreground/50 mb-4" />
                      <h3 className="text-lg font-semibold mb-2">All caught up!</h3>
                      <p className="text-sm text-muted-foreground">
                        You've voted on all available signals. Check back later for new ones!
                      </p>
                    </motion.div>
                  )}
                </div>
              </TabsContent>

              <TabsContent value="analytics" className="mt-6">
                <HypeAnalyticsDashboard />
              </TabsContent>
            </Tabs>
          </motion.div>
        </main>
        
        <Footer />
        <ScrollToTop />
      </div>
    </>
  );
}
