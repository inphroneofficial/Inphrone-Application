-- Make profile fields compatible with onboarding step
alter table public.profiles
  alter column date_of_birth drop not null;

-- Ensure non-nullable state_region can be set later without blocking inserts
alter table public.profiles
  alter column state_region set default '';

-- Auto-create a bare profile row when a user signs up
create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer set search_path = public
as $$
begin
  insert into public.profiles (
    id,
    full_name,
    email,
    country,
    state_region,
    user_type,
    date_of_birth,
    onboarding_completed,
    created_at,
    updated_at
  ) values (
    new.id,
    coalesce(new.raw_user_meta_data->>'full_name', new.email),
    new.email,
    coalesce(new.raw_user_meta_data->>'country', ''),
    '',
    coalesce(new.raw_user_meta_data->>'user_type', 'audience'),
    null,
    false,
    now(),
    now()
  )
  on conflict (id) do nothing;
  return new;
end;
$$;

-- Recreate trigger safely
drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute procedure public.handle_new_user();