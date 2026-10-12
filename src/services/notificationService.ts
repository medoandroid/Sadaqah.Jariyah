import { storageService } from './storageService';

export interface DhikrNotificationSettings {
  enabled: boolean;
  intervalMinutes: number; // e.g. 15, 30, 60, 120, 180
  soundEnabled: boolean;
  quietHoursEnabled: boolean;
  quietStartHour: number; // e.g. 23 (11 PM)
  quietEndHour: number; // e.g. 6 (6 AM)
  categories: {
    salawat: boolean; // الصلاة على النبي ﷺ
    istighfar: boolean; // الاستغفار
    tasbeeh: boolean; // التسبيح والتحميد والتكبير
    hawqala: boolean; // الحوقلة
    baqiyat: boolean; // الباقيات الصالحات
    deceasedDuas: boolean; // أدعية المغفور لهم وعائلة الشهاوي
  };
  lastNotificationTimestamp: number;
}

export interface DhikrNotificationItem {
  id: string;
  category: 'salawat' | 'istighfar' | 'tasbeeh' | 'hawqala' | 'baqiyat' | 'deceasedDuas';
  title: string;
  body: string;
  virtue?: string;
}

export const NOTIFICATION_DHIKRS: DhikrNotificationItem[] = [
  // Salawat
  {
    id: 'salawat-1',
    category: 'salawat',
    title: 'الصَّلَاةُ عَلَى النَّبِيِّ ﷺ',
    body: 'اللَّهُمَّ صَلِّ وَسَلِّمْ وَبَارِكْ عَلَى نَبِيِّنَا مُحَمَّدٍ وَعَلَى آلِهِ وَصَحْبِهِ أَجْمَعِينَ',
    virtue: '«مَنْ صَلَّى عَلَيَّ صَلَاةً صَلَّى اللَّهُ عَلَيْهِ بِهَا عَشْرًا»',
  },
  {
    id: 'salawat-2',
    category: 'salawat',
    title: 'الصَّلَاةُ الإِبْرَاهِيمِيَّةُ ﷺ',
    body: 'اللَّهُمَّ صَلِّ عَلَى مُحَمَّدٍ وَعَلَى آلِ مُحَمَّدٍ، كَمَا صَلَّيْتَ عَلَى إِبْرَاهِيمَ وَعَلَى آلِ إِبْرَاهِيمَ، إِنَّكَ حَمِيدٌ مَجِيدٌ',
    virtue: 'أكمل صيغ الصلاة على النبي المصطفى ﷺ',
  },
  {
    id: 'salawat-3',
    category: 'salawat',
    title: 'تَفْرِيجُ الكُرُوبِ ﷺ',
    body: 'الصَّلَاةُ عَلَى الحَبِيبِ مِسْكٌ وَطِيبٌ وَشِفَاءٌ لِلْقُلُوبِ وَمَغْفِرَةٌ لِلذُّنُوبِ',
    virtue: '«إِذًا تُكْفَى هَمَّكَ، وَيُغْفَرُ لَكَ ذَنْبُكَ»',
  },

  // Istighfar
  {
    id: 'istighfar-1',
    category: 'istighfar',
    title: 'سَيِّدُ الاِسْتِغْفَارِ',
    body: 'اللَّهُمَّ أَنْتَ رَبِّي لَا إِلَهَ إِلَّا أَنْتَ، خَلَقْتَنِي وَأَنَا عَبْدُكَ، وَأَنَا عَلَى عَهْدِكَ وَوَعْدِكَ مَا اسْتَطَعْتُ',
    virtue: '«مَنْ قَالَهَا مُوقِنًا بِهَا فَمَاتَ مِنْ يَوْمِهِ أَوْ لَيْلَتِهِ دَخَلَ الجَنَّةَ»',
  },
  {
    id: 'istighfar-2',
    category: 'istighfar',
    title: 'مَغْفِرَةٌ وَفَرَجٌ',
    body: 'أَسْتَغْفِرُ اللَّهَ العَظِيمَ الَّذِي لَا إِلَهَ إِلَّا هُوَ الحَيَّ القَيُّومَ وَأَتُوبُ إِلَيْهِ',
    virtue: 'تُغفر بها الذنوب ولو كانت مثل زبد البحر',
  },
  {
    id: 'istighfar-3',
    category: 'istighfar',
    title: 'دُعَاءُ يُونُسَ عَلَيْهِ السَّلَامُ',
    body: 'لَا إِلَهَ إِلَّا أَنْتَ سُبْحَانَكَ إِنِّي كُنْتُ مِنَ الظَّالِمِينَ',
    virtue: '«لَمْ يَدْعُ بِهَا رَجُلٌ مُسْلِمٌ فِي شَيْءٍ قَطُّ إِلَّا اسْتَجَابَ اللَّهُ لَهُ»',
  },

  // Tasbeeh
  {
    id: 'tasbeeh-1',
    category: 'tasbeeh',
    title: 'كَلِمَتَانِ خَفِيفَتَانِ',
    body: 'سُبْحَانَ اللَّهِ وَبِحَمْدِهِ، سُبْحَانَ اللَّهِ العَظِيمِ',
    virtue: 'حبيبتان إلى الرحمن، خفيفتان على اللسان، ثقيلتان في الميزان',
  },
  {
    id: 'tasbeeh-2',
    category: 'tasbeeh',
    title: 'غِرَاسُ الجَنَّةِ',
    body: 'سُبْحَانَ اللَّهِ العَظِيمِ وَبِحَمْدِهِ',
    virtue: '«مَنْ قَالَ: سُبْحَانَ اللَّهِ العَظِيمِ وَبِحَمْدِهِ، غُرِسَتْ لَهُ نَخْلَةٌ فِي الجَنَّةِ»',
  },

  // Hawqala
  {
    id: 'hawqala-1',
    category: 'hawqala',
    title: 'كَنْزٌ مِنْ كُنُوزِ الجَنَّةِ',
    body: 'لَا حَوْلَ وَلَا قُوَّةَ إِلَّا بِاللَّهِ العَلِيِّ العَظِيمِ',
    virtue: 'باب من أبواب الجنة وكنز عظيم من كنوزها',
  },

  // Baqiyat
  {
    id: 'baqiyat-1',
    category: 'baqiyat',
    title: 'البَاقِيَاتُ الصَّالِحَاتُ',
    body: 'سُبْحَانَ اللَّهِ، وَالحَمْدُ لِلَّهِ، وَلَا إِلَهَ إِلَّا اللَّهُ، وَاللَّهُ أَكْبَرُ',
    virtue: '«أَحَبُّ الكَلَامِ إِلَى اللَّهِ أَرْبَعٌ: سُبْحَانَ اللَّهِ، وَالحَمْدُ لِلَّهِ، وَلَا إِلَهَ إِلَّا اللَّهُ، وَاللَّهُ أَكْبَرُ»',
  },

  // Deceased Duas
  {
    id: 'deceased-1',
    category: 'deceasedDuas',
    title: 'صَدَقَةٌ جَارِيَةٌ وَدُعَاءٌ لِلْمَوْتَى',
    body: 'اللَّهُمَّ اغْفِرْ لِأَمْوَاتِنَا وَأَمْوَاتِ المُسْلِمِينَ، وَاجْعَلْ قُبُورَهُمْ رَوْضَةً مِنْ رِيَاضِ الجَنَّةِ وَنُورًا لَا يَنْقَطِعُ',
    virtue: 'صدقة جارية عن عائلة الشهاوي وأرواح المغفور لهم بإذن الله',
  },
];

const SETTINGS_KEY = 'dhikr_notifications_settings_v1';

const DEFAULT_SETTINGS: DhikrNotificationSettings = {
  enabled: false,
  intervalMinutes: 60, // Every 1 hour
  soundEnabled: true,
  quietHoursEnabled: true,
  quietStartHour: 23, // 11 PM
  quietEndHour: 6, // 6 AM
  categories: {
    salawat: true,
    istighfar: true,
    tasbeeh: true,
    hawqala: true,
    baqiyat: true,
    deceasedDuas: true,
  },
  lastNotificationTimestamp: 0,
};

let schedulerTimer: any = null;

export const notificationService = {
  isNotificationSupported(): boolean {
    return typeof window !== 'undefined' && 'Notification' in window;
  },

  getPermissionStatus(): NotificationPermission {
    if (!this.isNotificationSupported()) return 'denied';
    return Notification.permission;
  },

  async requestPermission(): Promise<NotificationPermission> {
    if (!this.isNotificationSupported()) return 'denied';
    try {
      const permission = await Notification.requestPermission();
      if (permission === 'granted') {
        const settings = this.getSettings();
        if (!settings.enabled) {
          this.saveSettings({ enabled: true });
        }
        this.startBackgroundScheduler();
      }
      return permission;
    } catch (e) {
      console.warn('Notification permission error:', e);
      return 'denied';
    }
  },

  getSettings(): DhikrNotificationSettings {
    try {
      const saved = storageService.get<DhikrNotificationSettings | null>(SETTINGS_KEY, null);
      if (saved && typeof saved === 'object') {
        return {
          ...DEFAULT_SETTINGS,
          ...saved,
          categories: {
            ...DEFAULT_SETTINGS.categories,
            ...(saved.categories || {}),
          },
        };
      }
    } catch (e) {
      console.warn('Error reading notification settings:', e);
    }
    return DEFAULT_SETTINGS;
  },

  saveSettings(updates: Partial<DhikrNotificationSettings>): DhikrNotificationSettings {
    const current = this.getSettings();
    const updated: DhikrNotificationSettings = {
      ...current,
      ...updates,
    };
    storageService.set(SETTINGS_KEY, updated);

    if (updated.enabled && this.getPermissionStatus() === 'granted') {
      this.startBackgroundScheduler();
    } else {
      this.stopBackgroundScheduler();
    }

    return updated;
  },

  getRandomDhikr(): DhikrNotificationItem {
    const settings = this.getSettings();
    const eligible = NOTIFICATION_DHIKRS.filter((item) => {
      return settings.categories[item.category] !== false;
    });

    if (eligible.length === 0) {
      return NOTIFICATION_DHIKRS[0];
    }

    const idx = Math.floor(Math.random() * eligible.length);
    return eligible[idx];
  },

  isInsideQuietHours(): boolean {
    const settings = this.getSettings();
    if (!settings.quietHoursEnabled) return false;

    const now = new Date();
    const currentHour = now.getHours();

    const { quietStartHour, quietEndHour } = settings;

    // e.g. from 23 to 6
    if (quietStartHour > quietEndHour) {
      return currentHour >= quietStartHour || currentHour < quietEndHour;
    }
    return currentHour >= quietStartHour && currentHour < quietEndHour;
  },

  async triggerNotification(item?: DhikrNotificationItem): Promise<boolean> {
    if (!this.isNotificationSupported()) return false;
    if (this.getPermissionStatus() !== 'granted') return false;

    const dhikr = item || this.getRandomDhikr();
    const title = `صدقة جارية · ${dhikr.title} ✦`;
    const body = `${dhikr.body}${dhikr.virtue ? `\n«${dhikr.virtue}»` : ''}`;

    try {
      // 1. Try ServiceWorkerRegistration first (standard PWA way)
      if ('serviceWorker' in navigator) {
        const reg = await navigator.serviceWorker.getRegistration();
        if (reg && reg.showNotification) {
          await reg.showNotification(title, {
            body,
            icon: '/pwa-192x192.png',
            badge: '/pwa-192x192.png',
            tag: `dhikr-${dhikr.id}-${Date.now()}`,
            dir: 'rtl',
            lang: 'ar',
          } as NotificationOptions);
          return true;
        }
      }

      // 2. Fallback to window Notification constructor
      new Notification(title, {
        body,
        icon: '/pwa-192x192.png',
        badge: '/pwa-192x192.png',
        dir: 'rtl',
        lang: 'ar',
      });
      return true;
    } catch (e) {
      console.warn('Failed to show notification:', e);
      return false;
    }
  },

  async sendTestNotification(): Promise<boolean> {
    const perm = await this.requestPermission();
    if (perm !== 'granted') return false;

    const testItem: DhikrNotificationItem = {
      id: 'test-salawat',
      category: 'salawat',
      title: 'الصَّلَاةُ عَلَى النَّبِيِّ ﷺ',
      body: 'اللَّهُمَّ صَلِّ وَسَلِّمْ وَبَارِكْ عَلَى نَبِيِّنَا مُحَمَّدٍ وَعَلَى آلِهِ وَصَحْبِهِ أَجْمَعِينَ',
      virtue: 'إشعار تجريبي ناجح من منصة صدقة جارية - عائلة الشهاوي',
    };

    return this.triggerNotification(testItem);
  },

  startBackgroundScheduler(): void {
    this.stopBackgroundScheduler();

    const settings = this.getSettings();
    if (!settings.enabled) return;
    if (this.getPermissionStatus() !== 'granted') return;

    // Check interval every minute
    schedulerTimer = setInterval(() => {
      const currentSettings = this.getSettings();
      if (!currentSettings.enabled) {
        this.stopBackgroundScheduler();
        return;
      }

      if (this.isInsideQuietHours()) {
        return;
      }

      const now = Date.now();
      const intervalMs = Math.max(5, currentSettings.intervalMinutes) * 60 * 1000;
      const lastTime = currentSettings.lastNotificationTimestamp || 0;

      if (now - lastTime >= intervalMs) {
        this.saveSettings({ lastNotificationTimestamp: now });
        this.triggerNotification();
      }
    }, 45 * 1000); // Check every 45 seconds
  },

  stopBackgroundScheduler(): void {
    if (schedulerTimer) {
      clearInterval(schedulerTimer);
      schedulerTimer = null;
    }
  },
};
