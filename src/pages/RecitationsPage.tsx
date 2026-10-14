import React, { useState, useMemo, useEffect } from 'react';
import {
  Play,
  Pause,
  Headphones,
  Search,
  Radio,
  Sparkles,
  Volume2,
  CheckCircle2,
  ListMusic,
  Share2,
  Heart,
  Check,
  BookOpen,
  Compass,
  Layers,
  Award,
  Globe2,
  Flame,
  X,
  Music,
  UserCheck,
  Tv,
  Film,
  Clock,
  ExternalLink,
  ChevronLeft
} from 'lucide-react';
import { ALL_SURAHS } from '../data/quranMeta';
import { EXPANDED_RECITERS, RIWAYAT, getSurahAudioUrl } from '../data/reciters';
import { useAudio } from '../context/AudioContext';
import { Reciter } from '../types';
import { recordDedication } from '../services/dedicationService';
import { RiwayahDropdownSelector } from '../components/RiwayahDropdownSelector';
import { ReciterDropdownSelector } from '../components/ReciterDropdownSelector';
import { PlaylistsSection } from '../components/PlaylistsSection';
import { ReciterSelectModal } from '../components/ReciterSelectModal';
import { RadioStationsSection } from '../components/RadioStationsSection';
import { AudioTafsirSection } from '../components/AudioTafsirSection';
import { TadaborVideosSection } from '../components/TadaborVideosSection';
import { LiveTVModal } from '../components/LiveTVModal';
import { AyahTimingExplorerModal } from '../components/AyahTimingExplorerModal';
import { mp3QuranService } from '../services/mp3QuranService';
import { MP3QRecentRead } from '../types/mp3quran';
import { customPlaylistsService } from '../services/customPlaylistsService';
import { audioDownloadService } from '../services/audioDownloadService';
import { AudioDownloadManagerModal } from '../components/AudioDownloadManagerModal';
import { AddToPlaylistModal } from '../components/AddToPlaylistModal';
import { Download, ListPlus, History } from 'lucide-react';

export type MediaHubTab =
  | 'surahs'
  | 'radios'
  | 'livetv'
  | 'tafasir'
  | 'tadabor'
  | 'playlists';

export const RecitationsPage: React.FC = () => {
  const {
    isPlaying,
    currentSurah,
    currentReciter,
    playSurah,
    togglePlay,
    setReciter,
    lastListeningSession,
    resumeLastSession,
  } = useAudio();

  // Active Hub Tab
  const [activeMediaTab, setActiveMediaTab] = useState<MediaHubTab>('surahs');
  const [showReciterModal, setShowReciterModal] = useState(false);
  const [showLiveTVModal, setShowLiveTVModal] = useState(false);
  const [showTimingModal, setShowTimingModal] = useState(false);
  const [showDownloadModal, setShowDownloadModal] = useState(false);
  const [downloadModalSurah, setDownloadModalSurah] = useState<number | undefined>(undefined);
  const [showPlaylistModal, setShowPlaylistModal] = useState(false);
  const [playlistModalSurah, setPlaylistModalSurah] = useState<number | undefined>(undefined);

  const [selectedRiwayah, setSelectedRiwayah] = useState<string>('all');
  const [reciterSearch, setReciterSearch] = useState<string>('');
  const [selectedReciter, setSelectedReciter] = useState<(Reciter & { riwayah: string; riwayahId: string })>(
    EXPANDED_RECITERS.find((r) => r.id === currentReciter?.id) || EXPANDED_RECITERS[0]
  );
  const [surahSearch, setSurahSearch] = useState('');
  const [surahFilterType, setSurahFilterType] = useState<'all' | 'favorites' | 'meccan' | 'medinan'>('all');
  const [toastMsg, setToastMsg] = useState<string | null>(null);
  const [showReciterGrid, setShowReciterGrid] = useState<boolean>(false);
  const [playlistUpdateTick, setPlaylistUpdateTick] = useState<number>(0);

  // Subscribe to playlist updates to keep favorites in sync
  useEffect(() => {
    const unsub = customPlaylistsService.subscribe(() => {
      setPlaylistUpdateTick((t) => t + 1);
    });
    return () => unsub();
  }, []);

  // Recent reads from MP3Quran API
  const [recentReads, setRecentReads] = useState<MP3QRecentRead[]>([]);
  const [showRecentReads, setShowRecentReads] = useState<boolean>(false);

  useEffect(() => {
    mp3QuranService.getRecentReads('ar')
      .then((reads) => setRecentReads(reads.slice(0, 8)))
      .catch(() => {});
  }, []);

  const showToast = (msg: string) => {
    setToastMsg(msg);
    setTimeout(() => setToastMsg(null), 2500);
  };

  // Sync selectedReciter if currentReciter changed globally
  useEffect(() => {
    if (currentReciter) {
      const match = EXPANDED_RECITERS.find((r) => r.id === currentReciter.id);
      if (match) {
        setSelectedReciter(match);
      }
    }
  }, [currentReciter]);

  // Filter Reciters by Riwayah and Search
  const filteredReciters = useMemo(() => {
    return EXPANDED_RECITERS.filter((r) => {
      const matchRiwayah = selectedRiwayah === 'all' || r.riwayahId === selectedRiwayah;
      const q = reciterSearch.trim().toLowerCase();
      const matchSearch =
        !q ||
        r.name.toLowerCase().includes(q) ||
        r.subName?.toLowerCase().includes(q) ||
        r.riwayah.includes(q);
      return matchRiwayah && matchSearch;
    });
  }, [selectedRiwayah, reciterSearch]);

  // Filter Surahs by search and type
  const filteredSurahs = useMemo(() => {
    let list = ALL_SURAHS;
    if (surahFilterType === 'favorites') {
      list = list.filter((s) => customPlaylistsService.isFavoriteSurah(s.number));
    } else if (surahFilterType === 'meccan') {
      list = list.filter((s) => s.revelationType === 'Meccan');
    } else if (surahFilterType === 'medinan') {
      list = list.filter((s) => s.revelationType === 'Medinan');
    }

    if (!surahSearch.trim()) return list;
    const q = surahSearch.trim().toLowerCase();
    return list.filter(
      (s) =>
        s.name.includes(q) ||
        s.englishName.toLowerCase().includes(q) ||
        String(s.number) === q
    );
  }, [surahSearch, surahFilterType, playlistUpdateTick]);

  const handleSelectReciter = (r: (typeof EXPANDED_RECITERS)[0]) => {
    setSelectedReciter(r);
    setReciter(r);
    showToast(`تم تعيين القارئ: ${r.name}`);
  };

  const handlePlaySurah = (surahNumber: number) => {
    playSurah(surahNumber, selectedReciter);
  };

  const handleShareAudio = (surahNumber: number, surahName: string) => {
    const audioUrl = getSurahAudioUrl(selectedReciter, surahNumber);
    const text = `تلاوة سورة ${surahName} بصوت ${selectedReciter.name} (${selectedReciter.riwayah}):\n${audioUrl}\n\n- صدقة جارية عن أرواح المغفور لهم بإذن الله`;
    if (navigator.share) {
      navigator.share({
        title: `سورة ${surahName} - ${selectedReciter.name}`,
        text,
        url: audioUrl,
      }).catch(() => {});
    } else {
      navigator.clipboard.writeText(text);
      showToast('تم نسخ رابط التلاوة للمشاركة');
    }
  };

  const handleDedicateListening = (surahName: string) => {
    recordDedication(
      'surah',
      `استماع لتلاوة سورة ${surahName} بصوت ${selectedReciter.name}`,
      'all',
      1,
      'زائر كريم'
    );
    showToast(`تقبل الله استماعكم وأهدى ثوابه لأرواحهم الطاهرة`);
  };

  const tabs: { key: MediaHubTab; label: string; icon: React.ElementType; badge?: string }[] = [
    { key: 'surahs', label: 'المصاحف والسور', icon: BookOpen, badge: '١١٤ سورة' },
    { key: 'radios', label: 'إذاعات القرآن', icon: Radio, badge: '١٧٠+ إذاعة' },
    { key: 'livetv', label: 'بث الحرمين الشريفين', icon: Tv, badge: 'مباشر' },
    { key: 'tafasir', label: 'التفاسير الصوتية', icon: BookOpen, badge: 'الطبري' },
    { key: 'tadabor', label: 'التدبر والفيديوهات', icon: Film },
    { key: 'playlists', label: 'قوائم التشغيل', icon: ListMusic },
  ];

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8 text-right select-none">
      
      {/* Toast Alert */}
      {toastMsg && (
        <div className="fixed top-20 left-1/2 -translate-x-1/2 z-50 px-4 py-2.5 rounded-xl bg-stone-900/95 text-amber-200 text-xs font-semibold shadow-2xl backdrop-blur-md border border-amber-500/30 animate-in fade-in zoom-in-95 duration-200">
          {toastMsg}
        </div>
      )}

      {/* Page Header */}
      <div className="text-center max-w-3xl mx-auto space-y-3">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-amber-500/10 dark:bg-stone-800 border border-amber-500/20 text-amber-900 dark:text-amber-300 text-xs font-semibold">
          <Headphones className="w-3.5 h-3.5 text-amber-600 dark:text-amber-400" />
          <span>المكتبة الصوتية والوسائط القرآنية المتكاملة (MP3Quran API)</span>
        </div>
        <h1 className="font-amiri text-3xl sm:text-5xl font-bold text-stone-900 dark:text-stone-100">
          التلاوات القرآنية والوسائط المباركة
        </h1>
        <p className="font-amiri text-base sm:text-lg text-stone-600 dark:text-stone-300 leading-relaxed">
          استمع لكتاب الله بأصوات كبار قراء العالم الإسلامي بمختلف الروايات، وتصفح الإذاعات المباشرة، وبث الحرمين، والتفاسير الصوتية، ومقاطع التدبر.
        </p>
      </div>

      {/* Multi-Tab Switcher Bar */}
      <div className="flex items-center justify-start sm:justify-center gap-2 overflow-x-auto pb-2 scrollbar-none max-w-4xl mx-auto">
        {tabs.map((t) => {
          const Icon = t.icon;
          const isSelected = activeMediaTab === t.key;
          return (
            <button
              key={t.key}
              type="button"
              onClick={() => setActiveMediaTab(t.key)}
              className={`flex items-center gap-2 py-2.5 px-3.5 sm:px-4 rounded-2xl text-xs sm:text-sm font-bold transition-all cursor-pointer shrink-0 active:scale-95 ${
                isSelected
                  ? 'bg-amber-800 text-white shadow-xs'
                  : 'bg-stone-100 dark:bg-stone-850 hover:bg-stone-200 dark:hover:bg-stone-800 text-stone-700 dark:text-stone-300 border border-stone-200/80 dark:border-stone-800'
              }`}
            >
              <Icon className="w-4 h-4 shrink-0" />
              <span>{t.label}</span>
              {t.badge && (
                <span className={`text-[10px] px-1.5 py-0.2 rounded-md font-medium ${
                  isSelected ? 'bg-amber-700 text-amber-200' : 'bg-stone-200 dark:bg-stone-750 text-stone-600 dark:text-stone-300'
                }`}>
                  {t.badge}
                </span>
              )}
            </button>
          );
        })}
      </div>

      {/* TAB 1: SURAHS DIRECTORY & RECITERS SELECTORS */}
      {activeMediaTab === 'surahs' && (
        <div className="space-y-8 animate-in fade-in duration-200">
          
          {/* SMART LISTENING RESUMPTION BANNER */}
          {lastListeningSession && (
            <div className="p-4 sm:p-5 rounded-3xl bg-gradient-to-r from-amber-950/80 via-stone-900 to-amber-950/70 border border-amber-500/50 shadow-xl flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
              <div className="flex items-center gap-3">
                <div className="w-11 h-11 rounded-2xl bg-amber-500/20 border border-amber-500/40 text-amber-400 flex items-center justify-center shrink-0">
                  <History className="w-5 h-5" />
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <span className="text-[10px] px-2 py-0.5 rounded-full bg-amber-500/20 text-amber-300 font-bold border border-amber-500/30">
                      إكمال الاستماع من آخر موضع
                    </span>
                  </div>
                  <h3 className="font-amiri text-lg sm:text-xl font-bold text-white mt-0.5">
                    سورة {lastListeningSession.surahName} · بصوت {lastListeningSession.reciterName}
                  </h3>
                  <p className="text-xs text-stone-400 font-mono">
                    آخر موضع: {Math.floor(lastListeningSession.currentTime / 60)}:{String(Math.floor(lastListeningSession.currentTime % 60)).padStart(2, '0')} دقيقة
                  </p>
                </div>
              </div>

              <button
                type="button"
                onClick={resumeLastSession}
                className="px-5 py-2.5 rounded-2xl bg-amber-500 hover:bg-amber-400 text-stone-950 font-bold text-xs sm:text-sm transition-all cursor-pointer flex items-center gap-2 shadow-lg shadow-amber-500/25 active:scale-95 shrink-0"
              >
                <Play className="w-4 h-4 fill-stone-950" />
                <span>متابعة الاستماع الآن</span>
              </button>
            </div>
          )}

          {/* Centralized Dropdown Selectors */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3 sm:gap-4 max-w-4xl mx-auto w-full">
            <RiwayahDropdownSelector
              selectedRiwayah={selectedRiwayah}
              onSelectRiwayah={(id) => setSelectedRiwayah(id)}
            />

            <ReciterDropdownSelector
              selectedReciter={selectedReciter}
              onSelectReciter={handleSelectReciter}
              selectedRiwayah={selectedRiwayah}
              isPlaying={isPlaying}
              activePlayingReciterId={currentReciter.id}
            />
          </div>

          {/* Quick Action Pills: Timing Explorer & Recent Reads */}
          <div className="flex flex-wrap items-center justify-between gap-3 p-4 rounded-2xl bg-amber-50/70 dark:bg-stone-900 border border-amber-500/20 shadow-2xs">
            <div className="flex items-center gap-2 flex-wrap">
              <span className="text-xs font-semibold text-stone-700 dark:text-stone-300">
                خدمات متقدمة للتلاوة:
              </span>

              <button
                type="button"
                onClick={() => setShowTimingModal(true)}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-white dark:bg-stone-800 border border-stone-200 dark:border-stone-700 hover:border-amber-500 text-amber-900 dark:text-amber-300 text-xs font-semibold shadow-2xs transition active:scale-95 cursor-pointer"
              >
                <Clock className="w-3.5 h-3.5 text-amber-600 dark:text-amber-400" />
                <span>تزامن وتوقيت الآيات (Ayat Timing)</span>
              </button>

              <button
                type="button"
                onClick={() => setShowLiveTVModal(true)}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-white dark:bg-stone-800 border border-stone-200 dark:border-stone-700 hover:border-amber-500 text-stone-800 dark:text-stone-200 text-xs font-semibold shadow-2xs transition active:scale-95 cursor-pointer"
              >
                <Tv className="w-3.5 h-3.5 text-amber-600" />
                <span>بث مباشر للحرمين الشريفين</span>
              </button>
            </div>

            <button
              type="button"
              onClick={() => setShowRecentReads(!showRecentReads)}
              className="text-xs text-amber-800 dark:text-amber-400 hover:underline font-semibold cursor-pointer"
            >
              {showRecentReads ? 'إخفاء أحدث التسجيلات' : `أحدث التسجيلات المضافة (${recentReads.length})`}
            </button>
          </div>

          {/* Recent Reads Box */}
          {showRecentReads && recentReads.length > 0 && (
            <div className="p-4 sm:p-5 rounded-2xl bg-stone-50 dark:bg-stone-850/80 border border-stone-200 dark:border-stone-800 space-y-3 animate-in fade-in duration-150">
              <div className="flex items-center gap-2 text-xs font-bold text-stone-800 dark:text-stone-200">
                <Sparkles className="w-4 h-4 text-amber-600" />
                <span>أحدث التلاوات المرفوعة حديثاً في خوادم MP3Quran:</span>
              </div>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
                {recentReads.map((read) => (
                  <div
                    key={read.id}
                    className="p-3 rounded-xl bg-white dark:bg-stone-800 border border-stone-200 dark:border-stone-750 text-xs space-y-1"
                  >
                    <span className="font-bold text-stone-900 dark:text-stone-100 block truncate">
                      {read.name}
                    </span>
                    <span className="text-[10px] text-stone-400 block truncate">
                      {read.moshaf?.[0]?.name || 'مصحف كامل'}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Reciters Directory Section */}
          <div className="space-y-4">
            <div className="flex flex-wrap items-center justify-between gap-3 p-4 rounded-2xl bg-white dark:bg-stone-900 border border-stone-200 dark:border-stone-800 shadow-xs">
              <div className="flex items-center gap-3">
                <Radio className="w-4 h-4 text-amber-800 dark:text-amber-400" />
                <span className="font-bold text-stone-800 dark:text-stone-200 text-sm">
                  أصوات القراء المتاحين ({filteredReciters.length})
                </span>

                <button
                  type="button"
                  onClick={() => setShowReciterGrid(!showReciterGrid)}
                  className="text-xs font-semibold px-2.5 py-1 rounded-lg border border-amber-300 dark:border-stone-700 bg-amber-50/80 dark:bg-stone-800 text-amber-900 dark:text-amber-300 hover:bg-amber-100 dark:hover:bg-stone-750 transition-colors cursor-pointer"
                >
                  {showReciterGrid ? 'إخفاء شبكة البطاقات' : 'عرض شبكة البطاقات'}
                </button>
              </div>

              <div className="w-full sm:w-72">
                <div className="relative">
                  <Search className="w-4 h-4 absolute right-3.5 top-1/2 -translate-y-1/2 text-stone-400" />
                  <input
                    type="text"
                    value={reciterSearch}
                    onChange={(e) => setReciterSearch(e.target.value)}
                    placeholder="ابحث عن اسم القارئ..."
                    className="w-full pr-10 pl-8 py-2 text-xs bg-stone-50 dark:bg-stone-850 border border-stone-200 dark:border-stone-750 rounded-xl focus:outline-hidden focus:border-amber-700 text-stone-900 dark:text-stone-100 placeholder:text-stone-400 transition-colors"
                  />
                  {reciterSearch && (
                    <button
                      type="button"
                      onClick={() => setReciterSearch('')}
                      className="absolute left-2.5 top-1/2 -translate-y-1/2 text-stone-400 hover:text-stone-600 dark:hover:text-stone-200 p-0.5 cursor-pointer"
                    >
                      <X className="w-3.5 h-3.5" />
                    </button>
                  )}
                </div>
              </div>
            </div>

            {/* Reciters Cards Grid */}
            {showReciterGrid && (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-3 animate-in fade-in duration-200">
                {filteredReciters.length === 0 ? (
                  <div className="col-span-full py-12 text-center text-stone-500 dark:text-stone-400 text-sm bg-white dark:bg-stone-900 rounded-2xl border border-stone-200 dark:border-stone-800">
                    لم نعثر على قارئ مطابق لبحثك في هذه الرواية.
                  </div>
                ) : (
                  filteredReciters.map((reciter) => {
                    const isSelected = selectedReciter.id === reciter.id;
                    const isNowPlayingThisReciter = isPlaying && currentReciter.id === reciter.id;

                    return (
                      <div
                        key={reciter.id}
                        onClick={() => handleSelectReciter(reciter)}
                        className={`p-4 rounded-2xl border transition-all cursor-pointer flex flex-col justify-between group ${
                          isSelected
                            ? 'bg-amber-900/10 dark:bg-amber-950/40 border-amber-600 ring-2 ring-amber-500 shadow-md'
                            : 'bg-white dark:bg-stone-900 border-stone-200 dark:border-stone-800 hover:border-amber-400 dark:hover:border-stone-700 hover:shadow-xs'
                        }`}
                      >
                        <div>
                          <div className="flex items-start justify-between gap-2 mb-2">
                            <span className="text-[10px] font-semibold text-amber-800 dark:text-amber-400 bg-amber-50 dark:bg-stone-800 px-2 py-0.5 rounded-md border border-amber-200 dark:border-stone-700">
                              {reciter.riwayah}
                            </span>
                            {isNowPlayingThisReciter ? (
                              <div className="flex items-end gap-0.5 h-3 px-1.5 py-0.5 rounded-full bg-amber-600 text-white">
                                <span className="w-0.5 bg-white rounded-full animate-bounce [animation-delay:-0.3s] h-2.5" />
                                <span className="w-0.5 bg-white rounded-full animate-bounce [animation-delay:-0.15s] h-3" />
                                <span className="w-0.5 bg-white rounded-full animate-bounce [animation-delay:-0.45s] h-2" />
                              </div>
                            ) : isSelected ? (
                              <span className="text-[10px] font-bold text-amber-800 dark:text-amber-300 bg-amber-100 dark:bg-stone-800 px-2 py-0.5 rounded-full flex items-center gap-1">
                                <Check className="w-3 h-3 text-amber-700 dark:text-amber-400" />
                                <span>المحدد</span>
                              </span>
                            ) : null}
                          </div>

                          <h3 className="font-amiri text-lg font-bold text-stone-900 dark:text-stone-100 group-hover:text-amber-900 dark:group-hover:text-amber-300 transition-colors">
                            {reciter.name}
                          </h3>
                          <p className="text-xs text-stone-500 dark:text-stone-400 mt-0.5">
                            {reciter.style || reciter.subName}
                          </p>
                        </div>

                        <div className="pt-3 mt-3 border-t border-stone-100 dark:border-stone-800 flex items-center justify-between text-xs text-stone-500 dark:text-stone-400">
                          <span className="flex items-center gap-1 text-amber-800 dark:text-amber-400 font-semibold text-[11px]">
                            <Play className="w-3 h-3 fill-current" />
                            <span>اختيار القارئ</span>
                          </span>
                          <span className="text-[11px] text-stone-400 dark:text-stone-500 font-mono">
                            ١١٤ سورة
                          </span>
                        </div>
                      </div>
                    );
                  })
                )}
              </div>
            )}
          </div>

          {/* Surahs Audio Directory */}
          <div className="space-y-4">
            <div className="flex flex-col md:flex-row items-stretch md:items-center justify-between gap-3 p-4 rounded-2xl bg-white dark:bg-stone-900 border border-stone-200 dark:border-stone-800 shadow-xs">
              <div className="flex items-center gap-2 text-xs font-semibold text-stone-800 dark:text-stone-200">
                <ListMusic className="w-4 h-4 text-amber-700 dark:text-amber-400" />
                <span>سور القرآن الكريم كاملة بصوت {selectedReciter.name} ({selectedReciter.riwayah})</span>
              </div>

              {/* Filter Pills and Search */}
              <div className="flex flex-wrap items-center gap-2">
                <div className="flex items-center gap-1 bg-stone-100 dark:bg-stone-850 p-1 rounded-xl border border-stone-200 dark:border-stone-800 text-[11px] font-semibold">
                  <button
                    type="button"
                    onClick={() => setSurahFilterType('all')}
                    className={`px-2.5 py-1 rounded-lg transition-colors cursor-pointer ${
                      surahFilterType === 'all'
                        ? 'bg-amber-800 text-white font-bold'
                        : 'text-stone-600 dark:text-stone-300 hover:text-stone-900 dark:hover:text-white'
                    }`}
                  >
                    كل السور (١١٤)
                  </button>
                  <button
                    type="button"
                    onClick={() => setSurahFilterType('favorites')}
                    className={`px-2.5 py-1 rounded-lg transition-colors cursor-pointer flex items-center gap-1 ${
                      surahFilterType === 'favorites'
                        ? 'bg-amber-800 text-white font-bold'
                        : 'text-stone-600 dark:text-stone-300 hover:text-stone-900 dark:hover:text-white'
                    }`}
                  >
                    <Heart className="w-3 h-3 text-rose-400 fill-rose-400" />
                    <span>المفضلة</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => setSurahFilterType('meccan')}
                    className={`px-2.5 py-1 rounded-lg transition-colors cursor-pointer ${
                      surahFilterType === 'meccan'
                        ? 'bg-amber-800 text-white font-bold'
                        : 'text-stone-600 dark:text-stone-300 hover:text-stone-900 dark:hover:text-white'
                    }`}
                  >
                    مكية
                  </button>
                  <button
                    type="button"
                    onClick={() => setSurahFilterType('medinan')}
                    className={`px-2.5 py-1 rounded-lg transition-colors cursor-pointer ${
                      surahFilterType === 'medinan'
                        ? 'bg-amber-800 text-white font-bold'
                        : 'text-stone-600 dark:text-stone-300 hover:text-stone-900 dark:hover:text-white'
                    }`}
                  >
                    مدنية
                  </button>
                </div>

                <div className="w-full sm:w-56">
                  <div className="relative">
                    <Search className="w-4 h-4 absolute right-3 top-1/2 -translate-y-1/2 text-stone-400" />
                    <input
                      type="text"
                      value={surahSearch}
                      onChange={(e) => setSurahSearch(e.target.value)}
                      placeholder="ابحث في السور..."
                      className="w-full pr-9 pl-3 py-1.5 text-xs bg-stone-50 dark:bg-stone-850 border border-stone-200 dark:border-stone-750 rounded-xl focus:outline-hidden focus:border-amber-700 text-stone-900 dark:text-stone-100 placeholder:text-stone-400"
                    />
                    {surahSearch && (
                      <button
                        type="button"
                        onClick={() => setSurahSearch('')}
                        className="absolute left-2.5 top-1/2 -translate-y-1/2 text-stone-400 hover:text-stone-600 dark:hover:text-stone-200 p-0.5 cursor-pointer"
                      >
                        <X className="w-3.5 h-3.5" />
                      </button>
                    )}
                  </div>
                </div>
              </div>
            </div>

            {/* Surahs Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
              {filteredSurahs.length === 0 ? (
                <div className="col-span-full py-12 text-center text-stone-500 dark:text-stone-400 text-sm bg-white dark:bg-stone-900 rounded-2xl border border-stone-200 dark:border-stone-800">
                  {surahFilterType === 'favorites'
                    ? 'لم تقم بإضافة سور إلى المفضلة بعد. انقر على أيقونة القلب على أي سورة لإضافتها.'
                    : `لم نجد أي سورة مطابقة لبحثك «${surahSearch}».`}
                </div>
              ) : (
                filteredSurahs.map((surah) => {
                  const isThisSurahActive =
                    currentSurah?.number === surah.number && currentReciter.id === selectedReciter.id;
                  const isPlayingThis = isThisSurahActive && isPlaying;
                  const isFav = customPlaylistsService.isFavoriteSurah(surah.number);
                  const isDownloaded = audioDownloadService.isSurahDownloaded(surah.number, selectedReciter.id);

                  return (
                    <div
                      key={surah.number}
                      className={`p-3.5 sm:p-4 rounded-2xl border transition-all flex items-center justify-between gap-3 ${
                        isThisSurahActive
                          ? 'border-amber-700 dark:border-amber-500 bg-amber-50/80 dark:bg-amber-950/30 shadow-xs ring-1 ring-amber-400'
                          : 'border-stone-200 dark:border-stone-800 bg-white dark:bg-stone-900 hover:border-amber-300 dark:hover:border-stone-700'
                      }`}
                    >
                      <div className="flex items-center gap-3 min-w-0">
                        <span className="w-9 h-9 rounded-xl bg-stone-100 dark:bg-stone-800 text-stone-700 dark:text-stone-300 font-mono text-xs flex items-center justify-center font-bold shrink-0">
                          {surah.number}
                        </span>
                        <div className="min-w-0">
                          <div className="flex items-center gap-1.5">
                            <span className="font-amiri text-lg font-bold text-stone-900 dark:text-stone-100 truncate">
                              سورة {surah.name}
                            </span>
                            {isDownloaded && (
                              <span className="text-[9px] px-1.5 py-0.2 rounded-md bg-emerald-500/15 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20 font-bold shrink-0">
                                محفوظة أوفلاين
                              </span>
                            )}
                          </div>
                          <div className="text-[11px] text-stone-500 dark:text-stone-400">
                            {surah.revelationArabic} · {surah.numberOfAyahs} آية · ص {surah.startPage}
                          </div>
                        </div>
                      </div>

                      <div className="flex items-center gap-1 shrink-0">
                        {/* Play button */}
                        <button
                          type="button"
                          onClick={() => {
                            if (isThisSurahActive) {
                              togglePlay();
                            } else {
                              handlePlaySurah(surah.number);
                            }
                          }}
                          className={`w-8 h-8 sm:w-9 sm:h-9 rounded-xl flex items-center justify-center transition-all cursor-pointer ${
                            isPlayingThis
                              ? 'bg-amber-800 text-white shadow-xs'
                              : 'bg-stone-100 dark:bg-stone-800 hover:bg-amber-100 dark:hover:bg-stone-700 text-stone-700 dark:text-stone-300 hover:text-amber-900 dark:hover:text-amber-200'
                          }`}
                          title={isPlayingThis ? 'إيقاف مؤقت' : 'تشغيل التلاوة'}
                        >
                          {isPlayingThis ? <Pause className="w-4 h-4" /> : <Play className="w-4 h-4 ml-0.5" />}
                        </button>

                        {/* Favorite button */}
                        <button
                          type="button"
                          onClick={() => {
                            const nowFav = customPlaylistsService.toggleFavoriteSurah(surah.number);
                            showToast(nowFav ? `تمت إضافة سورة ${surah.name} إلى المفضلة ❤️` : `تمت إزالة سورة ${surah.name} من المفضلة`);
                          }}
                          className={`p-1.5 sm:p-2 rounded-xl transition-colors cursor-pointer ${
                            isFav
                              ? 'text-rose-500 hover:text-rose-600 bg-rose-50 dark:bg-stone-800'
                              : 'text-stone-400 hover:text-rose-500 hover:bg-stone-100 dark:hover:bg-stone-800'
                          }`}
                          title={isFav ? 'إزالة من المفضلة' : 'إضافة إلى المفضلة'}
                        >
                          <Heart className={`w-3.5 h-3.5 ${isFav ? 'fill-current' : ''}`} />
                        </button>

                        {/* Add to Playlist button */}
                        <button
                          type="button"
                          onClick={() => {
                            setPlaylistModalSurah(surah.number);
                            setShowPlaylistModal(true);
                          }}
                          className="p-1.5 sm:p-2 rounded-xl text-stone-400 dark:text-stone-500 hover:text-amber-700 dark:hover:text-amber-400 hover:bg-amber-50 dark:hover:bg-stone-800 transition-colors cursor-pointer"
                          title="إضافة إلى قائمة تلاوات"
                        >
                          <ListPlus className="w-3.5 h-3.5" />
                        </button>

                        {/* Download MP3 button */}
                        <button
                          type="button"
                          onClick={() => {
                            setDownloadModalSurah(surah.number);
                            setShowDownloadModal(true);
                          }}
                          className="p-1.5 sm:p-2 rounded-xl text-stone-400 dark:text-stone-500 hover:text-emerald-600 dark:hover:text-emerald-400 hover:bg-emerald-50 dark:hover:bg-stone-800 transition-colors cursor-pointer"
                          title="تنزيل ملف السورة MP3 للاستماع دون إنترنت"
                        >
                          <Download className="w-3.5 h-3.5" />
                        </button>

                        {/* Share */}
                        <button
                          type="button"
                          onClick={() => handleShareAudio(surah.number, surah.name)}
                          className="p-1.5 sm:p-2 rounded-xl text-stone-400 dark:text-stone-500 hover:text-stone-700 dark:hover:text-stone-300 hover:bg-stone-100 dark:hover:bg-stone-800 transition-colors cursor-pointer hidden sm:block"
                          title="مشاركة رابط التلاوة"
                        >
                          <Share2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </div>
                  );
                })
              )}
            </div>

          </div>

        </div>
      )}

      {/* TAB 2: LIVE ISLAMIC RADIOS (177+ STATIONS) */}
      {activeMediaTab === 'radios' && (
        <RadioStationsSection showToast={showToast} />
      )}

      {/* TAB 3: LIVE TV BROADCASTS */}
      {activeMediaTab === 'livetv' && (
        <div className="space-y-6">
          <div className="p-6 rounded-3xl bg-gradient-to-br from-[#1C1A17] via-[#141210] to-[#0D0B0A] text-white border border-amber-900/40 shadow-xl space-y-4">
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
              <div className="space-y-1">
                <div className="flex items-center gap-2">
                  <span className="w-2.5 h-2.5 rounded-full bg-red-500 animate-pulse" />
                  <h2 className="font-amiri text-2xl sm:text-3xl font-bold text-amber-200">
                    البث المباشر للحرمين الشريفين (24/7)
                  </h2>
                </div>
                <p className="text-xs sm:text-sm text-stone-200 font-medium">
                  شاهد البث الحي المباشر من المسجد الحرام بمكة المكرمة والمسجد النبوي الشريف بالمدينة المنورة
                </p>
              </div>

              <button
                onClick={() => setShowLiveTVModal(true)}
                className="px-5 py-2.5 rounded-2xl bg-amber-600 hover:bg-amber-700 text-white font-bold text-xs sm:text-sm flex items-center gap-2 transition cursor-pointer shadow-md"
              >
                <Tv className="w-4 h-4" />
                <span>فتح مشغل البث المباشر الكامل ↗</span>
              </button>
            </div>
          </div>

          {/* Quick TV Channel Cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div
              onClick={() => setShowLiveTVModal(true)}
              className="p-6 rounded-3xl bg-white dark:bg-stone-900 border border-stone-200 dark:border-stone-800 hover:border-amber-500/50 shadow-sm transition-all cursor-pointer space-y-3 group"
            >
              <div className="flex items-center justify-between">
                <span className="px-2.5 py-0.5 rounded-full bg-red-500/15 text-red-600 dark:text-red-400 text-[11px] font-bold border border-red-500/20 flex items-center gap-1.5">
                  <span className="w-1.5 h-1.5 rounded-full bg-red-500 animate-pulse" />
                  <span>بث مباشر 24/7</span>
                </span>
                <span className="text-xs text-stone-600 dark:text-stone-300 font-mono font-medium">Saudi Quran TV</span>
              </div>
              <h3 className="font-amiri text-2xl font-bold text-stone-900 dark:text-stone-100 group-hover:text-amber-800 dark:group-hover:text-amber-300 transition-colors">
                قناة القرآن الكريم (مكة المكرمة) 🕋
              </h3>
              <p className="text-xs text-stone-600 dark:text-stone-300 leading-relaxed font-medium">
                نقل حي ومباشر على مدار الساعة لصلوات الفريضة والتراويح والطواف حول الكعبة المشرفة وتلاوات خاشعة
              </p>
              <div className="pt-2 border-t border-stone-100 dark:border-stone-800 flex items-center justify-between text-xs text-amber-700 dark:text-amber-400 font-bold">
                <span>مشاهدة البث الآن</span>
                <span>▶</span>
              </div>
            </div>

            <div
              onClick={() => setShowLiveTVModal(true)}
              className="p-6 rounded-3xl bg-white dark:bg-stone-900 border border-stone-200 dark:border-stone-800 hover:border-amber-500/50 shadow-sm transition-all cursor-pointer space-y-3 group"
            >
              <div className="flex items-center justify-between">
                <span className="px-2.5 py-0.5 rounded-full bg-red-500/15 text-red-600 dark:text-red-400 text-[11px] font-bold border border-red-500/20 flex items-center gap-1.5">
                  <span className="w-1.5 h-1.5 rounded-full bg-red-500 animate-pulse" />
                  <span>بث مباشر 24/7</span>
                </span>
                <span className="text-xs text-stone-600 dark:text-stone-300 font-mono font-medium">Saudi Sunnah TV</span>
              </div>
              <h3 className="font-amiri text-2xl font-bold text-stone-900 dark:text-stone-100 group-hover:text-amber-800 dark:group-hover:text-amber-300 transition-colors">
                قناة السنة النبوية (المدينة المنورة) 🕌
              </h3>
              <p className="text-xs text-stone-600 dark:text-stone-300 leading-relaxed font-medium">
                نقل مباشر من الروضة الشريفة والمسجد النبوي الشريف مع الأحاديث النبوية الشريفة وشروح السنة المطهرة
              </p>
              <div className="pt-2 border-t border-stone-100 dark:border-stone-800 flex items-center justify-between text-xs text-amber-700 dark:text-amber-400 font-bold">
                <span>مشاهدة البث الآن</span>
                <span>▶</span>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* TAB 4: AUDIO TAFASIR */}
      {activeMediaTab === 'tafasir' && (
        <AudioTafsirSection showToast={showToast} />
      )}

      {/* TAB 5: TADABOR & VIDEOS */}
      {activeMediaTab === 'tadabor' && (
        <TadaborVideosSection showToast={showToast} />
      )}

      {/* TAB 6: CURATED PLAYLISTS */}
      {activeMediaTab === 'playlists' && (
        <PlaylistsSection
          selectedReciter={selectedReciter}
          onOpenReciterSelector={() => setShowReciterModal(true)}
          showToast={showToast}
        />
      )}

      {/* Modals */}
      <ReciterSelectModal
        isOpen={showReciterModal}
        onClose={() => setShowReciterModal(false)}
        currentReciter={selectedReciter}
        onSelectReciter={handleSelectReciter}
      />

      <LiveTVModal
        isOpen={showLiveTVModal}
        onClose={() => setShowLiveTVModal(false)}
      />

      <AyahTimingExplorerModal
        isOpen={showTimingModal}
        onClose={() => setShowTimingModal(false)}
      />

      <AudioDownloadManagerModal
        isOpen={showDownloadModal}
        onClose={() => setShowDownloadModal(false)}
        defaultSurahNumber={downloadModalSurah}
      />

      {playlistModalSurah && (
        <AddToPlaylistModal
          isOpen={showPlaylistModal}
          onClose={() => setShowPlaylistModal(false)}
          surahNumber={playlistModalSurah}
          onSuccess={(title) => showToast(`تمت إضافة السورة إلى قائمة «${title}» بنجاح`)}
        />
      )}

    </div>
  );
};
