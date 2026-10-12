import React, { useState, useEffect } from 'react';
import {
  X,
  User,
  Heart,
  Save,
  RotateCcw,
  Sparkles,
  ShieldCheck,
  CheckCircle2,
  FileText,
  Bookmark
} from 'lucide-react';
import { projectOwnerService, ProjectOwnerProfile } from '../services/projectOwnerService';

interface OwnerSadaqahModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSaved?: () => void;
}

export const OwnerSadaqahModal: React.FC<OwnerSadaqahModalProps> = ({
  isOpen,
  onClose,
  onSaved,
}) => {
  const [profile, setProfile] = useState<ProjectOwnerProfile>(() => projectOwnerService.getOwnerProfile());
  const [isSavedNotice, setIsSavedNotice] = useState(false);

  useEffect(() => {
    if (isOpen) {
      setProfile(projectOwnerService.getOwnerProfile());
      setIsSavedNotice(false);
    }
  }, [isOpen]);

  if (!isOpen) return null;

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    projectOwnerService.saveOwnerProfile(profile);
    setIsSavedNotice(true);
    if (onSaved) onSaved();
    setTimeout(() => {
      setIsSavedNotice(false);
      onClose();
    }, 900);
  };

  const handleReset = () => {
    if (window.confirm('هل تحب ترجع للبيانات والكلام الافتراضي لصاحب المنصة؟')) {
      const reset = projectOwnerService.resetToDefaults();
      setProfile(reset);
    }
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/75 backdrop-blur-sm animate-fade-in"
      onClick={onClose}
      dir="rtl"
    >
      <div
        className="w-full max-w-xl max-h-[92vh] flex flex-col bg-stone-900 border border-amber-800/40 rounded-3xl shadow-2xl text-stone-100 overflow-hidden"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between p-4 sm:p-5 border-b border-stone-800 bg-stone-950/70">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-amber-500/15 border border-amber-500/30 flex items-center justify-center text-amber-400">
              <Sparkles className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-amiri text-lg sm:text-xl font-bold text-amber-300">
                تخصيص صدقة جارية لصاحب المنصة
              </h3>
              <p className="text-[11px] text-stone-400">
                حفظ بيانات وأدعية ورسالة صاحب المنصة من القلب
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 text-stone-400 hover:text-stone-200 hover:bg-stone-800 rounded-xl transition-colors cursor-pointer"
            aria-label="إغلاق"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Scrollable Form Body */}
        <form onSubmit={handleSave} className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-4 sm:space-y-5 text-xs sm:text-sm">
          {/* Activation Switch */}
          <div className="p-4 rounded-2xl bg-stone-950/80 border border-amber-500/20 flex items-center justify-between gap-4">
            <div className="space-y-1">
              <div className="flex items-center gap-2">
                <span className="font-bold text-stone-200">تفعيل صفحة صدقة صاحب المنصة</span>
                <span className={`text-[10px] px-2 py-0.5 rounded-full font-bold ${
                  profile.isActivated
                    ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30'
                    : 'bg-stone-800 text-stone-400'
                }`}>
                  {profile.isActivated ? 'مُفعّلة وظاهرة' : 'في وضع الاستعداد'}
                </span>
              </div>
              <p className="text-[11px] text-stone-400 leading-relaxed">
                إظهار صفحة الصدقة الجارية لصاحب المنصة والأدعية الخاصة به في قائمة المنصة والإهداءات.
              </p>
            </div>
            <label className="relative inline-flex items-center cursor-pointer shrink-0">
              <input
                type="checkbox"
                checked={profile.isActivated}
                onChange={(e) => setProfile({ ...profile, isActivated: e.target.checked })}
                className="sr-only peer"
              />
              <div className="w-12 h-6 bg-stone-800 peer-focus:outline-hidden rounded-full peer peer-checked:after:translate-x-full rtl:peer-checked:after:-translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:start-[2px] after:bg-white after:border-stone-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-amber-600"></div>
            </label>
          </div>

          {/* Owner Full Name */}
          <div className="space-y-1.5">
            <label className="block text-xs font-bold text-stone-300 flex items-center gap-1.5">
              <User className="w-3.5 h-3.5 text-amber-400" />
              الاسم الكامل لصاحب المنصة / العمل:
            </label>
            <input
              type="text"
              required
              value={profile.name}
              onChange={(e) => setProfile({ ...profile, name: e.target.value })}
              placeholder="مثال: أحمد الشهاوي"
              className="w-full px-3.5 py-2.5 rounded-xl bg-stone-950 border border-stone-800 focus:border-amber-500 focus:outline-hidden text-stone-100 placeholder-stone-500"
            />
          </div>

          {/* Title / Role */}
          <div className="space-y-1.5">
            <label className="block text-xs font-bold text-stone-300 flex items-center gap-1.5">
              <Bookmark className="w-3.5 h-3.5 text-amber-400" />
              الصفة أو اللقب:
            </label>
            <input
              type="text"
              value={profile.title}
              onChange={(e) => setProfile({ ...profile, title: e.target.value })}
              placeholder="مثال: صانع المنصة ومحب الخير لأهله"
              className="w-full px-3.5 py-2.5 rounded-xl bg-stone-950 border border-stone-800 focus:border-amber-500 focus:outline-hidden text-stone-100 placeholder-stone-500"
            />
          </div>

          {/* Bio / Background */}
          <div className="space-y-1.5">
            <label className="block text-xs font-bold text-stone-300 flex items-center gap-1.5">
              <FileText className="w-3.5 h-3.5 text-amber-400" />
              كلمة وسيرة عن صاحب العمل والنية الصالحة:
            </label>
            <textarea
              rows={3}
              value={profile.bio}
              onChange={(e) => setProfile({ ...profile, bio: e.target.value })}
              className="w-full p-3 rounded-xl bg-stone-950 border border-stone-800 focus:border-amber-500 focus:outline-hidden text-stone-100 leading-relaxed text-xs"
            />
          </div>

          {/* Dedication Dua */}
          <div className="space-y-1.5">
            <label className="block text-xs font-bold text-stone-300 flex items-center gap-1.5">
              <Heart className="w-3.5 h-3.5 text-rose-400" />
              الأدعية المخصصة له (في حياته وبعد وفاته):
            </label>
            <textarea
              rows={4}
              value={profile.dedicationDua}
              onChange={(e) => setProfile({ ...profile, dedicationDua: e.target.value })}
              className="w-full p-3 rounded-xl bg-stone-950 border border-stone-800 focus:border-amber-500 focus:outline-hidden text-stone-100 leading-relaxed text-xs font-amiri text-amber-200"
            />
          </div>

          {/* Will & Message */}
          <div className="space-y-1.5">
            <label className="block text-xs font-bold text-stone-300 flex items-center gap-1.5">
              <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
              وصية ورسالة من القلب لزوار المنصة:
            </label>
            <textarea
              rows={3}
              value={profile.willAndMessage}
              onChange={(e) => setProfile({ ...profile, willAndMessage: e.target.value })}
              className="w-full p-3 rounded-xl bg-stone-950 border border-stone-800 focus:border-amber-500 focus:outline-hidden text-stone-100 leading-relaxed text-xs"
            />
          </div>

          {isSavedNotice && (
            <div className="p-3 rounded-xl bg-emerald-950/60 border border-emerald-500/40 text-emerald-300 flex items-center gap-2 text-xs font-bold">
              <CheckCircle2 className="w-4 h-4 shrink-0" />
              <span>تم حفظ وتحديث بيانات صاحب المنصة بنجاح، ربنا يتقبل!</span>
            </div>
          )}

          {/* Footer Actions */}
          <div className="pt-2 flex items-center justify-between gap-3 border-t border-stone-800">
            <button
              type="button"
              onClick={handleReset}
              className="px-3 py-2 text-xs text-stone-400 hover:text-amber-400 hover:bg-stone-800 rounded-xl transition-colors flex items-center gap-1.5 cursor-pointer"
            >
              <RotateCcw className="w-3.5 h-3.5" />
              <span>استعادة النموذج الافتراضي</span>
            </button>

            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={onClose}
                className="px-4 py-2 text-xs font-medium text-stone-300 hover:bg-stone-800 rounded-xl transition-colors cursor-pointer"
              >
                إلغاء
              </button>
              <button
                type="submit"
                className="px-5 py-2 rounded-xl bg-gradient-to-r from-amber-600 to-amber-700 hover:from-amber-500 hover:to-amber-600 text-white font-bold text-xs flex items-center gap-1.5 shadow-md shadow-amber-900/40 cursor-pointer transition-all"
              >
                <Save className="w-4 h-4" />
                <span>حفظ التعديلات</span>
              </button>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
};
