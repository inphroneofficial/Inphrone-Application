import { useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';

/**
 * Hook to track opinion views by creators/studios
 * Only tracks views from non-audience users
 */
export function useOpinionViewTracking(opinionIds: string[]) {
  useEffect(() => {
    const trackViews = async () => {
      if (opinionIds.length === 0) return;

      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      // Check if user is non-audience (creator/studio/production/ott/tv/music/gaming)
      const { data: profile } = await supabase
        .from("profiles")
        .select("user_type")
        .eq("id", user.id)
        .single();

      if (!profile || profile.user_type === 'audience') return;

      // Track views for all opinions (debounced)
      const viewPromises = opinionIds.map(async (opinionId) => {
        // Check if already viewed
        const { data: existingView } = await supabase
          .from("opinion_views")
          .select("id")
          .eq("opinion_id", opinionId)
          .eq("viewer_id", user.id)
          .maybeSingle();

        if (!existingView) {
          // Insert view record (will trigger notification via database trigger)
          await supabase.from("opinion_views").insert({
            opinion_id: opinionId,
            viewer_id: user.id
          });
        }
      });

      await Promise.all(viewPromises);
    };

    // Debounce to avoid excessive tracking
    const timer = setTimeout(trackViews, 2000);
    return () => clearTimeout(timer);
  }, [opinionIds]);
}
