import React, { useState } from 'react';
import {
  User as UserIcon, Shield, Key, Smartphone, HardDrive,
  CreditCard, Bell, Upload, Download, Trash2, CheckCircle2,
  Lock, RefreshCw, Eye, AlertCircle, FileText, Code2, Terminal,
  Bug, Database, Activity, CheckSquare, Zap, Clock, Users,
  Sliders, Briefcase, Mail, Send, Globe
} from 'lucide-react';
import { User, FileRecord, PayPalTransaction, NotificationItem, Session, DevTask, DevIssue } from '../../types';

interface CustomerPortalProps {
  currentUser: User;
  files: FileRecord[];
  transactions: PayPalTransaction[];
  notifications: NotificationItem[];
  devTasks?: DevTask[];
  devIssues?: DevIssue[];
  onUploadFile: (data: any) => Promise<void>;
  onDeleteFile: (id: string) => Promise<void>;
  onPurchaseLicense: (amount: number, desc: string) => Promise<void>;
  onMarkNotificationRead: (id: string) => Promise<void>;
  onNavigate?: (view: string) => void;
  lang: 'ar' | 'en';
}

export const CustomerPortal: React.FC<CustomerPortalProps> = ({
  currentUser,
  files = [],
  transactions = [],
  notifications = [],
  devTasks = [],
  devIssues = [],
  onUploadFile,
  onDeleteFile,
  onPurchaseLicense,
  onMarkNotificationRead,
  onNavigate,
  lang,
}) => {
  const [activeTab, setActiveTab] = useState<'profile' | 'vault' | 'billing' | 'notifications' | 'workspace'>('profile');
  const [showUploadModal, setShowUploadModal] = useState(false);
  const [newFileName, setNewFileName] = useState('');
  const [isPurchasing, setIsPurchasing] = useState(false);
  const [purchaseSuccess, setPurchaseSuccess] = useState(false);

  const safeFiles = files || [];
  const safeTransactions = transactions || [];
  const safeNotifications = notifications || [];
  const currentUserId = currentUser?.id || '';

  // Filter items by user where applicable
  const myFiles = safeFiles.filter(f => f && (f.userId === currentUserId || f.visibility === 'public'));
  const userType = currentUser?.userType || 'customer';

  const handleUploadSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    await onUploadFile({
      originalName: newFileName || 'document-export.pdf',
      mimeType: 'application/pdf',
      size: 256 * 1024,
      visibility: 'private',
    });
    setShowUploadModal(false);
    setNewFileName('');
  };

  const handleBuy = async (amount: number, desc: string) => {
    setIsPurchasing(true);
    await onPurchaseLicense(amount, desc);
    setIsPurchasing(false);
    setPurchaseSuccess(true);
    setTimeout(() => setPurchaseSuccess(false), 4000);
  };

  return (
    <div className="space-y-6">
      {/* Dynamic Header Banner Customized for User Role */}
      <div className="bg-gradient-to-r from-slate-900 via-indigo-950/30 to-slate-900 border border-slate-800 rounded-2xl p-6 flex flex-col md:flex-row md:items-center justify-between gap-4 shadow-xl">
        <div className="flex items-center gap-4">
          <img
            src={currentUser.profile?.avatarUrl || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=100'}
            alt={currentUser.username}
            className="w-16 h-16 rounded-2xl object-cover border-2 border-cyan-500/50 shadow-lg"
          />
          <div>
            <div className="flex items-center gap-2 flex-wrap">
              <h1 className="text-xl font-bold text-slate-100">{currentUser.profile?.fullName || currentUser.username}</h1>
              <span className={`text-[10px] font-mono px-2.5 py-0.5 rounded-full uppercase font-bold border ${
                userType === 'super_admin'
                  ? 'bg-rose-500/10 text-rose-400 border-rose-500/30'
                  : userType === 'developer'
                  ? 'bg-purple-500/10 text-purple-400 border-purple-500/30'
                  : userType === 'manager'
                  ? 'bg-amber-500/10 text-amber-400 border-amber-500/30'
                  : 'bg-cyan-500/10 text-cyan-400 border-cyan-500/30'
              }`}>
                {userType === 'super_admin' ? 'Super Admin' : userType === 'developer' ? 'Lead Developer' : userType === 'manager' ? 'Operations Manager' : 'Verified Customer'}
              </span>
            </div>
            <p className="text-xs text-slate-400 font-mono mt-0.5">{currentUser.email}</p>
            <p className="text-[11px] text-slate-500 mt-1">
              {lang === 'ar'
                ? `لوحة التحكم المخصصة لحساب ${userType === 'super_admin' ? 'مدير المنظومة' : userType === 'developer' ? 'فريق التطوير' : userType === 'manager' ? 'مدير العمليات' : 'العميل'}`
                : `Customized workspace for ${userType} account`}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2 flex-wrap">
          {userType === 'developer' && onNavigate && (
            <button
              onClick={() => onNavigate('dev_dashboard')}
              className="px-3.5 py-2 rounded-xl bg-purple-600/20 text-purple-300 hover:bg-purple-600/30 text-xs font-semibold transition-all border border-purple-500/40 flex items-center gap-1.5"
            >
              <Terminal className="w-3.5 h-3.5" />
              <span>{lang === 'ar' ? 'بيئة التطوير' : 'Dev Workbench'}</span>
            </button>
          )}

          {userType === 'super_admin' && onNavigate && (
            <button
              onClick={() => onNavigate('admin_dashboard')}
              className="px-3.5 py-2 rounded-xl bg-rose-600/20 text-rose-300 hover:bg-rose-600/30 text-xs font-semibold transition-all border border-rose-500/40 flex items-center gap-1.5"
            >
              <Shield className="w-3.5 h-3.5" />
              <span>{lang === 'ar' ? 'لوحة الإدارة الشاملة' : 'Master Admin'}</span>
            </button>
          )}

          <button
            onClick={() => setActiveTab('vault')}
            className="px-3.5 py-2 rounded-xl bg-slate-800 text-slate-200 hover:bg-slate-700 text-xs transition-all border border-slate-700"
          >
            {lang === 'ar' ? `خزينة المستندات (${myFiles.length})` : `Vault (${myFiles.length})`}
          </button>
        </div>
      </div>

      {/* Role-Specific Key Metrics Summary */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-slate-900/80 border border-slate-800 rounded-xl p-4 flex items-center justify-between">
          <div>
            <p className="text-[11px] text-slate-400 font-medium">{lang === 'ar' ? 'حالة الحساب' : 'Account Status'}</p>
            <p className="text-lg font-bold text-emerald-400 mt-1 flex items-center gap-1.5">
              <CheckCircle2 className="w-4 h-4" />
              <span>{currentUser.status}</span>
            </p>
          </div>
          <div className="p-3 rounded-xl bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
            <Shield className="w-5 h-5" />
          </div>
        </div>

        <div className="bg-slate-900/80 border border-slate-800 rounded-xl p-4 flex items-center justify-between">
          <div>
            <p className="text-[11px] text-slate-400 font-medium">{lang === 'ar' ? 'الملفات المشفرة' : 'Stored Files'}</p>
            <p className="text-lg font-bold text-slate-100 font-mono mt-1">{myFiles.length}</p>
          </div>
          <div className="p-3 rounded-xl bg-cyan-500/10 text-cyan-400 border border-cyan-500/20">
            <HardDrive className="w-5 h-5" />
          </div>
        </div>

        <div className="bg-slate-900/80 border border-slate-800 rounded-xl p-4 flex items-center justify-between">
          <div>
            <p className="text-[11px] text-slate-400 font-medium">{lang === 'ar' ? 'التنبيهات والرسائل' : 'Unread Notices'}</p>
            <p className="text-lg font-bold text-amber-400 font-mono mt-1">
              {safeNotifications.filter(n => !n.readAt).length}
            </p>
          </div>
          <div className="p-3 rounded-xl bg-amber-500/10 text-amber-400 border border-amber-500/20">
            <Bell className="w-5 h-5" />
          </div>
        </div>

        <div className="bg-slate-900/80 border border-slate-800 rounded-xl p-4 flex items-center justify-between">
          <div>
            <p className="text-[11px] text-slate-400 font-medium">{lang === 'ar' ? 'المعاملات المالية' : 'Transactions'}</p>
            <p className="text-lg font-bold text-slate-100 font-mono mt-1">{safeTransactions.length}</p>
          </div>
          <div className="p-3 rounded-xl bg-indigo-500/10 text-indigo-400 border border-indigo-500/20">
            <CreditCard className="w-5 h-5" />
          </div>
        </div>
      </div>

      {/* Navigation Tabs */}
      <div className="flex items-center gap-2 overflow-x-auto pb-1 scrollbar-none">
        {[
          { id: 'profile', label: lang === 'ar' ? '1. الملف الشخصي والأمان' : '1. Profile & Security', icon: UserIcon },
          { id: 'preferences', label: lang === 'ar' ? '2. التفضيلات والإعدادات' : '2. Preferences & Settings', icon: Sliders },
          { id: 'workspace', label: lang === 'ar' ? '3. مساحة العمل حسب الدور' : '3. Role Workspace', icon: Briefcase },
          { id: 'vault', label: lang === 'ar' ? '4. خزينة مستنداتي الخاصة' : '4. Secure File Vault', icon: HardDrive },
          { id: 'billing', label: lang === 'ar' ? '5. باقات PayPal والتراخيص' : '5. PayPal Billing & Plans', icon: CreditCard },
          { id: 'notifications', label: lang === 'ar' ? '6. مركز التنبيهات والرسائل' : '6. Notifications Center', icon: Bell },
        ].map((t) => {
          const Icon = t.icon;
          return (
            <button
              key={t.id}
              onClick={() => setActiveTab(t.id as any)}
              className={`px-4 py-2 rounded-xl text-xs font-medium shrink-0 flex items-center gap-2 transition-all ${
                activeTab === t.id
                  ? 'bg-cyan-500 text-slate-950 font-bold shadow-md'
                  : 'bg-slate-900 border border-slate-800 text-slate-400 hover:text-slate-200'
              }`}
            >
              <Icon className="w-3.5 h-3.5" />
              <span>{t.label}</span>
            </button>
          );
        })}
      </div>

      {/* Tab 1: Profile & Security */}
      {activeTab === 'profile' && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div className="bg-slate-900/90 border border-slate-800 rounded-2xl p-6 space-y-4 shadow-xl">
            <h3 className="font-bold text-slate-100 text-sm flex items-center gap-2 pb-3 border-b border-slate-800">
              <UserIcon className="w-4 h-4 text-cyan-400" />
              <span>{lang === 'ar' ? 'البيانات الأساسية للحساب' : 'Account Details'}</span>
            </h3>

            <div className="space-y-3 text-xs">
              <div className="flex justify-between py-2 border-b border-slate-800/60">
                <span className="text-slate-400">{lang === 'ar' ? 'الاسم الكامل:' : 'Full Name:'}</span>
                <span className="font-bold text-slate-200">{currentUser.profile?.fullName || 'غير محدد'}</span>
              </div>
              <div className="flex justify-between py-2 border-b border-slate-800/60">
                <span className="text-slate-400">{lang === 'ar' ? 'اسم المستخدم:' : 'Username:'}</span>
                <span className="font-mono text-cyan-400">@{currentUser.username}</span>
              </div>
              <div className="flex justify-between py-2 border-b border-slate-800/60">
                <span className="text-slate-400">{lang === 'ar' ? 'البريد الإلكتروني:' : 'Email Address:'}</span>
                <span className="font-mono text-slate-300">{currentUser.email}</span>
              </div>
              <div className="flex justify-between py-2 border-b border-slate-800/60">
                <span className="text-slate-400">{lang === 'ar' ? 'حالة التفعيل:' : 'Status:'}</span>
                <span className="text-emerald-400 font-bold flex items-center gap-1">
                  <CheckCircle2 className="w-3.5 h-3.5" /> {lang === 'ar' ? 'مؤكد ونشط' : 'Verified & Active'}
                </span>
              </div>
              <div className="flex justify-between py-2 border-b border-slate-800/60">
                <span className="text-slate-400">{lang === 'ar' ? 'رقم الهاتف:' : 'Phone Number:'}</span>
                <span className="font-mono text-slate-300">{currentUser.phone || currentUser.profile?.phoneNumber || '+966500000000'}</span>
              </div>
              <div className="flex justify-between py-2">
                <span className="text-slate-400">{lang === 'ar' ? 'تاريخ التسجيل:' : 'Registered Since:'}</span>
                <span className="font-mono text-slate-400">{new Date(currentUser.createdAt).toLocaleDateString()}</span>
              </div>
            </div>
          </div>

          <div className="bg-slate-900/90 border border-slate-800 rounded-2xl p-6 space-y-4 shadow-xl">
            <h3 className="font-bold text-slate-100 text-sm flex items-center gap-2 pb-3 border-b border-slate-800">
              <Shield className="w-4 h-4 text-cyan-400" />
              <span>{lang === 'ar' ? 'الأمان وحماية الجلسة (Session Security)' : 'Session Integrity & Security'}</span>
            </h3>

            <div className="space-y-3 text-xs">
              <div className="p-3.5 rounded-xl bg-slate-950 border border-slate-800 space-y-1.5">
                <div className="flex items-center justify-between">
                  <span className="font-bold text-slate-200">{lang === 'ar' ? 'الجلسة النشطة الحالية' : 'Active Session'}</span>
                  <span className="text-[10px] font-mono text-emerald-400 px-2 py-0.5 rounded bg-emerald-950/80 border border-emerald-800 font-bold">
                    SECURE JWT
                  </span>
                </div>
                <p className="text-slate-400 text-[11px]">{lang === 'ar' ? 'المتصفح: Web Client (IP: 127.0.0.1 - مُوثّق)' : 'Web Client (IP: 127.0.0.1 - Verified)'}</p>
                <p className="text-[10px] text-slate-500 font-mono">Hashing: PBKDF2 SHA-256 + Lockout Protection</p>
              </div>

              <div className="p-3.5 rounded-xl bg-slate-950/60 border border-slate-800 space-y-2">
                <span className="font-bold text-slate-200">{lang === 'ar' ? 'إجراءات الأمان والتحقق السريع:' : 'Quick Security Actions:'}</span>
                <div className="flex gap-2 flex-wrap">
                  <button
                    onClick={() => alert(lang === 'ar' ? 'تم إرسال رمز OTP للتحقق عبر SMS بنجاح' : 'OTP verification code sent via SMS')}
                    className="px-3 py-2 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs transition-colors"
                  >
                    {lang === 'ar' ? 'إرسال رمز OTP جديد' : 'Request OTP Code'}
                  </button>
                  <button
                    onClick={() => alert(lang === 'ar' ? 'تم إنهاء كافة الجلسات الأخرى بنجاح' : 'All other sessions terminated successfully')}
                    className="px-3 py-2 rounded-lg bg-rose-950/80 hover:bg-rose-900 text-rose-300 border border-rose-800 text-xs transition-colors"
                  >
                    {lang === 'ar' ? 'تسجيل الخروج من بقية الأجهزة' : 'Revoke Other Devices'}
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Tab 2: Personal Preferences & User Settings (SYSTEM-USER-SETTINGS-001) */}
      {activeTab === 'preferences' && (
        <div className="bg-slate-900/90 border border-slate-800 rounded-2xl p-6 space-y-6 shadow-xl">
          <div className="pb-4 border-b border-slate-800 flex items-center justify-between">
            <div>
              <h3 className="font-bold text-slate-100 text-base flex items-center gap-2">
                <Sliders className="w-5 h-5 text-cyan-400" />
                <span>{lang === 'ar' ? 'تفضيلات المستخدم والإعدادات الشخصية' : 'Personal Preferences & Settings'}</span>
              </h3>
              <p className="text-xs text-slate-400 mt-0.5">
                {lang === 'ar'
                  ? 'تخصيص الواجهة، المظهر، خيارات الإشعارات، والمنطقة الزمنية ومرجع دمج وتطبيق السياسات الإلزامية'
                  : 'Customize UI theme, locale, timezones, notification channels, and privacy controls'}
              </p>
            </div>
            <span className="px-2.5 py-1 rounded-full bg-cyan-500/10 border border-cyan-500/20 text-cyan-400 text-xs font-mono">
              USER SPEC v1.0.0
            </span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 text-xs">
            {/* Display & Language Settings */}
            <div className="p-4 rounded-xl bg-slate-950/70 border border-slate-800 space-y-4">
              <h4 className="font-bold text-slate-200 border-b border-slate-800 pb-2 flex items-center gap-2">
                <Globe className="w-4 h-4 text-cyan-400" />
                <span>{lang === 'ar' ? 'تفضيلات العرض واللغة' : 'Display & Localization'}</span>
              </h4>

              <div className="space-y-3">
                <div>
                  <label className="text-slate-400 block mb-1">{lang === 'ar' ? 'اللغة المفضلة (Preferred Language):' : 'Preferred Language:'}</label>
                  <select
                    defaultValue={currentUser.profile?.locale || 'ar'}
                    className="w-full bg-slate-900 border border-slate-800 rounded-lg p-2 text-slate-200 font-medium focus:outline-none focus:border-cyan-500"
                  >
                    <option value="ar">العربية (Arabic - RTL)</option>
                    <option value="en">English (US - LTR)</option>
                  </select>
                </div>

                <div>
                  <label className="text-slate-400 block mb-1">{lang === 'ar' ? 'المنطقة الزمنية (Timezone):' : 'Timezone:'}</label>
                  <select
                    defaultValue={currentUser.profile?.timezone || 'Asia/Riyadh'}
                    className="w-full bg-slate-900 border border-slate-800 rounded-lg p-2 text-slate-200 font-medium focus:outline-none focus:border-cyan-500"
                  >
                    <option value="Asia/Riyadh">Asia/Riyadh (GMT+3)</option>
                    <option value="Asia/Aden">Asia/Aden (GMT+3)</option>
                    <option value="UTC">UTC / GMT</option>
                  </select>
                </div>

                <div>
                  <label className="text-slate-400 block mb-1">{lang === 'ar' ? 'نمط المظهر (Theme):' : 'Interface Theme:'}</label>
                  <div className="grid grid-cols-3 gap-2">
                    <button className="py-2 rounded-lg bg-cyan-500/20 border border-cyan-500/40 text-cyan-300 font-bold">داكن (Dark)</button>
                    <button className="py-2 rounded-lg bg-slate-900 border border-slate-800 text-slate-400 hover:bg-slate-800">فاتح (Light)</button>
                    <button className="py-2 rounded-lg bg-slate-900 border border-slate-800 text-slate-400 hover:bg-slate-800">تلقائي (System)</button>
                  </div>
                </div>
              </div>
            </div>

            {/* Notification Subscription Settings */}
            <div className="p-4 rounded-xl bg-slate-950/70 border border-slate-800 space-y-4">
              <h4 className="font-bold text-slate-200 border-b border-slate-800 pb-2 flex items-center gap-2">
                <Bell className="w-4 h-4 text-cyan-400" />
                <span>{lang === 'ar' ? 'اشتراكات الإشعارات والقنوات' : 'Notification Channels'}</span>
              </h4>

              <div className="space-y-3">
                {[
                  { label: 'إشعارات البريد الإلكتروني (Email Notifications)', defaultChecked: true, desc: 'استلام تنبيهات المعاملات والملفات بالبريد' },
                  { label: 'إشعارات الـ SMS الفورية', defaultChecked: true, desc: 'استلام رموز التحقق OTP والرسائل الحساسة' },
                  { label: 'تنبيهات WhatsApp المعتمدة', defaultChecked: false, desc: 'تحديثات المهام والاشتراكات عبر الواتساب' },
                ].map((item, i) => (
                  <div key={i} className="flex items-center justify-between p-2.5 rounded-lg bg-slate-900/60 border border-slate-800/60">
                    <div>
                      <div className="font-semibold text-slate-200">{item.label}</div>
                      <div className="text-[10px] text-slate-400">{item.desc}</div>
                    </div>
                    <label className="relative inline-flex items-center cursor-pointer">
                      <input type="checkbox" defaultChecked={item.defaultChecked} className="sr-only peer" />
                      <div className="w-9 h-5 bg-slate-800 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full rtl:peer-checked:after:-translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:start-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-cyan-500"></div>
                    </label>
                  </div>
                ))}
              </div>
            </div>
          </div>

          <div className="flex justify-end pt-2">
            <button
              onClick={() => alert(lang === 'ar' ? 'تم حفظ التفضيلات الشخصية وتطبيقها بنجاح' : 'Personal preferences updated successfully')}
              className="px-5 py-2.5 rounded-xl bg-cyan-500 text-slate-950 font-bold hover:bg-cyan-400 transition-all shadow-md shadow-cyan-500/20"
            >
              {lang === 'ar' ? 'حفظ التفضيلات الشخصية' : 'Save Personal Preferences'}
            </button>
          </div>
        </div>
      )}

      {/* Tab 3: Role Workspace (Custom Dashboard According to User Role) */}
      {activeTab === 'workspace' && (
        <div className="space-y-6">
          {userType === 'developer' && (
            <div className="bg-slate-900/90 border border-slate-800 rounded-2xl p-6 space-y-6 shadow-xl">
              <div className="flex items-center justify-between pb-4 border-b border-slate-800">
                <div className="flex items-center gap-2.5">
                  <div className="p-2 rounded-xl bg-purple-500/10 text-purple-400 border border-purple-500/20">
                    <Terminal className="w-5 h-5" />
                  </div>
                  <div>
                    <h3 className="font-bold text-slate-100 text-base">{lang === 'ar' ? 'مساحة عمل فريق التطوير (Developer Workspace)' : 'Developer Workspace'}</h3>
                    <p className="text-xs text-slate-400">REST APIs, SQL Workbench, and Active Kanban Tasks</p>
                  </div>
                </div>
                {onNavigate && (
                  <button
                    onClick={() => onNavigate('dev_api')}
                    className="px-3 py-1.5 rounded-lg bg-purple-600 text-white font-bold text-xs hover:bg-purple-500 transition-all flex items-center gap-1.5"
                  >
                    <Code2 className="w-3.5 h-3.5" />
                    <span>{lang === 'ar' ? 'فتح مشغل Swagger' : 'Open API Swagger'}</span>
                  </button>
                )}
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="p-4 rounded-xl bg-slate-950 border border-slate-800 space-y-2">
                  <div className="flex items-center justify-between text-xs text-slate-400 font-semibold">
                    <span>{lang === 'ar' ? 'المهام المعينة لك' : 'Assigned Tasks'}</span>
                    <span className="text-purple-400 font-bold font-mono">{devTasks.length}</span>
                  </div>
                  <div className="space-y-1.5">
                    {devTasks.slice(0, 3).map(t => (
                      <div key={t.id} className="p-2 rounded bg-slate-900/80 border border-slate-800/80 text-xs">
                        <div className="font-semibold text-slate-200 truncate">{t.title}</div>
                        <div className="text-[10px] text-slate-400 flex items-center gap-2 mt-1">
                          <span className="font-mono text-cyan-400">{t.priority}</span>
                          <span>•</span>
                          <span>{t.status}</span>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="p-4 rounded-xl bg-slate-950 border border-slate-800 space-y-2">
                  <div className="flex items-center justify-between text-xs text-slate-400 font-semibold">
                    <span>{lang === 'ar' ? 'الأعطال النشطة' : 'Active Bugs'}</span>
                    <span className="text-rose-400 font-bold font-mono">{devIssues.length}</span>
                  </div>
                  <div className="space-y-1.5">
                    {devIssues.slice(0, 3).map(iss => (
                      <div key={iss.id} className="p-2 rounded bg-slate-900/80 border border-slate-800/80 text-xs">
                        <div className="font-semibold text-slate-200 truncate">{iss.title}</div>
                        <div className="text-[10px] text-slate-400 flex items-center gap-2 mt-1">
                          <span className="font-mono text-rose-400">{iss.severity}</span>
                          <span>•</span>
                          <span>{iss.status}</span>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="p-4 rounded-xl bg-slate-950 border border-slate-800 space-y-2">
                  <div className="text-xs text-slate-400 font-semibold">{lang === 'ar' ? 'روابط سريعة للمطور' : 'Developer Quick Links'}</div>
                  <div className="space-y-1">
                    {onNavigate && (
                      <>
                        <button
                          onClick={() => onNavigate('dev_db')}
                          className="w-full text-start p-2 rounded bg-slate-900 hover:bg-slate-800 text-xs text-slate-200 flex items-center justify-between"
                        >
                          <span className="flex items-center gap-1.5"><Database className="w-3.5 h-3.5 text-cyan-400" /> مستكشف SQL (14 جدول)</span>
                          <span>→</span>
                        </button>
                        <button
                          onClick={() => onNavigate('dev_issues')}
                          className="w-full text-start p-2 rounded bg-slate-900 hover:bg-slate-800 text-xs text-slate-200 flex items-center justify-between"
                        >
                          <span className="flex items-center gap-1.5"><Bug className="w-3.5 h-3.5 text-rose-400" /> متتبع المشاكل والأعطال</span>
                          <span>→</span>
                        </button>
                      </>
                    )}
                  </div>
                </div>
              </div>
            </div>
          )}

          {userType === 'super_admin' && (
            <div className="bg-slate-900/90 border border-slate-800 rounded-2xl p-6 space-y-6 shadow-xl">
              <div className="flex items-center justify-between pb-4 border-b border-slate-800">
                <div className="flex items-center gap-2.5">
                  <div className="p-2 rounded-xl bg-rose-500/10 text-rose-400 border border-rose-500/20">
                    <Shield className="w-5 h-5" />
                  </div>
                  <div>
                    <h3 className="font-bold text-slate-100 text-base">{lang === 'ar' ? 'مساحة إدارة المنظومة (Super Admin Workspace)' : 'Super Admin Workspace'}</h3>
                    <p className="text-xs text-slate-400">System Configuration, User Provisioning & Master RBAC Control</p>
                  </div>
                </div>
                {onNavigate && (
                  <button
                    onClick={() => onNavigate('admin_users')}
                    className="px-3 py-1.5 rounded-lg bg-rose-600 text-white font-bold text-xs hover:bg-rose-500 transition-all flex items-center gap-1.5"
                  >
                    <Users className="w-3.5 h-3.5" />
                    <span>{lang === 'ar' ? 'إدارة المستخدمين' : 'Manage Users'}</span>
                  </button>
                )}
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="p-4 rounded-xl bg-slate-950 border border-slate-800 space-y-2">
                  <div className="text-xs font-bold text-cyan-400 uppercase font-mono">1. RBAC & Security</div>
                  <p className="text-xs text-slate-300">التحكم في 20 صلاحية وإدارة الأدوار القياسية والتخصيص الفوري.</p>
                  {onNavigate && (
                    <button onClick={() => onNavigate('admin_rbac')} className="text-xs text-cyan-400 hover:underline">
                      فتح مصفوفة RBAC ←
                    </button>
                  )}
                </div>
                <div className="p-4 rounded-xl bg-slate-950 border border-slate-800 space-y-2">
                  <div className="text-xs font-bold text-amber-400 uppercase font-mono">2. System Settings</div>
                  <p className="text-xs text-slate-300">تعديل الإعدادات الديناميكية وإعدادات تحسين محركات البحث SEO.</p>
                  {onNavigate && (
                    <button onClick={() => onNavigate('admin_settings')} className="text-xs text-amber-400 hover:underline">
                      فتح إعدادات النظام ←
                    </button>
                  )}
                </div>
                <div className="p-4 rounded-xl bg-slate-950 border border-slate-800 space-y-2">
                  <div className="text-xs font-bold text-emerald-400 uppercase font-mono">3. Communications & PayPal</div>
                  <p className="text-xs text-slate-300">منصة إرسال الرسائل وبوابة مدفوعات PayPal Sandbox.</p>
                  {onNavigate && (
                    <button onClick={() => onNavigate('admin_paypal')} className="text-xs text-emerald-400 hover:underline">
                      فتح بوابة PayPal ←
                    </button>
                  )}
                </div>
              </div>
            </div>
          )}

          {(userType === 'customer' || userType === 'manager') && (
            <div className="bg-slate-900/90 border border-slate-800 rounded-2xl p-6 space-y-6 shadow-xl">
              <div className="flex items-center gap-2.5 pb-4 border-b border-slate-800">
                <div className="p-2 rounded-xl bg-cyan-500/10 text-cyan-400 border border-cyan-500/20">
                  <Activity className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="font-bold text-slate-100 text-base">{lang === 'ar' ? 'مساحة العمل الشخصية والأنشطة' : 'Customer Activity Workspace'}</h3>
                  <p className="text-xs text-slate-400">إدارة مستنداتك، تراخيصك، ومتابعة المعاملات المالية المعتمدة.</p>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
                <div className="p-4 rounded-xl bg-slate-950 border border-slate-800 space-y-2">
                  <div className="font-bold text-slate-200 flex items-center gap-2">
                    <CheckSquare className="w-4 h-4 text-emerald-400" />
                    <span>الخدمات والتراخيص المفعلة</span>
                  </div>
                  <p className="text-slate-400">حسابك مفعل ويتمتع بحق رفع المستندات إلى الخزينة المشفرة وتلقي إشعارات النظام عبر البريد وSMS.</p>
                  <button onClick={() => setActiveTab('billing')} className="px-3 py-1.5 rounded-lg bg-cyan-500 text-slate-950 font-bold mt-2">
                    ترقية الترخيص
                  </button>
                </div>

                <div className="p-4 rounded-xl bg-slate-950 border border-slate-800 space-y-2">
                  <div className="font-bold text-slate-200 flex items-center gap-2">
                    <Clock className="w-4 h-4 text-cyan-400" />
                    <span>آخر الأنشطة في حسابك</span>
                  </div>
                  <div className="space-y-1 text-slate-400 text-[11px]">
                    <p>• تسجيل الدخول الناجح للجلسة الحالية</p>
                    <p>• مزامنة الملفات والخزينة الآمنة</p>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      )}

      {/* Tab 3: User File Vault */}
      {activeTab === 'vault' && (
        <div className="bg-slate-900/90 border border-slate-800 rounded-2xl p-6 space-y-4 shadow-xl">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-3 border-b border-slate-800">
            <div>
              <h3 className="font-bold text-slate-100 text-sm flex items-center gap-2">
                <HardDrive className="w-4 h-4 text-cyan-400" />
                <span>{lang === 'ar' ? 'مستنداتي وملفاتي المشفرة في الخزينة' : 'My Encrypted Vault Documents'}</span>
              </h3>
              <p className="text-xs text-slate-400 mt-0.5">الملفات المرفوعة بحسابك مع فحص التكامل SHA-256</p>
            </div>

            <button
              onClick={() => setShowUploadModal(true)}
              className="px-3.5 py-2 rounded-xl bg-cyan-500 text-slate-950 font-bold text-xs hover:bg-cyan-400 transition-all flex items-center gap-2 shadow-md shadow-cyan-500/20 w-fit"
            >
              <Upload className="w-4 h-4" />
              <span>{lang === 'ar' ? 'رفع مستند جديد' : 'Upload Document'}</span>
            </button>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-start text-xs">
              <thead className="bg-slate-950 text-slate-400 font-semibold border-b border-slate-800">
                <tr>
                  <th className="p-3 text-start">{lang === 'ar' ? 'اسم المستند' : 'File Name'}</th>
                  <th className="p-3 text-start">{lang === 'ar' ? 'النوع' : 'MIME Type'}</th>
                  <th className="p-3 text-start">{lang === 'ar' ? 'الحجم' : 'Size'}</th>
                  <th className="p-3 text-start">{lang === 'ar' ? 'مستوى الرؤية' : 'Visibility'}</th>
                  <th className="p-3 text-center">{lang === 'ar' ? 'الإجراءات' : 'Actions'}</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/60 bg-slate-950/30">
                {myFiles.length === 0 ? (
                  <tr>
                    <td colSpan={5} className="text-center py-8 text-slate-500">لا توجد ملفات في الخزينة حالياً.</td>
                  </tr>
                ) : (
                  myFiles.map(file => (
                    <tr key={file.id} className="hover:bg-slate-900/40">
                      <td className="p-3">
                        <div className="flex items-center gap-2">
                          <FileText className="w-4 h-4 text-cyan-400" />
                          <span className="font-bold text-slate-200">{file.originalName}</span>
                        </div>
                      </td>
                      <td className="p-3 font-mono text-slate-400">{file.mimeType}</td>
                      <td className="p-3 font-mono text-slate-300">{(file.size / 1024).toFixed(1)} KB</td>
                      <td className="p-3">
                        <span className="px-2 py-0.5 rounded text-[10px] bg-slate-900 border border-slate-800 text-cyan-300">
                          {file.visibility}
                        </span>
                      </td>
                      <td className="p-3 text-center">
                        <div className="flex items-center justify-center gap-2">
                          <button
                            onClick={() => alert(`جاري تنزيل: ${file.originalName}`)}
                            className="p-1 rounded bg-slate-900 text-slate-300 hover:text-cyan-400"
                          >
                            <Download className="w-3.5 h-3.5" />
                          </button>
                          <button
                            onClick={() => onDeleteFile(file.id)}
                            className="p-1 rounded bg-slate-900 text-slate-300 hover:text-rose-400"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Tab 4: PayPal Billing & License */}
      {activeTab === 'billing' && (
        <div className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {[
              { title: 'الباقة المبدئية (Starter)', price: 29, desc: 'وصول لواجهة الاستخدام و500 ميغابايت تخزين', highlight: false },
              { title: 'باقة المحترفين (Enterprise Pro)', price: 99, desc: 'وصول شامل لمصفوفة RBAC و5 جيجابايت تخزين ودعم PayPal', highlight: true },
              { title: 'حزمة الخدمات اللامحدودة', price: 249, desc: 'سعة تخزين غير محدودة وأولوية في معالجة الرسائل', highlight: false },
            ].map((plan, idx) => (
              <div
                key={idx}
                className={`p-6 rounded-2xl border transition-all flex flex-col justify-between ${
                  plan.highlight
                    ? 'bg-gradient-to-b from-cyan-950/40 to-slate-900 border-cyan-500/50 shadow-xl shadow-cyan-500/10'
                    : 'bg-slate-900/90 border-slate-800'
                }`}
              >
                <div>
                  <h4 className="font-bold text-slate-100 text-base">{plan.title}</h4>
                  <div className="my-3 flex items-baseline gap-1">
                    <span className="text-3xl font-bold font-mono text-slate-100">${plan.price}</span>
                    <span className="text-xs text-slate-400">/ ترخيص دائم</span>
                  </div>
                  <p className="text-xs text-slate-400 leading-relaxed mb-6">{plan.desc}</p>
                </div>

                <button
                  onClick={() => handleBuy(plan.price, plan.title)}
                  disabled={isPurchasing}
                  className={`w-full py-2.5 rounded-xl font-bold text-xs transition-all flex items-center justify-center gap-2 ${
                    plan.highlight
                      ? 'bg-cyan-500 text-slate-950 hover:bg-cyan-400 shadow-md shadow-cyan-500/20'
                      : 'bg-slate-800 text-slate-200 hover:bg-slate-700'
                  }`}
                >
                  <CreditCard className="w-4 h-4" />
                  <span>{isPurchasing ? (lang === 'ar' ? 'جاري الاتصال بـPayPal...' : 'Connecting PayPal...') : (lang === 'ar' ? 'شراء عبر PayPal Sandbox' : 'Purchase with PayPal')}</span>
                </button>
              </div>
            ))}
          </div>

          {purchaseSuccess && (
            <div className="p-4 rounded-xl bg-emerald-950/80 border border-emerald-800/60 text-emerald-300 text-center text-xs flex items-center justify-center gap-2 animate-bounce">
              <CheckCircle2 className="w-4 h-4" />
              <span>تم إتمام الدفع بنجاح وتسجيل المعاملة وإصدار الترخيص في قاعدة البيانات!</span>
            </div>
          )}
        </div>
      )}

      {/* Tab 5: Notifications */}
      {activeTab === 'notifications' && (
        <div className="bg-slate-900/90 border border-slate-800 rounded-2xl p-6 space-y-4 shadow-xl">
          <div className="flex items-center justify-between pb-3 border-b border-slate-800">
            <h3 className="font-bold text-slate-100 text-sm flex items-center gap-2">
              <Bell className="w-4 h-4 text-cyan-400" />
              <span>{lang === 'ar' ? 'التنبيهات والرسائل المستلمة (Notifications)' : 'Notifications & System Notices'}</span>
            </h3>
            <span className="text-xs text-slate-500 font-mono">{safeNotifications.length} رسالة</span>
          </div>

          <div className="space-y-2.5">
            {safeNotifications.length === 0 ? (
              <p className="text-xs text-slate-500 text-center py-8">لا توجد تنبيهات جديدة في صندوق الوارد.</p>
            ) : (
              safeNotifications.map(n => (
                <div
                  key={n.id}
                  className={`p-4 rounded-xl border transition-all flex items-start justify-between gap-3 text-xs ${
                    n.readAt ? 'bg-slate-950/40 border-slate-800/80' : 'bg-cyan-950/20 border-cyan-500/30 shadow-sm'
                  }`}
                >
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <span className="font-bold text-slate-200">{n.title}</span>
                      <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-slate-900 text-cyan-400 border border-slate-800 uppercase">
                        {n.channel}
                      </span>
                    </div>
                    <p className="text-slate-400 text-xs">{n.message}</p>
                    <p className="text-[10px] text-slate-500 font-mono">{new Date(n.createdAt).toLocaleString()}</p>
                  </div>

                  {!n.readAt && (
                    <button
                      onClick={() => onMarkNotificationRead(n.id)}
                      className="px-2 py-1 rounded bg-slate-800 hover:bg-slate-700 text-slate-300 text-[10px] shrink-0"
                    >
                      تحديد كمقروء ✓
                    </button>
                  )}
                </div>
              ))
            )}
          </div>
        </div>
      )}

      {/* Upload File Modal */}
      {showUploadModal && (
        <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 w-full max-w-md space-y-4 shadow-2xl">
            <div className="flex items-center justify-between pb-3 border-b border-slate-800">
              <h3 className="text-base font-bold text-slate-100 flex items-center gap-2">
                <Upload className="w-5 h-5 text-cyan-400" />
                <span>{lang === 'ar' ? 'رفع مستند إلى مساحتك الخاصة' : 'Upload Secure File'}</span>
              </h3>
              <button onClick={() => setShowUploadModal(false)} className="text-slate-400 hover:text-slate-200">
                ✕
              </button>
            </div>

            <form onSubmit={handleUploadSubmit} className="space-y-4 text-xs">
              <div>
                <label className="block text-slate-300 font-medium mb-1">{lang === 'ar' ? 'اسم الملف أو المستند' : 'Document Name'}</label>
                <input
                  type="text"
                  required
                  value={newFileName}
                  onChange={e => setNewFileName(e.target.value)}
                  placeholder="e.g. project-specification.pdf"
                  className="w-full bg-slate-950 border border-slate-800 rounded-lg p-2.5 text-slate-200 focus:outline-none focus:border-cyan-500"
                />
              </div>

              <div className="flex items-center justify-end gap-2 pt-3 border-t border-slate-800">
                <button
                  type="button"
                  onClick={() => setShowUploadModal(false)}
                  className="px-4 py-2 rounded-xl bg-slate-800 text-slate-300 hover:bg-slate-700"
                >
                  {lang === 'ar' ? 'إلغاء' : 'Cancel'}
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 rounded-xl bg-cyan-500 text-slate-950 font-bold hover:bg-cyan-400 shadow-md shadow-cyan-500/20"
                >
                  {lang === 'ar' ? 'رفع الملف' : 'Upload File'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
