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
  Moon,
  Sparkles,
  User,
  ListMusic,
  Check,
  Sliders,
  ChevronDown
} from 'lucide-react';
import { useAudio } from '../context/AudioContext';
import { EXPANDED_RECITERS } from '../data/reciters';
import { ReciterSelectModal } from './ReciterSelectModal';

export const AudioPlayerBar: React.FC = () => {
  const {
    isPlaying,
    currentSurah,
    currentReciter,
    currentTime,
    duration,
    volume,
    isMuted,
    isPlayerVisible,
    isLoading,
    audioError,
    playbackSpeed,
    isLooping,
    sleepTimerMinutes,
    playlistTitle,
    togglePlay,
    seekTo,
    setVolumeLevel,
    toggleMute,
    setReciter,
    setPlaybackSpeed,
    toggleLoop,
    setSleepTimer,
    playNextSurah,
    playPreviousSurah,
    closePlayer,
  } = useAudio();

  const [showReciterModal, setShowReciterModal] = useState(false);
  const [showSpeedMenu, setShowSpeedMenu] = useState(false);
  const [showSleepMenu, setShowSleepMenu] = useState(false);
  const [showMobileExtraMenu, setShowMobileExtraMenu] = useState(false);
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
      setToastMessage(null), 2600;
    }, 2600);
  };

  if (!isPlayerVisible || !currentSurah) {
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
        className="fixed bottom-[4.75rem] sm:bottom-5 left-2.5 right-2.5 sm:left-1/2 sm:-translate-x-1/2 sm:w-[94%] sm:max-w-4xl z-50 text-stone-100 select-none animate-in slide-in-from-bottom-5 duration-300"
        role="region"
        aria-label="المشغل القرآني العائم"
      >
        <div className="relative rounded-3xl backdrop-blur-2xl bg-[#0D1016]/92 border border-amber-500/40 shadow-[0_20px_60px_-15px_rgba(217,119,6,0.22),0_8px_30px_rgba(0,0,0,0.85)] ring-1 ring-white/10 p-3 sm:p-4 flex flex-col gap-2 transition-all overflow-visible">
          
          {/* Top Liquid Glass Specular Reflection Line */}
          <div className="absolute inset-x-0 top-0 h-[1.5px] bg-gradient-to-r from-transparent via-white/80 to-transparent pointer-events-none rounded-t-3xl" />

          {/* Ambient Golden Core Glow */}
          <div className="absolute -top-10 left-1/2 -translate-x-1/2 w-80 h-14 bg-amber-500/20 blur-2xl pointer-events-none rounded-full" />

          {/* Feedback Toast Banner */}
          {toastMessage && (
            <div className="absolute -top-11 left-1/2 -translate-x-1/2 px-4 py-1.5 rounded-full bg-stone-900/95 text-amber-300 text-xs font-semibold border border-amber-500/40 shadow-2xl backdrop-blur-md animate-in fade-in zoom-in-95 duration-150 pointer-events-none z-50 flex items-center gap-1.5 whitespace-nowrap">
              <Sparkles className="w-3.5 h-3.5 text-amber-400" />
              <span>{toastMessage}</span>
            </div>
          )}

          {/* Error Message Alert */}
          {audioError && (
            <div className="text-[11px] text-amber-300 bg-amber-950/80 px-3 py-1 rounded-xl border border-amber-500/30 flex items-center justify-between">
              <span>{audioError}</span>
              <button
                type="button"
                onClick={togglePlay}
                className="underline font-bold text-amber-200 hover:text-white cursor-pointer"
              >
                إعادة المحاولة
              </button>
            </div>
          )}

          {/* ROW 1: Scrubber timeline bar & Timestamps */}
          <div className="space-y-1 px-1">
            <div
              className="w-full bg-stone-800/90 hover:bg-stone-700/80 h-2 sm:h-2.5 rounded-full cursor-pointer relative group transition-all"
              onClick={(e) => {
                const rect = e.currentTarget.getBoundingClientRect();
                const clickX = e.clientX - rect.left;
                const ratio = clickX / rect.width;
                seekTo(ratio * duration);
              }}
            >
              {/* Filled gradient bar */}
              <div
                className="h-full bg-gradient-to-r from-amber-600 via-amber-500 to-amber-300 rounded-full relative transition-all"
                style={{ width: `${progressPercent}%` }}
              >
                {/* Glowing Thumb */}
                <span className="absolute left-0 top-1/2 -translate-y-1/2 -translate-x-1/2 w-3.5 h-3.5 sm:w-4 sm:h-4 bg-white border-2 border-amber-500 rounded-full shadow-[0_0_12px_rgba(245,158,11,0.9)] group-hover:scale-125 transition-transform" />
              </div>
            </div>

            {/* Timestamps & Playlist Badge */}
            <div className="flex items-center justify-between text-[11px] font-mono text-stone-400 px-0.5">
              <span className="text-amber-300 font-semibold">{formatTime(currentTime)}</span>
              
              {playlistTitle && (
                <span className="text-[10px] px-2 py-0.5 rounded-full bg-emerald-950/80 border border-emerald-500/40 text-emerald-300 font-sans font-semibold flex items-center gap-1">
                  <ListMusic className="w-3 h-3 text-emerald-400" />
                  <span>قائمة: {playlistTitle}</span>
                </span>
              )}

              <span>{duration > 0 ? formatTime(duration) : '00:00'}</span>
            </div>
          </div>

          {/* ROW 2: Collision-Free Responsive Controls */}
          <div className="flex items-center justify-between gap-2 sm:gap-4 relative">
            
            {/* ZONE 1: Surah Title & Sheikh Picker (Always compact and clearly bounded) */}
            <div className="flex items-center gap-2 sm:gap-3 min-w-0 max-w-[42%] sm:max-w-[34%] shrink-0">
              
              {/* Equalizer Visualizer */}
              <div className="w-9 h-9 sm:w-11 sm:h-11 rounded-2xl bg-amber-950/70 border border-amber-500/40 flex items-center justify-center shrink-0 shadow-xs">
                {isPlaying ? (
                  <div className="flex items-end gap-0.5 h-4">
                    <span className="w-1 bg-amber-400 rounded-full animate-bounce [animation-delay:-0.3s] h-3.5" />
                    <span className="w-1 bg-amber-300 rounded-full animate-bounce [animation-delay:-0.15s] h-4" />
                    <span className="w-1 bg-amber-500 rounded-full animate-bounce [animation-delay:-0.45s] h-2.5" />
                  </div>
                ) : (
                  <Radio className="w-4 h-4 sm:w-5 sm:h-5 text-amber-400" />
                )}
              </div>

              {/* Text metadata */}
              <div className="min-w-0 text-right">
                <div className="font-amiri text-sm sm:text-base font-bold text-white truncate leading-tight">
                  سورة {currentSurah.name}
                </div>

                <button
                  type="button"
                  onClick={() => setShowReciterModal(true)}
                  className="mt-0.5 inline-flex items-center gap-1 px-2 py-0.5 rounded-lg bg-amber-500/15 hover:bg-amber-500/25 border border-amber-500/30 text-amber-300 hover:text-white transition-all cursor-pointer text-[10px] sm:text-xs truncate max-w-full"
                  title="تغيير الشيخ والقارئ"
                >
                  <User className="w-3 h-3 text-amber-400 shrink-0" />
                  <span className="truncate">{currentReciter.name}</span>
                  <ChevronDown className="w-2.5 h-2.5 opacity-70 shrink-0" />
                </button>
              </div>

            </div>

            {/* ZONE 2: Core Playback Transport (Prev, -10s, Play/Pause, +10s, Next) */}
            <div className="flex items-center justify-center gap-1 sm:gap-2 shrink-0">
              {/* Previous Surah */}
              <button
                type="button"
                onClick={playPreviousSurah}
                className="p-1.5 sm:p-2 rounded-xl text-stone-300 hover:text-white hover:bg-stone-800 transition-colors cursor-pointer active:scale-95"
                title="السورة السابقة"
                aria-label="السورة السابقة"
              >
                <SkipForward className="w-4 h-4 sm:w-5 sm:h-5" />
              </button>

              {/* Rewind -10s (Desktop/Tablet) */}
              <button
                type="button"
                onClick={handleSkipBackward}
                className="hidden sm:flex p-1.5 sm:p-2 rounded-xl text-stone-300 hover:text-amber-200 hover:bg-stone-800 transition-colors cursor-pointer items-center gap-0.5 active:scale-95 text-xs font-mono"
                title="تراجع 10 ثوانٍ"
                aria-label="تراجع 10 ثوانٍ"
              >
                <RotateCcw className="w-4 h-4" />
                <span className="text-[9px] text-stone-400">١٠ث</span>
              </button>

              {/* MAIN LIQUID GLASS PLAY / PAUSE BUTTON */}
              <button
                type="button"
                onClick={togglePlay}
                disabled={isLoading}
                className="relative w-10 h-10 sm:w-12 sm:h-12 rounded-2xl bg-gradient-to-tr from-amber-600 via-amber-500 to-amber-400 text-stone-950 flex items-center justify-center shadow-lg shadow-amber-500/30 hover:scale-105 active:scale-95 transition-all cursor-pointer font-bold shrink-0 disabled:opacity-50 ring-2 ring-amber-400/50"
                title={isPlaying ? 'إيقاف مؤقت' : 'تشغيل التلاوة'}
                aria-label={isPlaying ? 'إيقاف مؤقت' : 'تشغيل التلاوة'}
              >
                {isPlaying && (
                  <span className="absolute inset-0 rounded-2xl bg-amber-400 animate-ping opacity-20 pointer-events-none" />
                )}
                {isLoading ? (
                  <div className="w-4 h-4 border-2 border-stone-950 border-t-transparent rounded-full animate-spin" />
                ) : isPlaying ? (
                  <Pause className="w-4 h-4 sm:w-5 sm:h-5 fill-stone-950 stroke-stone-950" />
                ) : (
                  <Play className="w-4 h-4 sm:w-5 sm:h-5 fill-stone-950 stroke-stone-950 ml-0.5" />
                )}
              </button>

              {/* Fast Forward +10s (Desktop/Tablet) */}
              <button
                type="button"
                onClick={handleSkipForward}
                className="hidden sm:flex p-1.5 sm:p-2 rounded-xl text-stone-300 hover:text-amber-200 hover:bg-stone-800 transition-colors cursor-pointer items-center gap-0.5 active:scale-95 text-xs font-mono"
                title="تقديم 10 ثوانٍ"
                aria-label="تقديم 10 ثوانٍ"
              >
                <RotateCw className="w-4 h-4" />
                <span className="text-[9px] text-stone-400">١٠ث</span>
              </button>

              {/* Next Surah */}
              <button
                type="button"
                onClick={playNextSurah}
                className="p-1.5 sm:p-2 rounded-xl text-stone-300 hover:text-white hover:bg-stone-800 transition-colors cursor-pointer active:scale-95"
                title="السورة التالية"
                aria-label="السورة التالية"
              >
                <SkipBack className="w-4 h-4 sm:w-5 sm:h-5" />
              </button>
            </div>

            {/* ZONE 3: Secondary Actions & Volume (Never overflows or collides) */}
            <div className="flex items-center gap-1 sm:gap-1.5 shrink-0">
              
              {/* Mobile Extra Menu Pill (bundles speed, timer, repeat on small screens without clutter) */}
              <div className="relative sm:hidden" ref={mobileExtraRef}>
                <button
                  type="button"
                  onClick={() => setShowMobileExtraMenu(!showMobileExtraMenu)}
                  className={`p-1.5 rounded-xl border text-stone-300 transition-colors cursor-pointer ${
                    isLooping || sleepTimerMinutes || playbackSpeed !== 1
                      ? 'bg-amber-500/25 border-amber-500/50 text-amber-300'
                      : 'border-stone-800 hover:bg-stone-800'
                  }`}
                  title="المزيد من خيارات التلاوة"
                >
                  <Sliders className="w-3.5 h-3.5" />
                </button>

                {showMobileExtraMenu && (
                  <div className="absolute bottom-full left-0 mb-3 w-48 bg-[#161820] border border-amber-500/40 rounded-2xl shadow-2xl p-2 z-50 text-right backdrop-blur-2xl space-y-2 animate-in fade-in zoom-in-95 duration-150">
                    <div className="text-[10px] font-bold text-stone-400 px-1 border-b border-stone-800 pb-1">
                      خيارات التلاوة
                    </div>

                    {/* Mobile Repeat Toggle */}
                    <button
                      type="button"
                      onClick={() => {
                        toggleLoop();
                        triggerToast(!isLooping ? 'تم تفعيل تكرار السورة' : 'تم إلغاء التكرار');
                      }}
                      className="w-full flex items-center justify-between px-2 py-1.5 rounded-xl text-xs hover:bg-stone-800"
                    >
                      <span className="flex items-center gap-1.5">
                        <Repeat className="w-3.5 h-3.5 text-amber-400" />
                        <span>تكرار السورة</span>
                      </span>
                      {isLooping && <Check className="w-3.5 h-3.5 text-amber-400" />}
                    </button>

                    {/* Mobile Speed Toggle */}
                    <div className="flex items-center justify-between px-2 py-1 text-xs">
                      <span className="text-stone-400 text-[11px]">السرعة:</span>
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
                      <span className="text-stone-400 text-[11px]">المؤقت:</span>
                      <div className="flex items-center gap-1">
                        {[null, 15, 30].map((mins) => (
                          <button
                            key={String(mins)}
                            type="button"
                            onClick={() => {
                              setSleepTimer(mins);
                              triggerToast(mins ? `مؤقت: ${mins} دقيقة` : 'إلغاء المؤقت');
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

              {/* Desktop Repeat Toggle */}
              <button
                type="button"
                onClick={() => {
                  toggleLoop();
                  triggerToast(!isLooping ? 'تم تفعيل تكرار السورة' : 'تم إلغاء التكرار');
                }}
                className={`hidden sm:flex p-1.5 sm:p-2 rounded-xl transition-all cursor-pointer ${
                  isLooping
                    ? 'bg-amber-500/25 text-amber-300 border border-amber-500/50 shadow-xs'
                    : 'text-stone-400 hover:text-white hover:bg-stone-800'
                }`}
                title={isLooping ? 'تكرار السورة: مفعل' : 'تكرار السورة: معطل'}
              >
                <Repeat className="w-4 h-4" />
              </button>

              {/* Desktop Speed Menu */}
              <div className="relative hidden sm:block" ref={speedMenuRef}>
                <button
                  type="button"
                  onClick={() => {
                    setShowSpeedMenu(!showSpeedMenu);
                    setShowSleepMenu(false);
                  }}
                  className={`flex items-center gap-0.5 px-2 py-1 rounded-xl text-[11px] font-mono font-bold transition-all cursor-pointer border ${
                    playbackSpeed !== 1
                      ? 'bg-amber-500/25 text-amber-300 border-amber-500/50 shadow-xs'
                      : 'text-stone-400 hover:text-white border-stone-800 hover:bg-stone-800'
                  }`}
                  title="تغيير سرعة التلاوة"
                >
                  <span>{playbackSpeed}x</span>
                </button>

                {showSpeedMenu && (
                  <div className="absolute bottom-full left-0 mb-3 w-32 bg-[#161820] border border-amber-500/40 rounded-2xl shadow-2xl p-1.5 z-50 text-right backdrop-blur-xl animate-in fade-in zoom-in-95 duration-150">
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
                        className={`w-full text-right px-2.5 py-1.5 rounded-xl text-xs font-mono transition-colors cursor-pointer flex items-center justify-between ${
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
                  className={`p-1.5 sm:p-2 rounded-xl transition-all cursor-pointer relative ${
                    sleepTimerMinutes
                      ? 'bg-amber-500/25 text-amber-300 border border-amber-500/50 shadow-xs'
                      : 'text-stone-400 hover:text-white hover:bg-stone-800'
                  }`}
                  title="مؤقت النوم"
                >
                  <Moon className="w-4 h-4" />
                  {sleepTimerMinutes && (
                    <span className="absolute -top-1 -right-1 text-[9px] font-mono bg-amber-500 text-stone-950 font-bold rounded-full w-4 h-4 flex items-center justify-center shadow-xs">
                      {sleepTimerMinutes}
                    </span>
                  )}
                </button>

                {showSleepMenu && (
                  <div className="absolute bottom-full left-0 mb-3 w-40 bg-[#161820] border border-amber-500/40 rounded-2xl shadow-2xl p-1.5 z-50 text-right backdrop-blur-xl animate-in fade-in zoom-in-95 duration-150">
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
                        className={`w-full text-right px-2.5 py-1.5 rounded-xl text-xs transition-colors cursor-pointer flex items-center justify-between ${
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
              <div className="hidden lg:flex items-center gap-1.5 bg-stone-900/80 border border-stone-700/60 rounded-xl px-2 py-1">
                <button
                  type="button"
                  onClick={toggleMute}
                  className="text-stone-400 hover:text-white cursor-pointer"
                  title={isMuted ? 'إلغاء الكتم' : 'كتم الصوت'}
                >
                  {isMuted || volume === 0 ? <VolumeX className="w-3.5 h-3.5" /> : <Volume2 className="w-3.5 h-3.5" />}
                </button>
                <input
                  type="range"
                  min="0"
                  max="1"
                  step="0.05"
                  value={isMuted ? 0 : volume}
                  onChange={(e) => setVolumeLevel(parseFloat(e.target.value))}
                  className="w-14 h-1 accent-amber-500 bg-stone-700 rounded-lg cursor-pointer"
                />
              </div>

              {/* Close Button */}
              <button
                type="button"
                onClick={closePlayer}
                className="p-1.5 sm:p-2 rounded-xl text-stone-400 hover:text-rose-300 hover:bg-stone-800 transition-colors cursor-pointer"
                title="إغلاق المشغل القرآني"
              >
                <X className="w-4 h-4" />
              </button>

            </div>

          </div>

        </div>
      </div>

      {/* DEDICATED RECITER SELECTOR MODAL / SHEET */}
      <ReciterSelectModal
        isOpen={showReciterModal}
        onClose={() => setShowReciterModal(false)}
        currentReciter={currentReciter}
        onSelectReciter={handleSelectNewReciter}
      />
    </>
  );
};
