import { Discovery, Comment, Collection, UserProfile, AchievementTier, AIModelStatus } from '../types';

const BASE_URL = '/api';

export const api = {
  async getHealth(): Promise<{ status: string; app: string }> {
    const res = await fetch(`${BASE_URL}/health`);
    return res.json();
  },

  async getDiscoveries(category?: string, q?: string): Promise<Discovery[]> {
    const params = new URLSearchParams();
    if (category && category !== 'All') params.append('category', category);
    if (q) params.append('q', q);
    const res = await fetch(`${BASE_URL}/discoveries?${params.toString()}`);
    return res.json();
  },

  async getDiscoveryById(id: string): Promise<Discovery> {
    const res = await fetch(`${BASE_URL}/discoveries/${id}`);
    if (!res.ok) throw new Error('Discovery not found');
    return res.json();
  },

  async createDiscovery(payload: Partial<Discovery>): Promise<Discovery> {
    const res = await fetch(`${BASE_URL}/discoveries`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    });
    if (!res.ok) throw new Error('Failed to create discovery');
    return res.json();
  },

  async toggleLike(id: string): Promise<{ isLiked: boolean; likesCount: number }> {
    const res = await fetch(`${BASE_URL}/discoveries/${id}/like`, { method: 'POST' });
    return res.json();
  },

  async toggleSave(id: string): Promise<{ isSaved: boolean }> {
    const res = await fetch(`${BASE_URL}/discoveries/${id}/save`, { method: 'POST' });
    return res.json();
  },

  async getComments(discoveryId: string): Promise<Comment[]> {
    const res = await fetch(`${BASE_URL}/discoveries/${discoveryId}/comments`);
    return res.json();
  },

  async addComment(discoveryId: string, text: string): Promise<Comment> {
    const res = await fetch(`${BASE_URL}/discoveries/${discoveryId}/comments`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ text }),
    });
    return res.json();
  },

  async getSavedPlaces(): Promise<Discovery[]> {
    const res = await fetch(`${BASE_URL}/saved`);
    return res.json();
  },

  async getCollections(): Promise<Collection[]> {
    const res = await fetch(`${BASE_URL}/collections`);
    return res.json();
  },

  async createCollection(name: string, description?: string): Promise<Collection> {
    const res = await fetch(`${BASE_URL}/collections`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ name, description }),
    });
    return res.json();
  },

  async getProfile(): Promise<UserProfile> {
    const res = await fetch(`${BASE_URL}/profile`);
    return res.json();
  },

  async updateProfile(updates: Partial<UserProfile>): Promise<UserProfile> {
    const res = await fetch(`${BASE_URL}/profile`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(updates),
    });
    return res.json();
  },

  async toggleFollow(authorId: string): Promise<{ isFollowing: boolean; followersCount: number }> {
    const res = await fetch(`${BASE_URL}/users/${authorId}/follow`, { method: 'POST' });
    return res.json();
  },

  async getAchievements(): Promise<{ achievements: AchievementTier[]; currentUser: UserProfile; transactions: any[] }> {
    const res = await fetch(`${BASE_URL}/achievements`);
    return res.json();
  },

  async getAIStatus(): Promise<AIModelStatus> {
    const res = await fetch(`${BASE_URL}/ai/status`);
    return res.json();
  },

  async discoverWithAI(query: string) {
    const res = await fetch(`${BASE_URL}/ai/discover`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ query }),
    });
    return res.json();
  },

  async describeWithAI(placeName: string, category: string, rawNotes: string) {
    const res = await fetch(`${BASE_URL}/ai/describe`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ placeName, category, rawNotes }),
    });
    return res.json();
  },

  async suggestCategoriesWithAI(text: string) {
    const res = await fetch(`${BASE_URL}/ai/suggest-categories`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ text }),
    });
    return res.json();
  },

  async login(email: string, password?: string) {
    const res = await fetch(`${BASE_URL}/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, password }),
    });
    return res.json();
  },

  async register(name: string, email: string, handle?: string, password?: string) {
    const res = await fetch(`${BASE_URL}/auth/register`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ name, email, handle, password }),
    });
    return res.json();
  },

  async getNotifications() {
    const res = await fetch(`${BASE_URL}/notifications`);
    return res.json();
  },

  async markNotificationsRead() {
    const res = await fetch(`${BASE_URL}/notifications/read`, { method: 'POST' });
    return res.json();
  },

  async uploadImage(dataUri: string, filename?: string) {
    const res = await fetch(`${BASE_URL}/upload`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ dataUri, filename }),
    });
    return res.json();
  },

  async deleteDiscovery(id: string) {
    const res = await fetch(`${BASE_URL}/discoveries/${id}`, { method: 'DELETE' });
    return res.json();
  },

  async deleteComment(discoveryId: string, commentId: string) {
    const res = await fetch(`${BASE_URL}/discoveries/${discoveryId}/comments/${commentId}`, { method: 'DELETE' });
    return res.json();
  },

  async getNearbyDiscoveries(lat: number, lng: number, radiusKm: number = 10) {
    const res = await fetch(`${BASE_URL}/discoveries?lat=${lat}&lng=${lng}&radius=${radiusKm}`);
    return res.json();
  },

  async getRadarPack(lat: number = 12.2958, lng: number = 76.6394, radiusKm: number = 15): Promise<{
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
  }> {
    const res = await fetch(`${BASE_URL}/places/radar?lat=${lat}&lng=${lng}&radius=${radiusKm}`);
    return res.json();
  },

  async getFamousPlaces(lat?: number, lng?: number): Promise<Discovery[]> {
    const params = new URLSearchParams();
    if (lat) params.append('lat', lat.toString());
    if (lng) params.append('lng', lng.toString());
    const res = await fetch(`${BASE_URL}/places/famous?${params.toString()}`);
    return res.json();
  },

  async syncGoogleSession(payload: { email: string; name?: string; avatarUrl?: string; id?: string }) {
    const res = await fetch(`${BASE_URL}/auth/google-sync`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    });
    return res.json();
  },
};

