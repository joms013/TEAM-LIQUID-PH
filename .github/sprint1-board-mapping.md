# Sprint 1 Project Board, Stories & 8-Week Module Roadmap

## 1. 8-Week / 4-Sprint Module Roadmap (6 Core Modules)
* **Sprint 1 (Weeks 1-2):** Authentication & Core System Setup, User Management & Role Rights Matrix (36 Rights)
* **Sprint 2 (Weeks 3-4):** Customer Management & Product Management
* **Sprint 3 (Weeks 5-6):** Sales Order Processing & Inventory Management
* **Sprint 4 (Weeks 7-8):** System Integration, Reporting/Audit Logs & Final Testing

---

## 2. Sprint 1 User Stories & Acceptance Criteria

### USER-STORY-01: User Authentication & Session
* **As a** Registered User,  
  **I want to** log in securely with my credentials,  
  **So that** I can access module features allowed for my assigned role.
* **Acceptance Criteria:**
  - [ ] Login screen validates email and password formatting.
  - [ ] Successful authentication generates a secure session/JWT token.
  - [ ] Invalid credentials display a clear error message without revealing specific account details.

### USER-STORY-02: Role & 36 Per-Action Rights Matrix
* **As an** Admin,  
  **I want to** assign roles (Super Admin, Admin, Standard User) and configure 36 per-action rights,  
  **So that** system actions (Create, Read, Update, Delete) are strictly authorized.
* **Acceptance Criteria:**
  - [ ] Matrix screen displays all 36 granular rights mapped to the 3 default roles.
  - [ ] Admin can toggle specific action rights per role.
  - [ ] Unassigned actions are hidden or disabled on the user interface.

### USER-STORY-03: Database Migration & Audit Trail Setup
* **As a** DB Admin,  
  **I want to** initialize database schemas and security audit tables,  
  **So that** all system transactions and permission changes are permanently logged.
* **Acceptance Criteria:**
  - [ ] Initial schema migrations execute clean without foreign key errors.
  - [ ] Audit trail table records user ID, action timestamp, and modified record details.