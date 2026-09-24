// ============================================================
// 登入 / 註冊頁邏輯
// 設計原則:UI 事件（分頁切換、表單送出）一律「先」綁定,
// 不管 Firebase 有沒有連線成功,按鈕永遠有反應、永遠不會
// 讓瀏覽器用預設方式送出表單（=整頁刷新、看起來像沒反應）。
// ============================================================

const tabLogin = document.getElementById('tab-login');
const tabSignup = document.getElementById('tab-signup');
const loginForm = document.getElementById('login-form');
const signupForm = document.getElementById('signup-form');
const sdkErrorBanner = document.getElementById('sdk-error-banner');

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

function showSdkError(msg) {
  sdkErrorBanner.textContent = msg;
  sdkErrorBanner.classList.remove('hidden');
}

function friendlyAuthError(err) {
  const map = {
    'auth/invalid-email': 'Email 格式不正確',
    'auth/user-not-found': '找不到這個帳號',
    'auth/wrong-password': '密碼不正確',
    'auth/invalid-credential': 'Email 或密碼不正確',
    'auth/email-already-in-use': '這個 Email 已經被註冊過了',
    'auth/weak-password': '密碼太簡單,至少需要 6 個字元',
    'auth/network-request-failed': '網路連線失敗,請檢查網路',
    'auth/invalid-api-key': 'Firebase 設定不正確（API Key 無效),請確認 assets/firebase-config.js 已填入你自己專案的設定',
    'auth/configuration-not-found': '尚未在 Firebase Console 啟用「電子郵件/密碼」登入方式',
    'auth/unauthorized-domain': '這個網域尚未加入 Firebase 的「Authorized domains」授權清單',
  };
  return map[err.code] || ('發生錯誤:' + err.message);
}

// ---------- 檢查 Firebase 是否真的連上了 ----------
let firebaseReady = false;
try {
  if (typeof firebase === 'undefined') {
    throw new Error('Firebase SDK 沒有成功載入(可能是網路被擋、或 CDN 讀取失敗)');
  }
  if (typeof auth === 'undefined') {
    throw new Error('assets/firebase-config.js 尚未正確設定');
  }
  firebaseReady = true;
} catch (e) {
  showSdkError('⚠️ 無法連線到 Firebase:' + e.message + '。請確認已把 assets/firebase-config.js 換成你自己 Firebase 專案的設定,且此頁面的網域已加入 Firebase Authentication 的 Authorized domains。');
}

if (firebaseReady) {
  try {
    // 若已登入,直接跳到主控台
    auth.onAuthStateChanged((user) => {
      if (user) window.location.href = 'dashboard.html';
    });
  } catch (e) {
    firebaseReady = false;
    showSdkError('⚠️ Firebase 初始化時發生錯誤:' + e.message);
  }
}

// ---------- 表單送出（不論 Firebase 是否就緒,一定會綁定,避免整頁刷新）----------
loginForm.addEventListener('submit', async (e) => {
  e.preventDefault();
  const btn = document.getElementById('login-submit');
  const errBox = document.getElementById('login-error');
  errBox.textContent = '';

  if (!firebaseReady) {
    errBox.textContent = 'Firebase 尚未連線成功,無法登入,請先完成 Firebase 設定(見上方紅字說明)';
    return;
  }

  btn.disabled = true;
  btn.textContent = '登入中…';
  try {
    const email = document.getElementById('login-email').value.trim();
    const password = document.getElementById('login-password').value;
    await auth.signInWithEmailAndPassword(email, password);
    window.location.href = 'dashboard.html';
  } catch (err) {
    console.error(err);
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

  if (!firebaseReady) {
    errBox.textContent = 'Firebase 尚未連線成功,無法建立帳號,請先完成 Firebase 設定(見上方紅字說明)';
    return;
  }

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
    console.error(err);
    errBox.textContent = friendlyAuthError(err);
    btn.disabled = false;
    btn.textContent = '建立帳號並登入';
  }
});
