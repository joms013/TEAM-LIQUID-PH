Team setup guide for the HOPE ERP application and its Supabase database.

## Current status

The app is built with Next.js, React, and Tailwind CSS. Supabase is the planned authentication and database service, but the Supabase client, environment configuration, and database migrations have not been added yet. Do not expect database-backed features to work until those pieces are implemented.

## Prerequisites

- Git and Node.js (LTS)
- A GitHub account with access to this repository
- A Supabase account and project for database work
- Visual Studio Code with GitHub Copilot Chat installed (optional, for the team agents)

## Get the application running

1. Clone the repository and enter its folder:

	```powershell
	git clone <repository-url>
	cd TEAM-LIQUID-PH
	```

2. Install dependencies and start the development server:

	```powershell
	npm install
	npm run dev
	```

3. Open the local URL printed by Next.js, usually `http://localhost:3000`.

## Team database setup

1. Create a Supabase project for development. Keep production and development projects separate.
2. In the Supabase dashboard, copy the project URL and publishable/anon key into a local `.env.local` file when Supabase integration is added. Never commit `.env.local`, service-role keys, database passwords, or other secrets.
3. Database changes should be written as ordered SQL migrations under `db/migrations/` and reviewed by the team before they are applied. That directory is currently empty; there is not yet a schema to apply.
4. Enable Row Level Security (RLS) on every table containing application data. Add and test policies for each access role; never rely on hiding UI controls as authorization.
5. Apply migrations to a development project first, verify the intended access rules, then promote reviewed changes to production using the team's approved deployment process.

### Roles and development accounts

The intended application roles are `superadmin`, `admin`, and `user`. A `superadmin` default is for isolated development/testing only. Do not grant every production signup administrative privileges. Production role assignment must be controlled and validated on the server/database, with least-privilege RLS policies.

## Branch and pull request workflow

Create a feature branch for each task. Do not commit directly to `main`.

```powershell
git checkout -b setup/initial-project-structure
```

Commit and push your branch, then open a pull request:

```powershell
git add .
git commit -m "chore: document team database setup"
git push -u origin setup/initial-project-structure
```

Use a descriptive branch name for later tasks. Keep `.env.local` and other credentials out of commits.

## Copilot team configuration

Project-wide Copilot guidance lives in `.github/copilot-instructions.md`. Put shared role agents in `.github/agents/`, for example `db-admin.agent.md`, `dev.agent.md`, `scrum-master.agent.md`, `tester.agent.md`, and `ui-ux.agent.md`. Check that each agent filename matches the role it describes before committing; the UI/UX agent should not be named `tester.agent.md`.

## Before shipping database changes

- Confirm migrations apply cleanly to a fresh development database.
- Test allowed and denied access for each role, including unauthenticated access.
- Verify RLS is enabled and no policy exposes another user's data.
- Confirm no secrets or local environment files are staged.