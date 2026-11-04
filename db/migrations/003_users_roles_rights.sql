-- 003_users_roles_rights.sql
-- Users, roles, modules and rights (Student Guide §2.4, §3.8). Uses Supabase Auth for login.

create table role (
  id bigint generated always as identity primary key,
  name text unique not null,
  is_deleted boolean not null default false,
  stamp varchar(80)
);

create table module (
  id bigint generated always as identity primary key,
  name text unique not null,
  is_deleted boolean not null default false,
  stamp varchar(80)
);

create table app_right (
  id bigint generated always as identity primary key,
  module_id bigint not null references module(id),
  code text unique not null,
  description text,
  is_deleted boolean not null default false,
  stamp varchar(80)
);

create table app_user (
  id bigint generated always as identity primary key,
  auth_id uuid unique references auth.users(id) on delete cascade,  -- Supabase Auth account (password lives there)
  username text unique,                                             -- optional; login uses email
  first_name text,
  last_name text,
  email text,
  password_hash text,                                               -- unused with Supabase Auth; kept optional
  role_id bigint not null references role(id),
  status text not null default 'pending'
    check (status in ('pending','active','blocked','disapproved')),
  is_blocked boolean not null default false,
  is_deleted boolean not null default false,
  stamp varchar(80)
);
create unique index app_user_email_key on app_user (lower(email));

create table role_right (
  role_id bigint references role(id),
  right_id bigint references app_right(id),
  primary key (role_id, right_id)
);

create table user_right (
  user_id bigint references app_user(id),
  right_id bigint references app_right(id),
  granted boolean not null default true,
  primary key (user_id, right_id)
);

create index app_right_module_idx on app_right (module_id);
create index app_user_role_idx    on app_user (role_id);
create index role_right_right_idx on role_right (right_id);
create index user_right_right_idx on user_right (right_id);

alter table role enable row level security;
alter table module enable row level security;
alter table app_right enable row level security;
alter table app_user enable row level security;
alter table role_right enable row level security;
alter table user_right enable row level security;