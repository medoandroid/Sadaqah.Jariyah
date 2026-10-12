import { storageService } from './storageService';

export interface ProjectOwnerProfile {
  isActivated: boolean; // Whether the posthumous/ongoing dedication page is activated
  name: string; // Full name of the project owner
  title: string; // e.g. "صانع المنصة ومحب الخير لأهله"
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
  title: 'مُبتغي وجه الله ومبرمج المنصة',
  relation: 'ابن عائلة الشهاوي',
  bio: 'عملت المنصة دي بحب وخلوص نية لوجه الله الكريم، صدقة جارية عن أرواح حبايب قلبي عمامي الأربعة وعن أهلي كلهم، ونفسي من كل قلبي يفضل أثرها ونورها شغال في حياتي وبعد ما أقابل وجه كريم. كل اللي بتمناه إن أي حد يدخل هنا يلاقي راحة وسكينة وينتفع بحرف أو تسبيحة، وربنا يتقبلها خالصة لوجهه الكريم.',
  dedicationDua: 'اللهم اغفر لعبدك صاحب هذا العمل وتجاوز عن سيئاته، واجعل كل حرف يُقرأ في هذه المنصة، وكل تسبيحة ودعاء واستغفار؛ نوراً له في قبره، ورفعة في درجاته، وظلاً له يوم لا ظل إلا ظلك، واجمعه مع النبيين والصديقين والشهداء والصالحين في الفردوس الأعلى من الجنة.',
  willAndMessage: 'وصيتي ورجائي من كل حد دخل هنا أو قرأ آية أو سبح تسبيحة: متنسانيش في دعوة حلوة من قلبك بظهر الغيب بالرحمة والمغفرة وإن ربنا يثبتني عند السؤال ويجمعنا سوا في الفردوس الأعلى. ربنا يتقبل منكم ويجعل قلوبكم دايمًا عامرة بذكره.',
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
        // Strip out the word 'البار' if previously saved in relation, title, or bio
        const cleanRelation = (saved.relation || '').replace(/\s*البار\s*/g, ' ').trim();
        const cleanTitle = (saved.title || '').replace(/\s*البار\s*/g, ' ').trim();
        const isOldStiffBio = !saved.bio || saved.bio.includes('قام بإنشاء وتطوير هذه المنصة');
        const isOldStiffWill = !saved.willAndMessage || saved.willAndMessage.includes('وصيتي ورجائي لكل من انتفع');

        return {
          ...DEFAULT_OWNER_PROFILE,
          ...saved,
          title: cleanTitle || DEFAULT_OWNER_PROFILE.title,
          relation: cleanRelation || DEFAULT_OWNER_PROFILE.relation,
          bio: isOldStiffBio ? DEFAULT_OWNER_PROFILE.bio : saved.bio.replace(/\s*البار\s*/g, ' ').trim(),
          willAndMessage: isOldStiffWill ? DEFAULT_OWNER_PROFILE.willAndMessage : saved.willAndMessage,
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
