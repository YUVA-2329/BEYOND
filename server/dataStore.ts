import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { Discovery, Comment, Collection, UserProfile, AchievementTier, AIModelStatus } from '../src/types';

const DATA_DIR = path.join(process.cwd(), 'data');
const STORE_FILE = path.join(DATA_DIR, 'beyond_store.json');

export interface Notification {
  id: string;
  type: 'like' | 'comment' | 'follow' | 'achievement' | 'level_up' | 'system';
  title: string;
  message: string;
  createdAt: string;
  read: boolean;
  avatarUrl?: string;
}

export interface UserAccount {
  id: string;
  name: string;
  handle: string;
  email: string;
  role: 'explorer' | 'curator' | 'admin';
  token: string;
  status: 'online' | 'inactive' | 'idle';
  lastActive: string;
  device?: string;
  ipAddress?: string;
  discoveriesCount?: number;
  xp?: number;
  avatarUrl?: string;
}

export function haversineDistanceKm(lat1: number, lon1: number, lat2: number, lon2: number): number {
  const R = 6371; // Earth's mean radius in km
  const dLat = ((lat2 - lat1) * Math.PI) / 180;
  const dLon = ((lon2 - lon1) * Math.PI) / 180;
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos((lat1 * Math.PI) / 180) * Math.cos((lat2 * Math.PI) / 180) *
    Math.sin(dLon / 2) * Math.sin(dLon / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return Math.round(R * c * 10) / 10;
}

export function calculateBearingDegrees(lat1: number, lon1: number, lat2: number, lon2: number): number {
  const φ1 = (lat1 * Math.PI) / 180;
  const φ2 = (lat2 * Math.PI) / 180;
  const Δλ = ((lon2 - lon1) * Math.PI) / 180;
  const y = Math.sin(Δλ) * Math.cos(φ2);
  const x = Math.cos(φ1) * Math.sin(φ2) - Math.sin(φ1) * Math.cos(φ2) * Math.cos(Δλ);
  const θ = Math.atan2(y, x);
  return Math.round(((θ * 180) / Math.PI + 360) % 360);
}

export function getBearingDirection(degrees: number): string {
  const dirs = ['N', 'NE', 'E', 'SE', 'S', 'SW', 'W', 'NW'];
  const idx = Math.round(degrees / 45) % 8;
  return dirs[idx];
}

export function sanitizeInput(input: string): string {
  if (typeof input !== 'string') return '';
  return input
    .replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, '')
    .replace(/<[^>]+>/g, '')
    .replace(/javascript:/gi, '')
    .replace(/onerror\s*=/gi, '')
    .replace(/onload\s*=/gi, '')
    .trim();
}

export const FAMOUS_DISCOVERIES: Discovery[] = [
  {
    id: 'famous-taj-mahal',
    title: 'Taj Mahal Royal Ivory Mausoleum',
    location: 'Agra, Uttar Pradesh, India',
    distanceKm: 1850.0,
    coordinates: { lat: 27.1751, lng: 78.0421 },
    description: 'UNESCO World Heritage masterpiece constructed of translucent white marble with symmetrical reflection pools, minarets, and Mughal calligraphy.',
    categories: ['Heritage', 'Landmark', 'Photography'],
    imageUrl: 'https://images.unsplash.com/photo-1564507592333-c60657eea523?w=800&auto=format&fit=crop&q=80',
    author: {
      id: 'world-heritage-foundation',
      name: 'World Heritage Curator',
      handle: '@world_wonders',
      avatarUrl: '/intro/assets/sarath_reddy_avatar.png',
      isFollowing: true,
    },
    createdAt: 'Verified World Wonder',
    likesCount: 14290,
    commentsCount: 1240,
    isLiked: true,
    isSaved: true,
    isHiddenGem: false,
    isFamous: true,
    usefulInfo: {
      bestTime: 'Sunrise (6:00 - 8:30 AM)',
      entryFee: '₹50 (Indians) / ₹1100 (Foreigners)',
      crowdLevel: 'High / Iconic',
    },
  },
  {
    id: 'famous-eiffel-tower',
    title: 'Eiffel Tower Celestial Iron Spire',
    location: 'Champ de Mars, Paris, France',
    distanceKm: 7600.0,
    coordinates: { lat: 48.8584, lng: 2.2945 },
    description: 'Iconic 330-meter wrought-iron lattice tower offering breathtaking 360-degree panoramic viewing decks across the Seine and Parisian skyline.',
    categories: ['Landmark', 'Viewpoint', 'Photography'],
    imageUrl: 'https://images.unsplash.com/photo-1511739001486-6bfe10ce785f?w=800&auto=format&fit=crop&q=80',
    author: {
      id: 'world-heritage-foundation',
      name: 'World Heritage Curator',
      handle: '@world_wonders',
      avatarUrl: '/intro/assets/sarath_reddy_avatar.png',
      isFollowing: true,
    },
    createdAt: 'Verified World Wonder',
    likesCount: 19850,
    commentsCount: 2104,
    isLiked: true,
    isSaved: true,
    isHiddenGem: false,
    isFamous: true,
    usefulInfo: {
      bestTime: 'Twilight (7:30 - 10:00 PM with sparkle)',
      entryFee: '€28.30 (Top Floor Lift)',
      crowdLevel: 'High',
    },
  },
  {
    id: 'famous-colosseum',
    title: 'Flavian Amphitheatre (Colosseum)',
    location: 'Piazza del Colosseo, Rome, Italy',
    distanceKm: 6950.0,
    coordinates: { lat: 41.8902, lng: 12.4922 },
    description: 'The largest ancient amphitheatre ever built, featuring monumental travertine limestone arches, subterranean hypogeum, and 2,000-year gladiatorial legacy.',
    categories: ['Heritage', 'Landmark', 'Architecture'],
    imageUrl: 'https://images.unsplash.com/photo-1552832230-c0197dd311b5?w=800&auto=format&fit=crop&q=80',
    author: {
      id: 'world-heritage-foundation',
      name: 'World Heritage Curator',
      handle: '@world_wonders',
      avatarUrl: '/intro/assets/sarath_reddy_avatar.png',
      isFollowing: true,
    },
    createdAt: 'Verified World Wonder',
    likesCount: 16400,
    commentsCount: 1580,
    isLiked: true,
    isSaved: true,
    isHiddenGem: false,
    isFamous: true,
    usefulInfo: {
      bestTime: 'Morning (8:30 - 11:00 AM)',
      entryFee: '€18 (Standard Admission)',
      crowdLevel: 'Moderate to High',
    },
  },
];

interface StoreData {
  discoveries: Discovery[];
  comments: Comment[];
  collections: Collection[];
  currentUser: UserProfile;
  achievements: AchievementTier[];
  xpTransactions: Array<{ id: string; action: string; xp: number; timestamp: string }>;
  notifications?: Notification[];
  users?: UserAccount[];
}

const INITIAL_DISCOVERIES: Discovery[] = [
  ...FAMOUS_DISCOVERIES,
  {
    id: 'golconda-fort-sunset',
    title: 'Golconda Fort Sunset Panorama',
    location: 'Hyderabad, Telangana',
    distanceKm: 4.2,
    coordinates: { lat: 17.3833, lng: 78.4011 },
    description: 'Breathtaking 360-degree sunset panorama over Hyderabad from the royal fortress ramparts and acoustic arches.',
    categories: ['Viewpoint', 'Heritage', 'Photography'],
    imageUrl: '/intro/assets/golconda_sunset.jpg',
    author: {
      id: 'sarath-reddy',
      name: 'Sarath Reddy',
      handle: '@sarath_reddy',
      avatarUrl: '/intro/assets/sarath_reddy_avatar.png',
      isFollowing: true,
    },
    createdAt: '1h ago',
    likesCount: 342,
    commentsCount: 48,
    isLiked: true,
    isSaved: true,
    isHiddenGem: true,
    usefulInfo: {
      bestTime: 'Sunset (5:00 - 6:30 PM)',
      entryFee: '₹25 (Indians)',
      crowdLevel: 'Moderate',
    },
  },
  {
    id: 'durgam-cheruvu-boardwalk',
    title: 'Durgam Cheruvu Secret Boardwalk',
    location: 'Hyderabad, Telangana',
    distanceKm: 2.1,
    coordinates: { lat: 17.4332, lng: 78.3846 },
    description: 'Tranquil wooden boardwalk wrapped around ancient granite boulders with views of the illuminated cable bridge.',
    categories: ['Nature', 'Viewpoint', 'Hangout'],
    imageUrl: '/intro/assets/durgam_cheruvu.jpg',
    author: {
      id: 'rohit-explorer',
      name: 'Rohit_Explorer',
      handle: '@rohit_explorer',
      avatarUrl: '/intro/assets/rohit_avatar.png',
      isFollowing: false,
    },
    createdAt: '3h ago',
    likesCount: 289,
    commentsCount: 31,
    isLiked: false,
    isSaved: true,
    isHiddenGem: true,
    usefulInfo: {
      bestTime: 'Evening (6:00 - 8:30 PM)',
      entryFee: 'Free',
      crowdLevel: 'Low on weekdays',
    },
  },
  {
    id: 'roastery-coffee-house',
    title: 'Roastery Coffee House Banjara Hills',
    location: 'Hyderabad, Telangana',
    distanceKm: 3.5,
    coordinates: { lat: 17.4168, lng: 78.4382 },
    description: 'Charming open-air courtyard bungalow cafe serving artisanal monsoon malabar brews surrounded by greenery.',
    categories: ['Cafés', 'Food', 'Hangout'],
    imageUrl: '/intro/assets/roastery_cafe.jpg',
    author: {
      id: 'vikram-eats',
      name: 'Vikram_Foodie',
      handle: '@vikram_eats',
      avatarUrl: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150',
      isFollowing: false,
    },
    createdAt: '5h ago',
    likesCount: 215,
    commentsCount: 22,
    isLiked: false,
    isSaved: false,
    isHiddenGem: false,
    usefulInfo: {
      bestTime: 'Twilight (4:30 - 7:30 PM)',
      entryFee: '₹700 for two',
      crowdLevel: 'Moderate',
    },
  },
  {
    id: 'nandi-hills-sunrise',
    title: 'Nandi Hills Cloud Peak',
    location: 'Bangalore, Karnataka',
    distanceKm: 18.4,
    coordinates: { lat: 13.3702, lng: 77.6835 },
    description: 'Legendary sea-of-clouds sunrise viewpoint perched at 4,851 feet over Karnataka misty hills.',
    categories: ['Viewpoint', 'Nature', 'Photography'],
    imageUrl: '/intro/assets/nandi_hills.jpg',
    author: {
      id: 'ananya-wild',
      name: 'Ananya_Wild',
      handle: '@ananya_wild',
      avatarUrl: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150',
      isFollowing: true,
    },
    createdAt: '6h ago',
    likesCount: 420,
    commentsCount: 56,
    isLiked: true,
    isSaved: true,
    isHiddenGem: false,
    usefulInfo: {
      bestTime: 'Sunrise (5:30 - 7:00 AM)',
      entryFee: '₹20',
      crowdLevel: 'High on weekends',
    },
  },
  {
    id: 'cubbon-park-bamboo',
    title: 'Cubbon Park Bamboo Pavilion',
    location: 'Bangalore, Karnataka',
    distanceKm: 1.8,
    coordinates: { lat: 12.9763, lng: 77.5929 },
    description: 'Secluded emerald bamboo sanctuary right in the heart of Bangalore for tranquil morning strolls.',
    categories: ['Nature', 'Hangout', 'Photography'],
    imageUrl: '/intro/assets/cubbon_park.jpg',
    author: {
      id: 'sarath-reddy',
      name: 'Sarath Reddy',
      handle: '@sarath_reddy',
      avatarUrl: '/intro/assets/sarath_reddy_avatar.png',
      isFollowing: true,
    },
    createdAt: '1d ago',
    likesCount: 310,
    commentsCount: 27,
    isLiked: false,
    isSaved: true,
    isHiddenGem: true,
    usefulInfo: {
      bestTime: 'Morning (6:00 - 9:00 AM)',
      entryFee: 'Free',
      crowdLevel: 'Low in bamboo section',
    },
  },
  {
    id: 'charminar-hyderabad',
    title: 'Charminar & Laad Bazaar Night Walk',
    location: 'Hyderabad, Telangana',
    distanceKm: 5.1,
    coordinates: { lat: 17.3616, lng: 78.4747 },
    description: 'The monumental heart of Hyderabad built in 1591, illuminated against the twilight sky with the bustling bangle and pearl bazaar below.',
    categories: ['Heritage', 'Photography', 'Hangout'],
    imageUrl: '/intro/assets/charminar_hyderabad.jpg',
    author: {
      id: 'sarath-reddy',
      name: 'Sarath Reddy',
      handle: '@sarath_reddy',
      avatarUrl: '/intro/assets/sarath_reddy_avatar.png',
      isFollowing: true,
    },
    createdAt: '2h ago',
    likesCount: 512,
    commentsCount: 64,
    isLiked: true,
    isSaved: true,
    isHiddenGem: false,
    usefulInfo: {
      bestTime: 'Twilight (6:00 - 9:30 PM)',
      entryFee: '₹25 (Indians)',
      crowdLevel: 'High / Vibrant',
    },
  },
  {
    id: 'hussain-sagar-buddha',
    title: 'Hussain Sagar Giant Buddha Sunset',
    location: 'Hyderabad, Telangana',
    distanceKm: 3.2,
    coordinates: { lat: 17.4239, lng: 78.4738 },
    description: 'World tallest monolithic stone statue of Gautama Buddha standing serenely on Gibraltar Rock in the center of the lake at sunset.',
    categories: ['Viewpoint', 'Heritage', 'Photography'],
    imageUrl: '/intro/assets/hussain_sagar.jpg',
    author: {
      id: 'ananya-wild',
      name: 'Ananya_Wild',
      handle: '@ananya_wild',
      avatarUrl: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150',
      isFollowing: true,
    },
    createdAt: '4h ago',
    likesCount: 388,
    commentsCount: 42,
    isLiked: false,
    isSaved: true,
    isHiddenGem: false,
    usefulInfo: {
      bestTime: 'Sunset (5:30 - 7:00 PM)',
      entryFee: '₹55 (Speedboat)',
      crowdLevel: 'Moderate',
    },
  },
  {
    id: 'bangalore-palace-royal',
    title: 'Bangalore Palace Royal Estate',
    location: 'Bangalore, Karnataka',
    distanceKm: 4.5,
    coordinates: { lat: 12.9988, lng: 77.5921 },
    description: '19th-century Tudor revival royal palace featuring wooden carvings, fortified towers, and manicured green grounds in Bengaluru.',
    categories: ['Heritage', 'Photography', 'Viewpoint'],
    imageUrl: '/intro/assets/bangalore_palace.jpg',
    author: {
      id: 'vikram-eats',
      name: 'Vikram_Foodie',
      handle: '@vikram_eats',
      avatarUrl: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150',
      isFollowing: false,
    },
    createdAt: '7h ago',
    likesCount: 450,
    commentsCount: 39,
    isLiked: false,
    isSaved: true,
    isHiddenGem: false,
    usefulInfo: {
      bestTime: 'Morning (10:00 AM - 1:00 PM)',
      entryFee: '₹250 (Indians)',
      crowdLevel: 'Moderate',
    },
  },
  {
    id: 'lalbagh-glass-house',
    title: 'Lalbagh Botanical Garden & Glass House',
    location: 'Bangalore, Karnataka',
    distanceKm: 3.8,
    coordinates: { lat: 12.9507, lng: 77.5848 },
    description: 'Historic 240-acre botanical paradise featuring the majestic Crystal Palace-inspired Victorian Glass House and exotic flora.',
    categories: ['Nature', 'Photography', 'Hangout'],
    imageUrl: '/intro/assets/lalbagh_glass_house.jpg',
    author: {
      id: 'rohit-explorer',
      name: 'Rohit_Explorer',
      handle: '@rohit_explorer',
      avatarUrl: '/intro/assets/rohit_avatar.png',
      isFollowing: false,
    },
    createdAt: '8h ago',
    likesCount: 495,
    commentsCount: 52,
    isLiked: true,
    isSaved: true,
    isHiddenGem: false,
    usefulInfo: {
      bestTime: 'Early Morning (6:00 - 9:00 AM)',
      entryFee: '₹30',
      crowdLevel: 'Moderate',
    },
  },
  {
    id: 'mysore-palace-grand',
    title: 'Mysore Palace 97,000 Lights Illumination',
    location: 'Mysuru, Karnataka',
    distanceKm: 2.4,
    coordinates: { lat: 12.3051, lng: 76.6551 },
    description: 'Indo-Saracenic royal seat of the Wadiyar dynasty, illuminated in pure gold by 97,000 incandescent bulbs reflecting off the courtyard fountains.',
    categories: ['Heritage', 'Photography', 'Viewpoint'],
    imageUrl: '/intro/assets/mysore_palace.jpg',
    author: {
      id: 'sarath-reddy',
      name: 'Sarath Reddy',
      handle: '@sarath_reddy',
      avatarUrl: '/intro/assets/sarath_reddy_avatar.png',
      isFollowing: true,
    },
    createdAt: '1d ago',
    likesCount: 680,
    commentsCount: 94,
    isLiked: true,
    isSaved: true,
    isHiddenGem: false,
    usefulInfo: {
      bestTime: 'Sunday Evening (7:00 - 8:00 PM)',
      entryFee: '₹100 (Indians)',
      crowdLevel: 'Spectacular',
    },
  },
  {
    id: 'chamundi-hills-viewpoint',
    title: 'Chamundi Hills Viewpoint',
    location: 'Mysuru, Karnataka',
    distanceKm: 1.2,
    coordinates: { lat: 12.2743, lng: 76.6710 },
    description: 'Peaceful spot with an amazing view of Mysuru city. Best during sunset 🌅',
    categories: ['Viewpoint', 'Nature', 'Photography'],
    imageUrl: '/intro/assets/chamundi_hills_sunset.png',
    author: {
      id: 'rohit-explorer',
      name: 'Rohit_Explorer',
      handle: '@rohit_explorer',
      avatarUrl: '/intro/assets/rohit_avatar.png',
      isFollowing: false,
    },
    createdAt: '2h ago',
    likesCount: 248,
    commentsCount: 32,
    isLiked: false,
    isSaved: true,
    isHiddenGem: true,
    usefulInfo: {
      bestTime: 'Sunset (4:30 - 6:30 PM)',
      entryFee: 'Free',
      crowdLevel: 'Low (on weekdays)',
    },
  },
  {
    id: 'millers-46',
    title: 'Millers 46',
    location: 'Mysuru, Karnataka',
    distanceKm: 2.8,
    coordinates: { lat: 12.3118, lng: 76.6529 },
    description: 'Steakhouse and vintage dining experience with warm rustic ambiance and artisanal sizzlers.',
    categories: ['Food', 'Hangout'],
    imageUrl: '/intro/assets/millers_46.png',
    author: {
      id: 'sarath-reddy',
      name: 'Sarath Reddy',
      handle: '@sarath_reddy',
      avatarUrl: '/intro/assets/sarath_reddy_avatar.png',
      isFollowing: true,
    },
    createdAt: '5h ago',
    likesCount: 184,
    commentsCount: 19,
    isLiked: true,
    isSaved: true,
    isHiddenGem: false,
    usefulInfo: {
      bestTime: 'Dinner (7:00 - 10:30 PM)',
      entryFee: '₹800 for two',
      crowdLevel: 'Moderate',
    },
  },
  {
    id: 'ranganathittu-bird-sanctuary',
    title: 'Ranganathittu Bird Sanctuary',
    location: 'Mysuru, Karnataka',
    distanceKm: 12.4,
    coordinates: { lat: 12.4241, lng: 76.6853 },
    description: 'Lush islands on the Kaveri river home to painted storks, crocodiles, and serene morning boat rides.',
    categories: ['Nature', 'Adventure', 'Photography'],
    imageUrl: '/intro/assets/bird_sanctuary.png',
    author: {
      id: 'ananya-wild',
      name: 'Ananya_Wild',
      handle: '@ananya_wild',
      avatarUrl: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150',
      isFollowing: false,
    },
    createdAt: '1d ago',
    likesCount: 312,
    commentsCount: 45,
    isLiked: false,
    isSaved: true,
    isHiddenGem: true,
    usefulInfo: {
      bestTime: 'Morning (6:30 - 9:00 AM)',
      entryFee: '₹100 (Boating ₹150)',
      crowdLevel: 'Moderate on weekends',
    },
  },
  {
    id: 'the-vintage-cafe',
    title: 'The Vintage Cafe',
    location: 'Mysuru, Karnataka',
    distanceKm: 3.1,
    coordinates: { lat: 12.3050, lng: 76.6430 },
    description: 'Cozy artisanal coffee sanctuary with vintage books, cold brews, and tranquil background jazz.',
    categories: ['Cafés', 'Hangout', 'Food'],
    imageUrl: '/intro/assets/vintage_cafe.png',
    author: {
      id: 'vikram-eats',
      name: 'Vikram_Foodie',
      handle: '@vikram_eats',
      avatarUrl: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150',
      isFollowing: false,
    },
    createdAt: '2d ago',
    likesCount: 142,
    commentsCount: 14,
    isLiked: false,
    isSaved: true,
    isHiddenGem: false,
    usefulInfo: {
      bestTime: 'Afternoons (2:00 - 6:00 PM)',
      entryFee: 'Free entry',
      crowdLevel: 'Low',
    },
  },
  {
    id: 'brindavan-gardens',
    title: 'Brindavan Gardens',
    location: 'Mysuru, Karnataka',
    distanceKm: 14.2,
    coordinates: { lat: 12.4257, lng: 76.5746 },
    description: 'Terraced botanical gardens adjoining the Krishnarajasagara dam with illuminated musical fountains.',
    categories: ['Viewpoint', 'Nature', 'Heritage'],
    imageUrl: '/intro/assets/brindavan_gardens.png',
    author: {
      id: 'priya-travels',
      name: 'Priya_Travels',
      handle: '@priya_travels',
      avatarUrl: 'https://images.unsplash.com/photo-1517841905240-472988babdf9?w=150',
      isFollowing: true,
    },
    createdAt: '3d ago',
    likesCount: 275,
    commentsCount: 28,
    isLiked: true,
    isSaved: true,
    isHiddenGem: false,
    usefulInfo: {
      bestTime: 'Evening (5:30 - 8:00 PM)',
      entryFee: '₹50',
      crowdLevel: 'High during light show',
    },
  },
  {
    id: 'kukkarahalli-lake',
    title: 'Kukkarahalli Lake Trail',
    location: 'Mysuru, Karnataka',
    distanceKm: 2.0,
    coordinates: { lat: 12.3080, lng: 76.6340 },
    description: '3.8km perimeter walk lined with shaded eucalyptus trees and resting migratory waterbirds.',
    categories: ['Nature', 'Hangout'],
    imageUrl: 'https://images.unsplash.com/photo-1476514525535-07fb3b4ae5f1?w=800',
    author: {
      id: 'sarath-reddy',
      name: 'Sarath Reddy',
      handle: '@sarath_reddy',
      avatarUrl: '/intro/assets/sarath_reddy_avatar.png',
      isFollowing: true,
    },
    createdAt: '4d ago',
    likesCount: 198,
    commentsCount: 12,
    isLiked: false,
    isSaved: false,
    isHiddenGem: true,
    usefulInfo: {
      bestTime: 'Early Morning (6:00 - 8:30 AM)',
      entryFee: 'Free',
      crowdLevel: 'Moderate (Joggers)',
    },
  },
  {
    id: 'st-philomenas',
    title: "St. Philomena's Cathedral Spires",
    location: 'Mysuru, Karnataka',
    distanceKm: 3.5,
    coordinates: { lat: 12.3210, lng: 76.6575 },
    description: 'Majestic Neo-Gothic cathedral with 175-foot twin spires reminiscent of the Cologne Cathedral in Germany.',
    categories: ['Heritage', 'Photography'],
    imageUrl: 'https://images.unsplash.com/photo-1548013146-72479768bada?w=800',
    author: {
      id: 'rohit-explorer',
      name: 'Rohit_Explorer',
      handle: '@rohit_explorer',
      avatarUrl: '/intro/assets/rohit_avatar.png',
      isFollowing: false,
    },
    createdAt: '5d ago',
    likesCount: 220,
    commentsCount: 16,
    isLiked: false,
    isSaved: false,
    isHiddenGem: false,
    usefulInfo: {
      bestTime: 'Morning (8:00 - 11:00 AM)',
      entryFee: 'Free',
      crowdLevel: 'Moderate',
    },
  },
];

const INITIAL_COMMENTS: Comment[] = [
  {
    id: 'comm-golconda-1',
    discoveryId: 'golconda-fort-sunset',
    author: {
      id: 'sarath-reddy',
      name: 'Sarath Reddy',
      avatarUrl: '/intro/assets/sarath_reddy_avatar.png',
    },
    text: 'Climbed up for sunset yesterday. The breeze through the Baradari pavilion is unmatched in Hyderabad!',
    createdAt: '2h ago',
  },
  {
    id: 'comm-golconda-2',
    discoveryId: 'golconda-fort-sunset',
    author: {
      id: 'rohit-explorer',
      name: 'Rohit_Explorer',
      avatarUrl: '/intro/assets/rohit_avatar.png',
    },
    text: 'Acoustics at Fateh Darwaza blew my mind. Make sure to wear good shoes, those 380 granite stairs are steep.',
    createdAt: '5h ago',
  },
  {
    id: 'comm-durgam-1',
    discoveryId: 'durgam-cheruvu-boardwalk',
    author: {
      id: 'ananya-wild',
      name: 'Ananya_Wild',
      avatarUrl: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150',
    },
    text: 'The evening reflection of the illuminated cable bridge in the water is so serene. Best spot for a twilight walk.',
    createdAt: '3h ago',
  },
  {
    id: 'comm-durgam-2',
    discoveryId: 'durgam-cheruvu-boardwalk',
    author: {
      id: 'sarath-reddy',
      name: 'Sarath Reddy',
      avatarUrl: '/intro/assets/sarath_reddy_avatar.png',
    },
    text: 'Very well maintained boardwalk. Grab a hot filter coffee from the artisan stall right before sunset.',
    createdAt: '7h ago',
  },
  {
    id: 'comm-roastery-1',
    discoveryId: 'roastery-coffee-house',
    author: {
      id: 'vikram-eats',
      name: 'Vikram_Foodie',
      avatarUrl: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150',
    },
    text: 'Their cold brew and cranberry iced coffee are perfection. Courtyard seating under the trees is top tier.',
    createdAt: '4h ago',
  },
  {
    id: 'comm-roastery-2',
    discoveryId: 'roastery-coffee-house',
    author: {
      id: 'rohit-explorer',
      name: 'Rohit_Explorer',
      avatarUrl: '/intro/assets/rohit_avatar.png',
    },
    text: 'Pet friendly with very polite staff. Go on weekdays around 4 PM to get garden tables without waiting.',
    createdAt: '1d ago',
  },
  {
    id: 'comm-nandi-1',
    discoveryId: 'nandi-hills-sunrise',
    author: {
      id: 'sarath-reddy',
      name: 'Sarath Reddy',
      avatarUrl: '/intro/assets/sarath_reddy_avatar.png',
    },
    text: 'Fog rolls right over the cliff around 6 AM! Bring a light jacket, it gets surprisingly chilly.',
    createdAt: '6h ago',
  },
  {
    id: 'comm-nandi-2',
    discoveryId: 'nandi-hills-sunrise',
    author: {
      id: 'ananya-wild',
      name: 'Ananya_Wild',
      avatarUrl: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150',
    },
    text: 'The drive up the hairpin bends in the morning mist is breathtaking. Leave Bangalore by 4:00 AM.',
    createdAt: '1d ago',
  },
  {
    id: 'comm-cubbon-1',
    discoveryId: 'cubbon-park-bamboo',
    author: {
      id: 'rohit-explorer',
      name: 'Rohit_Explorer',
      avatarUrl: '/intro/assets/rohit_avatar.png',
    },
    text: 'So quiet you can hear birds chirping in the middle of Bangalore. The bamboo pavilion is pure zen.',
    createdAt: '8h ago',
  },
  {
    id: 'comm-cubbon-2',
    discoveryId: 'cubbon-park-bamboo',
    author: {
      id: 'sarath-reddy',
      name: 'Sarath Reddy',
      avatarUrl: '/intro/assets/sarath_reddy_avatar.png',
    },
    text: 'Perfect for reading a book or morning meditation. The Sunday morning car-free hours are bliss.',
    createdAt: '1d ago',
  },
  {
    id: 'comm-charminar-1',
    discoveryId: 'charminar-hyderabad',
    author: {
      id: 'vikram-eats',
      name: 'Vikram_Foodie',
      avatarUrl: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150',
    },
    text: 'Nimrah cafe right across the road serves the best Irani chai. Watching the minarets light up at night is magical.',
    createdAt: '2h ago',
  },
  {
    id: 'comm-charminar-2',
    discoveryId: 'charminar-hyderabad',
    author: {
      id: 'sarath-reddy',
      name: 'Sarath Reddy',
      avatarUrl: '/intro/assets/sarath_reddy_avatar.png',
    },
    text: 'The pearl and bangle shops in Laad Bazaar are buzzing with life. Don’t forget to bargain politely!',
    createdAt: '5h ago',
  },
  {
    id: 'comm-hussain-1',
    discoveryId: 'hussain-sagar-buddha',
    author: {
      id: 'ananya-wild',
      name: 'Ananya_Wild',
      avatarUrl: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150',
    },
    text: 'The speedboat ride to the statue takes only 10 minutes. Standing right underneath the monolithic Buddha is awe-inspiring.',
    createdAt: '3h ago',
  },
  {
    id: 'comm-blr-palace-1',
    discoveryId: 'bangalore-palace-royal',
    author: {
      id: 'rohit-explorer',
      name: 'Rohit_Explorer',
      avatarUrl: '/intro/assets/rohit_avatar.png',
    },
    text: 'The audio guide is fantastic! Felt like walking through Windsor Castle right here in Bangalore.',
    createdAt: '1d ago',
  },
  {
    id: 'comm-lalbagh-1',
    discoveryId: 'lalbagh-glass-house',
    author: {
      id: 'sarath-reddy',
      name: 'Sarath Reddy',
      avatarUrl: '/intro/assets/sarath_reddy_avatar.png',
    },
    text: 'The London Crystal Palace replica is spectacular. Early morning 6 AM walkers get in free!',
    createdAt: '12h ago',
  },
  {
    id: 'comm-mysore-palace-1',
    discoveryId: 'mysore-palace-grand',
    author: {
      id: 'ananya-wild',
      name: 'Ananya_Wild',
      avatarUrl: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150',
    },
    text: 'Seeing all 97,000 bulbs switch on simultaneously on Sunday evening gave me literal goosebumps!',
    createdAt: '1d ago',
  },
  {
    id: 'comm-chamundi-1',
    discoveryId: 'chamundi-hills-viewpoint',
    author: {
      id: 'sarath-reddy',
      name: 'Sarath Reddy',
      avatarUrl: '/intro/assets/sarath_reddy_avatar.png',
    },
    text: 'The evening view from the steps is surreal! Highly recommend reaching around 5:15 PM.',
    createdAt: '1h ago',
  },
  {
    id: 'comm-chamundi-2',
    discoveryId: 'chamundi-hills-viewpoint',
    author: {
      id: 'ananya-wild',
      name: 'Ananya_Wild',
      avatarUrl: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150',
    },
    text: 'Great photography spot! No filters needed with that golden hour light.',
    createdAt: '45m ago',
  },
  {
    id: 'comm-millers-1',
    discoveryId: 'millers-46',
    author: {
      id: 'vikram-eats',
      name: 'Vikram_Foodie',
      avatarUrl: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150',
    },
    text: 'Classic sizzlers and vintage rock decor. Best steakhouse vibe in Mysuru.',
    createdAt: '4h ago',
  },
  {
    id: 'comm-ranganathittu-1',
    discoveryId: 'ranganathittu-bird-sanctuary',
    author: {
      id: 'ananya-wild',
      name: 'Ananya_Wild',
      avatarUrl: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150',
    },
    text: 'Saw painted storks and marsh crocodiles within 5 meters of our boat! The guide was very knowledgeable.',
    createdAt: '1d ago',
  },
  {
    id: 'comm-vintage-cafe-1',
    discoveryId: 'the-vintage-cafe',
    author: {
      id: 'vikram-eats',
      name: 'Vikram_Foodie',
      avatarUrl: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150',
    },
    text: 'Vintage vinyl records playing in the background while sipping hand-poured pour-over. 10/10 aesthetic.',
    createdAt: '6h ago',
  },
  {
    id: 'comm-brindavan-1',
    discoveryId: 'brindavan-gardens',
    author: {
      id: 'sarath-reddy',
      name: 'Sarath Reddy',
      avatarUrl: '/intro/assets/sarath_reddy_avatar.png',
    },
    text: 'The musical fountain show against the illuminated KRS dam wall at 7 PM is nostalgic and grand.',
    createdAt: '2d ago',
  },
  {
    id: 'comm-kukkarahalli-1',
    discoveryId: 'kukkarahalli-lake',
    author: {
      id: 'rohit-explorer',
      name: 'Rohit_Explorer',
      avatarUrl: '/intro/assets/rohit_avatar.png',
    },
    text: '3.8 km walking perimeter surrounded by towering trees and migratory pelicans. Mysuru’s hidden lung.',
    createdAt: '1d ago',
  },
  {
    id: 'comm-philomenas-1',
    discoveryId: 'st-philomenas',
    author: {
      id: 'ananya-wild',
      name: 'Ananya_Wild',
      avatarUrl: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150',
    },
    text: 'The underground catacomb crypt and German stained glass depicting the stations of the cross are breathtaking.',
    createdAt: '3d ago',
  },
];

const INITIAL_COLLECTIONS: Collection[] = [
  {
    id: 'col-weekend-escapes',
    name: 'Weekend Escapes',
    description: 'Scenic drives and tranquil getaways within 30km',
    itemCount: 3,
    coverImageUrl: '/intro/assets/bird_sanctuary.png',
    discoveryIds: ['ranganathittu-bird-sanctuary', 'brindavan-gardens', 'chamundi-hills-viewpoint'],
  },
  {
    id: 'col-sunset-locations',
    name: 'Sunset Locations',
    description: 'The golden hour panorama spots of Mysuru',
    itemCount: 2,
    coverImageUrl: '/intro/assets/chamundi_hills_sunset.png',
    discoveryIds: ['chamundi-hills-viewpoint', 'kukkarahalli-lake'],
  },
  {
    id: 'col-hidden-cafes',
    name: 'Hidden Cafés',
    description: 'Quiet coffee nooks with great ambient work desks',
    itemCount: 2,
    coverImageUrl: '/intro/assets/vintage_cafe.png',
    discoveryIds: ['the-vintage-cafe', 'millers-46'],
  },
  {
    id: 'col-photography-spots',
    name: 'Photography Spots',
    description: 'Frame-worthy landmarks, viewpoints and architectural gems',
    itemCount: 3,
    coverImageUrl: '/intro/assets/chamundi_hills_sunset.png',
    discoveryIds: ['chamundi-hills-viewpoint', 'st-philomenas', 'ranganathittu-bird-sanctuary'],
  },
];

const INITIAL_USER: UserProfile = {
  id: 'sarath-reddy',
  name: 'Sarath Reddy',
  handle: '@sarath_reddy',
  avatarUrl: '/intro/assets/sarath_reddy_avatar.png',
  bio: 'Exploring my city, one hidden place at a time. 🧭',
  discoveriesCount: 12,
  followersCount: 248,
  followingCount: 56,
  level: 'Local Scout',
  xp: 120,
  nextLevelXp: 500,
  isCurrentUser: true,
};

const INITIAL_ACHIEVEMENTS: AchievementTier[] = [
  {
    id: 'tier-1-explorer',
    level: 1,
    title: 'Explorer',
    badgeName: 'Silver Shield Compass',
    badgeColor: '#94A3B8',
    requiredXp: 50,
    currentXp: 50,
    status: 'unlocked',
    description: 'First steps into the wild. Published 1 discovery.',
  },
  {
    id: 'tier-2-local-scout',
    level: 2,
    title: 'Local Scout',
    badgeName: 'Glowing Mint Star Shield',
    badgeColor: '#00E599',
    requiredXp: 500,
    currentXp: 120,
    status: 'in_progress',
    description: 'Active discoverer with verified local contributions.',
  },
  {
    id: 'tier-3-hidden-gem-hunter',
    level: 3,
    title: 'Hidden Gem Hunter',
    badgeName: 'Amethyst Crystal Emblem',
    badgeColor: '#A855F7',
    requiredXp: 1000,
    currentXp: 120,
    status: 'locked',
    description: 'Discovered 5 unmapped viewpoints or secret neighborhood spots.',
  },
  {
    id: 'tier-4-city-expert',
    level: 4,
    title: 'City Expert',
    badgeName: 'Imperial Amber Crest',
    badgeColor: '#F59E0B',
    requiredXp: 2000,
    currentXp: 120,
    status: 'locked',
    description: 'Top-tier regional knowledge, trusted by hundreds of explorers.',
  },
  {
    id: 'tier-5-verified-contributor',
    level: 5,
    title: 'Verified Contributor',
    badgeName: 'Cyan Star of Distinction',
    badgeColor: '#38BDF8',
    requiredXp: 5000,
    currentXp: 120,
    status: 'locked',
    description: 'Earned by consistent useful contributions and community curation.',
  },
];

class BeyondStore {
  private data: StoreData;

  constructor() {
    this.data = this.loadData();
  }

  private loadData(): StoreData {
    try {
      if (!fs.existsSync(DATA_DIR)) {
        fs.mkdirSync(DATA_DIR, { recursive: true });
      }
      if (fs.existsSync(STORE_FILE)) {
        const raw = fs.readFileSync(STORE_FILE, 'utf-8');
        const parsed: StoreData = JSON.parse(raw);
        let updated = false;
        for (const fam of FAMOUS_DISCOVERIES) {
          if (!parsed.discoveries.some((d) => d.id === fam.id)) {
            parsed.discoveries.unshift(fam);
            updated = true;
          }
        }
        if (updated) {
          this.saveData(parsed);
        }
        return parsed;
      }
    } catch (e) {
      console.warn('Failed to load store, initializing defaults:', e);
    }
    const initial: StoreData = {
      discoveries: INITIAL_DISCOVERIES,
      comments: INITIAL_COMMENTS,
      collections: INITIAL_COLLECTIONS,
      currentUser: INITIAL_USER,
      achievements: INITIAL_ACHIEVEMENTS,
      xpTransactions: [
        { id: 'tx-1', action: 'Account Creation', xp: 50, timestamp: '3d ago' },
        { id: 'tx-2', action: 'Published Millers 46 Discovery', xp: 40, timestamp: '5h ago' },
        { id: 'tx-3', action: 'Earned 10 Community Likes', xp: 30, timestamp: '2h ago' },
      ],
    };
    this.saveData(initial);
    return initial;
  }

  private saveData(data: StoreData) {
    try {
      if (!fs.existsSync(DATA_DIR)) {
        fs.mkdirSync(DATA_DIR, { recursive: true });
      }
      fs.writeFileSync(STORE_FILE, JSON.stringify(data, null, 2), 'utf-8');
    } catch (e) {
      console.error('Error saving data store:', e);
    }
  }

  public getDiscoveries(category?: string, query?: string, lat?: number, lng?: number, radiusKm?: number): Discovery[] {
    let list = this.data.discoveries;
    if (category && category !== 'All') {
      const target = category.toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '');
      list = list.filter((d) =>
        d.categories.some((c) => {
          const normC = c.toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '');
          return normC === target || c.toLowerCase() === category.toLowerCase();
        })
      );
    }
    if (query && query.trim()) {
      const q = query.toLowerCase();
      list = list.filter(
        (d) =>
          d.title.toLowerCase().includes(q) ||
          d.description.toLowerCase().includes(q) ||
          d.location.toLowerCase().includes(q) ||
          d.categories.some((c) => c.toLowerCase().includes(q))
      );
    }
    if (lat !== undefined && lng !== undefined && !isNaN(lat) && !isNaN(lng)) {
      list = list.map((d) => {
        const dist = haversineDistanceKm(lat, lng, d.coordinates.lat, d.coordinates.lng);
        return { ...d, distanceKm: dist };
      });
      if (radiusKm !== undefined && !isNaN(radiusKm)) {
        list = list.filter((d) => d.distanceKm <= radiusKm);
      }
      list.sort((a, b) => a.distanceKm - b.distanceKm);
    }
    return list;
  }

  public getDiscoveryById(id: string): Discovery | undefined {
    return this.data.discoveries.find((d) => d.id === id);
  }

  public getFamousPlaces(lat: number = 12.2958, lng: number = 76.6394): Discovery[] {
    const famousIds = ['famous-taj-mahal', 'famous-eiffel-tower', 'famous-colosseum'];
    return this.data.discoveries
      .filter((d) => d.isFamous || famousIds.includes(d.id))
      .slice(0, 3)
      .map((d) => {
        const dist = haversineDistanceKm(lat, lng, d.coordinates.lat, d.coordinates.lng);
        const deg = calculateBearingDegrees(lat, lng, d.coordinates.lat, d.coordinates.lng);
        return {
          ...d,
          distanceKm: dist,
          bearing: deg,
          bearingDirection: getBearingDirection(deg),
          isFamous: true,
        };
      });
  }

  public getNearbyPlaces(lat: number = 12.2958, lng: number = 76.6394, radiusKm: number = 25): Discovery[] {
    const famousIds = ['famous-taj-mahal', 'famous-eiffel-tower', 'famous-colosseum'];
    const nonFamous = this.data.discoveries.filter(
      (d) => !d.isFamous && !famousIds.includes(d.id)
    );
    const withDist = nonFamous.map((d) => {
      const dist = haversineDistanceKm(lat, lng, d.coordinates.lat, d.coordinates.lng);
      const deg = calculateBearingDegrees(lat, lng, d.coordinates.lat, d.coordinates.lng);
      return {
        ...d,
        distanceKm: dist,
        bearing: deg,
        bearingDirection: getBearingDirection(deg),
        isNearby: true,
      };
    });
    withDist.sort((a, b) => a.distanceKm - b.distanceKm);
    return withDist.slice(0, 3);
  }

  public getRadarPack(lat: number = 12.2958, lng: number = 76.6394, radiusKm: number = 15): {
    famousPlaces: Discovery[];
    nearbyPlaces: Discovery[];
    allHits: Discovery[];
    metadata: {
      center: { lat: number; lng: number };
      radiusKm: number;
      accuracyMeters: number;
      scannedCount: number;
      timestamp: string;
    };
  } {
    const famousPlaces = this.getFamousPlaces(lat, lng);
    const nearbyPlaces = this.getNearbyPlaces(lat, lng, radiusKm);
    return {
      famousPlaces,
      nearbyPlaces,
      allHits: [...nearbyPlaces, ...famousPlaces],
      metadata: {
        center: { lat, lng },
        radiusKm,
        accuracyMeters: 50,
        scannedCount: famousPlaces.length + nearbyPlaces.length,
        timestamp: new Date().toISOString(),
      },
    };
  }

  public createDiscovery(newDiscovery: Omit<Discovery, 'id' | 'createdAt' | 'likesCount' | 'commentsCount' | 'isLiked' | 'isSaved'>): Discovery {
    const id = `disc-${Date.now()}`;
    const discovery: Discovery = {
      ...newDiscovery,
      id,
      createdAt: 'Just now',
      likesCount: 0,
      commentsCount: 0,
      isLiked: false,
      isSaved: false,
    };
    this.data.discoveries.unshift(discovery);
    this.data.currentUser.discoveriesCount += 1;
    this.awardXp('Published a new discovery', 50);
    this.saveData(this.data);
    return discovery;
  }

  public toggleLike(id: string): { isLiked: boolean; likesCount: number } | null {
    const discovery = this.data.discoveries.find((d) => d.id === id);
    if (!discovery) return null;
    discovery.isLiked = !discovery.isLiked;
    discovery.likesCount += discovery.isLiked ? 1 : -1;
    if (discovery.isLiked) {
      this.awardXp('Liked a discovery', 5);
    }
    this.saveData(this.data);
    return { isLiked: discovery.isLiked, likesCount: discovery.likesCount };
  }

  public toggleSave(id: string): { isSaved: boolean } | null {
    const discovery = this.data.discoveries.find((d) => d.id === id);
    if (!discovery) return null;
    discovery.isSaved = !discovery.isSaved;
    if (discovery.isSaved) {
      this.awardXp('Saved a place to collection', 10);
    }
    this.saveData(this.data);
    return { isSaved: discovery.isSaved };
  }

  public getSavedPlaces(): Discovery[] {
    return this.data.discoveries.filter((d) => d.isSaved);
  }

  public getCollections(): Collection[] {
    return this.data.collections;
  }

  public createCollection(name: string, description?: string): Collection {
    const newCol: Collection = {
      id: `col-${Date.now()}`,
      name,
      description: description || 'Personal exploration collection',
      itemCount: 0,
      coverImageUrl: '/intro/assets/chamundi_hills_sunset.png',
      discoveryIds: [],
    };
    this.data.collections.push(newCol);
    this.saveData(this.data);
    return newCol;
  }

  public addDiscoveryToCollection(collectionId: string, discoveryId: string): boolean {
    const col = this.data.collections.find((c) => c.id === collectionId);
    if (!col || col.discoveryIds.includes(discoveryId)) return false;
    col.discoveryIds.push(discoveryId);
    col.itemCount = col.discoveryIds.length;
    this.saveData(this.data);
    return true;
  }

  public getComments(discoveryId: string): Comment[] {
    return this.data.comments.filter((c) => c.discoveryId === discoveryId);
  }

  public addComment(discoveryId: string, text: string): Comment {
    const comment: Comment = {
      id: `comment-${Date.now()}`,
      discoveryId,
      author: {
        id: this.data.currentUser.id,
        name: this.data.currentUser.name,
        avatarUrl: this.data.currentUser.avatarUrl,
      },
      text: sanitizeInput(text),
      createdAt: 'Just now',
    };
    this.data.comments.unshift(comment);
    const disc = this.data.discoveries.find((d) => d.id === discoveryId);
    if (disc) {
      disc.commentsCount += 1;
    }
    this.awardXp('Contributed local comment', 15);
    this.saveData(this.data);
    return comment;
  }

  public getCurrentUser(): UserProfile {
    return this.data.currentUser;
  }

  public updateProfile(updates: Partial<UserProfile>): UserProfile {
    this.data.currentUser = { ...this.data.currentUser, ...updates };
    this.saveData(this.data);
    return this.data.currentUser;
  }

  public toggleFollow(authorId: string): { isFollowing: boolean; followersCount: number } {
    let authorName = authorId;
    let isFollowing = false;
    this.data.discoveries.forEach((d) => {
      if (d.author.id === authorId) {
        d.author.isFollowing = !d.author.isFollowing;
        isFollowing = !!d.author.isFollowing;
        authorName = d.author.name;
      }
    });
    if (isFollowing) {
      this.awardXp(`Followed explorer ${authorName}`, 10);
    }
    this.saveData(this.data);
    return { isFollowing, followersCount: isFollowing ? 249 : 248 };
  }

  public getAchievements(): { achievements: AchievementTier[]; currentUser: UserProfile; transactions: any[] } {
    return {
      achievements: this.data.achievements,
      currentUser: this.data.currentUser,
      transactions: this.data.xpTransactions,
    };
  }

  public awardXp(action: string, xp: number): void {
    this.data.currentUser.xp += xp;
    this.data.xpTransactions.unshift({
      id: `tx-${Date.now()}`,
      action,
      xp,
      timestamp: 'Just now',
    });

    // Check level progression
    const xpTotal = this.data.currentUser.xp;
    this.data.achievements.forEach((tier) => {
      if (xpTotal >= tier.requiredXp) {
        tier.status = 'unlocked';
        tier.currentXp = tier.requiredXp;
      } else if (tier.status !== 'unlocked') {
        tier.currentXp = xpTotal;
        tier.status = 'in_progress';
      }
    });

    if (xpTotal >= 500 && this.data.currentUser.level === 'Local Scout') {
      this.data.currentUser.level = 'Hidden Gem Hunter';
      this.data.currentUser.nextLevelXp = 1000;
    }

    this.saveData(this.data);
  }

  public deleteDiscovery(id: string): boolean {
    const idx = this.data.discoveries.findIndex((d) => d.id === id);
    if (idx === -1) return false;
    this.data.discoveries.splice(idx, 1);
    this.saveData(this.data);
    return true;
  }

  public deleteComment(id: string): boolean {
    const idx = this.data.comments.findIndex((c) => c.id === id);
    if (idx === -1) return false;
    const comment = this.data.comments[idx];
    this.data.comments.splice(idx, 1);
    const disc = this.data.discoveries.find((d) => d.id === comment.discoveryId);
    if (disc && disc.commentsCount > 0) {
      disc.commentsCount -= 1;
    }
    this.saveData(this.data);
    return true;
  }

  public getNotifications(): Notification[] {
    return this.data.notifications || [
      {
        id: 'notif-welcome',
        type: 'system',
        title: 'Welcome to BEYOND!',
        message: 'Discover hidden places and become the reason others discover them.',
        createdAt: '1d ago',
        read: true,
      },
    ];
  }

  public addNotification(type: Notification['type'], title: string, message: string, avatarUrl?: string): Notification {
    if (!this.data.notifications) this.data.notifications = [];
    const notif: Notification = {
      id: `notif-${Date.now()}-${Math.floor(Math.random() * 1000)}`,
      type,
      title: sanitizeInput(title),
      message: sanitizeInput(message),
      createdAt: 'Just now',
      read: false,
      avatarUrl,
    };
    this.data.notifications.unshift(notif);
    this.saveData(this.data);
    return notif;
  }

  public markNotificationsRead(): boolean {
    if (!this.data.notifications) this.data.notifications = [];
    this.data.notifications.forEach((n) => {
      n.read = true;
    });
    this.saveData(this.data);
    return true;
  }

  public getUserByToken(token: string): UserAccount | null {
    if (!token) return null;
    const cleanToken = token.replace(/^Bearer\s+/i, '').trim();

    // Check dynamic users (e.g. Google / Supabase sessions)
    const users = this.getUsers();
    const match = users.find((u) => u.token === cleanToken || u.id === cleanToken);
    if (match) return match;

    if (cleanToken === 'token_sarath_reddy_12345' || cleanToken === 'token_test_explorer') {
      return {
        id: 'sarath-reddy',
        name: 'Sarath Reddy',
        handle: '@sarath_reddy',
        email: 'sarath@beyond.app',
        role: 'explorer',
        token: cleanToken,
        status: 'online',
        lastActive: 'Just now',
        device: 'macOS Safari / Apple Glass',
        ipAddress: '127.0.0.1',
        discoveriesCount: 12,
        xp: 120,
        avatarUrl: '/intro/assets/sarath_reddy_avatar.png',
      };
    }
    if (cleanToken === 'token_admin_999') {
      return {
        id: 'admin-curator',
        name: 'BEYOND Administrator',
        handle: '@admin',
        email: 'admin@beyond.app',
        role: 'admin',
        token: cleanToken,
        status: 'online',
        lastActive: 'Just now',
        device: 'Apple Silicon Admin Workstation',
        ipAddress: '127.0.0.1',
        discoveriesCount: 24,
        xp: 9999,
        avatarUrl: '/intro/assets/sarath_reddy_avatar.png',
      };
    }
    return null;
  }

  public authenticate(emailOrHandle: string, _password?: string): { token: string; user: UserAccount } {
    if (emailOrHandle.toLowerCase().includes('sarath') || emailOrHandle === '@sarath_reddy' || emailOrHandle === 'sarath@beyond.app') {
      return {
        token: 'token_sarath_reddy_12345',
        user: {
          id: 'sarath-reddy',
          name: 'Sarath Reddy',
          handle: '@sarath_reddy',
          email: 'sarath@beyond.app',
          role: 'explorer',
          token: 'token_sarath_reddy_12345',
          status: 'online',
          lastActive: 'Just now',
          device: 'macOS Safari / Apple Glass',
          ipAddress: '127.0.0.1',
          discoveriesCount: 12,
          xp: 120,
          avatarUrl: '/intro/assets/sarath_reddy_avatar.png',
        },
      };
    }
    if (emailOrHandle.toLowerCase().includes('admin')) {
      return {
        token: 'token_admin_999',
        user: {
          id: 'admin-curator',
          name: 'BEYOND Administrator',
          handle: '@admin',
          email: 'admin@beyond.app',
          role: 'admin',
          token: 'token_admin_999',
          status: 'online',
          lastActive: 'Just now',
          device: 'Apple Silicon Admin Workstation',
          ipAddress: '127.0.0.1',
          discoveriesCount: 24,
          xp: 9999,
          avatarUrl: '/intro/assets/sarath_reddy_avatar.png',
        },
      };
    }
    const token = `token_${Date.now()}`;
    return {
      token,
      user: {
        id: `user-${Date.now()}`,
        name: emailOrHandle.split('@')[0],
        handle: `@${emailOrHandle.split('@')[0]}`,
        email: emailOrHandle,
        role: 'explorer',
        token,
        status: 'online',
        lastActive: 'Just now',
        device: 'Web Client',
        ipAddress: '127.0.0.1',
        discoveriesCount: 0,
        xp: 100,
      },
    };
  }

  public getUsers(): UserAccount[] {
    if (!this.data.users || this.data.users.length === 0) {
      this.data.users = [
        {
          id: 'admin-curator',
          name: 'BEYOND Administrator',
          handle: '@admin',
          email: 'admin@beyond.app',
          role: 'admin',
          token: 'token_admin_999',
          status: 'online',
          lastActive: 'Just now',
          device: 'macOS Sequoia • Safari 18',
          ipAddress: '127.0.0.1',
          discoveriesCount: 17,
          xp: 23865,
          avatarUrl: '/intro/assets/sarath_reddy_avatar.png',
        },
        {
          id: 'sarath-reddy',
          name: 'Sarath Reddy',
          handle: '@sarath_reddy',
          email: 'sarath@beyond.app',
          role: 'explorer',
          token: 'token_sarath_reddy_12345',
          status: 'online',
          lastActive: '2m ago',
          device: 'iPhone 16 Pro • BEYOND iOS',
          ipAddress: '49.207.210.45 (Hyderabad)',
          discoveriesCount: 6,
          xp: 1420,
          avatarUrl: '/intro/assets/sarath_reddy_avatar.png',
        },
        {
          id: 'rohit-explorer',
          name: 'Rohit_Explorer',
          handle: '@rohit_explorer',
          email: 'rohit@beyond.app',
          role: 'curator',
          token: 'token_rohit_777',
          status: 'online',
          lastActive: '8m ago',
          device: 'Pixel 9 Pro • Chrome Mobile',
          ipAddress: '157.48.19.112 (Bangalore)',
          discoveriesCount: 4,
          xp: 980,
          avatarUrl: '/intro/assets/rohit_avatar.png',
        },
        {
          id: 'ananya-wild',
          name: 'Ananya_Wild',
          handle: '@ananya_wild',
          email: 'ananya@nature.org',
          role: 'curator',
          token: 'token_ananya_333',
          status: 'idle',
          lastActive: '2h ago',
          device: 'MacBook Air • Safari',
          ipAddress: '106.51.72.18 (Mysuru)',
          discoveriesCount: 3,
          xp: 650,
          avatarUrl: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150',
        },
        {
          id: 'vikram-eats',
          name: 'Vikram_Foodie',
          handle: '@vikram_eats',
          email: 'vikram@foodie.in',
          role: 'explorer',
          token: 'token_vikram_888',
          status: 'inactive',
          lastActive: '4 days ago',
          device: 'Windows 11 • Edge',
          ipAddress: '117.216.54.89 (Hyderabad)',
          discoveriesCount: 2,
          xp: 320,
          avatarUrl: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150',
        },
        {
          id: 'priya-travels',
          name: 'Priya_Travels',
          handle: '@priya_travels',
          email: 'priya@travels.com',
          role: 'explorer',
          token: 'token_priya_555',
          status: 'inactive',
          lastActive: '2 weeks ago',
          device: 'iPad Pro • Safari',
          ipAddress: '182.73.12.90 (Bangalore)',
          discoveriesCount: 1,
          xp: 210,
          avatarUrl: 'https://images.unsplash.com/photo-1517841905240-472988babdf9?w=150',
        },
        {
          id: 'ghost-stale-1',
          name: 'Old_Stale_Explorer',
          handle: '@stale_explorer',
          email: 'stale99@tempmail.com',
          role: 'explorer',
          token: 'token_stale_11',
          status: 'inactive',
          lastActive: '38 days ago',
          device: 'Android 11 • Old Chrome',
          ipAddress: '14.139.12.3',
          discoveriesCount: 0,
          xp: 50,
        },
        {
          id: 'ghost-stale-2',
          name: 'Inactive_Bot_404',
          handle: '@bot404',
          email: 'abandoned@trashmail.org',
          role: 'explorer',
          token: 'token_stale_22',
          status: 'inactive',
          lastActive: '62 days ago',
          device: 'Linux x86_64 • Headless',
          ipAddress: '185.220.101.5',
          discoveriesCount: 0,
          xp: 10,
        },
      ];
      this.saveData(this.data);
    }
    return this.data.users;
  }

  public deleteUser(id: string): boolean {
    const users = this.getUsers();
    const idx = users.findIndex((u) => u.id === id);
    if (idx === -1) return false;
    users.splice(idx, 1);
    this.data.users = users;
    this.saveData(this.data);
    return true;
  }

  public purgeInactiveUsers(): { purgedCount: number; remainingCount: number; purgedUsers: UserAccount[] } {
    const users = this.getUsers();
    const inactiveUsers = users.filter((u) => u.status === 'inactive' && u.role !== 'admin');
    const remainingUsers = users.filter((u) => u.status !== 'inactive' || u.role === 'admin');
    this.data.users = remainingUsers;
    this.saveData(this.data);
    return {
      purgedCount: inactiveUsers.length,
      remainingCount: remainingUsers.length,
      purgedUsers: inactiveUsers,
    };
  }

  public setUserRole(id: string, role: 'admin' | 'curator' | 'explorer'): UserAccount | null {
    const users = this.getUsers();
    const u = users.find((user) => user.id === id);
    if (!u) return null;
    u.role = role;
    this.saveData(this.data);
    return u;
  }

  public setUserStatus(id: string, status: 'online' | 'inactive' | 'idle'): UserAccount | null {
    const users = this.getUsers();
    const u = users.find((user) => user.id === id);
    if (!u) return null;
    u.status = status;
    u.lastActive = status === 'online' ? 'Just now' : u.lastActive;
    this.saveData(this.data);
    return u;
  }

  public recordUserSession(payload: { email: string; name?: string; avatarUrl?: string; role?: 'admin' | 'curator' | 'explorer' }): UserAccount {
    const users = this.getUsers();
    let existing = users.find((u) => u.email.toLowerCase() === payload.email.toLowerCase());
    if (existing) {
      existing.status = 'online';
      existing.lastActive = 'Just now';
      if (payload.name) existing.name = payload.name;
      if (payload.avatarUrl) existing.avatarUrl = payload.avatarUrl;
      this.saveData(this.data);
      return existing;
    }
    const newUser: UserAccount = {
      id: `usr_fb_${Date.now()}`,
      name: payload.name || payload.email.split('@')[0],
      handle: `@${payload.email.split('@')[0].toLowerCase().replace(/[^a-z0-9]/g, '_')}`,
      email: payload.email,
      role: payload.role || 'explorer',
      token: `token_fb_${Date.now()}`,
      status: 'online',
      lastActive: 'Just now',
      device: 'Web Client • Google Firebase',
      ipAddress: 'Active Session',
      discoveriesCount: 0,
      xp: 100,
      avatarUrl: payload.avatarUrl || '/intro/assets/rohit_avatar.png',
    };
    users.unshift(newUser);
    this.data.users = users;
    this.saveData(this.data);
    return newUser;
  }
}

export const store = new BeyondStore();
