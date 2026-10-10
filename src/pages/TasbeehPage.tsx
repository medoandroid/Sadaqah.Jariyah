import React, { useState, useEffect, useMemo, useRef } from 'react';
import {
  RotateCcw,
  Sparkles,
  Heart,
  Volume2,
  VolumeX,
  Vibrate,
  Plus,
  X,
  Sliders,
  CircleDot,
  Fingerprint,
  Maximize2,
  Minimize2,
  Award,
  Trash2,
  CheckCircle2
} from 'lucide-react';
import { recordDedication } from '../services/dedicationService';
import { Star8Rosette } from '../components/IslamicDecoration';
import { storageService } from '../services/storageService';
import { CustomSelect } from '../components/CustomSelect';
import { userProfileService, UserProfile } from '../services/userProfileService';
import { sanitizeBoundedText } from '../utils/security';

interface DhikrMeta {
  text: string;
  target: number;
  virtue?: string;
  reference?: string;
}

const DEFAULT_DHIKRS: DhikrMeta[] = [
  {
    text: 'سُبْحَانَ اللَّهِ',
    target: 33,
    virtue: 'تغرس للمسبح نخلة في الجنة وتكفر الخطايا وإن كانت مثل زبد البحر',
    reference: 'صحيح مسلم والترمذي',
  },
  {
    text: 'الْحَمْدُ لِلَّهِ',
    target: 33,
    virtue: 'تملأ الميزان بالخير والبركة، وهي أحب الكلام إلى الله عز وجل',
    reference: 'صحيح مسلم',
  },
  {
    text: 'اللَّهُ أَكْبَرُ',
    target: 34,
    virtue: 'تملأ ما بين السماء والأرض عظمة وإيماناً وخيراً وبركة',
    reference: 'صحيح مسلم',
  },
  {
    text: 'لَا إِلَهَ إِلَّا اللَّهُ وَحْدَهُ لَا شَرِيكَ لَهُ',
    target: 100,
    virtue: 'أفضل ما قال النبي صلى الله عليه وسلم والنبيون من قبله، وتعدل عتق عشر رقاب',
    reference: 'متفق عليه',
  },
  {
    text: 'أَسْتَغْفِرُ اللَّهَ وَأَتُوبُ إِلَيْهِ',
    target: 100,
    virtue: 'تفتح أبواب الرزق والفرج وتطهر القلوب، من لزم الاستغفار جعل الله له من كل هم فرجاً',
    reference: 'أبو داود وأحمد',
  },
  {
    text: 'اللَّهُمَّ صَلِّ وَسَلِّمْ عَلَى نَبِيِّنَا مُحَمَّدٍ',
    target: 100,
    virtue: 'من صلى عليّ صلاة صلى الله عليه بها عشراً وحطت عنه عشر خطيئات ورفعت له عشر درجات',
    reference: 'صحيح النسائي وأحمد',
  },
  {
    text: 'لَا حَوْلَ وَلَا قُوَّةَ إِلَّا بِاللَّهِ الْعَلِيِّ الْعَظِيمِ',
    target: 100,
    virtue: 'كنز من كنوز الجنة ودواء لتسعة وتسعين داء أيسرها الهم',
    reference: 'متفق عليه',
  },
  {
    text: 'سُبْحَانَ اللَّهِ وَبِحَمْدِهِ سُبْحَانَ اللَّهِ الْعَظِيمِ',
    target: 100,
    virtue: 'كلمتان خفيفتان على اللسان، ثقيلتان في الميزان، حبيبتان إلى الرحمن',
    reference: 'صحيح البخاري ومسلم',
  },
];

export type SebhaTheme = 'amber' | 'emerald' | 'sandalwood' | 'pearl' | 'royal_gold' | 'night';
export type SebhaMode = 'beads' | 'ring';

export const TasbeehPage: React.FC = () => {
  // Custom Dhikr list
  const [dhikrList, setDhikrList] = useState<DhikrMeta[]>(() => {
    return storageService.get<DhikrMeta[]>('custom_dhikr_list', DEFAULT_DHIKRS);
  });

  // Selected Dhikr Index
  const [currentDhikrIndex, setCurrentDhikrIndex] = useState<number>(() => {
    return storageService.getNumber('tasbeeh_dhikr_idx', 0);
  });

  // Current session round count
  const [count, setCount] = useState<number>(() => {
    return storageService.getNumber('tasbeeh_count', 0);
  });

  // User's INDIVIDUAL Lifetime Total: MUST strictly START AT 0 for each user on first visit!
  const [totalLifetimeCount, setTotalLifetimeCount] = useState<number>(() => {
    try {
      const raw = localStorage.getItem('sadaqah_tasbeeh_total');
      if (raw === null || raw === undefined) return 0;
      const parsed = parseInt(raw, 10);
      // Clean up any historical fake numbers like 1580
      if (parsed === 1580 || parsed === 1420 || isNaN(parsed)) {
        localStorage.setItem('sadaqah_tasbeeh_total', '0');
        return 0;
      }
      return parsed;
    } catch (e) {
      return 0;
    }
  });

  // Today's Count with Date Reset Check
  const [todayCount, setTodayCount] = useState<number>(() => {
    const todayDate = new Date().toISOString().slice(0, 10);
    const savedDate = storageService.getString('tasbeeh_today_date', '');
    if (savedDate !== todayDate) {
      storageService.setString('tasbeeh_today_date', todayDate);
      storageService.setNumber('tasbeeh_today', 0);
      return 0;
    }
    return storageService.getNumber('tasbeeh_today', 0);
  });

  // Target count (33, 100, 1000, or 0 for unlimited)
  const [target, setTarget] = useState<number>(() => {
    return storageService.getNumber('tasbeeh_target', 33);
  });

  // Theme & Mode settings
  const [sebhaTheme, setSebhaTheme] = useState<SebhaTheme>(() => {
    return storageService.getString('tasbeeh_theme', 'amber') as SebhaTheme;
  });

  const [sebhaMode, setSebhaMode] = useState<SebhaMode>(() => {
    return storageService.getString('tasbeeh_mode', 'beads') as SebhaMode;
  });

  const [soundEnabled, setSoundEnabled] = useState<boolean>(() => {
    return storageService.get<boolean>('tasbeeh_sound', true);
  });

  const [vibrateEnabled, setVibrateEnabled] = useState<boolean>(() => {
    return storageService.get<boolean>('tasbeeh_vibrate', true);
  });

  const [fullScreenTap, setFullScreenTap] = useState<boolean>(() => {
    return storageService.get<boolean>('tasbeeh_fullscreen', false);
  });

  const [toastMsg, setToastMsg] = useState<string | null>(null);
  const [isPressing, setIsPressing] = useState<boolean>(false);
  const [beadSlideOffset, setBeadSlideOffset] = useState<number>(0);
  const [showResetConfirm, setShowResetConfirm] = useState<boolean>(false);
  const [justCompletedTarget, setJustCompletedTarget] = useState<boolean>(false);

  // Custom Dhikr Modal
  const [showAddModal, setShowAddModal] = useState<boolean>(false);
  const [customText, setCustomText] = useState<string>('');
  const [customTarget, setCustomTarget] = useState<number>(33);
  const [customVirtue, setCustomVirtue] = useState<string>('');

  // User Profile & Dedication Target State
  const [profile, setProfile] = useState<UserProfile>(userProfileService.getProfile());
  const [showDedicateChoice, setShowDedicateChoice] = useState<boolean>(false);

  useEffect(() => {
    const unsub = userProfileService.subscribe((p) => {
      setProfile(p);
    });
    return unsub;
  }, []);

  // Persist state across browser reloads
  useEffect(() => {
    storageService.setNumber('tasbeeh_count', count);
    storageService.setNumber('tasbeeh_total', totalLifetimeCount);
    storageService.setNumber('tasbeeh_today', todayCount);
    storageService.setNumber('tasbeeh_dhikr_idx', currentDhikrIndex);
    storageService.setNumber('tasbeeh_target', target);
    storageService.setString('tasbeeh_theme', sebhaTheme);
    storageService.setString('tasbeeh_mode', sebhaMode);
    storageService.set('tasbeeh_sound', soundEnabled);
    storageService.set('tasbeeh_vibrate', vibrateEnabled);
    storageService.set('tasbeeh_fullscreen', fullScreenTap);
    storageService.setString('tasbeeh_initialized', 'true');
  }, [
    count,
    totalLifetimeCount,
    todayCount,
    currentDhikrIndex,
    target,
    sebhaTheme,
    sebhaMode,
    soundEnabled,
    vibrateEnabled,
    fullScreenTap,
  ]);

  const showToast = (msg: string) => {
    setToastMsg(msg);
    setTimeout(() => setToastMsg(null), 2500);
  };

  // Keyboard Spacebar / Enter Listener for Rapid Effortless Tasbeeh on Desktop
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (['INPUT', 'TEXTAREA'].includes((e.target as HTMLElement)?.tagName)) return;
      if (e.code === 'Space' || e.key === 'Enter') {
        e.preventDefault();
        handleIncrement();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  });

  // Realistic Acoustic Wooden Bead / Gem Click Synthesis via Web Audio API
  const playBeadClickSound = () => {
    if (!soundEnabled) return;
    try {
      const AudioCtx = window.AudioContext || (window as any).webkitAudioContext;
      if (!AudioCtx) return;
      const ctx = new AudioCtx();
      
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      
      osc.type = 'triangle';
      const baseFreq =
        sebhaTheme === 'sandalwood'
          ? 380
          : sebhaTheme === 'pearl'
          ? 720
          : sebhaTheme === 'emerald'
          ? 520
          : sebhaTheme === 'royal_gold'
          ? 640
          : 460;

      osc.frequency.setValueAtTime(baseFreq, ctx.currentTime);
      osc.frequency.exponentialRampToValueAtTime(120, ctx.currentTime + 0.05);

      gain.gain.setValueAtTime(0.08, ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.06);

      osc.connect(gain);
      gain.connect(ctx.destination);

      osc.start();
      osc.stop(ctx.currentTime + 0.06);
    } catch (e) {}
  };

  const handleIncrement = () => {
    const nextCount = count + 1;
    setCount(nextCount);
    setTotalLifetimeCount((prev) => prev + 1);
    setTodayCount((prev) => prev + 1);

    setIsPressing(true);
    setBeadSlideOffset((prev) => (prev + 1) % 33);
    setTimeout(() => setIsPressing(false), 110);

    // Haptic feedback
    if (vibrateEnabled && typeof window !== 'undefined' && 'vibrate' in navigator) {
      navigator.vibrate(22);
    }

    playBeadClickSound();

    // Reached target celebration
    if (target > 0 && nextCount === target) {
      if (vibrateEnabled && typeof window !== 'undefined' && 'vibrate' in navigator) {
        navigator.vibrate([40, 60, 80]);
      }
      setJustCompletedTarget(true);
      setTimeout(() => setJustCompletedTarget(false), 2200);
      showToast(`أتممت الهدف المبارك (${target}) تسبيحة، تقبل الله منك ورزقك الثواب المضاعف!`);
    }
  };

  const handleResetCurrentRound = () => {
    setCount(0);
    showToast('تمت إعادة ضبط عداد الجلسة الحالية إلى الصفر');
  };

  const handleResetTotalLifetime = () => {
    setTotalLifetimeCount(0);
    setTodayCount(0);
    setCount(0);
    setShowResetConfirm(false);
    showToast('تم تصفير المجموع الإجمالي بنجاح');
  };

  const handleDedicateCount = (targetChoice?: 'all' | 'closest') => {
    if (count <= 0) {
      showToast('قم بالتسبيح أولاً لإهداء ثوابه');
      return;
    }

    if (!targetChoice && profile.closestRelative) {
      setShowDedicateChoice(true);
      return;
    }

    const currentDhikr = dhikrList[currentDhikrIndex] || DEFAULT_DHIKRS[0];
    const isClosest = targetChoice === 'closest';
    const targetPersonId = isClosest ? 'custom_closest' : 'all';
    const recipientName = isClosest
      ? `${profile.closestRelative} (${userProfileService.getHonorific(profile)})`
      : undefined;
    const donor = profile.userName || 'مسبح كريم';

    recordDedication(
      'tasbeeh',
      `${count} تسبيحة (${currentDhikr.text})`,
      targetPersonId,
      count,
      donor,
      recipientName
    );

    setShowDedicateChoice(false);
    if (isClosest) {
      showToast(`تم إهداء ثواب ${count} تسبيحة إلى ${profile.closestRelative}، تقبل الله منك!`);
    } else {
      showToast(`تم إهداء ثواب ${count} تسبيحة لأرواحهم الطاهرة، تقبل الله منكم`);
    }
    setCount(0);
  };

  const handleAddCustomDhikr = (e: React.FormEvent) => {
    e.preventDefault();
    const cleanText = sanitizeBoundedText(customText, 150);
    if (!cleanText) return;

    const newDhikr: DhikrMeta = {
      text: cleanText,
      target: customTarget > 0 ? customTarget : 33,
      virtue: sanitizeBoundedText(customVirtue, 300) || 'ذكر مبارك صدقة جارية',
      reference: 'ذكر مأثور',
    };

    const updated = [...dhikrList, newDhikr];
    setDhikrList(updated);
    storageService.set('custom_dhikr_list', updated);

    setCurrentDhikrIndex(updated.length - 1);
    setTarget(newDhikr.target);
    setCount(0);
    setShowAddModal(false);
    setCustomText('');
    setCustomVirtue('');
    showToast('تمت إضافة الذكر الجديد بنجاح');
  };

  const currentDhikr = dhikrList[currentDhikrIndex] || DEFAULT_DHIKRS[0];
  const progressPercent = target > 0 ? Math.min(100, (count / target) * 100) : 100;
  const currentBeadInRound = target > 0 ? count % target : count % 33;

  // Theme Palette Configurations
  const getThemeConfig = () => {
    switch (sebhaTheme) {
      case 'emerald':
        return {
          beadActive: 'from-emerald-400 via-emerald-600 to-emerald-800 shadow-emerald-500/40 text-emerald-100',
          beadNormal: 'from-emerald-700 via-emerald-800 to-emerald-950 text-emerald-200',
          ringAccent: '#10B981',
          bgHighlight: 'bg-emerald-50/80 border-emerald-200',
          badgeText: 'text-emerald-900 bg-emerald-100',
          buttonGlow: 'bg-emerald-700 hover:bg-emerald-800 text-white shadow-emerald-700/30',
        };
      case 'royal_gold':
        return {
          beadActive: 'from-amber-300 via-amber-500 to-amber-700 shadow-amber-500/50 text-amber-950',
          beadNormal: 'from-amber-600 via-amber-700 to-amber-900 text-amber-100',
          ringAccent: '#D97706',
          bgHighlight: 'bg-amber-50/90 border-amber-300',
          badgeText: 'text-amber-950 bg-amber-200',
          buttonGlow: 'bg-gradient-to-r from-amber-600 to-amber-700 text-white shadow-amber-600/40',
        };
      case 'sandalwood':
        return {
          beadActive: 'from-amber-600 via-stone-700 to-stone-900 shadow-stone-600/40 text-amber-200',
          beadNormal: 'from-stone-600 via-stone-800 to-stone-950 text-stone-300',
          ringAccent: '#78350F',
          bgHighlight: 'bg-stone-100 border-stone-300',
          badgeText: 'text-stone-900 bg-stone-200',
          buttonGlow: 'bg-stone-800 hover:bg-stone-900 text-amber-200 shadow-stone-800/30',
        };
      case 'pearl':
        return {
          beadActive: 'from-white via-slate-100 to-amber-200 shadow-amber-300/50 text-stone-900',
          beadNormal: 'from-slate-200 via-slate-300 to-slate-400 text-stone-700',
          ringAccent: '#B45309',
          bgHighlight: 'bg-slate-50 border-slate-200',
          badgeText: 'text-slate-900 bg-slate-200',
          buttonGlow: 'bg-slate-800 hover:bg-slate-900 text-white shadow-slate-700/30',
        };
      case 'night':
        return {
          beadActive: 'from-amber-400 via-amber-600 to-amber-700 shadow-amber-400/30 text-stone-900',
          beadNormal: 'from-stone-800 via-stone-900 to-black text-amber-300',
          ringAccent: '#F59E0B',
          bgHighlight: 'bg-stone-900 border-stone-800 text-stone-100',
          badgeText: 'text-amber-300 bg-stone-800',
          buttonGlow: 'bg-amber-600 hover:bg-amber-700 text-stone-950 font-bold shadow-amber-500/20',
        };
      case 'amber':
      default:
        return {
          beadActive: 'from-amber-400 via-amber-600 to-amber-800 shadow-amber-500/50 text-amber-100',
          beadNormal: 'from-amber-700 via-amber-800 to-amber-950 text-amber-200',
          ringAccent: '#F59E0B',
          bgHighlight: 'bg-amber-50/80 border-amber-200',
          badgeText: 'text-amber-900 bg-amber-100',
          buttonGlow: 'bg-amber-700 hover:bg-amber-800 text-white shadow-amber-700/30',
        };
    }
  };

  const themeConfig = getThemeConfig();

  return (
    <div
      onClick={() => {
        if (fullScreenTap) {
          handleIncrement();
        }
      }}
      className={`max-w-3xl mx-auto px-4 py-6 sm:py-8 space-y-6 text-center select-none ${
        fullScreenTap ? 'cursor-pointer min-h-[85vh]' : ''
      }`}
    >
      {/* Toast Alert */}
      {toastMsg && (
        <div className="fixed top-20 left-1/2 -translate-x-1/2 z-50 px-4 py-2.5 rounded-2xl bg-stone-900/95 text-amber-200 text-xs font-semibold shadow-2xl backdrop-blur-md border border-amber-500/20 animate-in fade-in zoom-in-95 duration-150">
          {toastMsg}
        </div>
      )}

      {/* Header */}
      <div className="space-y-2">
        <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-amber-100/70 dark:bg-stone-800 text-amber-900 dark:text-amber-300 text-xs font-semibold">
          <Sparkles className="w-3.5 h-3.5 text-amber-800 dark:text-amber-400" />
          <span>السبحة الإلكترونية التفاعلية المطورة</span>
        </div>
        <h1 className="font-amiri text-3xl sm:text-5xl font-bold text-stone-900 dark:text-stone-100">
          السبحة والأذكار المباركة
        </h1>
        <p className="text-xs sm:text-sm text-stone-600 dark:text-stone-400 max-w-lg mx-auto">
          سبّح واذكر الله واهدِ ثواب كل تسبيحة لأرواح المغفور لهم بإذن الله صدقةً جارية ونوراً في قبورهم.
        </p>
      </div>

      {/* Stats Counters Bar (Total starts at 0 for each user) */}
      <div className="grid grid-cols-3 gap-2 sm:gap-4 max-w-lg mx-auto">
        <div className="p-3 rounded-2xl bg-white dark:bg-stone-900 border border-stone-200 dark:border-stone-800 shadow-2xs">
          <div className="text-[11px] text-stone-500 dark:text-stone-400">الجلسة الحالية</div>
          <div className="font-mono text-xl sm:text-2xl font-bold text-amber-900 dark:text-amber-400 mt-0.5">
            {count}
          </div>
        </div>
        <div className="p-3 rounded-2xl bg-white dark:bg-stone-900 border border-stone-200 dark:border-stone-800 shadow-2xs">
          <div className="text-[11px] text-stone-500 dark:text-stone-400">تسبيحات اليوم</div>
          <div className="font-mono text-xl sm:text-2xl font-bold text-stone-800 dark:text-stone-200 mt-0.5">
            {todayCount}
          </div>
        </div>
        <div className="p-3 rounded-2xl bg-white dark:bg-stone-900 border border-stone-200 dark:border-stone-800 shadow-2xs relative group">
          <div className="text-[11px] text-stone-500 dark:text-stone-400 flex items-center justify-center gap-1">
            <span>المجموع الإجمالي</span>
            <button
              onClick={(e) => {
                e.stopPropagation();
                setShowResetConfirm(true);
              }}
              className="opacity-40 hover:opacity-100 p-0.5 text-stone-400 hover:text-red-500 transition-opacity"
              title="تصفير المجموع الإجمالي"
            >
              <Trash2 className="w-2.5 h-2.5" />
            </button>
          </div>
          <div className="font-mono text-xl sm:text-2xl font-bold text-emerald-800 dark:text-emerald-400 mt-0.5">
            {totalLifetimeCount}
          </div>
        </div>
      </div>

      {/* Top Controls: Mode, Themes, Sound, Haptic, Fullscreen */}
      <div className="flex flex-wrap items-center justify-between gap-3 p-3 sm:p-4 rounded-2xl bg-white dark:bg-stone-900 border border-stone-200 dark:border-stone-800 shadow-xs">
        {/* Mode Switcher */}
        <div className="flex items-center gap-1 bg-stone-100 dark:bg-stone-800 p-1 rounded-xl">
          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              setSebhaMode('beads');
            }}
            className={`flex items-center gap-1 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all cursor-pointer ${
              sebhaMode === 'beads'
                ? 'bg-white dark:bg-stone-700 text-amber-900 dark:text-amber-300 shadow-2xs font-bold'
                : 'text-stone-600 dark:text-stone-400 hover:text-stone-900'
            }`}
          >
            <CircleDot className="w-3.5 h-3.5" />
            <span>سبحة الخرز</span>
          </button>
          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              setSebhaMode('ring');
            }}
            className={`flex items-center gap-1 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all cursor-pointer ${
              sebhaMode === 'ring'
                ? 'bg-white dark:bg-stone-700 text-amber-900 dark:text-amber-300 shadow-2xs font-bold'
                : 'text-stone-600 dark:text-stone-400 hover:text-stone-900'
            }`}
          >
            <Sliders className="w-3.5 h-3.5" />
            <span>العداد الرقمي</span>
          </button>
        </div>

        {/* Theme Picker */}
        <div className="flex items-center gap-1.5">
          <span className="text-[11px] text-stone-400 hidden sm:inline">الخامة:</span>
          {[
            { id: 'amber', label: 'كهرمان عسلي', color: 'bg-amber-600' },
            { id: 'royal_gold', label: 'ذهب ملكي', color: 'bg-amber-400' },
            { id: 'emerald', label: 'زمرد رحماني', color: 'bg-emerald-600' },
            { id: 'sandalwood', label: 'صندل عطري', color: 'bg-stone-700' },
            { id: 'pearl', label: 'لؤلؤ ناصع', color: 'bg-slate-300' },
            { id: 'night', label: 'ليلي فخم', color: 'bg-stone-950 border-amber-500/50' },
          ].map((th) => (
            <button
              key={th.id}
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                setSebhaTheme(th.id as SebhaTheme);
              }}
              className={`w-6 h-6 rounded-full ${th.color} border-2 transition-all cursor-pointer ${
                sebhaTheme === th.id ? 'border-amber-900 dark:border-amber-400 scale-110 shadow-xs ring-2 ring-amber-400/50' : 'border-white dark:border-stone-700'
              }`}
              title={th.label}
            />
          ))}
        </div>

        {/* Audio, Vibration & Full-screen tap toggles */}
        <div className="flex items-center gap-1.5">
          {/* Sound */}
          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              setSoundEnabled(!soundEnabled);
            }}
            className={`p-2 rounded-xl border transition-colors cursor-pointer ${
              soundEnabled
                ? 'bg-amber-50 dark:bg-amber-950/40 border-amber-300 dark:border-amber-700 text-amber-900 dark:text-amber-300'
                : 'border-stone-200 dark:border-stone-700 text-stone-400 hover:bg-stone-50 dark:hover:bg-stone-800'
            }`}
            title={soundEnabled ? 'صوت خرزات المسبحة مفعّل' : 'تفعيل صوت الخرز'}
          >
            {soundEnabled ? <Volume2 className="w-4 h-4" /> : <VolumeX className="w-4 h-4" />}
          </button>

          {/* Vibrate */}
          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              setVibrateEnabled(!vibrateEnabled);
            }}
            className={`p-2 rounded-xl border transition-colors cursor-pointer ${
              vibrateEnabled
                ? 'bg-amber-50 dark:bg-amber-950/40 border-amber-300 dark:border-amber-700 text-amber-900 dark:text-amber-300'
                : 'border-stone-200 dark:border-stone-700 text-stone-400 hover:bg-stone-50 dark:hover:bg-stone-800'
            }`}
            title="الاهتزاز اللمسي مع كل تسبيحة"
          >
            <Vibrate className="w-4 h-4" />
          </button>

          {/* Full-Screen Tap Mode */}
          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              setFullScreenTap(!fullScreenTap);
              showToast(fullScreenTap ? 'تم إيقاف النقر في أي مكان' : 'تم تفعيل النقر في أي مكان بالشاشة للتسبيح');
            }}
            className={`p-2 rounded-xl border transition-colors cursor-pointer ${
              fullScreenTap
                ? 'bg-amber-800 text-white border-amber-900'
                : 'border-stone-200 dark:border-stone-700 text-stone-400 hover:bg-stone-50 dark:hover:bg-stone-800'
            }`}
            title={fullScreenTap ? 'النقر في أي مكان مفعّل' : 'تفعيل النقر في كامل الشاشة'}
          >
            {fullScreenTap ? <Minimize2 className="w-4 h-4" /> : <Maximize2 className="w-4 h-4" />}
          </button>
        </div>
      </div>

      {/* Current Dhikr Selector & Virtues Banner */}
      <div className={`p-5 rounded-3xl border transition-colors ${themeConfig.bgHighlight}`}>
        <div className="flex items-center justify-between gap-2 mb-3">
          <span className="text-xs font-bold text-amber-800 dark:text-amber-400 flex items-center gap-1.5">
            <Star8Rosette className="w-4 h-4 text-amber-700" />
            <span>الذكر المبارك الحالي:</span>
          </span>
          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              setShowAddModal(true);
            }}
            className="flex items-center gap-1 text-xs text-amber-800 dark:text-amber-300 font-semibold hover:underline cursor-pointer"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>إضافة ذكر جديد</span>
          </button>
        </div>

        {/* Horizontal Scrollable Dhikr Badges */}
        <div className="flex items-center gap-2 overflow-x-auto pb-2 scrollbar-none">
          {dhikrList.map((item, idx) => (
            <button
              key={idx}
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                setCurrentDhikrIndex(idx);
                setTarget(item.target);
                setCount(0);
              }}
              className={`px-3.5 py-2 rounded-xl text-xs font-medium whitespace-nowrap transition-all cursor-pointer ${
                currentDhikrIndex === idx
                  ? 'bg-amber-800 text-white font-bold shadow-md scale-102'
                  : 'bg-white/80 dark:bg-stone-800 text-stone-700 dark:text-stone-300 hover:bg-white border border-stone-200 dark:border-stone-700'
              }`}
            >
              {item.text}
            </button>
          ))}
        </div>

        {/* Selected Dhikr Display */}
        <div className="mt-4 pt-3 border-t border-amber-200/60 dark:border-stone-800">
          <div className="font-amiri text-2xl sm:text-3xl font-bold text-stone-900 dark:text-stone-100">
            «{currentDhikr.text}»
          </div>
          {currentDhikr.virtue && (
            <p className="font-amiri text-xs sm:text-sm text-stone-600 dark:text-stone-400 mt-2 leading-relaxed">
              {currentDhikr.virtue}
            </p>
          )}
        </div>
      </div>

      {/* Target Presets Bar */}
      <div className="flex items-center justify-center gap-2">
        <span className="text-xs text-stone-400">الهدف:</span>
        {[33, 100, 1000, 0].map((tVal) => (
          <button
            key={tVal}
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              setTarget(tVal);
            }}
            className={`px-3 py-1 rounded-xl text-xs font-bold transition-all cursor-pointer ${
              target === tVal
                ? 'bg-amber-800 text-white shadow-xs'
                : 'bg-stone-100 dark:bg-stone-800 text-stone-600 dark:text-stone-400 hover:bg-stone-200'
            }`}
          >
            {tVal === 0 ? 'مفتوح' : `${tVal}`}
          </button>
        ))}
      </div>

      {/* MAIN INTERACTIVE SEBHA COUNTER */}
      <div className="py-4 relative flex flex-col items-center justify-center">
        
        {/* Celebration Pulse when target completed */}
        {justCompletedTarget && (
          <div className="absolute -top-4 px-4 py-1.5 rounded-full bg-emerald-600 text-white text-xs font-bold shadow-xl animate-bounce flex items-center gap-1.5 z-20">
            <CheckCircle2 className="w-4 h-4" />
            <span>ما شاء الله! اكتمل الهدف</span>
          </div>
        )}

        {/* MODE 1: Beads Mode (Interactive 33-Bead Ring) */}
        {sebhaMode === 'beads' ? (
          <div className="relative w-64 h-64 sm:w-80 sm:h-80 mx-auto flex items-center justify-center">
            
            {/* Circular Beads Loop */}
            <div className="absolute inset-0">
              {Array.from({ length: 33 }).map((_, i) => {
                const angle = (i / 33) * 2 * Math.PI - Math.PI / 2;
                const radius = 110; // px
                const x = Math.cos(angle) * radius;
                const y = Math.sin(angle) * radius;
                const isPassed = i <= currentBeadInRound;

                return (
                  <div
                    key={i}
                    style={{
                      transform: `translate(${x}px, ${y}px)`,
                      left: 'calc(50% - 8px)',
                      top: 'calc(50% - 8px)',
                    }}
                    className={`absolute w-4 h-4 rounded-full transition-all duration-150 bg-gradient-to-br shadow-sm ${
                      isPassed ? themeConfig.beadActive : themeConfig.beadNormal
                    } ${i === currentBeadInRound ? 'scale-135 ring-2 ring-amber-400' : 'scale-90'}`}
                  />
                );
              })}
            </div>

            {/* Central Main Tapper Button */}
            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                handleIncrement();
              }}
              className={`relative z-10 w-44 h-44 sm:w-52 sm:h-52 rounded-full flex flex-col items-center justify-center cursor-pointer transition-transform duration-100 ${
                themeConfig.buttonGlow
              } ${isPressing ? 'scale-95 shadow-inner' : 'scale-100 shadow-2xl hover:scale-102'}`}
            >
              <div className="text-[11px] font-sans opacity-85 uppercase tracking-wider mb-1">
                اضغط للتسبيح
              </div>
              <div className="font-mono text-4xl sm:text-5xl font-bold tracking-tight">
                {count}
              </div>
              <div className="text-xs opacity-90 mt-1">
                {target > 0 ? `الهدف: ${target}` : 'تسبيح حر'}
              </div>
              <Fingerprint className="w-5 h-5 opacity-40 mt-2" />
            </button>

          </div>
        ) : (
          /* MODE 2: Digital Ring Counter Mode */
          <div className="relative w-64 h-64 sm:w-80 sm:h-80 mx-auto flex items-center justify-center">
            
            {/* SVG Circular Progress Track */}
            <svg className="absolute inset-0 w-full h-full -rotate-90" viewBox="0 0 100 100">
              <circle
                cx="50"
                cy="50"
                r="42"
                fill="none"
                stroke="currentColor"
                strokeWidth="5"
                className="text-stone-200 dark:text-stone-800"
              />
              <circle
                cx="50"
                cy="50"
                r="42"
                fill="none"
                stroke={themeConfig.ringAccent}
                strokeWidth="5.5"
                strokeDasharray="264"
                strokeDashoffset={264 - (progressPercent / 100) * 264}
                strokeLinecap="round"
                className="transition-all duration-150"
              />
            </svg>

            {/* Central Tapper Button */}
            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                handleIncrement();
              }}
              className={`relative z-10 w-48 h-48 sm:w-56 sm:h-56 rounded-full flex flex-col items-center justify-center cursor-pointer transition-transform duration-100 ${
                themeConfig.buttonGlow
              } ${isPressing ? 'scale-95' : 'scale-100 shadow-2xl hover:scale-102'}`}
            >
              <div className="text-[11px] font-sans opacity-85 uppercase tracking-wider mb-1">
                اضغط أو اضغط المسافة
              </div>
              <div className="font-mono text-5xl sm:text-6xl font-bold tracking-tight">
                {count}
              </div>
              <div className="text-xs opacity-90 mt-1">
                {target > 0 ? `${count} من ${target}` : 'تسبيح حر مفتوح'}
              </div>
            </button>

          </div>
        )}

        <div className="text-xs text-stone-400 mt-4 flex items-center justify-center gap-1.5">
          <span>يمكنك الضغط على زر المسافة (Space) للتسبيح السريع عبر لوحة المفاتيح</span>
        </div>
      </div>

      {/* Action Buttons: Reset Current, Dedicate Thawab */}
      <div className="flex flex-wrap items-center justify-center gap-3 pt-2">
        <button
          type="button"
          onClick={(e) => {
            e.stopPropagation();
            handleResetCurrentRound();
          }}
          className="flex items-center gap-1.5 px-4 py-2.5 rounded-xl border border-stone-300 dark:border-stone-700 bg-white dark:bg-stone-800 text-stone-700 dark:text-stone-300 hover:bg-stone-50 dark:hover:bg-stone-750 text-xs sm:text-sm font-semibold transition-all cursor-pointer shadow-2xs active:scale-95"
        >
          <RotateCcw className="w-4 h-4 text-stone-500" />
          <span>إعادة ضبط الجلسة</span>
        </button>

        <button
          type="button"
          onClick={(e) => {
            e.stopPropagation();
            handleDedicateCount();
          }}
          className="flex items-center gap-1.5 px-6 py-2.5 rounded-xl bg-amber-800 hover:bg-amber-900 text-white text-xs sm:text-sm font-bold transition-all cursor-pointer shadow-md hover:shadow-lg active:scale-95"
        >
          <Heart className="w-4 h-4 fill-current" />
          <span>إهداء ثواب هذا التسبيح</span>
        </button>
      </div>

      {/* Dedication Target Selection Modal */}
      {showDedicateChoice && (
        <div
          onClick={(e) => {
            e.stopPropagation();
            setShowDedicateChoice(false);
          }}
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-stone-950/70 backdrop-blur-xs animate-in fade-in duration-150"
        >
          <div
            onClick={(e) => e.stopPropagation()}
            className="w-full max-w-sm bg-white dark:bg-stone-900 rounded-3xl p-6 text-right space-y-4 shadow-2xl border border-stone-200 dark:border-stone-800"
          >
            <h3 className="font-amiri text-xl font-bold text-stone-900 dark:text-stone-100 flex items-center gap-2">
              <Heart className="w-5 h-5 text-amber-700 fill-amber-700/20" />
              <span>إهداء ثواب التسبيح ({count} تسبيحة)</span>
            </h3>
            <p className="text-xs text-stone-600 dark:text-stone-400">
              اختر لمن ترغب في إهداء ثواب تسبيحاتك المباركة:
            </p>

            <div className="space-y-2 pt-1">
              <button
                type="button"
                onClick={() => handleDedicateCount('closest')}
                className="w-full p-3.5 rounded-2xl bg-amber-50 dark:bg-amber-950/50 border border-amber-300 dark:border-amber-700 hover:bg-amber-100 dark:hover:bg-amber-900/60 text-right transition-all flex items-center justify-between cursor-pointer group"
              >
                <div>
                  <div className="text-xs font-bold text-amber-950 dark:text-amber-200 group-hover:text-amber-800">
                    طرفك الأقرب: {profile.closestRelative}
                  </div>
                  <div className="text-[11px] text-amber-800/80 dark:text-amber-400">
                    {userProfileService.getHonorific(profile)}
                  </div>
                </div>
                <Heart className="w-4 h-4 text-rose-500 fill-rose-500 shrink-0" />
              </button>

              <button
                type="button"
                onClick={() => handleDedicateCount('all')}
                className="w-full p-3.5 rounded-2xl bg-stone-50 dark:bg-stone-850 border border-stone-200 dark:border-stone-700 hover:bg-stone-100 dark:hover:bg-stone-800 text-right transition-all flex items-center justify-between cursor-pointer"
              >
                <div>
                  <div className="text-xs font-bold text-stone-900 dark:text-stone-100">
                    أرواح عمامنا الكرام الأربعة
                  </div>
                  <div className="text-[11px] text-stone-500 dark:text-stone-400">
                    رمضان، الشهاوي، الشافعي، أحمد
                  </div>
                </div>
                <Sparkles className="w-4 h-4 text-amber-600 shrink-0" />
              </button>
            </div>

            <div className="pt-2 text-center">
              <button
                type="button"
                onClick={() => setShowDedicateChoice(false)}
                className="text-xs text-stone-500 dark:text-stone-400 hover:underline cursor-pointer"
              >
                إلغاء
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Reset Total Lifetime Confirmation Modal */}
      {showResetConfirm && (
        <div
          onClick={(e) => e.stopPropagation()}
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-stone-950/70 backdrop-blur-xs"
        >
          <div className="w-full max-w-sm bg-white dark:bg-stone-900 rounded-3xl p-6 text-right space-y-4 shadow-2xl border border-stone-200 dark:border-stone-800">
            <h3 className="font-amiri text-xl font-bold text-stone-900 dark:text-stone-100 flex items-center gap-2">
              <Trash2 className="w-5 h-5 text-red-600" />
              <span>تصفير المجموع الإجمالي</span>
            </h3>
            <p className="text-xs text-stone-600 dark:text-stone-400 leading-relaxed">
              هل ترغب في إعادة ضبط المجموع الإجمالي لجميع تسبيحاتك ({totalLifetimeCount} تسبيحة) إلى الصفر للبدء من جديد؟
            </p>
            <div className="flex items-center justify-end gap-2 pt-2">
              <button
                type="button"
                onClick={() => setShowResetConfirm(false)}
                className="px-4 py-2 rounded-xl text-xs font-semibold text-stone-600 hover:bg-stone-100 dark:text-stone-400 dark:hover:bg-stone-800 cursor-pointer"
              >
                إلغاء
              </button>
              <button
                type="button"
                onClick={handleResetTotalLifetime}
                className="px-4 py-2 rounded-xl bg-red-600 hover:bg-red-700 text-white text-xs font-bold cursor-pointer"
              >
                تأكيد التصفير
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Add Custom Dhikr Modal */}
      {showAddModal && (
        <div
          onClick={(e) => e.stopPropagation()}
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-stone-900/60 backdrop-blur-xs"
        >
          <div className="w-full max-w-md bg-white dark:bg-stone-900 rounded-3xl shadow-2xl p-6 text-right space-y-4 border border-stone-200 dark:border-stone-800">
            <div className="flex items-center justify-between pb-3 border-b border-stone-200 dark:border-stone-800">
              <h3 className="font-amiri text-2xl font-bold text-stone-900 dark:text-stone-100 flex items-center gap-2">
                <Plus className="w-5 h-5 text-amber-700" />
                <span>إضافة ذكر مخصص</span>
              </h3>
              <button
                onClick={() => setShowAddModal(false)}
                className="p-1 text-stone-400 hover:text-stone-700 rounded-lg cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleAddCustomDhikr} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-stone-700 dark:text-stone-300 mb-1.5">
                  نص الذكر أو الدعاء المبارك *
                </label>
                <input
                  type="text"
                  required
                  placeholder="مثال: لَا إِلَهَ إِلَّا أَنْتَ سُبْحَانَكَ إِنِّي كُنْتُ مِنَ الظَّالِمِينَ"
                  value={customText}
                  onChange={(e) => setCustomText(e.target.value)}
                  className="w-full px-3.5 py-2.5 text-sm bg-stone-50 dark:bg-stone-800 border border-stone-200 dark:border-stone-700 rounded-xl focus:outline-hidden focus:border-amber-700 text-stone-900 dark:text-stone-100"
                />
              </div>

              <div>
                <CustomSelect<number>
                  label="الهدف المفضل للتسبيح"
                  value={customTarget}
                  onChange={(val) => setCustomTarget(Number(val))}
                  options={[
                    { value: 33, label: '٣٣ تسبيحة', badge: 'سنة نبوية' },
                    { value: 100, label: '١٠٠ تسبيحة', badge: 'ورد مأثور' },
                    { value: 1000, label: '١٠٠٠ تسبيحة', badge: 'ختمة ذكر' },
                    { value: 0, label: 'تسبيح حر مفتوح بدون حد', badge: 'مفتوح' },
                  ]}
                  size="md"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-stone-700 dark:text-stone-300 mb-1.5">
                  فضله أو ملاحظة (اختياري)
                </label>
                <input
                  type="text"
                  placeholder="مثال: دعوة ذي النون لتفريج الكروب"
                  value={customVirtue}
                  onChange={(e) => setCustomVirtue(e.target.value)}
                  className="w-full px-3.5 py-2.5 text-sm bg-stone-50 dark:bg-stone-800 border border-stone-200 dark:border-stone-700 rounded-xl focus:outline-hidden focus:border-amber-700 text-stone-900 dark:text-stone-100"
                />
              </div>

              <div className="flex items-center justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setShowAddModal(false)}
                  className="px-4 py-2 rounded-xl text-xs font-semibold text-stone-600 dark:text-stone-400 hover:bg-stone-100 dark:hover:bg-stone-800 cursor-pointer"
                >
                  إلغاء
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-xl bg-amber-800 hover:bg-amber-900 text-white text-xs font-bold cursor-pointer shadow-md"
                >
                  حفظ الذكر والبدء
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
};
