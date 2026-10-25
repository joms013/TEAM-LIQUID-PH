# Sprint 2 Mid-Sprint Check & Impediment Log

**Project:** Hope, Inc. ERP  
**Sprint:** Sprint 2 (Core DB Schema & Auth Architecture)  
**Facilitator:** Scrum Master (Jomar Danielle Gonzales)  
**Date:** October 25, 2026  

---

## 📊 Mid-Sprint Progress Overview

* **Target Goal:** Complete PostgreSQL User/Role schema migration scripts (`S2-DBA-01`), Auth routes (`S2-DEV-01`), and Login UI wireframes (`S2-UIX-01`).
* **Current Status:** On track with governance documentation and cross-role synchronization.

---

## 🚨 Active Impediments & Risk Log

| Risk ID | Description | Severity | Impact Area | Mitigation / Action Plan | Status |
| :--- | :--- | :---: | :---: | :--- | :---: |
| **IMP-03** | Potential mismatch between DBA User schema and NextAuth user model requirements. | High | DBA / DEV | Pre-migration review scheduled to align table structures prior to commit. | 🟡 Monitoring |
| **IMP-04** | Delay in Auth UI wireframe sign-off impacting Next.js component development. | Medium | UIX / DEV | UI/UX designer providing initial component layouts ahead of finalized high-fi design. | 🟢 Mitigated |

---

## 🎯 Action Items for Remaining Sprint 2
1. Finalize and test PostgreSQL database migration scripts (`S2-DBA-01`).
2. Integrate NextAuth endpoints with database models (`S2-DEV-01`).
3. Prepare Sprint 2 velocity and burndown updates (`S2-SM-04`).