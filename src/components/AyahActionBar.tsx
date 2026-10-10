import React, { useState } from 'react';
import {
  Copy,
  Share2,
  Bookmark,
  Volume2,
  Pause,
  Info,
  Heart,
  X,
  Check,
  Sparkles,
  Link,
  BookOpen,
  FastForward,
  Play,
  Image as ImageIcon
} from 'lucide-react';
import { Ayah, SurahDetail } from '../types';

interface AyahActionBarProps {
  ayah: Ayah;
  surah: SurahDetail;
  isPlayingSingleAudio: boolean;
  isPlayingContinuousAudio: boolean;
  isBookmarked: boolean;
  onPlaySingleAudio: () => void;
  onPlayContinuousAudio: () => void;
  onOpenTafsir: () => void;
  onBookmark: () => void;
  onDedicate: () => void;
  onShareAsImage?: () => void;
  onClose: () => void;
  onShowToast: (msg: string) => void;
}

export const AyahActionBar: React.FC<AyahActionBarProps> = ({
  ayah,
  surah,
  isPlayingSingleAudio,
  isPlayingContinuousAudio,
  isBookmarked,
  onPlaySingleAudio,
  onPlayContinuousAudio,
  onOpenTafsir,
  onBookmark,
  onDedicate,
  onShareAsImage,
  onClose,
  onShowToast,
}) => {
  const [copiedType, setCopiedType] = useState<'pure' | 'full' | null>(null);

  // Copy pure verse text
  const handleCopyPureText = () => {
    navigator.clipboard.writeText(ayah.text);
    setCopiedType('pure');
    onShowToast('تم نسخ نص الآية الكريمة');
    setTimeout(() => setCopiedType(null), 2000);
  };

  // Copy full verse with surah name and ayah number
  const handleCopyFullText = () => {
    const fullText = `﴿${ayah.text}﴾ [سورة ${surah.name} : الآية ${ayah.numberInSurah}]`;
    navigator.clipboard.writeText(fullText);
    setCopiedType('full');
    onShowToast('تم نسخ الآية مع اسم السورة ورقمها');
    setTimeout(() => setCopiedType(null), 2000);
  };

  // Share pure verse
  const handleSharePure = () => {
    if (navigator.share) {
      navigator.share({
        text: `﴿${ayah.text}﴾`,
      }).catch(() => {});
    } else {
      handleCopyPureText();
    }
  };

  // Share full verse with metadata & link
  const handleShareFull = () => {
    const shareText = `﴿${ayah.text}﴾\n[سورة ${surah.name} : الآية ${ayah.numberInSurah}]\n- صدقة جارية عن أرواح المغفور لهم بإذن الله\n${window.location.origin}`;
    if (navigator.share) {
      navigator.share({
        title: `آية من سورة ${surah.name} (${ayah.numberInSurah})`,
        text: shareText,
        url: window.location.origin,
      }).catch(() => {});
    } else {
      navigator.clipboard.writeText(shareText);
      onShowToast('تم نسخ الآية الكاملة مع التفاصيل للمشاركة');
    }
  };

  return (
    <div
      className="fixed bottom-20 sm:bottom-6 left-1/2 -translate-x-1/2 z-40 w-[95%] max-w-3xl animate-in slide-in-from-bottom-5 duration-200"
      role="toolbar"
      aria-label="خيارات الآية المحددة"
    >
      <div className="bg-[#1C1F24]/95 text-stone-100 rounded-3xl p-3 sm:p-4 shadow-2xl backdrop-blur-md border border-amber-500/30 flex flex-col gap-2.5">
        
        {/* Top bar: Selected Ayah Summary */}
        <div className="flex items-center justify-between px-2 text-xs border-b border-stone-700/60 pb-2">
          <div className="flex items-center gap-2 flex-wrap min-w-0">
            <span className="w-2 h-2 rounded-full bg-amber-400 animate-pulse shrink-0" />
            <span className="font-bold text-amber-200">
              سورة {surah.name}
            </span>
            <span className="text-stone-400">·</span>
            <span className="font-semibold text-stone-200">
              الآية {ayah.numberInSurah}
            </span>
            <span className="text-stone-400 text-[11px] hidden sm:inline">
              (الجزء {ayah.juz} · ص {ayah.page})
            </span>
            {isPlayingContinuousAudio && (
              <span className="px-2 py-0.5 rounded-full bg-emerald-900/70 border border-emerald-500/60 text-emerald-300 font-bold text-[10px] animate-pulse">
                تلاوة ومتابعة مستمرة
              </span>
            )}
          </div>

          <div className="flex items-center gap-2">
            <span className="text-[11px] text-stone-400 hidden md:inline font-mono">
              اضغط على أي آية أخرى للتبديل
            </span>
            <button
              onClick={onClose}
              className="p-1 rounded-lg text-stone-400 hover:text-stone-100 hover:bg-stone-800 transition-colors cursor-pointer"
              title="إلغاء التحديد"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Action Buttons Row */}
        <div className="flex items-center justify-between gap-1.5 sm:gap-2 flex-wrap">
          
          {/* OPTION 1: Play single selected Ayah */}
          <button
            onClick={onPlaySingleAudio}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer shadow-xs active:scale-95 ${
              isPlayingSingleAudio
                ? 'bg-amber-600 text-white ring-2 ring-amber-400/50'
                : 'bg-amber-800/90 hover:bg-amber-800 text-white'
            }`}
            title={isPlayingSingleAudio ? 'إيقاف تلاوة الآية' : 'تلاوة هذه الآية فقط'}
          >
            {isPlayingSingleAudio ? (
              <>
                <Pause className="w-3.5 h-3.5" />
                <span>إيقاف</span>
              </>
            ) : (
              <>
                <Volume2 className="w-3.5 h-3.5" />
                <span>تلاوة الآية</span>
              </>
            )}
          </button>

          {/* OPTION 2: Continuous Playback starting from this Ayah */}
          <button
            onClick={onPlayContinuousAudio}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer shadow-xs active:scale-95 border ${
              isPlayingContinuousAudio
                ? 'bg-emerald-700 border-emerald-500 text-white ring-2 ring-emerald-400/40 animate-pulse'
                : 'bg-stone-800 hover:bg-stone-700 text-emerald-300 border-emerald-700/50'
            }`}
            title={isPlayingContinuousAudio ? 'إيقاف التلاوة المستمرة' : 'تلاوة تبدأ من هذه الآية وتستمر حتى نهاية السورة'}
          >
            {isPlayingContinuousAudio ? (
              <>
                <Pause className="w-3.5 h-3.5" />
                <span>إيقاف المتابعة</span>
              </>
            ) : (
              <>
                <FastForward className="w-3.5 h-3.5 text-emerald-400" />
                <span>تلاوة ومتابعة</span>
              </>
            )}
          </button>

          {/* Tafsir */}
          <button
            onClick={onOpenTafsir}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold bg-stone-800 hover:bg-stone-700 text-stone-200 transition-all cursor-pointer active:scale-95 border border-stone-700"
            title="عرض التفسير الميسر"
          >
            <Info className="w-3.5 h-3.5 text-amber-400" />
            <span>التفسير</span>
          </button>

          {/* Copy pure text */}
          <button
            onClick={handleCopyPureText}
            className="flex items-center gap-1.5 px-2.5 sm:px-3 py-1.5 rounded-xl text-xs font-semibold bg-stone-800 hover:bg-stone-700 text-stone-200 transition-all cursor-pointer active:scale-95 border border-stone-700"
            title="نسخ نص الآية فقط"
          >
            {copiedType === 'pure' ? (
              <Check className="w-3.5 h-3.5 text-emerald-400" />
            ) : (
              <Copy className="w-3.5 h-3.5 text-amber-400" />
            )}
            <span>نسخ الآية</span>
          </button>

          {/* Copy full (Ayah + Surah name + number) */}
          <button
            onClick={handleCopyFullText}
            className="flex items-center gap-1.5 px-2.5 sm:px-3 py-1.5 rounded-xl text-xs font-semibold bg-stone-800 hover:bg-stone-700 text-stone-200 transition-all cursor-pointer active:scale-95 border border-stone-700"
            title="نسخ الآية مع اسم السورة ورقم الآية"
          >
            {copiedType === 'full' ? (
              <Check className="w-3.5 h-3.5 text-emerald-400" />
            ) : (
              <BookOpen className="w-3.5 h-3.5 text-amber-400" />
            )}
            <span className="hidden sm:inline">نسخ مع السورة</span>
            <span className="sm:hidden">كاملة</span>
          </button>

          {/* Image Card Share */}
          {onShareAsImage && (
            <button
              onClick={onShareAsImage}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold bg-gradient-to-r from-amber-600 to-amber-700 hover:from-amber-500 hover:to-amber-600 text-white transition-all cursor-pointer active:scale-95 shadow-xs"
              title="إنشاء وتنزيل بطاقة إسلامية مصورة لهذه الآية"
            >
              <ImageIcon className="w-3.5 h-3.5 text-amber-200" />
              <span>بطاقة مصورة</span>
            </button>
          )}

          {/* Share */}
          <button
            onClick={handleShareFull}
            className="flex items-center gap-1.5 px-2.5 sm:px-3 py-1.5 rounded-xl text-xs font-semibold bg-stone-800 hover:bg-stone-700 text-stone-200 transition-all cursor-pointer active:scale-95 border border-stone-700"
            title="مشاركة الآية مع السورة والرابط"
          >
            <Share2 className="w-3.5 h-3.5 text-amber-400" />
            <span>مشاركة</span>
          </button>

          {/* Bookmark */}
          <button
            onClick={onBookmark}
            className={`flex items-center gap-1.5 px-2.5 sm:px-3 py-1.5 rounded-xl text-xs font-semibold transition-all cursor-pointer active:scale-95 border ${
              isBookmarked
                ? 'bg-amber-900/60 border-amber-500 text-amber-200'
                : 'bg-stone-800 hover:bg-stone-700 text-stone-200 border-stone-700'
            }`}
            title="حفظ علامة قراءة عند هذه الآية"
          >
            <Bookmark className={`w-3.5 h-3.5 ${isBookmarked ? 'fill-amber-400 text-amber-400' : 'text-amber-400'}`} />
            <span className="hidden sm:inline">{isBookmarked ? 'محفوظة' : 'حفظ علامة'}</span>
            <span className="sm:hidden">علامة</span>
          </button>

          {/* Dedicate */}
          <button
            onClick={onDedicate}
            className="flex items-center gap-1.5 px-2.5 sm:px-3 py-1.5 rounded-xl text-xs font-semibold bg-stone-800 hover:bg-stone-700 text-amber-200 transition-all cursor-pointer active:scale-95 border border-stone-700"
            title="إهداء ثواب قراءة الآية"
          >
            <Heart className="w-3.5 h-3.5 fill-amber-500 text-amber-500" />
            <span className="hidden sm:inline">إهداء الثواب</span>
          </button>

        </div>

      </div>
    </div>
  );
};
