import React, { useState, useMemo, useEffect } from 'react';
import { useLiveQuery } from 'dexie-react-hooks';
import { db } from '../db';
import { User, MarketPrice } from '../types';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, AreaChart, Area } from 'recharts';

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
  Apple,
  Pencil,
  Plus,
  ArrowUpRight,
  ArrowDownRight,
  History
} from 'lucide-react';
import { jsPDF } from 'jspdf';

interface Props {
  lang: string;
  t: any;
  darkMode: boolean;
  isOnline: boolean;
  user: User | null;
  showToast: (message: string, type?: 'success' | 'error' | 'warning' | 'info') => void;
}

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

const MarketPrices: React.FC<Props> = ({ lang, t, darkMode, isOnline, user, showToast }) => {
  const prices = useLiveQuery(() => db.prices.toArray()) || [];
  const priceHistory = useLiveQuery(() => db.priceAudit.orderBy('timestamp').reverse().limit(10).toArray()) || [];
  const [filter, setFilter] = useState('');
  const [trendFilter, setTrendFilter] = useState<'all' | 'up' | 'down' | 'stable'>('all');
  const [selectedCommodityId, setSelectedCommodityId] = useState<string | null>(null);
  const [timeRange, setTimeRange] = useState('3m');
  const [isEditingPrice, setIsEditingPrice] = useState(false);
  const [editingPriceItem, setEditingPriceItem] = useState<any>(null);
  const [isRefreshing, setIsRefreshing] = useState(false);

  const [favorites, setFavorites] = useState<string[]>(() => {
    const saved = localStorage.getItem('agrihub_favs');
    return saved ? JSON.parse(saved) : [];
  });

  const canEdit = user?.role === 'extension-officer';

  const selectedPrice = useMemo(() => {
    if (!selectedCommodityId) return prices[0] || null;
    return prices.find(p => p.id === selectedCommodityId) || prices[0] || null;
  }, [selectedCommodityId, prices]);

  const toggleFavorite = (commodity: string) => {
    setFavorites(prev => {
      const next = prev.includes(commodity) ? prev.filter(f => f !== commodity) : [...prev, commodity];
      localStorage.setItem('agrihub_favs', JSON.stringify(next));
      return next;
    });
  };

  const dynamicChartData = useMemo(() => {
    const rangeKey = timeRange.toUpperCase() === '1W' ? '1M' : timeRange.toUpperCase();
    const baseData = HISTORICAL_DATA_VARIANTS[rangeKey] || HISTORICAL_DATA_VARIANTS['1Y'];

    if (!selectedPrice) return baseData;

    // We filter history for the selected price for the "Historical" part
    const commodityHistory = (priceHistory || []).filter(h => h.priceId === selectedPrice.id).reverse();

    // Combine base "trend" data with live audit history and current price
    const historicalPoints = baseData.slice(0, -2); // Take trend background
    const livePoints = commodityHistory.map(h => ({
      date: new Date(h.timestamp).toLocaleDateString([], { month: 'short', day: 'numeric' }),
      price: h.newPrice,
      isLive: true
    }));

    const finalPoint = {
      date: 'Latest',
      price: selectedPrice.price,
      isLive: true
    };

    return [...historicalPoints, ...livePoints, finalPoint];
  }, [selectedPrice, timeRange, priceHistory]);

  const handleUpdatePrice = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingPriceItem) return;

    try {
      const oldPrice = prices.find(p => p.id === editingPriceItem.id)?.price || editingPriceItem.price;
      const newPrice = Number(editingPriceItem.price);

      // Guardian Validation: 50% volatility check
      const deviation = Math.abs(newPrice - oldPrice) / oldPrice;
      if (deviation > 0.5) {
        const confirmMsg = `WARNING: Price change is ${Math.round(deviation * 100)}%. This will cause high market volatility. Proceed?`;
        if (!window.confirm(confirmMsg)) {
          showToast('Price update cancelled for safety.', 'warning');
          return;
        }
      }

      const trend = newPrice > oldPrice ? 'up' : newPrice < oldPrice ? 'down' : 'stable';

      // 1. Log Audit Record
      await db.priceAudit.add({
        id: Math.random().toString(36).substr(2, 9),
        priceId: editingPriceItem.id,
        commodity: editingPriceItem.commodity,
        oldPrice: oldPrice,
        newPrice: newPrice,
        changedBy: user?.name || 'Unknown Officer',
        timestamp: new Date().toISOString()
      });

      // 2. Update Source
      await db.prices.update(editingPriceItem.id, {
        price: newPrice,
        trend: trend,
        updatedAt: new Date().toLocaleTimeString()
      });

      showToast(`${editingPriceItem.commodity} price updated successfully.`, 'success');
      setIsEditingPrice(false);
      setEditingPriceItem(null);
    } catch (err) {
      console.error('Failed to update price:', err);
      showToast('Critical error during price sync.', 'error');
    }
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
      const matchesSearch = p.commodity.toLowerCase().includes(filter.toLowerCase()) ||
        p.location.toLowerCase().includes(filter.toLowerCase());
      const matchesTrend = trendFilter === 'all' || p.trend === trendFilter;
      return matchesSearch && matchesTrend;
    });

    const favs = result.filter(p => favorites.includes(p.commodity));
    const nonFavs = result.filter(p => !favorites.includes(p.commodity));
    return [...favs, ...nonFavs];
  }, [filter, trendFilter, favorites, prices]);

  if (prices.length === 0) {
    return (
      <div className="min-h-[400px] flex items-center justify-center">
        <div className="animate-spin text-green-600"><RefreshCw size={40} /></div>
      </div>
    );
  }

  const SelectedIcon = selectedPrice ? (COMMODITY_ICONS[selectedPrice.commodity] || COMMODITY_ICONS['default']) : Sprout;

  return (
    <div className="space-y-8 animate-slide-in">
      {/* Header Section */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6">
        <div>
          <h2 className="text-4xl font-black text-slate-900 dark:text-white tracking-tight flex items-center gap-3">
            {t.prices}
            <div className="px-3 py-1 bg-green-100 dark:bg-green-900/30 text-green-600 rounded-full text-xs font-black uppercase tracking-widest">Live</div>
          </h2>
          <p className="text-slate-500 dark:text-slate-400 font-medium mt-1">Real-time market analytics across all Ghanaian regions.</p>
        </div>

        <div className="flex flex-col sm:flex-row gap-4">
          <div className="relative group min-w-[300px]">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-green-600 transition-colors" size={20} />
            <input
              type="text"
              placeholder="Search commodity or market..."
              className={`w-full pl-12 pr-4 py-4 rounded-2xl border-2 outline-none transition-all ${darkMode ? 'bg-slate-800 border-slate-700 text-white focus:border-green-600' : 'bg-white border-slate-100 focus:border-green-600'
                }`}
              value={filter}
              onChange={(e) => setFilter(e.target.value)}
            />
          </div>
          <select
            value={trendFilter}
            onChange={(e) => setTrendFilter(e.target.value as any)}
            className={`px-6 py-4 rounded-2xl border-2 font-black text-sm outline-none transition-all ${darkMode ? 'bg-slate-800 border-slate-700' : 'bg-white border-slate-100'
              }`}
          >
            <option value="all">📊 All Analytics</option>
            <option value="up">📈 Price Surging</option>
            <option value="down">📉 Price Dropping</option>
            <option value="stable">⚖️ Market Stable</option>
          </select>
          <div className="flex gap-2">
            <button onClick={exportPDF} className={`p-4 rounded-2xl border-2 transition-all hover:scale-105 active:scale-95 ${darkMode ? 'bg-slate-800 border-slate-700 text-slate-300' : 'bg-white border-slate-100 text-slate-500 hover:border-green-600'}`} title="Export PDF">
              <Download size={20} />
            </button>
            <button onClick={exportCSV} className={`p-4 rounded-2xl border-2 transition-all hover:scale-105 active:scale-95 ${darkMode ? 'bg-slate-800 border-slate-700 text-slate-300' : 'bg-white border-slate-100 text-slate-500 hover:border-green-600'}`} title="Export CSV">
              <FileSpreadsheet size={20} />
            </button>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-12 gap-8 h-full">
        {/* Main Chart Card */}
        <div className="xl:col-span-8 space-y-8">
          {selectedPrice && (
            <div className={`p-10 rounded-[3rem] border shadow-2xl relative overflow-hidden ${darkMode ? 'bg-slate-900 border-slate-800' : 'bg-white border-slate-100'
              }`}>
              {/* Decorative background */}
              <div className="absolute top-0 right-0 w-64 h-64 bg-green-500/5 rounded-full blur-3xl -mr-32 -mt-32"></div>

              <div className="relative z-10 flex flex-col md:flex-row justify-between items-start gap-8 mb-12">
                <div className="flex gap-8">
                  <div className={`w-24 h-24 rounded-[2rem] flex items-center justify-center shadow-xl ring-8 ${selectedPrice.trend === 'up' ? 'bg-green-100 text-green-600 ring-green-50 dark:ring-green-900/10' :
                    selectedPrice.trend === 'down' ? 'bg-red-100 text-red-600 ring-red-50 dark:ring-red-900/10' : 'bg-slate-100 text-slate-600 ring-slate-50'
                    }`}>
                    <SelectedIcon size={48} strokeWidth={2.5} />
                  </div>
                  <div>
                    <div className="flex items-center gap-3">
                      <h3 className="text-4xl font-black text-slate-900 dark:text-white">{selectedPrice.commodity}</h3>
                      <button onClick={() => toggleFavorite(selectedPrice.commodity)}>
                        <Star size={24} className={favorites.includes(selectedPrice.commodity) ? 'text-amber-500' : 'text-slate-300'} fill={favorites.includes(selectedPrice.commodity) ? 'currentColor' : 'none'} />
                      </button>
                    </div>
                    <p className="text-slate-500 dark:text-slate-400 text-lg font-bold flex items-center gap-2 mt-1">
                      <MapPin size={20} className="text-green-600" /> {selectedPrice.location}
                    </p>
                    <div className="flex gap-2 mt-4">
                      <span className="px-3 py-1 bg-slate-100 dark:bg-slate-800 text-slate-500 rounded-full text-[10px] font-black uppercase tracking-widest">{selectedPrice.unit}</span>
                      <span className="px-3 py-1 bg-slate-100 dark:bg-slate-800 text-slate-500 rounded-full text-[10px] font-black uppercase tracking-widest">Updated {selectedPrice.updatedAt}</span>
                    </div>
                  </div>
                </div>

                <div className="text-right flex flex-col items-end">
                  <div className="text-6xl font-black text-green-600 tracking-tighter flex items-start">
                    <span className="text-2xl mt-2 mr-1">GH₵</span>
                    {selectedPrice.price.toFixed(2)}
                  </div>
                  <div className={`flex items-center gap-2 mt-2 px-4 py-1.5 rounded-full text-sm font-black ${selectedPrice.trend === 'up' ? 'bg-green-100 text-green-700' :
                    selectedPrice.trend === 'down' ? 'bg-red-100 text-red-700' : 'bg-slate-100 text-slate-700'
                    }`}>
                    {selectedPrice.trend === 'up' ? <TrendingUp size={18} /> : selectedPrice.trend === 'down' ? <TrendingDown size={18} /> : <TrendingUp size={18} className="opacity-0" />}
                    {selectedPrice.trend === 'up' ? '+4.2%' : selectedPrice.trend === 'down' ? '-2.8%' : 'STABLE'}
                  </div>

                  {canEdit && (
                    <button
                      onClick={() => {
                        setEditingPriceItem({ ...selectedPrice });
                        setIsEditingPrice(true);
                      }}
                      className="mt-6 flex items-center gap-2 px-6 py-3 bg-slate-900 dark:bg-white dark:text-slate-900 text-white rounded-2xl font-black text-sm hover:scale-105 active:scale-95 transition-all shadow-xl shadow-slate-900/20"
                    >
                      <Pencil size={18} /> Update Pricing
                    </button>
                  )}
                </div>
              </div>

              {/* Chart Placeholder / Visual */}
              <div className="h-[350px] w-full mt-12 bg-slate-50 dark:bg-slate-800/50 rounded-[2rem] p-8 border-2 border-dashed border-slate-200 dark:border-slate-700">
                <div className="flex items-center justify-between mb-8">
                  <h4 className="text-xs font-black text-slate-400 uppercase tracking-widest flex items-center gap-2">
                    <TrendingUp size={14} className="text-green-600" /> Market Projection & History
                  </h4>
                  <div className="flex bg-slate-200 dark:bg-slate-700 p-1 rounded-xl">
                    {['1w', '1m', '3m', '1y'].map(r => (
                      <button key={r} className={`px-4 py-1 rounded-lg text-xs font-black uppercase transition-all ${timeRange === r ? 'bg-white dark:bg-slate-600 text-green-600 shadow-md' : 'text-slate-500'}`} onClick={() => setTimeRange(r)}>{r}</button>
                    ))}
                  </div>
                </div>
                <div className="h-[250px] w-full">
                  <ResponsiveContainer width="100%" height="100%">
                    <AreaChart data={dynamicChartData}>
                      <defs>
                        <linearGradient id="colorPrice" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="5%" stopColor="#16a34a" stopOpacity={0.3} />
                          <stop offset="95%" stopColor="#16a34a" stopOpacity={0} />
                        </linearGradient>
                      </defs>
                      <CartesianGrid strokeDasharray="3 3" vertical={false} stroke={darkMode ? '#334155' : '#e2e8f0'} />
                      <XAxis dataKey="date" axisLine={false} tickLine={false} tick={{ fill: '#94a3b8', fontSize: 12, fontWeight: 700 }} />
                      <YAxis hide domain={['auto', 'auto']} />
                      <Tooltip
                        contentStyle={{ borderRadius: '1.5rem', border: 'none', boxShadow: '0 20px 40px rgba(0,0,0,0.1)', background: darkMode ? '#1e293b' : 'white' }}
                        itemStyle={{ fontWeight: 'black', color: '#16a34a' }}
                      />
                      <Area type="monotone" dataKey="price" stroke="#16a34a" strokeWidth={5} fillOpacity={1} fill="url(#colorPrice)" activeDot={{ r: 10, strokeWidth: 0, fill: '#16a34a' }} />
                    </AreaChart>
                  </ResponsiveContainer>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Side Listing Column */}
        <div className="xl:col-span-4 flex flex-col gap-5 overflow-y-auto max-h-[1000px] pr-2 custom-scrollbar no-scrollbar">
          <div className="flex items-center justify-between px-4">
            <h4 className="text-[10px] font-black text-slate-400 uppercase tracking-widest flex items-center gap-2">
              <Sprout size={14} className="text-green-600" /> Market Observations
            </h4>
            <span className="text-[10px] font-black text-slate-400">{filteredAndSorted.length} Commodities</span>
          </div>

          {filteredAndSorted.map(price => {
            const isSelected = selectedCommodityId === price.id || (!selectedCommodityId && prices[0]?.id === price.id);
            const RowIcon = COMMODITY_ICONS[price.commodity] || COMMODITY_ICONS['default'];

            return (
              <div
                key={price.id}
                onClick={() => setSelectedCommodityId(price.id)}
                className={`group p-6 rounded-[2rem] border transition-all cursor-pointer ${isSelected
                  ? 'bg-green-600 border-green-600 text-white shadow-2xl shadow-green-600/30'
                  : (darkMode
                    ? 'bg-slate-800 border-slate-700 hover:border-slate-500'
                    : 'bg-white border-slate-100 hover:border-slate-300 shadow-sm')
                  }`}
              >
                <div className="flex justify-between items-start">
                  <div className="flex gap-4">
                    <div className={`w-14 h-14 rounded-2xl flex items-center justify-center shrink-0 transition-transform group-hover:scale-110 ${isSelected ? 'bg-white/20' : (darkMode ? 'bg-slate-700 text-slate-300' : 'bg-green-50 text-green-600')
                      }`}>
                      <RowIcon size={24} strokeWidth={2.5} />
                    </div>
                    <div>
                      <h4 className="font-black text-lg line-clamp-1">{price.commodity}</h4>
                      <div className={`text-[10px] font-black flex items-center gap-1 uppercase tracking-widest ${isSelected ? 'text-white/70' : 'text-slate-400'
                        }`}>
                        <MapPin size={10} /> {price.location}
                      </div>
                    </div>
                  </div>

                  <div className="text-right">
                    <div className={`text-2xl font-black ${isSelected ? 'text-white' : 'text-green-600'}`}>₵{price.price.toFixed(0)}</div>
                    <div className={`text-[10px] font-black uppercase tracking-tighter ${isSelected ? 'text-white/50' : 'text-slate-400'}`}>/ {price.unit}</div>
                  </div>
                </div>

                {isSelected && (
                  <div className="mt-6 flex items-center justify-between text-xs font-black uppercase tracking-widest">
                    <div className="flex items-center gap-2">
                      {price.trend === 'up' ? <ArrowUpRight size={14} className="text-green-300" /> : <ArrowDownRight size={14} className="text-red-300" />}
                      <span>Market Active</span>
                    </div>
                    <Info size={14} className="opacity-50" />
                  </div>
                )}
              </div>
            );
          })}

          {/* Audit Trail Section */}
          <div className={`mt-4 p-8 rounded-[2.5rem] border ${darkMode ? 'bg-slate-900 border-slate-700' : 'bg-slate-50 border-slate-100'}`}>
            <h4 className="text-[10px] font-black text-slate-400 uppercase tracking-widest flex items-center gap-2 mb-6">
              <History size={14} className="text-amber-500" /> Official Audit Trail
            </h4>
            <div className="space-y-4">
              {priceHistory.map((log) => (
                <div key={log.id} className="flex gap-4 items-start">
                  <div className={`w-8 h-8 rounded-lg flex items-center justify-center shrink-0 ${darkMode ? 'bg-slate-800' : 'bg-white shadow-sm'}`}>
                    {log.newPrice > log.oldPrice ? <ArrowUpRight size={14} className="text-green-500" /> : <ArrowDownRight size={14} className="text-red-500" />}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-[12px] font-black leading-none mb-1">
                      {log.commodity} updated to <span className="text-green-600">₵{log.newPrice}</span>
                    </p>
                    <p className="text-[10px] font-bold text-slate-400 truncate">
                      By {log.changedBy} • {new Date(log.timestamp).toLocaleTimeString()}
                    </p>
                  </div>
                </div>
              ))}
              {priceHistory.length === 0 && (
                <p className="text-[10px] font-bold text-slate-400 italic text-center py-4">No recent official modifications.</p>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Admin Price Update Modal */}
      {isEditingPrice && editingPriceItem && (
        <div className="fixed inset-0 z-[110] flex items-center justify-center p-6 bg-black/80 backdrop-blur-xl animate-in fade-in duration-300">
          <div className={`w-full max-w-lg p-10 rounded-[3rem] shadow-2xl relative animate-in zoom-in duration-300 ${darkMode ? 'bg-slate-900 border border-slate-800' : 'bg-white'}`}>
            <button onClick={() => setIsEditingPrice(false)} className="absolute top-8 right-8 text-slate-400 hover:text-white transition-colors">
              <X size={32} />
            </button>
            <div className="flex flex-col items-center text-center mb-10">
              <div className="w-20 h-20 bg-green-100 text-green-600 rounded-[2rem] flex items-center justify-center mb-6 shadow-inner ring-8 ring-green-50/50">
                <RefreshCw size={40} className="animate-spin-slow" />
              </div>
              <h3 className="text-4xl font-black tracking-tighter">Market Update</h3>
              <p className="text-slate-500 dark:text-slate-400 font-medium mt-2">Adjust live pricing for <span className="text-green-600 font-black">{editingPriceItem.commodity}</span> at <span className="text-slate-900 dark:text-white font-black">{editingPriceItem.location}</span>.</p>
            </div>

            <form onSubmit={handleUpdatePrice} className="space-y-8">
              <div className="space-y-3">
                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">New Unit Price (GHS)</label>
                <div className="relative">
                  <span className="absolute left-6 top-1/2 -translate-y-1/2 text-3xl font-black text-green-600">₵</span>
                  <input
                    required
                    type="number"
                    step="0.01"
                    value={editingPriceItem.price}
                    onChange={(e) => setEditingPriceItem({ ...editingPriceItem, price: e.target.value })}
                    className={`w-full pl-16 pr-6 py-6 rounded-[2rem] outline-none border-4 text-4xl font-black transition-all ${darkMode ? 'bg-slate-800 border-slate-700 focus:border-green-600 text-white' : 'bg-slate-50 border-slate-200 focus:border-green-600'
                      }`}
                    autoFocus
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <button
                  type="button"
                  onClick={() => setIsEditingPrice(false)}
                  className={`py-5 rounded-[1.5rem] font-black text-xl transition-all ${darkMode ? 'bg-slate-800 text-slate-300' : 'bg-slate-100 text-slate-500'
                    }`}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="py-5 bg-green-600 text-white rounded-[1.5rem] font-black text-xl shadow-2xl shadow-green-600/30 hover:bg-green-700 hover:scale-[1.02] active:scale-95 transition-all"
                >
                  Post Update
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default MarketPrices;
