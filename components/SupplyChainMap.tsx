import React, { useState, useEffect } from 'react';
import { Factory, Store, Sprout, Anchor, Package, Activity, Wifi, CheckCircle2, AlertCircle, Clock } from 'lucide-react';

interface Props {
    darkMode: boolean;
}

type CropType = 'cassava' | 'maize' | 'fertilizer';
type Status = 'optimal' | 'warning' | 'delay';

interface ProcessingStage {
    id: string;
    title: string;
    location: string;
    type: 'farm' | 'aggregator' | 'processor' | 'market' | 'port';
    description: string;
    status: Status;
    metric: string;
}

interface Chain {
    title: string;
    description: string;
    stages: ProcessingStage[];
}

// Define Explicit Tailwind Classes for each theme
const THEMES: Record<CropType, { text: string, bg: string, border: string, via: string, ring: string }> = {
    maize: {
        text: 'text-yellow-500',
        bg: 'bg-yellow-500',
        border: 'border-yellow-500',
        via: 'via-yellow-500',
        ring: 'ring-yellow-500'
    },
    cassava: {
        text: 'text-green-600',
        bg: 'bg-green-600',
        border: 'border-green-600',
        via: 'via-green-600',
        ring: 'ring-green-600'
    },
    fertilizer: {
        text: 'text-blue-500',
        bg: 'bg-blue-500',
        border: 'border-blue-500',
        via: 'via-blue-500',
        ring: 'ring-blue-500'
    }
};

const CHAINS: Record<CropType, Chain> = {
    maize: {
        title: 'Cereal Value Chain',
        description: 'Tracking Northern grain flow.',
        stages: [
            { id: 'tamale', title: 'Production', location: 'Tamale Zone', type: 'farm', description: 'Harvesting in progress', status: 'optimal', metric: '500 Tons' },
            { id: 'techiman', title: 'Aggregation', location: 'Techiman Hub', type: 'aggregator', description: 'Consolidation center', status: 'optimal', metric: 'Daily: 40 Trucks' },
            { id: 'kumasi', title: 'Processing', location: 'Kumasi', type: 'processor', description: 'Milling throughput high', status: 'warning', metric: 'Queue: 4hrs' },
            { id: 'accra', title: 'Retail', location: 'Accra Markets', type: 'market', description: 'High demand detected', status: 'optimal', metric: 'Price: +5%' }
        ]
    },
    cassava: {
        title: 'Roots & Tubers Chain',
        description: 'Perishable goods monitoring.',
        stages: [
            { id: 'techiman', title: 'Harvest', location: 'Bono East', type: 'farm', description: 'Fresh tuber extraction', status: 'optimal', metric: 'Yield: High' },
            { id: 'kumasi', title: 'Logistics', location: 'Transit', type: 'processor', description: 'Cold chain transport', status: 'delay', metric: 'Delay: 2h' },
            { id: 'accra', title: 'Market', location: 'Accra', type: 'market', description: 'Distribution to vendors', status: 'optimal', metric: 'Stock: 80%' }
        ]
    },
    fertilizer: {
        title: 'Input Distribution',
        description: 'Import logistics tracking.',
        stages: [
            { id: 'takoradi', title: 'Port Entry', location: 'Takoradi', type: 'port', description: 'Vessel discharge', status: 'optimal', metric: '15,000 MT' },
            { id: 'kumasi', title: 'Warehousing', location: 'Kumasi Depot', type: 'aggregator', description: 'Stockpiling', status: 'optimal', metric: 'Cap: 90%' },
            { id: 'tamale', title: 'Last Mile', location: 'Northern Farms', type: 'market', description: 'Delivery to co-ops', status: 'warning', metric: 'Fuel cost up' }
        ]
    }
};

const SupplyChainMap: React.FC<Props> = ({ darkMode }) => {
    const [activeCrop, setActiveCrop] = useState<CropType>('maize');
    const [activeSignal, setActiveSignal] = useState(0);
    const activeChain = CHAINS[activeCrop];
    const theme = THEMES[activeCrop];

    useEffect(() => {
        const interval = setInterval(() => {
            setActiveSignal((prev) => (prev + 1) % activeChain.stages.length);
        }, 2000);
        return () => clearInterval(interval);
    }, [activeCrop, activeChain.stages.length]);

    const getIcon = (type: string) => {
        switch (type) {
            case 'farm': return <Sprout size={18} />;
            case 'aggregator': return <Package size={18} />;
            case 'processor': return <Factory size={18} />;
            case 'market': return <Store size={18} />;
            case 'port': return <Anchor size={18} />;
            default: return <Activity size={18} />;
        }
    };

    const getStatusColor = (status: Status) => {
        switch (status) {
            case 'optimal': return 'text-green-500 bg-green-100 dark:bg-green-900/30';
            case 'warning': return 'text-amber-500 bg-amber-100 dark:bg-amber-900/30';
            case 'delay': return 'text-red-500 bg-red-100 dark:bg-red-900/30';
        }
    };

    const getStatusIcon = (status: Status) => {
        switch (status) {
            case 'optimal': return <CheckCircle2 size={12} />;
            case 'warning': return <AlertCircle size={12} />;
            case 'delay': return <Clock size={12} />;
        }
    };

    return (
        <div className={`h-full flex flex-col p-6 rounded-[2.5rem] border transition-colors duration-300 ${darkMode ? 'bg-slate-900 border-slate-700 text-white' : 'bg-white border-slate-100 text-slate-800 shadow-sm'}`}>

            {/* Header */}
            <div className="flex flex-col sm:flex-row justify-between items-start mb-8 gap-4">
                <div>
                    <h2 className="text-xl font-black tracking-tight flex items-center gap-2">
                        <Activity className={darkMode ? 'text-green-400' : 'text-green-600'} />
                        Live Chain
                    </h2>
                    <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mt-1">
                        Real-time Logistics Signals
                    </p>
                </div>

                <div className="flex p-1 bg-slate-100 dark:bg-slate-800 rounded-xl overflow-x-auto">
                    {(Object.keys(CHAINS) as CropType[]).map((crop) => (
                        <button
                            key={crop}
                            onClick={() => { setActiveCrop(crop); setActiveSignal(0); }}
                            className={`px-4 py-2 rounded-lg text-[10px] font-black uppercase tracking-wider transition-all whitespace-nowrap ${activeCrop === crop
                                ? 'bg-white dark:bg-slate-700 shadow-sm text-slate-800 dark:text-white'
                                : 'text-slate-400 hover:text-slate-600 dark:hover:text-slate-300'
                                }`}
                        >
                            {crop}
                        </button>
                    ))}
                </div>
            </div>

            {/* Content Active Area */}
            <div className="flex-grow flex flex-col gap-6 relative pl-2">

                {/* Vertical Timeline Line */}
                <div className="absolute left-[38px] top-6 bottom-12 w-0.5 bg-slate-100 dark:bg-slate-800/50 -z-10 overflow-hidden">
                    {/* Animated Pulse Beam traveling down - Using 'via' class explicitly */}
                    <div
                        className={`absolute w-full h-32 bg-gradient-to-b from-transparent ${theme.via} to-transparent opacity-50 blur-sm transition-all duration-[2000ms] ease-linear`}
                        style={{ top: `${(activeSignal / (activeChain.stages.length - 1)) * 80}%` }}
                    ></div>
                </div>

                {activeChain.stages.map((stage, index) => {
                    const isActive = index === activeSignal;
                    const isPast = index < activeSignal;

                    return (
                        <div key={stage.id} className="relative flex items-center gap-4 group">

                            {/* Node Connector */}
                            <div className={`
                                w-14 h-14 rounded-full flex items-center justify-center border-[4px] relative transition-all duration-500
                                ${isActive
                                    ? `bg-white dark:bg-slate-800 ${theme.border} shadow-lg scale-110 z-10`
                                    : isPast
                                        ? 'bg-slate-50 dark:bg-slate-800 border-slate-200 dark:border-slate-700 opacity-90'
                                        : 'bg-slate-50 dark:bg-slate-900 border-slate-100 dark:border-slate-800 opacity-50 grayscale'
                                }
                            `}>
                                <div className={isActive ? theme.text : 'text-slate-400'}>
                                    {getIcon(stage.type)}
                                </div>

                                {/* Ping Effect for Active Signal */}
                                {isActive && (
                                    <span className={`absolute inset-0 rounded-full animate-ping opacity-20 ${theme.bg}`}></span>
                                )}
                            </div>

                            {/* Info Card */}
                            <div className={`
                                flex-grow p-4 rounded-2xl border transition-all duration-500
                                ${isActive
                                    ? 'bg-white dark:bg-slate-800 border-slate-200 dark:border-slate-600 shadow-md translate-x-2'
                                    : 'bg-slate-50/50 dark:bg-slate-800/20 border-transparent hover:border-slate-100 dark:hover:border-slate-700'
                                }
                            `}>
                                <div className="flex justify-between items-start mb-2">
                                    <div>
                                        <div className="flex items-center gap-2 mb-0.5">
                                            <span className="text-xs font-black uppercase tracking-wider block">{stage.title}</span>
                                            {/* Status Pill */}
                                            <div className={`flex items-center gap-1 px-1.5 py-0.5 rounded-full text-[8px] font-bold uppercase tracking-wide ${getStatusColor(stage.status)}`}>
                                                {getStatusIcon(stage.status)}
                                                {stage.status}
                                            </div>
                                        </div>
                                        <h4 className="font-bold text-sm text-slate-700 dark:text-slate-200">{stage.location}</h4>
                                    </div>

                                    {/* Metric Signal */}
                                    <div className="text-right">
                                        <div className="flex items-center justify-end gap-1 text-[9px] font-bold text-slate-400 mb-0.5">
                                            <Wifi size={10} className={isActive ? `animate-pulse ${theme.text}` : ''} />
                                            Signal
                                        </div>
                                        <div className="text-xs font-mono font-bold text-slate-600 dark:text-slate-300">
                                            {stage.metric}
                                        </div>
                                    </div>
                                </div>

                                <p className="text-[10px] text-slate-400 leading-relaxed max-w-[200px]">
                                    {stage.description}
                                </p>
                            </div>
                        </div>
                    );
                })}
            </div>
        </div>
    );
};

export default SupplyChainMap;
