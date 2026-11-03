# Database setup (Supabase, no Docker)

The HOPE ERP database runs on Supabase (PostgreSQL). Each team member sets up their own free development project. Docker is not needed.

## Folder layout

| Folder | What it holds |
|---|---|
| `db/migrations/` | Ordered SQL files and `run_migrations.sh` |
| `db/seed/` | Starting data (roles, modules, rights) |
| `db/tests/` | Checks you run by hand |

## What you need

- A free [Supabase](https://supabase.com) account
- `psql`, the PostgreSQL command-line client
- Windows only: Git Bash or WSL, to run the `.sh` script

## Student setup

1. **Create a project.** In Supabase, click **New project**. Choose a database password and keep it private. Never put it in the repo.
2. **Get the connection string.** Click **Connect**, choose **Session pooler**, and copy the URI. Replace `[YOUR-PASSWORD]` with your password.
3. **Set it in your terminal**, not in a file:
   ```bash
   export SUPABASE_DB_URL="postgresql://postgres.xxxx:YOUR-PASSWORD@aws-0-xxxx.pooler.supabase.com:5432/postgres"
   ```
4. **Run the migrations and seed** from the repo root:
   ```bash
   bash db/migrations/run_migrations.sh --include-seed
   ```
   Leave out `--include-seed` to build the tables without the starting data.
5. **Check it worked.** Run this in the Supabase SQL Editor, once the migration and seed tasks are merged:
   ```sql
   select
     (select count(*) from role)       as roles,        -- expect 3
     (select count(*) from module)     as modules,      -- expect 5
     (select count(*) from app_right)  as rights,       -- expect 36
     (select count(*) from role_right) as role_rights;  -- expect 72
   ```

## How the runner works

- It applies every `.sql` file in `db/migrations/` in name order. With `--include-seed` it then applies the files in `db/seed/`.
- It records each applied file and its checksum in the `schema_migrations` table.
- Running it again prints `Already applied` for each file and changes nothing.
- If an applied file was edited, it stops with an error.
- It refuses to run on a database that already has the ERP tables but no history. Use a new, empty project.

## Rules

- Never edit a migration that has already been applied. Add a new numbered file instead.
- Never commit passwords, connection strings or keys.
- Run the script only on a new, empty development database.
- Superadmin accounts are created through Supabase Auth, and each person sets their own password. No passwords are stored in this repo.

## Troubleshooting

| Message | What to do |
|---|---|
| `psql is required` | Install the PostgreSQL command-line tools and reopen the terminal. |
| `Set SUPABASE_DB_URL in your shell` | Run the `export` command from step 3 in the same terminal. |
| `ERP tables exist but migration history is missing` | This database was set up by hand. Create a new empty project. |
| `applied migration changed` | A file that was already applied was edited. Undo the edit and add a new numbered file. |
| `no SQL files found` | Run the script from the repo root and check that `db/migrations/` has `.sql` files. |
| Connection timeout or `could not translate host name` | Use the **Session pooler** string, not the direct connection. |