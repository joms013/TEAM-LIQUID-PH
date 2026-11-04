# TEAM-LIQUID-PH

## Authentication setup

1. Copy `.env.example` to `.env.local` and set the Supabase project URL, anon key, and canonical app URL (`NEXT_PUBLIC_SITE_URL`).
2. Set `SUPABASE_SERVICE_ROLE_KEY` in `.env.local` from the Supabase project's API settings. Keep this key server-only; never expose or commit it.
3. Apply `supabase/migrations/20261104000000_account_profiles.sql` and `supabase/migrations/20261104100000_user_management.sql` in the Supabase SQL Editor (or with the Supabase CLI).
4. Existing Auth users are created as active user accounts that must set a new password on first login. New invited accounts receive the same profile defaults automatically.

To grant initial administrator access, run this once as a trusted database owner and replace the email:

```sql
update public.account_profiles as profile
set role = 'superadmin'
from auth.users as auth_user
where profile.user_id = auth_user.id
  and lower(auth_user.email) = lower('owner@example.com');
```

Admins can manage standard user accounts only; superadmin records are filtered on the server and never sent to admin screens. Superadmins can manage all roles. Users can be invited by email, and Supabase Auth sends the invitation so each person can set their own password.

Supabase Auth stores and hashes passwords. The app does not store password hashes. Session cookies are refreshed by Next.js middleware. Sign-in checks the profile status, and both authenticated routes check it again on every request.

To block an account, run this as an administrator in the Supabase SQL Editor:

```sql
update public.account_profiles
set status = 'blocked'
where user_id = 'AUTH_USER_UUID';
```

Set `status` back to `active` to restore access. A blocked user's next sign-in is rejected and any existing session is signed out when they next open a protected route.

For password recovery, allow the callback URL (for example, `http://localhost:3000/auth/callback`) in Supabase Auth's redirect URL configuration.