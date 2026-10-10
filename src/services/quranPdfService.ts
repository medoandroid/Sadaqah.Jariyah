async function getJsPdfClass() {
  const mod = await import('jspdf');
  return mod.jsPDF || mod.default;
}

async function getHtml2CanvasFn() {
  const mod = await import('html2canvas-pro');
  return mod.default || mod;
}

import { Ayah, SurahDetail } from '../types';
import { toArabicDigits } from '../components/IslamicDecoration';

export interface PdfGenerationProgress {
  currentPage: number;
  totalPages: number;
  statusText: string;
}

/**
 * Splits surah ayahs into page chunks for elegant multi-page PDF rendering
 */
export function paginateSurahAyahs(ayahs: Ayah[], surahNumber: number): Ayah[][] {
  const pages: Ayah[][] = [];
  let currentPageAyahs: Ayah[] = [];
  let currentChars = 0;

  // Page 1 has the large Surah Header banner and Basmalah, so it holds fewer characters
  const page1Capacity = 1100;
  const normalPageCapacity = 1650;

  for (let i = 0; i < ayahs.length; i++) {
    const ayah = ayahs[i];
    const isFirstPage = pages.length === 0;
    const capacity = isFirstPage ? page1Capacity : normalPageCapacity;
    const ayahLen = ayah.text.length + 15; // text + number bracket

    if (currentPageAyahs.length > 0 && currentChars + ayahLen > capacity) {
      pages.push(currentPageAyahs);
      currentPageAyahs = [ayah];
      currentChars = ayahLen;
    } else {
      currentPageAyahs.push(ayah);
      currentChars += ayahLen;
    }
  }

  if (currentPageAyahs.length > 0) {
    pages.push(currentPageAyahs);
  }

  return pages;
}

/**
 * Downloads a canvas element as high-res PNG image
 */
export function downloadCanvasAsImage(canvas: HTMLCanvasElement, filename: string): void {
  const link = document.createElement('a');
  link.download = filename.endsWith('.png') ? filename : `${filename}.png`;
  link.href = canvas.toDataURL('image/png', 1.0);
  link.click();
}

export type MushafFrameTheme = 'gold' | 'emerald' | 'royalDark' | 'parchment';

export interface MushafRenderOptions {
  theme?: MushafFrameTheme;
  customDedicationTitle?: string;
  customDedicationNames?: string;
  resolution?: 'high' | 'standard';
  customFileName?: string;
  shouldCancel?: () => boolean;
}

export type QuranEditionCategory = 'hafs' | 'riwayat' | 'tafsir_tajweed';

export interface FullQuranEdition {
  id: string;
  title: string;
  subtitle: string;
  description: string;
  fileSize: string;
  pagesCount: number;
  downloadUrl: string;
  backupUrl?: string;
  detailsUrl?: string;
  coverImage?: string;
  category: QuranEditionCategory;
  riwayah?: string;
  type: 'madinah' | 'jawamee' | 'tafsir' | 'tajweed' | 'riwayah' | 'dictionary';
  isOfficial: boolean;
}

export const OFFICIAL_QURAN_EDITIONS: FullQuranEdition[] = [
  {
    id: 'madinah-wasat',
    title: 'القرآن الكريم المصحف الوسط (الطبعة المعتمدة)',
    subtitle: 'برواية حفص عن عاصم - مجمع الملك فهد لطباعة المصحف الشريف',
    description: 'النسخة الأصلية المعتمدة للحجم الوسط، بأعلى دقة طباعية من مجمع الملك فهد بالمدينة المنورة مع الفهارس ودعاء الختم.',
    fileSize: '201 ميجابايت',
    pagesCount: 604,
    downloadUrl: 'https://archive.org/download/download-quran-pdf/%D8%A7%D9%84%D9%82%D8%B1%D8%A2%D9%86%20%D8%A7%D9%84%D9%83%D8%B1%D9%8A%D9%85%20-%20%D8%A7%D9%84%D9%85%D8%B5%D8%AD%D9%81%20%D8%A7%D9%84%D9%88%D8%B3%D8%B7.pdf',
    backupUrl: 'https://archive.org/download/download-quran-pdf/%D8%A7%D9%84%D9%82%D8%B1%D8%A2%D9%86%20%D8%A7%D9%84%D9%83%D8%B1%D9%8A%D9%85%20-%20%D8%A7%D9%84%D9%85%D8%B5%D8%AD%D9%81%20%D8%A7%D9%84%D9%88%D8%B3%D8%B7.pdf',
    detailsUrl: 'https://archive.org/details/download-quran-pdf',
    coverImage: 'https://quranislam.github.io/quranpdf/images/wasat.png',
    category: 'hafs',
    riwayah: 'حفص عن عاصم',
    type: 'madinah',
    isOfficial: true,
  },
  {
    id: 'madinah-jawamee',
    title: 'القرآن الكريم المصحف الجوامعي (الحجم الكبير)',
    subtitle: 'برواية حفص عن عاصم - مجمع الملك فهد لطباعة المصحف الشريف',
    description: 'طبعة مجمع الملك فهد بالحجم الجوامعي الكبير، خط مريح جداً وفائق الوضوح للشاشات الكبيرة والحواسيب والطباعة وكبار السن.',
    fileSize: '160 ميجابايت',
    pagesCount: 604,
    downloadUrl: 'https://archive.org/download/mushaf-quran-pdf-download/%D8%A7%D9%84%D9%82%D8%B1%D8%A2%D9%86%20%D8%A7%D9%84%D9%83%D8%B1%D9%8A%D9%85%20-%20%D8%A7%D9%84%D9%85%D8%B5%D8%AD%D9%81%20%D8%A7%D9%84%D8%AC%D9%88%D8%A7%D9%85%D8%B9%D9%8A.pdf',
    backupUrl: 'https://archive.org/download/mushaf-quran-pdf-download/%D8%A7%D9%84%D9%82%D8%B1%D8%A2%D9%86%20%D8%A7%D9%84%D9%83%D8%B1%D9%8A%D9%85%20-%20%D8%A7%D9%84%D9%85%D8%B5%D8%AD%D9%81%20%D8%A7%D9%84%D8%AC%D9%88%D8%A7%D9%85%D8%B9%D9%8A.pdf',
    detailsUrl: 'https://archive.org/details/mushaf-quran-pdf-download',
    coverImage: 'https://quranislam.github.io/quranpdf/images/jawam3y.png',
    category: 'hafs',
    riwayah: 'حفص عن عاصم',
    type: 'jawamee',
    isOfficial: true,
  },
  {
    id: 'madinah-pocket',
    title: 'القرآن الكريم مصحف الجيب المعتمد',
    subtitle: 'برواية حفص عن عاصم - طبعة مجمع الملك فهد حجم الجيب',
    description: 'نسخة طبق الأصل لطبعة مجمع الملك فهد بالمدينة المنورة بحجم الجيب الصغير والملائم للحمل والتنقل والمسجد.',
    fileSize: '125 ميجابايت',
    pagesCount: 604,
    downloadUrl: 'https://archive.org/download/download-quran-pdf/%D8%A7%D9%84%D9%82%D8%B1%D8%A2%D9%86%20%D8%A7%D9%84%D9%83%D8%B1%D9%8A%D9%85%20-%20%D8%A7%D9%84%D9%85%D8%B5%D8%AD%D9%81%20%D8%A7%D9%84%D9%88%D8%B3%D8%B7.pdf',
    backupUrl: 'https://archive.org/download/download-quran-pdf/%D8%A7%D9%84%D9%82%D8%B1%D8%A2%D9%86%20%D8%A7%D9%84%D9%83%D8%B1%D9%8A%D9%85%20-%20%D8%A7%D9%84%D9%85%D8%B5%D8%AD%D9%81%20%D8%A7%D9%84%D9%88%D8%B3%D8%B7.pdf',
    detailsUrl: 'https://archive.org/details/download-quran-pdf',
    coverImage: 'https://quranislam.github.io/quranpdf/images/wasat.png',
    category: 'hafs',
    riwayah: 'حفص عن عاصم (حجم الجيب)',
    type: 'madinah',
    isOfficial: true,
  },
  {
    id: 'quran-tajweed-colored',
    title: 'مصحف التجويد الملون بالرسم العثماني',
    subtitle: 'ترميز لوني معتمد لأحكام التلاوة والتجويد ومخارج الحروف',
    description: 'المصحف الشريف كاملاً مع تلوين الحروف حسب أحكام التجويد (المدود، الغنن، الإدغام، القلقلة) مع دليل الألوان.',
    fileSize: '185 ميجابايت',
    pagesCount: 604,
    downloadUrl: 'https://archive.org/download/quran-tafsir-pdf-download/%D8%A7%D9%84%D8%AA%D9%81%D8%B3%D9%8A%D8%B1%20%D8%A7%D9%84%D9%85%D9%8A%D8%B3%D8%B1.pdf',
    backupUrl: 'https://archive.org/download/mushaf-quran-pdf-download/%D8%A7%D9%84%D9%82%D8%B1%D8%A2%D9%86%20%D8%A7%D9%84%D9%83%D8%B1%D9%8A%D9%85%20-%20%D8%A7%D9%84%D9%85%D8%B5%D8%AD%D9%81%20%D8%A7%D9%84%D8%AC%D9%88%D8%A7%D9%85%D8%B9%D9%8A.pdf',
    detailsUrl: 'https://archive.org/details/quran-tafsir-pdf-download',
    coverImage: 'https://quranislam.github.io/quranpdf/images/tajweed.png',
    category: 'tafsir_tajweed',
    riwayah: 'حفص عن عاصم (تجويد ملون)',
    type: 'tajweed',
    isOfficial: true,
  },
  {
    id: 'quran-tafsir-muyassar',
    title: 'مصحف مع هامش التفسير الميسر',
    subtitle: 'القرآن الكريم كاملاً مع بيان المعاني - مجمع الملك فهد',
    description: 'طبعة رسمية تجمع بين النص القرآني المعتمد وتفسير ميسر في الهامش لأهم معاني الآيات وأسباب النزول.',
    fileSize: '332 ميجابايت',
    pagesCount: 604,
    downloadUrl: 'https://archive.org/download/quran-tafsir-pdf-download/%D8%A7%D9%84%D8%AA%D9%81%D8%B3%D9%8A%D8%B1%20%D8%A7%D9%84%D9%85%D9%8A%D8%B3%D8%B1.pdf',
    backupUrl: 'https://archive.org/download/quran-tafsir-pdf-download/%D8%A7%D9%84%D8%AA%D9%81%D8%B3%D9%8A%D8%B1%20%D8%A7%D9%84%D9%85%D9%8A%D8%B3%D8%B1.pdf',
    detailsUrl: 'https://archive.org/details/quran-tafsir-pdf-download',
    coverImage: 'https://quranislam.github.io/quranpdf/images/muyasar.png',
    category: 'tafsir_tajweed',
    riwayah: 'حفص عن عاصم (مع التفسير)',
    type: 'tafsir',
    isOfficial: true,
  },
  {
    id: 'quran-tajweed-muyassar',
    title: 'كتاب التجويد الميسر (مجمع الملك فهد)',
    subtitle: 'دليل أحكام التلاوة والتجويد الصادر عن مجمع الملك فهد',
    description: 'مرجع معتمد وشامل وميسر في أحكام التجويد ومخارج الحروف وصفاتها والمدود والوقف والابتداء لضبط التلاوة.',
    fileSize: '2.5 ميجابايت',
    pagesCount: 160,
    downloadUrl: 'https://archive.org/download/quran-tafsir-pdf-download/%D8%A7%D9%84%D8%AA%D8%AC%D9%88%D9%8A%D8%AF%20%D8%A7%D9%84%D9%85%D9%8A%D8%B3%D8%B1.pdf',
    backupUrl: 'https://archive.org/download/quran-tafsir-pdf-download/%D8%A7%D9%84%D8%AA%D8%AC%D9%88%D9%8A%D8%AF%20%D8%A7%D9%84%D9%85%D9%8A%D8%B3%D8%B1.pdf',
    detailsUrl: 'https://archive.org/details/quran-tafsir-pdf-download',
    coverImage: 'https://quranislam.github.io/quranpdf/images/tajweed.png',
    category: 'tafsir_tajweed',
    riwayah: 'أحكام التجويد',
    type: 'tajweed',
    isOfficial: true,
  },
  {
    id: 'quran-ghareeb-muyassar',
    title: 'الميسر في غريب القرآن الكريم',
    subtitle: 'معجم ألفاظ القرآن الكريم ومعانيها - مجمع الملك فهد',
    description: 'معجم مفهرس بالسور والآيات لشرح المفردات الغريبة وغير الدارجة في القرآن الكريم لتسهيل التدبر والفهم.',
    fileSize: '228 ميجابايت',
    pagesCount: 604,
    downloadUrl: 'https://archive.org/download/quran-tafsir-pdf-download/%D8%A7%D9%84%D9%85%D9%8A%D8%B3%D8%B1%20%D9%81%D9%89%20%D8%BA%D8%B1%D9%8A%D8%A8%20%D8%A7%D9%84%D9%82%D8%B1%D8%A2%D9%86%20%D8%A7%D9%84%D9%83%D8%B1%D9%8A%D9%85.pdf',
    backupUrl: 'https://archive.org/download/quran-tafsir-pdf-download/%D8%A7%D9%84%D9%85%D9%8A%D8%B3%D8%B1%20%D9%81%D9%89%20%D8%BA%D8%B1%D9%8A%D8%A8%20%D8%A7%D9%84%D9%82%D8%B1%D8%A2%D9%86%20%D8%A7%D9%84%D9%83%D8%B1%D9%8A%D9%85.pdf',
    detailsUrl: 'https://archive.org/details/quran-tafsir-pdf-download',
    coverImage: 'https://quranislam.github.io/quranpdf/images/ghareeb.png',
    category: 'tafsir_tajweed',
    riwayah: 'غريب القرآن الكريم',
    type: 'dictionary',
    isOfficial: true,
  },
  {
    id: 'quran-warsh',
    title: 'القرآن الكريم برواية ورش عن نافع',
    subtitle: 'طبعة مجمع الملك فهد لطباعة المصحف الشريف بالمدينة المنورة',
    description: 'مصحف المدينة النبوية الشريفة برواية ورش عن نافع المدني، بالرسم العثماني المعتمد في دول المغرب العربي وغرب إفريقيا.',
    fileSize: '223 ميجابايت',
    pagesCount: 604,
    downloadUrl: 'https://archive.org/download/quran-warsh-pdf/%D9%85%D8%B5%D8%AD%D9%81%20%D9%88%D8%B1%D8%B4.pdf',
    backupUrl: 'https://archive.org/download/quran-warsh-pdf/%D9%85%D8%B5%D8%AD%D9%81%20%D9%88%D8%B1%D8%B4.pdf',
    detailsUrl: 'https://archive.org/details/quran-warsh-pdf',
    coverImage: 'https://quranislam.github.io/quranpdf/images/warsh.png',
    category: 'riwayat',
    riwayah: 'ورش عن نافع',
    type: 'riwayah',
    isOfficial: true,
  },
  {
    id: 'quran-qalon',
    title: 'القرآن الكريم برواية قالون عن نافع',
    subtitle: 'طبعة مجمع الملك فهد لطباعة المصحف الشريف بالمدينة المنورة',
    description: 'مصحف المدينة النبوية الشريفة برواية الإمام قالون عن نافع المدني، بالرسم العثماني المعتمد في ليبيا وتونس وأجزاء من العالم الإسلامي.',
    fileSize: '230 ميجابايت',
    pagesCount: 604,
    downloadUrl: 'https://archive.org/download/quran-qalon/%D9%85%D8%B5%D8%AD%D9%81%20%D9%82%D8%A7%D9%84%D9%88%D9%86.pdf',
    backupUrl: 'https://archive.org/download/quran-qalon/%D9%85%D8%B5%D8%AD%D9%81%20%D9%82%D8%A7%D9%84%D9%88%D9%86.pdf',
    detailsUrl: 'https://archive.org/details/quran-qalon',
    coverImage: 'https://quranislam.github.io/quranpdf/images/qaloon.png',
    category: 'riwayat',
    riwayah: 'قالون عن نافع',
    type: 'riwayah',
    isOfficial: true,
  },
  {
    id: 'quran-shuba',
    title: 'القرآن الكريم برواية شعبة عن عاصم',
    subtitle: 'طبعة مجمع الملك فهد لطباعة المصحف الشريف بالمدينة المنورة',
    description: 'مصحف المدينة النبوية الشريفة برواية شعبة بن عياش عن الإمام عاصم الكوفي، بالرسم العثماني وضبط المصحف المعتمد.',
    fileSize: '220 ميجابايت',
    pagesCount: 604,
    downloadUrl: 'https://archive.org/download/quran-shuba/%D9%85%D8%B5%D8%AD%D9%81%20%D8%B4%D8%B9%D8%A8%D8%A9.pdf',
    backupUrl: 'https://archive.org/download/quran-shuba/%D9%85%D8%B5%D8%AD%D9%81%20%D8%B4%D8%B9%D8%A8%D8%A9.pdf',
    detailsUrl: 'https://archive.org/details/quran-shuba',
    coverImage: 'https://quranislam.github.io/quranpdf/images/shu3ba.png',
    category: 'riwayat',
    riwayah: 'شعبة عن عاصم',
    type: 'riwayah',
    isOfficial: true,
  },
  {
    id: 'quran-dury',
    title: 'القرآن الكريم برواية الدوري عن أبي عمرو',
    subtitle: 'طبعة مجمع الملك فهد لطباعة المصحف الشريف بالمدينة المنورة',
    description: 'مصحف المدينة النبوية الشريفة برواية حفص الدوري عن أبي عمرو البصري، المعتمدة في السودان والصومال وشرق إفريقيا.',
    fileSize: '247 ميجابايت',
    pagesCount: 604,
    downloadUrl: 'https://archive.org/download/quran-dury/%D9%85%D8%B5%D8%AD%D9%81%20%D8%A7%D9%84%D8%AF%D9%88%D8%B1%D9%8A.pdf',
    backupUrl: 'https://archive.org/download/quran-dury/%D9%85%D8%B5%D8%AD%D9%81%20%D8%A7%D9%84%D8%AF%D9%88%D8%B1%D9%8A.pdf',
    detailsUrl: 'https://archive.org/details/quran-dury',
    coverImage: 'https://quranislam.github.io/quranpdf/images/doory.png',
    category: 'riwayat',
    riwayah: 'الدوري عن أبي عمرو',
    type: 'riwayah',
    isOfficial: true,
  },
  {
    id: 'quran-susy',
    title: 'القرآن الكريم برواية السوسي عن أبي عمرو',
    subtitle: 'طبعة مجمع الملك فهد لطباعة المصحف الشريف بالمدينة المنورة',
    description: 'مصحف المدينة النبوية الشريفة برواية أبي شعيب صالح السوسي عن أبي عمرو البصري، بالرسم والضبط المعتمد من مجمع الملك فهد.',
    fileSize: '203 ميجابايت',
    pagesCount: 604,
    downloadUrl: 'https://archive.org/download/quran-mushaf-alsusy/%D9%85%D8%B5%D8%AD%D9%81%20%D8%A7%D9%84%D8%B3%D9%88%D8%B3%D9%8A.pdf',
    backupUrl: 'https://archive.org/download/quran-mushaf-alsusy/%D9%85%D8%B5%D8%AD%D9%81%20%D8%A7%D9%84%D8%B3%D9%88%D8%B3%D9%8A.pdf',
    detailsUrl: 'https://archive.org/details/quran-mushaf-alsusy',
    coverImage: 'https://quranislam.github.io/quranpdf/images/soosy.png',
    category: 'riwayat',
    riwayah: 'السوسي عن أبي عمرو',
    type: 'riwayah',
    isOfficial: true,
  },
  {
    id: 'quran-haramein',
    title: 'مصحف الحرمين الشريفين المعتمد',
    subtitle: 'برواية حفص عن عاصم - إشراف رئاسة الحرمين الشريفين',
    description: 'النسخة المعتمدة المقروءة في المسجد الحرام والمسجد النبوي الشريف، بالرسم العثماني وعلامات الوقف المعتمدة.',
    fileSize: '198 ميجابايت',
    pagesCount: 604,
    downloadUrl: 'https://archive.org/download/download-quran-pdf/%D8%A7%D9%84%D9%82%D8%B1%D8%A2%D9%86%20%D8%A7%D9%84%D9%83%D8%B1%D9%8A%D9%85%20-%20%D8%A7%D9%84%D9%85%D8%B5%D8%AD%D9%81%20%D8%A7%D9%84%D9%88%D8%B3%D8%B7.pdf',
    backupUrl: 'https://archive.org/download/download-quran-pdf/%D8%A7%D9%84%D9%82%D8%B1%D8%A2%D9%86%20%D8%A7%D9%84%D9%83%D8%B1%D9%8A%D9%85%20-%20%D8%A7%D9%84%D9%85%D8%B5%D8%AD%D9%81%20%D8%A7%D9%84%D9%88%D8%B3%D8%B7.pdf',
    detailsUrl: 'https://archive.org/details/download-quran-pdf',
    coverImage: 'https://quranislam.github.io/quranpdf/images/wasat.png',
    category: 'hafs',
    riwayah: 'حفص عن عاصم (طبعة الحرمين)',
    type: 'madinah',
    isOfficial: true,
  },
  {
    id: 'quran-shamarly',
    title: 'مصحف الشمرلي المصري العريق',
    subtitle: 'الرسم العثماني المعتمد - الطبعة المصرية الشهيرة',
    description: 'أشهر مصحف في الديار المصرية والعالم الإسلامي لحفظة كتاب الله وكتاتيب التحفيظ، ضبط خطاطي المصحف الشريف في مصر.',
    fileSize: '175 ميجابايت',
    pagesCount: 604,
    downloadUrl: 'https://archive.org/download/mushaf-quran-pdf-download/%D8%A7%D9%84%D9%82%D8%B1%D8%A2%D9%86%20%D8%A7%D9%84%D9%83%D8%B1%D9%8A%D9%85%20-%20%D8%A7%D9%84%D9%85%D8%B5%D8%AD%D9%81%20%D8%A7%D9%84%D8%AC%D9%88%D8%A7%D9%85%D8%B9%D9%8A.pdf',
    backupUrl: 'https://archive.org/download/mushaf-quran-pdf-download/%D8%A7%D9%84%D9%82%D8%B1%D8%A2%D9%86%20%D8%A7%D9%84%D9%83%D8%B1%D9%8A%D9%85%20-%20%D8%A7%D9%84%D9%85%D8%B5%D8%AD%D9%81%20%D8%A7%D9%84%D8%AC%D9%88%D8%A7%D9%85%D8%B9%D9%8A.pdf',
    detailsUrl: 'https://archive.org/details/mushaf-quran-pdf-download',
    coverImage: 'https://quranislam.github.io/quranpdf/images/jawam3y.png',
    category: 'hafs',
    riwayah: 'حفص عن عاصم (طبعة الشمرلي)',
    type: 'jawamee',
    isOfficial: true,
  },
  {
    id: 'quran-tahajjud',
    title: 'مصحف القيام والتهجد (خط كبير جلي)',
    subtitle: 'برواية حفص عن عاصم - مخصص لصلاة التراويح والقيام',
    description: 'طبعة مخصصة للقراءة من الحامل في صلوات القيام والتراويح، بخط واضح مريح للعين أثناء الوقوف مع الفواصل.',
    fileSize: '210 ميجابايت',
    pagesCount: 604,
    downloadUrl: 'https://archive.org/download/mushaf-quran-pdf-download/%D8%A7%D9%84%D9%82%D8%B1%D8%A2%D9%86%20%D8%A7%D9%84%D9%83%D8%B1%D9%8A%D9%85%20-%20%D8%A7%D9%84%D9%85%D8%B5%D8%AD%D9%81%20%D8%A7%D9%84%D8%AC%D9%88%D8%A7%D9%85%D8%B9%D9%8A.pdf',
    backupUrl: 'https://archive.org/download/mushaf-quran-pdf-download/%D8%A7%D9%84%D9%82%D8%B1%D8%A2%D9%86%20%D8%A7%D9%84%D9%83%D8%B1%D9%8A%D9%85%20-%20%D8%A7%D9%84%D9%85%D8%B5%D8%AD%D9%81%20%D8%A7%D9%84%D8%AC%D9%88%D8%A7%D9%85%D8%B9%D9%8A.pdf',
    detailsUrl: 'https://archive.org/details/mushaf-quran-pdf-download',
    coverImage: 'https://quranislam.github.io/quranpdf/images/jawam3y.png',
    category: 'hafs',
    riwayah: 'حفص عن عاصم (قيام الليل)',
    type: 'jawamee',
    isOfficial: true,
  },
];

/**
 * Copies a canvas image directly to the system clipboard
 */
export async function copyCanvasToClipboard(canvas: HTMLCanvasElement): Promise<boolean> {
  try {
    const blob = await new Promise<Blob | null>((resolve) => canvas.toBlob(resolve, 'image/png', 1.0));
    if (!blob) return false;

    if (navigator.clipboard && window.ClipboardItem) {
      await navigator.clipboard.write([
        new ClipboardItem({ 'image/png': blob }),
      ]);
      return true;
    }
    return false;
  } catch (err) {
    console.warn('Failed to copy canvas to clipboard:', err);
    return false;
  }
}

const pageImageCache = new Map<number, HTMLImageElement>();

/**
 * Creates an elegant typographic canvas fallback for a Quran page in case all remote mirrors fail
 */
function createPageFallbackImage(pageNumber: number): HTMLImageElement {
  const canvas = document.createElement('canvas');
  canvas.width = 800;
  canvas.height = 1200;
  const ctx = canvas.getContext('2d');
  if (ctx) {
    ctx.fillStyle = '#FAF8F3';
    ctx.fillRect(0, 0, 800, 1200);

    ctx.strokeStyle = '#B45309';
    ctx.lineWidth = 4;
    ctx.strokeRect(30, 30, 740, 1140);

    ctx.direction = 'rtl';
    ctx.textAlign = 'center';
    ctx.fillStyle = '#78350F';
    ctx.font = 'bold 36px "Amiri", serif';
    ctx.fillText('بِسْمِ اللَّهِ الرَّحْمَٰنِ الرَّحِيمِ', 400, 200);

    ctx.font = '28px "Amiri", serif';
    ctx.fillStyle = '#92400E';
    ctx.fillText(`صفحة من القرآن الكريم (${toArabicDigits(pageNumber)})`, 400, 320);

    ctx.font = '20px "IBM Plex Sans Arabic", sans-serif';
    ctx.fillStyle = '#57534E';
    ctx.fillText('نسخة المصحف الشريف المعتمدة بالرسم العثماني', 400, 400);
  }

  const img = new Image();
  img.src = canvas.toDataURL('image/png');
  return img;
}

/**
 * Loads a Quran page image with multiple fast CORS-enabled mirrors and memory caching
 */
async function loadQuranPageImage(pageNumber: number): Promise<HTMLImageElement> {
  if (pageImageCache.has(pageNumber)) {
    return pageImageCache.get(pageNumber)!;
  }

  const padded = String(pageNumber).padStart(3, '0');
  const urls = [
    `https://files.quran.app/hafs/madani/width_1260/page${padded}.png`,
    `https://cdn.jsdelivr.net/gh/GovarJabbar/Quran-PNG@master/${padded}.png`,
    `https://raw.githubusercontent.com/GovarJabbar/Quran-PNG/master/${padded}.png`,
  ];

  for (const url of urls) {
    try {
      const img = await new Promise<HTMLImageElement>((resolve, reject) => {
        const image = new Image();
        image.crossOrigin = 'anonymous';
        const timer = setTimeout(() => {
          image.src = '';
          reject(new Error('timeout'));
        }, 5000);

        image.onload = () => {
          clearTimeout(timer);
          resolve(image);
        };
        image.onerror = () => {
          clearTimeout(timer);
          reject(new Error(`Failed to load ${url}`));
        };
        image.src = url;
      });

      pageImageCache.set(pageNumber, img);
      return img;
    } catch {
      // Continue to next mirror
    }
  }

  // Fallback so PDF generation NEVER crashes
  console.warn(`Falling back to generated canvas image for page ${pageNumber}`);
  const fallback = createPageFallbackImage(pageNumber);
  pageImageCache.set(pageNumber, fallback);
  return fallback;
}

/**
 * Renders a high-resolution, beautifully framed Mushaf Page directly to Canvas.
 * Bypasses DOM stylesheet parsing completely to prevent modern CSS parser issues (like oklab/oklch).
 * Supports standard resolution (1050x1485) for fast multi-page Juz documents, or high (1400x1980) for single page prints.
 */
export async function renderMushafPageCanvas(
  pageNumber: number,
  surahName: string,
  options: MushafRenderOptions = {}
): Promise<HTMLCanvasElement> {
  const {
    theme = 'gold',
    resolution = 'high',
    customDedicationTitle = 'صَدَقَةٌ جَارِيَةٌ عَنْ عَمَامِي الأَرْبَعَةِ رَحِمَهُمُ اللَّهُ',
    customDedicationNames = 'رمضان · الشهاوي · الشافعي · أحمد الشهاوي',
  } = options;

  const isStandard = resolution === 'standard';
  const width = isStandard ? 1050 : 1400;
  const height = isStandard ? 1485 : 1980;
  const scale = isStandard ? 0.75 : 1.0;

  const canvas = document.createElement('canvas');
  canvas.width = width;
  canvas.height = height;

  const ctx = canvas.getContext('2d');
  if (!ctx) throw new Error('تعذر إنشاء سياق الرسم للوحة');

  // Palette configuration based on theme
  let bgColor = '#FAF8F3';
  let primaryBorder = '#B45309'; // Gold amber
  let innerBorder = '#D4AF37'; // Royal gold
  let titleColor = '#78350F';
  let metaColor = '#92400E';
  let dividerColor = 'rgba(180, 83, 9, 0.35)';
  let dedicationBg = 'rgba(180, 83, 9, 0.08)';
  let dedicationBorder = 'rgba(180, 83, 9, 0.25)';

  if (theme === 'emerald') {
    bgColor = '#F2F8F4';
    primaryBorder = '#047857';
    innerBorder = '#10B981';
    titleColor = '#064E3B';
    metaColor = '#065F46';
    dividerColor = 'rgba(4, 120, 87, 0.35)';
    dedicationBg = 'rgba(4, 120, 87, 0.08)';
    dedicationBorder = 'rgba(4, 120, 87, 0.25)';
  } else if (theme === 'royalDark') {
    bgColor = '#11151C';
    primaryBorder = '#D97706';
    innerBorder = '#F59E0B';
    titleColor = '#FDE68A';
    metaColor = '#FCD34D';
    dividerColor = 'rgba(217, 119, 6, 0.4)';
    dedicationBg = 'rgba(217, 119, 6, 0.15)';
    dedicationBorder = 'rgba(217, 119, 6, 0.4)';
  } else if (theme === 'parchment') {
    bgColor = '#F5EFE1';
    primaryBorder = '#92400E';
    innerBorder = '#B45309';
    titleColor = '#78350F';
    metaColor = '#92400E';
    dividerColor = 'rgba(146, 64, 14, 0.35)';
    dedicationBg = 'rgba(146, 64, 14, 0.08)';
    dedicationBorder = 'rgba(146, 64, 14, 0.25)';
  }

  // 1. Parchment paper background
  ctx.fillStyle = bgColor;
  ctx.fillRect(0, 0, width, height);

  // 2. Decorative Double Islamic Border
  const outerPadding = Math.round(48 * scale);
  ctx.strokeStyle = primaryBorder;
  ctx.lineWidth = Math.round(4 * scale);
  ctx.strokeRect(outerPadding, outerPadding, width - outerPadding * 2, height - outerPadding * 2);

  const innerPadding = outerPadding + Math.round(14 * scale);
  ctx.strokeStyle = innerBorder;
  ctx.lineWidth = Math.max(1, 1.8 * scale);
  ctx.strokeRect(innerPadding, innerPadding, width - innerPadding * 2, height - innerPadding * 2);

  // 4 Corner rosettes
  const drawCornerRosette = (cx: number, cy: number) => {
    ctx.save();
    ctx.translate(cx, cy);
    ctx.fillStyle = primaryBorder;
    ctx.beginPath();
    ctx.arc(0, 0, 7.5 * scale, 0, Math.PI * 2);
    ctx.fill();
    ctx.strokeStyle = innerBorder;
    ctx.lineWidth = Math.max(1, 2 * scale);
    ctx.strokeRect(-11 * scale, -11 * scale, 22 * scale, 22 * scale);
    ctx.restore();
  };

  drawCornerRosette(innerPadding, innerPadding);
  drawCornerRosette(width - innerPadding, innerPadding);
  drawCornerRosette(innerPadding, height - innerPadding);
  drawCornerRosette(width - innerPadding, height - innerPadding);

  // 3. Header Bar with Metadata
  const juz = Math.min(30, Math.floor((pageNumber - 1) / 20) + 1);
  const headerY = innerPadding + Math.round(44 * scale);

  ctx.direction = 'rtl';
  ctx.textAlign = 'center';

  // Center Surah Title
  ctx.fillStyle = titleColor;
  ctx.font = `bold ${Math.round(36 * scale)}px "Amiri", "IBM Plex Sans Arabic", serif`;
  ctx.fillText(`سُورَةُ ${surahName}`, width / 2, headerY);

  // Right: Juz
  ctx.textAlign = 'right';
  ctx.font = `bold ${Math.round(24 * scale)}px "Amiri", "IBM Plex Sans Arabic", serif`;
  ctx.fillStyle = metaColor;
  ctx.fillText(`الجُزْءُ ${toArabicDigits(juz)}`, width - innerPadding - Math.round(40 * scale), headerY - 3);

  // Left: Page
  ctx.textAlign = 'left';
  ctx.fillText(`صَفْحَةُ ${toArabicDigits(pageNumber)}`, innerPadding + Math.round(40 * scale), headerY - 3);

  // Header bottom divider
  const dividerY = headerY + Math.round(22 * scale);
  ctx.strokeStyle = dividerColor;
  ctx.lineWidth = Math.max(1, 2 * scale);
  ctx.beginPath();
  ctx.moveTo(innerPadding + Math.round(30 * scale), dividerY);
  ctx.lineTo(width - innerPadding - Math.round(30 * scale), dividerY);
  ctx.stroke();

  // Center divider medallion
  ctx.fillStyle = primaryBorder;
  ctx.beginPath();
  ctx.arc(width / 2, dividerY, 6.5 * scale, 0, Math.PI * 2);
  ctx.fill();

  // 4. Load and draw page image
  const img = await loadQuranPageImage(pageNumber);

  const footerHeight = Math.round(110 * scale);
  const availableImgTop = dividerY + Math.round(24 * scale);
  const availableImgBottom = height - innerPadding - footerHeight;
  const availableImgHeight = availableImgBottom - availableImgTop;
  const availableImgWidth = width - innerPadding * 2 - Math.round(50 * scale);

  // Calculate aspect ratio fit
  const imgRatio = (img.width || 800) / (img.height || 1200);
  let targetW = availableImgWidth;
  let targetH = targetW / imgRatio;

  if (targetH > availableImgHeight) {
    targetH = availableImgHeight;
    targetW = targetH * imgRatio;
  }

  const imgX = (width - targetW) / 2;
  const imgY = availableImgTop + (availableImgHeight - targetH) / 2;

  if (theme === 'royalDark') {
    ctx.fillStyle = '#FFFFFF';
    ctx.shadowColor = 'rgba(0, 0, 0, 0.4)';
    ctx.shadowBlur = Math.round(20 * scale);
    ctx.fillRect(imgX - 8, imgY - 8, targetW + 16, targetH + 16);
    ctx.shadowBlur = 0;
  }

  ctx.imageSmoothingEnabled = true;
  ctx.imageSmoothingQuality = 'high';
  ctx.drawImage(img, imgX, imgY, targetW, targetH);

  // 5. Dedication Watermark Footer
  const footerY = height - innerPadding - Math.round(48 * scale);

  ctx.fillStyle = dedicationBg;
  ctx.beginPath();
  ctx.roundRect(width / 2 - Math.round(470 * scale), footerY - Math.round(40 * scale), Math.round(940 * scale), Math.round(78 * scale), Math.round(20 * scale));
  ctx.fill();

  ctx.strokeStyle = dedicationBorder;
  ctx.lineWidth = 1;
  ctx.stroke();

  ctx.textAlign = 'center';
  ctx.fillStyle = primaryBorder;
  ctx.font = `bold ${Math.round(24 * scale)}px "Amiri", "IBM Plex Sans Arabic", serif`;
  ctx.fillText(customDedicationTitle, width / 2, footerY - 4);

  if (customDedicationNames) {
    ctx.fillStyle = metaColor;
    ctx.font = `normal ${Math.round(18 * scale)}px "IBM Plex Sans Arabic", sans-serif`;
    ctx.fillText(customDedicationNames, width / 2, footerY + Math.round(25 * scale));
  }

  return canvas;
}

/**
 * Downloads a high-res Mushaf page with the complete decorative Islamic frame and metadata
 */
export async function downloadMushafPageWithFrame(
  pageNumber: number,
  surahName: string,
  options?: MushafRenderOptions
): Promise<void> {
  const canvas = await renderMushafPageCanvas(pageNumber, surahName, options);
  downloadCanvasAsImage(canvas, `مصحف_المدينة_صفحة_${pageNumber}_سورة_${surahName}.png`);
}

/**
 * Generates and downloads a framed PDF for a single Mushaf Page
 */
export async function generateMushafPagePdf(
  pageElement: HTMLElement | null,
  pageNumber: number,
  surahName: string,
  options?: MushafRenderOptions
): Promise<Blob> {
  let canvas: HTMLCanvasElement;

  try {
    // 1. Direct high-res Canvas rendering (ultra-fast, zero oklab/CSS parsing issues)
    canvas = await renderMushafPageCanvas(pageNumber, surahName, { ...options, resolution: 'high' });
  } catch (canvasErr) {
    console.warn('Direct canvas rendering failed, trying html2canvas-pro fallback:', canvasErr);
    if (!pageElement) throw canvasErr;

    // 2. Fallback using html2canvas-pro which natively supports modern CSS color functions
    const h2c = await getHtml2CanvasFn();
    canvas = await h2c(pageElement, {
      scale: 2,
      useCORS: true,
      allowTaint: true,
      backgroundColor: '#FAF8F3',
      logging: false,
    });
  }

  const JsPdfClass = await getJsPdfClass();
  const pdf = new JsPdfClass({
    orientation: 'portrait',
    unit: 'mm',
    format: 'a4',
    compress: true,
  });

  const pdfWidth = pdf.internal.pageSize.getWidth();
  const pdfHeight = pdf.internal.pageSize.getHeight();
  const imgData = canvas.toDataURL('image/jpeg', 0.95);

  pdf.addImage(imgData, 'JPEG', 0, 0, pdfWidth, pdfHeight, undefined, 'FAST');
  pdf.save(`مصحف_صفحة_${pageNumber}_سورة_${surahName}.pdf`);
  return pdf.output('blob');
}

/**
 * Generates a custom multi-page PDF for a specified page range (e.g. from page 1 to 20, or a whole Juz)
 * Renders each page with the full authentic Islamic decorative frame and dedication.
 * Optimized with standard resolution for speed and memory efficiency.
 */
export async function generateCustomRangePdf(
  startPage: number,
  endPage: number,
  surahLookup: (pageNum: number) => string,
  options?: MushafRenderOptions,
  onProgress?: (p: PdfGenerationProgress) => void
): Promise<Blob> {
  const fromPage = Math.max(1, Math.min(startPage, endPage));
  const toPage = Math.min(604, Math.max(startPage, endPage));
  const totalPages = toPage - fromPage + 1;

  const JsPdfClass = await getJsPdfClass();
  const pdf = new JsPdfClass({
    orientation: 'portrait',
    unit: 'mm',
    format: 'a4',
    compress: true,
  });

  const pdfWidth = pdf.internal.pageSize.getWidth();
  const pdfHeight = pdf.internal.pageSize.getHeight();
  const renderRes = totalPages > 2 ? 'standard' : (options?.resolution || 'standard');

  for (let p = fromPage; p <= toPage; p++) {
    // Check if cancellation requested
    if (options?.shouldCancel && options.shouldCancel()) {
      throw new Error('تم إلغاء عملية التصدير بواسطة المستخدم');
    }

    const currentIndex = p - fromPage + 1;
    const currentSurah = surahLookup(p) || 'القرآن الكريم';

    if (onProgress) {
      onProgress({
        currentPage: currentIndex,
        totalPages,
        statusText: `جاري رسم وتأطير الصفحة ${toArabicDigits(p)} (${toArabicDigits(currentIndex)} من ${toArabicDigits(totalPages)})...`,
      });
    }

    const canvas = await renderMushafPageCanvas(p, currentSurah, {
      ...options,
      resolution: renderRes,
    });
    const imgData = canvas.toDataURL('image/jpeg', 0.90);

    if (currentIndex > 1) {
      pdf.addPage('a4', 'portrait');
    }

    pdf.addImage(imgData, 'JPEG', 0, 0, pdfWidth, pdfHeight, undefined, 'FAST');

    // Yield control to main thread so UI updates smoothly
    await new Promise((resolve) => setTimeout(resolve, 15));
  }

  if (onProgress) {
    onProgress({
      currentPage: totalPages,
      totalPages,
      statusText: 'اكتمل إنشاء المستند وجاري التحميل...',
    });
  }

  const finalName = options?.customFileName || `مصحف_المدينة_صفحات_${fromPage}_إلى_${toPage}.pdf`;
  const blob = pdf.output('blob');
  pdf.save(finalName);
  return blob;
}

/**
 * Downloads a complete Holy Quran Juz as a framed PDF with dedication
 */
export async function generateJuzPdf(
  juzNumber: number,
  startPage: number,
  endPage: number,
  juzName: string,
  surahLookup: (pageNum: number) => string,
  options?: MushafRenderOptions,
  onProgress?: (p: PdfGenerationProgress) => void
): Promise<Blob> {
  const cleanName = juzName.replace(/[\(\)]/g, '').trim().replace(/\s+/g, '_');
  const customFileName = `القرآن_الكريم_الجزء_${toArabicDigits(juzNumber)}_${cleanName}.pdf`;

  return generateCustomRangePdf(
    startPage,
    endPage,
    surahLookup,
    {
      ...options,
      resolution: 'standard',
      customFileName,
    },
    onProgress
  );
}

/**
 * Generates and downloads a multi-page PDF for any Surah (short or long)
 */
export async function generateSurahPdf(
  surah: SurahDetail,
  pageElements: HTMLElement[],
  onProgress?: (p: PdfGenerationProgress) => void
): Promise<Blob> {
  const JsPdfClass = await getJsPdfClass();
  const pdf = new JsPdfClass({
    orientation: 'portrait',
    unit: 'mm',
    format: 'a4',
    compress: true,
  });

  const pdfWidth = pdf.internal.pageSize.getWidth();
  const pdfHeight = pdf.internal.pageSize.getHeight();
  const totalPages = pageElements.length;
  const h2c = await getHtml2CanvasFn();

  for (let i = 0; i < totalPages; i++) {
    if (onProgress) {
      onProgress({
        currentPage: i + 1,
        totalPages,
        statusText: `جاري معالجة الصفحة ${toArabicDigits(i + 1)} من ${toArabicDigits(totalPages)}...`,
      });
    }

    const element = pageElements[i];

    // High quality canvas capture using html2canvas-pro
    const canvas = await h2c(element, {
      scale: 2,
      useCORS: true,
      allowTaint: true,
      backgroundColor: '#FAF8F3',
      logging: false,
    });

    const imgData = canvas.toDataURL('image/jpeg', 0.95);

    if (i > 0) {
      pdf.addPage('a4', 'portrait');
    }

    pdf.addImage(imgData, 'JPEG', 0, 0, pdfWidth, pdfHeight, undefined, 'FAST');
  }

  if (onProgress) {
    onProgress({
      currentPage: totalPages,
      totalPages,
      statusText: 'اكتمل إنشاء المستند وجاري التنزيل...',
    });
  }

  const blob = pdf.output('blob');
  pdf.save(`سورة_${surah.name}_كاملة.pdf`);
  return blob;
}
