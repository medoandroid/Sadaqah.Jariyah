import React, { useState, useEffect, useRef } from 'react';
import {
  X,
  Tv,
  Volume2,
  VolumeX,
  Maximize2,
  Play,
  Pause,
  RotateCcw,
  Radio,
  ExternalLink,
  Sparkles,
  Check
} from 'lucide-react';
import Hls from 'hls.js';
import { mp3QuranService } from '../services/mp3QuranService';
import { MP3QLiveTV } from '../types/mp3quran';

interface LiveTVModalProps {
  isOpen: boolean;
  onClose: () => void;
  initialChannelId?: number;
}

export const LiveTVModal: React.FC<LiveTVModalProps> = ({
  isOpen,
  onClose,
  initialChannelId = 3,
}) => {
  const [channels, setChannels] = useState<MP3QLiveTV[]>([]);
  const [selectedChannel, setSelectedChannel] = useState<MP3QLiveTV | null>(null);
  const [isPlaying, setIsPlaying] = useState<boolean>(true);
  const [isMuted, setIsMuted] = useState<boolean>(false);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const videoRef = useRef<HTMLVideoElement | null>(null);
  const hlsRef = useRef<Hls | null>(null);

  // Load channels
  useEffect(() => {
    if (!isOpen) return;

    let isMounted = true;
    setIsLoading(true);

    mp3QuranService.getLiveTV('ar').then((list) => {
      if (!isMounted) return;
      setChannels(list);
      const initial = list.find((c) => c.id === initialChannelId) || list[0] || null;
      setSelectedChannel(initial);
      setIsLoading(false);
    }).catch(() => {
      if (!isMounted) return;
      setIsLoading(false);
    });

    return () => {
      isMounted = false;
    };
  }, [isOpen, initialChannelId]);

  // Setup HLS Stream when channel changes
  useEffect(() => {
    if (!isOpen || !selectedChannel || !videoRef.current) return;

    const video = videoRef.current;
    setErrorMsg(null);
    setIsLoading(true);

    // Destroy existing HLS instance
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
        setIsLoading(false);
        video.play().then(() => {
          setIsPlaying(true);
        }).catch(() => {
          setIsPlaying(false);
        });
      });

      hls.on(Hls.Events.ERROR, (_event, data) => {
        if (data.fatal) {
          switch (data.type) {
            case Hls.ErrorTypes.NETWORK_ERROR:
              setErrorMsg('خطأ في الاتصال بالبث المباشر. جاري إعادة المحاولة...');
              hls.startLoad();
              break;
            case Hls.ErrorTypes.MEDIA_ERROR:
              setErrorMsg('خطأ في تشغيل الوسائط. جاري استرجاع البث...');
              hls.recoverMediaError();
              break;
            default:
              setErrorMsg('تعذر تحميل البث المباشر حالياً.');
              hls.destroy();
              break;
          }
        }
      });
    } else if (video.canPlayType('application/vnd.apple.mpegurl')) {
      // Native Safari / iOS HLS
      video.src = streamUrl;
      video.addEventListener('loadedmetadata', () => {
        setIsLoading(false);
        video.play().then(() => {
          setIsPlaying(true);
        }).catch(() => {
          setIsPlaying(false);
        });
      });
    } else {
      setErrorMsg('المتصفح لا يدعم تشغيل هذا البث مباشرة.');
      setIsLoading(false);
    }

    return () => {
      if (hlsRef.current) {
        hlsRef.current.destroy();
        hlsRef.current = null;
      }
    };
  }, [isOpen, selectedChannel]);

  if (!isOpen) return null;

  const togglePlay = () => {
    if (!videoRef.current) return;
    if (isPlaying) {
      videoRef.current.pause();
      setIsPlaying(false);
    } else {
      videoRef.current.play().then(() => setIsPlaying(true)).catch(() => {});
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

  const handleRetry = () => {
    if (selectedChannel) {
      const current = selectedChannel;
      setSelectedChannel(null);
      setTimeout(() => setSelectedChannel(current), 50);
    }
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-5 bg-stone-950/85 backdrop-blur-md animate-in fade-in duration-200 select-none"
      onClick={onClose}
    >
      <div
        className="w-full max-w-4xl bg-stone-900 border border-stone-800 rounded-3xl overflow-hidden shadow-2xl flex flex-col text-right"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Top Header Bar */}
        <div className="p-4 sm:p-5 border-b border-stone-800 flex items-center justify-between gap-3 bg-stone-925">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-amber-500/15 border border-amber-500/30 text-amber-400 flex items-center justify-center shadow-xs">
              <Tv className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="font-amiri text-xl sm:text-2xl font-bold text-white">
                  البث المباشر للحرمين الشريفين
                </h3>
                <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-red-500/20 text-red-300 border border-red-500/30 text-[10px] font-bold">
                  <span className="w-1.5 h-1.5 rounded-full bg-red-500 animate-pulse" />
                  <span>مباشر 24/7</span>
                </span>
              </div>
              <p className="text-xs text-stone-400">
                بث حي ومباشر عبر القنوات الرسمية من مكة المكرمة والمدينة المنورة
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-2 text-stone-400 hover:text-white rounded-xl hover:bg-stone-800 transition cursor-pointer"
            aria-label="إغلاق"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Channel Selector Strip */}
        <div className="p-3 bg-stone-850 border-b border-stone-800 flex items-center gap-2 overflow-x-auto scrollbar-none">
          <span className="text-xs text-stone-400 font-medium shrink-0 ml-1">القناة:</span>
          {channels.map((c) => {
            const isSelected = selectedChannel?.id === c.id;
            return (
              <button
                key={c.id}
                onClick={() => setSelectedChannel(c)}
                className={`px-3.5 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer flex items-center gap-2 shrink-0 active:scale-95 ${
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

        {/* Video Player Container */}
        <div className="relative aspect-video bg-black w-full overflow-hidden flex items-center justify-center group">
          <video
            ref={videoRef}
            className="w-full h-full object-contain"
            playsInline
            muted={isMuted}
          />

          {/* Loading Indicator */}
          {isLoading && (
            <div className="absolute inset-0 bg-black/60 flex flex-col items-center justify-center gap-2 text-amber-300 z-10 backdrop-blur-2xs">
              <div className="w-8 h-8 border-3 border-amber-400 border-t-transparent rounded-full animate-spin" />
              <span className="text-xs font-medium">جاري ضبط البث المباشر...</span>
            </div>
          )}

          {/* Error Banner */}
          {errorMsg && (
            <div className="absolute inset-0 bg-black/80 flex flex-col items-center justify-center gap-3 text-center p-4 z-20">
              <p className="text-amber-200 text-sm max-w-md">{errorMsg}</p>
              <button
                onClick={handleRetry}
                className="px-4 py-2 rounded-xl bg-amber-600 hover:bg-amber-700 text-white text-xs font-bold flex items-center gap-1.5 transition cursor-pointer"
              >
                <RotateCcw className="w-4 h-4" />
                <span>إعادة المحاولة</span>
              </button>
            </div>
          )}

          {/* Bottom Video Controls Overlay */}
          <div className="absolute inset-x-0 bottom-0 p-3 sm:p-4 bg-gradient-to-t from-black/90 via-black/50 to-transparent flex items-center justify-between gap-3 text-white opacity-0 group-hover:opacity-100 transition-opacity duration-200">
            <div className="flex items-center gap-2">
              <button
                onClick={togglePlay}
                className="p-2 rounded-xl bg-white/20 hover:bg-white/30 backdrop-blur-md transition cursor-pointer"
                title={isPlaying ? 'إيقاف مؤقت' : 'تشغيل'}
              >
                {isPlaying ? <Pause className="w-4 h-4" /> : <Play className="w-4 h-4" />}
              </button>

              <button
                onClick={toggleMute}
                className="p-2 rounded-xl bg-white/20 hover:bg-white/30 backdrop-blur-md transition cursor-pointer"
                title={isMuted ? 'إلغاء كتم الصوت' : 'كتم الصوت'}
              >
                {isMuted ? <VolumeX className="w-4 h-4" /> : <Volume2 className="w-4 h-4" />}
              </button>

              <span className="text-xs font-semibold px-2 text-stone-200">
                {selectedChannel?.name}
              </span>
            </div>

            <div className="flex items-center gap-2">
              <button
                onClick={handleFullscreen}
                className="p-2 rounded-xl bg-white/20 hover:bg-white/30 backdrop-blur-md transition cursor-pointer"
                title="شاشة كاملة"
              >
                <Maximize2 className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>

        {/* Footer Info */}
        <div className="p-3 sm:p-4 bg-stone-925 border-t border-stone-800 flex items-center justify-between text-xs text-stone-400">
          <span>نقل مباشر عالي الدقة بدون انقطاع</span>
          <span className="text-stone-500">منصة صدقة جارية</span>
        </div>

      </div>
    </div>
  );
};
