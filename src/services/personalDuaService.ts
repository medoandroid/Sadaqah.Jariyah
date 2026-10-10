import { PersonalDua } from '../types';
import { storageService } from './storageService';
import { sanitizeBoundedText } from '../utils/security';

const STORAGE_KEY = 'sadaqah_personal_duas_list';

const INITIAL_STARTER_DUAS: PersonalDua[] = [
  {
    id: 'starter-1',
    title: 'دعاء جامع بالمغفرة والرحمة لعمامي الأربعة',
    text: 'اللَّهُمَّ اغْفِرْ لِعَمَامِي الأَرْبَعَةِ (رَمَضَانَ، وَالشَّهَاوِي، وَالشَّافِعِيِّ، وَأَحْمَدَ) وَارْحَمْهُمْ رَحْمَةً وَاسِعَةً مِلْءَ السَّمَاوَاتِ وَالأَرْضِ. اللَّهُمَّ عَافِهِمْ وَاعْفُ عَنْهُمْ، وَأَكْرِمْ نُزُلَهُمْ، وَوَسِّعْ مُدْخَلَهُمْ، وَاغْسِلْهُمْ بِمَاءِ الثَّلْجِ وَالْبَرَدِ، وَنَقِّهِمْ مِنَ الخَطَايَا كَمَا يُنَقَّى الثَّوْبُ الأَبْيَضُ مِنَ الدَّنَسِ. اللَّهُمَّ اجْعَلْ قُبُورَهُمْ رَوْضَةً مِنْ رِيَاضِ الجَنَّةِ، وَامْلأْهَا نُوراً وَضِيَاءً وَفُسْحَةً وَسُرُوراً، وَاجْمَعْنَا بِهِمْ فِي الفِرْدَوْسِ الأَعْلَى مِنْ غَيْرِ سَابِقَةِ عَذَابٍ وَلا حِسَابٍ.',
    category: 'الأموات والأرحام',
    targetPerson: 'عمامي الأربعة رحمهم الله',
    createdAt: Date.now() - 1000 * 60 * 60 * 24 * 3,
    isFavorite: true,
    reciteCount: 12,
  },
  {
    id: 'starter-2',
    title: 'مناجاة واستغفار في جوف الليل',
    text: 'اللَّهُمَّ أَنْتَ رَبِّي لا إِلَهَ إِلا أَنْتَ، خَلَقْتَنِي وَأَنَا عَبْدُكَ، وَأَنَا عَلَى عَهْدِكَ وَوَعْدِكَ مَا اسْتَطَعْتُ، أَعُوذُ بِكَ مِنْ شَرِّ مَا صَنَعْتُ، أَبُوءُ لَكَ بِنِعْمَتِكَ عَلَيَّ وَأَبُوءُ بِذَنْبِي فَاغْفِرْ لِي فَإِنَّهُ لا يَغْفِرُ الذُّنُوبَ إِلا أَنْتَ. اللَّهُمَّ يَا فَاِرجَ الهَمِّ، وَيَا كَاشِفَ الغَمِّ، فَرِّجْ هَمِّي وَيَسِّرْ أَمْرِي وَارْحَمْ ضَعْفِي وَقِلَّةَ حِيلَتِي.',
    category: 'الاستغفار والمناجاة',
    targetPerson: 'لنفسي ووالديّ',
    createdAt: Date.now() - 1000 * 60 * 60 * 24 * 2,
    isFavorite: false,
    reciteCount: 7,
  },
  {
    id: 'starter-3',
    title: 'دعاء بر الوالدين والأهل والأحباب',
    text: 'رَبِّ اغْفِرْ لِي وَلِوَالِدَيَّ وَارْحَمْهُمَا كَمَا رَبَّيَانِي صَغِيراً. اللَّهُمَّ اجْزِهِمَا عَنِّي خَيْرَ الجَزَاءِ وَأَوْفَرَهُ، وَأَسْبِغْ عَلَيْهِمَا نِعَمَكَ ظَاهِرَةً وَبَاطِنَةً، وَبَارِكْ فِي أَعْمَارِهِمَا وَأَعْمَالِهِمَا، وَاجْعَلْهُمَا مِنْ سُعَدَاءِ الدُّنْيَا وَالآخِرَةِ.',
    category: 'بر الوالدين',
    targetPerson: 'لوالديّ وأهلي',
    createdAt: Date.now() - 1000 * 60 * 60 * 24,
    isFavorite: true,
    reciteCount: 5,
  },
];

export const personalDuaService = {
  getPersonalDuas(): PersonalDua[] {
    const saved = storageService.get<PersonalDua[]>(STORAGE_KEY, []);
    if (saved && Array.isArray(saved) && saved.length > 0) {
      return saved;
    }
    // Initialize with pious starter templates on first use
    storageService.set(STORAGE_KEY, INITIAL_STARTER_DUAS);
    return INITIAL_STARTER_DUAS;
  },

  savePersonalDua(data: {
    title: string;
    text: string;
    category?: string;
    targetPerson?: string;
  }): PersonalDua {
    const list = this.getPersonalDuas();
    const cleanTitle = sanitizeBoundedText(data.title, 120) || 'دعاء مبارك';
    const cleanText = sanitizeBoundedText(data.text, 2500);
    const cleanCategory = sanitizeBoundedText(data.category, 60) || 'دعاء خاص';
    const cleanTarget = sanitizeBoundedText(data.targetPerson, 80) || 'عام';

    const newDua: PersonalDua = {
      id: `mydua-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`,
      title: cleanTitle,
      text: cleanText,
      category: cleanCategory,
      targetPerson: cleanTarget,
      createdAt: Date.now(),
      isFavorite: false,
      reciteCount: 0,
    };

    const updated = [newDua, ...list];
    storageService.set(STORAGE_KEY, updated);
    return newDua;
  },

  updatePersonalDua(
    id: string,
    updates: Partial<Pick<PersonalDua, 'title' | 'text' | 'category' | 'targetPerson'>>
  ): boolean {
    const list = this.getPersonalDuas();
    const index = list.findIndex((d) => d.id === id);
    if (index === -1) return false;

    const sanitizedUpdates: Partial<Pick<PersonalDua, 'title' | 'text' | 'category' | 'targetPerson'>> = {};
    if (updates.title !== undefined) sanitizedUpdates.title = sanitizeBoundedText(updates.title, 120);
    if (updates.text !== undefined) sanitizedUpdates.text = sanitizeBoundedText(updates.text, 2500);
    if (updates.category !== undefined) sanitizedUpdates.category = sanitizeBoundedText(updates.category, 60);
    if (updates.targetPerson !== undefined) sanitizedUpdates.targetPerson = sanitizeBoundedText(updates.targetPerson, 80);

    list[index] = {
      ...list[index],
      ...sanitizedUpdates,
      updatedAt: Date.now(),
    };

    storageService.set(STORAGE_KEY, list);
    return true;
  },

  deletePersonalDua(id: string): boolean {
    const list = this.getPersonalDuas();
    const filtered = list.filter((d) => d.id !== id);
    storageService.set(STORAGE_KEY, filtered);
    return true;
  },

  toggleFavorite(id: string): boolean {
    const list = this.getPersonalDuas();
    const item = list.find((d) => d.id === id);
    if (!item) return false;

    item.isFavorite = !item.isFavorite;
    storageService.set(STORAGE_KEY, list);
    return item.isFavorite;
  },

  incrementReciteCount(id: string): number {
    const list = this.getPersonalDuas();
    const item = list.find((d) => d.id === id);
    if (!item) return 0;

    item.reciteCount = (item.reciteCount || 0) + 1;
    storageService.set(STORAGE_KEY, list);
    return item.reciteCount;
  },

  exportAllAsText(): string {
    const list = this.getPersonalDuas();
    if (list.length === 0) return 'لا توجد أدعية مسجلة حالياً.';

    return list
      .map(
        (dua, idx) =>
          `[${idx + 1}] ${dua.title} (${dua.category})\nالمقصود بالدعاء: ${dua.targetPerson || 'عام'}\n\n«${dua.text}»\n----------------------------------------`
      )
      .join('\n\n');
  },
};
