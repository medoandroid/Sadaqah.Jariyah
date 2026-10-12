import React, { useState, useEffect, useMemo, useRef } from 'react';
import {
  Search,
  BookOpen,
  Volume2,
  Bookmark,
  ChevronRight,
  ChevronLeft,
  Settings2,
  Sparkles,
  ArrowRight,
  Info,
  Play,
  Pause,
  X,
  ChevronDown,
  Heart,
  Check,
  Palette,
  Layers,
  Type,
  Flame,
  HardDrive,
  FileText,
  Share2,
  Download
} from 'lucide-react';
import { ALL_SURAHS } from '../data/quranMeta';
import { fetchSurahDetail, saveLastReadBookmark, getLastReadBookmark, Bookmark as BookmarkType } from '../services/quranService';
import { Ayah, SurahDetail } from '../types';
import { useAudio } from '../context/AudioContext';
import { useTheme } from '../context/ThemeContext';
import {
  AyahEndMarker,
  BismillahHeader,
  Star8Rosette,
  IslamicCorner,
  IslamicPatternBackground,
  SurahTitleBanner,
  toArabicDigits
} from '../components/IslamicDecoration';
import { saveAyahBookmark, removeAyahBookmark, getAyahBookmarks } from '../services/bookmarkService';
import { recordDedication } from '../services/dedicationService';
import { SurahPickerModal } from '../components/SurahPickerModal';
import { AyahActionBar } from '../components/AyahActionBar';
import { storageService } from '../services/storageService';
import { AyahShareModal } from '../components/AyahShareModal';
import { QuranBookmarksModal } from '../components/QuranBookmarksModal';
import { DailyWirdModal } from '../components/DailyWirdModal';
import { OfflineQuranModal } from '../components/OfflineQuranModal';
import { TafseerModal } from '../components/TafseerModal';
import { dailyWirdService } from '../services/dailyWirdService';
import { offlineQuranService } from '../services/offlineQuranService';
import { quranBookmarkService } from '../services/quranBookmarkService';
import { userStateService } from '../services/userStateService';

interface QuranPageProps {
  initialSurahNumber?: number;
  onOpenDedicationForSurah?: (surahName: string) => void;
  onOpenMushafPage?: (pageNumber: number) => void;
}

// Clean duplicate Bismillah in Ayah 1 for surahs > 1 and != 9
function cleanAyahText(ayah: Ayah, surahNumber: number): string {
  if (surahNumber === 1 || surahNumber === 9 || ayah.numberInSurah !== 1) {
    return ayah.text;
  }
  const bismillahPatterns = [
    /^بِسْمِ\s+اللَّهِ\s+الرَّحْمَٰنِ\s+الرَّحِيمِ\s*/u,
    /^بِسْمِ\s+ٱللَّهِ\s+ٱلرَّحْمَٰنِ\s+ٱلرَّحِيمِ\s*/u,
    /^بِسْمِ\s+اللهِ\s+الرَّحْمٰنِ\s+الرَّحِيمِ\s*/u,
    /^﻿بِسْمِ\s+اللَّهِ\s+الرَّحْمَٰنِ\s+الرَّحِيمِ\s*/u,
  ];
  let cleaned = ayah.text;
  for (const pattern of bismillahPatterns) {
    if (pattern.test(cleaned)) {
      cleaned = cleaned.replace(pattern, '').trim();
      break;
    }
  }
  return cleaned || ayah.text;
}

export const QuranPage: React.FC<QuranPageProps> = ({
  initialSurahNumber = 1,
  onOpenDedicationForSurah,
  onOpenMushafPage,
}) => {
  const [selectedSurahNumber, setSelectedSurahNumber] = useState<number>(() => {
    return initialSurahNumber || storageService.getNumber('selected_surah_number', 1);
  });
  const [surahDetail, setSurahDetail] = useState<SurahDetail | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [viewMode, setViewMode] = useState<'reader' | 'surahsList'>('reader');
  const [jumpAyah, setJumpAyah] = useState<string>('');
  const [toastMessage, setToastMessage] = useState<string | null>(null);
  const [lastBookmark, setLastBookmark] = useState<BookmarkType | null>(null);
  const [showSettingsDrawer, setShowSettingsDrawer] = useState<boolean>(false);
  const [showBookmarksDrawer, setShowBookmarksDrawer] = useState<boolean>(false);
  const [bookmarkedList, setBookmarkedList] = useState(getAyahBookmarks());

  // Modern Single-Choice Surah Picker Modal
  const [showSurahPicker, setShowSurahPicker] = useState<boolean>(false);

  // New Modals State: Share Image, Bookmarks list, Daily Wird, Offline Quran
  const [showShareModal, setShowShareModal] = useState<boolean>(false);
  const [shareAyahData, setShareAyahData] = useState<{
    surahName: string;
    surahNumber: number;
    ayahNumber: number;
    text: string;
    mode?: 'ayah' | 'page' | 'surah' | 'fullQuran';
    pageNumber?: number;
  } | null>(null);
  const [showQuranBookmarks, setShowQuranBookmarks] = useState<boolean>(false);
  const [showDailyWirdModal, setShowDailyWirdModal] = useState<boolean>(false);
  const [showOfflineModal, setShowOfflineModal] = useState<boolean>(false);
  const [isAllOffline, setIsAllOffline] = useState<boolean>(false);
  const [wirdData, setWirdData] = useState(dailyWirdService.getWirdData());

  useEffect(() => {
    offlineQuranService.isAllQuranOffline().then(setIsAllOffline);
  }, []);

  // Selected Ayah for Interactive Actions
  const [selectedAyah, setSelectedAyah] = useState<Ayah | null>(null);

  // Tafsir modal state
  const [activeTafsirAyah, setActiveTafsirAyah] = useState<Ayah | null>(null);
  const [tafsirText, setTafsirText] = useState<string>('');
  const [loadingTafsir, setLoadingTafsir] = useState<boolean>(false);

  // Single & Continuous Ayah Audio Playback
  const [playingAyahNum, setPlayingAyahNum] = useState<number | null>(null);
  const [isContinuousPlaying, setIsContinuousPlaying] = useState<boolean>(false);
  const isContinuousPlayingRef = useRef<boolean>(false);
  const singleAudioRef = useRef<HTMLAudioElement | null>(null);
  const surahDetailRef = useRef<SurahDetail | null>(null);

  useEffect(() => {
    surahDetailRef.current = surahDetail;
  }, [surahDetail]);

  const { playSurah } = useAudio();
  const {
    theme,
    setTheme,
    frameStyle,
    setFrameStyle,
    patternStyle,
    setPatternStyle,
    fontSize,
    setFontSize,
    fontFamily,
    setFontFamily,
    readingLayout,
    setReadingLayout,
  } = useTheme();

  const ayahRefs = useRef<Record<number, HTMLElement | null>>({});

  useEffect(() => {
    storageService.setNumber('selected_surah_number', selectedSurahNumber);
  }, [selectedSurahNumber]);

  useEffect(() => {
    if (initialSurahNumber) {
      setSelectedSurahNumber(initialSurahNumber);
      setViewMode('reader');
    }
  }, [initialSurahNumber]);

  useEffect(() => {
    const bm = getLastReadBookmark();
    if (bm) setLastBookmark(bm);
  }, []);

  const stopAyahPlayback = () => {
    if (singleAudioRef.current) {
      singleAudioRef.current.pause();
    }
    isContinuousPlayingRef.current = false;
    setIsContinuousPlaying(false);
    setPlayingAyahNum(null);
  };

  // Fetch Surah Details
  useEffect(() => {
    let isMounted = true;
    setIsLoading(true);
    setSelectedAyah(null);
    stopAyahPlayback();

    fetchSurahDetail(selectedSurahNumber).then((data) => {
      if (isMounted) {
        setSurahDetail(data);
        setIsLoading(false);
        const lastRead = userStateService.getLastReadAyah();
        if (lastRead && lastRead.surahNumber === selectedSurahNumber && lastRead.ayahNumber > 1) {
          setTimeout(() => {
            const targetEl = ayahRefs.current[lastRead.ayahNumber];
            if (targetEl) {
              targetEl.scrollIntoView({ behavior: 'smooth', block: 'center' });
            }
          }, 350);
        } else {
          window.scrollTo({ top: 0, behavior: 'smooth' });
        }
      }
    });

    return () => {
      isMounted = false;
    };
  }, [selectedSurahNumber]);

  const filteredSurahs = useMemo(() => {
    if (!searchQuery.trim()) return ALL_SURAHS;
    const q = searchQuery.trim().toLowerCase();
    return ALL_SURAHS.filter(
      (s) =>
        s.name.includes(q) ||
        s.englishName.toLowerCase().includes(q) ||
        String(s.number) === q
    );
  }, [searchQuery]);

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3000);
  };

  const handleBookmarkAyah = (ayah: Ayah) => {
    if (!surahDetail) return;
    saveLastReadBookmark(surahDetail.number, surahDetail.name, ayah.numberInSurah);
    saveAyahBookmark(surahDetail.number, surahDetail.name, ayah.numberInSurah, ayah.text);
    quranBookmarkService.toggleBookmark({
      surahNumber: surahDetail.number,
      surahName: surahDetail.name,
      ayahNumber: ayah.numberInSurah,
      ayahText: ayah.text,
    });
    setBookmarkedList(getAyahBookmarks());
    setLastBookmark({
      surahNumber: surahDetail.number,
      surahName: surahDetail.name,
      ayahNumber: ayah.numberInSurah,
      updatedAt: Date.now(),
    });
    showToast(`تم حفظ الآية في المفضلة: سورة ${surahDetail.name} (آية ${ayah.numberInSurah})`);
  };

  const handleJumpToAyah = (e: React.FormEvent) => {
    e.preventDefault();
    const num = parseInt(jumpAyah, 10);
    if (!isNaN(num) && surahDetail && num >= 1 && num <= surahDetail.numberOfAyahs) {
      const el = ayahRefs.current[num];
      if (el) {
        el.scrollIntoView({ behavior: 'smooth', block: 'center' });
        const targetAyah = surahDetail.ayahs.find((a) => a.numberInSurah === num);
        if (targetAyah) {
          setSelectedAyah(targetAyah);
        }
      }
      setJumpAyah('');
    } else {
      showToast('رقم الآية غير صحيح لهذه السورة');
    }
  };

  const handleLoadTafsir = async (ayah: Ayah) => {
    setActiveTafsirAyah(ayah);
    setTafsirText('');
    setLoadingTafsir(true);

    try {
      const res = await fetch(`https://api.alquran.cloud/v1/ayah/${ayah.number}/ar.muyassar`);
      if (res.ok) {
        const data = await res.json();
        if (data && data.data && data.data.text) {
          setTafsirText(data.data.text);
          setLoadingTafsir(false);
          return;
        }
      }
    } catch (e) {
      console.warn('Tafsir fetch error:', e);
    }

    setTafsirText('التفسير الميسر: بيان معاني الكلمات واستيعاب هدايات الآية الكريمة، تدبر في قول الله تعالى وما اشتملت عليه من توحيد ووعد ووعيد.');
    setLoadingTafsir(false);
  };

  const playAyahAt = (ayah: Ayah, continuous: boolean) => {
    isContinuousPlayingRef.current = continuous;
    setIsContinuousPlaying(continuous);
    setPlayingAyahNum(ayah.numberInSurah);

    if (!singleAudioRef.current) {
      singleAudioRef.current = new Audio();
    }

    const audioUrl = `https://cdn.islamic.network/quran/audio/128/ar.alafasy/${ayah.number}.mp3`;
    singleAudioRef.current.src = audioUrl;
    singleAudioRef.current.load();

    singleAudioRef.current.play().then(() => {
      setPlayingAyahNum(ayah.numberInSurah);
      const el = ayahRefs.current[ayah.numberInSurah];
      if (el) {
        el.scrollIntoView({ behavior: 'smooth', block: 'center' });
      }
    }).catch(() => {
      // Fallback to EveryAyah CDN
      const paddedSurah = String(selectedSurahNumber).padStart(3, '0');
      const paddedAyah = String(ayah.numberInSurah).padStart(3, '0');
      const fallbackUrl = `https://everyayah.com/data/Alafasy_128kbps/${paddedSurah}${paddedAyah}.mp3`;
      if (singleAudioRef.current) {
        singleAudioRef.current.src = fallbackUrl;
        singleAudioRef.current.load();
        singleAudioRef.current.play().then(() => {
          setPlayingAyahNum(ayah.numberInSurah);
          const el = ayahRefs.current[ayah.numberInSurah];
          if (el) {
            el.scrollIntoView({ behavior: 'smooth', block: 'center' });
          }
        }).catch(() => {
          stopAyahPlayback();
          showToast('تعذر تشغيل تلاوة الآية حالياً');
        });
      }
    });

    singleAudioRef.current.onended = () => {
      if (isContinuousPlayingRef.current && surahDetailRef.current) {
        const nextAyahNum = ayah.numberInSurah + 1;
        const nextAyah = surahDetailRef.current.ayahs.find((a) => a.numberInSurah === nextAyahNum);
        if (nextAyah) {
          playAyahAt(nextAyah, true);
        } else {
          stopAyahPlayback();
          showToast(`تمت تلاوة سورة ${surahDetailRef.current.name} بحمد الله`);
        }
      } else {
        stopAyahPlayback();
      }
    };

    singleAudioRef.current.onerror = () => {
      stopAyahPlayback();
    };
  };

  const handlePlaySingleAyah = (ayah: Ayah) => {
    if (playingAyahNum === ayah.numberInSurah && !isContinuousPlaying) {
      stopAyahPlayback();
    } else {
      playAyahAt(ayah, false);
    }
  };

  const handlePlayContinuousAyah = (ayah: Ayah) => {
    if (isContinuousPlaying) {
      stopAyahPlayback();
      showToast('تم إيقاف التلاوة المستمرة');
    } else {
      playAyahAt(ayah, true);
      showToast(`بدء التلاوة والمتابعة من الآية ${ayah.numberInSurah}`);
    }
  };

  const handleNextSurah = () => {
    if (selectedSurahNumber < 114) {
      setSelectedSurahNumber(selectedSurahNumber + 1);
    }
  };

  const handlePrevSurah = () => {
    if (selectedSurahNumber > 1) {
      setSelectedSurahNumber(selectedSurahNumber - 1);
    }
  };

  // Theme-specific styles and color palettes
  const getThemeStyles = () => {
    switch (theme) {
      case 'night':
        return {
          wrapper: 'bg-[#14161C] text-[#E0E2DC] border-stone-800 shadow-2xl',
          text: 'text-[#E4E7E1]',
          card: 'bg-[#1A1E26] border-stone-800 text-[#DCE0D8]',
          surahHeader: 'bg-[#181D26] border-amber-600/30 text-amber-300',
          accent: 'text-amber-400',
          hoverAyah: 'hover:bg-amber-950/40 hover:text-amber-200',
          verseText: 'text-[#E4E7E1]',
          cornerColor: 'text-amber-500/50',
          outerBorder: 'border-2 border-stone-800 shadow-2xl',
          innerBorder: 'border border-amber-500/20',
        };
      case 'emerald':
        return {
          wrapper: 'bg-[#0E2018] text-[#D8EADB] border-emerald-900 shadow-2xl',
          text: 'text-[#E0EFE6]',
          card: 'bg-[#132A20] border-emerald-800/80 text-[#D4E8DC]',
          surahHeader: 'bg-[#163327] border-emerald-600/50 text-emerald-300',
          accent: 'text-emerald-400',
          hoverAyah: 'hover:bg-emerald-950/50 hover:text-emerald-200',
          verseText: 'text-[#E0EFE6]',
          cornerColor: 'text-emerald-500/60',
          outerBorder: 'border-2 border-emerald-800/70 shadow-2xl',
          innerBorder: 'border border-emerald-500/30',
        };
      case 'ottoman_cream':
        return {
          wrapper: 'bg-[#FCFBF8] text-stone-900 border-stone-300 shadow-md',
          text: 'text-stone-900',
          card: 'bg-white border-stone-200 text-stone-900 shadow-xs',
          surahHeader: 'bg-stone-50 border-stone-300 text-amber-950',
          accent: 'text-amber-800',
          hoverAyah: 'hover:bg-amber-100/50 hover:text-amber-950',
          verseText: 'text-stone-900',
          cornerColor: 'text-amber-700/60',
          outerBorder: 'border-2 border-stone-300 shadow-lg',
          innerBorder: 'border border-amber-600/30',
        };
      case 'pure':
        return {
          wrapper: 'bg-white text-stone-900 border-stone-200 shadow-sm',
          text: 'text-stone-900',
          card: 'bg-stone-50 border-stone-200 text-stone-900',
          surahHeader: 'bg-stone-50 border-stone-200 text-stone-900',
          accent: 'text-amber-800',
          hoverAyah: 'hover:bg-amber-50 hover:text-amber-950',
          verseText: 'text-stone-900',
          cornerColor: 'text-stone-400/60',
          outerBorder: 'border border-stone-200 shadow-sm',
          innerBorder: 'border border-stone-200',
        };
      case 'parchment':
        return {
          wrapper: 'bg-[#F7F2E7] text-stone-900 border-[#D9CCA8] shadow-md',
          text: 'text-stone-900',
          card: 'bg-[#FCF9F2] border-[#E2D8BF] text-stone-900',
          surahHeader: 'bg-[#EFE8D6] border-[#D9CCA8] text-amber-950',
          accent: 'text-amber-900',
          hoverAyah: 'hover:bg-amber-100/40 hover:text-amber-950',
          verseText: 'text-stone-900',
          cornerColor: 'text-amber-800/60',
          outerBorder: 'border-2 border-amber-800/30 shadow-md',
          innerBorder: 'border border-amber-700/25',
        };
      case 'royal_gold':
      default:
        return {
          wrapper: 'bg-[#FBF8EF] text-stone-900 border-amber-600/40 shadow-xl',
          text: 'text-stone-900',
          card: 'bg-white/90 border-amber-200/80 text-stone-900 shadow-xs',
          surahHeader: 'bg-gradient-to-r from-amber-50 via-amber-100/60 to-amber-50 border-amber-300 text-amber-950',
          accent: 'text-amber-800',
          hoverAyah: 'hover:bg-amber-100/60 hover:text-amber-950',
          verseText: 'text-stone-900',
          cornerColor: 'text-amber-600/80',
          outerBorder: 'border-3 border-amber-600/60 shadow-xl ring-2 ring-amber-500/20',
          innerBorder: 'border-2 border-amber-600/35',
        };
    }
  };

  const currentStyles = getThemeStyles();

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-6 space-y-6">
      
      {/* Toast Alert */}
      {toastMessage && (
        <div className="fixed top-20 left-1/2 -translate-x-1/2 z-50 px-4 py-2 rounded-xl bg-stone-900/90 text-amber-200 text-xs font-semibold shadow-xl backdrop-blur-md animate-in fade-in slide-in-from-top-2 duration-200">
          {toastMessage}
        </div>
      )}

      {/* Surah Picker Modal (Modern Single Choice) */}
      <SurahPickerModal
        isOpen={showSurahPicker}
        onClose={() => setShowSurahPicker(false)}
        selectedSurahNumber={selectedSurahNumber}
        onSelectSurah={(num) => {
          setSelectedSurahNumber(num);
          setViewMode('reader');
        }}
      />

      {/* Selected Ayah Floating Action Bar */}
      {selectedAyah && surahDetail && (
        <AyahActionBar
          ayah={selectedAyah}
          surah={surahDetail}
          isPlayingSingleAudio={playingAyahNum === selectedAyah.numberInSurah && !isContinuousPlaying}
          isPlayingContinuousAudio={isContinuousPlaying}
          isBookmarked={bookmarkedList.some(
            (b) => b.surahNumber === surahDetail.number && b.ayahNumber === selectedAyah.numberInSurah
          )}
          onPlaySingleAudio={() => handlePlaySingleAyah(selectedAyah)}
          onPlayContinuousAudio={() => handlePlayContinuousAyah(selectedAyah)}
          onOpenTafsir={() => handleLoadTafsir(selectedAyah)}
          onBookmark={() => handleBookmarkAyah(selectedAyah)}
          onShareAsImage={() => {
            setShareAyahData({
              surahName: surahDetail.name,
              surahNumber: surahDetail.number,
              ayahNumber: selectedAyah.numberInSurah,
              text: selectedAyah.text,
            });
            setShowShareModal(true);
          }}
          onDedicate={() => {
            recordDedication(
              'surah',
              `قراءة آية ${selectedAyah.numberInSurah} من سورة ${surahDetail.name}`,
              'all',
              1,
              'قارئ كريم'
            );
            showToast('تقبل الله قراءتك وجعلها نوراً مؤنساً لهم');
          }}
          onClose={() => setSelectedAyah(null)}
          onShowToast={showToast}
        />
      )}

      {/* Ayah & Full Surah / Page PDF Share Modal */}
      {shareAyahData && (
        <AyahShareModal
          isOpen={showShareModal}
          onClose={() => {
            setShowShareModal(false);
            setShareAyahData(null);
          }}
          surahName={shareAyahData.surahName}
          surahNumber={shareAyahData.surahNumber}
          ayahNumber={shareAyahData.ayahNumber}
          ayahText={shareAyahData.text}
          initialMode={shareAyahData.mode || 'ayah'}
          pageNumber={shareAyahData.pageNumber || surahDetail?.startPage || 1}
          onNavigateToMushafPage={onOpenMushafPage}
        />
      )}

      {/* Quran Verse Bookmarks Modal */}
      <QuranBookmarksModal
        isOpen={showQuranBookmarks}
        onClose={() => setShowQuranBookmarks(false)}
        onSelectAyah={(surahNum, ayahNum) => {
          setSelectedSurahNumber(surahNum);
          setViewMode('reader');
          setTimeout(() => {
            const el = ayahRefs.current[ayahNum];
            if (el) el.scrollIntoView({ behavior: 'smooth', block: 'center' });
          }, 400);
        }}
        onShareAyahImage={(surahName, surahNum, ayahNum, text) => {
          setShareAyahData({ surahName, surahNumber: surahNum, ayahNumber: ayahNum, text });
          setShowShareModal(true);
        }}
      />

      {/* Daily Quran Wird Modal */}
      <DailyWirdModal
        isOpen={showDailyWirdModal}
        onClose={() => {
          setShowDailyWirdModal(false);
          setWirdData(dailyWirdService.getWirdData());
        }}
      />

      {/* Offline Quran Download Modal */}
      <OfflineQuranModal
        isOpen={showOfflineModal}
        onClose={() => setShowOfflineModal(false)}
        onOfflineStatusChange={setIsAllOffline}
      />

      {/* Top Banner: Bookmark Resume if exists */}
      {lastBookmark && (
        <div className="flex flex-wrap items-center justify-between gap-3 p-3.5 rounded-2xl bg-amber-50/90 border border-amber-200 text-amber-950 text-xs shadow-2xs">
          <div className="flex items-center gap-2">
            <Bookmark className="w-4 h-4 text-amber-700 fill-amber-700 shrink-0" />
            <span>
              آخر موضع قراءة محفوظ: <strong>سورة {lastBookmark.surahName}</strong> (الآية {lastBookmark.ayahNumber})
            </span>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={() => {
                setSelectedSurahNumber(lastBookmark.surahNumber);
                setViewMode('reader');
                setTimeout(() => {
                  const el = ayahRefs.current[lastBookmark.ayahNumber];
                  if (el) el.scrollIntoView({ behavior: 'smooth', block: 'center' });
                }, 500);
              }}
              className="px-3 py-1 rounded-lg bg-amber-800 text-amber-50 font-medium hover:bg-amber-900 transition-colors cursor-pointer"
            >
              استئناف القراءة
            </button>
            <button
              onClick={() => setShowBookmarksDrawer(true)}
              className="px-2.5 py-1 rounded-lg border border-amber-300 text-amber-900 hover:bg-amber-100 transition-colors cursor-pointer"
            >
              العلامات المحفوظة ({bookmarkedList.length})
            </button>
          </div>
        </div>
      )}

      {/* Navigation & Controls Bar */}
      <div className="flex flex-wrap items-center justify-between gap-3 p-4 rounded-2xl bg-white border border-stone-200 shadow-xs">
        
        {/* Left: View Mode Toggle & Surah Single-Choice Trigger */}
        <div className="flex items-center gap-2">
          <button
            onClick={() => setViewMode(viewMode === 'reader' ? 'surahsList' : 'reader')}
            className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-stone-100 hover:bg-stone-200/80 text-stone-800 text-xs font-semibold transition-colors cursor-pointer"
          >
            <BookOpen className="w-4 h-4 text-amber-700" />
            <span>{viewMode === 'reader' ? 'فهرس السور' : 'عرض القراءة'}</span>
          </button>

          {viewMode === 'reader' && (
            <div className="flex items-center gap-1.5">
              {/* Modern Single Choice Trigger for Surah */}
              <button
                onClick={() => setShowSurahPicker(true)}
                className="flex items-center gap-2 px-3 py-1.5 rounded-xl border border-stone-200 hover:border-amber-400 bg-stone-50 hover:bg-amber-50/50 text-xs font-bold text-stone-800 transition-all cursor-pointer group shadow-2xs"
                title="فتح قائمة اختيار السور"
              >
                <span className="w-6 h-6 rounded-lg bg-amber-100 text-amber-900 font-mono text-[11px] font-bold flex items-center justify-center">
                  {selectedSurahNumber}
                </span>
                <span className="font-amiri text-base text-amber-950">
                  سورة {surahDetail?.name || ALL_SURAHS.find(s => s.number === selectedSurahNumber)?.name}
                </span>
                <ChevronDown className="w-3.5 h-3.5 text-stone-400 group-hover:text-amber-800" />
              </button>

              {/* Prev / Next Surah Arrows */}
              <div className="flex items-center gap-1 text-stone-600">
                <button
                  onClick={handlePrevSurah}
                  disabled={selectedSurahNumber <= 1}
                  className="p-1.5 rounded-lg border border-stone-200 hover:bg-stone-100 disabled:opacity-30 disabled:pointer-events-none cursor-pointer"
                  title="السورة السابقة"
                >
                  <ChevronRight className="w-4 h-4" />
                </button>
                <button
                  onClick={handleNextSurah}
                  disabled={selectedSurahNumber >= 114}
                  className="p-1.5 rounded-lg border border-stone-200 hover:bg-stone-100 disabled:opacity-30 disabled:pointer-events-none cursor-pointer"
                  title="السورة التالية"
                >
                  <ChevronLeft className="w-4 h-4" />
                </button>
              </div>
            </div>
          )}
        </div>

        {/* Center: Search input */}
        <div className="flex-1 max-w-xs min-w-[180px]">
          <div className="relative">
            <Search className="w-4 h-4 absolute right-3 top-1/2 -translate-y-1/2 text-stone-400" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="ابحث برقم أو اسم السورة..."
              className="w-full pr-9 pl-3 py-1.5 text-xs bg-stone-50 border border-stone-200 rounded-xl focus:outline-hidden focus:border-amber-700 text-stone-900"
            />
          </div>
        </div>

        {/* Right: Audio Playback, Layout & Reading Settings */}
        <div className="flex items-center gap-2">
          {viewMode === 'reader' && (
            <div className="hidden sm:flex items-center border border-stone-200 rounded-xl p-0.5 bg-stone-50">
              <button
                onClick={() => setReadingLayout('continuous')}
                className={`px-2.5 py-1 text-xs rounded-lg font-medium cursor-pointer transition-colors ${
                  readingLayout === 'continuous'
                    ? 'bg-white shadow-2xs text-amber-900 font-bold'
                    : 'text-stone-500 hover:text-stone-800'
                }`}
              >
                مصحف مستمر
              </button>
              <button
                onClick={() => setReadingLayout('cards')}
                className={`px-2.5 py-1 text-xs rounded-lg font-medium cursor-pointer transition-colors ${
                  readingLayout === 'cards'
                    ? 'bg-white shadow-2xs text-amber-900 font-bold'
                    : 'text-stone-500 hover:text-stone-800'
                }`}
              >
                آية بآية
              </button>
            </div>
          )}

          {/* Switch to Paper Mushaf view for current Surah */}
          {onOpenMushafPage && surahDetail && (
            <button
              onClick={() => onOpenMushafPage(surahDetail.startPage)}
              className="hidden sm:flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-amber-50 hover:bg-amber-100 border border-amber-300 text-amber-900 text-xs font-semibold shadow-2xs transition-all cursor-pointer active:scale-98"
              title="عرض هذه السورة في المصحف الورقي المصور"
            >
              <BookOpen className="w-3.5 h-3.5 text-amber-800" />
              <span>المصحف المصور (ص {surahDetail.startPage})</span>
            </button>
          )}

          {/* Export Surah as PDF / Share Button */}
          {surahDetail && (
            <button
              onClick={() => {
                setShareAyahData({
                  surahName: surahDetail.name,
                  surahNumber: surahDetail.number,
                  ayahNumber: 1,
                  text: surahDetail.ayahs[0]?.text || '',
                  mode: 'surah',
                  pageNumber: surahDetail.startPage,
                });
                setShowShareModal(true);
              }}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-amber-50 hover:bg-amber-100 border border-amber-300 text-amber-900 text-xs font-semibold shadow-2xs transition-all cursor-pointer active:scale-98"
              title="تصدير السورة كاملة كملف PDF عالي الجودة"
            >
              <FileText className="w-3.5 h-3.5 text-amber-800" />
              <span className="hidden sm:inline">سورة PDF</span>
              <span className="sm:hidden">PDF</span>
            </button>
          )}

          {/* Download Full Quran or Mushaf PDF Button */}
          <button
            onClick={() => {
              setShareAyahData({
                surahName: surahDetail ? surahDetail.name : 'الفَاتِحَة',
                surahNumber: surahDetail ? surahDetail.number : 1,
                ayahNumber: 1,
                text: surahDetail?.ayahs[0]?.text || '',
                mode: 'fullQuran',
                pageNumber: surahDetail ? surahDetail.startPage : 1,
              });
              setShowShareModal(true);
            }}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-gradient-to-r from-amber-100/90 to-amber-200/80 hover:from-amber-200 hover:to-amber-300 border border-amber-400/80 text-amber-950 text-xs font-bold shadow-2xs transition-all cursor-pointer active:scale-98"
            title="تنزيل المصحف كاملاً كملف PDF رسمي أو حسب الأجزاء"
          >
            <Download className="w-3.5 h-3.5 text-amber-900" />
            <span className="hidden sm:inline">المصحف كاملاً PDF</span>
            <span className="sm:hidden">المصحف</span>
          </button>

          {/* Quick Play Audio for Current Surah */}
          <button
            onClick={() => playSurah(selectedSurahNumber)}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-amber-800 hover:bg-amber-900 text-white text-xs font-semibold shadow-xs transition-all cursor-pointer active:scale-98"
          >
            <Volume2 className="w-3.5 h-3.5" />
            <span>استمع للسورة</span>
          </button>

          {/* Reading Settings Toggle */}
          <button
            onClick={() => setShowSettingsDrawer(!showSettingsDrawer)}
            className={`p-2 rounded-xl border transition-colors cursor-pointer ${
              showSettingsDrawer
                ? 'bg-amber-100 border-amber-300 text-amber-900'
                : 'bg-stone-100 border-stone-200 text-stone-700 hover:bg-stone-200'
            }`}
            title="إعدادات القراءة والخط"
          >
            <Settings2 className="w-4 h-4" />
          </button>
        </div>

      </div>

      {/* Quran Spiritual Tools Bar: Daily Wird, Verse Bookmarks, Offline Quran */}
      <div className="flex flex-wrap items-center justify-between gap-2.5 p-3 rounded-2xl bg-[#FCFBF7] dark:bg-stone-900 border border-amber-500/25 shadow-xs">
        
        <div className="flex items-center gap-2 flex-wrap">
          {/* Daily Wird Button */}
          <button
            onClick={() => setShowDailyWirdModal(true)}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-amber-500/15 hover:bg-amber-500/25 border border-amber-500/35 text-amber-900 dark:text-amber-300 text-xs font-bold transition-all cursor-pointer shadow-2xs active:scale-95"
            title="متابعة الورد القرآني اليومي والهدف"
          >
            <Flame className="w-3.5 h-3.5 text-amber-600 dark:text-amber-400 fill-amber-500/30" />
            <span>الورد اليومي:</span>
            <span className="font-mono text-amber-800 dark:text-amber-400">
              {wirdData.completedToday} / {wirdData.targetPages} ص
            </span>
            {wirdData.streakDays > 0 && (
              <span className="text-[10px] px-1.5 py-0.2 rounded-full bg-amber-600 text-white font-mono font-bold">
                {wirdData.streakDays}🔥
              </span>
            )}
          </button>

          {/* Verse Bookmarks Button */}
          <button
            onClick={() => setShowQuranBookmarks(true)}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-stone-100 dark:bg-stone-800 hover:bg-stone-200 text-stone-700 dark:text-stone-300 border border-stone-200 dark:border-stone-700 text-xs font-semibold transition-all cursor-pointer active:scale-95"
            title="عرض قائمة الآيات المحفوظة في المفضلة"
          >
            <Bookmark className="w-3.5 h-3.5 text-amber-600 fill-amber-500/40" />
            <span>مفضلة الآيات</span>
            <span className="text-[10px] px-1.5 py-0.2 rounded-full bg-stone-200 dark:bg-stone-700 text-stone-700 dark:text-stone-300 font-mono font-bold">
              {quranBookmarkService.getBookmarks().length}
            </span>
          </button>
        </div>

        {/* Offline Quran Status & Download Button */}
        <button
          onClick={() => setShowOfflineModal(true)}
          className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl border text-xs font-bold transition-all cursor-pointer active:scale-95 shadow-2xs ${
            isAllOffline
              ? 'bg-emerald-50 dark:bg-emerald-950/40 border-emerald-400 text-emerald-800 dark:text-emerald-300'
              : 'bg-amber-100/60 dark:bg-stone-800 border-amber-300 dark:border-amber-700 text-amber-900 dark:text-amber-300 hover:bg-amber-100'
          }`}
          title="تحميل وإدارة المصحف الشريف للعمل بدون إنترنت"
        >
          <HardDrive className={`w-3.5 h-3.5 ${isAllOffline ? 'text-emerald-600' : 'text-amber-600'}`} />
          <span>{isAllOffline ? 'المصحف متاح بدون نت (100%)' : 'تحميل المصحف بدون نت'}</span>
        </button>

      </div>

      {/* Reader Settings Drawer (Islamic Templates, Frames, Patterns & Typography) */}
      {showSettingsDrawer && (
        <div className="p-4 sm:p-6 rounded-3xl bg-white dark:bg-stone-900 border border-stone-200 dark:border-stone-800 shadow-xl space-y-5 animate-in fade-in duration-150">
          
          <div className="flex items-center justify-between pb-3 border-b border-stone-200 dark:border-stone-800">
            <div className="flex items-center gap-2">
              <Palette className="w-5 h-5 text-amber-700 dark:text-amber-400" />
              <h3 className="font-amiri text-lg sm:text-xl font-bold text-stone-900 dark:text-stone-100">
                قوالب وإطارات المصحف الشريف
              </h3>
            </div>
            <button
              onClick={() => setShowSettingsDrawer(false)}
              className="p-1.5 text-stone-400 hover:text-stone-700 dark:hover:text-stone-200 rounded-lg cursor-pointer"
            >
              <X className="w-4 h-4" />
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            
            {/* 1. Theme / Template Selector */}
            <div className="space-y-2">
              <label className="block text-xs font-bold text-stone-700 dark:text-stone-300">
                قالب المصحف والخلفية:
              </label>
              <div className="grid grid-cols-2 gap-1.5">
                {[
                  { id: 'royal_gold', label: 'الملكي المذهب', badge: 'bg-[#FBF8EF] border-amber-400 text-amber-950' },
                  { id: 'parchment', label: 'المخطوطة الأندلسية', badge: 'bg-[#F7F2E7] border-amber-700 text-stone-900' },
                  { id: 'ottoman_cream', label: 'التحفة العثمانية', badge: 'bg-[#FCFBF8] border-stone-400 text-stone-900' },
                  { id: 'emerald', label: 'الروضة الزمردية', badge: 'bg-[#0E2018] border-emerald-500 text-emerald-200' },
                  { id: 'night', label: 'المصحف الليلي', badge: 'bg-[#14161C] border-stone-700 text-stone-200' },
                  { id: 'pure', label: 'الميسر الصافي', badge: 'bg-white border-stone-300 text-stone-900' },
                ].map((th) => (
                  <button
                    key={th.id}
                    onClick={() => setTheme(th.id as any)}
                    className={`px-2 py-1.5 rounded-xl border text-[11px] font-semibold transition-all cursor-pointer truncate ${
                      theme === th.id
                        ? `${th.badge} font-bold ring-2 ring-amber-500/50 shadow-xs scale-102`
                        : 'border-stone-200 dark:border-stone-800 text-stone-600 dark:text-stone-400 hover:bg-stone-50 dark:hover:bg-stone-800'
                    }`}
                  >
                    {th.label}
                  </button>
                ))}
              </div>
            </div>

            {/* 2. Islamic Frame Style */}
            <div className="space-y-2">
              <label className="block text-xs font-bold text-stone-700 dark:text-stone-300">
                نمط الإطار الإسلامي:
              </label>
              <div className="grid grid-cols-2 gap-1.5">
                {[
                  { id: 'royal', label: 'إطار مذهب ملكي' },
                  { id: 'andalusian', label: 'إطار أندلسي عتيق' },
                  { id: 'minimal', label: 'إطار ناعم بسيط' },
                  { id: 'none', label: 'بدون إطار (مفتوح)' },
                ].map((fr) => (
                  <button
                    key={fr.id}
                    onClick={() => setFrameStyle(fr.id as any)}
                    className={`px-2 py-1.5 rounded-xl border text-[11px] font-semibold transition-all cursor-pointer ${
                      frameStyle === fr.id
                        ? 'border-amber-600 bg-amber-50 dark:bg-amber-950/40 text-amber-900 dark:text-amber-300 font-bold shadow-xs'
                        : 'border-stone-200 dark:border-stone-800 text-stone-600 dark:text-stone-400 hover:bg-stone-50 dark:hover:bg-stone-800'
                    }`}
                  >
                    {fr.label}
                  </button>
                ))}
              </div>
            </div>

            {/* 3. Watermark Pattern */}
            <div className="space-y-2">
              <label className="block text-xs font-bold text-stone-700 dark:text-stone-300">
                الزخرفة المائية الخلفية:
              </label>
              <div className="grid grid-cols-2 gap-1.5">
                {[
                  { id: 'stars', label: 'نجوم إسلامية' },
                  { id: 'arabesque', label: 'أرابيسك قرآني' },
                  { id: 'parchment', label: 'ملمس مخطوطة' },
                  { id: 'none', label: 'سادة نقي' },
                ].map((pat) => (
                  <button
                    key={pat.id}
                    onClick={() => setPatternStyle(pat.id as any)}
                    className={`px-2 py-1.5 rounded-xl border text-[11px] font-semibold transition-all cursor-pointer ${
                      patternStyle === pat.id
                        ? 'border-amber-600 bg-amber-50 dark:bg-amber-950/40 text-amber-900 dark:text-amber-300 font-bold shadow-xs'
                        : 'border-stone-200 dark:border-stone-800 text-stone-600 dark:text-stone-400 hover:bg-stone-50 dark:hover:bg-stone-800'
                    }`}
                  >
                    {pat.label}
                  </button>
                ))}
              </div>
            </div>

            {/* 4. Font, Size & Quick Ayah Jump */}
            <div className="space-y-3">
              {/* Font Choice & Size */}
              <div>
                <div className="flex items-center justify-between text-xs font-bold text-stone-700 dark:text-stone-300 mb-1">
                  <span>نوع وحجم الخط:</span>
                  <span className="font-mono text-amber-700 dark:text-amber-400">{fontSize}px</span>
                </div>
                <div className="flex items-center gap-1.5 mb-2">
                  <button
                    onClick={() => setFontFamily('quran')}
                    className={`flex-1 py-1 rounded-lg border text-xs font-bold cursor-pointer transition-colors ${
                      fontFamily === 'quran'
                        ? 'border-amber-600 bg-amber-50 dark:bg-stone-800 text-amber-900 dark:text-amber-300'
                        : 'border-stone-200 dark:border-stone-700 text-stone-500'
                    }`}
                  >
                    حفص العثماني
                  </button>
                  <button
                    onClick={() => setFontFamily('amiri')}
                    className={`flex-1 py-1 rounded-lg border text-xs font-bold cursor-pointer transition-colors ${
                      fontFamily === 'amiri'
                        ? 'border-amber-600 bg-amber-50 dark:bg-stone-800 text-amber-900 dark:text-amber-300'
                        : 'border-stone-200 dark:border-stone-700 text-stone-500'
                    }`}
                  >
                    الخط الأميري
                  </button>
                </div>
                <input
                  type="range"
                  min="20"
                  max="44"
                  step="2"
                  value={fontSize}
                  onChange={(e) => setFontSize(Number(e.target.value))}
                  className="w-full h-1.5 bg-stone-200 dark:bg-stone-700 rounded-lg accent-amber-700 cursor-pointer"
                />
              </div>

              {/* Fast Ayah Jump */}
              {surahDetail && (
                <form onSubmit={handleJumpToAyah} className="flex items-center gap-1.5 pt-1">
                  <input
                    type="number"
                    min="1"
                    max={surahDetail.numberOfAyahs}
                    value={jumpAyah}
                    onChange={(e) => setJumpAyah(e.target.value)}
                    placeholder={`انتقال لآية (1-${surahDetail.numberOfAyahs})`}
                    className="flex-1 px-2.5 py-1.5 text-xs bg-stone-50 dark:bg-stone-800 border border-stone-200 dark:border-stone-700 rounded-lg focus:outline-hidden focus:border-amber-700 font-mono text-stone-900 dark:text-stone-100"
                  />
                  <button
                    type="submit"
                    className="px-3 py-1.5 rounded-lg bg-amber-800 hover:bg-amber-900 text-white text-xs font-semibold cursor-pointer shrink-0"
                  >
                    انتقال
                  </button>
                </form>
              )}
            </div>

          </div>

        </div>
      )}

      {/* Bookmarks Drawer Modal */}
      {showBookmarksDrawer && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-stone-900/60 backdrop-blur-xs">
          <div className="w-full max-w-lg bg-white rounded-3xl shadow-2xl p-6 text-right space-y-4 max-h-[80vh] flex flex-col">
            <div className="flex items-center justify-between pb-3 border-b border-stone-200">
              <h3 className="font-amiri text-2xl font-bold text-stone-900 flex items-center gap-2">
                <Bookmark className="w-5 h-5 text-amber-700 fill-amber-700" />
                <span>الآيات والعلامات المحفوظة</span>
              </h3>
              <button
                onClick={() => setShowBookmarksDrawer(false)}
                className="p-1 text-stone-400 hover:text-stone-700 rounded-lg cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="flex-1 overflow-y-auto space-y-3">
              {bookmarkedList.length === 0 ? (
                <div className="py-12 text-center text-stone-500 text-sm">
                  لا توجد علامات محفوظة حالياً. يمكنك تحديد أي آية أثناء القراءة والضغط على أيقونة حفظ العلامة.
                </div>
              ) : (
                bookmarkedList.map((bm) => (
                  <div
                    key={bm.id}
                    className="p-3.5 rounded-2xl border border-stone-200 bg-stone-50/50 hover:bg-amber-50/50 transition-colors flex items-start justify-between gap-3"
                  >
                    <div className="min-w-0 flex-1">
                      <div className="font-bold text-sm text-stone-900 mb-1">
                        سورة {bm.surahName} (الآية {bm.ayahNumber})
                      </div>
                      <p className="font-quran text-stone-700 text-sm line-clamp-2 leading-relaxed">
                        {bm.ayahText}
                      </p>
                    </div>

                    <div className="flex items-center gap-1.5 shrink-0 pt-1">
                      <button
                        onClick={() => {
                          setSelectedSurahNumber(bm.surahNumber);
                          setShowBookmarksDrawer(false);
                          setViewMode('reader');
                          setTimeout(() => {
                            const el = ayahRefs.current[bm.ayahNumber];
                            if (el) el.scrollIntoView({ behavior: 'smooth', block: 'center' });
                          }, 500);
                        }}
                        className="px-2.5 py-1 rounded-lg bg-amber-800 text-white text-xs font-semibold hover:bg-amber-900 cursor-pointer"
                      >
                        انتقال
                      </button>
                      <button
                        onClick={() => {
                          removeAyahBookmark(bm.id);
                          setBookmarkedList(getAyahBookmarks());
                        }}
                        className="p-1 text-stone-400 hover:text-rose-600 rounded-md cursor-pointer"
                        title="حذف"
                      >
                        <X className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>
      )}

      {/* Tafsir Modal */}
      {activeTafsirAyah && surahDetail && (
        <TafseerModal
          isOpen={!!activeTafsirAyah}
          onClose={() => setActiveTafsirAyah(null)}
          surahNumber={surahDetail.number}
          surahName={surahDetail.name}
          ayahNumber={activeTafsirAyah.numberInSurah}
          ayahText={activeTafsirAyah.text}
          onOpenDedication={() => onOpenDedicationForSurah?.(surahDetail.name)}
        />
      )}

      {/* VIEW 1: Surahs Index List */}
      {viewMode === 'surahsList' ? (
        <div className="space-y-4">
          <div className="flex items-center justify-between text-xs text-stone-500 px-1">
            <span>سور القرآن الكريم</span>
            <span>عدد السور المعروضة: {filteredSurahs.length}</span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
            {filteredSurahs.map((surah) => (
              <div
                key={surah.number}
                onClick={() => {
                  setSelectedSurahNumber(surah.number);
                  setViewMode('reader');
                }}
                className={`p-3.5 rounded-2xl border text-right transition-all cursor-pointer group flex items-center justify-between ${
                  surah.number === selectedSurahNumber
                    ? 'border-amber-700 bg-amber-50/70 shadow-xs'
                    : 'border-stone-200 bg-white hover:border-amber-300 hover:bg-amber-50/30'
                }`}
              >
                <div className="flex items-center gap-3">
                  <span className="w-9 h-9 rounded-xl bg-stone-100 group-hover:bg-amber-100 text-stone-700 group-hover:text-amber-900 font-mono text-xs flex items-center justify-center font-bold transition-colors">
                    {surah.number}
                  </span>
                  <div>
                    <div className="font-amiri text-lg font-bold text-stone-900 group-hover:text-amber-900">
                      سورة {surah.name}
                    </div>
                    <div className="text-[11px] text-stone-500">
                      {surah.revelationArabic} · {surah.numberOfAyahs} آية · ص {surah.startPage}
                    </div>
                  </div>
                </div>

                <div className="flex items-center gap-1.5">
                  <button
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation();
                      playSurah(surah.number);
                    }}
                    className="p-1.5 rounded-lg text-stone-400 hover:text-amber-800 hover:bg-amber-100/70 transition-colors cursor-pointer"
                    title="استماع"
                  >
                    <Volume2 className="w-4 h-4" />
                  </button>
                  <ArrowRight className="w-4 h-4 text-stone-300 group-hover:text-amber-700 rotate-180 transition-transform group-hover:-translate-x-1" />
                </div>
              </div>
            ))}
          </div>
        </div>
      ) : (
        /* VIEW 2: Reading View with Authentic Islamic Frame & Pattern Background */
        <div
          className={`relative rounded-3xl ${currentStyles.wrapper} ${
            frameStyle === 'royal'
              ? currentStyles.outerBorder
              : frameStyle === 'andalusian'
              ? 'border-2 border-amber-800/40 shadow-xl'
              : frameStyle === 'minimal'
              ? 'border border-amber-600/30 shadow-md'
              : 'border-0 shadow-none'
          } p-4 sm:p-8 lg:p-10 transition-colors overflow-hidden`}
        >
          {/* Subtle Islamic Watermark Pattern */}
          <IslamicPatternBackground pattern={patternStyle} opacity={theme === 'night' ? 0.05 : 0.04} />

          {/* 4 Islamic Corner Ornaments for Royal & Andalusian Frames */}
          {(frameStyle === 'royal' || frameStyle === 'andalusian') && (
            <>
              <IslamicCorner position="top-right" className={`absolute top-2 right-2 w-8 sm:w-12 h-8 sm:h-12 ${currentStyles.cornerColor}`} />
              <IslamicCorner position="top-left" className={`absolute top-2 left-2 w-8 sm:w-12 h-8 sm:h-12 ${currentStyles.cornerColor}`} />
              <IslamicCorner position="bottom-right" className={`absolute bottom-2 right-2 w-8 sm:w-12 h-8 sm:h-12 ${currentStyles.cornerColor}`} />
              <IslamicCorner position="bottom-left" className={`absolute bottom-2 left-2 w-8 sm:w-12 h-8 sm:h-12 ${currentStyles.cornerColor}`} />
            </>
          )}

          {isLoading || !surahDetail ? (
            <div className="py-24 text-center space-y-3 relative z-10">
              <div className="w-8 h-8 border-3 border-amber-700 border-t-transparent rounded-full animate-spin mx-auto" />
              <div className="text-sm font-amiri text-stone-500">
                جاري تحميل آيات سورة {ALL_SURAHS.find(s => s.number === selectedSurahNumber)?.name}...
              </div>
            </div>
          ) : (
            <div className="space-y-8 relative z-10">
              
              {/* Surah Header Plaque */}
              <div className={`p-6 sm:p-8 rounded-3xl border text-center relative overflow-hidden ${currentStyles.surahHeader}`}>
                <div className="flex items-center justify-center gap-2 mb-2 text-xs font-semibold uppercase tracking-wider opacity-80">
                  <Star8Rosette className="w-4 h-4" />
                  <span>الجزء {surahDetail.ayahs[0]?.juz || 1} · الصفحة {surahDetail.startPage}</span>
                  <Star8Rosette className="w-4 h-4" />
                </div>

                <h2 className="font-amiri text-3xl sm:text-5xl font-bold mb-3 tracking-wide">
                  سورة {surahDetail.name}
                </h2>

                <div className="flex flex-wrap items-center justify-center gap-4 text-xs font-medium opacity-85">
                  <span>{surahDetail.revelationArabic}</span>
                  <span>·</span>
                  <span>{surahDetail.numberOfAyahs} آيات</span>
                  <span>·</span>
                  <button
                    onClick={() => onOpenDedicationForSurah?.(`قراءة سورة ${surahDetail.name}`)}
                    className="flex items-center gap-1 text-amber-800 dark:text-amber-300 font-bold hover:underline cursor-pointer"
                  >
                    <Sparkles className="w-3.5 h-3.5" />
                    <span>إهداء ثواب قراءة هذه السورة</span>
                  </button>
                </div>
              </div>

              {/* Bismillah Header */}
              {surahDetail.number !== 9 && surahDetail.number !== 1 && (
                <BismillahHeader />
              )}

              {/* Selection Instruction Hint */}
              <div className="text-center text-xs text-stone-400 select-none">
                💡 اضغط على أي آية لتحديدها والاستماع إليها، نسخها، مشاركتها، أو قراءة تفسيرها
              </div>

              {/* LAYOUT 1: Continuous Mushaf Mode (Clean, Continuous Flow with snug natural line highlighting) */}
              {readingLayout === 'continuous' ? (
                <div
                  className={`${fontFamily === 'quran' ? 'font-quran' : 'font-amiri'} leading-[2.8] sm:leading-[3.3] text-justify transition-all select-text px-1 sm:px-4 ${currentStyles.text}`}
                  style={{
                    fontSize: `${fontSize}px`,
                    textAlignLast: 'center',
                  }}
                >
                  {surahDetail.ayahs.map((ayah) => {
                    const isSelected = selectedAyah?.numberInSurah === ayah.numberInSurah;
                    const isPlayingThisAyah = playingAyahNum === ayah.numberInSurah;
                    const displayText = cleanAyahText(ayah, surahDetail.number);

                    return (
                      <span
                        key={ayah.number}
                        ref={(el) => {
                          ayahRefs.current[ayah.numberInSurah] = el;
                        }}
                        onClick={() => setSelectedAyah(isSelected ? null : ayah)}
                        className="inline cursor-pointer group select-text transition-colors duration-150"
                        title={`اضغط لتحديد الآية ${ayah.numberInSurah}`}
                      >
                        <span
                          className={`ayah-snug ${
                            isSelected
                              ? 'ayah-selected-active'
                              : isPlayingThisAyah
                              ? 'ayah-playing-active'
                              : currentStyles.hoverAyah
                          }`}
                        >
                          <span className="align-middle">{displayText}</span>
                        </span>
                        <AyahEndMarker
                          number={ayah.numberInSurah}
                          className={isSelected ? 'text-amber-400 scale-105' : ''}
                        />
                      </span>
                    );
                  })}
                </div>
              ) : (
                /* LAYOUT 2: Verse-by-Verse Card Mode */
                <div className="space-y-4">
                  {surahDetail.ayahs.map((ayah) => {
                    const isSelected = selectedAyah?.numberInSurah === ayah.numberInSurah;
                    const isPlayingThisAyah = playingAyahNum === ayah.numberInSurah;

                    return (
                      <div
                        key={ayah.number}
                        ref={(el) => {
                          ayahRefs.current[ayah.numberInSurah] = el;
                        }}
                        onClick={() => setSelectedAyah(isSelected ? null : ayah)}
                        className={`p-5 rounded-3xl border transition-all text-right cursor-pointer ${currentStyles.card} ${
                          isSelected
                            ? 'border-amber-600 bg-amber-500/10 shadow-md ring-1 ring-amber-500/30'
                            : isPlayingThisAyah
                            ? 'border-emerald-500 bg-emerald-500/10 shadow-xs ring-1 ring-emerald-400/30'
                            : 'hover:border-amber-400/40'
                        }`}
                      >
                        <div className="flex items-center justify-between mb-3 text-xs opacity-75">
                          <span className={`font-mono px-2.5 py-0.5 rounded-lg text-xs font-bold transition-colors ${
                            isSelected ? 'bg-amber-800 text-white shadow-2xs' : 'bg-stone-500/15'
                          }`}>
                            الآية {ayah.numberInSurah}
                          </span>
                          <span className="text-[11px] opacity-70">
                            الجزء {ayah.juz} · ص {ayah.page}
                          </span>
                        </div>

                        <p
                          className={`font-quran leading-[2.5] mb-4 ${currentStyles.verseText}`}
                          style={{ fontSize: `${fontSize}px` }}
                        >
                          <span className={isSelected ? 'ayah-selected-active ayah-snug' : ''}>
                            {ayah.text}
                          </span>
                        </p>

                        <div className="pt-3 border-t border-stone-100 flex items-center justify-between">
                          <div className="flex items-center gap-1.5">
                            <button
                              type="button"
                              onClick={(e) => {
                                e.stopPropagation();
                                handlePlaySingleAyah(ayah);
                              }}
                              className="px-3 py-1.5 rounded-xl bg-amber-50 text-amber-900 hover:bg-amber-100 text-xs font-semibold flex items-center gap-1.5 cursor-pointer"
                            >
                              {isPlayingThisAyah ? (
                                <>
                                  <Pause className="w-3.5 h-3.5" />
                                  <span>إيقاف</span>
                                </>
                              ) : (
                                <>
                                  <Play className="w-3.5 h-3.5" />
                                  <span>تلاوة</span>
                                </>
                              )}
                            </button>

                            <button
                              type="button"
                              onClick={(e) => {
                                e.stopPropagation();
                                handleLoadTafsir(ayah);
                              }}
                              className="px-3 py-1.5 rounded-xl border border-stone-200 text-stone-700 hover:bg-stone-50 text-xs font-semibold flex items-center gap-1 cursor-pointer"
                            >
                              <Info className="w-3.5 h-3.5 text-stone-500" />
                              <span>التفسير</span>
                            </button>
                          </div>

                          <div className="text-xs text-amber-800 font-medium">
                            {isSelected ? 'الآية محددة حالياً' : 'اضغط للتحديد والخيارات'}
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}

              {/* Bottom Surah Navigation footer */}
              <div className="pt-8 border-t border-stone-200/60 flex items-center justify-between">
                <button
                  onClick={handlePrevSurah}
                  disabled={selectedSurahNumber <= 1}
                  className="px-4 py-2 rounded-xl bg-white border border-stone-200 text-stone-700 text-xs font-semibold hover:bg-stone-50 disabled:opacity-30 disabled:pointer-events-none cursor-pointer flex items-center gap-1.5"
                >
                  <ChevronRight className="w-4 h-4" />
                  <span>السورة السابقة</span>
                </button>

                <div className="text-center">
                  <span className="text-xs text-stone-500 font-amiri">
                    صدق الله العظيم
                  </span>
                </div>

                <button
                  onClick={handleNextSurah}
                  disabled={selectedSurahNumber >= 114}
                  className="px-4 py-2 rounded-xl bg-white border border-stone-200 text-stone-700 text-xs font-semibold hover:bg-stone-50 disabled:opacity-30 disabled:pointer-events-none cursor-pointer flex items-center gap-1.5"
                >
                  <span>السورة التالية</span>
                  <ChevronLeft className="w-4 h-4" />
                </button>
              </div>

            </div>
          )}

        </div>
      )}

    </div>
  );
};
