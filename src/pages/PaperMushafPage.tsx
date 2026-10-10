import React, { useState, useEffect, useRef, useCallback } from 'react';
import {
  ChevronRight,
  ChevronLeft,
  Bookmark,
  BookOpen,
  Volume2,
  Maximize2,
  Minimize2,
  Sparkles,
  Layers,
  Heart,
  ZoomIn,
  ZoomOut,
  VolumeX,
  Share2,
  BookMarked,
  Sliders,
  ChevronDown,
  Download
} from 'lucide-react';
import { ALL_SURAHS } from '../data/quranMeta';
import { useAudio } from '../context/AudioContext';
import { Star8Rosette } from '../components/IslamicDecoration';
import { recordDedication } from '../services/dedicationService';
import { playPaperFlipSound } from '../utils/soundEffects';
import { SurahPickerModal } from '../components/SurahPickerModal';
import { JuzPickerModal } from '../components/JuzPickerModal';
import { AyahShareModal } from '../components/AyahShareModal';
import { storageService } from '../services/storageService';

interface PaperMushafPageProps {
  initialPage?: number;
  onOpenDedication?: () => void;
}

export type PaperTheme = 'classic' | 'sepia' | 'night' | 'emerald';
export type GrabZone = 'top' | 'center' | 'bottom';

export const PaperMushafPage: React.FC<PaperMushafPageProps> = ({
  initialPage = 1,
  onOpenDedication,
}) => {
  const [currentPage, setCurrentPage] = useState<number>(() => {
    return storageService.getNumber('paper_mushaf_page', initialPage);
  });

  const [dualPageMode, setDualPageMode] = useState<boolean>(() => {
    return storageService.get<boolean>('paper_mushaf_dual', false);
  });
  const [zoomLevel, setZoomLevel] = useState<number>(() => {
    return storageService.getNumber('paper_mushaf_zoom', 100);
  });
  const [isFullscreen, setIsFullscreen] = useState<boolean>(false);
  const [isBookmarked, setIsBookmarked] = useState<boolean>(false);
  const [savedBookmarkPage, setSavedBookmarkPage] = useState<number | null>(null);
  const [paperTheme, setPaperTheme] = useState<PaperTheme>(() => {
    return storageService.getString('paper_mushaf_theme', 'classic') as PaperTheme;
  });
  const [isSoundEnabled, setIsSoundEnabled] = useState<boolean>(() => {
    return storageService.get<boolean>('paper_mushaf_sound', true);
  });
  
  // 3D Realistic Page Turning States with Dynamic Grab Zone
  const [isFlipping, setIsFlipping] = useState<boolean>(false);
  const [flipDirection, setFlipDirection] = useState<'next' | 'prev'>('next');
  const [targetPage, setTargetPage] = useState<number>(currentPage);
  const [leafRotation, setLeafRotation] = useState<number>(0);
  const [grabZone, setGrabZone] = useState<GrabZone>('center');
  const [toastMsg, setToastMsg] = useState<string | null>(null);

  // Modals for single-choice selectors & share
  const [showSurahPicker, setShowSurahPicker] = useState<boolean>(false);
  const [showJuzPicker, setShowJuzPicker] = useState<boolean>(false);
  const [showShareModal, setShowShareModal] = useState<boolean>(false);
  const [shareModalMode, setShareModalMode] = useState<'page' | 'fullQuran'>('page');

  // Direct page input
  const [jumpInput, setJumpInput] = useState<string>('');

  // Interactive Drag & Touch States
  const [dragOffset, setDragOffset] = useState<number>(0);
  const [isDragging, setIsDragging] = useState<boolean>(false);
  const dragStartXRef = useRef<number | null>(null);
  const dragStartYRef = useRef<number | null>(null);
  const dragStartTimeRef = useRef<number>(0);
  const pageContainerRef = useRef<HTMLDivElement | null>(null);
  const bookContainerRef = useRef<HTMLDivElement | null>(null);

  const { playSurah, currentReciter } = useAudio();

  // Fast Global CDN for Madinah Mushaf Pages
  const getPageImageUrl = (page: number) => {
    const padded = String(page).padStart(3, '0');
    return `https://cdn.jsdelivr.net/gh/GovarJabbar/Quran-PNG@master/${padded}.png`;
  };

  const handleImageError = (e: React.SyntheticEvent<HTMLImageElement>, page: number) => {
    const img = e.currentTarget;
    const padded = String(page).padStart(3, '0');
    const fallback1 = `https://android.quran.com/data/width_1260/page${padded}.png`;
    const fallback2 = `https://raw.githubusercontent.com/GovarJabbar/Quran-PNG/master/${padded}.png`;

    if (img.src !== fallback1) {
      img.src = fallback1;
    } else if (img.src !== fallback2) {
      img.src = fallback2;
    }
  };

  // Find current Surah and Juz for current page
  const currentSurah =
    ALL_SURAHS.slice().reverse().find((s) => s.startPage <= currentPage) || ALL_SURAHS[0];
  const currentJuz = Math.min(30, Math.floor((currentPage - 1) / 20) + 1);

  // In an authentic Madinah Mushaf spread:
  // Right page is always ODD (1, 3, 5, ...). Left page is always EVEN (2, 4, 6, ...)
  const isOddPage = currentPage % 2 !== 0;
  const spreadRightPage = isOddPage ? currentPage : Math.max(1, currentPage - 1);
  const spreadLeftPage = isOddPage ? Math.min(604, currentPage + 1) : currentPage;

  // Ultra-Fast Preloading & Decoding of Adjacent Pages for 0ms Instant Flipping
  useEffect(() => {
    const preloadAndDecode = (pageNum: number) => {
      if (pageNum >= 1 && pageNum <= 604) {
        const img = new Image();
        img.src = getPageImageUrl(pageNum);
        if ('decode' in img) {
          img.decode().catch(() => {});
        }
      }
    };
    // Preload immediate adjacent pages
    preloadAndDecode(currentPage + 1);
    preloadAndDecode(currentPage - 1);
    preloadAndDecode(currentPage + 2);
    preloadAndDecode(currentPage - 2);
    preloadAndDecode(currentPage + 3);
    preloadAndDecode(currentPage - 3);
    preloadAndDecode(currentPage + 4);
  }, [currentPage]);

  // Check saved bookmark on load
  useEffect(() => {
    try {
      const savedBm = localStorage.getItem('sadaqah_paper_mushaf_bookmark');
      if (savedBm) {
        const p = parseInt(savedBm, 10);
        setSavedBookmarkPage(p);
        setIsBookmarked(p === currentPage);
      }
    } catch (e) {}
  }, [currentPage]);

  // Sync settings and current page to storageService
  useEffect(() => {
    storageService.setNumber('paper_mushaf_page', currentPage);
    storageService.setString('paper_mushaf_theme', paperTheme);
    storageService.set('paper_mushaf_dual', dualPageMode);
    storageService.setNumber('paper_mushaf_zoom', zoomLevel);
    storageService.set('paper_mushaf_sound', isSoundEnabled);
  }, [currentPage, paperTheme, dualPageMode, zoomLevel, isSoundEnabled]);

  const showToast = (msg: string) => {
    setToastMsg(msg);
    setTimeout(() => setToastMsg(null), 2500);
  };

  // Realistic Page Turn Animation with Dynamic Corner Peeling
  const triggerPageTurn = useCallback((direction: 'next' | 'prev', newPage: number, zone: GrabZone = 'center') => {
    if (newPage < 1 || newPage > 604 || isFlipping) return;
    
    setFlipDirection(direction);
    setTargetPage(newPage);
    setGrabZone(zone);
    setIsFlipping(true);

    if (isSoundEnabled) {
      playPaperFlipSound();
    }

    // In Arabic Quran, advancing to 'next' turns the page from left to right (+180 deg)
    // Returning to 'prev' turns the page from right to left (-180 deg)
    const targetAngle = direction === 'next' ? 180 : -180;
    setLeafRotation(targetAngle);

    // Complete the turn swiftly without lag
    setTimeout(() => {
      setCurrentPage(newPage);
      setIsFlipping(false);
      setLeafRotation(0);
      setDragOffset(0);
      try {
        localStorage.setItem('sadaqah_paper_mushaf_page', String(newPage));
      } catch (e) {}
    }, 280);
  }, [isFlipping, isSoundEnabled]);

  const handleNextPage = useCallback((zone: GrabZone = 'center') => {
    if (currentPage < 604) {
      const step = dualPageMode ? 2 : 1;
      triggerPageTurn('next', Math.min(604, currentPage + step), zone);
    }
  }, [currentPage, dualPageMode, triggerPageTurn]);

  const handlePrevPage = useCallback((zone: GrabZone = 'center') => {
    if (currentPage > 1) {
      const step = dualPageMode ? 2 : 1;
      triggerPageTurn('prev', Math.max(1, currentPage - step), zone);
    }
  }, [currentPage, dualPageMode, triggerPageTurn]);

  // Keyboard navigation
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (['INPUT', 'SELECT', 'TEXTAREA'].includes((e.target as HTMLElement)?.tagName)) {
        return;
      }
      if (e.key === 'ArrowLeft') {
        // Left arrow in RTL moves forward to next page
        handleNextPage();
      } else if (e.key === 'ArrowRight') {
        // Right arrow in RTL moves backward to previous page
        handlePrevPage();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [handleNextPage, handlePrevPage]);

  // --- Real-time Interactive Touch & Drag Handlers based on Grab Zone ---
  const handleDragStart = (clientX: number, clientY: number) => {
    if (isFlipping) return;
    dragStartXRef.current = clientX;
    dragStartYRef.current = clientY;
    dragStartTimeRef.current = Date.now();
    setIsDragging(true);

    // Determine grab zone based on vertical touch position
    if (pageContainerRef.current) {
      const rect = pageContainerRef.current.getBoundingClientRect();
      const ratioY = (clientY - rect.top) / rect.height;
      if (ratioY < 0.35) {
        setGrabZone('top');
      } else if (ratioY > 0.65) {
        setGrabZone('bottom');
      } else {
        setGrabZone('center');
      }
    }
  };

  const handleDragMove = (clientX: number) => {
    if (dragStartXRef.current === null || isFlipping) return;
    const diff = clientX - dragStartXRef.current;
    const bounded = Math.max(-160, Math.min(160, diff));
    setDragOffset(bounded);

    // In Arabic Quran:
    // Dragging towards the RIGHT (diff > 0): pulling page from left to right -> NEXT PAGE!
    // Dragging towards the LEFT (diff < 0): pulling page back from right to left -> PREVIOUS PAGE!
    if (bounded > 0 && currentPage < 604) {
      const angle = (bounded / 160) * 115;
      setLeafRotation(angle);
      setTargetPage(currentPage + 1);
    } else if (bounded < 0 && currentPage > 1) {
      const angle = (bounded / 160) * 115;
      setLeafRotation(angle);
      setTargetPage(currentPage - 1);
    }
  };

  const handleDragEnd = () => {
    if (dragStartXRef.current === null) return;
    const duration = Date.now() - dragStartTimeRef.current;
    const distance = dragOffset;
    const velocity = Math.abs(distance) / Math.max(duration, 1);

    dragStartXRef.current = null;
    dragStartYRef.current = null;
    setIsDragging(false);

    // Natural Arabic Quran swipe threshold:
    // Drag to the RIGHT (distance > 30) -> NEXT PAGE
    // Drag to the LEFT (distance < -30) -> PREVIOUS PAGE
    if (distance > 30 || (distance > 15 && velocity > 0.25)) {
      handleNextPage(grabZone);
    } else if (distance < -30 || (distance < -15 && velocity > 0.25)) {
      handlePrevPage(grabZone);
    } else {
      // Spring smoothly back to flat position
      setLeafRotation(0);
      setDragOffset(0);
    }
  };

  // Touch event wrappers
  const onTouchStart = (e: React.TouchEvent) => {
    handleDragStart(e.touches[0].clientX, e.touches[0].clientY);
  };
  const onTouchMove = (e: React.TouchEvent) => {
    handleDragMove(e.touches[0].clientX);
  };
  const onTouchEnd = () => {
    handleDragEnd();
  };

  // Mouse drag wrappers
  const onMouseDown = (e: React.MouseEvent) => {
    if (e.button !== 0) return;
    handleDragStart(e.clientX, e.clientY);
  };
  const onMouseMove = (e: React.MouseEvent) => {
    if (isDragging) {
      handleDragMove(e.clientX);
    }
  };
  const onMouseUp = () => {
    if (isDragging) {
      handleDragEnd();
    }
  };

  const handleBookmarkCurrent = () => {
    try {
      localStorage.setItem('sadaqah_paper_mushaf_bookmark', String(currentPage));
      setSavedBookmarkPage(currentPage);
      setIsBookmarked(true);
      showToast(`تم حفظ علامة المصحف عند الصفحة ${currentPage}`);
    } catch (e) {}
  };

  const handleResumeBookmark = () => {
    try {
      const savedBm = localStorage.getItem('sadaqah_paper_mushaf_bookmark');
      if (savedBm) {
        const p = parseInt(savedBm, 10);
        triggerPageTurn(p > currentPage ? 'next' : 'prev', p);
        showToast(`تم الانتقال للعلامة المحفوظة: صفحة ${savedBm}`);
      } else {
        showToast('لا توجد علامة محفوظة بعد');
      }
    } catch (e) {}
  };

  const handleJumpSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const p = parseInt(jumpInput, 10);
    if (!isNaN(p) && p >= 1 && p <= 604) {
      triggerPageTurn(p > currentPage ? 'next' : 'prev', p);
      setJumpInput('');
    } else {
      showToast('رقم الصفحة يجب أن يكون بين 1 و 604');
    }
  };

  const toggleFullscreen = () => {
    if (!document.fullscreenElement) {
      bookContainerRef.current?.requestFullscreen?.();
      setIsFullscreen(true);
    } else {
      document.exitFullscreen?.();
      setIsFullscreen(false);
    }
  };

  const handleDedicatePageReading = () => {
    recordDedication(
      'surah',
      `قراءة صفحة ${currentPage} من المصحف الشريف (سورة ${currentSurah.name})`,
      'all',
      1,
      'قارئ كريم'
    );
    showToast('تقبل الله قراءتك وجعلها نوراً لأرواحهم الكريمة');
  };

  const handleSharePage = () => {
    setShowShareModal(true);
  };

  // Styling based on theme
  const getThemeStyles = () => {
    switch (paperTheme) {
      case 'sepia':
        return {
          wrapperBg: 'bg-[#F4ECE1]',
          bookCover: 'bg-[#E3D7C3] border-[#C8B89E]',
          paperBg: 'bg-[#FAF5EC] border-[#DDD3C2]',
          filter: 'sepia(0.28) contrast(1.05) brightness(0.98)',
        };
      case 'night':
        return {
          wrapperBg: 'bg-[#121418]',
          bookCover: 'bg-[#181D24] border-[#2A313C]',
          paperBg: 'bg-[#14181F] border-[#242C37]',
          filter: 'invert(0.92) hue-rotate(180deg) brightness(0.9) contrast(1.22)',
        };
      case 'emerald':
        return {
          wrapperBg: 'bg-[#EAF3EC]',
          bookCover: 'bg-[#D2E4D6] border-[#B7D4BE]',
          paperBg: 'bg-[#F2F8F4] border-[#C4DFC9]',
          filter: 'sepia(0.18) hue-rotate(85deg) contrast(1.04) brightness(0.98)',
        };
      default: // classic
        return {
          wrapperBg: 'bg-[#F8F6F0]',
          bookCover: 'bg-[#EFEAE0] border-[#DDD5C5]',
          paperBg: 'bg-[#FCFBF7] border-[#D9D1C1]',
          filter: 'none',
        };
    }
  };

  const themeStyles = getThemeStyles();

  // Dynamic 3D Transform based on corner where the user grabbed the paper
  const getLeafTransform = () => {
    if (grabZone === 'top') {
      return {
        transformOrigin: 'top right',
        transform: `rotateZ(-4deg) rotateY(${leafRotation}deg) skewY(-2deg)`,
      };
    } else if (grabZone === 'bottom') {
      return {
        transformOrigin: 'bottom right',
        transform: `rotateZ(4deg) rotateY(${leafRotation}deg) skewY(2deg)`,
      };
    }
    return {
      transformOrigin: 'right center',
      transform: `rotateY(${leafRotation}deg)`,
    };
  };

  return (
    <div
      ref={bookContainerRef}
      className={`max-w-7xl mx-auto px-2 sm:px-6 lg:px-8 py-4 sm:py-6 space-y-4 text-right transition-colors duration-300 select-none ${
        paperTheme === 'night' ? 'text-stone-200' : 'text-stone-900'
      }`}
    >
      {/* Toast Alert */}
      {toastMsg && (
        <div className="fixed top-20 left-1/2 -translate-x-1/2 z-50 px-4 py-2.5 rounded-xl bg-stone-900/95 text-amber-200 text-xs font-semibold shadow-2xl backdrop-blur-md border border-amber-500/20 animate-in fade-in zoom-in-95 duration-150">
          {toastMsg}
        </div>
      )}

      {/* Surah Single-Choice Picker Modal */}
      <SurahPickerModal
        isOpen={showSurahPicker}
        onClose={() => setShowSurahPicker(false)}
        selectedSurahNumber={currentSurah.number}
        onSelectSurah={(surahNum) => {
          const s = ALL_SURAHS.find((item) => item.number === surahNum);
          if (s) {
            triggerPageTurn(s.startPage > currentPage ? 'next' : 'prev', s.startPage);
          }
        }}
      />

      {/* Juz Single-Choice Picker Modal */}
      <JuzPickerModal
        isOpen={showJuzPicker}
        onClose={() => setShowJuzPicker(false)}
        selectedJuzNumber={currentJuz}
        onSelectJuz={(juzNum: number) => {
          const startPage = (juzNum - 1) * 20 + 1;
          triggerPageTurn(startPage > currentPage ? 'next' : 'prev', startPage);
        }}
      />

      {/* Full Page and Surah PDF / Image Share Modal */}
      <AyahShareModal
        isOpen={showShareModal}
        onClose={() => setShowShareModal(false)}
        initialMode={shareModalMode}
        pageNumber={currentPage}
        surahName={currentSurah.name}
        surahNumber={currentSurah.number}
        onNavigateToMushafPage={(pageNum) => triggerPageTurn(pageNum > currentPage ? 'next' : 'prev', pageNum)}
      />

      {/* Top Quick Bar */}
      <div className="flex flex-wrap items-center justify-between gap-3 p-3 sm:p-4 rounded-2xl bg-white dark:bg-stone-900 border border-stone-200 dark:border-stone-800 shadow-xs">
        {/* Right Info: Bookmark, Resume, Dedication, Share */}
        <div className="flex items-center gap-2 sm:gap-3 flex-wrap">
          {/* Bookmark Button */}
          <button
            onClick={handleBookmarkCurrent}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl border text-xs font-semibold transition-all cursor-pointer ${
              isBookmarked
                ? 'bg-amber-100 dark:bg-stone-800 border-amber-400 dark:border-stone-700 text-amber-900 dark:text-amber-300 shadow-xs'
                : 'border-stone-200 dark:border-stone-750 hover:border-amber-400 bg-stone-50 dark:bg-stone-850 hover:bg-amber-50/50 text-stone-700 dark:text-stone-300'
            }`}
            title="حفظ علامة عند هذه الصفحة"
          >
            <Bookmark className={`w-3.5 h-3.5 ${isBookmarked ? 'fill-amber-600 text-amber-600' : 'text-stone-400'}`} />
            <span>{isBookmarked ? 'علامة محفوظة' : 'حفظ علامة'}</span>
          </button>

          {/* Resume Bookmark */}
          {savedBookmarkPage && savedBookmarkPage !== currentPage && (
            <button
              onClick={handleResumeBookmark}
              className="flex items-center gap-1 text-xs text-amber-800 dark:text-amber-300 hover:text-amber-900 bg-amber-50 dark:bg-stone-800 hover:bg-amber-100/70 border border-amber-200 dark:border-stone-700 px-2.5 py-1.5 rounded-xl transition-colors cursor-pointer"
              title="متابعة القراءة من العلامة المحفوظة"
            >
              <BookMarked className="w-3.5 h-3.5" />
              <span>متابعة من ص {savedBookmarkPage}</span>
            </button>
          )}

          {/* Dedicate Page Button */}
          <button
            onClick={handleDedicatePageReading}
            className="flex items-center gap-1 px-2.5 py-1.5 rounded-xl border border-stone-200 dark:border-stone-750 hover:border-amber-300 bg-stone-50 dark:bg-stone-850 hover:bg-amber-50 text-xs font-semibold text-stone-700 dark:text-stone-300 hover:text-amber-900 dark:hover:text-amber-300 transition-colors cursor-pointer"
            title="إهداء ثواب قراءة هذه الصفحة"
          >
            <Heart className="w-3.5 h-3.5 text-amber-600 dark:text-amber-400" />
            <span className="hidden sm:inline">إهداء ثواب الصفحة</span>
          </button>

          {/* Share Framed Page Button */}
          <button
            onClick={() => {
              setShareModalMode('page');
              setShowShareModal(true);
            }}
            className="flex items-center gap-1 px-2.5 py-1.5 rounded-xl border border-amber-300 dark:border-stone-700 bg-amber-50 dark:bg-stone-800 hover:bg-amber-100 text-xs font-semibold text-amber-900 dark:text-amber-300 transition-colors cursor-pointer shadow-2xs"
            title="مشاركة وتصدير صفحة المصحف كصورة مؤطرة أو PDF"
          >
            <Share2 className="w-3.5 h-3.5 text-amber-700 dark:text-amber-400" />
            <span className="hidden sm:inline">مشاركة وتصدير الصفحة</span>
            <span className="sm:hidden">مشاركة</span>
          </button>

          {/* Download Full Quran or Mushaf PDF Button */}
          <button
            onClick={() => {
              setShareModalMode('fullQuran');
              setShowShareModal(true);
            }}
            className="flex items-center gap-1 px-2.5 py-1.5 rounded-xl border border-stone-200 dark:border-stone-750 hover:border-amber-300 bg-stone-50 dark:bg-stone-850 hover:bg-amber-50 text-xs font-semibold text-stone-700 dark:text-stone-300 hover:text-amber-900 dark:hover:text-amber-300 transition-colors cursor-pointer shadow-2xs"
            title="تنزيل المصحف كاملاً كملف PDF رسمي أو حسب الأجزاء"
          >
            <Download className="w-3.5 h-3.5 text-amber-600 dark:text-amber-400" />
            <span className="hidden sm:inline">تنزيل المصحف PDF</span>
            <span className="sm:hidden">PDF</span>
          </button>
        </div>

        {/* Center: Surah & Juz Pickers */}
        <div className="flex items-center gap-2 flex-wrap">
          {/* Surah Trigger Button */}
          <button
            onClick={() => setShowSurahPicker(true)}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl border border-stone-200 hover:border-amber-400 bg-stone-50 hover:bg-amber-50/50 text-xs font-semibold text-stone-800 transition-all cursor-pointer group shadow-2xs"
            title="تغيير السورة"
          >
            <span className="text-stone-400 font-normal">السورة:</span>
            <span className="font-amiri text-sm text-amber-900 group-hover:text-amber-950 font-bold">
              سورة {currentSurah.name}
            </span>
            <ChevronDown className="w-3.5 h-3.5 text-stone-400 group-hover:text-amber-800" />
          </button>

          {/* Juz Trigger Button */}
          <button
            onClick={() => setShowJuzPicker(true)}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl border border-stone-200 hover:border-amber-400 bg-stone-50 hover:bg-amber-50/50 text-xs font-semibold text-stone-800 transition-all cursor-pointer group shadow-2xs"
            title="تغيير الجزء القرآني"
          >
            <span className="text-stone-400 font-normal">الجزء:</span>
            <span className="text-amber-900 group-hover:text-amber-950 font-bold">
              الجزء {currentJuz}
            </span>
            <ChevronDown className="w-3.5 h-3.5 text-stone-400 group-hover:text-amber-800" />
          </button>

          {/* Direct Page Input Form */}
          <form onSubmit={handleJumpSubmit} className="flex items-center gap-1">
            <span className="text-stone-400 font-medium">صفحة:</span>
            <input
              type="number"
              min="1"
              max="604"
              value={jumpInput}
              onChange={(e) => setJumpInput(e.target.value)}
              placeholder={String(currentPage)}
              className="w-14 sm:w-16 px-1.5 py-1 text-center rounded-lg border border-stone-200 bg-stone-50 text-xs focus:outline-hidden focus:border-amber-700 font-mono text-stone-800"
            />
            <button
              type="submit"
              className="px-2 py-1 rounded-lg bg-stone-800 text-white font-semibold hover:bg-stone-900 cursor-pointer text-xs"
            >
              انتقال
            </button>
          </form>
        </div>

        {/* View, Sound & Visual Settings */}
        <div className="flex items-center gap-1.5 sm:gap-2 flex-wrap">
          {/* Paper Sound Toggle */}
          <button
            onClick={() => {
              setIsSoundEnabled(!isSoundEnabled);
              showToast(isSoundEnabled ? 'تم كتم صوت تقليب الورق' : 'تم تفعيل صوت تقليب الورق الواقعي');
            }}
            className={`p-1.5 rounded-lg border cursor-pointer transition-colors ${
              isSoundEnabled
                ? 'bg-amber-50 border-amber-300 text-amber-900'
                : 'border-stone-200 text-stone-400 hover:bg-stone-100'
            }`}
            title={isSoundEnabled ? 'صوت تقليب الورق مفعّل' : 'تفعيل صوت تقليب الورق'}
          >
            {isSoundEnabled ? <Volume2 className="w-3.5 h-3.5" /> : <VolumeX className="w-3.5 h-3.5" />}
          </button>

          {/* Paper Theme Selectors */}
          <div className="flex items-center gap-1 border border-stone-200 rounded-lg p-0.5 bg-stone-50">
            <button
              onClick={() => setPaperTheme('classic')}
              className={`w-5 h-5 rounded-md text-[10px] font-bold transition-all cursor-pointer ${
                paperTheme === 'classic'
                  ? 'bg-white text-stone-900 shadow-xs border border-stone-300'
                  : 'text-stone-400 hover:text-stone-700'
              }`}
              title="ورق كلاسيكي أصيل"
            >
              أ
            </button>
            <button
              onClick={() => setPaperTheme('sepia')}
              className={`w-5 h-5 rounded-md text-[10px] font-bold transition-all cursor-pointer ${
                paperTheme === 'sepia'
                  ? 'bg-[#EFE5D3] text-amber-950 shadow-xs border border-amber-300'
                  : 'text-stone-400 hover:text-stone-700'
              }`}
              title="مخطوطة سيبيا دافئة"
            >
              س
            </button>
            <button
              onClick={() => setPaperTheme('emerald')}
              className={`w-5 h-5 rounded-md text-[10px] font-bold transition-all cursor-pointer ${
                paperTheme === 'emerald'
                  ? 'bg-[#E2EFE6] text-emerald-950 shadow-xs border border-emerald-300'
                  : 'text-stone-400 hover:text-stone-700'
              }`}
              title="أخضر رحماني هادئ"
            >
              خ
            </button>
            <button
              onClick={() => setPaperTheme('night')}
              className={`w-5 h-5 rounded-md text-[10px] font-bold transition-all cursor-pointer ${
                paperTheme === 'night'
                  ? 'bg-stone-900 text-white shadow-xs'
                  : 'text-stone-400 hover:text-stone-700'
              }`}
              title="وضع ليلي مريح للعين"
            >
              ل
            </button>
          </div>

          {/* Dual Page toggle on large screens */}
          <button
            onClick={() => setDualPageMode(!dualPageMode)}
            className={`hidden lg:flex items-center gap-1 px-2.5 py-1 rounded-lg border cursor-pointer transition-colors ${
              dualPageMode
                ? 'bg-amber-100 border-amber-300 text-amber-900 font-bold'
                : 'border-stone-200 text-stone-600 hover:bg-stone-100'
            }`}
            title="عرض صفحتين متقابلتين كالمصحف المفتوح"
          >
            <Layers className="w-3.5 h-3.5" />
            <span>صفحتان</span>
          </button>

          {/* Zoom Controls */}
          <button
            onClick={() => setZoomLevel((z) => Math.max(80, z - 10))}
            className="p-1 rounded-lg border border-stone-200 text-stone-600 hover:bg-stone-100 cursor-pointer"
            title="تصغير"
          >
            <ZoomOut className="w-3.5 h-3.5" />
          </button>
          <span className="font-mono text-[11px] text-stone-400 select-none">{zoomLevel}%</span>
          <button
            onClick={() => setZoomLevel((z) => Math.min(140, z + 10))}
            className="p-1 rounded-lg border border-stone-200 text-stone-600 hover:bg-stone-100 cursor-pointer"
            title="تكبير"
          >
            <ZoomIn className="w-3.5 h-3.5" />
          </button>

          {/* Fullscreen */}
          <button
            onClick={toggleFullscreen}
            className="p-1.5 rounded-lg border border-stone-200 text-stone-600 hover:bg-stone-100 cursor-pointer"
            title="وضع ملء الشاشة للقراءة الهادئة"
          >
            {isFullscreen ? <Minimize2 className="w-3.5 h-3.5" /> : <Maximize2 className="w-3.5 h-3.5" />}
          </button>
        </div>
      </div>

      {/* Main Mushaf Realistic Reading Viewport with STATIONARY BASE & 3D CORNER-AWARE FOLD */}
      <div
        ref={pageContainerRef}
        onMouseDown={onMouseDown}
        onMouseMove={onMouseMove}
        onMouseUp={onMouseUp}
        onTouchStart={onTouchStart}
        onTouchMove={onTouchMove}
        onTouchEnd={onTouchEnd}
        className={`relative p-2 sm:p-6 lg:p-8 rounded-3xl border-4 shadow-2xl flex flex-col items-center justify-center overflow-hidden transition-all duration-300 cursor-grab active:cursor-grabbing select-none ${themeStyles.bookCover}`}
      >
        {/* Hanging Bookmark Ribbon Visual Indicator */}
        {isBookmarked && (
          <div
            className="absolute top-0 right-10 sm:right-16 z-30 flex flex-col items-center pointer-events-none drop-shadow-md animate-in slide-in-from-top-4 duration-300"
            title="علامة القراءة المحفوظة"
          >
            <div className="w-6 sm:w-8 h-12 sm:h-16 bg-gradient-to-b from-amber-700 via-amber-800 to-amber-900 border-x border-amber-600 rounded-b-xs shadow-md flex items-end justify-center pb-2">
              <Star8Rosette className="w-3 h-3 text-amber-200" />
            </div>
            <div className="w-0 h-0 border-l-[12px] sm:border-l-[16px] border-l-transparent border-r-[12px] sm:border-r-[16px] border-r-transparent border-t-[10px] sm:border-t-[12px] border-t-amber-900" />
          </div>
        )}

        {/* Corner Peel Interactive Buttons (Left for Next, Right for Prev) */}
        {/* Next Page Peels (Left Side in Arabic Quran) */}
        <button
          onClick={() => handleNextPage('top')}
          disabled={currentPage >= 604}
          className="absolute top-12 left-4 z-30 w-8 h-8 rounded-full bg-amber-500/10 hover:bg-amber-500/30 text-amber-900 opacity-60 hover:opacity-100 transition-all flex items-center justify-center cursor-pointer disabled:opacity-0"
          title="ثني الصفحة من الركن العلوي الأيسر (الصفحة التالية)"
        >
          <span className="text-[10px] font-bold">↖</span>
        </button>

        <button
          onClick={() => handleNextPage('bottom')}
          disabled={currentPage >= 604}
          className="absolute bottom-16 left-4 z-30 w-8 h-8 rounded-full bg-amber-500/10 hover:bg-amber-500/30 text-amber-900 opacity-60 hover:opacity-100 transition-all flex items-center justify-center cursor-pointer disabled:opacity-0"
          title="ثني الصفحة من الركن السفلي الأيسر (الصفحة التالية)"
        >
          <span className="text-[10px] font-bold">↙</span>
        </button>

        {/* Previous Page Peels (Right Side in Arabic Quran) */}
        <button
          onClick={() => handlePrevPage('top')}
          disabled={currentPage <= 1}
          className="absolute top-12 right-4 z-30 w-8 h-8 rounded-full bg-amber-500/10 hover:bg-amber-500/30 text-amber-900 opacity-60 hover:opacity-100 transition-all flex items-center justify-center cursor-pointer disabled:opacity-0"
          title="ثني الصفحة من الركن العلوي الأيمن (الصفحة السابقة)"
        >
          <span className="text-[10px] font-bold">↗</span>
        </button>

        <button
          onClick={() => handlePrevPage('bottom')}
          disabled={currentPage <= 1}
          className="absolute bottom-16 right-4 z-30 w-8 h-8 rounded-full bg-amber-500/10 hover:bg-amber-500/30 text-amber-900 opacity-60 hover:opacity-100 transition-all flex items-center justify-center cursor-pointer disabled:opacity-0"
          title="ثني الصفحة من الركن السفلي الأيمن (الصفحة السابقة)"
        >
          <span className="text-[10px] font-bold">↘</span>
        </button>

        {/* Floating Side Navigation Buttons for Desktop & Tablet */}
        <button
          onClick={() => handlePrevPage('center')}
          disabled={currentPage <= 1}
          className="hidden sm:flex absolute right-3 lg:right-6 top-1/2 -translate-y-1/2 z-20 w-11 h-11 rounded-2xl bg-white/95 hover:bg-white text-stone-800 hover:text-amber-900 shadow-xl border border-stone-300/80 items-center justify-center transition-all hover:scale-105 active:scale-95 disabled:opacity-20 disabled:pointer-events-none cursor-pointer group"
          title="الصفحة السابقة (السهم الأيمن →)"
        >
          <ChevronRight className="w-6 h-6 transition-transform group-hover:translate-x-0.5" />
        </button>

        <button
          onClick={() => handleNextPage('center')}
          disabled={currentPage >= 604}
          className="hidden sm:flex absolute left-3 lg:left-6 top-1/2 -translate-y-1/2 z-20 w-11 h-11 rounded-2xl bg-white/95 hover:bg-white text-stone-800 hover:text-amber-900 shadow-xl border border-stone-300/80 items-center justify-center transition-all hover:scale-105 active:scale-95 disabled:opacity-20 disabled:pointer-events-none cursor-pointer group"
          title="الصفحة التالية (السهم الأيسر ←)"
        >
          <ChevronLeft className="w-6 h-6 transition-transform group-hover:-translate-x-0.5" />
        </button>

        {/* Top Page Header */}
        <div className="w-full max-w-4xl flex items-center justify-between text-xs sm:text-sm font-amiri font-bold px-4 py-2 border-b border-stone-300/80 mb-3 select-none">
          <div className="flex items-center gap-2">
            <span className="text-amber-800">الجزء {currentJuz}</span>
            <span className="text-stone-400">·</span>
            <span className="text-stone-500 font-sans text-[11px]">الحزب {Math.ceil(currentJuz * 2)}</span>
          </div>

          <div className="hidden sm:flex items-center gap-2 text-stone-500 font-sans text-xs">
            <Star8Rosette className="w-3.5 h-3.5 text-amber-700" />
            <span>مصحف المدينة النبوية الشريفة</span>
            <Star8Rosette className="w-3.5 h-3.5 text-amber-700" />
          </div>

          <div className="flex items-center gap-2">
            <span className="text-amber-800 font-bold">سورة {currentSurah.name}</span>
            <span className="text-stone-400 text-xs hidden sm:inline">({currentSurah.revelationArabic})</span>
          </div>
        </div>

        {/* 3D BOOK DESK (Mushaf Base Remains Stationary, Page Folds in 3D Perspective) */}
        <div
          className="mushaf-perspective relative flex items-center justify-center gap-2 sm:gap-4 transition-transform duration-200"
          style={{
            transform: `scale(${zoomLevel / 100})`,
            transformOrigin: 'top center',
          }}
        >
          {/* Dual Page Mode: RIGHT PAGE (Odd page in Arabic Mushaf, e.g. 1, 3, 5...) */}
          {dualPageMode && (
            <div
              className={`relative rounded-2xl shadow-xl overflow-hidden border max-w-[450px] p-2 sm:p-4 select-none ${themeStyles.paperBg}`}
            >
              <div className="absolute top-2 right-3 text-[11px] font-mono text-stone-400 font-bold">
                {spreadRightPage}
              </div>
              <img
                src={getPageImageUrl(spreadRightPage)}
                onError={(e) => handleImageError(e, spreadRightPage)}
                alt={`مصحف الصفحة ${spreadRightPage}`}
                className="w-full h-auto object-contain max-h-[750px] rounded-lg transition-all pointer-events-none"
                style={{
                  filter: themeStyles.filter,
                  imageRendering: 'auto',
                  WebkitFontSmoothing: 'antialiased',
                }}
                loading="eager"
                draggable={false}
              />
            </div>
          )}

          {/* Central Book Spine Shadow in Dual Mode */}
          {dualPageMode && (
            <div className="hidden md:block w-4 h-[720px] bg-gradient-to-r from-stone-400/30 via-stone-500/50 to-stone-400/30 shadow-inner rounded-full -mx-2 z-10 pointer-events-none" />
          )}

          {/* SINGLE PAGE BED (OR LEFT PAGE IN DUAL MODE) */}
          <div className="relative max-w-[490px] w-full">
            
            {/* UNDERNEATH TARGET PAGE (ALREADY rendered in DOM for instant 0ms appearance) */}
            <div
              className={`rounded-2xl shadow-md overflow-hidden border max-w-[490px] p-2 sm:p-4 select-none relative ${themeStyles.paperBg}`}
            >
              <div className="absolute top-2 left-3 text-[11px] font-mono text-stone-400 font-bold">
                {dualPageMode ? spreadLeftPage : isFlipping ? targetPage : currentPage}
              </div>
              <img
                src={getPageImageUrl(dualPageMode ? spreadLeftPage : isFlipping ? targetPage : currentPage)}
                onError={(e) => handleImageError(e, dualPageMode ? spreadLeftPage : isFlipping ? targetPage : currentPage)}
                alt={`مصحف الصفحة`}
                className="w-full h-auto object-contain max-h-[780px] rounded-lg transition-all pointer-events-none"
                style={{
                  filter: themeStyles.filter,
                  imageRendering: 'auto',
                  WebkitFontSmoothing: 'antialiased',
                }}
                loading="eager"
                draggable={false}
              />
            </div>

            {/* FLIPPING 3D PAPER LEAF (Folds from the corner/zone where grabbed) */}
            {!dualPageMode && (isFlipping || isDragging) && (
              <div
                className={`mushaf-page-leaf absolute inset-0 rounded-2xl shadow-2xl overflow-hidden border p-2 sm:p-4 select-none z-20 ${
                  isDragging ? 'transition-none' : 'transition-transform duration-300 ease-out'
                } ${themeStyles.paperBg}`}
                style={getLeafTransform()}
              >
                {/* Page number top indicator */}
                <div className="absolute top-2 right-3 text-[11px] font-mono text-stone-400 font-bold">
                  {currentPage}
                </div>

                {/* Page Image */}
                <img
                  src={getPageImageUrl(currentPage)}
                  onError={(e) => handleImageError(e, currentPage)}
                  alt={`مصحف الصفحة ${currentPage}`}
                  className="w-full h-auto object-contain max-h-[780px] rounded-lg transition-all pointer-events-none"
                  style={{
                    filter: themeStyles.filter,
                    imageRendering: 'auto',
                    WebkitFontSmoothing: 'antialiased',
                  }}
                  draggable={false}
                />

                {/* Moving Paper Crease & Curl Shading Overlay */}
                <div
                  className="mushaf-page-curl-shadow absolute inset-0 pointer-events-none transition-opacity"
                  style={{
                    opacity: Math.min(1, Math.abs(leafRotation) / 90),
                  }}
                />

                {/* Spine Shadow */}
                <div className="mushaf-spine-shadow absolute inset-y-0 right-0 w-8 pointer-events-none" />
              </div>
            )}

          </div>

        </div>

        {/* Bottom Page Number & Navigation Buttons (Harmonized with Arabic RTL) */}
        <div className="w-full max-w-4xl flex items-center justify-between pt-5 border-t border-stone-300/80 mt-4 px-2 sm:px-4 select-none">
          {/* Previous Page Button (Right in RTL - رجوع للخلف نحو البداية) */}
          <button
            onClick={() => handlePrevPage('center')}
            disabled={currentPage <= 1}
            className="flex items-center gap-1.5 sm:gap-2 px-4 sm:px-6 py-2.5 rounded-xl bg-stone-100 hover:bg-stone-200 disabled:opacity-30 disabled:pointer-events-none text-stone-800 text-xs sm:text-sm font-bold border border-stone-300 transition-all cursor-pointer shadow-xs active:scale-95"
            title="الانتقال إلى الصفحة السابقة (السهم الأيمن →)"
          >
            <ChevronRight className="w-4 h-4" />
            <span>الصفحة السابقة</span>
          </button>

          {/* Current Page Pill Display */}
          <div className="flex flex-col items-center">
            <span className="font-mono text-sm sm:text-base font-bold text-amber-900 bg-amber-50/90 border border-amber-300/80 px-4 py-1.5 rounded-2xl shadow-2xs">
              صفحة {currentPage} من 604
            </span>
            <span className="text-[10px] text-stone-400 mt-1 hidden sm:inline">
              اسحب الورقة لليمين للتقدم، أو لليسار للرجوع
            </span>
          </div>

          {/* Next Page Button (Left in RTL - تقدم للأمام نحو النهاية) */}
          <button
            onClick={() => handleNextPage('center')}
            disabled={currentPage >= 604}
            className="flex items-center gap-1.5 sm:gap-2 px-4 sm:px-6 py-2.5 rounded-xl bg-amber-800 hover:bg-amber-900 disabled:opacity-30 disabled:pointer-events-none text-white text-xs sm:text-sm font-bold transition-all cursor-pointer shadow-md active:scale-95"
            title="الانتقال إلى الصفحة التالية (السهم الأيسر ←)"
          >
            <span>الصفحة التالية</span>
            <ChevronLeft className="w-4 h-4" />
          </button>
        </div>

      </div>

    </div>
  );
};
