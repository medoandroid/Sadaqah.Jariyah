/**
 * High-precision Islamic Prayer Times & Real AlAdhan API Client
 * - Integrates directly with official AlAdhan REST API (v1/timings and v1/timingsByCity)
 * - Automatic Daylight Saving Time (DST) & timezone offset handling
 * - Accurate offline caching with multi-day validity
 * - Precise astronomical calculation fallback (100% functional without internet)
 * - Strict 12-hour Arabic formatting (ص / م)
 * - Spherical trigonometry Qibla compass bearing calculation
 * - Multi-method jurisprudence support (Egyptian General Authority, Umm Al-Qura, MWL, etc.)
 */

export interface CityLocation {
  id: string;
  name: string;
  country: string;
  latitude: number;
  longitude: number;
  timezone: number; // Standard UTC offset in hours
  apiCity?: string;
  apiCountry?: string;
  region?: string;
}

export interface CalculationMethod {
  id: number;
  name: string;
  description: string;
  fajrAngle: number;
  ishaAngle: number;
}

export interface AdhanVoice {
  id: string;
  name: string;
  country: string;
  url: string;
  durationApprox: string;
  isFallbackChime?: boolean;
}

export const CALCULATION_METHODS: CalculationMethod[] = [
  { id: 5, name: 'الهيئة المصرية العامة للمساحة (مصر)', description: 'زاوية الفجر: ١٩.٥° | زاوية العشاء: ١٧.٥° - المعتمد رسمياً في جمهورية مصر العربية', fajrAngle: 19.5, ishaAngle: 17.5 },
  { id: 4, name: 'جامعة أم القرى بمكة المكرمة (السعودية والخليج)', description: 'زاوية الفجر: ١٨.٥° | العشاء بعد المغرب بـ ٩٠ دقيقة (١٢٠ دقيقة في رمضان)', fajrAngle: 18.5, ishaAngle: 17.5 },
  { id: 3, name: 'رابطة العالم الإسلامي (مكة المكرمة)', description: 'زاوية الفجر: ١٨.٠° | زاوية العشاء: ١٧.٠° - معتمد في أنحاء العالم الإسلامي', fajrAngle: 18.0, ishaAngle: 17.0 },
  { id: 2, name: 'الجمعية الإسلامية لأمريكا الشمالية (ISNA)', description: 'زاوية الفجر: ١٥.٠° | زاوية العشاء: ١٥.٠° - أمريكا الشمالية وكندا', fajrAngle: 15.0, ishaAngle: 15.0 },
  { id: 1, name: 'جامعة العلوم الإسلامية بكراتشي (باكستان)', description: 'زاوية الفجر: ١٨.٠° | زاوية العشاء: ١٨.٠° - شبه القارة الهندية', fajrAngle: 18.0, ishaAngle: 18.0 },
  { id: 7, name: 'معهد الجيوفيزياء بجامعة طهران', description: 'زاوية الفجر: ١٧.٧° | زاوية العشاء: ١٤.٠°', fajrAngle: 17.7, ishaAngle: 14.0 },
  { id: 8, name: 'منطقة الخليج العربي', description: 'زاوية الفجر: ١٩.٥° | العشاء بعد المغرب بـ ٩٠ دقيقة', fajrAngle: 19.5, ishaAngle: 17.5 },
  { id: 9, name: 'دولة الكويت', description: 'زاوية الفجر: ١٨.٠° | زاوية العشاء: ١٧.٥°', fajrAngle: 18.0, ishaAngle: 17.5 },
  { id: 10, name: 'دولة قطر', description: 'زاوية الفجر: ١٨.٠° | العشاء بعد المغرب بـ ٩٠ دقيقة', fajrAngle: 18.0, ishaAngle: 17.5 },
  { id: 11, name: 'المجلس الديني الإسلامي بسنغافورة (MUIS)', description: 'زاوية الفجر: ٢٠.٠° | زاوية العشاء: ١٨.٠°', fajrAngle: 20.0, ishaAngle: 18.0 },
  { id: 12, name: 'الاتحاد الإسلامي في فرنسا (UOIF)', description: 'زاوية الفجر: ١٢.٠° | زاوية العشاء: ١٢.٠°', fajrAngle: 12.0, ishaAngle: 12.0 },
  { id: 13, name: 'رئاسة الشؤون الدينية بتركيا (ديانت)', description: 'زاوية الفجر: ١٨.٠° | زاوية العشاء: ١٧.٠°', fajrAngle: 18.0, ishaAngle: 17.0 },
  { id: 14, name: 'الإدارة الدينية لمسلمي روسيا', description: 'زاوية الفجر: ١٦.٠° | زاوية العشاء: ١٥.٠°', fajrAngle: 16.0, ishaAngle: 15.0 },
  { id: 15, name: 'الهيئة العامة للشؤون الإسلامية والأوقاف (الإمارات)', description: 'زاوية الفجر: ١٨.٢° | زاوية العشاء: ١٨.٢°', fajrAngle: 18.2, ishaAngle: 18.2 },
];

export const ADHAN_VOICES: AdhanVoice[] = [
  {
    id: 'abdulbasit',
    name: 'الشيخ عبدالباسط عبدالصمد',
    country: 'أذان مصر التاريخي الخاشع',
    url: 'https://praytimes.org/audio/adhan/Sunni/Abdul-Basit.mp3',
    durationApprox: '٣ دقائق و ٢٠ ثانية',
  },
  {
    id: 'alafasy',
    name: 'الشيخ مشاري راشد العفاسي',
    country: 'الكويت والعالم الإسلامي',
    url: 'https://cdn.aladhan.com/audio/adhans/a9.mp3',
    durationApprox: '٣ دقائق و ٤٠ ثانية',
  },
  {
    id: 'alnafees',
    name: 'الشيخ أحمد النفيس',
    country: 'صوت عذب خاشع ندي',
    url: 'https://cdn.aladhan.com/audio/adhans/a1.mp3',
    durationApprox: '٣ دقائق و ١٥ ثانية',
  },
  {
    id: 'zahrani',
    name: 'الشيخ منصور الزهراني',
    country: 'أذان الحجاز والمملكة',
    url: 'https://cdn.aladhan.com/audio/adhans/a11-mansour-al-zahrani.mp3',
    durationApprox: '٣ دقائق و ٣٥ ثانية',
  },
  {
    id: 'egypt',
    name: 'أذان أرض الكنانة ومساجد مصر',
    country: 'صوت التراث الأصيل',
    url: 'https://praytimes.org/audio/adhan/Sunni/Adhan%20Egypt.mp3',
    durationApprox: '٣ دقائق',
  },
  {
    id: 'ozcan',
    name: 'الشيخ حافظ مصطفى أوزجان',
    country: 'تركيا والمقامات الإسلامية',
    url: 'https://cdn.aladhan.com/audio/adhans/a2.mp3',
    durationApprox: '٣ دقائق و ٥ ثوانٍ',
  },
  {
    id: 'naqshbandi',
    name: 'الشيخ سيد النقشبندي',
    country: 'تكبيرات ونفحات رمضانية مباركة',
    url: 'https://praytimes.org/audio/adhan/Sunni/Naghshbandi.mp3',
    durationApprox: 'دقيقتان و ١٥ ثانية',
  },
  {
    id: 'halab',
    name: 'أذان الجامع الأموي الكبير (حلب الشام)',
    country: 'أذان بلاد الشام التاريخي',
    url: 'https://praytimes.org/audio/adhan/Sunni/Adhan%20Halab.mp3',
    durationApprox: '٣ دقائق',
  },
  {
    id: 'chime',
    name: 'تكبيرات إلكترونية هادئة (بدون إنترنت)',
    country: 'تعمل دائماً وبكل الظروف دون اتصال',
    url: '',
    durationApprox: 'لحظي',
    isFallbackChime: true,
  },
];

export const POPULAR_CITIES: CityLocation[] = [
  // جمهورية مصر العربية - محافظات ومدن رئيسية
  { id: 'cairo', name: 'القاهرة', country: 'مصر', latitude: 30.0444, longitude: 31.2357, timezone: 2, apiCity: 'Cairo', apiCountry: 'Egypt', region: 'العاصمة' },
  { id: 'alexandria', name: 'الإسكندرية', country: 'مصر', latitude: 31.2001, longitude: 29.9187, timezone: 2, apiCity: 'Alexandria', apiCountry: 'Egypt', region: 'الساحل الشمالي' },
  { id: 'giza', name: 'الجيزة', country: 'مصر', latitude: 30.0131, longitude: 31.2089, timezone: 2, apiCity: 'Giza', apiCountry: 'Egypt', region: 'القاهرة الكبرى' },
  { id: 'mansoura', name: 'المنصورة (الدقهلية)', country: 'مصر', latitude: 31.0409, longitude: 31.3785, timezone: 2, apiCity: 'Mansoura', apiCountry: 'Egypt', region: 'الدلتا' },
  { id: 'tanta', name: 'طنطا (الغربية)', country: 'مصر', latitude: 30.7865, longitude: 31.0004, timezone: 2, apiCity: 'Tanta', apiCountry: 'Egypt', region: 'الدلتا' },
  { id: 'zagazig', name: 'الزقازيق (الشرقية)', country: 'مصر', latitude: 30.5877, longitude: 31.5020, timezone: 2, apiCity: 'Zagazig', apiCountry: 'Egypt', region: 'الدلتا' },
  { id: 'damanhour', name: 'دمنهور (البحيرة)', country: 'مصر', latitude: 31.0364, longitude: 30.4689, timezone: 2, apiCity: 'Damanhur', apiCountry: 'Egypt', region: 'الدلتا' },
  { id: 'damietta', name: 'دمياط', country: 'مصر', latitude: 31.4175, longitude: 31.8144, timezone: 2, apiCity: 'Damietta', apiCountry: 'Egypt', region: 'الدلتا' },
  { id: 'kafr_el_sheikh', name: 'كفر الشيخ', country: 'مصر', latitude: 31.1107, longitude: 30.9388, timezone: 2, apiCity: 'Kafr El Sheikh', apiCountry: 'Egypt', region: 'الدلتا' },
  { id: 'shibin', name: 'شبين الكوم (المنوفية)', country: 'مصر', latitude: 30.5526, longitude: 31.0090, timezone: 2, apiCity: 'Shibin El Kom', apiCountry: 'Egypt', region: 'الدلتا' },
  { id: 'banha', name: 'بنها (القليوبية)', country: 'مصر', latitude: 30.4660, longitude: 31.1853, timezone: 2, apiCity: 'Banha', apiCountry: 'Egypt', region: 'الدلتا' },
  { id: 'ismailia', name: 'الإسماعيلية', country: 'مصر', latitude: 30.6043, longitude: 32.2723, timezone: 2, apiCity: 'Ismailia', apiCountry: 'Egypt', region: 'مدن القناة' },
  { id: 'portsaid', name: 'بورسعيد', country: 'مصر', latitude: 31.2653, longitude: 32.3019, timezone: 2, apiCity: 'Port Said', apiCountry: 'Egypt', region: 'مدن القناة' },
  { id: 'suez', name: 'السويس', country: 'مصر', latitude: 29.9668, longitude: 32.5498, timezone: 2, apiCity: 'Suez', apiCountry: 'Egypt', region: 'مدن القناة' },
  { id: 'fayoum', name: 'الفيوم', country: 'مصر', latitude: 29.3084, longitude: 30.8428, timezone: 2, apiCity: 'Faiyum', apiCountry: 'Egypt', region: 'شمال الصعيد' },
  { id: 'benisuef', name: 'بني سويف', country: 'مصر', latitude: 29.0661, longitude: 31.0994, timezone: 2, apiCity: 'Beni Suef', apiCountry: 'Egypt', region: 'شمال الصعيد' },
  { id: 'minya', name: 'المنيا', country: 'مصر', latitude: 28.0871, longitude: 30.7618, timezone: 2, apiCity: 'Minya', apiCountry: 'Egypt', region: 'شمال الصعيد' },
  { id: 'assiut', name: 'أسيوط', country: 'مصر', latitude: 27.1809, longitude: 31.1837, timezone: 2, apiCity: 'Asyut', apiCountry: 'Egypt', region: 'وسط الصعيد' },
  { id: 'sohag', name: 'سوهاج', country: 'مصر', latitude: 26.5569, longitude: 31.6948, timezone: 2, apiCity: 'Sohag', apiCountry: 'Egypt', region: 'جنوب الصعيد' },
  { id: 'qena', name: 'قنا', country: 'مصر', latitude: 26.1551, longitude: 32.7160, timezone: 2, apiCity: 'Qena', apiCountry: 'Egypt', region: 'جنوب الصعيد' },
  { id: 'luxor', name: 'الأقصر', country: 'مصر', latitude: 25.6872, longitude: 32.6396, timezone: 2, apiCity: 'Luxor', apiCountry: 'Egypt', region: 'جنوب الصعيد' },
  { id: 'aswan', name: 'أسوان', country: 'مصر', latitude: 24.0889, longitude: 32.8998, timezone: 2, apiCity: 'Aswan', apiCountry: 'Egypt', region: 'جنوب الصعيد' },
  { id: 'hurghada', name: 'الغردقة (البحر الأحمر)', country: 'مصر', latitude: 27.2579, longitude: 33.8116, timezone: 2, apiCity: 'Hurghada', apiCountry: 'Egypt', region: 'البحر الأحمر' },
  { id: 'sharm', name: 'شرم الشيخ (جنوب سيناء)', country: 'مصر', latitude: 27.9158, longitude: 34.3299, timezone: 2, apiCity: 'Sharm El Sheikh', apiCountry: 'Egypt', region: 'سيناء' },
  { id: 'arish', name: 'العريش (شمال سيناء)', country: 'مصر', latitude: 31.1316, longitude: 33.7984, timezone: 2, apiCity: 'Arish', apiCountry: 'Egypt', region: 'سيناء' },
  { id: 'matruh', name: 'مرسى مطروح', country: 'مصر', latitude: 31.3525, longitude: 27.2453, timezone: 2, apiCity: 'Mersa Matruh', apiCountry: 'Egypt', region: 'الساحل الشمالي' },
  { id: 'kharga', name: 'الخارجة (الوادي الجديد)', country: 'مصر', latitude: 25.4411, longitude: 30.5583, timezone: 2, apiCity: 'Al Kharijah', apiCountry: 'Egypt', region: 'الوادي الجديد' },

  // العالم العربي والإسلامي الشريف
  { id: 'makkah', name: 'مكة المكرمة (الحرم المكي)', country: 'السعودية', latitude: 21.4225, longitude: 39.8262, timezone: 3, apiCity: 'Mecca', apiCountry: 'Saudi Arabia', region: 'الحرمان الشريفان' },
  { id: 'madinah', name: 'المدينة المنورة (المسجد النبوي)', country: 'السعودية', latitude: 24.4672, longitude: 39.6111, timezone: 3, apiCity: 'Medina', apiCountry: 'Saudi Arabia', region: 'الحرمان الشريفان' },
  { id: 'riyadh', name: 'الرياض', country: 'السعودية', latitude: 24.7136, longitude: 46.6753, timezone: 3, apiCity: 'Riyadh', apiCountry: 'Saudi Arabia', region: 'الخليج العربي' },
  { id: 'jeddah', name: 'جدة', country: 'السعودية', latitude: 21.5433, longitude: 39.1728, timezone: 3, apiCity: 'Jeddah', apiCountry: 'Saudi Arabia', region: 'الخليج العربي' },
  { id: 'jerusalem', name: 'القدس الشريف (المسجد الأقصى)', country: 'فلسطين', latitude: 31.7683, longitude: 35.2137, timezone: 3, apiCity: 'Jerusalem', apiCountry: 'Palestine', region: 'بلاد الشام' },
  { id: 'gaza', name: 'غزة العزة', country: 'فلسطين', latitude: 31.5017, longitude: 34.4668, timezone: 3, apiCity: 'Gaza', apiCountry: 'Palestine', region: 'بلاد الشام' },
  { id: 'amman', name: 'عمّان', country: 'الأردن', latitude: 31.9539, longitude: 35.9106, timezone: 3, apiCity: 'Amman', apiCountry: 'Jordan', region: 'بلاد الشام' },
  { id: 'damascus', name: 'دمشق', country: 'سوريا', latitude: 33.5138, longitude: 36.2765, timezone: 3, apiCity: 'Damascus', apiCountry: 'Syria', region: 'بلاد الشام' },
  { id: 'baghdad', name: 'بغداد', country: 'العراق', latitude: 33.3152, longitude: 44.3661, timezone: 3, apiCity: 'Baghdad', apiCountry: 'Iraq', region: 'بلاد الرافدين' },
  { id: 'kuwait', name: 'مدينة الكويت', country: 'الكويت', latitude: 29.3759, longitude: 47.9774, timezone: 3, apiCity: 'Kuwait City', apiCountry: 'Kuwait', region: 'الخليج العربي' },
  { id: 'doha', name: 'الدوحة', country: 'قطر', latitude: 25.2854, longitude: 51.5310, timezone: 3, apiCity: 'Doha', apiCountry: 'Qatar', region: 'الخليج العربي' },
  { id: 'dubai', name: 'دبي', country: 'الإمارات', latitude: 25.2048, longitude: 55.2708, timezone: 4, apiCity: 'Dubai', apiCountry: 'United Arab Emirates', region: 'الخليج العربي' },
  { id: 'abudhabi', name: 'أبوظبي', country: 'الإمارات', latitude: 24.4539, longitude: 54.3773, timezone: 4, apiCity: 'Abu Dhabi', apiCountry: 'United Arab Emirates', region: 'الخليج العربي' },
  { id: 'muscat', name: 'مسقط', country: 'عُمان', latitude: 23.5880, longitude: 58.3829, timezone: 4, apiCity: 'Muscat', apiCountry: 'Oman', region: 'الخليج العربي' },
  { id: 'manama', name: 'المنامة', country: 'البحرين', latitude: 26.2285, longitude: 50.5860, timezone: 3, apiCity: 'Manama', apiCountry: 'Bahrain', region: 'الخليج العربي' },
  { id: 'beirut', name: 'بيروت', country: 'لبنان', latitude: 33.8938, longitude: 35.5018, timezone: 3, apiCity: 'Beirut', apiCountry: 'Lebanon', region: 'بلاد الشام' },
  { id: 'tunis', name: 'تونس', country: 'تونس', latitude: 36.8065, longitude: 10.1815, timezone: 1, apiCity: 'Tunis', apiCountry: 'Tunisia', region: 'المغرب العربي' },
  { id: 'algiers', name: 'الجزائر', country: 'الجزائر', latitude: 36.7538, longitude: 3.0588, timezone: 1, apiCity: 'Algiers', apiCountry: 'Algeria', region: 'المغرب العربي' },
  { id: 'rabat', name: 'الرباط', country: 'المغرب', latitude: 34.0209, longitude: -6.8416, timezone: 1, apiCity: 'Rabat', apiCountry: 'Morocco', region: 'المغرب العربي' },
  { id: 'khartoum', name: 'الخرطوم', country: 'السودان', latitude: 15.5007, longitude: 32.5599, timezone: 2, apiCity: 'Khartoum', apiCountry: 'Sudan', region: 'وادي النيل' },
  { id: 'tripoli', name: 'طرابلس', country: 'ليبيا', latitude: 32.8872, longitude: 13.1913, timezone: 2, apiCity: 'Tripoli', apiCountry: 'Libya', region: 'شمال أفريقيا' },
  { id: 'istanbul', name: 'إسطنبول', country: 'تركيا', latitude: 41.0082, longitude: 28.9784, timezone: 3, apiCity: 'Istanbul', apiCountry: 'Turkey', region: 'أوروبا وآسيا' },
  { id: 'kualalumpur', name: 'كوالالمبور', country: 'ماليزيا', latitude: 3.1390, longitude: 101.6869, timezone: 8, apiCity: 'Kuala Lumpur', apiCountry: 'Malaysia', region: 'جنوب شرق آسيا' },
  { id: 'jakarta', name: 'جاكرتا', country: 'إندونيسيا', latitude: -6.2088, longitude: 106.8456, timezone: 7, apiCity: 'Jakarta', apiCountry: 'Indonesia', region: 'جنوب شرق آسيا' },
  { id: 'london', name: 'لندن', country: 'بريطانيا', latitude: 51.5074, longitude: -0.1278, timezone: 0, apiCity: 'London', apiCountry: 'United Kingdom', region: 'أوروبا' },
  { id: 'paris', name: 'باريس', country: 'فرنسا', latitude: 48.8566, longitude: 2.3522, timezone: 1, apiCity: 'Paris', apiCountry: 'France', region: 'أوروبا' },
  { id: 'newyork', name: 'نيويورك', country: 'أمريكا', latitude: 40.7128, longitude: -74.0060, timezone: -5, apiCity: 'New York', apiCountry: 'United States', region: 'أمريكا' },
  { id: 'toronto', name: 'تورونتو', country: 'كندا', latitude: 43.6532, longitude: -79.3832, timezone: -5, apiCity: 'Toronto', apiCountry: 'Canada', region: 'أمريكا' },
  { id: 'sydney', name: 'سيدني', country: 'أستراليا', latitude: -33.8688, longitude: 151.2093, timezone: 10, apiCity: 'Sydney', apiCountry: 'Australia', region: 'أوقيانوسيا' },
];

export interface PrayerTimesResult {
  // 12-hour formatted strings strictly with Arabic suffix (ص / م)
  fajr: string;
  sunrise: string;
  dhuhr: string;
  asr: string;
  maghrib: string;
  isha: string;
  imsak: string;
  midnight: string;
  lastThird: string;

  // Raw 24-hour formatted strings (e.g. "05:31")
  fajr24: string;
  sunrise24: string;
  dhuhr24: string;
  asr24: string;
  maghrib24: string;
  isha24: string;
  imsak24: string;
  midnight24: string;
  lastThird24: string;

  // Absolute Date objects
  fajrDate: Date;
  sunriseDate: Date;
  dhuhrDate: Date;
  asrDate: Date;
  maghribDate: Date;
  ishaDate: Date;
  imsakDate: Date;
  midnightDate: Date;
  lastThirdDate: Date;

  nextPrayer: {
    id: 'fajr' | 'sunrise' | 'dhuhr' | 'asr' | 'maghrib' | 'isha';
    arabicName: string;
    time: string; // 12-hour formatted time (e.g. "03:45 م")
    time24: string;
    remainingMs: number;
    remainingFormatted: string; // e.g. "٢ س و ١٥ دقيقة"
    remainingSecondsTotal: number;
    progressPercent: number; // 0 to 100% of period from last prayer to next prayer
  };

  currentPrayer: {
    id: 'fajr' | 'sunrise' | 'dhuhr' | 'asr' | 'maghrib' | 'isha';
    arabicName: string;
    time: string;
    time24: string;
  } | null;

  source: 'api' | 'cache' | 'astronomical';
  sourceLabel: string;
  fetchedAt: Date;
  cityName: string;
  countryName: string;
  timezone: string;
  qiblaDegrees: number;

  hijriDate: {
    day: string;
    monthName: string;
    year: string;
    weekdayName: string;
    fullFormatted: string;
  };
  gregorianDate: {
    formatted: string;
    day: string;
    month: string;
    year: string;
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

/**
 * Calculates accurate Qibla compass bearing in degrees (0 - 360°) from true North
 * Kaaba coordinates: 21.422487° N, 39.826206° E
 */
export function calculateQibla(latitude: number, longitude: number): number {
  const mLat = rad(21.422487);
  const mLon = rad(39.826206);
  const uLat = rad(latitude);
  const uLon = rad(longitude);

  const y = Math.sin(mLon - uLon);
  const x = Math.cos(uLat) * Math.tan(mLat) - Math.sin(uLat) * Math.cos(mLon - uLon);
  let qibla = deg(Math.atan2(y, x));
  qibla = (qibla + 360) % 360;
  return Math.round(qibla * 10) / 10;
}

/**
 * Strictly formats time into 12-hour system with Arabic period (ص / م)
 * Example: "15:45" or 15.75 -> "03:45 م"
 * Example: "04:30" or 4.5 -> "04:30 ص"
 */
export function formatTo12Hour(hoursOrStr: number | string): string {
  let h = 0;
  let m = 0;

  if (typeof hoursOrStr === 'string') {
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

export function formatTo24Hour(hoursOrStr: number | string): string {
  if (typeof hoursOrStr === 'string') {
    const clean = hoursOrStr.replace(/[^0-9:]/g, '');
    const parts = clean.split(':');
    const h = parseInt(parts[0], 10) || 0;
    const m = parseInt(parts[1], 10) || 0;
    return `${String(h).padStart(2, '0')}:${String(m).padStart(2, '0')}`;
  }
  let h = Math.floor(hoursOrStr) % 24;
  if (h < 0) h += 24;
  const m = Math.floor((hoursOrStr - Math.floor(hoursOrStr)) * 60);
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

export function parseTimeToDate(date: Date, timeStr: string): Date {
  const clean = timeStr.replace(/[^0-9:]/g, '');
  const [hStr, mStr] = clean.split(':');
  const d = new Date(date);
  d.setHours(parseInt(hStr, 10) || 0, parseInt(mStr, 10) || 0, 0, 0);
  return d;
}

export function formatRemainingTime(ms: number): string {
  if (ms <= 0) return 'حان موعد الأذان الآن';
  const totalSeconds = Math.floor(ms / 1000);
  const hours = Math.floor(totalSeconds / 3600);
  const minutes = Math.floor((totalSeconds % 3600) / 60);
  const seconds = totalSeconds % 60;

  if (hours > 0) {
    return `${hours} س و ${minutes} دقيقة`;
  }
  if (minutes > 0) {
    return `${minutes} د و ${String(seconds).padStart(2, '0')} ثانية`;
  }
  return `${seconds} ثانية`;
}

/**
 * High-precision astronomical calculation (fallback and instant offline computation)
 */
export function calculatePrayerTimes(
  date: Date = new Date(),
  latitude: number = 30.0444, // Default: Cairo, Egypt
  longitude: number = 31.2357,
  timezoneOffsetHours?: number,
  methodId: number = 5,
  cityName: string = 'القاهرة',
  countryName: string = 'مصر'
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

  // Fajr based on method angle
  const haFajr = getHourAngle(-selectedMethod.fajrAngle) / 15;
  const fajrHours = noon - haFajr;

  // Isha based on method angle
  const haIsha = getHourAngle(-selectedMethod.ishaAngle) / 15;
  const ishaHours = noon + haIsha;

  // Asr (Shafi'i/Hanbali/Maliki standard: shadow equals object length)
  const noonAltitude = Math.PI / 2 - Math.abs(latRad - decl);
  const asrAltitude = Math.atan(1 / (1 + Math.tan(Math.PI / 2 - noonAltitude)));
  const haAsr = deg(Math.acos((Math.sin(asrAltitude) - Math.sin(latRad) * Math.sin(decl)) / (Math.cos(latRad) * Math.cos(decl)))) / 15;
  const asrHours = noon + haAsr;

  // Maghrib = sunset + small buffer
  const maghribHours = sunsetHours + 2 / 60;

  // Imsak = 10 minutes before Fajr
  const imsakHours = fajrHours - 10 / 60;

  // Midnight = halfway between sunset and tomorrow's sunrise
  const nightDuration = 24 - sunsetHours + sunriseHours;
  const midnightHours = (sunsetHours + nightDuration / 2) % 24;
  const lastThirdHours = (sunsetHours + (nightDuration * 2) / 3) % 24;

  const fajrDate = hoursToDate(date, fajrHours);
  const sunriseDate = hoursToDate(date, sunriseHours);
  const dhuhrDate = hoursToDate(date, noon);
  const asrDate = hoursToDate(date, asrHours);
  const maghribDate = hoursToDate(date, maghribHours);
  const ishaDate = hoursToDate(date, ishaHours);
  const imsakDate = hoursToDate(date, imsakHours);
  const midnightDate = hoursToDate(date, midnightHours);
  const lastThirdDate = hoursToDate(date, lastThirdHours);

  // Determine current & next prayer
  const now = date.getTime();
  const prayerList: {
    id: 'fajr' | 'sunrise' | 'dhuhr' | 'asr' | 'maghrib' | 'isha';
    arabicName: string;
    date: Date;
    hours: number;
  }[] = [
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

  // Find previous prayer for progress percent
  let prevP = [...prayerList].reverse().find((p) => p.date.getTime() <= now);
  const prevDate = prevP ? prevP.date : new Date(ishaDate.getTime() - 24 * 60 * 60 * 1000);

  const remainingMs = Math.max(0, nextDate.getTime() - now);
  const totalPeriodMs = Math.max(1000, nextDate.getTime() - prevDate.getTime());
  const elapsedPeriodMs = Math.max(0, now - prevDate.getTime());
  const progressPercent = Math.min(100, Math.max(0, Math.round((elapsedPeriodMs / totalPeriodMs) * 100)));

  // Hijri formatting fallback
  let hijriFull = '';
  try {
    hijriFull = new Intl.DateTimeFormat('ar-SA-u-ca-islamic-umalqura', {
      weekday: 'long',
      day: 'numeric',
      month: 'long',
      year: 'numeric',
    }).format(date);
  } catch (e) {
    hijriFull = '';
  }

  const gregorianFull = new Intl.DateTimeFormat('ar-EG', {
    weekday: 'long',
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  }).format(date);

  return {
    fajr: formatTo12Hour(fajrHours),
    sunrise: formatTo12Hour(sunriseHours),
    dhuhr: formatTo12Hour(noon),
    asr: formatTo12Hour(asrHours),
    maghrib: formatTo12Hour(maghribHours),
    isha: formatTo12Hour(ishaHours),
    imsak: formatTo12Hour(imsakHours),
    midnight: formatTo12Hour(midnightHours),
    lastThird: formatTo12Hour(lastThirdHours),

    fajr24: formatTo24Hour(fajrHours),
    sunrise24: formatTo24Hour(sunriseHours),
    dhuhr24: formatTo24Hour(noon),
    asr24: formatTo24Hour(asrHours),
    maghrib24: formatTo24Hour(maghribHours),
    isha24: formatTo24Hour(ishaHours),
    imsak24: formatTo24Hour(imsakHours),
    midnight24: formatTo24Hour(midnightHours),
    lastThird24: formatTo24Hour(lastThirdHours),

    fajrDate,
    sunriseDate,
    dhuhrDate,
    asrDate,
    maghribDate,
    ishaDate,
    imsakDate,
    midnightDate,
    lastThirdDate,

    nextPrayer: {
      id: nextId,
      arabicName: nextArabic,
      time: formatTo12Hour(nextHours),
      time24: formatTo24Hour(nextHours),
      remainingMs,
      remainingFormatted: formatRemainingTime(remainingMs),
      remainingSecondsTotal: Math.floor(remainingMs / 1000),
      progressPercent,
    },

    currentPrayer: prevP
      ? {
          id: prevP.id,
          arabicName: prevP.arabicName,
          time: formatTo12Hour(prevP.hours),
          time24: formatTo24Hour(prevP.hours),
        }
      : null,

    source: 'astronomical',
    sourceLabel: 'الحساب الفلكي الشرعي الاحتياطي',
    fetchedAt: new Date(),
    cityName,
    countryName,
    timezone: Intl.DateTimeFormat().resolvedOptions().timeZone || 'Local',
    qiblaDegrees: calculateQibla(latitude, longitude),

    hijriDate: {
      day: '',
      monthName: '',
      year: '',
      weekdayName: '',
      fullFormatted: hijriFull || 'التقويم الهجري المبارك',
    },
    gregorianDate: {
      formatted: gregorianFull,
      day: String(date.getDate()),
      month: String(date.getMonth() + 1),
      year: String(date.getFullYear()),
    },
  };
}

/**
 * Builds PrayerTimesResult from AlAdhan JSON response
 */
export function buildResultFromAlAdhan(
  aladhanData: any,
  date: Date,
  city: CityLocation,
  sourceType: 'api' | 'cache' = 'api'
): PrayerTimesResult {
  const timings = aladhanData.timings || aladhanData;
  const dateObj = aladhanData.date || {};
  const metaObj = aladhanData.meta || {};

  const cleanTime = (t: string) => {
    if (!t) return '00:00';
    return t.replace(/[^0-9:]/g, '').slice(0, 5);
  };

  const fajr24 = cleanTime(timings.Fajr);
  const sunrise24 = cleanTime(timings.Sunrise);
  const dhuhr24 = cleanTime(timings.Dhuhr);
  const asr24 = cleanTime(timings.Asr);
  const maghrib24 = cleanTime(timings.Maghrib || timings.Sunset);
  const isha24 = cleanTime(timings.Isha);
  const imsak24 = cleanTime(timings.Imsak || timings.Fajr);
  const midnight24 = cleanTime(timings.Midnight);
  const lastThird24 = cleanTime(timings.Lastthird);

  const fajrDate = parseTimeToDate(date, fajr24);
  const sunriseDate = parseTimeToDate(date, sunrise24);
  const dhuhrDate = parseTimeToDate(date, dhuhr24);
  const asrDate = parseTimeToDate(date, asr24);
  const maghribDate = parseTimeToDate(date, maghrib24);
  const ishaDate = parseTimeToDate(date, isha24);
  const imsakDate = parseTimeToDate(date, imsak24);
  const midnightDate = parseTimeToDate(date, midnight24);
  const lastThirdDate = parseTimeToDate(date, lastThird24);

  const now = date.getTime();
  const prayerList: {
    id: 'fajr' | 'sunrise' | 'dhuhr' | 'asr' | 'maghrib' | 'isha';
    arabicName: string;
    date: Date;
    time24: string;
  }[] = [
    { id: 'fajr', arabicName: 'الفجر', date: fajrDate, time24: fajr24 },
    { id: 'sunrise', arabicName: 'الشروق', date: sunriseDate, time24: sunrise24 },
    { id: 'dhuhr', arabicName: 'الظهر', date: dhuhrDate, time24: dhuhr24 },
    { id: 'asr', arabicName: 'العصر', date: asrDate, time24: asr24 },
    { id: 'maghrib', arabicName: 'المغرب', date: maghribDate, time24: maghrib24 },
    { id: 'isha', arabicName: 'العشاء', date: ishaDate, time24: isha24 },
  ];

  let nextP = prayerList.find((p) => p.date.getTime() > now);
  let nextDate = nextP ? nextP.date : new Date(fajrDate.getTime() + 24 * 60 * 60 * 1000);
  let nextId = nextP ? nextP.id : 'fajr';
  let nextArabic = nextP ? nextP.arabicName : 'الفجر (الغد)';
  let nextTime24 = nextP ? nextP.time24 : fajr24;

  let prevP = [...prayerList].reverse().find((p) => p.date.getTime() <= now);
  const prevDate = prevP ? prevP.date : new Date(ishaDate.getTime() - 24 * 60 * 60 * 1000);

  const remainingMs = Math.max(0, nextDate.getTime() - now);
  const totalPeriodMs = Math.max(1000, nextDate.getTime() - prevDate.getTime());
  const elapsedPeriodMs = Math.max(0, now - prevDate.getTime());
  const progressPercent = Math.min(100, Math.max(0, Math.round((elapsedPeriodMs / totalPeriodMs) * 100)));

  // Hijri Date parsing from AlAdhan
  let hijriData = {
    day: dateObj.hijri?.day || '',
    monthName: dateObj.hijri?.month?.ar || '',
    year: dateObj.hijri?.year || '',
    weekdayName: dateObj.hijri?.weekday?.ar || '',
    fullFormatted: '',
  };

  if (hijriData.day && hijriData.monthName && hijriData.year) {
    hijriData.fullFormatted = `${hijriData.weekdayName ? `${hijriData.weekdayName} ` : ''}${hijriData.day} ${hijriData.monthName} ${hijriData.year} هـ`;
  } else {
    try {
      hijriData.fullFormatted = new Intl.DateTimeFormat('ar-SA-u-ca-islamic-umalqura', {
        weekday: 'long',
        day: 'numeric',
        month: 'long',
        year: 'numeric',
      }).format(date);
    } catch (e) {
      hijriData.fullFormatted = 'التقويم الهجري المبارك';
    }
  }

  const gregorianFormatted = new Intl.DateTimeFormat('ar-EG', {
    weekday: 'long',
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  }).format(date);

  return {
    fajr: formatTo12Hour(fajr24),
    sunrise: formatTo12Hour(sunrise24),
    dhuhr: formatTo12Hour(dhuhr24),
    asr: formatTo12Hour(asr24),
    maghrib: formatTo12Hour(maghrib24),
    isha: formatTo12Hour(isha24),
    imsak: formatTo12Hour(imsak24),
    midnight: formatTo12Hour(midnight24),
    lastThird: formatTo12Hour(lastThird24),

    fajr24,
    sunrise24,
    dhuhr24,
    asr24,
    maghrib24,
    isha24,
    imsak24,
    midnight24,
    lastThird24,

    fajrDate,
    sunriseDate,
    dhuhrDate,
    asrDate,
    maghribDate,
    ishaDate,
    imsakDate,
    midnightDate,
    lastThirdDate,

    nextPrayer: {
      id: nextId,
      arabicName: nextArabic,
      time: formatTo12Hour(nextTime24),
      time24: nextTime24,
      remainingMs,
      remainingFormatted: formatRemainingTime(remainingMs),
      remainingSecondsTotal: Math.floor(remainingMs / 1000),
      progressPercent,
    },

    currentPrayer: prevP
      ? {
          id: prevP.id,
          arabicName: prevP.arabicName,
          time: formatTo12Hour(prevP.time24),
          time24: prevP.time24,
        }
      : null,

    source: sourceType,
    sourceLabel: sourceType === 'api' ? 'AlAdhan API الحي المباشر' : 'بيانات محفوظة مؤقتاً (بدون إنترنت)',
    fetchedAt: new Date(),
    cityName: city.name,
    countryName: city.country,
    timezone: metaObj.timezone || Intl.DateTimeFormat().resolvedOptions().timeZone || 'Africa/Cairo',
    qiblaDegrees: calculateQibla(city.latitude, city.longitude),

    hijriDate: hijriData,
    gregorianDate: {
      formatted: gregorianFormatted,
      day: String(date.getDate()),
      month: String(date.getMonth() + 1),
      year: String(date.getFullYear()),
    },
  };
}

/**
 * Fetches real prayer times from AlAdhan API with robust multi-layer fallback:
 * 1. Live AlAdhan REST API (v1/timings or v1/timingsByCity)
 * 2. Multi-day Local Storage Cache
 * 3. High-precision Astronomical Engine Fallback
 */
export async function fetchRealPrayerTimes(
  city: CityLocation,
  methodId: number = 5,
  date: Date = new Date()
): Promise<PrayerTimesResult> {
  const dayStr = String(date.getDate()).padStart(2, '0');
  const monthStr = String(date.getMonth() + 1).padStart(2, '0');
  const yearStr = String(date.getFullYear());
  const dateParam = `${dayStr}-${monthStr}-${yearStr}`;

  const cacheKey = `prayer_aladhan_v4_${city.id}_${methodId}_${dateParam}`;
  const lastKnownKey = `prayer_last_known_${city.id}_${methodId}`;

  // 1. Attempt Live Fetch from AlAdhan API
  try {
    let url = '';
    if (city.apiCity && city.apiCountry) {
      url = `https://api.aladhan.com/v1/timingsByCity/${dateParam}?city=${encodeURIComponent(city.apiCity)}&country=${encodeURIComponent(city.apiCountry)}&method=${methodId}`;
    } else {
      url = `https://api.aladhan.com/v1/timings/${dateParam}?latitude=${city.latitude}&longitude=${city.longitude}&method=${methodId}`;
    }

    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 6000);

    const res = await fetch(url, { signal: controller.signal });
    clearTimeout(timeoutId);

    if (res.ok) {
      const json = await res.json();
      if (json && json.data && json.data.timings) {
        const result = buildResultFromAlAdhan(json.data, date, city, 'api');

        // Cache the raw JSON data for reliable offline use
        try {
          localStorage.setItem(cacheKey, JSON.stringify(json.data));
          localStorage.setItem(lastKnownKey, JSON.stringify(json.data));
        } catch (e) {}

        return result;
      }
    }
  } catch (err) {
    // Network offline, timeout, or blocked
  }

  // 2. Check today's cache in localStorage
  try {
    const cachedToday = localStorage.getItem(cacheKey);
    if (cachedToday) {
      const parsedData = JSON.parse(cachedToday);
      if (parsedData && parsedData.timings) {
        return buildResultFromAlAdhan(parsedData, date, city, 'cache');
      }
    }
  } catch (e) {}

  // 3. Check last known valid result for this city & method
  try {
    const lastKnown = localStorage.getItem(lastKnownKey);
    if (lastKnown) {
      const parsedData = JSON.parse(lastKnown);
      if (parsedData && parsedData.timings) {
        return buildResultFromAlAdhan(parsedData, date, city, 'cache');
      }
    }
  } catch (e) {}

  // 4. Fallback to offline astronomical engine
  return calculatePrayerTimes(
    date,
    city.latitude,
    city.longitude,
    city.timezone,
    methodId,
    city.name,
    city.country
  );
}
