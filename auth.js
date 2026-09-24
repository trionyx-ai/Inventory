// ============================================================
// 登入 / 註冊頁邏輯
// 設計原則:UI 事件（分頁切換、表單送出）一律「先」綁定,
// 不管 Firebase 有沒有連線成功,按鈕永遠有反應、永遠不會
// 讓瀏覽器用預設方式送出表單（=整頁刷新、看起來像沒反應）。
// ============================================================

const ACCOUNTS = [
  { username: 'admin',  password: 'admin123',  displayName: '管理員' },
  { username: 'staff1', password: 'staff123',  displayName: '員工一' },
  { username: 'staff2', password: 'staff456',  displayName: '員工二' },
];

const loginForm = document.getElementById('login-form');

// 若已經登入過，直接跳到主控台
if (localStorage.getItem('crate_session')) {
  window.location.href = 'dashboard.html';
}

loginForm.addEventListener('submit', (e) => {
  e.preventDefault();
  const errBox = document.getElementById('login-error');
  errBox.textContent = '';

  const username = document.getElementById('login-username').value.trim();
  const password = document.getElementById('login-password').value;

  const account = ACCOUNTS.find((a) => a.username === username && a.password === password);
  if (!account) {
    errBox.textContent = '帳號或密碼不正確';
    return;
  }

  localStorage.setItem('crate_session', JSON.stringify({
    username: account.username,
    displayName: account.displayName,
  }));
  window.location.href = 'dashboard.html';
});
