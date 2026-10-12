import { ALL_SURAHS, ALL_JUZ_METADATA } from '../data/quranMeta';
import { getSurahsInJuz } from './audioDownloadService';

export interface QuranPlaylistItem {
  surahNumber: number;
  addedAt: number;
}

export interface CustomPlaylist {
  id: string;
  title: string;
  description: string;
  icon: 'heart' | 'sparkles' | 'shield' | 'book' | 'moon' | 'list' | 'flame' | 'layers';
  color: string;
  isSystem?: boolean;
  surahNumbers: number[];
  createdAt: number;
  updatedAt: number;
}

const STORAGE_KEY = 'sadaqah_custom_playlists_v2';

const DEFAULT_PLAYLISTS: CustomPlaylist[] = [
  {
    id: 'favorites',
    title: 'المفضلة',
    description: 'السور المحببة إلى قلبك للوصول السريع والاستماع المتكرر',
    icon: 'heart',
    color: '#F43F5E',
    isSystem: true,
    surahNumbers: [1, 36, 55, 56, 67],
    createdAt: 1700000000000,
    updatedAt: 1700000000000,
  },
  {
    id: 'daily_wird',
    title: 'الورد اليومي',
    description: 'قائمتك المنتظمة للقراءة والاستماع اليومي وتثبيت الحفظ',
    icon: 'book',
    color: '#059669',
    isSystem: true,
    surahNumbers: [18, 36, 67, 112, 113, 114],
    createdAt: 1700000000000,
    updatedAt: 1700000000000,
  },
  {
    id: 'listen_queue',
    title: 'قائمة الاستماع المؤقتة',
    description: 'السور المضافة لجدول الاستماع والمتابعة المتتالية',
    icon: 'list',
    color: '#D97706',
    isSystem: true,
    surahNumbers: [1, 2],
    createdAt: 1700000000000,
    updatedAt: 1700000000000,
  },
  {
    id: 'ruqyah',
    title: 'الرقية الشرعية والشفاء',
    description: 'الفاتحة، آية الكرسي من البقرة، خواتيم البقرة، الإخلاص والمعوذتان',
    icon: 'shield',
    color: '#10B981',
    isSystem: true,
    surahNumbers: [1, 2, 112, 113, 114],
    createdAt: 1700000000000,
    updatedAt: 1700000000000,
  },
  {
    id: 'juz_amma',
    title: 'جزء عمّ (الجزء الثلاثون)',
    description: 'تلاوة متصلة لقصار السور المباركة من النبأ إلى الناس',
    icon: 'sparkles',
    color: '#F59E0B',
    isSystem: true,
    surahNumbers: Array.from({ length: 37 }, (_, i) => 78 + i),
    createdAt: 1700000000000,
    updatedAt: 1700000000000,
  },
  {
    id: 'sleep_surahs',
    title: 'سور قبل النوم والسكينة',
    description: 'السجدة، يس، الملك، والواقعة لراحة البال وطمأنينة القلب',
    icon: 'moon',
    color: '#6366F1',
    isSystem: true,
    surahNumbers: [32, 36, 56, 67],
    createdAt: 1700000000000,
    updatedAt: 1700000000000,
  },
];

class CustomPlaylistsService {
  private playlists: CustomPlaylist[] = [];
  private listeners: Set<(playlists: CustomPlaylist[]) => void> = new Set();

  constructor() {
    this.loadPlaylists();
  }

  private loadPlaylists() {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      if (raw) {
        const parsed = JSON.parse(raw);
        if (Array.isArray(parsed) && parsed.length > 0) {
          // Merge with defaults if system playlists missing
          const existingIds = new Set(parsed.map((p: CustomPlaylist) => p.id));
          const missingDefaults = DEFAULT_PLAYLISTS.filter((d) => !existingIds.has(d.id));
          this.playlists = [...parsed, ...missingDefaults];
          return;
        }
      }
    } catch {}
    this.playlists = [...DEFAULT_PLAYLISTS];
    this.persist();
  }

  private persist() {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(this.playlists));
    } catch (e) {
      console.warn('Error saving playlists:', e);
    }
  }

  public subscribe(listener: (playlists: CustomPlaylist[]) => void) {
    this.listeners.add(listener);
    listener([...this.playlists]);
    return () => {
      this.listeners.delete(listener);
    };
  }

  private notify() {
    this.listeners.forEach((fn) => fn([...this.playlists]));
  }

  public getPlaylists(): CustomPlaylist[] {
    return [...this.playlists];
  }

  public getPlaylistById(id: string): CustomPlaylist | undefined {
    return this.playlists.find((p) => p.id === id);
  }

  public createPlaylist(params: {
    title: string;
    description?: string;
    icon?: CustomPlaylist['icon'];
    color?: string;
    initialSurahs?: number[];
  }): CustomPlaylist {
    const newPlaylist: CustomPlaylist = {
      id: `playlist_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`,
      title: params.title.trim() || 'قائمة جديدة',
      description: params.description?.trim() || 'قائمة تلاوات مخصصة',
      icon: params.icon || 'sparkles',
      color: params.color || '#D97706',
      surahNumbers: params.initialSurahs || [],
      createdAt: Date.now(),
      updatedAt: Date.now(),
    };

    this.playlists.push(newPlaylist);
    this.persist();
    this.notify();
    return newPlaylist;
  }

  public updatePlaylist(
    id: string,
    updates: Partial<Pick<CustomPlaylist, 'title' | 'description' | 'icon' | 'color'>>
  ): boolean {
    const playlist = this.playlists.find((p) => p.id === id);
    if (!playlist) return false;

    if (updates.title !== undefined) playlist.title = updates.title.trim();
    if (updates.description !== undefined) playlist.description = updates.description.trim();
    if (updates.icon !== undefined) playlist.icon = updates.icon;
    if (updates.color !== undefined) playlist.color = updates.color;
    playlist.updatedAt = Date.now();

    this.persist();
    this.notify();
    return true;
  }

  public deletePlaylist(id: string): boolean {
    const target = this.playlists.find((p) => p.id === id);
    if (!target || target.isSystem) {
      return false; // cannot delete system playlists
    }

    this.playlists = this.playlists.filter((p) => p.id !== id);
    this.persist();
    this.notify();
    return true;
  }

  public addSurahToPlaylist(playlistId: string, surahNumber: number): boolean {
    const playlist = this.playlists.find((p) => p.id === playlistId);
    if (!playlist) return false;

    if (!playlist.surahNumbers.includes(surahNumber)) {
      playlist.surahNumbers.push(surahNumber);
      playlist.updatedAt = Date.now();
      this.persist();
      this.notify();
      return true;
    }
    return false;
  }

  public addJuzToPlaylist(playlistId: string, juzNumber: number): number {
    const playlist = this.playlists.find((p) => p.id === playlistId);
    if (!playlist) return 0;

    const surahsInJuz = getSurahsInJuz(juzNumber);
    let addedCount = 0;

    surahsInJuz.forEach((sNum) => {
      if (!playlist.surahNumbers.includes(sNum)) {
        playlist.surahNumbers.push(sNum);
        addedCount++;
      }
    });

    if (addedCount > 0) {
      playlist.updatedAt = Date.now();
      this.persist();
      this.notify();
    }

    return addedCount;
  }

  public removeSurahFromPlaylist(playlistId: string, surahNumber: number): boolean {
    const playlist = this.playlists.find((p) => p.id === playlistId);
    if (!playlist) return false;

    const initialLength = playlist.surahNumbers.length;
    playlist.surahNumbers = playlist.surahNumbers.filter((n) => n !== surahNumber);

    if (playlist.surahNumbers.length !== initialLength) {
      playlist.updatedAt = Date.now();
      this.persist();
      this.notify();
      return true;
    }
    return false;
  }

  public reorderSurahInPlaylist(playlistId: string, fromIndex: number, toIndex: number): boolean {
    const playlist = this.playlists.find((p) => p.id === playlistId);
    if (!playlist) return false;

    if (
      fromIndex < 0 ||
      fromIndex >= playlist.surahNumbers.length ||
      toIndex < 0 ||
      toIndex >= playlist.surahNumbers.length
    ) {
      return false;
    }

    const items = [...playlist.surahNumbers];
    const [moved] = items.splice(fromIndex, 1);
    items.splice(toIndex, 0, moved);

    playlist.surahNumbers = items;
    playlist.updatedAt = Date.now();
    this.persist();
    this.notify();
    return true;
  }

  public toggleFavoriteSurah(surahNumber: number): boolean {
    const fav = this.playlists.find((p) => p.id === 'favorites');
    if (!fav) return false;

    const exists = fav.surahNumbers.includes(surahNumber);
    if (exists) {
      this.removeSurahFromPlaylist('favorites', surahNumber);
      return false;
    } else {
      this.addSurahToPlaylist('favorites', surahNumber);
      return true;
    }
  }

  public isFavoriteSurah(surahNumber: number): boolean {
    const fav = this.playlists.find((p) => p.id === 'favorites');
    return fav ? fav.surahNumbers.includes(surahNumber) : false;
  }
}

export const customPlaylistsService = new CustomPlaylistsService();
