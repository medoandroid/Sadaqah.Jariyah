import { storageService } from './storageService';

export interface UserPersistedState {
  activeTab: string;
  selectedSurahNumber: number;
  selectedMushafPage: number;
  selectedPersonId: string;
  lastReadAyah?: {
    surahNumber: number;
    surahName: string;
    ayahNumber: number;
    textPreview?: string;
    timestamp: number;
  };
  lastUpdated: number;
}

const VALID_TABS = new Set([
  'home',
  'quran',
  'mushaf',
  'recitations',
  'prayer',
  'haramain',
  'adhkar',
  'tasbeeh',
  'duas',
  'ruqyah',
  'hadith',
  'khatmah',
  'persons',
  'owner_sadaqah',
  'personal_dua',
  'asma',
]);

const USER_STATE_KEY = 'user_persisted_state_v2';

export const userStateService = {
  getInitialState(): UserPersistedState {
    const defaultState: UserPersistedState = {
      activeTab: 'home',
      selectedSurahNumber: 1,
      selectedMushafPage: 1,
      selectedPersonId: 'all',
      lastUpdated: Date.now(),
    };

    try {
      const saved = storageService.get<Partial<UserPersistedState> | null>(USER_STATE_KEY, null);
      if (saved) {
        const validatedTab = (saved.activeTab && VALID_TABS.has(saved.activeTab)) ? saved.activeTab : 'home';
        const validatedSurah = (typeof saved.selectedSurahNumber === 'number' && saved.selectedSurahNumber >= 1 && saved.selectedSurahNumber <= 114)
          ? saved.selectedSurahNumber
          : 1;
        const validatedPage = (typeof saved.selectedMushafPage === 'number' && saved.selectedMushafPage >= 1 && saved.selectedMushafPage <= 604)
          ? saved.selectedMushafPage
          : 1;
        const validatedPersonId = typeof saved.selectedPersonId === 'string' ? saved.selectedPersonId : 'all';

        return {
          activeTab: validatedTab,
          selectedSurahNumber: validatedSurah,
          selectedMushafPage: validatedPage,
          selectedPersonId: validatedPersonId,
          lastReadAyah: saved.lastReadAyah,
          lastUpdated: saved.lastUpdated || Date.now(),
        };
      }
    } catch (e) {
      console.warn('Error retrieving user persisted state:', e);
    }

    return defaultState;
  },

  saveState(partial: Partial<UserPersistedState>): void {
    try {
      const current = this.getInitialState();
      const updated: UserPersistedState = {
        ...current,
        ...partial,
        lastUpdated: Date.now(),
      };
      // Validate before write
      if (updated.activeTab && !VALID_TABS.has(updated.activeTab)) {
        updated.activeTab = 'home';
      }
      storageService.set(USER_STATE_KEY, updated);
    } catch (e) {
      console.warn('Error saving user state:', e);
    }
  },

  recordLastReadAyah(surahNumber: number, surahName: string, ayahNumber: number, textPreview?: string): void {
    if (surahNumber < 1 || surahNumber > 114 || ayahNumber < 1) return;
    this.saveState({
      selectedSurahNumber: surahNumber,
      lastReadAyah: {
        surahNumber,
        surahName,
        ayahNumber,
        textPreview: textPreview ? textPreview.slice(0, 80) : undefined,
        timestamp: Date.now(),
      },
    });
  },

  getLastReadAyah() {
    const state = this.getInitialState();
    return state.lastReadAyah || null;
  },
};
