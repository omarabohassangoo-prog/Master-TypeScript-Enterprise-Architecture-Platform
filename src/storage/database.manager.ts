import {
  User, Role, Permission, Session, Device, Setting, FileRecord,
  Notification, PayPalSystemSettings, PayPalUserAccount, PayPalTransaction,
  AuditLog, CommunicationLog, DevProject, DevTask, DevIssue
} from '../types';

export interface MigrationRecord {
  id: string;
  name: string;
  batch: number;
  executedAt: string;
}

export class DatabaseManager {
  private static instance: DatabaseManager;

  // In-memory persistent collections (PostgreSQL-compliant relational models)
  public users: Map<string, User> = new Map();
  public roles: Map<string, Role> = new Map();
  public permissions: Map<string, Permission> = new Map();
  public userRoles: Array<{ userId: string; roleId: string }> = [];
  public rolePermissions: Array<{ roleId: string; permissionKey: string }> = [];
  public sessions: Map<string, Session> = new Map();
  public devices: Map<string, Device> = new Map();
  public settings: Map<string, Setting> = new Map();
  public files: Map<string, FileRecord> = new Map();
  public notifications: Map<string, Notification> = new Map();
  public paypalSettings!: PayPalSystemSettings;
  public paypalUsers: Map<string, PayPalUserAccount> = new Map();
  public paypalTransactions: Map<string, PayPalTransaction> = new Map();
  public auditLogs: AuditLog[] = [];
  public communicationLogs: CommunicationLog[] = [];
  public devProjects: Map<string, DevProject> = new Map();
  public devTasks: Map<string, DevTask> = new Map();
  public devIssues: Map<string, DevIssue> = new Map();
  public migrations: MigrationRecord[] = [];

  // Connection Pool & Health Telemetry
  private isConnected = false;
  private poolSize = 10;
  private activeConnections = 3;
  private queryCounter = 0;
  private inTransaction = false;

  private constructor() {
    this.initializeDatabase();
  }

  public static getInstance(): DatabaseManager {
    if (!DatabaseManager.instance) {
      DatabaseManager.instance = new DatabaseManager();
    }
    return DatabaseManager.instance;
  }

  public async connect(): Promise<boolean> {
    this.isConnected = true;
    return true;
  }

  public getHealth() {
    return {
      status: 'healthy',
      database: 'PostgreSQL Enterprise v16.2 Engine (Simulated ACID Driver)',
      connected: this.isConnected,
      pool: {
        total: this.poolSize,
        active: this.activeConnections,
        idle: this.poolSize - this.activeConnections,
      },
      metrics: {
        totalQueriesExecuted: this.queryCounter,
        tablesCount: 14,
        totalRecords:
          this.users.size +
          this.roles.size +
          this.permissions.size +
          this.sessions.size +
          this.settings.size +
          this.files.size +
          this.notifications.size +
          this.paypalTransactions.size +
          this.auditLogs.length,
      },
      latencyMs: Math.floor(Math.random() * 8) + 2,
    };
  }

  public recordQuery() {
    this.queryCounter++;
  }

  // Transactions Engine
  public async transaction<T>(callback: () => Promise<T>): Promise<T> {
    this.inTransaction = true;
    this.recordQuery();
    try {
      const result = await callback();
      this.inTransaction = false;
      return result;
    } catch (err) {
      this.inTransaction = false;
      throw err;
    }
  }

  // Initialize DB Schema & Migrations & Seeds
  private initializeDatabase() {
    this.isConnected = true;
    this.runMigrations();
    this.seedInitialData();
  }

  private runMigrations() {
    const migrationList = [
      '001_create_users_table',
      '002_create_roles_table',
      '003_create_permissions_table',
      '004_create_user_roles_pivot',
      '005_create_role_permissions_pivot',
      '006_create_sessions_table',
      '007_create_devices_table',
      '008_create_settings_table',
      '009_create_files_table',
      '010_create_notifications_table',
      '011_create_paypal_schema',
      '012_create_audit_and_comm_logs',
      '013_create_developer_workbench_tables',
    ];

    migrationList.forEach((name, idx) => {
      this.migrations.push({
        id: `mig_${idx + 1}`,
        name,
        batch: 1,
        executedAt: new Date(Date.now() - (15 - idx) * 3600 * 1000).toISOString(),
      });
    });
  }

  private seedInitialData() {
    const now = new Date().toISOString();

    // 1. Seed Permissions Catalog
    const permissionsData: Array<{ key: string; res: string; act: Permission['action']; name: string; desc: string; cat: Permission['category'] }> = [
      { key: 'users.create', res: 'users', act: 'create', name: 'إنشاء مستخدمين', desc: 'إمكانية إضافة حسابات جديدة للنظام', cat: 'identity' },
      { key: 'users.read', res: 'users', act: 'read', name: 'استعراض المستخدمين', desc: 'عرض قائمة وتفاصيل المستخدمين', cat: 'identity' },
      { key: 'users.update', res: 'users', act: 'update', name: 'تعديل المستخدمين', desc: 'تحديث بيانات وصلاحيات الحسابات', cat: 'identity' },
      { key: 'users.delete', res: 'users', act: 'delete', name: 'حذف المستخدمين', desc: 'حذف الحسابات أو تعطيلها', cat: 'identity' },
      { key: 'roles.create', res: 'roles', act: 'create', name: 'إنشاء أدوار', desc: 'إنشاء مجموعات صلاحيات جديدة', cat: 'identity' },
      { key: 'roles.read', res: 'roles', act: 'read', name: 'استعراض الأدوار', desc: 'عرض مصفوفة الأدوار والصلاحيات', cat: 'identity' },
      { key: 'roles.update', res: 'roles', act: 'update', name: 'تعديل الأدوار', desc: 'تعديل صلاحيات الأدوار الحالية', cat: 'identity' },
      { key: 'roles.delete', res: 'roles', act: 'delete', name: 'حذف الأدوار', desc: 'إزالة الأدوار غير النظامية', cat: 'identity' },
      { key: 'settings.read', res: 'settings', act: 'read', name: 'عرض الإعدادات', desc: 'استعراض تكوينات النظام', cat: 'system' },
      { key: 'settings.update', res: 'settings', act: 'update', name: 'تعديل الإعدادات', desc: 'حفظ وتحديث إعدادات النظام وSEO', cat: 'system' },
      { key: 'files.upload', res: 'files', act: 'create', name: 'رفع الملفات', desc: 'رفع المستندات والوسائط للتخزين', cat: 'storage' },
      { key: 'files.read', res: 'files', act: 'read', name: 'عرض وتحميل الملفات', desc: 'استعراض وتحميل المستندات المخزنة', cat: 'storage' },
      { key: 'files.delete', res: 'files', act: 'delete', name: 'حذف الملفات', desc: 'حذف المستندات من الخزينة', cat: 'storage' },
      { key: 'communication.send', res: 'communication', act: 'execute', name: 'إرسال الرسائل', desc: 'إرسال Email وSMS وWhatsApp عبر الـAdapters', cat: 'system' },
      { key: 'finance.read', res: 'finance', act: 'read', name: 'عرض مدفوعات PayPal', desc: 'استعراض السجلات والمعاملات المالية', cat: 'finance' },
      { key: 'finance.manage', res: 'finance', act: 'update', name: 'إدارة بوابة PayPal', desc: 'تعديل إعدادات الـSandbox والـWebhook', cat: 'finance' },
      { key: 'audit.read', res: 'audit', act: 'read', name: 'عرض سجلات التدقيق', desc: 'استعراض سجلات أمان العمليات الحساسة', cat: 'system' },
      { key: 'admin.access', res: 'admin', act: 'admin', name: 'دخول لوحة المدير', desc: 'الوصول إلى لوحة التحكم الإدارية', cat: 'system' },
      { key: 'dev.access', res: 'dev', act: 'admin', name: 'دخول لوحة التطوير', desc: 'الوصول إلى أدوات المهندسين وقواعد البيانات', cat: 'developer' },
    ];

    permissionsData.forEach((p, idx) => {
      const id = `perm_${idx + 1}`;
      this.permissions.set(id, {
        id,
        key: p.key,
        resource: p.res,
        action: p.act,
        displayName: p.name,
        description: p.desc,
        category: p.cat,
        createdAt: now,
      });
    });

    // 2. Seed Default Roles
    const superAdminRole: Role = {
      id: 'role_super_admin',
      name: 'super_admin',
      displayName: 'مدير النظام الأعلى (Super Admin)',
      description: 'كامل الصلاحيات غير المقيدة على كافة وحدات النظام وقواعد البيانات',
      isSystem: true,
      status: 'active',
      permissions: Array.from(this.permissions.values()).map(p => p.key),
      createdAt: now,
      updatedAt: now,
    };

    const adminRole: Role = {
      id: 'role_admin',
      name: 'admin',
      displayName: 'مدير النظام (Admin)',
      description: 'إدارة المستخدمين والمحتوى والإعدادات والملفات والاتصالات',
      isSystem: true,
      status: 'active',
      permissions: [
        'users.create', 'users.read', 'users.update',
        'roles.read', 'settings.read', 'settings.update',
        'files.upload', 'files.read', 'files.delete',
        'communication.send', 'finance.read', 'audit.read', 'admin.access'
      ],
      createdAt: now,
      updatedAt: now,
    };

    const devRole: Role = {
      id: 'role_developer',
      name: 'developer',
      displayName: 'فريق التطوير (Developer)',
      description: 'إمكانية الوصول لأدوات التطوير، استكشاف الـSchema، سجلات النظام، والـAPI',
      isSystem: true,
      status: 'active',
      permissions: [
        'dev.access', 'files.upload', 'files.read', 'settings.read', 'audit.read'
      ],
      createdAt: now,
      updatedAt: now,
    };

    const userRole: Role = {
      id: 'role_user',
      name: 'customer',
      displayName: 'مستخدم قياسي (Standard User)',
      description: 'صلاحيات الحساب العادي: إدارة الملف الشخصي، الإشعارات، ورفع الملفات الخاصة',
      isSystem: true,
      status: 'active',
      permissions: ['files.upload', 'files.read'],
      createdAt: now,
      updatedAt: now,
    };

    [superAdminRole, adminRole, devRole, userRole].forEach(r => this.roles.set(r.id, r));

    // 3. Seed Users
    const superAdmin: User = {
      id: 'usr_admin_001',
      email: 'admin@enterprise.local',
      username: 'superadmin',
      phone: '+966501234567',
      passwordHash: 'sha256_hashed_secure_pass',
      userType: 'super_admin',
      status: 'active',
      emailVerifiedAt: now,
      phoneVerifiedAt: now,
      lastLoginAt: now,
      failedLoginAttempts: 0,
      profile: {
        fullName: 'عمر أبو حسان (مدير النظام)',
        avatarUrl: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80',
        bio: 'المسؤول الأساسي والمهندس المعماري للبيئة المؤسسية الموحدة.',
        jobTitle: 'Principal Enterprise Architect',
        department: 'Executive IT & Infrastructure',
        preferredLanguage: 'ar',
        theme: 'dark',
        twoFactorEnabled: true,
        phoneNumber: '+966501234567',
        country: 'Saudi Arabia',
      },
      roles: ['role_super_admin'],
      createdAt: now,
      updatedAt: now,
    };

    const leadDeveloper: User = {
      id: 'usr_dev_002',
      email: 'dev@enterprise.local',
      username: 'lead_dev',
      phone: '+966509876543',
      passwordHash: 'sha256_hashed_secure_pass',
      userType: 'developer',
      status: 'active',
      emailVerifiedAt: now,
      phoneVerifiedAt: now,
      lastLoginAt: new Date(Date.now() - 3600 * 1000).toISOString(),
      failedLoginAttempts: 0,
      profile: {
        fullName: 'سارة المنصور (كبير مهندسي النظم)',
        avatarUrl: 'https://images.unsplash.com/photo-1580489944761-15a19d654956?w=150&auto=format&fit=crop&q=80',
        bio: 'مسؤولة تكامل الخدمات، التخزين المؤقت، وواجهات REST APIs.',
        jobTitle: 'Staff Backend & Distributed Systems Lead',
        department: 'Core Platform Engineering',
        preferredLanguage: 'ar',
        theme: 'dark',
        twoFactorEnabled: true,
        phoneNumber: '+966509876543',
        country: 'Saudi Arabia',
      },
      roles: ['role_developer'],
      createdAt: now,
      updatedAt: now,
    };

    const regularUser: User = {
      id: 'usr_client_003',
      email: 'omarabohassangoo@gmail.com',
      username: 'omarabohassan',
      phone: '+966555112233',
      passwordHash: 'sha256_hashed_secure_pass',
      userType: 'customer',
      status: 'active',
      emailVerifiedAt: now,
      phoneVerifiedAt: now,
      lastLoginAt: new Date(Date.now() - 7200 * 1000).toISOString(),
      failedLoginAttempts: 0,
      profile: {
        fullName: 'عمر (العميل المشترك)',
        avatarUrl: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&auto=format&fit=crop&q=80',
        bio: 'مستخدم ومستفيد من خدمات النظام والتخزين السحابي.',
        jobTitle: 'Product Manager & Stakeholder',
        department: 'Operations',
        preferredLanguage: 'ar',
        theme: 'dark',
        twoFactorEnabled: false,
        phoneNumber: '+966555112233',
        country: 'Saudi Arabia',
      },
      roles: ['role_user'],
      createdAt: now,
      updatedAt: now,
    };

    [superAdmin, leadDeveloper, regularUser].forEach(u => this.users.set(u.id, u));

    // 4. Seed Settings
    const defaultSettings: Setting[] = [
      { id: 'set_1', key: 'app.name', value: 'Master TypeScript Enterprise Architecture Platform', type: 'string', group: 'general', isPublic: true, label: 'اسم النظام', description: 'الاسم الرسمي للنظام المعماري', createdAt: now, updatedAt: now },
      { id: 'set_2', key: 'app.maintenance_mode', value: false, type: 'boolean', group: 'general', isPublic: true, label: 'وضع الصيانة', description: 'تعليق الوصول العام للواجهات وإظهار صفحة الصيانة', createdAt: now, updatedAt: now },
      { id: 'set_3', key: 'security.session_timeout_minutes', value: 120, type: 'number', group: 'security', isPublic: false, label: 'مهلة الجلسة (دقائق)', description: 'المدة الزمنية قبل انتهاء جلسة الخمول', createdAt: now, updatedAt: now },
      { id: 'set_4', key: 'security.max_login_attempts', value: 5, type: 'number', group: 'security', isPublic: false, label: 'الحد الأقصى لمحاولات الدخول', description: 'عدد المحاولات الخاطئة قبل القفل المؤقت', createdAt: now, updatedAt: now },
      { id: 'set_5', key: 'security.lockout_duration_minutes', value: 15, type: 'number', group: 'security', isPublic: false, label: 'مدة القفل الأمني (دقائق)', description: 'مدة إيقاف الحساب عند تجاوز المحاولات', createdAt: now, updatedAt: now },
      { id: 'set_6', key: 'storage.max_upload_size_mb', value: 50, type: 'number', group: 'storage', isPublic: true, label: 'أقصى حجم للملف (MB)', description: 'الحد الأعلى المسموح به لرفع الملفات', createdAt: now, updatedAt: now },
      { id: 'set_7', key: 'email.smtp_enabled', value: true, type: 'boolean', group: 'email', isPublic: false, label: 'تفعيل مزود البريد', description: 'إرسال الرسائل عبر خادم SMTP أو الـMock Adapter', createdAt: now, updatedAt: now },
      { id: 'set_8', key: 'sms.gateway_enabled', value: true, type: 'boolean', group: 'sms', isPublic: false, label: 'تفعيل بوابة SMS', description: 'بوابة إرسال الرسائل القصيرة والتحقق بالهاتف', createdAt: now, updatedAt: now },
      { id: 'set_9', key: 'whatsapp.meta_enabled', value: true, type: 'boolean', group: 'whatsapp', isPublic: false, label: 'تفعيل WhatsApp Business', description: 'إرسال إشعارات وتنبيهات الحساب الفورية عبر واتساب', createdAt: now, updatedAt: now },
      { id: 'set_10', key: 'paypal.sandbox_enabled', value: true, type: 'boolean', group: 'paypal', isPublic: false, label: 'وضع الاختبار Sandbox', description: 'تشغيل بوابة الدفع PayPal في البيئة التجريبية', createdAt: now, updatedAt: now },
      { id: 'set_11', key: 'seo.meta_title', value: 'Master TypeScript Enterprise Architecture Platform', type: 'string', group: 'seo', isPublic: true, label: 'عنوان الصفحة (SEO Title)', description: 'العنوان الظاهر في محركات البحث ومواقع التواصل', createdAt: now, updatedAt: now },
    ];
    defaultSettings.forEach(s => this.settings.set(s.key, s));

    // 5. Seed PayPal System Settings
    this.paypalSettings = {
      id: 'paypal_sys_01',
      environment: 'sandbox',
      currency: 'USD',
      status: 'enabled',
      clientIdMasked: 'sb_client_id_*****7890',
      webhookUrl: 'https://enterprise-architecture.local/api/v1/paypal/webhook',
      updatedAt: now,
    };

    // 6. Seed PayPal Transactions
    const tx1: PayPalTransaction = {
      id: 'tx_pay_001',
      userId: 'usr_client_003',
      externalTransactionId: 'PAYID-M99210-SAN-881',
      type: 'sale',
      amount: 149.00,
      currency: 'USD',
      status: 'completed',
      itemDescription: 'Enterprise Architecture License - Annual Pro Subscription',
      payerEmail: 'omarabohassangoo@gmail.com',
      createdAt: new Date(Date.now() - 86400 * 1000).toISOString(),
      updatedAt: new Date(Date.now() - 86400 * 1000).toISOString(),
    };
    const tx2: PayPalTransaction = {
      id: 'tx_pay_002',
      userId: 'usr_client_003',
      externalTransactionId: 'PAYID-M99211-SAN-882',
      type: 'sale',
      amount: 49.00,
      currency: 'USD',
      status: 'completed',
      itemDescription: 'High-Speed Cloud Storage Expansion (100GB Addon)',
      payerEmail: 'omarabohassangoo@gmail.com',
      createdAt: new Date(Date.now() - 43200 * 1000).toISOString(),
      updatedAt: new Date(Date.now() - 43200 * 1000).toISOString(),
    };
    this.paypalTransactions.set(tx1.id, tx1);
    this.paypalTransactions.set(tx2.id, tx2);

    // 7. Seed Sample Files
    const sampleFile1: FileRecord = {
      id: 'file_001',
      userId: 'usr_admin_001',
      originalName: 'enterprise-architecture-blueprint-2026.pdf',
      storedName: 'arch_spec_uuid_99812.pdf',
      path: '/storage/uploads/arch_spec_uuid_99812.pdf',
      mimeType: 'application/pdf',
      extension: 'pdf',
      size: 2458000,
      hash: 'e3b0c44298fc1c149afbf4c8996fb92427ae41e4649b934ca495991b7852b855',
      disk: 'local',
      visibility: 'public',
      status: 'ready',
      downloadsCount: 42,
      createdAt: new Date(Date.now() - 172800 * 1000).toISOString(),
      updatedAt: new Date(Date.now() - 172800 * 1000).toISOString(),
    };
    const sampleFile2: FileRecord = {
      id: 'file_002',
      userId: 'usr_client_003',
      originalName: 'system-contracts-verification-report.json',
      storedName: 'report_json_uuid_3321.json',
      path: '/storage/uploads/report_json_uuid_3321.json',
      mimeType: 'application/json',
      extension: 'json',
      size: 142000,
      hash: '8f434346648f6b96df89dda901c5176b10a6d83961dd3c1ac88b59b2dc327aa4',
      disk: 'local',
      visibility: 'private',
      status: 'ready',
      downloadsCount: 18,
      createdAt: new Date(Date.now() - 86400 * 1000).toISOString(),
      updatedAt: new Date(Date.now() - 86400 * 1000).toISOString(),
    };
    this.files.set(sampleFile1.id, sampleFile1);
    this.files.set(sampleFile2.id, sampleFile2);

    // 8. Seed Notifications
    const notif1: Notification = {
      id: 'notif_001',
      userId: 'usr_admin_001',
      type: 'security',
      channel: 'in_app',
      title: 'تسجيل دخول ناجح مع التحقق الثنائي',
      message: 'تم تسجيل الدخول بنجاح من جهاز مصرح به (MacBook Pro / Chrome 124).',
      createdAt: now,
      readAt: null,
    };
    const notif2: Notification = {
      id: 'notif_002',
      userId: 'usr_client_003',
      type: 'payment',
      channel: 'in_app',
      title: 'تأكيد معاملة PayPal',
      message: 'تم استلام وتأكيد دفعة بقيمة 149.00 USD بنجاح (رقم المعاملة PAYID-M99210).',
      createdAt: new Date(Date.now() - 86400 * 1000).toISOString(),
      readAt: new Date(Date.now() - 80000 * 1000).toISOString(),
    };
    this.notifications.set(notif1.id, notif1);
    this.notifications.set(notif2.id, notif2);

    // 9. Seed Audit Logs
    this.auditLogs.push(
      {
        id: 'audit_01',
        userId: 'usr_admin_001',
        username: 'superadmin',
        action: 'SYSTEM_MIGRATIONS_RUN',
        resource: 'database.migrations',
        status: 'success',
        ipAddress: '127.0.0.1',
        userAgent: 'Enterprise Core System Daemon',
        details: { batch: 1, executed: 13 },
        createdAt: new Date(Date.now() - 3600 * 1000).toISOString(),
      },
      {
        id: 'audit_02',
        userId: 'usr_admin_001',
        username: 'superadmin',
        action: 'RBAC_MATRIX_VERIFIED',
        resource: 'security.rbac',
        status: 'success',
        ipAddress: '127.0.0.1',
        userAgent: 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7)',
        details: { totalRoles: 4, totalPermissions: 19 },
        createdAt: new Date(Date.now() - 1800 * 1000).toISOString(),
      },
      {
        id: 'audit_03',
        userId: 'usr_client_003',
        username: 'omarabohassan',
        action: 'PAYPAL_PAYMENT_CAPTURED',
        resource: 'finance.paypal',
        status: 'success',
        ipAddress: '192.168.1.45',
        userAgent: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64)',
        details: { amount: 149.0, txId: 'PAYID-M99210-SAN-881' },
        createdAt: new Date(Date.now() - 86400 * 1000).toISOString(),
      }
    );

    // 10. Seed Dev Workbench (Projects, Tasks, Issues)
    const proj1: DevProject = {
      id: 'proj_001',
      name: 'Master Architecture Kernel',
      key: 'MAK',
      description: 'النواة المعمارية المركزية، الاتصال بقواعد البيانات، ومحرك التخزين والتحقق من الصلاحيات',
      status: 'active',
      repositoryUrl: 'git@github.com:enterprise/architecture-kernel.git',
      lead: 'سارة المنصور',
      branchesCount: 8,
      healthScore: 99,
      updatedAt: now,
    };
    const proj2: DevProject = {
      id: 'proj_002',
      name: 'Multi-Channel Messaging Gateway',
      key: 'MMG',
      description: 'محولات الاتصال الخارجي للبريد الإلكتروني SMTP ورسائل SMS وWhatsApp Cloud API',
      status: 'active',
      repositoryUrl: 'git@github.com:enterprise/messaging-gateway.git',
      lead: 'سارة المنصور',
      branchesCount: 4,
      healthScore: 96,
      updatedAt: now,
    };
    this.devProjects.set(proj1.id, proj1);
    this.devProjects.set(proj2.id, proj2);

    const task1: DevTask = {
      id: 'task_001',
      projectId: 'proj_001',
      title: 'تنفيذ مصفوفة الصلاحيات الديناميكية RBAC',
      description: 'التحقق من الأذونات عبر الدالة can(permissionKey) ومطابقتها مع مسارات Backend',
      status: 'done',
      priority: 'high',
      assignee: 'سارة المنصور',
      dueDate: '2026-09-20',
      tags: ['Security', 'RBAC', 'Backend'],
    };
    const task2: DevTask = {
      id: 'task_002',
      projectId: 'proj_001',
      title: 'بناء محرك فحص الاتساق المعماري Consistency Engine',
      description: 'فحص التناغم التلقائي بين DTOs وجداول قاعدة البيانات ونقاط API ومسارات القوائم',
      status: 'done',
      priority: 'urgent',
      assignee: 'عمر أبو حسان',
      dueDate: '2026-09-18',
      tags: ['Architecture', 'Consistency', 'TypeScript'],
    };
    const task3: DevTask = {
      id: 'task_003',
      projectId: 'proj_002',
      title: 'تطوير محول PayPal Sandbox مع التحقق من Webhooks',
      description: 'معالجة إشعارات الدفع الفورية وتحديث سجلات المعاملات وإشعار المستخدم',
      status: 'done',
      priority: 'high',
      assignee: 'سارة المنصور',
      dueDate: '2026-09-25',
      tags: ['Finance', 'PayPal', 'Webhook'],
    };
    this.devTasks.set(task1.id, task1);
    this.devTasks.set(task2.id, task2);
    this.devTasks.set(task3.id, task3);

    const issue1: DevIssue = {
      id: 'iss_001',
      projectId: 'proj_001',
      title: 'تحسين وقت استجابة التحقق من بصمة المتصفح Fingerprint',
      severity: 'low',
      status: 'resolved',
      reportedBy: 'DevOps Automated Health Check',
      stackTrace: 'Optimized Canvas hash entropy calculation (lat: 2ms)',
      createdAt: new Date(Date.now() - 48 * 3600 * 1000).toISOString(),
    };
    this.devIssues.set(issue1.id, issue1);
  }
}

export const db = DatabaseManager.getInstance();
