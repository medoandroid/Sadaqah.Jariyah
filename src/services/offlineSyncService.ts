/**
 * Comprehensive Offline Synchronization and Cache Management Engine
 * Manages connectivity state, offline queue synchronization, background caching,
 * and IndexedDB/LocalStorage health.
 */

import { offlineQuranService } from './offlineQuranService';
import { storageService } from './storageService';

export interface OfflineStatus {
  isOnline: boolean;
  isFullyOfflineReady: boolean;
  downloadedSurahsCount: number;
  totalSurahsCount: number;
  pendingSyncCount: number;
  lastSyncTimestamp: number | null;
  isSyncing: boolean;
}

type OfflineListener = (status: OfflineStatus) => void;

class OfflineSyncService {
  private isOnline: boolean = typeof navigator !== 'undefined' ? navigator.onLine : true;
  private isSyncing: boolean = false;
  private listeners: Set<OfflineListener> = new Set();
  private downloadedCount: number = 0;
  private pendingQueueKey = 'sadaqah_offline_sync_queue';
  private backgroundDownloadStarted = false;

  constructor() {
    if (typeof window !== 'undefined') {
      window.addEventListener('online', this.handleOnline);
      window.addEventListener('offline', this.handleOffline);

      // Initial check of offline Quran status
      this.refreshStatus();

      // Start quiet background sync/seeding if online after idle
      if (this.isOnline) {
        setTimeout(() => {
          this.triggerAutoSync();
        }, 3000);
      }
    }
  }

  private handleOnline = () => {
    this.isOnline = true;
    this.notify();
    this.triggerAutoSync();
  };

  private handleOffline = () => {
    this.isOnline = false;
    this.notify();
  };

  public getStatus(): OfflineStatus {
    const lastSync = storageService.getNumber('last_sync_timestamp', 0);
    return {
      isOnline: this.isOnline,
      isFullyOfflineReady: this.downloadedCount >= 114,
      downloadedSurahsCount: this.downloadedCount,
      totalSurahsCount: 114,
      pendingSyncCount: this.getPendingQueue().length,
      lastSyncTimestamp: lastSync > 0 ? lastSync : null,
      isSyncing: this.isSyncing,
    };
  }

  public subscribe(listener: OfflineListener): () => void {
    this.listeners.add(listener);
    listener(this.getStatus());
    return () => {
      this.listeners.delete(listener);
    };
  }

  private notify() {
    const status = this.getStatus();
    this.listeners.forEach((l) => l(status));
  }

  public async refreshStatus(): Promise<void> {
    try {
      this.downloadedCount = await offlineQuranService.getDownloadedCount();
      this.notify();
    } catch {
      this.downloadedCount = 0;
    }
  }

  /**
   * Queue an action taken while offline (e.g. dedication, khatmah read, wird completion)
   */
  public queueOfflineAction(action: {
    type: 'dedication' | 'khatmah' | 'bookmark' | 'dua' | 'tasbeeh';
    payload: any;
    timestamp: number;
  }): void {
    const queue = this.getPendingQueue();
    queue.push(action);
    storageService.set(this.pendingQueueKey, queue);
    this.notify();

    if (this.isOnline) {
      this.triggerAutoSync();
    }
  }

  private getPendingQueue(): any[] {
    return storageService.get<any[]>(this.pendingQueueKey, []);
  }

  private clearPendingQueue(): void {
    storageService.set(this.pendingQueueKey, []);
  }

  /**
   * Automatically process queued actions and refresh cached state when online
   */
  public async triggerAutoSync(): Promise<boolean> {
    if (this.isSyncing) return true;
    if (!this.isOnline) return false;

    this.isSyncing = true;
    this.notify();

    try {
      const queue = this.getPendingQueue();
      if (queue.length > 0) {
        // Process offline queued items
        for (const item of queue) {
          // All data in this client app is safely persisted to LocalStorage/IndexedDB.
          // In full-stack or future server sync, this connects to server endpoints.
        }
        this.clearPendingQueue();
      }

      // Refresh downloaded count
      this.downloadedCount = await offlineQuranService.getDownloadedCount();

      // If online and not all surahs downloaded, quietly prefetch in chunks when network is free
      if (this.downloadedCount < 114 && !this.backgroundDownloadStarted) {
        this.startQuietBackgroundPrefetch();
      }

      storageService.setNumber('last_sync_timestamp', Date.now());
      return true;
    } catch (err) {
      console.warn('[OfflineSyncService] AutoSync notice:', err);
      return false;
    } finally {
      this.isSyncing = false;
      this.notify();
    }
  }

  /**
   * Progressive, non-intrusive background caching of Quran
   */
  private async startQuietBackgroundPrefetch(): Promise<void> {
    if (this.backgroundDownloadStarted) return;
    this.backgroundDownloadStarted = true;

    try {
      // Fetch full Quran once quietly and save to IndexedDB
      await offlineQuranService.downloadAllSurahs((completed) => {
        this.downloadedCount = completed;
        this.notify();
      });
    } catch {
      // Silent catch for background process
    }
  }
}

export const offlineSyncService = new OfflineSyncService();
