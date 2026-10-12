import React, { useState, useEffect } from 'react';
import {
  Play,
  Pause,
  ListMusic,
  Shield,
  Sparkles,
  BookOpen,
  Heart,
  Moon,
  Flame,
  Layers,
  ChevronDown,
  ChevronUp,
  Plus,
  Trash2,
  Edit2,
  ArrowUp,
  ArrowDown,
  X
} from 'lucide-react';
import {
  customPlaylistsService,
  CustomPlaylist,
} from '../services/customPlaylistsService';
import { ALL_SURAHS } from '../data/quranMeta';
import { useAudio } from '../context/AudioContext';
import { Reciter } from '../types';
import { recordDedication } from '../services/dedicationService';
import { PlaylistEditorModal } from './PlaylistEditorModal';

interface PlaylistsSectionProps {
  selectedReciter: Reciter;
  onOpenReciterSelector?: () => void;
  showToast: (msg: string) => void;
}

export const PlaylistsSection: React.FC<PlaylistsSectionProps> = ({
  selectedReciter,
  onOpenReciterSelector,
  showToast,
}) => {
  const {
    isPlaying,
    currentSurah,
    playlistTitle,
    playPlaylist,
    togglePlay,
  } = useAudio();

  const [playlists, setPlaylists] = useState<CustomPlaylist[]>([]);
  const [expandedPlaylistId, setExpandedPlaylistId] = useState<string | null>(null);
  const [isEditorOpen, setIsEditorOpen] = useState(false);
  const [editingPlaylist, setEditingPlaylist] = useState<CustomPlaylist | null>(null);

  useEffect(() => {
    const unsub = customPlaylistsService.subscribe((list) => {
      setPlaylists(list);
    });
    return () => unsub();
  }, []);

  const getPlaylistIcon = (iconName: CustomPlaylist['icon']) => {
    switch (iconName) {
      case 'shield':
        return <Shield className="w-5 h-5 text-emerald-400" />;
      case 'sparkles':
        return <Sparkles className="w-5 h-5 text-amber-400" />;
      case 'book':
        return <BookOpen className="w-5 h-5 text-sky-400" />;
      case 'heart':
        return <Heart className="w-5 h-5 text-rose-400" />;
      case 'moon':
        return <Moon className="w-5 h-5 text-indigo-400" />;
      case 'flame':
        return <Flame className="w-5 h-5 text-amber-400" />;
      case 'layers':
        return <Layers className="w-5 h-5 text-teal-400" />;
      case 'list':
      default:
        return <ListMusic className="w-5 h-5 text-amber-400" />;
    }
  };

  const handlePlayPlaylist = (playlist: CustomPlaylist) => {
    if (playlist.surahNumbers.length === 0) {
      showToast('القائمة فارغة، أضف إليها بعض السور للبدء');
      return;
    }

    if (playlistTitle === playlist.title) {
      togglePlay();
      return;
    }

    playPlaylist(playlist.surahNumbers, playlist.title, selectedReciter);
    recordDedication(
      'surah',
      `استماع لقائمة: ${playlist.title} بصوت ${selectedReciter.name}`,
      'all',
      1,
      'محمد أيمن'
    );
    showToast(`بدء تشغيل قائمة «${playlist.title}» بصوت ${selectedReciter.name}`);
  };

  const handlePlaySpecificSurah = (surahNumber: number, playlist: CustomPlaylist) => {
    const queueStartingFromHere = playlist.surahNumbers.slice(
      playlist.surahNumbers.indexOf(surahNumber)
    );
    playPlaylist(
      queueStartingFromHere.length > 0 ? queueStartingFromHere : playlist.surahNumbers,
      playlist.title,
      selectedReciter
    );
    showToast(`تشغيل من سورة رقم ${surahNumber} في قائمة «${playlist.title}»`);
  };

  const handleDeletePlaylist = (id: string, title: string) => {
    if (window.confirm(`هل أنت متأكد من حذف قائمة «${title}»؟`)) {
      customPlaylistsService.deletePlaylist(id);
      showToast(`تم حذف قائمة «${title}»`);
    }
  };

  const handleRemoveSurah = (playlistId: string, surahNumber: number) => {
    customPlaylistsService.removeSurahFromPlaylist(playlistId, surahNumber);
    showToast('تمت إزالة السورة من القائمة');
  };

  const handleMoveSurah = (playlistId: string, fromIdx: number, toIdx: number) => {
    customPlaylistsService.reorderSurahInPlaylist(playlistId, fromIdx, toIdx);
  };

  return (
    <div className="space-y-6 text-right animate-in fade-in duration-300">
      {/* Playlists Header Banner with Reciter Indicator & Add New Trigger */}
      <div className="p-5 sm:p-6 rounded-3xl bg-gradient-to-r from-[#171A22] via-[#1C202B] to-[#171A22] border border-amber-500/35 text-white flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 shadow-xl">
        <div className="space-y-1">
          <div className="inline-flex items-center gap-1.5 px-3 py-0.5 rounded-full bg-amber-500/20 text-amber-300 text-xs font-semibold border border-amber-500/30 mb-1">
            <Sparkles className="w-3.5 h-3.5 text-amber-400" />
            <span>قوائم تلاوة متتابعة ومخصصة</span>
          </div>
          <h2 className="font-amiri text-2xl sm:text-3xl font-bold text-white">
            قوائم القرآن الكريم والتلاوات المخصصة
          </h2>
          <p className="text-xs sm:text-sm text-stone-300 max-w-xl">
            أنشئ قوائم تلاوة خاصة بك، ورتّب السور حسب وردك اليومي أو مناسبات الاستماع، مع استمرار التشغيل التلقائي وحفظ البيانات محلياً.
          </p>
        </div>

        {/* Action Buttons: Create New Playlist & Reciter Switcher */}
        <div className="flex items-center gap-2.5 flex-wrap">
          <button
            type="button"
            onClick={() => {
              setEditingPlaylist(null);
              setIsEditorOpen(true);
            }}
            className="px-4 py-2.5 rounded-2xl bg-amber-500 hover:bg-amber-400 text-stone-950 font-bold text-xs sm:text-sm transition-all cursor-pointer flex items-center gap-2 shadow-lg shadow-amber-500/20 active:scale-95"
          >
            <Plus className="w-4 h-4" />
            <span>+ إنشاء قائمة جديدة</span>
          </button>

          <div className="p-2 sm:p-2.5 rounded-2xl bg-stone-900/90 border border-stone-700/80 flex items-center gap-2 shrink-0">
            <div className="text-right">
              <span className="text-[10px] text-stone-400 block">القارئ الحالي:</span>
              <span className="font-amiri font-bold text-xs text-amber-300">{selectedReciter.name}</span>
            </div>
            {onOpenReciterSelector && (
              <button
                type="button"
                onClick={onOpenReciterSelector}
                className="text-[10px] font-semibold px-2 py-1 rounded-lg bg-amber-500/20 hover:bg-amber-500/30 text-amber-200 border border-amber-500/40 transition-colors cursor-pointer"
              >
                تغيير
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Playlists Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-5">
        {playlists.map((playlist) => {
          const isThisPlaylistPlaying = playlistTitle === playlist.title && isPlaying;
          const isThisPlaylistLoaded = playlistTitle === playlist.title;
          const isExpanded = expandedPlaylistId === playlist.id;

          // Resolve Surahs in playlist
          const surahsInPlaylist = playlist.surahNumbers
            .map((num) => ALL_SURAHS.find((s) => s.number === num))
            .filter(Boolean);

          return (
            <div
              key={playlist.id}
              className={`rounded-3xl border transition-all overflow-hidden flex flex-col justify-between shadow-xs ${
                isThisPlaylistLoaded
                  ? 'bg-[#151821] border-amber-500/60 shadow-xl ring-1 ring-amber-500/40'
                  : 'bg-[#15171F] hover:bg-[#181B24] border-stone-850 hover:border-amber-500/30'
              }`}
            >
              {/* Top Card Body */}
              <div className="p-5 sm:p-6 space-y-4">
                {/* Header Row: Icon, Title, Controls */}
                <div className="flex items-start justify-between gap-3">
                  <div className="flex items-center gap-3">
                    <div
                      className="w-12 h-12 rounded-2xl flex items-center justify-center shrink-0 border"
                      style={{
                        backgroundColor: `${playlist.color}20`,
                        borderColor: `${playlist.color}40`,
                      }}
                    >
                      {getPlaylistIcon(playlist.icon)}
                    </div>

                    <div>
                      <div className="flex items-center gap-2 flex-wrap">
                        <h3 className="font-amiri text-xl sm:text-2xl font-bold text-white">
                          {playlist.title}
                        </h3>
                        {playlist.isSystem && (
                          <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-amber-500/15 text-amber-300 border border-amber-500/30">
                            قائمة أساسية
                          </span>
                        )}
                      </div>
                      <p className="text-xs mt-0.5 text-stone-400">
                        {playlist.description}
                      </p>
                    </div>
                  </div>

                  {/* Top Right: Custom Playlist Actions (Edit / Delete) */}
                  <div className="flex items-center gap-1">
                    {!playlist.isSystem && (
                      <>
                        <button
                          type="button"
                          onClick={() => {
                            setEditingPlaylist(playlist);
                            setIsEditorOpen(true);
                          }}
                          className="p-1.5 rounded-lg text-stone-400 hover:text-amber-300 hover:bg-stone-800 transition-colors cursor-pointer"
                          title="تعديل القائمة"
                        >
                          <Edit2 className="w-3.5 h-3.5" />
                        </button>
                        <button
                          type="button"
                          onClick={() => handleDeletePlaylist(playlist.id, playlist.title)}
                          className="p-1.5 rounded-lg text-stone-500 hover:text-rose-400 hover:bg-stone-800 transition-colors cursor-pointer"
                          title="حذف القائمة"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </>
                    )}

                    {isThisPlaylistPlaying && (
                      <div className="flex items-end gap-0.5 h-4 px-2 py-1 rounded-md bg-amber-500/20 border border-amber-500/30">
                        <span className="w-1 bg-amber-400 rounded-full animate-bounce [animation-delay:-0.3s] h-3.5" />
                        <span className="w-1 bg-amber-300 rounded-full animate-bounce [animation-delay:-0.15s] h-4" />
                        <span className="w-1 bg-amber-500 rounded-full animate-bounce [animation-delay:-0.45s] h-2.5" />
                      </div>
                    )}
                  </div>
                </div>

                {/* Quick Chips of Surahs */}
                <div className="flex items-center gap-1.5 flex-wrap">
                  <span className="text-[11px] font-semibold text-stone-400 ml-1">
                    السور ({surahsInPlaylist.length}):
                  </span>
                  {surahsInPlaylist.length === 0 ? (
                    <span className="text-xs text-stone-500">لا توجد سور مضافة بعد</span>
                  ) : (
                    surahsInPlaylist.slice(0, 7).map((s) => (
                      <span
                        key={s!.number}
                        className={`text-[11px] px-2 py-0.5 rounded-lg border font-amiri font-semibold ${
                          currentSurah?.number === s!.number && isPlaying
                            ? 'bg-amber-500 text-stone-950 font-bold border-amber-400 shadow-xs'
                            : 'bg-stone-850 text-stone-300 border-stone-800'
                        }`}
                      >
                        {s!.name}
                      </span>
                    ))
                  )}
                  {surahsInPlaylist.length > 7 && (
                    <span className="text-[10px] px-1.5 py-0.5 rounded-md font-mono text-amber-400 bg-stone-900 border border-stone-800">
                      +{surahsInPlaylist.length - 7} سورة أخرى
                    </span>
                  )}
                </div>
              </div>

              {/* Bottom Card Action Bar */}
              <div className="p-4 border-t border-stone-800 bg-[#12141C] flex items-center justify-between gap-3">
                {/* Play Full Playlist Button */}
                <button
                  type="button"
                  onClick={() => handlePlayPlaylist(playlist)}
                  disabled={surahsInPlaylist.length === 0}
                  className={`px-5 py-2.5 rounded-xl font-amiri text-base font-bold transition-all cursor-pointer flex items-center gap-2 shadow-sm active:scale-95 disabled:opacity-40 disabled:cursor-not-allowed ${
                    isThisPlaylistPlaying
                      ? 'bg-amber-500 text-stone-950 shadow-md shadow-amber-500/25 ring-2 ring-amber-400'
                      : 'bg-amber-600 hover:bg-amber-500 text-white'
                  }`}
                >
                  {isThisPlaylistPlaying ? (
                    <>
                      <Pause className="w-4 h-4 fill-current stroke-current" />
                      <span>إيقاف مؤقت للقائمة</span>
                    </>
                  ) : (
                    <>
                      <Play className="w-4 h-4 fill-current stroke-current ml-0.5" />
                      <span>تشغيل القائمة كاملة</span>
                    </>
                  )}
                </button>

                {/* Toggle Tracklist Accordion */}
                <button
                  type="button"
                  onClick={() => setExpandedPlaylistId(isExpanded ? null : playlist.id)}
                  className="px-3 py-2 rounded-xl text-xs font-semibold text-stone-300 hover:text-white hover:bg-stone-800 transition-colors flex items-center gap-1.5 cursor-pointer"
                >
                  <span>{isExpanded ? 'إخفاء السور' : `عرض السور والتعديل (${surahsInPlaylist.length})`}</span>
                  {isExpanded ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />}
                </button>
              </div>

              {/* Expandable Tracklist Drawer with Reordering & Deletion */}
              {isExpanded && (
                <div className="p-4 border-t border-stone-800 bg-[#0E1015] space-y-2 max-h-80 overflow-y-auto">
                  <div className="text-[11px] font-bold text-stone-400 px-1 mb-2 flex items-center justify-between">
                    <span>اختر سورة للبدء منها مع إمكانية إعادة الترتيب:</span>
                    <button
                      type="button"
                      onClick={() => {
                        setEditingPlaylist(playlist);
                        setIsEditorOpen(true);
                      }}
                      className="text-amber-400 hover:underline cursor-pointer"
                    >
                      + إضافة سور للقائمة
                    </button>
                  </div>

                  <div className="space-y-1.5">
                    {surahsInPlaylist.map((surah, idx) => {
                      const isSurahActive = currentSurah?.number === surah!.number;
                      const isSurahPlayingNow = isSurahActive && isPlaying;

                      return (
                        <div
                          key={surah!.number}
                          className={`p-2.5 rounded-xl border flex items-center justify-between transition-all ${
                            isSurahActive
                              ? 'bg-amber-600/20 border-amber-500/50 text-amber-300 font-bold'
                              : 'bg-stone-900 border-stone-800 text-stone-200'
                          }`}
                        >
                          <div className="flex items-center gap-2.5 min-w-0">
                            <span className="w-6 h-6 rounded-lg bg-stone-800 text-stone-300 font-mono text-[10px] flex items-center justify-center font-bold">
                              {idx + 1}
                            </span>
                            <div className="truncate">
                              <span className="font-amiri text-sm block leading-tight">
                                سورة {surah!.name}
                              </span>
                              <span className="text-[10px] text-stone-400 block">
                                {surah!.revelationArabic} · {surah!.numberOfAyahs} آية
                              </span>
                            </div>
                          </div>

                          <div className="flex items-center gap-1.5">
                            {/* Reorder Buttons */}
                            {idx > 0 && (
                              <button
                                type="button"
                                onClick={() => handleMoveSurah(playlist.id, idx, idx - 1)}
                                className="p-1 rounded text-stone-500 hover:text-stone-200 hover:bg-stone-800 transition-colors cursor-pointer"
                                title="تحريك لأعلى"
                              >
                                <ArrowUp className="w-3 h-3" />
                              </button>
                            )}
                            {idx < surahsInPlaylist.length - 1 && (
                              <button
                                type="button"
                                onClick={() => handleMoveSurah(playlist.id, idx, idx + 1)}
                                className="p-1 rounded text-stone-500 hover:text-stone-200 hover:bg-stone-800 transition-colors cursor-pointer"
                                title="تحريك لأسفل"
                              >
                                <ArrowDown className="w-3 h-3" />
                              </button>
                            )}

                            {/* Play from here */}
                            <button
                              type="button"
                              onClick={() => handlePlaySpecificSurah(surah!.number, playlist)}
                              className={`w-7 h-7 rounded-lg flex items-center justify-center transition-all cursor-pointer ${
                                isSurahPlayingNow
                                  ? 'bg-amber-500 text-stone-950 font-bold'
                                  : 'bg-stone-800 hover:bg-amber-600 text-white'
                              }`}
                              title={isSurahPlayingNow ? 'إيقاف' : 'تشغيل من هنا'}
                            >
                              {isSurahPlayingNow ? (
                                <Pause className="w-3.5 h-3.5 fill-current" />
                              ) : (
                                <Play className="w-3.5 h-3.5 fill-current ml-0.5" />
                              )}
                            </button>

                            {/* Remove from playlist */}
                            <button
                              type="button"
                              onClick={() => handleRemoveSurah(playlist.id, surah!.number)}
                              className="p-1 rounded text-stone-500 hover:text-rose-400 hover:bg-stone-800 transition-colors cursor-pointer"
                              title="إزالة من القائمة"
                            >
                              <X className="w-3.5 h-3.5" />
                            </button>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}
            </div>
          );
        })}
      </div>

      {/* Playlist Editor Modal */}
      <PlaylistEditorModal
        isOpen={isEditorOpen}
        onClose={() => {
          setIsEditorOpen(false);
          setEditingPlaylist(null);
        }}
        playlistToEdit={editingPlaylist}
        onSaved={(savedPl) => {
          showToast(`تم حفظ قائمة «${savedPl.title}» بنجاح`);
        }}
      />
    </div>
  );
};
