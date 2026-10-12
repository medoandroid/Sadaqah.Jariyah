import React, { useState, useEffect } from 'react';
import {
  X,
  Clock,
  Play,
  Pause,
  Sparkles,
  Search,
  BookOpen,
  Volume2,
  Check
} from 'lucide-react';
import { mp3QuranService } from '../services/mp3QuranService';
import { MP3QAyatTimingRead, MP3QAyatTimingItem } from '../types/mp3quran';
import { ALL_SURAHS } from '../data/quranMeta';
import { useAudio } from '../context/AudioContext';

interface AyahTimingExplorerModalProps {
  isOpen: boolean;
  onClose: () => void;
  initialSurahNumber?: number;
}

export const AyahTimingExplorerModal: React.FC<AyahTimingExplorerModalProps> = ({
  isOpen,
  onClose,
  initialSurahNumber = 1,
}) => {
  const { currentTime, isPlaying, seekTo } = useAudio();

  const [reads, setReads] = useState<MP3QAyatTimingRead[]>([]);
  const [selectedReadId, setSelectedReadId] = useState<number>(1);
  const [selectedSurah, setSelectedSurah] = useState<number>(initialSurahNumber);
  const [timings, setTimings] = useState<MP3QAyatTimingItem[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);

  // Load reads
  useEffect(() => {
    if (!isOpen) return;

    mp3QuranService.getAyatTimingReads().then((data) => {
      setReads(data);
      if (data.length > 0 && !selectedReadId) {
        setSelectedReadId(data[0].id);
      }
    });
  }, [isOpen]);

  // Load timing for selected read and surah
  useEffect(() => {
    if (!isOpen || !selectedReadId) return;

    setIsLoading(true);
    mp3QuranService.getAyatTiming(selectedSurah, selectedReadId)
      .then((data) => {
        setTimings(data);
        setIsLoading(false);
      })
      .catch(() => {
        setTimings([]);
        setIsLoading(false);
      });
  }, [isOpen, selectedReadId, selectedSurah]);

  if (!isOpen) return null;

  const currentMs = currentTime * 1000;
  const currentAyah = timings.find(
    (t) => currentMs >= t.start_time && currentMs < t.end_time
  );

  const formatMs = (ms: number) => {
    const totalSecs = Math.floor(ms / 1000);
    const m = Math.floor(totalSecs / 60);
    const s = totalSecs % 60;
    const millis = Math.floor((ms % 1000) / 100);
    return `${String(m).padStart(2, '0')}:${String(s).padStart(2, '0')}.${millis}`;
  };

  const handleJumpToAyah = (startTimeMs: number) => {
    seekTo(startTimeMs / 1000);
  };

  const surahObj = ALL_SURAHS.find((s) => s.number === selectedSurah) || ALL_SURAHS[0];

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-5 bg-stone-950/80 backdrop-blur-md animate-in fade-in duration-200 select-none"
      onClick={onClose}
    >
      <div
        className="w-full max-w-2xl bg-white dark:bg-stone-900 border border-stone-200 dark:border-stone-800 rounded-3xl p-5 sm:p-7 shadow-2xl flex flex-col text-right space-y-5 max-h-[90vh] overflow-y-auto"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Top Header */}
        <div className="flex items-center justify-between pb-3 border-b border-stone-150 dark:border-stone-800">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-amber-500/15 border border-amber-500/30 text-amber-600 dark:text-amber-400 flex items-center justify-center shadow-xs">
              <Clock className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="font-amiri text-xl sm:text-2xl font-bold text-stone-900 dark:text-stone-100">
                  تزامن وتوقيت الآيات (Ayat Timing API)
                </h3>
              </div>
              <p className="text-xs text-stone-500 dark:text-stone-400">
                تحديد التوقيت الزمني الدقيق لكل آية بالمللي ثانية لتظليل الآيات ومتابعة التلاوة
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-1.5 text-stone-400 hover:text-stone-700 dark:hover:text-stone-200 rounded-lg cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Selectors Bar */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 p-3 rounded-2xl bg-stone-50 dark:bg-stone-850 border border-stone-200 dark:border-stone-800 text-xs">
          <div>
            <label className="block text-stone-500 dark:text-stone-400 mb-1 font-medium">
              القارئ والمصحف:
            </label>
            <select
              value={selectedReadId}
              onChange={(e) => setSelectedReadId(parseInt(e.target.value, 10))}
              className="w-full bg-white dark:bg-stone-800 text-stone-800 dark:text-stone-200 border border-stone-300 dark:border-stone-700 rounded-xl px-3 py-2 font-medium"
            >
              {reads.map((r) => (
                <option key={r.id} value={r.id}>
                  {r.name} - {r.rewaya}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-stone-500 dark:text-stone-400 mb-1 font-medium">
              السورة:
            </label>
            <select
              value={selectedSurah}
              onChange={(e) => setSelectedSurah(parseInt(e.target.value, 10))}
              className="w-full bg-white dark:bg-stone-800 text-stone-800 dark:text-stone-200 border border-stone-300 dark:border-stone-700 rounded-xl px-3 py-2 font-medium"
            >
              {ALL_SURAHS.map((s) => (
                <option key={s.number} value={s.number}>
                  {s.number}. سورة {s.name} ({s.numberOfAyahs} آية)
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* Live Tracking Banner */}
        {isPlaying && currentAyah && (
          <div className="p-3.5 rounded-2xl bg-amber-500/10 border border-amber-500/30 flex items-center justify-between text-xs text-amber-900 dark:text-amber-200 animate-in fade-in">
            <div className="flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
              <span className="font-bold">
                الآية الجارية الآن: رقم ({currentAyah.ayah})
              </span>
            </div>
            <span className="font-mono text-[11px] text-amber-700 dark:text-amber-300 font-bold">
              {formatMs(currentAyah.start_time)} ➔ {formatMs(currentAyah.end_time)}
            </span>
          </div>
        )}

        {/* Loading */}
        {isLoading && (
          <div className="p-8 text-center space-y-2">
            <div className="w-7 h-7 border-3 border-amber-600 border-t-transparent rounded-full animate-spin mx-auto" />
            <span className="text-xs text-stone-400">جاري جلب توقيتات الآيات...</span>
          </div>
        )}

        {/* Timing List */}
        {!isLoading && (
          <div className="space-y-2 max-h-72 overflow-y-auto pr-1">
            <div className="flex items-center justify-between text-xs text-stone-500 dark:text-stone-400 px-2 pb-1 border-b border-stone-150 dark:border-stone-800">
              <span>رقم الآية</span>
              <span>بداية الآية ➔ نهاية الآية</span>
              <span>انتقال فوري</span>
            </div>

            {timings.map((t) => {
              const isActive = currentAyah?.ayah === t.ayah;
              return (
                <div
                  key={t.ayah}
                  onClick={() => handleJumpToAyah(t.start_time)}
                  className={`p-2.5 rounded-xl border flex items-center justify-between text-xs cursor-pointer transition-colors ${
                    isActive
                      ? 'bg-amber-100 dark:bg-amber-950/40 border-amber-400 text-amber-900 dark:text-amber-200 font-bold'
                      : 'bg-stone-50 dark:bg-stone-850/60 border-stone-200 dark:border-stone-800 hover:border-amber-400/60'
                  }`}
                >
                  <div className="flex items-center gap-2 font-mono">
                    <span className="w-6 h-6 rounded-lg bg-white dark:bg-stone-800 border border-stone-200 dark:border-stone-700 flex items-center justify-center font-bold text-[11px]">
                      {t.ayah}
                    </span>
                    <span>الآية {t.ayah}</span>
                  </div>

                  <div className="font-mono text-stone-600 dark:text-stone-300 text-[11px]">
                    {formatMs(t.start_time)} ➔ {formatMs(t.end_time)}
                  </div>

                  <button
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation();
                      handleJumpToAyah(t.start_time);
                    }}
                    className="px-2.5 py-1 rounded-lg bg-amber-600 text-white font-bold text-[10px] hover:bg-amber-700 cursor-pointer"
                  >
                    انتقال ▶
                  </button>
                </div>
              );
            })}
          </div>
        )}

      </div>
    </div>
  );
};
