// ============================================================
// 登入 / 註冊頁邏輯
// ============================================================

const tabLogin = document.getElementById('tab-login');
const tabSignup = document.getElementById('tab-signup');
const loginForm = document.getElementById('login-form');
const signupForm = document.getElementById('signup-form');

tabLogin.addEventListener('click', () => {
  tabLogin.classList.add('active');
  tabSignup.classList.remove('active');
  loginForm.classList.remove('hidden');
  signupForm.classList.add('hidden');
});

tabSignup.addEventListener('click', () => {
  tabSignup.classList.add('active');
  tabLogin.classList.remove('active');
  signupForm.classList.remove('hidden');
  loginForm.classList.add('hidden');
});

function friendlyAuthError(err) {
  const map = {
    'auth/invalid-email': 'Email 格式不正確',
    'auth/user-not-found': '找不到這個帳號',
    'auth/wrong-password': '密碼不正確',
    'auth/invalid-credential': 'Email 或密碼不正確',
    'auth/email-already-in-use': '這個 Email 已經被註冊過了',
    'auth/weak-password': '密碼太簡單,至少需要 6 個字元',
    'auth/network-request-failed': '網路連線失敗,請檢查網路',
  };
  return map[err.code] || ('發生錯誤:' + err.message);
}

// 若已登入,直接跳到主控台
auth.onAuthStateChanged((user) => {
  if (user) window.location.href = 'dashboard.html';
});

loginForm.addEventListener('submit', async (e) => {
  e.preventDefault();
  const btn = document.getElementById('login-submit');
  const errBox = document.getElementById('login-error');
  errBox.textContent = '';
  btn.disabled = true;
  btn.textContent = '登入中…';
  try {
    const email = document.getElementById('login-email').value.trim();
    const password = document.getElementById('login-password').value;
    await auth.signInWithEmailAndPassword(email, password);
    window.location.href = 'dashboard.html';
  } catch (err) {
    errBox.textContent = friendlyAuthError(err);
    btn.disabled = false;
    btn.textContent = '登入';
  }
});

signupForm.addEventListener('submit', async (e) => {
  e.preventDefault();
  const btn = document.getElementById('signup-submit');
  const errBox = document.getElementById('signup-error');
  errBox.textContent = '';
  btn.disabled = true;
  btn.textContent = '建立中…';
  try {
    const name = document.getElementById('signup-name').value.trim();
    const email = document.getElementById('signup-email').value.trim();
    const password = document.getElementById('signup-password').value;
    const cred = await auth.createUserWithEmailAndPassword(email, password);
    await cred.user.updateProfile({ displayName: name });
    window.location.href = 'dashboard.html';
  } catch (err) {
    errBox.textContent = friendlyAuthError(err);
    btn.disabled = false;
    btn.textContent = '建立帳號並登入';
  }
});
