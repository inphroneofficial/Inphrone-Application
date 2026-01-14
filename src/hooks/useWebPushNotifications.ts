import { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

interface PushSubscriptionData {
  endpoint: string;
  keys: {
    p256dh: string;
    auth: string;
  };
}

export const useWebPushNotifications = () => {
  const [isSupported, setIsSupported] = useState(false);
  const [permission, setPermission] = useState<NotificationPermission>('default');
  const [subscription, setSubscription] = useState<PushSubscription | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [swRegistration, setSwRegistration] = useState<ServiceWorkerRegistration | null>(null);

  // Check browser support and register service worker
  useEffect(() => {
    const init = async () => {
      const supported = 'serviceWorker' in navigator && 'PushManager' in window && 'Notification' in window;
      setIsSupported(supported);

      if (!supported) {
        console.log('[WebPush] Push notifications not supported');
        return;
      }

      setPermission(Notification.permission);

      // Register service worker
      try {
        const registration = await navigator.serviceWorker.register('/sw.js', {
          scope: '/'
        });
        console.log('[WebPush] Service Worker registered:', registration.scope);
        setSwRegistration(registration);

        // Check for existing subscription
        const existingSub = await registration.pushManager.getSubscription();
        if (existingSub) {
          setSubscription(existingSub);
          console.log('[WebPush] Existing subscription found');
        }
      } catch (error) {
        console.error('[WebPush] Service Worker registration failed:', error);
      }
    };

    init();
  }, []);

  // Request notification permission
  const requestPermission = useCallback(async (): Promise<boolean> => {
    if (!isSupported) {
      toast.error('Push notifications are not supported in your browser');
      return false;
    }

    try {
      const result = await Notification.requestPermission();
      setPermission(result);
      
      if (result === 'granted') {
        toast.success('Push notifications enabled!');
        return true;
      } else if (result === 'denied') {
        toast.error('Notifications blocked. Please enable them in your browser settings.');
        return false;
      }
      return false;
    } catch (error) {
      console.error('[WebPush] Permission request error:', error);
      toast.error('Failed to request notification permission');
      return false;
    }
  }, [isSupported]);

  // Subscribe to push notifications
  const subscribeToPush = useCallback(async (): Promise<boolean> => {
    if (!swRegistration) {
      toast.error('Service worker not ready. Please refresh the page.');
      return false;
    }

    if (permission !== 'granted') {
      const granted = await requestPermission();
      if (!granted) return false;
    }

    setIsLoading(true);

    try {
      // Get VAPID public key from edge function
      const { data: vapidData, error: vapidError } = await supabase.functions.invoke('get-vapid-key');
      
      if (vapidError || !vapidData?.publicKey) {
        console.error('[WebPush] Failed to get VAPID key:', vapidError);
        toast.error('Failed to initialize push notifications');
        setIsLoading(false);
        return false;
      }

      // Convert VAPID key to Uint8Array
      const applicationServerKey = urlBase64ToUint8Array(vapidData.publicKey);

      // Subscribe to push manager
      const pushSubscription = await swRegistration.pushManager.subscribe({
        userVisibleOnly: true,
        applicationServerKey: applicationServerKey.buffer as ArrayBuffer
      });

      console.log('[WebPush] Push subscription created:', pushSubscription);
      setSubscription(pushSubscription);

      // Save subscription to database
      const { data: { user } } = await supabase.auth.getUser();
      if (user) {
        const subscriptionJson = pushSubscription.toJSON();
        
        const { error: saveError } = await supabase
          .from('profiles')
          .update({
            settings: {
              push_subscription: {
                endpoint: subscriptionJson.endpoint,
                keys: subscriptionJson.keys
              },
              push_notifications_enabled: true
            }
          })
          .eq('id', user.id);

        if (saveError) {
          console.error('[WebPush] Failed to save subscription:', saveError);
        } else {
          console.log('[WebPush] Subscription saved to database');
        }
      }

      toast.success('Push notifications activated!');
      setIsLoading(false);
      return true;
    } catch (error) {
      console.error('[WebPush] Subscription error:', error);
      toast.error('Failed to subscribe to push notifications');
      setIsLoading(false);
      return false;
    }
  }, [swRegistration, permission, requestPermission]);

  // Unsubscribe from push notifications
  const unsubscribeFromPush = useCallback(async (): Promise<boolean> => {
    if (!subscription) return true;

    setIsLoading(true);

    try {
      await subscription.unsubscribe();
      setSubscription(null);

      // Update database
      const { data: { user } } = await supabase.auth.getUser();
      if (user) {
        const { data: profile } = await supabase
          .from('profiles')
          .select('settings')
          .eq('id', user.id)
          .single();

        const currentSettings = (profile?.settings as any) || {};
        
        await supabase
          .from('profiles')
          .update({
            settings: {
              ...currentSettings,
              push_subscription: null,
              push_notifications_enabled: false
            }
          })
          .eq('id', user.id);
      }

      toast.success('Push notifications disabled');
      setIsLoading(false);
      return true;
    } catch (error) {
      console.error('[WebPush] Unsubscribe error:', error);
      toast.error('Failed to unsubscribe from push notifications');
      setIsLoading(false);
      return false;
    }
  }, [subscription]);

  return {
    isSupported,
    permission,
    subscription,
    isLoading,
    isSubscribed: !!subscription,
    requestPermission,
    subscribeToPush,
    unsubscribeFromPush
  };
};

// Helper function to convert VAPID key
function urlBase64ToUint8Array(base64String: string): Uint8Array {
  const padding = '='.repeat((4 - (base64String.length % 4)) % 4);
  const base64 = (base64String + padding)
    .replace(/-/g, '+')
    .replace(/_/g, '/');

  const rawData = window.atob(base64);
  const outputArray = new Uint8Array(rawData.length);

  for (let i = 0; i < rawData.length; ++i) {
    outputArray[i] = rawData.charCodeAt(i);
  }
  return outputArray;
}
