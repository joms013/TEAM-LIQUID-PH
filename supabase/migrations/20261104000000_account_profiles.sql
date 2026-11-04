create table if not exists public.account_profiles (
  user_id uuid primary key references auth.users (id) on delete cascade,
  status text not null default 'active' check (status in ('active', 'blocked')),
  must_change_password boolean not null default true,
  created_at timestamptz not null default now()
);

alter table public.account_profiles enable row level security;
revoke all on public.account_profiles from public, anon, authenticated;
grant select on public.account_profiles to authenticated;

drop policy if exists "Users can read their own account profile" on public.account_profiles;
create policy "Users can read their own account profile"
  on public.account_profiles for select to authenticated
  using ((select auth.uid()) = user_id);

insert into public.account_profiles (user_id)
select id from auth.users
on conflict (user_id) do nothing;

create or replace function public.create_account_profile_for_auth_user()
returns trigger
language plpgsql
security definer
set search_path = ''
as $$
begin
  insert into public.account_profiles (user_id) values (new.id)
  on conflict (user_id) do nothing;
  return new;
end;
$$;

drop trigger if exists on_auth_user_created_account_profile on auth.users;
create trigger on_auth_user_created_account_profile
  after insert on auth.users
  for each row execute procedure public.create_account_profile_for_auth_user();

create or replace function public.complete_first_login_password()
returns boolean
language plpgsql
security definer
set search_path = ''
as $$
declare
  affected_rows integer;
begin
  update public.account_profiles
  set must_change_password = false
  where user_id = (select auth.uid())
    and status = 'active'
    and must_change_password = true;

  get diagnostics affected_rows = row_count;
  return affected_rows = 1;
end;
$$;

revoke all on function public.complete_first_login_password() from public;
grant execute on function public.complete_first_login_password() to authenticated;