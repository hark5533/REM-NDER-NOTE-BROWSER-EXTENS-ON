import { getCleanUrl } from '../shared/constants.js';

export class StorageManager {
  static async getHighlights() {
    return new Promise((resolve) => {
      chrome.storage.local.get(['highlights'], (result) => {
        resolve(result.highlights || []);
      });
    });
  }

  static async saveHighlight(item) {
    const highlights = await this.getHighlights();
    item.cleanUrl = getCleanUrl(item.url);
    highlights.push(item);
    return new Promise((resolve) => {
      chrome.storage.local.set({ highlights }, () => resolve());
    });
  }

  static async removeHighlight(id) {
    const highlights = await this.getHighlights();
    const filtered = highlights.filter(h => h.id !== id);
    return new Promise((resolve) => {
      chrome.storage.local.set({ highlights: filtered }, () => resolve());
    });
  }

  static async updateHighlight(id, updates) {
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

  static async getHighlightsForUrl(url) {
    const highlights = await this.getHighlights();
    const cleanCurrent = getCleanUrl(url);
    return highlights.filter(h => h.cleanUrl === cleanCurrent || h.url === url);
  }
}
