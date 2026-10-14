import React, { useState, useEffect, useMemo } from 'react';
import {
  Clock,
  MapPin,
  Sparkles,
  Volume2,
  Calendar,
  LocateFixed,
  RefreshCw,
  Check
} from 'lucide-react';
import {
  POPULAR_CITIES,
  CALCULATION_METHODS,
  PrayerTimesResult
} from '../utils/prayerTimes';
import { prayerTimesService, PrayerSettings } from '../services/prayerTimesService';
import { playPeacefulChime } from '../utils/soundEffects';
import { CustomSelect } from '../components/CustomSelect';

export const PrayerTimesPage: React.FC = () => {
  const [prayerTimes, setPrayerTimes] = useState<PrayerTimesResult>(() => prayerTimesService.getPrayerTimes());
  const [settings, setSettings] = useState<PrayerSettings>(() => prayerTimesService.getSettings());
  const [locationStatus, setLocationStatus] = useState<string | null>(null);
  const [isRefreshing, setIsRefreshing] = useState<boolean>(false);

  useEffect(() => {
    return prayerTimesService.subscribe((res, setts) => {
      setPrayerTimes(res);
      setSettings(setts);
    });
  }, []);

  const activeLocation = useMemo(() => {
    return prayerTimesService.getActiveLocation();
  }, [settings]);

  const loadTimes = async (forceRefresh = false) => {
    if (forceRefresh) setIsRefreshing(true);
    await prayerTimesService.refresh();
    if (forceRefresh) {
      setIsRefreshing(false);
      setLocationStatus('تم تحديث المواقيت بنجاح 🤲');
      setTimeout(() => setLocationStatus(null), 3000);
    }
  };

  const handleSelectCity = async (cityId: string) => {
    await prayerTimesService.setCity(cityId);
  };

  const handleSelectMethod = async (methodId: number) => {
    await prayerTimesService.setMethod(methodId);
  };

  // GPS Location detection
  const handleDetectGPS = () => {
    if (!navigator.geolocation) {
      setLocationStatus('المتصفح لا يدعم تحديد الموقع الجغرافي');
      return;
    }
    setLocationStatus('جاري تحديد موقعك الجغرافي بدقة عبر GPS...');
    navigator.geolocation.getCurrentPosition(
      async (pos) => {
        const lat = pos.coords.latitude;
        const lng = pos.coords.longitude;
        const custom = { lat, lng, label: 'موقعي عبر GPS' };
        await prayerTimesService.setCustomCoords(custom);
        setLocationStatus('تم تحديد موقعك بدقة وحساب المواقيت بنجاح');
        setTimeout(() => setLocationStatus(null), 3000);
      },
      () => {
        setLocationStatus('تعذر الوصول إلى الموقع الجغرافي (تأكد من تفعيل إذن الموقع)');
        setTimeout(() => setLocationStatus(null), 4000);
      },
      { enableHighAccuracy: true, timeout: 8000 }
    );
  };

  const handlePlayTakbeerChime = () => {
    playPeacefulChime();
    setLocationStatus('الله أكبر، الله أكبر.. تقبل الله طاعتكم 🤲');
    setTimeout(() => setLocationStatus(null), 3000);
  };

  const { hijriFormatted, gregorianFormatted } = useMemo(() => {
    const now = new Date();
    let hijri = '';
    try {
      hijri = new Intl.DateTimeFormat('ar-SA-u-ca-islamic-umalqura', {
        day: 'numeric',
        month: 'long',
        year: 'numeric',
      }).format(now);
    } catch (e) {
      hijri = '';
    }

    const gregorian = new Intl.DateTimeFormat('ar-EG', {
      weekday: 'long',
      day: 'numeric',
      month: 'long',
      year: 'numeric',
    }).format(now);

    return { hijriFormatted: hijri, gregorianFormatted: gregorian };
  }, []);

  const prayerCards = [
    { id: 'fajr', name: 'صلاة الفجر', icon: '🌅', time: prayerTimes.fajr, isNext: prayerTimes.nextPrayer.id === 'fajr' },
    { id: 'sunrise', name: 'الشروق', icon: '🌄', time: prayerTimes.sunrise, isNext: prayerTimes.nextPrayer.id === 'sunrise' },
    { id: 'dhuhr', name: 'صلاة الظهر', icon: '☀️', time: prayerTimes.dhuhr, isNext: prayerTimes.nextPrayer.id === 'dhuhr' },
    { id: 'asr', name: 'صلاة العصر', icon: '🌤️', time: prayerTimes.asr, isNext: prayerTimes.nextPrayer.id === 'asr' },
    { id: 'maghrib', name: 'صلاة المغرب', icon: '🌇', time: prayerTimes.maghrib, isNext: prayerTimes.nextPrayer.id === 'maghrib' },
    { id: 'isha', name: 'صلاة العشاء', icon: '🌙', time: prayerTimes.isha, isNext: prayerTimes.nextPrayer.id === 'isha' },
  ];

  // Options for city dropdown
  const cityOptions = useMemo(() => {
    return POPULAR_CITIES.map((c) => ({
      value: c.id,
      label: c.name,
      sublabel: c.country,
    }));
  }, []);

  const methodOptions = useMemo(() => {
    return CALCULATION_METHODS.map((m) => ({
      value: m.id,
      label: m.name,
      badge: `فجر: ${m.fajrAngle}° | عشاء: ${m.ishaAngle}°`,
    }));
  }, []);

  return (
    <div className="max-w-5xl mx-auto px-3 sm:px-6 py-4 sm:py-6 space-y-6 text-right animate-in fade-in duration-200" dir="rtl">
      
      {/* Page Header */}
      <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-amber-700 via-amber-850 to-stone-900 text-white p-6 sm:p-8 shadow-xl border border-amber-600/30">
        <div className="relative z-10 flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
          <div className="space-y-2 max-w-xl">
            <div className="flex items-center gap-2">
              <span className="w-10 h-10 rounded-2xl bg-amber-500/20 border border-amber-400/30 flex items-center justify-center text-amber-300">
                <Clock className="w-5 h-5" />
              </span>
              <span className="px-3 py-1 rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-400/30 text-xs font-bold">
                تحديث حي ومباشر · نظام ١٢ ساعة
              </span>
            </div>
            <h1 className="font-amiri text-3xl sm:text-4xl font-bold tracking-tight text-white">
              مواقيت الصلاة اليومية
            </h1>
            <p className="text-stone-300 text-xs sm:text-sm font-sans leading-relaxed">
              جدول مواقيت الصلوات الخمس والشروق حسب مدينتك وموقعك بدقة مع حساب الوقت المتبقي لكل أذان لحظياً.
            </p>
          </div>

          {/* Hijri & Gregorian Date Card */}
          <div className="bg-black/30 border border-white/15 backdrop-blur-md rounded-2xl p-4 text-center sm:text-right shrink-0 min-w-[220px]">
            <div className="flex items-center justify-center sm:justify-start gap-1.5 text-amber-300 text-xs font-bold mb-1">
              <Calendar className="w-4 h-4 text-amber-400" />
              <span>التاريخ المبارك</span>
            </div>
            {hijriFormatted && (
              <div className="font-amiri text-lg font-bold text-white mb-0.5">
                {hijriFormatted}
              </div>
            )}
            <div className="text-xs text-stone-300 font-sans">
              {gregorianFormatted}
            </div>
          </div>
        </div>
      </div>

      {/* Settings & Location Customizer */}
      <div className="p-4 sm:p-5 rounded-3xl bg-white dark:bg-stone-900 border border-stone-200 dark:border-stone-800 shadow-md space-y-4">
        <div className="flex flex-col lg:flex-row items-stretch lg:items-center justify-between gap-4">
          
          {/* City Selection with CustomSelect */}
          <div className="flex-1">
            <label className="block text-xs font-bold text-stone-700 dark:text-stone-300 mb-1.5">
              اختر المدينة أو العاصمة:
            </label>
            <CustomSelect<string>
              value={settings.customCoords ? 'custom' : settings.cityId}
              onChange={(newCityId) => handleSelectCity(newCityId)}
              options={
                settings.customCoords
                  ? [
                      { value: 'custom', label: settings.customCoords.label, sublabel: 'إحداثيات GPS' },
                      ...cityOptions,
                    ]
                  : cityOptions
              }
              placeholder="اختر المدينة..."
              searchable
              searchPlaceholder="ابحث عن مدينتك أو محافظتك..."
            />
          </div>

          {/* Method Selection with CustomSelect */}
          <div className="flex-1">
            <label className="block text-xs font-bold text-stone-700 dark:text-stone-300 mb-1.5">
              طريقة الحساب الفقهية:
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
              className="flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl bg-amber-500/15 hover:bg-amber-500/25 border border-amber-500/30 text-amber-900 dark:text-amber-300 font-bold text-xs transition-colors cursor-pointer"
            >
              <LocateFixed className="w-4 h-4 text-amber-600 dark:text-amber-400" />
              <span>موقعي الحالي عبر GPS</span>
            </button>
          </div>

          {/* Refresh Action */}
          <div className="flex flex-col justify-end pt-0 lg:pt-5">
            <button
              type="button"
              onClick={() => loadTimes(true)}
              disabled={isRefreshing}
              className="flex items-center justify-center gap-1.5 px-3.5 py-2.5 rounded-xl bg-stone-100 dark:bg-stone-800 hover:bg-stone-200 dark:hover:bg-stone-700 border border-stone-200 dark:border-stone-700 text-stone-700 dark:text-stone-300 font-bold text-xs transition-colors cursor-pointer"
              title="إعادة جلب المواقيت"
            >
              <RefreshCw className={`w-4 h-4 ${isRefreshing ? 'animate-spin text-amber-600' : ''}`} />
              <span className="hidden sm:inline">تحديث</span>
            </button>
          </div>
        </div>

        {/* Status Indicator */}
        <div className="flex flex-wrap items-center justify-between gap-2 pt-2 border-t border-stone-200/80 dark:border-stone-800 text-xs">
          <div className="flex items-center gap-2 text-stone-700 dark:text-stone-300 font-medium">
            <MapPin className="w-3.5 h-3.5 text-amber-600 dark:text-amber-400" />
            <span>الموقع الحالي:</span>
            <span className="font-bold text-stone-900 dark:text-stone-100">{activeLocation.name}</span>
            <span className="text-stone-600 dark:text-stone-400 font-medium">({activeLocation.country})</span>
          </div>

          <span className="inline-flex items-center gap-1.5 text-[11px] text-stone-700 dark:text-stone-300 font-medium">
            <span className={`w-2 h-2 rounded-full ${prayerTimes.source === 'api' ? 'bg-emerald-500' : 'bg-amber-500'}`} />
            <span>{prayerTimes.source === 'api' ? 'Aladhan API الحي المباشر' : 'الحساب الفلكي الشرعي المعتمد'}</span>
          </span>
        </div>
      </div>

      {locationStatus && (
        <div className="p-3 rounded-2xl bg-amber-50 dark:bg-amber-950/40 border border-amber-300 dark:border-amber-700 text-amber-900 dark:text-amber-300 text-xs text-center animate-in fade-in flex items-center justify-center gap-2">
          <Sparkles className="w-4 h-4 text-amber-600" />
          <span>{locationStatus}</span>
        </div>
      )}

      {/* Next Prayer Countdown Card */}
      <div className="p-5 sm:p-6 rounded-3xl bg-gradient-to-br from-amber-800 via-amber-900 to-stone-950 text-white shadow-xl relative overflow-hidden flex flex-col sm:flex-row items-center justify-between gap-5 border border-amber-500/20">
        <div className="space-y-1.5 text-center sm:text-right">
          <div className="flex items-center justify-center sm:justify-start gap-2 text-xs text-amber-200 font-semibold">
            <span className="w-2.5 h-2.5 rounded-full bg-emerald-400 animate-pulse" />
            <span>الصلاة القادمة بإذن الله:</span>
          </div>
          <div className="font-amiri text-3xl sm:text-4xl font-bold text-amber-100">
            {prayerTimes.nextPrayer.arabicName}
          </div>
          <div className="text-xs text-amber-200/90 font-mono font-bold">
            موعد الأذان: {prayerTimes.nextPrayer.time}
          </div>
        </div>

        <div className="flex flex-col items-center sm:items-end bg-black/40 px-5 py-3 rounded-2xl border border-white/10 backdrop-blur-md">
          <span className="text-xs text-amber-300 font-medium mb-1">الوقت المتبقي للأذان:</span>
          <span className="font-amiri text-2xl sm:text-3xl font-bold text-white tracking-wide">
            {prayerTimes.nextPrayer.remainingFormatted}
          </span>
        </div>
      </div>

      {/* Today Prayers Grid (12-Hour System) */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
        {prayerCards.map((p) => (
          <div
            key={p.id}
            className={`p-4 rounded-2xl border transition-all text-center space-y-2 ${
              p.isNext
                ? 'bg-amber-500/10 dark:bg-amber-950/40 border-amber-500 shadow-lg ring-2 ring-amber-500/30 scale-102'
                : 'bg-white dark:bg-stone-900 border-stone-200 dark:border-stone-800 shadow-2xs hover:border-amber-400/50'
            }`}
          >
            <div className="text-2xl">{p.icon}</div>
            <div className={`text-xs font-bold ${p.isNext ? 'text-amber-900 dark:text-amber-300' : 'text-stone-700 dark:text-stone-300'}`}>
              {p.name}
            </div>
            
            <span className="font-mono text-lg font-bold text-stone-900 dark:text-stone-100 block tracking-tight">
              {p.time}
            </span>

            {p.isNext ? (
              <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-amber-500/20 text-amber-900 dark:text-amber-300 inline-block">
                الأذان القادم 🔔
              </span>
            ) : (
              <span className="text-[10px] text-stone-400 block font-sans">
                {p.id === 'sunrise' ? 'وقت الإشراق' : 'فرض شرعي'}
              </span>
            )}
          </div>
        ))}
      </div>

      {/* Audio Takbeer Bar */}
      <div className="p-4 rounded-2xl bg-amber-50/50 dark:bg-stone-900/60 border border-amber-200 dark:border-stone-800 flex flex-col sm:flex-row items-center justify-between gap-3 text-xs">
        <div className="flex items-center gap-2 text-stone-600 dark:text-stone-300">
          <Sparkles className="w-4 h-4 text-amber-600 shrink-0" />
          <span>تنبيه مبارك بصوت التكبير والأذان:</span>
        </div>
        <button
          onClick={handlePlayTakbeerChime}
          className="flex items-center gap-2 px-4 py-2 rounded-xl bg-gradient-to-r from-amber-700 to-amber-800 hover:from-amber-600 hover:to-amber-700 text-white font-bold transition shadow-xs cursor-pointer active:scale-95"
        >
          <Volume2 className="w-4 h-4" />
          <span>تشغيل التكبيرات المباركة</span>
        </button>
      </div>

    </div>
  );
};
