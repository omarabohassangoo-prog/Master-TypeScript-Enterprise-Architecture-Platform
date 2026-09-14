# BACKEND LOGIC SPECIFICATION (BE-LOGIC-001)

## 1. Backend Architecture & Responsibilities

The backend server is the **single source of truth** for data persistence, security validation, and business logic execution:

```text
HTTP Request
  ↓
Request ID & CORS & Security Middleware
  ↓
Authentication (Bearer / Session Token & Fingerprint verification)
  ↓
Authorization (RBAC & Granular Permission verification)
  ↓
Request DTO Validation (Strict type checking & payload validation)
  ↓
Controller Layer (Endpoint routing & parameter parsing)
  ↓
Application Services (AuthService, SessionService, FileService, PaymentService, NotificationService)
  ↓
Domain Logic (Business invariant checks, lockout rules, quota validation)
  ↓
Repositories (Database transactions, parameterized queries, relational constraints)
  ↓
Database Engine (PostgreSQL / Relational Data Manager)
```

## 2. External Gateway Integrations

External communication and financial services use **Enterprise Integration Patterns (EIP) Adapter Architecture**:

- **Email Service**: `EmailProvider` interface implemented with fallback SMTP & API adapter.
- **SMS Service**: `SmsProvider` interface with validation, rate-limiting, and `sms_logs` persistence.
- **WhatsApp Service**: `WhatsAppProvider` interface with template support and `whatsapp_logs`.
- **PayPal Payment Service**: Server-side order creation (`/api/v1/paypal/create-order`), capture, idempotency protection, and `paypal_transactions` ledgering.

## 3. Security & Audit Trail

- Every privileged administrative or financial action automatically writes an immutable log record into `audit_logs` with `userId`, `action`, `resource`, `ipAddress`, and `timestamp`.
- Strict path-traversal prevention and MIME-type integrity checks protect the `FileStorageVault`.
