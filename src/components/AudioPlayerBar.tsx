import React, { useState, useRef, useEffect } from 'react';
import {
  Play,
  Pause,
  SkipBack,
  SkipForward,
  RotateCcw,
  RotateCw,
  Volume2,
  VolumeX,
  X,
  Radio,
  Repeat,
  Shuffle,
  Moon,
  Sparkles,
  User,
  ListMusic,
  Check,
  Sliders,
  ChevronDown,
  Download,
  ListPlus,
  Loader2,
  RefreshCw,
  Trash2
} from 'lucide-react';
import { useAudio } from '../context/AudioContext';
import { EXPANDED_RECITERS } from '../data/reciters';
import { ALL_SURAHS } from '../data/quranMeta';
import { ReciterSelectModal } from './ReciterSelectModal';
import { AudioDownloadManagerModal } from './AudioDownloadManagerModal';
import { AddToPlaylistModal } from './AddToPlaylistModal';

export const AudioPlayerBar: React.FC = () => {
  const {
    audioMode,
    isPlaying,
    currentSurah,
    currentReciter,
    currentRadio,
    currentTafsir,
    currentTime,
    duration,
    volume,
    isMuted,
    isPlayerVisible,
    isLoading,
    audioError,
    playbackSpeed,
    isLooping,
    repeatMode,
    listeningQueue,
    sleepTimerMinutes,
    playlistTitle,
    radioConnectionState,
    radioRetryCount,
    togglePlay,
    seekTo,
    setVolumeLevel,
    toggleMute,
    setReciter,
    setPlaybackSpeed,
    toggleLoop,
    cycleRepeatMode,
    clearQueue,
    removeFromQueue,
    setSleepTimer,
    playNextSurah,
    playPreviousSurah,
    closePlayer,
  } = useAudio();

  const [showReciterModal, setShowReciterModal] = useState(false);
  const [showSpeedMenu, setShowSpeedMenu] = useState(false);
  const [showSleepMenu, setShowSleepMenu] = useState(false);
  const [showMobileExtraMenu, setShowMobileExtraMenu] = useState(false);
  const [showDownloadModal, setShowDownloadModal] = useState(false);
  const [showPlaylistModal, setShowPlaylistModal] = useState(false);
  const [showQueueModal, setShowQueueModal] = useState(false);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  const speedMenuRef = useRef<HTMLDivElement>(null);
  const sleepMenuRef = useRef<HTMLDivElement>(null);
  const mobileExtraRef = useRef<HTMLDivElement>(null);

  // Close menus on outside click
  useEffect(() => {
    const handleOutsideClick = (e: MouseEvent) => {
      if (speedMenuRef.current && !speedMenuRef.current.contains(e.target as Node)) {
        setShowSpeedMenu(false);
      }
      if (sleepMenuRef.current && !sleepMenuRef.current.contains(e.target as Node)) {
        setShowSleepMenu(false);
      }
      if (mobileExtraRef.current && !mobileExtraRef.current.contains(e.target as Node)) {
        setShowMobileExtraMenu(false);
      }
    };
    if (showSpeedMenu || showSleepMenu || showMobileExtraMenu) {
      document.addEventListener('mousedown', handleOutsideClick);
    }
    return () => document.removeEventListener('mousedown', handleOutsideClick);
  }, [showSpeedMenu, showSleepMenu, showMobileExtraMenu]);

  const triggerToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => {
      setToastMessage(null);
    }, 2600);
  };

  if (!isPlayerVisible) {
    return null;
  }
  if (audioMode === 'surah' && !currentSurah) {
    return null;
  }
  if (audioMode === 'radio' && !currentRadio) {
    return null;
  }
  if (audioMode === 'tafsir' && !currentTafsir) {
    return null;
  }

  const formatTime = (secs: number) => {
    if (isNaN(secs) || secs < 0) return '00:00';
    const m = Math.floor(secs / 60);
    const s = Math.floor(secs % 60);
    return `${String(m).padStart(2, '0')}:${String(s).padStart(2, '0')}`;
  };

  const progressPercent = duration > 0 ? (currentTime / duration) * 100 : 0;

  const handleSkipBackward = () => {
    seekTo(Math.max(0, currentTime - 10));
    triggerToast('تراجع ١٠ ثوانٍ');
  };

  const handleSkipForward = () => {
    seekTo(Math.min(duration, currentTime + 10));
    triggerToast('تقديم ١٠ ثوانٍ');
  };

  const handleSelectNewReciter = (rec: (typeof EXPANDED_RECITERS)[0]) => {
    setReciter(rec);
    setShowReciterModal(false);
    triggerToast(`تم التبديل إلى الشيخ: ${rec.name}`);
  };

  return (
    <>
      {/* Floating Quranic Liquid Glass Player Island */}
      <div
        className="fixed bottom-[4.4rem] sm:bottom-4 lg:bottom-4 left-2 right-2 sm:left-1/2 sm:-translate-x-1/2 sm:w-[94%] sm:max-w-3xl lg:max-w-4xl z-50 text-stone-100 select-none animate-in slide-in-from-bottom-4 duration-300"
        role="region"
        aria-label="المشغل القرآني العائم"
      >
        <div className="relative rounded-2xl sm:rounded-3xl backdrop-blur-2xl bg-[#09120e]/90 dark:bg-[#040e09]/92 border border-white/20 dark:border-amber-500/30 shadow-[0_16px_40px_-10px_rgba(0,0,0,0.55),0_4px_16px_rgba(217,119,6,0.14)] ring-1 ring-white/10 p-2 sm:p-2.5 sm:px-4 flex flex-col gap-1 transition-all overflow-visible">
          
          {/* Top Liquid Glass Specular Highlight Rim */}
          <div className="absolute inset-x-0 top-0 h-[1.5px] bg-gradient-to-r from-transparent via-amber-300/70 to-transparent pointer-events-none rounded-t-2xl sm:rounded-t-3xl" />

          {/* Ambient Golden Core Glow */}
          <div className="absolute -top-8 left-1/2 -translate-x-1/2 w-64 h-10 bg-amber-500/15 blur-xl pointer-events-none rounded-full" />

          {/* Feedback Toast Banner */}
          {toastMessage && (
            <div className="absolute -top-10 left-1/2 -translate-x-1/2 px-3.5 py-1 rounded-full bg-stone-900/95 text-amber-300 text-xs font-semibold border border-amber-500/40 shadow-2xl backdrop-blur-md animate-in fade-in zoom-in-95 duration-150 pointer-events-none z-50 flex items-center gap-1.5 whitespace-nowrap">
              <Sparkles className="w-3.5 h-3.5 text-amber-400" />
              <span>{toastMessage}</span>
            </div>
          )}

          {/* Error & Automatic Reconnection Message Alert */}
          {audioError && (
            <div className="text-[11px] text-amber-300 bg-amber-950/90 px-3 py-1 rounded-xl border border-amber-500/30 flex items-center justify-between mb-0.5">
              <div className="flex items-center gap-1.5 min-w-0">
                {radioConnectionState === 'reconnecting' && (
                  <Loader2 className="w-3.5 h-3.5 animate-spin text-amber-400 shrink-0" />
                )}
                <span className="truncate">{audioError}</span>
              </div>
              <button
                type="button"
                onClick={togglePlay}
                className="underline font-bold text-amber-200 hover:text-white cursor-pointer ml-2 shrink-0"
              >
                إعادة المحاولة
              </button>
            </div>
          )}

          {/* Integrated Slim Scrubber / Live Header (Height ~4px) */}
          {audioMode === 'radio' ? (
            <div className="flex items-center justify-between px-2 py-0.5 text-[10px] text-amber-300/90 border-b border-amber-500/15 mb-0.5">
              <div className="flex items-center gap-1.5">
                {radioConnectionState === 'connecting' || radioConnectionState === 'reconnecting' ? (
                  <>
                    <Loader2 className="w-3 h-3 animate-spin text-amber-400" />
                    <span className="font-bold">
                      {radioConnectionState === 'reconnecting'
                        ? `إعادة الاتصال (${radioRetryCount}/٣)...`
                        : 'جاري الاتصال بالبث...'}
                    </span>
                  </>
                ) : (
                  <>
                    <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
                    <span className="text-emerald-300 font-bold">بث مباشر ٢٤/٧</span>
                    <span className="text-stone-400 hidden sm:inline">· MP3Quran</span>
                  </>
                )}
              </div>
              <span className="font-mono text-[9px] tracking-wider text-amber-400/90 font-bold">
                LIVE
              </span>
            </div>
          ) : (
            <div
              className="w-full bg-stone-800/80 hover:bg-stone-700/80 h-1 sm:h-1.5 rounded-full cursor-pointer relative group transition-all my-0.5"
              onClick={(e) => {
                const rect = e.currentTarget.getBoundingClientRect();
                const clickX = e.clientX - rect.left;
                const ratio = clickX / rect.width;
                seekTo(ratio * duration);
              }}
              title="شريط تقدم التلاوة"
            >
              <div
                className="h-full bg-gradient-to-r from-amber-600 via-amber-500 to-amber-300 rounded-full relative transition-all"
                style={{ width: `${progressPercent}%` }}
              >
                <span className="absolute left-0 top-1/2 -translate-y-1/2 -translate-x-1/2 w-2.5 h-2.5 sm:w-3 sm:h-3 bg-white border border-amber-500 rounded-full shadow-[0_0_8px_rgba(245,158,11,0.9)] opacity-0 group-hover:opacity-100 transition-opacity" />
              </div>
            </div>
          )}

          {/* MAIN STREAMLINED CONTROLS ROW */}
          <div className="flex items-center justify-between gap-1.5 sm:gap-3 relative">
            
            {/* ZONE 1: Metadata (Surah / Reciter / Radio) */}
            <div className="flex items-center gap-2 min-w-0 max-w-[42%] sm:max-w-[34%] shrink-0">
              
              {/* Mini Visualizer / Icon */}
              <div className="w-8 h-8 sm:w-9 sm:h-9 rounded-xl bg-amber-950/70 border border-amber-500/35 flex items-center justify-center shrink-0 shadow-2xs">
                {isPlaying ? (
                  <div className="flex items-end gap-0.5 h-3.5">
                    <span className="w-0.5 sm:w-1 bg-amber-400 rounded-full animate-bounce [animation-delay:-0.3s] h-3" />
                    <span className="w-0.5 sm:w-1 bg-amber-300 rounded-full animate-bounce [animation-delay:-0.15s] h-3.5" />
                    <span className="w-0.5 sm:w-1 bg-amber-500 rounded-full animate-bounce [animation-delay:-0.45s] h-2" />
                  </div>
                ) : (
                  <Radio className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-amber-400" />
                )}
              </div>

              {/* Text info */}
              <div className="min-w-0 text-right">
                {audioMode === 'radio' && currentRadio ? (
                  <>
                    <div className="font-amiri text-xs sm:text-sm font-bold text-white truncate leading-tight">
                      {currentRadio.name}
                    </div>
                    <span className="text-[10px] text-amber-300 font-medium block truncate">
                      إذاعة إسلامية
                    </span>
                  </>
                ) : audioMode === 'tafsir' && currentTafsir ? (
                  <>
                    <div className="font-amiri text-xs sm:text-sm font-bold text-white truncate leading-tight">
                      {currentTafsir.title}
                    </div>
                    <span className="text-[10px] text-amber-300 font-medium block truncate">
                      تفسير {currentTafsir.surahName}
                    </span>
                  </>
                ) : currentSurah ? (
                  <>
                    <div className="font-amiri text-xs sm:text-sm font-bold text-white truncate leading-tight">
                      سورة {currentSurah.name}
                    </div>

                    <button
                      type="button"
                      onClick={() => setShowReciterModal(true)}
                      className="mt-0.5 inline-flex items-center gap-1 px-1.5 py-0.5 rounded-md bg-amber-500/15 hover:bg-amber-500/25 border border-amber-500/30 text-amber-300 hover:text-white transition-all cursor-pointer text-[10px] truncate max-w-full"
                      title="تغيير الشيخ والقارئ"
                    >
                      <User className="w-2.5 h-2.5 text-amber-400 shrink-0" />
                      <span className="truncate">{currentReciter.name}</span>
                      <ChevronDown className="w-2 h-2 opacity-70 shrink-0" />
                    </button>
                  </>
                ) : null}
              </div>

            </div>

            {/* ZONE 2: Transport Playback Center */}
            <div className="flex items-center justify-center gap-1 sm:gap-2 shrink-0">
              {/* Previous Surah */}
              {audioMode === 'surah' && (
                <button
                  type="button"
                  onClick={playPreviousSurah}
                  className="p-1 sm:p-1.5 rounded-xl text-stone-300 hover:text-white hover:bg-white/10 transition-colors cursor-pointer active:scale-95"
                  title="السورة السابقة"
                  aria-label="السورة السابقة"
                >
                  <SkipForward className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
                </button>
              )}

              {/* Rewind -10s (Tablet/Desktop) */}
              {audioMode !== 'radio' && (
                <button
                  type="button"
                  onClick={handleSkipBackward}
                  className="hidden md:flex p-1 sm:p-1.5 rounded-xl text-stone-300 hover:text-amber-200 hover:bg-white/10 transition-colors cursor-pointer items-center gap-0.5 active:scale-95 text-[10px] font-mono"
                  title="تراجع 10 ثوانٍ"
                  aria-label="تراجع 10 ثوانٍ"
                >
                  <RotateCcw className="w-3.5 h-3.5" />
                  <span className="text-[8px] text-stone-400">١٠ث</span>
                </button>
              )}

              {/* Central Luminous Play/Pause Button */}
              <button
                type="button"
                onClick={togglePlay}
                disabled={isLoading && radioConnectionState !== 'reconnecting'}
                className="relative w-8 h-8 sm:w-9 sm:h-9 rounded-xl sm:rounded-2xl bg-gradient-to-tr from-amber-600 via-amber-500 to-amber-400 text-stone-950 flex items-center justify-center shadow-md shadow-amber-500/25 hover:scale-105 active:scale-95 transition-all cursor-pointer font-bold shrink-0 disabled:opacity-50 ring-2 ring-amber-400/50"
                title={isPlaying ? 'إيقاف مؤقت' : 'تشغيل الصوت'}
                aria-label={isPlaying ? 'إيقاف مؤقت' : 'تشغيل الصوت'}
              >
                {isLoading ? (
                  <div className="w-3.5 h-3.5 border-2 border-stone-950 border-t-transparent rounded-full animate-spin" />
                ) : isPlaying ? (
                  <Pause className="w-3.5 h-3.5 sm:w-4 sm:h-4 fill-stone-950 stroke-stone-950" />
                ) : (
                  <Play className="w-3.5 h-3.5 sm:w-4 sm:h-4 fill-stone-950 stroke-stone-950 ml-0.5" />
                )}
              </button>

              {/* Fast Forward +10s (Tablet/Desktop) */}
              {audioMode !== 'radio' && (
                <button
                  type="button"
                  onClick={handleSkipForward}
                  className="hidden md:flex p-1 sm:p-1.5 rounded-xl text-stone-300 hover:text-amber-200 hover:bg-white/10 transition-colors cursor-pointer items-center gap-0.5 active:scale-95 text-[10px] font-mono"
                  title="تقديم 10 ثوانٍ"
                  aria-label="تقديم 10 ثوانٍ"
                >
                  <RotateCw className="w-3.5 h-3.5" />
                  <span className="text-[8px] text-stone-400">١٠ث</span>
                </button>
              )}

              {/* Next Surah */}
              {audioMode === 'surah' && (
                <button
                  type="button"
                  onClick={playNextSurah}
                  className="p-1 sm:p-1.5 rounded-xl text-stone-300 hover:text-white hover:bg-white/10 transition-colors cursor-pointer active:scale-95"
                  title="السورة التالية"
                  aria-label="السورة التالية"
                >
                  <SkipBack className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
                </button>
              )}
            </div>

            {/* ZONE 3: Time, Tools & Actions */}
            <div className="flex items-center gap-1 sm:gap-1.5 shrink-0">
              
              {/* Timestamps in Surah mode */}
              {audioMode !== 'radio' && (
                <div className="hidden sm:flex items-center gap-1 text-[10px] font-mono text-stone-400 tabular-nums pl-1">
                  <span className="text-amber-300 font-semibold">{formatTime(currentTime)}</span>
                  <span>/</span>
                  <span>{duration > 0 ? formatTime(duration) : '00:00'}</span>
                </div>
              )}

              {/* Playlist button (Desktop) */}
              {audioMode === 'surah' && currentSurah && (
                <button
                  type="button"
                  onClick={() => setShowPlaylistModal(true)}
                  className="hidden lg:flex p-1 sm:p-1.5 rounded-xl text-stone-400 hover:text-amber-300 hover:bg-white/10 transition-colors cursor-pointer"
                  title="إضافة السورة لقائمة تشغيل"
                >
                  <ListPlus className="w-3.5 h-3.5" />
                </button>
              )}

              {/* Download Manager (Desktop) */}
              <button
                type="button"
                onClick={() => setShowDownloadModal(true)}
                className="hidden md:flex p-1 sm:p-1.5 rounded-xl text-stone-400 hover:text-amber-300 hover:bg-white/10 transition-colors cursor-pointer"
                title="مدير التنزيلات أوفلاين"
              >
                <Download className="w-3.5 h-3.5" />
              </button>

              {/* Mobile Extra Menu Pill */}
              <div className="relative sm:hidden" ref={mobileExtraRef}>
                <button
                  type="button"
                  onClick={() => setShowMobileExtraMenu(!showMobileExtraMenu)}
                  className={`p-1 rounded-lg border text-stone-300 transition-colors cursor-pointer ${
                    isLooping || sleepTimerMinutes || playbackSpeed !== 1
                      ? 'bg-amber-500/25 border-amber-500/50 text-amber-300'
                      : 'border-stone-800 hover:bg-white/10'
                  }`}
                  title="خيارات إضافية"
                >
                  <Sliders className="w-3 h-3" />
                </button>

                {showMobileExtraMenu && (
                  <div className="absolute bottom-full left-0 mb-2 w-48 bg-[#161820] border border-amber-500/40 rounded-2xl shadow-2xl p-2 z-50 text-right backdrop-blur-2xl space-y-1.5 animate-in fade-in zoom-in-95 duration-150">
                    <div className="text-[10px] font-bold text-stone-400 px-1 border-b border-stone-800 pb-1">
                      خيارات المشغل والتلاوة
                    </div>

                    {/* Mobile Download Manager */}
                    <button
                      type="button"
                      onClick={() => {
                        setShowMobileExtraMenu(false);
                        setShowDownloadModal(true);
                      }}
                      className="w-full flex items-center justify-between px-2 py-1.5 rounded-xl text-xs hover:bg-stone-800 text-stone-300"
                    >
                      <span className="flex items-center gap-1.5">
                        <Download className="w-3.5 h-3.5 text-amber-400" />
                        <span>مدير التنزيلات</span>
                      </span>
                    </button>

                    {/* Mobile Add to Playlist */}
                    {audioMode === 'surah' && currentSurah && (
                      <button
                        type="button"
                        onClick={() => {
                          setShowMobileExtraMenu(false);
                          setShowPlaylistModal(true);
                        }}
                        className="w-full flex items-center justify-between px-2 py-1.5 rounded-xl text-xs hover:bg-stone-800 text-stone-300"
                      >
                        <span className="flex items-center gap-1.5">
                          <ListPlus className="w-3.5 h-3.5 text-emerald-400" />
                          <span>إضافة لقائمة</span>
                        </span>
                      </button>
                    )}

                    {/* Mobile Repeat Toggle */}
                    <button
                      type="button"
                      onClick={() => {
                        toggleLoop();
                        triggerToast(!isLooping ? 'تم تفعيل التكرار' : 'تم إلغاء التكرار');
                      }}
                      className="w-full flex items-center justify-between px-2 py-1.5 rounded-xl text-xs hover:bg-stone-800 text-stone-300"
                    >
                      <span className="flex items-center gap-1.5">
                        <Repeat className="w-3.5 h-3.5 text-amber-400" />
                        <span>تكرار السورة</span>
                      </span>
                      {isLooping && <Check className="w-3 h-3 text-amber-400" />}
                    </button>

                    {/* Mobile Speed Toggle */}
                    <div className="flex items-center justify-between px-2 py-1 text-xs">
                      <span className="text-stone-400 text-[10px]">السرعة:</span>
                      <div className="flex items-center gap-1">
                        {[1, 1.25, 1.5].map((spd) => (
                          <button
                            key={spd}
                            type="button"
                            onClick={() => {
                              setPlaybackSpeed(spd);
                              triggerToast(`السرعة: ${spd}x`);
                            }}
                            className={`px-1.5 py-0.5 rounded text-[10px] font-mono ${
                              playbackSpeed === spd ? 'bg-amber-600 text-white font-bold' : 'bg-stone-800 text-stone-300'
                            }`}
                          >
                            {spd}x
                          </button>
                        ))}
                      </div>
                    </div>

                    {/* Mobile Sleep Timer Toggle */}
                    <div className="flex items-center justify-between px-2 py-1 text-xs">
                      <span className="text-stone-400 text-[10px]">المؤقت:</span>
                      <div className="flex items-center gap-1">
                        {[null, 15, 30].map((mins) => (
                          <button
                            key={String(mins)}
                            type="button"
                            onClick={() => {
                              setSleepTimer(mins);
                              triggerToast(mins ? `مؤقت: ${mins}د` : 'إلغاء');
                            }}
                            className={`px-1.5 py-0.5 rounded text-[10px] ${
                              sleepTimerMinutes === mins ? 'bg-amber-600 text-white font-bold' : 'bg-stone-800 text-stone-300'
                            }`}
                          >
                            {mins ? `${mins}د` : 'إلغاء'}
                          </button>
                        ))}
                      </div>
                    </div>
                  </div>
                )}
              </div>

              {/* Desktop Multi-Repeat Mode Toggle (Continuous / Repeat 1 / Repeat All / Shuffle) */}
              <button
                type="button"
                onClick={() => {
                  cycleRepeatMode();
                  const labels: Record<string, string> = {
                    continuous: 'التشغيل المتتابع التلقائي 🔁',
                    'repeat-one': 'تكرار السورة الحالية 🔂',
                    'repeat-all': 'تكرار القائمة بالكامل 🔁',
                    shuffle: 'التشغيل العشوائي 🔀'
                  };
                  const nextModes: Record<string, string> = {
                    continuous: 'repeat-one',
                    'repeat-one': 'repeat-all',
                    'repeat-all': 'shuffle',
                    shuffle: 'continuous'
                  };
                  const nextM = nextModes[repeatMode] || 'continuous';
                  triggerToast(`نمط التشغيل: ${labels[nextM] || labels.continuous}`);
                }}
                className={`hidden sm:flex items-center gap-1 p-1 sm:p-1.5 rounded-xl transition-all cursor-pointer relative ${
                  repeatMode !== 'continuous'
                    ? 'bg-amber-500/25 text-amber-300 border border-amber-500/50 shadow-2xs'
                    : 'text-stone-400 hover:text-white hover:bg-white/10'
                }`}
                title={`نمط التشغيل: ${repeatMode === 'repeat-one' ? 'تكرار السورة' : repeatMode === 'repeat-all' ? 'تكرار الكل' : repeatMode === 'shuffle' ? 'عشوائي' : 'متتابع تلقائياً'}`}
              >
                {repeatMode === 'shuffle' ? (
                  <Shuffle className="w-3.5 h-3.5 text-amber-400" />
                ) : (
                  <Repeat className="w-3.5 h-3.5" />
                )}
                {repeatMode === 'repeat-one' && (
                  <span className="text-[8px] font-bold font-mono text-amber-300 -mr-0.5">1</span>
                )}
              </button>

              {/* Listening Queue Indicator Button */}
              {listeningQueue.length > 0 && (
                <button
                  type="button"
                  onClick={() => setShowQueueModal(true)}
                  className="hidden sm:flex items-center gap-1 px-2 py-1 rounded-xl bg-amber-500/20 hover:bg-amber-500/30 text-amber-300 border border-amber-500/40 text-[10px] font-bold transition-all cursor-pointer shadow-xs active:scale-95"
                  title="عرض طابور الاستماع المتتابع"
                >
                  <ListMusic className="w-3.5 h-3.5" />
                  <span>{listeningQueue.length}</span>
                </button>
              )}

              {/* Desktop Speed Menu */}
              <div className="relative hidden sm:block" ref={speedMenuRef}>
                <button
                  type="button"
                  onClick={() => {
                    setShowSpeedMenu(!showSpeedMenu);
                    setShowSleepMenu(false);
                  }}
                  className={`flex items-center gap-0.5 px-1.5 py-0.5 rounded-lg text-[10px] font-mono font-bold transition-all cursor-pointer border ${
                    playbackSpeed !== 1
                      ? 'bg-amber-500/25 text-amber-300 border-amber-500/50 shadow-2xs'
                      : 'text-stone-400 hover:text-white border-stone-800 hover:bg-white/10'
                  }`}
                  title="سرعة التلاوة"
                >
                  <span>{playbackSpeed}x</span>
                </button>

                {showSpeedMenu && (
                  <div className="absolute bottom-full left-0 mb-2 w-32 bg-[#161820] border border-amber-500/40 rounded-2xl shadow-2xl p-1.5 z-50 text-right backdrop-blur-xl animate-in fade-in zoom-in-95 duration-150">
                    <div className="text-[10px] font-bold text-stone-400 px-2 py-0.5 border-b border-stone-800 mb-1">
                      سرعة التلاوة
                    </div>
                    {[0.75, 1, 1.25, 1.5, 2].map((spd) => (
                      <button
                        key={spd}
                        type="button"
                        onClick={() => {
                          setPlaybackSpeed(spd);
                          setShowSpeedMenu(false);
                          triggerToast(`سرعة التلاوة: ${spd}x`);
                        }}
                        className={`w-full text-right px-2 py-1 rounded-xl text-xs font-mono transition-colors cursor-pointer flex items-center justify-between ${
                          playbackSpeed === spd
                            ? 'bg-amber-600/30 text-amber-300 font-bold border border-amber-500/30'
                            : 'text-stone-300 hover:bg-stone-800'
                        }`}
                      >
                        <span>{spd}x {spd === 1 && '(طبيعي)'}</span>
                        {playbackSpeed === spd && <Check className="w-3 h-3 text-amber-400" />}
                      </button>
                    ))}
                  </div>
                )}
              </div>

              {/* Desktop Sleep Timer */}
              <div className="relative hidden sm:block" ref={sleepMenuRef}>
                <button
                  type="button"
                  onClick={() => {
                    setShowSleepMenu(!showSleepMenu);
                    setShowSpeedMenu(false);
                  }}
                  className={`p-1 sm:p-1.5 rounded-xl transition-all cursor-pointer relative ${
                    sleepTimerMinutes
                      ? 'bg-amber-500/25 text-amber-300 border border-amber-500/50 shadow-2xs'
                      : 'text-stone-400 hover:text-white hover:bg-white/10'
                  }`}
                  title="مؤقت النوم"
                >
                  <Moon className="w-3.5 h-3.5" />
                  {sleepTimerMinutes && (
                    <span className="absolute -top-1 -right-1 text-[8px] font-mono bg-amber-500 text-stone-950 font-bold rounded-full w-3.5 h-3.5 flex items-center justify-center shadow-2xs">
                      {sleepTimerMinutes}
                    </span>
                  )}
                </button>

                {showSleepMenu && (
                  <div className="absolute bottom-full left-0 mb-2 w-36 bg-[#161820] border border-amber-500/40 rounded-2xl shadow-2xl p-1.5 z-50 text-right backdrop-blur-xl animate-in fade-in zoom-in-95 duration-150">
                    <div className="text-[10px] font-bold text-stone-400 px-2 py-0.5 border-b border-stone-800 mb-1">
                      مؤقت النوم
                    </div>
                    {[
                      { label: 'إيقاف المؤقت', val: null },
                      { label: '١٥ دقيقة', val: 15 },
                      { label: '٣٠ دقيقة', val: 30 },
                      { label: '٤٥ دقيقة', val: 45 },
                      { label: '٦٠ دقيقة (ساعة)', val: 60 },
                    ].map((item) => (
                      <button
                        key={String(item.val)}
                        type="button"
                        onClick={() => {
                          setSleepTimer(item.val);
                          setShowSleepMenu(false);
                          triggerToast(item.val ? `مؤقت: ${item.val} دقيقة` : 'إلغاء المؤقت');
                        }}
                        className={`w-full text-right px-2 py-1 rounded-xl text-xs transition-colors cursor-pointer flex items-center justify-between ${
                          sleepTimerMinutes === item.val
                            ? 'bg-amber-600/30 text-amber-300 font-bold border border-amber-500/30'
                            : 'text-stone-300 hover:bg-stone-800'
                        }`}
                      >
                        <span>{item.label}</span>
                        {sleepTimerMinutes === item.val && <Check className="w-3 h-3 text-amber-400" />}
                      </button>
                    ))}
                  </div>
                )}
              </div>

              {/* Volume Slider (Large Screens) */}
              <div className="hidden lg:flex items-center gap-1 bg-stone-900/80 border border-stone-750 rounded-xl px-1.5 py-0.5">
                <button
                  type="button"
                  onClick={toggleMute}
                  className="text-stone-400 hover:text-white cursor-pointer"
                  title={isMuted ? 'إلغاء الكتم' : 'كتم الصوت'}
                >
                  {isMuted || volume === 0 ? <VolumeX className="w-3 h-3" /> : <Volume2 className="w-3 h-3" />}
                </button>
                <input
                  type="range"
                  min="0"
                  max="1"
                  step="0.05"
                  value={isMuted ? 0 : volume}
                  onChange={(e) => setVolumeLevel(parseFloat(e.target.value))}
                  className="w-12 h-1 accent-amber-500 bg-stone-700 rounded-lg cursor-pointer"
                />
              </div>

              {/* Close Button */}
              <button
                type="button"
                onClick={closePlayer}
                className="p-1 sm:p-1.5 rounded-xl text-stone-400 hover:text-rose-300 hover:bg-white/10 transition-colors cursor-pointer"
                title="إغلاق المشغل القرآني"
              >
                <X className="w-3.5 h-3.5" />
              </button>

            </div>

          </div>

        </div>
      </div>

      {/* LISTENING QUEUE MODAL */}
      {showQueueModal && (
        <div
          className="fixed inset-0 z-50 bg-black/70 backdrop-blur-sm flex items-center justify-center p-4 animate-in fade-in duration-200"
          onClick={() => setShowQueueModal(false)}
        >
          <div
            className="w-full max-w-md bg-[#121614] border border-amber-500/30 rounded-3xl p-5 shadow-2xl text-right space-y-4 animate-in zoom-in-95 duration-200"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between border-b border-stone-800 pb-3">
              <div className="flex items-center gap-2">
                <span className="w-8 h-8 rounded-xl bg-amber-500/20 text-amber-300 flex items-center justify-center">
                  <ListMusic className="w-4 h-4" />
                </span>
                <div>
                  <h3 className="font-amiri text-base font-bold text-white">طابور الاستماع المتتابع</h3>
                  <span className="text-[10px] text-stone-400">السور المجدولة للتشغيل تلقائياً بالتتابع</span>
                </div>
              </div>

              <div className="flex items-center gap-2">
                {listeningQueue.length > 0 && (
                  <button
                    onClick={() => {
                      clearQueue();
                      triggerToast('تم مسح طابور الاستماع');
                    }}
                    className="p-1.5 rounded-lg text-rose-400 hover:text-rose-300 hover:bg-rose-950/40 text-xs flex items-center gap-1 cursor-pointer transition"
                    title="مسح الكل"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                    <span>مسح</span>
                  </button>
                )}
                <button
                  onClick={() => setShowQueueModal(false)}
                  className="p-1.5 rounded-xl text-stone-400 hover:text-white bg-stone-850 cursor-pointer"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
            </div>

            {listeningQueue.length === 0 ? (
              <div className="py-8 text-center text-stone-500 text-xs">
                لا توجد سور في طابور الانتظار حالياً. أضف سوراً من صفحة التلاوات!
              </div>
            ) : (
              <div className="max-h-64 overflow-y-auto space-y-2 p-0.5">
                {listeningQueue.map((sNum, index) => {
                  const s = ALL_SURAHS.find((item) => item.number === sNum);
                  return (
                    <div
                      key={`${sNum}_${index}`}
                      className="p-2.5 rounded-2xl bg-stone-900 border border-stone-800 flex items-center justify-between gap-2"
                    >
                      <div className="flex items-center gap-2.5">
                        <span className="w-6 h-6 rounded-lg bg-amber-500/15 text-amber-400 font-mono text-xs flex items-center justify-center font-bold">
                          {index + 1}
                        </span>
                        <div>
                          <span className="font-amiri text-sm font-bold text-white block">
                            سورة {s?.name || sNum}
                          </span>
                          <span className="text-[10px] text-stone-400">
                            {s?.revelationArabic} · {s?.numberOfAyahs} آية
                          </span>
                        </div>
                      </div>

                      <button
                        onClick={() => removeFromQueue(index)}
                        className="p-1 rounded-lg text-stone-500 hover:text-rose-400 cursor-pointer"
                        title="إزالة من الطابور"
                      >
                        <X className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </div>
      )}

      {/* DEDICATED RECITER SELECTOR MODAL */}
      <ReciterSelectModal
        isOpen={showReciterModal}
        onClose={() => setShowReciterModal(false)}
        currentReciter={currentReciter}
        onSelectReciter={handleSelectNewReciter}
      />

      {/* AUDIO DOWNLOAD MANAGER MODAL */}
      <AudioDownloadManagerModal
        isOpen={showDownloadModal}
        onClose={() => setShowDownloadModal(false)}
        defaultSurahNumber={currentSurah?.number}
      />

      {/* ADD TO PLAYLIST MODAL */}
      {currentSurah && (
        <AddToPlaylistModal
          isOpen={showPlaylistModal}
          onClose={() => setShowPlaylistModal(false)}
          surahNumber={currentSurah.number}
          onSuccess={(plTitle) => triggerToast(`تمت إضافة سورة ${currentSurah.name} إلى «${plTitle}»`)}
        />
      )}
    </>
  );
};
