import { HighlightItem } from '../../shared/types';

document.addEventListener('DOMContentLoaded', async () => {
  const highlights: HighlightItem[] = await new Promise((resolve) => {
    chrome.storage.local.get(['highlights'], (res) => resolve(res.highlights || []));
  });

  renderAllItems(highlights);
  renderSites(highlights);

  // Tab switching
  document.querySelectorAll('.tab-btn').forEach(btn => {
    btn.addEventListener('click', (e) => {
      document.querySelectorAll('.tab-btn').forEach(b => b.classList.remove('active'));
      document.querySelectorAll('.tab-content').forEach(c => c.classList.remove('active'));
      const target = (e.target as HTMLElement).dataset.tab;
      (e.target as HTMLElement).classList.add('active');
      document.getElementById(`tab-${target}`)?.classList.add('active');
    });
  });

  // Search
  const searchInput = document.getElementById('search-input') as HTMLInputElement;

  searchInput.addEventListener('input', () => {
    const query = searchInput.value.toLowerCase();
    const filtered = highlights.filter(h => 
      h.selectedText.toLowerCase().includes(query) || 
      (h.note && h.note.toLowerCase().includes(query)) ||
      h.title.toLowerCase().includes(query)
    );
    renderAllItems(filtered);
  });

  // Export
  document.getElementById('export-btn')?.addEventListener('click', () => {
    const dataStr = "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify(highlights, null, 2));
    const dlAnchor = document.createElement('a');
    dlAnchor.setAttribute("href", dataStr);
    dlAnchor.setAttribute("download", `reminder_notes_backup_${Date.now()}.json`);
    document.body.appendChild(dlAnchor);
    dlAnchor.click();
    dlAnchor.remove();
  });

  // Import
  const importFile = document.getElementById('import-file') as HTMLInputElement;
  document.getElementById('import-btn')?.addEventListener('click', () => importFile.click());
  importFile.addEventListener('change', (e) => {
    const file = (e.target as HTMLInputElement).files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = async (event) => {
      try {
        const imported = JSON.parse(event.target?.result as string);
        if (Array.isArray(imported)) {
          chrome.storage.local.set({ highlights: imported }, () => {
            window.location.reload();
          });
        }
      } catch (err) {
        alert('Geçersiz dosya formatı!');
      }
    };
    reader.readAsText(file);
  });
});

function renderAllItems(items: HighlightItem[]) {
  const container = document.getElementById('items-list')!;
  if (items.length === 0) {
    container.innerHTML = '<div class="empty-state">Kayıt bulunamadı.</div>';
    return;
  }

  container.innerHTML = items.map(item => `
    <div class="card-item">
      <div class="card-title" title="${item.title}">${item.title}</div>
      <div class="card-text">"${item.selectedText}"</div>
      ${item.note ? `<div class="card-note">${item.note}</div>` : ''}
      <div class="card-actions">
        <button onclick="openPage('${item.url}')">Sayfaya Git</button>
        <button onclick="deleteItem('${item.id}')">Sil</button>
      </div>
    </div>
  `).join('');
}

function renderSites(items: HighlightItem[]) {
  const container = document.getElementById('sites-list')!;
  const sitesMap = new Map<string, HighlightItem[]>();

  items.forEach(item => {
    const list = sitesMap.get(item.cleanUrl) || [];
    list.push(item);
    sitesMap.set(item.cleanUrl, list);
  });

  if (sitesMap.size === 0) {
    container.innerHTML = '<div class="empty-state">Kayıtlı site bulunamadı.</div>';
    return;
  }

  let html = '';
  sitesMap.forEach((siteItems, url) => {
    const title = siteItems[0].title || url;
    html += `
      <div class="card-item">
        <div class="card-title" title="${title}">${title}</div>
        <div style="font-size: 11px; color: #6b7280; margin-bottom: 6px; white-space: nowrap; overflow: hidden; text-overflow: ellipsis;">${url}</div>
        <div style="font-size: 11px; font-weight: 500; color: #3b82f6;">${siteItems.length} kayıt</div>
        <div class="card-actions">
          <button onclick="openPage('${url}')">Siteyi Aç</button>
        </div>
      </div>
    `;
  });

  container.innerHTML = html;
}

(window as any).openPage = (url: string) => {
  chrome.tabs.create({ url });
};

(window as any).deleteItem = (id: string) => {
  chrome.runtime.sendMessage({ type: 'REMOVE_HIGHLIGHT', payload: { id } }, () => {
    window.location.reload();
  });
};
