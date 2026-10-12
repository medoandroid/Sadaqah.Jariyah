import React, { useState, useEffect, useMemo } from 'react';
import {
  Video,
  Play,
  Film,
  Sparkles,
  Share2,
  X,
  Search,
  ExternalLink,
  Flame,
  Volume2
} from 'lucide-react';
import { mp3QuranService } from '../services/mp3QuranService';
import {
  MP3QTadaborItem,
  MP3QVideoReciter,
  MP3QVideoType,
  MP3QVideoItem
} from '../types/mp3quran';

interface TadaborVideosSectionProps {
  showToast: (msg: string) => void;
}

export const TadaborVideosSection: React.FC<TadaborVideosSectionProps> = ({ showToast }) => {
  const [subTab, setSubTab] = useState<'tadabor' | 'videos'>('tadabor');

  // Tadabor data
  const [tadaborItems, setTadaborItems] = useState<MP3QTadaborItem[]>([]);
  const [isTadaborLoading, setIsTadaborLoading] = useState<boolean>(true);

  // Videos data
  const [videoReciters, setVideoReciters] = useState<MP3QVideoReciter[]>([]);
  const [videoTypes, setVideoTypes] = useState<MP3QVideoType[]>([]);
  const [selectedVideoTypeId, setSelectedVideoTypeId] = useState<number | 'all'>('all');
  const [isVideosLoading, setIsVideosLoading] = useState<boolean>(true);

  // Active Video Modal
  const [activeVideoModal, setActiveVideoModal] = useState<{
    title: string;
    videoUrl: string;
    subtitle?: string;
  } | null>(null);

  const [searchQuery, setSearchQuery] = useState<string>('');

  // Fetch Tadabor
  useEffect(() => {
    let isMounted = true;
    setIsTadaborLoading(true);

    mp3QuranService.getTadabor(undefined, 'ar')
      .then((items) => {
        if (!isMounted) return;
        setTadaborItems(items);
        setIsTadaborLoading(false);
      })
      .catch((err) => {
        if (!isMounted) return;
        console.warn('Failed to load tadabor:', err);
        setIsTadaborLoading(false);
      });

    return () => {
      isMounted = false;
    };
  }, []);

  // Fetch Videos & Video Types
  useEffect(() => {
    let isMounted = true;
    setIsVideosLoading(true);

    Promise.all([
      mp3QuranService.getVideoTypes('ar'),
      mp3QuranService.getVideos('ar'),
    ])
      .then(([types, reciters]) => {
        if (!isMounted) return;
        setVideoTypes(types);
        setVideoReciters(reciters);
        setIsVideosLoading(false);
      })
      .catch((err) => {
        if (!isMounted) return;
        console.warn('Failed to load videos:', err);
        setIsVideosLoading(false);
      });

    return () => {
      isMounted = false;
    };
  }, []);

  // Filter Tadabor items
  const filteredTadabor = useMemo(() => {
    const q = searchQuery.trim().toLowerCase();
    if (!q) return tadaborItems;
    return tadaborItems.filter(
      (item) =>
        item.title.toLowerCase().includes(q) ||
        item.sora_name?.toLowerCase().includes(q) ||
        item.reciter_name?.toLowerCase().includes(q)
    );
  }, [tadaborItems, searchQuery]);

  // Flatten and filter Videos
  const filteredVideos = useMemo(() => {
    const list: {
      reciterName: string;
      video: MP3QVideoItem;
      typeName?: string;
    }[] = [];

    const typeMap = new Map<number, string>();
    videoTypes.forEach((t) => typeMap.set(t.id, t.video_type));

    const q = searchQuery.trim().toLowerCase();

    videoReciters.forEach((rec) => {
      rec.videos.forEach((v) => {
        if (selectedVideoTypeId !== 'all' && v.video_type !== selectedVideoTypeId) {
          return;
        }
        const typeName = typeMap.get(v.video_type) || 'مرئي';
        if (q && !rec.reciter_name.toLowerCase().includes(q) && !typeName.toLowerCase().includes(q)) {
          return;
        }
        list.push({
          reciterName: rec.reciter_name,
          video: v,
          typeName,
        });
      });
    });

    return list;
  }, [videoReciters, videoTypes, selectedVideoTypeId, searchQuery]);

  const handleShareVideo = (title: string, url: string, e: React.MouseEvent) => {
    e.stopPropagation();
    const text = `شاهد: (${title}) عبر منصة صدقة جارية:\n${url}`;
    if (navigator.share) {
      navigator.share({
        title,
        text,
        url,
      }).catch(() => {});
    } else {
      navigator.clipboard.writeText(text);
      showToast('تم نسخ رابط الفيديو للمشاركة');
    }
  };

  return (
    <div className="space-y-6 text-right animate-in fade-in duration-200 select-none">
      
      {/* Header Banner */}
      <div className="p-5 sm:p-6 rounded-3xl bg-gradient-to-br from-[#1C1917] via-[#161412] to-[#0E0C0B] text-stone-100 border border-amber-900/40 shadow-xl space-y-4">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <Film className="w-5 h-5 text-amber-400" />
              <h2 className="font-amiri text-2xl sm:text-3xl font-bold text-amber-200">
                التدبر القرآني والتلاوات المرئية
              </h2>
            </div>
            <p className="text-xs sm:text-sm text-stone-400">
              مقاطع تدبر مؤثرة لآيات القرآن الكريم وفيديوهات تلاوات خاشعة لكبار القراء
            </p>
          </div>

          {/* Sub-tab Pill Switcher */}
          <div className="flex items-center p-1 rounded-2xl bg-stone-900 border border-stone-750 self-end sm:self-auto shrink-0">
            <button
              onClick={() => setSubTab('tadabor')}
              className={`px-4 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                subTab === 'tadabor'
                  ? 'bg-amber-700 text-white shadow-xs'
                  : 'text-stone-400 hover:text-white'
              }`}
            >
              مقاطع التدبر ({tadaborItems.length})
            </button>
            <button
              onClick={() => setSubTab('videos')}
              className={`px-4 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                subTab === 'videos'
                  ? 'bg-amber-700 text-white shadow-xs'
                  : 'text-stone-400 hover:text-white'
              }`}
            >
              الفيديوهات والتلاوات المرئية
            </button>
          </div>
        </div>

        {/* Filter bar */}
        <div className="flex flex-col md:flex-row items-stretch md:items-center gap-3 pt-2 border-t border-stone-800">
          <div className="relative flex-1">
            <Search className="w-4 h-4 absolute right-3.5 top-1/2 -translate-y-1/2 text-stone-400" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="ابحث بالعنوان أو اسم السورة أو القارئ..."
              className="w-full pr-10 pl-4 py-2 text-xs sm:text-sm bg-stone-900/90 border border-stone-750 rounded-2xl focus:outline-hidden focus:border-amber-500 text-stone-100 placeholder:text-stone-500 transition-colors"
            />
          </div>

          {subTab === 'videos' && (
            <div className="flex items-center gap-1.5 overflow-x-auto pb-1 scrollbar-none">
              <button
                onClick={() => setSelectedVideoTypeId('all')}
                className={`px-3 py-1.5 rounded-xl text-xs font-semibold whitespace-nowrap transition-all cursor-pointer shrink-0 ${
                  selectedVideoTypeId === 'all'
                    ? 'bg-amber-600 text-white'
                    : 'bg-stone-850 text-stone-300 border border-stone-750'
                }`}
              >
                كل التصنيفات
              </button>
              {videoTypes.map((t) => (
                <button
                  key={t.id}
                  onClick={() => setSelectedVideoTypeId(t.id)}
                  className={`px-3 py-1.5 rounded-xl text-xs font-semibold whitespace-nowrap transition-all cursor-pointer shrink-0 ${
                    selectedVideoTypeId === t.id
                      ? 'bg-amber-600 text-white'
                      : 'bg-stone-850 text-stone-300 border border-stone-750'
                  }`}
                >
                  {t.video_type}
                </button>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* SUB-TAB 1: TADABOR REFLECTIONS */}
      {subTab === 'tadabor' && (
        <>
          {isTadaborLoading ? (
            <div className="p-12 text-center rounded-3xl bg-white dark:bg-stone-900 border border-stone-200 dark:border-stone-800 space-y-3">
              <div className="w-8 h-8 border-3 border-amber-600 border-t-transparent rounded-full animate-spin mx-auto" />
              <p className="text-xs text-stone-500 dark:text-stone-400 font-medium">
                جاري جلب مقاطع التدبر القرآني...
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {filteredTadabor.map((item) => (
                <div
                  key={item.id}
                  onClick={() => {
                    if (item.video_url) {
                      setActiveVideoModal({
                        title: item.title,
                        videoUrl: item.video_url,
                        subtitle: `سورة ${item.sora_name || ''}`,
                      });
                    } else if (item.audio_url) {
                      showToast('جاري تشغيل الصوت...');
                    }
                  }}
                  className="rounded-3xl overflow-hidden bg-white dark:bg-stone-900 border border-stone-200/90 dark:border-stone-800 shadow-2xs hover:shadow-lg hover:border-amber-400/50 transition-all cursor-pointer flex flex-col justify-between group"
                >
                  {/* Thumbnail / Image container */}
                  <div className="relative aspect-video bg-stone-950 overflow-hidden flex items-center justify-center">
                    {item.image_url ? (
                      <img
                        src={item.image_url}
                        alt={item.title}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                        loading="lazy"
                      />
                    ) : (
                      <div className="w-full h-full bg-gradient-to-br from-amber-950 to-stone-900 flex items-center justify-center">
                        <Film className="w-10 h-10 text-amber-500/40" />
                      </div>
                    )}

                    {/* Play Badge Overlay */}
                    <div className="absolute inset-0 bg-black/30 group-hover:bg-black/15 transition-colors flex items-center justify-center">
                      <div className="w-12 h-12 rounded-2xl bg-amber-600/90 text-white flex items-center justify-center shadow-lg group-hover:scale-110 transition-transform">
                        <Play className="w-5 h-5 fill-current ml-0.5" />
                      </div>
                    </div>

                    {/* Surah badge */}
                    {item.sora_name && (
                      <span className="absolute bottom-2.5 right-2.5 px-2.5 py-1 rounded-lg bg-black/75 backdrop-blur-md text-white text-[11px] font-bold">
                        سورة {item.sora_name}
                      </span>
                    )}
                  </div>

                  {/* Body Text */}
                  <div className="p-4 space-y-2">
                    <h3 className="font-amiri text-lg font-bold text-stone-900 dark:text-stone-100 line-clamp-2 leading-snug group-hover:text-amber-800 dark:group-hover:text-amber-300 transition-colors">
                      {item.title}
                    </h3>

                    {item.reciter_name && (
                      <p className="text-xs text-stone-500 dark:text-stone-400">
                        {item.reciter_name}
                      </p>
                    )}

                    <div className="pt-2 border-t border-stone-100 dark:border-stone-800 flex items-center justify-between text-xs text-stone-400">
                      <span className="text-amber-700 dark:text-amber-400 font-semibold text-[11px]">
                        مشاهدة المقطع ↗
                      </span>
                      {item.video_url && (
                        <button
                          type="button"
                          onClick={(e) => handleShareVideo(item.title, item.video_url!, e)}
                          className="p-1.5 rounded-lg hover:bg-stone-100 dark:hover:bg-stone-800 text-stone-400 hover:text-stone-700 dark:hover:text-stone-200 transition"
                          title="مشاركة"
                        >
                          <Share2 className="w-4 h-4" />
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </>
      )}

      {/* SUB-TAB 2: VIDEOS */}
      {subTab === 'videos' && (
        <>
          {isVideosLoading ? (
            <div className="p-12 text-center rounded-3xl bg-white dark:bg-stone-900 border border-stone-200 dark:border-stone-800 space-y-3">
              <div className="w-8 h-8 border-3 border-amber-600 border-t-transparent rounded-full animate-spin mx-auto" />
              <p className="text-xs text-stone-500 dark:text-stone-400 font-medium">
                جاري جلب الفيديوهات والتلاوات المرئية...
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {filteredVideos.map(({ reciterName, video, typeName }, idx) => (
                <div
                  key={`${video.id}-${idx}`}
                  onClick={() => {
                    setActiveVideoModal({
                      title: typeName || 'تلاوة مرئية',
                      videoUrl: video.video_url,
                      subtitle: reciterName,
                    });
                  }}
                  className="rounded-3xl overflow-hidden bg-white dark:bg-stone-900 border border-stone-200/90 dark:border-stone-800 shadow-2xs hover:shadow-lg hover:border-amber-400/50 transition-all cursor-pointer flex flex-col justify-between group"
                >
                  <div className="relative aspect-video bg-stone-950 overflow-hidden flex items-center justify-center">
                    {video.video_thumb_url ? (
                      <img
                        src={video.video_thumb_url}
                        alt={reciterName}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                        loading="lazy"
                      />
                    ) : (
                      <div className="w-full h-full bg-gradient-to-br from-stone-900 to-black flex items-center justify-center">
                        <Video className="w-10 h-10 text-stone-600" />
                      </div>
                    )}

                    <div className="absolute inset-0 bg-black/30 group-hover:bg-black/15 transition-colors flex items-center justify-center">
                      <div className="w-12 h-12 rounded-2xl bg-amber-600/90 text-white flex items-center justify-center shadow-lg group-hover:scale-110 transition-transform">
                        <Play className="w-5 h-5 fill-current ml-0.5" />
                      </div>
                    </div>

                    {typeName && (
                      <span className="absolute top-2.5 right-2.5 px-2.5 py-0.5 rounded-lg bg-amber-950/80 backdrop-blur-md text-amber-200 text-[10px] font-bold border border-amber-500/30">
                        {typeName}
                      </span>
                    )}
                  </div>

                  <div className="p-4 space-y-1.5">
                    <h3 className="font-amiri text-lg font-bold text-stone-900 dark:text-stone-100 truncate group-hover:text-amber-800 dark:group-hover:text-amber-300 transition-colors">
                      {reciterName}
                    </h3>
                    <p className="text-xs text-stone-500 dark:text-stone-400">
                      {typeName}
                    </p>

                    <div className="pt-2 border-t border-stone-100 dark:border-stone-800 flex items-center justify-between text-xs text-stone-400">
                      <span className="text-amber-700 dark:text-amber-400 font-semibold text-[11px]">
                        تشغيل الفيديو ↗
                      </span>
                      <button
                        type="button"
                        onClick={(e) => handleShareVideo(reciterName, video.video_url, e)}
                        className="p-1.5 rounded-lg hover:bg-stone-100 dark:hover:bg-stone-800 text-stone-400 hover:text-stone-700 dark:hover:text-stone-200 transition"
                        title="مشاركة"
                      >
                        <Share2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </>
      )}

      {/* Video Modal Player */}
      {activeVideoModal && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-5 bg-black/85 backdrop-blur-md animate-in fade-in duration-200"
          onClick={() => setActiveVideoModal(null)}
        >
          <div
            className="w-full max-w-3xl bg-stone-900 border border-stone-800 rounded-3xl overflow-hidden shadow-2xl flex flex-col text-right"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Modal Header */}
            <div className="p-4 border-b border-stone-800 flex items-center justify-between gap-3 bg-stone-925">
              <div>
                <h3 className="font-amiri text-xl font-bold text-white">
                  {activeVideoModal.title}
                </h3>
                {activeVideoModal.subtitle && (
                  <p className="text-xs text-stone-400">{activeVideoModal.subtitle}</p>
                )}
              </div>

              <button
                onClick={() => setActiveVideoModal(null)}
                className="p-2 text-stone-400 hover:text-white rounded-xl hover:bg-stone-800 transition"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Video Player */}
            <div className="relative aspect-video bg-black w-full overflow-hidden flex items-center justify-center">
              <video
                src={activeVideoModal.videoUrl}
                controls
                autoPlay
                playsInline
                className="w-full h-full object-contain"
              />
            </div>
          </div>
        </div>
      )}

    </div>
  );
};
