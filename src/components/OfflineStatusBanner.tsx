import React, { useState, useEffect, useRef } from 'react';
import { WifiOff, X, Wifi } from 'lucide-react';
import { useOfflineSync } from '../hooks/useOfflineSync';

interface OfflineStatusBannerProps {
  onOpenOfflineManager?: () => void;
}

export const OfflineStatusBanner: React.FC<OfflineStatusBannerProps> = ({
  onOpenOfflineManager,
}) => {
  const { isOnline, isFullyOfflineReady, downloadedSurahsCount } = useOfflineSync();

  const [showBanner, setShowBanner] = useState<boolean>(false);
  const [touchStartY, setTouchStartY] = useState<number | null>(null);
  const [touchCurrentY, setTouchCurrentY] = useState<number | null>(null);
  const [isDismissing, setIsDismissing] = useState<boolean>(false);

  // Monitor online / offline transitions
  useEffect(() => {
    if (!isOnline) {
      setIsDismissing(false);
      setShowBanner(true);

      // Auto dismiss after 5 seconds
      const autoDismissTimer = setTimeout(() => {
        dismissWithAnimation();
      }, 5000);

      return () => clearTimeout(autoDismissTimer);
    } else {
      // Online again - hide banner smoothly
      setShowBanner(false);
      setIsDismissing(false);
    }
  }, [isOnline]);

  const dismissWithAnimation = () => {
    setIsDismissing(true);
    setTimeout(() => {
      setShowBanner(false);
      setIsDismissing(false);
    }, 300);
  };

  // Swipe up gesture handlers
  const handleTouchStart = (e: React.TouchEvent) => {
    setTouchStartY(e.touches[0].clientY);
    setTouchCurrentY(e.touches[0].clientY);
  };

  const handleTouchMove = (e: React.TouchEvent) => {
    if (touchStartY !== null) {
      setTouchCurrentY(e.touches[0].clientY);
    }
  };

  const handleTouchEnd = () => {
    if (touchStartY !== null && touchCurrentY !== null) {
      const deltaY = touchCurrentY - touchStartY;
      // If user swiped upward by more than 25px, dismiss
      if (deltaY < -25) {
        dismissWithAnimation();
      }
    }
    setTouchStartY(null);
    setTouchCurrentY(null);
  };

  if (!showBanner || isOnline) {
    return null;
  }

  // Calculate subtle drag translation when swiping up
  const dragTranslateY =
    touchStartY !== null && touchCurrentY !== null && touchCurrentY < touchStartY
      ? Math.max(-50, touchCurrentY - touchStartY)
      : 0;

  return (
    <div
      dir="rtl"
      className="fixed top-2 sm:top-4 inset-x-0 z-50 flex justify-center px-3 sm:px-6 pointer-events-none transition-all duration-300"
      style={{
        transform: isDismissing ? 'translateY(-120%) scale(0.96)' : `translateY(${dragTranslateY}px)`,
        opacity: isDismissing ? 0 : 1,
        transition: touchStartY !== null ? 'none' : 'all 0.3s cubic-bezier(0.16, 1, 0.3, 1)',
      }}
    >
      <div
        onTouchStart={handleTouchStart}
        onTouchMove={handleTouchMove}
        onTouchEnd={handleTouchEnd}
        className="pointer-events-auto w-full max-w-lg rounded-2xl sm:rounded-3xl bg-stone-900/95 dark:bg-stone-950/95 text-stone-100 shadow-[0_12px_36px_-6px_rgba(0,0,0,0.5),0_4px_16px_rgba(217,119,6,0.15)] border border-amber-500/40 backdrop-blur-2xl p-2.5 sm:p-3 flex items-center justify-between gap-3 animate-in fade-in slide-in-from-top-4 duration-300 select-none group"
        role="alert"
        aria-live="assertive"
      >
        {/* Top Liquid Specular Rim */}
        <div className="absolute inset-x-0 top-0 h-[1.5px] bg-gradient-to-r from-transparent via-amber-400/60 to-transparent pointer-events-none rounded-t-2xl sm:rounded-t-3xl" />

        <div className="flex items-center gap-2.5 sm:gap-3 min-w-0 flex-1">
          {/* Animated Offline Icon Badge */}
          <div className="w-8 h-8 sm:w-9 sm:h-9 rounded-xl sm:rounded-2xl bg-amber-500/20 border border-amber-500/30 flex items-center justify-center text-amber-400 shrink-0 shadow-xs">
            <WifiOff className="w-4 h-4 sm:w-5 sm:h-5 animate-pulse" />
          </div>

          {/* Text Content */}
          <div className="flex flex-col text-right min-w-0 flex-1">
            <div className="flex items-center gap-1.5">
              <span className="font-bold text-xs sm:text-sm text-amber-200 truncate">
                انقطع الاتصال بالإنترنت
              </span>
              <span className="text-[10px] px-1.5 py-0.2 rounded-full bg-amber-500/15 border border-amber-500/30 text-amber-300 font-medium shrink-0">
                وضع بدون إنترنت
              </span>
            </div>
            <span className="text-[11px] text-stone-300 truncate">
              {isFullyOfflineReady
                ? 'المصحف الشريف والأذكار والأدعية تعمل بكفاءة'
                : `المصحف والتلاوات: ${downloadedSurahsCount} سورة متاحة للاستماع`}
            </span>
          </div>
        </div>

        {/* Actions Zone: Optional Open Manager & Dismiss X */}
        <div className="flex items-center gap-1.5 shrink-0">
          {onOpenOfflineManager && (
            <button
              type="button"
              onClick={onOpenOfflineManager}
              className="px-2.5 py-1 sm:px-3 sm:py-1.5 rounded-xl bg-amber-500/20 hover:bg-amber-500/30 text-amber-200 hover:text-white text-xs font-semibold transition-colors cursor-pointer border border-amber-400/30 whitespace-nowrap active:scale-95"
            >
              إدارة التنزيل
            </button>
          )}

          {/* Close / Dismiss Button */}
          <button
            type="button"
            onClick={dismissWithAnimation}
            className="p-1 sm:p-1.5 rounded-xl text-stone-400 hover:text-stone-200 hover:bg-stone-800 transition-colors cursor-pointer shrink-0"
            title="إخفاء التنبيه (أو اسحب لأعلى)"
            aria-label="إخفاء التنبيه"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  );
};
