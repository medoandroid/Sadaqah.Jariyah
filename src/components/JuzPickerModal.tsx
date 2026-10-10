import React, { useEffect, useRef } from 'react';
import { Layers, X, Check, BookOpen } from 'lucide-react';

interface JuzPickerModalProps {
  isOpen: boolean;
  onClose: () => void;
  selectedJuzNumber: number;
  onSelectJuz: (juzNumber: number) => void;
}

const JUZ_METADATA = [
  { number: 1, name: 'الجزء الأول', startSurah: 'الفاتحة', startPage: 1 },
  { number: 2, name: 'الجزء الثاني (سيقول)', startSurah: 'البقرة ١٤٢', startPage: 22 },
  { number: 3, name: 'الجزء الثالث (تلك الرسل)', startSurah: 'البقرة ٢٥٣', startPage: 42 },
  { number: 4, name: 'الجزء الرابع (لن تنالوا)', startSurah: 'آل عمران ٩٣', startPage: 62 },
  { number: 5, name: 'الجزء الخامس (والمحصنات)', startSurah: 'النساء ٢٤', startPage: 82 },
  { number: 6, name: 'الجزء السادس (لا يحب الله)', startSurah: 'النساء ١٤٨', startPage: 102 },
  { number: 7, name: 'الجزء السابع (وإذا سمعوا)', startSurah: 'المائدة ٨٢', startPage: 122 },
  { number: 8, name: 'الجزء الثامن (ولو أننا)', startSurah: 'الأنعام ١١١', startPage: 142 },
  { number: 9, name: 'الجزء التاسع (قال الملأ)', startSurah: 'الأعراف ٨٨', startPage: 162 },
  { number: 10, name: 'الجزء العاشر (واعلموا)', startSurah: 'الأنفال ٤١', startPage: 182 },
  { number: 11, name: 'الجزء الحادي عشر (يعتذرون)', startSurah: 'التوبة ٩٣', startPage: 202 },
  { number: 12, name: 'الجزء الثاني عشر (وما من دابة)', startSurah: 'هود ٦', startPage: 222 },
  { number: 13, name: 'الجزء الثالث عشر (وما أبرئ)', startSurah: 'يوسف ٥٣', startPage: 242 },
  { number: 14, name: 'الجزء الرابع عشر (ربما)', startSurah: 'الحجر ١', startPage: 262 },
  { number: 15, name: 'الجزء الخامس عشر (سبحان)', startSurah: 'الإسراء ١', startPage: 282 },
  { number: 16, name: 'الجزء السادس عشر (قال ألم)', startSurah: 'الكهف ٧٥', startPage: 302 },
  { number: 17, name: 'الجزء السابع عشر (اقترب)', startSurah: 'الأنبياء ١', startPage: 322 },
  { number: 18, name: 'الجزء الثامن عشر (قد أفلح)', startSurah: 'المؤمنون ١', startPage: 342 },
  { number: 19, name: 'الجزء التاسع عشر (وقال الذين)', startSurah: 'الفرقان ٢١', startPage: 362 },
  { number: 20, name: 'الجزء العشرون (أمّن خلق)', startSurah: 'النمل ٦٠', startPage: 382 },
  { number: 21, name: 'الجزء الحادي والعشرون (اتل ما أوحي)', startSurah: 'العنكبوت ٤٦', startPage: 402 },
  { number: 22, name: 'الجزء الثاني والعشرون (ومن يقنت)', startSurah: 'الأحزاب ٣١', startPage: 422 },
  { number: 23, name: 'الجزء الثالث والعشرون (وما أنزلنا)', startSurah: 'يس ٢٨', startPage: 442 },
  { number: 24, name: 'الجزء الرابع والعشرون (فمن أظلم)', startSurah: 'الزمر ٣٢', startPage: 462 },
  { number: 25, name: 'الجزء الخامس والعشرون (إليه يرد)', startSurah: 'فصلت ٤٧', startPage: 482 },
  { number: 26, name: 'الجزء السادس والعشرون (حم)', startSurah: 'الأحقاف ١', startPage: 502 },
  { number: 27, name: 'الجزء السابع والعشرون (قال فما خطبكم)', startSurah: 'الذاريات ٣١', startPage: 522 },
  { number: 28, name: 'الجزء الثامن والعشرون (قد سمع)', startSurah: 'المجادلة ١', startPage: 542 },
  { number: 29, name: 'الجزء التاسع والعشرون (تبارك)', startSurah: 'الملك ١', startPage: 562 },
  { number: 30, name: 'الجزء الثلاثون (عمّ يتساءلون)', startSurah: 'النبأ ١', startPage: 582 },
];

export const JuzPickerModal: React.FC<JuzPickerModalProps> = ({
  isOpen,
  onClose,
  selectedJuzNumber,
  onSelectJuz,
}) => {
  const selectedRef = useRef<HTMLButtonElement>(null);

  useEffect(() => {
    if (isOpen) {
      setTimeout(() => {
        selectedRef.current?.scrollIntoView({ block: 'center', behavior: 'smooth' });
      }, 100);
    }
  }, [isOpen]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-stone-900/65 backdrop-blur-xs animate-in fade-in duration-150">
      <div
        className="w-full max-w-xl bg-[#FAF9F5] border border-stone-300 rounded-3xl shadow-2xl overflow-hidden flex flex-col max-h-[85vh] text-right"
        role="dialog"
        aria-modal="true"
        aria-label="قائمة اختيار أجزاء القرآن الكريم"
      >
        {/* Header */}
        <div className="px-5 py-4 border-b border-stone-200/80 bg-white flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-amber-100/70 border border-amber-300 text-amber-900 flex items-center justify-center">
              <Layers className="w-5 h-5 text-amber-800" />
            </div>
            <div>
              <h3 className="font-amiri text-xl font-bold text-stone-900">
                أجزاء القرآن الكريم (٣٠ جزءاً)
              </h3>
              <p className="text-[11px] text-stone-500">
                انتقال سريع لبداية أي جزء قرآني
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 rounded-xl text-stone-400 hover:text-stone-700 hover:bg-stone-100 transition-colors cursor-pointer"
            title="إغلاق"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* List of 30 Juz */}
        <div className="flex-1 overflow-y-auto p-3 sm:p-4 space-y-2">
          {JUZ_METADATA.map((juz) => {
            const isSelected = juz.number === selectedJuzNumber;
            return (
              <button
                key={juz.number}
                ref={isSelected ? selectedRef : undefined}
                onClick={() => {
                  onSelectJuz(juz.number);
                  onClose();
                }}
                className={`w-full p-3 rounded-2xl border text-right transition-all flex items-center justify-between gap-3 cursor-pointer group active:scale-[0.99] ${
                  isSelected
                    ? 'bg-amber-50/90 border-amber-600/80 ring-2 ring-amber-600/30 shadow-xs'
                    : 'bg-white hover:bg-amber-50/40 border-stone-200 hover:border-amber-300'
                }`}
              >
                <div className="flex items-center gap-3 min-w-0">
                  <span
                    className={`w-9 h-9 rounded-xl font-mono text-xs font-bold flex items-center justify-center shrink-0 transition-colors ${
                      isSelected
                        ? 'bg-amber-800 text-white shadow-2xs'
                        : 'bg-stone-100 text-stone-700 group-hover:bg-amber-100 group-hover:text-amber-900'
                    }`}
                  >
                    {juz.number}
                  </span>
                  <div>
                    <div className="flex items-center gap-2">
                      <span
                        className={`font-amiri text-base font-bold truncate ${
                          isSelected ? 'text-amber-950 font-bold' : 'text-stone-900 group-hover:text-amber-900'
                        }`}
                      >
                        {juz.name}
                      </span>
                    </div>
                    <div className="text-[11px] text-stone-500 mt-0.5">
                      يبدأ من: سورة {juz.startSurah} · الصفحة {juz.startPage}
                    </div>
                  </div>
                </div>

                <div className="flex items-center gap-2 shrink-0">
                  <span className="text-[11px] font-mono text-stone-400 group-hover:text-amber-700">
                    ص {juz.startPage}
                  </span>
                  <div
                    className={`w-6 h-6 rounded-full flex items-center justify-center transition-all ${
                      isSelected
                        ? 'bg-amber-800 text-white'
                        : 'border border-stone-300 bg-stone-50 group-hover:border-amber-400 text-transparent'
                    }`}
                  >
                    <Check className="w-3.5 h-3.5 stroke-[2.5]" />
                  </div>
                </div>
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
};
