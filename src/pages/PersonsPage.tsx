import React, { useState, useEffect } from 'react';
import {
  Users,
  Heart,
  Sparkles,
  Share2,
  Copy,
  Check,
  Calendar,
  BookOpen,
  MessageSquare,
  Clock,
  UserCheck
} from 'lucide-react';
import { HONORED_PERSONS } from '../data/persons';
import { Person, CondolenceMessage } from '../types';
import { recordDedication } from '../services/dedicationService';
import { getCondolenceMessages } from '../services/condolenceService';
import { userProfileService, UserProfile } from '../services/userProfileService';
import { Star8Rosette } from '../components/IslamicDecoration';

interface PersonsPageProps {
  selectedPersonId?: string;
  onOpenDedicationForPerson: (personId: string, personName: string) => void;
  onOpenOwnerSadaqah?: () => void;
}

export const PersonsPage: React.FC<PersonsPageProps> = ({
  selectedPersonId,
  onOpenDedicationForPerson,
  onOpenOwnerSadaqah,
}) => {
  const [activePersonId, setActivePersonId] = useState<string>(selectedPersonId || 'all');
  const [prayedMap, setPrayedMap] = useState<Record<string, number>>({});
  const [toastMsg, setToastMsg] = useState<string | null>(null);
  const [profile, setProfile] = useState<UserProfile>(userProfileService.getProfile());

  // Tributes State
  const [messages, setMessages] = useState<CondolenceMessage[]>([]);

  useEffect(() => {
    setMessages(getCondolenceMessages());
    return userProfileService.subscribe((updated) => setProfile(updated));
  }, []);

  const displayedPersons = activePersonId === 'all'
    ? HONORED_PERSONS
    : HONORED_PERSONS.filter((p) => p.id === activePersonId);

  const showToast = (msg: string) => {
    setToastMsg(msg);
    setTimeout(() => setToastMsg(null), 2500);
  };

  const handlePrayForPerson = (person: Person) => {
    const current = prayedMap[person.id] || 0;
    setPrayedMap({
      ...prayedMap,
      [person.id]: current + 1,
    });
    recordDedication('dua', `دعاء خاص لـ ${person.name}`, person.id, 1);
    showToast(`ربنا يتقبل دعائك للغالي: ${person.name} ويسكنه فسيح جناته`);
  };

  const handleCopyDua = (person: Person) => {
    const text = `دعاء للمغفور له بإذن الله: ${person.name}\n\n«${person.dedicationDua}»\n\n- صدقة جارية · عائلة الشهاوي`;
    navigator.clipboard.writeText(text);
    showToast('اتنسخ الدعاء علشان تشاركه مع حبايبك');
  };

  const handleCopyCondolenceDua = (text: string) => {
    navigator.clipboard.writeText(text);
    showToast('اتنسخ الدعاء علشان تشاركه مع حبايبك');
  };

  const handleSayAmeen = (msgId: string) => {
    recordDedication('dua', 'تأمين على دعاء جامع لعمامي الأربعة', 'all', 1, 'زائر كريم');
    showToast('اللهم آمين يا رب.. ربنا يتقبل منك ويجازيك كل خير');
  };

  const formatTimestamp = (ts: number) => {
    const diff = Date.now() - ts;
    const hours = Math.floor(diff / (1000 * 60 * 60));
    if (hours < 1) return 'منذ قليل';
    if (hours < 24) return `منذ ${hours} ساعة`;
    const days = Math.floor(hours / 24);
    return `منذ ${days} يوم`;
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-12 text-right">
      
      {/* Toast Alert */}
      {toastMsg && (
        <div className="fixed top-20 left-1/2 -translate-x-1/2 z-50 px-4 py-2 rounded-xl bg-stone-900/95 text-amber-200 text-xs font-semibold shadow-xl backdrop-blur-md border border-amber-500/30 animate-in fade-in zoom-in-95 duration-200">
          {toastMsg}
        </div>
      )}

      {/* Header */}
      <div className="text-center max-w-2xl mx-auto space-y-3">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-amber-100/80 dark:bg-stone-800 border border-amber-300 dark:border-amber-700/50 text-amber-900 dark:text-amber-300 text-xs font-semibold">
          <Users className="w-3.5 h-3.5 text-amber-800 dark:text-amber-400" />
          <span>في رحاب الرحمة والمغفرة</span>
        </div>
        <h1 className="font-amiri text-3xl sm:text-5xl font-bold text-stone-900 dark:text-stone-100">
          عن أرواح حبايبنا الغاليين ربنا يرحمهم
        </h1>
        <p className="font-amiri text-base sm:text-lg text-stone-600 dark:text-stone-300 leading-relaxed">
          سيرة طيبة وعِشرة عمر ودعاء ما بيتقطعش أبداً.. بنرفع إيدينا بالرجاء لربنا إنه يتغمدهم بواسع رحمته ويجمعنا بيهم سوا في الفردوس الأعلى.
        </p>
      </div>

      {/* Filter Tabs */}
      <div className="flex flex-wrap items-center justify-center gap-2 max-w-2xl mx-auto">
        <button
          onClick={() => setActivePersonId('all')}
          className={`px-4 py-2 rounded-xl text-xs font-semibold transition-all cursor-pointer ${
            activePersonId === 'all'
              ? 'bg-amber-800 text-white shadow-xs'
              : 'bg-white dark:bg-stone-900 border border-stone-200 dark:border-stone-800 text-stone-700 dark:text-stone-300 hover:bg-stone-50 dark:hover:bg-stone-800'
          }`}
        >
          عرض حبايبنا الأربعة كلهم
        </button>

        {HONORED_PERSONS.map((person) => (
          <button
            key={person.id}
            onClick={() => setActivePersonId(person.id)}
            className={`px-4 py-2 rounded-xl text-xs font-amiri font-bold transition-all cursor-pointer ${
              activePersonId === person.id
                ? 'bg-amber-800 text-white shadow-xs'
                : 'bg-white dark:bg-stone-900 border border-stone-200 dark:border-stone-800 text-stone-700 dark:text-stone-300 hover:bg-stone-50 dark:hover:bg-stone-800'
            }`}
          >
            {person.name}
          </button>
        ))}

        {onOpenOwnerSadaqah && (
          <button
            onClick={onOpenOwnerSadaqah}
            className="px-4 py-2 rounded-xl text-xs font-amiri font-bold bg-amber-500/15 border border-amber-500/30 text-amber-800 dark:text-amber-300 hover:bg-amber-500/25 transition-all cursor-pointer flex items-center gap-1.5"
          >
            <Sparkles className="w-3.5 h-3.5" />
            <span>صدقة صاحب المنصة</span>
          </button>
        )}
      </div>

      {/* Project Owner Banner Card */}
      {onOpenOwnerSadaqah && (
        <div className="p-6 rounded-3xl bg-gradient-to-r from-amber-950/40 via-stone-900 to-amber-950/20 border border-amber-600/30 shadow-md flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-4 text-center sm:text-right">
            <div className="w-12 h-12 rounded-2xl bg-amber-500/20 border border-amber-500/40 flex items-center justify-center text-amber-400 shrink-0">
              <Sparkles className="w-6 h-6" />
            </div>
            <div>
              <h3 className="font-amiri text-lg sm:text-xl font-bold text-amber-200">
                صدقة جارية لصاحب المنصة
              </h3>
              <p className="text-xs text-stone-300 max-w-xl leading-relaxed">
                دعوة حلوة من القلب بالرحمة والمغفرة ونور القبر لصاحب العمل ده في حياته وبعد وفاته، يا رب يتقبله خالص لوجهه الكريم.
              </p>
            </div>
          </div>
          <button
            onClick={onOpenOwnerSadaqah}
            className="px-5 py-2.5 rounded-xl bg-gradient-to-r from-amber-600 to-amber-700 hover:from-amber-500 hover:to-amber-600 text-white font-bold text-xs shrink-0 flex items-center gap-2 shadow-md cursor-pointer transition-all"
          >
            <span>زيارة صفحة صاحب المنصة</span>
            <Sparkles className="w-4 h-4 text-amber-200" />
          </button>
        </div>
      )}

      {/* Persons Memorial Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        {displayedPersons.map((person) => {
          const prayCount = prayedMap[person.id] || 0;
          const isCompanion = profile.connectionType === 'friend' && (profile.targetUncleId === person.id || profile.targetUncleId === 'all');
          const isFamily = profile.connectionType === 'family_relative';

          return (
            <div
              key={person.id}
              className={`p-6 sm:p-8 rounded-3xl bg-white dark:bg-stone-900 border transition-all flex flex-col justify-between relative overflow-hidden ${
                isCompanion
                  ? 'border-amber-500 dark:border-amber-500/80 shadow-md ring-2 ring-amber-500/20'
                  : 'border-stone-200/90 dark:border-stone-800 shadow-sm hover:shadow-md'
              }`}
            >
              {/* Background Islamic Crest */}
              <div className="absolute -top-10 -left-10 opacity-5 dark:opacity-10 pointer-events-none">
                <Star8Rosette className="w-48 h-48 text-stone-900 dark:text-amber-200" />
              </div>

              <div>
                {/* Kinship badge highlight */}
                {profile.targetUncleId === person.id ? (
                  <div className="mb-3 flex items-center justify-between">
                    <span className="inline-flex items-center gap-1.5 text-xs font-bold text-amber-900 dark:text-amber-200 bg-amber-100 dark:bg-amber-950/80 px-3 py-1 rounded-full border border-amber-400 dark:border-amber-600 shadow-xs">
                      ✨ طرفك المختار ({profile.kinshipTitle || 'صلة وقرابة'})
                    </span>
                    <span className="text-[11px] text-amber-700 dark:text-amber-400 font-medium">الطرف الأقرب لك</span>
                  </div>
                ) : (
                  <div className="mb-3 flex items-center justify-between">
                    <span className="text-[11px] text-stone-600 dark:text-stone-300 font-medium">
                      {isCompanion ? '🤝 رفيق درب' : isFamily ? '🌿 صلة قرابة' : 'رحمه الله وأسكنه الجنة'}
                    </span>
                    <button
                      type="button"
                      onClick={() => {
                        userProfileService.setQuickParty(person.id as any, profile.connectionType || 'friend', profile.kinshipTitle);
                        showToast(`تم تحديد ${person.name} كطرفك الأقرب 🤍`);
                      }}
                      className="text-[11px] px-2.5 py-0.5 rounded-lg border border-amber-300/80 dark:border-amber-700/60 bg-amber-50/80 dark:bg-stone-800 text-amber-900 dark:text-amber-300 hover:bg-amber-100 font-semibold cursor-pointer transition-all active:scale-95"
                    >
                      تحديد كطرفي الأقرب 🌿
                    </button>
                  </div>
                )}

                {/* Person Header & Calligraphic Badge */}
                <div className="flex items-start gap-4 mb-6">
                  <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-amber-700 to-amber-900 text-white flex items-center justify-center font-amiri text-2xl font-bold shadow-md shrink-0 border-2 border-amber-200 dark:border-amber-700">
                    {person.name.charAt(0)}
                  </div>

                  <div className="min-w-0 flex-1">
                    <span className="text-xs font-semibold text-amber-800 dark:text-amber-300 bg-amber-50 dark:bg-stone-800 px-2.5 py-0.5 rounded-md border border-amber-200/60 dark:border-stone-700 inline-block mb-1">
                      {person.relationTitle}
                    </span>
                    <h2 className="font-amiri text-2xl sm:text-3xl font-bold text-stone-900 dark:text-stone-100">
                      {person.name}
                    </h2>
                    <div className="flex items-center gap-1.5 text-xs text-stone-600 dark:text-stone-300 font-medium mt-1">
                      <Calendar className="w-3.5 h-3.5 text-amber-600 dark:text-amber-400" />
                      <span>{person.deathDate || 'رحمه الله وأسكنه الفردوس'}</span>
                    </div>
                  </div>
                </div>

                {/* Biography & Memory */}
                <div className="p-4 rounded-2xl bg-[#FAF9F5] dark:bg-stone-850 border border-stone-200/60 dark:border-stone-750 mb-5">
                  <h4 className="text-xs font-bold text-stone-700 dark:text-stone-300 mb-1.5 flex items-center gap-1.5">
                    <Sparkles className="w-3.5 h-3.5 text-amber-700 dark:text-amber-400" />
                    <span>الذكرى العطرة</span>
                  </h4>
                  <p className="font-amiri text-base text-stone-700 dark:text-stone-300 leading-relaxed">
                    {person.bio}
                  </p>
                </div>

                {/* Dedicated Prayer */}
                <div className="p-5 rounded-2xl bg-amber-50/70 dark:bg-amber-950/30 border border-amber-200/80 dark:border-amber-800/50 mb-6">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-xs font-bold text-amber-900 dark:text-amber-300 flex items-center gap-1.5">
                      <Heart className="w-3.5 h-3.5 fill-amber-700 text-amber-700 dark:fill-amber-400 dark:text-amber-400" />
                      <span>دعاء خاص لروحه الطاهرة</span>
                    </span>
                    <button
                      onClick={() => handleCopyDua(person)}
                      className="text-stone-400 hover:text-stone-700 dark:hover:text-stone-200 p-1 cursor-pointer transition-colors"
                      title="نسخ الدعاء"
                    >
                      <Copy className="w-3.5 h-3.5" />
                    </button>
                  </div>
                  <p className="font-amiri text-lg text-stone-800 dark:text-stone-200 leading-[2.1]">
                    «{person.dedicationDua}»
                  </p>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="pt-4 border-t border-stone-100 dark:border-stone-800 flex flex-wrap items-center justify-between gap-3">
                <button
                  onClick={() => handlePrayForPerson(person)}
                  className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-amber-800 hover:bg-amber-900 text-white text-xs font-bold transition-all cursor-pointer active:scale-95 shadow-xs"
                >
                  <Heart className="w-3.5 h-3.5 fill-current" />
                  <span>دعوت له بالرحمة</span>
                  {prayCount > 0 && (
                    <span className="bg-white/20 px-1.5 py-0.5 rounded-full font-mono text-[10px]">
                      +{prayCount}
                    </span>
                  )}
                </button>

                <button
                  onClick={() => onOpenDedicationForPerson(person.id, person.name)}
                  className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-stone-100 dark:bg-stone-800 hover:bg-stone-200/70 dark:hover:bg-stone-750 text-stone-800 dark:text-stone-200 text-xs font-semibold transition-colors cursor-pointer"
                >
                  <Sparkles className="w-3.5 h-3.5 text-amber-700 dark:text-amber-400" />
                  <span>إهداء ثواب سورة / تسبيح</span>
                </button>
              </div>

            </div>
          );
        })}
      </div>

      {/* SECTION: Virtual Tribute & Condolence Wall (دفتر الدعاء والوفاء) */}
      <div className="space-y-6 pt-6 border-t border-stone-200 dark:border-stone-800">
        
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
          <div>
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-amber-100/80 dark:bg-stone-800 border border-amber-300 dark:border-amber-700/50 text-amber-900 dark:text-amber-300 text-xs font-semibold mb-2">
              <Sparkles className="w-3.5 h-3.5 text-amber-700 dark:text-amber-400" />
              <span>إهداء وبر موصول لعمامي الغاليين من محمد أيمن</span>
            </div>
            <h3 className="font-amiri text-2xl sm:text-3xl font-bold text-stone-900 dark:text-stone-100 flex items-center gap-2">
              <MessageSquare className="w-6 h-6 text-amber-800 dark:text-amber-400" />
              <span>دفتر الدعاء والوفاء</span>
              <span className="text-xs px-2 py-0.5 rounded-full bg-amber-100 dark:bg-stone-800 text-amber-900 dark:text-amber-300 font-sans font-bold border border-amber-300 dark:border-stone-700">
                ١٠ أدعية جامعة
              </span>
            </h3>
            <p className="text-xs sm:text-sm text-stone-700 dark:text-stone-300 font-medium mt-1">
              أدعية جامعة ومباركة مهداة لأرواح عمامي الأربعة رحمهم الله جميعاً: عمي رمضان، وعمي الشهاوي، وعمي الشافعي، وعمي أحمد الشهاوي عبدالمجيد.
            </p>
          </div>
        </div>

        {/* Tributes List - 10 Collective Prayers */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {messages.map((msg, index) => (
            <div
              key={msg.id}
              className="p-5 rounded-3xl bg-white dark:bg-stone-900 border border-stone-200/90 dark:border-stone-800 shadow-2xs hover:border-amber-400 dark:hover:border-stone-700 hover:shadow-md transition-all flex flex-col justify-between group"
            >
              <div>
                <div className="flex items-center justify-between mb-3 gap-2">
                  <div className="flex items-center gap-2">
                    <span className="w-8 h-8 rounded-full bg-gradient-to-tr from-amber-700 to-amber-900 text-amber-100 text-xs font-bold flex items-center justify-center shadow-xs">
                      {msg.author.charAt(0)}
                    </span>
                    <div>
                      <span className="font-semibold text-xs text-stone-900 dark:text-stone-100 block leading-tight">{msg.author}</span>
                      <span className="text-[10px] text-stone-600 dark:text-stone-400 font-mono font-medium">دعاء جامع #{index + 1}</span>
                    </div>
                  </div>

                  <span className="text-[10px] font-semibold text-amber-900 dark:text-amber-300 bg-amber-50 dark:bg-stone-800 px-2.5 py-1 rounded-full border border-amber-200/80 dark:border-stone-700">
                    عمامي الأربعة رحمهم الله
                  </span>
                </div>

                <p className="font-amiri text-base sm:text-lg text-stone-800 dark:text-stone-200 leading-relaxed mb-4">
                  «{msg.message}»
                </p>
              </div>

              <div className="flex items-center justify-between text-xs border-t border-stone-200/80 dark:border-stone-800 pt-3 mt-2">
                <div className="text-[11px] text-stone-600 dark:text-stone-400 flex items-center gap-1 font-medium">
                  <Clock className="w-3 h-3 text-amber-600 dark:text-amber-400" />
                  <span>{formatTimestamp(msg.createdAt)}</span>
                </div>

                <div className="flex items-center gap-1.5">
                  <button
                    type="button"
                    onClick={() => handleSayAmeen(msg.id)}
                    className="px-2.5 py-1 rounded-lg bg-amber-50 dark:bg-stone-800 hover:bg-amber-100 dark:hover:bg-stone-750 text-amber-900 dark:text-amber-300 text-[11px] font-bold border border-amber-200 dark:border-stone-700 transition-colors flex items-center gap-1 cursor-pointer active:scale-95"
                    title="تأمين على هذا الدعاء المبارك"
                  >
                    <Heart className="w-3 h-3 text-amber-700 dark:text-amber-400 fill-amber-700 dark:fill-amber-400" />
                    <span>آمـين</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => handleCopyCondolenceDua(msg.message)}
                    className="p-1.5 rounded-lg text-stone-400 hover:text-stone-700 dark:hover:text-stone-200 hover:bg-stone-100 dark:hover:bg-stone-800 transition-colors cursor-pointer"
                    title="نسخ نص الدعاء"
                  >
                    <Copy className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>

      </div>

    </div>
  );
};
