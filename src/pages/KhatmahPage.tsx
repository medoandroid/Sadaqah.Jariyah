import React, { useState, useEffect } from 'react';
import {
  BookOpen,
  CheckCircle2,
  Clock,
  User,
  Heart,
  Sparkles,
  ShieldCheck,
  RotateCcw,
  Check,
  Plus
} from 'lucide-react';
import { KhatmahJuz } from '../types';
import { getKhatmahData, reserveJuz, completeJuz } from '../services/khatmahService';
import { HONORED_PERSONS } from '../data/persons';
import { userProfileService } from '../services/userProfileService';
import { CustomSelect } from '../components/CustomSelect';

interface KhatmahPageProps {
  onOpenSurah: (surahNumber: number) => void;
}

export const KhatmahPage: React.FC<KhatmahPageProps> = ({ onOpenSurah }) => {
  const profile = userProfileService.getProfile();
  const [juzList, setJuzList] = useState<KhatmahJuz[]>([]);
  const [selectedJuz, setSelectedJuz] = useState<KhatmahJuz | null>(null);
  const [readerName, setReaderName] = useState(profile.userName || '');
  const [targetPersonId, setTargetPersonId] = useState('all');
  const [toastMsg, setToastMsg] = useState<string | null>(null);

  useEffect(() => {
    setJuzList(getKhatmahData());
  }, []);

  const handleOpenReserve = (juz: KhatmahJuz) => {
    const currentProfile = userProfileService.getProfile();
    setReaderName(currentProfile.userName || '');
    setSelectedJuz(juz);
  };

  const showToast = (msg: string) => {
    setToastMsg(msg);
    setTimeout(() => setToastMsg(null), 2500);
  };

  const handleReserve = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedJuz) return;

    const ok = reserveJuz(selectedJuz.juzNumber, readerName, targetPersonId);
    if (ok) {
      setJuzList(getKhatmahData());
      setSelectedJuz(null);
      setReaderName('');
      showToast(`تم حجز ${selectedJuz.name} بنجاح، جزاك الله خيراً`);
    }
  };

  const handleComplete = (juzNumber: number, name: string) => {
    const ok = completeJuz(juzNumber);
    if (ok) {
      setJuzList(getKhatmahData());
      showToast(`تقبل الله قراءتك لـ ${name} وجعلها نوراً لأرواحهم الكريمة`);
    }
  };

  const [statusFilter, setStatusFilter] = useState<'all' | 'available' | 'reserved' | 'completed'>('all');
  const [juzSearch, setJuzSearch] = useState<string>('');

  const completedCount = juzList.filter((j) => j.status === 'completed').length;
  const reservedCount = juzList.filter((j) => j.status === 'reserved').length;
  const progressPercent = Math.round((completedCount / 30) * 100);

  const filteredJuzList = juzList.filter((juz) => {
    if (statusFilter !== 'all' && juz.status !== statusFilter) return false;
    if (juzSearch.trim()) {
      const q = juzSearch.trim().toLowerCase();
      return (
        juz.name.toLowerCase().includes(q) ||
        juz.startSurah.toLowerCase().includes(q) ||
        String(juz.juzNumber) === q
      );
    }
    return true;
  });

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
          <BookOpen className="w-3.5 h-3.5" />
          <span>الختمة القرآنية التشاركية</span>
        </div>
        <h1 className="font-amiri text-3xl sm:text-5xl font-bold text-stone-900 dark:text-stone-100">
          ختمة القرآن الكريم المهداة
        </h1>
        <p className="font-amiri text-base sm:text-lg text-stone-600 dark:text-stone-300 leading-relaxed">
          شارك معنا في قراءة أجزاء من القرآن الكريم وإهداء ثوابها لأرواح: رمضان الشهاوي، الشهاوي الشهاوي، الشافعي الشهاوي، واحمد الشهاوي.
        </p>
      </div>

      {/* Khatmah Progress Card */}
      <div className="p-6 sm:p-8 rounded-3xl bg-gradient-to-br from-amber-900 via-stone-900 to-stone-950 text-white shadow-xl space-y-5">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 text-amber-300 text-xs font-semibold mb-1">
              <Sparkles className="w-4 h-4" />
              <span>الختمة الحالية الجارية</span>
            </div>
            <h3 className="font-amiri text-2xl sm:text-3xl font-bold text-amber-100">
              أُنجز {completedCount} من أصل 30 جزءاً ({progressPercent}%)
            </h3>
          </div>

          <div className="flex items-center gap-3 text-xs">
            <span className="flex items-center gap-1.5 text-emerald-400">
              <span className="w-2.5 h-2.5 rounded-full bg-emerald-500" />
              <span>مكتمل ({completedCount})</span>
            </span>
            <span className="flex items-center gap-1.5 text-amber-400">
              <span className="w-2.5 h-2.5 rounded-full bg-amber-500" />
              <span>قيد القراءة ({reservedCount})</span>
            </span>
            <span className="flex items-center gap-1.5 text-stone-300">
              <span className="w-2.5 h-2.5 rounded-full bg-stone-500" />
              <span>متاح ({30 - completedCount - reservedCount})</span>
            </span>
          </div>
        </div>

        {/* Progress Bar */}
        <div className="w-full bg-stone-800/80 h-3 rounded-full overflow-hidden p-0.5 border border-stone-700">
          <div
            className="h-full bg-gradient-to-r from-emerald-600 to-amber-400 rounded-full transition-all duration-500"
            style={{ width: `${progressPercent}%` }}
          />
        </div>

        {completedCount === 30 && (
          <div className="p-4 rounded-xl bg-emerald-950/80 border border-emerald-500/50 text-emerald-200 text-sm flex items-center gap-3">
            <ShieldCheck className="w-6 h-6 text-emerald-400 shrink-0" />
            <div>
              <strong>الحمد لله الذي بنعمته تتم الصالحات!</strong> تمت هذه الختمة بالكامل وأُهدي ثوابها لأرواحهم الكريمة، نسأل الله القبول.
            </div>
          </div>
        )}
      </div>

      {/* 30 Juz Grid & Filters */}
      <div className="space-y-4">
        <div className="flex flex-wrap items-center justify-between gap-3 p-3.5 sm:p-4 rounded-2xl bg-white dark:bg-stone-900 border border-stone-200 dark:border-stone-800 shadow-xs">
          <div className="flex flex-wrap items-center gap-1.5">
            {[
              { id: 'all', label: `الكل (30)` },
              { id: 'available', label: `متاح (${30 - completedCount - reservedCount})` },
              { id: 'reserved', label: `قيد القراءة (${reservedCount})` },
              { id: 'completed', label: `مكتمل (${completedCount})` },
            ].map((tab) => (
              <button
                key={tab.id}
                onClick={() => setStatusFilter(tab.id as any)}
                className={`px-3 py-1.5 rounded-xl text-xs font-semibold transition-all cursor-pointer ${
                  statusFilter === tab.id
                    ? 'bg-amber-800 text-white shadow-xs'
                    : 'bg-stone-100 dark:bg-stone-800 text-stone-600 dark:text-stone-300 hover:bg-stone-200 dark:hover:bg-stone-750'
                }`}
              >
                {tab.label}
              </button>
            ))}
          </div>

          <div className="text-xs text-stone-500 dark:text-stone-400 font-medium">
            عرض {filteredJuzList.length} جزءاً
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-3.5">
          {filteredJuzList.map((juz) => {
            const isCompleted = juz.status === 'completed';
            const isReserved = juz.status === 'reserved';
            const isAvailable = juz.status === 'available';

            return (
              <div
                key={juz.juzNumber}
                className={`p-4 rounded-2xl border transition-all flex flex-col justify-between text-right relative ${
                  isCompleted
                    ? 'bg-emerald-50/70 dark:bg-emerald-950/25 border-emerald-300/80 dark:border-emerald-800/60 shadow-2xs'
                    : isReserved
                    ? 'bg-amber-50/70 dark:bg-amber-950/25 border-amber-300/80 dark:border-amber-800/60 shadow-2xs'
                    : 'bg-white dark:bg-stone-900 border-stone-200 dark:border-stone-800 hover:border-amber-400/70 dark:hover:border-stone-700 shadow-xs hover:shadow-md'
                }`}
              >
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <span className="w-7 h-7 rounded-lg bg-stone-100 dark:bg-stone-800 flex items-center justify-center font-mono text-xs font-bold text-stone-700 dark:text-stone-300">
                      {juz.juzNumber}
                    </span>
                    <span
                      className={`text-[10px] font-semibold px-2 py-0.5 rounded-md ${
                        isCompleted
                          ? 'bg-emerald-100 dark:bg-emerald-900/60 text-emerald-800 dark:text-emerald-300'
                          : isReserved
                          ? 'bg-amber-100 dark:bg-amber-900/60 text-amber-900 dark:text-amber-300'
                          : 'bg-stone-100 dark:bg-stone-800 text-stone-600 dark:text-stone-400'
                      }`}
                    >
                      {isCompleted ? 'تمت القراءة' : isReserved ? 'قيد القراءة' : 'متاح للحجز'}
                    </span>
                  </div>

                  <h4 className="font-amiri text-lg font-bold text-stone-900 dark:text-stone-100">
                    {juz.name}
                  </h4>
                  <p className="text-[11px] text-stone-500 dark:text-stone-400 mb-3 truncate">
                    {juz.startSurah}
                  </p>

                  {isReserved && juz.readerName && (
                    <div className="text-[11px] text-amber-800 dark:text-amber-400 font-medium mb-3 flex items-center gap-1">
                      <User className="w-3 h-3" />
                      <span>القائم بالقراءة: {juz.readerName}</span>
                    </div>
                  )}

                  {isCompleted && juz.readerName && (
                    <div className="text-[11px] text-emerald-800 dark:text-emerald-400 font-medium mb-3 flex items-center gap-1">
                      <CheckCircle2 className="w-3 h-3" />
                      <span>قراءة: {juz.readerName}</span>
                    </div>
                  )}
                </div>

                <div className="pt-2 border-t border-stone-100/80 dark:border-stone-800">
                  {isAvailable && (
                    <button
                      onClick={() => handleOpenReserve(juz)}
                      className="w-full py-2 px-3 rounded-xl bg-amber-800 hover:bg-amber-900 text-white text-xs font-bold transition-colors cursor-pointer flex items-center justify-center gap-1.5 active:scale-98"
                    >
                      <Plus className="w-3.5 h-3.5" />
                      <span>احجز هذا الجزء</span>
                    </button>
                  )}

                  {isReserved && (
                    <button
                      onClick={() => handleComplete(juz.juzNumber, juz.name)}
                      className="w-full py-2 px-3 rounded-xl bg-emerald-700 hover:bg-emerald-800 text-white text-xs font-bold transition-colors cursor-pointer flex items-center justify-center gap-1.5 active:scale-98"
                    >
                      <Check className="w-3.5 h-3.5" />
                      <span>تأكيد إتمام القراءة</span>
                    </button>
                  )}

                  {isCompleted && (
                    <div className="text-center text-xs font-bold text-emerald-700 dark:text-emerald-400 py-1 flex items-center justify-center gap-1">
                      <CheckCircle2 className="w-3.5 h-3.5" />
                      <span>أُهدي ثوابه بحمد الله</span>
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Reservation Modal */}
      {selectedJuz && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-stone-900/60 backdrop-blur-xs">
          <div className="w-full max-w-md bg-white dark:bg-stone-900 border border-stone-200 dark:border-stone-800 rounded-3xl shadow-2xl p-6 text-right space-y-4 animate-in fade-in duration-200">
            <h3 className="font-amiri text-2xl font-bold text-stone-900 dark:text-stone-100">
              حجز {selectedJuz.name} للقراءة
            </h3>
            <p className="text-xs text-stone-600 dark:text-stone-400">
              اختر هذا الجزء لتتلوه وتهدي ثوابه لأرواحهم الطاهرة.
            </p>

            <form onSubmit={handleReserve} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-stone-700 dark:text-stone-300 mb-1">
                  اسم القارئ (اختياري)
                </label>
                <input
                  type="text"
                  value={readerName}
                  onChange={(e) => setReaderName(e.target.value)}
                  placeholder={profile.userName || 'فاعل خير'}
                  className="w-full px-3 py-2 text-xs bg-stone-50 dark:bg-stone-850 border border-stone-200 dark:border-stone-750 text-stone-900 dark:text-stone-100 rounded-xl focus:outline-hidden focus:border-amber-700"
                />
              </div>

              <div>
                <CustomSelect
                  label="إهداء الثواب إلى:"
                  value={targetPersonId}
                  onChange={(val) => setTargetPersonId(String(val))}
                  options={[
                    { value: 'all', label: 'جميع الأرواح الأربعة معاً' },
                    ...(profile.closestRelative
                      ? [
                          {
                            value: 'custom_closest',
                            label: `طرفك الأقرب (${profile.closestRelative})`,
                            sublabel: 'إهداء خاص محفوظ في جهازك',
                            badge: 'مخصص',
                          },
                        ]
                      : []),
                    ...HONORED_PERSONS.map((p) => ({
                      value: p.id,
                      label: p.name,
                      sublabel: p.relationTitle,
                    })),
                  ]}
                  size="sm"
                />
              </div>

              <div className="flex items-center justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setSelectedJuz(null)}
                  className="px-3 py-1.5 rounded-lg text-xs text-stone-500 dark:text-stone-400 hover:bg-stone-100 dark:hover:bg-stone-800 cursor-pointer"
                >
                  إلغاء
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 rounded-xl bg-amber-800 hover:bg-amber-900 text-white text-xs font-bold transition-colors cursor-pointer"
                >
                  تأكيد الحجز والبدء
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
};
