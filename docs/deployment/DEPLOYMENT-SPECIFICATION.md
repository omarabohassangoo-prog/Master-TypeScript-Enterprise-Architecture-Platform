# MASTER DEPLOYMENT & DEVOPS SPECIFICATION

## 1. Multi-Stage Container & Deployment Flow

```text
┌────────────────────────────────────────────────────────┐
│                   CI / CD PIPELINE                     │
├────────────────────────────────────────────────────────┤
│ 1. Git Checkout & Source Code Integrity Check          │
│ 2. TypeScript Static Typecheck (`tsc --noEmit`)        │
│ 3. Automated Linter & Code Standards Verification      │
│ 4. Unit & Integration Test Suites Execution            │
│ 5. Production Build Bundle (`npm run build`)           │
│ 6. Container Image Packaging & Dependency Lock         │
│ 7. Smoke Testing & Health Check Probing                │
│ 8. Zero-Downtime Deployment to Cloud Run Container     │
└────────────────────────────────────────────────────────┘
```

## 2. Environment Configuration Matrix

| Variable Name | Category | Scope | Description |
| :--- | :--- | :--- | :--- |
| `NODE_ENV` | Runtime | Server | `development` / `production` |
| `PORT` | Network | System | `3000` (Platform Ingress standard) |
| `DATABASE_URL` | Persistence | Server | PostgreSQL Connection String |
| `SESSION_SECRET` | Security | Server | Cryptographic token signature secret |
| `PAYPAL_CLIENT_ID` | Gateway | Server | PayPal REST API Client Key |
| `PAYPAL_CLIENT_SECRET`| Gateway | Server | PayPal Secret (Never exposed to UI) |
| `PAYPAL_MODE` | Gateway | Server | `sandbox` / `live` |
