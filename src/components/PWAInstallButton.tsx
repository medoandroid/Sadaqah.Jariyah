import React, { useState } from 'react';
import { Download, Smartphone, Share2, X, Check, Sparkles } from 'lucide-react';
import { usePWAInstall } from '../hooks/usePWAInstall';

export const PWAInstallButton: React.FC<{ variant?: 'compact' | 'badge' | 'full' }> = ({
  variant = 'compact',
}) => {
  const { isInstallable, isInstalled, isIOS, install } = usePWAInstall();
  const [showIOSGuide, setShowIOSGuide] = useState(false);
  const [isInstalling, setIsInstalling] = useState(false);

  // If already running as an installed PWA, hide
  if (isInstalled) {
    return null;
  }

  const handleInstallClick = async () => {
    setIsInstalling(true);
    await install();
    setIsInstalling(false);
  };

  // Chromium / Android / Desktop flow
  if (isInstallable) {
    if (variant === 'badge') {
      return (
        <button
          onClick={handleInstallClick}
          disabled={isInstalling}
          className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-amber-600/20 hover:bg-amber-600/30 text-amber-300 border border-amber-500/40 text-[11px] font-bold transition-all cursor-pointer shadow-xs active:scale-95"
          title="تثبيت التطبيق على جهازك للتشغيل السريع وبدون إنترنت"
        >
          <Download className="w-3 h-3 text-amber-400 animate-bounce" />
          <span>تثبيت التطبيق</span>
        </button>
      );
    }

    return (
      <button
        onClick={handleInstallClick}
        disabled={isInstalling}
        className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-gradient-to-r from-amber-700 to-amber-800 hover:from-amber-600 hover:to-amber-700 text-white text-xs font-bold transition-all cursor-pointer shadow-sm active:scale-95 border border-amber-500/30"
        title="تثبيت التطبيق على جهازك للتشغيل السريع وبدون إنترنت"
      >
        <Download className="w-3.5 h-3.5 text-amber-300" />
        <span>تثبيت كـتطبيق</span>
      </button>
    );
  }

  // iOS Safari flow
  if (isIOS) {
    return (
      <>
        <button
          onClick={() => setShowIOSGuide(true)}
          className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-stone-800/80 hover:bg-stone-700 text-amber-300 border border-amber-500/30 text-xs font-bold transition-all cursor-pointer active:scale-95"
          title="إضافة التطبيق للشاشة الرئيسية على آيفون وآيباد"
        >
          <Smartphone className="w-3.5 h-3.5 text-amber-400" />
          <span>تثبيت على الآيفون</span>
        </button>

        {showIOSGuide && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-stone-950/80 backdrop-blur-md p-4 animate-in fade-in duration-150">
            <div className="w-full max-w-sm rounded-3xl bg-white dark:bg-stone-900 border border-amber-600/30 p-6 text-right space-y-4 shadow-2xl">
              <div className="flex items-center justify-between pb-2 border-b border-stone-100 dark:border-stone-800">
                <div className="flex items-center gap-2">
                  <Smartphone className="w-5 h-5 text-amber-600" />
                  <h3 className="font-amiri text-lg font-bold text-stone-900 dark:text-stone-100">
                    تثبيت المنصة على iPhone / iPad
                  </h3>
                </div>
                <button
                  onClick={() => setShowIOSGuide(false)}
                  className="p-1 text-stone-400 hover:text-stone-700 dark:hover:text-stone-200"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              <div className="space-y-3 text-xs text-stone-700 dark:text-stone-300 leading-relaxed font-sans">
                <div className="flex items-start gap-2.5 p-3 rounded-2xl bg-amber-50 dark:bg-stone-800/60 border border-amber-200/60 dark:border-stone-700">
                  <span className="w-5 h-5 rounded-full bg-amber-700 text-white flex items-center justify-center font-bold text-[10px] shrink-0">
                    ١
                  </span>
                  <span>
                    اضغط على زر <strong>المشاركة (Share)</strong> أسفل شاشة متصفح Safari.
                  </span>
                </div>

                <div className="flex items-start gap-2.5 p-3 rounded-2xl bg-amber-50 dark:bg-stone-800/60 border border-amber-200/60 dark:border-stone-700">
                  <span className="w-5 h-5 rounded-full bg-amber-700 text-white flex items-center justify-center font-bold text-[10px] shrink-0">
                    ٢
                  </span>
                  <span>
                    مرر للأسفل واضغط على <strong>إضافة إلى الشاشة الرئيسية (Add to Home Screen)</strong>.
                  </span>
                </div>

                <div className="flex items-start gap-2.5 p-3 rounded-2xl bg-emerald-50 dark:bg-stone-800/60 border border-emerald-200/60 dark:border-stone-700">
                  <Check className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                  <span>
                    سيتم تشغيل التطبيق بسرعة فائقة وكأنه تطبيق أصلي مع دعم التصفح دون إنترنت!
                  </span>
                </div>
              </div>

              <button
                onClick={() => setShowIOSGuide(false)}
                className="w-full py-2.5 rounded-xl bg-amber-800 hover:bg-amber-900 text-white text-xs font-bold shadow-md cursor-pointer transition-colors"
              >
                فهمت، حسناً
              </button>
            </div>
          </div>
        )}
      </>
    );
  }

  return null;
};
