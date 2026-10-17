import React, { useState, useEffect, useMemo } from 'react';
import {
  Clock,
  MapPin,
  Sparkles,
  Volume2,
  VolumeX,
  Calendar,
  LocateFixed,
  RefreshCw,
  Bell,
  BellOff,
  Compass,
  Check,
  ShieldCheck,
  Play,
  Square,
  ChevronRight,
  Sun,
  Moon,
  Sunrise,
  Sunset,
  Info
} from 'lucide-react';
import {
  POPULAR_CITIES,
  CALCULATION_METHODS,
  ADHAN_VOICES,
  PrayerTimesResult,
  AdhanVoice,
} from '../utils/prayerTimes';
import { prayerTimesService, PrayerSettings } from '../services/prayerTimesService';
import { CustomSelect } from '../components/CustomSelect';

export const PrayerTimesPage: React.FC = () => {
  const [prayerTimes, setPrayerTimes] = useState<PrayerTimesResult>(() => prayerTimesService.getPrayerTimes());
  const [settings, setSettings] = useState<PrayerSettings>(() => prayerTimesService.getSettings());
  const [isAdhanPlaying, setIsAdhanPlaying] = useState<boolean>(prayerTimesService.isAdhanPlaying());
  const [activeVoice, setActiveVoice] = useState<AdhanVoice | null>(prayerTimesService.getPlayingVoice());
  const [locationStatus, setLocationStatus] = useState<string | null>(null);
  const [isLocating, setIsLocating] = useState<boolean>(false);
  const [isRefreshing, setIsRefreshing] = useState<boolean>(false);

  useEffect(() => {
    const unsubTimes = prayerTimesService.subscribe((res, setts) => {
      setPrayerTimes(res);
      setSettings(setts);
    });

    const unsubAdhan = prayerTimesService.subscribeAdhan((playing, voice) => {
      setIsAdhanPlaying(playing);
      setActiveVoice(voice);
    });

    return () => {
      unsubTimes();
      unsubAdhan();
    };
  }, []);

  const activeLocation = useMemo(() => {
    return prayerTimesService.getActiveLocation();
  }, [settings]);

  // Handle City Selection
  const handleSelectCity = async (cityId: string) => {
    await prayerTimesService.setCity(cityId);
  };

  // Handle Calculation Method Selection
  const handleSelectMethod = async (methodId: number) => {
    await prayerTimesService.setMethod(methodId);
  };

  // High Accuracy GPS Detection
  const handleDetectGPS = async () => {
    setIsLocating(true);
    setLocationStatus('جاري تحديد موقعك الجغرافي بدقة عبر GPS والأقمار الصناعية...');
    const res = await prayerTimesService.detectGPSLocation();
    setIsLocating(false);

    if (res.success) {
      setLocationStatus(`تم تحديد موقعك بدقة: ${res.label} وتحديث المواقيت عبر AlAdhan 🤲`);
      setTimeout(() => setLocationStatus(null), 4000);
    } else {
      setLocationStatus(res.error || 'تعذر تحديد الموقع الجغرافي');
      setTimeout(() => setLocationStatus(null), 5000);
    }
  };

  // Manual Refresh
  const handleRefresh = async () => {
    setIsRefreshing(true);
    await prayerTimesService.refresh();
    setIsRefreshing(false);
    setLocationStatus('تم تحديث المواقيت بنجاح من AlAdhan API 🤲');
    setTimeout(() => setLocationStatus(null), 3000);
  };

  // Adhan Toggle
  const handleToggleAdhan = (voiceId?: string) => {
    prayerTimesService.playAdhan(voiceId);
  };

  // Toggle Auto-sound
  const handleToggleAutoSound = () => {
    const newVal = !settings.enableAdhanSound;
    prayerTimesService.setEnableAdhanSound(newVal);
    setLocationStatus(newVal ? 'تم تفعيل صوت الأذان التلقائي عند دخول الوقت 🔊' : 'تم كتم الأذان التلقائي 🔇');
    setTimeout(() => setLocationStatus(null), 3000);
  };

  // Toggle Notifications
  const handleToggleNotifications = async () => {
    const newVal = !settings.enableNotifications;
    const permitted = await prayerTimesService.setEnableNotifications(newVal);
    if (newVal && !permitted) {
      setLocationStatus('لم يتم منح إذن الإشعارات من المتصفح');
    } else {
      setLocationStatus(newVal ? 'تم تفعيل إشعارات موعد الصلاة 🔔' : 'تم تعطيل إشعارات موعد الصلاة');
    }
    setTimeout(() => setLocationStatus(null), 3000);
  };

  // City Options
  const cityOptions = useMemo(() => {
    return POPULAR_CITIES.map((c) => ({
      value: c.id,
      label: c.name,
      sublabel: `${c.country} ${c.region ? `• ${c.region}` : ''}`,
    }));
  }, []);

  // Method Options
  const methodOptions = useMemo(() => {
    return CALCULATION_METHODS.map((m) => ({
      value: m.id,
      label: m.name,
      badge: `فجر: ${m.fajrAngle}° | عشاء: ${m.ishaAngle}°`,
    }));
  }, []);

  // Adhan Voices Options
  const adhanVoiceOptions = useMemo(() => {
    return ADHAN_VOICES.map((v) => ({
      value: v.id,
      label: v.name,
      sublabel: `${v.country} (${v.durationApprox})`,
    }));
  }, []);

  const currentPrayerId = prayerTimes.currentPrayer?.id;
  const nextPrayerId = prayerTimes.nextPrayer.id;

  const prayerCards = [
    {
      id: 'fajr',
      name: 'صلاة الفجر',
      icon: Sunrise,
      time: prayerTimes.fajr,
      time24: prayerTimes.fajr24,
      isNext: nextPrayerId === 'fajr',
      isCurrent: currentPrayerId === 'fajr',
      desc: 'أولى فرائض اليوم المبارك',
    },
    {
      id: 'sunrise',
      name: 'الشروق',
      icon: Sun,
      time: prayerTimes.sunrise,
      time24: prayerTimes.sunrise24,
      isNext: nextPrayerId === 'sunrise',
      isCurrent: currentPrayerId === 'sunrise',
      desc: 'نهاية وقت الفجر وبداية الإشراق',
    },
    {
      id: 'dhuhr',
      name: 'صلاة الظهر',
      icon: Sun,
      time: prayerTimes.dhuhr,
      time24: prayerTimes.dhuhr24,
      isNext: nextPrayerId === 'dhuhr',
      isCurrent: currentPrayerId === 'dhuhr',
      desc: 'عند زوال الشمس عن كبد السماء',
    },
    {
      id: 'asr',
      name: 'صلاة العصر',
      icon: Sun,
      time: prayerTimes.asr,
      time24: prayerTimes.asr24,
      isNext: nextPrayerId === 'asr',
      isCurrent: currentPrayerId === 'asr',
      desc: 'الصلاة الوسطى المباركة',
    },
    {
      id: 'maghrib',
      name: 'صلاة المغرب',
      icon: Sunset,
      time: prayerTimes.maghrib,
      time24: prayerTimes.maghrib24,
      isNext: nextPrayerId === 'maghrib',
      isCurrent: currentPrayerId === 'maghrib',
      desc: 'مع غروب الشمس وموعد الإفطار',
    },
    {
      id: 'isha',
      name: 'صلاة العشاء',
      icon: Moon,
      time: prayerTimes.isha,
      time24: prayerTimes.isha24,
      isNext: nextPrayerId === 'isha',
      isCurrent: currentPrayerId === 'isha',
      desc: 'خاتمة الفرائض اليومية وقيام الليل',
    },
  ];

  return (
    <div className="max-w-6xl mx-auto px-3 sm:px-6 py-4 sm:py-6 space-y-6 text-right animate-in fade-in duration-200 select-none" dir="rtl">
      
      {/* Hero Header with Liquid Glass Banner */}
      <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-[#0c2419] via-[#093522] to-[#121c16] text-white p-6 sm:p-8 shadow-2xl border border-emerald-500/25">
        <div className="absolute top-0 right-0 w-96 h-96 bg-amber-500/10 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute bottom-0 left-0 w-80 h-80 bg-emerald-500/10 rounded-full blur-3xl pointer-events-none" />

        <div className="relative z-10 flex flex-col lg:flex-row items-start lg:items-center justify-between gap-6">
          <div className="space-y-3 max-w-xl">
            <div className="flex flex-wrap items-center gap-2">
              <span className="w-10 h-10 rounded-2xl bg-amber-500/20 border border-amber-400/30 flex items-center justify-center text-amber-300 shadow-inner">
                <Clock className="w-5 h-5" />
              </span>
              <span className="px-3 py-1 rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-400/30 text-xs font-bold inline-flex items-center gap-1.5">
                <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
                <span>{prayerTimes.sourceLabel}</span>
              </span>
              <span className="px-3 py-1 rounded-full bg-black/40 text-stone-300 border border-white/10 text-xs font-medium">
                توقيت محلي دقيق · ١٢ ساعة
              </span>
            </div>

            <h1 className="font-amiri text-3xl sm:text-4xl lg:text-5xl font-bold tracking-tight text-white leading-tight">
              مواقيت الصلاة والأذان
            </h1>

            <p className="text-stone-300 text-xs sm:text-sm font-sans leading-relaxed">
              مواقيت شرعية موثقة من AlAdhan API حسب إحداثيات موقعك ومحافظتك بدقة متناهية، مع التحديث اللحظي للعد التنازلي وسماع الأذان العذب.
            </p>
          </div>

          {/* Hijri & Gregorian Date Card */}
          <div className="bg-black/40 border border-amber-500/30 backdrop-blur-md rounded-2xl p-5 text-center sm:text-right shrink-0 min-w-[240px] shadow-lg">
            <div className="flex items-center justify-center sm:justify-start gap-1.5 text-amber-300 text-xs font-bold mb-2">
              <Calendar className="w-4 h-4 text-amber-400" />
              <span>التاريخ المبارك</span>
            </div>

            <div className="font-amiri text-xl font-bold text-amber-100 mb-1 leading-snug">
              {prayerTimes.hijriDate.fullFormatted}
            </div>

            <div className="text-xs text-stone-300 font-sans flex items-center justify-center sm:justify-start gap-1">
              <span>{prayerTimes.gregorianDate.formatted}</span>
            </div>

            <div className="mt-3 pt-2.5 border-t border-white/10 flex items-center justify-between text-[11px] text-stone-400">
              <span>المنطقة الزمنية:</span>
              <span className="font-mono text-amber-300/90 font-bold">{prayerTimes.timezone}</span>
            </div>
          </div>
        </div>
      </div>

      {/* Unified Location & Calculation Settings Bar */}
      <div className="p-4 sm:p-6 rounded-3xl bg-white dark:bg-stone-900 border border-stone-200 dark:border-stone-800 shadow-md space-y-4">
        <div className="flex flex-col lg:flex-row items-stretch lg:items-center justify-between gap-4">
          
          {/* City Selection */}
          <div className="flex-1">
            <label className="block text-xs font-bold text-stone-700 dark:text-stone-300 mb-1.5 flex items-center gap-1.5">
              <MapPin className="w-3.5 h-3.5 text-amber-600 dark:text-amber-400" />
              <span>اختر المحافظة أو المدينة:</span>
            </label>
            <CustomSelect<string>
              value={settings.customCoords ? 'custom' : settings.cityId}
              onChange={(newCityId) => handleSelectCity(newCityId)}
              options={
                settings.customCoords
                  ? [
                      { value: 'custom', label: settings.customCoords.label, sublabel: 'إحداثيات GPS المحددة' },
                      ...cityOptions,
                    ]
                  : cityOptions
              }
              placeholder="ابحث عن المحافظة أو المدينة..."
              searchable
              searchPlaceholder="اكتب اسم محافظتك (القاهرة، المنصورة، الإسكندرية...)"
            />
          </div>

          {/* Method Selection */}
          <div className="flex-1">
            <label className="block text-xs font-bold text-stone-700 dark:text-stone-300 mb-1.5 flex items-center gap-1.5">
              <ShieldCheck className="w-3.5 h-3.5 text-amber-600 dark:text-amber-400" />
              <span>طريقة الحساب الفقهية:</span>
            </label>
            <CustomSelect<number>
              value={settings.methodId}
              onChange={(newMethod) => handleSelectMethod(newMethod)}
              options={methodOptions}
              placeholder="اختر طريقة الحساب..."
            />
          </div>

          {/* GPS Quick Action */}
          <div className="flex flex-col justify-end pt-0 lg:pt-5">
            <button
              type="button"
              onClick={handleDetectGPS}
              disabled={isLocating}
              className="flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl bg-amber-500/15 hover:bg-amber-500/25 border border-amber-500/30 text-amber-900 dark:text-amber-300 font-bold text-xs transition-colors cursor-pointer active:scale-95 disabled:opacity-50"
              title="تحديد موقعك الجغرافي الدقيق عبر GPS"
            >
              <LocateFixed className={`w-4 h-4 text-amber-600 dark:text-amber-400 ${isLocating ? 'animate-spin' : ''}`} />
              <span>{isLocating ? 'جاري التحديد...' : 'موقعي عبر GPS'}</span>
            </button>
          </div>

          {/* Refresh Action */}
          <div className="flex flex-col justify-end pt-0 lg:pt-5">
            <button
              type="button"
              onClick={handleRefresh}
              disabled={isRefreshing}
              className="flex items-center justify-center gap-1.5 px-3.5 py-2.5 rounded-xl bg-stone-100 dark:bg-stone-800 hover:bg-stone-200 dark:hover:bg-stone-700 border border-stone-200 dark:border-stone-700 text-stone-700 dark:text-stone-300 font-bold text-xs transition-colors cursor-pointer active:scale-95 disabled:opacity-50"
              title="إعادة جلب المواقيت من AlAdhan API"
            >
              <RefreshCw className={`w-4 h-4 ${isRefreshing ? 'animate-spin text-amber-600' : ''}`} />
              <span className="hidden sm:inline">تحديث</span>
            </button>
          </div>
        </div>

        {/* Status Line */}
        <div className="flex flex-wrap items-center justify-between gap-3 pt-3 border-t border-stone-200/80 dark:border-stone-800 text-xs">
          <div className="flex items-center gap-2 text-stone-700 dark:text-stone-300 font-medium">
            <MapPin className="w-3.5 h-3.5 text-amber-600 dark:text-amber-400 shrink-0" />
            <span>الموقع المعتمد:</span>
            <span className="font-bold text-stone-900 dark:text-stone-100">{activeLocation.name}</span>
            <span className="text-stone-500 dark:text-stone-400">({activeLocation.country})</span>
          </div>

          <div className="flex items-center gap-4 text-stone-600 dark:text-stone-400 text-xs">
            <span className="inline-flex items-center gap-1.5">
              <Compass className="w-3.5 h-3.5 text-amber-600 dark:text-amber-400" />
              <span>اتجاه القبلة:</span>
              <strong className="font-mono text-stone-900 dark:text-stone-100">{prayerTimes.qiblaDegrees}°</strong>
            </span>
            <span className="text-stone-300 dark:text-stone-700">|</span>
            <span className="inline-flex items-center gap-1.5">
              <span className={`w-2 h-2 rounded-full ${prayerTimes.source === 'api' ? 'bg-emerald-500' : 'bg-amber-500'}`} />
              <span>{prayerTimes.sourceLabel}</span>
            </span>
          </div>
        </div>
      </div>

      {locationStatus && (
        <div className="p-3.5 rounded-2xl bg-amber-500/10 border border-amber-500/30 text-amber-900 dark:text-amber-200 text-xs text-center animate-in fade-in flex items-center justify-center gap-2 shadow-xs">
          <Sparkles className="w-4 h-4 text-amber-600 dark:text-amber-400 shrink-0" />
          <span className="font-medium">{locationStatus}</span>
        </div>
      )}

      {/* Next Prayer Live Countdown Hero Card */}
      <div className="p-6 sm:p-7 rounded-3xl bg-gradient-to-br from-amber-850 via-amber-900 to-stone-950 text-white shadow-xl relative overflow-hidden border border-amber-500/30">
        <div className="absolute top-0 right-0 w-72 h-72 bg-emerald-500/10 rounded-full blur-2xl pointer-events-none" />

        <div className="relative z-10 flex flex-col md:flex-row items-center justify-between gap-6">
          <div className="space-y-2 text-center md:text-right">
            <div className="flex items-center justify-center md:justify-start gap-2 text-xs text-amber-300 font-semibold">
              <span className="w-2.5 h-2.5 rounded-full bg-emerald-400 animate-pulse" />
              <span>الأذان القادم بإذن الله:</span>
            </div>

            <div className="font-amiri text-4xl sm:text-5xl font-bold text-amber-100">
              {prayerTimes.nextPrayer.arabicName}
            </div>

            <div className="flex items-center justify-center md:justify-start gap-3 text-xs text-amber-200/90 font-mono">
              <span>موعد الأذان: <strong className="text-white text-sm">{prayerTimes.nextPrayer.time}</strong></span>
              <span>·</span>
              <span className="font-sans text-stone-300">
                {prayerTimes.currentPrayer ? `(بعد انقضاء صلاة ${prayerTimes.currentPrayer.arabicName})` : ''}
              </span>
            </div>
          </div>

          {/* Countdown & Quick Audio Action */}
          <div className="flex flex-col sm:flex-row items-center gap-4">
            <div className="bg-black/50 px-6 py-4 rounded-2xl border border-white/15 backdrop-blur-md text-center min-w-[200px]">
              <span className="text-xs text-amber-300 font-medium block mb-1">الوقت المتبقي للأذان:</span>
              <span className="font-mono text-2xl sm:text-3xl font-bold text-white tracking-wide block">
                {prayerTimes.nextPrayer.remainingFormatted}
              </span>

              {/* Progress bar */}
              <div className="mt-3 w-full bg-stone-800 rounded-full h-1.5 overflow-hidden">
                <div
                  className="bg-gradient-to-r from-amber-500 to-emerald-400 h-1.5 rounded-full transition-all duration-1000"
                  style={{ width: `${prayerTimes.nextPrayer.progressPercent}%` }}
                />
              </div>
            </div>

            <button
              onClick={() => handleToggleAdhan()}
              className={`flex items-center justify-center gap-2 px-5 py-4 rounded-2xl font-bold text-xs transition-all shadow-lg cursor-pointer active:scale-95 ${
                isAdhanPlaying
                  ? 'bg-rose-600 hover:bg-rose-700 text-white animate-pulse'
                  : 'bg-gradient-to-r from-emerald-600 to-emerald-700 hover:from-emerald-500 hover:to-emerald-600 text-white'
              }`}
              title={isAdhanPlaying ? 'إيقاف تشغيل الأذان' : 'الاستماع لصوت الأذان المبارك'}
            >
              {isAdhanPlaying ? (
                <>
                  <Square className="w-4 h-4 fill-white" />
                  <span>إيقاف الأذان</span>
                </>
              ) : (
                <>
                  <Volume2 className="w-4 h-4" />
                  <span>سماع الأذان الآن</span>
                </>
              )}
            </button>
          </div>
        </div>
      </div>

      {/* Main 6 Obligatory Prayers Grid (Strict 12-Hour System) */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3 sm:gap-4">
        {prayerCards.map((p) => {
          const IconComp = p.icon;
          return (
            <div
              key={p.id}
              className={`p-4 rounded-2xl border transition-all text-center space-y-2 relative overflow-hidden ${
                p.isNext
                  ? 'bg-amber-500/10 dark:bg-amber-950/40 border-amber-500 shadow-xl ring-2 ring-amber-500/40 scale-102'
                  : p.isCurrent
                  ? 'bg-emerald-500/10 dark:bg-emerald-950/40 border-emerald-500/50 shadow-md'
                  : 'bg-white dark:bg-stone-900 border-stone-200 dark:border-stone-800 shadow-xs hover:border-amber-400/40'
              }`}
            >
              {p.isNext && (
                <div className="absolute top-0 right-0 left-0 h-1 bg-gradient-to-r from-amber-500 to-emerald-400" />
              )}

              <div className="w-9 h-9 mx-auto rounded-xl flex items-center justify-center bg-amber-500/10 dark:bg-stone-800 text-amber-600 dark:text-amber-400">
                <IconComp className="w-4 h-4" />
              </div>

              <div className={`text-xs font-bold ${p.isNext ? 'text-amber-900 dark:text-amber-300' : 'text-stone-800 dark:text-stone-200'}`}>
                {p.name}
              </div>
              
              <span className="font-mono text-xl font-bold text-stone-900 dark:text-stone-100 block tracking-tight">
                {p.time}
              </span>

              {p.isNext ? (
                <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-amber-500/20 text-amber-900 dark:text-amber-300 inline-block shadow-2xs">
                  الأذان القادم 🔔
                </span>
              ) : p.isCurrent ? (
                <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-900 dark:text-emerald-300 inline-block shadow-2xs">
                  الوقت الحالي 🌿
                </span>
              ) : (
                <span className="text-[10px] text-stone-400 dark:text-stone-500 block font-sans">
                  {p.desc}
                </span>
              )}
            </div>
          );
        })}
      </div>

      {/* Secondary Islamic Timings Strip */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
        <div className="p-4 rounded-2xl bg-white dark:bg-stone-900 border border-stone-200 dark:border-stone-800 shadow-xs flex items-center justify-between">
          <div>
            <div className="text-xs font-bold text-stone-700 dark:text-stone-300">وقت الإمساك</div>
            <div className="text-[11px] text-stone-500">قبل الفجر بـ ١٠ دقائق لصيام التطوع والفرض</div>
          </div>
          <span className="font-mono text-base font-bold text-amber-800 dark:text-amber-400">{prayerTimes.imsak}</span>
        </div>

        <div className="p-4 rounded-2xl bg-white dark:bg-stone-900 border border-stone-200 dark:border-stone-800 shadow-xs flex items-center justify-between">
          <div>
            <div className="text-xs font-bold text-stone-700 dark:text-stone-300">منتصف الليل الشرعي</div>
            <div className="text-[11px] text-stone-500">نهاية وقت العشاء الاختياري وبدء جوف الليل</div>
          </div>
          <span className="font-mono text-base font-bold text-amber-800 dark:text-amber-400">{prayerTimes.midnight}</span>
        </div>

        <div className="p-4 rounded-2xl bg-white dark:bg-stone-900 border border-stone-200 dark:border-stone-800 shadow-xs flex items-center justify-between">
          <div>
            <div className="text-xs font-bold text-stone-700 dark:text-stone-300">الثلث الأخير من الليل</div>
            <div className="text-[11px] text-stone-500">وقت التنزل الإلهي وقيام الليل وإجابة الدعاء</div>
          </div>
          <span className="font-mono text-base font-bold text-amber-800 dark:text-amber-400">{prayerTimes.lastThird}</span>
        </div>
      </div>

      {/* Adhan Audio & Notifications Management Console */}
      <div className="p-5 sm:p-6 rounded-3xl bg-white dark:bg-stone-900 border border-stone-200 dark:border-stone-800 shadow-md space-y-5">
        <div className="flex items-center justify-between pb-3 border-b border-stone-200 dark:border-stone-800">
          <div className="flex items-center gap-2">
            <span className="w-8 h-8 rounded-xl bg-amber-500/15 flex items-center justify-center text-amber-600 dark:text-amber-400">
              <Volume2 className="w-4 h-4" />
            </span>
            <div>
              <h2 className="text-sm font-bold text-stone-900 dark:text-stone-100">
                إعدادات الأذان والتنبيهات المباشرة
              </h2>
              <p className="text-[11px] text-stone-500">
                اختر صوت المؤذن المحبب إلى قلبك، وفعل التنبيه الصوتي أو إشعارات النظام عند حلول وقت الصلاة.
              </p>
            </div>
          </div>

          {isAdhanPlaying && (
            <span className="px-3 py-1 rounded-full bg-emerald-500/20 text-emerald-600 dark:text-emerald-400 border border-emerald-400/30 text-xs font-bold flex items-center gap-1.5 animate-pulse">
              <span className="w-2 h-2 rounded-full bg-emerald-500" />
              <span>جاري تشغيل الأذان: {activeVoice?.name}</span>
            </span>
          )}
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          
          {/* Adhan Voice Selector */}
          <div className="space-y-1.5">
            <label className="block text-xs font-bold text-stone-700 dark:text-stone-300">
              صوت المؤذن المعتمد للأذان:
            </label>
            <CustomSelect<string>
              value={settings.selectedAdhanVoice}
              onChange={(newVoiceId) => prayerTimesService.setAdhanVoice(newVoiceId)}
              options={adhanVoiceOptions}
              placeholder="اختر المؤذن..."
            />
          </div>

          {/* Auto Sound Toggle */}
          <div className="p-3.5 rounded-2xl bg-stone-50 dark:bg-stone-800/60 border border-stone-200 dark:border-stone-700 flex items-center justify-between">
            <div className="space-y-0.5">
              <div className="text-xs font-bold text-stone-800 dark:text-stone-200">
                تشغيل صوت الأذان تلقائياً
              </div>
              <div className="text-[11px] text-stone-500">
                تشغيل الأذان عند دخول موعد الصلاة
              </div>
            </div>
            <button
              onClick={handleToggleAutoSound}
              className={`w-12 h-6 rounded-full transition-colors relative cursor-pointer ${
                settings.enableAdhanSound ? 'bg-emerald-600' : 'bg-stone-300 dark:bg-stone-700'
              }`}
            >
              <span
                className={`w-4 h-4 rounded-full bg-white absolute top-1 transition-all ${
                  settings.enableAdhanSound ? 'left-1' : 'right-1'
                }`}
              />
            </button>
          </div>

          {/* Browser Notifications Toggle */}
          <div className="p-3.5 rounded-2xl bg-stone-50 dark:bg-stone-800/60 border border-stone-200 dark:border-stone-700 flex items-center justify-between">
            <div className="space-y-0.5">
              <div className="text-xs font-bold text-stone-800 dark:text-stone-200">
                إشعارات موعد الأذان
              </div>
              <div className="text-[11px] text-stone-500">
                إرسال إشعار فوري عند دخول الوقت
              </div>
            </div>
            <button
              onClick={handleToggleNotifications}
              className={`w-12 h-6 rounded-full transition-colors relative cursor-pointer ${
                settings.enableNotifications ? 'bg-emerald-600' : 'bg-stone-300 dark:bg-stone-700'
              }`}
            >
              <span
                className={`w-4 h-4 rounded-full bg-white absolute top-1 transition-all ${
                  settings.enableNotifications ? 'left-1' : 'right-1'
                }`}
              />
            </button>
          </div>
        </div>

        {/* Play & Preview Voice Button */}
        <div className="pt-2 flex flex-wrap items-center justify-between gap-3">
          <div className="flex items-center gap-2">
            <button
              onClick={() => handleToggleAdhan()}
              className="flex items-center gap-2 px-4 py-2 rounded-xl bg-amber-600 hover:bg-amber-700 text-white font-bold text-xs transition shadow-xs cursor-pointer active:scale-95"
            >
              {isAdhanPlaying ? <Square className="w-3.5 h-3.5 fill-white" /> : <Play className="w-3.5 h-3.5 fill-white" />}
              <span>{isAdhanPlaying ? 'إيقاف التجربة' : 'تجربة صوت المؤذن المختار'}</span>
            </button>
          </div>

          <div className="flex items-center gap-2 text-stone-500 text-xs">
            <Volume2 className="w-3.5 h-3.5" />
            <span>مستوى الصوت:</span>
            <input
              type="range"
              min="0.1"
              max="1"
              step="0.05"
              value={settings.volume}
              onChange={(e) => prayerTimesService.setVolume(parseFloat(e.target.value))}
              className="w-24 accent-amber-600 cursor-pointer"
            />
            <span className="font-mono text-stone-700 dark:text-stone-300 text-xs font-bold">
              {Math.round(settings.volume * 100)}%
            </span>
          </div>
        </div>
      </div>

    </div>
  );
};
