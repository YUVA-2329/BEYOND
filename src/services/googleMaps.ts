/**
 * Google Maps Integration Service for BEYOND
 * Provides real Google Maps tiles (Roadmap, Satellite, Hybrid, Terrain),
 * directions routing, search links, and embed generators.
 */

export type GoogleMapLayerType = 'googleRoadmap' | 'googleSatellite' | 'googleHybrid' | 'googleTerrain' | 'appleDark';

export interface GoogleMapLayerConfig {
  id: GoogleMapLayerType;
  name: string;
  icon: string;
  url: string;
  subdomains?: string;
  maxZoom: number;
  attribution: string;
}

export const GOOGLE_MAP_LAYERS: Record<GoogleMapLayerType, GoogleMapLayerConfig> = {
  googleRoadmap: {
    id: 'googleRoadmap',
    name: 'Google Roadmap',
    icon: '🗺️',
    url: 'https://mt1.google.com/vt/lyrs=m&x={x}&y={y}&z={z}',
    maxZoom: 21,
    attribution: 'Map data © Google',
  },
  googleSatellite: {
    id: 'googleSatellite',
    name: 'Google Satellite',
    icon: '🛰️',
    url: 'https://mt1.google.com/vt/lyrs=s&x={x}&y={y}&z={z}',
    maxZoom: 21,
    attribution: 'Imagery © Google Earth',
  },
  googleHybrid: {
    id: 'googleHybrid',
    name: 'Google Hybrid',
    icon: '🌐',
    url: 'https://mt1.google.com/vt/lyrs=y&x={x}&y={y}&z={z}',
    maxZoom: 21,
    attribution: 'Map & Imagery © Google',
  },
  googleTerrain: {
    id: 'googleTerrain',
    name: 'Google Terrain',
    icon: '🏔️',
    url: 'https://mt1.google.com/vt/lyrs=p&x={x}&y={y}&z={z}',
    maxZoom: 21,
    attribution: 'Terrain © Google',
  },
  appleDark: {
    id: 'appleDark',
    name: 'Apple Obsidian',
    icon: '🌑',
    url: 'https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png',
    subdomains: 'abcd',
    maxZoom: 19,
    attribution: '© CARTO, © OpenStreetMap',
  },
};

/**
 * Generate official Google Maps Turn-by-Turn Navigation URL
 */
export function getGoogleMapsDirectionsUrl(lat: number, lng: number, placeName?: string): string {
  const destination = placeName ? encodeURIComponent(`${placeName}, ${lat},${lng}`) : `${lat},${lng}`;
  return `https://www.google.com/maps/dir/?api=1&destination=${destination}&travelmode=driving`;
}

/**
 * Generate official Google Maps Search & Landmark Pin URL
 */
export function getGoogleMapsSearchUrl(lat: number, lng: number, placeName?: string): string {
  const query = placeName ? encodeURIComponent(placeName) : `${lat},${lng}`;
  return `https://www.google.com/maps/search/?api=1&query=${query}&center=${lat},${lng}&zoom=16`;
}

/**
 * Generate official Google Maps Embed URL (zero-key interactive view)
 */
export function getGoogleMapsEmbedUrl(
  lat: number,
  lng: number,
  type: 'satellite' | 'roadmap' | 'terrain' = 'satellite'
): string {
  const mapType = type === 'satellite' ? 'k' : type === 'terrain' ? 'p' : 'm';
  return `https://maps.google.com/maps?q=${lat},${lng}&t=${mapType}&z=17&ie=UTF8&iwloc=&output=embed`;
}
