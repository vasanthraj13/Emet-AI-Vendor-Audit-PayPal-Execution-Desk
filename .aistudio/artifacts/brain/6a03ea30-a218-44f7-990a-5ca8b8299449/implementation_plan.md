# Dark Fintech UI Overhaul & Design System Specification

Transform Vendor AI into a world-class, developer-grade fintech workspace inspired by Linear, Stripe, and Vercel. This update replaces all previous light/rose surfaces with a deep slate background (`#090D16`), floating glass panels, high-contrast monospace typography, contextual status glows (Electric Blue, Emerald, Amber, Rose), and high-velocity gradient action buttons.

### User Review & Critical Decisions

> [!IMPORTANT]
> The following design decisions were explicitly clarified and confirmed in Phase 1:

- **Confirmed Decision 1 (Simulated Receipt Style)**: The simulated receipt document in the Document Viewer will be rendered as a **dark digital receipt** featuring monospace JetBrains typography, subtle glowing dividers, and high-contrast status markers (rather than physical white paper).
- **Confirmed Decision 2 (Ambient Canvas Lighting)**: The workspace background will maintain a **pure deep slate monochrome** (`#090D16` / `bg-slate-950`) with zero ambient radial mesh gradients, delivering an ultra-crisp, distraction-free environment.
- **Confirmed Decision 3 (Color Tokens & Status Indicators)**:
  - Base canvas: `#090D16` (`bg-slate-950`)
  - Containers: `bg-slate-900/60 backdrop-blur-xl border border-slate-800/80 rounded-xl shadow-sm`
  - Headers & bold numbers: `text-slate-50`
  - Subtitles & metadata: `text-slate-400`
  - Monetary values & codes: `font-mono` (`JetBrains Mono`) with `tabular-nums`
  - PayPal Sandbox Status: Electric Blue (`text-sky-400` with pulsating `bg-sky-500` status dot)
  - HITL Warning Banner: Ambient Amber glow (`bg-amber-500/10 border-amber-500/30 text-amber-400`)
  - Validated Ledger: Emerald Green (`bg-emerald-500/10 text-emerald-400 border-emerald-500/30`)
  - Math Discrepancy / Error: Rose Red (`bg-rose-500/10 text-rose-400 border-rose-500/30`)
  - Primary Action Buttons: `bg-gradient-to-r from-sky-500 to-blue-600 hover:from-sky-400 hover:to-blue-500 text-white font-medium shadow-md shadow-sky-500/20 active:scale-[0.98] transition-all`
  - Ghost & Secondary Buttons: `bg-slate-800/60 hover:bg-slate-800 text-slate-200 border border-slate-700/50`

---

### 1. Overview & Core Concept

- **What It Does**: Upgrades the entire visual layer of Vendor AI to a professional dark fintech console. Keeps all functional AI capabilities intact—including Gemini 3.8 Flash multi-modal OCR, Indian GST compliance engines, autonomous agent decision policies, and dual PayPal API execution (Invoicing v2 & Payouts).
- **Target Audience / Persona**: Enterprise finance controllers, merchants, and procurement leads managing multi-vendor disbursements and tax compliance in high-velocity operating environments.
- **Key Value**: Delivers fatigue-reducing, high-contrast dark mode aesthetics with instantaneous visual scanning of financial variances, statutory tax flags, and payment status indicators.

---

### 2. User Experience & Visual Design

#### A. Workspace Layout & Depth Hierarchy
- **Canvas Base**: Full-screen `#090D16` (`bg-slate-950`) background. Zero distracting background radial blobs.
- **Surface Elevation**: Single elevation depth using semi-transparent frosted glass (`bg-slate-900/60 backdrop-blur-xl border border-slate-800/80 rounded-xl shadow-sm`).
- **Interactive States**: Hover elevates card borders from `border-slate-800/80` to `border-slate-700` or `border-sky-500/50` on active selection.

#### B. Component-by-Component Dark Fintech Styling
1. **Top Floating Navigation (`Header.tsx`)**:
   - Container: `border-b border-slate-800/80 bg-slate-950/80 backdrop-blur-md`
   - Brand Mark: Gradient icon tile `bg-gradient-to-r from-sky-500 to-blue-600 text-white`
   - Breadcrumb Trail: `text-slate-50 font-bold` for title, `text-slate-400` for dividers, `font-mono text-sky-400 bg-slate-900/80 border border-slate-800` for invoice badges.
   - Live PayPal Indicator: `text-sky-400 bg-sky-500/10 border border-sky-500/30` with pulsating `bg-sky-500` dot.
   - Quick Action Buttons: `bg-slate-800/60 hover:bg-slate-800 text-slate-200 border border-slate-700/50`.

2. **Ingestion & Fixtures Strip (`UploadZone.tsx`)**:
   - Presets Row: 3 sleek test fixture cards with accent borders (`border-l-rose-500`, `border-l-amber-500`, `border-l-emerald-500`), subtle selection rings (`ring-2 ring-sky-500`), and dark slate surfaces (`bg-slate-900/60`).
   - File Dropzone: Frosted glass container (`bg-slate-900/40 border-2 border-dashed border-slate-800 hover:border-sky-500/60`).
   - Action Buttons: "Browse File" with primary sky gradient; "Camera" with secondary slate styling.

3. **Real-Time Audit Metrics Strip (`AuditMetricsBar.tsx`)**:
   - Surface: `bg-slate-900/60 backdrop-blur-xl border border-slate-800/80`.
   - Metrics: Off-white tabular values (`text-slate-50 font-mono`), muted titles (`text-slate-400`).
   - "Auto-Fix All" CTA: Sky-to-blue gradient button with keyboard shortcut badge.

4. **Autonomous Agent Decision Matrix (`AgentDecisionPanel.tsx`)**:
   - Container: `bg-slate-900/60 backdrop-blur-xl border border-slate-800/80`.
   - Status Banners:
     - Auto-Approved: `bg-emerald-500/10 text-emerald-400 border border-emerald-500/30`
     - Human-in-the-Loop (HITL): `bg-amber-500/10 text-amber-400 border border-amber-500/30`
     - Halted/Rejected: `bg-rose-500/10 text-rose-400 border border-rose-500/30`
   - Terminal Execution Trace: Deep obsidian chassis (`bg-slate-950 border border-slate-800/90`) with colored status dots and monospace log outputs.

5. **Document Viewer (`DocumentViewer.tsx`)**:
   - Toolbar: `bg-slate-950/70 border-b border-slate-800 text-slate-300`.
   - Viewer Canvas: `bg-slate-950/90 border border-slate-800`.
   - Digital Receipt Preview: Dark cyber-fintech receipt card (`bg-slate-900 border border-slate-700/80`) with monospace items, glowing status borders, and neon cyan barcode highlights.

6. **Audit Findings & Alerts (`AuditAlerts.tsx`)**:
   - Finding Cards: `bg-slate-900/60 border border-slate-800/80 hover:bg-slate-900/90`.
   - Severity tags: Emerald (`bg-emerald-500/10 text-emerald-400`), Amber (`bg-amber-500/10 text-amber-400`), Rose (`bg-rose-500/10 text-rose-400`).
   - 1-Click Fix CTA: `bg-slate-800/80 hover:bg-slate-700 text-slate-200 border border-slate-700`.

7. **Financial Ledger & Editor (`InvoiceEditor.tsx`)**:
   - Form Inputs & Selects: `bg-slate-950/70 border border-slate-800 text-slate-100 placeholder-slate-500 focus:border-sky-500 focus:ring-1 focus:ring-sky-500 font-mono`.
   - Line Items Table: Dark header row (`bg-slate-950/60 text-slate-400`), hoverable row strips (`hover:bg-slate-800/40 border-b border-slate-800/60`).
   - Summary Card: Dark card with bold totals (`text-slate-50 font-mono text-xl`).
   - Primary CTA: "Issue PayPal India Invoice" in vibrant gradient (`bg-gradient-to-r from-sky-500 to-blue-600 hover:from-sky-400 hover:to-blue-500 text-white font-medium shadow-md shadow-sky-500/20`).

8. **Modals & Drawers (`PayPalCheckoutModal`, `PayPalPayoutModal`, `PayPalConfigModal`, `ArchitectureModal`, `BudgetPolicyDrawer`, Command Palette, JSON Inspector)**:
   - Backdrop: `bg-black/70 backdrop-blur-md`.
   - Surface: `bg-slate-900/95 backdrop-blur-xl border border-slate-800/80 rounded-2xl shadow-2xl text-slate-100`.

---

### 3. Key Product Decisions & Trade-Offs

- **Decision 1: Elimination of Previous Rose/Plum Tones**:
  - *Chosen Approach*: Complete replacement of `#dfb6b2` and `#4c1d3d` with the standard Tailwind Slate / Zinc dark palette (`#090D16`, `slate-900`, `slate-800`, `slate-700`).
  - *Why*: Conforms strictly to enterprise fintech conventions (Stripe / Linear / Vercel), maximizes readability in low-light environments, and eliminates visual clash with financial status colors.
- **Decision 2: Glass Surfaces over Solid Black**:
  - *Chosen Approach*: `bg-slate-900/60 backdrop-blur-xl border border-slate-800/80` instead of opaque `#000000` pitch-black containers.
  - *Why*: Adds depth and physical layering while preventing visual blockiness.
- **Decision 3: Monospace Typography Strictness**:
  - *Chosen Approach*: Strict application of `font-mono` (`JetBrains Mono`) for all financial amounts, percentages, invoice identifiers, and timestamps.
  - *Why*: Avoids layout jitter and enables exact vertical decimal alignment for rapid bookkeeping verification.

---

### 4. Technical Architecture & Data Strategy

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                      VENDOR AI FINTECH WORKSPACE ARCHITECTURE                │
├─────────────────────────────────────────────────────────────────────────────┤
│                                                                             │
│  [Top Header: Brand · Breadcrumbs · Live PayPal Indicator · Modal Triggers] │
│                                                                             │
│  ┌───────────────────────────────────────────────────────────────────────┐  │
│  │ Ingestion Strip: 3 Test Fixtures (Accent Lines) + Drag-and-Drop Zone  │  │
│  └───────────────────────────────────────────────────────────────────────┘  │
│                                                                             │
│  ┌───────────────────────────────────────────────────────────────────────┐  │
│  │ Audit Metrics Bar: Integrity Score · Discrepancy Count · Stated Gap   │  │
│  └───────────────────────────────────────────────────────────────────────┘  │
│                                                                             │
│  ┌───────────────────────────────────────────────────────────────────────┐  │
│  │ Autonomous Agent Decision Matrix: Policy Engine · HITL Banner · Trace │  │
│  └───────────────────────────────────────────────────────────────────────┘  │
│                                                                             │
│  ┌───────────────────────────────┐   ┌───────────────────────────────────┐  │
│  │ Document Viewer (Col 5)       │   │ Invoice Ledger & Taxes (Col 7)    │  │
│  │ - Optical Canvas (Zoom/Rotate)│   │ - Supplier & Buyer GST Details    │  │
│  │ - Dark Digital Receipt        │   │ - Tabular Line Items Grid         │  │
│  │ - Forensic Findings Alerts    │   │ - Indian GST Breakdown & Totals   │  │
│  │                               │   │ - Primary PayPal Execution CTAs   │  │
│  └───────────────────────────────┘   └───────────────────────────────────┘  │
│                                                                             │
│  [Footer: Vendor AI Branding · Status Dot · Agentic Commerce v2 Protocol]    │
└─────────────────────────────────────────────────────────────────────────────┘
                                      │
                                      ▼
                      ┌───────────────────────────────┐
                      │    Express / Node.js Backend  │
                      │  - /api/ocr/parse (Gemini 3.8)│
                      │  - /api/paypal/create-invoice │
                      │  - /api/paypal/payout         │
                      └───────────────────────────────┘
```

#### State & Style Synchronization Matrix
- **Global Theme Variables (`src/index.css`)**:
  - `body`: `background-color: #090D16; color: #f8fafc;`
  - Scrollbars: Dark slate track (`#0f172a`) and thumb (`#334155 hover:#38bdf8`)
- **HTML Container (`index.html`)**:
  - `body`: `bg-[#090D16] text-slate-100 antialiased selection:bg-sky-500 selection:text-white min-h-screen`
- **Component Integrity**:
  - Zero loss of existing API calls, OCR parsing, GST calculations, or state hooks.
  - Zero modification to functional backend logic.
