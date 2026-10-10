import { AyahBookmark } from '../types';
import { storageService } from './storageService';

const STORAGE_KEY = 'quran_saved_bookmarks';

export const quranBookmarkService = {
  getBookmarks(): AyahBookmark[] {
    return storageService.get<AyahBookmark[]>(STORAGE_KEY, []);
  },

  isBookmarked(surahNumber: number, ayahNumber: number): boolean {
    const list = this.getBookmarks();
    return list.some(b => b.surahNumber === surahNumber && b.ayahNumber === ayahNumber);
  },

  addBookmark(data: {
    surahNumber: number;
    surahName: string;
    ayahNumber: number;
    ayahText: string;
    note?: string;
  }): AyahBookmark {
    const list = this.getBookmarks();
    const existingIndex = list.findIndex(
      b => b.surahNumber === data.surahNumber && b.ayahNumber === data.ayahNumber
    );

    const newBookmark: AyahBookmark = {
      id: `bm-${data.surahNumber}-${data.ayahNumber}-${Date.now()}`,
      surahNumber: data.surahNumber,
      surahName: data.surahName,
      ayahNumber: data.ayahNumber,
      ayahText: data.ayahText,
      createdAt: Date.now(),
      note: data.note,
    };

    if (existingIndex >= 0) {
      list[existingIndex] = newBookmark;
    } else {
      list.unshift(newBookmark);
    }

    storageService.set(STORAGE_KEY, list);
    return newBookmark;
  },

  removeBookmark(surahNumber: number, ayahNumber: number): boolean {
    const list = this.getBookmarks();
    const filtered = list.filter(
      b => !(b.surahNumber === surahNumber && b.ayahNumber === ayahNumber)
    );
    storageService.set(STORAGE_KEY, filtered);
    return true;
  },

  toggleBookmark(data: {
    surahNumber: number;
    surahName: string;
    ayahNumber: number;
    ayahText: string;
    note?: string;
  }): boolean {
    if (this.isBookmarked(data.surahNumber, data.ayahNumber)) {
      this.removeBookmark(data.surahNumber, data.ayahNumber);
      return false;
    } else {
      this.addBookmark(data);
      return true;
    }
  },
};
