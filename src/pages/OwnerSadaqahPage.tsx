import React, { useState, useEffect } from 'react';
import {
  Sparkles,
  Heart,
  Share2,
  BookOpen,
  Settings,
  CircleDot,
  CheckCircle2,
  ShieldCheck,
  User,
  Volume2,
  Calendar,
  Layers,
  ArrowRight
} from 'lucide-react';
import { projectOwnerService, ProjectOwnerProfile } from '../services/projectOwnerService';
import { OwnerSadaqahModal } from '../components/OwnerSadaqahModal';
import { Star8Rosette, BismillahHeader } from '../components/IslamicDecoration';

interface OwnerSadaqahPageProps {
  onOpenDedication?: (type?: 'surah' | 'tasbeeh' | 'dua' | 'khatmah') => void;
  onOpenQuran?: () => void;
  onOpenPersons?: () => void;
}

export const OwnerSadaqahPage: React.FC<OwnerSadaqahPageProps> = ({
  onOpenDedication,
  onOpenQuran,
  onOpenPersons,
}) => {
  const [profile, setProfile] = useState<ProjectOwnerProfile>(() => projectOwnerService.getOwnerProfile());
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [amenCount, setAmenCount] = useState<number>(() => {
    try {
      const saved = localStorage.getItem('sadaqah_owner_amen_count');
      return saved ? parseInt(saved, 10) : 12;
    } catch {
      return 12;
    }
  });
  const [hasAmened, setHasAmened] = useState(false);
  const [copiedNotification, setCopiedNotification] = useState(false);

  useEffect(() => {
    return projectOwnerService.subscribe((updated) => {
      setProfile(updated);
    });
  }, []);

  const handleAmen = () => {
    if (!hasAmened) {
      const next = amenCount + 1;
      setAmenCount(next);
      setHasAmened(true);
      try {
        localStorage.setItem('sadaqah_owner_amen_count', String(next));
      } catch {}
    }
  };

  const handleShare = async () => {
    const shareText = `صدقة جارية - عائلة الشهاوي\nعن صاحب ومُنشئ المنصة: ${profile.name}\n${profile.dedicationDua}\nدعوة حلوة من القلب له ولوالديه بالرحمة والمغفرة.`;
    if (navigator.share) {
      try {
        await navigator.share({
          title: `صدقة جارية - ${profile.name}`,
          text: shareText,
          url: window.location.href,
        });
        return;
      } catch (err) {}
    }

    try {
      await navigator.clipboard.writeText(shareText);
      setCopiedNotification(true);
      setTimeout(() => setCopiedNotification(false), 2500);
    } catch (e) {
      alert('اتنسخ نص الدعاء علشان تشاركه مع حبايبك!');
    }
  };

  return (
    <div className="min-h-screen pb-24 sm:pb-32 bg-[#F8F7F4] dark:bg-[#12141A] text-stone-900 dark:text-stone-100 transition-colors">
      {/* Hero Header */}
      <div className="relative overflow-hidden bg-gradient-to-b from-amber-950 via-[#1a1714] to-[#12141A] text-white pt-10 pb-16 sm:pb-20 px-4 sm:px-6 border-b border-amber-900/40">
        <div className="absolute inset-0 opacity-10 bg-[radial-gradient(#d97706_1px,transparent_1px)] [background-size:16px_16px]"></div>

        <div className="max-w-4xl mx-auto relative z-10 text-center space-y-4">
          <BismillahHeader />

          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-amber-500/20 border border-amber-500/40 text-amber-300 text-xs sm:text-sm font-semibold tracking-wide">
            <Sparkles className="w-4 h-4 text-amber-400" />
            <span>صدقة جارية · عائلة الشهاوي</span>
          </div>

          <h1 className="font-amiri text-3xl sm:text-5xl font-bold tracking-tight text-white">
            {profile.name}
          </h1>

          <p className="text-amber-200/90 font-amiri text-lg sm:text-xl font-medium">
            {profile.title} · {profile.relation}
          </p>

          <p className="text-stone-300 text-xs sm:text-sm max-w-2xl mx-auto leading-relaxed">
            {profile.bio}
          </p>

          {/* Quick Action Pills */}
          <div className="flex flex-wrap items-center justify-center gap-2 sm:gap-3 pt-3">
            <button
              onClick={() => onOpenDedication && onOpenDedication('dua')}
              className="px-5 py-2.5 rounded-2xl bg-gradient-to-r from-amber-600 to-amber-700 hover:from-amber-500 hover:to-amber-600 text-white font-bold text-xs sm:text-sm flex items-center gap-2 shadow-lg shadow-amber-950/50 cursor-pointer transition-all transform hover:-translate-y-0.5"
            >
              <Heart className="w-4 h-4 text-rose-300" />
              <span>أهدي ثواب عمل صالح</span>
            </button>

            <button
              onClick={handleShare}
              className="px-4 py-2.5 rounded-2xl bg-white/10 hover:bg-white/15 border border-white/20 text-white font-medium text-xs sm:text-sm flex items-center gap-2 backdrop-blur-md cursor-pointer transition-colors"
            >
              <Share2 className="w-4 h-4 text-amber-300" />
              <span>مشاركة بطاقة الصدقة</span>
            </button>

            <button
              onClick={() => setIsEditModalOpen(true)}
              className="px-4 py-2.5 rounded-2xl bg-white/5 hover:bg-white/10 border border-white/15 text-stone-300 hover:text-white font-medium text-xs sm:text-sm flex items-center gap-2 cursor-pointer transition-colors"
              title="تخصيص بيانات وأدعية صاحب المنصة"
            >
              <Settings className="w-4 h-4 text-amber-400" />
              <span>تخصيص البيانات</span>
            </button>
          </div>

          {copiedNotification && (
            <div className="inline-block p-2 px-4 rounded-xl bg-emerald-900/90 text-emerald-200 text-xs font-bold border border-emerald-500/50 animate-bounce">
              ✓ اتنسخ نص الدعاء علشان تشاركه مع حبايبك على طول!
            </div>
          )}
        </div>
      </div>

      {/* Main Content Area */}
      <div className="max-w-4xl mx-auto px-4 sm:px-6 -mt-8 relative z-20 space-y-6 sm:space-y-8">
        
        {/* The Golden Dua Box */}
        <div className="p-6 sm:p-8 rounded-3xl bg-white dark:bg-stone-900 border border-amber-600/30 dark:border-amber-500/20 shadow-xl space-y-5 text-center relative overflow-hidden">
          <div className="flex justify-center">
            <Star8Rosette className="w-10 h-10 text-amber-600 dark:text-amber-500" />
          </div>

          <h2 className="font-amiri text-xl sm:text-2xl font-bold text-amber-900 dark:text-amber-300">
            دعوة حلوة من القلب بالرحمة والمغفرة ونور القبر
          </h2>

          <div className="p-5 sm:p-7 rounded-2xl bg-amber-500/10 dark:bg-stone-950/80 border border-amber-600/20 text-stone-800 dark:text-amber-100 font-amiri text-lg sm:text-2xl leading-loose font-normal select-text">
            {profile.dedicationDua}
          </div>

          {/* Amen Counter Button */}
          <div className="flex flex-wrap items-center justify-center gap-4 pt-2">
            <button
              onClick={handleAmen}
              className={`px-6 py-2.5 rounded-2xl font-bold text-sm flex items-center gap-2 transition-all cursor-pointer ${
                hasAmened
                  ? 'bg-emerald-600 text-white shadow-md'
                  : 'bg-amber-600 hover:bg-amber-500 text-white shadow-md shadow-amber-900/30'
              }`}
            >
              <CheckCircle2 className="w-4 h-4" />
              <span>{hasAmened ? 'آمين وتقبل الله منك' : 'اللهم آمين (ربنا يتقبل)'}</span>
              <span className="px-2 py-0.5 rounded-full bg-black/20 text-xs">
                {amenCount}
              </span>
            </button>
          </div>
        </div>

        {/* The Owner's Will & Message Card */}
        {profile.willAndMessage && (
          <div className="p-6 sm:p-7 rounded-3xl bg-white dark:bg-stone-900 border border-stone-200 dark:border-stone-800 shadow-md space-y-3">
            <div className="flex items-center gap-2.5 text-amber-700 dark:text-amber-400 font-bold text-sm">
              <ShieldCheck className="w-5 h-5 shrink-0" />
              <span>رسالة وكلمة من قلبي لكل اللي منورين المنصة:</span>
            </div>
            <p className="text-stone-700 dark:text-stone-300 leading-relaxed font-amiri text-base sm:text-lg">
              {profile.willAndMessage}
            </p>
          </div>
        )}

        {/* Badges / Spiritual Marks */}
        <div className="p-5 rounded-3xl bg-stone-100 dark:bg-stone-900/60 border border-stone-200 dark:border-stone-800 flex flex-wrap items-center justify-center gap-2 sm:gap-3 text-xs font-semibold">
          {profile.badges.map((b, idx) => (
            <span
              key={idx}
              className="px-3.5 py-1.5 rounded-full bg-amber-500/15 text-amber-800 dark:text-amber-300 border border-amber-500/30"
            >
              ✦ {b}
            </span>
          ))}
          <span className="px-3.5 py-1.5 rounded-full bg-stone-200 dark:bg-stone-800 text-stone-600 dark:text-stone-400">
            {profile.dateCreated}
          </span>
        </div>

        {/* Spiritual Continuity Zone: Dedicated to the family & Uncles */}
        <div className="p-6 sm:p-7 rounded-3xl bg-gradient-to-r from-amber-900/15 via-amber-800/10 to-transparent border border-amber-700/30 flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="space-y-1 text-center sm:text-right">
            <h3 className="font-amiri text-lg font-bold text-amber-900 dark:text-amber-300">
              حبايب قلبي من عائلة الشهاوي
            </h3>
            <p className="text-xs text-stone-600 dark:text-stone-400">
              المنصة مهداة كمان عن أرواح عمامي الأربعة ربنا يرحمهم ويجعل قبورهم روضة من رياض الجنة: رمضان، الشهاوي، الشافعي، وأحمد.
            </p>
          </div>
          <button
            onClick={onOpenPersons}
            className="px-5 py-2.5 rounded-xl bg-amber-600 hover:bg-amber-500 text-white text-xs font-bold shrink-0 flex items-center gap-1.5 transition-colors cursor-pointer"
          >
            <span>زيارة صفحة حبايبنا</span>
            <ArrowRight className="w-4 h-4 rtl:rotate-180" />
          </button>
        </div>

      </div>

      {/* Settings Modal */}
      <OwnerSadaqahModal
        isOpen={isEditModalOpen}
        onClose={() => setIsEditModalOpen(false)}
        onSaved={() => setProfile(projectOwnerService.getOwnerProfile())}
      />
    </div>
  );
};
