# FRONTEND ARCHITECTURE & LOGIC SPECIFICATION (FE-LOGIC-001)

## 1. Architectural Layers & Separation of Concerns

```text
Presentation Layer (UI Views & Sub-components)
  ↓
Hooks Layer (usePermissions, usePagination, useFilters, useDebounce)
  ↓
Frontend Application Services (AuthService, UserService, FileService, PaymentService)
  ↓
API Client (Centralized Axios/Fetch with Interceptors & Error Normalization)
  ↓
Backend REST Endpoints (/api/v1/*)
```

## 2. Server State vs. Client State Policy

- **Server State**: Managed via Centralized Service Dispatch & Invalidation:
  - Users (`/api/v1/users`)
  - Roles & Permissions (`/api/v1/roles`, `/api/v1/permissions`)
  - Storage Files (`/api/v1/files`)
  - Gateway & PayPal Logs (`/api/v1/paypal/transactions`, `/api/v1/communications/logs`)
  - Notifications (`/api/v1/notifications`)
- **Client State**:
  - `activeView`: Routing & Screen Switcher
  - `currentUser`: Authenticated Session Context & RBAC Matrix
  - `lang`: Internationalization State (`'ar'` / `'en'`) with logical RTL/LTR properties
  - `isSidebarOpen`: Responsive Mobile Drawer State

## 3. RBAC & Frontend Security Boundary

- **UX Optimization**: `can(permission)` and `hasRole(role)` control view options, action buttons, and navigation menus.
- **Security Reality**: The backend middleware executes the definitive enforcement; client authorization checks are UX guides.
