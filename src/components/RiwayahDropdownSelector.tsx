import React, { useState, useRef, useEffect } from 'react';
import {
  Compass,
  ChevronDown,
  Check,
  Globe2,
  Users,
  Info,
  Sparkles,
  BookOpen
} from 'lucide-react';
import { EXPANDED_RECITERS } from '../data/reciters';

export interface RiwayahMeta {
  id: string;
  name: string;
  shortName: string;
  route: string;
  region: string;
  badgeColor: string;
  description: string;
}

export const RIWAYAT_METADATA: RiwayahMeta[] = [
  {
    id: 'all',
    name: 'جميع الروايات المباركة',
    shortName: 'الكل',
    route: 'تلاوات متواترة',
    region: 'مجموع القراءات المعتمدة',
    badgeColor: 'amber',
    description: 'تصفح واستمع لكافة التلاوات القرآنية المعتمدة بأصوات نخبة قراء العالم الإسلامي.',
  },
  {
    id: 'hafs',
    name: 'رواية حفص عن عاصم',
    shortName: 'حفص',
    route: 'طريق الشاطبية',
    region: 'العالم الإسلامي والمشرق',
    badgeColor: 'amber',
    description: 'الرواية الأكثر قراءة وتلاوة في العالم الإسلامي، تمتاز بجلاء الحروف وسلاسة الترتيل والوضوح.',
  },
  {
    id: 'warsh',
    name: 'رواية ورش عن نافع',
    shortName: 'ورش',
    route: 'طريق الأزرق',
    region: 'المغرب العربي وغرب إفريقيا',
    badgeColor: 'emerald',
    description: 'رواية الإمام ورش عن نافع المدني، شائعة في المغرب والجزائر وموريتانيا، تمتاز بترقيق الراءات وتغليظ اللامات ونقل الهمز.',
  },
  {
    id: 'qaloon',
    name: 'رواية قالون عن نافع',
    shortName: 'قالون',
    route: 'طريق أبي نشيط',
    region: 'ليبيا وتونس والمدينة',
    badgeColor: 'blue',
    description: 'رواية الإمام قالون عن نافع المدني، تمتاز بقصر المنفصل وصلة ميم الجمع وإسقاط وتسهيل بعض الهمزات.',
  },
  {
    id: 'duri',
    name: 'رواية الدوري عن أبي عمرو',
    shortName: 'الدوري',
    route: 'طريق أبي الزعراء',
    region: 'السودان والقرن الإفريقي',
    badgeColor: 'purple',
    description: 'رواية الإمام حفص بن عمر الدوري عن أبي عمرو البصري، من أقدم الروايات تلاوةً وتنتشر تاريخياً في السودان وإفريقيا.',
  },
  {
    id: 'khalaf',
    name: 'رواية خلف عن حمزة',
    shortName: 'خلف',
    route: 'القراءات العشر الكبرى',
    region: 'تلاوة بالسكت والهمز',
    badgeColor: 'rose',
    description: 'إحدى القراءات العشر المتواترة برواية خلف البزار عن حمزة الكوفي، تمتاز بالسكت قبل الهمز ووقفات بالغة الخشوع.',
  },
  {
    id: 'soosi',
    name: 'رواية السوسي عن أبي عمرو',
    shortName: 'السوسي',
    route: 'القراءات العشر الكبرى',
    region: 'تلاوة بالإدغام الكبير',
    badgeColor: 'teal',
    description: 'رواية أبي شعيب السوسي عن أبي عمرو البصري، تمتاز بالإدغام الكبير للمتماثلين والمتقاربين مع سلاسة فائقة.',
  },
];

interface RiwayahDropdownSelectorProps {
  selectedRiwayah: string;
  onSelectRiwayah: (riwayahId: string) => void;
  className?: string;
}

export const RiwayahDropdownSelector: React.FC<RiwayahDropdownSelectorProps> = ({
  selectedRiwayah,
  onSelectRiwayah,
  className = '',
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  const currentRiwayah =
    RIWAYAT_METADATA.find((m) => m.id === selectedRiwayah) || RIWAYAT_METADATA[0];

  const currentRecitersCount =
    currentRiwayah.id === 'all'
      ? EXPANDED_RECITERS.length
      : EXPANDED_RECITERS.filter((r) => r.riwayahId === currentRiwayah.id).length;

  // Close on outside click
  useEffect(() => {
    const handleOutsideClick = (e: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setIsOpen(false);
      }
    };
    if (isOpen) {
      document.addEventListener('mousedown', handleOutsideClick);
    }
    return () => {
      document.removeEventListener('mousedown', handleOutsideClick);
    };
  }, [isOpen]);

  // Close on Esc
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
          aria-label="اختيار الرواية القرآنية"
          className={`w-full p-2.5 sm:p-3.5 rounded-2xl sm:rounded-3xl border transition-all duration-200 cursor-pointer shadow-sm flex items-center justify-between gap-3 group active:scale-[0.99] ${
            isOpen
              ? 'bg-amber-50/95 border-amber-600 ring-2 ring-amber-600/30 shadow-md'
              : 'bg-white hover:bg-amber-50/40 border-stone-300 hover:border-amber-400'
          }`}
        >
          {/* Right: Icon + Riwayah Info */}
          <div className="flex items-center gap-3 min-w-0">
            <div className="w-10 h-10 rounded-2xl bg-amber-100/80 border border-amber-300 text-amber-900 flex items-center justify-center shrink-0 transition-transform group-hover:scale-105">
              <Compass className="w-5 h-5 text-amber-800" />
            </div>

            <div className="text-right min-w-0">
              <div className="flex items-center gap-2 flex-wrap">
                <span className="text-[11px] font-semibold text-stone-500">
                  الرواية القرآنية:
                </span>
                <span className="font-amiri text-lg font-bold text-amber-950 group-hover:text-amber-900 truncate">
                  {currentRiwayah.name}
                </span>
                <span className="text-[10px] px-2 py-0.5 rounded-full font-medium bg-amber-100/80 text-amber-900 border border-amber-300/80 hidden sm:inline">
                  {currentRiwayah.route}
                </span>
              </div>
              <div className="text-[11px] text-stone-500 truncate mt-0.5 flex items-center gap-2">
                <span>{currentRiwayah.region}</span>
                <span>·</span>
                <span className="font-mono text-amber-800 font-bold">
                  {currentRecitersCount} {currentRecitersCount > 2 ? 'قراء' : 'قارئ'}
                </span>
              </div>
            </div>
          </div>

          {/* Left: Action Badge & Chevron */}
          <div className="flex items-center gap-2 shrink-0">
            <span className="text-xs font-bold text-amber-900 hidden md:inline">
              {isOpen ? 'إغلاق القائمة' : 'تغيير الرواية'}
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
          className="absolute top-full mt-2 left-0 right-0 z-50 bg-[#FAF9F5] border border-amber-900/20 rounded-3xl shadow-2xl overflow-hidden p-3 sm:p-4 space-y-2 animate-in fade-in zoom-in-95 duration-150 backdrop-blur-md max-h-[75vh] flex flex-col"
        >
          {/* Dropdown Header Info */}
          <div className="px-3 py-2 border-b border-stone-200/80 flex items-center justify-between text-xs text-stone-600">
            <span className="font-bold flex items-center gap-1.5 text-stone-800">
              <BookOpen className="w-4 h-4 text-amber-800" />
              <span>اختر الرواية القرآنية لعرض قراءها</span>
            </span>
            <span className="text-[11px] text-amber-800 font-mono font-semibold">
              ٧ روايات معتمدة
            </span>
          </div>

          {/* List of Riwayat */}
          <div className="flex-1 overflow-y-auto space-y-1.5 pr-0.5">
            {RIWAYAT_METADATA.map((rw) => {
              const isSelected = selectedRiwayah === rw.id;
              const reciterCount =
                rw.id === 'all'
                  ? EXPANDED_RECITERS.length
                  : EXPANDED_RECITERS.filter((r) => r.riwayahId === rw.id).length;

              return (
                <button
                  key={rw.id}
                  type="button"
                  role="option"
                  aria-selected={isSelected}
                  onClick={() => {
                    onSelectRiwayah(rw.id);
                    setIsOpen(false);
                  }}
                  className={`w-full p-3 rounded-2xl border text-right transition-all duration-150 cursor-pointer flex items-center justify-between gap-3 group active:scale-[0.99] ${
                    isSelected
                      ? 'bg-amber-50/95 border-amber-700 ring-2 ring-amber-600/30 shadow-xs'
                      : 'bg-white hover:bg-stone-50/90 border-stone-200/80 hover:border-amber-300'
                  }`}
                >
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center gap-2 flex-wrap">
                      <span
                        className={`font-amiri text-base font-bold ${
                          isSelected ? 'text-amber-950 font-bold' : 'text-stone-900 group-hover:text-amber-950'
                        }`}
                      >
                        {rw.name}
                      </span>
                      <span
                        className={`text-[10px] px-2 py-0.5 rounded-full font-medium ${
                          isSelected
                            ? 'bg-amber-200/80 text-amber-950 border border-amber-300'
                            : 'bg-stone-100 text-stone-600 border border-stone-200/80'
                        }`}
                      >
                        {rw.route}
                      </span>
                    </div>

                    <div className="text-xs text-stone-500 mt-0.5 line-clamp-1">
                      {rw.description}
                    </div>
                  </div>

                  {/* Right metadata badge & radio */}
                  <div className="flex items-center gap-2.5 shrink-0">
                    <div className="text-left">
                      <span className="font-mono text-xs font-bold text-amber-900 bg-amber-50 px-2 py-0.5 rounded-lg border border-amber-200">
                        {reciterCount} {reciterCount > 2 ? 'قراء' : 'قارئ'}
                      </span>
                      <div className="text-[10px] text-stone-400 mt-0.5">
                        {rw.region}
                      </div>
                    </div>

                    <div
                      className={`w-5 h-5 rounded-full border flex items-center justify-center transition-all ${
                        isSelected
                          ? 'border-amber-700 bg-amber-800 text-white shadow-xs'
                          : 'border-stone-300 bg-stone-50 group-hover:border-amber-400'
                      }`}
                    >
                      {isSelected && <Check className="w-3 h-3 stroke-[2.5]" />}
                    </div>
                  </div>
                </button>
              );
            })}
          </div>

          {/* Footer note */}
          <div className="pt-2 border-t border-stone-200/80 text-[11px] text-stone-500 text-center">
            تغيير الرواية لا يقطع الاستماع الحالي ويتيح لك استكشاف تلاوات أخرى بسهولة
          </div>
        </div>
      )}
    </div>
  );
};
