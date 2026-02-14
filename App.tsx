import React, { useState, useEffect, useMemo } from 'react';
import { useObservable, useLiveQuery } from 'dexie-react-hooks';
import { translations } from './translations';
import { Language, User } from './types';
import Dashboard from './components/Dashboard';
import CropAdvisor from './components/CropAdvisor';
import MarketPrices, { MOCK_PRICES } from './components/MarketPrices';
import Marketplace from './components/Marketplace';
import SettingsView from './components/Settings';
import Auth from './components/Auth';
import { db } from './db';
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
  Check
} from 'lucide-react';

const App: React.FC = () => {
  const [lang, setLang] = useState<Language>(() => (localStorage.getItem('agrihub_lang') as Language) || 'en');
  const [activeTab, setActiveTab] = useState('dashboard');
  const [darkMode, setDarkMode] = useState(() => localStorage.getItem('agrihub_dark') === 'true');
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [isOnline, setIsOnline] = useState(navigator.onLine);
  const [lowDataMode, setLowDataMode] = useState(() => localStorage.getItem('agrihub_lowdata') === 'true');
  const [notification, setNotification] = useState<{ title: string, message: string } | null>(null);

  // Real Dexie Cloud State
  const currentUser = useObservable(db.cloud.currentUser);
  const syncState = useObservable(db.cloud.syncState);

  // Persistent Profile from 'profiles' table
  const storedProfile = useLiveQuery(
    () => db.profiles.get(currentUser?.userId || 'unknown'),
    [currentUser?.userId]
  );

  // Explicit logout handler
  const handleLogout = async () => {
    try {
      await db.cloud.logout();
      // Direct reload to clear any remaining in-memory states and force Auth re-init
      window.location.href = window.location.origin;
    } catch (err) {
      console.error("Logout failed:", err);
      // Fallback: reload anyway
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
    localStorage.setItem('agrihub_dark', darkMode.toString());
    localStorage.setItem('agrihub_lowdata', lowDataMode.toString());
  }, [lang, darkMode, lowDataMode]);

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

  if (currentUser.isLoggedIn === false) {
    return <Auth lang={lang} t={t} />;
  }

  const navItems = [
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
      {notification && (
        <div className="fixed top-20 left-1/2 -translate-x-1/2 z-[100] w-full max-w-sm px-4 animate-in fade-in slide-in-from-top-4">
          <div className={`flex items-center gap-4 p-5 rounded-[2rem] border shadow-2xl ${darkMode ? 'bg-slate-800 border-slate-700 text-white' : 'bg-white border-slate-100 text-slate-900'}`}>
            <div className="p-3 bg-green-100 text-green-600 rounded-2xl shadow-inner">
              <BellRing size={24} className="animate-bounce" />
            </div>
            <div className="flex-1">
              <h4 className="font-black text-sm">{notification.title}</h4>
              <p className="text-xs opacity-70 leading-tight">{notification.message}</p>
            </div>
            <button onClick={() => setNotification(null)} className="p-1 hover:bg-slate-100 dark:hover:bg-slate-700 rounded-lg">
              <X size={18} />
            </button>
          </div>
        </div>
      )}

      {isSidebarOpen && <div className="fixed inset-0 bg-black/50 z-40 lg:hidden backdrop-blur-sm" onClick={() => setIsSidebarOpen(false)} />}

      <aside className={`fixed inset-y-0 left-0 z-50 w-72 transform transition-transform duration-300 lg:relative lg:translate-x-0 ${isSidebarOpen ? 'translate-x-0' : '-translate-x-full'} ${darkMode ? 'bg-slate-800/90 border-slate-700' : 'bg-white border-slate-200'} border-r backdrop-blur-xl shadow-2xl lg:shadow-none`}>
        <div className="flex flex-col h-full">
          <div className="p-8">
            <h1 className="text-3xl font-black text-green-600 flex items-center gap-3"><Sprout size={32} /> AgriHub</h1>
            <p className="text-[10px] uppercase tracking-widest font-bold opacity-40 mt-1">Farmer Empowerment</p>
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
          <div className="p-6 border-t border-slate-200 dark:border-slate-700">
            {user && (
              <div className="flex items-center gap-4 mb-6 p-4 rounded-3xl bg-slate-50 dark:bg-slate-800/50 border border-slate-100 dark:border-slate-700">
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
            )}
            <button onClick={handleLogout} className="w-full flex items-center gap-3 px-5 py-3 text-red-500 hover:bg-red-50 dark:hover:bg-red-950/30 rounded-2xl transition-all font-bold text-sm">
              <LogOut size={18} /> Logout
            </button>
          </div>
        </div>
      </aside >

      <main className="flex-1 flex flex-col min-w-0 h-screen overflow-hidden">
        <header className={`h-20 flex items-center justify-between px-8 sticky top-0 z-30 border-b backdrop-blur-xl ${darkMode ? 'bg-slate-900/80 border-slate-700' : 'bg-white/80 border-slate-200'}`}>
          <div className="flex items-center gap-4">
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

        <div className="flex-1 overflow-y-auto p-6 lg:p-10 max-w-7xl mx-auto w-full custom-scrollbar">
          {activeTab === 'dashboard' && <Dashboard lang={lang} t={t} darkMode={darkMode} isOnline={isOnline} onNavigate={setActiveTab} />}
          {activeTab === 'advice' && <CropAdvisor lang={lang} t={t} darkMode={darkMode} />}
          {activeTab === 'prices' && <MarketPrices lang={lang} t={t} darkMode={darkMode} isOnline={isOnline} />}
          {activeTab === 'marketplace' && <Marketplace lang={lang} t={t} darkMode={darkMode} user={user} />}
          {activeTab === 'settings' && user && (
            <SettingsView
              user={user}
              setUser={handleUpdateUser}
              lang={lang}
              setLang={setLang}
              darkMode={darkMode}
              setDarkMode={setDarkMode}
              lowDataMode={lowDataMode}
              setLowDataMode={setLowDataMode}
              t={t}
            />
          )}
        </div>

        <button
          onClick={() => alert(`${t.smsInstructions}\n\nServices Available:\n1. Latest Prices\n2. Weather Updates\n3. Market Matchmaking`)}
          className="fixed bottom-10 right-10 w-20 h-20 bg-green-600 text-white rounded-[2.5rem] shadow-[0_20px_50px_rgba(22,163,74,0.4)] flex items-center justify-center hover:scale-110 active:scale-95 transition-all z-50 group"
          aria-label="SMS Assistance"
        >
          <PhoneCall size={32} className="group-hover:rotate-12 transition-transform" />
          <span className="absolute -top-1 -right-1 w-6 h-6 bg-red-500 rounded-full border-4 border-white dark:border-slate-900 animate-ping" />
        </button>
      </main>
    </div >
  );
};

export default App;

