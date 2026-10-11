/**
 * Spiritual Companion & Mindful Encouragement Data
 * Natural, heartfelt encouragement, gentle Quranic reminders,
 * and sincere reflections.
 */

export type CompanionMoodKey =
  | 'stressed'
  | 'lazy_quran'
  | 'missing_uncles'
  | 'grateful'
  | 'seeking_forgiveness'
  | 'random_nudge'
  | 'bedtime'
  | 'morning';

export interface CompanionEntry {
  id: number;
  mood: CompanionMoodKey;
  title: string;
  badge: string;
  text: string;
  actionText: string;
  actionType: 'mushaf' | 'quran' | 'tasbeeh' | 'dedications' | 'adhkar' | 'duas';
  targetSurahNumber?: number;
  dhikrPhrase?: string;
  duaSnippet?: string;
}

// Backward compatibility aliases
export type EgyptianMoodKey = CompanionMoodKey;
export type EgyptianCompanionEntry = CompanionEntry;

export const COMPANION_MOODS: { key: CompanionMoodKey; label: string }[] = [
  { key: 'lazy_quran', label: 'تشجيع لقراءة القرآن' },
  { key: 'stressed', label: 'راحة بال وسكينة' },
  { key: 'missing_uncles', label: 'وفاء ودعاء للأحباب' },
  { key: 'seeking_forgiveness', label: 'استغفار وبداية جديدة' },
  { key: 'grateful', label: 'شكر وحمد على النعم' },
  { key: 'random_nudge', label: 'تذكرة طيبة' },
];

export const EGYPTIAN_MOODS = COMPANION_MOODS;

export const COMPANION_ENTRIES: CompanionEntry[] = [
  // 1. تشجيع لقراءة القرآن
  {
    id: 101,
    mood: 'lazy_quran',
    title: 'خمس دقائق مع المصحف تشرح صدرك',
    badge: 'تذكرة بالقرآن',
    text: 'الدنيا ومشاغلها بتسحب الوقت من غير ما نحس، وصفحة واحدة بس من المصحف كفيلة تنور يومك وتبدل أي ضيق في صدرك لطمأنينة. متأجلش.. افتح المصحف دلوقتي واقرأ صفحة برواقة وراحة بال.',
    actionText: 'فتح المصحف وقراءة صفحة',
    actionType: 'mushaf',
  },
  {
    id: 102,
    mood: 'lazy_quran',
    title: 'سورة الضحى.. طمأنينة تملأ قلبك',
    badge: 'سكينة وطمأنينة',
    text: 'لو حاسس بفتور أو تعب، افتح سورة الضحى واقرأها بالراحة. "ما ودّعك ربك وما قلى".. رسالة طمأنينة من ربنا إن الخير جاي وإن اللي فات مش هيضيع. آيات قليلة كفيلة ترجع لقلبك هدوءه.',
    actionText: 'قراءة سورة الضحى',
    actionType: 'quran',
    targetSurahNumber: 93,
  },
  {
    id: 103,
    mood: 'lazy_quran',
    title: 'الحرف بحسنة والحسنة بعشر أمثالها',
    badge: 'أجر مضاعف',
    text: 'الوقت بيعدي بسرعة في كل حاجة تانية، وسطور قليلة في كتاب ربنا بتفضل في ميزانك دايماً. "بسم الله الرحمن الرحيم" وحدها ١٩ حرف، كل حرف فيها بعشر حسنات. خلي ليك نصيب من النور ده كل يوم.',
    actionText: 'تصفح المصحف الشريف',
    actionType: 'mushaf',
  },
  {
    id: 104,
    mood: 'lazy_quran',
    title: 'سورة الملك قبل النوم.. أمان وبركة',
    badge: 'سنة نبوية مباركة',
    text: 'قبل ما تختم يومك، اقرأ سورة الملك؛ دي السورة المانعة المنجية اللي بتشفع لصاحبها. دقائق معدودة تلاوة هادية تخليك تنام بقلب مطمئن ومحفوظ.',
    actionText: 'قراءة سورة الملك',
    actionType: 'quran',
    targetSurahNumber: 67,
  },

  // 2. راحة بال وسكينة
  {
    id: 201,
    mood: 'stressed',
    title: 'ولا تقلق.. مدبرها حكيم وكريم',
    badge: 'سكينة ورضا',
    text: 'مفيش حاجة في الدنيا تستاهل تشيل همها بزيادة. ربك اللي دبر أمور الكون ورتب كل شيء بحكمته، قادر ييسر أمرك ويفتح لك الأبواب المقفولة بلطفه. سلمها لربنا وقول: يا رب فوضت أمري إليك.',
    actionText: 'ذكر واستغفار بالسبحة',
    actionType: 'tasbeeh',
    dhikrPhrase: 'لَا حَوْلَ وَلَا قُوَّةَ إِلَّا بِاللَّهِ الْعَلِيِّ الْعَظِيمِ',
  },
  {
    id: 202,
    mood: 'stressed',
    title: 'كنز من كنوز الجنة: لا حول ولا قوة إلا بالله',
    badge: 'تفريج الكرب',
    text: 'لو حاسس بضغط أو زحمة أفكار، خد نفس عميق وكرر بقلب حاضر: "لا حول ولا قوة إلا بالله العلي العظيم". ده اعتراف بأن الحيلة لله وحده، وكل عسير عنده هين.',
    actionText: 'ترديد لا حول ولا قوة إلا بالله',
    actionType: 'tasbeeh',
    dhikrPhrase: 'لَا حَوْلَ وَلَا قُوَّةَ إِلَّا بِاللَّهِ',
  },
  {
    id: 203,
    mood: 'stressed',
    title: 'استمع لسورة يس بهدوء وخشوع',
    badge: 'شفاء الصدور',
    text: 'القرآن شفاء وسكينة لما في الصدور. لما تحس بضيق، شغل سورة يس بصوت قارئ تحبه، واقعد اسمع الآيات وسيب كلام ربنا ينزل سلاماً على قلبك.',
    actionText: 'الاستماع لسورة يس',
    actionType: 'quran',
    targetSurahNumber: 36,
  },

  // 3. وفاء ودعاء للأحباب الراحلين
  {
    id: 301,
    mood: 'missing_uncles',
    title: 'أحبابك الراحلون يسعدون بدعائك الآن',
    badge: 'بر ودعاء خالص',
    text: 'الدعاء الصادق أوفى هدية توصل لمن فارقونا. عمامك الكرام (رمضان، والشهاوي، والشافعي، وأحمد) يصلهُم نور دعائك وثواب تلاوتك في قبورهم. ارفع كفيك واطلب لهم المغفرة والرحمة والفسحة في الجنة.',
    actionText: 'إهداء ثواب ودعاء',
    actionType: 'dedications',
  },
  {
    id: 302,
    mood: 'missing_uncles',
    title: 'صلة الوفاء ممتدة بالدعاء والصدقة',
    badge: 'صلة لا تنقطع',
    text: 'الوفاء الحقيقي هو إنك تفتكرهم بالخير دايماً. كل آية تقرأها وكل دعوة ترفعها بنيتهم هي صدقة جارية ترفع درجاتهم وتؤنس وحشتهم برحمة الله.',
    actionText: 'قراءة أدعية المتوفين المأثورة',
    actionType: 'duas',
  },

  // 4. استغفار وبداية جديدة
  {
    id: 401,
    mood: 'seeking_forgiveness',
    title: 'باب التوبة مفتوح دائماً.. ابدأ من جديد',
    badge: 'مغفرة ورحمة',
    text: 'مهما حسيت بتقصير، افتكر دايماً إن رحمة ربنا وسعت كل شيء وإن الله يفرح بتوبة عبده وإقباله. استغفر من قلبك وخلي في نيتك بداية صفحة جديدة ناصعة بالخير.',
    actionText: 'استغفار بالسبحة',
    actionType: 'tasbeeh',
    dhikrPhrase: 'أَسْتَغْفِرُ اللَّهَ الْعَظِيمَ وَأَتُوبُ إِلَيْهِ',
  },
  {
    id: 402,
    mood: 'seeking_forgiveness',
    title: 'سيد الاستغفار: أجمع دعاء للمغفرة',
    badge: 'دعاء جامع',
    text: 'كرر هذا الدعاء المبارك: "اللهم أنت ربي لا إله إلا أنت، خلقتني وأنا عبدك، وأنا على عهدك ووعدك ما استطعت.. أبوء لك بنعمتك علي وأبوء بذنبي فاغفر لي فإنه لا يغفر الذنوب إلا أنت". دعاء يريح النفس ويطهر القلب.',
    actionText: 'فتح أذكار الصباح والمساء',
    actionType: 'adhkar',
  },

  // 5. شكر وحمد على النعم
  {
    id: 501,
    mood: 'grateful',
    title: 'الحمد لله على نعمه الظاهرة والباطنة',
    badge: 'قيد النعم بالشكر',
    text: 'الشكر مفتاح الزيادة وطمأنينة القلب. "لئن شكرتم لأزيدنكم".. اذكر نعم الله عليك في صحتك وأهلك ويومك، وقل بقلب حاضر: الحمد لله حمداً كثيراً طيباً مباركاً فيه.',
    actionText: 'تسبيح الحمد والشكر',
    actionType: 'tasbeeh',
    dhikrPhrase: 'الْحَمْدُ لِلَّهِ رَبِّ الْعَالَمِينَ حَمْدًا كَثِيرًا',
  },
  {
    id: 502,
    mood: 'grateful',
    title: 'شارك النعمة بإهداء ثواب لأرواح الأحباب',
    badge: 'بذل وإحسان',
    text: 'من أجمل صور الشكر أن تهدي ثواب تلاوة أو عمل صالح لمن فارقونا، لتصلهم الرحمة ويدوم أثر الخير في ميزان الجميع.',
    actionText: 'إهداء ثواب تلاوة مباركة',
    actionType: 'dedications',
  },

  // 6. تذكرة طيبة
  {
    id: 601,
    mood: 'random_nudge',
    title: 'الصلاة على النبي ﷺ.. نور وبركة',
    badge: 'بركة اليوم',
    text: 'الصلاة على الحبيب المصطفى ﷺ تكفي الهم وتغفر الذنب وتفتح أبواب التوفيق. صلّ عليه الآن بقلب حاضر: اللهم صلّ وسلم وبارك على سيدنا محمد وعلى آله وصحبه أجمعين.',
    actionText: 'الصلاة على النبي بالسبحة',
    actionType: 'tasbeeh',
    dhikrPhrase: 'اللَّهُمَّ صَلِّ وَسَلِّمْ عَلَى سَيِّدِنَا مُحَمَّدٍ',
  },
  {
    id: 602,
    mood: 'random_nudge',
    title: 'كلمتان خفيفتان على اللسان، ثقيلتان في الميزان',
    badge: 'ذكر خفيف وأجر عظيم',
    text: 'وصية نبوية غالية: "سُبْحَانَ اللَّهِ وَبِحَمْدِهِ، سُبْحَانَ اللَّهِ الْعَظِيمِ". ذكر يسير يمكنك ترديده وأنت في طريقك أو أثناء عملك، ويبني لك أجراً عظيماً.',
    actionText: 'تسبيح سبحان الله وبحمده',
    actionType: 'tasbeeh',
    dhikrPhrase: 'سُبْحَانَ اللَّهِ وَبِحَمْدِهِ سُبْحَانَ اللَّهِ الْعَظِيمِ',
  },
  {
    id: 603,
    mood: 'random_nudge',
    title: 'اجعل لسانك رطباً بذكر الله دائماً',
    badge: 'طمأنينة الروح',
    text: 'أيام العمر تمضي سريعاً، والعمل الصالح والذكر الدائم هو الباقي الذي يسعد صاحبه في الدارين. لا تدع يوماً يمر دون نصيب من ذكر الله والإحسان.',
    actionText: 'تصفح الأدعية والأذكار',
    actionType: 'adhkar',
  },
];

export const EGYPTIAN_COMPANION_ENTRIES = COMPANION_ENTRIES;

/**
 * Get an entry by mood or random
 */
export function getCompanionEntryByMood(mood: CompanionMoodKey, excludeId?: number): CompanionEntry {
  const filtered = COMPANION_ENTRIES.filter(
    (e) => (mood === 'random_nudge' ? true : e.mood === mood) && e.id !== excludeId
  );
  if (filtered.length === 0) {
    return COMPANION_ENTRIES[0];
  }
  const idx = Math.floor(Math.random() * filtered.length);
  return filtered[idx];
}

export const getEgyptianEntryByMood = getCompanionEntryByMood;

