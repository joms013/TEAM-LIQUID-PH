# Sprint 1 Mid-Sprint Check Notes & Impediment Log

**Project:** Hope, Inc. ERP  
**Sprint:** Sprint 1 (Week 1–2)  
**Facilitator:** Scrum Master (Jomar Danielle Gonzales)  
**Overall Status:** 🟢 On Track  

---

## 1. Progress Summary by Role

* **Scrum Master (SM):** 100% Complete
  * ✅ `S1-SM-01`: Repo rules and branching guidelines (`PR #6`)
  * ✅ `S1-SM-02`: Sprint 1 board mapping & 8-week module roadmap (`PR #7`)
  * ✅ `S1-SM-03`: Team working agreement, DoD, and role guide (`PR #8`)
* **Database Administrator (DBA):** In Progress
  * Initial schema design for Core Auth and User Management modules aligned.
* **UI/UX Designer (UIX):** In Progress
  * Wireframes and Tailwind CSS layout design for Auth module underway.
* **Developer (DEV):** In Progress
  * Next.js base structure and login page components in development.
* **Tester (TST):** Pending
  * Acceptance criteria matrix and initial test plan setup.

---

## 2. Impediment Log

| ID | Issue / Impediment | Impact | Assigned To | Action Plan / Mitigation | Status |
| :--- | :--- | :--- | :--- | :--- | :--- |
| **IMP-01** | Branch synchronization confusion during local git checkout. | Minor Delay | SM | Provided step-by-step guidance on syncing local `main` before branching. | **RESOLVED** |
| **IMP-02** | Google Sheets PR link formatting mismatch. | Tracking Risk | SM | Standardized all PR column entries with full PR titles and hyperlinked URLs. | **RESOLVED** |
| **IMP-03** | Finalizing schema constraints between DB and Auth routes. | Potential Blocker | DBA / DEV | Scheduled sync session to review User/Role table schema before running migrations. | **IN PROGRESS** |

---

## 3. Action Items Before Sprint Review

1. **DBA:** Finalize PostgreSQL schema and migration scripts for User/Role models.
2. **DEV:** Connect API authentication endpoints to the Next.js frontend UI.
3. **TST:** Prepare acceptance testing suite based on the Definition of Done (DoD).