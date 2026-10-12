import React, { useState, useEffect } from 'react';
import {
  Download,
  X,
  Play,
  Pause,
  RotateCw,
  Trash2,
  HardDrive,
  CheckCircle2,
  AlertCircle,
  FileAudio,
  Layers,
  Sparkles,
  ExternalLink,
  ChevronDown,
  User,
  Music,
  Check
} from 'lucide-react';
import {
  audioDownloadService,
  ActiveDownloadTask,
  DownloadedAudioItem,
} from '../services/audioDownloadService';
import { ALL_SURAHS, ALL_JUZ_METADATA } from '../data/quranMeta';
import { EXPANDED_RECITERS } from '../data/reciters';
import { useAudio } from '../context/AudioContext';
import { Reciter } from '../types';

interface AudioDownloadManagerModalProps {
  isOpen: boolean;
  onClose: () => void;
  defaultSurahNumber?: number;
}

export const AudioDownloadManagerModal: React.FC<AudioDownloadManagerModalProps> = ({
  isOpen,
  onClose,
  defaultSurahNumber,
}) => {
  const { currentReciter, playSurah } = useAudio();
  const [downloadReciter, setDownloadReciter] = useState<Reciter>(currentReciter);
  const [activeTask, setActiveTask] = useState<ActiveDownloadTask | null>(null);
  const [downloadedItems, setDownloadedItems] = useState<DownloadedAudioItem[]>([]);
  const [storageEstimate, setStorageEstimate] = useState<{
    usedBytes: number;
    quotaBytes: number;
    usedPercent: number;
  }>({ usedBytes: 0, quotaBytes: 1, usedPercent: 0 });

  // Single surah selection
  const [selectedSurahToDownload, setSelectedSurahToDownload] = useState<number>(
    defaultSurahNumber || 1
  );
  // Single Juz selection
  const [selectedJuzToDownload, setSelectedJuzToDownload] = useState<number>(30); // Default Juz Amma

  const [activeTab, setActiveTab] = useState<'manager' | 'download_new'>('manager');
  const [searchTerm, setSearchTerm] = useState('');
  const [confirmFullQuran, setConfirmFullQuran] = useState(false);

  // Subscribe to service
  useEffect(() => {
    const unsubscribe = audioDownloadService.subscribe((task, items) => {
      setActiveTask(task);
      setDownloadedItems(items);
      audioDownloadService.getStorageEstimate().then(setStorageEstimate);
    });
    return () => unsubscribe();
  }, []);

  // Update default surah when prop changes
  useEffect(() => {
    if (defaultSurahNumber) {
      setSelectedSurahToDownload(defaultSurahNumber);
    }
  }, [defaultSurahNumber]);

  if (!isOpen) return null;

  const formatBytes = (bytes: number) => {
    if (bytes === 0) return '0 ميجابايت';
    const mb = bytes / (1024 * 1024);
    if (mb >= 1024) {
      return `${(mb / 1024).toFixed(2)} جيجابايت`;
    }
    return `${mb.toFixed(1)} ميجابايت`;
  };

  const handleStartSingleSurah = () => {
    audioDownloadService.downloadSurah(selectedSurahToDownload, downloadReciter);
    setActiveTab('manager');
  };

  const handleStartJuz = () => {
    audioDownloadService.downloadJuz(selectedJuzToDownload, downloadReciter);
    setActiveTab('manager');
  };

  const handleStartFullQuran = () => {
    audioDownloadService.downloadFullQuran(downloadReciter);
    setConfirmFullQuran(false);
    setActiveTab('manager');
  };

  const filteredDownloadedItems = downloadedItems.filter((it) => {
    if (!searchTerm) return true;
    return (
      it.surahName.includes(searchTerm) ||
      it.reciterName.includes(searchTerm) ||
      String(it.surahNumber) === searchTerm
    );
  });

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/75 backdrop-blur-md animate-in fade-in duration-200"
      onClick={onClose}
      dir="rtl"
    >
      <div
        className="relative w-full max-w-3xl max-h-[92vh] flex flex-col bg-[#141720] text-stone-100 rounded-3xl border border-amber-500/35 shadow-[0_25px_70px_rgba(0,0,0,0.85)] overflow-hidden"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Modal Header */}
        <div className="p-4 sm:p-6 border-b border-stone-800 bg-[#171B24] flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-amber-500/20 border border-amber-500/40 flex items-center justify-center text-amber-400">
              <Download className="w-5 h-5" />
            </div>
            <div>
              <h2 className="font-amiri text-xl sm:text-2xl font-bold text-white">
                مدير التنزيلات والاستماع دون إنترنت
              </h2>
              <p className="text-xs text-stone-400">
                حمّل السور والأجزاء بصيغة MP3 نقيّة واستمع إليها في أي وقت دون اتصال
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-2 rounded-xl text-stone-400 hover:text-white hover:bg-stone-800 transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Storage Bar Indicator */}
        <div className="px-4 sm:px-6 py-3 bg-stone-900/70 border-b border-stone-800/80 flex flex-col sm:flex-row sm:items-center justify-between gap-2 text-xs">
          <div className="flex items-center gap-2 text-stone-300">
            <HardDrive className="w-4 h-4 text-amber-400 shrink-0" />
            <span>مساحة التخزين المستهلكة محلياً:</span>
            <span className="font-mono font-bold text-amber-300">
              {formatBytes(storageEstimate.usedBytes)}
            </span>
            <span className="text-stone-500">
              (من أصل {formatBytes(storageEstimate.quotaBytes)})
            </span>
          </div>

          <div className="w-full sm:w-44 bg-stone-800 rounded-full h-2 overflow-hidden">
            <div
              className="bg-gradient-to-r from-amber-600 to-amber-400 h-full transition-all duration-300"
              style={{ width: `${Math.max(2, storageEstimate.usedPercent)}%` }}
            />
          </div>
        </div>

        {/* Tab Switcher */}
        <div className="px-4 sm:px-6 pt-3 flex items-center gap-2 border-b border-stone-800">
          <button
            type="button"
            onClick={() => setActiveTab('manager')}
            className={`pb-2.5 px-3 text-xs sm:text-sm font-semibold transition-all border-b-2 cursor-pointer ${
              activeTab === 'manager'
                ? 'border-amber-500 text-amber-300 font-bold'
                : 'border-transparent text-stone-400 hover:text-stone-200'
            }`}
          >
            الملفات المحفوظة والمهام الجارية ({downloadedItems.length})
          </button>
          <button
            type="button"
            onClick={() => setActiveTab('download_new')}
            className={`pb-2.5 px-3 text-xs sm:text-sm font-semibold transition-all border-b-2 cursor-pointer ${
              activeTab === 'download_new'
                ? 'border-amber-500 text-amber-300 font-bold'
                : 'border-transparent text-stone-400 hover:text-stone-200'
            }`}
          >
            + بدء تنزيل جديد (سورة / جزء / المصحف)
          </button>
        </div>

        {/* Modal Scrollable Content */}
        <div className="p-4 sm:p-6 overflow-y-auto space-y-5">
          {activeTab === 'download_new' ? (
            /* NEW DOWNLOAD SETUP VIEW */
            <div className="space-y-5">
              {/* Reciter Selector for Download */}
              <div className="p-4 rounded-2xl bg-stone-900 border border-stone-800 space-y-2">
                <label className="block text-xs font-bold text-stone-300">
                  اختر القارئ والرواية المطلوب تنزيل الصوت بهما:
                </label>
                <div className="relative">
                  <select
                    value={downloadReciter.id}
                    onChange={(e) => {
                      const found = EXPANDED_RECITERS.find((r) => r.id === e.target.value);
                      if (found) setDownloadReciter(found);
                    }}
                    className="w-full bg-stone-800 border border-stone-700 rounded-xl px-3 py-2.5 text-sm text-stone-100 appearance-none focus:outline-none focus:border-amber-500 cursor-pointer"
                  >
                    {EXPANDED_RECITERS.map((r) => (
                      <option key={r.id} value={r.id}>
                        {r.name} — {(r as any).riwayah || 'حفص عن عاصم'}
                      </option>
                    ))}
                  </select>
                  <ChevronDown className="w-4 h-4 text-stone-400 absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
                </div>
              </div>

              {/* Action 1: Single Surah */}
              <div className="p-4 rounded-2xl bg-stone-900 border border-stone-800 space-y-3">
                <div className="flex items-center gap-2 text-sm font-bold text-white">
                  <FileAudio className="w-4 h-4 text-amber-400" />
                  <span>١. تنزيل سورة منفردة بصيغة MP3</span>
                </div>
                <div className="flex flex-col sm:flex-row gap-2">
                  <div className="relative flex-1">
                    <select
                      value={selectedSurahToDownload}
                      onChange={(e) => setSelectedSurahToDownload(Number(e.target.value))}
                      className="w-full bg-stone-800 border border-stone-700 rounded-xl px-3 py-2 text-sm text-stone-100 appearance-none cursor-pointer"
                    >
                      {ALL_SURAHS.map((s) => (
                        <option key={s.number} value={s.number}>
                          {s.number}. سورة {s.name} ({s.numberOfAyahs} آية)
                        </option>
                      ))}
                    </select>
                    <ChevronDown className="w-4 h-4 text-stone-400 absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
                  </div>
                  <button
                    type="button"
                    onClick={handleStartSingleSurah}
                    className="px-4 py-2 rounded-xl bg-amber-600 hover:bg-amber-500 text-stone-950 font-bold text-xs sm:text-sm transition-colors cursor-pointer flex items-center justify-center gap-1.5"
                  >
                    <Download className="w-4 h-4" />
                    <span>تنزيل السورة</span>
                  </button>
                </div>
              </div>

              {/* Action 2: Juz Selection */}
              <div className="p-4 rounded-2xl bg-stone-900 border border-stone-800 space-y-3">
                <div className="flex items-center gap-2 text-sm font-bold text-white">
                  <Layers className="w-4 h-4 text-emerald-400" />
                  <span>٢. تنزيل جزء قرآني كامل (مجموعة سور الجزء)</span>
                </div>
                <div className="flex flex-col sm:flex-row gap-2">
                  <div className="relative flex-1">
                    <select
                      value={selectedJuzToDownload}
                      onChange={(e) => setSelectedJuzToDownload(Number(e.target.value))}
                      className="w-full bg-stone-800 border border-stone-700 rounded-xl px-3 py-2 text-sm text-stone-100 appearance-none cursor-pointer"
                    >
                      {ALL_JUZ_METADATA.map((j) => (
                        <option key={j.number} value={j.number}>
                          {j.name} (يبدأ من {j.startSurah})
                        </option>
                      ))}
                    </select>
                    <ChevronDown className="w-4 h-4 text-stone-400 absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
                  </div>
                  <button
                    type="button"
                    onClick={handleStartJuz}
                    className="px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-stone-950 font-bold text-xs sm:text-sm transition-colors cursor-pointer flex items-center justify-center gap-1.5"
                  >
                    <Download className="w-4 h-4" />
                    <span>تنزيل الجزء كاملاً</span>
                  </button>
                </div>
              </div>

              {/* Action 3: Full Quran */}
              <div className="p-4 rounded-2xl bg-stone-900 border border-amber-500/30 space-y-3">
                <div className="flex items-center gap-2 text-sm font-bold text-amber-300">
                  <Sparkles className="w-4 h-4 text-amber-400" />
                  <span>٣. تنزيل المصحف كاملاً (١١٤ سورة) بصوت القارئ</span>
                </div>
                <p className="text-xs text-stone-400">
                  سيتم جدولة تنزيل كافة سور القرآن الكريم وحفظها في التخزين المحلي للاستماع الأوفلاين الدائم دون استهلاك أي باقة إنترنت لاحقاً.
                </p>

                {confirmFullQuran ? (
                  <div className="p-3 rounded-xl bg-amber-950/60 border border-amber-500/50 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
                    <span className="text-xs text-amber-200">
                      هل تود بدء تنزيل ١١٤ سورة بصوت {downloadReciter.name}؟ (الحجم التقديري ~١.٢ جيجابايت)
                    </span>
                    <div className="flex items-center gap-2">
                      <button
                        type="button"
                        onClick={handleStartFullQuran}
                        className="px-3 py-1.5 rounded-lg bg-amber-500 hover:bg-amber-400 text-stone-950 font-bold text-xs transition-colors cursor-pointer"
                      >
                        نعم، ابدأ التنزيل
                      </button>
                      <button
                        type="button"
                        onClick={() => setConfirmFullQuran(false)}
                        className="px-3 py-1.5 rounded-lg bg-stone-800 hover:bg-stone-700 text-stone-300 text-xs transition-colors cursor-pointer"
                      >
                        إلغاء
                      </button>
                    </div>
                  </div>
                ) : (
                  <button
                    type="button"
                    onClick={() => setConfirmFullQuran(true)}
                    className="px-4 py-2 rounded-xl bg-stone-800 hover:bg-stone-700 border border-amber-500/40 text-amber-300 font-bold text-xs sm:text-sm transition-colors cursor-pointer flex items-center gap-1.5"
                  >
                    <Download className="w-4 h-4" />
                    <span>تنزيل المصحف الشريف كاملاً</span>
                  </button>
                )}
              </div>
            </div>
          ) : (
            /* MANAGER VIEW (ACTIVE TASKS & DOWNLOADED LIBRARY) */
            <div className="space-y-5">
              {/* Active Download Task Card */}
              {activeTask && (
                <div className="p-4 sm:p-5 rounded-2xl bg-amber-950/40 border border-amber-500/50 space-y-3 shadow-lg">
                  <div className="flex items-center justify-between">
                    <div className="space-y-0.5">
                      <div className="flex items-center gap-2">
                        <span className="text-sm sm:text-base font-bold text-white">
                          {activeTask.title}
                        </span>
                        <span
                          className={`text-[10px] px-2 py-0.5 rounded-full font-bold ${
                            activeTask.status === 'downloading'
                              ? 'bg-amber-500/20 text-amber-300 animate-pulse'
                              : activeTask.status === 'paused'
                              ? 'bg-yellow-500/20 text-yellow-300'
                              : activeTask.status === 'completed'
                              ? 'bg-emerald-500/20 text-emerald-300'
                              : 'bg-rose-500/20 text-rose-300'
                          }`}
                        >
                          {activeTask.status === 'downloading' && 'جاري التنزيل...'}
                          {activeTask.status === 'paused' && 'متوقف مؤقتاً'}
                          {activeTask.status === 'completed' && 'اكتمل التنزيل بنجاح'}
                          {activeTask.status === 'error' && 'حدث خطأ'}
                        </span>
                      </div>
                      <div className="text-xs text-amber-200/80">
                        {activeTask.currentSurahName || 'جاري المعالجة...'}
                      </div>
                    </div>

                    {/* Task Controls: Pause / Resume / Cancel */}
                    <div className="flex items-center gap-1.5">
                      {activeTask.status === 'downloading' && (
                        <button
                          type="button"
                          onClick={() => audioDownloadService.pauseDownload()}
                          className="p-1.5 rounded-lg bg-stone-800 hover:bg-stone-700 text-stone-200 transition-colors cursor-pointer"
                          title="إيقاف مؤقت"
                        >
                          <Pause className="w-4 h-4" />
                        </button>
                      )}
                      {activeTask.status === 'paused' && (
                        <button
                          type="button"
                          onClick={() => audioDownloadService.resumeDownload()}
                          className="p-1.5 rounded-lg bg-amber-600 hover:bg-amber-500 text-stone-950 transition-colors cursor-pointer"
                          title="استكمال التنزيل"
                        >
                          <Play className="w-4 h-4" />
                        </button>
                      )}
                      {activeTask.status === 'error' && (
                        <button
                          type="button"
                          onClick={() => audioDownloadService.resumeDownload()}
                          className="p-1.5 rounded-lg bg-amber-600 hover:bg-amber-500 text-stone-950 transition-colors cursor-pointer"
                          title="إعادة المحاولة"
                        >
                          <RotateCw className="w-4 h-4" />
                        </button>
                      )}
                      <button
                        type="button"
                        onClick={() => audioDownloadService.cancelDownload()}
                        className="p-1.5 rounded-lg bg-stone-800 hover:bg-rose-900 text-rose-300 transition-colors cursor-pointer"
                        title="إلغاء التنزيل"
                      >
                        <X className="w-4 h-4" />
                      </button>
                    </div>
                  </div>

                  {/* Progress Bar */}
                  <div className="space-y-1">
                    <div className="w-full bg-stone-800 rounded-full h-2.5 overflow-hidden">
                      <div
                        className="bg-gradient-to-r from-amber-600 to-amber-400 h-full transition-all duration-200"
                        style={{ width: `${activeTask.progressPercent}%` }}
                      />
                    </div>
                    <div className="flex items-center justify-between text-[11px] text-stone-400 font-mono">
                      <span>{activeTask.progressPercent}%</span>
                      <span>
                        تم إنجاز {activeTask.completedItems} من أصل {activeTask.totalItems} ملف
                      </span>
                    </div>
                  </div>

                  {activeTask.error && (
                    <div className="text-xs text-rose-300 bg-rose-950/60 p-2 rounded-xl border border-rose-500/30 flex items-center gap-1.5">
                      <AlertCircle className="w-4 h-4 shrink-0" />
                      <span>{activeTask.error}</span>
                    </div>
                  )}
                </div>
              )}

              {/* Downloaded Files Search & List */}
              <div className="space-y-3">
                <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-2">
                  <div className="text-sm font-bold text-white flex items-center gap-2">
                    <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                    <span>الملفات المحفوظة على جهازك ({downloadedItems.length})</span>
                  </div>

                  {downloadedItems.length > 0 && (
                    <input
                      type="text"
                      placeholder="بحث في السور المحفوظة..."
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      className="bg-stone-900 border border-stone-800 rounded-xl px-3 py-1.5 text-xs text-stone-100 focus:outline-none focus:border-amber-500"
                    />
                  )}
                </div>

                {downloadedItems.length === 0 ? (
                  <div className="p-8 rounded-2xl bg-stone-900/50 border border-stone-800 text-center space-y-3">
                    <FileAudio className="w-10 h-10 text-stone-600 mx-auto" />
                    <div className="space-y-1">
                      <h3 className="text-sm font-bold text-stone-300">
                        لا توجد تلاوات صوتية محفوظة بعد
                      </h3>
                      <p className="text-xs text-stone-400 max-w-sm mx-auto">
                        يمكنك تنزيل أي سورة أو جزء كامل بالضغط على زر «بدء تنزيل جديد» أعلاه للاستماع إليها دون إنترنت.
                      </p>
                    </div>
                    <button
                      type="button"
                      onClick={() => setActiveTab('download_new')}
                      className="px-4 py-2 rounded-xl bg-amber-500 hover:bg-amber-400 text-stone-950 font-bold text-xs transition-colors cursor-pointer"
                    >
                      بدء تنزيل سورة الآن
                    </button>
                  </div>
                ) : (
                  <div className="grid grid-cols-1 gap-2.5 max-h-80 overflow-y-auto pr-1">
                    {filteredDownloadedItems.map((item) => (
                      <div
                        key={item.id}
                        className="p-3 rounded-2xl bg-stone-900 hover:bg-stone-850 border border-stone-800 flex items-center justify-between gap-3 transition-colors"
                      >
                        <div className="flex items-center gap-3 min-w-0">
                          <button
                            type="button"
                            onClick={() => {
                              const rec = EXPANDED_RECITERS.find((r) => r.id === item.reciterId) || currentReciter;
                              playSurah(item.surahNumber, rec);
                            }}
                            className="w-9 h-9 rounded-xl bg-amber-500/20 hover:bg-amber-500 text-amber-300 hover:text-stone-950 flex items-center justify-center transition-colors cursor-pointer shrink-0"
                            title="تشغيل السورة أوفلاين"
                          >
                            <Play className="w-4 h-4 ml-0.5" />
                          </button>

                          <div className="min-w-0">
                            <div className="font-amiri text-sm font-bold text-white truncate">
                              سورة {item.surahName}
                            </div>
                            <div className="text-[11px] text-stone-400 truncate flex items-center gap-2">
                              <span>{item.reciterName}</span>
                              <span className="text-stone-600">·</span>
                              <span className="font-mono text-amber-300/80">
                                {formatBytes(item.sizeBytes)}
                              </span>
                            </div>
                          </div>
                        </div>

                        {/* Actions: Export to disk / Delete */}
                        <div className="flex items-center gap-1.5 shrink-0">
                          <button
                            type="button"
                            onClick={() => audioDownloadService.exportFileToDevice(item)}
                            className="p-1.5 rounded-lg bg-stone-800 hover:bg-stone-700 text-stone-300 hover:text-amber-300 transition-colors cursor-pointer text-xs flex items-center gap-1"
                            title="حفظ ملف MP3 على جهازك"
                          >
                            <Download className="w-3.5 h-3.5" />
                            <span className="hidden sm:inline">حفظ MP3</span>
                          </button>
                          <button
                            type="button"
                            onClick={() => audioDownloadService.deleteDownloadedItem(item.id)}
                            className="p-1.5 rounded-lg text-stone-500 hover:text-rose-400 hover:bg-stone-800 transition-colors cursor-pointer"
                            title="حذف من الذاكرة المحلية"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          )}
        </div>

        {/* Modal Footer */}
        <div className="p-3 sm:p-4 border-t border-stone-800 bg-[#171B24] flex items-center justify-between text-xs text-stone-400">
          <span>التلاوات المحفوظة تعمل مباشرة في المشغل حتى عند انقطاع الإنترنت بالكامل</span>
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-1.5 rounded-xl bg-stone-800 hover:bg-stone-700 text-stone-200 transition-colors cursor-pointer font-medium"
          >
            إغلاق
          </button>
        </div>
      </div>
    </div>
  );
};
