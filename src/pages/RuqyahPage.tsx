import React, { useState } from 'react';
import {
  ShieldCheck,
  BookOpen,
  Heart,
  Sparkles,
  Compass,
  CheckCircle2,
  RotateCcw,
  Volume2,
  Copy,
  Share2,
  Gift,
  HelpCircle,
  Check,
  Info
} from 'lucide-react';
import { RUQYAH_ITEMS, RUQYAH_CATEGORIES, RUQYAH_ETIQUETTE, RuqyahItem } from '../data/ruqyahData';
import { storageService } from '../services/storageService';
import { playTasbeehBeadSound } from '../utils/soundEffects';
import { recordDedication } from '../services/dedicationService';

interface RuqyahPageProps {
  onOpenDedication?: () => void;
}

export const RuqyahPage: React.FC<RuqyahPageProps> = ({ onOpenDedication }) => {
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [counts, setCounts] = useState<{ [id: string]: number }>(() => {
    return storageService.get<{ [id: string]: number }>('ruqyah_counts', {});
  });
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const [toastMessage, setToastMessage] = useState<string | null>(null);
  const [showEtiquette, setShowEtiquette] = useState<boolean>(false);

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 2500);
  };

  const handleIncrement = (item: RuqyahItem) => {
    const current = counts[item.id] || 0;
    if (current >= item.recommendedCount) return;

    playTasbeehBeadSound();

    const next = current + 1;
    const newCounts = { ...counts, [item.id]: next };
    setCounts(newCounts);
    storageService.set('ruqyah_counts', newCounts);

    if (next === item.recommendedCount) {
      showToast(`أتممت قراءة: ${item.title}`);
      recordDedication('dua', `قراءة ${item.title} ضمن الرقية الشرعية`, 'all', 1, 'قارئ الرقية');
    }
  };

  const handleResetItem = (id: string) => {
    const newCounts = { ...counts, [id]: 0 };
    setCounts(newCounts);
    storageService.set('ruqyah_counts', newCounts);
  };

  const handleResetAll = () => {
    setCounts({});
    storageService.set('ruqyah_counts', {});
    showToast('تمت إعادة ضبط عدادات الرقية');
  };

  const handleCopyText = (item: RuqyahItem) => {
    const text = `${item.title}\n\n${item.arabicText}\n\nالمصدر: ${item.source}\nفضلها: ${item.virtue}`;
    navigator.clipboard.writeText(text);
    setCopiedId(item.id);
    showToast('تم نسخ نص الرقية');
    setTimeout(() => setCopiedId(null), 2000);
  };

  const filteredItems = selectedCategory === 'all'
    ? RUQYAH_ITEMS
    : RUQYAH_ITEMS.filter((i) => i.category === selectedCategory);

  const completedCount = RUQYAH_ITEMS.filter(
    (i) => (counts[i.id] || 0) >= i.recommendedCount
  ).length;

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 py-6 sm:py-10 space-y-8 animate-in fade-in duration-300">
      
      {/* Toast Alert */}
      {toastMessage && (
        <div className="fixed top-20 left-1/2 -translate-x-1/2 z-50 bg-stone-900/95 dark:bg-stone-100/95 text-stone-100 dark:text-stone-900 px-5 py-2.5 rounded-2xl shadow-xl text-sm font-medium border border-emerald-500/30 flex items-center gap-2 backdrop-blur-md">
          <Sparkles className="w-4 h-4 text-emerald-400" />
          <span>{toastMessage}</span>
        </div>
      )}

      {/* Header Banner */}
      <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-emerald-800 via-teal-900 to-stone-900 text-white p-6 sm:p-8 shadow-xl border border-emerald-700/30">
        <div className="absolute top-0 right-0 w-80 h-80 bg-radial from-emerald-400/20 to-transparent rounded-full blur-2xl pointer-events-none translate-x-1/3 -translate-y-1/3" />
        
        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="space-y-2 text-right">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-500/20 border border-emerald-400/30 text-emerald-200 text-xs font-semibold">
              <ShieldCheck className="w-3.5 h-3.5" />
              <span>حصن وأمان وشفاء بإذن الله</span>
            </div>
            <h1 className="font-amiri text-2xl sm:text-3xl lg:text-4xl font-bold tracking-wide">
              الرقية الشرعية الشاملة
            </h1>
            <p className="text-emerald-100/80 text-sm max-w-xl font-sans leading-relaxed">
              آيات بينات من كتاب الله وأدعية نبوية صحيحة للشفاء والسكينة ودفع الضر والعين مع عدادات تكرار تفاعلية ميسرة.
            </p>
          </div>

          {/* Quick Progress Badge */}
          <div className="flex items-center gap-3 shrink-0">
            <div className="flex flex-col items-center justify-center p-4 rounded-2xl bg-white/10 backdrop-blur-md border border-white/15 min-w-[90px]">
              <span className="text-xs text-emerald-300 font-semibold">الإنجاز</span>
              <span className="text-2xl font-bold font-mono mt-0.5">
                {completedCount}/{RUQYAH_ITEMS.length}
              </span>
            </div>

            <button
              onClick={() => setShowEtiquette(!showEtiquette)}
              className="flex flex-col items-center justify-center p-3 sm:p-4 rounded-2xl bg-white/10 hover:bg-white/20 backdrop-blur-md border border-white/15 text-white transition-all cursor-pointer text-xs font-semibold"
            >
              <Info className="w-5 h-5 mb-1 text-emerald-300" />
              <span>آداب الرقية</span>
            </button>
          </div>
        </div>
      </div>

      {/* Etiquette Collapsible Card */}
      {showEtiquette && (
        <div className="p-6 rounded-3xl bg-emerald-500/10 dark:bg-emerald-950/30 border border-emerald-500/25 space-y-3 text-right animate-in fade-in duration-200">
          <h3 className="font-amiri text-lg font-bold text-emerald-900 dark:text-emerald-300 flex items-center gap-2">
            <HelpCircle className="w-5 h-5 text-emerald-700 dark:text-emerald-400" />
            <span>آداب وشروط الرقية الشرعية النافعة:</span>
          </h3>
          <ul className="space-y-2 text-sm text-stone-700 dark:text-stone-300 list-disc list-inside">
            {RUQYAH_ETIQUETTE.map((etiquette, idx) => (
              <li key={idx} className="leading-relaxed">
                {etiquette}
              </li>
            ))}
          </ul>
        </div>
      )}

      {/* Category Pills & Reset All */}
      <div className="flex items-center justify-between gap-3 flex-wrap">
        <div className="flex items-center gap-2 overflow-x-auto pb-1 scrollbar-none text-sm">
          {RUQYAH_CATEGORIES.map((cat) => {
            const isSelected = selectedCategory === cat.id;
            return (
              <button
                key={cat.id}
                onClick={() => setSelectedCategory(cat.id)}
                className={`px-4 py-2 rounded-2xl font-medium shrink-0 transition-all cursor-pointer border ${
                  isSelected
                    ? 'bg-emerald-700 text-white border-emerald-600 shadow-sm'
                    : 'bg-white dark:bg-stone-900 text-stone-700 dark:text-stone-300 border-stone-200 dark:border-stone-800 hover:bg-emerald-50 dark:hover:bg-stone-800'
                }`}
              >
                {cat.label}
              </button>
            );
          })}
        </div>

        {completedCount > 0 && (
          <button
            onClick={handleResetAll}
            className="flex items-center gap-1.5 text-xs text-stone-500 hover:text-stone-800 dark:hover:text-stone-200 transition-colors cursor-pointer px-3 py-1.5 rounded-xl border border-stone-200 dark:border-stone-800"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            <span>تصفير العدادات</span>
          </button>
        )}
      </div>

      {/* Ruqyah Items List */}
      <div className="space-y-5">
        {filteredItems.map((item) => {
          const currentCount = counts[item.id] || 0;
          const isDone = currentCount >= item.recommendedCount;
          const progressPercent = Math.min(100, (currentCount / item.recommendedCount) * 100);

          return (
            <div
              key={item.id}
              className={`bg-white dark:bg-stone-900 rounded-3xl p-6 sm:p-7 border transition-all text-right space-y-4 shadow-sm hover:shadow-md ${
                isDone
                  ? 'border-emerald-500/40 bg-emerald-50/15 dark:bg-emerald-950/15'
                  : 'border-stone-200 dark:border-stone-800'
              }`}
            >
              {/* Card Header */}
              <div className="flex items-center justify-between gap-3 border-b border-stone-100 dark:border-stone-800 pb-3">
                <div className="flex items-center gap-2">
                  <span className="px-2.5 py-1 rounded-full text-xs font-semibold bg-emerald-500/10 text-emerald-800 dark:text-emerald-300 border border-emerald-500/20">
                    {item.categoryLabel}
                  </span>
                  <span className="text-xs text-stone-400 font-mono">
                    {item.source}
                  </span>
                </div>

                <div className="flex items-center gap-1.5">
                  <button
                    onClick={() => handleCopyText(item)}
                    title="نسخ النص"
                    className="p-2 rounded-xl text-stone-400 hover:text-stone-700 dark:hover:text-stone-200 hover:bg-stone-100 dark:hover:bg-stone-800 transition-all cursor-pointer"
                  >
                    {copiedId === item.id ? <Check className="w-4 h-4 text-emerald-600" /> : <Copy className="w-4 h-4" />}
                  </button>

                  {isDone && (
                    <button
                      onClick={() => handleResetItem(item.id)}
                      title="إعادة التصفير"
                      className="p-2 rounded-xl text-stone-400 hover:text-stone-700 dark:hover:text-stone-200 hover:bg-stone-100 dark:hover:bg-stone-800 transition-all cursor-pointer"
                    >
                      <RotateCcw className="w-4 h-4" />
                    </button>
                  )}
                </div>
              </div>

              {/* Title */}
              <h3 className="font-amiri text-lg sm:text-xl font-bold text-stone-900 dark:text-stone-100">
                {item.title}
              </h3>

              {/* Arabic Text */}
              <div className="p-4 sm:p-5 rounded-2xl bg-[#FCFAF6] dark:bg-[#16181F] border border-amber-900/10 dark:border-amber-500/10">
                <p className="font-amiri text-lg sm:text-2xl text-stone-900 dark:text-stone-100 leading-loose sm:leading-loose text-justify">
                  {item.arabicText}
                </p>
              </div>

              {/* Virtue / Hadith Note */}
              <p className="text-xs sm:text-sm text-stone-500 dark:text-stone-400 leading-relaxed">
                ✨ {item.virtue}
              </p>

              {/* Interactive Counter Zone */}
              <div className="pt-2 flex flex-col sm:flex-row items-center justify-between gap-4">
                
                {/* Visual Progress Bar */}
                <div className="w-full sm:w-1/2 space-y-1.5">
                  <div className="flex justify-between text-xs text-stone-400 font-mono">
                    <span>التكرار: {currentCount} من {item.recommendedCount}</span>
                    <span>{Math.round(progressPercent)}%</span>
                  </div>
                  <div className="h-2 rounded-full bg-stone-100 dark:bg-stone-800 overflow-hidden">
                    <div
                      className={`h-full transition-all duration-300 rounded-full ${
                        isDone ? 'bg-emerald-600' : 'bg-emerald-500'
                      }`}
                      style={{ width: `${progressPercent}%` }}
                    />
                  </div>
                </div>

                {/* Counter Tap Button */}
                <button
                  onClick={() => handleIncrement(item)}
                  disabled={isDone}
                  className={`w-full sm:w-auto px-6 py-3 rounded-2xl font-bold text-sm flex items-center justify-center gap-2 transition-all cursor-pointer ${
                    isDone
                      ? 'bg-emerald-500/20 text-emerald-800 dark:text-emerald-300 border border-emerald-500/30'
                      : 'bg-emerald-700 hover:bg-emerald-800 active:scale-95 text-white shadow-md hover:shadow-lg'
                  }`}
                >
                  {isDone ? (
                    <>
                      <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                      <span>اكتمل التكرار المطلوب</span>
                    </>
                  ) : (
                    <>
                      <span>قراءة وتكرار ({currentCount + 1}/{item.recommendedCount})</span>
                    </>
                  )}
                </button>
              </div>
            </div>
          );
        })}
      </div>

      {/* Footer Dedication Trigger */}
      {onOpenDedication && (
        <div className="text-center pt-4">
          <button
            onClick={onOpenDedication}
            className="inline-flex items-center gap-2 px-6 py-3 rounded-2xl bg-amber-700 hover:bg-amber-800 text-white font-medium shadow-md transition-all cursor-pointer text-sm"
          >
            <Gift className="w-4 h-4" />
            <span>إهداء ثواب قراءة الرقية الشرعية للمتوفين</span>
          </button>
        </div>
      )}

    </div>
  );
};
