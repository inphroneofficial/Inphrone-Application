-- Ensure avatars bucket exists and has correct policies
insert into storage.buckets (id, name, public)
values ('avatars', 'avatars', true)
on conflict (id) do update set public = true;

-- Delete account function (anonymizes or deletes user data)
create or replace function public.delete_user_account()
returns void
language plpgsql
security definer
set search_path = public
as $$
declare
  current_user_id uuid;
begin
  current_user_id := auth.uid();
  
  if current_user_id is null then
    raise exception 'Not authenticated';
  end if;

  -- Delete user-specific data
  delete from public.opinion_upvotes where user_id = current_user_id;
  delete from public.opinions where user_id = current_user_id;
  delete from public.rewards where user_id = current_user_id;
  delete from public.coupons where user_id = current_user_id;
  delete from public.audience_profiles where user_id = current_user_id;
  delete from public.creator_profiles where user_id = current_user_id;
  delete from public.studio_profiles where user_id = current_user_id;
  delete from public.user_activity_logs where user_id = current_user_id;
  delete from public.profiles where id = current_user_id;
  
  -- Delete auth user (cascades to everything else)
  delete from auth.users where id = current_user_id;
end;
$$;

-- User activity logs for time tracking
create table if not exists public.user_activity_logs (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null,
  page_name text not null,
  session_start timestamp with time zone not null default now(),
  session_end timestamp with time zone,
  duration_seconds integer,
  created_at timestamp with time zone default now()
);

alter table public.user_activity_logs enable row level security;

create policy "Users can insert their own activity logs"
  on public.user_activity_logs for insert
  with check (auth.uid() = user_id);

create policy "Users can view their own activity logs"
  on public.user_activity_logs for select
  using (auth.uid() = user_id);

create policy "Users can update their own activity logs"
  on public.user_activity_logs for update
  using (auth.uid() = user_id);

-- Weekly stats table (stores historical data)
create table if not exists public.weekly_stats (
  id uuid primary key default gen_random_uuid(),
  week_start_date date not null,
  week_end_date date not null,
  category_id uuid references public.categories(id),
  user_id uuid,
  user_type text,
  total_opinions integer default 0,
  total_upvotes integer default 0,
  total_contributors integer default 0,
  created_at timestamp with time zone default now(),
  unique(week_start_date, category_id, user_id)
);

alter table public.weekly_stats enable row level security;

create policy "Anyone can view weekly stats"
  on public.weekly_stats for select
  using (true);

create policy "System can insert weekly stats"
  on public.weekly_stats for insert
  with check (true);

-- Function to get current week's Monday (start of week)
create or replace function public.get_week_start()
returns date
language sql
stable
as $$
  select (current_date - (extract(dow from current_date)::int - 1) * interval '1 day')::date;
$$;

-- Function to get days left in current week
create or replace function public.get_days_left_in_week()
returns integer
language sql
stable
as $$
  select 7 - extract(dow from current_date)::int;
$$;

-- Function to archive current week's stats (run this via cron every Monday)
create or replace function public.archive_weekly_stats()
returns void
language plpgsql
security definer
set search_path = public
as $$
declare
  last_week_start date;
  last_week_end date;
  cat record;
begin
  -- Calculate last week's date range
  last_week_start := (current_date - interval '7 days' - (extract(dow from current_date - interval '7 days')::int - 1) * interval '1 day')::date;
  last_week_end := last_week_start + interval '6 days';

  -- Archive stats for each category
  for cat in select id from public.categories loop
    insert into public.weekly_stats (
      week_start_date,
      week_end_date,
      category_id,
      user_id,
      total_opinions,
      total_upvotes
    )
    select
      last_week_start,
      last_week_end,
      cat.id,
      null,
      count(*),
      sum(upvotes)
    from public.opinions
    where category_id = cat.id
      and created_at >= last_week_start
      and created_at <= last_week_end + interval '1 day'
    group by category_id
    on conflict (week_start_date, category_id, user_id) do update
    set total_opinions = excluded.total_opinions,
        total_upvotes = excluded.total_upvotes;
  end loop;
end;
$$;