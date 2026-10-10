/**
 * Egyptian Spiritual Companion & Interactive Nudge Data
 * Authentic Egyptian Arabic phrases, warm spiritual encouragement,
 * reminders to recite Quran, and heartfelt advice.
 */

export type EgyptianMoodKey =
  | 'stressed'
  | 'lazy_quran'
  | 'missing_uncles'
  | 'grateful'
  | 'seeking_forgiveness'
  | 'random_nudge'
  | 'bedtime'
  | 'morning';

export interface EgyptianCompanionEntry {
  id: number;
  mood: EgyptianMoodKey;
  title: string;
  badge: string;
  egyptianText: string;
  actionText: string;
  actionType: 'mushaf' | 'quran' | 'tasbeeh' | 'dedications' | 'adhkar' | 'duas';
  targetSurahNumber?: number;
  dhikrPhrase?: string;
  duaSnippet?: string;
}

export const EGYPTIAN_MOODS: { key: EgyptianMoodKey; label: string; icon: string }[] = [
  { key: 'lazy_quran', label: 'كسلان ومحتاج زقة للمصحف 📖', icon: '📖' },
  { key: 'stressed', label: 'مضغوط ومخنوق ومحتاج أهدى ☕', icon: '☕' },
  { key: 'missing_uncles', label: 'واحشني عمامي وأهلي الغاليين 🤍', icon: '🤍' },
  { key: 'seeking_forgiveness', label: 'حاسس بتقصير وعايز أبدأ جديد 🌧️', icon: '🌧️' },
  { key: 'grateful', label: 'فرحان وعايز أشكر ربنا من قلبي ✨', icon: '✨' },
  { key: 'random_nudge', label: 'روّق عليا بنصيحة ع الماشي 🎲', icon: '🎲' },
];

export const EGYPTIAN_COMPANION_ENTRIES: EgyptianCompanionEntry[] = [
  // 1. كسلان ومحتاج زقة للمصحف
  {
    id: 101,
    mood: 'lazy_quran',
    title: 'يا بطل، الشيطان بيضحك عليك ومثقّل رجلك!',
    badge: 'زقة مصحف محترمة',
    egyptianText: 'عارف الشيطان بيعمل إيه دلوقتي؟ بيقنعك إنك تعبان وإن صفحة المصحف هتاخد وقت.. متديهوش الفرصة دي يا غالي! افتح المصحف دلوقتي، اقرأ صفحة واحدة بس مش طالبين أكتر، وشوف الهم اللي في صدرك هيدوب إزاي. القرآن بركة بتجري في الدم.',
    actionText: 'يلا نفتح المصحف الورقي نقرأ صفحة',
    actionType: 'mushaf',
  },
  {
    id: 102,
    mood: 'lazy_quran',
    title: 'سورة الضحى.. طبطبة على قلبك في ٦٠ ثانية',
    badge: 'طبطبة قرأنية',
    egyptianText: 'لو حاسس بفتور أو كسل، افتح سورة الضحى، اسمعها أو اقرأها بالراحة. "ما ودّعك ربك وما قلى".. ربنا مسبكش ولا نسيك يا صاحبي. خمس آيات كفيلة تروق دمك وتخليك تقوم كلك طاقة ونور.',
    actionText: 'قراءة سورة الضحى فوراً',
    actionType: 'quran',
    targetSurahNumber: 93,
  },
  {
    id: 103,
    mood: 'lazy_quran',
    title: 'يا راجل ده الحرف بحسنة والحسنة بعشر أمثالها!',
    badge: 'تجارة مضمونة مع ربنا',
    egyptianText: 'بتضيع ساعات على الريلز والفيسبوك، وجاي عند كلام ربنا وتقول بكرة وبعده؟ تخيل "بسم الله الرحمن الرحيم" لوحدها ١٩ حرف في ١٠ يعني ١٩٠ حسنة! قوم يلا متخليش يومك يعدي أبيض من غير بصمة في كتابك.',
    actionText: 'تصفح المصحف الشريف الآن',
    actionType: 'mushaf',
  },
  {
    id: 104,
    mood: 'lazy_quran',
    title: 'سورة الملك قبل ما تنام بتشفع لصاحبها',
    badge: 'أمان القبر والمنام',
    egyptianText: 'متقفلش عينك النهاردة من غير ما تقرأ سورة الملك، دي المانعة والمنجية من عذاب القبر. خليها عادتك كل ليلة زي شرب المية، وهتدعي لنفسك يوم القيامة لما تلاقيها واقفة تحاميلك وتدافع عنك.',
    actionText: 'قراءة سورة الملك (المنجية)',
    actionType: 'quran',
    targetSurahNumber: 67,
  },

  // 2. مضغوط ومخنوق ومحتاج أهدى
  {
    id: 201,
    mood: 'stressed',
    title: 'ولا تشيل في نفسك يا سيدي.. مدبرها حكيم وكريم',
    badge: 'راحة بال وفك ضيقة',
    egyptianText: 'قسماً برب العزة ما في حاجة في الدنيا دي تستاهل تحرق دمك وتضيق خلقك. ربك اللي شق البحر لموسى وطلع يوسف من قاع البير وجعله عزيز مصر، قادر يحل مشكلتك بكلمة "كُن". سيبها عليه وقول: "يا رب فوضت أمري إليك".',
    actionText: 'سبّح واستغفر على السبحة',
    actionType: 'tasbeeh',
    dhikrPhrase: 'لَا حَوْلَ وَلَا قُوَّةَ إِلَّا بِاللَّهِ الْعَلِيِّ الْعَظِيمِ',
  },
  {
    id: 202,
    mood: 'stressed',
    title: 'سر فك الكرب: ردد الكنز ده بقلب حاضر',
    badge: 'كنز من كنوز الجنة',
    egyptianText: 'حاسس بضيق في صدرك؟ خد نفس عميق وقولها عشر مرات من جواك: "لا حول ولا قوة إلا بالله العلي العظيم". دي مش مجرد كلمة، دي اعتراف إنك معندكش حيلة بس عند ربنا كل القوة والحلول. فك التكشيرة كده وابتسم!',
    actionText: 'ترديد لا حول ولا قوة إلا بالله',
    actionType: 'tasbeeh',
    dhikrPhrase: 'لَا حَوْلَ وَلَا قُوَّةَ إِلَّا بِاللَّهِ',
  },
  {
    id: 203,
    mood: 'stressed',
    title: 'اسمع سورة يس وسبّح بنية الفرج',
    badge: 'يس لما قُرئت له',
    egyptianText: 'سيدنا النبي ﷺ علمنا إن القرآن شفاء لما في الصدور. لما تحس الدنيا داست عليك، افتح سورة يس وشغلها بصوت هادي، واقعد اسمع وسيب الآيات تنزل برداً وسلاماً على قلبك وتطرد كل وسواس وهم.',
    actionText: 'الاستماع لسورة يس بخشوع',
    actionType: 'quran',
    targetSurahNumber: 36,
  },

  // 3. واحشني عمامي وأهلي الغاليين
  {
    id: 301,
    mood: 'missing_uncles',
    title: 'عمامك الكرام مستنيين هديتك دلوقتي في قبورهم',
    badge: 'بر ومحبة للأرواح الغالية',
    egyptianText: 'عارف الميت بيبقى مستني الدعوة من الحي زي الغريق اللي مستني طوق النجاة. عمامك الغاليين (رمضان، والشهاوي، والشافعي، وأحمد) فرحانين بيك أوي وبكل تسبيحة بتهديها ليهم. ارفع إيدك وادعي لهم بالرحمة والمغفرة ونور القبر.',
    actionText: 'إهداء ثواب ودعاء لعمامك',
    actionType: 'dedications',
  },
  {
    id: 302,
    mood: 'missing_uncles',
    title: 'هديتك بتوصلهم نور ورياحين.. متقطعش الزيارة',
    badge: 'صلة رحم ممتدة بالدعاء',
    egyptianText: 'الوفاء طبع ولاد الأصول.. وأنت بزيارتك وقراءتك هنا بتعمل أعظم صدقة جارية واصلة ليهم. الملائكة بتدخل عليهم بطبق من نور وتقولهم: "هذه هدية فلان لكم"، تخيل فرحتهم بيك ساعتها عامية إزاي!',
    actionText: 'قراءة أدعية المتوفين المأثورة',
    actionType: 'duas',
  },

  // 4. حاسس بتقصير وذنوب وعايز أبدأ جديد
  {
    id: 401,
    mood: 'seeking_forgiveness',
    title: 'مفيش أحن من ربنا عليك.. دمعة واحدة تمسح اللي فات',
    badge: 'توبة واستغفار أبيض',
    egyptianText: 'مهما عملت أو غلطت، اوعى تصدق الشيطان لما يقولك "خلاص أنت خربتها ومفيش فايدة". ربك بيفرح بتوبتك أكتر من فرحة واحد لقى ناقته في صحراء بعد ما ضاعت منه! قول من قلبك: "أستغفر الله العظيم وأتوب إليه" وابدأ صفحة بيضا ناصعة.',
    actionText: '١٠٠ استغفار على السبحة فوراً',
    actionType: 'tasbeeh',
    dhikrPhrase: 'أَسْتَغْفِرُ اللَّهَ الْعَظِيمَ وَأَتُوبُ إِلَيْهِ',
  },
  {
    id: 402,
    mood: 'seeking_forgiveness',
    title: 'سيد الاستغفار: لو قولته ومت الليلة دخلت الجنة',
    badge: 'ضمان نبوي شريف',
    egyptianText: 'احفظ الدعاء ده وكرره: "اللهم أنت ربي لا إله إلا أنت، خلقتني وأنا عبدك، وأنا على عهدك ووعدك ما استطعت.. أبوء لك بنعمتك علي وأبوء بذنبي فاغفر لي فإنه لا يغفر الذنوب إلا أنت". دعاء يهز الجبال ويطهر القلوب.',
    actionText: 'فتح أذكار الصباح والمساء',
    actionType: 'adhkar',
  },

  // 5. فرحان وعايز أشكر ربنا من قلبي
  {
    id: 501,
    mood: 'grateful',
    title: 'يا بخت اللي بيفرح وبيفتكر المنعم ويشكره!',
    badge: 'قيد النعم بالشكر',
    egyptianText: 'الناس أغلبها بتفتكر ربنا وقت الزنقة بس، وأنت بجدعنتك بتفتكره وأنت فرحان ومرتاح.. وده دليل على أصالة قلبك. "لئن شكرتم لأزيدنكم"، بوس إيدك وش وضهر وقول: "الحمد لله ملء السماوات والأرض وما بينهما".',
    actionText: 'تسبيح الحمد والشكر لله',
    actionType: 'tasbeeh',
    dhikrPhrase: 'الْحَمْدُ لِلَّهِ رَبِّ الْعَالَمِينَ حَمْدًا كَثِيرًا',
  },
  {
    id: 502,
    mood: 'grateful',
    title: 'شارك فرحتك بهدية ثواب للأرواح الغالية',
    badge: 'فرحة موصولة بالخير',
    egyptianText: 'أحلى حاجة تعملها وأنت مبسوط، إنك تدخّل السرور على غيرك. اقرأ جزء أو سورة واهدِ ثوابها لأهلك وعمامك، وادعي ربنا يديم عليك نعمة الستر وراحة البال والرضا.',
    actionText: 'إهداء ثواب سورة مباركة',
    actionType: 'dedications',
  },

  // 6. نصيحة عشوائية ع الماشي
  {
    id: 601,
    mood: 'random_nudge',
    title: 'صلي على النبي يا سيدي.. البركة كلها في الصلاة عليه',
    badge: 'مفتاح الفرج الأكبر',
    egyptianText: 'الصلاة على سيدنا النبي ﷺ بتكفي همك ويُغفر ذنبك ويُقضى دينك. صلي عليه عشر مرات دلوقتي بصوت واطي وأنت قاعد: "اللهم صلِّ وسلم وبارك على سيدنا محمد وعلى آله وصحبه أجمعين".',
    actionText: 'الصلاة على النبي بالسبحة',
    actionType: 'tasbeeh',
    dhikrPhrase: 'اللَّهُمَّ صَلِّ وَسَلِّمْ عَلَى سَيِّدِنَا مُحَمَّدٍ',
  },
  {
    id: 602,
    mood: 'random_nudge',
    title: 'كلمتين خفيفتين على اللسان، ثقيلتين في الميزان',
    badge: 'حبيبتان إلى الرحمن',
    egyptianText: 'سيدنا النبي قال لنا عليهم وصية غالية: "سُبْحَانَ اللَّهِ وَبِحَمْدِهِ، سُبْحَانَ اللَّهِ الْعَظِيمِ". قولهما دايماً وأنت ماشي، وأنت سايق، وأنت شغال.. جبال حسنات بتتبني في ميزانك وأنت مش واخد بالك.',
    actionText: 'تسبيح سبحان الله وبحمده',
    actionType: 'tasbeeh',
    dhikrPhrase: 'سُبْحَانَ اللَّهِ وَبِحَمْدِهِ سُبْحَانَ اللَّهِ الْعَظِيمِ',
  },
  {
    id: 603,
    mood: 'random_nudge',
    title: 'خلي لسانك رطب دايماً.. أنت الكسبان في الآخر',
    badge: 'وصية من دهب',
    egyptianText: 'الدنيا دي رحلة سريعة جداً زي طرفة عين، وكل اللي هتاخده معاك هو عملك الصالح والذكر اللي في ميزانك. متعديش ساعة من غير ما تذكر ربنا أو تعمل حركة خير في بيتك وشغلك.',
    actionText: 'تصفح أدعية وحصن المسلم',
    actionType: 'adhkar',
  },
];

/**
 * Get an entry by mood or random
 */
export function getEgyptianEntryByMood(mood: EgyptianMoodKey, excludeId?: number): EgyptianCompanionEntry {
  const filtered = EGYPTIAN_COMPANION_ENTRIES.filter(
    (e) => (mood === 'random_nudge' ? true : e.mood === mood) && e.id !== excludeId
  );
  if (filtered.length === 0) {
    return EGYPTIAN_COMPANION_ENTRIES[0];
  }
  const idx = Math.floor(Math.random() * filtered.length);
  return filtered[idx];
}
