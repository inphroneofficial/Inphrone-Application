-- Log table for deleted accounts
create table if not exists public.deleted_accounts_log (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null,
  email text,
  user_type text,
  deleted_at timestamptz not null default now()
);

alter table public.deleted_accounts_log enable row level security;

-- Extend delete_user_account to comprehensively remove data and log deletion
create or replace function public.delete_user_account()
returns void
language plpgsql
security definer
set search_path = public
as $$
declare
  current_user_id uuid;
  v_email text;
  v_type text;
  v_opinion_ids uuid[] := '{}';
begin
  current_user_id := auth.uid();
  if current_user_id is null then
    raise exception 'Not authenticated';
  end if;

  -- Capture user info before deletion
  select email, user_type into v_email, v_type from public.profiles where id = current_user_id;

  -- Log deletion
  insert into public.deleted_accounts_log(user_id, email, user_type) values (current_user_id, v_email, v_type);

  -- Gather opinions authored by the user
  select coalesce(array_agg(id), '{}') into v_opinion_ids from public.opinions where user_id = current_user_id;

  -- Delete dependent/related data (order matters for FKs)
  delete from public.opinion_views where viewer_id = current_user_id or opinion_id = any(v_opinion_ids);
  delete from public.opinion_upvotes where user_id = current_user_id or opinion_id = any(v_opinion_ids);
  delete from public.insight_ripples where user_id = current_user_id or opinion_id = any(v_opinion_ids);
  delete from public.time_capsules where user_id = current_user_id or opinion_id = any(v_opinion_ids);
  delete from public.notifications where user_id = current_user_id;
  delete from public.user_badges where user_id = current_user_id;
  delete from public.user_streaks where user_id = current_user_id;
  delete from public.user_avatars where user_id = current_user_id;
  delete from public.rewards where user_id = current_user_id;
  delete from public.coupons where user_id = current_user_id;
  delete from public.user_activity_logs where user_id = current_user_id;
  delete from public.weekly_wisdom_reports where user_id = current_user_id;
  delete from public.wave_participants where user_id = current_user_id;

  -- Delete profiles across all types
  delete from public.audience_profiles where user_id = current_user_id;
  delete from public.creator_profiles where user_id = current_user_id;
  delete from public.studio_profiles where user_id = current_user_id;
  delete from public.ott_profiles where user_id = current_user_id;
  delete from public.tv_profiles where user_id = current_user_id;
  delete from public.gaming_profiles where user_id = current_user_id;
  delete from public.music_profiles where user_id = current_user_id;

  -- Finally delete authored opinions and profile
  delete from public.opinions where user_id = current_user_id;
  delete from public.profiles where id = current_user_id;

  -- Remove auth user (cascades where applicable)
  delete from auth.users where id = current_user_id;
end;
$$;