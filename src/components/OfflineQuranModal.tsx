import React, { useState, useEffect, useRef } from 'react';
import {
  Download,
  Wifi,
  WifiOff,
  CheckCircle2,
  X,
  Trash2,
  Sparkles,
  HardDrive,
  RefreshCw,
  AlertCircle,
  BookOpen,
  Moon,
  Heart,
  Disc,
  Check,
  ShieldCheck,
  Smartphone
} from 'lucide-react';
import { offlineQuranService } from '../services/offlineQuranService';
import { offlineSyncService } from '../services/offlineSyncService';
import { useOfflineSync } from '../hooks/useOfflineSync';
import { usePWAInstall } from '../hooks/usePWAInstall';

interface OfflineQuranModalProps {
  isOpen: boolean;
  onClose: () => void;
  onOfflineStatusChange?: (isReady: boolean) => void;
}

export const OfflineQuranModal: React.FC<OfflineQuranModalProps> = ({
  isOpen,
  onClose,
  onOfflineStatusChange,
}) => {
  const {
    isOnline,
    downloadedSurahsCount,
    isFullyOfflineReady,
    lastSyncTimestamp,
    isSyncing,
    triggerSync,
  } = useOfflineSync();

  const { isInstallable, isInstalled, install, isIOS } = usePWAInstall();

  const [isDownloading, setIsDownloading] = useState<boolean>(false);
  const [currentSurahName, setCurrentSurahName] = useState<string>('');
  const [downloadProgress, setDownloadProgress] = useState<number>(0);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [syncSuccessMsg, setSyncSuccessMsg] = useState<string | null>(null);
  const abortControllerRef = useRef<AbortController | null>(null);

  const handleStartDownload = async () => {
    setIsDownloading(true);
    setErrorMsg(null);
    abortControllerRef.current = new AbortController();

    try {
      const success = await offlineQuranService.downloadAllSurahs(
        (completed, total, name) => {
          setCurrentSurahName(name);
          setDownloadProgress(Math.round((completed / total) * 100));
        },
        abortControllerRef.current.signal
      );

      if (success) {
        await offlineSyncService.refreshStatus();
        if (onOfflineStatusChange) onOfflineStatusChange(true);
      }
    } catch (err: any) {
      if (!abortControllerRef.current?.signal.aborted) {
        setErrorMsg('حدث خطأ أثناء التحميل، يرجى التأكد من اتصال الإنترنت والمحاولة مجدداً');
      }
    } finally {
      setIsDownloading(false);
    }
  };

  const handleCancelDownload = () => {
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
    }
    setIsDownloading(false);
    offlineSyncService.refreshStatus();
  };

  const handleClear = async () => {
    if (window.confirm('هل أنت متأكد من مسح بيانات المصحف المحفوظة بدون إنترنت؟')) {
      await offlineQuranService.clearOfflineData();
      await offlineSyncService.refreshStatus();
      if (onOfflineStatusChange) onOfflineStatusChange(false);
    }
  };

  const handleManualSync = async () => {
    const success = await triggerSync();
    if (success) {
      setSyncSuccessMsg('تمت مزامنة جميع البيانات بنجاح');
      setTimeout(() => setSyncSuccessMsg(null), 3000);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-5 bg-stone-950/80 backdrop-blur-md animate-in fade-in duration-200 select-none">
      <div className="w-full max-w-xl bg-white dark:bg-stone-900 rounded-3xl p-5 sm:p-7 text-right shadow-2xl border border-stone-200 dark:border-stone-800 space-y-6 max-h-[90vh] overflow-y-auto">
        
        {/* Header */}
        <div className="flex items-center justify-between pb-3 border-b border-stone-100 dark:border-stone-800">
          <div className="flex items-center gap-2.5">
            <div className="w-10 h-10 rounded-2xl bg-gradient-to-br from-amber-500/20 to-amber-700/10 border border-amber-600/30 text-amber-600 dark:text-amber-400 flex items-center justify-center shadow-xs">
              <HardDrive className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-amiri text-2xl font-bold text-stone-900 dark:text-stone-100">
                مركز العمل بدون إنترنت (Offline Center)
              </h3>
              <p className="text-xs text-stone-500">
                إدارة التخزين المحلي، المصحف الشريف، والمزامنة التلقائية
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

        {/* Connectivity Status Banner */}
        <div className={`p-4 rounded-2xl border flex items-center justify-between gap-3 ${
          isOnline
            ? 'bg-emerald-50/70 dark:bg-emerald-950/30 border-emerald-300 dark:border-emerald-700/50'
            : 'bg-amber-50/70 dark:bg-amber-950/30 border-amber-300 dark:border-amber-700/50'
        }`}>
          <div className="flex items-center gap-2.5">
            <div className={`w-8 h-8 rounded-xl flex items-center justify-center ${
              isOnline ? 'bg-emerald-500/20 text-emerald-700 dark:text-emerald-300' : 'bg-amber-500/20 text-amber-700 dark:text-amber-300'
            }`}>
              {isOnline ? <Wifi className="w-4 h-4" /> : <WifiOff className="w-4 h-4" />}
            </div>
            <div>
              <div className="text-xs font-bold text-stone-900 dark:text-stone-100">
                {isOnline ? 'متصل بالإنترنت (Online)' : 'يعمل بدون إنترنت (Offline)'}
              </div>
              <div className="text-[10px] text-stone-500">
                {isOnline ? 'المزامنة التلقائية والتحديثات نشطة' : 'يتم استخدام البيانات والملفات المخزنة محلياً'}
              </div>
            </div>
          </div>

          {isOnline && (
            <button
              onClick={handleManualSync}
              disabled={isSyncing}
              className="flex items-center gap-1 px-3 py-1.5 rounded-xl bg-white dark:bg-stone-800 text-stone-700 dark:text-stone-300 hover:text-amber-800 text-xs font-semibold border border-stone-200 dark:border-stone-700 transition cursor-pointer shadow-xs disabled:opacity-50"
            >
              <RefreshCw className={`w-3.5 h-3.5 ${isSyncing ? 'animate-spin text-amber-600' : ''}`} />
              <span>{isSyncing ? 'جاري المزامنة...' : 'مزامنة الآن'}</span>
            </button>
          )}
        </div>

        {syncSuccessMsg && (
          <div className="p-2.5 rounded-xl bg-emerald-100 dark:bg-emerald-950/60 border border-emerald-400 text-emerald-900 dark:text-emerald-200 text-xs flex items-center gap-2 animate-in fade-in">
            <CheckCircle2 className="w-4 h-4" />
            <span>{syncSuccessMsg}</span>
          </div>
        )}

        {/* Feature Availability Grid */}
        <div className="space-y-2">
          <h4 className="font-amiri text-base font-bold text-stone-900 dark:text-stone-100">
            حالة توفر أقسام المنصة بدون إنترنت
          </h4>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
            {/* Quran Status */}
            <div className="p-3 rounded-2xl bg-stone-50 dark:bg-stone-850 border border-stone-200 dark:border-stone-800 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <BookOpen className="w-4 h-4 text-amber-600 dark:text-amber-400" />
                <span className="text-xs font-bold text-stone-800 dark:text-stone-200">المصحف الشريف</span>
              </div>
              <span className={`text-[11px] font-bold px-2 py-0.5 rounded-lg ${
                isFullyOfflineReady
                  ? 'bg-emerald-100 dark:bg-emerald-950 text-emerald-800 dark:text-emerald-300'
                  : 'bg-amber-100 dark:bg-amber-950 text-amber-800 dark:text-amber-300'
              }`}>
                {downloadedSurahsCount} / 114 سورة
              </span>
            </div>

            {/* Adhkar Status */}
            <div className="p-3 rounded-2xl bg-stone-50 dark:bg-stone-850 border border-stone-200 dark:border-stone-800 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Moon className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
                <span className="text-xs font-bold text-stone-800 dark:text-stone-200">الأذكار وحصن المسلم</span>
              </div>
              <span className="text-[11px] font-bold px-2 py-0.5 rounded-lg bg-emerald-100 dark:bg-emerald-950 text-emerald-800 dark:text-emerald-300 flex items-center gap-1">
                <Check className="w-3 h-3" /> متاح 100%
              </span>
            </div>

            {/* Duas Status */}
            <div className="p-3 rounded-2xl bg-stone-50 dark:bg-stone-850 border border-stone-200 dark:border-stone-800 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Heart className="w-4 h-4 text-rose-600 dark:text-rose-400" />
                <span className="text-xs font-bold text-stone-800 dark:text-stone-200">الأدعية وأسماء الله</span>
              </div>
              <span className="text-[11px] font-bold px-2 py-0.5 rounded-lg bg-emerald-100 dark:bg-emerald-950 text-emerald-800 dark:text-emerald-300 flex items-center gap-1">
                <Check className="w-3 h-3" /> متاح 100%
              </span>
            </div>

            {/* Tasbeeh & Khatmah Status */}
            <div className="p-3 rounded-2xl bg-stone-50 dark:bg-stone-850 border border-stone-200 dark:border-stone-800 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Disc className="w-4 h-4 text-indigo-600 dark:text-indigo-400" />
                <span className="text-xs font-bold text-stone-800 dark:text-stone-200">السبحة والختمات والورد</span>
              </div>
              <span className="text-[11px] font-bold px-2 py-0.5 rounded-lg bg-emerald-100 dark:bg-emerald-950 text-emerald-800 dark:text-emerald-300 flex items-center gap-1">
                <Check className="w-3 h-3" /> حفظ ومزامنة فورية
              </span>
            </div>
          </div>
        </div>

        {/* Quran Offline Storage Box */}
        <div className="p-4 rounded-2xl bg-stone-50 dark:bg-stone-850 border border-stone-200 dark:border-stone-800 space-y-3">
          <div className="flex items-center justify-between">
            <span className="font-amiri text-lg font-bold text-stone-900 dark:text-stone-100">
              بيانات المصحف الشريف بالرسم العثماني
            </span>
            <span className="font-mono text-xs font-bold text-stone-500">
              {downloadedSurahsCount} / 114
            </span>
          </div>

          <p className="text-xs text-stone-600 dark:text-stone-300 leading-relaxed font-sans">
            تخزين نص القرآن الكريم كاملاً بجميع سوره وآياته في قاعدة بيانات متصفحك الآمنة (IndexedDB) لسرعة تصفح فائقة وقراءة كاملة بدون اتصال بالشبكة.
          </p>

          {/* Progress Bar during download */}
          {isDownloading && (
            <div className="space-y-1.5 pt-1">
              <div className="flex items-center justify-between text-xs font-mono text-stone-600 dark:text-stone-300">
                <span className="text-[11px] font-sans truncate">جاري تخزين: {currentSurahName}</span>
                <span>{downloadProgress}%</span>
              </div>
              <div className="w-full bg-stone-200 dark:bg-stone-700 h-2.5 rounded-full overflow-hidden">
                <div
                  className="bg-amber-600 h-full transition-all duration-200 rounded-full"
                  style={{ width: `${downloadProgress}%` }}
                />
              </div>
            </div>
          )}

          {errorMsg && (
            <div className="p-2.5 rounded-xl bg-rose-50 dark:bg-rose-950/40 border border-rose-300 text-rose-800 dark:text-rose-200 text-xs flex items-center gap-2">
              <AlertCircle className="w-4 h-4 shrink-0" />
              <span>{errorMsg}</span>
            </div>
          )}

          {/* Action Buttons */}
          <div className="pt-1">
            {isDownloading ? (
              <button
                onClick={handleCancelDownload}
                className="w-full py-2.5 rounded-xl bg-stone-200 dark:bg-stone-800 hover:bg-stone-300 text-stone-800 dark:text-stone-200 text-xs font-bold transition-all cursor-pointer"
              >
                إيقاف التحميل مؤقتاً
              </button>
            ) : isFullyOfflineReady ? (
              <div className="flex items-center gap-2">
                <button
                  onClick={handleStartDownload}
                  className="flex-1 py-2.5 rounded-xl bg-amber-800 hover:bg-amber-900 text-white text-xs font-bold transition-all cursor-pointer flex items-center justify-center gap-2 shadow-xs"
                >
                  <RefreshCw className="w-3.5 h-3.5" />
                  <span>تحديث وإعادة التحقق من البيانات</span>
                </button>

                <button
                  onClick={handleClear}
                  className="p-2.5 rounded-xl text-rose-600 hover:bg-rose-50 dark:hover:bg-stone-800 border border-rose-200 dark:border-rose-900/50 transition-colors cursor-pointer"
                  title="مسح البيانات المخزنة محلياً"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            ) : (
              <button
                onClick={handleStartDownload}
                className="w-full py-3 rounded-2xl bg-amber-800 hover:bg-amber-900 text-white font-amiri text-base font-bold transition-all cursor-pointer flex items-center justify-center gap-2 shadow-md hover:shadow-lg active:scale-98"
              >
                <Download className="w-4 h-4 text-amber-300" />
                <span>تحميل كامل المصحف للعمل بدون إنترنت الآن</span>
              </button>
            )}
          </div>
        </div>

        {/* PWA App Install Section */}
        {isInstallable && (
          <div className="p-4 rounded-2xl bg-gradient-to-r from-blue-50 to-indigo-50 dark:from-stone-800/80 dark:to-indigo-950/30 border border-blue-200 dark:border-blue-900/50 flex items-center justify-between gap-3">
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-xl bg-blue-500/20 text-blue-600 dark:text-blue-400 flex items-center justify-center shrink-0">
                <Smartphone className="w-4 h-4" />
              </div>
              <div>
                <div className="text-xs font-bold text-stone-900 dark:text-stone-100">
                  تثبيت التطبيق على جهازك (PWA)
                </div>
                <div className="text-[10px] text-stone-500">
                  تشغيل التطبيق كبرنامج مستقل بدون شريط المتصفح
                </div>
              </div>
            </div>

            <button
              onClick={install}
              className="px-3.5 py-1.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold transition cursor-pointer shadow-xs whitespace-nowrap"
            >
              تثبيت التطبيق
            </button>
          </div>
        )}

        {/* Technical Safety Note */}
        <div className="text-[11px] text-stone-400 text-center leading-relaxed flex items-center justify-center gap-1.5">
          <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
          <span>البيانات آمنة ومحفوظة محلياً بالكامل ومحصنة ضد انقطاع الشبكة</span>
        </div>

      </div>
    </div>
  );
};
