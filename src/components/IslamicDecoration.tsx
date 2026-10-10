import React from 'react';

export const Star8Rosette: React.FC<{ className?: string }> = ({ className = 'w-6 h-6 text-amber-600/70' }) => (
  <svg
    viewBox="0 0 100 100"
    className={className}
    fill="currentColor"
    aria-hidden="true"
  >
    <path d="M50 0 L61 35 L97 25 L75 50 L97 75 L61 65 L50 100 L39 65 L3 75 L25 50 L3 25 L39 35 Z" opacity="0.9" />
    <circle cx="50" cy="50" r="14" fill="none" stroke="currentColor" strokeWidth="4" />
    <circle cx="50" cy="50" r="5" fill="currentColor" />
  </svg>
);

export const ArabesqueDivider: React.FC<{ className?: string }> = ({ className = 'my-8' }) => (
  <div className={`flex items-center justify-center gap-3 text-amber-700/60 ${className}`}>
    <div className="h-px w-16 md:w-32 bg-gradient-to-r from-transparent to-amber-700/40" />
    <Star8Rosette className="w-4 h-4 text-amber-600/75 shrink-0" />
    <div className="h-px w-16 md:w-32 bg-gradient-to-l from-transparent to-amber-700/40" />
  </div>
);

export const BismillahHeader: React.FC<{ className?: string }> = ({ className = 'my-6' }) => (
  <div className={`text-center ${className}`}>
    <div className="inline-block px-8 py-3 rounded-full border border-amber-800/20 bg-amber-50/60 dark:bg-stone-900/60 shadow-xs backdrop-blur-xs">
      <span className="font-amiri text-2xl md:text-3xl text-stone-800 dark:text-amber-100 tracking-wide select-none">
        بِسْمِ اللَّهِ الرَّحْمَٰنِ الرَّحِيمِ
      </span>
    </div>
  </div>
);

export const toArabicDigits = (num: number) => {
  const digits = ['٠', '١', '٢', '٣', '٤', '٥', '٦', '٧', '٨', '٩'];
  return String(num).replace(/[0-9]/g, (d) => digits[parseInt(d, 10)]);
};

export const AyahEndMarker: React.FC<{ number: number; className?: string }> = ({ number, className = '' }) => (
  <span className={`inline-flex items-center justify-center mx-1 select-none align-middle ${className}`}>
    <span className="relative inline-flex items-center justify-center w-7 h-7 text-amber-800 dark:text-amber-400 font-amiri text-xs font-bold leading-none">
      <svg
        viewBox="0 0 40 40"
        className="absolute inset-0 w-full h-full fill-amber-500/10 stroke-amber-700/70 dark:stroke-amber-400/80"
        strokeWidth="1.6"
      >
        <circle cx="20" cy="20" r="15" />
        <circle cx="20" cy="20" r="17.5" strokeDasharray="2.5 2" />
        <circle cx="20" cy="4" r="1.5" fill="currentColor" />
        <circle cx="20" cy="36" r="1.5" fill="currentColor" />
        <circle cx="4" cy="20" r="1.5" fill="currentColor" />
        <circle cx="36" cy="20" r="1.5" fill="currentColor" />
      </svg>
      <span className="relative z-10 pt-0.5">{toArabicDigits(number)}</span>
    </span>
  </span>
);

/**
 * Islamic Corner Ornament SVG (used in the 4 corners of Quran frames)
 */
export const IslamicCorner: React.FC<{ position: 'top-right' | 'top-left' | 'bottom-right' | 'bottom-left'; className?: string }> = ({
  position,
  className = 'w-10 h-10 text-amber-600/60 dark:text-amber-500/50'
}) => {
  const rotateClass = {
    'top-right': '',
    'top-left': 'scale-x-[-1]',
    'bottom-right': 'scale-y-[-1]',
    'bottom-left': 'scale-[-1]'
  }[position];

  return (
    <svg viewBox="0 0 60 60" className={`${className} ${rotateClass} pointer-events-none select-none`} fill="none" stroke="currentColor">
      {/* Outer corner bands */}
      <path d="M0,8 L24,8 Q32,8 32,16 L32,32 Q32,40 40,40 L60,40" strokeWidth="1.5" opacity="0.75" />
      <path d="M0,14 L20,14 Q26,14 26,20 L26,26 Q26,32 32,32 L60,32" strokeWidth="1" opacity="0.5" />
      {/* Inner floral star */}
      <circle cx="16" cy="16" r="4" fill="currentColor" opacity="0.8" />
      <circle cx="16" cy="16" r="8" stroke="currentColor" strokeWidth="1" strokeDasharray="2 1.5" opacity="0.6" />
      <path d="M16,4 L16,10 M16,22 L16,28 M4,16 L10,16 M22,16 L28,16" strokeWidth="1.2" opacity="0.7" />
    </svg>
  );
};

/**
 * Islamic Pattern Watermark Background for Quran reading pages
 */
export const IslamicPatternBackground: React.FC<{ pattern?: 'arabesque' | 'stars' | 'parchment' | 'none'; opacity?: number }> = ({
  pattern = 'arabesque',
  opacity = 0.04
}) => {
  if (pattern === 'none') return null;

  return (
    <div
      className="absolute inset-0 pointer-events-none select-none overflow-hidden"
      style={{ opacity }}
      aria-hidden="true"
    >
      {pattern === 'stars' && (
        <svg width="100%" height="100%">
          <defs>
            <pattern id="quran-stars-pattern" width="80" height="80" patternUnits="userSpaceOnUse">
              <path
                d="M40 0 L48 28 L76 20 L58 40 L76 60 L48 52 L40 80 L32 52 L4 60 L22 40 L4 20 L32 28 Z"
                fill="none"
                stroke="currentColor"
                strokeWidth="1.2"
              />
              <circle cx="40" cy="40" r="10" fill="none" stroke="currentColor" strokeWidth="0.8" />
            </pattern>
          </defs>
          <rect width="100%" height="100%" fill="url(#quran-stars-pattern)" className="text-amber-800 dark:text-amber-200" />
        </svg>
      )}

      {pattern === 'arabesque' && (
        <svg width="100%" height="100%">
          <defs>
            <pattern id="quran-arabesque-pattern" width="60" height="60" patternUnits="userSpaceOnUse">
              <path
                d="M30 0 C45 15 45 45 30 60 C15 45 15 15 30 0 Z M0 30 C15 45 45 45 60 30 C45 15 15 15 0 30 Z"
                fill="none"
                stroke="currentColor"
                strokeWidth="1"
              />
              <circle cx="30" cy="30" r="5" fill="none" stroke="currentColor" strokeWidth="1" />
            </pattern>
          </defs>
          <rect width="100%" height="100%" fill="url(#quran-arabesque-pattern)" className="text-amber-900 dark:text-amber-100" />
        </svg>
      )}

      {pattern === 'parchment' && (
        <div className="w-full h-full bg-[radial-gradient(#b45309_0.8px,transparent_0.8px)] [background-size:24px_24px] opacity-40" />
      )}
    </div>
  );
};

/**
 * Authentic Ornate Surah Title Banner (تاج السورة)
 */
export const SurahTitleBanner: React.FC<{
  surahName: string;
  surahNumber: number;
  ayahsCount: number;
  revelationArabic: string;
  className?: string;
}> = ({ surahName, surahNumber, ayahsCount, revelationArabic, className = '' }) => {
  return (
    <div className={`relative max-w-2xl mx-auto my-6 px-4 select-none ${className}`}>
      {/* Ornate Frame Container */}
      <div className="relative border-2 border-amber-600/40 dark:border-amber-500/30 rounded-2xl bg-gradient-to-r from-amber-50/70 via-amber-100/50 to-amber-50/70 dark:from-stone-900/80 dark:via-stone-850/90 dark:to-stone-900/80 p-3 sm:p-4 text-center shadow-md">
        
        {/* Corner rosettes */}
        <div className="absolute -top-3 right-4 bg-white dark:bg-stone-900 px-2 flex items-center gap-1.5 text-amber-700 dark:text-amber-400 text-xs font-bold">
          <Star8Rosette className="w-3.5 h-3.5 text-amber-600" />
          <span>سُورَةُ {surahName}</span>
          <Star8Rosette className="w-3.5 h-3.5 text-amber-600" />
        </div>

        {/* Inner golden header */}
        <div className="flex items-center justify-between text-xs text-stone-600 dark:text-stone-300 font-amiri px-2 sm:px-6 pt-1">
          <span className="font-bold text-amber-900 dark:text-amber-200">
            {revelationArabic}
          </span>
          <span className="text-xs text-stone-400 font-sans">
            رقم السورة: {toArabicDigits(surahNumber)}
          </span>
          <span className="font-bold text-amber-900 dark:text-amber-200">
            آياتُها {toArabicDigits(ayahsCount)}
          </span>
        </div>
      </div>
    </div>
  );
};
