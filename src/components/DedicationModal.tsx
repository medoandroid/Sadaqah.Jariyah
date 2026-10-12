import React, { useState, useEffect } from 'react';
import { X, Sparkles, CheckCircle2, Heart, BookOpen, CircleDot, Layers, User } from 'lucide-react';
import { HONORED_PERSONS } from '../data/persons';
import { recordDedication } from '../services/dedicationService';
import { userProfileService } from '../services/userProfileService';
import { projectOwnerService } from '../services/projectOwnerService';
import { SingleChoiceList, SingleChoiceOption } from './SingleChoiceList';

interface DedicationModalProps {
  isOpen: boolean;
  onClose: () => void;
  preselectedPersonId?: string;
  preselectedType?: 'surah' | 'tasbeeh' | 'dua' | 'khatmah';
}

export const DedicationModal: React.FC<DedicationModalProps> = ({
  isOpen,
  onClose,
  preselectedPersonId,
  preselectedType,
}) => {
  const profile = userProfileService.getProfile();
  const [selectedPerson, setSelectedPerson] = useState<string>(preselectedPersonId || 'all');
  const [actType, setActType] = useState<'surah' | 'tasbeeh' | 'dua' | 'khatmah'>(preselectedType || 'dua');
  const [actTitle, setActTitle] = useState('دعاء بالرحمة والمغفرة ونور القبر');
  const [count, setCount] = useState(1);
  const [donorName, setDonorName] = useState(profile.userName || '');
  const [isSuccess, setIsSuccess] = useState(false);

  useEffect(() => {
    if (isOpen) {
      const p = userProfileService.getProfile();
      if (!donorName) {
        setDonorName(p.userName || (p.hasConfigured ? p.kinshipTitle : ''));
      }
      if (!preselectedPersonId && p.targetUncleId && p.targetUncleId !== 'all') {
        setSelectedPerson(p.targetUncleId);
      }
      setActTitle(userProfileService.getSuggestedDedicationNote(actType, p));
    }
  }, [isOpen]);

  if (!isOpen) return null;

  // Person Single-Choice Options
  const personOptions: SingleChoiceOption<string>[] = [
    {
      id: 'all',
      title: 'جميع الأرواح الكريمة معاً',
      subtitle: 'لهم جميعاً بالرحمة والمغفرة والرضوان',
      badge: 'مشترك',
      icon: <Heart className="w-4 h-4 text-amber-700" />,
    },
    {
      id: 'project_owner',
      title: `صاحب المنصة: ${projectOwnerService.getOwnerProfile().name}`,
      subtitle: 'صدقة جارية ودعوة حلوة من القلب له ولوالديه في حياته وبعد مماته',
      badge: 'صدقة صاحب المنصة',
      icon: <Sparkles className="w-4 h-4 text-amber-600" />,
    },
    ...(profile.closestRelative
      ? [
          {
            id: 'custom_closest',
            title: `طرفك الأقرب: ${profile.closestRelative}`,
            subtitle: 'إهداء خاص لطرفك الأقرب المحفوظ محلياً على جهازك',
            badge: 'مخصص لك',
            icon: <Heart className="w-4 h-4 text-rose-600" />,
          },
        ]
      : []),
    ...HONORED_PERSONS.map((p) => ({
      id: p.id,
      title: p.name,
      subtitle: `${p.relationTitle} · ${p.title}`,
      icon: <User className="w-4 h-4 text-amber-700" />,
    })),
  ];

  // Act Type Single-Choice Options
  const actOptions: SingleChoiceOption<'surah' | 'tasbeeh' | 'dua' | 'khatmah'>[] = [
    {
      id: 'dua',
      title: 'دعاء خالص بظهر الغيب',
      subtitle: 'دعاء بالمغفرة والرحمة ونور القبر',
      icon: <Heart className="w-4 h-4 text-amber-700" />,
    },
    {
      id: 'surah',
      title: 'قراءة سورة من القرآن',
      subtitle: 'الفاتحة، يس، الملك، أو ما تيسر',
      icon: <BookOpen className="w-4 h-4 text-amber-700" />,
    },
    {
      id: 'tasbeeh',
      title: 'تسبيح وتهليل واستغفار',
      subtitle: 'تسبيحات وأذكار مهداة',
      icon: <CircleDot className="w-4 h-4 text-amber-700" />,
    },
    {
      id: 'khatmah',
      title: 'جزء أو ختمة قرآنية',
      subtitle: 'إهداء تلاوة أجزاء من كتاب الله',
      icon: <Layers className="w-4 h-4 text-amber-700" />,
    },
  ];

  const handleSelectActType = (type: 'surah' | 'tasbeeh' | 'dua' | 'khatmah') => {
    setActType(type);
    if (type === 'dua') {
      setActTitle('دعاء بالمغفرة والرحمة ونور القبر');
      setCount(1);
    } else if (type === 'surah') {
      setActTitle('قراءة سورة (الفاتحة / يس / الملك)');
      setCount(1);
    } else if (type === 'tasbeeh') {
      setActTitle('١٠٠ تسبيحة واستغفار');
      setCount(100);
    } else if (type === 'khatmah') {
      setActTitle('إهداء ثواب تلاوة جزء من القرآن الكريم');
      setCount(1);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const customTarget = selectedPerson === 'custom_closest' ? profile.closestRelative : undefined;
    recordDedication(
      actType,
      actTitle,
      selectedPerson,
      count,
      donorName.trim() || profile.userName || 'فاعل خير',
      customTarget
    );
    setIsSuccess(true);
    setTimeout(() => {
      setIsSuccess(false);
      onClose();
    }, 2200);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-stone-900/65 backdrop-blur-xs animate-in fade-in duration-200">
      <div
        className="w-full max-w-xl bg-[#FAF9F5] border border-amber-900/20 rounded-3xl shadow-2xl overflow-hidden flex flex-col max-h-[90vh] text-right"
        role="dialog"
        aria-modal="true"
        aria-label="نافذة إهداء ثواب عمل صالح"
      >
        {/* Modal Header */}
        <div className="px-6 py-4 border-b border-stone-200/80 bg-white flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <span className="w-9 h-9 rounded-xl bg-amber-100/70 border border-amber-300 text-amber-900 flex items-center justify-center">
              <Sparkles className="w-4 h-4 text-amber-800" />
            </span>
            <div>
              <h3 className="font-amiri text-xl font-bold text-stone-900">
                إهداء ثواب عمل صالح
              </h3>
              <p className="text-[11px] text-stone-500">
                برّ ووفاء لأرواح المغفور لهم بإذن الله
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 text-stone-400 hover:text-stone-700 rounded-xl hover:bg-stone-100 transition-colors cursor-pointer"
            title="إغلاق"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Body */}
        {isSuccess ? (
          <div className="p-8 text-center space-y-4">
            <div className="w-16 h-16 mx-auto rounded-full bg-emerald-100 text-emerald-700 flex items-center justify-center animate-bounce">
              <CheckCircle2 className="w-9 h-9" />
            </div>
            <h4 className="font-amiri text-2xl font-bold text-stone-900">
              ربنا يتقبل منك ومننا ويجعله في ميزان حسناتهم
            </h4>
            <p className="text-stone-600 text-sm max-w-sm mx-auto font-amiri leading-relaxed">
              اتسجل إهداء الثواب، يا رب يجعله نور وضياء مؤنس لأرواحهم الغالية في قبورهم.
            </p>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="flex-1 overflow-y-auto p-5 sm:p-6 space-y-5 text-right">
            
            {/* Single Choice: Target Soul */}
            <div>
              <div className="flex items-center justify-between mb-2">
                <label className="text-xs font-bold text-stone-800">
                  ١. إلى روح من تهدي هذا العمل المبارك؟
                </label>
                <span className="text-[11px] text-stone-400">اختيار أحادي</span>
              </div>
              <SingleChoiceList
                options={personOptions}
                selectedId={selectedPerson}
                onSelect={(id) => setSelectedPerson(id)}
                layout="grid-2"
                size="sm"
                ariaLabel="اختيار المتوفى"
              />
            </div>

            {/* Single Choice: Act Type */}
            <div>
              <div className="flex items-center justify-between mb-2">
                <label className="text-xs font-bold text-stone-800">
                  ٢. نوع العمل الصالح
                </label>
                <span className="text-[11px] text-stone-400">اختيار أحادي</span>
              </div>
              <SingleChoiceList
                options={actOptions}
                selectedId={actType}
                onSelect={handleSelectActType}
                layout="grid-2"
                size="sm"
                ariaLabel="اختيار نوع العمل"
              />
            </div>

            {/* Title / Description */}
            <div>
              <label className="block text-xs font-bold text-stone-800 mb-1.5">
                ٣. تفاصيل العمل (مثلاً: سورة الفاتحة، ١٠٠ استغفار)
              </label>
              <input
                type="text"
                value={actTitle}
                onChange={(e) => setActTitle(e.target.value)}
                required
                className="w-full px-3.5 py-2 text-xs sm:text-sm bg-white border border-stone-200 rounded-xl focus:outline-hidden focus:border-amber-700 text-stone-900 transition-colors shadow-2xs"
              />
            </div>

            {/* Count & Donor Name */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-bold text-stone-800 mb-1.5">
                  العدد أو التكرار
                </label>
                <input
                  type="number"
                  min="1"
                  max="10000"
                  value={count}
                  onChange={(e) => setCount(Math.max(1, parseInt(e.target.value, 10) || 1))}
                  className="w-full px-3.5 py-2 text-xs sm:text-sm bg-white border border-stone-200 rounded-xl focus:outline-hidden focus:border-amber-700 text-stone-900 font-mono transition-colors shadow-2xs"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-stone-800 mb-1.5">
                  اسم المهدي (اختياري)
                </label>
                <input
                  type="text"
                  value={donorName}
                  onChange={(e) => setDonorName(e.target.value)}
                  placeholder={profile.userName || 'فاعل خير'}
                  className="w-full px-3.5 py-2 text-xs sm:text-sm bg-white border border-stone-200 rounded-xl focus:outline-hidden focus:border-amber-700 text-stone-900 placeholder:text-stone-400 transition-colors shadow-2xs"
                />
              </div>
            </div>

            {/* Submit Action */}
            <div className="pt-3 border-t border-stone-200/80 flex items-center justify-between gap-3">
              <span className="text-[11px] text-stone-500 font-amiri">
                ﴿وَأَن لَّيْسَ لِلْإِنسَانِ إِلَّا مَا سَعَىٰ﴾
              </span>

              <button
                type="submit"
                className="px-6 py-2.5 rounded-xl bg-amber-800 hover:bg-amber-900 text-white font-amiri text-base font-bold shadow-md hover:shadow-lg transition-all cursor-pointer flex items-center gap-2 active:scale-98"
              >
                <Heart className="w-4 h-4 fill-white" />
                <span>تسجيل إهداء الثواب</span>
              </button>
            </div>

          </form>
        )}

      </div>
    </div>
  );
};
