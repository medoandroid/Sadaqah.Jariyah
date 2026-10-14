import React, { useState, useEffect, useMemo } from 'react';
import {
  Sparkles,
  Search,
  Heart,
  BookOpen,
  Info,
  Check,
  Copy,
  Share2,
  X,
  Volume2,
  Bookmark
} from 'lucide-react';
import { AsmaName } from '../data/asmaAlHusna';
import { fetchAsmaAlHusna, searchAsma } from '../services/asmaService';
import { recordDedication } from '../services/dedicationService';
import { storageService } from '../services/storageService';
import { Star8Rosette, ArabesqueDivider } from '../components/IslamicDecoration';

export const AsmaAlHusnaPage: React.FC = () => {
  const [asmaList, setAsmaList] = useState<AsmaName[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<'all' | 'saved' | 'جمال' | 'جلال' | 'كمال'>('all');
  const [selectedName, setSelectedName] = useState<AsmaName | null>(null);
  const [contemplatedMap, setContemplatedMap] = useState<Record<number, number>>({});
  const [savedNames, setSavedNames] = useState<number[]>(() => {
    return storageService.get<number[]>('saved_asma_names', []);
  });
  const [toastMsg, setToastMsg] = useState<string | null>(null);

  useEffect(() => {
    fetchAsmaAlHusna().then((data) => {
      setAsmaList(data);
      setLoading(false);
    });
  }, []);

  const showToast = (msg: string) => {
    setToastMsg(msg);
    setTimeout(() => setToastMsg(null), 2500);
  };

  const handleToggleSave = (item: AsmaName, e?: React.MouseEvent) => {
    if (e) e.stopPropagation();
    const isSaved = savedNames.includes(item.number);
    let updated: number[];
    if (isSaved) {
      updated = savedNames.filter((n) => n !== item.number);
      showToast(`تمت إزالة اسم الله «${item.name}» من المحفوظات`);
    } else {
      updated = [...savedNames, item.number];
      showToast(`تم حفظ اسم الله «${item.name}» في المفضلة`);
    }
    setSavedNames(updated);
    storageService.set('saved_asma_names', updated);
  };

  const filteredNames = useMemo(() => {
    let list = asmaList;
    if (selectedCategory === 'saved') {
      list = list.filter((item) => savedNames.includes(item.number));
      return searchAsma(list, searchQuery, 'all');
    }
    return searchAsma(list, searchQuery, selectedCategory);
  }, [asmaList, searchQuery, selectedCategory, savedNames]);

  const handleContemplate = (item: AsmaName) => {
    const cur = contemplatedMap[item.number] || 0;
    setContemplatedMap({ ...contemplatedMap, [item.number]: cur + 1 });
    recordDedication('tasbeeh', `تدبر وذكر باسم الله (${item.name})`, 'all', 1, 'زائر كريم');
    showToast(`تقبل الله ذكرك وتدبرك باسم الله ${item.name}`);
  };

  const handleCopyName = (item: AsmaName) => {
    const text = `من أسماء الله الحسنى: «${item.name}»\nالمعنى: ${item.meaning}\nالشرح: ${item.explanation}\n\n- من منصة صدقة جارية`;
    navigator.clipboard.writeText(text);
    showToast('تم نسخ تفاصيل الاسم المبارك');
  };

  const handleShareName = (item: AsmaName) => {
    const text = `﴿وَلِلَّهِ الْأَسْمَاءُ الْحُسْنَىٰ فَادْعُوهُ بِهَا﴾\nمن أسماء الله الحسنى: «${item.name}»\nالمعنى: ${item.meaning}\nالشرح: ${item.explanation}\n\n- صدقة جارية عن أرواح المغفور لهم بإذن الله`;
    if (navigator.share) {
      navigator.share({
        title: `اسم الله ${item.name}`,
        text,
        url: window.location.href,
      }).catch(() => {});
    } else {
      navigator.clipboard.writeText(text);
      showToast('تم نسخ الاسم للمشاركة');
    }
  };

  const handleSpeakName = (item: AsmaName, e?: React.MouseEvent) => {
    if (e) e.stopPropagation();
    if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
      window.speechSynthesis.cancel();
      const utterance = new SpeechSynthesisUtterance(item.name);
      utterance.lang = 'ar-SA';
      utterance.rate = 0.85;
      window.speechSynthesis.speak(utterance);
      showToast(`استمع لنطق اسم الله «${item.name}»`);
    } else {
      showToast(item.name);
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-10 text-right">
      
      {/* Toast Alert */}
      {toastMsg && (
        <div className="fixed top-20 left-1/2 -translate-x-1/2 z-50 px-4 py-2 rounded-xl bg-stone-900/95 text-amber-200 text-xs font-semibold shadow-xl backdrop-blur-md border border-amber-500/30 animate-in fade-in zoom-in-95 duration-200">
          {toastMsg}
        </div>
      )}

      {/* Header */}
      <div className="text-center max-w-2xl mx-auto space-y-3">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-amber-100/80 dark:bg-stone-800 border border-amber-300 dark:border-amber-700/50 text-amber-900 dark:text-amber-300 text-xs font-semibold">
          <Sparkles className="w-3.5 h-3.5 text-amber-800 dark:text-amber-400" />
          <span>وَلِلَّهِ الْأَسْمَاءُ الْحُسْنَىٰ فَادْعُوهُ بِهَا</span>
        </div>
        <h1 className="font-amiri text-3xl sm:text-5xl font-bold text-stone-900 dark:text-stone-100">
          أسماء الله الحسنى ومعانيها
        </h1>
        <p className="font-amiri text-base sm:text-lg text-stone-600 dark:text-stone-300 leading-relaxed">
          قال رسول الله ﷺ: «إِنَّ لِلَّهِ تِسْعَةً وَتِسْعِينَ اسْمًا، مِائَةً إِلَّا وَاحِدًا، مَنْ أَحْصَاهَا دَخَلَ الْجَنَّةَ». تعرّف على معانيها العظيمة وتدبّر في دلالاتها مع إمكانية حفظ ومشاركة كل اسم مبارك.
        </p>
      </div>

      {/* Filter and Search Bar */}
      <div className="flex flex-wrap items-center justify-between gap-3 p-4 rounded-2xl bg-white dark:bg-stone-900 border border-stone-200 dark:border-stone-800 shadow-xs">
        
        {/* Category Tabs */}
        <div className="flex flex-wrap items-center gap-1.5">
          {[
            { id: 'all', label: 'جميع الأسماء (99)' },
            { id: 'saved', label: `المحفوظة (${savedNames.length})` },
            { id: 'جمال', label: 'صفات الجمال والرحمة' },
            { id: 'جلال', label: 'صفات الجلال والقوة' },
            { id: 'كمال', label: 'صفات الكمال والعلم' },
          ].map((cat) => (
            <button
              key={cat.id}
              onClick={() => setSelectedCategory(cat.id as any)}
              className={`px-3 py-1.5 rounded-xl text-xs font-medium transition-all cursor-pointer flex items-center gap-1 ${
                selectedCategory === cat.id
                  ? 'bg-amber-800 text-white font-semibold shadow-xs'
                  : 'bg-stone-100 dark:bg-stone-800 text-stone-600 dark:text-stone-300 hover:bg-stone-200 dark:hover:bg-stone-750'
              }`}
            >
              {cat.id === 'saved' && (
                <Bookmark className={`w-3 h-3 ${selectedCategory === 'saved' ? 'fill-current' : 'text-amber-600 dark:text-amber-400'}`} />
              )}
              <span>{cat.label}</span>
            </button>
          ))}
        </div>

        {/* Search Input */}
        <div className="w-full sm:w-64">
          <div className="relative">
            <Search className="w-4 h-4 absolute right-3 top-1/2 -translate-y-1/2 text-stone-400" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="ابحث بالاسم أو المعنى..."
              className="w-full pr-9 pl-3 py-1.5 text-xs bg-stone-50 dark:bg-stone-850 border border-stone-200 dark:border-stone-750 text-stone-900 dark:text-stone-100 placeholder:text-stone-400 rounded-xl focus:outline-hidden focus:border-amber-700"
            />
            {searchQuery && (
              <button
                type="button"
                onClick={() => setSearchQuery('')}
                className="absolute left-2.5 top-1/2 -translate-y-1/2 text-stone-400 hover:text-stone-600 dark:hover:text-stone-200 p-0.5 cursor-pointer"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            )}
          </div>
        </div>

      </div>

      {/* Grid of Names */}
      {loading ? (
        <div className="py-24 text-center space-y-3">
          <div className="w-8 h-8 border-3 border-amber-700 border-t-transparent rounded-full animate-spin mx-auto" />
          <div className="text-sm font-amiri text-stone-500 dark:text-stone-400">جاري تحميل أسماء الله الحسنى...</div>
        </div>
      ) : filteredNames.length === 0 ? (
        <div className="py-20 text-center space-y-4 bg-white dark:bg-stone-900 rounded-3xl border border-stone-200 dark:border-stone-800 p-8">
          <div className="w-14 h-14 rounded-2xl bg-amber-100 dark:bg-stone-800 text-amber-800 dark:text-amber-300 flex items-center justify-center mx-auto">
            <Bookmark className="w-7 h-7" />
          </div>
          <h3 className="font-amiri text-xl font-bold text-stone-800 dark:text-stone-200">
            {selectedCategory === 'saved' ? 'لا توجد أسماء محفوظة بعد' : 'لا توجد نتائج مطابقة للبحث'}
          </h3>
          <p className="text-xs text-stone-500 dark:text-stone-400 max-w-sm mx-auto leading-relaxed">
            {selectedCategory === 'saved'
              ? 'يمكنك حفظ أي اسم من أسماء الله الحسنى بالنقر على أيقونة الإشارة المرجعية (🔖) على بطاقة الاسم للرجوع وتدبره في أي وقت.'
              : 'جرّب البحث باسم آخر أو اختر قسماً مختلفاً من الأقسام أعلاه.'}
          </p>
          {selectedCategory === 'saved' && (
            <button
              onClick={() => setSelectedCategory('all')}
              className="px-4 py-2 rounded-xl bg-amber-800 text-white text-xs font-semibold hover:bg-amber-900 transition-colors cursor-pointer"
            >
              عرض جميع الأسماء الـ 99
            </button>
          )}
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
          {filteredNames.map((item) => {
            const count = contemplatedMap[item.number] || 0;
            const isSaved = savedNames.includes(item.number);

            return (
              <div
                key={item.number}
                className="p-5 rounded-2xl bg-white dark:bg-stone-900 border border-stone-200/90 dark:border-stone-800 hover:border-amber-500/60 dark:hover:border-stone-700 shadow-2xs hover:shadow-md transition-all flex flex-col justify-between group relative overflow-hidden text-right"
              >
                <div>
                  <div className="flex items-center justify-between mb-3">
                    <span className="w-7 h-7 rounded-lg bg-stone-100 dark:bg-stone-800 text-stone-600 dark:text-stone-400 font-mono text-xs font-bold flex items-center justify-center group-hover:bg-amber-100 dark:group-hover:bg-stone-750 group-hover:text-amber-900 dark:group-hover:text-amber-300 transition-colors">
                      {item.number}
                    </span>
                    <span
                      className={`text-[10px] font-semibold px-2 py-0.5 rounded-md ${
                        item.category === 'جمال'
                          ? 'bg-emerald-50 dark:bg-emerald-950/40 text-emerald-800 dark:text-emerald-300 border border-emerald-200/50 dark:border-emerald-800/40'
                          : item.category === 'جلال'
                          ? 'bg-amber-50 dark:bg-amber-950/40 text-amber-900 dark:text-amber-300 border border-amber-200/50 dark:border-amber-800/40'
                          : 'bg-stone-100 dark:bg-stone-800 text-stone-700 dark:text-stone-300'
                      }`}
                    >
                      {item.category}
                    </span>
                  </div>

                  <h3 className="font-amiri text-3xl font-bold text-stone-900 dark:text-stone-100 mb-1 group-hover:text-amber-900 dark:group-hover:text-amber-300 transition-colors">
                    {item.name}
                  </h3>
                  <div className="text-[11px] font-mono text-stone-600 dark:text-stone-400 mb-2 font-medium">
                    {item.transliteration}
                  </div>

                  <p className="font-amiri text-sm text-stone-700 dark:text-stone-300 leading-relaxed mb-4 line-clamp-2 font-medium">
                    {item.meaning}
                  </p>
                </div>

                <div className="pt-3 border-t border-stone-200/80 dark:border-stone-800 flex items-center justify-between">
                  <button
                    onClick={() => setSelectedName(item)}
                    className="text-xs text-amber-800 dark:text-amber-400 hover:text-amber-950 dark:hover:text-amber-200 font-bold flex items-center gap-1 cursor-pointer"
                  >
                    <Info className="w-3.5 h-3.5" />
                    <span>التفاصيل والتدبر</span>
                  </button>

                  <div className="flex items-center gap-1 text-stone-600 dark:text-stone-400">
                    <button
                      onClick={(e) => handleSpeakName(item, e)}
                      className="p-1.5 rounded-lg hover:bg-stone-100 dark:hover:bg-stone-800 hover:text-amber-800 dark:hover:text-amber-300 transition-colors cursor-pointer"
                      title="استمع للنطق"
                    >
                      <Volume2 className="w-3.5 h-3.5" />
                    </button>
                    <button
                      onClick={(e) => handleToggleSave(item, e)}
                      className={`p-1.5 rounded-lg transition-colors cursor-pointer ${
                        isSaved
                          ? 'bg-amber-100 dark:bg-stone-800 text-amber-900 dark:text-amber-300 font-bold'
                          : 'hover:bg-stone-100 dark:hover:bg-stone-800 hover:text-stone-800 dark:hover:text-stone-200 text-stone-400'
                      }`}
                      title={isSaved ? 'محفوظ في المفضلة (انقر للإزالة)' : 'حفظ الاسم في المفضلة'}
                    >
                      <Bookmark className={`w-3.5 h-3.5 ${isSaved ? 'fill-amber-700 text-amber-700 dark:fill-amber-400 dark:text-amber-400' : ''}`} />
                    </button>
                    <button
                      onClick={() => handleContemplate(item)}
                      className="p-1.5 rounded-lg hover:bg-amber-50 dark:hover:bg-stone-800 hover:text-amber-800 dark:hover:text-amber-300 transition-colors cursor-pointer"
                      title="تدبرت بهذا الاسم"
                    >
                      <Heart className={`w-3.5 h-3.5 ${count > 0 ? 'fill-amber-600 text-amber-600 dark:fill-amber-400 dark:text-amber-400' : ''}`} />
                    </button>
                    <button
                      onClick={() => handleCopyName(item)}
                      className="p-1.5 rounded-lg hover:bg-stone-100 dark:hover:bg-stone-800 hover:text-stone-800 dark:hover:text-stone-200 transition-colors cursor-pointer"
                      title="نسخ"
                    >
                      <Copy className="w-3.5 h-3.5" />
                    </button>
                    <button
                      onClick={() => handleShareName(item)}
                      className="p-1.5 rounded-lg hover:bg-stone-100 dark:hover:bg-stone-800 hover:text-stone-800 dark:hover:text-stone-200 transition-colors cursor-pointer"
                      title="مشاركة"
                    >
                      <Share2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Detail / Contemplation Modal */}
      {selectedName && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-stone-900/60 backdrop-blur-xs">
          <div className="w-full max-w-lg bg-[#FAF9F5] dark:bg-stone-900 border border-amber-900/20 dark:border-stone-800 rounded-3xl shadow-2xl p-6 sm:p-8 text-right space-y-5 animate-in fade-in zoom-in-95 duration-200">
            
            <div className="flex items-center justify-between pb-3 border-b border-stone-200/80 dark:border-stone-800">
              <div className="flex items-center gap-2">
                <span className="w-8 h-8 rounded-xl bg-amber-100 dark:bg-stone-800 text-amber-900 dark:text-amber-300 font-mono text-xs font-bold flex items-center justify-center">
                  #{selectedName.number}
                </span>
                <span className="text-xs text-stone-500 dark:text-stone-400 font-mono">
                  {selectedName.transliteration}
                </span>
              </div>
              <button
                onClick={() => setSelectedName(null)}
                className="p-1 text-stone-400 hover:text-stone-700 dark:hover:text-stone-200 rounded-lg cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="text-center py-2">
              <div className="font-amiri text-5xl font-bold text-stone-900 dark:text-stone-100 mb-2">
                {selectedName.name}
              </div>
              <div className="text-xs text-amber-800 dark:text-amber-300 font-semibold bg-amber-100/60 dark:bg-stone-800 inline-block px-3 py-1 rounded-full border border-amber-200 dark:border-stone-700">
                صفة من صفات ال{selectedName.category} الإلهي
              </div>
            </div>

            <div className="p-4 rounded-2xl bg-white dark:bg-stone-850 border border-stone-200 dark:border-stone-750 space-y-2">
              <h4 className="text-xs font-bold text-stone-500 dark:text-stone-400">المعنى والدلالة:</h4>
              <p className="font-amiri text-lg text-stone-900 dark:text-stone-100 leading-relaxed font-semibold">
                {selectedName.meaning}
              </p>
            </div>

            <div className="p-4 rounded-2xl bg-[#F5F2EB] dark:bg-stone-800 border border-amber-900/10 dark:border-stone-700 space-y-2">
              <h4 className="text-xs font-bold text-stone-700 dark:text-stone-300">شرح وتدبر في الاسم الكريم:</h4>
              <p className="font-amiri text-base text-stone-800 dark:text-stone-200 leading-relaxed">
                {selectedName.explanation}
              </p>
            </div>

            {selectedName.quranicAyah && (
              <div className="p-4 rounded-2xl bg-amber-50/70 dark:bg-amber-950/30 border border-amber-200/80 dark:border-amber-800/50 text-center space-y-1">
                <div className="font-quran text-lg text-stone-900 dark:text-stone-100">
                  « {selectedName.quranicAyah} »
                </div>
                <div className="text-xs text-stone-500 dark:text-stone-400">
                  [{selectedName.ayahSource}]
                </div>
              </div>
            )}

            <div className="pt-2 flex flex-wrap items-center justify-between gap-2.5">
              <button
                onClick={() => {
                  handleContemplate(selectedName);
                }}
                className="px-4 py-2.5 rounded-xl bg-amber-800 hover:bg-amber-900 text-white font-amiri text-sm font-bold shadow-xs transition-all cursor-pointer flex items-center gap-1.5 active:scale-98"
              >
                <Heart className="w-4 h-4 fill-amber-300 text-amber-300" />
                <span>أهدِ ثواب تدبر هذا الاسم</span>
              </button>

              <div className="flex items-center gap-2">
                <button
                  onClick={() => handleToggleSave(selectedName)}
                  className={`px-3 py-2 rounded-xl border text-xs font-semibold cursor-pointer flex items-center gap-1.5 transition-all ${
                    savedNames.includes(selectedName.number)
                      ? 'bg-amber-100 dark:bg-stone-800 border-amber-400 dark:border-stone-700 text-amber-900 dark:text-amber-300 font-bold'
                      : 'border-stone-300 dark:border-stone-700 bg-white dark:bg-stone-850 hover:bg-stone-50 dark:hover:bg-stone-800 text-stone-700 dark:text-stone-300'
                  }`}
                >
                  <Bookmark className={`w-3.5 h-3.5 ${savedNames.includes(selectedName.number) ? 'fill-amber-700 text-amber-700 dark:fill-amber-400 dark:text-amber-400' : ''}`} />
                  <span>{savedNames.includes(selectedName.number) ? 'محفوظ' : 'حفظ الاسم'}</span>
                </button>

                <button
                  onClick={() => handleShareName(selectedName)}
                  className="px-3 py-2 rounded-xl border border-stone-300 dark:border-stone-700 bg-white dark:bg-stone-850 hover:bg-stone-50 dark:hover:bg-stone-800 text-stone-700 dark:text-stone-300 text-xs font-semibold cursor-pointer flex items-center gap-1.5"
                  title="مشاركة"
                >
                  <Share2 className="w-3.5 h-3.5" />
                  <span>مشاركة</span>
                </button>

                <button
                  onClick={() => handleCopyName(selectedName)}
                  className="px-3 py-2 rounded-xl border border-stone-300 dark:border-stone-700 bg-white dark:bg-stone-850 hover:bg-stone-50 dark:hover:bg-stone-800 text-stone-700 dark:text-stone-300 text-xs font-semibold cursor-pointer"
                  title="نسخ"
                >
                  <Copy className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>

          </div>
        </div>
      )}

      <ArabesqueDivider />

    </div>
  );
};
