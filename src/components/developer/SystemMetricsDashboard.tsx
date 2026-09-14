import React from 'react';
import {
  Activity, Cpu, Database, Server, Zap, ShieldAlert, Clock, Gauge, RefreshCw, BarChart2
} from 'lucide-react';
import { SystemMetrics } from '../../types';

interface SystemMetricsDashboardProps {
  metrics: SystemMetrics;
  onRefreshMetrics: () => void;
  lang: 'ar' | 'en';
}

export const SystemMetricsDashboard: React.FC<SystemMetricsDashboardProps> = ({
  metrics,
  onRefreshMetrics,
  lang,
}) => {
  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-xl">
        <div>
          <h2 className="text-xl font-bold text-slate-100 flex items-center gap-2">
            <Gauge className="w-6 h-6 text-cyan-400" />
            <span>{lang === 'ar' ? 'مراقبة أداء الخادم ومقاييس APM الحية' : 'System Performance & APM Metrics'}</span>
          </h2>
          <p className="text-xs text-slate-400 mt-1">
            {lang === 'ar'
              ? 'تحليل استهلاك الذاكرة، ضغط المعالج CPU، اتصالات pg.Pool، وزمن استجابة الـ API في الوقت الفعلي.'
              : 'Real-time monitoring of Node.js engine, PostgreSQL connection pool, and API P95 latency.'}
          </p>
        </div>

        <button
          onClick={onRefreshMetrics}
          className="px-4 py-2 rounded-xl bg-cyan-500 hover:bg-cyan-400 text-slate-950 text-xs font-bold transition-all shadow-md shadow-cyan-500/20 flex items-center gap-2"
        >
          <RefreshCw className="w-4 h-4" />
          <span>{lang === 'ar' ? 'تحديث القياسات' : 'Refresh Metrics'}</span>
        </button>
      </div>

      {/* Primary Gauge Metric Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* CPU Load */}
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 space-y-3 shadow-lg relative overflow-hidden">
          <div className="flex items-center justify-between">
            <span className="text-slate-400 text-xs font-medium">{lang === 'ar' ? 'ضغط المعالج CPU' : 'CPU Load'}</span>
            <div className="p-2 rounded-lg bg-cyan-500/10 text-cyan-400"><Cpu className="w-4 h-4" /></div>
          </div>
          <div className="text-2xl font-bold text-slate-100 font-mono">{metrics.cpuUsagePercent}%</div>
          <div className="w-full bg-slate-800 rounded-full h-2 overflow-hidden">
            <div
              className={`h-full transition-all duration-500 ${metrics.cpuUsagePercent > 80 ? 'bg-rose-500' : 'bg-cyan-500'}`}
              style={{ width: `${Math.min(metrics.cpuUsagePercent, 100)}%` }}
            />
          </div>
          <div className="text-[10px] text-slate-500">معدل الاستهلاك الحالي للنواة</div>
        </div>

        {/* Memory RSS */}
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 space-y-3 shadow-lg relative overflow-hidden">
          <div className="flex items-center justify-between">
            <span className="text-slate-400 text-xs font-medium">{lang === 'ar' ? 'استهلاك الذاكرة RSS' : 'RAM RSS Usage'}</span>
            <div className="p-2 rounded-lg bg-purple-500/10 text-purple-400"><Server className="w-4 h-4" /></div>
          </div>
          <div className="text-2xl font-bold text-slate-100 font-mono">{metrics.memoryRssMb} MB</div>
          <div className="w-full bg-slate-800 rounded-full h-2 overflow-hidden">
            <div
              className="h-full bg-purple-500 transition-all duration-500"
              style={{ width: `${Math.min((metrics.memoryRssMb / 512) * 100, 100)}%` }}
            />
          </div>
          <div className="text-[10px] text-slate-500 font-mono">Heap: {metrics.memoryHeapMb} MB</div>
        </div>

        {/* PostgreSQL Pool */}
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 space-y-3 shadow-lg relative overflow-hidden">
          <div className="flex items-center justify-between">
            <span className="text-slate-400 text-xs font-medium">{lang === 'ar' ? 'روابط pg.Pool الحية' : 'PostgreSQL Pool'}</span>
            <div className="p-2 rounded-lg bg-emerald-500/10 text-emerald-400"><Database className="w-4 h-4" /></div>
          </div>
          <div className="text-2xl font-bold text-slate-100 font-mono">
            {metrics.dbPoolActive} <span className="text-xs text-slate-500 font-normal">/ {metrics.dbPoolTotal} active</span>
          </div>
          <div className="w-full bg-slate-800 rounded-full h-2 overflow-hidden">
            <div
              className="h-full bg-emerald-500 transition-all duration-500"
              style={{ width: `${Math.min((metrics.dbPoolActive / metrics.dbPoolTotal) * 100, 100)}%` }}
            />
          </div>
          <div className="text-[10px] text-slate-500 font-mono">Idle Pool Connections: {metrics.dbPoolIdle}</div>
        </div>

        {/* API Latency */}
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 space-y-3 shadow-lg relative overflow-hidden">
          <div className="flex items-center justify-between">
            <span className="text-slate-400 text-xs font-medium">{lang === 'ar' ? 'زمن الاستجابة P95 Latency' : 'API P95 Latency'}</span>
            <div className="p-2 rounded-lg bg-amber-500/10 text-amber-400"><Zap className="w-4 h-4" /></div>
          </div>
          <div className="text-2xl font-bold text-slate-100 font-mono">{metrics.apiLatencyP95Ms} ms</div>
          <div className="w-full bg-slate-800 rounded-full h-2 overflow-hidden">
            <div
              className={`h-full transition-all duration-500 ${metrics.apiLatencyP95Ms > 200 ? 'bg-amber-500' : 'bg-emerald-400'}`}
              style={{ width: `${Math.min((metrics.apiLatencyP95Ms / 500) * 100, 100)}%` }}
            />
          </div>
          <div className="text-[10px] text-slate-500">95% من الطلبات تنتهي في أقل من هذا الزمن</div>
        </div>
      </div>

      {/* Secondary Performance Matrix */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Request Throughput & Security */}
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 space-y-4 shadow-xl">
          <h3 className="font-bold text-slate-100 text-sm flex items-center gap-2 border-b border-slate-800 pb-3">
            <BarChart2 className="w-4 h-4 text-cyan-400" />
            <span>معدل الطلبات وأمن الـ Rate Limiting</span>
          </h3>

          <div className="grid grid-cols-2 gap-4 text-xs">
            <div className="p-4 rounded-xl bg-slate-950/70 border border-slate-800 space-y-1">
              <span className="text-slate-400 block">إجمالي الطلبات المعالجة:</span>
              <span className="text-xl font-bold text-cyan-400 font-mono">{metrics.totalRequests.toLocaleString()}</span>
            </div>

            <div className="p-4 rounded-xl bg-slate-950/70 border border-slate-800 space-y-1">
              <span className="text-slate-400 block">الطلبات المحظورة (Rate Limited):</span>
              <span className="text-xl font-bold text-amber-400 font-mono">{metrics.rateLimitBlocked}</span>
            </div>
          </div>

          <div className="p-4 rounded-xl bg-slate-950/50 border border-slate-800 space-y-2 text-xs">
            <div className="flex items-center justify-between text-slate-300">
              <span className="flex items-center gap-1.5"><ShieldAlert className="w-4 h-4 text-emerald-400" /> جدار الحماية وعزل الطلبات</span>
              <span className="text-emerald-400 font-mono font-bold">100% PROTECTED</span>
            </div>
            <p className="text-slate-500 text-[11px] leading-relaxed">
              يتم تطبيق حظر الطلبات المشبوهة تلقائياً بناءً على تتابع المحاولات وربط بصمة الجهاز الفردية.
            </p>
          </div>
        </div>

        {/* Engine Uptime & Health Stats */}
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 space-y-4 shadow-xl">
          <h3 className="font-bold text-slate-100 text-sm flex items-center gap-2 border-b border-slate-800 pb-3">
            <Clock className="w-4 h-4 text-cyan-400" />
            <span>جاهزية المحرك الخادمي (Uptime & Node Engine)</span>
          </h3>

          <div className="p-4 rounded-xl bg-slate-950/70 border border-slate-800 flex items-center justify-between text-xs">
            <div>
              <span className="text-slate-400 block">زمن تشغيل المحرك المستمر (Uptime):</span>
              <span className="text-lg font-bold text-emerald-400 font-mono">
                {Math.floor(metrics.uptimeSeconds / 3600)}h {Math.floor((metrics.uptimeSeconds % 3600) / 60)}m {metrics.uptimeSeconds % 60}s
              </span>
            </div>
            <span className="px-3 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-xs font-bold font-mono">
              STABLE
            </span>
          </div>

          <div className="space-y-2 text-xs">
            <div className="flex justify-between p-2 rounded bg-slate-950/40 text-slate-300 font-mono">
              <span>Node.js Version:</span>
              <span className="text-cyan-400 font-bold">{process.env.NODE_VERSION || 'v22.x LTS'}</span>
            </div>
            <div className="flex justify-between p-2 rounded bg-slate-950/40 text-slate-300 font-mono">
              <span>Environment:</span>
              <span className="text-cyan-400 font-bold">DEVELOPMENT / CONTAINER</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
