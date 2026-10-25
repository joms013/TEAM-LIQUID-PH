# Sprint 1 Review & Retrospective Report

**Project:** Hope, Inc. ERP  
**Sprint:** Sprint 1 (Governance & Base Setup Phase)  
**Facilitator:** Scrum Master (Jomar Danielle Gonzales)  
**Date:** October 25, 2026  

---

## 🟢 Part 1: Sprint Review (What Was Delivered)

### 1. Sprint Goal
Establish repository governance, branching rules, 8-week module roadmap, definition of done, team working agreement, and initial impediment tracking.

### 2. Deliverables Summary
All planned Sprint 1 Scrum Master governance deliverables have been 100% completed and merged into the `main` branch:

* **S1-SM-01 (Repo Setup & Guidelines):** Branch protection rules, issue/PR templates, and workflow standards (`PR #6`).
* **S1-SM-02 (Sprint Board & Roadmap):** 8-week ERP module mapping and Sprint 1 story breakdown (`PR #7`).
* **S1-SM-03 (Working Agreement & DoD):** Team role guide, communication standards, and explicit Definition of Done (`PR #8`).
* **S1-SM-04 (Mid-Sprint Check & Impediment Log):** Active risk tracking, mitigation steps, and status report (`PR #9`).

---

## 🔄 Part 2: Sprint Retrospective (Team Reflections)

### 1. What Went Well? (Keep Doing)
* **Strict PR Workflow:** Mandatory PR reviews prevented direct push conflicts to `main`.
* **Centralized Tracking:** Synchronizing GitHub PRs directly with the Google Sheets board provided clear progress visibility.
* **Rapid Issue Resolution:** Branching and local sync confusion were addressed in real time.

### 2. What Could Be Improved? (Start / Change)
* **Local Branch Hygiene:** Ensure team members run `git pull origin main` before creating new feature branches to avoid missing paths.
* **In-PR Descriptions:** Include brief release notes in PR descriptions instead of submitting blank PR bodies.
* **Cross-Role Sync:** Early alignment between DBA and DEV roles needed prior to schema migration commits.

---

## 🎯 Part 3: Action Items for Sprint 2

| ID | Action Item | Priority | Assigned To | Target Sprint |
| :--- | :--- | :--- | :--- | :--- |
| **ACT-01** | Conduct DBA/DEV schema alignment for User & Auth tables before DB migration. | High | DBA / DEV | Sprint 2 |
| **ACT-02** | Standardize PR template checklist compliance for all future UI/UX and DEV PRs. | Medium | SM / Team | Sprint 2 |
| **ACT-03** | Initiate Sprint 2 execution focusing on Database Migrations (`S2-DBA-01`) and Auth UI (`S2-UIX-01`). | High | Team | Sprint 2 |