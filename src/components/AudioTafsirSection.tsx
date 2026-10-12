import React, { useState, useEffect, useMemo } from 'react';
import {
  BookOpen,
  Search,
  Play,
  Pause,
  Volume2,
  Share2,
  Download,
  Sparkles,
  RotateCcw
} from 'lucide-react';
import { mp3QuranService } from '../services/mp3QuranService';
import { MP3QSurahTafsirItem, MP3QTafsirBook } from '../types/mp3quran';
import { ALL_SURAHS } from '../data/quranMeta';
import { useAudio } from '../context/AudioContext';

interface AudioTafsirSectionProps {
  showToast: (msg: string) => void;
}

export const AudioTafsirSection: React.FC<AudioTafsirSectionProps> = ({ showToast }) => {
  const { isPlaying, currentTafsir, audioMode, playTafsir, togglePlay } = useAudio();

  const [tafasirBooks, setTafasirBooks] = useState<MP3QTafsirBook[]>([]);
  const [selectedBookId, setSelectedBookId] = useState<number>(1);
  const [tafsirItems, setTafsirItems] = useState<MP3QSurahTafsirItem[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  // Load books & items
  useEffect(() => {
    let isMounted = true;
    setIsLoading(true);
    setErrorMsg(null);

    Promise.all([
      mp3QuranService.getTafasir('ar'),
      mp3QuranService.getSurahTafsir(selectedBookId, undefined, 'ar'),
    ])
      .then(([books, items]) => {
        if (!isMounted) return;
        setTafasirBooks(books);
        setTafsirItems(items);
        setIsLoading(false);
      })
      .catch((err) => {
        if (!isMounted) return;
        console.warn('Failed to load tafsir:', err);
        setErrorMsg('تعذر تحميل بيانات التفسير الصوتي حالياً.');
        setIsLoading(false);
      });

    return () => {
      isMounted = false;
    };
  }, [selectedBookId]);

  // Combine items with ALL_SURAHS
  const enrichedSurahs = useMemo(() => {
    const itemMap = new Map<number, MP3QSurahTafsirItem>();
    tafsirItems.forEach((item) => {
      itemMap.set(item.sura_id, item);
    });

    return ALL_SURAHS.map((surah) => {
      const tafsir = itemMap.get(surah.number) || {
        id: surah.number,
        tafsir_id: selectedBookId,
        name: `تفسير سورة ${surah.name}`,
        url: `https://server17.mp3quran.net/tafseer/tabri/${String(surah.number).padStart(3, '0')}.mp3`,
        sura_id: surah.number
      };
      return { surah, tafsir };
    });
  }, [tafsirItems, selectedBookId]);

  // Filter surahs
  const filtered = useMemo(() => {
    const q = searchQuery.trim().toLowerCase();
    if (!q) return enrichedSurahs;
    return enrichedSurahs.filter(
      ({ surah }) =>
        surah.name.includes(q) ||
        surah.englishName.toLowerCase().includes(q) ||
        String(surah.number) === q
    );
  }, [enrichedSurahs, searchQuery]);

  const handlePlayTafsir = (surahNumber: number, surahName: string, url: string) => {
    if (audioMode === 'tafsir' && currentTafsir?.surahNumber === surahNumber && isPlaying) {
      togglePlay();
    } else {
      playTafsir({
        title: `تفسير سورة ${surahName}`,
        surahNumber,
        surahName,
        url,
      });
      showToast(`جاري تشغيل تفسير سورة ${surahName}`);
    }
  };

  const handleShareTafsir = (surahName: string, url: string, e: React.MouseEvent) => {
    e.stopPropagation();
    const text = `استمع إلى تفسير سورة ${surahName} (الخلاصة من تفسير الطبري) عبر منصة صدقة جارية:\n${url}`;
    if (navigator.share) {
      navigator.share({
        title: `تفسير سورة ${surahName}`,
        text,
        url,
      }).catch(() => {});
    } else {
      navigator.clipboard.writeText(text);
      showToast('تم نسخ رابط التفسير للمشاركة');
    }
  };

  return (
    <div className="space-y-6 text-right animate-in fade-in duration-200 select-none">
      
      {/* Header Banner */}
      <div className="p-5 sm:p-6 rounded-3xl bg-gradient-to-br from-[#1A1815] via-[#141210] to-[#0D0B0A] text-stone-100 border border-amber-900/40 shadow-xl space-y-4">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <BookOpen className="w-5 h-5 text-amber-400" />
              <h2 className="font-amiri text-2xl sm:text-3xl font-bold text-amber-200">
                التفاسير الصوتية لسور القرآن الكريم
              </h2>
            </div>
            <p className="text-xs sm:text-sm text-stone-400">
              استمع إلى شرح وبيان معاني آيات القرآن الكريم كاملة لسور المصحف الشريف (الخلاصة من تفسير الإمام الطبري رحمه الله)
            </p>
          </div>

          <div className="flex items-center gap-2 self-end sm:self-auto shrink-0">
            <span className="text-xs px-3 py-1.5 rounded-xl bg-amber-500/15 border border-amber-500/30 text-amber-300 font-bold font-mono">
              ١١٤ سورة مفسرة
            </span>
          </div>
        </div>

        {/* Search */}
        <div className="pt-2 border-t border-stone-800">
          <div className="relative">
            <Search className="w-4 h-4 absolute right-3.5 top-1/2 -translate-y-1/2 text-stone-400" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="ابحث عن السورة للاستماع لتفسيرها (مثل: الفاتحة، الكهف، 18)..."
              className="w-full pr-10 pl-4 py-2.5 text-xs sm:text-sm bg-stone-900/90 border border-stone-750 rounded-2xl focus:outline-hidden focus:border-amber-500 text-stone-100 placeholder:text-stone-500 transition-colors"
            />
          </div>
        </div>
      </div>

      {/* Loading */}
      {isLoading && (
        <div className="p-12 text-center rounded-3xl bg-white dark:bg-stone-900 border border-stone-200 dark:border-stone-800 space-y-3">
          <div className="w-8 h-8 border-3 border-amber-600 border-t-transparent rounded-full animate-spin mx-auto" />
          <p className="text-xs text-stone-500 dark:text-stone-400 font-medium">
            جاري تجهيز التفاسير الصوتية...
          </p>
        </div>
      )}

      {/* Surahs List */}
      {!isLoading && (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-4">
          {filtered.map(({ surah, tafsir }) => {
            const isThisPlaying =
              audioMode === 'tafsir' && currentTafsir?.surahNumber === surah.number && isPlaying;
            const isThisActive =
              audioMode === 'tafsir' && currentTafsir?.surahNumber === surah.number;

            return (
              <div
                key={surah.number}
                onClick={() => handlePlayTafsir(surah.number, surah.name, tafsir.url)}
                className={`p-4 rounded-2xl border transition-all cursor-pointer flex items-center justify-between gap-3 group ${
                  isThisActive
                    ? 'bg-amber-50/80 dark:bg-stone-850 border-amber-500/70 shadow-md ring-1 ring-amber-500/30'
                    : 'bg-white dark:bg-stone-900/90 border-stone-200/90 dark:border-stone-800 hover:border-amber-400/60 shadow-2xs hover:shadow-md'
                }`}
              >
                {/* Left Play button + Surah Info */}
                <div className="flex items-center gap-3 min-w-0">
                  <button
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation();
                      handlePlayTafsir(surah.number, surah.name, tafsir.url);
                    }}
                    className={`w-10 h-10 rounded-2xl flex items-center justify-center shrink-0 transition-transform active:scale-95 cursor-pointer shadow-xs ${
                      isThisPlaying
                        ? 'bg-amber-600 text-white shadow-amber-500/30'
                        : 'bg-stone-100 dark:bg-stone-800 text-stone-700 dark:text-stone-200 group-hover:bg-amber-100 dark:group-hover:bg-stone-750 group-hover:text-amber-800 dark:group-hover:text-amber-300'
                    }`}
                  >
                    {isThisPlaying ? (
                      <Pause className="w-4 h-4 fill-current" />
                    ) : (
                      <Play className="w-4 h-4 fill-current ml-0.5" />
                    )}
                  </button>

                  <div className="min-w-0">
                    <div className="flex items-center gap-2">
                      <span className="font-mono text-xs text-amber-700 dark:text-amber-400 font-bold">
                        {String(surah.number).padStart(3, '0')}
                      </span>
                      <h3 className="font-amiri text-lg font-bold text-stone-900 dark:text-stone-100 truncate group-hover:text-amber-900 dark:group-hover:text-amber-300 transition-colors">
                        سورة {surah.name}
                      </h3>
                    </div>
                    <p className="text-[11px] text-stone-500 dark:text-stone-400 truncate">
                      تفسير الطبري · {surah.revelationType === 'Meccan' ? 'مكية' : 'مدنية'} ({surah.numberOfAyahs} آية)
                    </p>
                  </div>
                </div>

                {/* Right Share */}
                <button
                  type="button"
                  onClick={(e) => handleShareTafsir(surah.name, tafsir.url, e)}
                  className="p-2 rounded-xl text-stone-400 hover:text-stone-700 dark:hover:text-stone-200 hover:bg-stone-100 dark:hover:bg-stone-800 transition cursor-pointer shrink-0"
                  title="مشاركة رابط التفسير"
                >
                  <Share2 className="w-4 h-4" />
                </button>
              </div>
            );
          })}
        </div>
      )}

    </div>
  );
};
