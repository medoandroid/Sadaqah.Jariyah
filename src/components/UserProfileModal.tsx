import React, { useState, useEffect } from 'react';
import {
  X,
  Heart,
  Sparkles,
  Check,
  ShieldCheck,
  Users,
  Compass,
  CheckCircle2,
  Info
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
  const [connectionType, setConnectionType] = useState<ConnectionType>('friend');
  const [targetUncleId, setTargetUncleId] = useState<TargetUncleId>('ramadan-elshahawy');
  const [kinshipTitle, setKinshipTitle] = useState<string>('ابن أخ');
  const [friendshipRole, setFriendshipRole] = useState<string>('صديق ورفيق درب');
  const [userName, setUserName] = useState<string>('');
  const [isSaved, setIsSaved] = useState<boolean>(false);

  useEffect(() => {
    if (isOpen) {
      const p = userProfileService.getProfile();
      setProfile(p);
      setConnectionType(p.connectionType || 'friend');
      setTargetUncleId(p.targetUncleId || 'ramadan-elshahawy');
      setKinshipTitle(p.kinshipTitle || 'ابن أخ');
      setFriendshipRole(p.kinshipTitle || 'صديق ورفيق درب');
      setUserName(p.userName || '');
      setIsSaved(false);
    }
  }, [isOpen]);

  if (!isOpen) return null;

  const handleSave = (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    const finalTitle =
      connectionType === 'friend'
        ? friendshipRole
        : connectionType === 'family_relative'
        ? kinshipTitle
        : 'محب للخير وداعٍ بالرحمة';

    userProfileService.saveProfile({
      connectionType,
      targetUncleId,
      kinshipTitle: finalTitle,
      userName: userName.trim(),
    });

    setIsSaved(true);
    setTimeout(() => {
      setIsSaved(false);
      onClose();
    }, 700);
  };

  const currentPreviewDua = userProfileService.getSmartTailoredPrayers({
    ...profile,
    connectionType,
    targetUncleId,
    kinshipTitle: connectionType === 'friend' ? friendshipRole : kinshipTitle,
    userName,
  })[0];

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-5 bg-stone-950/75 backdrop-blur-md animate-in fade-in duration-200"
      dir="rtl"
    >
      <div
        className="w-full max-w-xl bg-white dark:bg-stone-900 rounded-3xl shadow-2xl border border-stone-200/90 dark:border-stone-800 overflow-hidden flex flex-col max-h-[92vh] text-right"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Modal Header */}
        <div className="relative p-5 sm:p-6 border-b border-stone-100 dark:border-stone-800 bg-gradient-to-b from-amber-50/80 to-transparent dark:from-stone-850 dark:to-stone-900 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-amber-100 dark:bg-amber-950/60 border border-amber-300 dark:border-amber-700/50 flex items-center justify-center text-amber-800 dark:text-amber-300 shadow-xs">
              <Heart className="w-5 h-5 text-amber-700 dark:text-amber-400" />
            </div>
            <div>
              <h2 className="font-amiri text-xl sm:text-2xl font-bold text-stone-900 dark:text-stone-100">
                تحديد صلتك بالأعمام الكرام
              </h2>
              <p className="text-xs text-stone-500 dark:text-stone-400">
                لمعرفة صلتك بهم وضبط صيغ الأدعية والإهداءات تلقائياً بوفاء وخصوصية
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
          <div className="p-3.5 rounded-2xl bg-amber-50/80 dark:bg-amber-950/30 border border-amber-200/80 dark:border-amber-800/40 text-xs text-amber-950 dark:text-amber-200 leading-relaxed flex items-start gap-2.5">
            <Info className="w-4 h-4 text-amber-700 dark:text-amber-400 shrink-0 mt-0.5" />
            <span>
              <strong>الاسم ليس إجبارياً:</strong> تحديد صلتك (صديق لأحدهم، أو من أهلهم، أو فاعل خير) يُمكّن المنصة من تخصيص صيغ الدعاء والإهداء تلقائياً، مع حفظ كل شيء محلياً على جهازك فقط.
            </span>
          </div>

          {/* 1. Main Path Choice */}
          <div className="space-y-2.5">
            <label className="block text-xs font-bold text-stone-800 dark:text-stone-200">
              ١. اختر طبيعة صلتك بالأعمام المغفور لهم:
            </label>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5">
              {[
                {
                  id: 'friend' as ConnectionType,
                  title: 'صديق لأحدهم',
                  subtitle: 'رفيق درب أو جار أو زميل لأحد الأربعة',
                  icon: Users,
                  color: 'border-amber-600 bg-amber-50/40 dark:bg-amber-950/30'
                },
                {
                  id: 'family_relative' as ConnectionType,
                  title: 'من أهلهم (صلة قرابة)',
                  subtitle: 'ابن أخ، ابن أخت، قريب من العائلة',
                  icon: Heart,
                  color: 'border-emerald-600 bg-emerald-50/40 dark:bg-emerald-950/30'
                },
                {
                  id: 'benefactor' as ConnectionType,
                  title: 'محب وفاعل خير',
                  subtitle: 'دعاء خالص لوجه الله ولأموات المسلمين',
                  icon: Compass,
                  color: 'border-sky-600 bg-sky-50/40 dark:bg-sky-950/30'
                },
              ].map((item) => {
                const Icon = item.icon;
                const isSelected = connectionType === item.id;
                return (
                  <button
                    key={item.id}
                    type="button"
                    onClick={() => setConnectionType(item.id)}
                    className={`p-3.5 rounded-2xl border text-right transition-all cursor-pointer flex flex-col justify-between ${
                      isSelected
                        ? `${item.color} border-2 shadow-xs scale-101`
                        : 'bg-white dark:bg-stone-850 border-stone-200 dark:border-stone-750 hover:border-amber-300'
                    }`}
                  >
                    <div className="flex items-center justify-between mb-1">
                      <span className="font-amiri text-base font-bold text-stone-900 dark:text-stone-100">
                        {item.title}
                      </span>
                      <Icon className={`w-4 h-4 ${isSelected ? 'text-amber-700 dark:text-amber-400' : 'text-stone-400'}`} />
                    </div>
                    <span className="text-[11px] text-stone-500 dark:text-stone-400 leading-tight">
                      {item.subtitle}
                    </span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* 2. If Friend: Choose Which Uncle */}
          {connectionType === 'friend' && (
            <div className="space-y-3 p-4 rounded-2xl bg-amber-50/40 dark:bg-stone-850 border border-amber-200/60 dark:border-stone-750 animate-in fade-in duration-200">
              <label className="block text-xs font-bold text-amber-900 dark:text-amber-300">
                ٢. كنت صديقاً ورفيق درب لمن منهم؟
              </label>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                {HONORED_PERSONS.map((person) => {
                  const isSelected = targetUncleId === person.id;
                  return (
                    <button
                      key={person.id}
                      type="button"
                      onClick={() => setTargetUncleId(person.id as TargetUncleId)}
                      className={`p-3 rounded-xl border text-right transition-all cursor-pointer flex items-center justify-between ${
                        isSelected
                          ? 'bg-amber-100 dark:bg-amber-950/80 border-amber-500 text-amber-950 dark:text-amber-100 font-bold'
                          : 'bg-white dark:bg-stone-800 border-stone-200 dark:border-stone-700 text-stone-700 dark:text-stone-300 hover:border-amber-300'
                      }`}
                    >
                      <div className="flex items-center gap-2">
                        <span className="font-amiri text-sm">{person.name}</span>
                      </div>
                      {isSelected && <CheckCircle2 className="w-4 h-4 text-amber-700 dark:text-amber-400" />}
                    </button>
                  );
                })}

                {/* All Four Option */}
                <button
                  type="button"
                  onClick={() => setTargetUncleId('all')}
                  className={`p-3 rounded-xl border text-right transition-all cursor-pointer flex items-center justify-between sm:col-span-2 ${
                    targetUncleId === 'all'
                      ? 'bg-amber-100 dark:bg-amber-950/80 border-amber-500 text-amber-950 dark:text-amber-100 font-bold'
                      : 'bg-white dark:bg-stone-800 border-stone-200 dark:border-stone-700 text-stone-700 dark:text-stone-300 hover:border-amber-300'
                  }`}
                >
                  <span className="font-amiri text-sm">صديق ورفيق للعائلة الكريمة والأربعة معاً</span>
                  {targetUncleId === 'all' && <CheckCircle2 className="w-4 h-4 text-amber-700 dark:text-amber-400" />}
                </button>
              </div>

              {/* Friendship Bond Tag */}
              <div className="pt-2">
                <span className="text-[11px] text-stone-500 dark:text-stone-400 block mb-1.5 font-medium">
                  وصف رابطة الصداقة (اختياري):
                </span>
                <div className="flex flex-wrap gap-1.5">
                  {['صديق ورفيق درب', 'زميل عمل مخلص', 'جار وفيّ', 'صديق عمر وطفولة', 'معرفة طيبة بالمحبة'].map((role) => (
                    <button
                      key={role}
                      type="button"
                      onClick={() => setFriendshipRole(role)}
                      className={`text-xs px-2.5 py-1 rounded-lg border transition-all cursor-pointer ${
                        friendshipRole === role
                          ? 'bg-amber-200/80 dark:bg-amber-900 border-amber-400 text-amber-950 dark:text-amber-200 font-semibold'
                          : 'bg-white dark:bg-stone-800 border-stone-200 dark:border-stone-700 text-stone-600 dark:text-stone-300'
                      }`}
                    >
                      {role}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* 3. If Family Relative: Choose Kinship */}
          {connectionType === 'family_relative' && (
            <div className="space-y-3 p-4 rounded-2xl bg-emerald-50/40 dark:bg-stone-850 border border-emerald-200/60 dark:border-stone-750 animate-in fade-in duration-200">
              <label className="block text-xs font-bold text-emerald-900 dark:text-emerald-300">
                ٢. صلة قرابتك بهم:
              </label>

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
                ].map((k) => (
                  <button
                    key={k}
                    type="button"
                    onClick={() => setKinshipTitle(k)}
                    className={`text-xs px-3 py-1.5 rounded-xl border transition-all cursor-pointer font-medium ${
                      kinshipTitle === k
                        ? 'bg-emerald-600 text-white border-emerald-600 shadow-xs'
                        : 'bg-white dark:bg-stone-800 border-stone-200 dark:border-stone-700 text-stone-700 dark:text-stone-300 hover:border-emerald-400'
                    }`}
                  >
                    {k}
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* 4. Optional Nickname / Display Name */}
          <div className="space-y-1.5 pt-1">
            <label className="block text-xs font-bold text-stone-800 dark:text-stone-200">
              اسمك أو كنيتك <span className="text-stone-400 font-normal">(اختياري تماماً — ليس إجبارياً)</span>:
            </label>
            <input
              type="text"
              value={userName}
              onChange={(e) => setUserName(e.target.value)}
              placeholder="مثال: أبو محمد، أحمد، فاعل خير..."
              maxLength={40}
              className="w-full px-3.5 py-2.5 rounded-xl border border-stone-300 dark:border-stone-700 bg-white dark:bg-stone-800 text-stone-900 dark:text-stone-100 text-sm focus:outline-hidden focus:border-amber-600 focus:ring-1 focus:ring-amber-500 font-medium"
            />
          </div>

          {/* Live Preview of Adapted Prayer */}
          {currentPreviewDua && (
            <div className="p-4 rounded-2xl bg-[#FCFAF6] dark:bg-[#16181F] border border-amber-900/10 dark:border-amber-500/10 space-y-2">
              <span className="text-[11px] font-bold text-amber-800 dark:text-amber-400 flex items-center gap-1.5">
                <Sparkles className="w-3.5 h-3.5" />
                <span>معاينة صيغة الدعاء المخصصة لصلتك:</span>
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
            <span>{isSaved ? 'تم الحفظ وتحديث الأدعية!' : 'تأكيد وحفظ الصلة'}</span>
          </button>
        </div>

      </div>
    </div>
  );
};
