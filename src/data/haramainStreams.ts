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
  youtubeEmbedUrl?: string;
  audioStreamUrl: string;
  audioRadioName: string;
  description: string;
  spiritualVirtue: string;
  landmarks: string[];
  accentColor: 'amber' | 'emerald';
  coordinates: {
    lat: number;
    lng: number;
  };
}

export const HARAMAIN_STREAMS: HaramainStream[] = [
  {
    id: 3,
    slug: 'makkah',
    name: 'قناة القرآن الكريم الفضائية (المسجد الحرام)',
    shortName: 'المسجد الحرام · مكة المكرمة',
    mosqueTitle: 'الكعبة المشرفة وصحن المطاف',
    city: 'مكة المكرمة',
    country: 'المملكة العربية السعودية',
    primaryStreamUrl: 'https://win.holol.com/live/quran/playlist.m3u8',
    backupStreamUrls: [
      'https://stream.al-eman.tv/live/quran/playlist.m3u8',
      'https://win.holol.com/live/quran/index.m3u8'
    ],
    youtubeLiveUrl: 'https://www.youtube.com/@saudiqurantv/live',
    youtubeEmbedUrl: 'https://www.youtube-nocookie.com/embed/live_stream?channel=UC_0sPkWv9LdIvh-2r9jT_9A',
    audioStreamUrl: 'https://backup.qurango.net/radio/makkah_live',
    audioRadioName: 'إذاعة الحرم المكي الشريف',
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
    }
  },
  {
    id: 4,
    slug: 'madinah',
    name: 'قناة السنة النبوية الفضائية (المسجد النبوي)',
    shortName: 'المسجد النبوي · المدينة المنورة',
    mosqueTitle: 'الروضة الشريفة والقبة الخضراء',
    city: 'المدينة المنورة',
    country: 'المملكة العربية السعودية',
    primaryStreamUrl: 'https://win.holol.com/live/sunnah/playlist.m3u8',
    backupStreamUrls: [
      'https://stream.al-eman.tv/live/sunnah/playlist.m3u8',
      'https://win.holol.com/live/sunnah/index.m3u8'
    ],
    youtubeLiveUrl: 'https://www.youtube.com/@saudisunnahtv/live',
    youtubeEmbedUrl: 'https://www.youtube-nocookie.com/embed/live_stream?channel=UC5m0hV3aH6w-xW_WkGZ6p3g',
    audioStreamUrl: 'https://backup.qurango.net/radio/tarawih',
    audioRadioName: 'إذاعة المسجد النبوي الشريف والتراويح',
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
    }
  }
];
