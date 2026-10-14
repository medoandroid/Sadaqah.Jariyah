import React, { useState, useEffect, useRef } from 'react';
import {
  Home,
  BookOpen,
  BookMarked,
  Headphones,
  Heart,
  Moon,
  Disc,
  Sparkles,
  Award,
  Users,
  Gift,
  Search,
  Volume2,
  Edit3,
  User,
  Wifi,
  WifiOff,
  Clock,
  FileJson,
  ShieldCheck,
  Tv,
  Menu,
  X,
  ChevronDown,
  Layers
} from 'lucide-react';
import { useAudio } from '../context/AudioContext';
import { userProfileService, UserProfile } from '../services/userProfileService';
import { useOfflineSync } from '../hooks/useOfflineSync';

interface NavbarProps {
  activeTab: string;
  setActiveTab: (tab: string) => void;
  onOpenSearch: () => void;
  onOpenDedication: () => void;
  onOpenProfile?: () => void;
  onOpenOfflineManager?: () => void;
  onOpenPrayerTimes?: () => void;
  onOpenBackup?: () => void;
}

export const Navbar: React.FC<NavbarProps> = ({
  activeTab,
  setActiveTab,
  onOpenSearch,
  onOpenDedication,
  onOpenProfile,
  onOpenOfflineManager,
  onOpenPrayerTimes,
  onOpenBackup,
}) => {
  const { isPlaying, currentSurah } = useAudio();
  const { isOnline, isFullyOfflineReady } = useOfflineSync();
  const [isScrolled, setIsScrolled] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isMoreOpen, setIsMoreOpen] = useState(false);
  const [profile, setProfile] = useState<UserProfile>(userProfileService.getProfile());
  const dropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    return userProfileService.subscribe((updated) => {
      setProfile(updated);
    });
  }, []);

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 20);
    };
    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // Close "More" dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
        setIsMoreOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Close mobile drawer on route/tab change
  const handleNavClick = (tabId: string) => {
    setActiveTab(tabId);
    setIsMobileMenuOpen(false);
    setIsMoreOpen(false);
  };

  const primaryLinks = [
    { id: 'home', label: 'الرئيسية', icon: Home },
    { id: 'quran', label: 'القرآن', icon: BookOpen },
    { id: 'mushaf', label: 'المصحف الورقي', icon: BookMarked },
    { id: 'adhkar', label: 'الأذكار', icon: Moon },
    { id: 'tasbeeh', label: 'السبحة', icon: Disc },
    { id: 'prayer', label: 'المواقيت', icon: Clock },
    { id: 'persons', label: 'عنهم', icon: Users },
  ];

  const secondaryLinks = [
    { id: 'recitations', label: 'التلاوات الخاشعة', icon: Headphones, category: 'القرآن' },
    { id: 'khatmah', label: 'ختمة القرآن (٣٠ جزء)', icon: Award, category: 'القرآن' },
    { id: 'ruqyah', label: 'الرقية الشرعية', icon: ShieldCheck, category: 'الأذكار' },
    { id: 'hadith', label: 'الأربعون النووية', icon: BookOpen, category: 'الأذكار' },
    { id: 'asma', label: 'أسماء الله الحسنى', icon: Sparkles, category: 'الأذكار' },
    { id: 'haramain', label: 'بث الحرمين المباشر', icon: Tv, category: 'الأذكار' },
    { id: 'duas', label: 'الأدعية المأثورة', icon: Heart, category: 'الدعاء' },
    { id: 'personalDua', label: 'أدعيتي الخاصة', icon: Edit3, category: 'الدعاء' },
    { id: 'owner_sadaqah', label: 'صدقة صاحب المنصة', icon: Sparkles, category: 'الدعاء' },
    { id: 'dedications', label: 'إهداء الثواب', icon: Gift, category: 'الدعاء' },
  ];

  const activeSecondary = secondaryLinks.find((l) => l.id === activeTab);

  return (
    <>
      <div className="sticky top-2 sm:top-3 z-40 w-full px-3 sm:px-6 pointer-events-none transition-all duration-300">
        <header
          className={`max-w-7xl mx-auto pointer-events-auto rounded-3xl transition-all duration-300 relative overflow-visible ${
            isScrolled
              ? 'backdrop-blur-2xl bg-white/90 dark:bg-[#07130e]/95 border border-amber-500/25 shadow-[0_16px_40px_-10px_rgba(2,44,34,0.35),0_4px_16px_rgba(217,119,6,0.1)]'
              : 'backdrop-blur-xl bg-white/80 dark:bg-[#07130e]/85 border border-amber-500/20 shadow-[0_10px_30px_-5px_rgba(2,44,34,0.2),0_2px_8px_rgba(217,119,6,0.05)]'
          }`}
        >
          {/* Specular Liquid Glass Top Rim Highlight */}
          <div className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-amber-400/50 to-transparent pointer-events-none rounded-t-3xl" />

          <div className="px-3 sm:px-6 py-2.5 sm:py-3 flex items-center justify-between gap-2 sm:gap-4">
            
            {/* Brand Wordmark with Golden Halo */}
            <button
              onClick={() => handleNavClick('home')}
              className="flex items-center gap-2.5 text-right group cursor-pointer focus:outline-hidden shrink-0"
            >
              <span className="w-8 h-8 sm:w-9 sm:h-9 rounded-2xl bg-gradient-to-br from-emerald-850 to-amber-700/80 border border-amber-500/40 flex items-center justify-center text-amber-200 font-amiri text-lg sm:text-xl font-bold shadow-md group-hover:scale-105 transition-all">
                ص
              </span>
              <div className="flex flex-col text-right">
                <span className="font-amiri text-lg sm:text-2xl font-bold tracking-tight text-stone-900 dark:text-stone-100 group-hover:text-amber-800 dark:group-hover:text-amber-300 transition-colors leading-tight">
                  صدقة جارية
                </span>
                <span className="text-[11px] text-amber-700 dark:text-amber-400 font-bold font-amiri -mt-0.5">
                  عائلة الشهاوي
                </span>
              </div>
            </button>

            {/* Desktop Navigation Links */}
            <nav className="hidden lg:flex items-center gap-1 xl:gap-1.5 p-1 rounded-2xl bg-stone-100/70 dark:bg-emerald-950/30 border border-stone-200/50 dark:border-amber-500/15 backdrop-blur-md">
              {primaryLinks.map((link) => {
                const Icon = link.icon;
                const isActive = activeTab === link.id;
                return (
                  <button
                    key={link.id}
                    onClick={() => handleNavClick(link.id)}
                    className={`flex items-center gap-1.5 px-2.5 xl:px-3 py-1.5 text-xs xl:text-[13px] font-medium transition-all whitespace-nowrap rounded-xl cursor-pointer group relative shrink-0 ${
                      isActive
                        ? 'text-amber-950 dark:text-amber-200 font-bold bg-white/95 dark:bg-emerald-900/50 shadow-xs border border-amber-600/30'
                        : 'text-stone-600 dark:text-stone-300 hover:text-stone-900 dark:hover:text-amber-100 hover:bg-white/50 dark:hover:bg-emerald-900/20'
                    }`}
                  >
                    <Icon
                      className={`w-3.5 h-3.5 transition-transform group-hover:scale-110 ${
                        isActive
                          ? 'text-amber-700 dark:text-amber-400 stroke-[2.4px]'
                          : 'text-stone-400 dark:text-stone-400 group-hover:text-stone-700 dark:group-hover:text-stone-200 stroke-[1.8px]'
                      }`}
                    />
                    <span>{link.label}</span>
                    {isActive && (
                      <span className="absolute -bottom-1 left-1/2 -translate-x-1/2 w-4 h-0.5 bg-gradient-to-r from-transparent via-amber-500 to-transparent rounded-full" />
                    )}
                  </button>
                );
              })}

              {/* "More" Dropdown Menu */}
              <div className="relative" ref={dropdownRef}>
                <button
                  onClick={() => setIsMoreOpen(!isMoreOpen)}
                  className={`flex items-center gap-1.5 px-2.5 xl:px-3 py-1.5 text-xs xl:text-[13px] font-medium transition-all whitespace-nowrap rounded-xl cursor-pointer group relative ${
                    activeSecondary
                      ? 'text-amber-950 dark:text-amber-200 font-bold bg-white/95 dark:bg-emerald-900/50 shadow-xs border border-amber-600/30'
                      : 'text-stone-600 dark:text-stone-300 hover:text-stone-900 dark:hover:text-amber-100 hover:bg-white/50 dark:hover:bg-emerald-900/20'
                  }`}
                  aria-expanded={isMoreOpen}
                >
                  <Layers className="w-3.5 h-3.5 text-amber-500" />
                  <span>{activeSecondary ? activeSecondary.label : 'المزيد'}</span>
                  <ChevronDown className={`w-3 h-3 transition-transform ${isMoreOpen ? 'rotate-180' : ''}`} />
                </button>

                {isMoreOpen && (
                  <div className="absolute left-0 mt-2 w-72 rounded-2xl bg-white/95 dark:bg-[#07130e]/95 border border-amber-500/30 shadow-2xl backdrop-blur-2xl p-2 z-50 animate-in fade-in zoom-in-95 duration-150">
                    <div className="text-[10px] text-stone-400 dark:text-stone-400 px-2.5 py-1 font-semibold border-b border-stone-200/60 dark:border-stone-800">
                      أبواب وأقسام إضافية
                    </div>
                    <div className="grid grid-cols-1 gap-1 pt-1.5 max-h-80 overflow-y-auto scrollbar-none">
                      {secondaryLinks.map((sec) => {
                        const Icon = sec.icon;
                        const isSecActive = activeTab === sec.id;
                        return (
                          <button
                            key={sec.id}
                            onClick={() => handleNavClick(sec.id)}
                            className={`flex items-center justify-between px-3 py-2 rounded-xl text-xs transition-colors cursor-pointer text-right ${
                              isSecActive
                                ? 'bg-amber-500/15 text-amber-900 dark:text-amber-200 font-bold border border-amber-500/30'
                                : 'text-stone-700 dark:text-stone-300 hover:bg-stone-100 dark:hover:bg-emerald-950/50'
                            }`}
                          >
                            <div className="flex items-center gap-2">
                              <Icon className="w-3.5 h-3.5 text-amber-600 dark:text-amber-400 shrink-0" />
                              <span>{sec.label}</span>
                            </div>
                            <span className="text-[10px] text-stone-400 font-normal">{sec.category}</span>
                          </button>
                        );
                      })}
                    </div>
                  </div>
                )}
              </div>
            </nav>

            {/* Action Zone: Audio pill, Search, and Mobile Menu Toggle */}
            <div className="flex items-center gap-1.5 sm:gap-2.5 shrink-0">
              {/* Audio Mini Indicator if Playing */}
              {isPlaying && currentSurah && (
                <button
                  onClick={() => handleNavClick('quran')}
                  className="hidden sm:flex items-center gap-1.5 px-2.5 py-1.5 rounded-xl bg-amber-500/15 border border-amber-500/30 text-amber-900 dark:text-amber-300 text-xs font-semibold backdrop-blur-md animate-pulse cursor-pointer shadow-xs"
                  title="تلاوة جارية حالياً"
                >
                  <Volume2 className="w-3.5 h-3.5 text-amber-700 dark:text-amber-400 shrink-0" />
                  <span className="truncate max-w-[85px]">{currentSurah.name}</span>
                </button>
              )}

              {/* Quick Search Glass Pill */}
              <button
                onClick={onOpenSearch}
                className="p-2 sm:px-3 sm:py-1.5 text-stone-600 dark:text-stone-300 hover:text-amber-900 hover:bg-white/60 dark:hover:bg-stone-800/60 rounded-xl text-xs flex items-center gap-1.5 transition-all cursor-pointer border border-stone-200/50 dark:border-stone-700/50"
                aria-label="البحث في المنصة"
              >
                <Search className="w-4 h-4 text-stone-500 dark:text-stone-400" />
                <span className="hidden md:inline font-medium">بحث</span>
              </button>

              {/* Floating Glass Dedicate CTA */}
              <button
                onClick={onOpenDedication}
                className="flex items-center gap-1.5 px-3.5 sm:px-4 py-1.5 sm:py-2 text-xs sm:text-sm font-bold text-white bg-gradient-to-r from-amber-700 via-amber-800 to-amber-900 hover:from-amber-600 hover:to-amber-800 rounded-xl shadow-md hover:shadow-amber-900/20 transition-all cursor-pointer whitespace-nowrap active:scale-95 border border-amber-600/30 group"
              >
                <Sparkles className="w-3.5 h-3.5 text-amber-300 group-hover:rotate-12 transition-transform" />
                <span>إهداء ثواب</span>
              </button>

              {/* Mobile Drawer Hamburger Button */}
              <button
                onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
                className="lg:hidden p-2 rounded-xl text-stone-700 dark:text-stone-300 hover:bg-stone-100 dark:hover:bg-stone-800 border border-stone-200/80 dark:border-stone-750 transition-colors cursor-pointer"
                aria-label="القائمة الشاملة"
                title="فتح قائمة الأقسام"
              >
                {isMobileMenuOpen ? <X className="w-5 h-5 text-amber-500" /> : <Menu className="w-5 h-5" />}
              </button>
            </div>

          </div>
        </header>
      </div>

      {/* Mobile Liquid Glass Navigation Drawer */}
      {isMobileMenuOpen && (
        <div className="fixed inset-0 z-50 lg:hidden pointer-events-auto select-none" dir="rtl">
          {/* Backdrop */}
          <div
            onClick={() => setIsMobileMenuOpen(false)}
            className="fixed inset-0 bg-black/60 backdrop-blur-sm animate-in fade-in duration-200"
          />

          {/* Drawer Sheet */}
          <aside className="fixed inset-y-0 right-0 w-[85%] max-w-[340px] bg-[#FAF8F5] dark:bg-[#07130e] border-l border-amber-500/30 shadow-2xl flex flex-col justify-between overflow-y-auto animate-in slide-in-from-right duration-200 z-10">
            {/* Header */}
            <div>
              <div className="p-4 border-b border-stone-200 dark:border-stone-800 flex items-center justify-between">
                <div className="flex items-center gap-2.5">
                  <span className="w-8 h-8 rounded-xl bg-gradient-to-br from-emerald-850 to-amber-700/80 border border-amber-500/40 flex items-center justify-center text-amber-200 font-amiri font-bold text-lg">
                    ص
                  </span>
                  <div>
                    <h3 className="font-amiri font-bold text-base text-stone-900 dark:text-stone-100 leading-tight">
                      صدقة جارية
                    </h3>
                    <span className="text-[11px] text-amber-700 dark:text-amber-400 font-bold font-amiri">
                      عائلة الشهاوي
                    </span>
                  </div>
                </div>

                <button
                  onClick={() => setIsMobileMenuOpen(false)}
                  className="p-1.5 rounded-lg text-stone-400 hover:text-stone-700 dark:hover:text-stone-200 hover:bg-stone-200 dark:hover:bg-stone-800"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              {/* Kinship / User Identity Card */}
              {onOpenProfile && (
                <div className="p-3 mx-3 my-2.5 rounded-2xl bg-amber-500/10 border border-amber-500/25 flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Heart className="w-4 h-4 text-amber-500 fill-amber-500/30" />
                    <div className="text-xs">
                      <span className="font-bold text-amber-900 dark:text-amber-200 block">
                        {userProfileService.getConnectionBadge(profile)}
                      </span>
                      {profile.userName && (
                        <span className="text-stone-500 dark:text-stone-400 text-[11px]">({profile.userName})</span>
                      )}
                    </div>
                  </div>
                  <button
                    onClick={() => {
                      setIsMobileMenuOpen(false);
                      onOpenProfile();
                    }}
                    className="text-[11px] text-amber-800 dark:text-amber-300 font-bold hover:underline"
                  >
                    تعديل
                  </button>
                </div>
              )}

              {/* Categorized Navigation Links */}
              <div className="p-3 space-y-4">
                {/* 1. القرآن والمصحف */}
                <div>
                  <span className="text-[11px] font-bold text-stone-400 dark:text-stone-400 px-2 block mb-1">
                    📖 القرآن الكريم والتلاوات
                  </span>
                  <div className="space-y-0.5">
                    {[
                      { id: 'home', label: 'الرئيسية', icon: Home },
                      { id: 'quran', label: 'القرآن الكريم والتفسير', icon: BookOpen },
                      { id: 'mushaf', label: 'المصحف الورقي 3D', icon: BookMarked },
                      { id: 'recitations', label: 'التلاوات الخاشعة', icon: Headphones },
                      { id: 'khatmah', label: 'ختمة القرآن (٣٠ جزء)', icon: Award },
                    ].map((item) => {
                      const Icon = item.icon;
                      const isActive = activeTab === item.id;
                      return (
                        <button
                          key={item.id}
                          onClick={() => handleNavClick(item.id)}
                          className={`w-full flex items-center gap-2.5 px-3 py-2 rounded-xl text-xs font-medium text-right transition-colors ${
                            isActive
                              ? 'bg-amber-600 text-white font-bold shadow-xs'
                              : 'text-stone-700 dark:text-stone-300 hover:bg-stone-200/60 dark:hover:bg-emerald-950/40'
                          }`}
                        >
                          <Icon className={`w-4 h-4 ${isActive ? 'text-white' : 'text-amber-600 dark:text-amber-400'}`} />
                          <span>{item.label}</span>
                        </button>
                      );
                    })}
                  </div>
                </div>

                {/* 2. الأذكار والسنن */}
                <div>
                  <span className="text-[11px] font-bold text-stone-400 dark:text-stone-400 px-2 block mb-1">
                    🌿 الأذكار والسنن ومواقيت الصلاة
                  </span>
                  <div className="space-y-0.5">
                    {[
                      { id: 'tasbeeh', label: 'السبحة الإلكترونية المطورة', icon: Disc },
                      { id: 'adhkar', label: 'أذكار الصباح والمساء واليوم', icon: Moon },
                      { id: 'prayer', label: 'مواقيت الصلاة واتجاه القبلة', icon: Clock },
                      { id: 'ruqyah', label: 'الرقية الشرعية الكاملة', icon: ShieldCheck },
                      { id: 'hadith', label: 'الأربعون النووية وشرحها', icon: BookOpen },
                      { id: 'asma', label: 'أسماء الله الحسنى ومعانيها', icon: Sparkles },
                      { id: 'haramain', label: 'بث الحرمين المباشر', icon: Tv },
                    ].map((item) => {
                      const Icon = item.icon;
                      const isActive = activeTab === item.id;
                      return (
                        <button
                          key={item.id}
                          onClick={() => handleNavClick(item.id)}
                          className={`w-full flex items-center gap-2.5 px-3 py-2 rounded-xl text-xs font-medium text-right transition-colors ${
                            isActive
                              ? 'bg-amber-600 text-white font-bold shadow-xs'
                              : 'text-stone-700 dark:text-stone-300 hover:bg-stone-200/60 dark:hover:bg-emerald-950/40'
                          }`}
                        >
                          <Icon className={`w-4 h-4 ${isActive ? 'text-white' : 'text-amber-600 dark:text-amber-400'}`} />
                          <span>{item.label}</span>
                        </button>
                      );
                    })}
                  </div>
                </div>

                {/* 3. الدعاء والوفاء */}
                <div>
                  <span className="text-[11px] font-bold text-stone-400 dark:text-stone-400 px-2 block mb-1">
                    🤲 الدعاء والوفاء للأرواح الكريمة
                  </span>
                  <div className="space-y-0.5">
                    {[
                      { id: 'duas', label: 'الأدعية المأثورة للأموات', icon: Heart },
                      { id: 'personalDua', label: 'أدعيتي الخاصة ودفتر الرجاء', icon: Edit3 },
                      { id: 'persons', label: 'عن الأعمام الكرام وسيرتهم', icon: Users },
                      { id: 'owner_sadaqah', label: 'صدقة صاحب المنصة', icon: Sparkles },
                      { id: 'dedications', label: 'إهداء الثواب المباشر', icon: Gift },
                    ].map((item) => {
                      const Icon = item.icon;
                      const isActive = activeTab === item.id;
                      return (
                        <button
                          key={item.id}
                          onClick={() => handleNavClick(item.id)}
                          className={`w-full flex items-center gap-2.5 px-3 py-2 rounded-xl text-xs font-medium text-right transition-colors ${
                            isActive
                              ? 'bg-amber-600 text-white font-bold shadow-xs'
                              : 'text-stone-700 dark:text-stone-300 hover:bg-stone-200/60 dark:hover:bg-emerald-950/40'
                          }`}
                        >
                          <Icon className={`w-4 h-4 ${isActive ? 'text-white' : 'text-amber-600 dark:text-amber-400'}`} />
                          <span>{item.label}</span>
                        </button>
                      );
                    })}
                  </div>
                </div>

              </div>
            </div>

            {/* Bottom Utilities */}
            <div className="p-3 border-t border-stone-200 dark:border-stone-800 bg-stone-100/60 dark:bg-black/40 space-y-2">
              <button
                onClick={() => {
                  setIsMobileMenuOpen(false);
                  onOpenDedication();
                }}
                className="w-full py-2.5 rounded-xl bg-gradient-to-r from-amber-700 to-amber-800 hover:from-amber-600 hover:to-amber-700 text-white font-bold text-xs flex items-center justify-center gap-2 shadow-sm"
              >
                <Sparkles className="w-4 h-4 text-amber-200" />
                <span>إهداء ثواب لروحه</span>
              </button>

              <div className="grid grid-cols-2 gap-2 text-[11px]">
                {onOpenPrayerTimes && (
                  <button
                    onClick={() => {
                      setIsMobileMenuOpen(false);
                      onOpenPrayerTimes();
                    }}
                    className="p-2 rounded-xl bg-white dark:bg-stone-800 border border-stone-200 dark:border-stone-700 text-stone-700 dark:text-stone-300 flex items-center justify-center gap-1.5"
                  >
                    <Clock className="w-3.5 h-3.5 text-amber-500" />
                    <span>المواقيت</span>
                  </button>
                )}
                {onOpenOfflineManager && (
                  <button
                    onClick={() => {
                      setIsMobileMenuOpen(false);
                      onOpenOfflineManager();
                    }}
                    className="p-2 rounded-xl bg-white dark:bg-stone-800 border border-stone-200 dark:border-stone-700 text-stone-700 dark:text-stone-300 flex items-center justify-center gap-1.5"
                  >
                    {isOnline ? <Wifi className="w-3.5 h-3.5 text-emerald-500" /> : <WifiOff className="w-3.5 h-3.5 text-amber-500" />}
                    <span>{isOnline ? 'Offline' : 'بدون نت'}</span>
                  </button>
                )}
              </div>
            </div>

          </aside>
        </div>
      )}
    </>
  );
};
