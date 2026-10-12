/**
 * MP3Quran API v3 TypeScript Definitions
 * Official API: https://www.mp3quran.net/api/v3
 */

export interface MP3QMoshaf {
  id: number;
  name: string;
  rewaya_id: number;
  server: string;
  surah_total: number;
  moshaf_type: number;
  surah_list: string; // Comma separated surah numbers: "1,2,3,..."
}

export interface MP3QReciter {
  id: number;
  name: string;
  letter: string;
  date?: string;
  moshaf: MP3QMoshaf[];
}

export interface MP3QRiwayah {
  id: number;
  name: string;
}

export interface MP3QMoshafType {
  id: number;
  name: string;
}

export interface MP3QRadio {
  id: number;
  name: string;
  url: string;
  recent_date?: string;
}

export interface MP3QLiveTV {
  id: number;
  name: string;
  url: string;
}

export interface MP3QTafsirBook {
  id: number;
  name: string;
  url: string;
}

export interface MP3QSurahTafsirItem {
  id: number;
  tafsir_id: number;
  name: string;
  url: string;
  sura_id: number;
}

export interface MP3QTadaborItem {
  id: number;
  title: string;
  sora_name: string;
  rewaya_name?: string | null;
  reciter_name?: string | null;
  video_url?: string | null;
  audio_url?: string | null;
  image_url?: string | null;
  text?: string;
  share_title?: string;
  share_url?: string;
}

export interface MP3QVideoType {
  id: number;
  video_type: string;
}

export interface MP3QVideoItem {
  id: number;
  video_type: number;
  video_url: string;
  video_thumb_url: string;
}

export interface MP3QVideoReciter {
  id: number;
  reciter_name: string;
  videos: MP3QVideoItem[];
}

export interface MP3QAyatTimingRead {
  id: number;
  name: string;
  rewaya: string;
  folder_url: string;
  soar_count: number;
  soar_link: string;
}

export interface MP3QAyatTimingItem {
  ayah: number;
  start_time: number; // In milliseconds
  end_time: number;   // In milliseconds
  polygon?: string;
  x?: string;
  y?: string;
  page?: string;
}

export interface MP3QLanguage {
  id: string;
  language: string;
  native: string;
  locale: string;
  surah?: string;
  rewayah?: string;
  reciters?: string;
  radios?: string;
  tafasir?: string;
}

export interface MP3QRecentRead {
  id: number;
  name: string;
  letter: string;
  moshaf: MP3QMoshaf[];
  recent_date: string;
}
