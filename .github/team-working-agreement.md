# Team Working Agreement, Definition of Done & Role Guide

## 1. Team Working Agreement
- **Communication:** Active collaboration via GitHub Issues, PR comments, and scheduled syncs.
- **Branching Strategy:** Feature branches only (`feature/<task-id>-<description>`). Direct commits to `main` are strictly forbidden.
- **Code & Doc Reviews:** Every PR must undergo self-review and peer verification before merging.
- **Tracking:** Every completed PR must be immediately updated in the official Google Sheets project board.

## 2. Definition of Done (DoD)
- [ ] Requirements and acceptance criteria for the story/task are fully satisfied.
- [ ] Documentation or code is formatted, committed, and pushed to the designated feature branch.
- [ ] Pull Request is opened, reviewed, and merged into `main` without merge conflicts.
- [ ] Google Sheets tracker status is updated to `Merged` along with the exact PR URL.

## 3. Team Role Guide
- **Scrum Master (SM):** Project governance, repository rules, sprint mapping, working agreements, and progress tracking.
- **Database Administrator (DBA):** Schema design, migrations, indexed view optimization, and security audit logs.
- **UI/UX Designer (UIX):** Design system, wireframes, component mockups, and usability testing.
- **Developer (DEV):** Core functionality implementation, API routes, authentication logic, and CRUD operations.
- **Tester (TST):** Acceptance matrix execution, automated smoke testing, and issue reporting.