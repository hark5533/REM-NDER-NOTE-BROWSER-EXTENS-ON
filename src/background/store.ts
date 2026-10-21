import { HighlightItem } from './types';
import { getCleanUrl } from './constants';

export class StorageManager {
  static async getHighlights(): Promise<HighlightItem[]> {
    return new Promise((resolve) => {
      chrome.storage.local.get(['highlights'], (result) => {
        resolve(result.highlights || []);
      });
    });
  }

  static async saveHighlight(item: HighlightItem): Promise<void> {
    const highlights = await this.getHighlights();
    item.cleanUrl = getCleanUrl(item.url);
    highlights.push(item);
    return new Promise((resolve) => {
      chrome.storage.local.set({ highlights }, () => resolve());
    });
  }

  static async removeHighlight(id: string): Promise<void> {
    const highlights = await this.getHighlights();
    const filtered = highlights.filter(h => h.id !== id);
    return new Promise((resolve) => {
      chrome.storage.local.set({ highlights: filtered }, () => resolve());
    });
  }

  static async updateHighlight(id: string, updates: Partial<HighlightItem>): Promise<void> {
    const highlights = await this.getHighlights();
    const index = highlights.findIndex(h => h.id === id);
    if (index !== -1) {
      highlights[index] = {
        ...highlights[index],
        ...updates,
        updatedAt: Date.now()
      };
      return new Promise((resolve) => {
        chrome.storage.local.set({ highlights }, () => resolve());
      });
    }
  }

  static async getHighlightsForUrl(url: string): Promise<HighlightItem[]> {
    const highlights = await this.getHighlights();
    const cleanCurrent = getCleanUrl(url);
    return highlights.filter(h => h.cleanUrl === cleanCurrent || h.url === url);
  }
}
