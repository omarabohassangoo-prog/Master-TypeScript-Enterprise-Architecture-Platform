import React, { useState } from 'react';
import { Code2, Play, CheckCircle2, Copy, Terminal, Server, ArrowRight } from 'lucide-react';
import { api } from '../../api/client';

export const ApiDocumentationPlayground: React.FC<{ lang: 'ar' | 'en' }> = ({ lang }) => {
  const [selectedEndpointIndex, setSelectedEndpointIndex] = useState(0);
  const [customBody, setCustomBody] = useState('');
  const [responseOutput, setResponseOutput] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [statusCode, setStatusCode] = useState<number | null>(null);

  const endpoints = [
    {
      method: 'GET',
      path: '/api/v1/health',
      title: 'Health Status & Ping',
      desc: 'فحص صحة الخادم ووقت التشغيل ونسخة Node.js',
      defaultBody: '',
    },
    {
      method: 'GET',
      path: '/api/v1/health/database',
      title: 'Database Engine Health',
      desc: 'استعلام عن صحة حوض الاتصال (Connection Pool) وتعداد الاستعلامات',
      defaultBody: '',
    },
    {
      method: 'GET',
      path: '/api/v1/system/info',
      title: 'System Information & Feature Flags',
      desc: 'جلب بيانات النظام وإعدادات البيئة وأعلام الميزات',
      defaultBody: '',
    },
    {
      method: 'POST',
      path: '/api/v1/auth/login',
      title: 'User Login & Session Rotation',
      desc: 'تسجيل الدخول، التحقق من القفل، وتوليد Token وجلسة جديدة',
      defaultBody: JSON.stringify({ emailOrUsername: 'admin@enterprise.local', password: 'password123' }, null, 2),
    },
    {
      method: 'GET',
      path: '/api/v1/users',
      title: 'List All Users',
      desc: 'استعراض الحسابات المسجلة وحالاتها',
      defaultBody: '',
    },
    {
      method: 'GET',
      path: '/api/v1/roles',
      title: 'List Roles & RBAC Matrix',
      desc: 'استعلام مصفوفة الأدوار والصلاحيات',
      defaultBody: '',
    },
    {
      method: 'GET',
      path: '/api/v1/settings',
      title: 'System Settings Catalog',
      desc: 'استرجاع قائمة إعدادات النظام وتكوينات SEO',
      defaultBody: '',
    },
    {
      method: 'GET',
      path: '/api/v1/dev/consistency-check',
      title: 'Automated Architecture Consistency Check',
      desc: 'تشغيل الفحص الآلي للعقود المعمارية وقواعد البيانات',
      defaultBody: '',
    },
  ];

  const currentEndpoint = endpoints[selectedEndpointIndex];

  const handleSelectEndpoint = (idx: number) => {
    setSelectedEndpointIndex(idx);
    setCustomBody(endpoints[idx].defaultBody);
    setResponseOutput(null);
    setStatusCode(null);
  };

  const handleRunRequest = async () => {
    setIsLoading(true);
    setResponseOutput(null);
    try {
      let res;
      if (currentEndpoint.method === 'GET') {
        res = await api.get(currentEndpoint.path);
      } else if (currentEndpoint.method === 'POST') {
        const bodyObj = customBody ? JSON.parse(customBody) : {};
        res = await api.post(currentEndpoint.path, bodyObj);
      }
      setResponseOutput(JSON.stringify(res, null, 2));
      setStatusCode(res?.success ? 200 : 400);
    } catch (err: any) {
      setResponseOutput(JSON.stringify({ error: err.message }, null, 2));
      setStatusCode(500);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-slate-900/90 border border-slate-800 rounded-2xl p-6 flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold text-slate-100 flex items-center gap-2">
            <Code2 className="w-5 h-5 text-cyan-400" />
            <span>{lang === 'ar' ? 'توثيق واختبار OpenAPI التفاعلي (Swagger Playground)' : 'API Documentation & Playground'}</span>
          </h2>
          <p className="text-xs text-slate-400 mt-1">
            {lang === 'ar'
              ? 'استعراض كافة نقاط واجهات REST API مع ميزة التجربة الحية (Try It Out) ومراجعة المخرجات الحقيقية'
              : 'Interactive REST API contract explorer with live execution and payload inspection'}
          </p>
        </div>

        <div className="px-3 py-1 rounded-full bg-cyan-950/80 border border-cyan-800/40 text-cyan-400 text-xs font-mono">
          REST v1.0 / JSON Envelope
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Endpoints Sidebar */}
        <div className="lg:col-span-4 bg-slate-900/90 border border-slate-800 rounded-2xl p-4 space-y-2 shadow-xl">
          <p className="text-[11px] font-bold text-slate-400 uppercase tracking-wider px-2 mb-2">
            نقاط النهاية المسجلة (Endpoints)
          </p>
          <div className="space-y-1.5">
            {endpoints.map((ep, idx) => {
              const isSelected = selectedEndpointIndex === idx;
              return (
                <button
                  key={idx}
                  onClick={() => handleSelectEndpoint(idx)}
                  className={`w-full text-start p-2.5 rounded-xl border transition-all flex items-center gap-2.5 text-xs ${
                    isSelected
                      ? 'bg-cyan-500/15 border-cyan-500/40 text-cyan-300 font-semibold'
                      : 'bg-slate-950/60 border-slate-800/80 text-slate-400 hover:text-slate-200 hover:border-slate-700'
                  }`}
                >
                  <span className={`font-mono text-[10px] font-bold px-1.5 py-0.5 rounded ${
                    ep.method === 'GET' ? 'bg-emerald-950 text-emerald-400 border border-emerald-800' : 'bg-cyan-950 text-cyan-400 border border-cyan-800'
                  }`}>
                    {ep.method}
                  </span>
                  <div className="truncate flex-1">
                    <p className="truncate font-mono text-[11px] text-slate-200">{ep.path}</p>
                    <p className="truncate text-[10px] text-slate-400">{ep.title}</p>
                  </div>
                </button>
              );
            })}
          </div>
        </div>

        {/* Live Playground & Request Runner */}
        <div className="lg:col-span-8 bg-slate-900/90 border border-slate-800 rounded-2xl p-6 space-y-5 shadow-xl">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b border-slate-800">
            <div>
              <div className="flex items-center gap-2 font-mono text-sm font-bold">
                <span className={`px-2 py-0.5 rounded ${
                  currentEndpoint.method === 'GET' ? 'bg-emerald-950 text-emerald-400 border border-emerald-800' : 'bg-cyan-950 text-cyan-400 border border-cyan-800'
                }`}>
                  {currentEndpoint.method}
                </span>
                <span className="text-slate-100">{currentEndpoint.path}</span>
              </div>
              <p className="text-xs text-slate-400 mt-1">{currentEndpoint.desc}</p>
            </div>

            <button
              onClick={handleRunRequest}
              disabled={isLoading}
              className="px-4 py-2 rounded-xl bg-cyan-500 text-slate-950 font-bold text-xs hover:bg-cyan-400 transition-all flex items-center gap-2 shadow-lg shadow-cyan-500/20 w-fit shrink-0"
            >
              <Play className="w-3.5 h-3.5 fill-current" />
              <span>{isLoading ? 'جاري الاستعلام...' : 'تجربة الطلب (Send Request)'}</span>
            </button>
          </div>

          {/* Request Payload (if POST/PUT) */}
          {currentEndpoint.method !== 'GET' && (
            <div className="space-y-1.5">
              <label className="block text-slate-400 text-xs font-semibold">جسم الطلب (JSON Request Body):</label>
              <textarea
                rows={4}
                value={customBody}
                onChange={e => setCustomBody(e.target.value)}
                className="w-full bg-slate-950 border border-slate-800 rounded-xl p-3 font-mono text-xs text-cyan-300 focus:outline-none focus:border-cyan-500"
              />
            </div>
          )}

          {/* Response Console */}
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-slate-300 text-xs font-semibold flex items-center gap-1.5">
                <Terminal className="w-4 h-4 text-cyan-400" />
                <span>الاستجابة الحقيقية (Response Payload):</span>
              </span>
              {statusCode && (
                <span className={`font-mono text-xs font-bold px-2 py-0.5 rounded ${
                  statusCode >= 200 && statusCode < 300
                    ? 'bg-emerald-950 text-emerald-400 border border-emerald-800'
                    : 'bg-rose-950 text-rose-400 border border-rose-800'
                }`}>
                  HTTP {statusCode}
                </span>
              )}
            </div>

            <pre className="bg-slate-950 border border-slate-800 rounded-xl p-4 text-xs font-mono text-emerald-400 overflow-x-auto max-h-96 leading-relaxed">
              {responseOutput || '// انقر على "تجربة الطلب" لتنفيذ الاستدعاء الحقيقي ورؤية المخرجات من الخادم...'}
            </pre>
          </div>
        </div>
      </div>
    </div>
  );
};
