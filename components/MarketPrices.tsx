
import React, { useState, useMemo, useEffect, useCallback } from 'react';
import { MarketPrice } from '../types';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { 
  MapPin, 
  Search, 
  TrendingUp, 
  TrendingDown, 
  WifiOff, 
  Download, 
  Star, 
  Bell, 
  X,
  Info,
  Sprout,
  Bean,
  CircleDot,
  Shell,
  Banana,
  RefreshCw,
  FileSpreadsheet,
  Cherry,
  Apple
} from 'lucide-react';
import { jsPDF } from 'jspdf';

interface Props {
  lang: string;
  t: any;
  darkMode: boolean;
  isOnline: boolean;
}

interface PriceAlert {
  commodity: string;
  threshold: number;
  type: 'above' | 'below';
}

export const MOCK_PRICES: MarketPrice[] = [
  { id: '1', commodity: 'Maize', price: 450.00, unit: '100kg bag', location: 'Makola, Accra', trend: 'up', updatedAt: '2 hours ago' },
  { id: '2', commodity: 'Cocoa', price: 1250.00, unit: '64kg sack', location: 'Kejetia, Kumasi', trend: 'down', updatedAt: '5 hours ago' },
  { id: '3', commodity: 'Yam (Pona)', price: 35.00, unit: '3 Tubers', location: 'Tamale Central', trend: 'up', updatedAt: '1 hour ago' },
  { id: '4', commodity: 'Cassava', price: 85.00, unit: 'Bag', location: 'Techiman', trend: 'stable', updatedAt: '3 hours ago' },
  { id: '5', commodity: 'Plantain', price: 65.00, unit: 'Bunch', location: 'Koforidua', trend: 'up', updatedAt: '1 day ago' },
  { id: '6', commodity: 'Groundnut', price: 120.00, unit: 'Bag', location: 'Tamale', trend: 'stable', updatedAt: '4 hours ago' },
  { id: '7', commodity: 'Cowpea', price: 95.00, unit: 'Bag', location: 'Techiman', trend: 'up', updatedAt: '6 hours ago' },
  { id: '8', commodity: 'Mango', price: 15.00, unit: 'Crate', location: 'Greater Accra', trend: 'down', updatedAt: '2 days ago' },
  { id: '9', commodity: 'Pineapple', price: 8.00, unit: 'Size 1', location: 'Nsawam', trend: 'up', updatedAt: '1 hour ago' },
];

const HISTORICAL_DATA_VARIANTS: Record<string, any[]> = {
  '1M': [
    { date: 'W1', price: 440 }, { date: 'W2', price: 445 }, { date: 'W3', price: 442 }, { date: 'W4', price: 450 }
  ],
  '3M': [
    { date: 'Apr', price: 410 }, { date: 'May', price: 430 }, { date: 'Jun', price: 450 }
  ],
  '1Y': [
    { date: 'Jul', price: 380 }, { date: 'Aug', price: 390 }, { date: 'Sep', price: 400 },
    { date: 'Oct', price: 410 }, { date: 'Nov', price: 405 }, { date: 'Dec', price: 420 },
    { date: 'Jan', price: 430 }, { date: 'Feb', price: 440 }, { date: 'Mar', price: 435 },
    { date: 'Apr', price: 445 }, { date: 'May', price: 455 }, { date: 'Jun', price: 450 }
  ],
};

const COMMODITY_ICONS: Record<string, any> = {
  'Maize': Sprout,
  'Cocoa': Bean,
  'Yam (Pona)': CircleDot,
  'Cassava': Shell,
  'Plantain': Banana,
  'Groundnut': Bean,
  'Cowpea': Bean,
  'Mango': Cherry,
  'Pineapple': Apple,
  'default': Sprout
};

const Sparkline: React.FC<{ data: any[], trend: string }> = ({ data, trend }) => (
  <div className="w-16 h-8 opacity-70">
    <ResponsiveContainer width="100%" height="100%">
      <LineChart data={data}>
        <Line 
          type="monotone" 
          dataKey="price" 
          stroke={trend === 'up' ? '#22c55e' : trend === 'down' ? '#ef4444' : '#94a3b8'} 
          strokeWidth={2} 
          dot={false} 
        />
      </LineChart>
    </ResponsiveContainer>
  </div>
);

const MarketPrices: React.FC<Props> = ({ lang, t, darkMode, isOnline }) => {
  const [prices, setPrices] = useState<MarketPrice[]>(MOCK_PRICES);
  const [filter, setFilter] = useState('');
  const [trendFilter, setTrendFilter] = useState<'all' | 'up' | 'down' | 'stable'>('all');
  const [sortBy, setSortBy] = useState<'default' | 'price-asc' | 'price-desc'>('default');
  const [selectedCommodityId, setSelectedCommodityId] = useState('1');
  const [timeRange, setTimeRange] = useState('3M');
  const [showOfflineBanner, setShowOfflineBanner] = useState(true);
  const [lastRefreshed, setLastRefreshed] = useState(new Date());
  const [isRefreshing, setIsRefreshing] = useState(false);
  
  const [favorites, setFavorites] = useState<string[]>(() => {
    const saved = localStorage.getItem('agrihub_favs');
    return saved ? JSON.parse(saved) : [];
  });
  const [showAlertModal, setShowAlertModal] = useState(false);
  const [alertValue, setAlertValue] = useState('');

  const refreshData = useCallback(() => {
    if (!isOnline) return;
    
    setIsRefreshing(true);
    setTimeout(() => {
      setPrices(prev => prev.map(p => ({
        ...p,
        price: p.price * (1 + (Math.random() * 0.04 - 0.02)),
        updatedAt: 'Just now'
      })));
      setLastRefreshed(new Date());
      setIsRefreshing(false);
    }, 1500);
  }, [isOnline]);

  useEffect(() => {
    const interval = setInterval(() => {
      if (isOnline) {
        refreshData();
      }
    }, 5 * 60 * 1000); 
    return () => clearInterval(interval);
  }, [isOnline, refreshData]);

  useEffect(() => {
    localStorage.setItem('agrihub_favs', JSON.stringify(favorites));
  }, [favorites]);

  const selectedPrice = useMemo(() => 
    prices.find(p => p.id === selectedCommodityId) || prices[0],
  [selectedCommodityId, prices]);

  const toggleFavorite = (commodity: string) => {
    setFavorites(prev => 
      prev.includes(commodity) ? prev.filter(f => f !== commodity) : [...prev, commodity]
    );
  };

  const exportPDF = () => {
    const doc = new jsPDF();
    doc.setFontSize(22);
    doc.text('Ghana AgriHub - Market Price Report', 14, 20);
    doc.setFontSize(12);
    doc.text(`Generated on: ${new Date().toLocaleDateString()}`, 14, 30);
    
    let y = 45;
    filteredAndSorted.forEach((item, index) => {
      doc.setFontSize(14);
      doc.text(`${index + 1}. ${item.commodity}`, 14, y);
      doc.setFontSize(10);
      doc.text(`Price: GHS ${item.price.toFixed(2)} / ${item.unit}`, 20, y + 7);
      doc.text(`Market: ${item.location}`, 20, y + 14);
      doc.text(`Last Updated: ${item.updatedAt}`, 20, y + 21);
      y += 35;
      if (y > 270) {
        doc.addPage();
        y = 20;
      }
    });
    doc.save(`Market_Prices_${new Date().toISOString().split('T')[0]}.pdf`);
  };

  const exportCSV = () => {
    const headers = ['Commodity', 'Price (GHS)', 'Unit', 'Location', 'Trend', 'Updated At'];
    const rows = filteredAndSorted.map(p => [
      p.commodity,
      p.price.toFixed(2),
      p.unit,
      p.location,
      p.trend,
      p.updatedAt
    ]);
    
    const csvContent = [
      headers.join(','),
      ...rows.map(r => r.join(','))
    ].join('\n');
    
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    const url = URL.createObjectURL(blob);
    link.setAttribute('href', url);
    link.setAttribute('download', `Market_Prices_${new Date().toISOString().split('T')[0]}.csv`);
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const filteredAndSorted = useMemo(() => {
    let result = [...prices].filter(p => {
      const matchesSearch = p.commodity.toLowerCase().includes(filter.toLowerCase());
      const matchesTrend = trendFilter === 'all' || p.trend === trendFilter;
      return matchesSearch && matchesTrend;
    });

    if (sortBy === 'price-asc') result.sort((a, b) => a.price - b.price);
    else if (sortBy === 'price-desc') result.sort((a, b) => b.price - a.price);

    const favs = result.filter(p => favorites.includes(p.commodity));
    const nonFavs = result.filter(p => !favorites.includes(p.commodity));
    return [...favs, ...nonFavs];
  }, [filter, trendFilter, sortBy, favorites, prices]);

  const SelectedIcon = COMMODITY_ICONS[selectedPrice.commodity] || COMMODITY_ICONS['default'];

  return (
    <div className={`space-y-8 animate-slide-in ${darkMode ? 'text-slate-100' : 'text-slate-900'}`}>
      {!isOnline && showOfflineBanner && (
        <div className={`flex items-center justify-between gap-6 px-10 py-8 rounded-[3rem] border-8 shadow-2xl animate-pulse ring-8 ring-amber-500/10 ${
          darkMode 
            ? 'bg-orange-600 border-orange-500 text-white' 
            : 'bg-amber-400 border-amber-500 text-amber-950 shadow-amber-500/40'
        }`}>
          <div className="flex items-center gap-8">
            <div className={`p-6 rounded-[2rem] shadow-2xl ${darkMode ? 'bg-white/20' : 'bg-white/50'}`}>
              <WifiOff size={48} strokeWidth={3} />
            </div>
            <div className="space-y-1">
              <p className="font-black text-4xl uppercase tracking-tighter leading-none">Offline Mode Active</p>
              <p className="text-lg font-bold opacity-90 max-w-lg">Viewing locally cached market data. Your prices will automatically refresh once your connection is restored.</p>
            </div>
          </div>
          <button 
            onClick={() => setShowOfflineBanner(false)} 
            className={`p-4 rounded-full transition-all hover:scale-125 active:scale-90 ${
              darkMode ? 'bg-white/20 hover:bg-white/40' : 'bg-black/10 hover:bg-black/20'
            }`}
            aria-label="Dismiss offline alert"
          >
            <X size={32} strokeWidth={4} />
          </button>
        </div>
      )}

      <div className="flex flex-col xl:flex-row xl:items-end justify-between gap-6">
        <div className="space-y-1">
          <div className="flex items-center gap-3">
            <h2 className="text-3xl font-black tracking-tight">{t.prices}</h2>
            <button 
              onClick={refreshData}
              disabled={!isOnline || isRefreshing}
              className={`p-2 rounded-xl transition-all ${
                isRefreshing ? 'bg-green-100 text-green-600' : 'hover:bg-slate-100 dark:hover:bg-slate-700'
              } ${!isOnline ? 'opacity-30 cursor-not-allowed' : 'cursor-pointer'}`}
            >
              <RefreshCw size={18} className={isRefreshing ? 'animate-spin' : ''} />
            </button>
          </div>
          <p className="text-slate-500 font-medium flex items-center gap-2">
            {isRefreshing ? (
              <span className="flex items-center gap-1 text-green-600"><RefreshCw size={12} className="animate-spin" /> Syncing...</span>
            ) : (
              <>Last Update: {lastRefreshed.toLocaleTimeString()}</>
            )}
          </p>
        </div>
        
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-3 w-full xl:w-auto">
          <div className="relative sm:col-span-2 md:col-span-1 group">
            <label className="sr-only">Search commodity</label>
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-green-600 transition-colors" size={18} />
            <input
              type="text"
              placeholder="Search commodity..."
              className={`w-full pl-12 pr-4 py-3 rounded-2xl border outline-none transition-all ${
                darkMode 
                  ? 'bg-slate-800 border-slate-700 text-slate-100 focus:ring-2 focus:ring-green-600/20 focus:border-green-600' 
                  : 'bg-white border-slate-200 focus:ring-4 focus:ring-green-600/5 focus:border-green-600'
              }`}
              value={filter}
              onChange={(e) => setFilter(e.target.value)}
            />
          </div>

          <select
            value={trendFilter}
            onChange={(e) => setTrendFilter(e.target.value as any)}
            className={`px-4 py-3 rounded-2xl border font-bold text-sm outline-none transition-all ${
              darkMode ? 'bg-slate-800 border-slate-700' : 'bg-white border-slate-200'
            }`}
          >
            <option value="all">All Trends</option>
            <option value="up">Trending Up</option>
            <option value="down">Trending Down</option>
            <option value="stable">Stable</option>
          </select>

          <select
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value as any)}
            className={`px-4 py-3 rounded-2xl border font-bold text-sm outline-none transition-all ${
              darkMode ? 'bg-slate-800 border-slate-700' : 'bg-white border-slate-200'
            }`}
          >
            <option value="default">Default Sort</option>
            <option value="price-asc">Price Low-High</option>
            <option value="price-desc">Price High-Low</option>
          </select>

          <div className="flex gap-2">
            <button onClick={exportPDF} className={`flex-1 p-3 rounded-2xl border transition-all ${darkMode ? 'bg-slate-800 border-slate-700 hover:bg-slate-700' : 'bg-white border-slate-200 hover:bg-slate-50'}`} title="Export PDF">
              <Download size={18} className="mx-auto" />
            </button>
            <button onClick={exportCSV} className={`flex-1 p-3 rounded-2xl border transition-all ${darkMode ? 'bg-slate-800 border-slate-700 hover:bg-slate-700' : 'bg-white border-slate-200 hover:bg-slate-50'}`} title="Export CSV">
              <FileSpreadsheet size={18} className="mx-auto" />
            </button>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 pb-20">
        <div className={`lg:col-span-2 p-8 rounded-[2.5rem] border shadow-sm ${
          darkMode ? 'bg-slate-800 border-slate-700' : 'bg-white border-slate-100'
        }`}>
          <div className="flex flex-col md:flex-row justify-between items-start gap-6 mb-10 pb-10 border-b border-slate-100 dark:border-slate-700">
            <div className="flex gap-6">
              <div className={`w-20 h-20 rounded-3xl flex items-center justify-center transition-transform hover:scale-105 ${
                selectedPrice.trend === 'up' ? 'bg-green-100 text-green-600' : 
                selectedPrice.trend === 'down' ? 'bg-red-100 text-red-600' : 'bg-slate-100 text-slate-600'
              }`}>
                <SelectedIcon size={40} />
              </div>
              <div>
                <h3 className="text-3xl font-black flex items-center gap-2">
                  {selectedPrice.commodity}
                  {favorites.includes(selectedPrice.commodity) && <Star size={20} className="text-amber-500" fill="currentColor" />}
                </h3>
                <p className="text-slate-500 font-medium flex items-center gap-2"><MapPin size={16} /> {selectedPrice.location}</p>
              </div>
            </div>
            <div className="text-right w-full md:w-auto">
              <div className="text-5xl font-black text-green-600">₵{selectedPrice.price.toFixed(2)}</div>
              <p className="text-slate-400 text-xs font-bold uppercase mt-1">Per {selectedPrice.unit}</p>
              <div className="flex justify-end gap-2 mt-4">
                 <button onClick={() => toggleFavorite(selectedPrice.commodity)} className={`p-3 rounded-xl border transition-all ${favorites.includes(selectedPrice.commodity) ? 'text-amber-500 bg-amber-50 border-amber-200' : 'text-slate-400 border-slate-200'}`}>
                   <Star size={18} fill={favorites.includes(selectedPrice.commodity) ? 'currentColor' : 'none'} />
                 </button>
                 <button onClick={() => setShowAlertModal(true)} className="flex items-center gap-2 px-4 py-2 bg-green-600 text-white rounded-xl font-bold text-sm shadow-lg hover:bg-green-700 transition-all">
                   <Bell size={16} /> Alert
                 </button>
              </div>
            </div>
          </div>

          <div className="flex items-center justify-between mb-8">
            <h4 className="font-black text-xs text-slate-400 uppercase tracking-widest">Pricing History</h4>
            <div className="flex bg-slate-100 dark:bg-slate-900 p-1 rounded-xl">
              {['1M', '3M', '1Y'].map(range => (
                <button
                  key={range}
                  onClick={() => setTimeRange(range)}
                  className={`px-3 py-1 rounded-lg text-xs font-black transition-all ${timeRange === range ? 'bg-white dark:bg-slate-700 text-green-600 shadow-sm' : 'text-slate-500'}`}
                >
                  {range}
                </button>
              ))}
            </div>
          </div>

          <div className="h-64 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={HISTORICAL_DATA_VARIANTS[timeRange]}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke={darkMode ? '#334155' : '#f1f5f9'} />
                <XAxis dataKey="date" axisLine={false} tickLine={false} tick={{ fill: '#94a3b8', fontSize: 12, fontWeight: 700 }} />
                <YAxis hide domain={['auto', 'auto']} />
                <Tooltip 
                  contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 4px 12px rgba(0,0,0,0.1)' }}
                  itemStyle={{ fontWeight: 'bold', color: '#16a34a' }}
                />
                <Line type="monotone" dataKey="price" stroke="#16a34a" strokeWidth={4} dot={{ r: 4, fill: '#16a34a' }} activeDot={{ r: 8, strokeWidth: 0 }} />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="flex flex-col gap-4 overflow-y-auto max-h-[800px] pr-2 custom-scrollbar">
          {filteredAndSorted.map(price => {
            const isSelected = selectedCommodityId === price.id;
            const RowIcon = COMMODITY_ICONS[price.commodity] || COMMODITY_ICONS['default'];
            const trendValue = price.trend === 'up' ? '+3.2%' : price.trend === 'down' ? '-2.1%' : '0.0%';
            
            return (
              <div 
                key={price.id} 
                onClick={() => setSelectedCommodityId(price.id)}
                className={`p-5 rounded-[2rem] border cursor-pointer transition-all hover:scale-[1.01] ${
                  isSelected 
                    ? 'border-green-500 ring-2 ring-green-500/20 bg-green-500/5 shadow-inner' 
                    : (darkMode ? 'bg-slate-800 border-slate-700 hover:border-slate-500' : 'bg-white border-slate-200 hover:border-slate-300 shadow-sm')
                }`}
              >
                <div className="flex justify-between items-start mb-3">
                  <div className="flex gap-4">
                    <div className={`w-12 h-12 rounded-2xl flex items-center justify-center shrink-0 ${darkMode ? 'bg-slate-700 text-slate-300' : 'bg-slate-100 text-slate-500'}`}>
                      <RowIcon size={24} />
                    </div>
                    <div>
                      <h4 className="font-black text-lg flex items-center gap-1">
                        {price.commodity}
                        {favorites.includes(price.commodity) && <Star size={14} className="text-amber-500" fill="currentColor" />}
                      </h4>
                      <div className="text-[10px] font-bold text-slate-400 flex items-center gap-1 uppercase tracking-widest">
                        <MapPin size={10} /> {price.location}
                      </div>
                    </div>
                  </div>
                  
                  <div className="flex flex-col items-end shrink-0">
                    <Sparkline data={HISTORICAL_DATA_VARIANTS['1M']} trend={price.trend} />
                    <div className={`flex items-center gap-1 mt-1 px-2 py-0.5 rounded-full text-[10px] font-black ${
                      price.trend === 'up' ? 'bg-green-100 text-green-700' : 
                      price.trend === 'down' ? 'bg-red-100 text-red-700' : 'bg-slate-100 text-slate-700'
                    }`}>
                      {price.trend === 'up' ? <TrendingUp size={10} /> : price.trend === 'down' ? <TrendingDown size={10} /> : <TrendingUp size={10} className="rotate-90" />}
                      {trendValue}
                    </div>
                  </div>
                </div>
                
                <div className="flex justify-between items-end mt-4">
                  <div>
                    <div className="text-2xl font-black text-green-600">₵{price.price.toFixed(0)}</div>
                    <div className="text-[10px] font-black text-slate-400 uppercase tracking-tighter leading-none">Per {price.unit}</div>
                  </div>
                  <button className={`p-2 rounded-full transition-colors ${darkMode ? 'bg-slate-700 hover:bg-slate-600' : 'bg-slate-100 hover:bg-slate-200'}`} aria-label="More information">
                    <Info size={14} />
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {showAlertModal && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-6 bg-black/70 backdrop-blur-md animate-in fade-in duration-300">
          <div className={`w-full max-w-sm p-10 rounded-[3rem] shadow-2xl relative animate-in zoom-in duration-300 ${darkMode ? 'bg-slate-900 border border-slate-800' : 'bg-white'}`}>
            <button onClick={() => setShowAlertModal(false)} className="absolute top-8 right-8 text-slate-400 hover:text-slate-600 transition-colors">
              <X size={28} />
            </button>
            <div className="flex flex-col items-center text-center mb-10">
              <div className="w-20 h-20 bg-green-100 text-green-600 rounded-[2rem] flex items-center justify-center mb-6 shadow-inner">
                <Bell size={40} />
              </div>
              <h3 className="text-3xl font-black">Price Alert</h3>
              <p className="text-slate-500 text-sm mt-2">Set target price for {selectedPrice.commodity} in {selectedPrice.location}.</p>
            </div>
            <div className="space-y-6">
              <div className="space-y-2">
                <label className="text-xs font-black text-slate-400 uppercase tracking-widest ml-1">Target Price (GHS)</label>
                <input
                  type="number"
                  value={alertValue}
                  onChange={(e) => setAlertValue(e.target.value)}
                  className={`w-full px-6 py-5 rounded-[1.5rem] outline-none border-2 text-2xl font-black transition-all ${
                    darkMode ? 'bg-slate-800 border-slate-700 focus:border-green-600' : 'bg-slate-50 border-slate-200 focus:border-green-600'
                  }`}
                  placeholder="e.g. 500"
                  autoFocus
                />
              </div>
              <button 
                onClick={() => {
                  setShowAlertModal(false);
                  setAlertValue('');
                }} 
                className="w-full py-5 bg-green-600 text-white rounded-[1.5rem] font-black text-xl shadow-2xl shadow-green-600/30 hover:bg-green-700 hover:scale-[1.02] active:scale-95 transition-all"
              >
                Set Alert
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default MarketPrices;
