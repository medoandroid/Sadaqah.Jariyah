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
  CheckCircle2,
  Bell,
  Move,
  BookOpen,
  Target,
  Edit3,
  ChevronRight,
  ChevronLeft
} from 'lucide-react';
import { recordDedication } from '../services/dedicationService';
import { Star8Rosette } from '../components/IslamicDecoration';
import { storageService } from '../services/storageService';
import { userProfileService, UserProfile } from '../services/userProfileService';
import { projectOwnerService } from '../services/projectOwnerService';
import { floatingSebhaService } from '../services/floatingSebhaService';
import { NotificationSettingsModal } from '../components/NotificationSettingsModal';
import { FloatingSebhaInfoModal } from '../components/FloatingSebhaInfoModal';
import { sanitizeBoundedText } from '../utils/security';
import { playTasbeehBeadSound } from '../utils/soundEffects';
import { tasbeehSyncService, TasbeehSharedState, DEFAULT_DHIKRS, DhikrMeta } from '../services/tasbeehSyncService';

export type SebhaTheme = 'amber' | 'emerald' | 'sandalwood' | 'pearl' | 'royal_gold' | 'night';
export type SebhaMode = 'beads' | 'ring';

interface TasbeehPageProps {
  onNavigateToAdhkar?: () => void;
}

export const TasbeehPage: React.FC<TasbeehPageProps> = ({ onNavigateToAdhkar }) => {
  // Directly subscribe to the unified tasbeehSyncService state
  const [syncState, setSyncState] = useState<TasbeehSharedState>(() => tasbeehSyncService.getState());

  const count = syncState.count;
  const currentDhikrIndex = syncState.currentDhikrIndex;
  const target = syncState.target;
  const dhikrCountsMap = syncState.dhikrCountsMap;
  const totalLifetimeCount = syncState.totalLifetimeCount;
  const todayCount = syncState.todayCount;
  const dhikrList = syncState.dhikrList;
  const rotationAngle = syncState.rotationAngle;

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

  // Floating Sebha State
  const [isFloatingActive, setIsFloatingActive] = useState<boolean>(() => {
    return floatingSebhaService.isOpen();
  });

  // Modals
  const [showNotificationModal, setShowNotificationModal] = useState<boolean>(false);
  const [showFloatingInfoModal, setShowFloatingInfoModal] = useState<boolean>(false);
  const [showCustomTargetModal, setShowCustomTargetModal] = useState<boolean>(false);
  const [customTargetInput, setCustomTargetInput] = useState<string>('33');

  const [toastMsg, setToastMsg] = useState<string | null>(null);
  const [isPressing, setIsPressing] = useState<boolean>(false);
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

  // Subscribe to real-time sync service (instant two-way binding)
  useEffect(() => {
    const unsub = tasbeehSyncService.subscribe((latest) => {
      setSyncState(latest);
    });
    return unsub;
  }, []);

  useEffect(() => {
    const unsub = userProfileService.subscribe((p) => {
      setProfile(p);
    });
    return unsub;
  }, []);

  useEffect(() => {
    return floatingSebhaService.subscribe((open) => {
      setIsFloatingActive(open);
    });
  }, []);

  // Persist visual/local preferences
  useEffect(() => {
    storageService.setString('tasbeeh_theme', sebhaTheme);
    storageService.setString('tasbeeh_mode', sebhaMode);
    storageService.set('tasbeeh_sound', soundEnabled);
    storageService.set('tasbeeh_vibrate', vibrateEnabled);
    storageService.set('tasbeeh_fullscreen', fullScreenTap);
  }, [
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

  const handleIncrement = () => {
    setIsPressing(true);
    setTimeout(() => setIsPressing(false), 90);

    const result = tasbeehSyncService.increment({
      sound: soundEnabled,
      vibrate: vibrateEnabled,
    });

    // Target completion detection & gentle feedback
    if (result.justCompletedTarget) {
      setJustCompletedTarget(true);
      setTimeout(() => setJustCompletedTarget(false), 2400);
      showToast(`ما شاء الله! اكتمل الهدف (${target} تسبيحة) بحمد الله وتوفيقه ✨`);
    }
  };

  const handleResetCurrentRound = () => {
    tasbeehSyncService.resetCurrentCount();
    showToast('تمت إعادة ضبط عداد الجلسة الحالية');
  };

  const handleResetTotalLifetime = () => {
    tasbeehSyncService.resetLifetimeTotal();
    setShowResetConfirm(false);
    showToast('تم تصفير المجموع الإجمالي بنجاح');
  };

  const handleSwitchDhikr = (idx: number) => {
    tasbeehSyncService.switchDhikr(idx);
  };

  const handleDedicateCount = (targetChoice?: 'all' | 'closest' | 'owner') => {
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
    const isOwner = targetChoice === 'owner';
    const targetPersonId = isClosest ? 'custom_closest' : isOwner ? 'project_owner' : 'all';
    
    const recipientName = isClosest
      ? `${profile.closestRelative} (${userProfileService.getHonorific(profile)})`
      : isOwner
      ? projectOwnerService.getOwnerProfile().name
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
    if (isOwner) {
      showToast(`تم إهداء ثواب ${count} تسبيحة لصاحب المنصة، ربنا يتقبل منك ومننا!`);
    } else if (isClosest) {
      showToast(`تم إهداء ثواب ${count} تسبيحة إلى ${profile.closestRelative}، ربنا يتقبل منك!`);
    } else {
      showToast(`تم إهداء ثواب ${count} تسبيحة لأرواحهم الغالية، ربنا يتقبل منكم!`);
    }
    tasbeehSyncService.resetCurrentCount();
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

    tasbeehSyncService.addCustomDhikr(newDhikr);

    setShowAddModal(false);
    setCustomText('');
    setCustomVirtue('');
    showToast('تمت إضافة الذكر الجديد بنجاح');
  };

  const handleSetCustomTarget = (e: React.FormEvent) => {
    e.preventDefault();
    const parsed = parseInt(customTargetInput, 10);
    if (!isNaN(parsed) && parsed > 0) {
      tasbeehSyncService.setTarget(parsed);
      setShowCustomTargetModal(false);
      showToast(`تم تحديد الهدف المخصص: ${parsed} تسبيحة`);
    }
  };

  const currentDhikr = dhikrList[currentDhikrIndex] || DEFAULT_DHIKRS[0];
  const progressPercent = target > 0 ? Math.min(100, ((count % target) / target) * 100) : 100;
  const currentBeadInRound = target > 0 ? count % 33 : count % 33;

  // 3D Theme Palette Configurations with Realistic Bead Lighting Shaders
  const getThemeConfig = () => {
    switch (sebhaTheme) {
      case 'emerald':
        return {
          beadStyle: {
            background: 'radial-gradient(circle at 35% 30%, #34d399 0%, #059669 45%, #064e3b 100%)',
            boxShadow: '0 4px 10px rgba(5, 150, 105, 0.4), inset 0 2px 4px rgba(255, 255, 255, 0.6), inset 0 -2px 4px rgba(0, 0, 0, 0.6)',
          },
          beadActiveGlow: '0 0 16px rgba(52, 211, 153, 0.9), inset 0 2px 5px #fff',
          ringAccent: '#10B981',
          bgHighlight: 'bg-emerald-50/80 dark:bg-emerald-950/30 border-emerald-300 dark:border-emerald-800/50',
          badgeText: 'text-emerald-900 bg-emerald-100',
          buttonGlow: 'from-emerald-600 via-emerald-700 to-emerald-900 text-white shadow-emerald-700/40',
        };
      case 'royal_gold':
        return {
          beadStyle: {
            background: 'radial-gradient(circle at 35% 30%, #fef08a 0%, #f59e0b 45%, #78350f 100%)',
            boxShadow: '0 4px 12px rgba(217, 119, 6, 0.45), inset 0 2px 4px rgba(255, 255, 255, 0.7), inset 0 -2px 4px rgba(0, 0, 0, 0.6)',
          },
          beadActiveGlow: '0 0 18px rgba(251, 191, 36, 0.95), inset 0 2px 5px #fff',
          ringAccent: '#D97706',
          bgHighlight: 'bg-amber-50/90 dark:bg-amber-950/30 border-amber-300 dark:border-amber-800/50',
          badgeText: 'text-amber-950 bg-amber-200',
          buttonGlow: 'from-amber-500 via-amber-600 to-amber-800 text-white shadow-amber-600/40',
        };
      case 'sandalwood':
        return {
          beadStyle: {
            background: 'radial-gradient(circle at 35% 30%, #a8a29e 0%, #57534e 45%, #292524 100%)',
            boxShadow: '0 4px 10px rgba(0, 0, 0, 0.5), inset 0 2px 3px rgba(255, 255, 255, 0.4), inset 0 -2px 4px rgba(0, 0, 0, 0.8)',
          },
          beadActiveGlow: '0 0 14px rgba(214, 211, 209, 0.7), inset 0 2px 4px #fff',
          ringAccent: '#78350F',
          bgHighlight: 'bg-stone-100 dark:bg-stone-900/60 border-stone-300 dark:border-stone-800',
          badgeText: 'text-stone-900 bg-stone-200',
          buttonGlow: 'from-stone-700 via-stone-800 to-stone-950 text-amber-200 shadow-stone-800/40',
        };
      case 'pearl':
        return {
          beadStyle: {
            background: 'radial-gradient(circle at 35% 30%, #ffffff 0%, #f1f5f9 40%, #cbd5e1 75%, #94a3b8 100%)',
            boxShadow: '0 4px 12px rgba(148, 163, 184, 0.45), inset 0 2px 5px rgba(255, 255, 255, 0.9), inset 0 -2px 4px rgba(0, 0, 0, 0.3)',
          },
          beadActiveGlow: '0 0 16px rgba(255, 255, 255, 0.95), inset 0 2px 5px #fff',
          ringAccent: '#B45309',
          bgHighlight: 'bg-slate-50 dark:bg-stone-900/60 border-slate-200 dark:border-stone-800',
          badgeText: 'text-slate-900 bg-slate-200',
          buttonGlow: 'from-slate-700 via-slate-800 to-slate-950 text-white shadow-slate-700/40',
        };
      case 'night':
        return {
          beadStyle: {
            background: 'radial-gradient(circle at 35% 30%, #f59e0b 0%, #292524 40%, #0c0a09 100%)',
            boxShadow: '0 4px 12px rgba(0, 0, 0, 0.7), inset 0 2px 4px rgba(245, 158, 11, 0.5), inset 0 -2px 4px rgba(0, 0, 0, 0.9)',
          },
          beadActiveGlow: '0 0 16px rgba(245, 158, 11, 0.8), inset 0 2px 4px #fbbf24',
          ringAccent: '#F59E0B',
          bgHighlight: 'bg-stone-900 border-stone-800 text-stone-100',
          badgeText: 'text-amber-300 bg-stone-800',
          buttonGlow: 'from-amber-600 via-stone-800 to-black text-amber-200 font-bold shadow-amber-500/30',
        };
      case 'amber':
      default:
        return {
          beadStyle: {
            background: 'radial-gradient(circle at 35% 30%, #fde68a 0%, #d97706 45%, #78350f 100%)',
            boxShadow: '0 4px 12px rgba(217, 119, 6, 0.45), inset 0 2px 4px rgba(255, 255, 255, 0.7), inset 0 -2px 4px rgba(0, 0, 0, 0.6)',
          },
          beadActiveGlow: '0 0 18px rgba(245, 158, 11, 0.95), inset 0 2px 5px #fff',
          ringAccent: '#F59E0B',
          bgHighlight: 'bg-amber-50/80 dark:bg-amber-950/30 border-amber-300 dark:border-amber-800/50',
          badgeText: 'text-amber-900 bg-amber-100',
          buttonGlow: 'from-amber-600 via-amber-700 to-amber-900 text-white shadow-amber-700/40',
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
          <span>السبحة الإلكترونية التفاعلية ثلاثية الأبعاد (3D)</span>
        </div>
        <h1 className="font-amiri text-3xl sm:text-5xl font-bold text-stone-900 dark:text-stone-100">
          السبحة والأذكار المباركة
        </h1>
        <p className="text-xs sm:text-sm text-stone-600 dark:text-stone-400 max-w-lg mx-auto">
          سبّح واذكر الله بدقة واهدِ ثواب كل تسبيحة لأرواح المغفور لهم بإذن الله صدقةً جارية ونوراً في قبورهم.
        </p>
      </div>

      {/* Quick Action Integration Pills (Floating Sebha, Notifications, Hisn Muslim) */}
      <div className="flex flex-wrap items-center justify-center gap-2 text-xs">
        {/* Floating Sebha Trigger */}
        <button
          type="button"
          onClick={(e) => {
            e.stopPropagation();
            const isOpen = floatingSebhaService.toggle();
            setIsFloatingActive(isOpen);
            showToast(isOpen ? 'تم تفعيل السبحة العائمة! ستظهر معك في جميع صفحات المنصة' : 'تم إغلاق السبحة العائمة');
          }}
          className={`px-3.5 py-1.5 rounded-2xl border flex items-center gap-1.5 font-bold transition-all cursor-pointer shadow-xs dmda-tactile-btn ${
            isFloatingActive
              ? 'dmda-gold-gradient text-white border-amber-600 shadow-md'
              : 'bg-white dark:bg-emerald-950/40 border-amber-500/30 text-amber-900 dark:text-amber-300 hover:bg-amber-50'
          }`}
          title="تشغيل سبحة عائمة حرة تطفو فوق جميع الصفحات"
        >
          <Move className="w-3.5 h-3.5" />
          <span>السبحة العائمة</span>
          <span className="text-[10px] opacity-85 font-normal">
            {isFloatingActive ? '· تعمل الآن' : '· تفعيل'}
          </span>
        </button>

        {/* Notifications Modal Trigger */}
        <button
          type="button"
          onClick={(e) => {
            e.stopPropagation();
            setShowNotificationModal(true);
          }}
          className="px-3.5 py-1.5 rounded-2xl border border-stone-200 dark:border-amber-500/20 bg-white dark:bg-emerald-950/40 text-stone-700 dark:text-stone-300 hover:text-amber-900 hover:border-amber-400 flex items-center gap-1.5 font-semibold transition cursor-pointer shadow-xs dmda-tactile-btn"
          title="جدولة تنبيهات دورية للأذكار والصلاة على النبي ﷺ"
        >
          <Bell className="w-3.5 h-3.5 text-amber-500" />
          <span>تنبيهات الأذكار المجدولة</span>
        </button>

        {/* Adhkar Page Navigation */}
        {onNavigateToAdhkar && (
          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              onNavigateToAdhkar();
            }}
            className="px-3.5 py-1.5 rounded-2xl border border-stone-200 dark:border-amber-500/20 bg-white dark:bg-emerald-950/40 text-stone-700 dark:text-stone-300 hover:text-amber-900 hover:border-amber-400 flex items-center gap-1.5 font-semibold transition cursor-pointer shadow-xs dmda-tactile-btn"
            title="الانتقال إلى أذكار الصباح والمساء وحصن المسلم"
          >
            <BookOpen className="w-3.5 h-3.5 text-amber-500" />
            <span>حصن المسلم والأذكار</span>
          </button>
        )}
      </div>

      {/* Stats Counters Bar (Total strictly starts at 0 for each user) */}
      <div className="grid grid-cols-3 gap-2 sm:gap-4 max-w-lg mx-auto">
        <div className="p-3 sm:p-4 rounded-2xl dmda-glass-card border border-stone-200/80 dark:border-amber-500/20">
          <div className="text-[11px] text-stone-500 dark:text-stone-400">الجلسة الحالية</div>
          <div className="font-mono text-xl sm:text-2xl font-bold text-amber-900 dark:text-amber-400 mt-0.5 tabular-nums">
            {count}
          </div>
        </div>
        <div className="p-3 sm:p-4 rounded-2xl dmda-glass-card border border-stone-200/80 dark:border-amber-500/20">
          <div className="text-[11px] text-stone-500 dark:text-stone-400">تسبيحات اليوم</div>
          <div className="font-mono text-xl sm:text-2xl font-bold text-stone-800 dark:text-stone-200 mt-0.5 tabular-nums">
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
            <span>سبحة الخرز 3D</span>
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
                handleSwitchDhikr(idx);
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

      {/* Target Presets & Custom Target Input Bar */}
      <div className="flex flex-wrap items-center justify-center gap-2">
        <span className="text-xs text-stone-400 font-medium">الهدف:</span>
        {[33, 100, 1000, 0].map((tVal) => (
          <button
            key={tVal}
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              tasbeehSyncService.setTarget(tVal);
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

        {/* Custom Target Modal Trigger */}
        <button
          type="button"
          onClick={(e) => {
            e.stopPropagation();
            setCustomTargetInput(target > 0 ? String(target) : '33');
            setShowCustomTargetModal(true);
          }}
          className={`px-3 py-1 rounded-xl text-xs font-bold transition cursor-pointer flex items-center gap-1 ${
            ![33, 100, 1000, 0].includes(target)
              ? 'bg-amber-800 text-white shadow-xs'
              : 'bg-stone-100 dark:bg-stone-800 text-stone-600 dark:text-stone-400 hover:bg-stone-200'
          }`}
          title="تحديد هدف حر مخصص"
        >
          <Target className="w-3.5 h-3.5" />
          <span>{![33, 100, 1000, 0].includes(target) ? `مخصص (${target})` : 'هدف مخصص'}</span>
        </button>
      </div>

      {/* MAIN INTERACTIVE 3D SEBHA COUNTER */}
      <div className="py-4 relative flex flex-col items-center justify-center">
        
        {/* Celebration Pulse when target completed */}
        {justCompletedTarget && (
          <div className="absolute -top-4 px-4 py-1.5 rounded-full bg-emerald-600 text-white text-xs font-bold shadow-xl animate-bounce flex items-center gap-1.5 z-20">
            <CheckCircle2 className="w-4 h-4" />
            <span>ما شاء الله! اكتمل الهدف المبارك</span>
          </div>
        )}

        {/* MODE 1: 3D Spherical Beads Loop with Dynamic Physics Rotation */}
        {sebhaMode === 'beads' ? (
          <div className="relative w-72 h-72 sm:w-84 sm:h-84 mx-auto flex items-center justify-center perspective-[1000px]">
            
            {/* The 3D Rotating Loop */}
            <div
              style={{
                transform: `rotateZ(${rotationAngle}deg)`,
                transition: 'transform 0.15s cubic-bezier(0.2, 0.8, 0.2, 1)',
                transformOrigin: 'center center',
              }}
              className="absolute inset-0 pointer-events-none"
            >
              {Array.from({ length: 33 }).map((_, i) => {
                const angle = (i / 33) * 2 * Math.PI - Math.PI / 2;
                const radius = 125; // px
                const x = Math.cos(angle) * radius;
                const y = Math.sin(angle) * radius;
                const isPassed = i <= currentBeadInRound;
                const isFocalBead = i === currentBeadInRound;

                return (
                  <div
                    key={i}
                    style={{
                      transform: `translate(${x}px, ${y}px) translate(-50%, -50%)`,
                      left: '50%',
                      top: '50%',
                      ...themeConfig.beadStyle,
                      boxShadow: isFocalBead ? themeConfig.beadActiveGlow : themeConfig.beadStyle.boxShadow,
                    }}
                    className={`absolute w-5 h-5 rounded-full transition-all duration-150 ${
                      isFocalBead ? 'scale-135 ring-2 ring-amber-300 z-10' : 'scale-95'
                    }`}
                  />
                );
              })}

              {/* Decorative Golden Imam / Minaret Bead with Tassel */}
              <div
                style={{
                  transform: 'translate(0px, 125px) translate(-50%, -50%)',
                  left: '50%',
                  top: '50%',
                }}
                className="absolute z-10 flex flex-col items-center"
              >
                <div className="w-6 h-6 rounded-md bg-gradient-to-b from-amber-400 via-amber-600 to-amber-900 border border-amber-300 shadow-md flex items-center justify-center">
                  <Star8Rosette className="w-3.5 h-3.5 text-amber-200" />
                </div>
                {/* Flowing Tassel */}
                <div className="w-2 h-7 bg-gradient-to-b from-amber-600 to-amber-800 rounded-b-md shadow-sm opacity-90" />
              </div>
            </div>

            {/* Central Main 3D Tapper Button */}
            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                handleIncrement();
              }}
              className={`relative z-20 w-44 h-44 sm:w-52 sm:h-52 rounded-full flex flex-col items-center justify-center cursor-pointer transition-transform duration-75 bg-gradient-to-br ${
                themeConfig.buttonGlow
              } ${isPressing ? 'scale-92 shadow-inner' : 'scale-100 shadow-2xl hover:scale-102'}`}
              style={{
                boxShadow: isPressing
                  ? 'inset 0 6px 14px rgba(0,0,0,0.7)'
                  : '0 12px 28px rgba(0,0,0,0.35), inset 0 3px 6px rgba(255,255,255,0.4)',
              }}
            >
              <div className="text-[11px] font-sans opacity-90 uppercase tracking-wider mb-1 text-white">
                اضغط أو اسحب للتسبيح
              </div>
              <div className="font-mono text-4xl sm:text-5xl font-black tracking-tight text-white drop-shadow-md">
                {count}
              </div>
              <div className="text-xs font-semibold opacity-95 mt-1 text-amber-200">
                {target > 0 ? `${count} من ${target}` : 'تسبيح حر مفتوح'}
              </div>
              <Fingerprint className="w-5 h-5 opacity-40 mt-2 text-white" />
            </button>

          </div>
        ) : (
          /* MODE 2: Digital Ring Counter Mode */
          <div className="relative w-64 h-64 sm:w-80 sm:h-80 mx-auto flex items-center justify-center">
            
            {/* SVG Circular Progress Track */}
            <svg className="absolute inset-0 w-full h-full -rotate-90 pointer-events-none" viewBox="0 0 100 100">
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
              className={`relative z-10 w-48 h-48 sm:w-56 sm:h-56 rounded-full flex flex-col items-center justify-center cursor-pointer transition-transform duration-75 bg-gradient-to-br ${
                themeConfig.buttonGlow
              } ${isPressing ? 'scale-92 shadow-inner' : 'scale-100 shadow-2xl hover:scale-102'}`}
            >
              <div className="text-[11px] font-sans opacity-85 uppercase tracking-wider mb-1 text-white">
                اضغط أو اضغط المسافة
              </div>
              <div className="font-mono text-5xl sm:text-6xl font-bold tracking-tight text-white">
                {count}
              </div>
              <div className="text-xs opacity-90 mt-1 text-amber-200">
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
          className="flex items-center gap-1.5 px-6 py-2.5 rounded-xl bg-gradient-to-r from-amber-700 to-amber-800 hover:from-amber-600 hover:to-amber-700 text-white text-xs sm:text-sm font-bold transition-all cursor-pointer shadow-md hover:shadow-lg active:scale-95"
        >
          <Heart className="w-4 h-4 fill-current text-rose-300" />
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
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-stone-900/60 backdrop-blur-xs animate-in fade-in"
        >
          <div
            onClick={(e) => e.stopPropagation()}
            className="w-full max-w-sm rounded-3xl bg-white dark:bg-stone-900 border border-stone-200 dark:border-stone-800 p-6 text-right space-y-4 shadow-2xl"
          >
            <div className="flex items-center justify-between border-b border-stone-100 dark:border-stone-800 pb-3">
              <span className="font-amiri text-lg font-bold text-stone-900 dark:text-stone-100">
                إهداء ثواب {count} تسبيحة
              </span>
              <button
                onClick={() => setShowDedicateChoice(false)}
                className="text-stone-400 hover:text-stone-600"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <p className="text-xs text-stone-600 dark:text-stone-300 leading-relaxed font-amiri">
              اختر لمن تحب أن تهدي ثواب هذا العمل المبارك:
            </p>

            <div className="space-y-2">
              <button
                type="button"
                onClick={() => handleDedicateCount('all')}
                className="w-full p-3 rounded-2xl border border-amber-500/40 bg-amber-500/10 hover:bg-amber-500/20 text-amber-900 dark:text-amber-200 text-xs font-bold transition-all text-right flex items-center justify-between"
              >
                <span>جميع الأرواح الكريمة لعائلة الشهاوي</span>
                <Heart className="w-4 h-4 text-amber-600" />
              </button>

              <button
                type="button"
                onClick={() => handleDedicateCount('owner')}
                className="w-full p-3 rounded-2xl border border-amber-600/30 bg-stone-50 dark:bg-stone-800 hover:bg-stone-100 text-stone-800 dark:text-stone-200 text-xs font-bold transition-all text-right flex items-center justify-between"
              >
                <span>صاحب ومُنشئ المنصة</span>
                <Sparkles className="w-4 h-4 text-amber-500" />
              </button>

              {profile.closestRelative && (
                <button
                  type="button"
                  onClick={() => handleDedicateCount('closest')}
                  className="w-full p-3 rounded-2xl border border-rose-500/40 bg-rose-500/10 hover:bg-rose-500/20 text-rose-900 dark:text-rose-200 text-xs font-bold transition-all text-right flex items-center justify-between"
                >
                  <span>طرفك الأقرب: {profile.closestRelative}</span>
                  <Heart className="w-4 h-4 text-rose-600" />
                </button>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Custom Target Modal */}
      {showCustomTargetModal && (
        <div
          onClick={() => setShowCustomTargetModal(false)}
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-stone-900/60 backdrop-blur-xs animate-in fade-in"
        >
          <div
            onClick={(e) => e.stopPropagation()}
            className="w-full max-w-sm rounded-3xl bg-white dark:bg-stone-900 border border-amber-500/30 p-6 text-right space-y-4 shadow-2xl"
          >
            <div className="flex items-center justify-between border-b border-stone-100 dark:border-stone-800 pb-3">
              <span className="font-amiri text-lg font-bold text-stone-900 dark:text-stone-100 flex items-center gap-1.5">
                <Target className="w-4 h-4 text-amber-600" />
                <span>تحديد هدف تسبيح مخصص</span>
              </span>
              <button
                onClick={() => setShowCustomTargetModal(false)}
                className="text-stone-400 hover:text-stone-600"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleSetCustomTarget} className="space-y-4">
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-stone-700 dark:text-stone-300 block">
                  أدخل عدد التسبيحات المستهدف:
                </label>
                <input
                  type="number"
                  min="1"
                  max="100000"
                  required
                  value={customTargetInput}
                  onChange={(e) => setCustomTargetInput(e.target.value)}
                  placeholder="مثال: 70 أو 313 أو 500"
                  className="w-full px-3.5 py-2.5 rounded-xl border border-stone-200 dark:border-stone-700 bg-stone-50 dark:bg-stone-800 text-stone-900 dark:text-stone-100 font-mono text-center text-lg font-bold focus:border-amber-500 focus:outline-hidden"
                />
              </div>

              <div className="flex items-center gap-2 pt-1">
                <button
                  type="button"
                  onClick={() => setShowCustomTargetModal(false)}
                  className="flex-1 py-2 rounded-xl text-xs font-semibold text-stone-600 dark:text-stone-400 hover:bg-stone-100 dark:hover:bg-stone-800"
                >
                  إلغاء
                </button>
                <button
                  type="submit"
                  className="flex-1 py-2 rounded-xl bg-amber-800 hover:bg-amber-900 text-white text-xs font-bold shadow-md"
                >
                  حفظ الهدف
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Add Custom Dhikr Modal */}
      {showAddModal && (
        <div
          onClick={() => setShowAddModal(false)}
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-stone-900/60 backdrop-blur-xs animate-in fade-in"
        >
          <div
            onClick={(e) => e.stopPropagation()}
            className="w-full max-w-md rounded-3xl bg-white dark:bg-stone-900 border border-stone-200 dark:border-stone-800 p-6 text-right space-y-4 shadow-2xl"
          >
            <div className="flex items-center justify-between border-b border-stone-100 dark:border-stone-800 pb-3">
              <span className="font-amiri text-lg font-bold text-stone-900 dark:text-stone-100">
                إضافة ذكر أو دعاء جديد للسبحة
              </span>
              <button
                onClick={() => setShowAddModal(false)}
                className="text-stone-400 hover:text-stone-600"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleAddCustomDhikr} className="space-y-4 text-xs">
              <div className="space-y-1">
                <label className="font-bold text-stone-700 dark:text-stone-300 block">
                  نص الذكر المبارك:
                </label>
                <input
                  type="text"
                  required
                  value={customText}
                  onChange={(e) => setCustomText(e.target.value)}
                  placeholder="مثال: يَا حَيُّ يَا قَيُّومُ بِرَحْمَتِكَ أَسْتَغِيثُ"
                  className="w-full p-2.5 rounded-xl border border-stone-200 dark:border-stone-700 bg-stone-50 dark:bg-stone-800 text-stone-900 dark:text-stone-100 text-xs focus:border-amber-500 focus:outline-hidden"
                />
              </div>

              <div className="space-y-1">
                <label className="font-bold text-stone-700 dark:text-stone-300 block">
                  العدد المستهدف بالجلسة:
                </label>
                <input
                  type="number"
                  min="1"
                  max="10000"
                  value={customTarget}
                  onChange={(e) => setCustomTarget(Number(e.target.value))}
                  className="w-full p-2.5 rounded-xl border border-stone-200 dark:border-stone-700 bg-stone-50 dark:bg-stone-800 text-stone-900 dark:text-stone-100 text-xs focus:border-amber-500 focus:outline-hidden"
                />
              </div>

              <div className="space-y-1">
                <label className="font-bold text-stone-700 dark:text-stone-300 block">
                  الفضل أو المناسبة (اختياري):
                </label>
                <input
                  type="text"
                  value={customVirtue}
                  onChange={(e) => setCustomVirtue(e.target.value)}
                  placeholder="مثال: دعاء الكرب وتفريج الهموم"
                  className="w-full p-2.5 rounded-xl border border-stone-200 dark:border-stone-700 bg-stone-50 dark:bg-stone-800 text-stone-900 dark:text-stone-100 text-xs focus:border-amber-500 focus:outline-hidden"
                />
              </div>

              <div className="flex items-center gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setShowAddModal(false)}
                  className="flex-1 py-2.5 rounded-xl text-xs font-semibold text-stone-600 dark:text-stone-400 hover:bg-stone-100 dark:hover:bg-stone-800"
                >
                  إلغاء
                </button>
                <button
                  type="submit"
                  className="flex-1 py-2.5 rounded-xl bg-amber-800 hover:bg-amber-900 text-white text-xs font-bold shadow-md"
                >
                  إضافة الذكر
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Reset Total Lifetime Confirmation Modal */}
      {showResetConfirm && (
        <div
          onClick={() => setShowResetConfirm(false)}
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-stone-900/60 backdrop-blur-xs animate-in fade-in"
        >
          <div
            onClick={(e) => e.stopPropagation()}
            className="w-full max-w-sm rounded-3xl bg-white dark:bg-stone-900 border border-red-500/30 p-6 text-center space-y-4 shadow-2xl"
          >
            <div className="w-12 h-12 rounded-full bg-red-100 dark:bg-red-950/60 text-red-600 mx-auto flex items-center justify-center">
              <Trash2 className="w-6 h-6" />
            </div>

            <h3 className="font-amiri text-xl font-bold text-stone-900 dark:text-stone-100">
              تصفير المجموع الإجمالي؟
            </h3>

            <p className="text-xs text-stone-600 dark:text-stone-400 leading-relaxed">
              هل أنت متأكد من رغبتك في تصفير عداد المجموع الإجمالي ({totalLifetimeCount} تسبيحة) والبدء من الصفر؟ لا يمكن التراجع عن هذا الإجراء.
            </p>

            <div className="flex items-center gap-2 pt-2">
              <button
                type="button"
                onClick={() => setShowResetConfirm(false)}
                className="flex-1 py-2.5 rounded-xl text-xs font-semibold text-stone-600 dark:text-stone-400 hover:bg-stone-100 dark:hover:bg-stone-800"
              >
                إلغاء
              </button>
              <button
                type="button"
                onClick={handleResetTotalLifetime}
                className="flex-1 py-2.5 rounded-xl bg-red-600 hover:bg-red-700 text-white text-xs font-bold shadow-md"
              >
                نعم، تصفير العداد
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Notification Settings Modal */}
      <NotificationSettingsModal
        isOpen={showNotificationModal}
        onClose={() => setShowNotificationModal(false)}
      />

      {/* Floating Sebha Info Modal */}
      <FloatingSebhaInfoModal
        isOpen={showFloatingInfoModal}
        onClose={() => setShowFloatingInfoModal(false)}
        onOpenNotifications={() => setShowNotificationModal(true)}
      />
    </div>
  );
};
