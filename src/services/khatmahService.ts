import { KhatmahJuz } from '../types';
import { recordDedication } from './dedicationService';

const JUZ_METADATA: { name: string; startSurah: string }[] = [
  { name: 'الجزء الأول', startSurah: 'الفاتحة - البقرة ١٤١' },
  { name: 'الجزء الثاني', startSurah: 'البقرة ١٤٢ - البقرة ٢٥٢' },
  { name: 'الجزء الثالث', startSurah: 'البقرة ٢٥٣ - آل عمران ٩٢' },
  { name: 'الجزء الرابع', startSurah: 'آل عمران ٩٣ - النساء ٢٣' },
  { name: 'الجزء الخامس', startSurah: 'النساء ٢٤ - النساء ١٤٧' },
  { name: 'الجزء السادس', startSurah: 'النساء ١٤٨ - المائدة ٨١' },
  { name: 'الجزء السابع', startSurah: 'المائدة ٨٢ - الأنعام ١١٠' },
  { name: 'الجزء الثامن', startSurah: 'الأنعام ١١١ - الأعراف ٨٧' },
  { name: 'الجزء التاسع', startSurah: 'الأعراف ٨٨ - الأنفال ٤٠' },
  { name: 'الجزء العاشر', startSurah: 'الأنفال ٤١ - التوبة ٩٢' },
  { name: 'الجزء الحادي عشر', startSurah: 'التوبة ٩٣ - هود ٥' },
  { name: 'الجزء الثاني عشر', startSurah: 'هود ٦ - يوسف ٥٢' },
  { name: 'الجزء الثالث عشر', startSurah: 'يوسف ٥٣ - إبراهيم ٥٢' },
  { name: 'الجزء الرابع عشر', startSurah: 'الحجر ١ - النحل ١٢٨' },
  { name: 'الجزء الخامس عشر', startSurah: 'الإسراء ١ - الكهف ٧٤' },
  { name: 'الجزء السادس عشر', startSurah: 'الكهف ٧٥ - طه ١٣٥' },
  { name: 'الجزء السابع عشر', startSurah: 'الأنبياء ١ - الحج ٧٨' },
  { name: 'الجزء الثامن عشر', startSurah: 'المؤمنون ١ - الفرقان ٢٠' },
  { name: 'الجزء التاسع عشر', startSurah: 'الفرقان ٢١ - النمل ٥٥' },
  { name: 'الجزء العشرون', startSurah: 'النمل ٥٦ - العنكبوت ٤٥' },
  { name: 'الجزء الحادي والعشرون', startSurah: 'العنكبوت ٤٦ - الأحزاب ٣٠' },
  { name: 'الجزء الثاني والعشرون', startSurah: 'الأحزاب ٣١ - يس ٢٧' },
  { name: 'الجزء الثالث والعشرون', startSurah: 'يس ٢٨ - الزمر ٣١' },
  { name: 'الجزء الرابع والعشرون', startSurah: 'الزمر ٣٢ - فصلت ٤٦' },
  { name: 'الجزء الخامس والعشرون', startSurah: 'فصلت ٤٧ - الجاثية ٣٧' },
  { name: 'الجزء السادس والعشرون', startSurah: 'الأحقاف ١ - الذاريات ٣٠' },
  { name: 'الجزء السابع والعشرون', startSurah: 'الذاريات ٣١ - الحديد ٢٩' },
  { name: 'الجزء الثامن والعشرون', startSurah: 'المجادلة ١ - التحريم ١٢' },
  { name: 'الجزء التاسع والعشرون', startSurah: 'الملك ١ - المرسلات ٥٠' },
  { name: 'الجزء الثلاثون', startSurah: 'النبأ ١ - الناس ٦' },
];

function generateDefaultKhatmah(): KhatmahJuz[] {
  return JUZ_METADATA.map((j, idx) => {
    // seed initial some completed/reserved to make it feel actively alive!
    let status: KhatmahJuz['status'] = 'available';
    let readerName = '';
    let completedAt: number | undefined = undefined;

    if (idx === 0) {
      status = 'completed';
      readerName = 'محمد أيمن';
      completedAt = Date.now() - 1000 * 60 * 60 * 5;
    } else if (idx === 17) {
      status = 'completed';
      readerName = 'فاعل خير';
      completedAt = Date.now() - 1000 * 60 * 60 * 12;
    } else if (idx === 29) {
      status = 'completed';
      readerName = 'محب للخير';
      completedAt = Date.now() - 1000 * 60 * 60 * 2;
    } else if (idx === 35) {
      status = 'reserved';
      readerName = 'عبدالله الشهاوي';
    }

    return {
      juzNumber: idx + 1,
      name: j.name,
      startSurah: j.startSurah,
      status,
      readerName,
      completedAt,
      dedicatedToId: 'all',
    };
  });
}

export function getKhatmahData(): KhatmahJuz[] {
  try {
    const raw = localStorage.getItem('sadaqah_khatmah_data');
    if (raw) {
      return JSON.parse(raw);
    }
  } catch (e) {}

  const defaults = generateDefaultKhatmah();
  try {
    localStorage.setItem('sadaqah_khatmah_data', JSON.stringify(defaults));
  } catch (e) {}
  return defaults;
}

export function reserveJuz(
  juzNumber: number,
  readerName: string,
  dedicatedToId: string = 'all'
): boolean {
  try {
    const data = getKhatmahData();
    const juz = data.find((j) => j.juzNumber === juzNumber);
    if (!juz || juz.status === 'completed') return false;

    juz.status = 'reserved';
    juz.readerName = readerName.trim() || 'فاعل خير';
    juz.reservedAt = Date.now();
    juz.dedicatedToId = dedicatedToId;

    localStorage.setItem('sadaqah_khatmah_data', JSON.stringify(data));
    return true;
  } catch (e) {
    console.error('Error reserving juz:', e);
    return false;
  }
}

export function completeJuz(juzNumber: number): boolean {
  try {
    const data = getKhatmahData();
    const juz = data.find((j) => j.juzNumber === juzNumber);
    if (!juz) return false;

    juz.status = 'completed';
    juz.completedAt = Date.now();

    localStorage.setItem('sadaqah_khatmah_data', JSON.stringify(data));

    // Record dedication
    recordDedication(
      'khatmah',
      `إتمام قراءة ${juz.name}`,
      juz.dedicatedToId || 'all',
      1,
      juz.readerName || 'فاعل خير'
    );

    return true;
  } catch (e) {
    console.error('Error completing juz:', e);
    return false;
  }
}

export function resetKhatmah(): KhatmahJuz[] {
  const defaults = JUZ_METADATA.map((j, idx) => ({
    juzNumber: idx + 1,
    name: j.name,
    startSurah: j.startSurah,
    status: 'available' as const,
    readerName: '',
    dedicatedToId: 'all',
  }));
  try {
    localStorage.setItem('sadaqah_khatmah_data', JSON.stringify(defaults));
  } catch (e) {}
  return defaults;
}
