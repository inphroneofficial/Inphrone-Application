-- Create trigger to send notification when opinion receives upvote
CREATE OR REPLACE FUNCTION public.notify_opinion_upvote()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  opinion_author_id uuid;
  upvoter_type text;
  upvoter_name text;
  opinion_title text;
  notification_message text;
BEGIN
  -- Get opinion author and title
  SELECT user_id, title INTO opinion_author_id, opinion_title
  FROM opinions
  WHERE id = NEW.opinion_id;
  
  -- Get upvoter's profile info
  SELECT user_type, full_name INTO upvoter_type, upvoter_name
  FROM profiles
  WHERE id = NEW.user_id;
  
  -- Create appropriate notification message based on user type
  IF upvoter_type = 'audience' THEN
    notification_message := 'Your opinion "' || COALESCE(opinion_title, 'Untitled') || '" received an upvote!';
  ELSE
    notification_message := 'Your opinion "' || COALESCE(opinion_title, 'Untitled') || '" was liked by ' || COALESCE(upvoter_name, 'a ' || upvoter_type) || '!';
  END IF;
  
  -- Insert notification (don't notify self)
  IF opinion_author_id != NEW.user_id THEN
    INSERT INTO notifications (user_id, title, message, type, action_url)
    VALUES (
      opinion_author_id,
      CASE 
        WHEN upvoter_type = 'audience' THEN '🔥 Opinion Upvoted!'
        ELSE '⭐ Opinion Liked!'
      END,
      notification_message,
      'upvote',
      '/insights'
    );
  END IF;
  
  RETURN NEW;
END;
$$;

-- Create trigger for upvote notifications
DROP TRIGGER IF EXISTS trigger_notify_opinion_upvote ON opinion_upvotes;
CREATE TRIGGER trigger_notify_opinion_upvote
  AFTER INSERT ON opinion_upvotes
  FOR EACH ROW
  EXECUTE FUNCTION notify_opinion_upvote();

-- Create trigger to send notification when opinion is viewed by creator/studio
CREATE OR REPLACE FUNCTION public.notify_opinion_viewed()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  opinion_author_id uuid;
  viewer_type text;
  viewer_name text;
  opinion_title text;
  notification_message text;
BEGIN
  -- Get opinion author and title
  SELECT user_id, title INTO opinion_author_id, opinion_title
  FROM opinions
  WHERE id = NEW.opinion_id;
  
  -- Get viewer's profile info
  SELECT user_type, full_name INTO viewer_type, viewer_name
  FROM profiles
  WHERE id = NEW.viewer_id;
  
  -- Only send notification if viewer is creator/studio/production/ott (not audience)
  IF viewer_type IN ('creator', 'studio', 'production', 'ott') AND opinion_author_id != NEW.viewer_id THEN
    notification_message := 'Your opinion "' || COALESCE(opinion_title, 'Untitled') || '" was viewed by ' || COALESCE(viewer_name, 'a ' || viewer_type) || '!';
    
    INSERT INTO notifications (user_id, title, message, type, action_url)
    VALUES (
      opinion_author_id,
      '👁️ Opinion Viewed!',
      notification_message,
      'view',
      '/insights'
    );
  END IF;
  
  RETURN NEW;
END;
$$;

-- Create trigger for view notifications
DROP TRIGGER IF EXISTS trigger_notify_opinion_viewed ON opinion_views;
CREATE TRIGGER trigger_notify_opinion_viewed
  AFTER INSERT ON opinion_views
  FOR EACH ROW
  EXECUTE FUNCTION notify_opinion_viewed();

-- Add is_upvote column to opinion_upvotes to distinguish upvotes from likes
-- Upvotes (from audience) affect trending, likes (from creators/studios) don't
ALTER TABLE opinion_upvotes 
ADD COLUMN IF NOT EXISTS is_upvote boolean DEFAULT true;

-- Update existing records: audience = upvote, others = like
UPDATE opinion_upvotes
SET is_upvote = (user_type = 'audience')
WHERE is_upvote IS NULL;

-- Make is_upvote NOT NULL after setting defaults
ALTER TABLE opinion_upvotes
ALTER COLUMN is_upvote SET NOT NULL;