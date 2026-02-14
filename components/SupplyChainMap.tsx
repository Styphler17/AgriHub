import React from 'react';
import { MapPin, TrendingUp, TrendingDown } from 'lucide-react';

interface Props {
    darkMode: boolean;
}

const MARKETS = [
    { id: 1, name: 'Accra (Makola)', x: '70%', y: '85%', price: 'up', emoji: '🌽' },
    { id: 2, name: 'Kumasi (Kejetia)', x: '45%', y: '70%', price: 'down', emoji: '🥔' },
    { id: 3, name: 'Tamale', x: '55%', y: '30%', price: 'up', emoji: '🥜' },
    { id: 4, name: 'Takoradi', x: '40%', y: '90%', price: 'stable', emoji: '🐟' },
    { id: 5, name: 'Koforidua', x: '65%', y: '75%', price: 'up', emoji: '🍊' },
];

const SupplyChainMap: React.FC<Props> = ({ darkMode }) => {
    return (
        <div className={`p-8 rounded-[3rem] border h-full relative overflow-hidden ${darkMode ? 'bg-slate-900 border-slate-700' : 'bg-white border-slate-100 shadow-sm'}`}>
            <div className="flex justify-between items-start mb-8">
                <div>
                    <h3 className="text-2xl font-black tracking-tighter">Supply Chain Map</h3>
                    <p className="text-[10px] font-black uppercase tracking-widest text-slate-400">Live regional market flow</p>
                </div>
                <div className="flex items-center gap-2 px-3 py-1 bg-green-100 text-green-600 rounded-lg text-[10px] font-black uppercase">
                    <div className="w-1.5 h-1.5 rounded-full bg-green-600 animate-ping" />
                    Live Pulse
                </div>
            </div>

            <div className="relative aspect-[4/5] w-full max-w-[300px] mx-auto group">
                {/* Ghana Simplified SVG Mask/Path */}
                <svg viewBox="0 0 100 120" className={`w-full h-full drop-shadow-2xl ${darkMode ? 'text-slate-800' : 'text-slate-50'}`}>
                    <path
                        fill="currentColor"
                        stroke={darkMode ? '#334155' : '#e2e8f0'}
                        strokeWidth="0.5"
                        d="M30 5 L70 5 L85 30 L80 60 L90 85 L75 110 L50 115 L25 110 L10 85 L20 60 L15 30 Z"
                    />
                </svg>

                {/* Market Pins */}
                {MARKETS.map((m) => (
                    <div
                        key={m.id}
                        className="absolute transition-all duration-500 hover:scale-125 cursor-pointer z-10"
                        style={{ left: m.x, top: m.y }}
                    >
                        <div className={`flex flex-col items-center group-hover:block`}>
                            <div className="relative">
                                <MapPin size={20} className={m.price === 'up' ? 'text-green-500' : m.price === 'down' ? 'text-red-500' : 'text-amber-500'} />
                                <span className="absolute -top-3 -right-3 text-sm">{m.emoji}</span>
                            </div>

                            <div className="absolute top-6 left-1/2 -translate-x-1/2 bg-white dark:bg-slate-800 p-2 rounded-xl shadow-2xl border border-slate-100 dark:border-slate-700 hidden group-hover/pin:block whitespace-nowrap">
                                <p className="text-[9px] font-black uppercase tracking-tighter">{m.name}</p>
                                <div className="flex items-center gap-1 text-[8px] font-bold">
                                    {m.price === 'up' ? <TrendingUp size={10} className="text-green-500" /> : <TrendingDown size={10} className="text-red-500" />}
                                    {m.price === 'up' ? 'Rising demand' : 'Surplus Stock'}
                                </div>
                            </div>
                        </div>
                    </div>
                ))}

                {/* Connection Lines (Simulated Flow) */}
                <svg className="absolute inset-0 w-full h-full pointer-events-none opacity-20">
                    <path d="M45,70 Q55,75 70,85" stroke="#16a34a" fill="none" strokeWidth="1" strokeDasharray="3 3">
                        <animate attributeName="stroke-dashoffset" from="0" to="20" dur="2s" repeatCount="indefinite" />
                    </path>
                    <path d="M55,30 Q50,50 45,70" stroke="#16a34a" fill="none" strokeWidth="1" strokeDasharray="3 3">
                        <animate attributeName="stroke-dashoffset" from="0" to="-20" dur="3s" repeatCount="indefinite" />
                    </path>
                </svg>
            </div>

            <div className="mt-8 grid grid-cols-2 gap-4">
                <div className={`p-4 rounded-2xl ${darkMode ? 'bg-slate-800' : 'bg-slate-50'}`}>
                    <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest mb-1">Active Hubs</p>
                    <p className="text-xl font-black">14 Districts</p>
                </div>
                <div className={`p-4 rounded-2xl ${darkMode ? 'bg-slate-800' : 'bg-slate-50'}`}>
                    <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest mb-1">Total Volume</p>
                    <p className="text-xl font-black">1.2k Tons</p>
                </div>
            </div>
        </div>
    );
};

export default SupplyChainMap;
