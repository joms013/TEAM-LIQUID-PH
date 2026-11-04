-- 004_password_reset_token.sql
-- Expiring, single-use password reset tokens (Student Guide §3.1, §4.2).
-- Only the hash of the token is stored, never the token itself.

create table password_reset_token (
  id bigint generated always as identity primary key,
  user_id bigint not null references app_user(id) on delete cascade,
  token_hash text not null unique,
  expires_at timestamptz not null,
  used boolean not null default false,
  created_at timestamptz not null default now(),
  check (expires_at > created_at)
);

create index password_reset_token_user_idx on password_reset_token (user_id);

alter table password_reset_token enable row level security; 