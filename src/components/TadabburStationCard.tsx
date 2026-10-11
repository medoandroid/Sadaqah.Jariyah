import React, { useState } from 'react';
import {
  Sparkles,
  RotateCcw,
  Copy,
  Check,
  BookOpen,
  Volume2,
  Heart,
  Share2,
  Flame,
  ChevronDown,
  Filter
} from 'lucide-react';
import {
  TadabburItem,
  TADABBUR_ITEMS,
  getDailyTadabbur,
  getRandomTadabbur,
} from '../data/tadabburData';
import { playPeacefulChime, playTasbeehBeadSound } from '../utils/soundEffects';
import { useAudio } from '../context/AudioContext';

interface TadabburStationCardProps {
  onSelectSurah: (surahNumber: number) => void;
  onOpenMushaf?: () => void;
  showToast?: (msg: string) => void;
}

export const TadabburStationCard: React.FC<TadabburStationCardProps> = ({
  onSelectSurah,
  onOpenMushaf,
  showToast,
}) => {
  const [currentTadabbur, setCurrentTadabbur] = useState<TadabburItem>(() => getDailyTadabbur());
  const [isRandomMode, setIsRandomMode] = useState<boolean>(false);
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [copied, setCopied] = useState<boolean>(false);
  const { playSurah } = useAudio();

  const handleNextRandom = () => {
    playTasbeehBeadSound();
    setIsRandomMode(true);
    let next: TadabburItem;
    if (selectedCategory !== 'all') {
      const filtered = TADABBUR_ITEMS.filter((i) => i.category === selectedCategory && i.id !== currentTadabbur.id);
      if (filtered.length > 0) {
        next = filtered[Math.floor(Math.random() * filtered.length)];
      } else {
        next = getRandomTadabbur(currentTadabbur.id);
      }
    } else {
      next = getRandomTadabbur(currentTadabbur.id);
    }
    setCurrentTadabbur(next);
    showToast?.('تم استدعاء ومضة تدبر جديدة بنجاح 🌿');
  };

  const handleResetToDaily = () => {
    playPeacefulChime();
    setIsRandomMode(false);
    setSelectedCategory('all');
    setCurrentTadabbur(getDailyTadabbur());
    showToast?.('العودة إلى آية ومحطة تدبر اليوم الرسمية 🌟');
  };

  const handleCategoryFilter = (catKey: string) => {
    playTasbeehBeadSound();
    setSelectedCategory(catKey);
    if (catKey === 'all') {
      setCurrentTadabbur(getRandomTadabbur(currentTadabbur.id));
    } else {
      const match = TADABBUR_ITEMS.filter((i) => i.category === catKey);
      if (match.length > 0) {
        setCurrentTadabbur(match[Math.floor(Math.random() * match.length)]);
      }
    }
    setIsRandomMode(true);
  };

  const handleCopy = () => {
    const textToCopy = `﴿${currentTadabbur.text}﴾\n[سورة ${currentTadabbur.surahName} : الآية ${currentTadabbur.ayahNumber}]\n\n💡 ومضة تدبر:\n${currentTadabbur.tadabbur}\n\n🌿 أثر وتطبيق في يومك:\n${currentTadabbur.action}\n\n🤲 دعاء مستنبط:\n${currentTadabbur.supplication}\n\n- منصة صدقة جارية`;
    navigator.clipboard.writeText(textToCopy);
    setCopied(true);
    showToast?.('تم نسخ الآية والتدبر لمشاركتها 📋');
    setTimeout(() => setCopied(false), 2000);
  };

  const handleShareWhatsApp = () => {
    const textToShare = `﴿${currentTadabbur.text}﴾\n[سورة ${currentTadabbur.surahName} : الآية ${currentTadabbur.ayahNumber}]\n\n💡 ومضة تدبر:\n${currentTadabbur.tadabbur}\n\n🌿 تطبيق عملي:\n${currentTadabbur.action}\n\n- صدقة جارية`;
    const url = `https://api.whatsapp.com/send?text=${encodeURIComponent(textToShare)}`;
    window.open(url, '_blank');
  };

  const categories = [
    { key: 'all', label: 'كل الموضوعات' },
    { key: 'peace', label: 'السكينة والطمأنينة' },
    { key: 'relief', label: 'تفريج الكروب' },
    { key: 'hope', label: 'الأمل والرضا' },
    { key: 'parents', label: 'بر الوالدين والوفاء' },
    { key: 'gratitude', label: 'الشكر والزيادة' },
    { key: 'forgiveness', label: 'المغفرة والرحمة' },
  ];

  return (
    <div className="relative overflow-hidden rounded-3xl bg-white dark:bg-stone-900 border border-stone-200/90 dark:border-stone-800 shadow-sm p-5 sm:p-7 space-y-6 text-right">
      
      {/* Top Header Strip */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 border-b border-stone-150 dark:border-stone-800 pb-4">
        
        <div className="space-y-1">
          <div className="flex items-center gap-2 flex-wrap">
            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-amber-500/10 text-amber-900 dark:text-amber-300 text-xs font-semibold border border-amber-500/20">
              <Sparkles className="w-3.5 h-3.5 text-amber-600 dark:text-amber-400" />
              <span>{isRandomMode ? 'ومضة تدبر مختارة' : 'آية ومحطة تدبر اليوم'}</span>
            </span>

            <span className="text-xs font-bold text-stone-700 dark:text-stone-300">
              سورة {currentTadabbur.surahName} (الآية {currentTadabbur.ayahNumber})
            </span>

            <span className="text-[11px] px-2.5 py-0.5 rounded-lg bg-stone-100 dark:bg-stone-800 text-stone-600 dark:text-stone-400 font-medium">
              {currentTadabbur.categoryLabel}
            </span>
          </div>

          <p className="text-xs text-stone-500 dark:text-stone-400">
            تأملات قرآنية وتطبيق عملي في يومك مع دعاء خالص
          </p>
        </div>

        {/* Rotation & Mode Buttons */}
        <div className="flex items-center gap-2 shrink-0 self-end sm:self-auto">
          {isRandomMode && (
            <button
              onClick={handleResetToDaily}
              className="px-3 py-1.5 rounded-xl bg-white dark:bg-stone-800 hover:bg-stone-100 dark:hover:bg-stone-750 text-stone-700 dark:text-stone-300 border border-stone-200 dark:border-stone-700 text-xs font-medium transition cursor-pointer"
              title="العودة لآية اليوم المخصصة"
            >
              <span>آية اليوم</span>
            </button>
          )}

          <button
            onClick={handleNextRandom}
            className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl bg-stone-900 hover:bg-stone-800 dark:bg-stone-800 dark:hover:bg-stone-700 text-white text-xs font-medium transition cursor-pointer active:scale-95 shadow-2xs"
            title="اختيار آية أخرى عشوائياً من بين أكثر من ٤٠ آية مختارة"
          >
            <RotateCcw className="w-3.5 h-3.5 text-amber-300" />
            <span>آية وتدبر آخر</span>
          </button>
        </div>
      </div>

      {/* Category Pills Strip */}
      <div className="flex items-center gap-1.5 overflow-x-auto pb-1 scrollbar-none text-xs">
        <span className="text-stone-400 text-[11px] shrink-0 ml-1">الموضوع:</span>
        {categories.map((c) => {
          const isSelected = selectedCategory === c.key;
          return (
            <button
              key={c.key}
              onClick={() => handleCategoryFilter(c.key)}
              className={`px-3 py-1 rounded-xl shrink-0 transition-all cursor-pointer font-medium text-[11px] ${
                isSelected
                  ? 'bg-amber-800 text-white font-bold shadow-2xs'
                  : 'bg-stone-50 dark:bg-stone-800/80 text-stone-600 dark:text-stone-400 hover:bg-stone-100 dark:hover:bg-stone-750 border border-stone-200/80 dark:border-stone-700'
              }`}
            >
              {c.label}
            </button>
          );
        })}
      </div>

      {/* Quranic Ayah Box */}
      <div className="p-5 sm:p-7 rounded-2xl bg-white/90 dark:bg-stone-950/70 border border-amber-300/50 dark:border-stone-800 shadow-sm relative group">
        <div className="absolute top-2.5 left-2.5 opacity-20 pointer-events-none text-2xl font-amiri">
          ۞
        </div>
        <p className="font-amiri text-2xl sm:text-3xl lg:text-4xl font-bold text-stone-900 dark:text-stone-100 leading-loose text-center">
          ﴿{currentTadabbur.text}﴾
        </p>
      </div>

      {/* Insight & Action Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-3.5">
        
        {/* Tadabbur Insight */}
        <div className="p-4 sm:p-5 rounded-2xl bg-amber-500/10 dark:bg-amber-950/25 border border-amber-500/25 space-y-2">
          <div className="flex items-center gap-1.5 text-xs font-bold text-amber-900 dark:text-amber-300">
            <span>💡</span>
            <span>ومضة وتأمل إيماني:</span>
          </div>
          <p className="font-sans text-sm sm:text-base text-stone-800 dark:text-stone-200 leading-relaxed">
            {currentTadabbur.tadabbur}
          </p>
        </div>

        {/* Practical Life Action */}
        <div className="p-4 sm:p-5 rounded-2xl bg-emerald-500/10 dark:bg-emerald-950/25 border border-emerald-500/25 space-y-2">
          <div className="flex items-center gap-1.5 text-xs font-bold text-emerald-900 dark:text-emerald-300">
            <span>🌿</span>
            <span>أثر وتطبيق عملي في يومك:</span>
          </div>
          <p className="font-sans text-sm sm:text-base text-stone-800 dark:text-stone-200 leading-relaxed">
            {currentTadabbur.action}
          </p>
        </div>

      </div>

      {/* Supplication Snippet */}
      {currentTadabbur.supplication && (
        <div className="p-3.5 sm:p-4 rounded-2xl bg-stone-100/80 dark:bg-stone-850/80 border border-stone-200 dark:border-stone-800 flex items-start gap-2.5">
          <span className="text-base shrink-0 mt-0.5">🤲</span>
          <div className="text-xs sm:text-sm text-stone-700 dark:text-stone-300">
            <span className="font-bold text-stone-900 dark:text-stone-100 block mb-0.5">
              دعاء مستنبط من أنوار الآية:
            </span>
            <p className="font-amiri text-sm sm:text-base leading-relaxed text-amber-950 dark:text-amber-200">
              "{currentTadabbur.supplication}"
            </p>
          </div>
        </div>
      )}

      {/* Bottom Actions Bar */}
      <div className="flex flex-wrap items-center justify-between gap-2.5 pt-2 border-t border-amber-200/50 dark:border-stone-800 text-xs">
        
        <div className="flex items-center gap-2 flex-wrap">
          <button
            onClick={handleCopy}
            className="flex items-center gap-1.5 px-3 py-2 rounded-xl bg-white dark:bg-stone-800 hover:bg-stone-100 dark:hover:bg-stone-700 border border-stone-200 dark:border-stone-700 text-stone-700 dark:text-stone-300 font-semibold transition cursor-pointer active:scale-95 shadow-xs"
          >
            {copied ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5" />}
            <span>{copied ? 'تم النسخ' : 'نسخ التدبر'}</span>
          </button>

          <button
            onClick={handleShareWhatsApp}
            className="flex items-center gap-1.5 px-3 py-2 rounded-xl bg-emerald-600/10 hover:bg-emerald-600 hover:text-white text-emerald-800 dark:text-emerald-300 border border-emerald-600/25 font-semibold transition cursor-pointer active:scale-95"
            title="مشاركة الآية والتدبر على واتساب"
          >
            <Share2 className="w-3.5 h-3.5" />
            <span>مشاركة عبر واتساب</span>
          </button>

          <button
            onClick={() => onSelectSurah(currentTadabbur.surahNumber)}
            className="flex items-center gap-1.5 px-3 py-2 rounded-xl bg-amber-500/15 hover:bg-amber-600 hover:text-white text-amber-900 dark:text-amber-300 border border-amber-500/30 font-semibold transition cursor-pointer active:scale-95"
          >
            <BookOpen className="w-3.5 h-3.5" />
            <span>فتح سورة {currentTadabbur.surahName} بالمصحف</span>
          </button>
        </div>

        <button
          onClick={() => playSurah(currentTadabbur.surahNumber)}
          className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-amber-700 hover:bg-amber-800 text-white font-bold transition-all cursor-pointer shadow-xs active:scale-95"
        >
          <Volume2 className="w-3.5 h-3.5 text-amber-200" />
          <span>استماع للسورة كاملة 🎧</span>
        </button>

      </div>

    </div>
  );
};
