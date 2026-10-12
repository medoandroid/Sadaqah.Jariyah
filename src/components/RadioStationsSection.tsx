import React, { useState, useEffect, useMemo } from 'react';
import {
  Radio,
  Search,
  Play,
  Pause,
  Heart,
  Share2,
  Sparkles,
  Volume2,
  Flame,
  Check,
  RefreshCw,
  SlidersHorizontal,
  Bookmark
} from 'lucide-react';
import { mp3QuranService } from '../services/mp3QuranService';
import { MP3QRadio } from '../types/mp3quran';
import { useAudio } from '../context/AudioContext';
import { storageService } from '../services/storageService';

interface RadioStationsSectionProps {
  showToast: (msg: string) => void;
}

export const RadioStationsSection: React.FC<RadioStationsSectionProps> = ({ showToast }) => {
  const { isPlaying, currentRadio, audioMode, playRadio, togglePlay } = useAudio();

  const [radios, setRadios] = useState<MP3QRadio[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [favoriteIds, setFavoriteIds] = useState<number[]>(() => {
    return storageService.get<number[]>('favorite_radio_ids', []);
  });

  // Fetch Radios
  useEffect(() => {
    let isMounted = true;
    setIsLoading(true);
    setErrorMsg(null);

    mp3QuranService.getRadios('ar')
      .then((data) => {
        if (!isMounted) return;
        setRadios(data);
        setIsLoading(false);
      })
      .catch((err) => {
        if (!isMounted) return;
        console.warn('Failed to load radios:', err);
        setErrorMsg('تعذر تحميل قائمة الإذاعات حالياً. تأكد من اتصال الإنترنت.');
        setIsLoading(false);
      });

    return () => {
      isMounted = false;
    };
  }, []);

  const handleToggleFavorite = (radioId: number, e: React.MouseEvent) => {
    e.stopPropagation();
    let updated: number[];
    if (favoriteIds.includes(radioId)) {
      updated = favoriteIds.filter((id) => id !== radioId);
      showToast('تمت إزالة الإذاعة من المفضلة');
    } else {
      updated = [...favoriteIds, radioId];
      showToast('تمت إضافة الإذاعة إلى المفضلة ❤️');
    }
    setFavoriteIds(updated);
    storageService.set('favorite_radio_ids', updated);
  };

  const handleShareRadio = (radio: MP3QRadio, e: React.MouseEvent) => {
    e.stopPropagation();
    const text = `استمع إلى (${radio.name}) بث مباشر على مدار الساعة عبر منصة صدقة جارية:\n${radio.url}`;
    if (navigator.share) {
      navigator.share({
        title: radio.name,
        text,
        url: radio.url,
      }).catch(() => {});
    } else {
      navigator.clipboard.writeText(text);
      showToast('تم نسخ رابط البث الإذاعي للمشاركة');
    }
  };

  const handlePlayStation = (radio: MP3QRadio) => {
    if (audioMode === 'radio' && currentRadio?.id === radio.id && isPlaying) {
      togglePlay();
    } else {
      playRadio(radio);
      showToast(`جاري الاتصال بإذاعة: ${radio.name}`);
    }
  };

  // Categorize radios dynamically
  const filteredRadios = useMemo(() => {
    return radios.filter((r) => {
      // Search
      const q = searchQuery.trim().toLowerCase();
      const matchSearch = !q || r.name.toLowerCase().includes(q);
      if (!matchSearch) return false;

      // Category
      if (selectedCategory === 'all') return true;
      if (selectedCategory === 'favorites') return favoriteIds.includes(r.id);

      const name = r.name.toLowerCase();
      if (selectedCategory === 'adhkar') {
        return (
          name.includes('أذكار') ||
          name.includes('رقية') ||
          name.includes('تكبير') ||
          name.includes('دعاء') ||
          name.includes('صباح') ||
          name.includes('مساء')
        );
      }
      if (selectedCategory === 'tafsir') {
        return (
          name.includes('تفسير') ||
          name.includes('سعدي') ||
          name.includes('طبري') ||
          name.includes('فتاوى') ||
          name.includes('سنة') ||
          name.includes('قصص')
        );
      }
      if (selectedCategory === 'reciters') {
        // Any specific reciter station
        return (
          !name.includes('أذكار') &&
          !name.includes('تفسير') &&
          !name.includes('فتاوى') &&
          !name.includes('رقية')
        );
      }
      return true;
    });
  }, [radios, searchQuery, selectedCategory, favoriteIds]);

  const categories = [
    { key: 'all', label: `كل الإذاعات (${radios.length})` },
    { key: 'favorites', label: `المفضلة (${favoriteIds.length})` },
    { key: 'reciters', label: 'إذاعات القراء' },
    { key: 'adhkar', label: 'الأذكار والرقية' },
    { key: 'tafsir', label: 'التفسير والعلوم' },
  ];

  return (
    <div className="space-y-6 text-right animate-in fade-in duration-200 select-none">
      
      {/* Top Banner & Search */}
      <div className="p-5 sm:p-6 rounded-3xl bg-gradient-to-br from-[#1C1A17] via-[#151311] to-[#0F0D0C] text-stone-100 border border-amber-900/40 shadow-xl space-y-4">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <span className="w-2.5 h-2.5 rounded-full bg-red-500 animate-pulse" />
              <h2 className="font-amiri text-2xl sm:text-3xl font-bold text-amber-200">
                إذاعات القرآن الكريم المباشرة (24/7)
              </h2>
            </div>
            <p className="text-xs sm:text-sm text-stone-400">
              أكثر من ١٧٠ إذاعة إسلامية متواصلة بجودة صوت عالية، تشمل كبار القراء، وتلاوات خاشعة، وأذكار اليوم والرقية الشرعية
            </p>
          </div>

          <div className="flex items-center gap-2 self-end sm:self-auto shrink-0">
            <span className="text-xs px-3 py-1.5 rounded-xl bg-amber-500/15 border border-amber-500/30 text-amber-300 font-bold font-mono">
              {radios.length} محطة بث
            </span>
          </div>
        </div>

        {/* Search & Categories Bar */}
        <div className="flex flex-col md:flex-row items-stretch md:items-center gap-3 pt-2 border-t border-stone-800">
          <div className="relative flex-1">
            <Search className="w-4 h-4 absolute right-3.5 top-1/2 -translate-y-1/2 text-stone-400" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="ابحث باسم الشيخ أو الإذاعة (مثل: عبدالباسط، الحصري، الأذكار...)"
              className="w-full pr-10 pl-4 py-2.5 text-xs sm:text-sm bg-stone-900/90 border border-stone-750 rounded-2xl focus:outline-hidden focus:border-amber-500 text-stone-100 placeholder:text-stone-500 transition-colors"
            />
          </div>

          {/* Category Chips */}
          <div className="flex items-center gap-1.5 overflow-x-auto pb-1 scrollbar-none">
            {categories.map((c) => {
              const isSelected = selectedCategory === c.key;
              return (
                <button
                  key={c.key}
                  onClick={() => setSelectedCategory(c.key)}
                  className={`px-3 py-1.5 rounded-xl text-xs font-semibold whitespace-nowrap transition-all cursor-pointer shrink-0 ${
                    isSelected
                      ? 'bg-amber-600 text-white shadow-xs'
                      : 'bg-stone-850 hover:bg-stone-800 text-stone-300 border border-stone-750'
                  }`}
                >
                  {c.label}
                </button>
              );
            })}
          </div>
        </div>
      </div>

      {/* Loading state */}
      {isLoading && (
        <div className="p-12 text-center rounded-3xl bg-white dark:bg-stone-900 border border-stone-200 dark:border-stone-800 space-y-3">
          <div className="w-8 h-8 border-3 border-amber-600 border-t-transparent rounded-full animate-spin mx-auto" />
          <p className="text-xs text-stone-500 dark:text-stone-400 font-medium">
            جاري جلب شبكة الإذاعات المباشرة من خوادم MP3Quran الرسمية...
          </p>
        </div>
      )}

      {/* Error state */}
      {errorMsg && !isLoading && (
        <div className="p-8 text-center rounded-3xl bg-amber-50 dark:bg-stone-900 border border-amber-200 dark:border-stone-800 space-y-3">
          <p className="text-sm text-amber-900 dark:text-amber-200">{errorMsg}</p>
          <button
            onClick={() => window.location.reload()}
            className="px-4 py-2 rounded-xl bg-amber-700 text-white text-xs font-bold transition hover:bg-amber-800 cursor-pointer"
          >
            إعادة المحاولة
          </button>
        </div>
      )}

      {/* Empty State */}
      {!isLoading && !errorMsg && filteredRadios.length === 0 && (
        <div className="p-12 text-center rounded-3xl bg-white dark:bg-stone-900 border border-stone-200 dark:border-stone-800 space-y-2">
          <Radio className="w-8 h-8 text-stone-400 mx-auto" />
          <p className="text-sm font-bold text-stone-700 dark:text-stone-300">
            لم نجد إذاعات مطابقة لبحثك
          </p>
          <p className="text-xs text-stone-400">
            جرّب البحث باسم قارئ آخر أو اختر تصنيف "كل الإذاعات"
          </p>
        </div>
      )}

      {/* Radio Cards Grid */}
      {!isLoading && !errorMsg && filteredRadios.length > 0 && (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-4">
          {filteredRadios.map((radio) => {
            const isThisRadioPlaying =
              audioMode === 'radio' && currentRadio?.id === radio.id && isPlaying;
            const isThisRadioActive =
              audioMode === 'radio' && currentRadio?.id === radio.id;
            const isFav = favoriteIds.includes(radio.id);

            return (
              <div
                key={radio.id}
                onClick={() => handlePlayStation(radio)}
                className={`p-4 sm:p-5 rounded-2xl border transition-all cursor-pointer flex flex-col justify-between gap-3 group relative overflow-hidden ${
                  isThisRadioActive
                    ? 'bg-amber-50/80 dark:bg-stone-850 border-amber-500/70 shadow-md ring-1 ring-amber-500/30'
                    : 'bg-white dark:bg-stone-900/90 border-stone-200/90 dark:border-stone-800 hover:border-amber-400/60 shadow-2xs hover:shadow-md'
                }`}
              >
                {/* Header row: Status + Name + Actions */}
                <div className="flex items-start justify-between gap-2">
                  <div className="flex items-center gap-2.5 min-w-0">
                    {/* Play / Pulse Circle */}
                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        handlePlayStation(radio);
                      }}
                      className={`w-10 h-10 rounded-2xl flex items-center justify-center shrink-0 transition-transform active:scale-95 cursor-pointer shadow-xs ${
                        isThisRadioPlaying
                          ? 'bg-amber-600 text-white shadow-amber-500/30'
                          : 'bg-stone-100 dark:bg-stone-800 text-stone-700 dark:text-stone-200 group-hover:bg-amber-100 dark:group-hover:bg-stone-750 group-hover:text-amber-800 dark:group-hover:text-amber-300'
                      }`}
                      title={isThisRadioPlaying ? 'إيقاف مؤقت' : 'تشغيل الإذاعة'}
                    >
                      {isThisRadioPlaying ? (
                        <Pause className="w-4 h-4 fill-current" />
                      ) : (
                        <Play className="w-4 h-4 fill-current ml-0.5" />
                      )}
                    </button>

                    <div className="min-w-0">
                      <h3 className="font-amiri text-base sm:text-lg font-bold text-stone-900 dark:text-stone-100 truncate group-hover:text-amber-900 dark:group-hover:text-amber-300 transition-colors leading-snug">
                        {radio.name}
                      </h3>
                      <div className="flex items-center gap-1.5 text-[11px] text-stone-500 dark:text-stone-400 mt-0.5">
                        <span className="w-1.5 h-1.5 rounded-full bg-red-500 animate-pulse" />
                        <span>بث مباشر 24/7</span>
                      </div>
                    </div>
                  </div>

                  {/* Favorite & Share Buttons */}
                  <div className="flex items-center gap-1 shrink-0">
                    <button
                      type="button"
                      onClick={(e) => handleToggleFavorite(radio.id, e)}
                      className={`p-1.5 rounded-xl transition cursor-pointer ${
                        isFav
                          ? 'text-red-500 bg-red-50 dark:bg-red-950/40'
                          : 'text-stone-400 hover:text-stone-700 dark:hover:text-stone-200 hover:bg-stone-100 dark:hover:bg-stone-800'
                      }`}
                      title={isFav ? 'إزالة من المفضلة' : 'إضافة إلى المفضلة'}
                    >
                      <Heart className={`w-4 h-4 ${isFav ? 'fill-current' : ''}`} />
                    </button>

                    <button
                      type="button"
                      onClick={(e) => handleShareRadio(radio, e)}
                      className="p-1.5 rounded-xl text-stone-400 hover:text-stone-700 dark:hover:text-stone-200 hover:bg-stone-100 dark:hover:bg-stone-800 transition cursor-pointer"
                      title="مشاركة رابط الإذاعة"
                    >
                      <Share2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>

                {/* Bottom live indicator */}
                <div className="flex items-center justify-between pt-2 border-t border-stone-100 dark:border-stone-800/80 text-[11px] text-stone-500 dark:text-stone-400">
                  <span className="font-mono text-[10px]">mp3quran.net/radio</span>
                  <span className={`font-semibold ${isThisRadioPlaying ? 'text-amber-600 dark:text-amber-400 font-bold' : ''}`}>
                    {isThisRadioPlaying ? '🔊 جاري الاستماع الآن' : 'انقر للاستماع ↗'}
                  </span>
                </div>

              </div>
            );
          })}
        </div>
      )}

    </div>
  );
};
