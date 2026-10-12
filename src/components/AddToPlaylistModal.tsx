import React, { useState, useEffect } from 'react';
import {
  X,
  Plus,
  Check,
  ListMusic,
  Heart,
  Sparkles,
  BookOpen,
  Shield
} from 'lucide-react';
import {
  customPlaylistsService,
  CustomPlaylist,
} from '../services/customPlaylistsService';
import { ALL_SURAHS } from '../data/quranMeta';

interface AddToPlaylistModalProps {
  isOpen: boolean;
  onClose: () => void;
  surahNumber: number;
  onSuccess?: (playlistTitle: string) => void;
}

export const AddToPlaylistModal: React.FC<AddToPlaylistModalProps> = ({
  isOpen,
  onClose,
  surahNumber,
  onSuccess,
}) => {
  const [playlists, setPlaylists] = useState<CustomPlaylist[]>([]);
  const surah = ALL_SURAHS.find((s) => s.number === surahNumber);

  useEffect(() => {
    const unsub = customPlaylistsService.subscribe(setPlaylists);
    return () => unsub();
  }, []);

  if (!isOpen || !surah) return null;

  const handleToggleSurahInPlaylist = (playlist: CustomPlaylist) => {
    const inPlaylist = playlist.surahNumbers.includes(surahNumber);
    if (inPlaylist) {
      customPlaylistsService.removeSurahFromPlaylist(playlist.id, surahNumber);
    } else {
      customPlaylistsService.addSurahToPlaylist(playlist.id, surahNumber);
      onSuccess?.(playlist.title);
    }
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/75 backdrop-blur-md animate-in fade-in duration-200"
      onClick={onClose}
      dir="rtl"
    >
      <div
        className="relative w-full max-w-md bg-[#141720] text-stone-100 rounded-3xl border border-amber-500/35 shadow-2xl overflow-hidden"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="p-4 border-b border-stone-800 bg-[#171B24] flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-xl bg-amber-500/20 text-amber-400 flex items-center justify-center">
              <ListMusic className="w-4 h-4" />
            </div>
            <div>
              <h3 className="font-amiri text-base font-bold text-white">
                إضافة سورة {surah.name} إلى قائمة
              </h3>
              <p className="text-[11px] text-stone-400">
                اختر القوائم التي تود تضمين السورة فيها
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-1 rounded-lg text-stone-400 hover:text-white"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        <div className="p-3 space-y-1.5 max-h-72 overflow-y-auto">
          {playlists.map((pl) => {
            const isIncluded = pl.surahNumbers.includes(surahNumber);
            return (
              <button
                key={pl.id}
                type="button"
                onClick={() => handleToggleSurahInPlaylist(pl)}
                className={`w-full p-2.5 rounded-2xl border text-right transition-all flex items-center justify-between cursor-pointer ${
                  isIncluded
                    ? 'bg-amber-500/20 border-amber-500/50 text-amber-200 font-bold'
                    : 'bg-stone-900 border-stone-800 hover:bg-stone-850 text-stone-300'
                }`}
              >
                <div className="flex items-center gap-2.5 truncate">
                  <span
                    className="w-2.5 h-2.5 rounded-full shrink-0"
                    style={{ backgroundColor: pl.color }}
                  />
                  <div className="truncate">
                    <span className="text-xs font-semibold block truncate">{pl.title}</span>
                    <span className="text-[10px] text-stone-400 block">
                      {pl.surahNumbers.length} سورة
                    </span>
                  </div>
                </div>

                <div
                  className={`w-5 h-5 rounded-lg flex items-center justify-center shrink-0 border ${
                    isIncluded
                      ? 'bg-amber-500 text-stone-950 border-amber-400'
                      : 'border-stone-700 bg-stone-800 text-stone-400'
                  }`}
                >
                  {isIncluded && <Check className="w-3.5 h-3.5 stroke-[3]" />}
                </div>
              </button>
            );
          })}
        </div>

        <div className="p-3 border-t border-stone-800 bg-[#171B24] flex justify-end">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-1.5 rounded-xl bg-amber-500 text-stone-950 font-bold text-xs cursor-pointer"
          >
            تم
          </button>
        </div>
      </div>
    </div>
  );
};
