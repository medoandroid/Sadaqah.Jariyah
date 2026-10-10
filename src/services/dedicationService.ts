import { DedicationRecord } from '../types';
import { HONORED_PERSONS } from '../data/persons';
import { sanitizeBoundedText } from '../utils/security';

export interface DedicationStats {
  totalPrayers: number;
  totalSurahsRecited: number;
  totalTasbeehs: number;
  totalKhatmahs: number;
}

const ZERO_STATS: DedicationStats = {
  totalPrayers: 0,
  totalSurahsRecited: 0,
  totalTasbeehs: 0,
  totalKhatmahs: 0,
};

export function getDedicationStats(): DedicationStats {
  if (typeof window === 'undefined') return ZERO_STATS;
  try {
    const saved = localStorage.getItem('sadaqah_dedication_stats_v2');
    if (saved) {
      const parsed = JSON.parse(saved);
      // Ensure no legacy fake numbers leak through
      if (parsed && typeof parsed.totalPrayers === 'number') {
        return parsed;
      }
    }

    // Clean up old legacy keys that had mock numbers
    localStorage.removeItem('sadaqah_dedication_stats');
  } catch (e) {}

  return ZERO_STATS;
}

export function recordDedication(
  type: DedicationRecord['type'],
  title: string,
  targetPersonId: string | 'all',
  count: number = 1,
  donorName: string = 'فاعل خير',
  customTargetName?: string
): DedicationRecord {
  let targetPerson = 'عمامي الأربعة رحمهم الله جميعاً';
  if (customTargetName && customTargetName.trim()) {
    targetPerson = sanitizeBoundedText(customTargetName, 100);
  } else if (targetPersonId === 'all') {
    targetPerson = 'عمامي الأربعة رحمهم الله جميعاً';
  } else {
    const found = HONORED_PERSONS.find(p => p.id === targetPersonId);
    if (found) {
      targetPerson = `عمي ${found.name}`;
    } else {
      targetPerson = 'عمامي الأربعة رحمهم الله';
    }
  }

  const record: DedicationRecord = {
    id: `ded-${Date.now()}-${Math.random().toString(36).substr(2, 6)}`,
    type,
    title: sanitizeBoundedText(title, 200),
    targetPersonId,
    targetPersonName: targetPerson,
    count: Math.max(1, Math.min(count, 10000)),
    timestamp: Date.now(),
    donorName: sanitizeBoundedText(donorName, 80) || 'فاعل خير',
  };

  try {
    // Save to list of recent real dedications
    const listRaw = localStorage.getItem('sadaqah_recent_dedications_v4');
    const list: DedicationRecord[] = listRaw ? JSON.parse(listRaw) : [];
    list.unshift(record);
    localStorage.setItem('sadaqah_recent_dedications_v4', JSON.stringify(list.slice(0, 50)));

    // Increment real stats
    const stats = getDedicationStats();
    if (type === 'dua') stats.totalPrayers += count;
    if (type === 'surah') stats.totalSurahsRecited += count;
    if (type === 'tasbeeh') stats.totalTasbeehs += count;
    if (type === 'khatmah') stats.totalKhatmahs += count;
    localStorage.setItem('sadaqah_dedication_stats_v2', JSON.stringify(stats));
  } catch (e) {
    console.error('Error saving dedication', e);
  }

  return record;
}

export function getRecentDedications(): DedicationRecord[] {
  if (typeof window === 'undefined') return [];
  try {
    const listRaw = localStorage.getItem('sadaqah_recent_dedications_v4');
    if (listRaw) {
      const parsed: DedicationRecord[] = JSON.parse(listRaw);
      if (Array.isArray(parsed)) {
        return parsed;
      }
    }
  } catch (e) {}

  return [];
}
