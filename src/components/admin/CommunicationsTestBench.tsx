import React, { useState } from 'react';
import { Send, Mail, Smartphone, MessageSquare, CheckCircle2, History } from 'lucide-react';
import { CommunicationLog } from '../../types';

interface CommunicationsTestBenchProps {
  logs: CommunicationLog[];
  onSendMessage: (data: { channel: 'email' | 'sms' | 'whatsapp'; recipient: string; subject?: string; content: string }) => Promise<void>;
  lang: 'ar' | 'en';
}

export const CommunicationsTestBench: React.FC<CommunicationsTestBenchProps> = ({
  logs = [],
  onSendMessage,
  lang,
}) => {
  const [channel, setChannel] = useState<'email' | 'sms' | 'whatsapp'>('email');
  const [recipient, setRecipient] = useState('user@enterprise.local');
  const [subject, setSubject] = useState('تنبيه هام من النظام المعماري');
  const [content, setContent] = useState('مرحباً بك! هذه رسالة اختبارية لتأكيد عمل محول الاتصال بنجاح.');
  const [isSending, setIsSending] = useState(false);
  const [sentSuccess, setSentSuccess] = useState(false);

  const safeLogs = logs || [];

  const handleChannelChange = (c: 'email' | 'sms' | 'whatsapp') => {
    setChannel(c);
    if (c === 'email') setRecipient('user@enterprise.local');
    else if (c === 'sms') setRecipient('+966501234567');
    else if (c === 'whatsapp') setRecipient('+966509876543');
  };

  const handleSend = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSending(true);
    await onSendMessage({ channel, recipient, subject, content });
    setIsSending(false);
    setSentSuccess(true);
    setTimeout(() => setSentSuccess(false), 3000);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-slate-900/90 border border-slate-800 rounded-2xl p-6 flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold text-slate-100 flex items-center gap-2">
            <Send className="w-5 h-5 text-cyan-400" />
            <span>{lang === 'ar' ? 'منصة اختبار الاتصالات (Multi-Channel Dispatcher)' : 'Communications Dispatcher'}</span>
          </h2>
          <p className="text-xs text-slate-400 mt-1">
            {lang === 'ar'
              ? 'إرسال واختبار محولات البريد (SMTP)، والرسائل النصية (SMS)، ورسائل WhatsApp Cloud API مع سجلات حية'
              : 'Test Email, SMS, and WhatsApp adapters in real-time with comprehensive logs'}
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Dispatch Form */}
        <div className="lg:col-span-1 bg-slate-900/90 border border-slate-800 rounded-2xl p-6 space-y-4 shadow-xl">
          <h3 className="font-bold text-slate-200 text-sm flex items-center gap-2 pb-3 border-b border-slate-800">
            <Send className="w-4 h-4 text-cyan-400" />
            <span>إرسال رسالة جديدة عبر المحول</span>
          </h3>

          <form onSubmit={handleSend} className="space-y-3.5 text-xs">
            {/* Channel Switcher */}
            <div>
              <label className="block text-slate-400 font-medium mb-1.5">القناة (Channel Adapter)</label>
              <div className="grid grid-cols-3 gap-1.5 p-1 rounded-xl bg-slate-950 border border-slate-800">
                <button
                  type="button"
                  onClick={() => handleChannelChange('email')}
                  className={`py-2 rounded-lg font-semibold flex items-center justify-center gap-1 transition-all ${
                    channel === 'email' ? 'bg-cyan-500 text-slate-950 shadow' : 'text-slate-400 hover:text-slate-200'
                  }`}
                >
                  <Mail className="w-3.5 h-3.5" />
                  <span>Email</span>
                </button>
                <button
                  type="button"
                  onClick={() => handleChannelChange('sms')}
                  className={`py-2 rounded-lg font-semibold flex items-center justify-center gap-1 transition-all ${
                    channel === 'sms' ? 'bg-emerald-500 text-slate-950 shadow' : 'text-slate-400 hover:text-slate-200'
                  }`}
                >
                  <Smartphone className="w-3.5 h-3.5" />
                  <span>SMS</span>
                </button>
                <button
                  type="button"
                  onClick={() => handleChannelChange('whatsapp')}
                  className={`py-2 rounded-lg font-semibold flex items-center justify-center gap-1 transition-all ${
                    channel === 'whatsapp' ? 'bg-indigo-500 text-slate-950 shadow' : 'text-slate-400 hover:text-slate-200'
                  }`}
                >
                  <MessageSquare className="w-3.5 h-3.5" />
                  <span>WhatsApp</span>
                </button>
              </div>
            </div>

            <div>
              <label className="block text-slate-400 font-medium mb-1">المستلم (Recipient)</label>
              <input
                type="text"
                required
                value={recipient}
                onChange={e => setRecipient(e.target.value)}
                className="w-full bg-slate-950 border border-slate-800 rounded-lg p-2.5 text-slate-200 focus:outline-none focus:border-cyan-500 font-mono"
              />
            </div>

            {channel === 'email' && (
              <div>
                <label className="block text-slate-400 font-medium mb-1">الموضوع (Subject)</label>
                <input
                  type="text"
                  required
                  value={subject}
                  onChange={e => setSubject(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-800 rounded-lg p-2.5 text-slate-200 focus:outline-none focus:border-cyan-500"
                />
              </div>
            )}

            <div>
              <label className="block text-slate-400 font-medium mb-1">نص الرسالة (Content)</label>
              <textarea
                rows={4}
                required
                value={content}
                onChange={e => setContent(e.target.value)}
                className="w-full bg-slate-950 border border-slate-800 rounded-lg p-2.5 text-slate-200 focus:outline-none focus:border-cyan-500"
              />
            </div>

            <button
              type="submit"
              disabled={isSending}
              className="w-full py-2.5 rounded-xl bg-cyan-500 text-slate-950 font-bold hover:bg-cyan-400 transition-all shadow-md shadow-cyan-500/20 flex items-center justify-center gap-2"
            >
              <Send className="w-4 h-4" />
              <span>{isSending ? 'جاري الإرسال والتسجيل...' : 'إرسال الرسالة عبر الـAdapter'}</span>
            </button>

            {sentSuccess && (
              <div className="p-2.5 rounded-lg bg-emerald-950/60 border border-emerald-800/40 text-emerald-400 text-center flex items-center justify-center gap-1.5 animate-pulse">
                <CheckCircle2 className="w-4 h-4" />
                <span>تم إرسال الرسالة وتسجيلها في السجل بنجاح!</span>
              </div>
            )}
          </form>
        </div>

        {/* Communication Logs Stream */}
        <div className="lg:col-span-2 bg-slate-900/90 border border-slate-800 rounded-2xl p-6 space-y-4 shadow-xl">
          <div className="flex items-center justify-between pb-3 border-b border-slate-800">
            <h3 className="font-bold text-slate-200 text-sm flex items-center gap-2">
              <History className="w-4 h-4 text-cyan-400" />
              <span>سجلات الاتصال الصادرة (Communication Logs)</span>
            </h3>
            <span className="text-xs text-slate-500 font-mono">{safeLogs.length} سجل</span>
          </div>

          <div className="space-y-2.5 max-h-[480px] overflow-y-auto">
            {safeLogs.length === 0 ? (
              <p className="text-xs text-slate-500 text-center py-8">لا توجد رسائل مسجلة بعد. أرسل رسالة تجريبية أولاً.</p>
            ) : (
              safeLogs.map((log) => (
                <div key={log.id} className="p-3 rounded-xl bg-slate-950/70 border border-slate-800 space-y-1 text-xs">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <span className={`font-mono text-[10px] uppercase px-2 py-0.5 rounded font-bold ${
                        log.channel === 'email'
                          ? 'bg-cyan-950 text-cyan-400 border border-cyan-800'
                          : log.channel === 'sms'
                          ? 'bg-emerald-950 text-emerald-400 border border-emerald-800'
                          : 'bg-indigo-950 text-indigo-400 border border-indigo-800'
                      }`}>
                        {log.channel}
                      </span>
                      <span className="font-mono text-slate-300 font-semibold">{log.recipient}</span>
                    </div>
                    <span className="text-[10px] text-slate-500 font-mono">{new Date(log.createdAt).toLocaleTimeString()}</span>
                  </div>
                  {log.subject && <p className="font-semibold text-slate-200 text-xs">{log.subject}</p>}
                  <p className="text-slate-400 text-[11px] line-clamp-2">{log.content}</p>
                  <div className="pt-1 flex items-center justify-between text-[10px] text-slate-500 border-t border-slate-900 font-mono">
                    <span>المزود: {log.provider}</span>
                    <span className="text-emerald-400">✓ {log.status}</span>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
