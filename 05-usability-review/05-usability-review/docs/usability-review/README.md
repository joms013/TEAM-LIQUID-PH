# Usability review of built screens and fix list

Branch: `feature/05-usability-review`

## Summary
Heuristic review of the built app (`hope-erp.html`), based on reading the code. 18 findings rated High / Med / Low, and a 15-step prioritized fix list.

## Files
| File | Contents |
|---|---|
| `USABILITY_REVIEW.md` | Findings table and what already works well |
| `FIX_LIST.md` | Ordered fixes with priority |
| `hope-erp.html` | The reviewed source, unchanged |

## Top issues
1. Status dropdown in User Management skips the confirm that Block and Reject require.
2. Users table has an 880px minimum width, so Approve and Reject are off-screen on phones.

## Limits
Findings come from code reading, not user testing. Test the mobile Users table and sign-in messages with 3 to 5 people.

## Review checklist
- [ ] High items accepted into the next sprint
- [ ] Fix order agreed
