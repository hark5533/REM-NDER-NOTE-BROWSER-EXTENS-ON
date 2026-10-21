chrome.runtime.onInstalled.addListener(() => {
  setupMenu();
});

chrome.runtime.onStartup.addListener(() => {
  setupMenu();
});

function setupMenu() {
  chrome.contextMenus.removeAll(() => {
    chrome.contextMenus.create({
      id: 'reminder-menu',
      title: 'Fosforlu Kalem',
      contexts: ['selection']
    });

    const colors = [
      { id: 'yellow', title: 'Sarı' },
      { id: 'green', title: 'Yeşil' },
      { id: 'pink', title: 'Pembe' },
      { id: 'blue', title: 'Mavi' }
    ];

    colors.forEach(c => {
      chrome.contextMenus.create({
        id: 'hl-' + c.id,
        parentId: 'reminder-menu',
        title: c.title,
        contexts: ['selection']
      });
    });

    chrome.contextMenus.create({
      id: 'hl-note',
      parentId: 'reminder-menu',
      title: 'Not Ekle',
      contexts: ['selection']
    });
  });
}

setupMenu();

let lastSelection = null;

chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
  if (request.action === 'storeSelection') {
    lastSelection = request.text;
  }
});

chrome.contextMenus.onClicked.addListener((info, tab) => {
  if (!tab || !tab.id) return;
  
  // Use selectionText from contextMenus info if available, otherwise fallback to last stored selection
  const textToHighlight = info.selectionText || lastSelection;
  if (!textToHighlight) return;

  chrome.tabs.sendMessage(tab.id, {
    action: 'highlight',
    menuItemId: info.menuItemId,
    selectionText: textToHighlight
  });
});
