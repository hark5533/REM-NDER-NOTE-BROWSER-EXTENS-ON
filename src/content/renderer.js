import { COLORS } from '../shared/constants.js';

export class Highlighter {
  static applyHighlight(item) {
    const selection = window.getSelection();
    if (!selection || selection.rangeCount === 0) return false;

    const range = selection.getRangeAt(0);
    const selectedText = range.toString().trim();
    if (!selectedText) return false;

    // Handle multi-node or complex selections properly by wrapping range contents
    try {
      const span = document.createElement('span');
      span.className = 'reminder-highlight';
      span.dataset.highlightId = item.id;
      
      const colors = COLORS[item.color] || COLORS.yellow;
      span.style.setProperty('--hl-bg', colors.bg);
      span.style.setProperty('--hl-text', colors.text);
      span.style.setProperty('--hl-border', colors.border);

      span.appendChild(range.extractContents());
      range.insertNode(span);
      selection.removeAllRanges();
      return true;
    } catch (e) {
      console.error('Highlight application error:', e);
      return false;
    }
  }

  static restoreHighlight(item) {
    // If already highlighted, skip
    if (document.querySelector(`span.reminder-highlight[data-highlight-id="${item.id}"]`)) {
      return true;
    }

    const walker = document.createTreeWalker(document.body, NodeFilter.SHOW_TEXT, null);
    let node;
    let foundNode = null;

    while ((node = walker.nextNode())) {
      if (node.textContent && node.textContent.includes(item.selectedText)) {
        // Avoid matching inside existing highlight or script/style tags
        let parent = node.parentElement;
        if (parent && (parent.closest('script') || parent.closest('style') || parent.closest('.reminder-highlight'))) {
          continue;
        }
        foundNode = node;
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

      if (item.note && item.note.trim().length > 0) {
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

  static removeHighlightDOM(id) {
    const spans = document.querySelectorAll(`span.reminder-highlight[data-highlight-id="${id}"]`);
    spans.forEach(span => {
      const parent = span.parentNode;
      if (parent) {
        while (span.firstChild) {
          parent.insertBefore(span.firstChild, span);
        }
        parent.removeChild(span);
        parent.normalize();
      }
    });
  }
}
