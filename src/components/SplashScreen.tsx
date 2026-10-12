import React, { useState, useEffect } from 'react';
import { Star8Rosette } from './IslamicDecoration';

interface SplashScreenProps {
  onFinish?: () => void;
}

export const SplashScreen: React.FC<SplashScreenProps> = ({ onFinish }) => {
  const [isVisible, setIsVisible] = useState<boolean>(() => {
    if (typeof window === 'undefined') return false;
    try {
      return sessionStorage.getItem('sadaqah_pwa_splash_seen') !== 'true';
    } catch {
      return false;
    }
  });

  const [isFadingOut, setIsFadingOut] = useState<boolean>(false);

  useEffect(() => {
    if (!isVisible) return;

    // Minimum display time for high-end animation feel: 1.25s
    const timer = setTimeout(() => {
      handleDismiss();
    }, 1350);

    return () => clearTimeout(timer);
  }, [isVisible]);

  const handleDismiss = () => {
    setIsFadingOut(true);
    try {
      sessionStorage.setItem('sadaqah_pwa_splash_seen', 'true');
    } catch {}

    setTimeout(() => {
      setIsVisible(false);
      if (onFinish) onFinish();
    }, 450);
  };

  if (!isVisible) return null;

  return (
    <div
      onClick={handleDismiss}
      className={`fixed inset-0 z-[100] flex flex-col items-center justify-center bg-[#12141A] text-stone-100 select-none cursor-pointer transition-opacity duration-500 ease-out ${
        isFadingOut ? 'opacity-0 scale-102 pointer-events-none' : 'opacity-100 scale-100'
      }`}
      dir="rtl"
      aria-label="شاشة البداية"
    >
      {/* Background ambient lighting */}
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,rgba(217,119,6,0.12)_0%,rgba(18,20,26,0.95)_70%)] pointer-events-none"></div>

      <div className="relative z-10 flex flex-col items-center text-center px-6 max-w-sm space-y-5 animate-fade-in">
        
        {/* Animated Islamic Emblem */}
        <div className="relative flex items-center justify-center w-24 h-24 sm:w-28 sm:h-28">
          <div className="absolute inset-0 rounded-full bg-amber-500/10 blur-xl animate-pulse"></div>
          <div className="transition-transform duration-1000 transform hover:rotate-45">
            <Star8Rosette className="w-16 h-16 sm:w-20 sm:h-20 text-amber-500" />
          </div>
        </div>

        {/* Bismillah Calligraphy */}
        <p className="font-amiri text-amber-200/80 text-sm sm:text-base tracking-wide">
          بِسْمِ اللَّهِ الرَّحْمَٰنِ الرَّحِيمِ
        </p>

        {/* Brand Name */}
        <div className="space-y-1">
          <h1 className="font-amiri text-3xl sm:text-4xl font-extrabold tracking-tight text-white drop-shadow-md">
            صدقة جارية
          </h1>
          <div className="inline-block px-3 py-0.5 rounded-full bg-amber-500/20 border border-amber-500/40 text-amber-300 text-xs sm:text-sm font-bold font-amiri">
            عائلة الشهاوي
          </div>
        </div>

        {/* Spiritual Subtitle */}
        <p className="text-[12px] sm:text-xs text-stone-400 font-light max-w-xs leading-relaxed">
          القرآن الكريم · المصحف المرتل · الأذكار · مواقيت الصلاة · بث الحرمين
        </p>

        {/* Smooth Loader Bar */}
        <div className="w-44 h-1 bg-stone-800 rounded-full overflow-hidden mt-4">
          <div className="h-full bg-gradient-to-r from-amber-600 to-amber-400 rounded-full animate-[shimmer_1.3s_ease-in-out_infinite]"
               style={{
                 width: '100%',
                 animation: 'pulse 1.2s ease-in-out infinite'
               }}>
          </div>
        </div>

        <span className="text-[10px] text-stone-500 hover:text-stone-400 pt-2 transition-colors">
          انقر في أي مكان للدخول الفوري ⏎
        </span>
      </div>
    </div>
  );
};
