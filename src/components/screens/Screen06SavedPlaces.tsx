import React, { useState, useEffect } from 'react';
import { Bookmark, FolderPlus, MapPin, ChevronRight } from 'lucide-react';
import { BottomNav } from '../BottomNav';
import { Discovery, Collection, ScreenId } from '../../types';
import { api } from '../../services/api';
import { BeyondImage } from '../BeyondImage';

interface Screen06Props {
  onNavigate: (screen: ScreenId, params?: any) => void;
}

export const Screen06SavedPlaces: React.FC<Screen06Props> = ({ onNavigate }) => {
  const [activeTab, setActiveTab] = useState<'Places' | 'Collections'>('Places');
  const [savedPlaces, setSavedPlaces] = useState<Discovery[]>([]);
  const [collections, setCollections] = useState<Collection[]>([]);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [newColName, setNewColName] = useState('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    setLoading(true);
    Promise.all([api.getSavedPlaces(), api.getCollections()])
      .then(([places, cols]) => {
        setSavedPlaces(places);
        setCollections(cols);
      })
      .finally(() => setLoading(false));
  }, []);

  const handleToggleSave = async (e: React.MouseEvent, id: string) => {
    e.stopPropagation();
    try {
      await api.toggleSave(id);
      setSavedPlaces((prev) => prev.filter((p) => p.id !== id));
    } catch (err) {
      console.error(err);
    }
  };

  const handleCreateCollection = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newColName.trim()) return;
    try {
      const created = await api.createCollection(newColName.trim());
      setCollections([...collections, created]);
      setNewColName('');
      setShowCreateModal(false);
    } catch (err) {
      console.error(err);
    }
  };

  return (
    <div className="relative w-full h-full flex flex-col justify-between bg-[#080E18] text-white overflow-hidden">
      {/* Top Header */}
      <div className="px-4 pt-3 pb-2 border-b border-[#142236] bg-[#080E18]/90 backdrop-blur-md z-20">
        <h1 className="text-base font-bold text-white font-display">Saved Places</h1>

        {/* Tabs: Places vs Collections */}
        <div className="flex items-center gap-6 mt-3 text-xs font-semibold">
          <button
            onClick={() => setActiveTab('Places')}
            className={`pb-2 relative cursor-pointer transition-colors ${
              activeTab === 'Places' ? 'text-white' : 'text-slate-400 hover:text-slate-300'
            }`}
          >
            <span>Places</span>
            {activeTab === 'Places' && (
              <div className="absolute bottom-0 inset-x-0 h-0.5 bg-[#00E599] rounded-full" />
            )}
          </button>

          <button
            onClick={() => setActiveTab('Collections')}
            className={`pb-2 relative cursor-pointer transition-colors ${
              activeTab === 'Collections' ? 'text-white' : 'text-slate-400 hover:text-slate-300'
            }`}
          >
            <span>Collections</span>
            {activeTab === 'Collections' && (
              <div className="absolute bottom-0 inset-x-0 h-0.5 bg-[#00E599] rounded-full" />
            )}
          </button>
        </div>
      </div>

      {/* Content Area */}
      <div className="flex-1 overflow-y-auto hide-scrollbar px-3 py-3 space-y-2.5">
        {loading ? (
          <div className="py-20 flex justify-center text-slate-400 text-xs">
            <div className="w-5 h-5 border-2 border-[#00E599] border-t-transparent rounded-full animate-spin" />
          </div>
        ) : activeTab === 'Places' ? (
          /* Places Tab List (matching Screen 06) */
          savedPlaces.length === 0 ? (
            <div className="py-16 text-center text-slate-400 text-xs">
              <Bookmark size={28} className="mx-auto mb-2 text-slate-500 opacity-60" />
              <p className="font-semibold text-slate-300">Your next adventure starts here.</p>
              <p className="mt-1">Bookmark discoveries you want to explore later.</p>
              <button
                onClick={() => onNavigate('screen_02_home_feed')}
                className="mt-4 px-4 py-1.5 rounded-full bg-[#00E599] text-[#080E18] font-bold text-xs"
              >
                Explore Feed
              </button>
            </div>
          ) : (
            savedPlaces.map((item) => (
              <div
                key={item.id}
                onClick={() => onNavigate('screen_04_place_details', { discoveryId: item.id })}
                className="bg-[#0B1525] border border-[#162438] rounded-2xl p-2.5 flex items-center gap-3 hover:border-[#1F334E] transition-all cursor-pointer group shadow-sm"
              >
                {/* Thumbnail */}
                <BeyondImage
                  src={item.imageUrl}
                  alt={item.title}
                  className="w-14 h-14 rounded-xl object-cover shrink-0 border border-white/10"
                />

                {/* Info */}
                <div className="flex-1 min-w-0">
                  <h3 className="text-xs font-bold text-white truncate font-display group-hover:text-[#00E599] transition-colors">
                    {item.title}
                  </h3>
                  <div className="text-[10px] text-slate-400 mt-0.5 truncate">
                    Mysuru • {item.distanceKm} km
                  </div>
                  <div className="mt-1">
                    <span className="px-2 py-0.5 rounded-full text-[9px] font-medium bg-[#112035] text-slate-300 border border-[#182C48]">
                      {item.categories[0]}
                    </span>
                  </div>
                </div>

                {/* Bookmark Toggle Icon */}
                <button
                  onClick={(e) => handleToggleSave(e, item.id)}
                  className="p-1.5 text-[#00E599] hover:opacity-80 transition-opacity cursor-pointer shrink-0"
                  aria-label="Remove saved"
                >
                  <Bookmark size={17} className="fill-[#00E599]" />
                </button>
              </div>
            ))
          )
        ) : (
          /* Collections Tab */
          <div>
            <div className="flex items-center justify-between mb-2">
              <span className="text-[11px] font-medium text-slate-400">Your Collections</span>
              <button
                onClick={() => setShowCreateModal(true)}
                className="flex items-center gap-1 text-[11px] font-semibold text-[#00E599] hover:underline cursor-pointer"
              >
                <FolderPlus size={13} />
                <span>+ New</span>
              </button>
            </div>

            <div className="grid grid-cols-2 gap-2.5">
              {collections.map((col) => (
                <div
                  key={col.id}
                  className="bg-[#0B1525] border border-[#162438] rounded-2xl overflow-hidden p-2.5 flex flex-col justify-between hover:border-[#00E599]/50 transition-all cursor-pointer group"
                >
                  <div className="relative aspect-video rounded-xl overflow-hidden bg-slate-900 mb-2">
                    <BeyondImage src={col.coverImageUrl} alt={col.name} className="w-full h-full object-cover" />
                    <div className="absolute inset-0 bg-black/30" />
                    <span className="absolute bottom-1 right-1.5 text-[9px] font-bold bg-black/60 px-1.5 py-0.5 rounded text-white">
                      {col.itemCount} places
                    </span>
                  </div>
                  <h4 className="text-xs font-bold text-white font-display truncate">{col.name}</h4>
                  <p className="text-[10px] text-slate-400 truncate mt-0.5">{col.description}</p>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Create Collection Modal */}
      {showCreateModal && (
        <div className="absolute inset-0 z-50 bg-black/75 backdrop-blur-sm flex items-center justify-center p-4">
          <form
            onSubmit={handleCreateCollection}
            className="w-full max-w-xs bg-[#0B1525] border border-[#182B46] rounded-2xl p-4 shadow-2xl"
          >
            <h3 className="text-sm font-bold text-white font-display mb-2">New Collection</h3>
            <input
              type="text"
              placeholder="e.g. Secret Sunset Spots"
              value={newColName}
              onChange={(e) => setNewColName(e.target.value)}
              className="w-full bg-[#0E1A2C] border border-[#182C48] rounded-xl px-3 py-2 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-[#00E599] mb-3"
            />
            <div className="flex items-center justify-end gap-2 text-xs font-semibold">
              <button
                type="button"
                onClick={() => setShowCreateModal(false)}
                className="px-3 py-1.5 text-slate-400 hover:text-white"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="px-4 py-1.5 rounded-full bg-[#00E599] text-[#080E18] font-bold"
              >
                Create
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Persistent Bottom Navigation */}
      <BottomNav currentScreen="screen_06_saved_places" onNavigate={onNavigate} />
    </div>
  );
};
