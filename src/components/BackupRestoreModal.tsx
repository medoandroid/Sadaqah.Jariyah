import React, { useState } from 'react';
import {
  X,
  Download,
  Upload,
  HardDrive,
  CheckCircle2,
  AlertCircle,
  FileJson,
  ShieldCheck,
  RefreshCw,
  Trash2
} from 'lucide-react';
import { storageService } from '../services/storageService';

interface BackupRestoreModalProps {
  isOpen: boolean;
  onClose: () => void;
  onDataRestored?: () => void;
}

export const BackupRestoreModal: React.FC<BackupRestoreModalProps> = ({
  isOpen,
  onClose,
  onDataRestored,
}) => {
  const [statusMsg, setStatusMsg] = useState<{ text: string; type: 'success' | 'error' } | null>(null);
  const [isProcessing, setIsProcessing] = useState<boolean>(false);
  const storageUsageKB = storageService.getStorageUsageKB();

  if (!isOpen) return null;

  const handleExportBackup = () => {
    try {
      const backup = storageService.exportBackup();
      const jsonString = `data:text/json;charset=utf-8,${encodeURIComponent(JSON.stringify(backup, null, 2))}`;
      const downloadAnchor = document.createElement('a');
      const dateStr = new Date().toISOString().slice(0, 10);
      downloadAnchor.setAttribute('href', jsonString);
      downloadAnchor.setAttribute('download', `sadaqah-jariyah-backup-${dateStr}.json`);
      document.body.appendChild(downloadAnchor);
      downloadAnchor.click();
      downloadAnchor.remove();

      setStatusMsg({ text: 'تم تصدير ملف النسخة الاحتياطية بنجاح إلى جهازك', type: 'success' });
      setTimeout(() => setStatusMsg(null), 4000);
    } catch (e) {
      setStatusMsg({ text: 'تعذر تصدير النسخة الاحتياطية', type: 'error' });
    }
  };

  const handleFileImport = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setIsProcessing(true);
    const reader = new FileReader();
    reader.onload = (event) => {
      try {
        const raw = event.target?.result as string;
        const parsed = JSON.parse(raw);
        const res = storageService.restoreBackup(parsed);

        if (res.success) {
          setStatusMsg({ text: res.message, type: 'success' });
          if (onDataRestored) onDataRestored();
        } else {
          setStatusMsg({ text: res.message, type: 'error' });
        }
      } catch (err) {
        setStatusMsg({ text: 'ملف غير صالح أو تعذر قراءة بياناته', type: 'error' });
      } finally {
        setIsProcessing(false);
      }
    };
    reader.readAsText(file);
    e.target.value = '';
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-5 bg-stone-950/80 backdrop-blur-md animate-in fade-in duration-200 select-none">
      <div className="w-full max-w-lg bg-white dark:bg-stone-900 rounded-3xl p-5 sm:p-7 text-right shadow-2xl border border-stone-200 dark:border-stone-800 space-y-6 max-h-[90vh] overflow-y-auto">
        
        {/* Header */}
        <div className="flex items-center justify-between pb-3 border-b border-stone-100 dark:border-stone-800">
          <div className="flex items-center gap-2.5">
            <div className="w-10 h-10 rounded-2xl bg-amber-500/20 text-amber-700 dark:text-amber-400 flex items-center justify-center shadow-xs">
              <FileJson className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-amiri text-2xl font-bold text-stone-900 dark:text-stone-100">
                النسخ الاحتياطي واستعادة البيانات
              </h3>
              <p className="text-xs text-stone-500 font-sans">
                حفظ واسترجاع إهداءاتك وأدعيتك وعلاماتك وتقدمك محلياً بأمان
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-1.5 text-stone-400 hover:text-stone-700 dark:hover:text-stone-200 rounded-lg cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Status Toast */}
        {statusMsg && (
          <div className={`p-3 rounded-2xl border text-xs flex items-center gap-2 animate-in fade-in ${
            statusMsg.type === 'success'
              ? 'bg-emerald-50 dark:bg-emerald-950/40 border-emerald-400 text-emerald-900 dark:text-emerald-200'
              : 'bg-rose-50 dark:bg-rose-950/40 border-rose-400 text-rose-900 dark:text-rose-200'
          }`}>
            {statusMsg.type === 'success' ? <CheckCircle2 className="w-4 h-4 shrink-0" /> : <AlertCircle className="w-4 h-4 shrink-0" />}
            <span>{statusMsg.text}</span>
          </div>
        )}

        {/* Storage overview */}
        <div className="p-4 rounded-2xl bg-stone-50 dark:bg-stone-850 border border-stone-200 dark:border-stone-800 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <HardDrive className="w-4 h-4 text-amber-600 dark:text-amber-400" />
            <div>
              <span className="text-xs font-bold text-stone-800 dark:text-stone-200 block">
                المساحة المستخدمة لبياناتك المحلية
              </span>
              <span className="text-[11px] text-stone-500">
                يشمل العلامات، الختمات، الأدعية الخاصة، وسجل الإهداءات
              </span>
            </div>
          </div>

          <span className="font-mono text-xs font-bold px-2.5 py-1 rounded-xl bg-amber-100 dark:bg-stone-800 text-amber-900 dark:text-amber-300">
            ~ {storageUsageKB} كيلوبايت
          </span>
        </div>

        {/* Actions Grid */}
        <div className="space-y-3">
          
          {/* Export Action Card */}
          <div className="p-4 rounded-2xl border border-stone-200 dark:border-stone-800 hover:border-amber-400 transition-colors flex items-center justify-between gap-4">
            <div className="space-y-1">
              <span className="text-xs font-bold text-stone-900 dark:text-stone-100 block">
                تصدير نسخة احتياطية (Export)
              </span>
              <p className="text-[11px] text-stone-500 leading-relaxed font-sans">
                تحميل ملف JSON كامل يحتوي على كافة بياناتك لحفظه على هاتفك أو حاسوبك.
              </p>
            </div>

            <button
              onClick={handleExportBackup}
              className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-amber-800 hover:bg-amber-900 text-white text-xs font-bold transition shadow-xs cursor-pointer shrink-0"
            >
              <Download className="w-3.5 h-3.5 text-amber-200" />
              <span>تصدير الآن</span>
            </button>
          </div>

          {/* Import Action Card */}
          <div className="p-4 rounded-2xl border border-stone-200 dark:border-stone-800 hover:border-amber-400 transition-colors flex items-center justify-between gap-4">
            <div className="space-y-1">
              <span className="text-xs font-bold text-stone-900 dark:text-stone-100 block">
                استعادة نسخة احتياطية (Restore)
              </span>
              <p className="text-[11px] text-stone-500 leading-relaxed font-sans">
                استرجاع ملف نسخة احتياطية سابق تم حفظه من هذا التطبيق ودمجه بأمان.
              </p>
            </div>

            <label className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-stone-100 dark:bg-stone-800 hover:bg-stone-200 dark:hover:bg-stone-750 text-stone-800 dark:text-stone-200 text-xs font-bold border border-stone-300 dark:border-stone-700 transition shadow-xs cursor-pointer shrink-0">
              <Upload className="w-3.5 h-3.5 text-amber-600 dark:text-amber-400" />
              <span>{isProcessing ? 'جاري الفحص...' : 'اختيار ملف'}</span>
              <input
                type="file"
                accept=".json"
                onChange={handleFileImport}
                disabled={isProcessing}
                className="hidden"
              />
            </label>
          </div>

        </div>

        {/* Security & Validation Notice */}
        <div className="p-3 rounded-2xl bg-amber-50/70 dark:bg-amber-950/20 border border-amber-200 dark:border-amber-800/40 text-[11px] text-stone-600 dark:text-stone-300 flex items-start gap-2 leading-relaxed">
          <ShieldCheck className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
          <span>
            تخضع كافة البيانات المستوردة لفحص الأمان وتطهير المدخلات لمنع أي نصوص ضارة مع التأكد من سلامة البنية البرمجية.
          </span>
        </div>

      </div>
    </div>
  );
};
