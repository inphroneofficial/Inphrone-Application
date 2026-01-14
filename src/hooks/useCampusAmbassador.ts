import { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

interface CampusAmbassador {
  id: string;
  user_id: string;
  college_name: string;
  college_city: string;
  college_state: string;
  student_id: string | null;
  ambassador_code: string;
  status: 'pending' | 'approved' | 'rejected' | 'active' | 'inactive';
  total_referrals: number;
  total_points: number;
  created_at: string;
  approved_at: string | null;
}

interface ApplicationData {
  college_name: string;
  college_city: string;
  college_state: string;
  student_id?: string;
}

export function useCampusAmbassador() {
  const [ambassador, setAmbassador] = useState<CampusAmbassador | null>(null);
  const [loading, setLoading] = useState(true);
  const [userId, setUserId] = useState<string | null>(null);

  useEffect(() => {
    const fetchUser = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (user) {
        setUserId(user.id);
        fetchAmbassadorData(user.id);
      } else {
        setLoading(false);
      }
    };
    fetchUser();
  }, []);

  const fetchAmbassadorData = async (uid: string) => {
    try {
      const { data, error } = await supabase
        .from('campus_ambassadors')
        .select('*')
        .eq('user_id', uid)
        .single();

      if (error && error.code !== 'PGRST116') {
        console.error('Error fetching ambassador data:', error);
      }

      if (data) {
        setAmbassador(data as CampusAmbassador);
      }
    } catch (error) {
      console.error('Error in fetchAmbassadorData:', error);
    } finally {
      setLoading(false);
    }
  };

  const applyAsAmbassador = useCallback(async (data: ApplicationData) => {
    if (!userId) {
      toast.error('Please login to apply');
      return false;
    }

    try {
      // Generate ambassador code
      const { data: codeResult, error: codeError } = await supabase
        .rpc('generate_ambassador_code', { college_name: data.college_name });

      if (codeError) throw codeError;

      const ambassadorCode = codeResult as string;

      // Create the application
      const { data: newAmbassador, error } = await supabase
        .from('campus_ambassadors')
        .insert({
          user_id: userId,
          college_name: data.college_name,
          college_city: data.college_city,
          college_state: data.college_state,
          student_id: data.student_id || null,
          ambassador_code: ambassadorCode,
          status: 'pending'
        })
        .select()
        .single();

      if (error) {
        if (error.code === '23505') {
          toast.error('You have already applied as a campus ambassador');
          return false;
        }
        throw error;
      }

      setAmbassador(newAmbassador as CampusAmbassador);
      toast.success('Application submitted successfully!');
      return true;
    } catch (error: any) {
      console.error('Error applying as ambassador:', error);
      toast.error('Failed to submit application');
      return false;
    }
  }, [userId]);

  const copyAmbassadorCode = useCallback(() => {
    if (ambassador?.ambassador_code) {
      navigator.clipboard.writeText(ambassador.ambassador_code);
      toast.success('Ambassador code copied!');
    }
  }, [ambassador]);

  const getStatusColor = useCallback((status: string) => {
    switch (status) {
      case 'pending': return 'bg-warning/20 text-warning';
      case 'approved': return 'bg-success/20 text-success';
      case 'active': return 'bg-primary/20 text-primary';
      case 'rejected': return 'bg-destructive/20 text-destructive';
      case 'inactive': return 'bg-muted text-muted-foreground';
      default: return 'bg-muted text-muted-foreground';
    }
  }, []);

  return {
    ambassador,
    loading,
    isAmbassador: !!ambassador,
    isApproved: ambassador?.status === 'approved' || ambassador?.status === 'active',
    applyAsAmbassador,
    copyAmbassadorCode,
    getStatusColor,
    refetch: () => userId && fetchAmbassadorData(userId)
  };
}
