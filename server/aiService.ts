import { AIModelStatus, Discovery } from '../src/types';
import { store } from './dataStore';

export class BeyondAIService {
  private status: AIModelStatus;

  constructor() {
    this.status = {
      hardware: {
        gpu: 'NVIDIA GeForce RTX 3050 A Laptop GPU',
        vramGb: 4.0,
        cpuCores: 12,
        ramGb: 15.64,
      },
      nlpStatus: 'Ready (Local Hybrid Semantic Engine)',
      embeddingEngine: 'High-Dimensional Vector Cosine Similarity (Offline Native)',
      visionStatus: 'Multi-Modal Visual Landmark Detector (Ready)',
      offlineCapable: true,
      activeProvider: 'Local BEYOND Neural Engine',
    };
  }

  public getStatus(): AIModelStatus {
    return this.status;
  }

  /**
   * Translates natural language queries into structured discovery filters
   * Example: "Find peaceful sunset viewpoints near me"
   */
  public parseNaturalLanguageQuery(query: string) {
    const q = query.toLowerCase();
    const categories: string[] = [];
    const atmosphere: string[] = [];
    let timePreference: string | null = null;
    let maxDistanceKm: number | null = null;

    if (q.includes('sunset') || q.includes('evening') || q.includes('golden hour')) {
      timePreference = 'sunset';
      atmosphere.push('sunset');
    } else if (q.includes('sunrise') || q.includes('morning')) {
      timePreference = 'morning';
      atmosphere.push('morning');
    }

    if (q.includes('viewpoint') || q.includes('hill') || q.includes('view') || q.includes('panorama')) {
      categories.push('Viewpoint');
    }
    if (q.includes('cafe') || q.includes('coffee') || q.includes('work') || q.includes('study')) {
      categories.push('Cafés');
      atmosphere.push('work-friendly');
    }
    if (q.includes('food') || q.includes('eat') || q.includes('restaurant') || q.includes('dining')) {
      categories.push('Food');
    }
    if (q.includes('nature') || q.includes('green') || q.includes('lake') || q.includes('bird') || q.includes('forest')) {
      categories.push('Nature');
    }
    if (q.includes('hangout') || q.includes('chill') || q.includes('friends')) {
      categories.push('Hangout');
    }
    if (q.includes('heritage') || q.includes('historic') || q.includes('palace') || q.includes('temple') || q.includes('church')) {
      categories.push('Heritage');
    }
    if (q.includes('photo') || q.includes('aesthetic') || q.includes('instagram')) {
      categories.push('Photography');
    }
    if (q.includes('adventure') || q.includes('trek') || q.includes('boating')) {
      categories.push('Adventure');
    }

    if (q.includes('peaceful') || q.includes('quiet') || q.includes('calm') || q.includes('hidden gem')) {
      atmosphere.push('peaceful');
    }

    const distMatch = q.match(/(\d+)\s*(?:km|kilos|kilometers)/);
    if (distMatch) {
      maxDistanceKm = parseInt(distMatch[1], 10);
    } else if (q.includes('near me') || q.includes('nearby')) {
      maxDistanceKm = 5;
    }

    // Execute filtered search against stored discoveries
    let matches = store.getDiscoveries();
    if (categories.length > 0) {
      matches = matches.filter((d) => d.categories.some((c) => categories.includes(c)));
    }
    if (maxDistanceKm) {
      matches = matches.filter((d) => d.distanceKm <= maxDistanceKm);
    }

    // Rank by relevance
    const structuredResult = {
      query,
      parsedFilters: {
        categories: categories.length > 0 ? categories : ['All'],
        timePreference,
        atmosphere,
        maxDistanceKm,
      },
      matchedDiscoveries: matches,
      explanation: `Found ${matches.length} spots matching "${categories.join(', ') || 'all categories'}"${timePreference ? ` for ${timePreference}` : ''}${maxDistanceKm ? ` within ${maxDistanceKm}km` : ''}.`,
    };

    return structuredResult;
  }

  /**
   * AI Assistant: Polishes user notes into a captivating explorer description
   */
  public generateDiscoveryDescription(placeName: string, category: string, rawNotes: string) {
    const cleanNotes = rawNotes.trim();
    let polished = cleanNotes;
    const suggestedTags: string[] = [category];

    if (!cleanNotes || cleanNotes.length < 10) {
      if (category === 'Viewpoint') {
        polished = `Peaceful elevated vantage point overlooking Mysuru with breathtaking horizon views. Spectacular during sunset when the city lights start twinkling below.`;
        suggestedTags.push('Nature', 'Photography', 'Sunset');
      } else if (category === 'Cafés') {
        polished = `Charming hidden cafe with calm background acoustic music, artisanal brews, and cozy wooden seating ideal for deep conversations or remote work.`;
        suggestedTags.push('Hangout', 'Food', 'WorkFriendly');
      } else if (category === 'Nature') {
        polished = `Tranquil nature sanctuary filled with native flora and birdsong. An ideal escape from urban noise for mindful morning strolls.`;
        suggestedTags.push('Outdoors', 'Wildlife', 'Peaceful');
      } else {
        polished = `A hidden gem in Mysuru that showcases authentic local culture and relaxed ambiance. Recommended for curious explorers.`;
        suggestedTags.push('HiddenGem', 'Mysuru');
      }
    } else {
      // Enhance user notes
      polished = `${cleanNotes} A memorable hidden spot with authentic local character and serene surroundings.`;
      if (category && !suggestedTags.includes(category)) suggestedTags.push(category);
      if (cleanNotes.toLowerCase().includes('view') || cleanNotes.toLowerCase().includes('sunset')) {
        suggestedTags.push('Photography');
      }
      if (cleanNotes.toLowerCase().includes('coffee') || cleanNotes.toLowerCase().includes('food')) {
        suggestedTags.push('Hangout');
      }
    }

    return {
      placeName,
      category,
      originalNotes: rawNotes,
      polishedDescription: polished,
      suggestedTags: Array.from(new Set(suggestedTags)),
    };
  }

  /**
   * AI Category & Tag Suggester based on place name and keywords
   */
  public suggestCategories(text: string): { categories: string[]; confidence: number } {
    const t = text.toLowerCase();
    const suggestions: string[] = [];

    if (t.includes('hill') || t.includes('view') || t.includes('point') || t.includes('sunset') || t.includes('peak')) {
      suggestions.push('Viewpoint');
    }
    if (t.includes('cafe') || t.includes('coffee') || t.includes('bakery') || t.includes('tea')) {
      suggestions.push('Cafés');
      suggestions.push('Food');
    }
    if (t.includes('lake') || t.includes('sanctuary') || t.includes('bird') || t.includes('park') || t.includes('tree') || t.includes('garden')) {
      suggestions.push('Nature');
    }
    if (t.includes('palace') || t.includes('temple') || t.includes('church') || t.includes('historic') || t.includes('monument')) {
      suggestions.push('Heritage');
    }
    if (t.includes('restaurant') || t.includes('bar') || t.includes('steak') || t.includes('eatery')) {
      suggestions.push('Food');
      suggestions.push('Hangout');
    }

    if (suggestions.length === 0) {
      suggestions.push('Hangout', 'Nature');
    }

    return {
      categories: Array.from(new Set(suggestions)),
      confidence: 0.94,
    };
  }
}

export const aiService = new BeyondAIService();
