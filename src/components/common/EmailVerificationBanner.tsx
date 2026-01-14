import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { AlertTriangle, Mail, X, RefreshCw } from "lucide-react";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { motion, AnimatePresence } from "framer-motion";

export function EmailVerificationBanner() {
  const [showBanner, setShowBanner] = useState(false);
  const [email, setEmail] = useState<string | null>(null);
  const [sending, setSending] = useState(false);
  const [dismissed, setDismissed] = useState(false);

  useEffect(() => {
    const checkEmailVerification = async () => {
      // Check if banner was dismissed in this session
      const dismissedUntil = sessionStorage.getItem('email_banner_dismissed');
      if (dismissedUntil) {
        const dismissedTime = parseInt(dismissedUntil);
        if (Date.now() < dismissedTime) {
          return;
        }
      }

      const { data: { user } } = await supabase.auth.getUser();
      
      if (user) {
        setEmail(user.email || null);
        
        // Check if email is confirmed
        // In Supabase, email_confirmed_at is set when email is verified
        const isVerified = user.email_confirmed_at !== null;
        
        if (!isVerified) {
          setShowBanner(true);
        }
      }
    };

    checkEmailVerification();

    // Listen for auth changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
      if (event === 'USER_UPDATED' && session?.user?.email_confirmed_at) {
        setShowBanner(false);
        toast.success("Email verified successfully! 🎉");
      }
    });

    return () => {
      subscription.unsubscribe();
    };
  }, []);

  const handleResendVerification = async () => {
    if (!email) return;

    setSending(true);
    try {
      const { error } = await supabase.auth.resend({
        type: 'signup',
        email: email,
      });

      if (error) throw error;

      toast.success("Verification email sent! Check your inbox.");
    } catch (error: any) {
      toast.error(error.message || "Failed to send verification email");
    } finally {
      setSending(false);
    }
  };

  const handleDismiss = () => {
    // Dismiss for 1 hour
    sessionStorage.setItem('email_banner_dismissed', String(Date.now() + 3600000));
    setDismissed(true);
    setTimeout(() => setShowBanner(false), 300);
  };

  if (!showBanner) return null;

  return (
    <AnimatePresence>
      {!dismissed && (
        <motion.div
          initial={{ height: 0, opacity: 0 }}
          animate={{ height: "auto", opacity: 1 }}
          exit={{ height: 0, opacity: 0 }}
          transition={{ duration: 0.3 }}
          className="overflow-hidden"
        >
          <div className="bg-gradient-to-r from-warning/20 via-warning/10 to-warning/20 border-b border-warning/30">
            <div className="container mx-auto px-4 py-3">
              <div className="flex items-center justify-between gap-4 flex-wrap">
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-warning/20 rounded-full">
                    <AlertTriangle className="w-4 h-4 text-warning-foreground" />
                  </div>
                  <div className="flex flex-col sm:flex-row sm:items-center gap-1 sm:gap-2">
                    <span className="font-medium text-sm text-foreground">
                      Please verify your email
                    </span>
                    <span className="text-xs text-muted-foreground hidden sm:inline">•</span>
                    <span className="text-xs text-muted-foreground">
                      {email}
                    </span>
                  </div>
                </div>
                
                <div className="flex items-center gap-2">
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={handleResendVerification}
                    disabled={sending}
                    className="text-xs border-warning/50 hover:bg-warning/10"
                  >
                    {sending ? (
                      <RefreshCw className="w-3 h-3 mr-1 animate-spin" />
                    ) : (
                      <Mail className="w-3 h-3 mr-1" />
                    )}
                    Resend Email
                  </Button>
                  <Button
                    size="sm"
                    variant="ghost"
                    onClick={handleDismiss}
                    className="p-1 h-auto hover:bg-warning/10"
                  >
                    <X className="w-4 h-4" />
                  </Button>
                </div>
              </div>
            </div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
