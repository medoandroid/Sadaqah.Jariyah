import { DailyWirdData } from '../types';
import { storageService } from './storageService';

const STORAGE_KEY = 'daily_quran_wird_data';

function getTodayString(): string {
  const now = new Date();
  const year = now.getFullYear();
  const month = String(now.getMonth() + 1).padStart(2, '0');
  const day = String(now.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

function getYesterdayString(): string {
  const d = new Date();
  d.setDate(d.getDate() - 1);
  const year = d.getFullYear();
  const month = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

const DEFAULT_WIRD: DailyWirdData = {
  targetPages: 4, // 4 pages daily default (~2 hizb per week)
  targetType: 'pages',
  completedToday: 0,
  lastDate: getTodayString(),
  streakDays: 0,
  totalCompleted: 0,
  history: {},
};

export const dailyWirdService = {
  getWirdData(): DailyWirdData {
    const raw = storageService.get<DailyWirdData>(STORAGE_KEY, DEFAULT_WIRD);
    const today = getTodayString();
    const yesterday = getYesterdayString();

    // Check if day changed
    if (raw.lastDate !== today) {
      // If user completed target yesterday, streak continues; otherwise streak breaks if gap > 1 day
      let newStreak = raw.streakDays;
      if (raw.lastDate !== yesterday && raw.completedToday < raw.targetPages) {
        newStreak = 0;
      }

      const updated: DailyWirdData = {
        ...raw,
        completedToday: 0,
        lastDate: today,
        streakDays: newStreak,
      };
      storageService.set(STORAGE_KEY, updated);
      return updated;
    }

    return raw;
  },

  setTarget(target: number, type: 'pages' | 'ayahs' = 'pages'): DailyWirdData {
    const current = this.getWirdData();
    const updated: DailyWirdData = {
      ...current,
      targetPages: Math.max(1, target),
      targetType: type,
    };
    storageService.set(STORAGE_KEY, updated);
    return updated;
  },

  addProgress(amount: number = 1): { data: DailyWirdData; justCompleted: boolean } {
    const current = this.getWirdData();
    const today = getTodayString();
    const wasCompleted = current.completedToday >= current.targetPages;
    const newCompleted = Math.max(0, current.completedToday + amount);
    const nowCompleted = newCompleted >= current.targetPages;

    let newStreak = current.streakDays;
    let justCompleted = false;

    if (!wasCompleted && nowCompleted) {
      newStreak = current.streakDays + 1;
      justCompleted = true;
    }

    const newHistory = {
      ...current.history,
      [today]: newCompleted,
    };

    const updated: DailyWirdData = {
      ...current,
      completedToday: newCompleted,
      totalCompleted: current.totalCompleted + Math.max(0, amount),
      streakDays: newStreak,
      history: newHistory,
      lastDate: today,
    };

    storageService.set(STORAGE_KEY, updated);
    return { data: updated, justCompleted };
  },

  resetToday(): DailyWirdData {
    const current = this.getWirdData();
    const today = getTodayString();
    const newHistory = { ...current.history };
    delete newHistory[today];

    const updated: DailyWirdData = {
      ...current,
      completedToday: 0,
      history: newHistory,
    };
    storageService.set(STORAGE_KEY, updated);
    return updated;
  },
};
