# Wireframes: login, register, set/reset password

Branch: `feature/02-wireframes-auth`

## Summary
Low-fidelity wireframes for the four auth views in the app. In the build they are one card with four views switched by `show(view)`.

## Files
| File | Screen |
|---|---|
| `login.html` | Sign in: email, password with Show toggle, forgot-password link, message area |
| `register.html` | Create account: name, work email, password, 8+ character hint, approval notice |
| `reset-password.html` | Reset password: email, send link, back to sign in |
| `set-new-password.html` | Set new password: new password, **confirm password (added)** |

## Changes proposed vs. the build
- Confirm-password field on Set new password (build has one field only).
- Messages sit above the primary button, near the fields (build shows them below).

## How to view
Open any `.html` file in a browser. Orange tags mark proposed additions.

## Review checklist
- [ ] Field list and order approved
- [ ] Message placement approved
