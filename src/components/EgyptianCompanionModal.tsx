import React, { useState } from 'react';
import {
  X,
  Sparkles,
  Heart,
  RotateCcw,
  BookOpen,
  Copy,
  Check,
  ArrowLeft
} from 'lucide-react';
import {
  CompanionMoodKey,
  COMPANION_MOODS,
  CompanionEntry,
  getCompanionEntryByMood,
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
  const [selectedMood, setSelectedMood] = useState<CompanionMoodKey>('lazy_quran');
  const [currentEntry, setCurrentEntry] = useState<CompanionEntry>(() =>
    getCompanionEntryByMood('lazy_quran')
  );
  const [copied, setCopied] = useState(false);

  if (!isOpen) return null;

  const handleSelectMood = (mood: CompanionMoodKey) => {
    playTasbeehBeadSound();
    setSelectedMood(mood);
    setCurrentEntry(getCompanionEntryByMood(mood));
  };

  const handleNextNudge = () => {
    playTasbeehBeadSound();
    const next = getCompanionEntryByMood(selectedMood, currentEntry.id);
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
    const textToCopy = `خاطر وتذكرة بالخير 🌿:\n\n"${currentEntry.text}"\n\n- منصة صدقة جارية`;
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
        className="relative w-full max-w-2xl max-h-[92vh] overflow-y-auto rounded-3xl bg-white dark:bg-stone-900 border border-stone-200 dark:border-stone-800 shadow-2xl p-6 sm:p-8 space-y-6 text-right select-none"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Top Header */}
        <div className="flex items-start justify-between border-b border-stone-100 dark:border-stone-800 pb-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-amber-500/10 border border-amber-500/20 text-amber-800 dark:text-amber-300 flex items-center justify-center shadow-xs">
              <Sparkles className="w-5 h-5 text-amber-600 dark:text-amber-400" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="font-amiri text-2xl font-bold text-stone-900 dark:text-stone-100">
                  خاطر طيب وتذكير بالخير
                </h3>
              </div>
              <p className="text-xs text-stone-500 dark:text-stone-400 mt-0.5">
                تذكير هادئ بالقرآن والورد، ونصح خالص يلامس القلب
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-2 text-stone-400 hover:text-stone-700 dark:hover:text-stone-200 rounded-xl hover:bg-stone-100 dark:hover:bg-stone-800 transition cursor-pointer"
            aria-label="إغلاق"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Mood Selector Buttons */}
        <div className="space-y-2">
          <span className="text-xs font-semibold text-stone-600 dark:text-stone-400 block">
            ما الذي تبحث عنه الآن؟
          </span>
          <div className="flex flex-wrap gap-2">
            {COMPANION_MOODS.map((m) => {
              const isSelected = selectedMood === m.key;
              return (
                <button
                  key={m.key}
                  onClick={() => handleSelectMood(m.key)}
                  className={`px-3.5 py-2 rounded-xl text-xs font-semibold transition-all cursor-pointer flex items-center gap-1.5 active:scale-95 ${
                    isSelected
                      ? 'bg-amber-800 dark:bg-amber-700 text-white shadow-xs font-bold'
                      : 'bg-stone-50 dark:bg-stone-800/80 border border-stone-200/80 dark:border-stone-750 text-stone-700 dark:text-stone-300 hover:border-amber-400/60'
                  }`}
                >
                  <span>{m.label}</span>
                </button>
              );
            })}
          </div>
        </div>

        {/* Current Advice Card */}
        <div className="relative overflow-hidden p-6 rounded-3xl bg-stone-50/70 dark:bg-stone-850/60 border border-stone-200/90 dark:border-stone-800 shadow-xs space-y-4">
          
          {/* Badge & Shuffle */}
          <div className="flex items-center justify-between gap-2 border-b border-stone-200/60 dark:border-stone-800 pb-3">
            <span className="inline-flex items-center gap-1.5 text-amber-800 dark:text-amber-300 text-xs font-semibold">
              <span className="w-1.5 h-1.5 rounded-full bg-amber-600" />
              <span>{currentEntry.badge}</span>
            </span>

            <button
              onClick={handleNextNudge}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-white dark:bg-stone-800 hover:bg-stone-100 dark:hover:bg-stone-700 text-stone-700 dark:text-stone-300 border border-stone-200 dark:border-stone-700 text-xs font-medium transition cursor-pointer active:scale-95 shadow-2xs"
            >
              <RotateCcw className="w-3.5 h-3.5 text-stone-500" />
              <span>خاطر آخر</span>
            </button>
          </div>

          {/* Title */}
          <h4 className="font-amiri text-xl sm:text-2xl font-bold text-stone-900 dark:text-stone-100 leading-snug">
            {currentEntry.title}
          </h4>

          {/* Message */}
          <div className="p-4 rounded-2xl bg-white dark:bg-stone-900/80 border border-stone-200/70 dark:border-stone-800">
            <p className="font-sans text-sm sm:text-base text-stone-800 dark:text-stone-200 leading-relaxed font-normal">
              "{currentEntry.text}"
            </p>
          </div>

          {/* Action Bar */}
          <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-2.5 pt-1">
            <button
              onClick={handleAction}
              className="flex-1 py-3 px-5 rounded-2xl bg-amber-800 hover:bg-amber-900 text-white font-amiri text-base sm:text-lg font-bold shadow-xs hover:shadow-sm transition-all cursor-pointer flex items-center justify-center gap-2 active:scale-98"
            >
              <BookOpen className="w-4 h-4 text-amber-200" />
              <span>{currentEntry.actionText}</span>
              <ArrowLeft className="w-4 h-4" />
            </button>

            <button
              onClick={handleCopy}
              className="py-3 px-4 rounded-2xl bg-white dark:bg-stone-800 hover:bg-stone-100 dark:hover:bg-stone-700 border border-stone-200 dark:border-stone-750 text-stone-700 dark:text-stone-300 text-xs font-medium transition cursor-pointer flex items-center justify-center gap-1.5 active:scale-95 shadow-2xs"
              title="نسخ الخاطر"
            >
              {copied ? <Check className="w-4 h-4 text-emerald-600" /> : <Copy className="w-4 h-4" />}
              <span>{copied ? 'تم النسخ' : 'نسخ النص'}</span>
            </button>
          </div>
        </div>

        {/* Footer Reminder */}
        <div className="p-3.5 rounded-2xl bg-stone-50 dark:bg-stone-850/60 border border-stone-200/80 dark:border-stone-800 flex items-center gap-3 text-xs text-stone-600 dark:text-stone-400">
          <Heart className="w-4 h-4 text-amber-600 shrink-0" />
          <span>
            كل حرف تقرأه وكل عمل صالح تؤديه هنا يصل ثوابه وأثره إلى أرواح عمامنا الكرام (رمضان، والشهاوي، والشافعي، وأحمد) رحمةً ونوراً بإذن الله.
          </span>
        </div>

      </div>
    </div>
  );
};

