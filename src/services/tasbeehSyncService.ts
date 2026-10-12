import { storageService } from './storageService';
import { playTasbeehBeadSound } from '../utils/soundEffects';

export interface DhikrMeta {
  text: string;
  target: number;
  virtue?: string;
  reference?: string;
}

export const DEFAULT_DHIKRS: DhikrMeta[] = [
  {
    text: 'سُبْحَانَ اللَّهِ',
    target: 33,
    virtue: 'تغرس للمسبح نخلة في الجنة وتكفر الخطايا وإن كانت مثل زبد البحر',
    reference: 'صحيح مسلم والترمذي',
  },
  {
    text: 'الْحَمْدُ لِلَّهِ',
    target: 33,
    virtue: 'تملأ الميزان بالخير والبركة، وهي أحب الكلام إلى الله عز وجل',
    reference: 'صحيح مسلم',
  },
  {
    text: 'اللَّهُ أَكْبَرُ',
    target: 34,
    virtue: 'تملأ ما بين السماء والأرض عظمة وإيماناً وخيراً وبركة',
    reference: 'صحيح مسلم',
  },
  {
    text: 'لَا إِلَهَ إِلَّا اللَّهُ وَحْدَهُ لَا شَرِيكَ لَهُ',
    target: 100,
    virtue: 'أفضل ما قال النبي صلى الله عليه وسلم والنبيون من قبله، وتعدل عتق عشر رقاب',
    reference: 'متفق عليه',
  },
  {
    text: 'أَسْتَغْفِرُ اللَّهَ وَأَتُوبُ إِلَيْهِ',
    target: 100,
    virtue: 'تفتح أبواب الرزق والفرج وتطهر القلوب، من لزم الاستغفار جعل الله له من كل هم فرجاً',
    reference: 'أبو داود وأحمد',
  },
  {
    text: 'اللَّهُمَّ صَلِّ وَسَلِّمْ عَلَى نَبِيِّنَا مُحَمَّدٍ',
    target: 100,
    virtue: 'من صلى عليّ صلاة صلى الله عليه بها عشراً وحطت عنه عشر خطيئات ورفعت له عشر درجات',
    reference: 'صحيح النسائي وأحمد',
  },
  {
    text: 'لَا حَوْلَ وَلَا قُوَّةَ إِلَّا بِاللَّهِ الْعَلِيِّ الْعَظِيمِ',
    target: 100,
    virtue: 'كنز من كنوز الجنة ودواء لتسعة وتسعين داء أيسرها الهم',
    reference: 'متفق عليه',
  },
  {
    text: 'سُبْحَانَ اللَّهِ وَبِحَمْدِهِ سُبْحَانَ اللَّهِ الْعَظِيمِ',
    target: 100,
    virtue: 'كلمتان خفيفتان على اللسان، ثقيلتان في الميزان، حبيبتان إلى الرحمن',
    reference: 'صحيح البخاري ومسلم',
  },
];

export interface TasbeehSharedState {
  count: number;
  currentDhikrIndex: number;
  target: number;
  dhikrCountsMap: Record<number, number>;
  totalLifetimeCount: number;
  todayCount: number;
  dhikrList: DhikrMeta[];
  rotationAngle: number;
}

type TasbeehStateListener = (state: TasbeehSharedState) => void;
const listeners = new Set<TasbeehStateListener>();

// Helper to get sanitized today date
function getTodayDateString(): string {
  return new Date().toISOString().slice(0, 10);
}

// Read state safely from storage
function loadInitialState(): TasbeehSharedState {
  const dhikrList = storageService.get<DhikrMeta[]>('custom_dhikr_list', DEFAULT_DHIKRS);
  const dhikrIndex = storageService.getNumber('tasbeeh_dhikr_idx', 0);
  const validDhikrIndex = dhikrIndex >= 0 && dhikrIndex < dhikrList.length ? dhikrIndex : 0;
  
  const dhikrCountsMap = storageService.get<Record<number, number>>('tasbeeh_dhikr_counts_map', {});
  const savedCount = dhikrCountsMap[validDhikrIndex] !== undefined
    ? dhikrCountsMap[validDhikrIndex]
    : storageService.getNumber('tasbeeh_count', 0);

  // Target from active dhikr or saved target
  const savedTarget = storageService.getNumber(
    'tasbeeh_target',
    dhikrList[validDhikrIndex]?.target ?? 33
  );

  // Lifetime Total
  let totalLifetime = 0;
  try {
    const raw = localStorage.getItem('sadaqah_tasbeeh_total');
    if (raw !== null && raw !== undefined) {
      const parsed = parseInt(raw, 10);
      if (!isNaN(parsed) && parsed !== 1580 && parsed !== 1420) {
        totalLifetime = parsed;
      } else {
        localStorage.setItem('sadaqah_tasbeeh_total', '0');
      }
    }
  } catch (e) {
    totalLifetime = 0;
  }

  // Today count check
  const todayDate = getTodayDateString();
  const savedDate = storageService.getString('tasbeeh_today_date', '');
  let today = 0;
  if (savedDate !== todayDate) {
    storageService.setString('tasbeeh_today_date', todayDate);
    storageService.setNumber('tasbeeh_today', 0);
    today = 0;
  } else {
    today = storageService.getNumber('tasbeeh_today', 0);
  }

  return {
    count: savedCount,
    currentDhikrIndex: validDhikrIndex,
    target: savedTarget,
    dhikrCountsMap,
    totalLifetimeCount: totalLifetime,
    todayCount: today,
    dhikrList,
    rotationAngle: (savedCount * (360 / 33)) % 360,
  };
}

let currentState: TasbeehSharedState = loadInitialState();

function persistAndBroadcast(newState: TasbeehSharedState) {
  currentState = newState;

  // Persist to storageService
  storageService.setNumber('tasbeeh_count', newState.count);
  storageService.setNumber('floating_sebha_count', newState.count);
  storageService.setNumber('tasbeeh_dhikr_idx', newState.currentDhikrIndex);
  storageService.setNumber('tasbeeh_target', newState.target);
  storageService.set('tasbeeh_dhikr_counts_map', newState.dhikrCountsMap);
  storageService.setNumber('tasbeeh_total', newState.totalLifetimeCount);
  try {
    localStorage.setItem('sadaqah_tasbeeh_total', String(newState.totalLifetimeCount));
  } catch {}
  storageService.setNumber('tasbeeh_today', newState.todayCount);
  storageService.setString('tasbeeh_today_date', getTodayDateString());
  storageService.set('custom_dhikr_list', newState.dhikrList);

  // Broadcast to all active subscribers (TasbeehPage, FloatingSebhaWidget, etc.)
  listeners.forEach((listener) => {
    try {
      listener(currentState);
    } catch (e) {
      console.warn('[tasbeehSyncService] listener error:', e);
    }
  });
}

export const tasbeehSyncService = {
  getState(): TasbeehSharedState {
    return currentState;
  },

  subscribe(listener: TasbeehStateListener): () => void {
    listeners.add(listener);
    // Trigger with current state immediately
    listener(currentState);
    return () => {
      listeners.delete(listener);
    };
  },

  /**
   * Direct Increment from any UI component (main page or floating sebha)
   */
  increment(options?: { sound?: boolean; vibrate?: boolean }): { count: number; justCompletedTarget: boolean } {
    const sound = options?.sound ?? true;
    const vibrate = options?.vibrate ?? true;

    if (sound) {
      playTasbeehBeadSound();
    }
    if (vibrate && typeof window !== 'undefined' && 'vibrate' in navigator) {
      try {
        navigator.vibrate(22);
      } catch {}
    }

    const nextCount = currentState.count + 1;
    const nextTotal = currentState.totalLifetimeCount + 1;
    const nextToday = currentState.todayCount + 1;
    const nextAngle = (currentState.rotationAngle + (360 / 33)) % 360;

    const nextMap = {
      ...currentState.dhikrCountsMap,
      [currentState.currentDhikrIndex]: nextCount,
    };

    const targetCompleted = currentState.target > 0 && nextCount % currentState.target === 0;

    persistAndBroadcast({
      ...currentState,
      count: nextCount,
      totalLifetimeCount: nextTotal,
      todayCount: nextToday,
      dhikrCountsMap: nextMap,
      rotationAngle: nextAngle,
    });

    return {
      count: nextCount,
      justCompletedTarget: targetCompleted,
    };
  },

  /**
   * Set target directly
   */
  setTarget(target: number): void {
    persistAndBroadcast({
      ...currentState,
      target,
    });
  },

  /**
   * Switch active Dhikr index safely
   */
  switchDhikr(idx: number): void {
    const list = currentState.dhikrList;
    if (idx < 0 || idx >= list.length) return;

    const restoredCount = currentState.dhikrCountsMap[idx] || 0;
    const itemTarget = list[idx]?.target ?? currentState.target;

    persistAndBroadcast({
      ...currentState,
      currentDhikrIndex: idx,
      count: restoredCount,
      target: itemTarget,
      rotationAngle: (restoredCount * (360 / 33)) % 360,
    });
  },

  /**
   * Next Dhikr
   */
  nextDhikr(): void {
    const nextIdx = (currentState.currentDhikrIndex + 1) % currentState.dhikrList.length;
    this.switchDhikr(nextIdx);
  },

  /**
   * Previous Dhikr
   */
  prevDhikr(): void {
    const total = currentState.dhikrList.length;
    const prevIdx = (currentState.currentDhikrIndex - 1 + total) % total;
    this.switchDhikr(prevIdx);
  },

  /**
   * Reset current active dhikr session count safely
   */
  resetCurrentCount(): void {
    const nextMap = {
      ...currentState.dhikrCountsMap,
      [currentState.currentDhikrIndex]: 0,
    };

    persistAndBroadcast({
      ...currentState,
      count: 0,
      dhikrCountsMap: nextMap,
      rotationAngle: 0,
    });
  },

  /**
   * Reset Lifetime Total to zero
   */
  resetLifetimeTotal(): void {
    persistAndBroadcast({
      ...currentState,
      totalLifetimeCount: 0,
    });
  },

  /**
   * Add custom Dhikr
   */
  addCustomDhikr(newDhikr: DhikrMeta): number {
    const updatedList = [...currentState.dhikrList, newDhikr];
    const newIdx = updatedList.length - 1;
    const nextMap = {
      ...currentState.dhikrCountsMap,
      [newIdx]: 0,
    };

    persistAndBroadcast({
      ...currentState,
      dhikrList: updatedList,
      currentDhikrIndex: newIdx,
      count: 0,
      target: newDhikr.target,
      dhikrCountsMap: nextMap,
      rotationAngle: 0,
    });

    return newIdx;
  },

  /**
   * Reset entire dhikr list back to default
   */
  resetDhikrListToDefault(): void {
    persistAndBroadcast({
      ...currentState,
      dhikrList: DEFAULT_DHIKRS,
      currentDhikrIndex: 0,
      count: 0,
      target: DEFAULT_DHIKRS[0].target,
      rotationAngle: 0,
    });
  },
};
