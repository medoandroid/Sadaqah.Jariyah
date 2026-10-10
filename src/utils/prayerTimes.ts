/**
 * High-precision astronomical Islamic Prayer Times Calculator & Real API Client
 * - Integrates with Aladhan Professional Prayer Times API
 * - Features offline astronomical fallback (works 100% without internet)
 * - Formats times strictly in 12-hour format with (ص / م)
 * - Supports Egyptian General Authority of Survey & global calculation methods
 */

export interface CityLocation {
  id: string;
  name: string;
  country: string;
  latitude: number;
  longitude: number;
  timezone: number; // UTC offset in hours
  apiCity?: string;
  apiCountry?: string;
}

export interface CalculationMethod {
  id: number;
  name: string;
  fajrAngle: number;
  ishaAngle: number;
}

export const CALCULATION_METHODS: CalculationMethod[] = [
  { id: 5, name: 'الهيئة المصرية العامة للمساحة (مصر)', fajrAngle: 19.5, ishaAngle: 17.5 },
  { id: 4, name: 'جامعة أم القرى بمكة المكرمة (السعودية والخليج)', fajrAngle: 18.5, ishaAngle: 17.5 },
  { id: 3, name: 'رابطة العالم الإسلامي', fajrAngle: 18.0, ishaAngle: 17.0 },
  { id: 2, name: 'الجمعية الإسلامية لأمريكا الشمالية (ISNA)', fajrAngle: 15.0, ishaAngle: 15.0 },
  { id: 1, name: 'جامعة العلوم الإسلامية بكراتشي', fajrAngle: 18.0, ishaAngle: 18.0 },
];

export const POPULAR_CITIES: CityLocation[] = [
  // مصر الحبيبة
  { id: 'cairo', name: 'القاهرة', country: 'مصر', latitude: 30.0444, longitude: 31.2357, timezone: 2, apiCity: 'Cairo', apiCountry: 'Egypt' },
  { id: 'alexandria', name: 'الإسكندرية', country: 'مصر', latitude: 31.2001, longitude: 29.9187, timezone: 2, apiCity: 'Alexandria', apiCountry: 'Egypt' },
  { id: 'giza', name: 'الجيزة', country: 'مصر', latitude: 30.0131, longitude: 31.2089, timezone: 2, apiCity: 'Giza', apiCountry: 'Egypt' },
  { id: 'mansoura', name: 'المنصورة (الدقهلية)', country: 'مصر', latitude: 31.0409, longitude: 31.3785, timezone: 2, apiCity: 'Mansoura', apiCountry: 'Egypt' },
  { id: 'tanta', name: 'طنطا (الغربية)', country: 'مصر', latitude: 30.7865, longitude: 31.0004, timezone: 2, apiCity: 'Tanta', apiCountry: 'Egypt' },
  { id: 'zagazig', name: 'الزقازيق (الشرقية)', country: 'مصر', latitude: 30.5877, longitude: 31.5020, timezone: 2, apiCity: 'Zagazig', apiCountry: 'Egypt' },
  { id: 'ismailia', name: 'الإسماعيلية', country: 'مصر', latitude: 30.6043, longitude: 32.2723, timezone: 2, apiCity: 'Ismailia', apiCountry: 'Egypt' },
  { id: 'portsaid', name: 'بورسعيد', country: 'مصر', latitude: 31.2653, longitude: 32.3019, timezone: 2, apiCity: 'Port Said', apiCountry: 'Egypt' },
  { id: 'suez', name: 'السويس', country: 'مصر', latitude: 29.9668, longitude: 32.5498, timezone: 2, apiCity: 'Suez', apiCountry: 'Egypt' },
  { id: 'fayoum', name: 'الفيوم', country: 'مصر', latitude: 29.3084, longitude: 30.8428, timezone: 2, apiCity: 'Faiyum', apiCountry: 'Egypt' },
  { id: 'benisuef', name: 'بني سويف', country: 'مصر', latitude: 29.0661, longitude: 31.0994, timezone: 2, apiCity: 'Beni Suef', apiCountry: 'Egypt' },
  { id: 'assiut', name: 'أسيوط', country: 'مصر', latitude: 27.1809, longitude: 31.1837, timezone: 2, apiCity: 'Asyut', apiCountry: 'Egypt' },
  { id: 'sohag', name: 'سوهاج', country: 'مصر', latitude: 26.5569, longitude: 31.6948, timezone: 2, apiCity: 'Sohag', apiCountry: 'Egypt' },
  { id: 'qena', name: 'قنا', country: 'مصر', latitude: 26.1551, longitude: 32.7160, timezone: 2, apiCity: 'Qena', apiCountry: 'Egypt' },
  { id: 'luxor', name: 'الأقصر', country: 'مصر', latitude: 25.6872, longitude: 32.6396, timezone: 2, apiCity: 'Luxor', apiCountry: 'Egypt' },
  { id: 'aswan', name: 'أسوان', country: 'مصر', latitude: 24.0889, longitude: 32.8998, timezone: 2, apiCity: 'Aswan', apiCountry: 'Egypt' },

  // العالم العربي والإسلامي
  { id: 'makkah', name: 'مكة المكرمة', country: 'السعودية', latitude: 21.4225, longitude: 39.8262, timezone: 3, apiCity: 'Mecca', apiCountry: 'Saudi Arabia' },
  { id: 'madinah', name: 'المدينة المنورة', country: 'السعودية', latitude: 24.4672, longitude: 39.6111, timezone: 3, apiCity: 'Medina', apiCountry: 'Saudi Arabia' },
  { id: 'riyadh', name: 'الرياض', country: 'السعودية', latitude: 24.7136, longitude: 46.6753, timezone: 3, apiCity: 'Riyadh', apiCountry: 'Saudi Arabia' },
  { id: 'jeddah', name: 'جدة', country: 'السعودية', latitude: 21.5433, longitude: 39.1728, timezone: 3, apiCity: 'Jeddah', apiCountry: 'Saudi Arabia' },
  { id: 'jerusalem', name: 'القدس الشريف', country: 'فلسطين', latitude: 31.7683, longitude: 35.2137, timezone: 3, apiCity: 'Jerusalem', apiCountry: 'Palestine' },
  { id: 'gaza', name: 'غزة العزة', country: 'فلسطين', latitude: 31.5017, longitude: 34.4668, timezone: 3, apiCity: 'Gaza', apiCountry: 'Palestine' },
  { id: 'amman', name: 'عمّان', country: 'الأردن', latitude: 31.9539, longitude: 35.9106, timezone: 3, apiCity: 'Amman', apiCountry: 'Jordan' },
  { id: 'damascus', name: 'دمشق', country: 'سوريا', latitude: 33.5138, longitude: 36.2765, timezone: 3, apiCity: 'Damascus', apiCountry: 'Syria' },
  { id: 'baghdad', name: 'بغداد', country: 'العراق', latitude: 33.3152, longitude: 44.3661, timezone: 3, apiCity: 'Baghdad', apiCountry: 'Iraq' },
  { id: 'kuwait', name: 'مدينة الكويت', country: 'الكويت', latitude: 29.3759, longitude: 47.9774, timezone: 3, apiCity: 'Kuwait City', apiCountry: 'Kuwait' },
  { id: 'doha', name: 'الدوحة', country: 'قطر', latitude: 25.2854, longitude: 51.5310, timezone: 3, apiCity: 'Doha', apiCountry: 'Qatar' },
  { id: 'dubai', name: 'دبي', country: 'الإمارات', latitude: 25.2048, longitude: 55.2708, timezone: 4, apiCity: 'Dubai', apiCountry: 'United Arab Emirates' },
  { id: 'abudhabi', name: 'أبوظبي', country: 'الإمارات', latitude: 24.4539, longitude: 54.3773, timezone: 4, apiCity: 'Abu Dhabi', apiCountry: 'United Arab Emirates' },
  { id: 'muscat', name: 'مسقط', country: 'عُمان', latitude: 23.5880, longitude: 58.3829, timezone: 4, apiCity: 'Muscat', apiCountry: 'Oman' },
  { id: 'manama', name: 'المنامة', country: 'البحرين', latitude: 26.2285, longitude: 50.5860, timezone: 3, apiCity: 'Manama', apiCountry: 'Bahrain' },
  { id: 'beirut', name: 'بيروت', country: 'لبنان', latitude: 33.8938, longitude: 35.5018, timezone: 3, apiCity: 'Beirut', apiCountry: 'Lebanon' },
  { id: 'tunis', name: 'تونس', country: 'تونس', latitude: 36.8065, longitude: 10.1815, timezone: 1, apiCity: 'Tunis', apiCountry: 'Tunisia' },
  { id: 'algiers', name: 'الجزائر', country: 'الجزائر', latitude: 36.7538, longitude: 3.0588, timezone: 1, apiCity: 'Algiers', apiCountry: 'Algeria' },
  { id: 'rabat', name: 'الرباط', country: 'المغرب', latitude: 34.0209, longitude: -6.8416, timezone: 1, apiCity: 'Rabat', apiCountry: 'Morocco' },
  { id: 'khartoum', name: 'الخرطوم', country: 'السودان', latitude: 15.5007, longitude: 32.5599, timezone: 2, apiCity: 'Khartoum', apiCountry: 'Sudan' },
  { id: 'tripoli', name: 'طرابلس', country: 'ليبيا', latitude: 32.8872, longitude: 13.1913, timezone: 2, apiCity: 'Tripoli', apiCountry: 'Libya' },
  { id: 'istanbul', name: 'إسطنبول', country: 'تركيا', latitude: 41.0082, longitude: 28.9784, timezone: 3, apiCity: 'Istanbul', apiCountry: 'Turkey' },
  { id: 'london', name: 'لندن', country: 'بريطانيا', latitude: 51.5074, longitude: -0.1278, timezone: 0, apiCity: 'London', apiCountry: 'United Kingdom' },
  { id: 'paris', name: 'باريس', country: 'فرنسا', latitude: 48.8566, longitude: 2.3522, timezone: 1, apiCity: 'Paris', apiCountry: 'France' },
  { id: 'newyork', name: 'نيويورك', country: 'أمريكا', latitude: 40.7128, longitude: -74.0060, timezone: -5, apiCity: 'New York', apiCountry: 'United States' },
];

export interface PrayerTimesResult {
  // 12-hour formatted strings (e.g. "04:35 ص", "01:15 م")
  fajr: string;
  sunrise: string;
  dhuhr: string;
  asr: string;
  maghrib: string;
  isha: string;

  // Raw 24-hour formatted strings (for internal comparisons)
  fajr24: string;
  sunrise24: string;
  dhuhr24: string;
  asr24: string;
  maghrib24: string;
  isha24: string;

  fajrDate: Date;
  sunriseDate: Date;
  dhuhrDate: Date;
  asrDate: Date;
  maghribDate: Date;
  ishaDate: Date;
  nextPrayer: {
    id: 'fajr' | 'sunrise' | 'dhuhr' | 'asr' | 'maghrib' | 'isha';
    arabicName: string;
    time: string; // 12-hour formatted time (e.g. "03:45 م")
    time24: string;
    remainingMs: number;
    remainingFormatted: string;
  };
  source: 'api' | 'astronomical';
}

const rad = (d: number) => (d * Math.PI) / 180;
const deg = (r: number) => (r * 180) / Math.PI;

function getDayOfYear(date: Date): number {
  const start = new Date(date.getFullYear(), 0, 0);
  const diff = date.getTime() - start.getTime();
  const oneDay = 1000 * 60 * 60 * 24;
  return Math.floor(diff / oneDay);
}

/**
 * Strictly formats time into 12-hour system with Arabic period (ص / م)
 * Example: 15.75 or "15:45" -> "03:45 م"
 * Example: 4.5 or "04:30" -> "04:30 ص"
 */
export function formatTo12Hour(hoursOrStr: number | string): string {
  let h = 0;
  let m = 0;

  if (typeof hoursOrStr === 'string') {
    // Strip any trailing non-digit or timezone (e.g. "04:35 (EEST)")
    const clean = hoursOrStr.replace(/[^0-9:]/g, '');
    const parts = clean.split(':');
    h = parseInt(parts[0], 10) || 0;
    m = parseInt(parts[1], 10) || 0;
  } else {
    h = Math.floor(hoursOrStr) % 24;
    if (h < 0) h += 24;
    m = Math.floor((hoursOrStr - Math.floor(hoursOrStr)) * 60);
  }

  const period = h >= 12 ? 'م' : 'ص';
  let h12 = h % 12;
  if (h12 === 0) h12 = 12;

  return `${String(h12).padStart(2, '0')}:${String(m).padStart(2, '0')} ${period}`;
}

export function formatTo24Hour(hours: number): string {
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
  const s = Math.floor(((hours - Math.floor(hours)) * 60 - m) * 60);
  d.setHours(h, m, s, 0);
  return d;
}

/**
 * High-precision astronomical calculation (fallback and instant offline computation)
 */
export function calculatePrayerTimes(
  date: Date = new Date(),
  latitude: number = 30.0444, // Default: Cairo, Egypt
  longitude: number = 31.2357,
  timezoneOffsetHours?: number,
  methodId: number = 5 // Default: Egyptian General Authority of Survey
): PrayerTimesResult {
  const tz = timezoneOffsetHours !== undefined ? timezoneOffsetHours : -date.getTimezoneOffset() / 60;
  const D = getDayOfYear(date);

  // Solar declination & equation of time
  const gamma = ((2 * Math.PI) / 365) * (D - 1 + 0.5);
  const decl =
    0.006918 -
    0.399912 * Math.cos(gamma) +
    0.070257 * Math.sin(gamma) -
    0.006758 * Math.cos(2 * gamma) +
    0.000907 * Math.sin(2 * gamma) -
    0.002697 * Math.cos(3 * gamma) +
    0.00148 * Math.sin(3 * gamma);

  const eqtime =
    229.18 *
    (0.000075 +
      0.001868 * Math.cos(gamma) -
      0.032077 * Math.sin(gamma) -
      0.014615 * Math.cos(2 * gamma) -
      0.040849 * Math.sin(2 * gamma));

  const noon = 12 + tz - longitude / 15 - eqtime / 60;
  const latRad = rad(latitude);

  const getHourAngle = (angleDeg: number): number => {
    const cosHA = (Math.sin(rad(angleDeg)) - Math.sin(latRad) * Math.sin(decl)) / (Math.cos(latRad) * Math.cos(decl));
    if (cosHA > 1) return 0;
    if (cosHA < -1) return 180;
    return deg(Math.acos(cosHA));
  };

  const selectedMethod = CALCULATION_METHODS.find((m) => m.id === methodId) || CALCULATION_METHODS[0];

  const haSun = getHourAngle(-0.833) / 15;
  const sunriseHours = noon - haSun;
  const sunsetHours = noon + haSun;

  // Fajr based on method
  const haFajr = getHourAngle(-selectedMethod.fajrAngle) / 15;
  const fajrHours = noon - haFajr;

  // Isha based on method
  const haIsha = getHourAngle(-selectedMethod.ishaAngle) / 15;
  const ishaHours = noon + haIsha;

  // Asr (Shafi'i/Hanbali/Maliki standard)
  const noonAltitude = Math.PI / 2 - Math.abs(latRad - decl);
  const asrAltitude = Math.atan(1 / (1 + Math.tan(Math.PI / 2 - noonAltitude)));
  const haAsr = deg(Math.acos((Math.sin(asrAltitude) - Math.sin(latRad) * Math.sin(decl)) / (Math.cos(latRad) * Math.cos(decl)))) / 15;
  const asrHours = noon + haAsr;

  // Maghrib = sunset + small buffer
  const maghribHours = sunsetHours + 2 / 60;

  const fajrDate = hoursToDate(date, fajrHours);
  const sunriseDate = hoursToDate(date, sunriseHours);
  const dhuhrDate = hoursToDate(date, noon);
  const asrDate = hoursToDate(date, asrHours);
  const maghribDate = hoursToDate(date, maghribHours);
  const ishaDate = hoursToDate(date, ishaHours);

  // Determine next prayer
  const now = date.getTime();
  const prayerList: { id: 'fajr' | 'sunrise' | 'dhuhr' | 'asr' | 'maghrib' | 'isha'; arabicName: string; date: Date; hours: number }[] = [
    { id: 'fajr', arabicName: 'الفجر', date: fajrDate, hours: fajrHours },
    { id: 'sunrise', arabicName: 'الشروق', date: sunriseDate, hours: sunriseHours },
    { id: 'dhuhr', arabicName: 'الظهر', date: dhuhrDate, hours: noon },
    { id: 'asr', arabicName: 'العصر', date: asrDate, hours: asrHours },
    { id: 'maghrib', arabicName: 'المغرب', date: maghribDate, hours: maghribHours },
    { id: 'isha', arabicName: 'العشاء', date: ishaDate, hours: ishaHours },
  ];

  let nextP = prayerList.find((p) => p.date.getTime() > now);
  let nextDate = nextP ? nextP.date : new Date(fajrDate.getTime() + 24 * 60 * 60 * 1000);
  let nextId = nextP ? nextP.id : 'fajr';
  let nextArabic = nextP ? nextP.arabicName : 'الفجر (الغد)';
  let nextHours = nextP ? nextP.hours : fajrHours;

  const remainingMs = Math.max(0, nextDate.getTime() - now);
  const remainingHours = Math.floor(remainingMs / (1000 * 60 * 60));
  const remainingMins = Math.floor((remainingMs % (1000 * 60 * 60)) / (1000 * 60));
  const remainingFormatted = `${remainingHours > 0 ? `${remainingHours} س و ` : ''}${remainingMins} دقيقة`;

  return {
    fajr: formatTo12Hour(fajrHours),
    sunrise: formatTo12Hour(sunriseHours),
    dhuhr: formatTo12Hour(noon),
    asr: formatTo12Hour(asrHours),
    maghrib: formatTo12Hour(maghribHours),
    isha: formatTo12Hour(ishaHours),

    fajr24: formatTo24Hour(fajrHours),
    sunrise24: formatTo24Hour(sunriseHours),
    dhuhr24: formatTo24Hour(noon),
    asr24: formatTo24Hour(asrHours),
    maghrib24: formatTo24Hour(maghribHours),
    isha24: formatTo24Hour(ishaHours),

    fajrDate,
    sunriseDate,
    dhuhrDate,
    asrDate,
    maghribDate,
    ishaDate,

    nextPrayer: {
      id: nextId,
      arabicName: nextArabic,
      time: formatTo12Hour(nextHours),
      time24: formatTo24Hour(nextHours),
      remainingMs,
      remainingFormatted,
    },
    source: 'astronomical',
  };
}

/**
 * Fetches real prayer times from Aladhan API with high reliability,
 * caching in localStorage, and falling back gracefully to astronomical calculation.
 */
export async function fetchRealPrayerTimes(
  city: CityLocation,
  methodId: number = 5,
  date: Date = new Date()
): Promise<PrayerTimesResult> {
  const dateStr = `${date.getDate()}-${date.getMonth() + 1}-${date.getFullYear()}`;
  const cacheKey = `prayer_api_${city.id}_${methodId}_${dateStr}`;

  // 1. Check local cache first
  try {
    const cached = localStorage.getItem(cacheKey);
    if (cached) {
      const parsed = JSON.parse(cached);
      if (parsed && parsed.fajr) {
        return {
          ...parsed,
          source: 'api',
        };
      }
    }
  } catch (e) {}

  // 2. Query Aladhan API
  try {
    let url = '';
    if (city.apiCity && city.apiCountry) {
      url = `https://api.aladhan.com/v1/timingsByCity?city=${encodeURIComponent(city.apiCity)}&country=${encodeURIComponent(city.apiCountry)}&method=${methodId}`;
    } else {
      url = `https://api.aladhan.com/v1/timings?latitude=${city.latitude}&longitude=${city.longitude}&method=${methodId}`;
    }

    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 4000);

    const res = await fetch(url, { signal: controller.signal });
    clearTimeout(timeoutId);

    if (res.ok) {
      const json = await res.json();
      if (json && json.data && json.data.timings) {
        const timings = json.data.timings;

        const parseApiTimeToDate = (timeStr: string) => {
          const clean = timeStr.replace(/[^0-9:]/g, '');
          const [hStr, mStr] = clean.split(':');
          const d = new Date(date);
          d.setHours(parseInt(hStr, 10), parseInt(mStr, 10), 0, 0);
          return d;
        };

        const fajrDate = parseApiTimeToDate(timings.Fajr);
        const sunriseDate = parseApiTimeToDate(timings.Sunrise);
        const dhuhrDate = parseApiTimeToDate(timings.Dhuhr);
        const asrDate = parseApiTimeToDate(timings.Asr);
        const maghribDate = parseApiTimeToDate(timings.Maghrib);
        const ishaDate = parseApiTimeToDate(timings.Isha);

        const now = date.getTime();
        const prayerList: { id: 'fajr' | 'sunrise' | 'dhuhr' | 'asr' | 'maghrib' | 'isha'; arabicName: string; date: Date; timeStr: string }[] = [
          { id: 'fajr', arabicName: 'الفجر', date: fajrDate, timeStr: timings.Fajr },
          { id: 'sunrise', arabicName: 'الشروق', date: sunriseDate, timeStr: timings.Sunrise },
          { id: 'dhuhr', arabicName: 'الظهر', date: dhuhrDate, timeStr: timings.Dhuhr },
          { id: 'asr', arabicName: 'العصر', date: asrDate, timeStr: timings.Asr },
          { id: 'maghrib', arabicName: 'المغرب', date: maghribDate, timeStr: timings.Maghrib },
          { id: 'isha', arabicName: 'العشاء', date: ishaDate, timeStr: timings.Isha },
        ];

        let nextP = prayerList.find((p) => p.date.getTime() > now);
        let nextDate = nextP ? nextP.date : new Date(fajrDate.getTime() + 24 * 60 * 60 * 1000);
        let nextId = nextP ? nextP.id : 'fajr';
        let nextArabic = nextP ? nextP.arabicName : 'الفجر (الغد)';
        let nextTimeStr = nextP ? nextP.timeStr : timings.Fajr;

        const remainingMs = Math.max(0, nextDate.getTime() - now);
        const remainingHours = Math.floor(remainingMs / (1000 * 60 * 60));
        const remainingMins = Math.floor((remainingMs % (1000 * 60 * 60)) / (1000 * 60));
        const remainingFormatted = `${remainingHours > 0 ? `${remainingHours} س و ` : ''}${remainingMins} دقيقة`;

        const result: PrayerTimesResult = {
          fajr: formatTo12Hour(timings.Fajr),
          sunrise: formatTo12Hour(timings.Sunrise),
          dhuhr: formatTo12Hour(timings.Dhuhr),
          asr: formatTo12Hour(timings.Asr),
          maghrib: formatTo12Hour(timings.Maghrib),
          isha: formatTo12Hour(timings.Isha),

          fajr24: timings.Fajr.slice(0, 5),
          sunrise24: timings.Sunrise.slice(0, 5),
          dhuhr24: timings.Dhuhr.slice(0, 5),
          asr24: timings.Asr.slice(0, 5),
          maghrib24: timings.Maghrib.slice(0, 5),
          isha24: timings.Isha.slice(0, 5),

          fajrDate,
          sunriseDate,
          dhuhrDate,
          asrDate,
          maghribDate,
          ishaDate,

          nextPrayer: {
            id: nextId,
            arabicName: nextArabic,
            time: formatTo12Hour(nextTimeStr),
            time24: nextTimeStr.slice(0, 5),
            remainingMs,
            remainingFormatted,
          },
          source: 'api',
        };

        // Cache result
        try {
          localStorage.setItem(cacheKey, JSON.stringify(result));
        } catch (e) {}

        return result;
      }
    }
  } catch (err) {
    // API request failed or timed out, fallback directly to local calculator
  }

  // 3. Fallback to local astronomical engine
  return calculatePrayerTimes(date, city.latitude, city.longitude, city.timezone, methodId);
}

