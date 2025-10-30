# MillPoint NC - Frontend Preview

This is a **working frontend preview** of the NC Program Management System to demonstrate the UI/UX vision and validate we're aligned on the approach.

## What's Included

### 🎨 Tech Stack Demonstrated
- **React 18** with TypeScript
- **Vite** for fast development
- **Tailwind CSS** for modern, responsive styling
- **Lucide React** for beautiful icons
- Component-based architecture ready to scale

### 📱 Views Implemented

1. **Dashboard** (`/`)
   - System overview with key metrics
   - Recent activity feed
   - Machine status overview
   - Clean, data-driven design

2. **NC Programs List**
   - Searchable, filterable program list
   - Status badges (Released, In Review, Draft)
   - Associated files indicators (STEP, DXF, Setup Sheets)
   - Quick actions (view, download, send to machine)
   - Shows metadata: part number, revision, machine, operation, material

3. **Program Detail View**
   - Full NC code display with syntax highlighting
   - Integrated viewers for STEP/DXF (UI ready, viewer engines next phase)
   - Fusion 360 integration mockup
   - Version history
   - Approval workflow status
   - Comments and collaboration
   - Comprehensive metadata sidebar

4. **Setup Sheet Preview** (Mobile-Captured)
   - Template-driven forms
   - Photo capture with annotations
   - Safety checklists
   - Tool lists
   - Mobile device indicators
   - Shows the offline-first mobile app vision

### ✨ Key Features Demonstrated

- **Modern, Clean UI**: Professional design with excellent information hierarchy
- **Responsive Layout**: Works on desktop and tablet (mobile would use native app)
- **Search & Filtering**: Fast, intuitive program discovery
- **Status Management**: Visual workflow states with color coding
- **File Associations**: Clear links between NC programs, CAD, drawings, and setup docs
- **Collaboration Ready**: Comments, approvals, audit trails
- **Dark Code Editor**: Syntax-highlighted NC code display
- **Icon-Driven UX**: Clear visual language throughout

## Running the Preview

```bash
npm install
npm run dev
```

Then open http://localhost:5173 in your browser.

## What to Try

1. **Click around the navigation** - Dashboard, NC Programs, Setup Sheets
2. **Search programs** - Try searching for part numbers, machines, or operations
3. **Filter by status** - Released, In Review, Draft
4. **Click on a program** - See the detailed view with NC code
5. **Check the Setup Sheet** - Click "Setup Sheets" then the first card
6. **Notice the UX patterns** - Status badges, associated file icons, quick actions

## Mock Data

The preview uses realistic mock data to demonstrate:
- 6 NC programs with varying statuses
- 4 machines with different types
- Recent activity feed
- Full metadata and version history
- Setup sheet with photos and checklists

## Next Steps

If you like this direction, we'll:
1. ✅ Confirm tech stack alignment
2. 🔧 Build backend API (NestJS + PostgreSQL)
3. 📦 Implement real data storage and versioning
4. 🎨 Integrate actual STEP/DXF viewers (OpenCascade)
5. 📱 Build mobile app for setup sheets (React Native)
6. 🔌 Add DNC connectivity (Go service)
7. 🔐 Implement auth and RBAC (Keycloak)

## Feedback Welcome!

This preview exists to validate:
- ✅ Is the UI direction what you envisioned?
- ✅ Does the workflow make sense?
- ✅ Are we showing the right information?
- ✅ Is the tech stack appropriate?

Let me know what you think and what adjustments you'd like to see!

