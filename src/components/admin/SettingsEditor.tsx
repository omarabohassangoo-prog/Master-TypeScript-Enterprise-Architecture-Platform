import React, { useState } from 'react';
import { Sliders, Save, CheckCircle2, Shield, Globe, HardDrive, Mail, CreditCard, Lock } from 'lucide-react';
import { Setting } from '../../types';

interface SettingsEditorProps {
  settings: Setting[];
  onSaveSetting: (key: string, value: any) => Promise<void>;
  lang: 'ar' | 'en';
}

export const SettingsEditor: React.FC<SettingsEditorProps> = ({
  settings = [],
  onSaveSetting,
  lang,
}) => {
  const [activeGroup, setActiveGroup] = useState<string>('all');
  const [editedValues, setEditedValues] = useState<Record<string, any>>({});
  const [savedKey, setSavedKey] = useState<string | null>(null);

  const groups = [
    { id: 'all', label: 'الكل (All)', icon: Sliders },
    { id: 'general', label: 'العامة (General)', icon: Globe },
    { id: 'security', label: 'الأمان (Security)', icon: Lock },
    { id: 'storage', label: 'التخزين (Storage)', icon: HardDrive },
    { id: 'email', label: 'البريد (Email)', icon: Mail },
    { id: 'paypal', label: 'PayPal', icon: CreditCard },
  ];

  const safeSettings = settings || [];
  const filteredSettings = activeGroup === 'all'
    ? safeSettings
    : safeSettings.filter(s => s && s.group === activeGroup);

  const handleValueChange = (key: string, val: any) => {
    setEditedValues(prev => ({ ...prev, [key]: val }));
  };

  const handleSave = async (setting: Setting) => {
    const val = editedValues[setting.key] !== undefined ? editedValues[setting.key] : setting.value;
    await onSaveSetting(setting.key, val);
    setSavedKey(setting.key);
    setTimeout(() => setSavedKey(null), 2000);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-slate-900/90 border border-slate-800 rounded-2xl p-6 flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold text-slate-100 flex items-center gap-2">
            <Sliders className="w-5 h-5 text-cyan-400" />
            <span>{lang === 'ar' ? 'إعدادات وتكوين النظام (System Settings & JSON Config)' : 'System Settings'}</span>
          </h2>
          <p className="text-xs text-slate-400 mt-1">
            {lang === 'ar'
              ? 'إدارة إعدادات الأمان، حصص التخزين، وضع الصيانة، ومفاتيح البوابات الخارجية'
              : 'Configure security limits, upload quotas, maintenance mode, and gateways'}
          </p>
        </div>
      </div>

      {/* Group Tabs */}
      <div className="flex items-center gap-2 overflow-x-auto pb-2 scrollbar-none">
        {groups.map((grp) => {
          const Icon = grp.icon;
          return (
            <button
              key={grp.id}
              onClick={() => setActiveGroup(grp.id)}
              className={`px-3.5 py-2 rounded-xl text-xs font-medium shrink-0 flex items-center gap-2 transition-all ${
                activeGroup === grp.id
                  ? 'bg-cyan-500 text-slate-950 font-bold shadow'
                  : 'bg-slate-900 border border-slate-800 text-slate-400 hover:text-slate-200'
              }`}
            >
              <Icon className="w-3.5 h-3.5" />
              <span>{grp.label}</span>
            </button>
          );
        })}
      </div>

      {/* Settings List */}
      <div className="bg-slate-900/90 border border-slate-800 rounded-2xl divide-y divide-slate-800/80 overflow-hidden shadow-xl">
        {filteredSettings.map((s) => {
          const currentValue = editedValues[s.key] !== undefined ? editedValues[s.key] : s.value;
          const isSaved = savedKey === s.key;

          return (
            <div key={s.id} className="p-5 flex flex-col md:flex-row md:items-center justify-between gap-4 hover:bg-slate-950/40 transition-colors">
              <div className="space-y-1 max-w-xl">
                <div className="flex items-center gap-2">
                  <span className="font-bold text-slate-200 text-sm">{s.label || s.key}</span>
                  <span className="font-mono text-[10px] px-2 py-0.5 rounded bg-slate-950 border border-slate-800 text-cyan-400">
                    {s.key}
                  </span>
                </div>
                <p className="text-xs text-slate-400">{s.description || 'إعداد نظام أساسي'}</p>
              </div>

              <div className="flex items-center gap-3">
                {s.type === 'boolean' ? (
                  <label className="relative inline-flex items-center cursor-pointer">
                    <input
                      type="checkbox"
                      checked={!!currentValue}
                      onChange={(e) => handleValueChange(s.key, e.target.checked)}
                      className="sr-only peer"
                    />
                    <div className="w-11 h-6 bg-slate-800 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full rtl:peer-checked:after:-translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:start-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-cyan-500"></div>
                  </label>
                ) : s.type === 'number' ? (
                  <input
                    type="number"
                    value={currentValue}
                    onChange={(e) => handleValueChange(s.key, Number(e.target.value))}
                    className="w-32 bg-slate-950 border border-slate-800 rounded-lg p-2 text-xs text-slate-200 font-mono focus:outline-none focus:border-cyan-500"
                  />
                ) : (
                  <input
                    type="text"
                    value={currentValue}
                    onChange={(e) => handleValueChange(s.key, e.target.value)}
                    className="w-64 bg-slate-950 border border-slate-800 rounded-lg p-2 text-xs text-slate-200 focus:outline-none focus:border-cyan-500"
                  />
                )}

                <button
                  onClick={() => handleSave(s)}
                  className={`px-3 py-2 rounded-lg text-xs font-bold transition-all flex items-center gap-1.5 ${
                    isSaved
                      ? 'bg-emerald-500 text-slate-950 shadow-md shadow-emerald-500/20'
                      : 'bg-slate-800 text-slate-200 hover:bg-cyan-500 hover:text-slate-950'
                  }`}
                >
                  {isSaved ? <CheckCircle2 className="w-3.5 h-3.5" /> : <Save className="w-3.5 h-3.5" />}
                  <span>{isSaved ? 'تم الحفظ' : 'حفظ'}</span>
                </button>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
