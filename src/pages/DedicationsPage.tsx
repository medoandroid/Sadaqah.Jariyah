import React, { useState, useEffect } from 'react';
import {
  Sparkles,
  Heart,
  BookOpen,
  CircleDot,
  Clock,
  Plus,
  Layers,
  HeartHandshake
} from 'lucide-react';
import { getRecentDedications, getDedicationStats } from '../services/dedicationService';
import { DedicationRecord } from '../types';
import { HONORED_PERSONS } from '../data/persons';
import { storageService } from '../services/storageService';

interface DedicationsPageProps {
  onOpenDedicationModal: () => void;
}

export const DedicationsPage: React.FC<DedicationsPageProps> = ({ onOpenDedicationModal }) => {
  const [recentList, setRecentList] = useState<DedicationRecord[]>([]);
  const [filterPerson, setFilterPerson] = useState<string>('all');
  const stats = getDedicationStats();
  const realTasbeehCount = storageService.getNumber('tasbeeh_total', 0);
  const totalTasbeehDisplay = Math.max(stats.totalTasbeehs, realTasbeehCount);

  useEffect(() => {
    setRecentList(getRecentDedications());
  }, []);

  const filteredDedications = recentList.filter((item) => {
    if (filterPerson === 'all') return true;
    return item.targetPersonId === filterPerson || item.targetPersonId === 'all';
  });

  const formatTimestamp = (ts: number) => {
    const diff = Date.now() - ts;
    const mins = Math.floor(diff / (1000 * 60));
    if (mins < 1) return 'الآن';
    if (mins < 60) return `منذ ${mins} دقيقة`;
    const hours = Math.floor(mins / 60);
    if (hours < 24) return `منذ ${hours} ساعة`;
    const days = Math.floor(hours / 24);
    return `منذ ${days} يوم`;
  };

  const getTypeIcon = (type: DedicationRecord['type']) => {
    switch (type) {
      case 'surah':
        return <BookOpen className="w-4 h-4 text-amber-700" />;
      case 'tasbeeh':
        return <CircleDot className="w-4 h-4 text-amber-700" />;
      case 'dua':
      default:
        return <Heart className="w-4 h-4 text-amber-700" />;
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-10 text-right">
      
      {/* Header */}
      <div className="text-center max-w-2xl mx-auto space-y-3">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-amber-100/70 border border-amber-300 text-amber-900 text-xs font-semibold">
          <Sparkles className="w-3.5 h-3.5" />
          <span>إهداء الأعمال الصالحة والبر</span>
        </div>
        <h1 className="font-amiri text-3xl sm:text-5xl font-bold text-stone-900 dark:text-stone-100">
          سجل الأعمال الصالحة المهداة
        </h1>
        <p className="font-amiri text-base sm:text-lg text-stone-600 dark:text-stone-400 leading-relaxed">
          سجل مبارك يجتمع فيه ثواب قراءة القرآن والتسبيح والدعاء المقدم لأرواح المغفور لهم بإذن الله.
        </p>
      </div>

      {/* Real Stats Counter Bar (Starts at 0, no fake numbers) */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        <div className="p-5 rounded-2xl bg-white dark:bg-stone-900 border border-stone-200 dark:border-stone-800 shadow-xs text-center">
          <div className="font-mono text-3xl font-bold text-amber-900 dark:text-amber-400 tabular-nums">
            {stats.totalSurahsRecited}
          </div>
          <div className="text-xs text-stone-700 dark:text-stone-200 font-bold mt-1">
            سور مقروءة ومستمعة
          </div>
        </div>

        <div className="p-5 rounded-2xl bg-white dark:bg-stone-900 border border-stone-200 dark:border-stone-800 shadow-xs text-center">
          <div className="font-mono text-3xl font-bold text-amber-900 dark:text-amber-400 tabular-nums">
            {totalTasbeehDisplay}
          </div>
          <div className="text-xs text-stone-700 dark:text-stone-200 font-bold mt-1">
            تسبيحة واستغفار
          </div>
        </div>

        <div className="p-5 rounded-2xl bg-white dark:bg-stone-900 border border-stone-200 dark:border-stone-800 shadow-xs text-center">
          <div className="font-mono text-3xl font-bold text-amber-900 dark:text-amber-400 tabular-nums">
            {stats.totalPrayers}
          </div>
          <div className="text-xs text-stone-700 dark:text-stone-200 font-bold mt-1">
            دعوة خالصة بالرحمة
          </div>
        </div>

        <div className="p-5 rounded-2xl bg-white dark:bg-stone-900 border border-stone-200 dark:border-stone-800 shadow-xs text-center">
          <div className="font-mono text-3xl font-bold text-amber-900 dark:text-amber-400 tabular-nums">
            {stats.totalKhatmahs}
          </div>
          <div className="text-xs text-stone-700 dark:text-stone-200 font-bold mt-1">
            ختمة وأجزاء قرآنية
          </div>
        </div>
      </div>

      {/* Action Banner */}
      <div className="p-6 sm:p-8 rounded-3xl bg-amber-50/90 dark:bg-stone-900 border border-amber-200 dark:border-amber-700/40 flex flex-col sm:flex-row items-center justify-between gap-6 shadow-sm">
        <div className="space-y-1">
          <h3 className="font-amiri text-2xl font-bold text-stone-900 dark:text-stone-100">
            أهدِ ثواب عمل صالح الآن
          </h3>
          <p className="font-amiri text-sm text-stone-700 dark:text-stone-300 font-medium">
            يمكنك إهداء ثواب قراءة سورة، أو تسبيح، أو دعاء مخلص ليصل إلى أرواحهم الكريمة فوراً.
          </p>
        </div>

        <button
          onClick={onOpenDedicationModal}
          className="px-6 py-3 rounded-xl bg-amber-800 hover:bg-amber-900 text-white font-amiri text-base font-bold shadow-md hover:shadow-lg transition-all cursor-pointer flex items-center gap-2 shrink-0 active:scale-98"
        >
          <Plus className="w-5 h-5" />
          <span>إهداء ثواب جديد</span>
        </button>
      </div>

      {/* Filter and Feed */}
      <div className="space-y-4">
        
        {/* Person Filters */}
        <div className="flex flex-wrap items-center justify-between gap-3 p-4 rounded-2xl bg-white dark:bg-stone-900 border border-stone-200 dark:border-stone-800">
          <span className="text-xs font-bold text-stone-700 dark:text-stone-300">
            تصفية الإهداءات حسب المتوفى:
          </span>

          <div className="flex flex-wrap items-center gap-1.5">
            <button
              onClick={() => setFilterPerson('all')}
              className={`px-3 py-1.5 rounded-lg text-xs font-medium cursor-pointer transition-colors ${
                filterPerson === 'all'
                  ? 'bg-amber-800 text-white font-bold'
                  : 'bg-stone-100 dark:bg-stone-800 text-stone-700 dark:text-stone-300 hover:bg-stone-200 font-medium'
              }`}
            >
              الجميع
            </button>
            {HONORED_PERSONS.map((p) => (
              <button
                key={p.id}
                onClick={() => setFilterPerson(p.id)}
                className={`px-3 py-1.5 rounded-lg text-xs font-amiri cursor-pointer transition-colors ${
                  filterPerson === p.id
                    ? 'bg-amber-800 text-white font-bold'
                    : 'bg-stone-100 dark:bg-stone-800 text-stone-700 dark:text-stone-300 hover:bg-stone-200 font-medium'
                }`}
              >
                {p.name}
              </button>
            ))}
          </div>
        </div>

        {/* List of Real Dedications */}
        {filteredDedications.length === 0 ? (
          <div className="py-16 text-center rounded-3xl bg-white dark:bg-stone-900 border border-stone-200 dark:border-stone-800 space-y-3">
            <HeartHandshake className="w-10 h-10 text-amber-700/50 mx-auto" />
            <div className="font-amiri text-lg font-bold text-stone-800 dark:text-stone-200">
              لا توجد إهداءات مسجلة بعد
            </div>
            <p className="text-xs text-stone-500 max-w-sm mx-auto">
              سجل إهداءك الأول الآن بالدعاء لهم أو إهداء ثواب تلاوة وتسبيح ليظهر هنا في ميزان حسناتهم بإذن الله.
            </p>
            <button
              onClick={onOpenDedicationModal}
              className="mt-2 inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-amber-800 text-white text-xs font-bold hover:bg-amber-900 cursor-pointer"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>إهداء ثواب أول عمل</span>
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            {filteredDedications.map((item) => (
              <div
                key={item.id}
                className="p-4 rounded-2xl bg-white dark:bg-stone-900 border border-stone-200/80 dark:border-stone-800 hover:border-amber-400/50 shadow-2xs transition-all flex items-center justify-between"
              >
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-amber-50 dark:bg-stone-800 border border-amber-200/60 dark:border-stone-700 flex items-center justify-center shrink-0">
                    {getTypeIcon(item.type)}
                  </div>
                  <div>
                    <div className="font-amiri text-base font-bold text-stone-900 dark:text-stone-100">
                      {item.title}
                    </div>
                    <div className="text-xs text-amber-800 dark:text-amber-400 font-medium mt-0.5">
                      مهداة إلى: <span>{item.targetPersonName}</span>
                    </div>
                  </div>
                </div>

                <div className="text-left shrink-0">
                  <div className="text-[11px] text-stone-600 dark:text-stone-400 flex items-center gap-1 font-medium">
                    <Clock className="w-3 h-3 text-amber-600 dark:text-amber-400" />
                    <span>{formatTimestamp(item.timestamp)}</span>
                  </div>
                  <div className="text-[11px] text-stone-700 dark:text-stone-300 font-semibold mt-0.5">
                    بواسطة: {item.donorName || 'مسبح كريم'}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

      </div>

      {/* Islamic Scholarly Reference on Gifting Deeds */}
      <div className="p-6 rounded-2xl bg-[#FAF9F5] dark:bg-stone-900 border border-stone-200 dark:border-stone-800 text-stone-800 dark:text-stone-200 space-y-2">
        <h4 className="font-amiri text-lg font-bold text-amber-950 dark:text-amber-400 flex items-center gap-2">
          <BookOpen className="w-4 h-4 text-amber-800 dark:text-amber-400" />
          <span>فضل وصول ثواب الأعمال الصالحة والدعاء للميت</span>
        </h4>
        <p className="font-amiri text-sm leading-relaxed text-stone-700 dark:text-stone-300 font-medium">
          أجمع علماء الأمة على انتفاع الميت بدعاء الأحياء واستغفارهم والصدقة عنه.
          وكذلك ذهب جمهور أهل السنة والجماعة إلى وصول ثواب قراءة القرآن الكريم والتسبيح إذا وهب القارئ ثوابها للميت وسأل الله أن يوصله إليه، ففضل الله واسع ورحمته تسع كل شيء.
        </p>
      </div>

    </div>
  );
};
