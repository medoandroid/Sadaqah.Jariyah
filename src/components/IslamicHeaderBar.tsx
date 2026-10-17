import React, { useState, useEffect, useMemo } from 'react';
import { Calendar, Heart, Sparkles, BookOpen, User, Wifi, WifiOff, Clock, FileJson } from 'lucide-react';
import { PWAInstallButton } from './PWAInstallButton';
import { userProfileService, UserProfile } from '../services/userProfileService';
import { useOfflineSync } from '../hooks/useOfflineSync';
import { prayerTimesService } from '../services/prayerTimesService';
import { PrayerTimesResult } from '../utils/prayerTimes';

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
  const { isOnline, isFullyOfflineReady } = useOfflineSync();
  const [prayerData, setPrayerData] = useState<PrayerTimesResult>(() => prayerTimesService.getPrayerTimes());

  useEffect(() => {
    return prayerTimesService.subscribe((res) => {
      setPrayerData(res);
    });
  }, []);

  const nextPrayerPreview = prayerData.nextPrayer;

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
    <div className="w-full bg-[#03160e] text-stone-200 text-xs py-2 px-3 sm:px-6 border-b border-amber-900/40 transition-colors select-none shadow-sm relative z-30">
      <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-center justify-between gap-2.5">
        
        {/* Date & User Kinship Greeting Zone */}
        <div className="w-full md:w-auto flex items-center justify-between md:justify-start gap-2 sm:gap-3 overflow-x-auto scrollbar-none py-0.5">
          <div className="flex items-center gap-2 whitespace-nowrap shrink-0">
            <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-xl bg-amber-500/10 border border-amber-500/25 text-amber-300 font-semibold font-amiri text-xs sm:text-[13px] shadow-2xs">
              <Calendar className="w-3.5 h-3.5 text-amber-400 shrink-0" />
              <span>{prayerData.hijriDate?.fullFormatted || (hijriFormatted ? (hijriFormatted.includes('هـ') ? hijriFormatted : `${hijriFormatted} هـ`) : 'التقويم الهجري')}</span>
            </div>
            <span className="text-emerald-500/50 select-none">·</span>
            <span className="text-stone-300 font-medium text-xs sm:text-[12px] whitespace-nowrap">
              {gregorianFormatted}
            </span>
          </div>

          <span className="hidden md:inline text-stone-700">|</span>

          {/* Local User Greeting & Kinship Badge */}
          <button
            onClick={onOpenProfile}
            className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-xl bg-emerald-950/70 hover:bg-emerald-900/80 border border-amber-500/30 text-amber-200 hover:text-amber-100 transition-all cursor-pointer text-xs shrink-0 whitespace-nowrap shadow-2xs active:scale-95"
            title="تحديد صلتك بالأعمام الكرام (صديق، قريب، فاعل خير)"
          >
            <Heart className="w-3 h-3 text-amber-400 shrink-0 fill-amber-400/40" />
            <span className="font-semibold text-amber-300">
              {userProfileService.getConnectionBadge(profile)}
            </span>
            {profile.userName && (
              <span className="text-stone-300 font-normal truncate max-w-[75px]">({profile.userName})</span>
            )}
          </button>
        </div>

        {/* Quick Direct Spiritual Actions Strip */}
        <div className="w-full md:w-auto flex items-center justify-between md:justify-end gap-2 sm:gap-3 text-xs overflow-x-auto scrollbar-none py-0.5">
          
          {/* Prayer Times Modal Trigger with 12-Hour format & countdown */}
          {onOpenPrayerTimes && (
            <button
              onClick={onOpenPrayerTimes}
              className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-xl bg-emerald-950/70 hover:bg-emerald-900/80 border border-emerald-600/40 text-stone-200 hover:text-amber-200 transition-all cursor-pointer whitespace-nowrap shrink-0 shadow-2xs group"
              title="مواقيت الصلاة اليومية (نظام ١٢ ساعة)"
            >
              <Clock className="w-3.5 h-3.5 text-amber-400 shrink-0 group-hover:scale-110 transition-transform" />
              {nextPrayerPreview ? (
                <span className="flex items-center gap-1">
                  <span>{nextPrayerPreview.arabicName}</span>
                  <strong className="text-amber-300 tabular-nums">{nextPrayerPreview.time}</strong>
                  <span className="text-emerald-400/90 text-[10px] hidden sm:inline">· {nextPrayerPreview.remainingFormatted}</span>
                </span>
              ) : (
                <span>مواقيت الصلاة</span>
              )}
            </button>
          )}

          {/* Khatmah Trigger */}
          <button
            onClick={onOpenKhatmah}
            className="hidden sm:inline-flex items-center gap-1 text-stone-300 hover:text-amber-300 transition-colors cursor-pointer whitespace-nowrap shrink-0"
          >
            <BookOpen className="w-3.5 h-3.5 text-amber-400 shrink-0" />
            <span>ختمة القرآن</span>
          </button>

          {/* Spiritual Reminders Trigger */}
          {onOpenEgyptianCompanion && (
            <button
              onClick={onOpenEgyptianCompanion}
              className="hidden lg:inline-flex items-center gap-1.5 px-2.5 py-1 rounded-xl bg-emerald-950/60 hover:bg-emerald-900/70 border border-emerald-700/30 text-stone-200 hover:text-amber-200 transition-all cursor-pointer text-xs whitespace-nowrap shrink-0"
              title="خواطر وتذكير بالخير: تذكير بالورد والقرآن ونصح طيب"
            >
              <Sparkles className="w-3 h-3 text-amber-400 shrink-0" />
              <span>خواطر وتذكير</span>
            </button>
          )}

          {/* Backup & Restore Modal Trigger */}
          {onOpenBackup && (
            <button
              onClick={onOpenBackup}
              className="hidden xl:inline-flex items-center gap-1 text-stone-300 hover:text-amber-300 transition-colors cursor-pointer whitespace-nowrap shrink-0"
              title="النسخ الاحتياطي واستعادة البيانات"
            >
              <FileJson className="w-3.5 h-3.5 text-amber-400 shrink-0" />
              <span>النسخ الاحتياطي</span>
            </button>
          )}

          {/* Offline Center Trigger Button */}
          {onOpenOfflineManager && (
            <button
              onClick={onOpenOfflineManager}
              className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-xl border text-xs transition-all cursor-pointer whitespace-nowrap shrink-0 ${
                isOnline
                  ? 'bg-emerald-950/60 hover:bg-emerald-900/70 border-emerald-700/30 text-stone-200 hover:text-emerald-300'
                  : 'bg-amber-950/80 hover:bg-amber-900 border-amber-500/50 text-amber-300 animate-pulse'
              }`}
              title="إدارة العمل والمصحف بدون إنترنت ومزامنة البيانات"
            >
              {isOnline ? (
                <Wifi className="w-3 h-3 text-emerald-400 shrink-0" />
              ) : (
                <WifiOff className="w-3 h-3 text-amber-400 shrink-0" />
              )}
              <span className="hidden sm:inline">{isOnline ? (isFullyOfflineReady ? 'مصحف Offline جاهز' : 'وضع Offline') : 'بدون إنترنت'}</span>
              <span className="sm:hidden">{isOnline ? 'Offline' : 'انقطاع'}</span>
            </button>
          )}

          {/* PWA Install Button */}
          <PWAInstallButton variant="badge" />

          {/* Dedication Trigger */}
          <button
            onClick={onOpenDedication}
            className="inline-flex items-center gap-1.5 px-3 py-1 rounded-xl bg-gradient-to-r from-amber-700 to-amber-800 hover:from-amber-600 hover:to-amber-700 text-white font-bold transition-all cursor-pointer whitespace-nowrap shrink-0 shadow-xs active:scale-95"
          >
            <Heart className="w-3 h-3 fill-amber-300 text-amber-300 shrink-0" />
            <span>إهداء ثواب</span>
          </button>
        </div>

      </div>
    </div>
  );
};
