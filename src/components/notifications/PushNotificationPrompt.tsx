import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Bell, BellOff, X, Smartphone } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { useWebPushNotifications } from '@/hooks/useWebPushNotifications';
import { supabase } from '@/integrations/supabase/client';

interface PushNotificationPromptProps {
  showAsDialog?: boolean;
  onClose?: () => void;
}

export function PushNotificationPrompt({ showAsDialog = false, onClose }: PushNotificationPromptProps) {
  const [isVisible, setIsVisible] = useState(false);
  const [hasInteracted, setHasInteracted] = useState(false);
  const {
    isSupported,
    permission,
    isSubscribed,
    isLoading,
    subscribeToPush,
    unsubscribeFromPush
  } = useWebPushNotifications();

  useEffect(() => {
    const checkShowPrompt = async () => {
      if (!isSupported || permission === 'denied') return;

      // Don't show if already subscribed - this is permanent
      if (isSubscribed) {
        localStorage.setItem('push-notifications-enabled', 'true');
        return;
      }

      // Check if user has already enabled notifications (permanent preference)
      const alreadyEnabled = localStorage.getItem('push-notifications-enabled');
      if (alreadyEnabled === 'true') return;

      // Check if user has dismissed before with "Not Now"
      const dismissed = localStorage.getItem('push-prompt-dismissed');
      if (dismissed) {
        const dismissedTime = parseInt(dismissed, 10);
        // Show again after 7 days only if dismissed with "Not Now"
        if (Date.now() - dismissedTime < 7 * 24 * 60 * 60 * 1000) return;
      }

      // Check if prompt was already shown in this session
      const shownThisSession = sessionStorage.getItem('push-prompt-shown');
      if (shownThisSession) return;

      // Check if user is logged in
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      // Mark as shown in this session to prevent repeated display
      sessionStorage.setItem('push-prompt-shown', 'true');

      // Show prompt after 3 seconds on page
      const timer = setTimeout(() => {
        setIsVisible(true);
      }, 3000);

      return () => clearTimeout(timer);
    };

    if (!showAsDialog) {
      checkShowPrompt();
    } else {
      setIsVisible(true);
    }
  }, [isSupported, permission, isSubscribed, showAsDialog]);

  const handleEnable = async () => {
    setHasInteracted(true);
    const success = await subscribeToPush();
    if (success) {
      // Mark as permanently enabled - never show again
      localStorage.setItem('push-notifications-enabled', 'true');
      localStorage.removeItem('push-prompt-dismissed');
      handleClose();
    }
  };

  const handleDisable = async () => {
    setHasInteracted(true);
    await unsubscribeFromPush();
    // Remove enabled flag when user disables
    localStorage.removeItem('push-notifications-enabled');
  };

  const handleDismiss = () => {
    localStorage.setItem('push-prompt-dismissed', Date.now().toString());
    handleClose();
  };

  const handleClose = () => {
    setIsVisible(false);
    onClose?.();
  };

  if (!isSupported || (permission === 'denied' && !showAsDialog)) {
    return null;
  }

  if (showAsDialog && !isVisible) return null;

  // Settings dialog variant
  if (showAsDialog) {
    return (
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className={`p-2 rounded-lg ${isSubscribed ? 'bg-green-500/20' : 'bg-muted'}`}>
              {isSubscribed ? (
                <Bell className="w-5 h-5 text-green-500" />
              ) : (
                <BellOff className="w-5 h-5 text-muted-foreground" />
              )}
            </div>
            <div>
              <p className="font-medium">Browser Push Notifications</p>
              <p className="text-sm text-muted-foreground">
                {isSubscribed 
                  ? 'Receive alerts even when browser is closed' 
                  : 'Get notified about important updates'}
              </p>
            </div>
          </div>
          
          <Button
            variant={isSubscribed ? 'outline' : 'default'}
            size="sm"
            onClick={isSubscribed ? handleDisable : handleEnable}
            disabled={isLoading || permission === 'denied'}
          >
            {isLoading ? (
              <span className="animate-pulse">...</span>
            ) : isSubscribed ? (
              'Disable'
            ) : permission === 'denied' ? (
              'Blocked'
            ) : (
              'Enable'
            )}
          </Button>
        </div>

        {permission === 'denied' && (
          <p className="text-xs text-destructive">
            Notifications are blocked. Please enable them in your browser settings.
          </p>
        )}
      </div>
    );
  }

  // Floating prompt variant
  return (
    <AnimatePresence>
      {isVisible && (
        <motion.div
          initial={{ opacity: 0, y: 100, scale: 0.9 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          exit={{ opacity: 0, y: 100, scale: 0.9 }}
          transition={{ type: 'spring', damping: 25, stiffness: 300 }}
          className="fixed bottom-4 left-4 right-4 md:left-auto md:right-4 md:w-96 z-50"
        >
          <Card className="border-2 border-primary/20 shadow-2xl bg-background/95 backdrop-blur-lg">
            <CardContent className="p-4">
              <button
                onClick={handleDismiss}
                className="absolute top-2 right-2 p-1 rounded-full hover:bg-muted transition-colors"
              >
                <X className="w-4 h-4 text-muted-foreground" />
              </button>

              <div className="flex items-start gap-4">
                <motion.div
                  animate={{ scale: [1, 1.1, 1] }}
                  transition={{ repeat: Infinity, duration: 2 }}
                  className="p-3 rounded-xl bg-gradient-to-br from-primary/20 to-accent/20"
                >
                  <Bell className="w-6 h-6 text-primary" />
                </motion.div>

                <div className="flex-1 pr-4">
                  <h4 className="font-semibold text-sm mb-1">
                    Stay Updated!
                  </h4>
                  <p className="text-xs text-muted-foreground mb-3">
                    Get notified about likes on your opinions, streak reminders, and new insights.
                  </p>

                  <div className="flex gap-2">
                    <Button
                      size="sm"
                      onClick={handleEnable}
                      disabled={isLoading}
                      className="gap-1 text-xs"
                    >
                      <Smartphone className="w-3 h-3" />
                      {isLoading ? 'Enabling...' : 'Enable'}
                    </Button>
                    <Button
                      size="sm"
                      variant="ghost"
                      onClick={handleDismiss}
                      className="text-xs"
                    >
                      Not Now
                    </Button>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
