import React, { useState, useRef, useEffect, useMemo } from 'react';
import {
  Radio,
  ChevronDown,
  Check,
  Search,
  Volume2,
  X,
  User,
  Music,
  Sparkles
} from 'lucide-react';
import { Reciter } from '../types';
import { EXPANDED_RECITERS } from '../data/reciters';

interface ReciterDropdownSelectorProps {
  selectedReciter: Reciter & { riwayah: string; riwayahId: string };
  onSelectReciter: (reciter: (typeof EXPANDED_RECITERS)[0]) => void;
  selectedRiwayah?: string;
  isPlaying?: boolean;
  activePlayingReciterId?: string;
  className?: string;
}

export const ReciterDropdownSelector: React.FC<ReciterDropdownSelectorProps> = ({
  selectedReciter,
  onSelectReciter,
  selectedRiwayah = 'all',
  isPlaying = false,
  activePlayingReciterId,
  className = '',
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const containerRef = useRef<HTMLDivElement>(null);
  const searchInputRef = useRef<HTMLInputElement>(null);

  const isCurrentReciterPlaying = isPlaying && activePlayingReciterId === selectedReciter.id;

  // Filter reciters by current Riwayah and search input
  const filteredReciters = useMemo(() => {
    return EXPANDED_RECITERS.filter((r) => {
      const matchRiwayah = selectedRiwayah === 'all' || r.riwayahId === selectedRiwayah;
      const q = searchTerm.trim().toLowerCase();
      const matchSearch =
        !q ||
        r.name.toLowerCase().includes(q) ||
        r.subName?.toLowerCase().includes(q) ||
        r.riwayah.toLowerCase().includes(q);
      return matchRiwayah && matchSearch;
    });
  }, [selectedRiwayah, searchTerm]);

  // Close on outside click
  useEffect(() => {
    const handleOutsideClick = (e: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setIsOpen(false);
      }
    };
    if (isOpen) {
      document.addEventListener('mousedown', handleOutsideClick);
      setTimeout(() => {
        searchInputRef.current?.focus();
      }, 100);
    }
    return () => {
      document.removeEventListener('mousedown', handleOutsideClick);
    };
  }, [isOpen]);

  // Close on Escape
  useEffect(() => {
    const handleEsc = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setIsOpen(false);
    };
    window.addEventListener('keydown', handleEsc);
    return () => window.removeEventListener('keydown', handleEsc);
  }, []);

  return (
    <div ref={containerRef} className={`relative max-w-2xl mx-auto w-full text-right ${className}`}>
      {/* Centralized Luxury Trigger Bar */}
      <div className="flex flex-col items-center">
        <button
          type="button"
          onClick={() => setIsOpen(!isOpen)}
          aria-expanded={isOpen}
          aria-haspopup="listbox"
          aria-label="اختيار القارئ"
          className={`w-full p-2.5 sm:p-3.5 rounded-2xl sm:rounded-3xl border transition-all duration-200 cursor-pointer shadow-sm flex items-center justify-between gap-3 group active:scale-[0.99] ${
            isOpen
              ? 'bg-amber-50/95 border-amber-600 ring-2 ring-amber-600/30 shadow-md'
              : 'bg-white hover:bg-amber-50/40 border-stone-300 hover:border-amber-400'
          }`}
        >
          {/* Right: Icon + Reciter Info */}
          <div className="flex items-center gap-3 min-w-0">
            <div className="w-10 h-10 rounded-2xl bg-amber-900/10 border border-amber-300 text-amber-900 flex items-center justify-center shrink-0 transition-transform group-hover:scale-105 relative">
              <Radio className="w-5 h-5 text-amber-800" />
              {isCurrentReciterPlaying && (
                <span className="absolute -top-1 -right-1 w-3 h-3 bg-emerald-500 rounded-full border-2 border-white animate-ping" />
              )}
            </div>

            <div className="text-right min-w-0">
              <div className="flex items-center gap-2 flex-wrap">
                <span className="text-[11px] font-semibold text-stone-500">
                  القارئ المختار:
                </span>
                <span className="font-amiri text-lg font-bold text-stone-900 group-hover:text-amber-900 truncate">
                  {selectedReciter.name}
                </span>
                {isCurrentReciterPlaying && (
                  <span className="text-[10px] px-2 py-0.5 rounded-full font-bold bg-emerald-100 text-emerald-800 border border-emerald-300 flex items-center gap-1">
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-600 animate-pulse" />
                    <span>يعمل الآن</span>
                  </span>
                )}
              </div>
              <div className="text-[11px] text-stone-500 truncate mt-0.5 flex items-center gap-2">
                <span className="font-medium text-amber-800">{selectedReciter.riwayah}</span>
                <span>·</span>
                <span className="text-stone-400">{selectedReciter.style || selectedReciter.subName}</span>
              </div>
            </div>
          </div>

          {/* Left: Action Badge & Chevron */}
          <div className="flex items-center gap-2 shrink-0">
            <span className="text-xs font-bold text-amber-900 hidden md:inline">
              {isOpen ? 'إغلاق القائمة' : 'تغيير القارئ'}
            </span>
            <div
              className={`w-8 h-8 rounded-xl border flex items-center justify-center transition-all ${
                isOpen
                  ? 'bg-amber-800 text-white border-amber-800 rotate-180'
                  : 'bg-stone-100 border-stone-200 text-stone-600 group-hover:bg-amber-100 group-hover:text-amber-900 group-hover:border-amber-300'
              }`}
            >
              <ChevronDown className="w-4 h-4" />
            </div>
          </div>
        </button>
      </div>

      {/* Centralized Dropdown Menu */}
      {isOpen && (
        <div
          role="listbox"
          className="absolute top-full mt-2 left-0 right-0 z-50 bg-[#FAF9F5] border border-amber-900/20 rounded-3xl shadow-2xl overflow-hidden p-3 sm:p-4 space-y-2.5 animate-in fade-in zoom-in-95 duration-150 backdrop-blur-md max-h-[75vh] flex flex-col"
        >
          {/* Dropdown Header & Search Input */}
          <div className="space-y-2 border-b border-stone-200/80 pb-2.5">
            <div className="flex items-center justify-between text-xs text-stone-600 px-1">
              <span className="font-bold flex items-center gap-1.5 text-stone-800">
                <Radio className="w-4 h-4 text-amber-800" />
                <span>اختر القارئ من بين {filteredReciters.length} قارئ متاح</span>
              </span>
              <span className="text-[11px] text-amber-800 font-mono font-semibold">
                {selectedRiwayah === 'all' ? 'كافة الروايات' : selectedReciter.riwayah}
              </span>
            </div>

            <div className="relative">
              <Search className="w-4 h-4 absolute right-3.5 top-1/2 -translate-y-1/2 text-stone-400" />
              <input
                ref={searchInputRef}
                type="text"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                placeholder="ابحث عن اسم القارئ أو الرواية..."
                className="w-full pr-10 pl-8 py-2 text-xs bg-white border border-stone-200 rounded-xl focus:outline-hidden focus:border-amber-700 text-stone-900 placeholder:text-stone-400 shadow-2xs"
              />
              {searchTerm && (
                <button
                  type="button"
                  onClick={() => setSearchTerm('')}
                  className="absolute left-2.5 top-1/2 -translate-y-1/2 text-stone-400 hover:text-stone-600 p-0.5 cursor-pointer"
                >
                  <X className="w-3.5 h-3.5" />
                </button>
              )}
            </div>
          </div>

          {/* List of Reciters */}
          <div className="flex-1 overflow-y-auto space-y-1.5 pr-0.5">
            {filteredReciters.length === 0 ? (
              <div className="py-8 text-center text-xs text-stone-500">
                لم يتم العثور على قارئ مطابق لبحثك.
              </div>
            ) : (
              filteredReciters.map((reciter) => {
                const isSelected = selectedReciter.id === reciter.id;
                const isPlayingThis = isPlaying && activePlayingReciterId === reciter.id;

                return (
                  <button
                    key={reciter.id}
                    type="button"
                    role="option"
                    aria-selected={isSelected}
                    onClick={() => {
                      onSelectReciter(reciter);
                      setIsOpen(false);
                    }}
                    className={`w-full p-2.5 sm:p-3 rounded-2xl border text-right transition-all duration-150 cursor-pointer flex items-center justify-between gap-3 group active:scale-[0.99] ${
                      isSelected
                        ? 'bg-amber-50/95 border-amber-700 ring-2 ring-amber-600/30 shadow-xs'
                        : 'bg-white hover:bg-stone-50/90 border-stone-200/80 hover:border-amber-300'
                    }`}
                  >
                    <div className="flex items-center gap-2.5 min-w-0 flex-1">
                      <div
                        className={`w-9 h-9 rounded-xl flex items-center justify-center shrink-0 transition-colors ${
                          isSelected
                            ? 'bg-amber-800 text-white shadow-2xs'
                            : 'bg-stone-100 group-hover:bg-amber-100 text-stone-600 group-hover:text-amber-900'
                        }`}
                      >
                        <User className="w-4 h-4" />
                      </div>

                      <div className="min-w-0">
                        <div className="flex items-center gap-2 flex-wrap">
                          <span
                            className={`font-amiri text-base font-bold ${
                              isSelected ? 'text-amber-950 font-bold' : 'text-stone-900 group-hover:text-amber-950'
                            }`}
                          >
                            {reciter.name}
                          </span>
                          {isPlayingThis && (
                            <span className="text-[10px] px-1.5 py-0.2 rounded-full font-bold bg-emerald-100 text-emerald-800 border border-emerald-300 animate-pulse">
                              يعمل الآن
                            </span>
                          )}
                        </div>

                        <div className="text-xs text-stone-500 mt-0.5 truncate flex items-center gap-1.5">
                          <span className="text-amber-800 font-semibold">{reciter.riwayah}</span>
                          <span>·</span>
                          <span className="text-stone-400 truncate">{reciter.subName || reciter.style}</span>
                        </div>
                      </div>
                    </div>

                    {/* Radio Checkmark */}
                    <div
                      className={`w-5 h-5 rounded-full border flex items-center justify-center shrink-0 transition-all ${
                        isSelected
                          ? 'border-amber-700 bg-amber-800 text-white shadow-xs'
                          : 'border-stone-300 bg-stone-50 group-hover:border-amber-400'
                      }`}
                    >
                      {isSelected && <Check className="w-3 h-3 stroke-[2.5]" />}
                    </div>
                  </button>
                );
              })
            )}
          </div>

          {/* Footer note */}
          <div className="pt-2 border-t border-stone-200/80 text-[11px] text-stone-500 text-center">
            اختيار أي قارئ يقوم بتحديث التلاوة وتجهيز سور القرآن الكريم كاملة فوراً
          </div>
        </div>
      )}
    </div>
  );
};
