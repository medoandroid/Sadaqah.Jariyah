import React, { useState, useEffect, useRef } from 'react';
import {
  RotateCcw,
  Sparkles,
  X,
  Minimize2,
  Maximize2,
  Move,
  Volume2,
  VolumeX,
  Info,
  CheckCircle2,
  ChevronRight,
  ChevronLeft
} from 'lucide-react';
import { storageService } from '../services/storageService';
import { playTasbeehBeadSound } from '../utils/soundEffects';

const QUICK_DHIKRS = [
  'سُبْحَانَ اللَّهِ',
  'الْحَمْدُ لِلَّهِ',
  'اللَّهُ أَكْبَرُ',
  'لَا إِلَهَ إِلَّا اللَّهُ',
  'أَسْتَغْفِرُ اللَّهَ وَأَتُوبُ إِلَيْهِ',
  'اللَّهُمَّ صَلِّ عَلَى مُحَمَّدٍ',
  'لَا حَوْلَ وَلَا قُوَّةَ إِلَّا بِاللَّهِ',
  'سُبْحَانَ اللَّهِ وَبِحَمْدِهِ',
];

export type WidgetScale = 'compact' | 'medium' | 'large';

interface FloatingSebhaWidgetProps {
  isOpen: boolean;
  onClose: () => void;
  onOpenInfoModal?: () => void;
}

export const FloatingSebhaWidget: React.FC<FloatingSebhaWidgetProps> = ({
  isOpen,
  onClose,
  onOpenInfoModal,
}) => {
  const [dhikrIndex, setDhikrIndex] = useState<number>(0);
  const [count, setCount] = useState<number>(() => {
    return storageService.getNumber('floating_sebha_count', 0);
  });
  const [target, setTarget] = useState<number>(33);
  const [isMini, setIsMini] = useState<boolean>(() => {
    return storageService.get<boolean>('floating_sebha_mini', false);
  });
  const [widgetScale, setWidgetScale] = useState<WidgetScale>(() => {
    return (storageService.getString('floating_sebha_scale', 'medium') as WidgetScale) || 'medium';
  });
  const [soundEnabled, setSoundEnabled] = useState<boolean>(true);
  const [isPressing, setIsPressing] = useState<boolean>(false);

  // Dragging state
  const [position, setPosition] = useState<{ x: number; y: number }>(() => {
    if (typeof window !== 'undefined') {
      const saved = storageService.get<{ x: number; y: number } | null>('floating_sebha_pos', null);
      if (saved && typeof saved.x === 'number' && typeof saved.y === 'number') {
        const maxX = Math.max(10, window.innerWidth - 240);
        const maxY = Math.max(10, window.innerHeight - 250);
        return {
          x: Math.min(Math.max(10, saved.x), maxX),
          y: Math.min(Math.max(60, saved.y), maxY),
        };
      }
      return { x: 20, y: 140 };
    }
    return { x: 20, y: 140 };
  });

  const isDraggingRef = useRef<boolean>(false);
  const dragStartOffsetRef = useRef<{ x: number; y: number }>({ x: 0, y: 0 });
  const hasMovedRef = useRef<boolean>(false);

  useEffect(() => {
    storageService.setNumber('floating_sebha_count', count);
  }, [count]);

  useEffect(() => {
    storageService.set('floating_sebha_mini', isMini);
  }, [isMini]);

  useEffect(() => {
    storageService.setString('floating_sebha_scale', widgetScale);
  }, [widgetScale]);

  if (!isOpen) return null;

  const currentDhikr = QUICK_DHIKRS[dhikrIndex] || QUICK_DHIKRS[0];

  const handleIncrement = () => {
    if (hasMovedRef.current) return;

    if (soundEnabled) {
      playTasbeehBeadSound();
    }
    if (typeof window !== 'undefined' && 'vibrate' in navigator) {
      navigator.vibrate(20);
    }

    const next = count + 1;
    setCount(next);

    // Sync with global lifetime total
    const currentLifetime = storageService.getNumber('tasbeeh_total', 0);
    storageService.setNumber('tasbeeh_total', currentLifetime + 1);

    // Sync with today total
    const currentToday = storageService.getNumber('tasbeeh_today', 0);
    storageService.setNumber('tasbeeh_today', currentToday + 1);

    setIsPressing(true);
    setTimeout(() => setIsPressing(false), 90);
  };

  const handleReset = (e: React.MouseEvent) => {
    e.stopPropagation();
    setCount(0);
  };

  const handleNextDhikr = (e: React.MouseEvent) => {
    e.stopPropagation();
    setDhikrIndex((prev) => (prev + 1) % QUICK_DHIKRS.length);
    setCount(0);
  };

  const handlePrevDhikr = (e: React.MouseEvent) => {
    e.stopPropagation();
    setDhikrIndex((prev) => (prev - 1 + QUICK_DHIKRS.length) % QUICK_DHIKRS.length);
    setCount(0);
  };

  const cycleScale = (e: React.MouseEvent) => {
    e.stopPropagation();
    setWidgetScale((prev) => {
      if (prev === 'compact') return 'medium';
      if (prev === 'medium') return 'large';
      return 'compact';
    });
  };

  // Pointer / Touch Drag handlers
  const handlePointerDown = (e: React.PointerEvent) => {
    isDraggingRef.current = true;
    hasMovedRef.current = false;
    dragStartOffsetRef.current = {
      x: e.clientX - position.x,
      y: e.clientY - position.y,
    };
    try {
      (e.target as HTMLElement).setPointerCapture(e.pointerId);
    } catch {}
  };

  const handlePointerMove = (e: React.PointerEvent) => {
    if (!isDraggingRef.current) return;
    const newX = e.clientX - dragStartOffsetRef.current.x;
    const newY = e.clientY - dragStartOffsetRef.current.y;

    const widgetWidth = isMini
      ? 140
      : widgetScale === 'compact'
      ? 180
      : widgetScale === 'large'
      ? 240
      : 210;
    const widgetHeight = isMini ? 65 : 240;

    const boundedX = Math.max(10, Math.min(newX, window.innerWidth - widgetWidth - 10));
    const boundedY = Math.max(50, Math.min(newY, window.innerHeight - widgetHeight - 50));

    if (Math.abs(boundedX - position.x) > 3 || Math.abs(boundedY - position.y) > 3) {
      hasMovedRef.current = true;
    }

    setPosition({ x: boundedX, y: boundedY });
  };

  const handlePointerUp = (e: React.PointerEvent) => {
    if (!isDraggingRef.current) return;
    isDraggingRef.current = false;
    storageService.set('floating_sebha_pos', position);
    try {
      (e.target as HTMLElement).releasePointerCapture(e.pointerId);
    } catch {}
  };

  const progressPercent = target > 0 ? Math.min(100, Math.round(((count % target) / target) * 100)) : 0;

  // Scale classes for expanded mode
  const scaleStyles = {
    compact: {
      cardWidth: 'w-44',
      buttonSize: 'w-20 h-20',
      counterFont: 'text-xl',
      titleFont: 'text-xs',
    },
    medium: {
      cardWidth: 'w-52',
      buttonSize: 'w-24 h-24',
      counterFont: 'text-2xl',
      titleFont: 'text-xs',
    },
    large: {
      cardWidth: 'w-60',
      buttonSize: 'w-28 h-28',
      counterFont: 'text-3xl',
      titleFont: 'text-sm',
    },
  }[widgetScale];

  return (
    <div
      style={{
        transform: `translate3d(${position.x}px, ${position.y}px, 0)`,
        touchAction: 'none',
      }}
      className="fixed top-0 left-0 z-50 select-none animate-in fade-in zoom-in-95 duration-200"
      dir="rtl"
    >
      {isMini ? (
        /* MINI COMPACT PILL MODE */
        <div
          onPointerDown={handlePointerDown}
          onPointerMove={handlePointerMove}
          onPointerUp={handlePointerUp}
          onClick={handleIncrement}
          className={`flex items-center gap-2 px-3 py-2 rounded-full bg-stone-900/95 dark:bg-black/95 border border-amber-500/50 text-amber-200 shadow-2xl backdrop-blur-md cursor-grab active:cursor-grabbing transition-transform ${
            isPressing ? 'scale-95' : 'scale-100 hover:scale-102'
          }`}
          title="اسحب في أي اتجاه للتحريك · انقر في أي مكان للتسبيح"
        >
          <div className="w-7 h-7 rounded-full bg-gradient-to-br from-amber-500 to-amber-700 flex items-center justify-center text-white font-mono font-bold text-xs shadow-md shrink-0">
            {count}
          </div>
          <span className="text-xs font-amiri font-bold truncate max-w-[80px] text-amber-100">
            {currentDhikr}
          </span>
          <div className="flex items-center gap-0.5 mr-1" onClick={(e) => e.stopPropagation()}>
            <button
              onClick={() => setIsMini(false)}
              className="p-1 text-stone-400 hover:text-amber-300 transition-colors"
              title="تكبير السبحة"
            >
              <Maximize2 className="w-3.5 h-3.5" />
            </button>
            <button
              onClick={onClose}
              className="p-1 text-stone-400 hover:text-red-400 transition-colors"
              title="إغلاق السبحة"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      ) : (
        /* EXPANDED LUXURY 3D DIAL WIDGET MODE */
        <div
          className={`${scaleStyles.cardWidth} rounded-3xl bg-stone-900/95 border border-amber-500/40 text-stone-100 shadow-2xl backdrop-blur-xl overflow-hidden flex flex-col transition-all duration-150`}
        >
          {/* Draggable Header Handle */}
          <div
            onPointerDown={handlePointerDown}
            onPointerMove={handlePointerMove}
            onPointerUp={handlePointerUp}
            className="px-3 py-2 bg-stone-950/80 border-b border-stone-800 flex items-center justify-between cursor-grab active:cursor-grabbing text-stone-400 hover:text-stone-200"
          >
            <div className="flex items-center gap-1.5 text-[11px] text-amber-400 font-bold">
              <Move className="w-3 h-3 text-amber-500" />
              <span>سبحة عائمة</span>
            </div>
            <div className="flex items-center gap-1" onClick={(e) => e.stopPropagation()}>
              {/* Size switch toggle */}
              <button
                onClick={cycleScale}
                className="px-1.5 py-0.5 rounded text-[10px] font-sans font-bold bg-stone-800 hover:bg-stone-700 text-amber-300 transition"
                title={`تغيير الحجم (الحالي: ${widgetScale})`}
              >
                {widgetScale === 'compact' ? 'صغير' : widgetScale === 'medium' ? 'وسط' : 'كبير'}
              </button>
              {onOpenInfoModal && (
                <button
                  onClick={onOpenInfoModal}
                  className="p-1 text-stone-400 hover:text-amber-300 transition"
                  title="معلومات العرض فوق التطبيقات"
                >
                  <Info className="w-3.5 h-3.5" />
                </button>
              )}
              <button
                onClick={() => setIsMini(true)}
                className="p-1 text-stone-400 hover:text-amber-300 transition"
                title="تصغير إلى كبسولة"
              >
                <Minimize2 className="w-3.5 h-3.5" />
              </button>
              <button
                onClick={onClose}
                className="p-1 text-stone-400 hover:text-red-400 transition"
                title="إغلاق"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>

          {/* Dhikr Selector Bar */}
          <div className="px-2.5 py-1.5 bg-stone-950/40 flex items-center justify-between text-xs border-b border-stone-800/60">
            <button
              onClick={handlePrevDhikr}
              className="p-1 text-stone-400 hover:text-amber-300 transition"
              title="الذكر السابق"
            >
              <ChevronRight className="w-3.5 h-3.5" />
            </button>
            <span className={`font-amiri font-bold ${scaleStyles.titleFont} truncate max-w-[125px] text-amber-200 text-center`}>
              {currentDhikr}
            </span>
            <button
              onClick={handleNextDhikr}
              className="p-1 text-stone-400 hover:text-amber-300 transition"
              title="الذكر التالي"
            >
              <ChevronLeft className="w-3.5 h-3.5" />
            </button>
          </div>

          {/* Central 3D Interactive Tapper */}
          <div className="p-3.5 flex flex-col items-center justify-center space-y-2.5 text-center">
            <button
              type="button"
              onClick={handleIncrement}
              className={`relative ${scaleStyles.buttonSize} rounded-full flex flex-col items-center justify-center cursor-pointer transition-all duration-75 shadow-xl ${
                isPressing
                  ? 'scale-92 bg-gradient-to-br from-amber-700 to-amber-900 shadow-inner'
                  : 'scale-100 bg-gradient-to-br from-amber-500 via-amber-600 to-amber-800 hover:scale-103 shadow-amber-950/60'
              }`}
              style={{
                boxShadow: isPressing
                  ? 'inset 0 4px 8px rgba(0,0,0,0.6)'
                  : '0 8px 20px rgba(217, 119, 6, 0.35), inset 0 2px 4px rgba(255,255,255,0.4)',
              }}
            >
              {/* Progress Circle SVG */}
              <svg className="absolute inset-0 w-full h-full -rotate-90 pointer-events-none" viewBox="0 0 100 100">
                <circle
                  cx="50"
                  cy="50"
                  r="45"
                  className="stroke-amber-950/40"
                  strokeWidth="6"
                  fill="none"
                />
                <circle
                  cx="50"
                  cy="50"
                  r="45"
                  className="stroke-white/80 transition-all duration-150"
                  strokeWidth="6"
                  strokeDasharray="282.7"
                  strokeDashoffset={282.7 - (282.7 * progressPercent) / 100}
                  strokeLinecap="round"
                  fill="none"
                />
              </svg>

              <span className={`font-mono ${scaleStyles.counterFont} font-black text-white drop-shadow-md`}>
                {count}
              </span>
              <span className="text-[10px] text-amber-100/90 font-medium -mt-0.5">
                {target > 0 ? `الهدف: ${target}` : 'تسبيح حر'}
              </span>
            </button>

            {/* Quick Actions Footer Bar */}
            <div className="w-full flex items-center justify-between pt-1 border-t border-stone-800/60 text-[11px] text-stone-400">
              <button
                onClick={handleReset}
                className="flex items-center gap-1 hover:text-amber-300 transition"
                title="تصفير العداد"
              >
                <RotateCcw className="w-3 h-3" />
                <span>تصفير</span>
              </button>

              <button
                onClick={() => setSoundEnabled(!soundEnabled)}
                className={`p-1 rounded-md transition ${soundEnabled ? 'text-amber-400' : 'text-stone-500'}`}
                title={soundEnabled ? 'كتم الصوت' : 'تشغيل الصوت'}
              >
                {soundEnabled ? <Volume2 className="w-3.5 h-3.5" /> : <VolumeX className="w-3.5 h-3.5" />}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
