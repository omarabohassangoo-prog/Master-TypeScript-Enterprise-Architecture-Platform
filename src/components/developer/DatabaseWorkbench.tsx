import React, { useState } from 'react';
import { Database, Play, CheckCircle2, Table, Layers, HardDrive, Search, Terminal } from 'lucide-react';
import { api } from '../../api/client';

export const DatabaseWorkbench: React.FC<{ lang: 'ar' | 'en' }> = ({ lang }) => {
  const [selectedTable, setSelectedTable] = useState('users');
  const [sqlQuery, setSqlQuery] = useState('SELECT id, email, username, status, created_at FROM users LIMIT 10;');
  const [queryResult, setQueryResult] = useState<any[] | null>(null);
  const [isExecuting, setIsExecuting] = useState(false);
  const [stats, setStats] = useState<any>({ totalQueries: 48, activeConnections: 3, latencyMs: 2 });

  const tables = [
    { name: 'users', rows: 4, desc: 'حسابات المستخدمين والمصادقة' },
    { name: 'roles', rows: 3, desc: 'الأدوار المعمارية' },
    { name: 'permissions', rows: 12, desc: 'مصفوفة أذونات RBAC' },
    { name: 'role_permissions', rows: 28, desc: 'جدول الربط بين الأدوار والأذونات' },
    { name: 'sessions', rows: 3, desc: 'جلسات العمل النشطة وبصمة المتصفح' },
    { name: 'settings', rows: 8, desc: 'تكوينات النظام وSEO' },
    { name: 'files', rows: 2, desc: 'سجلات المستندات والخزينة' },
    { name: 'notifications', rows: 2, desc: 'التنبيهات الموجهة للمستخدمين' },
    { name: 'paypal_transactions', rows: 1, desc: 'المعاملات المالية المحصلة' },
    { name: 'audit_logs', rows: 12, desc: 'سجلات التدقيق الأمني' },
    { name: 'communication_logs', rows: 4, desc: 'سجلات Email/SMS/WhatsApp' },
    { name: 'dev_projects', rows: 2, desc: 'مشاريع فريق التطوير' },
    { name: 'dev_tasks', rows: 4, desc: 'مهام سبرنت الكانبان' },
    { name: 'dev_issues', rows: 2, desc: 'تذاكر الخلل والتحسينات' },
  ];

  const handleSelectTable = (tblName: string) => {
    setSelectedTable(tblName);
    setSqlQuery(`SELECT * FROM ${tblName} LIMIT 10;`);
  };

  const handleExecute = async () => {
    setIsExecuting(true);
    try {
      // Fetch matching data from API
      let data: any[] = [];
      if (selectedTable === 'users') {
        const res = await api.get<any[]>('/api/v1/users');
        data = Array.isArray(res.data) ? res.data : [];
      } else if (selectedTable === 'roles') {
        const res = await api.get<any[]>('/api/v1/roles');
        data = Array.isArray(res.data) ? res.data : [];
      } else if (selectedTable === 'settings') {
        const res = await api.get<any[]>('/api/v1/settings');
        data = Array.isArray(res.data) ? res.data : [];
      } else if (selectedTable === 'files') {
        const res = await api.get<any[]>('/api/v1/files');
        data = Array.isArray(res.data) ? res.data : [];
      } else if (selectedTable === 'dev_tasks') {
        const res = await api.get<any[]>('/api/v1/dev/tasks');
        data = Array.isArray(res.data) ? res.data : [];
      } else {
        const res = await api.get<any[]>('/api/v1/dev/workbench/query?table=' + selectedTable);
        data = Array.isArray(res.data) ? res.data : [];
      }

      setQueryResult(data);
      setStats((prev: any) => ({ ...prev, totalQueries: prev.totalQueries + 1 }));
    } catch (e) {
      console.error(e);
    } finally {
      setIsExecuting(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-slate-900/90 border border-slate-800 rounded-2xl p-6 flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold text-slate-100 flex items-center gap-2">
            <Database className="w-5 h-5 text-emerald-400" />
            <span>{lang === 'ar' ? 'مستكشف واستعلامات قاعدة البيانات (PostgreSQL Database Workbench)' : 'Database Workbench'}</span>
          </h2>
          <p className="text-xs text-slate-400 mt-1">
            {lang === 'ar'
              ? 'استكشاف الجداول الـ 14، استعراض المخططات والمفاتيح، وتنفيذ استعلامات SQL حية'
              : 'Inspect 14 relational tables, run live queries, and view connection metrics'}
          </p>
        </div>

        <div className="flex items-center gap-3 text-xs font-mono">
          <div className="px-3 py-1.5 rounded-xl bg-slate-950 border border-slate-800 text-slate-300">
            Pool Connections: <span className="text-emerald-400 font-bold">{stats.activeConnections}</span>
          </div>
          <div className="px-3 py-1.5 rounded-xl bg-slate-950 border border-slate-800 text-slate-300">
            Latency: <span className="text-cyan-400 font-bold">{stats.latencyMs}ms</span>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Tables List */}
        <div className="lg:col-span-4 bg-slate-900/90 border border-slate-800 rounded-2xl p-4 space-y-2 shadow-xl">
          <p className="text-[11px] font-bold text-slate-400 uppercase tracking-wider px-2 mb-2">
            جداول قاعدة البيانات (14 Tables)
          </p>
          <div className="space-y-1.5 max-h-[500px] overflow-y-auto">
            {tables.map((t) => {
              const isSelected = selectedTable === t.name;
              return (
                <button
                  key={t.name}
                  onClick={() => handleSelectTable(t.name)}
                  className={`w-full text-start p-2.5 rounded-xl border transition-all flex items-center justify-between text-xs ${
                    isSelected
                      ? 'bg-emerald-500/15 border-emerald-500/40 text-emerald-300 font-semibold'
                      : 'bg-slate-950/60 border-slate-800/80 text-slate-400 hover:text-slate-200'
                  }`}
                >
                  <div className="flex items-center gap-2 truncate">
                    <Table className="w-3.5 h-3.5 shrink-0" />
                    <span className="font-mono text-xs">{t.name}</span>
                  </div>
                  <span className="text-[10px] font-mono text-slate-500 px-1.5 py-0.5 rounded bg-slate-900">
                    ~{t.rows} rows
                  </span>
                </button>
              );
            })}
          </div>
        </div>

        {/* Query Editor & Result */}
        <div className="lg:col-span-8 bg-slate-900/90 border border-slate-800 rounded-2xl p-6 space-y-4 shadow-xl">
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <label className="text-xs font-semibold text-slate-300 flex items-center gap-1.5">
                <Terminal className="w-4 h-4 text-emerald-400" />
                <span>محرر استعلامات SQL (SQL Query Console)</span>
              </label>

              <button
                onClick={handleExecute}
                disabled={isExecuting}
                className="px-4 py-2 rounded-xl bg-emerald-500 text-slate-950 font-bold text-xs hover:bg-emerald-400 transition-all flex items-center gap-1.5 shadow-md shadow-emerald-500/20"
              >
                <Play className="w-3.5 h-3.5 fill-current" />
                <span>{isExecuting ? 'جاري التنفيذ...' : 'تشغيل الاستعلام (Execute)'}</span>
              </button>
            </div>

            <textarea
              rows={3}
              value={sqlQuery}
              onChange={e => setSqlQuery(e.target.value)}
              className="w-full bg-slate-950 border border-slate-800 rounded-xl p-3 font-mono text-xs text-emerald-300 focus:outline-none focus:border-emerald-500"
            />
          </div>

          {/* Table Data Viewer */}
          <div className="space-y-2">
            <span className="text-xs font-semibold text-slate-400">نتائج الاستعلام:</span>
            <div className="bg-slate-950 border border-slate-800 rounded-xl overflow-x-auto max-h-80">
              {queryResult && queryResult.length > 0 ? (
                <table className="w-full text-start text-xs font-mono">
                  <thead className="bg-slate-900 text-slate-400 border-b border-slate-800">
                    <tr>
                      {Object.keys(queryResult[0]).map((col) => (
                        <th key={col} className="p-2.5 text-start">{col}</th>
                      ))}
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-800/60 text-slate-300">
                    {queryResult.map((row, idx) => (
                      <tr key={idx} className="hover:bg-slate-900/40">
                        {Object.values(row).map((val: any, cIdx) => (
                          <td key={cIdx} className="p-2.5 truncate max-w-[200px]">
                            {typeof val === 'object' ? JSON.stringify(val) : String(val)}
                          </td>
                        ))}
                      </tr>
                    ))}
                  </tbody>
                </table>
              ) : (
                <div className="p-8 text-center text-slate-500 text-xs font-mono">
                  انقر على "تشغيل الاستعلام" لاستعراض سجلات جدول {selectedTable}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
