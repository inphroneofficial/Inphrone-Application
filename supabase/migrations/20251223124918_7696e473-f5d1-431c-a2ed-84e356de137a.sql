-- Fix function search paths for security
CREATE OR REPLACE FUNCTION public.increment_your_turn_votes(question_uuid UUID)
RETURNS void AS $$
BEGIN
  UPDATE public.your_turn_questions
  SET total_votes = total_votes + 1, updated_at = now()
  WHERE id = question_uuid;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;

CREATE OR REPLACE FUNCTION public.increment_slot_attempts(slot_uuid UUID)
RETURNS void AS $$
BEGIN
  UPDATE public.your_turn_slots
  SET attempt_count = attempt_count + 1, updated_at = now()
  WHERE id = slot_uuid;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;