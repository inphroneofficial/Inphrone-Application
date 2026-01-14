-- 1. Add App Development category
INSERT INTO categories (name, icon, color, description) VALUES 
  ('App Development', 'Smartphone', 'text-indigo-500', 'Share your app ideas, problems you want solved, and features you need');

-- 2. Add location columns to opinions table for mandatory location tracking
ALTER TABLE opinions 
  ADD COLUMN IF NOT EXISTS city TEXT,
  ADD COLUMN IF NOT EXISTS country TEXT;

-- 3. Add developer profile table
CREATE TABLE IF NOT EXISTS developer_profiles (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE UNIQUE,
  organization_name TEXT NOT NULL,
  organization_type TEXT NOT NULL,
  official_contact_email TEXT NOT NULL,
  headquarters_location TEXT NOT NULL,
  operation_regions TEXT[] NOT NULL,
  team_size TEXT NOT NULL,
  content_focus TEXT[] NOT NULL,
  preferred_insights TEXT[] NOT NULL,
  data_access_role TEXT NOT NULL,
  website_link TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Enable RLS on developer_profiles
ALTER TABLE developer_profiles ENABLE ROW LEVEL SECURITY;

-- RLS policies for developer_profiles
CREATE POLICY "Users can insert their own developer profile"
  ON developer_profiles FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own developer profile"
  ON developer_profiles FOR UPDATE
  USING (auth.uid() = user_id);

CREATE POLICY "Users can view their own developer profile"
  ON developer_profiles FOR SELECT
  USING (auth.uid() = user_id);

-- 4. Add question_removal notification type to show deleted questions info
-- This will be handled via the existing notifications table with type 'question_removed'