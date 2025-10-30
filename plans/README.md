## Modern NC Program Management — Product Plan

### Vision
Build a modern, robust, and user-friendly NC program management system with full feature parity plus thoughtful improvements across usability, performance, collaboration, and integrations. Include a built-in CAD/STEP/DXF viewer for quick visual validation without leaving the app. Operate fully standalone with no dependency on proprietary vendor software; prefer open-source components and open protocols throughout.

### Target Users
- **CNC programmers**: manage, version, and validate NC programs quickly.
- **Machine operators**: reliable access to correct releases, approvals, and machine-ready files.
- **Manufacturing engineers**: track revisions, tooling, setup docs, and job packets.
- **Quality/production managers**: audit trails, approvals, compliance reporting.

### Goals
- **Full NC program management parity**: all core workflows supported and streamlined.
- **Modern UX**: fast search, bulk ops, keyboard-first, responsive UI.
- **Integrated viewing**: native viewing for CAD (STEP) and drawings (DXF; future: DWG via plugin).
- **Collaboration-ready**: roles/permissions, reviews, approvals, comments, notifications.
- **Secure & compliant**: rigorous audit trails, e-sign approvals, retention controls.
- **Vendor-neutral**: no runtime reliance on proprietary vendors; connect via open interfaces (FTP/SFTP, SMB, serial, MTConnect, OPC UA where applicable).

### Principles (Standalone + Open-Source First)
- **No proprietary runtime dependencies**: compatible with workflows, not specific vendor software.
- **Open protocols**: serial (RS-232), Ethernet (FTP/SFTP/SMB), MTConnect for telemetry, OPC UA where feasible.
- **OSS components**: prioritize proven open-source libraries/services for viewing, auth, storage, search, and messaging.
- **Self-hostable**: full on-prem/cloud deployment with infrastructure as code and backups.
- **Migration-friendly**: import from legacy NC management systems (exports/DB snapshots) without requiring those systems to operate.

---

## Deployment & Network Topology (Local On-Prem)
- **Local-only operation**: Runs entirely on your on-prem LAN with no Internet dependency.
- **Server**: App/API, database, search, and storage run on local servers/VMs; optional HA pair.
- **DNC connectivity**: DNC agent connects to CNCs via RS-232 (serial servers) and/or Ethernet (FTP/SFTP/SMB), all within the LAN.
- **Storage (SMB-first)**: NC programs, media, and CAD stored on local SMB network drives (NAS/Windows file servers). Object storage (e.g., MinIO) is optional later.
- **Operator devices**: Tablets/phones on secure shop-floor Wi‑Fi/VLAN; kiosk mode optional.
- **Directory/SSO**: Integrates with local AD/Entra over LAN; works offline if SSO is unavailable.
- **Certificates/DNS**: Internal PKI or self-signed bootstrap; internal DNS hostnames.
- **Backups**: Scheduled local backups to NAS/tape; offline export bundles for DR.
- **No external calls**: All services, updates, and package registries resolved from local mirrors or signed offline bundles.

---

## Feature Set

### 0) Mobile/Tablet App for Setup Sheets (Template-Driven)
- **Platforms**: iOS, Android, and responsive web PWA with offline-first sync.
- **Template-driven creation**: admin-defined templates for different operations/machines; required fields, validation, and conditional sections.
- **Media capture**: capture/upload photos and videos directly from device camera; automatic resizing and background upload.
- **On-image annotations**: arrows, callouts, shapes, text, blur/redact; layer-based non-destructive edits; attach notes per annotation.
- **Guided workflows**: step-by-step wizard for operators; keyboard-free where possible; voice notes optional.
- **Asset linking**: link setup sheets to programs, tools, fixtures, STEP/DXF views; deep-link to associated items.
- **Reusable blocks**: standard safety checks, probing steps, torque specs, and tooling blocks.
- **Approval & release**: mobile-friendly review, sign-off, and publish; kiosk mode for read-only on shop floor.
- **Localization**: units, language packs, number/date formats.
- **Security**: device-level auth, SSO, MDM support, per-device revocation; granular permissions for create/edit/view.

### 1) NC Program Repository (Parity + Better)
- **File management**: store NC programs, subprograms, macros; folder/tag organization.
- **Metadata**: operation, machine, material, job/work order, part number, revision, author, status.
- **Versioning**: automatic revisioning for any change (in-app or direct file edits on SMB share) with username, timestamp, summary, and NC-aware diffs; revert/restore; immutable audit log.
- **Search & filters**: full-text, metadata filters, advanced queries, saved searches, pinned views.
- **Bulk operations**: bulk metadata edits, moves, tag management, archive/unarchive, delete with safeguards.
- **Check-in/out**: lock while editing, conflict detection, merge guidance for minor edits.
- **Approvals**: configurable review/approval workflows; e-sign with reason codes.
- **Release states**: Draft → In Review → Approved → Released → Obsolete; per-machine compatibility flags.
- **Import/export**: drag-drop import; export selected sets with structure and metadata.
  - Fusion 360: one-click "Pull STEP" from linked design; maintain part/revision association.
  - SMB monitoring: detect external edits and auto-create a new revision with diff and attribution.

### 2) Machine Connectivity & DNC Integration
- **DNC links (standalone)**: built-in DNC agent/service for send/receive; optional integration with existing third-party DNC if present.
- **Machine targets**: associate programs to machines; track last sent version per machine.
- **Transfer logs**: when/what/who sent; hash verification to ensure correct content at control.
- **Queueing & scheduling**: prepare send queues per shift/job; operator-friendly station UI.
- **Protocols (mixed-era support)**: RS-232 serial (via serial device servers) and Ethernet (FTP/SFTP/SMB); pluggable drivers per controller family.
- **APIs**: REST/gRPC for automation; webhook callbacks for transfer completion.
- **Local network**: All transfers occur on the shop LAN; supports per-cell subnet/VLAN layouts and firewall rules.

### 3) NC-Aware Tools
- **NC diff/compare**: syntax-aware diffs, highlight tool changes, feeds/speeds deltas.
- **Validation rules**: basic linting for common controller dialects (Fanuc/Siemens/Heidenhain…); pluggable rule sets.
- **Header/metadata extraction**: parse comments/headers for automatic metadata population.
- **Template library**: standard headers, safety blocks, probing cycles, company macros.
 - **Change summaries**: auto-generate change summaries from diffs (e.g., tool number changes, offset edits, feed/speed changes).

### 4) Integrated Viewers (STEP/DXF)
- **STEP viewer**: rotate, pan, explode, isolate components, section cuts, measure distance.
- **DXF viewer**: layers toggle, dimensions, annotations, print to scale, export PDF.
- **Associations**: link NC program to STEP/DXF by part/revision; one-click open from program view.
  - Fusion 360 link: show source design reference and provide "Open in Fusion 360" action.
- **Markup**: non-destructive annotations; save as view states linked to revisions.
- **Performance**: progressive loading for large assemblies; GPU-accelerated rendering.
- **OSS viewers**: leverage open-source rendering engines and parsers where licensing permits; modular adapters for proprietary formats via optional plugins.

### 5) Documentation & Process Attachments
- **Setup sheets**: structured forms + file attachments; regenerate PDFs on revision.
- **Tool lists**: managed per program; track vendor, life, offsets; export to machine/toolroom.
- **Work instructions**: images/video, step sequences, checklists with sign-off capture.
  - Mobile: capture media, annotate, and submit from devices; auto-compress and tag by station/WO.

### 6) Collaboration & Communication
- **Comments & mentions**: per program/revision/line selection; @mentions with notifications.
- **Review tasks**: assign reviewers, due dates, status tracking, reminders.
- **Subscriptions**: watch items, folders, tags; digest emails or in-app notifications.
  - Mobile: push notifications for assigned reviews, approvals, and changes to watched items.
  - Operator UI: from program/machine list, buttons to "Pull STEP" and "Open CAM in Fusion 360".

### 7) Access Control, Compliance, Audit
- **RBAC**: roles (Operator, Programmer, Engineer, QA, Manager, Admin) with fine-grained permissions.
- **Audit trails**: every change (who/when/what) with before/after; exportable for audits.
- **Approval policies**: dual approvals, separation of duties, reason codes, electronic signatures.
- **Retention**: configurable retention and obsolescence policies; legal holds.

### 8) Integrations
- **PLM/ERP/MES**: part master and work order sync; webhook/API connectors.
- **PDM/CAD**: pull STEP/DXF from vaults (e.g., SolidWorks PDM, Autodesk Vault) by part/rev.
- **Autodesk Fusion 360**: 
  - OAuth-based connection to Fusion Team/Hub projects.
  - Fetch latest or specific revision STEP via Autodesk Platform Services (APS) where permitted.
  - Deep link to open CAM workspace from operator interface (desktop client or web).
  - Optional webhooks to detect design updates and flag downstream items.
- **Directory/SSO**: AD/Entra ID/Okta; SCIM provisioning.
- **Backups & archive**: S3/Azure Blob/NAS; cold storage tiers.
- **Legacy migration**: import NC programs, metadata, and history from prior systems via exports/DB snapshots; no dependency at runtime.

### 9) Reporting & Dashboards
- **Operational**: recently released, pending approvals, change hotspots, machine send history.
- **Quality**: deviations vs approvals, rework drivers, diff patterns by cell or product line.
- **Custom**: saved reports, export CSV/PDF; embed to BI with secure links.

### 10) Admin & Configuration
- **Taxonomies**: machines, materials, operations, tags, custom fields.
- **Workflow builder**: states, transitions, approvals, notifications, SLAs.
- **Validation rules**: per-controller rule sets; severity (warn/error/block).
- **Data policies**: retention, redaction, export controls.

---

## Project Structure (Following Cursor Clause 4.5 Rules)

### Frontend Architecture
```
frontend/src/
├── components/
│   ├── ui/                    # Atomic reusable UI elements (Button, Input, Badge, Card)
│   ├── layout/                # Navigation, Header, Sidebar, Footer
│   └── sections/              # Feature-level blocks (ProgramList, Dashboard, SetupSheet)
├── pages/                     # Route-level views (ProgramsPage, MachinesPage, SettingsPage)
├── hooks/                     # Custom React hooks (usePrograms, useMachines, useSetupSheets)
├── utils/                     # Helper functions (formatters, validators, converters)
├── api/                       # API client layer (fetch wrappers, error handling)
│   └── schemas/               # Zod schemas for API validation
├── types/                     # Shared TypeScript types and interfaces
├── assets/                    # Static files (images, fonts, icons)
├── App.tsx                    # Root application component
├── main.tsx                   # Vite entry point
└── index.css                  # Tailwind base styles + custom CSS
```

### Backend Architecture
```
backend/
├── src/
│   ├── api/                   # Express routes
│   │   ├── programs/          # NC program endpoints
│   │   ├── machines/          # Machine management endpoints
│   │   ├── setup-sheets/      # Setup sheet endpoints
│   │   └── schemas/           # Zod validation schemas
│   ├── services/              # Business logic layer
│   │   ├── program.service.ts
│   │   ├── machine.service.ts
│   │   └── dnc.service.ts
│   ├── db/                    # Database layer
│   │   ├── migrations/        # SQL migrations
│   │   └── prisma/            # Prisma schema and client
│   ├── middleware/            # Express middleware (auth, error handling, logging)
│   ├── utils/                 # Helper utilities
│   ├── types/                 # TypeScript types
│   └── server.ts              # Express server setup
├── templates/                 # Code templates (from .cursor/rules/)
└── tests/                     # Integration and unit tests
```

### Mobile App Architecture (React Native)
```
mobile/
├── src/
│   ├── screens/               # Mobile screens (SetupCapture, ProgramView)
│   ├── components/            # Reusable mobile components
│   ├── hooks/                 # Mobile-specific hooks (useCamera, useOfflineSync)
│   ├── services/              # API client + offline storage
│   ├── types/                 # Shared types
│   └── App.tsx                # React Native root
└── package.json
```

---

## Roadmap (Proposed)
- **Phase 0 — Setup & Foundation**: 
  - Initialize project structure per Clause 4.5 rules
  - Install dependencies (Framer Motion, Zod, Express, etc.)
  - Setup ESLint, Prettier, TypeScript strict mode
  - Create component and service templates
  - Setup automated documentation generation

- **Phase 1 — Core Repository**: 
  - File store, metadata, search, versions, basic approvals
  - Express API with Zod validation
  - PostgreSQL database with Prisma
  - React components following templates

- **Phase 2 — Mobile Setup App**: 
  - React Native templates, media capture, annotations
  - Offline-first sync with conflict resolution
  - Kiosk mode for shop floor

- **Phase 3 — NC Tools & Viewers**: 
  - NC diff/lint with syntax awareness
  - STEP/DXF viewer (Three.js + OpenCascade)
  - Framer Motion animations for viewer interactions

- **Phase 4 — DNC & Operations**: 
  - Machine send/receive (Go service)
  - Queues (BullMQ/RabbitMQ)
  - Transfer logs and verification

- **Phase 5 — Integrations & Reporting**: 
  - PLM/ERP connectors with Zod validation
  - Dashboards with animated charts (Framer Motion)
  - Audit reports

- **Phase 6 — Hardening**: 
  - Performance optimization
  - Security hardening
  - HA/DR setup
  - Compliance (ISO/AS9100)
  - Internationalization (Danish + English)

---

## Non-Functional Requirements
- **Performance**: sub-200ms common actions; handle 100k+ programs; stream large CAD.
- **Reliability**: HA deployment, backup/restore, integrity checks, tamper-evident logs.
- **Security**: least-privilege RBAC, encryption in transit/at rest, key management.
- **Scalability**: horizontal scaling for API, workers, and viewing services.
- **Offline/edge (future)**: shop-floor cache/agent for unreliable networks.
  - Mobile: offline-first with conflict resolution; background sync; partial media uploads and resume.
- **Licensing**: ensure all OSS licenses are compatible (Apache-2.0/MIT/BSD preferred); third-party plugins isolated.
- **Deployability**: Docker/Kubernetes manifests; zero-downtime upgrades; air-gapped install path.
  - Fusion 360: handle API rate limits, retries, and caching of artifacts where licensing permits.
- **File monitoring & attribution**: 
  - SMB change detection via watchers and periodic validation (hash/mtime) for robustness.
  - Attribute edits using SMB user/session where available; fall back to nearest domain user mapping.
  - Conflict handling: detect concurrent edits; require user to resolve via compare-and-merge or pick-theirs/ours.
  - Integrity: content hashing and tamper-evident audit log entries per revision.

---

## Tech Stack (Following Cursor Clause 4.5 Rules)

### Frontend (Web Application)
- **Framework**: React 18 + TypeScript (strict mode)
- **Build Tool**: Vite (fast HMR, optimized builds)
- **Styling**: Tailwind CSS (utility-first, customizable)
- **Icons**: Lucide React (consistent, tree-shakeable)
- **Animations**: Framer Motion (smooth, performant transitions)
- **State Management**: Zustand or TanStack Query (for server state)
- **Forms**: React Hook Form + Zod validation
- **3D Viewer**: Three.js + React Three Fiber (for STEP/DXF)

### Backend (API Services)
- **Framework**: Express + TypeScript
- **Validation**: Zod (runtime type-safe validation)
- **Database**: PostgreSQL (primary), optional Timescale for time-series logs
- **ORM**: Prisma or Drizzle (type-safe database access)
- **API Documentation**: OpenAPI/Swagger (auto-generated from Zod schemas)

### Supporting Services
- **Search**: Meilisearch (fast, typo-tolerant metadata/text search)
- **Auth**: Keycloak/Ory (SSO via OpenID Connect/SAML, SCIM provisioning)
- **Messaging/Workers**: RabbitMQ or BullMQ (Redis-backed job queues)
- **Storage**: MinIO (S3-compatible) + SMB/NAS for local file shares
- **DNC Agent**: Go service (serial/network protocols, concurrent I/O)
- **Cache**: Redis (sessions, rate limiting, real-time pub/sub)

### Development Tools
- **Package Manager**: npm or pnpm
- **Code Quality**: ESLint + Prettier (enforced pre-commit)
- **Type Checking**: TypeScript strict mode + ts-node
- **Testing**: Vitest (unit), Playwright (e2e)
- **Documentation**: Auto-generated from JSDoc/comments → DOCUMENTATION.md

---

## Coding Standards & Conventions (Cursor Clause 4.5)

### Naming Conventions
- **Components**: `PascalCase` (e.g., `ProgramList.tsx`, `SetupSheet.tsx`)
- **Functions & Variables**: `camelCase` (e.g., `getPrograms`, `programList`)
- **Files**: `kebab-case` for non-components (e.g., `api-client.ts`, `format-date.ts`)
- **Types & Interfaces**: `PascalCase` with descriptive names (e.g., `NCProgram`, `SetupSheet`)
- **Constants**: `UPPER_SNAKE_CASE` (e.g., `MAX_FILE_SIZE`, `API_BASE_URL`)

### Component Structure (Required Template)
All React components must follow this structure:
1. **Imports** at the top (React, types, hooks, UI components)
2. **Props interface** defined before component
3. **Component function** as named export
4. **Framer Motion** for animations
5. **Tailwind CSS** for styling (no inline styles)

**Example:**
```tsx
import { motion } from "framer-motion";
import { LucideIcon } from "lucide-react";

interface ProgramCardProps {
  program: NCProgram;
  onSelect: (id: string) => void;
}

export function ProgramCard({ program, onSelect }: ProgramCardProps) {
  return (
    <motion.div
      className="p-4 bg-white rounded-lg shadow hover:shadow-lg transition"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      whileHover={{ scale: 1.02 }}
      onClick={() => onSelect(program.id)}
    >
      <h3 className="text-lg font-semibold">{program.name}</h3>
    </motion.div>
  );
}
```

### API Service Structure (Required Template)
All Express endpoints must follow this structure:
1. **Zod schema** for validation
2. **Type inference** from schema
3. **Error handling** with try/catch and `next()`
4. **Structured logging**
5. **TypeScript return types**

**Example:**
```ts
import express from "express";
import { z } from "zod";

const router = express.Router();

// Define validation schema
const CreateProgramSchema = z.object({
  name: z.string().min(1),
  partNumber: z.string(),
  machine: z.string(),
  customer: z.string(),
});

type CreateProgramInput = z.infer<typeof CreateProgramSchema>;

// Endpoint with validation
router.post("/programs", async (req, res, next) => {
  try {
    const data = CreateProgramSchema.parse(req.body);
    // Business logic here
    res.json({ success: true, program: data });
  } catch (err) {
    next(err);
  }
});

export default router;
```

### File Organization Rules
- **One component per file** (exception: tightly coupled sub-components)
- **Export at bottom** of file for better readability
- **Group imports** by category (React, third-party, local)
- **Alphabetize imports** within groups
- **No default exports** except for pages and App.tsx

### TypeScript Rules
- **Strict mode enabled** (`strict: true` in tsconfig.json)
- **No `any` types** unless absolutely necessary with `// @ts-expect-error` explanation
- **Explicit return types** for all functions
- **Interface over type** for object shapes (consistency)
- **Zod for runtime validation** + TypeScript for compile-time

### Styling Rules
- **Tailwind utility classes** for all styling
- **No inline styles** unless dynamically calculated
- **Use design tokens** from tailwind.config.js
- **Responsive by default** (mobile-first approach)
- **Dark mode support** via Tailwind's dark: variant (future)

### Animation Guidelines
- **Framer Motion** for all animations and transitions
- **Consistent timing** (200-300ms for UI feedback)
- **Respect `prefers-reduced-motion`**
- **Animate layout changes** with `layout` prop
- **Exit animations** for removed elements

### Documentation Requirements
- **JSDoc comments** for all exported functions and components
- **Inline comments** for complex logic only
- **README.md** in each major directory
- **Auto-generated docs** via `npm run docs` command
- **API documentation** auto-generated from Zod schemas

---

## Automated Workflows (Cursor Clause 4.5)

### 🔍 App Analysis Command
**Trigger**: When user says "analyze app" or "analyze performance"

**Automated Actions**:
1. Run `npm run dev` in frontend and capture logs
2. Check for build warnings and errors
3. Analyze bundle size and dependencies
4. Check for performance issues (re-renders, memory leaks)
5. Generate `/reports/performance.md` with findings and suggestions

### 📚 Documentation Generation Command
**Trigger**: When user says "generate docs" or "update documentation"

**Automated Actions**:
1. Parse all `.tsx`, `.ts` files for JSDoc comments
2. Extract component props and types
3. Analyze README.md for context
4. Generate `/DOCUMENTATION.md` with:
   - Component library
   - API endpoints
   - Type definitions
   - Usage examples
   - Architecture diagrams

### 🧪 Testing Automation
**Trigger**: When user says "run tests" or "check tests"

**Automated Actions**:
1. Run `npm run test` (Vitest)
2. Run `npm run test:e2e` (Playwright)
3. Generate coverage report
4. Identify missing test coverage

### 🎨 Component Generation
**Trigger**: When user says "create component [name]"

**Automated Actions**:
1. Use template from `.cursor/rules/4.5-rules.md`
2. Create component file with proper structure
3. Add to component index
4. Generate basic test file
5. Update documentation

### 🔌 API Endpoint Generation
**Trigger**: When user says "create endpoint [name]"

**Automated Actions**:
1. Use Express service template
2. Create Zod validation schema
3. Add error handling
4. Create service layer
5. Update API documentation

---

## Deployment Matrix

| Component | Requires Internet | Can Run Offline | Notes |
|-----------|------------------|-----------------|-------|
| Web Application | No | Yes | Browser-based PWA |
| Backend API | No | Yes | Runs locally on-prem |
| DNC Agent | No | Yes | LAN connections only |
| PostgreSQL Database | No | Yes | Local server |
| Redis Cache | No | Yes | Local server |
| Meilisearch | No | Yes | Local server |
| MinIO Storage | No | Yes | Local/NAS storage |
| Fusion 360 Integration | Yes | No | Optional plugin |
| External PLM/ERP Sync | Yes | No | Optional connectors |
| Cloud Backup | Yes | No | Alternative: local NAS |
| Package Updates | Yes | No | Alternative: offline bundles |

**Key Points:**
- ✅ **Core system runs 100% offline** on local network
- ✅ All critical operations (program management, DNC, viewing) work without internet
- ⚠️ Optional features (Fusion 360, cloud backup) require internet
- 📦 Updates can be deployed via offline signed bundles

---

## Open Questions (for you)
1) Which controllers/dialects are must-have on day one (Fanuc, Siemens, Heidenhain, Mazak…)?
2) How do you manage DNC today—via a third-party DNC system or manual? Any constraints?
3) What PLM/ERP/PDM systems should we integrate first?
4) What approval workflow and e-sign requirements apply today (e.g., ISO, AS9100)?
5) Do operators need kiosk mode or touch-optimized UIs on the floor?
6) Any DWG/3D formats beyond STEP (e.g., IGES, Parasolid, JT) required early?
7) Expected data volumes (programs, parts, users, machines) and growth?
8) Fusion 360 details: which Hub/org, projects/naming conventions, and access scopes for OAuth?

---

## Manual Mapping (Existing NC System)
We will map each existing NC system feature to our parity/upgrade plan here as we review your current manuals and workflows. Please confirm the critical workflows to prioritize.


