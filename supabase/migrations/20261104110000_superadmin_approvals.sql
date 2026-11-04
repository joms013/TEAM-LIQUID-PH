alter table public.account_profiles
  alter column status set default 'pending';

alter table public.account_profiles
  drop constraint if exists account_profiles_status_check;

alter table public.account_profiles
  add constraint account_profiles_status_check
  check (status in ('pending', 'active', 'blocked'));

create or replace function public.protect_last_active_superadmin()
returns trigger
language plpgsql
security definer
set search_path = ''
as $$
declare
  superadmin_count bigint;
  active_superadmin_count bigint;
begin
  if tg_op = 'DELETE' then
    if old.role = 'superadmin' then
      perform pg_catalog.pg_advisory_xact_lock(6060606::bigint);
      select count(*)
      into superadmin_count
      from public.account_profiles
      where role = 'superadmin';

      if superadmin_count <= 1 then
        raise exception using
          errcode = '23514',
          message = 'At least one superadmin must remain.';
      end if;

      if old.status = 'active' then
        select count(*)
        into active_superadmin_count
        from public.account_profiles
        where role = 'superadmin'
          and status = 'active';

        if active_superadmin_count <= 1 then
          raise exception using
            errcode = '23514',
            message = 'At least one active superadmin must remain.';
        end if;
      end if;
    end if;
    return old;
  end if;

  if old.role = 'superadmin'
    and (new.role <> 'superadmin' or (old.status = 'active' and new.status <> 'active'))
  then
    perform pg_catalog.pg_advisory_xact_lock(6060606::bigint);
    if new.role <> 'superadmin' then
      select count(*)
      into superadmin_count
      from public.account_profiles
      where role = 'superadmin';

      if superadmin_count <= 1 then
        raise exception using
          errcode = '23514',
          message = 'At least one superadmin must remain.';
      end if;
    end if;

    if old.status = 'active' and new.status <> 'active' then
      select count(*)
      into active_superadmin_count
      from public.account_profiles
      where role = 'superadmin'
        and status = 'active';

      if active_superadmin_count <= 1 then
        raise exception using
          errcode = '23514',
          message = 'At least one active superadmin must remain.';
      end if;
    end if;
  end if;
  return new;
end;
$$;

revoke all on function public.protect_last_active_superadmin() from public, anon, authenticated;

drop trigger if exists protect_last_active_superadmin on public.account_profiles;
create trigger protect_last_active_superadmin
  before update of role, status or delete on public.account_profiles
  for each row execute procedure public.protect_last_active_superadmin();
