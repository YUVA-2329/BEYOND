import React, { useState, useEffect } from 'react';
import { ArrowLeft, QrCode, Shield, ChevronRight, LogOut, LogIn } from 'lucide-react';
import { BottomNav } from '../BottomNav';
import { UserProfile, Discovery, ScreenId } from '../../types';
import { api } from '../../services/api';
import { useAuth } from '../../contexts/AuthContext';
import { BeyondImage } from '../BeyondImage';

interface Screen07Props {
  onNavigate: (screen: ScreenId, params?: any) => void;
  onOpenAuth?: () => void;
}

export const Screen07UserProfile: React.FC<Screen07Props> = ({ onNavigate, onOpenAuth }) => {
  const { user: authUser, profile: authProfile, isAuthenticated, logout } = useAuth();
  const [user, setUser] = useState<UserProfile | null>(null);
  const [activeTab, setActiveTab] = useState<'Posts' | 'Saved'>('Posts');
  const [discoveries, setDiscoveries] = useState<Discovery[]>([]);
  const [isEditingBio, setIsEditingBio] = useState(false);
  const [bioText, setBioText] = useState('');

  useEffect(() => {
    if (authProfile) {
      setUser(authProfile);
      setBioText(authProfile.bio);
    } else {
      api.getProfile().then((u) => {
        setUser(u);
        setBioText(u.bio);
      });
    }
    api.getDiscoveries().then((d) => setDiscoveries(d));
  }, [authProfile]);

  const handleSaveBio = async () => {
    if (!user) return;
    try {
      const updated = await api.updateProfile({ bio: bioText });
      setUser(updated);
      setIsEditingBio(false);
    } catch (err) {
      console.error(err);
    }
  };

  if (!user) {
    return (
      <div className="w-full h-full flex items-center justify-center bg-[#080E18] text-white">
        <div className="w-6 h-6 border-2 border-[#00E599] border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div className="relative w-full h-full flex flex-col justify-between bg-[#080E18] text-white overflow-hidden">
      {/* Top Header */}
      <div className="px-4 pt-3 pb-2 flex items-center justify-between border-b border-[#142236] bg-[#080E18]/90 backdrop-blur-md z-20">
        <button
          onClick={() => onNavigate('screen_02_home_feed')}
          className="p-1 rounded-full hover:bg-white/10 transition-colors cursor-pointer"
          aria-label="Back"
        >
          <ArrowLeft size={18} />
        </button>

        <button
          onClick={() => onNavigate('screen_09_shareable_discovery_card')}
          className="p-1.5 rounded-full hover:bg-white/10 text-slate-300 transition-colors cursor-pointer"
          aria-label="Share QR"
        >
          <QrCode size={18} />
        </button>
      </div>

      {/* Profile Body */}
      <div className="flex-1 overflow-y-auto hide-scrollbar px-4 py-3">
        {/* Avatar & User Details */}
        <div className="flex flex-col items-center text-center">
          <div className="relative">
            <BeyondImage
              src={user.avatarUrl}
              alt={user.name}
              isAvatar={true}
              className="w-20 h-20 rounded-full object-cover border-2 border-[#00E599] shadow-lg shadow-[#00E599]/20"
            />
            <div className="absolute -bottom-1 -right-1 bg-[#00E599] text-[#080E18] p-1 rounded-full shadow">
              <Shield size={12} strokeWidth={2.5} />
            </div>
          </div>

          <h1 className="text-base font-bold text-white font-display mt-2">{user.name}</h1>
          <p className="text-xs text-slate-400 font-medium">{user.handle}</p>

          {/* Bio */}
          {isEditingBio ? (
            <div className="mt-2 w-full max-w-xs">
              <input
                type="text"
                value={bioText}
                onChange={(e) => setBioText(e.target.value)}
                className="w-full bg-[#0E1A2C] border border-[#16273F] rounded-lg px-2.5 py-1 text-xs text-white focus:outline-none focus:border-[#00E599]"
              />
              <div className="flex justify-center gap-2 mt-1.5">
                <button
                  onClick={() => setIsEditingBio(false)}
                  className="text-[10px] text-slate-400 hover:text-white"
                >
                  Cancel
                </button>
                <button
                  onClick={handleSaveBio}
                  className="text-[10px] text-[#00E599] font-bold"
                >
                  Save
                </button>
              </div>
            </div>
          ) : (
            <p className="mt-2 text-xs text-slate-300 italic max-w-xs leading-relaxed">
              "{user.bio}"
            </p>
          )}

          {/* Stats Bar */}
          <div className="flex items-center justify-around w-full max-w-xs mt-4 py-2 border-y border-[#142236]">
            <div>
              <div className="text-sm font-extrabold text-white font-display">
                {user.discoveriesCount}
              </div>
              <div className="text-[10px] text-slate-400 font-medium">Discoveries</div>
            </div>
            <div className="w-px h-6 bg-[#162438]" />
            <div>
              <div className="text-sm font-extrabold text-white font-display">
                {user.followersCount}
              </div>
              <div className="text-[10px] text-slate-400 font-medium">Followers</div>
            </div>
            <div className="w-px h-6 bg-[#162438]" />
            <div>
              <div className="text-sm font-extrabold text-white font-display">
                {user.followingCount}
              </div>
              <div className="text-[10px] text-slate-400 font-medium">Following</div>
            </div>
          </div>

          {/* Actions: Edit Profile & Auth */}
          <div className="flex items-center gap-2 mt-3">
            <button
              onClick={() => setIsEditingBio(!isEditingBio)}
              className="px-4 py-1.5 rounded-full bg-[#0B1525] border border-[#182A44] text-xs font-semibold text-slate-200 hover:bg-[#122238] transition-colors cursor-pointer"
            >
              Edit Bio
            </button>

            {isAuthenticated ? (
              <button
                onClick={logout}
                className="px-3 py-1.5 rounded-full bg-rose-500/10 border border-rose-500/30 text-rose-300 hover:bg-rose-500/20 text-xs font-semibold transition-colors cursor-pointer flex items-center gap-1.5"
              >
                <LogOut size={12} />
                <span>Sign Out</span>
              </button>
            ) : (
              <button
                onClick={onOpenAuth}
                className="px-3.5 py-1.5 rounded-full bg-[#00E599]/15 border border-[#00E599]/40 text-[#00E599] hover:bg-[#00E599]/25 text-xs font-bold transition-colors cursor-pointer flex items-center gap-1.5"
              >
                <LogIn size={12} />
                <span>Sign In</span>
              </button>
            )}
          </div>
        </div>

        {/* Discoverer Level Card (Screen 08 Teaser) */}
        <div
          onClick={() => onNavigate('screen_08_discoverer_levels')}
          className="mt-4 bg-[#0B1525] border border-[#182A44] rounded-2xl p-3 flex items-center justify-between hover:border-[#00E599]/60 transition-all cursor-pointer group shadow-sm"
        >
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-[#00E599]/15 border border-[#00E599]/30 flex items-center justify-center text-[#00E599] shrink-0">
              <Shield size={20} strokeWidth={2.5} />
            </div>
            <div>
              <div className="text-[10px] text-slate-400 font-medium">Discoverer Level</div>
              <div className="text-xs font-bold text-white font-display flex items-center gap-1.5">
                <span>🛡️ {user.level}</span>
              </div>
              {/* Progress bar */}
              <div className="mt-1 flex items-center gap-2">
                <div className="w-24 h-1.5 bg-[#142338] rounded-full overflow-hidden">
                  <div
                    className="h-full bg-[#00E599] rounded-full transition-all duration-500"
                    style={{ width: `${(user.xp / user.nextLevelXp) * 100}%` }}
                  />
                </div>
                <span className="text-[10px] text-slate-400">
                  {user.xp} / {user.nextLevelXp} XP
                </span>
              </div>
            </div>
          </div>

          <ChevronRight size={16} className="text-slate-400 group-hover:text-white transition-colors" />
        </div>

        {/* Tabs: Posts vs Saved */}
        <div className="mt-5">
          <div className="flex items-center gap-6 border-b border-[#142236] text-xs font-semibold pb-2">
            <button
              onClick={() => setActiveTab('Posts')}
              className={`relative cursor-pointer transition-colors ${
                activeTab === 'Posts' ? 'text-white' : 'text-slate-400 hover:text-slate-300'
              }`}
            >
              <span>Posts</span>
              {activeTab === 'Posts' && (
                <div className="absolute -bottom-2 inset-x-0 h-0.5 bg-[#00E599] rounded-full" />
              )}
            </button>

            <button
              onClick={() => setActiveTab('Saved')}
              className={`relative cursor-pointer transition-colors ${
                activeTab === 'Saved' ? 'text-white' : 'text-slate-400 hover:text-slate-300'
              }`}
            >
              <span>Saved</span>
              {activeTab === 'Saved' && (
                <div className="absolute -bottom-2 inset-x-0 h-0.5 bg-[#00E599] rounded-full" />
              )}
            </button>
          </div>

          {/* Discovery Gallery Photo Grid */}
          <div className="grid grid-cols-3 gap-1.5 mt-3">
            {discoveries.map((item) => (
              <div
                key={item.id}
                onClick={() => onNavigate('screen_04_place_details', { discoveryId: item.id })}
                className="relative aspect-square rounded-xl overflow-hidden bg-slate-900 border border-white/5 cursor-pointer group"
              >
                <BeyondImage
                  src={item.imageUrl}
                  alt={item.title}
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                />
                <div className="absolute inset-0 bg-black/20 group-hover:bg-transparent transition-colors" />
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Persistent Bottom Navigation */}
      <BottomNav currentScreen="screen_07_user_profile" onNavigate={onNavigate} />
    </div>
  );
};
