import { useState, useEffect, useCallback } from "react";
import { supabase } from "@/integrations/supabase/client";

interface NotificationSettings {
  notifications_enabled: boolean;
  email_notifications: boolean;
}

/**
 * Hook to check user notification settings before sending notifications
 */
export const useNotificationSettings = (userId: string | null) => {
  const [settings, setSettings] = useState<NotificationSettings>({
    notifications_enabled: true,
    email_notifications: true,
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchSettings = async () => {
      if (!userId) {
        setLoading(false);
        return;
      }

      try {
        const { data, error } = await supabase
          .from('profiles')
          .select('settings')
          .eq('id', userId)
          .single();

        if (error) throw error;

        if (data?.settings && typeof data.settings === 'object') {
          const savedSettings = data.settings as any;
          setSettings({
            notifications_enabled: savedSettings.notifications_enabled ?? true,
            email_notifications: savedSettings.email_notifications ?? true,
          });
        }
      } catch (error) {
        console.error('Error fetching notification settings:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchSettings();

    // Subscribe to profile changes
    if (userId) {
      const channel = supabase
        .channel(`profile-settings-${userId}`)
        .on('postgres_changes', {
          event: 'UPDATE',
          schema: 'public',
          table: 'profiles',
          filter: `id=eq.${userId}`
        }, (payload) => {
          const newSettings = payload.new?.settings as any;
          if (newSettings) {
            setSettings({
              notifications_enabled: newSettings.notifications_enabled ?? true,
              email_notifications: newSettings.email_notifications ?? true,
            });
          }
        })
        .subscribe();

      return () => {
        supabase.removeChannel(channel);
      };
    }
  }, [userId]);

  const canSendPushNotification = useCallback((): boolean => {
    // Don't send while still loading settings
    if (loading) return false;
    return settings.notifications_enabled;
  }, [settings.notifications_enabled, loading]);

  const canSendEmailNotification = useCallback((): boolean => {
    // Don't send while still loading settings
    if (loading) return false;
    return settings.email_notifications;
  }, [settings.email_notifications, loading]);

  return {
    settings,
    loading,
    canSendPushNotification,
    canSendEmailNotification,
  };
};
