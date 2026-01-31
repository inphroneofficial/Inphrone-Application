import React, { useState, useEffect } from "react";
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, useLocation } from "react-router-dom";
import { AnimatePresence } from "framer-motion";
import LoadingScreen from "./components/LoadingScreen";
import Landing from "./pages/Landing";
import About from "./pages/About";
import Auth from "./pages/Auth";
import ForgotPassword from "./pages/ForgotPassword";
import PasswordReset from "./pages/PasswordReset";
import Onboarding from "./pages/Onboarding";
import Dashboard from "./pages/Dashboard";
import CategoryDetail from "./pages/CategoryDetail";
import Stats from "./pages/Stats";
import Insights from "./pages/Insights";
import Profile from "./pages/Profile";
import MyCoupons from "./pages/MyCoupons";
import CouponAnalytics from "./pages/CouponAnalytics";
import CouponWishlist from "./pages/CouponWishlist";
import NotFound from "./pages/NotFound";
import PrivacyPolicy from "./pages/PrivacyPolicy";
import Terms from "./pages/Terms";
import Careers from "./pages/Careers";
import Blog from "./pages/Blog";
import FAQ from "./pages/FAQ";
import HelpCenter from "./pages/HelpCenter";
import Reviews from "./pages/Reviews";
import Contact from "./pages/Contact";
import Feedback from "./pages/Feedback";
import Admin from "./pages/Admin";
import InphroSync from "./pages/InphroSync";
import YourTurn from "./pages/YourTurn";
import HypeIt from "./pages/HypeIt";
import FounderPage from "./pages/FounderPage";
import { supabase } from "@/integrations/supabase/client";
import { ChatBot } from "./components/ChatBot";
import { CookieConsent } from "./components/CookieConsent";
import { useWeeklyNotifications } from "./hooks/useWeeklyNotifications";
import { useCouponReminders } from "./hooks/useCouponReminders";
import { useComprehensiveNotifications } from "./hooks/useComprehensiveNotifications";
import { PageTransition } from "./components/PageTransition";
import { useThemePersistence } from "./hooks/useThemePersistence";
import { LanguageProvider } from "./components/SettingsDialog";
import { SpotlightTourProvider } from "./components/onboarding/SpotlightTourProvider";
import { PushNotificationPrompt } from "./components/notifications/PushNotificationPrompt";
import { ErrorBoundary } from "./components/ErrorBoundary";
import { OfflineIndicator } from "./components/common/OfflineIndicator";
import { EmailVerificationBanner } from "./components/common/EmailVerificationBanner";
import { useIndustryViewNotifications, IndustryViewNotificationPopup } from "./components/notifications/IndustryViewNotification";

const queryClient = new QueryClient();

// Animated routes wrapper component
function AnimatedRoutes() {
  const location = useLocation();
  const { loadAndApplyTheme } = useThemePersistence();
  
  // Re-apply theme when route changes
  useEffect(() => {
    loadAndApplyTheme();
  }, [location.pathname, loadAndApplyTheme]);
  
  return (
    <AnimatePresence mode="wait">
      <Routes location={location} key={location.pathname}>
        <Route path="/" element={<PageTransition><Landing /></PageTransition>} />
        <Route path="/about" element={<PageTransition><About /></PageTransition>} />
        <Route path="/about/founder" element={<PageTransition><FounderPage /></PageTransition>} />
        <Route path="/auth" element={<PageTransition><Auth /></PageTransition>} />
        <Route path="/forgot-password" element={<PageTransition><ForgotPassword /></PageTransition>} />
        <Route path="/password-reset" element={<PageTransition><PasswordReset /></PageTransition>} />
        <Route path="/onboarding" element={<PageTransition><Onboarding /></PageTransition>} />
        <Route path="/dashboard" element={<PageTransition><Dashboard /></PageTransition>} />
        <Route path="/category/:id" element={<PageTransition><CategoryDetail /></PageTransition>} />
        <Route path="/stats" element={<PageTransition><Stats /></PageTransition>} />
        <Route path="/insights" element={<PageTransition><Insights /></PageTransition>} />
        <Route path="/profile" element={<PageTransition><Profile /></PageTransition>} />
        <Route path="/my-coupons" element={<PageTransition><MyCoupons /></PageTransition>} />
        <Route path="/coupon-analytics" element={<PageTransition><CouponAnalytics /></PageTransition>} />
        <Route path="/coupon-wishlist" element={<PageTransition><CouponWishlist /></PageTransition>} />
        <Route path="/privacy-policy" element={<PageTransition><PrivacyPolicy /></PageTransition>} />
        <Route path="/terms" element={<PageTransition><Terms /></PageTransition>} />
        <Route path="/careers" element={<PageTransition><Careers /></PageTransition>} />
        <Route path="/blog" element={<PageTransition><Blog /></PageTransition>} />
        <Route path="/faq" element={<PageTransition><FAQ /></PageTransition>} />
        <Route path="/help-center" element={<PageTransition><HelpCenter /></PageTransition>} />
        <Route path="/reviews" element={<PageTransition><Reviews /></PageTransition>} />
        <Route path="/contact" element={<PageTransition><Contact /></PageTransition>} />
        <Route path="/feedback" element={<PageTransition><Feedback /></PageTransition>} />
        <Route path="/admin" element={<PageTransition><Admin /></PageTransition>} />
        <Route path="/inphrosync" element={<PageTransition><InphroSync /></PageTransition>} />
        <Route path="/yourturn" element={<PageTransition><YourTurn /></PageTransition>} />
        <Route path="/hype" element={<PageTransition><HypeIt /></PageTransition>} />
        <Route path="/hype-it" element={<PageTransition><HypeIt /></PageTransition>} />
        <Route path="*" element={<PageTransition><NotFound /></PageTransition>} />
      </Routes>
    </AnimatePresence>
  );
}

const App = () => {
  const [loading, setLoading] = useState(() => {
    // Only show loading on initial app load, not on hot reloads
    if (typeof window !== 'undefined' && sessionStorage.getItem('inphrone_loaded')) {
      return false;
    }
    return true;
  });
  const [currentUserId, setCurrentUserId] = useState<string | null>(null);
  
  // Get current user ID for notifications
  useEffect(() => {
    const getUserId = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      setCurrentUserId(user?.id || null);
    };
    getUserId();
  }, []);
  
  // Initialize all notification systems
  useWeeklyNotifications();
  useCouponReminders();
  useComprehensiveNotifications(currentUserId);
  
  // Industry view notifications for audience users
  const { showNotification, currentNotification, dismissNotification } = useIndustryViewNotifications(currentUserId);

  // Mark as loaded after loading screen completes
  const handleLoadingComplete = () => {
    setLoading(false);
    sessionStorage.setItem('inphrone_loaded', 'true');
    window.scrollTo(0, 0); // Scroll to top after loading
  };

  // Monitor auth state changes to prevent stuck states
  useEffect(() => {
    const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
      if (event === 'SIGNED_OUT') {
        // Clear any stuck states on sign out
        setLoading(false);
      }
      if (event === 'TOKEN_REFRESHED') {
        console.log('Token refreshed successfully');
      }
    });

    return () => subscription.unsubscribe();
  }, []);

// Session management is handled by the SDK (persistSession + autoRefresh).

  // Show loading screen with fixed positioning that covers everything
  if (loading) {
    return (
      <QueryClientProvider client={queryClient}>
        <TooltipProvider>
          <LoadingScreen onComplete={handleLoadingComplete} duration={4000} />
        </TooltipProvider>
      </QueryClientProvider>
    );
  }

  return (
    <ErrorBoundary>
      <QueryClientProvider client={queryClient}>
        <LanguageProvider>
          <TooltipProvider>
            <Toaster />
            <Sonner />
            <OfflineIndicator />
            <BrowserRouter>
              <EmailVerificationBanner />
              <AnimatedRoutes />
              <SpotlightTourProvider />
              <ChatBot />
              <CookieConsent />
              <PushNotificationPrompt />
              <IndustryViewNotificationPopup
                notification={currentNotification}
                isVisible={showNotification}
                onDismiss={dismissNotification}
              />
            </BrowserRouter>
          </TooltipProvider>
        </LanguageProvider>
      </QueryClientProvider>
    </ErrorBoundary>
  );
};

export default App;
