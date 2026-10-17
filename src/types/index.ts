export interface Person {
  id: string;
  name: string;
  relationTitle: string;
  title: string;
  deathDate?: string;
  photoUrl?: string;
  bio: string;
  dedicationDua: string;
  badges?: string[];
}

export interface SurahMeta {
  number: number;
  name: string;
  englishName: string;
  englishNameTranslation: string;
  numberOfAyahs: number;
  revelationType: 'Meccan' | 'Medinan';
  revelationArabic: 'مكية' | 'مدنية';
  startPage: number;
}

export interface Ayah {
  number: number;
  text: string;
  numberInSurah: number;
  juz: number;
  manzil: number;
  page: number;
  ruku: number;
  hizbQuarter: number;
  sajda: boolean;
  audio?: string;
  translation?: string;
}

export interface SurahDetail extends SurahMeta {
  ayahs: Ayah[];
}

export interface Reciter {
  id: string;
  name: string;
  subName?: string;
  serverUrl: string; // Base URL for mp3 files
  format: 'mp3';
  style: string;
}

export type CardTheme = 'parchment' | 'royalDark' | 'emerald' | 'midnight' | 'ruby' | 'amber';
export type CardAspectRatio = 'portrait' | 'story' | 'square' | 'banner';
export type CardFontFamily = 'amiri' | 'ibm' | 'cairo';
export type CardFontSize = 'auto' | 'small' | 'normal' | 'large' | 'huge';

export interface DuaItem {
  id: string;
  title: string;
  arabic: string;
  source?: string;
  category: 'deceased' | 'mercy' | 'forgiveness' | 'family' | 'quranic' | 'comprehensive' | 'distress' | 'parents' | 'healing';
  categoryLabel: string;
  virtue?: string;
  isBookmarked?: boolean;
}

export interface DhikrItem {
  id: string;
  text: string;
  count: number;
  currentCount?: number;
  virtue?: string;
  reference?: string;
  category: 'morning' | 'evening' | 'postPrayer' | 'sleep' | 'tasbeeh' | 'waking' | 'mosqueHome' | 'ruqyah' | 'khatmQuran';
}

export interface DedicationRecord {
  id: string;
  type: 'surah' | 'tasbeeh' | 'dua' | 'khatmah' | 'charity';
  title: string;
  targetPersonId: string | 'all'; // 'all' or specific person
  targetPersonName: string;
  count: number;
  timestamp: number;
  donorName?: string;
}

export interface KhatmahJuz {
  juzNumber: number;
  name: string;
  startSurah: string;
  status: 'available' | 'reserved' | 'completed';
  readerName?: string;
  reservedAt?: number;
  completedAt?: number;
  dedicatedToId: string;
}

export interface CondolenceMessage {
  id: string;
  author: string;
  message: string;
  targetPersonId: string | 'all';
  targetPersonName: string;
  createdAt: number;
}

export interface AyahBookmark {
  id: string;
  surahNumber: number;
  surahName: string;
  ayahNumber: number;
  ayahText: string;
  createdAt: number;
  note?: string;
}

export interface PrayerTimeItem {
  name: string;
  arabicName: string;
  time: string;
  isNext?: boolean;
}

export interface PersonalDua {
  id: string;
  title: string;
  text: string;
  category: string;
  targetPerson?: string;
  createdAt: number;
  updatedAt?: number;
  isFavorite?: boolean;
  reciteCount?: number;
}

export interface DailyWirdData {
  targetPages: number;
  targetType: 'pages' | 'ayahs';
  completedToday: number;
  lastDate: string; // YYYY-MM-DD
  streakDays: number;
  totalCompleted: number;
  history: Record<string, number>;
}

export type RepeatMode = 'continuous' | 'repeat-one' | 'repeat-all' | 'shuffle';
