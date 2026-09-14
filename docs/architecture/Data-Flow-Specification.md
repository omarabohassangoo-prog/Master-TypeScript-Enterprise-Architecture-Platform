# COMPLETE DATA FLOW SPECIFICATION (DATA-FLOW-001)

## 1. Master System Data Flow Pipeline

```text
USER / CLIENT INTERFACE
  ↓ (User action, form input, file upload)
FRONTEND ADAPTER LAYER (Custom Hooks: usePermissions, usePagination, useFilters, useDebounce)
  ↓ (Typed Payload & Optimistic State)
API CLIENT (src/api/client.ts with Request ID, Bearer Tokens & Error Interceptors)
  ↓ (HTTPS / REST API /api/v1/*)
EXPRESS BACKEND GATEWAY
  ↓ (CORS, Rate Limiting, Security Headers)
AUTHENTICATION & RBAC AUTHORIZATION MIDDLEWARE
  ↓ (Session verification & 20-permission server-side validation)
CONTROLLERS (src/server.ts parameter parsing & DTO validation)
  ↓
APPLICATION & DOMAIN SERVICES
  ├─ AuthService & SessionService (Password hashing, token generation, device logging)
  ├─ UserService (Lifecycle, roles assignment, profile management)
  ├─ RbacService (Role-permission mapping & security checks)
  ├─ FileService (MIME validation, hash calculation, secure disk storage)
  ├─ NotificationService (In-app, multi-channel queuing & read status)
  └─ PaymentService & Communications (PayPal EIP Adapter, Email, SMS, WhatsApp)
  ↓
REPOSITORIES (src/storage/repositories.ts with ACID Transactions & Parameterized Queries)
  ↓
POSTGRESQL RELATIONAL DATA ENGINE (14 normalized 3NF entities)
  ↓
IMMUTABLE AUDIT TRAIL (audit_logs & communication_logs)
  ↓
SERIALIZED API RESPONSE (Standardized ApiResponse<T>)
  ↓
FRONTEND QUERY CACHE & STATE REACTION
  ↓
DYNAMIC UI RE-RENDER & AUDIT REFRESH
```

## 2. Core Data Transformation & Mapping Contracts

1. **Authentication Flow**: `Credentials Input` → `AuthService.login()` → `PBKDF2 Password Check` → `Session Vault Record` → `User Context DTO` → `Client Session State`.
2. **User Lifecycle Flow**: `UserForm Input` → `CreateUserDto` → `UserService` → `Password Hash + Profile Record` → `PostgreSQL Commit` → `Audit Event Logged` → `Updated Users Table`.
3. **File Storage Flow**: `File Picker` → `MIME/Size Verification` → `FileService.uploadFile()` → `SHA-256 Checksum` → `Storage Disk Allocation` → `Database Metadata Record`.
4. **Payment Flow**: `Checkout Click` → `PaymentService.createOrder()` → `PayPal Gateway API` → `paypal_transactions Ledger (Pending)` → `Webhook/Capture Event` → `Ledger Approved` → `Audit Record`.
5. **Communications Dispatch**: `Message Compose` → `Channel Dispatcher` → `Email/SMS/WhatsApp Provider Adapters` → `Delivery Log` → `Admin Log Viewer`.
