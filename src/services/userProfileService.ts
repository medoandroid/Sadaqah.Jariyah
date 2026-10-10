/**
 * Smart Kinship & Connection Identity Service
 * Connects each visitor to their relationship with the 4 honored deceased uncles:
 * - Friend or companion to one of the 4 (صديق لواحد من الأربعة)
 * - Family relative (من أهل وذوي المغفور لهم)
 * - General benefactor & suppliant (محب وفاعل خير يدعو للمسلمين)
 * Name is completely optional; identity is based on their bond and loyalty.
 */

import { HONORED_PERSONS } from '../data/persons';

export type ConnectionType = 'friend' | 'family_relative' | 'benefactor';

export type TargetUncleId =
  | 'all'
  | 'ramadan-elshahawy'
  | 'elshahawy-elshahawy'
  | 'elshafei-elshahawy'
  | 'ahmed-elshahawy';

export interface UserProfile {
  connectionType: ConnectionType;
  targetUncleId: TargetUncleId;
  kinshipTitle: string; // e.g. "صديق ورفيق درب", "ابن أخ", "ابن أخت", "قريب من العائلة", "محب للخير"
  userName: string; // Optional nickname
  closestRelative: string; // Optional custom name if they also want to pray for someone specific
  relativeRelation?: string;
  relativeStatus?: 'deceased' | 'living';
  personalIntention?: string;
  autoDedicate?: boolean;
  hasConfigured: boolean;
  updatedAt: number;
}

export interface TailoredPrayer {
  title: string;
  arabic: string;
  virtue: string;
  targetUncleName?: string;
}

const STORAGE_KEY = 'sadaqah_user_profile_v2';
const PROFILE_EVENT_KEY = 'sadaqah_profile_updated';

const DEFAULT_PROFILE: UserProfile = {
  connectionType: 'benefactor',
  targetUncleId: 'all',
  kinshipTitle: 'محب للخير وداعٍ بالرحمة',
  userName: '',
  closestRelative: '',
  relativeRelation: 'عام',
  relativeStatus: 'deceased',
  personalIntention: '',
  autoDedicate: false,
  hasConfigured: false,
  updatedAt: 0,
};

export const UNCLE_NAMES: Record<TargetUncleId, string> = {
  all: 'عمامي الأربعة رحمهم الله',
  'ramadan-elshahawy': 'العم رمضان الشهاوي عبدالمجيد',
  'elshahawy-elshahawy': 'العم الشهاوي الشهاوي عبدالمجيد',
  'elshafei-elshahawy': 'العم الشافعي الشهاوي عبدالمجيد',
  'ahmed-elshahawy': 'العم أحمد الشهاوي عبدالمجيد',
};

export const userProfileService = {
  getProfile(): UserProfile {
    if (typeof window === 'undefined') return DEFAULT_PROFILE;
    try {
      // Check v2 first
      const raw = localStorage.getItem(STORAGE_KEY);
      if (raw) {
        const parsed = JSON.parse(raw);
        return {
          connectionType: parsed.connectionType || 'benefactor',
          targetUncleId: parsed.targetUncleId || 'all',
          kinshipTitle: parsed.kinshipTitle || 'محب للخير وداعٍ بالرحمة',
          userName: typeof parsed.userName === 'string' ? parsed.userName : '',
          closestRelative: typeof parsed.closestRelative === 'string' ? parsed.closestRelative : '',
          relativeRelation: parsed.relativeRelation || 'عام',
          relativeStatus: parsed.relativeStatus === 'living' ? 'living' : 'deceased',
          personalIntention: typeof parsed.personalIntention === 'string' ? parsed.personalIntention : '',
          autoDedicate: Boolean(parsed.autoDedicate),
          hasConfigured: Boolean(parsed.hasConfigured),
          updatedAt: typeof parsed.updatedAt === 'number' ? parsed.updatedAt : Date.now(),
        };
      }

      // Backward compatibility fallback to v1 if exists
      const oldRaw = localStorage.getItem('sadaqah_user_profile_v1');
      if (oldRaw) {
        const oldParsed = JSON.parse(oldRaw);
        return {
          ...DEFAULT_PROFILE,
          userName: oldParsed.userName || '',
          closestRelative: oldParsed.closestRelative || '',
          hasConfigured: Boolean(oldParsed.hasConfigured),
        };
      }
    } catch (e) {
      console.warn('[userProfileService] Error reading profile:', e);
    }
    return DEFAULT_PROFILE;
  },

  saveProfile(updates: Partial<UserProfile>): UserProfile {
    const current = this.getProfile();
    const updated: UserProfile = {
      ...current,
      ...updates,
      hasConfigured: true,
      updatedAt: Date.now(),
    };

    if (typeof window !== 'undefined') {
      try {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
        window.dispatchEvent(new CustomEvent(PROFILE_EVENT_KEY, { detail: updated }));
      } catch (e) {
        console.warn('[userProfileService] Error saving profile:', e);
      }
    }

    return updated;
  },

  subscribe(callback: (profile: UserProfile) => void): () => void {
    if (typeof window === 'undefined') return () => {};

    const handler = (e: Event) => {
      const customEvent = e as CustomEvent<UserProfile>;
      if (customEvent.detail) {
        callback(customEvent.detail);
      } else {
        callback(this.getProfile());
      }
    };

    window.addEventListener(PROFILE_EVENT_KEY, handler);
    const storageHandler = (e: StorageEvent) => {
      if (e.key === STORAGE_KEY) {
        callback(this.getProfile());
      }
    };
    window.addEventListener('storage', storageHandler);

    return () => {
      window.removeEventListener(PROFILE_EVENT_KEY, handler);
      window.removeEventListener('storage', storageHandler);
    };
  },

  /**
   * Sets a quick party/connection with one click
   */
  setQuickParty(targetUncleId: TargetUncleId, connectionType: ConnectionType = 'friend', kinshipTitle?: string): UserProfile {
    const defaultTitles: Record<ConnectionType, string> = {
      friend: 'صديق ورفيق درب',
      family_relative: 'من الأهل والأقارب',
      benefactor: 'محب للخير وداعٍ بالرحمة'
    };
    return this.saveProfile({
      targetUncleId,
      connectionType,
      kinshipTitle: kinshipTitle || defaultTitles[connectionType],
      hasConfigured: true,
    });
  },

  /**
   * Returns a friendly visual connection badge text.
   */
  getConnectionBadge(p?: UserProfile): string {
    const profile = p || this.getProfile();
    if (!profile.hasConfigured) {
      return 'تحديد الطرف والصلة (اضغط للتخصيص)';
    }

    const uncleName = UNCLE_NAMES[profile.targetUncleId];

    if (profile.connectionType === 'friend') {
      if (profile.targetUncleId === 'all') {
        return '🤝 رفيق درب وصديق العائلة الكريمة';
      }
      return `🤝 من طرف ${uncleName} (${profile.kinshipTitle || 'صديق ورفيق درب'})`;
    }

    if (profile.connectionType === 'family_relative') {
      if (profile.targetUncleId === 'all') {
        return `🌿 من أهل وذوي المغفور لهم (${profile.kinshipTitle || 'صلة قرابة'})`;
      }
      return `🌿 من طرف ${uncleName} (${profile.kinshipTitle || 'من الأهل والأقارب'})`;
    }

    return '🤍 محب للخير وداعٍ بالرحمة';
  },

  /**
   * Returns a respectful, heartwarming greeting for the visitor based on their connection.
   */
  getGreetingText(p?: UserProfile): string {
    const profile = p || this.getProfile();
    const displayName = profile.userName ? `يا ${profile.userName}` : 'يا ضيفنا الكريم';

    if (!profile.hasConfigured) {
      return 'أهلاً بك يا كريم في روضة الصدقة الجارية المباركة.. تقبل الله طاعاتكم وصالح أعمالكم';
    }

    const uncleName = UNCLE_NAMES[profile.targetUncleId];

    if (profile.connectionType === 'friend') {
      if (profile.targetUncleId === 'all') {
        return `مرحباً بك ${displayName} يا رفيق درب العائلة وصديقهم الوفي.. جزاك الله خيراً على صدق الوفاء`;
      }
      return `مرحباً بك ${displayName} يا صاحب ورفيق درب ${uncleName} رحمه الله.. شكر الله وفاءك وبرك بصحبته الطيبة`;
    }

    if (profile.connectionType === 'family_relative') {
      if (profile.targetUncleId === 'all') {
        return `أهلاً بك ${displayName} يا كريم الأصل من أهلنا وذوي الأعمام الغاليين.. تقبل الله بركم المستمر ودعاءكم`;
      }
      return `أهلاً بك ${displayName} من أهل وذوي ${uncleName} رحمه الله.. جمعكم الله به في جنات النعيم على سرر متقابلين`;
    }

    return `أهلاً بك ${displayName} يا باغي الخير ورافع أكف الضراعة.. كتب الله لك أجر كل حرف ودعوة مباركة`;
  },

  /**
   * Returns the specific honored person object if targeting one uncle.
   */
  getTargetUncle(p?: UserProfile) {
    const profile = p || this.getProfile();
    if (profile.targetUncleId === 'all') return null;
    return HONORED_PERSONS.find((person) => person.id === profile.targetUncleId) || null;
  },

  /**
   * Generates intelligent, heartfelt supplications tailored to the exact relationship.
   */
  getSmartTailoredPrayers(p?: UserProfile): TailoredPrayer[] {
    const profile = p || this.getProfile();
    const uncle = this.getTargetUncle(profile);
    const uncleName = uncle ? uncle.name : 'عمامي الأربعة: رمضان، الشهاوي، الشافعي، وأحمد الشهاوي عبدالمجيد';

    if (profile.connectionType === 'friend') {
      return [
        {
          title: `دعاء وفاء الصحبة والمحبة في الله لـ (${uncle ? uncle.name : 'الأعمام الكرام'})`,
          arabic: `اللَّهُمَّ إِنَّ الصُّحْبَةَ أَمَانَةٌ، وَقَدْ كَانَتْ بَيْنَنَا مَوَدَّةٌ فِي طَاعَتِكَ، فَاللَّهُمَّ اجْزِ عَبْدَكَ ${uncleName} عَنْ صُحْبَتِهِ وَرِفْقَتِهِ الطَّيِّبَةِ خَيْرَ الْجَزَاءِ، وَاجْعَلْ مَا كَانَ بَيْنَنَا شَافِعاً لَهُ، وَافْسَحْ لَهُ فِي قَبْرِهِ مَدَّ بَصَرِهِ، وَاِجْمَعْنَا بِهِ فِي ظِلِّ عَرْشِكَ يَوْمَ لَا ظِلَّ إِلَّا ظِلُّكَ.`,
          virtue: 'وفاء لحق الصداقة والأخوة في الله بعد الوفاة، وهو من أعظم البر والمروءة.',
          targetUncleName: uncle ? uncle.name : undefined,
        },
        {
          title: `دعاء الفردوس ولقاء الأحبة`,
          arabic: `اللَّهُمَّ يَا جَامِعَ النَّاسِ لِيَوْمٍ لَا رَيْبَ فِيهِ، اِجْمَعْنَا مَعَ ${uncleName} فِي مُسْتَقَرِّ رَحْمَتِكَ عَلَى سُرُرٍ مُتَقَابِلِينَ، مَعَ النَّبِيِّينَ وَالصِّدِّيقِينَ وَالشُّهَدَاءِ وَالصَّالِحِينَ، وَحَسُنَ أُولَٰئِكَ رَفِيقًا.`,
          virtue: 'سؤال لقاء الأحبة والرفقة الصالحة في أعلى درجات الجنة.',
          targetUncleName: uncle ? uncle.name : undefined,
        },
        {
          title: `دعاء الأنس ونور القبر`,
          arabic: `اللَّهُمَّ آنِسْ وَحْشَةَ ${uncleName}، وَنَوِّرْ مَضْجَعَهُ، وَاجْعَلْ عَمَلَهُ الصَّالِحَ جَلِيساً وَأَنِيساً لَهُ، وَافْتَحْ لَهُ بَاباً إِلَى الْجَنَّةِ يَرَى مِنْهُ مَنْزِلَهُ وَتَهُبُّ عَلَيْهِ نَسَائِمُهَا.`,
          virtue: 'دعاء مستحب لتبديد ظلمة القبر وإدخال السرور والفسحة على الميت.',
          targetUncleName: uncle ? uncle.name : undefined,
        },
      ];
    }

    if (profile.connectionType === 'family_relative') {
      return [
        {
          title: `دعاء صلة الرحم وبر الأهل بعد الوفاة`,
          arabic: `اللَّهُمَّ يَا رَحْمَٰنُ يَا رَحِيمُ، أَنْتَ وَصَلْتَ الرَّحِمَ وَجَعَلْتَ حَقَّهَا عَظِيماً، فَاللَّهُمَّ ارْحَمْ فَقِيدَنَا ${uncleName} رَحْمَةً وَاسِعَةً، وَبَيِّضْ وَجْهَهُ يَوْمَ تَبْيَضُّ وُجُوهٌ، وَاجْعَلْ مَا قَدَّمَهُ لأَهْلِهِ وَذُرِّيَّتِهِ نُوراً يَتَلَأْلَأُ فِي قَبْرِهِ، وَبَارِكْ فِي عَقِبِهِ وَذُرِّيَّتِهِ إِلَى يَوْمِ الدِّينِ.`,
          virtue: 'صلة رحم الميت وإهداء ثواب البر والوفاء لأهل البيت.',
          targetUncleName: uncle ? uncle.name : undefined,
        },
        {
          title: `دعاء جمع الشمل في جنات الخلد`,
          arabic: `اللَّهُمَّ لَا تَحْرِمْنَا أَجْرَهُ، وَلَا تَفْتِنَّا بَعْدَهُ، وَاغْفِرْ لَنَا وَلَهُ، وَأَلْحِقْنَا بِهِ فِي جَنَّاتِ النَّعِيمِ غَيْرَ خَزَايَا وَلَا مَفْتُونِينَ، وَاِجْعَلْ حَوْضَ نَبِيِّكَ مَوْرِدَنَا وَمَوْرِدَهُ.`,
          virtue: 'دعاء الثبات وجمع شمل العائلة والأحباب في الفردوس الأعلى.',
          targetUncleName: uncle ? uncle.name : undefined,
        },
      ];
    }

    // General benefactor prayers
    return [
      {
        title: `دعاء جامع للأعمام الأربعة ولموتى المسلمين`,
        arabic: `اللَّهُمَّ اغْفِرْ لِأَرْوَاحِ عَمَامِنَا الْكِرَامِ: رَمَضَان، وَالشَّهَاوِي، وَالشَّافِعِي، وَأَحْمَد الشَّهَاوِي عَبْدِالْمَجِيد، وَاغْفِرْ لِجَمِيعِ مَوْتَى الْمُسْلِمِينَ الَّذِينَ شَهِدُوا لَكَ بِالْوَحْدَانِيَّةِ وَلِنَبِيِّكَ بِالرِّسَالَةِ وَمَاتُوا عَلَى ذَٰلِكَ، اللَّهُمَّ جَازِهِمْ بِالإِحْسَانِ إِحْسَاناً وَبِالسَّيِّئَاتِ عَفْواً وَغُفْرَاناً.`,
        virtue: 'من استغفر للمؤمنين والمؤمنات كتب الله له بكل مؤمن ومؤمنة حسنة.',
      },
      {
        title: `دعاء الفسحة والريحان في القبر`,
        arabic: `اللَّهُمَّ أَنْزِلْ عَلَى قُبُورِهِمُ الضِّيَاءَ وَالنُّورَ، وَالْفُسْحَةَ وَالسُّرُورَ، وَاجْعَلْهُمْ فِي بُطُونِ الأَلْحَادِ مُطْمَئِنِّينَ، وَعِنْدَ قِيَامِ الأَشْهَادِ آمِنِينَ، وَبِجُودِ رِضْوَانِكَ وَاثِقِينَ.`,
        virtue: 'دعاء بليغ للأنس وطمأنينة الروح في القبر.',
      },
    ];
  },

  /**
   * Returns honorific title based on status and gender.
   */
  getHonorific(p?: UserProfile): string {
    const profile = p || this.getProfile();
    const isLiving = profile.relativeStatus === 'living';
    const rel = (profile.relativeRelation || profile.closestRelative || '').toLowerCase();
    const isFemale =
      rel.includes('أم') ||
      rel.includes('والدة') ||
      rel.includes('جدة') ||
      rel.includes('أخت') ||
      rel.includes('ابنة') ||
      rel.includes('زوجة');

    if (isLiving) {
      return isFemale ? 'حفظها الله ورعاها' : 'حفظه الله ورعاه';
    } else {
      return isFemale ? 'رحمها الله وغفر لها' : 'رحمه الله وغفر له';
    }
  },

  /**
   * Returns tailored supplications matching the closest relative or smart connection.
   */
  getPersonalizedDuas(p?: UserProfile): { title: string; arabic: string; virtue: string }[] {
    const profile = p || this.getProfile();
    if (profile.closestRelative.trim()) {
      const name = profile.closestRelative.trim();
      const isLiving = profile.relativeStatus === 'living';
      if (isLiving) {
        return [
          {
            title: `دعاء الحفظ والبركة لـ (${name})`,
            arabic: `اللَّهُمَّ بَارِكْ فِي عُمْرِ ${name}، وَمَتِّعْهُ بِالصِّحَّةِ وَالعَافِيَةِ، وَاكْلأْهُ بِرِعَايَتِكَ، وَاحْفَظْهُ مِنْ كُلِّ سُوءٍ، وَارْزُقْنَا بِرَّهُ وَرِضَاهُ.`,
            virtue: 'دعاء جامع للحفظ والعافية وطول العمر في طاعة الله',
          },
          {
            title: `دعاء سعة الرزق وصلاح الحال لـ (${name})`,
            arabic: `اللَّهُمَّ افْتَحْ لِـ ${name} أَبْوَابَ الخَيْرِ وَالتَّوْفِيقِ، وَيَسِّرْ أَمْرَهُ، وَفَرِّجْ هَمَّهُ، وَاجْعَلْ حَيَاتَهُ طُمَأْنِينَةً وَبَرَكَةً.`,
            virtue: 'سؤال الفرج والتيسير وجلب السكينة للقلب',
          },
        ];
      }
      return [
        {
          title: `دعاء الفردوس والرحمة لـ (${name})`,
          arabic: `اللَّهُمَّ اغْفِرْ لِـ ${name} وَارْحَمْهُ، وَاجْعَلْ قَبْرَهُ رَوْضَةً مِنْ رِيَاضِ الْجَنَّةِ، وَأَسْكِنْهُ الْفِرْدَوْسَ الأَعْلَى بِلَا حِسَابٍ وَلَا سَابِقَةِ عَذَابٍ.`,
          virtue: 'سؤال الفردوس الأعلى وفسحة القبر ونوره للمتوفى',
        },
        {
          title: `دعاء النور والأنس وشربة الكوثر لـ (${name})`,
          arabic: `اللَّهُمَّ أَنِرْ لِـ ${name} قَبْرَهُ، وَآنِسْ وَحْشَتَهُ، وَاسْقِهِ مِنْ حَوْضِ نَبِيِّكَ مُحَمَّدٍ ﷺ شَرْبَةً هَنِيئَةً لَا يَظْمَأُ بَعْدَهَا أَبَدًا.`,
          virtue: 'سؤال حوض النبي ﷺ ولقاء الأحبة في جنات النعيم',
        },
      ];
    }
    return this.getSmartTailoredPrayers(profile);
  },

  /**
   * Generates a smart pre-filled dedication note based on their exact connection.
   */
  getSuggestedDedicationNote(type: 'surah' | 'tasbeeh' | 'dua' | 'khatmah', p?: UserProfile): string {
    const profile = p || this.getProfile();
    const typeNames: Record<string, string> = {
      surah: 'تلاوة سورة مباركة',
      tasbeeh: 'جلسة تسبيح وذكر',
      dua: 'دعاء خالص ومناجاة',
      khatmah: 'قراءة جزء قرآني',
    };
    const action = typeNames[type] || 'عمل صالح';

    if (profile.connectionType === 'friend') {
      const uncleName = UNCLE_NAMES[profile.targetUncleId];
      return `إهداء ثواب ${action} من رفيق وصاحب ${uncleName} وفاءً لعهده وصحبته المباركة.`;
    }

    if (profile.connectionType === 'family_relative') {
      return `إهداء ثواب ${action} من أهل وذوي المغفور لهم (${profile.kinshipTitle}) براً وصلة لأرواحهم الكريمة.`;
    }

    return `إهداء ثواب ${action} خالصاً لوجه الله تعالى عن أرواح عمامي الأربعة ولجميع موتى المسلمين.`;
  },
};
