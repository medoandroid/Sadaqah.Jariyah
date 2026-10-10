import React, { useState, useMemo, useEffect } from 'react';
import {
  Search,
  X,
  Check,
  Radio,
  User,
  Sparkles,
  Music,
  SlidersHorizontal,
  Flame,
  Star,
  Heart
} from 'lucide-react';
import { Reciter } from '../types';
import { EXPANDED_RECITERS, RIWAYAT } from '../data/reciters';
import { storageService } from '../services/storageService';

interface ReciterSelectModalProps {
  isOpen: boolean;
  onClose: () => void;
  currentReciter: Reciter;
  onSelectReciter: (reciter: (typeof EXPANDED_RECITERS)[0]) => void;
}

export const ReciterSelectModal: React.FC<ReciterSelectModalProps> = ({
  isOpen,
  onClose,
  currentReciter,
  onSelectReciter,
}) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedRiwayah, setSelectedRiwayah] = useState<string>('all');
  const [selectedStyle, setSelectedStyle] = useState<'all' | 'murattal' | 'mujawwad' | 'haramain' | 'favorites'>('all');
  const [favoriteId, setFavoriteId] = useState<string>(() => {
    return storageService.getString('favorite_reciter_id', 'ar.alafasy');
  });

  // Reset or focus when opened
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
      setFavoriteId(storageService.getString('favorite_reciter_id', 'ar.alafasy'));
    } else {
      document.body.style.overflow = '';
      setSearchQuery('');
    }
    return () => {
      document.body.style.overflow = '';
    };
  }, [isOpen]);

  // Handle ESC key
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isOpen) {
        onClose();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  const handleToggleFavorite = (reciterId: string, e: React.MouseEvent) => {
    e.stopPropagation();
    const newFav = favoriteId === reciterId ? '' : reciterId;
    setFavoriteId(newFav);
    storageService.setString('favorite_reciter_id', newFav);
  };

  // Filter reciters
  const filteredReciters = useMemo(() => {
    return EXPANDED_RECITERS.filter((reciter) => {
      // Filter by Favorite
      if (selectedStyle === 'favorites') {
        if (reciter.id !== favoriteId) return false;
      }

      // Filter by Riwayah
      if (selectedRiwayah !== 'all' && reciter.riwayahId !== selectedRiwayah) {
        return false;
      }

      // Filter by style
      if (selectedStyle === 'mujawwad') {
        if (!reciter.name.includes('المجود') && !reciter.style?.includes('تجويد')) {
          return false;
        }
      } else if (selectedStyle === 'murattal') {
        if (reciter.name.includes('المجود') || reciter.style?.includes('تجويد')) {
          return false;
        }
      } else if (selectedStyle === 'haramain') {
        const haramainNames = ['ماهر المعيقلي', 'ياسر الدوسري', 'سعود الشريم', 'عبد الرحمن السديس', 'عبد الله الجهني', 'علي عبد الله جابر', 'عبد الله خياط'];
        if (!haramainNames.some(hn => reciter.name.includes(hn))) {
          return false;
        }
      }

      // Filter by search query
      if (searchQuery.trim()) {
        const q = searchQuery.trim().toLowerCase();
        const matchName = reciter.name.toLowerCase().includes(q);
        const matchRiwayah = reciter.riwayah.toLowerCase().includes(q);
        const matchSub = reciter.subName ? reciter.subName.toLowerCase().includes(q) : false;
        const matchStyle = reciter.style ? reciter.style.toLowerCase().includes(q) : false;
        if (!matchName && !matchRiwayah && !matchSub && !matchStyle) {
          return false;
        }
      }

      return true;
    });
  }, [searchQuery, selectedRiwayah, selectedStyle, favoriteId]);

  if (!isOpen) return null;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-5 bg-stone-950/85 backdrop-blur-md animate-in fade-in duration-200 select-none"
      role="dialog"
      aria-modal="true"
      aria-label="قائمة القراء والمصاحف المرتلة"
    >
      <div className="w-full max-w-3xl max-h-[90vh] bg-[#12151D] border border-amber-500/40 rounded-3xl shadow-2xl flex flex-col overflow-hidden text-stone-100">
        
        {/* Modal Header */}
        <div className="p-4 sm:p-5 border-b border-stone-800 bg-[#161A24] flex items-center justify-between shrink-0">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-amber-500/20 border border-amber-500/40 flex items-center justify-center text-amber-400">
              <Radio className="w-5 h-5" />
            </div>
            <div>
              <h2 className="font-amiri text-xl sm:text-2xl font-bold text-white leading-tight">
                اختر القارئ والمصحف الصوتي
              </h2>
              <p className="text-[11px] text-stone-400">
                أصوات كبار قراء العالم الإسلامي مع إمكانية حفظ قارئك المفضل
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="p-1.5 rounded-xl text-stone-400 hover:text-white hover:bg-stone-800 transition-colors cursor-pointer"
            aria-label="إغلاق"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Search & Style Filter Toolbar */}
        <div className="p-3 sm:p-4 bg-[#141821] border-b border-stone-800 space-y-3 shrink-0">
          
          {/* Search Box */}
          <div className="relative">
            <Search className="w-4 h-4 text-stone-400 absolute right-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="ابحث عن شيخك المفضل (العفاسي، المنشاوي، عبد الباسط، المعيقلي...)"
              className="w-full pr-10 pl-4 py-2 text-xs sm:text-sm rounded-xl bg-stone-900/90 border border-stone-700/80 focus:outline-hidden focus:border-amber-500 text-white placeholder-stone-500"
              autoFocus
            />
            {searchQuery && (
              <button
                type="button"
                onClick={() => setSearchQuery('')}
                className="absolute left-3 top-1/2 -translate-y-1/2 text-stone-400 hover:text-white text-xs cursor-pointer"
              >
                مسح
              </button>
            )}
          </div>

          {/* Quick Style Filter Tabs */}
          <div className="flex items-center gap-1.5 overflow-x-auto pb-1 scrollbar-none text-xs">
            <button
              type="button"
              onClick={() => setSelectedStyle('all')}
              className={`px-3 py-1 rounded-xl text-xs font-semibold whitespace-nowrap transition-all cursor-pointer ${
                selectedStyle === 'all'
                  ? 'bg-amber-600 text-white shadow-xs'
                  : 'bg-stone-800 text-stone-300 hover:bg-stone-700'
              }`}
            >
              جميع القراء ({EXPANDED_RECITERS.length})
            </button>

            <button
              type="button"
              onClick={() => setSelectedStyle('favorites')}
              className={`px-3 py-1 rounded-xl text-xs font-semibold whitespace-nowrap transition-all cursor-pointer flex items-center gap-1 ${
                selectedStyle === 'favorites'
                  ? 'bg-amber-500 text-stone-950 font-bold shadow-xs'
                  : 'bg-stone-800 text-amber-300 hover:bg-stone-700'
              }`}
            >
              <Star className="w-3.5 h-3.5 fill-current" />
              <span>القارئ المفضل</span>
            </button>

            <button
              type="button"
              onClick={() => setSelectedStyle('murattal')}
              className={`px-3 py-1 rounded-xl text-xs font-semibold whitespace-nowrap transition-all cursor-pointer ${
                selectedStyle === 'murattal'
                  ? 'bg-amber-600 text-white shadow-xs'
                  : 'bg-stone-800 text-stone-300 hover:bg-stone-700'
              }`}
            >
              المصحف المرتل
            </button>
            <button
              type="button"
              onClick={() => setSelectedStyle('mujawwad')}
              className={`px-3 py-1 rounded-xl text-xs font-semibold whitespace-nowrap transition-all cursor-pointer ${
                selectedStyle === 'mujawwad'
                  ? 'bg-amber-600 text-white shadow-xs'
                  : 'bg-stone-800 text-stone-300 hover:bg-stone-700'
              }`}
            >
              المصحف المجود
            </button>
            <button
              type="button"
              onClick={() => setSelectedStyle('haramain')}
              className={`px-3 py-1 rounded-xl text-xs font-semibold whitespace-nowrap transition-all cursor-pointer ${
                selectedStyle === 'haramain'
                  ? 'bg-amber-600 text-white shadow-xs'
                  : 'bg-stone-800 text-stone-300 hover:bg-stone-700'
              }`}
            >
              أئمة الحرمين
            </button>
          </div>

          {/* Riwayah Filter Chips */}
          <div className="flex items-center gap-1.5 overflow-x-auto pb-1 scrollbar-none text-xs">
            <span className="text-[11px] text-stone-400 font-semibold shrink-0 ml-1">
              الرواية:
            </span>
            {RIWAYAT.map((riw) => (
              <button
                key={riw.id}
                type="button"
                onClick={() => setSelectedRiwayah(riw.id)}
                className={`px-2.5 py-1 rounded-xl text-xs whitespace-nowrap transition-all cursor-pointer ${
                  selectedRiwayah === riw.id
                    ? 'bg-amber-500/25 text-amber-300 font-bold border border-amber-500/50 shadow-2xs'
                    : 'bg-stone-800/80 text-stone-400 hover:text-stone-200 hover:bg-stone-700/80 border border-stone-700/50'
                }`}
              >
                {riw.name}
              </button>
            ))}
          </div>
        </div>

        {/* Reciters List */}
        <div className="flex-1 overflow-y-auto p-3 sm:p-4 space-y-2 text-right">
          {filteredReciters.length === 0 ? (
            <div className="p-8 text-center space-y-2 text-stone-400">
              <User className="w-10 h-10 mx-auto text-stone-600 opacity-60" />
              <p className="text-sm font-semibold text-stone-300">لم يتم العثور على قارئ مطابق</p>
              <p className="text-xs text-stone-500">جرب البحث بكلمات أخرى أو اختر جميع الروايات</p>
              <button
                type="button"
                onClick={() => {
                  setSearchQuery('');
                  setSelectedRiwayah('all');
                  setSelectedStyle('all');
                }}
                className="mt-2 px-3 py-1.5 rounded-xl bg-amber-800 hover:bg-amber-900 text-white text-xs font-bold transition-all cursor-pointer"
              >
                إعادة ضبط عوامل التصفية
              </button>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
              {filteredReciters.map((r) => {
                const isSelected = r.id === currentReciter.id;
                const isFav = r.id === favoriteId;

                return (
                  <div
                    key={r.id}
                    onClick={() => {
                      onSelectReciter(r);
                      onClose();
                    }}
                    className={`w-full p-3 rounded-2xl text-right transition-all flex items-center justify-between gap-3 cursor-pointer group relative overflow-hidden ${
                      isSelected
                        ? 'bg-gradient-to-r from-amber-900/40 via-amber-800/25 to-amber-900/30 border-2 border-amber-500 shadow-md text-amber-100 ring-1 ring-amber-500/50'
                        : 'bg-stone-900/70 hover:bg-stone-800/90 border border-stone-800 hover:border-amber-500/40 text-stone-200'
                    }`}
                  >
                    <div className="flex items-center gap-3 min-w-0 flex-1">
                      {/* Avatar with initials or wave */}
                      <div
                        className={`w-11 h-11 rounded-2xl flex items-center justify-center shrink-0 font-amiri text-base font-bold transition-transform group-hover:scale-105 ${
                          isSelected
                            ? 'bg-amber-500 text-stone-950 shadow-md shadow-amber-500/30'
                            : 'bg-stone-800 text-amber-300 border border-stone-700'
                        }`}
                      >
                        {isSelected ? (
                          <div className="flex items-end gap-0.5 h-4">
                            <span className="w-1 bg-stone-950 rounded-full animate-bounce [animation-delay:-0.3s] h-3.5" />
                            <span className="w-1 bg-stone-950 rounded-full animate-bounce [animation-delay:-0.15s] h-4" />
                            <span className="w-1 bg-stone-950 rounded-full animate-bounce [animation-delay:-0.45s] h-2.5" />
                          </div>
                        ) : (
                          <span>{r.name.charAt(0)}</span>
                        )}
                      </div>

                      {/* Reciter Details */}
                      <div className="min-w-0 flex-1">
                        <div className="flex items-center gap-1.5 flex-wrap">
                          <span className={`font-amiri text-base font-bold truncate ${
                            isSelected ? 'text-amber-300' : 'text-white group-hover:text-amber-200'
                          }`}>
                            {r.name}
                          </span>
                          {isSelected && (
                            <span className="text-[9px] font-bold bg-amber-500 text-stone-950 px-1.5 py-0.2 rounded-md shrink-0">
                              القارئ الحالي
                            </span>
                          )}
                          {isFav && (
                            <span className="text-[9px] font-bold bg-amber-400/20 text-amber-300 border border-amber-500/40 px-1.5 py-0.2 rounded-md shrink-0 flex items-center gap-0.5">
                              <Star className="w-2.5 h-2.5 fill-current" />
                              <span>مفضلك</span>
                            </span>
                          )}
                        </div>

                        <div className="flex items-center gap-1.5 text-xs text-stone-400 mt-0.5 truncate">
                          <span className="text-[10px] px-1.5 py-0.2 rounded-md bg-stone-800/90 text-stone-300 border border-stone-700/60 shrink-0">
                            {r.riwayah}
                          </span>
                          <span className="text-[10px] text-stone-400 truncate">
                            {r.style || r.subName}
                          </span>
                        </div>
                      </div>
                    </div>

                    {/* Star Favorite & Selection Checkmark */}
                    <div className="flex items-center gap-2 shrink-0">
                      <button
                        type="button"
                        onClick={(e) => handleToggleFavorite(r.id, e)}
                        className={`p-1.5 rounded-xl transition-colors cursor-pointer ${
                          isFav
                            ? 'text-amber-400 bg-amber-500/20'
                            : 'text-stone-500 hover:text-amber-300 hover:bg-stone-800'
                        }`}
                        title={isFav ? 'قارئك المفضل' : 'تعيين كقارئ مفضل'}
                      >
                        <Star className={`w-4 h-4 ${isFav ? 'fill-current' : ''}`} />
                      </button>

                      {isSelected ? (
                        <div className="w-6 h-6 rounded-full bg-amber-500 text-stone-950 flex items-center justify-center shadow-xs">
                          <Check className="w-3.5 h-3.5 stroke-[3]" />
                        </div>
                      ) : (
                        <div className="w-6 h-6 rounded-full border border-stone-700 group-hover:border-amber-500/60 flex items-center justify-center opacity-40 group-hover:opacity-100 transition-opacity">
                          <div className="w-2 h-2 rounded-full bg-amber-400 opacity-0 group-hover:opacity-100 transition-opacity" />
                        </div>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* Modal Footer */}
        <div className="p-3 border-t border-stone-800 bg-[#161A23] flex items-center justify-between text-xs text-stone-400 shrink-0">
          <div className="flex items-center gap-2">
            <span className="text-stone-300 font-semibold">القارئ المحدد:</span>
            <span className="text-amber-300 font-amiri font-bold text-sm">{currentReciter.name}</span>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="px-4 py-1.5 rounded-xl bg-stone-800 hover:bg-stone-700 text-white text-xs font-semibold transition-colors cursor-pointer"
          >
            إغلاق
          </button>
        </div>
      </div>
    </div>
  );
};
