import React from 'react';
import { Star8Rosette } from './IslamicDecoration';
import { HONORED_PERSONS } from '../data/persons';
import { Heart, Sparkles, ExternalLink } from 'lucide-react';

interface FooterProps {
  setActiveTab: (tab: string) => void;
  onOpenDedication: () => void;
  onOpenPrayerTimes?: () => void;
  onOpenBackup?: () => void;
}

export const Footer: React.FC<FooterProps> = ({
  setActiveTab,
  onOpenDedication,
  onOpenPrayerTimes,
  onOpenBackup,
}) => {
  return (
    <footer className="w-full bg-[#03160e] text-stone-200 border-t border-amber-900/35 pt-16 pb-28 sm:pb-24 lg:pb-12 text-right transition-colors">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Top Rosette Ribbon */}
        <div className="flex items-center justify-center gap-3 mb-10 text-amber-500/50">
          <div className="h-px w-20 sm:w-40 bg-gradient-to-r from-transparent to-amber-600/40" />
          <Star8Rosette className="w-5 h-5 text-amber-400/80" />
          <div className="h-px w-20 sm:w-40 bg-gradient-to-l from-transparent to-amber-600/40" />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-12 gap-8 lg:gap-12 pb-12 border-b border-stone-800/80">
          
          {/* Brand & Dedication Info (Col 1-5) */}
          <div className="md:col-span-5 space-y-4">
            <div className="flex items-center gap-3">
              <span className="w-9 h-9 rounded-full bg-amber-900/40 border border-amber-600/30 flex items-center justify-center text-amber-300 font-amiri text-xl font-bold">
                ص
              </span>
              <div className="flex flex-col">
                <span className="font-amiri text-2xl font-bold text-stone-100">
                  صدقة جارية
                </span>
                <span className="font-amiri text-xs text-amber-400 font-bold -mt-1">
                  عائلة الشهاوي
                </span>
              </div>
            </div>

            <p className="font-amiri text-base text-stone-400 leading-relaxed max-w-md">
              المنصة دي معموله بحب وصدقة جارية لوجه الله عن عائلة الشهاوي وأرواح عمامي الأربعة ربنا يرحمهم.. يا رب يتقبل من كل حد يقرأ أو يسبح هنا، ويجعله نور ورحمة في ميزان حسنات الجميع.
            </p>

            <div className="pt-2">
              <div className="text-xs uppercase tracking-wider text-amber-400/90 font-medium mb-2">
                أهدي هذا العمل خالصاً عن أرواح حبايبنا:
              </div>
              <ul className="grid grid-cols-1 sm:grid-cols-2 gap-1.5 text-xs text-stone-300 font-amiri">
                {HONORED_PERSONS.map((person) => (
                  <li key={person.id} className="flex items-center gap-1.5">
                    <span className="w-1.5 h-1.5 rounded-full bg-amber-500/80 shrink-0" />
                    <span>{person.name}</span>
                  </li>
                ))}
              </ul>
            </div>
          </div>

          {/* Quick Nav Links (Col 6-8) */}
          <div className="md:col-span-3 space-y-3">
            <h4 className="text-sm font-semibold text-stone-200">
              أقسام المنصة
            </h4>
            <ul className="space-y-2 text-xs text-stone-400">
              <li>
                <button
                  onClick={() => { setActiveTab('quran'); window.scrollTo({ top: 0, behavior: 'smooth' }); }}
                  className="hover:text-amber-300 transition-colors cursor-pointer"
                >
                  فهرس السور والتلاوة (114 سورة)
                </button>
              </li>
              <li>
                <button
                  onClick={() => { setActiveTab('mushaf'); window.scrollTo({ top: 0, behavior: 'smooth' }); }}
                  className="hover:text-amber-300 transition-colors cursor-pointer"
                >
                  المصحف الورقي (طبعة المدينة 604 صفحة)
                </button>
              </li>
              <li>
                <button
                  onClick={() => { setActiveTab('khatmah'); window.scrollTo({ top: 0, behavior: 'smooth' }); }}
                  className="hover:text-amber-300 transition-colors cursor-pointer"
                >
                  الختمة القرآنية المهداة (30 جزءاً)
                </button>
              </li>
              <li>
                <button
                  onClick={() => { setActiveTab('recitations'); window.scrollTo({ top: 0, behavior: 'smooth' }); }}
                  className="hover:text-amber-300 transition-colors cursor-pointer"
                >
                  التلاوات والاستماع لكبار القراء
                </button>
              </li>
              <li>
                <button
                  onClick={() => { setActiveTab('asma'); window.scrollTo({ top: 0, behavior: 'smooth' }); }}
                  className="hover:text-amber-300 transition-colors cursor-pointer"
                >
                  أسماء الله الحسنى ومعانيها
                </button>
              </li>
              <li>
                <button
                  onClick={() => { setActiveTab('duas'); window.scrollTo({ top: 0, behavior: 'smooth' }); }}
                  className="hover:text-amber-300 transition-colors cursor-pointer"
                >
                  مكتبة أدعية المتوفين والمغفرة
                </button>
              </li>
              <li>
                <button
                  onClick={() => { setActiveTab('adhkar'); window.scrollTo({ top: 0, behavior: 'smooth' }); }}
                  className="hover:text-amber-300 transition-colors cursor-pointer"
                >
                  الأذكار اليومية وحصن المسلم
                </button>
              </li>
              <li>
                <button
                  onClick={() => { setActiveTab('tasbeeh'); window.scrollTo({ top: 0, behavior: 'smooth' }); }}
                  className="hover:text-amber-300 transition-colors cursor-pointer"
                >
                  السبحة الإلكترونية التفاعلية
                </button>
              </li>
              <li>
                <button
                  onClick={() => { setActiveTab('persons'); window.scrollTo({ top: 0, behavior: 'smooth' }); }}
                  className="hover:text-amber-300 transition-colors cursor-pointer"
                >
                  صفحات الأشخاص الأربعة والدعاء لهم
                </button>
              </li>
              <li>
                <button
                  onClick={() => { setActiveTab('owner_sadaqah'); window.scrollTo({ top: 0, behavior: 'smooth' }); }}
                  className="hover:text-amber-300 transition-colors cursor-pointer text-amber-300 font-medium"
                >
                  صدقة جارية لصاحب المنصة ✦
                </button>
              </li>
              <li>
                <button
                  onClick={() => { setActiveTab('prayer'); window.scrollTo({ top: 0, behavior: 'smooth' }); }}
                  className="hover:text-amber-300 transition-colors cursor-pointer text-amber-400 font-medium"
                >
                  مواقيت الصلاة اليومية (١٢ ساعة)
                </button>
              </li>
              <li>
                <button
                  onClick={() => { setActiveTab('haramain'); window.scrollTo({ top: 0, behavior: 'smooth' }); }}
                  className="hover:text-amber-300 transition-colors cursor-pointer text-stone-300"
                >
                  البث المباشر للحرمين الشريفين (مكة والمدينة)
                </button>
              </li>
              {onOpenBackup && (
                <li>
                  <button
                    onClick={onOpenBackup}
                    className="hover:text-amber-300 transition-colors cursor-pointer text-stone-400"
                  >
                    النسخ الاحتياطي وحفظ البيانات
                  </button>
                </li>
              )}
            </ul>
          </div>

          {/* Sincere Prayer & Deed (Col 9-12) */}
          <div className="md:col-span-4 space-y-4 bg-emerald-950/40 p-5 rounded-3xl border border-amber-500/30 backdrop-blur-md shadow-lg">
            <h4 className="text-sm font-bold text-amber-300 flex items-center gap-2">
              <Heart className="w-4 h-4 text-amber-400" />
              <span>أثر مستمر ودعاء لا ينقطع</span>
            </h4>
            <p className="font-amiri text-xs text-stone-200 leading-relaxed">
              قال رسول الله ﷺ: «إِذَا مَاتَ الإنْسَانُ انْقَطَعَ عنْه عَمَلُهُ إِلَّا مِن ثَلَاثَةٍ: إِلَّا مِن صَدَقَةٍ جَارِيَةٍ، أَوْ عِلْمٍ يُنْتَفَعُ بِهِ، أَوْ وَلَدٍ صَالِحٍ يَدْعُو له».
            </p>
            <button
              onClick={onOpenDedication}
              className="w-full py-2.5 px-3 text-xs font-bold rounded-xl dmda-gold-gradient text-white shadow-xs dmda-tactile-btn transition-all cursor-pointer flex items-center justify-center gap-2"
            >
              <span>أهدِ ثواباً وقراءة الآن</span>
            </button>
          </div>

        </div>

        {/* Bottom Credits & Copyright */}
        <div className="pt-8 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-stone-500">
          <div className="flex items-center gap-2">
            <span>صدقة جارية - عائلة الشهاوي · جميع الحقوق محفوظة لوجه الله تعالى</span>
          </div>

          <div className="flex items-center gap-1.5 text-stone-400 dir-ltr text-left">
            <span className="text-stone-400 font-medium">Designed & Developed by</span>
            <a
              href="https://medoandroid.github.io/DevMeDoAnDrOiD/"
              target="_blank"
              rel="noopener noreferrer"
              className="font-semibold text-amber-400 hover:text-amber-300 underline underline-offset-4 decoration-amber-500/50 hover:decoration-amber-300 transition-colors inline-flex items-center gap-1 group"
              title="Mohamed Ayman Portfolio"
            >
              <span>Mohamed Ayman</span>
              <ExternalLink className="w-3 h-3 text-amber-400/70 group-hover:text-amber-300 transition-colors" />
            </a>
            <span className="text-stone-500">&</span>
            <span className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded-md bg-amber-950/70 border border-amber-500/30 text-[10px] font-bold text-amber-300 shadow-2xs">
              <Sparkles className="w-2.5 h-2.5 text-amber-400" />
              <span>AI</span>
            </span>
          </div>
        </div>

      </div>
    </footer>
  );
};
