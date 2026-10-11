import React, { useState, useEffect, useMemo } from 'react';
import {
  BookOpen,
  Headphones,
  Flame,
  CircleDot,
  Users,
  Sparkles,
  Heart,
  ArrowLeft,
  Volume2,
  Calendar,
  Compass,
  Award,
  User,
  ShieldCheck,
  Clock,
  FileJson,
  Trophy,
  RotateCcw,
  Copy,
  Check,
  Search,
  Moon,
  Sun,
  CheckCircle2,
  Bookmark,
  Shuffle,
  Quote,
  MessageCircle
} from 'lucide-react';
import { HONORED_PERSONS, GENERAL_DEDICATION_DUA } from '../data/persons';
import { Star8Rosette, ArabesqueDivider, BismillahHeader } from '../components/IslamicDecoration';
import { getDedicationStats, recordDedication } from '../services/dedicationService';
import { useAudio } from '../context/AudioContext';
import { storageService } from '../services/storageService';
import { userProfileService, UserProfile, UNCLE_NAMES, TargetUncleId } from '../services/userProfileService';
import { playTasbeehBeadSound, playPeacefulChime } from '../utils/soundEffects';
import { calculatePrayerTimes, POPULAR_CITIES, PrayerTimesResult } from '../utils/prayerTimes';
import { dailyWirdService } from '../services/dailyWirdService';
import { TadabburStationCard } from '../components/TadabburStationCard';
import {
  EGYPTIAN_MOODS,
  EGYPTIAN_COMPANION_ENTRIES,
  getEgyptianEntryByMood,
  EgyptianMoodKey,
  EgyptianCompanionEntry,
} from '../data/egyptianCompanionData';

interface HomePageProps {
  setActiveTab: (tab: string) => void;
  onOpenDedication: () => void;
  onSelectPerson: (personId: string) => void;
  onSelectSurah: (surahNum: number) => void;
  onOpenProfile?: () => void;
  onOpenPrayerTimes?: () => void;
  onOpenBackup?: () => void;
  onOpenSearch?: () => void;
  onOpenEgyptianCompanion?: () => void;
}

export const HomePage: React.FC<HomePageProps> = ({
  setActiveTab,
  onOpenDedication,
  onSelectPerson,
  onSelectSurah,
  onOpenProfile,
  onOpenPrayerTimes,
  onOpenBackup,
  onOpenSearch,
  onOpenEgyptianCompanion,
}) => {
  const [profile, setProfile] = useState<UserProfile>(userProfileService.getProfile());

  useEffect(() => {
    return userProfileService.subscribe((updated) => {
      setProfile(updated);
    });
  }, []);

  const stats = getDedicationStats();
  const realTasbeehCount = storageService.getNumber('tasbeeh_total', 0);
  const totalTasbeehDisplay = Math.max(stats.totalTasbeehs, realTasbeehCount);
  const { playSurah } = useAudio();

  // Real-time Clock & Prayer Countdown
  const [nowDate, setNowDate] = useState(() => new Date());

  useEffect(() => {
    const timer = setInterval(() => setNowDate(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);

  const prayerResult: PrayerTimesResult = useMemo(() => {
    const selectedCityId = storageService.getString('prayer_selected_city', 'cairo');
    const customCoords = storageService.get<{ lat: number; lng: number } | null>('prayer_custom_coords', null);
    const methodId = storageService.getNumber('prayer_selected_method', 5);

    if (customCoords) {
      return calculatePrayerTimes(nowDate, customCoords.lat, customCoords.lng, -nowDate.getTimezoneOffset() / 60, methodId);
    }
    const city = POPULAR_CITIES.find((c) => c.id === selectedCityId) || POPULAR_CITIES[0];
    return calculatePrayerTimes(nowDate, city.latitude, city.longitude, city.timezone, methodId);
  }, [nowDate]);

  // Egyptian Companion Quick Widget State
  const [egyptianMood, setEgyptianMood] = useState<EgyptianMoodKey>('lazy_quran');
  const [egyptianEntry, setEgyptianEntry] = useState<EgyptianCompanionEntry>(() => getEgyptianEntryByMood('lazy_quran'));

  const handleSelectEgyptianMood = (mood: EgyptianMoodKey) => {
    playTasbeehBeadSound();
    setEgyptianMood(mood);
    setEgyptianEntry(getEgyptianEntryByMood(mood));
  };

  const handleNextEgyptianEntry = () => {
    playTasbeehBeadSound();
    setEgyptianEntry(getEgyptianEntryByMood(egyptianMood, egyptianEntry.id));
    showToast('تم استدعاء نصيحة طيبة جديدة 🌿');
  };

  // Daily Wird Tracker Checklist
  const todayKey = useMemo(() => {
    const now = new Date();
    return `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}-${String(now.getDate()).padStart(2, '0')}`;
  }, [nowDate]);

  const [dailyTasks, setDailyTasks] = useState(() => {
    return storageService.get<Record<string, boolean>>(`daily_wird_checklist_${todayKey}`, {
      quran: false,
      adhkar: false,
      tasbeeh: false,
      dua: false,
    });
  });

  const [wirdData, setWirdData] = useState(() => dailyWirdService.getWirdData());

  const toggleTask = (key: 'quran' | 'adhkar' | 'tasbeeh' | 'dua') => {
    playTasbeehBeadSound();
    const updated = { ...dailyTasks, [key]: !dailyTasks[key] };
    setDailyTasks(updated);
    storageService.set(`daily_wird_checklist_${todayKey}`, updated);

    const allDone = Object.values(updated).every(Boolean);
    if (allDone && !Object.values(dailyTasks).every(Boolean)) {
      playPeacefulChime();
      const res = dailyWirdService.addProgress(1);
      setWirdData(res.data);
      showToast('🎉 ما شاء الله! اكتمل وردك اليومي المبارك بالكامل، كتب الله أجرك ونور بصيرتك');
    } else {
      showToast(updated[key] ? 'تم إنجاز العمل المبارك بنجاح ✨' : 'تم إلغاء التحديد');
    }
  };

  const completedTasksCount = Object.values(dailyTasks).filter(Boolean).length;
  const tasksPercent = Math.round((completedTasksCount / 4) * 100);

  // Context-Aware Spiritual Recommendations
  const spiritualRecommendation = useMemo(() => {
    const day = nowDate.getDay(); // 0 is Sunday, 5 is Friday, 4 is Thursday
    const hour = nowDate.getHours();

    if (day === 5 || (day === 4 && hour >= 18)) {
      return {
        type: 'friday',
        title: 'يوم الجمعة المبارك',
        desc: 'نورٌ ما بين الجمعتين؛ سنّة قراءة سورة الكهف والاستكثار من الصلاة على النبي ﷺ.',
        actionText: 'قراءة سورة الكهف (سورة ١٨)',
        icon: Sparkles,
        onClick: () => {
          onSelectSurah(18);
          setActiveTab('quran');
        },
      };
    }

    if (hour >= 21 || hour < 4) {
      return {
        type: 'night',
        title: 'سنّة الليل وقبل النوم',
        desc: 'سورة الملك هي المانعة المنجية من عذاب القبر، احرص على تلاوتها قبل نومك.',
        actionText: 'قراءة سورة الملك (سورة ٦٧)',
        icon: Moon,
        onClick: () => {
          onSelectSurah(67);
          setActiveTab('quran');
        },
      };
    }

    if (hour >= 4 && hour < 12) {
      return {
        type: 'morning',
        title: 'بركة الصباح الباكر',
        desc: 'استفتح يومك بأذكار الصباح لتكون في حفظ الله ومعيته حتى تمسي.',
        actionText: 'فتح أذكار الصباح',
        icon: Sun,
        onClick: () => {
          setActiveTab('adhkar');
        },
      };
    }

    return {
      type: 'evening',
      title: 'حصن المساء واستجابة الدعاء',
      desc: 'قراءة أذكار المساء تحصين للنفس واستجلاب للسكينة وطمأنينة القلب.',
      actionText: 'فتح أذكار المساء',
      icon: Moon,
      onClick: () => {
        setActiveTab('adhkar');
      },
    };
  }, [nowDate, onSelectSurah, setActiveTab]);

  const [quickTasbeehCount, setQuickTasbeehCount] = useState<number>(() => {
    return storageService.getNumber('tasbeeh_total', 0);
  });
  const [toastMsg, setToastMsg] = useState<string | null>(null);

  const showToast = (msg: string) => {
    setToastMsg(msg);
    setTimeout(() => setToastMsg(null), 2500);
  };

  const handleQuickDhikr = (phrase: string) => {
    playTasbeehBeadSound();
    const next = quickTasbeehCount + 1;
    setQuickTasbeehCount(next);
    storageService.setNumber('tasbeeh_total', next);
    recordDedication('tasbeeh', phrase, 'all', 1, profile.userName || 'مسبح');
    showToast(`كتب الله أجرك: "${phrase}"`);
  };

  const handleInstantDedicateParty = () => {
    playTasbeehBeadSound();
    const uncleTitle = UNCLE_NAMES[profile.targetUncleId] || 'عمامنا الأربعة';
    const note = `إهداء ثواب وزيارة بنية (${userProfileService.getConnectionBadge(profile)}) لـ ${uncleTitle}`;
    recordDedication('dua', note, profile.targetUncleId, 1, profile.userName || 'زائر كريم');
    showToast(`تقبل الله إهداءك وثواب زيارتك لـ ${uncleTitle} 🤲`);
  };

  const handleQuickSwitchParty = (targetId: TargetUncleId) => {
    playTasbeehBeadSound();
    userProfileService.setQuickParty(targetId, profile.connectionType || 'friend', profile.kinshipTitle);
    showToast(`تم تحديد الطرف الأقرب: ${UNCLE_NAMES[targetId]}`);
  };

  const handleCopyPartyDua = () => {
    const prayer = userProfileService.getSmartTailoredPrayers(profile)[0];
    if (prayer) {
      navigator.clipboard.writeText(`"${prayer.arabic}"\n\n[إهداء صدقة جارية - صلة: ${userProfileService.getConnectionBadge(profile)}]`);
      showToast('تم نسخ دعاء صلتك لمشاركته أو حفظه');
    }
  };

  const portalCards = [
    {
      id: 'quran',
      title: 'القرآن الكريم كاملاً',
      subtitle: '١١٤ سورة مرتلة بالرسم العثماني برواية حفص عن عاصم، مع القراءة المتصلة والتفسير والاستماع.',
      icon: BookOpen,
      category: 'تلاوة وقراءة',
      actionText: 'بدء التلاوة المباركة',
      highlightColor: 'from-amber-600/10 to-amber-700/5',
    },
    {
      id: 'mushaf',
      title: 'المصحف الورقي المصور',
      subtitle: 'طبعة مجمع الملك فهد ٦٠٤ صفحة بدقة متناهية، وتقليب صفحات واقعي باللمس وتكبير مريح.',
      icon: BookOpen,
      category: 'طبعة المدينة المنورة',
      actionText: 'تصفح المصحف',
      highlightColor: 'from-amber-600/10 to-amber-700/5',
    },
    {
      id: 'recitations',
      title: 'التلاوات العطرة',
      subtitle: 'استماع متواصل وخاشع بأصوات كبار قراء العالم الإسلامي (العفاسي، الحصري، عبدالباسط، المعيقلي).',
      icon: Headphones,
      category: 'تلاوات صوتية',
      actionText: 'الاستماع الآن',
      highlightColor: 'from-amber-600/10 to-amber-700/5',
    },
    {
      id: 'tasbeeh',
      title: 'السبحة الإلكترونية المطورة',
      subtitle: 'سبحة تفاعلية واقعية مع عداد إجمالي فردي يبدأ من الصفر، وأصوات خرز واقعية واهتزاز لمسي.',
      icon: Sparkles,
      category: 'ذكر وتسبيح',
      actionText: 'بدء التسبيح',
      highlightColor: 'from-emerald-600/10 to-emerald-700/5',
    },
    {
      id: 'duas',
      title: 'مكتبة أدعية المتوفين',
      subtitle: 'أدعية نبوية ومأثورة للمغفرة ونور القبر والفسحة فيه، وجوامع الدعاء وتفريج الكروب.',
      icon: Flame,
      category: 'أدعية مأثورة',
      actionText: 'قراءة الأدعية',
      highlightColor: 'from-amber-600/10 to-amber-700/5',
    },
    {
      id: 'personalDua',
      title: 'أدعيتي ومناجاتي الخاصة',
      subtitle: 'اكتب أدعيتك الخاصة بقلب حاضر واحفظها محلياً لترديدها في أوقات الإجابة أو إهداء ثوابها.',
      icon: Heart,
      category: 'مناجاة شخصية',
      actionText: 'أدعيتي المحفوظة',
      highlightColor: 'from-amber-600/10 to-amber-700/5',
    },
    {
      id: 'adhkar',
      title: 'حصن المسلم والأذكار',
      subtitle: 'أذكار الصباح والمساء وأذكار الصلاة والنوم والاستيقاظ مع عدادات تفاعلية ميسرة.',
      icon: CircleDot,
      category: 'حصن المسلم',
      actionText: 'تصفح الأذكار',
      highlightColor: 'from-amber-600/10 to-amber-700/5',
    },
    {
      id: 'asma',
      title: 'أسماء الله الحسنى ومعانيها',
      subtitle: '٩٩ اسماً مباركاً مع المعاني والشرح الإيماني المستفيض وتدبر صفات الجلال والجمال.',
      icon: Compass,
      category: 'معرفة وتأمل',
      actionText: 'تدبر الأسماء',
      highlightColor: 'from-amber-600/10 to-amber-700/5',
    },
    {
      id: 'khatmah',
      title: 'الختمة القرآنية المهداة',
      subtitle: 'ختمة تشاركية مباركة (٣٠ جزءاً) لإهداء ثوابها كاملة لأرواح المتوفين الكرام.',
      icon: Award,
      category: 'ختمات تشاركية',
      actionText: 'المشاركة في الختمة',
      highlightColor: 'from-emerald-600/10 to-emerald-700/5',
    },
    {
      id: 'persons',
      title: 'عنهم (سيرتهم ووفاء لهم)',
      subtitle: 'صفحات تذكارية ودعاء خالص لعمامي الأربعة رحمهم الله، مع حفظ طيب ذكراهم.',
      icon: Users,
      category: 'تخليد ووفاء',
      actionText: 'سيرتهم والدعاء لهم',
      highlightColor: 'from-stone-600/10 to-stone-700/5',
    },
    {
      id: 'ruqyah',
      title: 'الرقية الشرعية الشاملة',
      subtitle: 'آيات وأدعية الشفاء والتحصين من القرآن الكريم وصحيح السنة المطهرة مع عدادات تكرار تفاعلية.',
      icon: ShieldCheck,
      category: 'شفاء وتحصين',
      actionText: 'قراءة الرقية الشرعية',
      highlightColor: 'from-emerald-600/10 to-emerald-700/5',
    },
    {
      id: 'hadith',
      title: 'الأربعون النووية كاملة',
      subtitle: 'جوامع الكلم النبوي مع التشكيل والشرح الميسر والفوائد المستفادة والاستماع الصوتي.',
      icon: BookOpen,
      category: 'السنة المطهرة',
      actionText: 'تصفح الأحاديث والفوائد',
      highlightColor: 'from-amber-600/10 to-amber-700/5',
    },
    {
      id: 'prayer',
      title: 'مواقيت الصلاة والقبلة',
      subtitle: 'حساب فلكي دقيق لمواقيت الصلاة اليومية مع عداد تنازلي وبوصلة مباشرة لاتجاه الكعبة المشرفة.',
      icon: Clock,
      category: 'شعائر وفلك',
      actionText: 'عرض المواقيت والقبلة',
      highlightColor: 'from-amber-600/10 to-amber-700/5',
    },
    {
      id: 'companion',
      title: 'خواطر وتذكير بالخير',
      subtitle: 'تذكير هادئ بالقرآن والورد، وكلمات طيبة تشرح الصدر وتعينك على طاعة الله ومواصلة الخير.',
      icon: Sparkles,
      category: 'خواطر وتذكرة',
      actionText: 'عرض الخواطر والتذكير',
      highlightColor: 'from-amber-600/10 to-amber-700/5',
    },
    {
      id: 'backup',
      title: 'النسخ الاحتياطي وحفظ البيانات',
      subtitle: 'تصدير نسخة احتياطية لبياناتك وعلاماتك وأدعيتك واسترجاعها بأمان على أي جهاز دون فقدان.',
      icon: FileJson,
      category: 'أمان وتخزين',
      actionText: 'إدارة النسخ الاحتياطي',
      highlightColor: 'from-emerald-600/10 to-emerald-700/5',
    },
  ];

  return (
    <div className="space-y-16 sm:space-y-24 pb-16">
      
      {/* Hero Section with Royal Islamic Arch Motif */}
      <section className="relative overflow-hidden pt-8 pb-14 sm:pt-16 sm:pb-24 border-b border-stone-200/80 dark:border-stone-800 bg-gradient-to-b from-[#F7F4EC] via-[#F8F6F0] to-[#FAF8F3] dark:from-stone-925 dark:via-stone-900 dark:to-stone-950">
        
        {/* Subtle geometric watermark */}
        <div className="absolute inset-0 opacity-[0.035] dark:opacity-[0.05] pointer-events-none flex items-center justify-center">
          <Star8Rosette className="w-[640px] h-[640px] text-amber-950 dark:text-amber-200" />
        </div>

        <div className="relative max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 text-center space-y-6">
          
          {/* Top Live Prayer Status & Universal Search & Egyptian Companion Trigger Pills */}
          <div className="flex flex-wrap items-center justify-center gap-2 sm:gap-3 text-xs">
            {prayerResult && (
              <button
                onClick={onOpenPrayerTimes}
                className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-amber-500/10 dark:bg-amber-950/40 border border-amber-500/25 text-amber-900 dark:text-amber-300 font-medium hover:bg-amber-500/15 transition-all cursor-pointer shadow-xs group"
                title="اضغط لعرض مواقيت الصلوات اليومية وبوصلة القبلة (نظام ١٢ ساعة)"
              >
                <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                <Clock className="w-3.5 h-3.5 text-amber-600 dark:text-amber-400" />
                <span>
                  الصلاة القادمة: <strong>{prayerResult.nextPrayer.arabicName} ({prayerResult.nextPrayer.time})</strong> (متبقي {prayerResult.nextPrayer.remainingFormatted})
                </span>
                <span className="text-[10px] text-stone-400 group-hover:text-amber-600">· المواقيت والقبلة ↗</span>
              </button>
            )}

            {onOpenEgyptianCompanion && (
              <button
                onClick={onOpenEgyptianCompanion}
                className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-full bg-stone-100 dark:bg-stone-850 hover:bg-amber-500/10 dark:hover:bg-amber-950/30 border border-stone-200 dark:border-stone-750 hover:border-amber-500/30 text-stone-800 dark:text-stone-200 font-medium transition-all cursor-pointer shadow-xs active:scale-95"
                title="خواطر وتذكير بالخير: كلمات تشرح الصدر وتشجعك على تلاوة القرآن"
              >
                <Sparkles className="w-3.5 h-3.5 text-amber-600 dark:text-amber-400" />
                <span>خواطر وتذكير بالخير</span>
              </button>
            )}

            {onOpenSearch && (
              <button
                onClick={onOpenSearch}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-white/80 dark:bg-stone-850 border border-stone-200 dark:border-stone-750 text-stone-700 dark:text-stone-300 hover:border-amber-400 hover:text-amber-900 dark:hover:text-amber-200 transition-all cursor-pointer shadow-xs"
              >
                <Search className="w-3.5 h-3.5 text-amber-600 dark:text-amber-400" />
                <span>بحث سريع</span>
                <kbd className="hidden sm:inline px-1.5 py-0.5 text-[10px] font-mono bg-stone-100 dark:bg-stone-800 rounded-sm text-stone-500">⌘K</kbd>
              </button>
            )}
          </div>

          <BismillahHeader className="mb-2" />

          {/* Main Title */}
          <div className="inline-block relative mb-2">
            <h1 className="font-amiri text-4xl sm:text-6xl lg:text-7xl font-bold text-stone-900 dark:text-stone-100 tracking-tight leading-[1.25]">
              صَدَقَةٌ جَارِيَة
            </h1>
            <div className="h-0.5 w-24 sm:w-36 bg-gradient-to-r from-transparent via-amber-700 to-transparent mx-auto mt-2" />
          </div>

          <p className="font-amiri text-lg sm:text-2xl text-stone-700 dark:text-stone-300 max-w-3xl mx-auto leading-relaxed mb-6">
            منصة إسلامية قرآنية جامعة، مهداة خالصاً لوجه الله تعالى من <span className="font-bold text-amber-900 dark:text-amber-400">محمد أيمن</span> عن أرواح عمامه الغاليين المغفور لهم بإذن الله:
          </p>

          {/* Context-Aware Time & Day Spiritual Recommendation Banner */}
          {spiritualRecommendation && (
            <div className="max-w-2xl mx-auto p-3.5 sm:p-4 rounded-2xl bg-gradient-to-r from-amber-500/10 via-amber-600/10 to-amber-500/10 border border-amber-500/30 dark:border-amber-500/20 shadow-xs flex items-center justify-between gap-3 text-right">
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 rounded-xl bg-amber-500/20 text-amber-800 dark:text-amber-300 flex items-center justify-center shrink-0">
                  <spiritualRecommendation.icon className="w-4 h-4" />
                </div>
                <div>
                  <div className="text-xs font-bold text-amber-900 dark:text-amber-300">
                    {spiritualRecommendation.title}
                  </div>
                  <div className="text-[11px] text-stone-600 dark:text-stone-300 leading-snug">
                    {spiritualRecommendation.desc}
                  </div>
                </div>
              </div>
              <button
                onClick={spiritualRecommendation.onClick}
                className="px-3 py-1.5 rounded-xl bg-amber-800 hover:bg-amber-900 text-white text-xs font-bold shrink-0 transition-colors cursor-pointer shadow-xs"
              >
                {spiritualRecommendation.actionText}
              </button>
            </div>
          )}

          {/* The Four Honored Names Card Strip */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3.5 mb-8 text-right">
            {HONORED_PERSONS.map((person, index) => (
              <div
                key={person.id}
                onClick={() => {
                  onSelectPerson(person.id);
                  setActiveTab('persons');
                }}
                className="group relative p-4 sm:p-5 rounded-2xl bg-white/90 dark:bg-stone-900/90 border border-stone-200/90 dark:border-stone-800 hover:border-amber-600/60 shadow-xs hover:shadow-md hover-lift transition-all duration-200 cursor-pointer text-center"
              >
                <div className="w-9 h-9 mx-auto mb-2 rounded-full bg-amber-50 dark:bg-amber-950/40 border border-amber-200/80 dark:border-amber-700/50 flex items-center justify-center text-amber-800 dark:text-amber-300 font-amiri font-bold text-sm group-hover:scale-105 transition-transform">
                  ٠{index + 1}
                </div>
                <h3 className="font-amiri text-lg sm:text-xl font-bold text-stone-900 dark:text-stone-100 group-hover:text-amber-900 dark:group-hover:text-amber-300 transition-colors">
                  {person.name}
                </h3>
                <div className="text-xs text-amber-800/90 dark:text-amber-400/90 font-medium mt-1">
                  {person.relationTitle}
                </div>
                <div className="text-[11px] text-stone-400 mt-2.5 flex items-center justify-center gap-1 group-hover:text-amber-800 dark:group-hover:text-amber-300 transition-colors">
                  <span>دعاء خاص وإهداء</span>
                  <ArrowLeft className="w-3 h-3 transition-transform group-hover:-translate-x-1" />
                </div>
              </div>
            ))}
          </div>

          {/* Main Hero Action Buttons */}
          <div className="flex flex-wrap items-center justify-center gap-3 sm:gap-4">
            <button
              onClick={() => setActiveTab('quran')}
              className="px-6 sm:px-7 py-3 rounded-2xl bg-amber-800 hover:bg-amber-900 text-white font-amiri text-lg font-bold shadow-md hover:shadow-lg transition-all cursor-pointer flex items-center gap-2 active:scale-98"
            >
              <BookOpen className="w-5 h-5 text-amber-300" />
              <span>القرآن الكريم والتلاوة</span>
            </button>

            <button
              onClick={() => setActiveTab('mushaf')}
              className="px-6 sm:px-7 py-3 rounded-2xl bg-white dark:bg-stone-900 hover:bg-amber-50 dark:hover:bg-stone-800 border border-amber-700/30 text-amber-950 dark:text-amber-200 font-amiri text-lg font-bold shadow-xs hover:shadow-md transition-all cursor-pointer flex items-center gap-2 active:scale-98"
            >
              <BookOpen className="w-5 h-5 text-amber-700 dark:text-amber-400" />
              <span>المصحف الورقي (٦٠٤ صفحة)</span>
            </button>

            <button
              onClick={onOpenDedication}
              className="px-6 sm:px-7 py-3 rounded-2xl bg-gradient-to-r from-amber-700 to-amber-850 hover:from-amber-600 hover:to-amber-800 text-white font-amiri text-lg font-bold shadow-md hover:shadow-amber-900/20 transition-all cursor-pointer flex items-center gap-2 active:scale-98"
            >
              <Sparkles className="w-5 h-5 text-amber-200" />
              <span>إهداء ثواب عمل صالح</span>
            </button>
          </div>

          {/* Interactive Daily Wird Card (ورد اليوم المبارك) */}
          <div className="max-w-3xl mx-auto p-5 sm:p-6 rounded-3xl bg-white/90 dark:bg-stone-900/90 border border-stone-200/90 dark:border-stone-800 shadow-sm text-right space-y-4">
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 border-b border-stone-100 dark:border-stone-800 pb-3">
              <div className="flex items-center gap-2.5">
                <div className="w-9 h-9 rounded-2xl bg-emerald-500/15 text-emerald-700 dark:text-emerald-400 flex items-center justify-center">
                  <CheckCircle2 className="w-5 h-5" />
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <h3 className="font-amiri text-lg font-bold text-stone-900 dark:text-stone-100">
                      ورد اليوم المبارك ومسار البركة
                    </h3>
                    {wirdData.streakDays > 0 && (
                      <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-amber-500/15 text-amber-800 dark:text-amber-300 text-[10px] font-bold">
                        <Flame className="w-3 h-3 text-amber-600 fill-amber-600" />
                        <span>سلسلة {wirdData.streakDays} يوم</span>
                      </span>
                    )}
                  </div>
                  <p className="text-xs text-stone-500 dark:text-stone-400">
                    أعمال يسيرة يومية تعمر أوقاتك بنور الذكر وإهداء الأجر للأرواح الغالية
                  </p>
                </div>
              </div>

              <div className="text-left shrink-0">
                <span className="text-[11px] text-stone-400 block font-mono">الإنجاز اليومي</span>
                <span className="font-mono text-base font-bold text-emerald-600 dark:text-emerald-400">
                  {completedTasksCount} من ٤ ({tasksPercent}%)
                </span>
              </div>
            </div>

            {/* Progress Bar */}
            <div className="w-full bg-stone-100 dark:bg-stone-800 h-2 rounded-full overflow-hidden">
              <div
                className="h-full bg-gradient-to-r from-amber-600 to-emerald-500 rounded-full transition-all duration-500"
                style={{ width: `${tasksPercent}%` }}
              />
            </div>

            {/* Checklist Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
              {[
                {
                  key: 'quran' as const,
                  title: 'تلاوة جزء أو صفحة من القرآن',
                  sub: 'تلاوة خاشعة من المصحف الشريف',
                  actionText: 'فتح المصحف',
                  onAction: () => setActiveTab('mushaf'),
                },
                {
                  key: 'adhkar' as const,
                  title: 'قراءة الأذكار اليومية (صباح / مساء)',
                  sub: 'حصن المسلم والتحصينات النبوية',
                  actionText: 'فتح الأذكار',
                  onAction: () => setActiveTab('adhkar'),
                },
                {
                  key: 'tasbeeh' as const,
                  title: '١٠٠ تسبيحة واستغفار بالسبحة',
                  sub: 'ذكر خفيف على اللسان ثقيل في الميزان',
                  actionText: 'فتح السبحة',
                  onAction: () => setActiveTab('tasbeeh'),
                },
                {
                  key: 'dua' as const,
                  title: 'دعاء وإهداء ثواب للأرواح الكريمة',
                  sub: 'إدخال السرور على المغفور لهم بإذن الله',
                  actionText: 'إهداء الثواب',
                  onAction: () => onOpenDedication(),
                },
              ].map((item) => {
                const isDone = dailyTasks[item.key];
                return (
                  <div
                    key={item.key}
                    onClick={() => toggleTask(item.key)}
                    className={`p-3 rounded-2xl border transition-all cursor-pointer flex items-center justify-between gap-3 text-right select-none ${
                      isDone
                        ? 'bg-emerald-500/10 dark:bg-emerald-950/30 border-emerald-500/40 text-emerald-950 dark:text-emerald-200'
                        : 'bg-stone-50 dark:bg-stone-800/60 border-stone-200 dark:border-stone-750 hover:border-amber-400'
                    }`}
                  >
                    <div className="flex items-center gap-2.5">
                      <div
                        className={`w-6 h-6 rounded-lg flex items-center justify-center shrink-0 transition-colors ${
                          isDone
                            ? 'bg-emerald-600 text-white shadow-xs'
                            : 'border-2 border-stone-300 dark:border-stone-600 bg-white dark:bg-stone-700'
                        }`}
                      >
                        {isDone && <Check className="w-3.5 h-3.5 stroke-[3]" />}
                      </div>
                      <div>
                        <div className={`text-xs font-bold leading-tight ${isDone ? 'line-through opacity-85' : 'text-stone-900 dark:text-stone-100'}`}>
                          {item.title}
                        </div>
                        <div className="text-[10px] text-stone-500 dark:text-stone-400 mt-0.5">
                          {item.sub}
                        </div>
                      </div>
                    </div>

                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        item.onAction();
                      }}
                      className="px-2 py-1 rounded-lg bg-stone-200/60 dark:bg-stone-700/60 hover:bg-amber-600 hover:text-white text-stone-700 dark:text-stone-300 text-[10px] font-bold shrink-0 transition-colors"
                    >
                      {item.actionText} ↗
                    </button>
                  </div>
                );
              })}
            </div>
          </div>

        </div>
      </section>

      {/* General Dedication Prayer Box */}
      <section className="max-w-4xl mx-auto px-4 sm:px-6">
        <div className="relative p-6 sm:p-8 rounded-3xl bg-amber-50/80 dark:bg-stone-900/90 border border-amber-200/90 dark:border-amber-700/40 shadow-xs text-center">
          <div className="flex items-center justify-center gap-2 text-amber-800 dark:text-amber-400 text-xs font-semibold mb-3">
            <Heart className="w-4 h-4 fill-amber-700 text-amber-700" />
            <span>دعاء افتتاح المنصة الواصل لأرواحهم الكريمة</span>
          </div>

          <p className="font-amiri text-lg sm:text-xl text-stone-800 dark:text-stone-200 leading-relaxed max-w-2xl mx-auto">
            {GENERAL_DEDICATION_DUA}
          </p>

          <div className="mt-4 pt-4 border-t border-amber-200/60 dark:border-stone-800 flex items-center justify-center gap-4 text-xs text-amber-900 dark:text-amber-300 font-medium">
            <span>آمين يا رب العالمين</span>
            <span aria-hidden="true">·</span>
            <button
              onClick={onOpenDedication}
              className="underline hover:text-amber-950 dark:hover:text-amber-200 cursor-pointer font-bold"
            >
              شارك بالدعاء أو إهداء ثواب تلاوة
            </button>
          </div>
        </div>
      </section>

      {/* Smart Kinship & Connection Identity Strip */}
      <section className="max-w-4xl mx-auto px-4 sm:px-6">
        <div className="p-5 sm:p-6 rounded-3xl bg-gradient-to-r from-amber-50/95 via-stone-50/80 to-amber-50/95 dark:from-stone-900 dark:via-stone-850 dark:to-stone-900 border border-amber-300/80 dark:border-amber-700/40 shadow-sm flex flex-col gap-4 text-right">
          
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
            <div className="flex items-center gap-3">
              <div className="w-11 h-11 rounded-2xl bg-amber-100 dark:bg-amber-950/70 border border-amber-300 dark:border-amber-700/60 flex items-center justify-center text-amber-800 dark:text-amber-300 shrink-0 shadow-xs">
                <Heart className="w-5 h-5 text-amber-700 dark:text-amber-400" />
              </div>
              <div>
                <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-amber-500/15 border border-amber-500/25 text-amber-900 dark:text-amber-300 text-[11px] font-bold mb-1">
                  <span>{userProfileService.getConnectionBadge(profile)}</span>
                </div>
                <h3 className="font-amiri text-base sm:text-lg font-bold text-stone-900 dark:text-stone-100 leading-snug">
                  {userProfileService.getGreetingText(profile)}
                </h3>
              </div>
            </div>

            {onOpenProfile && (
              <button
                onClick={onOpenProfile}
                className="self-end sm:self-auto px-4 py-2 rounded-xl bg-amber-800/10 dark:bg-amber-950/50 hover:bg-amber-800 hover:text-white text-amber-900 dark:text-amber-300 border border-amber-700/30 text-xs font-bold transition-all cursor-pointer flex items-center gap-1.5 shrink-0"
              >
                <Sparkles className="w-3.5 h-3.5" />
                <span>{profile.hasConfigured ? 'تخصيص كامل للصلة' : 'حدد صلتك بالأعمام 🌿'}</span>
              </button>
            )}
          </div>

          {/* Quick Party Switcher Pills */}
          <div className="pt-2 border-t border-amber-200/50 dark:border-stone-800/80">
            <span className="text-[11px] text-stone-500 dark:text-stone-400 block mb-1.5 font-medium">
              تحديد الطرف الأقرب بلمسة واحدة (صديق، قريب، أو محب):
            </span>
            <div className="flex flex-wrap gap-1.5">
              {[
                { id: 'ramadan-elshahawy' as TargetUncleId, label: 'العم رمضان' },
                { id: 'elshahawy-elshahawy' as TargetUncleId, label: 'العم الشهاوي' },
                { id: 'elshafei-elshahawy' as TargetUncleId, label: 'العم الشافعي' },
                { id: 'ahmed-elshahawy' as TargetUncleId, label: 'العم أحمد' },
                { id: 'all' as TargetUncleId, label: 'الأربعة معاً' },
              ].map((u) => {
                const isActive = profile.targetUncleId === u.id;
                return (
                  <button
                    key={u.id}
                    onClick={() => handleQuickSwitchParty(u.id)}
                    className={`text-xs px-2.5 py-1 rounded-xl border transition-all cursor-pointer font-medium ${
                      isActive
                        ? 'bg-amber-600 text-white border-amber-600 shadow-xs font-bold'
                        : 'bg-white/80 dark:bg-stone-800 border-amber-200/60 dark:border-stone-700 text-stone-700 dark:text-stone-300 hover:border-amber-400'
                    }`}
                  >
                    {u.label}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Quick Tailored Prayer Snippet */}
          <div className="p-3.5 sm:p-4 rounded-2xl bg-white/90 dark:bg-stone-950/70 border border-amber-200/70 dark:border-stone-800/80 space-y-2.5 text-right shadow-xs">
            <div className="flex flex-wrap items-center justify-between gap-2 border-b border-amber-100 dark:border-stone-800 pb-2">
              <span className="text-[11px] font-bold text-amber-800 dark:text-amber-400 flex items-center gap-1.5">
                <Sparkles className="w-3.5 h-3.5 text-amber-600" />
                <span>دعاء مخصص لصلتك بـ ({UNCLE_NAMES[profile.targetUncleId]}):</span>
              </span>
              <div className="flex items-center gap-2">
                <button
                  onClick={handleCopyPartyDua}
                  className="px-2.5 py-1 rounded-lg bg-stone-100 dark:bg-stone-800 hover:bg-stone-200 text-stone-700 dark:text-stone-300 text-xs font-medium cursor-pointer flex items-center gap-1"
                >
                  <Copy className="w-3 h-3" />
                  <span>نسخ</span>
                </button>
                <button
                  onClick={handleInstantDedicateParty}
                  className="px-3 py-1 rounded-lg bg-amber-700 hover:bg-amber-800 text-white text-xs font-bold cursor-pointer flex items-center gap-1 shadow-xs active:scale-95 transition-all"
                >
                  <Heart className="w-3 h-3 text-amber-200" />
                  <span>إهداء ثواب الزيارة الآن 🤲</span>
                </button>
              </div>
            </div>
            <p className="font-amiri text-sm sm:text-base text-stone-800 dark:text-stone-200 leading-relaxed text-justify">
              "{userProfileService.getSmartTailoredPrayers(profile)[0]?.arabic}"
            </p>
          </div>

        </div>
      </section>

      {/* Floating Toast Notification */}
      {toastMsg && (
        <div className="fixed top-20 left-1/2 -translate-x-1/2 z-50 bg-stone-900/95 dark:bg-stone-100/95 text-stone-100 dark:text-stone-900 px-5 py-2.5 rounded-2xl shadow-xl text-sm font-medium border border-amber-500/30 flex items-center gap-2 backdrop-blur-md animate-in fade-in duration-200">
          <Sparkles className="w-4 h-4 text-amber-400" />
          <span>{toastMsg}</span>
        </div>
      )}

      {/* Professional Tadabbur & Daily Quranic Station */}
      <section className="max-w-4xl mx-auto px-4 sm:px-6">
        <TadabburStationCard
          onSelectSurah={onSelectSurah}
          onOpenMushaf={() => setActiveTab('mushaf')}
          showToast={showToast}
        />
      </section>

      {/* Spiritual Reflections & Gentle Reminders Section */}
      <section className="max-w-4xl mx-auto px-4 sm:px-6">
        <div className="relative overflow-hidden rounded-3xl bg-stone-50/70 dark:bg-stone-900/60 border border-stone-200/90 dark:border-stone-800 shadow-sm p-5 sm:p-7 space-y-4 text-right">
          
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 border-b border-stone-200/60 dark:border-stone-800 pb-3">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-2xl bg-amber-500/10 border border-amber-500/20 text-amber-800 dark:text-amber-300 flex items-center justify-center shrink-0">
                <Sparkles className="w-5 h-5 text-amber-600 dark:text-amber-400" />
              </div>
              <div>
                <h3 className="font-amiri text-xl sm:text-2xl font-bold text-stone-900 dark:text-stone-100">
                  خواطر وتذكير بالخير
                </h3>
                <p className="text-xs text-stone-500 dark:text-stone-400">
                  تذكير هادئ بالقرآن والورد، وكلمات طيبة تشرح الصدر
                </p>
              </div>
            </div>

            <div className="flex items-center gap-2 shrink-0 self-end sm:self-auto">
              <button
                onClick={handleNextEgyptianEntry}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-white dark:bg-stone-800 hover:bg-stone-100 dark:hover:bg-stone-750 text-stone-700 dark:text-stone-300 border border-stone-200 dark:border-stone-700 text-xs font-semibold transition cursor-pointer active:scale-95 shadow-2xs"
              >
                <RotateCcw className="w-3.5 h-3.5 text-stone-500" />
                <span>خاطر آخر</span>
              </button>

              {onOpenEgyptianCompanion && (
                <button
                  onClick={onOpenEgyptianCompanion}
                  className="px-3.5 py-1.5 rounded-xl bg-amber-800 hover:bg-amber-900 text-white text-xs font-bold transition cursor-pointer shadow-xs active:scale-95"
                >
                  عرض الخواطر كاملة ↗
                </button>
              )}
            </div>
          </div>

          {/* Quick Mood Selector Buttons */}
          <div className="flex items-center gap-2 overflow-x-auto pb-1 scrollbar-none">
            {EGYPTIAN_MOODS.map((m) => {
              const isSelected = egyptianMood === m.key;
              return (
                <button
                  key={m.key}
                  onClick={() => handleSelectEgyptianMood(m.key)}
                  className={`px-3 py-1.5 rounded-xl text-xs font-medium whitespace-nowrap transition-all cursor-pointer flex items-center gap-1.5 active:scale-95 shrink-0 ${
                    isSelected
                      ? 'bg-amber-800 text-white shadow-xs font-bold'
                      : 'bg-white dark:bg-stone-800 border border-stone-200 dark:border-stone-750 text-stone-700 dark:text-stone-300 hover:border-amber-400/60'
                  }`}
                >
                  <span>{m.label}</span>
                </button>
              );
            })}
          </div>

          {/* Active Advice Snippet */}
          <div className="p-4 sm:p-5 rounded-2xl bg-white dark:bg-stone-900 border border-stone-200/80 dark:border-stone-800 shadow-2xs space-y-3">
            <div className="flex items-center justify-between gap-2">
              <span className="text-xs font-bold text-amber-800 dark:text-amber-400">
                {egyptianEntry.title}
              </span>
              <span className="text-[10px] px-2 py-0.5 rounded-md bg-stone-100 dark:bg-stone-800 text-stone-600 dark:text-stone-300 font-medium">
                {egyptianEntry.badge}
              </span>
            </div>

            <p className="font-sans text-sm sm:text-base text-stone-800 dark:text-stone-200 leading-relaxed">
              "{egyptianEntry.text}"
            </p>

            <div className="pt-2 flex flex-wrap items-center justify-between gap-2 border-t border-stone-100 dark:border-stone-800">
              <button
                onClick={() => {
                  playPeacefulChime();
                  if (egyptianEntry.actionType === 'quran' && egyptianEntry.targetSurahNumber) {
                    onSelectSurah(egyptianEntry.targetSurahNumber);
                    setActiveTab('quran');
                  } else if (egyptianEntry.actionType === 'mushaf') {
                    setActiveTab('mushaf');
                  } else if (egyptianEntry.actionType === 'tasbeeh') {
                    setActiveTab('tasbeeh');
                  } else if (egyptianEntry.actionType === 'dedications') {
                    setActiveTab('dedications');
                  } else if (egyptianEntry.actionType === 'duas') {
                    setActiveTab('duas');
                  } else if (egyptianEntry.actionType === 'adhkar') {
                    setActiveTab('adhkar');
                  } else {
                    setActiveTab(egyptianEntry.actionType);
                  }
                }}
                className="px-4 py-2 rounded-xl bg-amber-800 hover:bg-amber-900 text-white text-xs font-bold transition cursor-pointer flex items-center gap-1.5 shadow-2xs active:scale-95"
              >
                <BookOpen className="w-3.5 h-3.5 text-amber-200" />
                <span>{egyptianEntry.actionText}</span>
              </button>

              <button
                onClick={() => {
                  const text = `تذكير بالخير 🌿:\n\n"${egyptianEntry.text}"\n\n- صدقة جارية`;
                  navigator.clipboard.writeText(text);
                  showToast('تم نسخ النص لمشاركته');
                }}
                className="px-3 py-1.5 rounded-xl bg-stone-100 dark:bg-stone-800 hover:bg-stone-200 dark:hover:bg-stone-700 text-stone-700 dark:text-stone-300 text-xs font-medium transition cursor-pointer flex items-center gap-1"
              >
                <Copy className="w-3 h-3" />
                <span>نسخ النص</span>
              </button>
            </div>
          </div>

        </div>
      </section>

      {/* One-Tap Fast Dhikr Station */}
      <section className="max-w-4xl mx-auto px-4 sm:px-6">
        <div className="p-5 sm:p-6 rounded-3xl bg-white dark:bg-stone-900 border border-stone-200/90 dark:border-stone-800 shadow-sm space-y-4 text-right">
          
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-xl bg-emerald-500/15 flex items-center justify-center text-emerald-700 dark:text-emerald-400">
                <Sparkles className="w-4 h-4" />
              </div>
              <div>
                <h3 className="font-amiri text-lg font-bold text-stone-900 dark:text-stone-100">
                  محطة الذكر السريع بنقرة واحدة
                </h3>
                <p className="text-xs text-stone-500 dark:text-stone-400">
                  انقر على أي ذكر ليُسجل فوراً في عداد حسناتك مع صوت تسبيح مريح
                </p>
              </div>
            </div>

            <div className="text-left">
              <span className="text-[11px] text-stone-400 block font-mono">عدادك الحالي</span>
              <span className="font-mono text-lg font-bold text-emerald-700 dark:text-emerald-400">
                {quickTasbeehCount}
              </span>
            </div>
          </div>

          {/* Quick Click Badges */}
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-2.5">
            {[
              'سُبْحَانَ اللَّهِ وَبِحَمْدِهِ',
              'سُبْحَانَ اللَّهِ الْعَظِيمِ',
              'الْحَمْدُ لِلَّهِ رَبِّ الْعَالَمِينَ',
              'أَسْتَغْفِرُ اللَّهَ وَأَتُوبُ إِلَيْهِ',
              'اللَّهُمَّ صَلِّ عَلَى مُحَمَّدٍ',
              'لَا حَوْلَ وَلَا قُوَّةَ إِلَّا بِاللَّهِ'
            ].map((phrase, idx) => (
              <button
                key={idx}
                onClick={() => handleQuickDhikr(phrase)}
                className="p-3 rounded-2xl bg-stone-50 dark:bg-stone-800/70 hover:bg-emerald-50 dark:hover:bg-emerald-950/40 border border-stone-200 dark:border-stone-750 hover:border-emerald-500/40 text-stone-900 dark:text-stone-100 transition-all active:scale-95 cursor-pointer text-center group"
              >
                <span className="font-amiri text-sm font-bold group-hover:text-emerald-800 dark:group-hover:text-emerald-300 block leading-tight">
                  {phrase}
                </span>
                <span className="text-[10px] text-stone-400 mt-1 block">
                  +١ تسبيحة
                </span>
              </button>
            ))}
          </div>

          <div className="pt-2 border-t border-stone-100 dark:border-stone-800 flex items-center justify-between text-xs">
            <span className="text-stone-500 dark:text-stone-400">
              تريد سبحة تفاعلية كاملة مع أهداف وأصوات واهتزاز؟
            </span>
            <button
              onClick={() => setActiveTab('tasbeeh')}
              className="font-bold text-emerald-700 dark:text-emerald-400 hover:underline cursor-pointer flex items-center gap-1"
            >
              <span>فتح السبحة الإلكترونية المطورة</span>
              <ArrowLeft className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      </section>

      {/* Main Portals Grid (Anti-pill clean metadata discipline) */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        <div className="text-center max-w-2xl mx-auto mb-10">
          <h2 className="font-amiri text-3xl sm:text-4xl font-bold text-stone-900 dark:text-stone-100 mb-2">
            أبواب القرآن الكريم والذكر المبارك
          </h2>
          <p className="text-sm text-stone-600 dark:text-stone-400">
            أقسام متكاملة مصممة بعناية فائقة لتجربة إيمانية هادئة ومريحة
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5 sm:gap-6">
          {portalCards.map((card) => {
            const Icon = card.icon;
            return (
              <div
                key={card.id}
                onClick={() => {
                  if (card.id === 'prayer') {
                    onOpenPrayerTimes?.();
                  } else if (card.id === 'backup') {
                    onOpenBackup?.();
                  } else if (card.id === 'companion') {
                    onOpenEgyptianCompanion?.();
                  } else {
                    setActiveTab(card.id);
                    window.scrollTo({ top: 0, behavior: 'smooth' });
                  }
                }}
                className="group relative p-6 sm:p-7 rounded-3xl bg-white dark:bg-stone-900 border border-stone-200/90 dark:border-stone-800 hover:border-amber-600/50 shadow-xs hover:shadow-xl hover-lift transition-all duration-300 cursor-pointer flex flex-col justify-between"
              >
                <div>
                  <div className="flex items-center justify-between mb-4">
                    <div className="w-12 h-12 rounded-2xl bg-amber-50 dark:bg-stone-800 border border-amber-200/70 dark:border-stone-700 text-amber-800 dark:text-amber-400 flex items-center justify-center group-hover:scale-105 group-hover:bg-amber-100 dark:group-hover:bg-stone-750 transition-all">
                      <Icon className="w-6 h-6 stroke-[1.8]" />
                    </div>
                    {/* Clean unboxed metadata separator */}
                    <span className="text-xs text-stone-400 dark:text-stone-500 font-medium group-hover:text-amber-800 dark:group-hover:text-amber-400 transition-colors">
                      {card.category}
                    </span>
                  </div>

                  <h3 className="font-amiri text-2xl font-bold text-stone-900 dark:text-stone-100 group-hover:text-amber-900 dark:group-hover:text-amber-300 transition-colors mb-2">
                    {card.title}
                  </h3>

                  <p className="font-amiri text-sm text-stone-600 dark:text-stone-400 leading-relaxed mb-6">
                    {card.subtitle}
                  </p>
                </div>

                <div className="flex items-center justify-between pt-4 border-t border-stone-100 dark:border-stone-800 text-xs font-semibold text-amber-800 dark:text-amber-400 group-hover:text-amber-950 dark:group-hover:text-amber-200">
                  <span>{card.actionText}</span>
                  <ArrowLeft className="w-4 h-4 transition-transform group-hover:-translate-x-1" />
                </div>
              </div>
            );
          })}
        </div>

      </section>

      {/* Quick Recitation Spotlight (Surah Yaseen / Al-Mulk / Al-Kahf) */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="p-6 sm:p-10 rounded-3xl bg-[#1C1A17] border border-amber-900/40 text-stone-100 relative overflow-hidden shadow-2xl">
          <div className="relative z-10 grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
            
            <div className="lg:col-span-6 space-y-3 text-right">
              <span className="text-xs uppercase tracking-wider text-amber-400 font-medium">
                تلاوات خاشعة للأموات
              </span>
              <h3 className="font-amiri text-3xl sm:text-4xl font-bold text-white">
                استمع لسور يس، والملك، والواقعة
              </h3>
              <p className="font-amiri text-stone-300 text-sm leading-relaxed">
                استمع بخشوع لسور القرآن المباركة بصوت كبار القراء، وأهدِ ثواب الاستماع لفقداء العائلة الكريمة ليؤنس وحشتهم ونوراً في قبورهم.
              </p>
            </div>

            <div className="lg:col-span-6 grid grid-cols-1 sm:grid-cols-3 gap-3">
              {[
                { number: 36, name: 'يس', virtue: 'قلب القرآن ومغفرة للذنب' },
                { number: 67, name: 'الملك', virtue: 'المانعة من عذاب القبر' },
                { number: 56, name: 'الواقعة', virtue: 'سورة الرزق والنعيم' },
              ].map((s) => (
                <button
                  key={s.number}
                  onClick={() => playSurah(s.number)}
                  className="p-4 rounded-2xl bg-stone-900/90 hover:bg-amber-950/80 border border-stone-800 hover:border-amber-600/70 text-right transition-all cursor-pointer group"
                >
                  <div className="flex items-center justify-between mb-1.5">
                    <span className="font-amiri text-lg font-bold text-white group-hover:text-amber-300">
                      سورة {s.name}
                    </span>
                    <Volume2 className="w-4 h-4 text-amber-400 group-hover:scale-110 transition-transform" />
                  </div>
                  <div className="text-[11px] text-stone-400 leading-tight">
                    {s.virtue}
                  </div>
                </button>
              ))}
            </div>

          </div>
        </div>
      </section>

      {/* Real Impact & Personal Dedications Record (100% Real Numbers, starts at 0) */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="relative rounded-3xl border border-stone-200/90 dark:border-stone-800 bg-gradient-to-b from-white via-[#FCFBF8] to-stone-50/80 dark:from-stone-900 dark:via-stone-900/90 dark:to-stone-950 p-6 sm:p-10 shadow-lg overflow-hidden">
          
          {/* Subtle Islamic background accents */}
          <div className="absolute top-0 right-0 w-36 h-36 bg-[radial-gradient(#b45309_1.2px,transparent_1.2px)] [background-size:18px_18px] opacity-15 pointer-events-none" />
          <div className="absolute bottom-0 left-0 w-36 h-36 bg-[radial-gradient(#b45309_1.2px,transparent_1.2px)] [background-size:18px_18px] opacity-15 pointer-events-none" />

          <div className="text-center max-w-xl mx-auto mb-8 relative z-10">
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-amber-100/70 dark:bg-stone-800 text-amber-900 dark:text-amber-300 text-xs font-semibold mb-2">
              <Sparkles className="w-3.5 h-3.5 text-amber-700 dark:text-amber-400" />
              <span>إحصائياتك الحقيقية المسجلة</span>
            </div>
            <h3 className="font-amiri text-2xl sm:text-3xl font-bold text-stone-900 dark:text-stone-100 mb-1.5">
              سجل أعمالك الصالحة والتسابيح المهداة
            </h3>
            <p className="text-xs sm:text-sm text-stone-500 dark:text-stone-400">
              أرقام حقيقية دقيقة تبدأ من الصفر وتزداد مع كل تلاوة، تسبيحة، أو دعوة تهديها لأرواحهم الطاهرة.
            </p>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-4 gap-3 sm:gap-5 text-center relative z-10">
            <div className="p-4 sm:p-5 rounded-2xl bg-white/90 dark:bg-stone-850 border border-stone-200/70 dark:border-stone-750 shadow-xs hover:border-amber-400/40 transition-all">
              <div className="font-mono text-3xl sm:text-4xl font-bold text-amber-800 dark:text-amber-400 tabular-nums">
                {stats.totalSurahsRecited}
              </div>
              <div className="text-xs text-stone-600 dark:text-stone-300 font-semibold mt-1.5">
                سور مقروءة ومستمعة
              </div>
            </div>

            <div className="p-4 sm:p-5 rounded-2xl bg-white/90 dark:bg-stone-850 border border-stone-200/70 dark:border-stone-750 shadow-xs hover:border-amber-400/40 transition-all">
              <div className="font-mono text-3xl sm:text-4xl font-bold text-amber-800 dark:text-amber-400 tabular-nums">
                {totalTasbeehDisplay}
              </div>
              <div className="text-xs text-stone-600 dark:text-stone-300 font-semibold mt-1.5">
                تسبيحة واستغفار
              </div>
            </div>

            <div className="p-4 sm:p-5 rounded-2xl bg-white/90 dark:bg-stone-850 border border-stone-200/70 dark:border-stone-750 shadow-xs hover:border-amber-400/40 transition-all">
              <div className="font-mono text-3xl sm:text-4xl font-bold text-amber-800 dark:text-amber-400 tabular-nums">
                {stats.totalPrayers}
              </div>
              <div className="text-xs text-stone-600 dark:text-stone-300 font-semibold mt-1.5">
                دعوة خالصة بالرحمة
              </div>
            </div>

            <div className="p-4 sm:p-5 rounded-2xl bg-white/90 dark:bg-stone-850 border border-stone-200/70 dark:border-stone-750 shadow-xs hover:border-amber-400/40 transition-all">
              <div className="font-mono text-3xl sm:text-4xl font-bold text-amber-800 dark:text-amber-400 tabular-nums">
                {stats.totalKhatmahs}
              </div>
              <div className="text-xs text-stone-600 dark:text-stone-300 font-semibold mt-1.5">
                ختمة وأجزاء مهداة
              </div>
            </div>
          </div>
        </div>
      </section>

      <ArabesqueDivider />

    </div>
  );
};
