import { useState, useEffect, useCallback } from "react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

export interface HypeSignal {
  id: string;
  phrase: string;
  category_id: string;
  category_name?: string;
  category_color?: string;
  created_by: string;
  hype_count: number;
  pass_count: number;
  signal_score: number;
  created_at: string;
  expires_at: string;
  user_vote?: 'hype' | 'pass' | null;
}

export interface Category {
  id: string;
  name: string;
  color: string;
  icon: string;
}

type SortTab = 'new' | 'rising' | 'top';

export function useHypeSignals(categoryId?: string) {
  const [signals, setSignals] = useState<HypeSignal[]>([]);
  const [loading, setLoading] = useState(true);
  const [categories, setCategories] = useState<Category[]>([]);
  const [userVotes, setUserVotes] = useState<Record<string, 'hype' | 'pass'>>({});
  const [currentUserId, setCurrentUserId] = useState<string | null>(null);
  const [userSubmissionsToday, setUserSubmissionsToday] = useState(0);

  // Fetch categories
  useEffect(() => {
    const fetchCategories = async () => {
      const { data } = await supabase.from("categories").select("*");
      if (data) setCategories(data);
    };
    fetchCategories();
  }, []);

  // Fetch current user
  useEffect(() => {
    const getUser = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      setCurrentUserId(user?.id || null);
    };
    getUser();
  }, []);

  // Fetch user's vote history
  const fetchUserVotes = useCallback(async (signalIds: string[]) => {
    if (!currentUserId || signalIds.length === 0) return;
    
    const { data } = await supabase
      .from("hype_votes")
      .select("signal_id, vote_type")
      .eq("user_id", currentUserId)
      .in("signal_id", signalIds);
    
    if (data) {
      const votesMap: Record<string, 'hype' | 'pass'> = {};
      data.forEach(v => {
        votesMap[v.signal_id] = v.vote_type as 'hype' | 'pass';
      });
      setUserVotes(votesMap);
    }
  }, [currentUserId]);

  // Fetch signals
  const fetchSignals = useCallback(async (sortBy: SortTab = 'new') => {
    setLoading(true);
    try {
      let query = supabase
        .from("hype_signals")
        .select(`
          *,
          categories:category_id (name, color)
        `)
        .eq("is_archived", false)
        .gt("expires_at", new Date().toISOString());

      if (categoryId) {
        query = query.eq("category_id", categoryId);
      }

      if (sortBy === 'new') {
        query = query.order("created_at", { ascending: false });
      } else if (sortBy === 'top') {
        query = query.order("signal_score", { ascending: false });
      }
      // For 'rising', we'd need the RPC function, handled separately

      const { data, error } = await query.limit(50);
      
      if (error) throw error;
      
      if (data) {
        const formattedSignals: HypeSignal[] = data.map((s: any) => ({
          ...s,
          category_name: s.categories?.name,
          category_color: s.categories?.color,
        }));
        setSignals(formattedSignals);
        fetchUserVotes(formattedSignals.map(s => s.id));
      }
    } catch (error: any) {
      console.error("Error fetching signals:", error);
    } finally {
      setLoading(false);
    }
  }, [categoryId, fetchUserVotes]);

  // Fetch rising signals using RPC
  const fetchRisingSignals = useCallback(async () => {
    setLoading(true);
    try {
      const { data, error } = await supabase.rpc("get_rising_signals", {
        category_filter: categoryId || null,
        limit_count: 50
      });
      
      if (error) throw error;
      
      if (data) {
        // Need to fetch category info separately
        const categoryData = await supabase
          .from("categories")
          .select("id, name, color");
        
        const catMap = new Map(categoryData.data?.map(c => [c.id, c]) || []);
        
        const formattedSignals: HypeSignal[] = data.map((s: any) => ({
          ...s,
          category_name: catMap.get(s.category_id)?.name,
          category_color: catMap.get(s.category_id)?.color,
        }));
        setSignals(formattedSignals);
        fetchUserVotes(formattedSignals.map(s => s.id));
      }
    } catch (error: any) {
      console.error("Error fetching rising signals:", error);
    } finally {
      setLoading(false);
    }
  }, [categoryId, fetchUserVotes]);

  // Check daily submission count
  const checkDailySubmissions = useCallback(async () => {
    if (!currentUserId) return;
    
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    
    const { count } = await supabase
      .from("hype_signals")
      .select("*", { count: "exact", head: true })
      .eq("created_by", currentUserId)
      .gte("created_at", today.toISOString());
    
    setUserSubmissionsToday(count || 0);
  }, [currentUserId]);

  useEffect(() => {
    if (currentUserId) {
      checkDailySubmissions();
    }
  }, [currentUserId, checkDailySubmissions]);

  // Submit a new signal
  const submitSignal = async (phrase: string, categoryId: string): Promise<boolean> => {
    if (!currentUserId) {
      toast.error("Please log in to submit a signal");
      return false;
    }

    if (userSubmissionsToday >= 3) {
      toast.error("Daily limit reached", {
        description: "You can submit up to 3 signals per day"
      });
      return false;
    }

    // Validate phrase
    const words = phrase.trim().split(/\s+/);
    if (words.length < 2 || words.length > 3) {
      toast.error("Invalid phrase", {
        description: "Please use 2-3 words only"
      });
      return false;
    }

    // Check for duplicates in same category
    const { data: existing } = await supabase
      .from("hype_signals")
      .select("id")
      .eq("category_id", categoryId)
      .ilike("phrase", phrase.trim())
      .gt("expires_at", new Date().toISOString())
      .single();

    if (existing) {
      toast.error("Signal already exists", {
        description: "This phrase has already been submitted in this category"
      });
      return false;
    }

    const { error } = await supabase.from("hype_signals").insert({
      phrase: phrase.trim(),
      category_id: categoryId,
      created_by: currentUserId,
    });

    if (error) {
      toast.error("Failed to submit signal");
      return false;
    }

    toast.success("Signal launched! 🚀", {
      description: "+5 points earned"
    });

    // Update rewards
    const { data: rewardData } = await supabase
      .from("rewards")
      .select("*")
      .eq("user_id", currentUserId)
      .single();

    if (rewardData) {
      await supabase
        .from("rewards")
        .update({ points: rewardData.points + 5 })
        .eq("user_id", currentUserId);
    }

    setUserSubmissionsToday(prev => prev + 1);
    return true;
  };

  // Vote on a signal
  const vote = async (signalId: string, voteType: 'hype' | 'pass'): Promise<boolean> => {
    if (!currentUserId) {
      toast.error("Please log in to vote");
      return false;
    }

    const existingVote = userVotes[signalId];

    try {
      if (existingVote) {
        if (existingVote === voteType) {
          // Remove vote
          const { error } = await supabase
            .from("hype_votes")
            .delete()
            .eq("signal_id", signalId)
            .eq("user_id", currentUserId);
          
          if (error) throw error;
          
          setUserVotes(prev => {
            const updated = { ...prev };
            delete updated[signalId];
            return updated;
          });
        } else {
          // Change vote
          const { error } = await supabase
            .from("hype_votes")
            .update({ vote_type: voteType })
            .eq("signal_id", signalId)
            .eq("user_id", currentUserId);
          
          if (error) throw error;
          
          setUserVotes(prev => ({ ...prev, [signalId]: voteType }));
        }
      } else {
        // New vote
        const { error } = await supabase.from("hype_votes").insert({
          signal_id: signalId,
          user_id: currentUserId,
          vote_type: voteType,
        });
        
        if (error) throw error;
        
        setUserVotes(prev => ({ ...prev, [signalId]: voteType }));
        
        // Update rewards (+1 point for voting)
        const { data: rewardData } = await supabase
          .from("rewards")
          .select("*")
          .eq("user_id", currentUserId)
          .single();

        if (rewardData) {
          await supabase
            .from("rewards")
            .update({ points: rewardData.points + 1 })
            .eq("user_id", currentUserId);
        }
      }

      return true;
    } catch (error: any) {
      console.error("Vote error:", error);
      toast.error("Failed to record vote");
      return false;
    }
  };

  // Setup realtime subscription
  useEffect(() => {
    const channel = supabase
      .channel('hype-signals-realtime')
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'hype_signals' },
        (payload) => {
          if (payload.eventType === 'UPDATE') {
            setSignals(prev => prev.map(s => 
              s.id === payload.new.id 
                ? { ...s, ...payload.new }
                : s
            ));
          } else if (payload.eventType === 'INSERT') {
            // Refresh to get proper category data
            fetchSignals('new');
          }
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [fetchSignals]);

  return {
    signals,
    loading,
    categories,
    userVotes,
    currentUserId,
    userSubmissionsToday,
    fetchSignals,
    fetchRisingSignals,
    submitSignal,
    vote,
    canSubmit: userSubmissionsToday < 3,
  };
}
