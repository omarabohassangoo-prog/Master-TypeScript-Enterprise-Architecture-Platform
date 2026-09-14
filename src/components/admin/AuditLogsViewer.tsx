import React, { useState } from 'react';
import { History, Search, Shield, Filter, CheckCircle2, AlertTriangle, XCircle } from 'lucide-react';
import { AuditLog } from '../../types';

interface AuditLogsViewerProps {
  logs: AuditLog[];
  lang: 'ar' | 'en';
}

export const AuditLogsViewer: React.FC<AuditLogsViewerProps> = ({ logs = [], lang }) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');

  const safeLogs = logs || [];
  const filteredLogs = safeLogs.filter(log => {
    if (!log) return false;
    const action = log.action || '';
    const resource = log.resource || '';
    const username = log.username || '';
    const matchesSearch =
      action.toLowerCase().includes(searchTerm.toLowerCase()) ||
      resource.toLowerCase().includes(searchTerm.toLowerCase()) ||
      username.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = statusFilter === 'all' || log.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-slate-900/90 border border-slate-800 rounded-2xl p-6 flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold text-slate-100 flex items-center gap-2">
            <History className="w-5 h-5 text-cyan-400" />
            <span>{lang === 'ar' ? 'سجلات التدقيق والأمان الحصينة (Audit & Security Logs)' : 'Security Audit Trail'}</span>
          </h2>
          <p className="text-xs text-slate-400 mt-1">
            {lang === 'ar'
              ? 'تسجيل دقيق وغير قابل للتعديل لعمليات تسجيل الدخول، تعديل الصلاحيات، تغيير الإعدادات، ومعاملات الدفع'
              : 'Immutable audit logs for compliance, security telemetry, and access verification'}
          </p>
        </div>
      </div>

      {/* Filter Bar */}
      <div className="bg-slate-900/60 border border-slate-800 rounded-xl p-4 flex flex-col sm:flex-row items-center gap-3">
        <div className="relative flex-1 w-full">
          <Search className="w-4 h-4 text-slate-500 absolute top-1/2 -translate-y-1/2 start-3" />
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder={lang === 'ar' ? 'البحث بالحدث، المورد، أو اسم المستخدم...' : 'Search logs by action, resource, or user...'}
            className="w-full bg-slate-950/80 border border-slate-800 rounded-lg ps-9 pe-3 py-2 text-xs text-slate-200 placeholder-slate-500 focus:outline-none focus:border-cyan-500"
          />
        </div>

        <select
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value)}
          className="bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-xs text-slate-300 focus:outline-none focus:border-cyan-500"
        >
          <option value="all">جميع الحالات</option>
          <option value="success">ناجح (Success)</option>
          <option value="failure">فشل (Failure)</option>
          <option value="warning">تحذير (Warning)</option>
        </select>
      </div>

      {/* Logs Table */}
      <div className="bg-slate-900/90 border border-slate-800 rounded-2xl overflow-hidden shadow-xl">
        <div className="overflow-x-auto">
          <table className="w-full text-start text-xs font-mono">
            <thead className="bg-slate-950 text-slate-400 font-semibold border-b border-slate-800 font-sans">
              <tr>
                <th className="p-4 text-start">الحدث (Action)</th>
                <th className="p-4 text-start">المورد (Resource)</th>
                <th className="p-4 text-start">المستخدم</th>
                <th className="p-4 text-start">عنوان IP</th>
                <th className="p-4 text-start">الحالة</th>
                <th className="p-4 text-start">الوقت والتاريخ</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/60 bg-slate-950/30">
              {filteredLogs.map((log) => (
                <tr key={log.id} className="hover:bg-slate-900/40 transition-colors">
                  <td className="p-4 font-bold text-cyan-400">{log.action}</td>
                  <td className="p-4 text-slate-300">{log.resource}</td>
                  <td className="p-4 text-slate-300 font-sans">{log.username || 'System Daemon'}</td>
                  <td className="p-4 text-slate-400">{log.ipAddress}</td>
                  <td className="p-4">
                    <span className={`inline-flex items-center gap-1 text-[11px] font-semibold px-2 py-0.5 rounded-full border ${
                      log.status === 'success'
                        ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20'
                        : 'bg-rose-500/10 text-rose-400 border-rose-500/20'
                    }`}>
                      {log.status === 'success' ? <CheckCircle2 className="w-3 h-3" /> : <XCircle className="w-3 h-3" />}
                      <span>{log.status}</span>
                    </span>
                  </td>
                  <td className="p-4 text-slate-500 text-[11px]">{new Date(log.createdAt).toLocaleString()}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
