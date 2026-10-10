import { AyahBookmark } from '../types';

export function getAyahBookmarks(): AyahBookmark[] {
  try {
    const raw = localStorage.getItem('sadaqah_ayah_bookmarks_list');
    if (raw) {
      return JSON.parse(raw);
    }
  } catch (e) {}
  return [];
}

export function saveAyahBookmark(
  surahNumber: number,
  surahName: string,
  ayahNumber: number,
  ayahText: string,
  note?: string
): AyahBookmark {
  const bookmarks = getAyahBookmarks();
  // Check if exists
  const existingIdx = bookmarks.findIndex(
    (b) => b.surahNumber === surahNumber && b.ayahNumber === ayahNumber
  );

  const item: AyahBookmark = {
    id: `bm-${surahNumber}-${ayahNumber}`,
    surahNumber,
    surahName,
    ayahNumber,
    ayahText,
    createdAt: Date.now(),
    note,
  };

  if (existingIdx >= 0) {
    bookmarks[existingIdx] = item;
  } else {
    bookmarks.unshift(item);
  }

  try {
    localStorage.setItem('sadaqah_ayah_bookmarks_list', JSON.stringify(bookmarks));
  } catch (e) {}

  return item;
}

export function removeAyahBookmark(id: string): void {
  try {
    const bookmarks = getAyahBookmarks().filter((b) => b.id !== id);
    localStorage.setItem('sadaqah_ayah_bookmarks_list', JSON.stringify(bookmarks));
  } catch (e) {}
}

export function isAyahBookmarked(surahNumber: number, ayahNumber: number): boolean {
  return getAyahBookmarks().some(
    (b) => b.surahNumber === surahNumber && b.ayahNumber === ayahNumber
  );
}
