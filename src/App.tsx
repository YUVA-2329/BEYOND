import React, { useState, useEffect } from 'react';
import { AuthProvider, useAuth } from './contexts/AuthContext';
import { DesktopLayout } from './components/DesktopLayout';
import { AppleExperienceLayout } from './components/apple/AppleExperienceLayout';
import { AppleIntroExplainer } from './components/AppleIntroExplainer';
import { AuthModal } from './components/auth/AuthModal';
import { PinUnlockModal } from './components/PinUnlockModal';
import { PhoneFrame } from './components/PhoneFrame';
import { AIModal } from './components/AIModal';
import { MountainLogo } from './components/MountainLogo';
import { AdminDashboard } from './components/AdminDashboard';
import { RadarScanModal } from './components/RadarScanModal';

// Mobile Screens
import { Screen02HomeFeed } from './components/screens/Screen02HomeFeed';
import { Screen03MapView } from './components/screens/Screen03MapView';
import { Screen04PlaceDetails } from './components/screens/Screen04PlaceDetails';
import { Screen05CreateDiscovery } from './components/screens/Screen05CreateDiscovery';
import { Screen06SavedPlaces } from './components/screens/Screen06SavedPlaces';
import { Screen07UserProfile } from './components/screens/Screen07UserProfile';
import { Screen08DiscovererLevels } from './components/screens/Screen08DiscovererLevels';
import { Screen09ShareableCard } from './components/screens/Screen09ShareableCard';

import { ScreenId, ViewMode } from './types';
import {
  Smartphone,
  Laptop,
  Maximize2,
  Lock,
  Unlock,
  Play,
  Sparkles,
  ChevronDown,
  LogIn,
  CheckCircle,
  Shield,
  Radio,
} from 'lucide-react';

const SCREEN_METADATA: Record<ScreenId, { number: string; title: string }> = {
  screen_01_splash_onboarding: { number: '01', title: 'Splash / Onboarding' },
  screen_02_home_feed: { number: '02', title: 'Home Feed' },
  screen_03_map_view: { number: '03', title: 'Interactive Map View' },
  screen_04_place_details: { number: '04', title: 'Place Details' },
  screen_05_create_discovery: { number: '05', title: 'Create a Discovery' },
  screen_06_saved_places: { number: '06', title: 'Saved Places' },
  screen_07_user_profile: { number: '07', title: 'User Profile' },
  screen_08_discoverer_levels: { number: '08', title: 'Discoverer Levels' },
  screen_09_shareable_discovery_card: { number: '09', title: 'Shareable Discovery Card' },
  screen_10_secondary_onboarding: { number: '10', title: 'Secondary Onboarding' },
};

const MainApp: React.FC = () => {
  const urlParams = typeof window !== 'undefined' ? new URLSearchParams(window.location.search) : null;
  const initialScreen = (urlParams?.get('screen') as ScreenId) || 'screen_02_home_feed';

  // Responsive device auto-detection: Desktop for laptops/desktops, Mobile for small screens
  const isLargeScreen = typeof window !== 'undefined' ? window.innerWidth >= 1024 : true;
  const initialPlatform = (urlParams?.get('platform') as 'desktop' | 'mobile') || (isLargeScreen ? 'desktop' : 'mobile');

  // Application State
  const [platformMode, setPlatformMode] = useState<'desktop' | 'mobile'>(initialPlatform);
  // Two distinct modes: Mode A ('original') is the default. Mode B ('apple') is opt-in only.
  const [experienceMode, setExperienceMode] = useState<'original' | 'apple'>(
    (urlParams?.get('mode') as 'apple') || 'original'
  );
  const [showAppleIntro, setShowAppleIntro] = useState<boolean>(false);
  const [currentScreen, setCurrentScreen] = useState<ScreenId>(
    SCREEN_METADATA[initialScreen] ? initialScreen : 'screen_02_home_feed'
  );
  const [screenParams, setScreenParams] = useState<any>({
    discoveryId: urlParams?.get('discoveryId') || 'charminar-hyderabad',
  });
  const [viewMode, setViewMode] = useState<ViewMode>('fullscreen');
  const [isAiModalOpen, setIsAiModalOpen] = useState(urlParams?.get('ai') === 'true');
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);
  const [isPinModalOpen, setIsPinModalOpen] = useState(false);
  const [isAdminDashboardOpen, setIsAdminDashboardOpen] = useState(false);
  const [isRadarModalOpen, setIsRadarModalOpen] = useState(false);
  const [isEditorUnlocked, setIsEditorUnlocked] = useState(false);
  const [showUnlockToast, setShowUnlockToast] = useState(false);
  const [activeCity, setActiveCity] = useState<string>(urlParams?.get('city') || 'All');

  const { isAuthenticated } = useAuth();

  // If user is authenticated via Supabase, automatically unlock editor privileges
  useEffect(() => {
    if (isAuthenticated) {
      setIsEditorUnlocked(true);
    }
  }, [isAuthenticated]);

  // Global Keyboard Listener for 'apple', 'radar', 'login', 'admin', and '0000'
  useEffect(() => {
    let keystrokeBuffer = '';
    const handleKeyDown = (e: KeyboardEvent) => {
      const target = e.target as HTMLElement;
      if (target.tagName === 'INPUT' || target.tagName === 'TEXTAREA') return;

      keystrokeBuffer = (keystrokeBuffer + e.key.toLowerCase()).slice(-12);

      // Trigger Apple Experience when user types 'apple'
      if (keystrokeBuffer.endsWith('apple')) {
        handleActivateAppleMode();
      }

      // Trigger Radar Scan Modal when user types 'radar'
      if (keystrokeBuffer.endsWith('radar')) {
        setIsRadarModalOpen(true);
      }

      // Trigger Login Modal when user types 'login'
      if (keystrokeBuffer.endsWith('login')) {
        setIsAuthModalOpen(true);
      }

      // Trigger Admin Command Center when user types 'admin'
      if (keystrokeBuffer.endsWith('admin')) {
        setIsAdminDashboardOpen(true);
      }

      // Trigger instant editor PIN unlock when user types '0000'
      if (keystrokeBuffer.endsWith('0000')) {
        setIsEditorUnlocked(true);
        setShowUnlockToast(true);
        setTimeout(() => setShowUnlockToast(false), 4500);
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  const navigateTo = (screen: ScreenId, params?: any) => {
    setCurrentScreen(screen);
    if (params) setScreenParams((prev: any) => ({ ...prev, ...params }));
  };

  const handleActivateAppleMode = () => {
    setExperienceMode('apple');
    setShowAppleIntro(true);
  };

  const handleExitToBeyond = () => {
    setExperienceMode('original');
    setShowAppleIntro(false);
  };

  const handleEnterFromAppleIntro = (selectedCity?: string) => {
    if (selectedCity) setActiveCity(selectedCity);
    setShowAppleIntro(false);
  };

  const handlePromptUnlock = () => {
    if (!isAuthenticated) {
      setIsAuthModalOpen(true);
    } else {
      setIsPinModalOpen(true);
    }
  };

  const renderMobileScreen = (screenId: ScreenId) => {
    switch (screenId) {
      case 'screen_01_splash_onboarding':
      case 'screen_10_secondary_onboarding':
      case 'screen_02_home_feed':
        return (
          <Screen02HomeFeed
            onNavigate={navigateTo}
            onOpenAI={() => setIsAiModalOpen(true)}
            initialCity={activeCity}
            isEditorUnlocked={isEditorUnlocked || isAuthenticated}
            onPromptUnlock={handlePromptUnlock}
            onActivateAppleMode={handleActivateAppleMode}
            onOpenRadar={() => setIsRadarModalOpen(true)}
          />
        );
      case 'screen_03_map_view':
        return (
          <Screen03MapView
            onNavigate={navigateTo}
            selectedDiscoveryId={screenParams.discoveryId}
            initialCity={activeCity}
            isEditorUnlocked={isEditorUnlocked || isAuthenticated}
            onPromptUnlock={handlePromptUnlock}
            onOpenRadar={() => setIsRadarModalOpen(true)}
          />
        );
      case 'screen_04_place_details':
        return (
          <Screen04PlaceDetails
            discoveryId={screenParams.discoveryId || 'charminar-hyderabad'}
            openComments={screenParams.openComments}
            onNavigate={navigateTo}
            isEditorUnlocked={isEditorUnlocked || isAuthenticated}
            onPromptUnlock={handlePromptUnlock}
          />
        );
      case 'screen_05_create_discovery':
        return (
          <Screen05CreateDiscovery
            onNavigate={navigateTo}
            isEditorUnlocked={isEditorUnlocked || isAuthenticated}
            onPromptUnlock={handlePromptUnlock}
          />
        );
      case 'screen_06_saved_places':
        return <Screen06SavedPlaces onNavigate={navigateTo} />;
      case 'screen_07_user_profile':
        return <Screen07UserProfile onNavigate={navigateTo} onOpenAuth={() => setIsAuthModalOpen(true)} />;
      case 'screen_08_discoverer_levels':
        return <Screen08DiscovererLevels onNavigate={navigateTo} />;
      case 'screen_09_shareable_discovery_card':
        return (
          <Screen09ShareableCard
            discoveryId={screenParams.discoveryId || 'charminar-hyderabad'}
            onNavigate={navigateTo}
          />
        );
      default:
        return (
          <Screen02HomeFeed
            onNavigate={navigateTo}
            onOpenAI={() => setIsAiModalOpen(true)}
            initialCity={activeCity}
            isEditorUnlocked={isEditorUnlocked || isAuthenticated}
            onPromptUnlock={handlePromptUnlock}
            onActivateAppleMode={handleActivateAppleMode}
            onOpenRadar={() => setIsRadarModalOpen(true)}
          />
        );
    }
  };

  // MODE B: SEPARATE APPLE EXPERIENCE (ACTIVATED ONLY WHEN USER EXPLICITLY CLICKS 'APPLE')
  if (experienceMode === 'apple') {
    if (showAppleIntro) {
      return (
        <>
          <AppleIntroExplainer
            onEnterApp={handleEnterFromAppleIntro}
            onExitToBeyond={handleExitToBeyond}
          />
          <AuthModal
            isOpen={isAuthModalOpen}
            onClose={() => setIsAuthModalOpen(false)}
            onSuccess={() => {
              setIsEditorUnlocked(true);
              setShowUnlockToast(true);
            }}
          />
        </>
      );
    }

    return (
      <>
        <AppleExperienceLayout
          onExitToBeyond={handleExitToBeyond}
          onOpenAI={() => setIsAiModalOpen(true)}
          onOpenAuth={() => setIsAuthModalOpen(true)}
          onOpenAdmin={() => setIsAdminDashboardOpen(true)}
          onReplayIntro={() => setShowAppleIntro(true)}
          isEditorUnlocked={isEditorUnlocked}
          onPromptUnlock={handlePromptUnlock}
          initialCity={activeCity}
          onOpenRadar={() => setIsRadarModalOpen(true)}
        />

        {/* Global Shared Modals */}
        <RadarScanModal
          isOpen={isRadarModalOpen}
          onClose={() => setIsRadarModalOpen(false)}
          onNavigate={navigateTo}
        />
        <AdminDashboard
          isOpen={isAdminDashboardOpen}
          onClose={() => setIsAdminDashboardOpen(false)}
        />
        <AuthModal
          isOpen={isAuthModalOpen}
          onClose={() => setIsAuthModalOpen(false)}
          onSuccess={() => {
            setIsEditorUnlocked(true);
            setShowUnlockToast(true);
          }}
        />
        <PinUnlockModal
          isOpen={isPinModalOpen}
          onClose={() => setIsPinModalOpen(false)}
          onUnlockSuccess={() => {
            setIsEditorUnlocked(true);
            setShowUnlockToast(true);
          }}
          isUnlocked={isEditorUnlocked}
        />
        <AIModal
          isOpen={isAiModalOpen}
          onClose={() => setIsAiModalOpen(false)}
          onNavigate={navigateTo}
        />
      </>
    );
  }

  // MODE A: ORIGINAL BEYOND (DEFAULT EXPERIENCE)
  // PLATFORM EXPERIENCE 1: DESKTOP / LAPTOP FULL-WIDTH APPLICATION
  if (platformMode === 'desktop') {
    return (
      <div className="w-full h-screen overflow-hidden bg-[#05070A] font-sans">
        {/* Global Floating Platform Switcher Header */}
        <div className="fixed top-3 right-5 z-50 flex items-center gap-2">
          {/* Explicit Apple Experience Switcher Button */}
          <button
            onClick={handleActivateAppleMode}
            className="px-3.5 py-1.5 rounded-full bg-white/10 hover:bg-white/20 backdrop-blur-xl border border-white/20 text-white text-xs font-bold transition-all cursor-pointer flex items-center gap-1.5 shadow-lg active:scale-95"
            title="Activate the Apple-inspired experience"
          >
            <span className="text-white text-sm"></span>
            <span>APPLE</span>
          </button>

          {/* Radar Scan Pill */}
          <button
            onClick={() => setIsRadarModalOpen(true)}
            className="px-3 py-1.5 rounded-full bg-cyan-500/15 hover:bg-cyan-500/25 backdrop-blur-xl border border-cyan-500/30 text-cyan-300 text-xs font-bold transition-all cursor-pointer flex items-center gap-1.5 shadow-lg active:scale-95"
            title="Radar Scan Nearby Discoveries (or type 'radar')"
          >
            <Radio size={12} className="animate-pulse" />
            <span>Radar</span>
          </button>

          {/* Switch to Mobile Platform Pill */}
          <button
            onClick={() => setPlatformMode('mobile')}
            className="px-3.5 py-1.5 rounded-full bg-[#00E599]/15 hover:bg-[#00E599]/25 backdrop-blur-xl border border-[#00E599]/40 text-[#00E599] text-xs font-bold transition-all cursor-pointer flex items-center gap-1.5 shadow-lg active:scale-95"
          >
            <Smartphone size={13} />
            <span>Mobile App View</span>
          </button>

          {/* Admin Command Center */}
          <button
            onClick={() => setIsAdminDashboardOpen(true)}
            className="px-3 py-1.5 rounded-full bg-red-500/15 hover:bg-red-500/25 backdrop-blur-xl border border-red-500/30 text-red-400 text-xs font-semibold transition-all cursor-pointer flex items-center gap-1.5 shadow-lg active:scale-95"
            title="Admin Command Center (or type 'admin')"
          >
            <Shield size={12} className="text-red-400" />
            <span>Admin</span>
          </button>

          {/* Supabase Auth Pill */}
          <button
            onClick={() => setIsAuthModalOpen(true)}
            className="px-3 py-1.5 rounded-full bg-white/10 hover:bg-white/20 backdrop-blur-xl border border-white/10 text-white text-xs font-semibold transition-all cursor-pointer flex items-center gap-1.5 shadow-lg active:scale-95"
          >
            <LogIn size={12} className="text-[#00E599]" />
            <span>{isAuthenticated ? 'Account' : 'Log In'}</span>
          </button>
        </div>

        {/* Desktop 3-Column Experience */}
        <DesktopLayout
          onNavigate={navigateTo}
          onOpenAI={() => setIsAiModalOpen(true)}
          onOpenAuth={() => setIsAuthModalOpen(true)}
          onSwitchToMobile={() => setPlatformMode('mobile')}
          onOpenAdmin={() => setIsAdminDashboardOpen(true)}
          onActivateAppleMode={handleActivateAppleMode}
          onOpenRadar={() => setIsRadarModalOpen(true)}
          isEditorUnlocked={isEditorUnlocked}
          onPromptUnlock={handlePromptUnlock}
          initialCity={activeCity}
        />

        {/* Global Modals */}
        <RadarScanModal
          isOpen={isRadarModalOpen}
          onClose={() => setIsRadarModalOpen(false)}
          onNavigate={navigateTo}
        />
        <AdminDashboard
          isOpen={isAdminDashboardOpen}
          onClose={() => setIsAdminDashboardOpen(false)}
        />

        <AuthModal
          isOpen={isAuthModalOpen}
          onClose={() => setIsAuthModalOpen(false)}
          onSuccess={() => {
            setIsEditorUnlocked(true);
            setShowUnlockToast(true);
          }}
        />

        <PinUnlockModal
          isOpen={isPinModalOpen}
          onClose={() => setIsPinModalOpen(false)}
          onUnlockSuccess={() => {
            setIsEditorUnlocked(true);
            setShowUnlockToast(true);
          }}
          isUnlocked={isEditorUnlocked}
        />

        <AIModal
          isOpen={isAiModalOpen}
          onClose={() => setIsAiModalOpen(false)}
          onNavigate={navigateTo}
        />
      </div>
    );
  }

  // PLATFORM EXPERIENCE 2: MOBILE NATIVE APP VIEW
  return (
    <div className="min-h-screen bg-[#050911] text-slate-100 flex flex-col font-sans selection:bg-[#00E599] selection:text-[#061A12]">
      {/* Top Mobile Bar */}
      <header className="sticky top-0 z-50 bg-[#080E18]/95 backdrop-blur-xl border-b border-[#142338] px-4 py-2.5">
        <div className="max-w-xl mx-auto flex items-center justify-between gap-3">
          {/* Brand */}
          <div className="flex items-center gap-2 cursor-pointer" onClick={() => navigateTo('screen_02_home_feed')}>
            <MountainLogo size={24} />
            <span className="font-extrabold tracking-wider text-base font-display text-white">BEYOND</span>
          </div>

          {/* Quick Platform Switcher Pill: Switch to Laptop */}
          <div className="flex items-center gap-2">
            <button
              onClick={() => setPlatformMode('desktop')}
              className="flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#00E599]/15 hover:bg-[#00E599]/25 text-[#00E599] border border-[#00E599]/30 text-xs font-bold transition-all cursor-pointer"
            >
              <Laptop size={13} />
              <span>Laptop View</span>
            </button>

            {/* Quick Radar Scan Button */}
            <button
              onClick={() => setIsRadarModalOpen(true)}
              className="flex items-center gap-1 px-2.5 py-1 rounded-full bg-cyan-500/15 hover:bg-cyan-500/25 text-cyan-300 border border-cyan-500/30 text-xs font-bold transition-all cursor-pointer shadow-sm active:scale-95"
              title="Radar Scan Nearby Discoveries (or type 'radar')"
            >
              <Radio size={11} className="animate-pulse" />
              <span>Radar</span>
            </button>

            {/* Explicit Apple Switcher Button */}
            <button
              onClick={handleActivateAppleMode}
              className="flex items-center gap-1 px-3 py-1 rounded-full bg-white/10 hover:bg-white/20 text-white border border-white/20 text-xs font-bold transition-all cursor-pointer shadow-sm active:scale-95"
              title="Activate Apple Experience"
            >
              <span className="text-sm"></span>
              <span>APPLE</span>
            </button>

            {/* Admin Command Center */}
            <button
              onClick={() => setIsAdminDashboardOpen(true)}
              className="flex items-center gap-1 px-2.5 py-1 rounded-full bg-red-500/15 hover:bg-red-500/25 text-red-400 border border-red-500/30 text-xs font-semibold cursor-pointer"
              title="Admin Command Center"
            >
              <Shield size={11} className="text-red-400" />
              <span>Admin</span>
            </button>

            {/* Auth Button */}
            <button
              onClick={() => setIsAuthModalOpen(true)}
              className="flex items-center gap-1 px-2.5 py-1 rounded-full bg-white/5 hover:bg-white/10 text-slate-200 text-xs font-semibold border border-white/10 cursor-pointer"
            >
              <LogIn size={11} className="text-[#00E599]" />
              <span>{isAuthenticated ? 'Account' : 'Log In'}</span>
            </button>
          </div>
        </div>
      </header>

      {/* Main Mobile Screen Viewport */}
      <main className="flex-1 flex flex-col items-center justify-center p-0 sm:p-4">
        {viewMode === 'fullscreen' ? (
          <div className="w-full max-w-md sm:max-w-lg h-[calc(100vh-56px)] bg-[#080E18] sm:rounded-3xl overflow-hidden sm:border border-[#162740] sm:shadow-2xl relative flex flex-col animate-fadeIn">
            {renderMobileScreen(currentScreen)}
          </div>
        ) : (
          <PhoneFrame label={`Screen ${SCREEN_METADATA[currentScreen].number} — ${SCREEN_METADATA[currentScreen].title}`}>
            {renderMobileScreen(currentScreen)}
          </PhoneFrame>
        )}
      </main>

      {/* Unlock Toast */}
      {showUnlockToast && (
        <div className="fixed bottom-6 right-6 z-50 bg-[#0C1A14] border border-[#00E599]/60 text-white px-5 py-3.5 rounded-2xl shadow-2xl flex items-center gap-3 animate-slideUp">
          <div className="w-8 h-8 rounded-xl bg-[#00E599]/20 flex items-center justify-center text-[#00E599]">
            <CheckCircle size={18} />
          </div>
          <div>
            <h4 className="text-xs font-bold text-[#00E599]">Creator & Editor Mode Active!</h4>
            <p className="text-[11px] text-slate-300">You have full permission to post discoveries, comment, and edit places.</p>
          </div>
        </div>
      )}

      {/* Modals */}
      <RadarScanModal
        isOpen={isRadarModalOpen}
        onClose={() => setIsRadarModalOpen(false)}
        onNavigate={navigateTo}
      />
      <AdminDashboard
        isOpen={isAdminDashboardOpen}
        onClose={() => setIsAdminDashboardOpen(false)}
      />

      <AuthModal
        isOpen={isAuthModalOpen}
        onClose={() => setIsAuthModalOpen(false)}
        onSuccess={() => {
          setIsEditorUnlocked(true);
          setShowUnlockToast(true);
        }}
      />

      <PinUnlockModal
        isOpen={isPinModalOpen}
        onClose={() => setIsPinModalOpen(false)}
        onUnlockSuccess={() => {
          setIsEditorUnlocked(true);
          setShowUnlockToast(true);
        }}
        isUnlocked={isEditorUnlocked}
      />

      <AIModal
        isOpen={isAiModalOpen}
        onClose={() => setIsAiModalOpen(false)}
        onNavigate={navigateTo}
      />
    </div>
  );
};

export const App: React.FC = () => {
  return (
    <AuthProvider>
      <MainApp />
    </AuthProvider>
  );
};

export default App;
