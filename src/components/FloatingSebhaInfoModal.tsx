import React from 'react';
import {
  X,
  ShieldCheck,
  Smartphone,
  Bell,
  CheckCircle2,
  AlertCircle,
  Sparkles,
  Info
} from 'lucide-react';

interface FloatingSebhaInfoModalProps {
  isOpen: boolean;
  onClose: () => void;
  onOpenNotifications?: () => void;
}

export const FloatingSebhaInfoModal: React.FC<FloatingSebhaInfoModalProps> = ({
  isOpen,
  onClose,
  onOpenNotifications,
}) => {
  if (!isOpen) return null;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/75 backdrop-blur-sm animate-fade-in"
      onClick={onClose}
      dir="rtl"
    >
      <div
        className="w-full max-w-lg bg-stone-900 border border-amber-800/40 rounded-3xl shadow-2xl text-stone-100 overflow-hidden"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between p-4 sm:p-5 border-b border-stone-800 bg-stone-950/70">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-amber-500/15 border border-amber-500/30 flex items-center justify-center text-amber-400">
              <Info className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-amiri text-lg sm:text-xl font-bold text-amber-300">
                السبحة العائمة والتنبيهات
              </h3>
              <p className="text-[11px] text-stone-400">
                إزاي السبحة العائمة والتنبيهات بتشتغل معاك خطوة بخطوة
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 text-stone-400 hover:text-stone-200 hover:bg-stone-800 rounded-xl transition cursor-pointer"
            aria-label="إغلاق"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="p-5 sm:p-6 space-y-4 text-xs sm:text-sm leading-relaxed text-stone-300">
          
          <div className="p-4 rounded-2xl bg-amber-500/10 border border-amber-500/25 space-y-2 text-amber-100">
            <div className="flex items-center gap-2 font-bold text-amber-300">
              <Smartphone className="w-4 h-4 shrink-0" />
              <span>إزاي تستفيد من السبحة العائمة والتنبيهات؟</span>
            </div>
            <p className="text-xs text-stone-300 leading-relaxed">
              علشان نظام الأمان والخصوصية في الموبايل والمتصفحات (زي كروم وسفاري)، مفيش أي موقع يقدر يفتح نافذة عائمة فوق تطبيقات تانية برة المتصفح علشان أمان جهازك. بس عملنا لك حلول عملية وسهلة تخلي ذكر الله دايمًا معاك:
            </p>
          </div>

          <div className="space-y-3 pt-1">
            <h4 className="font-bold text-stone-200 text-xs flex items-center gap-1.5">
              <CheckCircle2 className="w-4 h-4 text-emerald-400" />
              <span>الحلول اللي جهزناها لك هنا:</span>
            </h4>

            <div className="space-y-2 text-xs">
              <div className="p-3 rounded-xl bg-stone-950/60 border border-stone-800 flex items-start gap-2.5">
                <span className="w-5 h-5 rounded-full bg-amber-500/20 text-amber-300 flex items-center justify-center font-bold text-[11px] shrink-0 mt-0.5">١</span>
                <p>
                  <strong>سبحة عائمة حرة وخفيفة:</strong> بتتحرك معاك فوق كل صفحات ومصاحف وأذكار المنصة، تقدر تسحبها في أي مكان، وتكبرها أو تصغرها براحتك، وتسبح وأنت بتقرأ أو بتتصفح.
                </p>
              </div>

              <div className="p-3 rounded-xl bg-stone-950/60 border border-stone-800 flex items-start gap-2.5">
                <span className="w-5 h-5 rounded-full bg-amber-500/20 text-amber-300 flex items-center justify-center font-bold text-[11px] shrink-0 mt-0.5">٢</span>
                <p>
                  <strong>إشعارات الأذكار والصلاة على النبي ﷺ:</strong> تقدر تظبط تنبيهات دورية في الوقت اللي تحبه، وتجيلك حتى لو قفلت التطبيق وعلى شاشة القفل.
                </p>
              </div>
            </div>
          </div>

        </div>

        {/* Footer */}
        <div className="p-4 sm:p-5 border-t border-stone-800 bg-stone-950/70 flex items-center justify-between gap-3">
          {onOpenNotifications && (
            <button
              onClick={() => {
                onClose();
                onOpenNotifications();
              }}
              className="px-4 py-2 rounded-xl bg-gradient-to-r from-amber-600 to-amber-700 hover:from-amber-500 hover:to-amber-600 text-white font-bold text-xs flex items-center gap-1.5 transition cursor-pointer shadow-md"
            >
              <Bell className="w-3.5 h-3.5" />
              <span>تخصيص الإشعارات المجدولة</span>
            </button>
          )}

          <button
            onClick={onClose}
            className="px-4 py-2 rounded-xl bg-stone-800 hover:bg-stone-700 text-stone-200 text-xs font-semibold transition cursor-pointer"
          >
            حسناً، فهمت
          </button>
        </div>
      </div>
    </div>
  );
};
