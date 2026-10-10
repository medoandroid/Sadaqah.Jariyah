import React, { useState } from 'react';
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
  Volume2,
  CheckCircle2,
  Clock,
  Radio
} from 'lucide-react';
import { QURAN_PLAYLISTS, QuranPlaylist } from '../data/playlists';
import { ALL_SURAHS } from '../data/quranMeta';
import { useAudio } from '../context/AudioContext';
import { Reciter } from '../types';
import { recordDedication } from '../services/dedicationService';

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
    playSurah,
    togglePlay,
  } = useAudio();

  const [expandedPlaylistId, setExpandedPlaylistId] = useState<string | null>(null);

  const getPlaylistIcon = (iconName: QuranPlaylist['iconName']) => {
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
      default:
        return <Layers className="w-5 h-5 text-teal-400" />;
    }
  };

  const handlePlayPlaylist = (playlist: QuranPlaylist) => {
    // If already playing this playlist, toggle play/pause
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

  const handlePlaySpecificSurah = (surahNumber: number, playlist: QuranPlaylist) => {
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

  return (
    <div className="space-y-6 text-right animate-in fade-in duration-300">
      
      {/* Playlists Header Banner with Reciter Indicator */}
      <div className="p-5 sm:p-6 rounded-3xl bg-gradient-to-r from-[#171A22] via-[#1C202B] to-[#171A22] border border-amber-500/35 text-white flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 shadow-xl">
        <div className="space-y-1">
          <div className="inline-flex items-center gap-1.5 px-3 py-0.5 rounded-full bg-amber-500/20 text-amber-300 text-xs font-semibold border border-amber-500/30 mb-1">
            <Sparkles className="w-3.5 h-3.5 text-amber-400" />
            <span>قوائم تلاوة متتابعة ومختارة</span>
          </div>
          <h2 className="font-amiri text-2xl sm:text-3xl font-bold text-white">
            قوائم التشغيل القرآنية المخصصة
          </h2>
          <p className="text-xs sm:text-sm text-stone-300 max-w-xl">
            قوائم تشغيل متسلسلة للرقية الشرعية، الأربع اليومية، جزء عم، المعوذات، قبل النوم، والجمعة بصوت قارئك المختار مع استمرار التلاوة تلقائياً.
          </p>
        </div>

        {/* Selected Reciter Pill & Change Trigger */}
        <div className="p-3 rounded-2xl bg-stone-900/90 border border-stone-700/80 flex items-center gap-3 shrink-0">
          <div className="w-10 h-10 rounded-xl bg-amber-500/15 border border-amber-500/30 flex items-center justify-center text-amber-400 font-amiri font-bold text-base">
            {selectedReciter.name.charAt(0)}
          </div>
          <div className="text-right">
            <span className="text-[10px] text-stone-400 block">القارئ المعتمد للتلاوة:</span>
            <span className="font-amiri font-bold text-sm text-amber-300">{selectedReciter.name}</span>
          </div>
          {onOpenReciterSelector && (
            <button
              type="button"
              onClick={onOpenReciterSelector}
              className="text-[11px] font-semibold px-2.5 py-1.5 rounded-xl bg-amber-500/20 hover:bg-amber-500/30 text-amber-200 border border-amber-500/40 transition-colors cursor-pointer mr-1"
            >
              تغيير القارئ
            </button>
          )}
        </div>
      </div>

      {/* Playlists Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-5">
        {QURAN_PLAYLISTS.map((playlist) => {
          const isThisPlaylistPlaying = playlistTitle === playlist.title && isPlaying;
          const isThisPlaylistLoaded = playlistTitle === playlist.title;
          const isExpanded = expandedPlaylistId === playlist.id;

          // Resolve Surah names for this playlist
          const surahsInPlaylist = playlist.surahNumbers
            .map((num) => ALL_SURAHS.find((s) => s.number === num))
            .filter(Boolean);

          return (
            <div
              key={playlist.id}
              className={`rounded-3xl border transition-all overflow-hidden flex flex-col justify-between shadow-xs ${
                isThisPlaylistLoaded
                  ? 'bg-[#151821] border-amber-500/60 shadow-xl ring-1 ring-amber-500/40'
                  : 'bg-white hover:bg-stone-50/70 border-stone-200 hover:border-amber-300'
              }`}
            >
              {/* Top Card Body */}
              <div className="p-5 sm:p-6 space-y-4">
                
                {/* Header Row: Icon, Titles & Badge */}
                <div className="flex items-start justify-between gap-3">
                  <div className="flex items-center gap-3">
                    <div
                      className={`w-12 h-12 rounded-2xl flex items-center justify-center shrink-0 border ${
                        isThisPlaylistLoaded
                          ? 'bg-amber-500/20 border-amber-500/50 shadow-md'
                          : 'bg-amber-50 border-amber-200/80'
                      }`}
                    >
                      {getPlaylistIcon(playlist.iconName)}
                    </div>

                    <div>
                      <div className="flex items-center gap-2 flex-wrap">
                        <h3 className={`font-amiri text-xl sm:text-2xl font-bold ${
                          isThisPlaylistLoaded ? 'text-amber-200' : 'text-stone-900'
                        }`}>
                          {playlist.title}
                        </h3>
                        <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full border ${
                          isThisPlaylistLoaded
                            ? 'bg-amber-500/20 text-amber-300 border-amber-500/40'
                            : 'bg-stone-100 text-stone-700 border-stone-200'
                        }`}>
                          {playlist.badge}
                        </span>
                      </div>
                      <p className={`text-xs mt-0.5 font-medium ${
                        isThisPlaylistLoaded ? 'text-amber-300/80' : 'text-amber-800'
                      }`}>
                        {playlist.subtitle}
                      </p>
                    </div>
                  </div>

                  {/* Active Equalizer indicator if playing */}
                  {isThisPlaylistPlaying && (
                    <div className="flex items-end gap-0.5 h-4 shrink-0 px-2 py-1 rounded-md bg-amber-500/20 border border-amber-500/30">
                      <span className="w-1 bg-amber-400 rounded-full animate-bounce [animation-delay:-0.3s] h-3.5" />
                      <span className="w-1 bg-amber-300 rounded-full animate-bounce [animation-delay:-0.15s] h-4" />
                      <span className="w-1 bg-amber-500 rounded-full animate-bounce [animation-delay:-0.45s] h-2.5" />
                    </div>
                  )}
                </div>

                {/* Description */}
                <p className={`text-xs sm:text-sm leading-relaxed ${
                  isThisPlaylistLoaded ? 'text-stone-300' : 'text-stone-600'
                }`}>
                  {playlist.description}
                </p>

                {/* Quick Chips of Surahs */}
                <div className="flex items-center gap-1.5 flex-wrap">
                  <span className={`text-[11px] font-semibold shrink-0 ml-1 ${
                    isThisPlaylistLoaded ? 'text-stone-400' : 'text-stone-500'
                  }`}>
                    السور المشمولة:
                  </span>
                  {surahsInPlaylist.slice(0, 6).map((s) => (
                    <span
                      key={s!.number}
                      className={`text-[11px] px-2 py-0.5 rounded-lg border font-amiri font-semibold ${
                        isThisPlaylistLoaded
                          ? currentSurah?.number === s!.number
                            ? 'bg-amber-500 text-stone-950 font-bold border-amber-400 shadow-xs'
                            : 'bg-stone-800/80 text-stone-300 border-stone-700/70'
                          : currentSurah?.number === s!.number && isPlaying
                          ? 'bg-amber-800 text-white border-amber-800'
                          : 'bg-stone-100 text-stone-700 border-stone-200'
                      }`}
                    >
                      {s!.name}
                    </span>
                  ))}
                  {surahsInPlaylist.length > 6 && (
                    <span className={`text-[10px] px-1.5 py-0.5 rounded-md font-mono ${
                      isThisPlaylistLoaded ? 'text-amber-400' : 'text-stone-500'
                    }`}>
                      +{surahsInPlaylist.length - 6} سورة أخرى
                    </span>
                  )}
                </div>

              </div>

              {/* Bottom Card Action Bar */}
              <div className={`p-4 border-t flex items-center justify-between gap-3 ${
                isThisPlaylistLoaded ? 'border-stone-800 bg-[#111319]' : 'border-stone-100 bg-stone-50/70'
              }`}>
                {/* Play Full Playlist Button */}
                <button
                  type="button"
                  onClick={() => handlePlayPlaylist(playlist)}
                  className={`px-5 py-2.5 rounded-xl font-amiri text-base font-bold transition-all cursor-pointer flex items-center gap-2 shadow-sm active:scale-95 ${
                    isThisPlaylistPlaying
                      ? 'bg-amber-500 text-stone-950 shadow-md shadow-amber-500/25 ring-2 ring-amber-400'
                      : isThisPlaylistLoaded
                      ? 'bg-amber-600 hover:bg-amber-500 text-white'
                      : 'bg-amber-800 hover:bg-amber-900 text-white'
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
                  className={`px-3 py-2 rounded-xl text-xs font-semibold transition-colors flex items-center gap-1.5 cursor-pointer ${
                    isThisPlaylistLoaded
                      ? 'text-stone-300 hover:text-white hover:bg-stone-800'
                      : 'text-stone-600 hover:text-stone-900 hover:bg-stone-200/60'
                  }`}
                >
                  <span>{isExpanded ? 'إخفاء السور' : `عرض السور (${surahsInPlaylist.length})`}</span>
                  {isExpanded ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />}
                </button>
              </div>

              {/* Expandable Tracklist Accordion Drawer */}
              {isExpanded && (
                <div className={`p-4 border-t space-y-2 max-h-72 overflow-y-auto ${
                  isThisPlaylistLoaded ? 'border-stone-800 bg-[#0E1015]' : 'border-stone-100 bg-stone-100/50'
                }`}>
                  <div className="text-[11px] font-bold text-stone-400 px-1 mb-2">
                    اختر سورة للبدء منها مع استمرار القائمة بعدها:
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                    {surahsInPlaylist.map((surah) => {
                      const isSurahActive = currentSurah?.number === surah!.number;
                      const isSurahPlayingNow = isSurahActive && isPlaying;

                      return (
                        <div
                          key={surah!.number}
                          className={`p-2.5 rounded-xl border flex items-center justify-between transition-all ${
                            isSurahActive
                              ? 'bg-amber-600/20 border-amber-500/50 text-amber-300 font-bold'
                              : isThisPlaylistLoaded
                              ? 'bg-stone-900/60 border-stone-800 text-stone-200 hover:bg-stone-800/80'
                              : 'bg-white border-stone-200 text-stone-800 hover:border-amber-300'
                          }`}
                        >
                          <div className="flex items-center gap-2.5 min-w-0">
                            <span className="w-6 h-6 rounded-lg bg-stone-800 text-stone-300 font-mono text-[10px] flex items-center justify-center font-bold">
                              {surah!.number}
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

                          <button
                            type="button"
                            onClick={() => handlePlaySpecificSurah(surah!.number, playlist)}
                            className={`w-7 h-7 rounded-lg flex items-center justify-center transition-all cursor-pointer ${
                              isSurahPlayingNow
                                ? 'bg-amber-500 text-stone-950 font-bold'
                                : 'bg-stone-700/60 hover:bg-amber-600 text-white'
                            }`}
                            title={isSurahPlayingNow ? 'إيقاف' : 'تشغيل من هنا'}
                          >
                            {isSurahPlayingNow ? (
                              <Pause className="w-3.5 h-3.5 fill-current" />
                            ) : (
                              <Play className="w-3.5 h-3.5 fill-current ml-0.5" />
                            )}
                          </button>
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

    </div>
  );
};
