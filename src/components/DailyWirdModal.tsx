import React, { useState, useEffect } from 'react';
import {
  Flame,
  CheckCircle,
  Plus,
  Minus,
  Sparkles,
  Heart,
  X,
  RotateCcw,
  BookOpen,
  Calendar,
  Award
} from 'lucide-react';
import { dailyWirdService } from '../services/dailyWirdService';
import { DailyWirdData } from '../types';
import { recordDedication } from '../services/dedicationService';

interface DailyWirdModalProps {
  isOpen: boolean;
  onClose: () => void;
  onOpenDedication?: () => void;
}

export const DailyWirdModal: React.FC<DailyWirdModalProps> = ({
  isOpen,
  onClose,
  onOpenDedication,
}) => {
  const [wirdData, setWirdData] = useState<DailyWirdData>(dailyWirdService.getWirdData());
  const [targetInput, setTargetInput] = useState<number>(wirdData.targetPages);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  useEffect(() => {
    if (isOpen) {
      const d = dailyWirdService.getWirdData();
      setWirdData(d);
      setTargetInput(d.targetPages);
    }
  }, [isOpen]);

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 2500);
  };

  const handleUpdateTarget = (pages: number) => {
    const updated = dailyWirdService.setTarget(pages, 'pages');
    setWirdData(updated);
    setTargetInput(pages);
    showToast(`تم تعيين الورد اليومي إلى ${pages} صفحات`);
  };

  const handleAddProgress = (pages: number) => {
    const { data, justCompleted } = dailyWirdService.addProgress(pages);
    setWirdData(data);
    if (justCompleted) {
      showToast('🎉 مبارك! أتممت وردك اليومي بنجاح، تقبل الله منك');
      recordDedication('khatmah', `إتمام الورد القرآني اليومي (${data.targetPages} صفحة)`, 'all', 1, 'قارئ مداوم');
    } else {
      showToast(`تم تسجيل قراءة ${pages} صفحة`);
    }
  };

  const handleResetToday = () => {
    const updated = dailyWirdService.resetToday();
    setWirdData(updated);
    showToast('تم إعادة تعيين إنجاز اليوم');
  };

  const isCompleted = wirdData.completedToday >= wirdData.targetPages;
  const progressPercent = Math.min(100, (wirdData.completedToday / wirdData.targetPages) * 100);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-5 bg-stone-950/80 backdrop-blur-md animate-in fade-in duration-200 select-none">
      <div className="w-full max-w-lg bg-white dark:bg-stone-900 rounded-3xl p-6 sm:p-7 text-right shadow-2xl border border-stone-200 dark:border-stone-800 space-y-6">
        
        {/* Toast Alert */}
        {toastMessage && (
          <div className="fixed top-14 left-1/2 -translate-x-1/2 z-50 px-4 py-2 rounded-xl bg-stone-900 text-amber-200 text-xs font-semibold shadow-xl border border-amber-500/30">
            {toastMessage}
          </div>
        )}

        {/* Modal Header */}
        <div className="flex items-center justify-between pb-3 border-b border-stone-100 dark:border-stone-800">
          <div className="flex items-center gap-2">
            <BookOpen className="w-5 h-5 text-amber-700" />
            <h3 className="font-amiri text-2xl font-bold text-stone-900 dark:text-stone-100">
              الورد القرآني ومتابعة التلاوة اليومية
            </h3>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 text-stone-400 hover:text-stone-700 dark:hover:text-stone-200 rounded-lg cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Streak & Today's Status Banner */}
        <div className="p-5 rounded-2xl bg-gradient-to-r from-amber-500/15 via-amber-600/10 to-amber-700/5 dark:bg-stone-800/60 border border-amber-500/30 flex items-center justify-between">
          <div className="space-y-1">
            <span className="text-[11px] font-semibold text-stone-500 dark:text-stone-400">
              مداومة الورد اليومي
            </span>
            <div className="flex items-center gap-2">
              <Flame className="w-6 h-6 text-amber-500 animate-pulse fill-amber-500/20" />
              <span className="font-mono text-2xl font-bold text-stone-900 dark:text-stone-100">
                {wirdData.streakDays}
              </span>
              <span className="text-xs text-stone-600 dark:text-stone-300 font-bold">
                أيام متتالية
              </span>
            </div>
          </div>

          <div className="text-left space-y-1">
            <span className="text-[11px] text-stone-500 dark:text-stone-400">
              المجموع الإجمالي
            </span>
            <div className="font-mono text-xl font-bold text-amber-800 dark:text-amber-400">
              {wirdData.totalCompleted} <span className="text-xs font-sans text-stone-500">صفحة</span>
            </div>
          </div>
        </div>

        {/* Today's Progress Card */}
        <div className="p-5 rounded-2xl bg-white dark:bg-stone-850 border border-stone-200 dark:border-stone-750 shadow-xs space-y-3">
          <div className="flex items-center justify-between text-xs">
            <span className="font-bold text-stone-700 dark:text-stone-300">
              إنجاز اليوم:
            </span>
            <span className="font-mono text-sm font-bold text-amber-800 dark:text-amber-400">
              {wirdData.completedToday} / {wirdData.targetPages} صفحات ({Math.round(progressPercent)}%)
            </span>
          </div>

          {/* Progress Bar */}
          <div className="w-full bg-stone-100 dark:bg-stone-800 h-3 rounded-full overflow-hidden">
            <div
              className={`h-full transition-all duration-300 rounded-full ${
                isCompleted ? 'bg-emerald-600' : 'bg-gradient-to-r from-amber-600 to-amber-500'
              }`}
              style={{ width: `${progressPercent}%` }}
            />
          </div>

          {/* Completed State or Quick Add Buttons */}
          {isCompleted ? (
            <div className="p-3 rounded-xl bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-300/80 dark:border-emerald-700/50 flex items-center justify-between">
              <div className="flex items-center gap-2 text-emerald-800 dark:text-emerald-300 text-xs font-bold">
                <CheckCircle className="w-4 h-4 text-emerald-600" />
                <span>أتممت وردك المبارك لهذا اليوم، هنيئاً لك!</span>
              </div>
              <button
                onClick={() => handleAddProgress(1)}
                className="text-[11px] underline font-bold text-emerald-700 hover:text-emerald-900 cursor-pointer"
              >
                + صفحة إضافية
              </button>
            </div>
          ) : (
            <div className="flex items-center justify-between pt-1">
              <span className="text-xs text-stone-500">سجل ما قرأته الآن:</span>
              <div className="flex items-center gap-1.5">
                <button
                  onClick={() => handleAddProgress(1)}
                  className="px-3 py-1.5 rounded-xl bg-amber-800 hover:bg-amber-900 text-white text-xs font-bold cursor-pointer transition-colors shadow-xs active:scale-95"
                >
                  + ١ صفحة
                </button>
                <button
                  onClick={() => handleAddProgress(2)}
                  className="px-3 py-1.5 rounded-xl bg-amber-800 hover:bg-amber-900 text-white text-xs font-bold cursor-pointer transition-colors shadow-xs active:scale-95"
                >
                  + ٢ صفحة
                </button>
                <button
                  onClick={() => handleAddProgress(wirdData.targetPages - wirdData.completedToday)}
                  className="px-3 py-1.5 rounded-xl bg-emerald-700 hover:bg-emerald-800 text-white text-xs font-bold cursor-pointer transition-colors shadow-xs active:scale-95"
                >
                  إتمام الورد
                </button>
              </div>
            </div>
          )}
        </div>

        {/* Set Daily Goal Preset Chips */}
        <div>
          <label className="block text-xs font-bold text-stone-700 dark:text-stone-300 mb-2">
            حدد هدف وردك اليومي (عدد الصفحات):
          </label>
          <div className="grid grid-cols-4 gap-2">
            {[
              { pages: 2, label: 'صفحتان' },
              { pages: 4, label: '٤ صفحات' },
              { pages: 10, label: 'نصف جزء' },
              { pages: 20, label: 'جزء كامل' },
            ].map((p) => (
              <button
                key={p.pages}
                onClick={() => handleUpdateTarget(p.pages)}
                className={`py-2 px-1 rounded-xl text-xs font-semibold transition-all cursor-pointer text-center ${
                  wirdData.targetPages === p.pages
                    ? 'bg-amber-800 text-white shadow-xs font-bold ring-2 ring-amber-500/40'
                    : 'bg-stone-100 dark:bg-stone-800 text-stone-600 dark:text-stone-300 hover:bg-stone-200'
                }`}
              >
                <div>{p.pages} ص</div>
                <div className="text-[10px] opacity-75">{p.label}</div>
              </button>
            ))}
          </div>
        </div>

        {/* Footer Actions */}
        <div className="flex items-center justify-between pt-2 border-t border-stone-100 dark:border-stone-800 text-xs">
          <button
            onClick={handleResetToday}
            className="flex items-center gap-1 text-stone-400 hover:text-stone-700 dark:hover:text-stone-200 cursor-pointer"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            <span>إعادة ضبط اليوم</span>
          </button>

          <button
            onClick={() => {
              recordDedication('khatmah', `إهداء ثواب الورد اليومي (${wirdData.completedToday} صفحة)`, 'all', 1, 'قارئ بار');
              showToast('تم إهداء ثواب وردك لأرواحهم الطاهرة');
            }}
            className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-amber-100/70 hover:bg-amber-100 text-amber-900 dark:bg-amber-950/40 dark:text-amber-300 font-bold transition-colors cursor-pointer"
          >
            <Heart className="w-3.5 h-3.5 fill-current text-amber-700" />
            <span>إهداء ثواب هذا الورد</span>
          </button>
        </div>

      </div>
    </div>
  );
};
