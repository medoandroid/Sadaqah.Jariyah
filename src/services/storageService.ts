/**
 * Unified, resilient LocalStorage service for Sadaqah Jariyah app.
 * Provides safe serialization, validation, fallbacks, and multi-key synchronization.
 */

import { isValidBackupData, sanitizeText } from '../utils/security';

const STORAGE_PREFIX = 'sadaqah_';

export const storageService = {
  get<T>(key: string, defaultValue: T): T {
    if (typeof window === 'undefined') return defaultValue;
    try {
      const raw = localStorage.getItem(`${STORAGE_PREFIX}${key}`);
      if (raw === null || raw === undefined) return defaultValue;
      return JSON.parse(raw) as T;
    } catch (e) {
      console.warn(`[storageService] Error parsing key: ${key}`, e);
      return defaultValue;
    }
  },

  set<T>(key: string, value: T): boolean {
    if (typeof window === 'undefined') return false;
    try {
      localStorage.setItem(`${STORAGE_PREFIX}${key}`, JSON.stringify(value));
      return true;
    } catch (e) {
      console.warn(`[storageService] Error writing key: ${key}`, e);
      return false;
    }
  },

  getString(key: string, defaultValue: string): string {
    if (typeof window === 'undefined') return defaultValue;
    try {
      const raw = localStorage.getItem(`${STORAGE_PREFIX}${key}`);
      return raw !== null ? raw : defaultValue;
    } catch (e) {
      return defaultValue;
    }
  },

  setString(key: string, value: string): void {
    if (typeof window === 'undefined') return;
    try {
      localStorage.setItem(`${STORAGE_PREFIX}${key}`, sanitizeText(value));
    } catch (e) {}
  },

  getNumber(key: string, defaultValue: number): number {
    if (typeof window === 'undefined') return defaultValue;
    try {
      const raw = localStorage.getItem(`${STORAGE_PREFIX}${key}`);
      if (raw === null) return defaultValue;
      const parsed = Number(raw);
      return isNaN(parsed) ? defaultValue : parsed;
    } catch (e) {
      return defaultValue;
    }
  },

  setNumber(key: string, value: number): void {
    if (typeof window === 'undefined') return;
    try {
      localStorage.setItem(`${STORAGE_PREFIX}${key}`, String(value));
    } catch (e) {}
  },

  getBoolean(key: string, defaultValue: boolean): boolean {
    if (typeof window === 'undefined') return defaultValue;
    try {
      const raw = localStorage.getItem(`${STORAGE_PREFIX}${key}`);
      if (raw === null) return defaultValue;
      return raw === 'true';
    } catch (e) {
      return defaultValue;
    }
  },

  setBoolean(key: string, value: boolean): void {
    if (typeof window === 'undefined') return;
    try {
      localStorage.setItem(`${STORAGE_PREFIX}${key}`, String(value));
    } catch (e) {}
  },

  remove(key: string): void {
    if (typeof window === 'undefined') return;
    try {
      localStorage.removeItem(`${STORAGE_PREFIX}${key}`);
    } catch (e) {}
  },

  /**
   * Export all app keys for backup
   */
  exportBackup(): { timestamp: number; appVersion: string; data: Record<string, any> } {
    const data: Record<string, any> = {};
    if (typeof window !== 'undefined') {
      for (let i = 0; i < localStorage.length; i++) {
        const key = localStorage.key(i);
        if (key && (key.startsWith(STORAGE_PREFIX) || key.startsWith('offline_') || key.startsWith('quran_'))) {
          try {
            const raw = localStorage.getItem(key);
            if (raw !== null) {
              data[key] = JSON.parse(raw);
            }
          } catch {
            data[key!] = localStorage.getItem(key!);
          }
        }
      }
    }
    return {
      timestamp: Date.now(),
      appVersion: '2.0.0',
      data,
    };
  },

  /**
   * Safely restore backup data after strict validation
   */
  restoreBackup(backupPayload: any): { success: boolean; message: string; restoredCount: number } {
    if (!backupPayload || !isValidBackupData(backupPayload.data || backupPayload)) {
      return { success: false, message: 'ملف النسخة الاحتياطية غير صالح أو تالف', restoredCount: 0 };
    }
    const data = backupPayload.data || backupPayload;
    let count = 0;
    try {
      Object.entries(data).forEach(([key, val]) => {
        if (key.startsWith(STORAGE_PREFIX) || key.startsWith('offline_') || key.startsWith('quran_')) {
          if (typeof val === 'string') {
            localStorage.setItem(key, val);
          } else {
            localStorage.setItem(key, JSON.stringify(val));
          }
          count++;
        }
      });
      return { success: true, message: `تم استعادة ${count} عنصراً بنجاح`, restoredCount: count };
    } catch (err: any) {
      return { success: false, message: 'حدث خطأ أثناء استعادة البيانات', restoredCount: count };
    }
  },

  /**
   * Get approximate storage usage in KB
   */
  getStorageUsageKB(): number {
    if (typeof window === 'undefined') return 0;
    let total = 0;
    try {
      for (let i = 0; i < localStorage.length; i++) {
        const key = localStorage.key(i);
        if (key && key.startsWith(STORAGE_PREFIX)) {
          const val = localStorage.getItem(key) || '';
          total += key.length + val.length;
        }
      }
    } catch {}
    return Math.round((total * 2) / 1024); // 2 bytes per char approx
  }
};
