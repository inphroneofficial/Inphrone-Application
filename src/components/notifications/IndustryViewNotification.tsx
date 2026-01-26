import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { motion, AnimatePresence } from "framer-motion";
import { Building2, Eye, Sparkles, X } from "lucide-react";
import { Button } from "@/components/ui/button";

interface ViewNotification {
  id: string;
  viewerType: string;
  viewerName: string;
  opinionTitle: string;
  timestamp: Date;
}

export function useIndustryViewNotifications(userId: string | null) {
  const [notifications, setNotifications] = useState<ViewNotification[]>([]);
  const [showNotification, setShowNotification] = useState(false);
  const [currentNotification, setCurrentNotification] = useState<ViewNotification | null>(null);

  useEffect(() => {
    if (!userId) return;

    // Check for new industry views on opinions
    const checkIndustryViews = async () => {
      try {
        // Get user's opinions
        const { data: userOpinions } = await supabase
          .from("opinions")
          .select("id, title, content_type")
          .eq("user_id", userId);

        if (!userOpinions || userOpinions.length === 0) return;

        // Check for views from industry professionals
        const { data: industryViews } = await supabase
          .from("opinion_views")
          .select(`
            id,
            viewed_at,
            viewer_id,
            opinion_id,
            profiles!inner(user_type, full_name)
          `)
          .in("opinion_id", userOpinions.map(o => o.id))
          .neq("viewer_id", userId)
          .in("profiles.user_type", ["creator", "studio", "production", "ott", "tv", "gaming", "music"])
          .order("viewed_at", { ascending: false })
          .limit(5);

        if (industryViews && industryViews.length > 0) {
          const lastNotified = localStorage.getItem(`industry_views_notified_${userId}`);
          const lastNotifiedTime = lastNotified ? new Date(lastNotified) : new Date(0);

          const newViews = industryViews.filter(
            (view) => new Date(view.viewed_at) > lastNotifiedTime
          );

          if (newViews.length > 0) {
            const opinion = userOpinions.find(o => o.id === newViews[0].opinion_id);
            const profile = newViews[0].profiles as any;
            
            const notification: ViewNotification = {
              id: newViews[0].id,
              viewerType: profile?.user_type || "Industry Professional",
              viewerName: profile?.full_name || "A Professional",
              opinionTitle: opinion?.title || opinion?.content_type || "Your Opinion",
              timestamp: new Date(newViews[0].viewed_at),
            };

            setCurrentNotification(notification);
            setShowNotification(true);
            localStorage.setItem(`industry_views_notified_${userId}`, new Date().toISOString());
          }
        }
      } catch (error) {
        console.error("Error checking industry views:", error);
      }
    };

    // Check on mount and every 5 minutes
    checkIndustryViews();
    const interval = setInterval(checkIndustryViews, 5 * 60 * 1000);

    return () => clearInterval(interval);
  }, [userId]);

  const dismissNotification = () => {
    setShowNotification(false);
    setCurrentNotification(null);
  };

  return {
    notifications,
    showNotification,
    currentNotification,
    dismissNotification,
  };
}

interface IndustryViewNotificationPopupProps {
  notification: ViewNotification | null;
  isVisible: boolean;
  onDismiss: () => void;
}

export function IndustryViewNotificationPopup({
  notification,
  isVisible,
  onDismiss,
}: IndustryViewNotificationPopupProps) {
  if (!notification) return null;

  const getViewerLabel = (type: string) => {
    const labels: Record<string, string> = {
      creator: "Creator",
      studio: "Studio Executive",
      production: "Production House",
      ott: "OTT Platform",
      tv: "TV Network",
      gaming: "Game Studio",
      music: "Music Label",
    };
    return labels[type] || "Industry Professional";
  };

  return (
    <AnimatePresence>
      {isVisible && (
        <motion.div
          initial={{ opacity: 0, y: 100, scale: 0.9 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          exit={{ opacity: 0, y: 100, scale: 0.9 }}
          transition={{ type: "spring", damping: 25, stiffness: 300 }}
          className="fixed bottom-4 right-4 z-50 max-w-sm"
        >
          <div className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-primary/90 to-accent/90 p-[1px] shadow-2xl">
            <div className="relative rounded-2xl bg-background/95 backdrop-blur-xl p-4">
              {/* Sparkle effects */}
              <div className="absolute -top-2 -right-2">
                <motion.div
                  animate={{ rotate: 360 }}
                  transition={{ duration: 4, repeat: Infinity, ease: "linear" }}
                >
                  <Sparkles className="w-6 h-6 text-primary" />
                </motion.div>
              </div>

              <Button
                variant="ghost"
                size="icon"
                className="absolute top-2 right-2 h-6 w-6"
                onClick={onDismiss}
              >
                <X className="w-4 h-4" />
              </Button>

              <div className="flex items-start gap-4 pr-6">
                <div className="p-3 rounded-xl bg-gradient-to-br from-primary/20 to-accent/20">
                  <Building2 className="w-6 h-6 text-primary" />
                </div>
                <div className="flex-1 space-y-1">
                  <div className="flex items-center gap-2">
                    <Eye className="w-4 h-4 text-accent" />
                    <span className="text-sm font-semibold text-accent">Industry View!</span>
                  </div>
                  <p className="text-sm font-medium">
                    A <span className="text-primary font-bold">{getViewerLabel(notification.viewerType)}</span> viewed your opinion
                  </p>
                  <p className="text-xs text-muted-foreground">
                    "{notification.opinionTitle}"
                  </p>
                  <p className="text-xs text-muted-foreground/70">
                    Your voice is being heard by the industry! 🎉
                  </p>
                </div>
              </div>
            </div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
