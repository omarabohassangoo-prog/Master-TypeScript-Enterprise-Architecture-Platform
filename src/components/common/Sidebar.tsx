import React from 'react';
import {
  LayoutDashboard, Users, ShieldCheck, Sliders, FolderLock,
  Send, CreditCard, History, Terminal, Kanban, Bug,
  Code2, Database, CheckCheck, Home, User as UserIcon, Bell,
  FileText, Laptop, KeyRound, Layers, Cpu, Gauge
} from 'lucide-react';
import { User } from '../../types';

interface SidebarProps {
  activeView: string;
  setActiveView?: (view: string) => void;
  onNavigate?: (view: string) => void;
  currentUser?: User;
  currentUserRole?: string;
  isOpen?: boolean;
  lang: 'ar' | 'en';
}

export const Sidebar: React.FC<SidebarProps> = ({
  activeView,
  setActiveView,
  onNavigate,
  currentUser,
  currentUserRole,
  isOpen = true,
  lang,
}) => {
  const handleNav = (viewId: string) => {
    if (onNavigate) {
      onNavigate(viewId);
    } else if (setActiveView) {
      setActiveView(viewId);
    }
  };

  // Determine current context (admin, dev, user, or blueprint)
  const isDevSection = activeView.startsWith('dev_');
  const isAdminSection = activeView.startsWith('admin_');
  const isUserSection = activeView.startsWith('user_') || activeView === 'customer_portal';
  const isBlueprint = activeView === 'blueprint';

  const adminNavItems = [
    { id: 'admin_dashboard', label: 'لوحة المؤشرات العامة', labelEn: 'Overview Dashboard', icon: LayoutDashboard },
    { id: 'admin_users', label: 'إدارة المستخدمين', labelEn: 'User Management', icon: Users },
    { id: 'admin_rbac', label: 'الأدوار ومصفوفة RBAC', labelEn: 'Roles & RBAC Matrix', icon: ShieldCheck },
    { id: 'admin_settings', label: 'إعدادات النظام وSEO', labelEn: 'System Settings & SEO', icon: Sliders },
    { id: 'admin_files', label: 'خزينة الملفات والتخزين', labelEn: 'File Storage Vault', icon: FolderLock },
    { id: 'admin_comm', label: 'منصة الاتصالات (Email/SMS/WA)', labelEn: 'Communications Dispatcher', icon: Send },
    { id: 'admin_paypal', label: 'بوابة مدفوعات PayPal', labelEn: 'PayPal Gateway & Sandbox', icon: CreditCard },
    { id: 'admin_audit', label: 'سجلات التدقيق والأمان', labelEn: 'Security Audit Logs', icon: History },
  ];

  const devNavItems = [
    { id: 'dev_dashboard', label: 'لوحة التطوير والأنظمة', labelEn: 'Dev Console', icon: Terminal },
    { id: 'dev_jobs', label: 'طوابير المهام الخلفية (Jobs)', labelEn: 'Async Job Queue', icon: Cpu },
    { id: 'dev_metrics', label: 'مراقبة أداء الخادم (APM)', labelEn: 'APM & System Metrics', icon: Gauge },
    { id: 'dev_issues', label: 'تتبع الأعطال والمشاكل', labelEn: 'Bug & Issue Tracker', icon: Bug },
    { id: 'dev_api', label: 'توثيق وااختبار OpenAPI', labelEn: 'API Swagger Playground', icon: Code2 },
    { id: 'dev_db', label: 'مستكشف قاعدة البيانات', labelEn: 'Database Workbench', icon: Database },
  ];


  const userNavItems = [
    { id: 'customer_portal', label: 'الملخص الشخصي والخزينة', labelEn: 'Personal Dashboard', icon: Home },
  ];

  const renderNavGroup = (title: string, titleEn: string, items: typeof adminNavItems) => (
    <div className="mb-6">
      <p className="px-3 text-[11px] font-bold text-slate-400 uppercase tracking-wider mb-2">
        {lang === 'ar' ? title : titleEn}
      </p>
      <div className="space-y-1">
        {items.map(item => {
          const Icon = item.icon;
          const isActive = activeView === item.id || (item.id === 'admin_dashboard' && activeView === 'admin_overview') || (item.id === 'dev_dashboard' && activeView === 'dev_overview');
          return (
            <button
              key={item.id}
              onClick={() => handleNav(item.id)}
              className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-xs font-medium transition-all ${
                isActive
                  ? 'bg-cyan-500/15 text-cyan-400 border border-cyan-500/30 font-semibold shadow-sm'
                  : 'text-slate-400 hover:text-slate-200 hover:bg-slate-900/60'
              }`}
            >
              <Icon className={`w-4 h-4 ${isActive ? 'text-cyan-400' : 'text-slate-400'}`} />
              <span className="truncate">{lang === 'ar' ? item.label : item.labelEn}</span>
            </button>
          );
        })}
      </div>
    </div>
  );

  return (
    <aside className={`w-64 shrink-0 bg-slate-950/80 border-e border-slate-800 p-4 min-h-[calc(100vh-61px)] flex flex-col justify-between transition-all duration-300 ${
      isOpen ? 'block' : 'hidden'
    } lg:flex`}>
      <div>
        {/* Quick Blueprint Navigator Banner */}
        <div className="mb-6">
          <button
            onClick={() => handleNav('blueprint')}
            className={`w-full p-3 rounded-xl border text-start transition-all flex items-center gap-3 ${
              isBlueprint
                ? 'bg-gradient-to-r from-cyan-950/80 to-indigo-950/80 border-cyan-500/50 shadow-md text-cyan-300'
                : 'bg-slate-900/50 border-slate-800 text-slate-300 hover:border-slate-700'
            }`}
          >
            <div className="p-2 rounded-lg bg-cyan-500/10 text-cyan-400 border border-cyan-500/20">
              <Layers className="w-4 h-4" />
            </div>
            <div>
              <p className="text-xs font-bold leading-tight">{lang === 'ar' ? 'المخطط المعماري الكامل' : 'Master Blueprint'}</p>
              <p className="text-[10px] text-slate-400">{lang === 'ar' ? 'المواصفات والرسوم التفاعلية' : 'ERD, Data Flows & Specs'}</p>
            </div>
          </button>
        </div>

        {/* Dynamic Nav Groups based on active context or show all for full exploration */}
        {isAdminSection && renderNavGroup('لوحة تحكم المدير العام', 'Admin Management', adminNavItems)}
        {isDevSection && renderNavGroup('أدوات فريق التطوير', 'Developer Suite', devNavItems)}
        {isUserSection && renderNavGroup('خدمات حساب المستخدم', 'User Services', userNavItems)}
        
        {/* If in Blueprint, show compact quick links to all sections */}
        {isBlueprint && (
          <>
            {renderNavGroup('وحدات المدير (Admin)', 'Admin Modules', adminNavItems.slice(0, 4))}
            {renderNavGroup('وحدات التطوير (Dev)', 'Developer Modules', devNavItems.slice(0, 4))}
          </>
        )}
      </div>

      {/* System Telemetry Footer */}
      <div className="pt-4 border-t border-slate-800/80 text-[11px] text-slate-400 space-y-1 font-mono">
        <div className="flex items-center justify-between">
          <span>{lang === 'ar' ? 'حالة النظام:' : 'Status:'}</span>
          <span className="text-emerald-400 font-bold">{lang === 'ar' ? 'نشط ومستقر' : 'Operational'}</span>
        </div>
        <div className="flex items-center justify-between">
          <span>{lang === 'ar' ? 'البيئة:' : 'Environment:'}</span>
          <span className="text-slate-300">Sandbox / Dev</span>
        </div>
        <div className="flex items-center justify-between">
          <span>{lang === 'ar' ? 'زمن الاستجابة:' : 'Ping:'}</span>
          <span className="text-cyan-400">2.4 ms</span>
        </div>
      </div>
    </aside>
  );
};
