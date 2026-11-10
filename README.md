# Emet AI — Vendor Audit & PayPal Execution Desk

> **PayPal AI Hackathon Submission**  

Emet AI (inspired by the Hebrew concept of *Emet* — Truth & Reliability) is an enterprise-grade agentic financial assistant that automates incoming vendor bill auditing, forensic arithmetic reconciliation, statutory Indian GST compliance verification, and dual programmatic execution using PayPal's Invoicing v2 and Payouts API.

---

## ⚡ Key Highlights & Core Capabilities

- **Multi-modal OCR & Forensic Analysis**: Uses Google Gemini 3.8 Flash (`@google/genai`) to parse receipts, tax invoices, and handwritten bills into structured JSON.
- **Indian Market Localization & Statutory Tax Compliance**:
  - Native currency: **Indian Rupee (INR / ₹)** with Indian numeral formatting (`en-IN`, e.g., `₹ 1,56,645.00`).
  - **15-character GSTIN** validation (State code prefix + PAN + Entity number + 'Z' + Checksum).
  - Multi-tier GST calculation engine (0%, 5%, 12%, 18%, 28%) with support for CGST + SGST (intra-state) and IGST (inter-state based on Place of Supply).
  - HSN / SAC statutory service code mapping.
- **Agentic Commerce Decision Matrix ("AI Behind the Wheel")**:
  - Evaluates every bill against enterprise departmental budget policies.
  - **Autonomous Auto-Approval**: Invoices with 0 arithmetic errors, valid GSTIN, valid PayPal recipient, and within autonomous limits (e.g. ₹35,000) are cleared for instant headless payout.
  - **Human-in-the-Loop (HITL) Guardrail**: Invoices with arithmetic discrepancies, unapplied discounts, or high-value caps trigger accountant review before financial disbursement.
- **Dual PayPal Execution Paths**:
  - **PayPal Invoicing API (v2)**: Generates official draft invoices, merchant payment links, and scannable QR codes.
  - **PayPal Payouts API (v1)**: Dispatches programmatic vendor disbursements directly to vendor PayPal accounts (`/v1/payments/payouts`).
  

---

## 🏗️ Architecture & Flow

```
[Merchant / Bill Upload]
         │ (Image / PDF / Camera)
         ▼
[Server-side Multi-Modal OCR] ──▶ Gemini 3.8 Flash (Schema-enforced JSON extraction)
         │
         ▼
[Forensic Audit Engine]
   ├── Line-Item Math: Quantity × Unit Price == Line Total
   ├── Aggregation: Sum(Line Totals) == Subtotal
   ├── Tax Verification: Subtotal × GST Rate == Stated Tax
   ├── GSTIN Format & Place of Supply Verification
   └── Departmental Budget Ceiling & Duplicate Check
         │
         ├── [Clean & ≤ Auto-Limit] ──▶ Autonomous PayPal Payout API (/v1/payments/payouts)
         └── [Discrepancies / High Value] ──▶ HITL Override Desk ──▶ PayPal Invoicing v2
```

---

## 🔒 Security & Infrastructure Architecture

### 1. Secrets Management & Environment Isolation
- **Server-Side Only Credentials**: Sensitive credentials (`GEMINI_API_KEY`, `PAYPAL_CLIENT_ID`, `PAYPAL_CLIENT_SECRET`) are strictly maintained on the server-side (`server.ts`).
- **No Client-Side Leaks**: Frontend code (`src/*`) never accesses or stores secret keys in `VITE_*` variables.
- **Git Safety**: Root `.env` is ignored via `.gitignore` (`.env*`, `!.env.example`).
- **Placeholder Example**: `.env.example` provides documentation without committing any live credentials.

### 2. Input Sanitization & XSS Defense
- Dynamic text is rendered through React's virtual DOM (preventing `dangerouslySetInnerHTML` injections).
- Base64 payloads are verified for valid image MIME types (`image/jpeg`, `image/png`, `image/webp`).
- Numeric financial values are sanitized with strict rounding (`Math.round(val * 100) / 100`) to eliminate floating-point drift.

### 3. Dual Sandbox & Live PayPal Modes
- **Instant Demo Mode**: Includes simulated responses with authentic PayPal API payload formats for quick evaluation and offline presentations.
- **Real Sandbox Mode**: Fully connects to `https://api-m.sandbox.paypal.com` with client credentials OAuth flow (`grant_type=client_credentials`).

---

## 🌐 Live Hosted Application

The full-stack application is live and hosted on Google Cloud Run:
- **Primary Hosted Application**: [https://ais-dev-ldwq3yzc3jtexztrf67s42-786713530731.asia-southeast1.run.app](https://ais-dev-ldwq3yzc3jtexztrf67s42-786713530731.asia-southeast1.run.app)
---

## 🟢 Live PayPal Sandbox Verification Proof

The live hosted site connects directly to the official PayPal Sandbox API (`https://api-m.sandbox.paypal.com`):

```json
{
  "status": "ok",
  "service": "Emet AI Backend",
  "paypalConfigured": true,
  "paypalMode": "sandbox",
  "paypalClientIdMasked": "AebFDU..._VUR",
  "features": ["orders_create", "orders_capture", "invoicing_v2", "payouts_v1", "webhooks"]
}
```

- **Live OAuth Bearer Token**: Verified `200 OK` via `https://api-m.sandbox.paypal.com/v1/oauth2/token`.
- **Live Orders v2 Checkout**: Verified live Sandbox approval URLs generated on `https://www.sandbox.paypal.com/checkoutnow?token=...`.
- **Live Invoicing v2**: Verified draft invoice creation with merchant payment QR codes.
- **Live Webhooks Listener**: Verified listener on `POST /api/paypal/webhook` capturing live payment lifecycle events.

---

## ⚡ 1-Command Terminal Setup for Hackathon Judges

To run the entire full-stack application locally in a single command:

### Option 1: Execute Setup Script
```bash
git clone <repo-url> && cd <repo> && ./setup.sh
```

### Option 2: 1-Line Terminal Command
```bash
git clone <repo-url> && cd <repo> && npm install && npm run build && npm start
```

The application will build production assets and launch the co-hosted Express + Vite server at:
👉 **`http://localhost:3000`**

---

## 📜 License
Apache-2.0

