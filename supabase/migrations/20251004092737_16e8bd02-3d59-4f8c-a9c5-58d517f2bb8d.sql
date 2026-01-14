-- Create profiles table for common user data
CREATE TABLE public.profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  full_name TEXT NOT NULL,
  email TEXT NOT NULL,
  profile_picture TEXT,
  gender TEXT CHECK (gender IN ('male', 'female', 'other', 'prefer_not_to_say')),
  date_of_birth DATE NOT NULL,
  country TEXT NOT NULL,
  state_region TEXT NOT NULL,
  city TEXT,
  user_type TEXT NOT NULL CHECK (user_type IN ('audience', 'creator', 'studio')),
  onboarding_completed BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Enable RLS
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

-- Profiles policies
CREATE POLICY "Users can view their own profile"
  ON public.profiles FOR SELECT
  USING (auth.uid() = id);

CREATE POLICY "Users can insert their own profile"
  ON public.profiles FOR INSERT
  WITH CHECK (auth.uid() = id);

CREATE POLICY "Users can update their own profile"
  ON public.profiles FOR UPDATE
  USING (auth.uid() = id);

-- Create audience_profiles table
CREATE TABLE public.audience_profiles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE UNIQUE,
  entertainment_preferences TEXT[] NOT NULL,
  language_preferences TEXT[] NOT NULL,
  genre_interests TEXT[] NOT NULL,
  favorite_platforms TEXT[] NOT NULL,
  content_frequency TEXT NOT NULL CHECK (content_frequency IN ('daily', 'weekly', 'occasionally')),
  motivation TEXT,
  notification_preferences TEXT[] DEFAULT ARRAY['email', 'in_app'],
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Enable RLS
ALTER TABLE public.audience_profiles ENABLE ROW LEVEL SECURITY;

-- Audience profiles policies
CREATE POLICY "Users can view their own audience profile"
  ON public.audience_profiles FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own audience profile"
  ON public.audience_profiles FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own audience profile"
  ON public.audience_profiles FOR UPDATE
  USING (auth.uid() = user_id);

-- Create creator_profiles table
CREATE TABLE public.creator_profiles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE UNIQUE,
  creator_name TEXT NOT NULL,
  creator_type TEXT NOT NULL,
  primary_category TEXT NOT NULL,
  industry_segment TEXT NOT NULL,
  active_platforms TEXT[] NOT NULL,
  region_of_operation TEXT NOT NULL,
  content_languages TEXT[] NOT NULL,
  audience_target_group TEXT,
  experience_level TEXT NOT NULL CHECK (experience_level IN ('beginner', 'intermediate', 'professional')),
  portfolio_link TEXT NOT NULL,
  insight_interests TEXT[] NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Enable RLS
ALTER TABLE public.creator_profiles ENABLE ROW LEVEL SECURITY;

-- Creator profiles policies
CREATE POLICY "Users can view their own creator profile"
  ON public.creator_profiles FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own creator profile"
  ON public.creator_profiles FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own creator profile"
  ON public.creator_profiles FOR UPDATE
  USING (auth.uid() = user_id);

-- Create studio_profiles table
CREATE TABLE public.studio_profiles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE UNIQUE,
  organization_name TEXT NOT NULL,
  organization_type TEXT NOT NULL,
  official_contact_email TEXT NOT NULL,
  headquarters_location TEXT NOT NULL,
  operation_regions TEXT[] NOT NULL,
  team_size TEXT NOT NULL CHECK (team_size IN ('1-10', '10-50', '50-200', '200+')),
  content_focus TEXT[] NOT NULL,
  preferred_insights TEXT[] NOT NULL,
  data_access_role TEXT NOT NULL,
  website_link TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Enable RLS
ALTER TABLE public.studio_profiles ENABLE ROW LEVEL SECURITY;

-- Studio profiles policies
CREATE POLICY "Users can view their own studio profile"
  ON public.studio_profiles FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own studio profile"
  ON public.studio_profiles FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own studio profile"
  ON public.studio_profiles FOR UPDATE
  USING (auth.uid() = user_id);

-- Create function to update updated_at timestamp
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create triggers for updated_at
CREATE TRIGGER update_profiles_updated_at
  BEFORE UPDATE ON public.profiles
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_audience_profiles_updated_at
  BEFORE UPDATE ON public.audience_profiles
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_creator_profiles_updated_at
  BEFORE UPDATE ON public.creator_profiles
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_studio_profiles_updated_at
  BEFORE UPDATE ON public.studio_profiles
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();