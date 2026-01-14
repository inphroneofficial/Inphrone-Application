import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Cookie } from "lucide-react";

export function CookieConsent() {
  const [showConsent, setShowConsent] = useState(false);

  useEffect(() => {
    // Check if user has already accepted cookies
    const hasConsent = localStorage.getItem("inphrone-cookie-consent");
    if (!hasConsent) {
      // Show consent banner after 2 seconds
      const timer = setTimeout(() => setShowConsent(true), 2000);
      return () => clearTimeout(timer);
    }
  }, []);

  const handleAccept = () => {
    localStorage.setItem("inphrone-cookie-consent", "accepted");
    setShowConsent(false);
  };

  const handleDecline = () => {
    localStorage.setItem("inphrone-cookie-consent", "declined");
    setShowConsent(false);
  };

  return (
    <AnimatePresence>
      {showConsent && (
        <motion.div
          initial={{ y: 100, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          exit={{ y: 100, opacity: 0 }}
          className="fixed bottom-4 left-4 right-4 md:left-auto md:right-4 md:max-w-md z-50"
        >
          <Card className="shadow-2xl border-2 border-primary/20">
            <CardContent className="p-4 md:p-6">
              <div className="flex items-start gap-3 mb-4">
                <Cookie className="w-6 h-6 text-primary flex-shrink-0 mt-1" />
                <div>
                  <h3 className="font-semibold text-lg mb-2">Cookie Preferences</h3>
                  <p className="text-sm text-muted-foreground leading-relaxed mb-3">
                    We use first-party and essential cookies to provide you with a better experience,
                    analyze site usage, and assist with our marketing efforts.
                  </p>
                  <div className="text-xs text-muted-foreground space-y-2 mb-2">
                    <p><strong>Accept All:</strong> Allows all cookies including analytics and marketing to improve your experience.</p>
                    <p><strong>Essential Only:</strong> Only uses necessary cookies required for the site to function properly.</p>
                  </div>
                </div>
              </div>
              <div className="flex flex-col sm:flex-row gap-2">
                <Button
                  onClick={handleAccept}
                  className="flex-1 bg-primary hover:bg-primary/90"
                >
                  Accept All
                </Button>
                <Button
                  onClick={handleDecline}
                  variant="outline"
                  className="flex-1"
                >
                  Essential Only
                </Button>
              </div>
              <p className="text-xs text-muted-foreground mt-3">
                Learn more in our{" "}
                <a href="/privacy-policy" className="underline hover:text-primary">
                  Privacy Policy
                </a>
              </p>
            </CardContent>
          </Card>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
