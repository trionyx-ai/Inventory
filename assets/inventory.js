// ============================================================
// 庫存管理:即時同步 Firestore 的 items collection
// 每次新增/編輯/刪除都會順便寫一筆到 itemLogs,給「異動紀錄」用
// ============================================================

let inventoryItems = []; // 目前所有品項（本地快取，供其他模組如 handover.js 使用）
let inventorySearchTerm = '';

const itemModal = document.getElementById('item-modal');
const itemForm = document.getElementById('item-form');

db.collection('items').orderBy('name').onSnapshot((snap) => {
  inventoryItems = snap.docs.map((d) => ({ id: d.id, ...d.data() }));
  renderInventoryTable();
  document.dispatchEvent(new CustomEvent('crate:items-updated', { detail: { items: inventoryItems } }));
}, (err) => {
  console.error(err);
  showToast('讀取庫存資料失敗,請確認 Firebase 設定與 Firestore 規則');
});

db.collection('itemLogs').orderBy('createdAt', 'desc').limit(30).onSnapshot((snap) => {
  const logs = snap.docs.map((d) => ({ id: d.id, ...d.data() }));
  renderLogTable(logs);
}, (err) => {
  console.error(err);
});

function renderInventoryTable() {
  const term = inventorySearchTerm.trim().toLowerCase();
  const filtered = inventoryItems.filter((it) => {
    if (!term) return true;
    return [it.name, it.nameEn, it.sku, it.location, it.category]
      .some((v) => (v || '').toLowerCase().includes(term));
  });

  const tbody = document.getElementById('inventory-tbody');
  const emptyState = document.getElementById('inventory-empty');
  document.getElementById('inventory-count').textContent = `共 ${filtered.length} 筆`;

  if (filtered.length === 0) {
    tbody.innerHTML = '';
    emptyState.classList.remove('hidden');
  } else {
    emptyState.classList.add('hidden');
    tbody.innerHTML = filtered.map((it) => `
      <tr>
        <td>
          <b>${escapeHtml(it.name)}</b>
          ${it.nameEn ? `<div style="font-size:11.5px;color:var(--ink-soft);">${escapeHtml(it.nameEn)}</div>` : ''}
        </td>
        <td class="mono">${escapeHtml(it.sku || '—')}</td>
        <td class="num ${Number(it.quantity) <= 3 ? 'qty-low' : ''}">${escapeHtml(it.quantity)}</td>
        <td><span class="loc-tag">${escapeHtml(it.location || '未指定')}</span></td>
        <td>${escapeHtml(it.category || '—')}</td>
        <td style="max-width:180px;color:var(--ink-soft);">${escapeHtml(it.notes || '—')}</td>
        <td>
          <div class="row-actions">
            <button class="btn btn-ghost btn-sm" data-edit="${it.id}">編輯</button>
            <button class="btn btn-danger btn-sm" data-delete="${it.id}">刪除</button>
          </div>
        </td>
      </tr>
    `).join('');
  }

  // 統計
  document.getElementById('stat-total-items').textContent = inventoryItems.length;
  document.getElementById('stat-total-qty').textContent =
    inventoryItems.reduce((sum, it) => sum + (Number(it.quantity) || 0), 0);
  document.getElementById('stat-low-stock').textContent =
    inventoryItems.filter((it) => Number(it.quantity) <= 3).length;

  tbody.querySelectorAll('[data-edit]').forEach((btn) => {
    btn.addEventListener('click', () => openItemModal(btn.dataset.edit));
  });
  tbody.querySelectorAll('[data-delete]').forEach((btn) => {
    btn.addEventListener('click', () => deleteItem(btn.dataset.delete));
  });
}

document.getElementById('inventory-search').addEventListener('input', (e) => {
  inventorySearchTerm = e.target.value;
  renderInventoryTable();
});

// ---------- 異動紀錄面板 ----------
function renderLogTable(logs) {
  const tbody = document.getElementById('log-tbody');
  const emptyState = document.getElementById('log-empty');
  if (logs.length === 0) {
    tbody.innerHTML = '';
    emptyState.classList.remove('hidden');
    return;
  }
  emptyState.classList.add('hidden');
  tbody.innerHTML = logs.map((log) => {
    const time = log.createdAt && log.createdAt.toDate
      ? log.createdAt.toDate().toLocaleString('zh-TW', { hour12: false })
      : '—';
    return `
      <tr>
        <td class="mono" style="white-space:nowrap;">${escapeHtml(time)}</td>
        <td>${escapeHtml(log.user || '—')}</td>
        <td><span class="badge ${log.action === '刪除' ? 'badge-amber' : 'badge-good'}">${escapeHtml(log.action)}</span></td>
        <td><b>${escapeHtml(log.itemName)}</b></td>
        <td style="color:var(--ink-soft);">${escapeHtml(log.detail || '—')}</td>
      </tr>
    `;
  }).join('');
}

async function writeItemLog(action, itemName, detail) {
  try {
    await db.collection('itemLogs').add({
      action,
      itemName,
      detail: detail || '',
      user: currentUser ? currentUser.displayName : '未知使用者',
      createdAt: firebase.firestore.FieldValue.serverTimestamp(),
    });
  } catch (err) {
    console.error('寫入異動紀錄失敗', err);
  }
}

// ---------- Modal 開關 ----------
function openItemModal(id) {
  document.getElementById('item-error').textContent = '';
  if (id) {
    const it = inventoryItems.find((x) => x.id === id);
    if (!it) return;
    document.getElementById('item-modal-title').textContent = '編輯品項';
    document.getElementById('item-id').value = it.id;
    document.getElementById('item-name').value = it.name || '';
    document.getElementById('item-name-en').value = it.nameEn || '';
    document.getElementById('item-sku').value = it.sku || '';
    document.getElementById('item-qty').value = it.quantity ?? 0;
    document.getElementById('item-location').value = it.location || '';
    document.getElementById('item-category').value = it.category || '';
    document.getElementById('item-notes').value = it.notes || '';
  } else {
    document.getElementById('item-modal-title').textContent = '新增品項';
    itemForm.reset();
    document.getElementById('item-id').value = '';
  }
  itemModal.classList.remove('hidden');
}

function closeItemModal() {
  itemModal.classList.add('hidden');
}

document.getElementById('add-item-btn').addEventListener('click', () => openItemModal(null));
document.getElementById('item-modal-close').addEventListener('click', closeItemModal);
document.getElementById('item-cancel-btn').addEventListener('click', closeItemModal);
itemModal.addEventListener('click', (e) => { if (e.target === itemModal) closeItemModal(); });

itemForm.addEventListener('submit', async (e) => {
  e.preventDefault();
  const saveBtn = document.getElementById('item-save-btn');
  const errBox = document.getElementById('item-error');
  errBox.textContent = '';
  saveBtn.disabled = true;
  saveBtn.textContent = '儲存中…';

  const id = document.getElementById('item-id').value;
  const payload = {
    name: document.getElementById('item-name').value.trim(),
    nameEn: document.getElementById('item-name-en').value.trim(),
    sku: document.getElementById('item-sku').value.trim(),
    quantity: Number(document.getElementById('item-qty').value) || 0,
    location: document.getElementById('item-location').value.trim(),
    category: document.getElementById('item-category').value.trim(),
    notes: document.getElementById('item-notes').value.trim(),
    updatedAt: firebase.firestore.FieldValue.serverTimestamp(),
    updatedBy: currentUser ? currentUser.displayName : null,
  };

  try {
    if (id) {
      await db.collection('items').doc(id).update(payload);
      writeItemLog('編輯', payload.name, `數量 ${payload.quantity} · 位置 ${payload.location}`);
      showToast('已更新品項');
    } else {
      payload.createdAt = firebase.firestore.FieldValue.serverTimestamp();
      await db.collection('items').add(payload);
      writeItemLog('新增', payload.name, `數量 ${payload.quantity} · 位置 ${payload.location}`);
      showToast('已新增品項');
    }
    closeItemModal();
  } catch (err) {
    console.error(err);
    errBox.textContent = '儲存失敗:' + err.message;
  } finally {
    saveBtn.disabled = false;
    saveBtn.textContent = '儲存';
  }
});

async function deleteItem(id) {
  const it = inventoryItems.find((x) => x.id === id);
  if (!it) return;
  if (!confirm(`確定要刪除「${it.name}」嗎？此動作無法復原。`)) return;
  try {
    await db.collection('items').doc(id).delete();
    writeItemLog('刪除', it.name, `原數量 ${it.quantity} · 原位置 ${it.location || '—'}`);
    showToast('已刪除品項');
  } catch (err) {
    console.error(err);
    showToast('刪除失敗:' + err.message);
  }
}
