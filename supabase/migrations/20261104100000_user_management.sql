alter table public.account_profiles
  add column if not exists role text not null default 'user';

do $$
begin
  if not exists (
    select 1
    from pg_constraint
    where conname = 'account_profiles_role_check'
      and conrelid = 'public.account_profiles'::regclass
  ) then
    alter table public.account_profiles
      add constraint account_profiles_role_check
      check (role in ('superadmin', 'admin', 'user'));
  end if;
end;
$$;

create index if not exists account_profiles_role_idx
  on public.account_profiles (role);
