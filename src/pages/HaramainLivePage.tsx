import React, { useState, useEffect, useRef } from 'react';
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
  Headphones
} from 'lucide-react';
import Hls from 'hls.js';
import { mp3QuranService } from '../services/mp3QuranService';
import { MP3QLiveTV, MP3QRadio } from '../types/mp3quran';
import { useAudio } from '../context/AudioContext';

export const HaramainLivePage: React.FC = () => {
  const { playRadio } = useAudio();
  const [activeMedium, setActiveMedium] = useState<'video' | 'audio'>('video');
  const [selectedSanctuary, setSelectedSanctuary] = useState<'makkah' | 'madinah'>('makkah');

  // Video TV channels from MP3Quran API
  const [tvChannels, setTvChannels] = useState<MP3QLiveTV[]>([]);
  const [selectedChannel, setSelectedChannel] = useState<MP3QLiveTV | null>(null);
  const [isVideoLoading, setIsVideoLoading] = useState<boolean>(true);
  const [videoError, setVideoError] = useState<string | null>(null);
  const [isVideoPlaying, setIsVideoPlaying] = useState<boolean>(true);
  const [isMuted, setIsMuted] = useState<boolean>(false);

  // Audio Radio streams from MP3Quran API
  const [radioStations, setRadioStations] = useState<MP3QRadio[]>([]);
  const [selectedRadio, setSelectedRadio] = useState<MP3QRadio | null>(null);

  const videoRef = useRef<HTMLVideoElement | null>(null);
  const hlsRef = useRef<Hls | null>(null);

  // Load live TV channels and radio stations from MP3Quran API
  useEffect(() => {
    let isMounted = true;
    mp3QuranService.getLiveTV('ar').then((channels) => {
      if (!isMounted) return;
      setTvChannels(channels);
      // Default to Makkah channel or first channel
      const makkah = channels.find((c) => c.name.includes('مكة') || c.id === 3) || channels[0] || null;
      setSelectedChannel(makkah);
    }).catch(() => {});

    mp3QuranService.getRadios('ar').then((radios) => {
      if (!isMounted) return;
      setRadioStations(radios);
      const haramRadio = radios.find((r) => r.name.includes('الحرم') || r.name.includes('مكة')) || radios[0] || null;
      setSelectedRadio(haramRadio);
    }).catch(() => {});

    return () => {
      isMounted = false;
    };
  }, []);

  // Update selected channel when sanctuary changes
  const handleSelectSanctuary = (sanctuary: 'makkah' | 'madinah') => {
    setSelectedSanctuary(sanctuary);
    if (tvChannels.length > 0) {
      if (sanctuary === 'makkah') {
        const found = tvChannels.find((c) => c.name.includes('مكة') || c.id === 3) || tvChannels[0];
        setSelectedChannel(found);
      } else {
        const found = tvChannels.find((c) => c.name.includes('المدينة') || c.id === 4) || tvChannels[1] || tvChannels[0];
        setSelectedChannel(found);
      }
    }
  };

  // Setup HLS Video player
  useEffect(() => {
    if (activeMedium !== 'video' || !selectedChannel || !videoRef.current) return;

    const video = videoRef.current;
    setVideoError(null);
    setIsVideoLoading(true);

    if (hlsRef.current) {
      hlsRef.current.destroy();
      hlsRef.current = null;
    }

    const streamUrl = selectedChannel.url;

    if (Hls.isSupported()) {
      const hls = new Hls({
        enableWorker: true,
        lowLatencyMode: true,
        backBufferLength: 60,
      });
      hlsRef.current = hls;

      hls.loadSource(streamUrl);
      hls.attachMedia(video);

      hls.on(Hls.Events.MANIFEST_PARSED, () => {
        setIsVideoLoading(false);
        video.play().then(() => setIsVideoPlaying(true)).catch(() => setIsVideoPlaying(false));
      });

      hls.on(Hls.Events.ERROR, (_evt, data) => {
        if (data.fatal) {
          switch (data.type) {
            case Hls.ErrorTypes.NETWORK_ERROR:
              setVideoError('انقطع الاتصال بالبث المباشر. جاري المحاولة الذكية تلقائياً...');
              hls.startLoad();
              break;
            case Hls.ErrorTypes.MEDIA_ERROR:
              setVideoError('جاري استرجاع تدفق الفيديو...');
              hls.recoverMediaError();
              break;
            default:
              setVideoError('تعذر استلام البث المباشر حالياً.');
              hls.destroy();
              break;
          }
        }
      });
    } else if (video.canPlayType('application/vnd.apple.mpegurl')) {
      // Safari / iOS HLS
      video.src = streamUrl;
      video.addEventListener('loadedmetadata', () => {
        setIsVideoLoading(false);
        video.play().then(() => setIsVideoPlaying(true)).catch(() => setIsVideoPlaying(false));
      });
    } else {
      setVideoError('المتصفح لا يدعم تنسيق بث HLS مباشرة.');
      setIsVideoLoading(false);
    }

    return () => {
      if (hlsRef.current) {
        hlsRef.current.destroy();
        hlsRef.current = null;
      }
    };
  }, [selectedChannel, activeMedium]);

  const toggleVideoPlay = () => {
    if (!videoRef.current) return;
    if (isVideoPlaying) {
      videoRef.current.pause();
      setIsVideoPlaying(false);
    } else {
      videoRef.current.play().then(() => setIsVideoPlaying(true)).catch(() => {});
    }
  };

  const toggleMute = () => {
    if (!videoRef.current) return;
    const next = !isMuted;
    videoRef.current.muted = next;
    setIsMuted(next);
  };

  const handleFullscreen = () => {
    if (!videoRef.current) return;
    if (videoRef.current.requestFullscreen) {
      videoRef.current.requestFullscreen();
    }
  };

  const handleRetryVideo = () => {
    if (selectedChannel) {
      const cur = selectedChannel;
      setSelectedChannel(null);
      setTimeout(() => setSelectedChannel(cur), 50);
    }
  };

  // Play audio radio in global audio bar
  const handlePlayAudioRadio = (radio: MP3QRadio) => {
    setSelectedRadio(radio);
    playRadio(radio);
  };

  return (
    <div className="max-w-5xl mx-auto px-3 sm:px-6 py-4 sm:py-6 space-y-6 text-right animate-in fade-in duration-200" dir="rtl">
      
      {/* Banner */}
      <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-amber-700 via-stone-900 to-black text-white p-6 sm:p-8 shadow-xl border border-amber-600/30">
        <div className="relative z-10 flex flex-col md:flex-row items-start md:items-center justify-between gap-5">
          <div className="space-y-2 max-w-xl">
            <div className="flex items-center gap-2">
              <span className="w-10 h-10 rounded-2xl bg-amber-500/20 border border-amber-400/30 flex items-center justify-center text-amber-300">
                <Tv className="w-5 h-5" />
              </span>
              <span className="px-3 py-1 rounded-full bg-red-500/20 text-red-300 border border-red-500/30 text-xs font-bold inline-flex items-center gap-1.5">
                <span className="w-2 h-2 rounded-full bg-red-500 animate-pulse" />
                <span>بث حي ومباشر على مدار الساعة</span>
              </span>
            </div>
            <h1 className="font-amiri text-3xl sm:text-4xl font-bold tracking-tight text-white">
              البث المباشر للحرمين الشريفين
            </h1>
            <p className="text-stone-300 text-xs sm:text-sm font-sans leading-relaxed">
              مشاهدة حية واستماع صوتي مباشر من المسجد الحرام بمكة المكرمة والمسجد النبوي الشريف بالمدينة المنورة عبر المصادر الرسمية.
            </p>
          </div>

          {/* Mode Switcher: Video vs Audio */}
          <div className="flex items-center p-1.5 rounded-2xl bg-white/10 backdrop-blur-md border border-white/20">
            <button
              onClick={() => setActiveMedium('video')}
              className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                activeMedium === 'video'
                  ? 'bg-amber-600 text-white shadow-xs'
                  : 'text-stone-300 hover:text-white'
              }`}
            >
              <Tv className="w-4 h-4" />
              <span>بث مرئي (فيديو)</span>
            </button>
            <button
              onClick={() => setActiveMedium('audio')}
              className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                activeMedium === 'audio'
                  ? 'bg-amber-600 text-white shadow-xs'
                  : 'text-stone-300 hover:text-white'
              }`}
            >
              <Headphones className="w-4 h-4" />
              <span>استماع صوتي (إذاعة)</span>
            </button>
          </div>
        </div>
      </div>

      {/* Sanctuary Switcher: Makkah vs Madinah */}
      <div className="grid grid-cols-2 gap-3">
        <button
          onClick={() => handleSelectSanctuary('makkah')}
          className={`p-4 rounded-2xl border transition-all text-right flex items-center justify-between cursor-pointer ${
            selectedSanctuary === 'makkah'
              ? 'bg-amber-500/15 dark:bg-amber-950/40 border-amber-500 text-amber-950 dark:text-amber-200 font-bold shadow-md'
              : 'bg-white dark:bg-stone-900 border-stone-200 dark:border-stone-800 text-stone-700 dark:text-stone-300 hover:bg-stone-50'
          }`}
        >
          <div className="flex items-center gap-3">
            <span className="text-2xl">🕋</span>
            <div>
              <span className="text-sm sm:text-base font-bold block">المسجد الحرام · مكة المكرمة</span>
              <span className="text-xs text-stone-600 dark:text-stone-300 font-medium">الكعبة المشرفة وصحن الطواف</span>
            </div>
          </div>
          {selectedSanctuary === 'makkah' && (
            <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse" />
          )}
        </button>

        <button
          onClick={() => handleSelectSanctuary('madinah')}
          className={`p-4 rounded-2xl border transition-all text-right flex items-center justify-between cursor-pointer ${
            selectedSanctuary === 'madinah'
              ? 'bg-amber-500/15 dark:bg-amber-950/40 border-amber-500 text-amber-950 dark:text-amber-200 font-bold shadow-md'
              : 'bg-white dark:bg-stone-900 border-stone-200 dark:border-stone-800 text-stone-700 dark:text-stone-300 hover:bg-stone-50'
          }`}
        >
          <div className="flex items-center gap-3">
            <span className="text-2xl">🕌</span>
            <div>
              <span className="text-sm sm:text-base font-bold block">المسجد النبوي · المدينة المنورة</span>
              <span className="text-xs text-stone-600 dark:text-stone-300 font-medium">الروضة الشريفة والقبة الخضراء</span>
            </div>
          </div>
          {selectedSanctuary === 'madinah' && (
            <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse" />
          )}
        </button>
      </div>

      {/* Main Content: Video Stream */}
      {activeMedium === 'video' && (
        <div className="rounded-3xl bg-stone-950 border border-stone-800 overflow-hidden shadow-2xl space-y-0">
          
          {/* Channels Selection Bar */}
          <div className="p-3 bg-stone-900 border-b border-stone-800 flex items-center gap-2 overflow-x-auto">
            <span className="text-xs text-stone-400 font-bold ml-2 shrink-0">القنوات المتاحة:</span>
            {tvChannels.map((c) => {
              const isSelected = selectedChannel?.id === c.id;
              return (
                <button
                  key={c.id}
                  onClick={() => setSelectedChannel(c)}
                  className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer flex items-center gap-2 shrink-0 ${
                    isSelected
                      ? 'bg-amber-600 text-white shadow-xs'
                      : 'bg-stone-800 text-stone-300 hover:bg-stone-750 border border-stone-700'
                  }`}
                >
                  <Radio className="w-3.5 h-3.5" />
                  <span>{c.name}</span>
                  {isSelected && <span className="w-2 h-2 rounded-full bg-red-400 animate-pulse" />}
                </button>
              );
            })}
          </div>

          {/* Video Player Display */}
          <div className="relative aspect-video bg-black w-full overflow-hidden flex items-center justify-center group">
            <video
              ref={videoRef}
              className="w-full h-full object-contain"
              playsInline
              muted={isMuted}
            />

            {/* Loading Indicator */}
            {isVideoLoading && (
              <div className="absolute inset-0 bg-black/60 flex flex-col items-center justify-center gap-2 text-amber-300 z-10 backdrop-blur-2xs">
                <RefreshCw className="w-8 h-8 animate-spin text-amber-400" />
                <span className="text-xs font-bold font-sans">جاري الاتصال بالبث المباشر...</span>
              </div>
            )}

            {/* Error Overlay with Retry */}
            {videoError && (
              <div className="absolute inset-0 bg-black/80 flex flex-col items-center justify-center gap-3 text-white z-10 p-6 text-center">
                <p className="text-xs sm:text-sm text-red-300 max-w-md">{videoError}</p>
                <button
                  onClick={handleRetryVideo}
                  className="flex items-center gap-2 px-4 py-2 rounded-xl bg-amber-600 hover:bg-amber-500 text-white font-bold text-xs cursor-pointer shadow-md"
                >
                  <RefreshCw className="w-4 h-4" />
                  <span>إعادة محاولة الاتصال</span>
                </button>
              </div>
            )}

            {/* Controls Overlay Bar */}
            <div className="absolute inset-x-0 bottom-0 p-3 bg-gradient-to-t from-black/80 via-black/40 to-transparent flex items-center justify-between text-white z-20 opacity-90 group-hover:opacity-100 transition-opacity">
              <div className="flex items-center gap-3">
                <button
                  onClick={toggleVideoPlay}
                  className="p-2 rounded-xl bg-white/20 hover:bg-white/30 text-white transition cursor-pointer"
                  title={isVideoPlaying ? 'إيقاف مؤقت' : 'تشغيل'}
                >
                  {isVideoPlaying ? <Pause className="w-4 h-4" /> : <Play className="w-4 h-4" />}
                </button>

                <button
                  onClick={toggleMute}
                  className="p-2 rounded-xl bg-white/20 hover:bg-white/30 text-white transition cursor-pointer"
                  title={isMuted ? 'إلغاء كتم الصوت' : 'كتم الصوت'}
                >
                  {isMuted ? <VolumeX className="w-4 h-4" /> : <Volume2 className="w-4 h-4" />}
                </button>

                <div className="flex items-center gap-2 text-xs font-bold text-stone-200">
                  <span className="w-2 h-2 rounded-full bg-red-500 animate-pulse" />
                  <span>{selectedChannel?.name || 'البث المباشر'}</span>
                </div>
              </div>

              <div className="flex items-center gap-2">
                <button
                  onClick={handleRetryVideo}
                  className="p-2 rounded-xl bg-white/20 hover:bg-white/30 text-white transition cursor-pointer"
                  title="تحديث البث"
                >
                  <RefreshCw className="w-4 h-4" />
                </button>

                <button
                  onClick={handleFullscreen}
                  className="p-2 rounded-xl bg-white/20 hover:bg-white/30 text-white transition cursor-pointer"
                  title="ملء الشاشة"
                >
                  <Maximize2 className="w-4 h-4" />
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Audio Radios Section */}
      {activeMedium === 'audio' && (
        <div className="space-y-4">
          <div className="p-4 rounded-2xl bg-amber-500/10 dark:bg-amber-950/30 border border-amber-500/30 flex items-center justify-between text-xs">
            <span className="text-stone-700 dark:text-stone-300 font-medium">
              الاستماع المباشر لبث الحرمين الشريفين وإذاعات القرآن الكريم:
            </span>
            <span className="text-amber-700 dark:text-amber-400 font-bold">
              يعمل في الخلفية مع مشغل الصوت العائم 🎵
            </span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
            {radioStations.slice(0, 12).map((radio) => {
              const isSelected = selectedRadio?.id === radio.id;
              return (
                <div
                  key={radio.id}
                  className={`p-4 rounded-2xl border transition-all flex items-center justify-between gap-3 ${
                    isSelected
                      ? 'bg-amber-500/15 dark:bg-amber-950/40 border-amber-500 shadow-md'
                      : 'bg-white dark:bg-stone-900 border-stone-200 dark:border-stone-800 hover:border-amber-400'
                  }`}
                >
                  <div className="flex items-center gap-3 min-w-0">
                    <span className="w-9 h-9 rounded-xl bg-amber-500/15 text-amber-700 dark:text-amber-400 flex items-center justify-center shrink-0">
                      <Radio className="w-4 h-4" />
                    </span>
                    <div className="min-w-0">
                      <span className="text-xs sm:text-sm font-bold text-stone-900 dark:text-stone-100 block truncate">
                        {radio.name}
                      </span>
                      <span className="text-[10px] text-stone-400 block">بث مباشر MP3</span>
                    </div>
                  </div>

                  <button
                    onClick={() => handlePlayAudioRadio(radio)}
                    className="px-3 py-1.5 rounded-xl bg-amber-600 hover:bg-amber-500 text-white font-bold text-xs transition cursor-pointer shrink-0 flex items-center gap-1.5"
                  >
                    <Play className="w-3.5 h-3.5 fill-current" />
                    <span>استماع</span>
                  </button>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Footer Info */}
      <div className="p-4 rounded-2xl bg-stone-50 dark:bg-stone-900 border border-stone-200 dark:border-stone-800 text-xs text-stone-500 dark:text-stone-400 text-center flex items-center justify-center gap-2">
        <Sparkles className="w-4 h-4 text-amber-600" />
        <span>البث موصول بالخوادم الرسمية المعتمدة عبر MP3Quran.net لخدمة المسلمين حول العالم</span>
      </div>

    </div>
  );
};
