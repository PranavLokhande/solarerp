# HeliosOps — Enterprise Solar ERP, CRM & Operations Platform

An enterprise-grade, production-oriented Operating System engineered for Indian rooftop solar Engineering, Procurement, and Construction (EPC) companies.

HeliosOps unifies fragmented manual paperwork, phone inquiries, WhatsApp chats, Excel spreadsheets, and disjointed departmental operations into a high-precision digital ERP platform.

---

## 1. Complete Solar EPC Lifecycle Workflow

```mermaid
flowchart LR
    A[Lead Intake & CRM] --> B[Site Survey & Roof Assessment]
    B --> C[Solar Design & BOQ Calculation]
    C --> D[Quotation & Discount Gate]
    D --> E[Customer Acceptance & Work Order]
    E --> F[Document Vault & KYC Review]
    F --> G[DISCOM & PM Surya Ghar Portal]
    G --> H[Financing & Loan Sanction]
    H --> I[Warehouse Stock & Material Dispatch]
    I --> J[Physical EPC Installation]
    J --> K[Quality & Safety Inspection]
    K --> L[Net Metering & Grid Sync]
    L --> M[Commissioning & Subsidy Claim]
    M --> N[Invoicing, Ledger & AMC Handover]
```

---

## 2. Mandatory Enterprise Architecture & Tech Stack

### Frontend Client
- **Framework**: React 18 with Vite and TypeScript.
- **Styling**: Tailwind CSS with enterprise Navy (`#102a43`) and Solar Gold (`#f59e0b`) design language.
- **Icons**: Lucide React.
- **Routing & State**: React Router v6, TanStack Query, React Hook Form, and Zod.
- **Data Visualizations**: Recharts.
- **Persona Quick-Switch**: One-click interactive role switcher directly in the header for effortless verification across all 22 roles.

### Backend API Server
- **Runtime**: Node.js LTS (v22+) with Express.js and TypeScript.
- **Architecture**: Modular feature-based services, controllers, models, and centralized validation.
- **REST APIs**: Versioned at `/api/v1/*`.
- **Database**: MongoDB with Mongoose ODM, index optimization, and relationship integrity.
- **Security**: Short-lived JWT, HttpOnly refresh cookies with token rotation, bcrypt password hashing, helmet security headers, CORS allowlists, rate limiting, and RBAC authorization middleware.
- **Financial Precision**: All monetary calculations are performed in **integer paise** (₹1 = 100 paise) to prevent floating-point rounding errors. Double-entry immutable financial ledger.
- **Compliance & Privacy**: Aadhaar and PAN masking, redacted sensitive audit logs.

---

## 3. Demo Persona Accounts for Testing

The database comes pre-seeded with realistic Indian solar EPC operational data across all key roles:

| Role | Email | Password | Primary Permissions & Capabilities |
| :--- | :--- | :--- | :--- |
| **Super Admin** | `admin@heliosops.com` | `Admin@2026` | Universal administrative access, audit logs, user management |
| **Sales Manager** | `sales.manager@heliosops.com` | `Solar@2026` | Lead qualification, discount approvals (>5%), quotation overrides |
| **Sales Executive** | `sales.exec@heliosops.com` | `Solar@2026` | Lead intake, CRM interactions, quotation creation |
| **Site Survey Engineer** | `survey.eng@heliosops.com` | `Solar@2026` | Roof assessment form, shading analysis, feasibility decisions |
| **Design Engineer** | `design.eng@heliosops.com` | `Solar@2026` | Module/inverter sizing, automated Bill of Quantities (BOQ) |
| **Project Manager** | `project.mgr@heliosops.com` | `Solar@2026` | Project 360 workspace, stage progression, crew assignment |
| **Installation Technician** | `tech.lead@heliosops.com` | `Solar@2026` | Field app checklists (Structure, Panels, Inverter, Earthing) |
| **QA Engineer** | `qa.lead@heliosops.com` | `Solar@2026` | Pre-commissioning quality & safety inspection checklists |
| **Finance Manager** | `finance.mgr@heliosops.com` | `Solar@2026` | Milestone invoices, payment verification, immutable ledger |
| **Warehouse Manager** | `warehouse.mgr@heliosops.com` | `Solar@2026` | Stock master, goods receipt inward, Delivery Challan dispatches |
| **DISCOM Coordinator** | `discom.coord@heliosops.com` | `Solar@2026` | PM Surya Ghar portal tracker, net meter filing, subsidy status |
| **Customer Portal** | `rajesh.sharma@gmail.com` | `Customer@2026` | Customer self-service: installation tracker, invoices, warranty |

---

## 4. Quick Start & Setup Instructions

### Prerequisites
- Node.js v20+ / v22+
- MongoDB 7.0+ running locally on port 27017 or MongoDB Atlas connection string.

### 1. Backend Setup
```bash
cd server
npm install
# Seed the database with realistic demo accounts and active projects
npm run seed
# Start the development API server (runs on http://localhost:5000)
npm run dev
```

### 2. Frontend Setup
```bash
cd client
npm install
# Start the Vite development server (runs on http://localhost:5173)
npm run dev
```

### 3. Automated Testing
```bash
cd server
npm test
```

### 4. Docker Deployment
```bash
docker-compose up --build -d
```
Access the application at `http://localhost:80` with backend API proxied at `http://localhost:80/api/v1`.

---

## 5. API Endpoints Map (`/api/v1`)

- `POST /auth/login` — Authenticate by email or employee ID
- `POST /auth/refresh` — Refresh access token via cookie
- `GET /auth/me` — Current authenticated user profile
- `GET /dashboard/stats` — Live KPI counters and stage distribution
- `GET /leads` / `POST /leads` — Pipeline management and lead creation
- `POST /leads/:id/convert` — Deduplicated customer and property creation
- `GET /surveys` / `PUT /surveys/:id` — Field survey form and feasibility sign-off
- `GET /designs` / `POST /designs` — Automated solar BOQ generator
- `GET /quotations` / `POST /quotations` — Commercial quotation generator
- `PUT /quotations/:id/approve` — Managerial discount gate
- `POST /quotations/:id/accept` — Work Order signing and Project initiation
- `GET /projects` / `PUT /projects/:id/stage` — Project operations 360 workspace
- `GET /documents` / `POST /documents/upload` — Secure Document Vault
- `POST /documents/name-correction` — DISCOM name mismatch tracking workflow
- `GET /regulatory` / `PUT /regulatory/:id/stage` — PM Surya Ghar & DISCOM stage tracking
- `GET /inventory` / `POST /inventory/inward` — Stock master & goods receipt
- `POST /inventory/dispatch` — Material dispatch and delivery challan issuance
- `POST /installation/stage-complete` — Installation stage checklist sign-off
- `POST /installation/inspect` — Quality Assurance verification
- `POST /commissioning/net-meter` — Net meter installation logging
- `POST /commissioning/synchronize` — Commissioning certificate & warranty generation
- `GET /billing/invoices` / `POST /billing/invoices` — Milestone billing
- `POST /billing/payments` — Verified payment receipts & ledger debit/credit posting
- `GET /billing/ledger/:customerId` — Immutable customer financial ledger
- `GET /support/tickets` / `POST /support/tickets` — Service tickets and SLA engine
- `GET /audit/logs` — Comprehensive compliance audit trail

---

## 6. Security & Financial Policies

1. **Integer Currency Storage**: Never use IEEE floating-point numbers for financial calculations. All figures are stored in integer paise.
2. **Double-Entry Financial Ledger**: Invoices post a `DEBIT` entry; verified payments post a `CREDIT` entry. Running balance is mathematically reconciled.
3. **Government Subsidy Separation**: Subsidies are tracked as receivables from state/nodal agencies and never counted as cash received from the customer until verified bank credit confirmation.
4. **Data Protection**: Sensitive personal information (Aadhaar, PAN) is masked on standard screens and never written to application logs.
