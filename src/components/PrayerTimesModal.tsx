import React, { useState, useEffect, useMemo } from 'react';
import {
  X,
  Compass,
  Clock,
  MapPin,
  Navigation,
  Sparkles,
  ChevronDown,
  Volume2,
  Calendar,
  LocateFixed
} from 'lucide-react';
import {
  calculatePrayerTimes,
  POPULAR_CITIES,
  CityLocation,
  PrayerTimesResult
} from '../utils/prayerTimes';
import { calculateQibla, QiblaResult } from '../utils/qibla';
import { storageService } from '../services/storageService';

interface PrayerTimesModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const PrayerTimesModal: React.FC<PrayerTimesModalProps> = ({ isOpen, onClose }) => {
  const [activeTab, setActiveTab] = useState<'times' | 'qibla'>('times');
  
  // Selected city or custom GPS location
  const [selectedCityId, setSelectedCityId] = useState<string>(() => {
    return storageService.getString('prayer_selected_city', 'makkah');
  });

  const [customCoords, setCustomCoords] = useState<{ lat: number; lng: number; label: string } | null>(() => {
    return storageService.get('prayer_custom_coords', null);
  });

  const [deviceHeading, setDeviceHeading] = useState<number>(0);
  const [hasCompassSupport, setHasCompassSupport] = useState<boolean>(false);
  const [locationStatus, setLocationStatus] = useState<string | null>(null);

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

  const prayerTimes: PrayerTimesResult = useMemo(() => {
    return calculatePrayerTimes(now, activeLocation.latitude, activeLocation.longitude, activeLocation.timezone);
  }, [now, activeLocation]);

  const qiblaInfo: QiblaResult = useMemo(() => {
    return calculateQibla(activeLocation.latitude, activeLocation.longitude);
  }, [activeLocation]);

  // Save selected city
  const handleSelectCity = (cityId: string) => {
    setSelectedCityId(cityId);
    setCustomCoords(null);
    storageService.setString('prayer_selected_city', cityId);
    storageService.remove('prayer_custom_coords');
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
        setLocationStatus('تم تحديد الموقع بنجاح');
        setTimeout(() => setLocationStatus(null), 3000);
      },
      (err) => {
        setLocationStatus('تعذر الوصول إلى الموقع الجغرافي (تأكد من إذن الموقع)');
        setTimeout(() => setLocationStatus(null), 4000);
      },
      { enableHighAccuracy: true, timeout: 8000 }
    );
  };

  // Device orientation / compass needle
  useEffect(() => {
    if (!isOpen || activeTab !== 'qibla') return;

    const handleOrientation = (e: DeviceOrientationEvent) => {
      if (e.alpha !== null) {
        setHasCompassSupport(true);
        // Alpha is compass heading relative to North on mobile
        setDeviceHeading(360 - e.alpha);
      }
    };

    if (typeof window !== 'undefined' && 'DeviceOrientationEvent' in window) {
      window.addEventListener('deviceorientation', handleOrientation, true);
    }

    return () => {
      if (typeof window !== 'undefined') {
        window.removeEventListener('deviceorientation', handleOrientation, true);
      }
    };
  }, [isOpen, activeTab]);

  if (!isOpen) return null;

  const prayerCards = [
    { id: 'fajr', name: 'صلاة الفجر', time: prayerTimes.fajr, isNext: prayerTimes.nextPrayer.id === 'fajr' },
    { id: 'sunrise', name: 'الشروق', time: prayerTimes.sunrise, isNext: prayerTimes.nextPrayer.id === 'sunrise' },
    { id: 'dhuhr', name: 'صلاة الظهر', time: prayerTimes.dhuhr, isNext: prayerTimes.nextPrayer.id === 'dhuhr' },
    { id: 'asr', name: 'صلاة العصر', time: prayerTimes.asr, isNext: prayerTimes.nextPrayer.id === 'asr' },
    { id: 'maghrib', name: 'صلاة المغرب', time: prayerTimes.maghrib, isNext: prayerTimes.nextPrayer.id === 'maghrib' },
    { id: 'isha', name: 'صلاة العشاء', time: prayerTimes.isha, isNext: prayerTimes.nextPrayer.id === 'isha' },
  ];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-5 bg-stone-950/80 backdrop-blur-md animate-in fade-in duration-200 select-none">
      <div className="w-full max-w-xl bg-white dark:bg-stone-900 rounded-3xl p-5 sm:p-7 text-right shadow-2xl border border-stone-200 dark:border-stone-800 space-y-5 max-h-[92vh] overflow-y-auto">
        
        {/* Top Header */}
        <div className="flex items-center justify-between pb-3 border-b border-stone-100 dark:border-stone-800">
          <div className="flex items-center gap-2.5">
            <div className="w-10 h-10 rounded-2xl bg-amber-500/20 text-amber-700 dark:text-amber-400 flex items-center justify-center shadow-xs">
              <Clock className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-amiri text-2xl font-bold text-stone-900 dark:text-stone-100">
                مواقيت الصلاة واتجاه القبلة
              </h3>
              <p className="text-xs text-stone-500 font-sans">
                حساب فلكي دقيق وفق التوقيت المحلي يعمل بدون اتصال بالإنترنت
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-1.5 text-stone-400 hover:text-stone-700 dark:hover:text-stone-200 rounded-lg cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Tab Toggle: Prayer Times vs Qibla Compass */}
        <div className="flex items-center p-1 rounded-2xl bg-stone-100 dark:bg-stone-800/80 border border-stone-200 dark:border-stone-700/60">
          <button
            onClick={() => setActiveTab('times')}
            className={`flex-1 flex items-center justify-center gap-2 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer ${
              activeTab === 'times'
                ? 'bg-white dark:bg-stone-700 text-amber-900 dark:text-amber-300 shadow-xs'
                : 'text-stone-600 dark:text-stone-400 hover:text-stone-900 dark:hover:text-stone-200'
            }`}
          >
            <Clock className="w-4 h-4" />
            <span>مواقيت الصلوات اليوم</span>
          </button>

          <button
            onClick={() => setActiveTab('qibla')}
            className={`flex-1 flex items-center justify-center gap-2 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer ${
              activeTab === 'qibla'
                ? 'bg-white dark:bg-stone-700 text-amber-900 dark:text-amber-300 shadow-xs'
                : 'text-stone-600 dark:text-stone-400 hover:text-stone-900 dark:hover:text-stone-200'
            }`}
          >
            <Compass className="w-4 h-4" />
            <span>بوصلة واتجاه القبلة</span>
          </button>
        </div>

        {/* Location Selector Bar */}
        <div className="flex flex-wrap items-center justify-between gap-2 p-3 rounded-2xl bg-stone-50 dark:bg-stone-850 border border-stone-200 dark:border-stone-800 text-xs">
          <div className="flex items-center gap-2">
            <MapPin className="w-4 h-4 text-amber-600 dark:text-amber-400 shrink-0" />
            <span className="text-stone-500">المدينة المحددة:</span>
            <span className="font-bold text-stone-900 dark:text-stone-100">
              {activeLocation.name} ({activeLocation.country})
            </span>
          </div>

          <div className="flex items-center gap-1.5 flex-wrap">
            {/* GPS Button */}
            <button
              onClick={handleDetectGPS}
              className="flex items-center gap-1 px-2.5 py-1 rounded-xl bg-amber-500/15 hover:bg-amber-500/25 border border-amber-500/30 text-amber-900 dark:text-amber-300 text-[11px] font-semibold transition cursor-pointer"
              title="تحديد الموقع الجغرافي تلقائياً عبر GPS"
            >
              <LocateFixed className="w-3.5 h-3.5" />
              <span>موقعي (GPS)</span>
            </button>

            {/* City Dropdown */}
            <div className="relative">
              <select
                value={customCoords ? 'custom' : selectedCityId}
                onChange={(e) => {
                  if (e.target.value !== 'custom') {
                    handleSelectCity(e.target.value);
                  }
                }}
                className="bg-white dark:bg-stone-800 text-stone-800 dark:text-stone-200 border border-stone-300 dark:border-stone-700 rounded-xl px-2.5 py-1 text-[11px] font-semibold cursor-pointer focus:outline-hidden"
              >
                {customCoords && <option value="custom">موقعي الحالي (GPS)</option>}
                {POPULAR_CITIES.map((c) => (
                  <option key={c.id} value={c.id}>
                    {c.name} - {c.country}
                  </option>
                ))}
              </select>
            </div>
          </div>
        </div>

        {locationStatus && (
          <div className="p-2 rounded-xl bg-amber-50 dark:bg-amber-950/40 border border-amber-300 dark:border-amber-700 text-amber-800 dark:text-amber-300 text-xs text-center animate-in fade-in">
            {locationStatus}
          </div>
        )}

        {/* TAB 1: PRAYER TIMES */}
        {activeTab === 'times' && (
          <div className="space-y-4">
            
            {/* Next Prayer Countdown Card */}
            <div className="p-4 sm:p-5 rounded-3xl bg-gradient-to-br from-amber-700 via-amber-800 to-amber-950 text-white shadow-xl relative overflow-hidden flex flex-col sm:flex-row items-center justify-between gap-4">
              <div className="space-y-1 text-center sm:text-right">
                <span className="text-xs text-amber-200 font-medium">الصلاة القادمة بإذن الله:</span>
                <div className="font-amiri text-2xl sm:text-3xl font-bold text-amber-100">
                  {prayerTimes.nextPrayer.arabicName}
                </div>
                <div className="text-xs text-amber-200/80 font-mono">
                  موعد الأذان: {prayerTimes.nextPrayer.time}
                </div>
              </div>

              <div className="flex flex-col items-center sm:items-end bg-black/25 px-4 py-2.5 rounded-2xl border border-white/10 backdrop-blur-md">
                <span className="text-[11px] text-amber-300 font-medium">الوقت المتبقي:</span>
                <span className="font-amiri text-xl sm:text-2xl font-bold text-white tracking-wide">
                  {prayerTimes.nextPrayer.remainingFormatted}
                </span>
              </div>
            </div>

            {/* Prayers Grid */}
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-2.5">
              {prayerCards.map((p) => (
                <div
                  key={p.id}
                  className={`p-3 sm:p-4 rounded-2xl border transition-all text-center space-y-1 ${
                    p.isNext
                      ? 'bg-amber-50 dark:bg-amber-950/40 border-amber-400 dark:border-amber-600/80 shadow-md ring-2 ring-amber-400/40 scale-102'
                      : 'bg-stone-50 dark:bg-stone-850 border-stone-200 dark:border-stone-800'
                  }`}
                >
                  <span className={`text-xs font-bold block ${p.isNext ? 'text-amber-900 dark:text-amber-300' : 'text-stone-700 dark:text-stone-300'}`}>
                    {p.name}
                  </span>
                  <span className="font-mono text-base sm:text-lg font-bold text-stone-900 dark:text-stone-100 block">
                    {p.time}
                  </span>
                  {p.isNext && (
                    <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-amber-200 dark:bg-amber-900 text-amber-950 dark:text-amber-200 inline-block">
                      القادمة
                    </span>
                  )}
                </div>
              ))}
            </div>

          </div>
        )}

        {/* TAB 2: QIBLA COMPASS */}
        {activeTab === 'qibla' && (
          <div className="space-y-4 text-center">
            
            <div className="p-4 rounded-2xl bg-amber-50 dark:bg-amber-950/30 border border-amber-300 dark:border-amber-700/50 flex items-center justify-around text-xs">
              <div>
                <span className="text-stone-500 block">زاوية القبلة:</span>
                <span className="font-mono text-base font-bold text-amber-900 dark:text-amber-300">
                  {qiblaInfo.bearingDegrees}°
                </span>
              </div>

              <div>
                <span className="text-stone-500 block">الاتجاه:</span>
                <span className="font-bold text-amber-900 dark:text-amber-300 text-sm">
                  {qiblaInfo.compassCardinal}
                </span>
              </div>

              <div>
                <span className="text-stone-500 block">المسافة إلى مكة:</span>
                <span className="font-mono text-base font-bold text-amber-900 dark:text-amber-300">
                  {qiblaInfo.distanceKm.toLocaleString('ar-EG')} كم
                </span>
              </div>
            </div>

            {/* Visual Compass Card */}
            <div className="relative w-64 h-64 sm:w-72 sm:h-72 mx-auto rounded-full bg-gradient-to-b from-stone-100 to-stone-200 dark:from-stone-800 dark:to-stone-900 border-4 border-amber-600/40 shadow-inner flex items-center justify-center">
              
              {/* Compass Cardinal Labels */}
              <span className="absolute top-2 text-xs font-bold text-stone-500">شمال (N)</span>
              <span className="absolute bottom-2 text-xs font-bold text-stone-500">جنوب (S)</span>
              <span className="absolute right-3 text-xs font-bold text-stone-500">شرق (E)</span>
              <span className="absolute left-3 text-xs font-bold text-stone-500">غرب (W)</span>

              {/* Kaaba Direction Needle */}
              <div
                className="relative w-full h-full flex items-center justify-center transition-transform duration-300"
                style={{
                  transform: `rotate(${qiblaInfo.bearingDegrees + (hasCompassSupport ? deviceHeading : 0)}deg)`,
                }}
              >
                {/* Pointer to Kaaba */}
                <div className="absolute top-6 flex flex-col items-center">
                  <div className="w-7 h-7 rounded-lg bg-stone-950 border border-amber-400 flex items-center justify-center shadow-lg text-[10px] text-amber-300 font-bold">
                    🕋
                  </div>
                  <div className="w-0.5 h-16 bg-gradient-to-t from-transparent via-amber-500 to-amber-600 mt-1" />
                </div>

                {/* Compass Central Pivot */}
                <div className="w-8 h-8 rounded-full bg-amber-700 text-white font-bold text-xs flex items-center justify-center border-2 border-white dark:border-stone-900 shadow-md">
                  ۞
                </div>
              </div>

            </div>

            <p className="text-xs text-stone-500 dark:text-stone-400 font-sans max-w-sm mx-auto leading-relaxed">
              ضع الجهاز بشكل أفقي ومستوٍ على سطح ثابت. يشير رمز الكعبة المشرفة 🕋 إلى اتجاه القبلة المباركة بالنسبة للشمال.
            </p>

          </div>
        )}

        {/* Footer Note */}
        <div className="pt-2 border-t border-stone-100 dark:border-stone-800 text-[11px] text-stone-400 text-center flex items-center justify-center gap-1.5 font-sans">
          <Sparkles className="w-3.5 h-3.5 text-amber-600" />
          <span>حساب أوقات الصلوات معتمد على الحساب الفلكي الشرعي المعياري لموقعك</span>
        </div>

      </div>
    </div>
  );
};
