# Hope ERP Design Handoff

## Scope

`hope-erp.html` is the high-fidelity, responsive implementation for authentication, the ERP overview, user management, and module rights. This note records the design system and the interaction contract for implementation and review. The review below is a heuristic review of the built screens, not moderated user research.

## Design System

### Color

| Token | Value | Use |
| --- | --- | --- |
| Canvas | `#F3F6FC` | Application background |
| Surface | `#FFFFFF` | Forms, tables, dialogs, sidebar |
| Primary | `#2463C4` | Main action, active navigation, focus |
| Primary strong | `#184B9E` | Hover states, selected secondary navigation |
| Deep blue | `#143460` | Intro overlay, toast |
| Text | `#17263D` | Main copy and headings |
| Muted | `#62728A` | Supporting copy, table labels |
| Border | `#DBE4F0` | Input, table, and component boundaries |
| Blue tint | `#EAF1FB` | Selected chips, icons, soft states |
| Coral | `#D77D62` | Secondary visual accent |
| Success | `#16745A` | Successful status and confirmation |
| Warning | `#9B650C` | Pending status |
| Error | `#B54740` | Validation and blocked states |

Keep text contrast readable on each status surface. Do not use color as the only status signal; retain the status text in the control.

The Hope mark is an `H` in a blue rounded-square badge. The `TEAM LIQUID PH` tag sits under the product name. The fixed moon/sun control switches light and dark themes and persists the selection in local storage (`hope_theme`).

### Typography

- UI and body: DM Sans, 14-15px default; use 12-13px only for metadata and table labels.
- Display headings: Newsreader, 34-66px depending on the sign-in or page heading context.
- Use sentence case for titles and action labels. Use tabular numerals for money and counts.

### Layout And Components

- Spacing follows a 4px base; common gaps are 8, 12, 16, 24, and 32px.
- Controls have a minimum 42-44px hit area; use 4-8px corner radii.
- Primary buttons are solid blue; secondary actions are white with a border; destructive actions use red text and require confirmation where data is affected.
- Inputs have persistent labels, a visible focus ring, and inline validation/status messaging.
- Tables remain semantic and scroll horizontally on narrow screens rather than compressing columns into unreadable text.
- Status selectors use distinct surface/text colors for active, pending, and blocked states, plus visible status labels.
- Dialogs use a clear title, concise description, explicit save/cancel actions, keyboard dismissal, and a visible focus state.
- Respect `prefers-reduced-motion`; do not rely on animation to communicate state.

## Wireframes

### Login / Register

```text
Desktop: two-column workspace
+-------------------------------+-------------------------+
| Hope brand                    | Account state heading  |
| Purpose statement             | Sign in | Register     |
| Module summary                | Labeled email           |
|                               | Labeled password        |
|                               | Forgot password         |
|                               | Primary action          |
+-------------------------------+-------------------------+

Mobile: intro panel, then full-width account form
```

Register uses the same form position and layout, with name, work email, password guidance, and an approval notice after submission.

### Reset / Set Password

```text
+-----------------------------------+
| Reset your password               |
| Work email                        |
| Send reset link                   |
| Back to sign in                   |
+-----------------------------------+

Recovery link -> Set a new password -> Save -> Return to app
```

### Main Page / Overview

```text
+---------------+------------------------------------------+
| Brand         | Page title and short context             |
| Overview      | KPI tiles: customers / products / people  |
| Customers     |            / sales                       |
| Products      | Recent sales table                       |
| HR            |                                          |
| Sales         |                                          |
| Reports       |                                          |
| User profile  |                                          |
+---------------+------------------------------------------+
```

On mobile, navigation becomes a dismissible drawer and the content uses the available width.

### User Management

```text
+----------------------------------------------------------+
| User management                         Search users     |
| All (n) | Pending (n) | Active (n) | Blocked (n)          |
| User / email | Role | Status | Modules | Actions         |
| ...                                                      |
+----------------------------------------------------------+
```

The table can scroll horizontally on small screens. Row actions expose rights, approve/reject, block, or reactivate according to role and status.

### Rights Dialog

```text
+----------------------------------------------+
| Module access: {person}                      |
| Select the modules this person may open.     |
| [ ] Customers   [ ] Products   [ ] HR        |
| [ ] Sales       [ ] Reports                  |
|                         Cancel   Save access |
+----------------------------------------------+
```

## Hi-Fi Screen Notes

- **Login:** Photo-led blue intro balances the white form surface. The account heading and supporting text stay outside the form fields, and the password visibility control remains available.
- **Register:** Shares the login shell; adds full name and an 8-character password minimum. Successful submission explains the administrator approval step.
- **Reset/set password:** Uses a focused recovery heading and only the fields needed for that step. The sign-in/register tabs are hidden during recovery to avoid implying unrelated navigation.
- **Main page:** White sidebar and content surfaces sit on a soft blue canvas. KPI tiles link directly to their modules; recent sales remain a readable table.
- **User management:** Filters, search, role, status, module count, and row actions retain consistent spacing and blue focus/selection states. Status colors have text labels.
- **Rights dialog:** Identifies the person in the title, explains the permission consequence, gives each module a labeled checkbox, and focuses the first checkbox on open.

## Developer Handoff

- Keep `hope-erp.html` self-contained; the current storage/auth adapters and screen routing are independent of the CSS tokens.
- The design tokens and component styles are in the page `<style>` block. Reuse the token names when porting to the Next.js app.
- The global theme control is available before and after sign-in; it updates `document.documentElement.dataset.theme` and stores `light` or `dark` in `hope_theme`.
- Auth modes are `login`, `reg`, `reset`, and `newpass`; `show(mode)` updates visible form, heading copy, and tab visibility/selection.
- The login/register tab controls use `aria-controls` and their forms use `role="tabpanel"`. Recovery screens are not tabs.
- User role/status controls need person-specific accessible names. The rights dialog is labeled by its title and description and receives initial focus on the first permission.
- The Users table shows an empty photo placeholder until an image is selected. Images must be image MIME types no larger than 1 MB and are stored as data URLs on the local user record.
- Existing role authorization, demo data, Supabase calls, report logic, and local persistence are unchanged by this design pass.
- For production, connect auth and role checks to the trusted backend/RLS layer; client-side visibility is not an authorization boundary.

## Usability Review And Fix List

Heuristic review of the implemented screens; validate with keyboard, screen-reader, mobile, and real-user testing before release.

| Finding | Priority | Disposition |
| --- | --- | --- |
| Auth states did not have a dedicated heading, making register and recovery context less obvious. | High | Fixed: title and helper copy now update for every auth state. |
| Tab controls lacked explicit relationships to their forms. | High | Fixed: login/register tabs point to labeled tab panels. |
| Recovery left the login/register tab group visible with no selected tab. | Medium | Fixed: tabs are hidden during reset and new-password states. |
| Role and status dropdowns used a generic accessible name. | High | Fixed: each control names its user and purpose. |
| Rights dialog did not identify itself programmatically or move focus to its choices. | High | Fixed: title/description associations and initial checkbox focus. |
| User-management table may require horizontal scrolling on narrow screens. | Medium | Intentional fallback: preserve table readability; verify scroll affordance on a phone-sized viewport. |
| No real browser/assistive-technology test was run in the GitHub VFS workspace. | High | Open: validate responsive layouts, keyboard order, focus return after dialogs, and contrast in a local browser. |
