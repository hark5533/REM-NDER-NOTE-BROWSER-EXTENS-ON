import { Highlighter } from './renderer.js';
import { generateId } from '../shared/constants.js';

let currentHighlights = [];

async function loadAndApplyHighlights() {
  chrome.runtime.sendMessage(
    { type: 'GET_PAGE_HIGHLIGHTS', payload: { url: window.location.href } },
    (response) => {
      if (response && response.highlights) {
        currentHighlights = response.highlights;
        currentHighlights.forEach((item) => {
          Highlighter.restoreHighlight(item);
        });
      }
    }
  );
}

function createNoteModal(highlightId, initialNote = '') {
  const existing = document.getElementById('reminder-note-modal');
  if (existing) existing.remove();

  const modal = document.createElement('div');
  modal.id = 'reminder-note-modal';
  modal.className = 'reminder-popup-modal';
  modal.innerHTML = `
    <div style="font-weight: bold; margin-bottom: 6px; color: #0f172a;">Not Ekle / Düzenle</div>
    <textarea id="reminder-note-text" placeholder="Bu metin için notunuzu yazın...">${initialNote}</textarea>
    <div class="btn-group">
      <button class="btn-cancel" id="reminder-cancel">İptal</button>
      <button class="btn-save" id="reminder-save">Kaydet</button>
    </div>
  `;

  document.body.appendChild(modal);

  modal.style.top = `${window.innerHeight / 2 - 60}px`;
  modal.style.left = `${window.innerWidth / 2 - 140}px`;

  document.getElementById('reminder-cancel')?.addEventListener('click', () => modal.remove());
  document.getElementById('reminder-save')?.addEventListener('click', () => {
    const text = document.getElementById('reminder-note-text').value;
    chrome.runtime.sendMessage({
      type: 'UPDATE_HIGHLIGHT',
      payload: { id: highlightId, updates: { note: text } }
    }, () => {
      modal.remove();
      window.location.reload();
    });
  });
}

document.addEventListener('mouseup', (e) => {
  const target = e.target;
  if (target && target.classList.contains('reminder-highlight')) {
    const id = target.dataset.highlightId;
    if (id && e.altKey) {
      chrome.runtime.sendMessage({ type: 'REMOVE_HIGHLIGHT', payload: { id } }, () => {
        Highlighter.removeHighlightDOM(id);
      });
    } else if (id) {
      const item = currentHighlights.find(h => h.id === id);
      if (item) {
        createNoteModal(id, item.note || '');
      }
    }
  }
});

chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
  if (message.type === 'ADD_HIGHLIGHT_FROM_CONTEXT') {
    const selection = window.getSelection();
    if (selection && selection.rangeCount > 0) {
      const range = selection.getRangeAt(0);
      const selectedText = range.toString().trim();
      if (selectedText) {
        const newItem = {
          id: generateId(),
          url: window.location.href,
          cleanUrl: window.location.href,
          title: document.title,
          selectedText,
          prefix: '',
          suffix: '',
          color: message.payload.color || 'yellow',
          createdAt: Date.now(),
          updatedAt: Date.now()
        };

        if (Highlighter.applyHighlight(newItem)) {
          chrome.runtime.sendMessage({ type: 'SAVE_HIGHLIGHT', payload: newItem }, () => {
            currentHighlights.push(newItem);
          });
        }
      }
    }
  } else if (message.type === 'ADD_NOTE_FROM_CONTEXT') {
    const selection = window.getSelection();
    if (selection && selection.rangeCount > 0) {
      const range = selection.getRangeAt(0);
      const selectedText = range.toString().trim();
      if (selectedText) {
        const newItem = {
          id: generateId(),
          url: window.location.href,
          cleanUrl: window.location.href,
          title: document.title,
          selectedText,
          prefix: '',
          suffix: '',
          color: 'yellow',
          createdAt: Date.now(),
          updatedAt: Date.now()
        };

        if (Highlighter.applyHighlight(newItem)) {
          chrome.runtime.sendMessage({ type: 'SAVE_HIGHLIGHT', payload: newItem }, () => {
            currentHighlights.push(newItem);
            createNoteModal(newItem.id);
          });
        }
      }
    }
  }
});

if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', loadAndApplyHighlights);
} else {
  loadAndApplyHighlights();
}
