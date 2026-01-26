import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Flame, TrendingUp, ArrowRight, Sparkles, Lock } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { supabase } from "@/integrations/supabase/client";
import { useNavigate } from "react-router-dom";
import { cn } from "@/lib/utils";

interface TrendingSignal {
  id: string;
  phrase: string;
  signal_score: number;
  hype_count: number;
  category_name: string;
  category_color: string;
}

interface TrendingSignalsProps {
  limit?: number;
  showHeader?: boolean;
  className?: string;
}

export function TrendingSignals({ 
  limit = 5, 
  showHeader = true,
  className 
}: TrendingSignalsProps) {
  const [signals, setSignals] = useState<TrendingSignal[]>([]);
  const [loading, setLoading] = useState(true);
  const [isAuthenticated, setIsAuthenticated] = useState<boolean | null>(null);
  const [showBlur, setShowBlur] = useState(false);
  const [showSignInOverlay, setShowSignInOverlay] = useState(false);
  const navigate = useNavigate();

  // Check auth status
  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      setIsAuthenticated(!!session);
    });
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_, session) => {
      setIsAuthenticated(!!session);
    });
    return () => subscription.unsubscribe();
  }, []);

  // Show data for 5 seconds, then blur, then 2 seconds later show overlay
  useEffect(() => {
    if (isAuthenticated === false && !loading) {
      // After 5 seconds, blur the content
      const blurTimer = setTimeout(() => setShowBlur(true), 5000);
      // After 7 seconds (5s visible + 2s blur), show sign-in overlay
      const overlayTimer = setTimeout(() => setShowSignInOverlay(true), 7000);
      return () => {
        clearTimeout(blurTimer);
        clearTimeout(overlayTimer);
      };
    }
  }, [isAuthenticated, loading]);

  useEffect(() => {
    const fetchTrending = async () => {
      try {
        const { data, error } = await supabase
          .from("hype_signals")
          .select(`
            id,
            phrase,
            signal_score,
            hype_count,
            categories:category_id (name, color)
          `)
          .eq("is_archived", false)
          .gt("expires_at", new Date().toISOString())
          .order("signal_score", { ascending: false })
          .limit(limit);

        if (error) throw error;

        if (data) {
          setSignals(data.map((s: any) => ({
            id: s.id,
            phrase: s.phrase,
            signal_score: s.signal_score,
            hype_count: s.hype_count,
            category_name: s.categories?.name || 'Unknown',
            category_color: s.categories?.color || '#666',
          })));
        }
      } catch (error) {
        console.error("Error fetching trending signals:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchTrending();

    // Real-time updates
    const channel = supabase
      .channel('trending-signals')
      .on(
        'postgres_changes',
        { event: 'UPDATE', schema: 'public', table: 'hype_signals' },
        () => fetchTrending()
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [limit]);

  if (loading) {
    return (
      <div className={cn("space-y-3", className)}>
        {Array.from({ length: limit }).map((_, i) => (
          <div key={i} className="h-14 rounded-lg bg-muted/50 animate-pulse" />
        ))}
      </div>
    );
  }

  if (signals.length === 0) {
    return null;
  }

  const isBlurred = showBlur && !isAuthenticated;

  return (
    <div className={cn("space-y-4 relative", className)}>
      {/* Hype It Header */}
      {showHeader && (
        <motion.div 
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex items-center gap-2 mb-2"
        >
          <motion.div
            animate={{ 
              scale: [1, 1.2, 1],
              rotate: [0, 5, -5, 0]
            }}
            transition={{ duration: 1.5, repeat: Infinity }}
          >
            <Flame className="w-6 h-6 text-orange-500" />
          </motion.div>
          <h2 className="text-xl font-black bg-gradient-to-r from-orange-500 to-red-500 bg-clip-text text-transparent">
            Hype It
          </h2>
        </motion.div>
      )}

      {/* Sign-in Overlay for non-authenticated users */}
      <AnimatePresence>
        {showSignInOverlay && !isAuthenticated && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="absolute inset-0 z-20 flex items-center justify-center bg-background/95 backdrop-blur-xl rounded-2xl"
          >
            <div className="text-center p-6">
              <motion.div
                className="w-12 h-12 rounded-xl bg-gradient-to-br from-orange-500 to-red-500 flex items-center justify-center mx-auto mb-4 shadow-xl"
                animate={{ rotate: [0, 5, -5, 0] }}
                transition={{ duration: 4, repeat: Infinity }}
              >
                <Lock className="w-6 h-6 text-white" />
              </motion.div>
              <h3 className="font-bold text-lg mb-2">See What's Trending</h3>
              <p className="text-sm text-muted-foreground mb-4">
                Sign in to view real-time signals and vote on what you want next
              </p>
              <Button 
                onClick={() => navigate("/auth")}
                className="bg-gradient-to-r from-orange-500 to-red-500 hover:from-orange-600 hover:to-red-600 text-white"
              >
                <Sparkles className="w-4 h-4 mr-2" />
                Sign In
              </Button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      <div className={cn(
        isBlurred && "blur-md pointer-events-none",
        "transition-all duration-500"
      )}>
      {showHeader && (
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Flame className="w-5 h-5 text-orange-500" />
              <h3 className="font-bold text-lg">What India Wants Next</h3>
            </div>
            <Button 
              variant="ghost" 
              size="sm"
              onClick={() => navigate('/hype')}
              className="text-primary hover:text-primary"
            >
              View All
              <ArrowRight className="w-4 h-4 ml-1" />
            </Button>
          </div>
          {/* Explanation of Hype It */}
          <div className="p-3 rounded-lg bg-gradient-to-r from-orange-500/10 to-red-500/10 border border-orange-500/20">
            <p className="text-sm text-muted-foreground">
              <span className="font-semibold text-orange-500">🔥 Hype It</span> — Tell studios what YOU want! These are real-time signals from users voting on content ideas. 
              <span className="text-foreground font-medium"> Higher scores = more demand.</span>
            </p>
          </div>
        </div>
      )}

      <div className="space-y-2">
        {signals.map((signal, index) => (
          <motion.div
            key={signal.id}
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: index * 0.1 }}
            className={cn(
              "flex items-center gap-3 p-3 rounded-lg",
              "bg-card/50 backdrop-blur-sm border border-border/50",
              "hover:bg-card/80 transition-all cursor-pointer group"
            )}
            onClick={() => navigate('/hype')}
          >
            {/* Rank */}
            <div className={cn(
              "w-8 h-8 rounded-full flex items-center justify-center font-bold text-sm shrink-0",
              index === 0 && "bg-gradient-to-r from-orange-500 to-red-500 text-white",
              index === 1 && "bg-gradient-to-r from-gray-300 to-gray-400 text-gray-800",
              index === 2 && "bg-gradient-to-r from-amber-600 to-amber-700 text-white",
              index > 2 && "bg-muted text-muted-foreground"
            )}>
              {index + 1}
            </div>

            {/* Content */}
            <div className="flex-1 min-w-0">
              <p className="font-semibold text-foreground truncate group-hover:text-primary transition-colors">
                "{signal.phrase}"
              </p>
              <div className="flex items-center gap-2 mt-0.5">
                <Badge 
                  variant="outline" 
                  className="text-xs px-1.5 py-0"
                  style={{ 
                    borderColor: signal.category_color,
                    color: signal.category_color 
                  }}
                >
                  {signal.category_name}
                </Badge>
              </div>
            </div>

            {/* Score */}
            <div className="flex items-center gap-1 text-orange-500 font-semibold">
              <TrendingUp className="w-4 h-4" />
              <span>+{signal.signal_score}</span>
            </div>
          </motion.div>
        ))}
      </div>

      {/* CTA */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.5 }}
        className="pt-2"
      >
        <Button
          onClick={() => navigate('/hype')}
          className="w-full gap-2 bg-gradient-to-r from-orange-500 to-red-500 hover:from-orange-600 hover:to-red-600 text-white"
        >
          <Sparkles className="w-4 h-4" />
          Launch Your Signal
        </Button>
      </motion.div>
      </div>
    </div>
  );
}
