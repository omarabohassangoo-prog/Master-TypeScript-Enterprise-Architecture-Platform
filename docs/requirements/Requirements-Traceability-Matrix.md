# REQUIREMENTS TRACEABILITY MATRIX (ISO/IEC/IEEE 29148)

| Req ID | Requirement Title | Category | Architecture Component | API Endpoint | DB Table | Frontend Page | Test ID | Compliance Status |
| :--- | :--- | :--- | :--- | :--- | :--- | :--- | :--- | :--- |
| **REQ-AUTH-001** | Secure Authentication | Functional | `AuthService` | `POST /api/v1/auth/login` | `users`, `sessions` | `LoginModal` | `AUTH-E2E-001` | `VERIFIED` |
| **REQ-AUTH-002** | Session Rotation & Lockout | Security | `SessionService` | `POST /api/v1/auth/rotate` | `sessions`, `devices` | `CustomerPortal` | `AUTH-SEC-002` | `VERIFIED` |
| **REQ-RBAC-001** | Role-Based Access Control | Security | `RbacService` | `GET/PUT /api/v1/roles` | `roles`, `permissions` | `RbacMatrixManager` | `RBAC-UNIT-001` | `VERIFIED` |
| **REQ-USER-001** | User Management & Lifecycle | Functional | `UserService` | `GET/POST /api/v1/users` | `users`, `user_profiles`| `UserManager` | `USER-API-001` | `VERIFIED` |
| **REQ-FILE-001** | Secure Storage & Anti-Traversal | Storage | `StorageService` | `POST /api/v1/files` | `files` | `FileStorageVault` | `FILE-SEC-001` | `VERIFIED` |
| **REQ-COMM-001** | Multi-Channel Dispatcher | Integration| `CommunicationService` | `POST /api/v1/communications/send` | `email/sms/wa_logs` | `CommunicationsTestBench` | `COMM-INT-001` | `VERIFIED` |
| **REQ-PAY-001** | PayPal Gateway & Webhook | Payments | `PaymentService` | `POST /api/v1/paypal/order` | `paypal_transactions` | `PayPalGatewayManager` | `PAY-E2E-001` | `VERIFIED` |
| **REQ-CONF-001** | System Settings & SEO | Config | `SettingsService` | `GET/PUT /api/v1/settings` | `settings` | `SettingsEditor` | `CONF-API-001` | `VERIFIED` |
| **REQ-AUD-001** | Immutable Audit Trail | Security | `AuditService` | `GET /api/v1/admin/audit-logs` | `audit_logs` | `AuditLogsViewer` | `AUDIT-INT-001` | `VERIFIED` |
| **REQ-DEV-001** | Dev Workbench & Kanban | Developer | `DevProjectService` | `GET/POST /api/v1/dev/tasks` | `dev_tasks`, `dev_issues` | `DeveloperDashboard` | `DEV-E2E-001` | `VERIFIED` |
