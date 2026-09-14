# MASTER ARCHITECTURAL DIAGRAMS SPECIFICATION

## 1. System Context Diagram (C1 Level)

```text
┌─────────────────────────────────────────────────────────────────────────┐
│                           SYSTEM CONTEXT (C1)                           │
├─────────────────────────────────────────────────────────────────────────┤
│                                                                         │
│   [ Super Admin / Admin ]     [ Developer Team ]     [ Client / User ]  │
│              │                        │                      │          │
│              └────────────────────────┼──────────────────────┘          │
│                                       │ (HTTPS / RTL Arabic-First UI)   │
│                                       ▼                                 │
│                    ┌─────────────────────────────────────┐              │
│                    │     Enterprise Web Application      │              │
│                    │     (React + TypeScript + Vite)     │              │
│                    └──────────────────┬──────────────────┘              │
│                                       │ (REST API /api/v1/* JSON)       │
│                                       ▼                                 │
│                    ┌─────────────────────────────────────┐              │
│                    │      API Gateway & Core Server      │              │
│                    │       (Node.js + TypeScript)        │              │
│                    └──────────────────┬──────────────────┘              │
│                                       │                                 │
│          ┌────────────────────────────┼────────────────────────────┐    │
│          ▼                            ▼                            ▼    │
│  ┌──────────────┐             ┌──────────────┐             ┌──────────┐ │
│  │  PostgreSQL  │             │ Secure File  │             │ External │ │
│  │   Database   │             │Storage Vault │             │ Gateways │ │
│  │  (14 Tables) │             │ (Local / S3) │             │(Adapters)│ │
│  └──────────────┘             └──────────────┘             └────┬─────┘ │
│                                                                 │       │
│                                           ┌─────────────────────┼─────┐ │
│                                           ▼                     ▼     ▼ │
│                                         PayPal                Email  SMS│
│                                                               WhatsApp  │
└─────────────────────────────────────────────────────────────────────────┘
```

## 2. Container Diagram (C2 Level)

```text
┌─────────────────────────────────────────────────────────────────────────┐
│                         CONTAINER DIAGRAM (C2)                          │
├─────────────────────────────────────────────────────────────────────────┤
│                                                                         │
│  1. Single-Page Application (Frontend Container)                        │
│     - Technology: React 18, TypeScript, Tailwind CSS                    │
│     - Modules: Auth UI, Admin UI, Developer UI, Client UI, Profile UI   │
│     - State: React Context + Custom Hooks + Centralized API Client      │
│                                                                         │
│  2. API Application (Backend Container)                                 │
│     - Technology: Express.js, TypeScript, TSX                           │
│     - Structure: Controllers -> Services -> Repositories -> Data Engine │
│     - Security: RBAC Guard, Rate Limiting, PBKDF2 Password Hashing      │
│                                                                         │
│  3. Relational Persistence Container                                    │
│     - Technology: PostgreSQL (3NF Schema, Foreign Keys, Indexes)        │
│     - Storage: Users, Sessions, RBAC, Settings, Files, Ledgers, Audits  │
│                                                                         │
│  4. File Storage Vault Container                                        │
│     - Technology: Anti-traversal File Service with SHA-256 Checksums    │
│     - Scope: Public, Private, Temporary, Generated Assets               │
└─────────────────────────────────────────────────────────────────────────┘
```

## 3. Sequence Diagrams (Core Business Flows)

### Flow A: User Authentication & Session Creation

```text
User            Frontend               API Gateway          AuthService        Database
 │                 │                        │                    │                 │
 │── Enter Creeds ─▶│                        │                    │                 │
 │                 │── POST /auth/login ───▶│                    │                 │
 │                 │                        │─── login(creds) ──▶│                 │
 │                 │                        │                    │── Find User ───▶│
 │                 │                        │                    │◀── User Hash ───│
 │                 │                        │                    │                 │
 │                 │                        │                    │ [Verify PBKDF2] │
 │                 │                        │                    │                 │
 │                 │                        │                    │── Create Sess ─▶│
 │                 │                        │                    │◀── Sess ID ─────│
 │                 │                        │                    │                 │
 │                 │                        │                    │── Log Audit ───▶│
 │                 │                        │◀── Token & Profile ─│                 │
 │                 │◀── 200 OK + User Context│                    │                 │
 │◀── Render Home ─│                        │                    │                 │
```

### Flow B: PayPal Order & Webhook Capture

```text
Client          Frontend               PaymentService        PayPal Provider       Database
 │                 │                        │                     │                    │
 │── Click Pay ───▶│                        │                     │                    │
 │                 │── POST /paypal/order ─▶│                     │                    │
 │                 │                        │── Create Order ────▶│                    │
 │                 │                        │◀── Order ID & Link ─│                    │
 │                 │                        │── Save Pending ─────────────────────────▶│
 │                 │◀── Approval URL ───────│                                          │
 │── Approves Pay ─▶│ (Redirects/Modal)     │                                          │
 │                 │                        │                                          │
 │                 │                        │◀── Webhook: PAYMENT.CAPTURE.COMPLETED ──│
 │                 │                        │── Verify Signature ─▶│                   │
 │                 │                        │── Update to 'approved' ─────────────────▶│
 │                 │                        │── Dispatch Notification & Audit ────────▶│
```
