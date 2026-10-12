import { Reciter, SurahMeta } from '../types';
import { ALL_SURAHS, ALL_JUZ_METADATA } from '../data/quranMeta';
import { getSurahAudioUrl } from '../data/reciters';

export interface DownloadedAudioItem {
  id: string; // `${reciterId}_${surahNumber}`
  surahNumber: number;
  surahName: string;
  reciterId: string;
  reciterName: string;
  riwayah: string;
  url: string;
  blobUrl?: string;
  sizeBytes: number;
  downloadedAt: number;
  duration?: number;
}

export type DownloadStatus = 'idle' | 'downloading' | 'paused' | 'completed' | 'error' | 'cancelled';

export interface ActiveDownloadTask {
  id: string;
  title: string;
  type: 'surah' | 'juz' | 'full';
  totalItems: number;
  completedItems: number;
  totalBytes: number;
  loadedBytes: number;
  progressPercent: number;
  status: DownloadStatus;
  currentSurahName?: string;
  error?: string;
  reciter: Reciter;
  abortController?: AbortController;
  pendingSurahs: number[];
}

const STORAGE_KEY_ITEMS = 'sadaqah_downloaded_audio_items_v2';
const CACHE_NAME = 'sadaqah_quran_audio_cache_v2';

// Helper: map Juz to its constituent Surah numbers
export function getSurahsInJuz(juzNumber: number): number[] {
  const juz = ALL_JUZ_METADATA.find((j) => j.number === juzNumber);
  if (!juz) return [];

  // Find all surahs that start within or overlap with the Juz pages
  const surahs = ALL_SURAHS.filter((s) => {
    // If surah starts between startPage and endPage
    return s.startPage >= juz.startPage && s.startPage <= juz.endPage;
  });

  // If a surah spans across the boundary before this Juz startPage, include it if appropriate
  const priorSurah = ALL_SURAHS.slice().reverse().find((s) => s.startPage <= juz.startPage);
  if (priorSurah && !surahs.some((s) => s.number === priorSurah.number)) {
    surahs.unshift(priorSurah);
  }

  // Deduplicate and return numbers
  const uniqueNums = Array.from(new Set(surahs.map((s) => s.number)));
  return uniqueNums.sort((a, b) => a - b);
}

class AudioDownloadService {
  private downloadedItems: DownloadedAudioItem[] = [];
  private activeTask: ActiveDownloadTask | null = null;
  private listeners: Set<(task: ActiveDownloadTask | null, items: DownloadedAudioItem[]) => void> = new Set();

  constructor() {
    this.loadPersistedItems();
  }

  private loadPersistedItems() {
    try {
      const raw = localStorage.getItem(STORAGE_KEY_ITEMS);
      if (raw) {
        this.downloadedItems = JSON.parse(raw);
      }
    } catch {
      this.downloadedItems = [];
    }
  }

  private persistItems() {
    try {
      localStorage.setItem(STORAGE_KEY_ITEMS, JSON.stringify(this.downloadedItems));
    } catch (e) {
      console.warn('Could not persist downloaded audio metadata:', e);
    }
  }

  public subscribe(listener: (task: ActiveDownloadTask | null, items: DownloadedAudioItem[]) => void) {
    this.listeners.add(listener);
    listener(this.activeTask, this.downloadedItems);
    return () => {
      this.listeners.delete(listener);
    };
  }

  private notify() {
    this.listeners.forEach((fn) => fn(this.activeTask, [...this.downloadedItems]));
  }

  public getDownloadedItems(): DownloadedAudioItem[] {
    return [...this.downloadedItems];
  }

  public getActiveTask(): ActiveDownloadTask | null {
    return this.activeTask;
  }

  public isSurahDownloaded(surahNumber: number, reciterId: string): boolean {
    const id = `${reciterId}_${surahNumber}`;
    return this.downloadedItems.some((item) => item.id === id);
  }

  public async getOfflineAudioUrl(surahNumber: number, reciterId: string): Promise<string | null> {
    const id = `${reciterId}_${surahNumber}`;
    const item = this.downloadedItems.find((it) => it.id === id);
    if (!item) return null;

    try {
      if ('caches' in window) {
        const cache = await caches.open(CACHE_NAME);
        const match = await cache.match(item.url);
        if (match) {
          const blob = await match.blob();
          return URL.createObjectURL(blob);
        }
      }
    } catch (e) {
      console.warn('Failed retrieving cached audio blob:', e);
    }

    return null;
  }

  public async getStorageEstimate(): Promise<{ usedBytes: number; quotaBytes: number; usedPercent: number }> {
    try {
      if (navigator.storage && navigator.storage.estimate) {
        const estimate = await navigator.storage.estimate();
        const used = estimate.usage || 0;
        const quota = estimate.quota || 1024 * 1024 * 1024; // fallback 1GB
        const percent = Math.min(100, Math.round((used / quota) * 100));
        return { usedBytes: used, quotaBytes: quota, usedPercent: percent };
      }
    } catch {}

    const approximateUsed = this.downloadedItems.reduce((acc, it) => acc + it.sizeBytes, 0);
    return {
      usedBytes: approximateUsed,
      quotaBytes: 1024 * 1024 * 1024 * 5, // 5GB assumed
      usedPercent: Math.round((approximateUsed / (1024 * 1024 * 1024 * 5)) * 100),
    };
  }

  /**
   * Download a single surah
   */
  public async downloadSurah(surahNumber: number, reciter: Reciter): Promise<void> {
    const surah = ALL_SURAHS.find((s) => s.number === surahNumber);
    if (!surah) return;

    const surahNums = [surahNumber];
    await this.startQueueDownload({
      title: `تنزيل سورة ${surah.name}`,
      type: 'surah',
      surahNumbers: surahNums,
      reciter,
    });
  }

  /**
   * Download a specific Juz
   */
  public async downloadJuz(juzNumber: number, reciter: Reciter): Promise<void> {
    const surahNumbers = getSurahsInJuz(juzNumber);
    if (surahNumbers.length === 0) return;

    const juzMeta = ALL_JUZ_METADATA.find((j) => j.number === juzNumber);
    await this.startQueueDownload({
      title: `تنزيل ${juzMeta?.name || `الجزء ${juzNumber}`}`,
      type: 'juz',
      surahNumbers,
      reciter,
    });
  }

  /**
   * Download the complete Quran
   */
  public async downloadFullQuran(reciter: Reciter): Promise<void> {
    const allNums = ALL_SURAHS.map((s) => s.number);
    await this.startQueueDownload({
      title: `تنزيل المصحف كاملاً بصوت ${reciter.name}`,
      type: 'full',
      surahNumbers: allNums,
      reciter,
    });
  }

  /**
   * Internal queue engine with progress, pause, resume, cancel
   */
  private async startQueueDownload(options: {
    title: string;
    type: 'surah' | 'juz' | 'full';
    surahNumbers: number[];
    reciter: Reciter;
  }) {
    if (this.activeTask && this.activeTask.status === 'downloading') {
      throw new Error('هناك عملية تنزيل جارية بالفعل');
    }

    const abortController = new AbortController();
    this.activeTask = {
      id: `task_${Date.now()}`,
      title: options.title,
      type: options.type,
      totalItems: options.surahNumbers.length,
      completedItems: 0,
      totalBytes: 0,
      loadedBytes: 0,
      progressPercent: 0,
      status: 'downloading',
      reciter: options.reciter,
      abortController,
      pendingSurahs: [...options.surahNumbers],
    };
    this.notify();

    this.processQueue();
  }

  public pauseDownload() {
    if (this.activeTask && this.activeTask.status === 'downloading') {
      this.activeTask.abortController?.abort();
      this.activeTask.status = 'paused';
      this.notify();
    }
  }

  public resumeDownload() {
    if (this.activeTask && this.activeTask.status === 'paused') {
      this.activeTask.abortController = new AbortController();
      this.activeTask.status = 'downloading';
      this.notify();
      this.processQueue();
    }
  }

  public cancelDownload() {
    if (this.activeTask) {
      this.activeTask.abortController?.abort();
      this.activeTask.status = 'cancelled';
      this.notify();
      setTimeout(() => {
        this.activeTask = null;
        this.notify();
      }, 500);
    }
  }

  private async processQueue() {
    if (!this.activeTask || this.activeTask.status !== 'downloading') return;

    const task = this.activeTask;
    const reciter = task.reciter;

    let cache: Cache | null = null;
    if ('caches' in window) {
      try {
        cache = await caches.open(CACHE_NAME);
      } catch (e) {
        console.warn('Cache API not available:', e);
      }
    }

    while (task.pendingSurahs.length > 0 && task.status === 'downloading') {
      if (task.abortController?.signal.aborted) {
        break;
      }

      const surahNum = task.pendingSurahs[0];
      const surahMeta = ALL_SURAHS.find((s) => s.number === surahNum);
      task.currentSurahName = surahMeta ? `سورة ${surahMeta.name}` : `سورة رقم ${surahNum}`;
      this.notify();

      const itemId = `${reciter.id}_${surahNum}`;
      const audioUrl = getSurahAudioUrl(reciter, surahNum);

      try {
        // Fetch audio with progress
        const response = await fetch(audioUrl, {
          signal: task.abortController?.signal,
        });

        if (!response.ok) {
          throw new Error(`خطأ في جلب السورة (${response.status})`);
        }

        const contentLength = Number(response.headers.get('content-length')) || 0;
        const reader = response.body?.getReader();

        let receivedBytes = 0;
        const chunks: Uint8Array[] = [];

        if (reader) {
          while (true) {
            const { done, value } = await reader.read();
            if (done) break;
            if (value) {
              chunks.push(value);
              receivedBytes += value.length;
              task.loadedBytes += value.length;
              this.notify();
            }
          }
        }

        const audioBlob = new Blob(chunks as any, { type: 'audio/mpeg' });
        const finalSize = audioBlob.size || receivedBytes || contentLength;

        // Verify valid file
        if (finalSize < 1024) {
          throw new Error('حجم الملف الصوتي غير صالح أو تالف');
        }

        // Cache the response in Cache API
        if (cache) {
          const cacheResponse = new Response(audioBlob, {
            headers: {
              'Content-Type': 'audio/mpeg',
              'Content-Length': String(finalSize),
            },
          });
          await cache.put(audioUrl, cacheResponse);
        }

        // Save metadata
        const existingIndex = this.downloadedItems.findIndex((it) => it.id === itemId);
        const newItem: DownloadedAudioItem = {
          id: itemId,
          surahNumber: surahNum,
          surahName: surahMeta?.name || `سورة ${surahNum}`,
          reciterId: reciter.id,
          reciterName: reciter.name,
          riwayah: (reciter as any).riwayah || 'حفص عن عاصم',
          url: audioUrl,
          sizeBytes: finalSize,
          downloadedAt: Date.now(),
        };

        if (existingIndex >= 0) {
          this.downloadedItems[existingIndex] = newItem;
        } else {
          this.downloadedItems.push(newItem);
        }
        this.persistItems();

        // Advance task
        task.pendingSurahs.shift();
        task.completedItems += 1;
        task.progressPercent = Math.round((task.completedItems / task.totalItems) * 100);
        this.notify();
      } catch (err: any) {
        if (err.name === 'AbortError') {
          return;
        }
        console.error('Error downloading surah:', err);
        task.status = 'error';
        task.error = `تعذر تنزيل ${task.currentSurahName}: ${err.message || 'خطأ في الشبكة'}`;
        this.notify();
        return;
      }
    }

    if (task.completedItems >= task.totalItems && task.status === 'downloading') {
      task.status = 'completed';
      task.progressPercent = 100;
      task.currentSurahName = 'اكتملت جميع التنزيلات بنجاح';
      this.notify();
    }
  }

  public async deleteDownloadedItem(id: string): Promise<void> {
    const item = this.downloadedItems.find((it) => it.id === id);
    if (item && 'caches' in window) {
      try {
        const cache = await caches.open(CACHE_NAME);
        await cache.delete(item.url);
      } catch {}
    }

    this.downloadedItems = this.downloadedItems.filter((it) => it.id !== id);
    this.persistItems();
    this.notify();
  }

  public async exportFileToDevice(item: DownloadedAudioItem): Promise<void> {
    const offlineUrl = await this.getOfflineAudioUrl(item.surahNumber, item.reciterId);
    const downloadUrl = offlineUrl || item.url;

    const link = document.createElement('a');
    link.href = downloadUrl;
    link.download = `سورة_${item.surahName}_${item.reciterName}.mp3`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  }
}

export const audioDownloadService = new AudioDownloadService();
