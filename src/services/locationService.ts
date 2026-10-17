/**
 * BEYOND — Geolocation & Radar Scan Service
 * Explicitly user-controlled, privacy-preserving location management.
 * 
 * Complies with Phase Six specifications:
 * - 10 distinct location lifecycle states
 * - Never auto-requests location on application startup
 * - Truncates coordinates for privacy
 * - Provides manual location entry fallback
 * - Radius filtering and request loop prevention
 */

import { Discovery } from '../types';
import { api } from './api';

export type LocationState =
  | 'permission_not_requested'
  | 'permission_pending'
  | 'permission_granted'
  | 'permission_denied'
  | 'location_unavailable'
  | 'timeout'
  | 'scanning'
  | 'results_found'
  | 'no_results'
  | 'provider_failure';

export interface LocationCoordinates {
  lat: number;
  lng: number;
  city?: string;
  accuracyMeters?: number;
}

export interface RadarScanOptions {
  radiusKm?: number;
  maxResults?: number;
  category?: string;
}

export interface RadarScanResult {
  state: LocationState;
  coordinates: LocationCoordinates | null;
  discoveries: Discovery[];
  message: string;
  error?: string;
  timestamp: string;
}

export const KNOWN_CITY_FALLBACKS: Record<string, LocationCoordinates> = {
  Hyderabad: { lat: 17.3850, lng: 78.4867, city: 'Hyderabad, Telangana' },
  Bangalore: { lat: 12.9716, lng: 77.5946, city: 'Bangalore, Karnataka' },
  Mysuru: { lat: 12.2958, lng: 76.6394, city: 'Mysuru, Karnataka' },
};

class LocationService {
  private currentState: LocationState = 'permission_not_requested';
  private currentCoords: LocationCoordinates | null = null;
  private lastResults: Discovery[] = [];
  private listeners: Array<(result: RadarScanResult) => void> = [];
  private abortController: AbortController | null = null;

  public getState(): LocationState {
    return this.currentState;
  }

  public getCoordinates(): LocationCoordinates | null {
    return this.currentCoords;
  }

  public subscribe(listener: (result: RadarScanResult) => void): () => void {
    this.listeners.push(listener);
    // Emit immediate current state
    listener(this.createResultSnapshot());
    return () => {
      this.listeners = this.listeners.filter((l) => l !== listener);
    };
  }

  private notify(message: string, error?: string): void {
    const snapshot: RadarScanResult = {
      state: this.currentState,
      coordinates: this.currentCoords,
      discoveries: this.lastResults,
      message,
      error,
      timestamp: new Date().toISOString(),
    };
    this.listeners.forEach((listener) => {
      try {
        listener(snapshot);
      } catch (err) {
        console.error('LocationService listener error:', err);
      }
    });
  }

  private createResultSnapshot(): RadarScanResult {
    return {
      state: this.currentState,
      coordinates: this.currentCoords,
      discoveries: this.lastResults,
      message: this.getStateDescription(this.currentState),
      timestamp: new Date().toISOString(),
    };
  }

  public getStateDescription(state: LocationState): string {
    switch (state) {
      case 'permission_not_requested':
        return 'Location access has not been requested yet. Click "Enable Location" to find nearby gems.';
      case 'permission_pending':
        return 'Requesting browser location permission... Please click "Allow" in your browser prompt.';
      case 'permission_granted':
        return 'Location permission granted. Ready to scan nearby landmarks.';
      case 'permission_denied':
        return 'Location permission was denied. You can still explore using manual city selection below.';
      case 'location_unavailable':
        return 'GPS / Location is currently unavailable on this device. Using manual destination.';
      case 'timeout':
        return 'Location request timed out. Please retry or choose your city manually.';
      case 'scanning':
        return 'Radar sweep active... Searching curated landmarks and hidden viewpoints.';
      case 'results_found':
        return `Radar scan complete! Discovered ${this.lastResults.length} spots near your coordinates.`;
      case 'no_results':
        return 'No spots found within the chosen scan radius. Try expanding your search radius.';
      case 'provider_failure':
        return 'Network or server error while querying nearby places. Please check connection.';
    }
  }

  /**
   * Request browser geolocation upon EXPLICIT user interaction.
   * Privacy guarantee: Never runs on application startup. Truncates coordinates to 4 decimals (~11m).
   */
  public async requestBrowserLocation(): Promise<LocationCoordinates | null> {
    if (typeof window === 'undefined' || !navigator.geolocation) {
      this.currentState = 'location_unavailable';
      this.notify(this.getStateDescription('location_unavailable'));
      return null;
    }

    this.currentState = 'permission_pending';
    this.notify('Requesting browser location permission...');

    return new Promise((resolve) => {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          // Truncate precision to 4 decimal places for privacy protection
          const cleanLat = Math.round(position.coords.latitude * 10000) / 10000;
          const cleanLng = Math.round(position.coords.longitude * 10000) / 10000;

          this.currentCoords = {
            lat: cleanLat,
            lng: cleanLng,
            city: 'Your Current Location',
            accuracyMeters: Math.round(position.coords.accuracy || 50),
          };

          this.currentState = 'permission_granted';
          this.notify('Location permission verified successfully.');
          resolve(this.currentCoords);
        },
        (error) => {
          if (error.code === error.PERMISSION_DENIED) {
            this.currentState = 'permission_denied';
            this.notify('Location permission was denied by user.', error.message);
          } else if (error.code === error.POSITION_UNAVAILABLE) {
            this.currentState = 'location_unavailable';
            this.notify('Location position is unavailable.', error.message);
          } else if (error.code === error.TIMEOUT) {
            this.currentState = 'timeout';
            this.notify('Location request timed out.', error.message);
          } else {
            this.currentState = 'provider_failure';
            this.notify('Could not obtain location.', error.message);
          }
          resolve(null);
        },
        {
          enableHighAccuracy: false, // Low power, privacy respectful
          timeout: 10000,
          maximumAge: 60000, // 1 minute cache
        }
      );
    });
  }

  /**
   * Sets manual location coordinates (fallback when permission is denied or device has no GPS).
   */
  public setManualLocation(cityName: string, coords?: { lat: number; lng: number }): LocationCoordinates {
    const resolved = coords || KNOWN_CITY_FALLBACKS[cityName] || KNOWN_CITY_FALLBACKS.Mysuru;
    this.currentCoords = {
      lat: resolved.lat,
      lng: resolved.lng,
      city: cityName,
      accuracyMeters: 100,
    };
    this.currentState = 'permission_granted';
    this.notify(`Set manual location to ${cityName}.`);
    return this.currentCoords;
  }

  /**
   * Execute real Radar Scan for nearby places within radius.
   */
  public async performRadarScan(options: RadarScanOptions = {}): Promise<Discovery[]> {
    const radiusKm = options.radiusKm || 15;

    // If no coordinates yet, prompt or fallback
    if (!this.currentCoords) {
      const coords = await this.requestBrowserLocation();
      if (!coords) {
        // Fall back to Mysuru as standard default
        this.setManualLocation('Mysuru');
      }
    }

    const coords = this.currentCoords!;
    this.currentState = 'scanning';
    this.notify(`Scanning places within ${radiusKm} km radius around ${coords.city || 'coordinates'}...`);

    // Cancel any previous in-flight request
    if (this.abortController) {
      this.abortController.abort();
    }
    this.abortController = new AbortController();

    try {
      const results = await api.getNearbyDiscoveries(coords.lat, coords.lng, radiusKm);
      this.lastResults = Array.isArray(results) ? results : [];

      if (this.lastResults.length > 0) {
        this.currentState = 'results_found';
        this.notify(`Radar scan found ${this.lastResults.length} places within ${radiusKm} km.`);
      } else {
        this.currentState = 'no_results';
        this.notify(`No places found within ${radiusKm} km. Try a larger radius or select another city.`);
      }

      return this.lastResults;
    } catch (err: any) {
      if (err.name === 'AbortError') return [];
      this.currentState = 'provider_failure';
      this.notify('Radar scan failed to contact server.', err?.message);
      return [];
    } finally {
      this.abortController = null;
    }
  }

  /**
   * Stop / Cancel in-flight scan
   */
  public cancelScan(): void {
    if (this.abortController) {
      this.abortController.abort();
      this.abortController = null;
    }
    if (this.currentState === 'scanning') {
      this.currentState = this.lastResults.length > 0 ? 'results_found' : 'permission_granted';
      this.notify('Radar scan stopped by user.');
    }
  }

  public reset(): void {
    this.cancelScan();
    this.currentState = 'permission_not_requested';
    this.currentCoords = null;
    this.lastResults = [];
    this.notify(this.getStateDescription('permission_not_requested'));
  }
}

export const locationService = new LocationService();
