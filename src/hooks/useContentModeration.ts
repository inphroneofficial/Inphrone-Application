import { useState, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

type ContentType = 'opinion' | 'question' | 'review' | 'feedback';
type FlagReason = 'inappropriate' | 'spam' | 'harassment' | 'false_info' | 'other';

interface ContentFlag {
  content_type: ContentType;
  content_id: string;
  flag_reason: FlagReason;
  flag_details?: string;
}

// Simple content filter patterns
const INAPPROPRIATE_PATTERNS = [
  /\b(hate|kill|die|stupid|idiot)\b/gi,
  /\b(spam|scam|fake)\b/gi,
];

const SPAM_PATTERNS = [
  /(http|https):\/\/[^\s]+/gi, // URLs
  /\b(buy|sell|offer|discount|click here|free money)\b/gi,
  /(.)\1{4,}/gi, // Repeated characters
];

export function useContentModeration() {
  const [loading, setLoading] = useState(false);

  // Client-side content check (basic)
  const checkContent = useCallback((text: string): { 
    isClean: boolean; 
    issues: string[];
    confidence: number;
  } => {
    const issues: string[] = [];
    let riskScore = 0;

    // Check for inappropriate content
    for (const pattern of INAPPROPRIATE_PATTERNS) {
      if (pattern.test(text)) {
        issues.push('Potentially inappropriate language detected');
        riskScore += 0.3;
        break;
      }
    }

    // Check for spam patterns
    for (const pattern of SPAM_PATTERNS) {
      if (pattern.test(text)) {
        issues.push('Potential spam content detected');
        riskScore += 0.2;
        break;
      }
    }

    // Check text quality
    if (text.length < 10) {
      issues.push('Content too short');
      riskScore += 0.1;
    }

    if (text.length > 2000) {
      issues.push('Content too long');
      riskScore += 0.1;
    }

    // Check for all caps
    if (text.length > 20 && text === text.toUpperCase()) {
      issues.push('All caps text detected');
      riskScore += 0.1;
    }

    const confidence = Math.min(riskScore, 1);

    return {
      isClean: issues.length === 0,
      issues,
      confidence
    };
  }, []);

  // Report content
  const reportContent = useCallback(async (flag: ContentFlag): Promise<boolean> => {
    setLoading(true);
    try {
      const { data: { user } } = await supabase.auth.getUser();
      
      if (!user) {
        toast.error('Please login to report content');
        return false;
      }

      const { error } = await supabase
        .from('content_flags')
        .insert({
          content_type: flag.content_type,
          content_id: flag.content_id,
          flagged_by: user.id,
          flag_reason: flag.flag_reason,
          flag_details: flag.flag_details,
          status: 'pending'
        });

      if (error) throw error;

      toast.success('Content reported. Our team will review it.');
      return true;
    } catch (error: any) {
      console.error('Error reporting content:', error);
      toast.error('Failed to report content');
      return false;
    } finally {
      setLoading(false);
    }
  }, []);

  // Sanitize input
  const sanitizeInput = useCallback((text: string): string => {
    // Remove excessive whitespace
    let sanitized = text.replace(/\s+/g, ' ').trim();
    
    // Remove potential XSS
    sanitized = sanitized.replace(/<[^>]*>/g, '');
    
    // Limit length
    if (sanitized.length > 2000) {
      sanitized = sanitized.substring(0, 2000);
    }

    return sanitized;
  }, []);

  return {
    loading,
    checkContent,
    reportContent,
    sanitizeInput
  };
}
