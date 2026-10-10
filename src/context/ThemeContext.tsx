import React, { createContext, useContext, useState, useEffect } from 'react';
import { storageService } from '../services/storageService';

export type MushafTheme =
  | 'royal_gold'
  | 'parchment'
  | 'ottoman_cream'
  | 'emerald'
  | 'night'
  | 'pure';

export type FrameStyle = 'royal' | 'andalusian' | 'minimal' | 'none';
export type PatternStyle = 'stars' | 'arabesque' | 'parchment' | 'none';
export type QuranFontFamily = 'quran' | 'amiri';
export type ReadingLayout = 'continuous' | 'cards';

interface ThemeContextType {
  theme: MushafTheme;
  setTheme: (theme: MushafTheme) => void;
  frameStyle: FrameStyle;
  setFrameStyle: (frame: FrameStyle) => void;
  patternStyle: PatternStyle;
  setPatternStyle: (pattern: PatternStyle) => void;
  fontSize: number;
  setFontSize: (size: number) => void;
  fontFamily: QuranFontFamily;
  setFontFamily: (font: QuranFontFamily) => void;
  readingLayout: ReadingLayout;
  setReadingLayout: (layout: ReadingLayout) => void;
  showTafsir: boolean;
  setShowTafsir: (val: boolean) => void;
  getThemePalette: () => ThemePalette;
}

export interface ThemePalette {
  id: MushafTheme;
  name: string;
  desc: string;
  pageBg: string;
  textClass: string;
  borderClass: string;
  headerBg: string;
  goldAccent: string;
  ayahMarkerColor: string;
  highlightBg: string;
  isDark: boolean;
}

const THEME_PALETTES: Record<MushafTheme, ThemePalette> = {
  royal_gold: {
    id: 'royal_gold',
    name: 'المصحف الملكي المذهب',
    desc: 'ورق عاجي ملكي مع إطار مذهب ناصع وتأطير إسلامي فاخر',
    pageBg: 'bg-[#FBF8EF]',
    textClass: 'text-stone-900',
    borderClass: 'border-amber-600/40 shadow-amber-900/5',
    headerBg: 'bg-amber-100/60',
    goldAccent: 'text-amber-800',
    ayahMarkerColor: 'text-amber-700',
    highlightBg: 'bg-amber-200/40',
    isDark: false,
  },
  parchment: {
    id: 'parchment',
    name: 'المخطوطة الأندلسية',
    desc: 'ورق أثري كلاسيكي مائل للصفرة مع لمسات تراثية دافئة',
    pageBg: 'bg-[#F7F2E7]',
    textClass: 'text-stone-850',
    borderClass: 'border-[#D9CCA8]',
    headerBg: 'bg-[#EFE8D6]',
    goldAccent: 'text-amber-900',
    ayahMarkerColor: 'text-amber-800',
    highlightBg: 'bg-amber-100/50',
    isDark: false,
  },
  ottoman_cream: {
    id: 'ottoman_cream',
    name: 'التحفة العثمانية الشريفة',
    desc: 'خلفية كريمية ناصعة مريحة للنظر مستوحاة من مصحف المدينة',
    pageBg: 'bg-[#FCFBF8]',
    textClass: 'text-stone-900',
    borderClass: 'border-stone-300',
    headerBg: 'bg-stone-100',
    goldAccent: 'text-amber-700',
    ayahMarkerColor: 'text-amber-700',
    highlightBg: 'bg-amber-100/60',
    isDark: false,
  },
  emerald: {
    id: 'emerald',
    name: 'الروضة الزمردية',
    desc: 'أخضر رحماني مريح للعينين بنكهة قرآنية مباركة',
    pageBg: 'bg-[#EDF5EE]',
    textClass: 'text-emerald-950',
    borderClass: 'border-emerald-600/35',
    headerBg: 'bg-emerald-100/60',
    goldAccent: 'text-emerald-800',
    ayahMarkerColor: 'text-emerald-700',
    highlightBg: 'bg-emerald-200/40',
    isDark: false,
  },
  night: {
    id: 'night',
    name: 'المصحف الليلي المخملي',
    desc: 'أسود كحلي عميق مع خطوط ذهبية خافتة لقراءة هادئة ليلاً',
    pageBg: 'bg-[#15171C]',
    textClass: 'text-stone-100',
    borderClass: 'border-stone-800',
    headerBg: 'bg-stone-900',
    goldAccent: 'text-amber-400',
    ayahMarkerColor: 'text-amber-400',
    highlightBg: 'bg-amber-950/40',
    isDark: true,
  },
  pure: {
    id: 'pure',
    name: 'الميسر الصافي',
    desc: 'بياض معتدل ونقاء تام لأعلى تباين وسهولة في القراءة',
    pageBg: 'bg-[#FFFFFF]',
    textClass: 'text-stone-900',
    borderClass: 'border-stone-200',
    headerBg: 'bg-stone-50',
    goldAccent: 'text-amber-800',
    ayahMarkerColor: 'text-amber-700',
    highlightBg: 'bg-amber-50',
    isDark: false,
  },
};

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

export const ThemeProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [theme, setThemeState] = useState<MushafTheme>(() => {
    return storageService.getString('mushaf_theme', 'royal_gold') as MushafTheme;
  });

  const [frameStyle, setFrameStyleState] = useState<FrameStyle>(() => {
    return storageService.getString('quran_frame_style', 'royal') as FrameStyle;
  });

  const [patternStyle, setPatternStyleState] = useState<PatternStyle>(() => {
    return storageService.getString('quran_pattern_style', 'stars') as PatternStyle;
  });

  const [fontSize, setFontSizeState] = useState<number>(() => {
    return storageService.getNumber('quran_font_size', 26);
  });

  const [fontFamily, setFontFamilyState] = useState<QuranFontFamily>(() => {
    return storageService.getString('quran_font_family', 'quran') as QuranFontFamily;
  });

  const [readingLayout, setReadingLayoutState] = useState<ReadingLayout>(() => {
    return storageService.getString('quran_reading_layout', 'continuous') as ReadingLayout;
  });

  const [showTafsir, setShowTafsirState] = useState<boolean>(() => {
    return storageService.get<boolean>('quran_show_tafsir', false);
  });

  // Apply dark mode & theme data attribute to document
  useEffect(() => {
    try {
      document.documentElement.setAttribute('data-theme', theme);
      if (theme === 'night') {
        document.documentElement.classList.add('dark');
      } else {
        document.documentElement.classList.remove('dark');
      }
    } catch (e) {}
  }, [theme]);

  const setTheme = (t: MushafTheme) => {
    setThemeState(t);
    storageService.setString('mushaf_theme', t);
  };

  const setFrameStyle = (frame: FrameStyle) => {
    setFrameStyleState(frame);
    storageService.setString('quran_frame_style', frame);
  };

  const setPatternStyle = (pattern: PatternStyle) => {
    setPatternStyleState(pattern);
    storageService.setString('quran_pattern_style', pattern);
  };

  const setFontSize = (size: number) => {
    setFontSizeState(size);
    storageService.setNumber('quran_font_size', size);
  };

  const setFontFamily = (font: QuranFontFamily) => {
    setFontFamilyState(font);
    storageService.setString('quran_font_family', font);
  };

  const setReadingLayout = (layout: ReadingLayout) => {
    setReadingLayoutState(layout);
    storageService.setString('quran_reading_layout', layout);
  };

  const setShowTafsir = (val: boolean) => {
    setShowTafsirState(val);
    storageService.set('quran_show_tafsir', val);
  };

  const getThemePalette = (): ThemePalette => {
    return THEME_PALETTES[theme] || THEME_PALETTES.royal_gold;
  };

  return (
    <ThemeContext.Provider
      value={{
        theme,
        setTheme,
        frameStyle,
        setFrameStyle,
        patternStyle,
        setPatternStyle,
        fontSize,
        setFontSize,
        fontFamily,
        setFontFamily,
        readingLayout,
        setReadingLayout,
        showTafsir,
        setShowTafsir,
        getThemePalette,
      }}
    >
      {children}
    </ThemeContext.Provider>
  );
};

export const useTheme = () => {
  const context = useContext(ThemeContext);
  if (!context) {
    throw new Error('useTheme must be used within a ThemeProvider');
  }
  return context;
};
