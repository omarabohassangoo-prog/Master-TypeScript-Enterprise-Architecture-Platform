import React, { useState } from 'react';
import { ShieldCheck, Plus, Check, X, Lock, Sparkles, RefreshCw } from 'lucide-react';
import { Role, Permission } from '../../types';

interface RbacMatrixManagerProps {
  roles: Role[];
  permissions: Permission[];
  onUpdateRole: (roleId: string, updates: Partial<Role>) => Promise<void>;
  onCreateRole: (data: any) => Promise<void>;
  lang: 'ar' | 'en';
}

export const RbacMatrixManager: React.FC<RbacMatrixManagerProps> = ({
  roles = [],
  permissions = [],
  onUpdateRole,
  onCreateRole,
  lang,
}) => {
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [newRoleName, setNewRoleName] = useState('');
  const [newRoleDisplayName, setNewRoleDisplayName] = useState('');
  const [newRoleDescription, setNewRoleDescription] = useState('');

  const categories = ['all', 'identity', 'system', 'storage', 'finance', 'developer'];

  const safePermissions = permissions || [];
  const safeRoles = roles || [];

  const filteredPermissions = selectedCategory === 'all'
    ? safePermissions
    : safePermissions.filter(p => p && p.category === selectedCategory);

  const handleTogglePermission = async (role: Role, permKey: string) => {
    if (!role || role.name === 'super_admin') return; // Cannot modify super admin

    const currentPerms = role.permissions || [];
    let updatedPerms: string[];
    if (currentPerms.includes(permKey)) {
      updatedPerms = currentPerms.filter(p => p !== permKey);
    } else {
      updatedPerms = [...currentPerms, permKey];
    }

    await onUpdateRole(role.id, { permissions: updatedPerms });
  };

  const handleCreateRoleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newRoleName) return;

    await onCreateRole({
      name: newRoleName.toLowerCase().replace(/\s+/g, '_'),
      displayName: newRoleDisplayName || newRoleName,
      description: newRoleDescription,
      permissions: [],
    });

    setShowCreateModal(false);
    setNewRoleName('');
    setNewRoleDisplayName('');
    setNewRoleDescription('');
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-slate-900/90 border border-slate-800 rounded-2xl p-6 flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold text-slate-100 flex items-center gap-2">
            <ShieldCheck className="w-5 h-5 text-cyan-400" />
            <span>{lang === 'ar' ? 'إدارة الأدوار ومصفوفة RBAC (Roles & Permissions)' : 'Roles & RBAC Matrix'}</span>
          </h2>
          <p className="text-xs text-slate-400 mt-1">
            {lang === 'ar'
              ? 'تعديل وتخصيص الصلاحيات والأذونات الحبيبية (Granular Access Control) لكل دور'
              : 'Control granular permissions per role with dynamic live toggle'}
          </p>
        </div>

        <button
          onClick={() => setShowCreateModal(true)}
          className="px-4 py-2.5 rounded-xl bg-cyan-500 text-slate-950 font-bold text-xs hover:bg-cyan-400 transition-all flex items-center gap-2 shadow-lg shadow-cyan-500/20 w-fit"
        >
          <Plus className="w-4 h-4" />
          <span>{lang === 'ar' ? 'إنشاء دور جديد' : 'Create New Role'}</span>
        </button>
      </div>

      {/* Category Tabs */}
      <div className="flex items-center gap-2 overflow-x-auto pb-2 scrollbar-none">
        {categories.map((cat) => (
          <button
            key={cat}
            onClick={() => setSelectedCategory(cat)}
            className={`px-3 py-1.5 rounded-lg text-xs font-medium uppercase transition-all ${
              selectedCategory === cat
                ? 'bg-cyan-500 text-slate-950 font-bold shadow'
                : 'bg-slate-900 border border-slate-800 text-slate-400 hover:text-slate-200'
            }`}
          >
            {cat}
          </button>
        ))}
      </div>

      {/* Interactive Matrix Table */}
      <div className="bg-slate-900/90 border border-slate-800 rounded-2xl overflow-hidden shadow-xl">
        <div className="overflow-x-auto">
          <table className="w-full text-start text-xs">
            <thead className="bg-slate-950 text-slate-400 font-semibold border-b border-slate-800">
              <tr>
                <th className="p-4 text-start">{lang === 'ar' ? 'الإذن والمورد' : 'Permission & Resource'}</th>
                <th className="p-4 text-start">{lang === 'ar' ? 'التصنيف' : 'Category'}</th>
                {roles.map(r => (
                  <th key={r.id} className="p-4 text-center">
                    <div>
                      <span className="font-bold text-slate-200">{r.displayName}</span>
                      <p className="text-[10px] text-slate-500 font-mono">{r.name}</p>
                    </div>
                  </th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/60 bg-slate-950/30">
              {filteredPermissions.map(perm => (
                <tr key={perm.id} className="hover:bg-slate-900/40 transition-colors">
                  <td className="p-4">
                    <div>
                      <p className="font-mono font-bold text-cyan-400 text-xs">{perm.key}</p>
                      <p className="text-slate-400 text-[11px] mt-0.5">{perm.displayName}</p>
                    </div>
                  </td>

                  <td className="p-4">
                    <span className="font-mono text-[10px] px-2 py-0.5 rounded bg-slate-900 border border-slate-800 text-slate-400 uppercase">
                      {perm.category}
                    </span>
                  </td>

                  {roles.map(role => {
                    const hasPerm = role.name === 'super_admin' || role.permissions.includes(perm.key);
                    const isSuper = role.name === 'super_admin';
                    return (
                      <td key={role.id} className="p-4 text-center">
                        <button
                          disabled={isSuper}
                          onClick={() => handleTogglePermission(role, perm.key)}
                          className={`w-7 h-7 rounded-lg border inline-flex items-center justify-center transition-all ${
                            hasPerm
                              ? 'bg-emerald-500/20 border-emerald-500/40 text-emerald-400 shadow-sm'
                              : 'bg-slate-950 border-slate-800 text-slate-600 hover:border-slate-700'
                          } ${isSuper ? 'opacity-80 cursor-not-allowed' : 'cursor-pointer hover:scale-110'}`}
                        >
                          {hasPerm ? <Check className="w-4 h-4" /> : <X className="w-4 h-4" />}
                        </button>
                      </td>
                    );
                  })}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Create Role Modal */}
      {showCreateModal && (
        <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 w-full max-w-md space-y-4 shadow-2xl">
            <div className="flex items-center justify-between pb-3 border-b border-slate-800">
              <h3 className="text-base font-bold text-slate-100 flex items-center gap-2">
                <ShieldCheck className="w-5 h-5 text-cyan-400" />
                <span>إنشاء دور جديد في مصفوفة RBAC</span>
              </h3>
              <button onClick={() => setShowCreateModal(false)} className="text-slate-400 hover:text-slate-200">
                ✕
              </button>
            </div>

            <form onSubmit={handleCreateRoleSubmit} className="space-y-4 text-xs">
              <div>
                <label className="block text-slate-300 font-medium mb-1">الاسم التقني (Key Identifier)</label>
                <input
                  type="text"
                  required
                  value={newRoleName}
                  onChange={e => setNewRoleName(e.target.value)}
                  placeholder="e.g. content_moderator"
                  className="w-full bg-slate-950 border border-slate-800 rounded-lg p-2.5 text-slate-200 focus:outline-none focus:border-cyan-500 font-mono"
                />
              </div>

              <div>
                <label className="block text-slate-300 font-medium mb-1">الاسم المعروض</label>
                <input
                  type="text"
                  required
                  value={newRoleDisplayName}
                  onChange={e => setNewRoleDisplayName(e.target.value)}
                  placeholder="مشرف المحتوى"
                  className="w-full bg-slate-950 border border-slate-800 rounded-lg p-2.5 text-slate-200 focus:outline-none focus:border-cyan-500"
                />
              </div>

              <div>
                <label className="block text-slate-300 font-medium mb-1">الوصف</label>
                <textarea
                  rows={3}
                  value={newRoleDescription}
                  onChange={e => setNewRoleDescription(e.target.value)}
                  placeholder="صلاحيات إدارة المستندات وتعديل الملفات..."
                  className="w-full bg-slate-950 border border-slate-800 rounded-lg p-2.5 text-slate-200 focus:outline-none focus:border-cyan-500"
                />
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
                  حفظ وإضافة الدور
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
