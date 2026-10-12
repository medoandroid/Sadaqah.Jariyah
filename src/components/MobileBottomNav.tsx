import React, { useState } from 'react';
import {
  Home,
  BookOpen,
  BookMarked,
  Headphones,
  Heart,
  Disc,
  Users,
  MoreHorizontal,
  X,
  Clock,
  ShieldCheck,
  Sparkles,
  Award,
  Edit3,
  Gift,
  Moon,
  Tv
} from 'lucide-react';

interface MobileBottomNavProps {
  activeTab: string;
  setActiveTab: (tab: string) => void;
}

export const MobileBottomNav: React.FC<MobileBottomNavProps> = ({ activeTab, setActiveTab }) => {
  const [isMoreOpen, setIsMoreOpen] = useState(false);

  const mainTabs = [
    { id: 'home', label: 'الرئيسية', icon: Home },
    { id: 'quran', label: 'القرآن', icon: BookOpen },
    { id: 'mushaf', label: 'المصحف', icon: BookMarked },
    { id: 'recitations', label: 'التلاوات', icon: Headphones },
    { id: 'tasbeeh', label: 'السبحة', icon: Disc },
    { id: 'duas', label: 'الأدعية', icon: Heart },
  ];

  const moreTabs = [
    { id: 'prayer', label: 'مواقيت الصلاة', icon: Clock, desc: 'مواقيت الصلوات اليومية والعد التنازلي' },
    { id: 'haramain', label: 'بث الحرمين الشريفين', icon: Tv, desc: 'بث مباشر حي من مكة المكرمة والمدينة المنورة' },
    { id: 'ruqyah', label: 'الرقية الشرعية', icon: ShieldCheck, desc: 'آيات وأدعية الشفاء والتحصين' },
    { id: 'hadith', label: 'الأربعون النووية', icon: BookOpen, desc: 'أحاديث نبوية جامعة مع الشرح' },
    { id: 'adhkar', label: 'أذكار المسلم', icon: Moon, desc: 'أذكار الصباح والمساء واليوم' },
    { id: 'personalDua', label: 'أدعيتي الخاصة', icon: Edit3, desc: 'مناجاة شخصية وأدعية محفوظة' },
    { id: 'asma', label: 'أسماء الله الحسنى', icon: Sparkles, desc: '٩٩ اسماً مباركاً مع معانيها' },
    { id: 'khatmah', label: 'الختمة التشاركية', icon: Award, desc: 'ختمة قرآنية مهداة' },
    { id: 'persons', label: 'عنهم (سيرتهم)', icon: Users, desc: 'تخليد ذكرى أفراد عائلة الشهاوي الكرام' },
    { id: 'owner_sadaqah', label: 'صدقة صاحب المنصة', icon: Sparkles, desc: 'صدقة جارية ودعوة حلوة من القلب لصاحب المنصة' },
    { id: 'dedications', label: 'إهداء الثواب', icon: Gift, desc: 'سجل الإهداءات والأعمال' },
  ];

  const isMoreActive = moreTabs.some((t) => t.id === activeTab);

  const handleSelectTab = (tabId: string) => {
    setActiveTab(tabId);
    setIsMoreOpen(false);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  return (
    <>
      {/* More Options Modal Sheet */}
      {isMoreOpen && (
        <div
          className="lg:hidden fixed inset-0 z-50 bg-stone-950/70 backdrop-blur-sm flex flex-col justify-end p-3 animate-in fade-in duration-200"
          onClick={() => setIsMoreOpen(false)}
        >
          <div
            className="w-full max-w-lg mx-auto bg-white dark:bg-stone-900 rounded-3xl p-5 border border-amber-600/20 shadow-2xl text-right space-y-4 mb-20 animate-in slide-in-from-bottom-6 duration-200"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Sheet Header */}
            <div className="flex items-center justify-between border-b border-stone-100 dark:border-stone-800 pb-3">
              <span className="font-amiri text-lg font-bold text-stone-900 dark:text-stone-100">
                أقسام وخدمات المنصة المباركة
              </span>
              <button
                onClick={() => setIsMoreOpen(false)}
                className="p-1.5 rounded-xl text-stone-400 hover:text-stone-700 dark:hover:text-stone-200 bg-stone-100 dark:bg-stone-800"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Grid of Sections */}
            <div className="grid grid-cols-2 gap-2 max-h-[55vh] overflow-y-auto p-1">
              {moreTabs.map((tab) => {
                const Icon = tab.icon;
                const isCurrent = activeTab === tab.id;
                return (
                  <button
                    key={tab.id}
                    onClick={() => handleSelectTab(tab.id)}
                    className={`p-3 rounded-2xl border text-right transition-all flex flex-col gap-1 cursor-pointer ${
                      isCurrent
                        ? 'bg-amber-500/15 border-amber-500/40 text-amber-950 dark:text-amber-200 font-bold'
                        : 'bg-stone-50 dark:bg-stone-800/60 border-stone-200 dark:border-stone-800 text-stone-800 dark:text-stone-200 hover:bg-amber-50/50'
                    }`}
                  >
                    <div className="flex items-center gap-2">
                      <div className="w-7 h-7 rounded-lg bg-amber-500/15 flex items-center justify-center text-amber-700 dark:text-amber-400 shrink-0">
                        <Icon className="w-4 h-4" />
                      </div>
                      <span className="text-xs font-bold leading-tight line-clamp-1">{tab.label}</span>
                    </div>
                    <span className="text-[10px] text-stone-400 line-clamp-1 pr-1">{tab.desc}</span>
                  </button>
                );
              })}
            </div>
          </div>
        </div>
      )}

      {/* Main Bottom Bar */}
      <div className="lg:hidden fixed bottom-3 left-2.5 right-2.5 z-40 max-w-md mx-auto pointer-events-none">
        <div className="pointer-events-auto rounded-3xl backdrop-blur-2xl bg-white/85 dark:bg-stone-900/90 border border-white/80 dark:border-amber-500/25 shadow-[0_16px_40px_rgba(0,0,0,0.15),0_2px_12px_rgba(217,119,6,0.12)] p-1.5 transition-all">
          
          {/* Specular highlight rim */}
          <div className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-white/90 dark:via-amber-400/40 to-transparent pointer-events-none rounded-t-3xl" />

          <div className="grid grid-cols-7 gap-0.5 items-center">
            {mainTabs.map((tab) => {
              const Icon = tab.icon;
              const isActive = activeTab === tab.id;
              return (
                <button
                  key={tab.id}
                  onClick={() => handleSelectTab(tab.id)}
                  className={`flex flex-col items-center justify-center py-1.5 px-0.5 rounded-2xl transition-all cursor-pointer relative ${
                    isActive
                      ? 'text-amber-950 dark:text-amber-200 font-bold bg-amber-500/15 dark:bg-amber-500/20 shadow-xs scale-102'
                      : 'text-stone-500 dark:text-stone-400 hover:text-stone-900 dark:hover:text-stone-100 hover:bg-stone-100/50'
                  }`}
                >
                  <Icon
                    className={`w-4 h-4 mb-0.5 transition-transform ${
                      isActive ? 'stroke-[2.5px] text-amber-800 dark:text-amber-400 scale-110' : 'stroke-[1.8px]'
                    }`}
                  />
                  <span className="text-[9px] sm:text-[10px] leading-tight whitespace-nowrap">
                    {tab.label}
                  </span>
                  {isActive && (
                    <span className="w-1.5 h-1.5 rounded-full bg-amber-700 dark:bg-amber-400 mt-0.5 shadow-xs" />
                  )}
                </button>
              );
            })}

            {/* More Button */}
            <button
              onClick={() => setIsMoreOpen(!isMoreOpen)}
              className={`flex flex-col items-center justify-center py-1.5 px-0.5 rounded-2xl transition-all cursor-pointer relative ${
                isMoreActive || isMoreOpen
                  ? 'text-amber-950 dark:text-amber-200 font-bold bg-amber-500/15 dark:bg-amber-500/20 shadow-xs'
                  : 'text-stone-500 dark:text-stone-400 hover:text-stone-900 dark:hover:text-stone-100 hover:bg-stone-100/50'
              }`}
            >
              <MoreHorizontal
                className={`w-4 h-4 mb-0.5 transition-transform ${
                  isMoreActive || isMoreOpen ? 'stroke-[2.5px] text-amber-800 dark:text-amber-400 scale-110' : 'stroke-[1.8px]'
                }`}
              />
              <span className="text-[9px] sm:text-[10px] leading-tight whitespace-nowrap">
                المزيد
              </span>
              {(isMoreActive || isMoreOpen) && (
                <span className="w-1.5 h-1.5 rounded-full bg-amber-700 dark:bg-amber-400 mt-0.5 shadow-xs" />
              )}
            </button>
          </div>
        </div>
      </div>
    </>
  );
};
