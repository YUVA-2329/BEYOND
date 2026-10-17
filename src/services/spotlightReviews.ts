import { SpotlightReview } from '../types';

export const SPOTLIGHT_REVIEWS_BY_PLACE: Record<string, [SpotlightReview, SpotlightReview, SpotlightReview]> = {
  'charminar-hyderabad': [
    {
      id: 'rev-charminar-1',
      author: {
        name: 'Dr. Zafar Qutb',
        handle: '@qutb_heritage',
        avatarUrl: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150',
        badge: '👑 Deccan Architectural Historian',
      },
      rating: 5.0,
      highlight: 'Sufi Proportions & Minaret Symmetry',
      reviewText: 'The 1591 stucco craftsmanship along the upper arcades represents the pinnacle of Indo-Islamic geometry. Climb to the southwest archway at twilight to watch the lime-mortar relief absorb the golden hour.',
      timestamp: 'Yesterday',
    },
    {
      id: 'rev-charminar-2',
      author: {
        name: 'Mirza Farooq',
        handle: '@old_city_scout',
        avatarUrl: '/intro/assets/sarath_reddy_avatar.png',
        badge: '🛡️ Master City Scout',
      },
      rating: 4.9,
      highlight: 'Secret Laad Bazaar Tea Spot',
      reviewText: 'Skip the primary tourist perimeter; turn into Choodi Bazaar toward Nimrah Cafe. Order their Irani chai and Osmania biscuits while enjoying the unobstructed silhouette of all four minarets.',
      timestamp: '3 days ago',
    },
    {
      id: 'rev-charminar-3',
      author: {
        name: 'Amina Sultana',
        handle: '@amina_photos',
        avatarUrl: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150',
        badge: '📸 Verified Heritage Photographer',
      },
      rating: 5.0,
      highlight: 'Blue Hour Illumination Contrast',
      reviewText: 'Night illumination turns on promptly at 6:45 PM. The tungsten spotlights against a deep sapphire sky provide extraordinary dynamic range for high-contrast architectural framing.',
      timestamp: '1 week ago',
    },
  ],
  'golconda-fort-sunset': [
    {
      id: 'rev-golconda-1',
      author: {
        name: 'Prof. Raghavendra Joshi',
        handle: '@raghav_forts',
        avatarUrl: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=150',
        badge: '👑 Kakatiya & Qutb Shahi Scholar',
      },
      rating: 5.0,
      highlight: 'Acoustic Engineering of Fateh Darwaza',
      reviewText: 'The hand-clap acoustic dome at the Balahissar entrance is not folklore—it is parabolic acoustic physics. A single palm strike resounds 1 kilometer upward to the royal pavilion.',
      timestamp: '2 days ago',
    },
    {
      id: 'rev-golconda-2',
      author: {
        name: 'Sarath Reddy',
        handle: '@sarath_reddy',
        avatarUrl: '/intro/assets/sarath_reddy_avatar.png',
        badge: '🛡️ Chief Discovery Curator',
      },
      rating: 5.0,
      highlight: '360° Deccan Plateau Horizon',
      reviewText: 'Climb the 380 granite stairs to the Baradari before 5:15 PM. You get the Hyderabad cybernetic skyline to the east and the ancient granite hills stretching into the golden sun to the west.',
      timestamp: '4 days ago',
    },
    {
      id: 'rev-golconda-3',
      author: {
        name: 'Divya Sen',
        handle: '@divya_treks',
        avatarUrl: 'https://images.unsplash.com/photo-1517841905240-472988babdf9?w=150',
        badge: '⭐ Elite Trail Explorer',
      },
      rating: 4.8,
      highlight: 'Wind Tunnel Breeze at Summit',
      reviewText: 'Bring water in a metal canteen. The wind that rushes through the high stone arches as temperature drops at sunset is rejuvenating and completely blocks city noise.',
      timestamp: '1 week ago',
    },
  ],
  'mysore-palace-grand': [
    {
      id: 'rev-mysore-1',
      author: {
        name: 'Maharaja Heritage Trust',
        handle: '@wadiyar_archives',
        avatarUrl: '/intro/assets/rohit_avatar.png',
        badge: '👑 Royal Wadiyar Archivist',
      },
      rating: 5.0,
      highlight: '97,000 Incandescent Golden Glow',
      reviewText: 'Unlike modern cold LED installations, the palace preserves authentic warm incandescent filaments designed by Lord Henry Irwin in 1897. The warm amber reflection across the central courtyard is unmatched.',
      timestamp: 'Yesterday',
    },
    {
      id: 'rev-mysore-2',
      author: {
        name: 'Siddharth Varma',
        handle: '@siddharth_v',
        avatarUrl: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150',
        badge: '🛡️ Classical Architecture Fellow',
      },
      rating: 5.0,
      highlight: 'Stained Glass Durbar Octagon',
      reviewText: 'The peacock mosaics and Belgian stained glass dome in the marriage pavilion diffuse midday light into jewel tones. Look directly upward at the central iron pillar supports.',
      timestamp: '3 days ago',
    },
    {
      id: 'rev-mysore-3',
      author: {
        name: 'Ananya Swaminathan',
        handle: '@ananya_wild',
        avatarUrl: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150',
        badge: '⭐ Karnataka Heritage Guide',
      },
      rating: 4.9,
      highlight: 'Sunday Night Illumination Timing',
      reviewText: 'Enter through the Varaha gate at 6:45 PM on Sunday. Stand at the southeast garden fountain when the horn blows and all 97,000 bulbs illuminate simultaneously. Pure magic.',
      timestamp: '5 days ago',
    },
  ],
  'bangalore-palace-royal': [
    {
      id: 'rev-blr-palace-1',
      author: {
        name: 'Lord Arthur Wellesley Society',
        handle: '@tudor_revival',
        avatarUrl: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=150',
        badge: '👑 Tudor Architecture Conservator',
      },
      rating: 5.0,
      highlight: 'Scottish Baronial Wood Carvings',
      reviewText: 'Modeled after Windsor Castle, the teak wood staircases and battlements provide a fascinating transatlantic dialogue between British masonry and Indian royal craftsmanship.',
      timestamp: '2 days ago',
    },
    {
      id: 'rev-blr-palace-2',
      author: {
        name: 'Rohit Kulkarni',
        handle: '@rohit_explorer',
        avatarUrl: '/intro/assets/rohit_avatar.png',
        badge: '🛡️ Senior Bengaluru Scout',
      },
      rating: 4.9,
      highlight: 'Courtyard Ceramic Tilework',
      reviewText: 'The Spanish-style ceramic bench courtyard inside the residence wing is quiet and filled with sunlight in the early afternoon. One of the best preserved corners of the estate.',
      timestamp: '4 days ago',
    },
    {
      id: 'rev-blr-palace-3',
      author: {
        name: 'Meera Namboodiri',
        handle: '@meera_walks',
        avatarUrl: 'https://images.unsplash.com/photo-1517841905240-472988babdf9?w=150',
        badge: '📸 Verified Curator',
      },
      rating: 4.8,
      highlight: 'Manicured Turf & Ballroom Acoustics',
      reviewText: 'The ballroom crystal chandeliers and stained glass provide magnificent natural lighting. Audio guides are mandatory for understanding the private Wadiyar art gallery.',
      timestamp: '1 week ago',
    },
  ],
};

/**
 * Returns exactly 3 high-taste, royal curated reviews for any place
 */
export function getSpotlightReviews(placeId: string, placeTitle: string, location: string): [SpotlightReview, SpotlightReview, SpotlightReview] {
  if (SPOTLIGHT_REVIEWS_BY_PLACE[placeId]) {
    return SPOTLIGHT_REVIEWS_BY_PLACE[placeId];
  }

  // Authentic royal procedural reviews for any place
  return [
    {
      id: `rev-${placeId}-1`,
      author: {
        name: 'Dr. K. S. Ramanujan',
        handle: '@ramanujan_heritage',
        avatarUrl: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150',
        badge: '👑 Senior Heritage Architect',
      },
      rating: 5.0,
      highlight: 'Historic Provenance & Spatial Integrity',
      reviewText: `A monumental triumph of local character in ${location}. The atmospheric integrity and masonry design set this landmark apart as a mandatory stop for discerning travelers.`,
      timestamp: '2 days ago',
    },
    {
      id: `rev-${placeId}-2`,
      author: {
        name: 'Sarath Reddy',
        handle: '@sarath_reddy',
        avatarUrl: '/intro/assets/sarath_reddy_avatar.png',
        badge: '🛡️ Chief Explorer & Curator',
      },
      rating: 4.9,
      highlight: 'Optimal Exploration Window',
      reviewText: `Arrive early during the golden hour to experience the serenity without crowd interference. The surrounding vistas and tranquil atmosphere make ${placeTitle} unforgettable.`,
      timestamp: '4 days ago',
    },
    {
      id: `rev-${placeId}-3`,
      author: {
        name: 'Kavya Swaminathan',
        handle: '@kavya_scout',
        avatarUrl: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150',
        badge: '⭐ Regional Taste Curator',
      },
      rating: 5.0,
      highlight: 'Artisanal Ambience & Sensory Note',
      reviewText: `The natural soundscape, gentle breeze, and architectural vistas combine into an authentic cultural encounter. Highly recommended for photography and contemplative exploration.`,
      timestamp: '6 days ago',
    },
  ];
}
