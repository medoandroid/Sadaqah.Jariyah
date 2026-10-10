import React, { useState, useMemo, useEffect } from 'react';
import { Search, X, Check, BookOpen, Sparkles } from 'lucide-react';
import { ALL_SURAHS } from '../data/quranMeta';
import { SurahMeta } from '../types';
import { toArabicDigits } from './IslamicDecoration';

export interface SurahPickerModalProps {
  isOpen: boolean;
  onClose: () => void;
  selectedSurahNumber: number;
  onSelectSurah: (surahNumber: number) => void;
}

const POPULAR_SURAH_NUMBERS = [1, 2, 18, 36, 55, 56, 67, 78, 112, 113, 114];

export const SurahPickerModal: React.FC<SurahPickerModalProps> = ({
  isOpen,
  onClose,
  selectedSurahNumber,
  onSelectSurah,
}) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [activeCategory, setActiveCategory] = useState<'all' | 'popular' | 'meccan' | 'medinan'>('all');

  // Handle ESC key
  useEffect(() => {
    if (!isOpen) return;
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  const filteredSurahs = useMemo(() => {
    let list: SurahMeta[] = ALL_SURAHS;

    if (activeCategory === 'popular') {
      list = list.filter((s) => POPULAR_SURAH_NUMBERS.includes(s.number));
    } else if (activeCategory === 'meccan') {
      list = list.filter((s) => s.revelationType === 'Meccan');
    } else if (activeCategory === 'medinan') {
      list = list.filter((s) => s.revelationType === 'Medinan');
    }

    if (!searchQuery.trim()) return list;

    const q = searchQuery.trim().toLowerCase();
    return list.filter(
      (s) =>
        s.name.toLowerCase().includes(q) ||
        s.englishName.toLowerCase().includes(q) ||
        s.englishNameTranslation.toLowerCase().includes(q) ||
        String(s.number).includes(q) ||
        toArabicDigits(s.number).includes(q) ||
        `سورة ${s.name}`.toLowerCase().includes(q)
    );
  }, [searchQuery, activeCategory]);

  if (!isOpen) return null;

  return (
    <div
      className="fixed inset-0 z-60 flex items-center justify-center p-3 sm:p-5 bg-stone-950/80 backdrop-blur-sm animate-in fade-in duration-200"
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
    >
      <div className="w-full max-w-2xl max-h-[85vh] bg-white dark:bg-stone-900 rounded-3xl shadow-2xl border border-stone-200 dark:border-stone-800 flex flex-col overflow-hidden text-right">
        {/* Header */}
        <div className="p-4 sm:p-5 border-b border-stone-100 dark:border-stone-800 shrink-0 space-y-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2.5">
              <div className="p-2 rounded-xl bg-amber-500/10 text-amber-700 dark:text-amber-400 border border-amber-500/20">
                <BookOpen className="w-5 h-5" />
              </div>
              <div>
                <h4 className="font-amiri text-xl font-bold text-stone-900 dark:text-stone-100">
                  اختيار السورة الكريمة
                </h4>
                <p className="text-xs text-stone-500 dark:text-stone-400">
                  اختر السورة لتصميم ومشاركة آياتها العطرة
                </p>
              </div>
            </div>

            <button
              type="button"
              onClick={onClose}
              className="p-2 rounded-xl text-stone-400 hover:text-stone-700 dark:hover:text-stone-200 hover:bg-stone-100 dark:hover:bg-stone-800 transition-colors cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Search Bar */}
          <div className="relative">
            <Search className="w-4 h-4 text-stone-400 absolute right-3.5 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="ابحث باسم السورة، رقمها، أو نوعها (مكية/مدنية)..."
              autoFocus
              className="w-full pr-10 pl-9 py-2.5 rounded-xl bg-stone-50 dark:bg-stone-800/80 border border-stone-200 dark:border-stone-700 text-stone-900 dark:text-stone-100 text-xs placeholder:text-stone-400 focus:outline-hidden focus:border-amber-500 font-medium"
            />
            {searchQuery && (
              <button
                type="button"
                onClick={() => setSearchQuery('')}
                className="absolute left-3 top-1/2 -translate-y-1/2 text-stone-400 hover:text-stone-600 dark:hover:text-stone-200 cursor-pointer"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            )}
          </div>

          {/* Categories */}
          <div className="flex items-center gap-1.5 flex-wrap text-xs">
            <button
              type="button"
              onClick={() => setActiveCategory('all')}
              className={`px-3 py-1 rounded-xl font-semibold transition-all cursor-pointer ${
                activeCategory === 'all'
                  ? 'bg-amber-800 text-white shadow-xs'
                  : 'bg-stone-100 dark:bg-stone-800 text-stone-600 dark:text-stone-400 hover:bg-stone-200 dark:hover:bg-stone-750'
              }`}
            >
              جميع السور (١١٤)
            </button>
            <button
              type="button"
              onClick={() => setActiveCategory('popular')}
              className={`px-3 py-1 rounded-xl font-semibold transition-all cursor-pointer flex items-center gap-1 ${
                activeCategory === 'popular'
                  ? 'bg-amber-800 text-white shadow-xs'
                  : 'bg-stone-100 dark:bg-stone-800 text-stone-600 dark:text-stone-400 hover:bg-stone-200 dark:hover:bg-stone-750'
              }`}
            >
              <Sparkles className="w-3 h-3 text-amber-500" />
              <span>الأكثر تلاوة</span>
            </button>
            <button
              type="button"
              onClick={() => setActiveCategory('meccan')}
              className={`px-3 py-1 rounded-xl font-semibold transition-all cursor-pointer ${
                activeCategory === 'meccan'
                  ? 'bg-amber-800 text-white shadow-xs'
                  : 'bg-stone-100 dark:bg-stone-800 text-stone-600 dark:text-stone-400 hover:bg-stone-200 dark:hover:bg-stone-750'
              }`}
            >
              المكية (٨٦)
            </button>
            <button
              type="button"
              onClick={() => setActiveCategory('medinan')}
              className={`px-3 py-1 rounded-xl font-semibold transition-all cursor-pointer ${
                activeCategory === 'medinan'
                  ? 'bg-amber-800 text-white shadow-xs'
                  : 'bg-stone-100 dark:bg-stone-800 text-stone-600 dark:text-stone-400 hover:bg-stone-200 dark:hover:bg-stone-750'
              }`}
            >
              المدنية (٢٨)
            </button>
          </div>
        </div>

        {/* Surahs Grid */}
        <div
          className="flex-1 min-h-0 overflow-y-auto p-4 sm:p-5 space-y-2 overscroll-contain"
          style={{ scrollbarGutter: 'stable' }}
        >
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
            {filteredSurahs.map((surah) => {
              const isSelected = surah.number === selectedSurahNumber;
              return (
                <button
                  key={surah.number}
                  type="button"
                  onClick={() => {
                    onSelectSurah(surah.number);
                    onClose();
                  }}
                  className={`p-3 rounded-2xl border text-right transition-all flex items-center justify-between gap-3 cursor-pointer group ${
                    isSelected
                      ? 'bg-amber-50 dark:bg-amber-950/40 border-amber-600 dark:border-amber-500 ring-2 ring-amber-500/20 shadow-xs'
                      : 'bg-white dark:bg-stone-850 border-stone-200/90 dark:border-stone-750 hover:border-amber-400 dark:hover:border-stone-600 hover:bg-stone-50 dark:hover:bg-stone-800'
                  }`}
                >
                  <div className="flex items-center gap-3 min-w-0">
                    {/* Number Badge */}
                    <div
                      className={`w-9 h-9 rounded-xl flex items-center justify-center font-bold text-xs shrink-0 transition-colors ${
                        isSelected
                          ? 'bg-amber-800 text-white shadow-xs'
                          : 'bg-stone-100 dark:bg-stone-800 text-stone-700 dark:text-stone-300 group-hover:bg-amber-100 group-hover:text-amber-900'
                      }`}
                    >
                      {toArabicDigits(surah.number)}
                    </div>

                    {/* Surah Name & Meta */}
                    <div className="min-w-0">
                      <div className="flex items-center gap-2">
                        <h5 className="font-amiri text-lg font-bold text-stone-900 dark:text-stone-100 truncate">
                          سُورَةُ {surah.name}
                        </h5>
                        {isSelected && (
                          <span className="p-0.5 rounded-full bg-emerald-100 dark:bg-emerald-950 text-emerald-600 dark:text-emerald-400">
                            <Check className="w-3.5 h-3.5" />
                          </span>
                        )}
                      </div>
                      <div className="flex items-center gap-2 text-[11px] text-stone-500 dark:text-stone-400">
                        <span
                          className={`px-1.5 py-0.2 rounded font-medium ${
                            surah.revelationType === 'Meccan'
                              ? 'bg-amber-100/70 dark:bg-amber-950/70 text-amber-900 dark:text-amber-300'
                              : 'bg-emerald-100/70 dark:bg-emerald-950/70 text-emerald-900 dark:text-emerald-300'
                          }`}
                        >
                          {surah.revelationArabic}
                        </span>
                        <span>·</span>
                        <span>{toArabicDigits(surah.numberOfAyahs)} آية</span>
                        <span>·</span>
                        <span>صفحة {toArabicDigits(surah.startPage)}</span>
                      </div>
                    </div>
                  </div>

                  <span className="text-[11px] text-stone-400 font-sans group-hover:text-amber-700 dark:group-hover:text-amber-400 transition-colors shrink-0">
                    {surah.englishName}
                  </span>
                </button>
              );
            })}
          </div>

          {filteredSurahs.length === 0 && (
            <div className="py-12 text-center text-xs text-stone-400">
              لا توجد سورة مطابقة لبحثك "{searchQuery}"
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
