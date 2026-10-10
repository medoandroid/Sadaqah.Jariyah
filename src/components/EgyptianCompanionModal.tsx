import React, { useState } from 'react';
import {
  X,
  Sparkles,
  Heart,
  RotateCcw,
  BookOpen,
  Volume2,
  Copy,
  Check,
  Flame,
  MessageCircle,
  Share2,
  ArrowLeft,
  Coffee
} from 'lucide-react';
import {
  EgyptianMoodKey,
  EGYPTIAN_MOODS,
  EgyptianCompanionEntry,
  getEgyptianEntryByMood,
} from '../data/egyptianCompanionData';
import { playPeacefulChime, playTasbeehBeadSound } from '../utils/soundEffects';

interface EgyptianCompanionModalProps {
  isOpen: boolean;
  onClose: () => void;
  onNavigateTab: (tab: string, extra?: { surahNumber?: number; phrase?: string }) => void;
}

export const EgyptianCompanionModal: React.FC<EgyptianCompanionModalProps> = ({
  isOpen,
  onClose,
  onNavigateTab,
}) => {
  const [selectedMood, setSelectedMood] = useState<EgyptianMoodKey>('lazy_quran');
  const [currentEntry, setCurrentEntry] = useState<EgyptianCompanionEntry>(() =>
    getEgyptianEntryByMood('lazy_quran')
  );
  const [copied, setCopied] = useState(false);

  if (!isOpen) return null;

  const handleSelectMood = (mood: EgyptianMoodKey) => {
    playTasbeehBeadSound();
    setSelectedMood(mood);
    setCurrentEntry(getEgyptianEntryByMood(mood));
  };

  const handleNextNudge = () => {
    playTasbeehBeadSound();
    const next = getEgyptianEntryByMood(selectedMood, currentEntry.id);
    setCurrentEntry(next);
  };

  const handleAction = () => {
    playPeacefulChime();
    onClose();

    if (currentEntry.actionType === 'quran' && currentEntry.targetSurahNumber) {
      onNavigateTab('quran', { surahNumber: currentEntry.targetSurahNumber });
    } else if (currentEntry.actionType === 'mushaf') {
      onNavigateTab('mushaf');
    } else if (currentEntry.actionType === 'tasbeeh') {
      onNavigateTab('tasbeeh', { phrase: currentEntry.dhikrPhrase });
    } else if (currentEntry.actionType === 'dedications') {
      onNavigateTab('dedications');
    } else if (currentEntry.actionType === 'duas') {
      onNavigateTab('duas');
    } else if (currentEntry.actionType === 'adhkar') {
      onNavigateTab('adhkar');
    } else {
      onNavigateTab(currentEntry.actionType);
    }
  };

  const handleCopy = () => {
    const textToCopy = `رسالة من القلب ليك يا غالي 🌿:\n\n"${currentEntry.egyptianText}"\n\n- من تطبيق منصة الصدقة الجارية`;
    navigator.clipboard.writeText(textToCopy);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6 bg-stone-950/70 backdrop-blur-sm animate-in fade-in duration-200"
      onClick={onClose}
    >
      <div
        className="relative w-full max-w-2xl max-h-[92vh] overflow-y-auto rounded-3xl bg-white dark:bg-stone-900 border border-amber-500/30 dark:border-amber-600/30 shadow-2xl p-5 sm:p-7 space-y-5 text-right select-none"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Top Header */}
        <div className="flex items-center justify-between border-b border-stone-200/80 dark:border-stone-800 pb-3.5">
          <div className="flex items-center gap-3">
            <div className="w-11 h-11 rounded-2xl bg-amber-500/15 border border-amber-500/30 text-amber-800 dark:text-amber-300 flex items-center justify-center shadow-xs text-xl">
              🇪🇬
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="font-amiri text-2xl font-bold text-stone-900 dark:text-stone-100">
                  رفيقك الطيب (بالمصري)
                </h3>
                <span className="text-[10px] font-bold px-2.5 py-0.5 rounded-full bg-amber-500/15 text-amber-900 dark:text-amber-300 border border-amber-500/30">
                  فضفضة وذكر ع الرايق
                </span>
              </div>
              <p className="text-xs text-stone-500 dark:text-stone-400">
                تشجيع على قراءة القرآن، نصايح من القلب، وتذكير حلو بأسلوب مصري حنين
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-2 text-stone-400 hover:text-stone-700 dark:hover:text-stone-200 rounded-xl hover:bg-stone-100 dark:hover:bg-stone-800 transition cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Mood Selector Buttons */}
        <div className="space-y-2">
          <span className="text-xs font-bold text-stone-700 dark:text-stone-300 block">
            حاسس بإيه دلوقتي؟ أو عايز إيه يا غالي؟
          </span>
          <div className="flex flex-wrap gap-2">
            {EGYPTIAN_MOODS.map((m) => {
              const isSelected = selectedMood === m.key;
              return (
                <button
                  key={m.key}
                  onClick={() => handleSelectMood(m.key)}
                  className={`px-3 py-1.5 rounded-xl text-xs font-semibold border transition-all cursor-pointer flex items-center gap-1.5 active:scale-95 ${
                    isSelected
                      ? 'bg-amber-600 text-white border-amber-600 shadow-md font-bold'
                      : 'bg-stone-50 dark:bg-stone-800/80 border-stone-200 dark:border-stone-750 text-stone-700 dark:text-stone-300 hover:border-amber-400'
                  }`}
                >
                  <span>{m.label}</span>
                </button>
              );
            })}
          </div>
        </div>

        {/* Current Egyptian Advice Card */}
        <div className="relative overflow-hidden p-5 sm:p-6 rounded-3xl bg-gradient-to-br from-amber-500/10 via-amber-600/5 to-amber-700/10 dark:from-amber-950/30 dark:via-stone-850 dark:to-stone-900 border border-amber-500/30 dark:border-amber-500/20 shadow-md space-y-4">
          
          {/* Badge & Shuffle */}
          <div className="flex items-center justify-between gap-2 border-b border-amber-500/20 pb-2.5">
            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-amber-500/20 text-amber-900 dark:text-amber-200 text-xs font-bold border border-amber-500/30">
              <Sparkles className="w-3.5 h-3.5 text-amber-600" />
              <span>{currentEntry.badge}</span>
            </span>

            <button
              onClick={handleNextNudge}
              className="flex items-center gap-1.5 px-3 py-1 rounded-xl bg-white/80 dark:bg-stone-800 hover:bg-amber-100 text-stone-700 dark:text-stone-300 border border-stone-200 dark:border-stone-700 text-xs font-semibold transition cursor-pointer active:scale-95 shadow-xs"
            >
              <RotateCcw className="w-3.5 h-3.5 text-amber-600" />
              <span>نصيحة تانية 🔄</span>
            </button>
          </div>

          {/* Title */}
          <h4 className="font-amiri text-xl sm:text-2xl font-bold text-stone-900 dark:text-stone-100 leading-snug">
            {currentEntry.title}
          </h4>

          {/* Egyptian Message */}
          <div className="p-4 rounded-2xl bg-white/90 dark:bg-stone-950/80 border border-amber-500/20 shadow-inner">
            <p className="font-sans text-sm sm:text-base text-stone-800 dark:text-stone-200 leading-relaxed font-normal">
              "{currentEntry.egyptianText}"
            </p>
          </div>

          {/* Action Bar */}
          <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-2.5 pt-1">
            <button
              onClick={handleAction}
              className="flex-1 py-3 px-4 rounded-2xl bg-amber-700 hover:bg-amber-800 text-white font-amiri text-base sm:text-lg font-bold shadow-md hover:shadow-lg transition-all cursor-pointer flex items-center justify-center gap-2 active:scale-98"
            >
              <BookOpen className="w-4 h-4 text-amber-200" />
              <span>{currentEntry.actionText}</span>
              <ArrowLeft className="w-4 h-4" />
            </button>

            <button
              onClick={handleCopy}
              className="py-3 px-4 rounded-2xl bg-stone-100 dark:bg-stone-800 hover:bg-stone-200 dark:hover:bg-stone-750 text-stone-700 dark:text-stone-300 text-xs font-bold transition cursor-pointer flex items-center justify-center gap-1.5 active:scale-95"
              title="نسخ الرسالة ومشاركتها مع حبايبك"
            >
              {copied ? <Check className="w-4 h-4 text-emerald-600" /> : <Copy className="w-4 h-4" />}
              <span>{copied ? 'تم النسخ بنجاح' : 'نسخ ومشاركة 📲'}</span>
            </button>
          </div>
        </div>

        {/* Footer Reminder */}
        <div className="p-3 rounded-2xl bg-stone-50 dark:bg-stone-850 border border-stone-200 dark:border-stone-800 flex items-center gap-3 text-xs text-stone-600 dark:text-stone-400">
          <Heart className="w-4 h-4 text-amber-600 shrink-0" />
          <span>
            كل حرف بتقرأه وتسبحه في المنصة هنا بيوصل ثوابه وأجره مباشرة لأرواح عمامك الغاليين (رمضان، والشهاوي، والشافعي، وأحمد) رحمة ونوراً في قبورهم.
          </span>
        </div>

      </div>
    </div>
  );
};
