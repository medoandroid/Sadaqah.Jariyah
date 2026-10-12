import React, { useState, useEffect } from 'react';
import {
  X,
  Check,
  ListMusic,
  FolderPlus
} from 'lucide-react';
import { customPlaylistsService, CustomPlaylist } from '../services/customPlaylistsService';
import { ALL_SURAHS } from '../data/quranMeta';

export interface AddToPlaylistModalProps {
  surahNumber?: number;
  isOpen: boolean;
  onClose: () => void;
  onSuccess?: (playlistTitle: string) => void;
}

export const AddToPlaylistModal: React.FC<AddToPlaylistModalProps> = ({
  surahNumber,
  isOpen,
  onClose,
  onSuccess
}) => {
  const [playlists, setPlaylists] = useState<CustomPlaylist[]>([]);
  const [showCreateInline, setShowCreateInline] = useState(false);
  const [newTitle, setNewTitle] = useState('');
  const [feedback, setFeedback] = useState<string | null>(null);

  useEffect(() => {
    if (!isOpen) return;
    setPlaylists(customPlaylistsService.getPlaylists());
    const unsub = customPlaylistsService.subscribe(setPlaylists);
    return unsub;
  }, [isOpen]);

  if (!isOpen || !surahNumber) return null;

  const surah = ALL_SURAHS.find((s) => s.number === surahNumber);

  const handleToggle = (playlistId: string) => {
    const pl = playlists.find((p) => p.id === playlistId);
    if (!pl) return;
    const exists = pl.surahNumbers.includes(surahNumber);
    if (exists) {
      customPlaylistsService.removeSurahFromPlaylist(playlistId, surahNumber);
      const msg = `تمت إزالة سورة ${surah?.name || surahNumber} من ${pl.title}`;
      setFeedback(msg);
      if (onSuccess) onSuccess(pl.title);
    } else {
      customPlaylistsService.addSurahToPlaylist(playlistId, surahNumber);
      const msg = `تمت إضافة سورة ${surah?.name || surahNumber} إلى ${pl.title}`;
      setFeedback(msg);
      if (onSuccess) onSuccess(pl.title);
    }
    setTimeout(() => setFeedback(null), 2500);
  };

  const handleCreateAndAdd = () => {
    if (!newTitle.trim()) return;
    const created = customPlaylistsService.createPlaylist({
      title: newTitle.trim(),
      description: 'قائمة تلاوات مخصصة',
      icon: 'sparkles',
      color: '#059669',
      initialSurahs: [surahNumber]
    });
    setNewTitle('');
    setShowCreateInline(false);
    const msg = `تم إنشاء "${created.title}" وإضافة سورة ${surah?.name || surahNumber}`;
    setFeedback(msg);
    if (onSuccess) onSuccess(created.title);
    setTimeout(() => setFeedback(null), 2500);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="bg-stone-900 border border-amber-500/30 rounded-2xl max-w-md w-full p-6 shadow-2xl relative text-right select-none">
        <button
          type="button"
          onClick={onClose}
          className="absolute top-4 left-4 p-2 text-stone-400 hover:text-white rounded-lg hover:bg-stone-800 transition cursor-pointer"
        >
          <X className="w-5 h-5" />
        </button>

        <div className="flex items-center gap-3 mb-4">
          <div className="w-10 h-10 rounded-xl bg-amber-500/20 text-amber-400 flex items-center justify-center shrink-0">
            <ListMusic className="w-5 h-5" />
          </div>
          <div>
            <h3 className="text-lg font-bold text-white font-amiri">إضافة إلى قائمة تلاوات</h3>
            <p className="text-xs text-stone-400">
              سورة {surah?.name} · {surah?.revelationArabic} · {surah?.numberOfAyahs} آية
            </p>
          </div>
        </div>

        {feedback && (
          <div className="mb-4 p-2.5 bg-amber-500/20 border border-amber-500/40 rounded-xl text-amber-300 text-xs text-center font-medium animate-in fade-in duration-150">
            {feedback}
          </div>
        )}

        <div className="space-y-2 max-h-60 overflow-y-auto scrollbar-thin mb-4 pr-1">
          {playlists.map((pl) => {
            const hasItem = pl.surahNumbers.includes(surahNumber);
            return (
              <button
                type="button"
                key={pl.id}
                onClick={() => handleToggle(pl.id)}
                className={`w-full flex items-center justify-between p-3 rounded-xl border text-right transition cursor-pointer ${
                  hasItem
                    ? 'bg-amber-950/40 border-amber-500/50 text-white shadow-xs'
                    : 'bg-stone-800/60 border-stone-700/60 text-stone-300 hover:bg-stone-800 hover:border-stone-600'
                }`}
              >
                <div className="flex items-center gap-2.5">
                  <span className="text-sm font-semibold">{pl.title}</span>
                  <span className="text-[11px] text-stone-400">({pl.surahNumbers.length} سور)</span>
                </div>
                <div
                  className={`w-6 h-6 rounded-lg flex items-center justify-center border transition ${
                    hasItem
                      ? 'bg-amber-500 border-amber-400 text-stone-950'
                      : 'border-stone-600 text-transparent'
                  }`}
                >
                  <Check className="w-4 h-4 stroke-[3]" />
                </div>
              </button>
            );
          })}
        </div>

        {showCreateInline ? (
          <div className="p-3 bg-stone-800/90 rounded-xl border border-stone-700 space-y-2">
            <input
              type="text"
              placeholder="اسم القائمة الجديدة (مثال: أذكار الصباح)"
              value={newTitle}
              onChange={(e) => setNewTitle(e.target.value)}
              className="w-full px-3 py-2 bg-stone-900 border border-stone-700 rounded-lg text-sm text-white placeholder-stone-500 focus:outline-hidden focus:border-amber-500 text-right"
              autoFocus
            />
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={handleCreateAndAdd}
                disabled={!newTitle.trim()}
                className="flex-1 py-1.5 px-3 bg-amber-600 hover:bg-amber-500 disabled:opacity-50 text-stone-950 font-bold text-xs rounded-lg transition cursor-pointer"
              >
                إنشاء وإضافة السورة
              </button>
              <button
                type="button"
                onClick={() => setShowCreateInline(false)}
                className="py-1.5 px-3 text-stone-400 hover:text-white text-xs transition cursor-pointer"
              >
                إلغاء
              </button>
            </div>
          </div>
        ) : (
          <button
            type="button"
            onClick={() => setShowCreateInline(true)}
            className="w-full py-2.5 px-3 border border-dashed border-amber-500/40 hover:border-amber-500 bg-amber-500/5 hover:bg-amber-500/10 rounded-xl text-amber-300 text-xs font-semibold flex items-center justify-center gap-2 transition cursor-pointer"
          >
            <FolderPlus className="w-4 h-4" />
            إنشاء قائمة جديدة وإضافة هذه السورة
          </button>
        )}

        <div className="mt-4 pt-3 border-t border-stone-800 flex justify-end">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-1.5 bg-stone-800 hover:bg-stone-700 text-stone-300 text-xs rounded-lg transition cursor-pointer"
          >
            إغلاق
          </button>
        </div>
      </div>
    </div>
  );
};
