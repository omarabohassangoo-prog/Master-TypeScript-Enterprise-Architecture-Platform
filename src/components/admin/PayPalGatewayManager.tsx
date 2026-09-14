import React, { useState } from 'react';
import { CreditCard, Plus, CheckCircle2, ShieldCheck, RefreshCw, DollarSign, ExternalLink } from 'lucide-react';
import { PayPalSystemSettings, PayPalTransaction } from '../../types';

interface PayPalGatewayManagerProps {
  settings: PayPalSystemSettings;
  transactions: PayPalTransaction[];
  onCreateTestPayment: (amount: number, description: string) => Promise<void>;
  lang: 'ar' | 'en';
}

export const PayPalGatewayManager: React.FC<PayPalGatewayManagerProps> = ({
  settings,
  transactions = [],
  onCreateTestPayment,
  lang,
}) => {
  const [testAmount, setTestTestAmount] = useState(99);
  const [testDesc, setTestDesc] = useState('Enterprise Architecture Pro License (Sandbox Order)');
  const [isProcessing, setIsProcessing] = useState(false);

  const safeTransactions = transactions || [];
  const totalVolume = safeTransactions
    .filter(t => t && t.status === 'completed')
    .reduce((acc, t) => acc + (t?.amount || 0), 0);

  const handleTestSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsProcessing(true);
    await onCreateTestPayment(testAmount, testDesc);
    setIsProcessing(false);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-slate-900/90 border border-slate-800 rounded-2xl p-6 flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold text-slate-100 flex items-center gap-2">
            <CreditCard className="w-5 h-5 text-cyan-400" />
            <span>{lang === 'ar' ? 'بوابة مدفوعات PayPal والـSandbox (Payments Engine)' : 'PayPal Payment Gateway'}</span>
          </h2>
          <p className="text-xs text-slate-400 mt-1">
            {lang === 'ar'
              ? 'إدارة محول PayPal Rest API، التحقق من Webhooks، ومحاكاة عمليات الشراء والتأكيد التلقائي'
              : 'PayPal REST adapter, Webhook verification, and Sandbox checkout simulation'}
          </p>
        </div>

        <div className="flex items-center gap-2">
          <span className="px-3 py-1 rounded-full bg-amber-500/10 border border-amber-500/20 text-amber-400 text-xs font-mono font-bold">
            Sandbox Active
          </span>
        </div>
      </div>

      {/* Gateway Telemetry */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-slate-900/80 border border-slate-800 rounded-xl p-5">
          <p className="text-xs text-slate-400 mb-1">حجم العمليات المؤكدة</p>
          <h3 className="text-2xl font-bold text-slate-100 font-mono">${totalVolume.toFixed(2)} USD</h3>
          <p className="text-[11px] text-emerald-400 mt-1">✓ تم تسوية جميع المدفوعات في السجل</p>
        </div>

        <div className="bg-slate-900/80 border border-slate-800 rounded-xl p-5">
          <p className="text-xs text-slate-400 mb-1">البيئة المعتمدة</p>
          <h3 className="text-2xl font-bold text-amber-400 uppercase font-mono">{settings?.environment || 'Sandbox'}</h3>
          <p className="text-[11px] text-slate-500 mt-1 font-mono">Client: {settings?.clientIdMasked || 'sb_client_***'}</p>
        </div>

        <div className="bg-slate-900/80 border border-slate-800 rounded-xl p-5">
          <p className="text-xs text-slate-400 mb-1">رابط الـWebhook المسجل</p>
          <p className="text-xs text-cyan-400 font-mono truncate mt-2 bg-slate-950 p-2 rounded border border-slate-800">
            {settings?.webhookUrl || '/api/v1/paypal/webhook'}
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Test Order Simulator */}
        <div className="lg:col-span-1 bg-slate-900/90 border border-slate-800 rounded-2xl p-6 space-y-4 shadow-xl">
          <h3 className="font-bold text-slate-200 text-sm flex items-center gap-2 pb-3 border-b border-slate-800">
            <DollarSign className="w-4 h-4 text-cyan-400" />
            <span>محاكاة طلب دفع Sandbox جديد</span>
          </h3>

          <form onSubmit={handleTestSubmit} className="space-y-3 text-xs">
            <div>
              <label className="block text-slate-400 font-medium mb-1">المبلغ (USD)</label>
              <input
                type="number"
                required
                min={1}
                value={testAmount}
                onChange={e => setTestTestAmount(Number(e.target.value))}
                className="w-full bg-slate-950 border border-slate-800 rounded-lg p-2.5 text-slate-200 font-mono focus:outline-none focus:border-cyan-500"
              />
            </div>

            <div>
              <label className="block text-slate-400 font-medium mb-1">وصف المنتج أو الخدمة</label>
              <input
                type="text"
                required
                value={testDesc}
                onChange={e => setTestDesc(e.target.value)}
                className="w-full bg-slate-950 border border-slate-800 rounded-lg p-2.5 text-slate-200 focus:outline-none focus:border-cyan-500"
              />
            </div>

            <button
              type="submit"
              disabled={isProcessing}
              className="w-full py-2.5 rounded-xl bg-amber-500 text-slate-950 font-bold hover:bg-amber-400 transition-all shadow-md shadow-amber-500/20 flex items-center justify-center gap-2"
            >
              <CreditCard className="w-4 h-4" />
              <span>{isProcessing ? 'جاري إنشاء وتأكيد المعاملة...' : 'تنفيذ عملية شراء في Sandbox'}</span>
            </button>
          </form>
        </div>

        {/* Transactions List */}
        <div className="lg:col-span-2 bg-slate-900/90 border border-slate-800 rounded-2xl p-6 space-y-4 shadow-xl">
          <div className="flex items-center justify-between pb-3 border-b border-slate-800">
            <h3 className="font-bold text-slate-200 text-sm flex items-center gap-2">
              <CreditCard className="w-4 h-4 text-cyan-400" />
              <span>سجل المعاملات المالية (PayPal Transactions)</span>
            </h3>
            <span className="text-xs text-slate-500 font-mono">{transactions.length} معاملة</span>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-start text-xs">
              <thead className="bg-slate-950 text-slate-400 font-semibold border-b border-slate-800">
                <tr>
                  <th className="p-3 text-start">رقم المعاملة (TX ID)</th>
                  <th className="p-3 text-start">الوصف والمنتج</th>
                  <th className="p-3 text-start">المبلغ</th>
                  <th className="p-3 text-start">الحالة</th>
                  <th className="p-3 text-start">التاريخ</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/60 bg-slate-950/30 font-mono">
                {transactions.map((tx) => (
                  <tr key={tx.id} className="hover:bg-slate-900/40 transition-colors">
                    <td className="p-3 text-cyan-400 font-bold">{tx.externalTransactionId}</td>
                    <td className="p-3 text-slate-300 font-sans">{tx.itemDescription}</td>
                    <td className="p-3 text-slate-100 font-bold">${tx.amount.toFixed(2)} {tx.currency}</td>
                    <td className="p-3">
                      <span className={`px-2 py-0.5 rounded text-[10px] font-semibold ${
                        tx.status === 'completed'
                          ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20'
                          : 'bg-amber-500/10 text-amber-400 border border-amber-500/20'
                      }`}>
                        {tx.status}
                      </span>
                    </td>
                    <td className="p-3 text-slate-500 text-[11px]">{new Date(tx.createdAt).toLocaleDateString()}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
};
