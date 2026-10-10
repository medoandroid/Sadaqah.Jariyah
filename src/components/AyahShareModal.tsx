import React, { useState, useRef, useEffect, useMemo } from 'react';
import {
  Download,
  Share2,
  Copy,
  Check,
  X,
  Palette,
  Sparkles,
  BookOpen,
  Image as ImageIcon,
  FileText,
  ChevronRight,
  ChevronLeft,
  Loader2,
  Layers,
  FileDown,
  Info,
  BookMarked,
  ExternalLink,
  SlidersHorizontal,
  Search,
  Type,
  RefreshCw,
  Eye,
  Sliders,
  AlignRight,
  Bookmark,
  CheckSquare,
  Square,
  ListOrdered,
  ListFilter,
  CheckCircle2,
  Sparkle,
  SlidersVertical,
} from 'lucide-react';
import { ALL_SURAHS, ALL_JUZ_METADATA, JuzMeta } from '../data/quranMeta';
import { fetchSurahDetail } from '../services/quranService';
import { Ayah, SurahDetail } from '../types';
import { toArabicDigits } from './IslamicDecoration';
import {
  paginateSurahAyahs,
  generateSurahPdf,
  generateMushafPagePdf,
  renderMushafPageCanvas,
  downloadMushafPageWithFrame,
  copyCanvasToClipboard,
  generateCustomRangePdf,
  generateJuzPdf,
  downloadCanvasAsImage,
  OFFICIAL_QURAN_EDITIONS,
  FullQuranEdition,
  MushafFrameTheme,
  PdfGenerationProgress,
} from '../services/quranPdfService';
import { jsPDF } from 'jspdf';
import { SurahPickerModal } from './SurahPickerModal';
import { POPULAR_QURAN_PRESETS, QuranPreset } from '../data/quranPresets';
import { CustomSelect } from './CustomSelect';

export type ShareMode = 'ayah' | 'juz' | 'editions' | 'surah' | 'page' | 'fullQuran';
export type CardTheme = 'parchment' | 'royalDark' | 'emerald' | 'midnight' | 'ruby' | 'amber';
export type CardAspectRatio = 'portrait' | 'story' | 'square' | 'banner';
export type CardFontFamily = 'amiri' | 'ibm' | 'cairo';
export type CardFontSize = 'auto' | 'small' | 'normal' | 'large' | 'huge';
export type AyahSelectionMode = 'range' | 'picker' | 'single' | 'presets' | 'custom';

export interface AyahShareModalProps {
  isOpen: boolean;
  onClose: () => void;
  surahName?: string;
  surahNumber?: number;
  ayahNumber?: number;
  ayahText?: string;
  initialMode?: ShareMode;
  pageNumber?: number;
  onNavigateToMushafPage?: (pageNum: number) => void;
}

interface ThemeConfig {
  id: CardTheme;
  name: string;
  bgColor: string;
  textColor: string;
  accentColor: string;
  borderColor: string;
  metaColor: string;
  footerBg: string;
  badgeBg: string;
}

const AYAH_THEMES: ThemeConfig[] = [
  {
    id: 'parchment',
    name: 'مصحف المدينة (مذهب)',
    bgColor: '#FAF8F3',
    textColor: '#1C1917',
    accentColor: '#B45309',
    borderColor: '#D4AF37',
    metaColor: '#92400E',
    footerBg: 'rgba(180, 83, 9, 0.08)',
    badgeBg: 'bg-amber-100 text-amber-950',
  },
  {
    id: 'royalDark',
    name: 'ملكي داكن مذهب',
    bgColor: '#12141A',
    textColor: '#FDFBF7',
    accentColor: '#D97706',
    borderColor: '#B45309',
    metaColor: '#FBBF24',
    footerBg: 'rgba(217, 119, 6, 0.12)',
    badgeBg: 'bg-stone-800 text-amber-300',
  },
  {
    id: 'emerald',
    name: 'الروضة الزمردية',
    bgColor: '#0B2219',
    textColor: '#F0FDF4',
    accentColor: '#34D399',
    borderColor: '#10B981',
    metaColor: '#6EE7B7',
    footerBg: 'rgba(16, 185, 129, 0.15)',
    badgeBg: 'bg-emerald-950 text-emerald-300',
  },
  {
    id: 'midnight',
    name: 'سماء الليل الكحلي',
    bgColor: '#0F172A',
    textColor: '#F8FAFC',
    accentColor: '#38BDF8',
    borderColor: '#0284C7',
    metaColor: '#7DD3FC',
    footerBg: 'rgba(56, 189, 248, 0.12)',
    badgeBg: 'bg-slate-800 text-sky-300',
  },
  {
    id: 'ruby',
    name: 'عقيق أندلسي',
    bgColor: '#230E14',
    textColor: '#FFF1F2',
    accentColor: '#FB7185',
    borderColor: '#E11D48',
    metaColor: '#FDA4AF',
    footerBg: 'rgba(244, 63, 94, 0.15)',
    badgeBg: 'bg-rose-950 text-rose-300',
  },
  {
    id: 'amber',
    name: 'كهرمان دافئ',
    bgColor: '#1C150A',
    textColor: '#FFFBEB',
    accentColor: '#F59E0B',
    borderColor: '#D97706',
    metaColor: '#FCD34D',
    footerBg: 'rgba(245, 158, 11, 0.15)',
    badgeBg: 'bg-amber-950 text-amber-300',
  },
];

const PAGE_FRAME_THEMES: { id: MushafFrameTheme; name: string; color: string; border: string }[] = [
  { id: 'gold', name: 'ذهب المدينة الملكي', color: '#FAF8F3', border: '#B45309' },
  { id: 'emerald', name: 'الروضة الزمردية', color: '#F2F8F4', border: '#047857' },
  { id: 'royalDark', name: 'ملكي داكن مذهب', color: '#11151C', border: '#D97706' },
  { id: 'parchment', name: 'مخطوطة سيبيا عتيقة', color: '#F5EFE1', border: '#92400E' },
];

// Helper to remove duplicate Bismillah in Ayah 1
function cleanAyahText(text: string, surahNum: number, ayahNum: number): string {
  if (surahNum === 1 || surahNum === 9 || ayahNum !== 1) return text;
  return text.replace(/^بِسْمِ\s+اللَّهِ\s+الرَّحْمَٰنِ\s+الرَّحِيمِ\s*/u, '').trim() || text;
}

export const AyahShareModal: React.FC<AyahShareModalProps> = ({
  isOpen,
  onClose,
  surahName: initialSurahName = 'الفاتحة',
  surahNumber: initialSurahNumber = 1,
  ayahNumber: initialAyahNumber = 1,
  ayahText: initialAyahText = 'بِسْمِ اللَّهِ الرَّحْمَٰنِ الرَّحِيمِ',
  initialMode = 'ayah',
  pageNumber: initialPageNumber = 1,
  onNavigateToMushafPage,
}) => {
  // Normalize initialMode (if 'fullQuran', map to 'juz')
  const normalizedInitialMode: ShareMode = initialMode === 'fullQuran' ? 'juz' : initialMode;
  const [activeTab, setActiveTab] = useState<ShareMode>(normalizedInitialMode);

  // Styling & Customization States
  const [selectedTheme, setSelectedTheme] = useState<CardTheme>('parchment');
  const [selectedFont, setSelectedFont] = useState<CardFontFamily>('amiri');
  const [cardAspectRatio, setCardAspectRatio] = useState<CardAspectRatio>('portrait');
  const [cardFontSize, setCardFontSize] = useState<CardFontSize>('auto');
  const [pageFrameTheme, setPageFrameTheme] = useState<MushafFrameTheme>('gold');

  // Toggle options for design card
  const [showBismillah, setShowBismillah] = useState<boolean>(true);
  const [showSurahBadge, setShowSurahBadge] = useState<boolean>(true);
  const [showAyahNumbers, setShowAyahNumbers] = useState<boolean>(true);
  const [showDedicationFooter, setShowDedicationFooter] = useState<boolean>(true);
  const [customDedicationText, setCustomDedicationText] = useState<string>('اللهم اجعل القرآن العظيم ربيع قلوبنا ونور صدورنا');

  // Active Surah & Ayah Selection
  const [currentSurahNum, setCurrentSurahNum] = useState<number>(initialSurahNumber);
  const [currentPageNum, setCurrentPageNum] = useState<number>(initialPageNumber);
  const [isSurahPickerOpen, setIsSurahPickerOpen] = useState<boolean>(false);

  // Multi-Ayah Selection
  const [ayahSelectionMode, setAyahSelectionMode] = useState<AyahSelectionMode>('range');
  const [rangeStartAyah, setRangeStartAyah] = useState<number>(initialAyahNumber || 1);
  const [rangeEndAyah, setRangeEndAyah] = useState<number>(initialAyahNumber ? Math.min(initialAyahNumber + 2, 286) : 3);
  const [selectedAyahNumbers, setSelectedAyahNumbers] = useState<number[]>([initialAyahNumber || 1]);
  const [selectedPresetId, setSelectedPresetId] = useState<string | null>(null);
  const [activeAyahText, setActiveAyahText] = useState<string>(initialAyahText);
  const [isEditingCustomText, setIsEditingCustomText] = useState<boolean>(false);

  // Surah Details Cache for multi-ayah queries
  const [surahDetail, setSurahDetail] = useState<SurahDetail | null>(null);
  const [loadingSurah, setLoadingSurah] = useState<boolean>(false);

  // Status & Feedback
  const [copied, setCopied] = useState(false);
  const [copiedImage, setCopiedImage] = useState(false);
  const [generatingPdf, setGeneratingPdf] = useState(false);
  const [generatingFramedImage, setGeneratingFramedImage] = useState(false);
  const [pdfProgress, setPdfProgress] = useState<PdfGenerationProgress | null>(null);
  const [statusFeedback, setStatusFeedback] = useState<{ type: 'success' | 'error' | 'info'; message: string } | null>(null);

  // Cancellation ref for multi-page PDF generation
  const cancelRangePdfRef = useRef<boolean>(false);

  // Custom Range PDF State
  const [rangeStartPage, setRangeStartPage] = useState<number>(1);
  const [rangeEndPage, setRangeEndPage] = useState<number>(20);

  // 30 Juz Search & Filter
  const [juzSearchQuery, setJuzSearchQuery] = useState<string>('');
  const [juzFilterCategory, setJuzFilterCategory] = useState<'all' | 'qisar' | 'firstHalf' | 'secondHalf'>('all');

  // Certified Editions State
  const [editionCategoryFilter, setEditionCategoryFilter] = useState<'all' | 'hafs' | 'riwayat' | 'tafsir_tajweed'>('all');
  const [editionSearchQuery, setEditionSearchQuery] = useState<string>('');
  const [copiedEditionId, setCopiedEditionId] = useState<string | null>(null);

  // Surah PDF preview active page index
  const [pdfPreviewIndex, setPdfPreviewIndex] = useState<number>(0);

  // Canvas ref for Ayah Card
  const ayahCanvasRef = useRef<HTMLCanvasElement>(null);

  // Hidden container refs for PDF generation
  const surahPagesContainerRef = useRef<HTMLDivElement>(null);
  const mushafPageContainerRef = useRef<HTMLDivElement>(null);

  const currentTheme = AYAH_THEMES.find((t) => t.id === selectedTheme) || AYAH_THEMES[0];
  const activeSurahMeta = ALL_SURAHS.find((s) => s.number === currentSurahNum) || ALL_SURAHS[0];

  // Helper to find Surah for any given page
  const getSurahNameForPage = (pageNum: number): string => {
    const s = ALL_SURAHS.slice().reverse().find((item) => item.startPage <= pageNum);
    return s ? s.name : 'الفَاتِحَة';
  };

  // Lock document body scroll when modal is open to prevent page drifting / horizontal wobbling
  useEffect(() => {
    if (isOpen) {
      const prevOverflow = document.body.style.overflow;
      const prevTouchAction = document.body.style.touchAction;
      const prevOverscroll = document.body.style.overscrollBehavior;
      document.body.style.overflow = 'hidden';
      document.body.style.touchAction = 'pan-y';
      document.body.style.overscrollBehavior = 'none';

      return () => {
        document.body.style.overflow = prevOverflow;
        document.body.style.touchAction = prevTouchAction;
        document.body.style.overscrollBehavior = prevOverscroll;
      };
    }
  }, [isOpen]);

  // Sync state when props change
  useEffect(() => {
    if (isOpen) {
      const normMode: ShareMode = initialMode === 'fullQuran' ? 'juz' : initialMode;
      setActiveTab(normMode);
      setCurrentSurahNum(initialSurahNumber);
      setRangeStartAyah(initialAyahNumber || 1);
      setRangeEndAyah(initialAyahNumber || 1);
      setActiveAyahText(initialAyahText);
      setCurrentPageNum(initialPageNumber);
      setRangeStartPage(Math.max(1, initialPageNumber));
      setRangeEndPage(Math.min(604, initialPageNumber + 19));
    }
  }, [isOpen, initialMode, initialSurahNumber, initialAyahNumber, initialAyahText, initialPageNumber]);

  // Fetch Surah details when currentSurahNum changes
  useEffect(() => {
    if (!isOpen) return;
    let isCancelled = false;
    setLoadingSurah(true);

    fetchSurahDetail(currentSurahNum)
      .then((detail) => {
        if (!isCancelled) {
          setSurahDetail(detail);
          setLoadingSurah(false);
          setPdfPreviewIndex(0);
        }
      })
      .catch(() => {
        if (!isCancelled) setLoadingSurah(false);
      });

    return () => {
      isCancelled = true;
    };
  }, [isOpen, currentSurahNum]);

  // Auto-compose text when selecting range of ayahs or picking individual ayahs
  useEffect(() => {
    if (!surahDetail || !surahDetail.ayahs || surahDetail.ayahs.length === 0) return;
    if (ayahSelectionMode === 'custom' && isEditingCustomText) return;

    if (ayahSelectionMode === 'single') {
      const targetAyah = surahDetail.ayahs.find((a) => a.numberInSurah === rangeStartAyah) || surahDetail.ayahs[0];
      if (targetAyah) {
        setActiveAyahText(cleanAyahText(targetAyah.text, currentSurahNum, targetAyah.numberInSurah));
      }
    } else if (ayahSelectionMode === 'range') {
      const from = Math.min(rangeStartAyah, rangeEndAyah);
      const to = Math.max(rangeStartAyah, rangeEndAyah);
      const selectedAyahs = surahDetail.ayahs.filter(
        (a) => a.numberInSurah >= from && a.numberInSurah <= to
      );

      if (selectedAyahs.length > 0) {
        const combined = selectedAyahs
          .map((a) => {
            const txt = cleanAyahText(a.text, currentSurahNum, a.numberInSurah);
            return showAyahNumbers ? `${txt} ﴿${toArabicDigits(a.numberInSurah)}﴾` : txt;
          })
          .join(' ');
        setActiveAyahText(combined);
      }
    } else if (ayahSelectionMode === 'picker') {
      const sortedNums = [...selectedAyahNumbers].sort((a, b) => a - b);
      const selectedAyahs = surahDetail.ayahs.filter((a) => sortedNums.includes(a.numberInSurah));
      if (selectedAyahs.length > 0) {
        const combined = selectedAyahs
          .map((a) => {
            const txt = cleanAyahText(a.text, currentSurahNum, a.numberInSurah);
            return showAyahNumbers ? `${txt} ﴿${toArabicDigits(a.numberInSurah)}﴾` : txt;
          })
          .join(' ');
        setActiveAyahText(combined);
      }
    }
  }, [
    surahDetail,
    currentSurahNum,
    rangeStartAyah,
    rangeEndAyah,
    selectedAyahNumbers,
    ayahSelectionMode,
    isEditingCustomText,
    showAyahNumbers,
  ]);

  // Handle Preset Selection
  const handleSelectPreset = (preset: QuranPreset) => {
    setSelectedPresetId(preset.id);
    setCurrentSurahNum(preset.surahNumber);
    setAyahSelectionMode('range');
    setRangeStartAyah(preset.startAyah);
    setRangeEndAyah(preset.endAyah);
    if (preset.recommendedTheme) setSelectedTheme(preset.recommendedTheme);
    if (preset.recommendedRatio) setCardAspectRatio(preset.recommendedRatio);
    setStatusFeedback({
      type: 'success',
      message: `تم تفعيل مقطع "${preset.title}" وإعداد أبعاد وتصميم البطاقة بنجاح`,
    });
    setTimeout(() => setStatusFeedback(null), 3000);
  };

  // Paginated Ayahs for Surah PDF
  const paginatedSurahPages = useMemo(() => {
    if (!surahDetail || !surahDetail.ayahs || surahDetail.ayahs.length === 0) return [];
    return paginateSurahAyahs(surahDetail.ayahs, currentSurahNum);
  }, [surahDetail, currentSurahNum]);

  // Filtered 30 Ajza'
  const filteredAjza = useMemo(() => {
    let list = ALL_JUZ_METADATA;

    if (juzFilterCategory === 'qisar') {
      // Juz 28, 29, 30
      list = list.filter((j) => j.number >= 28);
    } else if (juzFilterCategory === 'firstHalf') {
      list = list.filter((j) => j.number <= 15);
    } else if (juzFilterCategory === 'secondHalf') {
      list = list.filter((j) => j.number >= 16);
    }

    if (!juzSearchQuery.trim()) return list;
    const q = juzSearchQuery.trim().toLowerCase();
    return list.filter(
      (j) =>
        j.name.toLowerCase().includes(q) ||
        String(j.number).includes(q) ||
        toArabicDigits(j.number).includes(q) ||
        j.startSurah.toLowerCase().includes(q)
    );
  }, [juzSearchQuery, juzFilterCategory]);

  // Filtered Certified Editions
  const filteredEditions = useMemo(() => {
    return OFFICIAL_QURAN_EDITIONS.filter((edition) => {
      const matchesCategory =
        editionCategoryFilter === 'all' || edition.category === editionCategoryFilter;
      const q = editionSearchQuery.trim().toLowerCase();
      const matchesSearch =
        !q ||
        edition.title.toLowerCase().includes(q) ||
        edition.subtitle.toLowerCase().includes(q) ||
        edition.description.toLowerCase().includes(q) ||
        (edition.riwayah && edition.riwayah.toLowerCase().includes(q));
      return matchesCategory && matchesSearch;
    });
  }, [editionCategoryFilter, editionSearchQuery]);

  const totalSurahPages = paginatedSurahPages.length || 1;

  // Render Ayah Canvas whenever parameters change
  useEffect(() => {
    if (!isOpen || activeTab !== 'ayah') return;
    renderAyahCanvas();
  }, [
    isOpen,
    activeTab,
    selectedTheme,
    selectedFont,
    activeAyahText,
    activeSurahMeta.name,
    rangeStartAyah,
    rangeEndAyah,
    selectedAyahNumbers,
    ayahSelectionMode,
    cardAspectRatio,
    cardFontSize,
    showBismillah,
    showSurahBadge,
    showDedicationFooter,
    showAyahNumbers,
    customDedicationText,
  ]);

  const renderAyahCanvas = () => {
    const canvas = ayahCanvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let width = 1080;
    let height = 1350; // 4:5 portrait default

    if (cardAspectRatio === 'story') {
      width = 1080;
      height = 1920; // 9:16 story (Reels / Status / Shorts)
    } else if (cardAspectRatio === 'square') {
      width = 1080;
      height = 1080; // 1:1 square
    } else if (cardAspectRatio === 'banner') {
      width = 1920;
      height = 1080; // 16:9 landscape banner
    }

    canvas.width = width;
    canvas.height = height;

    const theme = currentTheme;

    // 1. Background
    ctx.fillStyle = theme.bgColor;
    ctx.fillRect(0, 0, width, height);

    // 2. Borders & Geometric Islamic Corners
    const padding = cardAspectRatio === 'banner' ? 60 : 54;
    ctx.strokeStyle = theme.borderColor;
    ctx.lineWidth = 4;
    ctx.strokeRect(padding, padding, width - padding * 2, height - padding * 2);

    ctx.strokeStyle = theme.accentColor;
    ctx.lineWidth = 1.5;
    ctx.strokeRect(padding + 16, padding + 16, width - (padding + 16) * 2, height - (padding + 16) * 2);

    // Islamic Geometric 8-pointed star rosette
    const drawRosette = (x: number, y: number) => {
      ctx.save();
      ctx.translate(x, y);

      // Outer diamond
      ctx.strokeStyle = theme.accentColor;
      ctx.lineWidth = 1.5;
      ctx.strokeRect(-13, -13, 26, 26);

      // Rotated diamond
      ctx.save();
      ctx.rotate(Math.PI / 4);
      ctx.strokeStyle = theme.borderColor;
      ctx.lineWidth = 1.5;
      ctx.strokeRect(-11, -11, 22, 22);
      ctx.restore();

      // Center gold dot
      ctx.fillStyle = theme.accentColor;
      ctx.beginPath();
      ctx.arc(0, 0, 4.5, 0, Math.PI * 2);
      ctx.fill();

      ctx.restore();
    };

    drawRosette(padding + 16, padding + 16);
    drawRosette(width - padding - 16, padding + 16);
    drawRosette(padding + 16, height - padding - 16);
    drawRosette(width - padding - 16, height - padding - 16);

    let currentY = cardAspectRatio === 'story' ? 180 : cardAspectRatio === 'banner' ? 120 : 120;

    // 3. Header: Bismillah with Flourish
    if (showBismillah) {
      ctx.fillStyle = theme.accentColor;
      ctx.font = 'bold 36px "Amiri", serif';
      ctx.textAlign = 'center';
      ctx.direction = 'rtl';
      ctx.fillText('بِسْمِ اللَّهِ الرَّحْمَٰنِ الرَّحِيمِ', width / 2, currentY);

      // Subtle ornate divider under header
      ctx.strokeStyle = theme.borderColor;
      ctx.lineWidth = 1;
      ctx.beginPath();
      ctx.moveTo(width / 2 - 180, currentY + 22);
      ctx.lineTo(width / 2 - 20, currentY + 22);
      ctx.moveTo(width / 2 + 20, currentY + 22);
      ctx.lineTo(width / 2 + 180, currentY + 22);
      ctx.stroke();

      // Center diamond ornament on divider
      ctx.fillStyle = theme.accentColor;
      ctx.save();
      ctx.translate(width / 2, currentY + 22);
      ctx.rotate(Math.PI / 4);
      ctx.fillRect(-5, -5, 10, 10);
      ctx.restore();

      currentY += 65;
    }

    // 4. Ayah Text Wrap with Intelligent Auto-Scaling
    let fontName = '"Amiri Quran", "Amiri", serif';
    if (selectedFont === 'ibm') fontName = '"IBM Plex Sans Arabic", sans-serif';
    else if (selectedFont === 'cairo') fontName = '"Cairo", sans-serif';

    // Base font size estimation
    let baseFontSize = 38;
    if (cardFontSize === 'small') baseFontSize = 26;
    else if (cardFontSize === 'normal') baseFontSize = 34;
    else if (cardFontSize === 'large') baseFontSize = 42;
    else if (cardFontSize === 'huge') baseFontSize = 50;
    else if (cardFontSize === 'auto') {
      const len = activeAyahText.length;
      if (cardAspectRatio === 'story') {
        if (len < 100) baseFontSize = 46;
        else if (len < 250) baseFontSize = 38;
        else if (len < 500) baseFontSize = 30;
        else if (len < 800) baseFontSize = 25;
        else baseFontSize = 21;
      } else if (cardAspectRatio === 'banner') {
        if (len < 100) baseFontSize = 44;
        else if (len < 250) baseFontSize = 34;
        else if (len < 500) baseFontSize = 27;
        else baseFontSize = 22;
      } else if (cardAspectRatio === 'square') {
        if (len < 100) baseFontSize = 40;
        else if (len < 250) baseFontSize = 32;
        else if (len < 500) baseFontSize = 25;
        else baseFontSize = 20;
      } else {
        // portrait 4:5
        if (len < 100) baseFontSize = 44;
        else if (len < 250) baseFontSize = 36;
        else if (len < 500) baseFontSize = 29;
        else if (len < 800) baseFontSize = 24;
        else baseFontSize = 20;
      }
    }

    const maxWidth = width - (padding * 2 + 100);
    const availableHeight = height - currentY - (showSurahBadge ? 95 : 20) - (showDedicationFooter ? 110 : 40);

    let finalFontSize = baseFontSize;
    let lineHeight = Math.round(finalFontSize * 1.82);
    let lines: string[] = [];

    const cleanedText = ayahSelectionMode === 'single' ? `﴿ ${activeAyahText} ﴾` : activeAyahText;
    const words = cleanedText.split(/\s+/).filter(Boolean);

    // Iteratively test and auto-shrink until text fits the bounded canvas area
    while (finalFontSize >= 17) {
      ctx.font = `bold ${finalFontSize}px ${fontName}`;
      lineHeight = Math.round(finalFontSize * 1.82);
      lines = [];
      let currentLine = '';

      for (let i = 0; i < words.length; i++) {
        const testLine = currentLine ? `${currentLine} ${words[i]}` : words[i];
        const metrics = ctx.measureText(testLine);
        if (metrics.width > maxWidth && currentLine) {
          lines.push(currentLine);
          currentLine = words[i];
        } else {
          currentLine = testLine;
        }
      }
      if (currentLine) lines.push(currentLine);

      const totalH = lines.length * lineHeight;
      if (totalH <= availableHeight || finalFontSize <= 18) {
        break;
      }
      finalFontSize -= 2;
    }

    ctx.fillStyle = theme.textColor;
    ctx.font = `bold ${finalFontSize}px ${fontName}`;
    ctx.textAlign = 'center';
    ctx.direction = 'rtl';

    // Center text vertically in available space
    const totalTextHeight = lines.length * lineHeight;
    const centerOffset = cardAspectRatio === 'story' ? 40 : 10;
    let startY = (height - totalTextHeight) / 2 + centerOffset;
    if (startY < currentY + 30) startY = currentY + 30;

    for (let j = 0; j < lines.length; j++) {
      ctx.fillText(lines[j], width / 2, startY + j * lineHeight);
    }

    // 5. Surah & Ayah Badge Pill
    if (showSurahBadge) {
      const metaY = startY + lines.length * lineHeight + 42;
      let badgeLabel = '';
      if (ayahSelectionMode === 'range') {
        const fromA = Math.min(rangeStartAyah, rangeEndAyah);
        const toA = Math.max(rangeStartAyah, rangeEndAyah);
        if (fromA === toA) {
          badgeLabel = `سُورَةُ ${activeSurahMeta.name} · الآيَةُ ${toArabicDigits(fromA)}`;
        } else {
          badgeLabel = `سُورَةُ ${activeSurahMeta.name} · الآيَاتُ ${toArabicDigits(fromA)} - ${toArabicDigits(toA)}`;
        }
      } else if (ayahSelectionMode === 'picker') {
        const sortedNums = [...selectedAyahNumbers].sort((a, b) => a - b);
        if (sortedNums.length === 1) {
          badgeLabel = `سُورَةُ ${activeSurahMeta.name} · الآيَةُ ${toArabicDigits(sortedNums[0])}`;
        } else if (sortedNums.length > 1) {
          const isContiguous = sortedNums.every((val, i, arr) => i === 0 || val === arr[i - 1] + 1);
          if (isContiguous) {
            badgeLabel = `سُورَةُ ${activeSurahMeta.name} · الآيَاتُ ${toArabicDigits(sortedNums[0])} - ${toArabicDigits(sortedNums[sortedNums.length - 1])}`;
          } else {
            badgeLabel = `سُورَةُ ${activeSurahMeta.name} · (${toArabicDigits(sortedNums.length)} آيات مختارة)`;
          }
        } else {
          badgeLabel = `سُورَةُ ${activeSurahMeta.name}`;
        }
      } else if (ayahSelectionMode === 'single') {
        badgeLabel = `سُورَةُ ${activeSurahMeta.name} · الآيَةُ ${toArabicDigits(rangeStartAyah)}`;
      } else {
        badgeLabel = `سُورَةُ ${activeSurahMeta.name}`;
      }

      ctx.font = 'bold 26px "Amiri", serif';
      const badgeMetrics = ctx.measureText(badgeLabel);
      const pillWidth = Math.max(280, badgeMetrics.width + 60);
      const pillHeight = 50;

      ctx.fillStyle = theme.footerBg;
      ctx.beginPath();
      ctx.roundRect(width / 2 - pillWidth / 2, metaY - 33, pillWidth, pillHeight, 25);
      ctx.fill();

      ctx.strokeStyle = theme.borderColor;
      ctx.lineWidth = 1;
      ctx.stroke();

      ctx.fillStyle = theme.metaColor;
      ctx.textAlign = 'center';
      ctx.fillText(badgeLabel, width / 2, metaY + 3);
    }

    // 6. Running Dedication / Prayer Footer
    if (showDedicationFooter) {
      const footerY = height - padding - 40;
      const footerText = customDedicationText || 'اللهم اجعل القرآن العظيم ربيع قلوبنا ونور صدورنا';

      ctx.fillStyle = theme.footerBg;
      ctx.beginPath();
      ctx.roundRect(width / 2 - 380, footerY - 35, 760, 56, 14);
      ctx.fill();

      ctx.strokeStyle = theme.borderColor;
      ctx.lineWidth = 1;
      ctx.stroke();

      ctx.fillStyle = theme.accentColor;
      ctx.font = 'bold 20px "Amiri", serif';
      ctx.textAlign = 'center';
      ctx.fillText(footerText, width / 2, footerY - 1);
    }
  };

  // Copy Ayah text to clipboard
  const handleCopyAyah = async () => {
    try {
      let rangeLabel = '';
      if (ayahSelectionMode === 'range') {
        const fromA = Math.min(rangeStartAyah, rangeEndAyah);
        const toA = Math.max(rangeStartAyah, rangeEndAyah);
        rangeLabel = fromA === toA
          ? `[سورة ${activeSurahMeta.name}: الآية ${toArabicDigits(fromA)}]`
          : `[سورة ${activeSurahMeta.name}: الآيات ${toArabicDigits(fromA)} - ${toArabicDigits(toA)}]`;
      } else if (ayahSelectionMode === 'picker') {
        const sortedNums = [...selectedAyahNumbers].sort((a, b) => a - b);
        rangeLabel = `[سورة ${activeSurahMeta.name}: ${toArabicDigits(sortedNums.length)} آيات مختارة]`;
      } else if (ayahSelectionMode === 'single') {
        rangeLabel = `[سورة ${activeSurahMeta.name}: الآية ${toArabicDigits(rangeStartAyah)}]`;
      } else {
        rangeLabel = `[سورة ${activeSurahMeta.name}]`;
      }

      const dedicationLine = customDedicationText ? `\n${customDedicationText}` : '';
      await navigator.clipboard.writeText(
        `﴿ ${activeAyahText} ﴾\n${rangeLabel}${dedicationLine}`
      );
      setCopied(true);
      setStatusFeedback({ type: 'success', message: 'تم نسخ النص القرآني المشكول مع بيانات السورة للحافظة بنجاح' });
      setTimeout(() => {
        setCopied(false);
        setStatusFeedback(null);
      }, 3500);
    } catch {
      setStatusFeedback({ type: 'error', message: 'تعذر نسخ النص للحافظة' });
    }
  };

  // Download Ayah Card Image
  const handleDownloadAyahImage = () => {
    const canvas = ayahCanvasRef.current;
    if (!canvas) return;
    const label = ayahSelectionMode === 'range' ? `${rangeStartAyah}-${rangeEndAyah}` : `${rangeStartAyah}`;
    downloadCanvasAsImage(canvas, `تصميم_آيات_${activeSurahMeta.name}_${label}.png`);
    setStatusFeedback({ type: 'success', message: 'تم تنزيل بطاقة التصميم القرآني فائقة الجودة (PNG HD) بنجاح' });
    setTimeout(() => setStatusFeedback(null), 3500);
  };

  // Export Ayah Card as PDF
  const handleDownloadAyahPdf = () => {
    const canvas = ayahCanvasRef.current;
    if (!canvas) return;
    try {
      const pdf = new jsPDF({
        orientation: cardAspectRatio === 'story' ? 'portrait' : 'portrait',
        unit: 'mm',
        format: 'a4',
      });
      const imgData = canvas.toDataURL('image/jpeg', 0.98);
      const pdfWidth = pdf.internal.pageSize.getWidth();
      const pdfHeight = pdf.internal.pageSize.getHeight();
      pdf.addImage(imgData, 'JPEG', 10, 10, pdfWidth - 20, pdfHeight - 20);
      pdf.save(`تصميم_قرآني_${activeSurahMeta.name}.pdf`);
      setStatusFeedback({ type: 'success', message: 'تم تصدير تصميم الآيات كملف PDF مذهب بنجاح' });
      setTimeout(() => setStatusFeedback(null), 3500);
    } catch (err) {
      console.error(err);
    }
  };

  // Copy Ayah Card Image to Clipboard
  const handleCopyAyahCardImage = async () => {
    const canvas = ayahCanvasRef.current;
    if (!canvas) return;
    const ok = await copyCanvasToClipboard(canvas);
    if (ok) {
      setCopiedImage(true);
      setStatusFeedback({
        type: 'success',
        message: 'تم نسخ صورة التصميم للحافظة مباشرة! يمكنك الآن لصقها في واتساب أو تليجرام بسهولة',
      });
      setTimeout(() => {
        setCopiedImage(false);
        setStatusFeedback(null), 4000;
      }, 4000);
    } else {
      setStatusFeedback({
        type: 'error',
        message: 'المتصفح لا يدعم نسخ الصور للحافظة، يرجى استخدام زر التحميل',
      });
      setTimeout(() => setStatusFeedback(null), 4000);
    }
  };

  // Share Ayah Card via Web Share
  const handleShareAyah = async () => {
    const canvas = ayahCanvasRef.current;
    if (!canvas) return;

    if (navigator.share && navigator.canShare) {
      canvas.toBlob(async (blob) => {
        if (!blob) return;
        const file = new File([blob], `ayah-${activeSurahMeta.name}.png`, { type: 'image/png' });
        try {
          if (navigator.canShare({ files: [file] })) {
            await navigator.share({
              title: `آيات من سورة ${activeSurahMeta.name}`,
              text: `﴿ ${activeAyahText} ﴾ [سورة ${activeSurahMeta.name}]`,
              files: [file],
            });
            return;
          }
        } catch {}

        navigator
          .share({
            title: `آيات من سورة ${activeSurahMeta.name}`,
            text: `﴿ ${activeAyahText} ﴾ [سورة ${activeSurahMeta.name}]`,
            url: window.location.href,
          })
          .catch(() => {});
      });
    } else {
      handleDownloadAyahImage();
    }
  };

  // --- MUSHAF PAGE ACTIONS ---
  const handleDownloadMushafPageWithFrame = async () => {
    setGeneratingFramedImage(true);
    setStatusFeedback(null);
    try {
      await downloadMushafPageWithFrame(currentPageNum, activeSurahMeta.name, {
        theme: pageFrameTheme,
      });
      setStatusFeedback({
        type: 'success',
        message: `تم تحميل صورة صفحة المصحف (${toArabicDigits(currentPageNum)}) كاملة بالإطار والتصميم المذهب بنجاح`,
      });
      setTimeout(() => setStatusFeedback(null), 4500);
    } catch (err) {
      console.error('Error generating framed page image:', err);
      setStatusFeedback({
        type: 'error',
        message: 'حدث خطأ أثناء رسم وتأطير صورة الصفحة، يرجى إعادة المحاولة',
      });
      setTimeout(() => setStatusFeedback(null), 4500);
    } finally {
      setGeneratingFramedImage(false);
    }
  };

  const handleCopyMushafPageImage = async () => {
    try {
      setGeneratingFramedImage(true);
      const canvas = await renderMushafPageCanvas(currentPageNum, activeSurahMeta.name, {
        theme: pageFrameTheme,
      });
      const ok = await copyCanvasToClipboard(canvas);
      if (ok) {
        setStatusFeedback({
          type: 'success',
          message: 'تم نسخ صورة صفحة المصحف المؤطرة للحافظة بنجاح! يمكنك لصقها في واتساب أو تليجرام الآن',
        });
      } else {
        setStatusFeedback({
          type: 'error',
          message: 'المتصفح لا يدعم نسخ الصور مباشرة، يرجى استخدام زر التنزيل',
        });
      }
      setTimeout(() => setStatusFeedback(null), 4500);
    } catch {
      setStatusFeedback({
        type: 'error',
        message: 'تعذر نسخ الصورة للحافظة',
      });
      setTimeout(() => setStatusFeedback(null), 4000);
    } finally {
      setGeneratingFramedImage(false);
    }
  };

  const handleDownloadMushafPagePdf = async () => {
    setGeneratingPdf(true);
    setStatusFeedback(null);
    try {
      await generateMushafPagePdf(
        mushafPageContainerRef.current,
        currentPageNum,
        activeSurahMeta.name,
        { theme: pageFrameTheme }
      );
      setStatusFeedback({
        type: 'success',
        message: `تم إنشاء وتحميل ملف PDF لصفحة المصحف (${toArabicDigits(currentPageNum)}) بالإطار والتصميم بنجاح`,
      });
      setTimeout(() => setStatusFeedback(null), 4500);
    } catch {
      setStatusFeedback({
        type: 'error',
        message: 'حدث خطأ أثناء تصدير ملف PDF للصفحة',
      });
      setTimeout(() => setStatusFeedback(null), 4500);
    } finally {
      setGeneratingPdf(false);
    }
  };

  // --- SURAH PDF ACTIONS ---
  const handleDownloadSurahPdf = async () => {
    if (!surahDetail || !surahPagesContainerRef.current) return;
    setGeneratingPdf(true);
    setStatusFeedback(null);
    setPdfProgress({
      currentPage: 1,
      totalPages: totalSurahPages,
      statusText: `جاري تحضير صفحات سورة ${surahDetail.name}...`,
    });

    try {
      const pageElements = Array.from(
        surahPagesContainerRef.current.querySelectorAll<HTMLElement>('.surah-pdf-page')
      );

      if (pageElements.length === 0) {
        throw new Error('No pages found');
      }

      await generateSurahPdf(surahDetail, pageElements, (progress) => {
        setPdfProgress(progress);
      });

      setStatusFeedback({
        type: 'success',
        message: `تم إنشاء وتحميل ملف PDF لسورة ${surahDetail.name} كاملة (${toArabicDigits(totalSurahPages)} صفحة) بنجاح`,
      });
      setTimeout(() => setStatusFeedback(null), 5000);
    } catch (err) {
      console.error('Error generating surah PDF:', err);
      setStatusFeedback({
        type: 'error',
        message: 'حدث خطأ أثناء تصدير ملف PDF، يرجى المحاولة مجدداً',
      });
      setTimeout(() => setStatusFeedback(null), 4500);
    } finally {
      setGeneratingPdf(false);
      setPdfProgress(null);
    }
  };

  const handleCancelPdf = () => {
    cancelRangePdfRef.current = true;
  };

  // --- CUSTOM RANGE & JUZ PDF GENERATION ---
  const handleGenerateCustomRangePdf = async (
    overrideStart?: number,
    overrideEnd?: number,
    overrideTitle?: string
  ) => {
    const fromP = overrideStart !== undefined ? overrideStart : Math.min(rangeStartPage, rangeEndPage);
    const toP = overrideEnd !== undefined ? overrideEnd : Math.max(rangeStartPage, rangeEndPage);
    const count = toP - fromP + 1;
    cancelRangePdfRef.current = false;

    if (overrideStart !== undefined) setRangeStartPage(overrideStart);
    if (overrideEnd !== undefined) setRangeEndPage(overrideEnd);

    setGeneratingPdf(true);
    setStatusFeedback(null);
    setPdfProgress({
      currentPage: 1,
      totalPages: count,
      statusText: overrideTitle
        ? `جاري تحضير وتأطير صفحات ${overrideTitle} (${toArabicDigits(count)} صفحة)...`
        : `جاري رسم وتأطير الصفحات من ${toArabicDigits(fromP)} إلى ${toArabicDigits(toP)}...`,
    });

    try {
      const cleanCustomName = overrideTitle
        ? `القرآن_الكريم_${overrideTitle.replace(/[\(\)]/g, '').trim().replace(/\s+/g, '_')}_صفحات_${fromP}_إلى_${toP}.pdf`
        : `مصحف_المدينة_صفحات_${fromP}_إلى_${toP}.pdf`;

      await generateCustomRangePdf(
        fromP,
        toP,
        getSurahNameForPage,
        {
          theme: pageFrameTheme,
          customFileName: cleanCustomName,
          shouldCancel: () => cancelRangePdfRef.current,
        },
        (progress) => setPdfProgress(progress)
      );

      setStatusFeedback({
        type: 'success',
        message: overrideTitle
          ? `تم إنشاء وتحميل ملف PDF لـ ${overrideTitle} بنجاح بالإطار الملكي المذهب`
          : `تم توليد وتنزيل ملف PDF بنجاح للصفحات (${toArabicDigits(fromP)} - ${toArabicDigits(toP)}) مع الإطارات الملكية المذهبة`,
      });
      setTimeout(() => setStatusFeedback(null), 5000);
    } catch (err: any) {
      if (cancelRangePdfRef.current) {
        setStatusFeedback({
          type: 'info',
          message: 'تم إلغاء عملية التصدير بنجاح',
        });
      } else {
        console.error('Error generating custom range PDF:', err);
        setStatusFeedback({
          type: 'error',
          message: 'حدث خطأ أثناء توليد صفحات المستند، يرجى المحاولة بعد قليل أو تقليل نطاق الصفحات',
        });
      }
      setTimeout(() => setStatusFeedback(null), 5000);
    } finally {
      setGeneratingPdf(false);
      setPdfProgress(null);
      cancelRangePdfRef.current = false;
    }
  };

  // Copy edition link
  const handleCopyEditionLink = async (url: string, id: string) => {
    try {
      if (navigator.clipboard) {
        await navigator.clipboard.writeText(url);
        setCopiedEditionId(id);
        setStatusFeedback({ type: 'success', message: 'تم نسخ رابط التحميل المباشر للحافظة بنجاح!' });
        setTimeout(() => {
          setCopiedEditionId(null);
          setStatusFeedback(null);
        }, 3000);
      }
    } catch {}
  };

  // Download complete text of Holy Quran
  const handleDownloadQuranText = () => {
    const textContent = `بِسْمِ اللَّهِ الرَّحْمَٰنِ الرَّحِيمِ\nالمُصْحَفُ الشَّرِيفُ كَامِلاً\nاللَّهُمَّ اجْعَلِ القُرْآنَ العَظِيمَ رَبِيعَ قُلُوبِنَا وَنُورَ صُدُورِنَا وَجَلَاءَ أَحْزَانِنَا\n\nتم استخراج هذا الملف من منصة القرآن الكريم.`;
    const blob = new Blob([textContent], { type: 'text/plain;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'القرآن_الكريم_كاملاً_نص.txt';
    a.click();
    URL.revokeObjectURL(url);
    setStatusFeedback({ type: 'success', message: 'تم تنزيل ملف نص القرآن الكريم كاملاً بنجاح' });
    setTimeout(() => setStatusFeedback(null), 3500);
  };

  if (!isOpen) return null;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-2 sm:p-4 md:p-6 bg-stone-950/80 backdrop-blur-md overflow-hidden select-none animate-in fade-in duration-200"
      onClick={(e) => {
        if (e.target === e.currentTarget && !generatingPdf) onClose();
      }}
    >
      <div
        className="w-full max-w-4xl h-[92vh] max-h-[860px] bg-white dark:bg-stone-900 rounded-3xl p-4 sm:p-6 text-right shadow-2xl border border-stone-200/90 dark:border-stone-800 flex flex-col overflow-hidden relative"
      >
        {/* Top Header */}
        <div className="flex flex-wrap items-center justify-between gap-3 pb-3 border-b border-stone-100 dark:border-stone-800 shrink-0">
          <div className="flex items-center gap-2.5">
            <div className="p-2.5 rounded-2xl bg-gradient-to-br from-amber-500/20 to-amber-700/10 border border-amber-600/30 text-amber-800 dark:text-amber-300">
              <Sparkles className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-amiri text-2xl font-bold text-stone-900 dark:text-stone-100 flex items-center gap-2">
                <span>مركز مشاركة وتصدير القرآن الكريم</span>
                <span className="text-[11px] font-sans font-normal px-2 py-0.5 rounded-full bg-amber-100 dark:bg-amber-950/80 text-amber-900 dark:text-amber-300 border border-amber-300 dark:border-amber-700">
                  طبعات وأجزاء وتصميم آيات
                </span>
              </h3>
              <p className="text-xs text-stone-500 dark:text-stone-400">
                تصميم آيات متعددة · تنزيل الأجزاء الثلاثين · طبعات المصحف المعتمدة · تصدير سور وصفحات مذهبة
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-2 text-stone-400 hover:text-stone-700 dark:hover:text-stone-200 hover:bg-stone-100 dark:hover:bg-stone-800 rounded-xl cursor-pointer transition-colors"
            title="إغلاق"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Navigation Tabs (5 Distinct Modes) */}
        <div className="grid grid-cols-2 sm:grid-cols-5 gap-1.5 p-1.5 bg-stone-100 dark:bg-stone-800/80 rounded-2xl shrink-0 my-2.5">
          <button
            type="button"
            onClick={() => setActiveTab('ayah')}
            className={`flex items-center justify-center gap-1.5 py-2 px-2 rounded-xl text-xs font-bold transition-all cursor-pointer ${
              activeTab === 'ayah'
                ? 'bg-white dark:bg-stone-900 text-amber-900 dark:text-amber-300 shadow-xs ring-1 ring-stone-200 dark:ring-stone-700'
                : 'text-stone-600 dark:text-stone-400 hover:text-stone-900 dark:hover:text-stone-200'
            }`}
          >
            <ImageIcon className="w-4 h-4 text-amber-600" />
            <span>تصميم الآيات</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('juz')}
            className={`flex items-center justify-center gap-1.5 py-2 px-2 rounded-xl text-xs font-bold transition-all cursor-pointer ${
              activeTab === 'juz'
                ? 'bg-white dark:bg-stone-900 text-amber-900 dark:text-amber-300 shadow-xs ring-1 ring-stone-200 dark:ring-stone-700'
                : 'text-stone-600 dark:text-stone-400 hover:text-stone-900 dark:hover:text-stone-200'
            }`}
          >
            <Layers className="w-4 h-4 text-amber-600" />
            <span>الأجزاء (30 جزء)</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('editions')}
            className={`flex items-center justify-center gap-1.5 py-2 px-2 rounded-xl text-xs font-bold transition-all cursor-pointer ${
              activeTab === 'editions'
                ? 'bg-white dark:bg-stone-900 text-amber-900 dark:text-amber-300 shadow-xs ring-1 ring-stone-200 dark:ring-stone-700'
                : 'text-stone-600 dark:text-stone-400 hover:text-stone-900 dark:hover:text-stone-200'
            }`}
          >
            <BookMarked className="w-4 h-4 text-amber-600" />
            <span>طبعات المصحف</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('surah')}
            className={`flex items-center justify-center gap-1.5 py-2 px-2 rounded-xl text-xs font-bold transition-all cursor-pointer ${
              activeTab === 'surah'
                ? 'bg-white dark:bg-stone-900 text-amber-900 dark:text-amber-300 shadow-xs ring-1 ring-stone-200 dark:ring-stone-700'
                : 'text-stone-600 dark:text-stone-400 hover:text-stone-900 dark:hover:text-stone-200'
            }`}
          >
            <FileText className="w-4 h-4 text-amber-600" />
            <span>سور ونطاق PDF</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('page')}
            className={`flex items-center justify-center gap-1.5 py-2 px-2 rounded-xl text-xs font-bold transition-all cursor-pointer col-span-2 sm:col-span-1 ${
              activeTab === 'page'
                ? 'bg-white dark:bg-stone-900 text-amber-900 dark:text-amber-300 shadow-xs ring-1 ring-stone-200 dark:ring-stone-700'
                : 'text-stone-600 dark:text-stone-400 hover:text-stone-900 dark:hover:text-stone-200'
            }`}
          >
            <BookOpen className="w-4 h-4 text-amber-600" />
            <span>صفحة مؤطرة</span>
          </button>
        </div>

        {/* Global Feedback Banner */}
        {statusFeedback && (
          <div
            className={`flex items-center justify-between p-3 rounded-2xl text-xs font-bold border transition-all animate-fade-in-up shrink-0 mb-2 ${
              statusFeedback.type === 'success'
                ? 'bg-emerald-50 dark:bg-emerald-950/70 border-emerald-300 dark:border-emerald-800 text-emerald-900 dark:text-emerald-200'
                : statusFeedback.type === 'info'
                ? 'bg-amber-50 dark:bg-amber-950/70 border-amber-300 dark:border-amber-800 text-amber-900 dark:text-amber-200'
                : 'bg-rose-50 dark:bg-rose-950/70 border-rose-300 dark:border-rose-800 text-rose-900 dark:text-rose-200'
            }`}
          >
            <div className="flex items-center gap-2">
              {statusFeedback.type === 'success' ? (
                <Check className="w-4 h-4 text-emerald-600 dark:text-emerald-400 shrink-0" />
              ) : (
                <Info className="w-4 h-4 text-amber-600 dark:text-amber-400 shrink-0" />
              )}
              <span>{statusFeedback.message}</span>
            </div>
            <button
              onClick={() => setStatusFeedback(null)}
              className="p-1 hover:bg-stone-200/50 rounded-lg cursor-pointer"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          </div>
        )}

        {/* Modal Body / Scrollable Content Area */}
        <div
          className="flex-1 min-h-0 overflow-y-auto overflow-x-hidden overscroll-contain pr-1 pl-1 space-y-4"
          style={{ scrollbarGutter: 'stable' }}
        >
          {/* TAB 1: AYAH CARD DESIGN STUDIO (MULTI-AYAH SUPPORT & SOCIAL READY) */}
          {activeTab === 'ayah' && (
            <div className="space-y-4">
              {/* Surah Selection Banner / Trigger Card (Modern Islamic Selector) */}
              <div className="p-3.5 sm:p-4 rounded-2xl bg-gradient-to-r from-amber-500/10 via-amber-600/5 to-amber-700/10 dark:from-amber-950/40 dark:via-stone-850 dark:to-stone-900 border border-amber-300/80 dark:border-amber-800/60 shadow-xs flex flex-wrap items-center justify-between gap-3">
                <div className="flex items-center gap-3 min-w-0">
                  {/* Surah Number Emblem */}
                  <div className="w-11 h-11 rounded-2xl bg-gradient-to-br from-amber-800 to-amber-900 text-white flex items-center justify-center font-bold text-sm shadow-md ring-2 ring-amber-400/40 shrink-0">
                    {toArabicDigits(activeSurahMeta.number)}
                  </div>

                  <div className="min-w-0">
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className="text-[11px] font-semibold text-amber-800 dark:text-amber-400">
                        السورة المختارة للتصميم:
                      </span>
                      <h4 className="font-amiri text-xl font-bold text-stone-900 dark:text-stone-100 truncate">
                        سُورَةُ {activeSurahMeta.name}
                      </h4>
                    </div>

                    <div className="flex items-center gap-2 text-xs text-stone-600 dark:text-stone-400 mt-0.5 flex-wrap">
                      <span
                        className={`px-2 py-0.5 rounded-md font-bold text-[10px] ${
                          activeSurahMeta.revelationType === 'Meccan'
                            ? 'bg-amber-100 text-amber-950 dark:bg-amber-950 dark:text-amber-300'
                            : 'bg-emerald-100 text-emerald-950 dark:bg-emerald-950 dark:text-emerald-300'
                        }`}
                      >
                        {activeSurahMeta.revelationArabic}
                      </span>
                      <span>·</span>
                      <span>{toArabicDigits(activeSurahMeta.numberOfAyahs)} آية</span>
                      <span>·</span>
                      <span>صفحة {toArabicDigits(activeSurahMeta.startPage)}</span>
                      {activeSurahMeta.englishName && (
                        <>
                          <span>·</span>
                          <span className="font-sans text-[11px] text-stone-400">{activeSurahMeta.englishName}</span>
                        </>
                      )}
                    </div>
                  </div>
                </div>

                {/* Change Surah Trigger Button */}
                <button
                  type="button"
                  onClick={() => setIsSurahPickerOpen(true)}
                  className="px-4 py-2 rounded-xl bg-white dark:bg-stone-800 hover:bg-amber-50 dark:hover:bg-stone-750 text-amber-900 dark:text-amber-300 border border-amber-300/80 dark:border-amber-700 text-xs font-bold transition-all shadow-xs flex items-center gap-2 cursor-pointer active:scale-95"
                >
                  <Search className="w-4 h-4 text-amber-600" />
                  <span>تغيير السورة (١١٤ سورة)</span>
                </button>
              </div>

              {/* Ayah Selection Hub (5 Modes) */}
              <div className="p-3.5 rounded-2xl bg-white dark:bg-stone-850 border border-stone-200/90 dark:border-stone-700 shadow-xs space-y-3.5">
                {/* Mode Selector Tabs */}
                <div className="flex items-center justify-between gap-2 flex-wrap pb-2 border-b border-stone-100 dark:border-stone-800">
                  <div className="flex items-center gap-2">
                    <SlidersVertical className="w-4 h-4 text-amber-700 dark:text-amber-400" />
                    <span className="text-xs font-bold text-stone-800 dark:text-stone-200">
                      طريقة اختيار الآيات:
                    </span>
                  </div>

                  {/* Mode Pills */}
                  <div className="flex items-center gap-1 bg-stone-100 dark:bg-stone-800 p-1 rounded-xl text-xs flex-wrap">
                    <button
                      type="button"
                      onClick={() => setAyahSelectionMode('range')}
                      className={`px-2.5 py-1.5 rounded-lg font-bold cursor-pointer transition-all flex items-center gap-1.5 ${
                        ayahSelectionMode === 'range'
                          ? 'bg-amber-800 text-white shadow-xs'
                          : 'text-stone-600 dark:text-stone-400 hover:text-stone-900 dark:hover:text-stone-200'
                      }`}
                    >
                      <ListOrdered className="w-3.5 h-3.5" />
                      <span>نطاق متتالي</span>
                    </button>

                    <button
                      type="button"
                      onClick={() => setAyahSelectionMode('picker')}
                      className={`px-2.5 py-1.5 rounded-lg font-bold cursor-pointer transition-all flex items-center gap-1.5 ${
                        ayahSelectionMode === 'picker'
                          ? 'bg-amber-800 text-white shadow-xs'
                          : 'text-stone-600 dark:text-stone-400 hover:text-stone-900 dark:hover:text-stone-200'
                      }`}
                    >
                      <CheckSquare className="w-3.5 h-3.5" />
                      <span>قائمة الآيات</span>
                    </button>

                    <button
                      type="button"
                      onClick={() => setAyahSelectionMode('single')}
                      className={`px-2.5 py-1.5 rounded-lg font-bold cursor-pointer transition-all flex items-center gap-1.5 ${
                        ayahSelectionMode === 'single'
                          ? 'bg-amber-800 text-white shadow-xs'
                          : 'text-stone-600 dark:text-stone-400 hover:text-stone-900 dark:hover:text-stone-200'
                      }`}
                    >
                      <BookOpen className="w-3.5 h-3.5" />
                      <span>آية واحدة</span>
                    </button>

                    <button
                      type="button"
                      onClick={() => setAyahSelectionMode('presets')}
                      className={`px-2.5 py-1.5 rounded-lg font-bold cursor-pointer transition-all flex items-center gap-1.5 ${
                        ayahSelectionMode === 'presets'
                          ? 'bg-amber-800 text-white shadow-xs'
                          : 'text-stone-600 dark:text-stone-400 hover:text-stone-900 dark:hover:text-stone-200'
                      }`}
                    >
                      <Sparkles className="w-3.5 h-3.5" />
                      <span>مقتطفات مأثورة</span>
                    </button>

                    <button
                      type="button"
                      onClick={() => {
                        setAyahSelectionMode('custom');
                        setIsEditingCustomText(true);
                      }}
                      className={`px-2.5 py-1.5 rounded-lg font-bold cursor-pointer transition-all flex items-center gap-1.5 ${
                        ayahSelectionMode === 'custom'
                          ? 'bg-amber-800 text-white shadow-xs'
                          : 'text-stone-600 dark:text-stone-400 hover:text-stone-900 dark:hover:text-stone-200'
                      }`}
                    >
                      <Type className="w-3.5 h-3.5" />
                      <span>نص حر</span>
                    </button>
                  </div>
                </div>

                {/* MODE 1: RANGE SELECTOR */}
                {ayahSelectionMode === 'range' && (
                  <div className="space-y-3">
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
                      {/* From Ayah */}
                      <div className="p-3 rounded-xl bg-stone-50 dark:bg-stone-800/60 border border-stone-200 dark:border-stone-700/80 space-y-1.5">
                        <label className="block text-stone-600 dark:text-stone-300 font-bold">
                          من الآية:
                        </label>
                        <div className="flex items-center gap-2">
                          <button
                            type="button"
                            onClick={() => setRangeStartAyah((p) => Math.max(1, p - 1))}
                            className="p-2 rounded-xl bg-white dark:bg-stone-750 border border-stone-200 dark:border-stone-650 hover:bg-stone-100 cursor-pointer"
                          >
                            <ChevronRight className="w-4 h-4" />
                          </button>
                          <input
                            type="number"
                            min={1}
                            max={activeSurahMeta.numberOfAyahs}
                            value={rangeStartAyah}
                            onChange={(e) =>
                              setRangeStartAyah(
                                Math.max(1, Math.min(activeSurahMeta.numberOfAyahs, parseInt(e.target.value, 10) || 1))
                              )
                            }
                            className="flex-1 text-center font-bold py-2 rounded-xl bg-white dark:bg-stone-750 border border-stone-200 dark:border-stone-650 text-amber-900 dark:text-amber-300 text-sm"
                          />
                          <button
                            type="button"
                            onClick={() => setRangeStartAyah((p) => Math.min(rangeEndAyah, p + 1))}
                            className="p-2 rounded-xl bg-white dark:bg-stone-750 border border-stone-200 dark:border-stone-650 hover:bg-stone-100 cursor-pointer"
                          >
                            <ChevronLeft className="w-4 h-4" />
                          </button>
                        </div>
                      </div>

                      {/* To Ayah */}
                      <div className="p-3 rounded-xl bg-stone-50 dark:bg-stone-800/60 border border-stone-200 dark:border-stone-700/80 space-y-1.5">
                        <label className="block text-stone-600 dark:text-stone-300 font-bold">
                          إلى الآية:
                        </label>
                        <div className="flex items-center gap-2">
                          <button
                            type="button"
                            onClick={() => setRangeEndAyah((p) => Math.max(rangeStartAyah, p - 1))}
                            className="p-2 rounded-xl bg-white dark:bg-stone-750 border border-stone-200 dark:border-stone-650 hover:bg-stone-100 cursor-pointer"
                          >
                            <ChevronRight className="w-4 h-4" />
                          </button>
                          <input
                            type="number"
                            min={1}
                            max={activeSurahMeta.numberOfAyahs}
                            value={rangeEndAyah}
                            onChange={(e) =>
                              setRangeEndAyah(
                                Math.max(1, Math.min(activeSurahMeta.numberOfAyahs, parseInt(e.target.value, 10) || 1))
                              )
                            }
                            className="flex-1 text-center font-bold py-2 rounded-xl bg-white dark:bg-stone-750 border border-stone-200 dark:border-stone-650 text-amber-900 dark:text-amber-300 text-sm"
                          />
                          <button
                            type="button"
                            onClick={() => setRangeEndAyah((p) => Math.min(activeSurahMeta.numberOfAyahs, p + 1))}
                            className="p-2 rounded-xl bg-white dark:bg-stone-750 border border-stone-200 dark:border-stone-650 hover:bg-stone-100 cursor-pointer"
                          >
                            <ChevronLeft className="w-4 h-4" />
                          </button>
                        </div>
                      </div>
                    </div>

                    {/* Range Summary & Quick Range Shortcuts */}
                    <div className="flex items-center justify-between gap-2 flex-wrap pt-1 text-xs">
                      <div className="flex items-center gap-1.5">
                        <span className="text-stone-500">الآيات المحددة:</span>
                        <span className="font-bold text-amber-800 dark:text-amber-300 px-2 py-0.5 rounded-md bg-amber-100 dark:bg-amber-950/70 border border-amber-300/60 dark:border-amber-700/60">
                          {toArabicDigits(Math.abs(rangeEndAyah - rangeStartAyah) + 1)} آيات (من {toArabicDigits(Math.min(rangeStartAyah, rangeEndAyah))} إلى {toArabicDigits(Math.max(rangeStartAyah, rangeEndAyah))})
                        </span>
                      </div>

                      <div className="flex items-center gap-1.5 flex-wrap">
                        <button
                          type="button"
                          onClick={() => {
                            setRangeStartAyah(1);
                            setRangeEndAyah(Math.min(5, activeSurahMeta.numberOfAyahs));
                          }}
                          className="px-2 py-1 rounded-lg bg-stone-100 dark:bg-stone-800 text-stone-700 dark:text-stone-300 hover:bg-amber-100 hover:text-amber-900 cursor-pointer font-medium"
                        >
                          أول ٥ آيات
                        </button>
                        <button
                          type="button"
                          onClick={() => {
                            setRangeStartAyah(1);
                            setRangeEndAyah(Math.min(10, activeSurahMeta.numberOfAyahs));
                          }}
                          className="px-2 py-1 rounded-lg bg-stone-100 dark:bg-stone-800 text-stone-700 dark:text-stone-300 hover:bg-amber-100 hover:text-amber-900 cursor-pointer font-medium"
                        >
                          أول ١٠ آيات
                        </button>
                        <button
                          type="button"
                          onClick={() => {
                            setRangeStartAyah(1);
                            setRangeEndAyah(activeSurahMeta.numberOfAyahs);
                          }}
                          className="px-2 py-1 rounded-lg bg-stone-100 dark:bg-stone-800 text-stone-700 dark:text-stone-300 hover:bg-amber-100 hover:text-amber-900 cursor-pointer font-medium"
                        >
                          كامل السورة ({toArabicDigits(activeSurahMeta.numberOfAyahs)})
                        </button>
                      </div>
                    </div>
                  </div>
                )}

                {/* MODE 2: INTERACTIVE VISUAL AYAH CHECKLIST */}
                {ayahSelectionMode === 'picker' && (
                  <div className="space-y-2">
                    <div className="flex items-center justify-between text-xs flex-wrap gap-2">
                      <span className="font-bold text-stone-700 dark:text-stone-300">
                        اضغط على أي آية لتحديدها أو إلغاء تحديدها ({toArabicDigits(selectedAyahNumbers.length)} من {toArabicDigits(activeSurahMeta.numberOfAyahs)} محددة):
                      </span>

                      <div className="flex items-center gap-1.5">
                        <button
                          type="button"
                          onClick={() => {
                            if (surahDetail?.ayahs) {
                              setSelectedAyahNumbers(surahDetail.ayahs.map((a) => a.numberInSurah));
                            }
                          }}
                          className="px-2.5 py-0.5 rounded-lg bg-amber-100 dark:bg-amber-950/70 text-amber-900 dark:text-amber-200 font-bold hover:bg-amber-200 cursor-pointer"
                        >
                          تحديد الكل
                        </button>
                        <button
                          type="button"
                          onClick={() => setSelectedAyahNumbers([1])}
                          className="px-2.5 py-0.5 rounded-lg bg-stone-100 dark:bg-stone-800 text-stone-600 dark:text-stone-400 hover:bg-stone-200 cursor-pointer"
                        >
                          إلغاء التحديد
                        </button>
                      </div>
                    </div>

                    {/* Scrollable Ayahs Checklist */}
                    <div
                      className="max-h-[220px] overflow-y-auto space-y-1.5 pr-1 pl-1 rounded-2xl bg-stone-50/70 dark:bg-stone-900 p-2.5 border border-stone-200 dark:border-stone-700 overscroll-contain"
                      style={{ scrollbarGutter: 'stable' }}
                    >
                      {loadingSurah ? (
                        <div className="py-8 flex items-center justify-center gap-2 text-xs text-amber-700 dark:text-amber-400">
                          <Loader2 className="w-4 h-4 animate-spin" />
                          <span>جاري تحميل آيات سورة {activeSurahMeta.name}...</span>
                        </div>
                      ) : (
                        surahDetail?.ayahs?.map((ayah) => {
                          const isChecked = selectedAyahNumbers.includes(ayah.numberInSurah);
                          return (
                            <button
                              key={ayah.numberInSurah}
                              type="button"
                              onClick={() => {
                                setSelectedAyahNumbers((prev) => {
                                  if (prev.includes(ayah.numberInSurah)) {
                                    if (prev.length === 1) return prev; // Keep at least 1
                                    return prev.filter((n) => n !== ayah.numberInSurah);
                                  } else {
                                    return [...prev, ayah.numberInSurah];
                                  }
                                });
                              }}
                              className={`w-full text-right p-2.5 rounded-xl border transition-all flex items-start gap-2.5 cursor-pointer ${
                                isChecked
                                  ? 'bg-amber-50 dark:bg-amber-950/50 border-amber-500/80 ring-1 ring-amber-500/30'
                                  : 'bg-white dark:bg-stone-850 border-stone-200/80 dark:border-stone-750 hover:bg-stone-50 dark:hover:bg-stone-800'
                              }`}
                            >
                              <div
                                className={`mt-0.5 w-5 h-5 rounded-md flex items-center justify-center shrink-0 transition-colors ${
                                  isChecked
                                    ? 'bg-amber-800 text-white'
                                    : 'border border-stone-300 dark:border-stone-600 bg-white dark:bg-stone-800'
                                }`}
                              >
                                {isChecked && <Check className="w-3.5 h-3.5" />}
                              </div>

                              <div className="flex-1 min-w-0">
                                <div className="flex items-center gap-1.5 mb-1">
                                  <span className="font-mono text-[11px] font-bold px-1.5 py-0.2 rounded-md bg-amber-100 dark:bg-amber-950 text-amber-900 dark:text-amber-300">
                                    الآية {toArabicDigits(ayah.numberInSurah)}
                                  </span>
                                </div>
                                <p className="font-amiri text-sm text-stone-800 dark:text-stone-200 leading-relaxed line-clamp-2" dir="rtl">
                                  {cleanAyahText(ayah.text, currentSurahNum, ayah.numberInSurah)}
                                </p>
                              </div>
                            </button>
                          );
                        })
                      )}
                    </div>
                  </div>
                )}

                {/* MODE 3: SINGLE AYAH SELECTOR */}
                {ayahSelectionMode === 'single' && (
                  <div className="p-3 rounded-xl bg-stone-50 dark:bg-stone-800/60 border border-stone-200 dark:border-stone-700 space-y-2 text-xs">
                    <label className="block text-stone-600 dark:text-stone-300 font-bold">
                      اختر رقم الآية (من ١ إلى {toArabicDigits(activeSurahMeta.numberOfAyahs)}):
                    </label>
                    <div className="flex items-center gap-2">
                      <button
                        type="button"
                        onClick={() => setRangeStartAyah((p) => Math.max(1, p - 1))}
                        className="p-2 rounded-xl bg-white dark:bg-stone-750 border border-stone-200 dark:border-stone-650 hover:bg-stone-100 cursor-pointer"
                        title="الآية السابقة"
                      >
                        <ChevronRight className="w-4 h-4" />
                      </button>
                      <input
                        type="number"
                        min={1}
                        max={activeSurahMeta.numberOfAyahs}
                        value={rangeStartAyah}
                        onChange={(e) =>
                          setRangeStartAyah(
                            Math.max(1, Math.min(activeSurahMeta.numberOfAyahs, parseInt(e.target.value, 10) || 1))
                          )
                        }
                        className="w-28 text-center font-bold py-2 rounded-xl bg-white dark:bg-stone-750 border border-stone-200 dark:border-stone-650 text-amber-900 dark:text-amber-300 text-sm"
                      />
                      <button
                        type="button"
                        onClick={() => setRangeStartAyah((p) => Math.min(activeSurahMeta.numberOfAyahs, p + 1))}
                        className="p-2 rounded-xl bg-white dark:bg-stone-750 border border-stone-200 dark:border-stone-650 hover:bg-stone-100 cursor-pointer"
                        title="الآية التالية"
                      >
                        <ChevronLeft className="w-4 h-4" />
                      </button>

                      <span className="text-xs text-stone-500 mr-2">
                        صفحة المصحف: {toArabicDigits(activeSurahMeta.startPage)}
                      </span>
                    </div>
                  </div>
                )}

                {/* MODE 4: POPULAR QURANIC PRESETS */}
                {ayahSelectionMode === 'presets' && (
                  <div className="space-y-2">
                    <span className="text-xs text-stone-600 dark:text-stone-400 font-bold block">
                      اختر مقطعاً قرآنياً مباركاً جاهزاً للمشاركة:
                    </span>
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2.5 max-h-[220px] overflow-y-auto p-1 overscroll-contain" style={{ scrollbarGutter: 'stable' }}>
                      {POPULAR_QURAN_PRESETS.map((preset) => {
                        const isSelected = selectedPresetId === preset.id;
                        return (
                          <button
                            key={preset.id}
                            type="button"
                            onClick={() => handleSelectPreset(preset)}
                            className={`p-2.5 rounded-xl border text-right transition-all cursor-pointer flex flex-col justify-between gap-1.5 ${
                              isSelected
                                ? 'bg-amber-50 dark:bg-amber-950/60 border-amber-600 ring-2 ring-amber-500/30'
                                : 'bg-stone-50/70 dark:bg-stone-800/80 border-stone-200 dark:border-stone-700 hover:border-amber-400 hover:bg-amber-50/40'
                            }`}
                          >
                            <div className="flex items-center justify-between gap-1.5">
                              <span className="font-amiri font-bold text-sm text-stone-900 dark:text-stone-100 truncate">
                                {preset.title}
                              </span>
                              <span className="text-[10px] font-bold px-1.5 py-0.2 rounded-md bg-amber-100 dark:bg-amber-950 text-amber-900 dark:text-amber-300 shrink-0">
                                {preset.badge}
                              </span>
                            </div>
                            <p className="text-[11px] text-stone-500 dark:text-stone-400 line-clamp-2">
                              {preset.description}
                            </p>
                          </button>
                        );
                      })}
                    </div>
                  </div>
                )}

                {/* MODE 5: CUSTOM TEXT EDITOR */}
                {ayahSelectionMode === 'custom' && (
                  <div className="space-y-2">
                    <div className="flex items-center justify-between text-xs text-stone-600 dark:text-stone-400">
                      <span>نص الآيات المخصص (يمكنك تعديل التشكيل أو الفواصل بحرية):</span>
                      <button
                        type="button"
                        onClick={() => {
                          if (surahDetail && surahDetail.ayahs) {
                            const first = surahDetail.ayahs[0];
                            if (first) {
                              setActiveAyahText(cleanAyahText(first.text, currentSurahNum, first.numberInSurah));
                            }
                          }
                        }}
                        className="text-amber-700 dark:text-amber-400 hover:underline flex items-center gap-1 cursor-pointer"
                      >
                        <RefreshCw className="w-3 h-3" />
                        <span>إعادة تعيين للأصل</span>
                      </button>
                    </div>
                    <textarea
                      rows={3}
                      value={activeAyahText}
                      onChange={(e) => setActiveAyahText(e.target.value)}
                      className="w-full p-2.5 rounded-xl bg-white dark:bg-stone-800 border border-stone-300 dark:border-stone-700 text-stone-800 dark:text-stone-100 font-amiri text-base leading-relaxed focus:border-amber-500 focus:outline-hidden"
                      dir="rtl"
                    />
                  </div>
                )}
              </div>

              {/* Design Customization Bar (Theme, Ratio, Font, Size, Toggles) */}
              <div className="p-3.5 rounded-2xl bg-stone-50 dark:bg-stone-850/70 border border-stone-200/90 dark:border-stone-700 space-y-3.5">
                {/* 1. Theme Selector */}
                <div>
                  <label className="flex items-center gap-1.5 text-xs font-bold text-stone-700 dark:text-stone-300 mb-2">
                    <Palette className="w-3.5 h-3.5 text-amber-600" />
                    <span>أنماط التصميم الفاخرة (٦ ألوان ملكية):</span>
                  </label>
                  <div className="grid grid-cols-2 sm:grid-cols-6 gap-1.5">
                    {AYAH_THEMES.map((t) => (
                      <button
                        key={t.id}
                        type="button"
                        onClick={() => setSelectedTheme(t.id)}
                        className={`p-2 rounded-xl border text-center transition-all cursor-pointer flex items-center justify-center gap-1.5 ${
                          selectedTheme === t.id
                            ? 'border-amber-600 ring-2 ring-amber-500/40 font-bold shadow-xs'
                            : 'border-stone-200 dark:border-stone-700 hover:border-amber-400'
                        }`}
                        style={{ backgroundColor: t.bgColor, color: t.textColor }}
                      >
                        <span className="w-2.5 h-2.5 rounded-full shrink-0" style={{ backgroundColor: t.accentColor }} />
                        <span className="text-[11px] truncate">{t.name}</span>
                      </button>
                    ))}
                  </div>
                </div>

                {/* 2. Aspect Ratio (Social Media Formats), Font Family, Font Size */}
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-2.5 border-t border-stone-200/60 dark:border-stone-700/60 text-xs">
                  {/* Aspect Ratio */}
                  <div>
                    <span className="font-bold text-stone-600 dark:text-stone-300 block mb-1">
                      أبعاد منصات التواصل:
                    </span>
                    <div className="grid grid-cols-2 gap-1 bg-white dark:bg-stone-900 p-1 rounded-xl border border-stone-200 dark:border-stone-700">
                      <button
                        type="button"
                        onClick={() => setCardAspectRatio('story')}
                        className={`py-1 rounded-lg font-medium cursor-pointer transition-colors text-center ${
                          cardAspectRatio === 'story' ? 'bg-amber-100 text-amber-950 font-bold' : 'text-stone-500'
                        }`}
                        title="9:16 (حالات واتساب، ريلز، ستوري انستغرام، تيك توك)"
                      >
                        ستوري (9:16)
                      </button>
                      <button
                        type="button"
                        onClick={() => setCardAspectRatio('portrait')}
                        className={`py-1 rounded-lg font-medium cursor-pointer transition-colors text-center ${
                          cardAspectRatio === 'portrait' ? 'bg-amber-100 text-amber-950 font-bold' : 'text-stone-500'
                        }`}
                        title="4:5 (منشورات انستغرام وفيسبوك الرأسية)"
                      >
                        عمودي (4:5)
                      </button>
                      <button
                        type="button"
                        onClick={() => setCardAspectRatio('square')}
                        className={`py-1 rounded-lg font-medium cursor-pointer transition-colors text-center ${
                          cardAspectRatio === 'square' ? 'bg-amber-100 text-amber-950 font-bold' : 'text-stone-500'
                        }`}
                        title="1:1 (منشور مربع كلاسيكي)"
                      >
                        مربع (1:1)
                      </button>
                      <button
                        type="button"
                        onClick={() => setCardAspectRatio('banner')}
                        className={`py-1 rounded-lg font-medium cursor-pointer transition-colors text-center ${
                          cardAspectRatio === 'banner' ? 'bg-amber-100 text-amber-950 font-bold' : 'text-stone-500'
                        }`}
                        title="16:9 (تويتر وغلاف يوتيوب ولاندسكيب)"
                      >
                        بانر (16:9)
                      </button>
                    </div>
                  </div>

                  {/* Font Family */}
                  <div>
                    <span className="font-bold text-stone-600 dark:text-stone-300 block mb-1">نوع الخط العربي:</span>
                    <div className="flex items-center gap-1 bg-white dark:bg-stone-900 p-1 rounded-xl border border-stone-200 dark:border-stone-700">
                      <button
                        type="button"
                        onClick={() => setSelectedFont('amiri')}
                        className={`flex-1 py-1 rounded-lg font-amiri text-xs cursor-pointer transition-colors ${
                          selectedFont === 'amiri' ? 'bg-amber-100 text-amber-950 font-bold' : 'text-stone-500'
                        }`}
                      >
                        الأميري القرآني
                      </button>
                      <button
                        type="button"
                        onClick={() => setSelectedFont('cairo')}
                        className={`flex-1 py-1 rounded-lg text-[11px] cursor-pointer transition-colors ${
                          selectedFont === 'cairo' ? 'bg-amber-100 text-amber-950 font-bold' : 'text-stone-500'
                        }`}
                      >
                        كوفي حديث
                      </button>
                      <button
                        type="button"
                        onClick={() => setSelectedFont('ibm')}
                        className={`flex-1 py-1 rounded-lg text-[11px] cursor-pointer transition-colors ${
                          selectedFont === 'ibm' ? 'bg-amber-100 text-amber-950 font-bold' : 'text-stone-500'
                        }`}
                      >
                        إبم بلكس
                      </button>
                    </div>
                  </div>

                  {/* Font Size */}
                  <div>
                    <span className="font-bold text-stone-600 dark:text-stone-300 block mb-1">مقياس حجم الخط:</span>
                    <div className="flex items-center gap-1 bg-white dark:bg-stone-900 p-1 rounded-xl border border-stone-200 dark:border-stone-700">
                      <button
                        type="button"
                        onClick={() => setCardFontSize('auto')}
                        className={`flex-1 py-1 rounded-lg cursor-pointer ${
                          cardFontSize === 'auto' ? 'bg-amber-100 text-amber-950 font-bold' : 'text-stone-500'
                        }`}
                        title="ضبط حجم الخط تلقائياً ليناسب عدد الآيات تماماً دون قص"
                      >
                        تلقائي ذكي
                      </button>
                      <button
                        type="button"
                        onClick={() => setCardFontSize('small')}
                        className={`flex-1 py-1 rounded-lg cursor-pointer ${
                          cardFontSize === 'small' ? 'bg-amber-100 text-amber-950 font-bold' : 'text-stone-500'
                        }`}
                      >
                        صغير
                      </button>
                      <button
                        type="button"
                        onClick={() => setCardFontSize('normal')}
                        className={`flex-1 py-1 rounded-lg cursor-pointer ${
                          cardFontSize === 'normal' ? 'bg-amber-100 text-amber-950 font-bold' : 'text-stone-500'
                        }`}
                      >
                        متوسط
                      </button>
                      <button
                        type="button"
                        onClick={() => setCardFontSize('large')}
                        className={`flex-1 py-1 rounded-lg cursor-pointer ${
                          cardFontSize === 'large' ? 'bg-amber-100 text-amber-950 font-bold' : 'text-stone-500'
                        }`}
                      >
                        كبير
                      </button>
                    </div>
                  </div>
                </div>

                {/* 3. Toggles & Dedication */}
                <div className="pt-2 border-t border-stone-200/60 dark:border-stone-750 space-y-2 text-xs">
                  <div className="flex items-center gap-3 sm:gap-4 flex-wrap">
                    <button
                      type="button"
                      onClick={() => setShowBismillah(!showBismillah)}
                      className="flex items-center gap-2 cursor-pointer select-none group py-1 text-stone-700 dark:text-stone-300 hover:text-amber-900 dark:hover:text-amber-200 transition-colors"
                      role="checkbox"
                      aria-checked={showBismillah}
                    >
                      <span
                        className={`w-4 h-4 rounded-md flex items-center justify-center border transition-all duration-150 ${
                          showBismillah
                            ? 'bg-amber-700 dark:bg-amber-600 border-amber-800 dark:border-amber-500 text-white shadow-2xs'
                            : 'bg-white dark:bg-stone-800 border-stone-300 dark:border-stone-650 group-hover:border-amber-500'
                        }`}
                      >
                        {showBismillah && <Check className="w-3 h-3 stroke-[3]" />}
                      </span>
                      <span className="font-medium text-xs">إظهار البسملة</span>
                    </button>

                    <button
                      type="button"
                      onClick={() => setShowSurahBadge(!showSurahBadge)}
                      className="flex items-center gap-2 cursor-pointer select-none group py-1 text-stone-700 dark:text-stone-300 hover:text-amber-900 dark:hover:text-amber-200 transition-colors"
                      role="checkbox"
                      aria-checked={showSurahBadge}
                    >
                      <span
                        className={`w-4 h-4 rounded-md flex items-center justify-center border transition-all duration-150 ${
                          showSurahBadge
                            ? 'bg-amber-700 dark:bg-amber-600 border-amber-800 dark:border-amber-500 text-white shadow-2xs'
                            : 'bg-white dark:bg-stone-800 border-stone-300 dark:border-stone-650 group-hover:border-amber-500'
                        }`}
                      >
                        {showSurahBadge && <Check className="w-3 h-3 stroke-[3]" />}
                      </span>
                      <span className="font-medium text-xs">إظهار شارة السورة والآيات</span>
                    </button>

                    <button
                      type="button"
                      onClick={() => setShowAyahNumbers(!showAyahNumbers)}
                      className="flex items-center gap-2 cursor-pointer select-none group py-1 text-stone-700 dark:text-stone-300 hover:text-amber-900 dark:hover:text-amber-200 transition-colors"
                      role="checkbox"
                      aria-checked={showAyahNumbers}
                    >
                      <span
                        className={`w-4 h-4 rounded-md flex items-center justify-center border transition-all duration-150 ${
                          showAyahNumbers
                            ? 'bg-amber-700 dark:bg-amber-600 border-amber-800 dark:border-amber-500 text-white shadow-2xs'
                            : 'bg-white dark:bg-stone-800 border-stone-300 dark:border-stone-650 group-hover:border-amber-500'
                        }`}
                      >
                        {showAyahNumbers && <Check className="w-3 h-3 stroke-[3]" />}
                      </span>
                      <span className="font-medium text-xs">إظهار أرقام الآيات المزخرفة ﴿١﴾</span>
                    </button>

                    <button
                      type="button"
                      onClick={() => setShowDedicationFooter(!showDedicationFooter)}
                      className="flex items-center gap-2 cursor-pointer select-none group py-1 text-stone-700 dark:text-stone-300 hover:text-amber-900 dark:hover:text-amber-200 transition-colors"
                      role="checkbox"
                      aria-checked={showDedicationFooter}
                    >
                      <span
                        className={`w-4 h-4 rounded-md flex items-center justify-center border transition-all duration-150 ${
                          showDedicationFooter
                            ? 'bg-amber-700 dark:bg-amber-600 border-amber-800 dark:border-amber-500 text-white shadow-2xs'
                            : 'bg-white dark:bg-stone-800 border-stone-300 dark:border-stone-650 group-hover:border-amber-500'
                        }`}
                      >
                        {showDedicationFooter && <Check className="w-3 h-3 stroke-[3]" />}
                      </span>
                      <span className="font-medium text-xs">إظهار شريط الدعاء السفلي</span>
                    </button>
                  </div>

                  {showDedicationFooter && (
                    <div className="flex items-center gap-2 pt-1">
                      <span className="text-stone-500 text-[11px] shrink-0">نص الدعاء السفلي:</span>
                      <input
                        type="text"
                        value={customDedicationText}
                        onChange={(e) => setCustomDedicationText(e.target.value)}
                        placeholder="اكتب دعاءً مباركاً يظهر في أسفل بطاقة التصميم..."
                        className="flex-1 py-1 px-2.5 rounded-lg bg-white dark:bg-stone-800 border border-stone-200 dark:border-stone-700 text-stone-800 dark:text-stone-200 text-xs focus:outline-hidden focus:border-amber-500"
                      />
                    </div>
                  )}
                </div>
              </div>

              {/* Ayah Live Preview Canvas (Rock-solid viewport isolation) */}
              <div className="relative rounded-2xl overflow-hidden shadow-xl border border-stone-200 dark:border-stone-800 flex items-center justify-center bg-[#0d0e12] p-2 sm:p-4 min-h-[260px] max-h-[380px]">
                <canvas
                  ref={ayahCanvasRef}
                  className="max-h-[350px] w-auto max-w-full object-contain rounded-xl shadow-2xl transition-all duration-200"
                />
              </div>

              {/* Action Toolbar for Ayah (Social Ready Sharing & Export) */}
              <div className="flex flex-wrap items-center justify-between gap-2.5 pt-2 border-t border-stone-200/80 dark:border-stone-800">
                <div className="flex items-center gap-2 flex-wrap">
                  <button
                    type="button"
                    onClick={handleCopyAyah}
                    className="flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-semibold text-stone-600 dark:text-stone-300 bg-stone-100 dark:bg-stone-800 hover:bg-stone-200 dark:hover:bg-stone-750 transition-colors cursor-pointer"
                  >
                    {copied ? <Check className="w-4 h-4 text-emerald-600" /> : <Copy className="w-4 h-4" />}
                    <span>{copied ? 'تم نسخ النص' : 'نسخ النص'}</span>
                  </button>

                  <button
                    type="button"
                    onClick={handleCopyAyahCardImage}
                    className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-bold text-amber-900 dark:text-amber-200 bg-amber-100 dark:bg-amber-950/60 hover:bg-amber-200 dark:hover:bg-amber-900/60 transition-colors cursor-pointer border border-amber-300/60 dark:border-amber-700/60"
                    title="نسخ الصورة للحافظة للصقها مباشرة في واتساب أو تليجرام"
                  >
                    {copiedImage ? <Check className="w-4 h-4 text-emerald-600" /> : <ImageIcon className="w-4 h-4" />}
                    <span>{copiedImage ? 'تم نسخ الصورة للحافظة!' : 'نسخ الصورة (للواتساب)'}</span>
                  </button>

                  <button
                    type="button"
                    onClick={handleDownloadAyahPdf}
                    className="flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-semibold text-stone-600 dark:text-stone-300 bg-stone-100 dark:bg-stone-800 hover:bg-stone-200 dark:hover:bg-stone-750 transition-colors cursor-pointer"
                    title="تصدير كملف PDF مذهب عالي الجودة"
                  >
                    <FileDown className="w-4 h-4 text-amber-600" />
                    <span>تصدير PDF</span>
                  </button>
                </div>

                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={handleShareAyah}
                    className="flex items-center gap-1.5 px-4 py-2.5 rounded-xl text-xs font-bold text-amber-950 dark:text-amber-100 bg-amber-200/80 dark:bg-amber-900/70 hover:bg-amber-300 dark:hover:bg-amber-800 transition-colors cursor-pointer"
                    title="مشاركة فورية عبر تطبيقات الهاتف"
                  >
                    <Share2 className="w-4 h-4" />
                    <span>مشاركة فورية</span>
                  </button>

                  <button
                    type="button"
                    onClick={handleDownloadAyahImage}
                    className="flex items-center gap-2 px-5 py-2.5 rounded-xl text-xs font-bold text-white bg-gradient-to-r from-amber-800 to-amber-900 hover:from-amber-900 hover:to-amber-950 shadow-md transition-all cursor-pointer active:scale-95"
                  >
                    <Download className="w-4 h-4 text-amber-300" />
                    <span>تحميل التصميم (PNG عالي الدقة)</span>
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* Surah Selection Modal / Drawer */}
          <SurahPickerModal
            isOpen={isSurahPickerOpen}
            onClose={() => setIsSurahPickerOpen(false)}
            selectedSurahNumber={currentSurahNum}
            onSelectSurah={(num) => {
              setCurrentSurahNum(num);
              setRangeStartAyah(1);
              setRangeEndAyah(1);
              setSelectedAyahNumbers([1]);
              setSelectedPresetId(null);
            }}
          />

          {/* TAB 2: 30 JUZ DOWNLOAD CENTER */}
          {activeTab === 'juz' && (
            <div className="space-y-4">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2.5 p-3.5 rounded-2xl bg-amber-50/70 dark:bg-stone-850 border border-amber-200 dark:border-stone-700">
                <div>
                  <h4 className="font-amiri text-lg font-bold text-amber-950 dark:text-amber-300 flex items-center gap-2">
                    <Layers className="w-5 h-5 text-amber-700 dark:text-amber-400" />
                    <span>تنزيل القرآن الكريم مقسماً حسب الأجزاء (٣٠ جزءاً)</span>
                  </h4>
                  <p className="text-xs text-stone-500 dark:text-stone-400">
                    أجزاء المصحف الشريف بدقة متناهية وإطارات مذهبة، قابلة للتحميل الفوري أو التصفح بالمصحف
                  </p>
                </div>

                {/* Search Bar */}
                <div className="relative min-w-[220px]">
                  <Search className="w-3.5 h-3.5 text-stone-400 absolute right-3 top-1/2 -translate-y-1/2" />
                  <input
                    type="text"
                    value={juzSearchQuery}
                    onChange={(e) => setJuzSearchQuery(e.target.value)}
                    placeholder="ابحث برقم الجزء، الاسم (عمّ، يس)، أو السورة..."
                    className="w-full pr-8 pl-3 py-1.5 text-xs rounded-xl bg-white dark:bg-stone-800 border border-stone-200 dark:border-stone-700 focus:border-amber-500 focus:outline-hidden text-stone-800 dark:text-stone-200"
                  />
                  {juzSearchQuery && (
                    <button
                      type="button"
                      onClick={() => setJuzSearchQuery('')}
                      className="absolute left-2.5 top-1/2 -translate-y-1/2 text-stone-400 hover:text-stone-600"
                    >
                      <X className="w-3 h-3" />
                    </button>
                  )}
                </div>
              </div>

              {/* Filter Chips */}
              <div className="flex items-center gap-1.5 flex-wrap text-xs">
                <span className="text-stone-500 font-semibold">تصفية سريعة:</span>
                <button
                  type="button"
                  onClick={() => setJuzFilterCategory('all')}
                  className={`px-3 py-1 rounded-xl font-bold cursor-pointer transition-colors ${
                    juzFilterCategory === 'all'
                      ? 'bg-amber-800 text-white shadow-xs'
                      : 'bg-stone-100 dark:bg-stone-800 text-stone-600 dark:text-stone-400'
                  }`}
                >
                  جميع الأجزاء (٣٠)
                </button>
                <button
                  type="button"
                  onClick={() => setJuzFilterCategory('qisar')}
                  className={`px-3 py-1 rounded-xl font-bold cursor-pointer transition-colors ${
                    juzFilterCategory === 'qisar'
                      ? 'bg-amber-800 text-white shadow-xs'
                      : 'bg-stone-100 dark:bg-stone-800 text-stone-600 dark:text-stone-400'
                  }`}
                >
                  أجزاء الصلوات والقصار (عمّ، تبارك، قد سمع)
                </button>
                <button
                  type="button"
                  onClick={() => setJuzFilterCategory('firstHalf')}
                  className={`px-3 py-1 rounded-xl font-bold cursor-pointer transition-colors ${
                    juzFilterCategory === 'firstHalf'
                      ? 'bg-amber-800 text-white shadow-xs'
                      : 'bg-stone-100 dark:bg-stone-800 text-stone-600 dark:text-stone-400'
                  }`}
                >
                  النصف الأول (الأجزاء ١ - ١٥)
                </button>
                <button
                  type="button"
                  onClick={() => setJuzFilterCategory('secondHalf')}
                  className={`px-3 py-1 rounded-xl font-bold cursor-pointer transition-colors ${
                    juzFilterCategory === 'secondHalf'
                      ? 'bg-amber-800 text-white shadow-xs'
                      : 'bg-stone-100 dark:bg-stone-800 text-stone-600 dark:text-stone-400'
                  }`}
                >
                  النصف الثاني (الأجزاء ١٦ - ٣٠)
                </button>
              </div>

              {/* PDF Progress Banner for Juz Generation */}
              {generatingPdf && pdfProgress && (
                <div className="p-3.5 rounded-xl bg-amber-100 dark:bg-amber-950/90 border border-amber-300 dark:border-amber-700 text-right space-y-2.5 shadow-sm">
                  <div className="flex items-center justify-between text-xs font-bold text-amber-950 dark:text-amber-200">
                    <span className="flex items-center gap-2">
                      <Loader2 className="w-4 h-4 animate-spin text-amber-700 dark:text-amber-300" />
                      {pdfProgress.statusText}
                    </span>
                    <div className="flex items-center gap-3">
                      <span className="font-mono text-xs">
                        {toArabicDigits(pdfProgress.currentPage)} / {toArabicDigits(pdfProgress.totalPages)}
                      </span>
                      <button
                        type="button"
                        onClick={handleCancelPdf}
                        className="px-2 py-0.5 rounded-md bg-rose-100 dark:bg-rose-950/60 hover:bg-rose-200 text-rose-800 dark:text-rose-300 text-[11px] font-bold border border-rose-300 dark:border-rose-800 cursor-pointer transition-colors"
                      >
                        إلغاء التصدير
                      </button>
                    </div>
                  </div>
                  <div className="w-full bg-amber-200/80 dark:bg-stone-800 rounded-full h-2.5 overflow-hidden">
                    <div
                      className="bg-gradient-to-r from-amber-600 to-amber-500 h-2.5 rounded-full transition-all duration-300"
                      style={{
                        width: `${Math.round((pdfProgress.currentPage / pdfProgress.totalPages) * 100)}%`,
                      }}
                    />
                  </div>
                </div>
              )}

              {/* Juz Cards Grid */}
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                {filteredAjza.map((juz) => (
                  <div
                    key={juz.number}
                    className="p-3.5 rounded-2xl bg-white dark:bg-stone-850 border border-stone-200/90 dark:border-stone-750 hover:border-amber-500/80 hover:shadow-md transition-all flex flex-col justify-between gap-3 group"
                  >
                    <div className="space-y-1">
                      <div className="flex items-center justify-between gap-2">
                        <span className="w-6 h-6 rounded-lg bg-amber-100 dark:bg-amber-950/80 text-amber-900 dark:text-amber-300 font-mono text-xs font-bold flex items-center justify-center shrink-0 border border-amber-300/60 dark:border-amber-700/60">
                          {toArabicDigits(juz.number)}
                        </span>
                        <h5 className="font-amiri text-base font-bold text-stone-900 dark:text-stone-100 group-hover:text-amber-800 dark:group-hover:text-amber-300 transition-colors flex-1 truncate">
                          {juz.name}
                        </h5>
                      </div>

                      <p className="text-xs text-amber-800 dark:text-amber-400 font-medium">
                        يبدأ بـ: {juz.startSurah}
                      </p>

                      <div className="flex items-center justify-between text-[11px] text-stone-500 dark:text-stone-400 pt-1">
                        <span>الصفحات: {toArabicDigits(juz.startPage)} - {toArabicDigits(juz.endPage)}</span>
                        <span className="font-semibold text-stone-600 dark:text-stone-300">
                          ({toArabicDigits(juz.endPage - juz.startPage + 1)} صفحة)
                        </span>
                      </div>
                    </div>

                    <div className="flex items-center gap-1.5 pt-2 border-t border-stone-100 dark:border-stone-800">
                      <button
                        type="button"
                        onClick={() => handleGenerateCustomRangePdf(juz.startPage, juz.endPage, juz.name)}
                        disabled={generatingPdf}
                        className="flex-1 py-1.5 px-2.5 rounded-xl bg-amber-800 hover:bg-amber-900 text-white text-xs font-bold transition-all cursor-pointer flex items-center justify-center gap-1.5 disabled:opacity-40 shadow-xs active:scale-[0.98]"
                        title={`تصدير ${juz.name} كملف PDF عالي الجودة مع الإطار المذهب`}
                      >
                        <Download className="w-3.5 h-3.5 text-amber-300" />
                        <span>تصدير PDF مؤطر</span>
                      </button>

                      {onNavigateToMushafPage && (
                        <button
                          type="button"
                          onClick={() => {
                            onNavigateToMushafPage(juz.startPage);
                            onClose();
                          }}
                          className="py-1.5 px-3 rounded-xl bg-stone-100 hover:bg-stone-200 dark:bg-stone-800 dark:hover:bg-stone-750 text-stone-700 dark:text-stone-300 text-xs font-medium transition-colors cursor-pointer flex items-center justify-center gap-1 shrink-0"
                          title="تصفح هذا الجزء في المصحف الورقي"
                        >
                          <BookOpen className="w-3.5 h-3.5 text-stone-500" />
                          <span>تصفح</span>
                        </button>
                      )}
                    </div>
                  </div>
                ))}

                {filteredAjza.length === 0 && (
                  <div className="col-span-full py-12 text-center text-xs text-stone-400">
                    لا توجد أجزاء مطابقة لبحثك "{juzSearchQuery}"
                  </div>
                )}
              </div>
            </div>
          )}

          {/* TAB 3: CERTIFIED EDITIONS LIBRARY */}
          {activeTab === 'editions' && (
            <div className="space-y-4">
              {/* Category Filter and Search Toolbar */}
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 p-3.5 rounded-2xl bg-amber-50/70 dark:bg-stone-850 border border-amber-200 dark:border-stone-700">
                <div className="flex items-center gap-1.5 flex-wrap text-xs">
                  <button
                    type="button"
                    onClick={() => setEditionCategoryFilter('all')}
                    className={`px-3 py-1.5 rounded-xl font-bold whitespace-nowrap transition-all cursor-pointer ${
                      editionCategoryFilter === 'all'
                        ? 'bg-amber-800 text-white shadow-xs'
                        : 'bg-white dark:bg-stone-800 text-stone-600 dark:text-stone-400 hover:bg-stone-100'
                    }`}
                  >
                    جميع الطبعات المعتمدة ({toArabicDigits(OFFICIAL_QURAN_EDITIONS.length)})
                  </button>
                  <button
                    type="button"
                    onClick={() => setEditionCategoryFilter('hafs')}
                    className={`px-3 py-1.5 rounded-xl font-bold whitespace-nowrap transition-all cursor-pointer ${
                      editionCategoryFilter === 'hafs'
                        ? 'bg-amber-800 text-white shadow-xs'
                        : 'bg-white dark:bg-stone-800 text-stone-600 dark:text-stone-400 hover:bg-stone-100'
                    }`}
                  >
                    رواية حفص عن عاصم
                  </button>
                  <button
                    type="button"
                    onClick={() => setEditionCategoryFilter('riwayat')}
                    className={`px-3 py-1.5 rounded-xl font-bold whitespace-nowrap transition-all cursor-pointer ${
                      editionCategoryFilter === 'riwayat'
                        ? 'bg-amber-800 text-white shadow-xs'
                        : 'bg-white dark:bg-stone-800 text-stone-600 dark:text-stone-400 hover:bg-stone-100'
                    }`}
                  >
                    الروايات المعتمدة
                  </button>
                  <button
                    type="button"
                    onClick={() => setEditionCategoryFilter('tafsir_tajweed')}
                    className={`px-3 py-1.5 rounded-xl font-bold whitespace-nowrap transition-all cursor-pointer ${
                      editionCategoryFilter === 'tafsir_tajweed'
                        ? 'bg-amber-800 text-white shadow-xs'
                        : 'bg-white dark:bg-stone-800 text-stone-600 dark:text-stone-400 hover:bg-stone-100'
                    }`}
                  >
                    التفاسير والتجويد
                  </button>
                </div>

                {/* Search box */}
                <div className="relative min-w-[210px]">
                  <Search className="w-3.5 h-3.5 absolute right-3 top-1/2 -translate-y-1/2 text-stone-400 pointer-events-none" />
                  <input
                    type="text"
                    placeholder="ابحث عن طبعة أو رواية..."
                    value={editionSearchQuery}
                    onChange={(e) => setEditionSearchQuery(e.target.value)}
                    className="w-full text-xs bg-white dark:bg-stone-800 border border-stone-200 dark:border-stone-700 rounded-xl pr-8 pl-3 py-1.5 text-stone-800 dark:text-stone-200 placeholder:text-stone-400 focus:outline-hidden focus:border-amber-500"
                  />
                  {editionSearchQuery && (
                    <button
                      type="button"
                      onClick={() => setEditionSearchQuery('')}
                      className="absolute left-2.5 top-1/2 -translate-y-1/2 text-stone-400 hover:text-stone-600 dark:hover:text-stone-200"
                    >
                      <X className="w-3 h-3" />
                    </button>
                  )}
                </div>
              </div>

              {/* Editions Grid */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                {filteredEditions.map((edition) => (
                  <div
                    key={edition.id}
                    className="p-4 rounded-2xl bg-gradient-to-br from-amber-50/50 via-white to-amber-50/20 dark:from-stone-850 dark:to-stone-900 border border-amber-200/80 dark:border-stone-700 shadow-xs flex flex-col justify-between space-y-3.5 hover:border-amber-400 dark:hover:border-amber-500/60 transition-all group"
                  >
                    <div className="flex gap-3.5">
                      {/* Thumbnail Cover */}
                      {edition.coverImage && (
                        <div className="shrink-0 w-16 sm:w-20 bg-stone-100 dark:bg-stone-900 rounded-xl p-1 border border-stone-200 dark:border-stone-700 flex items-center justify-center self-start shadow-xs">
                          <img
                            src={edition.coverImage}
                            alt={edition.title}
                            className="max-h-24 sm:max-h-28 w-auto object-contain rounded-lg"
                            loading="lazy"
                          />
                        </div>
                      )}

                      {/* Edition Meta */}
                      <div className="flex-1 min-w-0">
                        <h5 className="font-amiri text-base font-bold text-amber-950 dark:text-stone-100 leading-snug group-hover:text-amber-800 dark:group-hover:text-amber-300 transition-colors">
                          {edition.title}
                        </h5>

                        <p className="text-xs text-amber-800 dark:text-amber-400 font-medium mt-0.5 line-clamp-1">
                          {edition.subtitle}
                        </p>

                        <div className="flex items-center gap-1.5 flex-wrap mt-1.5">
                          {edition.riwayah && (
                            <span className="text-[10px] font-amiri font-bold px-2 py-0.5 rounded-md bg-amber-100 dark:bg-amber-950 text-amber-900 dark:text-amber-300 border border-amber-200 dark:border-amber-800/60">
                              {edition.riwayah}
                            </span>
                          )}
                          <span className="text-[10px] font-sans font-bold px-2 py-0.5 rounded-md bg-stone-100 dark:bg-stone-800 text-stone-700 dark:text-stone-300">
                            {edition.fileSize}
                          </span>
                          <span className="text-[10px] font-amiri text-stone-500 dark:text-stone-400">
                            {toArabicDigits(edition.pagesCount)} صفحة
                          </span>
                        </div>

                        <p className="text-[11px] text-stone-500 dark:text-stone-400 mt-2 leading-relaxed line-clamp-2">
                          {edition.description}
                        </p>
                      </div>
                    </div>

                    {/* Action Buttons */}
                    <div className="flex items-center gap-2 pt-2.5 border-t border-amber-100 dark:border-stone-750">
                      <a
                        href={edition.downloadUrl}
                        download
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex-1 flex items-center justify-center gap-1.5 py-2 px-3 rounded-xl bg-amber-800 hover:bg-amber-900 text-white text-xs font-bold shadow-xs transition-all cursor-pointer active:scale-[0.98]"
                        title="بدء تحميل النسخة الكاملة للمصحف بصيغة PDF"
                      >
                        <Download className="w-3.5 h-3.5 text-amber-300" />
                        <span>تحميل المصحف كامل (PDF)</span>
                      </a>

                      {/* Copy Direct Link */}
                      <button
                        type="button"
                        onClick={() => handleCopyEditionLink(edition.downloadUrl, edition.id)}
                        className="p-2 rounded-xl border border-stone-200 dark:border-stone-700 hover:bg-stone-100 dark:hover:bg-stone-800 text-stone-600 dark:text-stone-300 transition-colors cursor-pointer"
                        title="نسخ رابط التحميل المباشر لبرامج التحميل (IDM/ADM)"
                      >
                        {copiedEditionId === edition.id ? (
                          <Check className="w-4 h-4 text-emerald-600" />
                        ) : (
                          <Copy className="w-4 h-4" />
                        )}
                      </button>

                      {/* View archive details */}
                      {edition.detailsUrl && (
                        <a
                          href={edition.detailsUrl}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="p-2 rounded-xl border border-stone-200 dark:border-stone-700 hover:bg-stone-100 dark:hover:bg-stone-800 text-stone-500 hover:text-stone-800 dark:hover:text-stone-200 transition-colors cursor-pointer"
                          title="عرض تفاصيل النسخة في الأرشيف المعتمد"
                        >
                          <ExternalLink className="w-4 h-4" />
                        </a>
                      )}
                    </div>
                  </div>
                ))}
              </div>

              {/* Informative Note */}
              <div className="p-3.5 rounded-2xl bg-amber-500/10 border border-amber-300/40 dark:border-amber-700/30 flex items-start gap-2.5 text-xs text-stone-600 dark:text-stone-300">
                <Info className="w-4 h-4 text-amber-700 dark:text-amber-400 shrink-0 mt-0.5" />
                <div className="space-y-1">
                  <p className="font-semibold text-amber-950 dark:text-amber-300">
                    معلومة هامة للمستخدمين:
                  </p>
                  <p className="text-[11px] leading-relaxed">
                    جميع النسخ أعلاه هي طبعات معتمدة ومحققة برسم وضبط المصحف الشريف. الروابط مباشرة وتدعم الاستكمال والتنزيل السريع عبر الهاتف أو الحاسوب أو تطبيقات إدارة التحميل (IDM و ADM).
                  </p>
                </div>
              </div>
            </div>
          )}

          {/* TAB 4: SURAH & CUSTOM RANGE PDF */}
          {activeTab === 'surah' && (
            <div className="space-y-4">
              {/* Surah Selector Card */}
              <div className="p-4 rounded-2xl bg-stone-50 dark:bg-stone-850 border border-stone-200 dark:border-stone-700 space-y-3">
                <div className="flex flex-wrap items-center justify-between gap-3">
                  <div>
                    <h4 className="font-amiri text-lg font-bold text-stone-900 dark:text-stone-100">
                      تصدير سورة كاملة كملف PDF مذهب
                    </h4>
                    <p className="text-xs text-stone-500 dark:text-stone-400">
                      تصدير أي سورة مع فواصل الصفحات والزخارف القرآنية المذهبة
                    </p>
                  </div>

                  <div className="w-full sm:w-64">
                    <CustomSelect
                      value={currentSurahNum}
                      onChange={(val) => setCurrentSurahNum(Number(val))}
                      options={ALL_SURAHS.map((s) => ({
                        value: s.number,
                        label: `${toArabicDigits(s.number)}. سورة ${s.name}`,
                        sublabel: `${toArabicDigits(s.numberOfAyahs)} آية · ${s.revelationArabic}`,
                        badge: `صفحة ${toArabicDigits(s.startPage)}`,
                      }))}
                      searchable={true}
                      searchPlaceholder="ابحث باسم السورة..."
                      size="sm"
                    />
                  </div>
                </div>

                <div className="flex items-center justify-between text-xs text-stone-600 dark:text-stone-300 pt-2 border-t border-stone-200/60 dark:border-stone-750">
                  <span>
                    عدد الصفحات المقدرة: {toArabicDigits(totalSurahPages)} صفحة
                  </span>
                  <button
                    type="button"
                    onClick={handleDownloadSurahPdf}
                    disabled={generatingPdf || loadingSurah}
                    className="py-2 px-4 rounded-xl bg-amber-800 hover:bg-amber-900 text-white font-bold transition-all cursor-pointer flex items-center gap-1.5 disabled:opacity-50 shadow-xs"
                  >
                    {generatingPdf ? (
                      <Loader2 className="w-4 h-4 animate-spin" />
                    ) : (
                      <Download className="w-4 h-4 text-amber-300" />
                    )}
                    <span>تحميل سورة {activeSurahMeta.name} (PDF)</span>
                  </button>
                </div>
              </div>

              {/* Custom Range PDF Generator */}
              <div className="p-4 sm:p-5 rounded-2xl bg-amber-50/70 dark:bg-stone-850 border border-amber-300/80 dark:border-stone-700 space-y-4">
                <div className="flex items-center gap-2">
                  <SlidersHorizontal className="w-5 h-5 text-amber-700 dark:text-amber-400" />
                  <div>
                    <h4 className="font-amiri text-lg font-bold text-amber-950 dark:text-stone-100">
                      تصدير نطاق صفحات مخصص كملف PDF
                    </h4>
                    <p className="text-xs text-amber-800 dark:text-amber-300">
                      حدد نطاق الصفحات وسيقوم النظام بتأطيرها وتصديرها بملف PDF واحد
                    </p>
                  </div>
                </div>

                {/* Range inputs */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div className="flex items-center gap-2 bg-white dark:bg-stone-900 p-2.5 rounded-xl border border-stone-200 dark:border-stone-700">
                    <span className="text-xs font-bold text-stone-700 dark:text-stone-300 whitespace-nowrap">من صفحة:</span>
                    <input
                      type="number"
                      min={1}
                      max={604}
                      value={rangeStartPage}
                      onChange={(e) => setRangeStartPage(Math.max(1, Math.min(604, parseInt(e.target.value, 10) || 1)))}
                      className="w-full text-center font-bold text-sm bg-stone-50 dark:bg-stone-800 border border-stone-300 dark:border-stone-600 rounded-lg py-1 text-amber-900 dark:text-amber-300"
                    />
                    <span className="text-xs text-stone-400">سورة {getSurahNameForPage(rangeStartPage)}</span>
                  </div>

                  <div className="flex items-center gap-2 bg-white dark:bg-stone-900 p-2.5 rounded-xl border border-stone-200 dark:border-stone-700">
                    <span className="text-xs font-bold text-stone-700 dark:text-stone-300 whitespace-nowrap">إلى صفحة:</span>
                    <input
                      type="number"
                      min={1}
                      max={604}
                      value={rangeEndPage}
                      onChange={(e) => setRangeEndPage(Math.max(1, Math.min(604, parseInt(e.target.value, 10) || 1)))}
                      className="w-full text-center font-bold text-sm bg-stone-50 dark:bg-stone-800 border border-stone-300 dark:border-stone-600 rounded-lg py-1 text-amber-900 dark:text-amber-300"
                    />
                    <span className="text-xs text-stone-400">سورة {getSurahNameForPage(rangeEndPage)}</span>
                  </div>
                </div>

                {/* Quick Presets */}
                <div className="flex items-center gap-1.5 flex-wrap text-xs">
                  <span className="text-stone-500 font-semibold">اختصارات سريعة:</span>
                  <button
                    onClick={() => { setRangeStartPage(1); setRangeEndPage(21); }}
                    className="px-2.5 py-1 rounded-lg bg-white dark:bg-stone-900 border border-stone-200 dark:border-stone-700 hover:border-amber-400 cursor-pointer text-stone-700 dark:text-stone-300"
                  >
                    الجزء الأول (١ - ٢١)
                  </button>
                  <button
                    onClick={() => { setRangeStartPage(582); setRangeEndPage(604); }}
                    className="px-2.5 py-1 rounded-lg bg-white dark:bg-stone-900 border border-stone-200 dark:border-stone-700 hover:border-amber-400 cursor-pointer text-stone-700 dark:text-stone-300"
                  >
                    جزء عمّ (٥٨٢ - ٦٠٤)
                  </button>
                  <button
                    onClick={() => { setRangeStartPage(293); setRangeEndPage(304); }}
                    className="px-2.5 py-1 rounded-lg bg-white dark:bg-stone-900 border border-stone-200 dark:border-stone-700 hover:border-amber-400 cursor-pointer text-stone-700 dark:text-stone-300"
                  >
                    سورة الكهف (٢٩٣ - ٣٠٤)
                  </button>
                  <button
                    onClick={() => { setRangeStartPage(562); setRangeEndPage(581); }}
                    className="px-2.5 py-1 rounded-lg bg-white dark:bg-stone-900 border border-stone-200 dark:border-stone-700 hover:border-amber-400 cursor-pointer text-stone-700 dark:text-stone-300"
                  >
                    جزء تبارك (٥٦٢ - ٥٨١)
                  </button>
                </div>

                <button
                  type="button"
                  onClick={() => handleGenerateCustomRangePdf()}
                  disabled={generatingPdf}
                  className="w-full py-2.5 px-4 rounded-xl bg-amber-800 hover:bg-amber-900 text-white font-bold text-xs shadow-md transition-all cursor-pointer flex items-center justify-center gap-2 disabled:opacity-50"
                >
                  {generatingPdf ? (
                    <Loader2 className="w-4 h-4 animate-spin text-amber-200" />
                  ) : (
                    <FileDown className="w-4 h-4 text-amber-300" />
                  )}
                  <span>
                    {generatingPdf
                      ? 'جاري رسم وتصدير الصفحات...'
                      : `توليد وتنزيل ملف PDF للنطاق المحدد (${toArabicDigits(Math.abs(rangeEndPage - rangeStartPage) + 1)} صفحة)`}
                  </span>
                </button>
              </div>

              {/* Complete Quran Text File */}
              <div className="p-3.5 rounded-2xl bg-stone-50 dark:bg-stone-850 border border-stone-200 dark:border-stone-700 flex items-center justify-between gap-3">
                <div className="flex items-center gap-2.5">
                  <FileText className="w-5 h-5 text-amber-600 shrink-0" />
                  <div>
                    <h5 className="font-amiri text-sm font-bold text-stone-900 dark:text-stone-100">
                      النص القرآني الكامل (ملف نصي للباحثين والطباعة)
                    </h5>
                    <p className="text-[11px] text-stone-500">
                      تنزيل نص القرآن الكريم كاملاً بترميز UTF-8
                    </p>
                  </div>
                </div>

                <button
                  type="button"
                  onClick={handleDownloadQuranText}
                  className="px-3.5 py-2 rounded-xl bg-stone-200 dark:bg-stone-800 hover:bg-stone-300 dark:hover:bg-stone-700 text-stone-800 dark:text-stone-200 text-xs font-bold cursor-pointer transition-colors flex items-center gap-1.5 shrink-0"
                >
                  <Download className="w-3.5 h-3.5" />
                  <span>تنزيل الملف النصي</span>
                </button>
              </div>
            </div>
          )}

          {/* TAB 5: FRAMED MUSHAF PAGE */}
          {activeTab === 'page' && (
            <div className="space-y-4">
              <div className="p-3.5 rounded-2xl bg-stone-50 dark:bg-stone-850 border border-stone-200 dark:border-stone-700 space-y-3">
                <div className="flex flex-wrap items-center justify-between gap-3">
                  {/* Page Stepper */}
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-bold text-stone-700 dark:text-stone-300">رقم الصفحة:</span>
                    <div className="flex items-center gap-1">
                      <button
                        onClick={() => setCurrentPageNum(Math.max(1, currentPageNum - 1))}
                        disabled={currentPageNum <= 1}
                        className="p-1.5 rounded-lg border border-stone-200 dark:border-stone-700 hover:bg-stone-200 dark:hover:bg-stone-700 disabled:opacity-40 cursor-pointer"
                        title="الصفحة السابقة"
                      >
                        <ChevronRight className="w-4 h-4" />
                      </button>
                      <input
                        type="number"
                        min={1}
                        max={604}
                        value={currentPageNum}
                        onChange={(e) => setCurrentPageNum(Math.max(1, Math.min(604, parseInt(e.target.value, 10) || 1)))}
                        className="w-16 text-center font-bold text-sm bg-white dark:bg-stone-900 border border-stone-300 dark:border-stone-600 rounded-lg py-1 text-amber-900 dark:text-amber-300"
                      />
                      <button
                        onClick={() => setCurrentPageNum(Math.min(604, currentPageNum + 1))}
                        disabled={currentPageNum >= 604}
                        className="p-1.5 rounded-lg border border-stone-200 dark:border-stone-700 hover:bg-stone-200 dark:hover:bg-stone-700 disabled:opacity-40 cursor-pointer"
                        title="الصفحة التالية"
                      >
                        <ChevronLeft className="w-4 h-4" />
                      </button>
                    </div>
                    <span className="text-xs text-stone-500 font-amiri">
                      (سورة {getSurahNameForPage(currentPageNum)})
                    </span>
                  </div>

                  {/* Frame Theme */}
                  <div className="flex items-center gap-1.5">
                    <span className="text-xs font-bold text-stone-600 dark:text-stone-300">لون الإطار:</span>
                    <div className="flex items-center gap-1">
                      {PAGE_FRAME_THEMES.map((theme) => (
                        <button
                          key={theme.id}
                          onClick={() => setPageFrameTheme(theme.id)}
                          className={`px-2 py-1 rounded-lg text-xs font-medium border transition-all cursor-pointer ${
                            pageFrameTheme === theme.id
                              ? 'border-amber-600 ring-2 ring-amber-500/30 font-bold bg-amber-50 dark:bg-stone-800'
                              : 'border-stone-200 dark:border-stone-700 hover:border-stone-400'
                          }`}
                        >
                          {theme.name}
                        </button>
                      ))}
                    </div>
                  </div>
                </div>
              </div>

              {/* Page Preview Container */}
              <div
                ref={mushafPageContainerRef}
                className="relative rounded-2xl overflow-hidden shadow-xl border border-stone-200 dark:border-stone-700 flex justify-center bg-stone-950 p-3 sm:p-5"
              >
                <img
                  src={`https://files.quran.app/hafs/madani/width_1260/page${String(currentPageNum).padStart(3, '0')}.png`}
                  alt={`صفحة ${currentPageNum}`}
                  className="max-h-[380px] w-auto object-contain rounded-lg shadow-md"
                  loading="lazy"
                />
              </div>

              {/* Action Toolbar for Page */}
              <div className="flex flex-wrap items-center justify-between gap-2 pt-2 border-t border-stone-100 dark:border-stone-800">
                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={handleCopyMushafPageImage}
                    disabled={generatingFramedImage}
                    className="flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-semibold text-stone-600 dark:text-stone-300 bg-stone-100 dark:bg-stone-800 hover:bg-stone-200 dark:hover:bg-stone-750 transition-colors cursor-pointer disabled:opacity-50"
                  >
                    <ImageIcon className="w-4 h-4" />
                    <span>نسخ الصورة للحافظة</span>
                  </button>

                  <button
                    type="button"
                    onClick={handleDownloadMushafPagePdf}
                    disabled={generatingPdf}
                    className="flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-semibold text-stone-600 dark:text-stone-300 bg-stone-100 dark:bg-stone-800 hover:bg-stone-200 dark:hover:bg-stone-750 transition-colors cursor-pointer disabled:opacity-50"
                  >
                    <FileDown className="w-4 h-4 text-amber-600" />
                    <span>تنزيل الصفحة (PDF مذهب)</span>
                  </button>
                </div>

                <button
                  type="button"
                  onClick={handleDownloadMushafPageWithFrame}
                  disabled={generatingFramedImage}
                  className="flex items-center gap-1.5 px-5 py-2.5 rounded-xl text-xs font-bold text-white bg-amber-800 hover:bg-amber-900 shadow-md transition-all cursor-pointer active:scale-95 disabled:opacity-50"
                >
                  {generatingFramedImage ? (
                    <Loader2 className="w-4 h-4 animate-spin text-amber-200" />
                  ) : (
                    <Download className="w-4 h-4 text-amber-300" />
                  )}
                  <span>تحميل الصفحة المؤطرة (PNG HD)</span>
                </button>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Hidden Offscreen Container for Generating All Surah Pages into jsPDF */}
      {surahDetail && (
        <div
          ref={surahPagesContainerRef}
          style={{
            position: 'fixed',
            top: '-99999px',
            left: '-99999px',
            width: '800px',
            height: '0px',
            overflow: 'hidden',
            pointerEvents: 'none',
            visibility: 'hidden',
          }}
        >
          {paginatedSurahPages.map((pageAyahs, pIndex) => (
            <div
              key={pIndex}
              className="surah-pdf-page mb-8"
              style={{
                width: '794px',
                minHeight: '1123px',
                padding: '40px',
                boxSizing: 'border-box',
                backgroundColor: '#FAF8F3',
                color: '#1C1917',
                fontFamily: '"Amiri", "Traditional Arabic", serif',
                direction: 'rtl',
                position: 'relative',
              }}
            >
              {/* Surah Header on First Page */}
              {pIndex === 0 && (
                <div
                  style={{
                    textAlign: 'center',
                    border: '3px double #B45309',
                    borderRadius: '16px',
                    padding: '16px',
                    marginBottom: '28px',
                    backgroundColor: '#F5EFE1',
                  }}
                >
                  <h1 style={{ fontSize: '32px', margin: '0 0 6px 0', color: '#78350F' }}>
                    سُورَةُ {surahDetail.name}
                  </h1>
                  <p style={{ fontSize: '15px', color: '#92400E', margin: '0 0 12px 0' }}>
                    {surahDetail.revelationArabic} · {toArabicDigits(surahDetail.numberOfAyahs)} آية
                  </p>
                  {surahDetail.number !== 1 && surahDetail.number !== 9 && (
                    <p style={{ fontSize: '22px', color: '#78350F', margin: 0 }}>
                      بِسْمِ اللَّهِ الرَّحْمَٰنِ الرَّحِيمِ
                    </p>
                  )}
                </div>
              )}

              {/* Ayahs text container */}
              <div
                style={{
                  fontSize: '22px',
                  lineHeight: '2.4',
                  textAlign: 'justify',
                  direction: 'rtl',
                }}
              >
                {pageAyahs.map((ayah) => (
                  <span key={ayah.number} style={{ display: 'inline' }}>
                    {cleanAyahText(ayah.text, surahDetail.number, ayah.numberInSurah)}
                    <span
                      style={{
                        display: 'inline-block',
                        margin: '0 6px',
                        color: '#B45309',
                        fontSize: '18px',
                        fontWeight: 'bold',
                      }}
                    >
                      ﴿{toArabicDigits(ayah.numberInSurah)}﴾
                    </span>
                  </span>
                ))}
              </div>

              {/* Page Footer */}
              <div
                style={{
                  position: 'absolute',
                  bottom: '30px',
                  left: '40px',
                  right: '40px',
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                  borderTop: '1px solid #D4AF37',
                  paddingTop: '10px',
                  fontSize: '13px',
                  color: '#92400E',
                }}
              >
                <span>سورة {surahDetail.name}</span>
                <span>
                  صفحة {toArabicDigits(pIndex + 1)} من {toArabicDigits(totalSurahPages)}
                </span>
                <span>اللهم اجعل القرآن ربيع قلوبنا ونور صدورنا</span>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};
