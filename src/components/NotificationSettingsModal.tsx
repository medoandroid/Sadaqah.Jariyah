import React, { useState, useEffect } from 'react';
import {
  Bell,
  X,
  Sparkles,
  Clock,
  Volume2,
  VolumeX,
  Moon,
  CheckCircle2,
  AlertCircle,
  Heart,
  Send,
  Info,
  ShieldCheck,
  Check
} from 'lucide-react';
import {
  notificationService,
  DhikrNotificationSettings
} from '../services/notificationService';
import { CustomSelect } from './CustomSelect';

interface NotificationSettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const NotificationSettingsModal: React.FC<NotificationSettingsModalProps> = ({
  isOpen,
  onClose,
}) => {
  const [settings, setSettings] = useState<DhikrNotificationSettings>(() => notificationService.getSettings());
  const [permissionStatus, setPermissionStatus] = useState<NotificationPermission>(() => notificationService.getPermissionStatus());
  const [testResult, setTestResult] = useState<string | null>(null);
  const [isSendingTest, setIsSendingTest] = useState<boolean>(false);

  useEffect(() => {
    if (isOpen) {
      setSettings(notificationService.getSettings());
      setPermissionStatus(notificationService.getPermissionStatus());
      setTestResult(null);
    }
  }, [isOpen]);

  if (!isOpen) return null;

  const handleToggleEnabled = async (enabled: boolean) => {
    if (enabled && permissionStatus !== 'granted') {
      const result = await notificationService.requestPermission();
      setPermissionStatus(result);
      if (result !== 'granted') {
        setTestResult('لم يتم منح إذن الإشعارات في المتصفح. يرجى السماح بالإشعارات من إعدادات المتصفح.');
        return;
      }
    }

    const updated = notificationService.saveSettings({ enabled });
    setSettings(updated);
  };

  const handleUpdateInterval = (minutesStr: string) => {
    const mins = parseInt(minutesStr, 10);
    if (!isNaN(mins)) {
      const updated = notificationService.saveSettings({ intervalMinutes: mins });
      setSettings(updated);
    }
  };

  const handleCategoryToggle = (categoryKey: keyof DhikrNotificationSettings['categories']) => {
    const nextCategories = {
      ...settings.categories,
      [categoryKey]: !settings.categories[categoryKey],
    };
    const updated = notificationService.saveSettings({ categories: nextCategories });
    setSettings(updated);
  };

  const handleSendTest = async () => {
    setIsSendingTest(true);
    setTestResult(null);
    const success = await notificationService.sendTestNotification();
    setIsSendingTest(false);
    if (success) {
      setTestResult('✓ تم إرسال الإشعار التجريبي بنجاح! تفقّد شريط إشعارات جهازك.');
    } else {
      setTestResult('تعذر إظهار الإشعار. تأكد من تفعيل الإشعارات للمتصفح والنظام.');
    }
  };

  const intervalOptions = [
    { value: '15', label: 'كل ١٥ دقيقة (تذكير دائم)' },
    { value: '30', label: 'كل ٣٠ دقيقة (نصف ساعة)' },
    { value: '45', label: 'كل ٤٥ دقيقة' },
    { value: '60', label: 'كل ساعة (مُوصى به)' },
    { value: '120', label: 'كل ساعتين' },
    { value: '180', label: 'كل ٣ ساعات' },
  ];

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/75 backdrop-blur-sm animate-fade-in"
      onClick={onClose}
      dir="rtl"
    >
      <div
        className="w-full max-w-xl max-h-[92vh] flex flex-col bg-stone-900 border border-amber-800/40 rounded-3xl shadow-2xl text-stone-100 overflow-hidden"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between p-4 sm:p-5 border-b border-stone-800 bg-stone-950/70">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-amber-500/15 border border-amber-500/30 flex items-center justify-center text-amber-400">
              <Bell className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-amiri text-lg sm:text-xl font-bold text-amber-300">
                إشعارات الأذكار والصلاة على النبي ﷺ
              </h3>
              <p className="text-[11px] text-stone-400">
                تذكير دوري بالأذكار المباركة والدعاء بجدول زمني تختاره
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 text-stone-400 hover:text-stone-200 hover:bg-stone-800 rounded-xl transition-colors cursor-pointer"
            aria-label="إغلاق"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Body */}
        <div className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-4 sm:space-y-5 text-xs sm:text-sm">
          
          {/* Main Activation Card */}
          <div className="p-4 rounded-2xl bg-stone-950/80 border border-amber-500/25 flex items-center justify-between gap-4">
            <div className="space-y-1">
              <div className="flex items-center gap-2">
                <span className="font-bold text-stone-200">تفعيل الإشعارات الدورية</span>
                <span className={`text-[10px] px-2 py-0.5 rounded-full font-bold ${
                  settings.enabled && permissionStatus === 'granted'
                    ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30'
                    : 'bg-stone-800 text-stone-400'
                }`}>
                  {settings.enabled && permissionStatus === 'granted' ? 'مُفعّلة وجاهزة' : 'متوقفة'}
                </span>
              </div>
              <p className="text-[11px] text-stone-400 leading-relaxed">
                استقبال تنبيهات بالأدعية والصلاة على النبي ﷺ والاستغفار في أوقات منتظمة.
              </p>
            </div>
            <label className="relative inline-flex items-center cursor-pointer shrink-0">
              <input
                type="checkbox"
                checked={settings.enabled && permissionStatus === 'granted'}
                onChange={(e) => handleToggleEnabled(e.target.checked)}
                className="sr-only peer"
              />
              <div className="w-12 h-6 bg-stone-800 peer-focus:outline-hidden rounded-full peer peer-checked:after:translate-x-full rtl:peer-checked:after:-translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:start-[2px] after:bg-white after:border-stone-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-amber-600"></div>
            </label>
          </div>

          {/* Browser Permission Info Badge */}
          {permissionStatus === 'denied' && (
            <div className="p-3.5 rounded-2xl bg-red-950/50 border border-red-500/30 text-red-200 text-xs flex items-start gap-2.5">
              <AlertCircle className="w-4 h-4 text-red-400 shrink-0 mt-0.5" />
              <div className="space-y-1">
                <p className="font-bold">إذن الإشعارات محظور في متصفحك حالياً:</p>
                <p className="text-[11px] text-red-300/80 leading-relaxed">
                  لتفعيل التنبيهات، اضغط على أيقونة القفل أو الإعدادات بجانب شريط العنوان في المتصفح، ثم اختر «السماح بالإشعارات» وأعد المحاولة.
                </p>
              </div>
            </div>
          )}

          {/* Interval Selector */}
          <div className="p-4 rounded-2xl bg-stone-950/50 border border-stone-800 space-y-2">
            <label className="block text-xs font-bold text-stone-300 flex items-center gap-1.5">
              <Clock className="w-3.5 h-3.5 text-amber-400" />
              فترة التكرار بين كل إشعار وآخر:
            </label>
            <CustomSelect<string>
              value={String(settings.intervalMinutes)}
              options={intervalOptions}
              onChange={handleUpdateInterval}
              label="اختر الفاصل الزمني"
            />
          </div>

          {/* Category Checkboxes */}
          <div className="p-4 rounded-2xl bg-stone-950/50 border border-stone-800 space-y-3">
            <span className="block text-xs font-bold text-stone-300 flex items-center gap-1.5">
              <Sparkles className="w-3.5 h-3.5 text-amber-400" />
              المحتوى المراد عرضه في الإشعارات:
            </span>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs">
              {[
                { key: 'salawat' as const, label: 'الصلاة على النبي ﷺ', icon: Heart },
                { key: 'istighfar' as const, label: 'الاستغفار وسيد الاستغفار', icon: Sparkles },
                { key: 'tasbeeh' as const, label: 'التسبيح والتحميد', icon: Bell },
                { key: 'hawqala' as const, label: 'الحوقلة (لا حول ولا قوة إلا بالله)', icon: ShieldCheck },
                { key: 'baqiyat' as const, label: 'الباقيات الصالحات', icon: Sparkles },
                { key: 'deceasedDuas' as const, label: 'أدعية المغفور لهم وعائلة الشهاوي', icon: Heart },
              ].map((item) => {
                const checked = settings.categories[item.key];
                return (
                  <button
                    key={item.key}
                    type="button"
                    onClick={() => handleCategoryToggle(item.key)}
                    className={`p-2.5 rounded-xl border flex items-center justify-between transition-all cursor-pointer text-right ${
                      checked
                        ? 'bg-amber-500/10 border-amber-500/30 text-amber-200'
                        : 'bg-stone-900 border-stone-800 text-stone-400 hover:text-stone-300'
                    }`}
                  >
                    <div className="flex items-center gap-2">
                      <item.icon className="w-3.5 h-3.5 text-amber-400/80" />
                      <span>{item.label}</span>
                    </div>
                    <div className={`w-4 h-4 rounded-md flex items-center justify-center border ${
                      checked ? 'bg-amber-600 border-amber-500 text-white' : 'border-stone-700'
                    }`}>
                      {checked && <Check className="w-3 h-3 stroke-[3]" />}
                    </div>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Quiet Hours Card */}
          <div className="p-4 rounded-2xl bg-stone-950/50 border border-stone-800 flex items-center justify-between gap-3">
            <div className="space-y-1">
              <div className="flex items-center gap-1.5 font-bold text-xs text-stone-300">
                <Moon className="w-3.5 h-3.5 text-amber-400" />
                <span>ساعات الهدوء أثناء الليل (11م - 6ص)</span>
              </div>
              <p className="text-[11px] text-stone-400">
                إيقاف الإشعارات تلقائياً في فترات النوم وعدم إزعاجك.
              </p>
            </div>
            <label className="relative inline-flex items-center cursor-pointer shrink-0">
              <input
                type="checkbox"
                checked={settings.quietHoursEnabled}
                onChange={(e) => {
                  const updated = notificationService.saveSettings({ quietHoursEnabled: e.target.checked });
                  setSettings(updated);
                }}
                className="sr-only peer"
              />
              <div className="w-10 h-5 bg-stone-800 peer-focus:outline-hidden rounded-full peer peer-checked:after:translate-x-full rtl:peer-checked:after:-translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:start-[2px] after:bg-white after:border-stone-300 after:border after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-amber-600"></div>
            </label>
          </div>

          {/* Test Notification Feedback */}
          {testResult && (
            <div className={`p-3 rounded-xl border text-xs font-semibold flex items-center gap-2 ${
              testResult.startsWith('✓')
                ? 'bg-emerald-950/60 border-emerald-500/40 text-emerald-300'
                : 'bg-amber-950/60 border-amber-500/40 text-amber-200'
            }`}>
              <CheckCircle2 className="w-4 h-4 shrink-0" />
              <span>{testResult}</span>
            </div>
          )}

          {/* Transparent OS Explanation Box */}
          <div className="p-3.5 rounded-2xl bg-stone-950/80 border border-stone-800/80 text-[11px] text-stone-400 space-y-1.5 leading-relaxed">
            <div className="flex items-center gap-1.5 text-amber-400 font-bold">
              <Info className="w-3.5 h-3.5 shrink-0" />
              <span>ملاحظة حول دعم النظام والإشعارات في الخلفية:</span>
            </div>
            <p>
              تعتمد الإشعارات على دعم متصفحك وخدمة Service Worker في الـ PWA. في نظام Android ومتصفحات سطح المكتب (Chrome / Edge)، تظهر الإشعارات في شريط التنبيهات وشاشة القفل. على هواتف iPhone (iOS)، يُشترط تثبيت التطبيق على الشاشة الرئيسية وتفعيل خيار الإشعارات في إعدادات النظام.
            </p>
          </div>
        </div>

        {/* Footer */}
        <div className="p-4 sm:p-5 border-t border-stone-800 bg-stone-950/70 flex flex-wrap items-center justify-between gap-3">
          <button
            type="button"
            onClick={handleSendTest}
            disabled={isSendingTest}
            className="px-4 py-2 rounded-xl bg-white/10 hover:bg-white/15 border border-white/20 text-stone-200 text-xs font-bold flex items-center gap-2 transition cursor-pointer disabled:opacity-50"
          >
            <Send className="w-3.5 h-3.5 text-amber-400" />
            <span>{isSendingTest ? 'جاري الإرسال...' : 'إرسال إشعار تجريبي الآن'}</span>
          </button>

          <button
            type="button"
            onClick={onClose}
            className="px-5 py-2 rounded-xl bg-amber-600 hover:bg-amber-500 text-white text-xs font-bold transition cursor-pointer"
          >
            حفظ وإغلاق
          </button>
        </div>
      </div>
    </div>
  );
};
