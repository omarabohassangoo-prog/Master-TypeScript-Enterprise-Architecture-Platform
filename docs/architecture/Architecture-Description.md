# ARCHITECTURE DESCRIPTION (ISO/IEC/IEEE 42010:2022)

## 1. System Viewpoints
- **Context View**: Users & Frontends connect via HTTPS/REST to Node.js/TypeScript Core, communicating with PostgreSQL, Local File Vaults, and External Gateway Adapters.
- **Logical View**: Strict layering: Presentation -> API Client -> Controllers -> Services -> Repositories -> Database/Providers.
- **Data View**: 3NF Normalized Relational Schema with 14 entities and referential integrity constraints.
- **Security View**: Defense-in-depth: RBAC middleware, OWASP ASVS verification, parameterization, and brute-force lockout.

## 2. Architectural Decision Records (ADRs)
- **ADR-001**: Relational PostgreSQL Data Engine for ACID compliance and normalized consistency.
- **ADR-002**: React 18 + Vite + TypeScript for type-safe client-side UI rendering with full RTL support.
- **ADR-003**: Modular Backend Service Architecture with Dependency Inversion and Repository Pattern.
- **ADR-004**: Enterprise Integration Pattern (EIP) Gateway Adapters for Email, SMS, WhatsApp, and PayPal.
- **ADR-005**: Granular NIST-compliant Role-Based Access Control (RBAC) with 20 distinct system actions.
