import React, { useState, useMemo } from 'react';
import {
  Sun,
  Moon,
  Sparkles,
  RotateCcw,
  CheckCircle,
  Heart,
  Volume2,
  Check,
  Shield,
  ShieldCheck,
  Search,
  BookOpen,
  Copy,
  Compass,
  Flame,
  CloudRain,
  Share2,
  Filter
} from 'lucide-react';
import { ADHKAR_LIST, ADHKAR_CATEGORIES } from '../data/adhkar';
import { HISN_MUSLIM_DATA, HISN_CATEGORIES, HisnDhikr } from '../data/hisnMuslim';
import { recordDedication } from '../services/dedicationService';
import { Star8Rosette, ArabesqueDivider } from '../components/IslamicDecoration';

interface AdhkarPageProps {
  onOpenDedication: () => void;
}

export const AdhkarPage: React.FC<AdhkarPageProps> = ({ onOpenDedication }) => {
  // Main view toggle: 'daily' (الأذكار الراتبة) vs 'hisn' (موسوعة حصن المسلم)
  const [mainView, setMainView] = useState<'daily' | 'hisn'>('hisn');

  // Daily Adhkar states
  const [activeCategory, setActiveCategory] = useState<string>('morning');
  const [dailyCounts, setDailyCounts] = useState<Record<string, number>>({});

  // Hisn al-Muslim states
  const [hisnCategory, setHisnCategory] = useState<string>('الكل');
  const [hisnSearch, setHisnSearch] = useState<string>('');
  const [hisnCounts, setHisnCounts] = useState<Record<string, number>>({});

  // Feedback Toast
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 2500);
  };

  // ----------------------------------------------------
  // DAILY ADHKAR LOGIC
  // ----------------------------------------------------
  const currentDailyAdhkar = ADHKAR_LIST.filter((a) => a.category === activeCategory);

  const getDailyRemaining = (id: string, initial: number) => {
    if (dailyCounts[id] === undefined) return initial;
    return dailyCounts[id];
  };

  const handleDailyTap = (id: string, initial: number) => {
    const remaining = getDailyRemaining(id, initial);
    if (remaining > 0) {
      const next = remaining - 1;
      setDailyCounts({ ...dailyCounts, [id]: next });

      if (typeof window !== 'undefined' && 'vibrate' in navigator) {
        navigator.vibrate(25);
      }

      if (next === 0) {
        showToast('اكتمل هذا الذكر المبارك، تقبل الله منكم');
      }
    }
  };

  const handleResetDailyCategory = () => {
    const nextCounts = { ...dailyCounts };
    currentDailyAdhkar.forEach((item) => {
      delete nextCounts[item.id];
    });
    setDailyCounts(nextCounts);
    showToast('تم إعادة تعيين عدادات هذه المجموعة');
  };

  const completedDailyCount = currentDailyAdhkar.filter(
    (item) => getDailyRemaining(item.id, item.count) === 0
  ).length;

  const dailyProgressPercent = currentDailyAdhkar.length > 0
    ? (completedDailyCount / currentDailyAdhkar.length) * 100
    : 0;

  // ----------------------------------------------------
  // HISN AL-MUSLIM LOGIC
  // ----------------------------------------------------
  const filteredHisnList = useMemo(() => {
    return HISN_MUSLIM_DATA.filter((item) => {
      const matchesSearch =
        hisnSearch.trim() === '' ||
        item.title.toLowerCase().includes(hisnSearch.toLowerCase()) ||
        item.text.toLowerCase().includes(hisnSearch.toLowerCase()) ||
        (item.occasion && item.occasion.toLowerCase().includes(hisnSearch.toLowerCase())) ||
        item.category.toLowerCase().includes(hisnSearch.toLowerCase());

      if (!matchesSearch) return false;

      if (hisnCategory === 'الكل') return true;
      return item.category === hisnCategory;
    });
  }, [hisnCategory, hisnSearch]);

  const getHisnRemaining = (id: string, initial: number) => {
    if (hisnCounts[id] === undefined) return initial;
    return hisnCounts[id];
  };

  const handleHisnTap = (id: string, initial: number) => {
    const remaining = getHisnRemaining(id, initial);
    if (remaining > 0) {
      const next = remaining - 1;
      setHisnCounts({ ...hisnCounts, [id]: next });

      if (typeof window !== 'undefined' && 'vibrate' in navigator) {
        navigator.vibrate(25);
      }

      if (next === 0) {
        showToast('تقبل الله ذكرك وطاعتك وحصنك بحصنه المنيع');
      }
    }
  };

  const handleResetHisnCategory = () => {
    const nextCounts = { ...hisnCounts };
    filteredHisnList.forEach((item) => {
      delete nextCounts[item.id];
    });
    setHisnCounts(nextCounts);
    showToast('تم إعادة ضبط عدادات هذا القسم في حصن المسلم');
  };

  const handleCopyText = (text: string) => {
    navigator.clipboard.writeText(text);
    showToast('تم نسخ الذكر المبارك إلى الحافظة');
  };

  const handleDedicateHisnDhikr = (item: HisnDhikr) => {
    recordDedication('tasbeeh', `ذكر من حصن المسلم: ${item.title}`, 'all', 1, 'ذاكر مستغفر');
    showToast(`تم إهداء ثواب (${item.title}) لأرواحهم الطاهرة`);
  };

  const completedHisnCount = filteredHisnList.filter(
    (item) => getHisnRemaining(item.id, item.count) === 0
  ).length;

  const hisnProgressPercent = filteredHisnList.length > 0
    ? (completedHisnCount / filteredHisnList.length) * 100
    : 0;

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8 text-right select-none">
      
      {/* Toast Alert */}
      {toastMessage && (
        <div className="fixed top-20 left-1/2 -translate-x-1/2 z-50 px-4 py-2.5 rounded-2xl bg-stone-900/95 text-amber-200 text-xs font-semibold shadow-2xl backdrop-blur-md border border-amber-500/25 animate-in fade-in zoom-in-95 duration-150 flex items-center gap-2">
          <Sparkles className="w-4 h-4 text-amber-400" />
          <span>{toastMessage}</span>
        </div>
      )}

      {/* Main Header Banner */}
      <div className="relative p-6 sm:p-10 rounded-3xl border border-stone-200/90 dark:border-stone-800 bg-gradient-to-b from-white via-[#FCFBF8] to-stone-50/70 dark:from-stone-900 dark:via-stone-900/90 dark:to-stone-950 shadow-md overflow-hidden text-center">
        
        {/* Subtle geometric star watermark */}
        <div className="absolute inset-0 flex items-center justify-center opacity-[0.03] dark:opacity-[0.05] pointer-events-none">
          <Star8Rosette className="w-[500px] h-[500px] text-amber-900 dark:text-amber-200" />
        </div>

        <div className="relative z-10 max-w-3xl mx-auto space-y-3">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-amber-100/70 dark:bg-stone-800 text-amber-900 dark:text-amber-300 text-xs font-semibold">
            <Shield className="w-3.5 h-3.5 text-amber-800 dark:text-amber-400" />
            <span>«أَلا بِذِكْرِ اللَّهِ تَطْمَئِنُّ الْقُلُوبُ»</span>
          </div>

          <h1 className="font-amiri text-3xl sm:text-5xl font-bold text-stone-900 dark:text-stone-100 tracking-tight">
            الأذكار النبوية وحصن المسلم
          </h1>

          <p className="font-amiri text-base sm:text-lg text-stone-600 dark:text-stone-300 leading-relaxed max-w-2xl mx-auto">
            موسوعة جامعة للأذكار اليومية من كتاب <strong className="text-amber-900 dark:text-amber-400">«حصن المسلم من أذكار الكتاب والسنة»</strong> وأوراد الصباح والمساء والصلوات مع عدادات تفاعلية ميسرة.
          </p>

          {/* Section Switcher Tabs */}
          <div className="inline-flex items-center gap-1.5 p-1.5 rounded-2xl bg-stone-100/80 dark:bg-stone-800 border border-stone-200 dark:border-stone-700 mt-2">
            <button
              onClick={() => setMainView('hisn')}
              className={`flex items-center gap-2 px-5 py-2.5 rounded-xl text-xs sm:text-sm font-bold transition-all cursor-pointer ${
                mainView === 'hisn'
                  ? 'bg-amber-800 text-white shadow-md'
                  : 'text-stone-600 dark:text-stone-300 hover:text-stone-900 dark:hover:text-white'
              }`}
            >
              <ShieldCheck className="w-4 h-4 text-amber-300" />
              <span>موسوعة حصن المسلم</span>
              <span className="text-[10px] px-1.5 py-0.2 rounded-full bg-amber-400 text-stone-950 font-sans font-bold">
                شامل
              </span>
            </button>

            <button
              onClick={() => setMainView('daily')}
              className={`flex items-center gap-2 px-5 py-2.5 rounded-xl text-xs sm:text-sm font-bold transition-all cursor-pointer ${
                mainView === 'daily'
                  ? 'bg-amber-800 text-white shadow-md'
                  : 'text-stone-600 dark:text-stone-300 hover:text-stone-900 dark:hover:text-white'
              }`}
            >
              <Sun className="w-4 h-4 text-amber-500" />
              <span>أذكار اليوم والليلة (الصباح والمساء)</span>
            </button>
          </div>
        </div>

      </div>

      {/* ========================================================================= */}
      {/* SECTION 1: HISN AL-MUSLIM (حصن المسلم)                                     */}
      {/* ========================================================================= */}
      {mainView === 'hisn' && (
        <div className="space-y-6">
          
          {/* Search & Topic Filters */}
          <div className="p-4 sm:p-5 rounded-3xl bg-white dark:bg-stone-900 border border-stone-200/90 dark:border-stone-800 shadow-xs space-y-4">
            
            {/* Search Input */}
            <div className="relative">
              <Search className="w-4 h-4 text-stone-400 absolute right-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
              <input
                type="text"
                value={hisnSearch}
                onChange={(e) => setHisnSearch(e.target.value)}
                placeholder="ابحث في أدعية حصن المسلم: السفر، المطر، الوضوء، الكرب، المقابر، الطعام..."
                className="w-full pr-10 pl-4 py-2.5 text-xs sm:text-sm rounded-2xl bg-stone-50 dark:bg-stone-800 border border-stone-200/80 dark:border-stone-700 focus:outline-hidden focus:border-amber-700 text-stone-900 dark:text-stone-100"
              />
            </div>

            {/* Topic Chips */}
            <div className="flex items-center gap-1.5 overflow-x-auto pb-1 scrollbar-none">
              {HISN_CATEGORIES.map((cat) => (
                <button
                  key={cat}
                  onClick={() => setHisnCategory(cat)}
                  className={`px-3 py-1.5 rounded-xl text-xs font-semibold whitespace-nowrap transition-all cursor-pointer ${
                    hisnCategory === cat
                      ? 'bg-amber-800 text-white shadow-xs font-bold'
                      : 'bg-stone-100 dark:bg-stone-800 text-stone-600 dark:text-stone-400 hover:text-stone-900 dark:hover:text-stone-100 hover:bg-stone-200/70'
                  }`}
                >
                  {cat}
                </button>
              ))}
            </div>

          </div>

          {/* Progress Strip */}
          <div className="p-4 rounded-2xl bg-white dark:bg-stone-900 border border-stone-200/90 dark:border-stone-800 shadow-xs flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="text-xs font-medium text-stone-700 dark:text-stone-300">
                الأذكار المنجزة في هذا القسم: <strong className="text-amber-800 dark:text-amber-400 font-mono text-sm">{completedHisnCount}</strong> من {filteredHisnList.length}
              </div>
              <div className="w-24 sm:w-44 bg-stone-100 dark:bg-stone-800 h-2.5 rounded-full overflow-hidden">
                <div
                  className="bg-amber-700 h-full transition-all duration-300 rounded-full"
                  style={{ width: `${hisnProgressPercent}%` }}
                />
              </div>
            </div>

            <button
              onClick={handleResetHisnCategory}
              className="flex items-center gap-1 text-xs text-stone-500 hover:text-stone-800 dark:hover:text-stone-200 cursor-pointer"
            >
              <RotateCcw className="w-3.5 h-3.5" />
              <span>إعادة ضبط العدادات</span>
            </button>
          </div>

          {/* Empty State */}
          {filteredHisnList.length === 0 ? (
            <div className="py-16 text-center rounded-3xl bg-white dark:bg-stone-900 border border-stone-200 dark:border-stone-800 space-y-3">
              <Shield className="w-10 h-10 text-stone-300 dark:text-stone-600 mx-auto" />
              <div className="font-amiri text-lg font-bold text-stone-700 dark:text-stone-300">
                لا توجد نتائج مطابقة لبحثك
              </div>
              <p className="text-xs text-stone-500">
                جرب البحث بكلمة أخرى مثل: (المنزل، الوضوء، الاستيقاظ، الكرب، السفر).
              </p>
            </div>
          ) : (
            <div className="space-y-4">
              {filteredHisnList.map((item, index) => {
                const remaining = getHisnRemaining(item.id, item.count);
                const isDone = remaining === 0;

                return (
                  <div
                    key={item.id}
                    className={`p-5 sm:p-6 rounded-3xl border transition-all duration-200 text-right ${
                      isDone
                        ? 'bg-amber-50/60 dark:bg-amber-950/20 border-amber-300 dark:border-amber-700/50 shadow-xs'
                        : 'bg-white dark:bg-stone-900 border-stone-200/90 dark:border-stone-800 hover:border-amber-600/40 shadow-xs hover:shadow-md'
                    }`}
                  >
                    {/* Top Row: Category tag, Occasion badge, and Reference */}
                    <div className="flex items-center justify-between gap-2 mb-3 flex-wrap">
                      <div className="flex items-center gap-1.5">
                        <span className="text-[11px] px-2.5 py-0.5 rounded-lg bg-amber-50 dark:bg-stone-800 border border-amber-200/70 dark:border-stone-700 text-amber-900 dark:text-amber-300 font-semibold">
                          {item.category}
                        </span>
                        {item.occasion && (
                          <span className="text-[11px] px-2.5 py-0.5 rounded-lg bg-stone-100 dark:bg-stone-800 text-stone-600 dark:text-stone-400 font-medium">
                            {item.occasion}
                          </span>
                        )}
                      </div>

                      <span className="text-[11px] text-stone-400 font-mono">
                        {item.reference}
                      </span>
                    </div>

                    {/* Title */}
                    <h3 className="font-amiri text-xl sm:text-2xl font-bold text-stone-900 dark:text-stone-100 mb-3">
                      {item.title}
                    </h3>

                    {/* Arabic Dhikr Text */}
                    <div className="p-4 rounded-2xl bg-amber-50/30 dark:bg-stone-800/30 border border-amber-200/40 dark:border-stone-750 mb-4 selection:bg-amber-100">
                      <p className="font-amiri text-xl sm:text-2xl text-stone-900 dark:text-stone-100 leading-[2.3] select-text">
                        «{item.text}»
                      </p>
                    </div>

                    {/* Virtue Box if present */}
                    {item.virtue && (
                      <div className="p-3 rounded-xl bg-stone-50 dark:bg-stone-800/50 border border-stone-200/60 dark:border-stone-700 text-xs text-stone-600 dark:text-stone-300 mb-4 leading-relaxed font-amiri">
                        <strong className="text-amber-900 dark:text-amber-400 font-bold">الفضل النبوي:</strong> {item.virtue}
                      </div>
                    )}

                    {/* Card Footer Toolbar */}
                    <div className="pt-3 border-t border-stone-100 dark:border-stone-800 flex items-center justify-between gap-2 flex-wrap">
                      
                      {/* Secondary Actions (Copy & Dedicate) */}
                      <div className="flex items-center gap-1.5">
                        <button
                          type="button"
                          onClick={() => handleCopyText(item.text)}
                          className="flex items-center gap-1 px-2.5 py-1.5 rounded-xl text-stone-500 dark:text-stone-400 hover:text-stone-800 dark:hover:text-stone-200 hover:bg-stone-100 dark:hover:bg-stone-800 text-xs transition-colors cursor-pointer"
                          title="نسخ نص الذكر"
                        >
                          <Copy className="w-3.5 h-3.5" />
                          <span className="hidden sm:inline">نسخ</span>
                        </button>

                        <button
                          type="button"
                          onClick={() => handleDedicateHisnDhikr(item)}
                          className="flex items-center gap-1 px-2.5 py-1.5 rounded-xl bg-amber-50 dark:bg-stone-800 hover:bg-amber-100/70 text-amber-900 dark:text-amber-300 text-xs font-semibold transition-all cursor-pointer"
                          title="إهداء ثواب هذا الذكر للمتوفين"
                        >
                          <Heart className="w-3.5 h-3.5 text-amber-700 dark:text-amber-400" />
                          <span className="hidden sm:inline">إهداء ثوابه</span>
                        </button>
                      </div>

                      {/* Main Interactive Tap Counter */}
                      <button
                        type="button"
                        onClick={() => handleHisnTap(item.id, item.count)}
                        disabled={isDone}
                        className={`px-5 sm:px-6 py-2 rounded-xl font-bold transition-all flex items-center gap-2 cursor-pointer active:scale-95 ${
                          isDone
                            ? 'bg-emerald-100 dark:bg-emerald-950/60 text-emerald-800 dark:text-emerald-300 border border-emerald-300 dark:border-emerald-700/60 cursor-default'
                            : 'bg-amber-800 hover:bg-amber-900 text-white shadow-xs'
                        }`}
                      >
                        {isDone ? (
                          <>
                            <Check className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
                            <span className="text-xs">تم الإنجاز</span>
                          </>
                        ) : (
                          <>
                            <span className="text-xs">اضغط للعد</span>
                            <span className="w-6 h-6 rounded-full bg-white/20 flex items-center justify-center font-mono text-sm">
                              {remaining}
                            </span>
                          </>
                        )}
                      </button>

                    </div>

                  </div>
                );
              })}
            </div>
          )}

        </div>
      )}

      {/* ========================================================================= */}
      {/* SECTION 2: DAILY REGULAR ADHKAR (أذكار الصباح والمساء وما بعد الصلاة)      */}
      {/* ========================================================================= */}
      {mainView === 'daily' && (
        <div className="space-y-6">
          
          {/* Category Tabs */}
          <div className="flex flex-wrap items-center justify-center gap-2 p-2 rounded-3xl bg-white dark:bg-stone-900 border border-stone-200 dark:border-stone-800 shadow-xs max-w-3xl mx-auto">
            {ADHKAR_CATEGORIES.map((cat) => {
              const isActive = activeCategory === cat.id;
              return (
                <button
                  key={cat.id}
                  onClick={() => setActiveCategory(cat.id)}
                  className={`py-2 px-3 sm:px-4 rounded-xl text-xs font-semibold transition-all cursor-pointer text-center ${
                    isActive
                      ? 'bg-amber-800 text-white shadow-xs font-bold'
                      : 'text-stone-600 dark:text-stone-400 hover:text-stone-900 dark:hover:text-stone-100 hover:bg-stone-100 dark:hover:bg-stone-800'
                  }`}
                >
                  {cat.name}
                </button>
              );
            })}
          </div>

          {/* Progress & Reset Strip */}
          <div className="p-4 rounded-2xl bg-white dark:bg-stone-900 border border-stone-200 dark:border-stone-800 shadow-xs flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="text-xs font-medium text-stone-700 dark:text-stone-300">
                الإنجاز: <strong className="text-amber-800 dark:text-amber-400 font-mono text-sm">{completedDailyCount}</strong> من {currentDailyAdhkar.length}
              </div>
              <div className="w-24 sm:w-40 bg-stone-100 dark:bg-stone-800 h-2 rounded-full overflow-hidden">
                <div
                  className="bg-amber-700 h-full transition-all duration-300"
                  style={{ width: `${dailyProgressPercent}%` }}
                />
              </div>
            </div>

            <button
              onClick={handleResetDailyCategory}
              className="flex items-center gap-1 text-xs text-stone-500 hover:text-stone-800 dark:hover:text-stone-200 cursor-pointer"
            >
              <RotateCcw className="w-3.5 h-3.5" />
              <span>إعادة ضبط العدادات</span>
            </button>
          </div>

          {/* Complete Batch Dedication Card */}
          {completedDailyCount === currentDailyAdhkar.length && currentDailyAdhkar.length > 0 && (
            <div className="p-6 rounded-2xl bg-emerald-50 dark:bg-stone-900 border border-emerald-300 dark:border-emerald-700/60 text-emerald-950 dark:text-emerald-200 text-center space-y-3 animate-in fade-in duration-300">
              <CheckCircle className="w-10 h-10 text-emerald-600 dark:text-emerald-400 mx-auto" />
              <h3 className="font-amiri text-2xl font-bold">
                هنيئاً لكم إتمام هذه الأذكار المباركة!
              </h3>
              <p className="font-amiri text-sm max-w-md mx-auto text-emerald-800 dark:text-emerald-300">
                أهدِ ثواب هذا الورد الطيب لأرواح عمامك الأربعة: رمضان، الشهاوي، الشافعي، وأحمد رحمهم الله جميعاً.
              </p>
              <button
                onClick={() => {
                  recordDedication('tasbeeh', `إتمام أذكار ${activeCategory}`, 'all', currentDailyAdhkar.length * 3);
                  showToast('تم تسجيل إهداء الثواب، تقبل الله منكم');
                }}
                className="px-5 py-2.5 rounded-xl bg-emerald-700 hover:bg-emerald-800 text-white text-xs font-bold transition-all cursor-pointer inline-flex items-center gap-2"
              >
                <Heart className="w-3.5 h-3.5 fill-current" />
                <span>إهداء ثواب الورد الآن</span>
              </button>
            </div>
          )}

          {/* Daily Adhkar Cards List */}
          <div className="space-y-4">
            {currentDailyAdhkar.map((item, index) => {
              const remaining = getDailyRemaining(item.id, item.count);
              const isDone = remaining === 0;

              return (
                <div
                  key={item.id}
                  className={`p-6 rounded-2xl border transition-all text-right ${
                    isDone
                      ? 'bg-amber-50/50 dark:bg-amber-950/20 border-amber-300/80 dark:border-amber-700/50 shadow-2xs'
                      : 'bg-white dark:bg-stone-900 border-stone-200/90 dark:border-stone-800 hover:border-amber-600/40 shadow-xs'
                  }`}
                >
                  <div className="flex items-center justify-between mb-3">
                    <span className="text-xs font-semibold text-stone-400">
                      الذكر #{index + 1}
                    </span>
                    <span className="text-[11px] text-stone-500 font-mono">
                      {item.reference}
                    </span>
                  </div>

                  {/* Text */}
                  <p className="font-amiri text-xl sm:text-2xl text-stone-900 dark:text-stone-100 leading-[2.2] mb-4 selection:bg-amber-100">
                    {item.text}
                  </p>

                  {/* Virtue if present */}
                  {item.virtue && (
                    <div className="p-3 rounded-xl bg-[#FAF9F5] dark:bg-stone-800/50 border border-stone-100 dark:border-stone-700 text-xs text-stone-600 dark:text-stone-300 mb-5 leading-relaxed font-amiri">
                      <strong className="text-amber-900 dark:text-amber-400">الفضل:</strong> {item.virtue}
                    </div>
                  )}

                  {/* Counter interaction bar */}
                  <div className="pt-3 border-t border-stone-100 dark:border-stone-800 flex items-center justify-between">
                    <div className="text-xs text-stone-500">
                      التكرار المطلوب: <strong className="text-stone-800 dark:text-stone-200 font-mono">{item.count}</strong>
                    </div>

                    <button
                      onClick={() => handleDailyTap(item.id, item.count)}
                      disabled={isDone}
                      className={`px-6 py-2.5 rounded-xl font-bold transition-all flex items-center gap-2 cursor-pointer active:scale-95 ${
                        isDone
                          ? 'bg-emerald-100 dark:bg-emerald-950/60 text-emerald-800 dark:text-emerald-300 border border-emerald-300 dark:border-emerald-700/60 cursor-default'
                          : 'bg-amber-800 hover:bg-amber-900 text-white shadow-xs'
                      }`}
                    >
                      {isDone ? (
                        <>
                          <Check className="w-4 h-4 text-emerald-700 dark:text-emerald-400" />
                          <span className="text-xs">تم الإنجاز</span>
                        </>
                      ) : (
                        <>
                          <span className="text-xs">اضغط للعد</span>
                          <span className="w-6 h-6 rounded-full bg-white/20 flex items-center justify-center font-mono text-sm">
                            {remaining}
                          </span>
                        </>
                      )}
                    </button>
                  </div>

                </div>
              );
            })}
          </div>

        </div>
      )}

      <ArabesqueDivider />

    </div>
  );
};
