# TEAM-LIQUID-PH

## Authentication setup

1. Copy `.env.example` to `.env.local` and set the Supabase project URL, anon key, and canonical app URL (`NEXT_PUBLIC_SITE_URL`).
2. Apply `supabase/migrations/20261104000000_account_profiles.sql` in the Supabase SQL Editor (or with the Supabase CLI).
3. Existing Auth users are created as active accounts that must set a new password on first login. New Auth users receive the same profile defaults automatically.

Supabase Auth stores and hashes passwords. The app does not store password hashes. Session cookies are refreshed by Next.js middleware. Sign-in checks the profile status, and both authenticated routes check it again on every request.

To block an account, run this as an administrator in the Supabase SQL Editor:

```sql
update public.account_profiles
set status = 'blocked'
where user_id = 'AUTH_USER_UUID';
```

Set `status` back to `active` to restore access. A blocked user's next sign-in is rejected and any existing session is signed out when they next open a protected route.

For password recovery, allow the callback URL (for example, `http://localhost:3000/auth/callback`) in Supabase Auth's redirect URL configuration.