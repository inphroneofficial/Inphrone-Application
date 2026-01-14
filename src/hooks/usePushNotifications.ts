import { useEffect, useCallback, useState, useRef } from "react";
import { supabase } from "@/integrations/supabase/client";

/**
 * Enhanced hook for managing browser push notifications
 * Handles permission requests, sending notifications, and visibility-aware delivery
 */
export const usePushNotifications = () => {
  const [permission, setPermission] = useState<NotificationPermission>("default");
  const [isSupported, setIsSupported] = useState(false);
  const notificationQueue = useRef<Array<{ title: string; options?: NotificationOptions }>>([]);
  const isDocumentHidden = useRef(false);

  useEffect(() => {
    // Check if browser supports notifications
    const supported = "Notification" in window;
    setIsSupported(supported);
    
    if (supported) {
      setPermission(Notification.permission);
    }

    // Track document visibility for background notifications
    const handleVisibilityChange = () => {
      isDocumentHidden.current = document.hidden;
      
      // Process queued notifications when tab becomes hidden
      if (document.hidden && notificationQueue.current.length > 0) {
        notificationQueue.current.forEach(({ title, options }) => {
          sendImmediateNotification(title, options);
        });
        notificationQueue.current = [];
      }
    };

    document.addEventListener("visibilitychange", handleVisibilityChange);
    return () => document.removeEventListener("visibilitychange", handleVisibilityChange);
  }, []);

  const requestPermission = useCallback(async (): Promise<boolean> => {
    if (!isSupported) {
      console.log("Browser notifications not supported");
      return false;
    }

    try {
      const result = await Notification.requestPermission();
      setPermission(result);
      return result === "granted";
    } catch (error) {
      console.error("Error requesting notification permission:", error);
      return false;
    }
  }, [isSupported]);

  const sendImmediateNotification = useCallback((
    title: string,
    options?: NotificationOptions
  ): boolean => {
    if (!isSupported || permission !== "granted") return false;

    try {
      const notification = new Notification(title, {
        icon: "/favicon.ico",
        badge: "/favicon.ico",
        requireInteraction: false,
        silent: false,
        ...options,
      });

      // Auto-close after 6 seconds
      setTimeout(() => notification.close(), 6000);

      notification.onclick = () => {
        window.focus();
        notification.close();
        if (options?.data?.url) {
          window.location.href = options.data.url;
        }
      };

      return true;
    } catch (error) {
      console.error("Error sending notification:", error);
      return false;
    }
  }, [isSupported, permission]);

  const sendBrowserNotification = useCallback(async (
    title: string,
    options?: NotificationOptions
  ): Promise<boolean> => {
    if (!isSupported) return false;
    
    // Check user settings first
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return false;

    const { data: profile } = await supabase
      .from('profiles')
      .select('settings')
      .eq('id', user.id)
      .single();

    const settings = profile?.settings as any;
    
    // Check if push notifications are enabled in settings
    if (settings?.notifications_enabled === false) {
      console.log("Push notifications disabled by user settings");
      return false;
    }

    // Check permission
    if (permission !== "granted") {
      const granted = await requestPermission();
      if (!granted) return false;
    }

    // Send immediately when document is hidden (user is away from app)
    if (document.hidden) {
      return sendImmediateNotification(title, options);
    }

    // Send immediately for all notifications - users want to see them right away
    return sendImmediateNotification(title, options);
  }, [isSupported, permission, requestPermission, sendImmediateNotification]);

  // Force send notification regardless of visibility
  const sendUrgentNotification = useCallback(async (
    title: string,
    options?: NotificationOptions
  ): Promise<boolean> => {
    if (!isSupported) return false;
    
    // Check user settings first
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return false;

    const { data: profile } = await supabase
      .from('profiles')
      .select('settings')
      .eq('id', user.id)
      .single();

    const settings = profile?.settings as any;
    
    if (settings?.notifications_enabled === false) {
      return false;
    }

    if (permission !== "granted") {
      const granted = await requestPermission();
      if (!granted) return false;
    }

    return sendImmediateNotification(title, {
      ...options,
      requireInteraction: true,
    });
  }, [isSupported, permission, requestPermission, sendImmediateNotification]);

  return {
    isSupported,
    permission,
    requestPermission,
    sendBrowserNotification,
    sendUrgentNotification,
    isDocumentHidden: () => isDocumentHidden.current,
  };
};
