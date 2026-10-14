import React, { useState, useEffect } from 'react';
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
  Trophy,
  ShieldCheck,
  Tv
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
  const [profile, setProfile] = useState<UserProfile>(userProfileService.getProfile());

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

  const navLinks = [
    { id: 'home', label: 'الرئيسية', icon: Home },
    { id: 'quran', label: 'القرآن', icon: BookOpen },
    { id: 'mushaf', label: 'المصحف الورقي', icon: BookMarked },
    { id: 'recitations', label: 'التلاوات', icon: Headphones },
    { id: 'prayer', label: 'مواقيت الصلاة', icon: Clock },
    { id: 'haramain', label: 'بث الحرمين', icon: Tv },
    { id: 'duas', label: 'الأدعية', icon: Heart },
    { id: 'personalDua', label: 'أدعيتي الخاصة', icon: Edit3 },
    { id: 'adhkar', label: 'الأذكار', icon: Moon },
    { id: 'ruqyah', label: 'الرقية الشرعية', icon: ShieldCheck },
    { id: 'hadith', label: 'الأربعون النووية', icon: BookOpen },
    { id: 'tasbeeh', label: 'السبحة', icon: Disc },
    { id: 'asma', label: 'أسماء الله', icon: Sparkles },
    { id: 'khatmah', label: 'الختمة', icon: Award },
    { id: 'persons', label: 'عنهم', icon: Users },
    { id: 'owner_sadaqah', label: 'صدقة صاحب المنصة', icon: Sparkles },
    { id: 'dedications', label: 'إهداء الثواب', icon: Gift },
  ];

  return (
    <div className="sticky top-2 sm:top-3 z-40 w-full px-3 sm:px-6 pointer-events-none transition-all duration-300">
      <header
        className={`max-w-7xl mx-auto pointer-events-auto rounded-3xl transition-all duration-300 relative overflow-hidden ${
          isScrolled
            ? 'backdrop-blur-2xl bg-white/85 dark:bg-[#07130e]/90 border border-amber-500/25 shadow-[0_16px_40px_-10px_rgba(2,44,34,0.4),0_4px_16px_rgba(217,119,6,0.12)]'
            : 'backdrop-blur-xl bg-white/75 dark:bg-[#07130e]/80 border border-amber-500/20 shadow-[0_10px_30px_-5px_rgba(2,44,34,0.25),0_2px_8px_rgba(217,119,6,0.06)]'
        }`}
      >
        {/* Specular Liquid Glass Top Rim Highlight */}
        <div className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-amber-400/50 to-transparent pointer-events-none" />

        <div className="px-3 sm:px-6 py-2.5 sm:py-3 flex items-center justify-between gap-2 sm:gap-4">
          
          {/* Brand Wordmark with Golden Halo */}
          <button
            onClick={() => setActiveTab('home')}
            className="flex items-center gap-2.5 text-right group cursor-pointer focus:outline-hidden shrink-0"
          >
            <span className="w-8 h-8 sm:w-9 sm:h-9 rounded-2xl bg-gradient-to-br from-emerald-800 to-amber-700/80 border border-amber-500/40 flex items-center justify-center text-amber-200 font-amiri text-lg sm:text-xl font-bold shadow-md group-hover:scale-105 transition-all">
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

          {/* Liquid Glass Navigation Links (Desktop with horizontal smooth scroll) */}
          <nav className="hidden lg:flex items-center gap-1 xl:gap-1.5 p-1 rounded-2xl bg-stone-100/70 dark:bg-emerald-950/30 border border-stone-200/50 dark:border-amber-500/15 backdrop-blur-md overflow-x-auto scrollbar-none max-w-[620px] xl:max-w-[720px]">
            {navLinks.map((link) => {
              const Icon = link.icon;
              const isActive = activeTab === link.id;
              return (
                <button
                  key={link.id}
                  onClick={() => setActiveTab(link.id)}
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
          </nav>

          {/* Action Zone: Audio pill, Search, and Dedication CTA */}
          <div className="flex items-center gap-1.5 sm:gap-2.5 shrink-0">
            {/* Audio Mini Indicator if Playing */}
            {isPlaying && currentSurah && (
              <button
                onClick={() => setActiveTab('quran')}
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

            {/* Quick Prayer Times Pill */}
            {onOpenPrayerTimes && (
              <button
                onClick={onOpenPrayerTimes}
                className="p-2 sm:px-2.5 sm:py-1.5 text-stone-600 dark:text-stone-300 hover:text-amber-900 dark:hover:text-amber-200 hover:bg-white/60 dark:hover:bg-stone-800/60 rounded-xl text-xs flex items-center gap-1.5 transition-all cursor-pointer border border-stone-200/50 dark:border-stone-700/50"
                title="مواقيت الصلاة اليومية"
                aria-label="مواقيت الصلاة"
              >
                <Clock className="w-4 h-4 text-amber-600 dark:text-amber-400" />
                <span className="hidden xl:inline font-medium">المواقيت</span>
              </button>
            )}

            {/* User Profile Local Identity Button */}
            {onOpenProfile && (
              <button
                onClick={onOpenProfile}
                className="p-2 sm:px-2.5 sm:py-1.5 text-stone-600 dark:text-stone-300 hover:text-amber-900 dark:hover:text-amber-200 hover:bg-white/60 dark:hover:bg-stone-800/60 rounded-xl text-xs flex items-center gap-1.5 transition-all cursor-pointer border border-stone-200/50 dark:border-stone-700/50"
                title={profile.userName ? `ملفي الشخصي: ${profile.userName}` : 'تخصيص اسمك وطرفك الأقرب محلياً'}
                aria-label="تخصيص الاسم محلياً"
              >
                <User className="w-4 h-4 text-amber-600 dark:text-amber-400" />
                <span className="hidden xl:inline font-medium truncate max-w-[90px]">
                  {profile.userName || 'تخصيص'}
                </span>
              </button>
            )}

            {/* Offline Center Quick Action */}
            {onOpenOfflineManager && (
              <button
                onClick={onOpenOfflineManager}
                className={`p-2 sm:px-2.5 sm:py-1.5 rounded-xl text-xs flex items-center gap-1.5 transition-all cursor-pointer border ${
                  !isOnline
                    ? 'bg-amber-500/20 text-amber-800 dark:text-amber-300 border-amber-500/40 animate-pulse'
                    : isFullyOfflineReady
                    ? 'text-emerald-700 dark:text-emerald-400 hover:bg-emerald-50 dark:hover:bg-stone-800/60 border-emerald-500/30'
                    : 'text-stone-600 dark:text-stone-400 hover:bg-white/60 dark:hover:bg-stone-800/60 border-stone-200/50 dark:border-stone-700/50'
                }`}
                title="إدارة العمل بدون إنترنت والمصحف والمزامنة (Offline Center)"
                aria-label="العمل بدون إنترنت"
              >
                {!isOnline ? (
                  <WifiOff className="w-4 h-4 text-amber-600 dark:text-amber-400" />
                ) : (
                  <Wifi className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
                )}
                <span className="hidden 2xl:inline font-medium text-[11px]">
                  {!isOnline ? 'Offline' : 'مصحف متاح'}
                </span>
              </button>
            )}

            {/* Floating Glass Dedicate CTA */}
            <button
              onClick={onOpenDedication}
              className="flex items-center gap-1.5 px-3.5 sm:px-4 py-1.5 sm:py-2 text-xs sm:text-sm font-bold text-white bg-gradient-to-r from-amber-700 via-amber-800 to-amber-900 hover:from-amber-600 hover:to-amber-800 rounded-xl shadow-md hover:shadow-amber-900/20 transition-all cursor-pointer whitespace-nowrap active:scale-96 border border-amber-600/30 group"
            >
              <Sparkles className="w-3.5 h-3.5 text-amber-300 group-hover:rotate-12 transition-transform" />
              <span>إهداء ثواب</span>
            </button>
          </div>

        </div>
      </header>
    </div>
  );
};
