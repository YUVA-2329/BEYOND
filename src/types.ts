export interface Author {
  id: string;
  name: string;
  handle: string;
  avatarUrl: string;
  isFollowing?: boolean;
}

export interface UsefulInfo {
  bestTime: string;
  entryFee: string;
  crowdLevel: string;
}

export interface SpotlightReview {
  id: string;
  author: {
    name: string;
    handle: string;
    avatarUrl: string;
    badge: string;
  };
  rating: number;
  highlight: string;
  reviewText: string;
  timestamp: string;
}

export interface Discovery {
  id: string;
  title: string;
  location: string;
  distanceKm: number;
  coordinates: {
    lat: number;
    lng: number;
  };
  description: string;
  categories: string[];
  imageUrl: string;
  author: Author;
  createdAt: string;
  likesCount: number;
  commentsCount: number;
  isLiked: boolean;
  isSaved: boolean;
  isHiddenGem?: boolean;
  isFamous?: boolean;
  isNearby?: boolean;
  bearing?: number;
  bearingDirection?: string;
  usefulInfo?: UsefulInfo;
  spotlightReviews?: SpotlightReview[];
}

export interface Comment {
  id: string;
  discoveryId: string;
  author: {
    id: string;
    name: string;
    avatarUrl: string;
  };
  text: string;
  createdAt: string;
}

export interface Collection {
  id: string;
  name: string;
  description?: string;
  itemCount: number;
  coverImageUrl: string;
  discoveryIds: string[];
}

export interface UserProfile {
  id: string;
  name: string;
  handle: string;
  avatarUrl: string;
  bio: string;
  discoveriesCount: number;
  followersCount: number;
  followingCount: number;
  level: string;
  xp: number;
  nextLevelXp: number;
  isCurrentUser?: boolean;
}

export interface AchievementTier {
  id: string;
  level: number;
  title: string;
  badgeName: string;
  badgeColor: string;
  requiredXp: number;
  currentXp: number;
  status: 'unlocked' | 'in_progress' | 'locked';
  description: string;
}

export interface AIModelStatus {
  hardware: {
    gpu: string;
    vramGb: number;
    cpuCores: number;
    ramGb: number;
  };
  nlpStatus: string;
  embeddingEngine: string;
  visionStatus: string;
  offlineCapable: boolean;
  activeProvider: string;
}

export type ScreenId =
  | 'screen_01_splash_onboarding'
  | 'screen_02_home_feed'
  | 'screen_03_map_view'
  | 'screen_04_place_details'
  | 'screen_05_create_discovery'
  | 'screen_06_saved_places'
  | 'screen_07_user_profile'
  | 'screen_08_discoverer_levels'
  | 'screen_09_shareable_discovery_card'
  | 'screen_10_secondary_onboarding';

export type ViewMode = 'phone' | 'all_screens' | 'reference_compare' | 'responsive';
