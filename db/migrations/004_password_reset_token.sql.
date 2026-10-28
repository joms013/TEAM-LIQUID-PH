create table password_reset_token (
  id bigint generated always as identity primary key,
  user_id bigint not null references app_user(id),
  token_hash text not null,
  expires_at timestamptz not null,
  used boolean not null default false,
  created_at timestamptz not null default now()
);

alter table password_reset_token enable row level security; 
