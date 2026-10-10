import React, { useState, useEffect } from 'react';
import {
  X,
  Heart,
  Sparkles,
  Check,
  Users,
  Compass,
  CheckCircle2,
  Info,
  ShieldCheck,
  Share2,
  Bookmark
} from 'lucide-react';
import {
  userProfileService,
  UserProfile,
  ConnectionType,
  TargetUncleId,
  UNCLE_NAMES
} from '../services/userProfileService';
import { HONORED_PERSONS } from '../data/persons';

interface UserProfileModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const UserProfileModal: React.FC<UserProfileModalProps> = ({ isOpen, onClose }) => {
  const [profile, setProfile] = useState<UserProfile>(userProfileService.getProfile());
  const [targetUncleId, setTargetUncleId] = useState<TargetUncleId>('all');
  const [connectionType, setConnectionType] = useState<ConnectionType>('friend');
  const [kinshipTitle, setKinshipTitle] = useState<string>('صديق ورفيق درب');
  const [userName, setUserName] = useState<string>('');
  const [isSaved, setIsSaved] = useState<boolean>(false);

  useEffect(() => {
    if (isOpen) {
      const p = userProfileService.getProfile();
      setProfile(p);
      setTargetUncleId(p.targetUncleId || 'all');
      setConnectionType(p.connectionType || 'friend');
      setKinshipTitle(p.kinshipTitle || (p.connectionType === 'family_relative' ? 'من الأهل والأقارب' : 'صديق ورفيق درب'));
      setUserName(p.userName || '');
      setIsSaved(false);
    }
  }, [isOpen]);

  if (!isOpen) return null;

  const handleSelectUncle = (id: TargetUncleId) => {
    setTargetUncleId(id);
  };

  const handleSelectBond = (type: ConnectionType, title: string) => {
    setConnectionType(type);
    setKinshipTitle(title);
  };

  const handleSave = (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    userProfileService.saveProfile({
      connectionType,
      targetUncleId,
      kinshipTitle: kinshipTitle.trim() || 'محب للخير وداعٍ بالرحمة',
      userName: userName.trim(),
    });

    setIsSaved(true);
    setTimeout(() => {
      setIsSaved(false);
      onClose();
    }, 600);
  };

  const currentPreviewDua = userProfileService.getSmartTailoredPrayers({
    ...profile,
    connectionType,
    targetUncleId,
    kinshipTitle,
    userName,
  })[0];

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-5 bg-stone-950/80 backdrop-blur-md animate-in fade-in duration-200"
      dir="rtl"
    >
      <div
        className="w-full max-w-xl bg-white dark:bg-stone-900 rounded-3xl shadow-2xl border border-stone-200/90 dark:border-stone-800 overflow-hidden flex flex-col max-h-[92vh] text-right"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Modal Header */}
        <div className="relative p-5 sm:p-6 border-b border-stone-100 dark:border-stone-800 bg-gradient-to-b from-amber-50/80 to-transparent dark:from-stone-850 dark:to-stone-900 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-11 h-11 rounded-2xl bg-amber-100 dark:bg-amber-950/70 border border-amber-300 dark:border-amber-700/60 flex items-center justify-center text-amber-800 dark:text-amber-300 shadow-xs">
              <Heart className="w-5 h-5 text-amber-700 dark:text-amber-400" />
            </div>
            <div>
              <h2 className="font-amiri text-xl sm:text-2xl font-bold text-stone-900 dark:text-stone-100">
                تحديد طرف الصلة والقرابة
              </h2>
              <p className="text-xs text-stone-500 dark:text-stone-400">
                لمعرفة طرفك الأقرب وتخصيص صيغ الدعاء والإهداء الذكية تلقائياً
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="p-2 rounded-xl text-stone-400 hover:text-stone-700 dark:hover:text-stone-200 hover:bg-stone-100 dark:hover:bg-stone-800 transition-colors cursor-pointer"
            aria-label="إغلاق"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Form Body */}
        <div className="p-5 sm:p-6 overflow-y-auto space-y-6 flex-1 custom-scrollbar">
          
          {/* Subtle Explanation Note */}
          <div className="p-3.5 rounded-2xl bg-amber-50/90 dark:bg-amber-950/40 border border-amber-200/80 dark:border-amber-800/40 text-xs text-amber-950 dark:text-amber-200 leading-relaxed flex items-start gap-2.5">
            <Info className="w-4 h-4 text-amber-700 dark:text-amber-400 shrink-0 mt-0.5" />
            <span>
              <strong>الاسم ليس إجبارياً على الإطلاق:</strong> هذه الخاصية فقط لمعرفة طرف الأقارب أو الصديق لواحد من الأربعة، لتخصيص الدعاء والإهداء بذكاء وسلاسة ووفاء. كل البيانات تُحفظ محلياً على جهازك فقط.
            </span>
          </div>

          {/* 1. Uncle Side Selection */}
          <div className="space-y-2.5">
            <label className="block text-xs font-bold text-stone-800 dark:text-stone-200 flex items-center justify-between">
              <span>١. أنت من طرف أيٍّ من الأعمام الكرام؟</span>
              <span className="text-[11px] text-amber-700 dark:text-amber-400 font-normal">اختر الطرف الأقرب</span>
            </label>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
              {HONORED_PERSONS.map((person) => {
                const isSelected = targetUncleId === person.id;
                return (
                  <button
                    key={person.id}
                    type="button"
                    onClick={() => handleSelectUncle(person.id as TargetUncleId)}
                    className={`p-3 rounded-2xl border text-right transition-all cursor-pointer flex items-center justify-between ${
                      isSelected
                        ? 'bg-amber-100/90 dark:bg-amber-950/80 border-amber-600 text-amber-950 dark:text-amber-100 font-bold shadow-xs ring-1 ring-amber-500/40 scale-[1.01]'
                        : 'bg-white dark:bg-stone-850 border-stone-200 dark:border-stone-750 text-stone-700 dark:text-stone-300 hover:border-amber-300'
                    }`}
                  >
                    <div className="flex items-center gap-2">
                      <span className="w-2 h-2 rounded-full bg-amber-500"></span>
                      <span className="font-amiri text-sm">{person.name}</span>
                    </div>
                    {isSelected ? (
                      <CheckCircle2 className="w-4 h-4 text-amber-700 dark:text-amber-400 shrink-0" />
                    ) : (
                      <span className="text-[11px] text-stone-400">طرفه</span>
                    )}
                  </button>
                );
              })}

              {/* All Four Option */}
              <button
                type="button"
                onClick={() => handleSelectUncle('all')}
                className={`p-3 rounded-2xl border text-right transition-all cursor-pointer flex items-center justify-between sm:col-span-2 ${
                  targetUncleId === 'all'
                    ? 'bg-amber-100/90 dark:bg-amber-950/80 border-amber-600 text-amber-950 dark:text-amber-100 font-bold shadow-xs ring-1 ring-amber-500/40'
                    : 'bg-white dark:bg-stone-850 border-stone-200 dark:border-stone-750 text-stone-700 dark:text-stone-300 hover:border-amber-300'
                }`}
              >
                <div className="flex items-center gap-2">
                  <span className="w-2 h-2 rounded-full bg-emerald-500"></span>
                  <span className="font-amiri text-sm">من طرف العائلة الكريمة (الأربعة معاً)</span>
                </div>
                {targetUncleId === 'all' && (
                  <CheckCircle2 className="w-4 h-4 text-amber-700 dark:text-amber-400 shrink-0" />
                )}
              </button>
            </div>
          </div>

          {/* 2. Nature of Relationship / Bond */}
          <div className="space-y-2.5">
            <label className="block text-xs font-bold text-stone-800 dark:text-stone-200">
              ٢. ما هي طبيعة صلتك أو رابطتك به؟
            </label>

            {/* Friend bonds */}
            <div className="space-y-1.5">
              <span className="text-[11px] font-semibold text-amber-800 dark:text-amber-400 flex items-center gap-1">
                <Users className="w-3.5 h-3.5" />
                <span>إذا كنت صديقاً أو رفيق درب:</span>
              </span>
              <div className="flex flex-wrap gap-1.5">
                {[
                  { title: 'صديق ورفيق درب', sub: 'صداقة وفية' },
                  { title: 'صاحب عمر وطفولة', sub: 'عشرة عمر' },
                  { title: 'زميل عمل مخلص', sub: 'زمالة طيبة' },
                  { title: 'جار وفيّ', sub: 'حق الجوار' },
                  { title: 'معرفة طيبة بالمحبة', sub: 'محبة في الله' }
                ].map((item) => {
                  const isSelected = connectionType === 'friend' && kinshipTitle === item.title;
                  return (
                    <button
                      key={item.title}
                      type="button"
                      onClick={() => handleSelectBond('friend', item.title)}
                      className={`text-xs px-3 py-1.5 rounded-xl border transition-all cursor-pointer font-medium ${
                        isSelected
                          ? 'bg-amber-600 text-white border-amber-600 shadow-xs font-bold'
                          : 'bg-white dark:bg-stone-850 border-stone-250 dark:border-stone-700 text-stone-700 dark:text-stone-300 hover:border-amber-400'
                      }`}
                    >
                      {item.title}
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Relative bonds */}
            <div className="space-y-1.5 pt-1.5">
              <span className="text-[11px] font-semibold text-emerald-800 dark:text-emerald-400 flex items-center gap-1">
                <Heart className="w-3.5 h-3.5" />
                <span>إذا كنت من أهلهم أو أقاربهم (صلة قرابة):</span>
              </span>
              <div className="flex flex-wrap gap-1.5">
                {[
                  'ابن أخ',
                  'ابنة أخ',
                  'ابن أخت',
                  'ابنة أخت',
                  'ابن / ابنة',
                  'حفيد / حفيدة',
                  'أخ / أخت',
                  'صهر وقريب العائلة',
                  'من عائلة الشهاوي عبدالمجيد'
                ].map((rel) => {
                  const isSelected = connectionType === 'family_relative' && kinshipTitle === rel;
                  return (
                    <button
                      key={rel}
                      type="button"
                      onClick={() => handleSelectBond('family_relative', rel)}
                      className={`text-xs px-3 py-1.5 rounded-xl border transition-all cursor-pointer font-medium ${
                        isSelected
                          ? 'bg-emerald-600 text-white border-emerald-600 shadow-xs font-bold'
                          : 'bg-white dark:bg-stone-850 border-stone-250 dark:border-stone-700 text-stone-700 dark:text-stone-300 hover:border-emerald-400'
                      }`}
                    >
                      {rel}
                    </button>
                  );
                })}
              </div>
            </div>

            {/* General Benefactor */}
            <div className="pt-1.5">
              <button
                type="button"
                onClick={() => handleSelectBond('benefactor', 'محب للخير وداعٍ بالرحمة')}
                className={`w-full p-2.5 rounded-xl border text-center transition-all cursor-pointer text-xs font-medium flex items-center justify-center gap-2 ${
                  connectionType === 'benefactor'
                    ? 'bg-sky-600 text-white border-sky-600 shadow-xs font-bold'
                    : 'bg-white dark:bg-stone-850 border-stone-200 dark:border-stone-700 text-stone-600 dark:text-stone-300 hover:border-sky-400'
                }`}
              >
                <Compass className="w-3.5 h-3.5" />
                <span>أو محب للخير وداعٍ بالرحمة لجميع موتى المسلمين</span>
              </button>
            </div>
          </div>

          {/* 3. Optional Nickname */}
          <div className="space-y-1.5 pt-1">
            <label className="block text-xs font-bold text-stone-800 dark:text-stone-200">
              اسمك أو كنيتك <span className="text-stone-400 font-normal">(اختياري تماماً — ليس إجبارياً، يمكنك تركه فارغاً)</span>:
            </label>
            <input
              type="text"
              value={userName}
              onChange={(e) => setUserName(e.target.value)}
              placeholder="مثال: أبو محمد، فاعل خير، زميل قديم..."
              maxLength={40}
              className="w-full px-3.5 py-2.5 rounded-xl border border-stone-300 dark:border-stone-700 bg-white dark:bg-stone-800 text-stone-900 dark:text-stone-100 text-sm focus:outline-hidden focus:border-amber-600 focus:ring-1 focus:ring-amber-500 font-medium"
            />
          </div>

          {/* Live Preview of Adapted Prayer */}
          {currentPreviewDua && (
            <div className="p-4 rounded-2xl bg-[#FCFAF6] dark:bg-[#16181F] border border-amber-900/10 dark:border-amber-500/15 space-y-2">
              <span className="text-[11px] font-bold text-amber-800 dark:text-amber-400 flex items-center gap-1.5">
                <Sparkles className="w-3.5 h-3.5 text-amber-600 dark:text-amber-400" />
                <span>صيغة الدعاء الذكية التي ستُهدى بصلتك:</span>
              </span>
              <p className="font-amiri text-sm sm:text-base text-stone-800 dark:text-stone-200 leading-relaxed text-justify">
                "{currentPreviewDua.arabic}"
              </p>
            </div>
          )}

        </div>

        {/* Modal Footer */}
        <div className="p-4 sm:p-5 border-t border-stone-100 dark:border-stone-800 bg-stone-50/70 dark:bg-stone-900 flex items-center justify-between gap-3">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 rounded-xl text-stone-500 hover:text-stone-800 dark:hover:text-stone-200 text-xs font-medium cursor-pointer"
          >
            إلغاء
          </button>

          <button
            type="button"
            onClick={() => handleSave()}
            className="px-6 py-2.5 rounded-xl bg-amber-700 hover:bg-amber-800 active:scale-95 text-white font-medium text-xs sm:text-sm shadow-md transition-all cursor-pointer flex items-center gap-2"
          >
            {isSaved ? <Check className="w-4 h-4 text-emerald-300" /> : <CheckCircle2 className="w-4 h-4" />}
            <span>{isSaved ? 'تم الحفظ وتحديث الأدعية!' : 'تأكيد وحفظ الطرف'}</span>
          </button>
        </div>

      </div>
    </div>
  );
};
