import { useEffect, useCallback } from "react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { useNotificationSettings } from "./useNotificationSettings";

/**
 * Comprehensive notification system focused on app engagement
 * Gamified elements for opinions and InphroSync - NO coupon notifications
 */
export const useComprehensiveNotifications = (userId: string | null) => {
  const { canSendPushNotification, canSendEmailNotification } = useNotificationSettings(userId);
  
  useEffect(() => {
    if (!userId) return;

    // First, check if user is audience type - only audience gets opinion-related notifications
    const setupNotifications = async () => {
      const { data: userProfile } = await supabase
        .from('profiles')
        .select('user_type')
        .eq('id', userId)
        .single();

      const isAudienceUser = userProfile?.user_type === 'audience';

      // Subscribe to opinion upvotes with gamified messaging - ONLY for audience users
      const channel = supabase
        .channel('comprehensive-notifications')
        .on(
          'postgres_changes',
          {
            event: 'INSERT',
            schema: 'public',
            table: 'opinion_upvotes'
          },
          async (payload) => {
            // Only audience users should receive opinion notifications
            if (!isAudienceUser) return;
            if (!payload.new.is_upvote) return;
            
            const { data: opinion } = await supabase
              .from('opinions')
              .select('id, title, user_id, category_id, upvotes, categories(name)')
              .eq('id', payload.new.opinion_id)
              .maybeSingle();

            if (opinion && opinion.user_id === userId && canSendPushNotification()) {
              const { data: liker } = await supabase
                .from('profiles')
                .select('full_name, user_type')
                .eq('id', payload.new.user_id)
                .maybeSingle();

              const likerName = liker?.full_name || 'Someone';
              const likerType = liker?.user_type || 'user';
              const categoryName = (opinion.categories as any)?.name || 'Entertainment';
              const totalLikes = opinion.upvotes || 1;

              // Special milestones for likes
              const likeMilestones: Record<number, string> = {
                5: '🎯 5 likes! Your voice is gaining traction!',
                10: '🔥 10 likes! You\'re making an impact!',
                25: '⭐ 25 likes! Industry is noticing!',
                50: '💫 50 likes! Trending opinion!',
                100: '🏆 100 likes! Legendary voice!'
              };

              if (likeMilestones[totalLikes]) {
                toast.success(likeMilestones[totalLikes], {
                  description: `"${opinion.title}" in ${categoryName}`,
                  duration: 8000,
                  action: {
                    label: 'View Impact',
                    onClick: () => window.location.href = '/insights'
                  }
                });
              } else {
                toast.success(
                  `💜 ${likerName} resonated with your ${categoryName} opinion!`,
                  {
                    description: `"${opinion.title?.substring(0, 50)}${opinion.title?.length > 50 ? '...' : ''}"`,
                    duration: 5000,
                    cancel: {
                      label: 'Dismiss',
                      onClick: () => {}
                    }
                  }
                );
              }

              // Create notification record
              await supabase.from('notifications').insert({
                user_id: userId,
                type: 'opinion_like',
                title: `${likerType !== 'audience' ? '⭐ Industry' : '💜'} ${likerName} liked your opinion`,
                message: `"${opinion.title}" in ${categoryName} - Your voice matters!`,
                action_url: '/insights'
              });
            }
          }
        )
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'inphrosync_responses'
        },
        async (payload) => {
          if (payload.new.user_id !== userId) return;

          const { count } = await supabase
            .from('inphrosync_responses')
            .select('id', { count: 'exact', head: true })
            .eq('user_id', userId);

          // Gamified milestones
          const milestones: Record<number, { emoji: string; message: string }> = {
            1: { emoji: '🎉', message: 'First voice shared! Welcome to shaping entertainment!' },
            5: { emoji: '🌱', message: 'Growing voice! Your preferences are being heard!' },
            10: { emoji: '🌿', message: 'Strong voice! 10 responses shaping content!' },
            25: { emoji: '🌳', message: 'Rooted voice! A quarter-century of insights!' },
            50: { emoji: '🎯', message: 'Influential! 50 responses driving decisions!' },
            100: { emoji: '🏅', message: 'Centurion! 100 powerful voice moments!' },
            200: { emoji: '🌟', message: 'Superstar! Your voice echoes across entertainment!' },
            500: { emoji: '👑', message: 'Legend! 500 moments of entertainment influence!' }
          };

          if (count && milestones[count] && canSendPushNotification()) {
            const milestone = milestones[count];
            toast.success(
              `${milestone.emoji} InphroSync Milestone: ${count}!`,
              {
                description: milestone.message,
                duration: 8000,
                action: {
                  label: 'Continue',
                  onClick: () => window.location.href = '/inphrosync'
                }
              }
            );

            await supabase.from('notifications').insert({
              user_id: userId,
              type: 'milestone',
              title: `${milestone.emoji} InphroSync Milestone: ${count} Responses`,
              message: milestone.message,
              action_url: '/inphrosync'
            });
          }
        }
      )
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'user_badges'
        },
        async (payload) => {
          if (payload.new.user_id !== userId || !canSendPushNotification()) return;

          toast.success(
            `🏆 New Wisdom Badge: ${payload.new.badge_name}!`,
            {
              description: payload.new.badge_description || 'Your entertainment wisdom is recognized!',
              duration: 8000,
              action: {
                label: 'View Badges',
                onClick: () => window.location.href = '/profile'
              }
            }
          );

          await supabase.from('notifications').insert({
            user_id: userId,
            type: 'badge',
            title: `🏆 Badge Earned: ${payload.new.badge_name}`,
            message: payload.new.badge_description || 'A new wisdom badge for your collection!',
            action_url: '/profile'
          });
        }
      )
      .subscribe();

    // Daily InphroSync reminder with streak motivation
    const checkDailyReminder = async () => {
      const { data: profile } = await supabase
        .from('profiles')
        .select('user_type')
        .eq('id', userId)
        .single();

      // Only for audience users
      if (profile?.user_type !== 'audience') return;

      const today = new Date().toISOString().split('T')[0];
      
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
          // Get streak for motivation
          const { data: streak } = await supabase
            .from('user_streaks')
            .select('inphrosync_streak_days')
            .eq('user_id', userId)
            .maybeSingle();

          const currentStreak = streak?.inphrosync_streak_days || 0;
          
          toast.info(
            currentStreak > 0 
              ? `🔥 ${currentStreak}-day streak! Don't let it end!`
              : `✨ Your voice shapes entertainment!`,
            {
              description: currentStreak > 0 
                ? 'Quick! Answer today\'s questions to keep your streak alive!'
                : 'Daily questions await. Share what you want to see created!',
              duration: 10000,
              cancel: {
                label: 'Later',
                onClick: () => {}
              },
              action: {
                label: 'Go Now',
                onClick: () => window.location.href = '/inphrosync'
              }
            }
          );

          await supabase.from('notifications').insert({
            user_id: userId,
            type: 'inphrosync_reminder',
            title: currentStreak > 0 ? `🔥 ${currentStreak}-Day Streak at Risk!` : '✨ Daily InphroSync Ready',
            message: 'Shape entertainment with your daily voice!',
            action_url: '/inphrosync'
          });
        }
      }
    };

    // Weekly opinion encouragement
    const checkWeeklyEngagement = async () => {
      const oneWeekAgo = new Date();
      oneWeekAgo.setDate(oneWeekAgo.getDate() - 7);

      const { count: weeklyOpinions } = await supabase
        .from('opinions')
        .select('id', { count: 'exact', head: true })
        .eq('user_id', userId)
        .gte('created_at', oneWeekAgo.toISOString());

      // If user hasn't shared opinions this week
      if ((weeklyOpinions || 0) === 0 && canSendPushNotification()) {
        const { data: lastReminder } = await supabase
          .from('notifications')
          .select('created_at')
          .eq('user_id', userId)
          .eq('type', 'weekly_engagement')
          .order('created_at', { ascending: false })
          .limit(1)
          .maybeSingle();

        const daysSinceReminder = lastReminder 
          ? (Date.now() - new Date(lastReminder.created_at).getTime()) / (1000 * 60 * 60 * 24)
          : 7;

        if (daysSinceReminder >= 7) {
          toast.info(
            `💡 Entertainment needs your perspective!`,
            {
              description: 'Share an opinion this week and influence what gets created.',
              duration: 8000,
              action: {
                label: 'Share Now',
                onClick: () => window.location.href = '/dashboard'
              }
            }
          );

          await supabase.from('notifications').insert({
            user_id: userId,
            type: 'weekly_engagement',
            title: '💡 Your Voice Matters!',
            message: 'Share an opinion and help shape entertainment this week!',
            action_url: '/dashboard'
          });
        }
      }
    };

      // Run checks
      checkDailyReminder();
      setTimeout(checkWeeklyEngagement, 5000); // Delay weekly check
      const reminderInterval = setInterval(checkDailyReminder, 60 * 60 * 1000);

      return () => {
        supabase.removeChannel(channel);
        clearInterval(reminderInterval);
      };
    };

    setupNotifications();
  }, [userId, canSendPushNotification]);
};
