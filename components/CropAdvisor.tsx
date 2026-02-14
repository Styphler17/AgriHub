
import React, { useState } from 'react';
import { getCropAdvice } from '../services/geminiService';
import { Search, Loader2, FileText, Download, CheckCircle2, AlertCircle, Apple, Bean, Sprout as SproutIcon, Cherry, Zap } from 'lucide-react';
import { jsPDF } from 'jspdf';

interface Props {
  lang: string;
  t: any;
  darkMode: boolean;
}

const CROP_SUGGESTIONS = [
  { category: 'Staples', icon: SproutIcon, items: ['Maize', 'Cassava', 'Yam', 'Plantain', 'Rice'] },
  { category: 'Legumes', icon: Bean, items: ['Groundnut', 'Cowpea', 'Soya Bean', 'Bambara Nut'] },
  { category: 'Fruits', icon: Cherry, items: ['Mango', 'Pineapple', 'Citrus', 'Pawpaw', 'Watermelon'] },
  { category: 'Export', icon: Apple, items: ['Cocoa', 'Cashew', 'Coffee', 'Oil Palm'] }
];

const CropAdvisor: React.FC<Props> = ({ lang, t, darkMode }) => {
  const [crop, setCrop] = useState('');
  const [soil, setSoil] = useState('Loamy');
  const [region, setRegion] = useState('Ashanti');
  const [advice, setAdvice] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const handleGetAdvice = async (e: React.FormEvent | string) => {
    if (typeof e !== 'string') {
      e.preventDefault();
    }
    const targetCrop = typeof e === 'string' ? e : crop;
    if (!targetCrop) return;
    
    setCrop(targetCrop);
    setLoading(true);
    const result = await getCropAdvice(targetCrop, soil, region, lang as 'en' | 'tw');
    setAdvice(result);
    setLoading(false);
  };

  const exportPDF = () => {
    if (!advice) return;
    const doc = new jsPDF();
    doc.setFontSize(20);
    doc.text(`${crop} Advice - Ghana AgriHub`, 20, 20);
    doc.setFontSize(12);
    const splitText = doc.splitTextToSize(advice, 170);
    doc.text(splitText, 20, 40);
    doc.save(`${crop}_advice.pdf`);
  };

  return (
    <div className="max-w-4xl mx-auto space-y-8 animate-slide-in pb-20">
      <div className={`p-8 rounded-3xl ${darkMode ? 'bg-slate-800' : 'bg-white'} border ${darkMode ? 'border-slate-700' : 'border-slate-100'} shadow-sm`}>
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-2xl font-bold flex items-center gap-2">
            <Search className="text-green-600" /> {t.advice}
          </h2>
          <div className="flex items-center gap-2 px-3 py-1 bg-green-50 dark:bg-green-900/30 text-green-600 rounded-full text-[10px] font-black uppercase tracking-widest">
            <Zap size={12} /> Local Knowledge Active
          </div>
        </div>
        
        <form onSubmit={handleGetAdvice} className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <div className="space-y-2">
            <label className="text-sm font-semibold text-slate-500 uppercase tracking-wider">{t.cropType}</label>
            <input
              type="text"
              value={crop}
              onChange={(e) => setCrop(e.target.value)}
              placeholder="e.g., Maize, Cocoa, Yam"
              className={`w-full px-4 py-3 rounded-xl outline-none border transition-all ${
                darkMode ? 'bg-slate-900 border-slate-700 focus:border-green-600' : 'bg-slate-50 border-slate-200 focus:border-green-600'
              }`}
              required
            />
          </div>

          <div className="space-y-2">
            <label className="text-sm font-semibold text-slate-500 uppercase tracking-wider">{t.soilType}</label>
            <select
              value={soil}
              onChange={(e) => setSoil(e.target.value)}
              className={`w-full px-4 py-3 rounded-xl outline-none border transition-all ${
                darkMode ? 'bg-slate-900 border-slate-700 focus:border-green-600' : 'bg-slate-50 border-slate-200 focus:border-green-600'
              }`}
            >
              <option value="Loamy">Loamy</option>
              <option value="Clay">Clay</option>
              <option value="Sandy">Sandy</option>
              <option value="Laterite">Laterite</option>
            </select>
          </div>

          <div className="space-y-2">
            <label className="text-sm font-semibold text-slate-500 uppercase tracking-wider">{t.region}</label>
            <select
              value={region}
              onChange={(e) => setRegion(e.target.value)}
              className={`w-full px-4 py-3 rounded-xl outline-none border transition-all ${
                darkMode ? 'bg-slate-900 border-slate-700 focus:border-green-600' : 'bg-slate-50 border-slate-200 focus:border-green-600'
              }`}
            >
              <option value="Ashanti">Ashanti</option>
              <option value="Greater Accra">Greater Accra</option>
              <option value="Northern">Northern</option>
              <option value="Western">Western</option>
              <option value="Eastern">Eastern</option>
              <option value="Volta">Volta</option>
            </select>
          </div>

          <div className="md:col-span-3">
            <button
              disabled={loading}
              className="w-full bg-green-600 hover:bg-green-700 text-white font-bold py-4 rounded-xl shadow-lg flex items-center justify-center gap-2 transition-all disabled:opacity-70 disabled:cursor-not-allowed"
            >
              {loading ? (
                <>
                  <Loader2 className="animate-spin" /> {t.loading}
                </>
              ) : (
                <>
                  <CheckCircle2 size={20} /> {t.getAdvice}
                </>
              )}
            </button>
          </div>
        </form>

        <div className="space-y-6 pt-6 border-t border-slate-100 dark:border-slate-700">
           <h4 className="text-xs font-black text-slate-400 uppercase tracking-widest">Recommended Crops for Ghana (Works Offline)</h4>
           <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
              {CROP_SUGGESTIONS.map((cat) => (
                <div key={cat.category} className="space-y-3">
                  <div className="flex items-center gap-2 text-green-600 font-bold text-sm">
                    <cat.icon size={16} /> {cat.category}
                  </div>
                  <div className="flex flex-wrap gap-2">
                    {cat.items.map(item => (
                      <button
                        key={item}
                        onClick={() => handleGetAdvice(item)}
                        className={`text-[10px] font-bold px-3 py-1.5 rounded-full border transition-all ${
                          darkMode 
                            ? 'bg-slate-900 border-slate-700 hover:bg-slate-700 text-slate-300' 
                            : 'bg-slate-50 border-slate-200 hover:bg-green-50 hover:border-green-200 text-slate-600'
                        }`}
                      >
                        {item}
                      </button>
                    ))}
                  </div>
                </div>
              ))}
           </div>
        </div>
      </div>

      {advice && (
        <div className={`p-8 rounded-3xl ${darkMode ? 'bg-slate-800' : 'bg-white'} border ${darkMode ? 'border-slate-700' : 'border-slate-100'} shadow-sm relative animate-slide-in`}>
          <div className="flex justify-between items-start mb-6">
             <h3 className="text-xl font-bold text-green-600">Generated Strategy for {crop}</h3>
             <button
              onClick={exportPDF}
              className="flex items-center gap-2 text-sm font-bold text-slate-500 hover:text-green-600 transition-colors"
             >
              <Download size={18} /> {t.exportPdf}
             </button>
          </div>
          <div className="prose dark:prose-invert max-w-none whitespace-pre-wrap leading-relaxed text-lg">
            {advice}
          </div>
          
          <div className="mt-8 p-4 bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-700 rounded-2xl flex gap-3 text-amber-800 dark:text-amber-200 text-sm italic">
            <AlertCircle className="shrink-0" />
            Advice is pulled from our pre-saved local knowledge base or Gemini AI. No data charges apply for local base.
          </div>
        </div>
      )}
    </div>
  );
};

export default CropAdvisor;
