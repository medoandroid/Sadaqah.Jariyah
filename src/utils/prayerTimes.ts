/**
 * High-precision astronomical Islamic Prayer Times Calculator
 * Works 100% offline with zero external API dependencies.
 */

export interface CityLocation {
  id: string;
  name: string;
  country: string;
  latitude: number;
  longitude: number;
  timezone: number; // UTC offset in hours
}

export const POPULAR_CITIES: CityLocation[] = [
  { id: 'makkah', name: 'مكة المكرمة', country: 'السعودية', latitude: 21.4225, longitude: 39.8262, timezone: 3 },
  { id: 'madinah', name: 'المدينة المنورة', country: 'السعودية', latitude: 24.4672, longitude: 39.6111, timezone: 3 },
  { id: 'riyadh', name: 'الرياض', country: 'السعودية', latitude: 24.7136, longitude: 46.6753, timezone: 3 },
  { id: 'jeddah', name: 'جدة', country: 'السعودية', latitude: 21.5433, longitude: 39.1728, timezone: 3 },
  { id: 'cairo', name: 'القاهرة', country: 'مصر', latitude: 30.0444, longitude: 31.2357, timezone: 2 },
  { id: 'alexandria', name: 'الإسكندرية', country: 'مصر', latitude: 31.2001, longitude: 29.9187, timezone: 2 },
  { id: 'jerusalem', name: 'القدس الشريف', country: 'فلسطين', latitude: 31.7683, longitude: 35.2137, timezone: 3 },
  { id: 'amman', name: 'عمّان', country: 'الأردن', latitude: 31.9539, longitude: 35.9106, timezone: 3 },
  { id: 'damascus', name: 'دمشق', country: 'سوريا', latitude: 33.5138, longitude: 36.2765, timezone: 3 },
  { id: 'baghdad', name: 'بغداد', country: 'العراق', latitude: 33.3152, longitude: 44.3661, timezone: 3 },
  { id: 'kuwait', name: 'مدينة الكويت', country: 'الكويت', latitude: 29.3759, longitude: 47.9774, timezone: 3 },
  { id: 'doha', name: 'الدوحة', country: 'قطر', latitude: 25.2854, longitude: 51.5310, timezone: 3 },
  { id: 'dubai', name: 'دبي', country: 'الإمارات', latitude: 25.2048, longitude: 55.2708, timezone: 4 },
  { id: 'abudhabi', name: 'أبوظبي', country: 'الإمارات', latitude: 24.4539, longitude: 54.3773, timezone: 4 },
  { id: 'muscat', name: 'مسقط', country: 'عُمان', latitude: 23.5880, longitude: 58.3829, timezone: 4 },
  { id: 'manama', name: 'المنامة', country: 'البحرين', latitude: 26.2285, longitude: 50.5860, timezone: 3 },
  { id: 'beirut', name: 'بيروت', country: 'لبنان', latitude: 33.8938, longitude: 35.5018, timezone: 3 },
  { id: 'tunis', name: 'تونس', country: 'تونس', latitude: 36.8065, longitude: 10.1815, timezone: 1 },
  { id: 'algiers', name: 'الجزائر', country: 'الجزائر', latitude: 36.7538, longitude: 3.0588, timezone: 1 },
  { id: 'rabat', name: 'الرباط', country: 'المغرب', latitude: 34.0209, longitude: -6.8416, timezone: 1 },
  { id: 'khartoum', name: 'الخرطوم', country: 'السودان', latitude: 15.5007, longitude: 32.5599, timezone: 2 },
  { id: 'tripoli', name: 'طرابلس', country: 'ليبيا', latitude: 32.8872, longitude: 13.1913, timezone: 2 },
  { id: 'istanbul', name: 'إسطنبول', country: 'تركيا', latitude: 41.0082, longitude: 28.9784, timezone: 3 },
  { id: 'london', name: 'لندن', country: 'بريطانيا', latitude: 51.5074, longitude: -0.1278, timezone: 0 },
  { id: 'paris', name: 'باريس', country: 'فرنسا', latitude: 48.8566, longitude: 2.3522, timezone: 1 },
  { id: 'newyork', name: 'نيويورك', country: 'أمريكا', latitude: 40.7128, longitude: -74.0060, timezone: -5 },
];

export interface PrayerTimesResult {
  fajr: string;
  sunrise: string;
  dhuhr: string;
  asr: string;
  maghrib: string;
  isha: string;
  fajrDate: Date;
  sunriseDate: Date;
  dhuhrDate: Date;
  asrDate: Date;
  maghribDate: Date;
  ishaDate: Date;
  nextPrayer: {
    id: 'fajr' | 'sunrise' | 'dhuhr' | 'asr' | 'maghrib' | 'isha';
    arabicName: string;
    time: string;
    remainingMs: number;
    remainingFormatted: string;
  };
}

const rad = (d: number) => (d * Math.PI) / 180;
const deg = (r: number) => (r * 180) / Math.PI;

function getDayOfYear(date: Date): number {
  const start = new Date(date.getFullYear(), 0, 0);
  const diff = date.getTime() - start.getTime();
  const oneDay = 1000 * 60 * 60 * 24;
  return Math.floor(diff / oneDay);
}

function formatHours(hours: number): string {
  let h = Math.floor(hours) % 24;
  if (h < 0) h += 24;
  const m = Math.floor((hours - Math.floor(hours)) * 60);
  return `${String(h).padStart(2, '0')}:${String(m).padStart(2, '0')}`;
}

function hoursToDate(date: Date, hours: number): Date {
  const d = new Date(date);
  let h = Math.floor(hours) % 24;
  if (h < 0) h += 24;
  const m = Math.floor((hours - Math.floor(hours)) * 60);
  const s = Math.floor((((hours - Math.floor(hours)) * 60) - m) * 60);
  d.setHours(h, m, s, 0);
  return d;
}

/**
 * Calculates prayer times for a given date, coordinates and timezone.
 */
export function calculatePrayerTimes(
  date: Date = new Date(),
  latitude: number = 21.4225,
  longitude: number = 39.8262,
  timezoneOffsetHours?: number
): PrayerTimesResult {
  const tz = timezoneOffsetHours !== undefined ? timezoneOffsetHours : -date.getTimezoneOffset() / 60;
  const D = getDayOfYear(date);

  // Fractional year in radians
  const gamma = (2 * Math.PI / 365) * (D - 1 + 0.5);

  // Solar declination (radians)
  const decl =
    0.006918 -
    0.399912 * Math.cos(gamma) +
    0.070257 * Math.sin(gamma) -
    0.006758 * Math.cos(2 * gamma) +
    0.000907 * Math.sin(2 * gamma) -
    0.002697 * Math.cos(3 * gamma) +
    0.00148 * Math.sin(3 * gamma);

  // Equation of time (minutes)
  const eqtime =
    229.18 *
    (0.000075 +
      0.001868 * Math.cos(gamma) -
      0.032077 * Math.sin(gamma) -
      0.014615 * Math.cos(2 * gamma) -
      0.040849 * Math.sin(2 * gamma));

  // Solar noon in hours (Dhuhr)
  const noon = 12 + tz - longitude / 15 - eqtime / 60;

  const latRad = rad(latitude);

  // Hour angle for a given sun angle
  const getHourAngle = (angleDeg: number): number => {
    const cosHA = (Math.sin(rad(angleDeg)) - Math.sin(latRad) * Math.sin(decl)) / (Math.cos(latRad) * Math.cos(decl));
    if (cosHA > 1) return 0;
    if (cosHA < -1) return 180;
    return deg(Math.acos(cosHA));
  };

  // Sunrise & Sunset (angle = -0.833 degrees for atmospheric refraction)
  const haSun = getHourAngle(-0.833) / 15;
  const sunriseHours = noon - haSun;
  const sunsetHours = noon + haSun;

  // Fajr: -18.5 degrees (Umm Al-Qura / Standard Islamic)
  const haFajr = getHourAngle(-18.5) / 15;
  const fajrHours = noon - haFajr;

  // Isha: -17.5 degrees or sunset + 1.5h
  const haIsha = getHourAngle(-17.5) / 15;
  const ishaHours = noon + haIsha;

  // Asr (Shafi'i/Hanbali/Maliki standard: shadow length = object height + shadow at noon)
  const noonAltitude = Math.PI / 2 - Math.abs(latRad - decl);
  const asrAltitude = Math.atan(1 / (1 + Math.tan(Math.PI / 2 - noonAltitude)));
  const haAsr = deg(Math.acos((Math.sin(asrAltitude) - Math.sin(latRad) * Math.sin(decl)) / (Math.cos(latRad) * Math.cos(decl)))) / 15;
  const asrHours = noon + haAsr;

  // Maghrib = sunset + small buffer (approx 2 mins)
  const maghribHours = sunsetHours + (2 / 60);

  const fajrDate = hoursToDate(date, fajrHours);
  const sunriseDate = hoursToDate(date, sunriseHours);
  const dhuhrDate = hoursToDate(date, noon);
  const asrDate = hoursToDate(date, asrHours);
  const maghribDate = hoursToDate(date, maghribHours);
  const ishaDate = hoursToDate(date, ishaHours);

  // Determine next prayer
  const now = date.getTime();
  const prayerList: { id: 'fajr' | 'sunrise' | 'dhuhr' | 'asr' | 'maghrib' | 'isha'; arabicName: string; date: Date }[] = [
    { id: 'fajr', arabicName: 'الفجر', date: fajrDate },
    { id: 'sunrise', arabicName: 'الشروق', date: sunriseDate },
    { id: 'dhuhr', arabicName: 'الظهر', date: dhuhrDate },
    { id: 'asr', arabicName: 'العصر', date: asrDate },
    { id: 'maghrib', arabicName: 'المغرب', date: maghribDate },
    { id: 'isha', arabicName: 'العشاء', date: ishaDate },
  ];

  let nextP = prayerList.find((p) => p.date.getTime() > now);
  let nextDate = nextP ? nextP.date : new Date(fajrDate.getTime() + 24 * 60 * 60 * 1000);
  let nextId = nextP ? nextP.id : 'fajr';
  let nextArabic = nextP ? nextP.arabicName : 'الفجر (الغد)';

  const remainingMs = Math.max(0, nextDate.getTime() - now);
  const remainingHours = Math.floor(remainingMs / (1000 * 60 * 60));
  const remainingMins = Math.floor((remainingMs % (1000 * 60 * 60)) / (1000 * 60));
  const remainingFormatted = `${remainingHours > 0 ? `${remainingHours} ساعة و ` : ''}${remainingMins} دقيقة`;

  return {
    fajr: formatHours(fajrHours),
    sunrise: formatHours(sunriseHours),
    dhuhr: formatHours(noon),
    asr: formatHours(asrHours),
    maghrib: formatHours(maghribHours),
    isha: formatHours(ishaHours),
    fajrDate,
    sunriseDate,
    dhuhrDate,
    asrDate,
    maghribDate,
    ishaDate,
    nextPrayer: {
      id: nextId,
      arabicName: nextArabic,
      time: formatHours(nextDate.getHours() + nextDate.getMinutes() / 60),
      remainingMs,
      remainingFormatted,
    },
  };
}
