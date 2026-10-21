# 📐 BuildTask — Notion-Style Task Platform for Architects & Engineers

A modern, browser-based, Notion-style task assigner and operations platform engineered specifically for **construction company office staff**, **Architects**, and **Consulting Engineers**.

Every design task, calculation review, or drawing milestone assigned to a staff member automatically triggers an email dispatch with drawing set coordinates, software model references, code compliance protocols, and a direct portal access link.

---

## 🌟 Key Features

### 1. Dedicated Staff Directory & Mail ID Input Section ([`StaffManagementView.tsx`](file:///C:/Users/OMEN/.gemini/antigravity/scratch/buildtask-construction/src/components/StaffManagementView.tsx))
- **Input Staff Details Form**:
  - Full Name & Professional Credentials (e.g. `Sophia Al-Mansoor, AIA`, `Dr. Jonathan Vance, PE, SE`)
  - **Staff Mail ID** (Target for automatic assignment notifications)
  - Discipline & Specialty (Architectural Design, Structural, MEP, Civil, BIM, Permitting, Facade)
  - License / Stamp Registration # (PE, SE, AIA, NCARB, LEED AP)
  - Studio & Office Location (e.g. `HQ Studio 402`, `Engineering Bay 2`)
  - Office Direct Phone & Extension
- **Live Staff Roster & Workload Dashboard**:
  - Filter by engineering discipline or search by name, mail ID, or license number.
  - One-click `Assign Task` button to dispatch deliverables directly to that engineer.
  - Active deliverables counter and notification deliverability status.

### 2. Notion-Like Browser Experience
- **Database Table View**: Multi-column Notion database with inline editing, discipline tags, review liability badges, due dates, assignee chips, and dispatch status indicators.
- **Kanban Board View**: Grouped by engineering review lifecycle statuses (*Backlog / Staged*, *Ready on Site*, *In Design / Review*, *Awaiting Inspection / Peer Review*, *Completed*).
- **Workload by Staff View**: Workload aggregation per architect and engineer, showing contact info, active jobs, and direct task assignment buttons.
- **Notion Page Detail Modal**: Click any work order to open a full Notion page with editable title, properties grid, technical specifications, interactive punch-list checklist, and an email dispatch audit panel.

### 3. Engineering & Architectural Workflows
- **Project Sites**: Switch between active projects (*Apex Skyline Tower Phase 3*, *Oakridge Luxury Villas*, *St. Jude Hospital West Wing Expansion*).
- **Engineering Disciplines**: Architectural Design, Structural Engineering, MEP Engineering, Civil & Geotechnical, BIM & VDC Coordination, Building Code & Permitting, Facade & Building Envelope, Sustainability & LEED, and Project Management.
- **Review & Liability Levels**: Code Compliance Review (IBC 2024), Permit Critical (Municipal Deadline), High Engineering Liability (PE Stamp Required), Peer Review Required, and Standard QA Review.
- **Software & Model References**: Track exact models and drawing sets (e.g. `Revit 2026 Model`, `ETABS v22`, `Civil 3D Surface`, `Sheet S-201`, `Package A-101`).

### 4. Automated Email Notification Engine
- **Instant Notification on Assignment**: When a task is created or its assignee is changed, an email notification is automatically generated and dispatched to the architect/engineer's mail ID.
- **Architectural & Engineering HTML Email**:
  - Branded header (`APEX ARCHITECTS & CONSULTING ENGINEERS`).
  - Priority badge (*CRITICAL*, *HIGH*, *MEDIUM*).
  - Scope of work & drawing package specifications.
  - Due date & IBC code compliance review level.
  - Software & BIM model references.
  - Direct "Open Task in Design Portal" button (`http://localhost:3000/?taskId=...`).

- **Google Account & Gmail Integration**:
  - **Connect Google Account**: 1-click modal with official Google branding.
  - Connect your personal or corporate Google Workspace account (`@gmail.com` or custom domain).
  - Outbox automatically attributes sent emails to your connected Google profile (e.g., `From: Arthur Sterling <site.superintendent@gmail.com>`).
  - Automatically registers your Google account as a Crew Superintendent in the Team Directory.
  - Supports **Direct Gmail Delivery** via Google App Passwords or **Google Cloud OAuth 2.0 Client Credentials**.
- **Dual Email Delivery Modes**:
  - **Simulated Instant Outbox (Default)**: Ready out of the box with zero configuration! All sent emails are recorded in the built-in **Notification Outbox** with live responsive HTML preview (desktop and mobile subcontractor view).
  - **Live SMTP / Gmail Server**: Connect your real SMTP credentials (Gmail App Password, SendGrid, Office 365, Amazon SES, or custom corporate mail server). Test email delivery directly in the UI.

---


## 🚀 Quick Start

The platform is running on `http://localhost:3000`.

To start manually at any time:
```powershell
cd C:\Users\OMEN\.gemini\antigravity\scratch\buildtask-construction
npm.cmd run dev
```

Visit in your browser:
👉 **[http://localhost:3000](http://localhost:3000)**

---

## 📁 Project Architecture

```
buildtask-construction/
├── data/
│   └── store.json                    # File-based JSON database with atomic writes
├── src/
│   ├── app/
│   │   ├── api/
│   │   │   ├── tasks/
│   │   │   │   ├── route.ts          # List & create tasks with email trigger
│   │   │   │   └── [id]/route.ts     # Single task operations & reassign emails
│   │   │   ├── members/route.ts      # Crew & subcontractor directory API
│   │   │   ├── projects/route.ts     # Construction project sites API
│   │   │   ├── emails/
│   │   │   │   ├── route.ts          # Retrieve Outbox logs
│   │   │   │   ├── resend/route.ts   # Manually resend task notifications
│   │   │   │   └── settings/route.ts # SMTP settings & test delivery
│   │   ├── globals.css               # Notion styling & custom scrollbars
│   │   ├── layout.tsx                # App root layout
│   │   └── page.tsx                  # Main Notion platform coordinator
│   ├── components/
│   │   ├── NotionSidebar.tsx         # Left sidebar with views, sites & outbox
│   │   ├── NotionHeader.tsx          # Page cover banner, stats & view switcher
│   │   ├── NotionTableView.tsx       # Notion database table view
│   │   ├── NotionBoardView.tsx       # Kanban board grouped by status
│   │   ├── NotionAssigneeView.tsx    # Assignee-centric workload view
│   │   ├── NotionTaskModal.tsx       # Full Notion page detail modal
│   │   ├── NotionNewTaskModal.tsx    # Work order creation & instant email send
│   │   ├── NotificationCenterModal.tsx # Interactive Outbox & HTML email previewer
│   │   ├── TeamMembersModal.tsx      # Crew & subcontractor directory modal
│   │   ├── SmtpSettingsModal.tsx     # SMTP configuration & live testing modal
│   │   └── Toast.tsx                 # Dispatch notifications & alert toasts
│   └── lib/
│       ├── types.ts                  # TypeScript definitions
│       ├── db.ts                     # Database abstraction & initial seed data
│       └── email.ts                  # Nodemailer transport & HTML email generator
└── tailwind.config.js
```

---

## 🛠️ Testing Email Delivery

1. **Test with the Built-In Outbox (Simulated Mode)**:
   - Click **"+ New Task"** or click on any member in **"By Worker"**.
   - Fill in task details and make sure *"📧 Send Instant Email Notification to Assignee"* is checked.
   - Click **"Create Task & Dispatch Email"**.
   - Notice the toast alert: `📧 Notification Dispatched!`. Click **"View in Outbox"** (or click **"Notification Outbox"** in the sidebar) to inspect the rendered email in desktop or mobile phone view!

2. **Test with Your Own Email Address**:
   - Open **"Crew Directory"** from the left sidebar.
   - Click **"Add Member / Subcontractor"** and enter your own name and email address.
   - Create a task assigned to yourself.

3. **Configure Live SMTP (Optional)**:
   - Click **"Mailer & SMTP Config"** in the left sidebar.
   - Switch delivery mode to **"Live SMTP Server"**.
   - Enter your host (e.g., `smtp.gmail.com`), port (`587`), your Gmail address, and a 16-character **Google App Password**.
   - Use the **"Test Live Email Delivery"** box to verify connection.
