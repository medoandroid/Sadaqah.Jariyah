import React, { useState, useEffect, useMemo } from 'react';
import {
  Heart,
  Plus,
  Edit3,
  Trash2,
  Copy,
  Check,
  Star,
  Share2,
  Sparkles,
  BookOpen,
  Download,
  Search,
  Filter,
  Volume2,
  RotateCcw,
  CheckCircle2,
  X,
  Send,
  User,
  Quote
} from 'lucide-react';
import { PersonalDua } from '../types';
import { personalDuaService } from '../services/personalDuaService';
import { userProfileService } from '../services/userProfileService';
import { CustomSelect } from '../components/CustomSelect';
import { recordDedication } from '../services/dedicationService';
import { Star8Rosette, ArabesqueDivider } from '../components/IslamicDecoration';
import { HONORED_PERSONS } from '../data/persons';

interface PersonalDuaPageProps {
  onOpenDedicationForDua?: (duaTitle: string) => void;
  onOpenProfile?: () => void;
}

const CATEGORIES = [
  'الكل',
  'المفضلة',
  'الأموات والأرحام',
  'بر الوالدين',
  'الاستغفار والمناجاة',
  'تفريج الكروب',
  'جوامع الخير',
  'خاص بي',
];

const INSPIRATIONAL_PHRASES = [
  'اللَّهُمَّ اغْفِرْ لَهُ وَارْحَمْهُ وَعَافِهِ وَاعْفُ عَنْهُ وَأَكْرِمْ نُزُلَهُ وَوَسِّعْ مُدْخَلَهُ.',
  'اللَّهُمَّ اجْعَلْ قَبْرَهُ رَوْضَةً مِنْ رِيَاضِ الجَنَّةِ وَلا تَجْعَلْهُ حُفْرَةً مِنْ حُفَرِ النَّارِ.',
  'اللَّهُمَّ إِنَّكَ عَفُوٌّ كَرِيمٌ تُحِبُّ الْعَفْوَ فَاعْفُ عَنِّي وَعَنْ وَالِدَيَّ.',
  'رَبِّ اغْفِرْ لِي وَلِوَالِدَيَّ وَارْحَمْهُمَا كَمَا رَبَّيَانِي صَغِيراً.',
  'اللَّهُمَّ يَا فَاِرجَ الهَمِّ وَيَا كَاشِفَ الغَمِّ فَرِّجْ هَمِّي وَيَسِّرْ أَمْرِي.',
  'اللَّهُمَّ إِنِّي أَسْأَلُكَ خَيْرَ المَسْأَلَةِ، وَخَيْرَ الدُّعَاءِ، وَخَيْرَ النَّجَاحِ.',
];

export const PersonalDuaPage: React.FC<PersonalDuaPageProps> = ({ onOpenDedicationForDua, onOpenProfile }) => {
  const [profile, setProfile] = useState(userProfileService.getProfile());
  const [duasList, setDuasList] = useState<PersonalDua[]>([]);
  const [activeCategory, setActiveCategory] = useState<string>('الكل');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  // Editor Modal State
  const [showEditor, setShowEditor] = useState<boolean>(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [titleInput, setTitleInput] = useState<string>('');
  const [textInput, setTextInput] = useState<string>('');
  const [categoryInput, setCategoryInput] = useState<string>('الأموات والأرحام');
  const [targetPersonInput, setTargetPersonInput] = useState<string>('عمامي الأربعة رحمهم الله');

  // Recite Mode Modal State
  const [recitingDua, setRecitingDua] = useState<PersonalDua | null>(null);
  const [reciteCounter, setReciteCounter] = useState<number>(0);

  // Delete Confirmation Modal
  const [deletingId, setDeletingId] = useState<string | null>(null);

  useEffect(() => {
    loadDuas();
    const unsub = userProfileService.subscribe((p) => {
      setProfile(p);
    });
    return unsub;
  }, []);

  const loadDuas = () => {
    setDuasList(personalDuaService.getPersonalDuas());
  };

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 2500);
  };

  // Open editor for creating new Dua
  const handleOpenCreate = () => {
    const profile = userProfileService.getProfile();
    setEditingId(null);
    setTitleInput('');
    setTextInput('');
    setCategoryInput('الأموات والأرحام');
    setTargetPersonInput(profile.closestRelative || 'عمامي الأربعة رحمهم الله');
    setShowEditor(true);
  };

  // Open editor for existing Dua
  const handleOpenEdit = (dua: PersonalDua) => {
    setEditingId(dua.id);
    setTitleInput(dua.title);
    setTextInput(dua.text);
    setCategoryInput(dua.category || 'الأموات والأرحام');
    setTargetPersonInput(dua.targetPerson || 'عمامي الأربعة رحمهم الله');
    setShowEditor(true);
  };

  // Save new or updated Dua
  const handleSaveDua = (e: React.FormEvent) => {
    e.preventDefault();
    if (!titleInput.trim() || !textInput.trim()) {
      showToast('يرجى كتابة عنوان ونص الدعاء');
      return;
    }

    if (editingId) {
      personalDuaService.updatePersonalDua(editingId, {
        title: titleInput.trim(),
        text: textInput.trim(),
        category: categoryInput,
        targetPerson: targetPersonInput,
      });
      showToast('تم تعديل الدعاء وحفظه بنجاح');
    } else {
      personalDuaService.savePersonalDua({
        title: titleInput.trim(),
        text: textInput.trim(),
        category: categoryInput,
        targetPerson: targetPersonInput,
      });
      showToast('تم حفظ دعائك المبارك في المتصفح بنجاح');
    }

    loadDuas();
    setShowEditor(false);
  };

  // Delete Dua
  const handleConfirmDelete = () => {
    if (!deletingId) return;
    personalDuaService.deletePersonalDua(deletingId);
    setDeletingId(null);
    loadDuas();
    showToast('تم حذف الدعاء بنجاح');
  };

  // Toggle favorite
  const handleToggleFavorite = (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    personalDuaService.toggleFavorite(id);
    loadDuas();
  };

  // Copy text to clipboard
  const handleCopyText = (text: string, e?: React.MouseEvent) => {
    if (e) e.stopPropagation();
    navigator.clipboard.writeText(text);
    showToast('تم نسخ نص الدعاء إلى الحافظة');
  };

  // Dedicate Thawab for this Dua
  const handleDedicateThawab = (dua: PersonalDua, e: React.MouseEvent) => {
    e.stopPropagation();
    recordDedication('dua', dua.title, 'all', 1, 'داعي مخلص');
    showToast(`تم إهداء ثواب (${dua.title}) لأرواحهم الطاهرة`);
    if (onOpenDedicationForDua) {
      onOpenDedicationForDua(dua.title);
    }
  };

  // Insert inspirational phrase
  const handleInsertPhrase = (phrase: string) => {
    setTextInput((prev) => {
      const trimmed = prev.trim();
      return trimmed ? `${trimmed} ${phrase}` : phrase;
    });
  };

  // Export all as text
  const handleExportAll = () => {
    const text = personalDuaService.exportAllAsText();
    navigator.clipboard.writeText(text);
    showToast('تم نسخ جميع أدعيتك الشخصية كملف نصي كامل');
  };

  // Filtered list
  const filteredDuas = useMemo(() => {
    return duasList.filter((dua) => {
      const matchesSearch =
        searchQuery.trim() === '' ||
        dua.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        dua.text.toLowerCase().includes(searchQuery.toLowerCase()) ||
        (dua.targetPerson && dua.targetPerson.toLowerCase().includes(searchQuery.toLowerCase()));

      if (!matchesSearch) return false;

      if (activeCategory === 'الكل') return true;
      if (activeCategory === 'المفضلة') return dua.isFavorite;
      return dua.category === activeCategory;
    });
  }, [duasList, activeCategory, searchQuery]);

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8 text-right select-none">
      
      {/* Toast Alert */}
      {toastMessage && (
        <div className="fixed top-20 left-1/2 -translate-x-1/2 z-50 px-4 py-2.5 rounded-2xl bg-stone-900/95 text-amber-200 text-xs font-semibold shadow-2xl backdrop-blur-md border border-amber-500/25 animate-in fade-in zoom-in-95 duration-150 flex items-center gap-2">
          <Sparkles className="w-4 h-4 text-amber-400" />
          <span>{toastMessage}</span>
        </div>
      )}

      {/* Header Banner */}
      <div className="relative p-6 sm:p-10 rounded-3xl border border-stone-200/90 dark:border-stone-800 bg-gradient-to-b from-white via-[#FCFBF8] to-stone-50/70 dark:from-stone-900 dark:via-stone-900/90 dark:to-stone-950 shadow-md overflow-hidden text-center">
        
        {/* Subtle geometric star watermark */}
        <div className="absolute inset-0 flex items-center justify-center opacity-[0.03] dark:opacity-[0.05] pointer-events-none">
          <Star8Rosette className="w-[500px] h-[500px] text-amber-900 dark:text-amber-200" />
        </div>

        <div className="relative z-10 max-w-3xl mx-auto space-y-3">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-amber-100/70 dark:bg-stone-800 text-amber-900 dark:text-amber-300 text-xs font-semibold">
            <Heart className="w-3.5 h-3.5 text-amber-800 dark:text-amber-400 fill-amber-800/20" />
            <span>مساحتك الإيمانية الخاصة للمناجاة وحفظ الدعاء</span>
          </div>

          <h1 className="font-amiri text-3xl sm:text-5xl font-bold text-stone-900 dark:text-stone-100 tracking-tight">
            أدعيتي ومناجاتي الخاصة
          </h1>

          <p className="font-amiri text-base sm:text-lg text-stone-600 dark:text-stone-300 leading-relaxed max-w-2xl mx-auto">
            «وَإِذَا سَأَلَكَ عِبَادِي عَنِّي فَإِنِّي قَرِيبٌ أُجِيبُ دَعْوَةَ الدَّاعِ إِذَا دَعَانِ»
            <br />
            <span className="text-xs sm:text-sm text-stone-500 dark:text-stone-400 mt-1 block">
              اكتب أدعيتك الخاصة بقلب حاضر واحفظها محلياً في جهازك لترددها في أوقات الإجابة أو تهدي ثوابها لمن تحب.
            </span>
          </p>

          {/* Quick CTA Actions */}
          <div className="flex flex-wrap items-center justify-center gap-3 pt-3">
            <button
              onClick={handleOpenCreate}
              className="px-6 py-2.5 rounded-2xl bg-amber-800 hover:bg-amber-900 text-white font-amiri text-base font-bold shadow-md hover:shadow-lg transition-all cursor-pointer flex items-center gap-2 active:scale-95"
            >
              <Plus className="w-4 h-4 text-amber-300 stroke-[2.5]" />
              <span>كتابة دعاء جديد</span>
            </button>

            <button
              onClick={handleExportAll}
              className="px-4 py-2.5 rounded-2xl bg-white dark:bg-stone-800 hover:bg-stone-50 dark:hover:bg-stone-750 text-stone-700 dark:text-stone-200 border border-stone-200 dark:border-stone-700 text-xs sm:text-sm font-semibold transition-all cursor-pointer flex items-center gap-2 active:scale-95"
              title="نسخ جميع أدعيتي المحفوظة كنص كامل"
            >
              <Copy className="w-4 h-4 text-stone-400" />
              <span>نسخ جميع أدعيتي</span>
            </button>
          </div>
        </div>

      </div>

      {/* Tailored Kinship & Friendship Prayers Card */}
      <div className="p-5 sm:p-7 rounded-3xl bg-gradient-to-br from-amber-50/90 via-stone-50/70 to-amber-50/90 dark:from-stone-900 dark:via-stone-850 dark:to-stone-900 border border-amber-300/80 dark:border-amber-700/50 shadow-sm space-y-4 text-right">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 border-b border-amber-200/60 dark:border-stone-800 pb-3">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-xl bg-amber-500/15 flex items-center justify-center text-amber-800 dark:text-amber-300">
              <Sparkles className="w-4 h-4" />
            </div>
            <div>
              <h3 className="font-amiri text-lg font-bold text-stone-900 dark:text-stone-100">
                أدعية مهداة مخصصة لصلتك بهم ({userProfileService.getConnectionBadge(profile)})
              </h3>
              <p className="text-xs text-stone-500 dark:text-stone-400">
                أدعية صيغت بوفاء وإخلاص لتناسب علاقتك بالأعمام الكرام وتعينك على برهم
              </p>
            </div>
          </div>

          {onOpenProfile && (
            <button
              onClick={onOpenProfile}
              className="text-xs text-amber-800 dark:text-amber-400 font-bold hover:underline cursor-pointer"
            >
              {profile.hasConfigured ? 'تعديل صلتك بهم' : 'تحديد صلتك بالأعمام 🌿'}
            </button>
          )}
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {userProfileService.getSmartTailoredPrayers(profile).map((p, idx) => (
            <div
              key={idx}
              className="p-4 rounded-2xl bg-white dark:bg-stone-850 border border-stone-200/80 dark:border-stone-750 space-y-3 flex flex-col justify-between"
            >
              <div className="space-y-2">
                <span className="text-xs font-bold text-amber-900 dark:text-amber-300 block">
                  {p.title}
                </span>
                <p className="font-amiri text-sm sm:text-base text-stone-800 dark:text-stone-200 leading-relaxed text-justify">
                  «{p.arabic}»
                </p>
                <span className="text-[11px] text-stone-400 block font-sans">
                  ✨ {p.virtue}
                </span>
              </div>

              <div className="flex items-center justify-between pt-2 border-t border-stone-100 dark:border-stone-800 text-xs">
                <button
                  onClick={() => {
                    navigator.clipboard.writeText(p.arabic);
                    showToast('تم نسخ الدعاء المبارك');
                  }}
                  className="flex items-center gap-1 text-stone-500 hover:text-stone-800 dark:hover:text-stone-200 cursor-pointer"
                >
                  <Copy className="w-3.5 h-3.5" />
                  <span>نسخ</span>
                </button>

                <button
                  onClick={() => {
                    personalDuaService.savePersonalDua({
                      title: p.title,
                      text: p.arabic,
                      category: 'الأموات والأرحام',
                      targetPerson: p.targetUncleName || 'عمامي الأربعة رحمهم الله',
                    });
                    loadDuas();
                    showToast('تم حفظ الدعاء في قائمة أدعيتك الشخصية');
                  }}
                  className="flex items-center gap-1 px-3 py-1.5 rounded-xl bg-amber-800/10 hover:bg-amber-800 hover:text-white text-amber-900 dark:text-amber-300 font-bold transition-all cursor-pointer"
                >
                  <Plus className="w-3.5 h-3.5" />
                  <span>إضافة لقائمتي</span>
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>
      <div className="flex flex-col md:flex-row items-stretch md:items-center justify-between gap-3 p-3 sm:p-4 rounded-3xl bg-white dark:bg-stone-900 border border-stone-200/90 dark:border-stone-800 shadow-xs">
        
        {/* Search Input */}
        <div className="relative flex-1">
          <Search className="w-4 h-4 text-stone-400 absolute right-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="ابحث في عناوين ونصوص أدعيتك الشخصية..."
            className="w-full pr-10 pl-4 py-2 text-xs sm:text-sm rounded-2xl bg-stone-50 dark:bg-stone-800 border border-stone-200/80 dark:border-stone-700 focus:outline-hidden focus:border-amber-700 text-stone-900 dark:text-stone-100"
          />
        </div>

        {/* Categories Bar */}
        <div className="flex items-center gap-1.5 overflow-x-auto pb-1 sm:pb-0 scrollbar-none">
          {CATEGORIES.map((cat) => (
            <button
              key={cat}
              onClick={() => setActiveCategory(cat)}
              className={`px-3 py-1.5 rounded-xl text-xs font-semibold whitespace-nowrap transition-all cursor-pointer ${
                activeCategory === cat
                  ? 'bg-amber-800 text-white shadow-xs font-bold'
                  : 'bg-stone-100 dark:bg-stone-800 text-stone-600 dark:text-stone-400 hover:text-stone-900 hover:bg-stone-200/70'
              }`}
            >
              {cat === 'المفضلة' ? '★ المفضلة' : cat}
            </button>
          ))}
        </div>

      </div>

      {/* DUAS LIST GRID */}
      {filteredDuas.length === 0 ? (
        <div className="py-20 text-center rounded-3xl bg-white dark:bg-stone-900 border border-stone-200/80 dark:border-stone-800 space-y-4">
          <Heart className="w-12 h-12 text-amber-700/40 mx-auto" />
          <div className="font-amiri text-xl font-bold text-stone-800 dark:text-stone-200">
            لا توجد أدعية في هذا القسم حالياً
          </div>
          <p className="text-xs text-stone-500 max-w-md mx-auto leading-relaxed">
            يمكنك كتابة مناجاتك ودعائك الخاص وحفظه بنقرة واحدة ليبقى معك دائماً.
          </p>
          <button
            onClick={handleOpenCreate}
            className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-amber-800 text-white text-xs font-bold hover:bg-amber-900 cursor-pointer shadow-sm"
          >
            <Plus className="w-4 h-4" />
            <span>كتابة دعاء جديد</span>
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-5">
          {filteredDuas.map((dua) => (
            <div
              key={dua.id}
              className="p-5 sm:p-6 rounded-3xl bg-white dark:bg-stone-900 border border-stone-200/90 dark:border-stone-800 hover:border-amber-600/40 shadow-xs hover:shadow-md transition-all duration-200 flex flex-col justify-between group relative"
            >
              <div>
                {/* Card Top: Badges & Favorite Star */}
                <div className="flex items-center justify-between gap-2 mb-3">
                  <div className="flex items-center gap-1.5 flex-wrap">
                    <span className="text-[11px] px-2.5 py-0.5 rounded-lg bg-amber-50 dark:bg-amber-950/40 border border-amber-200/70 dark:border-amber-700/50 text-amber-900 dark:text-amber-300 font-semibold">
                      {dua.category}
                    </span>
                    {dua.targetPerson && (
                      <span className="text-[11px] px-2.5 py-0.5 rounded-lg bg-stone-100 dark:bg-stone-800 text-stone-600 dark:text-stone-400 font-medium">
                        المقصود: {dua.targetPerson}
                      </span>
                    )}
                  </div>

                  <button
                    onClick={(e) => handleToggleFavorite(dua.id, e)}
                    className={`p-1.5 rounded-lg transition-colors cursor-pointer ${
                      dua.isFavorite
                        ? 'text-amber-500 fill-amber-500'
                        : 'text-stone-300 hover:text-amber-500'
                    }`}
                    title={dua.isFavorite ? 'إزالة من المفضلة' : 'إضافة إلى المفضلة'}
                  >
                    <Star className={`w-4 h-4 ${dua.isFavorite ? 'fill-current' : ''}`} />
                  </button>
                </div>

                {/* Title */}
                <h3 className="font-amiri text-xl sm:text-2xl font-bold text-stone-900 dark:text-stone-100 mb-3 group-hover:text-amber-900 dark:group-hover:text-amber-300 transition-colors">
                  {dua.title}
                </h3>

                {/* Supplication Arabic Text */}
                <div className="p-4 rounded-2xl bg-amber-50/40 dark:bg-stone-800/40 border border-amber-200/40 dark:border-stone-750 mb-4">
                  <p className="font-amiri text-base sm:text-lg text-stone-800 dark:text-stone-200 leading-[2.1] select-text">
                    «{dua.text}»
                  </p>
                </div>
              </div>

              {/* Card Footer Toolbar */}
              <div className="pt-3 border-t border-stone-100 dark:border-stone-800 flex items-center justify-between gap-2 flex-wrap">
                
                {/* Recite Mode Trigger */}
                <div className="flex items-center gap-1.5">
                  <button
                    onClick={() => {
                      setRecitingDua(dua);
                      setReciteCounter(0);
                    }}
                    className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-amber-800 hover:bg-amber-900 text-white text-xs font-bold transition-all cursor-pointer shadow-xs active:scale-95"
                    title="فتح وضع الترديد والذكر بالعداد"
                  >
                    <BookOpen className="w-3.5 h-3.5" />
                    <span>ترديد ومناجاة</span>
                  </button>

                  <button
                    onClick={(e) => handleDedicateThawab(dua, e)}
                    className="flex items-center gap-1 px-2.5 py-1.5 rounded-xl bg-amber-100/70 hover:bg-amber-100 text-amber-900 dark:bg-amber-950/40 dark:text-amber-300 text-xs font-semibold transition-all cursor-pointer active:scale-95"
                    title="إهداء ثواب هذا الدعاء للمتوفين"
                  >
                    <Heart className="w-3.5 h-3.5 text-amber-700" />
                    <span className="hidden sm:inline">إهداء ثوابه</span>
                  </button>
                </div>

                {/* Action Icons: Copy, Edit, Delete */}
                <div className="flex items-center gap-1">
                  <button
                    onClick={(e) => handleCopyText(dua.text, e)}
                    className="p-1.5 rounded-lg text-stone-400 hover:text-stone-700 dark:hover:text-stone-200 hover:bg-stone-100 dark:hover:bg-stone-800 transition-colors cursor-pointer"
                    title="نسخ نص الدعاء"
                  >
                    <Copy className="w-4 h-4" />
                  </button>

                  <button
                    onClick={() => handleOpenEdit(dua)}
                    className="p-1.5 rounded-lg text-stone-400 hover:text-amber-800 dark:hover:text-amber-400 hover:bg-stone-100 dark:hover:bg-stone-800 transition-colors cursor-pointer"
                    title="تعديل الدعاء"
                  >
                    <Edit3 className="w-4 h-4" />
                  </button>

                  <button
                    onClick={() => setDeletingId(dua.id)}
                    className="p-1.5 rounded-lg text-stone-400 hover:text-red-600 hover:bg-stone-100 dark:hover:bg-stone-800 transition-colors cursor-pointer"
                    title="حذف الدعاء"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>

              </div>
            </div>
          ))}
        </div>
      )}

      {/* COMPOSER / EDITOR MODAL */}
      {showEditor && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-stone-950/70 backdrop-blur-sm animate-in fade-in duration-150">
          <div className="w-full max-w-2xl bg-white dark:bg-stone-900 rounded-3xl p-6 sm:p-8 text-right space-y-5 shadow-2xl border border-stone-200 dark:border-stone-800 max-h-[92vh] overflow-y-auto">
            
            <div className="flex items-center justify-between pb-3 border-b border-stone-200 dark:border-stone-800">
              <div className="flex items-center gap-2">
                <Heart className="w-5 h-5 text-amber-700 fill-amber-700/20" />
                <h3 className="font-amiri text-2xl font-bold text-stone-900 dark:text-stone-100">
                  {editingId ? 'تعديل الدعاء المحفوظ' : 'كتابة وحفظ دعاء مبارك'}
                </h3>
              </div>
              <button
                type="button"
                onClick={() => setShowEditor(false)}
                className="p-1.5 text-stone-400 hover:text-stone-700 dark:hover:text-stone-200 rounded-lg cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSaveDua} className="space-y-4">
              
              {/* Dua Title */}
              <div>
                <label className="block text-xs font-bold text-stone-700 dark:text-stone-300 mb-1.5">
                  عنوان الدعاء *
                </label>
                <input
                  type="text"
                  required
                  placeholder="مثال: دعاء قيام الليل، دعاء لعمي رمضان، دعاء تفريج الكرب"
                  value={titleInput}
                  onChange={(e) => setTitleInput(e.target.value)}
                  className="w-full px-3.5 py-2.5 text-sm bg-stone-50 dark:bg-stone-800 border border-stone-200 dark:border-stone-700 rounded-xl focus:outline-hidden focus:border-amber-700 text-stone-900 dark:text-stone-100"
                />
              </div>

              {/* Category & Target Person in 2 Columns */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <CustomSelect
                    label="تصنيف الدعاء"
                    value={categoryInput}
                    onChange={(val) => setCategoryInput(String(val))}
                    options={[
                      { value: 'الأموات والأرحام', label: 'الأموات والأرحام' },
                      { value: 'بر الوالدين', label: 'بر الوالدين' },
                      { value: 'الاستغفار والمناجاة', label: 'الاستغفار والمناجاة' },
                      { value: 'تفريج الكروب', label: 'تفريج الكروب' },
                      { value: 'جوامع الخير', label: 'جوامع الخير' },
                      { value: 'خاص بي', label: 'خاص بي' },
                    ]}
                    size="md"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-stone-700 dark:text-stone-300 mb-1.5 flex items-center justify-between">
                    <span>المقصود بالدعاء</span>
                    {profile.closestRelative && (
                      <span className="text-[10px] text-amber-600 dark:text-amber-400 font-normal">
                        طرفك الأقرب متاح بنقرة واحدة
                      </span>
                    )}
                  </label>
                  <input
                    type="text"
                    placeholder="مثال: والدي، أمي، عمامي الأربعة رحمهم الله..."
                    value={targetPersonInput}
                    onChange={(e) => setTargetPersonInput(e.target.value)}
                    className="w-full px-3.5 py-2.5 text-sm bg-stone-50 dark:bg-stone-800 border border-stone-200 dark:border-stone-700 rounded-xl focus:outline-hidden focus:border-amber-700 text-stone-900 dark:text-stone-100"
                  />
                  <div className="flex flex-wrap gap-1 pt-1.5">
                    {profile.closestRelative && (
                      <button
                        type="button"
                        onClick={() => setTargetPersonInput(profile.closestRelative)}
                        className="px-2 py-0.5 rounded-md bg-amber-100 dark:bg-amber-950/80 text-amber-900 dark:text-amber-300 text-[10px] font-bold border border-amber-300 dark:border-amber-700 cursor-pointer"
                      >
                        ❤️ {profile.closestRelative}
                      </button>
                    )}
                    <button
                      type="button"
                      onClick={() => setTargetPersonInput('عمامي الأربعة رحمهم الله')}
                      className="px-2 py-0.5 rounded-md bg-stone-100 dark:bg-stone-800 text-stone-600 dark:text-stone-300 text-[10px] border border-stone-200 dark:border-stone-700 cursor-pointer"
                    >
                      عمامي الأربعة رحمهم الله
                    </button>
                    <button
                      type="button"
                      onClick={() => setTargetPersonInput('لوالديّ الكرام')}
                      className="px-2 py-0.5 rounded-md bg-stone-100 dark:bg-stone-800 text-stone-600 dark:text-stone-300 text-[10px] border border-stone-200 dark:border-stone-700 cursor-pointer"
                    >
                      لوالديّ الكرام
                    </button>
                  </div>
                </div>
              </div>

              {/* Dua Textarea */}
              <div>
                <label className="block text-xs font-bold text-stone-700 dark:text-stone-300 mb-1.5">
                  نص الدعاء المبارك *
                </label>
                <textarea
                  required
                  rows={5}
                  placeholder="اكتب هنا دعاءك ومناجاتك بخشوع وطمأنينة..."
                  value={textInput}
                  onChange={(e) => setTextInput(e.target.value)}
                  className="w-full px-3.5 py-3 text-base font-amiri leading-relaxed bg-stone-50 dark:bg-stone-800 border border-stone-200 dark:border-stone-700 rounded-xl focus:outline-hidden focus:border-amber-700 text-stone-900 dark:text-stone-100"
                />
              </div>

              {/* Quick Starter Inspirational Phrases */}
              <div>
                <label className="block text-[11px] font-semibold text-stone-500 dark:text-stone-400 mb-1.5">
                  💡 اضغط على أي صيغة لإضافتها إلى نص دعائك:
                </label>
                <div className="flex flex-wrap gap-1.5">
                  {profile.closestRelative && (
                    <button
                      type="button"
                      onClick={() =>
                        handleInsertPhrase(
                          profile.relativeStatus === 'living'
                            ? `اللَّهُمَّ بَارِكْ فِي عُمْرِ ${profile.closestRelative} وَاحْفَظْهُ وَمَتِّعْهُ بِالصِّحَّةِ وَالعَافِيَةِ.`
                            : `اللَّهُمَّ اغْفِرْ لِـ ${profile.closestRelative} وَارْحَمْهُ وَاجْعَلْ قَبْرَهُ رَوْضَةً مِنْ رِيَاضِ الْجَنَّةِ.`
                        )
                      }
                      className="px-2.5 py-1 rounded-lg bg-amber-100 dark:bg-amber-950/80 text-amber-950 dark:text-amber-200 text-[11px] font-amiri font-bold transition-colors cursor-pointer border border-amber-300 dark:border-amber-700 text-right truncate max-w-xs"
                    >
                      ✨ دعاء لـ ({profile.closestRelative})
                    </button>
                  )}
                  {INSPIRATIONAL_PHRASES.map((phrase, idx) => (
                    <button
                      key={idx}
                      type="button"
                      onClick={() => handleInsertPhrase(phrase)}
                      className="px-2.5 py-1 rounded-lg bg-stone-100 hover:bg-amber-100/70 dark:bg-stone-800 dark:hover:bg-stone-750 text-stone-700 dark:text-stone-300 text-[11px] font-amiri transition-colors cursor-pointer border border-stone-200/60 dark:border-stone-700 text-right truncate max-w-xs"
                      title={phrase}
                    >
                      {phrase}
                    </button>
                  ))}
                </div>
              </div>

              {/* Buttons */}
              <div className="flex items-center justify-end gap-2.5 pt-3 border-t border-stone-200 dark:border-stone-800">
                <button
                  type="button"
                  onClick={() => setShowEditor(false)}
                  className="px-4 py-2 rounded-xl text-xs font-semibold text-stone-600 dark:text-stone-400 hover:bg-stone-100 dark:hover:bg-stone-800 cursor-pointer"
                >
                  إلغاء
                </button>
                <button
                  type="submit"
                  className="px-6 py-2 rounded-xl bg-amber-800 hover:bg-amber-900 text-white text-xs font-bold shadow-md cursor-pointer flex items-center gap-1.5"
                >
                  <Check className="w-4 h-4" />
                  <span>حفظ الدعاء محلياً</span>
                </button>
              </div>

            </form>
          </div>
        </div>
      )}

      {/* RECITE MODE POPUP (Interactive Counter & Large Typography) */}
      {recitingDua && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-stone-950/80 backdrop-blur-md animate-in fade-in duration-200">
          <div className="w-full max-w-xl bg-[#FAF8F5] dark:bg-stone-900 rounded-3xl p-6 sm:p-8 text-center space-y-6 shadow-2xl border border-amber-600/30">
            
            <div className="flex items-center justify-between pb-3 border-b border-amber-200/50 dark:border-stone-800">
              <div className="flex items-center gap-2 text-amber-800 dark:text-amber-400 text-xs font-bold">
                <Sparkles className="w-4 h-4" />
                <span>جلسة تكرار ومناجاة</span>
              </div>
              <button
                onClick={() => setRecitingDua(null)}
                className="p-1 text-stone-400 hover:text-stone-700 dark:hover:text-stone-200 rounded-lg cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div>
              <h3 className="font-amiri text-2xl font-bold text-stone-900 dark:text-stone-100 mb-2">
                {recitingDua.title}
              </h3>
              <p className="font-amiri text-xl sm:text-2xl text-stone-800 dark:text-stone-200 leading-[2.3] p-6 rounded-2xl bg-white/80 dark:bg-stone-800/80 border border-amber-200/60 dark:border-stone-700 shadow-inner">
                «{recitingDua.text}»
              </p>
            </div>

            {/* Recite Tap Counter */}
            <div className="space-y-3">
              <button
                type="button"
                onClick={() => {
                  setReciteCounter((prev) => prev + 1);
                  personalDuaService.incrementReciteCount(recitingDua.id);
                  if (typeof window !== 'undefined' && 'vibrate' in navigator) {
                    navigator.vibrate(25);
                  }
                }}
                className="w-28 h-28 mx-auto rounded-full bg-gradient-to-tr from-amber-700 via-amber-600 to-amber-500 text-white flex flex-col items-center justify-center cursor-pointer shadow-xl hover:scale-105 active:scale-95 transition-all ring-4 ring-amber-400/30"
              >
                <span className="text-[10px] font-sans opacity-85">اضغط للترديد</span>
                <span className="font-mono text-3xl font-bold">{reciteCounter}</span>
                <span className="text-[9px] opacity-80">مرة</span>
              </button>

              <div className="text-xs text-stone-500 dark:text-stone-400">
                كرر هذا الدعاء المبارك بيقين وحضور قلب. تم حفظ تكراراتك تلقائياً.
              </div>
            </div>

            <div className="flex items-center justify-center gap-3 pt-2">
              <button
                onClick={() => {
                  handleDedicateThawab(recitingDua, { stopPropagation: () => {} } as any);
                }}
                className="px-5 py-2 rounded-xl bg-amber-800 text-white text-xs font-bold hover:bg-amber-900 cursor-pointer shadow-sm flex items-center gap-1.5"
              >
                <Heart className="w-3.5 h-3.5 fill-current" />
                <span>إهداء ثواب هذا الترديد</span>
              </button>
              <button
                onClick={() => setRecitingDua(null)}
                className="px-4 py-2 rounded-xl bg-stone-200 dark:bg-stone-800 text-stone-700 dark:text-stone-300 text-xs font-semibold cursor-pointer"
              >
                إغلاق
              </button>
            </div>

          </div>
        </div>
      )}

      {/* DELETE CONFIRMATION MODAL */}
      {deletingId && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-stone-950/70 backdrop-blur-xs">
          <div className="w-full max-w-sm bg-white dark:bg-stone-900 rounded-3xl p-6 text-right space-y-4 shadow-2xl border border-stone-200 dark:border-stone-800">
            <h3 className="font-amiri text-xl font-bold text-stone-900 dark:text-stone-100 flex items-center gap-2">
              <Trash2 className="w-5 h-5 text-red-600" />
              <span>تأكيد حذف الدعاء</span>
            </h3>
            <p className="text-xs text-stone-600 dark:text-stone-400 leading-relaxed">
              هل أنت متأكد من حذف هذا الدعاء من قائمة أدعيتك الشخصية؟ لن تتمكن من استرجاعه بعد الحذف.
            </p>
            <div className="flex items-center justify-end gap-2 pt-2">
              <button
                onClick={() => setDeletingId(null)}
                className="px-4 py-2 rounded-xl text-xs font-semibold text-stone-600 hover:bg-stone-100 dark:text-stone-400 dark:hover:bg-stone-800 cursor-pointer"
              >
                إلغاء
              </button>
              <button
                onClick={handleConfirmDelete}
                className="px-4 py-2 rounded-xl bg-red-600 hover:bg-red-700 text-white text-xs font-bold cursor-pointer"
              >
                تأكيد الحذف
              </button>
            </div>
          </div>
        </div>
      )}

      <ArabesqueDivider />

    </div>
  );
};
