-- Fix 1: Restrict opinions table access to authenticated users only
-- Drop the public access policy
DROP POLICY IF EXISTS "Users can view all opinions" ON public.opinions;

-- Create new policy requiring authentication
CREATE POLICY "Authenticated users can view opinions"
ON public.opinions
FOR SELECT
USING (auth.role() = 'authenticated');

-- Fix 2: Add server-side input validation constraints
-- Add length constraints to prevent XSS and ensure data integrity
ALTER TABLE public.opinions
ADD CONSTRAINT title_length CHECK (char_length(title) <= 200),
ADD CONSTRAINT description_length CHECK (char_length(description) <= 1000),
ADD CONSTRAINT why_excited_length CHECK (char_length(why_excited) <= 500),
ADD CONSTRAINT comments_length CHECK (char_length(comments) <= 1000),
ADD CONSTRAINT additional_notes_length CHECK (char_length(additional_notes) <= 500);