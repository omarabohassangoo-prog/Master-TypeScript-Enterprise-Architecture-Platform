// ============================================================================
// MASTER ENTERPRISE TYPES DEFINITION (TypeScript Contract-First Specification)
// ============================================================================

export type UserStatus = 'active' | 'inactive' | 'suspended' | 'pending_verification';
export type UserType = 'super_admin' | 'admin' | 'developer' | 'manager' | 'customer' | 'guest';

export interface UserProfile {
  fullName: string;
  avatarUrl?: string;
  bio?: string;
  jobTitle?: string;
  department?: string;
  preferredLanguage: 'ar' | 'en';
  theme: 'dark' | 'light' | 'system';
  twoFactorEnabled: boolean;
  phoneNumber?: string;
  address?: string;
  country?: string;
}

export interface User {
  id: string;
  email: string;
  username: string;
  phone?: string;
  passwordHash?: string;
  userType: UserType;
  status: UserStatus;
  emailVerifiedAt?: string | null;
  phoneVerifiedAt?: string | null;
  lastLoginAt?: string | null;
  failedLoginAttempts: number;
  lockoutUntil?: string | null;
  profile: UserProfile;
  roles: string[]; // Role IDs or keys
  createdAt: string;
  updatedAt: string;
  deletedAt?: string | null;
}

export interface Role {
  id: string;
  name: string;
  displayName: string;
  description: string;
  isSystem: boolean;
  status: 'active' | 'inactive';
  permissions: string[]; // Permission keys (e.g., 'users.create')
  createdAt: string;
  updatedAt: string;
}

export interface Permission {
  id: string;
  key: string; // e.g. 'users.read', 'settings.update'
  resource: string; // e.g. 'users', 'roles', 'settings', 'files'
  action: 'create' | 'read' | 'update' | 'delete' | 'execute' | 'admin';
  displayName: string;
  description: string;
  category: 'identity' | 'content' | 'finance' | 'system' | 'developer' | 'storage';
  createdAt: string;
}

export interface Session {
  id: string;
  userId: string;
  tokenHash: string;
  ipAddress: string;
  userAgent: string;
  deviceId: string;
  browser: string;
  os: string;
  location?: string;
  isCurrent?: boolean;
  fingerprintHash: string;
  lastActivityAt: string;
  expiresAt: string;
  revokedAt?: string | null;
  createdAt: string;
}

export interface Device {
  id: string;
  userId: string;
  fingerprintHash: string;
  deviceName: string;
  browser: string;
  os: string;
  isTrusted: boolean;
  firstSeenAt: string;
  lastSeenAt: string;
}

export type SettingType = 'string' | 'number' | 'boolean' | 'json' | 'secret';
export type SettingGroup = 'general' | 'security' | 'localization' | 'email' | 'sms' | 'whatsapp' | 'paypal' | 'storage' | 'seo';

export interface Setting {
  id: string;
  key: string;
  value: any;
  type: SettingType;
  group: SettingGroup;
  isPublic: boolean;
  label: string;
  description: string;
  createdAt: string;
  updatedAt: string;
}

export interface FileRecord {
  id: string;
  userId: string;
  originalName: string;
  storedName: string;
  path: string;
  mimeType: string;
  extension: string;
  size: number;
  hash: string;
  disk: 'local' | 's3' | 'gcs';
  visibility: 'public' | 'private' | 'temporary';
  status: 'ready' | 'processing' | 'quarantined';
  downloadsCount: number;
  metadata?: Record<string, any>;
  createdAt: string;
  updatedAt: string;
}

export type NotificationChannel = 'in_app' | 'email' | 'sms' | 'whatsapp' | 'push';
export type NotificationType = 'info' | 'success' | 'warning' | 'critical' | 'security' | 'payment';

export interface Notification {
  id: string;
  userId: string;
  type: NotificationType;
  channel: NotificationChannel;
  title: string;
  message: string;
  data?: Record<string, any>;
  readAt?: string | null;
  createdAt: string;
}

export type PayPalPaymentStatus = 'created' | 'approved' | 'completed' | 'failed' | 'refunded';

export interface PayPalSystemSettings {
  id: string;
  environment: 'sandbox' | 'live';
  currency: string;
  status: 'enabled' | 'disabled';
  clientIdMasked: string;
  webhookUrl: string;
  updatedAt: string;
}

export interface PayPalUserAccount {
  id: string;
  userId: string;
  paypalCustomerId: string;
  paypalEmail: string;
  status: 'linked' | 'unlinked' | 'pending';
  createdAt: string;
  updatedAt: string;
}

export interface PayPalTransaction {
  id: string;
  userId: string;
  paypalAccountId?: string;
  externalTransactionId: string;
  type: 'sale' | 'subscription' | 'refund';
  amount: number;
  currency: string;
  status: PayPalPaymentStatus;
  itemDescription: string;
  payerEmail: string;
  metadata?: Record<string, any>;
  createdAt: string;
  updatedAt: string;
}

export interface AuditLog {
  id: string;
  userId?: string | null;
  username?: string | null;
  action: string;
  resource: string;
  resourceId?: string | null;
  status: 'success' | 'failure' | 'warning';
  ipAddress: string;
  userAgent: string;
  details?: Record<string, any>;
  createdAt: string;
}

export interface CommunicationLog {
  id: string;
  channel: 'email' | 'sms' | 'whatsapp';
  recipient: string;
  subject?: string;
  content: string;
  status: 'sent' | 'failed' | 'queued';
  provider: string;
  providerResponseId?: string;
  errorMessage?: string;
  createdAt: string;
}

export interface DevProject {
  id: string;
  name: string;
  key: string;
  description: string;
  status: 'planning' | 'active' | 'maintenance' | 'completed';
  repositoryUrl: string;
  lead: string;
  branchesCount: number;
  healthScore: number;
  updatedAt: string;
}

export interface DevTask {
  id: string;
  projectId: string;
  title: string;
  description: string;
  status: 'todo' | 'in_progress' | 'review' | 'done';
  priority: 'low' | 'medium' | 'high' | 'urgent';
  assignee: string;
  dueDate: string;
  tags: string[];
}

export interface DevIssue {
  id: string;
  projectId: string;
  title: string;
  description?: string;
  type?: 'bug' | 'feature' | 'improvement' | 'security';
  severity: 'low' | 'medium' | 'high' | 'critical';
  status: 'open' | 'investigating' | 'resolved' | 'closed';
  reportedBy: string;
  assignee?: string;
  labels?: string[];
  stackTrace?: string;
  createdAt: string;
}

export interface NotificationItem {
  id: string;
  userId: string;
  type: string;
  channel: string;
  title: string;
  message: string;
  readAt?: string | null;
  createdAt: string;
}

export interface ApiResponse<T = any> {
  success: boolean;
  data: T | null;
  message: string;
  errors?: string[];
  meta?: {
    page?: number;
    limit?: number;
    total?: number;
    totalPages?: number;
    timestamp?: string;
  };
}

export interface ConsistencyCheckItem {
  id: string;
  category: 'database' | 'dto' | 'api' | 'rbac' | 'routes' | 'providers';
  name: string;
  status: 'passed' | 'warning' | 'failed';
  details: string;
  checkedAt: string;
}

export interface BackgroundJob {
  id: string;
  name: string;
  type: 'email_batch' | 'db_cleanup' | 'webhook_retry' | 'pdf_export' | 'audit_archive';
  status: 'queued' | 'processing' | 'completed' | 'failed';
  attempts: number;
  maxAttempts: number;
  payload: Record<string, any>;
  result?: Record<string, any>;
  error?: string;
  runAt: string;
  completedAt?: string;
  durationMs?: number;
}

export interface SystemMetrics {
  cpuUsagePercent: number;
  memoryRssMb: number;
  memoryHeapMb: number;
  dbPoolActive: number;
  dbPoolIdle: number;
  dbPoolTotal: number;
  apiLatencyP95Ms: number;
  totalRequests: number;
  rateLimitBlocked: number;
  uptimeSeconds: number;
  timestamp: string;
}

