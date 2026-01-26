import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Flame, Lock, LogIn } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { HypeItSection } from "./HypeItSection";

export function HypeItHomeSection() {
  const [isAuthenticated, setIsAuthenticated] = useState<boolean | null>(null);
  const [showBlur, setShowBlur] = useState(false);
  const [showSignInOverlay, setShowSignInOverlay] = useState(false);
  const navigate = useNavigate();

  // Check auth status
  useEffect(() => {
    const checkAuth = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      setIsAuthenticated(!!session);
    };
    checkAuth();

    const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
      setIsAuthenticated(!!session);
    });

    return () => subscription.unsubscribe();
  }, []);

  // 5-second preview timer for non-authenticated users
  useEffect(() => {
    if (isAuthenticated === false) {
      // Start blur after 5 seconds
      const blurTimer = setTimeout(() => {
        setShowBlur(true);
      }, 5000);

      // Show sign-in overlay 2 seconds after blur starts
      const overlayTimer = setTimeout(() => {
        setShowSignInOverlay(true);
      }, 7000);

      return () => {
        clearTimeout(blurTimer);
        clearTimeout(overlayTimer);
      };
    }
  }, [isAuthenticated]);

  return (
    <section className="py-16 md:py-24 relative">
      <div className="container mx-auto px-4">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="max-w-4xl mx-auto"
        >
          {/* Section Header with animated Hype It branding */}
          <div className="text-center mb-8">
            <motion.div 
              className="inline-flex items-center gap-2 mb-4"
              animate={{ scale: [1, 1.02, 1] }}
              transition={{ duration: 2, repeat: Infinity }}
            >
              <motion.div
                animate={{ 
                  rotate: [0, 10, -10, 0],
                  scale: [1, 1.1, 1]
                }}
                transition={{ duration: 1.5, repeat: Infinity }}
              >
                <Flame className="w-10 h-10 text-orange-500" />
              </motion.div>
              <h2 className="text-3xl md:text-4xl font-bold bg-gradient-to-r from-orange-500 via-red-500 to-pink-500 bg-clip-text text-transparent">
                Hype It
              </h2>
            </motion.div>
            <p className="text-muted-foreground max-w-lg mx-auto">
              Signal what you want to see created next. Your voice shapes entertainment.
            </p>
          </div>

          {/* Content with blur/overlay for non-authenticated users */}
          <div className="relative">
            <motion.div
              className="p-6 md:p-8 rounded-3xl bg-background/60 backdrop-blur-xl border border-border/50 shadow-lg"
              animate={{
                filter: showBlur ? "blur(8px)" : "blur(0px)",
              }}
              transition={{ duration: 2 }}
            >
              <HypeItSection 
                showHeader={false} 
                compact={true}
              />
            </motion.div>

            {/* Sign-in Overlay */}
            <AnimatePresence>
              {showSignInOverlay && (
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  className="absolute inset-0 flex items-center justify-center z-20"
                >
                  <motion.div
                    initial={{ scale: 0.9, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1 }}
                    className="bg-card/95 backdrop-blur-xl border border-border/50 rounded-2xl p-8 shadow-2xl text-center max-w-sm mx-4"
                  >
                    <motion.div
                      className="w-16 h-16 rounded-2xl bg-gradient-to-br from-orange-500 to-red-500 flex items-center justify-center mx-auto mb-4 shadow-lg"
                      animate={{ 
                        rotate: [0, 5, -5, 0],
                        scale: [1, 1.05, 1]
                      }}
                      transition={{ duration: 3, repeat: Infinity }}
                    >
                      <Lock className="w-8 h-8 text-white" />
                    </motion.div>
                    <h3 className="text-xl font-bold mb-2">
                      Unlock Hype It
                    </h3>
                    <p className="text-muted-foreground text-sm mb-6">
                      Sign in to signal what entertainment you want to see next
                    </p>
                    <Button
                      onClick={() => navigate("/auth")}
                      className="gap-2 bg-gradient-to-r from-orange-500 to-red-500 hover:from-orange-600 hover:to-red-600 text-white border-0 shadow-lg"
                    >
                      <LogIn className="w-4 h-4" />
                      Sign In / Sign Up
                    </Button>
                  </motion.div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </motion.div>
      </div>
    </section>
  );
}
