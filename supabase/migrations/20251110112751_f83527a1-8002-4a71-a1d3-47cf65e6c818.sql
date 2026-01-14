-- Create OTT profiles table (separate from TV)
CREATE TABLE IF NOT EXISTS public.ott_profiles (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
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
  CONSTRAINT unique_ott_user UNIQUE(user_id)
);

-- Create TV profiles table (separate from OTT)
CREATE TABLE IF NOT EXISTS public.tv_profiles (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
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
  CONSTRAINT unique_tv_user UNIQUE(user_id)
);

-- Create Gaming profiles table
CREATE TABLE IF NOT EXISTS public.gaming_profiles (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
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
  CONSTRAINT unique_gaming_user UNIQUE(user_id)
);

-- Create Music profiles table
CREATE TABLE IF NOT EXISTS public.music_profiles (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
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
  CONSTRAINT unique_music_user UNIQUE(user_id)
);

-- Enable RLS on all new tables
ALTER TABLE public.ott_profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.tv_profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.gaming_profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.music_profiles ENABLE ROW LEVEL SECURITY;

-- Create RLS policies for OTT profiles
CREATE POLICY "Users can view their own ott profile"
ON public.ott_profiles FOR SELECT
USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own ott profile"
ON public.ott_profiles FOR INSERT
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own ott profile"
ON public.ott_profiles FOR UPDATE
USING (auth.uid() = user_id);

-- Create RLS policies for TV profiles
CREATE POLICY "Users can view their own tv profile"
ON public.tv_profiles FOR SELECT
USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own tv profile"
ON public.tv_profiles FOR INSERT
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own tv profile"
ON public.tv_profiles FOR UPDATE
USING (auth.uid() = user_id);

-- Create RLS policies for Gaming profiles
CREATE POLICY "Users can view their own gaming profile"
ON public.gaming_profiles FOR SELECT
USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own gaming profile"
ON public.gaming_profiles FOR INSERT
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own gaming profile"
ON public.gaming_profiles FOR UPDATE
USING (auth.uid() = user_id);

-- Create RLS policies for Music profiles
CREATE POLICY "Users can view their own music profile"
ON public.music_profiles FOR SELECT
USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own music profile"
ON public.music_profiles FOR INSERT
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own music profile"
ON public.music_profiles FOR UPDATE
USING (auth.uid() = user_id);

-- Create triggers for updated_at
CREATE TRIGGER update_ott_profiles_updated_at
BEFORE UPDATE ON public.ott_profiles
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_tv_profiles_updated_at
BEFORE UPDATE ON public.tv_profiles
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_gaming_profiles_updated_at
BEFORE UPDATE ON public.gaming_profiles
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_music_profiles_updated_at
BEFORE UPDATE ON public.music_profiles
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();