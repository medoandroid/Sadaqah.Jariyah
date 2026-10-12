import { storageService } from './storageService';

export interface ProjectOwnerProfile {
  isActivated: boolean; // Whether the posthumous/ongoing dedication page is activated
  name: string; // Full name of the project owner
  title: string; // e.g. "مُؤسس المنصة والابن البار"
  relation: string; // Relation to family e.g. "ابن عائلة الشهاوي"
  bio: string; // Story, background & message to visitors
  dedicationDua: string; // Custom prayers dedicated to him
  willAndMessage: string; // Will or reminder to all who use the app
  badges: string[]; // Spiritual badges
  dateCreated: string;
  updatedAt: number;
}

const STORAGE_KEY = 'project_owner_profile_v1';

const DEFAULT_OWNER_PROFILE: ProjectOwnerProfile = {
  isActivated: true,
  name: 'صاحب ومُنشئ المنصة',
  title: 'مُبتغي وجه الله تعالى ومُبرمج المنصة',
  relation: 'ابن عائلة الشهاوي البار',
  bio: 'قام بإنشاء وتطوير هذه المنصة الإسلامية الجامعة كصدقة جارية لوجه الله تعالى عن أرواح عمامي الأربعة الكرام وأهله الكرام، وسائلاً الله تعالى أن يكتب له ثواب هذا العمل في حياته وأن يكون نوراً وضياءً وصدقة جارية له بعد وفاته، وأن ينفع به كل مسلم ومسلمة إلى يوم القيامة.',
  dedicationDua: 'اللهم اغفر لعبدك صاحب هذا العمل وتجاوز عن سيئاته، واجعل كل حرف يُقرأ في هذه المنصة، وكل تسبيحة ودعاء واستغفار؛ نوراً له في قبره، ورفعة في درجاته، وظلاً له يوم لا ظل إلا ظلك، واجمعه مع النبيين والصديقين والشهداء والصالحين في الفردوس الأعلى من الجنة.',
  willAndMessage: 'وصيتي ورجائي لكل من انتفع بهذه المنصة أو قرأ فيها آية أو ردد ذكراً: ألا تنساني من صالح دعائك بظهر الغيب بالرحمة والمغفرة والثبات عند السؤال، وأن يتقبل الله هذا العمل خالصاً لوجهه الكريم.',
  badges: ['صاحب المشروع', 'صدقة جارية', 'علم يُنتفع به', 'دعاء مستمر'],
  dateCreated: '١٤٤٧ هـ / ٢٠٢٦ م',
  updatedAt: Date.now(),
};

type Listener = (profile: ProjectOwnerProfile) => void;
const listeners = new Set<Listener>();

export const projectOwnerService = {
  getOwnerProfile(): ProjectOwnerProfile {
    try {
      const saved = storageService.get<ProjectOwnerProfile | null>(STORAGE_KEY, null);
      if (saved && typeof saved === 'object' && saved.name) {
        return {
          ...DEFAULT_OWNER_PROFILE,
          ...saved,
        };
      }
    } catch (e) {
      console.warn('Error reading project owner profile:', e);
    }
    return DEFAULT_OWNER_PROFILE;
  },

  saveOwnerProfile(updates: Partial<ProjectOwnerProfile>): ProjectOwnerProfile {
    const current = this.getOwnerProfile();
    const updated: ProjectOwnerProfile = {
      ...current,
      ...updates,
      updatedAt: Date.now(),
    };
    storageService.set(STORAGE_KEY, updated);
    listeners.forEach((fn) => fn(updated));
    return updated;
  },

  toggleActivation(isActivated: boolean): ProjectOwnerProfile {
    return this.saveOwnerProfile({ isActivated });
  },

  resetToDefaults(): ProjectOwnerProfile {
    storageService.set(STORAGE_KEY, DEFAULT_OWNER_PROFILE);
    listeners.forEach((fn) => fn(DEFAULT_OWNER_PROFILE));
    return DEFAULT_OWNER_PROFILE;
  },

  subscribe(listener: Listener): () => void {
    listeners.add(listener);
    return () => {
      listeners.delete(listener);
    };
  },
};
