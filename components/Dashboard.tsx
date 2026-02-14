import React, { useState, useEffect } from 'react';
import { WeatherData, MarketPrice } from '../types';
import { fetchWeather } from '../services/weatherService';
import { Cloud, Sun, CloudRain, Wind, TrendingUp, TrendingDown, ArrowRight, Sprout, WifiOff, MapPin } from 'lucide-react';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import SupplyChainMap from './SupplyChainMap';

interface Props {
  lang: string;
  t: any;
  darkMode: boolean;
  isOnline: boolean;
  onNavigate: (tab: string) => void;
}

const Dashboard: React.FC<Props> = ({ lang, t, darkMode, isOnline, onNavigate }) => {
  const [weather, setWeather] = useState<WeatherData | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchWeather('Kumasi').then(setWeather).finally(() => setLoading(false));
  }, []);

  const priceAlerts = [
    { name: 'Maize', price: '₵450/bag', trend: 'up', market: 'Makola' },
    { name: 'Cocoa', price: '₵1,200/sack', trend: 'down', market: 'Kejetia' },
    { name: 'Yam', price: '₵25/tuber', trend: 'stable', market: 'Tamale' },
  ];

  if (loading) return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      {[1, 2, 3].map(i => <div key={i} className="h-48 rounded-2xl bg-slate-200 dark:bg-slate-800 animate-pulse"></div>)}
    </div>
  );

  return (
    <div className="space-y-8 animate-slide-in">
      {!isOnline && (
        <div className={`flex items-center gap-3 px-4 py-3 rounded-2xl border animate-pulse ${darkMode
          ? 'bg-amber-900/20 border-amber-700/50 text-amber-200'
          : 'bg-amber-50 border-amber-200 text-amber-800'
          }`}>
          <WifiOff size={20} className="shrink-0" />
          <p className="text-sm font-medium">{t.offlineMessage}</p>
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Weather Card */}
        <div className={`lg:col-span-8 p-10 rounded-[3rem] ${darkMode ? 'bg-slate-800' : 'bg-white'} shadow-sm border ${darkMode ? 'border-slate-700' : 'border-slate-100'} flex flex-col justify-between`}>
          <div className="flex justify-between items-start mb-8">
            <div>
              <h3 className="text-3xl font-black tracking-tighter mb-2">{t.weather}</h3>
              <p className="text-slate-500 font-bold uppercase text-xs tracking-widest flex items-center gap-2">
                <MapPin size={14} className="text-green-600" /> {weather?.city}, Ghana
              </p>
            </div>
            <div className="text-6xl font-black text-green-600 tracking-tighter">{weather?.temp}°</div>
          </div>

          <div className="grid grid-cols-4 sm:grid-cols-7 gap-4">
            {weather?.forecast.map((f, i) => (
              <div key={i} className="flex flex-col items-center gap-3 p-4 rounded-[1.5rem] hover:bg-green-50 dark:hover:bg-green-900/20 transition-all cursor-pointer group">
                <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest group-hover:text-green-600">{f.day}</span>
                <div className="p-3 bg-slate-50 dark:bg-slate-900 rounded-2xl shadow-inner group-hover:scale-110 transition-transform">
                  {f.condition === 'Sunny' ? <Sun size={24} className="text-amber-500" /> :
                    f.condition === 'Rain' ? <CloudRain size={24} className="text-blue-500" /> :
                      <Cloud size={24} className="text-slate-400" />}
                </div>
                <span className="font-black text-lg">{f.temp}°</span>
              </div>
            ))}
          </div>
        </div>

        {/* Quick Price Summary */}
        <div className={`lg:col-span-4 p-8 rounded-[3rem] ${darkMode ? 'bg-slate-800' : 'bg-white'} shadow-sm border ${darkMode ? 'border-slate-700' : 'border-slate-100'}`}>
          <div className="flex justify-between items-center mb-8 px-2">
            <h3 className="text-xl font-black tracking-tighter">{t.prices}</h3>
            <button
              onClick={() => onNavigate('prices')}
              className="w-10 h-10 bg-green-100 text-green-600 rounded-xl flex items-center justify-center hover:scale-110 active:scale-95 transition-all"
            >
              <ArrowRight size={20} />
            </button>
          </div>
          <div className="space-y-4">
            {priceAlerts.map((alert, i) => (
              <div key={i} className="flex items-center justify-between p-5 rounded-[2rem] bg-slate-50 dark:bg-slate-900/50 hover:scale-[1.02] transition-transform cursor-pointer border border-transparent hover:border-green-500/20">
                <div className="flex items-center gap-4">
                  <div className={`w-12 h-12 rounded-2xl flex items-center justify-center shrink-0 ${alert.trend === 'up' ? 'bg-green-100 text-green-600' : 'bg-red-100 text-red-600'}`}>
                    {alert.trend === 'up' ? <TrendingUp size={20} /> : <TrendingDown size={20} />}
                  </div>
                  <div>
                    <div className="font-black text-base">{alert.name}</div>
                    <div className="text-[10px] font-black uppercase text-slate-400 tracking-widest">{alert.market}</div>
                  </div>
                </div>
                <div className="text-right">
                  <div className="font-black text-lg">₵{alert.price.split('/')[0].replace('₵', '')}</div>
                  <div className={`text-[10px] font-black uppercase tracking-tighter ${alert.trend === 'up' ? 'text-green-600' : 'text-red-500'}`}>
                    {alert.trend === 'up' ? '+5.2%' : '-1.4%'}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Map Integration */}
        <div className="lg:col-span-5 h-full">
          <SupplyChainMap darkMode={darkMode} />
        </div>

        {/* Seasonal Advice Banner */}
        <div className="lg:col-span-7 bg-gradient-to-br from-green-600 to-emerald-800 rounded-[3rem] p-10 text-white relative overflow-hidden shadow-2xl flex flex-col justify-center">
          <div className="relative z-10 max-w-lg">
            <div className="flex items-center gap-3 mb-6">
              <div className="w-12 h-12 bg-white/20 backdrop-blur-md rounded-2xl flex items-center justify-center">
                <Sprout size={24} />
              </div>
              <span className="text-xs font-black uppercase tracking-[0.3em] text-green-100">Agricultural Bulletin</span>
            </div>
            <h2 className="text-4xl font-black mb-6 tracking-tighter leading-tight">Planting Season: Cocoa & Maize</h2>
            <p className="text-green-50 mb-8 opacity-90 font-bold leading-relaxed">
              Current soil moisture levels in the Ashanti region are optimal for new seedlings. Use organic mulch to maintain consistency during afternoon heat.
            </p>
            <button
              onClick={() => onNavigate('advice')}
              className="bg-white text-green-700 px-10 py-5 rounded-[1.5rem] font-black text-lg shadow-xl hover:bg-green-50 hover:scale-105 active:scale-95 transition-all"
            >
              Read Specialized Guide
            </button>
          </div>
          <div className="absolute right-0 bottom-0 opacity-10 pointer-events-none">
            <Sprout size={400} className="translate-y-32 translate-x-32" />
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
