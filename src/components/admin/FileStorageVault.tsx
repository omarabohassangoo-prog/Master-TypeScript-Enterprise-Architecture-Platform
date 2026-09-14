import React, { useState } from 'react';
import {
  FolderLock, Upload, Download, Trash2, FileText,
  CheckCircle2, ShieldAlert, HardDrive, Eye, Lock
} from 'lucide-react';
import { FileRecord } from '../../types';

interface FileStorageVaultProps {
  files: FileRecord[];
  onUploadFile: (data: any) => Promise<void>;
  onDeleteFile: (id: string) => Promise<void>;
  lang: 'ar' | 'en';
}

export const FileStorageVault: React.FC<FileStorageVaultProps> = ({
  files,
  onUploadFile,
  onDeleteFile,
  lang,
}) => {
  const [showUploadModal, setShowUploadModal] = useState(false);
  const [fileName, setFileName] = useState('');
  const [mimeType, setMimeType] = useState('application/pdf');
  const [fileSizeKB, setFileSizeKB] = useState(512);
  const [visibility, setVisibility] = useState<'public' | 'private'>('public');

  const handleUploadSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    await onUploadFile({
      originalName: fileName || 'enterprise-doc.pdf',
      mimeType,
      size: fileSizeKB * 1024,
      visibility,
    });
    setShowUploadModal(false);
    setFileName('');
  };

  const formatSize = (bytes: number) => {
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
    return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-slate-900/90 border border-slate-800 rounded-2xl p-6 flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold text-slate-100 flex items-center gap-2">
            <FolderLock className="w-5 h-5 text-cyan-400" />
            <span>{lang === 'ar' ? 'خزينة الملفات والتخزين السحابي (Secure File Vault)' : 'File Storage Vault'}</span>
          </h2>
          <p className="text-xs text-slate-400 mt-1">
            {lang === 'ar'
              ? 'تخزين آمن، فحص نوع MIME والامتدادات، التحقق من التجزئة SHA-256، ومنع هجمات Path Traversal'
              : 'Secure file storage with MIME validation, SHA-256 integrity, and path traversal protection'}
          </p>
        </div>

        <button
          onClick={() => setShowUploadModal(true)}
          className="px-4 py-2.5 rounded-xl bg-cyan-500 text-slate-950 font-bold text-xs hover:bg-cyan-400 transition-all flex items-center gap-2 shadow-lg shadow-cyan-500/20 w-fit"
        >
          <Upload className="w-4 h-4" />
          <span>{lang === 'ar' ? 'رفع ملف جديد' : 'Upload Document'}</span>
        </button>
      </div>

      {/* Files List */}
      <div className="bg-slate-900/90 border border-slate-800 rounded-2xl overflow-hidden shadow-xl">
        <div className="overflow-x-auto">
          <table className="w-full text-start text-xs">
            <thead className="bg-slate-950 text-slate-400 font-semibold border-b border-slate-800">
              <tr>
                <th className="p-4 text-start">{lang === 'ar' ? 'اسم الملف والمستند' : 'File Name'}</th>
                <th className="p-4 text-start">{lang === 'ar' ? 'النوع (MIME)' : 'MIME Type'}</th>
                <th className="p-4 text-start">{lang === 'ar' ? 'الحجم' : 'Size'}</th>
                <th className="p-4 text-start">{lang === 'ar' ? 'الرؤية والخصوصية' : 'Visibility'}</th>
                <th className="p-4 text-start">{lang === 'ar' ? 'التحميلات' : 'Downloads'}</th>
                <th className="p-4 text-start">{lang === 'ar' ? 'تجزئة الأمان (Hash)' : 'SHA-256 Hash'}</th>
                <th className="p-4 text-center">{lang === 'ar' ? 'الإجراءات' : 'Actions'}</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/60 bg-slate-950/30">
              {files.map((file) => (
                <tr key={file.id} className="hover:bg-slate-900/40 transition-colors">
                  <td className="p-4">
                    <div className="flex items-center gap-3">
                      <div className="p-2 rounded-lg bg-cyan-500/10 text-cyan-400 border border-cyan-500/20">
                        <FileText className="w-4 h-4" />
                      </div>
                      <div>
                        <p className="font-bold text-slate-200">{file.originalName}</p>
                        <p className="text-[10px] text-slate-500 font-mono">{file.path}</p>
                      </div>
                    </div>
                  </td>

                  <td className="p-4 font-mono text-[11px] text-slate-300">
                    {file.mimeType}
                  </td>

                  <td className="p-4 font-mono text-slate-300">
                    {formatSize(file.size)}
                  </td>

                  <td className="p-4">
                    <span className={`inline-flex items-center gap-1 text-[10px] font-semibold px-2 py-0.5 rounded-full border ${
                      file.visibility === 'public'
                        ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20'
                        : 'bg-amber-500/10 text-amber-400 border-amber-500/20'
                    }`}>
                      {file.visibility === 'public' ? <Eye className="w-3 h-3" /> : <Lock className="w-3 h-3" />}
                      <span>{file.visibility}</span>
                    </span>
                  </td>

                  <td className="p-4 font-mono text-slate-400">
                    {file.downloadsCount}
                  </td>

                  <td className="p-4 font-mono text-[10px] text-slate-500 max-w-[150px] truncate" title={file.hash}>
                    {file.hash}
                  </td>

                  <td className="p-4">
                    <div className="flex items-center justify-center gap-1.5">
                      <button
                        title="تحميل الملف"
                        onClick={() => alert(`جاري تنزيل الملف الآمن: ${file.originalName}`)}
                        className="p-1.5 rounded-lg bg-slate-900 border border-slate-800 text-slate-400 hover:text-cyan-400 transition-colors"
                      >
                        <Download className="w-3.5 h-3.5" />
                      </button>
                      <button
                        title="حذف الملف"
                        onClick={() => onDeleteFile(file.id)}
                        className="p-1.5 rounded-lg bg-slate-900 border border-slate-800 text-slate-400 hover:text-rose-400 transition-colors"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Upload File Modal */}
      {showUploadModal && (
        <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 w-full max-w-md space-y-4 shadow-2xl">
            <div className="flex items-center justify-between pb-3 border-b border-slate-800">
              <h3 className="text-base font-bold text-slate-100 flex items-center gap-2">
                <Upload className="w-5 h-5 text-cyan-400" />
                <span>رفع مستند إلى الخزينة الآمنة</span>
              </h3>
              <button onClick={() => setShowUploadModal(false)} className="text-slate-400 hover:text-slate-200">
                ✕
              </button>
            </div>

            <form onSubmit={handleUploadSubmit} className="space-y-4 text-xs">
              <div>
                <label className="block text-slate-300 font-medium mb-1">اسم الملف</label>
                <input
                  type="text"
                  required
                  value={fileName}
                  onChange={e => setFileName(e.target.value)}
                  placeholder="e.g. system-architecture-report.pdf"
                  className="w-full bg-slate-950 border border-slate-800 rounded-lg p-2.5 text-slate-200 focus:outline-none focus:border-cyan-500 font-mono"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-300 font-medium mb-1">نوع الملف (MIME)</label>
                  <select
                    value={mimeType}
                    onChange={e => setMimeType(e.target.value)}
                    className="w-full bg-slate-950 border border-slate-800 rounded-lg p-2.5 text-slate-200 focus:outline-none focus:border-cyan-500"
                  >
                    <option value="application/pdf">PDF (.pdf)</option>
                    <option value="application/json">JSON (.json)</option>
                    <option value="image/png">PNG Image (.png)</option>
                    <option value="image/jpeg">JPEG Image (.jpg)</option>
                    <option value="text/plain">Text (.txt)</option>
                  </select>
                </div>
                <div>
                  <label className="block text-slate-300 font-medium mb-1">الحجم (KB)</label>
                  <input
                    type="number"
                    value={fileSizeKB}
                    onChange={e => setFileSizeKB(Number(e.target.value))}
                    className="w-full bg-slate-950 border border-slate-800 rounded-lg p-2.5 text-slate-200 focus:outline-none focus:border-cyan-500 font-mono"
                  />
                </div>
              </div>

              <div>
                <label className="block text-slate-300 font-medium mb-1">مستوى الرؤية</label>
                <select
                  value={visibility}
                  onChange={e => setVisibility(e.target.value as any)}
                  className="w-full bg-slate-950 border border-slate-800 rounded-lg p-2.5 text-slate-200 focus:outline-none focus:border-cyan-500"
                >
                  <option value="public">عام (Public - يمكن للجميع التحميل)</option>
                  <option value="private">خاص (Private - لصاحب الملف والمدير فقط)</option>
                </select>
              </div>

              <div className="flex items-center justify-end gap-2 pt-3 border-t border-slate-800">
                <button
                  type="button"
                  onClick={() => setShowUploadModal(false)}
                  className="px-4 py-2 rounded-xl bg-slate-800 text-slate-300 hover:bg-slate-700"
                >
                  إلغاء
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 rounded-xl bg-cyan-500 text-slate-950 font-bold hover:bg-cyan-400 shadow-md shadow-cyan-500/20"
                >
                  تأكيد الرفع
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
