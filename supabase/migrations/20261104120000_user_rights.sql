create table if not exists public.permission_modules (
  id bigint generated always as identity primary key,
  key text not null unique,
  name text not null unique,
  sort_order integer not null unique
);

create table if not exists public.permission_actions (
  id bigint generated always as identity primary key,
  module_id bigint not null references public.permission_modules(id) on delete cascade,
  code text not null unique,
  label text not null,
  sort_order integer not null,
  unique (module_id, sort_order)
);

create table if not exists public.user_permissions (
  user_id uuid not null references auth.users(id) on delete cascade,
  permission_id bigint not null references public.permission_actions(id) on delete cascade,
  created_at timestamptz not null default now(),
  primary key (user_id, permission_id)
);

create table if not exists public.audit_log (
  audit_id bigint generated always as identity primary key,
  table_name varchar(30) not null,
  action varchar(7) not null check (action in ('ADD', 'EDIT', 'DELETE', 'RESTORE')),
  record_key varchar(60),
  old_values jsonb,
  new_values jsonb,
  action_by varchar(50) not null,
  action_at timestamptz not null default now()
);

insert into public.permission_modules (key, name, sort_order)
values
  ('customer', 'Customer', 1),
  ('product', 'Product', 2),
  ('human_resources', 'Human Resources', 3),
  ('sales', 'Sales', 4),
  ('reports', 'Reports', 5)
on conflict (key) do update
set name = excluded.name, sort_order = excluded.sort_order;

insert into public.permission_actions (module_id, code, label, sort_order)
values
  ((select id from public.permission_modules where key = 'customer'), 'customer_add', 'Add Customer', 1),
  ((select id from public.permission_modules where key = 'customer'), 'customer_edit', 'Edit Customer', 2),
  ((select id from public.permission_modules where key = 'customer'), 'customer_delete', 'Delete Customer', 3),

  ((select id from public.permission_modules where key = 'product'), 'product_add', 'Add Product', 1),
  ((select id from public.permission_modules where key = 'product'), 'product_edit', 'Edit Product', 2),
  ((select id from public.permission_modules where key = 'product'), 'product_delete', 'Delete Product', 3),
  ((select id from public.permission_modules where key = 'product'), 'price_add', 'Add Price', 4),
  ((select id from public.permission_modules where key = 'product'), 'price_edit', 'Edit Price', 5),
  ((select id from public.permission_modules where key = 'product'), 'price_delete', 'Delete Price', 6),

  ((select id from public.permission_modules where key = 'human_resources'), 'job_add', 'Add Job', 1),
  ((select id from public.permission_modules where key = 'human_resources'), 'job_edit', 'Edit Job', 2),
  ((select id from public.permission_modules where key = 'human_resources'), 'job_delete', 'Delete Job', 3),
  ((select id from public.permission_modules where key = 'human_resources'), 'department_add', 'Add Department', 4),
  ((select id from public.permission_modules where key = 'human_resources'), 'department_edit', 'Edit Department', 5),
  ((select id from public.permission_modules where key = 'human_resources'), 'department_delete', 'Delete Department', 6),
  ((select id from public.permission_modules where key = 'human_resources'), 'employee_add', 'Add Employee', 7),
  ((select id from public.permission_modules where key = 'human_resources'), 'employee_edit', 'Edit Employee', 8),
  ((select id from public.permission_modules where key = 'human_resources'), 'employee_delete', 'Delete Employee', 9),
  ((select id from public.permission_modules where key = 'human_resources'), 'job_history_view', 'View Job History', 10),
  ((select id from public.permission_modules where key = 'human_resources'), 'job_history_add', 'Add Job History', 11),
  ((select id from public.permission_modules where key = 'human_resources'), 'job_history_edit', 'Edit Job History', 12),
  ((select id from public.permission_modules where key = 'human_resources'), 'job_history_delete', 'Delete Job History', 13),

  ((select id from public.permission_modules where key = 'sales'), 'sale_add', 'Add Sale', 1),
  ((select id from public.permission_modules where key = 'sales'), 'sale_edit', 'Edit Sale', 2),
  ((select id from public.permission_modules where key = 'sales'), 'sale_delete', 'Delete Sale', 3),
  ((select id from public.permission_modules where key = 'sales'), 'sale_detail_view', 'View Sale Detail', 4),
  ((select id from public.permission_modules where key = 'sales'), 'sale_detail_add', 'Add Sale Detail', 5),
  ((select id from public.permission_modules where key = 'sales'), 'sale_detail_edit', 'Edit Sale Detail', 6),
  ((select id from public.permission_modules where key = 'sales'), 'sale_detail_delete', 'Delete Sale Detail', 7),

  ((select id from public.permission_modules where key = 'reports'), 'report_top_customers', 'Top Customers', 1),
  ((select id from public.permission_modules where key = 'reports'), 'report_product_master_list', 'Product Master List', 2),
  ((select id from public.permission_modules where key = 'reports'), 'report_top_products', 'Top Products', 3),
  ((select id from public.permission_modules where key = 'reports'), 'report_active_employees', 'Active Employees', 4),
  ((select id from public.permission_modules where key = 'reports'), 'report_all_employees', 'All Employees', 5),
  ((select id from public.permission_modules where key = 'reports'), 'report_employee_job_history', 'Employee Job History', 6),
  ((select id from public.permission_modules where key = 'reports'), 'report_top_sales', 'Top Sales', 7)
on conflict (code) do update
set module_id = excluded.module_id,
    label = excluded.label,
    sort_order = excluded.sort_order;

do $$
begin
  if (select count(*) from public.permission_modules) <> 5
    or (select count(*) from public.permission_actions) <> 36 then
    raise exception 'The rights catalog must contain 5 modules and 36 actions.';
  end if;
end;
$$;

alter table public.permission_modules enable row level security;
alter table public.permission_actions enable row level security;
alter table public.user_permissions enable row level security;
alter table public.audit_log enable row level security;

revoke all on public.permission_modules, public.permission_actions,
  public.user_permissions, public.audit_log from public, anon, authenticated, service_role;
grant select on public.permission_modules, public.permission_actions,
  public.user_permissions to service_role;

create or replace function public.replace_user_permissions(
  p_user_id uuid,
  p_permission_codes text[],
  p_actor_id uuid
)
returns void
language plpgsql
security definer
set search_path = ''
as $$
declare
  v_actor_role text;
  v_target_role text;
  v_codes text[];
  v_previous_codes text[];
begin
  select role
  into v_actor_role
  from public.account_profiles
  where user_id = p_actor_id
    and status = 'active'
    and must_change_password = false;

  if not found or v_actor_role not in ('admin', 'superadmin') then
    raise exception 'You do not have permission to manage user rights.';
  end if;

  select role
  into v_target_role
  from public.account_profiles
  where user_id = p_user_id;

  if not found then
    raise exception 'The selected user account does not exist.';
  end if;
  if p_actor_id = p_user_id then
    raise exception 'You cannot change your own rights.';
  end if;
  if v_actor_role = 'admin' and v_target_role <> 'user' then
    raise exception 'Admins can manage rights for user accounts only.';
  end if;

  select coalesce(
    pg_catalog.array_agg(distinct requested.code order by requested.code),
    array[]::text[]
  )
  into v_codes
  from pg_catalog.unnest(coalesce(p_permission_codes, array[]::text[])) as requested(code);

  if exists (
    select 1
    from pg_catalog.unnest(v_codes) as requested(code)
    left join public.permission_actions as action on action.code = requested.code
    where action.id is null
  ) then
    raise exception 'One or more selected rights are invalid.';
  end if;

  select coalesce(pg_catalog.array_agg(action.code order by action.code), array[]::text[])
  into v_previous_codes
  from public.user_permissions as permission
  join public.permission_actions as action on action.id = permission.permission_id
  where permission.user_id = p_user_id;

  if v_previous_codes = v_codes then
    return;
  end if;

  delete from public.user_permissions
  where user_id = p_user_id;

  insert into public.user_permissions (user_id, permission_id)
  select p_user_id, action.id
  from public.permission_actions as action
  where action.code = any(v_codes);

  insert into public.audit_log (
    table_name, action, record_key, old_values, new_values, action_by
  )
  values (
    'user_permissions',
    'EDIT',
    p_user_id::text,
    pg_catalog.jsonb_build_object('permissions', v_previous_codes),
    pg_catalog.jsonb_build_object('permissions', v_codes),
    p_actor_id::text
  );
end;
$$;

revoke all on function public.replace_user_permissions(uuid, text[], uuid)
  from public, anon, authenticated;
grant execute on function public.replace_user_permissions(uuid, text[], uuid)
  to service_role;
