import React, { useState, useMemo } from 'react';
import {
  BookOpen,
  Search,
  Sparkles,
  Volume2,
  VolumeX,
  Copy,
  Share2,
  Bookmark,
  CheckCircle2,
  ChevronDown,
  ChevronUp,
  Gift,
  Check
} from 'lucide-react';
import { NAWAWI_HADITHS, HadithItem } from '../data/hadithData';
import { storageService } from '../services/storageService';
import { recordDedication } from '../services/dedicationService';

interface HadithPageProps {
  onOpenDedication?: () => void;
}

export const HadithPage: React.FC<HadithPageProps> = ({ onOpenDedication }) => {
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [expandedId, setExpandedId] = useState<number | null>(1);
  const [readHadiths, setReadHadiths] = useState<{ [id: number]: boolean }>(() => {
    return storageService.get<{ [id: number]: boolean }>('hadith_read_map', {});
  });
  const [copiedId, setCopiedId] = useState<number | null>(null);
  const [speakingId, setSpeakingId] = useState<number | null>(null);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  const categories = useMemo(() => {
    const set = new Set<string>();
    NAWAWI_HADITHS.forEach((h) => set.add(h.category));
    return ['all', ...Array.from(set)];
  }, []);

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 2500);
  };

  const filteredHadiths = useMemo(() => {
    return NAWAWI_HADITHS.filter((h) => {
      const matchCat = selectedCategory === 'all' || h.category === selectedCategory;
      if (!matchCat) return false;
      if (!searchQuery.trim()) return true;
      const q = searchQuery.trim().toLowerCase();
      return (
        h.title.toLowerCase().includes(q) ||
        h.arabicText.toLowerCase().includes(q) ||
        h.narrator.toLowerCase().includes(q) ||
        h.explanation.toLowerCase().includes(q)
      );
    });
  }, [searchQuery, selectedCategory]);

  const toggleReadStatus = (id: number) => {
    const next = !readHadiths[id];
    const newMap = { ...readHadiths, [id]: next };
    setReadHadiths(newMap);
    storageService.set('hadith_read_map', newMap);

    if (next) {
      showToast('تم تحديد الحديث كمقروء ومدروس');
      recordDedication('dua', `دراسة وتدبر الحديث الشريف رقم ${id}`, 'all', 1, 'دارس الحديث');
    }
  };

  const handleCopyHadith = (item: HadithItem) => {
    const text = `✨ [الحديث رقم ${item.id}: ${item.title}]\nعن ${item.narrator}:\n${item.arabicText}\nالمصدر: ${item.source}\nفوائد الحديث:\n${item.keyBenefits.map((b) => '• ' + b).join('\n')}`;
    navigator.clipboard.writeText(text);
    setCopiedId(item.id);
    showToast('تم نسخ الحديث الشريف مع فوائده');
    setTimeout(() => setCopiedId(null), 2000);
  };

  const handleSpeakHadith = (item: HadithItem) => {
    if (typeof window === 'undefined' || !('speechSynthesis' in window)) {
      showToast('القراءة الصوتية غير مدعومة في هذا المتصفح');
      return;
    }

    if (speakingId === item.id) {
      window.speechSynthesis.cancel();
      setSpeakingId(null);
      return;
    }

    window.speechSynthesis.cancel();
    const utterance = new SpeechSynthesisUtterance(item.arabicText);
    utterance.lang = 'ar-SA';
    utterance.rate = 0.9;

    utterance.onend = () => setSpeakingId(null);
    utterance.onerror = () => setSpeakingId(null);

    setSpeakingId(item.id);
    window.speechSynthesis.speak(utterance);
    showToast('جاري تلاوة الحديث الشريف...');
  };

  const completedCount = Object.values(readHadiths).filter(Boolean).length;

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 py-6 sm:py-10 space-y-8 animate-in fade-in duration-300">
      
      {/* Toast Alert */}
      {toastMessage && (
        <div className="fixed top-20 left-1/2 -translate-x-1/2 z-50 bg-stone-900/95 dark:bg-stone-100/95 text-stone-100 dark:text-stone-900 px-5 py-2.5 rounded-2xl shadow-xl text-sm font-medium border border-amber-500/30 flex items-center gap-2 backdrop-blur-md">
          <Sparkles className="w-4 h-4 text-amber-400" />
          <span>{toastMessage}</span>
        </div>
      )}

      {/* Header Banner */}
      <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-amber-800 via-stone-900 to-amber-950 text-white p-6 sm:p-8 shadow-xl border border-amber-700/30">
        <div className="absolute top-0 right-0 w-80 h-80 bg-radial from-amber-400/20 to-transparent rounded-full blur-2xl pointer-events-none translate-x-1/3 -translate-y-1/3" />
        
        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="space-y-2 text-right">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-amber-500/20 border border-amber-400/30 text-amber-200 text-xs font-semibold">
              <BookOpen className="w-3.5 h-3.5" />
              <span>جوامع الكلم والسنة المطهرة</span>
            </div>
            <h1 className="font-amiri text-2xl sm:text-3xl lg:text-4xl font-bold tracking-wide">
              الأربعون النووية مع الشرح والفوائد
            </h1>
            <p className="text-amber-100/80 text-sm max-w-xl font-sans leading-relaxed">
              الأحاديث الجامعة التي عليها مدار الإسلام، مضبوطة بالشكل مع الشرح المستفيض والفوائد الإيمانية والعملية.
            </p>
          </div>

          {/* Quick Progress Badge */}
          <div className="flex items-center gap-3 shrink-0">
            <div className="flex flex-col items-center justify-center p-4 rounded-2xl bg-white/10 backdrop-blur-md border border-white/15 min-w-[90px]">
              <span className="text-xs text-amber-300 font-semibold">المقروء</span>
              <span className="text-2xl font-bold font-mono mt-0.5">
                {completedCount}/{NAWAWI_HADITHS.length}
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Search Input */}
      <div className="relative">
        <input
          type="text"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          placeholder="ابحث في الأحاديث الشريفة، الرواة، أو المعاني..."
          className="w-full pl-4 pr-11 py-3.5 rounded-2xl bg-white dark:bg-stone-900 border border-stone-200 dark:border-stone-800 text-stone-900 dark:text-stone-100 placeholder-stone-400 focus:outline-hidden focus:ring-2 focus:ring-amber-500/30 text-sm text-right transition-all shadow-xs"
        />
        <Search className="w-5 h-5 text-stone-400 absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none" />
      </div>

      {/* Categories Filter */}
      <div className="flex items-center gap-2 overflow-x-auto pb-1 scrollbar-none text-sm">
        {categories.map((cat) => {
          const isSelected = selectedCategory === cat;
          return (
            <button
              key={cat}
              onClick={() => setSelectedCategory(cat)}
              className={`px-4 py-2 rounded-2xl font-medium shrink-0 transition-all cursor-pointer border ${
                isSelected
                  ? 'bg-amber-700 text-white border-amber-600 shadow-sm'
                  : 'bg-white dark:bg-stone-900 text-stone-700 dark:text-stone-300 border-stone-200 dark:border-stone-800 hover:bg-amber-50 dark:hover:bg-stone-800'
              }`}
            >
              {cat === 'all' ? 'جميع الأحاديث' : cat}
            </button>
          );
        })}
      </div>

      {/* Hadiths List */}
      <div className="space-y-5">
        {filteredHadiths.map((item) => {
          const isExpanded = expandedId === item.id;
          const isRead = !!readHadiths[item.id];
          const isSpeaking = speakingId === item.id;

          return (
            <div
              key={item.id}
              className={`bg-white dark:bg-stone-900 rounded-3xl p-6 sm:p-7 border transition-all text-right space-y-4 shadow-sm hover:shadow-md ${
                isRead
                  ? 'border-amber-600/30 bg-amber-50/10 dark:bg-amber-950/10'
                  : 'border-stone-200 dark:border-stone-800'
              }`}
            >
              {/* Header */}
              <div className="flex items-center justify-between gap-3 border-b border-stone-100 dark:border-stone-800 pb-3">
                <div className="flex items-center gap-2">
                  <span className="w-7 h-7 rounded-xl bg-amber-600/15 text-amber-800 dark:text-amber-300 font-mono text-xs font-bold flex items-center justify-center">
                    {item.id}
                  </span>
                  <span className="text-xs px-2.5 py-0.5 rounded-full bg-stone-100 dark:bg-stone-800 text-stone-600 dark:text-stone-300">
                    {item.category}
                  </span>
                </div>

                <div className="flex items-center gap-1.5">
                  <button
                    onClick={() => handleSpeakHadith(item)}
                    title={isSpeaking ? 'إيقاف القراءة' : 'استماع صوتي'}
                    className={`p-2 rounded-xl transition-all cursor-pointer ${
                      isSpeaking
                        ? 'bg-amber-600 text-white'
                        : 'text-stone-400 hover:text-stone-700 dark:hover:text-stone-200 hover:bg-stone-100 dark:hover:bg-stone-800'
                    }`}
                  >
                    {isSpeaking ? <VolumeX className="w-4 h-4 animate-pulse" /> : <Volume2 className="w-4 h-4" />}
                  </button>

                  <button
                    onClick={() => handleCopyHadith(item)}
                    title="نسخ الحديث"
                    className="p-2 rounded-xl text-stone-400 hover:text-stone-700 dark:hover:text-stone-200 hover:bg-stone-100 dark:hover:bg-stone-800 transition-all cursor-pointer"
                  >
                    {copiedId === item.id ? <Check className="w-4 h-4 text-emerald-600" /> : <Copy className="w-4 h-4" />}
                  </button>

                  <button
                    onClick={() => toggleReadStatus(item.id)}
                    title={isRead ? 'إلغاء التحديد كمقروء' : 'تحديد كمقروء'}
                    className={`p-2 rounded-xl transition-all cursor-pointer ${
                      isRead
                        ? 'text-emerald-600 bg-emerald-50 dark:bg-emerald-950/40'
                        : 'text-stone-400 hover:text-stone-700 dark:hover:text-stone-200 hover:bg-stone-100 dark:hover:bg-stone-800'
                    }`}
                  >
                    <CheckCircle2 className="w-4 h-4" />
                  </button>
                </div>
              </div>

              {/* Title & Narrator */}
              <div className="space-y-1">
                <h3 className="font-amiri text-xl font-bold text-stone-900 dark:text-stone-100">
                  {item.title}
                </h3>
                <p className="text-xs text-amber-800 dark:text-amber-400 font-medium">
                  عن: {item.narrator}
                </p>
              </div>

              {/* Arabic Hadith Text */}
              <div className="p-4 sm:p-5 rounded-2xl bg-[#FCFAF6] dark:bg-[#16181F] border border-amber-900/10 dark:border-amber-500/10">
                <p className="font-amiri text-lg sm:text-2xl text-stone-900 dark:text-stone-100 leading-loose sm:leading-loose text-justify">
                  {item.arabicText}
                </p>
                <div className="text-xs text-stone-400 dark:text-stone-500 font-mono pt-3 border-t border-amber-900/5 dark:border-amber-500/5 mt-3">
                  تخريج الحديث: {item.source}
                </div>
              </div>

              {/* Expand / Collapse Button for Explanation */}
              <div className="pt-1">
                <button
                  onClick={() => setExpandedId(isExpanded ? null : item.id)}
                  className="flex items-center gap-2 text-xs font-bold text-amber-800 dark:text-amber-400 hover:underline cursor-pointer"
                >
                  <span>{isExpanded ? 'إخفاء الشرح والفوائد' : 'عرض الشرح والفوائد المستفادة'}</span>
                  {isExpanded ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
                </button>
              </div>

              {/* Explanation & Benefits */}
              {isExpanded && (
                <div className="p-5 rounded-2xl bg-amber-500/10 dark:bg-amber-950/30 border border-amber-500/20 space-y-3 animate-in fade-in duration-200">
                  <div className="space-y-1">
                    <h4 className="text-xs font-bold text-amber-900 dark:text-amber-300">
                      الشرح والبيان:
                    </h4>
                    <p className="text-sm text-stone-700 dark:text-stone-300 leading-relaxed font-sans">
                      {item.explanation}
                    </p>
                  </div>

                  <div className="space-y-1.5 pt-2 border-t border-amber-500/15">
                    <h4 className="text-xs font-bold text-amber-900 dark:text-amber-300">
                      الدروس والفوائد العملية:
                    </h4>
                    <ul className="space-y-1 text-xs sm:text-sm text-stone-700 dark:text-stone-300 list-disc list-inside">
                      {item.keyBenefits.map((benefit, bIdx) => (
                        <li key={bIdx} className="leading-relaxed">
                          {benefit}
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>
              )}
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
            <span>إهداء ثواب دراسة الأحاديث النبوية للمتوفين</span>
          </button>
        </div>
      )}

    </div>
  );
};
