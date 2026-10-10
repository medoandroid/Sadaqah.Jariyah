import { Ayah, SurahDetail } from '../types';
import { ALL_SURAHS } from '../data/quranMeta';

const DB_NAME = 'SadaqahOfflineQuranDB';
const DB_VERSION = 1;
const STORE_NAME = 'surahs';

function openDatabase(): Promise<IDBDatabase> {
  return new Promise((resolve, reject) => {
    if (typeof window === 'undefined' || !window.indexedDB) {
      reject(new Error('IndexedDB is not supported'));
      return;
    }
    const request = window.indexedDB.open(DB_NAME, DB_VERSION);
    request.onupgradeneeded = (e) => {
      const db = (e.target as IDBOpenDBRequest).result;
      if (!db.objectStoreNames.contains(STORE_NAME)) {
        db.createObjectStore(STORE_NAME, { keyPath: 'number' });
      }
    };
    request.onsuccess = () => resolve(request.result);
    request.onerror = () => reject(request.error);
  });
}

export const offlineQuranService = {
  async getSurahFromOffline(surahNumber: number): Promise<Ayah[] | null> {
    try {
      const db = await openDatabase();
      return new Promise((resolve) => {
        const tx = db.transaction(STORE_NAME, 'readonly');
        const store = tx.objectStore(STORE_NAME);
        const req = store.get(surahNumber);
        req.onsuccess = () => {
          if (req.result && Array.isArray(req.result.ayahs) && req.result.ayahs.length > 0) {
            resolve(req.result.ayahs);
          } else {
            resolve(null);
          }
        };
        req.onerror = () => resolve(null);
      });
    } catch {
      // Fallback to localStorage
      try {
        const raw = localStorage.getItem(`quran_surah_${surahNumber}`);
        if (raw) return JSON.parse(raw);
      } catch {}
      return null;
    }
  },

  async saveSurahToOffline(surahNumber: number, ayahs: Ayah[]): Promise<void> {
    try {
      const db = await openDatabase();
      const tx = db.transaction(STORE_NAME, 'readwrite');
      const store = tx.objectStore(STORE_NAME);
      store.put({ number: surahNumber, ayahs, savedAt: Date.now() });
    } catch {
      // Fallback to localStorage
      try {
        localStorage.setItem(`quran_surah_${surahNumber}`, JSON.stringify(ayahs));
      } catch {}
    }
  },

  async getDownloadedCount(): Promise<number> {
    try {
      const db = await openDatabase();
      return new Promise((resolve) => {
        const tx = db.transaction(STORE_NAME, 'readonly');
        const store = tx.objectStore(STORE_NAME);
        const req = store.count();
        req.onsuccess = () => resolve(req.result || 0);
        req.onerror = () => resolve(0);
      });
    } catch {
      return 0;
    }
  },

  async isAllQuranOffline(): Promise<boolean> {
    const count = await this.getDownloadedCount();
    return count >= 114;
  },

  async downloadAllSurahs(
    onProgress: (completed: number, total: number, currentName: string) => void,
    abortSignal?: AbortSignal
  ): Promise<boolean> {
    const total = 114;
    let completed = 0;

    // First attempt to fetch the complete Quran package if available, or fetch in parallel batches
    // AlQuran Cloud provides the full Quran at once: /v1/quran/quran-uthmani (~1.8 MB)
    try {
      onProgress(0, total, 'جاري جلب المصحف الشريف كاملاً في حزمة واحدة...');
      const response = await fetch('https://api.alquran.cloud/v1/quran/quran-uthmani', {
        signal: abortSignal,
      });

      if (response.ok) {
        const resData = await response.json();
        if (resData && resData.data && Array.isArray(resData.data.surahs)) {
          const db = await openDatabase();
          const tx = db.transaction(STORE_NAME, 'readwrite');
          const store = tx.objectStore(STORE_NAME);

          for (let i = 0; i < resData.data.surahs.length; i++) {
            if (abortSignal?.aborted) return false;
            const surahData = resData.data.surahs[i];
            const ayahs: Ayah[] = surahData.ayahs.map((a: any) => ({
              number: a.number,
              text: a.text,
              numberInSurah: a.numberInSurah,
              juz: a.juz,
              manzil: a.manzil,
              page: a.page,
              ruku: a.ruku,
              hizbQuarter: a.hizbQuarter,
              sajda: a.sajda,
            }));

            store.put({ number: surahData.number, ayahs, savedAt: Date.now() });
            completed++;
            onProgress(completed, total, surahData.name);
          }

          localStorage.setItem('offline_quran_all_downloaded', 'true');
          return true;
        }
      }
    } catch (e: any) {
      if (abortSignal?.aborted) return false;
      console.warn('Batch download failed, falling back to surah-by-surah batching:', e);
    }

    // Fallback: batch downloads
    const batchSize = 6;
    for (let i = 0; i < ALL_SURAHS.length; i += batchSize) {
      if (abortSignal?.aborted) return false;
      const batch = ALL_SURAHS.slice(i, i + batchSize);

      await Promise.all(
        batch.map(async (surah) => {
          try {
            // Check if already in DB
            const existing = await this.getSurahFromOffline(surah.number);
            if (existing && existing.length > 0) {
              completed++;
              onProgress(completed, total, surah.name);
              return;
            }

            const res = await fetch(`https://api.alquran.cloud/v1/surah/${surah.number}/quran-uthmani`, {
              signal: abortSignal,
            });
            if (res.ok) {
              const d = await res.json();
              if (d && d.data && Array.isArray(d.data.ayahs)) {
                const ayahs: Ayah[] = d.data.ayahs.map((a: any) => ({
                  number: a.number,
                  text: a.text,
                  numberInSurah: a.numberInSurah,
                  juz: a.juz,
                  manzil: a.manzil,
                  page: a.page,
                  ruku: a.ruku,
                  hizbQuarter: a.hizbQuarter,
                  sajda: a.sajda,
                }));
                await this.saveSurahToOffline(surah.number, ayahs);
              }
            }
          } catch {}
          completed++;
          onProgress(completed, total, surah.name);
        })
      );
    }

    localStorage.setItem('offline_quran_all_downloaded', 'true');
    return true;
  },

  async clearOfflineData(): Promise<void> {
    try {
      const db = await openDatabase();
      const tx = db.transaction(STORE_NAME, 'readwrite');
      const store = tx.objectStore(STORE_NAME);
      store.clear();
      localStorage.removeItem('offline_quran_all_downloaded');
    } catch {}
  },
};
