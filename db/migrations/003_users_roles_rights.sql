create table role (
  id bigint generated always as identity primary key,
  name text unique not null,
  is_deleted boolean not null default false,
  stamp varchar(60)
);

create table module (
  id bigint generated always as identity primary key,
  name text unique not null,
  is_deleted boolean not null default false,
  stamp varchar(60)
);

create table app_right (
  id bigint generated always as identity primary key,
  module_id bigint not null references module(id),
  code text unique not null,
  description text,
  is_deleted boolean not null default false,
  stamp varchar(60)
);

create table app_user (
  id bigint generated always as identity primary key,
  username text unique not null,
  password_hash text not null,
  role_id bigint not null references role(id),
  is_blocked boolean not null default false,
  is_deleted boolean not null default false,
  stamp varchar(60)
);

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

alter table role enable row level security;
alter table module enable row level security;
alter table app_right enable row level security;
alter table app_user enable row level security;
alter table role_right enable row level security;
alter table user_right enable row level security;
