// ============================================================
// 主控台共用邏輯:登入驗證、分頁切換、登出、小工具
// ============================================================

let currentUser = null;

if (typeof firebase === 'undefined' || typeof auth === 'undefined') {
  alert('⚠️ 無法連線到 Firebase,請確認 assets/firebase-config.js 已填入正確設定,並檢查網路連線。即將返回登入頁。');
  window.location.href = 'index.html';
  throw new Error('Firebase 未就緒');
}

// 未登入就導回登入頁；已登入則記錄使用者資訊
auth.onAuthStateChanged((user) => {
  if (!user) {
    window.location.href = 'index.html';
    return;
  }
  currentUser = user;
  document.getElementById('who-email').textContent = user.displayName || user.email;
  const delivererField = document.getElementById('ho-deliverer');
  if (delivererField && !delivererField.value) {
    delivererField.value = user.displayName || user.email;
  }
  // 使用者確認登入後才開始載入資料（inventory.js / handover.js 監聽這個事件）
  document.dispatchEvent(new CustomEvent('crate:auth-ready', { detail: { user } }));
});

document.getElementById('logout-btn').addEventListener('click', () => {
  auth.signOut();
});

// ---------- 分頁切換 ----------
const navButtons = document.querySelectorAll('.nav-btn');
navButtons.forEach((btn) => {
  btn.addEventListener('click', () => {
    navButtons.forEach((b) => b.classList.remove('active'));
    btn.classList.add('active');
    document.querySelectorAll('.view').forEach((v) => v.classList.add('hidden'));
    document.getElementById('view-' + btn.dataset.view).classList.remove('hidden');
    document.getElementById('app-shell').classList.remove('nav-open');
  });
});

const mobileToggle = document.getElementById('mobile-nav-toggle');
if (mobileToggle) {
  mobileToggle.addEventListener('click', () => {
    document.getElementById('app-shell').classList.toggle('nav-open');
  });
}

// ---------- Toast ----------
function showToast(message) {
  const el = document.createElement('div');
  el.className = 'toast';
  el.textContent = message;
  document.body.appendChild(el);
  setTimeout(() => el.remove(), 2800);
}

// ---------- 共用工具 ----------
function escapeHtml(str) {
  return String(str ?? '').replace(/[&<>"']/g, (c) => ({
    '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;'
  }[c]));
}

function todayISO() {
  const d = new Date();
  return d.toISOString().slice(0, 10);
}
