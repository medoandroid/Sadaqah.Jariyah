export interface QuranPlaylist {
  id: string;
  title: string;
  subtitle: string;
  description: string;
  badge: string;
  iconName: 'shield' | 'sparkles' | 'book' | 'heart' | 'moon' | 'flame' | 'layers';
  colorGradient: string;
  borderColor: string;
  surahNumbers: number[];
}

export const QURAN_PLAYLISTS: QuranPlaylist[] = [
  {
    id: 'ruqyah',
    title: 'الرقية الشرعية',
    subtitle: 'آيات التحصين والشفاء والسكينة',
    description: 'باقة مباركة تشمل سورة الفاتحة، آيات من البقرة، الكافرون، والمعوذات لطرد الوساوس وجلب الراحة والشفاء بإذن الله تعالى.',
    badge: 'تحصين وسكينة',
    iconName: 'shield',
    colorGradient: 'from-emerald-950/60 via-emerald-900/30 to-stone-900/60',
    borderColor: 'border-emerald-500/40 hover:border-emerald-400',
    surahNumbers: [1, 2, 109, 112, 113, 114],
  },
  {
    id: 'four-daily',
    title: 'الأربع اليومية',
    subtitle: 'يس · الرحمن · الواقعة · الملك',
    description: 'السور الأربع المأثورة يومياً لقضاء الحوائج وطلب البركة والسعة والأمان والنجاة من عذاب القبر.',
    badge: 'بركة وفضائل',
    iconName: 'sparkles',
    colorGradient: 'from-amber-950/60 via-amber-900/30 to-stone-900/60',
    borderColor: 'border-amber-500/40 hover:border-amber-400',
    surahNumbers: [36, 55, 56, 67],
  },
  {
    id: 'juz-amma',
    title: 'جزء عم',
    subtitle: 'الجزء الثلاثون كاملاً (٣٧ سورة)',
    description: 'تلاوة متتابعة لجزء عم كاملاً من سورة النبأ حتى سورة الناس، عظيم النفع للحفظ والتدبر وتلاوة الصلاة.',
    badge: '٣٧ سورة متتابعة',
    iconName: 'book',
    colorGradient: 'from-sky-950/60 via-sky-900/30 to-stone-900/60',
    borderColor: 'border-sky-500/40 hover:border-sky-400',
    surahNumbers: [
      78, 79, 80, 81, 82, 83, 84, 85, 86, 87, 88, 89, 90, 91, 92, 93, 94, 95, 96,
      97, 98, 99, 100, 101, 102, 103, 104, 105, 106, 107, 108, 109, 110, 111, 112, 113, 114
    ],
  },
  {
    id: 'muawwidhat',
    title: 'المعوذات الثلاث',
    subtitle: 'الإخلاص · الفلق · الناس',
    description: '«قل هو الله أحد، والمعوذتين حين تمسي وحين تصبح ثلاثاً تكفيك من كل شيء»، سور التوحيد واللجوء لرب العزة.',
    badge: 'كافية من كل شيء',
    iconName: 'heart',
    colorGradient: 'from-rose-950/60 via-rose-900/30 to-stone-900/60',
    borderColor: 'border-rose-500/40 hover:border-rose-400',
    surahNumbers: [112, 113, 114],
  },
  {
    id: 'before-sleep',
    title: 'قبل النوم',
    subtitle: 'الملك · السجدة · المعوذات',
    description: 'ما كان يداوم عليه الحبيب المصطفى ﷺ قبل النوم لنيل المغفرة والوقاية والسكينة وبشائر الرضوان في المرقد.',
    badge: 'سنة نبوية',
    iconName: 'moon',
    colorGradient: 'from-indigo-950/60 via-indigo-900/30 to-stone-900/60',
    borderColor: 'border-indigo-500/40 hover:border-indigo-400',
    surahNumbers: [32, 67, 112, 113, 114],
  },
  {
    id: 'jumua-kahf',
    title: 'الجمعة - الكهف',
    subtitle: 'سورة الكهف كاملة',
    description: '«من قرأ سورة الكهف في يوم الجمعة أضاء له من النور ما بين الجمعتين»، سنة مؤكدة ونور وضياء للمؤمن.',
    badge: 'نور الجمعتين',
    iconName: 'flame',
    colorGradient: 'from-amber-950/60 via-amber-800/30 to-stone-900/60',
    borderColor: 'border-amber-500/40 hover:border-amber-400',
    surahNumbers: [18],
  },
  {
    id: 'qisar-surahs',
    title: 'قصار السور',
    subtitle: 'من الضحى إلى الناس (٢٢ سورة)',
    description: 'باقة قصار المفصل لسهولة الاستماع والترديد السريع، محبوبة للكبار والصغار ومراجعة الحفظ اليومي.',
    badge: '٢٢ سورة ميسرة',
    iconName: 'layers',
    colorGradient: 'from-teal-950/60 via-teal-900/30 to-stone-900/60',
    borderColor: 'border-teal-500/40 hover:border-teal-400',
    surahNumbers: [
      93, 94, 95, 96, 97, 98, 99, 100, 101, 102, 103, 104, 105, 106, 107, 108, 109,
      110, 111, 112, 113, 114
    ],
  },
];
