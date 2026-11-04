# Sprint 1 Test Plan and Acceptance Criteria

**Project:** Hope, Inc. ERP  
**Sprint:** Sprint 1 (Weeks 1-2)  
**Test owner:** Tester  
**Scope:** Authentication, Core System Setup, User Management, and Role Rights Matrix

## 1. Test Objectives

- Verify secure sign-in, session handling, logout, and first-login password setup.
- Verify active and blocked account states.
- Verify all 36 rights across Super Admin, Admin, and Standard User roles.
- Verify UI controls and server/API authorization are consistent.
- Verify migrations, RLS, and audit logging are safe and reproducible.
- Verify unauthenticated and unauthorized users cannot access protected resources.

## 2. Scope

### In Scope

Login/logout, validation, first-login password setup, role and rights matrix, account-profile migration, RLS, audit changes, protected routes, and desktop/mobile smoke tests.

### Out of Scope

HR, Sales, CRM, Product modules, later-sprint reporting, third-party identity providers, and transaction audit areas outside Sprint 1.

## 3. Entry and Exit Criteria

### Entry Criteria

- Supabase local or test project is available and migrations are ready.
- Test users exist for Super Admin, Admin, Standard User, blocked, first-login, and missing-profile states.
- `npm run build` passes.

### Exit Criteria

- All Critical and High cases pass.
- No unresolved Blocker or Critical security defect remains.
- Implemented acceptance criteria are signed off with evidence.
- Deferred criteria have owners and linked follow-up issues.

## 4. Acceptance Criteria

### USER-STORY-01: User Authentication & Session

- AC-01: Blank, malformed, or invalid email/password inputs show actionable validation.
- AC-02: Invalid credentials return a generic error that does not reveal whether an account exists.
- AC-03: Valid credentials for an active account create a Supabase session and redirect to `/dashboard`.
- AC-04: An active account with `must_change_password=true` redirects to `/set-password` before dashboard access.
- AC-05: Password setup requires at least 8 characters, matching confirmation, and a successful update.
- AC-06: A blocked account is signed out with the blocked-account message.
- AC-07: A missing or inaccessible profile is treated as access failure and the user is signed out.
- AC-08: Unauthenticated users cannot access `/dashboard` or `/set-password`.

### USER-STORY-02: Role & 36 Per-Action Rights Matrix

- AC-09: The matrix contains 36 rights: Create, Read, Update, and Delete for the approved Sprint 1 module areas.
- AC-10: Super Admin, Admin, and Standard User are available as default roles.
- AC-11: The matrix displays and saves each role's current rights.
- AC-12: Revoking a right immediately prevents the matching UI action and server/API action.
- AC-13: Unauthenticated rights read/update requests are denied.
- AC-14: A Standard User cannot modify role assignments or rights.

> Implementation status: matrix UI, database schema, and authorization checks must be confirmed before sign-off.

### USER-STORY-03: Database Migration & Audit Trail Setup

- AC-15: Migrations complete on a clean database without foreign-key or dependency errors.
- AC-16: Re-running migrations is safe and does not duplicate data or policies.
- AC-17: `account_profiles` enables RLS; users can select only their own profile.
- AC-18: Users cannot directly insert, update, or delete profiles outside approved functions.
- AC-19: Creating an auth user automatically creates an `account_profiles` row.
- AC-20: Audit records contain actor user ID, action, timestamp, and changed record details.
- AC-21: Audit records cannot be modified or deleted through ordinary application database roles.

> Implementation status: AC-15 through AC-19 are addressed by the account-profile migration. AC-20 and AC-21 require audit-table implementation that is not yet present.

## 5. Test Cases

| ID | Story | Priority | Procedure and Expected Result |
|---|---|---|---|
| TC-01 | US-01 | High | Submit blank or malformed login fields. Submission is blocked with required-field validation. |
| TC-02 | US-01 | Critical | Submit wrong credentials. Generic sign-in error appears; no session or account-specific detail exists. |
| TC-03 | US-01 | Critical | Sign in with an active account. Session is created and `/dashboard` opens. |
| TC-04 | US-01 | High | Sign in with `must_change_password=true`. `/set-password` opens instead of `/dashboard`. |
| TC-05 | US-01 | High | Enter a 7-character password and matching confirmation. Update is blocked. |
| TC-06 | US-01 | High | Enter valid matching passwords. Password updates; first-login flag becomes false; dashboard opens. |
| TC-07 | US-01 | High | Sign in as a blocked account. User is signed out and the blocked-account message appears. |
| TC-08 | US-01 | High | Use valid auth with no accessible profile. User is signed out and profile-access error appears. |
| TC-09 | US-01 | High | Sign out. Session is cleared and protected routes are inaccessible. |
| TC-10 | US-01 | Critical | Directly visit protected routes without a session. Access is denied or redirected to login. |
| TC-11 | US-02 | Critical | Sign in as Super Admin. Matrix displays all 36 rights for three roles. |
| TC-12 | US-02 | High | Toggle and save an Admin Create right. Refresh preserves the change and UI behavior matches it. |
| TC-13 | US-02 | Critical | Revoke a Standard User Delete right. Delete controls are hidden/disabled and direct API requests fail. |
| TC-14 | US-02 | Critical | Call rights endpoints without authentication. Requests are unauthorized. |
| TC-15 | US-02 | Critical | Log in as Standard User and attempt role/right updates. UI and API both deny the request. |
| TC-16 | US-03 | Critical | Apply migrations to a clean test database. Migration completes with no errors and required objects exist. |
| TC-17 | US-03 | High | Re-run migrations. No duplicate policies, profiles, or data are created. |
| TC-18 | US-03 | Critical | Use two authenticated users to query profiles. User A can read only the A profile. |
| TC-19 | US-03 | High | Attempt direct profile insert/update/delete. Ordinary permissions reject the operation. |
| TC-20 | US-03 | Critical | Create a new auth user. A matching `account_profiles` row is automatically created. |
| TC-21 | US-03 | Critical | Change an audited role/right. Audit row includes actor, action, timestamp, and record details. |
| TC-22 | US-03 | High | Attempt to update/delete an audit row using application database roles. Operation is denied. |

## 6. Security and Edge Testing

- Session cookies must be HTTP-only and Secure in production.
- RLS is enabled for every user-facing table.
- Direct API and RPC calls enforce the same authorization as UI controls.
- Role checks run on the server; UI visibility is not sufficient authorization.
- Test blocked, deleted, expired-session, inactive-profile, and missing-profile states.
- Passwords and profile data must not appear in URLs, logs, or generic error responses.

## 7. Test Data

Maintain separate synthetic accounts for Super Admin, Admin, Standard User, blocked account, first-login account, no-profile account, and cross-user isolation testing.

## 8. Defect Severity

| Severity | Definition | Sign-off Impact |
|---|---|---|
| Blocker | Prevents authentication, migration, or database safety testing | Cannot exit sprint |
| Critical | Unauthorized access, session bypass, or data exposure | Cannot exit sprint |
| High | Core acceptance criterion fails | Resolve or obtain Product Owner exception |
| Medium | Non-core usability issue | Track for follow-up |
| Low | Cosmetic or non-blocking issue | Track in backlog |

## 9. Evidence and Sign-off

Record test ID, build/commit, environment, migration version, result, screenshot or log evidence, tester, date, and linked defect for each execution.

Sprint sign-off requires Tester, Developer, DB Admin, and Scrum Master review of acceptance-criteria status.
