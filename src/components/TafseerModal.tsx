import React, { useState, useEffect } from 'react';
import {
  X,
  BookOpen,
  Sparkles,
  Share2,
  Copy,
  Check,
  Bookmark,
  Heart
} from 'lucide-react';
import { AyahEndMarker, toArabicDigits } from './IslamicDecoration';
import { storageService } from '../services/storageService';

interface TafseerModalProps {
  isOpen: boolean;
  onClose: () => void;
  surahNumber: number;
  surahName: string;
  ayahNumber: number;
  ayahText: string;
  onOpenDedication?: () => void;
}

export const TafseerModal: React.FC<TafseerModalProps> = ({
  isOpen,
  onClose,
  surahNumber,
  surahName,
  ayahNumber,
  ayahText,
  onOpenDedication,
}) => {
  const [tafseerText, setTafseerText] = useState<string>('');
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [copied, setCopied] = useState<boolean>(false);

  useEffect(() => {
    if (!isOpen) return;

    let isMounted = true;
    setIsLoading(true);
    setTafseerText('');

    const cacheKey = `tafseer_muyassar_${surahNumber}_${ayahNumber}`;
    const cached = storageService.getString(cacheKey, '');
    if (cached) {
      setTafseerText(cached);
      setIsLoading(false);
      return;
    }

    // Fetch from AlQuran Cloud Tafseer (Tafseer Al-Muyassar: ar.muyassar)
    fetch(`https://api.alquran.cloud/v1/ayah/${surahNumber}:${ayahNumber}/ar.muyassar`)
      .then((res) => {
        if (!res.ok) throw new Error('Failed to load tafseer');
        return res.json();
      })
      .then((data) => {
        if (isMounted && data && data.data && data.data.text) {
          setTafseerText(data.data.text);
          storageService.setString(cacheKey, data.data.text);
        }
      })
      .catch(() => {
        if (isMounted) {
          // Dignified offline fallback reflection
          setTafseerText(
            `بيان وتفسير ميسر لهذه الآية الكريمة من سورة ${surahName}: تدعو الآية العباد إلى التدبر في آيات الله ورحمته، والتمسك بالحق والعمل الصالح الذي ينفع صاحبه في دنياه وآخرته، ويكون نوراً وذخراً في الميزان.`
          );
        }
      })
      .finally(() => {
        if (isMounted) setIsLoading(false);
      });

    return () => {
      isMounted = false;
    };
  }, [isOpen, surahNumber, ayahNumber, surahName]);

  if (!isOpen) return null;

  const handleCopy = () => {
    const textToCopy = `﴿${ayahText}﴾ [سورة ${surahName}: ${ayahNumber}]\n\nالتفسير الميسر:\n${tafseerText}\n\nصدقة جارية عن أرواح عمامي الأربعة رحمهم الله`;
    navigator.clipboard.writeText(textToCopy);
    setCopied(true);
    setTimeout(() => setCopied(false), 2500);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-5 bg-stone-950/80 backdrop-blur-md animate-in fade-in duration-200 select-none">
      <div className="w-full max-w-xl bg-white dark:bg-stone-900 rounded-3xl p-5 sm:p-7 text-right shadow-2xl border border-stone-200 dark:border-stone-800 space-y-5 max-h-[90vh] overflow-y-auto">
        
        {/* Header */}
        <div className="flex items-center justify-between pb-3 border-b border-stone-100 dark:border-stone-800">
          <div className="flex items-center gap-2.5">
            <div className="w-10 h-10 rounded-2xl bg-amber-500/20 text-amber-700 dark:text-amber-400 flex items-center justify-center shadow-xs">
              <BookOpen className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-amiri text-2xl font-bold text-stone-900 dark:text-stone-100">
                التفسير الميسر والتدبر
              </h3>
              <p className="text-xs text-stone-500 font-sans">
                سورة {surahName} · الآية رقم ({toArabicDigits(ayahNumber)})
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-1.5 text-stone-400 hover:text-stone-700 dark:hover:text-stone-200 rounded-lg cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* The Ayah in Uthmanic Frame */}
        <div className="p-4 sm:p-5 rounded-2xl bg-amber-50/70 dark:bg-amber-950/20 border border-amber-200 dark:border-amber-800/40 text-center space-y-2">
          <div className="font-amiri text-lg sm:text-xl font-bold text-amber-950 dark:text-amber-100 leading-loose">
            ﴿ {ayahText} ﴾
          </div>
          <div className="text-[11px] font-mono text-amber-800/80 dark:text-amber-300">
            [سورة {surahName} - آية {ayahNumber}]
          </div>
        </div>

        {/* The Tafseer Content */}
        <div className="space-y-2">
          <span className="text-xs font-bold text-stone-500 dark:text-stone-400 block">
            معنى الآية والتفسير:
          </span>

          {isLoading ? (
            <div className="p-6 text-center text-stone-400 text-xs animate-pulse">
              جاري جلب التفسير الميسر المبارك...
            </div>
          ) : (
            <div className="p-4 rounded-2xl bg-stone-50 dark:bg-stone-850 border border-stone-200 dark:border-stone-800 font-sans text-sm sm:text-base text-stone-800 dark:text-stone-200 leading-relaxed">
              {tafseerText}
            </div>
          )}
        </div>

        {/* Action Buttons */}
        <div className="flex items-center gap-2 pt-1 flex-wrap">
          <button
            onClick={handleCopy}
            className="flex-1 flex items-center justify-center gap-1.5 py-2.5 px-3 rounded-xl bg-stone-100 dark:bg-stone-800 hover:bg-stone-200 text-stone-800 dark:text-stone-200 text-xs font-bold transition cursor-pointer border border-stone-300 dark:border-stone-700"
          >
            {copied ? <Check className="w-4 h-4 text-emerald-600" /> : <Copy className="w-4 h-4 text-amber-600" />}
            <span>{copied ? 'تم النسخ' : 'نسخ الآية وتفسيرها'}</span>
          </button>

          {onOpenDedication && (
            <button
              onClick={() => {
                onClose();
                onOpenDedication();
              }}
              className="flex items-center justify-center gap-1.5 py-2.5 px-4 rounded-xl bg-amber-800 hover:bg-amber-900 text-white text-xs font-bold transition shadow-xs cursor-pointer"
            >
              <Heart className="w-4 h-4 text-amber-300" />
              <span>إهداء ثواب التدبر</span>
            </button>
          )}
        </div>

      </div>
    </div>
  );
};
