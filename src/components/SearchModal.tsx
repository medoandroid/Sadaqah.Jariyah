import React, { useState, useMemo } from 'react';
import { Search, X, BookOpen, Flame, CircleDot, ArrowRight, Sparkles, Clock, Tv, ShieldCheck } from 'lucide-react';
import { ALL_SURAHS } from '../data/quranMeta';
import { DUAS_LIST } from '../data/duas';
import { ADHKAR_LIST } from '../data/adhkar';
import { ASMA_AL_HUSNA } from '../data/asmaAlHusna';
import { NAWAWI_HADITHS } from '../data/hadithData';
import { RUQYAH_ITEMS } from '../data/ruqyahData';

interface SearchModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSelectSurah: (surahNumber: number) => void;
  onNavigateTab: (tab: string) => void;
}

export const SearchModal: React.FC<SearchModalProps> = ({
  isOpen,
  onClose,
  onSelectSurah,
  onNavigateTab,
}) => {
  const [query, setQuery] = useState('');

  const filteredSurahs = useMemo(() => {
    if (!query.trim()) return ALL_SURAHS.slice(0, 6);
    const q = query.trim().toLowerCase();
    return ALL_SURAHS.filter(
      (s) =>
        s.name.includes(q) ||
        s.englishName.toLowerCase().includes(q) ||
        String(s.number) === q
    ).slice(0, 8);
  }, [query]);

  const filteredAsma = useMemo(() => {
    if (!query.trim()) return [];
    const q = query.trim().toLowerCase();
    return ASMA_AL_HUSNA.filter(
      (item) =>
        item.name.includes(q) ||
        item.meaning.includes(q) ||
        item.transliteration.toLowerCase().includes(q)
    ).slice(0, 4);
  }, [query]);

  const filteredDuas = useMemo(() => {
    if (!query.trim()) return [];
    const q = query.trim().toLowerCase();
    return DUAS_LIST.filter(
      (d) =>
        d.title.toLowerCase().includes(q) ||
        d.arabic.toLowerCase().includes(q) ||
        d.categoryLabel.toLowerCase().includes(q)
    ).slice(0, 4);
  }, [query]);

  const filteredAdhkar = useMemo(() => {
    if (!query.trim()) return [];
    const q = query.trim().toLowerCase();
    return ADHKAR_LIST.filter(
      (a) => a.text.toLowerCase().includes(q) || (a.virtue && a.virtue.toLowerCase().includes(q))
    ).slice(0, 4);
  }, [query]);

  const filteredHadiths = useMemo(() => {
    if (!query.trim()) return [];
    const q = query.trim().toLowerCase();
    return NAWAWI_HADITHS.filter(
      (h) =>
        h.title.toLowerCase().includes(q) ||
        h.arabicText.toLowerCase().includes(q) ||
        h.explanation.toLowerCase().includes(q)
    ).slice(0, 4);
  }, [query]);

  const filteredRuqyah = useMemo(() => {
    if (!query.trim()) return [];
    const q = query.trim().toLowerCase();
    return RUQYAH_ITEMS.filter(
      (r) =>
        r.title.toLowerCase().includes(q) ||
        r.arabicText.toLowerCase().includes(q) ||
        r.virtue.toLowerCase().includes(q)
    ).slice(0, 4);
  }, [query]);

  if (!isOpen) return null;

  return (
    <div
      className="fixed inset-0 z-50 flex items-start justify-center pt-16 sm:pt-24 px-4 bg-stone-950/70 backdrop-blur-sm"
      onClick={onClose}
    >
      <div
        className="w-full max-w-2xl bg-[#FAF9F6] dark:bg-[#1A1D24] border border-stone-300/80 dark:border-amber-500/20 rounded-2xl shadow-2xl overflow-hidden animate-in fade-in zoom-in-95 duration-200"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Search Input Bar */}
        <div className="flex items-center px-4 py-3.5 border-b border-stone-200 dark:border-stone-800 bg-white dark:bg-[#14161B]">
          <Search className="w-5 h-5 text-amber-600 dark:text-amber-400 ml-3 shrink-0" />
          <input
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === 'Escape') onClose();
            }}
            placeholder="ابحث عن سورة، اسم من أسماء الله، دعاء، أو ذكر..."
            className="w-full bg-transparent text-base text-stone-900 dark:text-stone-100 placeholder:text-stone-400 dark:placeholder:text-stone-500 focus:outline-hidden"
            autoFocus
          />
          {query ? (
            <button
              onClick={() => setQuery('')}
              className="p-1 text-stone-400 hover:text-stone-700 dark:hover:text-stone-200 ml-2 cursor-pointer"
            >
              <X className="w-4 h-4" />
            </button>
          ) : null}
          <button
            onClick={onClose}
            className="text-xs px-2.5 py-1 text-stone-500 dark:text-stone-400 hover:text-stone-800 dark:hover:text-stone-200 bg-stone-100 dark:bg-stone-800 rounded-md mr-2 cursor-pointer transition-colors"
          >
            إغلاق
          </button>
        </div>

        {/* Quick Shortcuts Pill Bar */}
        <div className="flex items-center gap-2 px-4 py-2 bg-stone-50/80 dark:bg-stone-900/60 border-b border-stone-200/60 dark:border-stone-800 text-xs overflow-x-auto scrollbar-none">
          <span className="text-[11px] text-stone-400 shrink-0">انتقال سريع:</span>
          <button
            onClick={() => {
              onNavigateTab('owner_sadaqah');
              onClose();
            }}
            className="flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-amber-500/10 hover:bg-amber-500/20 text-amber-900 dark:text-amber-300 font-semibold transition shrink-0 cursor-pointer"
          >
            <Sparkles className="w-3.5 h-3.5 text-amber-600 dark:text-amber-400" />
            <span>صدقة صاحب المنصة</span>
          </button>
          <button
            onClick={() => {
              onNavigateTab('prayer');
              onClose();
            }}
            className="flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-amber-500/10 hover:bg-amber-500/20 text-amber-900 dark:text-amber-300 font-semibold transition shrink-0 cursor-pointer"
          >
            <Clock className="w-3.5 h-3.5 text-amber-600 dark:text-amber-400" />
            <span>مواقيت الصلاة</span>
          </button>
          <button
            onClick={() => {
              onNavigateTab('haramain');
              onClose();
            }}
            className="flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-red-500/10 hover:bg-red-500/20 text-red-900 dark:text-red-300 font-semibold transition shrink-0 cursor-pointer"
          >
            <Tv className="w-3.5 h-3.5 text-red-600 dark:text-red-400" />
            <span>بث الحرمين</span>
          </button>
          <button
            onClick={() => {
              onNavigateTab('mushaf');
              onClose();
            }}
            className="flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-stone-200/70 dark:bg-stone-800 hover:bg-stone-300 dark:hover:bg-stone-700 text-stone-700 dark:text-stone-300 font-semibold transition shrink-0 cursor-pointer"
          >
            <BookOpen className="w-3.5 h-3.5 text-amber-600 dark:text-amber-400" />
            <span>المصحف الورقي</span>
          </button>
          <button
            onClick={() => {
              onNavigateTab('khatmah');
              onClose();
            }}
            className="flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-stone-200/70 dark:bg-stone-800 hover:bg-stone-300 dark:hover:bg-stone-700 text-stone-700 dark:text-stone-300 font-semibold transition shrink-0 cursor-pointer"
          >
            <Sparkles className="w-3.5 h-3.5 text-amber-600 dark:text-amber-400" />
            <span>الختمة المهداة</span>
          </button>
        </div>

        {/* Results Area */}
        <div className="max-h-[60vh] overflow-y-auto p-4 space-y-5 text-right">
          
          {/* Surahs Section */}
          <div>
            <div className="flex items-center justify-between text-xs font-semibold text-stone-500 dark:text-stone-400 mb-2 px-1">
              <span className="flex items-center gap-1.5">
                <BookOpen className="w-3.5 h-3.5 text-amber-600 dark:text-amber-400" />
                <span>سور القرآن الكريم</span>
              </span>
              <span className="text-[11px] text-stone-400 dark:text-stone-500">({filteredSurahs.length})</span>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
              {filteredSurahs.map((surah) => (
                <button
                  key={surah.number}
                  onClick={() => {
                    onSelectSurah(surah.number);
                    onNavigateTab('quran');
                    onClose();
                  }}
                  className="flex items-center justify-between p-2.5 rounded-xl bg-white dark:bg-stone-900/90 hover:bg-amber-50/70 dark:hover:bg-amber-950/30 border border-stone-200/70 dark:border-stone-800 hover:border-amber-300 dark:hover:border-amber-700/50 transition-all text-right cursor-pointer group"
                >
                  <div className="flex items-center gap-2.5">
                    <span className="w-7 h-7 rounded-md bg-stone-100 dark:bg-stone-800 text-stone-600 dark:text-stone-300 font-mono text-xs flex items-center justify-center group-hover:bg-amber-100 dark:group-hover:bg-amber-900/50 group-hover:text-amber-900 dark:group-hover:text-amber-200 transition-colors">
                      {surah.number}
                    </span>
                    <div>
                      <div className="font-amiri text-base font-bold text-stone-900 dark:text-stone-100 group-hover:text-amber-900 dark:group-hover:text-amber-300">
                        سورة {surah.name}
                      </div>
                      <div className="text-[11px] text-stone-500 dark:text-stone-400">
                        {surah.revelationArabic} · {surah.numberOfAyahs} آية · ص {surah.startPage}
                      </div>
                    </div>
                  </div>
                  <ArrowRight className="w-4 h-4 text-stone-400 dark:text-stone-500 group-hover:text-amber-600 dark:group-hover:text-amber-400 rotate-180 transition-transform group-hover:-translate-x-1" />
                </button>
              ))}
            </div>
          </div>

          {/* Asma Al-Husna Section */}
          {filteredAsma.length > 0 && (
            <div>
              <div className="flex items-center gap-1.5 text-xs font-semibold text-stone-500 dark:text-stone-400 mb-2 px-1">
                <Sparkles className="w-3.5 h-3.5 text-amber-600 dark:text-amber-400" />
                <span>أسماء الله الحسنى</span>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                {filteredAsma.map((item) => (
                  <button
                    key={item.number}
                    onClick={() => {
                      onNavigateTab('asma');
                      onClose();
                    }}
                    className="p-3 rounded-xl bg-white dark:bg-stone-900/90 hover:bg-amber-50/70 dark:hover:bg-amber-950/30 border border-stone-200/70 dark:border-stone-800 transition-all text-right cursor-pointer group flex items-start gap-2.5"
                  >
                    <span className="w-8 h-8 rounded-lg bg-amber-100/70 dark:bg-amber-950/60 text-amber-900 dark:text-amber-300 font-bold text-xs flex items-center justify-center shrink-0">
                      {item.number}
                    </span>
                    <div>
                      <div className="font-amiri text-base font-bold text-stone-900 dark:text-stone-100 group-hover:text-amber-900 dark:group-hover:text-amber-300">
                        {item.name}
                      </div>
                      <div className="text-xs text-stone-600 dark:text-stone-400 line-clamp-1">
                        {item.meaning}
                      </div>
                    </div>
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Duas Section */}
          {filteredDuas.length > 0 && (
            <div>
              <div className="flex items-center gap-1.5 text-xs font-semibold text-stone-500 dark:text-stone-400 mb-2 px-1">
                <Flame className="w-3.5 h-3.5 text-amber-600 dark:text-amber-400" />
                <span>الأدعية المأثورة للمتوفين</span>
              </div>
              <div className="space-y-2">
                {filteredDuas.map((dua) => (
                  <button
                    key={dua.id}
                    onClick={() => {
                      onNavigateTab('duas');
                      onClose();
                    }}
                    className="w-full text-right p-3 rounded-xl bg-white dark:bg-stone-900/90 hover:bg-amber-50/70 dark:hover:bg-amber-950/30 border border-stone-200/70 dark:border-stone-800 transition-all cursor-pointer block group"
                  >
                    <div className="text-sm font-semibold text-stone-900 dark:text-stone-100 group-hover:text-amber-900 dark:group-hover:text-amber-300 mb-1">
                      {dua.title}
                    </div>
                    <div className="text-xs text-stone-600 dark:text-stone-400 line-clamp-2 font-amiri leading-relaxed">
                      {dua.arabic}
                    </div>
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Adhkar Section */}
          {filteredAdhkar.length > 0 && (
            <div>
              <div className="flex items-center gap-1.5 text-xs font-semibold text-stone-500 dark:text-stone-400 mb-2 px-1">
                <CircleDot className="w-3.5 h-3.5 text-amber-600 dark:text-amber-400" />
                <span>الأذكار والتسبيح</span>
              </div>
              <div className="space-y-2">
                {filteredAdhkar.map((dhikr) => (
                  <button
                    key={dhikr.id}
                    onClick={() => {
                      onNavigateTab('adhkar');
                      onClose();
                    }}
                    className="w-full text-right p-3 rounded-xl bg-white dark:bg-stone-900/90 hover:bg-amber-50/70 dark:hover:bg-amber-950/30 border border-stone-200/70 dark:border-stone-800 transition-all cursor-pointer block group"
                  >
                    <div className="text-xs text-stone-700 dark:text-stone-300 line-clamp-2 font-amiri leading-relaxed">
                      {dhikr.text}
                    </div>
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Hadiths Section */}
          {filteredHadiths.length > 0 && (
            <div>
              <div className="flex items-center gap-1.5 text-xs font-semibold text-stone-500 dark:text-stone-400 mb-2 px-1">
                <BookOpen className="w-3.5 h-3.5 text-amber-600 dark:text-amber-400" />
                <span>الأربعون النووية والسنة</span>
              </div>
              <div className="space-y-2">
                {filteredHadiths.map((h) => (
                  <button
                    key={h.id}
                    onClick={() => {
                      onNavigateTab('hadith');
                      onClose();
                    }}
                    className="w-full text-right p-3 rounded-xl bg-white dark:bg-stone-900/90 hover:bg-amber-50/70 dark:hover:bg-amber-950/30 border border-stone-200/70 dark:border-stone-800 transition-all cursor-pointer block group"
                  >
                    <div className="text-sm font-semibold text-stone-900 dark:text-stone-100 group-hover:text-amber-900 dark:group-hover:text-amber-300 mb-0.5">
                      الحديث {h.id}: {h.title}
                    </div>
                    <div className="text-xs text-stone-600 dark:text-stone-400 line-clamp-2 font-amiri leading-relaxed">
                      {h.arabicText}
                    </div>
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Ruqyah Section */}
          {filteredRuqyah.length > 0 && (
            <div>
              <div className="flex items-center gap-1.5 text-xs font-semibold text-stone-500 dark:text-stone-400 mb-2 px-1">
                <ShieldCheck className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400" />
                <span>الرقية الشرعية وأدعية الشفاء</span>
              </div>
              <div className="space-y-2">
                {filteredRuqyah.map((r) => (
                  <button
                    key={r.id}
                    onClick={() => {
                      onNavigateTab('ruqyah');
                      onClose();
                    }}
                    className="w-full text-right p-3 rounded-xl bg-white dark:bg-stone-900/90 hover:bg-emerald-50/70 dark:hover:bg-emerald-950/30 border border-stone-200/70 dark:border-stone-800 transition-all cursor-pointer block group"
                  >
                    <div className="text-sm font-semibold text-stone-900 dark:text-stone-100 group-hover:text-emerald-800 dark:group-hover:text-emerald-300 mb-0.5">
                      {r.title}
                    </div>
                    <div className="text-xs text-stone-600 dark:text-stone-400 line-clamp-2 font-amiri leading-relaxed">
                      {r.arabicText}
                    </div>
                  </button>
                ))}
              </div>
            </div>
          )}

          {query && filteredSurahs.length === 0 && filteredAsma.length === 0 && filteredDuas.length === 0 && filteredHadiths.length === 0 && filteredRuqyah.length === 0 && (
            <div className="py-8 text-center text-stone-500 dark:text-stone-400 text-sm">
              لم نعثر على نتائج مطابقة لـ "{query}". جرب البحث باسم سورة أو اسم من أسماء الله الحسنى أو ذكر آخر.
            </div>
          )}

        </div>

      </div>
    </div>
  );
};
