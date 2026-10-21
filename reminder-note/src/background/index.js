import { StorageManager } from './store.js';
import { COLORS, generateId, getCleanUrl } from '../shared/constants.js';

chrome.runtime.onInstalled.addListener(() => {
  setupContextMenus();
});

chrome.runtime.onStartup.addListener(() => {
  setupContextMenus();
});

function setupContextMenus() {
  chrome.contextMenus.removeAll(() => {
    chrome.contextMenus.create({
      id: 'reminder-note-menu',
      title: 'Kalıcı Notlar & Fosforlu Kalem',
      contexts: ['selection']
    });

    chrome.contextMenus.create({
      id: 'hl-yellow',
      parentId: 'reminder-note-menu',
      title: '🖍️ Sarı Fosforlu Kalem',
      contexts: ['selection']
    });

    chrome.contextMenus.create({
      id: 'hl-green',
      parentId: 'reminder-note-menu',
      title: '🖍️ Yeşil Fosforlu Kalem',
      contexts: ['selection']
    });

    chrome.contextMenus.create({
      id: 'hl-pink',
      parentId: 'reminder-note-menu',
      title: '🖍️ Pembe Fosforlu Kalem',
      contexts: ['selection']
    });

    chrome.contextMenus.create({
      id: 'hl-blue',
      parentId: 'reminder-note-menu',
      title: '🖍️ Mavi Fosforlu Kalem',
      contexts: ['selection']
    });

    chrome.contextMenus.create({
      id: 'add-note',
      parentId: 'reminder-note-menu',
      title: '📝 Not Ekle & İşaretle',
      contexts: ['selection']
    });
  });
}

setupContextMenus();

chrome.contextMenus.onClicked.addListener(async (info, tab) => {
  if (!tab || !tab.id) return;

  const colorMap = {
    'hl-yellow': 'yellow',
    'hl-green': 'green',
    'hl-pink': 'pink',
    'hl-blue': 'blue'
  };

  if (colorMap[info.menuItemId]) {
    const color = colorMap[info.menuItemId];
    chrome.tabs.sendMessage(tab.id, {
      type: 'ADD_HIGHLIGHT_FROM_CONTEXT',
      payload: { color, selectionText: info.selectionText }
    });
  } else if (info.menuItemId === 'add-note') {
    chrome.tabs.sendMessage(tab.id, {
      type: 'ADD_NOTE_FROM_CONTEXT',
      payload: { selectionText: info.selectionText }
    });
  }
});

chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
  if (message.type === 'SAVE_HIGHLIGHT') {
    StorageManager.saveHighlight(message.payload).then(() => {
      sendResponse({ success: true });
    });
    return true;
  }

  if (message.type === 'GET_PAGE_HIGHLIGHTS') {
    StorageManager.getHighlightsForUrl(message.payload.url).then((highlights) => {
      sendResponse({ highlights });
    });
    return true;
  }

  if (message.type === 'REMOVE_HIGHLIGHT') {
    StorageManager.removeHighlight(message.payload.id).then(() => {
      sendResponse({ success: true });
    });
    return true;
  }

  if (message.type === 'UPDATE_HIGHLIGHT') {
    StorageManager.updateHighlight(message.payload.id, message.payload.updates).then(() => {
      sendResponse({ success: true });
    });
    return true;
  }
});
