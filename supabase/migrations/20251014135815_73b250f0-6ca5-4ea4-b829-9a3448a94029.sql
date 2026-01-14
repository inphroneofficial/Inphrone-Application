-- Create public avatars bucket if not exists
insert into storage.buckets (id, name, public)
values ('avatars', 'avatars', true)
on conflict (id) do nothing;

-- Storage policies for avatars bucket (drop and recreate to ensure clean state)
drop policy if exists "Avatar images are publicly accessible" on storage.objects;
create policy "Avatar images are publicly accessible"
  on storage.objects
  for select
  using (bucket_id = 'avatars');

drop policy if exists "Users can upload their own avatar" on storage.objects;
create policy "Users can upload their own avatar"
  on storage.objects
  for insert
  with check (
    bucket_id = 'avatars'
    and auth.uid()::text = (storage.foldername(name))[1]
  );

drop policy if exists "Users can update their own avatar" on storage.objects;
create policy "Users can update their own avatar"
  on storage.objects
  for update
  using (
    bucket_id = 'avatars'
    and auth.uid()::text = (storage.foldername(name))[1]
  );

-- Secure aggregate function to get user counts bypassing RLS
create or replace function public.get_user_counts()
returns table (
  total_users integer,
  audience integer,
  creator integer,
  studio integer,
  production integer,
  ott integer
)
language plpgsql
stable
security definer
set search_path = public
as $$
begin
  return query
  select
    count(*)::int as total_users,
    count(*) filter (where user_type = 'audience')::int as audience,
    count(*) filter (where user_type = 'creator')::int as creator,
    count(*) filter (where user_type = 'studio')::int as studio,
    count(*) filter (where user_type = 'production')::int as production,
    count(*) filter (where user_type = 'ott')::int as ott
  from public.profiles;
end;
$$;