# Developer handoff notes

## Tokens
- Color: primary `#2463c4`, primary dark `#184b9e`, ink `#17263d`, muted `#55657d`, line `#dbe4f0`, tint `#eaf1fb`, page `#f3f6fc`, danger `#a63f39`, success `#16745a`, warning `#895a0b`, highlight `#d77d62` (fill only).
- Type: DM Sans for UI, Newsreader 500 for page titles and hero. Scale 36 / 22 / 15 / 13 / 12.5. Nothing below 12.
- Shape: controls 8, cards 12, dialogs 16, pills 6. Space: 4-pt scale, 16 gutters, 36 page padding, 44px touch targets.

## Consolidate the CSS
The stylesheet has four stacked override layers, and the first still names Plus Jakarta Sans, which is never loaded. Collapse to one `:root` token block, delete dead layers, drive dark mode from `[data-theme]` only.

## Screen specs
- **Auth:** one card, four views via `show(view)`. Tabs hidden on Reset and Set new. Add confirm-password to Set new.
- **Main page:** hero, four stat buttons that open their module, recent sales, top customers. Hidden per module rights.
- **User Management:** status filter with counts, search, row actions by status. Superadmins hidden from admins. Self and locked rows read-only.
- **Rights dialog:** five module chips, role `user` only. Admins and superadmins see all modules.

## Behavior and accessibility
- Native `<dialog>` with Esc and focus return. Keep.
- Status color is paired with a text label. Keep.
- Replace the remote Unsplash hero photo with a hosted, licensed asset or a gradient.
- Remove the demo-mode note and demo emails before production.
- Data is in `localStorage`. With Supabase, enforce roles and status server-side.
