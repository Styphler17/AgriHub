import React, { useState, useEffect, useMemo, Suspense, lazy } from 'react';
import { useObservable, useLiveQuery } from 'dexie-react-hooks';
import { translations } from './translations';
import { Language, User, Toast } from './types';
import ReadingProgressBar from './components/ReadingProgressBar';
import LogoutModal from './components/LogoutModal';
import { db } from './db';
import { MOCK_PRICES } from './components/MarketPrices';

// Lazy load large components for better performance
const Dashboard = lazy(() => import('./components/Dashboard'));
const CropAdvisor = lazy(() => import('./components/CropAdvisor'));
const MarketPrices = lazy(() => import('./components/MarketPrices'));
const Marketplace = lazy(() => import('./components/Marketplace'));
const SettingsView = lazy(() => import('./components/Settings'));
const LandingPage = lazy(() => import('./components/LandingPage'));
const Auth = lazy(() => import('./components/Auth'));
import {
  LayoutDashboard,
  Sprout,
  TrendingUp,
  Store,
  Settings as SettingsIcon,
  LogOut,
  Menu,
  X,
  WifiOff,
  PhoneCall,
  BellRing,
  Cloud,
  CloudOff,
  RefreshCcw,
  Check,
  AlertTriangle,
  Info,
  History,
  ShieldCheck,
  Sun,
  Moon
} from 'lucide-react';

const App: React.FC = () => {
  const [lang, setLang] = useState<Language>(() => (localStorage.getItem('agrihub_lang') as Language) || 'en');
  const [activeTab, setActiveTab] = useState(() => localStorage.getItem('agrihub_active_tab') || 'dashboard');
  const [darkMode, setDarkMode] = useState(() => localStorage.getItem('agrihub_dark') === 'true');
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [isOnline, setIsOnline] = useState(navigator.onLine);
  const [lowDataMode, setLowDataMode] = useState(() => localStorage.getItem('agrihub_lowdata') === 'true');
  const [toasts, setToasts] = useState<Toast[]>([]);
  const [showLogoutConfirm, setShowLogoutConfirm] = useState(false);
  const [showLanding, setShowLanding] = useState(() => {
    // If we have a persisted active tab that isn't dashboard, or if we think we might be logged in,
    // we might want to skip landing. But authentication check happens later.
    // For now, let's just default to true, but we will override it in a useEffect if needed.
    return !localStorage.getItem('agrihub_active_tab');
  });
  const [showAuth, setShowAuth] = useState(false);
  const [authMode, setAuthMode] = useState<'signin' | 'signup'>('signup');
  const scrollContainerRef = React.useRef<HTMLDivElement>(null);

  // Real Dexie Cloud State
  const currentUser = useObservable(db.cloud.currentUser);
  const syncState = useObservable(db.cloud.syncState);

  const showToast = (message: string, type: 'success' | 'error' | 'warning' | 'info' = 'info') => {
    const id = Math.random().toString(36).substr(2, 9);
    const newToast: Toast = { id, message, type };
    setToasts(prev => [...prev, newToast]);
    setTimeout(() => {
      setToasts(prev => prev.filter(t => t.id !== id));
    }, 4000);
  };

  // Persistent Profile from 'profiles' table
  const storedProfile = useLiveQuery(
    () => db.profiles.get(currentUser?.userId || 'unknown'),
    [currentUser?.userId]
  );

  // Explicit logout handler triggers modal
  const handleLogout = () => {
    setShowLogoutConfirm(true);
  };

  const confirmLogout = async () => {
    try {
      // 1. Delete the main database
      await db.delete();

      // 2. Scorched Earth: Delete ALL IndexedDB databases (clears internal token DBs)
      if (window.indexedDB && window.indexedDB.databases) {
        const dbs = await window.indexedDB.databases();
        for (const database of dbs) {
          if (database.name) {
            window.indexedDB.deleteDatabase(database.name);
          }
        }
      }

      // 3. Clear all storage
      localStorage.clear();
      sessionStorage.clear();

      // 4. Clear cookies
      document.cookie.split(";").forEach((c) => {
        document.cookie = c.replace(/^ +/, "").replace(/=.*/, "=;expires=" + new Date().toUTCString() + ";path=/");
      });

      setShowLanding(true);
      window.location.href = window.location.origin;
    } catch (err) {
      console.error("Logout failed:", err);
      // Even if error, force reload
      window.location.reload();
    }
  };

  // Map Dexie Cloud user to our User type, merging with stored profile
  const user: User | null = useMemo(() => {
    if (!currentUser || !currentUser.isLoggedIn) return null;

    // Default values if no stored profile yet
    const baseUser: User = {
      id: currentUser.userId || 'unknown',
      name: (currentUser as any).name || currentUser.email || 'Farmer',
      location: 'Ghana',
      role: 'farmer'
    };

    // Merge with stored profile if it exists
    if (!storedProfile) return baseUser;

    return {
      ...baseUser,
      ...storedProfile
    };
  }, [currentUser, storedProfile]);

  const t = translations[lang];

  useEffect(() => {
    localStorage.setItem('agrihub_lang', lang);
    localStorage.setItem('agrihub_active_tab', activeTab);
    localStorage.setItem('agrihub_dark', darkMode.toString());
    localStorage.setItem('agrihub_lowdata', lowDataMode.toString());

    // Apply dark mode class to html element for Tailwind
    if (darkMode) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }, [lang, activeTab, darkMode, lowDataMode]);

  // Reconcile Auth State with UI
  useEffect(() => {
    // Only redirect if we are DEFINITELY logged in
    if (currentUser?.isLoggedIn) {
      setShowLanding(false);
      setShowAuth(false);
    }
    // If logged out, we don't automatically show landing, because user might be in the middle of signing up (showAuth=true)
  }, [currentUser?.isLoggedIn]);

  useEffect(() => {
    const handleOnline = () => setIsOnline(true);
    const handleOffline = () => setIsOnline(false);
    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    // Initial data seeding
    const initDb = async () => {
      const priceCount = await db.prices.count();
      if (priceCount === 0) {
        await db.prices.bulkPut(MOCK_PRICES);
      }

      // Cleanup hardcoded items if they exist from previous sessions
      const mockIds = ['1', '2', '3'];
      await db.listings.where('id').anyOf(mockIds).delete();
    };
    initDb();

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  // Handle loading state
  if (currentUser === undefined) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50 dark:bg-slate-900">
        <div className="flex flex-col items-center gap-4">
          <RefreshCcw className="w-8 h-8 text-green-600 animate-spin" />
          <p className="text-xs font-black text-slate-400 uppercase tracking-widest">Initializing Hub...</p>
        </div>
      </div>
    );
  }

  // Loading fallback component
  const LoadingFallback = () => (
    <div className="flex items-center justify-center min-h-screen">
      <div className="text-center">
        <RefreshCcw size={48} className="animate-spin text-green-600 mx-auto mb-4" />
        <p className="text-sm font-bold text-slate-600 dark:text-slate-400">Loading...</p>
      </div>
    </div>
  );

  if (showLanding) {
    return (
      <>
        {showLogoutConfirm && <LogoutModal onCancel={() => setShowLogoutConfirm(false)} onConfirm={confirmLogout} />}
        <Suspense fallback={<LoadingFallback />}>
          <LandingPage
            onGetStarted={() => {
              if (user) {
                setShowLanding(false);
                setShowAuth(false);
              } else {
                setAuthMode('signup');
                setShowLanding(false);
                setShowAuth(true);
              }
            }}
            onSignIn={() => { setAuthMode('signin'); setShowLanding(false); setShowAuth(true); }}
            isLoggedIn={!!user}
            onLogout={handleLogout}
          />
        </Suspense>
      </>
    );
  }

  // Show auth form if explicitly requested OR if user is not logged in AND not exploring as guest
  // Guest mode is allowed if activeTab is 'prices' (or potentially 'settings' but usually starts with prices)
  // We assume if activeTab is 'prices' and !loggedIn, user is in Guest Mode.
  const isGuestModeActive = !currentUser.isLoggedIn && (activeTab === 'prices');

  if (showAuth || (currentUser.isLoggedIn === false && !isGuestModeActive)) {
    return (
      <Suspense fallback={<LoadingFallback />}>
        <Auth
          lang={lang}
          t={t}
          initialMode={authMode}
          onBackToHome={() => { setShowLanding(true); setShowAuth(false); }}
        />
      </Suspense>
    );
  }

  // Guest Mode Logic
  const isGuest = !user;

  const navItems = isGuest ? [
    { id: 'prices', label: t.prices, icon: TrendingUp },
    { id: 'settings', label: t.settings, icon: SettingsIcon },
  ] : [
    { id: 'dashboard', label: t.dashboard, icon: LayoutDashboard },
    { id: 'advice', label: t.advice, icon: Sprout },
    { id: 'prices', label: t.prices, icon: TrendingUp },
    { id: 'marketplace', label: t.marketplace, icon: Store },
    { id: 'settings', label: t.settings, icon: SettingsIcon },
  ];

  const handleUpdateUser = async (updatedUser: User) => {
    try {
      // 1. Update the profile
      await db.profiles.put(updatedUser);

      // 2. Sync name/image to all their listings for immediate consistency
      await db.listings
        .where('userId')
        .equals(updatedUser.id)
        .modify({
          userName: updatedUser.name,
          userProfileImage: updatedUser.profileImage
        });

    } catch (err) {
      console.error("Failed to update profile and synchronize listings:", err);
    }
  };


  return (
    <div className={`min-h-screen flex transition-colors duration-500 ${darkMode ? 'bg-slate-900 text-white' : 'bg-slate-50 text-slate-900'}`}>
      <ReadingProgressBar containerRef={scrollContainerRef} />

      {/* Premium Global Toasts */}
      <div className="fixed top-8 right-8 z-[120] flex flex-col gap-4 max-w-sm w-full">
        {toasts.map(toast => (
          <div
            key={toast.id}
            className={`p-6 rounded-[2rem] border-2 shadow-2xl animate-in slide-in-from-right-8 fade-in duration-300 flex items-center gap-4 ${toast.type === 'success' ? (darkMode ? 'bg-green-900/40 border-green-500/30 text-green-300' : 'bg-green-50 border-green-200 text-green-700') :
              toast.type === 'error' ? (darkMode ? 'bg-red-900/40 border-red-500/30 text-red-300' : 'bg-red-50 border-red-200 text-red-700') :
                toast.type === 'warning' ? (darkMode ? 'bg-amber-900/40 border-amber-500/30 text-amber-300' : 'bg-amber-50 border-amber-200 text-amber-700') :
                  (darkMode ? 'bg-slate-800 border-slate-700 text-white' : 'bg-white border-slate-100 text-slate-900')
              }`}
          >
            <div className={`p-2 rounded-xl ${toast.type === 'success' ? 'bg-green-500/20' :
              toast.type === 'error' ? 'bg-red-500/20' :
                toast.type === 'warning' ? 'bg-amber-500/20' : 'bg-slate-500/20'
              }`}>
              {toast.type === 'success' && <Check size={20} />}
              {toast.type === 'error' && <AlertTriangle size={20} />}
              {toast.type === 'warning' && <ShieldCheck size={20} />}
              {toast.type === 'info' && <Info size={20} />}
            </div>
            <p className="font-black text-sm pr-4">{toast.message}</p>
          </div>
        ))}
      </div>

      {isSidebarOpen && <div className="fixed inset-0 bg-black/50 z-40 lg:hidden backdrop-blur-sm" onClick={() => setIsSidebarOpen(false)} />}

      <aside className={`fixed inset-y-0 left-0 z-50 w-80 transform transition-transform duration-300 lg:relative lg:translate-x-0 ${isSidebarOpen ? 'translate-x-0' : '-translate-x-full'} ${darkMode ? 'bg-slate-800/90 border-slate-700' : 'bg-white border-slate-200'} border-r backdrop-blur-xl shadow-2xl lg:shadow-none`}>
        <div className="flex flex-col h-full">
          <div className="p-8">
            <div className="flex items-center gap-3">
              <img src="/logo.png" alt="AgriHub Logo" className="w-auto h-12 object-contain" />
              <div>
                <h1 className="text-2xl font-black text-green-600">AgriHub</h1>
                <p className="text-[8px] uppercase tracking-widest font-bold text-slate-400">Ghana</p>
              </div>
            </div>
          </div>

          <nav className="flex-1 px-6 space-y-2 overflow-y-auto custom-scrollbar">
            {navItems.map(item => (
              <button
                key={item.id}
                onClick={() => { setActiveTab(item.id); setIsSidebarOpen(false); }}
                className={`w-full flex items-center gap-4 px-5 py-4 rounded-2xl transition-all ${activeTab === item.id ? 'bg-green-600 text-white shadow-xl shadow-green-600/20' : darkMode ? 'hover:bg-slate-700/50 text-slate-400' : 'hover:bg-slate-100 text-slate-600'}`}
              >
                <item.icon size={22} strokeWidth={activeTab === item.id ? 2.5 : 2} />
                <span className="font-black tracking-tight">{(t as any)[item.id] || item.label}</span>
              </button>
            ))}
          </nav>

          <div className="p-6 space-y-4 border-t border-slate-200 dark:border-slate-700">
            {/* Sync Status Hub */}
            <div className={`p-5 rounded-[2rem] border flex flex-col gap-3 ${darkMode ? 'bg-slate-900 border-slate-700' : 'bg-slate-50 border-slate-100'}`}>
              <div className="flex items-center justify-between">
                <span className="text-[10px] font-black uppercase tracking-widest text-slate-400">Sync Pipeline</span>
                {syncState?.phase === 'pushing' ? (
                  <RefreshCcw size={12} className="text-green-500 animate-spin" />
                ) : (
                  <Cloud size={12} className={isOnline ? 'text-green-500' : 'text-slate-400'} />
                )}
              </div>

              <div className="flex items-center gap-3">
                <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${syncState?.phase === 'pushing' ? 'bg-green-100 text-green-600' : 'bg-slate-100 dark:bg-slate-800 text-slate-400'}`}>
                  <Cloud size={20} />
                </div>
                <div>
                  <div className="text-xs font-black capitalize leading-none mb-1">{syncState?.phase || 'Dormant'}</div>
                  <div className="text-[10px] font-bold text-slate-400">
                    {isOnline ? (syncState?.phase === 'pushing' ? 'Uploading records...' : 'Cloud in sync') : 'Awaiting network...'}
                  </div>
                </div>
              </div>

              {syncState?.phase === 'pushing' && (
                <div className="w-full h-1 bg-slate-200 dark:bg-slate-800 rounded-full overflow-hidden">
                  <div className="h-full bg-green-500 animate-progress w-1/2"></div>
                </div>
              )}
            </div>

            {user ? (
              <>
                <div className="flex items-center gap-4 p-4 rounded-3xl bg-slate-50 dark:bg-slate-800/50 border border-slate-100 dark:border-slate-700">
                  <div className="w-14 h-14 rounded-2xl overflow-hidden bg-green-100 dark:bg-green-900/30 flex items-center justify-center text-xl font-black text-green-600 shadow-inner shrink-0">
                    {user.profileImage ? (
                      <img src={user.profileImage} alt={user.name} className="w-full h-full object-cover" />
                    ) : (
                      user.name.charAt(0)
                    )}
                  </div>
                  <div className="overflow-hidden">
                    <h3 className="font-black text-slate-800 dark:text-white truncate text-sm">{user.name}</h3>
                    <p className="text-[10px] font-black text-slate-400 dark:text-slate-500 uppercase tracking-widest flex items-center gap-1">
                      Verified {user.role} <Check size={10} className="text-green-600" />
                    </p>
                  </div>
                </div>
                <button onClick={handleLogout} className="w-full flex items-center gap-3 px-5 py-3 text-red-500 hover:bg-red-50 dark:hover:bg-red-950/30 rounded-2xl transition-all font-bold text-sm">
                  <LogOut size={18} /> Logout
                </button>
              </>
            ) : (
              <div className="space-y-4">
                <div className="p-5 rounded-[2rem] bg-green-50 dark:bg-green-900/10 border border-green-100 dark:border-green-900/20">
                  <p className="text-xs font-black text-green-700 dark:text-green-400 mb-3 uppercase tracking-widest leading-relaxed">Viewing as Guest</p>
                  <button
                    onClick={() => { setAuthMode('signin'); setShowAuth(true); }}
                    className="w-full py-4 bg-green-600 hover:bg-green-700 text-white rounded-2xl font-black text-xs shadow-xl shadow-green-600/20 transition-all active:scale-95"
                  >
                    Log In / Sign Up
                  </button>
                </div>
                <button onClick={handleLogout} className="w-full flex items-center gap-3 px-5 py-3 text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-800/50 rounded-2xl transition-all font-bold text-sm">
                  <LogOut size={18} /> Exit Guest Mode
                </button>
              </div>
            )}
          </div>
        </div>
      </aside >

      <main className="flex-1 flex flex-col min-w-0 h-screen overflow-hidden">
        <header className={`h-20 flex items-center justify-between px-8 sticky top-0 z-30 border-b backdrop-blur-xl ${darkMode ? 'bg-slate-900/80 border-slate-700' : 'bg-white/80 border-slate-200'}`}>
          <div className="flex items-center gap-4">
            {/* Back to Home Button for everyone */}
            <button
              onClick={() => { setShowLanding(true); }}
              className={`hidden md:flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-black uppercase tracking-widest border transition-all ${darkMode ? 'border-slate-700 text-slate-400 hover:text-white hover:border-slate-500' : 'border-slate-200 text-slate-500 hover:text-slate-900 hover:border-slate-300'}`}
            >
              <LogOut size={14} className="rotate-180" /> Home
            </button>
            <button className="lg:hidden p-3 bg-slate-100 dark:bg-slate-800 rounded-xl" onClick={() => setIsSidebarOpen(true)} aria-label="Open Menu"><Menu size={24} /></button>
            <div className="hidden sm:block">
              <h2 className="text-xl font-black tracking-tight">{navItems.find(i => i.id === activeTab)?.label}</h2>
              {isOnline && syncState?.status !== 'offline' ? (
                <p className="text-[10px] font-black text-green-600 uppercase tracking-widest leading-none mt-0.5 flex items-center gap-1">
                  <RefreshCcw size={10} className="animate-spin" /> Connected to Cloud
                </p>
              ) : (
                <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest leading-none mt-0.5">Community Resource</p>
              )}
            </div>
          </div>
          <div className="flex items-center gap-4">
            {!isOnline ? (
              <div className="flex items-center gap-2 text-amber-600 bg-amber-50 px-4 py-2 rounded-full text-[10px] font-black border border-amber-200 animate-pulse uppercase tracking-widest shadow-sm">
                <WifiOff size={14} /> Offline Mode
              </div>
            ) : syncState?.status === 'offline' ? (
              <div className="flex items-center gap-2 text-slate-400 bg-slate-50 px-4 py-2 rounded-full text-[10px] font-black border border-slate-200 uppercase tracking-widest shadow-sm">
                <CloudOff size={14} /> Cloud Dormant
              </div>
            ) : null}
            <button
              onClick={() => setDarkMode(!darkMode)}
              className={`w-12 h-12 rounded-2xl flex items-center justify-center font-bold border-2 transition-all ${darkMode ? 'bg-slate-800 border-slate-700 hover:border-slate-600' : 'bg-slate-50 border-slate-200 hover:border-slate-300'}`}
            >
              {darkMode ? <Moon size={20} className="text-slate-400" /> : <Sun size={20} className="text-amber-500" />}
            </button>
            {lowDataMode && (
              <div className="flex items-center gap-2 text-blue-600 bg-blue-50 px-4 py-2 rounded-full text-[10px] font-black border border-blue-200 uppercase tracking-widest shadow-sm">
                Low Data
              </div>
            )}
            <button className={`w-12 h-12 rounded-2xl flex items-center justify-center font-bold border-2 transition-all ${darkMode ? 'bg-slate-800 border-slate-700 hover:border-slate-600' : 'bg-slate-50 border-slate-200 hover:border-slate-300'}`}>
              <BellRing size={20} className="text-slate-400" />
            </button>
          </div>
        </header>

        <div
          ref={scrollContainerRef}
          className="flex-1 overflow-y-auto p-6 lg:p-10 max-w-7xl mx-auto w-full custom-scrollbar"
        >
          <Suspense fallback={<LoadingFallback />}>
            {activeTab === 'dashboard' && <Dashboard lang={lang} t={t} darkMode={darkMode} isOnline={isOnline} onNavigate={setActiveTab} />}
            {activeTab === 'advice' && <CropAdvisor lang={lang} t={t} darkMode={darkMode} />}
            {activeTab === 'prices' && <MarketPrices lang={lang} t={t} darkMode={darkMode} isOnline={isOnline} user={user} showToast={showToast} />}
            {activeTab === 'marketplace' && <Marketplace lang={lang} t={t} darkMode={darkMode} user={user} />}
            {activeTab === 'settings' && user && (
              <SettingsView
                user={user}
                setUser={handleUpdateUser}
                lang={lang}
                setLang={setLang}
                darkMode={darkMode}
                lowDataMode={lowDataMode}
                setLowDataMode={setLowDataMode}
                t={t}
                showToast={showToast}
              />
            )}
          </Suspense>
        </div>

        <button
          onClick={() => alert(`${t.smsInstructions}\n\nServices Available:\n1. Latest Prices\n2. Weather Updates\n3. Market Matchmaking`)}
          className="fixed bottom-10 right-10 w-20 h-20 bg-green-600 text-white rounded-[2.5rem] shadow-[0_20px_50px_rgba(22,163,74,0.4)] flex items-center justify-center hover:scale-110 active:scale-95 transition-all z-50 group"
          aria-label="SMS Assistance"
        >
          <PhoneCall size={32} className="group-hover:rotate-12 transition-transform" />
          <span className="absolute -top-1 -right-1 w-6 h-6 bg-red-500 rounded-full border-4 border-white dark:border-slate-900 animate-ping" />
        </button>
        {showLogoutConfirm && <LogoutModal onCancel={() => setShowLogoutConfirm(false)} onConfirm={confirmLogout} />}
      </main>
    </div >
  );
};

export default App;

