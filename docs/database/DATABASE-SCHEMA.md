# MASTER DATABASE SPECIFICATION & SCHEMA (3NF)

## 1. Relational Entities Summary (14 Normalized Tables)

| Entity / Table Name | Primary Key | Foreign Keys & Relations | Purpose | Storage Characteristics |
| :--- | :--- | :--- | :--- | :--- |
| `users` | `id` (VARCHAR) | None | Primary User Identity & Credentials | Hashed PBKDF2 Password, Status, Soft Delete |
| `roles` | `id` (VARCHAR) | None | RBAC Defined Roles | System & Custom Roles |
| `permissions` | `id` (VARCHAR) | None | 20 Granular Permissions (`module.action`) | Immutable resource actions |
| `user_roles` | `(user_id, role_id)` | `users.id`, `roles.id` | Many-to-Many User Role Assignment | Indexed on both FKs |
| `role_permissions` | `(role_id, permission_id)` | `roles.id`, `permissions.id` | Many-to-Many Permission Mapping | Indexed on role_id |
| `sessions` | `id` (VARCHAR) | `users.id` | Active Authentication Sessions | Token hash, expiry, revoked_at |
| `devices` | `id` (VARCHAR) | `users.id` | Device correlation & Fingerprints | IP, Platform, Browser, Last Seen |
| `user_profiles` | `id` (VARCHAR) | `users.id` (1:1) | User Personal & Locale Preferences | Language, Theme, Contact Info |
| `settings` | `id` (VARCHAR) | None | System & SEO Key-Value Configuration | Public vs Private flags |
| `files` | `id` (VARCHAR) | `users.id` | Secure Vault File Metadata | MIME, SHA-256 hash, visibility |
| `notifications` | `id` (VARCHAR) | `users.id` | In-App & Multi-Channel Notification Logs | Read status, Type, Payload |
| `paypal_system_settings` | `id` (VARCHAR) | None | PayPal Environment & Webhook Configuration | Sandbox/Live, Currency |
| `paypal_transactions` | `id` (VARCHAR) | `users.id` | Financial Order & Capture Ledger | Idempotency Key, Amount, Status |
| `audit_logs` | `id` (VARCHAR) | `users.id` | Immutable Administrative Audit Trail | Action, Resource, IP, Timestamp |

## 2. Relational Schema Definition

```sql
-- Core Users Table
CREATE TABLE users (
    id VARCHAR(64) PRIMARY KEY,
    username VARCHAR(64) UNIQUE NOT NULL,
    email VARCHAR(255) UNIQUE NOT NULL,
    phone VARCHAR(32),
    password_hash VARCHAR(255) NOT NULL,
    user_type VARCHAR(32) NOT NULL DEFAULT 'customer',
    status VARCHAR(32) NOT NULL DEFAULT 'active',
    email_verified_at TIMESTAMP WITH TIME ZONE,
    last_login_at TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    deleted_at TIMESTAMP WITH TIME ZONE
);

CREATE INDEX idx_users_email ON users(email);
CREATE INDEX idx_users_username ON users(username);
CREATE INDEX idx_users_status ON users(status);

-- Roles Table
CREATE TABLE roles (
    id VARCHAR(64) PRIMARY KEY,
    name VARCHAR(64) UNIQUE NOT NULL,
    display_name VARCHAR(128) NOT NULL,
    description TEXT,
    is_system BOOLEAN DEFAULT FALSE,
    status VARCHAR(32) DEFAULT 'active',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Permissions Table
CREATE TABLE permissions (
    id VARCHAR(64) PRIMARY KEY,
    name VARCHAR(64) UNIQUE NOT NULL,
    resource VARCHAR(64) NOT NULL,
    action VARCHAR(64) NOT NULL,
    description TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Junction: User Roles
CREATE TABLE user_roles (
    user_id VARCHAR(64) REFERENCES users(id) ON DELETE CASCADE,
    role_id VARCHAR(64) REFERENCES roles(id) ON DELETE CASCADE,
    PRIMARY KEY (user_id, role_id)
);

-- Junction: Role Permissions
CREATE TABLE role_permissions (
    role_id VARCHAR(64) REFERENCES roles(id) ON DELETE CASCADE,
    permission_id VARCHAR(64) REFERENCES permissions(id) ON DELETE CASCADE,
    PRIMARY KEY (role_id, permission_id)
);

-- Sessions Table
CREATE TABLE sessions (
    id VARCHAR(64) PRIMARY KEY,
    user_id VARCHAR(64) REFERENCES users(id) ON DELETE CASCADE,
    token_hash VARCHAR(255) NOT NULL,
    device_id VARCHAR(64),
    ip_address VARCHAR(45),
    user_agent TEXT,
    expires_at TIMESTAMP WITH TIME ZONE NOT NULL,
    last_activity_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    revoked_at TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX idx_sessions_user_token ON sessions(user_id, token_hash);
CREATE INDEX idx_sessions_expires_at ON sessions(expires_at);

-- User Profiles Table
CREATE TABLE user_profiles (
    id VARCHAR(64) PRIMARY KEY,
    user_id VARCHAR(64) UNIQUE REFERENCES users(id) ON DELETE CASCADE,
    full_name VARCHAR(128) NOT NULL,
    avatar_url TEXT,
    preferred_language VARCHAR(8) DEFAULT 'ar',
    theme VARCHAR(16) DEFAULT 'dark',
    two_factor_enabled BOOLEAN DEFAULT FALSE,
    country VARCHAR(64),
    city VARCHAR(64),
    bio TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- System Settings
CREATE TABLE settings (
    id VARCHAR(64) PRIMARY KEY,
    key VARCHAR(128) UNIQUE NOT NULL,
    value TEXT NOT NULL,
    type VARCHAR(32) DEFAULT 'string',
    group_name VARCHAR(64) DEFAULT 'general',
    is_public BOOLEAN DEFAULT FALSE,
    description TEXT,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Secure Storage Files
CREATE TABLE files (
    id VARCHAR(64) PRIMARY KEY,
    user_id VARCHAR(64) REFERENCES users(id) ON DELETE SET NULL,
    original_name VARCHAR(255) NOT NULL,
    stored_name VARCHAR(255) NOT NULL,
    path VARCHAR(512) NOT NULL,
    mime_type VARCHAR(128) NOT NULL,
    extension VARCHAR(16) NOT NULL,
    size BIGINT NOT NULL,
    hash VARCHAR(64) NOT NULL,
    disk VARCHAR(32) DEFAULT 'local',
    visibility VARCHAR(32) DEFAULT 'private',
    status VARCHAR(32) DEFAULT 'active',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX idx_files_user ON files(user_id);
CREATE INDEX idx_files_hash ON files(hash);

-- Notifications Table
CREATE TABLE notifications (
    id VARCHAR(64) PRIMARY KEY,
    user_id VARCHAR(64) REFERENCES users(id) ON DELETE CASCADE,
    type VARCHAR(64) NOT NULL,
    title VARCHAR(255) NOT NULL,
    message TEXT NOT NULL,
    data JSONB,
    read_at TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- PayPal Transactions Table
CREATE TABLE paypal_transactions (
    id VARCHAR(64) PRIMARY KEY,
    user_id VARCHAR(64) REFERENCES users(id) ON DELETE SET NULL,
    external_transaction_id VARCHAR(128) UNIQUE NOT NULL,
    idempotency_key VARCHAR(128) UNIQUE,
    type VARCHAR(32) DEFAULT 'sale',
    amount NUMERIC(12, 2) NOT NULL,
    currency VARCHAR(8) DEFAULT 'USD',
    status VARCHAR(32) NOT NULL,
    payer_email VARCHAR(255),
    item_description TEXT,
    metadata JSONB,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Immutable Audit Logs
CREATE TABLE audit_logs (
    id VARCHAR(64) PRIMARY KEY,
    user_id VARCHAR(64),
    action VARCHAR(64) NOT NULL,
    resource VARCHAR(64) NOT NULL,
    resource_id VARCHAR(64),
    details JSONB,
    ip_address VARCHAR(45),
    user_agent TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX idx_audit_created ON audit_logs(created_at);
CREATE INDEX idx_audit_user ON audit_logs(user_id);
```
