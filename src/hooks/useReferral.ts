import { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

interface ReferralCode {
  id: string;
  code: string;
  is_active: boolean;
  created_at: string;
}

interface ReferralClaim {
  id: string;
  claimed_at: string;
  bonus_awarded: boolean;
  referred_user_id: string;
}

export function useReferral() {
  const [referralCode, setReferralCode] = useState<ReferralCode | null>(null);
  const [claims, setClaims] = useState<ReferralClaim[]>([]);
  const [loading, setLoading] = useState(true);
  const [userId, setUserId] = useState<string | null>(null);

  useEffect(() => {
    const fetchUser = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (user) {
        setUserId(user.id);
        fetchReferralData(user.id);
      } else {
        setLoading(false);
      }
    };
    fetchUser();
  }, []);

  const fetchReferralData = async (uid: string) => {
    try {
      // Fetch user's referral code
      const { data: codeData, error: codeError } = await supabase
        .from('referral_codes')
        .select('*')
        .eq('user_id', uid)
        .eq('is_active', true)
        .single();

      if (codeError && codeError.code !== 'PGRST116') {
        console.error('Error fetching referral code:', codeError);
      }

      if (codeData) {
        setReferralCode(codeData);

        // Fetch claims for this referral code
        const { data: claimsData, error: claimsError } = await supabase
          .from('referral_claims')
          .select('*')
          .eq('referrer_user_id', uid);

        if (claimsError) {
          console.error('Error fetching claims:', claimsError);
        } else {
          setClaims(claimsData || []);
        }
      }
    } catch (error) {
      console.error('Error in fetchReferralData:', error);
    } finally {
      setLoading(false);
    }
  };

  const generateReferralCode = useCallback(async () => {
    if (!userId) {
      toast.error('Please login to generate a referral code');
      return null;
    }

    try {
      // Generate a unique code
      const { data: codeResult, error: codeGenError } = await supabase
        .rpc('generate_unique_referral_code');

      if (codeGenError) throw codeGenError;

      const newCode = codeResult as string;

      // Insert the new referral code
      const { data, error } = await supabase
        .from('referral_codes')
        .insert({
          user_id: userId,
          code: newCode,
          is_active: true
        })
        .select()
        .single();

      if (error) throw error;

      setReferralCode(data);
      toast.success('Referral code generated!');
      return data;
    } catch (error: any) {
      console.error('Error generating referral code:', error);
      toast.error('Failed to generate referral code');
      return null;
    }
  }, [userId]);

  const claimReferralCode = useCallback(async (code: string) => {
    if (!userId) {
      toast.error('Please login to claim a referral code');
      return false;
    }

    try {
      // Find the referral code
      const { data: codeData, error: findError } = await supabase
        .from('referral_codes')
        .select('*')
        .eq('code', code.toUpperCase())
        .eq('is_active', true)
        .single();

      if (findError || !codeData) {
        toast.error('Invalid referral code');
        return false;
      }

      // Check if user is trying to use their own code
      if (codeData.user_id === userId) {
        toast.error('You cannot use your own referral code');
        return false;
      }

      // Check if user has already claimed a code
      const { data: existingClaim } = await supabase
        .from('referral_claims')
        .select('id')
        .eq('referred_user_id', userId)
        .single();

      if (existingClaim) {
        toast.error('You have already claimed a referral code');
        return false;
      }

      // Create the claim
      const { error: claimError } = await supabase
        .from('referral_claims')
        .insert({
          referral_code_id: codeData.id,
          referred_user_id: userId,
          referrer_user_id: codeData.user_id,
          bonus_awarded: false
        });

      if (claimError) throw claimError;

      // Mark claim as bonus awarded
      await supabase
        .from('referral_claims')
        .update({ bonus_awarded: true })
        .eq('referred_user_id', userId);

      toast.success('Referral code claimed! You earned 50 bonus points!');
      return true;
    } catch (error: any) {
      console.error('Error claiming referral code:', error);
      toast.error('Failed to claim referral code');
      return false;
    }
  }, [userId]);

  const copyCodeToClipboard = useCallback(() => {
    if (referralCode?.code) {
      navigator.clipboard.writeText(referralCode.code);
      toast.success('Referral code copied!');
    }
  }, [referralCode]);

  const shareReferralCode = useCallback(async () => {
    if (!referralCode?.code) return;

    const shareData = {
      title: 'Join Inphrone!',
      text: `Join Inphrone and share your entertainment opinions! Use my referral code: ${referralCode.code}`,
      url: `${window.location.origin}/auth?ref=${referralCode.code}`
    };

    if (navigator.share && navigator.canShare(shareData)) {
      try {
        await navigator.share(shareData);
      } catch (error) {
        copyCodeToClipboard();
      }
    } else {
      copyCodeToClipboard();
    }
  }, [referralCode, copyCodeToClipboard]);

  return {
    referralCode,
    claims,
    loading,
    totalReferrals: claims.length,
    generateReferralCode,
    claimReferralCode,
    copyCodeToClipboard,
    shareReferralCode,
    refetch: () => userId && fetchReferralData(userId)
  };
}
