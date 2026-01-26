-- SECURITY FIX: Replace vulnerable RPC functions with secure triggers
-- The increment/decrement functions allowed any user to manipulate upvote counts directly

-- First, create secure trigger functions to manage upvote counts automatically
-- These will fire on INSERT/DELETE of opinion_upvotes table which has RLS

-- Trigger function to increment upvotes when a new upvote is inserted
CREATE OR REPLACE FUNCTION public.trigger_increment_opinion_upvotes()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $$
BEGIN
  UPDATE public.opinions
  SET upvotes = upvotes + 1
  WHERE id = NEW.opinion_id;
  RETURN NEW;
END;
$$;

-- Trigger function to decrement upvotes when an upvote is deleted
CREATE OR REPLACE FUNCTION public.trigger_decrement_opinion_upvotes()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $$
BEGIN
  UPDATE public.opinions
  SET upvotes = GREATEST(0, upvotes - 1)
  WHERE id = OLD.opinion_id;
  RETURN OLD;
END;
$$;

-- Create the triggers on opinion_upvotes table
CREATE TRIGGER on_opinion_upvote_insert
  AFTER INSERT ON public.opinion_upvotes
  FOR EACH ROW
  EXECUTE FUNCTION public.trigger_increment_opinion_upvotes();

CREATE TRIGGER on_opinion_upvote_delete
  AFTER DELETE ON public.opinion_upvotes
  FOR EACH ROW
  EXECUTE FUNCTION public.trigger_decrement_opinion_upvotes();

-- Now drop the vulnerable RPC functions that allowed direct manipulation
DROP FUNCTION IF EXISTS public.increment_opinion_upvotes(uuid);
DROP FUNCTION IF EXISTS public.decrement_opinion_upvotes(uuid);