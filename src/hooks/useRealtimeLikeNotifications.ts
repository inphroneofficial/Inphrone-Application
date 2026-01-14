import { useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

export const useRealtimeLikeNotifications = (userId: string | null) => {
  useEffect(() => {
    if (!userId) return;

    // Subscribe to opinion_upvotes for opinions authored by this user
    const channel = supabase
      .channel('like-notifications')
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'opinion_upvotes'
        },
        async (payload) => {
          // Only notify for actual upvotes (is_upvote = true)
          if (!payload.new.is_upvote) return;
          
          // Check if this upvote is for one of the user's opinions
          const { data: opinion } = await supabase
            .from('opinions')
            .select('id, title, user_id')
            .eq('id', payload.new.opinion_id)
            .single();

          if (opinion && opinion.user_id === userId) {
            // Fetch liker's profile
            const { data: liker } = await supabase
              .from('profiles')
              .select('full_name, user_type')
              .eq('id', payload.new.user_id)
              .single();

            const likerName = liker?.full_name || 'Someone';
            const likerType = liker?.user_type || 'user';

            // Improved notification with better styling
            toast.success(
              `🎉 ${likerName} (${likerType.toUpperCase()}) liked your opinion!`,
              {
                description: `"${opinion.title}"`,
                duration: 6000,
                action: {
                  label: 'View Details',
                  onClick: () => {
                    window.location.href = '/dashboard';
                  }
                }
              }
            );
          }
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [userId]);
};
