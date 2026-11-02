# Database Setup

PostgreSQL database for Hope, Inc. ERP, hosted on Supabase. No Docker needed. It contains the business schema, sample data, row-level security (RLS) setup, and role-based access-control seed data.

## 1. Create the Supabase project

1. Sign in at https://supabase.com and click **New project**.
2. Name it `hope-db` and choose a region close to you
3. Set a strong database password and keep it in a password manager.
   **Never put the password, connection string or API keys in this repo.**

## 2. Apply the SQL files

Open the Supabase **SQL Editor** and run these files one at a time, in order. If a popup appears, choose **Run without RLS**.

1. `migrations/002_hope_base.sql` creates the business tables, audit log and soft delete, and inserts sample data.
2. `migrations/002b_enable_rls.sql` enables RLS on the business tables and makes the active views use caller permissions.
3. `migrations/003_users_roles_rights.sql` creates the role, module, right, app-user and rights tables.
4. `migrations/004_password_reset_token.sql` creates the custom password-reset token table.
5. `seed/005_seed.sql` inserts 3 roles, 5 modules, 36 rights and the role-right grants.

Run each script once and wait for it to finish before the next. The seed script is transactional and uses conflict handling, so it can be rerun safely.

## 3. Superadmin accounts

Passwords are **never** stored in this repo. Each team member creates their own account directly in Supabase, with screen sharing off. The method (Supabase Auth or `app_user.password_hash`) is to be confirmed with the team.

## Important cautions

- `002_hope_base.sql` drops and recreates the business tables and deletes their data. Use it only on a fresh or disposable database, never as a production upgrade.
- RLS being enabled does not grant access. The provided scripts define no policies, so add and test policies for each table before using the API from a client.
- `app_user.password_hash` is a separate application table and is not linked to Supabase Auth's `auth.users`. Define an explicit user-to-role mapping before enforcing roles.
- `password_reset_token` is a custom table. Supabase Auth has its own recovery flow, which does not use this table unless extra logic is written.
- The seed grants every right to `superadmin` and `admin`; `user` receives none. Do not assign elevated roles to untrusted signups.

## 4. Verify

```sql
select count(*) from employee;     -- 32
select count(*) from role;         -- 3
select count(*) from module;       -- 5
select count(*) from app_right;    -- 36
select count(*) from role_right;   -- 72

select r.name, count(rr.right_id) as granted_right_count
from role r
left join role_right rr on rr.role_id = r.id
group by r.name
order by r.name;
```

Expected: `admin` 36, `superadmin` 36, `user` 0.

## Audit logging

The application sets the acting user for each request:

```sql
select set_config('app.username', 'someone', true);
```

`audit_user()` records it in `audit_log`. If it is not set, the database login name is used.

Run `tests/audit_user_test.sql` after applying `002_hope_base.sql` to verify that the configured user is written to `audit_log.action_by`. The test rolls back its changes.

## Soft delete

Rows are not removed. Set `is_deleted = true`. The `*_active` views show only rows that are not deleted.

## Troubleshooting

- **`relation "..." already exists`**: that file was already run. Skip it.
- **`relation "jobHistory" does not exist`**: use **Run without RLS** on the base file, then run `002b_enable_rls.sql`.
- **Tables show UNRESTRICTED in the Table Editor**: run `002b_enable_rls.sql`.