import React, { useState } from 'react';
import {
  Lock, Mail, Key, Shield, UserCheck, AlertCircle, ArrowRight,
  CheckCircle2, User, UserPlus, Phone, RefreshCw, Smartphone, Eye, EyeOff
} from 'lucide-react';
import { User as UserType } from '../../types';

interface LoginModalProps {
  isOpen: boolean;
  onClose: () => void;
  onLoginSuccess: (user: UserType) => void;
  lang: 'ar' | 'en';
}

export const LoginModal: React.FC<LoginModalProps> = ({
  isOpen,
  onClose,
  onLoginSuccess,
  lang,
}) => {
  const [authMode, setAuthMode] = useState<'login' | 'register' | 'forgot'>('login');
  
  // Login Form
  const [emailOrUsername, setEmailOrUsername] = useState('admin@enterprise.local');
  const [password, setPassword] = useState('password123');
  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(true);

  // Register Form
  const [regFullName, setRegFullName] = useState('');
  const [regUsername, setRegUsername] = useState('');
  const [regEmail, setRegEmail] = useState('');
  const [regPhone, setRegPhone] = useState('');
  const [regPassword, setRegPassword] = useState('');
  const [regUserType, setRegUserType] = useState<'customer' | 'developer' | 'manager'>('customer');

  // Forgot Password
  const [forgotEmail, setForgotEmail] = useState('');
  const [forgotSuccess, setForgotSuccess] = useState(false);

  const [isLoading, setIsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  if (!isOpen) return null;

  const handleManualLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setErrorMessage(null);

    try {
      const response = await fetch('/api/v1/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ emailOrUsername, password }),
      });
      const data = await response.json();

      if (data.success && data.data?.user) {
        onLoginSuccess(data.data.user);
        onClose();
      } else {
        setErrorMessage(data.error?.message || (lang === 'ar' ? 'بيانات الدخول غير صحيحة أو الحساب مقفل.' : 'Invalid credentials or account locked.'));
      }
    } catch (err: any) {
      setErrorMessage(lang === 'ar' ? 'تعذر الاتصال بالخادم. حاول مرة أخرى.' : 'Connection failed. Please retry.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setErrorMessage(null);
    setSuccessMessage(null);

    try {
      const response = await fetch('/api/v1/auth/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          fullName: regFullName,
          username: regUsername,
          email: regEmail,
          phone: regPhone,
          password: regPassword,
          userType: regUserType,
        }),
      });
      const data = await response.json();

      if (data.success && data.data?.user) {
        setSuccessMessage(lang === 'ar' ? 'تم إنشاء الحساب وتوثيقه بنجاح! جاري توجيهك...' : 'Account created successfully! Redirecting...');
        setTimeout(() => {
          onLoginSuccess(data.data.user);
          onClose();
        }, 1200);
      } else {
        setErrorMessage(data.error?.message || (lang === 'ar' ? 'فشل إنشاء الحساب. تأكد من البيانات.' : 'Registration failed.'));
      }
    } catch (err: any) {
      setErrorMessage(lang === 'ar' ? 'تعذر الاتصال بالخادم أثناء التسجيل.' : 'Connection error during registration.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleForgotPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setErrorMessage(null);

    try {
      const response = await fetch('/api/v1/auth/forgot-password', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: forgotEmail }),
      });
      const data = await response.json();

      if (data.success) {
        setForgotSuccess(true);
      } else {
        setErrorMessage(data.error?.message || (lang === 'ar' ? 'تعذر العثور على البريد الإلكتروني.' : 'Email not found.'));
      }
    } catch (err) {
      setErrorMessage(lang === 'ar' ? 'فشل إرسال رابط الاستعادة.' : 'Failed to send reset link.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleQuickPersona = async (email: string) => {
    setIsLoading(true);
    setErrorMessage(null);
    try {
      const response = await fetch('/api/v1/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ emailOrUsername: email, password: 'password123' }),
      });
      const data = await response.json();

      if (data.success && data.data?.user) {
        onLoginSuccess(data.data.user);
        onClose();
      }
    } catch (err) {
      setErrorMessage(lang === 'ar' ? 'فشل تسجيل الدخول السريع' : 'Quick login failed');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-slate-950/85 backdrop-blur-md flex items-center justify-center p-4 overflow-y-auto">
      <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 sm:p-8 w-full max-w-lg space-y-6 shadow-2xl relative overflow-hidden my-auto">
        {/* Glow accent */}
        <div className="absolute top-0 right-0 w-72 h-72 bg-cyan-500/10 rounded-full blur-3xl pointer-events-none"></div>

        {/* Modal Header */}
        <div className="flex items-center justify-between relative z-10 pb-4 border-b border-slate-800">
          <div className="flex items-center gap-2.5">
            <div className="p-2.5 rounded-xl bg-cyan-500/10 border border-cyan-500/20 text-cyan-400">
              {authMode === 'login' ? <Lock className="w-5 h-5" /> : authMode === 'register' ? <UserPlus className="w-5 h-5" /> : <Shield className="w-5 h-5" />}
            </div>
            <div>
              <h3 className="font-bold text-slate-100 text-base">
                {authMode === 'login'
                  ? (lang === 'ar' ? 'بوابة تسجيل الدخول الآمن' : 'Secure Authentication Portal')
                  : authMode === 'register'
                  ? (lang === 'ar' ? 'إنشاء حساب جديد بالمنظومة' : 'Create Enterprise Account')
                  : (lang === 'ar' ? 'استعادة كلمة المرور' : 'Password Recovery')}
              </h3>
              <p className="text-[11px] text-slate-400">PBKDF2 Hash • Role-Based Dashboards • Multi-Tenant</p>
            </div>
          </div>
          <button onClick={onClose} className="p-1.5 rounded-lg text-slate-400 hover:text-slate-200 hover:bg-slate-800 transition-all">
            ✕
          </button>
        </div>

        {/* Mode Selector Tabs */}
        <div className="grid grid-cols-3 gap-1 p-1 bg-slate-950 border border-slate-800/80 rounded-xl text-xs font-semibold">
          <button
            type="button"
            onClick={() => { setAuthMode('login'); setErrorMessage(null); }}
            className={`py-2 rounded-lg transition-all ${
              authMode === 'login' ? 'bg-cyan-500 text-slate-950 shadow-md font-bold' : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            {lang === 'ar' ? 'تسجيل الدخول' : 'Sign In'}
          </button>
          <button
            type="button"
            onClick={() => { setAuthMode('register'); setErrorMessage(null); }}
            className={`py-2 rounded-lg transition-all ${
              authMode === 'register' ? 'bg-cyan-500 text-slate-950 shadow-md font-bold' : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            {lang === 'ar' ? 'حساب جديد' : 'Register'}
          </button>
          <button
            type="button"
            onClick={() => { setAuthMode('forgot'); setErrorMessage(null); setForgotSuccess(false); }}
            className={`py-2 rounded-lg transition-all ${
              authMode === 'forgot' ? 'bg-cyan-500 text-slate-950 shadow-md font-bold' : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            {lang === 'ar' ? 'نسيت الرمز؟' : 'Forgot?'}
          </button>
        </div>

        {/* Quick Demo Personas (Visible in Login Mode) */}
        {authMode === 'login' && (
          <div className="space-y-2">
            <label className="block text-[11px] font-bold text-slate-400 uppercase tracking-wider">
              {lang === 'ar' ? 'الدخول السريع حسب نوع الحساب (1-Click Personas):' : '1-Click Persona Quick Logins:'}
            </label>
            <div className="grid grid-cols-3 gap-2">
              <button
                type="button"
                onClick={() => handleQuickPersona('admin@enterprise.local')}
                className="p-2.5 rounded-xl bg-slate-950/80 border border-cyan-500/40 hover:bg-cyan-950/30 text-center transition-all group"
              >
                <p className="font-bold text-cyan-400 text-xs group-hover:scale-105 transition-transform">Super Admin</p>
                <p className="text-[10px] text-slate-400">{lang === 'ar' ? 'مدير النظام' : 'Full Access'}</p>
              </button>
              <button
                type="button"
                onClick={() => handleQuickPersona('developer@enterprise.local')}
                className="p-2.5 rounded-xl bg-slate-950/80 border border-purple-500/40 hover:bg-purple-950/30 text-center transition-all group"
              >
                <p className="font-bold text-purple-400 text-xs group-hover:scale-105 transition-transform">Developer</p>
                <p className="text-[10px] text-slate-400">{lang === 'ar' ? 'فريق التطوير' : 'Dev Suite'}</p>
              </button>
              <button
                type="button"
                onClick={() => handleQuickPersona('customer@enterprise.local')}
                className="p-2.5 rounded-xl bg-slate-950/80 border border-emerald-500/40 hover:bg-emerald-950/30 text-center transition-all group"
              >
                <p className="font-bold text-emerald-400 text-xs group-hover:scale-105 transition-transform">Customer</p>
                <p className="text-[10px] text-slate-400">{lang === 'ar' ? 'لوحة العميل' : 'Client Vault'}</p>
              </button>
            </div>
          </div>
        )}

        {/* Error / Success Notifications */}
        {errorMessage && (
          <div className="p-3 rounded-xl bg-rose-950/60 border border-rose-800/40 text-rose-300 flex items-center gap-2 text-xs">
            <AlertCircle className="w-4 h-4 shrink-0" />
            <span>{errorMessage}</span>
          </div>
        )}

        {successMessage && (
          <div className="p-3 rounded-xl bg-emerald-950/60 border border-emerald-800/40 text-emerald-300 flex items-center gap-2 text-xs">
            <CheckCircle2 className="w-4 h-4 shrink-0" />
            <span>{successMessage}</span>
          </div>
        )}

        {/* 1. LOGIN FORM */}
        {authMode === 'login' && (
          <form onSubmit={handleManualLogin} className="space-y-4 text-xs">
            <div>
              <label className="block text-slate-300 font-medium mb-1">
                {lang === 'ar' ? 'البريد الإلكتروني أو اسم المستخدم' : 'Email or Username'}
              </label>
              <div className="relative">
                <Mail className="w-4 h-4 text-slate-500 absolute top-1/2 -translate-y-1/2 start-3" />
                <input
                  type="text"
                  required
                  value={emailOrUsername}
                  onChange={e => setEmailOrUsername(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl ps-9 pe-3 py-2.5 text-slate-200 focus:outline-none focus:border-cyan-500 font-mono"
                  placeholder="admin@enterprise.local"
                />
              </div>
            </div>

            <div>
              <label className="block text-slate-300 font-medium mb-1">
                {lang === 'ar' ? 'كلمة المرور' : 'Password'}
              </label>
              <div className="relative">
                <Key className="w-4 h-4 text-slate-500 absolute top-1/2 -translate-y-1/2 start-3" />
                <input
                  type={showPassword ? 'text' : 'password'}
                  required
                  value={password}
                  onChange={e => setPassword(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl ps-9 pe-9 py-2.5 text-slate-200 focus:outline-none focus:border-cyan-500 font-mono"
                  placeholder="••••••••"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute top-1/2 -translate-y-1/2 end-3 text-slate-500 hover:text-slate-300"
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            <div className="flex items-center justify-between text-[11px] text-slate-400">
              <label className="flex items-center gap-1.5 cursor-pointer">
                <input
                  type="checkbox"
                  checked={rememberMe}
                  onChange={e => setRememberMe(e.target.checked)}
                  className="rounded bg-slate-950 border-slate-800 text-cyan-500 focus:ring-0"
                />
                <span>{lang === 'ar' ? 'تذكر جلستي' : 'Remember my session'}</span>
              </label>
              <button
                type="button"
                onClick={() => setAuthMode('forgot')}
                className="text-cyan-400 hover:underline"
              >
                {lang === 'ar' ? 'نسيت كلمة المرور؟' : 'Forgot Password?'}
              </button>
            </div>

            <button
              type="submit"
              disabled={isLoading}
              className="w-full py-3 rounded-xl bg-cyan-500 text-slate-950 font-bold hover:bg-cyan-400 transition-all shadow-lg shadow-cyan-500/20 flex items-center justify-center gap-2 text-xs"
            >
              <Lock className="w-4 h-4" />
              <span>{isLoading ? (lang === 'ar' ? 'جاري التحقق وتوليد الجلسة...' : 'Authenticating...') : (lang === 'ar' ? 'تسجيل الدخول' : 'Sign In')}</span>
            </button>
          </form>
        )}

        {/* 2. REGISTER FORM */}
        {authMode === 'register' && (
          <form onSubmit={handleRegister} className="space-y-3.5 text-xs">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="block text-slate-300 font-medium mb-1">{lang === 'ar' ? 'الاسم الكامل' : 'Full Name'}</label>
                <div className="relative">
                  <User className="w-4 h-4 text-slate-500 absolute top-1/2 -translate-y-1/2 start-3" />
                  <input
                    type="text"
                    required
                    value={regFullName}
                    onChange={e => setRegFullName(e.target.value)}
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl ps-9 pe-3 py-2 text-slate-200 focus:outline-none focus:border-cyan-500"
                    placeholder="محمد السعيد"
                  />
                </div>
              </div>

              <div>
                <label className="block text-slate-300 font-medium mb-1">{lang === 'ar' ? 'اسم المستخدم' : 'Username'}</label>
                <input
                  type="text"
                  required
                  value={regUsername}
                  onChange={e => setRegUsername(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-slate-200 focus:outline-none focus:border-cyan-500 font-mono"
                  placeholder="mohammed_99"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="block text-slate-300 font-medium mb-1">{lang === 'ar' ? 'البريد الإلكتروني' : 'Email'}</label>
                <div className="relative">
                  <Mail className="w-4 h-4 text-slate-500 absolute top-1/2 -translate-y-1/2 start-3" />
                  <input
                    type="email"
                    required
                    value={regEmail}
                    onChange={e => setRegEmail(e.target.value)}
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl ps-9 pe-3 py-2 text-slate-200 focus:outline-none focus:border-cyan-500 font-mono"
                    placeholder="user@domain.com"
                  />
                </div>
              </div>

              <div>
                <label className="block text-slate-300 font-medium mb-1">{lang === 'ar' ? 'رقم الهاتف' : 'Phone Number'}</label>
                <div className="relative">
                  <Phone className="w-4 h-4 text-slate-500 absolute top-1/2 -translate-y-1/2 start-3" />
                  <input
                    type="tel"
                    value={regPhone}
                    onChange={e => setRegPhone(e.target.value)}
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl ps-9 pe-3 py-2 text-slate-200 focus:outline-none focus:border-cyan-500 font-mono"
                    placeholder="+966500000000"
                  />
                </div>
              </div>
            </div>

            <div>
              <label className="block text-slate-300 font-medium mb-1">{lang === 'ar' ? 'نوع الحساب / لوحة التحكم' : 'Account Role Type'}</label>
              <div className="grid grid-cols-3 gap-2">
                {[
                  { id: 'customer', title: lang === 'ar' ? 'عميل / مستخدم' : 'Customer', sub: lang === 'ar' ? 'لوحة العميل' : 'Portal' },
                  { id: 'developer', title: lang === 'ar' ? 'مطور برمجيات' : 'Developer', sub: lang === 'ar' ? 'أدوات التطوير' : 'Dev Suite' },
                  { id: 'manager', title: lang === 'ar' ? 'مدير عمليات' : 'Manager', sub: lang === 'ar' ? 'لوحة العمليات' : 'Operations' },
                ].map(ut => (
                  <button
                    key={ut.id}
                    type="button"
                    onClick={() => setRegUserType(ut.id as any)}
                    className={`p-2 rounded-xl border text-center transition-all ${
                      regUserType === ut.id
                        ? 'border-cyan-500 bg-cyan-500/10 text-cyan-300 font-bold'
                        : 'border-slate-800 bg-slate-950/60 text-slate-400 hover:border-slate-700'
                    }`}
                  >
                    <div className="text-xs">{ut.title}</div>
                    <div className="text-[10px] opacity-75">{ut.sub}</div>
                  </button>
                ))}
              </div>
            </div>

            <div>
              <label className="block text-slate-300 font-medium mb-1">{lang === 'ar' ? 'كلمة المرور' : 'Password'}</label>
              <div className="relative">
                <Key className="w-4 h-4 text-slate-500 absolute top-1/2 -translate-y-1/2 start-3" />
                <input
                  type="password"
                  required
                  value={regPassword}
                  onChange={e => setRegPassword(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl ps-9 pe-3 py-2 text-slate-200 focus:outline-none focus:border-cyan-500 font-mono"
                  placeholder="••••••••"
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={isLoading}
              className="w-full py-3 rounded-xl bg-cyan-500 text-slate-950 font-bold hover:bg-cyan-400 transition-all shadow-lg shadow-cyan-500/20 flex items-center justify-center gap-2 text-xs mt-2"
            >
              <UserPlus className="w-4 h-4" />
              <span>{isLoading ? (lang === 'ar' ? 'جاري إنشاء الحساب وتشفير الرمز...' : 'Registering Account...') : (lang === 'ar' ? 'إنشاء وتفعيل الحساب' : 'Create & Activate Account')}</span>
            </button>
          </form>
        )}

        {/* 3. FORGOT PASSWORD FORM */}
        {authMode === 'forgot' && (
          <form onSubmit={handleForgotPassword} className="space-y-4 text-xs">
            {forgotSuccess ? (
              <div className="p-4 rounded-xl bg-emerald-950/50 border border-emerald-800 text-emerald-300 space-y-2 text-center">
                <CheckCircle2 className="w-8 h-8 text-emerald-400 mx-auto" />
                <p className="font-bold text-sm">{lang === 'ar' ? 'تم إرسال رابط الاستعادة!' : 'Reset Link Sent!'}</p>
                <p className="text-[11px] text-slate-300">
                  {lang === 'ar'
                    ? `تم إرسال تعليمات إعادة تعيين كلمة المرور إلى ${forgotEmail}. يرجى فحص صندوق الوارد.`
                    : `Password reset instructions sent to ${forgotEmail}. Please check your inbox.`}
                </p>
                <button
                  type="button"
                  onClick={() => setAuthMode('login')}
                  className="mt-3 px-4 py-2 bg-emerald-500 text-slate-950 font-bold rounded-lg hover:bg-emerald-400 text-xs"
                >
                  {lang === 'ar' ? 'العودة لتسجيل الدخول' : 'Back to Sign In'}
                </button>
              </div>
            ) : (
              <>
                <p className="text-slate-400 text-xs leading-relaxed">
                  {lang === 'ar'
                    ? 'أدخل بريدك الإلكتروني المسجل في المنظومة وسنقوم بإرسال رابط آمن ومؤقت لإعادة ضبط كلمة المرور.'
                    : 'Enter your registered enterprise email address to receive a secure password reset link.'}
                </p>
                <div>
                  <label className="block text-slate-300 font-medium mb-1">{lang === 'ar' ? 'البريد الإلكتروني' : 'Registered Email'}</label>
                  <div className="relative">
                    <Mail className="w-4 h-4 text-slate-500 absolute top-1/2 -translate-y-1/2 start-3" />
                    <input
                      type="email"
                      required
                      value={forgotEmail}
                      onChange={e => setForgotEmail(e.target.value)}
                      className="w-full bg-slate-950 border border-slate-800 rounded-xl ps-9 pe-3 py-2.5 text-slate-200 focus:outline-none focus:border-cyan-500 font-mono"
                      placeholder="admin@enterprise.local"
                    />
                  </div>
                </div>

                <button
                  type="submit"
                  disabled={isLoading}
                  className="w-full py-3 rounded-xl bg-cyan-500 text-slate-950 font-bold hover:bg-cyan-400 transition-all shadow-lg shadow-cyan-500/20 flex items-center justify-center gap-2 text-xs"
                >
                  <Mail className="w-4 h-4" />
                  <span>{isLoading ? (lang === 'ar' ? 'جاري الإرسال...' : 'Sending Link...') : (lang === 'ar' ? 'إرسال رابط الاستعادة' : 'Send Reset Link')}</span>
                </button>
              </>
            )}
          </form>
        )}
      </div>
    </div>
  );
};
