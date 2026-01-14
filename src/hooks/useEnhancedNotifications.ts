import { useEffect, useCallback, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { usePushNotifications } from "./usePushNotifications";
import { useNotificationSettings } from "./useNotificationSettings";

/**
 * Enhanced notification system for app engagement
 * Focus on opinions, InphroSync, streaks, badges - NOT coupons
 * Gamified elements to encourage participation
 */
export const useEnhancedNotifications = (userId: string | null) => {
  const { sendBrowserNotification, requestPermission, permission, isSupported } = usePushNotifications();
  const { canSendPushNotification, canSendEmailNotification } = useNotificationSettings(userId);
  const [hasRequestedPermission, setHasRequestedPermission] = useState(false);

  // Request notification permission on first use
  useEffect(() => {
    if (userId && isSupported && permission === "default" && !hasRequestedPermission) {
      const timer = setTimeout(() => {
        requestPermission();
        setHasRequestedPermission(true);
      }, 5000);
      return () => clearTimeout(timer);
    }
  }, [userId, isSupported, permission, hasRequestedPermission, requestPermission]);

  const sendNotification = useCallback(async (
    type: string,
    title: string,
    message: string,
    actionUrl?: string
  ) => {
    if (!userId) return;
    if (!canSendPushNotification()) return;
    
    try {
      await supabase.from('notifications').insert({
        user_id: userId,
        type,
        title,
        message,
        action_url: actionUrl || null
      });
      
      // Send browser notification if page is not focused
      if (isSupported && document.hidden) {
        sendBrowserNotification(title, {
          body: message,
          tag: type,
          data: { url: actionUrl },
        });
      }
    } catch (error) {
      console.error('Error sending notification:', error);
    }
  }, [userId, canSendPushNotification, isSupported, sendBrowserNotification]);

  // Send email notification
  const sendEmailNotification = useCallback(async (
    type: string,
    data?: Record<string, any>
  ) => {
    if (!userId || !canSendEmailNotification()) return;
    
    try {
      const { data: profile } = await supabase
        .from('profiles')
        .select('email, full_name')
        .eq('id', userId)
        .single();

      if (!profile?.email) return;

      await supabase.functions.invoke('send-notification-email', {
        body: {
          type,
          to: profile.email,
          name: profile.full_name || 'User',
          data
        }
      });
    } catch (error) {
      console.error('Error sending email notification:', error);
    }
  }, [userId, canSendEmailNotification]);

  useEffect(() => {
    if (!userId) return;

    // Subscribe to likes on user's opinions - gamified!
    const likesChannel = supabase
      .channel(`enhanced-likes-${userId}`)
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'opinion_upvotes'
        },
        async (payload) => {
          if (!payload.new.is_upvote) return;
          
          const { data: opinion } = await supabase
            .from('opinions')
            .select('id, title, user_id')
            .eq('id', payload.new.opinion_id)
            .single();

          if (opinion && opinion.user_id === userId && payload.new.user_id !== userId) {
            const { data: liker } = await supabase
              .from('profiles')
              .select('full_name, user_type')
              .eq('id', payload.new.user_id)
              .single();

            const likerName = liker?.full_name || 'Someone';
            const likerType = liker?.user_type || 'user';
            const isIndustry = likerType !== 'audience';
            
            // Gamified toast with effects
            if (canSendPushNotification()) {
              toast.success(
                isIndustry 
                  ? `⭐ Industry Recognition! ${likerName} loved your opinion!`
                  : `💜 ${likerName} resonated with your voice!`,
                {
                  description: `"${opinion.title?.substring(0, 40)}${opinion.title?.length > 40 ? '...' : ''}" - Your opinion is shaping entertainment!`,
                  duration: 6000,
                  action: {
                    label: "View Impact",
                    onClick: () => window.location.href = '/insights'
                  }
                }
              );
            }

            // Create persistent notification
            sendNotification(
              isIndustry ? 'industry_like' : 'like',
              isIndustry ? '⭐ Industry Recognition!' : '💜 Your Voice Resonates!',
              `${likerName}${isIndustry ? ` (${likerType})` : ''} liked "${opinion.title}" - Your opinions shape entertainment!`,
              '/insights'
            );

            // Send email for industry likes
            if (isIndustry) {
              sendEmailNotification('opinion_liked', { 
                opinionTitle: opinion.title,
                likerName,
                likerType
              });
            }
          }
        }
      )
      .subscribe();

    // Subscribe to streak updates - gamified achievements
    const streakChannel = supabase
      .channel(`enhanced-streak-${userId}`)
      .on(
        'postgres_changes',
        {
          event: 'UPDATE',
          schema: 'public',
          table: 'user_streaks'
        },
        async (payload) => {
          if (payload.new.user_id === userId) {
            const newStreak = payload.new.current_streak_weeks;
            const oldStreak = payload.old?.current_streak_weeks || 0;
            
            if (newStreak > oldStreak && newStreak > 1 && canSendPushNotification()) {
              // Streak milestones with special effects
              const streakEmojis = ['🔥', '🔥🔥', '🔥🔥🔥', '⚡', '💫', '🌟', '✨', '💎'];
              const emoji = streakEmojis[Math.min(newStreak - 1, streakEmojis.length - 1)];
              
              toast.success(
                `${emoji} ${newStreak} Week Streak! You're on Fire!`,
                {
                  description: `Your consistent voice is making waves in entertainment insights!`,
                  duration: 8000,
                  action: {
                    label: "View Profile",
                    onClick: () => window.location.href = '/profile'
                  }
                }
              );

              sendNotification(
                'streak',
                `${emoji} ${newStreak} Week Streak!`,
                'Your consistent participation is shaping entertainment!',
                '/profile'
              );

              // Tier achievements
              const tierMilestones: Record<number, { title: string; emoji: string }> = {
                4: { title: 'Silver Voice', emoji: '🥈' },
                8: { title: 'Gold Voice', emoji: '🥇' },
                12: { title: 'Diamond Voice', emoji: '💎' },
                16: { title: 'Platinum Voice', emoji: '🏆' },
                24: { title: 'Legendary Voice', emoji: '👑' }
              };

              if (tierMilestones[newStreak]) {
                const tier = tierMilestones[newStreak];
                sendNotification(
                  'achievement',
                  `${tier.emoji} ${tier.title} Unlocked!`,
                  `${newStreak}-week streak achievement! You're a true entertainment voice!`,
                  '/profile'
                );
                
                sendEmailNotification('streak_achievement', { streakCount: newStreak });
              }
            }
          }
        }
      )
      .subscribe();

    // Subscribe to badge awards
    const badgesChannel = supabase
      .channel(`enhanced-badges-${userId}`)
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'user_badges'
        },
        async (payload) => {
          if (payload.new.user_id === userId && canSendPushNotification()) {
            toast.success(
              `🏆 Wisdom Badge Earned: ${payload.new.badge_name}!`,
              {
                description: payload.new.badge_description || 'Your voice matters! Check your profile to see all badges.',
                duration: 8000,
                action: {
                  label: "View Badges",
                  onClick: () => window.location.href = '/profile'
                }
              }
            );

            sendNotification(
              'badge',
              `🏆 ${payload.new.badge_name} Earned!`,
              payload.new.badge_description || 'Your entertainment wisdom is recognized!',
              '/profile'
            );
          }
        }
      )
      .subscribe();

    // InphroSync participation tracking
    const inphrosyncChannel = supabase
      .channel(`enhanced-inphrosync-${userId}`)
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'inphrosync_responses'
        },
        async (payload) => {
          if (payload.new.user_id !== userId) return;
          
          // Check for milestones
          const { count } = await supabase
            .from('inphrosync_responses')
            .select('id', { count: 'exact', head: true })
            .eq('user_id', userId);

          const milestones = [5, 10, 25, 50, 100, 200, 500];
          if (count && milestones.includes(count) && canSendPushNotification()) {
            const milestoneEmojis: Record<number, string> = {
              5: '🌱', 10: '🌿', 25: '🌳', 50: '🎯', 100: '🏅', 200: '🌟', 500: '👑'
            };
            
            toast.success(
              `${milestoneEmojis[count] || '🎉'} InphroSync Milestone: ${count} Responses!`,
              {
                description: `You've shared your voice ${count} times! Your preferences shape what gets created.`,
                duration: 8000,
                action: {
                  label: "Keep Going",
                  onClick: () => window.location.href = '/inphrosync'
                }
              }
            );

            sendNotification(
              'milestone',
              `${milestoneEmojis[count] || '🎉'} InphroSync Milestone!`,
              `${count} responses! Your voice is shaping entertainment!`,
              '/inphrosync'
            );
          }
        }
      )
      .subscribe();

    // Daily reminder - customized by user type
    const checkDailyReminder = async () => {
      const { data: profile } = await supabase
        .from('profiles')
        .select('user_type')
        .eq('id', userId)
        .single();

      const userType = profile?.user_type || 'audience';
      const today = new Date().toISOString().split('T')[0];
      
      // For audience users - InphroSync reminder
      if (userType === 'audience') {
        const { data: todayResponse } = await supabase
          .from('inphrosync_responses')
          .select('id')
          .eq('user_id', userId)
          .eq('response_date', today)
          .maybeSingle();

        if (!todayResponse) {
          const { data: lastNotification } = await supabase
            .from('notifications')
            .select('created_at')
            .eq('user_id', userId)
            .eq('type', 'inphrosync_reminder')
            .order('created_at', { ascending: false })
            .limit(1)
            .maybeSingle();

          const lastNotifTime = lastNotification ? new Date(lastNotification.created_at) : null;
          const hoursSinceLastNotif = lastNotifTime 
            ? (Date.now() - lastNotifTime.getTime()) / (1000 * 60 * 60)
            : 24;

          if (hoursSinceLastNotif > 20 && canSendPushNotification()) {
            const { data: streak } = await supabase
              .from('user_streaks')
              .select('inphrosync_streak_days')
              .eq('user_id', userId)
              .maybeSingle();

            const currentStreak = streak?.inphrosync_streak_days || 0;
            
            toast.info(
              currentStreak > 0 
                ? `✨ Don't break your ${currentStreak}-day streak!`
                : `✨ Your Daily Voice Awaits!`,
              {
                description: 'Share your preferences and shape what entertainment gets created next!',
                duration: 10000,
                action: {
                  label: "Participate Now",
                  onClick: () => window.location.href = '/inphrosync'
                }
              }
            );

            sendNotification(
              'inphrosync_reminder',
              currentStreak > 0 ? `✨ ${currentStreak}-Day Streak at Risk!` : '✨ InphroSync Daily Ready',
              'New questions await your voice! Shape entertainment today.',
              '/inphrosync'
            );
          }
        }
      } else {
        // For non-audience users (creators, studios, developers, etc.) - Insights reminder
        const roleLabels: Record<string, { label: string; emoji: string; action: string }> = {
          creator: { label: 'Creator', emoji: '✨', action: 'Check what your audience wants!' },
          studio: { label: 'Studio', emoji: '🎬', action: 'New audience insights available!' },
          ott: { label: 'OTT', emoji: '📺', action: 'Discover trending content preferences!' },
          tv: { label: 'TV Network', emoji: '📡', action: 'See what viewers are asking for!' },
          gaming: { label: 'Game Dev', emoji: '🎮', action: 'Gaming insights await!' },
          music: { label: 'Music', emoji: '🎵', action: 'Music trends are in!' },
          developer: { label: 'App Developer', emoji: '💻', action: 'Check app & gaming insights!' }
        };

        const roleInfo = roleLabels[userType] || { label: 'Professional', emoji: '📊', action: 'New insights available!' };

        const { data: lastNotification } = await supabase
          .from('notifications')
          .select('created_at')
          .eq('user_id', userId)
          .eq('type', 'insights_reminder')
          .order('created_at', { ascending: false })
          .limit(1)
          .maybeSingle();

        const lastNotifTime = lastNotification ? new Date(lastNotification.created_at) : null;
        const hoursSinceLastNotif = lastNotifTime 
          ? (Date.now() - lastNotifTime.getTime()) / (1000 * 60 * 60)
          : 48;

        if (hoursSinceLastNotif > 24 && canSendPushNotification()) {
          toast.info(
            `${roleInfo.emoji} ${roleInfo.action}`,
            {
              description: 'Fresh audience opinions and trends are ready for you to explore!',
              duration: 8000,
              action: {
                label: "View Insights",
                onClick: () => window.location.href = '/insights'
              }
            }
          );

          sendNotification(
            'insights_reminder',
            `${roleInfo.emoji} Fresh Insights for ${roleInfo.label}s`,
            roleInfo.action,
            '/insights'
          );
        }
      }
    };

    // Opinion reminder for inactive audience users only
    const checkOpinionReminder = async () => {
      const { data: profile } = await supabase
        .from('profiles')
        .select('user_type')
        .eq('id', userId)
        .single();

      // Only send opinion reminders to audience users
      if (profile?.user_type !== 'audience') return;

      const { data: recentOpinion } = await supabase
        .from('opinions')
        .select('created_at')
        .eq('user_id', userId)
        .order('created_at', { ascending: false })
        .limit(1)
        .maybeSingle();

      const daysSinceOpinion = recentOpinion 
        ? Math.floor((Date.now() - new Date(recentOpinion.created_at).getTime()) / (1000 * 60 * 60 * 24))
        : 999;

      // Remind if no opinion in 5+ days
      if (daysSinceOpinion >= 5 && canSendPushNotification()) {
        const { data: lastReminder } = await supabase
          .from('notifications')
          .select('created_at')
          .eq('user_id', userId)
          .eq('type', 'opinion_reminder')
          .order('created_at', { ascending: false })
          .limit(1)
          .maybeSingle();

        const hoursSinceReminder = lastReminder 
          ? (Date.now() - new Date(lastReminder.created_at).getTime()) / (1000 * 60 * 60)
          : 48;

        if (hoursSinceReminder >= 48) {
          toast.info(
            `💡 The entertainment world misses your voice!`,
            {
              description: `It's been ${daysSinceOpinion} days. Share what you want to see created!`,
              duration: 8000,
              action: {
                label: "Share Opinion",
                onClick: () => window.location.href = '/dashboard'
              }
            }
          );

          sendNotification(
            'opinion_reminder',
            '💡 Entertainment Awaits Your Voice!',
            `Share your opinion and help shape what gets created next!`,
            '/dashboard'
          );
        }
      }
    };

    // Run reminder checks
    checkDailyReminder();
    checkOpinionReminder();
    const reminderInterval = setInterval(() => {
      checkDailyReminder();
      checkOpinionReminder();
    }, 60 * 60 * 1000); // Every hour

    return () => {
      supabase.removeChannel(likesChannel);
      supabase.removeChannel(streakChannel);
      supabase.removeChannel(badgesChannel);
      supabase.removeChannel(inphrosyncChannel);
      clearInterval(reminderInterval);
    };
  }, [userId, sendNotification, sendEmailNotification, canSendPushNotification]);
};
