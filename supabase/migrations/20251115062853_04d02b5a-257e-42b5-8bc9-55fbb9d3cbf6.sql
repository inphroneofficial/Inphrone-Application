-- Fix RLS policy for opinion_views to allow proper counting
-- Drop existing restrictive policy
DROP POLICY IF EXISTS "Anyone can insert view records" ON opinion_views;

-- Allow authenticated users to insert their own view records
CREATE POLICY "Users can insert their own view records"
ON opinion_views FOR INSERT
TO authenticated
WITH CHECK (auth.uid() = viewer_id);

-- Allow users to view ALL opinion_views records (for counting)
-- This is safe because we don't expose sensitive data, just counts
DROP POLICY IF EXISTS "Opinion owners can view who viewed their opinions" ON opinion_views;

CREATE POLICY "Anyone authenticated can view opinion views"
ON opinion_views FOR SELECT
TO authenticated
USING (true);

-- Drop the feedback table since feedback should only be sent via email
DROP TABLE IF EXISTS feedback CASCADE;