-- Fix the notification trigger to show opinion title and handle all likes
CREATE OR REPLACE FUNCTION public.notify_opinion_upvote()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $function$
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
  
  -- Create appropriate notification message
  IF NEW.is_upvote THEN
    -- Audience upvote
    notification_message := 'Your opinion "' || COALESCE(opinion_title, 'Untitled') || '" received an upvote!';
  ELSE
    -- Non-audience like
    notification_message := 'Your opinion "' || COALESCE(opinion_title, 'Untitled') || '" was liked by ' || COALESCE(upvoter_name, 'a ' || upvoter_type) || '!';
  END IF;
  
  -- Insert notification (don't notify self)
  IF opinion_author_id != NEW.user_id THEN
    INSERT INTO notifications (user_id, title, message, type, action_url)
    VALUES (
      opinion_author_id,
      CASE 
        WHEN NEW.is_upvote THEN '🔥 Opinion Upvoted!'
        ELSE '⭐ Opinion Liked!'
      END,
      notification_message,
      'upvote',
      '/insights'
    );
  END IF;
  
  RETURN NEW;
END;
$function$;