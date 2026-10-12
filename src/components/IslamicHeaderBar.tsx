import React, { useState, useEffect, useMemo } from 'react';
import { Calendar, Heart, Sparkles, BookOpen, User, Wifi, WifiOff, Clock, Compass, FileJson } from 'lucide-react';
import { PWAInstallButton } from './PWAInstallButton';
import { userProfileService, UserProfile } from '../services/userProfileService';
import { useOfflineSync } from '../hooks/useOfflineSync';
import { calculatePrayerTimes, POPULAR_CITIES } from '../utils/prayerTimes';
import { storageService } from '../services/storageService';

export const IslamicHeaderBar: React.FC<{
  onOpenKhatmah: () => void;
  onOpenDedication: () => void;
  onOpenProfile: () => void;
  onOpenOfflineManager?: () => void;
  onOpenPrayerTimes?: () => void;
  onOpenBackup?: () => void;
  onOpenEgyptianCompanion?: () => void;
}> = ({
  onOpenKhatmah,
  onOpenDedication,
  onOpenProfile,
  onOpenOfflineManager,
  onOpenPrayerTimes,
  onOpenBackup,
  onOpenEgyptianCompanion,
}) => {
  const [profile, setProfile] = useState<UserProfile>(userProfileService.getProfile());
  const { isOnline, isFullyOfflineReady, downloadedSurahsCount } = useOfflineSync();
  const [now, setNow] = useState(() => new Date());

  useEffect(() => {
    const timer = setInterval(() => setNow(new Date()), 10000);
    return () => clearInterval(timer);
  }, []);

  const nextPrayerPreview = useMemo(() => {
    try {
      const cityId = storageService.getString('prayer_selected_city', 'cairo');
      const customCoords = storageService.get<{ lat: number; lng: number } | null>('prayer_custom_coords', null);
      const methodId = storageService.getNumber('prayer_selected_method', 5);
      
      let lat = 30.0444;
      let lng = 31.2357;
      let tz = -now.getTimezoneOffset() / 60;

      if (customCoords) {
        lat = customCoords.lat;
        lng = customCoords.lng;
      } else {
        const found = POPULAR_CITIES.find((c) => c.id === cityId);
        if (found) {
          lat = found.latitude;
          lng = found.longitude;
          tz = found.timezone;
        }
      }

      const res = calculatePrayerTimes(now, lat, lng, tz, methodId);
      return res.nextPrayer;
    } catch (e) {
      return null;
    }
  }, [now]);

  useEffect(() => {
    return userProfileService.subscribe((updated) => {
      setProfile(updated);
    });
  }, []);

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

  return (
    <div className="w-full bg-[#181614] text-stone-300 text-xs py-2 px-3 sm:px-6 border-b border-amber-950/60 transition-colors select-none">
      <div className="max-w-7xl mx-auto flex flex-wrap items-center justify-between gap-2.5">
        
        {/* Date & User Greeting */}
        <div className="flex items-center gap-2 sm:gap-3 flex-wrap">
          <div className="flex items-center gap-1.5 text-amber-400 font-semibold font-amiri text-xs sm:text-sm">
            <Calendar className="w-3.5 h-3.5 text-amber-500 shrink-0" />
            {hijriFormatted && (
              <>
                <span>{hijriFormatted}</span>
                <span className="text-stone-600">·</span>
              </>
            )}
            <span className="text-stone-300 font-normal">{gregorianFormatted}</span>
          </div>

          <span className="hidden md:inline text-stone-600">|</span>

          {/* Local User Greeting & Kinship Badge Trigger */}
          <button
            onClick={onOpenProfile}
            className="flex items-center gap-1.5 px-2.5 py-0.5 rounded-lg bg-stone-850 hover:bg-stone-800 border border-stone-750 text-stone-300 hover:text-amber-300 transition-colors cursor-pointer text-[11px]"
            title="تحديد صلتك بالأعمام الكرام (صديق، قريب، فاعل خير)"
          >
            <Heart className="w-3 h-3 text-amber-400 shrink-0" />
            <span className="font-medium text-amber-200">
              {userProfileService.getConnectionBadge(profile)}
            </span>
            {profile.userName && (
              <span className="text-stone-400 font-normal">({profile.userName})</span>
            )}
          </button>
        </div>

        {/* Quick Direct Spiritual Actions */}
        <div className="flex items-center gap-3 sm:gap-4 text-[11px] sm:text-xs">
          <button
            onClick={onOpenKhatmah}
            className="flex items-center gap-1 text-stone-300 hover:text-amber-300 transition-colors cursor-pointer"
          >
            <BookOpen className="w-3.5 h-3.5 text-amber-500" />
            <span>ختمة القرآن (٣٠ جزءاً)</span>
          </button>

          {/* Spiritual Reminders Trigger */}
          {onOpenEgyptianCompanion && (
            <button
              onClick={onOpenEgyptianCompanion}
              className="flex items-center gap-1.5 px-2.5 py-0.5 rounded-lg bg-stone-850 hover:bg-stone-800 border border-stone-750 text-stone-300 hover:text-amber-300 transition-colors cursor-pointer text-[11px] font-medium"
              title="خواطر وتذكير بالخير: تذكير بالورد والقرآن ونصح طيب"
            >
              <Sparkles className="w-3 h-3 text-amber-400" />
              <span className="hidden sm:inline">خواطر وتذكير بالخير</span>
              <span className="sm:hidden">خواطر وتذكير</span>
            </button>
          )}

          {/* Prayer Times Modal Trigger with 12-Hour format */}
          {onOpenPrayerTimes && (
            <button
              onClick={onOpenPrayerTimes}
              className="flex items-center gap-1.5 text-stone-300 hover:text-amber-300 transition-colors cursor-pointer"
              title="مواقيت الصلاة اليومية (نظام ١٢ ساعة)"
            >
              <Clock className="w-3.5 h-3.5 text-amber-400" />
              {nextPrayerPreview ? (
                <span>
                  {nextPrayerPreview.arabicName} <strong className="text-amber-300">{nextPrayerPreview.time}</strong>
                </span>
              ) : (
                <>
                  <span className="hidden sm:inline">مواقيت الصلاة (١٢ س)</span>
                  <span className="sm:hidden">المواقيت</span>
                </>
              )}
            </button>
          )}

          {/* Backup & Restore Modal Trigger */}
          {onOpenBackup && (
            <button
              onClick={onOpenBackup}
              className="hidden lg:flex items-center gap-1 text-stone-300 hover:text-amber-300 transition-colors cursor-pointer"
              title="النسخ الاحتياطي واستعادة البيانات"
            >
              <FileJson className="w-3.5 h-3.5 text-amber-400" />
              <span>النسخ الاحتياطي</span>
            </button>
          )}

          {/* Offline Center Trigger Button */}
          {onOpenOfflineManager && (
            <button
              onClick={onOpenOfflineManager}
              className={`flex items-center gap-1 px-2 py-0.5 rounded-lg border text-[11px] transition-colors cursor-pointer ${
                isOnline
                  ? 'bg-stone-850 hover:bg-stone-800 border-stone-750 text-stone-300 hover:text-emerald-300'
                  : 'bg-amber-950/80 hover:bg-amber-900 border-amber-500/50 text-amber-300'
              }`}
              title="إدارة العمل والمصحف بدون إنترنت ومزامنة البيانات"
            >
              {isOnline ? (
                <Wifi className="w-3 h-3 text-emerald-400 shrink-0" />
              ) : (
                <WifiOff className="w-3 h-3 text-amber-400 shrink-0" />
              )}
              <span>{isOnline ? (isFullyOfflineReady ? 'مصحف Offline جاهز' : 'وضع Offline') : 'بدون إنترنت'}</span>
            </button>
          )}

          <span className="text-stone-700">·</span>

          {/* PWA Install Button */}
          <PWAInstallButton variant="badge" />

          <button
            onClick={onOpenDedication}
            className="flex items-center gap-1.5 text-amber-300 hover:text-amber-200 font-bold transition-colors cursor-pointer"
          >
            <Heart className="w-3.5 h-3.5 fill-amber-400 text-amber-400" />
            <span>إهداء ثواب لروحه</span>
          </button>
        </div>

      </div>
    </div>
  );
};
