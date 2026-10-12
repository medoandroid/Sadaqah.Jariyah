/**
 * MP3Quran API v3 Production Service
 * Documentation & Endpoints: https://www.mp3quran.net/ar/api
 * Base URL: https://www.mp3quran.net/api/v3
 */

import {
  MP3QReciter,
  MP3QRiwayah,
  MP3QMoshafType,
  MP3QRadio,
  MP3QLiveTV,
  MP3QTafsirBook,
  MP3QSurahTafsirItem,
  MP3QTadaborItem,
  MP3QVideoType,
  MP3QVideoReciter,
  MP3QAyatTimingRead,
  MP3QAyatTimingItem,
  MP3QLanguage,
  MP3QRecentRead,
  MP3QMoshaf
} from '../types/mp3quran';
import { storageService } from './storageService';

const BASE_URL = 'https://www.mp3quran.net/api/v3';

// Cache TTL in milliseconds
const CACHE_TTL_RECITER = 12 * 60 * 60 * 1000; // 12 hours
const CACHE_TTL_RADIO = 12 * 60 * 60 * 1000;   // 12 hours
const CACHE_TTL_STATIC = 24 * 60 * 60 * 1000;  // 24 hours
const CACHE_TTL_RECENT = 1 * 60 * 60 * 1000;   // 1 hour

interface CacheWrapper<T> {
  data: T;
  timestamp: number;
}

// In-memory cache for ultra-fast navigation between tabs
const memoryCache = new Map<string, any>();

async function fetchWithCache<T>(
  cacheKey: string,
  url: string,
  ttl: number,
  fallbackData?: T
): Promise<T> {
  // 1. Check memory cache first
  if (memoryCache.has(cacheKey)) {
    return memoryCache.get(cacheKey) as T;
  }

  // 2. Check localStorage cache
  const cached = storageService.get<CacheWrapper<T> | null>(cacheKey, null);
  const now = Date.now();
  if (cached && cached.data && now - cached.timestamp < ttl) {
    memoryCache.set(cacheKey, cached.data);
    return cached.data;
  }

  // 3. Fetch from API with timeout
  try {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 12000);

    const response = await fetch(url, {
      signal: controller.signal,
      headers: {
        'Accept': 'application/json'
      }
    });
    clearTimeout(timeoutId);

    if (!response.ok) {
      throw new Error(`HTTP ${response.status}: ${response.statusText}`);
    }

    const json = await response.json();
    memoryCache.set(cacheKey, json);
    storageService.set(cacheKey, { data: json, timestamp: now });
    return json;
  } catch (error) {
    console.warn(`[mp3QuranService] Failed to fetch ${url}:`, error);

    // If cache exists even if expired, return stale data
    if (cached && cached.data) {
      memoryCache.set(cacheKey, cached.data);
      return cached.data;
    }

    // Return fallback if provided
    if (fallbackData !== undefined) {
      return fallbackData;
    }

    throw error;
  }
}

export const mp3QuranService = {
  /**
   * 1. Get all Reciters (supports language, specific reciter, rewaya, sura)
   */
  async getReciters(params?: {
    language?: string;
    reciterId?: number;
    rewayaId?: number;
    surahNumber?: number;
  }): Promise<MP3QReciter[]> {
    const lang = params?.language || 'ar';
    const query = new URLSearchParams({ language: lang });
    if (params?.reciterId) query.append('reciter', String(params.reciterId));
    if (params?.rewayaId) query.append('rewaya', String(params.rewayaId));
    if (params?.surahNumber) query.append('sura', String(params.surahNumber));

    const cacheKey = `mp3q_reciters_${query.toString()}`;
    const url = `${BASE_URL}/reciters?${query.toString()}`;

    try {
      const data = await fetchWithCache<{ reciters: MP3QReciter[] }>(
        cacheKey,
        url,
        CACHE_TTL_RECITER
      );
      return data.reciters || [];
    } catch {
      return [];
    }
  },

  /**
   * 2. Get all Riwayat (Narrations)
   */
  async getRiwayat(language: string = 'ar'): Promise<MP3QRiwayah[]> {
    const cacheKey = `mp3q_riwayat_${language}`;
    const url = `${BASE_URL}/riwayat?language=${language}`;

    try {
      const data = await fetchWithCache<{ riwayat: MP3QRiwayah[] }>(
        cacheKey,
        url,
        CACHE_TTL_STATIC
      );
      return data.riwayat || [];
    } catch {
      return [];
    }
  },

  /**
   * 3. Get all Moshaf Types (مرتل، مجود، معلم، مصاحف الحرمين، إلخ)
   */
  async getMoshafTypes(language: string = 'ar'): Promise<MP3QMoshafType[]> {
    const cacheKey = `mp3q_moshaf_types_${language}`;
    const url = `${BASE_URL}/moshaf?language=${language}`;

    try {
      const data = await fetchWithCache<{ riwayat?: MP3QMoshafType[]; moshaf?: MP3QMoshafType[] }>(
        cacheKey,
        url,
        CACHE_TTL_STATIC
      );
      return data.riwayat || data.moshaf || [];
    } catch {
      return [];
    }
  },

  /**
   * 4. Get Recent Reads (Latest recorded audio recitations)
   */
  async getRecentReads(language: string = 'ar'): Promise<MP3QRecentRead[]> {
    const cacheKey = `mp3q_recent_reads_${language}`;
    const url = `${BASE_URL}/recent_reads?language=${language}`;

    try {
      const data = await fetchWithCache<{ reads: MP3QRecentRead[] }>(
        cacheKey,
        url,
        CACHE_TTL_RECENT
      );
      return data.reads || [];
    } catch {
      return [];
    }
  },

  /**
   * 5. Get all Islamic Live Radios (177+ 24/7 stations)
   */
  async getRadios(language: string = 'ar'): Promise<MP3QRadio[]> {
    const cacheKey = `mp3q_radios_${language}`;
    const url = `${BASE_URL}/radios?language=${language}`;

    try {
      const data = await fetchWithCache<{ radios: MP3QRadio[] }>(
        cacheKey,
        url,
        CACHE_TTL_RADIO
      );
      return data.radios || [];
    } catch {
      return [];
    }
  },

  /**
   * 6. Get Live TV Channels (Makkah Quran TV & Madinah Sunnah TV)
   */
  async getLiveTV(language: string = 'ar'): Promise<MP3QLiveTV[]> {
    const cacheKey = `mp3q_livetv_${language}`;
    const url = `${BASE_URL}/live-tv?language=${language}`;

    const fallback: { livetv: MP3QLiveTV[] } = {
      livetv: [
        {
          id: 3,
          name: 'قناة القرآن الكريم (الحرم المكي مباشر)',
          url: 'https://win.holol.com/live/quran/playlist.m3u8'
        },
        {
          id: 4,
          name: 'قناة السنة النبوية (المسجد النبوي مباشر)',
          url: 'https://win.holol.com/live/sunnah/playlist.m3u8'
        }
      ]
    };

    try {
      const data = await fetchWithCache<{ livetv: MP3QLiveTV[] }>(
        cacheKey,
        url,
        CACHE_TTL_STATIC,
        fallback
      );
      return data.livetv || fallback.livetv;
    } catch {
      return fallback.livetv;
    }
  },

  /**
   * 7. Get Tafasir List (Audio Tafsir books)
   */
  async getTafasir(language: string = 'ar'): Promise<MP3QTafsirBook[]> {
    const cacheKey = `mp3q_tafasir_${language}`;
    const url = `${BASE_URL}/tafasir?language=${language}`;

    try {
      const data = await fetchWithCache<{ tafasir: MP3QTafsirBook[] }>(
        cacheKey,
        url,
        CACHE_TTL_STATIC
      );
      return data.tafasir || [];
    } catch {
      return [{ id: 1, name: 'الخلاصة من تفسير الطبري', url: `${BASE_URL}/tafsir?tafsir=1&language=ar` }];
    }
  },

  /**
   * 8. Get Audio Tafsir for Surahs
   */
  async getSurahTafsir(
    tafsirId: number = 1,
    surahNumber?: number,
    language: string = 'ar'
  ): Promise<MP3QSurahTafsirItem[]> {
    const query = new URLSearchParams({
      tafsir: String(tafsirId),
      language
    });
    if (surahNumber) query.append('sura', String(surahNumber));

    const cacheKey = `mp3q_tafsir_${query.toString()}`;
    const url = `${BASE_URL}/tafsir?${query.toString()}`;

    try {
      const data = await fetchWithCache<{
        tafasir: {
          name: string;
          soar: Record<string, MP3QSurahTafsirItem[]>;
        };
      }>(cacheKey, url, CACHE_TTL_STATIC);

      if (data && data.tafasir && data.tafasir.soar) {
        if (surahNumber) {
          return data.tafasir.soar[String(surahNumber)] || [];
        }
        // Return flattened all surahs
        return Object.values(data.tafasir.soar).flat();
      }
      return [];
    } catch {
      return [];
    }
  },

  /**
   * 9. Get Quranic Reflections & Contemplations (Tadabor)
   */
  async getTadabor(
    surahNumber?: number,
    language: string = 'ar'
  ): Promise<MP3QTadaborItem[]> {
    const query = new URLSearchParams({ language });
    if (surahNumber) query.append('sura', String(surahNumber));

    const cacheKey = `mp3q_tadabor_${query.toString()}`;
    const url = `${BASE_URL}/tadabor?${query.toString()}`;

    try {
      const data = await fetchWithCache<{
        tadabor: Record<string, MP3QTadaborItem[]>;
      }>(cacheKey, url, CACHE_TTL_STATIC);

      if (data && data.tadabor) {
        if (surahNumber) {
          return data.tadabor[String(surahNumber)] || [];
        }
        return Object.values(data.tadabor).flat();
      }
      return [];
    } catch {
      return [];
    }
  },

  /**
   * 10. Get Video Types
   */
  async getVideoTypes(language: string = 'ar'): Promise<MP3QVideoType[]> {
    const cacheKey = `mp3q_video_types_${language}`;
    const url = `${BASE_URL}/video_types?language=${language}`;

    try {
      const data = await fetchWithCache<{ video_types: MP3QVideoType[] }>(
        cacheKey,
        url,
        CACHE_TTL_STATIC
      );
      return data.video_types || [];
    } catch {
      return [];
    }
  },

  /**
   * 11. Get Quranic Videos
   */
  async getVideos(language: string = 'ar'): Promise<MP3QVideoReciter[]> {
    const cacheKey = `mp3q_videos_${language}`;
    const url = `${BASE_URL}/videos?language=${language}`;

    try {
      const data = await fetchWithCache<{ videos: MP3QVideoReciter[] }>(
        cacheKey,
        url,
        CACHE_TTL_STATIC
      );
      return data.videos || [];
    } catch {
      return [];
    }
  },

  /**
   * 12. Get Ayat Timing Reads (Mushafs supporting ayah timing)
   */
  async getAyatTimingReads(): Promise<MP3QAyatTimingRead[]> {
    const cacheKey = 'mp3q_ayat_timing_reads';
    const url = `${BASE_URL}/ayat_timing/reads`;

    try {
      const data = await fetchWithCache<MP3QAyatTimingRead[]>(
        cacheKey,
        url,
        CACHE_TTL_STATIC
      );
      return Array.isArray(data) ? data : [];
    } catch {
      return [];
    }
  },

  /**
   * 13. Get Ayat Timing for a specific Surah & Read
   */
  async getAyatTiming(
    surahNumber: number,
    readId: number = 1
  ): Promise<MP3QAyatTimingItem[]> {
    const cacheKey = `mp3q_timing_s${surahNumber}_r${readId}`;
    const url = `${BASE_URL}/ayat_timing?surah=${surahNumber}&read=${readId}`;

    try {
      const data = await fetchWithCache<MP3QAyatTimingItem[]>(
        cacheKey,
        url,
        CACHE_TTL_STATIC
      );
      return Array.isArray(data) ? data : [];
    } catch {
      return [];
    }
  },

  /**
   * 14. Get Supported Languages
   */
  async getLanguages(): Promise<MP3QLanguage[]> {
    const cacheKey = 'mp3q_languages';
    const url = `${BASE_URL}/languages`;

    try {
      const data = await fetchWithCache<{ language: MP3QLanguage[] }>(
        cacheKey,
        url,
        CACHE_TTL_STATIC
      );
      return data.language || [];
    } catch {
      return [
        { id: '1', language: 'Arabic', native: 'العربية', locale: 'ar' },
        { id: '2', language: 'English', native: 'English', locale: 'eng' }
      ];
    }
  },

  /**
   * Helper: Formats a surah audio URL given a moshaf server URL and surah number
   */
  getSurahAudioUrl(serverUrl: string, surahNumber: number): string {
    const cleanServer = serverUrl.endsWith('/') ? serverUrl : `${serverUrl}/`;
    const padded = String(surahNumber).padStart(3, '0');
    return `${cleanServer}${padded}.mp3`;
  },

  /**
   * Helper: Checks if a surah is available in a given moshaf
   */
  isSurahAvailable(moshaf: MP3QMoshaf, surahNumber: number): boolean {
    if (!moshaf.surah_list) return false;
    const list = moshaf.surah_list.split(',').map((n) => parseInt(n.trim(), 10));
    return list.includes(surahNumber);
  }
};
