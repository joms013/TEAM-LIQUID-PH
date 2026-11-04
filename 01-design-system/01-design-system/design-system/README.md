# Design system: colors, typography, core components

Branch: `feature/01-design-system`

## Summary
Design tokens and core components for Hope, Inc. ERP, consolidated from the built app. The build currently stacks four CSS override layers (blue glass, green flat, blue flat, photo polish). This branch defines one token set to replace them.

## Files
| File | Contents |
|---|---|
| `colors.html` | 11 color tokens with hex values and usage notes |
| `typography.html` | DM Sans for UI, Newsreader for page titles, type scale |
| `components.html` | Buttons, inputs and error state, chips, status badges, nav items, table row |

## Key decisions
- Muted text darkened from `#62728a` to `#55657d` so it passes 4.5:1 on the tint background.
- Highlight `#d77d62` is fill only, never text.
- Radius: controls 8, cards 12, dialogs 16, pills 6 (build mixes 4, 5, 10, 16, 20 today).
- Type floor 12px (build has 9px and 11px labels today). Touch target 44px minimum.

## How to view
Open any `.html` file in a browser. Fonts load from Google Fonts, so go online for the exact typefaces.

## Review checklist
- [ ] Tokens approved by design owner
- [ ] Contrast values checked
- [ ] Ready to be applied to the app stylesheet
