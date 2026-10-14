/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect, Suspense, lazy } from 'react';
import { AudioProvider, useAudio } from './context/AudioContext';
import { ThemeProvider } from './context/ThemeContext';
import { storageService } from './services/storageService';
import { Navbar } from './components/Navbar';
import { MobileBottomNav } from './components/MobileBottomNav';
import { AudioPlayerBar } from './components/AudioPlayerBar';
import { Footer } from './components/Footer';
import { SearchModal } from './components/SearchModal';
import { DedicationModal } from './components/DedicationModal';
import { UserProfileModal } from './components/UserProfileModal';
import { IslamicHeaderBar } from './components/IslamicHeaderBar';
import { OfflineStatusBanner } from './components/OfflineStatusBanner';
import { OfflineQuranModal } from './components/OfflineQuranModal';
import { PrayerTimesModal } from './components/PrayerTimesModal';
import { BackupRestoreModal } from './components/BackupRestoreModal';
import { EgyptianCompanionModal } from './components/EgyptianCompanionModal';
import { FloatingSebhaWidget } from './components/FloatingSebhaWidget';
import { FloatingSebhaInfoModal } from './components/FloatingSebhaInfoModal';
import { NotificationSettingsModal } from './components/NotificationSettingsModal';
import { floatingSebhaService } from './services/floatingSebhaService';
import { notificationService } from './services/notificationService';
import { ErrorBoundary } from './components/ErrorBoundary';
import { Sparkles } from 'lucide-react';

// Home Page loaded eagerly for instant initial rendering
import { HomePage } from './pages/HomePage';

// Secondary pages lazy-loaded to cut initial JS bundle size and maximize loading speed
const QuranPage = lazy(() => import('./pages/QuranPage').then(m => ({ default: m.QuranPage })));
const RecitationsPage = lazy(() => import('./pages/RecitationsPage').then(m => ({ default: m.RecitationsPage })));
const DuasPage = lazy(() => import('./pages/DuasPage').then(m => ({ default: m.DuasPage })));
const PersonalDuaPage = lazy(() => import('./pages/PersonalDuaPage').then(m => ({ default: m.PersonalDuaPage })));
const AdhkarPage = lazy(() => import('./pages/AdhkarPage').then(m => ({ default: m.AdhkarPage })));
const TasbeehPage = lazy(() => import('./pages/TasbeehPage').then(m => ({ default: m.TasbeehPage })));
const PersonsPage = lazy(() => import('./pages/PersonsPage').then(m => ({ default: m.PersonsPage })));
const DedicationsPage = lazy(() => import('./pages/DedicationsPage').then(m => ({ default: m.DedicationsPage })));
const KhatmahPage = lazy(() => import('./pages/KhatmahPage').then(m => ({ default: m.KhatmahPage })));
const PaperMushafPage = lazy(() => import('./pages/PaperMushafPage').then(m => ({ default: m.PaperMushafPage })));
const AsmaAlHusnaPage = lazy(() => import('./pages/AsmaAlHusnaPage').then(m => ({ default: m.AsmaAlHusnaPage })));
const RuqyahPage = lazy(() => import('./pages/RuqyahPage').then(m => ({ default: m.RuqyahPage })));
const HadithPage = lazy(() => import('./pages/HadithPage').then(m => ({ default: m.HadithPage })));
const PrayerTimesPage = lazy(() => import('./pages/PrayerTimesPage').then(m => ({ default: m.PrayerTimesPage })));
const HaramainLivePage = lazy(() => import('./pages/HaramainLivePage').then(m => ({ default: m.HaramainLivePage })));
const OwnerSadaqahPage = lazy(() => import('./pages/OwnerSadaqahPage').then(m => ({ default: m.OwnerSadaqahPage })));

import { SplashScreen } from './components/SplashScreen';
import { userStateService } from './services/userStateService';

function PageLoadingFallback() {
  return (
    <div className="min-h-[50vh] flex flex-col items-center justify-center p-8 text-center animate-in fade-in duration-150">
      <div className="w-12 h-12 rounded-2xl bg-amber-100 dark:bg-amber-950/60 border border-amber-300 dark:border-amber-700/50 flex items-center justify-center text-amber-800 dark:text-amber-300 mb-3 animate-spin">
        <Sparkles className="w-6 h-6" />
      </div>
      <p className="font-amiri text-lg font-bold text-stone-800 dark:text-stone-200">
        جاري فتح الصفحة المباركة...
      </p>
      <span className="text-xs text-stone-400 dark:text-stone-500 mt-1 font-amiri">
        بِسْمِ اللَّهِ الرَّحْمَٰنِ الرَّحِيمِ
      </span>
    </div>
  );
}

function AppContent() {
  const { isPlayerVisible, currentSurah, currentRadio, currentTafsir } = useAudio();
  const isAudioActive = isPlayerVisible && (!!currentSurah || !!currentRadio || !!currentTafsir);

  const [initialState] = useState(() => userStateService.getInitialState());

  const [activeTab, setActiveTab] = useState<string>(initialState.activeTab);
  const [selectedSurahNumber, setSelectedSurahNumber] = useState<number>(initialState.selectedSurahNumber);
  const [selectedMushafPage, setSelectedMushafPage] = useState<number>(initialState.selectedMushafPage);
  const [selectedPersonId, setSelectedPersonId] = useState<string>(initialState.selectedPersonId);
  
  // Modals state
  const [isSearchOpen, setIsSearchOpen] = useState<boolean>(false);
  const [isDedicationOpen, setIsDedicationOpen] = useState<boolean>(false);
  const [isProfileOpen, setIsProfileOpen] = useState<boolean>(false);
  const [isOfflineModalOpen, setIsOfflineModalOpen] = useState<boolean>(false);
  const [isPrayerTimesOpen, setIsPrayerTimesOpen] = useState<boolean>(false);
  const [isBackupOpen, setIsBackupOpen] = useState<boolean>(false);
  const [isEgyptianCompanionOpen, setIsEgyptianCompanionOpen] = useState<boolean>(false);
  const [dedicationPersonId, setDedicationPersonId] = useState<string>('all');
  const [dedicationType, setDedicationType] = useState<'surah' | 'tasbeeh' | 'dua' | 'khatmah'>('dua');
  const [isFloatingSebhaOpen, setIsFloatingSebhaOpen] = useState<boolean>(() => floatingSebhaService.isOpen());
  const [isFloatingInfoOpen, setIsFloatingInfoOpen] = useState<boolean>(false);
  const [isNotificationsModalOpen, setIsNotificationsModalOpen] = useState<boolean>(false);

  // Subscribe to floating sebha service updates
  useEffect(() => {
    return floatingSebhaService.subscribe((open) => {
      setIsFloatingSebhaOpen(open);
    });
  }, []);

  // Initialize background notification scheduler if user enabled it
  useEffect(() => {
    const settings = notificationService.getSettings();
    if (settings.enabled && notificationService.getPermissionStatus() === 'granted') {
      notificationService.startBackgroundScheduler();
    }
    return () => {
      notificationService.stopBackgroundScheduler();
    };
  }, []);

  // Persist state across reloads, tab closes, and page navigation
  useEffect(() => {
    userStateService.saveState({
      activeTab,
      selectedSurahNumber,
      selectedMushafPage,
      selectedPersonId,
    });
  }, [activeTab, selectedSurahNumber, selectedMushafPage, selectedPersonId]);

  // Native mobile back button handling (closing modals first, then restoring previous tab)
  useEffect(() => {
    const isAnyModalOpen =
      isSearchOpen ||
      isDedicationOpen ||
      isProfileOpen ||
      isOfflineModalOpen ||
      isPrayerTimesOpen ||
      isBackupOpen ||
      isEgyptianCompanionOpen ||
      isFloatingInfoOpen ||
      isNotificationsModalOpen;

    const handlePopState = (e: PopStateEvent) => {
      if (isAnyModalOpen) {
        setIsSearchOpen(false);
        setIsDedicationOpen(false);
        setIsProfileOpen(false);
        setIsOfflineModalOpen(false);
        setIsPrayerTimesOpen(false);
        setIsBackupOpen(false);
        setIsEgyptianCompanionOpen(false);
        setIsFloatingInfoOpen(false);
        setIsNotificationsModalOpen(false);
        return;
      }

      if (e.state && e.state.tab) {
        setActiveTab(e.state.tab);
      }
    };

    window.addEventListener('popstate', handlePopState);
    return () => window.removeEventListener('popstate', handlePopState);
  }, [
    isSearchOpen,
    isDedicationOpen,
    isProfileOpen,
    isOfflineModalOpen,
    isPrayerTimesOpen,
    isBackupOpen,
    isEgyptianCompanionOpen,
    isFloatingInfoOpen,
    isNotificationsModalOpen,
  ]);

  const navigateToTab = (tabId: string) => {
    if (tabId === activeTab) return;
    try {
      window.history.pushState({ tab: tabId }, '', window.location.pathname);
    } catch {}
    setActiveTab(tabId);
    userStateService.saveState({ activeTab: tabId });
  };

  // Scroll to top on tab switch
  useEffect(() => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }, [activeTab]);

  // Global Keyboard Shortcuts (Ctrl+K for search, Esc to close modals)
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Ctrl+K or Cmd+K to toggle universal search
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === 'k') {
        e.preventDefault();
        setIsSearchOpen((prev) => !prev);
        return;
      }

      // Escape to close open modal
      if (e.key === 'Escape') {
        setIsSearchOpen(false);
        setIsDedicationOpen(false);
        setIsProfileOpen(false);
        setIsOfflineModalOpen(false);
        setIsPrayerTimesOpen(false);
        setIsBackupOpen(false);
        setIsEgyptianCompanionOpen(false);
        setIsFloatingInfoOpen(false);
        setIsNotificationsModalOpen(false);
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  const handleSelectSurah = (surahNumber: number) => {
    setSelectedSurahNumber(surahNumber);
    setActiveTab('quran');
  };

  const handleOpenMushafPage = (pageNumber: number) => {
    setSelectedMushafPage(pageNumber);
    setActiveTab('mushaf');
  };

  const handleSelectPerson = (personId: string) => {
    setSelectedPersonId(personId);
    setActiveTab('persons');
  };

  const handleOpenDedication = (personId = 'all', type: 'surah' | 'tasbeeh' | 'dua' | 'khatmah' = 'dua') => {
    setDedicationPersonId(personId);
    setDedicationType(type);
    setIsDedicationOpen(true);
  };

  return (
    <div
      data-dmda-engine="v1-enterprise"
      className="min-h-screen flex flex-col bg-[#F8F7F4] dark:bg-[#07130e] text-stone-900 dark:text-stone-100 font-sans selection:bg-amber-100 selection:text-amber-950 transition-colors"
    >
      
      {/* Top Date & Reminders Bar */}
      <IslamicHeaderBar
        onOpenKhatmah={() => setActiveTab('khatmah')}
        onOpenDedication={() => handleOpenDedication('all', 'dua')}
        onOpenProfile={() => setIsProfileOpen(true)}
        onOpenOfflineManager={() => setIsOfflineModalOpen(true)}
        onOpenPrayerTimes={() => setIsPrayerTimesOpen(true)}
        onOpenBackup={() => setIsBackupOpen(true)}
        onOpenEgyptianCompanion={() => setIsEgyptianCompanionOpen(true)}
      />

      {/* Floating Liquid Glass Navigation Bar */}
      <Navbar
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        onOpenSearch={() => setIsSearchOpen(true)}
        onOpenDedication={() => handleOpenDedication('all', 'dua')}
        onOpenProfile={() => setIsProfileOpen(true)}
        onOpenOfflineManager={() => setIsOfflineModalOpen(true)}
        onOpenPrayerTimes={() => setIsPrayerTimesOpen(true)}
        onOpenBackup={() => setIsBackupOpen(true)}
      />

      {/* Main Body Content with Dynamic Padding when Player is Active */}
      <main
        className={`flex-1 w-full pt-2 sm:pt-4 transition-all duration-300 ${
          isAudioActive ? 'pb-48 sm:pb-40 lg:pb-32' : 'pb-24 sm:pb-20 lg:pb-12'
        }`}
      >
        {activeTab === 'home' && (
          <HomePage
            setActiveTab={setActiveTab}
            onOpenDedication={() => handleOpenDedication('all', 'dua')}
            onSelectPerson={handleSelectPerson}
            onSelectSurah={handleSelectSurah}
            onOpenProfile={() => setIsProfileOpen(true)}
            onOpenPrayerTimes={() => setIsPrayerTimesOpen(true)}
            onOpenBackup={() => setIsBackupOpen(true)}
            onOpenSearch={() => setIsSearchOpen(true)}
            onOpenEgyptianCompanion={() => setIsEgyptianCompanionOpen(true)}
          />
        )}

        <Suspense fallback={<PageLoadingFallback />}>
          {activeTab === 'quran' && (
            <QuranPage
              initialSurahNumber={selectedSurahNumber}
              onOpenDedicationForSurah={(surahName) => handleOpenDedication('all', 'surah')}
              onOpenMushafPage={handleOpenMushafPage}
            />
          )}

          {activeTab === 'mushaf' && (
            <PaperMushafPage
              initialPage={selectedMushafPage}
              onOpenDedication={() => handleOpenDedication('all', 'surah')}
            />
          )}

          {activeTab === 'khatmah' && (
            <KhatmahPage
              onOpenSurah={handleSelectSurah}
            />
          )}

          {activeTab === 'recitations' && (
            <RecitationsPage />
          )}

          {activeTab === 'asma' && (
            <AsmaAlHusnaPage />
          )}

          {activeTab === 'duas' && (
            <DuasPage
              onOpenDedication={() => handleOpenDedication('all', 'dua')}
              onOpenProfile={() => setIsProfileOpen(true)}
            />
          )}

          {activeTab === 'personalDua' && (
            <PersonalDuaPage
              onOpenDedicationForDua={(duaTitle) => handleOpenDedication('all', 'dua')}
              onOpenProfile={() => setIsProfileOpen(true)}
            />
          )}

          {activeTab === 'adhkar' && (
            <AdhkarPage
              onOpenDedication={() => handleOpenDedication('all', 'tasbeeh')}
            />
          )}

          {activeTab === 'tasbeeh' && (
            <TasbeehPage />
          )}

          {activeTab === 'persons' && (
            <PersonsPage
              selectedPersonId={selectedPersonId}
              onOpenDedicationForPerson={(personId) => handleOpenDedication(personId, 'dua')}
              onOpenOwnerSadaqah={() => { setActiveTab('owner_sadaqah'); window.scrollTo({ top: 0, behavior: 'smooth' }); }}
            />
          )}

          {activeTab === 'owner_sadaqah' && (
            <OwnerSadaqahPage
              onOpenDedication={(type) => handleOpenDedication('project_owner', type || 'dua')}
              onOpenQuran={() => { setActiveTab('quran'); window.scrollTo({ top: 0, behavior: 'smooth' }); }}
              onOpenPersons={() => { setActiveTab('persons'); window.scrollTo({ top: 0, behavior: 'smooth' }); }}
            />
          )}

          {activeTab === 'dedications' && (
            <DedicationsPage
              onOpenDedicationModal={() => handleOpenDedication('all', 'dua')}
            />
          )}

          {activeTab === 'ruqyah' && (
            <RuqyahPage
              onOpenDedication={() => handleOpenDedication('all', 'dua')}
            />
          )}

          {activeTab === 'hadith' && (
            <HadithPage
              onOpenDedication={() => handleOpenDedication('all', 'dua')}
            />
          )}

          {activeTab === 'prayer' && (
            <PrayerTimesPage />
          )}

          {activeTab === 'haramain' && (
            <HaramainLivePage />
          )}
        </Suspense>
      </main>

      {/* Floating Quranic Liquid Glass Player Island */}
      <AudioPlayerBar />

      {/* Mobile Bottom Thumb Navigation */}
      <MobileBottomNav
        activeTab={activeTab}
        setActiveTab={setActiveTab}
      />

      {/* Global Search Modal */}
      <SearchModal
        isOpen={isSearchOpen}
        onClose={() => setIsSearchOpen(false)}
        onSelectSurah={handleSelectSurah}
        onNavigateTab={(tab) => {
          setActiveTab(tab);
          setIsSearchOpen(false);
        }}
      />

      {/* Dedication Action Modal */}
      <DedicationModal
        isOpen={isDedicationOpen}
        onClose={() => setIsDedicationOpen(false)}
        preselectedPersonId={dedicationPersonId}
        preselectedType={dedicationType}
      />

      {/* Local User Profile & Personalization Modal */}
      <UserProfileModal
        isOpen={isProfileOpen}
        onClose={() => setIsProfileOpen(false)}
      />

      {/* Offline Center & Cache Manager Modal */}
      <OfflineQuranModal
        isOpen={isOfflineModalOpen}
        onClose={() => setIsOfflineModalOpen(false)}
      />

      {/* Prayer Times & Qibla Direction Modal */}
      <PrayerTimesModal
        isOpen={isPrayerTimesOpen}
        onClose={() => setIsPrayerTimesOpen(false)}
      />

      {/* Local Data Backup & Safe Restore Modal */}
      <BackupRestoreModal
        isOpen={isBackupOpen}
        onClose={() => setIsBackupOpen(false)}
      />

      {/* Egyptian Companion & Heartfelt Advice Modal */}
      <EgyptianCompanionModal
        isOpen={isEgyptianCompanionOpen}
        onClose={() => setIsEgyptianCompanionOpen(false)}
        onNavigateTab={(tab, extra) => {
          setActiveTab(tab);
          if (extra?.surahNumber) {
            setSelectedSurahNumber(extra.surahNumber);
          }
        }}
      />

      {/* Floating Offline & Reconnected Toast Banner */}
      <OfflineStatusBanner
        onOpenOfflineManager={() => setIsOfflineModalOpen(true)}
      />

      {/* Floating Sebha Widget across all platform pages */}
      <FloatingSebhaWidget
        isOpen={isFloatingSebhaOpen}
        onClose={() => floatingSebhaService.setOpen(false)}
        onOpenInfoModal={() => setIsFloatingInfoOpen(true)}
      />

      {/* Scheduled Dhikr Notifications Modal */}
      <NotificationSettingsModal
        isOpen={isNotificationsModalOpen}
        onClose={() => setIsNotificationsModalOpen(false)}
      />

      {/* Floating Sebha & Out-of-app Capabilities Info Modal */}
      <FloatingSebhaInfoModal
        isOpen={isFloatingInfoOpen}
        onClose={() => setIsFloatingInfoOpen(false)}
        onOpenNotifications={() => {
          setIsFloatingInfoOpen(false);
          setIsNotificationsModalOpen(true);
        }}
      />

      {/* Site Footer */}
      <Footer
        setActiveTab={setActiveTab}
        onOpenDedication={() => handleOpenDedication('all', 'dua')}
        onOpenPrayerTimes={() => setIsPrayerTimesOpen(true)}
        onOpenBackup={() => setIsBackupOpen(true)}
      />

    </div>
  );
}

export default function App() {
  return (
    <ErrorBoundary>
      <ThemeProvider>
        <AudioProvider>
          <SplashScreen />
          <AppContent />
        </AudioProvider>
      </ThemeProvider>
    </ErrorBoundary>
  );
}
