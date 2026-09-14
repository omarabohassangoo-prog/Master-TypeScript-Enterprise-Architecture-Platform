import React from 'react';
import {
  Users, ShieldCheck, FolderLock, CreditCard, Activity,
  Sliders, Send, History, CheckCircle2, AlertTriangle, ArrowUpRight
} from 'lucide-react';
import { StatCard } from '../common/StatCard';
import { User, FileRecord, PayPalTransaction, AuditLog } from '../../types';

interface AdminDashboardProps {
  users: User[];
  files: FileRecord[];
  transactions: PayPalTransaction[];
  auditLogs: AuditLog[];
  onNavigate: (view: string) => void;
  lang: 'ar' | 'en';
}

export const AdminDashboard: React.FC<AdminDashboardProps> = ({
  users = [],
  files = [],
  transactions = [],
  auditLogs = [],
  onNavigate,
  lang,
}) => {
  const safeUsers = users || [];
  const safeFiles = files || [];
  const safeTransactions = transactions || [];
  const safeAuditLogs = auditLogs || [];

  const activeUsers = safeUsers.filter(u => u && u.status === 'active').length;
  const totalStorageBytes = safeFiles.reduce((acc, f) => acc + (f?.size || 0), 0);
  const totalRevenue = safeTransactions
    .filter(t => t && t.status === 'completed')
    .reduce((acc, t) => acc + (t?.amount || 0), 0);

  const formatSize = (bytes: number) => {
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
    return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
  };

  return (
    <div className="space-y-6">
      {/* Top Banner */}
      <div className="bg-slate-900/90 border border-slate-800 rounded-2xl p-6 flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <span className="text-xs font-mono text-cyan-400 bg-cyan-950/60 border border-cyan-800/40 px-2 py-0.5 rounded">
            ADMIN CONSOLE v1.0
          </span>
          <h1 className="text-2xl font-bold text-slate-100 mt-2">
            {lang === 'ar' ? 'لوحة تحكم مدير النظام الشاملة' : 'Master System Administrator Dashboard'}
          </h1>
          <p className="text-xs text-slate-400 mt-1">
            {lang === 'ar'
              ? 'إدارة المستخدمين، مصفوفة الصلاحيات RBAC، إعدادات النظام، التخزين، المراسلات، وبوابة PayPal.'
              : 'Enterprise control for users, RBAC matrix, system settings, storage, communications, and PayPal.'}
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => onNavigate('admin_users')}
            className="px-3.5 py-2 rounded-xl bg-cyan-500 text-slate-950 font-bold text-xs hover:bg-cyan-400 transition-all shadow-md shadow-cyan-500/20"
          >
            {lang === 'ar' ? 'إدارة المستخدمين' : 'Manage Users'}
          </button>
          <button
            onClick={() => onNavigate('admin_settings')}
            className="px-3.5 py-2 rounded-xl bg-slate-800 text-slate-200 hover:bg-slate-700 text-xs transition-all border border-slate-700"
          >
            {lang === 'ar' ? 'تعديل الإعدادات' : 'System Settings'}
          </button>
        </div>
      </div>

      {/* KPI Stats Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard
          title={lang === 'ar' ? 'المستخدمين النشطين' : 'Active Users'}
          value={activeUsers}
          subtitle={`${users.length} ${lang === 'ar' ? 'إجمالي الحسابات' : 'Total accounts'}`}
          iconName="Users"
          colorVariant="cyan"
          trend={{ value: '12%', isPositive: true }}
        />
        <StatCard
          title={lang === 'ar' ? 'المساحة المخزنة' : 'Stored Vault Files'}
          value={formatSize(totalStorageBytes)}
          subtitle={`${files.length} ${lang === 'ar' ? 'ملفات في الخزينة' : 'Stored documents'}`}
          iconName="FolderLock"
          colorVariant="emerald"
        />
        <StatCard
          title={lang === 'ar' ? 'إجمالي مدفوعات PayPal' : 'PayPal Financials'}
          value={`$${totalRevenue.toFixed(2)}`}
          subtitle={`${transactions.length} ${lang === 'ar' ? 'معاملة مالية' : 'Transactions'}`}
          iconName="CreditCard"
          colorVariant="amber"
          trend={{ value: '24%', isPositive: true }}
        />
        <StatCard
          title={lang === 'ar' ? 'سجلات التدقيق والأمان' : 'Security Audit Logs'}
          value={auditLogs.length}
          subtitle={lang === 'ar' ? 'عملية مسجلة بالكامل' : 'Logged audit events'}
          iconName="History"
          colorVariant="indigo"
        />
      </div>

      {/* Action Quick Links & Recent Logs */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Modules Grid */}
        <div className="lg:col-span-2 bg-slate-900/90 border border-slate-800 rounded-2xl p-6 space-y-4">
          <h3 className="font-bold text-slate-100 text-sm flex items-center gap-2">
            <Sliders className="w-4 h-4 text-cyan-400" />
            <span>{lang === 'ar' ? 'الوحدات الإدارية الأساسية' : 'Core Administrative Modules'}</span>
          </h3>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {[
              { id: 'admin_users', title: 'إدارة المستخدمين', desc: 'استعراض الحسابات وتعديل الصلاحيات والحظر', icon: Users, color: 'text-cyan-400' },
              { id: 'admin_rbac', title: 'الأدوار ومصفوفة RBAC', desc: 'تخصيص أذونات الوصول والمجموعات', icon: ShieldCheck, color: 'text-purple-400' },
              { id: 'admin_files', title: 'خزينة الملفات والتخزين', desc: 'إدارة المستندات المشفرة وحصص الرفع', icon: FolderLock, color: 'text-emerald-400' },
              { id: 'admin_comm', title: 'المراسلات (Email/SMS/WA)', desc: 'بوابات الإرسال ومراجعة سجلات الاتصال', icon: Send, color: 'text-indigo-400' },
              { id: 'admin_paypal', title: 'بوابة مدفوعات PayPal', desc: 'إعدادات Sandbox والـWebhook والمعاملات', icon: CreditCard, color: 'text-amber-400' },
              { id: 'admin_audit', title: 'سجلات التدقيق الأمني', desc: 'تتبع العمليات الحساسة وسجلات الدخول', icon: History, color: 'text-rose-400' },
            ].map((m, idx) => {
              const Icon = m.icon;
              return (
                <button
                  key={idx}
                  onClick={() => onNavigate(m.id)}
                  className="p-4 rounded-xl bg-slate-950/60 border border-slate-800 hover:border-cyan-500/40 text-start transition-all group flex items-start justify-between"
                >
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <Icon className={`w-4 h-4 ${m.color}`} />
                      <span className="font-bold text-slate-200 text-xs group-hover:text-cyan-300 transition-colors">
                        {m.title}
                      </span>
                    </div>
                    <p className="text-[11px] text-slate-400 leading-relaxed">{m.desc}</p>
                  </div>
                  <ArrowUpRight className="w-4 h-4 text-slate-500 group-hover:text-cyan-400 transition-colors shrink-0" />
                </button>
              );
            })}
          </div>
        </div>

        {/* Live Security Activity Stream */}
        <div className="bg-slate-900/90 border border-slate-800 rounded-2xl p-6 space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="font-bold text-slate-100 text-sm flex items-center gap-2">
              <Activity className="w-4 h-4 text-emerald-400" />
              <span>{lang === 'ar' ? 'سجل الأمان الحي (Audit)' : 'Live Security Stream'}</span>
            </h3>
            <button
              onClick={() => onNavigate('admin_audit')}
              className="text-[11px] text-cyan-400 hover:underline"
            >
              {lang === 'ar' ? 'عرض الكل' : 'View all'}
            </button>
          </div>

          <div className="space-y-2.5">
            {safeAuditLogs.slice(0, 5).map((log) => (
              <div
                key={log.id}
                className="p-2.5 rounded-lg bg-slate-950/60 border border-slate-800/80 text-xs space-y-1"
              >
                <div className="flex items-center justify-between">
                  <span className="font-mono text-cyan-400 font-semibold">{log.action}</span>
                  <span className="text-[10px] text-slate-500">
                    {new Date(log.createdAt).toLocaleTimeString()}
                  </span>
                </div>
                <div className="flex items-center justify-between text-[11px] text-slate-400">
                  <span>المستخدم: {log.username || 'System'}</span>
                  <span className="text-emerald-400">✓ {log.status}</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};
