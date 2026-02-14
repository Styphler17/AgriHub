
import React, { useState, useEffect } from 'react';
import { WeatherData, MarketPrice } from '../types';
import { fetchWeather } from '../services/weatherService';
import { Cloud, Sun, CloudRain, Wind, TrendingUp, TrendingDown, ArrowRight, Sprout, WifiOff } from 'lucide-react';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';

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
      {[1,2,3].map(i => <div key={i} className="h-48 rounded-2xl bg-slate-200 dark:bg-slate-800 animate-pulse"></div>)}
    </div>
  );

  return (
    <div className="space-y-8 animate-slide-in">
      {!isOnline && (
        <div className={`flex items-center gap-3 px-4 py-3 rounded-2xl border animate-pulse ${
          darkMode 
            ? 'bg-amber-900/20 border-amber-700/50 text-amber-200' 
            : 'bg-amber-50 border-amber-200 text-amber-800'
        }`}>
          <WifiOff size={20} className="shrink-0" />
          <p className="text-sm font-medium">{t.offlineMessage}</p>
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Weather Card */}
        <div className={`lg:col-span-2 p-6 rounded-3xl ${darkMode ? 'bg-slate-800' : 'bg-white'} shadow-sm border ${darkMode ? 'border-slate-700' : 'border-slate-100'}`}>
          <div className="flex justify-between items-start mb-6">
            <div>
              <h3 className="text-xl font-bold mb-1">{t.weather}</h3>
              <p className="text-slate-500 flex items-center gap-1">
                {weather?.city}, Ghana
              </p>
            </div>
            <div className="text-4xl font-bold text-green-600">{weather?.temp}°C</div>
          </div>

          <div className="grid grid-cols-4 sm:grid-cols-7 gap-4">
            {weather?.forecast.map((f, i) => (
              <div key={i} className="flex flex-col items-center gap-2 p-2 rounded-xl hover:bg-green-50 dark:hover:bg-green-900/20 transition-colors">
                <span className="text-xs font-semibold text-slate-500 uppercase">{f.day}</span>
                {f.condition === 'Sunny' ? <Sun size={20} className="text-amber-500" /> : 
                 f.condition === 'Rain' ? <CloudRain size={20} className="text-blue-500" /> : 
                 <Cloud size={20} className="text-slate-400" />}
                <span className="font-bold">{f.temp}°</span>
              </div>
            ))}
          </div>
        </div>

        {/* Quick Price Summary */}
        <div className={`p-6 rounded-3xl ${darkMode ? 'bg-slate-800' : 'bg-white'} shadow-sm border ${darkMode ? 'border-slate-700' : 'border-slate-100'}`}>
          <div className="flex justify-between items-center mb-6">
            <h3 className="text-lg font-bold">{t.prices}</h3>
            <button 
              onClick={() => onNavigate('prices')}
              className="text-green-600 text-sm font-semibold flex items-center gap-1"
            >
              View All <ArrowRight size={14} />
            </button>
          </div>
          <div className="space-y-4">
            {priceAlerts.map((alert, i) => (
              <div key={i} className="flex items-center justify-between p-3 rounded-2xl bg-slate-50 dark:bg-slate-900/50">
                <div className="flex items-center gap-3">
                  <div className={`p-2 rounded-lg ${alert.trend === 'up' ? 'bg-green-100 text-green-600' : 'bg-red-100 text-red-600'}`}>
                    {alert.trend === 'up' ? <TrendingUp size={16} /> : <TrendingDown size={16} />}
                  </div>
                  <div>
                    <div className="font-bold text-sm">{alert.name}</div>
                    <div className="text-xs text-slate-500">{alert.market}</div>
                  </div>
                </div>
                <div className="text-right">
                  <div className="font-bold text-sm">{alert.price}</div>
                  <div className={`text-[10px] font-bold ${alert.trend === 'up' ? 'text-green-600' : 'text-red-500'}`}>
                    {alert.trend === 'up' ? '+5.2%' : '-1.4%'}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Seasonal Advice Banner */}
      <div className="bg-gradient-to-r from-green-600 to-emerald-700 rounded-3xl p-8 text-white relative overflow-hidden shadow-xl">
        <div className="relative z-10 max-w-2xl">
          <h2 className="text-3xl font-bold mb-4">Planting Season: Cocoa & Maize</h2>
          <p className="text-green-50 mb-6 opacity-90">
            Current soil moisture levels in the Ashanti region are optimal for new seedlings. Use organic mulch to maintain consistency during afternoon heat.
          </p>
          <button 
            onClick={() => onNavigate('advice')}
            className="bg-white text-green-700 px-6 py-3 rounded-full font-bold shadow-lg hover:bg-green-50 transition-colors"
          >
            Read Specialized Guide
          </button>
        </div>
        <div className="absolute right-0 bottom-0 top-0 opacity-10 pointer-events-none">
          <Sprout size={240} className="translate-y-12 translate-x-12" />
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
