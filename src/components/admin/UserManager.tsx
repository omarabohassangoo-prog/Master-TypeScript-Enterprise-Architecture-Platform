import React, { useState } from 'react';
import {
  Users, Search, UserPlus, Shield, CheckCircle2,
  XCircle, Edit3, Trash2, Key, RefreshCw, AlertCircle
} from 'lucide-react';
import { User, Role } from '../../types';

interface UserManagerProps {
  users: User[];
  roles: Role[];
  onCreateUser: (data: any) => Promise<void>;
  onUpdateUser: (id: string, data: any) => Promise<void>;
  onDeleteUser: (id: string) => Promise<void>;
  lang: 'ar' | 'en';
}

export const UserManager: React.FC<UserManagerProps> = ({
  users = [],
  roles = [],
  onCreateUser,
  onUpdateUser,
  onDeleteUser,
  lang,
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [typeFilter, setTypeFilter] = useState('all');
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [editingUser, setEditingUser] = useState<User | null>(null);

  // Form State
  const [formData, setFormData] = useState({
    email: '',
    username: '',
    fullName: '',
    phone: '',
    userType: 'customer',
    roleId: 'role_user',
  });

  const safeUsers = users || [];
  const filteredUsers = safeUsers.filter(u => {
    if (!u) return false;
    const username = u.username || '';
    const email = u.email || '';
    const fullName = u.profile?.fullName || '';
    const matchesSearch =
      username.toLowerCase().includes(searchTerm.toLowerCase()) ||
      email.toLowerCase().includes(searchTerm.toLowerCase()) ||
      fullName.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = statusFilter === 'all' || u.status === statusFilter;
    const matchesType = typeFilter === 'all' || u.userType === typeFilter;
    return matchesSearch && matchesStatus && matchesType;
  });

  const handleCreateSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    await onCreateUser({
      ...formData,
      roles: [formData.roleId],
    });
    setShowCreateModal(false);
    setFormData({ email: '', username: '', fullName: '', phone: '', userType: 'customer', roleId: 'role_user' });
  };

  const handleToggleStatus = async (user: User) => {
    const newStatus = user.status === 'active' ? 'suspended' : 'active';
    await onUpdateUser(user.id, { status: newStatus });
  };

  const handleResetLockout = async (user: User) => {
    await onUpdateUser(user.id, { failedLoginAttempts: 0, lockoutUntil: null });
  };

  return (
    <div className="space-y-6">
      {/* Header & Actions */}
      <div className="bg-slate-900/90 border border-slate-800 rounded-2xl p-6 flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold text-slate-100 flex items-center gap-2">
            <Users className="w-5 h-5 text-cyan-400" />
            <span>{lang === 'ar' ? 'إدارة المستخدمين والحسابات (User Management)' : 'User Management'}</span>
          </h2>
          <p className="text-xs text-slate-400 mt-1">
            {lang === 'ar'
              ? 'إنشاء وتعديل الحسابات، تعيين الأدوار والصلاحيات، وإلغاء القفل الأمني'
              : 'Create and update users, assign roles and manage security lockouts'}
          </p>
        </div>

        <button
          onClick={() => setShowCreateModal(true)}
          className="px-4 py-2.5 rounded-xl bg-cyan-500 text-slate-950 font-bold text-xs hover:bg-cyan-400 transition-all flex items-center gap-2 shadow-lg shadow-cyan-500/20 w-fit"
        >
          <UserPlus className="w-4 h-4" />
          <span>{lang === 'ar' ? 'إضافة مستخدم جديد' : 'Create New User'}</span>
        </button>
      </div>

      {/* Filters Bar */}
      <div className="bg-slate-900/60 border border-slate-800 rounded-xl p-4 flex flex-col sm:flex-row items-center gap-3">
        <div className="relative flex-1 w-full">
          <Search className="w-4 h-4 text-slate-500 absolute top-1/2 -translate-y-1/2 start-3" />
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder={lang === 'ar' ? 'البحث بالاسم، البريد أو اسم المستخدم...' : 'Search users by name, email, or username...'}
            className="w-full bg-slate-950/80 border border-slate-800 rounded-lg ps-9 pe-3 py-2 text-xs text-slate-200 placeholder-slate-500 focus:outline-none focus:border-cyan-500 transition-colors"
          />
        </div>

        <div className="flex items-center gap-2 w-full sm:w-auto">
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-xs text-slate-300 focus:outline-none focus:border-cyan-500"
          >
            <option value="all">{lang === 'ar' ? 'جميع الحالات' : 'All Statuses'}</option>
            <option value="active">{lang === 'ar' ? 'نشط (Active)' : 'Active'}</option>
            <option value="suspended">{lang === 'ar' ? 'معطل (Suspended)' : 'Suspended'}</option>
          </select>

          <select
            value={typeFilter}
            onChange={(e) => setTypeFilter(e.target.value)}
            className="bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-xs text-slate-300 focus:outline-none focus:border-cyan-500"
          >
            <option value="all">{lang === 'ar' ? 'جميع الأنواع' : 'All Types'}</option>
            <option value="super_admin">Super Admin</option>
            <option value="developer">Developer</option>
            <option value="customer">Customer</option>
          </select>
        </div>
      </div>

      {/* Users Table */}
      <div className="bg-slate-900/90 border border-slate-800 rounded-2xl overflow-hidden shadow-xl">
        <div className="overflow-x-auto">
          <table className="w-full text-start text-xs">
            <thead className="bg-slate-950 text-slate-400 font-semibold border-b border-slate-800">
              <tr>
                <th className="p-4 text-start">{lang === 'ar' ? 'المستخدم' : 'User'}</th>
                <th className="p-4 text-start">{lang === 'ar' ? 'النوع والدور' : 'Type & Role'}</th>
                <th className="p-4 text-start">{lang === 'ar' ? 'الحالة' : 'Status'}</th>
                <th className="p-4 text-start">{lang === 'ar' ? 'محاولات الدخول' : 'Login Attempts'}</th>
                <th className="p-4 text-start">{lang === 'ar' ? 'تاريخ الإنشاء' : 'Created At'}</th>
                <th className="p-4 text-center">{lang === 'ar' ? 'الإجراءات' : 'Actions'}</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/60 bg-slate-950/30">
              {filteredUsers.map((user) => (
                <tr key={user.id} className="hover:bg-slate-900/50 transition-colors">
                  <td className="p-4">
                    <div className="flex items-center gap-3">
                      <img
                        src={user.profile.avatarUrl || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=80'}
                        alt={user.username}
                        className="w-8 h-8 rounded-lg object-cover border border-slate-700"
                      />
                      <div>
                        <p className="font-bold text-slate-200">{user.profile.fullName}</p>
                        <p className="text-[11px] text-slate-400 font-mono">{user.email}</p>
                      </div>
                    </div>
                  </td>

                  <td className="p-4">
                    <span className="font-mono text-[11px] px-2 py-0.5 rounded bg-slate-900 border border-slate-800 text-cyan-300">
                      {user.userType}
                    </span>
                  </td>

                  <td className="p-4">
                    <span
                      className={`inline-flex items-center gap-1 text-[11px] font-semibold px-2 py-0.5 rounded-full border ${
                        user.status === 'active'
                          ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20'
                          : 'bg-rose-500/10 text-rose-400 border-rose-500/20'
                      }`}
                    >
                      {user.status === 'active' ? <CheckCircle2 className="w-3 h-3" /> : <XCircle className="w-3 h-3" />}
                      <span>{user.status}</span>
                    </span>
                  </td>

                  <td className="p-4 font-mono">
                    {user.failedLoginAttempts > 0 ? (
                      <span className="text-amber-400 flex items-center gap-1">
                        <AlertCircle className="w-3 h-3" />
                        <span>{user.failedLoginAttempts} محاولات</span>
                      </span>
                    ) : (
                      <span className="text-slate-500">0 (آمن)</span>
                    )}
                  </td>

                  <td className="p-4 text-slate-400 font-mono text-[11px]">
                    {new Date(user.createdAt).toLocaleDateString()}
                  </td>

                  <td className="p-4">
                    <div className="flex items-center justify-center gap-1.5">
                      <button
                        onClick={() => handleToggleStatus(user)}
                        title={user.status === 'active' ? 'تعطيل الحساب' : 'تفعيل الحساب'}
                        className="p-1.5 rounded-lg bg-slate-900 border border-slate-800 text-slate-400 hover:text-amber-400 transition-colors"
                      >
                        <Key className="w-3.5 h-3.5" />
                      </button>
                      <button
                        onClick={() => handleResetLockout(user)}
                        title="إعادة ضبط القفل ومحاولات الدخول"
                        className="p-1.5 rounded-lg bg-slate-900 border border-slate-800 text-slate-400 hover:text-cyan-400 transition-colors"
                      >
                        <RefreshCw className="w-3.5 h-3.5" />
                      </button>
                      <button
                        onClick={() => onDeleteUser(user.id)}
                        title="حذف الحساب"
                        className="p-1.5 rounded-lg bg-slate-900 border border-slate-800 text-slate-400 hover:text-rose-400 transition-colors"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Create User Modal */}
      {showCreateModal && (
        <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 w-full max-w-lg space-y-4 shadow-2xl">
            <div className="flex items-center justify-between pb-3 border-b border-slate-800">
              <h3 className="text-base font-bold text-slate-100 flex items-center gap-2">
                <UserPlus className="w-5 h-5 text-cyan-400" />
                <span>إنشاء حساب مستخدم جديد</span>
              </h3>
              <button onClick={() => setShowCreateModal(false)} className="text-slate-400 hover:text-slate-200">
                ✕
              </button>
            </div>

            <form onSubmit={handleCreateSubmit} className="space-y-4 text-xs">
              <div>
                <label className="block text-slate-300 font-medium mb-1">الاسم الكامل</label>
                <input
                  type="text"
                  required
                  value={formData.fullName}
                  onChange={e => setFormData({ ...formData, fullName: e.target.value })}
                  placeholder="مثال: أحمد عبد الله"
                  className="w-full bg-slate-950 border border-slate-800 rounded-lg p-2.5 text-slate-200 focus:outline-none focus:border-cyan-500"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-300 font-medium mb-1">البريد الإلكتروني</label>
                  <input
                    type="email"
                    required
                    value={formData.email}
                    onChange={e => setFormData({ ...formData, email: e.target.value })}
                    placeholder="user@enterprise.local"
                    className="w-full bg-slate-950 border border-slate-800 rounded-lg p-2.5 text-slate-200 focus:outline-none focus:border-cyan-500"
                  />
                </div>
                <div>
                  <label className="block text-slate-300 font-medium mb-1">اسم المستخدم</label>
                  <input
                    type="text"
                    required
                    value={formData.username}
                    onChange={e => setFormData({ ...formData, username: e.target.value })}
                    placeholder="ahmed_dev"
                    className="w-full bg-slate-950 border border-slate-800 rounded-lg p-2.5 text-slate-200 focus:outline-none focus:border-cyan-500"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-300 font-medium mb-1">نوع المستخدم</label>
                  <select
                    value={formData.userType}
                    onChange={e => setFormData({ ...formData, userType: e.target.value as any })}
                    className="w-full bg-slate-950 border border-slate-800 rounded-lg p-2.5 text-slate-200 focus:outline-none focus:border-cyan-500"
                  >
                    <option value="customer">مستخدم قياسي (Customer)</option>
                    <option value="developer">فريق التطوير (Developer)</option>
                    <option value="admin">مدير نظام (Admin)</option>
                  </select>
                </div>
                <div>
                  <label className="block text-slate-300 font-medium mb-1">رقم الهاتف</label>
                  <input
                    type="text"
                    value={formData.phone}
                    onChange={e => setFormData({ ...formData, phone: e.target.value })}
                    placeholder="+966500000000"
                    className="w-full bg-slate-950 border border-slate-800 rounded-lg p-2.5 text-slate-200 focus:outline-none focus:border-cyan-500"
                  />
                </div>
              </div>

              <div className="flex items-center justify-end gap-2 pt-3 border-t border-slate-800">
                <button
                  type="button"
                  onClick={() => setShowCreateModal(false)}
                  className="px-4 py-2 rounded-xl bg-slate-800 text-slate-300 hover:bg-slate-700"
                >
                  إلغاء
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 rounded-xl bg-cyan-500 text-slate-950 font-bold hover:bg-cyan-400 shadow-md shadow-cyan-500/20"
                >
                  حفظ وإنشاء الحساب
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
