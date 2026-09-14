import React, { useState, useEffect } from 'react';
import { Header } from './components/common/Header';
import { Sidebar } from './components/common/Sidebar';
import { MasterBlueprintViewer } from './components/architecture/MasterBlueprintViewer';
import { AdminDashboard } from './components/admin/AdminDashboard';
import { UserManager } from './components/admin/UserManager';
import { RbacMatrixManager } from './components/admin/RbacMatrixManager';
import { SettingsEditor } from './components/admin/SettingsEditor';
import { FileStorageVault } from './components/admin/FileStorageVault';
import { CommunicationsTestBench } from './components/admin/CommunicationsTestBench';
import { PayPalGatewayManager } from './components/admin/PayPalGatewayManager';
import { AuditLogsViewer } from './components/admin/AuditLogsViewer';
import { DeveloperDashboard } from './components/developer/DeveloperDashboard';
import { ApiDocumentationPlayground } from './components/developer/ApiDocumentationPlayground';
import { DatabaseWorkbench } from './components/developer/DatabaseWorkbench';
import { BugIssueTracker } from './components/developer/BugIssueTracker';
import { BackgroundJobQueueManager } from './components/developer/BackgroundJobQueueManager';
import { SystemMetricsDashboard } from './components/developer/SystemMetricsDashboard';
import { CustomerPortal } from './components/user/CustomerPortal';
import { LoginModal } from './components/auth/LoginModal';
import { api } from './api/client';
import {
  User, Role, Permission, Setting, FileRecord, PayPalTransaction,
  AuditLog, CommunicationLog, DevProject, DevTask, DevIssue, ConsistencyCheckItem, NotificationItem,
  BackgroundJob, SystemMetrics
} from './types';

export default function App() {
  const [lang, setLang] = useState<'ar' | 'en'>('ar');
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);
  const [activeView, setActiveView] = useState('blueprint');
  const [isLoginModalOpen, setIsLoginModalOpen] = useState(false);

  // Core Master State
  const [currentUser, setCurrentUser] = useState<User>({
    id: 'usr_superadmin',
    email: 'admin@enterprise.local',
    username: 'superadmin',
    status: 'active',
    userType: 'super_admin',
    failedLoginAttempts: 0,
    roles: ['role_superadmin'],
    permissions: ['*'],
    profile: {
      fullName: 'مدير النظام الأعلى',
      avatarUrl: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=100',
      phoneNumber: '+966501112233',
    },
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  });

  const [users, setUsers] = useState<User[]>([]);
  const [roles, setRoles] = useState<Role[]>([]);
  const [permissions, setPermissions] = useState<Permission[]>([]);
  const [settings, setSettings] = useState<Setting[]>([]);
  const [files, setFiles] = useState<FileRecord[]>([]);
  const [transactions, setTransactions] = useState<PayPalTransaction[]>([]);
  const [auditLogs, setAuditLogs] = useState<AuditLog[]>([]);
  const [commLogs, setCommLogs] = useState<CommunicationLog[]>([]);
  const [devProjects, setDevProjects] = useState<DevProject[]>([]);
  const [devTasks, setDevTasks] = useState<DevTask[]>([]);
  const [devIssues, setDevIssues] = useState<DevIssue[]>([]);
  const [notifications, setNotifications] = useState<NotificationItem[]>([
    {
      id: 'notif_001',
      userId: 'usr_superadmin',
      type: 'info',
      channel: 'in_app',
      title: 'تكامل المعمارية 100%',
      message: 'تم اجتياز جميع فحوصات الاتساق وقواعد البيانات والتحقق بنجاح.',
      createdAt: new Date().toISOString(),
    },
    {
      id: 'notif_002',
      userId: 'usr_superadmin',
      type: 'security',
      channel: 'in_app',
      title: 'تنبيه أمان: جلسة موثوقة',
      message: 'تم توثيق جلسة مدير النظام بنجاح وتفعيل مفاتيح التشفير.',
      createdAt: new Date(Date.now() - 3600000).toISOString(),
    }
  ]);
  const [consistencyReport, setConsistencyReport] = useState<{
    overallScore: number;
    passed: number;
    total: number;
    items: ConsistencyCheckItem[];
  }>({
    overallScore: 100,
    passed: 84,
    total: 84,
    items: [],
  });

  const [backgroundJobs, setBackgroundJobs] = useState<BackgroundJob[]>([]);
  const [systemMetrics, setSystemMetrics] = useState<SystemMetrics>({
    cpuUsagePercent: 12,
    memoryRssMb: 85,
    memoryHeapMb: 42,
    dbPoolActive: 3,
    dbPoolIdle: 8,
    dbPoolTotal: 20,
    apiLatencyP95Ms: 54,
    totalRequests: 14820,
    rateLimitBlocked: 3,
    uptimeSeconds: 3600,
    timestamp: new Date().toISOString(),
  });

  // Initial Data Fetching from API
  const refreshAllData = async () => {
    try {
      const [
        usersRes,
        rolesRes,
        permsRes,
        settingsRes,
        filesRes,
        txRes,
        auditRes,
        commRes,
        tasksRes,
        issuesRes,
        consRes,
        notifsRes,
        jobsRes,
        metricsRes,
      ] = await Promise.all([
        api.get('/api/v1/users'),
        api.get('/api/v1/roles'),
        api.get('/api/v1/roles/permissions/catalog'),
        api.get('/api/v1/settings'),
        api.get('/api/v1/files'),
        api.get('/api/v1/paypal/transactions'),
        api.get('/api/v1/audit/logs'),
        api.get('/api/v1/communications/logs'),
        api.get('/api/v1/dev/tasks'),
        api.get('/api/v1/dev/issues'),
        api.get('/api/v1/dev/consistency-check'),
        api.get('/api/v1/notifications').catch(() => ({ data: [] })),
        api.get('/api/v1/jobs').catch(() => ({ data: [] })),
        api.get('/api/v1/system/metrics').catch(() => ({ data: null })),
      ]);

      if (usersRes?.data && Array.isArray(usersRes.data)) setUsers(usersRes.data);
      if (rolesRes?.data && Array.isArray(rolesRes.data)) setRoles(rolesRes.data);
      if (permsRes?.data && Array.isArray(permsRes.data)) setPermissions(permsRes.data);
      if (settingsRes?.data && Array.isArray(settingsRes.data)) setSettings(settingsRes.data);
      if (filesRes?.data && Array.isArray(filesRes.data)) setFiles(filesRes.data);
      if (txRes?.data && Array.isArray(txRes.data)) setTransactions(txRes.data);
      if (auditRes?.data && Array.isArray(auditRes.data)) setAuditLogs(auditRes.data);
      if (commRes?.data && Array.isArray(commRes.data)) setCommLogs(commRes.data);
      if (tasksRes?.data && Array.isArray(tasksRes.data)) setDevTasks(tasksRes.data);
      if (issuesRes?.data && Array.isArray(issuesRes.data)) setDevIssues(issuesRes.data);
      if (consRes?.data) setConsistencyReport(consRes.data);
      if (notifsRes?.data && Array.isArray(notifsRes.data) && notifsRes.data.length > 0) {
        setNotifications(notifsRes.data);
      }
      if (jobsRes?.data && Array.isArray(jobsRes.data)) setBackgroundJobs(jobsRes.data);
      if (metricsRes?.data) setSystemMetrics(metricsRes.data);


      setDevProjects([
        {
          id: 'proj_001',
          name: 'منظومة المعمارية المؤسسية Master Architecture',
          key: 'ENTERPRISE-CORE',
          lead: 'سارة المنصور',
          healthScore: 100,
          description: 'البنية التحتية الخلفية، محولات الاتصال، وتجريد بوابات الدفع وقواعد البيانات.',
          branchesCount: 4,
          createdAt: new Date().toISOString(),
        },
        {
          id: 'proj_002',
          name: 'بوابة العملاء وواجهات المستخدم React 19',
          key: 'FE-PORTAL',
          lead: 'أحمد السعدي',
          healthScore: 98,
          description: 'واجهة تفاعلية معيارية، دعم RTL كامل، ونظام سمات متقدم.',
          branchesCount: 2,
          createdAt: new Date().toISOString(),
        },
      ]);
    } catch (err) {
      console.error('Failed to load initial master data:', err);
    }
  };

  useEffect(() => {
    refreshAllData();
  }, []);

  // Persona Switcher Handler
  const handleSwitchPersona = (role: 'super_admin' | 'developer' | 'customer') => {
    if (role === 'super_admin') {
      setCurrentUser({
        id: 'usr_superadmin',
        email: 'admin@enterprise.local',
        username: 'superadmin',
        status: 'active',
        userType: 'super_admin',
        failedLoginAttempts: 0,
        roles: ['role_superadmin'],
        permissions: ['*'],
        profile: {
          fullName: 'سلطان القحطاني (Super Admin)',
          avatarUrl: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=100',
          phoneNumber: '+966501112233',
        },
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      });
      setActiveView('admin_dashboard');
    } else if (role === 'developer') {
      setCurrentUser({
        id: 'usr_dev01',
        email: 'developer@enterprise.local',
        username: 'dev_sarah',
        status: 'active',
        userType: 'developer',
        failedLoginAttempts: 0,
        roles: ['role_developer'],
        permissions: ['dev.access', 'audit.read', 'files.upload'],
        profile: {
          fullName: 'سارة المنصور (Senior Architect)',
          avatarUrl: 'https://images.unsplash.com/photo-1580489944761-15a19d654956?w=100',
          phoneNumber: '+966502223344',
        },
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      });
      setActiveView('dev_dashboard');
    } else {
      setCurrentUser({
        id: 'usr_user01',
        email: 'customer@enterprise.local',
        username: 'khalid_client',
        status: 'active',
        userType: 'customer',
        failedLoginAttempts: 0,
        roles: ['role_user'],
        permissions: ['files.upload'],
        profile: {
          fullName: 'خالد عبد الرحمن (Customer)',
          avatarUrl: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=100',
          phoneNumber: '+966503334455',
        },
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      });
      setActiveView('customer_portal');
    }
  };

  // Actions
  const handleCreateUser = async (data: any) => {
    await api.post('/api/v1/users', data);
    await refreshAllData();
  };

  const handleUpdateUser = async (id: string, data: any) => {
    await api.put(`/api/v1/users/${id}`, data);
    await refreshAllData();
  };

  const handleDeleteUser = async (id: string) => {
    await api.delete(`/api/v1/users/${id}`);
    await refreshAllData();
  };

  const handleUpdateRole = async (roleId: string, updates: Partial<Role>) => {
    await api.put(`/api/v1/roles/${roleId}`, updates);
    await refreshAllData();
  };

  const handleCreateRole = async (data: any) => {
    await api.post('/api/v1/roles', data);
    await refreshAllData();
  };

  const handleSaveSetting = async (key: string, value: any) => {
    await api.put(`/api/v1/settings/${key}`, { value });
    await refreshAllData();
  };

  const handleUploadFile = async (data: any) => {
    await api.post('/api/v1/files/upload', {
      ...data,
      userId: currentUser.id,
    });
    await refreshAllData();
  };

  const handleDeleteFile = async (id: string) => {
    await api.delete(`/api/v1/files/${id}`);
    await refreshAllData();
  };

  const handleSendMessage = async (msgData: any) => {
    await api.post('/api/v1/communications/send', msgData);
    await refreshAllData();
  };

  const handleCreateTestPayment = async (amount: number, description: string) => {
    await api.post('/api/v1/paypal/create-order', {
      amount,
      itemDescription: description,
      userId: currentUser.id,
    });
    await refreshAllData();
  };

  const handleUpdateTaskStatus = async (taskId: string, status: DevTask['status']) => {
    await api.put(`/api/v1/dev/tasks/${taskId}`, { status });
    await refreshAllData();
  };

  const handleCreateTask = async (task: any) => {
    await api.post('/api/v1/dev/tasks', task);
    await refreshAllData();
  };

  const handleCreateIssue = async (issue: any) => {
    await api.post('/api/v1/dev/issues', issue);
    await refreshAllData();
  };

  const handleUpdateIssueStatus = async (issueId: string, status: DevIssue['status']) => {
    await api.put(`/api/v1/dev/issues/${issueId}`, { status });
    await refreshAllData();
  };

  const handleTriggerJob = async (jobType: BackgroundJob['type'], payload?: any) => {
    await api.post('/api/v1/jobs/trigger', { type: jobType, payload });
    await refreshAllData();
  };

  const handleClearCompletedJobs = async () => {
    await api.delete('/api/v1/jobs/completed');
    await refreshAllData();
  };

  const handleMarkNotificationRead = async (id: string) => {
    setNotifications(prev => prev.map(n => n.id === id ? { ...n, readAt: new Date().toISOString() } : n));
    try {
      await api.put(`/api/v1/notifications/${id}/read`, {});
    } catch (e) {
      console.warn('Failed to mark notification read on backend:', e);
    }
  };

  return (
    <div className={`min-h-screen bg-slate-950 text-slate-100 flex flex-col font-sans ${lang === 'ar' ? 'rtl' : 'ltr'}`} dir={lang === 'ar' ? 'rtl' : 'ltr'}>
      {/* Top Application Header */}
      <Header
        currentUser={currentUser}
        notifications={notifications}
        onMarkNotificationRead={handleMarkNotificationRead}
        activeView={activeView}
        onNavigate={(view) => setActiveView(view)}
        onSwitchPersona={handleSwitchPersona}
        onOpenLoginModal={() => setIsLoginModalOpen(true)}
        lang={lang}
        onToggleLang={() => setLang(lang === 'ar' ? 'en' : 'ar')}
        isSidebarOpen={isSidebarOpen}
        onToggleSidebar={() => setIsSidebarOpen(!isSidebarOpen)}
      />

      <div className="flex-1 flex overflow-hidden">
        {/* Responsive Collapsible Sidebar */}
        <Sidebar
          activeView={activeView}
          onNavigate={(view) => setActiveView(view)}
          setActiveView={setActiveView}
          currentUser={currentUser}
          currentUserRole={currentUser.userType}
          isOpen={isSidebarOpen}
          lang={lang}
        />

        {/* Main Content Viewport */}
        <main className="flex-1 overflow-y-auto p-4 sm:p-6 lg:p-8 space-y-6 max-w-7xl mx-auto w-full">
          {activeView === 'blueprint' && (
            <MasterBlueprintViewer
              consistencyReport={consistencyReport}
              onRunConsistencyCheck={refreshAllData}
              lang={lang}
            />
          )}

          {/* Admin Views */}
          {activeView === 'admin_dashboard' && (
            <AdminDashboard
              users={users}
              files={files}
              transactions={transactions}
              auditLogs={auditLogs}
              onNavigate={(view) => setActiveView(view)}
              lang={lang}
            />
          )}

          {activeView === 'admin_users' && (
            <UserManager
              users={users}
              roles={roles}
              onCreateUser={handleCreateUser}
              onUpdateUser={handleUpdateUser}
              onDeleteUser={handleDeleteUser}
              lang={lang}
            />
          )}

          {activeView === 'admin_rbac' && (
            <RbacMatrixManager
              roles={roles}
              permissions={permissions}
              onUpdateRole={handleUpdateRole}
              onCreateRole={handleCreateRole}
              lang={lang}
            />
          )}

          {activeView === 'admin_settings' && (
            <SettingsEditor
              settings={settings}
              onSaveSetting={handleSaveSetting}
              lang={lang}
            />
          )}

          {activeView === 'admin_files' && (
            <FileStorageVault
              files={files}
              onUploadFile={handleUploadFile}
              onDeleteFile={handleDeleteFile}
              lang={lang}
            />
          )}

          {activeView === 'admin_comm' && (
            <CommunicationsTestBench
              logs={commLogs}
              onSendMessage={handleSendMessage}
              lang={lang}
            />
          )}

          {activeView === 'admin_paypal' && (
            <PayPalGatewayManager
              settings={{
                environment: 'sandbox',
                clientIdMasked: 'sb_client_94f8***',
                webhookUrl: 'https://enterprise.internal/api/v1/paypal/webhook',
                currency: 'USD',
                mode: 'sandbox',
              }}
              transactions={transactions}
              onCreateTestPayment={handleCreateTestPayment}
              lang={lang}
            />
          )}

          {activeView === 'admin_audit' && (
            <AuditLogsViewer logs={auditLogs} lang={lang} />
          )}

          {/* Developer Views */}
          {activeView === 'dev_dashboard' && (
            <DeveloperDashboard
              projects={devProjects}
              tasks={devTasks}
              onUpdateTaskStatus={handleUpdateTaskStatus}
              onCreateTask={handleCreateTask}
              onNavigate={(view) => setActiveView(view)}
              lang={lang}
            />
          )}

          {activeView === 'dev_api' && (
            <ApiDocumentationPlayground lang={lang} />
          )}

          {activeView === 'dev_db' && (
            <DatabaseWorkbench lang={lang} />
          )}

          {activeView === 'dev_issues' && (
            <BugIssueTracker
              issues={devIssues}
              onCreateIssue={handleCreateIssue}
              onUpdateIssueStatus={handleUpdateIssueStatus}
              lang={lang}
            />
          )}

          {activeView === 'dev_jobs' && (
            <BackgroundJobQueueManager
              jobs={backgroundJobs}
              onTriggerJob={handleTriggerJob}
              onClearCompleted={handleClearCompletedJobs}
              lang={lang}
            />
          )}

          {activeView === 'dev_metrics' && (
            <SystemMetricsDashboard
              metrics={systemMetrics}
              onRefreshMetrics={refreshAllData}
              lang={lang}
            />
          )}

          {/* Customer Portal */}
          {activeView === 'customer_portal' && (
            <CustomerPortal
              currentUser={currentUser}
              files={files}
              transactions={transactions}
              notifications={notifications}
              devTasks={devTasks}
              devIssues={devIssues}
              onUploadFile={handleUploadFile}
              onDeleteFile={handleDeleteFile}
              onPurchaseLicense={handleCreateTestPayment}
              onMarkNotificationRead={handleMarkNotificationRead}
              onNavigate={(view) => setActiveView(view)}
              lang={lang}
            />
          )}
        </main>
      </div>

      {/* Login / Switch Persona Modal */}
      <LoginModal
        isOpen={isLoginModalOpen}
        onClose={() => setIsLoginModalOpen(false)}
        onLoginSuccess={(user) => {
          setCurrentUser(user);
          if (user.userType === 'super_admin') setActiveView('admin_dashboard');
          else if (user.userType === 'developer') setActiveView('dev_dashboard');
          else setActiveView('customer_portal');
        }}
        lang={lang}
      />
    </div>
  );
}
