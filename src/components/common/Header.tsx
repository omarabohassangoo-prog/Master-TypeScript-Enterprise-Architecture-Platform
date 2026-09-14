import React, { useState } from 'react';
import {
  ShieldCheck, Terminal, User as UserIcon, Bell, Globe,
  Cpu, Layers, Sparkles, CheckCircle2, ChevronDown, Menu, X
} from 'lucide-react';
import { User, NotificationItem } from '../../types';

interface HeaderProps {
  currentUser: User;
  notifications?: NotificationItem[];
  activeView?: string;
  setActiveView?: (view: string) => void;
  onNavigate?: (view: string) => void;
  onSwitchPersona?: (role: 'super_admin' | 'developer' | 'customer') => void;
  onSwitchUser?: (userType: 'super_admin' | 'developer' | 'customer') => void;
  lang: 'ar' | 'en';
  setLang?: (lang: 'ar' | 'en') => void;
  onToggleLang?: () => void;
  onOpenAuth?: () => void;
  onOpenLoginModal?: () => void;
  onMarkNotificationRead?: (id: string) => void;
  isSidebarOpen?: boolean;
  onToggleSidebar?: () => void;
}

export const Header: React.FC<HeaderProps> = ({
  currentUser,
  notifications = [],
  activeView = 'blueprint',
  setActiveView,
  onNavigate,
  onSwitchPersona,
  onSwitchUser,
  lang,
  setLang,
  onToggleLang,
  onOpenAuth,
  onOpenLoginModal,
  onMarkNotificationRead,
  isSidebarOpen,
  onToggleSidebar,
}) => {
  const [showUserMenu, setShowUserMenu] = useState(false);
  const [showNotifMenu, setShowNotifMenu] = useState(false);

  const safeNotifications = notifications || [];
  const unreadNotifs = safeNotifications.filter(n => n && !n.readAt);

  const handleSwitch = (role: 'super_admin' | 'developer' | 'customer') => {
    if (onSwitchPersona) {
      onSwitchPersona(role);
    } else if (onSwitchUser) {
      onSwitchUser(role);
    }
    setShowUserMenu(false);
  };

  const handleOpenLogin = () => {
    if (onOpenLoginModal) {
      onOpenLoginModal();
    } else if (onOpenAuth) {
      onOpenAuth();
    }
    setShowUserMenu(false);
  };

  const handleToggleLanguage = () => {
    if (onToggleLang) {
      onToggleLang();
    } else if (setLang) {
      setLang(lang === 'ar' ? 'en' : 'ar');
    }
  };

  const handleNavigate = (view: string) => {
    if (onNavigate) {
      onNavigate(view);
    } else if (setActiveView) {
      setActiveView(view);
    }
  };

  const getPersonaBadge = () => {
    if (currentUser?.userType === 'super_admin') {
      return { label: lang === 'ar' ? 'مدير النظام الأعلى' : 'Super Admin', color: 'bg-rose-500/20 text-rose-400 border-rose-500/30' };
    }
    if (currentUser?.userType === 'developer') {
      return { label: lang === 'ar' ? 'فريق التطوير والأنظمة' : 'Lead Developer', color: 'bg-cyan-500/20 text-cyan-400 border-cyan-500/30' };
    }
    return { label: lang === 'ar' ? 'مستخدم قياسي' : 'Standard User', color: 'bg-emerald-500/20 text-emerald-400 border-emerald-500/30' };
  };

  const badge = getPersonaBadge();

  return (
    <header className="sticky top-0 z-40 bg-slate-950/90 border-b border-slate-800 backdrop-blur-md px-4 lg:px-8 py-3">
      <div className="max-w-7xl mx-auto flex items-center justify-between gap-4">
        
        {/* Left / Brand Area */}
        <div className="flex items-center gap-3 sm:gap-4">
          {onToggleSidebar && (
            <button
              onClick={onToggleSidebar}
              className="lg:hidden p-2 rounded-lg bg-slate-900 border border-slate-800 text-slate-300 hover:text-cyan-400"
              aria-label="Toggle Sidebar"
            >
              {isSidebarOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </button>
          )}

          <button
            onClick={() => handleNavigate('blueprint')}
            className="flex items-center gap-3 group text-start focus:outline-none"
          >
            <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-cyan-600 via-indigo-600 to-purple-600 p-0.5 shadow-lg shadow-cyan-500/20 flex items-center justify-center">
              <div className="w-full h-full bg-slate-950 rounded-[10px] flex items-center justify-center">
                <Layers className="w-5 h-5 text-cyan-400 group-hover:rotate-12 transition-transform duration-300" />
              </div>
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="font-bold text-base text-slate-100 group-hover:text-cyan-400 transition-colors">
                  {lang === 'ar' ? 'المنصة المعمارية الشاملة' : 'Master Enterprise Architecture'}
                </span>
                <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-cyan-950/80 text-cyan-400 border border-cyan-800/50 hidden sm:inline-block">
                  v1.0 TypeScript
                </span>
              </div>
              <p className="text-xs text-slate-400 hidden sm:block">
                {lang === 'ar' ? 'عقود معمارية + لوحات تحكم + RBAC + محولات خدمات' : 'Multi-tier Full-Stack System with RBAC & Gateway Adapters'}
              </p>
            </div>
          </button>
        </div>

        {/* Navigation Tabs (Top quick switch) */}
        <nav className="hidden md:flex items-center bg-slate-900/90 border border-slate-800 rounded-lg p-1 text-xs">
          <button
            onClick={() => handleNavigate('blueprint')}
            className={`px-3 py-1.5 rounded-md font-medium transition-all flex items-center gap-1.5 ${
              activeView === 'blueprint' ? 'bg-cyan-500 text-slate-950 font-bold shadow' : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            <Layers className="w-3.5 h-3.5" />
            <span>{lang === 'ar' ? 'المخطط المعماري (Blueprint)' : 'Master Architecture'}</span>
          </button>

          <button
            onClick={() => handleNavigate('admin_dashboard')}
            className={`px-3 py-1.5 rounded-md font-medium transition-all flex items-center gap-1.5 ${
              activeView.startsWith('admin_') ? 'bg-cyan-500 text-slate-950 font-bold shadow' : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            <ShieldCheck className="w-3.5 h-3.5" />
            <span>{lang === 'ar' ? 'لوحة المدير (Admin)' : 'Admin Dashboard'}</span>
          </button>

          <button
            onClick={() => handleNavigate('dev_dashboard')}
            className={`px-3 py-1.5 rounded-md font-medium transition-all flex items-center gap-1.5 ${
              activeView.startsWith('dev_') ? 'bg-cyan-500 text-slate-950 font-bold shadow' : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            <Terminal className="w-3.5 h-3.5" />
            <span>{lang === 'ar' ? 'فريق التطوير (Dev)' : 'Dev Workbench'}</span>
          </button>

          <button
            onClick={() => handleNavigate('customer_portal')}
            className={`px-3 py-1.5 rounded-md font-medium transition-all flex items-center gap-1.5 ${
              activeView === 'customer_portal' || activeView.startsWith('user_') ? 'bg-cyan-500 text-slate-950 font-bold shadow' : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            <UserIcon className="w-3.5 h-3.5" />
            <span>{lang === 'ar' ? 'لوحة المستخدم' : 'User Portal'}</span>
          </button>
        </nav>

        {/* Right Action Icons & Persona Switcher */}
        <div className="flex items-center gap-3">
          
          {/* Health status badge */}
          <div className="hidden xl:flex items-center gap-2 px-2.5 py-1 rounded-full bg-emerald-950/40 border border-emerald-800/40 text-emerald-400 text-xs">
            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></span>
            <span>{lang === 'ar' ? 'الخادم وقاعدة البيانات متصلان (2ms)' : 'Server & DB Online'}</span>
          </div>

          {/* Language Switcher */}
          <button
            onClick={handleToggleLanguage}
            className="p-2 rounded-lg bg-slate-900 border border-slate-800 text-slate-300 hover:text-cyan-400 transition-colors text-xs flex items-center gap-1"
            title="تبديل اللغة / Toggle Language"
          >
            <Globe className="w-4 h-4" />
            <span className="font-mono uppercase">{lang}</span>
          </button>

          {/* Notifications Bell */}
          <div className="relative">
            <button
              onClick={() => setShowNotifMenu(!showNotifMenu)}
              className="p-2 rounded-lg bg-slate-900 border border-slate-800 text-slate-300 hover:text-cyan-400 transition-colors relative"
            >
              <Bell className="w-4 h-4" />
              {unreadNotifs.length > 0 && (
                <span className="absolute -top-1 -right-1 w-4 h-4 rounded-full bg-rose-500 text-[10px] font-bold text-white flex items-center justify-center animate-bounce">
                  {unreadNotifs.length}
                </span>
              )}
            </button>

            {/* Notifications Dropdown */}
            {showNotifMenu && (
              <div className="absolute left-0 sm:left-auto right-0 mt-2 w-80 bg-slate-900 border border-slate-800 rounded-xl shadow-2xl p-3 z-50">
                <div className="flex items-center justify-between pb-2 border-b border-slate-800 mb-2">
                  <h4 className="text-xs font-bold text-slate-200">
                    {lang === 'ar' ? 'مركز الإشعارات الفورية' : 'Live Notifications'}
                  </h4>
                  <span className="text-[10px] text-slate-400">{safeNotifications.length} رسالة</span>
                </div>
                <div className="space-y-2 max-h-64 overflow-y-auto">
                  {safeNotifications.length === 0 ? (
                    <p className="text-xs text-slate-500 py-3 text-center">
                      {lang === 'ar' ? 'لا توجد إشعارات حالياً' : 'No notifications'}
                    </p>
                  ) : (
                    safeNotifications.map(n => (
                      <div
                        key={n.id}
                        onClick={() => onMarkNotificationRead?.(n.id)}
                        className={`p-2 rounded-lg border text-xs cursor-pointer transition-colors ${
                          n.readAt ? 'bg-slate-950/40 border-slate-800/40 text-slate-400' : 'bg-slate-800/80 border-cyan-500/30 text-slate-200'
                        }`}
                      >
                        <div className="flex items-center justify-between font-semibold mb-1">
                          <span>{n.title}</span>
                          <span className="text-[10px] text-slate-500">{new Date(n.createdAt).toLocaleTimeString()}</span>
                        </div>
                        <p className="text-[11px] text-slate-400">{n.message}</p>
                      </div>
                    ))
                  )}
                </div>
              </div>
            )}
          </div>

          {/* User Profile & Persona Switcher */}
          <div className="relative">
            <button
              onClick={() => setShowUserMenu(!showUserMenu)}
              className="flex items-center gap-2 p-1.5 pl-3 rounded-lg bg-slate-900 border border-slate-800 hover:border-slate-700 transition-colors"
            >
              <img
                src={currentUser?.profile?.avatarUrl || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=80'}
                alt={currentUser?.profile?.fullName || currentUser?.username || 'User'}
                className="w-7 h-7 rounded-md object-cover border border-slate-700"
              />
              <div className="text-start hidden sm:block">
                <p className="text-xs font-semibold text-slate-200 leading-none">
                  {(currentUser?.profile?.fullName || currentUser?.username || 'User').split(' ')[0]}
                </p>
                <span className={`text-[9px] px-1.5 py-0.2 rounded border inline-block mt-0.5 ${badge.color}`}>
                  {badge.label}
                </span>
              </div>
              <ChevronDown className="w-3.5 h-3.5 text-slate-400" />
            </button>

            {/* Persona Quick Switcher Modal / Dropdown */}
            {showUserMenu && (
              <div className="absolute left-0 sm:left-auto right-0 mt-2 w-72 bg-slate-900 border border-slate-800 rounded-xl shadow-2xl p-3 z-50">
                <div className="pb-3 border-b border-slate-800 mb-2">
                  <p className="text-xs font-bold text-slate-200">{currentUser?.profile?.fullName || 'User'}</p>
                  <p className="text-[11px] text-slate-400 font-mono">{currentUser?.email}</p>
                  <span className={`text-[10px] px-2 py-0.5 rounded border inline-block mt-1 ${badge.color}`}>
                    {badge.label}
                  </span>
                </div>

                <p className="text-[10px] font-bold uppercase tracking-wider text-slate-500 mb-2">
                  {lang === 'ar' ? 'محاكاة وتبديل الحسابات (Archetypes)' : 'Quick Role Switcher'}
                </p>

                <div className="space-y-1.5">
                  <button
                    onClick={() => handleSwitch('super_admin')}
                    className="w-full text-start p-2 rounded-lg bg-slate-950/60 hover:bg-slate-800 border border-slate-800/80 flex items-center justify-between text-xs"
                  >
                    <div>
                      <p className="font-semibold text-slate-200">مدير النظام الأعلى (Super Admin)</p>
                      <p className="text-[10px] text-slate-400">كامل صلاحيات النظام والتحكم</p>
                    </div>
                    {currentUser?.userType === 'super_admin' && <CheckCircle2 className="w-4 h-4 text-cyan-400" />}
                  </button>

                  <button
                    onClick={() => handleSwitch('developer')}
                    className="w-full text-start p-2 rounded-lg bg-slate-950/60 hover:bg-slate-800 border border-slate-800/80 flex items-center justify-between text-xs"
                  >
                    <div>
                      <p className="font-semibold text-slate-200">فريق التطوير (Developer)</p>
                      <p className="text-[10px] text-slate-400">قواعد البيانات، API، وتتبع المشاكل</p>
                    </div>
                    {currentUser?.userType === 'developer' && <CheckCircle2 className="w-4 h-4 text-cyan-400" />}
                  </button>

                  <button
                    onClick={() => handleSwitch('customer')}
                    className="w-full text-start p-2 rounded-lg bg-slate-950/60 hover:bg-slate-800 border border-slate-800/80 flex items-center justify-between text-xs"
                  >
                    <div>
                      <p className="font-semibold text-slate-200">مستخدم قياسي (User)</p>
                      <p className="text-[10px] text-slate-400">لوحة الملفات، الجلسات، والإشعارات</p>
                    </div>
                    {currentUser?.userType === 'customer' && <CheckCircle2 className="w-4 h-4 text-cyan-400" />}
                  </button>
                </div>

                <div className="pt-2 mt-2 border-t border-slate-800 flex items-center justify-between">
                  <button
                    onClick={handleOpenLogin}
                    className="text-xs text-cyan-400 hover:underline flex items-center gap-1"
                  >
                    <Sparkles className="w-3.5 h-3.5" />
                    <span>{lang === 'ar' ? 'نافذة تسجيل الدخول الحقيقي' : 'Real Login Portal'}</span>
                  </button>
                </div>
              </div>
            )}
          </div>

        </div>

      </div>
    </header>
  );
};
