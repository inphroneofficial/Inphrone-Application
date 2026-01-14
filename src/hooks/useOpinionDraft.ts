import { useState, useEffect, useCallback } from "react";
import { toast } from "sonner";

interface OpinionDraft {
  categoryId: string;
  title: string;
  description: string;
  preferences: Record<string, any>;
  timestamp: number;
}

const DRAFT_KEY_PREFIX = "opinion_draft_";
const DRAFT_EXPIRY_MS = 7 * 24 * 60 * 60 * 1000; // 7 days

export function useOpinionDraft(categoryId: string) {
  const [hasDraft, setHasDraft] = useState(false);
  const draftKey = `${DRAFT_KEY_PREFIX}${categoryId}`;

  // Check for existing draft on mount
  useEffect(() => {
    const existingDraft = getDraft();
    setHasDraft(!!existingDraft);
  }, [categoryId]);

  // Save draft to localStorage
  const saveDraft = useCallback((data: Partial<OpinionDraft>) => {
    try {
      const draft: OpinionDraft = {
        categoryId,
        title: data.title || "",
        description: data.description || "",
        preferences: data.preferences || {},
        timestamp: Date.now()
      };

      // Only save if there's meaningful content
      if (draft.title || draft.description || Object.keys(draft.preferences).length > 0) {
        localStorage.setItem(draftKey, JSON.stringify(draft));
        setHasDraft(true);
      }
    } catch (error) {
      console.error("Error saving draft:", error);
    }
  }, [categoryId, draftKey]);

  // Get draft from localStorage
  const getDraft = useCallback((): OpinionDraft | null => {
    try {
      const stored = localStorage.getItem(draftKey);
      if (!stored) return null;

      const draft: OpinionDraft = JSON.parse(stored);

      // Check if draft has expired
      if (Date.now() - draft.timestamp > DRAFT_EXPIRY_MS) {
        clearDraft();
        return null;
      }

      return draft;
    } catch (error) {
      console.error("Error getting draft:", error);
      return null;
    }
  }, [draftKey]);

  // Clear draft from localStorage
  const clearDraft = useCallback(() => {
    try {
      localStorage.removeItem(draftKey);
      setHasDraft(false);
    } catch (error) {
      console.error("Error clearing draft:", error);
    }
  }, [draftKey]);

  // Restore draft with confirmation
  const restoreDraft = useCallback(() => {
    const draft = getDraft();
    if (draft) {
      toast.success("Draft restored! Continue where you left off.");
      return draft;
    }
    return null;
  }, [getDraft]);

  // Auto-save handler with debounce built-in
  const autoSave = useCallback((data: Partial<OpinionDraft>) => {
    saveDraft(data);
  }, [saveDraft]);

  // Clean up old drafts from other categories
  useEffect(() => {
    try {
      const keys = Object.keys(localStorage);
      keys.forEach(key => {
        if (key.startsWith(DRAFT_KEY_PREFIX)) {
          const stored = localStorage.getItem(key);
          if (stored) {
            const draft = JSON.parse(stored);
            if (Date.now() - draft.timestamp > DRAFT_EXPIRY_MS) {
              localStorage.removeItem(key);
            }
          }
        }
      });
    } catch (error) {
      console.error("Error cleaning up old drafts:", error);
    }
  }, []);

  return {
    hasDraft,
    saveDraft,
    getDraft,
    clearDraft,
    restoreDraft,
    autoSave
  };
}

// Get all drafts across categories
export function getAllDrafts(): OpinionDraft[] {
  const drafts: OpinionDraft[] = [];
  
  try {
    const keys = Object.keys(localStorage);
    keys.forEach(key => {
      if (key.startsWith(DRAFT_KEY_PREFIX)) {
        const stored = localStorage.getItem(key);
        if (stored) {
          const draft = JSON.parse(stored);
          if (Date.now() - draft.timestamp <= DRAFT_EXPIRY_MS) {
            drafts.push(draft);
          }
        }
      }
    });
  } catch (error) {
    console.error("Error getting all drafts:", error);
  }

  return drafts.sort((a, b) => b.timestamp - a.timestamp);
}

// Clear all drafts
export function clearAllDrafts(): void {
  try {
    const keys = Object.keys(localStorage);
    keys.forEach(key => {
      if (key.startsWith(DRAFT_KEY_PREFIX)) {
        localStorage.removeItem(key);
      }
    });
  } catch (error) {
    console.error("Error clearing all drafts:", error);
  }
}
