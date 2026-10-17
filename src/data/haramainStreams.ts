export interface HaramainStream {
  id: number;
  slug: 'makkah' | 'madinah';
  name: string;
  shortName: string;
  mosqueTitle: string;
  city: string;
  country: string;
  primaryStreamUrl: string;
  backupStreamUrls: string[];
  youtubeLiveUrl: string;
  youtubeEmbedUrl: string;
  youtubeVideoId: string;
  audioStreamUrl: string;
  audioBackupStreamUrl: string;
  audioRadioName: string;
  audioReciterName: string;
  description: string;
  spiritualVirtue: string;
  landmarks: string[];
  accentColor: 'amber' | 'emerald';
  coordinates: {
    lat: number;
    lng: number;
  };
  imams: string[];
}

export const HARAMAIN_STREAMS: HaramainStream[] = [
  {
    id: 3,
    slug: 'makkah',
    name: 'قناة القرآن الكريم الفضائية (المسجد الحرام)',
    shortName: 'المسجد الحرام · مكة المكرمة',
    mosqueTitle: 'الكعبة المشرفة وصحن المطاف المبارك',
    city: 'مكة المكرمة',
    country: 'المملكة العربية السعودية',
    // Verified 200 OK Wowza HLS streams with CORS support
    primaryStreamUrl: 'https://win.holol.com/live/quran/playlist.m3u8',
    backupStreamUrls: [
      'https://win.holol.com/live/quran/chunklist.m3u8',
      'https://win.holol.com/live/quran/index.m3u8'
    ],
    youtubeLiveUrl: 'https://www.youtube.com/@saudiqurantv/live',
    youtubeEmbedUrl: 'https://www.youtube-nocookie.com/embed/zX04CpfsNCo?autoplay=1&mute=1&playsinline=1&rel=0',
    youtubeVideoId: 'zX04CpfsNCo',
    // Official working MP3Quran Shoutcast live audio streams (CORS enabled)
    audioStreamUrl: 'https://backup.qurango.net/radio/abdulrahman_alsudaes',
    audioBackupStreamUrl: 'https://backup.qurango.net/radio/maher',
    audioRadioName: 'إذاعة الحرم المكي الشريف · تلاوات أئمة المسجد الحرام',
    audioReciterName: 'الشيخ د. عبدالرحمن السديس',
    description: 'بث حي ومباشر على مدار الساعة لصلوات الحرم المكي الشريف، الطواف حول الكعبة المشرفة، وتلاوات أئمة الحرم المكي بأعذب الأصوات.',
    spiritualVirtue: '«صَلَاةٌ فِي الْمَسْجِدِ الْحَرَامِ أَفْضَلُ مِنْ مِائَةِ أَلْفِ صَلَاةٍ فِيمَا سِوَاهُ» [مسند أحمد]',
    landmarks: [
      'الكعبة المشرفة وقبلة المسلمين',
      'مقام إبراهيم عليه السلام',
      'حجر إسماعيل وبئر زمزم المبارك',
      'صحن المطاف والمسعى الشريف'
    ],
    accentColor: 'amber',
    coordinates: {
      lat: 21.4225,
      lng: 39.8262
    },
    imams: [
      'الشيخ د. عبدالرحمن السديس',
      'الشيخ د. ماهر المعيقلي',
      'الشيخ د. عبدالله الجهني',
      'الشيخ د. بندر بليلة',
      'الشيخ د. ياسر الدوسري'
    ]
  },
  {
    id: 4,
    slug: 'madinah',
    name: 'قناة السنة النبوية الفضائية (المسجد النبوي)',
    shortName: 'المسجد النبوي · المدينة المنورة',
    mosqueTitle: 'الروضة الشريفة والقبة الخضراء',
    city: 'المدينة المنورة',
    country: 'المملكة العربية السعودية',
    // Verified 200 OK Wowza HLS streams with CORS support
    primaryStreamUrl: 'https://win.holol.com/live/sunnah/playlist.m3u8',
    backupStreamUrls: [
      'https://win.holol.com/live/sunnah/chunklist.m3u8',
      'https://win.holol.com/live/sunnah/index.m3u8'
    ],
    youtubeLiveUrl: 'https://www.youtube.com/@saudisunnahtv/live',
    youtubeEmbedUrl: 'https://www.youtube-nocookie.com/embed/G2JI-esUCvw?autoplay=1&mute=1&playsinline=1&rel=0',
    youtubeVideoId: 'G2JI-esUCvw',
    // Official working MP3Quran Shoutcast live audio streams (CORS enabled)
    audioStreamUrl: 'https://backup.qurango.net/radio/ali_alhuthaifi',
    audioBackupStreamUrl: 'https://backup.qurango.net/radio/ali_alhuthaifi_qalon',
    audioRadioName: 'إذاعة المسجد النبوي الشريف · تلاوات أئمة المدينة المنورة',
    audioReciterName: 'الشيخ د. علي بن عبدالرحمن الحذيفي',
    description: 'بث حي ومباشر من رحاب مسجد رسول الله ﷺ، مصلى النبي ﷺ، الروضة الشريفة، وتلاوات وأحاديث نبوية شريفة على مدار اليوم.',
    spiritualVirtue: '«صَلَاةٌ فِي مَسْجِدِي هَذَا خَيْرٌ مِنْ أَلْفِ صَلَاةٍ فِيمَا سِوَاهُ إِلَّا الْمَسْجِدَ الْحَرَامَ» [صحيح البخاري]',
    landmarks: [
      'الروضة الشريفة (روضة من رياض الجنة)',
      'المواجهة الشريفة والسلام على النبي ﷺ وصاحبيه',
      'القبة الخضراء والمآذن النبوية',
      'مظلات ساحات الحرم النبوي الفسيحة'
    ],
    accentColor: 'emerald',
    coordinates: {
      lat: 24.4672,
      lng: 39.6111
    },
    imams: [
      'الشيخ د. علي بن عبدالرحمن الحذيفي',
      'الشيخ د. عبدالمحسن القاسم',
      'الشيخ د. صلاح البدير',
      'الشيخ د. أحمد بن طالب بن حميد',
      'الشيخ د. خالد المهنا'
    ]
  }
];

export interface HaramainImamRadio {
  id: number;
  name: string;
  role: string;
  mosque: 'makkah' | 'madinah';
  url: string;
  reciterName: string;
}

export const HARAMAIN_IMAM_RADIOS: HaramainImamRadio[] = [
  {
    id: 33,
    name: 'إذاعة الشيخ د. عبدالرحمن السديس',
    role: 'إمام وخطيب المسجد الحرام',
    mosque: 'makkah',
    url: 'https://backup.qurango.net/radio/abdulrahman_alsudaes',
    reciterName: 'عبدالرحمن السديس'
  },
  {
    id: 63,
    name: 'إذاعة الشيخ د. ماهر المعيقلي',
    role: 'إمام وخطيب المسجد الحرام',
    mosque: 'makkah',
    url: 'https://backup.qurango.net/radio/maher',
    reciterName: 'ماهر المعيقلي'
  },
  {
    id: 46,
    name: 'إذاعة الشيخ د. علي الحذيفي',
    role: 'إمام وخطيب المسجد النبوي الشريف',
    mosque: 'madinah',
    url: 'https://backup.qurango.net/radio/ali_alhuthaifi',
    reciterName: 'علي بن عبدالرحمن الحذيفي'
  },
  {
    id: 18,
    name: 'إذاعة الشيخ د. سعود الشريم',
    role: 'إمام الحرم المكي سابقاً',
    mosque: 'makkah',
    url: 'https://backup.qurango.net/radio/saud_alshuraim',
    reciterName: 'سعود الشريم'
  },
  {
    id: 38,
    name: 'إذاعة الشيخ د. عبدالله الجهني',
    role: 'إمام المسجد الحرام',
    mosque: 'makkah',
    url: 'https://backup.qurango.net/radio/abdullah_aljohany',
    reciterName: 'عبدالله عواد الجهني'
  },
  {
    id: 47,
    name: 'إذاعة الشيخ علي الحذيفي (قالون)',
    role: 'رواية قالون عن نافع - المسجد النبوي',
    mosque: 'madinah',
    url: 'https://backup.qurango.net/radio/ali_alhuthaifi_qalon',
    reciterName: 'علي الحذيفي'
  }
];
