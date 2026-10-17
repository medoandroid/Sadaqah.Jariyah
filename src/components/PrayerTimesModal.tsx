import React, { useState, useEffect, useMemo } from 'react';
import {
  X,
  Clock,
  MapPin,
  Sparkles,
  Volume2,
  VolumeX,
  LocateFixed,
  RefreshCw,
  Calendar,
  Compass,
  Play,
  Square,
  Sunrise,
  Sun,
  Sunset,
  Moon,
  ShieldCheck,
  Bell
} from 'lucide-react';
import {
  POPULAR_CITIES,
  CALCULATION_METHODS,
  ADHAN_VOICES,
  PrayerTimesResult,
  AdhanVoice,
} from '../utils/prayerTimes';
import { prayerTimesService, PrayerSettings } from '../services/prayerTimesService';
import { CustomSelect } from './CustomSelect';

interface PrayerTimesModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const PrayerTimesModal: React.FC<PrayerTimesModalProps> = ({ isOpen, onClose }) => {
  const [prayerData, setPrayerData] = useState<PrayerTimesResult>(() => prayerTimesService.getPrayerTimes());
  const [settings, setSettings] = useState<PrayerSettings>(() => prayerTimesService.getSettings());
  const [isAdhanPlaying, setIsAdhanPlaying] = useState<boolean>(prayerTimesService.isAdhanPlaying());
  const [activeVoice, setActiveVoice] = useState<AdhanVoice | null>(prayerTimesService.getPlayingVoice());
  const [locationStatus, setLocationStatus] = useState<string | null>(null);
  const [isLocating, setIsLocating] = useState<boolean>(false);
  const [isRefreshing, setIsRefreshing] = useState<boolean>(false);

  useEffect(() => {
    const unsubTimes = prayerTimesService.subscribe((res, setts) => {
      setPrayerData(res);
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

  // GPS Location detection
  const handleDetectGPS = async () => {
    setIsLocating(true);
    setLocationStatus('جاري تحديد موقعك الجغرافي بدقة عبر GPS والأقمار الصناعية...');
    const res = await prayerTimesService.detectGPSLocation();
    setIsLocating(false);

    if (res.success) {
      setLocationStatus(`تم تحديد موقعك بدقة: ${res.label} 🤲`);
      setTimeout(() => setLocationStatus(null), 3500);
    } else {
      setLocationStatus(res.error || 'تعذر تحديد الموقع الجغرافي');
      setTimeout(() => setLocationStatus(null), 4500);
    }
  };

  const handleRefresh = async () => {
    setIsRefreshing(true);
    await prayerTimesService.refresh();
    setIsRefreshing(false);
    setLocationStatus('تم تحديث المواقيت بنجاح من AlAdhan API 🤲');
    setTimeout(() => setLocationStatus(null), 2500);
  };

  const handleToggleAdhan = () => {
    prayerTimesService.playAdhan();
  };

  const cityOptions = useMemo(() => {
    return POPULAR_CITIES.map((c) => ({
      value: c.id,
      label: c.name,
      sublabel: `${c.country} ${c.region ? `• ${c.region}` : ''}`,
    }));
  }, []);

  const methodOptions = useMemo(() => {
    return CALCULATION_METHODS.map((m) => ({
      value: m.id,
      label: m.name,
      badge: `فجر: ${m.fajrAngle}° | عشاء: ${m.ishaAngle}°`,
    }));
  }, []);

  const nextPrayerId = prayerData.nextPrayer.id;
  const currentPrayerId = prayerData.currentPrayer?.id;

  const prayerCards = [
    { id: 'fajr', name: 'الفجر', icon: Sunrise, time: prayerData.fajr, isNext: nextPrayerId === 'fajr', isCurrent: currentPrayerId === 'fajr' },
    { id: 'sunrise', name: 'الشروق', icon: Sun, time: prayerData.sunrise, isNext: nextPrayerId === 'sunrise', isCurrent: currentPrayerId === 'sunrise' },
    { id: 'dhuhr', name: 'الظهر', icon: Sun, time: prayerData.dhuhr, isNext: nextPrayerId === 'dhuhr', isCurrent: currentPrayerId === 'dhuhr' },
    { id: 'asr', name: 'العصر', icon: Sun, time: prayerData.asr, isNext: nextPrayerId === 'asr', isCurrent: currentPrayerId === 'asr' },
    { id: 'maghrib', name: 'المغرب', icon: Sunset, time: prayerData.maghrib, isNext: nextPrayerId === 'maghrib', isCurrent: currentPrayerId === 'maghrib' },
    { id: 'isha', name: 'العشاء', icon: Moon, time: prayerData.isha, isNext: nextPrayerId === 'isha', isCurrent: currentPrayerId === 'isha' },
  ];

  if (!isOpen) return null;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/70 backdrop-blur-sm animate-in fade-in duration-200 select-none"
      onClick={onClose}
      dir="rtl"
    >
      <div
        className="w-full max-w-2xl bg-white dark:bg-stone-900 rounded-3xl shadow-2xl border border-stone-200 dark:border-stone-800 overflow-hidden flex flex-col max-h-[92vh] animate-in zoom-in-95 duration-200 text-right"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Modal Header */}
        <div className="relative p-5 sm:p-6 bg-gradient-to-r from-amber-700 via-amber-800 to-stone-900 text-white flex items-center justify-between border-b border-amber-600/30">
          <div className="flex items-center gap-3">
            <span className="w-10 h-10 rounded-2xl bg-amber-500/20 border border-amber-400/30 flex items-center justify-center text-amber-300">
              <Clock className="w-5 h-5" />
            </span>
            <div>
              <h2 className="font-amiri text-2xl font-bold text-white leading-tight">
                مواقيت الصلاة اليومية
              </h2>
              <div className="flex items-center gap-2 text-xs text-amber-200/90 font-sans">
                <span>{prayerData.hijriDate.fullFormatted}</span>
                <span>·</span>
                <span>{prayerData.gregorianDate.formatted}</span>
              </div>
            </div>
          </div>

          <button
            onClick={onClose}
            className="w-9 h-9 rounded-xl bg-black/20 hover:bg-black/40 border border-white/10 flex items-center justify-center text-white/80 hover:text-white transition-colors cursor-pointer"
            title="إغلاق"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Scrollable Body */}
        <div className="p-4 sm:p-6 overflow-y-auto space-y-4">
          
          {/* Status Message */}
          {locationStatus && (
            <div className="p-3 rounded-2xl bg-amber-500/10 border border-amber-500/30 text-amber-900 dark:text-amber-200 text-xs text-center animate-in fade-in flex items-center justify-center gap-2 shadow-xs">
              <Sparkles className="w-4 h-4 text-amber-600 dark:text-amber-400" />
              <span>{locationStatus}</span>
            </div>
          )}

          {/* Location & Method Controls */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 p-4 rounded-2xl bg-stone-50 dark:bg-stone-850/60 border border-stone-200 dark:border-stone-800 text-xs">
            <div>
              <label className="block text-stone-700 dark:text-stone-300 font-bold mb-1">
                المدينة أو المحافظة:
              </label>
              <CustomSelect<string>
                value={settings.customCoords ? 'custom' : settings.cityId}
                onChange={(cId) => handleSelectCity(cId)}
                options={
                  settings.customCoords
                    ? [{ value: 'custom', label: settings.customCoords.label, sublabel: 'إحداثيات GPS' }, ...cityOptions]
                    : cityOptions
                }
                searchable
                searchPlaceholder="ابحث عن المحافظة أو المدينة..."
              />
            </div>

            <div>
              <label className="block text-stone-700 dark:text-stone-300 font-bold mb-1">
                طريقة الحساب:
              </label>
              <CustomSelect<number>
                value={settings.methodId}
                onChange={(mId) => handleSelectMethod(mId)}
                options={methodOptions}
              />
            </div>
          </div>

          {/* Location Actions Bar */}
          <div className="flex flex-wrap items-center justify-between gap-2 px-1">
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={handleDetectGPS}
                disabled={isLocating}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-amber-500/15 hover:bg-amber-500/25 border border-amber-500/30 text-amber-900 dark:text-amber-300 font-bold text-xs transition-colors cursor-pointer"
              >
                <LocateFixed className={`w-3.5 h-3.5 text-amber-600 dark:text-amber-400 ${isLocating ? 'animate-spin' : ''}`} />
                <span>{isLocating ? 'جاري التحديد...' : 'موقعي عبر GPS'}</span>
              </button>

              <button
                type="button"
                onClick={handleRefresh}
                disabled={isRefreshing}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-stone-100 dark:bg-stone-800 hover:bg-stone-200 dark:hover:bg-stone-700 border border-stone-200 dark:border-stone-700 text-stone-700 dark:text-stone-300 font-bold text-xs transition-colors cursor-pointer"
              >
                <RefreshCw className={`w-3.5 h-3.5 ${isRefreshing ? 'animate-spin text-amber-600' : ''}`} />
                <span>تحديث</span>
              </button>
            </div>

            <div className="flex items-center gap-2 text-[11px] text-stone-500 dark:text-stone-400">
              <span className={`w-2 h-2 rounded-full ${prayerData.source === 'api' ? 'bg-emerald-500' : 'bg-amber-500'}`} />
              <span>{prayerData.sourceLabel}</span>
              <span>·</span>
              <span>القبلة: <strong className="text-stone-700 dark:text-stone-300">{prayerData.qiblaDegrees}°</strong></span>
            </div>
          </div>

          {/* Next Prayer Countdown Card */}
          <div className="p-4 sm:p-5 rounded-2xl bg-gradient-to-br from-amber-800 to-stone-900 text-white flex items-center justify-between gap-4 border border-amber-600/30 shadow-md">
            <div>
              <div className="flex items-center gap-2 text-xs text-amber-300 font-semibold mb-0.5">
                <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
                <span>الأذان القادم بإذن الله:</span>
              </div>
              <div className="font-amiri text-2xl sm:text-3xl font-bold text-amber-100">
                {prayerData.nextPrayer.arabicName}
              </div>
              <div className="text-xs text-amber-200/90 font-mono">
                موعد الأذان: <strong>{prayerData.nextPrayer.time}</strong>
              </div>
            </div>

            <div className="text-left bg-black/40 px-4 py-2.5 rounded-xl border border-white/10 backdrop-blur-md">
              <span className="text-[11px] text-amber-300 block mb-0.5 font-medium">الوقت المتبقي:</span>
              <span className="font-mono text-lg sm:text-xl font-bold text-white block">
                {prayerData.nextPrayer.remainingFormatted}
              </span>
            </div>
          </div>

          {/* Main 6 Prayers Grid */}
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-2.5">
            {prayerCards.map((p) => {
              const IconComp = p.icon;
              return (
                <div
                  key={p.id}
                  className={`p-3 rounded-2xl border text-center transition-all ${
                    p.isNext
                      ? 'bg-amber-500/10 dark:bg-amber-950/40 border-amber-500 shadow-md ring-2 ring-amber-500/30'
                      : p.isCurrent
                      ? 'bg-emerald-500/10 dark:bg-emerald-950/40 border-emerald-500/40'
                      : 'bg-white dark:bg-stone-850 border-stone-200 dark:border-stone-800'
                  }`}
                >
                  <div className="flex items-center justify-center gap-1.5 text-xs font-bold text-stone-700 dark:text-stone-300 mb-1">
                    <IconComp className="w-3.5 h-3.5 text-amber-600 dark:text-amber-400" />
                    <span>{p.name}</span>
                  </div>
                  <div className="font-mono text-base font-bold text-stone-900 dark:text-stone-100">
                    {p.time}
                  </div>
                  {p.isNext && (
                    <span className="text-[10px] font-bold text-amber-700 dark:text-amber-300">
                      القادم 🔔
                    </span>
                  )}
                </div>
              );
            })}
          </div>

          {/* Audio Test Bar */}
          <div className="p-3.5 rounded-2xl bg-amber-50/70 dark:bg-stone-850 border border-amber-200 dark:border-stone-800 flex items-center justify-between gap-3 text-xs">
            <div className="flex items-center gap-2 text-stone-700 dark:text-stone-300">
              <Volume2 className="w-4 h-4 text-amber-600 shrink-0" />
              <span>سماع الأذان المبارك بصوت الشيخ عبدالباسط عبدالصمد أو العفاسي:</span>
            </div>
            <button
              onClick={handleToggleAdhan}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl font-bold text-white transition shadow-xs cursor-pointer active:scale-95 ${
                isAdhanPlaying ? 'bg-rose-600 hover:bg-rose-700' : 'bg-amber-700 hover:bg-amber-600'
              }`}
            >
              {isAdhanPlaying ? <Square className="w-3.5 h-3.5 fill-white" /> : <Play className="w-3.5 h-3.5 fill-white" />}
              <span>{isAdhanPlaying ? 'إيقاف' : 'تشغيل'}</span>
            </button>
          </div>

        </div>

        {/* Modal Footer */}
        <div className="p-4 bg-stone-50 dark:bg-stone-850/80 border-t border-stone-200 dark:border-stone-800 flex items-center justify-between text-xs text-stone-500">
          <span>الموقع: {activeLocation.name} ({activeLocation.country})</span>
          <button
            onClick={onClose}
            className="px-4 py-1.5 rounded-xl bg-stone-200 dark:bg-stone-700 hover:bg-stone-300 dark:hover:bg-stone-600 text-stone-800 dark:text-stone-200 font-bold transition-colors cursor-pointer"
          >
            إغلاق
          </button>
        </div>
      </div>
    </div>
  );
};
