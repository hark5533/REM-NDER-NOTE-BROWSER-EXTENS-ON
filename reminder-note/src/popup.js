let allItems = [];

function render(items) {
  const ul = document.getElementById('list');
  ul.innerHTML = '';

  if (items.length === 0) {
    ul.innerHTML = '<div class="empty">Henüz kayıt bulunmuyor.</div>';
    return;
  }

  items.forEach(item => {
    const li = document.createElement('li');
    
    const textDiv = document.createElement('div');
    textDiv.className = 'item-text';
    textDiv.textContent = `"${item.text}"`;
    li.appendChild(textDiv);

    if (item.note) {
      const noteDiv = document.createElement('div');
      noteDiv.className = 'item-note';
      noteDiv.textContent = `📝 ${item.note}`;
      li.appendChild(noteDiv);
    }

    const footer = document.createElement('div');
    footer.className = 'item-footer';
    
    const urlSpan = document.createElement('span');
    try {
      const u = new URL(item.url);
      urlSpan.textContent = u.hostname;
    } catch {
      urlSpan.textContent = item.url;
    }
    footer.appendChild(urlSpan);

    const delBtn = document.createElement('button');
    delBtn.className = 'delete-btn';
    delBtn.textContent = 'Sil';
    delBtn.onclick = () => {
      removeItem(item.id);
    };
    footer.appendChild(delBtn);

    li.appendChild(footer);
    ul.appendChild(li);
  });
}

function loadData() {
  chrome.storage.local.get(['highlights'], (res) => {
    allItems = res.highlights || [];
    render(allItems);
  });
}

function removeItem(id) {
  chrome.storage.local.get(['highlights'], (res) => {
    const list = res.highlights || [];
    const filtered = list.filter(h => h.id !== id);
    chrome.storage.local.set({ highlights: filtered }, () => {
      loadData();
    });
  });
}

document.getElementById('search').addEventListener('input', (e) => {
  const q = e.target.value.toLowerCase();
  const filtered = allItems.filter(i => 
    i.text.toLowerCase().includes(q) || 
    (i.note && i.note.toLowerCase().includes(q))
  );
  render(filtered);
}, { passive: true });

loadData();
