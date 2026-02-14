import React, { useState, useRef } from 'react';
import { User, Language } from '../types';
import { db } from '../db';
import {
  User as UserIcon,
  Globe,
  Moon,
  Database,
  Save,
  MapPin,
  Briefcase,
  Check,
  Smartphone,
  DownloadCloud,
  ShieldCheck,
  Camera,
  Upload
} from 'lucide-react';

interface Props {
  user: User;
  setUser: (user: User) => void;
  lang: Language;
  setLang: (lang: Language) => void;
  darkMode: boolean;
  setDarkMode: (dark: boolean) => void;
  lowDataMode: boolean;
  setLowDataMode: (low: boolean) => void;
  t: any;
}

const SettingsView: React.FC<Props> = ({
  user,
  setUser,
  lang,
  setLang,
  darkMode,
  setDarkMode,
  lowDataMode,
  setLowDataMode,
  t
}) => {
  const [name, setName] = useState(user.name);
  const [location, setLocation] = useState(user.location);
  const [phone, setPhone] = useState(user.phoneNumber || '');
  const [role, setRole] = useState(user.role);
  const [profileImage, setProfileImage] = useState(user.profileImage || '');
  const [isSaved, setIsSaved] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleSaveProfile = (e: React.FormEvent) => {
    e.preventDefault();
    setUser({ ...user, name, location, role, profileImage, phoneNumber: phone });
    setIsSaved(true);
    setTimeout(() => setIsSaved(false), 2000);
  };

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setProfileImage(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const exportAllData = async () => {
    const prices = await db.prices.toArray();
    const listings = await db.listings.toArray();
    const data = {
      user,
      appPreferences: { lang, darkMode, lowDataMode },
      cachedMarketPrices: prices,
      myListings: listings,
      exportDate: new Date().toISOString()
    };

    const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `agrihub_backup_${new Date().toISOString().split('T')[0]}.json`;
    link.click();
  };

  return (
    <div className="max-w-6xl mx-auto animate-slide-in pb-24">
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 items-start">
        {/* Profile Settings */}
        <section className={`p-8 rounded-[2.5rem] ${darkMode ? 'bg-slate-800 border-slate-700' : 'bg-white border-slate-100'} border shadow-sm h-full`}>
          <div className="flex items-center gap-3 mb-8">
            <div className="p-3 rounded-2xl bg-green-100 text-green-600">
              <UserIcon size={24} />
            </div>
            <div>
              <h2 className="text-2xl font-bold">{t.profileInfo}</h2>
              <p className="text-slate-500 text-sm">Update your account details and photo</p>
            </div>
          </div>

          <form onSubmit={handleSaveProfile} className="space-y-8">
            {/* Profile Image Upload */}
            <div className="flex flex-col items-center gap-4 p-6 rounded-3xl bg-slate-50 dark:bg-slate-900/50 border-2 border-dashed border-slate-200 dark:border-slate-700">
              <div className="relative group">
                <div className="w-32 h-32 rounded-[2.5rem] bg-slate-200 dark:bg-slate-700 overflow-hidden border-4 border-white dark:border-slate-800 shadow-xl">
                  {profileImage ? (
                    <img src={profileImage} alt="Profile" className="w-full h-full object-cover" />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center text-slate-400">
                      <UserIcon size={48} />
                    </div>
                  )}
                </div>
                <button
                  type="button"
                  onClick={() => fileInputRef.current?.click()}
                  className="absolute bottom-0 right-0 p-3 bg-green-600 text-white rounded-2xl shadow-lg hover:scale-110 active:scale-95 transition-all"
                >
                  <Camera size={20} />
                </button>
                <input
                  type="file"
                  ref={fileInputRef}
                  onChange={handleImageUpload}
                  accept="image/*"
                  className="hidden"
                />
              </div>
              <div className="text-center text-xs font-black text-slate-400 uppercase tracking-widest leading-relaxed">
                {profileImage ? 'Photo uploaded' : t.profileImage}
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
              <div className="space-y-2">
                <label className="text-xs font-bold text-slate-400 uppercase tracking-widest ml-1">{t.fullName}</label>
                <div className="relative">
                  <UserIcon className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
                  <input
                    type="text"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    className={`w-full pl-12 pr-4 py-4 rounded-2xl border-2 outline-none transition-all ${darkMode ? 'bg-slate-900 border-slate-700 focus:border-green-600' : 'bg-slate-50 border-slate-200 focus:border-green-600'
                      }`}
                    placeholder="Your Name"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <label className="text-xs font-bold text-slate-400 uppercase tracking-widest ml-1">{t.location}</label>
                <div className="relative">
                  <MapPin className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
                  <input
                    type="text"
                    value={location}
                    onChange={(e) => setLocation(e.target.value)}
                    className={`w-full pl-12 pr-4 py-4 rounded-2xl border-2 outline-none transition-all ${darkMode ? 'bg-slate-900 border-slate-700 focus:border-green-600' : 'bg-slate-50 border-slate-200 focus:border-green-600'
                      }`}
                    placeholder="Location"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <label className="text-xs font-bold text-slate-400 uppercase tracking-widest ml-1">Phone Number</label>
                <div className="relative">
                  <Smartphone className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
                  <input
                    type="tel"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    className={`w-full pl-12 pr-4 py-4 rounded-2xl border-2 outline-none transition-all ${darkMode ? 'bg-slate-900 border-slate-700 focus:border-green-600' : 'bg-slate-50 border-slate-200 focus:border-green-600'
                      }`}
                    placeholder="024 XXX XXXX"
                  />
                </div>
              </div>

              <div className="space-y-2 sm:col-span-2">
                <label className="text-xs font-bold text-slate-400 uppercase tracking-widest ml-1">{t.role}</label>
                <div className="relative">
                  <Briefcase className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
                  <select
                    value={role}
                    onChange={(e) => setRole(e.target.value as any)}
                    className={`w-full pl-12 pr-4 py-4 rounded-2xl border-2 outline-none transition-all appearance-none ${darkMode ? 'bg-slate-900 border-slate-700 focus:border-green-600' : 'bg-slate-50 border-slate-200 focus:border-green-600'
                      }`}
                  >
                    <option value="farmer">{t.farmer}</option>
                    <option value="buyer">{t.buyer}</option>
                    <option value="extension-officer">{t.extensionOfficer}</option>
                  </select>
                </div>
              </div>
            </div>

            <button
              type="submit"
              className="w-full flex items-center justify-center gap-2 bg-green-600 hover:bg-green-700 text-white font-black px-8 py-4 rounded-2xl shadow-xl shadow-green-600/20 transition-all active:scale-95"
            >
              {isSaved ? <Check size={20} strokeWidth={3} /> : <Save size={20} strokeWidth={3} />}
              {isSaved ? t.infoSaved : t.saveChanges}
            </button>
          </form>
        </section>

        <div className="space-y-8">
          {/* Preferences Settings */}
          <section className={`p-8 rounded-[2.5rem] ${darkMode ? 'bg-slate-800 border-slate-700' : 'bg-white border-slate-100'} border shadow-sm`}>
            <div className="flex items-center gap-3 mb-8">
              <div className="p-3 rounded-2xl bg-blue-100 text-blue-600">
                <Globe size={24} />
              </div>
              <div>
                <h2 className="text-2xl font-bold">{t.appPreferences}</h2>
                <p className="text-slate-500 text-sm">Customize language and data usage</p>
              </div>
            </div>

            <div className="space-y-4">
              <div className="flex items-center justify-between p-5 rounded-3xl bg-slate-50 dark:bg-slate-900/50">
                <div className="flex items-center gap-4">
                  <Globe size={20} className="text-slate-400" />
                  <div>
                    <div className="font-bold">{t.language}</div>
                    <div className="text-[10px] text-slate-500 font-black uppercase">English / Twi</div>
                  </div>
                </div>
                <div className="flex bg-slate-200 dark:bg-slate-700 p-1 rounded-2xl">
                  <button
                    onClick={() => setLang('en')}
                    className={`px-6 py-2 rounded-xl text-xs font-black transition-all ${lang === 'en' ? 'bg-white dark:bg-slate-600 text-green-600 shadow-xl' : 'text-slate-500'
                      }`}
                  >
                    EN
                  </button>
                  <button
                    onClick={() => setLang('tw')}
                    className={`px-6 py-2 rounded-xl text-xs font-black transition-all ${lang === 'tw' ? 'bg-white dark:bg-slate-600 text-green-600 shadow-xl' : 'text-slate-500'
                      }`}
                  >
                    TW
                  </button>
                </div>
              </div>

              <div className="flex items-center justify-between p-5 rounded-3xl bg-slate-50 dark:bg-slate-900/50">
                <div className="flex items-center gap-4">
                  <Moon size={20} className="text-slate-400" />
                  <div>
                    <div className="font-bold">Dark Mode</div>
                    <div className="text-[10px] text-slate-500 font-black uppercase">Save battery at night</div>
                  </div>
                </div>
                <button
                  onClick={() => setDarkMode(!darkMode)}
                  className={`w-14 h-8 rounded-full transition-all relative ${darkMode ? 'bg-green-600' : 'bg-slate-300'
                    }`}
                >
                  <div className={`w-6 h-6 bg-white rounded-full absolute top-1 shadow-md transition-all ${darkMode ? 'right-1' : 'left-1'
                    }`} />
                </button>
              </div>

              <div className="flex items-center justify-between p-5 rounded-3xl bg-slate-50 dark:bg-slate-900/50">
                <div className="flex items-center gap-4">
                  <Database size={20} className="text-slate-400" />
                  <div>
                    <div className="font-bold">{t.lowData}</div>
                    <div className="text-[10px] text-slate-500 font-black uppercase">Fewer images, less data</div>
                  </div>
                </div>
                <button
                  onClick={() => setLowDataMode(!lowDataMode)}
                  className={`w-14 h-8 rounded-full transition-all relative ${lowDataMode ? 'bg-green-600' : 'bg-slate-300'
                    }`}
                >
                  <div className={`w-6 h-6 bg-white rounded-full absolute top-1 shadow-md transition-all ${lowDataMode ? 'right-1' : 'left-1'
                    }`} />
                </button>
              </div>
            </div>
          </section>

          {/* Data Security Section */}
          <section className={`p-8 rounded-[2.5rem] ${darkMode ? 'bg-slate-800 border-slate-700' : 'bg-white border-slate-100'} border shadow-sm`}>
            <div className="flex items-center gap-3 mb-8">
              <div className="p-3 rounded-2xl bg-amber-100 text-amber-600">
                <ShieldCheck size={24} />
              </div>
              <div>
                <h2 className="text-2xl font-bold">{t.dataSecurity}</h2>
                <p className="text-slate-500 text-sm">Manage your personal information</p>
              </div>
            </div>

            <div className="space-y-4">
              <button
                onClick={exportAllData}
                className={`w-full flex items-center justify-between p-5 rounded-3xl transition-all border-2 ${darkMode ? 'bg-slate-900 border-slate-700 hover:border-slate-500' : 'bg-slate-50 border-slate-200 hover:border-slate-300'}`}
              >
                <div className="flex items-center gap-4">
                  <DownloadCloud size={20} className="text-green-600" />
                  <div className="text-left">
                    <div className="font-bold">{t.exportData}</div>
                    <div className="text-[10px] text-slate-500 font-black uppercase">{t.downloadBackup} (JSON)</div>
                  </div>
                </div>
                <Check size={18} className="text-slate-300" />
              </button>

              <div className="p-5 rounded-3xl bg-amber-50 dark:bg-amber-900/10 border border-amber-100 dark:border-amber-800 flex items-start gap-4">
                <Smartphone size={20} className="text-amber-600 shrink-0 mt-1" />
                <div>
                  <div className="font-bold text-amber-900 dark:text-amber-200 text-sm">{t.smsOffline}</div>
                  <p className="text-xs text-amber-700 dark:text-amber-400 leading-relaxed font-medium">
                    Dial <span className="font-black bg-amber-200 dark:bg-amber-800 px-1 rounded">*789#</span> to access core features without internet. This uses our USSD gateway.
                  </p>
                </div>
              </div>
            </div>
          </section>
        </div>
      </div>

      {/* App Version Info */}
      <div className="text-center py-10">
        <p className="text-xs text-slate-400 font-black uppercase tracking-widest">Ghana AgriHub v1.2.0 - Stable</p>
        <p className="text-[10px] text-slate-400 mt-2 font-bold italic">Empowering the backbone of Ghana's economy.</p>
      </div>
    </div>
  );
};

export default SettingsView;

