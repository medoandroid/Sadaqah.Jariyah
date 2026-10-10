import React, { useState, useMemo, useEffect } from 'react';
import {
  Flame,
  Search,
  Copy,
  Share2,
  Check,
  Plus,
  Heart,
  Sparkles,
  BookOpen,
  User,
  Settings,
  ChevronDown,
  Moon,
  Sun,
  ShieldCheck,
  Send
} from 'lucide-react';
import { DUAS_LIST } from '../data/duas';
import { HONORED_PERSONS } from '../data/persons';
import { DuaItem } from '../types';
import { recordDedication } from '../services/dedicationService';
import { userProfileService, UserProfile } from '../services/userProfileService';

interface DuasPageProps {
  onOpenDedication: () => void;
  onOpenProfile?: () => void;
}

export const DuasPage: React.FC<DuasPageProps> = ({ onOpenDedication, onOpenProfile }) => {
  const [profile, setProfile] = useState<UserProfile>(userProfileService.getProfile());
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [deceasedSubFilter, setDeceasedSubFilter] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [customDuas, setCustomDuas] = useState<DuaItem[]>(() => {
    try {
      const saved = localStorage.getItem('sadaqah_custom_duas');
      return saved ? JSON.parse(saved) : [];
    } catch (e) {
      return [];
    }
  });

  const [copiedId, setCopiedId] = useState<string | null>(null);
  const [prayedCountMap, setPrayedCountMap] = useState<Record<string, number>>(() => {
    try {
      const saved = localStorage.getItem('sadaqah_prayed_counts');
      return saved ? JSON.parse(saved) : {};
    } catch (e) {
      return {};
    }
  });
  const [toastMsg, setToastMsg] = useState<string | null>(null);

  // Add Dua Modal State
  const [showAddModal, setShowAddModal] = useState(false);
  const [newTitle, setNewTitle] = useState('');
  const [newArabic, setNewArabic] = useState('');
  const [newSource, setNewSource] = useState('');
  const [newCategory, setNewCategory] = useState<'deceased' | 'forgiveness' | 'parents' | 'distress'>('deceased');

  useEffect(() => {
    const unsubscribe = userProfileService.subscribe((p) => {
      setProfile(p);
    });
    return unsubscribe;
  }, []);

  const categories = [
    { id: 'all', label: 'جميع الأدعية' },
    { id: 'deceased', label: 'أدعية للمتوفين' },
    { id: 'forgiveness', label: 'الاستغفار والمغفرة' },
    ...(profile.closestRelative ? [{ id: 'closest', label: `لطرفك الأقرب (${profile.closestRelative})` }] : []),
    { id: 'parents', label: 'بر الوالدين' },
    { id: 'distress', label: 'تفريج الهم والكرب' },
    { id: 'comprehensive', label: 'جوامع الدعاء' },
    { id: 'mercy', label: 'الرحمة والسكينة' },
    { id: 'healing', label: 'الشفاء والرقية' },
    { id: 'family', label: 'صبر الأهل والسلوان' },
  ];

  const personalizedDuas = useMemo(() => {
    return userProfileService.getPersonalizedDuas(profile);
  }, [profile]);

  const allDuas = useMemo(() => {
    return [...DUAS_LIST, ...customDuas];
  }, [customDuas]);

  const filteredDuas = useMemo(() => {
    return allDuas.filter((d) => {
      let matchesCat = true;

      if (selectedCategory === 'all') {
        matchesCat = true;
      } else if (selectedCategory === 'closest') {
        // Handled in separate top section, or show deceased & parents
        matchesCat = d.category === 'deceased' || d.category === 'parents';
      } else if (selectedCategory === 'forgiveness') {
        matchesCat = d.category === 'forgiveness' || d.category === 'mercy';
      } else {
        matchesCat = d.category === selectedCategory;
      }

      // Deceased sub-filter
      if (selectedCategory === 'deceased' && deceasedSubFilter !== 'all') {
        if (deceasedSubFilter === 'parents') {
          matchesCat = matchesCat && (d.title.includes('والد') || d.title.includes('أب') || d.title.includes('أم'));
        } else if (deceasedSubFilter === 'grave') {
          matchesCat = matchesCat && (d.title.includes('قبر') || d.title.includes('تثبيت') || d.title.includes('زيارة'));
        } else if (deceasedSubFilter === 'friday') {
          matchesCat = matchesCat && (d.title.includes('جمعة') || d.title.includes('رمضان'));
        }
      }

      const q = searchQuery.trim().toLowerCase();
      const matchesSearch =
        !q ||
        d.title.toLowerCase().includes(q) ||
        d.arabic.toLowerCase().includes(q) ||
        d.categoryLabel.toLowerCase().includes(q) ||
        (d.source && d.source.toLowerCase().includes(q));

      return matchesCat && matchesSearch;
    });
  }, [allDuas, selectedCategory, deceasedSubFilter, searchQuery]);

  const showToast = (msg: string) => {
    setToastMsg(msg);
    setTimeout(() => setToastMsg(null), 2800);
  };

  const handleCopy = (dua: { title: string; arabic: string; source?: string }) => {
    const text = `${dua.title}\n\n«${dua.arabic}»\n\n[المصدر: ${dua.source || 'أدعية مأثورة'}]\n- صدقة جارية عن أرواح المغفور لهم بإذن الله`;
    navigator.clipboard.writeText(text);
    showToast('تم نسخ نص الدعاء بنجاح إلى الحافظة');
  };

  const handleShare = (dua: { title: string; arabic: string }) => {
    const shareText = `${dua.title}\n\n«${dua.arabic}»\n\n- صدقة جارية ودعاء مستمر`;
    if (navigator.share) {
      navigator.share({
        title: dua.title,
        text: shareText,
        url: window.location.href,
      }).catch(() => {});
    } else {
      navigator.clipboard.writeText(shareText);
      showToast('تم نسخ الدعاء للمشاركة');
    }
  };

  const handlePrayDua = (duaId: string, duaTitle: string) => {
    const current = prayedCountMap[duaId] || 0;
    const updated = {
      ...prayedCountMap,
      [duaId]: current + 1,
    };
    setPrayedCountMap(updated);
    try {
      localStorage.setItem('sadaqah_prayed_counts', JSON.stringify(updated));
    } catch (e) {}

    // Record to dedication service with visitor name
    recordDedication('dua', duaTitle, 'all', 1, profile.userName || 'فاعل خير');
    showToast('اللهم استجب وتقبل دعاءك وجعله نوراً ورحمةً واصلة لأرواحهم');
  };

  const handleDedicateToClosest = (duaTitle: string) => {
    const targetName = profile.closestRelative.trim() || 'طرفك الأقرب';
    const honorific = userProfileService.getHonorific(profile);
    const donor = profile.userName || 'فاعل خير';

    recordDedication(
      'dua',
      duaTitle,
      'custom_closest',
      1,
      donor,
      `${targetName} (${honorific})`
    );

    showToast(`تم إهداء ثواب (${duaTitle}) إلى ${targetName}، تقبل الله صالح عملك`);
  };

  const handleAddCustomDua = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newArabic.trim()) return;

    const newDua: DuaItem = {
      id: `custom-dua-${Date.now()}`,
      title: newTitle.trim() || 'دعاء مبارك',
      arabic: newArabic.trim(),
      source: newSource.trim() || 'دعاء مضاف ومحفوظ محلياً',
      category: newCategory,
      categoryLabel: newCategory === 'deceased' ? 'للمتوفين' : newCategory === 'forgiveness' ? 'الاستغفار' : 'دعاء مضاف',
      virtue: 'دعاء خالص ومحفوظ في جهازك',
    };

    const updated = [newDua, ...customDuas];
    setCustomDuas(updated);
    try {
      localStorage.setItem('sadaqah_custom_duas', JSON.stringify(updated));
    } catch (err) {}

    setShowAddModal(false);
    setNewTitle('');
    setNewArabic('');
    setNewSource('');
    showToast('تمت إضافة الدعاء الجديد وحفظه في جهازك بنجاح');
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-10 text-right" dir="rtl">
      
      {/* Toast */}
      {toastMsg && (
        <div className="fixed top-20 left-1/2 -translate-x-1/2 z-50 px-5 py-2.5 rounded-2xl bg-stone-900/95 text-amber-200 text-xs sm:text-sm font-semibold shadow-2xl border border-amber-500/40 backdrop-blur-md animate-in fade-in duration-200 text-center max-w-md">
          {toastMsg}
        </div>
      )}

      {/* Header Banner */}
      <div className="text-center max-w-3xl mx-auto space-y-3">
        <div className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full bg-amber-100/80 dark:bg-amber-950/60 border border-amber-300 dark:border-amber-700/60 text-amber-900 dark:text-amber-300 text-xs font-semibold">
          <Flame className="w-3.5 h-3.5 text-amber-700" />
          <span>مكتبة أدعية المتوفين والمغفرة والرحمة</span>
        </div>
        <h1 className="font-amiri text-3xl sm:text-5xl font-bold text-stone-900 dark:text-stone-100 tracking-tight">
          أدعية المتوفين والاستغفار المأثور
        </h1>
        <p className="font-amiri text-base sm:text-lg text-stone-600 dark:text-stone-300 leading-relaxed">
          خير ما يُهدى للميت في قبره الدعاء الصادق بالرحمة والمغفرة وسؤال الفردوس الأعلى، وصيغ الاستغفار التي تمحو الذنوب والخطايا.
        </p>
      </div>

      {/* SECTION 1: SMART PERSONALIZED DUA BANNER FOR CONNECTION OR CLOSEST RELATIVE */}
      {profile.hasConfigured || profile.closestRelative ? (
        <div className="p-6 sm:p-8 rounded-3xl bg-gradient-to-br from-amber-950 via-stone-900 to-amber-900 text-white shadow-2xl border border-amber-500/30 relative overflow-hidden">
          <div className="relative z-10 space-y-5">
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 pb-3 border-b border-white/10">
              <div className="flex items-center gap-2 text-amber-300 text-xs font-bold">
                <Heart className="w-4 h-4 fill-rose-500 text-rose-500" />
                <span>دعاء مخصص ومناسب لصلتك:</span>
                <span className="bg-amber-500/20 text-amber-200 px-2.5 py-0.5 rounded-full border border-amber-400/40 text-sm">
                  {profile.closestRelative
                    ? `${profile.closestRelative} (${userProfileService.getHonorific(profile)})`
                    : userProfileService.getConnectionBadge(profile)}
                </span>
              </div>

              {onOpenProfile && (
                <button
                  type="button"
                  onClick={onOpenProfile}
                  className="text-xs text-amber-200/80 hover:text-amber-100 flex items-center gap-1.5 cursor-pointer underline decoration-amber-400/60 hover:decoration-amber-300"
                >
                  <Settings className="w-3.5 h-3.5" />
                  <span>تعديل صلتك بهم</span>
                </button>
              )}
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {personalizedDuas.map((pDua, idx) => (
                <div
                  key={idx}
                  className="p-5 rounded-2xl bg-white/10 hover:bg-white/15 border border-white/15 backdrop-blur-xs flex flex-col justify-between space-y-4 transition-all"
                >
                  <div className="space-y-2">
                    <h3 className="font-amiri text-lg font-bold text-amber-200">
                      {pDua.title}
                    </h3>
                    <p className="font-amiri text-base sm:text-lg text-stone-100 leading-relaxed bg-black/20 p-3.5 rounded-xl border border-white/10">
                      «{pDua.arabic}»
                    </p>
                    <p className="text-xs text-amber-300/80 flex items-center gap-1">
                      <Sparkles className="w-3.5 h-3.5 shrink-0" />
                      <span>{pDua.virtue}</span>
                    </p>
                  </div>

                  <div className="flex items-center justify-between pt-2 border-t border-white/10">
                    <button
                      type="button"
                      onClick={() => {
                        if (profile.closestRelative) {
                          handleDedicateToClosest(pDua.title);
                        } else {
                          onOpenDedication();
                        }
                      }}
                      className="px-3.5 py-2 rounded-xl bg-amber-500 hover:bg-amber-400 text-stone-950 text-xs font-bold transition-all cursor-pointer flex items-center gap-1.5 active:scale-95 shadow-sm"
                    >
                      <Heart className="w-3.5 h-3.5 fill-stone-950" />
                      <span>
                        {profile.closestRelative
                          ? `أهدِ هذا الدعاء لـ (${profile.closestRelative})`
                          : 'أهدِ ثواب هذا الدعاء للأعمام الكرام'}
                      </span>
                    </button>

                    <div className="flex items-center gap-1 text-white/70">
                      <button
                        type="button"
                        onClick={() => handleCopy({ title: pDua.title, arabic: pDua.arabic })}
                        className="p-2 rounded-lg hover:text-white hover:bg-white/10 transition-colors cursor-pointer"
                        title="نسخ الدعاء"
                      >
                        <Copy className="w-4 h-4" />
                      </button>
                      <button
                        type="button"
                        onClick={() => handleShare({ title: pDua.title, arabic: pDua.arabic })}
                        className="p-2 rounded-lg hover:text-white hover:bg-white/10 transition-colors cursor-pointer"
                        title="مشاركة"
                      >
                        <Share2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      ) : (
        <div className="p-5 sm:p-6 rounded-3xl bg-gradient-to-r from-amber-50 to-orange-50 dark:from-stone-850 dark:to-stone-900 border border-amber-200 dark:border-amber-800/60 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 shadow-sm">
          <div className="space-y-1">
            <div className="flex items-center gap-2 text-xs font-bold text-amber-900 dark:text-amber-200">
              <User className="w-4 h-4 text-amber-700 dark:text-amber-400" />
              <span>ميزة التخصيص الذكي لطرفك الأقرب</span>
            </div>
            <p className="text-xs text-stone-600 dark:text-stone-300">
              خصص اسمك وطرفك الأقرب (والدك، والدتك، أو من تحب) لتظهر لك أدعية خاصة مصاغة له بالاسم ومحفوظة على جهازك فقط.
            </p>
          </div>
          {onOpenProfile && (
            <button
              type="button"
              onClick={onOpenProfile}
              className="px-4 py-2 rounded-xl bg-amber-800 hover:bg-amber-900 text-white text-xs font-bold shadow-xs transition-all cursor-pointer whitespace-nowrap active:scale-95"
            >
              تخصيص الهوية والطرف الأقرب الآن
            </button>
          )}
        </div>
      )}

      {/* SECTION 2: MEMORIAL DEDICATION TO THE FOUR UNCLE SOULS */}
      <div className="p-6 sm:p-8 rounded-3xl bg-gradient-to-br from-stone-900 via-stone-900 to-stone-950 text-white shadow-xl relative overflow-hidden border border-stone-800">
        <div className="max-w-3xl space-y-4">
          <div className="flex items-center gap-2 text-amber-300 text-xs font-semibold uppercase tracking-wider">
            <Sparkles className="w-4 h-4" />
            <span>دعاء جامع مخصص للأرواح الأربعة المباركة</span>
          </div>

          <h3 className="font-amiri text-2xl sm:text-3xl font-bold text-amber-100">
            اللهم ارحم رمضان، والشهاوي، والشافعي، واحمد رحمة واسعة
          </h3>

          <p className="font-amiri text-lg sm:text-xl text-stone-200 leading-relaxed bg-white/5 p-4 rounded-2xl border border-white/10">
            «اللهم آنس وحشتهم، ونوّر قبورهم، واغفر ذنوبهم، واجعل الفردوس الأعلى دارهم ومستقرهم، واجمعنا بهم في جنات النعيم إخواناً على سرر متقابلين».
          </p>

          <div className="flex flex-wrap items-center gap-3 pt-2">
            <button
              type="button"
              onClick={() => {
                recordDedication('dua', 'دعاء جامع مخصص للأرواح الأربعة', 'all', 1, profile.userName || 'فاعل خير');
                showToast('كتب الله أجركم، تم تسجيل الدعاء بنجاح');
              }}
              className="px-4 py-2.5 rounded-xl bg-amber-600 hover:bg-amber-500 text-stone-950 text-xs font-bold transition-all cursor-pointer flex items-center gap-1.5 active:scale-98 shadow-sm"
            >
              <Heart className="w-3.5 h-3.5 fill-stone-950" />
              <span>قل: آمين يا رب العالمين</span>
            </button>
            <button
              type="button"
              onClick={onOpenDedication}
              className="px-4 py-2.5 rounded-xl bg-white/10 hover:bg-white/20 text-white text-xs font-semibold border border-white/20 transition-all cursor-pointer"
            >
              إهداء عمل صالح باسمك
            </button>
          </div>
        </div>
      </div>

      {/* FILTER, SEARCH, AND SUB-FILTERS */}
      <div className="space-y-4">
        <div className="p-4 sm:p-5 rounded-3xl bg-white dark:bg-stone-900 border border-stone-200/90 dark:border-stone-800 shadow-xs space-y-4">
          
          {/* Main Category Tabs */}
          <div className="flex flex-wrap items-center gap-1.5">
            {categories.map((cat) => (
              <button
                key={cat.id}
                type="button"
                onClick={() => {
                  setSelectedCategory(cat.id);
                  setDeceasedSubFilter('all');
                }}
                className={`px-3 py-1.5 rounded-xl text-xs font-medium transition-all cursor-pointer ${
                  selectedCategory === cat.id
                    ? 'bg-amber-800 dark:bg-amber-700 text-white font-bold shadow-xs'
                    : 'bg-stone-100 dark:bg-stone-800 text-stone-600 dark:text-stone-300 hover:bg-stone-200 dark:hover:bg-stone-750'
                }`}
              >
                {cat.label}
              </button>
            ))}
          </div>

          {/* Sub-Filters specifically for Deceased Category */}
          {selectedCategory === 'deceased' && (
            <div className="flex flex-wrap items-center gap-2 pt-2 border-t border-stone-100 dark:border-stone-800 text-xs">
              <span className="text-stone-400 font-medium">تصنيف فرعي للأموات:</span>
              {[
                { id: 'all', label: 'جميع أدعية المتوفين' },
                { id: 'parents', label: 'للوالدين المتوفين' },
                { id: 'grave', label: 'تنوير القبر والتثبيت' },
                { id: 'friday', label: 'يوم الجمعة والمواسم' },
              ].map((sub) => (
                <button
                  key={sub.id}
                  type="button"
                  onClick={() => setDeceasedSubFilter(sub.id)}
                  className={`px-2.5 py-1 rounded-lg text-xs transition-colors cursor-pointer border ${
                    deceasedSubFilter === sub.id
                      ? 'bg-amber-50 dark:bg-amber-950/80 border-amber-300 text-amber-900 dark:text-amber-200 font-bold'
                      : 'border-transparent text-stone-500 hover:text-stone-800 dark:hover:text-stone-200 hover:bg-stone-50 dark:hover:bg-stone-800'
                  }`}
                >
                  {sub.label}
                </button>
              ))}
            </div>
          )}

          {/* Search Bar & Add Dua Button */}
          <div className="flex flex-col sm:flex-row items-center justify-between gap-3 pt-2 border-t border-stone-100 dark:border-stone-800">
            <div className="relative w-full sm:w-80">
              <Search className="w-4 h-4 absolute right-3 top-1/2 -translate-y-1/2 text-stone-400" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="ابحث في نص الدعاء أو العنوان أو الفضيلة..."
                className="w-full pr-9 pl-3 py-2 text-xs bg-stone-50 dark:bg-stone-800 border border-stone-200 dark:border-stone-700 rounded-xl focus:outline-hidden focus:border-amber-700 text-stone-900 dark:text-stone-100"
              />
            </div>

            <div className="flex items-center gap-2 w-full sm:w-auto justify-end">
              <button
                type="button"
                onClick={() => setShowAddModal(true)}
                className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-stone-800 dark:bg-stone-700 hover:bg-stone-900 dark:hover:bg-stone-600 text-white text-xs font-semibold shadow-xs transition-all cursor-pointer whitespace-nowrap active:scale-95"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>إضافة دعاء إلى مكتبتك</span>
              </button>
            </div>
          </div>

        </div>

        {/* DUAS CARDS GRID */}
        {filteredDuas.length === 0 ? (
          <div className="p-12 text-center rounded-3xl bg-white dark:bg-stone-900 border border-stone-200 dark:border-stone-800 space-y-3">
            <BookOpen className="w-10 h-10 text-stone-300 mx-auto" />
            <p className="text-sm font-semibold text-stone-600 dark:text-stone-400">
              لا توجد أدعية مطابقة لبحثك في هذا القسم
            </p>
            <button
              type="button"
              onClick={() => {
                setSearchQuery('');
                setSelectedCategory('all');
                setDeceasedSubFilter('all');
              }}
              className="text-xs text-amber-700 dark:text-amber-400 font-bold hover:underline cursor-pointer"
            >
              عرض جميع الأدعية
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            {filteredDuas.map((dua) => {
              const prayCount = prayedCountMap[dua.id] || 0;

              return (
                <div
                  key={dua.id}
                  className="p-6 rounded-3xl bg-white dark:bg-stone-900 border border-stone-200/90 dark:border-stone-800 hover:border-amber-500/50 shadow-xs hover:shadow-md transition-all flex flex-col justify-between text-right group"
                >
                  <div className="space-y-3.5">
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-semibold text-amber-800 dark:text-amber-300 bg-amber-50 dark:bg-amber-950/60 px-2.5 py-0.5 rounded-lg border border-amber-200/60 dark:border-amber-800/40">
                        {dua.categoryLabel}
                      </span>
                      <span className="text-[11px] text-stone-400 dark:text-stone-500 truncate max-w-[200px]">
                        {dua.source}
                      </span>
                    </div>

                    <h3 className="font-amiri text-xl font-bold text-stone-900 dark:text-stone-100 group-hover:text-amber-800 dark:group-hover:text-amber-300 transition-colors">
                      {dua.title}
                    </h3>

                    <p className="font-amiri text-lg text-stone-800 dark:text-stone-200 leading-[2.2] bg-stone-50/80 dark:bg-stone-850/80 p-4 rounded-2xl border border-stone-100 dark:border-stone-800">
                      «{dua.arabic}»
                    </p>

                    {dua.virtue && (
                      <div className="text-xs text-stone-500 dark:text-stone-400 flex items-start gap-1.5 leading-relaxed pt-1">
                        <span className="w-1.5 h-1.5 rounded-full bg-amber-600 shrink-0 mt-1.5" />
                        <span>{dua.virtue}</span>
                      </div>
                    )}
                  </div>

                  <div className="pt-4 mt-4 border-t border-stone-100 dark:border-stone-800 flex flex-wrap items-center justify-between gap-2">
                    
                    {/* Pray Button (اللهم استجب) */}
                    <div className="flex items-center gap-1.5">
                      <button
                        type="button"
                        onClick={() => handlePrayDua(dua.id, dua.title)}
                        className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-amber-50 dark:bg-amber-950/50 hover:bg-amber-100 text-amber-900 dark:text-amber-200 text-xs font-bold transition-all cursor-pointer active:scale-95 border border-amber-200/60 dark:border-amber-800/40"
                      >
                        <Heart className="w-3.5 h-3.5 fill-amber-700 text-amber-700 dark:fill-amber-400 dark:text-amber-400" />
                        <span>اللهم استجب</span>
                        {prayCount > 0 && (
                          <span className="bg-amber-200 dark:bg-amber-800 text-amber-950 dark:text-amber-100 px-1.5 py-0.2 rounded-full text-[10px]">
                            {prayCount}
                          </span>
                        )}
                      </button>

                      {/* Dedicate to Closest Button if configured */}
                      {profile.closestRelative && (
                        <button
                          type="button"
                          onClick={() => handleDedicateToClosest(dua.title)}
                          className="flex items-center gap-1 px-2.5 py-1.5 rounded-xl bg-stone-100 dark:bg-stone-800 hover:bg-stone-200 text-stone-700 dark:text-stone-300 text-xs font-medium transition-colors cursor-pointer"
                          title={`أهدِ هذا الدعاء لـ (${profile.closestRelative})`}
                        >
                          <Send className="w-3 h-3 text-rose-500" />
                          <span className="truncate max-w-[100px] sm:max-w-none">
                            إهداء لـ {profile.closestRelative}
                          </span>
                        </button>
                      )}
                    </div>

                    {/* Copy and Share */}
                    <div className="flex items-center gap-1 text-stone-400">
                      <button
                        type="button"
                        onClick={() => handleCopy(dua)}
                        className="p-1.5 rounded-lg hover:text-stone-800 dark:hover:text-stone-200 hover:bg-stone-100 dark:hover:bg-stone-800 transition-colors cursor-pointer"
                        title="نسخ الدعاء"
                      >
                        <Copy className="w-4 h-4" />
                      </button>
                      <button
                        type="button"
                        onClick={() => handleShare(dua)}
                        className="p-1.5 rounded-lg hover:text-stone-800 dark:hover:text-stone-200 hover:bg-stone-100 dark:hover:bg-stone-800 transition-colors cursor-pointer"
                        title="مشاركة"
                      >
                        <Share2 className="w-4 h-4" />
                      </button>
                    </div>

                  </div>
                </div>
              );
            })}
          </div>
        )}

      </div>

      {/* Add Custom Dua Modal */}
      {showAddModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-stone-900/70 backdrop-blur-xs animate-in fade-in duration-200">
          <div className="w-full max-w-md bg-white dark:bg-stone-900 rounded-3xl shadow-2xl p-6 text-right space-y-4 border border-stone-200 dark:border-stone-800">
            <h3 className="font-amiri text-2xl font-bold text-stone-900 dark:text-stone-100">
              إضافة دعاء جديد لمكتبتك
            </h3>
            <p className="text-xs text-stone-500 dark:text-stone-400">
              أضف دعاءً مأثوراً أو خالصاً من قلبك وسيتم حفظه محلياً في متصفحك.
            </p>

            <form onSubmit={handleAddCustomDua} className="space-y-3">
              <div>
                <label className="block text-xs font-semibold text-stone-700 dark:text-stone-300 mb-1">
                  عنوان الدعاء
                </label>
                <input
                  type="text"
                  value={newTitle}
                  onChange={(e) => setNewTitle(e.target.value)}
                  placeholder="مثلاً: دعاء للأحباب، دعاء سعة القبر"
                  required
                  className="w-full px-3.5 py-2 text-xs border border-stone-200 dark:border-stone-700 bg-white dark:bg-stone-800 rounded-xl focus:outline-hidden focus:border-amber-700 text-stone-900 dark:text-stone-100"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-stone-700 dark:text-stone-300 mb-1">
                  تصنيف الدعاء
                </label>
                <select
                  value={newCategory}
                  onChange={(e) => setNewCategory(e.target.value as any)}
                  className="w-full px-3 py-2 text-xs border border-stone-200 dark:border-stone-700 bg-white dark:bg-stone-800 rounded-xl text-stone-900 dark:text-stone-100 focus:outline-hidden"
                >
                  <option value="deceased">أدعية للمتوفين</option>
                  <option value="forgiveness">الاستغفار والمغفرة</option>
                  <option value="parents">بر الوالدين</option>
                  <option value="distress">تفريج الهم والكرب</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-stone-700 dark:text-stone-300 mb-1">
                  نص الدعاء المبارك *
                </label>
                <textarea
                  rows={4}
                  value={newArabic}
                  onChange={(e) => setNewArabic(e.target.value)}
                  placeholder="اكتب نص الدعاء هنا بخشوع وطمأنينة..."
                  required
                  className="w-full px-3.5 py-2.5 text-sm border border-stone-200 dark:border-stone-700 bg-white dark:bg-stone-800 rounded-xl focus:outline-hidden focus:border-amber-700 font-amiri text-stone-900 dark:text-stone-100"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-stone-700 dark:text-stone-300 mb-1">
                  المصدر (اختياري)
                </label>
                <input
                  type="text"
                  value={newSource}
                  onChange={(e) => setNewSource(e.target.value)}
                  placeholder="مثلاً: صحيح مسلم / مأثور"
                  className="w-full px-3.5 py-2 text-xs border border-stone-200 dark:border-stone-700 bg-white dark:bg-stone-800 rounded-xl focus:outline-hidden focus:border-amber-700 text-stone-900 dark:text-stone-100"
                />
              </div>

              <div className="flex items-center justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setShowAddModal(false)}
                  className="px-3 py-1.5 rounded-xl text-xs text-stone-500 hover:bg-stone-100 dark:hover:bg-stone-800 cursor-pointer"
                >
                  إلغاء
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 rounded-xl bg-amber-800 hover:bg-amber-900 text-white text-xs font-bold transition-colors cursor-pointer"
                >
                  حفظ الدعاء محلياً
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
};
