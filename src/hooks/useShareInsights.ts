import { useState, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

interface ShareableInsight {
  id: string;
  share_token: string;
  insight_type: string;
  insight_data: any;
  view_count: number;
  expires_at: string | null;
  created_at: string;
}

export function useShareInsights() {
  const [loading, setLoading] = useState(false);
  const [sharedInsights, setSharedInsights] = useState<ShareableInsight[]>([]);

  // Generate a unique token
  const generateToken = (): string => {
    const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
    let token = '';
    for (let i = 0; i < 32; i++) {
      token += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    return token;
  };

  // Create shareable link
  const createShareableLink = useCallback(async (
    insightType: string,
    insightData: any,
    expiresInDays: number = 7
  ): Promise<string | null> => {
    setLoading(true);
    try {
      const { data: { user } } = await supabase.auth.getUser();
      
      if (!user) {
        toast.error('Please login to share insights');
        return null;
      }

      const shareToken = generateToken();
      const expiresAt = new Date();
      expiresAt.setDate(expiresAt.getDate() + expiresInDays);

      const { data, error } = await supabase
        .from('shared_insights')
        .insert({
          user_id: user.id,
          insight_type: insightType,
          insight_data: insightData,
          share_token: shareToken,
          expires_at: expiresAt.toISOString()
        })
        .select()
        .single();

      if (error) throw error;

      const shareUrl = `${window.location.origin}/insights/shared/${shareToken}`;
      
      // Copy to clipboard
      await navigator.clipboard.writeText(shareUrl);
      toast.success('Share link copied to clipboard!');
      
      return shareUrl;
    } catch (error: any) {
      console.error('Error creating shareable link:', error);
      toast.error('Failed to create share link');
      return null;
    } finally {
      setLoading(false);
    }
  }, []);

  // Get shared insight by token
  const getSharedInsight = useCallback(async (token: string): Promise<ShareableInsight | null> => {
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from('shared_insights')
        .select('*')
        .eq('share_token', token)
        .single();

      if (error) {
        if (error.code === 'PGRST116') {
          toast.error('Shared insight not found or expired');
        }
        return null;
      }

      // Check if expired
      if (data.expires_at && new Date(data.expires_at) < new Date()) {
        toast.error('This shared insight has expired');
        return null;
      }

      // Increment view count
      await supabase
        .from('shared_insights')
        .update({ view_count: (data.view_count || 0) + 1 })
        .eq('id', data.id);

      return data as ShareableInsight;
    } catch (error: any) {
      console.error('Error fetching shared insight:', error);
      return null;
    } finally {
      setLoading(false);
    }
  }, []);

  // Fetch user's shared insights
  const fetchUserSharedInsights = useCallback(async () => {
    setLoading(true);
    try {
      const { data: { user } } = await supabase.auth.getUser();
      
      if (!user) return;

      const { data, error } = await supabase
        .from('shared_insights')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false });

      if (error) throw error;

      setSharedInsights(data as ShareableInsight[]);
    } catch (error: any) {
      console.error('Error fetching shared insights:', error);
    } finally {
      setLoading(false);
    }
  }, []);

  // Delete shared insight
  const deleteSharedInsight = useCallback(async (id: string): Promise<boolean> => {
    try {
      const { error } = await supabase
        .from('shared_insights')
        .delete()
        .eq('id', id);

      if (error) throw error;

      setSharedInsights(prev => prev.filter(i => i.id !== id));
      toast.success('Shared link deleted');
      return true;
    } catch (error: any) {
      console.error('Error deleting shared insight:', error);
      toast.error('Failed to delete share link');
      return false;
    }
  }, []);

  return {
    loading,
    sharedInsights,
    createShareableLink,
    getSharedInsight,
    fetchUserSharedInsights,
    deleteSharedInsight
  };
}
