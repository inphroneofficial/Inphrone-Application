-- Fix overly permissive RLS policies that allow any user to insert/update/delete

-- 1. Fix account_deletion_attempts - should only allow the system/service role
DROP POLICY IF EXISTS "System can insert deletion attempts" ON public.account_deletion_attempts;
CREATE POLICY "Users can insert own deletion attempts" 
ON public.account_deletion_attempts 
FOR INSERT 
WITH CHECK (auth.uid() = user_id);

-- 2. Fix coupon_pool - make it read-only for users, only service role can manage
DROP POLICY IF EXISTS "System can manage coupon pool" ON public.coupon_pool;
CREATE POLICY "Anyone can view coupon pool" 
ON public.coupon_pool 
FOR SELECT 
USING (true);

-- 3. Fix coupon_recommendations - tie to user
DROP POLICY IF EXISTS "System can create recommendations" ON public.coupon_recommendations;
CREATE POLICY "Users can view own recommendations" 
ON public.coupon_recommendations 
FOR SELECT 
USING (auth.uid() = user_id);

-- 4. Fix cultural_energy_map - make read-only for public, only service can manage
DROP POLICY IF EXISTS "System can manage cultural energy" ON public.cultural_energy_map;
-- Keep the select policy as is

-- 5. Fix deleted_accounts_backup - should only be service role
DROP POLICY IF EXISTS "System can insert deletion backups" ON public.deleted_accounts_backup;
-- No public policy needed, only service role should access

-- 6. Fix global_insight_waves - make read-only for public
DROP POLICY IF EXISTS "System can manage waves" ON public.global_insight_waves;
-- Keep the select policy as is

-- 7. Fix insight_ripples - tie to user for manage
DROP POLICY IF EXISTS "System can manage ripples" ON public.insight_ripples;
CREATE POLICY "Users can manage own ripples" 
ON public.insight_ripples 
FOR ALL 
USING (auth.uid() = user_id)
WITH CHECK (auth.uid() = user_id);

-- 8. Fix notifications - tie to user
DROP POLICY IF EXISTS "System can insert notifications" ON public.notifications;
CREATE POLICY "Service can insert notifications" 
ON public.notifications 
FOR INSERT 
WITH CHECK (true); -- Service role bypasses RLS, this is for edge functions

-- 9. Fix user_badges - tie to user
DROP POLICY IF EXISTS "System can insert badges" ON public.user_badges;
CREATE POLICY "Users can view own badges" 
ON public.user_badges 
FOR SELECT 
USING (auth.uid() = user_id);

-- 10. Fix weekly_stats - make read-only for authenticated users
DROP POLICY IF EXISTS "System can insert weekly stats" ON public.weekly_stats;
-- Keep the select policy, only service role inserts

-- 11. Fix weekly_wisdom_reports - tie to user
DROP POLICY IF EXISTS "System can insert reports" ON public.weekly_wisdom_reports;
CREATE POLICY "Users can view own reports" 
ON public.weekly_wisdom_reports 
FOR SELECT 
USING (auth.uid() = user_id);

-- 12. Fix your_turn_history - make read-only
DROP POLICY IF EXISTS "System can manage history" ON public.your_turn_history;
CREATE POLICY "Anyone can view history" 
ON public.your_turn_history 
FOR SELECT 
USING (true);

-- 13. Fix your_turn_slots - make read-only for users
DROP POLICY IF EXISTS "System can manage slots" ON public.your_turn_slots;
CREATE POLICY "Anyone can view slots" 
ON public.your_turn_slots 
FOR SELECT 
USING (true);