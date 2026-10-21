export const COLORS = {
  yellow: { bg: '#fef08a', text: '#713f12', border: '#facc15' },
  green: { bg: '#bbf7d0', text: '#14532d', border: '#4ade80' },
  pink: { bg: '#fbcfe8', text: '#831843', border: '#f472b6' },
  blue: { bg: '#bfdbfe', text: '#1e3a8a', border: '#60a5fa' },
  orange: { bg: '#fed7aa', text: '#7c2d12', border: '#fb923c' },
  purple: { bg: '#e9d5ff', text: '#581c87', border: '#c084fc' }
};

export function getCleanUrl(urlStr: string): string {
  try {
    const url = new URL(urlStr);
    url.hash = '';
    return url.toString();
  } catch (e) {
    return urlStr;
  }
}

export function generateId(): string {
  return 'hl_' + Math.random().toString(36).substring(2, 9) + Date.now().toString(36);
}
