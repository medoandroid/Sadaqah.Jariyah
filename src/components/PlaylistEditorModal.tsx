import React, { useState, useEffect } from 'react';
import {
  X,
  Sparkles,
  Heart,
  Shield,
  Book,
  Moon,
  ListMusic,
  Flame,
  Layers,
  Plus,
  Trash2,
  Check,
  Search,
  BookOpen
} from 'lucide-react';
import {
  customPlaylistsService,
  CustomPlaylist,
} from '../services/customPlaylistsService';
import { ALL_SURAHS, ALL_JUZ_METADATA } from '../data/quranMeta';

interface PlaylistEditorModalProps {
  isOpen: boolean;
  onClose: () => void;
  playlistToEdit?: CustomPlaylist | null;
  onSaved?: (playlist: CustomPlaylist) => void;
}

export const PlaylistEditorModal: React.FC<PlaylistEditorModalProps> = ({
  isOpen,
  onClose,
  playlistToEdit,
  onSaved,
}) => {
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [selectedIcon, setSelectedIcon] = useState<CustomPlaylist['icon']>('sparkles');
  const [selectedColor, setSelectedColor] = useState('#D97706');
  const [selectedSurahNumbers, setSelectedSurahNumbers] = useState<number[]>([]);
  const [surahSearchQuery, setSurahSearchQuery] = useState('');
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  useEffect(() => {
    if (playlistToEdit) {
      setTitle(playlistToEdit.title);
      setDescription(playlistToEdit.description);
      setSelectedIcon(playlistToEdit.icon);
      setSelectedColor(playlistToEdit.color);
      setSelectedSurahNumbers([...playlistToEdit.surahNumbers]);
    } else {
      setTitle('');
      setDescription('');
      setSelectedIcon('sparkles');
      setSelectedColor('#D97706');
      setSelectedSurahNumbers([]);
    }
    setErrorMsg(null);
  }, [playlistToEdit, isOpen]);

  if (!isOpen) return null;

  const iconsList: Array<{ id: CustomPlaylist['icon']; label: string; icon: React.ReactNode }> = [
    { id: 'sparkles', label: 'مختارات', icon: <Sparkles className="w-4 h-4" /> },
    { id: 'heart', label: 'مفضلة', icon: <Heart className="w-4 h-4" /> },
    { id: 'book', label: 'ورد', icon: <Book className="w-4 h-4" /> },
    { id: 'shield', label: 'رقية', icon: <Shield className="w-4 h-4" /> },
    { id: 'moon', label: 'نوم', icon: <Moon className="w-4 h-4" /> },
    { id: 'list', label: 'قائمة', icon: <ListMusic className="w-4 h-4" /> },
    { id: 'flame', label: 'همة', icon: <Flame className="w-4 h-4" /> },
    { id: 'layers', label: 'أجزاء', icon: <Layers className="w-4 h-4" /> },
  ];

  const colorsList = ['#D97706', '#059669', '#2563EB', '#7C3AED', '#DB2777', '#E11D48', '#0D9488'];

  const toggleSurah = (num: number) => {
    if (selectedSurahNumbers.includes(num)) {
      setSelectedSurahNumbers(selectedSurahNumbers.filter((n) => n !== num));
    } else {
      setSelectedSurahNumbers([...selectedSurahNumbers, num]);
    }
  };

  const handleSelectJuz = (juzNum: number) => {
    const juz = ALL_JUZ_METADATA.find((j) => j.number === juzNum);
    if (!juz) return;
    const surahsInJuz = ALL_SURAHS.filter(
      (s) => s.startPage >= juz.startPage && s.startPage <= juz.endPage
    ).map((s) => s.number);

    const merged = Array.from(new Set([...selectedSurahNumbers, ...surahsInJuz]));
    setSelectedSurahNumbers(merged);
  };

  const handleSave = () => {
    if (!title.trim()) {
      setErrorMsg('يرجى إدخال اسم القائمة');
      return;
    }

    if (playlistToEdit) {
      customPlaylistsService.updatePlaylist(playlistToEdit.id, {
        title,
        description,
        icon: selectedIcon,
        color: selectedColor,
      });
      // Update surahs
      const pl = customPlaylistsService.getPlaylistById(playlistToEdit.id);
      if (pl) {
        pl.surahNumbers = selectedSurahNumbers;
        onSaved?.(pl);
      }
    } else {
      const created = customPlaylistsService.createPlaylist({
        title,
        description,
        icon: selectedIcon,
        color: selectedColor,
        initialSurahs: selectedSurahNumbers,
      });
      onSaved?.(created);
    }

    onClose();
  };

  const filteredSurahs = ALL_SURAHS.filter((s) => {
    if (!surahSearchQuery) return true;
    return s.name.includes(surahSearchQuery) || String(s.number) === surahSearchQuery;
  });

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/75 backdrop-blur-md animate-in fade-in duration-200"
      onClick={onClose}
      dir="rtl"
    >
      <div
        className="relative w-full max-w-xl max-h-[92vh] flex flex-col bg-[#141720] text-stone-100 rounded-3xl border border-amber-500/35 shadow-2xl overflow-hidden"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="p-4 sm:p-5 border-b border-stone-800 bg-[#171B24] flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-amber-500/20 border border-amber-500/40 flex items-center justify-center text-amber-400">
              <ListMusic className="w-5 h-5" />
            </div>
            <div>
              <h2 className="font-amiri text-lg sm:text-xl font-bold text-white">
                {playlistToEdit ? 'تعديل قائمة التشغيل' : 'إنشاء قائمة تشغيل جديدة'}
              </h2>
              <p className="text-[11px] text-stone-400">
                خصص سورك المفضلة واستمع إليها متسلسلة بتشغيل تلقائي
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-1.5 rounded-lg text-stone-400 hover:text-white hover:bg-stone-800 transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Scrollable Form */}
        <div className="p-4 sm:p-5 overflow-y-auto space-y-4">
          {errorMsg && (
            <div className="p-2.5 rounded-xl bg-rose-950/60 border border-rose-500/40 text-xs text-rose-300">
              {errorMsg}
            </div>
          )}

          {/* Title */}
          <div className="space-y-1">
            <label className="block text-xs font-bold text-stone-300">اسم القائمة *</label>
            <input
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="مثال: ورد الفجر، تلاوات السكينة، جزء تبارك..."
              className="w-full bg-stone-900 border border-stone-800 rounded-xl px-3 py-2 text-sm text-stone-100 focus:outline-none focus:border-amber-500"
            />
          </div>

          {/* Description */}
          <div className="space-y-1">
            <label className="block text-xs font-bold text-stone-300">وصف القائمة (اختياري)</label>
            <input
              type="text"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="وصف مختصر لمناسبة الاستماع أو السور"
              className="w-full bg-stone-900 border border-stone-800 rounded-xl px-3 py-2 text-sm text-stone-100 focus:outline-none focus:border-amber-500"
            />
          </div>

          {/* Icon & Color selector */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div className="space-y-1.5">
              <label className="block text-xs font-bold text-stone-300">أيقونة القائمة</label>
              <div className="grid grid-cols-4 gap-1.5">
                {iconsList.map((ic) => (
                  <button
                    key={ic.id}
                    type="button"
                    onClick={() => setSelectedIcon(ic.id)}
                    className={`p-2 rounded-xl border flex flex-col items-center gap-1 transition-all cursor-pointer ${
                      selectedIcon === ic.id
                        ? 'bg-amber-500/25 border-amber-500 text-amber-300 font-bold'
                        : 'border-stone-800 bg-stone-900 hover:bg-stone-850 text-stone-400'
                    }`}
                  >
                    {ic.icon}
                    <span className="text-[10px]">{ic.label}</span>
                  </button>
                ))}
              </div>
            </div>

            <div className="space-y-1.5">
              <label className="block text-xs font-bold text-stone-300">لون القائمة</label>
              <div className="flex items-center gap-2 flex-wrap pt-1">
                {colorsList.map((col) => (
                  <button
                    key={col}
                    type="button"
                    onClick={() => setSelectedColor(col)}
                    className={`w-7 h-7 rounded-full border-2 transition-transform cursor-pointer ${
                      selectedColor === col ? 'scale-110 border-white ring-2 ring-amber-400' : 'border-transparent'
                    }`}
                    style={{ backgroundColor: col }}
                  />
                ))}
              </div>
            </div>
          </div>

          {/* Quick Add By Juz */}
          <div className="space-y-1.5 pt-1">
            <label className="block text-xs font-bold text-stone-300">إضافة سريعة حسب الأجزاء:</label>
            <div className="flex items-center gap-1.5 overflow-x-auto pb-1 scrollbar-none text-[11px]">
              {[30, 29, 28, 1, 2].map((jNum) => (
                <button
                  key={jNum}
                  type="button"
                  onClick={() => handleSelectJuz(jNum)}
                  className="px-2.5 py-1 rounded-lg bg-stone-850 hover:bg-stone-800 border border-stone-700/60 text-stone-300 hover:text-white shrink-0 transition-colors cursor-pointer"
                >
                  + إضافة الجزء {jNum}
                </button>
              ))}
            </div>
          </div>

          {/* Surahs Checklist */}
          <div className="space-y-2 pt-2 border-t border-stone-800">
            <div className="flex items-center justify-between">
              <label className="text-xs font-bold text-stone-300">
                السور المضمنة في القائمة ({selectedSurahNumbers.length} سورة مختارة)
              </label>
              {selectedSurahNumbers.length > 0 && (
                <button
                  type="button"
                  onClick={() => setSelectedSurahNumbers([])}
                  className="text-[10px] text-stone-400 hover:text-rose-300 cursor-pointer"
                >
                  إلغاء تحديد الكل
                </button>
              )}
            </div>

            <div className="relative">
              <Search className="w-3.5 h-3.5 text-stone-500 absolute right-3 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                placeholder="بحث في سور القرآن..."
                value={surahSearchQuery}
                onChange={(e) => setSurahSearchQuery(e.target.value)}
                className="w-full bg-stone-900 border border-stone-800 rounded-xl pr-8 pl-3 py-1.5 text-xs text-stone-100 focus:outline-none focus:border-amber-500"
              />
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-3 gap-1.5 max-h-48 overflow-y-auto pr-1">
              {filteredSurahs.map((surah) => {
                const isSelected = selectedSurahNumbers.includes(surah.number);
                return (
                  <button
                    key={surah.number}
                    type="button"
                    onClick={() => toggleSurah(surah.number)}
                    className={`p-2 rounded-xl text-right text-xs transition-colors flex items-center justify-between cursor-pointer border ${
                      isSelected
                        ? 'bg-amber-500/20 border-amber-500/50 text-amber-200 font-bold'
                        : 'bg-stone-900 hover:bg-stone-850 border-stone-800 text-stone-300'
                    }`}
                  >
                    <span className="truncate">
                      {surah.number}. {surah.name}
                    </span>
                    {isSelected && <Check className="w-3.5 h-3.5 text-amber-400 shrink-0" />}
                  </button>
                );
              })}
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="p-3 sm:p-4 border-t border-stone-800 bg-[#171B24] flex items-center justify-between">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 rounded-xl bg-stone-800 hover:bg-stone-700 text-stone-300 text-xs font-semibold cursor-pointer"
          >
            إلغاء
          </button>
          <button
            type="button"
            onClick={handleSave}
            className="px-5 py-2 rounded-xl bg-amber-500 hover:bg-amber-400 text-stone-950 text-xs font-bold transition-colors cursor-pointer flex items-center gap-1.5 shadow-md"
          >
            <Check className="w-4 h-4" />
            <span>{playlistToEdit ? 'حفظ التعديلات' : 'إنشاء القائمة الآن'}</span>
          </button>
        </div>
      </div>
    </div>
  );
};
