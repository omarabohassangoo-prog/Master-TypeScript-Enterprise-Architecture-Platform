# STORAGE LAYER COMPLETE SPECIFICATION (STORAGE-LAYER-001)

## 1. Storage Architecture Overview

The Storage Layer provides a resilient, type-safe, and modular persistence abstraction across multiple media:

```text
┌────────────────────────────────────────────────────────┐
│                   STORAGE LAYER                        │
├────────────────────────────────────────────────────────┤
│ 1. PostgreSQL Relational Engine (3NF, ACID, 14 Tables) │
│ 2. Parameterized Repositories (Repository Pattern)     │
│ 3. Atomic Transaction Manager (BEGIN / COMMIT / ROLLBACK)│
│ 4. Migration & Schema Versioning Engine                │
│ 5. Session & Device State Store                        │
│ 6. Secure File Storage Vault (Anti-traversal, SHA-256) │
│ 7. JSON Metadata Store (System, SEO, Menus, Routes)    │
│ 8. Audit & Communication Logs (Immutable Ledger)       │
│ 9. Secrets Management (.env & ConfigService)           │
│ 10. Health Check & Observability (GET /api/v1/health/*)│
└────────────────────────────────────────────────────────┘
```

## 2. Core Relational Entities & Tables

1. **users**: Primary user identity, PBKDF2 hash, status, verification dates.
2. **roles & permissions**: RBAC matrix with 20 granular authorization rules.
3. **user_roles & role_permissions**: Many-to-many relationship mapping.
4. **sessions & devices**: Secure hashed tokens, expiration timestamps, IP & User-Agent auditing.
5. **user_profiles**: User localized preferences, avatar links, and contact info.
6. **files & file_versions**: File metadata, storage path, MIME classification, SHA-256 hash, and ownership.
7. **notifications & notification_reads**: Multi-channel notification queue and delivery tracking.
8. **paypal_users & paypal_transactions**: Financial ledger with idempotency keys and capture status.
9. **settings**: Dynamic application & SEO key-value configuration.
10. **audit_logs**: Immutable security trail for privileged actions.
11. **email_logs, sms_logs, whatsapp_logs**: External communications dispatch records.

## 3. Storage Security & Anti-Corruption Rules

- **Zero Direct SQL in Controllers**: All queries strictly channeled through typed repositories (`src/storage/repositories.ts`).
- **Path Traversal Shield**: File paths normalized and sandboxed inside protected storage directories.
- **No Secrets in Bundle/Git**: Credentials exclusively loaded via environment variables and validated at boot time.
- **ACID Transactions**: Financial, user registration, and cascading role assignments execute within atomic transaction boundaries.
