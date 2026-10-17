/**
 * Centralized Unified Smart Prayer Times & Adhan Service
 * - Single source of truth for all prayer times, countdowns, next prayer detection, and adhan across the application
 * - Real AlAdhan API sync with automatic DST, multi-day caching, and astronomical offline fallback
 * - 1-second accurate ticker for countdowns and period progress
 * - Built-in browser system notifications and audio Adhan playback with verified reciters
 * - High-accuracy GPS location detection with Arabic reverse geocoding
 */

import {
  calculatePrayerTimes,
  fetchRealPrayerTimes,
  POPULAR_CITIES,
  CALCULATION_METHODS,
  ADHAN_VOICES,
  CityLocation,
  PrayerTimesResult,
  AdhanVoice,
  calculateQibla,
  formatRemainingTime,
  parseTimeToDate,
  formatTo12Hour,
  formatTo24Hour,
} from '../utils/prayerTimes';
import { storageService } from './storageService';
import { playPeacefulChime } from '../utils/soundEffects';

export interface PrayerSettings {
  cityId: string;
  methodId: number;
  customCoords: { lat: number; lng: number; label: string } | null;
  selectedAdhanVoice: string;
  enableAdhanSound: boolean;
  enableNotifications: boolean;
  volume: number;
}

type Subscriber = (result: PrayerTimesResult, settings: PrayerSettings) => void;
type AdhanSubscriber = (isPlaying: boolean, activeVoice: AdhanVoice | null) => void;

class PrayerTimesService {
  private currentResult: PrayerTimesResult;
  private settings: PrayerSettings;
  private listeners: Set<Subscriber> = new Set();
  private adhanListeners: Set<AdhanSubscriber> = new Set();
  private tickerInterval: NodeJS.Timeout | null = null;
  private refreshInterval: NodeJS.Timeout | null = null;
  private isFetching: boolean = false;

  // Audio Adhan Controller
  private adhanAudio: HTMLAudioElement | null = null;
  private isAdhanPlayingState: boolean = false;
  private activeVoiceObj: AdhanVoice | null = null;

  // Track prayers already alerted today to prevent repeating
  private alertedPrayersToday: Set<string> = new Set();
  private lastAlertDay: number = new Date().getDate();

  constructor() {
    this.settings = this.loadSettings();
    const loc = this.getActiveLocation();

    // Instant offline-safe baseline
    this.currentResult = calculatePrayerTimes(
      new Date(),
      loc.latitude,
      loc.longitude,
      loc.timezone,
      this.settings.methodId,
      loc.name,
      loc.country
    );

    // Initial background fetch from AlAdhan API
    this.fetchTimes(false);

    // High-resolution ticker every 1000ms for accurate countdowns & adhan triggers
    this.tickerInterval = setInterval(() => {
      this.tick();
    }, 1000);

    // Auto-refresh from AlAdhan API every 30 minutes
    this.refreshInterval = setInterval(() => {
      this.fetchTimes(false);
    }, 30 * 60 * 1000);
  }

  private loadSettings(): PrayerSettings {
    const cityId = storageService.getString('prayer_selected_city', 'cairo');
    const methodId = storageService.getNumber('prayer_selected_method', 5);
    const customCoords = storageService.get<{ lat: number; lng: number; label: string } | null>(
      'prayer_custom_coords',
      null
    );
    const selectedAdhanVoice = storageService.getString('prayer_selected_adhan_voice', 'abdulbasit');
    const enableAdhanSound = storageService.get<boolean>('prayer_enable_adhan_sound', false);
    const enableNotifications = storageService.get<boolean>('prayer_enable_notifications', false);
    const volume = storageService.getNumber('prayer_volume', 0.9);

    return {
      cityId,
      methodId,
      customCoords,
      selectedAdhanVoice,
      enableAdhanSound,
      enableNotifications,
      volume,
    };
  }

  public getSettings(): PrayerSettings {
    return { ...this.settings };
  }

  public getActiveLocation(): CityLocation {
    if (this.settings.customCoords) {
      return {
        id: 'custom',
        name: this.settings.customCoords.label,
        country: 'موقعي الجغرافي',
        latitude: this.settings.customCoords.lat,
        longitude: this.settings.customCoords.lng,
        timezone: -new Date().getTimezoneOffset() / 60,
      };
    }
    const found = POPULAR_CITIES.find((c) => c.id === this.settings.cityId);
    return found || POPULAR_CITIES[0];
  }

  public getPrayerTimes(): PrayerTimesResult {
    return this.currentResult;
  }

  public subscribe(fn: Subscriber): () => void {
    this.listeners.add(fn);
    fn(this.currentResult, this.settings);
    return () => {
      this.listeners.delete(fn);
    };
  }

  public subscribeAdhan(fn: AdhanSubscriber): () => void {
    this.adhanListeners.add(fn);
    fn(this.isAdhanPlayingState, this.activeVoiceObj);
    return () => {
      this.adhanListeners.delete(fn);
    };
  }

  private notify() {
    this.listeners.forEach((fn) => {
      try {
        fn(this.currentResult, this.settings);
      } catch (e) {}
    });
  }

  private notifyAdhan() {
    this.adhanListeners.forEach((fn) => {
      try {
        fn(this.isAdhanPlayingState, this.activeVoiceObj);
      } catch (e) {}
    });
  }

  public async setCity(cityId: string) {
    this.settings.cityId = cityId;
    this.settings.customCoords = null;
    storageService.setString('prayer_selected_city', cityId);
    storageService.remove('prayer_custom_coords');
    this.notify();
    await this.fetchTimes(true);
  }

  public async setMethod(methodId: number) {
    this.settings.methodId = methodId;
    storageService.setNumber('prayer_selected_method', methodId);
    this.notify();
    await this.fetchTimes(true);
  }

  public async setCustomCoords(coords: { lat: number; lng: number; label: string }) {
    this.settings.customCoords = coords;
    storageService.set('prayer_custom_coords', coords);
    this.notify();
    await this.fetchTimes(true);
  }

  public setAdhanVoice(voiceId: string) {
    this.settings.selectedAdhanVoice = voiceId;
    storageService.setString('prayer_selected_adhan_voice', voiceId);
    this.notify();
  }

  public setEnableAdhanSound(enabled: boolean) {
    this.settings.enableAdhanSound = enabled;
    storageService.set('prayer_enable_adhan_sound', enabled);
    this.notify();
  }

  public async setEnableNotifications(enabled: boolean): Promise<boolean> {
    if (enabled && typeof window !== 'undefined' && 'Notification' in window) {
      if (Notification.permission !== 'granted') {
        const permission = await Notification.requestPermission();
        if (permission !== 'granted') {
          this.settings.enableNotifications = false;
          storageService.set('prayer_enable_notifications', false);
          this.notify();
          return false;
        }
      }
    }
    this.settings.enableNotifications = enabled;
    storageService.set('prayer_enable_notifications', enabled);
    this.notify();
    return enabled;
  }

  public setVolume(vol: number) {
    const clamped = Math.min(1, Math.max(0, vol));
    this.settings.volume = clamped;
    storageService.setNumber('prayer_volume', clamped);
    if (this.adhanAudio) {
      this.adhanAudio.volume = clamped;
    }
    this.notify();
  }

  public async refresh(): Promise<PrayerTimesResult> {
    return this.fetchTimes(true);
  }

  /**
   * High-accuracy GPS detection with Arabic reverse geocoding
   */
  public async detectGPSLocation(): Promise<{ success: boolean; label?: string; error?: string }> {
    if (typeof navigator === 'undefined' || !navigator.geolocation) {
      return { success: false, error: 'المتصفح لا يدعم تحديد الموقع الجغرافي' };
    }

    return new Promise((resolve) => {
      navigator.geolocation.getCurrentPosition(
        async (pos) => {
          const lat = Math.round(pos.coords.latitude * 10000) / 10000;
          const lng = Math.round(pos.coords.longitude * 10000) / 10000;

          let cityLabel = 'موقعي الحالي';
          let countryLabel = '';

          // 1. Try BigDataCloud free client reverse geocoding
          try {
            const geoRes = await fetch(
              `https://api.bigdatacloud.net/data/reverse-geocode-client?latitude=${lat}&longitude=${lng}&localityLanguage=ar`
            );
            if (geoRes.ok) {
              const geoData = await geoRes.json();
              if (geoData.city || geoData.locality) {
                cityLabel = geoData.city || geoData.locality;
              }
              if (geoData.countryName) {
                countryLabel = geoData.countryName;
              }
            }
          } catch (e) {
            // Fallback to coordinates
          }

          const fullLabel = countryLabel ? `${cityLabel} (${countryLabel})` : cityLabel;
          const custom = { lat, lng, label: fullLabel };

          await this.setCustomCoords(custom);
          resolve({ success: true, label: fullLabel });
        },
        (err) => {
          let msg = 'تعذر الوصول إلى الموقع الجغرافي';
          if (err.code === 1) {
            msg = 'تم رفض إذن تحديد الموقع. يرجى السماح للتطبيق بالوصول للموقع من إعدادات المتصفح';
          } else if (err.code === 2) {
            msg = 'موقعك غير متاح حالياً. يرجى التأكد من تشغيل الـ GPS';
          } else if (err.code === 3) {
            msg = 'انتهت مهلة تحديد الموقع الجغرافي';
          }
          resolve({ success: false, error: msg });
        },
        { enableHighAccuracy: true, timeout: 10000, maximumAge: 60000 }
      );
    });
  }

  /**
   * Adhan Audio Controller
   */
  public playAdhan(voiceId?: string): void {
    const targetVoiceId = voiceId || this.settings.selectedAdhanVoice;
    const voice = ADHAN_VOICES.find((v) => v.id === targetVoiceId) || ADHAN_VOICES[0];

    // If already playing this voice, stop it (toggle behavior)
    if (this.isAdhanPlayingState && this.activeVoiceObj?.id === voice.id) {
      this.stopAdhan();
      return;
    }

    this.stopAdhan();

    // Fallback electronic chime if selected or offline chime
    if (voice.isFallbackChime || !voice.url) {
      playPeacefulChime();
      this.isAdhanPlayingState = true;
      this.activeVoiceObj = voice;
      this.notifyAdhan();
      setTimeout(() => {
        this.isAdhanPlayingState = false;
        this.activeVoiceObj = null;
        this.notifyAdhan();
      }, 3500);
      return;
    }

    try {
      this.adhanAudio = new Audio(voice.url);
      this.adhanAudio.volume = this.settings.volume;

      this.adhanAudio.onplay = () => {
        this.isAdhanPlayingState = true;
        this.activeVoiceObj = voice;
        this.notifyAdhan();
      };

      this.adhanAudio.onended = () => {
        this.isAdhanPlayingState = false;
        this.activeVoiceObj = null;
        this.adhanAudio = null;
        this.notifyAdhan();
      };

      this.adhanAudio.onerror = () => {
        // Fallback to peaceful Web Audio chime
        playPeacefulChime();
        this.isAdhanPlayingState = false;
        this.activeVoiceObj = null;
        this.adhanAudio = null;
        this.notifyAdhan();
      };

      this.adhanAudio.play().catch(() => {
        playPeacefulChime();
        this.isAdhanPlayingState = false;
        this.activeVoiceObj = null;
        this.notifyAdhan();
      });
    } catch (e) {
      playPeacefulChime();
      this.isAdhanPlayingState = false;
      this.activeVoiceObj = null;
      this.notifyAdhan();
    }
  }

  public stopAdhan(): void {
    if (this.adhanAudio) {
      try {
        this.adhanAudio.pause();
        this.adhanAudio.currentTime = 0;
      } catch (e) {}
      this.adhanAudio = null;
    }
    this.isAdhanPlayingState = false;
    this.activeVoiceObj = null;
    this.notifyAdhan();
  }

  public isAdhanPlaying(): boolean {
    return this.isAdhanPlayingState;
  }

  public getPlayingVoice(): AdhanVoice | null {
    return this.activeVoiceObj;
  }

  /**
   * Main 1-second ticker:
   * Recalculates remaining countdowns without wiping real API prayer times!
   * Checks for prayer arrival and triggers audio / notifications.
   */
  private tick() {
    const now = new Date();
    const nowMs = now.getTime();

    // Check if new day rolled over -> fetch new times
    if (now.getDate() !== this.lastAlertDay) {
      this.lastAlertDay = now.getDate();
      this.alertedPrayersToday.clear();
      this.fetchTimes(false);
      return;
    }

    const { fajrDate, sunriseDate, dhuhrDate, asrDate, maghribDate, ishaDate } = this.currentResult;

    const prayerList: {
      id: 'fajr' | 'sunrise' | 'dhuhr' | 'asr' | 'maghrib' | 'isha';
      arabicName: string;
      date: Date;
      time12: string;
      time24: string;
      isObligatory: boolean;
    }[] = [
      { id: 'fajr', arabicName: 'الفجر', date: fajrDate, time12: this.currentResult.fajr, time24: this.currentResult.fajr24, isObligatory: true },
      { id: 'sunrise', arabicName: 'الشروق', date: sunriseDate, time12: this.currentResult.sunrise, time24: this.currentResult.sunrise24, isObligatory: false },
      { id: 'dhuhr', arabicName: 'الظهر', date: dhuhrDate, time12: this.currentResult.dhuhr, time24: this.currentResult.dhuhr24, isObligatory: true },
      { id: 'asr', arabicName: 'العصر', date: asrDate, time12: this.currentResult.asr, time24: this.currentResult.asr24, isObligatory: true },
      { id: 'maghrib', arabicName: 'المغرب', date: maghribDate, time12: this.currentResult.maghrib, time24: this.currentResult.maghrib24, isObligatory: true },
      { id: 'isha', arabicName: 'العشاء', date: ishaDate, time12: this.currentResult.isha, time24: this.currentResult.isha24, isObligatory: true },
    ];

    let nextP = prayerList.find((p) => p.date.getTime() > nowMs);
    let nextDate = nextP ? nextP.date : new Date(fajrDate.getTime() + 24 * 60 * 60 * 1000);
    let nextId = nextP ? nextP.id : 'fajr';
    let nextArabic = nextP ? nextP.arabicName : 'الفجر (الغد)';
    let nextTime12 = nextP ? nextP.time12 : this.currentResult.fajr;
    let nextTime24 = nextP ? nextP.time24 : this.currentResult.fajr24;

    let prevP = [...prayerList].reverse().find((p) => p.date.getTime() <= nowMs);
    const prevDate = prevP ? prevP.date : new Date(ishaDate.getTime() - 24 * 60 * 60 * 1000);

    const remainingMs = Math.max(0, nextDate.getTime() - nowMs);
    const totalPeriodMs = Math.max(1000, nextDate.getTime() - prevDate.getTime());
    const elapsedPeriodMs = Math.max(0, nowMs - prevDate.getTime());
    const progressPercent = Math.min(100, Math.max(0, Math.round((elapsedPeriodMs / totalPeriodMs) * 100)));

    // Update countdown in currentResult
    this.currentResult.nextPrayer = {
      id: nextId,
      arabicName: nextArabic,
      time: nextTime12,
      time24: nextTime24,
      remainingMs,
      remainingFormatted: formatRemainingTime(remainingMs),
      remainingSecondsTotal: Math.floor(remainingMs / 1000),
      progressPercent,
    };

    if (prevP) {
      this.currentResult.currentPrayer = {
        id: prevP.id,
        arabicName: prevP.arabicName,
        time: prevP.time12,
        time24: prevP.time24,
      };
    }

    // Check for prayer arrival within a 45-second window
    prayerList.forEach((prayer) => {
      if (!prayer.isObligatory) return; // Skip sunrise for adhan
      const diff = nowMs - prayer.date.getTime();
      const alertKey = `${prayer.id}_${this.lastAlertDay}`;

      if (diff >= 0 && diff <= 45000 && !this.alertedPrayersToday.has(alertKey)) {
        this.alertedPrayersToday.add(alertKey);
        this.triggerPrayerAlarm(prayer.arabicName, this.getActiveLocation().name);
      }
    });

    this.notify();
  }

  /**
   * Fires Adhan audio and browser notification upon prayer time arrival
   */
  private triggerPrayerAlarm(prayerName: string, cityName: string) {
    // 1. Play Adhan audio if enabled
    if (this.settings.enableAdhanSound) {
      this.playAdhan();
    }

    // 2. Browser system notification if enabled & permitted
    if (this.settings.enableNotifications && typeof window !== 'undefined' && 'Notification' in window) {
      if (Notification.permission === 'granted') {
        try {
          new Notification(`حان الآن موعد أذان ${prayerName}`, {
            body: `حسب التوقيت المحلي لمدينة ${cityName}. حي على الصلاة، حي على الفلاح 🤲`,
            icon: '/icons/icon-192.png',
            tag: `prayer_${prayerName}`,
            requireInteraction: false,
          });
        } catch (e) {}
      }
    }
  }

  /**
   * Fetches real prayer times from AlAdhan API
   */
  private async fetchTimes(forceNotify = false): Promise<PrayerTimesResult> {
    if (this.isFetching) return this.currentResult;
    this.isFetching = true;

    try {
      const loc = this.getActiveLocation();
      const res = await fetchRealPrayerTimes(loc, this.settings.methodId, new Date());
      this.currentResult = res;
      this.notify();
      return res;
    } catch (e) {
      return this.currentResult;
    } finally {
      this.isFetching = false;
    }
  }
}

export const prayerTimesService = new PrayerTimesService();
