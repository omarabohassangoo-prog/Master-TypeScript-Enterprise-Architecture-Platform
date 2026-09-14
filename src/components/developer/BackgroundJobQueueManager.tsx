import React, { useState } from 'react';
import {
  Play, RefreshCw, CheckCircle2, AlertCircle, Clock,
  Cpu, Filter, Plus, ArrowRight, Layers, FileText, Send, Zap
} from 'lucide-react';
import { BackgroundJob } from '../../types';

interface BackgroundJobQueueManagerProps {
  jobs: BackgroundJob[];
  onTriggerJob: (jobType: BackgroundJob['type'], payload?: any) => Promise<void>;
  onClearCompleted: () => void;
  lang: 'ar' | 'en';
}

export const BackgroundJobQueueManager: React.FC<BackgroundJobQueueManagerProps> = ({
  jobs,
  onTriggerJob,
  onClearCompleted,
  lang,
}) => {
  const [filterStatus, setFilterStatus] = useState<string>('all');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [selectedJob, setSelectedJob] = useState<BackgroundJob | null>(null);

  const filteredJobs = jobs.filter(j => {
    if (filterStatus === 'all') return true;
    return j.status === filterStatus;
  });

  const handleTrigger = async (type: BackgroundJob['type']) => {
    setIsSubmitting(true);
    try {
      await onTriggerJob(type);
    } finally {
      setIsSubmitting(false);
    }
  };

  const getStatusBadge = (status: BackgroundJob['status']) => {
    switch (status) {
      case 'completed':
        return <span className="px-2.5 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-xs font-medium flex items-center gap-1"><CheckCircle2 className="w-3.5 h-3.5" /> مكتمل</span>;
      case 'processing':
        return <span className="px-2.5 py-1 rounded-full bg-cyan-500/10 border border-cyan-500/20 text-cyan-400 text-xs font-medium flex items-center gap-1 animate-pulse"><RefreshCw className="w-3.5 h-3.5 animate-spin" /> جاري التنفيذ</span>;
      case 'failed':
        return <span className="px-2.5 py-1 rounded-full bg-rose-500/10 border border-rose-500/20 text-rose-400 text-xs font-medium flex items-center gap-1"><AlertCircle className="w-3.5 h-3.5" /> فشل الإكمال</span>;
      default:
        return <span className="px-2.5 py-1 rounded-full bg-amber-500/10 border border-amber-500/20 text-amber-400 text-xs font-medium flex items-center gap-1"><Clock className="w-3.5 h-3.5" /> في الانتظار</span>;
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-xl">
        <div>
          <h2 className="text-xl font-bold text-slate-100 flex items-center gap-2">
            <Layers className="w-6 h-6 text-cyan-400" />
            <span>{lang === 'ar' ? 'إدارة طوابير المهام الخلفية (Async Background Job Queue)' : 'Background Job Queue Manager'}</span>
          </h2>
          <p className="text-xs text-slate-400 mt-1">
            {lang === 'ar'
              ? 'معالجة المهام الثقيلة (إرسال الإشعارات، تنظيف البيانات، إعادة محاولة الـ Webhook) بشكل غير متزامن دون تعطيل الخادم.'
              : 'Asynchronous background task processing engine for high-throughput batch operations.'}
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={onClearCompleted}
            className="px-3.5 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-semibold transition-all border border-slate-700"
          >
            {lang === 'ar' ? 'مسح المهام المكتملة' : 'Clear Completed'}
          </button>
        </div>
      </div>

      {/* Quick Action Triggers */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <button
          disabled={isSubmitting}
          onClick={() => handleTrigger('email_batch')}
          className="p-4 rounded-xl bg-slate-900 border border-slate-800 hover:border-cyan-500/40 text-start space-y-2 transition-all hover:shadow-lg hover:shadow-cyan-500/5 group"
        >
          <div className="flex items-center justify-between">
            <div className="p-2 rounded-lg bg-cyan-500/10 text-cyan-400 group-hover:scale-110 transition-transform"><Send className="w-4 h-4" /></div>
            <span className="text-[10px] font-mono text-slate-500">JOB_BATCH</span>
          </div>
          <div className="font-bold text-slate-200 text-xs">{lang === 'ar' ? 'إرسال بريد جماعي (Email Batch)' : 'Batch Email Dispatch'}</div>
          <p className="text-[11px] text-slate-400">إطلاق 100+ رسالة بريدية غير متزامنة</p>
        </button>

        <button
          disabled={isSubmitting}
          onClick={() => handleTrigger('db_cleanup')}
          className="p-4 rounded-xl bg-slate-900 border border-slate-800 hover:border-purple-500/40 text-start space-y-2 transition-all hover:shadow-lg hover:shadow-purple-500/5 group"
        >
          <div className="flex items-center justify-between">
            <div className="p-2 rounded-lg bg-purple-500/10 text-purple-400 group-hover:scale-110 transition-transform"><Cpu className="w-4 h-4" /></div>
            <span className="text-[10px] font-mono text-slate-500">DB_VACUUM</span>
          </div>
          <div className="font-bold text-slate-200 text-xs">{lang === 'ar' ? 'تنظيف الجلسات المنتهية (DB Cleanup)' : 'Database Cleanup'}</div>
          <p className="text-[11px] text-slate-400">أرشفة الجلسات والسجلات القديمة</p>
        </button>

        <button
          disabled={isSubmitting}
          onClick={() => handleTrigger('webhook_retry')}
          className="p-4 rounded-xl bg-slate-900 border border-slate-800 hover:border-amber-500/40 text-start space-y-2 transition-all hover:shadow-lg hover:shadow-amber-500/5 group"
        >
          <div className="flex items-center justify-between">
            <div className="p-2 rounded-lg bg-amber-500/10 text-amber-400 group-hover:scale-110 transition-transform"><Zap className="w-4 h-4" /></div>
            <span className="text-[10px] font-mono text-slate-500">RETRY_WORKER</span>
          </div>
          <div className="font-bold text-slate-200 text-xs">{lang === 'ar' ? 'إعادة محاولة الـ Webhook' : 'Webhook Retry'}</div>
          <p className="text-[11px] text-slate-400">معالجة طلبات الويب الفاشلة باعتدال</p>
        </button>

        <button
          disabled={isSubmitting}
          onClick={() => handleTrigger('pdf_export')}
          className="p-4 rounded-xl bg-slate-900 border border-slate-800 hover:border-emerald-500/40 text-start space-y-2 transition-all hover:shadow-lg hover:shadow-emerald-500/5 group"
        >
          <div className="flex items-center justify-between">
            <div className="p-2 rounded-lg bg-emerald-500/10 text-emerald-400 group-hover:scale-110 transition-transform"><FileText className="w-4 h-4" /></div>
            <span className="text-[10px] font-mono text-slate-500">EXPORT_JOB</span>
          </div>
          <div className="font-bold text-slate-200 text-xs">{lang === 'ar' ? 'توليد تقارير PDF المجمعة' : 'Async PDF Generator'}</div>
          <p className="text-[11px] text-slate-400">إنشاء المستندات الثقيلة بالخلفية</p>
        </button>
      </div>

      {/* Filter Bar */}
      <div className="flex items-center justify-between bg-slate-900/60 border border-slate-800 rounded-xl p-3">
        <div className="flex items-center gap-2">
          <Filter className="w-4 h-4 text-slate-400" />
          <span className="text-xs text-slate-300 font-semibold">{lang === 'ar' ? 'تصفية المهام:' : 'Filter Tasks:'}</span>
        </div>

        <div className="flex items-center gap-1.5 text-xs">
          {['all', 'queued', 'processing', 'completed', 'failed'].map(st => (
            <button
              key={st}
              onClick={() => setFilterStatus(st)}
              className={`px-3 py-1 rounded-lg capitalize font-medium transition-all ${
                filterStatus === st
                  ? 'bg-cyan-500 text-slate-950 font-bold'
                  : 'bg-slate-800 text-slate-400 hover:text-slate-200'
              }`}
            >
              {st}
            </button>
          ))}
        </div>
      </div>

      {/* Jobs Table */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl overflow-hidden shadow-xl">
        <div className="overflow-x-auto">
          <table className="w-full text-start text-xs">
            <thead className="bg-slate-950 text-slate-400 font-semibold border-b border-slate-800">
              <tr>
                <th className="p-3 text-start">معرف المهمة ID</th>
                <th className="p-3 text-start">اسم المهمة والتصنيف</th>
                <th className="p-3 text-center">الحالة</th>
                <th className="p-3 text-center">المحاولات</th>
                <th className="p-3 text-center">مدة التنفيذ</th>
                <th className="p-3 text-start">وقت التشغيل</th>
                <th className="p-3 text-end">التفاصيل</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/60 bg-slate-950/20">
              {filteredJobs.length === 0 ? (
                <tr>
                  <td colSpan={7} className="p-8 text-center text-slate-500">
                    لا توجد مهام مطابقة للمعيار المحدد حالياً.
                  </td>
                </tr>
              ) : (
                filteredJobs.map(job => (
                  <tr key={job.id} className="hover:bg-slate-900/40">
                    <td className="p-3 font-mono text-cyan-400 font-bold">{job.id}</td>
                    <td className="p-3">
                      <div className="font-semibold text-slate-200">{job.name}</div>
                      <div className="text-[10px] text-slate-500 font-mono">{job.type}</div>
                    </td>
                    <td className="p-3 text-center">{getStatusBadge(job.status)}</td>
                    <td className="p-3 text-center font-mono text-slate-300">{job.attempts} / {job.maxAttempts}</td>
                    <td className="p-3 text-center font-mono text-slate-400">{job.durationMs ? `${job.durationMs}ms` : '—'}</td>
                    <td className="p-3 text-slate-400 text-[11px]">{new Date(job.runAt).toLocaleTimeString()}</td>
                    <td className="p-3 text-end">
                      <button
                        onClick={() => setSelectedJob(job)}
                        className="px-2.5 py-1 rounded bg-slate-800 hover:bg-slate-700 text-slate-300 text-[11px] font-medium"
                      >
                        معاينة المعطيات
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Job Details Modal */}
      {selectedJob && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/80 backdrop-blur-sm p-4">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl max-w-lg w-full p-6 space-y-4 shadow-2xl">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <h3 className="font-bold text-slate-100 flex items-center gap-2">
                <Layers className="w-5 h-5 text-cyan-400" />
                <span>تفاصيل المهمة {selectedJob.id}</span>
              </h3>
              <button onClick={() => setSelectedJob(null)} className="text-slate-400 hover:text-slate-200 font-bold text-sm">✕</button>
            </div>

            <div className="space-y-3 text-xs">
              <div>
                <span className="text-slate-400 block mb-1 font-mono">Payload Data (المعطيات):</span>
                <pre className="p-3 rounded-xl bg-slate-950 border border-slate-800 text-cyan-300 font-mono overflow-x-auto">
                  {JSON.stringify(selectedJob.payload, null, 2)}
                </pre>
              </div>

              {selectedJob.result && (
                <div>
                  <span className="text-slate-400 block mb-1 font-mono">Execution Result (النتيجة):</span>
                  <pre className="p-3 rounded-xl bg-slate-950 border border-slate-800 text-emerald-300 font-mono overflow-x-auto">
                    {JSON.stringify(selectedJob.result, null, 2)}
                  </pre>
                </div>
              )}

              {selectedJob.error && (
                <div>
                  <span className="text-rose-400 block mb-1 font-mono">Error Log (سجل الخطأ):</span>
                  <div className="p-3 rounded-xl bg-rose-950/30 border border-rose-900/50 text-rose-300 font-mono">
                    {selectedJob.error}
                  </div>
                </div>
              )}
            </div>

            <div className="flex justify-end pt-2">
              <button
                onClick={() => setSelectedJob(null)}
                className="px-4 py-2 rounded-xl bg-slate-800 text-slate-200 font-bold text-xs hover:bg-slate-700"
              >
                إغلاق
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
