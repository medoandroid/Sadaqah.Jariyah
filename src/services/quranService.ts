import { Ayah, SurahDetail } from '../types';
import { ALL_SURAHS } from '../data/quranMeta';
import { offlineQuranService } from './offlineQuranService';

// Cache for downloaded surahs to avoid repeated network calls
const surahCache: Record<number, Ayah[]> = {};

// Embedded primary surahs for offline instant load & initial speed
const EMBEDDED_FATIHA: Ayah[] = [
  { number: 1, numberInSurah: 1, text: 'بِسْمِ اللَّهِ الرَّحْمَٰنِ الرَّحِيمِ', juz: 1, manzil: 1, page: 1, ruku: 1, hizbQuarter: 1, sajda: false },
  { number: 2, numberInSurah: 2, text: 'الْحَمْدُ لِلَّهِ رَبِّ الْعَالَمِينَ', juz: 1, manzil: 1, page: 1, ruku: 1, hizbQuarter: 1, sajda: false },
  { number: 3, numberInSurah: 3, text: 'الرَّحْمَٰنِ الرَّحِيمِ', juz: 1, manzil: 1, page: 1, ruku: 1, hizbQuarter: 1, sajda: false },
  { number: 4, numberInSurah: 4, text: 'مَالِكِ يَوْمِ الدِّينِ', juz: 1, manzil: 1, page: 1, ruku: 1, hizbQuarter: 1, sajda: false },
  { number: 5, numberInSurah: 5, text: 'إِيَّاكَ نَعْبُدُ وَإِيَّاكَ نَسْتَعِينُ', juz: 1, manzil: 1, page: 1, ruku: 1, hizbQuarter: 1, sajda: false },
  { number: 6, numberInSurah: 6, text: 'اهْدِنَا الصِّرَاطَ الْمُسْتَقِيمَ', juz: 1, manzil: 1, page: 1, ruku: 1, hizbQuarter: 1, sajda: false },
  { number: 7, numberInSurah: 7, text: 'صِرَاطَ الَّذِينَ أَنْعَمْتَ عَلَيْهِمْ غَيْرِ الْمَغْضُوبِ عَلَيْهِمْ وَلَا الضَّالِّينَ', juz: 1, manzil: 1, page: 1, ruku: 1, hizbQuarter: 1, sajda: false },
];

const EMBEDDED_IKHLAS: Ayah[] = [
  { number: 1, numberInSurah: 1, text: 'قُلْ هُوَ اللَّهُ أَحَدٌ', juz: 30, manzil: 7, page: 604, ruku: 554, hizbQuarter: 240, sajda: false },
  { number: 2, numberInSurah: 2, text: 'اللَّهُ الصَّمَدُ', juz: 30, manzil: 7, page: 604, ruku: 554, hizbQuarter: 240, sajda: false },
  { number: 3, numberInSurah: 3, text: 'لَمْ يَلِدْ وَلَمْ يُولَدْ', juz: 30, manzil: 7, page: 604, ruku: 554, hizbQuarter: 240, sajda: false },
  { number: 4, numberInSurah: 4, text: 'وَلَمْ يَكُن لَّهُ كُفُوًا أَحَدٌ', juz: 30, manzil: 7, page: 604, ruku: 554, hizbQuarter: 240, sajda: false },
];

const EMBEDDED_FALAQ: Ayah[] = [
  { number: 1, numberInSurah: 1, text: 'قُلْ أَعُوذُ بِرَبِّ الْفَلَقِ', juz: 30, manzil: 7, page: 604, ruku: 555, hizbQuarter: 240, sajda: false },
  { number: 2, numberInSurah: 2, text: 'مِن شَرِّ مَا خَلَقَ', juz: 30, manzil: 7, page: 604, ruku: 555, hizbQuarter: 240, sajda: false },
  { number: 3, numberInSurah: 3, text: 'وَمِن شَرِّ غَاسِقٍ إِذَا وَقَبَ', juz: 30, manzil: 7, page: 604, ruku: 555, hizbQuarter: 240, sajda: false },
  { number: 4, numberInSurah: 4, text: 'وَمِن شَرِّ النَّفَّاثَاتِ فِي الْعُقَدِ', juz: 30, manzil: 7, page: 604, ruku: 555, hizbQuarter: 240, sajda: false },
  { number: 5, numberInSurah: 5, text: 'وَمِن شَرِّ حَاسِدٍ إِذَا حَسَدَ', juz: 30, manzil: 7, page: 604, ruku: 555, hizbQuarter: 240, sajda: false },
];

const EMBEDDED_NAS: Ayah[] = [
  { number: 1, numberInSurah: 1, text: 'قُلْ أَعُوذُ بِرَبِّ النَّاسِ', juz: 30, manzil: 7, page: 604, ruku: 556, hizbQuarter: 240, sajda: false },
  { number: 2, numberInSurah: 2, text: 'مَلِكِ النَّاسِ', juz: 30, manzil: 7, page: 604, ruku: 556, hizbQuarter: 240, sajda: false },
  { number: 3, numberInSurah: 3, text: 'إِلَٰهِ النَّاسِ', juz: 30, manzil: 7, page: 604, ruku: 556, hizbQuarter: 240, sajda: false },
  { number: 4, numberInSurah: 4, text: 'مِن شَرِّ الْوَسْوَاسِ الْخَنَّاسِ', juz: 30, manzil: 7, page: 604, ruku: 556, hizbQuarter: 240, sajda: false },
  { number: 5, numberInSurah: 5, text: 'الَّذِي يُوَسْوِسُ فِي صُدُورِ النَّاسِ', juz: 30, manzil: 7, page: 604, ruku: 556, hizbQuarter: 240, sajda: false },
  { number: 6, numberInSurah: 6, text: 'مِنَ الْجِنَّةِ وَالنَّاسِ', juz: 30, manzil: 7, page: 604, ruku: 556, hizbQuarter: 240, sajda: false },
];

surahCache[1] = EMBEDDED_FATIHA;
surahCache[112] = EMBEDDED_IKHLAS;
surahCache[113] = EMBEDDED_FALAQ;
surahCache[114] = EMBEDDED_NAS;

export async function fetchSurahDetail(surahNumber: number): Promise<SurahDetail> {
  const meta = ALL_SURAHS.find(s => s.number === surahNumber) || ALL_SURAHS[0];

  // Check in-memory cache first
  if (surahCache[surahNumber] && surahCache[surahNumber].length > 0) {
    return {
      ...meta,
      ayahs: surahCache[surahNumber],
    };
  }

  // Check IndexedDB offline storage
  try {
    const offlineAyahs = await offlineQuranService.getSurahFromOffline(surahNumber);
    if (offlineAyahs && offlineAyahs.length > 0) {
      surahCache[surahNumber] = offlineAyahs;
      return {
        ...meta,
        ayahs: offlineAyahs,
      };
    }
  } catch (err) {
    console.warn('Offline DB read error:', err);
  }

  // Check localStorage cache
  try {
    const local = localStorage.getItem(`quran_surah_${surahNumber}`);
    if (local) {
      const parsed: Ayah[] = JSON.parse(local);
      if (parsed && parsed.length > 0) {
        surahCache[surahNumber] = parsed;
        offlineQuranService.saveSurahToOffline(surahNumber, parsed);
        return {
          ...meta,
          ayahs: parsed,
        };
      }
    }
  } catch (err) {
    console.warn('LocalStorage read error:', err);
  }

  // Fetch from AlQuran Cloud API (Uthmani text)
  try {
    const response = await fetch(`https://api.alquran.cloud/v1/surah/${surahNumber}/quran-uthmani`);
    if (!response.ok) {
      throw new Error(`Failed to fetch surah: ${response.statusText}`);
    }
    const data = await response.json();
    if (data && data.data && Array.isArray(data.data.ayahs)) {
      const ayahs: Ayah[] = data.data.ayahs.map((a: any) => ({
        number: a.number,
        text: a.text,
        numberInSurah: a.numberInSurah,
        juz: a.juz,
        manzil: a.manzil,
        page: a.page,
        ruku: a.ruku,
        hizbQuarter: a.hizbQuarter,
        sajda: Boolean(a.sajda),
      }));

      surahCache[surahNumber] = ayahs;
      offlineQuranService.saveSurahToOffline(surahNumber, ayahs);

      return {
        ...meta,
        ayahs,
      };
    }
  } catch (error) {
    console.error(`Error loading surah ${surahNumber}:`, error);
  }

  // Fallback to embedded or dummy verses if network is down
  return {
    ...meta,
    ayahs: surahCache[surahNumber] || [
      {
        number: 1,
        numberInSurah: 1,
        text: `سورة ${meta.name} - جاري تحميل الآيات الكريمة...`,
        juz: 1,
        manzil: 1,
        page: meta.startPage,
        ruku: 1,
        hizbQuarter: 1,
        sajda: false,
      }
    ]
  };
}

export interface Bookmark {
  surahNumber: number;
  surahName: string;
  ayahNumber: number;
  updatedAt: number;
}

export function saveLastReadBookmark(surahNumber: number, surahName: string, ayahNumber: number): void {
  try {
    const bookmark: Bookmark = {
      surahNumber,
      surahName,
      ayahNumber,
      updatedAt: Date.now(),
    };
    localStorage.setItem('quran_last_read_bookmark', JSON.stringify(bookmark));
  } catch (err) {
    console.error('Failed to save bookmark', err);
  }
}

export function getLastReadBookmark(): Bookmark | null {
  try {
    const val = localStorage.getItem('quran_last_read_bookmark');
    return val ? JSON.parse(val) : null;
  } catch (err) {
    return null;
  }
}
