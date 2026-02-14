import React, { useState, useEffect } from 'react';
import { useObservable } from 'dexie-react-hooks';
import { MarketplaceListing, User } from '../types';
import { db } from '../db';
import { ShoppingBag, Search, Plus, MessageCircle, MapPin, Tag, X, User as UserIcon, Check, Map as MapIcon, List, Trash2, Pencil, Smartphone } from 'lucide-react';

interface Props {
  lang: string;
  t: any;
  darkMode: boolean;
  user: User | null;
}

const Marketplace: React.FC<Props> = ({ lang, t, darkMode, user }) => {
  const [listings, setListings] = useState<MarketplaceListing[]>([]);
  const [activeType, setActiveType] = useState<'all' | 'sale' | 'wanted'>('all');
  const [viewMode, setViewMode] = useState<'grid' | 'map'>('grid');
  const [showPostModal, setShowPostModal] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState('');

  const [newListing, setNewListing] = useState({
    title: '',
    description: '',
    price: '',
    type: 'sale' as 'sale' | 'wanted',
    category: 'Grain',
    contact: ''
  });

  useEffect(() => {
    loadListings();
  }, []);

  const loadListings = async () => {
    const data = await db.listings.toArray();
    setListings(data);
  };

  const handleDelete = async (id: string) => {
    if (confirm('Are you sure you want to remove this listing?')) {
      await db.listings.delete(id);
      loadListings();
    }
  };

  const handleEdit = (item: MarketplaceListing) => {
    setNewListing({
      title: item.title,
      description: item.description,
      // Strip GH₵ and ₵ using regex to handle variations in spacing
      price: item.price.replace(/GH₵|₵/g, '').trim(),
      type: item.type,
      category: item.category,
      contact: item.contact
    });
    setEditingId(item.id);
    setIsEditing(true);
    setShowPostModal(true);
  };

  const handleShowPostModal = () => {
    if (!isEditing) {
      setNewListing({
        title: '',
        description: '',
        price: '',
        type: 'sale',
        category: 'Grain',
        contact: user?.phoneNumber || ''
      });
    }
    setShowPostModal(true);
  };

  const handlePost = async (e: React.FormEvent) => {
    e.preventDefault();

    let finalPrice = newListing.price.trim();
    if (!finalPrice.startsWith('GH₵') && !finalPrice.startsWith('₵')) {
      finalPrice = `GH₵ ${finalPrice}`;
    }

    if (isEditing && editingId) {
      await db.listings.update(editingId, {
        ...newListing,
        price: finalPrice
      });
    } else {
      const listing: MarketplaceListing = {
        ...newListing,
        price: finalPrice,
        id: Math.random().toString(36).substr(2, 9),
        userId: user?.id || 'anonymous',
        userName: user?.name || 'Farmer',
        userProfileImage: user?.profileImage,
      };
      await db.listings.add(listing);
    }

    loadListings();
    setShowPostModal(false);
    setIsEditing(false);
    setEditingId(null);
    setNewListing({ title: '', description: '', price: '', type: 'sale', category: 'Grain', contact: '' });
  };

  const filtered = listings.filter(l => {
    const matchesType = activeType === 'all' || l.type === activeType;
    const matchesSearch = l.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      l.category.toLowerCase().includes(searchTerm.toLowerCase());
    return matchesType && matchesSearch;
  });

  return (
    <div className="space-y-8 animate-slide-in">
      <div className="flex flex-col xl:flex-row items-center justify-between gap-6">
        <div className="flex flex-col sm:flex-row gap-4 w-full xl:w-auto">
          <div className="flex bg-slate-200 dark:bg-slate-800 p-1 rounded-2xl shadow-inner">
            {['all', 'sale', 'wanted'].map(type => (
              <button
                key={type}
                onClick={() => setActiveType(type as any)}
                className={`px-6 py-2 rounded-xl text-xs font-black capitalize transition-all ${activeType === type ? 'bg-white dark:bg-slate-700 shadow-xl text-green-600' : 'text-slate-500'
                  }`}
              >
                {type === 'all' ? 'All' : type === 'sale' ? 'Sale' : 'Wanted'}
              </button>
            ))}
          </div>
          <div className="flex bg-slate-200 dark:bg-slate-800 p-1 rounded-2xl shadow-inner">
            <button onClick={() => setViewMode('grid')} className={`p-2 rounded-xl ${viewMode === 'grid' ? 'bg-white dark:bg-slate-700 text-green-600' : 'text-slate-500'}`}><List size={20} /></button>
            <button onClick={() => setViewMode('map')} className={`p-2 rounded-xl ${viewMode === 'map' ? 'bg-white dark:bg-slate-700 text-green-600' : 'text-slate-500'}`}><MapIcon size={20} /></button>
          </div>
        </div>

        <button
          onClick={handleShowPostModal}
          className="w-full xl:w-auto bg-green-600 hover:bg-green-700 text-white font-black px-8 py-4 rounded-2xl shadow-2xl shadow-green-600/30 flex items-center justify-center gap-3 hover:scale-[1.02] active:scale-95 transition-all"
        >
          <Plus size={24} strokeWidth={3} /> Post New Listing
        </button>
      </div>

      <div className="flex bg-white dark:bg-slate-800 p-4 rounded-3xl shadow-sm border border-slate-100 dark:border-slate-700">
        <div className="w-12 h-12 flex items-center justify-center text-slate-400">
          <Search size={24} />
        </div>
        <input
          type="text"
          placeholder="Search by crop, fertilizer, region..."
          value={searchTerm}
          onChange={e => setSearchTerm(e.target.value)}
          className="flex-1 bg-transparent border-none outline-none font-bold text-slate-700 dark:text-slate-200"
        />
      </div>

      {viewMode === 'grid' ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {filtered.map(item => (
            <div
              key={item.id}
              className={`group flex flex-col p-8 rounded-[2.5rem] border transition-all hover:shadow-[0_20px_50px_rgba(0,0,0,0.1)] ${darkMode ? 'bg-slate-800 border-slate-700 hover:border-slate-500' : 'bg-white border-slate-100 hover:border-slate-300 shadow-sm'
                }`}
            >
              <div className="flex justify-between items-start mb-6">
                <span className={`px-4 py-1.5 rounded-full text-[10px] font-black uppercase tracking-[0.1em] ${item.type === 'sale' ? 'bg-green-100 text-green-700' : 'bg-amber-100 text-amber-700'
                  }`}>
                  {item.type}
                </span>
                <div className="text-green-600 font-black text-2xl tracking-tighter">{item.price}</div>
              </div>

              <h3 className="text-2xl font-black mb-3 leading-tight line-clamp-2 group-hover:text-green-600 transition-colors">{item.title}</h3>
              <p className={`text-sm mb-6 line-clamp-3 font-medium flex-1 ${darkMode ? 'text-slate-400' : 'text-slate-500'}`}>
                {item.description}
              </p>

              <div className="space-y-5 pt-6 border-t border-slate-100 dark:border-slate-700">
                <div className="flex items-center gap-3 text-[10px] font-black text-slate-400 uppercase tracking-widest">
                  <Tag size={14} className="text-green-600" /> {item.category}
                </div>
                <div className="flex items-center justify-between gap-4">
                  <div className="flex items-center gap-3 min-w-0">
                    <div className="w-12 h-12 rounded-full overflow-hidden bg-slate-100 dark:bg-slate-700 flex items-center justify-center text-lg font-black text-green-600 border border-slate-200 dark:border-slate-600 shadow-inner shrink-0">
                      {item.userProfileImage ? (
                        <img src={item.userProfileImage} alt={item.userName} className="w-full h-full object-cover" />
                      ) : (
                        item.userName.charAt(0)
                      )}
                    </div>
                    <div className="min-w-0">
                      <div className="text-sm font-black truncate">{item.userName}</div>
                      <div className="text-[10px] text-slate-400 font-bold flex items-center gap-1 uppercase tracking-tighter whitespace-nowrap">Farmer <Check size={10} className="text-green-600" /></div>
                    </div>
                  </div>
                  <div className="flex gap-2 shrink-0">
                    {item.userId === user?.id && (
                      <>
                        <button
                          onClick={() => handleEdit(item)}
                          className="bg-blue-50 text-blue-500 p-3 rounded-2xl hover:bg-blue-100 active:scale-90 transition-all border border-blue-100"
                          aria-label="Edit listing"
                        >
                          <Pencil size={18} />
                        </button>
                        <button
                          onClick={() => handleDelete(item.id)}
                          className="bg-red-50 text-red-500 p-3 rounded-2xl hover:bg-red-100 active:scale-90 transition-all border border-red-100"
                          aria-label="Delete listing"
                        >
                          <Trash2 size={18} />
                        </button>
                      </>
                    )}
                    <button
                      onClick={() => window.open(`tel:${item.contact}`)}
                      className="bg-green-600 text-white p-3 rounded-2xl shadow-xl shadow-green-600/20 hover:bg-green-700 active:scale-90 transition-all"
                      aria-label="Contact seller"
                    >
                      <MessageCircle size={18} />
                    </button>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className={`w-full aspect-video rounded-[3rem] border-4 border-dashed flex flex-col items-center justify-center text-center p-10 ${darkMode ? 'bg-slate-800 border-slate-700 text-slate-500' : 'bg-slate-50 border-slate-200 text-slate-400'}`}>
          <div className="w-24 h-24 rounded-full bg-slate-100 dark:bg-slate-700 flex items-center justify-center mb-6">
            <MapIcon size={48} />
          </div>
          <h3 className="text-2xl font-black">Interactive Supply Chain Map</h3>
          <p className="max-w-md mt-2 font-medium">Visualizing {filtered.length} active listings across Kumasi, Accra, and Tamale. Upgrade to Pro for real-time logistics tracking.</p>
          <div className="mt-8 flex gap-4">
            <div className="px-4 py-2 rounded-full bg-green-100 text-green-700 text-xs font-bold">24 Active in Ashanti</div>
            <div className="px-4 py-2 rounded-full bg-blue-100 text-blue-700 text-xs font-bold">12 Active in Greater Accra</div>
          </div>
        </div>
      )}

      {showPostModal && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-6 bg-black/70 backdrop-blur-md animate-in fade-in duration-300">
          <div className={`w-full max-w-4xl p-10 rounded-[3rem] shadow-2xl relative animate-in zoom-in duration-300 max-h-[95vh] overflow-y-auto custom-scrollbar ${darkMode ? 'bg-slate-900 border border-slate-800' : 'bg-white'}`}>
            <button onClick={() => { setShowPostModal(false); setIsEditing(false); setEditingId(null); }} className="absolute top-8 right-8 text-slate-400 hover:text-slate-600 transition-colors">
              <X size={32} />
            </button>
            <div className="flex flex-col items-center text-center mb-10">
              <div className="w-20 h-20 bg-green-100 text-green-600 rounded-[2rem] flex items-center justify-center mb-6 shadow-inner ring-8 ring-green-50/50">
                {isEditing ? <Pencil size={40} /> : <ShoppingBag size={40} />}
              </div>
              <h3 className="text-4xl font-black tracking-tighter">{isEditing ? 'Update Your Listing' : 'Post to Marketplace'}</h3>
              <p className="text-slate-500 font-medium mt-2">{isEditing ? 'Make changes to your active post.' : 'Reach thousands of buyers across the region.'}</p>
            </div>

            <form onSubmit={handlePost} className="grid grid-cols-1 lg:grid-cols-2 gap-10">
              <div className="space-y-6">
                <div className="space-y-2">
                  <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Listing Type</label>
                  <div className="grid grid-cols-2 gap-3">
                    <button type="button" onClick={() => setNewListing({ ...newListing, type: 'sale' })} className={`py-4 rounded-2xl font-black text-sm transition-all border-2 ${newListing.type === 'sale' ? 'bg-green-600 text-white border-green-400 shadow-lg shadow-green-600/20' : 'bg-slate-100 dark:bg-slate-800 text-slate-500 border-transparent'}`}>Selling</button>
                    <button type="button" onClick={() => setNewListing({ ...newListing, type: 'wanted' })} className={`py-4 rounded-2xl font-black text-sm transition-all border-2 ${newListing.type === 'wanted' ? 'bg-amber-500 text-white border-amber-300 shadow-lg shadow-amber-500/20' : 'bg-slate-100 dark:bg-slate-800 text-slate-500 border-transparent'}`}>Wanted</button>
                  </div>
                </div>

                <div className="space-y-2">
                  <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Produce/Item Title</label>
                  <input required value={newListing.title} onChange={e => setNewListing({ ...newListing, title: e.target.value })} className={`w-full px-6 py-5 rounded-[1.5rem] border-2 outline-none font-bold text-lg transition-all ${darkMode ? 'bg-slate-800 border-slate-700 focus:border-green-600' : 'bg-slate-50 border-slate-200 focus:border-green-600'}`} placeholder="e.g. 50 Bags of Organic Maize" />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Target Price</label>
                    <div className="relative">
                      <span className="absolute left-6 top-1/2 -translate-y-1/2 font-black text-green-600">GH₵</span>
                      <input
                        required
                        value={newListing.price}
                        onChange={e => setNewListing({ ...newListing, price: e.target.value })}
                        className={`w-full pl-16 pr-6 py-5 rounded-[1.5rem] border-2 outline-none font-black text-lg ${darkMode ? 'bg-slate-800 border-slate-700 focus:border-green-600' : 'bg-slate-50 border-slate-200 focus:border-green-600'}`}
                        placeholder="500"
                      />
                    </div>
                  </div>
                  <div className="space-y-2">
                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Category</label>
                    <select value={newListing.category} onChange={e => setNewListing({ ...newListing, category: e.target.value })} className={`w-full px-6 py-5 rounded-[1.5rem] border-2 outline-none appearance-none font-bold text-lg ${darkMode ? 'bg-slate-800 border-slate-700 focus:border-green-600' : 'bg-slate-50 border-slate-200 focus:border-green-600'}`}>
                      <option>Grain</option>
                      <option>Roots</option>
                      <option>Tubers</option>
                      <option>Inputs</option>
                      <option>Equipment</option>
                    </select>
                  </div>
                </div>
              </div>

              <div className="space-y-6">
                <div className="space-y-2">
                  <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Detailed Description</label>
                  <textarea required rows={5} value={newListing.description} onChange={e => setNewListing({ ...newListing, description: e.target.value })} className={`w-full px-6 py-5 rounded-[1.5rem] border-2 outline-none resize-none font-medium text-lg leading-relaxed ${darkMode ? 'bg-slate-800 border-slate-700 focus:border-green-600' : 'bg-slate-50 border-slate-200 focus:border-green-600'}`} placeholder="Describe quality, variety, and specifics..." />
                </div>

                <div className="space-y-2">
                  <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Direct Contact Number</label>
                  <div className="relative">
                    <Smartphone className="absolute left-6 top-1/2 -translate-y-1/2 text-slate-400" size={24} />
                    <input required value={newListing.contact} onChange={e => setNewListing({ ...newListing, contact: e.target.value })} className={`w-full pl-16 pr-6 py-5 rounded-[1.5rem] border-2 outline-none font-black text-lg ${darkMode ? 'bg-slate-800 border-slate-700 focus:border-green-600' : 'bg-slate-50 border-slate-200 focus:border-green-600'}`} placeholder="024 XXX XXXX" />
                  </div>
                </div>

                <div className="flex gap-4 pt-4">
                  <button
                    type="button"
                    onClick={() => { setShowPostModal(false); setIsEditing(false); setEditingId(null); }}
                    className={`flex-1 py-5 rounded-[1.5rem] font-black text-xl transition-all ${darkMode
                      ? 'bg-slate-800 text-slate-300 hover:bg-slate-700'
                      : 'bg-slate-100 text-slate-500 hover:bg-slate-200'
                      }`}
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="flex-[2] py-5 bg-green-600 text-white rounded-[1.5rem] font-black text-xl shadow-2xl shadow-green-600/30 hover:bg-green-700 hover:scale-[1.02] active:scale-95 transition-all"
                  >
                    {isEditing ? 'Update' : 'Post Now'}
                  </button>
                </div>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default Marketplace;
