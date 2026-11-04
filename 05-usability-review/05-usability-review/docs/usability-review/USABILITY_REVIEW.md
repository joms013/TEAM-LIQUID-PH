# Usability review

Severity: **High** blocks or misleads, **Med** causes friction, **Low** polish.

| # | Screen | Finding | Sev |
|---|---|---|---|
| 1 | User Management | Status dropdown skips the confirm that Block and Reject buttons require. | High |
| 2 | User Management | Confirms use browser `confirm()`, while data modules use the styled dialog. | Med |
| 3 | User Management | 880px minimum table width. On phones the Actions column is off-screen. | High |
| 4 | User Management | Status select can set any user back to Pending or Disapproved. Disabled selects give no reason. | Med |
| 5 | User Management | Filter counts ignore search. Zero search results shows a blank table. "Blocked" tab includes Disapproved. | Med |
| 6 | Navigation | Pending registrations invisible until Users is opened. No nav badge. | Med |
| 7 | Rights dialog | No select all or clear. Saving unchanged still toasts. No module descriptions. | Low |
| 8 | Sign in | Unknown email says "No account found", Reset says "If that email has an account". Inconsistent, reveals which emails exist. | Med |
| 9 | Sign in | Messages appear below the button, away from the field. | Med |
| 10 | Set new password | No confirm field. In demo mode the form throws on a null client. | Med |
| 11 | Global | Fixed theme toggle overlaps hero and page header, and crowds the mobile menu bar. | Med |
| 12 | Home | Green "live" dot next to role reads as online status. | Low |
| 13 | Home | Quick actions take the first four modules, so Reports is unreachable from the hero for admins. | Low |
| 14 | Data tables | Button says Delete, confirm says Mark inactive. | Med |
| 15 | Data tables | Stamp column shows raw strings like `EDITED lisa 2026-10-01 09:00`. | Low |
| 16 | Forms | Quantity accepts 0 and decimals. Separation date can precede hire date. Birth date can be in the future. | Med |
| 17 | Type | 9px brand tag, 11px group labels, 12.5px captions. | Low |
| 18 | Data | Seed sale TR000042 dated 2020-10-25 among 2010 records. | Low |

## What works well
Inline field errors with counters and hints, sortable headers with `aria-sort`, pagination summaries, empty states with a recovery action, keyboard navigation on auth tabs, reduced-motion support.
