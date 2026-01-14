import { useEffect, useRef } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { getDaysUntilNextMondayUTC, getCurrentWeekRangeUTC } from '@/lib/week';

/**
 * Hook to send weekly notifications when a new week starts
 * Also triggers weekend engagement reminders (Friday/Saturday)
 */
export function useWeeklyNotifications() {
  const hasCheckedWeekend = useRef(false);

  useEffect(() => {
    const checkAndSendWeeklyNotification = async () => {
      try {
        const { data: { user } } = await supabase.auth.getUser();
        if (!user) return;

        // Get user profile
        const { data: profile } = await supabase
          .from("profiles")
          .select("user_type, settings")
          .eq("id", user.id)
          .single();

        if (!profile) return;

        const today = new Date();
        const dayOfWeek = today.getUTCDay();
        
        // Get current week range
        const { start: weekStart } = getCurrentWeekRangeUTC();

        // Monday notification (day 1) - Week started
        if (dayOfWeek === 1) {
          const { data: existingNotif } = await supabase
            .from("notifications")
            .select("id")
            .eq("user_id", user.id)
            .eq("type", "weekly_start")
            .gte("created_at", weekStart.toISOString())
            .maybeSingle();

          if (!existingNotif) {
            let title = "🎉 New Week Started!";
            let message = "";

            if (profile.user_type === "audience") {
              message = "A new week has started! Share your opinions across 6 categories and shape the future of entertainment!";
            } else {
              message = "New week started! Fresh audience insights are waiting for you. Start exploring what content people want.";
            }

            await supabase.from("notifications").insert({
              user_id: user.id,
              title,
              message,
              type: "weekly_start",
              action_url: profile.user_type === "audience" ? "/dashboard" : "/insights"
            });
          }
        }

        // Weekend reminders (Friday = 5, Saturday = 6)
        if ((dayOfWeek === 5 || dayOfWeek === 6) && !hasCheckedWeekend.current) {
          hasCheckedWeekend.current = true;

          // Check if user has incomplete opinions this week
          const { count: opinionsThisWeek } = await supabase
            .from('opinions')
            .select('id', { count: 'exact', head: true })
            .eq('user_id', user.id)
            .gte('created_at', weekStart.toISOString());

          // Check streak data
          const { data: streakData } = await supabase
            .from('user_streaks')
            .select('inphrosync_streak_days, inphrosync_last_participation')
            .eq('user_id', user.id)
            .single();

          const opinionsCount = opinionsThisWeek || 0;
          const streakDays = streakData?.inphrosync_streak_days || 0;

          // Check if we already sent weekend reminder
          const weekendStart = new Date(today);
          weekendStart.setUTCDate(weekendStart.getUTCDate() - (dayOfWeek === 6 ? 1 : 0));
          weekendStart.setUTCHours(0, 0, 0, 0);

          const { data: existingReminder } = await supabase
            .from("notifications")
            .select("id")
            .eq("user_id", user.id)
            .eq("type", "weekend_reminder")
            .gte("created_at", weekendStart.toISOString())
            .maybeSingle();

          if (!existingReminder && opinionsCount < 6) {
            const remainingCategories = 6 - opinionsCount;
            
            let message = "";
            if (streakDays > 0) {
              message = `🔥 Don't lose your ${streakDays}-day streak! You have ${remainingCategories} categories left. Complete InphroSync and share your opinions before the week ends!`;
            } else {
              message = `📢 Weekend reminder: You have ${remainingCategories} categories waiting for your opinions. The week ends soon - make your voice heard!`;
            }

            await supabase.from("notifications").insert({
              user_id: user.id,
              title: "⏰ Week Ending Soon!",
              message,
              type: "weekend_reminder",
              action_url: "/dashboard"
            });

            // Try to send push notification if supported
            if ("Notification" in window && Notification.permission === "granted") {
              try {
                new Notification("⏰ Week Ending Soon!", {
                  body: message,
                  icon: "/favicon.ico",
                  badge: "/favicon.ico",
                  tag: "weekend-reminder",
                  requireInteraction: true
                });
              } catch (e) {
                console.log("Push notification not supported");
              }
            }
          }
        }

      } catch (error) {
        console.error("Error sending weekly notification:", error);
      }
    };

    // Check immediately on mount
    checkAndSendWeeklyNotification();

    // Check every hour to catch the Monday transition and weekend reminders
    const interval = setInterval(checkAndSendWeeklyNotification, 60 * 60 * 1000);

    return () => clearInterval(interval);
  }, []);
}
