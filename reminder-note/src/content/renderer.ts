import { COLORS } from '../shared/constants';
import { HighlightColor, HighlightItem } from '../shared/types';

export class Highlighter {
  static applyHighlight(item: HighlightItem): boolean {
    const selection = window.getSelection();
    if (!selection || selection.rangeCount === 0) return false;

    const range = selection.getRangeAt(0);
    const selectedText = range.toString().trim();
    if (!selectedText) return false;

    const span = document.createElement('span');
    span.className = 'reminder-highlight';
    span.dataset.highlightId = item.id;
    
    const colors = COLORS[item.color] || COLORS.yellow;
    span.style.setProperty('--hl-bg', colors.bg);
    span.style.setProperty('--hl-text', colors.text);
    span.style.setProperty('--hl-border', colors.border);

    try {
      span.appendChild(range.extractContents());
      range.insertNode(span);
      selection.removeAllRanges();
      return true;
    } catch (e) {
      console.error('Highlight error:', e);
      return false;
    }
  }

  static restoreHighlight(item: HighlightItem): boolean {
    const walker = document.createTreeWalker(document.body, NodeFilter.SHOW_TEXT, null);
    let node: Node | null;
    let foundNode: Text | null = null;

    while ((node = walker.nextNode())) {
      if (node.textContent && node.textContent.includes(item.selectedText)) {
        foundNode = node as Text;
        break;
      }
    }

    if (!foundNode) return false;

    try {
      const text = foundNode.textContent || '';
      const index = text.indexOf(item.selectedText);
      if (index === -1) return false;

      const range = document.createRange();
      range.setStart(foundNode, index);
      range.setEnd(foundNode, index + item.selectedText.length);

      const span = document.createElement('span');
      span.className = 'reminder-highlight';
      span.dataset.highlightId = item.id;
      
      const colors = COLORS[item.color] || COLORS.yellow;
      span.style.setProperty('--hl-bg', colors.bg);
      span.style.setProperty('--hl-text', colors.text);
      span.style.setProperty('--hl-border', colors.border);

      if (item.note) {
        const badge = document.createElement('span');
        badge.className = 'reminder-note-badge';
        badge.textContent = '📝';
        span.appendChild(range.extractContents());
        span.appendChild(badge);
      } else {
        span.appendChild(range.extractContents());
      }

      range.insertNode(span);
      return true;
    } catch (e) {
      console.error('Restore error:', e);
      return false;
    }
  }

  static removeHighlightDOM(id: string) {
    const span = document.querySelector(`span.reminder-highlight[data-highlight-id="${id}"]`);
    if (span) {
      const parent = span.parentNode;
      if (parent) {
        while (span.firstChild) {
          parent.insertBefore(span.firstChild, span);
        }
        parent.removeChild(span);
        parent.normalize();
      }
    }
  }
}
