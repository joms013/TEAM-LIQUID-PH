# Fix list

## Do first (High)
1. Send every status and role change through one styled confirm dialog, including the dropdowns. Remove `confirm()`.
2. Below 860px render Users as cards instead of a scrolling table.

## Next (Med)
3. Pending-count badge on the Users nav item.
4. Filter counts respect search, show empty state at zero rows, split or rename Blocked / Disapproved.
5. One message pattern on auth: neutral "email or password is incorrect", messages above the button.
6. Confirm-password on Set new password, guard the null Supabase client in demo mode.
7. Move the theme toggle into the sidebar footer and the mobile menu bar.
8. Rename Delete to Mark inactive everywhere, or change the confirm copy.
9. Validation: quantity above 0 and whole, separation after hire, birth date in the past.
10. Helper text on disabled selects ("You can't change your own role").

## Polish (Low)
11. Select all / clear in Rights dialog, no toast when nothing changed.
12. Relabel or drop the green dot, add Reports to quick actions.
13. Format stamp as "Edited by Lisa, Oct 1".
14. Raise 9px and 11px text to 12px.
15. Correct the TR000042 date.
