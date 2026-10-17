import React from 'react';
import { Home, Compass, Plus, Bookmark, User } from 'lucide-react';
import { ScreenId } from '../types';

interface BottomNavProps {
  currentScreen: ScreenId;
  onNavigate: (screen: ScreenId) => void;
  isEditorUnlocked?: boolean;
  onPromptUnlock?: () => void;
}

export const BottomNav: React.FC<BottomNavProps> = ({
  currentScreen,
  onNavigate,
  isEditorUnlocked = false,
  onPromptUnlock,
}) => {
  const isHome = currentScreen === 'screen_02_home_feed';
  const isMap = currentScreen === 'screen_03_map_view';
  const isCreate = currentScreen === 'screen_05_create_discovery';
  const isSaved = currentScreen === 'screen_06_saved_places';
  const isProfile = currentScreen === 'screen_07_user_profile' || currentScreen === 'screen_08_discoverer_levels';

  const handleCreateClick = () => {
    if (!isEditorUnlocked && onPromptUnlock) {
      onPromptUnlock();
    } else {
      onNavigate('screen_05_create_discovery');
    }
  };

  return (
    <nav className="relative z-40 bg-[#0B1424]/95 backdrop-blur-md border-t border-[#182840] px-4 py-2 flex items-center justify-around select-none">
      {/* Home */}
      <button
        onClick={() => onNavigate('screen_02_home_feed')}
        className="flex flex-col items-center justify-center gap-1 w-12 py-1 transition-colors text-xs font-medium cursor-pointer"
        aria-label="Home Feed"
      >
        <Home
          size={20}
          className={isHome ? 'text-[#00E599]' : 'text-[#64748B] hover:text-[#94A3B8]'}
          strokeWidth={isHome ? 2.5 : 2}
        />
        <span className={`text-[10px] ${isHome ? 'text-[#00E599] font-semibold' : 'text-[#64748B]'}`}>
          Home
        </span>
      </button>

      {/* Map */}
      <button
        onClick={() => onNavigate('screen_03_map_view')}
        className="flex flex-col items-center justify-center gap-1 w-12 py-1 transition-colors text-xs font-medium cursor-pointer"
        aria-label="Interactive Map"
      >
        <Compass
          size={20}
          className={isMap ? 'text-[#00E599]' : 'text-[#64748B] hover:text-[#94A3B8]'}
          strokeWidth={isMap ? 2.5 : 2}
        />
        <span className={`text-[10px] ${isMap ? 'text-[#00E599] font-semibold' : 'text-[#64748B]'}`}>
          Map
        </span>
      </button>

      {/* Center Create Action (+) */}
      <button
        onClick={handleCreateClick}
        className="flex items-center justify-center -mt-3 w-11 h-11 rounded-full bg-[#00E599] text-[#080E18] shadow-lg shadow-[#00E599]/30 hover:bg-[#00C883] hover:scale-105 active:scale-95 transition-all cursor-pointer"
        aria-label="Create Discovery"
      >
        <Plus size={24} strokeWidth={2.8} />
      </button>

      {/* Saved */}
      <button
        onClick={() => onNavigate('screen_06_saved_places')}
        className="flex flex-col items-center justify-center gap-1 w-12 py-1 transition-colors text-xs font-medium cursor-pointer"
        aria-label="Saved Places"
      >
        <Bookmark
          size={20}
          className={isSaved ? 'text-[#00E599]' : 'text-[#64748B] hover:text-[#94A3B8]'}
          strokeWidth={isSaved ? 2.5 : 2}
          fill={isSaved ? 'currentColor' : 'none'}
        />
        <span className={`text-[10px] ${isSaved ? 'text-[#00E599] font-semibold' : 'text-[#64748B]'}`}>
          Saved
        </span>
      </button>

      {/* Profile */}
      <button
        onClick={() => onNavigate('screen_07_user_profile')}
        className="flex flex-col items-center justify-center gap-1 w-12 py-1 transition-colors text-xs font-medium cursor-pointer"
        aria-label="User Profile"
      >
        <User
          size={20}
          className={isProfile ? 'text-[#00E599]' : 'text-[#64748B] hover:text-[#94A3B8]'}
          strokeWidth={isProfile ? 2.5 : 2}
        />
        <span className={`text-[10px] ${isProfile ? 'text-[#00E599] font-semibold' : 'text-[#64748B]'}`}>
          Profile
        </span>
      </button>
    </nav>
  );
};
