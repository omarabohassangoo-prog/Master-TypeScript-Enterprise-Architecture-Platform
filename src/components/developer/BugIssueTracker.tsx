import React, { useState } from 'react';
import { Bug, Plus, CheckCircle2, AlertTriangle, AlertCircle, Filter, Tag } from 'lucide-react';
import { DevIssue } from '../../types';

interface BugIssueTrackerProps {
  issues: DevIssue[];
  onCreateIssue: (issue: any) => Promise<void>;
  onUpdateIssueStatus: (issueId: string, status: DevIssue['status']) => Promise<void>;
  lang: 'ar' | 'en';
}

export const BugIssueTracker: React.FC<BugIssueTrackerProps> = ({
  issues = [],
  onCreateIssue,
  onUpdateIssueStatus,
  lang,
}) => {
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [severity, setSeverity] = useState<DevIssue['severity']>('medium');
  const [type, setType] = useState<DevIssue['type']>('bug');

  const safeIssues = issues || [];

  const handleCreateSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    await onCreateIssue({
      projectId: 'proj_001',
      title,
      description,
      type,
      severity,
      status: 'open',
      reportedBy: 'مهندس الجودة QA',
      assignee: 'سارة المنصور',
      labels: [type, severity],
    });
    setShowCreateModal(false);
    setTitle('');
    setDescription('');
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-slate-900/90 border border-slate-800 rounded-2xl p-6 flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold text-slate-100 flex items-center gap-2">
            <Bug className="w-5 h-5 text-rose-400" />
            <span>{lang === 'ar' ? 'متتبع الخلل والملاحظات الهندسية (Issue & Bug Tracker)' : 'Issue & Bug Tracker'}</span>
          </h2>
          <p className="text-xs text-slate-400 mt-1">
            {lang === 'ar'
              ? 'تسجيل وتتبع الخلل الفني، التحسينات المعمارية، ودرجات الخطورة'
              : 'Track software bugs, architectural enhancements, and resolution workflows'}
          </p>
        </div>

        <button
          onClick={() => setShowCreateModal(true)}
          className="px-4 py-2.5 rounded-xl bg-rose-500 text-slate-950 font-bold text-xs hover:bg-rose-400 transition-all flex items-center gap-2 shadow-lg shadow-rose-500/20 w-fit"
        >
          <Plus className="w-4 h-4" />
          <span>{lang === 'ar' ? 'إبلاغ عن خلل أو تحسين' : 'Report Issue'}</span>
        </button>
      </div>

      {/* Issues List */}
      <div className="bg-slate-900/90 border border-slate-800 rounded-2xl overflow-hidden shadow-xl">
        <div className="overflow-x-auto">
          <table className="w-full text-start text-xs">
            <thead className="bg-slate-950 text-slate-400 font-semibold border-b border-slate-800">
              <tr>
                <th className="p-4 text-start">عنوان التذكرة والمشكلة</th>
                <th className="p-4 text-start">النوع (Type)</th>
                <th className="p-4 text-start">الخطورة (Severity)</th>
                <th className="p-4 text-start">الحالة (Status)</th>
                <th className="p-4 text-start">المسؤول</th>
                <th className="p-4 text-center">الإجراءات</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/60 bg-slate-950/30">
              {safeIssues.map((issue) => (
                <tr key={issue.id} className="hover:bg-slate-900/40 transition-colors">
                  <td className="p-4">
                    <div>
                      <p className="font-bold text-slate-200">{issue.title}</p>
                      <p className="text-[11px] text-slate-400 mt-0.5">{issue.description}</p>
                    </div>
                  </td>

                  <td className="p-4">
                    <span className="font-mono text-[10px] px-2 py-0.5 rounded bg-slate-900 border border-slate-800 text-slate-300 uppercase">
                      {issue.type}
                    </span>
                  </td>

                  <td className="p-4">
                    <span className={`font-mono text-[10px] font-bold px-2 py-0.5 rounded border uppercase ${
                      issue.severity === 'critical'
                        ? 'bg-rose-950 text-rose-400 border-rose-800'
                        : issue.severity === 'high'
                        ? 'bg-amber-950 text-amber-400 border-amber-800'
                        : 'bg-slate-900 text-slate-300 border-slate-800'
                    }`}>
                      {issue.severity}
                    </span>
                  </td>

                  <td className="p-4">
                    <span className={`px-2 py-0.5 rounded text-[10px] font-semibold ${
                      issue.status === 'resolved' || issue.status === 'closed'
                        ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20'
                        : 'bg-cyan-500/10 text-cyan-400 border border-cyan-500/20'
                    }`}>
                      {issue.status}
                    </span>
                  </td>

                  <td className="p-4 text-slate-400 text-xs">
                    {issue.assignee || 'Unassigned'}
                  </td>

                  <td className="p-4 text-center">
                    {issue.status !== 'resolved' ? (
                      <button
                        onClick={() => onUpdateIssueStatus(issue.id, 'resolved')}
                        className="px-2.5 py-1 rounded-lg bg-emerald-950 text-emerald-300 border border-emerald-800 hover:bg-emerald-900 text-[10px] font-semibold"
                      >
                        إغلاق وحل ✓
                      </button>
                    ) : (
                      <span className="text-[11px] text-slate-500">تم الإغلاق</span>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Create Issue Modal */}
      {showCreateModal && (
        <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 w-full max-w-md space-y-4 shadow-2xl">
            <div className="flex items-center justify-between pb-3 border-b border-slate-800">
              <h3 className="text-base font-bold text-slate-100 flex items-center gap-2">
                <Bug className="w-5 h-5 text-rose-400" />
                <span>إبلاغ عن تذكرة هندسية جديدة</span>
              </h3>
              <button onClick={() => setShowCreateModal(false)} className="text-slate-400 hover:text-slate-200">
                ✕
              </button>
            </div>

            <form onSubmit={handleCreateSubmit} className="space-y-3.5 text-xs">
              <div>
                <label className="block text-slate-300 font-medium mb-1">عنوان المشكلة</label>
                <input
                  type="text"
                  required
                  value={title}
                  onChange={e => setTitle(e.target.value)}
                  placeholder="e.g. PayPal Webhook signature verification mismatch in sandbox"
                  className="w-full bg-slate-950 border border-slate-800 rounded-lg p-2.5 text-slate-200 focus:outline-none focus:border-rose-500"
                />
              </div>

              <div>
                <label className="block text-slate-300 font-medium mb-1">التفاصيل والخطوات</label>
                <textarea
                  rows={3}
                  value={description}
                  onChange={e => setDescription(e.target.value)}
                  placeholder="وصف المشكلة وكيفية إعادة إنتاجها..."
                  className="w-full bg-slate-950 border border-slate-800 rounded-lg p-2.5 text-slate-200 focus:outline-none focus:border-rose-500"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-300 font-medium mb-1">النوع</label>
                  <select
                    value={type}
                    onChange={e => setType(e.target.value as any)}
                    className="w-full bg-slate-950 border border-slate-800 rounded-lg p-2.5 text-slate-200 focus:outline-none focus:border-rose-500"
                  >
                    <option value="bug">خلل برمجي (Bug)</option>
                    <option value="feature">ميزة جديدة (Feature)</option>
                    <option value="improvement">تحسين معماري (Improvement)</option>
                    <option value="security">أمان (Security)</option>
                  </select>
                </div>

                <div>
                  <label className="block text-slate-300 font-medium mb-1">درجة الخطورة</label>
                  <select
                    value={severity}
                    onChange={e => setSeverity(e.target.value as any)}
                    className="w-full bg-slate-950 border border-slate-800 rounded-lg p-2.5 text-slate-200 focus:outline-none focus:border-rose-500"
                  >
                    <option value="low">منخفضة (Low)</option>
                    <option value="medium">متوسطة (Medium)</option>
                    <option value="high">عالية (High)</option>
                    <option value="critical">حرجة (Critical)</option>
                  </select>
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
                  className="px-4 py-2 rounded-xl bg-rose-500 text-slate-950 font-bold hover:bg-rose-400 shadow-md shadow-rose-500/20"
                >
                  حفظ ونشر التذكرة
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
