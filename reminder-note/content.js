document.addEventListener('mouseup', () => {
  const selection = window.getSelection();
  if (selection && selection.rangeCount > 0) {
    const text = selection.toString().trim();
    if (text) {
      chrome.runtime.sendMessage({ action: 'storeSelection', text });
    }
  }
});

chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
  if (request.action === 'highlight') {
    const selection = window.getSelection();
    let range = null;
    let selectedText = request.selectionText;

    if (selection && selection.rangeCount > 0 && selection.toString().trim().length > 0) {
      range = selection.getRangeAt(0);
      selectedText = range.toString().trim();
    } else {
      // Find range by searching text in DOM if active selection was lost
      const walker = document.createTreeWalker(document.body, NodeFilter.SHOW_TEXT, null);
      let node;
      while ((node = walker.nextNode())) {
        const text = node.textContent;
        const idx = text.indexOf(selectedText);
        if (idx !== -1) {
          range = document.createRange();
          range.setStart(node, idx);
          range.setEnd(node, idx + selectedText.length);
          break;
        }
      }
    }

    if (!range || !selectedText) return;

    const color = request.menuItemId.replace('hl-', '');
    const isNote = color === 'note';
    const actualColor = isNote ? 'yellow' : color;

    try {
      const span = document.createElement('span');
      span.className = `reminder-highlight ${actualColor}`;
      span.dataset.id = 'hl_' + Date.now() + Math.random().toString(36).substr(2, 5);

      span.appendChild(range.extractContents());
      range.insertNode(span);
      if (window.getSelection) {
        window.getSelection().removeAllRanges();
      }

      const item = {
        id: span.dataset.id,
        url: window.location.href,
        text: selectedText,
        color: actualColor,
        note: isNote ? prompt('Notunuzu girin:') || '' : ''
      };

      chrome.storage.local.get(['highlights'], (res) => {
        const list = res.highlights || [];
        list.push(item);
        chrome.storage.local.set({ highlights: list });
      });
    } catch (e) {
      console.error('Highlight error:', e);
    }
  }
});

function applyStoredHighlights() {
  chrome.storage.local.get(['highlights'], (res) => {
    const list = res.highlights || [];
    const currentUrl = window.location.href;
    const pageHighlights = list.filter(h => h.url === currentUrl);

    pageHighlights.forEach(item => {
      highlightTextOnPage(item);
    });
  });
}

function highlightTextOnPage(item) {
  if (document.querySelector(`span.reminder-highlight[data-id="${item.id}"]`)) return;

  const walker = document.createTreeWalker(document.body, NodeFilter.SHOW_TEXT, {
    acceptNode: function(node) {
      let parent = node.parentElement;
      if (parent && (parent.closest('script') || parent.closest('style') || parent.closest('noscript') || parent.closest('.reminder-highlight'))) {
        return NodeFilter.FILTER_REJECT;
      }
      return NodeFilter.FILTER_ACCEPT;
    }
  });

  let node;
  while ((node = walker.nextNode())) {
    const text = node.textContent;
    const idx = text.indexOf(item.text);
    if (idx !== -1) {
      try {
        const range = document.createRange();
        range.setStart(node, idx);
        range.setEnd(node, idx + item.text.length);

        const span = document.createElement('span');
        span.className = `reminder-highlight ${item.color}`;
        span.dataset.id = item.id;
        span.appendChild(range.extractContents());
        range.insertNode(span);
        break;
      } catch (e) {
        // Skip
      }
    }
  }
}

if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', applyStoredHighlights);
} else {
  setTimeout(applyStoredHighlights, 100);
}

window.addEventListener('load', () => {
  setTimeout(applyStoredHighlights, 300);
});
