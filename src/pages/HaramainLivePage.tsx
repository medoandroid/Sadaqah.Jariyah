import React, { useState, useEffect, useRef, useMemo, useCallback } from 'react';
import {
  Tv,
  Radio,
  Play,
  Pause,
  Volume2,
  VolumeX,
  Maximize2,
  RefreshCw,
  Sparkles,
  MapPin,
  Clock,
  ExternalLink,
  ShieldCheck,
  Headphones,
  AlertTriangle,
  Compass,
  Layers,
  ChevronRight,
  Wifi,
  Minimize2,
  Check,
  Sliders,
  Activity,
  Zap,
  Info
} from 'lucide-react';
import Hls from 'hls.js';
import { mp3QuranService } from '../services/mp3QuranService';
import { MP3QRadio } from '../types/mp3quran';
import { useAudio } from '../context/AudioContext';
import {
  HARAMAIN_STREAMS,
  HaramainStream,
  HARAMAIN_IMAM_RADIOS,
  HaramainImamRadio
} from '../data/haramainStreams';
import { calculatePrayerTimes, PrayerTimesResult } from '../utils/prayerTimes';

interface QualityOption {
  index: number; // -1 for auto
  label: string;
  resolution: string;
  bitrate?: number;
}

export const HaramainLivePage: React.FC = () => {
  const { playRadio, isPlaying: isGlobalAudioPlaying, currentRadio } = useAudio();

  // Selected Sanctuary: Makkah or Madinah
  const [selectedSanctuary, setSelectedSanctuary] = useState<'makkah' | 'madinah'>('makkah');
  const [activeMedium, setActiveMedium] = useState<'video' | 'audio'>('video');

  // Stream source state: 0 = primary HLS, 1 = backup chunklist, 2 = backup index, or YouTube fallback
  const [activeSourceIndex, setActiveSourceIndex] = useState<number>(0);
  const [useYoutubeFallback, setUseYoutubeFallback] = useState<boolean>(false);

  // Video player state
  const [isVideoLoading, setIsVideoLoading] = useState<boolean>(true);
  const [videoError, setVideoError] = useState<string | null>(null);
  const [isVideoPlaying, setIsVideoPlaying] = useState<boolean>(true);
  
  // Persistent volume and mute state
  const [volume, setVolume] = useState<number>(() => {
    try {
      const saved = localStorage.getItem('sadaqah_stream_volume');
      return saved ? parseFloat(saved) : 0.9;
    } catch {
      return 0.9;
    }
  });

  const [isMuted, setIsMuted] = useState<boolean>(() => {
    try {
      return localStorage.getItem('sadaqah_stream_muted') === 'true';
    } catch {
      return false;
    }
  });

  const [showUnmuteHint, setShowUnmuteHint] = useState<boolean>(false);
  const [isTheaterMode, setIsTheaterMode] = useState<boolean>(false);
  const [isPiPActive, setIsPiPActive] = useState<boolean>(false);
  const [reconnectCountdown, setReconnectCountdown] = useState<number | null>(null);
  
  // Multi-quality levels state
  const [qualityLevels, setQualityLevels] = useState<QualityOption[]>([
    { index: -1, label: 'تلقائي ذكي', resolution: 'Auto' },
    { index: 0, label: 'عالي الدقة (HD)', resolution: '720p' },
    { index: 1, label: 'موفر للبيانات', resolution: '480p' }
  ]);
  const [selectedQualityIndex, setSelectedQualityIndex] = useState<number>(-1);
  const [showQualityMenu, setShowQualityMenu] = useState<boolean>(false);

  // Live Stream Diagnostics
  const [streamBitrate, setStreamBitrate] = useState<string>('950 kbps');
  const [streamResolution, setStreamResolution] = useState<string>('1280x720 HD');
  const [showDiagnostics, setShowDiagnostics] = useState<boolean>(false);

  // Additional general Islamic radios from MP3Quran API
  const [generalRadios, setGeneralRadios] = useState<MP3QRadio[]>([]);

  // Live Clock & Prayer Times at Holy Mosques
  const [makkahTimeStr, setMakkahTimeStr] = useState<string>('');
  const [sanctuaryPrayerTimes, setSanctuaryPrayerTimes] = useState<PrayerTimesResult | null>(null);

  const videoRef = useRef<HTMLVideoElement | null>(null);
  const hlsRef = useRef<Hls | null>(null);
  const reconnectTimerRef = useRef<NodeJS.Timeout | null>(null);
  const playerContainerRef = useRef<HTMLDivElement | null>(null);
  const recoveryAttemptRef = useRef<number>(0);
  const userGestureGrantedRef = useRef<boolean>(false);

  // Current active stream details
  const activeStream: HaramainStream = useMemo(() => {
    return HARAMAIN_STREAMS.find((s) => s.slug === selectedSanctuary) || HARAMAIN_STREAMS[0];
  }, [selectedSanctuary]);

  // Available stream URLs list for current sanctuary
  const streamUrls = useMemo(() => {
    return [activeStream.primaryStreamUrl, ...activeStream.backupStreamUrls];
  }, [activeStream]);

  // Imams of the active sanctuary
  const activeSanctuaryRadios: HaramainImamRadio[] = useMemo(() => {
    return HARAMAIN_IMAM_RADIOS.filter((r) => r.mosque === selectedSanctuary);
  }, [selectedSanctuary]);

  // Compute live AST time (Makkah/Madinah UTC+3) and Mosque prayer times
  useEffect(() => {
    const updateTimes = () => {
      const now = new Date();
      const options: Intl.DateTimeFormatOptions = {
        timeZone: 'Asia/Riyadh',
        hour: '2-digit',
        minute: '2-digit',
        second: '2-digit',
        hour12: true,
      };
      setMakkahTimeStr(new Intl.DateTimeFormat('ar-SA', options).format(now));

      // Calculate prayer times for active sanctuary using Umm Al-Qura (Method 4)
      const pt = calculatePrayerTimes(
        now,
        activeStream.coordinates.lat,
        activeStream.coordinates.lng,
        3,
        4
      );
      setSanctuaryPrayerTimes(pt);
    };

    updateTimes();
    const timer = setInterval(updateTimes, 1000);
    return () => clearInterval(timer);
  }, [activeStream]);

  // Load general radio stations from MP3Quran API
  useEffect(() => {
    let isMounted = true;
    mp3QuranService.getRadios('ar').then((radios) => {
      if (!isMounted) return;
      setGeneralRadios(radios);
    }).catch(() => {});

    return () => {
      isMounted = false;
    };
  }, []);

  // When sanctuary or active source changes, reset states and reconnect
  const handleSelectSanctuary = (sanctuary: 'makkah' | 'madinah') => {
    if (sanctuary === selectedSanctuary) return;
    setSelectedSanctuary(sanctuary);
    setActiveSourceIndex(0);
    setUseYoutubeFallback(false);
    setVideoError(null);
    recoveryAttemptRef.current = 0;
    if (reconnectTimerRef.current) {
      clearInterval(reconnectTimerRef.current);
      setReconnectCountdown(null);
    }
  };

  // Auto-recovery handler
  const handleAutoRecovery = useCallback(() => {
    recoveryAttemptRef.current += 1;
    if (activeSourceIndex < streamUrls.length - 1) {
      // Try next backup stream
      setActiveSourceIndex((prev) => prev + 1);
    } else {
      // If we cycled through all HLS mirrors, start a 5s countdown
      let count = 5;
      setReconnectCountdown(count);
      if (reconnectTimerRef.current) clearInterval(reconnectTimerRef.current);
      reconnectTimerRef.current = setInterval(() => {
        count -= 1;
        if (count <= 0) {
          if (reconnectTimerRef.current) clearInterval(reconnectTimerRef.current);
          setReconnectCountdown(null);
          setActiveSourceIndex(0);
        } else {
          setReconnectCountdown(count);
        }
      }, 1000);
    }
  }, [activeSourceIndex, streamUrls.length]);

  // Setup and handle low-latency HLS Video stream
  useEffect(() => {
    if (activeMedium !== 'video' || useYoutubeFallback) {
      if (hlsRef.current) {
        hlsRef.current.destroy();
        hlsRef.current = null;
      }
      return;
    }

    const video = videoRef.current;
    if (!video) return;

    setVideoError(null);
    setIsVideoLoading(true);

    if (hlsRef.current) {
      hlsRef.current.destroy();
      hlsRef.current = null;
    }

    const currentUrl = streamUrls[activeSourceIndex] || streamUrls[0];

    if (Hls.isSupported()) {
      // High performance low-latency HLS configuration
      const hls = new Hls({
        enableWorker: true,
        lowLatencyMode: true,
        backBufferLength: 15,
        maxBufferLength: 8,
        maxMaxBufferLength: 15,
        maxBufferSize: 30 * 1000 * 1000,
        liveSyncDurationCount: 2, // Keeps stream close to live edge, preventing delay accumulation!
        liveMaxLatencyDurationCount: 4,
        liveDurationInfinity: true,
        manifestLoadingTimeOut: 8000,
        manifestLoadingMaxRetry: 4,
        levelLoadingTimeOut: 8000,
        fragLoadingTimeOut: 12000,
        startFragPrefetch: true,
        testBandwidth: true,
      });
      hlsRef.current = hls;

      hls.loadSource(currentUrl);
      hls.attachMedia(video);

      hls.on(Hls.Events.MANIFEST_PARSED, (_evt, data) => {
        setIsVideoLoading(false);
        setVideoError(null);

        // Extract available quality levels
        if (data && data.levels && data.levels.length > 0) {
          const parsedLevels: QualityOption[] = [
            { index: -1, label: 'تلقائي ذكي (Auto)', resolution: 'تلقائي' },
            ...data.levels.map((lvl, idx) => ({
              index: idx,
              label: `${lvl.height ? lvl.height + 'p' : 'جودة ' + (idx + 1)} ${lvl.bitrate ? `(${Math.round(lvl.bitrate / 1000)}k)` : ''}`,
              resolution: lvl.height ? `${lvl.height}p` : `${lvl.width}x${lvl.height}`,
              bitrate: lvl.bitrate
            }))
          ];
          setQualityLevels(parsedLevels);
          if (data.levels[0].height) {
            setStreamResolution(`${data.levels[0].width || 1280}x${data.levels[0].height || 720}`);
          }
          if (data.levels[0].bitrate) {
            setStreamBitrate(`${Math.round(data.levels[0].bitrate / 1000)} kbps`);
          }
        }

        // Apply volume
        video.volume = volume;
        video.muted = isMuted;

        // Try playing with sound first if user already interacted
        video
          .play()
          .then(() => {
            setIsVideoPlaying(true);
            setIsVideoLoading(false);
            if (!isMuted) {
              setShowUnmuteHint(false);
            }
          })
          .catch((err) => {
            if (err.name === 'NotAllowedError') {
              // Browser autoplay policy restricted unmuted playback: mute and retry so video starts immediately!
              video.muted = true;
              setIsMuted(true);
              setShowUnmuteHint(true);
              video.play().then(() => setIsVideoPlaying(true)).catch(() => setIsVideoPlaying(false));
            } else {
              setIsVideoPlaying(false);
            }
          });
      });

      hls.on(Hls.Events.LEVEL_SWITCHED, (_evt, data) => {
        const lvl = hls.levels[data.level];
        if (lvl) {
          setStreamResolution(`${lvl.width}x${lvl.height}`);
          if (lvl.bitrate) {
            setStreamBitrate(`${Math.round(lvl.bitrate / 1000)} kbps`);
          }
        }
      });

      hls.on(Hls.Events.ERROR, (_evt, data) => {
        if (data.fatal) {
          switch (data.type) {
            case Hls.ErrorTypes.NETWORK_ERROR:
              if (recoveryAttemptRef.current === 0) {
                recoveryAttemptRef.current = 1;
                hls.startLoad();
              } else {
                setVideoError('انقطع تدفق الخادم الفضائي، جاري التبديل للمرآة البديلة تلقائياً...');
                handleAutoRecovery();
              }
              break;
            case Hls.ErrorTypes.MEDIA_ERROR:
              setVideoError('معالجة عارض التدفق الصوتي والمرئي، جاري الاسترداد...');
              hls.recoverMediaError();
              break;
            default:
              setVideoError('تعذر استقبال إشارة البث الفضائي، جاري الاسترداد من الخادم الاحتياطي...');
              handleAutoRecovery();
              break;
          }
        }
      });
    } else if (video.canPlayType('application/vnd.apple.mpegurl')) {
      // iOS / Safari Native HLS
      video.src = currentUrl;
      video.volume = volume;
      video.muted = isMuted;

      const onLoaded = () => {
        setIsVideoLoading(false);
        setVideoError(null);
        video
          .play()
          .then(() => {
            setIsVideoPlaying(true);
            if (!isMuted) setShowUnmuteHint(false);
          })
          .catch((err) => {
            if (err.name === 'NotAllowedError') {
              video.muted = true;
              setIsMuted(true);
              setShowUnmuteHint(true);
              video.play().then(() => setIsVideoPlaying(true)).catch(() => setIsVideoPlaying(false));
            }
          });
      };
      const onError = () => {
        setVideoError('تعذر تحميل البث على Safari، جاري المحاولة من السيرفر البديل...');
        handleAutoRecovery();
      };
      video.addEventListener('loadedmetadata', onLoaded);
      video.addEventListener('error', onError);

      return () => {
        video.removeEventListener('loadedmetadata', onLoaded);
        video.removeEventListener('error', onError);
      };
    } else {
      setVideoError('المتصفح لا يدعم تقنية HLS، يرجى التبديل إلى بث يوتيوب الرسمي أدناه.');
      setIsVideoLoading(false);
    }

    return () => {
      if (hlsRef.current) {
        hlsRef.current.destroy();
        hlsRef.current = null;
      }
      if (reconnectTimerRef.current) {
        clearInterval(reconnectTimerRef.current);
      }
    };
  }, [activeStream, activeSourceIndex, activeMedium, useYoutubeFallback, streamUrls, handleAutoRecovery]);

  // Video play/pause toggle
  const toggleVideoPlay = () => {
    if (!videoRef.current) return;
    if (isVideoPlaying) {
      videoRef.current.pause();
      setIsVideoPlaying(false);
    } else {
      videoRef.current.play().then(() => setIsVideoPlaying(true)).catch(() => {});
    }
  };

  // Mute toggle with instant feedback and storage persistence
  const toggleMute = () => {
    if (!videoRef.current) return;
    const next = !isMuted;
    videoRef.current.muted = next;
    setIsMuted(next);
    setShowUnmuteHint(false);
    userGestureGrantedRef.current = true;
    try {
      localStorage.setItem('sadaqah_stream_muted', next ? 'true' : 'false');
    } catch {}
    if (!next) {
      videoRef.current.volume = volume;
    }
  };

  // Unmute directly from banner or gesture
  const handleUnmuteDirectly = () => {
    if (!videoRef.current) return;
    videoRef.current.muted = false;
    videoRef.current.volume = volume;
    setIsMuted(false);
    setShowUnmuteHint(false);
    userGestureGrantedRef.current = true;
    try {
      localStorage.setItem('sadaqah_stream_muted', 'false');
    } catch {}
  };

  // Volume slider change
  const handleVolumeChange = (newVol: number) => {
    if (!videoRef.current) return;
    setVolume(newVol);
    videoRef.current.volume = newVol;
    try {
      localStorage.setItem('sadaqah_stream_volume', String(newVol));
    } catch {}
    if (newVol > 0 && isMuted) {
      videoRef.current.muted = false;
      setIsMuted(false);
      setShowUnmuteHint(false);
      try {
        localStorage.setItem('sadaqah_stream_muted', 'false');
      } catch {}
    }
  };

  // Quality level selector change
  const handleSelectQuality = (qualityIdx: number) => {
    setSelectedQualityIndex(qualityIdx);
    setShowQualityMenu(false);
    if (hlsRef.current) {
      hlsRef.current.currentLevel = qualityIdx;
      if (qualityIdx === -1) {
        // Auto
        hlsRef.current.loadLevel = -1;
      }
    }
  };

  // Picture in picture support
  const handleTogglePiP = async () => {
    if (!videoRef.current) return;
    try {
      if (document.pictureInPictureElement) {
        await document.exitPictureInPicture();
        setIsPiPActive(false);
      } else if (document.pictureInPictureEnabled && videoRef.current.requestPictureInPicture) {
        await videoRef.current.requestPictureInPicture();
        setIsPiPActive(true);
      }
    } catch {
      // Ignored
    }
  };

  // Fullscreen support
  const handleFullscreen = () => {
    if (!playerContainerRef.current) return;
    if (!document.fullscreenElement) {
      playerContainerRef.current.requestFullscreen().catch(() => {});
    } else {
      document.exitFullscreen().catch(() => {});
    }
  };

  // Force manual retry with visual feedback
  const handleManualRetry = () => {
    setVideoError(null);
    setIsVideoLoading(true);
    if (reconnectTimerRef.current) clearInterval(reconnectTimerRef.current);
    setReconnectCountdown(null);
    recoveryAttemptRef.current = 0;
    setActiveSourceIndex((prev) => (prev + 1) % streamUrls.length);
  };

  // Play audio in the global floating island
  const handlePlayImamRadio = (radioItem: HaramainImamRadio | MP3QRadio) => {
    if (videoRef.current && isVideoPlaying) {
      videoRef.current.pause();
      setIsVideoPlaying(false);
    }
    const targetRadio: MP3QRadio = {
      id: radioItem.id,
      name: radioItem.name,
      url: radioItem.url,
    };
    playRadio(targetRadio);
  };

  return (
    <div
      className={`mx-auto px-3 sm:px-6 py-4 sm:py-6 space-y-6 text-right transition-all duration-300 ${
        isTheaterMode ? 'max-w-7xl' : 'max-w-5xl'
      }`}
      dir="rtl"
    >
      {/* 1. Header Banner & Identity with 3D Liquid Glass Glow */}
      <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-[#0c1a14] via-[#091510] to-[#040a08] text-white p-5 sm:p-7 shadow-[0_16px_40px_-10px_rgba(2,44,34,0.4),0_4px_16px_rgba(217,119,6,0.12)] border border-amber-500/30">
        {/* Specular top rim */}
        <div className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-amber-400/60 to-transparent pointer-events-none rounded-t-3xl" />
        
        {/* Ambient radial glow */}
        <div
          className={`absolute -top-12 -left-12 w-64 h-64 rounded-full blur-3xl opacity-20 pointer-events-none ${
            selectedSanctuary === 'makkah' ? 'bg-amber-500' : 'bg-emerald-500'
          }`}
        />

        <div className="relative z-10 flex flex-col md:flex-row items-start md:items-center justify-between gap-5">
          <div className="space-y-2 max-w-xl">
            <div className="flex flex-wrap items-center gap-2">
              <span className="w-10 h-10 rounded-2xl bg-amber-500/20 border border-amber-400/30 flex items-center justify-center text-amber-300 shadow-inner">
                <Tv className="w-5 h-5 text-amber-300" />
              </span>
              <span className="px-3 py-1 rounded-full bg-red-500/20 text-red-300 border border-red-500/35 text-xs font-bold inline-flex items-center gap-1.5 shadow-xs">
                <span className="w-2 h-2 rounded-full bg-red-500 animate-pulse shadow-[0_0_8px_rgba(239,68,68,0.8)]" />
                <span>بث حي ومباشر على مدار الساعة</span>
              </span>
              <span className="px-2.5 py-0.5 rounded-full bg-amber-500/15 text-amber-300 border border-amber-500/30 text-[11px] font-semibold flex items-center gap-1">
                <Zap className="w-3 h-3 text-amber-400" />
                <span>منخفض التأخير (Low Latency)</span>
              </span>
            </div>

            <h1 className="font-amiri text-2xl sm:text-4xl font-bold tracking-tight text-white flex items-center gap-2.5">
              <span>البث المباشر للحرمين الشريفين</span>
              <span className="text-xl sm:text-2xl">
                {selectedSanctuary === 'makkah' ? '🕋' : '🕌'}
              </span>
            </h1>

            <p className="text-stone-300 text-xs sm:text-sm font-sans leading-relaxed">
              مشاهدة مرئية فائقة الدقة وسريعة الاستجابة واستماع صوتي نقي مباشرة من رحاب الكعبة المشرفة والمسجد النبوي الشريف عبر القنوات الفضائية السعودية الرسمية وإذاعات أئمة الحرمين.
            </p>
          </div>

          {/* Mode Switcher: Video Broadcast vs Audio Radio */}
          <div className="flex items-center p-1.5 rounded-2xl bg-black/40 backdrop-blur-xl border border-white/15 shadow-inner shrink-0">
            <button
              onClick={() => {
                setActiveMedium('video');
                setUseYoutubeFallback(false);
              }}
              className={`flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                activeMedium === 'video'
                  ? 'bg-gradient-to-r from-amber-600 to-amber-500 text-stone-950 shadow-md shadow-amber-500/20 font-bold'
                  : 'text-stone-300 hover:text-white hover:bg-white/5'
              }`}
            >
              <Tv className="w-4 h-4" />
              <span>مشاهدة البث المرئي</span>
            </button>
            <button
              onClick={() => setActiveMedium('audio')}
              className={`flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                activeMedium === 'audio'
                  ? 'bg-gradient-to-r from-amber-600 to-amber-500 text-stone-950 shadow-md shadow-amber-500/20 font-bold'
                  : 'text-stone-300 hover:text-white hover:bg-white/5'
              }`}
            >
              <Headphones className="w-4 h-4" />
              <span>إذاعات أئمة الحرمين</span>
            </button>
          </div>
        </div>
      </div>

      {/* 2. Fast Mosque Switcher with 3D Depth & Pulse (Makkah vs Madinah) */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        {HARAMAIN_STREAMS.map((sanctuary) => {
          const isSelected = selectedSanctuary === sanctuary.slug;
          const isMakkah = sanctuary.slug === 'makkah';
          return (
            <button
              key={sanctuary.slug}
              onClick={() => handleSelectSanctuary(sanctuary.slug)}
              className={`p-4 sm:p-5 rounded-3xl border transition-all text-right flex items-center justify-between cursor-pointer relative overflow-hidden group ${
                isSelected
                  ? 'bg-gradient-to-br from-amber-500/15 via-white dark:via-[#091510] to-amber-500/5 dark:to-[#07130e] border-amber-500 text-stone-900 dark:text-amber-100 shadow-[0_10px_25px_-5px_rgba(217,119,6,0.18)] ring-1 ring-amber-500/30'
                  : 'bg-white/80 dark:bg-[#07130e]/80 border-stone-200/80 dark:border-stone-800 text-stone-700 dark:text-stone-300 hover:border-amber-400/50 hover:bg-white dark:hover:bg-[#091812]'
              }`}
            >
              <div className="flex items-center gap-3.5">
                <span className="text-3xl sm:text-4xl filter drop-shadow-md group-hover:scale-110 transition-transform">
                  {isMakkah ? '🕋' : '🕌'}
                </span>
                <div className="space-y-0.5">
                  <div className="flex items-center gap-2">
                    <span className="font-amiri text-base sm:text-lg font-bold block text-stone-950 dark:text-white">
                      {sanctuary.shortName}
                    </span>
                    {isSelected && (
                      <span className="px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-800 dark:text-emerald-300 text-[10px] font-bold border border-emerald-500/30 flex items-center gap-1">
                        <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                        <span>نشط الآن</span>
                      </span>
                    )}
                  </div>
                  <span className="text-xs text-stone-600 dark:text-stone-300 block font-medium">
                    {sanctuary.mosqueTitle}
                  </span>
                </div>
              </div>

              <div className="flex items-center gap-2">
                <span
                  className={`w-7 h-7 rounded-xl flex items-center justify-center transition-all ${
                    isSelected
                      ? 'bg-amber-500 text-stone-950 shadow-sm'
                      : 'bg-stone-100 dark:bg-stone-800 text-stone-400 group-hover:text-amber-600'
                  }`}
                >
                  <ChevronRight className="w-4 h-4 rotate-180" />
                </span>
              </div>
            </button>
          );
        })}
      </div>

      {/* 3. Sanctuary Live Timing & Next Prayer Bar (Real-time Umm Al-Qura) */}
      <div className="rounded-2xl p-3.5 sm:p-4 bg-white/70 dark:bg-[#07130e]/70 backdrop-blur-xl border border-stone-200/80 dark:border-amber-500/20 shadow-sm flex flex-col md:flex-row items-start md:items-center justify-between gap-3 text-xs">
        <div className="flex flex-wrap items-center gap-3">
          <div className="flex items-center gap-2 text-stone-800 dark:text-stone-200 font-semibold">
            <Clock className="w-4 h-4 text-amber-600 dark:text-amber-400 shrink-0" />
            <span>التوقيت المحلي في {activeStream.city}:</span>
            <span className="font-mono font-bold text-amber-700 dark:text-amber-300 text-sm px-2 py-0.5 rounded-lg bg-amber-500/10 border border-amber-500/20" dir="ltr">
              {makkahTimeStr || '...'}
            </span>
          </div>

          {sanctuaryPrayerTimes && (
            <div className="flex items-center gap-2 text-stone-700 dark:text-stone-300">
              <span className="text-stone-300 dark:text-stone-600 hidden sm:inline">|</span>
              <span className="font-medium">
                الصلاة القادمة بالحرم: <strong className="text-amber-700 dark:text-amber-300">{sanctuaryPrayerTimes.nextPrayer.arabicName}</strong> ({sanctuaryPrayerTimes.nextPrayer.time})
              </span>
              <span className="px-2 py-0.5 rounded-md bg-stone-100 dark:bg-stone-800 text-stone-800 dark:text-stone-200 font-mono text-[11px] font-bold">
                {sanctuaryPrayerTimes.nextPrayer.remainingFormatted}
              </span>
            </div>
          )}
        </div>

        {/* Quick Stream source badge */}
        <div className="flex items-center gap-2 text-[11px] text-stone-600 dark:text-stone-300">
          <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
          <span>المصدر: تدفق فضائي HLS مباشر (CORS OK)</span>
        </div>
      </div>

      {/* 4. MAIN CINEMA VIDEO PLAYER */}
      {activeMedium === 'video' && (
        <div
          ref={playerContainerRef}
          className={`relative rounded-3xl bg-black overflow-hidden shadow-[0_20px_50px_rgba(0,0,0,0.65)] border border-stone-800 transition-all duration-300 ${
            isTheaterMode ? 'ring-2 ring-amber-500/40' : ''
          }`}
        >
          {/* Ambient Glow behind player */}
          <div
            className={`absolute -inset-4 blur-3xl opacity-25 pointer-events-none transition-colors duration-500 ${
              selectedSanctuary === 'makkah' ? 'bg-amber-500' : 'bg-emerald-500'
            }`}
          />

          {/* Player Top Bar (Live Status & Channel Switcher) */}
          <div className="relative z-10 px-4 py-3 bg-gradient-to-b from-stone-950/95 via-stone-950/80 to-transparent flex flex-wrap items-center justify-between gap-2 border-b border-white/10">
            <div className="flex items-center gap-2">
              <span className="px-2.5 py-1 rounded-xl bg-red-600 text-white text-[11px] font-bold flex items-center gap-1.5 shadow-xs">
                <span className="w-2 h-2 rounded-full bg-white animate-pulse" />
                <span>مباشر LIVE</span>
              </span>
              <span className="font-amiri text-sm sm:text-base font-bold text-white pr-1">
                {activeStream.name}
              </span>
            </div>

            {/* Source switcher buttons */}
            <div className="flex items-center gap-1.5 text-xs">
              <span className="text-[11px] text-stone-400 ml-1 hidden sm:inline">المصدر:</span>
              
              <button
                onClick={() => {
                  setUseYoutubeFallback(false);
                  setActiveSourceIndex(0);
                }}
                className={`px-2.5 py-1 rounded-lg text-[11px] font-bold transition-all cursor-pointer ${
                  !useYoutubeFallback && activeSourceIndex === 0
                    ? 'bg-amber-600 text-white shadow-xs'
                    : 'bg-stone-800/80 text-stone-300 hover:bg-stone-700'
                }`}
                title="المصدر الفضائي المباشر الرئيسي (HLS)"
              >
                رئيسي HLS
              </button>

              <button
                onClick={() => {
                  setUseYoutubeFallback(false);
                  setActiveSourceIndex(1);
                }}
                className={`px-2.5 py-1 rounded-lg text-[11px] font-bold transition-all cursor-pointer ${
                  !useYoutubeFallback && activeSourceIndex === 1
                    ? 'bg-amber-600 text-white shadow-xs'
                    : 'bg-stone-800/80 text-stone-300 hover:bg-stone-700'
                }`}
                title="الخادم الاحتياطي المباشر"
              >
                سيرفر بديل
              </button>

              <button
                onClick={() => setUseYoutubeFallback(true)}
                className={`px-2.5 py-1 rounded-lg text-[11px] font-bold transition-all cursor-pointer flex items-center gap-1 ${
                  useYoutubeFallback
                    ? 'bg-red-600 text-white shadow-xs'
                    : 'bg-stone-800/80 text-stone-300 hover:bg-stone-700'
                }`}
                title="المشغل عبر يوتيوب الرسمي"
              >
                <span>يوتيوب الرسمي</span>
              </button>

              {/* Direct Link to YouTube Channel */}
              <a
                href={activeStream.youtubeLiveUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="p-1.5 rounded-lg bg-stone-800/80 hover:bg-stone-700 text-stone-300 hover:text-white transition-all cursor-pointer"
                title="فتح قناة البث المباشر على يوتيوب في صفحة جديدة"
              >
                <ExternalLink className="w-3.5 h-3.5" />
              </a>
            </div>
          </div>

          {/* Video Display Zone (Aspect 16:9) */}
          <div className="relative aspect-video w-full bg-black overflow-hidden flex items-center justify-center group select-none">
            {useYoutubeFallback ? (
              /* YouTube Official Live Embed Fallback */
              <div className="w-full h-full relative">
                <iframe
                  src={activeStream.youtubeEmbedUrl}
                  title={activeStream.name}
                  className="w-full h-full border-0"
                  allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
                  allowFullScreen
                />
                {/* Floating Return to Direct HLS Bar */}
                <div className="absolute top-3 left-3 z-20">
                  <button
                    onClick={() => {
                      setUseYoutubeFallback(false);
                      setActiveSourceIndex(0);
                    }}
                    className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-black/80 hover:bg-amber-600 text-white text-xs font-bold border border-white/20 backdrop-blur-md transition-all shadow-lg cursor-pointer"
                  >
                    <Tv className="w-3.5 h-3.5" />
                    <span>العودة للبث الفضائي المباشر</span>
                  </button>
                </div>
              </div>
            ) : (
              /* High Performance HLS Video */
              <>
                <video
                  ref={videoRef}
                  className="w-full h-full object-contain bg-black cursor-pointer"
                  playsInline
                  muted={isMuted}
                  crossOrigin="anonymous"
                  onClick={toggleVideoPlay}
                />

                {/* Floating Unmute Hint Pill with Animated Sound Equalizer */}
                {showUnmuteHint && isMuted && isVideoPlaying && !isVideoLoading && (
                  <button
                    onClick={handleUnmuteDirectly}
                    className="absolute top-4 left-1/2 -translate-x-1/2 z-30 px-4 py-2.5 rounded-2xl bg-amber-500 hover:bg-amber-400 text-stone-950 font-bold text-xs shadow-[0_8px_25px_rgba(245,158,11,0.4)] border border-amber-300 animate-bounce flex items-center gap-2.5 cursor-pointer transition-all active:scale-95"
                    title="انقر لتشغيل الصوت المباشر"
                  >
                    <div className="flex items-end gap-0.5 h-3.5">
                      <span className="w-0.5 bg-stone-950 rounded-full animate-bounce [animation-delay:-0.3s] h-3" />
                      <span className="w-0.5 bg-stone-950 rounded-full animate-bounce [animation-delay:-0.15s] h-3.5" />
                      <span className="w-0.5 bg-stone-950 rounded-full animate-bounce [animation-delay:-0.45s] h-2" />
                    </div>
                    <span>الصوت مكتوم تلقائياً · اضغط للاستماع المباشر 🔊</span>
                  </button>
                )}

                {/* Loading State Overlay */}
                {isVideoLoading && !videoError && (
                  <div className="absolute inset-0 bg-black/75 backdrop-blur-2xs flex flex-col items-center justify-center gap-3 text-amber-300 z-20">
                    <div className="relative">
                      <RefreshCw className="w-10 h-10 animate-spin text-amber-400" />
                      <span className="absolute inset-0 flex items-center justify-center text-xs">🕋</span>
                    </div>
                    <div className="text-center space-y-1">
                      <span className="text-sm font-bold font-sans block text-white">
                        جاري تهيئة البث المباشر لـ {activeStream.shortName}...
                      </span>
                      <span className="text-xs text-amber-300/80">
                        مزامنة التدفق الفضائي المعتمد قليل التأخير
                      </span>
                    </div>
                  </div>
                )}

                {/* Stream Diagnostics Panel Overlay */}
                {showDiagnostics && (
                  <div className="absolute top-3 right-3 z-30 bg-black/85 backdrop-blur-md p-3 rounded-2xl border border-white/20 text-right text-xs text-stone-300 space-y-1.5 shadow-xl animate-in fade-in duration-150 min-w-[200px]">
                    <div className="flex items-center justify-between border-b border-white/10 pb-1 font-bold text-amber-300">
                      <span>بيانات التدفق الحي</span>
                      <Activity className="w-3.5 h-3.5" />
                    </div>
                    <div className="flex justify-between">
                      <span className="text-stone-400">الدقة الحالية:</span>
                      <span className="font-mono text-white">{streamResolution}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-stone-400">معدل البث:</span>
                      <span className="font-mono text-white">{streamBitrate}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-stone-400">زمن التأخير:</span>
                      <span className="text-emerald-400 font-semibold">أقل من ثانيتين</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-stone-400">حالة الخادم:</span>
                      <span className="text-emerald-400 font-semibold">متصل 200 OK</span>
                    </div>
                  </div>
                )}

                {/* Intelligent Error & Recovery Overlay */}
                {videoError && (
                  <div className="absolute inset-0 bg-stone-950/90 backdrop-blur-md flex flex-col items-center justify-center gap-4 text-white z-20 p-6 text-center animate-in fade-in duration-200">
                    <div className="w-12 h-12 rounded-2xl bg-amber-500/15 border border-amber-500/30 flex items-center justify-center text-amber-400">
                      <AlertTriangle className="w-6 h-6" />
                    </div>

                    <div className="space-y-1.5 max-w-md">
                      <h3 className="font-amiri text-lg font-bold text-amber-300">
                        تنبيه استقرار تدفق البث
                      </h3>
                      <p className="text-xs text-stone-300 leading-relaxed font-sans">
                        {videoError}
                      </p>
                      {reconnectCountdown !== null && (
                        <p className="text-xs text-amber-400 font-bold">
                          إعادة الاتصال التلقائي خلال {reconnectCountdown} ثوانٍ...
                        </p>
                      )}
                    </div>

                    <div className="flex flex-wrap items-center justify-center gap-2 pt-2">
                      <button
                        onClick={handleManualRetry}
                        className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-amber-600 hover:bg-amber-500 text-white font-bold text-xs cursor-pointer shadow-md transition-all active:scale-95"
                      >
                        <RefreshCw className="w-3.5 h-3.5" />
                        <span>إعادة الاتصال الآن</span>
                      </button>

                      <button
                        onClick={() => {
                          setVideoError(null);
                          setActiveSourceIndex((prev) => (prev + 1) % streamUrls.length);
                        }}
                        className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-stone-800 hover:bg-stone-700 text-stone-200 font-bold text-xs cursor-pointer border border-stone-700"
                      >
                        <Layers className="w-3.5 h-3.5 text-amber-400" />
                        <span>تجربة سيرفر بديل</span>
                      </button>

                      <button
                        onClick={() => setUseYoutubeFallback(true)}
                        className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-red-600 hover:bg-red-500 text-white font-bold text-xs cursor-pointer"
                      >
                        <Tv className="w-3.5 h-3.5" />
                        <span>البث عبر يوتيوب</span>
                      </button>

                      <button
                        onClick={() => {
                          setActiveMedium('audio');
                          handlePlayImamRadio(activeSanctuaryRadios[0]);
                        }}
                        className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-emerald-700 hover:bg-emerald-600 text-white font-bold text-xs cursor-pointer"
                      >
                        <Headphones className="w-3.5 h-3.5" />
                        <span>التحويل للصوت فقط</span>
                      </button>
                    </div>
                  </div>
                )}

                {/* Control Bar Overlay (Liquid Glass Bottom Bar) */}
                <div className="absolute inset-x-0 bottom-0 p-3 sm:p-4 bg-gradient-to-t from-black/95 via-black/60 to-transparent flex items-center justify-between text-white z-20 opacity-90 group-hover:opacity-100 transition-opacity">
                  {/* Left Controls: Play, Volume, Sanctuary title */}
                  <div className="flex items-center gap-2 sm:gap-3">
                    <button
                      onClick={toggleVideoPlay}
                      className="p-2 sm:p-2.5 rounded-xl bg-white/20 hover:bg-amber-500 hover:text-stone-950 text-white transition-all cursor-pointer shadow-md active:scale-95"
                      title={isVideoPlaying ? 'إيقاف مؤقت' : 'تشغيل البث'}
                      aria-label="تشغيل أو إيقاف"
                    >
                      {isVideoPlaying ? <Pause className="w-4 h-4" /> : <Play className="w-4 h-4 fill-current" />}
                    </button>

                    {/* Volume Mute & Slider with Percentage Indicator */}
                    <div className="flex items-center gap-1.5 bg-white/10 backdrop-blur-md px-2.5 py-1 rounded-xl">
                      <button
                        onClick={toggleMute}
                        className="p-1 rounded-lg text-stone-300 hover:text-white transition cursor-pointer"
                        title={isMuted ? 'إلغاء كتم الصوت' : 'كتم الصوت'}
                      >
                        {isMuted || volume === 0 ? <VolumeX className="w-4 h-4 text-red-400" /> : <Volume2 className="w-4 h-4" />}
                      </button>
                      <input
                        type="range"
                        min="0"
                        max="1"
                        step="0.05"
                        value={isMuted ? 0 : volume}
                        onChange={(e) => handleVolumeChange(parseFloat(e.target.value))}
                        className="w-14 sm:w-20 accent-amber-500 h-1.5 rounded-lg bg-stone-700 cursor-pointer hidden xs:block"
                        title={`مستوى الصوت: ${Math.round((isMuted ? 0 : volume) * 100)}%`}
                      />
                      <span className="text-[10px] font-mono text-stone-300 hidden sm:inline tabular-nums">
                        {Math.round((isMuted ? 0 : volume) * 100)}%
                      </span>
                    </div>

                    <div className="hidden md:flex items-center gap-2 text-xs font-semibold text-stone-200">
                      <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
                      <span>{activeStream.shortName}</span>
                    </div>
                  </div>

                  {/* Right Controls: Quality Menu, Diagnostics, Retry, PiP, Theater, Fullscreen */}
                  <div className="flex items-center gap-1.5 sm:gap-2">
                    
                    {/* Quality Selector Dropdown Menu */}
                    <div className="relative">
                      <button
                        onClick={() => setShowQualityMenu(!showQualityMenu)}
                        className="px-2.5 py-1.5 rounded-xl bg-white/15 hover:bg-white/25 text-white text-xs font-bold transition flex items-center gap-1 cursor-pointer"
                        title="اختيار جودة البث"
                      >
                        <Sliders className="w-3.5 h-3.5 text-amber-400" />
                        <span className="text-[11px]">
                          {selectedQualityIndex === -1 ? 'تلقائي' : qualityLevels.find(q => q.index === selectedQualityIndex)?.resolution || 'HD'}
                        </span>
                      </button>

                      {showQualityMenu && (
                        <div className="absolute bottom-full left-0 mb-2 w-44 bg-stone-900/95 backdrop-blur-xl border border-amber-500/40 rounded-2xl shadow-2xl p-1.5 z-50 text-right space-y-1 animate-in fade-in zoom-in-95 duration-150">
                          <div className="text-[10px] font-bold text-stone-400 px-2 py-1 border-b border-stone-800">
                            جودة البث وسرعة الاتصال:
                          </div>
                          {qualityLevels.map((lvl) => (
                            <button
                              key={lvl.index}
                              onClick={() => handleSelectQuality(lvl.index)}
                              className={`w-full flex items-center justify-between px-2.5 py-1.5 rounded-xl text-xs transition cursor-pointer ${
                                selectedQualityIndex === lvl.index
                                  ? 'bg-amber-600 text-white font-bold'
                                  : 'text-stone-300 hover:bg-white/10'
                              }`}
                            >
                              <span>{lvl.label}</span>
                              {selectedQualityIndex === lvl.index && (
                                <Check className="w-3.5 h-3.5" />
                              )}
                            </button>
                          ))}
                        </div>
                      )}
                    </div>

                    {/* Diagnostics toggle */}
                    <button
                      onClick={() => setShowDiagnostics(!showDiagnostics)}
                      className={`p-2 rounded-xl transition cursor-pointer hidden sm:block ${
                        showDiagnostics ? 'bg-amber-600 text-white' : 'bg-white/15 hover:bg-white/25 text-white'
                      }`}
                      title="بيانات ومعلومات الاتصال"
                    >
                      <Activity className="w-4 h-4" />
                    </button>

                    <button
                      onClick={handleManualRetry}
                      className="p-2 rounded-xl bg-white/15 hover:bg-white/25 text-white transition cursor-pointer"
                      title="تحديث وتنشيط البث"
                    >
                      <RefreshCw className="w-4 h-4" />
                    </button>

                    {document.pictureInPictureEnabled && (
                      <button
                        onClick={handleTogglePiP}
                        className={`p-2 rounded-xl transition cursor-pointer ${
                          isPiPActive ? 'bg-amber-600 text-white' : 'bg-white/15 hover:bg-white/25 text-white'
                        }`}
                        title="نافذة عائمة (Picture in Picture)"
                      >
                        <Layers className="w-4 h-4" />
                      </button>
                    )}

                    <button
                      onClick={() => setIsTheaterMode(!isTheaterMode)}
                      className={`p-2 rounded-xl transition cursor-pointer hidden sm:block ${
                        isTheaterMode ? 'bg-amber-600 text-white' : 'bg-white/15 hover:bg-white/25 text-white'
                      }`}
                      title={isTheaterMode ? 'الخروج من وضع السينما' : 'وضع السينما الموسع'}
                    >
                      {isTheaterMode ? <Minimize2 className="w-4 h-4" /> : <Compass className="w-4 h-4" />}
                    </button>

                    <button
                      onClick={handleFullscreen}
                      className="p-2 rounded-xl bg-white/15 hover:bg-white/25 text-white transition cursor-pointer"
                      title="ملء الشاشة الكاملة"
                    >
                      <Maximize2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              </>
            )}
          </div>
        </div>
      )}

      {/* 5. Direct Audio Stream & Islamic Radio Mode */}
      {activeMedium === 'audio' && (
        <div className="space-y-4 animate-in fade-in duration-200">
          {/* Audio Mode Hero */}
          <div className="p-5 rounded-3xl bg-gradient-to-br from-amber-500/15 via-white dark:via-[#091510] to-emerald-500/10 border border-amber-500/30 text-right space-y-3 shadow-md">
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
              <div className="space-y-1">
                <span className="text-xs font-bold text-amber-700 dark:text-amber-400 block">
                  إذاعات أئمة {activeStream.shortName}
                </span>
                <h3 className="font-amiri text-xl font-bold text-stone-900 dark:text-white">
                  {activeStream.audioRadioName}
                </h3>
                <p className="text-xs text-stone-600 dark:text-stone-300 font-sans">
                  استماع صوتي مباشر ومستمر عالي النقاء، يعمل بسلاسة في الخلفية عبر المشغل العائم أثناء قراءة المصحف أو تصفح الأذكار.
                </p>
              </div>

              <button
                onClick={() => handlePlayImamRadio(activeSanctuaryRadios[0])}
                className="px-5 py-2.5 rounded-2xl bg-gradient-to-r from-amber-600 to-amber-500 hover:from-amber-500 hover:to-amber-400 text-stone-950 font-bold text-xs transition-all shadow-md flex items-center gap-2 cursor-pointer shrink-0 active:scale-95"
              >
                <Play className="w-4 h-4 fill-stone-950" />
                <span>تشغيل إذاعة الحرم الآن</span>
              </button>
            </div>
          </div>

          {/* Featured Sanctuary Imams Radios */}
          <div className="space-y-2">
            <h4 className="font-amiri text-base font-bold text-stone-900 dark:text-stone-100 pr-1 flex items-center gap-2">
              <Sparkles className="w-4 h-4 text-amber-600 dark:text-amber-400" />
              <span>إذاعات أئمة الحرم المعتمدة في {activeStream.city}:</span>
            </h4>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
              {activeSanctuaryRadios.map((imamRadio) => {
                const isSelected = currentRadio?.url === imamRadio.url;
                return (
                  <div
                    key={imamRadio.id}
                    className={`p-4 rounded-2xl border transition-all flex items-center justify-between gap-3 ${
                      isSelected
                        ? 'bg-amber-500/15 dark:bg-amber-950/40 border-amber-500 shadow-md ring-1 ring-amber-500/30'
                        : 'bg-white dark:bg-[#07130e] border-stone-200 dark:border-stone-800 hover:border-amber-400'
                    }`}
                  >
                    <div className="flex items-center gap-3 min-w-0">
                      <span className="w-10 h-10 rounded-2xl bg-amber-500/20 text-amber-700 dark:text-amber-300 flex items-center justify-center shrink-0">
                        <Radio className="w-5 h-5" />
                      </span>
                      <div className="min-w-0">
                        <span className="text-xs sm:text-sm font-bold text-stone-900 dark:text-stone-100 block truncate">
                          {imamRadio.name}
                        </span>
                        <span className="text-[10px] text-amber-700 dark:text-amber-400 font-semibold block truncate">
                          {imamRadio.role}
                        </span>
                      </div>
                    </div>

                    <button
                      onClick={() => handlePlayImamRadio(imamRadio)}
                      className={`px-3.5 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer shrink-0 flex items-center gap-1.5 active:scale-95 ${
                        isSelected && isGlobalAudioPlaying
                          ? 'bg-emerald-600 text-white'
                          : 'bg-amber-600 hover:bg-amber-500 text-white'
                      }`}
                    >
                      {isSelected && isGlobalAudioPlaying ? (
                        <>
                          <span className="w-2 h-2 rounded-full bg-white animate-pulse" />
                          <span>يعمل</span>
                        </>
                      ) : (
                        <>
                          <Play className="w-3.5 h-3.5 fill-current" />
                          <span>استماع</span>
                        </>
                      )}
                    </button>
                  </div>
                );
              })}
            </div>
          </div>

          {/* All Imams of Both Sanctuaries */}
          <div className="space-y-2 pt-2">
            <h4 className="font-amiri text-base font-bold text-stone-900 dark:text-stone-100 pr-1 flex items-center gap-2">
              <Radio className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
              <span>إذاعات أئمة الحرم الآخر وجميع التلاوات:</span>
            </h4>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
              {HARAMAIN_IMAM_RADIOS.filter((r) => r.mosque !== selectedSanctuary).map((imamRadio) => {
                const isSelected = currentRadio?.url === imamRadio.url;
                return (
                  <div
                    key={imamRadio.id}
                    className={`p-4 rounded-2xl border transition-all flex items-center justify-between gap-3 ${
                      isSelected
                        ? 'bg-amber-500/15 dark:bg-amber-950/40 border-amber-500 shadow-md ring-1 ring-amber-500/30'
                        : 'bg-white dark:bg-[#07130e] border-stone-200 dark:border-stone-800 hover:border-amber-400'
                    }`}
                  >
                    <div className="flex items-center gap-3 min-w-0">
                      <span className="w-10 h-10 rounded-2xl bg-stone-100 dark:bg-stone-800 text-stone-600 dark:text-stone-300 flex items-center justify-center shrink-0">
                        <Radio className="w-4 h-4" />
                      </span>
                      <div className="min-w-0">
                        <span className="text-xs sm:text-sm font-bold text-stone-900 dark:text-stone-100 block truncate">
                          {imamRadio.name}
                        </span>
                        <span className="text-[10px] text-stone-600 dark:text-stone-300 font-medium block truncate">
                          {imamRadio.role}
                        </span>
                      </div>
                    </div>

                    <button
                      onClick={() => handlePlayImamRadio(imamRadio)}
                      className="px-3.5 py-1.5 rounded-xl bg-stone-100 dark:bg-stone-800 hover:bg-amber-600 hover:text-white text-stone-700 dark:text-stone-300 font-bold text-xs transition cursor-pointer shrink-0 flex items-center gap-1.5"
                    >
                      <Play className="w-3.5 h-3.5 fill-current" />
                      <span>تشغيل</span>
                    </button>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      )}

      {/* 6. Sanctuary Spiritual Virtues & Landmarks Details */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {/* Spiritual Hadith Card */}
        <div className="md:col-span-2 rounded-3xl p-5 sm:p-6 bg-gradient-to-br from-amber-500/10 via-white dark:via-[#07130e] to-stone-50 dark:to-[#040e09] border border-amber-500/25 shadow-sm space-y-3">
          <div className="flex items-center gap-2 text-amber-700 dark:text-amber-400">
            <Sparkles className="w-4 h-4" />
            <span className="font-bold text-xs">فضل الصلاة في {activeStream.shortName}</span>
          </div>

          <blockquote className="font-amiri text-base sm:text-lg font-bold text-stone-900 dark:text-amber-100 leading-relaxed border-r-2 border-amber-500 pr-3">
            {activeStream.spiritualVirtue}
          </blockquote>

          <p className="text-xs text-stone-600 dark:text-stone-300 font-sans leading-relaxed">
            {activeStream.description}
          </p>

          {/* Holy Imams Tag List */}
          <div className="pt-2">
            <span className="text-[11px] font-bold text-stone-700 dark:text-stone-300 block mb-1.5">
              من أئمة وخطباء {activeStream.shortName}:
            </span>
            <div className="flex flex-wrap gap-1.5">
              {activeStream.imams.map((imam, i) => (
                <span
                  key={i}
                  className="px-2.5 py-1 rounded-xl bg-stone-150 dark:bg-stone-850 text-stone-800 dark:text-stone-200 text-[11px] font-medium border border-stone-200 dark:border-stone-750"
                >
                  {imam}
                </span>
              ))}
            </div>
          </div>
        </div>

        {/* Landmarks Card */}
        <div className="rounded-3xl p-5 sm:p-6 bg-white dark:bg-[#07130e] border border-stone-200/80 dark:border-stone-800 shadow-sm space-y-3">
          <div className="flex items-center gap-2 text-emerald-700 dark:text-emerald-400 font-bold text-xs">
            <MapPin className="w-4 h-4" />
            <span>معالم {activeStream.city} المباركة</span>
          </div>

          <ul className="space-y-2 text-xs text-stone-700 dark:text-stone-300 font-medium">
            {activeStream.landmarks.map((landmark, idx) => (
              <li key={idx} className="flex items-center gap-2">
                <span className="w-1.5 h-1.5 rounded-full bg-amber-500 shrink-0" />
                <span>{landmark}</span>
              </li>
            ))}
          </ul>
        </div>
      </div>

      {/* 7. Mosque Prayer Times Table */}
      {sanctuaryPrayerTimes && (
        <div className="rounded-3xl p-4 sm:p-5 bg-white/80 dark:bg-[#07130e]/80 backdrop-blur-xl border border-stone-200/80 dark:border-amber-500/20 shadow-sm space-y-3">
          <div className="flex items-center justify-between border-b border-stone-200/60 dark:border-stone-800 pb-2.5">
            <div className="flex items-center gap-2">
              <Clock className="w-4 h-4 text-amber-600 dark:text-amber-400" />
              <span className="font-amiri text-sm sm:text-base font-bold text-stone-900 dark:text-stone-100">
                مواقيت الصلاة اليوم في {activeStream.shortName} (تقويم أم القرى)
              </span>
            </div>
            <span className="text-[11px] text-stone-600 dark:text-stone-300 font-medium">توقيت مكة المكرمة (UTC+3)</span>
          </div>

          <div className="grid grid-cols-3 sm:grid-cols-6 gap-2 text-center">
            {[
              { name: 'الفجر', time: sanctuaryPrayerTimes.fajr, id: 'fajr' },
              { name: 'الشروق', time: sanctuaryPrayerTimes.sunrise, id: 'sunrise' },
              { name: 'الظهر', time: sanctuaryPrayerTimes.dhuhr, id: 'dhuhr' },
              { name: 'العصر', time: sanctuaryPrayerTimes.asr, id: 'asr' },
              { name: 'المغرب', time: sanctuaryPrayerTimes.maghrib, id: 'maghrib' },
              { name: 'العشاء', time: sanctuaryPrayerTimes.isha, id: 'isha' },
            ].map((p) => {
              const isNext = sanctuaryPrayerTimes.nextPrayer.id === p.id;
              return (
                <div
                  key={p.id}
                  className={`p-2.5 rounded-2xl border transition-all ${
                    isNext
                      ? 'bg-amber-500/15 border-amber-500/50 shadow-xs ring-1 ring-amber-500/30'
                      : 'bg-stone-50 dark:bg-stone-900/50 border-stone-200/60 dark:border-stone-800'
                  }`}
                >
                  <span className={`text-[11px] font-bold block ${isNext ? 'text-amber-700 dark:text-amber-300' : 'text-stone-600 dark:text-stone-300'}`}>
                    {p.name}
                  </span>
                  <span className={`text-xs sm:text-sm font-mono font-bold mt-0.5 block ${isNext ? 'text-amber-800 dark:text-amber-200' : 'text-stone-900 dark:text-stone-100'}`}>
                    {p.time}
                  </span>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* 8. Trust & Reliability Footnote */}
      <div className="p-4 rounded-2xl bg-stone-100/70 dark:bg-stone-900/60 border border-stone-200/80 dark:border-stone-800 text-xs text-stone-700 dark:text-stone-300 text-center flex flex-wrap items-center justify-center gap-2">
        <ShieldCheck className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
        <span className="font-medium">
          هذا البث موصول بالخوادم الفضائية المعتمدة لقناتي القرآن الكريم والسنة النبوية بإشراف هيئة الإذاعة والتلفزيون بالمملكة العربية السعودية لخدمة المسلمين في كل مكان.
        </span>
      </div>
    </div>
  );
};
