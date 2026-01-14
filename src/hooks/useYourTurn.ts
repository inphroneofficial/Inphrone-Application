import { useState, useEffect, useCallback } from "react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

interface YourTurnSlot {
  id: string;
  slot_date: string;
  slot_time: string;
  status: string;
  winner_id: string | null;
  attempt_count: number;
  slot_started_at: string | null;
  slot_ended_at: string | null;
}

interface YourTurnQuestion {
  id: string;
  slot_id: string;
  user_id: string;
  question_text: string;
  options: Array<{ id: string; label: string; votes: number }>;
  total_votes: number;
  is_approved: boolean;
  is_deleted: boolean;
  created_at: string;
  winner_name?: string;
  slot_time?: string;
}

interface YourTurnAttempt {
  id: string;
  slot_id: string;
  user_id: string;
  attempted_at: string;
  is_winner: boolean;
}

export const useYourTurn = (userId: string | null) => {
  const [slots, setSlots] = useState<YourTurnSlot[]>([]);
  const [questions, setQuestions] = useState<YourTurnQuestion[]>([]);
  const [userAttempts, setUserAttempts] = useState<YourTurnAttempt[]>([]);
  const [userVotes, setUserVotes] = useState<Record<string, string>>({});
  const [loading, setLoading] = useState(true);
  const [isWinner, setIsWinner] = useState(false);
  const [wonSlotId, setWonSlotId] = useState<string | null>(null);
  const [hasSubmittedQuestion, setHasSubmittedQuestion] = useState(false);

  const SLOT_TIMES = ['09:00', '14:00', '19:00'];
  const SLOT_DURATION_SECONDS = 20;

  // Get current slot based on time
  const getCurrentSlotTime = useCallback(() => {
    const now = new Date();
    const hours = now.getHours();
    const minutes = now.getMinutes();
    const currentMinutes = hours * 60 + minutes;

    // 9:00 AM = 540 minutes, 2:00 PM = 840 minutes, 7:00 PM = 1140 minutes
    if (currentMinutes >= 540 && currentMinutes < 540 + 1) return '09:00';
    if (currentMinutes >= 840 && currentMinutes < 840 + 1) return '14:00';
    if (currentMinutes >= 1140 && currentMinutes < 1140 + 1) return '19:00';
    return null;
  }, []);

  // Get next slot time
  const getNextSlotTime = useCallback(() => {
    const now = new Date();
    const hours = now.getHours();
    const minutes = now.getMinutes();
    const currentMinutes = hours * 60 + minutes;

    if (currentMinutes < 540) return { time: '09:00', label: '9:00 AM' };
    if (currentMinutes < 840) return { time: '14:00', label: '2:00 PM' };
    if (currentMinutes < 1140) return { time: '19:00', label: '7:00 PM' };
    return { time: '09:00', label: '9:00 AM (Tomorrow)' };
  }, []);

  // Check if within slot window (first minute of the slot hour)
  const isWithinSlotWindow = useCallback((slotTime: string) => {
    const now = new Date();
    const hours = now.getHours();
    const minutes = now.getMinutes();
    const seconds = now.getSeconds();

    const slotHour = parseInt(slotTime.split(':')[0]);
    
    // Within first minute of the slot hour
    return hours === slotHour && minutes === 0 && seconds < 60;
  }, []);

  // Fetch today's slots
  const fetchSlots = useCallback(async () => {
    const today = new Date().toISOString().split('T')[0];
    
    const { data, error } = await supabase
      .from('your_turn_slots')
      .select('*')
      .eq('slot_date', today)
      .order('slot_time');

    if (error) {
      console.error('Error fetching slots:', error);
      return;
    }

    setSlots(data || []);
  }, []);

  // Fetch today's questions with vote counts
  const fetchQuestions = useCallback(async () => {
    const today = new Date().toISOString().split('T')[0];

    const { data: questionsData, error } = await supabase
      .from('your_turn_questions')
      .select(`
        *,
        your_turn_slots!inner(slot_date, slot_time)
      `)
      .eq('your_turn_slots.slot_date', today)
      .eq('is_deleted', false)
      .order('created_at');

    if (error) {
      console.error('Error fetching questions:', error);
      return;
    }

    if (!questionsData) return;

    // Get winner names
    const questionWithNames = await Promise.all(
      questionsData.map(async (q) => {
        const { data: profile } = await supabase
          .from('profiles')
          .select('full_name')
          .eq('id', q.user_id)
          .single();

        // Get vote counts per option
        const { data: votes } = await supabase
          .from('your_turn_votes')
          .select('selected_option')
          .eq('question_id', q.id);

        const voteCounts: Record<string, number> = {};
        votes?.forEach(v => {
          voteCounts[v.selected_option] = (voteCounts[v.selected_option] || 0) + 1;
        });

        const options = (q.options as Array<{ id: string; label: string }>).map(opt => ({
          ...opt,
          votes: voteCounts[opt.id] || 0
        }));

        return {
          ...q,
          winner_name: profile?.full_name || 'Anonymous',
          slot_time: (q.your_turn_slots as any)?.slot_time,
          options,
          total_votes: votes?.length || 0
        };
      })
    );

    setQuestions(questionWithNames);
  }, []);

  // Fetch user's attempts and votes
  const fetchUserData = useCallback(async () => {
    if (!userId) return;

    const today = new Date().toISOString().split('T')[0];

    // Get user's attempts for today
    const { data: attempts } = await supabase
      .from('your_turn_attempts')
      .select(`
        *,
        your_turn_slots!inner(slot_date)
      `)
      .eq('user_id', userId)
      .eq('your_turn_slots.slot_date', today);

    setUserAttempts(attempts || []);

    // Check if user is a winner
    const wonAttempt = attempts?.find(a => a.is_winner);
    if (wonAttempt) {
      setIsWinner(true);
      setWonSlotId(wonAttempt.slot_id);

      // Check if already submitted question
      const { data: existingQuestion } = await supabase
        .from('your_turn_questions')
        .select('id')
        .eq('slot_id', wonAttempt.slot_id)
        .eq('user_id', userId)
        .single();

      setHasSubmittedQuestion(!!existingQuestion);
    }

    // Get user's votes for today
    const { data: votes } = await supabase
      .from('your_turn_votes')
      .select(`
        question_id,
        selected_option,
        your_turn_questions!inner(
          your_turn_slots!inner(slot_date)
        )
      `)
      .eq('user_id', userId);

    const votesMap: Record<string, string> = {};
    votes?.forEach(v => {
      votesMap[v.question_id] = v.selected_option;
    });
    setUserVotes(votesMap);
  }, [userId]);

  // Attempt to join slot (I'm In button)
  const attemptJoin = useCallback(async (slotId: string) => {
    if (!userId) {
      toast.error("Please sign in to participate");
      return { success: false, isWinner: false };
    }

    try {
      // Check if slot already has a winner
      const { data: slot } = await supabase
        .from('your_turn_slots')
        .select('winner_id, status')
        .eq('id', slotId)
        .single();

      if (slot?.winner_id) {
        toast.error("This slot already has a winner!");
        return { success: false, isWinner: false };
      }

      // Try to insert attempt
      const { error: attemptError } = await supabase
        .from('your_turn_attempts')
        .insert({
          slot_id: slotId,
          user_id: userId,
          is_winner: false
        });

      if (attemptError) {
        if (attemptError.code === '23505') {
          toast.error("You've already attempted this slot!");
        }
        return { success: false, isWinner: false };
      }

      // Increment attempt count
      await supabase.rpc('increment_slot_attempts', { slot_uuid: slotId });

      // Try to claim winner spot (race condition - first one wins)
      const { data: updatedSlot, error: winnerError } = await supabase
        .from('your_turn_slots')
        .update({ 
          winner_id: userId,
          status: 'completed',
          slot_ended_at: new Date().toISOString()
        })
        .eq('id', slotId)
        .is('winner_id', null)
        .select()
        .single();

      if (winnerError || !updatedSlot) {
        // Someone else won
        toast.info("Better luck next time! Someone was faster 🏃");
        return { success: true, isWinner: false };
      }

      // Mark attempt as winner
      await supabase
        .from('your_turn_attempts')
        .update({ is_winner: true })
        .eq('slot_id', slotId)
        .eq('user_id', userId);

      setIsWinner(true);
      setWonSlotId(slotId);
      toast.success("🎉 Congratulations! You won this slot! Now submit your question.");
      
      return { success: true, isWinner: true };
    } catch (error) {
      console.error('Error attempting join:', error);
      return { success: false, isWinner: false };
    }
  }, [userId]);

  // Submit question (for winners)
  const submitQuestion = useCallback(async (
    slotId: string,
    questionText: string,
    options: Array<{ id: string; label: string }>
  ) => {
    if (!userId || !isWinner) {
      toast.error("Only winners can submit questions");
      return false;
    }

    if (options.length < 2 || options.length > 4) {
      toast.error("Please provide 2-4 options");
      return false;
    }

    try {
      const { error } = await supabase
        .from('your_turn_questions')
        .insert({
          slot_id: slotId,
          user_id: userId,
          question_text: questionText,
          options: options
        });

      if (error) {
        console.error('Error submitting question:', error);
        toast.error("Failed to submit question");
        return false;
      }

      setHasSubmittedQuestion(true);
      toast.success("Question submitted! Others can now vote.");
      await fetchQuestions();
      return true;
    } catch (error) {
      console.error('Error submitting question:', error);
      return false;
    }
  }, [userId, isWinner, fetchQuestions]);

  // Vote on a question
  const voteOnQuestion = useCallback(async (questionId: string, optionId: string) => {
    if (!userId) {
      toast.error("Please sign in to vote");
      return false;
    }

    // Check if already voted
    if (userVotes[questionId]) {
      toast.error("You've already voted on this question");
      return false;
    }

    try {
      const { error } = await supabase
        .from('your_turn_votes')
        .insert({
          question_id: questionId,
          user_id: userId,
          selected_option: optionId
        });

      if (error) {
        if (error.code === '23505') {
          toast.error("You've already voted on this question");
        }
        return false;
      }

      // Increment vote count
      await supabase.rpc('increment_your_turn_votes', { question_uuid: questionId });

      setUserVotes(prev => ({ ...prev, [questionId]: optionId }));
      toast.success("Vote recorded!");
      await fetchQuestions();
      return true;
    } catch (error) {
      console.error('Error voting:', error);
      return false;
    }
  }, [userId, userVotes, fetchQuestions]);

  // Create or get slot for current time
  const ensureSlotExists = useCallback(async (slotTime: string) => {
    const today = new Date().toISOString().split('T')[0];

    // Check if slot exists
    const { data: existingSlot } = await supabase
      .from('your_turn_slots')
      .select('*')
      .eq('slot_date', today)
      .eq('slot_time', slotTime)
      .single();

    if (existingSlot) return existingSlot;

    // Create new slot
    const { data: newSlot, error } = await supabase
      .from('your_turn_slots')
      .insert({
        slot_date: today,
        slot_time: slotTime,
        status: 'active',
        slot_started_at: new Date().toISOString()
      })
      .select()
      .single();

    if (error) {
      console.error('Error creating slot:', error);
      return null;
    }

    return newSlot;
  }, []);

  // Initial fetch
  useEffect(() => {
    const init = async () => {
      setLoading(true);
      await Promise.all([fetchSlots(), fetchQuestions(), fetchUserData()]);
      setLoading(false);
    };
    init();
  }, [fetchSlots, fetchQuestions, fetchUserData]);

  // Set up realtime subscriptions
  useEffect(() => {
    const slotsChannel = supabase
      .channel('your-turn-slots')
      .on('postgres_changes', {
        event: '*',
        schema: 'public',
        table: 'your_turn_slots'
      }, () => {
        fetchSlots();
      })
      .subscribe();

    const questionsChannel = supabase
      .channel('your-turn-questions')
      .on('postgres_changes', {
        event: '*',
        schema: 'public',
        table: 'your_turn_questions'
      }, () => {
        fetchQuestions();
      })
      .subscribe();

    const votesChannel = supabase
      .channel('your-turn-votes')
      .on('postgres_changes', {
        event: 'INSERT',
        schema: 'public',
        table: 'your_turn_votes'
      }, () => {
        fetchQuestions();
      })
      .subscribe();

    const attemptsChannel = supabase
      .channel('your-turn-attempts')
      .on('postgres_changes', {
        event: 'INSERT',
        schema: 'public',
        table: 'your_turn_attempts'
      }, () => {
        fetchSlots();
        fetchUserData();
      })
      .subscribe();

    return () => {
      supabase.removeChannel(slotsChannel);
      supabase.removeChannel(questionsChannel);
      supabase.removeChannel(votesChannel);
      supabase.removeChannel(attemptsChannel);
    };
  }, [fetchSlots, fetchQuestions, fetchUserData]);

  return {
    slots,
    questions,
    userAttempts,
    userVotes,
    loading,
    isWinner,
    wonSlotId,
    hasSubmittedQuestion,
    SLOT_TIMES,
    SLOT_DURATION_SECONDS,
    getCurrentSlotTime,
    getNextSlotTime,
    isWithinSlotWindow,
    attemptJoin,
    submitQuestion,
    voteOnQuestion,
    ensureSlotExists,
    refetch: async () => {
      await Promise.all([fetchSlots(), fetchQuestions(), fetchUserData()]);
    }
  };
};
