BEGIN;
-- Ensure notifications fire on upvotes and views
DROP TRIGGER IF EXISTS tr_opinion_upvotes_notify ON public.opinion_upvotes;
CREATE TRIGGER tr_opinion_upvotes_notify
AFTER INSERT ON public.opinion_upvotes
FOR EACH ROW
EXECUTE FUNCTION public.notify_opinion_upvote();

DROP TRIGGER IF EXISTS tr_opinion_upvotes_avatar ON public.opinion_upvotes;
CREATE TRIGGER tr_opinion_upvotes_avatar
AFTER INSERT ON public.opinion_upvotes
FOR EACH ROW
EXECUTE FUNCTION public.update_harmony_on_upvote();

DROP TRIGGER IF EXISTS tr_opinion_upvotes_badge ON public.opinion_upvotes;
CREATE TRIGGER tr_opinion_upvotes_badge
AFTER INSERT ON public.opinion_upvotes
FOR EACH ROW
EXECUTE FUNCTION public.award_badges_on_upvote();

DROP TRIGGER IF EXISTS tr_opinion_views_notify ON public.opinion_views;
CREATE TRIGGER tr_opinion_views_notify
AFTER INSERT ON public.opinion_views
FOR EACH ROW
EXECUTE FUNCTION public.notify_opinion_viewed();
COMMIT;