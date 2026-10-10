import React, { useState, useEffect } from 'react';
import { Wifi, WifiOff, RefreshCw, CheckCircle2, Download } from 'lucide-react';
import { useOfflineSync } from '../hooks/useOfflineSync';

interface OfflineStatusBannerProps {
  onOpenOfflineManager: () => void;
}

export const OfflineStatusBanner: React.FC<OfflineStatusBannerProps> = ({
  onOpenOfflineManager,
}) => {
  const {
    isOnline,
    isFullyOfflineReady,
    downloadedSurahsCount,
    isSyncing,
    triggerSync,
  } = useOfflineSync();

  const [wasOffline, setWasOffline] = useState(false);
  const [showReconnectedToast, setShowReconnectedToast] = useState(false);

  useEffect(() => {
    if (!isOnline) {
      setWasOffline(true);
      setShowReconnectedToast(false);
    } else if (wasOffline && isOnline) {
      setShowReconnectedToast(true);
      const timer = setTimeout(() => {
        setShowReconnectedToast(false);
        setWasOffline(false);
      }, 4000);
      return () => clearTimeout(timer);
    }
  }, [isOnline, wasOffline]);

  // If reconnected toast is active
  if (showReconnectedToast) {
    return (
      <div className="fixed bottom-20 lg:bottom-6 left-4 z-50 animate-in fade-in slide-in-from-bottom-3 duration-300 pointer-events-auto">
        <div className="flex items-center gap-2.5 px-4 py-2.5 rounded-2xl bg-emerald-900/95 text-white shadow-2xl border border-emerald-500/40 backdrop-blur-md text-xs font-semibold">
          <CheckCircle2 className="w-4 h-4 text-emerald-300 shrink-0" />
          <span>تمت استعادة الاتصال بنجاح — جاري المزامنة التلقائية</span>
        </div>
      </div>
    );
  }

  // If currently offline
  if (!isOnline) {
    return (
      <div className="fixed bottom-20 lg:bottom-6 left-4 z-50 animate-in fade-in slide-in-from-bottom-3 duration-300 pointer-events-auto">
        <div className="flex items-center gap-2.5 p-1.5 pl-3 rounded-2xl bg-amber-950/90 text-white shadow-2xl border border-amber-500/40 backdrop-blur-md text-xs">
          <div className="w-7 h-7 rounded-xl bg-amber-500/20 flex items-center justify-center text-amber-300 shrink-0">
            <WifiOff className="w-4 h-4 animate-pulse" />
          </div>

          <div className="flex flex-col text-right">
            <span className="font-bold text-amber-200">وضع العمل بدون إنترنت (Offline)</span>
            <span className="text-[10px] text-stone-300">
              {isFullyOfflineReady
                ? 'المصحف والأذكار والأدعية والسبحة متاحة بالكامل'
                : `المصحف: ${downloadedSurahsCount}/114 سورة محفوظة`}
            </span>
          </div>

          <button
            onClick={onOpenOfflineManager}
            className="px-2.5 py-1.5 rounded-xl bg-amber-500/25 hover:bg-amber-500/40 text-amber-200 hover:text-white text-[11px] font-bold transition-colors cursor-pointer border border-amber-400/30 shrink-0"
          >
            إدارة البيانات
          </button>
        </div>
      </div>
    );
  }

  return null;
};
