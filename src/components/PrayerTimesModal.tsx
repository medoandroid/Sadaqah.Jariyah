import React, { useState, useEffect, useMemo } from 'react';
import {
  X,
  Clock,
  MapPin,
  Sparkles,
  Volume2,
  Calendar,
  LocateFixed,
  Globe2,
  ShieldCheck,
  Check,
  RefreshCw
} from 'lucide-react';
import {
  calculatePrayerTimes,
  fetchRealPrayerTimes,
  POPULAR_CITIES,
  CALCULATION_METHODS,
  CityLocation,
  PrayerTimesResult
} from '../utils/prayerTimes';
import { storageService } from '../services/storageService';
import { playPeacefulChime } from '../utils/soundEffects';
import { CustomSelect } from './CustomSelect';

interface PrayerTimesModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const PrayerTimesModal: React.FC<PrayerTimesModalProps> = ({ isOpen, onClose }) => {
  // Selected city or custom GPS location (Default: Cairo, Egypt)
  const [selectedCityId, setSelectedCityId] = useState<string>(() => {
    return storageService.getString('prayer_selected_city', 'cairo');
  });

  const [selectedMethodId, setSelectedMethodId] = useState<number>(() => {
    return storageService.getNumber('prayer_selected_method', 5); // 5 = Egyptian Survey Authority
  });

  const [customCoords, setCustomCoords] = useState<{ lat: number; lng: number; label: string } | null>(() => {
    return storageService.get('prayer_custom_coords', null);
  });

  const [locationStatus, setLocationStatus] = useState<string | null>(null);
  const [apiSource, setApiSource] = useState<'api' | 'astronomical'>('astronomical');
  const [isRefreshing, setIsRefreshing] = useState<boolean>(false);

  // Active location object
  const activeLocation = useMemo<CityLocation>(() => {
    if (customCoords) {
      return {
        id: 'custom',
        name: customCoords.label,
        country: 'موقعي الحالي',
        latitude: customCoords.lat,
        longitude: customCoords.lng,
        timezone: -new Date().getTimezoneOffset() / 60,
      };
    }
    const found = POPULAR_CITIES.find((c) => c.id === selectedCityId);
    return found || POPULAR_CITIES[0];
  }, [selectedCityId, customCoords]);

  // Real-time prayer times recalculation
  const [now, setNow] = useState(new Date());

  useEffect(() => {
    const timer = setInterval(() => setNow(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);

  // Async API prayer times state with astronomical immediate fallback
  const [prayerTimes, setPrayerTimes] = useState<PrayerTimesResult>(() => {
    return calculatePrayerTimes(now, activeLocation.latitude, activeLocation.longitude, activeLocation.timezone, selectedMethodId);
  });

  const loadTimes = (forceRefresh = false) => {
    if (forceRefresh) setIsRefreshing(true);
    fetchRealPrayerTimes(activeLocation, selectedMethodId, now).then((res) => {
      setPrayerTimes(res);
      setApiSource(res.source);
      if (forceRefresh) {
        setIsRefreshing(false);
        setLocationStatus('تم تحديث المواقيت بنجاح 🤲');
        setTimeout(() => setLocationStatus(null), 3000);
      }
    }).catch(() => {
      if (forceRefresh) setIsRefreshing(false);
    });
  };

  useEffect(() => {
    let isMounted = true;
    fetchRealPrayerTimes(activeLocation, selectedMethodId, now).then((res) => {
      if (isMounted) {
        setPrayerTimes(res);
        setApiSource(res.source);
      }
    });
    return () => {
      isMounted = false;
    };
  }, [activeLocation, selectedMethodId]);

  // Save selected city
  const handleSelectCity = (cityId: string) => {
    setSelectedCityId(cityId);
    setCustomCoords(null);
    storageService.setString('prayer_selected_city', cityId);
    storageService.remove('prayer_custom_coords');
  };

  const handleSelectMethod = (methodId: number) => {
    setSelectedMethodId(methodId);
    storageService.setNumber('prayer_selected_method', methodId);
  };

  // GPS Location detection
  const handleDetectGPS = () => {
    if (!navigator.geolocation) {
      setLocationStatus('المتصفح لا يدعم تحديد الموقع الجغرافي');
      return;
    }
    setLocationStatus('جاري تحديد موقعك الجغرافي بدقة...');
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        const lat = pos.coords.latitude;
        const lng = pos.coords.longitude;
        const custom = { lat, lng, label: 'موقعي عبر GPS' };
        setCustomCoords(custom);
        storageService.set('prayer_custom_coords', custom);
        setLocationStatus('تم تحديد الموقع بنجاح عبر الأقمار الصناعية');
        setTimeout(() => setLocationStatus(null), 3000);
      },
      (err) => {
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

  const { hijriFormatted, gregorianFormatted } = useMemo(() => {
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
  }, [now]);

  if (!isOpen) return null;

  const prayerCards = [
    { id: 'fajr', name: 'صلاة الفجر', icon: '🌅', time: prayerTimes.fajr, isNext: prayerTimes.nextPrayer.id === 'fajr' },
    { id: 'sunrise', name: 'الشروق', icon: '🌄', time: prayerTimes.sunrise, isNext: prayerTimes.nextPrayer.id === 'sunrise' },
    { id: 'dhuhr', name: 'صلاة الظهر', icon: '☀️', time: prayerTimes.dhuhr, isNext: prayerTimes.nextPrayer.id === 'dhuhr' },
    { id: 'asr', name: 'صلاة العصر', icon: '🌤️', time: prayerTimes.asr, isNext: prayerTimes.nextPrayer.id === 'asr' },
    { id: 'maghrib', name: 'صلاة المغرب', icon: '🌇', time: prayerTimes.maghrib, isNext: prayerTimes.nextPrayer.id === 'maghrib' },
    { id: 'isha', name: 'صلاة العشاء', icon: '🌙', time: prayerTimes.isha, isNext: prayerTimes.nextPrayer.id === 'isha' },
  ];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-5 bg-stone-950/85 backdrop-blur-md animate-in fade-in duration-200 select-none" dir="rtl">
      <div className="w-full max-w-xl bg-white dark:bg-[#15171E] rounded-3xl p-5 sm:p-7 text-right shadow-2xl border border-stone-200 dark:border-amber-500/20 space-y-5 max-h-[92vh] overflow-y-auto">
        
        {/* Top Header */}
        <div className="flex items-center justify-between pb-3 border-b border-stone-100 dark:border-stone-800">
          <div className="flex items-center gap-2.5">
            <div className="w-10 h-10 rounded-2xl bg-amber-500/15 border border-amber-500/30 text-amber-700 dark:text-amber-400 flex items-center justify-center shadow-xs">
              <Clock className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="font-amiri text-2xl font-bold text-stone-900 dark:text-stone-100">
                  مواقيت الصلاة اليومية
                </h3>
                <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-500/15 text-emerald-800 dark:text-emerald-300 border border-emerald-500/30">
                  نظام ١٢ ساعة
                </span>
              </div>
              <p className="text-xs text-stone-500 dark:text-stone-400 font-sans">
                {hijriFormatted ? `${hijriFormatted} · ` : ''}{gregorianFormatted}
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-1.5 text-stone-400 hover:text-stone-700 dark:hover:text-stone-200 rounded-lg cursor-pointer transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Location & Calculation Method with CustomSelect */}
        <div className="space-y-3 p-3.5 rounded-2xl bg-stone-50 dark:bg-stone-850/80 border border-stone-200 dark:border-stone-800 text-xs">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-[11px] font-bold text-stone-700 dark:text-stone-300 mb-1">
                المدينة أو المحافظة:
              </label>
              <CustomSelect<string>
                value={customCoords ? 'custom' : selectedCityId}
                onChange={(val) => handleSelectCity(val)}
                options={
                  customCoords
                    ? [{ value: 'custom', label: customCoords.label, sublabel: 'إحداثيات GPS' }, ...cityOptions]
                    : cityOptions
                }
                size="sm"
                searchable
                searchPlaceholder="ابحث عن المدينة..."
              />
            </div>

            <div>
              <label className="block text-[11px] font-bold text-stone-700 dark:text-stone-300 mb-1">
                طريقة الحساب:
              </label>
              <CustomSelect<number>
                value={selectedMethodId}
                onChange={(val) => handleSelectMethod(val)}
                options={methodOptions}
                size="sm"
              />
            </div>
          </div>

          {/* Location Actions Bar */}
          <div className="flex flex-wrap items-center justify-between gap-2 pt-2 border-t border-stone-200/60 dark:border-stone-800 text-[11px]">
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={handleDetectGPS}
                className="flex items-center gap-1 px-2.5 py-1 rounded-lg bg-amber-500/15 hover:bg-amber-500/25 border border-amber-500/30 text-amber-900 dark:text-amber-300 font-semibold cursor-pointer transition"
              >
                <LocateFixed className="w-3.5 h-3.5" />
                <span>تحديد موقعي GPS</span>
              </button>

              <button
                type="button"
                onClick={() => loadTimes(true)}
                disabled={isRefreshing}
                className="flex items-center gap-1 px-2.5 py-1 rounded-lg bg-stone-200/70 dark:bg-stone-800 hover:bg-stone-300 dark:hover:bg-stone-700 text-stone-700 dark:text-stone-300 font-semibold cursor-pointer transition"
              >
                <RefreshCw className={`w-3.5 h-3.5 ${isRefreshing ? 'animate-spin text-amber-600' : ''}`} />
                <span>تحديث</span>
              </button>
            </div>

            <span className="inline-flex items-center gap-1.5 text-[10px] text-stone-500 dark:text-stone-400">
              <span className={`w-2 h-2 rounded-full ${apiSource === 'api' ? 'bg-emerald-500' : 'bg-amber-500'}`} />
              <span>{apiSource === 'api' ? 'Aladhan API المباشر' : 'الحساب الشرعي الفلكي'}</span>
            </span>
          </div>
        </div>

        {locationStatus && (
          <div className="p-2.5 rounded-xl bg-amber-50 dark:bg-amber-950/40 border border-amber-300 dark:border-amber-700 text-amber-900 dark:text-amber-300 text-xs text-center animate-in fade-in flex items-center justify-center gap-2">
            <Sparkles className="w-3.5 h-3.5 text-amber-600" />
            <span>{locationStatus}</span>
          </div>
        )}

        {/* Next Prayer Countdown Card */}
        <div className="p-4 sm:p-5 rounded-3xl bg-gradient-to-br from-amber-700 via-amber-850 to-stone-900 text-white shadow-xl relative overflow-hidden flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="space-y-1 text-center sm:text-right">
            <div className="flex items-center justify-center sm:justify-start gap-1.5 text-xs text-amber-200 font-medium">
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
              <span>الصلاة القادمة بإذن الله:</span>
            </div>
            <div className="font-amiri text-2xl sm:text-3xl font-bold text-amber-100">
              {prayerTimes.nextPrayer.arabicName}
            </div>
            <div className="text-xs text-amber-200/90 font-mono font-bold">
              موعد الأذان: {prayerTimes.nextPrayer.time}
            </div>
          </div>

          <div className="flex flex-col items-center sm:items-end bg-black/30 px-4 py-2.5 rounded-2xl border border-white/10 backdrop-blur-md">
            <span className="text-[11px] text-amber-300 font-medium">الوقت المتبقي للأذان:</span>
            <span className="font-amiri text-xl sm:text-2xl font-bold text-white tracking-wide">
              {prayerTimes.nextPrayer.remainingFormatted}
            </span>
          </div>
        </div>

        {/* Prayers Grid (Strict 12-Hour System) */}
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-2.5">
          {prayerCards.map((p) => (
            <div
              key={p.id}
              className={`p-3.5 sm:p-4 rounded-2xl border transition-all text-center space-y-1.5 ${
                p.isNext
                  ? 'bg-amber-500/10 dark:bg-amber-950/40 border-amber-500/80 shadow-md ring-2 ring-amber-500/30 scale-102'
                  : 'bg-stone-50 dark:bg-stone-850/70 border-stone-200 dark:border-stone-800'
              }`}
            >
              <div className="flex items-center justify-center gap-1.5">
                <span className="text-base">{p.icon}</span>
                <span className={`text-xs font-bold ${p.isNext ? 'text-amber-900 dark:text-amber-300' : 'text-stone-700 dark:text-stone-300'}`}>
                  {p.name}
                </span>
              </div>
              
              <span className="font-mono text-base sm:text-xl font-bold text-stone-900 dark:text-stone-100 block tracking-tight">
                {p.time}
              </span>

              {p.isNext && (
                <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-amber-500/20 text-amber-900 dark:text-amber-300 inline-block">
                  الأذان القادم 🔔
                </span>
              )}
            </div>
          ))}
        </div>

        {/* Azan / Takbeer Audio Chime Button */}
        <div className="pt-2 flex items-center justify-between text-xs text-stone-500 dark:text-stone-400">
          <span>تذكير بصوت التكبير المبارك:</span>
          <button
            onClick={handlePlayTakbeerChime}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-amber-500/15 hover:bg-amber-500/25 border border-amber-500/30 text-amber-900 dark:text-amber-300 font-bold transition cursor-pointer"
          >
            <Volume2 className="w-3.5 h-3.5" />
            <span>تكبيرات العيد والصلاة</span>
          </button>
        </div>

        {/* Footer Note */}
        <div className="pt-2 border-t border-stone-100 dark:border-stone-800 text-[11px] text-stone-400 text-center flex items-center justify-center gap-1.5 font-sans">
          <Sparkles className="w-3.5 h-3.5 text-amber-600" />
          <span>مواقيت الصلاة معروضة بدقة بنظام الـ ١٢ ساعة (ص / م) ومطابقة للمواقيت الشرعية</span>
        </div>

      </div>
    </div>
  );
};
