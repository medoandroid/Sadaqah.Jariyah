import React, { useState, useEffect } from 'react';
import {
  Bookmark,
  X,
  Search,
  BookOpen,
  Copy,
  Trash2,
  ExternalLink,
  Sparkles,
  Share2,
  Check
} from 'lucide-react';
import { quranBookmarkService } from '../services/quranBookmarkService';
import { AyahBookmark } from '../types';

interface QuranBookmarksModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSelectAyah: (surahNumber: number, ayahNumber: number) => void;
  onShareAyahImage?: (surahName: string, surahNumber: number, ayahNumber: number, text: string) => void;
}

export const QuranBookmarksModal: React.FC<QuranBookmarksModalProps> = ({
  isOpen,
  onClose,
  onSelectAyah,
  onShareAyahImage,
}) => {
  const [bookmarks, setBookmarks] = useState<AyahBookmark[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [copiedId, setCopiedId] = useState<string | null>(null);

  useEffect(() => {
    if (isOpen) {
      setBookmarks(quranBookmarkService.getBookmarks());
    }
  }, [isOpen]);

  const handleRemove = (surahNumber: number, ayahNumber: number, e: React.MouseEvent) => {
    e.stopPropagation();
    quranBookmarkService.removeBookmark(surahNumber, ayahNumber);
    setBookmarks(quranBookmarkService.getBookmarks());
  };

  const handleCopy = (b: AyahBookmark, e: React.MouseEvent) => {
    e.stopPropagation();
    navigator.clipboard.writeText(`﴿${b.ayahText}﴾ [سورة ${b.surahName}: ${b.ayahNumber}]`);
    setCopiedId(b.id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  const filtered = bookmarks.filter((b) => {
    if (!searchQuery.trim()) return true;
    const q = searchQuery.toLowerCase();
    return (
      b.surahName.toLowerCase().includes(q) ||
      b.ayahText.toLowerCase().includes(q) ||
      String(b.ayahNumber).includes(q)
    );
  });

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-5 bg-stone-950/80 backdrop-blur-md animate-in fade-in duration-200 select-none">
      <div className="w-full max-w-2xl bg-white dark:bg-stone-900 rounded-3xl p-5 sm:p-7 text-right shadow-2xl border border-stone-200 dark:border-stone-800 max-h-[90vh] flex flex-col space-y-4">
        
        {/* Header */}
        <div className="flex items-center justify-between pb-3 border-b border-stone-100 dark:border-stone-800 shrink-0">
          <div className="flex items-center gap-2">
            <div className="w-9 h-9 rounded-xl bg-amber-500/20 text-amber-500 flex items-center justify-center">
              <Bookmark className="w-5 h-5 fill-current" />
            </div>
            <div>
              <h3 className="font-amiri text-2xl font-bold text-stone-900 dark:text-stone-100">
                مفضلة الآيات القرآنية
              </h3>
              <p className="text-[11px] text-stone-500">
                قائمة بآياتك المحفوظة للرجوع السريع وتدبرها
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

        {/* Search Bar */}
        {bookmarks.length > 0 && (
          <div className="relative shrink-0">
            <Search className="w-4 h-4 text-stone-400 absolute right-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="ابحث في الآيات المحفوظة أو اسم السورة..."
              className="w-full pr-10 pl-4 py-2 text-xs sm:text-sm rounded-xl bg-stone-50 dark:bg-stone-800 border border-stone-200 dark:border-stone-700 focus:outline-hidden focus:border-amber-600 text-stone-900 dark:text-stone-100"
            />
          </div>
        )}

        {/* Bookmarks List */}
        <div className="flex-1 overflow-y-auto space-y-3 pr-0.5">
          {bookmarks.length === 0 ? (
            <div className="py-16 text-center space-y-3">
              <Bookmark className="w-12 h-12 text-stone-300 dark:text-stone-700 mx-auto" />
              <div className="font-amiri text-xl font-bold text-stone-700 dark:text-stone-300">
                لا توجد آيات في المفضلة بعد
              </div>
              <p className="text-xs text-stone-500 max-w-sm mx-auto leading-relaxed">
                أثناء تلاوة القرآن الكريم، اضغط على أي آية واختر «حفظ علامة» لإضافتها إلى قائمتك الخاصة هنا.
              </p>
            </div>
          ) : filtered.length === 0 ? (
            <div className="py-10 text-center text-xs text-stone-500">
              لا توجد آيات مطابقة للبحث
            </div>
          ) : (
            filtered.map((b) => (
              <div
                key={b.id}
                onClick={() => {
                  onSelectAyah(b.surahNumber, b.ayahNumber);
                  onClose();
                }}
                className="p-4 rounded-2xl bg-stone-50/80 dark:bg-stone-800/60 border border-stone-200/80 dark:border-stone-750 hover:border-amber-500/50 shadow-2xs hover:shadow-xs transition-all cursor-pointer group space-y-2.5"
              >
                {/* Meta Header */}
                <div className="flex items-center justify-between text-xs">
                  <div className="flex items-center gap-2">
                    <span className="font-amiri font-bold text-amber-800 dark:text-amber-400 text-sm">
                      سورة {b.surahName}
                    </span>
                    <span className="text-stone-400">·</span>
                    <span className="font-mono text-stone-600 dark:text-stone-300 text-xs">
                      الآية {b.ayahNumber}
                    </span>
                  </div>

                  {/* Actions */}
                  <div className="flex items-center gap-1">
                    <button
                      type="button"
                      onClick={(e) => handleCopy(b, e)}
                      className="p-1.5 rounded-lg text-stone-400 hover:text-stone-700 dark:hover:text-stone-200 transition-colors"
                      title="نسخ نص الآية"
                    >
                      {copiedId === b.id ? (
                        <Check className="w-3.5 h-3.5 text-emerald-600" />
                      ) : (
                        <Copy className="w-3.5 h-3.5" />
                      )}
                    </button>

                    {onShareAyahImage && (
                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          onShareAyahImage(b.surahName, b.surahNumber, b.ayahNumber, b.ayahText);
                        }}
                        className="p-1.5 rounded-lg text-stone-400 hover:text-amber-600 transition-colors"
                        title="مشاركة كبطاقة مصورة"
                      >
                        <Share2 className="w-3.5 h-3.5" />
                      </button>
                    )}

                    <button
                      type="button"
                      onClick={(e) => handleRemove(b.surahNumber, b.ayahNumber, e)}
                      className="p-1.5 rounded-lg text-stone-400 hover:text-rose-600 transition-colors"
                      title="إزالة من المفضلة"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>

                {/* Ayah Text */}
                <p className="font-amiri text-lg text-stone-900 dark:text-stone-100 leading-[2.1] select-text">
                  «{b.ayahText}»
                </p>

                <div className="flex items-center justify-between text-[11px] text-amber-800 dark:text-amber-400 pt-1 group-hover:underline">
                  <span>اضغط للانتقال إلى الآية في السورة</span>
                  <ExternalLink className="w-3 h-3" />
                </div>
              </div>
            ))
          )}
        </div>

        {/* Footer */}
        <div className="pt-2 border-t border-stone-100 dark:border-stone-800 flex items-center justify-between text-xs text-stone-400 shrink-0">
          <span>إجمالي الآيات المحفوظة: {bookmarks.length}</span>
          <button
            onClick={onClose}
            className="px-4 py-1.5 rounded-xl bg-stone-100 dark:bg-stone-800 hover:bg-stone-200 text-stone-700 dark:text-stone-300 font-semibold cursor-pointer"
          >
            إغلاق
          </button>
        </div>

      </div>
    </div>
  );
};
