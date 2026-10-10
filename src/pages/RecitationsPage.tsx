import React, { useState, useMemo } from 'react';
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
  UserCheck
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

export const RecitationsPage: React.FC = () => {
  const {
    isPlaying,
    currentSurah,
    currentReciter,
    playSurah,
    togglePlay,
    setReciter,
  } = useAudio();

  // Tab: 'playlists' (قوائم التشغيل) or 'surahs' (سور القرآن)
  const [activeMediaTab, setActiveMediaTab] = useState<'playlists' | 'surahs'>('playlists');
  const [showReciterModal, setShowReciterModal] = useState(false);

  const [selectedRiwayah, setSelectedRiwayah] = useState<string>('all');
  const [reciterSearch, setReciterSearch] = useState<string>('');
  const [selectedReciter, setSelectedReciter] = useState<(Reciter & { riwayah: string; riwayahId: string })>(
    EXPANDED_RECITERS.find((r) => r.id === currentReciter?.id) || EXPANDED_RECITERS[0]
  );
  const [surahSearch, setSurahSearch] = useState('');
  const [toastMsg, setToastMsg] = useState<string | null>(null);
  const [showReciterGrid, setShowReciterGrid] = useState<boolean>(false);

  const showToast = (msg: string) => {
    setToastMsg(msg);
    setTimeout(() => setToastMsg(null), 2500);
  };

  // Sync selectedReciter if currentReciter changed globally
  React.useEffect(() => {
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

  // Filter Surahs
  const filteredSurahs = useMemo(() => {
    if (!surahSearch.trim()) return ALL_SURAHS;
    const q = surahSearch.trim().toLowerCase();
    return ALL_SURAHS.filter(
      (s) =>
        s.name.includes(q) ||
        s.englishName.toLowerCase().includes(q) ||
        String(s.number) === q
    );
  }, [surahSearch]);

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
      'محمد أيمن'
    );
    showToast(`تقبل الله استماعكم وأهدى ثوابه لأرواحهم الطاهرة`);
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8 text-right">
      
      {/* Toast Alert */}
      {toastMsg && (
        <div className="fixed top-20 left-1/2 -translate-x-1/2 z-50 px-4 py-2.5 rounded-xl bg-stone-900/95 text-amber-200 text-xs font-semibold shadow-2xl backdrop-blur-md border border-amber-500/30 animate-in fade-in zoom-in-95 duration-200">
          {toastMsg}
        </div>
      )}

      {/* Page Header */}
      <div className="text-center max-w-2xl mx-auto space-y-3">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-amber-100/80 dark:bg-stone-800 border border-amber-300 dark:border-amber-700/50 text-amber-900 dark:text-amber-300 text-xs font-semibold">
          <Headphones className="w-3.5 h-3.5 text-amber-800 dark:text-amber-400" />
          <span>المكتبة الصوتية والوسائط القرآنية</span>
        </div>
        <h1 className="font-amiri text-3xl sm:text-5xl font-bold text-stone-900 dark:text-stone-100">
          التلاوات القرآنية وقوائم التشغيل
        </h1>
        <p className="font-amiri text-base sm:text-lg text-stone-600 dark:text-stone-300 leading-relaxed">
          استمع لكتاب الله بأصوات كبار أئمة الحرمين وقراء العالم الإسلامي بمختلف الروايات، أو اختر قوائم تشغيل متسلسلة للرقية الشرعية والأوراد اليومية.
        </p>
      </div>

      {/* Main Tab Navigation Bar */}
      <div className="flex items-center justify-center gap-2 sm:gap-3 p-1.5 rounded-2xl bg-stone-100 dark:bg-stone-850 max-w-lg mx-auto border border-stone-200 dark:border-stone-750 shadow-2xs">
        <button
          type="button"
          onClick={() => setActiveMediaTab('playlists')}
          className={`flex-1 flex items-center justify-center gap-2 py-2.5 px-4 rounded-xl text-xs sm:text-sm font-bold transition-all cursor-pointer ${
            activeMediaTab === 'playlists'
              ? 'bg-amber-800 text-white shadow-xs'
              : 'text-stone-600 dark:text-stone-400 hover:text-stone-900 dark:hover:text-stone-100 hover:bg-white/60 dark:hover:bg-stone-800'
          }`}
        >
          <ListMusic className="w-4 h-4" />
          <span>قوائم التشغيل</span>
          <span className={`text-[10px] px-1.5 py-0.2 rounded-full font-mono ${
            activeMediaTab === 'playlists' ? 'bg-amber-700 text-amber-200' : 'bg-amber-100 dark:bg-stone-750 text-amber-900 dark:text-amber-300'
          }`}>
            ٧ قوائم
          </span>
        </button>

        <button
          type="button"
          onClick={() => setActiveMediaTab('surahs')}
          className={`flex-1 flex items-center justify-center gap-2 py-2.5 px-4 rounded-xl text-xs sm:text-sm font-bold transition-all cursor-pointer ${
            activeMediaTab === 'surahs'
              ? 'bg-amber-800 text-white shadow-xs'
              : 'text-stone-600 dark:text-stone-400 hover:text-stone-900 dark:hover:text-stone-100 hover:bg-white/60 dark:hover:bg-stone-800'
          }`}
        >
          <BookOpen className="w-4 h-4" />
          <span>فهرس السور (١١٤)</span>
        </button>
      </div>

      {/* TAB 1: CURATED PLAYLISTS SECTION */}
      {activeMediaTab === 'playlists' && (
        <PlaylistsSection
          selectedReciter={selectedReciter}
          onOpenReciterSelector={() => setShowReciterModal(true)}
          showToast={showToast}
        />
      )}

      {/* TAB 2: SURAHS DIRECTORY & RECITERS SELECTORS */}
      {activeMediaTab === 'surahs' && (
        <div className="space-y-8 animate-in fade-in duration-200">
          
          {/* SECTION 1: Centralized, Space-Saving Dropdown Selectors */}
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

          {/* SECTION 2: Reciters Directory Cards Grid */}
          <div className="space-y-4">
            
            {/* Reciters Bar Header & Search */}
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
                          <span className="text-[11px] text-stone-400 dark:text-stone-500 group-hover:text-stone-600 dark:group-hover:text-stone-300 font-mono">
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

          {/* SECTION 3: Surahs Audio Directory */}
          <div className="space-y-4">
            
            {/* Search & Active Info Bar */}
            <div className="flex flex-wrap items-center justify-between gap-3 p-4 rounded-2xl bg-white dark:bg-stone-900 border border-stone-200 dark:border-stone-800 shadow-xs">
              <div className="flex items-center gap-2 text-xs font-semibold text-stone-800 dark:text-stone-200">
                <ListMusic className="w-4 h-4 text-amber-700 dark:text-amber-400" />
                <span>سور القرآن الكريم كاملة بصوت {selectedReciter.name} ({selectedReciter.riwayah})</span>
              </div>

              <div className="w-full sm:w-64">
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

            {/* Surahs Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
              {filteredSurahs.length === 0 ? (
                <div className="col-span-full py-12 text-center text-stone-500 dark:text-stone-400 text-sm bg-white dark:bg-stone-900 rounded-2xl border border-stone-200 dark:border-stone-800">
                  لم نجد أي سورة مطابقة لبحثك «{surahSearch}».
                </div>
              ) : (
                filteredSurahs.map((surah) => {
                  const isThisSurahActive =
                    currentSurah?.number === surah.number && currentReciter.id === selectedReciter.id;
                  const isPlayingThis = isThisSurahActive && isPlaying;

                  return (
                    <div
                      key={surah.number}
                      className={`p-4 rounded-2xl border transition-all flex items-center justify-between gap-3 ${
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
                          <div className="font-amiri text-lg font-bold text-stone-900 dark:text-stone-100 truncate">
                            سورة {surah.name}
                          </div>
                          <div className="text-[11px] text-stone-500 dark:text-stone-400">
                            {surah.revelationArabic} · {surah.numberOfAyahs} آية · ص {surah.startPage}
                          </div>
                        </div>
                      </div>

                      <div className="flex items-center gap-1.5 shrink-0">
                        <button
                          type="button"
                          onClick={() => {
                            if (isThisSurahActive) {
                              togglePlay();
                            } else {
                              handlePlaySurah(surah.number);
                            }
                          }}
                          className={`w-9 h-9 rounded-xl flex items-center justify-center transition-all cursor-pointer ${
                            isPlayingThis
                              ? 'bg-amber-800 text-white shadow-xs'
                              : 'bg-stone-100 dark:bg-stone-800 hover:bg-amber-100 dark:hover:bg-stone-700 text-stone-700 dark:text-stone-300 hover:text-amber-900 dark:hover:text-amber-200'
                          }`}
                          title={isPlayingThis ? 'إيقاف مؤقت' : 'تشغيل التلاوة'}
                        >
                          {isPlayingThis ? <Pause className="w-4 h-4" /> : <Play className="w-4 h-4 ml-0.5" />}
                        </button>

                        <button
                          type="button"
                          onClick={() => handleDedicateListening(surah.name)}
                          className="p-2 rounded-xl text-stone-400 dark:text-stone-500 hover:text-amber-700 dark:hover:text-amber-400 hover:bg-amber-50 dark:hover:bg-stone-800 transition-colors cursor-pointer"
                          title="إهداء ثواب الاستماع"
                        >
                          <Heart className="w-4 h-4" />
                        </button>

                        <button
                          type="button"
                          onClick={() => handleShareAudio(surah.number, surah.name)}
                          className="p-2 rounded-xl text-stone-400 dark:text-stone-500 hover:text-stone-700 dark:hover:text-stone-300 hover:bg-stone-100 dark:hover:bg-stone-800 transition-colors cursor-pointer"
                          title="مشاركة رابط التلاوة"
                        >
                          <Share2 className="w-4 h-4" />
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

      {/* Reciter Selector Modal */}
      <ReciterSelectModal
        isOpen={showReciterModal}
        onClose={() => setShowReciterModal(false)}
        currentReciter={selectedReciter}
        onSelectReciter={handleSelectReciter}
      />

    </div>
  );
};
